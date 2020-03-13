# Storicu

## About
Storicu is an improved HTML5 History API to achieve more, with less headaches.

It is designed to follow the native HTML5 History API and add new features
(access to full state history, additional parameters on popstate, clear
forward history, ...).

## API
As Storicu follows the native HTML5 History API, it implements all of it's
methods :
- `storicu.replaceState(state, title, url)`
- `storicu.pushState(state, title, url)`
- `storicu.go(delta)`
- `storicu.forward(distance)`
- `storicu.back(distance)`

In addition, Storicu provides additional methods to simplify history
management :
- `storicu.cleanForwardHistory()`
- `storicu.getStates()` *To come*
- `storicu.getStateIndex()`

Storicu also introduces a new callback `storicu.onpopstate` to replace
`window.onpopstate` :
- `storicu.onpopstate = ({state}, delta, triggeredByAPI) => {...}` 

## Limitations
Storicu does not support HTML4 browsers, or browsers that do not support the
native HTML5 History API.

For Storicu to work properly, you should not use the native HTML5 History API,
but instead rely on Storicu's implementation of these methods and callbacks.
