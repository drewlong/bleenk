import React, { Component } from 'react'
import {BrowserRouter, Route, Redirect, Switch} from 'react-router-dom'
import Cookie from 'universal-cookie'
import {isMobile} from 'react-device-detect'

// Route Components
import Link from './link/main'
import Landing from './landing/main'
import LandingMobile from './landing/mobile'
import NotFound from './404.jsx'

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
            {isMobile &&
              <Switch>
              <Route exact path="/" component={LandingMobile} />
              <Route exact path="/l/:slug" render={(props) => (
                  <Link {...props}/>
                )}/>
                <Route path="*" component={NotFound}/>
              </Switch>
            }{!isMobile &&
              <Switch>
              <Route exact path="/" component={Landing} />
              <Route exact path="/l/:slug" render={(props) => (
                  <Link {...props}/>
                )}/>
                <Route path="*" component={NotFound}/>
              </Switch>
            }
        </BrowserRouter>
      </div>
    )
  }
}
