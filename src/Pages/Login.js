import React, {Component} from 'react';
import axios from 'axios';
var config = require('../config');

// This file contains the form the user sees when they login and the login processes

export class Login extends Component {

    constructor(props) {
        super(props);
        this.state = { 
            email:'',
            password:'',
            error:''
        };
    }

    onChange = (e) =>{
        this.setState({ [e.target.name]: e.target.value });
    }

    Login =(e) =>{
        e.preventDefault();
        this.setState({ [e.target.name]: e.target.value });    
  
      const email = this.state.email;
      const password = this.state.password;
          
      axios.post(config.API_URL+'login',  {
        "email" : email,
        "password" : password
      } )
      .then( (res) => {
        console.log(res);
        if(res['data'].token) { // Successful
          
          console.log(res.data.token);
          localStorage.setItem("token", res.data.token);
            this.props.ReUserState(true);
            
            this.props.props.history.push('/Home');
          } 
          if(res['data'].message){// Fail
            const error  = res.data.message;
            this.setState({
              error: error
            });
          }
  
      })
      .catch((error) => {console.log(error)} )
      }

    render (){
    return (
  <div className="container py-5 h-100">
    <div className="row d-flex justify-content-center align-items-center h-100">
      <div className="col-12 col-md-8 col-lg-6 col-xl-5">
        <div className="card bg-dark text-white">
          <div className="card-body p-5 text-center">
            <div className="mb-md-5 mt-md-4 pb-5">

              <h2 className="fw-bold mb-2 text-uppercase">Login</h2>
              <p className="text-white-50">Welcome back to My Library!</p>

              {/*Email input*/}
              <div className="form-outline form-white mb-3">
                <input type="email" name="Email" placeholder='Email' onChange={this.onChange}  className="form-control form-control-lg" />
              </div>

              {/*Password input*/}
              <div className="form-outline form-white mb-4">
                <input type="password" name="Password" placeholder='Password' onChange={this.onChange} className="form-control form-control-lg" />
              </div>
              <button className="btn btn-outline-light btn-lg px-5" value={'Login'} type="submit">Login</button>
            </div>
            
            <div>
              <p className="mb-0">Don't have an account? <a href="/Register" className="text-blue-50">Register</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
    )
}
}
