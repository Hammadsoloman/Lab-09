'use strict';

const help = require('./main.js');

// handle any route
help.server.get('/',(request,response) => {
  response.status(200).send('server Lab-09 is work ');
});

const checkLocation = require('./location');
help.server.get('/location' , checkLocation);

const weatherHandler = require('./weather');
help.server.get('/weather',weatherHandler);

const trailsHandler = require('./trail');
help.server.get('/trails',trailsHandler);

const moviesHandler = require('./movie');
help.server.get('/movies',moviesHandler);

const yelpHandler = require('./movie');
help.server.get('/yelp',yelpHandler);


help.client.connect()
  .then(()=>{
    help.server.listen(help.PORT, () => {
      console.log(`Listening on PORT${help.PORT}`);
    });
  })


help.server.use('*', notFoundHandler);

function notFoundHandler(request, response) {
  response.status(404).send('NOT FOUND');
}
