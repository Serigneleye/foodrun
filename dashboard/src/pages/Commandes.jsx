import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const STATUTS = {
  en_attente: { label: 'En attente', class: 'bg-amber-50 text-amber-700' },
  en_livraison: { label: 'En livraison', class: 'bg-blue-50 text-blue-700' },
  livree: { label: 'Livrée', class: 'bg-green-50 text-green-700' },
  annulee: { label: 'Annulée', class: 'bg-red-50 text-red-700' },
}

export default function Commandes({ commerce }) {
  const [commandes, setCommandes] = useState([])
  const [chargement, setChargement] = useState(true)
  const [filtre, setFiltre] = useState('toutes')

  useEffect(() => {
    if (!commerce?.id) return
    chargerCommandes()

    // Temps réel — nouvelle commande = mise à jour automatique
    const subscription = supabase
      .channel('commandes-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'commandes',
        filter: `commerce_id=eq.${commerce.id}`
      }, () => chargerCommandes())
      .subscribe()

    return () => subscription.unsubscribe()
  }, [commerce])

  async function chargerCommandes() {
    setChargement(true)
    const { data } = await supabase
      .from('commandes')
      .select(`
        *,
        commande_produits (
          nom_produit,
          quantite,
          prix_unitaire
        )
      `)
      .eq('commerce_id', commerce.id)
      .order('created_at', { ascending: false })

    setCommandes(data || [])
    setChargement(false)
  }

  async function changerStatut(id, statut) {
    await supabase
      .from('commandes')
      .update({ statut })
      .eq('id', id)
    chargerCommandes()
  }

  const filtrees = filtre === 'toutes'
    ? commandes
    : commandes.filter(c => c.statut === filtre)

  const enAttente = commandes.filter(c => c.statut === 'en_attente').length
  const recettes = commandes
    .filter(c => c.statut === 'livree')
    .reduce((s, c) => s + c.montant_produits, 0)

  function formatDate(date) {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Commandes</h2>
          <p className="text-gray-400 mt-1 text-sm">Mises à jour en temps réel</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-xs text-gray-400">En direct</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wide">En attente</p>
          <p className="text-3xl font-bold text-amber-500 mt-2">{enAttente}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Total du jour</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{commandes.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Recettes livrées</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{recettes.toLocaleString()} F</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {['toutes', 'en_attente', 'en_livraison', 'livree', 'annulee'].map(f => (
          <button
            key={f}
            onClick={() => setFiltre(f)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
              filtre === f
                ? 'bg-green-600 text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-green-400'
            }`}
          >
            {f === 'toutes' ? 'Toutes' : STATUTS[f]?.label}
          </button>
        ))}
      </div>

      {chargement ? (
        <p className="text-gray-300 text-sm">Chargement...</p>
      ) : filtrees.length === 0 ? (
        <div className="text-center py-16 text-gray-300">
          <p className="text-4xl mb-3">📦</p>
          <p>Aucune commande ici</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtrees.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-800">
                      {c.telephone_client}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUTS[c.statut]?.class}`}>
                      {STATUTS[c.statut]?.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {formatDate(c.created_at)} · {c.localite_livraison || 'Retrait sur place'}
                  </p>
                  {c.note_client && (
                    <p className="text-xs text-gray-500 mt-1 italic">"{c.note_client}"</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">
                    {c.montant_produits?.toLocaleString()} F
                  </p>
                  <p className="text-xs text-gray-400">
                    + {c.frais_livraison || 0} F livraison
                  </p>
                  <p className="text-xs font-mono text-gray-500 mt-1">
                    PIN : {c.code_verification}
                  </p>
                </div>
              </div>

              {c.commande_produits?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-50">
                  {c.commande_produits.map((p, i) => (
                    <div key={i} className="flex justify-between text-xs text-gray-500 py-0.5">
                      <span>{p.quantite}x {p.nom_produit}</span>
                      <span>{(p.prix_unitaire * p.quantite).toLocaleString()} F</span>
                    </div>
                  ))}
                </div>
              )}

              {c.statut === 'en_attente' && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => changerStatut(c.id, 'en_livraison')}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition"
                  >
                    Envoyer en livraison
                  </button>
                  <button
                    onClick={() => changerStatut(c.id, 'annulee')}
                    className="text-xs text-red-400 hover:text-red-600 px-3 py-1.5 rounded-lg border border-red-100 transition"
                  >
                    Annuler
                  </button>
                </div>
              )}

              {c.statut === 'en_livraison' && (
                <button
                  onClick={() => changerStatut(c.id, 'livree')}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition"
                >
                  Marquer comme livrée
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}