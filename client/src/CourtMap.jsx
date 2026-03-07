import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './CourtMap.css';

// Custom basketball pin icon
const basketballIcon = new L.DivIcon({
  html: `<div class="map-pin">🏀</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const CourtMap = () => {
  const navigate = useNavigate();
  const [courts, setCourts] = useState([]);

  useEffect(() => {
    fetch('/api/courts')
      .then(res => res.json())
      .then(data => setCourts(data.filter(c => c.latitude && c.longitude)));
  }, []);

  return (
    <MapContainer
      center={[38.9072, -77.0369]}
      zoom={12}
      className="leaflet-map"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {courts.map(court => (
        <Marker
          key={court.id}
          position={[court.latitude, court.longitude]}
          icon={basketballIcon}
        >
          <Popup>
            <div className="map-popup">
              {court.imageUrl && (
                <img src={court.imageUrl} alt={court.name} className="popup-img" />
              )}
              <strong className="popup-name">{court.name}</strong>
              <span className="popup-meta">
                {court.outdoor ? '☀️ Outdoor' : '🏠 Indoor'} · {court.city}
              </span>
              <button
                className="popup-btn"
                onClick={() => navigate(`/court/${court.id}`)}
              >
                View Court →
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default CourtMap;
