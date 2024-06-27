import React, {Component} from 'react';
import axios from 'axios';
var config = require('../config');

// This file contains the form the user sees when they register an account

export class Register extends Component {
    constructor(props) {
      super(props);
      this.state = {
        Name:'',
        Email:'',
        Password:'',
        Error:''
      };
    }

    onChange = (event) => {
      this.setState({ [event.target.name]: event.target.value})
    }

    // Method to check if email is of valid format
    validateEmail = (Email) => {
      const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
      return regex.test(String(Email).toLowerCase());
    }

    Register = (event) => {
      event.preventDefault();
      this.setState({ [event.target.name]: event.target.value });    
    
      const Name = this.state.Name;
      const Email = this.state.Email;
      const Password = this.state.Password;

      if (!this.validateEmail(Email)) {
        console.log('Invalid email format.');
        this.setState({ Error: 'Invalid email format. Please enter a valid email.' });
        return;
      }
          
      axios.post(config.API_URL+'register',  {
        "Name" : Name,
        "Email" : Email,
        "Password" : Password
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
                <input type="text" value={this.state.Name} name="Name" placeholder='Name' onChange={this.onChange}  className="form-control form-control-lg" />
              </div>

              {/*Email input*/}
              <div className="form-outline form-white mb-3">
                <input type="email" value={this.state.Email} name="Email" placeholder='Email' onChange={this.onChange}  className="form-control form-control-lg" />
              </div>

              {/*Password input*/}
              <div className="form-outline form-white mb-4">
                <input type="password" value={this.state.Password} name="Password" placeholder='Password' onChange={this.onChange} className="form-control form-control-lg" />
              </div>

              {/* Error message */}
              <div style={{ minHeight: '20px' }}>
                    {this.state.Error && <p style={{ color: 'white' }}>{this.state.Error}</p>}
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