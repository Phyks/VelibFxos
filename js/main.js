var tiles_provider = 'http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg';

if ( typeof String.prototype.startsWith != 'function' ) {
  String.prototype.startsWith = function( str ) {
    return this.substring( 0, str.length ) === str;
  }
};

var stations = [
    {'latitude': 48.84249, 'longitude': 2.34462},
    {'latitude': 48.84249, 'longitude': 2.34462},
]

var maps = Array();

function station_map_circle(id) {
    var id = parseInt(id);
    var latitude = stations[id - 1]['latitude'];
    var longitude = stations[id - 1]['longitude'];
    var map_id = 'map-circle-'+id;
    var slide = $('.swiper-slide[data-hash=station-'+id+']');
    var height = slide.height() - $('.station-info', slide).height() - 120;

    if(height > slide.width() - 40) {
        var tmp = slide.width() - 100;
        margin = (height - tmp) / 2;
        height = tmp;
    }
    $('#'+map_id).height(height +'px');
    $('#'+map_id).width(height +'px');

    window.maps[id-1] = L.map(map_id, { zoomControl: false}).setView([latitude, longitude], 16);
    L.marker([latitude, longitude]).addTo(window.maps[id-1]);
    window.maps[id-1].dragging.disable();
    window.maps[id-1].touchZoom.disable();
    window.maps[id-1].doubleClickZoom.disable();
    window.maps[id-1].scrollWheelZoom.disable();
    window.maps[id-1].boxZoom.disable();
    window.maps[id-1].keyboard.disable();

    L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {id: 'examples.map-20v6611k'}).addTo(window.maps[id-1]);

    window.maps[id-1].on('click', function(e) {
        e.preventDefault;
        location.hash = 'map-station-'+id;
    });
}

$(function(){
	var gallery = $('.swiper-container').swiper({
        mode:'horizontal',
        loop: true,
		slidesPerView:1,
		watchActiveIndex: true,
		centeredSlides: true,
		pagination:'.pagination',
		paginationClickable: true,
		resizeReInit: true,
		keyboardControl: true,
		grabCursor: true,
        hashNav: true,
    });

    for(id = 1; id < 4; id++) {
        station_map_circle(id);
    }
});
