import React, { Component } from 'react'
import {Button, Checkbox, Dropdown, Icon, Input} from 'semantic-ui-react'
import Cookie from 'universal-cookie'
import Dropzone from 'react-dropzone'
import {SkynetClient} from 'skynet-js'

// Images
import Logo from '../../img/logo_lg.png'
import LogoText from '../../img/logo_text.png'
const cookie = new Cookie()
const client = new SkynetClient('https://siasky.net/skynet/skyfile');

export default class Landing extends Component{
  constructor(props){
    super(props)
    this.state = {
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
        expiration: null,
        encryption: true,
        password: null,
        skylink: null
      },
      loading: false,
      uploaded: false
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
      file: null
    })
  }
  handleFileSelect = (files) => {
    this.setState({chosen: true})
    let f = files[0]
    const reader = new FileReader()
    reader.onabort = () => this.setState({chosen: false, file: null})
    reader.onerror = () => this.setState({chosen: false, file: null, errors: ["Error uploading file"]})
    reader.onload = () => {
      let contents = reader.result
      this.setState({
        file: {
          name: f.name,
          size: f.size,
          data: contents,
          preview: URL.createObjectURL(f),
          path: f.path,
          obj: f
        }
      })
    }
    reader.readAsArrayBuffer(f)
  }
  handleUpload = () => {
    this.setState({loading: true})
    client.uploadFile(this.state.file.obj
    ).then((res) => {
      console.log(res)
      this.setState({
        loading: false,
        uploaded: true
      })
    }).catch((err) => {
      console.log(err)
    })
  }
  render(){
    return(
      <div className="main centered-row">
       <div className="centered-column" style={{flex: 1}}>
         <img alt="Bleenk Logo" src={Logo} style={{width: "50%", minWidth: 300, height: 'auto'}} />
         <img alt="Powered by Skynet" src={LogoText} style={{width: "50%", minWidth: 300, height: 'auto'}} />
       </div>
       <div className="landing-demo">
         <div className="demo-header centered-row">
           <div style={{paddingRight: 20}}>Image</div>
           <div className="centered-column">
             <Checkbox toggle
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
           <div className="centered-column" style={{height: '100%', width: '100%'}}>
             Text
           </div>
         }{this.state.upload_type === 'image' &&
           <div className="centered-column" style={{height: '100%', width: '100%'}}>
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
                 <div className="centered-column" style={{position: 'relative', width: '100%', height: '100%', flex: 1, borderBottom: "solid 1px rgba(255, 255, 255, 0.05)"}}>
                   <img
                     style={{
                       maxHeight: "40vh",
                       width: 'auto',
                       maxWidth: '90%',
                       border: 'solid 1px rgba(255, 255, 255, 0.5)'
                     }}
                     alt={this.state.file.name}
                     src={this.state.file.preview}
                     />
                   <Button circular style={{opacity: 0.9, position: 'absolute', top: 5, left: 5}} color="red" icon="times" onClick={this.handleCancelUpload}/>
                 </div>
                 <div
                   style={{
                     flex: 1,
                     width: '100%',
                     paddingTop: 50,
                     justifyContent: "flex-start",
                   }}
                   className="centered-column"
                   >
                   <span style={{width: "40vw", minWidth: 450, fontSize: '1.5em', marginBottom: 20}}>
                     Password for viewing:
                   </span>
                   <Input
                    action={{
                      color: 'teal',
                      icon: 'lock'
                    }}
                    actionPosition='left'
                    placeholder='Password for Viewing'
                    type="password"
                    style={{width: "40vw", minWidth: 450}}
                  />
                  <span style={{width: "40vw", minWidth: 450, marginTop: 20}}>
                    Disable encryption? &nbsp;&nbsp;&nbsp; <Checkbox />
                  </span>
                  <span style={{width: "40vw", minWidth: 450, marginTop: 20, fontSize: '1.5em'}}>
                    Expiration:
                  </span>
                  <span style={{width: "40vw", minWidth: 450, marginTop: 20}}>
                    <Dropdown
                      placeholder="Select expiration type"
                      selection
                      options={this.state.exp_opts}
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
      </div>
    )
  }
}
