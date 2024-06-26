import React, {Component} from 'react';
import axios from 'axios';
var config = require('../config');

// This file contains the form the user sees when they register an account

export class Register extends Component {
    constructor(props) {
      super(props);
      this.state = {
        name:'',
        email:'',
        password:'',
        error:''
      };
    }

    onChange = (event) => {
      this.setState({ [event.target.name]: event.target.value})
    }

    Register = (event) => {
      event.preventDefault();
      this.setState({ [event.target.name]: event.target.value });    
    
      const name = this.state.name;
      const email = this.state.email;
      const password = this.state.password;
          
      axios.post(config.API_URL+'register',  {
        "name" : name,
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
          if(res['data'].message){ // Fail
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

              <h2 className="fw-bold mb-2 text-uppercase">Register</h2>
              <p className="text-white-50">Create an account by filling out the fields below.</p>

              {/*Name input*/}
              <div className="form-outline form-white mb-3">
                <input type="name" name="name" placeholder='Name' onChange={this.onChange}  className="form-control form-control-lg" />
              </div>

              {/*Email input*/}
              <div className="form-outline form-white mb-3">
                <input type="email" name="email" placeholder='Email' onChange={this.onChange}  className="form-control form-control-lg" />
              </div>

              {/*Password input*/}
              <div className="form-outline form-white mb-4">
                <input type="password" name="password" placeholder='Password' onChange={this.onChange}   className="form-control form-control-lg" />
              </div>
              <button className="btn btn-outline-light btn-lg px-5" onClick={this.Register} value={'Register'} type="submit">Register</button>
            </div>
            
            <div>
              <p className="mb-0">Already have an account? <a href="/Login" className="text-blue-50">Login</a>
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