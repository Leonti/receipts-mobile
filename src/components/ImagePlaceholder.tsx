import React, { StatelessComponent } from 'react'
import {
  StyleSheet,
  View,
  ActivityIndicator
} from 'react-native'

type Props = {
  width: number,
  height: number
}

const imagePlaceholder: StatelessComponent<Props> = (props) => (
  <View style={styles.container}>
    <View style={{
      width: props.width,
      height: props.height,
      backgroundColor: '#ccc',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <ActivityIndicator size='large' />
    </View>
  </View>
)

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 15
  }
})

export default imagePlaceholder
