import React, { PropTypes, StyleSheet, View, TouchableHighlight, Text } from 'react-native';

import ReceiptForm from '../components/ReceiptForm';

const propTypes = {
  toRoute: PropTypes.func.isRequired,
  replaceRoute: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.onUpdate
};

class ReceiptSavePage extends React.Component {

    constructor(props) {
        super(props);

        this._navigateHome = this._navigateHome.bind(this);
    }

  _navigateHome() {
      this.props.replaceRoute({
        name: "Home",
        component: HomePage
      });
  }

  render() {
      return (
          <View style={{ flex:0.8, backgroundColor: 'blue' }}>
              <ReceiptForm onUpdate={this.props.onUpdate} />
          </View>
      );
  }

}

ReceiptSavePage.propTypes = propTypes;
export default ReceiptSavePage;
