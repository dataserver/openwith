// background.js
// =================================================
const PATTERN_VALID_URLS = ["http://*/*", "https://*/*"];
const USER_AGENT = get_user_agent();

var socket_conn = null;

function get_user_agent() {
    if ((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1) {
        return "opera";
    }
    else if (navigator.userAgent.indexOf("Edg") != -1) {
        return "edge";
    }
    else if (navigator.userAgent.indexOf("Chrome") != -1) {
        return "chrome";
    }
    else if (navigator.userAgent.indexOf("Safari") != -1) {
        return "safari";
    }
    else if (navigator.userAgent.indexOf("Firefox") != -1) {
        return "firefox";
    }
    else if ((navigator.userAgent.indexOf("MSIE") != -1) || (!!document.documentMode == true)) {
        return "ie"; //IF IE > 10
    }
    else {
        return "unknown";
    }
}

// WEBSOCKET
function ws_conn_init() {
    if (socket_conn == null) {
        // console.log("ws: init");
        socket_conn = new WebSocket('ws://localhost:9090');
        socket_conn.addEventListener('open', function (event) {
            socket_conn.send("browser: init hello");
        });
        socket_conn.addEventListener('message', function (event) {
            // console.log("server:", event.data);
        });
        socket_conn.addEventListener('close', function (event) {
            // console.log("ws: closed");
            menu_check_uncheck_update(false)
            socket_conn = null;
        });
    }
}

function ws_conn_close() {
    if (socket_conn != null) {
        socket_conn.close();
    }
}

async function ws_message_send(data) {
    let payload = {
        "apiVersion": "1.0",
        "data": data
    };
    if (socket_conn != null) {
        socket_conn.send(JSON.stringify(payload));
    }
}


// ContextMenu
function menu_on_created() {
    if (browser.runtime.lastError) {
        // console.log(`Error: ${browser.runtime.lastError}`);
    } else {
        // console.log("menu Item : created successfully");
    }
}

function menu_on_removed() {
    // console.log("Item removed successfully");
}

function menu_on_error(error) {
    // console.log(`Error: ${error}`);
}

function menu_check_uncheck_update(checkedState) {
    if (checkedState) {
        browser.menus.update("check-uncheck", {
            title: "websocket ON",
            checked: true,
        });
        ws_conn_init();
        submenu_create();
    } else {
        browser.menus.update("check-uncheck", {
            title: "websocket Off",
            checked: false,
        });
        if (socket_conn != null) {
            socket_conn.close();
        }
        socket_conn = null;
        submenu_remove();
    }
}

function submenu_remove() {
    if (USER_AGENT != "firefox") {
        browser.menus.remove("browser-firefox");
        browser.menus.remove("browser-firefox-private");
        browser.menus.remove("separator-2");
    }
    if (USER_AGENT != "chrome") {
        browser.menus.remove("browser-chrome");
        browser.menus.remove("browser-chrome-incognito");
        browser.menus.remove("separator-3");
    }
    if (USER_AGENT != "edge") {
        browser.menus.remove("browser-edge");
        browser.menus.remove("browser-edge-incognito");
    }
}

function submenu_create() {
    if (USER_AGENT != "firefox") {
        browser.menus.create({
            id: "browser-firefox",
            title: "Mozilla Firefox",
            contexts: ["link"],
            documentUrlPatterns: PATTERN_VALID_URLS,
            icons: {
                "16": "icons/mozilla_firefox.svg",
                "32": "icons/mozilla_firefox.svg"
            }
        }, menu_on_created);
        browser.menus.create({
            id: "browser-firefox-incognito",
            title: "Mozilla Firefox Private",
            contexts: ["link"],
            documentUrlPatterns: PATTERN_VALID_URLS,
            icons: {
                "16": "icons/mozilla_firefox_private.svg",
                "32": "icons/mozilla_firefox_private.svg"
            }
        }, menu_on_created);
        browser.menus.create({
            id: "separator-2",
            type: "separator",
            documentUrlPatterns: PATTERN_VALID_URLS,
            contexts: ["all"]
        }, menu_on_created);
    }

    if (USER_AGENT != "chrome") {
        browser.menus.create({
            id: "browser-chrome",
            title: "Google Chrome",
            contexts: ["link"],
            documentUrlPatterns: PATTERN_VALID_URLS,
            icons: {
                "16": "icons/google_chrome.svg",
                "32": "icons/google_chrome.svg"
            }
        }, menu_on_created);
        browser.menus.create({
            id: "browser-chrome-incognito",
            title: "Google Chrome Incognito",
            contexts: ["link"],
            documentUrlPatterns: PATTERN_VALID_URLS,
            icons: {
                "16": "icons/google_chrome_incognito.svg",
                "32": "icons/google_chrome_incognito.svg"
            }
        }, menu_on_created);
        browser.menus.create({
            id: "separator-3",
            type: "separator",
            documentUrlPatterns: PATTERN_VALID_URLS,
            contexts: ["all"]
        }, menu_on_created);
    }

    if (USER_AGENT != "edge") {
        browser.menus.create({
            id: "browser-edge",
            title: "Microsoft Edge",
            contexts: ["link"],
            documentUrlPatterns: PATTERN_VALID_URLS,
            icons: {
                "16": "icons/microsoft_edge.svg",
                "32": "icons/microsoft_edge.svg"
            }
        }, menu_on_created);
        browser.menus.create({
            id: "browser-edge-incognito",
            title: "Microsoft Edge InPrivate",
            contexts: ["link"],
            documentUrlPatterns: PATTERN_VALID_URLS,
            icons: {
                "16": "icons/microsoft_edge_incognito.svg",
                "32": "icons/microsoft_edge_incognito.svg"
            }
        }, menu_on_created);
    }

}


// =================================================
browser.menus.create({
    id: "check-uncheck",
    type: "checkbox",
    documentUrlPatterns: PATTERN_VALID_URLS,
    title: "websocket off",
    contexts: ["all"],
    checked: false,
}, menu_on_created);
browser.menus.create({
    id: "separator-1",
    type: "separator",
    documentUrlPatterns: PATTERN_VALID_URLS,
    contexts: ["all"]
}, menu_on_created);

browser.menus.onClicked.addListener((info, tab) => {
    // console.log("info", info);
    let data = null
    const dt = new Date();
    const padL = (nr, len = 2, chr = `0`) => `${nr}`.padStart(2, chr);
    // console.log(`${dt.getFullYear()} ${padL(dt.getMonth() + 1)}/${padL(dt.getDate())}/${padL(dt.getHours())}:${padL(dt.getMinutes())}:${padL(dt.getSeconds())}`);
    switch (info.menuItemId) {
        case "check-uncheck":
            menu_check_uncheck_update(info.checked);
            break;
        case "browser-firefox":
        case "browser-firefox-incognito":
        case "browser-chrome":
        case "browser-chrome-incognito":
        case "browser-edge":
        case "browser-edge-incognito":
            data = {
                "date": `${dt.getFullYear()}-${padL(dt.getMonth() + 1)}-${padL(dt.getDate())} ${padL(dt.getHours())}:${padL(dt.getMinutes())}:${padL(dt.getSeconds())}`,
                "app": info.menuItemId,
                "type": "browser",
                "url": info.linkUrl
            }
            ws_message_send(data);
            // console.log("to websocket", data);
            break;
        case "open-sidebar":
            // console.log("Opening my sidebar");
            break;
        case "tools-menu":
            // console.log("Clicked the tools menu item");
            break;
    }
});