import React from 'react';
import {
    PropTypes,
    StyleSheet,
    View,
    Text,
} from 'react-native';

function formatTotal(total) {
    return total ? '$' + total : '';
}

const ReceiptDetails = (props) => (
    <View style={styles.container}>
        <Text style={styles.total}>{formatTotal(props.receipt.total)}</Text>
        <Text style={styles.description}>{props.receipt.description}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        padding: 15,
    },
    total: {
        fontSize: 40,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 25
    }
});

ReceiptDetails.propTypes = {
    receipt: PropTypes.object.isRequired
};
export default ReceiptDetails
