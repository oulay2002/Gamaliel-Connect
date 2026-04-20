import { useState, useEffect } from 'react'
import { db } from './firebase'
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore'
import './App.css'

function App() {
  const [user, setUser] = useState(null) // null = pas connecté
  const [loginRole, setLoginRole] = useState('') // 'parent' | 'enseignant' | 'directeur'
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  
  // Données de l'application
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  // Formulaire enseignant
  const [nomEleve, setNomEleve] = useState('')
  const [matiere, setMatiere] = useState('')
  const [note, setNote] = useState('')

  // Écoute en temps réel de la base de données
  useEffect(() => {
    if (!user) return

    const q = query(collection(db, "compositions"), orderBy("date", "desc"))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        displayDate: doc.data().date?.toDate?.() || new Date()
      }))
      setNotes(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  // Connexion (simulation pour l'instant)
  const handleLogin = (e) => {
    e.preventDefault()
    if (loginRole && loginEmail && loginPassword) {
      setUser({
        email: loginEmail,
        role: loginRole,
        name: loginEmail.split('@')[0]
      })
    } else {
      alert('Veuillez remplir tous les champs')
    }
  }

  // Déconnexion
  const handleLogout = () => {
    setUser(null)
    setLoginEmail('')
    setLoginPassword('')
    setLoginRole('')
  }

  // Envoi d'une note (enseignant seulement)
  const envoyerNote = async (e) => {
    e.preventDefault()
    try {
      await addDoc(collection(db, "compositions"), {
        eleve: nomEleve,
        matiere: matiere,
        note: Number(note),
        date: serverTimestamp()
      })
      setNomEleve('')
      setMatiere('')
      setNote('')
      alert('✅ Note envoyée avec succès !')
    } catch (err) {
      console.error("Erreur:", err)
      alert("Erreur lors de l'envoi")
    }
  }

  // Obtenir la classe CSS pour la note
  const getNoteClass = (note) => {
    if (note >= 16) return 'excellent'
    if (note >= 14) return 'good'
    if (note >= 10) return 'average'
    return 'poor'
  }

  // Calculer les statistiques (pour le directeur)
  const getStats = () => {
    if (notes.length === 0) return { total: 0, moyenne: 0, excellent: 0, enEchec: 0 }
    
    const total = notes.length
    const somme = notes.reduce((acc, note) => acc + note.note, 0)
    const moyenne = (somme / total).toFixed(2)
    const excellent = notes.filter(n => n.note >= 16).length
    const enEchec = notes.filter(n => n.note < 10).length

    return { total, moyenne, excellent, enEchec }
  }

  // ==================== PAGE DE LOGIN ====================
  if (!user) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <h1>🏫 Gamaliel Connect</h1>
            <p>Suivi scolaire en temps réel</p>
          </div>

          <div className="role-selection">
            <label>Je suis :</label>
            <div className="role-buttons">
              <button 
                className={`role-btn ${loginRole === 'enseignant' ? 'active' : ''}`}
                onClick={() => setLoginRole('enseignant')}
              >
                👨‍ Enseignant
              </button>
              <button 
                className={`role-btn ${loginRole === 'parent' ? 'active' : ''}`}
                onClick={() => setLoginRole('parent')}
              >
                👨‍‍👧 Parent
              </button>
              <button 
                className={`role-btn ${loginRole === 'directeur' ? 'active' : ''}`}
                onClick={() => setLoginRole('directeur')}
              >
                👔 Directeur
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label>Email</label>
              <input 
                type="email" 
                placeholder="votre@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Mot de passe</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary">
              Se connecter
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', color: '#999', fontSize: '0.9em' }}>
            <p>Démo : Utilisez n'importe quel email/mot de passe</p>
          </div>
        </div>
      </div>
    )
  }

  // ==================== APPLICATION PRINCIPALE ====================
  const stats = getStats()

  return (
    <div className="app-container">
      {/* Header */}
      <div className="app-header">
        <h1>🏫 Gamaliel Connect</h1>
        <div className="user-info">
          <span className="user-badge">
            {user.role === 'enseignant' && '👨‍🏫 Enseignant'}
            {user.role === 'parent' && '👨‍👩‍👧 Parent'}
            {user.role === 'directeur' && '👔 Directeur'}
          </span>
          <span>{user.name}</span>
          <button onClick={handleLogout} className="btn-logout">
            Déconnexion
          </button>
        </div>
      </div>

      {/* ESPACE ENSEIGNANT */}
      {user.role === 'enseignant' && (
        <div className="content-card">
          <h2>👨‍🏫 Espace Enseignant</h2>
          <form onSubmit={envoyerNote}>
            <div className="form-group">
              <label>Nom de l'élève</label>
              <input 
                type="text" 
                placeholder="Ex: MERVEILLE OULAI"
                value={nomEleve}
                onChange={(e) => setNomEleve(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Matière</label>
              <input 
                type="text" 
                placeholder="Ex: DICTEE"
                value={matiere}
                onChange={(e) => setMatiere(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Note / 20</label>
              <input 
                type="number" 
                min="0" 
                max="20"
                placeholder="15"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary">
              📤 Envoyer la composition
            </button>
          </form>
        </div>
      )}

      {/* ESPENSE DIRECTEUR */}
      {user.role === 'directeur' && (
        <div className="content-card">
          <h2>👔 Tableau de Bord - Direction</h2>
          
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{stats.total}</h3>
              <p>Total des notes</p>
            </div>
            <div className="stat-card">
              <h3>{stats.moyenne}</h3>
              <p>Moyenne générale</p>
            </div>
            <div className="stat-card">
              <h3>{stats.excellent}</h3>
              <p>Notes excellentes (≥16)</p>
            </div>
            <div className="stat-card">
              <h3>{stats.enEchec}</h3>
              <p>Notes en échec (&lt;10)</p>
            </div>
          </div>
        </div>
      )}

      {/* ESPACE PARENTS (visible par tous) */}
      <div className="content-card">
        <h2>📱 {user.role === 'parent' ? 'Vos Enfants' : 'Toutes les Notes'}</h2>
        
        {loading ? (
          <p style={{ textAlign: 'center', color: '#666' }}>Chargement...</p>
        ) : notes.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999', fontStyle: 'italic' }}>
            Aucune note pour le moment.
          </p>
        ) : (
          <div className="notes-list">
            {notes.map((item) => (
              <div key={item.id} className="note-item">
                <div className="note-header">
                  <span className="note-student">{item.eleve}</span>
                  <span className={`note-grade ${getNoteClass(item.note)}`}>
                    {item.note}/20
                  </span>
                </div>
                <div className="note-subject">📚 {item.matiere}</div>
                <div className="note-date">
                  🕐 {item.displayDate.toLocaleString('fr-FR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App