const STATE_NONE = "none";
const STATE_MIXED = "mixed";
const RESOURCE_TYPE_MAIN_FRAME = "main_frame";
const RESOURCE_TYPE_SUB_FRAME = "sub_frame";

const http_state = {};
const ip_state = {};

function getIpVersion(ip_str) {
    if (ip_str.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) {
        return 4;
    }
    return 6;
}

function getHttpVersion(status_str) {
    return status_str.split(' ', 1)[0];
}

function evaluateState(tabId, resourceType, http_version, ip_version) {
  if (resourceType === RESOURCE_TYPE_MAIN_FRAME) {
    updateState(tabId, http_version, ip_version);
  } else if (http_state[tabId] === STATE_NONE) {
    updateState(tabId, STATE_MIXED, ip_version);
  }
}

function updateState(tabId, http_version, ip_version) {
  http_state[tabId] = http_version;
  ip_state[tabId] = ip_version;
  setPageAction(tabId);
}

function setPageAction(tabId) {
  let version = http_state[tabId];
  let ipv = ip_state[tabId];
  if (!version) {
    return;
  }

  if (version === STATE_NONE) {
    browser.pageAction.hide(tabId);
  } else {
    browser.pageAction.show(tabId);
    browser.pageAction.setIcon({
      tabId: tabId,
      path: getIcon(version)
    });
    browser.pageAction.setTitle({
      tabId: tabId,
      title: getTitle(version, ipv)
    });
  }
}

function getIcon(version) {
  if (version === STATE_MIXED) {
    return "icons/icon-gray.svg";
  } else if (version === "HTTP/2.0") {
    return "icons/icon-blue.svg";
  } else if (version === "HTTP/3.0") {
    return "icons/icon-orange.svg";
  } else if (version.match(/^HTTP\/1/)) {
    return "icons/icon-gray.svg";
  } else {
    return "icons/icon-green.svg";
  }
}

function getTitle(http_version, ip_version) {
  if (http_version === STATE_MIXED) {
    return browser.i18n.getMessage("pageActionTitleMixed");
  } else {
    return browser.i18n.getMessage("pageActionTitle", [http_version, ip_version]);
  }
}

browser.webRequest.onHeadersReceived.addListener(
  e => {
    if (
      e.tabId === -1 ||
      (e.type !== RESOURCE_TYPE_MAIN_FRAME &&
        e.type !== RESOURCE_TYPE_SUB_FRAME)
    ) {
      return;
    }
    let http_ver = getHttpVersion(e.statusLine);
    let ip_ver = e.ip ? getIpVersion(e.ip) : null;
    evaluateState(e.tabId, e.type, http_ver, ip_ver);
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"]
);

browser.webNavigation.onCommitted.addListener(e => {
  if (e.frameId === 0) {
    setPageAction(e.tabId);
  }
});

browser.tabs.onActivated.addListener(e => {
  setPageAction(e.tabId);
});

browser.tabs.onRemoved.addListener(tabId => {
  http_state[tabId] = null;
});
