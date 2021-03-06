// Zac Ioannidis, 2016
// DATA PREPROCESSING/MUNGING
'use strict';

var _ = require('lodash');
var request = require('request');
var querystring = require('querystring');

// Get data from the various data sources
// Use parallel asynchronous requests if needed.
exports.retrieveDailyData = function(date, req, cb) {
  // GET SERVER_URL/api/summary/daily?date=xxxx
  var token = _.find(req.user.tokens, {kind: 'moves'}).accessToken;
  var baseURL = process.env.SERVER_URL + '/api/summary/daily?date=' + date +" &token=" + token;
  console.log(baseURL);
  request.get(baseURL, function(err, request, body) {
    if (err) {
      console.log('err', err);
      return;
    }

    return cb(JSON.parse(body));
  });
}

exports.transformDailyData = function(data) {
  // Geolocation data markers
  var trackpoints = [];
  var metrics = {};
  // Find different types of transportation modes
  var activities = _.compact(_.uniq(_.map(data.movesStoryline, function(d) {
    if (typeof d.activity !== 'undefined') {
      return d.activity;
    }
  })));

  _.each(activities, function(d) {
    metrics[d] = {
      distance: 0,
      duration: 0,
      steps: d==="walking" ? 0 : null
    };
  })

  var places = _.compact(_.uniq(_.map(data.movesStoryline, function(d) {
    if (typeof d.place !== 'undefined') {
      return d.place;
    }
  })));
  places = _.remove(places, function(d) {
    return d !== "unknown"
  });

  _.map(data.movesStoryline, function(d) {
    if (d.type === "move") {
      _.each(d.trackPoints, function(tp) {
        trackpoints.push([tp.lat, tp.lon]);
      })

      metrics[d.activity].duration += d.duration;
      metrics[d.activity].distance += d.distance;

      if (d.activity === "walking") {
        metrics[d.activity].steps += d.steps;
      }
    }
  });
  return ({
    'metrics': metrics,
    'places': places,
    'trackpoints': trackpoints
  });
}

exports.retrieveDateRangeData = function(from, to, req, cb) {
  var token = _.find(req.user.tokens, {kind: 'moves'}).accessToken;
  var baseURL = process.env.SERVER_URL + '/api/moves/summary?from=' + from + "&to=" + to + "&access_token=" + token;
  console.log(baseURL);
  request.get(baseURL, function(err, request, body) {
    if (err) {
      console.log(err);
      return;
    }

    return cb(JSON.parse(body));
  });
}

exports.transformDateRangeData = function(data) {
  var all = [];
  var output = [];
  _.each(data, function(d) {
    if (d.summary) {
      all.push(d.summary);
    }
  });
  all = _.flatten(all);
  // Unique Activity groups
  var a_groups = _.map(all, function(d) {
    return d.activity;
  });
  a_groups = _.uniq(a_groups)
  _.each(a_groups, function(grp) {
    var agg = {};
    agg.group = grp;

    // Relevant segments
    var s = _.filter(all, function(d) {
      return d.activity === grp;
    });
    agg.distance = _.sumBy(s, function(d) {
      return d.distance;
    });
    output.push(agg);
  })

  return output;
}
