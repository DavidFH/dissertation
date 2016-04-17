"use strict";
const request = require('request'),
  key = '97d68f226b85ceec87f32f18bc0e3e71:1:74993352';
  
function getAuctions (storage) {
  return new Promise ((resolve, reject) => {
    makeRequest(storage)
      .then((json) => formatResults(json))
      .then((results) => resolve(results))
  });
}

function makeRequest (storage) {
  return new Promise((resolve, reject) => {
    request({
      url: 'http://svcs.ebay.com/services/search/FindingService/v1',
      qs: {
        'OPERATION-NAME': 'findItemsByKeywords',
        'SERVICE-VERSION': '1.0.0',
        'SECURITY-APPNAME': 'DavidFen-disserta-PRD-9e805b337-0e43edb4',
        'RESPONSE-DATA-FORMAT': 'json',
        'REST-PAYLOAD': '',
        'keywords': storage.keyword,
        'paginationInput.entriesPerPage': '5'
      },
      method: 'GET'
    }, function (err, res, body) {
      if(err) {
        reject(err);
      } else {
        let json = JSON.parse(body);
        storage.ebay = json;
        resolve(storage);
      }
    });
  });
}

function formatResults (json) {
  let formatted = json.ebay.findItemsByKeywordsResponse[0].searchResult[0].item.map((auction) => {
      return {
        'itemId': auction.itemId[0],
        'title': auction.title,
        'URL': auction.viewItemURL,
        'imageURL': auction.galleryURL,
        'currentPriceUsd': auction.sellingStatus[0].currentPrice[0].__value__
      }
  });
  json.ebay = formatted;
  return json;
}

module.exports = {
    getAuctions: getAuctions
}
