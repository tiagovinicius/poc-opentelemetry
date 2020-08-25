import React from 'react';
import PropTypes from 'prop-types';

const Greetings = ({ greetings }) => <div>Div: {greetings}</div>;

Greetings.propTypes = {
  greetings: PropTypes.string.isRequired,
};

export default Greetings;
