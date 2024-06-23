import React, {useState} from 'react'; 

// This file contains the form the user sees when they register an account

export const Register = (props) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const onRegisterClick = () => {
        console.log(email)
    }

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
                <input value={name} type="name" name="name" placeholder='Name' onChange={(ev) => setName(ev.target.value)} class="form-control form-control-lg" />
              </div>

              {/*Email input*/}
              <div className="form-outline form-white mb-3">
                <input value={email} type="email" name="email" placeholder='Email' onChange={(ev) => setEmail(ev.target.value)} class="form-control form-control-lg" />
              </div>

              {/*Password input*/}
              <div className="form-outline form-white mb-4">
                <input value={password} type="password" name="password" placeholder='Password' onChange={(ev) => setPassword(ev.target.value)}  class="form-control form-control-lg" />
              </div>
              <button className="btn btn-outline-light btn-lg px-5" onClick={onRegisterClick} value={'Register'} type="submit">Register</button>
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