import React, { useState } from "react";
import "./App.css";
import Login from "./components/Login/Login"; // Import the Login component
import MusicLibrary from "./components/MusicLibrary/MusicLibrary";

interface AppState {
  resultText: string;
  name: string;
  libName: string;
  isLoggedIn: boolean; // Add a state to manage login status
}

const App: React.FunctionComponent = () => {
  const [state, setState] = useState<AppState>({
    resultText: "Please enter your name below 👇",
    name: "",
    libName: "",
    isLoggedIn: true, // Initially, the user is not logged in
  });



  const handleLogin = (username: string, password: string) => {
    // Here you can handle the login logic
    console.log("Logged in with:", username, password);
    setState((prevState) => ({ ...prevState, isLoggedIn: true }));
  };

  return (
    <div id="App">
      {state.isLoggedIn ? (
        <>
          <MusicLibrary />
        </>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;
