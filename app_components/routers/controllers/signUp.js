const Cookie = require("cookie");
const bcrypt = require("bcrypt");

const { schema } = require("../../models/model");
const { inspect } = require("../../utils/checkPoint");
const { createPsn } = require("../../utils/psn");

module.exports = async function SignUp(req, res) {
  const data = req.body;
  const len = Object.keys(data).length;

  if (data && len === 6) {   
    await createPsn(data.phoneNo, async (msg) => {
      if (!msg.user_psn) {
        res.json({ err: msg.psn });
        return;
      }

      const ck = inspect.createCookie();
      try {
        //  Storing User data
        const pwd = await bcrypt.hash(data.password, 12); // Hashing the password.....
        const userData = await schema.UserAccount.create({
          id_token: ck.cookie._c,
          first_Name: data.firstName,
          last_Name: data.lastName,
          phone_number: data.phoneNo,
          password: pwd,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
        });

        // Tied the relationship
        schema.UserImage.create({ img_id: data.phoneNo });
        let pref = await schema.UserPreference.create({
          phone_number: data.phoneNo,
        });
        await schema.OnLineUser.create({
          phone_number: data.phoneNo,
          register: userData._id,
          preference: pref._id,
        });

        res.setHeader(
          "Set-Cookie",
          Cookie.serialize(
            "credentials",
            JSON.stringify(ck.cookie),
            ck.options
          )
        );

        res.json({ userPsNo: msg.user_psn });
        return;
        
      } catch (err) {
        res.json({
          err: "User details processing failed, please try again.",
        });
        return;
      }
    });
    return;
  }

  res.json({ err: "User details submitting error!" });
  res.end();
};
