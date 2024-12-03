console.log("active");  
y = new Promise((resolve) => {
    chrome.storage.local.get(["on"], function (output) {
        x = output.on;
        if (x === undefined) {
            resolve(true);
        }
        if (x) {
            resolve(true);
        } else {
            resolve(false);
        }
    });
});
if (y) {
    addCode();
}
async function addCode() {
    console.log("adding");
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL('Stop.js');
    //script.onload = function() {this.remove();};
    document.body.appendChild(script);
    console.log(script);
    /*let [tab] = await chrome.tabs.query({active:true,currentWindow:true});
    await chrome.scripting.executeScript({
        target: {tabId : tab.id},
        files : ["Stop.js"]
    })*/
}