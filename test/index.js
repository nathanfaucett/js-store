var tape = require("tape"),
    createStore = require("..");


tape("store", function(assert) {
    var COUNT = 1,
        store = createStore();

    store.subscribe(function onDispatch(state) {
        assert.equals(state.counter.count, COUNT);

        if (state.counter.count === 0) {
            assert.deepEquals(STATES, [{
                state: {
                    counter: {
                        count: 1
                    }
                },
                action: {
                    type: "INC"
                }
            }, {
                state: {
                    counter: {
                        count: 1
                    }
                },
                action: {
                    type: "DEC"
                }
            }, {
                state: {
                    counter: {
                        count: 1
                    }
                },
                action: {
                    type: "DEC"
                }
            }, {
                state: {
                    counter: {
                        count: 2
                    }
                },
                action: {
                    type: "INC_DONE",
                    newCount: 2
                }
            }, {
                state: {
                    counter: {
                        count: 1
                    }
                },
                action: {
                    type: "DEC_DONE",
                    newCount: 1
                }
            }]);
            assert.end();
        }
    });

    var STATES = [];

    store.addMiddleware(function dispatch(store, action, next) {
        var nextState = next(action);

        STATES.push({
            state: nextState,
            action: action
        });

        return nextState;
    });
    store.addMiddleware(function counterMiddleware(store, action, next) {
        switch (action.type) {
            case "INC":
                setTimeout(function onSetTimeout() {
                    store.dispatch({
                        type: "INC_DONE",
                        newCount: ++COUNT
                    });
                }, 0);
                break;
            case "DEC":
                setTimeout(function onSetTimeout() {
                    store.dispatch({
                        type: "DEC_DONE",
                        newCount: --COUNT
                    });
                }, 0);
                break;
        }
        return next(action);
    });
    store.add(function counter(state, action) {
        switch (action.type) {
            case "INC_DONE":
                return {
                    count: action.newCount
                };
            case "DEC_DONE":
                return {
                    count: action.newCount
                };
            default:
                return state;
        }
    });

    store.setInitialState({
        counter: {
            count: COUNT
        }
    });

    store.dispatch({
        type: "INC"
    });
    store.dispatch({
        type: "DEC"
    });
    store.dispatch({
        type: "DEC"
    });
});

tape("store.add/has/remove", function(assert) {
    var store = createStore(),
        remove;

    function reducer( /* state, action */ ) {}
    remove = store.add(reducer);

    assert.equals(store.has(reducer), true);
    remove();
    assert.equals(store.has(reducer), false);

    assert.end();
});

tape("store.addMiddleware/hasMiddleware/removeMiddleware", function(assert) {
    var store = createStore(),
        removeMiddleware;

    function middleware( /* store, action, next */ ) {}
    removeMiddleware = store.addMiddleware(middleware);

    assert.equals(store.hasMiddleware(middleware), true);
    removeMiddleware();
    assert.equals(store.hasMiddleware(middleware), false);

    assert.end();
});

tape("store.subscribe/unsubscribe", function(assert) {
    var store = createStore(),
        called = false,
        unsubscribe;

    function subscriber( /* state, action */ ) {
        called = true;
    }
    unsubscribe = store.subscribe(subscriber);

    store.dispatch({
        type: "TEST"
    });
    assert.equals(called, true);

    unsubscribe();
    called = false;

    store.dispatch({
        type: "TEST"
    });
    assert.equals(called, false);

    assert.end();
});