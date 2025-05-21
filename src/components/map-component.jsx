import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import mapboxgl from "mapbox-gl";
import Map, {
  Source,
  Layer,
  Popup,
  AttributionControl,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

const allLocations = [
  {
    id: "basel_mitte",
    name: "Basel Mitte",
    longitude: 7.7316,
    latitude: 47.4843,
  },
  {
    id: "basel_sbb",
    name: "Basel SBB",
    longitude: 7.589,
    latitude: 47.547,
  },
  {
    id: "university_basel",
    name: "University of Basel",
    longitude: 7.5828,
    latitude: 47.5603,
  },
  {
    id: "kunstmuseum_basel",
    name: "Kunstmuseum Basel",
    longitude: 7.595,
    latitude: 47.556,
  },
  {
    id: "spalentor",
    name: "Spalentor",
    longitude: 7.5778,
    latitude: 47.5607,
  },
  {
    id: "zoo_basel",
    name: "Zoo Basel",
    longitude: 7.5775,
    latitude: 47.552,
  },
  {
    id: "rhine_bridge",
    name: "Rhine Bridge",
    longitude: 7.5953,
    latitude: 47.5651,
  },
  {
    id: "kleinhuningen_park",
    name: "Kleinhüningen Park",
    longitude: 7.615,
    latitude: 47.5901,
  },
  {
    id: "novartis_campus",
    name: "Novartis Campus",
    longitude: 7.5889,
    latitude: 47.5734,
  },
  {
    id: "voltaplatz",
    name: "Voltaplatz",
    longitude: 7.5801,
    latitude: 47.5679,
  },
  {
    id: "brucke_strasse",
    name: "Brücke Strasse",
    longitude: 7.5991,
    latitude: 47.5483,
  },
  {
    id: "botmingen_castle",
    name: "Bottmingen Castle",
    longitude: 7.5683,
    latitude: 47.5218,
  },
  {
    id: "muttenz_station",
    name: "Muttenz Station",
    longitude: 7.6427,
    latitude: 47.5229,
  },
  {
    id: "liestal_oldtown",
    name: "Liestal Old Town",
    longitude: 7.7349,
    latitude: 47.4841,
  },
  {
    id: "pratteln_park",
    name: "Pratteln Park",
    longitude: 7.6911,
    latitude: 47.5263,
  },
  {
    id: "rheinfelden_center",
    name: "Rheinfelden Center",
    longitude: 7.7921,
    latitude: 47.5539,
  },
  {
    id: "delemont_castle",
    name: "Delémont Castle",
    longitude: 7.3433,
    latitude: 47.3655,
  },
  {
    id: "lorrach_city",
    name: "Lörrach City",
    longitude: 7.6644,
    latitude: 47.6139,
  },
  {
    id: "weil_am_rhein",
    name: "Weil am Rhein",
    longitude: 7.6206,
    latitude: 47.5935,
  },
  {
    id: "mulhouse_center",
    name: "Mulhouse Center",
    longitude: 7.3383,
    latitude: 47.75,
  },
];

const clusterLayer = {
  id: "clusters",
  type: "circle",
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
    "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
    "circle-stroke-width": 1,
    "circle-stroke-color": "#fff",
  },
};

const clusterCountLayer = {
  id: "cluster-count",
  type: "symbol",
  filter: ["has", "point_count"],
  layout: {
    "text-field": "{point_count_abbreviated}", // Using template string for field
    "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"], // Ensure fonts are available
    "text-size": 12,
  },
  paint: {
    "text-color": "#ffffff", // White text for better contrast on cluster circles
  },
};

const unclusteredPointLayer = {
  id: "unclustered-point",
  type: "circle",
  filter: ["!", ["has", "point_count"]],
  paint: {
    "circle-color": "#11b4da",
    "circle-radius": 6, // Adjusted for better visibility
    "circle-stroke-width": 1,
    "circle-stroke-color": "#fff",
  },
};

