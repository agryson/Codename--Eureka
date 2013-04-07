chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create("CNE/index.html",{frame: "none",'width': 1200,'height': 700});
});