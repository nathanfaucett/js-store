var tape = require("tape"),
    createStore = require("..");


tape("store", function(assert) {
    var count = 0,
        store = createStore();

    store.subscribe(function onDispatch(state, action) {
        if (typeof(action.count) === "number") {
            assert.equals(state.counter.count, count);

            if (state.counter.count === 0) {
                assert.end();
            }
        }
    });

    store.addMiddleware(function counterMiddleware(store, action, next) {
        switch (action.type) {
            case "INC":
                setTimeout(function() {
                    store.dispatch({
                        type: "INC_SUCCESS",
                        count: ++count
                    });
                }, 100);
                break;
            case "DEC":
                setTimeout(function() {
                    store.dispatch({
                        type: "DEC_SUCCESS",
                        count: --count
                    });
                }, 100);
                break;
        }

        next(action);
    });
    store.add(function counter(state, action) {
        switch (action.type) {
            case "INC_SUCCESS":
                return {
                    count: action.count
                };
            case "DEC_SUCCESS":
                return {
                    count: action.count
                };
            default:
                return state;
        }
    });

    store.setInitialState({
        counter: {
            count: 0
        }
    });

    store.dispatch({
        type: "INC"
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

    store.dispatch();
    assert.equals(called, true);

    unsubscribe();
    called = false;

    store.dispatch();
    assert.equals(called, false);

    assert.end();
});