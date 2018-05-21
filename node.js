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


System.confirm('I am groot?', (bool)=>{
    if(bool) System.alert('I am groot!');
});