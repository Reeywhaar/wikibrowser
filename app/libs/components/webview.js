const Vue = require('../vue.js');
const fs = require('fs');
const path = require('path');

let WebView = Vue.extend({
	props: [
		"url",
		"title",
	],
	template: `
		<webview
			plugins
			preload="./libs/wikihelper.js"
			class="wiki"
			v-bind:src="url"
			v-on:ipc-message="onIpc"
			v-on:will-navigate="onLocationChange($event)"
			v-on:page-title-updated="onTitleChange($event)"
			v-on:dom-ready="onReady($event)"
			v-on:console-message="onConsoleMessage"
			v-el:view
			partition="persist:wiki";
			blinkfeatures="CSSVariables"
		></webview>
	`,
	methods: {
		onIpc(event){
			if(event.channel.type === "link:middleclick"){
				const link = {
					url: event.channel.href,
					title: event.channel.title,
				};
				this.$dispatch("middleclick", link);
			};
		},
		onLocationChange(event){
			if(this.url !== event.url){
				this.url = event.url;
			};
		},
		onTitleChange(event, index){
			this.title = event.title.replace(" — Википедия", "");
		},
		onConsoleMessage(e){
			if(e.message.indexOf("\\o/ Hey!") === 0){
				return;
			};
			console.log(e.message);
		},
		onReady(event){
			const cssPath = `${path.dirname(path.dirname(__dirname))}/wiki.css`;
			fs.readFile(cssPath, 'utf8', (err, data) => {
				if (err){
					throw err;
				};
				event.target.insertCSS(data);
			});
		},
		goBack(){
			this.$els.view.goBack();
		},
		goForward(){
			this.$els.view.goForward();
		},
	}
});

module.exports = WebView;