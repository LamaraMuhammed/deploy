const {schema} = require('../models/model');
const { sanitizeMe } = require('../public/js/regexInputValues');
const { PSN, eEmitter } = require('../models/PsNumber');
const psn = new PSN();   // Checking the Existing psNo in db 7fa-1faa7

var isPermit, remoteUser, tripData;

const psNo_connection = async (myId, phoneNumber, message, callback) => {
    if (message.value[0], message.value[1]) {
        const realPsNo = sanitizeMe(message.value[1]); // Checking the psNo before passing 
        if (realPsNo) {
            psn.checksExistingPsNo(realPsNo);
            eEmitter.once("access-info", async (msg) => {
                if (msg.status && msg.phone_no) {
                    if (msg.phone_no !== phoneNumber) {
                        try {
                            isPermit = await userPreference.findOne({ phone_no: msg.phone_no });
                        } catch (err) {
                            callback(myId, 'warning', 'Something went wrong');
                        }
                        if (isPermit) {
                            if (isPermit.closeWatch_1[1] === phoneNumber || isPermit.closeWatch_2[1] === phoneNumber ||
                                isPermit.closeWatch_3[1] === phoneNumber || isPermit.closeWatch_4[1] === phoneNumber) {
                                try {
                                    remoteUser = await joinedUsers.findOne({ phone_no: msg.phone_no });
                                } catch(err) {
                                    callback(myId, 'warning', 'Something went wrong.');
                                }

                                if (remoteUser) {
                                    if (remoteUser.connectedFriendRouteOne !== phoneNumber &&
                                        remoteUser.connectedFriendRouteTwo !== phoneNumber &&
                                        remoteUser.connectedFriendRouteThree !== phoneNumber
                                    ) {
                                        if (remoteUser.online) {
                                            callback(remoteUser.id, '$ps-req', {req_route: message.value[0], req_id: myId});
                                            
                                        } else {
                                            try {
                                                tripData = await userTrip.findOne({ phone_no: msg.phone_no });
                                            } catch(err) {
                                                callback(myId, 'warning', 'Something went wrong.');
                                            }

                                            if (tripData) {
                                                callback(myId, 'ps-remote-trip', {eventDate: tripData.eventDate, data: tripData.data});
                                                
                                            } else {
                                                callback(myId, 'warning', 'Result not found.');
                                            }
                                        }
    
                                    } else {
                                        callback(myId, 'warning', "You're connected.");
                                    }

                                } else {
                                    callback(myId, 'warning', 'Result not found.');
                                }

                            } else {
                                callback(myId, 'warning', "Close watch not authorized.");
                            }

                        } else {
                            callback(myId, 'warning', 'Result not found.');
                        }
                        
                    } else {
                        callback(myId, 'warning', "Try someone's PS Number.");
                    }

                } else {
                    callback(myId, 'warning', 'Invalid PS Number.');
                }
            }); 
            
        } else {
            callback(myId, 'warning', 'Invalid PS Number.');
        }
    } else {
        callback(myId, 'warning', 'Something went wrong.');
    }
}


module.exports.psNo_connection = psNo_connection;
