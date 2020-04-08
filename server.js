'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
const PORT = process.env.PORT || 5050;
const key = process.env.GEOCODE_API_KEY;
const app = express();
app.use(cors());

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err =>{
  throw new Error (err);
});
app.get('/', (request, response) => {
  response.send('Home Page!');
});

app.get('/location', selectLocation);
app.get('/weather', weatherHandler);
app.get('/trails',trailsHandler);
app.get('/movies', moviesHandler);
app.use('*', notFoundHandler);
app.use(errorHandler);


/*******************************************************location************************************** */

function selectLocation (request,response){
  const city = request.query.city;
  let sqlCheck = `SELECT * FROM locations WHERE search_query = '${city}';`;
  client.query(sqlCheck)
    .then(result => {
      if(result.rows.length > 0){
        console.log('hell');
        
        response.status(200).json(result.rows[0]);
        // console.log(result.rows.length);
      } else {
        console.log('nope');
        
        findLocation(city)
          .then(locationData => {
            let myCity = locationData.search_query;
            let format =  locationData.formatted_query;
            let lat = locationData.latitude;
            let lon = locationData.longitude;
            let safeValues = [myCity,format,lat,lon];
            let SQL = 'INSERT INTO location (search_query,formatted_query,latitude,longitude) VALUES ($1,$2,$3,$4);';
            return client.query(SQL,safeValues)
              .then(result2 => {
                response.status(200).json(result2.rows[0]);
              })
              .catch (error => errorHandler(error));
          })
      }
    })
}

// Route Handlers
function findLocation(city){
  const url = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;
  return superagent.get(url)
    .then(geoData => {
      const locationData = new Location(city, geoData.body);
      return locationData;
    })
}
function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}


/*******************************************************Weather************************************** */

function weatherHandler(request, response) {
  let key2 = process.env.WEATHER_API_KEY;
  superagent(
    `https://api.weatherbit.io/v2.0/forecast/daily?city=${request.query.search_query}&key=${key2}`
  )
    .then((weatherRes) => {
      // console.log(weatherRes);
      const weatherSummaries = weatherRes.body.data.map((day) => {
        return new Weather(day);
      });
      response.status(200).json(weatherSummaries);
      // console.log(response)
    })
    .catch((err) => errorHandler(err, request, response));
}

function Weather(day) {
  this.forecast = day.weather.description;
  this.time = new Date(day.valid_date).toString().slice(0, 15);
}

/*******************************************************trails*******************************************/


function trailsHandler(request,response){
  const lat = request.query.latitude;
  const lon = request.query.longitude;

  selectTrailData(lat,lon)
    .then((trailData) =>
      response.status(200).json(trailData)
    );
}
// console.log(trailsHandler)
function selectTrailData(lat,lon){
  const url =`https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=500&key=${process.env.TRAIL_API_KEY}`;

  return superagent.get(url)
    .then((trailData)=>{
      let trailsSummaries = trailData.body.trails.map((val)=>{
        return new Trails (val);
      });
      return trailsSummaries;
    });
}
// console.log(trailsSummaries)


function Trails (val){
  this.name = val.name;
  this.location = val.location;
  this.length = val.length;
  this.stars = val.stars;
  this.star_votes = val.starVotes;
  this.summary = val.summary;
  this.trail_url = val.url;
  this.conditions = val.conditionDetails;
  this.condition_date = new Date (val.conditionDate).toString().slice(3,14);
  this.condition_time = new Date (val.conditionDate).toString().slice(15,24);
}


/****************************************************************movies************************************************************ */


function moviesHandler (request,response){
  let city = request.query.search_query;
  getMovieData(city)
    .then((newData)=>{
      response.status(200).json(newData)
    })
}
function getMovieData(city){
  const key = process.env.MOVIE_API_KEY;
  let url = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${city}`;
  console.log(url);
  return superagent.get(url)
    .then(moviesData =>{
      let moviesArray = moviesData.body.results.map((value) => {
        return new Movies(value);
      })
      return moviesArray;
    })
}
function Movies(value){
  this.title = value.title;
  this.overview =value.overview;
  this.average_votes = value.vote_average;
  this.total_votes= value.vote_count;
  this.image_url = value.image_url;
  this.popularity = value.popularity;
  this.released_on = value.release_date;
}
// console.log(Movies);

/******************************************************Helper function***************************** */
function notFoundHandler(request, response) {
  response.status(404).send('404 NOT FOUND');
}

function errorHandler(error, request, response) {
  response.status(500).send(error);
}
client
  .connect()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`my server is up and running on port ${PORT}`)
    );
  })
  .catch((err) => {
    throw new Error(`startup error ${err}`);
  });