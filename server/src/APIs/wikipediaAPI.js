"use strict";
const request = require('request');
  
function getWiki (storage) {
  return new Promise ((resolve, reject) => {
    makeRequest(storage)
      .then((json) => formatResults(json))
      .then((results) => resolve(results))
  });
}

function makeRequest (storage) {
  return new Promise((resolve, reject) => {
    request({
      url: 'https://en.wikipedia.org/w/api.php',
      qs: {
        'format': 'json',
        'action': 'query',
        'prop': 'info|extracts',
        'inprop': "url",
        'exintro': '',
        'explaintext': '',
        'titles': storage.keyword  
      },
      method: 'GET'
    }, function (err, res, body) {
      if(err) {
        reject(err);
      } else {
        let json = JSON.parse(body);
        storage.wikipedia = json;
        resolve(storage);
      }
    });
  });
}

function formatResults (json) {
  console.log(json.wikipedia.query);
  for(let key in json.wikipedia.query.pages) {
    let formatted = {
      pageId: json.wikipedia.query.pages[key].pageid,
      url: json.wikipedia.query.pages[key].fullurl,
      title: json.wikipedia.query.pages[key].title,
      extract: json.wikipedia.query.pages[key].extract,
    };
    json.wikipedia = formatted;
    return json;
  }
}

module.exports = {
    getWiki: getWiki
}
