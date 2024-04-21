import React, { useState } from "react";
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

  // const handleResize = (e: MapboxEvent) => {

  //   // Access the map instance from the event
  //   const mapInstance = e.target;
  //   const container = mapInstance.getContainer();
  //   const width = container.offsetWidth;
  //   const height = container.offsetHeight;
  //   if (width && height) {
  //     setMapSize({ width, height });
  //   }
  // };
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

  // useEffect(() => {
  //   if (map) {
  //     // Check if the project method is available on the map object
  //     const point = map.project([longitude, latitude]);
  //     console.log(
  //       `Marker is ${mapSize.width - point.x} pixels from the right edge.`
  //     );
  //     console.log(
  //       `Marker is ${mapSize.height - point.y} pixels from the top edge.`
  //     );
  //   } else {
  //     console.error("The map object is not defined.");
  //   }
  // }, [map, mapSize]);

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
