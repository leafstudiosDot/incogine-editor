const electron = require('electron'),
  app = electron.app,
  session = electron.session,
  BrowserWindow = electron.BrowserWindow,
  Menu = electron.Menu,
  dialog = electron.dialog,
  ipcMain = electron.ipcMain,
  TouchBar = electron.TouchBar,
  Tray = electron.Tray,
  shell = electron.shell;

const url = require('url');

const Store = require('electron-store')
const store = new Store();

const { TouchBarLabel, TouchBarButton, TouchBarSpacer } = TouchBar

const path = require('path'),
  fs = require('fs'),
  isDev = require('electron-is-dev');

/*require('update-electron-app')({
  repo: 'leafstudiosDot/incogine-editor',
  updateInterval: '10 minutes'
})*/

const os = require('os')

function ReadExtensions(window) {
  const incoeditExtensionsLocation = app.getPath('userData') + "/extensions"
  if (!fs.existsSync(incoeditExtensionsLocation)) {
    fs.mkdirSync(incoeditExtensionsLocation)
  }

  function ReadingExtensionList() {
    let extensionsArr = []
    for (const extensiondir of fs.readdirSync(incoeditExtensionsLocation)) {
      let command;
      if (!["", " ", ".DS_Store", ".git", "\n", "‎"].includes(extensiondir)) {
        const extension = incoeditExtensionsLocation + "/" + extensiondir
        for (const extfile of fs.readdirSync(extension)) {
          if (!["", " ", ".DS_Store", ".git", ".gitignore", "user.json", "\n", "‎"].includes(extfile)) {
            command = require(incoeditExtensionsLocation + "/" + extensiondir + "/main.js")
            //window.webContents.executeJavaScript("")

          }
        }
      }
      extensionsArr.push(command)
    }
    if (process.platform === 'darwin') {
      extensionsArr.shift()
    }
    return extensionsArr
  }
  return ReadingExtensionList()
}

const reactDevToolsPath = path.join(
  os.homedir(),
  '/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.25.0_0'
)


let newWindow;
let currentWindow;
let lastCurrentWindow;
require('@electron/remote/main').initialize()
const windows = new Set();

const isMac = process.platform === 'darwin'

