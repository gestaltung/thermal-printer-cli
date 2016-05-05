/**
 * These utilities are responsible for the temporary rendering of png files for
 * visualizations, in order to be transmitted to the thermal printer.
 */

'use strict';

var d3 = require('d3');
var fs = require('fs');
var jsdom = require('jsdom');
var svg2png = require('svg2png');
var xmldom = require('xmldom');

function map() {
  var width = 500,
    height = 500;

  function render(selection) {
    selection.each(function(d, i) {
      // d: data, i: iteration, this: element
      var latScale = d3.scale.linear()
        .domain([coordinates.maxLat, coordinates.minLat])
        .range([20, height-20])

      var lonScale = d3.scale.linear()
        .domain([coordinates.maxLon, coordinates.minLon])
        .range([20, width-20])

      var lineFunction = d3.svg.line()
        .x(function(d) { return lonScale(d[1]); })
        .y(function(d) { return latScale(d[0]); })
        .interpolate("linear");

      d3.select(this).append('svg')
        .append("path")
        .attr("d", lineFunction(data))
        .transition()
        .duration(500)
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("fill", "none");
    })
  }

  render.width = function(value) {
    if (!arguments.length) return width;
    width = value;
    return render;
  };

  render.height = function(value) {
    if (!arguments.length) return height;
    height = value;
    return render;
  };

  return render;
}

// render map chart as svg and png for thermal printer output.
exports.renderCircles = function(data) {
  jsdom.env({
    features : { QuerySelector : true },
    html : '<svg id="map"></svg>',
    done : function(errors, window) {
      var map = window.document.querySelector('#map');

      var renderMapImg = function(data, svgFile, pngFile) {
        var render = function() {
          var svg = d3.select(map);

          var myMap = map().width(323).height(323);
          d3.select(svg)
            .datum() // pass data here
            .call(myMap);

          // svg.selectAll("circle")
          //     .data([32, 57, 112, 293])
          //   .enter().append("circle")
          //     .attr("cy", 60)
          //     .attr("cx", function(d, i) { return i * 100 + 30; })
          //     .attr("r", function(d) { return Math.sqrt(d); });
        }

        // produce svg file
        var svgGraph = d3.select(map)
          .attr('xmlns', 'http://www.w3.org/2000/svg');

        // render d3 chart
        render();

        var svgXML = (new xmldom.XMLSerializer()).serializeToString(svgGraph[0][0]);
        fs.writeFile(svgFile, svgXML);

        // convert svg to png
        svg2png(svgFile, pngFile, function (err) {
          if(err) {
            console.log(svgFile + ' to ' + pngFile + ' failed.', err);
          } else {
            console.log(svgFile + ' to ' + pngFile + ' successfully.');
          }
        });
      };

      renderMapImg([], 'map.svg', 'map.png');
    }
  });
};


