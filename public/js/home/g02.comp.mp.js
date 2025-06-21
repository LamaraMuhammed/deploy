say(localStorage.getItem('g-c'))
// const googleSet = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
const googleSet = L.tileLayer('https://{s}.google.com/vt/lyrs,h=s&x={x}&y={y}&z={z}',{
// const googleSet = L.tileLayer(
//   "https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}",
//   {
    minZoom: 7,
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  }
);

const map = L.map("map", {
  center: { lat: 9.06001640133694, lng: 7.489918847508262 },
  zoom: 7,
  minZoom: 7,
  maxZoom: 19,
  zoomSnap: 0.25,
  zoomControl: false,
  attributionControl: false,
  flyZoom: 18,
  layers: [googleSet],
});

map.on("dragstart", () => Markers.pauseAutoMove());

map.on("dragend", () => Markers.continueAutoMove());

map.on("popupopen", () => Markers.pauseAutoMove());

map.on("popupclose", () => Markers.continueAutoMove(1000));

new (function () {
  L.Icon.Pulse = L.DivIcon.extend({
    options: {
      className: "",
      iconSize: [11, 11],
    },

    initialize: function (options) {
      L.setOptions(this, options);
      // initialize icon
      L.DivIcon.prototype.initialize.call(this, options);
    },
  });

  L.icon.pulse = function (options) {
    return new L.Icon.Pulse(options);
  };

  L.Marker.Pulse = L.Marker.extend({
    initialize: function (latlng, options) {
      options.icon = L.icon.pulse(options);
      L.Marker.prototype.initialize.call(this, latlng, options);
    },
  });

  L.marker.pulse = function (latlng, options) {
    return new L.Marker.Pulse(latlng, options);
  };
})();

