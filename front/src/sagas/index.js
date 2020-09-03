import { call, put, takeEvery } from 'redux-saga/effects';
import { SAY_HELLO, SAY_HELLO_SUCCESS } from '../actions';

export function* fetchSayHello(action) {
  const endpoint = `http://localhost:3001?name=${action.name}`;
  const response = yield call(fetch, endpoint);
  const data = yield response.json();
  yield put({ type: SAY_HELLO_SUCCESS, data });
}

export default function* rootSaga() {
  yield takeEvery(SAY_HELLO, fetchSayHello);
}
