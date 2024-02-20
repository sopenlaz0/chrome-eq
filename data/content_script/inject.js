// Listens for messages from the web page and the extension's background script
window.addEventListener("message", function (e) {
  // Handles messages from the "audio-equalizer" app
  if (e.data.app === "audio-equalizer") {
    // Notifies background script to change app icon to error state
    if (e.data.action === "app-icon-error") {
      chrome.runtime.sendMessage({ action: "app-icon-error" }, function () {
        return chrome.runtime.lastError;
      });
    }
    // Notifies background script to change app icon to normal state
    if (e.data.action === "app-icon-normal") {
      chrome.runtime.sendMessage({ action: "app-icon-normal" }, function () {
        return chrome.runtime.lastError;
      });
    }
  }
}, false);

// Listens for messages from the extension's background script
chrome.runtime.onMessage.addListener(function (request) {
  // Posts a message to the web page to toggle the app state
  if (request.action === "app-toggle") {
    window.postMessage({ action: "app-toggle", state: request.state, app: "audio-equalizer" }, "*");
  }
  // Posts a message to the web page to set the app settings
  if (request.action === "app-set") {
    window.postMessage({ action: "app-set", app: "audio-equalizer", value: { eq: request.eq, ch: request.ch } }, "*");
  }
});

// Sends a message to the background script upon page load
chrome.runtime.sendMessage({ action: "page-load" }, function (url) {
  let error = chrome.runtime.lastError;
  // Injects another script into the web page after loading
  if (url) {
    chrome.storage.local.get(null, function (data) {
      let hostname = new URL(url).hostname;
      if (valid) {
        let script = document.getElementById("audio-equalizer-script");
        if (!script) {
          script = document.createElement("script");
          // Sets attributes for the injected script
          script.type = "text/javascript";
          script.dataset.data = JSON.stringify(data);
          script.onload = function () {
            script.remove();
          };
          script.setAttribute("id", "audio-equalizer-script");
          script.src = chrome.runtime.getURL("data/content_script/page_context/inject.js");
          // Appends the script to the document
          document.documentElement.appendChild(script);
        }
      }
    });
  }
});
