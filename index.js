'use strict';

module.exports = function () {
  function Storicu() {
    var _this = this;

    var states = [];
    var stateIndex;
    var actions = [];

    var buildStoricuState = function buildStoricuState(historyState, index) {
      return {
        state: historyState,
        index: index,
        storicu: true
      };
    };

    var handlePopState = function handlePopState(e) {
      var newState = e.state;
      if (null === newState || !newState.storicu) {
        return;
      }
      var action = 0 === actions.length ? null : actions.splice(0, 1)[0];
      var previousStateIndex = stateIndex;
      stateIndex = newState.index;

      if (action && 'CLEAN_FORWARD_HISTORY' === action.type) {
        stateIndex += 1;
        states.splice(stateIndex + 1, states.length - (stateIndex + 1));
        window.history.pushState(action.payload, null, null);
        return;
      }

      var triggeredByAPI = false;

      if (action && 'GO' === action.type) {
        triggeredByAPI = true;
      } // skip ghost state


      if (stateIndex <= 0) {
        window.history.go(-1);
        return;
      } // state change callback ({state}, delta, isTriggeredByAPI)


      if (undefined !== _this.onpopstate) {
        _this.onpopstate({
          state: newState.state
        }, stateIndex - previousStateIndex, triggeredByAPI);
      }
    };

    var init = function init() {
      var historyState = window.history.state;

      if (historyState && historyState.storicu) {
        historyState = historyState.state;
      }

      var ghostState = buildStoricuState(historyState, 0);
      window.history.replaceState(ghostState, null, null);
      states.push(ghostState);
      var firstState = buildStoricuState(historyState, 1);
      window.history.pushState(firstState, null, null);
      states.push(firstState);
      stateIndex = 1;
      window.onpopstate = handlePopState;
    };

    this.replaceState = function (state, title, url) {
      var currentState = states[stateIndex];
      currentState.state = state;
      window.history.replaceState(currentState, title, url);
    };

    this.pushState = function (state, title, url) {
      stateIndex += 1;
      var newState = buildStoricuState(state, stateIndex);
      states.splice(stateIndex, states.length - stateIndex, newState);
      window.history.pushState(newState, title, url);
    };

    this.go = function (delta) {
      if (delta === 0) {
        return;
      }

      if (stateIndex + delta <= 0) {
        // skipping ghost state
        delta -= 1;
      }

      stateIndex = stateIndex + delta;
      actions.push({
        type: 'GO',
        payload: null
      });
      window.history.go(delta);
    };

    this.forward = function () {
      var distance = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      return _this.go(distance);
    };

    this.back = function () {
      var distance = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      return _this.go(-distance);
    };

    this.cleanForwardHistory = function () {
      var delta = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      // HACK because successive calls may overlap
      actions.push({
        type: 'CLEAN_FORWARD_HISTORY',
        payload: states[stateIndex + delta]
      });
      window.history.go(-1 + delta);
    };

    this.getStateIndex = function () {
      return stateIndex - 1;
    };

    this.onpopstate = undefined;
    init();
  }

  if (undefined === window.storicu) {
    window.storicu = new Storicu();
  }

  return window.storicu;
}();
