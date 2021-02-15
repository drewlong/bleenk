import React, { Component } from 'react'
import Cookie from 'universal-cookie'

const cookie = new Cookie()

export default class Dashboard extends Component{
  constructor(props){
    super(props)
    this.state = {
      section: null,
      jwt: null
    }
  }
  componentDidMount = () => {
    this.setState({section: this.props.match.params.section})
    let c = cookie.get('bleenk_token')
    if(c){
      let jwt = atob(c.split(".")[1])
      this.setState({jwt: jwt, token: c})
    }
  }
  render(){
    return(
      <div className="dashboard-main">
        dashboard
      </div>
    )
  }
}
