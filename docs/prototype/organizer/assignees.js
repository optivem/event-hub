// Prototype only: the assignee checkboxes start with the logged-in organizer ticked and marked "(you)".
// ?none shows an event whose last assignee was removed, so nobody is ticked.
(function () {
  var me = (window.eventhubPerson || {}).name;
  var none = new URLSearchParams(location.search).has('none');
  document.querySelectorAll('[data-assignee-picker] input').forEach(function (box) {
    var isMe = box.value === me;
    box.nextElementSibling.textContent = box.value + (isMe ? ' (you)' : '');
    if (box.hasAttribute('data-you') || isMe) { box.checked = isMe && !none; }
    if (none) { box.checked = false; }
  });
})();
