/* ReMo panel script */

self.on("message", function(sops) {
  parseSOPs(sops);
});

/* SOP data processing from wiki */

var haveSOPs = false;

var parseSOPs = function(sops)
{
  if (!sops || haveSOPs)
  	return;
  var sopsList = document.getElementById("sop-list");
  var data = sops;
  var items = data.ask.results.items;
  var sopCount = data.ask.results.count;

  console.log("# of SOPs = "+sopCount);

  for (var i=0; i<parseInt(sopCount); i++) {
    var sopItem = document.createElement('li');
    var sopLink = document.createElement('a');
    var sopName = cleanSOPName(items[i].title.mTextform);
    sopLink.href = cleanSOPUrl(items[i].uri);
    sopLink.setAttribute("target", "_blank");
    var liText = document.createTextNode(sopName);
    sopLink.appendChild(liText);
    sopItem.appendChild(sopLink);
    sopsList.appendChild(sopItem);
  }
  haveSOPs = true;
}

var cleanSOPName = function(aSOP)
{
  return aSOP.substring(aSOP.lastIndexOf("/")+1);
}

var cleanSOPUrl = function(aUrl)
{
  // e.g. https:\/\/wiki.mozilla.org\/index.php?title=ReMo\/SOPs\/Attending an Event
  // But it works without cleanup
  return aUrl;
}
