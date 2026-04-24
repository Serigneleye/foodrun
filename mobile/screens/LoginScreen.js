import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native'
import { supabase } from '../lib/supabase'

export default function LoginScreen() {
  const [telephone, setTelephone] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [inscription, setInscription] = useState(false)
  const [prenom, setPrenom] = useState('')
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  async function handleConnexion() {
    setErreur('')
    setChargement(true)
    const email = `${telephone.trim()}@foodrun.sn`

    if (inscription) {
      const { data, error } = await supabase.auth.signUp({
        email, password: motDePasse
      })

      if (error) {
        setErreur(error.message)
        setChargement(false)
        return
      }

      // Crée le profil client
      await supabase.from('profils').insert({
        id: data.user.id,
        prenom,
        telephone: telephone.trim(),
        role: 'client'
      })

    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email, password: motDePasse
      })
      if (error) setErreur('Téléphone ou mot de passe incorrect')
    }

    setChargement(false)
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        <Text style={styles.logo}>FoodRun</Text>
        <Text style={styles.sub}>
          {inscription ? 'Créer un compte' : 'Connexion'}
        </Text>

        {inscription && (
          <TextInput
            style={styles.input}
            placeholder="Votre prénom"
            value={prenom}
            onChangeText={setPrenom}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Numéro de téléphone"
          keyboardType="phone-pad"
          value={telephone}
          onChangeText={setTelephone}
        />

        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          secureTextEntry
          value={motDePasse}
          onChangeText={setMotDePasse}
        />

        {erreur ? <Text style={styles.erreur}>{erreur}</Text> : null}

        <TouchableOpacity
          style={styles.btn}
          onPress={handleConnexion}
          disabled={chargement}
        >
          {chargement
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>
                {inscription ? "S'inscrire" : 'Se connecter'}
              </Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { setInscription(!inscription); setErreur('') }}>
          <Text style={styles.lien}>
            {inscription
              ? 'Déjà un compte ? Se connecter'
              : "Pas de compte ? S'inscrire"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 24
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28
  },
  logo: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: '#111'
  },
  sub: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
    color: '#111'
  },
  btn: {
    backgroundColor: '#16a34a',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 4
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15
  },
  erreur: {
    color: '#ef4444',
    fontSize: 13,
    marginBottom: 8
  },
  lien: {
    color: '#16a34a',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 13
  }
})