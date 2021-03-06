'use strict';

var SerialPort = require('serialport').SerialPort;
var Printer = require('thermalprinter');
var _ = require('lodash');

exports.printDailySummary = function(name, data) {
  var serialPort = initializePrinter();
  var map = __dirname + '/test/map_20160310.png';
  // var map = __dirname + '/test/map.png';
  serialPort.on('open',function() {
    console.log('port is open')
    var opts = {
        maxPrintingDots: 15,
        heatingTime: 150,
        heatingInterval: 4,
        commandDelay: 5
      };
    var printer = new Printer(serialPort, opts);
    printer.on('ready', function() {
      console.log('printer ready');
      printer
        .horizontalLine(16)
        .printLine(name)
        .horizontalLine(16)
        .printLine('Summary for: 15/3/2016')
        .printImage(map)
        .inverse(true)
        .lineFeed(2)
        .printLine('Places')
        .inverse(false)

      _.each(data.places, function(d) {
        printer
          .printLine(d)
      })

      printer
        .lineFeed(1)
        .inverse(true)
        .printLine('Walking')
        .inverse(false)
        .printLine("Steps: "+data.metrics.walking.steps)
        .printLine("Distance: "+(data.metrics.walking.distance/1000)+" km")
        .printLine("Duration: "+Math.floor((data.metrics.walking.duration/60))+" minutes")

      if (data.metrics.transport) {
        printer
          .lineFeed(1)
          .inverse(true)
          .printLine('Transportation')
          .inverse(false)
          .printLine("Distance: "+(data.metrics.transport.distance/1000)+" km")
          .printLine("Duration: "+Math.floor((data.metrics.transport.duration/60))+" minutes")
      }

      printer.print(function() {
        console.log('done')
      });
    });
  });
}

exports.printDateRange = function(name, data) {
  var serialPort = initializePrinter();
  var artists = __dirname + '/test/artist-cloud.png';
  var bars = __dirname + '/test/bars.png';

  serialPort.on('open',function() {
    var opts = {
        maxPrintingDots: 20,
        heatingTime: 200,
        heatingInterval: 4,
        commandDelay: 5
      };
    var printer = new Printer(serialPort, opts);
    printer.on('ready', function() {
      printer
        .horizontalLine(16)
        .printLine('' + name)
        .horizontalLine(16)
        .printLine('Summary for: 1/3/2016-31/3/2016')
        .lineFeed(2)
        .inverse(true)
        .printLine("Artists")
        .inverse(false)
        .printImage(artists)
        .lineFeed(2)
        .inverse(true)
        .printLine("Steps Overview")
        .lineFeed(1)
        .inverse(false)
        .printImage(bars)
        .lineFeed(2)
        .inverse(true)
        .bold(true)
        .printLine('Aggregated Distance Metrics')
        .bold(false)
        .lineFeed(1);

      // Print overview of distance metrics for requested date range
      _.each(data, function(d) {
        printer
          .indent(2)
          .inverse(true)
          .printLine("" + d.group)
          .inverse(false)
          .big(true)
          .printLine("" + d.distance + " km")
          .big(false)
      })

      printer.print(function() {
        console.log('done')
      });
    });
  })
}

var initializePrinter = function() {
  var serialPort = new SerialPort(process.env.SERIAL_PORT, {
    baudrate: 19200
  });

  return serialPort;
}
