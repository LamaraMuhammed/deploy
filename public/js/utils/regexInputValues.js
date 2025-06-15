
function sanitizeMe(val) {
    if (val && val.length !== 9) { return null; }

    const hasPunctuation = /[.,\/|'"?><``\\+@#!$%\^&\*;:{}=\_`~()]/gi;
    const hasSpace = /\s{1,}/g;
    const requiredQuant = 9;
    const requiredChar = '-';
    var punctuationLess = hasPunctuation.test(val);
    var spaceLess = hasSpace.test(val);
    
    if (!punctuationLess) {
        if (val.includes(requiredChar) && val.indexOf(requiredChar) === 3 || 
            val.includes(requiredChar) && val.indexOf(requiredChar) === 5) {
            if (val.length === requiredQuant && !spaceLess) {
                return val;
            }
        }
    } 
}

module.exports = {
    sanitizeMe
}