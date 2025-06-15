// USE WSS://DOMAIN FOR PRODUCTION
// export const socket = io('http://192.168.43.94:3000');
export const socket = io("ws://localhost:3000", {
  transports: ["websocket"],
  reconnection: true,
  auth: {
    path: "/feedback",
    token: localStorage.getItem("gG_a"),
  },
});

var msgContainer = document.querySelector(".msgContainer");
var textArea = document.querySelector("textarea");
var sendButton = document.querySelector("#sendBtn");
var defaultMsg = document.querySelector("._default");
var closeDefault = document.querySelector("span");
var isPop = true,
  controlKey,
  maxi = [];

const alphaNumeric = /^[a-zA-Z0-9]/;
var isMobile = /iPhone|iPad|iPod|Android|mobile/i.test(navigator.userAgent);

socket.on("feedback", (views) => {
  if (views?.comment) renderMessage(views);
});

function sendFeedBack(text) {
  socket.emit("myFeed", { comment: text, time: date() });
  textArea.style.height = "";
  textArea.value = "";
  controlKey = null;
  textArea.focus();
}

isPop ? msgContainer.classList.add("blur") : false;
closeDefault.addEventListener("click", (cl) => {
  msgContainer.classList.remove("blur");
  defaultMsg.style.display = "none";
  msgContainer.style.overflowY = "auto";
  isPop = false;
  setScrollPosition();
});

msgContainer.addEventListener("scroll", (scroll) =>
  isPop ? (msgContainer.style.overflowY = "hidden") : false
);

sendButton.addEventListener("click", (cl) => {
  if (!isPop) {
    let neededValue = alphaNumeric.test(textArea.value);
    let textValue = textArea.value;
    if (neededValue && textValue.length >= 3 && textValue.length < 750) {
      sendFeedBack(textValue);
    }
  }
});

function renderMessage(msg) {
  let shape = document.createElement("div");
  let image = document.createElement("img");
  let folder = document.createElement("div");
  let h6 = document.createElement("h5");
  let paraDiv = document.createElement("div");
  let para = document.createElement("p");
  let timeDiv = document.createElement("div");
  let t = document.createElement("small");
  let date = calcDate(msg.eventDt.date);

  image.src = `/image/${msg.imgUrl}`;
  h6.innerHTML = msg.username;
  para.innerHTML = msg.comment;
  t.innerHTML = msg.eventDt.time;

  shape.className = "shape";
  timeDiv.className = "time";

  paraDiv.appendChild(para);
  timeDiv.appendChild(t);

  if (msg.view) {
    let s = document.createElement("small");
    s.className = "seen";
    s.innerHTML = "seen";
    timeDiv.appendChild(s);
  }

  if (sortMaxDate(date)) {
    let dateDiv = document.createElement("div");
    let dt = document.createElement("small");

    dt.innerHTML = date;
    dateDiv.className = "date";
    dateDiv.appendChild(dt);
    msgContainer.appendChild(dateDiv);
  }

  if (isMobile && msg.comment.length > 400) {
    para.style.margin = "11px auto";
  }

  folder.appendChild(h6);
  folder.appendChild(paraDiv);
  folder.appendChild(timeDiv);

  shape.appendChild(image);
  shape.appendChild(folder);
  msgContainer.appendChild(shape);

  setScrollPosition();
}

function date() {
  let n_dt = new Date();
  let h = n_dt.getHours(),
    min = n_dt.getMinutes(),
    am_pm = n_dt.toLocaleTimeString().toLocaleLowerCase();
  return {
    date: n_dt.toLocaleDateString(),
    time: `${h}:${min < 10 ? "0" + min : min} ${am_pm.substring(
      am_pm.length - 2
    )}`,
  };
}

function calcDate(dt) {
  const Months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const DAYs = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
  let toDayDate = new Date().toLocaleDateString();

  let dateA = new Date(dt);
  let previousDay = DAYs[dateA.getDay()];
  let previousMonth = Months[dateA.getMonth()];
  let year = dateA.getFullYear();

  let dateB = new Date(toDayDate);
  let thisDay = DAYs[dateB.getDay()];
  let thisMonth = Months[dateB.getMonth()];

  let d0 = dateA.getDate();
  // let d1 = dateA.getDay();
  let dA = dateB.getDate();
  // let dB = dateB.getDay();

  if (previousMonth === thisMonth) {
    if (previousDay === thisDay) {
      return "Today";
    } else {
      if (dA - d0 === 1) {
        return `Yesterday`;
      } else if (dA - d0 > 1 && dA - d0 <= 6) {
        return `This week - ${previousDay}.`;
      } else if (dA - d0 >= 7 && dA - d0 <= 13) {
        return `About week ago.`;
      } else {
        // console.log("Not day Equal", d0, d1, dA, dB);
        // console.log("Date: ", dA - d0);
        // console.log("Day: ", dB - d1);
        // console.log(previousDay)
        return `About weeks ago.`;
      }
    }
  } else {
    return `${previousDay} - ${previousMonth} - ${year}`;
  }
}

function sortMaxDate(val) {
  if (!maxi.includes(val)) {
    maxi.push(val);
    return true;
  } else {
    return false;
  }
}

const setScrollPosition = () => {
  if (msgContainer.scrollHeight > 675) {
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }
};

// When enter key pressed
textArea.addEventListener("keydown", (e) => {
  if (!isPop) {
    e.keyCode === 17 ? (controlKey = e.keyCode) : false;
  } else {
    textArea.value = "";
  }
});

textArea.addEventListener("keyup", (e) => {
  if (!isPop) {
    let neededValue = alphaNumeric.test(textArea.value);
    let textValue = textArea.value;

    textArea.style.border = "";
    if (neededValue && textValue.length >= 3 && textValue.length < 750) {
      e.keyCode === 17 ? (controlKey = null) : false;
      let controlPlusEnterKey = controlKey && e.keyCode === 13;

      if (controlPlusEnterKey) {
        sendFeedBack(textValue);
      }
    } else if (neededValue && textValue.length > 750) {
      textArea.style.border = "2px solid red";
    } else {
      textArea.focus();
    }

    textArea.style.height = "";
    let height = e.target.scrollHeight;
    if (height > 50 && height < 100) {
      textArea.style.height = `${height}px`;
    } else if (height > 100) {
      textArea.style.height = `100px`;
    }
  } else {
    textArea.value = "";
  }
});
