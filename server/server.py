from flask import Flask, render_template, request, g, abort, escape
import os
import json
import sqlite3
from datetime import datetime

app = Flask(__name__, static_folder="../static/dist", template_folder="../static")
app.config.update(dict(
    DATABASE = os.path.join(app.root_path, 'database.db'),
    SECRET_KEY = 'devkey',
    USERNAME = 'admin',
    PASSWORD = 'password'
))

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
            datetime.fromtimestamp(0).strftime('%Y-%m-%d %H:%M:%S'))
    }

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/posts", methods=['POST'])
def create_post():
    text      = request.json.get('text', '')
    file_id   = request.json.get('filename', '')
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    ip        = request.remote_addr

    if not (text or file_id):
        abort(400)

    db = get_db()
    cur = db.execute("select id from posts order by id desc limit 1")
    last_id = cur.fetchone()
    db.execute("insert into posts (text, file, timestamp, ip) values (?, ?, ? ,?)",
               [text, file_id, timestamp, ip])
    db.commit()

    response = {
        'posts': [{
            'id': last_id.get('id', -1) + 1,
            'text': text,
            'timestamp': timestamp
        }]
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


if __name__ == '__main__':
    app.run()
