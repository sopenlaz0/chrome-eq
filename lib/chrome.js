var app = {};

app.error = function () {
  return chrome.runtime.lastError;
};

app.popup = {
  port: null,
  message: {},
  receive: function (id, callback) {
    if (id) {
      app.popup.message[id] = callback;
    }
  },
  send: function (id, data) {
    if (id) {
      chrome.runtime.sendMessage(
        { data: data, method: id, path: "background-to-popup" },
        app.error
      );
    }
  },
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

app.contextmenu = {
  id: "audio-equalizer-contextmenu-id",
  create: function (options, callback) {
    if (chrome.contextMenus) {
      chrome.contextMenus.create(options, function (e) {
        if (callback) callback(e);
      });
    }
  },
  update: function (id, options, callback) {
    if (chrome.contextMenus) {
      chrome.contextMenus.update(id, options, function (e) {
        if (callback) callback(e);
      });
    }
  },
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

app.button = {
  title: function (tabId, title, callback) {
    if (title) {
      let options = { title: title };
      if (tabId) options["tabId"] = tabId;
      //
      chrome.action.setTitle(options, function (e) {
        if (callback) callback(e);
      });
    }
  },
  icon: function (tabId, path, imageData, callback) {
    if (path && typeof path === "object") {
      let options = { path: path };
      if (tabId) options["tabId"] = tabId;
      //
      chrome.action.setIcon(options, function (e) {
        if (callback) callback(e);
      });
    } else if (imageData && typeof imageData === "object") {
      let options = { imageData: imageData };
      if (tabId) options["tabId"] = tabId;
      //
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
      /*  */
      if (tabId) options["tabId"] = tabId;
      chrome.action.setIcon(options, function (e) {
        if (callback) callback(e);
      });
    }
  },
};

app.on = {
  management: function (callback) {
    chrome.management.getSelf(callback);
  },
  installed: function (callback) {
    chrome.runtime.onInstalled.addListener(function (e) {
      app.storage.load(function () {
        callback(e);
      });
    });
  },
  startup: function (callback) {
    chrome.runtime.onStartup.addListener(function (e) {
      app.storage.load(function () {
        callback(e);
      });
    });
  },
  connect: function (callback) {
    chrome.runtime.onConnect.addListener(function (e) {
      app.storage.load(function () {
        if (callback) callback(e);
      });
    });
  },
  storage: function (callback) {
    chrome.storage.onChanged.addListener(function (changes, namespace) {
      app.storage.update(function () {
        if (callback) {
          callback(changes, namespace);
        }
      });
    });
  },
  message: function (callback) {
    chrome.runtime.onMessage.addListener(function (
      message,
      sender,
      sendResponse
    ) {
      app.storage.load(function () {
        callback(message, sender, sendResponse);
      });
      /*  */
      return true;
    });
  },
};

app.page = {
  port: null,
  message: {},
  sender: {
    port: {},
  },
  receive: function (id, callback) {
    if (id) {
      app.page.message[id] = callback;
    }
  },
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
          /*  */
          tabs.forEach(function (tab) {
            if (tab) {
              message.data.tabId = tab.id;
              message.data.top = tab.url ? tab.url : "";
              message.data.title = tab.title ? tab.title : "";
              /*  */
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

app.storage = {
  local: {},
  read: function (id) {
    return app.storage.local[id];
  },
  get: function (data, callback) {
    chrome.storage.local.get(data, function (e) {
      if (callback) {
        callback(e);
      }
    });
  },
  set: function (data, callback) {
    chrome.storage.local.set(data, function (e) {
      if (callback) {
        callback(e);
      }
    });
  },
  update: function (callback) {
    if (app.session) app.session.load();
    /*  */
    chrome.storage.local.get(null, function (e) {
      app.storage.local = e;
      if (callback) {
        callback("update");
      }
    });
  },
  write: function (id, data, callback) {
    let tmp = {};
    tmp[id] = data;
    app.storage.local[id] = data;
    //
    chrome.storage.local.set(tmp, function (e) {
      if (callback) {
        callback(e);
      }
    });
  },
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

app.tab = {
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
  open: function (url, index, active, callback) {
    var properties = {
      url: url,
      active: active !== undefined ? active : true,
    };
    /*  */
    if (index !== undefined) {
      if (typeof index === "number") {
        properties.index = index + 1;
      }
    }
    /*  */
    chrome.tabs.create(properties, function (tab) {
      if (callback) callback(tab);
    });
  },
  on: {
    updated: function (callback) {
      chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
        app.storage.load(function () {
          if (info && info.status) {
            callback(info, tab);
          }
        });
      });
    },
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
  query: {
    index: function (callback) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var tmp = chrome.runtime.lastError;
        if (tabs && tabs.length) {
          callback(tabs[0].index);
        } else callback(undefined);
      });
    },
    active: function (callback) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var tmp = chrome.runtime.lastError;
        if (tabs && tabs.length) {
          callback(tabs[0]);
        } else callback(undefined);
      });
    },
    all: function (options, callback) {
      chrome.tabs.query(options ? options : {}, function (tabs) {
        let tmp = chrome.runtime.lastError;
        if (tabs && tabs.length) {
          callback(tabs);
        } else callback(undefined);
      });
    },
  },
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
