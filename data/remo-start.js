"use strict";

let baseURLEle = document.createElement("base");
baseURLEle.setAttribute("href", "");

let link = document.createElement("link");
link.setAttribute("rel", "stylesheet");

let baseURL;

self.port.on('baseURL', function (url) {
  baseURL = url;
  baseURLEle.setAttribute("href", url);
  link.setAttribute("href", url+"remo-start.css");
});

document.addEventListener("StartAboutReps", function (e) {
  document.getElementsByTagName("head")[0].appendChild(baseURLEle);
  document.getElementsByTagName("head")[0].appendChild(link);

  window.addEventListener("load", function() {
    var imgs = document.getElementsByTagName("img");
    Array.prototype.slice.call(imgs).forEach(function(img) {
      var src = img.getAttribute("src");
      if (src.match(/:/)) return;
      img.setAttribute("src", baseURL+src);
    });
  }, false);
}, false, true);
