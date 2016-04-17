"use strict";
const request = require('request'),
  key = '97d68f226b85ceec87f32f18bc0e3e71:1:74993352';
  
function getTimes (storage) {
  return new Promise ((resolve, reject) => {
    makeRequest(storage)
      .then((json) => formatResults(json))
      .then((results) => resolve(results));
  });
}

function makeRequest (storage) {
  return new Promise((resolve, reject) => {
    request({
      url: 'http://api.nytimes.com/svc/search/v2/articlesearch.json',
      qs: {
        'q': storage.keyword,
        'api-key': key
      },
      method: 'GET'
    }, function (err, res, body) {
      if(err) {
        reject(err);
      } else {
        let json = JSON.parse(body);
        storage.nyt = json;
        resolve(storage);
      }
    });
  });
}

function formatResults (json) {
  let formatted = json.nyt.response.docs.map((article) => {
      return {
          'url': article.web_url,
          'title': article.headline.main,
          'snippet': article.snippet,
          'pubDate': article.pub_date           
      };
  });
  json.nyt = formatted;
  return json;
}

module.exports = {
    getTimes: getTimes
}
