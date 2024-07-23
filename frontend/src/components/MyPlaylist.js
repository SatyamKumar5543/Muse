import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './MyPlaylist.css';

function MyPlaylist() {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    async function fetchPlaylistData() {
      try {
        const response = await fetch('http://127.0.0.1:3000/api/playlists');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setPlaylists(data);
      } catch (error) {
        console.error('Failed to fetch playlist data:', error);
      }
    }

    fetchPlaylistData();
  }, []);

  return (
    <div>
      <header>
        <h1>My Playlists</h1>
      </header>
      <div className="container">
        <div className="albums-container" id="albumsContainer">
          {playlists.length > 0 ? (
            playlists.map((playlist, index) => (
              <Link to={`/Playlist?collectionx=${encodeURIComponent(playlist.name)}`} key={index} className="album-card">
                <img src={playlist.imagePath} alt={playlist.name} />
                <h3>{playlist.name}</h3>
              </Link>
            ))
          ) : (
            <p>No playlists available.</p>
          )}
        </div>
        <audio id="audioPlayer"></audio>
      </div>
    </div>
  );
}

export default MyPlaylist;