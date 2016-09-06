"use strict";
var app = {
    init: function() {
        this.currentId = app.createIdString(), this.tracked = new app.TrackedModel, this.searchView = new app.SearchView, this.dayView = new app.DayView, this.picker = new Pikaday({
            field: document.getElementById("datepicker"),
            position: "top left",
            onSelect: function() {
                var e = app.picker.toString();
                app.currentId = app.createIdString(new Date(e)), app.dayView.initialize()
            },
            onDraw: function() {
                app.showTracked(this)
            }
        })
    },
    showTracked: function(e) {
        _.each(app.tracked.toJSON().days, function(t) {
            var i = t.split("-"), a = i[0] === e.calendars[0].year.toString(), n = (i[1] - 1).toString() === e.calendars[0].month.toString();
            a && n && $('td[data-day="' + parseInt(i[2]) + '"]').addClass("is-selected")
        })
    },
    createIdString: function(e) {
        var t = e || new Date, i = t.getDate() > 9 ? t.getDate(): "0" + t.getDate(), a = t.getMonth() > 8 ? t.getMonth() + 1: "0" + (t.getMonth() + 1);
        return [t.getFullYear(), a, i].join("-")
    }
};
$(function() {
    app.init(), app.searchView.collection.query = "Banana", app.searchView.clearSearch(), app.searchView.renderStart(), window.setTimeout(function() {
        app.searchView.collection.fetch()
    }, 500)
}), app.FoodItemModel = Backbone.Model.extend({
    validate: function(e) {
        return e.title ? e.calories ? void 0 : "A calories attribute is required." : "Title is required."
    }
}), app.TrackedModel = Backbone.Firebase.Model.extend({
    url: new Firebase("https://sizzling-torch-7921.firebaseio.com/tracked"),
    defaults: {
        days: []
    },
    initialize: function() {
        var e = this, t = new Firebase("https://sizzling-torch-7921.firebaseio.com/tracker");
        t.on("child_added", function(t) {
            e.addDay(t.key())
        }), t.on("child_removed", function(t) {
            var i = t.key();
            e.removeDay(i)
        })
    },
    addDay: function(e) {
        this.get("days").push(e), this.save()
    },
    removeDay: function(e) {
        var t = this.get("days"), i = t.indexOf(e);
        t.splice(i, 1), this.save({
            days: t
        })
    }
}), app.DayCollection = Backbone.Firebase.Collection.extend({
    url: function() {
        var e = "https://sizzling-torch-7921.firebaseio.com/tracker/", t = app.currentId;
        return e + t
    }
}), app.SearchResultsCollection = Backbone.Collection.extend({
    query: "",
    params: {
        fields: "item_name,nf_calories",
        appId: "114d25dd",
        appKey: "cd1b70e0dfa8bd768aa1a4e7c1e880d5"
    },
    url: function() {
        return "https://api.nutritionix.com/v1_1/search/" + this.query
    },
    sync: function(e, t, i) {
        i.url = this.url(), i.data = $.param(this.params), Backbone.sync.call(this, e, t, i)
    },
    parse: function(e) {
        if (e.hits.length) {
            var t = _.map(e.hits, function(e) {
                return {
                    nutritionixId: e._id,
                    title: e.fields.item_name,
                    calories: Math.round(e.fields.nf_calories)
                }
            });
            this.reset(t)
        } else 
            this.trigger("error", this, {
                status: 200,
                statusText: "No results for this query"
            })
    }
}), app.AutocompleteCollection = Backbone.Collection.extend({
    query: "",
    url: "https://apibeta.nutritionix.com/v2/autocomplete",
    sync: function() {
        var e = this, t = {
            q: this.query,
            appId: "114d25dd",
            appKey: "cd1b70e0dfa8bd768aa1a4e7c1e880d5"
        }, i = {
            type: "GET",
            data: $.param(t),
            url: e.url,
            success: function(e) {},
            error: function(t) {
                e.trigger("error", t)
            }
        };
        return $.ajax(i)
    }
}), app.FoodItemView = Backbone.View.extend({
    tagName: "li",
    className: "list-group-item",
    template: _.template($("#food-item-template").html()),
    events: {
        "click .remove": "removeItem"
    },
    initialize: function() {
        if (!this.model)
            throw new Error("You must provide a FoodItemModel to instantiate the view.")
    },
    render: function() {
        return this.$el.html(this.template(this.model.toJSON())), this
    },
    removeItem: function() {
        app.dayView.collection.remove(this.model)
    }
}), app.DayView = Backbone.View.extend({
    el: "#day-view",
    initialize: function() {
        this.list = this.$("#food-list"), this.collection = new app.DayCollection, this.listenTo(this.collection, "sync", this.renderStart), this.listenTo(this.collection, "add", this.renderStart)
    },
    renderStart: function() {
        var e = this;
        this.renderDate(), this.list.slideUp(200, function() {
            e.$(".loading").show(), e.list.empty(), e.render()
        })
    },
    render: function() {
        var e = document.createDocumentFragment();
        if (this.collection.length) {
            var t = [];
            this.collection.each(function(e) {
                t.push(new app.FoodItemView({
                    model: e
                }))
            }), _.each(t, function(t) {
                e.appendChild(t.render().el)
            })
        } else 
            $("<li/>", {
                "class": "list-group-item list-empty",
                text: "Use the search bar to search for a food item, and click on a search result to add it."
            }).appendTo(e);
        return this.$(".loading").hide(), this.list.append(e).slideDown(), this.renderCalorieCount(), this
    },
    renderCalorieCount: function() {
        var e = _.reduce(this.collection.models, function(e, t) {
            return e + t.get("calories")
        }, 0);
        this.$("#total-calories").html(e)
    },
    renderDate: function() {
        var e = new Date(app.currentId), t = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        };
        this.$("#datepicker").html(e.toLocaleDateString("en-US", t))
    }
}), app.SearchItemView = Backbone.View.extend({
    tagName: "li",
    className: "list-group-item",
    template: _.template($("#search-item-template").html()),
    errorTemplate: _.template($("#search-item-error-template").html()),
    events: {
        click: "trackItem"
    },
    initialize: function() {
        if (!this.model)
            throw new Error("You must provide data to instantiate the view.")
    },
    render: function() {
        return this.$el.html(this.template(this.model.toJSON())), this
    },
    renderError: function() {
        return this.$el.html(this.errorTemplate(this.model.toJSON())), this
    },
    trackItem: function(e) {
        e.preventDefault();
        var t = this.model.clone().set("id", + new Date);
        app.dayView.collection.add(t), app.searchView.clearSearch()
    }
}), app.SearchView = Backbone.View.extend({
    el: "#search-view",
    events: {
        "keyup #search-bar": "handleKeyInput",
        "click .remove": "clearSearch"
    },
    initialize: function() {
        this.collection = new app.SearchResultsCollection, this.autocompleteCollection = new app.AutocompleteCollection, this.listenTo(this.collection, "reset", this.render), this.listenTo(this.collection, "error", function(e, t) {
            this.renderError(t.status, t.statusText)
        }), this.results = $("#search-results")
    },
    render: function() {
        var e = this, t = [];
        this.collection.each(function(e) {
            t.push(new app.SearchItemView({
                model: e
            }))
        });
        var i = document.createDocumentFragment();
        _.each(t, function(e) {
            i.appendChild(e.render().el)
        }), this.$(".loading").slideUp(400, function() {
            e.results.append(i).slideDown()
        })
    },
    handleKeyInput: function(e) {
        var t = $("#search-bar").val().trim();
        t ? 13 === e.keyCode ? this.searchOnEnter(t) : this.autocomplete(t) : this.clearSearch()
    },
    autocomplete: function(e) {
        this.autocompleteCollection.query = e, this.autocompleteCollection.fetch({
            reset: !0
        })
    },
    searchOnEnter: function(e) {
        this.clearSearch(), this.renderStart(), this.collection.query = e, this.collection.fetch()
    },
    clearSearch: function() {
        var e = this;
        this.$("h3").slideUp(), this.$(".error").slideUp(), this.results.slideUp(function() {
            e.results.empty()
        }), $("#search-bar").val("").focus()
    },
    renderStart: function() {
        this.$(".loading").slideDown(), this.$("h3").slideDown()
    },
    renderError: function(e, t) {
        var i = this, a = "Statuscode " + e + ": " + t;
        console.warn(a), this.$(".loading").slideUp(400, function() {
            i.results.append(new app.SearchItemView({
                model: new Backbone.Model({
                    error: a
                })
            }).renderError().el).slideDown()
        })
    }
});

