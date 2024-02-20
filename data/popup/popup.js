//provides the functionality for users to interact with presets, modify equalizer settings, and manage configurations within the Chrome extension's popup window.
config.selectedpreset = null;

config.sliderinputs = document.querySelectorAll('input[type="range"]');

config.setvalue = function (id, val) {
  document.getElementById(id).value = val;
};

config.elementvalue = function (id) {
  return document.getElementById(id).value;
};

config.setequalizer = function () {
  for (let i = 0; i < config.storage.eq.length; i++) {
    config.setvalue("ch-eq-slider-" + i, config.storage.eq[i].gain);
  }
};

config.updateequalizer = function () {
  for (let i = 0; i < 10; i++) {
    config.storage.eq[i + 1].gain = config.selectedpreset.gains[i];
  }
  /*  */
  config.setequalizer();
  chart.prepare(config.storage.eq);
  config.save();
};

config.getequalizer = function (t) {
  if (t.id) {
    let id = t.id.replace("ch-eq-slider-", "");
    if (id) return parseInt(id);
  }
  /*  */
  return 0;
};

config.tab = {
  query: {
    active: function (callback) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs && tabs.length) {
          callback(tabs[0]);
        }
      });
    },
  },
};

config.save = function () {
  chrome.runtime.sendMessage(
    {
      action: "app-set",
      presets: config.list,
      eq: config.storage.eq,
      ch: config.storage.ch,
      selected: config.getselected(),
    },
    function () {
      let error = chrome.runtime.lastError;
      config.update();
    }
  );
};

config.update = function () {
  chrome.storage.local.get(null, function (data) {
    if (data) {
      config.storage.eq = data.eq;
      config.storage.ch = data.ch;
      config.storage.presets = data.presets;
      if (data.presets) config.list = data.presets;
      if (data.selected) config.setselected(data.selected.name);
      /*  */
      config.setequalizer();
      config.loadsettings();
      document.getElementById("channels").checked = config.storage.ch.mono;
    }
  });
};

config.loadsettings = function () {
  let appendpreset = function (elm, presets, section) {
    let option = document.createElement("option");
    /*  */
    option.textContent = elm.name;
    option.setAttribute("value", ["preset", section, option.text].join("::"));
    if (config.isselected(elm)) option.setAttribute("selected", "selected");
    presets.appendChild(option, null);
  };
  /*  */
  let userpresets = config.getusers();
  let predefinedpresets = config.getpredefined();
  let flag = config.getselected().default === true;
  let presetdelete = document.getElementById("preset-delete");
  let userpresetsselect = document.getElementById("presets-select-user");
  let predefinedpresetsselect = document.getElementById(
    "presets-select-predefined"
  );
  /*  */
  if (flag) presetdelete.setAttribute("disabled", "disabled");
  else presetdelete.removeAttribute("disabled");
  /*  */
  userpresetsselect.textContent = "";
  predefinedpresetsselect.textContent = "";
  for (let i = 0; i < predefinedpresets.length; i++)
    appendpreset(predefinedpresets[i], predefinedpresetsselect, "default");
  for (let i = 0; i < userpresets.length; i++)
    if (!userpresets[i].default)
      appendpreset(userpresets[i], userpresetsselect, "my");
};

