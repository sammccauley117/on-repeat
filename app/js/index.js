var access_token   = null;
var user           = {data: null, error: null};
var tracks_short   = {data: null, error: null};
var tracks_medium  = {data: null, error: null};
var tracks_long    = {data: null, error: null};
var artists_short  = {data: null, error: null};
var artists_medium = {data: null, error: null};
var artists_long   = {data: null, error: null};

var MAX_WAIT = 10000;

var template = `
<div class="data p-0 m-0 hide border-top">
  <div class="data-container py-2">
    <div class="data-number">{0}</div>
    <div class="data-img" style="background-image: url({1});"></div>
    <div class="data-info data-title pl-2">{2}</div>
  </div>
<div>
`

var template2 = `
<div class="data p-0 m-0 hide border-top">
  <div class="data-container py-2">
    <div class="data-number">{0}</div>
    <div class="data-img" style="background-image: url({1});"></div>
    <div class="data-info pl-2">
      <span>
        <span class="data-title">{2}</span><br>
        <span class="data-subtitle">{3}</span>
      </span>
    </div>
  </div>
<div>
`

function request(url, destination, parser) {
  $.ajax({
    url: url,
    headers: { 'Authorization': 'Bearer ' + access_token },
    success: function(response) { destination.data = parser(response); },
    error: function(error) { destination.error = error; }
  });
}

var parseUser = function(data) {
  var u = {};
  u.name = data.id;
  u.img = data.images[0].url;
  return u;
}

var parseTracks = function(data) {
  data = data.items;
  var tracks = [];
  for (var i = 0; i < data.length; i++){
    tracks.push({
      song: data[i].name,
      artist: data[i].artists[0].name,
      album: data[i].album.name,
      img: data[i].album.images[1].url
    });
  }
  return tracks;
}

var parseArtists = function(data) {
  data = data.items;
  var artists = [];
  for (var i = 0; i < data.length; i++){
    if (typeof(data[i].images[1]) != 'undefined')
        artists.push({
            artist: data[i].name,
            img: data[i].images[1].url
        });
    else
        artists.push({
            artist: data[i].name,
            img: ''
        });
  }
  return artists;
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

String.prototype.format = function() {
  a = this;
  for (k in arguments) {
    a = a.replaceAll("{" + k + "}", arguments[k]);
  }
  return a
}

function roundLogin() {
  var width  = $('.login').width().toString() + 'px';
  $('.login').css('border-radius', width);
}

function fillTracks(tracks, dest) {
  for (var i = 0; i < tracks.length; i++) {
    $(dest).append(template2.format(i + 1, tracks[i].img, tracks[i].song, tracks[i].artist))
  }
}

function fillArtists(artists, dest) {
  for (var i = 0; i < artists.length; i++) {
    $(dest).append(template.format(i + 1, artists[i].img, artists[i].artist))
  }
}

function hideLogin() { $('.login-container').hide(); $('.login').hide(); }
function showLogin() { $('.login-container').show(); $('.login').show(); }

function hideAll() {
  hideLogin();
  $('.load').hide();
  $('.tracks-short').hide();
  $('.tracks-medium').hide();
  $('.tracks-long').hide();
  $('.artists-short').hide();
  $('.artists-medium').hide();
  $('.artists-long').hide();
}

function getHashParams() {
  var params = {};
  var e, r = /([^&;=]+)=?([^&;]*)/g,
  q = window.location.hash.substring(1);
  while ( e = r.exec(q)) {
    params[e[1]] = decodeURIComponent(e[2]);
  }
  return params;
}

function clickResponse() {
  hideAll();
  show('.'+this.id);
}

function addListeners() {
  $('#tracks-short').click(clickResponse);
  $('#tracks-medium').click(clickResponse);
  $('#tracks-long').click(clickResponse);
  $('#artists-short').click(clickResponse);
  $('#artists-medium').click(clickResponse);
  $('#artists-long').click(clickResponse);
  $('#logout').click(logout);
  $('.section-title').click(function(){ $('#menu').modal('show'); });
}

function show(section) {
  $(section).show();
  var data = $(section+'> .data');
  for (var i = 0; i < data.length; i++) {
    setTimeout(function(element) {
      $(element).fadeIn();
    }, 100 + (100 * i), data[i]);
  }
}

function success() {
  $('.nav').show();
  fillTracks(tracks_short.data,  '.tracks-short');
  fillTracks(tracks_medium.data, '.tracks-medium');
  fillTracks(tracks_long.data,   '.tracks-long');
  fillArtists(artists_short.data,  '.artists-short');
  fillArtists(artists_medium.data, '.artists-medium');
  fillArtists(artists_long.data,   '.artists-long');
  addListeners();
  setTimeout(function(){
    $('.load').hide();
    show('.tracks-short');
  }, 2000);
}

function error() {
  hideAll();
  showLogin();
  $('.alert').fadeIn();
  setTimeout(function(){
    $('.alert').fadeOut();
  }, 5000);
}

function checkData() {
  if (tracks_short.data   != null &&
      tracks_medium.data  != null &&
      tracks_long.data    != null &&
      artists_short.data  != null &&
      artists_medium.data != null &&
      artists_long.data   != null)
    return 1;
  else if (tracks_short.error   != null ||
      tracks_medium.error  != null ||
      tracks_long.error    != null ||
      artists_short.error  != null ||
      artists_medium.error != null ||
      artists_long.error   != null)
    return -1;
  return 0;
}

function wait(count) {
  $('.load').show();
  if (count < MAX_WAIT) {
    setTimeout(function() {
      var flag = checkData();
      if (flag == 1)
        success();
      else if (flag == -1)
        error();
      else
        wait(count + 10);
    }, 10);
  } else {
    error();
  }
}

function loadTop() {
  request('https://api.spotify.com/v1/me', user, parseUser);
  request('https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=short_term',   tracks_short,   parseTracks);
  request('https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=medium_term',  tracks_medium,  parseTracks);
  request('https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=long_term',    tracks_long,    parseTracks);
  request('https://api.spotify.com/v1/me/top/artists?limit=50&time_range=short_term',  artists_short,  parseArtists);
  request('https://api.spotify.com/v1/me/top/artists?limit=50&time_range=medium_term', artists_medium, parseArtists);
  request('https://api.spotify.com/v1/me/top/artists?limit=50&time_range=long_term',   artists_long,   parseArtists);
  wait(0);
}

function init() {
  roundLogin();
  hideAll();
  showLogin();
}

$(document).ready(main());
function main() {
  init();
  var params = getHashParams();
  if ('access_token' in params) {
    hideLogin();
    access_token = params.access_token;
    loadTop(params.access_token);
  }
  else if ('error' in params) {
    error();
  }
}
