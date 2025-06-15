// USE WSS://DOMAIN FOR PRODUCTION
// export const socket = io('http://192.168.43.94:3000');
export const socket = io("ws://localhost:3000", {
  autoConnect: false,
  transports: ["websocket"],
  reconnection: true,
  auth: {
    path: "/home",
    token: localStorage.getItem("gG_a"),
  }
});
const ss = window.ss;

// listen for the app to finished loading and then connect
dom.on("connect", () => socket.connect());

(function () {
  socket.on("grant-access", (msg) => {
    dom.setApp(msg, mapComp.get_content_updates);
  });

  // Content Updates
  socket.on("$updates", (msg) => {
    if (msg.trip) dom.keepTripData(msg.trip);
    if (msg.clw) dom.add_CW_Col({ clw: msg.clw });
  });

  // ======================== Route One =============================
  socket.on("G01-img", (data) => {
    if (data.ids && !dom.getVal("g01")) {
      addConnectedFriendToRoute(1, data.ids[1]);
      dom.addNewGuest("g01", data);

      // get the previous chats of first connected friend
      dom.emit("getPrevChats", { self: dom.myId, remote: data.ids[1] });
    }
  });

  socket.on("G01-cords", async (data) => {
    if (data.lat && data.lng) {
      if (Markers.g01Marker) map.removeLayer(Markers.g01Marker);
      try {
        Markers.g01Marker = await new L.marker(
          L.latLng(data.lat, data.lng),
          dom.defaultFrndToInteract === "g01"
            ? Markers.activeUserIcon
            : Markers.guestIcon
        );

        Markers.fit(data, "g01");
        Markers.g01Marker.addTo(map);
      } catch (error) {
        return false;
      }
    }

    if (dom.defaultFrndToInteract === "g01") {
      dom.renderMyLocation(data);
    }
  });

  // ======================== Route Two =============================
  socket.on("G02-img", (data) => {
    if (data.ids && !dom.getVal("g02")) {
      addConnectedFriendToRoute(2, data.imgUrl);
      dom.addNewGuest("g02", data);
    }
  });

  socket.on("G02-cords", async (data) => {
    if (data.lat && data.lng) {
      if (Markers.g02Marker) map.removeLayer(Markers.g02Marker);
      try {
        Markers.g02Marker = L.marker(
          L.latLng(data.lat, data.lng),
          dom.defaultFrndToInteract === "g02"
            ? Markers.activeUserIcon
            : Markers.guestIcon
        );

        Markers.fit(data, "g02");
        Markers.g02Marker.addTo(map);
      } catch (error) {
        return false;
      }
    }

    if (dom.defaultFrndToInteract === "g02") {
      dom.renderMyLocation(data);
    }
  });

  // ======================== Route Three =============================
  socket.on("G03-img", (data) => {
    if (data.ids && !dom.getVal("g03")) {
      addConnectedFriendToRoute(3, data.imgUrl);
      dom.addNewGuest("g03", data);
    }
  });

  socket.on("G03-cords", async (data) => {
    if (data.lat && data.lng) {
      if (Markers.g03Marker) map.removeLayer(Markers.g03Marker);
      try {
        Markers.g03Marker = L.marker(
          L.latLng(data.lat, data.lng),
          dom.defaultFrndToInteract === "g03"
            ? Markers.activeUserIcon
            : Markers.guestIcon
        );

        Markers.fit(data, "g03");
        Markers.g03Marker.addTo(map);
      } catch (error) {
        return false;
      }
    }

    if (dom.defaultFrndToInteract === "g03") {
      dom.renderMyLocation(data);
    }
  });

  socket.on("warning", (msg) => {
    let txt = msg;
    if (msg.id) {
      txt = `Request aborted`;
      dom.removeReqSpinner(msg.id);
    }
    dom.openToast(txt);
  });

  // DISCONNECTION
  socket.on("disconnect_res", (dis) => {
    if (dis.req) {
      dom.mp.forEach((v, k) => {
        if (v.gNo === dis.req) {
          const x_user = dom.getById(k);

          if (x_user && dom.guestIcon.hasChildNodes(x_user)) {
            dom.guestIcon.removeChild(x_user);
            dom.openToast(`${v.gName} disconnected`);
            dom.setVal("x_route", k);
            dom.remote_disconnection(k);
          }
        }
      });

    } else if (dis.res) {
      doLater(() => dom.local_disconnection(), 1000);
    }
  });

  // Sender To Receiver
  socket.on("local-G", (msg) => {
    const { r_c_id, r_r, det } = msg;
    if (msg.r_r === 0) {
      if (!msg.header) {
        sendProfileImage("remote-G", r_c_id, r_r, det);
        // if (msg.mode !== "0CG") sendCoords('remote-G', msg.r_id, msg.r_r);
        if (msg.mode !== "0CG")
          setInterval(() => sender("remote-G", r_c_id, r_r), 1000);
      } else {
        return; //disconnect
      }
    } else if (msg.r_r === 1) {
      if (!msg.header) {
        sendProfileImage("remote-G", r_c_id, r_r, det);
        if (msg.mode !== "0CG") sendCoords("remote-G", r_c_id, r_r);
      } else {
        return; //disconnect
      }
    } else if (msg.r_r === 2) {
      if (!msg.header) {
        sendProfileImage("remote-G", r_c_id, r_r, det);
        if (msg.mode !== "0CG") sendCoords("remote-G", r_c_id, r_r);
      } else {
        return; //disconnect
      }
    }
  });

  // Receiver To Sender
  socket.on("remote-G", (msg) => {
    const { s_c_id, s_r, det } = msg;
    if (msg.s_r === 0) {
      if (!msg.header) {
        sendProfileImage("local-G", s_c_id, s_r, det);
        // if (msg.mode !== "0CG") sendCoords('local-G', msg.s_c_id, msg.s_r);
        if (msg.mode !== "0CG")
          setInterval(() => receiver("local-G", s_c_id, s_r), 1000);
      } else {
        return; //disconnect
      }
    } else if (msg.s_r === 1) {
      if (!msg.header) {
        sendProfileImage("local-G", s_c_id, s_r, det);
        if (msg.mode !== "0CG") sendCoords("local-G", s_c_id, s_r);
      } else {
        return; //disconnect
      }
    } else if (msg.s_r === 2) {
      if (!msg.header) {
        sendProfileImage("local-G", s_c_id, s_r, det);
        if (msg.mode !== "0CG") sendCoords("local-G", s_c_id, s_r);
      } else {
        return; //disconnect
      }
    }
  });

  socket.on("ps-remote-trip", (data) => dom.keepRemoteTripData(data));

  socket.on("$ps-req", (req) =>
    dom.setVal("ps-req", { route: req.req_route, req_id: req.req_id })
  );

  socket.on("map-$illus", (d) => {
    Markers.doIllustration(d, true);
    Markers.removeDragHandle();
  });

  socket.on("map-$ind", async (d) => {
    if (!Markers.s_id || d.s_id === Markers.s_id.val.gNo) {
      // Markers.clearLines(); // if illus is doing
      if (!isNaN(d.index)) {
        if (Markers.remoteMkList[d.index]) {
          if (d.text || d.img || d.imgUrl || d.type === "drag") {
            map.removeLayer(Markers.remoteMkList[d.index]);
            Markers.remoteMkList[d.index] = await new L.marker(
              d.latlng
            ).bindPopup(
              await mapComp.customIconPop(
                Markers.s_id.val.imgUrl,
                Markers.s_id.val.gName,
                dom.getVal(d.index)?.[0],
                dom.getVal(d.index)?.[1]
              )
            );
          } else {
            map.removeLayer(Markers.remoteMkList[d.index]);
            Markers.remoteMkList[d.index] = await new L.marker(
              d.latlng
            ).bindPopup(await mapComp.receiverSidePopUp());
          }

          Markers.remoteMkList[d.index].addTo(map);
          Markers.focusOnMe(d, true);
        }
      } else if (d.delMarkerIndex) {
        d.delMarkerIndex === "$0"
          ? Markers.deleteAllMarkers(Markers.remoteMkList)
          : Markers.deleteOneMarker(Markers.remoteMkList);
      } else {
        mapComp.addRemoteMarker(d, true);
        dom.makeSound("s_03", 0.7);
      }
    } else if (isNaN(d.index)) {
      let newData = await mapComp.getRemoteId(d.s_id);
      socket.emit("$indWarn", {
        r_id: newData.val.id,
        msg: `Icon not send or ${newData.val.gName} is busy.`,
      });
    }
  });

  function sendCoords(eventL, id, route) {
    socket.emit(eventL, {
      id: id,
      route: route,
      data: {
        locationName: "Bauchi",
        Accuracy: 1,
        lat: 10.30354,
        lng: 9.832508,
      },
    });
  }

  function addConnectedFriendToRoute(route, id) {
    socket.emit("addToRoute", { route: route, id: id });
    dom.removeReqSpinner(id);
  }

  socket.on("connect_error", (err) => {
    // window.location.href = '/Logs';
  });

})();

