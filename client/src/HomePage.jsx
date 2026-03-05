import React, { useState } from "react";
import './HomePage.css';
import courts from './courts.json';
import { Link } from "react-router-dom";

// Normalize court data
const normalizedCourts = courts.map(court => ({
  id: court["Court ID"],
  name: court["Name"],
  neighborhood: court["Neighborhood"],
  address: court["Address"],
  ward: court["Ward"],
  surface: court["Surface"],
  lighted: court["Lighted"],
  peakTime: court["Typical Peak Time"],
  playersNow: court["Players Now"],
  rating: court["Rating"],
  notes: court["Notes"],
  imageUrl: court["imageUrl"] || "https://images.unsplash.com/photo-1585776245991-01e7fcb6c66b?fit=crop&w=800&q=80"
}));

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourts = normalizedCourts.filter((court) => {
    const query = searchQuery.toLowerCase();
    return (
      court.name.toLowerCase().includes(query) ||
      court.neighborhood.toLowerCase().includes(query) ||
      court.address.toLowerCase().includes(query)
    );
  });

  return (
    <div className="homepage-container">
      {/* Top Navigation */}
      <header className="top-nav">
        <div className="logo">🏀</div>
        <input
          type="text"
          placeholder="Search courts near you..."
          className="search-bar"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="nav-actions">
          <Link to="/courts">
            <button className="find-courts-btn">Find Courts</button>
          </Link>
          <Link to="/profile">
            <img
              src="/profile-icon.png"
              alt="Profile"
              className="profile-avatar"
              style={{ cursor: "pointer" }}
            />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay">
          <h1 className="tagline">Find Your Next Run</h1>
          <p className="hero-subtext">
            Discover nearby pickup basketball courts, see who’s checked in and join the game.
          </p>
          <Link to="/courts">
            <button className="search-btn">Search Courts</button>
          </Link>
        </div>
      </section>

      {/* Court Grid Section */}
      <section className="court-section">
        <div className="court-grid">
          {filteredCourts.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'white', fontWeight: 'bold' }}>
              No courts found matching “{searchQuery}”
            </p>
          ) : (
            filteredCourts.map((court) => (
              <Link to={`/court/${court.id}`} key={court.id} style={{ textDecoration: "none" }}>
                <div
                  className="court-card"
                  style={{ backgroundImage: `url(${court.imageUrl})` }}
                >
                  <span>{court.name}</span>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Embedded Map */}
        <div className="map-view">
          <iframe
            title="map"
            src="https://maps.google.com/maps?q=Washington%20DC&t=&z=13&ie=UTF8&iwloc=&output=embed"
          ></iframe>
        </div>
      </section>

      {/* Community CTA */}
      <section className="community-callout">
        <h2>Don’t see your favorite court?</h2>
        <Link to="/added-courts">
          <button className="secondary-cta">🏀 Can’t find your court? Add one!</button>
        </Link>
      </section>
    </div>
  );
};

export default HomePage;
