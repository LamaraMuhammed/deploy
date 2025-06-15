const CryptoJs = require("crypto-js");
const bcrypt = require("bcrypt");
const Cookie = require("cookie");
const { v4 } = require("node-uuid");

const { schema } = require("../models/model");
const { inversion } = require("./inversion");

class Check {
  constructor() {
    this.key = process.env.KEY;
    this.div = process.env.DIV;
    this.new_user = process.env.NEW_USER;
    this.validCookieDays = 3;
  }

  generatedKey() {
    let key = CryptoJs.lib.WordArray.random(32);
    return CryptoJs.enc.Hex.stringify(key);
  }

  generatedIv() {
    let key = CryptoJs.lib.WordArray.random(16);
    return CryptoJs.enc.Hex.stringify(key);
  }

  encryptKey(text, keyString, ivString) {
    let iv = CryptoJs.enc.Hex.parse(ivString);
    let key = CryptoJs.enc.Hex.parse(keyString);
    const options = {
      iv,
      mode: CryptoJs.mode.CBC,
      padding: CryptoJs.pad.Pkcs7,
    };

    let cipherBytes = CryptoJs.AES.encrypt(text, key, options);
    return cipherBytes.toString();
  }

  dateTime() {
    let date = new Date();
    let expirationDaysDate = new Date(date.getTime());
    expirationDaysDate.setDate(date.getDate() + this.validCookieDays);
    expirationDaysDate.setHours(expirationDaysDate.getHours() + 1);
    return expirationDaysDate.toUTCString();
  }

  checkDateExpiration(tm) {
    let todayDate = new Date();
    let passDaysDate = new Date(tm);
    let days = passDaysDate.getDate() - todayDate.getDate();

    let remainingHours = passDaysDate.getTime() - todayDate.getTime();
    let hours = Math.floor(remainingHours / (1000 * 60 * 60));

    if (days <= 0 && hours <= 1) {
      //Update date
      return { update: tm };
    } else {
      //Remain
      return { still: tm };
    }
  }

  cookieId() {
    return v4();
  }

  cookieOptions() {
    return {
      expirationDate: this.dateTime(),
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    };
  }

  createCookie(log_out) {
    const iv = this.generatedIv();
    const key = this.generatedKey();
    const id = this.cookieId();
    const time = this.dateTime();
    const header = this.encryptKey(this.key, key, iv);

    let log = this.cookieId().substring(0, 8);
    let ck = id;

    if (log_out?.log_out) {
      log = "0";
      ck = id.substring(0, 14).repeat(2).concat("_AowG");
    }

    return {
      options: this.cookieOptions(),
      cookie: {
        _: header + this.div + key + this.div + iv,
        _c: ck,
        _t: time,
        _s: log,
      },
    };
  }

  async check_password(pwd, phone_number) {
    const bcrypt = require("bcrypt");
    const password = await schema.UserAccount.findOne({
      phone_number: phone_number,
    });
    if (password) {
      const match = await bcrypt.compare(pwd, password.password);
      if (match) { return true } 
      return false;
    }
  }

  async updateCookie(phn, pwd, dvc, state) {
    const cookie = this.createCookie(state);
    const { _c, _s } = cookie.cookie;

    if (state?.log_out) {
      await this.update(_c, phn, null, _s);
      return cookie;
    }

    //  DEVICE DUPLICATE UPDATE BASE ON USER RESPONSE
    if (state?.dup) {
      // don't change
      if (state.dup === "remain") {
        await this.update(_c, phn, null, _s);
      } else {
        await this.update(_c, phn, dvc, _s);
      }

      return { cookie };
    }

    // STRICT LOG IN
    const acc = await this.updateAccount({
      id: _c,
      phn: phn,
      pwd: pwd,
      dvc: dvc,
      status: _s,
    });

    if (acc.grant) {
      return { grant: true, cookie };
    }

    return acc;
  }

  async updateAccount(args) {
    const { phn, pwd, id, dvc, status } = args;
    try {
      const user = await schema.UserAccount.findOne({ phone_number: phn });

      if (!user) {
        return { denied: true };
      }

      //  CHECK PASSWORD AND COMPARE
      const pwdMatch = await bcrypt.compare(pwd, user.password);
      if (!pwdMatch) {
        return { denied: true };
      }

      // USER CHANGE DEVICE ?
      if (user.device !== dvc && user.log_status !== this.new_user) {
        return { dup: true };
      }

      this.update(id, phn, dvc, status);
      return { grant: true };
    } catch (err) {
      return { err: "Something went wrong" };
    }
  }

  async update(id, phn, dvc, status) {
    const upd = dvc
      ? { id_token: id, device: dvc, log_status: status }
      : { id_token: id, log_status: status };

    await schema.UserAccount.findOneAndUpdate({ phone_number: phn }, upd, {
      new: true,
    });
  }

  async parseCookie(cookie) {
    try {
      const _ck = Cookie.parse(cookie);
      if (_ck) {
        const c = _ck.credentials;
        const ck = await this.decryptHeader(JSON.parse(c));

        if (ck) {
          const user = await this.checkAccount(ck._ck, ck.log_status);
          const expirationDate = this.checkDateExpiration(ck.time);

          if (!user?.user_id) {
            return user;
          }

          if (!expirationDate?.still) {
            return expirationDate;
          }

          return {
            id: inversion.encrypt(user.phone_number),
            token: user.user_id,
            username: user.username,
            phone_number: user.phone_number,
          };
        }
      }
    } catch (err) {
      return { err: "Something went wrong" };
    }
  }

  async decryptHeader(ck) {
    const slicedCipherBytes = ck._.split(this.div)[0];
    const slicedKey = ck._.split(this.div)[1];
    const slicedIv = ck._.split(this.div)[2];
    const _ck = ck._c;
    const time = ck._t;
    const log_status = ck._s;

    const iv = CryptoJs.enc.Hex.parse(slicedIv);
    const key = CryptoJs.enc.Hex.parse(slicedKey);
    const options = {
      iv,
      mode: CryptoJs.mode.CBC,
      padding: CryptoJs.pad.Pkcs7,
    };
    const cipherBytes = CryptoJs.AES.decrypt(slicedCipherBytes, key, options);
    const text = cipherBytes.toString(CryptoJs.enc.Utf8);

    if (text === this.key) {
      return {
        text,
        _ck,
        time,
        log_status,
      };
    }
  }

  async checkAccount(id, status) {
    try {
      const user = await schema.UserAccount.findOne({ id_token: id });
      if (!user) {
        return { denied: true };
      }

      if (user.log_status === "0") {
        return { log_out: true };
      }

      if (
        (status === "0" && user.log_status === this.new_user) ||
        status === user.log_status
      ) {
        return {
          user_id: user.id_token,
          username: `${user.first_Name} ${user.last_Name}`,
          phone_number: user.phone_number,
        };
      }
    } catch (err) {
      return { err: "Something went wrong" };
    }
  }
}

const inspect = new Check();

module.exports = {
  inspect,
};
