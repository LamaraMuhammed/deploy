
import { socket } from "../home/g03.comp.sk.js";
import { utils } from "../utils/utilities.js";
import { db } from "../utils/indexDB.js";


// displayRequestPopUp i.e as browser confirm popup, 
// listening user res for connection to share loc.
socket.on('request', (msg) => {
    dom.requestQue.set(msg.s_id, msg);
    displayRequestPopUp();
    dom.makeSound("s_02");
});

socket.on("waitRes", res => dom.reqSpinner(res.id, () => socket.emit('removeListening', res.id)));

// Notification
socket.on("notification", (msg) => dom.create_notification(msg?.id, msg?.imgUrl, msg?.message, sendRequest));

socket.on("clw-info", msg => { 
    if (msg.clw_pwd) {
        dom.clw_password(msg.clw_pwd.status);

    } else if (msg.watcher_name) {
        dom.swapText(dom.getById(`$${msg.index}`), `<p>${msg.watcher_name}</p>`);
    } else {
        dom.swapText(dom.innerNotice, msg);
    }
});

socket.on("chat-response", (msg) => {
    dom.renderMessage(msg.msg, {r_name: msg.sender, r_img: msg.imgUrl, cb: storeChat});
    if (!dom.chatPage.classList[1]) {
        dom.mp.forEach((v, k) => {
            if (v && v.gNo === msg.imgUrl) {
                dom.getById(k).classList.add('new-chat');
             }
        });
    }
});

dom.listen(dom.req_back, (e) => {
    sendRequest(e.target.id);
    dom.switchTo("home_page");
});

dom.listen(dom.del_nt, (e) => { socket.emit("del-nt", { id: e.target.id }) });

// RECORD EVERY USER CLICK
// dom.on("clicks", (e) => socket.emit('clicks', e));

function chatOptions(msg) {
    if (dom.defaultFrndToInteract === 'All') {
        let a = dom.getVal('g01'), b = dom.getVal('g02'), c = dom.getVal('g03');
        if (a) a = a.id;
        if (b) b = b.id;
        if (c) c = c.id;
        socket.emit("chat-send", {  ids: [a, b, c], msg: msg });

    } else {
        socket.emit("chat-send", { id: dom.getVal(dom.defaultFrndToInteract).id, msg: msg });
    }
}

dom.listen(dom.getById("open-frnd-panel-icon"), () =>
  dom.showFriendListPanel()
);
dom.listen(dom.scroller, () => dom.closeFriendListPanel());
dom.listen(dom.chatPage, (e) => {
    if (e.srcElement.classList[0] === 'chat') dom.closeFriendListPanel();
});

// Select All to chat
dom.listen(dom.radio, (e) => {
    if (e.target['checked'] === true) {
        dom.prev_src = [dom.remoteIcon.src, dom.defaultFrndToInteract];
        dom.remoteIcon.src = "/image/self";
        dom.defaultFrndToInteract = 'All';
        dom.selectFriendToChat('all'); // toggle all
        dom.toggleAll = true;
        
    } else {
        dom.remoteIcon.src = dom.prev_src[0];
        dom.defaultFrndToInteract = dom.prev_src[1];
        dom.selectFriendToChat('all'); // remove toggle
        dom.toggleAll = false;
    }
});

// clr + enter key send chat on pc
dom.listen(dom.chatInput, () => {
    dom.listen(dom.chatInput, e => e.keyCode === 17 ? dom.controlKey = e.keyCode : false, "keydown");
    dom.listen(dom.chatInput, e => {
        e.keyCode === 17 ? dom.controlKey = null : false;
        dom.chatInput.style.border = "";
        if (dom.chatInput.value.length <= 350) {
            if (dom.controlKey && e.keyCode === 13) {sendMessage();}
        } else {
            dom.chatInput.style.border = "2px solid red";
        }
    }, "keyup");
});

dom.listen(dom.sendButton, e => sendMessage());

function sendMessage() {
    if (dom.registeredUser()) {
        if (dom.chatInput.value && dom.chatInput.value.length <= 350) {
            if(dom.defaultFrndToInteract) {
                dom.renderMessage(dom.chatInput.value, { cb: storeChat }); //Render on Screen
                chatOptions(dom.chatInput.value.replace(dom.space, ' ')); // To remote friend
                dom.chatInput.value = "";
                dom.chatInput.focus();
            } else {
                dom.openToast('Connect to a friend and start chatting.');
            }
        } 
    }
}

