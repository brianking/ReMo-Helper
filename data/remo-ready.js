/**
 * Actions for remo-start page
 */
document.addEventListener("RemoOpenAddonsManager", function (e) { 
  self.postMessage("openaddons") 
}, false, true);

self.port.on('version', function (version) {
  document.getElementById("version").textContent = 'v' + version;
});
