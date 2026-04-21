import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Admin() {
  const [commerces, setCommerces] = useState([])
  const [commandes, setCommandes] = useState([])
  const [onglet, setOnglet] = useState('commerces')
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    chargerDonnees()
  }, [])

  async function chargerDonnees() {
    setChargement(true)

    const { data: cs } = await supabase
      .from('commerces')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: cms } = await supabase
      .from('commandes')
      .select('*, commerces(nom)')
      .order('created_at', { ascending: false })
      .limit(50)

    setCommerces(cs || [])
    setCommandes(cms || [])
    setChargement(false)
  }

  async function validerCommerce(id, statut) {
    await supabase
      .from('commerces')
      .update({ statut_compte: statut, valide: statut === 'actif' })
      .eq('id', id)
    chargerDonnees()
  }

  async function marquerReverseement(id) {
    await supabase.from('commandes')
      .update({ reversement_effectue: true })
      .eq('id', id)
    chargerDonnees()
  }

  const aValider = commerces.filter(c => c.statut_compte === 'en_attente')
  const valides = commerces.filter(c => c.statut_compte === 'actif')
  const desactives = commerces.filter(c => c.statut_compte === 'desactive')
  const commissions = commandes
    .filter(c => c.statut === 'livree' && !c.reversement_effectue)
    .reduce((s, c) => s + (c.commission_foodrun || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">FoodRun Admin</h1>
          <p className="text-xs text-gray-400">Tableau de bord administrateur</p>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-sm text-gray-400 hover:text-red-500 transition"
        >
          Déconnexion
        </button>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wide">À valider</p>
            <p className="text-3xl font-bold text-amber-500 mt-2">{aValider.length}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Commerces actifs</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{valides.length}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Total commandes</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{commandes.length}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Commissions dues</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{commissions.toLocaleString()} F</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {['commerces', 'commandes'].map(o => (
            <button
              key={o}
              onClick={() => setOnglet(o)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                onglet === o
                  ? 'bg-green-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-500 hover:border-green-400'
              }`}
            >
              {o === 'commerces' ? 'Commerces' : 'Commandes'}
            </button>
          ))}
        </div>

        {chargement ? (
          <p className="text-gray-300 text-sm">Chargement...</p>
        ) : onglet === 'commerces' ? (
          <div className="space-y-3">
            {aValider.length > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4">
                <p className="text-sm font-medium text-amber-700 mb-3">
                  {aValider.length} commerce(s) en attente de validation
                </p>
                {aValider.map(c => (
                  <div key={c.id} className="bg-white rounded-lg p-4 mb-2 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{c.nom}</p>
                      <p className="text-xs text-gray-400">{c.categorie} · {c.quartier}, {c.ville}</p>
                      <p className="text-xs text-gray-400">{c.telephone}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => validerCommerce(c.id, 'actif')}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition"
                      >
                        Valider
                      </button>
                      <button
                        onClick={() => validerCommerce(c.id, 'desactive')}
                        className="text-xs text-red-400 hover:text-red-600 px-3 py-1.5 rounded-lg border border-red-100 transition"
                      >
                        Refuser
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-5 px-4 py-3 text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <span className="col-span-2">Commerce</span>
                <span>Catégorie</span>
                <span>Mode</span>
                <span>Statut</span>
              </div>
              {valides.map(c => (
                <div key={c.id} className="grid grid-cols-5 px-4 py-3 items-center border-b border-gray-50 hover:bg-gray-50">
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-700">{c.nom}</p>
                    <p className="text-xs text-gray-400">{c.quartier}, {c.ville}</p>
                  </div>
                  <span className="text-sm text-gray-500">{c.categorie}</span>
                  <span className="text-xs text-gray-400">{c.mode_livraison}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 w-fit">
                      Actif
                    </span>
                    <button
                      onClick={() => validerCommerce(c.id, 'desactive')}
                      className="text-xs text-red-400 hover:text-red-600 transition"
                    >
                    Désactiver
                    </button>
                  </div>
                </div>
              ))}
</div>

{desactives.length > 0 && (
  <div className="bg-red-50 border border-red-100 rounded-xl p-4 mt-4">
    <p className="text-sm font-medium text-red-700 mb-3">
      {desactives.length} commerce(s) désactivé(s)
    </p>
    {desactives.map(c => (
      <div key={c.id} className="bg-white rounded-lg p-4 mb-2 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-800">{c.nom}</p>
          <p className="text-xs text-gray-400">{c.categorie} · {c.quartier}, {c.ville}</p>
        </div>
        <button
          onClick={() => validerCommerce(c.id, 'actif')}
          className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition"
        >
          Réactiver
        </button>
      </div>
    ))}
  </div>
)}

</div>
) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-5 px-4 py-3 text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
              <span>Commerce</span>
              <span>Montant</span>
              <span>Commission</span>
              <span>Statut</span>
              <span>Reversement</span>
            </div>
            {commandes.map(c => (
              <div key={c.id} className="grid grid-cols-5 px-4 py-3 items-center border-b border-gray-50 hover:bg-gray-50">
                <span className="text-sm text-gray-700">{c.commerces?.nom}</span>
                <span className="text-sm font-medium text-green-600">
                  {c.montant_produits?.toLocaleString()} F
                </span>
                <span className="text-sm text-gray-500">
                  {(c.commission_foodrun || 0).toLocaleString()} F
                </span>
                <span className={`text-xs px-2 py-1 rounded-full w-fit ${
                  c.statut === 'livree' ? 'bg-green-50 text-green-700' :
                  c.statut === 'en_attente' ? 'bg-amber-50 text-amber-700' :
                  'bg-gray-100 text-gray-400'
                }`}>{c.statut}</span>
                {c.statut === 'livree' && !c.reversement_effectue ? (
                  <button
                    onClick={() => marquerReverseement(c.id)}
                    className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-lg transition w-fit"
                  >
                    Marquer reversé
                  </button>
                ) : (
                  <span className="text-xs text-gray-300">
                    {c.reversement_effectue ? '✓ Reversé' : '—'}
                  </span>
                )}
              </div>
            ))}
            {commandes.length === 0 && (
              <div className="text-center py-12 text-gray-300 text-sm">
                Aucune commande pour l'instant
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}