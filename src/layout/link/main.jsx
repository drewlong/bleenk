import React, { Component } from 'react'
import Axios from 'axios'
import Cookie from 'universal-cookie'
import crypto from 'crypto-js'
import {Button, Icon, Input, Message} from 'semantic-ui-react'
import LogoText from '../../img/logo_text.png'
import config from '../global/config.json'

const cookie = new Cookie()
const API = config.api_url
export default class Link extends Component{
  constructor(props){
    super(props)
    this.state = {
      section: null,
      jwt: null,
      file_type: null,
      file_data: null,
      decrypted: false,
      loading: true,
      errors: [],
      expanded: false
    }
  }
  componentWillMount = () => {
    this.setState({slug: this.props.match.params.slug})
  }
  componentDidMount = () => {
    Axios.post(API + 'links/get', {
      slug: this.state.slug
    }).then((res) => {
      if(res.data.status === 200){
        this.setState({file_data: res.data.result, file_type: res.data.upload_type})
        setTimeout(() => {
          this.attemptDefaultDecrypt()
        }, 100)
      }else{
        this.setState({expired: true, loading: false})
      }
    }).catch((err) => {})
  }
  attemptDefaultDecrypt = () => {
    let pass = "NO_PASSWORD_SET"
    try{
      let res = crypto.AES.decrypt(this.state.file_data, pass).toString(crypto.enc.Utf8)
      if(res === ""){
        this.setState({decrypted: false, loading: false})
      }else{
        this.setState({decrypted: true, result: res, loading: false})
      }
    }catch{
      this.setState({decrypted: false, loading: false})
    }

  }
  handleDecrypt = () => {
    let pass = this.state.password
    let errors = []
    try{
      let res = crypto.AES.decrypt(this.state.file_data, pass).toString(crypto.enc.Utf8)
      if(res === ""){
        errors.push("Password is incorrect")
        this.setState({decrypted: false, loading: false, errors: errors})
      }else{
        this.setState({decrypted: true, result: res, loading: false})
      }
    }catch{
      this.setState({decrypted: false, loading: false})
    }

  }
  handlePassword = (e) => {
    this.setState({errors: [], password: e.target.value})
  }
  render(){
    return(
      <div className="centered-column main" style={{overflow: 'hidden'}}>
        {this.state.errors.length > 0 &&
          <Message
            style={{
              width: 200,
              position: 'absolute',
              bottom: 20, left: 'calc(50% - 125px)',
              textAlign: 'center'
            }}
            error
            >
            {this.state.errors[0]}
          </Message>
        }
        <img onClick={() => {window.location = "/"}} alt="Powered by Skynet" src={LogoText} style={{cursor: 'pointer', height: 80, position: 'absolute', top: 20, left: 20}} />

        {this.state.loading &&
          <span className="centered-column">
            <Icon size ="huge" color="teal" name="spinner" loading /> <br /><br />
            Decrypting, please wait...
          </span>
        }
        {!this.state.loading && !this.state.decrypted && !this.state.expired &&
          <div className="centered-column">
            <form>
              <span className="centered-column" style={{width: 500}}>
                This link appears to be encrypted, please provide the password below:<br /> <br />
              <Input
                name="password"
                onChange={(e) => {this.handlePassword(e)}}
                placeholder='Password for Viewing'
                type="password"
                style={{width: 500}}
                value={this.state.pass_temp}
                />
              <br />
              <Button
                disabled={!this.state.password || this.state.password == ""}
                color="teal" inverted style={{width: 200}} onClick={this.handleDecrypt}> DECRYPT</Button>
            </span>
            </form>
          </div>
        }
        {!this.state.loading && this.state.decrypted &&
          <div>
            {this.state.file_type === 'image' &&
              <div className={this.state.expanded ? "image-box-expanded" : "image-box"}>
                <img src={this.state.result} alt="" onClick={() => {this.setState({expanded: this.state.expanded === true ? false : true})}}/>
              </div>
            }

            {this.state.file_type === 'text' &&
              <pre className="text-box">
                {this.state.result}
              </pre>
            }
          </div>
        }
        {!this.state.loading && this.state.expired &&
          <span className="centered-column">
            <Icon size ="huge" color="teal" name="broken chain" /> <br /><br />
            Link has expired or does not exist
          </span>
        }
      </div>
    )
  }
}
