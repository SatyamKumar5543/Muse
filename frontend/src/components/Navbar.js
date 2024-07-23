import React from 'react';
import { Link } from 'react-router-dom';
import '../styles.css'; // Adjust the path as necessary

function Navbar() {
  return (
    <div className="navbar">
      <Link to="/" className="home">
        <div className="logo">
          <img src="/Images/logo.jpg" alt="AniMuse Logo" />
          <h1>AniMuse</h1>
        </div>
      </Link>
      <div className="search-container">
        <input type="text" name="q" className="search-input" placeholder="Search Song" />
        <button type="submit" className="search-button">
          <i className="fas fa-search"></i>
        </button>
      </div>
    </div>
  );
}

export default Navbar;
