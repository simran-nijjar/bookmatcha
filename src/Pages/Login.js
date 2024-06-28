import React, {Component} from 'react';
import axios from 'axios';
var config = require('../config');

// This file contains the form the user sees when they login and the login processes

export class Login extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            Email:'',
            Password:'',
            Error:''
        };
    }

    onChange = (event) =>{
        this.setState({ [event.target.name]: event.target.value });
    }

    Login = (event) =>{
      event.preventDefault();
      this.setState({ [event.target.name]: event.target.value });    
  
      const Email = this.state.Email;
      const Password = this.state.Password;
          
      axios.post(config.API_URL+'login',  {
        "Email" : Email,
        "Password" : Password
      } )
      .then( (res) => {
        console.log(res);
        if (res.status === 200) {
          // Handle successful login
          this.setState({ Error: 'Logged in.' });
        } 
      })
      .catch((error) => {
        console.log(error.response); 
        if (error.response && error.response.status === 400) {
          this.setState({ Error: 'The email and password you entered does not match our records. Please try again.' });
        } else {
          this.setState({ Error: 'Login failed. Please try again later.' });
        }
      });
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
                <input type="Email" name="Email" placeholder='Email' onChange={this.onChange}  className="form-control form-control-lg" />
              </div>

              {/*Password input*/}
              <div className="form-outline form-white mb-4">
                <input type="Password" name="Password" placeholder='Password' onChange={this.onChange} className="form-control form-control-lg" />
              
              {/* Error message */}
              <div style={{ minHeight: '20px' }}>
                    {this.state.Error && <p style={{ color: 'white' }}>{this.state.Error}</p>}
              </div>
              
              </div>
              <button className="btn btn-outline-light btn-lg px-5" value={'Login'} type="submit" onClick={this.Login}>Login</button>
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
