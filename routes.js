var request = require('request');
var querystring = require('querystring');

var SerialPort = require('serialport').SerialPort;
var Printer = require('thermalprinter');

exports.getTokens = function(req, res) {
  var query = querystring.stringify({
    user_id: process.env.USER_ID
  });

  request.get(process.env.SERVER_URL + '/api/authenticate?' + query, function(err,request,body) {
    console.log(process.env.SERVER_URL + '/api/authenticate?' + query);
    if (err) {
      res.status(401).send(err);
    }
    else {
      res.status(200).send(JSON.parse(body));
    }
  });
}


exports.ping = function(req, res) {
  res.status(200).json({
    'status': 'ok'
  });
};

exports.print = function(req, res) {
  var serialPort = new SerialPort(process.env.SERIAL_PORT, {
    baudrate: 19200
  })

  var msgBody = req.query.Body.toLowerCase();

  switch (msgBody) {
    case 'summary':
      console.log('summary requested');
    case 'viz':
      console.log('abstract visualization');
    case 'test':
      console.log('everything seems to be working');
  }

  serialPort.on('open',function() {
      var printer = new Printer(serialPort);
      printer.on('ready', function() {
        printer
          .horizontalLine(16)
          .printLine('first line')
          .bold(false)
          .inverse(true)
          .print(function() {
            console.log('done');
            res.status(200).json({
              'status': 'ok'
            });
          });
    });
  });
}

// Set up Twilio authentication
// Send message to serial
// Get user settings for connected devices

// A user adds their phone number on the settings page
// When a user texts then the number is checked on main API server from DB
// If theres a match with an account and tokens, a response is sent back.

