import React from 'react';
import { Link } from 'react-router-dom';
import '../styles.css';

function Sidebar() {
  return (
    <div className="sidebar">
      <ul>
        <Link to="/"><li><i className="fa fa-home" id="icons"></i>Home</li></Link>
        <Link to="/MyPlaylist"><li><i className="fa-solid fa-bars-staggered" id="icons"></i>My Playlists</li></Link>
        <Link to="/Playlist?collection=favorite"><li><i className="fa-regular fa-heart" id="icons"></i>Favorites</li></Link>
      </ul>
    </div>
  );
}

export default Sidebar;