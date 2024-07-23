import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <div className="container" id="CAnime">
        <div className="heading">
          <h2>Anime</h2>
        </div>
        <div className="content">
          <div className="albums-container" id="Anime">
            <Link to="/Playlist?collection=demonSlayer">
              <div className="album-card">
                <img src="/Images/DemonSlayer/DemonSlayer.jpeg" alt="Demon Slayer" />
                <h3 className="album-title">Demon Slayer</h3>
              </div>
            </Link>
            <Link to="/Playlist?collection=vinlandSaga">
              <div className="album-card">
                <img src="/Images/VinlandSaga/VinlandSaga.png" alt="Vinland Saga" />
                <h3 className="album-title">Vinland Saga</h3>
              </div>
            </Link>
            <Link to="/Playlist?collection=yourName">
              <div className="album-card">
                <img src="/Images/YourName/YourName.jpg" alt="Album 3" />
                <h3 className="album-title">Your Name</h3>
              </div>
            </Link>
            <Link to="/Playlist?collection=attackOnTitan">
              <div className="album-card">
                <img src="/Images/AttackOnTitan/AttackOnTitan1.jpg" alt="Album 4" />
                <h3 className="album-title">Attack On Titan</h3>
              </div>
            </Link>
            <Link to="/Playlist?collection=weatheringWithYou">
              <div className="album-card">
                <img src="/Images/WeatheringWithYou/WeatheringWithYou.jpg" alt="Album 5" />
                <h3 className="album-title">Weathering With You</h3>
              </div>
            </Link>
            <Link to="/Playlist?collection=suzume">
              <div className="album-card">
                <img src="/Images/Suzume/Suzume.jpg" alt="Album 6" />
                <h3>Suzume</h3>
              </div>
            </Link>
            {/* Add more albums here as needed */}
            <div className="icon" id="right-icon-Anime">
              <i className="fa-solid fa-angle-right"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="container" id="CArtist">
        <div className="heading">
          <h2>Artist</h2>
        </div>
        <div className="content">
          <div className="albums-container" id="Artist">
            <div className="icon" id="left-icon-Artist">
              <i className="fa-solid fa-angle-left"></i>
            </div>
            <Link to="/Playlist?collection=liSA">
              <div className="album-card">
                <img src="/Images/Singers/LiSA.jpg" alt="Artist 1" />
                <h3>LiSA</h3>
              </div>
            </Link>
            <Link to="/Playlist?collection=aimer">
              <div className="album-card">
                <img src="/Images/Singers/Aimer.jpg" alt="Artist 2" />
                <h3>Aimer</h3>
              </div>
            </Link>
            <Link to="/Playlist?collection=manWithMission">
              <div className="album-card">
                <img src="/Images/Singers/ManWithMission.jpg" alt="Artist 3" />
                <h3>Man With Mission</h3>
              </div>
            </Link>
            <Link to="/Playlist?collection=hiroyukiSawano">
              <div className="album-card">
                <img src="/Images/Singers/HiroyukiSawano.jpg" alt="Artist 4" />
                <h3>Hiroyuki Sawano</h3>
              </div>
            </Link>
            <Link to="/Playlist?collection=milet">
              <div className="album-card">
                <img src="/Images/Singers/milet.jpg" alt="Artist 5" />
                <h3>Milet</h3>
              </div>
            </Link>
            <Link to="/Playlist?collection=radwimps">
              <div className="album-card">
                <img src="/Images/Singers/Radwimps.jpg" alt="Artist 6" />
                <h3>RADWIMPS</h3>
              </div>
            </Link>
            {/* Add more artists here as needed */}
            <div className="icon" id="right-icon-Artist">
              <i className="fa-solid fa-angle-right"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;