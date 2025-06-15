const desc =
  "Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque molestias repellendus hic ea corporis cumque provident autem rerum eveniet tenetur? Explicabo velit quis magnam culpa molestiae in obcaecati repellendus ad!";
const dt = {
  category: [
    "school",
    "garage",
    "market",
    "hotel",
    "shop",
    "museum",
    "casinos",
    "pack",
    "station",
  ],
  imgs: [
    "/img/IMG-WA0006.jpg",
    "/img/bg_2.jpg",
    "/img/mkt.png",
    "/img/IMG-WA0006.jpg",
    "/img/bg_2.jpg",
    "/img/mkt.png",
  ],
  placeName: "Hussain Provision Store",
  address: "Taraba, Wukari, Sunday Market",
  phoneNo: "09069964556",
  products: [
    "indomie",
    "sugar",
    "flour",
    "oil",
    "soap",
    "maggi",
    "lotion",
    "curry",
    "drinks",
    "passion",
  ],
  group: "Retailer",
  description: desc + desc,
  time: ["7:00 am", "6:30 pm"],
  ratings: [0, 0, 0, 0, 0, 5, 4, 3],
  fv_icon: "",
};

const DATA = [dt, dt, dt, dt, dt];

class DOM extends _DOM {
  constructor() {
    super();
    this.filters = null;

    this.adsContainer = this.select(".ads");
    this.adsLayer = this.create("div", "ads-layer");

    // img preview
    this.imgPreView = this.select(".img-preview");
    this.imgSrc = this.getById("img-preview");

    this.loads();
  }

  async fetchData(s) {
    let url = "/search/" + s;
    try {
      const res = await fetch(url);
      res.json();

      if (!res.ok)  return res.status;
      return res;
      
    } catch (err) {
      return { err };
    }
  }

  loop(cb, e) {
    for (let i = 0; i < e; i++) {
      cb(i);
    }
  }

  calcRating(ratings) {
    let average =
      ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    return average.toFixed(1);
  }

  createRating(data, cls) {
    let rating = this.create("div", cls);
    let div1 = this.create("div", "flex");
    let rating_lbl = this.create("p", null, "rating-lbl");
    let div2 = this.create("div", "flex");
    let grp = this.create("p", "grp");

    this.swapText(grp, data.group);
    this.swapText(rating_lbl, `(${this.calcRating(data.ratings)}k . ratings)`);

    this.loop(
      () => div1.appendChild(this.newImg("/icons/star.svg", "rating icon")),
      5
    );

    div1.appendChild(rating_lbl);
    div2.appendChild(grp);
    rating.appendChild(div1);
    rating.appendChild(div2);
    return rating;
  }

  favorite_icon(fv_icon, a, c) {
    const i = fv_icon || "favorite";
    const fv = this.newImg("/icons/" + i + ".svg", a, c);
    this.listen(fv, () => {
      fv.src = "/icons/favorite_20.svg";
    });
    return fv;
  }

  createFilters(prd) {
    const options = this.create("div", "options");
    const ls = this.create("div", "ads-filter selected");

    //  DEFAULT BUTTON
    this.swapText(ls, "All");
    this.listen(ls, () => this.doFilter(ls));
    options.appendChild(ls);

    //  FILTER BY CHOICES
    this.loop((i) => {
      const ls = this.create("div", "ads-filter");

      this.swapText(ls, prd[i]);
      this.listen(ls, () => this.doFilter(ls));

      options.appendChild(ls);
    }, prd.length);

    this.adsLayer?.appendChild(options);
  }

  doFilter(e) {
    if (!this.filters) this.filters = this.selectAll(".ads-filter");
    this.filters.forEach((ele) => this.rmCls(ele, "selected"));
    this.addCls(e, "selected");
  }

  createHeader(text, sub) {
    const hd = this.create("div", "ads-hd");
    const div = this.create("div");
    const h2 = this.create("h2");
    const p = this.create("p");

    this.swapText(h2, text);
    this.swapText(p, sub);

    div.appendChild(h2);
    div.appendChild(p);
    hd.appendChild(this.newImg("/icons/loc.svg", "location icon"));
    hd.appendChild(div);

    this.adsLayer.appendChild(hd);
    this.adsContainer?.appendChild(this.adsLayer);
  }

