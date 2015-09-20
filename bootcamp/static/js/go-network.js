/*
 * Function to display force-directed-layout networks.
 * adapted from Mike Bostock: http://bl.ocks.org/mbostock/4062045
 */
'use strict';

function network() {
  var margin = { top: 40, right: 40, bottom: 40, left: 40 },
      width = 700, // default width
      height = 700, // default height
      charge = -160,
      distance = 120,
      idValue = function(n) { return n.id; }, // node name
      rValue = function(n, i) { return (i == 0) ? 10 : 5; }, // node radius
      cValue = function(n) {
        return {'gene': '#5DA5DA', 'P': '#FAA43A',
          'C': '#60BD68', 'F': '#F17CB0'}[n.node_type];
      },
      force = d3.layout.force();

  function chart(selection) {
    selection.each(function(graph) {
      // select the svg element if it exists
      var svg = d3.select(this).selectAll("svg").data([graph]);

      // otherwise create the chart
      svg.enter().append("svg")
        .attr("class", "d3")
        .append("g");

      // update the outer dimensions
      svg.attr("width", width)
        .attr("height", height);

      // Update the inner dimensions.
      var g = svg.select("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // update force
      force.charge(charge)
        .linkDistance(distance)
        .size([width - margin.left - margin.right,
               height - margin.top - margin.bottom]);

      force.nodes(graph.nodes)
        .links(graph.links)
        .start();

      // update links
      var link = g.selectAll(".link")
        .data(graph.links);

      // create links
      link.enter().append("line")
        .attr("class", "link");

      // remove any old links
      link.exit().remove();

      // update nodes
      var node = g.selectAll(".node")
        .data(graph.nodes);

      // transition existing nodes
      node.select("circle").transition()
        .style("fill", cValue)
        .attr("r", rValue);

      node.selectAll("a")
        .attr("xlink:href", function(d) { return "/" + d.id; })
        .text(function(n) { return n.name; });

      // create new nodes
      var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .call(force.drag);

      nodeEnter.append("circle")
        .style("fill", cValue)
        .attr("r", 0).transition()
          .attr("r", rValue);

      nodeEnter.append("text")
        .attr("dx", 10)
        .attr("dy", ".35em")
        .append("a")
          .attr("xlink:href", function(n) {
            return "/" + (n.node_type == 'gene' ? 'gene' : 'goid') + "/" + n.id;
          })
          .text(function(n) { return n.name; });

      // remove old nodes
      node.exit()
        .transition()
          .attr("r", 0)
          .remove();

      // set the forcing update function
      force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

        g.selectAll("circle").attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
        g.selectAll("text").attr("x", function(d) { return d.x; })
          .attr("y", function(d) { return d.y; });
      });
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

  chart.charge = function(_) {
    if (!arguments.length) return charge;
    charge = _;
    return chart;
  };

  chart.distance = function(_) {
    if (!arguments.length) return distance;
    distance = _;
    return chart;
  };

  chart.id = function(_) {
    if (!arguments.length) return idValue;
    idValue = _;
    return chart;
  };

  chart.r = function(_) {
    if (!arguments.length) return rValue;
    rValue = _;
    return chart;
  };

  chart.color = function(_) {
    if (!arguments.length) return cValue;
    cValue = _;
    return chart;
  };

  chart.force = function(_) {
    if (!arguments.length) return force;
    force = _;
    return chart;
  };

  return chart;
}
