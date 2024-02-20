// chrome.js: Handles Chrome-specific functionalities and interactions

// Object to hold Chrome-related functions and utilities
var app = {};

// Function to handle errors
app.error = function () {
  return chrome.runtime.lastError;
};

// Object to manage interactions with the extension popup
app.popup = {
  port: null, // Port for communication with the popup
  message: {}, // Object to store message callbacks
  // Function to register a callback for receiving messages from the background script
  receive: function (id, callback) {
    if (id) {
      app.popup.message[id] = callback;
    }
  },
  // Function to send a message to the popup
  send: function (id, data) {
    if (id) {
      chrome.runtime.sendMessage(
        { data: data, method: id, path: "background-to-popup" },
        app.error
      );
    }
  },
  // Function to post a message to the popup
  post: function (id, data) {
    if (id) {
      if (app.popup.port) {
        app.popup.port.postMessage({
          data: data,
          method: id,
          path: "background-to-popup",
        });
      }
    }
  },
};

// Object to manage context menu creation and updates
app.contextmenu = {
  id: "audio-equalizer-contextmenu-id", // ID for the context menu
  // Function to create a context menu item
  create: function (options, callback) {
    if (chrome.contextMenus) {
      chrome.contextMenus.create(options, function (e) {
        if (callback) callback(e);
      });
    }
  },
  // Function to update a context menu item
  update: function (id, options, callback) {
    if (chrome.contextMenus) {
      chrome.contextMenus.update(id, options, function (e) {
        if (callback) callback(e);
      });
    }
  },
  // Object to handle context menu click events
  on: {
    clicked: function (callback) {
      if (chrome.contextMenus) {
        chrome.contextMenus.onClicked.addListener(function (e) {
          app.storage.load(function () {
            callback(e);
          });
        });
      }
    },
  },
};

// Object to manage extension button interactions
app.button = {
  // Function to set the title of the extension button
  title: function (tabId, title, callback) {
    if (title) {
      let options = { title: title };
      if (tabId) options["tabId"] = tabId;
      chrome.action.setTitle(options, function (e) {
        if (callback) callback(e);
      });
    }
  },
  // Function to set the icon of the extension button
  icon: function (tabId, path, imageData, callback) {
    if (path && typeof path === "object") {
      let options = { path: path };
      if (tabId) options["tabId"] = tabId;
      chrome.action.setIcon(options, function (e) {
        if (callback) callback(e);
      });
    } else if (imageData && typeof imageData === "object") {
      let options = { imageData: imageData };
      if (tabId) options["tabId"] = tabId;
      chrome.action.setIcon(options, function (e) {
        if (callback) callback(e);
      });
    } else {
      let options = {
        path: {
          16: "../data/icons/" + (path ? path + "/" : "") + "16.png",
          32: "../data/icons/" + (path ? path + "/" : "") + "32.png",
          48: "../data/icons/" + (path ? path + "/" : "") + "48.png",
          64: "../data/icons/" + (path ? path + "/" : "") + "64.png",
        },
      };
      if (tabId) options["tabId"] = tabId;
      chrome.action.setIcon(options, function (e) {
        if (callback) callback(e);
      });
    }
  },
};

// Object to handle various extension events
app.on = {
  // Function to get information about the extension
  management: function (callback) {
    chrome.management.getSelf(callback);
  },
  // Function to add listener for extension installation
  installed: function (callback) {
    chrome.runtime.onInstalled.addListener(function (e) {
      app.storage.load(function () {
        callback(e);
      });
    });
  },
  // Function to add listener for extension startup
  startup: function (callback) {
    chrome.runtime.onStartup.addListener(function (e) {
      app.storage.load(function () {
        callback(e);
      });
    });
  },
  // Function to add listener for port connections
  connect: function (callback) {
    chrome.runtime.onConnect.addListener(function (e) {
      app.storage.load(function () {
        if (callback) callback(e);
      });
    });
  },
  // Function to add listener for storage changes
  storage: function (callback) {
    chrome.storage.onChanged.addListener(function (changes, namespace) {
      app.storage.update(function () {
        if (callback) {
          callback(changes, namespace);
        }
      });
    });
  },
  // Function to add listener for incoming messages
  message: function (callback) {
    chrome.runtime.onMessage.addListener(function (
      message,
      sender,
      sendResponse
    ) {
      app.storage.load(function () {
        callback(message, sender, sendResponse);
      });
      return true;
    });
  },
};

