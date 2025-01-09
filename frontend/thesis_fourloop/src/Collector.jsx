import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import "./map.css";

const customIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const Collector = ({ truckNum }) => {
  const [pins, setPins] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const mapRef = useRef(null);

  // Fetch route data from the database based on truckNum
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await fetch(`https://thesisfourloop.onrender.com/api/routes/${truckNum}`);
        if (response.ok) {
          const data = await response.json();
          setRouteData(data); // GeoJSON format from backend
        } else {
          console.error('Failed to fetch routes.');
        }
      } catch (error) {
        console.error('Error fetching routes:', error);
      }
    };

    if (truckNum) {
      fetchRoutes();
    }
  }, [truckNum]);

  // Fetch pins
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

  // Fit map bounds to route data
  useEffect(() => {
    if (routeData && mapRef.current) {
      const map = mapRef.current;
      const geoJsonLayer = L.geoJSON(routeData);
      map.fitBounds(geoJsonLayer.getBounds());
    }
  }, [routeData]);

  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      layer.bindPopup(`
        <div>
          <strong>Route Information:</strong><br />
          Truck Number: ${feature.properties.trucknum} <br />
          Start: ${feature.properties.start_mrf} <br />
          Destination: ${feature.properties.dest_point}
        </div>
      `);
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

      {routeData && (
        <GeoJSON
          data={routeData}
          style={{ color: 'blue', weight: 2 }}
          onEachFeature={onEachFeature}
        />
      )}
    </MapContainer>
  );
};

export default Collector;
