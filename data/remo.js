/**
 * Remo panel script
 */
self.on("message", function (sops) {
  parseSOPs(sops);
});

// SOP data processing from wiki
var haveSOPs = false;

function parseSOPs(sops) {
  if (!sops || haveSOPs)
  	return;

  var sopsList = document.getElementById("sop-list");
  var data = sops;
  var items = data.ask.results.items;
  var sopCount = data.ask.results.count;

  // Log some data for number of SOPs 
  console.log("# of SOPs = "+sopCount);

  // Dinamically create entries for available SOPs   
  for (var i = 0; i < parseInt(sopCount); i++) {
    var sopItem = document.createElement('li');
    var sopLink = document.createElement('a');
    var sopIcon = document.createElement('i');
    var sopName = cleanSOPName(items[i].title.mTextform);

    sopLink.href = cleanSOPUrl(items[i].uri);
    sopLink.setAttribute("target", "_blank");

    var liText = document.createTextNode(sopName);

    sopIcon.className = "icon-large icon-bookmark";
    sopLink.appendChild(liText);
    sopItem.appendChild(sopIcon);
    sopItem.appendChild(sopLink);
    sopsList.appendChild(sopItem);
  }
  haveSOPs = true;
}

function cleanSOPName(aSOP) {
  return aSOP.substring(aSOP.lastIndexOf("/")+1);
}

function cleanSOPUrl(aUrl) {
  // e.g. https:\/\/wiki.mozilla.org\/index.php?title=ReMo\/SOPs\/Attending an Event
  // But it works without cleanup
  return aUrl;
}

function handleLinkClick(event) {
      var t = event.target;
      if (t.nodeName.toLowerCase() == 'a' &&
          t.parentNode.nodeName.toLowerCase() != "dd")
      {
        self.port.emit('click-link', t.toString());
        event.preventDefault();
      }
}

// Send link click notifications so we can close the panel
window.addEventListener('click', function(event) { handleLinkClick(event); } , false);
