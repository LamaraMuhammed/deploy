import { utils } from "../utils/utilities.js";

var dupResponseCount = 0, errResponseCount = 0;

const logger = new LOGGER();

(function(){logger.homePage();})();

logger.listen(logger.signUpInput, () => chooseKey_u(), "keyup");

logger.listen(logger.phnField, () => chooseKey_i(), "keyup");

logger.listen(logger.pwdField, () => choosePwdKey(), "keyup");

logger.listen(logger.submitBtn, (e) => acceptInput(e));

logger.listen(logger.prevInput, () => reverseLog());

function chooseKey_u() {
    if (!logger.signUpInput.value) logger.signUpInput.style.border = '';
    if (logger.route() === 'nm') {
        if (!utils.punctuation(logger.signUpInput.value) && logger.signUpInput.value.length >= 3) {
            logger.signUpHint('', '');  // clear
            logger.enabledSubmitBtn();
        } else {
            logger.disabledSubmitBtn();
        }
    }

    if (logger.route() === "phn") {
        if (utils.validateLengthOnKeyUp(logger.signUpInput.value)) {
            logger.signUpHint('', '');
            logger.enabledSubmitBtn();

        } else {
            logger.disabledSubmitBtn();
            logger.signUpInput.style.border = '2px solid red';
        }
    }

    if (logger.route() === 'pwd') {
        if (logger.signUpInput.value.length >= 6) {
            logger.enabledSubmitBtn();
            logger.signUpHint(
                logger.signUpInput.value.length > 6 ? 'password: strong' : 'password: okay', 
                '#0000ffb9'
            );

        } else {
            logger.signUpHint('minimum 6 characters', '');  // clear
            logger.disabledSubmitBtn();
        }
    }

    if (logger.route() === 'dob') {
        let _dob = /^[0-9/-\s{1,}]+$/.test(logger.signUpInput.value),
            newDoB = formatDoB(logger.signUpInput.value.replace(/\s{1,}/g, ''));
        if (_dob) {
            logger.signUpInput.style.border = '';
            if (newDoB) {
                logger.signUpInput.value = newDoB;
                logger.enabledSubmitBtn();
            } 
        }

        if (!_dob || !newDoB) {
            logger.disabledSubmitBtn();
            logger.signUpInput.style.border = '2px solid red';
        }
    }
}

function chooseKey_i() {
    if (!logger.phnField.value) logger.phnField.style.border = ''; logger.swapText(logger.hint_i, '');
    if (utils.validateLengthOnKeyUp(logger.phnField.value)) {
        logger.phnField.style.border = '2px solid #00cc00';
        if (logger.phnField.value && logger.pwdField.value) {
            logger.addCls(logger.submitBtn, 'acceptClick');
            logger.submitBtn.value = 'Login';
        }
        
    } else {
        if (utils.isPSN(logger.phnField.value)) {
            logger.phnField.style.border = '2px solid #00cc00';
            logger.hint_i.style.color = '#0000ff';
            logger.swapText(logger.hint_i, 'PSN');
            logger.addCls(logger.submitBtn, 'acceptClick');
            logger.submitBtn.value = 'PSN Login';
            logger.pwdField.setAttribute('disabled', true);
            logger.setVal('ps');
            
        } else {
            logger.pwdField.removeAttribute('disabled');
            logger.rmCls(logger.submitBtn, 'acceptClick');
            if (logger.phnField.value) logger.phnField.style.border = '2px solid red';
            if (logger.mp.has('ps')) logger.mp.delete('ps');
            logger.submitBtn.value = 'Start';
        }
    }
}

function choosePwdKey() {
    if (!logger.pwdField.value) logger.pwdField.style.border = ''; logger.swapText(logger.pwd_hint, '');
    if (logger.pwdField.value.length >= 6) {
        logger.pwdField.style.border = '2px solid #00cc00';
        if (logger.phnField.value && logger.pwdField.value) {
            logger.addCls(logger.submitBtn, 'acceptClick');
            logger.submitBtn.value = 'Login';
        }
        
    } else {
        logger.rmCls(logger.submitBtn, 'acceptClick');
        logger.pwdField.style.border = '';
        logger.submitBtn.value = 'Start';
    }
}

