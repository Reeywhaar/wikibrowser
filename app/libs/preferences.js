const electron = require('electron');
const fs = require('fs');
const app = electron.app;

function Preferences(){
	this.location = `${app.getPath('userData')}/preferences.json`;
	try {
		fs.accessSync(this.location, fs.R_OK | fs.W_OK);
	} catch(e){
		console.log("No preferences file found. Created new one");
		fs.writeFileSync(this.location, "{}");
	};

	this.data = JSON.parse(fs.readFileSync(this.location));
}

Preferences.prototype.save = function(){
	fs.writeFileSync(this.location, JSON.stringify(this.data));
}

Preferences.prototype.has = function(key){
	return this.data.hasOwnProperty(key);
}

Preferences.prototype.set = function(key, value){
	this.data[key] = value;
	this.save();
}

Preferences.prototype.get = function(key){
	return this.data[key];
}

Preferences.prototype.remove = function(key){
	delete this.data[key];
	this.save();
}

Preferences.prototype.toArray = function(key){
	return this.data;
}

Preferences.prototype.toObject = function(key){
	return this.data;
}

module.exports = Preferences;