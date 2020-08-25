export const SAY_HELLO = 'SAY_HELLO';

export function sayHello(name) {
  return {
    type: SAY_HELLO,
    name,
  };
}

export const SAY_HELLO_SUCCESS = 'SAY_HELLO_SUCCESS';

export function sayHelloSuccess() {
  return {
    type: SAY_HELLO_SUCCESS,
  };
}
