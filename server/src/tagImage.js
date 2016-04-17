"use strict";
const request = require('request');
var token = undefined;

function tagImage (req) {
  return new Promise ((resolve, reject) => {
    request({
        url: 'https://api.clarifai.com/v1/tag',
        qs: {access_token: token},
        method: 'POST',
        form: {
          encoded_data: new Buffer(req.body.substring(22, req.body.length))
        }
      }, function (err, res, body) {
        if(err) {
          reject(err);
        } else {
          let data = JSON.parse(body);
          resolve(data.results[0].result.tag.classes);
        }
      });
  })
}

function getToken (req) {
  request({
    url: 'https://api.clarifai.com/v1/token',
    qs: {
      "client_id": "zSfVuIt1jOdlt0gViIfJsdbpf9uNhT8f9IGprToc",
      "client_secret": "m2p3DBlCRuy0ftxNiJEiyHM2ib_6xT1HI0gYRse9",
      "grant_type": "client_credentials"    
    },
    method: 'POST'
  }, function (err, res, body) {
    if(err) {
      console.error(err);
    } else {
      let data = JSON.parse(body);
      token = data.access_token;
    }
  });
}

module.exports = {
    tagImage: tagImage,
    getToken: getToken
}
