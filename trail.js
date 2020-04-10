'use strict';

const help = require('./main.js');

function trailsHandler(req, res) {
  const lat = req.query.latitude;
  const lon = req.query.longitude;
  getTrailData(lat, lon)
    .then((trailData) =>
      res.status(200).json(trailData)
    );
}
function getTrailData(lat, lon) {
  let key = process.env.TRAIL_API_KEY;
  const url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=500&key=${key}`;

  return help.superagent.get(url)
    .then((trailData) => {
      let trailArray = trailData.body.trails.map((value) => {
        return new Trail(value);
      });
      return trailArray;
    });
}
function Trail(value) {
  this.name = value.name;
  this.location = value.location;
  this.length = value.length;
  this.stars = value.stars;
  this.star_votes = value.starVotes;
  this.summary = value.summary;
  this.trail_url = value.url;
  this.conditions = value.conditionDetails;
  this.condition_date = value.conditionDate.slice(0, -9);
  this.condition_time = value.conditionDate.slice(-9);
}

module.exports = trailsHandler;