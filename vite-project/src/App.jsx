import React from 'react'
import Hero from './components/Hero'
import BookScene from './components/BookScene'

// #book-scroll-root is purely a scroll-height driver.
// BookScene renders a position:sticky canvas inside it that pins
// for the full 300vh — the 3D book animates throughout.
// BookSection1 and BookSection2 are overlays inside that sticky canvas,
// NOT separate scroll children.

export default function App() {
  return (
    <div style={{ background: '#0a0a0a' }}>
      <Hero />
      <div
        id="book-scroll-root"
        style={{
          position: 'relative',
          height: '300vh',   // ← total scroll budget for the book sequence
        }}
      >
        <BookScene />
      </div>
    </div>
  )
}