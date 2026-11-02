/* Tabs for the speaker's event. Every phase can be opened at any time, so speakers can work ahead,
   and each locks once submitted. Event Day stays empty until the talk is approved.
   The organizers review the agenda as soon as it's in, then the materials, and approve each separately.
   "reached": 1 reservation, 2 agenda, 3 materials (agenda in review), 4 materials in review (agenda approved),
   5 event day, 6 event over. ?agenda=review keeps the agenda in review at 4, when materials went in first.
   data-sent-back on the tab bar marks a phase the organizers sent back, so it can be changed again.
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
  var agendaInReview = reached === 3 || new URLSearchParams(location.search).get('agenda') === 'review';
  var sentBack = bar.hasAttribute('data-sent-back');

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
  function link(phase) {
    // Once the event is over, Event Day shows the thank-you.
    if (phase.opensAt === 5 && reached >= 6) { return 'speaker-after-event.html'; }
    return phase.href + '?reached=' + reached;
  }

  /* The next phase to complete. Event Day has nothing to do until the talk is approved. */
  var nextPhase = PHASES.filter(function (phase) {
    return phase.opensAt > 0 && !isDone(phase) && (phase.opensAt < 5 || reached >= 5);
  })[0];

  /* The same green tick or yellow circle marks a phase on the tabs and in the Overview list. */
  function stateMarker(phase) {
    var marker = document.createElement('span');
    marker.setAttribute('role', 'img');
    if (isDone(phase)) {
      marker.className = 'state-done';
      marker.textContent = '\u2713';
      marker.setAttribute('aria-label', 'Done:');
    } else if (phase === nextPhase) {
      marker.className = 'state-next';
      marker.setAttribute('aria-label', 'Next to complete:');
      marker.title = 'Next to complete';
    } else {
      return null;
    }
    return marker;
  }

  PHASES.forEach(function (phase, index) {
    var tab = document.createElement('a');
    var marker = stateMarker(phase);
    if (marker) { tab.appendChild(marker); }
    if (isDone(phase)) { tab.className = 'done'; }
    tab.append(phase.name);
    tab.href = index === active ? location.pathname.split('/').pop() + location.search : link(phase);
    if (index === active) { tab.setAttribute('aria-current', 'page'); }
    bar.appendChild(tab);
    if (index === active) { tab.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
  });

  var list = document.getElementById('status-phases');
  if (list) {
    var phases = PHASES.slice(1);
    phases.forEach(function (phase) {
      var inReview = (phase.opensAt === 2 && agendaInReview) || (phase.opensAt === 3 && reached === 4);
      var approved = !inReview && ((phase.opensAt === 2 && reached >= 4) || (phase.opensAt === 3 && reached >= 5));
      var row = document.createElement('li');
      row.className = 'task' + (isDone(phase) ? ' done' : '');
      var marker = stateMarker(phase) || document.createElement('span');
      if (!marker.className) { marker.className = 'state-none'; }
      row.appendChild(marker);
      var body = document.createElement('span');
      body.className = 'task-body';
      var title = document.createElement('span');
      title.className = 'task-title';
      title.textContent = phase.name;
      body.appendChild(title);
      var noteText = inReview ? 'In review' : approved ? 'Approved' : !isDone(phase) && phase.due ? 'Due ' + phase.due : '';
      if (noteText) {
        var note = document.createElement('span');
        note.className = 'task-note';
        note.textContent = noteText;
        body.appendChild(note);
      }
      row.appendChild(body);
      list.appendChild(row);
    });
  }

  /* The speaker's own checklist for going live, shown before and on the day. Ticks are not saved. */
  var checklist = document.getElementById('live-checklist');
  if (checklist) {
    [
      ['Water within reach', 'You will be talking for about 90 minutes'],
      ['Computer notifications turned off', 'Turn on Do Not Disturb and close email and chat apps'],
      ['Phone on silent', 'Keep it nearby in case the organizer needs to reach you'],
      ['Font size increased', 'In your slides, code editor and terminal, so people can read them on a small screen'],
      ['I know how to increase the font while live', 'Try the shortcut in each app you will show, in case someone asks'],
      ['Charger plugged in', 'So your laptop lasts the whole session'],
      ['Microphone and camera tested', 'Check them in StreamYard when you join at 17:00']
    ].forEach(function (item) {
      var row = document.createElement('li');
      row.className = 'task';
      var label = document.createElement('label');
      label.className = 'check task-check';
      var box = document.createElement('input');
      box.type = 'checkbox';
      box.addEventListener('change', function () { row.classList.toggle('done', box.checked); });
      var body = document.createElement('span');
      body.className = 'task-body';
      var title = document.createElement('span');
      title.className = 'task-title';
      title.textContent = item[0];
      var note = document.createElement('span');
      note.className = 'task-note';
      note.textContent = item[1];
      body.append(title, note);
      label.append(box, body);
      row.appendChild(label);
      checklist.appendChild(row);
    });
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
    document.querySelectorAll('main .card, main .proto-next').forEach(function (block) { block.hidden = true; });
    var status = document.querySelector('.page-head .status');
    if (status) {
      status.className = 'status';
      status.textContent = 'Not approved yet';
    }
    showNotice('Your event details will appear here once your talk is approved.');
  }

  if (isDone(phase) && controls.length && !sentBack) {
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
          target = 'speaker-home-waiting.html?agenda=review';
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
