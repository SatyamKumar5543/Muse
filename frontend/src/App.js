import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import Playlist from './components/Playlist';
import MyPlaylist from './components/MyPlaylist';
import './styles.css'; // Make sure the styles are properly imported
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <div className="main-layout">
          <Sidebar />
          <div className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/Playlist" element={<Playlist />} />
              <Route path="/MyPlaylist" element={<MyPlaylist />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
