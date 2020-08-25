import { SAY_HELLO_SUCCESS } from '../actions';

const initialState = {
  name: null,
};

export default function greetings(state = initialState, action) {
  switch (action.type) {
    case SAY_HELLO_SUCCESS:
      return { name: action.data };
    default:
      return state;
  }
}
