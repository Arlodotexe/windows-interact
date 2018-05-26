const System = require('./windows-interact.js');

System.set.preferences({
    authCodeParse: function(receivedCode) {
        if (receivedCode > 5) {
            //System.alert('Correct code: ' + receivedCode)
            return true;
        }
        else {
            //System.alert('Incorrect code: ' + receivedCode)
            return false;
        }
    },
    masterKey: 'I like lasagna'
});

setTimeout(() => {
    System.window.minimize()
    setTimeout(() => {
        System.window.maximize('Code');
    }, 2000);
}, 2000);