var isFunction = require("@nathanfaucett/is_function"),
    isNull = require("@nathanfaucett/is_null"),
    isUndefined = require("@nathanfaucett/is_undefined"),
    List = require("@nathanfaucett/immutable-list");


var StorePrototype = Store.prototype;


module.exports = Store;


function Data(name, fn) {
    this.name = name;
    this.fn = fn;
}


function Store() {
    this._state = null;
    this._middleware = List.EMPTY;
    this._reducers = List.EMPTY;
    this._subscribers = List.EMPTY;
}

StorePrototype.setInitialState = function(state) {
    if (isNull(this._state)) {
        this._state = state;
    } else {
        throw new Error("Store.setInitialState(state) trying to set inital state after state was set by ether dispatch or setInitialState");
    }
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

    if (subscribers.indexOf(fn) === -1) {
        _this._subscribers = subscribers.push(fn);
    }

    return function unsubscribe() {
        return _this.unsubscribe(fn);
    };
}

StorePrototype.unsubscribe = function(fn) {
    return Store_unsubscribe(this, fn);
};

function Store_unsubscribe(_this, fn) {
    var subscribers = _this._subscribers,
        index = subscribers.indexOf(fn);

    if (index !== -1) {
        _this._subscribers = subscribers.remove(index, 1);
    }

    return _this;
}

StorePrototype.dispatch = function(action) {
    return Stores_dispatchMiddleware(this, action);
};

function Stores_dispatchMiddleware(_this, action) {
    var iter = _this._middleware.iterator();

    (function next(action) {
        var it = iter.next();

        if (!it.done) {
            it.value(_this, action, next);
        } else {
            Stores_dispatch(_this, action);
        }
    }(action));
}

function Stores_dispatch(_this, action) {
    var prevState = _this._state || {},
        nextState = {},
        iter = _this._reducers.iterator(),
        it = iter.next(),
        reducer, reducerName, reducerPrevState, reducerNextState;

    while (!it.done) {
        reducer = it.value;

        reducerName = reducer.name;

        reducerPrevState = prevState[reducerName];
        reducerNextState = reducer.fn(reducerPrevState, action);

        if (isUndefined(reducerNextState)) {
            throw new Error("Store.dispatch(action) reducer " + reducerName + " return undefined");
        }

        nextState[reducerName] = reducerNextState;

        it = iter.next();
    }

    _this._state = nextState;

    Store_emit(_this, nextState, action);

    return nextState;
}

function Store_emit(_this, state, action) {
    var iter = _this._subscribers.iterator(),
        it = iter.next();

    while (!it.done) {
        it.value(state, action);
        it = iter.next();
    }
}

StorePrototype.addMiddleware = function(fn) {
    return Stores_addMiddleware(this, fn);
};

function Stores_addMiddleware(_this, fn) {
    if (!isFunction(fn)) {
        throw new Error("Store.addMiddleware(fn) trying to add " + fn + " to middleware which is not a function");
    }

    _this._middleware = _this._middleware.push(fn);

    return function removeMiddleware() {
        return _this.removeMiddleware(fn);
    };
}

StorePrototype.removeMiddleware = function(fn) {
    return Stores_removeMiddleware(this, fn);
};

function Stores_removeMiddleware(_this, fn) {
    var middleware = _this._middleware,
        index;

    if (!isFunction(fn)) {
        throw new Error("Store.removeMiddleware(fn) trying to remove " + fn + " from middleware which is not a function");
    }

    index = middleware.indexOf(fn);
    if (index !== -1) {
        _this._middleware = middleware.remove(index, 1);
    }

    return _this;
}

StorePrototype.hasMiddleware = function(fn) {
    return this._middleware.indexOf(fn) !== -1;
};

function Stores_indexOf(_this, name) {
    var iter = _this._reducers.iterator(),
        it = iter.next(),
        index = 0;

    while (!it.done) {
        if (it.value.name === name) {
            return index;
        } else {
            it = iter.next();
        }

        index += 1;
    }

    return -1;
}

StorePrototype.has = function(name) {
    if (isFunction(name)) {
        name = name.name;
    }
    return Stores_indexOf(this, name) !== -1;
};

StorePrototype.add = function(name, fn) {
    return Stores_add(this, name, fn);
};

function Stores_add(_this, name, fn) {
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
        _this._reducers = _this._reducers.push(new Data(name, fn));
    }

    return function remove() {
        return _this.remove(name);
    };
}

StorePrototype.remove = function(name) {
    return Stores_remove(this, name);
};

function Stores_remove(_this, name) {
    var index;

    if (isFunction(name)) {
        name = fn.name;
    }

    index = Stores_indexOf(_this, name);
    if (index === -1) {
        throw new Error("Store.remove(name) no reducer " + name + " in reducers");
    } else {
        _this._reducers = _this._reducers.remove(index, 1);
    }

    return _this;
}