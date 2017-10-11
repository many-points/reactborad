from flask import Flask, render_template, request
import json

app = Flask(__name__, static_folder="../static", template_folder="../static")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/post", methods=['POST'])
def post():
    text = request.form['text']
    file_storage = request.files['file']
    filename = file_storage.filename
    return filename

if __name__ == '__main__':
    app.run()
