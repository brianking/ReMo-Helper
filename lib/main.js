// This is an active module of the ReMo Add-on
exports.main = function() {};

// setup a widget for dispaying the result
var remowidget = require("widget");
 
// get the data directory
var data = require("self").data;
 
 
// define the widget and icon:
remowidget.Widget({
  id: "remo-icon",
  label: "ReMo Companion",
  contentURL: data.url('Remo16.png'),
  panel: require("panel").Panel
  ({
    width: 500,
    height: 420,
    contentURL: data.url('remo.html'),
  }),
  tooltip: "ReMo Companion",
  anchor: "top"
});
