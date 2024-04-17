import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPlus,
  faEdit,
  faTurnDown,
  faMusic,
  faEarth,
} from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css"; // Import FontAwesome CSS

import "./MusicLibrary.css"; // Import the CSS module
import {
  CreateLibrary,
  ListLibraries,
  ListLibraryContents,
  LoadLibraries,
  UpdateLibraryName,
  RemoveLibrary,
  RemoveLibraryDialog,
  OpenFolderDialog,
} from "../../../wailsjs/go/multimedia/Library";

import { GetPlaces } from "../../../wailsjs/go/place/Place";
import { GetPlayListsOfPlace } from "../../../wailsjs/go/playlist/Playlist";

import Player from "../Player/Player";
import QueuePanel from "../QueuePanel/QueuePanel";
// import SearchBar from "../SearchBar/SearchBar";

export type SongLibrary = {
  name: string;
  path: string;
  isFolder?: boolean;
};

// type Item = {
//   name: string;
//   path: string;
//   isPlaylist?: boolean;
// };

// type GeometryType =
//   | "Point"
//   | "LineString"
//   | "Polygon"
//   | "MultiPoint"
//   | "MultiLineString"
//   | "MultiPolygon"
//   | "GeometryCollection";

type Location = {
  type: string;
  coordinates: number[];
};

type Link = {
  platform: string;
  url: string;
};

type PlaceDTO = {
  id?: string;
  owner?: string;
  email: string;
  phone: string;
  spotify_id: string;
  name: string;
  location: Location;
  city: string;
  country: string;
  description: string;
  image: string;
  links: Link[];
};

type Song = {
  id?: string;
  name?: string;
  artist?: string;
  playCount?: number;
};

// type PlaylistType = "private" | "public";

type RevenueSharingModel = "collective" | "individual";

type PlaylistDTO = {
  id?: string;
  name?: string;
  description?: string;
  owner?: string;
  type?: string;
  revenueSharingModel?: RevenueSharingModel;
  revenueCutPercentage?: number;
  songs?: Song[];
  createdAt?: string;
  updatedAt?: string;
};

