//////////////////////////////////////////////////////////////
//////////////////////// Set-Up //////////////////////////////
//////////////////////////////////////////////////////////////
var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = Math.min(700, window.innerWidth - 10) - margin.left - margin.right,
    height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);

//////////////////////////////////////////////////////////////
////////////////////////// Data //////////////////////////////
//////////////////////////////////////////////////////////////
var data = [
          [//iPhone
            {axis:" ",value:0,value_scaled:0},
            {axis:" ",value:0,value_scaled:0},
            {axis:" ",value:0,value_scaled:0},
            {axis:" ",value:0,value_scaled:0},
            {axis:" ",value:0,value_scaled:0},
            {axis:" ",value:0,value_scaled:0},
            {axis:" ",value:0,value_scaled:0},
            {axis:" ",value:0,value_scaled:0}
          ]
        ];
//////////////////////////////////////////////////////////////
//////////////////// Draw the Chart //////////////////////////
//////////////////////////////////////////////////////////////

// modif pour v4
//var color = d3.scale.ordinal()
//	.range(["#EDC951","#CC333F","#00A0B0"]);

//var color = d3.scaleOrdinal(["#EDC951","#CC333F","#00A0B0"]);

var radarChartOptions = {
  w: 300,
  h: 300,
  margin: margin,
  maxValue: 0.5,
  levels: 5,
  roundStrokes: true,

  //labelFactor: 1.15,
  //wrapWidth: ,
  //opacityArea: 0.2,
  //dotRadius: 4,
  //opacityCircles: 0.2,
  //strokeWidth: 2,
  //color: color
};
//Call function to draw the Radar chart
RadarChart(".radarChart", data, radarChartOptions);
