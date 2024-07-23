import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShuffle, faStepBackward, faPlay, faPause, faStepForward, faRepeat, faHeart as faHeartSolid, faVolumeHigh, faVolumeXmark, faEllipsisV, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';

function BottomBar({ isPlaying,
  currentSongDetails,
  currentTime,
  duration,
  isRepeatEnabled,
  isFavorite,
  formatTime,
  togglePlayPause,
  playNext,
  playPrevious,
  toggleRepeat,
  toggleFavorite,
  handleProgressBarChange,
  handleProgressBarMouseDown,
  handleProgressBarMouseUp,
  currentTimeRef,
  totalTimeRef,
  sufflePlaylist,
  isMuted,
  toggleVolume,
  addToCollection,
  createNewPlaylist,
  collections,
  refreshCollections }) {

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const dropdownRef = useRef(null);
  const ellipsisIconRef = useRef(null);
  const playlistNameInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        ellipsisIconRef.current &&
        !ellipsisIconRef.current.contains(event.target)
      ) {
        console.log('Clicked outside');
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleEllipsisClick = async () => {
    setIsDropdownVisible(!isDropdownVisible);
    refreshCollections();
  };

  const handlePlaylistNameChange = (e) => {
    setPlaylistName(e.target.value);
  };

  const handleCollectionClick = (collection) => {
    console.log(`Adding to collection: ${collection}`);
    addToCollection(currentSongDetails, collection);
    setIsDropdownVisible(false);
  };

  const showPopup = () => {
    setIsPopupVisible(true);
  };

  const hidePopup = () => {
    setIsPopupVisible(false);
  };

  const handleCreatePlaylist = async () => {
    if (playlistName.trim() === '') {
      alert('Please enter a valid playlist name.');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:3000/api/createPlaylistCollection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playlistName: playlistName,
          imagePath: currentSongDetails.imagePath, // Adjust as per your needs
        }),
      });

      if (response.ok) {
        console.log('New playlist collection created:', playlistName);
      } else {
        const errorData = await response.json();
        console.error('Failed to create playlist collection:', errorData.error);
        alert('Playlist with the same name already exists');
      }
    } catch (error) {
      console.error('Failed to create playlist collection:', error);
      alert('Failed to create playlist collection. Please try again.');
    }
    setPlaylistName('');
    hidePopup();
  };

  return (
    <div className="bottom">
      <div id="currentSongContainer" className="current-song-container">
        <img className="song-image" src={currentSongDetails.imagePath} alt="Current Song" />
        <div className="song-details">
          <h2 className="song-title">{currentSongDetails.title}</h2>
          <p className="song-artist">{currentSongDetails.artist}</p>
        </div>
      </div>
      <div id="bar">
        <div>
          <FontAwesomeIcon icon={faShuffle} id="sufflePlaylist" className="icons" onClick={sufflePlaylist} />
          <FontAwesomeIcon icon={faStepBackward} id="previousIcon" className="icons" onClick={playPrevious} />
          <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} id="playPauseIcon" className="icons" onClick={togglePlayPause} />
          <FontAwesomeIcon icon={faStepForward} id="nextIcon" className="icons" onClick={playNext} />
          <FontAwesomeIcon icon={faRepeat} id="repeatIcon" className={`icons ${isRepeatEnabled ? 'active' : ''}`} onClick={toggleRepeat} />
        </div>
        <div className="progress-bar-wrapper">
          <div id="currentTime" ref={currentTimeRef}>{formatTime(currentTime)}</div>
          <input
            type="range"
            name="progressBar"
            id="progressBar"
            min="0"
            value={currentTime}
            max={duration}
            onChange={handleProgressBarChange}
            onMouseDown={handleProgressBarMouseDown}
            onMouseUp={handleProgressBarMouseUp}
          />
          <div id="totalTime" ref={totalTimeRef}>{formatTime(duration)}</div>
          <div id="control" className="icons">
            <div id="heartIconContainer" onClick={toggleFavorite}>
              <FontAwesomeIcon icon={isFavorite ? faHeartSolid : faHeartRegular} id="heartIcon" className={`icons ${isFavorite ? 'fa-solid' : 'fa-regular'}`} />
            </div>
            <div onClick={toggleVolume}>
              <FontAwesomeIcon icon={isMuted ? faVolumeXmark : faVolumeHigh} id="volumeIcon" className="icons" />
            </div>
            <div className="ellipsis-icon" ref={ellipsisIconRef} onClick={handleEllipsisClick}>
              <FontAwesomeIcon icon={faEllipsisV} className="icons" />
              {isDropdownVisible && (
                <div ref={dropdownRef} className="dropdown-list show-dropdown" id="dropdownList">
                  <div className="dropdown-item" onClick={showPopup}>
                    <i className="fa-solid fa-plus" id="plusIcon"></i> Create Playlist
                  </div>
                  <div className="dropdown-content">
                    {collections.map((collection, index) => (
                      <div key={index} className="dropdown-item" onClick={() => handleCollectionClick(collection)}>
                        {collection}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {isPopupVisible && (
        <div className="popup-container" id="popupContainer">
          <div className="popup" id="popup">
            <i className="fa-solid fa-xmark" id="closeButton" onClick={hidePopup}></i>
            <h3>Enter Playlist Name</h3>
            <input
              type="text"
              id="playlistNameInput"
              ref={playlistNameInputRef}
              value={playlistName}
              onChange={handlePlaylistNameChange}
              placeholder="Enter playlist name"
            />
            <button className="button" id="createPlaylistButton" onClick={handleCreatePlaylist}>
              Save Playlist
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BottomBar;