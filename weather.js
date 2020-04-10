'use strict';

const help = require('./main.js');

function weatherHandler(request, response) {
  let city = request.query.search_query;
  let key2 = process.env.WEATHER_API_KEY;

  let url =  `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${key2}`
  help.superagent(url)
    .then((weatherRes) => {

      const weatherSummaries = weatherRes.body.data.map((day) => {
        return new Weather(day);
      });
      response.status(200).json(weatherSummaries);
    })
    .catch((err) => errorHandler(err, request, response));
}
function Weather(day) {
  this.forecast = day.weather.description;
  this.time = new Date(day.valid_date).toString().slice(0, 15);
}



function errorHandler(error, request, response) {
  response.status(500).send(error);
}

module.exports = weatherHandler;