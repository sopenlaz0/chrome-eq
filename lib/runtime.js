app.version = function () {
  return chrome.runtime.getManifest().version;
};

//app.on.connect: Event handler for when a connection is established with a port.
app.on.connect(function (port) {
  if (port) {
    if (port.name) {
      if (port.name in app) {
        app[port.name].port = port;
      }
    }
    //On disconnection, associated ports are updated, and storage is loaded.
    port.onDisconnect.addListener(function (e) {
      app.storage.load(function () {
        if (e) {
          if (e.name) {
            if (e.name in app) {
              app[e.name].port = null;
            }
          }
        }
      });
    });
    /*  */
    //n takes an argument e, which represents the message received 
    port.onMessage.addListener(function (e) {
      app.storage.load(function () {
        if (e) {
          if (e.path) {
            if (e.port) {
              if (e.port in app) {
                if (e.path === e.port + "-to-background") {
                  for (let id in app[e.port].message) {
                    if (app[e.port].message[id]) {
                      if (typeof app[e.port].message[id] === "function") {
                        if (id === e.method) {
                          app[e.port].message[id](e.data);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });
    });
  }
});

app.on.message(function (request, sender, sendResponse) {
  let error = chrome.runtime.lastError;
  let url =
    sender.tab && sender.tab.url
      ? sender.tab.url
      : sender.url
      ? sender.url
      : "";
  /*  */
  if (request) {
    if (request.action === "page-load") sendResponse(url);
    /*  */
    if (request.action === "app-icon-error") {
      let hostname = url ? new URL(url).hostname : "";
      /*  */
      core.initialize(function (items) {
        config.icon.update(items.eq, 3);
      });
    }
    if (request.action === "app-toggle") {
      config.addon.state = config.addon.state === "ON" ? "OFF" : "ON";
      app.tab.query.all({}, function (tabs) {
        if (tabs) {
          for (let i = 0; i < tabs.length; i++) {
            request.state = config.addon.state;
            app.tab.send.message(tabs[i].id, request);
          }
        }
      });
      /*  */
      sendResponse(config.addon.state);
      core.initialize(function (items) {
        config.icon.update(items.eq, 5);
      });
    }
    /*  */
    if (request.action === "app-set") {
      let items = {};
      items.eq = request.eq;
      items.ch = request.ch;
      items.presets = request.presets;
      items.selected = request.selected;
      /*  */
      app.storage.set(items, function () {
        app.tab.query.all({}, function (tabs) {
          if (tabs) {
            for (let i = 0; i < tabs.length; i++) {
              app.tab.send.message(tabs[i].id, request);
            }
          }
        });
        /*  */
        sendResponse(null);
        config.icon.update(items.eq, 6);
      });
    }
  }
});
