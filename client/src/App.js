import React, { Component } from "react";
import "./App.css";
import Home from "./Home";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  withRouter
} from "react-router-dom";
import GroupList from "./GroupList";
import GroupEdit from "./GroupEdit";
import PWCCSetup from "./PWCCSetup";

class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route
            path="/groups"
            exact={true}
            render={routerProps => <GroupList {...routerProps} />}
          />
          <Route
            path="/groups/:id"
            render={routerProps => <GroupEdit {...routerProps} />}
          />
          <Route
            path="/creditcard"
            render={routerProps => <PWCCSetup {...routerProps} />}
          />
          <Route path="/" render={routerProps => <Home {...routerProps} />} />
        </Switch>
      </Router>
    );
  }
}

export default withRouter(App);
