import React, { useState, useEffect } from "react";
import "./MusicLibrary.css"; // Import the CSS module
import {
  OpenFolderDialog,
  CreateLibrary,
  ListLibraries,
  ListLibraryContents,
  LoadLibraries,
} from "../../../wailsjs/go/multimedia/Library";

import Player from "../Player/Player";
// import SearchBar from "../SearchBar/SearchBar";

type SongLibrary = {
  name: string;
  path: string;
  isFolder?: boolean;
};

const MusicLibrary: React.FC = () => {
  const [folderPath, setFolderPath] = useState<string>("");
  const [newLibName, setNewLibName] = useState<string>("");
  const [libraries, setLibraries] = useState<SongLibrary[]>([]);
  // const [matches, setMatches] = useState<SongLibrary[]>([]);

  const [libraryContents, setLibraryContents] = useState<SongLibrary[]>([]);
  const [selectedSong, setSelectedSong] = useState<string>("");
  const [selectedLibrary, setSelectedLibrary] = useState<string>("");
  const [selectedFilePath, setSelectedFilePath] = useState<string>("");
  const [isInputVisible, setIsInputVisible] = useState(false);

  // const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
   LoadLibraries().then(() => {
    setIsInputVisible(false);
    setNewLibName("");
    ListLibraries().then((libraries) => setLibraries(libraries));
  });
  }, []);

  useEffect(() => {
    ListLibraryContents(selectedLibrary, folderPath).then((contents) =>
      setLibraryContents(contents)
    );
  }, [folderPath]);

  const handleFolderSelect = async () => {
    try {
      const folderPath = await OpenFolderDialog();
      setFolderPath(folderPath);
      CreateLibrary({
        name: newLibName,
        path: folderPath
      }).then(() => {
        setIsInputVisible(false);
        setNewLibName("");
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
      setNewLibName("");
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

  const handleFolderClick = (path: string) => {
    ListLibraryContents(selectedLibrary, path).then((contents) => {
      setLibraryContents(contents);
    });
  };

  const handleSongClick = (item: SongLibrary) => {
    setSelectedSong(item.name);
    setSelectedFilePath(item.path);
  };

  return (
    <>
      <div id="leftPanel">
        <h2 id="lp-title">New Square</h2>
        <hr />

        {/* <SearchBar onSearch={handleSearch} /> */}

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
          <span>{selectedLibrary}</span>
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
                  : handleSongClick(item)
              }
            >
              {item.name}
            </li>
          ))}
        </ul>
      </div>
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
