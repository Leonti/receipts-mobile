import React, { PropTypes, View, Text, Image, StyleSheet } from 'react-native';

import { Card } from 'react-native-material-design';

const propTypes = {
  toRoute: PropTypes.func.isRequired
};

class ReceiptsPage extends React.Component {

    render() {

        return (
            <View>
                <Card>
                    <Card.Media
                        image={<Image
                            source={ require('./receipt.png') }
                        //    resizeMode={Image.resizeMode.contain}
                            style={{width: 100, height: 100}}
                            />}
                        overlay
                    />
                    <Card.Body>
                        <Text>Receipt 1</Text>
                    </Card.Body>
                </Card>
                <Card>
                    <Card.Body>
                        <Text>Receipt 2</Text>
                    </Card.Body>
                </Card>
                <View style={{backgroundColor: 'yellow', width: 300, height: 300}}>
                    <Image
                        source={ require('./receipt.png') }
                        style={{ width: null, height: null, flex: 1  }}

                    />
                </View>
            </View>
        );
    }
}

let styles = StyleSheet.create({

  backgroundImage: {
    width: 100,
    height: 100
  }
});

ReceiptsPage.propTypes = propTypes;
export default ReceiptsPage;
