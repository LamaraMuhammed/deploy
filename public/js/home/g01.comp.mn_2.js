const doLater = setTimeout;
let prev_setting_btn, expAlias;

// Notification
dom.listen(dom.select(".nt-icon"), () => dom.switchTo("notification_page"));

dom.listen(dom.nt_nav, () => dom.switchTo("home_page"));

function showSettingPanel(button, child) {
  if (child) {
    dom.recordClicks("setting_" + child + "_btn");
    switch (child) {
      case "clw":
        dom.toggleClwPage("Close Watch");
        break;

      case "trip":
        dom.doToggle(button, "openTripRecord");
        dom.setVal("tripOpenBtn", button);
        break;

      case "automate":
        if (!dom.registeredUser()) return;

        if (!button.classList[0]) {
          Markers.setState("automate");
          dom.addCls(button, "automated");

        } else {
          Markers.setState("automate", "disabled");
          dom.rmCls(button, "automated");
        }
        break;

      case "sound":
        if (!dom.registeredUser()) return;

        if (!button.classList[0]) {
          Markers.setState("sound");
          dom.addCls(button, "on");
        } else {
          Markers.setState("sound", "disabled");
          dom.rmCls(button, "on");
        }
        break;

      case "lang":
        dom.swapText(button, "Defaults to English");
        doLater(() => dom.swapText(button, "Language"), 5000);
        break;
    }
  } else if (dom.closeWatch.classList[1]) {
    dom.toggleClwPage();

  } else if (prev_setting_btn) {
    dom.closeBottomSheet();
    togglePrevBtn();

  } else {
    dom.closeBottomSheet();
    dom.closeMidPop();
    dom.doToggle(button, "show-setting-panel");
    prev_setting_btn = button;
    dom.recordClicks("menu_btn");
  }

  // RESET CLW PASSWORD AFTER 0NE MINUTE
  if (!button.classList[0] && !child) {
    doLater(() => {
      dom.deleteVal("clw_pwd_ok");
      dom.addCls(dom.pwdMask, "show-mask");
    }, 60000);
  }
}

function togglePrevBtn() {
  if (prev_setting_btn) {
    dom.doToggle(prev_setting_btn, "show-setting-panel");
    prev_setting_btn = null;
    if (dom.getVal("tripOpenBtn"))
      dom.rmCls(dom.getVal("tripOpenBtn"), "openTripRecord");
  }
}

function readTripData() {
  if (
    Markers.tripData.length > 0 &&
    dom.tripInfo.classList[1] &&
    !dom.mp.get("recOn")
  ) {
    doLater(() => togglePrevBtn(), 500);
    if (!Markers.layered) {
      Markers.readData();

    } else {
      doLater(() => dom.openToast("Already displayed"), 1000);
    }
  }
}

var panelOpener = dom.select(".friend-panel-opener");
dom.listen(panelOpener, () => {
  dom.openBottomSheet("quick-panel");
  dom.doToggle(panelOpener, "bx-upvote");
  dom.recordClicks("quick_frnd_panel_opener");
});

// Footer Nav Buttons
function footerBtnToggle(button, id) {
  // let reload = button.classList[1] && button.id ? true : false;
  dom.removeToggle(dom.navBtns);
  dom.doToggle(button, "selected");
  switch (id) {
    case 1:
      window.location.reload();
      break;
    case 2:
      // asking for share the location if setting panel not open i.e prev_btn
      if (!prev_setting_btn) {
        dom.openBottomSheet();
        dom.recordClicks("bottom_sheet");
      }
      break;
    case 3:
      dom.switchTo("chat_page");
      break;
    case 4:
      window.location.href = "tour";
      break;
  }
}

// Expander Menus
const expMenuBtn = document.querySelectorAll(".exp-menu-btn"),
  subMenus = document.querySelectorAll(".sub-menu");

function showExpanderMenu(button) {
  if (!dom.midPop.classList[1]) {
    expAlias = button;
    dom.doToggle(button, "show");
    !button.classList[1]
      ? button.classList.toggle("animate")
      : doLater(() => button.classList.toggle("animate"), 500);

    dom.recordClicks("expander_btn");
    if (dom.customIconSaveBtn.value !== "Saved")
      dom.emit("setCustomIcon", true);
  }
}

function selected(button) {
  !button.classList[1] ? dom.removeToggle(expMenuBtn) : "";
  button.classList.toggle("selected");
}

expMenuBtn.forEach((ele) => {
  if (ele.classList[1]) {
    ele.classList.remove("selected");
  }
  dom.listen(ele, () => selected(ele));
});

subMenus.forEach((ele) => {
  if (ele.id) {
    dom.listen(ele, () => dom.toggleSubMenu(ele));
  }
});

dom.listen(dom.bottomSheetDoor, () => dom.closeBottomSheet());

// Customization of custom indicator icon
dom.listen(
  dom.customTextArea,
  (e) => {
    dom.customTextArea.style.border = "";
    dom.mp.delete("customIconText");
    dom.customIconSaveBtn.value = "Save";
    dom.customTextArea.style.height = "47px";
    let height = e.target.scrollHeight;
    height <= 85
      ? (dom.customTextArea.style.height = `${height}px`)
      : (dom.customTextArea.style.height = `90px`);
    if (dom.customTextArea.value.length > 500)
      dom.customTextArea.style.border = "2px solid red";
  },
  "keyup"
);

