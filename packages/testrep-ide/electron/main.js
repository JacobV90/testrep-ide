const path = require('path')
const os = require('os')
const { spawn } = require('child_process')
const { app, BrowserWindow, ipcMain } = require('electron')
const {isDev} = require('electron-is-dev')
const webdriver = require('selenium-webdriver')
const { resolveDriverName } = require('@seleniumhq/get-driver')
const { channels } = require('../src/shared/constants');

app.commandLine.appendSwitch('remote-debugging-port', '8315')

app.on('ready', async () => {
  const isDev = process.env.ELECTRON_START_URL ? true: false
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../index.html'),
    protocol: 'file:',
    slashes: true,
  });

  // Create the browser window.
  let win = new BrowserWindow({
    width: 1300,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js') 
    },
  })

  let testWin = new BrowserWindow({
    width: 1460,
    height: 840,
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true
    },
  })

  // and load the index.html of the app.
  win.loadURL(startUrl);
  testWin.loadFile(path.resolve(__dirname, '../public/testWindowIndex.html'))
  
  win.on('close', () => {
    win = null
  })


  console.log(isDev)

  if(isDev){
    win.webContents.openDevTools()
  }

  app.on('window-all-closed', () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  spawn(
    path
      .resolve(
        __dirname,
        '../files',
        resolveDriverName({
          browser: 'electron',
          platform: os.platform(),
          version: process.versions.electron,
        })
      )
      .replace('app.asar', 'app.asar.unpacked')
  )

  const driver = await new webdriver.Builder()
    // The "9515" is the port opened by chrome driver.
    .usingServer('http://localhost:9515')
    .withCapabilities({
      'goog:chromeOptions': {
        // connect to the served electron DevTools
        debuggerAddress: 'localhost:8315',
        windowTypes: ['webview'],
      },
    })
    .forBrowser('chrome')
    .build()

  testWin.show()

  await driver.executeScript(
    'document.getElementById("aut").src = "https://google.com"'
  )
})

ipcMain.on(channels.APP_INFO, (event) => {
  console.log('got message from renderer process')
  event.sender.send(channels.APP_INFO, {
    appName: app.name,
    appVersion: app.getVersion(),
  });
});