const Markers = {
  localG: null,
  remoteG: null,
  g01Marker: null,
  g02Marker: null,
  g03Marker: null,
  localCoords: null,
  remoteCoords: null,
  touchMarker: null,
  loopTimeId: null,
  s_id: null, // i.e sender id on indicator chanel
  delMarkerIndex: null,
  localIndicatorMarker: null,
  remoteIndicatorMarker: null,
  midPointer: null,
  outerPointer: null,
  X0: null,
  X1: null,
  Y0: null,
  Y1: null,

  localMkList: [],
  remoteMkList: [],
  tripMkList: [],
  tripData: [],
  copyTripData: [],
  moveId: [],
  flyId: [],
  bbox: [],

  autoMove: true,
  localSnap: false,
  remoteSnap: false,
  flyToActiveRoute: false,
  recordingStarted: false,
  recordingFinished: false,
  ps_profile_send: false,
  layered: false,

  touchIcon: L.divIcon({
    className: "touch-icon",
    iconSize: [40, 60],
    iconAnchor: [13, 13],
  }),

  clusterMarker: new L.MarkerClusterGroup({ showCoverageOnHover: false }),
  localUserIcon: L.icon.pulse({ className: "leaflet-user-pulsing-icon" }),
  remotePsBorderIcon: L.icon.pulse({
    className: "leaflet-ps-pulsing-borders-icon",
  }),
  remotePsMidIcon: L.icon.pulse({ className: "leaflet-ps-pulsing-mid-icon" }),

  guestIcon: {
    icon: L.icon.pulse({ className: "leaflet-guest-pulsing-icon" }),
    autoPan: true,
    autoPanSpeed: 3,
    autoPanOnFocus: true,
    autoPanPadding: [200, 400],
  },

  activeUserIcon: {
    icon: L.icon.pulse({ className: "leaflet-activeGuest-pulsing-icon" }),
    autoPan: true,
    autoPanSpeed: 3,
    autoPanOnFocus: true,
    autoPanPadding: [200, 400],
  },

  options: {
    animate: true,
    duration: 3,
    easeLinearity: 0.5,
    padding: [25, 25],
    maxZoom: map.getZoom(),
  },

  reverseCoords: function (c) {
    let x = String(c.lat).split(".");
    let y = String(c.lng).split(".");

    return `${x[1]}-${y[1]}-${x[0]}.${y[0]}`;
  },

  arrCoords: function (c) {
    let xy = c.split("-");
    let hd = xy[2].split(".");
    return { lat: `${hd[0]}.${xy[0]}`, lng: `${hd[1]}.${xy[1]}` };
  },

  pauseAutoMove: function () {
    this.moveId.forEach((id) => clearTimeout(id));
    this.autoMove = false;
  },

  continueAutoMove: function (delay) {
    this.moveId.push(doLater(() => (this.autoMove = true), delay || 11000));
  },

  setState: function (x, y) {
    if (dom.registeredUser()) localStorage.setItem(x, y || "enabled");
  },

  isDefault: function (x) {
    return localStorage.getItem(x) === null ? true : false;
  },

  checkState: function (x) {
    return localStorage.getItem(x) === "enabled" ?? false;
  },

  getState: function (x) {
    return localStorage.getItem(x);
  },

  myPosEnabled: function () {
    return this.checkState("pos");
  },

  activeRoute: function (route) {
    if (dom.defaultFrndToInteract === route) {
      return true;
    } else {
      return false;
    }
  },

  fit: function (coords, route) {
    if (this.autoMove && this.activeRoute(route)) {
      if (this.checkState("automate") && this.myPosEnabled()) {
        this.remoteCoords = L.latLng(coords.lat, coords.lng);
      } else if (
        this.checkState("automate") &&
        !this.myPosEnabled() &&
        !this.remoteSnap
      ) {
        map.fitBounds([coords, coords], {
          animate: true,
          duration: 3,
          easeLinearity: 0.7,
          paddingTopLeft: [50, 50],
          maxZoom: map.getZoom(),
        });
      } else if (this.remoteSnap) {
        map.flyTo(L.latLng(coords, coords), map.options.flyZoom);

        if (Math.round(map.getZoom()) === map.options.flyZoom)
          doLater(() => (Markers.remoteSnap = false), 100);
      }
    }
  },

  showDragHandle: async function (e) {
    if (dom.isMobile) {
      this.clearLines();
      if (this.touchMarker) map.removeLayer(this.touchMarker);

      this.touchMarker = await new L.marker(e ? e.latlng : map.getCenter(), {
        draggable: true,
        icon: this.touchIcon,
      }).on("drag", (drag) => this.doIllustration(drag));

      this.touchMarker.addTo(map);
    }
  },

  removeDragHandle: function () {
    if (this.touchMarker) {
      map.removeLayer(this.touchMarker);
      this.clearLines();
    }
  },

  doIllustration: function (e, r) {
    this.x = e.latlng.lat;
    this.y = e.latlng.lng;

    if (!dom.isMobile) {
      if (this.outerPointer) map.removeLayer(this.outerPointer);
      this.outerPointer = L.circle([this.x, this.y], {
        color: "#00ff00",
        weight: 1,
        fillColor: "",
        fillOpacity: 0,
        radius: 5,
        pane: "shadowPane",
      }).addTo(map);
    }

    if (this.midPointer || this.X0 || this.Y0) {
      map.removeLayer(this.midPointer);

      // Removing the existing vertical line
      map.removeLayer(this.X0);
      map.removeLayer(this.X1);

      // Removing the existing horizontal
      map.removeLayer(this.Y0);
      map.removeLayer(this.Y1);
    }

    // vertical line
    this.X0 = L.polyline(
      [
        [this.x, this.y],
        [this.x, 1.0],
      ],
      { color: "#00ff00", weight: 1 }
    ).addTo(map);
    this.X1 = L.polyline(
      [
        [this.x, this.y],
        [this.x, 100],
      ],
      { color: "#00ff00", weight: 1 }
    ).addTo(map);

    // horizontal line
    this.Y0 = L.polyline(
      [
        [this.x, this.y],
        [1.0, this.y],
      ],
      { color: "#00ff00", weight: 1 }
    ).addTo(map);
    this.Y1 = L.polyline(
      [
        [this.x, this.y],
        [100, this.y],
      ],
      { color: "#00ff00", weight: 1 }
    ).addTo(map);

    this.midPointer = L.circle([this.x, this.y], {
      color: "#000000",
      weight: 0,
      fillColor: "black",
      fillOpacity: 0.7,
      radius: 2,
    }).addTo(map);
    this.focusOnMe(e, r);
  },

  clearLines: function () {
    if (this.midPointer) {
      if (!dom.isMobile) map.removeLayer(this.outerPointer);
      map.removeLayer(this.midPointer);

      // Removing the existing vertical line
      map.removeLayer(this.X0);
      map.removeLayer(this.X1);

      // Removing the existing horizontal
      map.removeLayer(this.Y0);
      map.removeLayer(this.Y1);
    }
  },

  focusOnMe: function (e, r) {
    if (this.checkState("automate")) {
      if (!r) {
        let dur = map.getZoom() < 11 ? 4 : 2;
        if (this.edges.east(e)) {
          map.panBy([50, 0], { duration: dur, animate: true });
        } else if (this.edges.north(e)) {
          map.panBy([0, -50], { duration: dur, animate: true });
        } else if (this.edges.west(e)) {
          map.panBy([-50, 0], { duration: dur, animate: true });
        } else if (this.edges.south(e)) {
          map.panBy([0, 50], { duration: dur, animate: true });
        }
      } else {
        map.panTo(e.latlng, { duration: 9, animate: true });
      }
      this.pauseAutoMove();
    }
  },

  deleteOneMarker: function (store, selfDel) {
    if (store.length > 0) {
      map.removeLayer(store[store.length - 1]);
      if (dom.defaultFrndToInteract && selfDel)
        Markers.delMarkerIndex =
          store[store.length - 1].options.index.toString();
      dom.mp.delete(store.length - 1);
      store.pop();
    }
  },

  deleteAllMarkers: function (store, selfDel) {
    if (store.length > 2) {
      store.forEach((m, i) => {
        map.removeLayer(m);
        dom.mp.delete(i);
      });
      if (dom.defaultFrndToInteract && selfDel) Markers.delMarkerIndex = "$0";
      store.splice(0, store.length);
    }

    if (Markers.remoteMkList.length > 0 && selfDel) {
      Markers.remoteMkList.forEach((m) => map.removeLayer(m));
      Markers.remoteMkList.splice(0, Markers.remoteMkList.length);
    }

    if (Markers.tripMkList.length > 0) {
      Markers.tripMkList.forEach((mk) => map.removeLayer(mk));
      this.setState("pos");
      Markers.layered = false;
    }
  },

  // Trip Reader
  readData: function () {
    let len = this.tripData.length,
      dt;
    if (
      !dom.defaultFrndToInteract &&
      len > 0 &&
      this.copyTripData.length === 0
    ) {
      this.copyTripData = [].concat(this.tripData);

      // incase it already been displayed and new recording had made then delete this as prev... data on the map
      if (Markers.tripMkList.length > 0) {
        Markers.tripMkList.forEach((mk) => map.removeLayer(mk));
        Markers.layered = false;
      }
      len <= 25
        ? (dt = 500)
        : len > 25 && len <= 50
        ? (dt = 200)
        : len > 50
        ? (dt = 0)
        : 0;
      this.doLayout(dt);
    }
  },

  deleteData: function (self) {
    if (this.tripData.length > 0) {
      this.tripData.splice(0, this.tripData.length);
      this.copyTripData.splice(0, this.copyTripData.length);
      this.bbox.splice(0, this.bbox.length);
      if (self) {
        doLater(() => dom.tripInfoMsg("Trip bank deleted!"), 700);
      }
    }

    if (Markers.tripMkList.length > 0 && self) {
      Markers.tripMkList.forEach((mk) => map.removeLayer(mk));
      Markers.layered = false;
    }
  },

  doLayout: function (dt) {
    doLater(() => {
      this.setState("pos", "disabled");
      this.loopTimeId = setInterval(() => this.placeTheMarker(), dt);
    }, 1000);
  },

  json: function (data) {
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [data.coords.lat, data.coords.lng],
      },
      properties: { time: `${data.time}` },
    };
  },

  placeTheMarker: function () {
    let firstCoords = L.latLng(
      this.copyTripData[0].geometry.coordinates
    ).equals(this.bbox[0]);
    let lastCoords = L.latLng(this.copyTripData[0].geometry.coordinates).equals(
      this.bbox[this.bbox.length - 1]
    );
    try {
      L.geoJSON(this.copyTripData[0], {
        onEachFeature: Markers.showPopUp,
        pointToLayer: function (feature) {
          Markers.absoluteFit(
            feature.geometry.coordinates,
            feature.geometry.coordinates,
            {
              animate: true,
              duration: 4,
              easeLinearity: 0.7,
              maxZoom: map.getZoom(),
            }
          );
          this.tripMarker = firstCoords
            ? L.marker(feature.geometry.coordinates, {
                icon: Markers.remotePsBorderIcon,
              })
            : lastCoords
            ? L.marker(feature.geometry.coordinates, {
                icon: Markers.remotePsBorderIcon,
              })
            : L.marker(feature.geometry.coordinates, {
                icon: Markers.remotePsMidIcon,
              });
          Markers.tripMkList.push(this.tripMarker);
          this.tripMarker.on("dblclick", (e) =>
            map.removeLayer(this.tripMarker)
          );
          return this.tripMarker;
        },
      }).addTo(map);
      this.layered = true;
    } catch (err) {
      togglePrevBtn(); // setting panel
      dom.openToast("Something went wrong while set up and displaying");
    }
    this.copyTripData.shift();
    if (this.copyTripData.length === 0) {
      clearInterval(this.loopTimeId);
      if (this.layered)
        doLater(
          (e) => this.fitAfter(this.bbox[0], this.bbox[this.bbox.length - 1]),
          2000
        );
    }
  },

  showPopUp: function (feature, layer) {
    layer.bindPopup(Markers.makePopUp(feature));
  },

  makePopUp: function (obj) {
    let popContent = `
        <div class="popup-container">
          <div id="inner-popup-container">
            <div>
              <img src="${dom.userLogo.src}" alt="WebG" id="popupSenderImg">
              <h6 id="popup-sender">You</h6>
            </div>
            The time of your travel: ${obj.properties.time}
            <i id="moreInfo" onclick="tripPopMoreInfoRequest()">More...</i>
            <span id="popup-footer"></span>
          </div>
        </div>
        `;
    return L.popup({
      keepInView: true,
      closeButton: false,
      offset: L.point(-1, 1),
    }).setContent(popContent);
  },

  makePsPopUp: function (obj) {
    let data = obj.properties;
    new Image().src = `/image/${data.phoneNo}`;
    let popContent = `
      <div class="popup-container">
        <div id="inner-popup-container">
          <div class="_trip">
            <img src="/image/${data.phoneNo}" alt="WebG" class="_trip-img">
            <h6 class="tripUserName">${data.name}
            <i id="i0">Traveled on ${data.date}</i>
            <i id="i1">at time ${data.initTime}</i>
            <i id="moreInfo" onclick="tripPopMoreInfoRequest()">More...</i>
            </h6>
          </div>
          <span id="popup-footer"></span>
        </div>
      </div>
    `;
    return L.popup({
      keepInView: true,
      closeButton: false,
      offset: L.point(-1, 1),
    }).setContent(popContent);
  },

  absoluteFit: function (x, y, option) {
    map.fitBounds([L.latLng(x), L.latLng(y)], option);
  },

  fitAfter: function (x, y) {
    this.absoluteFit(x, y, {
      animate: true,
      duration: 2,
      easeLinearity: 0.5,
      padding: [400, 300],
      maxZoom: map.getZoom(),
    });
  },

  edges: {
    win_x: window.innerWidth,
    win_y: window.innerHeight,
    topMea: dom.defaultFrndToInteract ? 150 : 100,

    east: function (e) {
      if (this.win_x - e.originalEvent.layerX <= 40) return true;
    },
    north: function (e) {
      if (e.originalEvent.layerY <= this.topMea) return true;
    },
    west: function (e) {
      if (e.originalEvent.layerX <= 40) return true;
    },
    south: function (e) {
      if (this.win_y - e.originalEvent.layerY <= 75) return true;
    },
  },
};

