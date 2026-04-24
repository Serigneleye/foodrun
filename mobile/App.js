import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

import LoginScreen from './screens/LoginScreen'
import HomeScreen from './screens/HomeScreen'
import CommerceScreen from './screens/CommerceScreen'
import PanierScreen from './screens/PanierScreen'

const Stack = createNativeStackNavigator()

export default function App() {
  const [session, setSession] = useState(null)
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setChargement(false)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  if (chargement) return null

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Commerce" component={CommerceScreen} />
            <Stack.Screen name="Panier" component={PanierScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}