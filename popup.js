document.addEventListener("DOMContentLoaded", () => {
  console.log("Bookmark Manager popup loaded");

  const btn = document.getElementById("openManager");
  if (!btn) return;

  btn.addEventListener("click", () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("manager.html") });
  });
});