function acceptInput(e) {
    if (logger.is('sign-up')) {
        if (logger.signUpInput.value && e.target.classList[1]) {
            if (logger.route() === 'nm') {
                let val = logger.signUpInput.value.split(" ");
                let firstName = val[0], others = val[2], lastName = val[1];

                if (val.length >= 3) {
                  if (lastName.length < 3) {
                    lastName = others;
                    others = val[1];
                  }
                }

                if (lastName && isReadable(firstName) && isReadable(lastName)) {
                    logger.nextInput("Phone Number", "phn");
                    firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
                    lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
                    logger.setVal('nm', { firstName: firstName, lastName: lastName});

                    if (others) {
                        logger.setVal("nm", {
                          firstName: firstName,
                          lastName:
                            val[1].charAt(0).toUpperCase() +
                            val[1].slice(1) +
                            " " +
                            val[2].charAt(0).toUpperCase() +
                            val[2].slice(1),
                        });
                    }
                }

                if (!lastName || !isReadable(firstName) || !isReadable(lastName)) {
                    logger.signUpInputErr('surname ?');

                    if (firstName && !isReadable(firstName) || 
                    lastName && !isReadable(lastName)) logger.swapText(logger.hint_u, 'unreadable name');
                }
                
            } else if (logger.route() === 'phn') {
                if (utils.validateLength(logger.signUpInput.value)) {
                    if (utils.isReal(logger.signUpInput.value)) {
                        // check the existence of the number in db
                        checkExistence({ 'check': true, 'phone_no': logger.signUpInput.value });
                    } else {
                        logger.signUpInputErr('seems not real');
                    }
                   
                } else {
                    logger.signUpInput.style.border = '2px solid red';
                }
            } else if (logger.route() === 'pwd') {
                logger.nextInput('Date of Birth', 'dob');
                
            } else if (logger.route() === 'dob') {
                logger.nextInput('Gender', 'sex');
            
            } else if (logger.route() === 'sex') {
                // submit
                logger.nextInput();
                submit({
                    firstName: logger.getVal('nm').firstName,
                    lastName: logger.getVal('nm').lastName,
                    phoneNo: logger.getVal('phn').phn,
                    password: logger.getVal('pwd').pwd,
                    dateOfBirth: logger.getVal('dob').dob,
                    gender: logger.getVal('sex').sex
                });
            } 
            if (logger.signUpInput.style.border !== "2px solid red") logger.disabledSubmitBtn();
        }

    } else if (logger.is('sign-in')) {
        const ps = logger.getVal('ps');
        if (logger.phnField.value && logger.pwdField.value && e.target.classList[1] || ps && e.target.classList[1]) {
            if (!ps) {
                const len = utils.validateLength(logger.phnField.value);
                const isReal = utils.isReal(logger.phnField.value);
    
                if (len) {
                    if (isReal) {
                        logger.phnField.style.border = '2px solid #00cc00';
                        
                        if (logger.pwdField.value.length >= 6) {
                            logger.pwdField.style.border = '2px solid #00cc00';
                            
                            logger.setVal('login', {'phn': logger.phnField.value, 'pwd': logger.pwdField.value});
                            userLog({'phn': logger.phnField.value, 'pwd': logger.pwdField.value});
                        }
                        
                    } else {
                        logger.disabledLoginBtn('seems not real', null);
                    }
                   
                } else {
                    logger.disabledLoginBtn('incomplete', null);
                }
            } else {
                userLog({psn: logger.phnField.value});
                logger.mp.delete('ps');
            }
        }
    }
}

function formatDoB(dob) {
    if (dob.length === 10) {
        let a = dob.split('/'), b = dob.split('-'), newDoB, d, m, y;
        newDoB = a.length === 3 ? a : b.length === 3 ? b : null;
        if (newDoB) {
            if (newDoB[2].length === 4) {
                d = parseInt(newDoB[0]); m = parseInt(newDoB[1]); y = parseInt(newDoB[2]);
                if (d > 0 && d <= 31 && m > 0 && m <= 12 && y > 1855 && y <= 2022) {
                    logger.hint_u.style.color = '#0000ff';
                    logger.swapText(logger.hint_u, (`age: ${(new Date().getFullYear() - y)}`))
                    return `${d} - ${m} - ${y}`
                }
            }
        }
    }
}

function isReadable(val) {
    if (val && val.length >= 3) {
        let vowel = val.match(/[AIOUEaioue]+/g), num = val.match(/[0-9]+/g),
            consonant = val.match(/[BCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz]+/g);
        if (vowel && consonant && !num) return true;
    }
}

