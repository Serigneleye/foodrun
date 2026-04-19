import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [telephone, setTelephone] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  const handleConnexion = async (e) => {
    e.preventDefault()
    setChargement(true)
    setErreur('')

    const emailFictif = `${telephone.trim()}@foodrun.sn`

    const { error } = await supabase.auth.signInWithPassword({
      email: emailFictif,
      password: motDePasse
    })

    if (error) setErreur('Téléphone ou mot de passe incorrect')
    setChargement(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm w-full max-w-sm p-8">

        <h1 className="text-2xl font-bold text-center text-gray-900">FoodRun</h1>
        <p className="text-sm text-center text-gray-400 mt-1 mb-8">Espace commerçant</p>

        <form onSubmit={handleConnexion} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Numéro de téléphone</label>
            <input
              type="tel"
              placeholder="77 123 45 67"
              value={telephone}
              onChange={e => setTelephone(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Mot de passe</label>
            <input
              type="password"
              placeholder="••••••••"
              value={motDePasse}
              onChange={e => setMotDePasse(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500"
            />
          </div>

          {erreur && (
            <p className="text-red-500 text-sm">{erreur}</p>
          )}

          <button
            type="submit"
            disabled={chargement}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg text-sm transition disabled:opacity-60"
          >
            {chargement ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}