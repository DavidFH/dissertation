"use strict";
const wikipedia = require('./APIs/wikipediaAPI'),
  times = require('./APIs/timesAPI'),
  ebay = require('./APIs/ebayAPI');

function getInformation (tag, flags) {
  return new Promise ((resolve, reject) => {
    let storage = {
        keyword: tag,
        wikipedia: '',
        ebay: '',
        nyt: ''
    };
    
    if (flags.wiki == true && flags.ebay == true && flags.nyt == true) {
      
      wikipedia.getWiki(storage)
        .then((wikiResult) => ebay.getAuctions(wikiResult))
        .then((ebayResult) => times.getTimes(ebayResult))
        .then((timesResult) => resolve(timesResult));
        
    } else if (flags.wiki == true && flags.ebay == true) {
      
      wikipedia.getWiki(storage)
        .then((wikiResult) => ebay.getAuctions(wikiResult))
        .then((ebayResult) => resolve(ebayResult));
        
    } else if (flags.wiki == true && flags.nyt == true) {
      
      wikipedia.getWiki(storage)
        .then((wikiResult) => times.getTimes(wikiResult))
        .then((timesResult) => resolve(timesResult));
        
    } else if (flags.ebay == true && flags.nyt == true) {
      
      ebay.getAuctions(storage)
        .then((ebayResult) => times.getTimes(ebayResult))
        .then((timesResult) => resolve(timesResult));
        
    } else if (flags.wiki == true) {
      
      wikipedia.getWiki(storage)
        .then((results) => resolve(results));
        
    } else if (flags.ebay == true) {
      
      ebay.getAuctions(storage)
        .then((results) => resolve(results));
        
    } else if (flags.nyt == true) {
      
      times.getTimes(storage)
        .then((results) => resolve(results));
        
    } else {
      resolve('no tags provided');
    }
  })
}

module.exports = {
    getInformation: getInformation
}
