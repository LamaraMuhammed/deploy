const { mysql } = require("../config/database");
const { psGenerator, comparePsNo } = require("./psGen");


class  PS_NUMBER {
    constructor() {
        this.errMsg = "PS number access failed, please try again.";
        this.dupKey = 'ER_DUP_ENTRY';
        this.errCounter = 0;
    }
    
    // Storing user psNo into the database
    async createUserPSN (arg, cb) {
        this.data = await psGenerator.psNumber();
        if (this.data && arg) {
            this.id = this.data.psId;
            this.psNo = this.data.hashed;
            this.phoneNumber = arg;
            this.userPsNo = this.data.userPsNo;
            this.time = new Date().toDateString() + " " + "-" + " " + new Date().toLocaleTimeString();
    
            return cb({ user_psn: this.userPsNo });
            
            //  Storing userPsNo data
            this.queryString = 'INSERT INTO Ps_Number SET ?';
            this.params = {id: this.id, ps_number: this.psNo, phoneNo: this.phoneNumber, create_at: this.time}
            
            connection.query(this.queryString, [this.params], (err, res) => {
                if (err) {
                    if (err.code === this.dupKey) {
                        this.errCounter = 0;
                        setTimeout(() => {
                            this.repeatInsertion(arg, cb);
                        }, 700);
                        return; 
                    } else {
                        return cb({ psn: this.errMsg }); 
                    }
                }
                
                if (res) {
                    return cb({ user_psn: this.userPsNo});
                }
            });
            
        } else {
            return cb({ psn: this.errMsg });
        }
    }

    // Repeat insertion when id seems to appear twice in db
    async repeatInsertion (arg, cb) {
        this.data = await psGenerator.psNumber();
        if (this.data) {
            this.id = this.data.psId;
            this.psNo = this.data.hashed;
            this.phoneNumber = arg;
            this.userPsNo = this.data.userPsNo;
            this.time = new Date().toDateString() + " " + "-" + " " + new Date().toLocaleTimeString();
            
            this.queryString = 'INSERT INTO Ps_Number SET ?';
            this.params = {id: this.id, ps_number: this.psNo, phoneNo: this.phoneNumber, create_at: this.time}
            
            connection.query(this.queryString, [this.params], (err, res) => {
                if (err) {
                    if (err.code === this.dupKey) {
                        if (this.errCounter <= 3) {
                            setTimeout(() => {
                                this.repeatInsertion(arg, cb);
                                this.errCounter += 1;
                            }, 500);
                            
                        } else {
                            return cb({psn: this.errMsg }); 
                        }

                    } else {
                        return cb({psn: this.errMsg }); 
                    }
                }
                
                if (res) {
                    return cb({user_psn: this.userPsNo}); 
                }
            });
        }
    }

    // logIn session
    checksExistingPsNo(psNo, cb) {
        const ps_number = this.analystPsNo(psNo), sql = "SELECT id, ps_number, phoneNo FROM Ps_Number WHERE id = " + mysql.escape(ps_number.id);  
        connection.query(sql, async (err, result) => {
            if (err) {
                return cb({ phone_no: null });
            }
            if (result) {
                if (result[0]) {
                    let isMatch = await comparePsNo(ps_number.psNo, result[0].ps_number);
                    return cb({ phone_no: isMatch ? result[0].phoneNo : null });

                } else {
                    return cb({ phone_no: null });
                } 
            }
        });       
    }

    analystPsNo(psNo) {
        this.params = psNo.split(process.env.SIGN);
        this.paramsOne = this.params[0].toString();
        this.paramsTwo = this.params[1].toString();
        this.full_psNo = psNo.replace(process.env.SIGN, process.env.ALGO);
        
        if (this.paramsOne.length === 3) {
            return {id: this.paramsOne, psNo: this.full_psNo} 
            
        } else if (this.paramsTwo.length === 3) {
            return {id: this.paramsTwo, psNo: this.full_psNo}
            
        }
    }
}

const PSN = new PS_NUMBER();

async function createPsn(psn, cb) {
    await PSN.createUserPSN(psn, cb);
}

function psnLogin(psn, cb) {
    PSN.checksExistingPsNo(psn, cb);
}


module.exports = { psnLogin, createPsn }
