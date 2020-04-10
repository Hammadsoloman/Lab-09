'use strict';

const help = require('./main.js');

function checkLocation (request,response){
  const city = request.query.city;
  let sqlCheck = `SELECT * FROM locations WHERE search_query = '${city}';`;
  console.log(sqlCheck);

  help.client.query(sqlCheck)
    .then(result => {

      if(result.rows.length > 0){
        response.status(200).json(result.rows[0]);
      } else {
        getLocation(city)
          .then(locationData => {
            let theCity = locationData.search_query;s
            let format =  locationData.formatted_query;
            let lat = locationData.latitude;
            let lng = locationData.longitude;
            let safeValues = [theCity,format,lat,lng];
            let SQL = 'INSERT INTO locations (search_query,formatted_query,latitude,longitude) VALUES ($1,$2,$3,$4);';
            return help.client.query(SQL,safeValues)
              .then(result2 => {
                response.status(200).json(result2.rows[0]);
              })
              .catch (error => errorHandler(error));
          })
      }
    })
}




function getLocation(city) {

  let key = process.env.LOCATION_API_KEY;
  const url = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;


  return help.superagent.get(url)
    .then(geoData =>{

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
function errorHandler(error, request, response) {
  response.status(500).send(error);
}


module.exports = checkLocation;