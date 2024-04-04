import React, { useState } from 'react';
import logo from '../../assets/images/login-img.webp';
import './Login.css'; // Ensure this CSS file exists for styling
import SpotifyIcon from '../../assets/icons/spotify-icon.svg'; // Import Spotify SVG icon
// import GoogleIcon from '../../assets/icons/google-icon.svg'; // Import Google SVG icon

interface LoginProps {
 onLogin: (email: string, password: string) => void;
}

const Login: React.FunctionComponent<LoginProps> = ({ onLogin }) => {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');

 const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Validate email and password here
    if (validateEmail(email) && validatePassword(password)) {
        onLogin(email, password);
    }
    console.log("something is wrong with email or pass..")
 };

 const validateEmail = (email: string) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,  3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
 };

 const validatePassword = (password: string) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return re.test(String(password));
 };

 return (
    <div className="login-container">
      <div className="login-form">
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
        <div className="social-login">
          <button className="social-btn">
            <img src={SpotifyIcon} alt="Spotify" />
          </button>
          {/* <button className="social-btn">
            <img src={GoogleIcon} alt="Google" />
          </button> */}
        </div>
      </div>
      <div className="login-image">
        <img src={logo} alt="Logo" />
      </div>
    </div>
 );
};

export default Login;
