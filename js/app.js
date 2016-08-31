var app = app || {};

app.SearchResultModel = Backbone.Model.extend({
	defaults: {
		name:'',
		ndbno: ''
	}
});

app.SearchResultCollection = Backbone.Collection.extend({
	url: function() {
		'http://blahblah' + this.searchTerm;
	},
	model: app.SearchModel,
	searchTerm: '',
	parse: function(response) {
		return response.item;
	},
	initialize: function() {
		this.listenTo(app.SearchFieldView, 'change', this.doSearch);
	}

});

app.SearchView = Backbone.View.extend({
	el: '#search-food',
	events: {
		'keyup #search-text': 'doSearch',
		'click button': 'doSearch'
	},
	initialize: function() {
		this.collection = new SearchResultCollection();
		this.listenTo(this.collection, "reset", this.render);
	},
	doSearch: function() {
		var searchTerm = $('#search-text').val();
		this.collection.fetch();// TODO: correct this
	},
	render: function() {
		var resultArray = [];
		this.collection.each(function(element) {
			resultArray.push(new SearchResultView({
				model: element
			}));
		});
	}

});

app.SearchResultView = Backbone.View.extend({
	el: '#search-result ul',
	template: _.template($('#search-result-template')),
	render: function() {
		this.$el.append(this.template(this.model.attributes));
		return this;
	}
});

//app.FoodView = Backbone.View.extend();

$(function() {
	
});



