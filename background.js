var enabled = true;
var map = new Map();

function renameYouTubePage(tabId, tabTitle) {
  if (tabTitle !== null) {
    document.title = tabTitle;
    return;
  }
  if (tabTitle === null) tabTitle = document.title;
  const searchPattern = new RegExp(/^\([0-9]+\)/g);
  const result = searchPattern.exec(tabTitle);
  if (result) {
    document.title = `${result[0]} YouTube ${tabId}`;
  } else {
    document.title = `YouTube ${tabId}`;
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log(map);
  if (!enabled) return;
  if (['https://www.youtube.com', 'https://youtube.com', 'https://www.youtu.be', 'https://youtu.be'].some(y => tab.url.startsWith(y))) {

    if (!map.has(tab.id)) {
      map.set(tabId, tab.title);
    }

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: renameYouTubePage,
      args: [tabId, null]
    });
  }
});

chrome.action.onClicked.addListener((tab) => {
  enabled = !enabled;
  if (enabled) {
    chrome.action.setBadgeText({ text: '' });
    chrome.tabs.query({}, function (tabs) {
      tabs.forEach(function (tab) {
        if (map.has(tab.id)) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: renameYouTubePage,
            args: [tab.id, null]
          });
        }
      });
    });
  } else {
    chrome.action.setBadgeText({ text: 'off' });
    chrome.tabs.query({}, function (tabs) {
      tabs.forEach(function (tab) {
        if (map.has(tab.id)) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: renameYouTubePage,
            args: [tab.id, map.get(tab.id)]
          });
        }
      });
    });
  }
  console.log("...");
});