function update_radar(change_display){

    $.post(
        '/instanciate_radar',
         {
            year : $('#selected_year').val(),

            list_indicators : $('#list_indicators').find(":selected").map(function() {
                return this.text;
            }).get().join(),

            list_countries: $('#list_countries').find(":selected").map(function() {
                return this.text;
            }).get().join(),

            gini_from: $('#from_gini').val(),

            gini_to: $('#to_gini').val()

          },

          function(data, textStatus) {
            if(change_display){
                $('.radarChart').show();
                $('.heatMap').hide();
            }
            generate_new_radar(data);

          },

          "json");
    return false;
}


$(function() {
  $('#button_radar').bind('click', function() {
    update_radar(true);
  });
});


function generate_new_radar(selected_data){

    //////////////////////////////////////////////////////////////
    //////////////////////// Set-Up //////////////////////////////
    //////////////////////////////////////////////////////////////
    var margin = {top: 100, right: 100, bottom: 100, left: 100},
        width = Math.min(700, window.innerWidth - 10) - margin.left - margin.right,
        height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);

    //////////////////////////////////////////////////////////////
    ////////////////////////// Data //////////////////////////////
    //////////////////////////////////////////////////////////////

    function rgb2hex(rgb) {
        rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        function hex(x) {
            return ("0" + parseInt(x).toString(16)).slice(-2);
        }
        return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    }

    var color_countries = {};
    $('#list_countries').next().children().each(function() {
        col_country = rgb2hex($(this).css("background-color"));
        name_country = $(this).attr("data-value");
        color_countries[name_country] = col_country;
        //color_countries.push(col_country);
    });

    var data = []

    for (var country in selected_data) {
        if (selected_data.hasOwnProperty(country)) {
            var data_for_country = [];
            if (typeof color_countries[country] == 'undefined'){
               color_countries[country] = "#7f7f7f";
            }
            for (var indic in selected_data[country]) {
                if (selected_data[country].hasOwnProperty(indic)) {
                    data_for_country.push({axis:indic, value:selected_data[country][indic][0],
                    value_scaled:selected_data[country][indic][1], predicted:selected_data[country][indic][2],
                        color:color_countries[country], country: country});
                }
            }

            data.push(data_for_country);
         }
    }

    //console.log(data);


    var radarChartOptions = {
      w: 260,
      h: 260,
      //margin: margin,
      maxValue: 125,
      levels: 5,
      roundStrokes: false,
      color: color_countries,
      //wrapWidth: ,
      opacityArea: 0.1,
      dotRadius: 3,
      //opacityCircles: 0.2,
      strokeWidth: 1,
      //color: color
    };
    //Call function to draw the Radar chart
    RadarChart(".radarChart", data, radarChartOptions);
}

