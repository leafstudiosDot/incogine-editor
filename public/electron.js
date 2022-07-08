const electron = require('electron'),
  app = electron.app,
  BrowserWindow = electron.BrowserWindow,
  Menu = electron.Menu,
  TouchBar = electron.TouchBar;

const { TouchBarLabel, TouchBarButton, TouchBarSpacer } = TouchBar

const path = require('path'),
  isDev = require('electron-is-dev');

let mainWindow;

const isMac = process.platform === 'darwin'

const menuBar = [
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { role: 'about' },
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
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
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
    icon: process.platform !== 'darwin' ? __dirname + `/icons/icon.icns` : __dirname + "/icons/icon.ico"
  });
  const appUrl = isDev ? 'http://localhost:3613' : `file://${path.join(__dirname, '../build/index.html')}`
  Menu.setApplicationMenu(menu)
  mainWindow.setTouchBar(touchBarDarwin)
  mainWindow.loadURL(appUrl, { userAgent: 'IncogineEditor-Electron' });
  mainWindow.maximize()
  mainWindow.on('closed', () => mainWindow = null)
}
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