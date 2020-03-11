// TODO treat calls to storicu methods asynchrously so that there is no overlap ?

var storicu = (function () {
  function Storicu() {
    const states = [];
    let stateIndex;
    const actions = [];

    const buildStoricuState = (historyState, index) => ({
      state: historyState,
      index,
      storicu: true,
    });

    const handlePopState = (e) => {
      const {state: newState} = e;

      const action = 0 === actions.length ? null : actions.splice(0, 1)[0];

      const previousStateIndex = stateIndex;
      stateIndex = newState.index;

      if (action && 'CLEAN_FORWARD_HISTORY' === action.type) {
        stateIndex += 1;
        states.splice(stateIndex + 1, states.length - (stateIndex + 1));
        window.history.pushState(action.payload, null, null);
        return;
      }

      let triggeredByAPI = false;
      if (action && 'GO' === action.type) {
        triggeredByAPI = true;
      }

      // skip ghost state
      if (stateIndex <= 0 && triggeredByAPI) {
        window.history.go(-1);
        return;
      }

      // state change callback ({state}, delta, isTriggeredByAPI)
      if (this.onpopstate !== undefined) {
        this.onpopstate({state: newState.state}, stateIndex - previousStateIndex, triggeredByAPI);
      }
    };

    const init = () => {
      let historyState = window.history.state;

      if (historyState && historyState.storicu) {
        historyState = historyState.state;
      }

      const ghostState = buildStoricuState(historyState, 0);
      window.history.replaceState(ghostState, null, null);
      states.push(ghostState);

      const firstState = buildStoricuState(historyState, 1);
      window.history.pushState(firstState, null, null);
      states.push(firstState);

      stateIndex = 1;

      window.onpopstate = handlePopState;
    };

    this.replaceState = (state, title, url) => {
      const currentState = states[stateIndex];
      currentState.state = state;
      window.history.replaceState(currentState, title, url);
    };

    this.pushState = (state, title, url) => {
      stateIndex += 1;
      const newState = buildStoricuState(state, stateIndex);
      states.splice(stateIndex, states.length - stateIndex, newState);
      window.history.pushState(newState, title, url);
    };

    this.go = (delta) => {
      if (delta === 0) {
        return;
      }

      if (stateIndex + delta <= 0) { // skipping ghost state
        delta -= 1;
      }

      stateIndex = stateIndex + delta;
      actions.push({ type: 'GO', payload: null });
      window.history.go(delta)
    };

    this.forward = (distance = 1) => this.go(distance);
    this.back = (distance = 1) => this.go(-distance);

    this.cleanForwardHistory = (delta=0) => { // HACK because successive calls are not handled correctly
      actions.push({ type: 'CLEAN_FORWARD_HISTORY', payload: states[stateIndex + delta] });
      window.history.go(-1 + delta);
    };

    this.onpopstate = undefined;

    init();
  }

  if (undefined === window.storicu) {
    window.storicu = new Storicu();
  }
  return window.storicu;
})();
