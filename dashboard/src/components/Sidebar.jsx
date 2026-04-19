import { NavLink } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const navItems = [
  { path: '/dashboard', label: 'Accueil', icon: '📊' },
  { path: '/dashboard/produits', label: 'Mes produits', icon: '🍽️' },
  { path: '/dashboard/commandes', label: 'Commandes', icon: '📦' },
  { path: '/dashboard/pin', label: 'Valider retrait', icon: '🔑' },
]

export default function Sidebar({ commerce }) {
  const handleDeconnexion = async () => {
    await supabase.auth.signOut()
  }

  return (
    <aside className="w-52 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      <div className="p-5 border-b border-gray-100">
        <h1 className="text-lg font-bold text-green-600">FoodRun</h1>
        <p className="text-xs text-gray-400 mt-0.5">Espace commerçant</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition ${
                isActive
                  ? 'bg-green-50 text-green-700 font-medium'
                  : 'text-gray-500 hover:bg-gray-50'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        {commerce && (
          <div className="mb-3 px-1">
            <p className="text-sm font-medium text-gray-700 truncate">{commerce.nom}</p>
            <p className="text-xs text-gray-400">{commerce.quartier} · {commerce.ville}</p>
          </div>
        )}
        <button
          onClick={handleDeconnexion}
          className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
        >
          Déconnexion
        </button>
      </div>
    </aside>
  )
}