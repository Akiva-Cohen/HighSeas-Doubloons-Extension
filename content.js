//checks if button checked
new Promise((resolve) => {
    chrome.storage.local.get(["on"], function (output) {
        x = output.on;
        if (x || x === undefined) {
            runCode();
        }
    });
});

function runCode() {
    const isThisShipyard = () => window.location.href.includes("shipyard");
    const pointsToVotes = (points) => Math.round(((points - 0.5) * 10) / 24.5);
    /**@type {HTMLHeadingElement} */
    let shippedShipsHeader = null;
    
    let lastLoadState = false;

    let loaderInterval = setInterval(() => {
        if (!isThisShipyard()) return;

        shippedShipsHeader = [...document.querySelectorAll("h2").values()]?.filter(el => el?.textContent === "Shipped Ships")?.[0];
        if (shippedShipsHeader) {
            if (!lastLoadState) {
                lastLoadState = true;
                runCode();
            } else if ([...document?.querySelectorAll('[id^="shipped-ship-"]:has(button)')].map(el => el?.querySelector(".flex-grow > div").children.length <= 2).includes(true)) {
                runCode();
            }
        } else {
            shippedShipsHeader = null;
            lastLoadState = false;
        }
    }, 1000);
    const HTML_CONTENT = (averagePerHour, averagePerProject) => `
    <div id="hs-ext-features" class="rounded-lg bg-card text-card-foreground shadow-sm bg-blend-color-burn flex flex-col sm:gap-2 sm:flex-row items-start sm:items-center p-4 hover:bg-gray-100 transition-colors duration-200" style="background-size: 10rem 100%;background-repeat: repeat-x;background-color: rgba(255, 255, 255, 0.94);">
    <p id="hs-ext-title">HighSeas Doubloons Extension</p>
    <div class="flex flex-wrap items-start gap-3 text-sm items-center">
    <span class="mr-2 text-xl font-semibold">Average: </span>
        <span class="inline-flex items-center gap-1 rounded-full px-2 border text-sm leading-none text-green-600 bg-green-50 border-green-500/10 " style="vertical-align: middle;">
            <img alt="doubloons" loading="lazy" width="16" height="20" decoding="async" data-nimg="1" src="/_next/static/media/doubloon.fd63888b.svg" style="color: transparent;">
            <span class="inline-block py-1">${averagePerHour?.toFixed(2)} / hour</span>
        </span>
        <span class="inline-flex items-center gap-1 rounded-full px-2 border text-sm leading-none text-green-600 bg-green-50 border-green-500/10 " style="vertical-align: middle;">
            <img alt="doubloons" loading="lazy" width="16" height="20" decoding="async" data-nimg="1" src="/_next/static/media/doubloon.fd63888b.svg" style="color: transparent;">
            <span class="inline-block py-1">${averagePerProject?.toFixed(2)} / project</span>
        </span>
        <span class="inline-flex items-center gap-1 rounded-full px-2 border text-sm leading-none text-green-600 bg-green-50 border-green-500/10 " style="vertical-align: middle;">
            ${SVG_VOTES_ICON}
            <span class="inline-block py-1">~${pointsToVotes(averagePerHour)} votes / project</span>
        </span>
    </div>
</div>

<style>
    #hs-ext-features {
        position: relative;
        padding-top: 30px;
        padding-bottom: 10px;
    }
    #hs-ext-title {
        position: absolute;
        top: 6px;
        left: 10px;
        font-family: var(--font-main), serif, cursive;
        font-size: 12.5px;
        font-weight: 200;
        color: #e5bf36;
    }
</style>
`;
const SVG_VOTES_ICON = `<svg fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414" preserveAspectRatio="xMidYMid meet" fill="currentColor" width="18" height="18" style="display: inline-block; vertical-align: middle;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zm64 192c17.7 0 32 14.3 32 32l0 96c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-96c0-17.7 14.3-32 32-32zm64-64c0-17.7 14.3-32 32-32s32 14.3 32 32l0 192c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-192zM320 288c17.7 0 32 14.3 32 32l0 32c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-32c0-17.7 14.3-32 32-32z"/></svg>`;

function getAverages() {
    let ships = [...document.querySelectorAll('[id^="shipped-ship-"]:has(button)').values()];
    //makes array dhData
    //each item of the array is one ship, and coresponds to [dubloons, hours]
    const dhData = ships.map(ship => [
        Number([...ship.querySelectorAll("span").values()]?.filter(sp => sp?.textContent?.endsWith("doubloons"))?.[0]?.textContent?.replace(" doubloons", "") ?? 0),
        Number([...ship.querySelectorAll("span").values()]?.filter(sp => sp?.textContent?.endsWith("hrs"))?.[0]?.textContent?.replace(" hrs", "") ?? 0)
    ]);
    let dubloons = 0.0;
    let hours = 0.0;
    let shipCount = 0.0;
    for (let i = 0; i < dhData.length; i++) {
        //add dubloons
        dubloons += dhData[i][0];
        //add hours
        hours += dhData[i][1];
        shipCount++;
    }
    const dubloonsPerHour = (dubloons / hours) ?? 0;
    const dubloonsPerShip = (dubloons / shipCount) ?? 0;

    return [dubloonsPerHour, dubloonsPerShip];
}

const HTML_SCRIPT = () => {
    //sets both variables seperatly at once
    let [averagePerHour, averagePerProject] = getAverages();

    if (!document.getElementById("hs-ext-features")) {
        shippedShipsHeader.insertAdjacentHTML("afterend", HTML_CONTENT(averagePerHour, averagePerProject));
    }

    const ships = document.querySelectorAll('[id^="shipped-ship-"]');
    //loops through ships and changes them
    ships.forEach(ship => {
        try {
            if (ship?.querySelector('.flex-grow > div')?.children?.length > ([...ship.querySelectorAll("span").values()]?.filter(sp => sp?.textContent?.endsWith("update"))?.[0] ? 3 : 2)) return;

            const hrsText = [...ship.querySelectorAll("span").values()]?.filter(sp => sp?.textContent?.endsWith("hrs"))?.[0]?.textContent ?? "";
            if (!hrsText) return;
            const hrsNum = Number(hrsText?.replace(" hrs", "") ?? 0);

            if ([...ship.querySelectorAll("span").values()]?.filter(sp => sp?.textContent?.endsWith("Pending: Vote to unlock payout!") || sp?.textContent?.endsWith("from other pirates…"))?.[0]) {
                ship.querySelector(".flex-grow div")?.insertAdjacentHTML("beforeend", `
                <span class="inline-flex items-center gap-1 rounded-full px-2 border text-sm leading-none text-green-600 bg-green-50 border-green-500/10 " style="vertical-align: middle;">
                    <span class="inline-block py-1 text-gray-600">Expected:</span>
                    <img alt="doubloons" loading="lazy" width="16" height="20" decoding="async" data-nimg="1" src="/_next/static/media/doubloon.fd63888b.svg" style="color: transparent;">
                    <span class="inline-block py-1">${Math.round(hrsNum * averagePerHour)} doubloons</span>
                </span>
                `);
                return;
            }


            const doubloonsText = [...ship.querySelectorAll("span").values()]?.filter(sp => sp?.textContent?.endsWith("doubloons"))?.[0]?.textContent ?? "";
            if (!doubloonsText) return;
            const doubloonsNum = Number(doubloonsText?.replace(" doubloons", "") ?? 0);

            const doubloonsMainElement = ship.querySelector(".flex-grow div span:nth-of-type(2)");
            let inHrsElement = doubloonsMainElement.cloneNode(true);
            let inHrsDoubloonsElement = [...inHrsElement.querySelectorAll("span").values()].filter(sp => sp.textContent.endsWith("doubloons"))[0];
            inHrsDoubloonsElement.textContent = `${(doubloonsNum / hrsNum).toFixed(2)} / hour`;
            doubloonsMainElement.insertAdjacentElement("afterend", inHrsElement);

            const hrsMainElement = ship.querySelector(".flex-grow div span:nth-of-type(1)");
            let votesElement = hrsMainElement.cloneNode(true);
            let votesSvgElement = votesElement.querySelector("svg");
            votesSvgElement.insertAdjacentHTML("afterend", SVG_VOTES_ICON);
            votesSvgElement.remove();

            let votesSpanElement = [...votesElement.querySelectorAll("span").values()].filter(sp => sp.textContent.endsWith("hrs"))[0];
            votesSpanElement.textContent = `~${pointsToVotes(doubloonsNum / hrsNum)} Votes`;
            inHrsElement.insertAdjacentElement("beforeBegin", votesElement);
        } catch (err) {
        }
    });
};

function runCode() {
    HTML_SCRIPT();
}
}