config.init = function (e) {
  config.storage.eq = e.eq;
  config.storage.ch = e.ch;
  config.storage.state = e.state;
  config.storage.presets = e.presets;
  /*  */
  let reset = document.getElementById("reset");
  let toggle = document.getElementById("toggle");
  let channels = document.getElementById("channels");
  let presets = document.getElementById("presets-select");
  /*  */
  let snapsliders = function (index, diff) {
    for (let i = 1; i < 10; i++) {
      diff = diff / 2;
      if (config.storage.eq[index - i] && config.storage.eq[index - i].f)
        config.storage.eq[index - i].gain =
          parseFloat(config.storage.eq[index - i].gain, 10) + diff;
      if (
        config.storage.eq[index + i] &&
        config.storage.eq[index + i].f !== undefined
      )
        config.storage.eq[index + i].gain =
          parseFloat(config.storage.eq[index + i].gain, 10) + diff;
    }
  };
  /*  */
  let onsliderchange = function (evt) {
    let slider = evt.target.getAttribute("eq");
    if (slider === "master")
      config.storage.eq[0].gain = config.elementvalue("ch-eq-slider-0");
    else {
      let index = config.getequalizer(evt.target);
      let diff = evt.target.value - config.storage.eq[index].gain;
      config.storage.eq[index].gain = evt.target.value;
      config.setequalizer();
      chart.prepare(config.storage.eq);
    }
    /*  */
    config.save();
  };
  /*  */
  for (let i = 0; i < config.sliderinputs.length; i++) {
    config.sliderinputs[i].onchange = onsliderchange;
    config.sliderinputs[i].oninput = onsliderchange;
  }
  /*  */
  channels.onchange = function (e) {
    config.storage.ch.mono = e.target.checked;
    config.save();
  };
  /*  */
  toggle.setAttribute("state", config.storage.state);
  toggle.onclick = function () {
    chrome.runtime.sendMessage({ action: "app-toggle" }, function (state) {
      let error = chrome.runtime.lastError;
      /*  */
      config.storage.state = state;
      toggle.setAttribute("state", config.storage.state);
    });
  };
  /*  */
  reset.onclick = function () {
    modal.confirm(
      "Do you want to reset all presets to the default values?",
      function () {
        for (let i = 0; i < config.storage.eq.length; i++) {
          config.storage.eq[i].gain = 0;
          if (!config.storage.eq[i].f) {
            config.storage.eq[i].gain = 1;
          }
        }
        /*  */
        config.setselected();
        config.setequalizer();
        config.storage.ch.mono = false;
        channels.classList.remove("on");
        chart.prepare(config.storage.eq);
        config.save();
      }
    );
  };
  /*  */
  presets.onchange = function (e) {
    config.selectedpreset = config.getselected();
    /*  */
    switch (e.target.value) {
      case "action::save":
        modal.confirm(
          'Do you want to save "' + config.selectedpreset.name + '" preset?',
          function () {
            for (let i = 0; i < config.selectedpreset.gains.length; i++)
              config.selectedpreset.gains[i] = config.elementvalue(
                "ch-eq-slider-" + (i + 1)
              );
            config.setpreset(config.selectedpreset);
            config.save();
          }
        );
        break;
      case "action::save-as":
        modal.prompt(
          "New preset name",
          function (name) {
            if (name && name.length > 0) {
              let preset = JSON.parse(JSON.stringify(config.selectedpreset));
              for (let i = 0; i < preset.gains.length; i++)
                preset.gains[i] = config.elementvalue(
                  "ch-eq-slider-" + (i + 1)
                );
              preset.name = name;
              config.setnewpreset(preset);
              config.setselected(name);
              config.save();
            }
          },
          function () {}
        );
        break;
      case "action::delete":
        modal.confirm(
          'Do you want to delete "' + config.selectedpreset.name + '" preset?',
          function () {
            config.removebyname(config.selectedpreset.name);
            config.save();
          }
        );
        break;
      case "action::reset":
        modal.confirm(
          'Do you want to reset "' + config.selectedpreset.name + '" preset?',
          function () {
            config.reset(config.storage, config.selectedpreset.name);
            config.setselected();
            config.updateequalizer();
            config.save();
          }
        );
        break;
      case "action::reset-all":
        modal.confirm(
          "Do you want to reset all presets to the default state?",
          function () {
            config.resetall(config.storage);
            config.setselected();
            config.updateequalizer();
            config.save();
          }
        );
        break;
      default:
        let val = e.target.value.split("::");
        config.setselected(val[2]);
        config.selectedpreset = config.getselected();
        config.updateequalizer();
        config.loadsettings();
        config.save();
    }
  };
  /*  */
  config.setequalizer();
  config.loadsettings();
  sliders.prepare();
  chart.prepare(config.storage.eq);
  channels.checked = config.storage.ch.mono;
};

config.load = function () {
 
  /*  */
  chrome.storage.local.get(null, function (data) {
    if (data) {
      if (data.presets) config.list = data.presets;
      if (data.selected) config.setselected(data.selected.name);
      /*  */
      config.init(data);
    }
  });
  /*  */
  window.removeEventListener("load", config.load, false);
};

window.addEventListener("load", config.load, false);
