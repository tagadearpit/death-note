import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './BookSection2.css'

gsap.registerPlugin(ScrollTrigger)

const RULES = [
  {
    number: 'VI',
    title: 'The Lifespan',
    rule: 'The human who touches the Death Note can recognize the life span of others by looking at their face.',
    note: "Some gifts cannot be refused. Once you have seen the number above a man's head, you cannot unsee it.",
  },
  {
    number: 'VII',
    title: 'The Exchange',
    rule: 'The owner of the Death Note can trade half of their remaining life to gain Shinigami Eyes.',
    note: 'Half a life for absolute sight. Every trade made in the dark sounds reasonable until the light comes on.',
  },
  {
    number: 'VIII',
    title: 'The Shinigami',
    rule: 'A Shinigami will appear to the owner of the Death Note. This Shinigami can communicate only with the owner.',
    note: 'You are never truly alone once the notebook is yours. Whether that is comfort or curse is yours to decide.',
  },
  {
    number: 'IX',
    title: 'The Release',
    rule: 'If the owner of the Death Note fails to use it within 13 days, they will die.',
    note: 'Possession is not a choice you can unmake. The notebook chooses its owners as much as they choose it.',
  },
  {
    number: 'X',
    title: 'The End',
    rule: 'The Death Note will not affect those less than 780 days old, nor will it kill gods of death.',
    note: 'Even the absolute has its edges. But you are neither an infant nor a god. You have no such protection.',
  },
]

const BookSection2 = () => {
  const sectionRef = useRef(null)
  const rulesRef = useRef([])
  const headingRef = useRef(null)
  const closingRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const triggers = []

    triggers.push(
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: headingRef.current, start: 'top 80%' },
        }
      ).scrollTrigger
    )

    rulesRef.current.forEach((el, i) => {
      if (!el) return
      triggers.push(
        gsap.fromTo(
          el,
          { opacity: 0, y: 50, x: i % 2 === 0 ? 20 : -20 },
          {
            opacity: 1, y: 0, x: 0, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 82%' },
          }
        ).scrollTrigger
      )
    })

    triggers.push(
      gsap.fromTo(
        closingRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 1.4, ease: 'power3.out',
          scrollTrigger: { trigger: closingRef.current, start: 'top 85%' },
        }
      ).scrollTrigger
    )

    // Only kill THIS section's triggers on unmount
    return () => triggers.forEach((t) => t?.kill())
  }, [])

  return (
    <section ref={sectionRef} className="bs2-section">
      <div className="bs2-top-fade" />
      <div className="bs2-inner">
        <header className="bs2-header" ref={headingRef}>
          <span className="bs2-eyebrow">Continued</span>
          <h2 className="bs2-heading">Rules of<br />Consequence</h2>
          <p className="bs2-subheading">
            The notebook does not end at ten rules.<br />
            But these are the ones that matter most to the living.
          </p>
        </header>

        <div className="bs2-rules">
          {RULES.map((item, i) => (
            <div
              key={i}
              className="bs2-rule"
              ref={(el) => (rulesRef.current[i] = el)}
            >
              <div className="bs2-rule-number">{item.number}</div>
              <div className="bs2-rule-body">
                <span className="bs2-rule-title">{item.title}</span>
                <p className="bs2-rule-text">{item.rule}</p>
                <p className="bs2-rule-note">{item.note}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bs2-closing" ref={closingRef}>
          <div className="bs2-closing-line" />
          <p className="bs2-closing-quote">
            "This world is rotten, and those who are making it rot deserve to die."
          </p>
          <span className="bs2-closing-attr">— Light Yagami</span>
          <div className="bs2-closing-line" />
        </div>
      </div>

      <svg className="bs2-bg-sigil" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="200" r="195" stroke="#8b0000" strokeWidth="0.5" />
        <circle cx="200" cy="200" r="140" stroke="#8b0000" strokeWidth="0.3" />
        <path d="M200 5 L200 395 M5 200 L395 200" stroke="#8b0000" strokeWidth="0.3" />
        <path d="M200 5 L395 200 L200 395 L5 200 Z" stroke="#8b0000" strokeWidth="0.3" />
        <path d="M60 60 L340 340 M340 60 L60 340" stroke="#8b0000" strokeWidth="0.2" />
        <ellipse cx="200" cy="200" rx="40" ry="60" stroke="#8b0000" strokeWidth="0.5" />
        <circle cx="200" cy="200" r="16" fill="#8b0000" opacity="0.3" />
      </svg>
    </section>
  )
}

export default BookSection2