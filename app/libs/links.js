const defaultLink = require("./defaultlink.js");

const localStoragePointer = 'wikibrowser-links';
const localStorageIndexPointer = 'wikibrowser-current';
const localStorageVersionPointer = 'wikibrowser-version';
const tools = require('./tools.js');
let links = [];

const localStorageHandler = {
	set(item, key, value){
		item[key] = value;
		links.save();
		return true;
	},
};

const migrations = [
	function(data){
		let has = function(arr, key, value){
			for(let item of arr){
				if(item.hasOwnProperty(key) && item['key'] === value){
					return true;
				};
			};
			return false;
		};

		const out = data.map(x => {
			let hash = tools.getHash();
			while(has(data, "id", hash)){
				hash = tools.getHash();
			};
			x.id = hash;
			return x;
		});
		return out;
	},
];

function setLocalStorage(){
	function checkItems(){
		let links = localStorage.getItem(localStoragePointer);
		if(!links){
			localStorage.setItem(localStoragePointer, JSON.stringify([defaultLink]));
			return;
		} else {
			try{
				links = JSON.parse(links);
			}
			catch(e){
				if(e instanceof SyntaxError){
					localStorage.setItem(localStoragePointer, JSON.stringify([defaultLink]));
				} else {
					throw e;
				};
				return;
			};
		};
		if(!Array.isArray(links)){
			localStorage.setItem(localStoragePointer, JSON.stringify([defaultLink]));
			return;
		};
	};

	function checkIndex(){
		let index = localStorage.getItem(localStorageIndexPointer);
		if(!index || !index.match(/^\d*$/g)){
			localStorage.setItem(localStorageIndexPointer, 0);
			return;
		};
	};

	function checkVersion(){
		let version = localStorage.getItem(localStorageVersionPointer);
		if(!version || !version.match(/^\d*$/g)){
			localStorage.setItem(localStorageVersionPointer, 0);
			return;
		};
	};

	checkVersion();
	checkIndex();
	checkItems();
};

setLocalStorage();

function migrate(version, data){
	let currentVersion = parseInt(localStorage.getItem(localStorageVersionPointer), 10);

	while(currentVersion < version){
		data = migrations[currentVersion](data);
		currentVersion++;
		localStorage.setItem(localStorageVersionPointer, currentVersion);
	};

	localStorage.setItem(localStoragePointer, JSON.stringify(data));
};

migrate(migrations.length, JSON.parse(localStorage.getItem(localStoragePointer)));

Object.defineProperties(links, {
	'index': {
		value: (function(){
			const current = parseInt(localStorage.getItem(localStorageIndexPointer), 10);
			if(!current){
				return 0;
			};
			return current;
		})(),
		writable: true,
	},
	"current": {
		get(){
			return this[this.index];
		}
	},
	"isCurrent": {
		value: function(index){
			return this.index === index;
		},
	},
	"has":{
		value: function(key, value){
			for(let item of this){
				if(item.hasOwnProperty(key) && item[key] === value){
					return true;
				};
			};
			return false;
		},
	},
	"add": {
		value: function(link){
			if(this.has("url", link.url)){
				return;
			};
			this.splice(this.index+1, 0, link);
		},
	},
	"remove": {
		value: function(index){
			if(this.length < 2){
				return;
			};
			if(index < this.index){
				this.index = this.index - 1;
			};
			if(index === this.index){
				if(index === this.length - 1){
					this.index = this.index - 1;
				};
			};
			this.splice(index, 1);
		},
	},
	"save":{
		value: tools.debounce(function(){
			localStorage.setItem(localStoragePointer, JSON.stringify(this));
		}, 10),
	},
	"init": {
		value: function(){
			let links = localStorage.getItem(localStoragePointer);
			if(!links){
				links = [defaultLink];
			} else {
				links = JSON.parse(links);
			};
			if(!Array.isArray(links)){
				links = [defaultLink];
			};
			for(let item of links){
				this.push(new Proxy(item, localStorageHandler));
			};
			return;
		}
	}
});

links.init();
links = new Proxy(links, {
	set(target, key, value){
		const isArrayAccess = (key)=>{
			return typeof key === "number" || (typeof key === "string" && key.match(/^\d*$/g));
		};

		if(key === "index"){
			if(typeof value !== "number"){
				throw new TypeError("value must be number");
			};
			if(value < 0 || value > this.length){
				throw new Error("Index overflow");
			};
			target[key] = value;
			localStorage.setItem(localStorageIndexPointer, value);
			return true;
		}
		else if(isArrayAccess(key)){
			if(!("id" in value)){
				let hash = tools.getHash();
				while(target.has("id", hash)){
					hash = tools.getHash();
				};
				value.id = hash;
			};
			target[key] = new Proxy(value, localStorageHandler);
			target.save();
		}
		else {
			target[key] = value;
		};
		return true;
	},
	deleteProperty(target, key){
		Reflect.deleteProperty(target, key);
		target.save();
		return true;
	},
});

module.exports = links;