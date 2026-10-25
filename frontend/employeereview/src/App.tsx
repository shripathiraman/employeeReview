import { useState } from 'react'
import Navigation from './compontents/Navigation'
import ReviewDetail, { type Review } from './compontents/ReviewDetail'
import ReviewList from './compontents/ReviewList'
import SubmitReview from './compontents/SubmitReview'
import Employees from './compontents/Employees'
import './App.css'

function App() {
  const [activeMenu, setActiveMenu] = useState('Submit Review')
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)

  const handleMenuSelect = (menu: string) => {
    setActiveMenu(menu)
    setSelectedReview(null)
  }

  return (
    <div className="app-shell">
      <Navigation activeMenu={activeMenu} onMenuSelect={handleMenuSelect} />
      <main className="app-content">
        <header className="content-header">
          <p className="eyebrow">Performance Reviews</p>
          <h1>{activeMenu}</h1>
          <p className="page-description">
            Manage employee performance reviews from one place.
          </p>
        </header>
        {activeMenu === 'Submit Review' ? (
          <SubmitReview />
        ) : activeMenu === 'Reviews' ? (
          selectedReview ? <ReviewDetail review={selectedReview} onBack={() => setSelectedReview(null)} /> : <ReviewList onView={setSelectedReview} />
        ) : activeMenu === 'Employees' ? (
            <Employees />
        ) : (
          <section className="content-card" aria-labelledby="content-title">
            <h2 id="content-title">{activeMenu}</h2>
            <p>Select an option from the navigation menu to get started.</p>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
