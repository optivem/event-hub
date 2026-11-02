// Prototype only: who is logged in, and the account menu at the top right.
// One person has one login and one profile. Their roles sit on the account, and the menu lets
// them switch between the roles they hold. Each role opens on the screen they used last.
(function () {
  var root = document.currentScript.src.replace(/account\.js(\?.*)?$/, '');

  var ROLES = {
    speaker: { label: 'Speaker', home: 'speaker/speaker-home.html', profile: 'speaker/speaker-profile.html' },
    organizer: { label: 'Organizer', home: 'organizer/organizer-my-events.html', profile: 'organizer/organizer-profile.html' },
    administrator: { label: 'Administrator', home: 'administrator/administrator-community.html', profile: 'administrator/administrator-profile.html' }
  };

  // Made-up people. Ada holds every role, so she shows the role switcher.
  var PEOPLE = {
    mara: {
      name: 'Mara Sample', email: 'mara.sample@example.com', initials: 'MS', photo: 'speaker/mara-sample-photo.svg',
      roles: ['speaker'],
      values: {
        role: 'Staff Engineer',
        company: 'Sample Company',
        bio: 'Mara has spent 15 years working on old systems and helps teams get them under test.',
        linkedin: 'https://www.linkedin.com/in/mara-sample',
        github: 'https://github.com/mara-sample'
      }
    },
    nina: { name: 'Nina Example', email: 'nina.example@example.com', initials: 'NE', roles: ['organizer'], values: {} },
    ada: {
      name: 'Ada Example', email: 'ada.example@example.com', initials: 'AE', photo: 'ada-sample-photo.svg',
      roles: ['speaker', 'organizer', 'administrator'],
      values: {
        role: 'Engineering Manager',
        company: 'Example Company',
        bio: 'Ada runs the Tech Excellence meetup and sometimes gives a talk there too.',
        linkedin: 'https://www.linkedin.com/in/ada-example',
        github: 'https://github.com/ada-example'
      }
    }
  };
  var DEFAULT_PERSON = { speaker: 'mara', organizer: 'nina', administrator: 'ada' };

  var store = {
    get: function (key) { try { return localStorage.getItem('eventhub-' + key); } catch (e) { return null; } },
    set: function (key, value) { try { localStorage.setItem('eventhub-' + key, value); } catch (e) { /* nothing saved */ } },
    remove: function (key) { try { localStorage.removeItem('eventhub-' + key); } catch (e) { /* nothing saved */ } }
  };

  var path = location.pathname;
  var role = Object.keys(ROLES).filter(function (id) { return path.indexOf('/' + id + '/') !== -1; })[0];
  var here = role + '/' + path.split('/').pop() + location.search;

  var stored = store.get('person');
  var personId = stored && PEOPLE[stored] && PEOPLE[stored].roles.indexOf(role) !== -1 ? stored : DEFAULT_PERSON[role];
  var person = PEOPLE[personId];
  window.eventhubPerson = person;

  // Log in: the email typed picks the person. Log out: forget who it was.
  document.querySelectorAll('[data-login]').forEach(function (button) {
    button.addEventListener('click', function () {
      var email = document.getElementById('email').value.trim().toLowerCase();
      var match = Object.keys(PEOPLE).filter(function (id) { return PEOPLE[id].email === email; })[0];
      store.set('person', match || DEFAULT_PERSON[role]);
    });
  });

  var account = document.querySelector('.account');
  if (!account || account.hidden) { return; }

  store.set('last-' + personId + '-' + role, here);

  var summary = account.querySelector('summary');
  summary.setAttribute('aria-label', 'Account menu: ' + person.name);
  summary.innerHTML = person.photo
    ? '<img class="avatar" src="' + root + person.photo + '" alt="">'
    : '<span class="avatar">' + person.initials + '</span>';

  // Pages written for the sample person of this role show the logged-in person's name instead.
  var defaultName = PEOPLE[DEFAULT_PERSON[role]].name;
  if (person.name !== defaultName) {
    document.querySelectorAll('.page-head .meta').forEach(function (meta) {
      meta.innerHTML = meta.innerHTML.split(defaultName).join(person.name);
    });
  }

  var menu = account.querySelector('.account-menu');
  if (person.roles.length > 1) {
    var items = '<li class="account-label" aria-hidden="true">Switch role</li>';
    person.roles.forEach(function (id) {
      var target = store.get('last-' + personId + '-' + id);
      // Screens that were renamed: fall back to the role's first screen.
      if (!target || /organizer-(home|review)\.html/.test(target)) { target = ROLES[id].home; }
      items += '<li><a href="' + root + target + '"' + (id === role ? ' aria-current="true"' : '') + '>' + ROLES[id].label + '</a></li>';
    });
    menu.insertAdjacentHTML('afterbegin', items + '<li class="account-divider" role="separator"></li>');
  }

  menu.querySelectorAll('a').forEach(function (link) {
    if (link.textContent === 'Log out') {
      link.addEventListener('click', function () { store.remove('person'); });
    }
  });

  // Close the menu on a click outside it, and on Escape.
  document.addEventListener('click', function (event) {
    if (account.open && !account.contains(event.target)) { account.open = false; }
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && account.open) {
      account.open = false;
      summary.focus();
    }
  });
})();
