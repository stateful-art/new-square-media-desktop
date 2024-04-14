import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css"; // Import FontAwesome CSS

import "./MusicLibrary.css"; // Import the CSS module
import {
  OpenFolderDialog,
  CreateLibrary,
  ListLibraries,
  ListLibraryContents,
  LoadLibraries,
  RemoveLibrary,
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

  // const [queue, setQueue] = useState<SongLibrary[]>([]); // Step 1: Define queue state
  const [queue, setQueue] = useState<Set<SongLibrary>>(new Set()); // Step 1: Define queue state as a Set

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
        path: folderPath,
      }).then(() => {
        setIsInputVisible(false);
        setNewLibName("");
        setSelectedLibrary(newLibName);
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

  // const toggleInputVisibility = () => {
  //   setIsInputVisible(!isInputVisible);
  // };

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

  const handleRemoveLibrary = (libName: string) => {
    console.log("@handleRemoveLibrary for >>", libName);
    RemoveLibrary(libName).then(() => {
      ListLibraries().then((libraries) => setLibraries(libraries));
    });
  };

  const handleAddToQueue = (item: SongLibrary) => {
    setQueue((prevQueue) => {
      const newQueue = new Set(prevQueue);
      newQueue.add(item);
      return newQueue;
    });
  };

  // TESTING: Log the queue & size whenever the queue state changes
  useEffect(() => {
    console.log(queue);
    console.log("number of songs in the queue now: ", queue.size);
  }, [queue]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isInputVisible )  {
        setIsInputVisible(false);
      }
    };
  
    document.addEventListener('keydown', handleKeyDown);
  
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isInputVisible]); 
 
  const toggleInputVisibility = () => {
    setIsInputVisible((prevIsInputVisible) => !prevIsInputVisible);
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
            onKeyDown={handleInputKeyPress}
            onFocus={(e) => e.target.select()} // Select all text when the input field is focused

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
              className={selectedLibrary === library.name ? "selected-lib" : ""}
            >
              {library.name}
            </li>
          ))}
        </ul>
      </div>

      <div id="rightPanel">
        {selectedLibrary !== "" && (
          <div id="rp-topnav">
            <>
              <span>{selectedLibrary}</span>
              <FontAwesomeIcon
                icon={faTrash}
                className={"remove-library-btn"}
                size="lg"
                onClick={() => handleRemoveLibrary(selectedLibrary)}
              />
            </>
          </div>
        )}
        <ul id="fileList">
          {libraryContents.map((item) => (
            <li
              key={item.name}
              style={{
                display: "flex", // Use flexbox to control layout
                justifyContent: "space-between", // Align items at the start and end of the row
                alignItems: "center", // Vertically center items
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
              <span>{item.name}</span>
              {!item.isFolder && (
                <FontAwesomeIcon
                className={"add-queue-btn"}
                  icon={faPlus}
                  // style={{ cursor: "pointer" }}
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation(); // Stop event propagation
                    handleAddToQueue(item);
                  }}
                />
              )}
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
