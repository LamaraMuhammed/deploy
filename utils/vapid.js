const mail = "mailto:lamaramuhammed6@gmail.com";
const pub_key = process.env.VAPID_PUBLIC_KEY;
const priv_key = process.env.VAPID_PRIVATE_KEY;

const vapid = {
    mail,
    pub_key,
    priv_key
}

module.exports = vapid;