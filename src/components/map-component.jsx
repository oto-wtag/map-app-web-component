import React from "react";
import Map, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

const PinIcon = ({ size = 24, color = "red" }) => (
  <svg
    height={size}
    viewBox="0 0 24 24"
    style={{
      fill: color,
      stroke: "white", // Optional: for better visibility on dark maps
      strokeWidth: 1, // Optional
      cursor: "pointer", // Optional: if you plan to add click events
      // The `transform` helps to position the tip of the pin at the coordinate
      // This is an alternative to using the anchor prop on <Marker> if your icon's
      // visual point isn't naturally at one of the anchor presets.
      // However, for this pin shape, anchor="bottom" on <Marker> is often preferred.
      // transform: `translate(${-size / 2}px, ${-size}px)`
    }}
  >
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
  </svg>
);

const MapComponent = ({ mapboxAccessToken }) => {
  //const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  const locations = [
    {
      id: "lalbagh_fort",
      name: "Lalbagh Fort",
      longitude: 90.3899,
      latitude: 23.7193,
    },
    {
      id: "ahsan_manzil",
      name: "Ahsan Manzil",
      longitude: 90.4048,
      latitude: 23.7088,
    },
    {
      id: "parliament_house",
      name: "National Parliament House",
      longitude: 90.3786,
      latitude: 23.7626,
    },
    {
      id: "dhaka_university",
      name: "Dhaka University",
      longitude: 90.3995,
      latitude: 23.7345,
    },
  ];

  if (!mapboxAccessToken) {
    console.error(
      "Mapbox Access Token is not set. Please set VITE_MAPBOX_ACCESS_TOKEN in your .env file."
    );
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          backgroundColor: "#f0f0f0",
        }}
      >
        <p style={{ color: "red", fontWeight: "bold" }}>
          Configuration Error: Mapbox Access Token is missing.
        </p>
      </div>
    );
  }

  return (
    <Map
      mapboxAccessToken={mapboxAccessToken}
      initialViewState={{
        longitude: 90.4125, // Central Dhaka
        latitude: 23.7803, // Slightly adjusted to better center the sample markers
        zoom: 12, // Adjusted zoom to make sure markers are visible
      }}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
      }} // Make the map take the full viewport
      //mapStyle="mapbox://styles/mapbox/streets-v12" // Default Mapbox street style
      mapStyle="mapbox://styles/faizajarin12/cm8pfng64006y01sh6hjsgmc6"
    >
      {locations.map((location) => (
        <Marker
          key={location.id}
          longitude={location.longitude}
          latitude={location.latitude}
          anchor="bottom" // Adjusted anchor to bottom for better pin placement
        >
          <PinIcon size={30} color="red" />
        </Marker>
      ))}
    </Map>
  );
};

export default MapComponent;
