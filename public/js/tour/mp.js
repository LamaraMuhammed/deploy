
// ============================== MAP INITIALIZATION =============================================
// googleSet Layer
const googleSet = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
  "maxZoom": 20,
  "subdomains":['mt0', 'mt1', 'mt2', 'mt3']
});

// isMobile ? (mapZoomOnScroll = false) : mapZoomOnScroll = true;

const map = L.map('map', {
  center: [10.303193, 9.832808],
  zoom: 10,
  minZoom: 4,
  maxZoom: 19,
  zoomSnap: 0.5,
  zoomControl: false,
  attributionControl: false,
  layers: [googleSet]
});

// ====================================== Map Pulse Icon ==========================================
 (function(window) {

  L.Icon.Pulse = L.DivIcon.extend({

      options: {
          className: '',
          iconSize: [12,12],
          fillColor: 'red',
          color: 'red',
          animate: true,
          heartbeat: 1,
      },

      initialize: function (options) {
          L.setOptions(this,options);
          // css
          var uniqueClassName = 'lpi-'+ new Date().getTime()+'-'+Math.round(Math.random()*100000);
          var before = ['background-color: ' + this.options.fillColor];
          var after = [
              'box-shadow: 0 0 6px 3px ' + this.options.color,
              'animation: pulsate ' + this.options.heartbeat + 's ease-out',
              'animation-iteration-count: infinite',
              'animation-delay: ' + (this.options.heartbeat + .1) + 's',
          ];

          if (!this.options.animate){
              after.push('animation: none');
              after.push('box-shadow: none');
          }

          var css = [
              '.'+uniqueClassName+'{'+before.join(';')+';}',
              '.'+uniqueClassName+':after{'+after.join(';')+';}',
          ].join('');

          var el = document.createElement('style');
          if (el.styleSheet){
              el.styleSheet.cssText = css;

            } else {
              el.appendChild(document.createTextNode(css));
          }

          document.getElementsByTagName('head')[0].appendChild(el);
          // apply css class
          this.options.className = this.options.className +' leaflet-pulsing-icon '+ uniqueClassName;
          // initialize icon
          L.DivIcon.prototype.initialize.call(this, options);
      
      }
  });

  L.icon.pulse = function (options) {
      return new L.Icon.Pulse(options);
  };

  L.Marker.Pulse = L.Marker.extend({
      initialize: function (latlng,options) {
          options.icon = L.icon.pulse(options);
          L.Marker.prototype.initialize.call(this, latlng, options);
      }
  });

  L.marker.pulse = function (latlng, options) {
      return new L.Marker.Pulse(latlng, options);
  };

})(window);

// var incidentPulseIcon = L.icon.pulse({ iconSize:[11, 11], color: '#24ff00', fillColor: '#ff0000' }); 
var incidentPulseIcon = L.icon.pulse({ iconSize:[11, 11], color: '#24ff00', fillColor: '#ff0000' }); // for specific type of event

// ======================================== Pulse Icon ===========================================
var createMarker = L.Icon.extend({
  options: {
  shadowUrl: '',
  iconSize: [35, 49], //[40, 54],
  shadowSize: [50, 64],
  iconAnchor: [19, 32], //[25, 64],
  shadowAnchor: [0, 64],
  popupAnchor: [-7, -47] //[-3, -64]
  }
  });
 var MK = new createMarker({ iconUrl: '/img/Hm.png' }); 
 var clusters = new L.MarkerClusterGroup({ showCoverageOnHover: false });
  
var w = 0;
function showIncidentMarkers() {
    var lat=Math.random()*(11-10)+10;
    var lon=Math.random()*(10-9)+9;
    w++;
    let tourMarker = L.marker(L.latLng(lat, lon), { icon: incidentPulseIcon });
    clusters.addLayer(tourMarker); map.addLayer(clusters);
    w == 10 ? clearInterval(x) : '';
}
var x = setInterval(() => showIncidentMarkers(), 100); 

map.addEventListener('tileload', e => {
    console.log("load");
})
map.addEventListener('tileloading', e => {
    console.log("tileloading");
});

const Map = {
    direct: function (data) {
        say(data);
    }
}