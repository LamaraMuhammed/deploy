class DOM extends _DOM {
  constructor() {
    super();
    this.defaultFrndToInteract = null;
    this.myId = null;
    this.toastDelayId = null;
    this.message = null;
    this.prev_src = null;
    this.prev_quick_panel_btn = null;
    this.toggleAll = null;
    this.controlKey = null;
    this.action = null;
    this.actBtn = null;
    this.fullViewImg = null;
    this.rec_save = false;

    this.requestQue = new Map();
    this.formData = new FormData();
    this.fileReader = new FileReader();
    this.date = new Date().toDateString();
    this.space = /\s{1,}/g; //<< just look for a white space index.
    this.imgMaxPayLoad = 2 * 1024 * 1024; // 2MB
    this.DAY_IN_MS = 24 * 60 * 60 * 1000; // 86400000 ms

    this.userLogo = this.getById("user-logo");
    this.audio = this.getById("audio");
    this.tripInfo = this.select(".trip-info");
    this.tripButtons = this.select(".trip-btn");
    this.delOne = this.getById("delOne");
    this.delAll = this.getById("delAll");

    this.recordMe = this.select(".record-me"); // Rec
    this.displayRec = this.getById("displayRec");
    this.saveRecBtn = this.select(".saveRec");
    this.pauseRec = this.select(".pauseRec");
    this.deleteRec = this.select(".deleteRec");
    this.recCounter = this.select(".rec-counter");
    this.initialRecDuration = 3600 / 4; // time interval for rec duration in secs (i.e 15m)
    this.rec_counter = this.initialRecDuration;

    this.requestCounter = 0;
    this.requestIconList = this.select(".guest-icon-onListeningRes");
    this.loader = this.select(".loader-fr");
    this.toast_div = this.select(".toast");

    // CHAT
    this.navBtns = document.querySelectorAll(".btn-div");
    this.homePage = this.select(".home-container");
    this.chatPage = this.select(".chat");
    this.friendBox = this.select(".friends");
    this.remoteIcon = this.getById("remote-icon");
    this.radio = this.getById("radio");
    this.chatNote = this.getById("note");
    this.scroller = this.select(".scroller");
    this.chatInput = this.getById("chat-input");
    this.sendButton = this.getById("send-icon");
    this.guestIcon = this.select(".guest-icon-list");
    this.room = this.select(".room"); // Panel Of friends Been Connected

    // Mid Pop of Icon Customization...
    this.midPop = this.select(".midPop");
    this.customIndImgFolder = this.select(".custom-img");
    this.newImg = this.create("img");
    this.customTextArea = this.getById("custom-text");
    this.customImgUploaderFolder = this.select(".custom-img-folder");
    this.customImgUploader = this.getById("custom-icon-file");
    this.customImgDeleteBtn = this.getById("custom-img-del");
    this.customIconSaveBtn = this.getById("custom-icon-save");
    this.customIconEditBtn = this.getById("custom-icon-edit");

    // BottomSheet
    this.BottomSheet = this.select(".bottom-sheet");
    this.BottomSheetDiv = this.select(".share-loc-div");
    this.bottomSheetDoor = this.select(".bottom-sheet-door");
    this.inputField = this.getById("input-field");
    this.shareInputHint = this.getById("shr-loc-hint");
    this.shareBtn = this.getById("share");
    this.noShare = this.getById("noShare");
    this.share_loc = this.select(".share-loc");
    this.shareLocInfo = this.getById("share-loc-info");
    this.optionBtn = this.getById("optionBtn");

    // quick panel
    this.quickPanelImg = this.getById("quick-panel-img");
    this.quickPanelName = this.getById("quick-panel-name");
    this.quickInfo = this.select(".quick-info");
    this.location = this.getById("loc");
    this.distance = this.getById("dis");
    this.accuracy = this.getById("acc");
    this.disconnectBtn = this.select(".disconnect");
    this.voice = this.select(".voice");

    this.miniBoard = this.select(".mini-board");
    this.requestPanel = this.select(".requestPanel");
    this.acceptCall = this.select(".acceptCall");
    this.rejectCall = this.select(".rejectCall");
    this.requesterImg = this.select(".requesterImg");
    this.rName = this.select(".r-nm");
    this.rNote = this.select(".r-nt");

    // Close Watch
    this.settingContent = this.select(".setting-content");
    this.closeWatch = this.select(".close-watch");
    this.td = this.select(".td");
    this.pwdMask = this.select(".mask");
    this.pwdNotice = this.select(".pwd-notice");
    this.innerNotice = this.select(".inner");
    this.addCloseWatchInput = this.getById("close-watch-input");
    this.addCloseWatchBtn = this.select(".add-clw");
    this.pwdInput = this.getById("pwd-input");
    this.enterPwdBtn = this.select(".enter-pwd");
    this.menu_title = this.getById("menu-title");
    this.pwd_on_off();

    // Notification
    this.notification_page = this.select(".notification");
    this.nt_nav = this.getById("nt-nav");
    this.ntContainer = this.select(".nt-container");
    this.ntMore = this.select(".nt-more");
    this.ntCont = this.select(".nt-cont");
    this.req_back = this.select(".req-by-nt");
    this.del_nt = this.select(".del-nt");
  }

  removeToggle(btns) {
    btns.forEach((btn) => {
      if (btn.classList[1]) {
        this.doToggle(btn, "selected");
      }
    });
  }

  registeredUser() {
    return this.myId ? true : false;
  }

  // User preferences and default preferences
  setUserId(data) {
    if (data) {
      this.myId = data.phoneNo;
      this.swapText(this.getById("username"), data.username);
      this.swapText(this.getById("sim"), this.myId);
      this.swapText(this.getById("log"), "Logout");
      this.set_profileImg("/image/" + data.prof_img);

      let pos = this.getById("pos");
      let sound = this.getById("sound");
      let automate = this.getById("automate");

      // for first time logged user
      if (Markers.isDefault("pos")) {
        this.addCls(pos, "selected");
        this.addCls(sound, "on");
        this.addCls(automate, "automated");

        Markers.setState("pos");
        Markers.setState("sound");
        Markers.setState("automate");
        return;
      }

      if (Markers.checkState("pos")) {
        this.addCls(pos, "selected");
      }

      if (Markers.checkState("sound")) {
        this.addCls(sound, "on");
      }

      if (Markers.checkState("automate")) {
        this.addCls(automate, "automated");
      }
    }
  }

  set_profileImg(src) {
    this.userLogo.src = this.getById("profile-img").src = src;
  }

  setApp(data, cb) {
    this.setUserId(data);
    if (cb) doLater(() => cb(), 2000);
  }

  // Switching from home page to chat page and others
  switchTo(page) {
    this.closeMidPop();
    this.recordClicks(page);
    this.doToggle(this.homePage, "current-page");

    if (page === "notification_page" || page === "home_page") {
      this.doToggle(this.notification_page, "current-page");
    } else {
      this.doToggle(this.chatPage, "current-page");
      this.removeToggle(this.navBtns);
    }
  }

  openToast(txt) {
    let toast = this.create("div");

    this.swapText(toast, txt);
    this.listen(toast, () => {
      toast.remove();
      this.recordClicks("toast");
    });

    setTimeout(() => this.addCls(toast, "warn"), 200);
    setTimeout(() => toast.remove(), 20000);
    this.toast_div.appendChild(toast);
  }

  openBottomSheet(quickPanel) {
    if (quickPanel) {
      if (this.BottomSheet.classList[1]) {
        this.bottomSheetDoor.classList.toggle("close");
      } else if (!this.BottomSheet.classList[1]) {
        this.bottomSheetDoor.classList.remove("close");
      }

      this.BottomSheet.classList.add("quick-panel");
      if (!this.prev_quick_panel_btn) {
        this.quickPanelFriendInfo(
          this.getById(this.defaultFrndToInteract),
          this.getVal(this.defaultFrndToInteract)?.gName
        );
      }
    }

    this.closeMidPop(); // incase already opened
    if (!quickPanel) {
      this.BottomSheet.classList.remove("quick-panel");
      this.isMobile
        ? this.bottomSheetDoor.classList.remove("close")
        : this.doToggle(this.bottomSheetDoor, "close");
    }
  }

  closeBottomSheet() {
    this.bottomSheetDoor.classList.add("close");
    panelOpener.classList.remove("bx-upvote");
  }

  openMidPop() {
    this.doToggle(this.midPop, "show");
  }

  closeMidPop() {
    this.midPop.classList.remove("show");
  }

  openMiniBoard(ques) {
    if (ques) {
      this.swapText(this.getById("mini-board-info"), ques);
      this.addCls(this.miniBoard, "logout");
      this.addCls(this.miniBoard, "quest");
    } else {
      this.swapText(
        this.getById("mini-board-info"),
        "Dou you sure you want to logout from WebG ?"
      );
      this.doToggle(this.miniBoard, "logout");
    }
  }

  shareLocErr(hint) {
    this.inputField.style.border = "";
    this.swapText(this.shareInputHint, hint);
    if (hint) this.inputField.style.border = "2px solid red";
  }

  selectFriendToChat(button, chatIds) {
    if (this.toggleAll || button === "All") {
    }

    document.querySelectorAll(".friend").forEach((btn) => {
      if (button === "all") {
        this.doToggle(btn, "all");
      } else if (btn.contains(button)) {
        this.remoteIcon.src = btn.firstChild.src;

        !button.classList[2] ? this.addCls(button, "selected") : "";
        this.defaultFrndToInteract = button.id;
        this.emit("getPrevChats", chatIds);
      } else {
        this.rmCls(btn, "selected");
      }
    });
  }

  routeId() {
    if (!this.mp.get("g01")) {
      return "0"; // 0 is meant to be false
    } else if (!this.mp.get("g02")) {
      return 1;
    } else if (!this.mp.get("g03")) {
      return 2;
    } else {
      return false; //  i.e blocked
    }
  }

  connectionMode(r) {
    if (r && this.getVal(r).mode === "1CG") return true; // i.e on share location otherwise on no share location
  }

  reqSpinner(id, callback) {
    if (!this.getById(id)) {
      if (this.requestIconList.childElementCount <= 2) {
        (this.li = this.create("li")),
          (this.div = this.create("div")),
          (this.span = this.create("span"));
        this.div.classList.add("onListeningRes");
        doLater(() => this.div.classList.add("timeout"), 92000);
      }

      this.requestCounter += 1;
      if (this.requestCounter <= 3) this.li.id = id;
      this.swapText(this.span, this.requestCounter);
      this.div.appendChild(this.span);
      this.li.appendChild(this.div);
      this.requestIconList.appendChild(this.li);

      // AUTOMATICALLY REMOVED AT 1:35 TIMEOUT
      doLater(() => {
        this.removeReqSpinner(id);
        return callback();
      }, 95000);
    }
  }

  removeReqSpinner(id) {
    if (this.requestIconList.childElementCount) {
      if (this.requestCounter >= 1) this.requestCounter -= 1;
      this.requestIconList.removeChild(this.getById(id));
    }
  }

  addNewGuest(id, data) {
    if (this.countConnectedFriends() && this.countConnectedFriends().len <= 2) {
      let li = this.create("li"),
        img = this.create("img");
      li.id = id;
      img.src = "/image/" + data.ids[1];
      li.appendChild(img);
      this.guestIcon.appendChild(li);

      this.listen(li, () => this.quickPanelFriendInfo(li, data.gName));
      this.addFriendToChatRoom(id, data.gName, img.src);
      this.setVal(id, {
        id: data.ids[0],
        mode: data.mode,
        gName: data.gName,
        gNo: data.ids[1],
        imgUrl: img.src,
      });

      if (
        this.countConnectedFriends() &&
        this.countConnectedFriends().len === 1
      ) {
        li.classList.add("active");
        this.defaultFrndToInteract = id;
      }
    }
  }

  addFriendToChatRoom(id, nm, img) {
    let div = this.create("div");
    let image = this.create("img");
    let p = this.create("p");
    let check = this.create("img");

    this.addCls(div, "flex");
    this.addCls(div, "friend");

    this.swapText(p, nm);
    image.src = img;
    check.src = "/icons/okay.svg";

    if (id === "g01") {
      this.addCls(div, "selected");
      this.remoteIcon.src = image.src;
    }

    this.listen(div, () =>
      this.selectFriendToChat(div, {
        self: this.myId,
        remote: this.getVal(id)?.gNo,
      })
    );

    div.appendChild(image);
    div.appendChild(p);
    div.appendChild(check);

    this.friendBox.appendChild(div);
    this.chatRoomNote();
    this.closeBottomSheet();
  }

  countConnectedFriends(afterAdd) {
    if (!afterAdd && this.guestIcon.childElementCount <= 2)
      return { len: this.guestIcon.childElementCount };
    if (afterAdd && this.guestIcon.childElementCount <= 3)
      return { len: this.guestIcon.childElementCount };
  }

  quickPanelFriendInfo(btn, name) {
    this.recordClicks("quickPanelFriendInfo");
    if (this.prev_quick_panel_btn != btn) {
      this.prev_quick_panel_btn
        ? this.rmCls(this.prev_quick_panel_btn, "active")
        : this.rmCls(this.getById("g01"), "active");
      this.doToggle(btn, "active");

      this.prev_quick_panel_btn = btn;
      this.defaultFrndToInteract = btn.id;

      this.listen(this.disconnectBtn, () => {
        this.setVal("x_id", btn);
        this.recordClicks("disconnect_btn");
      });

      this.renderMyInfo(btn.id, btn.firstChild.src, name);
    } else {
      if (
        this.connectionMode(this.defaultFrndToInteract) &&
        this.bottomSheetDoor.classList[1]
      ) {
        if (Markers.checkState("automate") && Markers.myPosEnabled()) {
          this.openToast("Can't snap while automate and my pos are turn on.");
        } else {
          Markers.remoteSnap = true;
          this.adviceToTurnOnAutomate();
        }
      }
    }
  }

  renderMyInfo(id, imgUrl, name) {
    this.defaultFrndToInteract = id;
    this.quickPanelImg.src = imgUrl;
    this.quickPanelImg.alt = name;
    this.swapText(this.quickPanelName, name);
  }

  renderMyLocation(loc_name = '', dis = '', acc = '', speed) {
    this.swapText(this.location, loc_name);
    this.swapText(this.distance, dis);
    this.swapText(this.accuracy, acc); // suppose to make it like visual and animated
  }

  adviceToTurnOnAutomate() {
    if (!Markers.checkState("automate")) {
      doLater(
        () => this.openToast("Turn on automate for good view and experience."),
        5000
      );
    }
  }

  remote_disconnection(id) {
    const cht_id = this.getById(id + "friend");
    if (cht_id && this.friendBox.contains(cht_id))
      this.friendBox.removeChild(cht_id);
    this.chatRoomNote();
  }

  local_disconnection() {
    const x_id = this.getVal("x_id");
    const cht_id = this.getById(x_id.id + "friend");

    this.loader.classList.remove("start");

    if (this.guestIcon.contains(x_id)) {
      this.guestIcon.removeChild(x_id);
      this.friendBox.removeChild(cht_id);
      this.deleteVal("x_id");
      this.chatRoomNote();
    }
  }

  keepTripData(data) {
    if (data.coords) {
      this.tripInfoMsg(`Your trip on ${data.eventDate}`, true);
      data.coords.forEach((el) => {
        Markers.tripData.push(Markers.json(el));
        Markers.bbox.push(el.coords);
      });
    } else {
      this.tripInfoMsg("Empty trip bank.");
    }
  }

  tripInfoMsg(text, d) {
    d ? this.addCls(this.tripInfo, "data") : this.rmCls(this.tripInfo, "data");
    this.swapText(this.tripInfo, text);
  }

  displayRecordingPanel(message) {
    if (this.recordMe.classList[1]) {
      if (this.rec_save || message) {
        this.rmCls(this.recordMe, "show-btns");
        this.rmCls(this.displayRec, "minimize");

        if (message)
          this.tripInfoMsg(message, message.includes("Empty") ? false : true);
        this.rmCls(this.miniBoard, "logout");
        doLater(() => this.resetCount(), 500);
      } else {
        this.openMiniBoard("Save before quit ?");
      }
    } else {
      this.addCls(this.recordMe, "startRec");
      this.setVal("prev_note", this.tripInfo.innerHTML);
      this.tripInfoMsg("Trip recording started ...");
      
      doLater(() => {
        this.addCls(this.recordMe, "show-btns");
        this.emit("start-recording", true); // starting trip recording
      }, 500);
    }
  }

  resetCount() {
    this.rec_counter = this.initialRecDuration;
    this.recordMe.classList.remove("startRec");
    this.rmCls(this.pauseRec, "pause");
    this.rmCls(this.saveRecBtn, "saved");
    this.pauseRec.src = "/icons/pause_20.svg";
    this.swapText(this.recCounter, "15:00");
    this.emit("start-recording", false);
    this.rec_save = false;
  }

  // CloseWatch
  add_CW_Col(num) {
    if (num.clw) {
      for (const k in num.clw) {
        this.create_CW_Col(
          num.clw[k].phone_number,
          num.clw[k].name,
          num.clw[k].action
        );
      }
    } else if (!num.clw) {
      if (!this.editTag) this.create_CW_Col(num);
      if (this.editTag) {
        this.editTag.tag.style.backgroundColor = "";
        this.editTag.tag.style.color = "";
        if (num !== this.editTag.tag.innerHTML) {
          this.swapText(this.editTag.tag, num);
          this.swapText(this.getById(`$${this.editTag.index}`), " ... ");
        }
        this.editTag = null;
        this.addCloseWatchInput.value = "";
        if (this.clw_id() > 4) this.disabled_CW("grey");
      }
    }
  }

  create_CW_Col(num, name, action = null) {
    let id = this.clw_id();
    if (id <= 4) {
      let tr = this.create("div");
      let index = this.create("div");
      let numDiv = this.create("div");
      let p = this.create("p");
      let nameDiv = this.create("div");
      let clw_action = this.create("div");
      let span1 = this.create("span");
      let editBtn = this.create("div");
      let span2 = this.create("span");
      let deleteBtn = this.create("div");
      let span3 = this.create("span");

      tr.classList.add("tr");
      index.classList.add("index");
      numDiv.classList.add("pad_2");
      nameDiv.classList.add("pad_2");
      clw_action.classList.add("pad_1");
      editBtn.classList.add("clw-options");
      editBtn.classList.add("a");
      deleteBtn.classList.add("clw-options");

      if (action) {
        span1.classList.add("view");
      } // watcher viewed || connected

      p.id = "clw" + id;
      nameDiv.id = "$" + p.id;
      deleteBtn.id = "del_clw";

      this.swapText(index, id);
      this.swapText(p, num);
      this.swapText(nameDiv, name || " ... ");
      this.swapText(span2, "&#9997;");
      this.swapText(span3, "&#10005;");

      this.listen(p, () => this.clw_option_btns(p));
      this.listen(editBtn, () => {
        p.style.backgroundColor = "green";
        p.style.color = "white";
        this.disabled_CW("", num);
        this.addCloseWatchInput.value = p.innerHTML;
        this.addCloseWatchInput.focus();
        this.addCloseWatchBtn.value = "Edit";
        this.editTag = { index: "clw" + index.innerHTML, tag: p };
        this.recordClicks("clw_edit_btn");
      });
      this.listen(deleteBtn, () => this.deleteCLW(tr, p));

      numDiv.appendChild(p);
      clw_action.appendChild(span1);
      editBtn.appendChild(span2);
      deleteBtn.appendChild(span3);

      tr.appendChild(index);
      tr.appendChild(numDiv);
      tr.appendChild(nameDiv);
      tr.appendChild(clw_action);
      tr.appendChild(editBtn);
      tr.appendChild(deleteBtn);

      this.td.appendChild(tr);
      this.setVal(num, true); // Prevent Duplicate
      this.addCloseWatchInput.value = "";
      if (id >= 4) {
        this.disabled_CW("grey");
      }
    }
  }

  clw_id() {
    return this.td.childElementCount + 1;
  }

  disabled_CW(clr, num) {
    clr
      ? this.addCloseWatchInput.setAttribute("disabled", true)
      : this.addCloseWatchInput.removeAttribute("disabled");
    if (clr && num) this.addCloseWatchInput.focus();
    this.addCloseWatchBtn.style.backgroundColor = clr;

    if (num) this.deleteVal(num);
  }

  clw_option_btns(p) {
    if (this.getVal("clw_pwd_ok")) {
      if (this.prev_edit_btn) this.rmCls(this.prev_edit_btn, "selected");
      this.doToggle(p, "selected");
      this.recordClicks("clw_option_btns");

      if (this.prev_edit_btn !== p) {
        this.prev_edit_btn = p;
      } else {
        this.doToggle(p, "selected");
        this.prev_edit_btn = null;
      }
    }
  }

  deleteCLW(tr, p) {
    this.setVal("del_clw", { mode: "delete", number: p.innerHTML });
    this.td.removeChild(tr);
    this.disabled_CW("", p.innerHTML);
    this.editTag = null;
    this.recordClicks("clw_delete_btn");

    document.querySelectorAll(".index").forEach((x, y) => {
      if (x.innerHTML) this.swapText(x, y);
    });
  }

  clw_password(pwd) {
    if (pwd) {
      this.setVal("clw_pwd_ok", true);
      this.swapText(this.pwdNotice, "");
      this.rmCls(this.pwdMask, "show-mask");
    } else {
      this.swapText(this.pwdNotice, "Password not matched!");
    }
  }

  pwd_on_off() {
    let onOff = this.getById("on-off");
    this.listen(onOff, () => {
      this.pwdInput.focus();
      this.recordClicks("clw_pwd_on_off");

      if (onOff.classList[0]) {
        this.rmCls(onOff, "eye-open");
        onOff.src = "/icons/eye-crossed.svg";
        this.pwdInput.setAttribute("type", "password");
        
      } else {
        this.addCls(onOff, "eye-open");
        onOff.src = "/icons/eye.svg";
        this.pwdInput.setAttribute("type", "text");
      }
    });
  }

  toggleClwPage(title) {
    this.doToggle(this.settingContent, "current-view");
    this.doToggle(this.closeWatch, "current-view");

    if (title) {
      this.swapText(this.menu_title, title);
      this.getById("clw-nav").src = "/icons/back.svg";
      return;
    }

    this.swapText(this.menu_title, "Menu");
    this.getById("clw-nav").src = "/icons/close.svg";
  }

  // Chat
  renderMessage(text, arg) {
    let shape = this.create("div");
    let image = this.create("img");
    let card = this.create("div");
    let p = this.create("p");
    let small = this.create("small");

    this.addCls(shape, "shape");
    this.addCls(card, "card");
    this.addCls(card, "flex");

    this.swapText(p, text);
    this.swapText(small, arg.time || this.cht_time());

    if (arg.date) {
      const date = this.whatDay(arg.date); // ? "Yesterday" : this.isToday(time) ? "Today" : this.date, time_tag);
      if (!this.getVal(date)) {
        // say(date);
        this.setVal(date, true);
      }
    }

    if (arg?.r_name) {
      this.addCls(shape, "remote");
      image.src = "/image/" + arg.r_img;
      shape.appendChild(image);
    } else {
      this.addCls(shape, "local");
    }

    card.appendChild(p);
    card.appendChild(small);
    shape.appendChild(card);

    this.scroller.appendChild(shape);
    this.setScrollPosition();
    this.getPrevChat(text, arg);
  }

  getPrevChat(txt, arg) {
    //indexDB
    try {
      if (arg.cb) {
        if (arg.r_name) {
          arg.cb(arg.r_img, this.myId, arg.r_name, txt, arg.time);
        } else {
          const g = this.getVal(this.defaultFrndToInteract);
          arg.cb(this.myId, g.gNo, g.gName, txt, arg.time);
        }
      }
    } catch (err) {}
  }

  setScrollPosition() {
    if (this.scroller.scrollHeight) {
      this.scroller.scrollTop = this.scroller.scrollHeight;
      this.scroller.style.paddingBottom = "15vh";
    }
  }

  whatDay(timestamp) {
    const today = new Date();
    const msgDate = new Date(timestamp);
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (today.toDateString() === msgDate.toDateString()) {
      return "Today";
    } else if (yesterday.toDateString() === msgDate.toDateString()) {
      return "Yesterday";
    } else {
      return msgDate.toDateString();
    }
  }

  chatRoomNote() {
    let a = "All your connected friends will be here";

    if (this.countConnectedFriends(true).len === 1) {
      a = "You're connected";
    } else if (this.countConnectedFriends(true).len > 1) {
      this.radio.style.display = "flex";
      a =
        "Click on the friend you want to chat or toggle all by clicking on the right hand button";
    }

    this.swapText(this.chatNote, a);
  }

  showFriendListPanel() {
    this.doToggle(this.room, "show-up");
    doLater(() => {
      this.doToggle(this.scroller, "blur");
    }, 200);
  }

  closeFriendListPanel() {
    this.rmCls(this.room, "show-up");
    doLater(() => {
      this.rmCls(this.scroller, "blur");
    }, 200);
  }

  // Notification
  switch_nt_content_page_to(page) {
    if (page === "clw") {
      this.rmCls(this.nt_content, "current-view");
      this.addCls(this.clw_content, "current-view");
      doLater(() => this.rmCls(this.nt_clw_btn, "new-note"), 700);
    } else {
      this.addCls(this.nt_content, "current-view");
      this.rmCls(this.clw_content, "current-view");
      doLater(() => this.rmCls(this.nt_others_btn, "new-note"), 700);
    }
  }

  create_notification(data, cb) {
    let shape = this.create("div");
    let img0 = this.create("img");
    let div0 = this.create("div");
    let div1 = this.create("div");
    let img1 = this.create("img");
    let time = this.create("small");

    shape.className = "nt-shape";
    img0.alt = "Notification sender image";
    img1.alt = "option icon";

    this.listen(div0, () => {
      cb(data.id);
      this.switchTo("home_page");
      this.addCls(shape, "read");
    });

    this.listen(img1, () => {
      this.doToggle(this.ntMore, "show-up");
      this.notification_options(data, cb);
    });

    this.swapText(div1, data.message);
    this.swapText(time, this.cht_time());
    img0.src = "/image/" + data.imgUrl;
    img1.src = "/icons/more_vert.svg";

    div0.appendChild(div1);
    div0.appendChild(time);
    shape.appendChild(img0);
    shape.appendChild(div0);
    shape.appendChild(img1);

    this.ntContainer.appendChild(shape);
  }

  notification_options(data, cb) {
    this.req_back.id = data.id;
    this.del_nt = data.id;

    if (data.type === "G") {
      this.addCls(this.req_back, data.type);
    } else if (data.type === "clw") {
      this.swapText(this.req_back, "Watch Back");
    }

    this.listen(this.ntMore, (e) => {
      doLater(() => this.rmCls(this.ntMore, "show-up"), 100);
    });
  }

  // Expander
  toggleSubMenu(button) {
    const signature = (actBtn) => {
      if (!button.id.startsWith("del")) {
        this.action = actBtn ? actBtn.split("-")[0] : null;
        this.actBtn = actBtn || null;
      }
    };
    if (this.registeredUser()) {
      this.recordClicks("expander_submenu_" + button?.id || "");
      subMenus.forEach((ele) => {
        if (ele.id !== "pos") {
          this.rmCls(ele, "selected");
        }
      });
      this.doToggle(button, "selected");
      doLater(() => showExpanderMenu(expAlias), 300);
      signature(); // remove signed btn

      if (!button.classList[1])
        expMenuBtn.forEach((ele) => this.rmCls(ele, "selected"));
      switch (button.id) {
        case "pos":
          if (Markers.checkState("pos")) {
            this.emit("init-pos", false);
            
          } else {
            this.emit("init-pos", true);
          }
          break;
        case "snap":
          if (Markers.myPosEnabled()) {
            if (
              !this.defaultFrndToInteract ||
              (this.defaultFrndToInteract && !Markers.checkState("automate"))
            ) {
              if (button.classList[1]) this.emit("snap-pos");
              this.doToggle(button, "selected");
            } else {
              this.openToast("Turn off automate to enable snap");
            }
          } else {
            this.openToast("Turn on your pos to enable snap");
          }
          break;

        case "icons":
          if (button.classList[1]) signature("$ind-ics");
          break;

        case "custom":
          if (button.classList[1]) {
            signature("$start");
            doLater(() => {
              this.openMidPop();
            }, 700);
          }
          break;

        case "default":
          if (button.classList[1]) this.displayRecordingPanel();
          break;

        case "$s01":
          if (button.classList[1])
            doLater(() => {
              this.openToast("On process!");
            }, 500);
          break;

        default:
          this.doToggle(button, "selected");
          break;
      }
    }
  }

  makeSound(sound, vol = 0.2) {
    this.audio.src = "/sounds/" + sound + ".wav";
    this.audio.volume = vol;
    if (Markers.checkState("sound")) {
      this.audio.play().catch((err) => {});
    }
  }

  // Restore Prev Custom Icon Data
  setCustomIcon(text, imgBlob, setFunction = true) {
    if (text) {
      this.setVal("customIconText", text);
      this.customTextArea.value = text;
      this.customTextArea.setAttribute("readonly", "true");
      this.customIconSaveBtn.value = "Saved";

      if (setFunction) {
        this.action = "$ind";
        this.actBtn = "$ind-ctm";
      }
    }

    if (imgBlob) {
      this.newImg.src = URL.createObjectURL(imgBlob);
      this.newImg.id = "customImg";
      if (this.customIndImgFolder.contains(this.customImgUploaderFolder)) {
        this.customIndImgFolder.replaceChild(
          this.newImg,
          this.customImgUploaderFolder
        );
      }

      this.setVal("customImg", imgBlob);
    }
  }

  // SERVICE WORKER
  // Register service worker
  // Notification subscription
  async registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        return reg;
      } catch (err) {
        console.error("Service Worker registration failed:", err);
      }
    }
  }

  // Check if the user has granted permission for notifications
  async checkNotificationPermission() {
    if (Notification.permission === "granted") {
      return true;
    } else if (Notification.permission === "denied") {
      return false;
    } else {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
  }

  // Request permission for notifications
  async requestNotificationPermission() {
    const permission = await this.checkNotificationPermission();
    if (permission) {
      this.registerServiceWorker();
    } else {
      console.error("Notification permission denied.");
    }
  }

}

const dom = new DOM();

function say(x) {
  console.log(x);
}
function sayOnMbl(x) {
  dom.swapText(dom.select(".site-logo"), x);
}
