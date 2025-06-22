const Cookie = require("cookie");
const { inspect } = require("../utils/checkPoint");
const sign_id = require("./sign_id");

module.exports = async function userConsent(req, res) {
  const { respond, phn, pwd } = req.body;
  const { user } = res;

  if (!user.referer || user.fetchSite === "none") {
    res.sendStatus(401);
    return;
  }

  if (respond) {
    const ck = await inspect.updateCookie(phn, pwd, user.dvc, {
      dup: respond,
    });
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
  }

  res.sendStatus(404);
  return;
};
