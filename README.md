store [![Build Status](https://travis-ci.org/nathanfaucett/js-store.svg?branch=master)](https://travis-ci.org/nathanfaucett/js-store)
=======

redux like lib

```javascript
var Store = require("@nathanfaucett/store");


var count = 0,
    store = new Store();


store.subscribe(function onDispatch(state, action) {
    console.log(state, action);
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
```
