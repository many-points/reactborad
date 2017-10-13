import React from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import style from "../css/style.css";

class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "",
      filename: "",
      file: null,
      upload_token: "",
      attach_button: "Attach file",
      status: "idle"
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFileUpload = this.handleFileUpload.bind(this);
    this.handleKeyboardShortcut = this.handleKeyboardShortcut.bind(this);
  }

  handleChange(event) {
    this.setState({text: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();

    var formdata = {
      text: this.state.text,
      filename: this.state.filename,
    };

    if (!(formdata.text | formdata.filename)) {
      return;
    }

    var image = this.state.file;

    this.clearForm();
    this.setState({status: "posting"});

    axios.post('/posts', formdata).then((response) => {
      console.log(response.data);
      var token = response.data.post.upload_token;
      if (token) {
        var formdata = new FormData();
        formdata.append("image", image);
        axios.post('/posts/' + response.data.post.id + '/image', formdata, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': token
          }
        }).then((response) => {
          this.props.imageCallback(response.data);
        }).catch((error) => {
          console.log(error);
        });
      }
      this.props.formCallback(response.data);
      this.setState({status: "idle"});
    }).catch((error) => {
      console.log(error);
    });
  }

  handleKeyboardShortcut(event) {
    if (event.keyCode == 13 && event.altKey) {
      event.preventDefault();
      this.setState({text: event.target.value}, () => {
        this.refs.submit.click();
        this.clearForm();
      });
    }
  }

  clearForm() {
    this.setState({
      text: "",
      filename: "",
      file: null,
      attach_button: "Attach file",
    });
    this.refs.textarea.value = "";
  }

  uploadFile() {
    if (this.state.file == null) {
      this.refs.file.click();
    } else {
      this.setState({
        filename: "",
        file: null,
        attach_button: "Attach file",
      });
    }
  }

  handleFileUpload(event) {
    this.setState({
      filename: event.target.files[0].name,
      file: event.target.files[0],
      attach_button: "Remove file",
    });
  }

  renderPostingIndicator() {
    if (this.state.status !== "posting") {
      return (null);
    } else {
      return (
        <div className="jumbotron waiting">
          <p>Loading</p>
        </div>
      )
    }
  }

  render() {
    return (
      <div>
        <div className="jumbotron">
          <form onSubmit={this.handleSubmit}>
            <div className="form-group">
              <textarea
                className="form-control textarea"
                rows="7"
                ref="textarea"
                value={this.state.value}
                onBlur={this.handleChange}
                onKeyDown={this.handleKeyboardShortcut}
              >
              </textarea>
              <input
                ref="submit"
                className="btn btn-primary"
                type="submit"
                value="Post"
              />
              <div className="fileinput" onClick={ () => {this.uploadFile()} }>
                <span className="btn btn-default btn-file">
                  <span>{this.state.attach_button}</span>
                </span>
              </div>
              <span ref="filename">{this.state.filename}</span>
              <input
                type="file"
                ref="file"
                onChange={this.handleFileUpload}
              />
              <span className="message-box">Press Alt+Enter to post</span>
            </div>
          </form>
        </div>
        {this.renderPostingIndicator()}
      </div>
    );
  }
}

class Post extends React.Component {
  renderImage () {
    if (!this.props.postData.image) {
      return (null);
    } else {
      return (
      <a href={"/dist/images/" + this.props.postData.image} target="_blank">
        <div className="postImage">
            <img src={"/dist/images/" + this.props.postData.image} />
        </div>
      </a>
      );
    };
  }

  insertQuote () {
    alert("NYI")
  }

  render() {
    return (
      <div className="postBody">
        {this.renderImage()}
        <div>
          <p>
            <a onClick={() => {this.insertQuote()}}>
              <span className="postNumber">#{this.props.postData.id}</span>
            </a>&nbsp;
            <span className="postTimestamp">{this.props.postData.timestamp}</span>
          </p>
          <p className="postText">{this.props.postData.text}</p>
        </div>
      </div>
    )
  }
}

class Posts extends React.Component {
  render () {
    const posts = this.props.posts.map((data, key) => {
      return (
        <li key={key}>
          <div className="jumbotron">
            <Post
              postData={data}
            />
          </div>
        </li>
      );
    });

    return (
      <ul className="list-unstyled">
          {posts}
      </ul>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      postsLoaded: 0,
      topPost: 0
    };
    this.loadPosts();
    this.updateOnFormSend = this.updateOnFormSend.bind(this);
    this.updateOnImageUpload = this.updateOnImageUpload.bind(this);
  }

  loadPosts() {
    axios.get('/posts').then((response) => {
      const posts = this.state.posts.concat(response.data.posts);
      this.setState({
        posts: posts,
        postsLoaded: posts.length,
        topPost: posts[0].id
      });
    });
  }

  updateOnFormSend(data) {
    const posts = [data.post].concat(this.state.posts);
    this.setState({
      posts: posts,
      postsLoaded: posts.length,
      topPost: posts[0].id
    });
  }

  updateOnImageUpload(data) {
    const posts = this.state.posts.slice()
    posts.find((post) => {
      return post.id === data.image.id;
    }).image = data.image.filename;
    this.setState({
      posts: posts
    });
  }

  render () {
    return (
      <div className="container">
        <Form formCallback={this.updateOnFormSend} imageCallback={this.updateOnImageUpload}/>
        <Posts posts={this.state.posts}/>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("content"));
