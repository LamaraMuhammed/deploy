
const { v4 } = require("node-uuid");
const bcrypt = require("bcrypt");

const psGenerator = {
    createPsNo: function() {
        this.generatedPsNumber = v4().substring(0, 8);
        this.psIdChoice_1 = this.generatedPsNumber.slice(0, 3);
        this.psIdChoice_2 = this.generatedPsNumber.slice(5, 8);
        this.store = [];

        this.store.push(this.psIdChoice_1, this.psIdChoice_2);
        this.chosenPsNo = this.store[(Math.floor(Math.random() * this.store.length))]; // selecting the id of the psNo
        if (this.store.indexOf(this.chosenPsNo) === 0) {
            return {index: 0, psId: this.psIdChoice_1, psNo: this.generatedPsNumber.slice(3, 8), toHash: this.generatedPsNumber};

        } else if (this.store.indexOf(this.chosenPsNo) === 1) {
            return {index: 1, psId: this.psIdChoice_2, psNo: this.generatedPsNumber.slice(0, 5), toHash: this.generatedPsNumber};
        }
    },

    psNumber: async function() {
       const generatedPsNo = this.createPsNo();
        if (generatedPsNo.index === 0) {
            // Creating a hand-copy of psNumber that will send to user
            this.userPsNo = `${generatedPsNo.psId}${process.env.SIGN}${generatedPsNo.psNo}`;
            this.toHash = generatedPsNo.psId + process.env.ALGO + generatedPsNo.psNo;
            
            // Hashing the psNo
            this.hashed = await bcrypt.hash(this.toHash, 12);
            
            return {psId: generatedPsNo.psId, hashed: this.hashed, userPsNo: this.userPsNo};
            
        } else if (generatedPsNo.index === 1) {
            // Creating a hand-copy of psNumber that will send to user
            this.userPsNo = `${generatedPsNo.psNo}${process.env.SIGN}${generatedPsNo.psId}`;
            this.toHash = generatedPsNo.psNo + process.env.ALGO + generatedPsNo.psId;
            
            // Hashing the psNo
            this.hashed = await bcrypt.hash(this.toHash, 12);
            
            return {psId: generatedPsNo.psId, hashed: this.hashed, userPsNo: this.userPsNo};
        }
    }
}

const comparePsNo = async (receivedPsNo, retrievedPsNo) => {
    const isMatch = await bcrypt.compare(receivedPsNo, retrievedPsNo);
    return isMatch;
}

module.exports = {
    psGenerator,
    comparePsNo
}
