/* Wizard tabs for the speaker's event. Each phase opens in turn and locks once submitted.
   "reached": 1 reservation, 2 agenda, 3 materials, 4 in review, 5 backstage, 6 event over.
   Event Materials is the exception: submitted materials can change until the event is over.
   It travels in the tab links, so the prototype needs no saved state. The sample starts with Event Reservation done. */
(function () {
  var PHASES = [
    { name: 'Status', href: 'speaker-home.html', opensAt: 0 },
    { name: 'Event Reservation', href: 'speaker-reservation.html', opensAt: 1 },
    { name: 'Event Agenda', href: 'speaker-agenda.html', opensAt: 2 },
    { name: 'Event Materials', href: 'speaker-materials.html', opensAt: 3 },
    { name: 'Event Backstage', href: 'speaker-event-details.html', opensAt: 5 }
  ];
  var bar = document.getElementById('phase-tabs');
  var active = Number(bar.dataset.phase);
  var fromLink = new URLSearchParams(location.search).get('reached');
  var reached = Number(fromLink || bar.dataset.reached || Math.max(PHASES[active].opensAt, 2));

  function isOpen(phase) { return reached >= phase.opensAt; }
  function isDone(phase) { return phase.opensAt > 0 && reached > phase.opensAt; }
  function link(phase) { return phase.href + '?reached=' + reached; }

  PHASES.forEach(function (phase, index) {
    var tab = document.createElement(isOpen(phase) ? 'a' : 'span');
    if (isDone(phase)) {
      var tick = document.createElement('span');
      tick.className = 'tab-tick';
      tick.textContent = '\u2713';
      tab.appendChild(tick);
    }
    tab.append(phase.name);
    if (isOpen(phase)) {
      tab.href = index === active ? location.pathname.split('/').pop() + location.search : link(phase);
    } else {
      tab.setAttribute('aria-disabled', 'true');
      tab.title = 'Opens later';
    }
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
      var title = document.createElement('span');
      title.className = 'task-body task-title';
      title.textContent = phase.name;
      var badge = document.createElement('span');
      var state = inReview ? ['In review', 'info'] : isDone(phase) ? ['Done', 'ok'] :
        isOpen(phase) ? ['Open', 'warn'] : ['Not started', ''];
      badge.className = 'status ' + state[1];
      badge.textContent = state[0];
      row.appendChild(title);
      row.appendChild(badge);
      list.appendChild(row);
    });
    document.getElementById('status-progress').textContent =
      phases.filter(isDone).length + ' of ' + phases.length + ' phases done';
  }

  var phase = PHASES[active];
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
      confirm.addEventListener('click', function () { location.href = button.href; });
      actions.append(back, confirm);
      dialog.append(heading, warning, actions);
      dialog.addEventListener('close', function () { dialog.remove(); });
      document.body.appendChild(dialog);
      dialog.showModal();
    });
  });
}());
