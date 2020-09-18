export const SAY_HELLO = 'SAY_HELLO';
export const WILL_FAIL_SAY_HELLO = 'WILL_FAIL_SAY_HELLO';
export const SAY_HELLO_FAIL = 'SAY_HELLO_FAIL';

export function sayHello(name) {
  return {
    type: SAY_HELLO,
    name,
  };
}

export function fetchSomeFail() {
  return {
    type: WILL_FAIL_SAY_HELLO,
  };
}

export const SAY_HELLO_SUCCESS = 'SAY_HELLO_SUCCESS';

export function sayHelloSuccess() {
  return {
    type: SAY_HELLO_SUCCESS,
  };
}
