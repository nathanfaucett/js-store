store [![Build Status](https://travis-ci.org/nathanfaucett/js-store.svg?branch=master)](https://travis-ci.org/nathanfaucett/js-store)
=======

redux like lib

```javascript
var createStore = require("@nathanfaucett/store");


var count = 0,
    store = createStore();

store.subscribe(function onDispatch(state, action) {
    console.log(state, action);
});

store.addMiddleware(function counterMiddleware(store, action, next) {
    switch (action.type) {
        case "INC":
            store.dispatch({
                type: "INC_DONE",
                count: ++count
            });
            break;
        case "DEC":
            store.dispatch({
                type: "DEC_DONE",
                count: --count
            });
            break;
    }

    next(action);
});
store.add(function counter(state, action) {
    switch (action.type) {
        case "INC_DONE":
            return {
                count: action.count
            };
        case "DEC_DONE":
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
```
