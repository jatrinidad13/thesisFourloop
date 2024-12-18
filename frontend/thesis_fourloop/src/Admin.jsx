import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import "./Admin.css";

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

const Admin = ({ userRole }) => {
  const [pins, setPins] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [message, setMessage] = useState('');
  const [isPlacingMarker, setIsPlacingMarker] = useState(false);
  const [geoJsonData, setGeoJsonData] = useState(null);

  const mapRef = useRef(null);

  // Fetch pins and GeoJSON data
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

    const fetchGeoJson = async () => {
      try {
        const response = await fetch('/shapefiles/sampleroutes.json');
        if (response.ok) {
          const data = await response.json();
          setGeoJsonData(data);
        } else {
          console.error('Failed to fetch GeoJSON data.');
        }
      } catch (error) {
        console.error('Error fetching GeoJSON data:', error);
      }
    };

    fetchPins();
    fetchGeoJson();
  }, []);

  useEffect(() => {
    if (geoJsonData && mapRef.current) {
      const map = mapRef.current;

      // Add GeoJSON layer to the map
      const geoJsonLayer = L.geoJSON(geoJsonData, {
        onEachFeature: (feature, layer) => {
          if (feature.properties && feature.properties.name) {
            layer.bindPopup(`Route Name: ${feature.properties.name}`);
          } else {
            layer.bindPopup('Sample Route');
          }
        },
      }).addTo(map);

      // Fit map bounds to GeoJSON data
      map.fitBounds(geoJsonLayer.getBounds());
    }
  }, [geoJsonData]);

  // Handle adding a new pin
  const handleAddMessage = async () => {
    if (!currentLocation || !message) {
      alert('Please pin a location and enter a message.');
      return;
    }

    const newPin = { lat: currentLocation.lat, lng: currentLocation.lng, message };

    try {
      const response = await fetch('https://thesisfourloop.onrender.com/api/markers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPin),
      });

      if (response.ok) {
        const savedPin = await response.json();
        setPins((prevPins) => [...prevPins, savedPin]);
        setCurrentLocation(null);
        setMessage('');
        setIsPlacingMarker(false);
        alert('Pin saved successfully!');
      } else {
        throw new Error('Failed to save pin.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while saving the pin. Please try again.');
    }
  };

  // Handle deleting a pin
  const deletePin = async (id_markers) => {
    try {
      const response = await fetch(`https://thesisfourloop.onrender.com/api/markers/${id_markers}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setPins((prevPins) => prevPins.filter(pin => pin.id_markers !== id_markers));
        alert('Pin deleted successfully!');
      } else {
        throw new Error('Failed to delete pin.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while deleting the pin. Please try again.');
    }
  };

  // Handle map clicks
  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        if (isPlacingMarker) {
          setCurrentLocation(e.latlng);
        }
      },
    });
    return null;
  };

  return (
    <div className='adminwrapper'>
      <div className='admin-top'>
        <h2>Admin Panel</h2>

        {/* Admin map interaction panel */}
        {userRole === 'admin' && (
          <div className="a-button-container">
            <button
              className="a-button"
              onClick={() => setIsPlacingMarker(!isPlacingMarker)}
            >
              {isPlacingMarker ? 'Stop Placing Markers' : 'Place Marker'}
            </button>
            {currentLocation && isPlacingMarker && (
              <>
                <input
                  type="text"
                  id='desc-marker'
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter a message for the pin"
                  style={{ margin: '10px', padding: '10px' }}
                />
                <button className="save-button" onClick={handleAddMessage}>
                  Save Pin
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Map display */}
      <MapContainer center={[14.6349, 121.0941]} zoom={12} className="map" ref={mapRef}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pins.map((pin) => {
          const lat = Number(pin.lat);
          const lng = Number(pin.lng);
          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker key={pin.id_markers} position={{ lat, lng }} icon={customIcon}>
              <Popup>
                <div>
                  <strong>Pinned Location:</strong><br />
                  Latitude: {lat.toFixed(4)} <br />
                  Longitude: {lng.toFixed(4)} <br />
                  {pin.message} <br />
                  {userRole === 'admin' && (
                    <button
                      onClick={() => deletePin(pin.id_markers)}
                      style={{ marginTop: '10px' }}
                    >
                      Delete Pin
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
        {currentLocation && isPlacingMarker && (
          <Marker position={currentLocation} icon={customIcon}>
            <Popup>
              This is the selected location. <br />
              Click "Save Pin" to store it.
            </Popup>
          </Marker>
        )}
        <LocationMarker />
      </MapContainer>
    </div>
  );
};

export default Admin;
