import React, { Component } from 'react'
import Cookie from 'universal-cookie'

const cookie = new Cookie()

export default class Landing extends Component{
  constructor(props){
    super(props)
    this.state = {
      section: null,
      jwt: null
    }
  }
  componentDidMount = () => {
    let c = cookie.get('bleenk_token')
    if(c){
      let jwt = atob(c.split(".")[1])
      this.setState({jwt: jwt, token: c})
    }
  }
  render(){
    return(
      <div className="landing-main">
      </div>
    )
  }
}
