var querystring  = require('querystring');
var variables = require('./_variables');

var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
};

var login = function(req, res) {
  var state = generateRandomString(16);
  res.cookie(variables.STATE_KEY, state);
  var scope = 'user-top-read user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: variables.CLIENT_ID,
      scope: scope,
      redirect_uri: variables.REDIRECT_URI,
      state: state,
      show_dialog: true
    }));
};

module.exports = {
  login: login
};
