"use strict";
const fs = require("fs"),
  tag = require('./tagImage'),
  information = require('./getInformation');

module.exports = class Router {
  constructor (server) {
    
    // Tag and Return
    server.post('/tagImage', (req, res) => {
      tag.tagImage(req)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => console.log(err));
    });    
    
    // Collect Data
    server.post('/getInformation', (req, res) => {
      let requested = JSON.parse(req.body);
      information.getInformation(requested.tag, requested.flags)
        .then((result) => res.send(result))
        .catch((err) => res.send(err));
    });
  }
};
