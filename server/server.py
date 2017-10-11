from flask import Flask, render_template

app = Flask(__name__, static_folder="../static", template_folder="../static")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/hello")
def hello():
    return "<h1>HELLO WORLD!</h1>"

if __name__ == '__main__':
    app.run()
