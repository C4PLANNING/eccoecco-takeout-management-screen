import React from "react";
import Layout from "../components/layout";
import Login from "../components/login";

const LoginPage = ({ location }) => (
  <Layout location={location}>
    <Login />
  </Layout>
);

export default LoginPage;
