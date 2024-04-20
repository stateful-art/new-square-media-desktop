import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPlus,
  faEdit,
  faTurnDown,
  faMusic,
  faEarth,
  faLock,
  faComputer,
  faRss,
  faHeart,
  faMinus,
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

import SpotifyIcon from "../../assets/icons/spotify-icon.png"; // Import Spotify SVG icon
import YoutubeIcon from "../../assets/icons/youtube-icon.png"; // Import Spotify SVG icon

import { GetPlaces } from "../../../wailsjs/go/place/Place";
import { GetPlayListsOfPlace } from "../../../wailsjs/go/playlist/Playlist";

import Player from "../Player/Player";
import QueuePanel from "../QueuePanel/QueuePanel";
import PlaceMap from "../PlaceMap/PlaceMap";
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

export type Location = {
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
  _id?: string;
  name?: string;
  description?: string;
  owner?: string;
  type?: string;
  content_source?: string;
  revenue_sharing_model?: string;
  revenue_cut_percentage?: number;
  songs?: Song[];
  url?: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
};

type PlaceSummary = {
  name: string;
  description: string;
  numberOfPlaylists?: number;
  numberOfSongs?: number;
  location: Location;
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
  const [isMapView, setIsMapView] = useState<boolean>(false);
  const [selectedPlace, setSelectedPlace] = useState<string>("");
  const [updateLibName, setUpdateLibName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isQueuePanelOpen, setIsQueuePanelOpen] = useState(false); // New state for queue panel
  const [isPausable, setIsPausable] = useState(true);
  const [places, setPlaces] = useState<PlaceDTO[]>([]);
  const [selectedPlaceContent, setSelectedPlaceContent] = useState<
    PlaylistDTO[]
  >([]);

  const [placeSummary, setPlaceSummary] = useState<PlaceSummary>();

  // Add state variable to track input field focus state
  const [isInputFieldFocused, setIsInputFieldFocused] = useState(false);

  // Event handler to handle input field focus
  const handleInputFieldFocus = () => {
    setIsInputFieldFocused(true);
    console.log("@handleInputFieldFocus, IsInputFieldFocused >> TRUE ");
  };

  // Event handler to handle input field blur
  const handleInputFieldBlur = () => {
    setIsInputFieldFocused(false);
    console.log("@handleInputFieldBlur, IsInputFieldFocused >> FALSE ");
  };

  useEffect(() => {
    GetPlaces()
      .then((x) => setPlaces(x))
      .catch((error) => {
        console.error("Error fetching places:", error);
      });
  }, []);

  // useEffect(() => {
  //   // console.log("seems isInputVisible or isLibNameUpdateInputVisible updated. ")
  //   if (isEditing) {
  //     console.log("isInputVisible || isLibNameUpdateInputVisible")
  //     console.log("setIsPausable to false...")
  //     setIsPausable(false);

  //   } else {
  //     console.log("setIsPausable to true...")

  //     setIsPausable(true);
  //   }
  // }, [isInputVisible, isLibNameUpdateInputVisible]);

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
    // setIsEditing(true);
    // setIsEditing((prevState) => !prevState);

    setNewLibName(event.target.value);
  };

  const handleInputKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      handleFolderSelect();
      // setIsEditing(false)
      // setIsEditing((prevState) => !prevState);

      setIsInputVisible(false);
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
      setIsEditing(false);
      //       setIsLibNameUpdateInputVisible(false);
      UpdateLibraryName(selectedLibrary, updateLibName).then(() => {
        ListLibraries().then((libraries) => {
          setSelectedLibrary(updateLibName); // update name.
          setUpdateLibName("");
          console.log("setting newLibName as selectedLibrary.  ");
          // setIsEditing(false);
          // setIsLibNameUpdateInputVisible(false);
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

  const handleRemoveFromQueue = (item: SongLibrary) => {
    setQueue((prevQueue) => {
       const newQueue = new Set(prevQueue);
       newQueue.delete(item);
       return newQueue;
    });
   };

   const isSongInQueue = (songName: string): boolean => {
    return Array.from(queue).some(item => item.name === songName);
   };
   
   

  const getMapLink = (location: Location | undefined) => {
    console.log(location);
  };

  const handleGetPlaceContent = (
    id: string,
    name: string,
    description: string,
    location: Location
  ) => {
    if (id) {
      GetPlayListsOfPlace(id).then((x) => {
        console.log(x);
        setSelectedPlaceContent(x);

        // summary.numberOfPlaylists = x.length;
        // summary.numberOfSongs = sumNumberOfSongs(x);
        setPlaceSummary({
          name: name,
          description: description,
          location: location,
          numberOfPlaylists: x.length,
          numberOfSongs: sumNumberOfSongs(x),
        });
      });
    }
  };

  function sumNumberOfSongs(playlists: PlaylistDTO[]) {
    let totalSongs = 0;
    playlists.forEach((playlist) => {
      if (playlist.songs) totalSongs += playlist.songs.length;
    });
    return totalSongs;
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isInputVisible) {
        setIsInputVisible(false);
        setIsInputFieldFocused(false);
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
        setIsInputFieldFocused(false);
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

  const toggleMapView = () => {
    console.log("@toggleMapView")

    console.log(isMapView ? "closing map": "opening map")

    setIsMapView((prev) => !prev);
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
          <div>
            {/* <input
              id="libraryInput"
              type="text"
              value={newLibName}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyPress}
              onFocus={(e) => e.target.select()} // Select all text when the input field is focused
              placeholder="new library name"
            /> */}
            <input
              id="libraryInput"
              type="text"
              value={newLibName}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyPress}
              onFocus={handleInputFieldFocus} // Update onFocus event handler
              onBlur={handleInputFieldBlur} // Add onBlur event handler
              placeholder="new library name"
            />
          </div>
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
                  onClick={(e) => {
                    e.preventDefault();
                    handleLibraryClick(library.name, library.path);
                  }}
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
                    setIsMapView(false);
                    setSelectedPlace(place.name);
                    // setPlaceSummary({
                    //   // name: place.name,
                    //   description: place.description,
                    //   location: place.location,
                    // });
                    if (place.id) {
                      handleGetPlaceContent(
                        place.id,
                        place.name,
                        place.description,
                        place.location
                      );
                    }
                  }}
                  className={
                    selectedPlace === place.name ? "selected-place" : ""
                  }
                >
                  <FontAwesomeIcon
                    className="place-onair-icon"
                    icon={faRss}
                    size="1x"
                  />
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
                      onFocus={handleInputFieldFocus} // Update onFocus event handler
                      onBlur={handleInputFieldBlur} // Add onBlur event handler
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
            {isMapView ? (
              <>
                <div id="rp-topnav">
                  {/* <span>{selectedPlace}</span> */}
                  <span>
                    <strong>{selectedPlace}</strong>
                  </span>
                  <span style={{ fontSize: "1rem" }}>
                    {placeSummary?.description}
                  </span>
                  <span>
                    <strong>{placeSummary?.numberOfSongs} </strong>songs in{" "}
                    <strong>{placeSummary?.numberOfPlaylists}</strong> playlists
                  </span>
                  {/* <FontAwesomeIcon
                    className="add-place-to-favorite"
                    icon={faHeart}
                    size="lg"
                    onClick={() => {
                      // getMapLink(placeSummary?.location)
                      setIsMapView(true);
                    }}
                  /> */}
                   <FontAwesomeIcon
                  className="see-on-map-icon"
                  icon={faEarth}
                  size="lg"
                  onClick={() => toggleMapView()}
                />
                </div>
                {placeSummary?.location.coordinates[0] &&
                  placeSummary?.location.coordinates[1] && (
                    <PlaceMap
                      latitude={placeSummary?.location.coordinates[0]}
                      longitude={placeSummary?.location.coordinates[1]}
                    />
                  )}
                {/* <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d102151.86512015607!2d30.645754971289048!3d36.86053528674207!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2str!4v1713560897050!5m2!1sen!2str"
                  // width="600"
                  // height="450"
                  style={{ border: "0" }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>{" "} */}
                
              </>
            ) : (
              <div id="rp-topnav">
                {/* <span>{selectedPlace}</span> */}
                <span>
                  <strong>{selectedPlace}</strong>
                </span>
                <span style={{ fontSize: "1rem" }}>
                  {placeSummary?.description}
                </span>
                <span>
                  <strong>{placeSummary?.numberOfSongs} </strong>songs in{" "}
                  <strong>{placeSummary?.numberOfPlaylists}</strong> playlists
                </span>
                <FontAwesomeIcon
                  className="see-on-map-icon"
                  icon={faEarth}
                  size="lg"
                  onClick={() => toggleMapView()}
                />
              </div>
            )}
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
        <>
          {!isSongInQueue(item.name) && (
            <FontAwesomeIcon
              className={"add-queue-btn"}
              icon={faPlus}
              size="xl"
              onClick={(e) => {
                e.stopPropagation(); // Stop event propagation
                handleAddToQueue(item);
              }}
            />
          )}
          {isSongInQueue(item.name) && (
            <FontAwesomeIcon
              className={"remove-queue-btn"}
              icon={faMinus}
              size="xl"
              onClick={(e) => {
                e.stopPropagation(); // Stop event propagation
                handleRemoveFromQueue(item);
              }}
            />
          )}
        </>
      )}
                  {/* {!item.isFolder && !isSongInQueue(item.name) &&   (
                      
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
                  )} */}






                </li>
              ))}
            </>
          ) : (
            <>
              <div className="playlist-container">
                {selectedPlace &&
                  selectedPlaceContent.length > 0 &&
                  selectedPlaceContent.map((playlist) => (
                    <div className="playlist-card">
                      <div className="card-content">
                        <img
                          src={playlist.image}
                          alt="Playlist Image"
                          className="playlist-image"
                        />
                        <h3 className="playlist-name">{playlist.name}</h3>
                        <p className="song-count">
                          {playlist.songs?.length} songs
                        </p>
                        <p className="description">{playlist.description}</p>
                      </div>
                      <span className="playlist-type-icon">
                        {playlist.type === "private" ? (
                          <FontAwesomeIcon icon={faLock} size="lg" />
                        ) : (
                          <FontAwesomeIcon icon={faEarth} size="lg" />
                        )}
                      </span>

                      <span className="content-source-icon">
                        {playlist.content_source === "spotify" ? (
                          <img src={SpotifyIcon} width={"24px"}></img>
                        ) : playlist.content_source === "youtube" ? (
                          <img src={YoutubeIcon} width={"30px"}></img>
                        ) : (
                          <FontAwesomeIcon icon={faComputer} size="lg" />
                        )}
                      </span>
                    </div>
                  ))}
              </div>
            </>
          )}
        </ul>
      </div>

      <QueuePanel
        queue={queue}
        isOpen={isQueuePanelOpen} // Pass the state to the QueuePanel component
        setSelectedSongName={setSelectedSong}
        setSelectedFilePath={setSelectedFilePath}
      />

      <Player
        songName={selectedSong}
        setSelectedSongName={setSelectedSong}
        filePath={selectedFilePath}
        libName={selectedLibrary}
        queue={queue}
        isPausable={isPausable}
        isInputFieldFocused={isInputFieldFocused} // Pass focus state as a prop
        setQueue={setQueue}
        setIsQueuePanelOpen={setIsQueuePanelOpen}
      />
      {/* <div id="queuePanel" className="hidden"></div>
      <div id="historyPanel" className="hidden"></div> */}
    </>
  );
};

export default MusicLibrary;
