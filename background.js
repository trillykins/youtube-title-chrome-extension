var enabled = true;

function renameYouTubePage(tabId) {
  const searchPattern = new RegExp(/^\([0-9]+\)/g);
  const result = searchPattern.exec(document.title);
  if (result) {
    document.title = `${result[0]} YouTube ${tabId}`;
  } else {
    document.title = `YouTube ${tabId}`;
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!enabled) return;
  if (['chrome://', 'edge://'].some(x => !tab.url.includes(x))) {
    if (['https://www.youtube.com', 'https://youtube.com', 'https://www.youtu.be', 'https://youtu.be'].some(y => tab.url.toLowerCase().startsWith(y))) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: renameYouTubePage,
        args: [tabId]
      });
    }
  }
});

chrome.action.onClicked.addListener((tab) => {
  enabled = !enabled;
  if (!enabled) {
    chrome.action.setBadgeText({ text: 'off' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
});