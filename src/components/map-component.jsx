// import React, { useRef, useCallback, useMemo } from "react";
// import Map, { Marker, Source, Layer } from "react-map-gl/mapbox";
// import "mapbox-gl/dist/mapbox-gl.css";

// const allLocations = [
//   // Dhaka
//   {
//     id: "lalbagh_fort",
//     name: "Lalbagh Fort",
//     longitude: 90.3899,
//     latitude: 23.7193,
//   },
//   {
//     id: "ahsan_manzil",
//     name: "Ahsan Manzil",
//     longitude: 90.4048,
//     latitude: 23.7088,
//   },
//   {
//     id: "parliament_house",
//     name: "National Parliament House",
//     longitude: 90.3786,
//     latitude: 23.7626,
//   },
//   {
//     id: "dhaka_university",
//     name: "Dhaka University",
//     longitude: 90.3995,
//     latitude: 23.7345,
//   },
//   {
//     id: "hatirjheel",
//     name: "Hatirjheel",
//     longitude: 90.3973,
//     latitude: 23.7498,
//   },
//   {
//     id: "gulshan_lake_park",
//     name: "Gulshan Lake Park",
//     longitude: 90.4163,
//     latitude: 23.7925,
//   },
//   {
//     id: "banani_11",
//     name: "Banani Road 11",
//     longitude: 90.4078,
//     latitude: 23.794,
//   },
//   {
//     id: "uttara_sector_10_park",
//     name: "Uttara Sector 10 Park",
//     longitude: 90.397,
//     latitude: 23.87,
//   },
//   { id: "mirpur_zoo", name: "Mirpur Zoo", longitude: 90.35, latitude: 23.8 },
//   { id: "new_market", name: "New Market", longitude: 90.386, latitude: 23.73 },

//   // Chittagong
//   { id: "foy_lake", name: "Foy's Lake", longitude: 91.79, latitude: 22.36 },
//   {
//     id: "patenga_beach",
//     name: "Patenga Beach",
//     longitude: 91.7833,
//     latitude: 22.2833,
//   },
//   {
//     id: "ctg_war_cemetery",
//     name: "Chittagong War Cemetery",
//     longitude: 91.8167,
//     latitude: 22.35,
//   },
//   {
//     id: "batali_hill",
//     name: "Batali Hill",
//     longitude: 91.82,
//     latitude: 22.355,
//   },
//   {
//     id: "kaptai_lake_ctg_view",
//     name: "Kaptai Lake (Chittagong View Area)",
//     longitude: 91.83,
//     latitude: 22.37,
//   }, // Fictional, for clustering
//   {
//     id: "agrabad_circle",
//     name: "Agrabad Circle",
//     longitude: 91.8,
//     latitude: 22.33,
//   },

//   // Sylhet
//   {
//     id: "shahjalal_shrine",
//     name: "Shahjalal Shrine",
//     longitude: 91.868,
//     latitude: 24.895,
//   },
//   { id: "jaflong", name: "Jaflong", longitude: 92.0167, latitude: 25.1667 },
//   {
//     id: "ratargul_swamp",
//     name: "Ratargul Swamp Forest",
//     longitude: 91.9833,
//     latitude: 25.0,
//   },
//   { id: "bisnakandi", name: "Bisnakandi", longitude: 91.9, latitude: 25.15 },
//   {
//     id: "syl_shahi_eidgah",
//     name: "Sylhet Shahi Eidgah",
//     longitude: 91.875,
//     latitude: 24.9,
//   },
//   {
//     id: "keen_bridge",
//     name: "Keen Bridge",
//     longitude: 91.8667,
//     latitude: 24.89,
//   },
// ];

// // Define layer styles for clusters and points
// const clusterLayer = {
//   id: "clusters",
//   type: "circle",
//   source: "locations-source", // Make sure this matches the Source ID
//   filter: ["has", "point_count"],
//   paint: {
//     "circle-color": [
//       "step",
//       ["get", "point_count"],
//       "#51bbd6",
//       10,
//       "#f1f075",
//       50,
//       "#f28cb1",
//     ],
//     "circle-radius": ["step", ["get", "point_count"], 15, 10, 20, 50, 25], // point_count < 10 -> 15px, 10 <= point_count < 50 -> 20px, point_count >= 50 -> 25px
//   },
// };

// const clusterCountLayer = {
//   id: "cluster-count",
//   type: "symbol",
//   source: "locations-source",
//   filter: ["has", "point_count"],
//   layout: {
//     "text-field": "{point_count_abbreviated}",
//     "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
//     "text-size": 12,
//   },
//   paint: {
//     "text-color": "#ffffff",
//   },
// };

