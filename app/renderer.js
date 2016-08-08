const fs = require("fs");
const Vue = require('./libs/vue.js');
const tools = require('./libs/tools.js');
const TabBar = require("./libs/components/tabbar.js");
const WebView = require("./libs/components/webview.js");
const decodeURIFilter = require("./libs/filters/decodeuri.js");
const defaultLink = require('./libs/defaultlink.js');
const links = require('./libs/links.js');
const webviewMenu = require("./libs/webviewmenu.js");

let App = new Vue({
	el: "#app",
	components: {
		'tabbar': TabBar,
		'iwebview': WebView,
	},
	filters: {
		"decodeURI": decodeURIFilter
	},
	template: `
		<div>
			<div class="controls">
				<div class="nav-bar">
					<div class="history-back button item" v-on:click="goBack()"><</div>
					<div class="history-forward button item" v-on:click="goForward()">></div>
					<div class="new-tab button item" v-on:click="makeNewTab">+</div>
					<div class="location item" >{{currentLink.url | decodeURI}}</div>
				</div>
			</div>
			<div class="content">
				<tabbar
					v-bind:links="links"
					v-bind:current="index"
					v-on:select="onTabBarSelect($arguments)"
					v-on:remove="onTabBarRemove($arguments)"
					v-ref:tabbar
				></tabbar>
				<iwebview
					v-bind:url.sync = currentLink.url
					v-bind:title.sync = currentLink.title
					v-ref:wiki
					v-on:middleclick="onMiddleClick($arguments)"
				></iwebview>
			</div>
		</div>
	`,
	data: {
		links: links,
		index: links.index
	},
	computed: {
		currentURL: {
			get(){
				return this.links[this.index].url;
			}
		},
		currentLink: {
			get(){
				return this.links[this.index];
			}
		}
	},
	methods: {
		add(link){
			this.links.add(link);
			this.$refs.tabbar.$emit("add");
		},
		remove(index){
			this.links.remove(index);
			this.index = this.links.index;
		},
		makeNewTab(event){
			this.links.push(Object.assign({}, defaultLink));
			this.links.index = this.links.length - 1;
			this.index = this.links.index;
		},
		closeCurrentTab(){
			this.remove(this.index);
		},
		goBack(){
			this.$refs.wiki.goBack();
		},
		goForward(){
			this.$refs.wiki.goForward();
		},
		onMiddleClick(event){
			this.add(event[0]);
		},
		onTabBarSelect(event){
			this.links.index = event[0];
			this.index = this.links.index;
		},
		onTabBarRemove(event){
			this.remove(event[0]);
		},
	},
});

webviewMenu.create(App.makeNewTab, App.closeCurrentTab);


