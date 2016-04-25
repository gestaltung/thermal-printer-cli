// A user adds their phone number on the settings page
// When a user texts then the number is checked on main API server from DB
// If theres a match with an account and tokens, a response is sent back.

'use strict';

var querystring = require('querystring');
var request = require('request');

var printUtils = require('./printer');
var dataUtils = require('./data');
var _ = require('lodash');


// Middleware for passing access tokens to other functions.
// Tokens must be passed when making a request to the Extempore platform.
exports.getTokens = function(req, res, next) {
  var query = querystring.stringify({
    user_id: process.env.USER_ID
  });

  request.get(process.env.SERVER_URL + '/api/authenticate?' + query, function(err,request,body) {
    console.log(process.env.SERVER_URL + '/api/authenticate?' + query);
    if (err) {
      // res.send(err);
      req.user = res.json(err);
      next();
    }
    else {
      // res.send(JSON.parse(body));
      req.user = JSON.parse(body);
      next();
    }
  });
}

exports.ping = function(req, res) {
  res.json(req.user);
};

exports.print = function(req, res) {
  // var msgBody = req.query.Body.toLowerCase();
  var msgBody = 'summary';
  var msgBody = 'viz';

  switch (msgBody) {
    case 'summary':
      dataUtils.retrieveDailyData("20160315", req, function(data){
        data = dataUtils.transformDailyData(data);
        printUtils.printDailySummary(req.user.profile.name, data);
        return res.json(data);
      })
      console.log('summary requested');
      break;
    case 'viz':
      printUtils.printDateRange([1,2,3])
      console.log('abstract visualization');
      break;
    case 'test':
      console.log('everything seems to be working');
      break;
  }

  // return res.json({
  //   'status': 'ok'
  // });
}
