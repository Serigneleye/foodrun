import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const CATEGORIES = ['plat', 'boisson', 'dessert', 'épicerie', 'reste']

export default function Produits({ commerce }) {
  const [produits, setProduits] = useState([])
  const [chargement, setChargement] = useState(true)
  const [formulaire, setFormulaire] = useState(false)
  const [form, setForm] = useState({
    nom: '', description: '', prix: '',
    prix_reduit: '', stock: '1', type: 'plat'
  })
  const [erreur, setErreur] = useState('')
  const [sauvegarde, setSauvegarde] = useState(false)

  useEffect(() => {
    if (commerce?.id) chargerProduits()
  }, [commerce])

  async function chargerProduits() {
    setChargement(true)
    const { data } = await supabase
      .from('produits')
      .select('*')
      .eq('commerce_id', commerce.id)
      .order('created_at', { ascending: false })

    setProduits(data || [])
    setChargement(false)
  }

  async function ajouterProduit() {
    setErreur('')
    if (!form.nom || !form.prix) {
      setErreur('Le nom et le prix sont obligatoires')
      return
    }

    setSauvegarde(true)
    const { error } = await supabase.from('produits').insert({
      commerce_id: commerce.id,
      nom: form.nom,
      description: form.description,
      prix: Number(form.prix),
      prix_reduit: form.prix_reduit ? Number(form.prix_reduit) : null,
      stock: Number(form.stock),
      type: form.type,
      disponible: true
    })

    if (error) {
      setErreur('Erreur lors de la sauvegarde')
    } else {
      setForm({ nom: '', description: '', prix: '', prix_reduit: '', stock: '1', type: 'plat' })
      setFormulaire(false)
      chargerProduits()
    }
    setSauvegarde(false)
  }

  async function toggleDisponible(produit) {
    await supabase
      .from('produits')
      .update({ disponible: !produit.disponible })
      .eq('id', produit.id)
    chargerProduits()
  }

  async function supprimerProduit(id) {
    if (!confirm('Supprimer ce produit ?')) return
    await supabase.from('produits').delete().eq('id', id)
    chargerProduits()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Mes produits</h2>
          <p className="text-gray-400 mt-1 text-sm">Gérez vos produits disponibles</p>
        </div>
        <button
          onClick={() => setFormulaire(!formulaire)}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
        >
          + Ajouter un produit
        </button>
      </div>

      {formulaire && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">Nouveau produit</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Nom du produit *</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                placeholder="ex: Thiébou Dieun, Yassa poulet..."
                value={form.nom}
                onChange={e => setForm({ ...form, nom: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Description</label>
              <textarea
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                placeholder="Décrivez votre produit..."
                rows={2}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Prix normal (FCFA) *</label>
              <input
                type="number"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                placeholder="3500"
                value={form.prix}
                onChange={e => setForm({ ...form, prix: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Prix réduit (FCFA)</label>
              <input
                type="number"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                placeholder="Optionnel"
                value={form.prix_reduit}
                onChange={e => setForm({ ...form, prix_reduit: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Stock</label>
              <input
                type="number"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                value={form.stock}
                onChange={e => setForm({ ...form, stock: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Catégorie</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {erreur && <p className="text-red-500 text-sm mt-3">{erreur}</p>}

          <div className="flex gap-3 mt-4">
            <button
              onClick={ajouterProduit}
              disabled={sauvegarde}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-60"
            >
              {sauvegarde ? 'Sauvegarde...' : 'Publier le produit'}
            </button>
            <button
              onClick={() => setFormulaire(false)}
              className="text-sm text-gray-400 hover:text-gray-600 px-4 py-2 rounded-lg border border-gray-200 transition"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {chargement ? (
        <p className="text-gray-300 text-sm">Chargement...</p>
      ) : produits.length === 0 ? (
        <div className="text-center py-16 text-gray-300">
          <p className="text-4xl mb-3">🍽️</p>
          <p>Aucun produit pour l'instant</p>
          <p className="text-sm mt-1">Cliquez sur "Ajouter un produit" pour commencer</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-5 px-4 py-3 text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
            <span className="col-span-2">Produit</span>
            <span>Prix</span>
            <span>Stock</span>
            <span>Actions</span>
          </div>
          {produits.map(p => (
            <div key={p.id} className="grid grid-cols-5 px-4 py-3 items-center border-b border-gray-50 hover:bg-gray-50 transition">
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-700">{p.nom}</p>
                <p className="text-xs text-gray-400">{p.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-green-600">{p.prix.toLocaleString()} F</p>
                {p.prix_reduit && (
                  <p className="text-xs text-gray-400 line-through">{p.prix_reduit.toLocaleString()} F</p>
                )}
              </div>
              <span className="text-sm text-gray-600">{p.stock}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleDisponible(p)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${
                    p.disponible
                      ? 'bg-green-50 text-green-700 hover:bg-green-100'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {p.disponible ? 'Disponible' : 'Indispo'}
                </button>
                <button
                  onClick={() => supprimerProduit(p.id)}
                  className="text-xs text-red-400 hover:text-red-600 transition"
                >
                  Suppr.
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}