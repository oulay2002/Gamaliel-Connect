// src/App.jsx — TEST ULTRA-MINIMAL (aucun import externe)
function App() {
  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif', 
      textAlign: 'center',
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#22c55e', fontSize: '2em' }}>✅ TEST RÉUSSI !</h1>
      <p style={{ fontSize: '1.1em' }}>Vite + React fonctionnent parfaitement.</p>
      <p style={{ color: '#666', marginTop: '20px' }}>
        Si vous voyez ce message, le problème vient du code Firebase.<br/>
        On va le corriger ensemble ! 💪
      </p>
    </div>
  )
}
export default App