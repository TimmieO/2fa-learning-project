import React, { useEffect, useState } from "react";
import "./App.css";

import Register from "./components/register/Register";
import Login from "./components/login/Login";
import Home from "./components/home/Home";
import Auth from "./components/auth_input/Auth";
import Header from "./components/header/Header";

import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

function App() {
  return (
    <Router>
      <div id="App">
        <Header />
        <Switch>
          <Route path="/" exact component={Home}/>
          <Route path="/Login" component={Login} />
          <Route exact path="/Register" component={Register} />
          <Route exact path="/auth" component={Auth} />
          <Route exact path="/logout"  />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
