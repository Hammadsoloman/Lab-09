'use strict';

const help = require('./main.js');

const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);


function checkLocation (request,response){
  const city = request.query.city;
  let sqlCheck = `SELECT * FROM locations WHERE search_query=$1`;
  let safeValues=[city];
  client.query(sqlCheck,safeValues)
    .then(result => {

      if(result.rows.length > 0){
        response.status(200).json(result.rows[0]);
      } else {
        getLocation(city)
          .then(locationData => {
            // console.log("locationData :", locationData);
            let theCity = city;
            let format =  locationData.formatted_query;
            let lat = locationData.latitude;
            let lng = locationData.longitude;
            let safeValues = [theCity,format,lat,lng];
            let SQL = 'INSERT INTO locations (search_query,formatted_query,latitude,longitude) VALUES ($1,$2,$3,$4);';
            return client.query(SQL,safeValues)
              .then(result2 => {
                response.status(200).json(locationData);
              })
              .catch (error => errorHandler(error));
          })
      }
    })
}




function getLocation(city) {

  let key = process.env.GEOCODE_API_KEY;
  const url = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;

console.log(help.superagent.get(url));
  return help.superagent.get(url)

    .then(geoData =>{
      // console.log("new geoData:",geoData.body)

      const locationData = new Location(city, geoData.body);

      return locationData;
    })
    .catch(error=> console.log(error))

}

function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}
function errorHandler(error, request, response) {
  response.status(500).send(error);
}


client.connect();

module.exports = checkLocation;