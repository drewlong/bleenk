import React, { Component } from 'react'
import Cookie from 'universal-cookie'

import BG from '../video/404.mp4'
import LogoText from '../img/logo_text.png'
const cookie = new Cookie()

export default class Link extends Component{
  constructor(props){
    super(props)
    this.state = {
      section: null,
      jwt: null
    }
  }
  componentDidMount = () => {
    this.setState({slug: this.props.match.params.slug})
  }
  render(){
    return(
      <div className="centered-column main">
        <img onClick={() => {window.location = "/"}} alt="Powered by Skynet" src={LogoText} style={{zIndex: 1000, cursor: 'pointer', height: 80, position: 'absolute', top: 20, left: 20}} />
        <video autoPlay loop class="video">
          <source src={BG} type="video/mp4" />
        </video>
        <span className="blend" style={{fontSize: '10em'}}>
          404
        </span>
        <span className="blend" style={{fontSize: '4em', marginTop: 100, color: "#90a4ae"}}>
          PAGE NOT FOUND
        </span>
      </div>
    )
  }
}
