//create button
let check = document.getElementById("onOff");
//set switch at open
new Promise(() => {
    chrome.storage.local.get(["on"], function (output) {
        x = output.on;
        if (x === undefined) {
            check.checked = true;
        } else {
            check.checked = x;
        }
    });
});

//listen for switch flick
check.addEventListener("change", function() {
    if (check.checked) {
        chrome.local.storage.set({"on":true});
    } else {
        chrome.local.storage.set({"on":false});
    }
});