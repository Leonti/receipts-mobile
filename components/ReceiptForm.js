import React from 'react';
import {
    PropTypes,
    StyleSheet,
    View,
    Text,
    TextInput,
} from 'react-native';

const ReceiptForm = (props) => (
    <View style={styles.container}>
        <Text style={styles.formLabel}>Total:</Text>
        <TextInput
            style={styles.total}
            keyboardType='numeric'
            onChangeText={(text) => props.onTotalChange(text)}
            value={props.total} />

        <Text style={styles.formLabel}>Notes:</Text>
        <TextInput
            style={styles.description}
            onChangeText={(text) => props.onDescriptionChange(text)}
            multiline={true}
            value={props.description} />
    </View>
);

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },

    formLabel: {
        fontSize: 18,
    },

    total: {
        fontSize: 18,
    },

    description: {
        fontSize: 18,
        height: 100,
        textAlignVertical: 'top',
    }
});

ReceiptForm.propTypes = {
    total: PropTypes.string.isRequired,
    onTotalChange: PropTypes.func.isRequired,
    description: PropTypes.string.isRequired,
    onDescriptionChange: PropTypes.func.isRequired,
};
export default ReceiptForm
