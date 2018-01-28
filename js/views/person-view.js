app = app || {}

app.views.Person = Backbone.View.extend({

    tagName: "li",

    template: _.template($("#person-template").html()),

    attributes: function () {
        return {
            class: "person " + this.model.get("type")
        }
    },

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }

});

app.views.People = Backbone.View.extend({

    el: '#wrapper',

    initialize: function (data) {
        this.collection = new app.collections.People(data);
        this.render();

        this.$('#filters').html(this.createFilters());

        this.on("change:searchFilter", this.filterBySearch, this);
        this.on("change:filterType", this.filterByType, this);
        this.collection.on('reset', this.render, this);
    },

    events: {
        "keyup #search": 'searchFilter',
        "click .filter": 'setFilter',
    },

    getTypes: function () {
        return _.uniq(this.collection.pluck('type'));
    },

    createFilters: function () {
        var filters = '<a class="filter" href="#all">all</a> ';
        _.each(this.getTypes(), function (filter) {
            filters += '<a class="filter" href="' + filter + '">' + filter + '</a> ';
        });
        return filters;
    },

    render: function () {
        $("#listing").empty();
        _.each(this.collection.models, function (person) {
            this.renderPerson(person);
        }, this);
    },

    renderPerson: function (person) {
        var newperson = new app.views.Person({
            model: person
        });
        $("#listing").append(newperson.render().el);
    },

    setListLength: function (l) {
        $("#count").html(l);
    },

    searchFilter: function (e) {
        this.filterSearch = e.target.value;
        this.trigger("change:searchFilter");
    },

    filterBySearch: function () {
        this.collection.reset(directoryData, {silent: true});
        var filterSearch = this.filterSearch,
            filtered = _.filter(this.collection.models, function (item) {
                return item.get("lastname").toLowerCase().indexOf(filterSearch.toLowerCase()) != -1;
            });
        this.collection.reset(filtered);
    },

    setFilter: function (e) {
        e.preventDefault();
        this.filterType = e.currentTarget.innerHTML;
        this.trigger("change:filterType");
    },

    filterByType: function () {
        if (this.filterType == "all") {
            this.collection.reset(directoryData);
            appRouter.navigate('filter/all');
            this.setListLength(directoryData.length);
        } else {
            this.collection.reset(directoryData, {silent: true});
            var filterType = this.filterType;
                filtered = _.filter(this.collection.models, function (item) {
                    return item.get("type") == filterType;
                });
            appRouter.navigate('filter/' + filterType);
            this.setListLength(filtered.length);
            this.collection.reset(filtered);
        }
    }

});