// Object to manage interactions with extension content scripts
app.page = {
  port: null, // Port for communication with content scripts
  message: {}, // Object to store message callbacks
  sender: {
    port: {},
  },
  // Function to register a callback for receiving messages from content scripts
  receive: function (id, callback) {
    if (id) {
      app.page.message[id] = callback;
    }
  },
  // Function to post a message to content scripts
  post: function (id, data, tabId) {
    if (id) {
      if (tabId) {
        if (app.page.sender.port[tabId]) {
          app.page.sender.port[tabId].postMessage({
            data: data,
            method: id,
            path: "background-to-page",
          });
        }
      } else if (app.page.port) {
        app.page.port.postMessage({
          data: data,
          method: id,
          path: "background-to-page",
        });
      }
    }
  },
  // Function to send a message to content scripts
  send: function (id, data, tabId, frameId) {
    if (id) {
      chrome.tabs.query({}, function (tabs) {
        let tmp = chrome.runtime.lastError;
        if (tabs && tabs.length) {
          let message = {
            method: id,
            data: data ? data : {},
            path: "background-to-page",
          };
          tabs.forEach(function (tab) {
            if (tab) {
              message.data.tabId = tab.id;
              message.data.top = tab.url ? tab.url : "";
              message.data.title = tab.title ? tab.title : "";
              if (tabId !== null && tabId !== undefined) {
                if (tabId === tab.id) {
                  if (frameId !== null && frameId !== undefined) {
                    chrome.tabs.sendMessage(
                      tab.id,
                      message,
                      { frameId: frameId },
                      app.error
                    );
                  } else {
                    chrome.tabs.sendMessage(tab.id, message, app.error);
                  }
                }
              } else {
                chrome.tabs.sendMessage(tab.id, message, app.error);
              }
            }
          });
        }
      });
    }
  },
};

// Object to manage extension storage
app.storage = {
  local: {}, // Object to store local storage data
  // Function to read data from local storage
  read: function (id) {
    return app.storage.local[id];
  },
  // Function to get data from local storage
  get: function (data, callback) {
    chrome.storage.local.get(data, function (e) {
      if (callback) {
        callback(e);
      }
    });
  },
  // Function to set data in local storage
  set: function (data, callback) {
    chrome.storage.local.set(data, function (e) {
      if (callback) {
        callback(e);
      }
    });
  },
  // Function to update local storage data
  update: function (callback) {
    if (app.session) app.session.load();
    chrome.storage.local.get(null, function (e) {
      app.storage.local = e;
      if (callback) {
        callback("update");
      }
    });
  },
  // Function to write data to local storage
  write: function (id, data, callback) {
    let tmp = {};
    tmp[id] = data;
    app.storage.local[id] = data;
    chrome.storage.local.set(tmp, function (e) {
      if (callback) {
        callback(e);
      }
    });
  },
  // Function to load data from local storage
  load: function (callback) {
    const keys = Object.keys(app.storage.local);
    if (keys && keys.length) {
      if (callback) {
        callback("cache");
      }
    } else {
      app.storage.update(function () {
        if (callback) callback("disk");
      });
    }
  },
};

// Object to manage tab-related functionalities
app.tab = {
  // Object to send messages to tabs
  send: {
    message: function (tabId, message, callback) {
      if (tabId) {
        chrome.tabs.sendMessage(tabId, message, function (e) {
          let error = chrome.runtime.lastError;
          if (callback) callback(e);
        });
      }
    },
  },
  // Function to open a new tab
  open: function (url, index, active, callback) {
    var properties = {
      url: url,
      active: active !== undefined ? active : true,
    };
    if (index !== undefined) {
      if (typeof index === "number") {
        properties.index = index + 1;
      }
    }
    chrome.tabs.create(properties, function (tab) {
      if (callback) callback(tab);
    });
  },
  // Object to handle tab-related events
  on: {
    // Function to add listener for tab updates
    updated: function (callback) {
      chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
        app.storage.load(function () {
          if (info && info.status) {
            callback(info, tab);
          }
        });
      });
    },
    // Function to add listener for tab activations
    activated: function (callback) {
      chrome.tabs.onActivated.addListener(function (activeInfo) {
        app.storage.load(function () {
          chrome.tabs.get(activeInfo.tabId, function (tab) {
            let error = chrome.runtime.lastError;
            callback(tab ? tab : { id: activeInfo.tabId });
          });
        });
      });
    },
  },
  // Object to query information about tabs
  query: {
    // Function to get the index of the active tab
    index: function (callback) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var tmp = chrome.runtime.lastError;
        if (tabs && tabs.length) {
          callback(tabs[0].index);
        } else callback(undefined);
      });
    },
    // Function to get the active tab
    active: function (callback) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var tmp = chrome.runtime.lastError;
        if (tabs && tabs.length) {
          callback(tabs[0]);
        } else callback(undefined);
      });
    },
    // Function to get information about all tabs
    all: function (options, callback) {
      chrome.tabs.query(options ? options : {}, function (tabs) {
        let tmp = chrome.runtime.lastError;
        if (tabs && tabs.length) {
          callback(tabs);
        } else callback(undefined);
      });
    },
  },
  // Function to reload a tab
  reload: function (tabId, options, callback) {
    if (tabId) {
      if (options && typeof options === "object") {
        chrome.tabs.reload(tabId, options, function (e) {
          if (callback) callback(e);
        });
      } else {
        chrome.tabs.reload(
          tabId,
          {
            bypassCache: options !== undefined ? options : false,
          },
          function (e) {
            if (callback) callback(e);
          }
        );
      }
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        let tmp = chrome.runtime.lastError;
        if (tabs && tabs.length) {
          if (options && typeof options === "object") {
            chrome.tabs.reload(tabs[0].id, options, function (e) {
              if (callback) callback(e);
            });
          } else {
            chrome.tabs.reload(
              tabs[0].id,
              {
                bypassCache: options !== undefined ? options : false,
              },
              function (e) {
                if (callback) callback(e);
              }
            );
          }
        }
      });
    }
  },
};
