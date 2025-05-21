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
      zoom: 6.5,
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
