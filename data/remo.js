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
  var items = data.query.categorymembers;
  var sopCount = items.length;

  // Log some data for number of SOPs
  console.log("# of SOPs = "+sopCount);

  // Dynamically create entries for available SOPs
  items.forEach(function (item) {
    var sopItem = document.createElement('li');
    var sopLink = document.createElement('a');
    var sopIcon = document.createElement('i');
    var sopName = cleanSOPName(item.title);

    sopLink.href = cleanSOPUrl(item.title);
    sopLink.setAttribute("target", "_blank");

    var liText = document.createTextNode(sopName);

    sopIcon.className = "icon-large icon-bookmark";
    sopLink.appendChild(liText);
    sopItem.appendChild(sopIcon);
    sopItem.appendChild(sopLink);
    sopsList.appendChild(sopItem);
  });
  haveSOPs = true;
}

function cleanSOPName(aSOP) {
  return aSOP.substring(aSOP.lastIndexOf("/")+1);
}

function cleanSOPUrl(aUrl) {
  return "https://wiki.mozilla.org/" + aUrl;
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
