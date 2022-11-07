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

const { TouchBarLabel, TouchBarButton, TouchBarSpacer } = TouchBar

const path = require('path'),
  isDev = require('electron-is-dev');

/*require('update-electron-app')({
  repo: 'leafstudiosDot/incogine-editor',
  updateInterval: '10 minutes'
})*/

const os = require('os')

const reactDevToolsPath = path.join(
  os.homedir(),
  '/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.25.0_0'
)


let newWindow;
let currentWindow;
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
            dialog.showMessageBox(null, {message: "Please create a new window to see an about page."})
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
            dialog.showMessageBox(null, {message: "Please create a new window to add tab."})
          }
        }
      },
      {
        label: 'New Window',
        accelerator: 'Shift+CmdOrCtrl+N',
        click: () => { createWindow() }
      },
      { type: 'separator' },
      {
        label: 'Open File',
        accelerator: 'CmdOrCtrl+O',
        click: () => { 
          if (currentWindow != null) {
            currentWindow.webContents.executeJavaScript('window.OpenFile()') 
          } else {
            dialog.showMessageBox(null, {message: "Please create a new window to open a file."})
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
            dialog.showMessageBox(null, {message: "Please create a new window to save."})
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
            dialog.showMessageBox(null, {message: "Please create a new window to check settings tab."})
          }
        }
      },
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
      { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
      { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
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
            dialog.showMessageBox(null, {message: "Please create a new window to add tab."})
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
          dialog.showMessageBox(null, {message: "Please create a new window to add tab."})
        }
      }
    }),
    new TouchBarSpacer({ size: 'large' })
  ]
})

setInterval(function () {
  currentWindow = BrowserWindow.getFocusedWindow();
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
      enableRemoteModule: true
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

  windows.add(newWindow);
  return newWindow
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
        label: 'Docking...',
        click() { console.log('ash devil in a nutshell: hotdots.com') }
      },
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
