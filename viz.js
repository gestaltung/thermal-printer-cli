'use strict';

var d3 = require('d3');

exports.renderMap = function(data) {
  function steps() {
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
}
