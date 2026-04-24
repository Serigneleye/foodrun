import { View, Text, StyleSheet } from 'react-native'

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.titre}>Bienvenue sur FoodRun</Text>
      <Text style={styles.sub}>Les commerces arrivent bientôt...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  titre: { fontSize: 22, fontWeight: '700', color: '#111' },
  sub: { fontSize: 14, color: '#999', marginTop: 8 }
})