'use strict';

/**
 * Parses a text message along with parameters
 *
 * Returns a JSON object
 *
 * TO DO: Error handling
 */
exports.parseText = function(_body) {
  var mode = _body.split(" ")[0].toLowerCase();
  var date = _body.split(" ")[1];

  var output = {}

  // Determine whether to parse date or date range.
  switch (mode) {
    case 'summary':
      output.mode = 'summary';
      output.date = date;
      break;
    case 'range':
      output.mode = 'range';
      output.range = {};
      output.range.from = date.split("-")[0];
      output.range.to = date.split("-")[1];
      break;
    default:
      break;
  }

  return output;
}
