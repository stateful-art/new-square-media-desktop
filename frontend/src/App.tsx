// src/App.tsx
import React, { useState } from 'react';
import logo from './assets/images/newnewmedia.png';
import './App.css';
import { Greet } from "../wailsjs/go/main/App";
import { GetLibrary } from "../wailsjs/go/multimedia/Library";
import Login from './components/Login/Login'; // Import the Login component
import MusicLibrary from './components/MusicLibrary/MusicLibrary';

interface AppState {
 resultText: string;
 name: string;
 libName: string;
 isLoggedIn: boolean; // Add a state to manage login status
}

const App: React.FunctionComponent = () => {
 const [state, setState] = useState<AppState>({
    resultText: "Please enter your name below 👇",
    name: '',
    libName: '',
    isLoggedIn: true, // Initially, the user is not logged in
 });

 const updateLibName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prevState => ({ ...prevState, libName: e.target.value }));
 };

 const updateResultText = (result: string) => {
    setState(prevState => ({ ...prevState, resultText: result }));
 };

 const greet = () => {
    Greet(state.name).then(updateResultText);
 };

 const getLibrary = () => {
    GetLibrary(state.libName).then(updateResultText);
 };

 const handleLogin = (username: string, password: string) => {
    // Here you can handle the login logic
    console.log('Logged in with:', username, password);
    setState(prevState => ({ ...prevState, isLoggedIn: true }));
 };

 return (
    <div id="App">
      {state.isLoggedIn ? (
        <>
          {/* <img src={logo} id="logo" alt="logo"/> */}
          {/* <div id="result" className="result">{state.resultText}</div>
          <div id="input" className="input-box">
            <input id="name" className="input" onChange={updateLibName} autoComplete="off" name="input" type="text"/>
            <button className="btn" onClick={getLibrary}>Get Library</button>
          </div> */}
                  <MusicLibrary /> // Render the MusicLibrary component after successful login
        </>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
 );
};

export default App;
