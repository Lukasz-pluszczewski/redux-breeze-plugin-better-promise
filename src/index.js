import _ from 'lodash';
import { set } from 'perfect-immutable';

const getResultsAssignments = (resultDefinition, action = {}, state = {}) => {
  const result = _.isFunction(resultDefinition) ? resultDefinition(action) : resultDefinition;
  return _.reduce(result, (accu, source, target) => {
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

const getInitialStateAssignments = resultDefinition => {
  const result = _.isFunction(resultDefinition) ? resultDefinition({}) : resultDefinition;
  return _.reduce(result, (accu, source, target) => {
    if (_.isPlainObject(source) && _.has(source, 'initial')) {
      accu[target] = source.initial;
    } else {
      accu[target] = null;
    }
    return accu;
  }, {});
};

const createBetterPromisePlugin = ({ createActionType }, config) => ({
  name: 'redux-breeze-plugin-better-promise',

  /**
   * Object of functions that gets `actionDefinition` and `actionName` as arguments and return action creator
   */
  actionAdapter: {
    'better-promise': (actionDefinition, actionName) => (params, hooks) => {
      const action = {
        types: { start: createActionType(actionName), success: createActionType(actionName, 'success'), error: createActionType(actionName, 'error') },
      };

      if (actionDefinition.async) {
        action.promise = tools => actionDefinition.async(params, tools);
      }

      if (actionDefinition.sync) {
        action.function = tools => actionDefinition.sync(params, tools);
      }

      if (hooks) {
        action.hooks = hooks;
      }

      return action;
    },
  },

  /**
   * Object of functions that gets `actionDefinition`, `actionName`, and `initialState` and returns a reducer
   */
  reducerAdapter: {
    'better-promise': (actionDefinition, actionName, initialState) => (state = initialState, action) => {
      switch (action.type) {
        case createActionType(actionName):
          return set(state, {
            [`pending.${actionName}`]: true,
          });
        case createActionType(actionName, 'success'):
          return set(state, {
            [`pending.${actionName}`]: false,
            [`lastSucceeded.${actionName}`]: true,
            [`lastFailed.${actionName}`]: false,
            [`succeeded.${actionName}`]: true,
            ...(actionDefinition.result
              ? getResultsAssignments(actionDefinition.result, action, state)
              : { [`result.${actionName}`]: action.result }),
          });
        case createActionType(actionName, 'error'):
          return set(state, {
            [`pending.${actionName}`]: false,
            [`lastSucceeded.${actionName}`]: false,
            [`lastFailed.${actionName}`]: true,
            [`failed.${actionName}`]: true,
            ...(actionDefinition.error
              ? getResultsAssignments(actionDefinition.error, action, state)
              : { [`error.${actionName}`]: action.error }),
          });
        default:
          return state;
      }
    },
  },

  /**
   * Object of functions that gets `actionDefinition` and `actionName` as arguments and return assignment object (with keys = paths, values = values to be saved in those paths)
   */
  initialStateAdapter: {
    'better-promise': (actionDefinition, actionName) => ({
      [`pending.${actionName}`]: false,
      [`lastSucceeded.${actionName}`]: false,
      [`lastFailed.${actionName}`]: false,
      [`succeeded.${actionName}`]: false,
      [`failed.${actionName}`]: false,
      ...(actionDefinition.result
        ? getInitialStateAssignments(actionDefinition.result)
        : { [`result.${actionName}`]: null }),
      ...(actionDefinition.error
        ? getInitialStateAssignments(actionDefinition.error)
        : { [`error.${actionName}`]: null }),
    }),
  },
});

export default createBetterPromisePlugin;
