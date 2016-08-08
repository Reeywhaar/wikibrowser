const Vue = require('../vue.js');
const decodeURI = require('../filters/decodeuri.js');
const tools = require('../tools.js');

let TabBar = Vue.extend({
	filters: {
		"decodeURI": decodeURI,
	},
	props: [
		"links",
		"current",
	],
	template: `
		<div class="tab-bar" v-el:main>
			<div v-for="(index, link) in links" class="tab" v-bind:class="{'current': current === index}" v-on:click="click($event, index)">
				<a href="{{link.url}}" title="{{link.url | decodeURI}}" v-on:click.prevent>{{link.title}}</a>
				<span v-on:click="remove($event, index)">×</span>
			</div>
		</div>
	`,
	methods: {
		click: function(event, index){
			if(event.which === 2){
				this.remove(event, index);
				return;
			};
			this.$dispatch("select", index);
		},
		remove: function(event, index){
			event.preventDefault();
			event.stopPropagation();
			this.$dispatch("remove", index);
		},
	},
	events: {
		add(){
			this.$els.main.classList.remove('an-add');
			tools.delay(10).then(()=>{
				this.$els.main.classList.add('an-add');
			});
		},
	}
});

module.exports = TabBar;