import { connect } from 'react-redux';
import Greetings from '../components/Greetings';

const mapStateToProps = (state) => {
  return {
    greetings: state.name,
  };
};

const GreetingsContainer = connect(mapStateToProps)(Greetings);

export default GreetingsContainer;
