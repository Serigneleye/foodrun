import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Navigate } from 'react-router-dom'

export default function PrivateRoute({ children, adminOnly = false }) {
  const [session, setSession] = useState(undefined)
  const [role, setRole] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)

      if (session) {
        const { data } = await supabase
          .from('profils')
          .select('role')
          .eq('id', session.user.id)
          .single()

        setRole(data?.role || null)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        if (!session) setRole(null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined || (session && role === null)) {
    return <p className="p-10">Chargement...</p>
  }

  if (!session) return <Navigate to="/login" replace />

  if (adminOnly && role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}