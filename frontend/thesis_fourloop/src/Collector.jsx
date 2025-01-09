import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import "./map.css";

// Custom Leaflet icon
const customIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const Collector = ({ token }) => {
  const [pins, setPins] = useState([]);
  const [geoJsonData, setGeoJsonData] = useState(null); // Holds the fetched route data
  const mapRef = useRef(null);

  // Decode the token to extract truckNum
  const decodeToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
      return payload.truckNum;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  const truckNum = decodeToken(token);

  // Fetch route data from the backend for the user's truckNum
  useEffect(() => {
    const fetchRoute = async () => {
      if (!truckNum) return;

      try {
        const response = await fetch(`https://thesisfourloop.onrender.com/api/routes/${truckNum}`);
        if (response.ok) {
          const data = await response.json();
          setGeoJsonData(data); // Assume the backend returns GeoJSON
        } else {
          console.error("Failed to fetch route data.");
        }
      } catch (error) {
        console.error("Error fetching route data:", error);
      }
    };

    fetchRoute();
  }, [truckNum]);

  // Fetch pins from the database on component mount
  useEffect(() => {
    const fetchPins = async () => {
      try {
        const response = await fetch('https://thesisfourloop.onrender.com/api/markers');
        if (response.ok) {
          const data = await response.json();
          setPins(data);
        } else {
          console.error('Failed to fetch pins.');
        }
      } catch (error) {
        console.error('Error fetching pins:', error);
      }
    };

    fetchPins();
  }, []);

  // Fit map bounds to GeoJSON data
  useEffect(() => {
    if (geoJsonData && mapRef.current) {
      const map = mapRef.current;
      const geoJsonLayer = L.geoJSON(geoJsonData);
      map.fitBounds(geoJsonLayer.getBounds());
    }
  }, [geoJsonData]);

  const onEachFeature = (feature, layer) => {
    if (feature.properties && feature.properties.name) {
      layer.bindPopup(`Route Name: ${feature.properties.name}`);
    } else {
      layer.bindPopup('Route Information Unavailable');
    }
  };

  return (
    <MapContainer
      center={[14.6349, 121.0941]}
      zoom={12}
      className="map"
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {pins.map((pin) => {
        const lat = Number(pin.lat);
        const lng = Number(pin.lng);

        if (isNaN(lat) || isNaN(lng)) return null;

        return (
          <Marker key={pin.id_markers} position={[lat, lng]} icon={customIcon}>
            <Popup>
              <div>
                <strong>Pinned Location:</strong><br />
                Latitude: {lat.toFixed(4)} <br />
                Longitude: {lng.toFixed(4)} <br />
                {pin.message}
              </div>
            </Popup>
          </Marker>
        );
      })}

      {geoJsonData && (
        <GeoJSON
          data={geoJsonData}
          style={{ color: 'blue', weight: 2 }}
          onEachFeature={onEachFeature}
        />
      )}
    </MapContainer>
  );
};

export default Collector;
