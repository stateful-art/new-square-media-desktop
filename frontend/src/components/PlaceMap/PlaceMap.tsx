import React, { useEffect, useState } from "react";
import ReactMapGL, {
  ViewState,
  MapboxMap,
  Marker,
} from "react-map-gl";
import "./PlaceMap.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css"; // Import FontAwesome CSS

interface PlaceMapProps {
  latitude: number;
  longitude: number;
}

// interface MapSize {
//   width: number;
//   height: number;
// }

const PlaceMap: React.FC<PlaceMapProps> = ({ latitude, longitude }) => {
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

  const handleViewportChange = (newViewport: ViewState) => {
    setViewport(newViewport);
    if (newViewport.zoom >= 14) {
      setIsMarkerVisible(true);
    } else {
      setIsMarkerVisible(false);
    }
  };

//   useEffect(() => {
//     // Update the viewport state when latitude or longitude changes
//     setViewport((prevViewport) => ({
//       ...prevViewport,
//       latitude: latitude,
//       longitude: longitude,
//     }));
//  }, [latitude, longitude]);


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
        {isMarkerVisible && (
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
            <FontAwesomeIcon icon={faLocationDot} size="xl" color="#f21d1d" />
          </Marker>
        )}
      </ReactMapGL>
    </div>
  );
};

export default PlaceMap;
