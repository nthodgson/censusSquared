import {Runtime, Inspector} from "./runtime.js";

export var chartSettings = { race: true, marital: false, occupation: false, percentiles: false, filename: "race.json" };

export function updateSettings(sortBy, dataDisplay) {
    
    if (sortBy == "race") {
      chartSettings.filename = "race.json";
    }
    else if (sortBy == "marital") {
      chartSettings.filename = "marital.json";
    }
    else {
      chartSettings.filename = "occupation.json";
    }

    if (dataDisplay == "rawNumbers") {
      chartSettings.percentiles = false;
    }
    else {
      chartSettings.percentiles = true;
    }
  }

export const runtime = new Runtime();
export const main = runtime.module(define, Inspector.into("#vis"));

// https://observablehq.com/@d3/zoomable-sunburst@343
export function define(runtime, observer) {

  const main = runtime.module();

  main.variable(observer()).define(["md"], function(md){
    return (md``)
  });

  main.variable(observer("chart")).define("chart", ["partition","data","d3","width","color","arc","format","radius"], function(partition,data,d3,width,color,arc,format,radius) {

    feather.replace();

    const root = partition(data);

    var sum = 0;

    root.each(function(d) { // get sum of all values
      if (d.value > sum)
        sum = d.value;
      return d.current = d;
    });

    const svg = d3.create("svg")
      .attr("viewBox", [-50, 0, 700, 700])
      .style("font", "11px sans-serif");

    svg.append("circle")
          .attr("r", width/2)
          .attr("class", "mainCircle")
          .attr("transform", `translate(${width / 2},${width / 2})`)
          .style("opacity", 0);

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2},${width / 2})`);

    const path = g.append("g")
      .selectAll("path")
      .data(root.descendants().slice(1))
      .join("path")
        .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
        .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
        .attr("class", "arc")
        .attr("fill-rule", "evenodd")
        .attr("stroke", function(d) {
          if (d3.select(this).attr("fill-opacity") > 0)
            return "none";
          else 
            return "none";
        })
        .attr("stroke-width", 0.5)
        .attr("d", d => arc(d.current))
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);

    // svg.select(".mainCircle").on("mouseout", mouseout);

    path.filter(d => d.children)
      .style("cursor", "pointer")
      .on("click", clicked);

    const label = g.append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .style("user-select", "none")
      .selectAll("text")
      .data(root.descendants().slice(1))
      .join("text")
        .attr("dy", "0.35em")
        .attr("fill-opacity", d => +labelVisible(d.current))
        .attr("transform", d => labelTransform(d.current))
        .text(d => d.data.name);

    const parent = g.append("circle")
      .datum(root)
      .attr("class", "innerCircle")
      .attr("r", radius)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("pointer-events", "all")
      .on("click", clicked);

    g.append("text")
      .attr("class", "circleText")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.25em")
      .attr("font-size", "30px")
      .attr("font-family", "Helvetica Neue")
      .text("");

    g.append("text")
      .attr("class", "description")
      .attr("text-anchor", "middle")
      .attr("dy", "1.25em")
      .attr("font-size", "12px")
      .style("fill", "gray")
      .attr("font-family", "sans-serif")
      .text("")

    g.append("text")
      .attr("class", "modText")
      .attr("text-anchor", "middle")
      .attr("dy", "2.5em")
      .attr("font-size", "12px")
      .style("fill", "gray")
      .attr("font-family", "sans-serif")
      .text("")

    g.append("text")
      .attr("class", "incomeText")
      .attr("text-anchor", "middle")
      .attr("dy", "3.75em")
      .attr("font-size", "12px")
      .style("fill", "gray")
      .attr("font-family", "sans-serif")
      .text("")

    function initializeBreadcrumbTrail() {
      // Add the svg area.
      var trail = d3.select("#sequence").append("svg:svg")
          .attr("width", width)
          .attr("height", 40)
          .attr("id", "trail");
      // Add the label at the end, for the percentage.
      trail.append("svg:text")
        .attr("id", "endlabel")
        .style("fill", "#000");
    }

    // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
    var b = {
      w: 120, h: 40, s: 3, t: 10
    };

    // Mapping of step names to colors.
    var colors = {
      "White": "#a98ccd",
      "Black": "#cff7a1",
      "Asian": "#8adedb",
      "Hispanic": "#ffa1a2"
    };

    // Generate a string that describes the points of a breadcrumb polygon.
    function breadcrumbPoints(d, i) {
      var points = [];
      points.push("0,0");
      points.push(b.w + ",0");
      points.push(b.w + b.t + "," + (b.h / 2));
      points.push(b.w + "," + b.h);
      points.push("0," + b.h);
      if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
        points.push(b.t + "," + (b.h / 2));
      }
      return points.join(" ");
    }

    // Update the breadcrumb trail to show the current sequence and percentage.
    function updateBreadcrumbs(nodeArray, p) {

      // Data join; key function combines name and depth (= position in sequence).
      var trail = d3.select("#trail")
          .selectAll("g")
          .data(nodeArray, function(d) { return d.data.name + p.depth; });

      // Remove exiting nodes.
      trail.exit().remove();

      // Add breadcrumb and label for entering nodes.
      var entering = trail.enter().append("svg:g");

      entering.append("svg:polygon")
          .attr("points", breadcrumbPoints)
          .style("fill", function(d) { 
            if (d.depth == 1)
              return colors[d.data.name];
            else if (d.depth == 2) {
              d = d.parent;
              return colors[d.data.name];
            }
            else {
              d = d.parent;
              d = d.parent;
              return colors[d.data.name];
            }
          });

      entering.append("svg:text")
          .attr("x", (b.w + b.t) / 2)
          .attr("y", b.h / 2)
          .attr("dy", "0.35em")
          .style("fill", "black")
          .attr("text-anchor", "middle")
          .text(function(d) { return d.data.name; });

      // Merge enter and update selections; set position for all nodes.
      entering.merge(trail).attr("transform", function(d, i) {
        return "translate(" + i * (b.w + b.s) + ", 0)";
      });

      // Make the breadcrumb trail visible, if it's hidden.
      d3.select("#trail")
          .style("visibility", "");

    }


    // Handle all mouseover events
    function mouseover(p) {

      // if (d3.select(this).attr("fill-opacity") == 0.6) {
      //   d3.select(this)
      //     .attr("fill-opacity", "0.8");
      // }
      // else if (d3.select(this).attr("fill-opacity") == 0.4) {
      //   d3.select(this)
      //     .attr("fill-opacity", "0.5");
      // }  
      if (d3.select(this).attr("fill-opacity") > 0) {

        var sequenceArray = p.ancestors().reverse();
        sequenceArray.shift(); // remove root node from the array

        // Fade all the segments.
        d3.selectAll(".arc")
            .style("opacity", function(d) {
                return 0.5;
            });

        // Then highlight only those that are an ancestor of the current segment.
        d3.selectAll(".arc")
            .filter(function(node) {
                      return (sequenceArray.indexOf(node) >= 0);
                    })
            .style("opacity", function(d) {
              return 1;
            });

        updateBreadcrumbs(sequenceArray, p);

        d3.select(".circleText")
          .text(function(d) {
            if (chartSettings.percentiles) {
              if (p.value == 0)
                return "0%";
              else 
                return ((p.value/sum)*100).toFixed(1) + "%";
            }
            else {
              if (p.value == 0)
                return 0;
              else if ((p.value).toString().length <= 3)
                return p.value + "k";
              else
                return ((p.value).toFixed(1)/1000).toFixed(1) + "M";
            }
          });

        d3.select(".description")
          .text(function(d) {
            if (chartSettings.percentiles)
              return "of adults in the US are";
            else
              return "adults in the US are";
          });

        var income = "";
        var thirdDepth = false;

        d3.select(".modText")
          .text(function(d) {
            if (p.depth == 1) 
              return (p.data.name).toLowerCase();
            else if (p.depth == 2) {
              var status = p.data.name;
              p = p.parent;
              return (p.data.name + " and " + status).toLowerCase();
            }
            else if (p.depth == 3) {
              thirdDepth = true;
              income = p.data.name;
              p = p.parent;
              var status = p.data.name;
              p = p.parent;
              return (p.data.name + ", " + status + ", and").toLowerCase();
            }
          });

        d3.select(".incomeText")
          .text(function(d) {
            if (thirdDepth) 
              return "make " + income;
            else 
              return "";
          });
      }

    }

    function mouseout(p) {

      // Deactivate all segments during transition.
      d3.selectAll(".arc").on("mouseover", null);

      // Transition each segment to full opacity and then reactivate it.
      // d3.selectAll(".arc")
      //     .transition()
      //     .duration(500)
      //     .style("opacity", 1)
      //     .on("end", function() {
      //             d3.select(this).on("mouseover", mouseover);
      //           });
        d3.selectAll(".arc")
          .style("opacity", 1)
          .on("mouseover", mouseover);

      // Hide the breadcrumb trail
      d3.select("#trail")
          .style("visibility", "hidden");

      // if (d3.select(this).attr("fill-opacity") > 0.6) 
      //   d3.select(this).attr("fill-opacity", "0.6");

      // if (d3.select(this).attr("fill-opacity") == 0.5)
      //   d3.select(this).attr("fill-opacity", "0.4");

      d3.select(".circleText").text("");
      d3.select(".description").text("");
      d3.select(".modText").text("");
      d3.select(".incomeText").text("");
    }

    function clicked(p) {
      d3.select(".circleText").text("");
      d3.select(".description").text("");
      d3.select(".modText").text("");

      parent.datum(p.parent || root);

      root.each(d => d.target = {
        x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        y0: Math.max(0, d.y0 - p.depth),
        y1: Math.max(0, d.y1 - p.depth)
      });

      const t = g.transition().duration(750);

      // Transition the data on all arcs, even the ones that aren’t visible,
      // so that if this transition is interrupted, entering arcs will start
      // the next transition from the desired position.
      path.transition(t)
          .tween("data", d => {
            const i = d3.interpolate(d.current, d.target);
            return t => d.current = i(t);
          })
        .filter(function(d) {
          return +this.getAttribute("fill-opacity") || arcVisible(d.target);
        })
          .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
          .attrTween("d", d => () => arc(d.current));

      label.filter(function(d) {
          return +this.getAttribute("fill-opacity") || labelVisible(d.target);
        }).transition(t)
          .attr("fill-opacity", d => +labelVisible(d.target))
          .attrTween("transform", d => () => labelTransform(d.current));
    }
    
    function arcVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }

    function labelVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }

    function labelTransform(d) {
      const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
      const y = (d.y0 + d.y1) / 2 * radius;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }

    initializeBreadcrumbTrail();

    return svg.node();
  }); // End of main chart


  main.variable(observer("data")).define("data", ["d3"], function(d3) {
    return (d3.json("data/" + chartSettings.filename))
  });

  main.variable(observer("partition")).define("partition", ["d3"], function(d3) {
    return (
      data => {
        const root = d3.hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);

        return d3.partition().size([2 * Math.PI, root.height + 1])
          (root);
      })
  });

  main.variable(observer("color")).define("color", ["d3","data"], function(d3,data) {
    return (d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1)))
  });

  main.variable(observer("format")).define("format", ["d3"], function(d3) {
    return (d3.format(",d"))
  });

  main.variable(observer("width")).define("width", function() {
    return (550)
  });

  main.variable(observer("radius")).define("radius", ["width"], function(width) {
    return (width / 6)
  });

  main.variable(observer("arc")).define("arc", ["d3","radius"], function(d3,radius) {
    return (
      d3.arc()
          .startAngle(d => d.x0)
          .endAngle(d => d.x1)
          .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
          .padRadius(radius * 1.5)
          .innerRadius(d => d.y0 * radius)
          .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1))
    )
  });

  main.variable(observer("d3")).define("d3", ["require"], function(require) { 
    return (require("d3@5"))
  });

  return main;
}
