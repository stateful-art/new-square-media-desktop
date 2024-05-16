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
  faMinus,
} from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css";

import "./MusicLibrary.css";
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

import SpotifyIcon from "../../assets/icons/spotify-icon.png";
import YoutubeIcon from "../../assets/icons/youtube-icon.png";

import { GetPlaces, GetNearbyPlaces } from "../../../wailsjs/go/place/Place";
import { GetPlayListsOfPlace } from "../../../wailsjs/go/playlist/Playlist";

import Player from "../Player/Player";
import QueuePanel from "../QueuePanel/QueuePanel";
import PlaceMap from "../PlaceMap/PlaceMap";

export type SongLibrary = {
  name: string;
  path: string;
  isFolder?: boolean;
  path_changed?:boolean;
};

export type Location = {
  type: string;
  coordinates: number[];
};

type Link = {
  platform: string;
  url: string;
};

export type PlaceDTO = {
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
  const [libraryContents, setLibraryContents] = useState<SongLibrary[]>([]);
  const [selectedSong, setSelectedSong] = useState<string>("");
  const [selectedLibrary, setSelectedLibrary] = useState<string>("");
  const [selectedFilePath, setSelectedFilePath] = useState<string>("");
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [isLibNameUpdateInputVisible, setIsLibNameUpdateInputVisible] =
    useState(false);
  const [queue, setQueue] = useState<Set<SongLibrary>>(new Set());
  const [isLibraryView, setIsLibraryView] = useState<boolean>(true);
  const [isMapView, setIsMapView] = useState<boolean>(false);
  const [selectedPlace, setSelectedPlace] = useState<string>("");
  const [updateLibName, setUpdateLibName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isQueuePanelOpen, setIsQueuePanelOpen] = useState(false);
  const [places, setPlaces] = useState<PlaceDTO[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<PlaceDTO[]>([]);
  const [selectedPlaceContent, setSelectedPlaceContent] = useState<
    PlaylistDTO[]
  >([]);
  const [placeSummary, setPlaceSummary] = useState<PlaceSummary>();

  const [isInputFieldFocused, setIsInputFieldFocused] = useState(false);
  const [isLibPathChanged, setIsLibPathChanged] = useState(false);

  
  useEffect(() => {
    console.log("@ Parent >> ", queue);
    
  }, [queue]);

  const handleInputFieldFocus = () => {
    setIsInputFieldFocused(true);
  };

  const handleInputFieldBlur = () => {
    setIsInputFieldFocused(false);
  };

  useEffect(() => {
    GetPlaces().then(setPlaces).catch(console.error);
  }, [isLibraryView, selectedPlace]);

  useEffect(() => {
    LoadLibraries().then(() => {
      setNewLibName("");
      ListLibraries().then(setLibraries);
    });
  }, []);

  useEffect(() => {
    ListLibraryContents(selectedLibrary, folderPath).then(setLibraryContents);
  }, [folderPath]);

  const handleFolderSelect = async () => {
    try {
      const folderPath = await OpenFolderDialog();
      if (folderPath.length > 0) {
        setFolderPath(folderPath);
        CreateLibrary({
          name: newLibName,
          path: folderPath,
          path_changed: false,
        }).then(() => {
          ListLibraries()
            .then((libraries) => {
              setLibraries(libraries);
              setSelectedLibrary(newLibName);
              setNewLibName("");
              setIsInputVisible(false);
            })
            .then(() => {
              ListLibraryContents(newLibName, folderPath).catch(err =>
                console.log(err)
              );
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
      setIsInputVisible(false);
      setNewLibName("");
    }
  };

  const handleLibNameUpdateInputKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      console.log("new Enter event detected. ");
      console.log("newLibName", updateLibName);
      setIsEditing(false);
      UpdateLibraryName(selectedLibrary, updateLibName).then(() => {
        ListLibraries().then((libraries) => {
          setSelectedLibrary(updateLibName); // update name.
          setUpdateLibName("");
          setIsLibNameUpdateInputVisible(false);
          setIsInputFieldFocused(false);
          console.log("setting newLibName as selectedLibrary.  ");

          setLibraries(libraries);
        });
      });
    }
  };

  const handleLibNameUpdateInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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

  const handleSongClick = (item: SongLibrary) => {
    setSelectedSong(item.name);
    setSelectedFilePath(item.path);
    handlePrependToQueue(item);
    
  };

  const handleRemoveLibrary = (libName: string) => {
    RemoveLibraryDialog().then((selection) => {
      if (selection === "yes") {
        RemoveLibrary(libName).then(() => {
          ListLibraries().then((libraries) => setLibraries(libraries));
          setLibraryContents([]);
          setSelectedLibrary("");
        });
      }
    });
  };

  const handleAddToQueue = (item: SongLibrary) => {
    console.log("@handleAddToQueue")
    setQueue((prevQueue) => {
      const newQueue = new Set(prevQueue);
      newQueue.add(item);
      console.log("newQueueSize >>", newQueue.size)
      if(prevQueue.size == 0) {
        setIsQueuePanelOpen(true)
      }
      return newQueue;
    });
  };
  
  
  const handlePrependToQueue = (item: SongLibrary) => {
     console.log("@handlePrependToQueue")
    setQueue((prevQueue) => {
       // Convert the Set to an array
       const queueArray = Array.from(prevQueue);
       // Add the new item to the beginning of the array
       queueArray.unshift(item);
       // Convert the array back to a Set
       const newQueue = new Set(queueArray);
       console.log("newQueueSize >>", newQueue.size)

       if(prevQueue.size == 0) {
        setIsQueuePanelOpen(true)
      }
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
    return Array.from(queue).some((item) => item.name === songName);
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

  const handleGetNearbyPlaces = (lat: number, long: number) => {
    GetNearbyPlaces(lat.toString(), long.toString()).then((nearbies) =>
      setNearbyPlaces(nearbies)
    );
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
    setIsMapView((prev) => !prev);
  };

  const toggleLibNameUpdateInputVisibility = () => {
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

        {/* <SearchBar onSearch={handleSearch} /> */}

        {isInputVisible ? (
          <div>
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
                    // setIsMapView(false);
                    console.log("new place selected. ");
                    if (place.id) {
                      console.log("getting place content for : ", place.id);

                      setSelectedPlace(place.name);
                      handleGetPlaceContent(
                        place.id,
                        place.name,
                        place.description,
                        place.location
                      );

                      handleGetNearbyPlaces(
                        place.location.coordinates[0],
                        place.location.coordinates[1]
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
            {selectedLibrary !== "" || isLibPathChanged ? (
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
                    <span onClick={()=> {toggleLibNameUpdateInputVisibility()}}>{selectedLibrary}</span>
                    {/* <FontAwesomeIcon
                      icon={faEdit}
                      className={"update-library-btn"}
                      size="lg"
                      onClick={() => toggleLibNameUpdateInputVisibility()}
                    /> */}
                  </div>
                )}

                <FontAwesomeIcon
                  icon={faTrash}
                  className={"remove-library-btn"}
                  size="lg"
                  onClick={() => handleRemoveLibrary(selectedLibrary)}
                />
              </div>
            ) : (
              <span id="no-lib-selected-to-list">
                Please select a library to display
              </span>
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

                  <FontAwesomeIcon
                    className="see-on-map-icon"
                    icon={faEarth}
                    size="lg"
                    onClick={() => toggleMapView()}
                  />
                </div>

                {placeSummary && (
                  <>
                    <PlaceMap
                      nearbies={nearbyPlaces}
                      latitude={placeSummary.location.coordinates[0]}
                      longitude={placeSummary.location.coordinates[1]}
                    />
                  </>
                )}
              </>
            ) : (
              <>
                {selectedPlace !== "" ? (
                  <div id="rp-topnav">
                    <span>
                      <strong>{selectedPlace}</strong>
                    </span>
                    <span style={{ fontSize: "1rem" }}>
                      {placeSummary?.description}
                    </span>
                    <span>
                      <strong>{placeSummary?.numberOfSongs} </strong>asongs in{" "}
                      <strong>{placeSummary?.numberOfPlaylists}</strong>{" "}
                      playlists
                    </span>
                    <FontAwesomeIcon
                      className="see-on-map-icon"
                      icon={faEarth}
                      size="lg"
                      onClick={() => toggleMapView()}
                    />
                  </div>
                ) : (
                  <span id="no-place-selected-to-list">
                    Please select a place to display
                  </span>
                )}
              </>
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
                      fontStyle:
                       selectedSong === item.name
                      ? "italic"
                      : "normal",
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
      setQueue={setQueue}
      songName={selectedSong}
        queue={queue}
        handleRemoveFromQueue={handleRemoveFromQueue}
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
        isInputFieldFocused={isInputFieldFocused} // Pass focus state as a prop
        setQueue={setQueue}
        setIsQueuePanelOpen={setIsQueuePanelOpen}
      />
    </>
  );
};

export default MusicLibrary;
