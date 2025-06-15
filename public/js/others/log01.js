const doLater = setTimeout;
const signUpText = "The asterisk * * * field is your registered id which you might use to connect or login even without password, you can see readMe for more explanation after login. <br><i>WebG loves you and care about your privacy.</i>";
const loginText = "You can chat, post and search or show places (to your friend) on WebG securely.";

class LOGGER {
  constructor() {
    this.select = (ele) => document.querySelector(ele);
    this.getById = (ele) => document.getElementById(ele);
    this.create = (ele) => document.createElement(ele);
    this.listen = (ele, cb, e) => ele.addEventListener(e || "click", cb);
    this.dataCollection = [];
    this.mp = new Map();
    this.active = "active";

    this.welcomePage = this.select(".welcome-page");
    this.formPage = this.select(".form-page");
    this.nav = this.select(".nav");

    this.suc_pop = this.select(".suc");
    this.header = this.select(".header");
    this.note = this.select(".note");
    this.psn = this.getById("ps");
    this.prevInput = this.select(".prev");
    this.copyBtn = this.select(".copy");
    this.form = this.select(".form");

    this.signUpForm = this.select(".sign-up");
    this.signInForm = this.select(".sign-in");

    this.label = this.select(".lbl");
    this.hint_u = this.select(".hint-u");
    this.hint_i = this.select(".hint-i");
    this.pwd_hint = this.select(".hint-i-pwd");
    this.signUpInput = this.getById("nm");
    this.radio = document.querySelectorAll(".radio");

    this.phnField = this.getById("phn");
    this.pwdField = this.getById("pwd");
    this.submitBtn = this.select(".submitBtn");
    this.pwd_on_off();

    // Dup dvc
    this.dup_pop = this.select(".dup-dvc");
    this.signOut = this.getById("sign-out");
    this.remain = this.getById("remain");
  }

  swapText(ele, t) {
    ele.innerHTML = t;
  }

  setVal(k, v) {
    this.mp.set(k, v || true);
  }

  getVal(k) {
    return this.mp.get(k);
  }

  addCls(ele, cls) {
    ele.classList.add(cls);
  }

  rmCls(ele, cls) {
    ele.classList.remove(cls);
  }

  doToggle(ele, cls) {
    ele.classList.toggle(cls);
  }

  enabledSubmitBtn() {
    let v = this.submitBtn.value;
    this.submitBtn.value = v === "Sign Up" ? "Sign Up" : "Next  \u21D2";
    this.signUpInput.style.border = "2px solid #00cc00";
    this.addCls(this.submitBtn, "acceptClick");
  }

  disabledSubmitBtn() {
    this.signUpInput.style.border = "";
    this.submitBtn.value = this.signUpInput.value ? "Next" : "Start";
    this.rmCls(this.submitBtn, "acceptClick");
  }

  disabledLoginBtn(phn_hint, pwd_hint) {
    if (phn_hint) {
      this.phnField.style.border = "2px solid #ff0000";
      this.hint_i.style.color = "#ff0000";
      this.swapText(this.hint_i, phn_hint);
    }

    if (pwd_hint) {
      this.pwdField.style.border = "2px solid #ff0000";
      this.pwd_hint.style.color = "#ff0000";
      this.swapText(this.pwd_hint, pwd_hint);
    }

    this.submitBtn.value = "Start";
    this.rmCls(this.submitBtn, "acceptClick");
  }

  signUpInputErr(msg) {
    this.signUpInput.style.border = "2px solid red";
    this.signUpHint(msg, "#ff0000");
  }

  signUpHint(t, c) {
    this.swapText(this.hint_u, t);
    this.hint_u.style.color = c;
  }

  signInHint(t, c) {
    this.swapText(this.hint_i, t);
    this.hint_i.style.color = c;
  }

  warn(m) {
    this.note.style.color = "#ff0000";
    this.swapText(this.note, m);
  }

  is(k) {
    if (this.getVal(k)) return true;
  }

  route() {
    return this.label.classList[1];
  }

  homePage() {
    this.change_display(null, "flex");
    this.listen(this.getById("Sign-up"), () => this.signUpPage());
    this.listen(this.getById("Sign-in"), () => this.signInPage());

    this.listen(this.nav, () => {
      this.mp = new Map(); // reset
      this.change_display(null, "flex");
      this.resetPage();
    });
  }

  signUpPage() {
    this.resetPage();
    if (this.label.classList[1] !== "sex") {
      this.swapText(this.header, "Create Your Account");
      this.swapText(this.note, signUpText);
      this.swapText(this.label, "Full Name");
      this.signUpInput.setAttribute("placeholder", "Full Name");
    }

    this.change_display("flex");
    this.switch_page(this.signInForm, this.signUpForm, this.active);
    this.setVal("sign-up");
  }

