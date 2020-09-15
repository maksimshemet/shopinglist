const electron = require("electron");
const { ipcRenderer } = electron;

function AdditionalWindow() {
  const formEl = document.querySelector("form");
  if (formEl) formEl.addEventListener("submit", submitForm);

  function submitForm(e) {
    e.preventDefault();
    const item = document.querySelector("#item").value;
    ipcRenderer.send("item:add", item);
  }
}

function MainWindow() {
  const ul = document.querySelector("ul#item_list");

  // add item Main
  ipcRenderer.on("item:add", function (e, item) {
    const li = document.createElement("li");
    const itemText = document.createTextNode(item);
    li.appendChild(itemText);
    ul.appendChild(li);
  });

  // remove all items
  ipcRenderer.on("item:clear", function () {
    ul.innerHTML = "";
  });

  // remove item by dblclick
  if (ul)
    ul.addEventListener("dblclick", (e) => {
      e.target.remove();
    });
}

window.addEventListener("DOMContentLoaded", () => {
  AdditionalWindow();
  MainWindow();
});
