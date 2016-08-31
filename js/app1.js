(function() {

	// Represent one food record
	var FoodModel = Backbone.Model.extend({
		parse: 

	});

	var SearchCollection = Backbone.Collection.extend({
		url: '',//USDA web service
		model: FoodModel,
		parse: // specify the property that holds food array.
	});

	var SearchResultCollection = Backbone.Collection.extend({

	});

	var FoodView = Backbone.View.extend({
		initialize() {
			this.listenTo(this.model, 'chenge', this.render)
		},
		template(data) {
			return "<p><div>" + data.name + "</div>
					<div>" + data.calorie + "</div></p>";
		},
		render() {
			this.$el.html(this.template(this.model.attributes));
			return this;
		}
	});

	var SearchView = Backbone.View.extend({
		el: '#search-food',
		events: {
			''
		}
	});

	var SearchResultView = Backbone.View.extend({

	});

	var search = new SearchCollection();
	var AppView = Backbone.View.extend({
		initialize() {
			this.listenTo(search, 'add', this.render);
			search.fetch();
		},
		render(food) {
			$('').append(
			new FoodView({
				model: food
			}).render().$el
			)
		}
	})


})();