  async createBusinessCard(data) {
    const card = this.create("div", "card");
    const cd_dt = this.create("div", "cd-dt");
    const loc = this.create("div", "loc");
    const h2 = this.create("h2");
    const p0 = this.create("p");
    const list = this.create("div", "list prd");
    const nt = this.create("div", "nt");
    const p1 = this.create("p");
    const b0 = this.create("b", null, "dist");
    const prd_list = this.create("div", "list");

    this.loop((i) => {
      let ls = this.create("div");
      this.swapText(ls, data.products[i]);
      prd_list.appendChild(ls);
    }, data.products.length);

    const img = this.newImg(data.imgs[0]);

    this.swapText(h2, data.placeName);
    this.swapText(p0, data.address);
    this.swapText(p1, "products / services");
    this.swapText(b0, "1.7km");

    this.listen(img, () => this.cardView(data));

    card.appendChild(img);

    card.appendChild(cd_dt);
    cd_dt.appendChild(loc);
    loc.appendChild(h2);
    loc.appendChild(p0);

    nt.appendChild(p1);
    nt.appendChild(b0);
    list.appendChild(nt);
    list.appendChild(prd_list);
    card.appendChild(list);

    this.adsLayer?.appendChild(card);
  }

  renderAds() {
    this.createFilters(dt.category);
    this.adsContainer?.appendChild(this.adsLayer);

    this.createHeader("Top picks for you", "explore nearby");

    this.loop(async (i) => {
      await this.createBusinessCard(DATA[i]);
    }, DATA.length);
  }

  cd_view_img(data, card) {
    const wrp = this.create("div", "wrapper");
    const header = this.create("div", "wrapper-nav");
    const nav = this.newImg("/icons/nav_pointer.svg", "image", null);

    const slider = this.create("div", "slider");
    const flex = this.create("div", "flex");

    this.listen(nav, () => {
      this.addCls(card, "lose");
      doLater(() => card.remove(), 300);
    });

    header.appendChild(nav);
    header.appendChild(this.favorite_icon(data.fv_icon));

    // card image
    this.loop((i) => {
      let img = this.newImg(data.imgs[i]);
      img.id = "slider-" + i;

      this.listen(img, () => this.imgFullView(img.src));
      slider.appendChild(img);

      if (data.imgs.length > 1) {
        let a = this.create("a", null);
        a.href = "#slider-" + i;
        flex.appendChild(a);
      }
    }, data.imgs.length);

    wrp.appendChild(header);
    wrp.appendChild(slider);
    wrp.appendChild(flex);
    return wrp;
  }

  cd_view_addr(data) {
    let cont = this.create("div", "addr p-lf");
    let name = this.create("h3");
    let addr = this.create("p");
    let div0 = this.create("div", "flex");
    let open_time = this.create("small");
    let close_time = this.create("small");

    this.swapText(name, data.placeName);
    this.swapText(addr, data.address);
    this.swapText(open_time, `Opened at ${data.time[0]}`);
    this.swapText(close_time, `Closed at ${data.time[1]}`);

    div0.appendChild(open_time);
    div0.appendChild(close_time);

    cont.appendChild(name);
    cont.appendChild(addr);
    cont.appendChild(div0);
    cont.appendChild(this.createRating(data, "rating flex"));
    return cont;
  }

  cd_view_prd(data) {
    let prd = this.create("div", "prd p-lf");
    let hd = this.create("strong");
    let cont = this.create("div", "cont");

    this.listen(cont, (e) => {
      if (e.srcElement.classList[0] === "cont") this.addCls(cont, "see-all");
    });

    this.loop((i) => {
      let icon = data.category ? "shopping-basket.svg" : "";
      let itm = this.create("div", "item flex");
      let div0 = this.create("div", "flex");
      let img = this.newImg("/icons/" + icon, "icons");
      let lbl = this.create("p");
      let status = this.create("p");

      this.swapText(lbl, data.products[i]);
      this.swapText(status, "available");

      div0.appendChild(img);
      div0.appendChild(lbl);
      itm.appendChild(div0);
      itm.appendChild(status);
      cont.appendChild(itm);
    }, data.products.length);

    this.swapText(hd, "Products");
    prd.appendChild(hd);
    prd.appendChild(cont);
    return prd;
  }

