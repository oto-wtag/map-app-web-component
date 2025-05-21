import React, { useRef, useState, useCallback, useMemo } from "react";
// Removed unused mapboxgl import
import Map, {
  Source,
  Layer,
  Popup,
  AttributionControl,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

// Log imported components to check if they are defined
console.log("Imported Mapbox Components:", {
  Map,
  Source,
  Layer,
  Popup,
  AttributionControl,
});

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
  { id: "basel_sbb", name: "Basel SBB", longitude: 7.589, latitude: 47.547 },
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
  { id: "spalentor", name: "Spalentor", longitude: 7.5778, latitude: 47.5607 },
  { id: "zoo_basel", name: "Zoo Basel", longitude: 7.5775, latitude: 47.552 },
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
    "text-field": "{point_count_abbreviated}",
    "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
    "text-size": 12,
  },
  paint: {
    "text-color": "#ffffff",
  },
};

const unclusteredPointLayer = {
  id: "unclustered-point",
  type: "symbol",
  filter: ["!", ["has", "point_count"]],
  layout: {
    "icon-image": "custom-red-marker",
    "icon-size": 0.75,
    "icon-allow-overlap": true,
    "icon-anchor": "bottom",
  },
};

const MapComponent = ({ mapboxAccessToken }) => {
  // mapboxAccessToken is now a prop
  const mapboxStyleUrl =
    "mapbox://styles/faizajarin12/cm8pfng64006y01sh6hjsgmc6"; // Hardcoded as in your snippet

  const mapRef = useRef(null);
  const [popupInfo, setPopupInfo] = useState(null);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);

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

  const onMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) {
      console.error("Map instance not available on load.");
      return;
    }

    const image = new Image(48, 48);
    image.onload = () => {
      if (map && map.style && !map.hasImage("custom-red-marker")) {
        // Added map.style check
        map.addImage("custom-red-marker", image, { sdf: false });
        console.log("Custom marker image added to map.");
      }
      setIsStyleLoaded(true);
    };
    image.onerror = (e) => {
      console.error("Error loading SVG marker image:", e);
      setIsStyleLoaded(true);
    };

    const svgBlob = new Blob([redMarkerSvgString.trim()], {
      type: "image/svg+xml",
    });
    image.src = URL.createObjectURL(svgBlob);
  }, []);

  const handleMapClick = useCallback((event) => {
    const features = event.features;
    if (!features || features.length === 0) {
      setPopupInfo(null);
      return;
    }
    const clickedFeature = features[0];
    const map = mapRef.current?.getMap(); // Use optional chaining

    if (!map) return; // Guard if map is not available

    if (clickedFeature.layer.id === "clusters") {
      const clusterId = clickedFeature.properties.cluster_id;
      const source = map.getSource("locations-source");
      if (source && typeof source.getClusterExpansionZoom === "function") {
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
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
      } else {
        console.error(
          "locations-source not found or does not support getClusterExpansionZoom"
        );
      }
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

  const handleMouseEnter = useCallback((event) => {
    if (
      event.features &&
      event.features.find(
        (f) => f.layer.id === "clusters" || f.layer.id === "unclustered-point"
      )
    ) {
      if (mapRef.current) mapRef.current.getCanvas().style.cursor = "pointer";
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (mapRef.current) mapRef.current.getCanvas().style.cursor = "";
  }, []);

  // Check if mapboxAccessToken is provided (especially if it's expected as a prop)
  if (!mapboxAccessToken || mapboxAccessToken === "YOUR_MAPBOX_ACCESS_TOKEN") {
    // Adjusted the condition to check for missing or placeholder token when passed as prop
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
          Configuration Error: Mapbox Access Token is missing or invalid.
          <br />
          <small style={{ color: "#555", fontWeight: "normal" }}>
            Please ensure a valid Mapbox Access Token is provided to the
            MapComponent.
          </small>
        </p>
      </div>
    );
  }

  // If Map component itself is undefined, we can't render it.
  if (!Map) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#fee",
          padding: "20px",
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
          color: "darkred",
        }}
      >
        <p style={{ fontWeight: "bold", fontSize: "1.2em" }}>
          Critical Error: The Map component could not be loaded.
          <br />
          <small>
            This might be due to an issue with the 'react-map-gl' installation
            or import. Check the console for details from the import log.
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
        mapboxAccessToken={mapboxAccessToken} // Use the prop
        initialViewState={{
          longitude: 7.7316678383802,
          latitude: 47.484317755158,
          zoom: 9,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapboxStyleUrl}
        onLoad={onMapLoad}
        onClick={handleMapClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        interactiveLayerIds={["clusters", "unclustered-point"]}
        attributionControl={false}
      >
        {AttributionControl && (
          <AttributionControl customAttribution="Map data &copy; OpenStreetMap contributors" />
        )}

        {isStyleLoaded && Source && Layer && (
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
            <Layer {...unclusteredPointLayer} />
          </Source>
        )}

        {popupInfo && Popup && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            anchor="bottom"
            onClose={() => setPopupInfo(null)}
            closeOnClick={false}
            offset={15}
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
