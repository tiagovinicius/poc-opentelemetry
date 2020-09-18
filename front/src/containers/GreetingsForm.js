import React from 'react';
import { connect } from 'react-redux';
import { sayHello, fetchSomeFail } from '../actions';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

let GreetingsForm = ({ dispatch }) => {
  let input;

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        if (!input.value.trim()) {
          return;
        }
        dispatch(sayHello(input.value));
        input.value = '';
      }}
    >
      <Form.Group controlId="formBasicEmail">
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Enter an name"
            ref={(node) => {
              input = node;
            }}
          />
          <InputGroup.Append>
            <Button type="submit" id="say-hello-button">Say hello</Button>
            <Button type="button" onClick={() => dispatch(fetchSomeFail())}>Fail</Button>
          </InputGroup.Append>
        </InputGroup>
      </Form.Group>
    </Form>
  );
};
GreetingsForm = connect()(GreetingsForm);

export default GreetingsForm;
