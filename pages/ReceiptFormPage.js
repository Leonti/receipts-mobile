import React, {
    PropTypes,
    StyleSheet,
    View,
    ScrollView,
    Text } from 'react-native';

import ImageViewer from '../components/ImageViewer';
import ReceiptThumbnail from '../components/ReceiptThumbnail';
import ReceiptForm from '../components/ReceiptForm';
import Spinner from '../components/Spinner';
var Icon = require('react-native-vector-icons/Ionicons');

const MAX_HEIGHT = 200;

class ReceiptFormPage extends React.Component {

    constructor(props) {
        super(props);

        let scale = MAX_HEIGHT / props.imageHeight
        this.state = {
            description: props.description,
            total: props.total !== null ? props.total.toString(): null,
            thumbnailWidth: props.imageWidth * scale,
            thumbnailHeight: props.imageHeight * scale,
            spinnerVisible: false,
        };
    }

    _imageViewer() {
        this.props.toRoute({
            component: ImageViewer,
            passProps: {
                source: this.props.source,
                imageWidth: this.props.imageWidth,
                imageHeight: this.props.imageHeight
            }
        });
    }

    _onActionSelected(position) {
        this.setState({spinnerVisible: true});
        let hideSpinner = function() {
            this.setState({spinnerVisible: false});
        }.bind(this);

        this.props.onSave({
            total: this.state.total,
            description: this.state.description
        }).then(hideSpinner, hideSpinner);
    }

    render() {
        return (
            <View style={styles.container}>
                <Icon.ToolbarAndroid
                    style={styles.toolbar}
                    title="New Receipt"
                    navIconName="android-close"
                    actions={[{title: 'Save', show: 'always'}]}
                    onIconClicked={this.props.toBack}
                    onActionSelected={(position) => this._onActionSelected(position) } />
                <ScrollView>
                    <ReceiptThumbnail
                        onPress={() => this._imageViewer()}
                        source={this.props.source}
                        width={this.state.thumbnailWidth}
                        height={this.state.thumbnailHeight}
                    />
                    <ReceiptForm
                        total={this.state.total}
                        onTotalChange={(text) => this.setState({total: text})}
                        description={this.state.description}
                        onDescriptionChange={(text) => this.setState({description: text})}
                    />
                </ScrollView>
                <Spinner message='Saving receipt ...' visible={this.state.spinnerVisible} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    toolbar: {
        backgroundColor: '#e9eaed',
        height: 56,
    },
});

ReceiptFormPage.propTypes = {
    onSave: PropTypes.func.isRequired,
    source: PropTypes.object.isRequired,
    imageWidth: PropTypes.number.isRequired,
    imageHeight: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    total: PropTypes.any.isRequired,
    toRoute: PropTypes.func.isRequired,
    toBack: PropTypes.func.isRequired,
};
export default ReceiptFormPage
