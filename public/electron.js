const electron = require('electron'),
  app = electron.app,
  session = electron.session,
  BrowserWindow = electron.BrowserWindow,
  Menu = electron.Menu,
  dialog = electron.dialog, 
  ipcMain = electron.ipcMain,
  remote = electron.remote,
  TouchBar = electron.TouchBar;

const { TouchBarLabel, TouchBarButton, TouchBarSpacer } = TouchBar

const path = require('path'),
  isDev = require('electron-is-dev');

const os = require('os')

const reactDevToolsPath = path.join(
  os.homedir(),
  '/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.24.7_4'
)


let mainWindow;

const isMac = process.platform === 'darwin'

const menuBar = [
  ...(isMac ? [{
    label: app.name,
    submenu: [
      {
        label: 'About Incogine Editor',
        role: 'about'
      },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
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
        label: 'Save File',
        accelerator: 'CmdOrCtrl+S',
        click: () => { mainWindow.webContents.executeJavaScript('window.SaveFile()') }
      },
      { type: 'separator' },
      isMac ? { role: 'close' } : { role: 'quit' }
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
}
app.whenReady().then(async () => {
  await session.defaultSession.loadExtension(reactDevToolsPath)
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
    return true
  } else {
    return false
  }
})