const MapComponent = ({ mapboxAccessToken }) => {
  const mapboxStyleUrl =
    "mapbox://styles/faizajarin12/cm8pfng64006y01sh6hjsgmc6";

  const mapRef = useRef(null);
  const [popupInfo, setPopupInfo] = useState(null);

  const geoJsonData = useMemo(() => {
    return {
      type: "FeatureCollection",
      features: allLocations.map((loc) => ({
        type: "Feature",
        properties: { id: loc.id, name: loc.name },
        geometry: {
          type: "Point",
          coordinates: [loc.longitude, loc.latitude],
        },
      })),
    };
  }, []);

  const handleMapClick = useCallback((event) => {
    const features = event.features;
    if (!features || features.length === 0) {
      setPopupInfo(null); // Close popup if clicking on empty map area
      return;
    }

    const clickedFeature = features[0];

    // If a cluster is clicked, zoom into it
    if (clickedFeature.layer.id === "clusters") {
      const clusterId = clickedFeature.properties.cluster_id;
      const map = mapRef.current.getMap(); // Get the underlying Mapbox GL JS map instance

      map
        .getSource("locations-source")
        .getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) {
            console.error("Error getting cluster expansion zoom:", err);
            return;
          }
          map.easeTo({
            center: clickedFeature.geometry.coordinates,
            zoom: zoom,
            duration: 500,
          });
        });
      setPopupInfo(null); // Close any existing popup when zooming
    }
    // If an unclustered point is clicked, show a popup
    else if (clickedFeature.layer.id === "unclustered-point") {
      setPopupInfo({
        longitude: clickedFeature.geometry.coordinates[0],
        latitude: clickedFeature.geometry.coordinates[1],
        name: clickedFeature.properties.name,
      });
    } else {
      setPopupInfo(null); // Close popup if clicking on something else
    }
  }, []);

  const handleMouseEnter = useCallback((event) => {
    if (
      event.features &&
      event.features.find(
        (f) => f.layer.id === "clusters" || f.layer.id === "unclustered-point"
      )
    ) {
      mapRef.current.getCanvas().style.cursor = "pointer";
    }
  }, []);

  // Handle mouse leave events for cursor changes
  const handleMouseLeave = useCallback(() => {
    mapRef.current.getCanvas().style.cursor = "";
  }, []);

  // Display an error message if the Mapbox token is a placeholder
  if (mapboxAccessToken === "YOUR_MAPBOX_ACCESS_TOKEN") {
    console.error(
      "Mapbox Access Token is not set. Please set VITE_MAPBOX_ACCESS_TOKEN in your .env file or replace the placeholder."
    );
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh", // Use vh for full viewport height
          backgroundColor: "#f0f0f0",
          padding: "20px",
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        <p style={{ color: "red", fontWeight: "bold", fontSize: "1.2em" }}>
          Configuration Error: Mapbox Access Token is missing.
          <br />
          <small style={{ color: "#555", fontWeight: "normal" }}>
            Please set VITE_MAPBOX_ACCESS_TOKEN in your .env file (if using
            Vite) or update the placeholder in the code.
          </small>
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <Map
        ref={mapRef}
        mapboxAccessToken={mapboxAccessToken}
        initialViewState={{
          longitude: 7.7316678383802, // Initial center (Basel Mitte)
          latitude: 47.484317755158,
          zoom: 9, // Adjusted initial zoom to see more area
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapboxStyleUrl} // Your custom style or a default Mapbox style
        onClick={handleMapClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        interactiveLayerIds={["clusters", "unclustered-point"]} // Optimize interactions
        attributionControl={false} // Disable default attribution if adding custom
      >
        <AttributionControl customAttribution="Map data &copy; OpenStreetMap contributors" />
        <Source
          id="locations-source" // Unique ID for the source
          type="geojson"
          data={geoJsonData}
          cluster={true}
          clusterMaxZoom={14} // Max zoom to cluster points on
          clusterRadius={50} // Radius of each cluster when clustering points (defaults to 50)
        >
          {/* Layer for the clusters */}
          <Layer {...clusterLayer} />
          {/* Layer for the cluster counts */}
          <Layer {...clusterCountLayer} />
          {/* Layer for unclustered points */}
          <Layer {...unclusteredPointLayer} />
        </Source>

        {/* Popup for unclustered points */}
        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            anchor="top" // Anchor popup above the point
            onClose={() => setPopupInfo(null)} // Allow closing popup with its 'x' button
            closeOnClick={false} // Keep popup open when map is clicked elsewhere (handled by handleMapClick)
            offset={10} // Offset from the point
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ padding: "5px" }}>
              <strong style={{ fontSize: "1.1em" }}>{popupInfo.name}</strong>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default MapComponent;
