function loadCircularHeatMap (dataset, 
                              dom_element_to_append_to,
                              radial_labels,
                              segment_labels,
                              // continentData,
                              colorRange = ["#c3d6f4", "#7dabf2", "#508eed", "#0856ce"]
                              ) {

    //console.log(dataset)

    var margin = {top: 30, right: 30, bottom: 30, left: 30};
    var width = 400 - margin.left - margin.right; // 800

    var height = width;
    var innerRadius = width/14;
    var segmentHeight = (width - margin.top - margin.bottom - 2*innerRadius )/(2*radial_labels.length)

    var chart = circularHeatChart()
    .innerRadius(innerRadius)
    .numSegments(segment_labels.length)
    .segmentHeight(segmentHeight)
    .domain([10, 20, 40])
    .range(colorRange)
    .radialLabels(radial_labels)
    .segmentLabels(segment_labels);

    chart.accessor(function(d) {return d.value;})

    var svg = d3.select(dom_element_to_append_to)
    .selectAll('svg')
    .data([dataset])
    .enter()
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append('g')
    .attr("transform",
        "translate(" + ( (width )/2 - (radial_labels.length*segmentHeight + innerRadius) + 20  ) + "," + (margin.top+20) + ")")
    .call(chart);

    var tooltip = d3.select(dom_element_to_append_to)
    .append('div')
    .attr('class', 'tooltip');

    tooltip.append('div')
    .attr('class', 'month');
    tooltip.append('div')
    .attr('class', 'value');
    tooltip.append('div')
    .attr('class', 'type');

  // var tip = d3.tip()
  // .attr('class', 'd3-tip')
  // .offset([-10, 0])
  // .html(function(d) {

  //   return "<table>"+
  //   "<tr><td colspan='2' style='color:white;text-align: center'>Month: "+(d.month)+"</td></tr>"+
  //     "<tr><td style='color:white'>Type: </td><td style='color:red'>"+(d.type)+"</td></tr>"+
  //     "<tr><td style='color:white'>Value: </td><td style='color:red'>"+(d.value)+"</td></tr>"+
  //     "</table>";
  // })
// svg.call(tip);
// svg.selectAll("path").on('mouseover', tip.show)
//                      .on('mouseout', tip.hide)

    var numSegments = segment_labels.length;
    svg.selectAll("path")
    .on('mouseover', function(d, i) {

        // d3.selectAll(d.type.replace(/ /g,'')).style("opacity", function (p) {return 0.2});

              var targetIndex = Math.floor(i / numSegments); //the layer you are hovering
                var zoomSize = 10; //inner 10px and outer 10px
                var layerCnt = dataset.length / numSegments;


                d3.selectAll("path.segment") //.arc indicates segment
                    .transition().duration(200) //transtion effect
                    .attr("d", d3.svg.arc() //set d again
                        .innerRadius(ir)
                        .outerRadius(or)
                        .startAngle(sa)
                        .endAngle(ea))


                function getRadius(floor) {
                    if (floor === 0) { //inner radius doesn't change
                        return innerRadius;
                    }
                    if (floor === layerCnt) { //outer radius doesn't change
                        return innerRadius + layerCnt * segmentHeight;
                    }
                    if (floor <= targetIndex) { //it's math
                        return innerRadius + floor * segmentHeight - zoomSize * (floor / targetIndex);
                    } else { //math again
                        return innerRadius + floor * segmentHeight + zoomSize * ((layerCnt - floor) / (layerCnt - targetIndex));
                    }
                }

                function ir(d, i) {
                    return getRadius(Math.floor(i / numSegments));
                }

                function or(d, i) {
                    return getRadius(Math.floor(i / numSegments) + 1);
                }
      // increase the segment height of the one being hovered as well as all others of the same date
      // while decreasing the height of all others accordingly

      d3.selectAll("path.segment-" + d.type.replace(/ /g,'')).style("opacity", function(p) {
        return 0.6
      });

        tooltip.select('.month').html("<b> Country: " + d.month + "</b>");
        tooltip.select('.type').html("<b> Year: " + d.type + "</b>");
        tooltip.select('.value').html("<b> Gini: " + d.value + "</b>");
        tooltip.style('display', 'block');
        tooltip.style('opacity',2);
    })
    .on('mousemove', function(d,i) {

        tooltip.style('top', (d3.event.layerY + 10) + 'px')
        .style('left', (d3.event.layerX - 25) + 'px');
    })
    .on('mouseout', function(d,i) {

        tooltip.style('display', 'none');
        tooltip.style('opacity',0);

        d3.selectAll("path.segment-" + d.type.replace(/ /g,'')).style("opacity", function(p) {
        return 1
      });
      var targetIndex = Math.floor(i / numSegments);
                var zoomSize = 10;
                var layerCnt = dataset.length / numSegments;


                d3.selectAll("path.segment")
                    .transition().duration(200)
                    .attr("d", d3.svg.arc()
                        .innerRadius(ir)
                        .outerRadius(or)
                        .startAngle(sa)
                        .endAngle(ea))

                function getRadius(floor) {
                    return innerRadius + floor * segmentHeight;
                }

                function ir(d, i) {

                    return getRadius(Math.floor(i / numSegments));
                }

                function or(d, i) {
                    return getRadius(Math.floor(i / numSegments) + 1);
                }

        // d3.selectAll(d.type.replace(/ /g,'')).style("opacity", function (p) {return 1});
    })

    .append("desc") //append the current color as a desc element
    .text(function(d) {
      var color = d3.scale.linear() // scaleLinear
                    // .domain([0, 0.5, 1])
                    .range(colorRange);
      // how to access a function within reusable charts
      //console.log(color(d.Average));
      return color(d.Average);
    })

    //append the current color as a desc element
    // .text(function(d){
    //         var color = d3.scaleLinear().domain([0,0.5,1]).range(["#ffffd9", "#7fcdbb" ,"#225ea8"]);
    //         // how to access a function within reusable charts
    //         console.log(color(d.Average));
    //         return color(d.Average);
    //     })
    ;

    //////////////////////////////////////////////////////////////


        // var svg = d3.select(dom_element_to_append_to)
        //     .selectAll('svg')
        //     // .data([dataset])
        //     .enter()
        //     .append('svg')
        //     .attr("width", width + margin.left + margin.right)
        //     .attr("height", height + margin.top + margin.bottom)
        //     .append('g')
        //     .attr("transform",
        //         "translate(" + ( (width )/2 - (radial_labels.length*segmentHeight + innerRadius)  ) + "," + margin.top + ")")
        //     .call(chart);


            // var svg = d3.select(dom_element_to_append_to).append("svg")
            //         .attr("width", (width + margin.left + margin.right))
            //         .attr("height", (height + margin.top + margin.bottom))
            //         .append("g").attr("class", "wrapper")
            //         .attr("transform",
            //     "translate(" + ( (width )/2 - (radial_labels.length*segmentHeight + innerRadius)  ) + "," + margin.top + ")");


    //     //////////////////////////////////////////////////////////////
    //     //////////////////// Create Donut Chart //////////////////////
    //     //////////////////////////////////////////////////////////////

    // var continentData = [];
    // continentData.push({
    //     name:  'Europe',
    //     value: dataset.filter(input => input.month === 1).length+dataset.filter(input => input.month === 2).length
    // })
    // continentData.push({
    //     name:  'North America',
    //     value: dataset.filter(input => input.month === 3).length+dataset.filter(input => input.month === 4).length
    // })

    // continentData.push({
    //     name:  'South America',
    //     value: dataset.filter(input => input.month === 5).length+dataset.filter(input => input.month === 6).length+dataset.filter(input => input.month === 7).length
    // })

    // continentData.push({
    //     name:  'Africa',
    //     value: dataset.filter(input => input.month === 8).length
    // })

    // continentData.push({
    //     name:  'Antarctica',
    //     value: dataset.filter(input => input.month === 9).length+dataset.filter(input => input.month === 10).length+dataset.filter(input => input.month === 11).length+dataset.filter(input => input.month === 12).length
    // })

    // // continentData.push({
    // //     name:  'Australia',
    // //     value: 0
    // // })

    // // continentData.push({
    // //     name:  'Asia',
    // //     value: 0
    // // })

    //  //Some random data
    //     var donutData = [
    //         {name: "Europe",  value: 0},
    //         {name: "North America",      value: 9},
    //         {name: "South America",   value: 19},
    //         {name: "Africa",   value: 12},
    //         {name: "Antarctica",  value: 14},
    //         {name: "Australia",  value: 21},
    //         {name: "Asia", value: 18}
    //     ];

    //     //Create a color scale
    //     var colorScale = d3.scale.linear() // scaleLinear
    //        .domain([1,3.5,6])
    //        .range(["#2c7bb6", "#ffffbf", "#d7191c"])
    //        .interpolate(d3.interpolateHcl);

    //     //Create an arc function
    //     var arc = d3.svg.arc()
    //         .innerRadius(width*0.75/2 + 100)
    //         .outerRadius(width*0.75/2 + 70);

    //     //Turn the pie chart 90 degrees counter clockwise, so it starts at the left
    //     var pie = d3.layout.pie()
    //         .startAngle(-90 * Math.PI/180)
    //         .endAngle(-90 * Math.PI/180 + 2*Math.PI)
    //         .value(function(d) { return d.value; })
    //         .padAngle(.01)
    //         .sort(null);


    //     //Create the donut slices and also the invisible arcs for the text
    //     svg.selectAll(".donutArcs")
    //       .data(pie(continentData))
    //       .enter().append("path")

    //       .attr("class", "donutArcs")
    //       .attr("d", arc)
    //       .style("fill", function(d,i) {
    //             if(i === 7) return "#CCCCCC"; //Other
    //             else return colorScale(i);
    //         })

    //     .each(function(d,i) {
    //         //Search pattern for everything between the start and the first capital L
    //         var firstArcSection = /(^.+?)L/;

    //         //Grab everything up to the first Line statement
    //         var newArc = firstArcSection.exec( d3.select(this).attr("d") )[1];
    //         //Replace all the comma's so that IE can handle it
    //         newArc = newArc.replace(/,/g , " ");

    //         //If the end angle lies beyond a quarter of a circle (90 degrees or pi/2)
    //         //flip the end and start position
    //         if (d.endAngle > 90 * Math.PI/180) {
    //             var startLoc    = /M(.*?)A/,        //Everything between the first capital M and first capital A
    //                 middleLoc   = /A(.*?)0 0 1/,    //Everything between the first capital A and 0 0 1
    //                 endLoc      = /0 0 1 (.*?)$/;   //Everything between the first 0 0 1 and the end of the string (denoted by $)
    //             //Flip the direction of the arc by switching the start en end point (and sweep flag)
    //             //of those elements that are below the horizontal line
    //             var newStart = endLoc.exec( newArc )[1];
    //             var newEnd = startLoc.exec( newArc )[1];
    //             var middleSec = middleLoc.exec( newArc )[1];

    //             //Build up the new arc notation, set the sweep-flag to 0
    //             newArc = "M" + newStart + "A" + middleSec + "0 0 0 " + newEnd;
    //         }//if

    //         //Create a new invisible arc that the text can flow along
    //         svg.append("path")
    //             .attr("class", "hiddenDonutArcs")
    //             // .attr("transform", "translate(317,320)")
    //             .attr("transform",
    //     "translate(" + ( (width )/2 - (radial_labels.length*segmentHeight + innerRadius) + 20 +247 ) + "," + (margin.top+50+220) + ")")
    //             .attr("id", "donutArc"+i)
    //             .attr("d", newArc)
    //             .style("fill", "none");
    //     })
    //         // .attr("transform", "translate(317,320)")
    //         .attr("transform",
    //     "translate(" + ( (width )/2 - (radial_labels.length*segmentHeight + innerRadius) + 20 +247 ) + "," + (margin.top+50+220) + ")")
    //      ;

    //      //console.log(width)
    //      //console.log((width )/2 - (radial_labels.length*segmentHeight + innerRadius) + 20  )
    //      //console.log('------------------')
    //      //console.log(height)
    //      //console.log(margin.top+50)
    //     //Append the label names on the outside
    //     svg.selectAll(".donutText")
    //         .data(pie(continentData))
    //        .enter().append("text")
    //         .attr("class", "donutText")
    //         //Move the labels below the arcs for those slices with an end angle greater than 90 degrees
    //         .attr("dy", function(d,i) { return (d.endAngle > 90 * Math.PI/180 ? 18 : -11); })
    //        .append("textPath")
    //         .attr("startOffset","50%")
    //         .style("text-anchor","middle")
    //         .attr("xlink:href",function(d,i){return "#donutArc"+i;})
    //         .text(function(d){return d.data.name;});


}