// Share Loc =====================================================
const sharelocInfo = `Connect and share location by clicking on the shareloc button, or \
    connect without sharing location by clicking on the no shareloc button.`;

dom.listen(dom.optionBtn, () => {
    dom.inputField.value = '';
    dom.inputField.style.border = "";
    dom.shareLocErr('');
    if (dom.share_loc.classList[1]) {
        dom.inputField.placeholder = 'Phone Number';
        dom.doToggle(dom.share_loc, 'ps'); dom.swapText(dom.shareLocInfo, sharelocInfo);
        dom.swapText(dom.shareBtn, 'ShareLoc'); dom.swapText(dom.optionBtn, 'Ps');

    } else {
        dom.inputField.placeholder = 'PSN';
        dom.doToggle(dom.share_loc, 'ps'); dom.swapText(dom.shareLocInfo, 'Using PS Number');
        dom.swapText(dom.shareBtn, 'Connect'); dom.swapText(dom.optionBtn, 'Pn');
    }
});

dom.listen(dom.shareBtn, () => {
    if (dom.shareBtn.innerHTML === 'ShareLoc') {
        sendRequest(dom.inputField.value, '1CG');

    } else {
        dom.swapText(dom.shareLocInfo, "<b style='color: #d40000;'>On Process!</b>");
    }
});

dom.listen(dom.noShare, () => sendRequest(dom.inputField.value, '0CG'));

dom.listen(dom.inputField, () => {
    if (dom.shareBtn.innerHTML === 'ShareLoc') {
        !utils.validateLengthOnKeyUp(dom.inputField.value) ?
            dom.inputField.style.border = '2px solid red' : dom.shareLocErr('');
        if (utils.validateLength(dom.inputField.value)) dom.inputField.style.border = '2px solid green'
        if (!dom.inputField.value) dom.inputField.style.border = '';
    }
}, "keyup");

function sendRequest(value, type) {
    if (value) {
        if (utils.validateLength(value)) {
            dom.shareLocErr('');
            requestConnection(type, value);
        } else {
            dom.shareLocErr('Invalid');
        }
    }
    
    function requestConnection(type, msg) {
        if (dom.registeredUser()) {
            if (dom.routeId()) {
                if (msg !== dom.myId) {
                    if (!dom.requestQue.get(msg)) {
                        socket.emit('requestConnection',  {
                            mode: type || '1CG',
                            value: msg,
                            time: new Date()
                        });
                        dom.inputField.value = '';
                        dom.inputField.style.border = "";
                    } else {
                        dom.openToast("Can't request the person being requesting you");
                    }
                } else {
                    dom.openToast("Can't connect with your phone number");
                }
            } else {
                dom.openToast("You have reached your free trial connections");
            }
        }
    }
}

// Request Panel ================================================
function popUp(msg) {
    let info = msg.mode === '1CG' ? `Requesting to connect on share location.` : `Requesting to connect on no share location.`;
    dom.requesterImg.src = `/image/${msg.s_id}`;
    dom.swapText(dom.rName, msg.s_n);
    dom.swapText(dom.rNote, info);
    doLater(() => dom.requestPanel.classList.add('open'), 100);
}

function displayRequestPopUp() {
    if (!dom.requestPanel.classList[1]) {
        dom.requestQue.forEach((v, k) => {
            if (!dom.requestPanel.classList[1]) {
                popUp(v);
                v.receiverRoute = parseInt(dom.routeId());
                dom.message = v; // passing argument to res btn
            }
        });
    }
}

function repeatRequestIfOther() { 
    dom.requestQue.delete(dom.message.s_id);
    if (dom.requestQue.size > 0 && dom.routeId()) {
        setTimeout(displayRequestPopUp, 1000);
    }
}

dom.listen(dom.acceptCall, function () { 
    if (dom.message) {
        socket.emit('confirm-to-share', { message: dom.message, res: true, resTime: new Date()});
        repeatRequestIfOther();
        dom.requestPanel.classList.remove('open');
    }
 });

dom.listen(dom.rejectCall, function () {
    if (dom.message) {
        socket.emit('confirm-to-share', { message: dom.message, res: false });
        repeatRequestIfOther();
        dom.requestPanel.classList.remove('open');
    }
});

