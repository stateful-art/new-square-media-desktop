import React, { useState, useEffect } from "react";
import "./MusicLibrary.css"; // Import the CSS module
import {
  OpenFileDialog,
  OpenFolderDialog,
  CreateLibrary,
  ListLibraries,
  ListLibrary,
  ListLibraryContents,
} from "../../../wailsjs/go/multimedia/Library";
import Player from "../Player/Player";

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
  const [selectedLibrary, setSelectedLibrary] = useState<string>("");
  const [selectedFilePath, setSelectedFilePath] = useState<string>("");
  const [isInputVisible, setIsInputVisible] = useState(false);
  // useEffect(() => {
  //   ListLibraries().then((libraries) => setLibraries(libraries));
  // }, [newLibName, folderPath]);

  useEffect(() => {
    ListLibraries().then((libraries) => setLibraries(libraries));
  }, [newLibName, folderPath]);

  useEffect(() => {
    ListLibraryContents(selectedLibrary, folderPath).then((contents) =>
      setLibraryContents(contents)
    );
  }, [folderPath]);

  useEffect(() => {
    console.log(
      `libraryContents updated :: ${JSON.stringify(libraryContents, null, 2)}`
    );
  }, [libraryContents]);

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
    "String 17",
    "String 18",
    "asdasd 19",
    "String 110",
    "String 111",
    "String 112",
    "Strinsdg 113",
    "String 114",
    "String 115",
    "Striadasdasdasng 116",
    "rinadasdg 113",
    "String 314",
    "Striasdng 125",
    "String 163",
    "Striasdasng 127",
    "Strinasd 18",
    "Strinasdg 19",
    "Stridaadssdang 110",
    "Strisasddng 112",
    "Striasdang 113a",
    "Strinasdg 1d14",
    "Strasadssading 115",
    "String 1asd16",
  ];

  // Function that returns a new function
  function pickLibName(): string {
    let randomIndex = Math.floor(Math.random() * stringArray.length - 1);
    return stringArray[randomIndex]; // Return the string at the new index
  }

  // const handleFolderSelect = async () => {
  //   try {
  //     const folderPath = await OpenFolderDialog();
  //     setFolderPath(folderPath);
  //     const someLibName = pickLibName();
  //     setNewLibName(someLibName);
  //     CreateLibrary({
  //       name: someLibName,
  //       path: folderPath,
  //       isFolder: true,
  //     }).then(() => {
  //       ListLibraries().then((libraries) => setLibraries(libraries));
  //     });
  //   } catch (error) {
  //     console.error("Error opening folder dialog:", error);
  //   }
  // };

  const handleFolderSelect = async () => {
    try {
      const folderPath = await OpenFolderDialog();
      setFolderPath(folderPath);
      CreateLibrary({
        name: newLibName,
        path: folderPath,
        isFolder: true,
      }).then(() => {
        setIsInputVisible(false);
        ListLibraries().then((libraries) => setLibraries(libraries));
      });
    } catch (error) {
      console.error("Error opening folder dialog:", error);
    }
  };
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewLibName(event.target.value);
  };

  const handleInputKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      handleFolderSelect();
    }
  };

  const toggleInputVisibility = () => {
    setIsInputVisible(!isInputVisible);
  };

  const handleLibraryClick = (name: string, path: string) => {
    setSelectedLibrary(name);
    console.log(`listing content for folder ${name} ${path}`);
    ListLibraryContents(name, path).then((contents) =>
      setLibraryContents(contents)
    );
  };

  // const handleFolderClick = (path: string) => {
  //   console.log(`listing content for lib ${selectedLibrary} path ${path}`);
  //   ListLibraryContents(selectedLibrary, path).then((contents) => {
  //     console.log(`contents >>>>> ${JSON.stringify(contents)}\n\n\n`);
  //     setLibraryContents(contents);
  //     console.log(`new libraryContents :: ${libraryContents}`)
  //   });
  // };

  const handleFolderClick = (path: string) => {
    console.log(`listing content for lib ${selectedLibrary} path ${path}`);
    ListLibraryContents(selectedLibrary, path).then((contents) => {
      //  console.log(`contents >>>>> ${JSON.stringify(contents, null, 2)}\n\n\n`);
      setLibraryContents(contents);
      //  console.log(`new libraryContents :: ${JSON.stringify(libraryContents)}`);
    });
  };

  const handleSongClick = (item: SongLibrary) => {
    console.log("@handleSongClick")
    console.log("name: ", item.name)
    console.log("path: ", item.path)

    setSelectedSong(item.name);
    setSelectedFilePath(item.path);
    
  };

  return (
    <>
      <div id="leftPanel">
        <h2 id="lp-title">New Square</h2>
        <hr />
        {/* <button type="submit" id="addLibBtn" onClick={handleFolderSelect}>
          +
        </button> */}
        {isInputVisible ? (
          <input
            id="libraryInput"
            type="text"
            value={newLibName}
            onChange={handleInputChange}
            onKeyPress={handleInputKeyPress}
            placeholder="new library name"
          />
        ) : (
          <button type="submit" id="addLibBtn" onClick={toggleInputVisibility}>
            +
          </button>
        )}
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
                  ? handleFolderClick(item.path)
                  : // ? handleLibraryClick(selectedLibrary, item.path)
                    handleSongClick(item)
              }
            >
              {item.name}
            </li>
          ))}
        </ul>
      </div>
      {/* <div id="player">
        <div id="songName"></div>
        <audio id="audioPlayer" controls></audio>
        <div id="recentsButton">history</div>
        <div id="queueButton">queue</div>
      </div> */}

      <Player
        songName={selectedSong}
        filePath={selectedFilePath}
        libName={selectedLibrary}
      />
      <div id="queuePanel" className="hidden"></div>
      <div id="historyPanel" className="hidden"></div>
    </>
  );
};

export default MusicLibrary;
