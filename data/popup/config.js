var config = {
  // Array to store presets
  list: [],
  // Variable for the selected preset
  selected: false,
  // Storage settings for equalizer (eq) and channels (ch)
  storage: {
    eq: {},
    ch: {},
  },
  // Add a new preset to the list
  setnewpreset: function (preset) {
    // Add preset to list
    delete preset["default"];
    config.list.push(preset);
  },
  // Reset all presets to default
  resetall: function (e) {
    config.selected = null;
    config.list = JSON.parse(JSON.stringify(e.presets));
  },
  // Check if a preset is selected
  isselected: function (preset) {
    let tmp = config.getselected();
    return preset.name === tmp.name && preset.default === tmp.default;
  },
  // Get the selected preset
  getselected: function () {
    if (!config.selected) config.selected = config.getbyname("default");
    return config.selected;
  },
  // Set a preset as selected by name
  setselected: function (name) {
    config.selected = config.getbyname(name);
    return config.getselected();
  },
  // Update a preset with new settings
  setpreset: function (preset) {
    for (let i = 0, l = config.list.length; i < l; i++) {
      if (config.list[i].name === preset.name) config.list[i] = preset;
    }
  },
  // Sort presets alphabetically
  sort: function (e) {
    return e.sort(function (a, b) {
      if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
      if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
      return 0;
    });
  },
  // Reset a preset to its original state
  reset: function (e, n) {
    let old = config.getbyname(n, JSON.parse(JSON.stringify(e.presets)));
    for (let i = 0; i < config.list.length; i++) {
      if (config.list[i].name === n) config.list[i] = old;
    }
    return old;
  },
  // Get user-created presets
  getusers: function () {
    let userlist = [];
    for (let i = 0; i < config.list.length; i++) {
      if (config.list[i].default !== true) userlist.push(config.list[i]);
    }
    return config.sort(userlist);
  },
  // Get predefined presets
  getpredefined: function () {
    let retList = [];
    for (let i = 0; i < config.list.length; i++) {
      if (config.list[i].default === true) retList.push(config.list[i]);
    }
    return retList;
  },
  // Get preset by name
  getbyname: function (name, presets) {
    name = name ? name + "" : "";
    presets = presets ? presets : config.list;
    for (let i = 0; i < presets.length; i++) {
      let flag = presets[i].name.toLowerCase() === name.toLowerCase();
      if (flag) return presets[i];
    }
    return null;
  },
  // Remove preset by name
  removebyname: function (name) {
    name = name ? name + "" : "";
    for (let i = 0; i < config.list.length; i++) {
      let flag_1 = config.list[i].default !== true;
      let flag_2 = config.list[i].name.toLowerCase() === name.toLowerCase();
      if (flag_1 && flag_2) {
        config.list.splice(i, 1);
        config.selected = null;
        config.getselected();
        return true;
      }
    }
    return false;
  },
};