function circularHeatChart() {
    var margin = {top: 20, right: 20, bottom: 20, left: 20},
    innerRadius = 20,
    numSegments = 12,
    segmentHeight = 20,
    domain = null,
    range = ["white", "red"],
    accessor = function(d) {return d;},
    radialLabels = segmentLabels = [];

    function chart(selection) {
        selection.each(function(data) {
            var svg = d3.select(this);


            var offset = innerRadius + Math.ceil(data.length / numSegments) * segmentHeight;
            g = svg.append("g")
                .classed("circular-heat", true)
                .attr("transform", "translate(" + parseInt(margin.left + offset) + "," + parseInt(margin.top + offset) + ")");

            var autoDomain = false;
            if (domain === null) {
                domain = d3.extent(data, accessor);
                autoDomain = true;
            }
            var color = d3.scale.threshold().domain(domain).range(range); // d3.scale.linear().domain(domain).range(range);
            if(autoDomain)
                domain = null;



            g.selectAll("path").data(data)
                .enter().append("path")
                .attr("class", function(d) {
                  return "segment-" + d.type.replace(/ /g,'')+" segment"
                })
                .attr("id", function(d) {
                  return "segment-" + d.type.replace(/ /g,'') + "-" + d.month;
                })
                // .attr("class",function(d){return d.type.replace(/ /g,'')})
                .attr("d", d3.svg.arc().innerRadius(ir).outerRadius(or).startAngle(sa).endAngle(ea)) // d3.arc()
                .attr("stroke", function(d) {return "#4f5b69";})
                .attr("fill", function(d) {return color(accessor(d));});

            // Unique id so that the text path defs are unique - is there a better way to do this?
            var id = d3.selectAll(".circular-heat")[0];

            //Radial labels
            var lsa = 0.01; //Label start angle
            var labels = svg.append("g")
                // .classed("labels", true)
                // .classed("radial", true)
                .attr("transform", "translate(" + parseInt(margin.left + offset) + "," + parseInt(margin.top + offset) + ")");

            labels.selectAll("def")
                .data(radialLabels).enter()
                .append("def")
                .append("path")
                .attr("id", function(d, i) {return "radial-label-path-"+id+"-"+i;})
                .attr("d", function(d, i) {
                    var r = innerRadius + ((i + 0.2) * segmentHeight);
                    return "m" + r * Math.sin(lsa) + " -" + r * Math.cos(lsa) +
                            " a" + r + " " + r + " 0 1 1 -1 0";
                });

            /*labels.selectAll("text")
                .data(radialLabels).enter()
                .append("text")
                .append("textPath")
                .attr("xlink:href", function(d, i) {return "#radial-label-path-"+id+"-"+i;})
                .style("font-size", "16px")
                .text(function(d) {return d;});*/

            //Segment labels
            var segmentLabelOffset = 2;
            var r = innerRadius + Math.ceil(data.length / numSegments) * segmentHeight + segmentLabelOffset;
            labels = svg.append("g")
                .classed("labels", true)
                .classed("segment", true)
                .attr("transform", "translate(" + parseInt(margin.left + offset) + "," + parseInt(margin.top + offset) + ")");

            labels.append("def")
                .append("path")
                .attr("id", "segment-label-path-"+id)
                .attr("d", "m0 -" + r + " a" + r + " " + r + " 0 1 1 -1 0");

            labels.selectAll("text")
                .data(segmentLabels).enter()
                .append("text")
                .append("textPath")
                .attr("xlink:href", "#segment-label-path-"+id)
                .style("font-size", "16px")
                .attr("startOffset", function(d, i) {return i * 100 / numSegments + "%";})
                .text(function(d) {return d;});
        });

    }

    /* Arc functions */
    ir = function(d, i) {
        return innerRadius + Math.floor(i/numSegments) * segmentHeight;
    }
    or = function(d, i) {
        return innerRadius + segmentHeight + Math.floor(i/numSegments) * segmentHeight;
    }
    sa = function(d, i) {
        return (i * 2 * Math.PI) / numSegments;
    }
    ea = function(d, i) {
        return ((i + 1) * 2 * Math.PI) / numSegments;
    }

    /* Configuration getters/setters */
    chart.margin = function(_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
    };

    chart.innerRadius = function(_) {
        if (!arguments.length) return innerRadius;
        innerRadius = _;
        return chart;
    };

    chart.numSegments = function(_) {
        if (!arguments.length) return numSegments;
        numSegments = _;
        return chart;
    };

    chart.segmentHeight = function(_) {
        if (!arguments.length) return segmentHeight;
        segmentHeight = _;
        return chart;
    };

    chart.domain = function(_) {
        if (!arguments.length) return domain;
        domain = _;
        return chart;
    };

    chart.range = function(_) {
        if (!arguments.length) return range;
        range = _;
        return chart;
    };

    chart.radialLabels = function(_) {
        if (!arguments.length) return radialLabels;
        if (_ == null) _ = [];
        radialLabels = _;
        return chart;
    };

    chart.segmentLabels = function(_) {
        if (!arguments.length) return segmentLabels;
        if (_ == null) _ = [];
        segmentLabels = _;
        return chart;
    };

    chart.accessor = function(_) {
        if (!arguments.length) return accessor;
        accessor = _;
        return chart;
    };

    return chart;
}