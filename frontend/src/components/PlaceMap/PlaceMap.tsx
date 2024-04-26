import React, { useEffect, useState } from "react";
import ReactMapGL, { ViewState, MapboxMap, Marker } from "react-map-gl";
import "./PlaceMap.css";
import { PlaceDTO } from "../MusicLibrary/MusicLibrary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationArrow,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css"; // Import FontAwesome CSS

interface PlaceMapProps {
  latitude: number;
  longitude: number;
  nearbies: PlaceDTO[];
}

// interface MapSize {
//   width: number;
//   height: number;
// }

const PlaceMap: React.FC<PlaceMapProps> = ({
  latitude,
  longitude,
  nearbies,
}) => {
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_KEY;
  const [viewport, setViewport] = useState<ViewState>({
    latitude: latitude,
    longitude: longitude,
    zoom: 4,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, left: 0, bottom: 0, right: 0 },
  });
  const [isMarkerVisible, setIsMarkerVisible] = useState<boolean>(false);
  const [map, setMap] = useState<MapboxMap>();
  // const [mapSize, setMapSize] = useState({ width: 0, height: 0 });

  const isNavigatedPlace = (place: PlaceDTO) => {
    return (
      place.location.coordinates[0] === latitude &&
      place.location.coordinates[1] === longitude
    );
  };

  const handleViewportChange = (newViewport: ViewState) => {
    setViewport(newViewport);
    if (newViewport.zoom >= 16) {
      setIsMarkerVisible(true);
    } else {
      setIsMarkerVisible(false);
    }
  };

  useEffect(() => {
    // Update the viewport state to "fly" to the new location
    setViewport({
      ...viewport,
      latitude: latitude,
      longitude: longitude,
    });
  }, [latitude, longitude]); // Depend on latitude and longitude

  const handleMapLoad = (map: MapboxMap) => {
    map.flyTo({
      center: [longitude, latitude],
      zoom: 18, // Set the desired zoom level
      speed: 1, // Adjust the speed of the animation
      curve: 1, // Adjust the curve of the animation
      essential: true, // Ensure the animation is considered essential
    });
    setMap(map);
  };

  useEffect(() => {
    // Check if the map instance is available
    if (map) {
      // Use the map instance to "fly to" the new location
      map.flyTo({
        center: [longitude, latitude],
        zoom: 18, // Set the desired zoom level
        speed: 1, // Adjust the speed of the animation
        curve: 1, // Adjust the curve of the animation
        essential: true, // Ensure the animation is considered essential
      });
    }
  }, [latitude, longitude, map]); // Depend on latitude, longitude, and map

  return (
    <div id="place-map">
      <ReactMapGL
        {...viewport}
        onLoad={(e) => handleMapLoad(e.target)}
        // onResize={handleResize}
        onZoom={(e) => handleViewportChange(e.viewState)}
        onDrag={(e) => handleViewportChange(e.viewState)}
        mapStyle="mapbox://styles/streamerd/ck7mims3100xy1jpq77d2txs6"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        {isMarkerVisible &&
          (nearbies.length === 1 ? (
            <Marker
              style={{ display: `${isMarkerVisible}` }}
              latitude={latitude}
              longitude={longitude}
              offset={
                map?.getContainer
                  ? [
                      -1 * map?.getContainer()?.offsetLeft,
                      -1 * map?.getContainer()?.offsetHeight,
                    ]
                  : [0, 0]
              }
            >
              <FontAwesomeIcon
                icon={faLocationArrow}
                size="2xl"
                color="#f21d1d"
              />
            </Marker>
          ) : (
            nearbies.map((place, index) => (
              <Marker
                style={{ display: `${isMarkerVisible}` }}
                latitude={place.location.coordinates[0]}
                longitude={place.location.coordinates[1]}
                offset={
                  map?.getContainer
                    ? [
                        -1 * map?.getContainer()?.offsetLeft,
                        -1 * map?.getContainer()?.offsetHeight,
                      ]
                    : [0, 0]
                }
              >
                <FontAwesomeIcon
                  icon={
                    isNavigatedPlace(place) ? faLocationArrow : faLocationDot
                  }
                  size={isNavigatedPlace(place) ? "2x" : "xl"}
                  color={isNavigatedPlace(place) ? "#f21d1d" : "#3254b9"}
                />
              </Marker>
            ))
          ))}
      </ReactMapGL>
    </div>
  );
};

export default PlaceMap;
