// setup a widget for dispaying the result
var remowidget = require("widget");

const self = require("self");
const simpleStorage = require("simple-storage");
const pageMod = require('page-mod');
const tabs = require("tabs");
var Request = require("request").Request;
var {Cc, Ci, Cu} = require("chrome");

var {XPCOMUtils} = Cu.import("resource://gre/modules/XPCOMUtils.jsm");
 
// get the data directory
var data = require("self").data;

var myworker = null;

var sops = null;

// disable debug logging for releases
//var console = new function() {}; console.debug = function() {};

var panel = require("panel").Panel({
    width: 500,
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
    include: data.url("remo-start.html"),
    contentScriptWhen: 'ready',
    contentScriptFile: data.url("remo-start.js"),
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

/* about:reps */
/* This will not be turned on until path issues are resolved in the SDK
   See bugs 759190 and 760233 */

function AboutModule() {
  ios : Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
}
AboutModule.prototype = {
  uri: Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService).newURI(data.url("remo-start.html"), null, null),
  classDescription: "about:reps About module",
  classID: Components.ID("22DD3A3E-FDD6-44B0-BA37-F810A43B0DFD"),
  contractID: '@mozilla.org/network/protocol/about;1?what=reps',

  QueryInterface: XPCOMUtils.generateQI([Ci.nsIAboutModule]),

  newChannel : function(aURI) {
    let chan = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService).newChannelFromURI(this.uri);
    chan.originalURI = aURI;
    return chan;
  },
  getURIFlags: function(aURI) 0
};

(function registerComponents() {
  var componentManager = Components.manager
                                 .QueryInterface(Components.interfaces.nsIComponentRegistrar);
  for (let [,cls] in Iterator([AboutModule])) {
    try {
      const factory = {
        _cls: cls,
        createInstance: function(outer, iid) {
          if (outer) {
            throw Components.results.NS_ERROR_NO_AGGREGATION;
          }
          return new cls();
        }
      };
      componentManager.registerFactory(cls.prototype.classID, cls.prototype.classDescription, cls.prototype.contractID, factory);
      //unload(function() {
      //  componentManager.unregisterFactory(factory._cls.prototype.classID, factory);
      //});
    }
    catch (ex) {
      //console.log(LOG_ERROR, "failed to register module: " + cls.name, ex);
      console.log("failed to register module: " + cls.name + " - " + ex);
    }
  }
})();

/* end about:reps */

var openRemoPage = function(url, callback)
{
    var windows = require("windows").browserWindows;

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
  url: "https://wiki.mozilla.org/api.php?action=ask&q=[[Category:Remosop]]&format=json",
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
  if (!simpleStorage.storage.hasShownFirstRun) {
    openRemoPage(data.url("remo-start.html"));
    //openRemoPage("about:reps");
    simpleStorage.storage.hasShownFirstRun = true;
  }
  getSOPs();
};
