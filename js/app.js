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
    $('#calorie-btn').click(function(e) {
    	
    })
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
		if(this.attributes.ndbno) {
			this.url = this.url + this.attributes.ndbno;
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
		this.$el.html(this.template(this.model.toJSON())).addClass('list-group-item');
		//console.log(this.model.get('name'));  // This works.
		//this.$el.html('<li>' + this.model.get('name') + ': ' + this.model.get('ndbno') + '</li>');
		//this.$el.click(function(e) {
			//console.log(e.currentTarget.innerHTML);
			//nutriDataView.$el.append(e.currentTarget.innerHTML);
		//});
		return this;
	},
	showName: function(e) {
		e.preventDefault();
		this.model.trigger('selected', this.model);
		//nutriDataView.$el.append(e.currentTarget.innerHTML);
		//console.log('item clicked', e.currentTarget.innerHTML);
		//var foodDataView = new FoodNutriDataView({nameAndNo: e.currentTarget.innerHTML});
		var foodDataView = new FoodNutriDataView({nameAndNo:e.currentTarget.innerHTML});

		$that = $(this);
		$that.parent().find('li').removeClass('active');
		$that.addClass('active');
	}
});

var FoodListView = Backbone.View.extend({
	//tagName: 'ul',
	el: $('#search-result'),
	events: {
		'change': 'changeHandler',
	},
	initialize: function() {
		//this.listenTo(this.colleciton, 'onFetch', this.render); // This didn't work.
		this.collection.bind('onFetch', this.render, this);
		this.collection.on('selected', this.selectedModel, this);
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
	},
	selectedModel: function(model) {
		var selectedNo = model.get('ndbno');
		//console.log('model selected: ', model.get('ndbno'));
		var nutriDataModel = new FoodNutriDataModel({ndbno: selectedNo});
		console.log(nutriDataModel);
    	nutriDataModel.fetch({
					success: function(res, options) {
						//console.log("colleciton: ", collection);
						console.log("res: ", res);
						console.log("options: ", options);
						//foodList.trigger('onFetch');
					},
					error: function() {

					}}
				);
	},
	changeHandler: function() {
		this.trigger('itemChanged');
	}
});

var FoodNutriDataView = Backbone.View.extend({
	el: $('#nutri-data'),
	initialize: function(options) {
		if(options) {
			this.$el.append(options.nameAndNo);
		}
		_.bindAll(this, 'render');
		//this.model.bind('onFetch', this.render, this)

	},
	render: function() {
		
	}
})

