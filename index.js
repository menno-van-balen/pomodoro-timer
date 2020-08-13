// declare state variables to avoid error message
let seconds;
let pause;
let focusSession;
let breakCount;
let focusCount;

// constonants
const SEC = "SEC";
const PLAY_PAUSE = "PLAY_PAUSE";
const FOCUS_SESSION = "FOCUS_SESSION";
const RESET = "RESET";
const INCR_BREAK = "INCR_BREAK";
const DECR_BREAK = "DECR_BREAK";
const INCR_FOCUS = "INCR_FOCUS";
const DECR_FOCUS = "DECR_FOCUS";

// action creators
const setTime = (sec) => {
  return {
    type: SEC,
    seconds: sec,
  };
};
const playPause = () => {
  return {
    type: PLAY_PAUSE,
  };
};
const focusSes = () => {
  return {
    type: FOCUS_SESSION,
  };
};
const reset = () => {
  return {
    type: RESET,
  };
};
const incrBreak = () => {
  return {
    type: INCR_BREAK,
  };
};
const decrBreak = () => {
  return {
    type: DECR_BREAK,
  };
};
const incrFocus = () => {
  return {
    type: INCR_FOCUS,
  };
};
const decrFocus = () => {
  return {
    type: DECR_FOCUS,
  };
};

// default state
let defaultState = {
  seconds: 1500,
  pause: true,
  focusSession: true,
  breakCount: 5,
  focusCount: 25,
};

//  reducer
const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case SEC:
      return Object.assign({}, state, { seconds: action.seconds });
    case PLAY_PAUSE:
      return Object.assign({}, state, {
        pause: !state.pause,
      });
    case FOCUS_SESSION:
      return Object.assign({}, state, {
        focusSession: !state.focusSession,
      });
    case RESET:
      return Object.assign({}, state, defaultState);
    case INCR_BREAK:
      return Object.assign({}, state, { breakCount: state.breakCount + 1 });
    case DECR_BREAK:
      return Object.assign({}, state, { breakCount: state.breakCount - 1 });
    case INCR_FOCUS:
      return Object.assign({}, state, { focusCount: state.focusCount + 1 });
    case DECR_FOCUS:
      return Object.assign({}, state, { focusCount: state.focusCount - 1 });
    default:
      return state;
  }
};

// create store
const store = Redux.createStore(reducer);

// // ad store listener (in development => to keep track of changes)
// function storeAction() {
//   console.log(store.getState());
// }
// store.subscribe(storeAction);

// dispatch functions
const secondLess = () => store.dispatch(setTime(store.getState().seconds - 1));
const startStop = () => {
  stop();
  store.dispatch(playPause());
  timer();
};
const sessionChange = () => {
  store.dispatch(focusSes());
};
const res = () => {
  stop();
  store.dispatch(reset());
  let audio = document.getElementById("beep");
  audio.pause();
  audio.currentTime = 0;
};
const plusBreak = () => {
  if (store.getState().pause && store.getState().breakCount < 60) {
    store.dispatch(incrBreak());
  }
};
const minBreak = () => {
  if (store.getState().pause && store.getState().breakCount > 1) {
    store.dispatch(decrBreak());
  }
};
const plusFocus = () => {
  if (store.getState().pause && store.getState().focusCount < 60) {
    store.dispatch(incrFocus());
    store.dispatch(setTime(store.getState().focusCount * 60));
  }
};
const minFocus = () => {
  if (store.getState().pause && store.getState().focusCount > 1) {
    store.dispatch(decrFocus());
    store.dispatch(setTime(store.getState().focusCount * 60));
  }
};

// eventListeners attached to dispatch functions
document.getElementById("break-increment").addEventListener("click", plusBreak);
document.getElementById("break-decrement").addEventListener("click", minBreak);
document
  .getElementById("session-increment")
  .addEventListener("click", plusFocus);
document
  .getElementById("session-decrement")
  .addEventListener("click", minFocus);
document.getElementById("start_stop").addEventListener("click", startStop);
document.getElementById("reset").addEventListener("click", res);

// render store (to HTML)
const render = () => {
  const state = store.getState();
  document.getElementById("break-length").innerHTML = state.breakCount;
  document.getElementById("session-length").innerHTML = state.focusCount;
  displayTime(state.seconds);
  if (state.focusSession) {
    document.getElementById("timer-label").innerHTML = "Focus Mode";
  } else {
    document.getElementById("timer-label").innerHTML = "Take a Break!";
  }
};
// invoke render for first load
render();
// subscribe to store to update elements on page
store.subscribe(render);

function displayTime(sec) {
  let minutes = Math.floor(sec / 60);
  let seconds = sec - minutes * 60;
  let displayMinutes = minutes > 9 ? minutes : "0" + minutes;
  let displaySeconds = seconds > 9 ? seconds : "0" + seconds;
  document.getElementById("time-left").innerHTML =
    displayMinutes + ":" + displaySeconds;
}

// stop timer function
let run;
function stop() {
  clearTimeout(run);
}

// timer
function timer() {
  //  assign new values to state.seconds
  if (store.getState().seconds < 0) {
    if (store.getState().focusSession) {
      store.dispatch(
        setTime(document.getElementById("session-length").innerHTML * 60)
      );
    } else {
      store.dispatch(
        setTime(document.getElementById("break-length").innerHTML * 60)
      );
    }
  }

  if (!store.getState().pause) countdown();

  function countdown() {
    if (!store.getState().pause) {
      if (store.getState().seconds >= 0) {
        run = setTimeout(() => {
          secondLess();
          countdown();
        }, 1000);
      } else {
        document.getElementById("beep").play();
        sessionChange();
        timer();
      }
    }
  }
}
