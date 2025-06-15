const { inversion } = require('../utils/inversion');
const {schema} = require('../models/model');


const disconnect = async (id, socket, send) => {
    // BROWSER REFRESH
    if (socket && socket.id) {
        const disconnection = await schema.OnLineUser.findOne({ id: socket.id });
        if (disconnection) {
            disconnection.connectedRoutes.forEach(async (v, k) => {
                try {
                    if (k) {
                        const conn_friends = await schema.OnLineUser.findOne({ phone_number: k });

                        if (conn_friends && conn_friends.connectedRoutes.get(disconnection.phone_number)) {
                            conn_friends.connectedRoutes.delete(disconnection.phone_number);
                            await conn_friends.save();

                            send(conn_friends.id, "disconnect_res", {
                              req: inversion.encrypt(disconnection.phone_number),
                            });
                        }
                    }
                } catch (err) {
                    return false;
                }
            });

            disconnection.connectedRoutes.clear();
            disconnection.outrage = new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();
            disconnection.online = "OFF";
            await disconnection.save();
        }

    // INTENDED DISCONNECTION
    } else if (socket && socket.disconnect_id) {
        try {
            const sender_id = await schema.OnLineUser.findOne({
              phone_number: socket.sender_id,
            });
            const confirm_id = await schema.OnLineUser.findOne({ id: socket.disconnect_id });

            if (confirm_id) {
                confirm_id.connectedRoutes.delete(socket.sender_id);
                await confirm_id.save();
                send(socket.disconnect_id, 'disconnect_res', { req: inversion.encrypt(socket.sender_id) });
            }

            sender_id.connectedRoutes.delete(socket.disconnect_id);
            await sender_id.save();
            send(id, 'disconnect_res', { res: true });
            
        } catch (err) {
            return;
        }
    }
}

module.exports.processDisconnectedUser = disconnect;
