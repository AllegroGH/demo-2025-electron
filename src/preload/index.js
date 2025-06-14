import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  getPartners: () => ipcRenderer.invoke('getPartners'),
  addPartner: (partner) => ipcRenderer.invoke('addPartner', partner),
  updatePartner: (partner) => ipcRenderer.invoke('updatePartner', partner),
  deletePartner: (id) => ipcRenderer.invoke('deletePartner', id),
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.api = api;
}
