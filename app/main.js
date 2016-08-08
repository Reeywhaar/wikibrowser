const tools = require('./libs/tools.js');
const Preferences = require('./libs/preferences.js');
const electron = require('electron');
const app = electron.app;

let mainWindow;
const preferences = new Preferences();

let transformHandler = tools.debounce(function(e){
	preferences.set('window-bounds', mainWindow.getBounds());
}, 200);

function createWindow() {
	if(preferences.has("window-mode-fullscreen") && preferences.get("window-mode-fullscreen") === true){
		const {width, height} = preferences.get('window-bounds');
		mainWindow = new electron.BrowserWindow({fullscreen: true, width, height});
	}
	else if(preferences.has('window-bounds')){
		mainWindow = new electron.BrowserWindow(preferences.get('window-bounds'));
	}
	else {
		mainWindow = new electron.BrowserWindow({width: 800, height: 600});
	};
  mainWindow.loadURL(`file://${__dirname}/index.html`);
	if(tools.isDebug()){
		mainWindow.webContents.openDevTools();
	};
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
	mainWindow.on("resize", transformHandler);
	mainWindow.on("move", transformHandler);
	mainWindow.on("enter-fullscreen", function(){
		preferences.set("window-mode-fullscreen", true);
	});
	mainWindow.on("leave-fullscreen", function(){
		preferences.set("window-mode-fullscreen", false);
	});
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})