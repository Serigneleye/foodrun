import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'

const CATEGORIES = ['Restaurant', 'Boulangerie', 'Épicerie', 'Traiteur', 'Snack', 'Autre']
const QUARTIERS = ['Plateau', 'Médina', 'Almadies', 'Parcelles', 'Guédiawaye', 'Pikine', 'Rufisque', 'Autre']

export default function Inscription() {
  const [etape, setEtape] = useState(1)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')
  const [form, setForm] = useState({
    prenom: '', nom: '', telephone: '', motDePasse: '',
    nomCommerce: '', categorie: 'Restaurant', quartier: 'Plateau',
    ville: 'Dakar', mode_livraison: 'les_deux'
  })

  function sf(k, v) { setForm({ ...form, [k]: v }) }

  async function inscrire() {
    setErreur('')
    setChargement(true)

    const emailFictif = `${form.telephone.trim()}@foodrun.sn`

    // 1. Crée le compte auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailFictif,
      password: form.motDePasse
    })

    if (authError) {
      setErreur('Erreur : ' + authError.message)
      setChargement(false)
      return
    }

    const userId = authData.user.id

    // 2. Crée le commerce
    const { data: commerce, error: commerceError } = await supabase
      .from('commerces')
      .insert({
        nom: form.nomCommerce,
        categorie: form.categorie,
        quartier: form.quartier,
        ville: form.ville,
        telephone: form.telephone,
        mode_livraison: form.mode_livraison,
        actif: true
      })
      .select()
      .single()

    if (commerceError) {
      setErreur('Erreur lors de la création du commerce')
      setChargement(false)
      return
    }

    // 3. Crée le profil
    const { error: profilError } = await supabase
      .from('profils')
      .insert({
        id: userId,
        nom: form.nom,
        prenom: form.prenom,
        telephone: form.telephone,
        role: 'commercant',
        commerce_id: commerce.id
      })

    if (profilError) {
      setErreur('Erreur lors de la création du profil')
      setChargement(false)
      return
    }

    setChargement(false)
    
    // Connecte automatiquement après inscription
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: emailFictif,
      password: form.motDePasse
    })

    if (loginError) {
        setErreur('Compte créé mais connexion échouée. Connectez-vous manuellement.')
      } else {
        window.location.href = '/dashboard'
      }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm w-full max-w-md p-8">

        <h1 className="text-2xl font-bold text-center text-gray-900">FoodRun</h1>
        <p className="text-sm text-center text-gray-400 mt-1 mb-6">Créer votre espace commerçant</p>

        {/* Indicateur d'étapes */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(n => (
            <div key={n} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition ${
                etape >= n ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'
              }`}>{n}</div>
              {n < 3 && <div className={`flex-1 h-0.5 ${etape > n ? 'bg-green-600' : 'bg-gray-100'}`} />}
            </div>
          ))}
        </div>

        {/* Étape 1 — Infos personnelles */}
        {etape === 1 && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Vos informations</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Prénom</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                  placeholder="Fatou" value={form.prenom} onChange={e => sf('prenom', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nom</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                  placeholder="Diallo" value={form.nom} onChange={e => sf('nom', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Numéro de téléphone</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                placeholder="77 123 45 67" value={form.telephone} onChange={e => sf('telephone', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Mot de passe</label>
              <input type="password" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                placeholder="••••••••" value={form.motDePasse} onChange={e => sf('motDePasse', e.target.value)} />
            </div>
          </div>
        )}

        {/* Étape 2 — Infos commerce */}
        {etape === 2 && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Votre commerce</p>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Nom du commerce</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                placeholder="Boulangerie Teranga" value={form.nomCommerce} onChange={e => sf('nomCommerce', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Catégorie</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                value={form.categorie} onChange={e => sf('categorie', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Quartier</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                  value={form.quartier} onChange={e => sf('quartier', e.target.value)}>
                  {QUARTIERS.map(q => <option key={q}>{q}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Ville</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                  placeholder="Dakar" value={form.ville} onChange={e => sf('ville', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Étape 3 — Mode livraison */}
        {etape === 3 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-600 mb-2">Comment livrez-vous ?</p>
            {[
              { val: 'livraison', titre: 'Livraison uniquement', desc: 'Votre livreur livre le client à domicile' },
              { val: 'retrait', titre: 'Retrait uniquement', desc: 'Le client vient récupérer chez vous' },
              { val: 'les_deux', titre: 'Les deux', desc: 'Le client choisit au moment de commander' },
            ].map(opt => (
              <div
                key={opt.val}
                onClick={() => sf('mode_livraison', opt.val)}
                className={`border rounded-xl p-4 cursor-pointer transition ${
                  form.mode_livraison === opt.val
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="text-sm font-medium text-gray-700">{opt.titre}</p>
                <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
              </div>
            ))}
          </div>
        )}

        {erreur && <p className="text-red-500 text-sm mt-4">{erreur}</p>}

        <div className="flex gap-3 mt-6">
          {etape > 1 && (
            <button
              onClick={() => setEtape(etape - 1)}
              className="flex-1 border border-gray-200 text-gray-500 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition"
            >
              Retour
            </button>
          )}
          {etape < 3 ? (
            <button
              onClick={() => setEtape(etape + 1)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2.5 rounded-lg transition"
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={inscrire}
              disabled={chargement}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2.5 rounded-lg transition disabled:opacity-60"
            >
              {chargement ? 'Création...' : 'Créer mon compte'}
            </button>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-green-600 hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}