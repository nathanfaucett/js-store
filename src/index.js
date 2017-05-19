var isFunction = require("@nathanfaucett/is_function"),
    isNull = require("@nathanfaucett/is_null"),
    isUndefined = require("@nathanfaucett/is_undefined"),
    List = require("@nathanfaucett/immutable-list");


module.exports = createStore;


function createStore() {
    var currentState = null,
        middleware = List.EMPTY,
        reducers = List.EMPTY,
        subscribers = List.EMPTY,
        store = {
            setInitialState: setInitialState,
            setState: setState,
            getState: getState,

            subscribe: subscribe,
            unsubscribe: unsubscribe,

            dispatch: dispatch,

            addMiddleware: addMiddleware,
            removeMiddleware: removeMiddleware,
            hasMiddleware: hasMiddleware,

            addAndComposeReduxStore: addAndComposeReduxStore,
            addReduxStore: addReduxStore,

            add: add,
            remove: remove,
            has: has
        };

    function setInitialState(state) {
        if (isNull(currentState)) {
            currentState = state;
        } else {
            throw new Error("setInitialState(state) trying to set inital state after state was set by ether dispatch or setInitialState");
        }
    }

    function setState(state) {
        currentState = state;
    }

    function getState() {
        return currentState;
    }

    function subscribe(fn) {
        if (!isFunction(fn)) {
            throw new Error("subscribe(fn) trying to add " + fn + " to subscribers which is not a function");
        }

        if (subscribers.indexOf(fn) === -1) {
            subscribers = subscribers.unshift(fn);
        }

        return function unsubscribeFn() {
            return unsubscribe(fn);
        };
    }

    function unsubscribe(fn) {
        var index = subscribers.indexOf(fn);

        if (index !== -1) {
            subscribers = subscribers.remove(index, 1);
        }
    }

    function dispatch(action) {
        var iter = middleware.iterator();

        return (function next(action) {
            var localStore = store,
                it = iter.next();

            if (!it.done) {
                return it.value(localStore, action, next);
            } else {
                return dispatchReducers(action);
            }
        }(action));
    }

    function dispatchReducers(action) {
        var prevState = currentState || {},
            nextState = {},
            iter = reducers.iterator(),
            it = iter.next(),
            reducer, reducerName, reducerPrevState, reducerNextState;

        while (!it.done) {
            reducer = it.value;

            reducerName = reducer.name;

            reducerPrevState = prevState[reducerName];
            reducerNextState = reducer.fn(reducerPrevState, action);

            if (isUndefined(reducerNextState)) {
                throw new Error("dispatch(action) reducer " + reducerName + " return undefined");
            }

            nextState[reducerName] = reducerNextState;

            it = iter.next();
        }

        currentState = nextState;
        emit();

        return nextState;
    }

    function emit() {
        var state = currentState,
            iter = subscribers.iterator(),
            it = iter.next();

        while (!it.done) {
            it.value(state);
            it = iter.next();
        }
    }

    function addMiddleware(fn) {
        if (!isFunction(fn)) {
            throw new Error("addMiddleware(fn) trying to add " + fn + " to middleware which is not a function");
        }

        middleware = middleware.unshift(fn);

        return function removeMiddlewareFn() {
            return removeMiddleware(fn);
        };
    }

    function removeMiddleware(fn) {
        var index;

        if (!isFunction(fn)) {
            throw new Error("removeMiddleware(fn) trying to remove " + fn + " from middleware which is not a function");
        }

        index = middleware.indexOf(fn);
        if (index !== -1) {
            middleware = middleware.remove(index, 1);
        }
    }

    function hasMiddleware(fn) {
        return middleware.indexOf(fn) !== -1;
    }

    function addAndComposeReduxStore(createStore, preloadedState, config) {
        return addReduxStore(
            createStore(
                function reducer( /* state, action */ ) {
                    return getState();
                },
                preloadedState,
                config
            )
        );
    }

    function addReduxStore(reduxStore) {
        var reduxStoreUnsubscribe, unsubscribe;

        if (!isFunction(reduxStore.dispatch) ||
            !isFunction(reduxStore.subscribe) ||
            !isFunction(reduxStore.getState)
        ) {
            throw new Error("addStoreToMiddleware(store) trying to add store that does not implement one of dispatch, subscribe or getState");
        }

        function middleware(store, action, next) {
            return next(reduxStore.dispatch(action));
        }

        reduxStoreUnsubscribe = reduxStore.subscribe(function() {
            setState(reduxStore.getState());
            emit();
        });
        unsubscribe = addMiddleware(middleware);

        return function unsubscribeFn() {
            reduxStoreUnsubscribe();
            unsubscribe();
        };
    }

    function indexOf(name) {
        var iter = reducers.iterator(),
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

    function has(name) {
        if (isFunction(name)) {
            name = name.name;
        }
        return indexOf(name) !== -1;
    }

    function add(name, fn) {
        if (isFunction(name)) {
            fn = name;
            name = fn.name;
        }
        if (!isFunction(fn)) {
            throw new Error("add(name, fn) trying to add " + fn + " to middleware which is not a function");
        }

        if (has(name)) {
            throw new Error("add(name, fn) reducer " + name + " already in reducers");
        } else {
            reducers = reducers.unshift({
                name: name,
                fn: fn
            });
        }

        return function removeFn() {
            return remove(name);
        };
    }

    function remove(name) {
        var index;

        if (isFunction(name)) {
            name = fn.name;
        }

        index = indexOf(name);
        if (index === -1) {
            throw new Error("remove(name) no reducer " + name + " in reducers");
        } else {
            reducers = reducers.remove(index, 1);
        }
    }


    return store;
}