'use strict';

const help = require('./main.js');

function yelpHandler(request,response){
  let city = request.query.search_query;
  const key = process.env.YELP_API_KEY;

  let url =` https://api.yelp.com/v3/businesses/search/location${city}`;
  help.superagent(url)
    .set({'Authorization':`Bearer ${key}`})
    .then(yelData =>{
      let yelpArray = yelData.body.businesses.map((value) => {
        return new Yelp(value);
      })
      response.status(200).json(yelpArray);
    })
    .catch((err) => errorHandler(err, request, response));
}

function Yelp(value){
  this.name = value.name;
  this.image_url = value.image_url;
  this.price = value.price;
  this.rating= value.rating;
  this.url = value.url;
}
function errorHandler(error, request, response) {
  response.status(500).send(error);
}




module.exports = yelpHandler;