

// tsv loaded asynchronously
function fillGrid(fileName) {

  d3.tsv("Data/tsv/" + fileName, type, function(data) {

    
    var gridWidth = $("div.gridInfo").width();
    var gridHeight = $("div.gridInfo").height();

    var margin = {top: 45, right: 30, bottom: 20, left: 110},
        width = gridWidth - margin.left - margin.right,
        height = 150 - margin.top - margin.bottom;

    var formattotal = d3.format(".0%");

    var color = d3.scale.linear()
              .range(["#bad5e5","#8cbcd7","#5fa3ca","#328abd","#0571b0"])
              .domain([0,1000,4000,7000,10000]);

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    // Scales. Note the inverted domain fo y-scale: bigger is up!
    var y = d3.scale.sqrt()
        .range([80, 60]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(formattotal);

    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        if ((d.total).toString().length <= 3)
          return "<strong>" + d.total + "k</strong>";
        else
          return "<strong>" + ((d.total).toFixed(1)/1000).toFixed(2) + "M</strong>";
      })

    // Data is nested by characteristic
    var countries = d3.nest()
        .key(function(d) { return d.characteristic; })
        .entries(data);

    // Compute the minimum and maximum income and total across symbols.
    x.domain(data.map(function(d) { return d.income; }));
    y.domain([0, d3.max(countries, function(s) { return s.values[0].total; })]);

    // Add an SVG element for each marital status, with the desired dimensions and margin.
    if (!gridStatus.accessed) {
      var svg = d3.select("#vis").selectAll("svg")
        .data(countries)
        .enter()
        .append("svg:svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      svg.append("g")
          .attr("class", "x axis")
          .attr("font-family", "sans-serif")
          .attr("font-size", "12px")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

      svg.append("g")
          // Hide y axis
          // .attr("class", "y axis")
          // .call(yAxis)
        .append("text")
        .attr("x", -110)
        .attr("y", height/2)
        .attr("dy", ".71em")
        .attr("text-anchor", "start")
        .attr("font-family", "sans-serif")
        .attr("font-size", "14px")
        .text(function(d) { return d.key});

      // Accessing nested data: https://groups.google.com/forum/#!topic/d3-js/kummm9mS4EA
      // data(function(d) {return d.values;}) 
      // this will dereference the values for nested data for each group
      svg.selectAll(".bar")
          .data(function(d) {return d.values;})
          .enter()
          .append("rect")
          .attr("class", "bar")
          .attr("x", function(d) { return x(d.income); })
          .attr("width", x.rangeBand())
          .attr("y", function(d) { return y(d.total); })
          .attr("height", function(d) { return height - y(d.total); })
          .attr("fill", function(d) {return color(d.total)})
          .attr("stroke-width", "1px")
          .attr("stroke", function(d) {
            if (gridStatus.belowPoverty && poverty.includes(d.income))
              return "yellow";
            else if (gridStatus.belowMedian && median.includes(d.income))
              return "yellow";
            else
              return "initial";
          })
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide)
    }
    else {
      var svg = d3.select("#vis").selectAll("svg").transition();
        // svg.select(".x.axis")
        //   .duration(750)
        //   .call(xAxis);


        svg.select(".text")
          .duration(750)
          .attr("font-size", "20px")
          //.text(function(d) { return d.key});

        // svg.selectAll(".bar")
        //   .data(function(d) {return d.values;})
        //   .enter()
        //   .duration(750)
        //   .attr("x", function(d) { return x(d.income); })
        //   .attr("y", function(d) { return y(d.total); })
        //   .attr("height", function(d) { return height - y(d.total); })
        //   .attr("fill", function(d) {return color(d.total)})
        //   .attr("stroke", function(d) {
        //     if (gridStatus.belowPoverty && poverty.includes(d.income))
        //       return "yellow";
        //     else if (gridStatus.belowMedian && median.includes(d.income))
        //       return "yellow";
        //     else
        //       return "initial";
        //   })
    }
    
    svg.call(tip);

  });
}

function type(d) {
  d.total = +d.total;
  return d;
}

// function updateData(fileName) {
//   d3.tsv("Data/tsv/" + fileName, type, function(data) {
//     var svg = d3.select("#vis").selectAll("svg").transition();
//       svg.selectAll(".bar")
//         .duration(750)
//         .attr("x", function(d) { return x(d.income); })
//         .attr("y", function(d) { return y(d.total); })
//         .attr("fill", function(d) {return color(d.total)})
//         .attr("stroke", function(d) {
//           if (gridStatus.belowPoverty && poverty.includes(d.income))
//             return "yellow";
//           else if (gridStatus.belowMedian && median.includes(d.income))
//             return "yellow";
//           else
//             return "initial";
//         })
//         .on('mouseover', tip.show)
//         .on('mouseout', tip.hide)

//       svg.call(tip);
//   });
// }



