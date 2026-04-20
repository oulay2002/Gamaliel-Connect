import { useState, useEffect } from 'react'
import { db } from './firebase'
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loginRole, setLoginRole] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [activeTab, setActiveTab] = useState('notes') // 'notes' | 'devoirs' | 'messages'
  
  // Données
  const [notes, setNotes] = useState([])
  const [devoirs, setDevoirs] = useState([])
  const [messages, setMessages] = useState([])
  const [enfants, setEnfants] = useState([])
  const [loading, setLoading] = useState(true)

  // Formulaires
  const [nomEleve, setNomEleve] = useState('')
  const [matiere, setMatiere] = useState('')
  const [note, setNote] = useState('')
  const [nouveauDevoir, setNouveauDevoir] = useState({ matiere: '', description: '', date: '' })
  const [nouveauMessage, setNouveauMessage] = useState({ destinataire: '', contenu: '' })

  // Écoute temps réel
  useEffect(() => {
    if (!user) return

    // Écouter les notes
    const qNotes = query(collection(db, "notes"), orderBy("date", "desc"))
    const unsubNotes = onSnapshot(qNotes, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        displayDate: doc.data().date?.toDate?.() || new Date()
      }))
      setNotes(data)
    })

    // Écouter les devoirs
    const qDevoirs = query(collection(db, "devoirs"), orderBy("dateEcheance", "asc"))
    const unsubDevoirs = onSnapshot(qDevoirs, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        displayDate: doc.data().dateEcheance?.toDate?.() || new Date()
      }))
      setDevoirs(data)
    })

    // Écouter les messages
    const qMessages = query(collection(db, "messages"), orderBy("date", "desc"))
    const unsubMessages = onSnapshot(qMessages, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        displayDate: doc.data().date?.toDate?.() || new Date()
      }))
      setMessages(data)
    })

    setLoading(false)

    return () => {
      unsubNotes()
      unsubDevoirs()
      unsubMessages()
    }
  }, [user])

  // Connexion
  const handleLogin = (e) => {
    e.preventDefault()
    if (loginRole && loginEmail && loginPassword) {
      setUser({
        email: loginEmail,
        role: loginRole,
        name: loginEmail.split('@')[0],
        enfants: loginRole === 'parent' ? ['MERVEILLE OULAI'] : [] // Simulation
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
    setActiveTab('notes')
  }

  // Envoyer une note
  const envoyerNote = async (e) => {
    e.preventDefault()
    try {
      await addDoc(collection(db, "notes"), {
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

  // Ajouter un devoir
  const ajouterDevoir = async (e) => {
    e.preventDefault()
    try {
      await addDoc(collection(db, "devoirs"), {
        matiere: nouveauDevoir.matiere,
        description: nouveauDevoir.description,
        dateEcheance: new Date(nouveauDevoir.date),
        date: serverTimestamp()
      })
      setNouveauDevoir({ matiere: '', description: '', date: '' })
      alert('✅ Devoir ajouté avec succès !')
    } catch (err) {
      console.error("Erreur:", err)
      alert("Erreur lors de l'ajout")
    }
  }

  // Envoyer un message
  const envoyerMessage = async (e) => {
    e.preventDefault()
    try {
      await addDoc(collection(db, "messages"), {
        expediteur: user.email,
        destinataire: nouveauMessage.destinataire,
        contenu: nouveauMessage.contenu,
        date: serverTimestamp(),
        lu: false
      })
      setNouveauMessage({ destinataire: '', contenu: '' })
      alert('✅ Message envoyé !')
    } catch (err) {
      console.error("Erreur:", err)
      alert("Erreur lors de l'envoi")
    }
  }

  // Obtenir la classe de note
  const getNoteClass = (note) => {
    if (note >= 16) return 'excellent'
    if (note >= 14) return 'good'
    if (note >= 10) return 'average'
    return 'poor'
  }

  // Stats
  const getStats = () => {
    if (notes.length === 0) return { total: 0, moyenne: 0, excellent: 0, enEchec: 0 }
    const total = notes.length
    const somme = notes.reduce((acc, n) => acc + n.note, 0)
    const moyenne = (somme / total).toFixed(2)
    const excellent = notes.filter(n => n.note >= 16).length
    const enEchec = notes.filter(n => n.note < 10).length
    return { total, moyenne, excellent, enEchec }
  }

  // ==================== LOGIN ====================
  if (!user) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <h1>🏫 Gamaliel Connect</h1>
            <p>Connexion à votre espace</p>
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
                👨‍👧 Parent
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

          <div style={{ marginTop: '20px', textAlign: 'center', color: '#95a5a6', fontSize: '13px' }}>
            <p>Démo : Utilisez n'importe quel email/mot de passe</p>
          </div>
        </div>
      </div>
    )
  }

  const stats = getStats()

  // ==================== APPLICATION ====================
  return (
    <div className="app-container">
      {/* Header */}
      <div className="app-header">
        <h1>🏫 Gamaliel Connect</h1>
        <div className="user-info">
          <span className="user-badge">
            {user.role === 'enseignant' && '👨‍🏫 Enseignant'}
            {user.role === 'parent' && '👨‍👧 Parent'}
            {user.role === 'directeur' && '👔 Directeur'}
          </span>
          <span>{user.name}</span>
          <button onClick={handleLogout} className="btn-logout">
            Déconnexion
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="nav-tabs">
        <button 
          className={`nav-tab ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          📊 Notes & Évaluations
        </button>
        <button 
          className={`nav-tab ${activeTab === 'devoirs' ? 'active' : ''}`}
          onClick={() => setActiveTab('devoirs')}
        >
          📚 Cahier de Textes
        </button>
        <button 
          className={`nav-tab ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          ✉️ Carnet de Liaison
        </button>
      </div>

      {/* Content */}
      <div className="content">
        {/* ==================== ONGLET NOTES ==================== */}
        {activeTab === 'notes' && (
          <>
            {user.role === 'directeur' && (
              <>
                <h2 className="section-title">Tableau de Bord</h2>
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
                    <p>Notes ≥ 16</p>
                  </div>
                  <div className="stat-card">
                    <h3>{stats.enEchec}</h3>
                    <p>Notes &lt; 10</p>
                  </div>
                </div>
              </>
            )}

            {user.role === 'enseignant' && (
              <>
                <h2 className="section-title">Saisir une Note</h2>
                <div className="card">
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
                        placeholder="Ex: Mathématiques"
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
                        step="0.5"
                        placeholder="15"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        required
                      />
                    </div>

                    <button type="submit" className="btn-primary">
                      Enregistrer la note
                    </button>
                  </form>
                </div>
              </>
            )}

            <h2 className="section-title">
              {user.role === 'parent' ? 'Notes de vos enfants' : 'Toutes les notes'}
            </h2>
            
            {loading ? (
              <p style={{ textAlign: 'center', color: '#7f8c8d' }}>Chargement...</p>
            ) : notes.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: '#95a5a6' }}>
                Aucune note pour le moment
              </div>
            ) : (
              notes.map((item) => (
                <div key={item.id} className="note-card">
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
              ))
            )}
          </>
        )}

        {/* ==================== ONGLET DEVOIRS ==================== */}
        {activeTab === 'devoirs' && (
          <>
            {user.role === 'enseignant' && (
              <>
                <h2 className="section-title">Ajouter un Devoir</h2>
                <div className="card">
                  <form onSubmit={ajouterDevoir}>
                    <div className="form-group">
                      <label>Matière</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Français"
                        value={nouveauDevoir.matiere}
                        onChange={(e) => setNouveauDevoir({...nouveauDevoir, matiere: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Description du devoir</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Lire le chapitre 5, exercices 1 à 10"
                        value={nouveauDevoir.description}
                        onChange={(e) => setNouveauDevoir({...nouveauDevoir, description: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Date de rendu</label>
                      <input 
                        type="date"
                        value={nouveauDevoir.date}
                        onChange={(e) => setNouveauDevoir({...nouveauDevoir, date: e.target.value})}
                        required
                      />
                    </div>

                    <button type="submit" className="btn-primary">
                      Ajouter le devoir
                    </button>
                  </form>
                </div>
              </>
            )}

            <h2 className="section-title">Devoirs à faire</h2>
            
            {loading ? (
              <p style={{ textAlign: 'center', color: '#7f8c8d' }}>Chargement...</p>
            ) : devoirs.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: '#95a5a6' }}>
                Aucun devoir pour le moment
              </div>
            ) : (
              devoirs.map((devoir) => (
                <div key={devoir.id} className="note-card">
                  <div className="note-header">
                    <span className="note-student">📚 {devoir.matiere}</span>
                    <span className="note-grade" style={{ background: '#3498db' }}>
                      Pour le {new Date(devoir.dateEcheance).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="note-subject">{devoir.description}</div>
                </div>
              ))
            )}
          </>
        )}

        {/* ==================== ONGLET MESSAGES ==================== */}
        {activeTab === 'messages' && (
          <>
            <h2 className="section-title">Nouveau Message</h2>
            <div className="card">
              <form onSubmit={envoyerMessage}>
                <div className="form-group">
                  <label>Destinataire</label>
                  <select 
                    value={nouveauMessage.destinataire}
                    onChange={(e) => setNouveauMessage({...nouveauMessage, destinataire: e.target.value})}
                    required
                    style={{ width: '100%', padding: '11px 14px', border: '2px solid #e0e6ed', borderRadius: '8px' }}
                  >
                    <option value="">Sélectionner...</option>
                    {user.role === 'parent' && <option value="enseignant">Enseignant</option>}
                    {user.role === 'enseignant' && (
                      <>
                        <option value="parent">Parents d'élèves</option>
                        <option value="direction">Direction</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>Message</label>
                  <textarea 
                    placeholder="Votre message..."
                    value={nouveauMessage.contenu}
                    onChange={(e) => setNouveauMessage({...nouveauMessage, contenu: e.target.value})}
                    required
                    rows="5"
                    style={{ width: '100%', padding: '11px 14px', border: '2px solid #e0e6ed', borderRadius: '8px', resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>

                <button type="submit" className="btn-primary">
                  Envoyer le message
                </button>
              </form>
            </div>

            <h2 className="section-title">Messages reçus</h2>
            
            {loading ? (
              <p style={{ textAlign: 'center', color: '#7f8c8d' }}>Chargement...</p>
            ) : messages.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: '#95a5a6' }}>
                Aucun message
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="note-card">
                  <div className="note-header">
                    <span className="note-student">De: {msg.expediteur}</span>
                    <span style={{ fontSize: '13px', color: msg.lu ? '#95a5a6' : '#667eea', fontWeight: '600' }}>
                      {msg.lu ? '✓ Lu' : '🔴 Nouveau'}
                    </span>
                  </div>
                  <div className="note-subject" style={{ marginTop: '10px' }}>{msg.contenu}</div>
                  <div className="note-date">
                    🕐 {msg.displayDate.toLocaleString('fr-FR')}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default App