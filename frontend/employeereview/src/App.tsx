import { useState } from 'react'
import Navigation from './compontents/Navigation'
import './App.css'

function App() {
  const [activeMenu, setActiveMenu] = useState('Submit Review')

  return (
    <div className="app-shell">
      <Navigation activeMenu={activeMenu} onMenuSelect={setActiveMenu} />
      <main className="app-content">
        <header className="content-header">
          <p className="eyebrow">Performance Reviews</p>
          <h1>{activeMenu}</h1>
          <p className="page-description">
            Manage employee performance reviews from one place.
          </p>
        </header>
        <section className="content-card" aria-labelledby="content-title">
          <h2 id="content-title">{activeMenu}</h2>
          <p>Select an option from the navigation menu to get started.</p>
        </section>
      </main>
    </div>
  )
}

export default App
