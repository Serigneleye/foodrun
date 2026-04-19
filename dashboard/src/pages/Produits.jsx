import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const CATEGORIES = ['plat', 'boisson', 'dessert', 'épicerie', 'reste']

const formVide = {
  nom: '', description: '', prix: '',
  prix_reduit: '', stock: '1', type: 'plat', photo: null
}

export default function Produits({ commerce }) {
  const [produits, setProduits] = useState([])
  const [chargement, setChargement] = useState(true)
  const [formulaire, setFormulaire] = useState(false)
  const [form, setForm] = useState(formVide)
  const [editId, setEditId] = useState(null)
  const [erreur, setErreur] = useState('')
  const [sauvegarde, setSauvegarde] = useState(false)
  const [apercu, setApercu] = useState(null)

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

  function ouvrirFormulaire(produit = null) {
    if (produit) {
      setForm({
        nom: produit.nom,
        description: produit.description || '',
        prix: produit.prix,
        prix_reduit: produit.prix_reduit || '',
        stock: produit.stock,
        type: produit.type,
        photo: null
      })
      setEditId(produit.id)
      setApercu(produit.photo_url || null)
    } else {
      setForm(formVide)
      setEditId(null)
      setApercu(null)
    }
    setFormulaire(true)
    setErreur('')
  }

  function fermerFormulaire() {
    setFormulaire(false)
    setForm(formVide)
    setEditId(null)
    setApercu(null)
    setErreur('')
  }

  function handlePhoto(e) {
    const fichier = e.target.files[0]
    if (!fichier) return
    setForm({ ...form, photo: fichier })
    setApercu(URL.createObjectURL(fichier))
  }

  async function uploadPhoto(fichier, produitId) {
    const extension = fichier.name.split('.').pop()
    const chemin = `${commerce.id}/${produitId}.${extension}`
    const { error } = await supabase.storage
      .from('produits')
      .upload(chemin, fichier, { upsert: true })
    if (error) return null
    const { data } = supabase.storage.from('produits').getPublicUrl(chemin)
    return data.publicUrl
  }

  async function sauvegarder() {
    setErreur('')
    if (!form.nom || !form.prix) {
      setErreur('Le nom et le prix sont obligatoires')
      return
    }
    setSauvegarde(true)

    let photo_url = apercu && !form.photo ? apercu : null

    const payload = {
      commerce_id: commerce.id,
      nom: form.nom,
      description: form.description,
      prix: Number(form.prix),
      prix_reduit: form.prix_reduit ? Number(form.prix_reduit) : null,
      stock: Number(form.stock),
      type: form.type,
      disponible: true
    }

    if (editId) {
      const { error } = await supabase
        .from('produits')
        .update(payload)
        .eq('id', editId)

      if (!error && form.photo) {
        photo_url = await uploadPhoto(form.photo, editId)
        await supabase.from('produits').update({ photo_url }).eq('id', editId)
      }
    } else {
      const { data, error } = await supabase
        .from('produits')
        .insert(payload)
        .select()
        .single()

      if (!error && form.photo && data) {
        photo_url = await uploadPhoto(form.photo, data.id)
        await supabase.from('produits').update({ photo_url }).eq('id', data.id)
      }
    }

    setSauvegarde(false)
    fermerFormulaire()
    chargerProduits()
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
          onClick={() => ouvrirFormulaire()}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
        >
          + Ajouter un produit
        </button>
      </div>

      {formulaire && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">
            {editId ? 'Modifier le produit' : 'Nouveau produit'}
          </h3>
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
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Photo du produit</label>
              <label className="cursor-pointer block">
                <div className={`border-2 border-dashed rounded-xl transition flex flex-col items-center justify-center gap-2 ${apercu ? 'border-green-200 p-2' : 'border-gray-200 hover:border-green-400 p-8'}`}>
                  {apercu ? (
                    <img src={apercu} alt="aperçu" className="w-32 h-32 rounded-lg object-cover" />
                  ) : (
                    <>
                      <span className="text-3xl">📷</span>
                      <span className="text-sm text-gray-400">Cliquez pour ajouter une photo</span>
                      <span className="text-xs text-gray-300">JPG, PNG — max 5MB</span>
                    </>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
              </label>
              {apercu && (
                <button
                  onClick={() => { setApercu(null); setForm({ ...form, photo: null }) }}
                  className="text-xs text-red-400 hover:text-red-600 mt-1"
                >
                  Supprimer la photo
                </button>
              )}
            </div>
          </div>

          {erreur && <p className="text-red-500 text-sm mt-3">{erreur}</p>}

          <div className="flex gap-3 mt-4">
            <button
              onClick={sauvegarder}
              disabled={sauvegarde}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-60"
            >
              {sauvegarde ? 'Sauvegarde...' : editId ? 'Modifier' : 'Publier'}
            </button>
            <button
              onClick={fermerFormulaire}
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
          <div className="grid grid-cols-6 px-4 py-3 text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
            <span className="col-span-2">Produit</span>
            <span>Prix</span>
            <span>Stock</span>
            <span>Statut</span>
            <span>Actions</span>
          </div>
          {produits.map(p => (
            <div key={p.id} className="grid grid-cols-6 px-4 py-3 items-center border-b border-gray-50 hover:bg-gray-50 transition">
              <div className="col-span-2 flex items-center gap-3">
                {p.photo_url ? (
                  <img src={p.photo_url} alt={p.nom} className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-lg">🍽️</div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-700">{p.nom}</p>
                  <p className="text-xs text-gray-400">{p.type}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-green-600">{p.prix.toLocaleString()} F</p>
                {p.prix_reduit && (
                  <p className="text-xs text-gray-400 line-through">{p.prix_reduit.toLocaleString()} F</p>
                )}
              </div>
              <span className="text-sm text-gray-600">{p.stock}</span>
              <button
                onClick={() => toggleDisponible(p)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium w-fit transition ${
                  p.disponible
                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                {p.disponible ? 'Disponible' : 'Indispo'}
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => ouvrirFormulaire(p)}
                  className="text-xs text-blue-400 hover:text-blue-600 transition"
                >
                  Modifier
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