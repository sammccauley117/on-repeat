var request = require('request'); // "Request" library
var variables = require('./_variables');
var querystring  = require('querystring');

var callback = function(req, res) {
  var code  = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[variables.STATE_KEY] : null;

  if (state === null || state !== storedState) {
    res.redirect(variables.URL + '/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(variables.STATE_KEY);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: variables.REDIRECT_URI,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(variables.CLIENT_ID + ':' + variables.CLIENT_SECRET).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token  = body.access_token;
        var refresh_token = body.refresh_token;

        res.redirect(variables.URL + '/#' +
          querystring.stringify({
            access_token: access_token
          }));

      } else {
        res.redirect(variables.URL + '/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
};

module.exports = {
  callback: callback
};
