const {remote: Remote, clipboard} = require('electron');
const {Menu, MenuItem} = Remote;
const template = require("./defaultmenu.js")();
const tools = require("./tools.js")

function getWebViewContextMenu(event){
	const menu = new Menu();
	menu.append(new MenuItem({
		label: 'Reload',
		click(){
			event.view.reload();
		},
	}));
	menu.append(new MenuItem({
		label: 'Copy URL',
		click(){
			clipboard.writeText(event.view.src);
		},
	}));
	menu.append(new MenuItem({
		type:"separator",
	}));
	menu.append(new MenuItem({
		label: 'Inspect Element',
		click(){
			event.view.inspectElement(event.cursor.x, event.cursor.y);
		}
	}));
	menu.append(new MenuItem({
		label: 'Open DevTools',
		click(){
			event.view.openDevTools();
		}
	}));

	return menu;
}

exports.create = function(newtabHandler, closetabHandler){
	const windowListener = tools.createDelegateListener(window);
	windowListener('contextmenu', 'webview', function(e){
		e.preventDefault();
		const viewRect = this.getBoundingClientRect();
		const options = {
			view: this,
			cursor: {
				x: e.clientX - viewRect.left,
				y: e.clientY - viewRect.top,
			},
		};
		const webViewContextMenu = getWebViewContextMenu(options);
		webViewContextMenu.popup(Remote.getCurrentWindow());
	});

	template[1].submenu.push({
		label: 'New Tab',
		accelerator: 'CmdOrCtrl+T',
		click(item, focusedWindow) {
			newtabHandler();
		},
	});
	template[1].submenu.push({
		label: 'Close Tab',
		accelerator: 'CmdOrCtrl+W',
		click(item, focusedWindow) {
			closetabHandler();
		},
	});

	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);

	return menu;
}