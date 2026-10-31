/* Tabs for the speaker's event. Every phase can be opened at any time, so speakers can work ahead,
   and each locks once submitted. Event Day stays empty until the talk is approved.
   "reached": 1 reservation, 2 agenda, 3 materials, 4 in review, 5 event day, 6 event over.
   Event Materials is the exception: submitted materials can change until the event is over.
   It travels in the tab links, so the prototype needs no saved state. The sample starts with Event Reservation done. */
(function () {
  var PHASES = [
    { name: 'Overview', href: 'speaker-home.html', opensAt: 0 },
    { name: 'Event Reservation', href: 'speaker-reservation.html', opensAt: 1 },
    { name: 'Event Agenda', href: 'speaker-agenda.html', opensAt: 2, due: '10 December 2026' },
    { name: 'Event Materials', href: 'speaker-materials.html', opensAt: 3, due: '21 December 2026' },
    { name: 'Event Day', href: 'speaker-event-details.html', opensAt: 5 }
  ];
  var bar = document.getElementById('phase-tabs');
  var active = Number(bar.dataset.phase);
  var fromLink = new URLSearchParams(location.search).get('reached');
  var reached = Number(fromLink || bar.dataset.reached || Math.max(PHASES[active].opensAt, 2));

  function materialsInEarly() {
    try { return sessionStorage.getItem('materials-early') === 'yes'; } catch (e) { return false; }
  }
  function rememberMaterialsEarly(early) {
    try {
      if (early) { sessionStorage.setItem('materials-early', 'yes'); } else { sessionStorage.removeItem('materials-early'); }
    } catch (e) { /* the early submission just won't be remembered */ }
  }
  function isDone(phase) {
    return phase.opensAt > 0 && (reached > phase.opensAt || (phase.opensAt === 3 && materialsInEarly()));
  }
  function link(phase) { return phase.href + '?reached=' + reached; }

  PHASES.forEach(function (phase, index) {
    var tab = document.createElement('a');
    if (isDone(phase)) {
      var tick = document.createElement('span');
      tick.className = 'tab-tick';
      tick.textContent = '\u2713';
      tab.appendChild(tick);
    }
    tab.append(phase.name);
    tab.href = index === active ? location.pathname.split('/').pop() + location.search : link(phase);
    if (index === active) { tab.setAttribute('aria-current', 'page'); }
    bar.appendChild(tab);
  });

  var list = document.getElementById('status-phases');
  if (list) {
    var phases = PHASES.slice(1);
    phases.forEach(function (phase) {
      var inReview = phase.opensAt === 3 && reached === 4;
      var row = document.createElement('li');
      row.className = 'task' + (isDone(phase) && !inReview ? ' done' : '');
      var body = document.createElement('span');
      body.className = 'task-body';
      var title = document.createElement('span');
      title.className = 'task-title';
      title.textContent = phase.name;
      body.appendChild(title);
      var isCurrent = !isDone(phase);
      var noteText = inReview ? 'In review' : isCurrent && phase.due ? 'Due ' + phase.due : '';
      if (noteText) {
        var note = document.createElement('span');
        note.className = 'task-note';
        note.textContent = noteText;
        body.appendChild(note);
      }
      if (isDone(phase) && !inReview) {
        var tick = document.createElement('span');
        tick.className = 'status ok';
        tick.textContent = '\u2713';
        tick.setAttribute('aria-label', 'Done');
        row.appendChild(tick);
      }
      row.insertBefore(body, row.firstChild);
      list.appendChild(row);
    });
    document.getElementById('status-progress').textContent =
      phases.filter(isDone).length + ' of ' + phases.length + ' phases done';
  }

  var phase = PHASES[active];
  var nothingYet = phase.opensAt === 5 && reached < 5;
  var controls = document.querySelectorAll('main input, main textarea');
  var stillChangeable = phase.opensAt === 3 && reached < 6;

  function showNotice(text) {
    var notice = document.createElement('div');
    notice.className = 'notice';
    notice.textContent = text;
    document.querySelector('.page-head').after(notice);
  }
  function showSubmitted() {
    controls.forEach(function (control) {
      if (control.dataset.submitted) { control.value = control.dataset.submitted; }
      if (control.type === 'checkbox') {
        control.checked = true;
        control.closest('.task').classList.add('done');
      }
      control.disabled = !stillChangeable;
    });
  }

  if (nothingYet) {
    document.querySelectorAll('main .card, main .proto-next, .page-head .status').forEach(function (block) { block.hidden = true; });
    showNotice('Your event details will appear here once your talk is approved.');
  }

  if (isDone(phase) && controls.length) {
    showSubmitted();
    if (stillChangeable) {
      var save = document.querySelector('[data-submit]');
      save.textContent = 'Save changes';
      save.href = 'speaker-home.html?reached=' + reached;
      delete save.dataset.submit;
      showNotice('Submitted. You can still change your materials until the event.');
    } else {
      document.querySelectorAll('main .actions').forEach(function (actions) { actions.hidden = true; });
      showNotice('Submitted, so this can no longer be changed. Use Need help if something is wrong.');
    }
    document.dispatchEvent(new Event('phase-locked'));
  }

  document.querySelectorAll('[data-submit]').forEach(function (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      var dialog = document.createElement('dialog');
      dialog.className = 'confirm';
      var heading = document.createElement('h2');
      heading.textContent = 'Have you finished ' + phase.name + '?';
      var warning = document.createElement('p');
      warning.textContent = button.dataset.submit === 'changeable' ?
        'You can still change your materials until the event.' :
        "Once you submit, you can't undo this or change it.";
      var actions = document.createElement('div');
      actions.className = 'actions';
      var back = document.createElement('button');
      back.type = 'button';
      back.className = 'button secondary';
      back.textContent = 'Go back';
      back.addEventListener('click', function () { dialog.close(); });
      var confirm = document.createElement('button');
      confirm.type = 'button';
      confirm.className = 'button';
      confirm.textContent = 'Yes, submit';
      confirm.addEventListener('click', function () {
        var target = button.href;
        if (phase.opensAt === 3 && reached < 3) {
          rememberMaterialsEarly(true);
          target = 'speaker-home.html?reached=' + reached;
        } else if (phase.opensAt === 2 && materialsInEarly()) {
          rememberMaterialsEarly(false);
          target = 'speaker-home-waiting.html';
        }
        location.href = target;
      });
      actions.append(back, confirm);
      dialog.append(heading, warning, actions);
      dialog.addEventListener('close', function () { dialog.remove(); });
      document.body.appendChild(dialog);
      dialog.showModal();
    });
  });
}());
