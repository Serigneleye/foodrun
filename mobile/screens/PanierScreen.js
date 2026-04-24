import { View, Text, StyleSheet } from 'react-native'
export default function PanierScreen() {
  return (
    <View style={styles.container}>
      <Text>Mon panier</Text>
    </View>
  )
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
})