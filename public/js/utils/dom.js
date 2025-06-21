class _DOM {
  constructor(callback) {
    this.isMobile = /iPhone|iPad|iPod|Android|mobile/i.test(
      navigator.userAgent
    );

    this.init(callback);
    this.events = {};
    this.mp = new Map();
  }

  init(callback) {
    this.listen(
      window,
      (e) => {
        this.emit("connect", true); // allow socket to connect
        const loader = this.getById("loader");
        const content = this.getById("_main");
        // ON OTHER PAGES
        if (!callback) {
          this.showContent(loader, content);
          return;
        }

        const idx = JSON.parse(Markers.getState("g-c"));
        let ele = this.create("div");
        
        // USER HAS LAST PREV COORDS
        if (this.getInterval(idx?.t)) {
          callback(); // init pos
          this.emit("init", Markers.arrCoords(idx.c));
          this.showContent(loader, content);
          return;
        }

        this.addCls(loader, "wait-pos");
        content.style.visibility = "visible"; // Show the actual UI

        this.swapText(ele, "Preparing location ...");
        loader.insertAdjacentElement("beforeend", ele);

        callback((res) => {
          if (res) {
            this.showContent(loader, content);
            ele.remove();
          }
          return;
        });

        doLater(() => this.swapText(ele, "Please wait ..."), 4000);

        doLater(() => {
          ele.style.color = "#0f0";
          this.swapText(ele, "Here you go!");
        }, 7000);

        doLater(() => {
          this.showContent(loader, content);
          ele.remove();
        }, 10000);
      },
      "load"
    );
  }

  showContent(l, c) {
    l.style.display = "none"; // Hide loader
    c.style.visibility = "visible"; // Show the actual UI
  }

  on(event, Listener) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(Listener);
  }

  emit(event, ...arg) {
    if (this.events[event]) {
      this.events[event].forEach((Listener) => Listener(...arg));
    }
  }

  create(ele, cls, id) {
    const element = document.createElement(ele);

    if (id) element.id = id;
    if (cls) {
      cls = cls.split(" ");
      this.loop((i) => this.addCls(element, cls[i]), cls.length);
    }

    return element;
  }

  newImg(src, alt = "image", cls = "img") {
    let i = this.create("img", cls);
    i.src = src;
    i.alt = alt;
    return i;
  }

  selectAll(ele) {
    return document.querySelectorAll(ele);
  }

  select(ele) {
    return document.querySelector(ele);
  }

  getById(ele) {
    return document.getElementById(ele);
  }

  doToggle(ele, cls) {
    ele.classList.toggle(cls);
  }

  swapText(ele, text) {
    ele.innerHTML = text;
  }

  addCls(ele, cls) {
    ele.classList.add(cls);
  }

  rmCls(ele, cls) {
    ele.classList.remove(cls);
  }

  listen(ele, cb, evt) {
    ele.addEventListener(evt || "click", cb);
  }

  recordClicks(listener) {
    listener && this.emit("clicks", listener);
  }

  setVal(k, v) {
    this.mp.set(k, v || true);
  }

  getVal(k) {
    return this.mp.get(k);
  }

  deleteVal(k) {
    this.mp.delete(k);
  }

  cht_time(secs) {
    let n_dt = new Date();

    if (secs) {
      return n_dt.toLocaleTimeString().toLowerCase();
    }

    let h = n_dt.getHours(),
      min = n_dt.getMinutes(),
      am_pm = n_dt.toLocaleTimeString().toLocaleLowerCase();
    return `${h > 12 ? h - 12 : h}:${
      min < 10 ? "0" + min : min
    } ${am_pm.substring(am_pm.length - 2)}`;
  }

  getInterval(previousTime) {
    if (previousTime) {
      const currentTime = Date.now();
      const elapsed = currentTime - previousTime;
      // 60,000 ms = 1 minute
      let min = elapsed / 1000;
      
      min = min / 60;
      // 60m = 1hr 
      if (min <= 60) return min;
    }
  }

  random(arr) {return arr[Math.floor(Math.random() * arr.length)]}

  logError(url, colNo, err) {
    fetch("/client_site_error_logger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: url,
        columnNo: colNo,
        message: err.message,
        error: err?.stack || "",
        time: new Date().toISOString(),
        user: this.myId,
        page: window.location.href,
      }),
    });
  }
}
