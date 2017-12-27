import { expect } from 'chai';
import { set } from 'perfect-immutable';
import { tools } from 'redux-breeze';
import createBetterPromisePlugin from '../src';

describe('better promise plugin', () => {
  const actionDefinitions = {
    success: {
      type: 'better-promise',
      async: param => Promise.resolve({ foo: param }),
    },
    error: {
      type: 'better-promise',
      async: param => Promise.reject({ bar: param }),
    },
    successCustom: {
      type: 'better-promise',
      async: param => Promise.resolve({ foo: param }),
      result: {
        'foo.value': 'result.foo',
        'foo.alteredValue': (action, currentValue) => (currentValue || '') + action.result.foo,
        'foo.valueStrangeAltered': { source: (action, currentValue) => [...currentValue, action.result.foo], initial: [] },
        'foo.strange': { source: 'result.foo' },
        'foo.default': { source: 'result.nonExistent', default: 'defaultValue' },
        'foo.initial': { source: 'result.foo', initial: 'initialValue' },
      },
    },
    errorCustom: {
      type: 'better-promise',
      async: param => Promise.reject({ bar: param }),
      error: {
        'baz.value': 'error.bar',
        'baz.alteredValue': (action, currentValue) => (currentValue || '') + action.error.bar,
        'baz.valueStrangeAltered': { source: (action, currentValue) => [...currentValue, action.error.bar], initial: [] },
        'baz.strange': { source: 'error.bar' },
        'baz.default': { source: 'error.nonExistent', default: 'defaultValue' },
        'baz.initial': { source: 'error.bar', initial: 'initialValue' },
      },
    },
  };

  it('should create initialState for better-promise action', () => {
    const plugin = createBetterPromisePlugin(tools, {});
    const initialStateAdapter = plugin.initialStateAdapter['better-promise'];

    let initialState = set({}, initialStateAdapter(actionDefinitions.success, 'success'));
    initialState = set(initialState, initialStateAdapter(actionDefinitions.error, 'error'));
    initialState = set(initialState, initialStateAdapter(actionDefinitions.successCustom, 'successCustom'));
    initialState = set(initialState, initialStateAdapter(actionDefinitions.errorCustom, 'errorCustom'));

    expect(initialState).to.be.deep.equal({
      pending: {
        success: false,
        error: false,
        successCustom: false,
        errorCustom: false,
      },
      lastSucceeded: {
        success: false,
        error: false,
        successCustom: false,
        errorCustom: false,
      },
      lastFailed: {
        success: false,
        error: false,
        successCustom: false,
        errorCustom: false,
      },
      failed: {
        success: false,
        error: false,
        successCustom: false,
        errorCustom: false,
      },
      succeeded: {
        success: false,
        error: false,
        successCustom: false,
        errorCustom: false,
      },
      result: {
        success: null,
        error: null,
        errorCustom: null,
      },
      error: {
        success: null,
        error: null,
        successCustom: null,
      },
      foo: {
        value: null,
        alteredValue: null,
        valueStrangeAltered: [],
        strange: null,
        default: null,
        initial: 'initialValue',
      },
      baz: {
        value: null,
        alteredValue: null,
        valueStrangeAltered: [],
        strange: null,
        default: null,
        initial: 'initialValue',
      },
    });
  });

  it('should create reducer that returns initial state', () => {
    const plugin = createBetterPromisePlugin(tools, {});
    const initialStateAdapter = plugin.initialStateAdapter['better-promise'];
    const reducerAdapter = plugin.reducerAdapter['better-promise'];

    let initialState = set({}, initialStateAdapter(actionDefinitions.success, 'success'));
    initialState = set(initialState, initialStateAdapter(actionDefinitions.error, 'error'));
    initialState = set(initialState, initialStateAdapter(actionDefinitions.successCustom, 'successCustom'));
    initialState = set(initialState, initialStateAdapter(actionDefinitions.errorCustom, 'errorCustom'));

    let reducerResult = reducerAdapter(actionDefinitions.success, 'success', initialState)(undefined, {}); // eslint-disable-line no-undefined
    reducerResult = reducerAdapter(actionDefinitions.error, 'error', initialState)(reducerResult, {});
    reducerResult = reducerAdapter(actionDefinitions.successCustom, 'successCustom', initialState)(reducerResult, {});
    reducerResult = reducerAdapter(actionDefinitions.errorCustom, 'errorCustom', initialState)(reducerResult, {});

    expect(reducerResult).to.be.deep.equal({
      pending: {
        success: false,
        error: false,
        successCustom: false,
        errorCustom: false,
      },
      lastSucceeded: {
        success: false,
        error: false,
        successCustom: false,
        errorCustom: false,
      },
      lastFailed: {
        success: false,
        error: false,
        successCustom: false,
        errorCustom: false,
      },
      failed: {
        success: false,
        error: false,
        successCustom: false,
        errorCustom: false,
      },
      succeeded: {
        success: false,
        error: false,
        successCustom: false,
        errorCustom: false,
      },
      result: {
        success: null,
        error: null,
        errorCustom: null,
      },
      error: {
        success: null,
        error: null,
        successCustom: null,
      },
      foo: {
        value: null,
        alteredValue: null,
        valueStrangeAltered: [],
        strange: null,
        default: null,
        initial: 'initialValue',
      },
      baz: {
        value: null,
        alteredValue: null,
        valueStrangeAltered: [],
        strange: null,
        default: null,
        initial: 'initialValue',
      },
    });
  });

  it('should create action based on a definition', async() => {
    const plugin = createBetterPromisePlugin(tools, {});
    const actionAdapter = plugin.actionAdapter['better-promise'];

    const actionSuccess = actionAdapter(actionDefinitions.success, 'success')('foobar');
    const actionError = actionAdapter(actionDefinitions.error, 'error')('foobar');
    const actionSuccessCustom = actionAdapter(actionDefinitions.successCustom, 'successCustom')('foobar');
    const actionErrorCustom = actionAdapter(actionDefinitions.errorCustom, 'errorCustom')('foobar');

    expect(actionSuccess.types).to.be.deep.equal({ start: 'SUCCESS', success: 'SUCCESS_SUCCESS', error: 'SUCCESS_ERROR' });
    expect(await actionSuccess.promise()).to.be.deep.equal({ foo: 'foobar' });

    expect(actionError.types).to.be.deep.equal({ start: 'ERROR', success: 'ERROR_SUCCESS', error: 'ERROR_ERROR' });
    expect(await actionError.promise().catch(error => error)).to.be.deep.equal({ bar: 'foobar' });

    expect(actionSuccessCustom.types).to.be.deep.equal({ start: 'SUCCESS_CUSTOM', success: 'SUCCESS_CUSTOM_SUCCESS', error: 'SUCCESS_CUSTOM_ERROR' });
    expect(await actionSuccessCustom.promise()).to.be.deep.equal({ foo: 'foobar' });

    expect(actionErrorCustom.types).to.be.deep.equal({ start: 'ERROR_CUSTOM', success: 'ERROR_CUSTOM_SUCCESS', error: 'ERROR_CUSTOM_ERROR' });
    expect(await actionErrorCustom.promise().catch(error => error)).to.be.deep.equal({ bar: 'foobar' });

    return;
  });

  it('should add hooks to actions', async() => {
    const plugin = createBetterPromisePlugin(tools, {});
    const actionAdapter = plugin.actionAdapter['better-promise'];

    const startHook = () => {}; // eslint-disable-line no-empty-function
    const successHook = () => {}; // eslint-disable-line no-empty-function
    const errorHook = () => {}; // eslint-disable-line no-empty-function

    const actionHooked = actionAdapter(
      { type: 'better-promise', async: param => Promise.resolve(param) },
      'hooked'
    )(
      'foobar',
      { start: startHook, success: successHook, error: errorHook }
    );

    expect(actionHooked.types).to.be.deep.equal({ start: 'HOOKED', success: 'HOOKED_SUCCESS', error: 'HOOKED_ERROR' });
    expect(await actionHooked.promise()).to.be.equal('foobar');
    expect(actionHooked.hooks).to.be.deep.equal({ start: startHook, success: successHook, error: errorHook });

    return;
  });

  describe('created reducer', () => {
    describe('for non custom action', () => {
      it('should handle start action', () => {
        const plugin = createBetterPromisePlugin(tools, {});
        const reducerAdapter = plugin.reducerAdapter['better-promise'];

        const initialState = {
          pending: {
            success: false,
          },
          lastSucceeded: {
            success: false,
          },
          lastFailed: {
            success: false,
          },
          failed: {
            success: false,
          },
          succeeded: {
            success: false,
          },
          result: {
            success: null,
          },
          error: {
            success: { message: 'testError' },
          },
        };

        const reducerStartResult = reducerAdapter(actionDefinitions.success, 'success', initialState)(
          initialState,
          {
            type: 'SUCCESS',
          }
        );

        expect(reducerStartResult).to.be.deep.equal({
          pending: {
            success: true,
          },
          lastSucceeded: {
            success: false,
          },
          lastFailed: {
            success: false,
          },
          failed: {
            success: false,
          },
          succeeded: {
            success: false,
          },
          result: {
            success: null,
          },
          error: {
            success: { message: 'testError' },
          },
        });
      });

      it('should handle success action', () => {
        const plugin = createBetterPromisePlugin(tools, {});
        const reducerAdapter = plugin.reducerAdapter['better-promise'];

        const initialState = {
          pending: {
            success: true,
          },
          lastSucceeded: {
            success: false,
          },
          lastFailed: {
            success: true,
          },
          failed: {
            success: true,
          },
          succeeded: {
            success: false,
          },
          result: {
            success: null,
          },
          error: {
            success: { foo: 'bar' },
          },
        };

        const reducerFinishResult = reducerAdapter(actionDefinitions.success, 'success', initialState)(
          initialState,
          {
            type: 'SUCCESS_SUCCESS',
            result: {
              foo: 'bar',
            },
          }
        );

        expect(reducerFinishResult).to.be.deep.equal({
          pending: {
            success: false,
          },
          lastSucceeded: {
            success: true,
          },
          lastFailed: {
            success: false,
          },
          failed: {
            success: true,
          },
          succeeded: {
            success: true,
          },
          result: {
            success: {
              foo: 'bar',
            },
          },
          error: {
            success: { foo: 'bar' },
          },
        });
      });

      it('should handle error action', () => {
        const plugin = createBetterPromisePlugin(tools, {});
        const reducerAdapter = plugin.reducerAdapter['better-promise'];

        const initialState = {
          pending: {
            success: true,
          },
          lastSucceeded: {
            success: true,
          },
          lastFailed: {
            success: false,
          },
          failed: {
            success: false,
          },
          succeeded: {
            success: true,
          },
          result: {
            success: { foo: 'bar' },
          },
          error: {
            success: null,
          },
        };

        const reducerFinishResult = reducerAdapter(actionDefinitions.success, 'success', initialState)(
          initialState,
          {
            type: 'SUCCESS_ERROR',
            error: {
              foo: 'bar',
            },
          }
        );

        expect(reducerFinishResult).to.be.deep.equal({
          pending: {
            success: false,
          },
          lastSucceeded: {
            success: false,
          },
          lastFailed: {
            success: true,
          },
          failed: {
            success: true,
          },
          succeeded: {
            success: true,
          },
          result: {
            success: {
              foo: 'bar',
            },
          },
          error: {
            success: {
              foo: 'bar',
            },
          },
        });
      });
    });

    describe('for custom success action', () => {
      it('should handle start action', () => {
        const plugin = createBetterPromisePlugin(tools, {});
        const reducerAdapter = plugin.reducerAdapter['better-promise'];

        const initialState = {
          pending: {
            successCustom: false,
          },
          lastSucceeded: {
            successCustom: false,
          },
          lastFailed: {
            successCustom: false,
          },
          failed: {
            successCustom: false,
          },
          succeeded: {
            successCustom: false,
          },
          error: {
            successCustom: null,
          },
          foo: {
            value: null,
            alteredValue: null,
            valueStrangeAltered: [],
            strange: null,
            default: null,
            initial: 'initialValue',
          },
        };

        const reducerStartResult = reducerAdapter(actionDefinitions.successCustom, 'successCustom', initialState)(
          initialState,
          {
            type: 'SUCCESS_CUSTOM',
          }
        );

        expect(reducerStartResult).to.be.deep.equal({
          pending: {
            successCustom: true,
          },
          lastSucceeded: {
            successCustom: false,
          },
          lastFailed: {
            successCustom: false,
          },
          failed: {
            successCustom: false,
          },
          succeeded: {
            successCustom: false,
          },
          error: {
            successCustom: null,
          },
          foo: {
            value: null,
            alteredValue: null,
            valueStrangeAltered: [],
            strange: null,
            default: null,
            initial: 'initialValue',
          },
        });
      });

      it('should handle success action', () => {
        const plugin = createBetterPromisePlugin(tools, {});
        const reducerAdapter = plugin.reducerAdapter['better-promise'];

        const initialState = {
          pending: {
            successCustom: true,
          },
          lastSucceeded: {
            successCustom: false,
          },
          lastFailed: {
            successCustom: true,
          },
          failed: {
            successCustom: true,
          },
          succeeded: {
            successCustom: false,
          },
          error: {
            successCustom: null,
          },
          foo: {
            value: null,
            alteredValue: 'foo',
            valueStrangeAltered: ['foo'],
            strange: null,
            default: null,
            initial: 'initialValue',
          },
        };

        const reducerFinishResult = reducerAdapter(actionDefinitions.successCustom, 'successCustom', initialState)(
          initialState,
          {
            type: 'SUCCESS_CUSTOM_SUCCESS',
            result: {
              foo: 'bar',
            },
          }
        );

        expect(reducerFinishResult).to.be.deep.equal({
          pending: {
            successCustom: false,
          },
          lastSucceeded: {
            successCustom: true,
          },
          lastFailed: {
            successCustom: false,
          },
          failed: {
            successCustom: true,
          },
          succeeded: {
            successCustom: true,
          },
          error: {
            successCustom: null,
          },
          foo: {
            value: 'bar',
            alteredValue: 'foobar',
            valueStrangeAltered: ['foo', 'bar'],
            strange: 'bar',
            default: 'defaultValue',
            initial: 'bar',
          },
        });
      });

      it('should handle error action', () => {
        const plugin = createBetterPromisePlugin(tools, {});
        const reducerAdapter = plugin.reducerAdapter['better-promise'];

        const initialState = {
          pending: {
            successCustom: true,
          },
          lastSucceeded: {
            successCustom: true,
          },
          lastFailed: {
            successCustom: false,
          },
          failed: {
            successCustom: false,
          },
          succeeded: {
            successCustom: true,
          },
          error: {
            successCustom: null,
          },
          foo: {
            value: 'bar',
            alteredValue: 'foobar',
            valueStrangeAltered: ['foo', 'bar'],
            strange: 'bar',
            default: 'defaultValue',
            initial: 'initialValue',
          },
        };

        const reducerFinishResult = reducerAdapter(actionDefinitions.successCustom, 'successCustom', initialState)(
          initialState,
          {
            type: 'SUCCESS_CUSTOM_ERROR',
            error: {
              foo: 'bar',
            },
          }
        );

        expect(reducerFinishResult).to.be.deep.equal({
          pending: {
            successCustom: false,
          },
          lastSucceeded: {
            successCustom: false,
          },
          lastFailed: {
            successCustom: true,
          },
          failed: {
            successCustom: true,
          },
          succeeded: {
            successCustom: true,
          },
          error: {
            successCustom: {
              foo: 'bar',
            },
          },
          foo: {
            value: 'bar',
            alteredValue: 'foobar',
            valueStrangeAltered: ['foo', 'bar'],
            strange: 'bar',
            default: 'defaultValue',
            initial: 'initialValue',
          },
        });
      });
    });

    describe('for custom error action', () => {
      it('should handle start action', () => {
        const plugin = createBetterPromisePlugin(tools, {});
        const reducerAdapter = plugin.reducerAdapter['better-promise'];

        const initialState = {
          pending: {
            errorCustom: false,
          },
          lastSucceeded: {
            errorCustom: false,
          },
          lastFailed: {
            errorCustom: false,
          },
          failed: {
            errorCustom: false,
          },
          succeeded: {
            errorCustom: false,
          },
          result: {
            errorCustom: null,
          },
          baz: {
            value: null,
            alteredValue: null,
            valueStrangeAltered: [],
            strange: null,
            default: null,
            initial: 'initialValue',
          },
        };

        const reducerStartResult = reducerAdapter(actionDefinitions.errorCustom, 'errorCustom', initialState)(
          initialState,
          {
            type: 'ERROR_CUSTOM',
          }
        );

        expect(reducerStartResult).to.be.deep.equal({
          pending: {
            errorCustom: true,
          },
          lastSucceeded: {
            errorCustom: false,
          },
          lastFailed: {
            errorCustom: false,
          },
          failed: {
            errorCustom: false,
          },
          succeeded: {
            errorCustom: false,
          },
          result: {
            errorCustom: null,
          },
          baz: {
            value: null,
            alteredValue: null,
            valueStrangeAltered: [],
            strange: null,
            default: null,
            initial: 'initialValue',
          },
        });
      });

      it('should handle success action', () => {
        const plugin = createBetterPromisePlugin(tools, {});
        const reducerAdapter = plugin.reducerAdapter['better-promise'];

        const initialState = {
          pending: {
            errorCustom: true,
          },
          lastSucceeded: {
            errorCustom: false,
          },
          lastFailed: {
            errorCustom: true,
          },
          failed: {
            errorCustom: true,
          },
          succeeded: {
            errorCustom: false,
          },
          result: {
            errorCustom: null,
          },
          baz: {
            value: null,
            alteredValue: null,
            valueStrangeAltered: [],
            strange: null,
            default: null,
            initial: 'initialValue',
          },
        };

        const reducerFinishResult = reducerAdapter(actionDefinitions.errorCustom, 'errorCustom', initialState)(
          initialState,
          {
            type: 'ERROR_CUSTOM_SUCCESS',
            result: {
              foo: 'bar',
            },
          }
        );

        expect(reducerFinishResult).to.be.deep.equal({
          pending: {
            errorCustom: false,
          },
          lastSucceeded: {
            errorCustom: true,
          },
          lastFailed: {
            errorCustom: false,
          },
          failed: {
            errorCustom: true,
          },
          succeeded: {
            errorCustom: true,
          },
          result: {
            errorCustom: {
              foo: 'bar',
            },
          },
          baz: {
            value: null,
            alteredValue: null,
            valueStrangeAltered: [],
            strange: null,
            default: null,
            initial: 'initialValue',
          },
        });
      });

      it('should handle error action', () => {
        const plugin = createBetterPromisePlugin(tools, {});
        const reducerAdapter = plugin.reducerAdapter['better-promise'];

        const initialState = {
          pending: {
            errorCustom: true,
          },
          lastSucceeded: {
            errorCustom: true,
          },
          lastFailed: {
            errorCustom: false,
          },
          failed: {
            errorCustom: false,
          },
          succeeded: {
            errorCustom: true,
          },
          result: {
            errorCustom: {
              foo: 'bar',
            },
          },
          baz: {
            value: null,
            alteredValue: 'foo',
            valueStrangeAltered: ['foo'],
            strange: null,
            default: null,
            initial: 'initialValue',
          },
        };

        const reducerFinishResult = reducerAdapter(actionDefinitions.errorCustom, 'errorCustom', initialState)(
          initialState,
          {
            type: 'ERROR_CUSTOM_ERROR',
            error: {
              bar: 'baz',
            },
          }
        );

        expect(reducerFinishResult).to.be.deep.equal({
          pending: {
            errorCustom: false,
          },
          lastSucceeded: {
            errorCustom: false,
          },
          lastFailed: {
            errorCustom: true,
          },
          failed: {
            errorCustom: true,
          },
          succeeded: {
            errorCustom: true,
          },
          result: {
            errorCustom: {
              foo: 'bar',
            },
          },
          baz: {
            value: 'baz',
            alteredValue: 'foobaz',
            valueStrangeAltered: ['foo', 'baz'],
            strange: 'baz',
            default: 'defaultValue',
            initial: 'baz',
          },
        });
      });
    });
  });
});
