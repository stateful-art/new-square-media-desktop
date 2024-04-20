import React, { useState, useEffect } from "react";
import ReactMapGL, { ViewState, MapboxEvent, MapboxMap } from "react-map-gl";
import "./PlaceMap.css";

interface PlaceMapProps {
  latitude: number;
  longitude: number;
}

const PlaceMap: React.FC<PlaceMapProps> = ({ latitude, longitude }) => {
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_KEY;
  const [viewport, setViewport] = useState<ViewState>({
    latitude: latitude,
    longitude: longitude,
    zoom: 10,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, left: 0, bottom: 0, right: 0 },
  });

  const handleViewportChange = (newViewport: ViewState) => {
    setViewport(newViewport);
  };

  const handleMapLoad = (map: MapboxMap) => {
    map.flyTo({
      center: [longitude, latitude],
      zoom: 15, // Set the desired zoom level
      speed: 0.5, // Adjust the speed of the animation
      curve: 1, // Adjust the curve of the animation
      essential: true, // Ensure the animation is considered essential
    });
  };

  return (
    <div id="place-map">
      <ReactMapGL
        {...viewport}
        onLoad={(e) => handleMapLoad(e.target)}
        onZoom={(e) => handleViewportChange(e.viewState)}
        onDrag={(e) => handleViewportChange(e.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
      />
    </div>
  );
};

export default PlaceMap;
