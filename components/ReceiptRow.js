import React, {Component, PropTypes} from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableHighlight,
} from 'react-native';

var moment = require('moment');

function formatDescription(description) {
    return description ? description : ' ';
}

function mainText(total) {
    if (total) {
        return (<Text style={styles.total}>{'$' + total}</Text>)
    }

    return (<Text style={styles.edit}>Add details</Text>)
}

class ReceiptRow extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
        <TouchableHighlight onPress={this.props.onPress}>
            <View style={styles.container}>
                <View style={styles.rowHeader}>
                    {mainText(this.props.receipt.total)}
                    <Text style={styles.timestamp}>{moment(this.props.receipt.transactionTime).format('lll')}</Text>
                </View>
                <Text style={styles.description} numberOfLines={1}>{formatDescription(this.props.receipt.description)}</Text>
            </View>
        </TouchableHighlight>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        paddingLeft: 15,
        paddingTop: 8,
        paddingBottom: 8,
        paddingRight: 15,
    },
    rowHeader: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    total: {
        fontSize: 30,
        fontWeight: 'bold',
    },
    edit: {
        lineHeight: 40,
        fontSize: 24,
        color: '#ccc',
    },
    timestamp: {
        fontSize: 16,
    },
    description: {
        marginTop: 5,
        fontSize: 22,
    }
});

ReceiptRow.propTypes = {
    receipt: PropTypes.object.isRequired,
};
export default ReceiptRow;
