 



const XYZ = {
    get: function(k, mode = "enc") {
        if (mode === "enc") {
            return JSON.parse(process.env.ENC)[k];
        } else if (mode === "dec") {
            return JSON.parse(process.env.DEC)[k];
        }
    },
    
    funcE: function (n) {
        let enc = "";
        for (let index = 0; index < n.length; index++) {
            enc += this.get(n[index]);

            switch ((index % 3)) {
                case 3:
                    enc += 'k';
                    break;
                case 2:
                    enc += '-';
                    break;
                case 1:
                    enc += 'l';
                    break;
                default:
                    enc += 'K';
                    break;
            }
        }
        
        return enc.slice(0, enc.length - 1);
    },
    
    funcD: function (n) {
        for (let index = 0; index < 11; index++) {
          switch (index % 3) {
            case 3:
              n = toString(n, "k");
              break;
            case 2:
              n = toString(n, "-");
              break;
            case 1:
              n = toString(n, "l");
              break;
            default:
              n = toString(n, "K");
              break;
            }
        }
        
        function toString(x, y) {
            return x.split(y).toString().replaceAll(",", "-");
        }

        return n;
    },

    funcDF(n) {
        let dec = '';
        n = this.funcD(n)
        n = n.split(process.env.SIGN);

        for (let index = 0; index < n.length; index++) {
            if (n[index] !== process.env.SIGN) {
                dec += this.get(n[index], "dec");
            }
        }

        return dec;
    },
    
}

const inversion = {
    encrypt: function (n) {
        if (n) { return XYZ.funcE(n) };
    },
    
    decrypt: function (n) {
        if (n) { return XYZ.funcDF(n) };
    },
}

module.exports = {
    inversion
}