const urls = ['https://www.youtube.com', 'https://youtube.com', 'https://www.youtu.be', 'https://youtu.be'];

function renameYouTubePage(tabId, tabTitle) {
  if (tabTitle != null) {
    document.title = tabTitle;
    return;
  }
  const notificationSearchPattern = new RegExp(/^\([0-9]+\)/g);
  const result = notificationSearchPattern.exec(document.title);
  if (result) {
    document.title = `${result[0]} YouTube ${tabId}`;
  } else {
    document.title = `YouTube ${tabId}`;
  }
}

chrome.runtime.onInstalled.addListener(() => {
  console.log("onInstalled called!");
  chrome.storage.sync.set({ enabled: true });
});

chrome.runtime.onStartup.addListener(() => {
  console.log("onStartUp called!");
  chrome.storage.sync.get('enabled', function (data) {
    console.log(data.enabled);
    if (!data.enabled) chrome.action.setBadgeText({ text: 'off' });
  });
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  chrome.storage.local.get(`${tabId}`, function (data) {
    if (Object.keys(data).length === 0 && data.constructor === Object) return;
    console.log("Removing tab id: " + tabId);
    chrome.storage.local.remove(`${tabId}`);
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (urls.some(y => tab.url.startsWith(y))) {
    const hiddenTitleSearchPattern = new RegExp(/^(\([0-9]+\)\s)?(YouTube)\s[0-9]+/g);
    if (!hiddenTitleSearchPattern.test(tab.title)) {
      console.log("Saving: " + [tab.id] + ", " + [tab.title]);
      chrome.storage.local.set({ [tab.id]: tab.title });
    }
    chrome.storage.sync.get('enabled', function (data) {
      if (!data.enabled) return;
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: renameYouTubePage,
        args: [tabId, null]
      });
    });
  }
});

chrome.tabs.onReplaced.addListener((addedTabId, removedTabId) => {
  chrome.storage.local.get(`${tab.id}`, function (data) {
    if (Object.keys(data).length === 0 && data.constructor === Object) return;
    console.log("Tab ID is getting replaced: " + removedTabId + " => " + addedTabId);
    chrome.storage.local.remove(`${removedTabId}`);
    chrome.storage.local.set({ [addedTabId]: tab.title });
  });
});

chrome.action.onClicked.addListener(() => {
  chrome.storage.sync.get('enabled', function (data) {
    const enabled = !data.enabled;
    if (enabled) {
      chrome.action.setBadgeText({ text: '' });
      chrome.storage.sync.set({ enabled: true });
    } else {
      chrome.action.setBadgeText({ text: 'off' });
      chrome.storage.sync.set({ enabled: false });
    }

    chrome.tabs.query({}, function (tabs) {
      tabs.forEach(function (tab) {
        if (urls.some(u => tab.url.startsWith(u))) {
          if (enabled) {
            console.log(tab.id + " is going into hiding!");
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              function: renameYouTubePage,
              args: [tab.id, null]
            });
          } else {
            chrome.storage.local.get(`${tab.id}`, function (data) {
              if (data[tab.id] === undefined) console.log("data is undefined");
              else {
                console.log(tab.id + " => " + data[tab.id]);
                chrome.scripting.executeScript({
                  target: { tabId: tab.id },
                  function: renameYouTubePage,
                  args: [tab.id, data[tab.id]]
                });
              }
            });
          }
        }
      });
    });
  });
});