  signInPage() {
    // First check user been registered but not copy psn,
    // so, when login clear pop up and psn from view.
    this.resetPage();

    this.change_display("flex");
    this.swapText(this.label, "");
    this.swapText(this.header, "Login To Your Account");
    this.swapText(this.note, loginText);
    this.signUpHint("", "");
    this.signInHint("", "");
    this.switch_page(this.signUpForm, this.signInForm, this.active);
    this.setVal("sign-in");
  }

  change_display(scr1, scr2) {
    this.formPage.style.display = scr1 || "none";
    this.welcomePage.style.display = scr2 || "none";
  }

  switch_page(rm, add, cls) {
    this.rmCls(rm, cls);
    this.addCls(add, cls);
  }

  // r = reverse
  nextInput(t, cls, r) {
    if (this.is("sign-up")) {
      if (!r) {
        this.setVal(this.route(), { [this.route()]: this.signUpInput.value });
        doLater(() => (this.signUpInput.value = ""), 700);
      }

      doLater(() => {
        this.addCls(this.form, "fade");
        if (!cls) this.rmCls(this.prevInput, "do");

        if (r) {
          this.signUpInput.value = this.getVal(cls)[cls];
          doLater(() => this.enabledSubmitBtn(), 500);
          if (cls === "nm") {
            this.signUpInput.value =
              this.getVal(cls).firstName + " " + this.getVal(cls).lastName;
          }
        }
      }, 500);

      if (cls) doLater(() => this.changeLog(t, cls), !r ? 1500 : 1000);
    }
  }

  pwd_on_off() {
    let onOff = this.getById("on-off");
    this.listen(onOff, () => {
      this.pwdField.focus();
      if (onOff.classList[1] === "bxs-low-vision") {
        this.rmCls(onOff, "bxs-low-vision");
        this.addCls(onOff, "bxs-key");
        this.pwdField.setAttribute("type", "text");
      } else {
        this.rmCls(onOff, "bxs-key");
        this.addCls(onOff, "bxs-low-vision");
        this.pwdField.setAttribute("type", "password");
      }
    });
  }

  changeLog(t, cls) {
    if (this.route()) {
      this.disabledSubmitBtn();
      this.swapText(this.label, t);
      this.signUpInput.setAttribute("placeholder", t);
      this.rmCls(this.label, this.route()); // remove the prev cls
      this.addCls(this.label, cls);

      this.signUpHint("", "");
      if (cls === "pwd") this.swapText(this.hint_u, "minimum 6 characters");
      if (cls === "dob")
        this.signUpInput.setAttribute("placeholder", "12 - 03 - 0000");
      if (cls === "sex") this.radioOn();

      this.rmCls(this.form, "fade");
      this.addCls(this.prevInput, "do"); // previous btn
    }
  }

  radioOn() {
    this.submitBtn.value = "Sign Up";
    this.radio.forEach((ele) => this.rmCls(ele, "checked")); // reset on reverse
    this.radio.forEach((ele) => {
      this.listen(ele, () => {
        this.radio.forEach((ele) => this.rmCls(ele, "checked"));
        ele.classList[1] === "male"
          ? this.addCls(ele, "checked")
          : ele.classList[1] === "female"
          ? this.addCls(ele, "checked")
          : ele.classList[1] === "neuter"
          ? this.addCls(ele, "checked")
          : null;
        this.setVal("sex", ele.classList[1]);
        this.signUpInput.value = ele.classList[1]; // for submitBtn response
        this.enabledSubmitBtn();
      });
    });
  }

  resetPage() {
    this.rmCls(this.suc_pop, "pop");
    this.rmCls(this.suc_pop, "submitted");
    this.header.style.color = "";
    this.note.style.color = "";
    this.swapText(this.note, "");
    this.copyBtn.style.color = "";
    this.copyBtn.value = "copy";
    this.swapText(this.psn, " * * * * ");
    this.rmCls(this.label, this.label.classList[1]); // remove the prev cls
    this.addCls(this.label, "nm");
    this.signUpHint("", "");
    this.submitBtn.value = "Start";
    this.rmCls(this.prevInput, "do");
    this.rmCls(this.submitBtn, "acceptClick");
    this.rmCls(this.form, "fade");

    this.signUpInput.style.border = "";
    this.signUpInput.value = "";

    this.phnField.style.border = "";
    this.phnField.value = "";

    this.pwdField.style.border = "";
    this.pwdField.value = "";
  }

  err_copy() {
    this.warn("Oops! no clipboard found.");
    this.note.style.color = "#d30707";
    doLater(() => {
      this.note.style.color = "";
      this.note.innerHTML = "Can't copy just write down your PSN.";
      this.suc_pop.style.visibility = "hidden";
    }, 2000);
  }

  doubleDvcLog(cb) {
    this.listen(this.signOut, () => cb("sign-out"));
    this.listen(this.remain, () => cb("remain"));

    this.swapText(this.header, "Security Issue");
    this.addCls(this.dup_pop, "dup");
  }
}