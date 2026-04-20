import { useState, useEffect } from 'react'
import { db } from './firebase'
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore'

function App() {
  const [notes, setNotes] = useState([])
  const [nomEleve, setNomEleve] = useState('')
  const [matiere, setMatiere] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)

  // 📡 Écoute en temps réel
  useEffect(() => {
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
  }, [])

  // 📤 Envoi d'une note
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
    } catch (err) {
      console.error("Erreur:", err)
      alert("Erreur lors de l'envoi")
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1>🏫 Gamaliel Connect</h1>
      <p style={{ color: '#666' }}>Suivi scolaire en temps réel</p>

      {/* 👨‍ FORMULAIRE ENSEIGNANT */}
      <div style={{ background: '#f0f9ff', padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
        <h2>👨‍ Espace Enseignant</h2>
        <form onSubmit={envoyerNote} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input 
            placeholder="Nom de l'élève" 
            value={nomEleve} 
            onChange={e => setNomEleve(e.target.value)} 
            required 
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} 
          />
          <input 
            placeholder="Matière" 
            value={matiere} 
            onChange={e => setMatiere(e.target.value)} 
            required 
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} 
          />
          <input 
            type="number" 
            placeholder="Note / 20" 
            value={note} 
            onChange={e => setNote(e.target.value)} 
            required 
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} 
          />
          <button 
            type="submit" 
            style={{ padding: '12px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            📤 Envoyer la composition
          </button>
        </form>
      </div>

      {/* 📱 LISTE PARENTS */}
      <div>
        <h2>📱 Espace Parents</h2>
        {loading ? (
          <p>Chargement...</p>
        ) : notes.length === 0 ? (
          <p style={{ color: '#888', fontStyle: 'italic' }}>Aucune note pour le moment.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notes.map((item) => (
              <div key={item.id} style={{ border: '1px solid #e5e7eb', padding: '12px', borderRadius: '8px', background: '#fff' }}>
                <strong style={{ fontSize: '1.1em' }}>{item.eleve}</strong>
                <span> a obtenu </span>
                <strong style={{ 
                  color: item.note >= 10 ? '#16a34a' : '#dc2626', 
                  fontSize: '1.2em' 
                }}>
                  {item.note}/20
                </strong>
                <span> en {item.matiere}</span>
                <div style={{ fontSize: '0.8em', color: '#9ca3af', marginTop: '4px' }}>
                  {item.displayDate.toLocaleString('fr-FR')}
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