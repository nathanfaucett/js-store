var Store = require("./Store");


module.exports = createStore;


function createStore() {
    var store = new Store();

    return {
        setInitialState: function(state) {
            return store.setInitialState(state);
        },
        getState: function() {
            return store.getState();
        },
        subscribe: function(fn) {
            return store.subscribe(fn);
        },
        unsubscribe: function(fn) {
            return store.unsubscribe(fn);
        },
        dispatch: function(action) {
            return store.dispatch(action);
        },
        addMiddleware: function(fn) {
            return store.addMiddleware(fn);
        },
        removeMiddleware: function(fn) {
            return store.removeMiddleware(fn);
        },
        hasMiddleware: function(fn) {
            return store.hasMiddleware(fn);
        },
        add: function(name, fn) {
            return store.add(name, fn);
        },
        remove: function(name) {
            return store.remove(name);
        },
        has: function(fn) {
            return store.has(fn);
        }
    };
}