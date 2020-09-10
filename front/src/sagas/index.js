import { call, put, takeEvery } from 'redux-saga/effects';
import { SAY_HELLO, SAY_HELLO_SUCCESS, FETCH_SOME_FAIL } from '../actions';

export function* fetchSayHello(action) {
  const endpoint = `http://localhost:3001/will-succeed?name=${action.name}`;
  const response = yield call(fetch, endpoint);
  const data = yield response.json();
  yield put({ type: SAY_HELLO_SUCCESS, data });
}

export function* fetchFail() {
  const endpoint = `http://localhost:3001/will-fail`;
  yield call(fetch, endpoint);
}

export default function* rootSaga() {
  yield takeEvery(SAY_HELLO, fetchSayHello);
  yield takeEvery(FETCH_SOME_FAIL, fetchFail);
}
