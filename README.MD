# redux-breeze-plugin-better-promise
> [redux-better-promise](https://github.com/Lukasz-pluszczewski/redux-better-promise) plugin for [redux-breeze](https://github.com/Lukasz-pluszczewski/reduxBreeze)

## Usage
#### Install
```bash
npm i redux-breeze-plugin-better-promise
```

#### Apply plugin
```javascript
import createBreeze from 'redux-breeze';
import reduxBetterPromisePlugin from 'redux-breeze-plugin-better-promise';

export const breezeInstance = createBreeze(actionsDefinitions, config, reduxBetterPromisePlugin);
```

#### Create simple async or sync action
Add action definition:
```javascript
const actionsDefinitions = {
  foo: {
    bar: {
      type: 'better-promise',
      async: actionParam => Promise.resolve(actionParam)
    },
    baz: {
      type: 'better-promise',
      sync: actionParam => return actionParam * 2,
    },
  },
};
```

Then you will see initial state that looks like this:
```javascript
{
  foo: {
    pending: {
      bar: false,
      baz: false,
    },
    lastSucceeded: {
      bar: false,
      baz: false,
    },
    lastFailed: {
      bar: false,
      baz: false,
    },
    failed: {
      bar: false,
      baz: false,
    },
    succeeded: {
      bar: false,
      baz: false,
    },
    lastSucceeded: {
      bar: false,
      baz: false,
    },
    error: {
      bar: null,
      baz: null,
    },
    result: {
      bar: null,
      baz: null,
    },
  },
}
```

Use it:
```javascript
import breezeInstance from 'breezeInstance';

...

handleClick = () => {
  this.props.bar(param);
}

...

connect(
  state => ({
    pending: state.foo.pending.bar, // boolean, if true action has started but has not been resolved or rejected yet
    succeeded: state.foo.succeeded.bar, // boolean, if true action has succeeded at least once since last reload
    failed: state.foo.failed.bar, // boolean, if true action has failed at least once since last reload
    lastSucceeded: state.foo.lastSucceeded.bar, // boolean, if true action suceeded last time
    lastFailed: state.foo.lastFailed.bar, // boolean, if true action failed last time
    error: state.foo.error.bar, // null|any, contains last error (reason of promise rejection or caught error) or null if action has never failed
    result: state.foo.result.bar, // null|any, contains last result or null if action has never succeeded
  }),
  {
    bar: breezeInstance.getAction('bar'),
  }
)(MyComponent);
```

#### Passing parameters to action
In the example above, first param passed to the action when dispatching, will be available as the first parameter of the `async` function:
```javascript
this.props.bar('someData'); // promise will be resolved with 'someData' value and that value will be available in `state.foo.result.bar`
```

To provide more data you can use object:
```javascript
this.props.myFancyAction({ foo, bar, baz });
```

#### Custom result or error handling
You can define what happens to result or errors (data which Promise is resolved or rejected with) in action definition:
```javascript
const actionsDefinitions = {
  foo: {
    bar: {
      type: 'better-promise',
      async: actionParam => IWillReturnPromise(actionParam),
      result: {
        pathInState: 'result.pathInAction',
        fieldOne: 'result',
        fieldTwo: 'result.someCustomField',
        'fieldThree.subField': 'result.anotherFieldInResult',
      },
      error: {
        differentPathInState: 'error.pathInError',
        errorOne: 'error',
        errorTwo: 'error.someCustomField',
        'errorThree.subField': 'error.anotherFieldInError',
      }
    },
  },
};
```

Then you will see initial state that looks like this:
```javascript
{
  foo: {
    pending: {
      bar: false,
    },
    lastSucceeded: {
      bar: false,
    },
    lastFailed: {
      bar: false,
    },
    failed: {
      bar: false,
    },
    succeeded: {
      bar: false,
    },
    lastSucceeded: {
      bar: false,
    },
    pathInState: null,
    fieldOne: null,
    fieldTwo: null,
    fieldThree: {
      subfield: null,
    },
    differentPathInState: null,
    errorOne: null,
    errorTwo: null,
    errorThree: {
      subField: null,
    },
  }
}
```

#### Advanced result and error handling
`result` and `error` fields in action definitions works exactly the same.
```javascript
const actionsDefinitions = {
  foo: {
    bar: {
      type: 'better-promise',
      async: actionParam => IWillReturnPromise(actionParam),
      result: {
        fieldOne: { source: 'result.somePathInAction', default: 'valueToBeSetIfNoneFoundInTheAction', initial: 'someInitialValue' },
        fieldTwo: { source: (action, currentValue) => [...currentValue, action.result], initial: 'anotherInitialValue' },
      },
    },
  },
};
```

Then you will see initial state that looks like this:
```javascript
{
  foo: {
    pending: {
      bar: false,
    },
    lastSucceeded: {
      bar: false,
    },
    lastFailed: {
      bar: false,
    },
    failed: {
      bar: false,
    },
    succeeded: {
      bar: false,
    },
    lastSucceeded: {
      bar: false,
    },
    fieldOne: 'someInitialValue',
    fieldTwo: 'anotherInitialValue',
  }
}
```

#### Setting custom initial values for default fields
```javascript
const actionsDefinitions = {
  foo: {
    bar: {
      type: 'better-promise',
      async: actionParam => IWillReturnPromise(actionParam),
      initial: {
        'pending.bar': 'initialPending',
        'result.bar': [],
      },
    },
  },
};
```

Then you will see initial state that looks like this:
```javascript
{
  foo: {
    pending: {
      bar: 'initialPending',
    },
    lastSucceeded: {
      bar: false,
    },
    lastFailed: {
      bar: false,
    },
    failed: {
      bar: false,
    },
    succeeded: {
      bar: false,
    },
    lastSucceeded: {
      bar: false,
    },
    error: {
      bar: null,
    },
    result: {
      bar: [],
    },
  },
}
```

#### Adding [custom hooks](https://github.com/Lukasz-pluszczewski/redux-better-promise#adding-hooks-to-actions) to action
You can use custom hooks on any action just by passing `hooks` object as a second argument when dispatching the action. You don't have to change anything in action definition:
```javascript
this.props.myFancyAction(
  someParams,
  {
    success: ({ result }) => console.log('fancy action succeeded', result)
  }
);
```

## FAQ
#### I found a bug! What should I do?
There are at least 3 options:
1. Add an issue, write test(s) for bug you found, write fix that will make your test(s) pass, submit pull request
2. Add an issue, write test(s) for bug you found, submit pull request with you test(s)
3. Add an issue
