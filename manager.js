document.addEventListener("DOMContentLoaded", () => {
  const statusEl = document.getElementById("status");
  const container = document.getElementById("bookmarkContainer");
  if (!statusEl || !container) return;

  const loadAndRender = () => {
    chrome.bookmarks.getTree((tree) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        statusEl.textContent = "Failed to load bookmarks.";
        return;
      }

      statusEl.textContent = "";
      container.textContent = "";

      const root = tree[0].children;
      root.forEach((node) => {
        renderNode(node, container, 0, loadAndRender, statusEl);
      });
    });
  };

  loadAndRender();
});

function collapseAll(containerEl) {
  const childContainers = containerEl.querySelectorAll(".folder-children");
  const indicators = containerEl.querySelectorAll(".folder-indicator");
  childContainers.forEach((el) => {
    el.style.display = "none";
    el.dataset.expanded = "false";
  });
  indicators.forEach((el) => {
    el.textContent = "▶";
  });
}

function renderNode(node, parentEl, depth, reload, statusEl) {
  if (node.url) {
    // Bookmark
    const link = document.createElement("a");
    link.href = node.url;
    link.textContent = node.title || node.url;
    link.target = "_blank";
    link.rel = "noreferrer";

    const item = document.createElement("div");
    item.className = "row bookmark-row";

    const icon = document.createElement("span");
    icon.className = "icon";
    icon.innerHTML =
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 1 0-7l2-2a5 5 0 0 1 7 7l-2 2"/><path d="M14 11a5 5 0 0 1 0 7l-2 2a5 5 0 0 1-7-7l2-2"/></svg>';
    item.appendChild(icon);
    item.appendChild(link);

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.textContent = "Delete";
    delBtn.className = "delete-btn";
    delBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!confirm("Delete this bookmark?")) return;
      chrome.bookmarks.remove(node.id, () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          statusEl.textContent = "Failed to delete bookmark.";
          alert("Failed to delete bookmark.");
          return;
        }
        reload();
      });
    });
    item.appendChild(document.createTextNode(" "));
    item.appendChild(delBtn);
    parentEl.appendChild(item);
  } else {
    // Folder
    const folder = document.createElement("div");
    const title = document.createElement("div");
    const indicator = document.createElement("span");
    const name = document.createElement("span");

    title.className = "row folder-row";
    indicator.className = "folder-indicator";
    indicator.textContent = depth === 0 ? "▼" : "▶";
    name.textContent = node.title || "Untitled folder";

    const icon = document.createElement("span");
    icon.className = "icon";
    icon.innerHTML =
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5h6l2 2H21a2 2 0 0 1 2 2v6.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7.5z"/></svg>';

    title.appendChild(indicator);
    title.appendChild(document.createTextNode(" "));
    title.appendChild(icon);
    title.appendChild(document.createTextNode(" "));
    title.appendChild(name);
    title.style.cursor = "pointer";

    folder.appendChild(title);

    if (node.children) {
      const children = document.createElement("div");
      children.className = "folder-children";
      children.style.marginLeft = "16px";
      children.dataset.expanded = depth === 0 ? "true" : "false";
      if (depth !== 0) {
        children.style.display = "none";
      }

      node.children.forEach((child) =>
        renderNode(child, children, depth + 1, reload, statusEl)
      );
      folder.appendChild(children);

      title.addEventListener("click", () => {
        const isExpanded = children.dataset.expanded === "true";
        if (isExpanded) {
          children.style.display = "none";
          children.dataset.expanded = "false";
          indicator.textContent = "▶";
          collapseAll(children);
        } else {
          children.style.display = "";
          children.dataset.expanded = "true";
          indicator.textContent = "▼";
        }
      });
    }

    parentEl.appendChild(folder);
  }
}
