const { schema } = require("../../models/model");

module.exports = async function checkUser(req, res) {
    const data = req.body;
    
    if (Object.keys(data).length > 0 && data.phone_no) {
        const duplicate = await schema.UserAccount.findOne({ phone_number: data.phone_no });
        
        if (duplicate) res.json({dup: 'This number already registered!'});
        if (!duplicate) res.json({ new: true });
        return;
    }

    res.status(400);
    res.end();
}