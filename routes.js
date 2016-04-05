var request = require('request');

// exports.getAuthenticationHeaders = function(req, res) {
//   request.get(process.env.APP_URL + '/authenticate', function(err,request,body) {

//   })
// }

exports.ping = function(req, res) {
  res.status(200).json({
    'status': 'ok'
  });
};
