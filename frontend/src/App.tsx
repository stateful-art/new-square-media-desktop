import React, { useState } from "react";
import "./App.css";
import Login from "./components/Login/Login"; //
import MusicLibrary from "./components/MusicLibrary/MusicLibrary";
import PlaceLibrary from "./components/PlaceLibrary/PlaceLibrary";
import { faL } from "@fortawesome/free-solid-svg-icons";

// interface User {
//   userId: string;
//   email: string;
//   jwt: string;
//   roles: string[];
// }
interface AppState {
  isLoggedIn: boolean;
  role: string;
}

const App: React.FunctionComponent = () => {
  const [state, setState] = useState<AppState>({
    isLoggedIn: true,
    role: "user"
  });


  const userLoggedIn = state.isLoggedIn && state.role === "user";
  const placeLoggedIn = state.isLoggedIn && state.role === "place";

  const handleLogin = (username: string, password: string) => {
    console.log("Logged in with:", username, password);
  
    setState((prevState) => ({ ...prevState, isLoggedIn: true}));
  };

  return (
    <div id="App">
      {state.isLoggedIn ? (
        <>
          {placeLoggedIn && <PlaceLibrary />}
          {userLoggedIn && <MusicLibrary />}

        </>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;
