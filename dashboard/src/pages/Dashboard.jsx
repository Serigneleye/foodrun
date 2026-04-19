import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [profil, setProfil] = useState(null)

  useEffect(() => {
    async function chargerProfil() {
      const { data: { user } } = await supabase.auth.getUser()

      const { data } = await supabase
        .from('profils')
        .select('*, commerces(*)')
        .eq('id', user.id)
        .single()

      setProfil(data)
    }

    chargerProfil()
  }, [])

  const handleDeconnexion = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>FoodRun Dashboard</h1>
        <button
          onClick={handleDeconnexion}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid #ddd',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 13
          }}
        >
          Déconnexion
        </button>
      </div>

      {profil && (
        <p style={{ color: '#888', marginTop: 8 }}>
          Bienvenue, {profil.commerces?.nom || profil.prenom} 👋
        </p>
      )}

      <p style={{ marginTop: 40, color: '#aaa' }}>
        Le dashboard complet arrive bientôt...
      </p>
    </div>
  )
}