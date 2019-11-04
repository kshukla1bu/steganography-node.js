'use strict';

const axios = require('axios');


function UserWs(baseUrl) {
  this.usersUrl = baseUrl;
}

module.exports = UserWs;

