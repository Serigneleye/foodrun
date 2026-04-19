import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Navigate } from 'react-router-dom'

export default function PrivateRoute({ children }) {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    // Vérifie si l'utilisateur est connecté
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Écoute les changements de connexion
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    )

    return () => subscription.unsubscribe()
  }, [])

  // Encore en train de vérifier
  if (session === undefined) return <p style={{ padding: 40 }}>Chargement...</p>

  // Pas connecté → redirige vers login
  if (!session) return <Navigate to="/login" replace />

  // Connecté → affiche la page demandée
  return children
}