function sendProfileImage(eventL, id, route, data) {
  socket.emit(eventL, {
    id: id,
    route: route,
    data: data,
  });
}

var x0x = [
  "saye",
  "misau",
  "sade",
  "rimi",
  "feggi",
  "fada",
  "azare",
  "yarwa",
  "guru",
  "kano",
  "makka",
  "madina",
];
function sender(eventL, id, route) {
  socket.emit(eventL, {
    id: id,
    route: route,
    data: {
      locationName: x0x[Math.floor(Math.random() * x0x.length)],
      Accuracy: Math.floor(Math.random() * 18),
      lat: `10.3033${(Math.random() * (11 - 10) + 10).toString().slice(12)}`,
      lng: "9.83250898",
    },
  });
}

function receiver(eventL, id, route) {
  socket.emit(eventL, {
    id: id,
    route: route,
    data: {
      locationName: x0x[Math.floor(Math.random() * x0x.length)],
      Accuracy: Math.floor(Math.random() * 18),
      lat: `10.3035467845`,
      lng: `9.8323${(Math.random() * (11 - 10) + 9).toString().slice(12)}`,
    },
  });
}

// Map Interaction
map.on("click", async (e) => {
  if (dom.action === "$ind") {
    if (Markers.localMkList.length < 9) {
      if (dom.actBtn === "$ind-ics") await mapComp.addLocalMarker(e);
      if (dom.actBtn === "$ind-ctm") await mapComp.addLocalCustomMarker(e);
    } else {
      map.removeLayer(Markers.localIndicatorMarker);
      Markers.localMkList.pop();
      if (dom.actBtn === "$ind-ics") await mapComp.addLocalMarker(e);
      if (dom.actBtn === "$ind-ctm") await mapComp.addLocalCustomMarker(e);
    }
  } else if (dom.action === "$illus") {
    if (dom.isMobile) {
      if (dom.actBtn === "$illus-s01") {
        Markers.showDragHandle(e);
      } else if (dom.actBtn === "$illus-b01") {
        mapComp.showDragHandleAndSend(e);
      }
    } else {
      // Pause the mousemove event and continue after click
      if (!dom.getVal(dom.action)) {
        dom.setVal(dom.action);
      } else {
        dom.deleteVal(dom.action);
      }
    }
  }
});

