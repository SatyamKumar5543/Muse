import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faVolumeHigh, faVolumeXmark, faPlus } from '@fortawesome/free-solid-svg-icons';
import BottomBar from './BottomBar';
import './Playlist.css';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function Playlist() {
  const [playlistItems, setPlaylistItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeatEnabled, setIsRepeatEnabled] = useState(false);
  const [isBottomDivisionVisible, setIsBottomDivisionVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [collectionx, setCollections] = useState([]);
  const currentTimeRef = useRef(null);
  const totalTimeRef = useRef(null);
  const query = useQuery();
  const collectionName = query.get('collection');
  const playlistName = query.get('collectionx');
  const [albumInfo, setAlbumInfo] = useState({
    albumName: '',
    imagePath: ''
  });
  const [currentSongDetails, setCurrentSongDetails] = useState({
    title: '',
    artist: '',
    imagePath: '',
    filePath: ''
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const collectionName = urlParams.get('collection');
    const playlistName = urlParams.get('collectionx');
    if (collectionName) {
      fetch(`http://127.0.0.1:3000/${encodeURIComponent(collectionName)}`)
        .then(response => response.json())
        .then(data => {
          const albumInfo = data[0];
          const playlistItems = Array.isArray(data) ? data.slice(1) : [];
          setAlbumInfo(albumInfo);
          setPlaylistItems(playlistItems);
        })
        .catch(error => console.error('Failed to retrieve playlist items', error));
    }
    else if (playlistName) {
      fetch(`http://127.0.0.1:3000/api/playlistItems/${encodeURIComponent(playlistName)}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          setAlbumInfo({ albumName: playlistName, imagePath: data[0].imagePath }); // Handle the case where data might be empty
          setPlaylistItems(Array.isArray(data) ? data : []);
        })
        .catch(error => console.error('Failed to retrieve playlist items', error));
    }
  }, [collectionName, playlistName]);

  useEffect(() => {
    checkFavorite();
  }, [currentSongDetails]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', togglePlayPause);
      navigator.mediaSession.setActionHandler('pause', togglePlayPause);
      navigator.mediaSession.setActionHandler('previoustrack', playPrevious);
      navigator.mediaSession.setActionHandler('nexttrack', playNext);
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        togglePlayPause();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const playSong = (songFilePath, index) => {
    const audioPlayer = document.getElementById('audioPlayer');
    console.log('Playing song at index:', index);
    setIsBottomDivisionVisible(true);

    if (index === currentIndex) {
      togglePlayPause();
    } else {
      audioPlayer.src = songFilePath;
      audioPlayer.play();
      setCurrentIndex(index);
      setIsRepeatEnabled(false);

      // Check if the song object exists
      if (playlistItems[index]) {
        const song = playlistItems[index];
        setCurrentSongDetails({
          title: song.title,
          artist: song.artist,
          imagePath: song.imagePath,
          filePath: song.filePath
        });
        setIsPlaying(true);
        setIsBottomDivisionVisible(true);
      } else {
        console.error('Song object is undefined at index:', index);
      }
    }
  };

  const sufflePlaylist = () => {
    // Implement shuffle logic here
    console.log('Shuffle playlist');
  };

  const playPrevious = () => {
    let previousIndex = currentIndex - 1;
    if (previousIndex < 0) {
      previousIndex = playlistItems.length - 1;
    }
    const previousItem = playlistItems[previousIndex];
    const songFilePath = previousItem.filePath;
    playSong(songFilePath, previousIndex);
  };

  const togglePlayPause = () => {
    const audioPlayer = document.getElementById('audioPlayer');
    if (audioPlayer.paused) {
      audioPlayer.play();
      setIsPlaying(true);

    } else {
      audioPlayer.pause();
      setIsPlaying(false);
    }
  };

  const playNext = () => {
    let nextIndex = currentIndex + 1;
    if (nextIndex >= playlistItems.length) {
      nextIndex = 0;
    }
    const nextItem = playlistItems[nextIndex];
    const songFilePath = nextItem.filePath;
    setCurrentIndex(nextIndex);
    playSong(songFilePath, nextIndex);
  };

  useEffect(() => {
    const audioPlayer = document.getElementById('audioPlayer');
    if (audioPlayer) {
      audioPlayer.addEventListener('ended', handleSongEnd);
      return () => {
        audioPlayer.removeEventListener('ended', handleSongEnd);
      };
    }
  }, [isRepeatEnabled]);

  const toggleRepeat = () => {
    setIsRepeatEnabled(prevState => !prevState);
  };

  const handleSongEnd = () => {
    const audioPlayer = document.getElementById('audioPlayer');
    if (isRepeatEnabled) {
      audioPlayer.currentTime = 0;
      audioPlayer.play();
    } else {
      playNext();
    }
  };

  const formatTime = (time) => {
    var minutes = Math.floor(time / 60);
    var seconds = Math.floor(time % 60);
    seconds = seconds < 10 ? '0' + seconds : seconds;
    return minutes + ':' + seconds;
  };

  const updateProgress = () => {
    const audioPlayer = document.getElementById('audioPlayer');
    if (audioPlayer) {
      const currentTimeValue = audioPlayer.currentTime;
      const newDuration = audioPlayer.duration;
      // Update currentTime, duration, and totalTime using refs
      if (currentTimeRef.current && totalTimeRef.current) {
        setCurrentTime(currentTimeValue);
        setDuration(newDuration);
        currentTimeRef.current.textContent = formatTime(currentTimeValue);
        totalTimeRef.current.textContent = formatTime(newDuration);

        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
          progressBar.value = currentTimeValue;
        }
      }
    }
  };

  useEffect(() => {
    const audioPlayer = document.getElementById('audioPlayer');
    if (audioPlayer) {
      audioPlayer.addEventListener('timeupdate', updateProgress);
      return () => {
        audioPlayer.removeEventListener('timeupdate', updateProgress);
      };
    }
  }, [updateProgress]);

  const handleProgressBarChange = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.currentTime = newTime;
  };

  const handleProgressBarMouseDown = () => {
    const audioPlayer = document.getElementById('audioPlayer');
    if (audioPlayer.paused) {
      setIsPlaying(true);
    }
  };

  const handleProgressBarMouseUp = () => {
    const audioPlayer = document.getElementById('audioPlayer');
    if (isPlaying) {
      audioPlayer.play();
    }
  };

  const checkFavorite = async () => {
    console.log('Current Song:', currentSongDetails.title, currentSongDetails.artist);

    try {
      var response = await fetch('http://localhost:3000/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: currentSongDetails.title,
          artist: currentSongDetails.artist
        })
      });

      if (response.ok) {
        var isFavorite = await response.json();
        if (isFavorite) {
          console.log('Is Favorite: True');
        } else {
          console.log('Is Favorite: False');
        }
        setIsFavorite(isFavorite);
      } else {
        console.error('Failed to check favorite:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to check favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    console.log(currentSongDetails.filePath);

    try {
      var response = await fetch('http://localhost:3000/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: currentSongDetails.title,
          artist: currentSongDetails.artist,
          filePath: currentSongDetails.filePath,
          imagePath: currentSongDetails.imagePath,
        }),
      });

      if (response.ok) {
        var isFavorite = await response.json();
        setIsFavorite(isFavorite);
        if (!isFavorite) {
          await addToFavorites(currentSongDetails.title, currentSongDetails.artist, currentSongDetails.filePath, currentSongDetails.imagePath);
        } else {
          await removeFromFavorites(currentSongDetails.title, currentSongDetails.artist, currentSongDetails.filePath, currentSongDetails.imagePath);
        }
        checkFavorite();
      } else {
        console.error('Failed to toggle favorite:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const addToFavorites = async (title, artist, filePath, imagePath) => {
    try {
      var response = await fetch('http://localhost:3000/favorites/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
          artist: artist,
          filePath: filePath,
          imagePath: imagePath,
        }),
      });

      if (response.ok) {
        console.log('Song added to favorites:', title, artist);
      } else {
        console.error('Failed to add song to favorites:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to add song to favorites:', error);
    }
  };

  const removeFromFavorites = async (title, artist, filePath, imagePath) => {
    try {
      var response = await fetch('http://127.0.0.1:3000/favorites/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
          artist: artist,
          filePath: filePath,
          imagePath: imagePath,
        }),
      });

      if (response.ok) {
        console.log('Song removed from favorites:', title, artist);
      } else {
        console.error('Failed to remove song from favorites:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to remove song from favorites:', error);
    }
  };

  const toggleVolume = () => {
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.muted = !audioPlayer.muted;
    setIsMuted(!isMuted);
  };

  const addToCollection = async (songDetails, collectionName) => {
    try {
      const response = await fetch(`http://127.0.0.1:3000/api/addToCollection/${encodeURIComponent(collectionName)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: songDetails.title,
          artist: songDetails.artist,
          filePath: songDetails.filePath,
          imagePath: songDetails.imagePath,
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Song added to collection:', data.message);
        // Handle success message or state update as needed
      } else {
        console.error('Failed to add song to collection:', response.status, response.statusText);
        // Handle error state or message
      }
    } catch (error) {
      console.error('Failed to add song to collection:', error);
      // Handle network error or other exceptions
    }
  };  

  const refreshCollections = () => {
    try {
      fetch('http://127.0.0.1:3000/api/collections')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          setCollections(data);
        })
        .catch(error => {
          console.error('Error fetching collections:', error);
        });
    } catch (error) {
      console.error('Error in fetch operation:', error);
    }
  };  

  if (playlistItems.length === 0) {
    return <div>Loading...</div>;
  }

  const songs = playlistItems;

  return (
    <div>
      <header>
        <div id="albumInfo">
          <img id="albumImage" src={albumInfo.imagePath || '/Images/logo.jpg'} alt="Album Cover" />
          <div id="albumDetails">
            <h1 id="albumName">{albumInfo.albumName}</h1>
            <p id="noOfSongs">{songs.length} Songs</p>
          </div>
        </div>
      </header>
      <div className="playlist-container">
        <div className="playlist" id="playlist">
          {songs.map((item, index) => (
            <div
              key={index}
              className={`playlist-item ${index === currentIndex ? 'playing' : ''}`}
              data-song={item.filePath}
              onClick={() => playSong(item.filePath, index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="item-number">
                {index === currentIndex ? (
                  isPlaying ? (
                    hoveredIndex === index ? (
                      <FontAwesomeIcon icon={faPlay} className="play-pause-icon" color='red' />
                    ) : (
                      <FontAwesomeIcon icon={faPause} className="play-pause-icon" color="red" />
                    )
                  ) : (
                    <FontAwesomeIcon icon={faPlay} className="play-pause-icon playing" color='red' />
                  )
                ) : (
                  hoveredIndex === index ? (
                    <FontAwesomeIcon icon={faPlay} className="play-pause-icon" />
                  ) : (
                    <span>{index + 1}</span>
                  )
                )}
              </div>
              <img className="song-image" src={item.imagePath} alt={`Song ${index + 1}`} />
              <div className="song-details">
                <h2 className="song-title">{item.title}</h2>
                <p className="song-artist">{item.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {isBottomDivisionVisible && (
        <BottomBar
          isPlaying={isPlaying}
          currentSongDetails={currentSongDetails}
          currentTime={currentTime}
          duration={duration}
          isRepeatEnabled={isRepeatEnabled}
          isFavorite={isFavorite}
          formatTime={formatTime}
          togglePlayPause={togglePlayPause}
          playNext={playNext}
          playPrevious={playPrevious}
          toggleRepeat={toggleRepeat}
          toggleFavorite={toggleFavorite}
          handleProgressBarChange={handleProgressBarChange}
          handleProgressBarMouseDown={handleProgressBarMouseDown}
          handleProgressBarMouseUp={handleProgressBarMouseUp}
          currentTimeRef={currentTimeRef}
          totalTimeRef={totalTimeRef}
          sufflePlaylist={sufflePlaylist}
          isMuted={isMuted}
          toggleVolume={toggleVolume}
          collections={collectionx}
          addToCollection={addToCollection}
          refreshCollections={refreshCollections}
        />
      )}
      <audio id="audioPlayer" controls style={{ display: 'none' }}></audio>
    </div>
  );
}

export default Playlist;