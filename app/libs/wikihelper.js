const {ipcRenderer} = require('electron');
const {createDelegateListener} = require('./tools.js')

const doc = createDelegateListener(document);
doc('click', 'a', function(e){
	if(e.which == 2){
		e.preventDefault();
		const msg = {
			type: "link:middleclick",
			href: this.href,
			title: this.title || this.textContent || "New Tab",
		};
		ipcRenderer.sendToHost(msg);
	};
});

function insertGoogleSearch(){
	const mobileWikiRegex = /^https?:\/\/.{2,3}\.m\.wikipedia.org/i;
	if(!window.location.href.match(mobileWikiRegex)){
		return;
	};
	const header = document.querySelector('.pre-content.heading-holder h1');
	if(!header){
		return;
	};
	const title = header.textContent;
	const link = `https://www.google.com/search?q=${encodeURIComponent(title)}&ie=utf-8&oe=utf-8`
	const googleNode = document.createElement('a');
	googleNode.href = link;
	googleNode.textContent = "Search Google";
	googleNode.classList.add('google-search');
	header.parentNode.insertBefore(googleNode, header.nextSibling)
}

function setFocusToSearch(){
	const mobileWikiRegex = /^https?:\/\/.{2,3}\.m\.wikipedia.org\/wiki\/Заглавная_страница$/i;
	if(!decodeURI(window.location.href).match(mobileWikiRegex)){
		return;
	};
	const input = document.querySelector('.header .input-wrapper input');
	input.focus();
}

document.addEventListener('DOMContentLoaded', function(e){
	insertGoogleSearch();
	setFocusToSearch();
});