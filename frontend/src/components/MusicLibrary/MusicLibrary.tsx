import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPlus,
  faBook,
  faMap,
} from "@fortawesome/free-solid-svg-icons";
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

export type SongLibrary = {
  name: string;
  path: string;
  isFolder?: boolean;
};

type Item = {
  name: string;
  path: string;
  isPlaylist?: boolean;
};

type Place = {
  name: string;
  description: string;
  items: Item[];
};

const MusicLibrary: React.FC = () => {
  const [folderPath, setFolderPath] = useState<string>("");
  const [newLibName, setNewLibName] = useState<string>("");
  const [libraries, setLibraries] = useState<SongLibrary[]>([]);
  // const [matches, setMatches] = useState<SongLibrary[]>([]);
  // const [searchTerm, setSearchTerm] = useState<string>("");

  const [libraryContents, setLibraryContents] = useState<SongLibrary[]>([]);
  const [placeContents, setPlaceContents] = useState<Item[]>([]);

  const [selectedSong, setSelectedSong] = useState<string>("");
  const [selectedLibrary, setSelectedLibrary] = useState<string>("");
  const [selectedFilePath, setSelectedFilePath] = useState<string>("");
  const [isInputVisible, setIsInputVisible] = useState(false);

  const [queue, setQueue] = useState<Set<SongLibrary>>(new Set()); // Step 1: Define queue state as a Set

  const [isLibraryView, setIsLibraryView] = useState<boolean>(true); // Track whether to display libraries or places

  // const [places, setPlaces] = useState<Place[]>([
  //   { name: "Hardrock Cafe", description: "Description 1" },
  //   { name: "Elefante Bar", description: "Description 2" },
  //   { name: "Karga Bar", description: "Description 3" },
  //   { name: "Coco Bistro", description: "Description 3" },
  // ]);
  const [selectedPlace, setSelectedPlace] = useState<string>("");

  const [places, setPlaces] = useState<Place[]>([
    {
      name: "Hardrock Cafe",
      description: "Description 1",
      items: [
        {
          name: "Pls",
          path: "/path/to/playlist1",
          isPlaylist: true,
        },
        {
          name: "OOOw",
          path: "/path/to/song1",
          isPlaylist: false,
        },
        // Add more items as needed
      ],
    },
    {
      name: "Elefante Bar",
      description: "Description 2",
      items: [
        {
          name: "FaFa",
          path: "/path/to/playlist1",
          isPlaylist: true,
        },
        {
          name: "Ele ele",
          path: "/path/to/song1",
          isPlaylist: false,
        },
      ],
    },
    {
      name: "Karga Bar",
      description: "Description 3",
      items: [
        {
          name: "Karga mix",
          path: "/path/to/playlist1",
          isPlaylist: true,
        },
        {
          name: "Song 1",
          path: "/path/to/song1",
          isPlaylist: false,
        },
      ],
    },
    {
      name: "Coco Bistro",
      description: "Coco Special",
      items: [
        {
          name: "Arsiv",
          path: "/path/to/playlist1",
          isPlaylist: true,
        },
        {
          name: "Gangham style",
          path: "/path/to/song1",
          isPlaylist: false,
        },
      ],
    },
  ]);

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

  const getPlaceItems = (name: string) => {
    const place = places.find((place) => place.name === name);
    return place ? place.items : [];
  };

  const handlePlaceClick = (name: string) => {
    console.log("selected place >> ", name);
    setSelectedPlace(name);

    let contents = getPlaceItems(name);
    setPlaceContents(contents);
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

  const handlePlaylistClick = (path: string) => {
    ListLibraryContents(selectedPlace, path).then((contents) => {
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
      if (event.key === "Escape" && isInputVisible) {
        setIsInputVisible(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isInputVisible]);

  const toggleInputVisibility = () => {
    setIsInputVisible((prevIsInputVisible) => !prevIsInputVisible);
  };

  const toggleLibraryView = () => {
    setIsLibraryView(true);
  };

  const togglePlacesView = () => {
    setIsLibraryView(false);
  };

  return (
    <>
      <div id="leftPanel">
        {/* <h2 id="lp-title">New Square</h2> */}
        <div id="tabs">
          <button
            className={isLibraryView ? "active-tab" : ""}
            onClick={toggleLibraryView}
          >
            <FontAwesomeIcon icon={faBook} />
            Libraries
          </button>
          <button
            className={!isLibraryView ? "active-tab" : ""}
            onClick={togglePlacesView}
          >
            <FontAwesomeIcon icon={faMap} />
            Places
          </button>
        </div>
        {/* <hr /> */}

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
          {isLibraryView
            ? libraries.map((library) => (
                <li
                  key={library.name}
                  onClick={() => handleLibraryClick(library.name, library.path)}
                  className={
                    selectedLibrary === library.name ? "selected-lib" : ""
                  }
                >
                  {library.name}
                </li>
              ))
            : places.map((place) => (
                <li
                  key={place.name}
                  onClick={() => handlePlaceClick(place.name)}
                  className={
                    selectedPlace === place.name ? "selected-place" : ""
                  }
                >
                  {place.name}
                  {/* <p>{place.description}</p> */}
                </li>
              ))}
        </ul>
      </div>

      <div id="rightPanel">
        {isLibraryView ? (
          <>
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
          </>
        ) : (
          <>
            <div id="rp-topnav">
              <span>{selectedPlace}</span>
            </div>
          </>
        )}
        <ul id="fileList">
          {isLibraryView ? (
            <>
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
                  {/* display song names without extension */}
                  <span>{item.name.replace(/\.[^.]+$/, "")}</span>

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
            </>
          ) : (
            <>
              <ul id="fileList">
                {selectedPlace &&
                  placeContents.map((item) => (
                    <li
                      key={item.name}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        backgroundColor: item.isPlaylist
                          ? "#535258"
                          : selectedSong === item.name
                          ? "red"
                          : "transparent",
                      }}
                      onClick={() =>
                        item.isPlaylist
                          ? handlePlaylistClick(item.path)
                          : handleSongClick(item)
                      }
                    >
                      <span>{item.name}</span>
                      {!item.isPlaylist && (
                        <FontAwesomeIcon
                          className={"add-queue-btn"}
                          icon={faPlus}
                          size="lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToQueue(item);
                          }}
                        />
                      )}
                    </li>
                  ))}
              </ul>
            </>
          )}
        </ul>
      </div>
      <Player
        songName={selectedSong}
        filePath={selectedFilePath}
        libName={selectedLibrary}
        queue={queue}
        setQueue={setQueue}
      />
      <div id="queuePanel" className="hidden"></div>
      <div id="historyPanel" className="hidden"></div>
    </>
  );
};

export default MusicLibrary;
