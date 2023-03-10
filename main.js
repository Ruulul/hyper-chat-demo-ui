const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const Chat = require('hyper-chat-demo')
var chat = undefined

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
        }
    })
    win.loadFile(path.join(__dirname, 'index.html'))
    return win
}

app.whenReady().then(async () => {
    var win = createWindow()

    await Chat(undefined, notify => {
        chat = notify
        return message => {
            const { type, data } = message
            const handle = {
                message: handle_message, info: nick, update: nick, 
                connection, disconnect, connections, 
            }
            handle[type]()
            function handle_message() {
                win.webContents.send('new-message', message)
            }
            function nick() {
                win.webContents.send('nick', message)
            }
            function connection() {
                win.webContents.send('connect', message)
            }
            function connections() {
                win.webContents.send('connections', data)
            }
            function disconnect() {
                win.webContents.send('disconnect', message)
            }
        }
    })
    ipcMain.handle('join-topic', join_topic)
    ipcMain.handle('send-message', send_message)
    ipcMain.on('exit', exit)
    ipcMain.on('change-nick', (_, data) => chat({type: 'update', data}))
    ipcMain.on('connections', () => chat({type: 'connections'}))

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) win = createWindow()
    })
})

app.on('window-all-closed', async () => {
    if (process.platform !== 'darwin') {
        await exit()
        app.quit()
    }
})

async function join_topic(_, new_topic) {
    await chat({type: 'change-topic', data: new_topic})
}

async function send_message(_, message) {
    await chat({type: 'message', data: message})
}

async function exit() {
    await chat({type: 'exit'})
    console.log("Everything cleaned up!")
}