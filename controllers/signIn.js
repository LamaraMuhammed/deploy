const Cookie = require("cookie");

const { schema } = require("../models/model");
const { inspect } = require("../utils/checkPoint");
const { sanitizeMe } = require("../public/js/utils/regexInputValues");
const { psnLogin } = require("../utils/psn");
const sign_id = require("./sign_id");

module.exports = async function signIn(req, res) {
  const user = res.user;
  const { phn, pwd, psn } = req.body;
  
  if (psn) {
    // Checking the psn before passing
    const ok = sanitizeMe(psn);
    if (!ok) {
      res.json({ psErr: "Incorrect PSN!" });
      return;
    }

    psnLogin(psn, async (ans) => {
      if (!ans.phone_no) {
        res.json({ psErr: "Some error occurred" });
        return;
      }

      //  update cookie
      const resCookie = inspect.createCookie(user.dvc, true);
      try {
        await schema.UserAccount.findOneAndUpdate(
          { phone_number: ans.phone_no },
          {
            id_token: resCookie.userCookie._ck_,
            device: user.dvc,
            log_status: resCookie.userCookie._st_,
          },
          { new: true }
        );
        res.setHeader(
          "Set-Cookie",
          Cookie.serialize(
            "credentials",
            JSON.stringify(resCookie.userCookie),
            resCookie.cookieOptions
          )
        );
        
        res.json({
          id: sign_id(resCookie.userCookie._ck_, ans.phone_no),
          permit: true,
        });
        res.end()
        return;

      } catch (err) {
        res.json({ psErr: "Some error occurred" });
        return;
      }
    });
  } else if (phn && pwd) {
    // UPDATE COOKIE AND ENTER
    const ck = await inspect.updateCookie(phn, pwd, user.dvc);
    
    if (ck.err) {
      res.json({ err: ck.err });
      return;
    }
    
    if (ck.denied) {
      res.json( { err: "Invalid credentials" });
      return;
    }
    
    // Ask User if he wanna opt out from other device or not
    if (ck.dup) {
      res.json({ dup: true });
      return;
    }

    res.setHeader(
      "Set-Cookie",
      Cookie.serialize(
        "credentials",
        JSON.stringify(ck.cookie.cookie),
        ck.cookie.options
      )
    );

    res.json({
      id: sign_id(ck.cookie.cookie._c, phn),
      permit: true,
    });
    
    res.end();
    return;

  } else {
    res.status(400);
    res.json({ err: "Invalid request!" });
    return;
  }
};