/*
map.on("mousemove", async (e) => {
  if (dom.getVal(dom.action)) {
    if (dom.actBtn === "$illus-s01") {
      Markers.doIllustration(e);
      
    } else if (dom.actBtn === "$illus-b01") {
      Markers.doIllustration(e);
      mapComp.sendIllustration(e);
    }
  } else {
    Markers.clearLines();
  }
});
**/

const mapComp = {
  get_content_updates: function (event, msg) {
    socket.emit(event || "update", msg || { update: true });
  },

  sendPs_Req: function (data) {
    let v = dom.getVal("ps-req");
    if (!Markers.ps_profile_send)
      sendProfileImage("ps-req", null, "CGp", v.req_id, v.route, dom, dom.myId);
    Markers.ps_profile_send = true;

    socket.emit("ps-req", {
      id: v.req_id,
      route: v.route,
      data: { lat: data.lat, lng: data.lng },
    });
  },

  addLocalMarker: async function (e) {
    Markers.localIndicatorMarker = await new L.marker(e.latlng, {
      draggable: true,
      index: Markers.localMkList.length,
    })
      .on("click", (e) => Markers.localIndicatorMarker.closePopup())
      .on("dragstart", (e) => Markers.pauseAutoMove())
      .on("drag", (drag) => mapComp.sendMarkerToRemote(drag));

    Markers.localMkList.push(Markers.localIndicatorMarker);
    Markers.localIndicatorMarker.addTo(map);
    mapComp.sendMarkerToRemote(e);
  },

  addLocalCustomMarker: async function (e) {
    if (dom.getVal("customIconText") || dom.getVal("customImg")) {
      Markers.localIndicatorMarker = await new L.marker(e.latlng, {
        draggable: true,
        index: Markers.localMkList.length,
        custom: true,
      })
        .bindPopup(
          await mapComp.customIconPop(
            dom.userLogo.src,
            "You",
            dom.getVal("customIconText"),
            dom.getVal("customImg") ? dom.newImg.src : ""
          )
        )
        .on("drag", (drag) => mapComp.sendMarkerToRemote(drag));

      Markers.localMkList.push(Markers.localIndicatorMarker);
      Markers.localIndicatorMarker.addTo(map);
      mapComp.sendCustomIconImage(e); // send to remote friend
    }
  },

  remoteIcon: async function (e, r) {
    if (!Markers.s_id) await mapComp.matchRemoteId(e.s_id);
    if (e.text || e.img || e.imgUrl) {
      if (e.img) {
        e.img = new Blob([e.img]);
        e.img = URL.createObjectURL(e.img);
      }

      Markers.remoteIndicatorMarker = await new L.marker(e.latlng).bindPopup(
        await mapComp.customIconPop(
          Markers.s_id.val.imgUrl,
          Markers.s_id.val.gName,
          e.text,
          e.img || e.imgUrl
        )
      );

      dom.mp.set(Markers.remoteMkList.length, [e.text, e.img || e.imgUrl]);
    } else {
      Markers.remoteIndicatorMarker = await new L.marker(e.latlng).bindPopup(
        await mapComp.receiverSidePopUp()
      );
    }

    Markers.remoteMkList.push(Markers.remoteIndicatorMarker);
    Markers.remoteIndicatorMarker.addTo(map);
    Markers.focusOnMe(e, r);
  },

  addRemoteMarker: function (e, r) {
    if (Markers.remoteMkList.length < 9) {
      mapComp.remoteIcon(e, r);
    } else {
      if (Markers.remoteIndicatorMarker)
        map.removeLayer(Markers.remoteIndicatorMarker);
      Markers.remoteMkList.pop();
      mapComp.remoteIcon(e, r);
    }
  },

  sendMarkerToRemote: function (e, img, text) {
    Markers.bbox.push(e.latlng);
    if (dom.defaultFrndToInteract)
      socket.emit("mapClick", {
        type: e.type,
        r_id: dom.getVal(dom.defaultFrndToInteract).id,
        index: e.target.options.index,
        img: img,
        text: text,
        latlng: L.latLng(e.latlng),
      });
    Markers.focusOnMe(e);
  },

  sendDelMarker: function () {
    if (dom.defaultFrndToInteract)
      socket.emit("mapClick", {
        r_id: dom.mp.get(dom.defaultFrndToInteract).id,
        delMarkerIndex: Markers.delMarkerIndex,
      });
    Markers.delMarkerIndex = null;
  },

  sendCustomIconImage: function (coords) {
    if (dom.defaultFrndToInteract) {
      const img = dom.getVal("customImg");
      const txt = dom.getVal("customIconText");

      if (img) {
        if (img.size > dom.imgMaxPayLoad) {
          try {
            const stream = ss.createStream();

            ss(socket).emit("image-stream", stream, {
              r_id: dom.getVal(dom.defaultFrndToInteract).id,
              index: coords.target.options.index,
              name: img.name,
              text: txt,
              latlng: L.latLng(coords.latlng),
            });

            ss.createBlobReadStream(img).pipe(stream);
          } catch (err) {
            dom.logError("g03.comp.sk.js", 468, err);
          }
        } else {
          try {
            const reader = new FileReader();
            reader.onload = function (f) {
              mapComp.sendMarkerToRemote(coords, f.target.result, txt);
            };

            reader.readAsArrayBuffer(img);
          } catch (err) {
            dom.logError("g03.comp.sk.js", 489, err);
          }
        }
      } else {
        mapComp.sendMarkerToRemote(coords, null, txt);
      }
    }
  },

  customIconPop: async function (senderImg, senderName, textMsg, image) {
    let popContent = `
        <div class="popup-container">
          <div id="inner-popup-container">
            <div>
              <img src="${senderImg}" alt="WebG" id="popupSenderImg">
              <h6 id="popup-sender">${senderName}</h6>
            </div>
            ${textMsg ? `<p>${textMsg}</p>` : ""}
            ${
              image
                ? `<img src="${image}" alt="WebG" class="pop-send-img" onclick="customImgFullView(this)">`
                : ""
            }
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

  receiverSidePopUp: async function () {
    let popContent = `
      <div class="popup-container">
        <div id="inner-popup-container">
          <div class="receiverSidePopUp">
            <img src="${
              Markers.s_id.val.imgUrl
            }" alt="WebG" class="receiverSideSenderImg">
            <h6 class="receiverSideSenderName">${Markers.s_id.val.gName}
            <i>${dom.cht_time()}</i>
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

  matchRemoteId: async function (id) {
    Markers.s_id = await this.getRemoteId(id);
  },

  getRemoteId: async function (id) {
    let _val;
    dom.mp.forEach((v, k) => {
      if (v.gNo === id) _val = { key: k, val: v };
    });
    return _val;
  },

  showDragHandleAndSend: async function (e) {
    if (dom.isMobile) {
      Markers.clearLines();
      if (Markers.touchMarker) map.removeLayer(Markers.touchMarker);

      Markers.touchMarker = await new L.marker(e ? e.latlng : map.getCenter(), {
        draggable: true,
        icon: Markers.touchIcon,
      }).on("drag", (drag) => {
        Markers.doIllustration(drag);
        mapComp.sendIllustration(drag);
      });

      Markers.touchMarker.addTo(map);
    }
  },

  removeDragHandle: function () {
    if (Markers.touchMarker) map.removeLayer(Markers.touchMarker);
  },

  sendIllustration: function (e) {
    socket.emit("mapClick", {
      type: dom.action,
      r_id: dom.mp.get(dom.defaultFrndToInteract).id,
      latlng: L.latLng(e.latlng),
    });
  },
};

