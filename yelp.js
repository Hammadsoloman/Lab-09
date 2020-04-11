'use strict';

const help = require('./main.js');
// console.log(help)

function yelpHandler(request,response){
  console.log("amman new here")
  let city = request.query.search_query;
  const key = process.env.YELP_API_KEY;

  let url =`https://api.yelp.com/v3/businesses/search?location=${city}`;
  help.superagent(url)
  // console.log(  help.superagent(url) )
    .set({'Authorization':`Bearer ${key}`})
    .then(yelpData =>{
      console.log("newYelpData",yelpData)
      return yelpData.body.businesses.map((value) => {
        return new Yelp(value);
  
      })
      // response.status(200).json(yelpArray);
    })
    .then(data=>{
      response.status(200).json(data);
    console.log(data)    }

    )
    .catch((err) => console.log(err));
    
}

function Yelp(value){
  console.log(value);
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