// const unclusteredPointLayer = {
//   id: "unclustered-point",
//   type: "circle",
//   source: "locations-source",
//   filter: ["!", ["has", "point_count"]],
//   paint: {
//     "circle-color": "#11b4da",
//     "circle-radius": 6,
//     "circle-stroke-width": 1,
//     "circle-stroke-color": "#fff",
//   },
// };

// const MapComponent = ({ mapboxAccessToken }) => {
//   //const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

//   const mapRef = useRef(null);

// Memoize GeoJSON conversion
// const geoJsonData = useMemo(() => {
//   return {
//     type: "FeatureCollection",
//     features: allLocations.map((loc) => ({
//       type: "Feature",
//       properties: { id: loc.id, name: loc.name }, // Add any other properties you need
//       geometry: {
//         type: "Point",
//         coordinates: [loc.longitude, loc.latitude],
//       },
//     })),
//   };
// }, []);

//   // Callback for clicking on the map, specifically for clusters
//   const onClick = useCallback((event) => {
//     if (!mapRef.current) return;

//     const features = event.features;
//     if (features && features.length > 0) {
//       const feature = features[0];
//       // Ensure the clicked feature is from our cluster layer
//       if (feature.layer.id === "clusters") {
//         const clusterId = feature.properties.cluster_id;
//         const mapboxSource = mapRef.current.getSource("locations-source"); // Ensure source ID matches

//         mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
//           if (err) {
//             console.error("Error getting cluster expansion zoom:", err);
//             return;
//           }
//           mapRef.current.easeTo({
//             center: feature.geometry.coordinates,
//             zoom: zoom + 0.5, // Add a little extra zoom
//             duration: 500,
//           });
//         });
//       }
//     }
//   }, []);

//   if (!mapboxAccessToken) {
//     console.error("Mapbox Access Token is not set.");
//     return (
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           height: "100%",
//           backgroundColor: "#f0f0f0",
//         }}
//       >
//         <p style={{ color: "red", fontWeight: "bold" }}>
//           Configuration Error: Mapbox Access Token is missing.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <Map
//       ref={mapRef}
//       mapboxAccessToken={mapboxAccessToken}
//       initialViewState={{
//         longitude: 90.8, // Adjusted to better show Bangladesh
//         latitude: 23.5, // Adjusted to better show Bangladesh
//         zoom: 6.5, // Zoom out to see multiple cities
//       }}
//       style={{
//         width: "100%",
//         height: "100%",
//         position: "relative",
//       }}
//       //mapStyle="mapbox://styles/mapbox/streets-v12" // Using a standard style
//       mapStyle="mapbox://styles/faizajarin12/cm8pfng64006y01sh6hjsgmc6" // Your custom style
//       onClick={onClick}
//       interactiveLayerIds={[clusterLayer.id]} // Important: makes clusters clickable
//     >
//       <Source
//         id="locations-source" // Unique ID for this source
//         type="geojson"
//         data={geoJsonData}
//         cluster={true}
//         clusterMaxZoom={14} // Max zoom to cluster points on
//         clusterRadius={50} // Radius of each cluster when clustering points (defaults to 50)
//       >
//         {/* Layer for the clusters themselves (circles) */}
//         <Layer {...clusterLayer} />
//         {/* Layer for the text count on clusters */}
//         <Layer {...clusterCountLayer} />
//         {/* Layer for unclustered points */}
//         <Layer {...unclusteredPointLayer} />
//       </Source>

//       {/* If you wanted to show custom React <Marker> components for UNCLUSTERED points,
//         you would need a more complex logic:
//         1. Listen to map data events (e.g., 'sourcedata') or moveend.
//         2. Query the 'locations-source' for unclustered points: map.querySourceFeatures('locations-source', { filter: ['!', ['has', 'point_count']] })
//         3. Store these features in React state.
//         4. Render <Marker> components based on this state.
//         This is more involved than using Mapbox GL JS layers directly.
//       */}
//     </Map>
//   );
// };

// export default MapComponent;

import React, { useEffect, useRef, useCallback, useMemo } from "react";
import mapboxgl from "mapbox-gl";
//import Map, { Marker, Source, Layer } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