//  Trip Recording
const Recording = {
  feet: [],
  sumFeet: [],
  initial: true,
  meters: 25,
  lastCoordsRef: null,

  computeCoords: function () {
    this.feet.push(L.latLng(Markers.localCoords));
    // Last coords
    doLater(() => {
      if (dom.rec_save && !this.lastCoordsRef) {
        this.lastCoordsRef = Markers.localCoords;
        this.sumFeet.push({
          time: dom.cht_time("s"),
          coords: this.lastCoordsRef,
        });
        this.sendFeet();
        doLater(() => (this.lastCoordsRef = null), 500);
      }
    }, 1000);

    if (this.feet.length >= 7) {
      this.lastIndex = this.feet.length - 1;
      this.firstCoords = this.feet[0];
      this.lastCoords = this.feet[this.lastIndex];
      this.distance = this.firstCoords.distanceTo(this.lastCoords);

      if (this.distance >= this.meters) {
        this.sumFeet.push({ time: dom.cht_time("s"), coords: this.lastCoords });
        this.feet.splice(0, this.feet.length);
      }
    }
    if (this.initial) {
      this.sumFeet.push({
        time: dom.cht_time("s"),
        coords: Markers.localCoords,
      });
      this.initial = false;
    }
  },

  startRecording: function () {
    if (dom.mp.get("recOn")) {
      if (!dom.routeId()) this.stopRec();
      doLater(() => this.countRecDuration(), 1000);
      this.computeCoords();
    }
  },

  countRecDuration: function () {
    dom.rec_counter--;
    this.minutes = Math.floor(dom.rec_counter / 60);
    this.seconds = dom.rec_counter % 60;

    if (this.minutes > -1) {
      dom.swapText(
        dom.recCounter,
        `${this.minutes > 9 ? this.minutes : "0" + this.minutes}:
        ${this.seconds > 9 ? this.seconds : "0" + this.seconds}`
      );
    }

    if (this.minutes === 0 && this.seconds === 0) {
      doSaveRec();
      dom.swapText(dom.recCounter, "00:00");
    }
  },

  sendFeet: function () {
    if (this.sumFeet.length > 2) {
      say(this.sumFeet)
      socket.emit("tripRecording", { eventDate: dom.date, data: this.sumFeet });

      // delete the old for the new coming one data
      if (Markers.tripData.length > 0) Markers.deleteData();
      dom.tripInfoMsg("Please wait processing ...", true);
      doLater(() => mapComp.get_content_updates(null, { trip: true }), 7000);
      Markers.layered = false;
    }
    this.feet.splice(0, this.feet.length);
    this.sumFeet.splice(0, this.sumFeet.length);
    this.initial = true;

    // In case recording started and not leave it to calc enough coords
    // So it would'nt send and store coords as a new rec
    // Then restore the previous note and data
    doLater(() => {
      if (dom.tripInfo.innerHTML.includes("started")) {
        let prev_note = dom.getVal("prev_note");
        dom.tripInfoMsg(
          prev_note,
          prev_note.startsWith("Empty") ? true : false
        );
      }
    }, 300);
  },

  stopRec: function () {
    dom.openToast(
      "RecordMe is recommended on 0, 1, or 2 connected friends.",
      20000
    );
    dom.mp.set("recOn", false);
  },
};

