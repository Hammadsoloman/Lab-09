'use strict';

const help = require('./main.js');

function moviesHandler (request,response){
  let city = request.query.search_query;

  getMovieData(city)
    .then((moData)=>{
      response.status(200).json(moData)
    })
}

function getMovieData(city){
  const key = process.env.MOVIE_API_KEY;

  let url = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${city}`;
  console.log(url);

  return help.superagent.get(url)
    .then(moviesData =>{
      let moviesArray = moviesData.body.results.map((value) => {
        return new Movies(value);
      })
      return moviesArray;
    })
    .catch((err) => errorHandler(err));
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


function errorHandler(error, request, response) {
  response.status(500).send(error);
}
module.exports = moviesHandler;