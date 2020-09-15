const { ipcMain } = require("electron");
const electron = require("electron");
const { ipcRenderer } = electron;
const serialize = require("form-serialize");

// additional menu; item add form; set eventListener
function AdditionalWindow() {
  const formEl = document.querySelector("form#item");
  if (formEl) formEl.addEventListener("submit", submitForm);

  function submitForm(e) {
    e.preventDefault();
    const item = document.querySelector("#item").value;
    ipcRenderer.send("item:add", item);
  }
}

//main menu; add/remove/clear item(s); set event listener for Task form data; send it to main.js
function MainWindow() {
  //Task add func; new part start
  const formEl = document.querySelector("form#newTaskForm");
  if (formEl) {
    formEl.addEventListener("submit", submitForm);
    formEl.addEventListener("reset", () => {
      collapseItem.classList.remove("show");
      formEl.reset();
    });
  }

  function submitForm(e) {
    e.preventDefault();
    const TaskData = document.querySelector("form#newTaskForm");
    const task = serialize(TaskData, { hash: true });
    const collapseItem = document.getElementById("collapseItem");

    ipcRenderer.send("task:add", task);

    collapseItem.classList.remove("show");
    formEl.reset();
  }

  //new part finish

  // old part start
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

  // old part finish
}

function taskContainer(title, description, priority, finishAt) {
  const list = document.querySelector("div#task-list");
  const taskElementA = document.createElement("a");
  const taskElementDiv = document.createElement("div");
  const taskElementH5 = document.createElement("h5");
  const taskElementSmall1 = document.createElement("small");
  const taskElementP = document.createElement("p");
  const taskElementSmall2 = document.createElement("small");

  taskElementH5.className = "font-weight-bold text-success";
  taskElementSmall1.className = "font-weight-bold text-danger";
  taskElementSmall2.className = "text-success font-weight-bold";
  taskElementP.className = "mb-1 text-success";
  taskElementA.className = "list-group-item list-group-item-action text-dark";
  taskElementDiv.className = "d-flex w-100 justify-content-between";

  taskElementH5.innerText = title;
  taskElementP.innerText = description;
  taskElementSmall2.innerText = priority;
  taskElementSmall1.innerText = finishAt;

  taskElementDiv.appendChild(taskElementH5);
  taskElementDiv.appendChild(taskElementSmall1);
  taskElementA.appendChild(taskElementDiv);
  taskElementA.appendChild(taskElementP);
  taskElementA.appendChild(taskElementSmall2);

  list.appendChild(taskElementA);
}

function setTask() {
  ipcRenderer.on("task:add", function (e, task) {
    const info = document.querySelector("a#task-3");
    if (info) info.remove();

    taskContainer(task.title, task.description, task.priority, task.finishAt);
  });
}

window.addEventListener("DOMContentLoaded", () => {
  AdditionalWindow();
  MainWindow();
  setTask();
});
