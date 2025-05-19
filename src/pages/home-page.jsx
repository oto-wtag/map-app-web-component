import React from "react";
import MapComponent from "@/components/map-component"; // Ensure alias @ works or use relative path

// const HomePage = ({ mapboxAccessToken }) => { // Accept the prop
//   return (
//     <div className="relative h-full w-full">
//       {/* Pass the token to MapComponent */}
//       <MapComponent mapboxAccessToken={mapboxAccessToken} />
//     </div>
//   );
// };

// Simpler structure if HomePage is just a passthrough for MapComponent props
const HomePage = ({ mapboxAccessToken }) => {
  return (
    <div className="relative h-full w-full">
      {/* Ensure this div takes full height/width */}
      <MapComponent mapboxAccessToken={mapboxAccessToken} />
    </div>
  );
};

export default HomePage;
