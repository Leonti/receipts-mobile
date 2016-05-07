import React from 'react';
import {
    PropTypes,
    StyleSheet,
    View,
    Text,
    TouchableHighlight,
} from 'react-native';

var Icon = require('react-native-vector-icons/MaterialIcons');

const NavigationView = (props) => (
    <View>
        <View style={styles.header}>
            <Text style={styles.userName}>{props.userName}</Text>
        </View>

        <TouchableHighlight onPress={props.onLogout} underlayColor="transparent">
            <View style={styles.actionRow}>
                <Icon name="power-settings-new" style={styles.actionRowIcon} />
                <Text style={styles.actionRowText}>Logout</Text>
            </View>
        </TouchableHighlight>
    </View>
);

const styles = StyleSheet.create({
    container: {
        alignItems: 'flex-start',

        backgroundColor: 'yellow',
    },
    header: {
        backgroundColor: '#2196f3',
        padding: 15,
    },
    userName: {
        color: '#fff',
        fontSize: 20,
    },
    actionRow: {
        flexDirection: 'row',
        padding: 10,
    },
    actionRowIcon: {
        fontSize: 25,
        marginRight: 15,
    },
    actionRowText: {
        fontSize: 18,
    }
});

NavigationView.propTypes = {
    userName: PropTypes.string.isRequired,
    onLogout: PropTypes.func.isRequired,
};
export default NavigationView
