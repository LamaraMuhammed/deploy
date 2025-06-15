const { schema } = require("../models/model");

let watcher, watcher_name, sender, content, edited_watcher;
async function processCloseWatch(myId, phoneNumber, userName, msg, callback) {
    if (msg.number) {
        try{
            watcher = await schema.OnLineUser.findOne({phone_number: msg.number})
            .populate("register", "first_Name")
            .exec();
            sender = await schema.UserPreference.findOne({phone_number: phoneNumber});
        } catch(err) {
            callback(myId, "clw-info", "BE_ERR: Something went wrong.");
        }

        watcher_name = watcher && watcher.phone_number === phoneNumber ? 'You' : 
        watcher && watcher.phone_number !== phoneNumber ? watcher.register.first_Name : null;
        if (msg.mode !== "delete") {
            if (msg.mode === "Edit" && msg.edited_watcher) {
                edited_watcher = await schema.OnLineUser.findOne({phone_number: msg.edited_watcher})
                if (edited_watcher) {del_Watcher(edited_watcher);}
                if (sender.close_watch.watchers.get(msg.edited_watcher)) {sender.close_watch.watchers.delete(msg.edited_watcher);}
            }

            if (msg.mode === "Add" && sender.close_watch.watchers.get(msg.number)) {sender.close_watch.watchers.delete(msg.number);}
            sender.close_watch.watchers.set(msg.number, 
                {phone_number: msg.number, name: watcher_name, action: null}
            );
    
            if (sender.close_watch.watchers.size <= 4) {
                await sender.save(); // Save the Watcher
                if (watcher_name) {await inform_watcher();}
                
            } else {
                callback(myId, "clw-info", "Full list!");
            }

        } else if (msg.mode === "delete") {
            if (!watcher) {del_clw();}
            if (watcher) {
                del_clw();
                del_Watcher(watcher);
            }
        }

        async function inform_watcher() {
            // Send back the name to sender
            callback(myId, "clw-info", { index: msg.index, watcher_name: watcher_name });
                    
            // Again notify the watcher been added that sender added him on close_watch
            content = {clw: true, name: userName, phone_number: phoneNumber};
            if (watcher.online) {callback(watcher.id, "notification", content);}
            watcher.notification.push(content);
            try {
                await watcher.save();
                
            } catch (err) {
                console.log("Close Watch Saving Error", err?.message);
                return;
            }
        }
    
        async function del_clw() {
            sender.close_watch.watchers.forEach((val, kie) => {
                if (val.phone_number === msg.number) {
                    sender.close_watch.watchers.delete(kie);
                }
            });
            await sender.save(); 
        }

        async function del_Watcher(_watcher) {
            _watcher.notification.forEach((ele) => {
                if (ele[0].phone_number === phoneNumber) {
                    _watcher.notification = _watcher.notification.filter(x => x[0] !== ele[0]);
                }
            });
            await _watcher.save();
            if (_watcher.online) callback(_watcher.id, "notification", {clw: false, name: userName, phone_number: phoneNumber});
        }
    }
}


module.exports.processCloseWatch = processCloseWatch;