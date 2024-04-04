import React, { useState } from "react";
import logo from "../../assets/images/login-img.webp";
import "./Login.css"; // Ensure this CSS file exists for styling
import SpotifyIcon from "../../assets/icons/spotify-icon.svg"; // Import Spotify SVG icon
import { CreateLibrary } from "../../../wailsjs/go/multimedia/Library";

interface LoginProps {
  onLogin: (email: string, password: string) => void;
}

const Library: React.FunctionComponent<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState("");
  const [path, setPath] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    CreateLibrary({ name: name, path: path }).then((res) => {
      console.log(res);
    });
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Library Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Folder Path"
            value={path}
            onChange={(e) => setPath(e.target.value)}
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

export default Library;
