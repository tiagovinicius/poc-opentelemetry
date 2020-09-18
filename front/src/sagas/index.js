import { call, put, takeEvery } from 'redux-saga/effects';
import { SAY_HELLO, SAY_HELLO_SUCCESS, WILL_FAIL_SAY_HELLO, SAY_HELLO_FAIL } from '../actions';

export function* fetchSayHello(action) {
  const endpoint = `http://localhost:3001/will-succeed?name=${action.name}`;
  const response = yield call(fetch, endpoint);
  const data = yield response.json();
  yield put({ type: SAY_HELLO_SUCCESS, data });
}

export function* fetchFail() {
  try {
    const endpoint = `http://localhost:3001/will-fail`;
    const { statusText } = yield call(fetch, endpoint);
    throw new Error(statusText);
  } catch (error) {
    yield put({ type: SAY_HELLO_FAIL, error });
  }
}

export default function* rootSaga() {
  yield takeEvery(SAY_HELLO, fetchSayHello);
  yield takeEvery(WILL_FAIL_SAY_HELLO, fetchFail);
}
