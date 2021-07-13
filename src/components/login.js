import React from "react";
import { navigate } from "gatsby";
import { handleLogin, isLoggedIn } from "../services/auth";

class Login extends React.Component {
  state = {
    username: ``,
    password: ``,
  };

  handleUpdate = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    handleLogin(this.state);
  };

  render() {
    return (
      <>
        <h1>Log in</h1>
        <form
          method="post"
          onSubmit={(event) => {
            this.handleSubmit(event);
            navigate(`/`);
          }}
        >
          <label>
            Username
            <input type="text" name="username" onChange={this.handleUpdate} />
          </label>
          <br />
          <label>
            Password
            <input
              type="password"
              name="password"
              onChange={this.handleUpdate}
            />
          </label>
          <br />
          <input type="submit" value="Log In" />
        </form>
      </>
    );
  }
}

export default Login;
