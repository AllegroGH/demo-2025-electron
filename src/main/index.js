import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
// import icon from '../../resources/icon.png'
import connectDB from './db';
import dbOffline from './dbOffline';

// Если для enableDbOfflineMode установить значение true,
// то будет использоваться локальная БД (без подключения к СУБД) // сохранена в main/dbOffline.js
// таким образом можно оперативно запустить приложение и посмотреть его интерфейс
// будет все работать, кроме реальных SQL запросов
const enableDbOfflineMode = false;

async function getPartners() {  // при старте приложения эта функция (почему-то) вызывается 2 раза
  try {
    if (enableDbOfflineMode) return dbOffline;
    else {
      const response = await global.dbclient.query('SELECT * FROM get_partners_with_discount()');
      return response.rows;
    }
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

    await dialog.showMessageBox({
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

async function updatePartner(event, partner) {
  try {
    const confirmation = await dialog.showMessageBox({
      type: 'warning',
      title: 'Подтверждение внесения данных в БД',
      message: 'Вы уверены, что хотите сохранить данные?',
      detail: 'Это действие изменит существующую запись в базе данных.',
      buttons: ['Сохранить', 'Отмена'],
      defaultId: 1, // активная кнопка (0 - первая, 1 - вторая)
      cancelId: 1   // что считать отменой
    });
    if (confirmation.response === 1) return false;

    const { id, org_type, partner_name, director_ceo, email, phone, address, inn, rating } = partner;
    const response = await global.dbclient.query('SELECT update_partner_with_validation($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [id, org_type, partner_name, director_ceo, email, phone, address, inn, rating]);

    await dialog.showMessageBox({
      type: 'info',
      title: 'Сохранение завершено',
      message: 'Данные партнера успешно обновлены',
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

async function deletePartner(event, id) {
  try {
    const confirmation = await dialog.showMessageBox({
      type: 'warning',
      title: 'Подтверждение внесения данных в БД',
      message: 'Вы уверены, что хотите удалить партнера?',
      detail: 'Это действие удалит существующую запись из базы данных.',
      buttons: ['Удалить', 'Отмена'],
      defaultId: 1, // активная кнопка (0 - первая, 1 - вторая)
      cancelId: 1   // что считать отменой
    });
    if (confirmation.response === 1) return false;

    const response = await global.dbclient.query('SELECT delete_partner($1)', [id]);

    await dialog.showMessageBox({
      type: 'info',
      title: 'Сохранение завершено',
      message: 'Данные партнера удалены',
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
    height: 830,
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

  if (!enableDbOfflineMode) global.dbclient = await connectDB();

  ipcMain.handle('getPartners', getPartners);
  ipcMain.handle('addPartner', addPartner);
  ipcMain.handle('updatePartner', updatePartner);
  ipcMain.handle('deletePartner', deletePartner);

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
