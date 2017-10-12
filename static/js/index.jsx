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
      attach_button: "Attach file",
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFileUpload = this.handleFileUpload.bind(this);
  }

  handleChange(event) {
    this.setState({text: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();

    var formdata = {
      text: this.state.text,
      filename: this.state.filename,
    }

    axios.post('/posts', formdata).then((response) => {

    }).catch((error) => {
      console.log(error);
    });
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

  render() {
    return (
      <div className="jumbotron">
        <form onSubmit={this.handleSubmit}>
          <div className="form-group">
            <textarea
              className="form-control textarea"
              rows="10"
              ref="textarea"
              value={this.state.value}
              onChange={this.handleChange}
            >
            </textarea>
            <input className="btn btn-primary" type="submit" value="Post" />
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
          </div>
        </form>
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
        <div className="postImage">
          <img src={this.props.postData.image} />
        </div>
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
        <div className="postText">
          <p>
            <a onClick={() => {this.insertQuote()}}>
              <span className="postNumber">#{this.props.postData.id}</span>
            </a>&nbsp;
            <span className="postTimestamp">{this.props.postData.timestamp}</span>
          </p>
          <p> {this.props.postData.text} </p>
        </div>
      </div>
    )
  }
}

class Posts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: []
    };
    this.loadPosts();
  }

  loadPosts() {
    axios.get('/posts').then((response) => {
      this.setState({
        posts: this.state.posts.concat(response.data.posts)
      });
      console.log(this.state)
    });
  }

  render () {
    const posts = this.state.posts.map((data, key) => {
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
  render () {
    return (
      <div className="container">
        <Form />
        <Posts />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("content"));
