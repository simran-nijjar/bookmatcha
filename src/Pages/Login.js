import React, {useState} from 'react'; 

// This file contains the form the user sees when they login and the login processes

export const Login = (props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const onLoginClick = () => {
        console.log(email)
    }

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
                <input value={email} type="email" name="email" placeholder='Email' onChange={(ev) => setEmail(ev.target.value)} class="form-control form-control-lg" />
              </div>

              {/*Password input*/}
              <div className="form-outline form-white mb-4">
                <input value={password} type="password" name="password" placeholder='Password' onChange={(ev) => setPassword(ev.target.value)}  class="form-control form-control-lg" />
              </div>
              <button className="btn btn-outline-light btn-lg px-5" onClick={onLoginClick} value={'Login'} type="submit">Login</button>
            </div>
            
            <div>
              <p className="mb-0">Don't have an account? <a href="#" className="text-blue-50">Create account</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
    )
}