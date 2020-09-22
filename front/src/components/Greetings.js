import React from 'react';
import PropTypes from 'prop-types';

const Greetings = ({ greetings }) => <div>Greetings: {greetings}</div>;

Greetings.propTypes = {
  greetings: PropTypes.string,
};

export default Greetings;
