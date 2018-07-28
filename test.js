const Win = require('./windows-interact.js');


Win.PowerShell(['write-host "TEST"', 'write-host "Line 2"', 'write-host "Line 3"'], result => {
    console.log(result);
}, { id: 'haha', noLog: true });

/* setTimeout(() => {
    Win.PowerShell.newCommand('haha', 'get-process', (output, err) => {
        console.log('NEW DATA HAS ARRIVED: ', output);
    });
    setTimeout(() => {
        Win.PowerShell.newCommand('haha', 'write-host "Okay bye now"');
        Win.PowerShell.endSession('haha');
    }, 2000);
}, 2000); */

/* function unbounce(func, wait, cb) {
	let timeout;
	return function() {
		let context = this, args = arguments;
		let later = function() {
			timeout = null;
			func.apply(context, args);
		}
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	}
}


let test = unbounce(function() {
    console.log('test');
}, 2000);
let i = true;

function tryit() {
    if (i) test();
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
        }, 3000);
    }, 1000);
}, 3000); */