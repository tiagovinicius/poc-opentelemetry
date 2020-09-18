import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';

import App from './App';
import greetings from './reducers';
import rootSaga from './sagas';
import { TracerFactory } from './tracing/tracer-factory';

const { traceAction, traceUserInteraction } = new TracerFactory().create();
document.addEventListener("click", traceUserInteraction);
const sagaMiddleware = createSagaMiddleware();

const store = createStore(greetings, applyMiddleware(
    sagaMiddleware,
    traceAction,
));

sagaMiddleware.run(rootSaga);

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
