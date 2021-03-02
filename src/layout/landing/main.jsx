import React, { Component } from 'react'
import {Button, Form, Checkbox, Dropdown, Icon, Input, Message, Segment, TextArea} from 'semantic-ui-react'
import Axios from 'axios'
import Cookie from 'universal-cookie'
import Dropzone from 'react-dropzone'
import crypto from 'crypto-js'
import config from '../global/config.json'

// Images
import BG from '../../video/bg.mp4'
import LogoText from '../../img/logo_text.png'

const cookie = new Cookie()
const API = config.api_url

export default class Landing extends Component{
  constructor(props){
    super(props)
    this.state = {
      errors: [],
      upload_type: "image",
      jwt: null,
      file: null,
      exp_opts: [
        {key: 'open', value: 'open', text: "Delete after opening"},
        {key: '5m', value: '5m', text: "5 Minutes"},
        {key: '15m', value: '15m', text: "15 Minutes"},
        {key: '30m', value: '30m', text: "30 Minutes"},
        {key: '1h', value: '1h', text: "1 Hour"},
        {key: '6h', value: '6h', text: "6 Hours"},
        {key: '12h', value: '12h', text: "12 Hours"},
        {key: '24h', value: '24h', text: "24 Hours"}
      ],
      upload_opts: {
        expiration: "",
        anyone_views: false,
        password: 'NO_PASSWORD_SET',
        skylink: null
      },
      loading: false,
      uploaded: false,
      step: 0,
      textarea: ""
    }
  }
  componentDidMount = () => {
    let c = cookie.get('bleenk_token')

    if(c){
      let jwt = atob(c.split(".")[1])
      this.setState({jwt: jwt, token: c})
    }
  }
  handleType = () => {
    let t = this.state.upload_type
    this.setState({
      upload_type: t === 'text' ? "image" : "text",
      chosen: false,
      loading: false,
      uploaded: false,
      file: null,
      upload_opts: {
        expiration: "",
        anyone_views:false,
        password: 'NO_PASSWORD_SET',
        skylink: null
      },
      step: 0,
      textarea: ""
    })
  }
  handleFileSelect = (files) => {
    let f = files[0]
    let errors = []
    this.setState({errors: errors})
    const reader = new FileReader()
    reader.onabort = () => this.setState({chosen: false, file: null})
    reader.onerror = () => this.setState({chosen: false, file: null, errors: ["Error uploading file"]})
    reader.onload = () => {
      let contents = reader.result
      if(f.size > 5242880){
        errors.push('File size limit is 5MB, current file size: ' + this.formatBytes(f.size, 3))
        this.setState({errors: errors})
      }else{
        if(this.validMime(contents)){
          this.setState({
            file: {
              name: f.name,
              size: f.size,
              data: contents
            },
            step: 1,
            chosen: true
          })
        }else{
          errors.push("Invalid image format, valid formats are jpg, png, and gif")
          this.setState({errors: errors})
        }
      }
    }
    reader.readAsDataURL(f)
  }
  validMime(uri){
    let head = uri.split(';')[0].split(':')[1].split('/')[1]
    if(head === "png" || head === "jpg" || head === "gif" || head === "jpeg"){
      return true
    }else{
      return false
    }

  }
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
  handleUpload = () => {
    let data = ""
    let errors = []

    if(this.state.upload_type === 'image'){
      data = this.state.file.data
    }else{
      data = this.state.textarea
    }
    let opts = this.state.upload_opts

    if(opts.password === 'NO_PASSWORD_SET' && !opts.anyone_views){errors.push('Enter a password or allow anyone to view without one')}
    if(this.state.upload_type === 'text' && this.state.textarea === ""){errors.push('Must provide either a message or an image to upload')}
    if(opts.expiration === ""){errors.push('Please select an expiration from the dropdown menu')}

    let hash = crypto.AES.encrypt(data, this.state.upload_opts.password).toString()
    if(errors.length < 1){
      this.setState({loading: true, step: 2, errors: []})
      Axios.post(API + "links/new", {
        file_data: hash,
        file_type: this.state.upload_type,
        expiration: opts.expiration
      }).then((res) => {
        if(res.data.status === 200){
          this.setState({
            errors: [],
            loading: false,
            step: 3,
            uploaded: true,
            upload_link: res.data.link
          })
        }else{
          this.setState({errors: [res.data.message], loading: false})
        }
        console.log(res)
      }).catch((err) => {
        this.setState({errors: [], loading: false})
        console.log(err)
      })
    }else{
      this.setState({errors: errors})
    }
  }
  handleCancelUpload = () => {
    this.setState({
      chosen: false,
      file: null,
      loading: false,
      upload_opts: {
        expiration: "",
        password: 'NO_PASSWORD_SET',
        skylink: null
      },
      step: 0,
      uploaded: false,
      errors: []
    })
  }
  handlePassword = (e) => {
    let opts = this.state.upload_opts
    if(e.target.value === ""){
      opts.password = 'NO_PASSWORD_SET'
    }else{
      opts.password = e.target.value
    }
    this.setState({upload_opts: opts, pass_temp: e.target.value})
  }
  handleTogglePassword = (v) => {
    let opts = this.state.upload_opts
    opts.anyone_views = v.checked
    opts.password = "NO_PASSWORD_SET"
    this.setState({upload_opts: opts, pass_temp: ""})
  }
  handleTextArea = (v) => {
    if(v.length < 250000){
      this.setState({textarea: v})
    }
  }
  handleDropdown = (e) => {
    let opts = this.state.upload_opts
    opts.expiration = e
    this.setState({upload_opts: opts})
  }
  copyText = (text) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    this.setState({copied: true})
    setTimeout(() => {this.setState({copied: false})}, 2000)
  }
  render(){
    return(
      <div className="main centered-row">
        <div className="donate">
          DONATE <br />
          SC - {config.sc_wallet} <br />
          BTC - {config.btc_wallet}
        </div>
        {this.state.errors.length > 0 &&
          <Message
            style={{
              width: '40vw',
              position: 'absolute',
              bottom: 50, left: '5vw'
            }}
            error
            header='There were some errors with your submission'
            list={this.state.errors}>
          </Message>
        }
       <video autoPlay loop class="video">
         <source src={BG} type="video/mp4" />
       </video>
       <img alt="Powered by Skynet" src={LogoText} style={{height: 80, position: 'absolute', top: 20, left: 20}} />
       <div className="centered-column" style={{flex: 1}}>
         <div className="centered-row" style={{width: '80%'}}>
           <div className="centered-column" style={{flex: 1, height: 100, position: 'relative'}}>
             <div style={{width: '50%', height: '50%', borderBottom: 'solid 4px #ffffff', position: 'absolute', top: 0, right: 0, zIndex: 0}}>&nbsp;</div>
             {this.state.step === 0 &&
               <div style={{width: 50, height: 50, background: '#11171a', borderRadius: '100%', position: 'absolute', top: 'calc(50% - 25px)', left: 'calc(50% - 25px)', border: 'solid 4px #ffffff'}}></div>
             }
             {this.state.step > 0 &&
               <div className="centered-column" style={{width: 50, height: 50, background: '#2e7d32', borderRadius: '100%', position: 'absolute', top: 'calc(50% - 25px)', left: 'calc(50% - 25px)', border: 'solid 4px #ffffff'}}>
                 <Icon name="check" size="big" style={{margin: 0}}/>
               </div>
             }
             <div style={{position: 'absolute', bottom: 0, left: 0, width: "100%", zIndex: 0, textAlign: 'center'}}>
                 Supply Content
             </div>
           </div>
           <div className="centered-column" style={{flex: 1, height: 100, position: 'relative'}}>
             <div style={{width: '100%', height: '50%', borderBottom: 'solid 4px #ffffff', position: 'absolute', top: 0, right: 0, zIndex: 0}}>&nbsp;</div>
             {this.state.step <= 1 &&
               <div style={{width: 50, height: 50, background: '#11171a', borderRadius: '100%', position: 'absolute', top: 'calc(50% - 25px)', left: 'calc(50% - 25px)', border: 'solid 4px #ffffff'}}></div>
             }
             {this.state.step > 1 &&
               <div className="centered-column" style={{width: 50, height: 50, background: '#2e7d32', borderRadius: '100%', position: 'absolute', top: 'calc(50% - 25px)', left: 'calc(50% - 25px)', border: 'solid 4px #ffffff'}}>
                 <Icon name="check" size="big" style={{margin: 0}}/>
               </div>
             }
             <div style={{position: 'absolute', bottom: 0, left: 0, width: "100%", zIndex: 0, textAlign: 'center'}}>
                 Select Options
             </div>
           </div>
           <div className="centered-column" style={{flex: 1, height: 100, position: 'relative'}}>
             <div style={{width: '100%', height: '50%', borderBottom: 'solid 4px #ffffff', position: 'absolute', top: 0, right: 0, zIndex: 0}}>&nbsp;</div>
             {this.state.step <= 2 &&
               <div style={{width: 50, height: 50, background: '#11171a', borderRadius: '100%', position: 'absolute', top: 'calc(50% - 25px)', left: 'calc(50% - 25px)', border: 'solid 4px #ffffff'}}></div>
             }
             {this.state.step > 2 &&
               <div className="centered-column" style={{width: 50, height: 50, background: '#2e7d32', borderRadius: '100%', position: 'absolute', top: 'calc(50% - 25px)', left: 'calc(50% - 25px)', border: 'solid 4px #ffffff'}}>
                 <Icon name="check" size="big" style={{margin: 0}}/>
               </div>
             }
             <div style={{position: 'absolute', bottom: 0, left: 0, width: "100%", zIndex: 0, textAlign: 'center'}}>
               Upload to Network
             </div>
           </div>
           <div className="centered-column" style={{flex: 1, height: 100, position: 'relative'}}>
             <div style={{width: '50%', height: '50%', borderBottom: 'solid 4px #ffffff', position: 'absolute', top: 0, left: 0, zIndex: 0}}>&nbsp;</div>
             {this.state.step <= 3 &&
               <div style={{width: 50, height: 50, background: '#11171a', borderRadius: '100%', position: 'absolute', top: 'calc(50% - 25px)', left: 'calc(50% - 25px)', border: 'solid 4px #ffffff'}}></div>
             }
             {this.state.step > 3 &&
               <div className="centered-column" style={{width: 50, height: 50, background: '#2e7d32', borderRadius: '100%', position: 'absolute', top: 'calc(50% - 25px)', left: 'calc(50% - 25px)', border: 'solid 4px #ffffff'}}>
                 <Icon name="check" size="big" style={{margin: 0}}/>
               </div>
             }
             <div style={{position: 'absolute', bottom: 0, left: 0, width: "100%", zIndex: 0, textAlign: 'center'}}>
                 Get Link
             </div>
           </div>
         </div>
       </div>
       {!this.state.uploaded &&
         <div className="landing-demo">
         <div className="demo-header centered-row">
           <div style={{paddingRight: 20}}>Image</div>
           <div className="centered-column">
             <Checkbox toggle
               checked={this.state.upload_type == "text"}
               style={{
                 border: "solid 1px rgba(255, 255, 255, 0.25)",
                 borderRadius: 50
               }}
               onChange={(e, {value}) => {this.handleType()}}
               />
           </div>
           <div style={{paddingLeft: 20}}>Text</div>
         </div>
         {this.state.upload_type === 'text' &&
           <div className="centered-column" style={{height: '100%', width: '100%', position: 'relative'}}>
             <div className="centered-column" style={{width: '80%', position: 'absolute', top: 0, padding: 20, opacity: 0.75}}>
               BLEENK is decentralized, disposable, client-side ecrypted image and text hosting. Links can be encrypted with a password of your choosing,
               or left without so anyone can view (content will still be encrypted prior to uploading). This platform is built on top of Skynet,
               a decentralized storage platform that is powered by the Sia (SIACOIN) blockchain.
             </div>
             <div className="centered-column" style={{width: '80%', height: '70vh', position: 'absolute', bottom: 0, padding: 20}}>
               <Segment.Group style={{width: '100%', height: '100%', background: 'transparent'}}>
                 <Segment style={{background: 'rgba(0, 0, 0, 0.15)', height: 150}}>
                   <Input
                     name="password"
                    action={{
                      color: 'teal',
                      icon: 'lock'
                    }}
                    disabled={this.state.upload_opts.anyone_views}
                    onChange={(e) => {this.handlePassword(e)}}
                    actionPosition='left'
                    placeholder='Password for Viewing'
                    type="password"
                    style={{width: "100%", minWidth: 450}}
                    value={this.state.pass_temp}
                  /><br /><br />
                  <span style={{width: "40vw", minWidth: 450, marginTop: 20}}>
                    Anyone can view without password: &nbsp;&nbsp;&nbsp; <Checkbox onChange={(e, val) => {this.handleTogglePassword(val)}}/>
                </span><br /><br />
                <span style={{width: "40vw", minWidth: 450, marginTop: 20}}>
                  <Dropdown
                    placeholder="Select expiration type"
                    selection
                    options={this.state.exp_opts}
                    onChange={(e, {value}) => {this.handleDropdown(value)}}
                    />
                </span>
                 </Segment>
                 <Segment style={{height: 'calc(70vh - 140px)', background: 'rgba(0, 0, 0, 0.15)'}}>
                   <Form>
                     <TextArea
                       placeholder="Type or paste content"
                       style={{
                         width: '100%',
                         minHeight: 'calc(70vh - 270px)',
                         maxHeight: 'calc(70vh - 270px)'
                       }}
                       onChange={(e, {value}) => {this.handleTextArea(value)}}
                       />
                   </Form>
                   <Button
                     style={{width: '100%', marginTop: 20}}
                     color="green"
                     inverted
                     onClick={this.handleUpload}
                     loading={this.state.loading}
                     >Create</Button>
                 </Segment>
               </Segment.Group>
             </div>
           </div>
         }{this.state.upload_type === 'image' &&
           <div className="centered-column" style={{height: '100%', width: '100%', position: 'relative'}}>
             {!this.state.chosen &&
               <div className="centered-column" style={{width: '80%', position: 'absolute', top: 0, padding: 20, opacity: 0.75}}>
                 BLEENK is decentralized, disposable, client-side ecrypted image and text hosting. Links can be encrypted with a password of your choosing,
                 or left without so anyone can view (content will still be encrypted prior to uploading). This platform is built on top of Skynet,
                 a decentralized storage platform that is powered by the Sia (SIACOIN) blockchain.
               </div>
             }
             {!this.state.chosen &&
               <Dropzone onDrop={this.handleFileSelect}>
              {({getRootProps, getInputProps}) => (
                <section className="centered-column" style={{width: '100%'}}>
                  <div {...getRootProps({className: 'dropzone'})}>
                    <input {...getInputProps()} />
                    <span>
                      <Button style={{width: "40vw", height: 200, padding: "0 !important"}} basic color="green">
                        <Icon name="upload" size="huge" color="green" style={{padding: 0, margin: 0}}/>
                        <br /><br /><br />
                        <span>Click or drag and drop file to upload</span>
                      </Button>
                    </span>
                  </div>
                </section>
              )}
               </Dropzone>
             }
             {this.state.chosen && this.state.file &&
               <div className="centered-column" style={{height: '100%', width: '100%'}}>
                 <div className="centered-column" style={{position: 'relative', width: '100%', height: 'calc(50vh - 50px)', flex: 1, borderBottom: "solid 1px rgba(255, 255, 255, 0.05)", overflow: "hidden"}}>

                   <img
                     style={{
                       height: "100%",
                       width: "auto",
                       opacity: 0.75,
                       position: 'absolute',
                       top: 0
                     }}
                     alt={this.state.file.name}
                     src={this.state.file.data}
                     />

                   <Button circular
                   style={{
                     opacity: 0.9,
                     position: 'absolute',
                     top: 5,
                     left: 5,
                     boxShadow: '0px 2px 15px 2px rgba(0,0,0,0.58)'
                   }}
                   color="red" icon="times" onClick={this.handleCancelUpload}/>
                 </div>
                 <div
                   style={{
                     flex: 1,
                     width: '100%',
                     height: '50vh',
                     paddingTop: 20,
                     justifyContent: "flex-start"
                   }}
                   className="centered-column"
                   >
                   <span style={{width: "40vw", minWidth: 450, fontSize: '1.5em', marginBottom: 20}}>
                     Password for viewing:
                   </span>
                   <Input
                     name="password"
                    action={{
                      color: 'teal',
                      icon: 'lock'
                    }}
                    disabled={this.state.upload_opts.anyone_views}
                    onChange={(e) => {this.handlePassword(e)}}
                    actionPosition='left'
                    placeholder='Password for Viewing'
                    type="password"
                    style={{width: "40vw", minWidth: 450}}
                    value={this.state.pass_temp}
                  />
                  <span style={{width: "40vw", minWidth: 450, marginTop: 20}}>
                    Anyone can view without password: &nbsp;&nbsp;&nbsp; <Checkbox onChange={(e, val) => {this.handleTogglePassword(val)}}/>
                  </span>
                  <span style={{width: "40vw", minWidth: 450, marginTop: 20, fontSize: '1.5em'}}>
                    Expiration:
                  </span>
                  <span style={{width: "40vw", minWidth: 450, marginTop: 20}}>
                    <Dropdown
                      placeholder="Select expiration type"
                      selection
                      options={this.state.exp_opts}
                      onChange={(e, {value}) => {this.handleDropdown(value)}}
                      />
                  </span>
                  <span style={{width: "40vw", minWidth: 450, marginTop: 20}}>
                    <Button
                      fluid
                      color="green"
                      inverted
                      onClick={this.handleUpload}
                      loading={this.state.loading}
                      >Create</Button>
                  </span>
                 </div>
               </div>
             }
           </div>
         }
       </div>
       }{this.state.uploaded &&
         <div className="landing-demo loaded">
           <Icon size="huge" name="check" color={this.state.copied === true ? "green" : "white"}/>
           <span style={{marginTop: 30}}>
             <Input
               disabled={this.state.copied}
               iconPosition='left'
               style={{width: "35vw", minWidth: 500}}
               value={"https://bleenk.io/l/" + this.state.upload_link}
               onClick={() => {this.setState({step: 4}); this.copyText("https://bleenk.io/l/" + this.state.upload_link)}}
              >
              <Icon name='copy' color="teal"/>
              <input />
            </Input>
           </span>
           <span style={{marginTop: 30}}>
             {this.state.copied &&
               <Button color="green" basic disabled>Copied!</Button>
             }{!this.state.copied &&
               <Button color="teal" onClick={this.handleCancelUpload}>Go Back</Button>
             }
           </span>
         </div>
       }
      </div>
    )
  }
}
