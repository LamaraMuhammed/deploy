const Cookie = require("cookie");
const { inspect } = require("../../utils/checkPoint");


module.exports = async function signOut(req, res) {
  const { _ck, fetchSite } = res.user;

  if (!_ck || fetchSite === "none") {
    res.sendStatus(403);
    return;
  }

  const parseCookie = await inspect.parseCookie(_ck);
  if (!parseCookie.log_out) {
    const ck = await inspect.updateCookie(
      parseCookie.phone_number,
      null,
      null,
      {log_out: true}
    );
    if (ck) {
      res.setHeader(
        "Set-Cookie",
        Cookie.serialize(
          "credentials",
          JSON.stringify(ck.cookie),
          ck.options
        )
      );
      res.json({ redirect: true });
      return;
    }
  }

  res.sendStatus(400);
  res.end();
};
