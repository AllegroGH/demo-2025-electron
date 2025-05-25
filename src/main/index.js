import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
// import icon from '../../resources/icon.png'

import connectDB from './db';

async function getPartners() {  // при старте приложения эта функция (почему-то) вызывается 2 раза
  try {
    const response = await global.dbclient.query('SELECT * FROM get_partners_with_discount()');
    return response.rows;
  } catch (e) {
    await dialog.showMessageBox({
      type: 'error',
      title: 'Ошибка',
      message: 'Ошибка при выполнении SQL запроса',
      detail: `При выполнении SQL запроса возникла ошибка:\n${e.message}\n\nОбратитесь к технической поддержке.`,
      buttons: ['OK']
    });
  }
}

async function addPartner(event, partner) {
  try {
    const confirmation = await dialog.showMessageBox({
      type: 'warning',
      title: 'Подтверждение внесения данных в БД',
      message: 'Вы уверены, что хотите сохранить данные?',
      detail: 'Это действие добавит новую запись в базу данных.',
      buttons: ['Сохранить', 'Отмена'],
      defaultId: 1, // активная кнопка (0 - первая, 1 - вторая)
      cancelId: 1   // что считать отменой
    });
    if (confirmation.response === 1) return false;

    const { org_type, partner_name, director_ceo, email, phone, address, inn, rating } = partner;
    const response = await global.dbclient.query('SELECT create_partner_with_validation($1, $2, $3, $4, $5, $6, $7, $8) as new_id',
      [org_type, partner_name, director_ceo, email, phone, address, inn, rating]);
    const { new_id } = response.rows[0];
    dialog.showMessageBox({
      type: 'info',
      title: 'Сохранение завершено',
      message: `Партнер создан.\nДанные успешно добавлены в таблицу с ID = ${new_id}.`,
      buttons: ['OK'],
    });
    return true;
  } catch (e) {
    await dialog.showMessageBox({
      type: 'error',
      title: 'Ошибка',
      message: 'Ошибка при выполнении SQL запроса',
      detail: e.message,
      buttons: ['OK']
    });
    return false;
  }
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 850,
    show: false,
    icon: join(__dirname, '../../resources/Мастер пол.png'),
    autoHideMenuBar: true,
    //...(process.platform === 'linux' ? { icon } : {}),
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

  ipcMain.handle('getPartners', getPartners);
  ipcMain.handle('addPartner', addPartner);

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
