const OnLineUser = require("./schemas/onLineUser");
const UserAccount = require("./schemas/userAccount");
const UserFeedBack = require("./schemas/userFeedBack");
const UserImage = require("./schemas/userImage");
const UserPreference = require("./schemas/userPreference"); 

const schema = {
    UserAccount: UserAccount,
    OnLineUser: OnLineUser,
    UserImage: UserImage,
    UserPreference: UserPreference,
    UserFeedBack: UserFeedBack,
}

module.exports = { schema }