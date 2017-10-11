from flask import Flask, render_template, request
import json

app = Flask(__name__, static_folder="../static", template_folder="../static")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/post", methods=['POST', 'GET'])
def post():
    data = request.json
    return data['text']

if __name__ == '__main__':
    app.run()
