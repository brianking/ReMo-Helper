// setup a widget for dispaying the result
var remowidget = require("sdk/widget");

const self = require("sdk/self");
const simpleStorage = require("sdk/simple-storage");
const pageMod = require('sdk/page-mod');
const tabs = require("sdk/tabs");
var Request = require("sdk/request").Request;
//const protocol = require('protocol');


// get the data directory
var data = require("sdk/self").data;

var myworker = null;

var sops = null;

// disable debug logging for releases
//var console = new function() {}; console.debug = function() {};

var panel = require("sdk/panel").Panel({
    width: 530,
    height: 420,
    contentURL: data.url('remo.html'),
    contentScriptFile: [data.url("remo.js"),
                        data.url("foundation/javascripts/jquery.min.js"),
                        data.url("foundation/javascripts/foundation.js"),
                        data.url("foundation/javascripts/app.js")]
});

panel.port.on("click-link", function(url) {
  console.debug(url);
  openRemoPage(url);
  panel.hide();
});

// define the widget and icon:
remowidget.Widget({
  id: "remo-icon",
  label: "Mozilla Reps Companion",
  contentURL: data.url('Remo16.png'),
  panel: panel,
  tooltip: "Mozilla Reps Companion",
  anchor: "top",
  onClick: function() {
    // pass in the SOP data
    panel.postMessage(sops);
  }
});

pageMod.PageMod(
{
    include: [data.url("remo-start.html"), "about:reps"],
    contentScriptWhen: 'ready',
    contentScriptFile: data.url("remo-ready.js"),
    onAttach: function(worker)
    {
        myworker = worker;

        worker.port.emit('version', self.version);

        worker.on("message", function(msg)
        {
            if (msg == 'openaddons') { tabs.open({url: "about:addons"}); }
        });
    }
});


/* end about:reps */

var openRemoPage = function(url, callback)
{
    var windows = require("sdk/windows").browserWindows;

    for each (var window in windows)
    {
        for each (var tab in window.tabs)
        {
            if (tab.url == url)
            {
                tab.activate();
                window.activate();
                return;
            }
        }
    }

    tabs.open({
      url: url,
      onOpen: function(tab) {
          if (callback)
              callback();
      }
    });
}

var listOfSOPs = Request({
  url: "https://wiki.mozilla.org/api.php?format=json&action=query&list=categorymembers&cmtitle=Category:Remosop&cmprop=title&cmlimit=500",
  onComplete: function (response) {
    // How do we check for errors?
    sops = response.json;
  }
});

var getSOPs = function()
{
    listOfSOPs.get();
}

exports.main = function(options, callback)
{
  console.debug("Initializing the Mozilla Reps Companion");

  /* about:reps */
  /* This will not be turned on until path issues are resolved in the SDK
     See bugs 759190 and 760233 */
  /*
  protocol.about('reps', {
    onRequest: function(request, response) {
      response.contentType = "text/html";
      response.end(data.load("remo-start.html").replace(/\{\s*page\.baseurl\s*\}/, self.data.url("")));
      return;
    }
  }).register();
  */

  if (!simpleStorage.storage.hasShownFirstRun) {
    openRemoPage(data.url("remo-start.html"));
    //openRemoPage("about:reps");
    simpleStorage.storage.hasShownFirstRun = true;
  }
  getSOPs();
};
