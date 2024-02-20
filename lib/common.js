// common.js: Library of common functions and utilities used across the extension
// Object to hold common functions and utilities
var core = {
  // Function to start the core functionality
  start: function () {
    core.load();
  },
  // Function to install the core functionality
  install: function () {
    core.load();
  },
  // Function to initialize the extension settings
  initialize: function (callback) {
    // Retrieve settings from storage and pass them to the callback function
    app.storage.get(null, function (e) {
      // Initialize items with default values or values from storage
      let items = {};
      items.state = e.state ? e.state : "ON";
      items.ft = e.ft ? e.ft : config.setting.FT;
      items.eq = e.eq ? e.eq : config.setting.EQ;
      items.ch = e.ch ? e.ch : config.setting.CH;
      items.presets = e.presets ? e.presets : config.setting.PRESETS;
      // Pass initialized items to the callback function
      callback(items);
    });
  },

 
  // Object containing action functions
  action: {
    storage: function (changes, namespace) {
     // Implementation details for storage changes
    },
    contextmenus: function (e) {
      if (e.menuItemId === "equalizer-status-enable") {
        app.tab.query.active(function (tab) {
          let hostname = new URL(tab.url).hostname;
          domains.push(hostname);
          domains = domains.filter(function (item, index, input) {
            return input.indexOf(item) === index;
          });
          /*  */
          app.contextmenu.update("equalizer-status-enable", { enabled: false });
          app.contextmenu.update("equalizer-status-disable", { enabled: true });
          app.tab.reload(tab.id);
        });
      }
      /*  */
      if (e.menuItemId === "equalizer-status-disable") {
        app.tab.query.active(function (tab) {
          let hostname = new URL(tab.url).hostname;
          let index = domains.indexOf(hostname);
          if (index !== -1) domains.splice(index, 1);
          /*  */
          app.contextmenu.update("equalizer-status-enable", { enabled: true });
          app.contextmenu.update("equalizer-status-disable", {
            enabled: false,
          });
          app.tab.reload(tab.id);
        });
      }
    },
  },
};
// Add event listeners for tab updates and context menu clicks
app.tab.on.updated(core.update.addon);
app.tab.on.activated(core.update.addon);
app.contextmenu.on.clicked(core.action.contextmenus);

// Add event listeners for extension startup and installation
app.on.startup(core.start);
app.on.installed(core.install);
app.on.storage(core.action.storage);
app.tab.on.updated(core.update.addon);
app.tab.on.activated(core.update.addon);
app.contextmenu.on.clicked(core.action.contextmenus);

app.on.startup(core.start);
app.on.installed(core.install);
app.on.storage(core.action.storage);
