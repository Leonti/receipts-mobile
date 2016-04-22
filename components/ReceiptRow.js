import React, {
    PropTypes,
    StyleSheet,
    View,
    Text,
    TouchableHighlight,
} from 'react-native';

var moment = require('moment');

function formatTotal(total) {
    return total ? '$' + total : ' ';
}

function formatDescription(description) {
    return description ? description : ' ';
}

class ReceiptRow extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
        <TouchableHighlight onPress={this.props.onPress}>
            <View style={styles.container}>
                <View style={styles.rowHeader}>
                    <Text style={styles.total}>{formatTotal(this.props.receipt.total)}</Text>
                    <Text style={styles.timestamp}>{moment(this.props.receipt.timestamp).format('lll')}</Text>
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
    timestamp: {
        fontSize: 16,
    },
    description: {
        marginTop: 5,
        fontSize: 22,
    }
});

ReceiptRow.propTypes = {
    receipt: PropTypes.object.isRequired
};
export default ReceiptRow
