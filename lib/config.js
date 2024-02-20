// config.js: Manages configuration settings and presets within the Chrome extension's popup window
// Object to hold configuration-related functions and data
var config = {};
 // Functions for setting, resetting, and getting presets
config.blacklist = { domains: [] };

config.whitelist = {
  set domains(val) {
    app.storage.write("whitelist", val);
  },
  get domains() {
    return app.storage.read("whitelist") ? app.storage.read("whitelist") : [];
  },
};

config.addon = {
  set state(val) {
    app.storage.write("state", val);
  },
  get state() {
    return app.storage.read("state") !== undefined
      ? app.storage.read("state")
      : "ON";
  },
};

//don't want to keep seeing the same old greeting every time,
config.welcome = {
  set lastupdate(val) {
    app.storage.write("lastupdate", val);
  },
  get lastupdate() {
    return app.storage.read("lastupdate") !== undefined
      ? app.storage.read("lastupdate")
      : 0;
  },
};

config.setting = {
  WHITELIST: [],
  CH: {
    snap: false,
    mono: false,
  },
  FT: {
    peak: "peaking",
    low: "lowshelf",
    high: "highshelf",
  },
  EQ: [
    { label: "master", gain: 1 },
    { label: "64", f: 64, gain: 0, type: "peaking" },
    { label: "32", f: 32, gain: 0, type: "lowshelf" },
    { label: "125", f: 125, gain: 0, type: "peaking" },
    { label: "250", f: 250, gain: 0, type: "peaking" },
    { label: "500", f: 500, gain: 0, type: "peaking" },
    { label: "1k", f: 1000, gain: 0, type: "peaking" },
    { label: "2k", f: 2000, gain: 0, type: "peaking" },
    { label: "4k", f: 4000, gain: 0, type: "peaking" },
    { label: "8k", f: 8000, gain: 0, type: "peaking" },
    { label: "16k", f: 16000, gain: 0, type: "highshelf" },
  ],
  PRESETS: [
    {
      name: "Club",
      default: true,
      gains: [0.0, 0.0, 4.8, 3.36, 3.36, 3.36, 1.92, 0.0, 0.0, 0.0],
    },
    {
      name: "Live",
      default: true,
      gains: [-2.88, 0.0, 2.4, 3.36, 3.36, 3.36, 2.4, 1.44, 1.44, 1.44],
    },
    {
      name: "Party",
      default: true,
      gains: [4.32, 4.32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 4.32, 4.32],
    },
    {
      name: "Pop",
      default: true,
      gains: [0.96, 2.88, 4.32, 4.8, 3.36, 0.0, -1.44, -1.44, 0.96, 0.96],
    },
    {
      name: "Soft",
      default: true,
      gains: [2.88, 0.96, 0.0, -1.44, 0.0, 2.4, 4.8, 5.76, 6.72, 7.2],
    },
    {
      name: "Ska",
      default: true,
      gains: [-1.44, -2.88, -2.4, 0.0, 2.4, 3.36, 5.28, 5.76, 6.72, 5.76],
    },
    {
      name: "Reggae",
      default: true,
      gains: [0.0, 0.0, 0.0, -3.36, 0.0, 3.84, 3.84, 0.0, 0.0, 0.0],
    },
    {
      name: "Default",
      default: true,
      gains: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    },
    {
      name: "Rock",
      default: true,
      gains: [4.8, 2.88, -3.36, -4.8, -1.92, 2.4, 5.28, 6.72, 6.72, 6.72],
    },
    {
      name: "Dance",
      default: true,
      gains: [5.76, 4.32, 1.44, 0.0, 0.0, -3.36, -4.32, -4.32, 0.0, 0.0],
    },
    {
      name: "Techno",
      default: true,
      gains: [4.8, 3.36, 0.0, -3.36, -2.88, 0.0, 4.8, 5.76, 5.76, 5.28],
    },
    {
      name: "Headphones",
      default: true,
      gains: [2.88, 6.72, 3.36, -1.92, -1.44, 0.96, 2.88, 5.76, 7.68, 8.64],
    },
    {
      name: "Soft rock",
      default: true,
      gains: [2.4, 2.4, 1.44, 0.0, -2.4, -3.36, -1.92, 0.0, 1.44, 5.28],
    },
    {
      name: "Classical",
      default: true,
      gains: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -4.32, -4.32, -4.32, -5.76],
    },
    {
      name: "Large Hall",
      default: true,
      gains: [6.24, 6.24, 3.36, 3.36, 0.0, -2.88, -2.88, -2.88, 0.0, 0.0],
    },
    {
      name: "Full Bass",
      default: true,
      gains: [4.8, 5.76, 5.76, 3.36, 0.96, -2.4, -4.8, -6.24, -6.72, -6.72],
    },
    {
      name: "Full Treble",
      default: true,
      gains: [-5.76, -5.76, -5.76, -2.4, 1.44, 6.72, 9.6, 9.6, 9.6, 10.08],
    },
    {
      name: "Laptop Speakers",
      default: true,
      gains: [2.88, 6.72, 3.36, -1.92, -1.44, 0.96, 2.88, 5.76, 7.68, 8.64],
    },
    {
      name: "Full Bass & Treble",
      default: true,
      gains: [4.32, 3.36, 0.0, -4.32, -2.88, 0.96, 4.8, 6.72, 7.2, 7.2],
    },
  ],
};

// 