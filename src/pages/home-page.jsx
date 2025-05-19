import React from "react";
import MapComponent from "@/components/map-component";

const HomePage = ({ mapboxAccessToken }) => {
  return (
    <div className="relative h-full w-full border-4 border-red-500">
      <MapComponent mapboxAccessToken={mapboxAccessToken} />
    </div>
  );
};

export default HomePage;
