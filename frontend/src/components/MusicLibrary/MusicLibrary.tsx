import React, { useState, useEffect } from "react";
import "./MusicLibrary.css"; // Import the CSS module
import {
  OpenFolderDialog,
  CreateLibrary,
  ListLibraries,
  ListLibraryContents,
} from "../../../wailsjs/go/multimedia/Library";

type SongLibrary = {
  name: string;
  path: string;
  isFolder?: boolean;
};

const MusicLibrary: React.FC = () => {
  const [folderPath, setFolderPath] = useState<string>("");
  const [newLibName, setNewLibName] = useState<string>("");
  const [libraries, setLibraries] = useState<SongLibrary[]>([]);
  const [libraryContents, setLibraryContents] = useState<SongLibrary[]>([]);
  const [selectedSong, setSelectedSong] = useState<string>("");

  useEffect(() => {
    ListLibraries(newLibName, folderPath).then((libraries) =>
      setLibraries(libraries)
    );
  }, [newLibName, folderPath]);

  const stringArray = [
    "String 1",
    "String 2",
    "String 3",
    "String 4",
    "String 5",
    "String 6",
    "String 7",
    "String 8",
    "String 9",
    "String 10",
    "String 11",
    "String 12",
    "String 13",
    "String 14",
    "String 15",
    "String 16",
  ];

  // Function that returns a new function
  function pickLibName(): string {
    let randomIndex = Math.floor(Math.random() * 16);
    console.log("hellooo")
    return stringArray[randomIndex]; // Return the string at the new index
  }

  const handleFolderSelect = async () => {
    try {
      const folderPath = await OpenFolderDialog();
      setFolderPath(folderPath);
      const someLibName = pickLibName();
      setNewLibName(someLibName);
      CreateLibrary({
        name: someLibName,
        path: folderPath,
        isFolder: true,
      }).then(() => {
        ListLibraries(someLibName, folderPath).then((libraries) =>
          setLibraries(libraries)
        );
      });
    } catch (error) {
      console.error("Error opening folder dialog:", error);
    }
  };

  const handleLibraryClick = (name: string, path: string) => {
    ListLibraryContents(name, path).then((contents) =>
      setLibraryContents(contents)
    );
  };

  const handleSongClick = (songName: string) => {
    setSelectedSong(songName);
  };

  return (
    <>
      <div id="leftPanel">
        <h2 id="lp-title">New Square</h2>
        <hr />
        <button type="submit" id="addLibBtn" onClick={handleFolderSelect}>
          +
        </button>
        <ul id="libraryList">
          {libraries.map((library) => (
            <li
              key={library.name}
              onClick={() => handleLibraryClick(library.name, library.path)}
            >
              {library.name}
            </li>
          ))}
        </ul>
      </div>

      <div id="rightPanel">
        <div id="rp-topnav">
          <ul id="breadcrumb">
            <li id="rp-lib-name"></li>
          </ul>
        </div>
        <ul id="fileList">
          {libraryContents.map((item) => (
            <li
              key={item.name}
              style={{
                backgroundColor: item.isFolder
                  ? "#535258"
                  : selectedSong === item.name
                  ? "red"
                  : "transparent",
              }}
              onClick={() =>
                item.isFolder
                  ? handleLibraryClick(item.name, item.path)
                  : handleSongClick(item.name)
              }
            >
              {item.name}
            </li>
          ))}
        </ul>
      </div>
      <div id="player">
        <div id="songName"></div>
        <audio id="audioPlayer" controls></audio>
        <div id="recentsButton">history</div>
        <div id="queueButton">queue</div>
      </div>

      <div id="queuePanel" className="hidden"></div>
      <div id="historyPanel" className="hidden"></div>
    </>
  );
};

export default MusicLibrary;
