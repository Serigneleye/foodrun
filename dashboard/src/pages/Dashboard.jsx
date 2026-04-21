import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import Produits from './Produits'
import Commandes from './Commandes'
import ValiderPin from './ValiderPin'

function Accueil({ commerce }) {
    if (!commerce) return null
  
    if (!commerce.valide) {
      return (
        <div className="p-8 flex items-center justify-center min-h-screen">
          <div className="text-center max-w-sm">
            <div className="text-5xl mb-4">⏳</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Compte en cours de validation
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Votre commerce <strong>{commerce.nom}</strong> est en attente de validation.
              Vous serez contacté dès que votre compte sera approuvé.
            </p>
            <p className="text-xs text-gray-300 mt-4">
              Une question ? Contactez-nous sur WhatsApp
            </p>
          </div>
        </div>
      )
    }
  
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Bonjour {commerce?.nom || '👋'}
        </h2>
        <p className="text-gray-400 mt-1 text-sm">
          Bienvenue sur votre espace commerçant FoodRun
        </p>
  
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Produits actifs</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">0</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Commandes du jour</p>
            <p className="text-3xl font-bold text-green-600 mt-2">0</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Recettes du jour</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">0 F</p>
          </div>
        </div>
      </div>
    )
  }

export default function Dashboard() {
  const [commerce, setCommerce] = useState(null)

  useEffect(() => {
    async function chargerCommerce() {
        const { data: { user } } = await supabase.auth.getUser()
    
        const { data } = await supabase
          .from('profils')
          .select('*, commerces(*)')
          .eq('id', user.id)
          .single()
    
        if (data?.commerces) setCommerce(data.commerces)
      }

    chargerCommerce()
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar commerce={commerce} />
      <main className="flex-1">
        <Routes>
          <Route index element={<Accueil commerce={commerce} />} />
          <Route path="produits" element={<Produits commerce={commerce} />} />
          <Route path="commandes" element={<Commandes commerce={commerce} />} />
          <Route path="pin" element={<ValiderPin />} />
        </Routes>
      </main>
    </div>
  )
}