'use strict';
let help = {};

// DOTENV (Read our Enviroment Variable)
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
help.superagent = require('superagent');
const pg = require('pg');
help.pg=pg;

// Application Setup
help.PORT = process.env.PORT || 5050;
const server = express();
help.server=server;
server.use(cors());
help.client = new pg.Client(process.env.DATABASE_URL);

module.exports = help;