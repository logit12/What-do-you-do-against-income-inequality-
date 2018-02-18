 document.addEventListener('DOMContentLoaded', function() {
    var list_countries = new Choices('#list_countries', {
        removeItemButton: true,
        maxItemCount: 10,
        position: "bottom"
    });

    var list_indicators = new Choices('#list_indicators', {
        removeItemButton: true,
        maxItemCount: 10,
        position: "bottom"
    });

    const valueArray = list_countries.getValue();
 })