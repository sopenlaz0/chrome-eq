// Object for handling modal dialogs
var modal = {
  // Function to display a confirmation modal with text, ok and not ok callbacks
  confirm: function (text, ok, notok) {
    // Set default callbacks if not provided
    ok = ok ? ok : function () {};
    notok = notok ? notok : function () {};

    // DOM elements
    const content = document.querySelector("#content");
    const confirm = document.querySelector("#modal-confirm");
    const okbutton = document.querySelector("#modal-confirm .ok");
    const nobutton = document.querySelector("#modal-confirm .notok");
    const message = document.querySelector("#modal-confirm .modal-message");

    // Set modal message text and display modal
    message.textContent = text;
    confirm.style.display = "block";
    content.style.filter = "blur(2px)";

    // OK button click handler
    okbutton.onclick = function () {
      content.style.filter = "";
      confirm.style.display = "none";
      ok();
    };

    // Not OK button click handler
    nobutton.onclick = function () {
      content.style.filter = "";
      confirm.style.display = "none";
      notok();
    };
  },

  // Function to display a prompt modal with text, ok and not ok callbacks
  prompt: function (text, ok, notok) {
    // Set default callbacks if not provided
    ok = ok ? ok : function () {};
    notok = notok ? notok : function () {};

    // DOM elements
    const content = document.querySelector("#content");
    const prompt = document.querySelector("#modal-prompt");
    const input = document.querySelector("#modal-prompt .input");
    const okbutton = document.querySelector("#modal-prompt .ok");
    const nobutton = document.querySelector("#modal-prompt .notok");
    const message = document.querySelector("#modal-prompt .modal-message");

    // Set focus to input and clear its value
    input.focus();
    input.value = "";

    // Set modal message text and display modal
    message.textContent = text;
    prompt.style.display = "block";
    content.style.filter = "blur(2px)";

    // OK button click handler
    okbutton.onclick = function () {
      prompt.style.display = "none";
      content.style.filter = "";
      ok(input.value);
    };

    // Not OK button click handler
    nobutton.onclick = function () {
      prompt.style.display = "none";
      content.style.filter = "";
      notok();
    };
  },
};
