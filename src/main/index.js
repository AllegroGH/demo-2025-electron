import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import connectDB from './db';

// async function foo(event, data) {
//   try {
//     console.log(data)
//     dialog.showMessageBox({ message: 'message back' })
//   } catch (e) {
//     dialog.showErrorBox('Ошибка', e)
//   }
// }

async function getPartners() {  // при старте приложения эта функция (почему-то) вызывается 2 раза
  try {
    const response = await global.dbclient.query('SELECT * FROM get_partners_with_discount()'); // ";" для pg в конце запроса ставить не обязательно
    return response.rows;
  } catch (e) {
    dialog.showErrorBox('Ошибка', e); // эта ошибка на фронт не выводится (почему-то)
  }
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron')

  global.dbclient = await connectDB();

  // ipcMain.handle('sendSignal', foo)
  ipcMain.handle('getPartners', getPartners);

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
