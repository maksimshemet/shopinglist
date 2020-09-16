const electron = require("electron");
const url = require("url");
const path = require("path");
const shortid = require("shortid");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("db/db.json");
const db = low(adapter);

const { app, BrowserWindow, Menu, ipcMain } = electron;
let mainWindow;

db.defaults({ tasks: [] }).write();

// Listen for app to be ready

app.on("ready", function () {
  // Create new window
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js"), // use a preload script
    },
  });
  // Load html into window
  mainWindow.loadURL(
    url.format({
      pathname: path.join("public", "mainWindow.html"),
      protocol: "file:",
      slashes: true,
    })
  );

  // Quit all windows when closed
  mainWindow.on("closed", function () {
    app.quit();
  });

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert Menu
  Menu.setApplicationMenu(mainMenu);
});

function sendTask(task) {
  let taskId = shortid.generate();
  task["id"] = taskId;
  // Add a task
  mainWindow.webContents.send("task:add", task, taskId);
  console.log(task);
}

ipcMain.on("task:sync", function () {
  const tasks = db.defaults({ tasks: [] }).get("tasks").value();
  for (index in tasks) {
    sendTask(tasks[index]);
  }
});

//new par Taks
ipcMain.on("task:add", function (e, task) {
  sendTask(task);
  db.get("tasks").push(task).write();
});

// del task from db
ipcMain.on("task:del", function (e, taskId) {
  taskId = taskId.match(/task-id-(.*)/)[1];
  console.log("Task with task ID: " + taskId + " delated!");
  db.get("tasks").remove({ id: taskId }).write();
});

// Create menu template
const mainMenuTemplate = [
  {
    label: "Donate",
  },
];

// If mac, add empty obj to menu
if (process.platform == "darwin") {
  mainMenuTemplate.unshift({});
}

// Add Dev toll if not prod
if (process.env.NODE_ENV !== "production") {
  mainMenuTemplate.push({
    label: "Dev Tools",
    submenu: [
      {
        label: "Toggle DevTools",
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        },
      },
      {
        role: "reload",
        accelerator: process.platform == "darwin" ? "Command+I" : "Ctrl+R",
      },
    ],
  });
}
