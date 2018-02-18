var margin = {top: 10, left: 10, right: 10, bottom: 10};

var width = 630;
var height = 550;

// SVG canvas with specified width, height
var svg_worldmap = d3.select("#map")
            .append("svg")
            .attr("width", width + margin.top + margin.bottom)
            .attr("height", height + margin.left + margin.right)


var rect = svg_worldmap.append("rect")
              .attr("class", "textArea")
              .attr("x", 325)
              .attr("y", 460)
              .attr("height", 100)
              .attr("width", 320)
              .attr("fill", "rgba(0, 0, 0, 0.6)")
              .attr("display", "none")
              .attr("border-radius", "50px")
              .attr("rx", "20")
              .attr("ry", "20")
              .attr("border", "2px")
              .attr("padding", "20px")


var textArea = svg_worldmap.append("text")
                  //.attr("dy", ".35em")
                  .attr("font-weight", "bold")
                  .style("font-family","sans-serif")
                  //.attr("border","2px" )
                  //.attr("border-radius", "5px")


// Titles du text
var textGiniIndexTitle = textArea.attr("display", "true")
                                .append("tspan")
                                .attr("class", "spanMapTitle")
                                .attr("x", 350).attr("y", 490)
                                //.attr("position", absolute)
                                .attr("fill","#FFB833") //"#E17827"
                                .style("font-size","16px")
                                //.style("text-anchor", "left")

var textCountryTitle = textArea.attr("display", "true")
                          .append("tspan")
                          .attr("class", "spanMapTitle")
                          .attr("x", 350).attr("y", 515)
                          .attr("fill","#FFB833")
                          .style("font-size","14px")


var textYearTitle = textArea.attr("display", "true")
                            .append("tspan").attr("class", "spanMapTitle")
                            .attr("x", 350).attr("y", 540)
                            .attr("fill","#FFB833")
                            .style("font-size","14px")

// Variables du text
var textGiniIndex = textArea.attr("display", "true")
                            .append("tspan")
                            .attr("x", 450).attr("y", 490)
                            .attr("class", "spanMapValue")
                            .attr("fill","#FFFFFF")
                            .style("font-size","16px")
                                                        /*.style("font-size","10px")*/
var textCountry = textArea.attr("display", "true")
                          .append("tspan")
                          .attr("x", 420).attr("y", 515).attr("class", "spanMapValue")
                          .attr("fill","#FFFFFF")
                          .style("font-size","14px")
                          //.style({"font-family":"sans-serif","font-size":"20px", "fill":"red"}) .style("font-size","14px")


var textYear = textArea.attr("display", "true")
                       .append("tspan")
                       .attr("x", 395).attr("y", 540)
                       .attr("class", "spanMapValue").style("font-size","10px")
                       .attr("fill","#FFFFFF")
                       .style("font-size","14px")

// Group
var g_worldmap = svg_worldmap.append("g").attr("transform", "translate(" + margin.left + "," + margin.top +")");

// Mercator projection (map spherical coordinates on 2D screen) (v3)
var projection = d3.geo.mercator().translate([width / 2, height / 2]).scale(95);  //

// Takes as input the projected 2D geometry (v3)
var path = d3.geo.path().projection(projection);

/*
// To zoom on the map
var zoom = d3.behavior.zoom() // (v4 - d3.zoom())
         .on("zoom",function() {
         g.attr("transform","translate("+
         d3.event.translate.join(",")+")scale("+d3.event.scale+")");
         g.selectAll(".country").attr("d", path.projection(projection));
       });

svg.call(zoom)
*/

var initialYear = "1970";

var prevYear = "initial";

var selectedYear = initialYear;

var slider = d3.select("#slider")
               .call(chroniton().labelFormat(d3.time.format('%Y'))
                                .domain([new Date(initialYear), new Date("2010")])
                                .width(600)
                                .playButton(true)
                                .playbackRate(0.2)
                                .loop(false)
                                .on('change', function(newDate) {
                                     var newYear = Math.ceil((newDate.getFullYear()));
                                     selectedYear = newYear;

                                     $('#selected_year').val(selectedYear);


                                     if (prevYear != newYear)
                                     {
                                        if($(".heatMap").css("display") == "none"){
                                            update_radar(false);
                                        } else{
                                            update_heatmap(false);
                                        }

                                        updateMap();
                                        prevYear = newYear;
                                        svg_worldmap.selectAll("path").style("fill", getColor);
                                        information=[];

                                      }
                                      }
                                    ));

