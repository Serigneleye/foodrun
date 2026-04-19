import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [status, setStatus] = useState('Connexion en cours...')

  useEffect(() => {
    async function testConnexion() {
      const { data, error } = await supabase
        .from('commerces')
        .select('count')

      if (error) {
        setStatus('Erreur : ' + error.message)
      } else {
        setStatus('Supabase connecté !')
      }
    }

    testConnexion()
  }, [])

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>FoodRun Dashboard</h1>
      <p>{status}</p>
    </div>
  )
}

export default App