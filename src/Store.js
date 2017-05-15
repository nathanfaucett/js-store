var isFunction = require("@nathanfaucett/is_function"),
    isUndefined = require("@nathanfaucett/is_undefined"),
    indexOf = require("@nathanfaucett/index_of");


var StorePrototype = Store.prototype;


module.exports = Store;


function Data(name, fn) {
    this.name = name;
    this.fn = fn;
}


function Store() {
    this._state = {};
    this._middleware = [];
    this._reducers = [];
    this._subscribers = [];
}

StorePrototype.setState = function(state) {
    this._state = state;
};

StorePrototype.getState = function() {
    return this._state;
};

StorePrototype.subscribe = function(fn) {
    return Store_subscribe(this, fn);
};

function Store_subscribe(_this, fn) {
    var subscribers = _this._subscribers;

    if (!isFunction(fn)) {
        throw new Error("Store.subscribe(fn) trying to add " + fn + " to subscribers which is not a function");
    }

    if (indexOf(subscribers, fn) === -1) {
        subscribers.push(fn);
    }

    return function unsubscribe() {
        return Store_unsubscribe(this, fn);
    };
}

StorePrototype.unsubscribe = function(fn) {
    return Store_unsubscribe(this, fn);
};

function Store_unsubscribe(_this, fn) {
    var subscribers = _this._subscribers,
        index = indexOf(subscribers, fn);

    if (index !== -1) {
        subscribers.splice(index, 1);
    }

    return _this;
}

StorePrototype.dispatch = function(action) {
    return Stores_dispatchMiddleware(this, action);
};

function Stores_dispatchMiddleware(_this, action) {
    var middleware = _this._middleware,
        index = 0,
        length = middleware.length;

    (function next(action) {
        if (index < length) {
            middleware[index++](_this, action, next);
        } else {
            Stores_dispatch(_this, action);
        }
    }(action));
}

function Stores_dispatch(_this, action) {
    var prevState = _this._state,
        nextState = {},
        reducers = _this._reducers,
        i = -1,
        il = reducers.length - 1,
        reducer, reducerName, reducerPrevState, reducerNextState;

    while (i++ < il) {
        reducer = reducers[i];

        reducerName = reducer.name;

        reducerPrevState = prevState[reducerName];
        reducerNextState = reducer.fn(reducerPrevState, action);

        if (isUndefined(reducerNextState)) {
            throw new Error("Store.dispatch(action) reducer " + reducerName + " return undefined");
        }

        nextState[reducerName] = reducerNextState;
    }

    _this._state = nextState;

    Store_emit(_this, nextState);

    return nextState;
}

function Store_emit(_this, state) {
    var subscribers = _this._subscribers,
        i = -1,
        il = subscribers.length - 1;

    while (i++ < il) {
        subscribers[i](state);
    }
}

StorePrototype.has = function(name) {
    if (isFunction(name)) {
        name = name.name;
    }
    return Stores_indexOf(this, name) !== -1;
};

StorePrototype.addMiddleware = function(fn) {
    return Stores_addMiddleware(this, fn);
};

function Stores_indexOf(_this, name) {
    var reducers = _this._reducers,
        i = -1,
        il = reducers.length - 1;

    while (i++ < il) {
        reducer = reducers[i];

        if (reducer.name === name) {
            return i;
        }
    }

    return -1;
}

function Stores_addMiddleware(_this, fn) {
    if (!isFunction(fn)) {
        throw new Error("Store.addMiddleware(fn) trying to add " + fn + " to middleware which is not a function");
    }
    _this._middleware.push(fn);
}

StorePrototype.add = function(name, fn) {
    return Stores_add(this, name, fn);
};

function Stores_add(_this, name, fn) {
    var reducer;

    if (isFunction(name)) {
        fn = name;
        name = fn.name;
    }
    if (!isFunction(fn)) {
        throw new Error("Store.add(name, fn) trying to add " + fn + " to middleware which is not a function");
    }

    if (_this.has(name)) {
        throw new Error("Store.add(name, fn) reducer " + name + " already in reducers");
    } else {
        reducer = new Data(name, fn);
        _this._reducers.push(reducer);
    }

    return _this;
}

StorePrototype.remove = function(name) {
    return Stores_remove(this, name);
};

function Stores_remove(_this, name) {
    if (isFunction(name)) {
        name = fn.name;
    }

    if (!_this.has(name)) {
        throw new Error("Store.remove(name) no reducer " + name + " in reducers");
    } else {
        _this._reducers.splice(Stores_indexOf(_this, name), 1);
    }

    return _this;
}