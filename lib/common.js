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
      items.whitelist = e.whitelist ? e.whitelist : config.setting.WHITELIST;
      // Pass initialized items to the callback function
      callback(items);
    });
  },
  // Object containing functions to update various components
  update: {
    // Function to update addon status
    addon: function () {
      // Retrieve data from storage
      app.storage.get(null, function (data) {
        app.tab.query.active(function (tab) {
          // Get active tab
          if (tab && tab.url && tab.url.indexOf("http") === 0) {
            config.icon.update(data.eq, 1);
            let domains = config.whitelist.domains;
            let hostname = new URL(tab.url).hostname;
            /*  */
            app.contextmenu.update("equalizer-status-enable", {
              enabled: domains.indexOf(hostname) === -1,
            });
            app.contextmenu.update("equalizer-status-disable", {
              enabled: domains.indexOf(hostname) !== -1,
            });
          }
        });
      });
    },
  },
  // Function to load core functionality
  load: function () {
    // Create context menu items
    app.contextmenu.create(
      {
        contexts: ["page"],
        id: app.contextmenu.id,
        title: "Audio Equalizer",
        documentUrlPatterns: ["*://*/*"],
      },
      app.error
    );
    // Create context menu item to add to whitelist
    app.contextmenu.create(
      {
        enabled: false,
        contexts: ["page"],
        title: "Add to whitelist",
        parentId: app.contextmenu.id,
        id: "equalizer-status-enable",
        documentUrlPatterns: ["*://*/*"],
      },
      app.error
    );
       // Create context menu item to remove from whitelist
    app.contextmenu.create(
      {
        enabled: true,
        contexts: ["page"],
        parentId: app.contextmenu.id,
        id: "equalizer-status-disable",
        title: "Remove from whitelist",
        documentUrlPatterns: ["*://*/*"],
      },
      app.error
    );
   // Initialize extension settings
    core.initialize(function (items) {
       // Save initialized settings to storage and update icon
      app.storage.set(items, function () {
        config.icon.update(items.eq, 2);
      });
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
          let domains = config.whitelist.domains;
          let hostname = new URL(tab.url).hostname;
          domains.push(hostname);
          domains = domains.filter(function (item, index, input) {
            return input.indexOf(item) === index;
          });
          config.whitelist.domains = domains;
          /*  */
          app.contextmenu.update("equalizer-status-enable", { enabled: false });
          app.contextmenu.update("equalizer-status-disable", { enabled: true });
          app.tab.reload(tab.id);
        });
      }
      /*  */
      if (e.menuItemId === "equalizer-status-disable") {
        app.tab.query.active(function (tab) {
          let domains = config.whitelist.domains;
          let hostname = new URL(tab.url).hostname;
          let index = domains.indexOf(hostname);
          if (index !== -1) domains.splice(index, 1);
          config.whitelist.domains = domains;
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
