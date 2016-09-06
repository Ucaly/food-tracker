$(function() {
    //var router = new Router();
    //Backbone.history.start();

    var foodList = new FoodCollection();
    foodList.fetch({data: $.param({q: 'apple'}),
					success: function(collection, res, options) {
						//console.log("colleciton: ", collection);
						//console.log("res: ", res);
						//console.log("options: ", options);
						foodList.trigger('onFetch');
					},
					error: function() {

					}
				});

    var foodListView = new FoodListView({collection: foodList});
    var nutriDataModel = new FoodNutriDataModel();
    var nutriDataView = new FoodNutriDataView({model: nutriDataModel});
});

function executeSearch() {
	var searchStr = $('#search-text').val();
	if(searchStr) {
		foodList.fetch();	}
}

function getNutriData() {
	
}

var FoodNutriDataModel = Backbone.Model.extend({
	url: 'http://api.nal.usda.gov/ndb/nutrients/?format=json&api_key=YXoenkBYZZbIlQ3ZQjX9NbkghRRQKuMOLrC4Wgzn&nutrients=208&ndbno=',
	initialize: function() {
		if(this.ndbno) {
			this.url = this.url + this.ndbno;
		}
	},
	parse: function parse(res) {
		return res.report.foods;
	}
});

var FoodModel = Backbone.Model.extend({

});

var FoodCollection = Backbone.Collection.extend({
	model: FoodModel,
	defaults: {
		foodName: ''
	},
	url: 'http://api.nal.usda.gov/ndb/search/?format=json&sort=n&max=25&offset=0&api_key=YXoenkBYZZbIlQ3ZQjX9NbkghRRQKuMOLrC4Wgzn',
	parse: function parse(res) {
		//console.log("item length: ", res.list.item.length);
		return res.list.item;
	}
});


var FoodView = Backbone.View.extend({
	tagName: 'li',
	initialize: function() {
		this.listenTo(this.model, 'chenge', this.render);
	},
	/*template: function(data) {
		return "<li>" + data.name + ": " + data.calorie + "</li>";
	},*/
	template: _.template($('#food-item').html()),
	events: {
		'click': 'showName'
	},
	render: function() {
		//console.log('food view rendering...')
		//this.$el.empty();
		this.$el.html(this.template(this.model.toJSON()));
		//console.log(this.model.get('name'));  // This works.
		//this.$el.html('<li>' + this.model.get('name') + ': ' + this.model.get('ndbno') + '</li>');
		//this.$el.click(function(e) {
			//console.log(e.currentTarget.innerHTML);
			//nutriDataView.$el.append(e.currentTarget.innerHTML);
		//});
		return this;
	},
	showName: function(e) {
		nutriDataView.$el.append(e.currentTarget.innerHTML);
	}
});

var FoodListView = Backbone.View.extend({
	//tagName: 'ul',
	el: $('#search-result'),
	initialize: function() {
		//this.listenTo(this.colleciton, 'onFetch', this.render); // This didn't work.
		this.collection.bind('onFetch', this.render, this)
	},
	render: function() {
		//this.$el.empty();
		//var self = this;
		var ul = this.$el.find('ul');
		// iterate colleciton and initialize FoodView then append it to list.
		this.collection.each(function(food) {
			//console.log(food);
			/*self.$el.append(
			new FoodView({
				model: food
			}).render().el
			);*/
			var foodView = new FoodView({model: food});
			//console.log(self.$el);
			//self.$el.append(foodView.render().$el)
			ul.append(foodView.render().el);
		});
		return this;
	}
});

var FoodNutriDataView = Backbone.View.extend({
	el: $('#nutri-data'),
	initialize: function() {
		if(this.nameAndNo) {
			this.$el.append(nameAndNo);
		}
		_.bindAll(this, 'render');
		this.model.bind('onFetch', this.render, this)

	},
	render: function() {

	}
})

