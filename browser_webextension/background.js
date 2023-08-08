// background.js
// =============================================================================
const PATTERN_VALID_URLS = ["http://*/*", "https://*/*"];
const USER_AGENT = get_user_agent();
const WS_SERVER_URL = "ws://localhost:9090";
const IS_DEBUG = false;

// =============================================================================
var socket_conn = null;
var debug = IS_DEBUG ? console.log.bind(window.console) : function () { };

/**
 * Return browser user agent
 */
function get_user_agent() {
    if ((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf("OPR")) != -1) {
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

/**
 * Init websocket connection to server
 */
function ws_conn_init() {
    if (socket_conn === null) {
        debug("ws init");
        socket_conn = new WebSocket(WS_SERVER_URL);
        socket_conn.addEventListener("open", function (event) {
            debug("ws opened");
            socket_conn.send("hello!");
        });
        socket_conn.addEventListener("message", function (event) {
            debug("server:", event.data);
        });
        socket_conn.addEventListener("close", function (event) {
            debug("ws closed");
            menu_check_uncheck_update(false);
            submenu_remove();
            socket_conn = null;
        });
    }
}

/**
 * Close connection to websocket server and reset variable
 */
function ws_conn_close() {
    if (socket_conn != null) {
        socket_conn.close();
    }
}

/**
 * Send message to websocket server as json string
 * @param {object|} data object to attach to data property before converstion to json format.
 */
async function ws_message_send(data) {
    let payload = {
        "apiVersion": "1.0",
        "data": data
    };
    if (socket_conn != null) {
        socket_conn.send(JSON.stringify(payload));
    }
}


/**
 * callback on menu item creation
 */
function menu_on_created() {
    if (browser.runtime.lastError) {
        debug(`Error: ${browser.runtime.lastError}`);
    } else {
        debug("menu Item : created successfully");
    }
}

/**
 * callback on menu item remove
 */
function menu_on_removed() {
    debug("Item removed successfully");
}

/**
 * callback on menu item creation error
 * @param {str} error message
 */
function menu_on_error(error) {
    debug(`Error: ${error}`);
}
/**
 * Toogle the check mark for context menu
 * @checkedState {bool} True as connected.
 */
function menu_check_uncheck_update(checkedState) {
    if (checkedState) {
        browser.menus.update("check-uncheck", {
            title: "Connected to server",
            checked: true,
        });
        ws_conn_init();
        submenu_create();
    } else {
        browser.menus.update("check-uncheck", {
            title: "Connect to server",
            checked: false,
        });
        if (socket_conn !== null) {
            socket_conn.close();
        }
    }
}

/**
 * Remove submenu options from context menu
 */
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

/**
 * Create submenu options from context menu
 */
function submenu_create() {
    if (IS_DEBUG) {
        browser.menus.create({
            id: "item-test",
            title: "TEST menu",
            contexts: ["link", "page"],
            documentUrlPatterns: PATTERN_VALID_URLS,
            icons: {
                "16": "icons/mozilla_firefox.svg",
                "32": "icons/mozilla_firefox.svg"
            }
        }, menu_on_created);
    }
    if (USER_AGENT != "firefox") {
        browser.menus.create({
            id: "browser-firefox",
            title: "Mozilla Firefox",
            contexts: ["link", "page"],
            documentUrlPatterns: PATTERN_VALID_URLS,
            icons: {
                "16": "icons/mozilla_firefox.svg",
                "32": "icons/mozilla_firefox.svg"
            }
        }, menu_on_created);
        browser.menus.create({
            id: "browser-firefox-incognito",
            title: "Mozilla Firefox Private",
            contexts: ["link", "page"],
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
            contexts: ["link", "page"],
            documentUrlPatterns: PATTERN_VALID_URLS,
            icons: {
                "16": "icons/google_chrome.svg",
                "32": "icons/google_chrome.svg"
            }
        }, menu_on_created);
        browser.menus.create({
            id: "browser-chrome-incognito",
            title: "Google Chrome Incognito",
            contexts: ["link", "page"],
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
            contexts: ["link", "page"],
            documentUrlPatterns: PATTERN_VALID_URLS,
            icons: {
                "16": "icons/microsoft_edge.svg",
                "32": "icons/microsoft_edge.svg"
            }
        }, menu_on_created);
        browser.menus.create({
            id: "browser-edge-incognito",
            title: "Microsoft Edge InPrivate",
            contexts: ["link", "page"],
            documentUrlPatterns: PATTERN_VALID_URLS,
            icons: {
                "16": "icons/microsoft_edge_incognito.svg",
                "32": "icons/microsoft_edge_incognito.svg"
            }
        }, menu_on_created);
    }

}


// =============================================================================
function main() {
    browser.menus.create({
        id: "check-uncheck",
        type: "checkbox",
        documentUrlPatterns: PATTERN_VALID_URLS,
        title: "Connect to server",
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
        debug("info", info);
        let data = null
        const dt = new Date();
        const padL = (nr, len = 2, chr = `0`) => `${nr}`.padStart(2, chr);
        debug(`${dt.getFullYear()} ${padL(dt.getMonth() + 1)}/${padL(dt.getDate())}/${padL(dt.getHours())}:${padL(dt.getMinutes())}:${padL(dt.getSeconds())}`);
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
                let url = ("linkUrl" in info) ? info.linkUrl : info.pageUrl;
                data = {
                    "date": `${dt.getFullYear()}-${padL(dt.getMonth() + 1)}-${padL(dt.getDate())} ${padL(dt.getHours())}:${padL(dt.getMinutes())}:${padL(dt.getSeconds())}`,
                    "app": info.menuItemId,
                    "type": "browser",
                    "url": url
                }
                ws_message_send(data);
                debug("to websocket", data);
                break;
            case "open-sidebar":
                debug("Opening my sidebar");
                break;
            case "tools-menu":
                debug("Clicked the tools menu item");
                break;
        }
    });
}

main();