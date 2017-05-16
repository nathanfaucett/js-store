var tape = require("tape"),
    Store = require("..");


tape("Store", function(assert) {
    var count = 0,
        store = new Store();

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

tape("Store.add/has/remove", function(assert) {
    var store = new Store(),
        remove;

    function reducer( /* state, action */ ) {}
    remove = store.add(reducer);

    assert.equals(store.has(reducer), true);
    remove();
    assert.equals(store.has(reducer), false);

    assert.end();
});

tape("Store.addMiddleware/hasMiddleware/removeMiddleware", function(assert) {
    var store = new Store(),
        removeMiddleware;

    function middleware( /* store, action, next */ ) {}
    removeMiddleware = store.addMiddleware(middleware);

    assert.equals(store.hasMiddleware(middleware), true);
    removeMiddleware();
    assert.equals(store.hasMiddleware(middleware), false);

    assert.end();
});

tape("Store.subscribe/unsubscribe", function(assert) {
    var store = new Store(),
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