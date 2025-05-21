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

const redMarkerSvgString = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48px" height="48px">
    <path
      fill="#FF0000" stroke="#FFFFFF" stroke-width="1"
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
    />
    <circle fill="#B00000" cx="12" cy="9.5" r="2.5" />
  </svg>
`;

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

// Layer style for cluster counts
const clusterCountLayer = {
  id: "cluster-count",
  type: "symbol",
  filter: ["has", "point_count"],
  layout: {
    "text-field": "{point_count_abbreviated}",
    "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
    "text-size": 12,
  },
  paint: {
    "text-color": "#ffffff",
  },
};

// Updated layer style for unclustered points (now using SVG marker)
const unclusteredPointLayer = {
  id: "unclustered-point",
  type: "symbol", // Changed from 'circle' to 'symbol'
  filter: ["!", ["has", "point_count"]],
  layout: {
    "icon-image": "custom-red-marker", // This name must match the name used in map.addImage()
    "icon-size": 0.75, // Adjust size as needed. SVGs can sometimes render larger than expected.
    "icon-allow-overlap": true, // Prevents icons from hiding each other
    "icon-anchor": "bottom", // Anchors the bottom of the icon to the geographic point
  },
  // 'paint' properties for circle are removed as we are using an icon now.
};

const MapComponent = ({ mapboxAccessToken }) => {
  const mapboxStyleUrl =
    "mapbox://styles/faizajarin12/cm8pfng64006y01sh6hjsgmc6";

  const mapRef = useRef(null);
  const [popupInfo, setPopupInfo] = useState(null);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false); // Track if the map style and our custom image are loaded

  // Memoize GeoJSON data
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

  // Callback for when the map loads
  const onMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap(); // Use optional chaining
    if (!map) {
      console.error("Map instance not available on load.");
      return;
    }

    // Create an HTMLImageElement to load the SVG
    const image = new Image(48, 48); // Specify dimensions from SVG
    image.onload = () => {
      if (!map.hasImage("custom-red-marker")) {
        map.addImage("custom-red-marker", image, { sdf: false }); // sdf: false for raster images/complex SVGs
        console.log("Custom marker image added to map.");
      }
      setIsStyleLoaded(true); // Signal that our custom image is ready
    };
    image.onerror = (e) => {
      console.error("Error loading SVG marker image:", e);
      setIsStyleLoaded(true); // Still set to true to allow other layers to render
    };

    // Convert SVG string to a data URL
    const svgBlob = new Blob([redMarkerSvgString.trim()], {
      type: "image/svg+xml",
    });
    image.src = URL.createObjectURL(svgBlob);
  }, []);

  // Handle clicks on the map
  const handleMapClick = useCallback((event) => {
    const features = event.features;
    if (!features || features.length === 0) {
      setPopupInfo(null);
      return;
    }
    const clickedFeature = features[0];

    if (clickedFeature.layer.id === "clusters") {
      const clusterId = clickedFeature.properties.cluster_id;
      const map = mapRef.current.getMap();
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
      setPopupInfo(null);
    } else if (clickedFeature.layer.id === "unclustered-point") {
      setPopupInfo({
        longitude: clickedFeature.geometry.coordinates[0],
        latitude: clickedFeature.geometry.coordinates[1],
        name: clickedFeature.properties.name,
      });
    } else {
      setPopupInfo(null);
    }
  }, []);

  // Handle mouse enter/leave for cursor changes
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

  const handleMouseLeave = useCallback(() => {
    mapRef.current.getCanvas().style.cursor = "";
  }, []);

  if (mapboxAccessToken === "YOUR_MAPBOX_ACCESS_TOKEN") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
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
            Please set VITE_MAPBOX_ACCESS_TOKEN in your .env file or update the
            placeholder.
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
          longitude: 7.7316678383802,
          latitude: 47.484317755158,
          zoom: 9,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapboxStyleUrl}
        onLoad={onMapLoad} // Call onMapLoad when the map's style is loaded
        onClick={handleMapClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        interactiveLayerIds={["clusters", "unclustered-point"]}
        attributionControl={false}
      >
        <AttributionControl customAttribution="Map data &copy; OpenStreetMap contributors" />

        {/* Source and Layers are only rendered once the style (and our custom image) is loaded */}
        {isStyleLoaded && (
          <Source
            id="locations-source"
            type="geojson"
            data={geoJsonData}
            cluster={true}
            clusterMaxZoom={14}
            clusterRadius={50}
          >
            <Layer {...clusterLayer} />
            <Layer {...clusterCountLayer} />
            <Layer {...unclusteredPointLayer} />{" "}
            {/* This layer now uses the SVG icon */}
          </Source>
        )}

        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            anchor="bottom" // Anchor popup to the bottom of the icon for better placement
            onClose={() => setPopupInfo(null)}
            closeOnClick={false}
            offset={15} // Adjust offset if needed with the new icon
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
