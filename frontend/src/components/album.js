import React, { useState, useEffect, useRef } from 'react';

const MusicPlayer = () => {
    const audioPlayer = useRef(null);
    const [playlistItems, setPlaylistItems] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [isRepeatEnabled, setIsRepeatEnabled] = useState(false);
    const [currentTime, setCurrentTime] = useState('00:00');
    const [totalTime, setTotalTime] = useState('00:00');
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);
    const [currentSong, setCurrentSong] = useState({
        title: '',
        artist: '',
        filePath: '',
        imagePath: ''
    });
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [collections, setCollections] = useState([]);
    const [popupVisible, setPopupVisible] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');

    // Function to format time in MM:SS format
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        let seconds = Math.floor(time % 60);
        seconds = seconds < 10 ? '0' + seconds : seconds;
        return `${minutes}:${seconds}`;
    };

    // Function to show/hide bottom division
    const showBottomDivision = () => {
        return currentIndex !== -1 ? 'flex' : 'none';
    };

    // Function to update the current time and total duration
    const updateProgress = () => {
        const duration = audioPlayer.current.duration;
        const currentTimeValue = audioPlayer.current.currentTime;
        setCurrentTime(formatTime(currentTimeValue));
        setTotalTime(formatTime(duration));
    };

    // Function to toggle repeat state
    const toggleRepeat = () => {
        setIsRepeatEnabled(!isRepeatEnabled);
    };

    // Function to play a song
    const playSong = (song, index) => {
        if (index === currentIndex) {
            togglePlayPause();
        } else {
            audioPlayer.current.src = song.filePath;
            audioPlayer.current.play();
            setCurrentIndex(index);
            setIsRepeatEnabled(false);
            setIsPlaying(true);
            setCurrentSong(song);
            checkFavorite(song);
        }
    };

    // Function to toggle play/pause state
    const togglePlayPause = () => {
        if (isPlaying) {
            audioPlayer.current.pause();
        } else {
            audioPlayer.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    // Function to update the progress bar
    const updateProgressBar = () => {
        const progress = (audioPlayer.current.currentTime / audioPlayer.current.duration) * 100;
        return progress;
    };

    // Function to play the previous song
    const playPrevious = () => {
        let previousIndex = currentIndex - 1;
        if (previousIndex < 0) {
            previousIndex = playlistItems.length - 1;
        }
        const previousItem = playlistItems[previousIndex];
        playSong(previousItem, previousIndex);
    };

    // Function to play the next song
    const playNext = () => {
        let nextIndex = currentIndex + 1;
        if (nextIndex >= playlistItems.length) {
            nextIndex = 0;
        }
        const nextItem = playlistItems[nextIndex];
        playSong(nextItem, nextIndex);
    };

    // Function to check if the current playing song is in favorites
    const checkFavorite = async (song) => {
        try {
            const response = await fetch('http://localhost:3000/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: song.title,
                    artist: song.artist
                })
            });

            if (response.ok) {
                const isFavorite = await response.json();
                setIsFavorite(isFavorite);
            } else {
                console.error('Failed to check favorite:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Failed to check favorite:', error);
        }
    };

    // Function to toggle the favorite status
    const toggleFavorite = async () => {
        try {
            const response = await fetch('http://localhost:3000/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(currentSong),
            });

            if (response.ok) {
                const isFavorite = await response.json();
                setIsFavorite(isFavorite);
                if (isFavorite) {
                    await addToFavorites(currentSong);
                } else {
                    await removeFromFavorites(currentSong);
                }
                checkFavorite(currentSong);
            } else {
                console.error('Failed to toggle favorite:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        }
    };

    // Function to add the song details to the Favorites collection
    const addToFavorites = async (song) => {
        try {
            const response = await fetch('http://localhost:3000/favorites/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(song),
            });

            if (response.ok) {
                console.log('Song added to favorites:', song.title, song.artist);
            } else {
                console.error('Failed to add song to favorites:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Failed to add song to favorites:', error);
        }
    };

    // Function to remove the song details from the Favorites collection
    const removeFromFavorites = async (song) => {
        try {
            const response = await fetch('http://127.0.0.1:3000/favorites/remove', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(song),
            });

            if (response.ok) {
                console.log('Song removed from favorites:', song.title, song.artist);
            } else {
                console.error('Failed to remove song from favorites:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Failed to remove song from favorites:', error);
        }
    };

    // Function to fetch collection names and populate the dropdown list
    const populateDropdown = async () => {
        try {
            const response = await fetch('http://127.0.0.1:3000/api/collections');
            const data = await response.json();
            setCollections(data);
        } catch (error) {
            console.error('Error fetching collections:', error);
        }
    };

    // Function to create a new playlist
    const createNewPlaylist = async () => {
        if (newPlaylistName.trim() === '') {
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
                    playlistName: newPlaylistName,
                    imagePath: currentSong.imagePath,
                }),
            });

            if (response.ok) {
                console.log('New playlist collection created:', newPlaylistName);
                setPopupVisible(false);
                setNewPlaylistName('');
                populateDropdown();
            } else {
                const errorData = await response.json();
                console.error('Failed to create playlist collection:', errorData.error);
                alert('Failed to create playlist collection. Please try again.');
            }
        } catch (error) {
            console.error('Failed to create playlist collection:', error);
            alert('Failed to create playlist collection. Please try again.');
        }
    };

    useEffect(() => {
        populateDropdown();
        // Fetch and set the playlist items from an API or a static list
        setPlaylistItems([
            {
                title: 'Song 1',
                artist: 'Artist 1',
                filePath: 'song1.mp3',
                imagePath: 'song1.jpg'
            },
            {
                title: 'Song 2',
                artist: 'Artist 2',
                filePath: 'song2.mp3',
                imagePath: 'song2.jpg'
            }
        ]);

        // Event listeners for audio player
        const audio = audioPlayer.current;
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', () => {
            if (isRepeatEnabled) {
                audio.currentTime = 0;
                audio.play();
            } else {
                playNext();
            }
        });

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('ended', () => {
                if (isRepeatEnabled) {
                    audio.currentTime = 0;
                    audio.play();
                } else {
                    playNext();
                }
            });
        };
    }, [isRepeatEnabled, playlistItems]);

    return (
        <div className="music-player">
            <div className="playlist">
                {playlistItems.map((song, index) => (
                    <div
                        key={index}
                        className={`playlist-item ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => playSong(song, index)}
                    >
                        <img src={song.imagePath} alt={song.title} />
                        <div className="song-details">
                            <h3>{song.title}</h3>
                            <p>{song.artist}</p>
                        </div>
                    </div>
                ))}
            </div>

            {currentIndex !== -1 && (
                <div className="bottom-division" style={{ display: showBottomDivision() }}>
                    <div className="current-song-details">
                        <img src={currentSong.imagePath} alt={currentSong.title} />
                        <div className="song-info">
                            <h3>{currentSong.title}</h3>
                            <p>{currentSong.artist}</p>
                        </div>
                    </div>

                    <div className="controls">
                        <button onClick={playPrevious}>Previous</button>
                        <button onClick={togglePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
                        <button onClick={playNext}>Next</button>
                        <button onClick={toggleRepeat}>{isRepeatEnabled ? 'Repeat On' : 'Repeat Off'}</button>
                    </div>

                    <div className="progress-bar">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={updateProgressBar()}
                            onChange={(e) => (audioPlayer.current.currentTime = (e.target.value / 100) * audioPlayer.current.duration)}
                        />
                    </div>

                    <div className="time-info">
                        <span>{currentTime}</span>
                        <span>{totalTime}</span>
                    </div>

                    <div className="volume-control">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={(e) => {
                                setVolume(e.target.value);
                                audioPlayer.current.volume = e.target.value;
                            }}
                        />
                    </div>

                    <button onClick={toggleFavorite}>{isFavorite ? 'Unfavorite' : 'Favorite'}</button>

                    <div className="dropdown">
                        <button onClick={() => setDropdownVisible(!dropdownVisible)}>Add to Playlist</button>
                        {dropdownVisible && (
                            <div className="dropdown-menu">
                                <ul>
                                    {collections.map((collection, index) => (
                                        <li key={index}>{collection}</li>
                                    ))}
                                </ul>
                                <button onClick={() => setPopupVisible(true)}>Create New Playlist</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {popupVisible && (
                <div className="popup">
                    <div className="popup-content">
                        <h3>Create New Playlist</h3>
                        <input
                            type="text"
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                        />
                        <button onClick={createNewPlaylist}>Create</button>
                        <button onClick={() => setPopupVisible(false)}>Cancel</button>
                    </div>
                </div>
            )}

            <audio ref={audioPlayer} />
        </div>
    );
};

export default MusicPlayer;  