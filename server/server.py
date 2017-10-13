from flask import Flask, render_template, request, g, abort, escape
import os
import json
import sqlite3
import imghdr
import binascii
from datetime import datetime

from flask_compress import Compress

STATIC_FOLDER = "../static/dist"
TEMPLATE_FOLDER = "../static"

app = Flask(__name__, static_folder=STATIC_FOLDER, template_folder=TEMPLATE_FOLDER)
app.config.update(dict(
    DATABASE = os.path.join(app.root_path, 'database.db'),
    SECRET_KEY = 'devkey',
    USERNAME = 'admin',
    PASSWORD = 'password'
))

Compress(app)

class Row(sqlite3.Row):
    def get(self, key, default=None):
        if key in self.keys():
            return self[key]
        return default

def init_db():
    db = get_db()
    with app.open_resource('schema.sql', mode='r') as f:
        db.cursor().executescript(f.read())
    db.commit()

@app.cli.command('initdb')
def initdb_command():
    init_db()
    print('Initialized the database.')

def connect_db():
    conn = sqlite3.connect(app.config['DATABASE'])
    conn.row_factory = Row
    return conn

def get_db():
    if not hasattr(g, 'sqlite_db'):
        g.sqlite_db = connect_db()
    return g.sqlite_db

@app.teardown_appcontext
def close_db(error):
    if hasattr(g, 'sqlite_db'):
        g.sqlite_db.close()

def make_post_response(post):
    return {
        'id': post.get('id', 0),
        'text': post.get('text', ''),
        'timestamp': post.get('timestamp',
            datetime.fromtimestamp(0).strftime('%Y-%m-%d %H:%M:%S')),
        'image': post.get('image', '')
    }

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/posts", methods=['POST'])
def create_post():
    text      = request.json.get('text', '')
    filename  = request.json.get('filename', '')
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    ip        = request.remote_addr
    upload_token = ''

    if not (text or filename):
        abort(400)

    if filename:
        filename = str(datetime.now().timestamp()).replace('.','')
        upload_token = str(binascii.b2a_hex(os.urandom(15)))

    db = get_db()
    cur = db.execute("select id from posts order by id desc limit 1")
    last_id = cur.fetchone() or {}
    db.execute("insert into posts (text, image, timestamp, ip, upload_token) values (?, ?, ? ,?, ?)",
               [text, filename, timestamp, ip, upload_token])
    db.commit()

    response = {
        'post': {
            'id': last_id.get('id', -1) + 1,
            'text': text,
            'timestamp': timestamp,
            'upload_token': upload_token
        }
    }

    return json.dumps(response)

@app.route("/posts", methods=['GET'])
def get_posts():
    db = get_db()
    cur = db.execute("select * from posts order by id desc limit 20")

    response = {
        'posts': [make_post_response(post) for post in cur.fetchall()]
    }

    return json.dumps(response)

@app.route("/posts/<int:id>", methods=['GET'])
def get_post():
    pass

@app.route("/posts/<int:id>/image", methods=['POST'])
def upload_image(id):
    request_token = request.headers.get('Authorization', '')

    if not request_token:
        abort(401)

    storage = request.files.get('image', None)

    if not storage:
        abort(400)

    image = storage.read()

    filetype = imghdr.what(None, h=image)

    print(image)
    print(filetype)

    if filetype not in ['gif', 'jpeg', 'png']:
        abort(400)

    db = get_db()
    cur = db.execute("select image, upload_token from posts where id is (?)", [id])
    image_name, upload_token = cur.fetchone()

    if not (image_name and upload_token):
        abort(400)

    if request_token != upload_token:
        abort(401)

    fixed_name = image_name + '.' + filetype
    db.execute("update posts set image = (?) where id is (?)", [fixed_name, id])
    db.commit()

    with open(STATIC_FOLDER + '/images/' + fixed_name, 'wb') as f:
        f.write(image)

    #generate thumbnail here

    response = {
        'image': {
            'id': id,
            'filename': fixed_name
        }
    }

    return json.dumps(response)


if __name__ == '__main__':
    app.run()