function reverseLog() { 
    if (logger.prevInput.classList[1] && logger.is('sign-up')) {
        let route = logger.route();
        if(route === 'phn') {
            logger.nextInput("Full Name", "nm", 'reverse');
            doLater(()=>logger.rmCls(logger.prevInput, 'do'), 1000);
            
        } else if (route === 'pwd') {
            logger.nextInput("Phone Number", "phn", 'reverse');
            
        } else if (route === 'dob') {
            logger.nextInput("Password", "pwd", 'reverse');
            
        } else if (route === 'sex') {
            logger.nextInput("Date of Birth", "dob", 'reverse');
        }
    }
}

function submit(dt) {
    fetch('/Logs/up', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(dt)
    })
    .then((res) => res?.json())
    .then(result => {
        if (result.userPsNo) {
            formSubmitted(result.userPsNo);

        } else {
            logger.warn(result.err);
        }
    })
    .catch((err) => {
        logger.warn(`BE_ERR: Something went wrong please try again.`);
        return;
    });

    logger.mp.clear();
}

function formSubmitted(ps) {
    logger.addCls(logger.suc_pop, "pop");
    doLater(() => {
        logger.addCls(logger.suc_pop, "submitted");
        logger.header.style.color = '#00a000';
        logger.swapText(logger.header, "Account Created!");
        logger.note.style.color = '';
        logger.swapText(logger.note, "Below is your <b>PSN</b> don't let it known save it.");
        logger.swapText(logger.psn, ps);
        logger.listen(logger.copyBtn, ()=>doCopy());
    }, 500);
}

function doCopy() {
    if (copy()) {
        doLater(() => {
            logger.signInPage();
            logger.mp.delete('sign-up');
        }, 2700);
    } else {
        logger.err_copy();
    }
}

function copy() {
    const text = logger.psn.innerText;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
        logger.copyBtn.value = "Copied!";
        logger.copyBtn.style.color = "#02fa02";
        return true;
    } else {
        return false;
    }
}

function checkExistence(data) {
    fetch('/Logs/check', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
    .then((res) => res?.json())
    .then(result => {
        if (result.new) {logger.nextInput("Password", "pwd"); dupResponseCount = 0};
        if (result.dup) {
            if (dupResponseCount === 2) {
                logger.signInPage();
                logger.signUpHint('', '');

            } else {
                logger.signUpInputErr(result.dup);
            }

            dupResponseCount++;
        }
    })
        .catch((err) => {
        console.log(err)
        logger.warn(`Something went wrong please try again.`);
        return;
    });

}

function userLog(data) {
    fetch('/Logs/in', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
    .then((res) => res.json())
    .then(result => {
        if (result.permit) {
            localStorage.setItem('gG_a', JSON.stringify(result.id));
            doLater(() => window.location.href = '/Home', 500);
    
        } else if (result.dup) {
            logger.doubleDvcLog(concord);
    
        } else if (result.psErr) {
            logger.warn(result.psErr);
            errResponseCount++;
            
        } else if (result.err) {
            logger.warn(result.err);
            errResponseCount++;
        } 
    
        if (errResponseCount === 3) logger.warn("You attempted three times and you will be stopped for next double error trials");
        if (errResponseCount === 5) {
            localStorage.setItem('pause-login-time', new Date())
            doLater(() => window.location.href = '/Logs', 500);
        }
    
    })
    .catch((err) => {
        logger.warn(`Something Went Wrong Please Try Again`);
    });

    replaceFields();
}

function concord(res) {
    var data = {
        phn: logger.getVal('login').phn,
        pwd: logger.getVal('login').pwd,
        respond: res
    }

    fetch('/Logs/consent', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
    .then((res) => res?.json())
    .then(result => {
        if (result.permit) {
            localStorage.setItem("gG_a", JSON.stringify(result.id));
            doLater(() => (window.location.href = "/Home"), 500);
            logger.rmCls(logger.dup_pop, "dup");
            logger.mp.delete('login');

        } else {
            logger.signInPage();
        }
    })
    .catch((err) => {
        logger.warn(`Something went wrong`);
    });
}

function replaceFields() {
    logger.phnField.style.border = '';
    logger.pwdField.style.border = '';
    logger.phnField.value = '';
    logger.pwdField.value = '';
    logger.swapText(logger.hint_i, '');
    logger.swapText(logger.pwd_hint, '');
    logger.disabledLoginBtn();
}
