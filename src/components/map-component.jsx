import React, { useEffect, useRef, useCallback, useMemo } from "react";
import mapboxgl from "mapbox-gl";
//import Map, { Marker, Source, Layer } from "react-map-gl/mapbox";
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

const MapComponent = ({ mapboxAccessToken }) => {
  const mapContainerRef = useRef();
  const mapRef = useRef();

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

  useEffect(() => {
    mapboxgl.accessToken = mapboxAccessToken;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/faizajarin12/cm8pfng64006y01sh6hjsgmc6",
      center: [7.7316678383802, 47.484317755158],
      zoom: 12,
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
        const name = e.features[0].properties.name;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`<strong>${name}</strong>`)
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
