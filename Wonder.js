y = new Promise((resolve) => {
    chrome.storage.local.get(["on"], function (output) {
        x = output.on;
        if (x === undefined) {
            resolve(true);
        }
        resolve(x);
    });
});
if (y) {
    addCode;
}
function addCode() {
    addEventListener("beforeunload", (event) => {
        event.preventDefault();
    })
}