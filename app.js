require("dotenv").config();

const express = require("express");
const hbs = require("hbs");

const SpotifyWebApi = require("spotify-web-api-node");

const bodyParser = require("body-parser");

const app = express();

app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: "http://localhost:3000/",
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch((error) =>
    console.log("Something went wrong when retrieving an access token", error)
  );

app.get("/", (req, res, next) => {
  res.render("home.hbs");
});

app.get("/artist-search", (req, res, next) => {
  //console.log(req.query);
  const artistName = req.query.artists.split(' ').join('');
  spotifyApi
    .searchArtists(encodeURIComponent(artistName))
    .then((response) => {
      //console.log(response.body);
      res.render("search.hbs", {
        foundArtist: response.body.artists,
      });
    })
    .catch((err) => {
      next(err);
    });
});

app.get("/albums/:artistId", (req, res, next) => {
  spotifyApi
    .getArtist(req.params.artistId)
    .then((response) => {
      const nameIn = response.body.name;
      spotifyApi.getArtistAlbums(req.params.artistId).then((response) => {
        //console.log(response.body.items);
        res.render("albums.hbs", {
          allAlbums: response.body.items,
          nameIn,
        });
      });
    })

    .catch((err) => {
      next(err);
    });
});

app.get("/albums/tracks/:albumId", (req, res, next) => {
  //console.log(req.params.albumId);
  spotifyApi
    .getAlbumTracks(req.params.albumId)
    .then((response) => {
      //console.log(response.body.items);
      res.render("tracks.hbs", {
        allTracks: response.body.items,
      });
    })
    .catch((err) => {
      next(err);
    });
});

app.listen(3000, () =>
  console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊")
);
