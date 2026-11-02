// Prototype only: who has approved the task under review, and what you may do with it.
// ?view=approved shows the screen after you've approved, waiting for another assignee.
// ?view=readonly shows it to an organizer who isn't assigned: they can read it but not act on it.
(function () {
  var view = new URLSearchParams(location.search).get('view');
  var card = document.getElementById('assignees');
  var task = card.dataset.task;
  var you = card.querySelector('[data-person="you"]');

  // The event shown read-only waits for its only assignee, so nobody has approved it yet.
  if (view === 'readonly') {
    you.remove();
    card.querySelectorAll('li').forEach(function (row) {
      delete row.dataset.approved;
      var status = row.querySelector('.status');
      status.className = 'status warn';
      status.textContent = 'Not yet';
    });
  }
  if (view === 'approved') {
    you.dataset.approved = 'yes';
    var badge = you.querySelector('.status');
    badge.className = 'status ok';
    badge.textContent = 'Approved';
  }

  function names(rows) {
    var list = rows.map(function (row) { return row.querySelector('.task-title').textContent.replace(/^You$/, 'you'); });
    return list.length > 1 ? list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1] : list[0];
  }
  var rows = Array.prototype.slice.call(card.querySelectorAll('li'));
  var waiting = rows.filter(function (row) { return row.dataset.approved !== 'yes'; });
  document.getElementById('approval-count').textContent = task + ': ' + (rows.length - waiting.length) + ' of ' + rows.length +
    ' approved. ' + (waiting.length ? 'Waiting for ' + names(waiting) + '.' : 'Approved by everyone.');

  if (view !== 'approved' && view !== 'readonly') { return; }

  var review = document.getElementById('review');
  review.querySelectorAll('input, textarea').forEach(function (control) {
    if (control.type === 'checkbox') { control.checked = view === 'approved'; }
    control.disabled = true;
  });
  review.querySelector('.actions').hidden = true;
  document.getElementById('send-back').hidden = true;
  var feedback = document.getElementById('feedback');
  if (feedback) { feedback.closest('.field').hidden = true; }

  var notice = document.createElement('div');
  notice.className = 'notice';
  notice.innerHTML = view === 'approved'
    ? 'You approved this. It&rsquo;s approved once ' + names(waiting) + ' approves too.'
    : 'You aren&rsquo;t assigned to this event, so you can read the review but not act on it. Only ' + names(rows) +
      ' can approve it or send it back. Any organizer can <a href="organizer-assignees.html">change the assignees</a>.';
  document.querySelector('.page-head').after(notice);
})();