var information = []; // dictionary : key (country name), value (gini index at specific year)

var blues = ["rgb(222,235,247)", "rgb(158,202,225)", "rgb(8,81,156)", "rgb(8,48,107)"]

blues = ["#eff3ff", "#bdd7e7", "#6baed6", "#3182bd", "#08519c"]

var colorScale = d3.scale.quantize().range(blues);
var legendScale = d3.scale.quantize().range(blues);

function addInformation(giniD) {
   if (giniD["year"] == selectedYear && giniD["value"] != 0){
       var f = d3.format(".1f");
       giniD["value"] = +f(giniD["value"]);
       var info = {key: giniD["name"], value: [giniD["value"], giniD["predicted"]]};
       information.push(info);
       return giniD;
      }
}

var informationColor = [];
function getColor(geoD) {
  let value = -1
  information.forEach(function(info) {

      if (geoD.properties.name == info.key) {
          value = info.value[0];
          country = geoD.properties.name
      }
  })
  if (value == -1) {
    return d3.rgb("#CECECE");
      }
  else {
      informationColor.push({key: country, value: colorScale(value)})
      return d3.rgb(colorScale(value));
  }
}

function readInformation(geoD) {
    var value = "N/A";
    information.forEach(function(info) {
    if (geoD.properties.name == info.key && info.value[0] != 0) {
        if(info.value[1] == "True") {
            value = info.value[0] + " (interpolated)";
            return;
          }
          else {
             value = info.value[0]
            return;
          }
        }});

     textGiniIndexTitle.text("Gini Index : ");
     textGiniIndex.text(value);
}



function updateMap() {
  d3.json("static/data/countries.geo.json", function(error, geoData) {
      d3.csv("static/data/gini_full_final_new.csv", function(error, giniData) {

        giniData.forEach(addInformation);

        colorScale.domain(d3.extent(information, function(d){
            return d.value[0];
        }));

        legendScale.domain(d3.extent(information, function(d){
            return d.value[0];
        }));

        // Converts our raw geo data into usable geo data.
        // var countries = topojson.feature(data, data.objects.arcs).features
        var countries = geoData.features

        g_worldmap.selectAll(".country")
           .data(countries)  // building a path for every single country
           .enter().append("path")
           .attr("class", "country")
           .style("stroke", "black")
           .style("stroke-width", "1px")
           .style("fill", getColor)
           .attr("d", path)
           .on("mouseover", function(d, i) {
             d3.select(this)
               .style("opacity", 1)
               .style("stroke","white")
               .style("stroke-width", 2);
               readInformation(d);
               textCountryTitle.text("Country : ");
               textYearTitle.text("Year : ");
               textCountry.text(d.properties.name);
               textYear.text(selectedYear);
               rect.attr("display", "true");
           })
           .on('mouseout', function(d){
               d3.select(this)
                  .style("opacity", 1)
                  .style("stroke","black")
                  .style("stroke-width", 1);
                  textGiniIndexTitle.text("");
                  textCountryTitle.text("");
                  textYearTitle.text("");
                  textGiniIndex.text("");
                  textCountry.text("");
                  textYear.text("");
                rect.attr("display", "none")
              });

           svg_worldmap.append("g")
              .attr("class", "legendLinear")
              .attr("transform", "translate(60, 450)");

           var targetCountries = [];
           var geoTargetCountries = [];

           var dataL = 0;
           var offset = 80;

           var legendLinear = d3.legend.color()
                                   .shapeWidth(60)
                                   .shapeRadius(7)
                                   .shape("circle")
                                   .scale(legendScale)
                                   .title("Gini Index")

            d3.select(".legendLinear").call(legendLinear);
         })
     })
}
