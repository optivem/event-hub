// Prototype only: the one profile form every role shares. Each role's profile page sets its own
// header and sample data, then calls renderProfile. A speaker must fill in the fields shown with talks.
function renderProfile(options) {
  var hasPhoto = Boolean(options.photo);
  var requirement = options.speaker ? 'Required' : 'Optional';
  var photoHint = options.speaker ? 'Required. A professional headshot, shown with your talk.' : 'Optional. A professional headshot.';
  var linkField = function (id, label, hint) {
    return '<div class="field"><label for="' + id + '">' + label + ' <span class="hint">' + hint + '</span></label>'
      + '<input id="' + id + '" type="url"></div>';
  };

  document.getElementById('profile').innerHTML = '<section class="card">'
    + '<h2>About you</h2>'
    + '<div class="field"><label for="photo">Photo <span class="hint">' + photoHint + '</span></label>'
    + '<div class="photo-field"><img class="photo-preview" id="photo-preview" alt="Your current photo"' + (hasPhoto ? '' : ' hidden') + '>'
    + '<input id="photo" type="file" accept="image/*"></div></div>'
    + '<div class="field"><label for="name">Name <span class="hint">From your account. ' + options.help + '</span></label>'
    + '<input id="name" type="text" readonly></div>'
    + '<div class="field"><label for="email">Email <span class="hint">You log in with this and we send your emails to it. Not shown with any talk. ' + options.help + '</span></label>'
    + '<input id="email" type="email" readonly></div>'
    + '<div class="field"><label for="role">Role</label><input id="role" type="text"></div>'
    + '<div class="field"><label for="company">Company</label><input id="company" type="text"></div>'
    + '<div class="field"><label for="bio">Short bio</label><textarea id="bio" rows="4"></textarea></div>'
    + linkField('linkedin', 'LinkedIn', requirement)
    + linkField('github', 'GitHub', requirement)
    + linkField('twitter', 'Twitter / X', 'Optional')
    + linkField('youtube', 'YouTube', 'Optional')
    + linkField('website', 'Website or blog', 'Optional')
    + '<div class="actions"><a class="button" id="account-save">Save</a></div>'
    + '</section>';

  var field = function (id) { return document.getElementById(id); };
  field('name').value = options.name;
  field('email').value = options.email;
  field('linkedin').required = options.speaker;
  field('github').required = options.speaker;
  field('account-save').href = options.back;

  var preview = field('photo-preview');
  if (hasPhoto) { preview.src = options.photo; }
  Object.keys(options.values || {}).forEach(function (id) { field(id).value = options.values[id]; });

  field('photo').addEventListener('change', function (event) {
    var file = event.target.files[0];
    if (!file) { return; }
    var url = URL.createObjectURL(file);
    preview.src = url;
    preview.hidden = false;
    var avatar = document.querySelector('.topbar .avatar');
    if (avatar.tagName === 'IMG') {
      avatar.src = url;
    } else {
      avatar.textContent = '';
      avatar.style.background = 'url("' + url + '") center / cover';
    }
  });
}
