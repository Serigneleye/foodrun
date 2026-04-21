import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ValiderPin() {
  const [pin, setPin] = useState('')
  const [resultat, setResultat] = useState(null)
  const [chargement, setChargement] = useState(false)

  async function verifierPin() {
    if (pin.length !== 6) {
      setResultat({ ok: false, msg: 'Le code doit contenir 6 chiffres' })
      return
    }

    setChargement(true)
    setResultat(null)

    const { data, error } = await supabase
      .from('commandes')
      .select('*, commande_produits(nom_produit, quantite)')
      .eq('code_verification', pin.trim())
      .single()

    if (error || !data) {
      setResultat({ ok: false, msg: 'Code introuvable. Vérifie le code client.' })
      setChargement(false)
      return
    }

    if (data.statut === 'livree') {
      setResultat({ ok: false, msg: `Commande déjà récupérée.` })
      setChargement(false)
      return
    }

    if (data.statut === 'annulee') {
      setResultat({ ok: false, msg: 'Cette commande a été annulée.' })
      setChargement(false)
      return
    }

    await supabase
      .from('commandes')
      .update({ statut: 'livree' })
      .eq('id', data.id)

    setResultat({
      ok: true,
      msg: `Commande validée !`,
      commande: data
    })
    setPin('')
    setChargement(false)
  }

  return (
    <div className="p-8 max-w-lg">
      <h2 className="text-2xl font-bold text-gray-800">Valider un retrait</h2>
      <p className="text-gray-400 mt-1 text-sm mb-8">
        Saisis le code PIN affiché sur le téléphone du client
      </p>

      <div className="bg-white rounded-xl border border-gray-100 p-8">
        <label className="block text-xs text-gray-500 uppercase tracking-wide mb-3">
          Code PIN client
        </label>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="000000"
          value={pin}
          onChange={e => {
            setPin(e.target.value.replace(/\D/g, ''))
            setResultat(null)
          }}
          onKeyDown={e => e.key === 'Enter' && verifierPin()}
          className="w-full text-center text-4xl font-mono tracking-widest border border-gray-200 rounded-xl py-4 outline-none focus:border-green-500 transition"
        />

        <button
          onClick={verifierPin}
          disabled={chargement || pin.length !== 6}
          className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition disabled:opacity-50"
        >
          {chargement ? 'Vérification...' : 'Valider le retrait'}
        </button>

        {resultat && (
          <div className={`mt-4 p-4 rounded-xl text-sm font-medium ${
            resultat.ok
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-600'
          }`}>
            <p>{resultat.msg}</p>
            {resultat.ok && resultat.commande && (
              <div className="mt-2 text-xs font-normal space-y-1">
                <p>Client : {resultat.commande.telephone_client}</p>
                <p>Localité : {resultat.commande.localite_livraison || 'Retrait sur place'}</p>
                {resultat.commande.commande_produits?.map((p, i) => (
                  <p key={i}>{p.quantite}x {p.nom_produit}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}