function imageView(img) {
  if (img) {
    let div = dom.create("div");
    let span = dom.create("span");
    let imgTag = new Image();

    imgTag.src = img;
    dom.swapText(span, "\u2715");
    div.appendChild(imgTag);
    div.appendChild(span);

    span.onclick = function () {
      dom.select(".customImgView").remove();
      dom.fullViewImg = null;
    };
    div.className = "customImgView";

    dom.select(".primary-container").appendChild(div);
  }
}

function tripPopMoreInfoRequest() {
  say("I was pressed");
}

function mobilePos() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position, err) => {
      if (err) {
        dom.openToast("posErr: 404");
      } else {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        return coords;
      }
    });
  }
}

let lng = 9.8345;
let inc = 0.0001;
function ONE() {
  dom.addNewGuest("g01", { gName: "Annabi", imgUrl: "09012345678" });
  setInterval(() => {
    lng += inc;
    let data = { lat: `10.30381456`, lng: lng };

    if (Markers.g01Marker) map.removeLayer(Markers.g01Marker);

    Markers.g01Marker = L.marker(
      L.latLng(data.lat, data.lng),
      dom.defaultFrndToInteract === "g01"
        ? Markers.activeUserIcon
        : Markers.guestIcon
    );

    Markers.fit(data, "g01");
    Markers.g01Marker.addTo(map);
  }, 1000);
}
// ONE()
let lat = 10.30385;
function TWO() {
  dom.addNewGuest("g02", { gName: "Ahmadu", imgUrl: "09069964556" });
  setInterval(() => {
    lat += inc;
    let data = { lat: lat, lng: 9.8342898 };

    if (Markers.g02Marker) map.removeLayer(Markers.g02Marker);

    Markers.g02Marker = L.marker(
      L.latLng(data.lat, data.lng),
      dom.defaultFrndToInteract === "g02"
        ? Markers.activeUserIcon
        : Markers.guestIcon
    );

    Markers.fit(data, "g02");
    Markers.g02Marker.addTo(map);
  }, 1000);
}

function THREE() {
  dom.addNewGuest("g03", { gName: "Baye", imgUrl: "08012345678" });
  setInterval(() => {
    let data = {
      lat: `10.3018${(Math.random() * (11 - 10) + 10).toString().slice(12)}`,
      lng: 9.8333898,
    };

    if (Markers.g03Marker) map.removeLayer(Markers.g03Marker);

    Markers.g03Marker = L.marker(
      L.latLng(data.lat, data.lng),
      dom.defaultFrndToInteract === "g03"
        ? Markers.activeUserIcon
        : Markers.guestIcon
    );

    Markers.fit(data, "g03");
    Markers.g03Marker.addTo(map);
  }, 1000);
}
