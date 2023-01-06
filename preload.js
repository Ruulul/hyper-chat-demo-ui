const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
    join_topic: topic => ipcRenderer.invoke('join-topic', topic),
    exit: () => ipcRenderer.send('exit'),
    send_message: message => ipcRenderer.invoke('send-message', message),
    change_nick: nick => ipcRenderer.send('change-nick', nick),
    onnick: callback => ipcRenderer.on('nick', callback),
    onmessage: callback => ipcRenderer.on('new-message', callback),
    onconnect: callback => ipcRenderer.on('connect', callback),
    ondisconnect: callback => ipcRenderer.on('disconnect', callback),
})