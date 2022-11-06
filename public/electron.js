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

const Store = require('electron-store')
const store = new Store();

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


let mainWindow;

const isMac = process.platform === 'darwin'

const menuBar = [
  ...(isMac ? [{
    label: app.name,
    submenu: [
      {
        label: 'About Incogine Editor',
        click: () => {
          mainWindow.webContents.executeJavaScript('window.SettingsPage("about")')
        }
      },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
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
        click: () => { mainWindow.webContents.executeJavaScript('window.AddTab(false)') }
      },
      { type: 'separator' },
      {
        label: 'Open File',
        accelerator: 'CmdOrCtrl+O',
        click: () => { mainWindow.webContents.executeJavaScript('window.OpenFile()') }
      },
      { type: 'separator' },
      {
        label: 'Save File',
        accelerator: 'CmdOrCtrl+S',
        click: () => { mainWindow.webContents.executeJavaScript('window.SaveFile()') }
      },
      { type: 'separator' },
      {
        label: 'Settings',
        click: () => { mainWindow.webContents.executeJavaScript('window.SettingsPage()') }
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
        click: () => { mainWindow.webContents.openDevTools() }
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
        mainWindow.webContents.executeJavaScript('window.AddTab(false)')
      }
    }),
    new TouchBarSpacer({ size: 'large' })
  ]
})

const createWindow = () => {
  mainWindow = new BrowserWindow({
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
  mainWindow.setTouchBar(touchBarDarwin)
  mainWindow.loadURL(appUrl, { userAgent: 'IncogineEditor-Electron' });
  mainWindow.maximize()
  mainWindow.on('closed', () => mainWindow = null)

  // Extra Events
}

// URL Protocol incoedit://{whatever}

// Windows only
if (app.requestSingleInstanceLock()) {
  app.on('second-instance', (event, cmdline, workingDir) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
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

  switch(content) {
    case 'twitter':
      switch(query_item[0].split('=')[0]) {
        case 'connect':
          if (query_item[0].split('=')[1] === 'true') {
            store.set('twitter_token', query_item[1].split('=')[1])
            mainWindow.webContents.executeJavaScript('window.localStorage.setItem("twitter_token", "' + query_item[1].split('=')[1] + '")')
            store.set('twitter_token_secret', query_item[2].split('=')[1])
            mainWindow.webContents.executeJavaScript('window.localStorage.setItem("twitter_token_secret", "' + query_item[2].split('=')[1] + '")')
            store.set('twitter_userid', query_item[3].split('=')[1])
            mainWindow.webContents.executeJavaScript('window.localStorage.setItem("twitter_userid", "' + query_item[3].split('=')[1] + '")')
            console.log("Twitter Connections connected as " + query_item[4].split('=')[1] + " successfully")
          }
          break;
        default:
          break;
      }
      break;
    default:
      break;
  }
})

// Run App
app.whenReady().then(async () => {
  // Tray
  menutray = new Tray(isMac ? path.join(__dirname, `/tray_icon/trayTemplate.png`) : path.join(__dirname, `/tray_icon/tray.png`))
  const contextMenu = Menu.buildFromTemplate([
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
app.on('activate', () => {
  // If the app is still open, but no windows are open,
  // create one when the app comes into focus.
  if (mainWindow === null) { createWindow() }
})

ipcMain.handle('saveFileAs', async (event, data) => {
  var saveDialogRes = await dialog.showSaveDialog(mainWindow, { title: "Save File: " + data.fileName, defaultPath: `${data.fileName}`, properties: ['createDirectory', 'showHiddenFiles'] })
  if (!saveDialogRes.canceled) {
    return saveDialogRes.filePath
  } else {
    return false
  }
})

ipcMain.on(`display-app-menu`, function (e, args) {
  if (mainWindow) {
    menu.popup({
      window: mainWindow,
      x: args.x,
      y: args.y
    });
  }
});

ipcMain.handle('openFile', async (event, data) => {
  var openDialogRes = await dialog.showOpenDialog(mainWindow, {
    title: "Open File", filters: [
      {
        "name": "all",
        "extensions": ["*"]
      },
      {
        "name": "Text File",
        "extensions": ["txt", "text", "md", "markdown"]
      },
      {
        "name": "Markdown File",
        "extensions": ["md", "markdown"]
      },
      {
        "name": "Website",
        "extensions": ["htm", "html", "css", "js", "php"]
      },
      {
        "name": "JavaScript",
        "extensions": ["js", "json", "tsx", "ts"]
      },
      {
        "name": "C++",
        "extensions": ["cpp", "cc", "C", "cxx", "h", "hpp", "hxx"],
      },
    ], properties: ['openFile', 'showHiddenFiles', 'createDirectory']
  })

  if (!openDialogRes.canceled) {
    console.log(openDialogRes)
    return openDialogRes.filePaths
  } else {
    return false
  }
})

ipcMain.on('UnsavedEditedChanges', async (event, dataraw) => {
  var data = JSON.parse(dataraw).props
  var index = JSON.parse(dataraw).index
  if (!data.docs.docs[index].saved) {
    var UnsavedDialog = dialog.showMessageBox(mainWindow, {
      type: 'question',
      buttons: ['Save', 'Discard', 'Cancel'],
      defaultId: 0,
      cancelId: 2,
      message: 'You have unsaved changes',
      detail: 'Do you want to save your changes?'
    })
      .then(async UnsavedDialog => {
        console.log(UnsavedDialog);
        if (UnsavedDialog.response === 0) {
          //await mainWindow.webContents.executeJavaScript('window.SaveFile("close")')
          event.sender.send('UnsavedEditedChoice', 3);
          return true
        } else if (UnsavedDialog.response === 1) {
          event.sender.send('UnsavedEditedChoice', 2);
          return true
        } else {
          event.sender.send('UnsavedEditedChoice', 0);
          return false
        }
      })
  } else {
    event.sender.send('UnsavedEditedChoice', 1);
    return true
  }
})

ipcMain.on("toggle-maximize-window", function (event) {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.on("window-minimize", function (event) {
  mainWindow.minimize();
});

ipcMain.on("window-close", function (event) {
  mainWindow.close();
});
