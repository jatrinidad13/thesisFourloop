import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

const MapComponent = () => {
  const [pins, setPins] = useState([]);

  // Fetch pins from the database on component mount
  useEffect(() => {
    const fetchPins = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/markers'); // Update URL as necessary
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

  return (
    <MapContainer center={[14.6349, 121.0941]} zoom={12} className="map">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pins.map((pin) => {
        // Ensure that lat and lng are valid numbers
        const lat = Number(pin.lat);
        const lng = Number(pin.lng);

        if (isNaN(lat) || isNaN(lng)) return null; // Skip invalid pins

        return (
          <Marker key={pin.id_markers} position={[lat, lng]} icon={customIcon}>
            {/* Corrected the position prop to use an array */}
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
    </MapContainer>
  );
};

export default MapComponent;
