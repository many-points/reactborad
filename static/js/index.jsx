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

    var formdata = new FormData();
    formdata.append('text', this.state.text);
    formdata.append('file', this.state.file);

    axios.post('/post', formdata)
      .then((response) => {
        console.log(response)
      })
      .catch((error) => {
        console.log(error)
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
              <span ref="filename">{this.state.filename}</span>
            </div>
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
    if (this.props.postData.image == "") {
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
            <a href="#" onClick={() => {this.insertQuote()}}>
              <span className="postNumber">#{this.props.postData.id}</span>
            </a>
          </p>
          <p> {this.props.postData.post} </p>
        </div>
      </div>
    )
  }
}

class Posts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [
        {
          id: 1,
          post: "Lorem ipsum dolor sit amet",
          image: "/static/images/1.png"
        },
        {
          id: 2,
          post: "Lorem ipsum dolor sit amet",
          image: ""
        },
        {
          id: 3,
          post: "Lorem ipsum dolor sit amet",
          image: "/static/images/3.jpg"
        }
      ]
    };
  }

  render () {
    const mockup = this.state.posts.slice().reverse();

    const posts = mockup.map((data, key) => {
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