const allLocations = [
  // Dhaka
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
  {
    id: "hatirjheel",
    name: "Hatirjheel",
    longitude: 90.3973,
    latitude: 23.7498,
  },
  {
    id: "gulshan_lake_park",
    name: "Gulshan Lake Park",
    longitude: 90.4163,
    latitude: 23.7925,
  },
  {
    id: "banani_11",
    name: "Banani Road 11",
    longitude: 90.4078,
    latitude: 23.794,
  },
  {
    id: "uttara_sector_10_park",
    name: "Uttara Sector 10 Park",
    longitude: 90.397,
    latitude: 23.87,
  },
  { id: "mirpur_zoo", name: "Mirpur Zoo", longitude: 90.35, latitude: 23.8 },
  { id: "new_market", name: "New Market", longitude: 90.386, latitude: 23.73 },

  // Chittagong
  { id: "foy_lake", name: "Foy's Lake", longitude: 91.79, latitude: 22.36 },
  {
    id: "patenga_beach",
    name: "Patenga Beach",
    longitude: 91.7833,
    latitude: 22.2833,
  },
  {
    id: "ctg_war_cemetery",
    name: "Chittagong War Cemetery",
    longitude: 91.8167,
    latitude: 22.35,
  },
  {
    id: "batali_hill",
    name: "Batali Hill",
    longitude: 91.82,
    latitude: 22.355,
  },
  {
    id: "kaptai_lake_ctg_view",
    name: "Kaptai Lake (Chittagong View Area)",
    longitude: 91.83,
    latitude: 22.37,
  }, // Fictional, for clustering
  {
    id: "agrabad_circle",
    name: "Agrabad Circle",
    longitude: 91.8,
    latitude: 22.33,
  },

  // Sylhet
  {
    id: "shahjalal_shrine",
    name: "Shahjalal Shrine",
    longitude: 91.868,
    latitude: 24.895,
  },
  { id: "jaflong", name: "Jaflong", longitude: 92.0167, latitude: 25.1667 },
  {
    id: "ratargul_swamp",
    name: "Ratargul Swamp Forest",
    longitude: 91.9833,
    latitude: 25.0,
  },
  { id: "bisnakandi", name: "Bisnakandi", longitude: 91.9, latitude: 25.15 },
  {
    id: "syl_shahi_eidgah",
    name: "Sylhet Shahi Eidgah",
    longitude: 91.875,
    latitude: 24.9,
  },
  {
    id: "keen_bridge",
    name: "Keen Bridge",
    longitude: 91.8667,
    latitude: 24.89,
  },
];

const geoJsonData = useMemo(() => {
  return {
    type: "FeatureCollection",
    features: allLocations.map((loc) => ({
      type: "Feature",
      properties: { id: loc.id, name: loc.name }, // Add any other properties you need
      geometry: {
        type: "Point",
        coordinates: [loc.longitude, loc.latitude],
      },
    })),
  };
}, []);

const MapComponent = ({ mapboxAccessToken }) => {
  const mapContainerRef = useRef();
  const mapRef = useRef();

  useEffect(() => {
    mapboxgl.accessToken = mapboxAccessToken;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/faizajarin12/cm8pfng64006y01sh6hjsgmc6",
      center: [-103.5917, 40.6699],
      zoom: 3,
    });

    mapRef.current.on("load", () => {
      mapRef.current.addSource("earthquakes", {
        type: "geojson",
        data: geoJsonData,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      mapRef.current.addLayer({
        id: "clusters",
        type: "circle",
        source: "earthquakes",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#51bbd6",
            100,
            "#f1f075",
            750,
            "#f28cb1",
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            20,
            100,
            30,
            750,
            40,
          ],
        },
      });

      mapRef.current.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "earthquakes",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
      });

      mapRef.current.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "earthquakes",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#11b4da",
          "circle-radius": 4,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff",
        },
      });

      // inspect a cluster on click
      mapRef.current.on("click", "clusters", (e) => {
        const features = mapRef.current.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        const clusterId = features[0].properties.cluster_id;
        mapRef.current
          .getSource("earthquakes")
          .getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;

            mapRef.current.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom,
            });
          });
      });

      // When a click event occurs on a feature in
      // the unclustered-point layer, open a popup at
      // the location of the feature, with
      // description HTML from its properties.
      mapRef.current.on("click", "unclustered-point", (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const mag = e.features[0].properties.mag;
        const tsunami = e.features[0].properties.tsunami === 1 ? "yes" : "no";

        // Ensure that if the map is zoomed out such that
        // multiple copies of the feature are visible, the
        // popup appears over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`magnitude: ${mag}<br>Was there a tsunami?: ${tsunami}`)
          .addTo(mapRef.current);
      });

      mapRef.current.on("mouseenter", "clusters", () => {
        mapRef.current.getCanvas().style.cursor = "pointer";
      });
      mapRef.current.on("mouseleave", "clusters", () => {
        mapRef.current.getCanvas().style.cursor = "";
      });
    });

    return () => mapRef.current.remove();
  }, []);

  return <div id="map" ref={mapContainerRef} style={{ height: "100%" }}></div>;
};

export default MapComponent;
