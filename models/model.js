const OnLineUser = require("./onLineUser");
const UserAccount = require("./userAccount");
const UserFeedBack = require("./userFeedBack");
const UserImage = require("./userImage");
const UserPreference = require("./userPreference"); 

const schema = {
    UserAccount: UserAccount,
    OnLineUser: OnLineUser,
    UserImage: UserImage,
    UserPreference: UserPreference,
    UserFeedBack: UserFeedBack,
}

module.exports = { schema }