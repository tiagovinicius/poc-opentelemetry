import React, { Component } from 'react';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import GreetingsForm from './containers/GreetingsForm';
import GreetingsContainer from './containers/GreetingsContainer';

class App extends Component {
  render() {
    return (
      <Container>
        <Row className="row">
          <Col xs={12}>
            <h1>Say hello</h1>
            <GreetingsForm />
            <GreetingsContainer />
          </Col>
        </Row>
      </Container>
    );
  }
}

export default App;