  cd_view_desc(data) {
    let desc = this.create("div", "desc");
    let hd = this.create("strong");
    let p = this.create("p");

    this.swapText(hd, "Description");
    this.swapText(p, data.description);

    desc.appendChild(hd);
    desc.appendChild(p);

    return desc;
  }

  cd_view_contact(data) {
    let contact = this.create("div", "contact flex p-lf");
    let div0 = this.create("div", "flex call");
    let img0 = this.newImg("/icons/call.svg", "call");
    let p0 = this.create("p");
    let span = this.create("span");
    let div1 = this.create("div", "flex direction");
    let img1 = this.newImg("/icons/directions.svg", "direction");
    let p1 = this.create("p");

    this.listen(div0, () => {
      window.location.href = "tel:+234" + data.phoneNo;
    });

    this.listen(div1, () => Map.direct(data));

    this.swapText(p0, "Phone call");
    this.swapText(span, "|");
    this.swapText(p1, "Get direction");

    div0.appendChild(img0);
    div0.appendChild(p0);
    div1.appendChild(img1);
    div1.appendChild(p1);
    contact.appendChild(div0);
    contact.appendChild(span);
    contact.appendChild(div1);

    return contact;
  }

  cd_view_others(data) {
    let cont = this.create("div", "others");
    let hd = this.create("strong");
    let row = this.create("div", "row");

    this.swapText(hd, "Nearby Hubs | Neighbors");
    cont.appendChild(hd);

    this.listen(cont, async () => await this.fetchData("new"));

    this.loop((i) => {
      let cd = this.create("div", "cd");
      let img = this.newImg(data.imgs[i]);
      let div = this.create("div");
      let p = this.create("p");
      let flex = this.create("div", "flex");
      let icon = this.newImg("/icons/location_on.svg", "icons");
      let category = this.create("small");

      this.swapText(p, data.placeName);
      this.swapText(category, "shop");

      flex.appendChild(icon);
      flex.appendChild(category);
      div.appendChild(p);
      div.appendChild(this.createRating(data, "rating flex scale-d"));
      div.appendChild(flex);

      cd.appendChild(img);
      cd.appendChild(div);
      row.appendChild(cd);
    }, data?.recommendation?.length || 5);

    cont.appendChild(row);
    return cont;
  }

  lastPage() {
    let pg = this.create("div", "attr flex");
    let small = this.create("small");

    this.swapText(small, "WebG - All Rights Are Reserved.");
    pg.appendChild(small);
    return pg;
  }

  cardView(data) {
    const cardView = this.create("div", "card-view");
    cardView.appendChild(this.cd_view_img(data, cardView));
    cardView.appendChild(this.cd_view_addr(data));
    cardView.appendChild(this.cd_view_prd(data));
    cardView.appendChild(this.cd_view_desc(data));
    cardView.appendChild(this.cd_view_contact(data));
    cardView.appendChild(this.cd_view_others(data));
    cardView.appendChild(this.lastPage());
    this.select("section").appendChild(cardView);
  }

  imgFullView(img) {
    this.imgSrc.src = img;
    this.addCls(this.imgPreView, "preview");
    this.listen(this.imgSrc, () => this.rmCls(this.imgPreView, "preview"));
  }

  loads() {
    this.selectAll(".hm-nav").forEach((e) => this.listen(e, () => window.location.href = "/"));
    this.listen(this.select(".more_vert"), () =>
      this.doToggle(this.select(".drop"), "down")
    );
    this.listen(this.select(".search"), () =>
      this.doToggle(this.select(".search"), "search-page")
    );
  }
}

const doLater = setTimeout;
const dom = new DOM();

dom.renderAds();

function say(...x) {
  console.log(x);
}