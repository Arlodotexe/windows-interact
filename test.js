const Win = require('./windows-interact.js');


Win.PowerShell(['dir', 'write-host "TEST 3"',  'dir aa'], (result, err) => {
    console.log(err, err.length);
}, { id: 'haha', noLog: true, suppressErrors: true });

/* setTimeout(() => {
    Win.PowerShell.newCommand('haha', 'get-process', (output, err) => {
        console.log('NEW DATA HAS ARRIVED: ', output);
    });
    setTimeout(() => {
        Win.PowerShell.newCommand('haha', 'write-host "Okay bye now"');
        Win.PowerShell.endSession('haha');
    }, 2000);
}, 2000); */

/* function postbounce(func, wait, cb) {
    let timeout;
    return function() {
        let context = this, args = arguments;
        let later = function() {
            cb();
            timeout = null;
        }
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        func.apply(context, args);
    }
}



let i = true;

let t = postbounce(function() {
    console.log('test');
}, 2000, () => {
    console.log('done')
    });
function tryit() {
    if (i) {
        t();
    }
    setTimeout(() => {
        tryit();
    }, 200); 
}
tryit();
setTimeout(() => {
    i = false;
    setTimeout(() => {
        i = true;
        setTimeout(() => {
            i = false
        }, 500);
    }, 500);
}, 500); 
 */