dom.customImgUploader.onchange = () => {
  // Custom indicator img uploader
  if (dom.customImgUploader.files[0]) {
    dom.setCustomIcon(dom.customTextArea.value, dom.customImgUploader.files[0]);
    dom.setVal("customImg", dom.customImgUploader.files[0]);
    dom.customIconSaveBtn.value = "Save";
  }
};

dom.listen(dom.customImgDeleteBtn, () => {
  dom.customIndImgFolder.replaceChild(
    dom.customImgUploaderFolder,
    dom.getById("customImg")
  );
  dom.deleteVal("customImg");
  dom.customIconSaveBtn.value = "Save";
});

//  on save
dom.listen(dom.customIconSaveBtn, () => {
  if (dom.customTextArea.value || dom.getVal("customImg")) {
    if (dom.customTextArea.value.length <= 500) {
      if (dom.customIconSaveBtn.value === "Save") {
        dom.emit("customIcon", {
          text: dom.customTextArea.value || null,
          img: dom.getVal("customImg") || null,
        });
      }

      dom.setCustomIcon(dom.customTextArea.value);
      doLater(() => dom.closeMidPop(), 500);
    }
  } else {
    dom.actBtn !== "$1" ? (dom.actBtn = "$1") : (dom.actBtn = "$2");
    if (dom.customIconSaveBtn.value === "Close") {
      dom.closeMidPop();
      doLater(() => (dom.customIconSaveBtn.value = "Save"), 500);
    }

    if (dom.actBtn !== "$2" && dom.customIconSaveBtn.value === "Save") {
      dom.openToast("Unable to save empty.");
    } else {
      dom.customIconSaveBtn.value = "Close";
    }
  }
});

dom.listen(dom.customIconEditBtn, (e) => {
  dom.customTextArea.removeAttribute("readonly");
  dom.customIconSaveBtn.value = "Save";
  dom.customTextArea.focus();
});

// customImgFullView
function customImgFullView(img) {
  if (dom.fullViewImg) {
    if (!interval(dom.fullViewImg, new Date().getTime())) imageView(img.src);
  }

  dom.fullViewImg = new Date().getTime();

  function interval(firstClick, secondClick) {
    let interval =
      new Date(secondClick).getTime() - new Date(firstClick).getTime();
    return Math.floor(interval / 1000);
  }
}

var profileImgUploader = dom.getById("img-uploader"),
  imgLoadErr = dom.getById("imgLoadErr");
profileImgUploader.onchange = () => {
  if (!dom.registeredUser()) return;
  processImage(profileImgUploader, imgLoadErr);
};

function processImage(uploader, error) {
  const reader = dom.fileReader;
  const imgFile = uploader.files[0];
  try {
    reader.readAsArrayBuffer(imgFile);
    reader.onload = async () => {
      const result = reader.result;
      const byte = new Uint8Array(result);
      const imgByte = byte.byteLength;

      if (imgFile && imgByte <= 5 * 1024 * 1024) {
        // 5MB
        try {
          dom.formData.append("file", imgFile);

          await fetch("/image/upload", {
            method: "POST",
            body: dom.formData,
          })
            .then((res) => res.json())
            .then((result) => {
              if (result.err) {
                imgLoadError(result.err);
                return;
              }

              dom.set_profileImg(URL.createObjectURL(imgFile));

            })
            .catch((err) => imgLoadError("BE_ERR: Processing your image."));
        } catch (err) {
          imgLoadError("Something went wrong.");
        }
      } else {
        imgLoadError("Image file exceeded the required limit.");
      }
    };
  } catch (err) {
    imgLoadError("Image processing failed.");
  }

  function imgLoadError(err) {
    dom.swapText(error, err);
    doLater(() => dom.swapText(error, ""), 11000);
  }
}

function doLog(button) {
  if (dom.registeredUser()) {
    if (!button) {
      doLater(() => togglePrevBtn(), 300);
      doLater(() => dom.openMiniBoard(), 700);
    } else {
      let parentOnQuest = button.parentNode.parentNode.classList[2];

      if (button.value === "Yes") {
        if (parentOnQuest) {
          dom.rec_save = true;
          dom.displayRecordingPanel();
          dom.tripInfoMsg("Please wait processing ...", true);
        } else {
          logOut();
        }
      } else if (button.value === "No") {
        if (parentOnQuest) {
          dom.displayRecordingPanel(dom.getVal("prev_note")); // quit rec
        } else {
          doLater(() => dom.openMiniBoard(), 300);
        }
      }
      dom.miniBoard.classList.remove("quest");
    }
  } else {
    doLater(() => (window.location.href = "/Logs"), 300);
  }
}

function logOut() {
  if (dom.registeredUser()) {
    fetch("/Logs/out", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logOut: true }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.redirect) {
          dom.select(".primary-container").style.display = "none"; // Hide the hm page
          doLater(() => (window.location.href = "/Logs"), 1000);
        } else {
          doLater(() => window.location.reload(), 1000);
        }
      })
      .catch((err) => {
        return false;
      });
  }
}

// Inform user if not sign up or log in
(function () {
  doLater(() => {
    let id;
    if (!dom.registeredUser()) {
      id = setInterval(() => {
        dom.openToast('Please <a href = "/Logs">Log</a> into your account');
        if (dom.registeredUser()) clearInterval(id);
      }, 30000);
    }
  }, 40000);
})();
