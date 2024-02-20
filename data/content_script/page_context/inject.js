// Targets audio and video elements within web pages, applying audio equalization effects through the Web Audio API
{
  var core = {
    log: false, // Flag for logging
    script: document.currentScript, // Reference to the current script element
    hostname: function (url) { // Function to extract hostname from URL
      // Extracts hostname from URL
      let match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
      let flag =
        match !== null &&
        match.length > 2 &&
        typeof match[2] === "string" &&
        match[2].length > 0;
      return flag ? match[2] : null;
    },
    equalizer: {
      targets: [], // List of audio and video elements to which equalizer is applied
      filters: [], // List of equalizer filters
      storage: {}, // Storage for equalizer settings
      source: null, // Audio source node
      context: null, // Audio context
      gain: function () { // Function to create gain filter
        let filter = core.equalizer.context.createGain();
        filter.channelCountMode = "explicit";
        filter.gain.value = 1;
        return filter;
      },
      biquad: function (e) { // Function to create biquad filter
        let filter = core.equalizer.context.createBiquadFilter();
        filter.type = e.type || core.equalizer.storage.ft.low;
        filter.frequency.value = e.f || 0;
        filter.gain.value = e.gain || 0;
        filter.Q.value = 1;
        return filter;
      },
      set: function (o) { // Function to set equalizer settings
        if (o && o.eq && o.ch && core.equalizer.filters.length > 0) {
          core.equalizer.filters[0].channelCount = o.ch.mono ? 1 : core.equalizer.filters[0]._defaultChannelCount ? core.equalizer.filters[0]._defaultChannelCount : 2;
          core.equalizer.filters.forEach(function (f, i) {
            f.gain.value = o.eq[i].gain;
          });
        }
      },
      toggle: function (state) { // Function to toggle equalizer state
        if (state && core.equalizer.source && core.equalizer.context && core.equalizer.filters.length > 0) {
          if (core.equalizer.storage.state === "ON") {
            core.equalizer.source.disconnect(core.equalizer.context.destination);
            core.equalizer.source.connect(core.equalizer.filters[0]);
          }
          if (core.equalizer.storage.state === "OFF") {
            core.equalizer.source.disconnect(core.equalizer.filters[0]);
            core.equalizer.source.connect(core.equalizer.context.destination);
          }
        }
      },
      load: function () { // Function to load equalizer
        core.equalizer.filters = [];
        delete core.equalizer.context;
        core.equalizer.context = new AudioContext();
        for (let i = 0; i < core.equalizer.storage.eq.length; i++) {
          let node = core.equalizer.storage.eq[i];
          let filter = node.f ? core.equalizer.biquad(node) : core.equalizer.gain();
          if (filter) {
            core.equalizer.filters.push(filter);
          }
        }
        core.equalizer.attach(2);
      },
      attach: function (w) { // Function to attach equalizer to audio and video elements
        if (!core.equalizer.context) {
          core.equalizer.load();
        } else {
          core.equalizer.targets.forEach(function (t, k) {
            if (t.getAttribute("equalizer-state") !== "attached") {
              let src = t.src ? t.src : t.currentSrc;
              if (src) {
                t.setAttribute("equalizer-state", "attached");
                if (document.location.hostname !== core.hostname(src)) {
                  let crossorigin = t.getAttribute("crossorigin");
                  if (!crossorigin && src.substring(0, 5) !== "blob:") {
                    t.setAttribute("crossorigin", crossorigin ? crossorigin : "anonymous");
                    if (t.src) t.src = t.src + "";
                    else if (t.currentSrc) t.load();
                  }
                }
                try {
                  core.equalizer.source = core.equalizer.context.createMediaElementSource(t);
                  core.equalizer.filters[0]._defaultChannelCount = core.equalizer.source.channelCount ? core.equalizer.source.channelCount : 2;
                  let target = core.equalizer.storage.state === "OFF" ? core.equalizer.context.destination : core.equalizer.filters[0];
                  core.equalizer.source.connect(target);
                  for (let i = 0; i < core.equalizer.filters.length; i++) {
                    let current = core.equalizer.filters[i];
                    let next = core.equalizer.filters[i + 1];
                    current.gain.value = core.equalizer.storage.eq[i].gain;
                    if (next) current.connect(next);
                  }
                  let last = core.equalizer.filters[core.equalizer.filters.length - 1];
                  last.connect(core.equalizer.context.destination);
                  window.top.postMessage({ app: "audio-equalizer", action: "app-icon-normal" }, "*");
                } catch (e) {
                  window.top.postMessage({ app: "audio-equalizer", action: "app-icon-error" }, "*");
                }
              }
            }
          });
        }
      },
    },
  };
  core.equalizer.storage = JSON.parse(core.script.dataset.data); // Parses script data
  window.addEventListener("play", function (e) { // Listens for 'play' event
    core.equalizer.targets.push(e.target);
    core.equalizer.attach(0);
  }, true);
  window.addEventListener("message", function (e) { // Listens for messages
    if (e.data.app === "audio-equalizer") {
      if (e.data.action === "app-set") core.equalizer.set(e.data.value);
      if (e.data.action === "app-toggle") core.equalizer.toggle(e.data.state);
    }
  }, false);
  if (Audio && Audio.prototype && Audio.prototype.play) { // Listens for audio play
    const play = Audio.prototype.play;
    Audio.prototype.play = function () {
      core.equalizer.targets.push(this);
      core.equalizer.attach(1);
      return play.apply(this, arguments);
    };
  }
}
