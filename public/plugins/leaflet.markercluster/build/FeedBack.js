const socket = io("ws://localhost:3000");

var Container = document.querySelector(".container"); 
var msgContainer = document.querySelector(".msgContainer"); 
var msgInput = document.querySelector(".msgInput"); 
var textArea = document.querySelector("textarea"); 
var sendButton = document.querySelector("#sendBtn"); 
var defaultMsg = document.querySelector("._default"); 
var closeDefault = document.querySelector("span"); 
var isPop = true;

const TIME = new Date().toLocaleTimeString();
const DATE = new Date().toLocaleDateString();
const alphaNumeric = /^[a-zA-Z0-9]/;

closeDefault.addEventListener('click', cl => {
    defaultMsg.style.display = 'none';
    setScrollPosition();
    isPop = false;
});

sendButton.addEventListener('click', cl => {
    if (isPop === false) {
        let neededValue = alphaNumeric.test(textArea.value);
        let textValue = textArea.value;
        if (neededValue) {
            textValue.length >= 3 && neededValue ? 
            [
                // renderMsg(textValue), 
                textArea.value = "",
                sendFeedBack(textValue)
            ] : textArea.focus();
            
        } else {
            textArea.focus();
            
        }
    }
    
});

var renderMsg = (obj) => {
    const msgEle = document.createElement("div");
    const timeLine = document.createElement("p");
    const view = document.createElement("p");
    const senderName = document.createElement("small");
    const folder = document.createElement("div");
    const sender = document.createElement("div");
    const image = document.createElement("img");
    const txtNode = document.createTextNode(obj.comment);
    
    image.src = `/WebG/image/${obj.phoneNo}`;
    senderName.innerHTML = obj.username;
    timeLine.innerHTML = obj.time;
    
    if (obj.seen) {
        view.innerHTML = "Seen";    // &#10003
    } 
    
    // view.innerHTML = "&#10003";
    image.classList.add("senderImg");
    senderName.classList.add("senderName");
    sender.append(image);
    sender.append(senderName);
    sender.classList.add("sender");
    timeLine.classList.add('time');
    view.classList.add("view");
    
    msgEle.append(txtNode);
    msgEle.append(timeLine);
    msgEle.append(view);
    msgEle.classList.add('textMsg');
    folder.append(sender);
    folder.append(msgEle);
    folder.classList.add("folder");
    textArea.style.height = "30px";
    msgContainer.append(folder);
    setScrollPosition();
    
}

const setScrollPosition = () => {
    if (msgContainer.scrollHeight > 675) {
        msgContainer.scrollTop = msgContainer.scrollHeight;
        msgContainer.style.paddingBottom = "50px";
    }
}

msgContainer.addEventListener('scroll', scroll => isPop === true ? msgContainer.style.overflow = "hidden" : msgContainer.style.overflow = "auto");

textArea.addEventListener('keyup', e => {
    textArea.style.height = "30px";
    let height = e.target.scrollHeight;
    if (height <= 85) {
        textArea.style.height = `${height}px`;
    } else {
        textArea.style.height = `90px`;
    }
});

function sendFeedBack(text) {
    socket.emit('comment', { comment: text, time: [TIME, DATE] });
}

socket.on('feedback', (views) => {
    renderMsg(views);
});

// Navigation Button to Home Page, 
document.getElementById("nav").addEventListener("click", () => window.location.href = "Home");




// Assalam Alaikah ya Rasullah ina son ka ya manzan Allah, Assalam alaikum ya ahlul bait wa ashab wa auliya, shehu dan Annabi ya shehu a amsa min amin a bani fiye da lissafi na alheri da albarka da rabo duniya da kiyama cikin ka ya muradi.