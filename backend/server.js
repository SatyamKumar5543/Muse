const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { ObjectId } = require('mongodb');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/AniMuse', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
  });

// Define a schema for the playlists
const playlistSchema = new mongoose.Schema({
  id: ObjectId,
  title: String,
  artist: String,
  filePath: String,
  imagePath: String,
});

// Create models for each playlist
const createPlaylistModel = (name) => mongoose.model(name, playlistSchema, name);

// Initialize known playlist collections
const collections = [
  'DemonSlayer', 'VinlandSaga', 'YourName', 'AttackOnTitan',
  'WeatheringWithYou', 'Suzume', 'LiSA', 'Aimer',
  'ManWithMission', 'HiroyukiSawano', 'Radwimps', 'Milet',
].reduce((acc, name) => {
  acc[name] = createPlaylistModel(name);
  return acc;
}, {});

// Define the ListOfPlaylist schema and model
const ListOfPlaylistSchema = new mongoose.Schema({
  id: ObjectId,
  name: String,
  imagePath: String,
});
const ListOfPlaylist = mongoose.model('ListOfPlaylist', ListOfPlaylistSchema, 'ListOfPlaylist');
const Playlist = mongoose.model('Playlist', playlistSchema);

// Route to retrieve all playlists
app.get('/api/playlists', async (req, res) => {
  try {
    const playlists = await ListOfPlaylist.find().exec();
    res.json(playlists.map(playlist => ({ name: playlist.name, imagePath: playlist.imagePath })));
  } catch (error) {
    console.error('Failed to retrieve playlists', error);
    res.status(500).json({ error: 'Failed to retrieve playlists' });
  }
});

// Route to retrieve items from a specific playlist
app.get('/api/playlistItems/:playlistName', async (req, res) => {
  try {
    const playlistName = req.params.playlistName;
    const playlist = await ListOfPlaylist.findOne({ name: playlistName }).exec();
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    const PlaylistItem = mongoose.model(playlistName, playlistSchema, playlistName);
    const playlistItems = await PlaylistItem.find().exec();

    res.json(playlistItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve playlist items' });
  }
});

// Route to check if a song is in favorites
app.post('/favorites', async (req, res) => {
  try {
    const { title, artist } = req.body;
    const favoriteSong = await Favorite.findOne({ title, artist });
    res.json(favoriteSong);
  } catch (error) {
    console.error('Failed to check favorite:', error);
    res.status(500).json({ error: 'Failed to check favorite' });
  }
});

// Route to add a song to favorites
app.post('/favorites/add', async (req, res) => {
  try {
    const { title, artist, filePath, imagePath } = req.body;
    const existingSong = await Favorite.findOne({ title, artist });
    if (existingSong) {
      return res.status(200).json({ message: 'Song already in favorites' });
    }

    const favoriteSong = new Favorite({
      title,
      artist,
      filePath: filePath.toString(),
      imagePath: imagePath.toString(),
    });
    await favoriteSong.save();
    res.status(200).json({ message: 'Song added to favorites' });
  } catch (error) {
    console.error('Failed to add song to favorites:', error);
    res.status(500).json({ error: 'Failed to add song to favorites' });
  }
});

// Route to remove a song from favorites
app.post('/favorites/remove', async (req, res) => {
  try {
    const { title, artist, filePath, imagePath } = req.body;
    await Favorite.deleteOne({ title, artist, filePath, imagePath });
    res.sendStatus(200);
  } catch (error) {
    console.error('Failed to remove song from favorites:', error);
    res.status(500).json({ error: 'Failed to remove song from favorites' });
  }
});

const collectionx = {}; // Initialize as an empty object

app.get('/api/collections', async (req, res) => {
  try {
    const collectionsList = await mongoose.connection.db.collection('ListOfPlaylist').find().toArray();
    collectionsList.forEach((collection) => {
      const { name } = collection;
      collectionx[name] = mongoose.model(name, playlistSchema, name);
    });
    res.json(Object.keys(collectionx)); // Return an array of collection names
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

app.post('/api/addToCollection/:collectionName', async (req, res) => {
  try {
    const collectionName = decodeURIComponent(req.params.collectionName);
    const { title, artist, filePath, imagePath } = req.body;

    // Debug: Print collectionName to verify
    console.log(`Adding to collection: ${collectionName}`);

    // Check if the collection exists in collectionx
    if (!collectionx[collectionName]) {
      console.error('Collection not found:', collectionName);
      return res.status(404).json({ error: 'Collection not found' });
    }

    // Proceed with adding song to the collection
    const existingSong = await collectionx[collectionName].findOne({ title, artist });
    if (existingSong) {
      return res.status(200).json({ message: 'Song already in the collection' });
    }

    const newSong = new collectionx[collectionName]({
      title,
      artist,
      filePath: filePath.toString(),
      imagePath: imagePath.toString(),
    });
    await newSong.save();
    res.status(200).json({ message: 'Song added to the collection' });
  } catch (error) {
    console.error('Failed to add song to the collection:', error);
    res.status(500).json({ error: 'Failed to add song to the collection' });
  }
});

// Route to create a new playlist collection
app.post('/api/createPlaylistCollection', async (req, res) => {
  try {
    const { playlistName, imagePath } = req.body;
    const existingCollection = await mongoose.connection.db.listCollections({ name: playlistName }).next();

    if (existingCollection) {
      return res.status(400).json({ error: 'Playlist with the same name already exists' });
    }

    await mongoose.connection.db.createCollection(playlistName);
    await ListOfPlaylist.create({ name: playlistName, imagePath: imagePath.toString() });
    res.status(200).json({ message: 'New playlist collection created successfully' });
  } catch (error) {
    console.error('Failed to create playlist collection:', error);
    res.status(500).json({ error: 'Failed to create playlist collection' });
  }
});

// Favorite schema and model
const favoriteSchema = new mongoose.Schema({
  id: ObjectId,
  title: String,
  artist: String,
  filePath: String,
  imagePath: String,
});
const Favorite = mongoose.model('Favorites', favoriteSchema, 'Favorites');

// Route to retrieve favorite items
app.get('/favorite', async (req, res) => {
  try {
    const playlistItems = await Favorite.find().exec();
    res.json(playlistItems);
  } catch (error) {
    console.error('Failed to retrieve playlist items', error);
    res.status(500).json({ error: 'Failed to retrieve playlist items' });
  }
});

// Dynamic routes for known collections
const dynamicRoutes = [
  'demonSlayer', 'vinlandSaga', 'yourName', 'attackOnTitan',
  'weatheringWithYou', 'suzume', 'liSA', 'aimer',
  'manWithMission', 'hiroyukiSawano', 'radwimps', 'milet',
];

dynamicRoutes.forEach((route) => {
  app.get(`/${route}`, async (req, res) => {
    try {
      const routeKey = route.charAt(0).toUpperCase() + route.slice(1);
      if (!collections[routeKey]) {
        return res.status(404).json({ error: 'Playlist collection not found' });
      }
      const PlaylistModel = collections[routeKey];
      const playlistItems = await PlaylistModel.find().exec();
      res.json(playlistItems);
    } catch (error) {
      console.error(`Failed to retrieve items from ${route}`, error);
      res.status(500).json({ error: `Failed to retrieve items from ${route}` });
    }
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});