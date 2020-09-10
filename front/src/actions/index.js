export const SAY_HELLO = 'SAY_HELLO';
export const FETCH_SOME_FAIL = 'FETCH_SOME_FAIL';

export function sayHello(name) {
  return {
    type: SAY_HELLO,
    name,
  };
}

export function fetchSomeFail() {
  return {
    type: FETCH_SOME_FAIL,
  };
}

export const SAY_HELLO_SUCCESS = 'SAY_HELLO_SUCCESS';

export function sayHelloSuccess() {
  return {
    type: SAY_HELLO_SUCCESS,
  };
}