const menuBar = [
  ...(isMac ? [{
    label: app.name,
    submenu: [
      {
        label: 'About Incogine Editor',
        click: () => {
          if (currentWindow != null) {
            currentWindow.webContents.executeJavaScript('window.SettingsPage("about")')
          } else {
            dialog.showMessageBox(null, { message: "Please create a new window to see an about page." })
          }
        }
      },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      {
        label: 'Hide Incogine Editor',
        role: 'hide'
      },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { label: 'Quit Incogine Editor', role: 'quit' }
    ]
  }] : []),
  {
    label: 'File',
    submenu: [
      {
        label: 'New Text Tab',
        accelerator: 'CmdOrCtrl+N',
        click: () => {
          if (currentWindow != null) {
            currentWindow.webContents.executeJavaScript('window.AddTab(false)')
          } else {
            dialog.showMessageBox(null, { message: "Please create a new window to add tab." })
          }
        }
      },
      {
        label: 'New Window',
        submenu: [
          {
            label: 'New Text Window',
            accelerator: 'Shift+CmdOrCtrl+N',
            click: () => { createWindow() }
          },
          {
            label: 'New Video Editing Window',
            click: () => { createVideoEditingWindow() }
          }
        ]
      },
      { type: 'separator' },
      {
        label: 'Open File',
        accelerator: 'CmdOrCtrl+O',
        click: () => {
          if (currentWindow != null) {
            currentWindow.webContents.executeJavaScript('window.OpenFile()')
          } else {
            dialog.showMessageBox(null, { message: "Please create a new window to open a file." })
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Save File',
        accelerator: 'CmdOrCtrl+S',
        click: () => {
          if (currentWindow != null) {
            currentWindow.webContents.executeJavaScript('window.SaveFile()')
          } else {
            dialog.showMessageBox(null, { message: "Please create a new window to save." })
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Settings',
        click: () => {
          if (currentWindow != null) {
            currentWindow.webContents.executeJavaScript('window.SettingsPage()')
          } else {
            dialog.showMessageBox(null, { message: "Please create a new window to check settings tab." })
          }
        }
      },
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { label: "Undo", accelerator: "Command+Z", selector: "undo:" },
      { label: "Redo", accelerator: "Shift+Command+Z", selector: "redo:" },
      { type: "separator" },
      { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
      { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
      { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
      { type: 'separator' },
      {
        label: "Select All", accelerator: "CmdOrCtrl+A", click: () => {
          if (currentWindow != null) {
            currentWindow.webContents.executeJavaScript('window.SelectAllFromArea()')
          }
        }
      }
    ]
  },
  {
    label: 'Develop',
    submenu: [
      {
        label: 'Open Chrome DevTools',
        accelerator: 'CmdOrCtrl+Shift+I',
        click: () => {
          if (currentWindow != null) {
            currentWindow.webContents.openDevTools()
          } else {
            dialog.showMessageBox(null, { message: "Please create a new window to add tab." })
          }
        }
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(menuBar)

let menutray = null

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('incoedit', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('incoedit');
}

const touchBarDarwin = new TouchBar({
  items: [
    new TouchBarButton({
      label: 'Add Tab',
      click: () => {
        if (currentWindow != null) {
          currentWindow.webContents.executeJavaScript('window.AddTab(false)')
        } else {
          dialog.showMessageBox(null, { message: "Please create a new window to add tab." })
        }
      }
    }),
    new TouchBarSpacer({ size: 'large' })
  ]
})

setInterval(function () {
  currentWindow = BrowserWindow.getFocusedWindow();
  if (currentWindow != null) {
    lastCurrentWindow = currentWindow
  }
}, 200);

const createWindow = () => {

  currentWindow = BrowserWindow.getFocusedWindow();

  newWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minHeight: 720,
    minWidth: 720,
    resizable: true,
    icon: process.platform !== 'darwin' ? __dirname + `/icons/icon.icns` : __dirname + "/icons/icon.ico",
    frame: false,
    titleBarStyle: 'customButtonsOnHover',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false
    }
  });
  const appUrl = isDev ? 'http://localhost:3613' : `file://${path.join(__dirname, '../build/index.html')}`
  Menu.setApplicationMenu(menu)
  newWindow.setTouchBar(touchBarDarwin)
  newWindow.loadURL(appUrl, { userAgent: 'IncogineEditor-Electron' });
  newWindow.maximize()

  newWindow.once('ready-to-show', () => {
    newWindow.show();
  })

  newWindow.on('closed', () => {
    windows.delete(newWindow);
    newWindow = null;
  });

  require("@electron/remote/main").enable(newWindow.webContents);

  // Extra Events

  ReadExtensions(newWindow)

  windows.add(newWindow);
  return newWindow
}

// Create Video Editing Window
const createVideoEditingWindow = () => {
  currentWindow = BrowserWindow.getFocusedWindow();

  const newVideoWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minHeight: 720,
    minWidth: 1280,
    resizable: true,
    icon: process.platform !== 'darwin' ? __dirname + `/icons/icon.icns` : __dirname + "/icons/icon.ico",
    frame: false,
    titleBarStyle: 'customButtonsOnHover',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false
    }
  });
  const appUrl = isDev ? 'http://localhost:3613/#/videdit' : `file://${path.join(__dirname, '../build/index.html/#/videdit')}`
  Menu.setApplicationMenu(menu)
  newVideoWindow.setTouchBar(touchBarDarwin)
  newVideoWindow.loadURL(appUrl, { userAgent: 'IncogineEditor-Electron' });
  newVideoWindow.maximize()

  newVideoWindow.once('ready-to-show', () => {
    newVideoWindow.show();
  })

  newVideoWindow.on('closed', () => {
    windows.delete(newVideoWindow);
    newWindow = null;
  });

  require("@electron/remote/main").enable(newVideoWindow.webContents);

  // Extra Events

  ReadExtensions(newVideoWindow)

  windows.add(newVideoWindow);
  return newVideoWindow
}

// URL Protocol incoedit://{whatever}

// Windows only
if (app.requestSingleInstanceLock()) {
  app.on('second-instance', (event, cmdline, workingDir) => {
    if (newWindow) {
      if (newWindow.isMinimized()) newWindow.restore()
      newWindow.focus()
    }
  })
} else {
  app.quit();
}

// Platforms as following when URL is opened
app.on('open-url', (event, url) => {
  let urlcontent = url.split('incoedit://')[1]
  let content = urlcontent.split('?')[0]
  let query = urlcontent.split('?')[1]
  let query_item = query.split('&')

  switch (content) {
    default:
      break;
  }
})

// Run App
app.whenReady().then(async () => {
  // Tray
  menutray = new Tray(isMac ? path.join(__dirname, `/tray_icon/trayTemplate.png`) : path.join(__dirname, `/tray_icon/tray.png`))
  const contextMenu = Menu.buildFromTemplate([
    { label: 'New Window', click: () => { createWindow() } },
    { label: 'Quit Incogine Editor', role: 'quit' }
  ])
  menutray.setToolTip('Incogine Editor Menu')
  menutray.setContextMenu(contextMenu)

  // macOS Dock
  if (isMac) {
    app.dock.setMenu(Menu.buildFromTemplate([
      {
        label: 'New Window',
        click() {
          createWindow()
        }
      }
    ]))
  }

  //await session.defaultSession.loadExtension(reactDevToolsPath)
})
app.on('ready', createWindow)
app.on('window-all-closed', () => {
  // Follow OS convention on whether to quit app when
  // all windows are closed.
  if (process.platform !== 'darwin') {

  }
})
app.on('activate', (event, hasviswin) => {
  // If the app is still open, but no windows are open,
  // create one when the app comes into focus.
  if (!hasviswin) { createWindow() }
})

ipcMain.on(`display-app-menu`, function (e, args) {
  if (newWindow) {
    menu.popup({
      window: newWindow,
      x: args.x,
      y: args.y
    });
  }
});

ipcMain.on('get-fromstorage', function (e, { callbackname, key }) {
  var value = ""
  value = store.get(key)
  e.sender.send('get-fromstorage-reply', callbackname + ";" + value)
})

ipcMain.on('set-fromstorage', function (e, { key, value }) {
  store.set(key, value)
})

ipcMain.on('getExtSettings', function (e) {
  e.sender.send('getExtSettings-reply', ReadExtensions())
})

ipcMain.on('openLink', async (event, data) => {
  shell.openExternal(data)
})

ipcMain.on("toggle-maximize-window", function (event) {
  if (currentWindow.isMaximized()) {
    currentWindow.unmaximize();
  } else {
    currentWindow.maximize();
  }
});

ipcMain.on("window-minimize", function (event) {
  currentWindow.minimize();
});

ipcMain.on("window-close", function (event) {
  currentWindow.close();
});
