import React from "react";
import ReactDOM from "react-dom";
import style from "../css/style.css";

class Post extends React.Component {
  renderImage () {
    if (this.props.postData.image == "") {
      return (null);
    } else {
      return (
        <div className="postImage">
          <img src={this.props.postData.image} />
        </div>
      )
    }
  }

  render() {
    return (
      <div className="postBody">
        {this.renderImage()}
        <div className="postText">
          <span>{this.props.postData.id}</span> <br />
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
        <Posts />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("content"));
