function update_heatmap(change_display){

    $.post(
        '/instanciate_heatmap',
         {
            year : $('#selected_year').val(),

            list_countries: $('#list_countries').find(":selected").map(function() {
                return this.text;
            }).get().join()
          },

          function(data, textStatus) {
            //generate_new_radar(data);
            //console.log(data);
            var inputData = data["gini"];
            var radial_labels = data["years"];
            var segment_labels = data["countries"];
            $("#chart").empty();
            loadCircularHeatMap(inputData, "#chart", radial_labels, segment_labels);

            if(change_display){

                $('.radarChart').hide();
                $('.heatMap').show();
            }
          },

          "json");

    return false;
}


$(function() {
  $('#button_heatmap').bind('click', function() {
    update_heatmap(true);
  });
});
