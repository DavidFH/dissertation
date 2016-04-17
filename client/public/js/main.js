var header = document.getElementById("header");
var start = document.getElementById("start");
var stop = document.getElementById("stop");
var canvas = document.getElementById("canvas");
var container = document.getElementById("container");
var footer = document.getElementById('footer');
var streamReference;

function startStream () {
  if (navigator.mediaDevices.getUserMedia) {
    var p = navigator.mediaDevices.getUserMedia({ audio: false, video: true });
      p.then(function(stream) {
      var video = createVideo();
      video.src = window.URL.createObjectURL(stream);
      streamReference = stream;
      stop.classList.remove("disabled");
      start.classList.add("disabled");
    });
    p.catch(function (err) { console.log(err) });
  } else {
    getMediaFallback();
  }
};

// if navigator.mediaDevices.getUserMedia fails... (It fails haaaard, bad compatibility!)
function getMediaFallback () {
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
  if (navigator.getUserMedia) {
    navigator.getUserMedia({video: true, audio: false}, function (stream) {
      var video = createVideo();
      if (video.mozSrcObject !== undefined) {
        video.mozSrcObject = stream;
      } else {
        video.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
      };
      video.play();
      streamReference = stream.getTracks()[0];
      stop.classList.remove("disabled");
      start.classList.add("disabled");
    }, function (err) {
        console.log(err);
    });
  } else {
    console.log('Native device media streaming (getUserMedia) not supported in this browser.');
  }
}

function createVideo () {
  var video = document.createElement("video");
  setAttributes(video, {"id": "video", "autoplay": true, "height": "100%", "width": "100%", "onclick": "takePicture()"});
  container.appendChild(video);
  return document.getElementById('video');
}


function stopStream () {
  streamReference.stop();
  start.classList.remove("disabled");
  stop.classList.add("disabled");
}

// finish this!!!
function notSupported () {
  
}

function stopped () {
  
}

function takePicture () {
  if (document.getElementById("video")) {
    var ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, 400, 300);
    document.querySelector('img').src = canvas.toDataURL('image/jpeg');
    var base64 = document.querySelector('img').src;
    
    makeRequest("POST", "http://localhost:3333/tagImage", base64, function (result) {
      footer.innerHTML = "";
      var carousel = '<div id="text-carousel" class="carousel slide" data-ride="carousel"><div class="row"><div class="col-xs-offset-3 col-xs-6"><div class="carousel-inner">'
      result.forEach(function (tag, index) {
        if (index == 0) {
          carousel += '<div class="item active"><div class="carousel-content"><div><button class="btn" onclick="uploadTag(this.innerHTML)">'+tag+'</button></div></div></div>';
        }
        carousel += '<div class="item"><div class="carousel-content"><div><button class="btn" onclick="uploadTag(this.innerHTML)">'+tag+'</button></div></div></div>'; 
      })
      carousel += '</div></div></div><a class="left carousel-control" href="#text-carousel" data-slide="prev"><span class="glyphicon glyphicon-chevron-left"></span></a><a class="right carousel-control" href="#text-carousel" data-slide="next"><span class="glyphicon glyphicon-chevron-right"></span></a></div>';
      footer.innerHTML = carousel;
      $('#text-carousel').carousel();
    });
  }
}

function uploadTag (tag) {
  if (document.getElementById("wiki").checked || document.getElementById("nyt").checked || document.getElementById("ebay").checked) {
    // Set Up Params
    var params = JSON.stringify({
      'tag': tag, 
      'flags': {
        'wiki': document.getElementById("wiki").checked,
        'nyt': document.getElementById("nyt").checked,
        'ebay': document.getElementById("ebay").checked
      }
    });
    // Make Request
    makeRequest("POST", "http://localhost:3333/getInformation?", params, function (result) {
      wikipediaDisplay(result.wikipedia);
      timesDisplay(result.nyt);
      ebayDisplay(result.ebay);
    });
  } else {
    $('#myModal').modal('show');
  }
}

// handle wikipedia response
function wikipediaDisplay (data) {
  if (data) {
    var wikipediaCon = document.getElementById("wikipediaResults");
    var wikipediaHeader = document.getElementById("wikipediaHeading");
    var wikipediaBody = document.getElementById("wikipediaBody");
    var wikipediaFooter = document.getElementById("wikipediaFooter");
    wikipediaCon.classList.remove("hide");
    wikipediaHeader.innerHTML = 'Wikipedia - ' + data.title + '<span class="glyphicon glyphicon-remove pull-right" onclick="closePanel(\'wikipediaResults\')"></span>';
    console.log(data.extract);
    if (data.extract != "") {
      if (data.extract.length >= 251) {
        var description = data.extract.substring(0, 250);
        wikipediaBody.innerHTML = description + '<a href="' + data.url + '">...</a>';
      } else {
        wikipediaBody.innerHTML = data.extract;
      }
    } else {
        wikipediaBody.innerHTML = "No returned description."
    }
    wikipediaFooter.innerHTML = '<a href="' + data.url + '">' + data.url + '</a>';
    $(wikipediaCon).draggable();
  }
}

// handle new york times resposne
function timesDisplay (data) {
  if (data) {
    var timesCon = document.getElementById("timesResults");
    var timesBody = document.getElementById("timesBody");
    timesCon.classList.remove("hide");
    console.log(data);
    var timesContents = ""
    data.forEach(function (item) {
        timesContents += '<div><h4>' + item.title + '<br/><small>' + item.pubDate.substring(0, 10) + '</small></h4><p>' + item.snippet + '</p><p><a href="#">' + item.url + '</a></p></div><div><hr/>';
    });
    timesBody.innerHTML = timesContents;
    $(timesCon).draggable();
  }
}

// handle ebay response
function ebayDisplay (data) {
  if (data) {
    console.log(data);
    var ebayCon = document.getElementById("ebayResults");
    var ebayBody = document.getElementById("ebayBody");
    ebayCon.classList.remove("hide");
    var ebayContents = "";
    data.forEach(function (auction) {
        ebayContents += '<div class="thumbnail"><img src="' + auction.imageURL[0] + '"><div class="caption"><h4>' + auction.title[0] + '<br/><small>$' + auction.currentPriceUsd + '</small></h4><p><a href="#">' + auction.URL[0] + '</a></p></div></div><hr/>';
    });
    ebayBody.innerHTML = ebayContents;
    $(ebayCon).draggable();
  }
}

function closePanel (id) {
  var panel = document.getElementById(id);
  panel.classList.add("hide");
}

// Helper Functions

// Make Requests
function makeRequest (method, url, params, callback) {
  // Set Up Request
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open(method, url, true);
  xmlhttp.send(params);
  
  // Handle Response
  xmlhttp.onreadystatechange = function(){
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
      callback(JSON.parse(xmlhttp.responseText));
    }
  }
}

// Set attributes
function setAttributes(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
}
