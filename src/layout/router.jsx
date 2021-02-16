import React, { Component } from 'react'
import {BrowserRouter, Route, Redirect} from 'react-router-dom'
import Cookie from 'universal-cookie'

// Route Components
import Auth from './auth/main'
import Dashboard from './dashboard/main'
import Landing from './landing/main'

const cookie = new Cookie()

export default class Router extends Component{
  constructor(props){
    super(props);
    this.state = {
      auth: false
    }
  }
  render(){
    return(
      <div>
        <BrowserRouter>
          <div>
            <Route exact path="/login" component={Auth} />
            <Route exact path="/register" component={Auth} />
            <Route exact path="/" component={Landing} />
            <Route exact path="/dashboard/:section" render={(props) => (
              cookie.get("bleenk_token") ? (
                <Dashboard {...props}/>
              ) : (
                <Redirect to="/login"/>
              )
            )}/>
          </div>
        </BrowserRouter>
      </div>
    )
  }
}
