var tape = require("tape"),
    Store = require("..");


tape("Store", function(assert) {
    var count = 0,
        store = new Store();

    store.subscribe(function onDispatch(state) {
        assert.equals(state.counter.count, count);
    });

    store.addMiddleware(function counterMiddleware(store, action, next) {
        switch (action.type) {
            case "INC":
                return store.dispatch({
                    type: "INC_SUCCESS",
                    count: ++count
                });
            case "DEC":
                return store.dispatch({
                    type: "DEC_SUCCESS",
                    count: --count
                });
            default:
                return next(action);
        }
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

    store.setState({
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

    assert.end();
});