// Close Watch  ================================================== 
let clwInput = dom.addCloseWatchInput;
dom.listen(dom.enterPwdBtn, () => {
    if (!dom.registeredUser()) {dom.swapText(dom.pwdNotice, "Login please!");}
    if (dom.pwdInput.value.length > 5 && dom.registeredUser()) {
      socket.emit("pwd-check", { mode: "clw_pwd", pwd: dom.pwdInput.value });
      dom.pwdInput.value = "";
      dom.swapText(dom.pwdNotice, "");
    }
});

dom.listen(clwInput, () => {
    utils.validateLengthOnKeyUp(clwInput.value) ?
    clwInput.style.border = '2px solid green' :
    clwInput.style.border = '2px solid red';
   
    dom.swapText(dom.innerNotice, "");
    if (!clwInput.value) clwInput.style.border = '';
}, "keyup");

dom.listen(dom.addCloseWatchBtn, () => {
    if (clwInput.value && dom.getVal('clw_pwd_ok')) {
        if (utils.validateLength(clwInput.value)) {
            if (utils.isReal(clwInput.value)) {
                if (!dom.getVal(clwInput.value)) {
                    if (dom.editTag) {
                        if (dom.editTag.tag.innerHTML !== clwInput.value) sendCloseWatch(dom.editTag.tag.innerHTML);
                    } else {
                        sendCloseWatch();
                    } 
                 
                    dom.add_CW_Col(clwInput.value);
                    clwInput.style.border = '';
                    dom.swapText(dom.innerNotice, "");
                    dom.addCloseWatchBtn.value = 'Add';
    
                } else {
                    dom.swapText(dom.innerNotice, "Duplicate!");
                }
            } else {
                dom.swapText(dom.innerNotice, "Check your phone number it seems unreal.");

            }
        } else {
            clwInput.style.border = '2px solid red';
        }

        if (dom.prev_edit_btn) {dom.prev_edit_btn.classList.remove("selected");}
        dom.prev_edit_btn = null;
    }
});

dom.listen(dom.td, () => {
    let deleted_row = dom.getVal('del_clw');
    if (deleted_row && dom.getVal('clw_pwd_ok')) {
        doLater(() => {
            socket.emit("close-watch", deleted_row); 
            dom.deleteVal('del_clw');
        }, 300);
    }
});

function sendCloseWatch(edited_num) {
    socket.emit("close-watch", {
        mode: dom.addCloseWatchBtn.value, 
        index: dom.editTag?dom.editTag.index:("clw" + dom.clw_id()),
        number: clwInput.value,
        edited_watcher: edited_num
    });
}

// Switching from chat page to home page
dom.listen(dom.getById("chat-nav"), () => {
    dom.switchTo("home");
    dom.doToggle(dom.getById('hm'), 'selected');
    dom.mp.forEach((v, k) => {
      if (v) {
        let x = dom.getById(k);
        if (x) x.classList.remove("new-chat");
      }
    });
});

// INDEXDB
function storeChat(from, to, remoteName, message, time) {
  // Check if the browser supports IndexedDB
  if (window.indexedDB) { db.storeChat(from, to, remoteName, message, time); };
}

function getPrevChats(l, r) {
  db.getChatHistory(l, r, (data) => {
    if (data) {
      data.forEach((v) => {
        if (v.from === dom.myId) {
          dom.renderMessage(v.message, {
            time: v.time,
            date: v.id,
            soundOff: true,
          }); // Render on Screen
            
        } else {
          dom.renderMessage(v.message, {
            r_name: v.remoteName,
            r_img: v.from,
            time: v.time,
            date: v.id,
            soundOff: true,
          }); // Render on Screen});
        }
      });
    }
  });
}

// EventEmitter;
// Prev Chats History
dom.on("getPrevChats", e => {
    if (!dom.getVal("prev" + e.remote)) {
        getPrevChats(e.self, e.remote);
        dom.setVal("prev" + e.remote);
    }
});

// Custom Icon Storage Customization
dom.on("customIcon", e => {
    db.deletePrev();
    if (e.text || e.img) {
        doLater(() => db.storeThis(e.text, e.img), 1000);
    }
});

dom.on("setCustomIcon", e => {
    db.getThisData((data) => {
        if (data) {
            dom.setCustomIcon(data.message, data.image, false);
        }
    });
});