const MusicLibrary: React.FC = () => {
  const [folderPath, setFolderPath] = useState<string>("");
  const [newLibName, setNewLibName] = useState<string>("");
  const [libraries, setLibraries] = useState<SongLibrary[]>([]);
  // const [matches, setMatches] = useState<SongLibrary[]>([]);
  // const [searchTerm, setSearchTerm] = useState<string>("");

  const [libraryContents, setLibraryContents] = useState<SongLibrary[]>([]);
  const [placeLinks, setPlaceLinks] = useState<Link[]>([]);

  const [selectedSong, setSelectedSong] = useState<string>("");
  const [selectedLibrary, setSelectedLibrary] = useState<string>("");
  const [selectedFilePath, setSelectedFilePath] = useState<string>("");
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [isLibNameUpdateInputVisible, setIsLibNameUpdateInputVisible] =
    useState(false);

  const [queue, setQueue] = useState<Set<SongLibrary>>(new Set()); // Step 1: Define queue state as a Set

  const [isLibraryView, setIsLibraryView] = useState<boolean>(true); // Track whether to display libraries or places

  const [selectedPlace, setSelectedPlace] = useState<string>("");
  const [updateLibName, setUpdateLibName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isQueuePanelOpen, setIsQueuePanelOpen] = useState(false); // New state for queue panel

  const [places, setPlaces] = useState<PlaceDTO[]>([]);
  const [selectedPlaceContent, setSelectedPlaceContent] = useState<
    PlaylistDTO[]
  >([]);

  useEffect(() => {
    GetPlaces()
      .then((x) => setPlaces(x))
      .catch((error) => {
        console.error("Error fetching places:", error);
      });
  }, []);

  useEffect(() => {
    if (!isLibraryView) {
      GetPlaces()
        .then((x) => setPlaces(x))
        .catch((error) => {
          console.error("Error fetching places:", error);
        });
    }
  }, [isLibraryView, selectedPlace]);

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
      if (folderPath.length > 0) {
        setFolderPath(folderPath);
        CreateLibrary({
          name: newLibName,
          path: folderPath,
        }).then(() => {
          ListLibraries().then((libraries) => {
            setLibraries(libraries);
            setSelectedLibrary(newLibName);
            setIsInputVisible(false);
            setNewLibName("");
          });
        });
      }
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

  const handleLibNameUpdateInputKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      // handleUpdateLibraryName(selectedLibrary, updateLibName);
      console.log("new Enter event detected. ");
      console.log("newLibName", updateLibName);
      //       setSelectedLibrary(updateLibName); // update name.
      //       console.log("setting newLibName as selectedLibrary.  ");
      // setIsEditing(false)
      //       setIsLibNameUpdateInputVisible(false);
      UpdateLibraryName(selectedLibrary, updateLibName).then(() => {
        ListLibraries().then((libraries) => {
          setSelectedLibrary(updateLibName); // update name.
          setUpdateLibName("");
          console.log("setting newLibName as selectedLibrary.  ");
          setIsEditing(false);
          setIsLibNameUpdateInputVisible(false);
          setLibraries(libraries);
        });
      });
      // setNewLibName("");
    }
  };

  const handleLibNameUpdateInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // event.preventDefault()
    // event.stopPropagation(); // Stop event propagation
    console.log("@handleLibNameUpdateInputChange");
    setIsEditing(true);
    console.log("event.target.value: ", event.target.value);
    setUpdateLibName(event.target.value);
  };

  const handleLibraryClick = (name: string, path: string) => {
    setSelectedLibrary(name);
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

    RemoveLibraryDialog().then((selection) => {
      if (selection === "yes") {
        RemoveLibrary(libName).then(() => {
          ListLibraries().then((libraries) => setLibraries(libraries));
        });
      }
    });
  };

  const handleAddToQueue = (item: SongLibrary) => {
    setQueue((prevQueue) => {
      const newQueue = new Set(prevQueue);
      newQueue.add(item);
      return newQueue;
    });
  };

  const handleGetPlaceContent = (id: string) => {
    if (id) {
      GetPlayListsOfPlace(id).then((x) => {
        setSelectedPlaceContent(x);
      });
    }
  };

  // TESTING: Log the queue & size whenever the queue state changes
  useEffect(() => {
    console.log(queue);
    console.log("number of songs in the queue now: ", queue.size);
  }, [queue]);
  ///////////////////////////////////////////////////////////////

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isLibNameUpdateInputVisible) {
        setIsLibNameUpdateInputVisible(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLibNameUpdateInputVisible]);

  const toggleInputVisibility = () => {
    setIsInputVisible((prevIsInputVisible) => !prevIsInputVisible);
  };

  const toggleLibNameUpdateInputVisibility = () => {
    console.log("toggling LibNameUpdateInputVisibility");
    setIsLibNameUpdateInputVisible(
      (previousLibNameUpdateInputVisible) => !previousLibNameUpdateInputVisible
    );
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
            <FontAwesomeIcon icon={faMusic} size="lg" />
          </button>
          <button
            className={!isLibraryView ? "active-tab" : ""}
            onClick={togglePlacesView}
          >
            <FontAwesomeIcon icon={faEarth} size="lg" />
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
        {/* <h3 style={{fontSize:"6rem", color: "black"}}> {isQueuePanelOpen ? "yes": "no"}</h3>  */}
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
                  key={place.id}
                  onClick={() => {
                    setSelectedPlace(place.name);
                    // setPlaceLinks(place.links);
                    if (place.id) {
                      handleGetPlaceContent(place.id);
                    }
                  }}
                  className={
                    selectedPlace === place.name ? "selected-place" : ""
                  }
                >
                  {place.name}
                </li>
              ))}
        </ul>
      </div>

      <div id="rightPanel">
        {isLibraryView ? (
          <>
            {selectedLibrary !== "" && (
              <div id="rp-topnav">
                {isLibNameUpdateInputVisible ? (
                  <div className="update-library-input-container">
                    <input
                      id="update-library-input"
                      type="text"
                      value={isEditing ? updateLibName : selectedLibrary}
                      onChange={handleLibNameUpdateInputChange}
                      onKeyDown={handleLibNameUpdateInputKeyPress}
                    />
                    <FontAwesomeIcon
                      icon={faTurnDown}
                      className={"turndown-icon"}
                      size="lg"
                    />
                  </div>
                ) : (
                  <div className="pre-update-library-input-container">
                    <span>{selectedLibrary}</span>
                    <FontAwesomeIcon
                      icon={faEdit}
                      className={"update-library-btn"}
                      size="lg"
                      onClick={() => toggleLibNameUpdateInputVisibility()}
                    />
                  </div>
                )}

                <FontAwesomeIcon
                  icon={faTrash}
                  className={"remove-library-btn"}
                  size="lg"
                  onClick={() => handleRemoveLibrary(selectedLibrary)}
                />
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
                      size="xl"
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
                {selectedPlace && selectedPlaceContent.length > 0 &&
                  selectedPlaceContent.map((playlist) => (
                    <li
                      key={playlist.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                      // onClick={() =>
                      //   item.isPlaylist
                      //     ? handlePlaylistClick(item.path)
                      //     : handleSongClick(item)
                      // }
                    >
                      <span>{playlist.name}</span>
                      <span>{playlist.songs?.length} songs</span>
                    </li>
                  ))}
              </ul>
            </>
          )}
        </ul>
      </div>

      <QueuePanel
        queue={queue}
        isOpen={isQueuePanelOpen} // Pass the state to the QueuePanel component
        setSelectedSongName={setSelectedSong}
      />

      <Player
        songName={selectedSong}
        setSelectedSongName={setSelectedSong}
        filePath={selectedFilePath}
        libName={selectedLibrary}
        queue={queue}
        setQueue={setQueue}
        setIsQueuePanelOpen={setIsQueuePanelOpen}
      />
      {/* <div id="queuePanel" className="hidden"></div>
      <div id="historyPanel" className="hidden"></div> */}
    </>
  );
};

export default MusicLibrary;
