import _ from 'lodash';
import { set } from 'perfect-immutable';

var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var getResultsAssignments = function getResultsAssignments(resultDefinition) {
  var action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var state = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var result = _.isFunction(resultDefinition) ? resultDefinition(action) : resultDefinition;
  return _.reduce(result, function (accu, source, target) {
    if (_.isFunction(source)) {
      accu[target] = source(action, _.get(state, target));
    } else if (_.isPlainObject(source)) {
      if (_.isFunction(source.source)) {
        accu[target] = source.source(action, _.get(state, target));
      } else if (_.has(source, 'default') && !_.has(action, source.source)) {
        accu[target] = source.default;
      } else {
        accu[target] = _.get(action, source.source);
      }
    } else {
      accu[target] = _.get(action, source);
    }
    return accu;
  }, {});
};

var getInitialStateAssignments = function getInitialStateAssignments(resultDefinition) {
  var result = _.isFunction(resultDefinition) ? resultDefinition({}) : resultDefinition;
  return _.reduce(result, function (accu, source, target) {
    if (_.isPlainObject(source) && _.has(source, 'initial')) {
      accu[target] = source.initial;
    } else {
      accu[target] = null;
    }
    return accu;
  }, {});
};

var createBetterPromisePlugin = function createBetterPromisePlugin(_ref, config) {
  var createActionType = _ref.createActionType;
  return {
    name: 'redux-breeze-plugin-better-promise',

    /**
     * Object of functions that gets `actionDefinition` and `actionName` as arguments and return action creator
     */
    actionAdapter: {
      'better-promise': function betterPromise(actionDefinition, actionName) {
        return function (params, hooks) {
          var action = {
            types: { start: createActionType(actionName), success: createActionType(actionName, 'success'), error: createActionType(actionName, 'error') }
          };

          if (actionDefinition.async) {
            action.promise = function (tools) {
              return actionDefinition.async(params, tools);
            };
          }

          if (actionDefinition.sync) {
            action.function = function (tools) {
              return actionDefinition.sync(params, tools);
            };
          }

          if (hooks) {
            action.hooks = hooks;
          }

          return action;
        };
      }
    },

    /**
     * Object of functions that gets `actionDefinition`, `actionName`, and `initialState` and returns a reducer
     */
    reducerAdapter: {
      'better-promise': function betterPromise(actionDefinition, actionName, initialState) {
        return function () {
          var _babelHelpers$extends, _babelHelpers$extends2;

          var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
          var action = arguments[1];

          switch (action.type) {
            case createActionType(actionName):
              return set(state, defineProperty({}, 'pending.' + actionName, true));
            case createActionType(actionName, 'success'):
              return set(state, _extends((_babelHelpers$extends = {}, defineProperty(_babelHelpers$extends, 'pending.' + actionName, false), defineProperty(_babelHelpers$extends, 'lastSucceeded.' + actionName, true), defineProperty(_babelHelpers$extends, 'lastFailed.' + actionName, false), defineProperty(_babelHelpers$extends, 'succeeded.' + actionName, true), _babelHelpers$extends), actionDefinition.result ? getResultsAssignments(actionDefinition.result, action, state) : defineProperty({}, 'result.' + actionName, action.result)));
            case createActionType(actionName, 'error'):
              return set(state, _extends((_babelHelpers$extends2 = {}, defineProperty(_babelHelpers$extends2, 'pending.' + actionName, false), defineProperty(_babelHelpers$extends2, 'lastSucceeded.' + actionName, false), defineProperty(_babelHelpers$extends2, 'lastFailed.' + actionName, true), defineProperty(_babelHelpers$extends2, 'failed.' + actionName, true), _babelHelpers$extends2), actionDefinition.error ? getResultsAssignments(actionDefinition.error, action, state) : defineProperty({}, 'error.' + actionName, action.error)));
            default:
              return state;
          }
        };
      }
    },

    /**
     * Object of functions that gets `actionDefinition` and `actionName` as arguments and return assignment object (with keys = paths, values = values to be saved in those paths)
     */
    initialStateAdapter: {
      'better-promise': function betterPromise(actionDefinition, actionName) {
        var _babelHelpers$extends3;

        return _extends((_babelHelpers$extends3 = {}, defineProperty(_babelHelpers$extends3, 'pending.' + actionName, false), defineProperty(_babelHelpers$extends3, 'lastSucceeded.' + actionName, false), defineProperty(_babelHelpers$extends3, 'lastFailed.' + actionName, false), defineProperty(_babelHelpers$extends3, 'succeeded.' + actionName, false), defineProperty(_babelHelpers$extends3, 'failed.' + actionName, false), _babelHelpers$extends3), actionDefinition.result ? getInitialStateAssignments(actionDefinition.result) : defineProperty({}, 'result.' + actionName, null), actionDefinition.error ? getInitialStateAssignments(actionDefinition.error) : defineProperty({}, 'error.' + actionName, null));
      }
    }
  };
};

export default createBetterPromisePlugin;
//# sourceMappingURL=redux-breeze-plugin-better-promise.mjs.map