// Listeners  =========================================
dom.listen(dom.displayRec, () => {
  dom.doToggle(dom.recordMe, "show-btns");
  dom.doToggle(dom.displayRec, "minimize");
});

dom.listen(dom.pauseRec, () => {
  if (!dom.rec_save) {
    dom.doToggle(dom.pauseRec, "bx-play");
    dom.doToggle(dom.pauseRec, "bx-pause");

    if (dom.pauseRec.classList[1] === "bx-pause") {
      dom.mp.set("recOn", false); // make recording to pause here
    } else {
      dom.setVal("recOn", true); // continue
    }
  }
});

dom.listen(dom.saveRecBtn, () => {
  if (!dom.getVal("recOn") && !dom.rec_save) Recording.sendFeet(); // in case rec had paused
  doSaveRec();
});

function doSaveRec() {
  dom.mp.set("recOn", false);
  dom.rec_save = true;
  doLater(() => {
    dom.saveRecBtn.classList.add("saved");
    dom.pauseRec.classList.remove("bx-pause");
    dom.pauseRec.classList.add("bx-play");
  }, 500);
}

dom.listen(dom.deleteRec, () => dom.displayRecordingPanel());

// Deleting markers
dom.listen(dom.delOne, () => {
  Markers.deleteOneMarker(Markers.localMkList, true);
  if (Markers.delMarkerIndex) mapComp.sendDelMarker();
});

