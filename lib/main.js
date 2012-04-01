// setup a widget for dispaying the result
var remowidget = require("widget");

const self = require("self");
const simpleStorage = require("simple-storage");
const pageMod = require('page-mod');
const tabs = require("tabs");
var Request = require("request").Request;
var {Cc, Ci} = require("chrome");
 
// get the data directory
var data = require("self").data;

var myworker = null;

var sops = null;

// disable debug logging for AMO
//var console = new function() {}; console.debug = function() {};

var panel = require("panel").Panel({
    width: 500,
    height: 420,
    contentURL: data.url('remo.html'),
    contentScriptFile: [data.url("remo.js"),
                        data.url("foundation/javascripts/jquery.min.js"), 
                        data.url("foundation/javascripts/modernizr.foundation.js"),
                        data.url("foundation/javascripts/foundation.js"),
                        data.url("foundation/javascripts/app.js")]
});

// define the widget and icon:
remowidget.Widget({
  id: "remo-icon",
  label: "ReMo Companion",
  contentURL: data.url('Remo16.png'),
  panel: panel,
  tooltip: "ReMo Helper",
  anchor: "top",
  onClick: function() {
    // pass in the SOP data
    panel.postMessage(sops);
  }
});

pageMod.PageMod(
{
    include: [self.data.url('remo-start.html').toString()],
    contentScriptWhen: 'ready',
    contentScriptFile: self.data.url("remo-start.js"),
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

var openRemoPage = function()
{
    var url = self.data.url("remo-start.html");

    var windows = require("windows").browserWindows;

    for each (var window in windows)
    {
        for each (var tab in window.tabs)
        {
            if (tab.url == url)
            {
                tab.activate();
                return;
            }
        }
    }

    tabs.open({
      url: self.data.url("remo-start.html"),
      onOpen: function(tab) {
          simpleStorage.storage.hasShownFirstRun = true;
      }
    });
}

var listOfSOPs = Request({
  url: "https://wiki.mozilla.org/api.php?action=ask&q=[[Category:Remosop]]&format=json",
  onComplete: function (response) {
    // How do we check for errors?
    sops = response.json;
    //console.log(response.text);
  }
});

var getSOPs = function()
{
    console.debug("Retrieving SOPs...");
    listOfSOPs.get();
}

exports.main = function(options, callback)
{
  console.debug("Initializing ReMo Helper");
  if (!simpleStorage.storage.hasShownFirstRun)
      openRemoPage();
  getSOPs();
};
