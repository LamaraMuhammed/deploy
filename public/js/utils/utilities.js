export const utils = {
    num_rex: /^[0-9]+$/,
    validateSIMCode: function(val) {
        if ((val.startsWith('07') || val.startsWith('08') || val.startsWith('09')) && val.match(this.num_rex)) {
            return '+0'
        } else if ((val.startsWith('7') || val.startsWith('8') || val.startsWith('9')) && val.match(this.num_rex)) {
            return '-0'
        } 
    },

    validateLength: function(val) {
        if (this.validateSIMCode(val) === '+0' && val.length === 11) {
            return val;
        } else if (this.validateSIMCode(val) === '-0' && val.length === 10) {
            return val;
        }
    },

    validateLengthOnKeyUp: function(val) {
        if (this.validateSIMCode(val) === '+0' && val.length <= 11) {
            return val;
        } else if (this.validateSIMCode(val) === '-0' && val.length <= 10) {
            return val;
        }
    },

    isReal: function(val) {
        let numCountZeroes = {}, maxiZeroes = [], numCount = {}, maxi = [];
        
        for (var char of val) {
            if (char === '0') {
                numCountZeroes[char] = (numCountZeroes[char] || 0) + 1;
                maxiZeroes.push(numCountZeroes[char]);
    
            } else {
                numCount[char] = (numCount[char] || 0) + 1;
                maxi.push(numCount[char]);
            }
        }
        return Math.max(...maxi) <= 5 && Math.max(...maxiZeroes) <= 6;
    },

    punctuation: function(item) {
        var punctuation_less = item.match(/[.,\/|'"?><``\\@#!$%\^&\*;:{}=\-_`~()]/gi);
        if (punctuation_less) return { exception: punctuation_less.toString() }
    },

    isPSN(val) {
        const hasPunctuation = /[.,\/|'"?><``\\+@#!$%\^&\*;:{}=\_`~()]/gi;
        const hasSpace = /\s{1,}/g;
        const requiredQuant = 9;
        const requiredChar = '-';
        var punctuationLess = hasPunctuation.test(val);
        var spaceLess = hasSpace.test(val);
        
        if (!punctuationLess) {
            if (val.includes(requiredChar) && val.indexOf(requiredChar) === 3 || 
                val.includes(requiredChar) && val.indexOf(requiredChar) === 5) {
                if (val.length <= requiredQuant && !spaceLess) {
                    return val;
                }
            }
        } 
    },

    enc: function (n) {
        const e = { 0: "0a", 1: "iA2", 2: "mD0", 3: "33f" };
        return e[n];
    },
    
    dec: function (n) {
        const d = { "0a": 0, "iA2": 1, "mD0": 2, "33f": 3 };
        return d[n];
    },

}