dom.listen(dom.delAll, () => {
  Markers.deleteAllMarkers(Markers.localMkList, true);
  if (Markers.delMarkerIndex) mapComp.sendDelMarker();
});

dom.listen(dom.getById("$b01"), () => {
  doLater(() => dom.openToast("On process!"), 500);
});

dom.listen(dom.getById("deleteTrip"), () => {
  if (Markers.tripData.length > 0 && dom.tripInfo.classList[1]) {
    Markers.deleteData(true);
    mapComp.get_content_updates("deleteTrip", true);
  }
});

() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(position); // Log the position object
        const coords = {
          from: "navigator.geolocation",
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        console.log(coords); // Log the coords object
        socket.emit("pwd-check", coords);
      },
      (error) => {
        console.error(error.message); // Log the error
        // dom.openToast(error.message);
      }
    );
  }
};

dom.listen(dom.disconnectBtn, () => {
  const x_id = dom.getVal(dom.defaultFrndToInteract).id;

  if (x_id && !dom.loader.classList[1] && dom.countConnectedFriends(true).len) {
    socket.emit("req_disconnection", {
      sender_id: dom.myId,
      disconnect_id: x_id,
    });

    dom.loader.classList.add("start");
  }
});

// ============================================
let myPos;
let lng = 9.83459;
let inc = 0.00001;
(function () {
  setInterval(() => {
    lng += inc;
    Markers.localCoords = { lat: `10.30381456`, lng: lng };

    //  On Ps Number connection
    if (dom.getVal("ps-req")) mapComp.sendPs_Req(Markers.localCoords);

    if (dom.registeredUser()) {
      Recording.startRecording(); // Trip Recording

      if (myPos) map.removeLayer(myPos);
      if (Markers.myPosEnabled()) {
        myPos = L.marker(L.latLng(Markers.localCoords), {
          icon: Markers.localUserIcon,
        });
        myPos.addTo(map);

        if (Markers.autoMove || Markers.localSnap) {
          if (!Markers.remoteCoords) {
            if (Markers.localSnap) {
              map.flyTo(
                L.latLng(Markers.localCoords, Markers.localCoords),
                map.options.flyZoom
              );

              if (Math.round(map.getZoom()) === map.options.flyZoom) {
                doLater(() => {
                  Markers.localSnap = false;
                  Markers.autoMove = true;
                }, 100);
              }
            } else if (Markers.checkState("automate")) {
              map.fitBounds([Markers.localCoords, Markers.localCoords], {
                animate: true,
                duration: 3,
                easeLinearity: 0.7,
                paddingTopLeft: [0, 100],
                paddingBottomRight: [0, 0],
                maxZoom: Markers.localSnap
                  ? map.options.maxZoom
                  : map.getZoom(),
              });
            }
          } else if (Markers.remoteCoords) {
            map.fitBounds([Markers.localCoords, Markers.remoteCoords], {
              animate: true,
              duration: 3,
              easeLinearity: 0.7,
              padding: [50, 50],
              maxZoom: map.getZoom(),
            });
            Markers.remoteCoords = null;
          }
        }
      }
    }
  }, 1000);
})();

window.onbeforeunload = function (e) {
  if (dom.mp.get("recOn") && Recording.sumFeet.length > 2) Recording.sendFeet();
};
