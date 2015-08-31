/**
 * Created by james on 8/27/15.
 */
'use strict';

function histogram(selection) {
  var margin = { top: 40, right: 40, bottom: 80, left: 60 },
      width = 700, // default width
      height = 700, // default height
      idValue = function(d) { return d.name; }, // name function
      xValue = function(d) { return +d[0]; },
      yValue = function(d) { return +d[1]; },
      xScale = d3.scale.linear(),
      yScale = d3.scale.linear(),
      xAxis = d3.svg.axis().scale(xScale).orient("bottom"),
      yAxis = d3.svg.axis().scale(yScale).orient("left"),
      xLabel = "", // default is no labels
      yLabel = "",
      _trans = function(s) { return s; };

  function chart(selection) {
    selection.each(function(data) {
      // Update the x-scale.
      xScale.domain(d3.extent(data, xValue))
        .range([0, width - margin.left - margin.right])
        .nice();

      // Update the y-scale.
      yScale.domain(d3.extent(data, yValue))
        .range([height - margin.top - margin.bottom, 0])
        .nice();

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]);

      // Otherwise, create the skeletal chart.
      var gEnter = svg.enter().append("svg")
        .attr("class", "d3")
        .append("g");

      // Add axes and axes labels
      gEnter.append("g").attr("class", "d3 x axis")
        .append("text")
          .attr("class", "label")
          .attr("x", width - margin.left - margin.right)
          .attr("y", -6)
          .style("text-anchor", "end")
          .text(xLabel);

      gEnter.append("g").attr("class", "d3 y axis")
        .append("text")
          .attr("class", "label")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text(yLabel);

      // Update the outer dimensions.
      svg.attr("width", width)
        .attr("height", height);

      // Update the inner dimensions.
      var g = svg.select("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Update the bar chart
      var bars = g.selectAll(".bar")
        .data(data, xValue);

      // transition existing points
      bars.transition()
        .duration(750)
        .attr("x", function(d) { return xScale(xValue(d)); })
        .attr("width", (width - margin.left - margin.right) / data.length)
        .attr("y", function(d) { return yScale(yValue(d)); })
        .attr("height", function(d) {
          return height - margin.top - margin.bottom - yScale(yValue(d));
        });

      // create any new ones
      bars.enter()
        .append("rect")
          .attr("class", "d3 bar")
          .attr("x", function(d) { return xScale(xValue(d)); })
          .attr("width", (width - margin.left - margin.right) / data.length)
          .attr("y", height - margin.top - margin.bottom)
          .attr("height", 0)
        .transition()
          .duration(750)
          .attr("y", function(d) { return yScale(yValue(d)); })
          .attr("height", function(d) {
            return height - margin.top - margin.bottom - yScale(yValue(d));
          });

      // remove any old ones
      bars.exit()
        .transition()
          .attr("y", height - margin.top - margin.bottom)
          .attr("height", 0)
          .remove();

      g.select("g.x.axis")
        .attr("transform", "translate(0," + yScale.range()[0] + ")")
        .call(xAxis)
        .select("text")
        .text(xLabel)
        .transition()
          .duration(750)
          .attr("x", width - margin.left - margin.right);

      // Update the y-axis.
      g.select("g.y.axis")
        .call(yAxis)
        .select("text")
        .text(yLabel);
    });
  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.id = function(_) {
    if (!arguments.length) return idValue;
    idValue = _;
    return chart;
  };

  chart.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

  chart.xLabel = function(_) {
    if (!arguments.length) return xLabel;
    xLabel = _;
    return chart;
  };

  chart.yLabel = function(_) {
    if (!arguments.length) return yLabel;
    yLabel = _;
    return chart;
  };

  chart.transition = function(_) {
    if (!arguments.length) return _trans;
    _trans = _;
    return chart;
  };

  chart.xScale = function(_) {
    if (!arguments.length) return xScale;
    return xScale(_);
  };

  chart.yScale = function(_) {
    if (!arguments.length) return yScale;
    return yScale(_);
  };

  return chart;
}
