const header = 'disconnect';
const get = (k) => JSON.parse(process.env.DEC)[k];

const forward = (msg, callback) => {
    if (msg.route === get("0a")) {
        if (msg.header) { 
            callback(msg.id, 'G01-cords', {
                header: header,
                lat: "",
                lng: ""
            });
            return;
        } 

        if (msg.data.ids) callback(msg.id, 'G01-img', msg.data);    
        if (msg.data.coords) callback(msg.id, "G01-cords", msg.data);

    } else if (msg.route === get("iA2")) {
        if (msg.header) {
          callback(msg.id, "G02-cords", {
            header: header,
            lat: "",
            lng: "",
          });
          return;
        }

        if (msg.data.ids) callback(msg.id, "G02-img", msg.data);
        if (msg.data.coords) callback(msg.id, "G02-cords", msg.data);

    } else if (msg.route === get("mD0")) {
        if (msg.header) {
          callback(msg.id, "G03-cords", {
            header: header,
            lat: "",
            lng: "",
          });
          return;
        }

        if (msg.data.ids) callback(msg.id, "G03-img", msg.data);
        if (msg.data.coords) callback(msg.id, "G03-cords", msg.data);
    }
}


module.exports.forward = forward;
