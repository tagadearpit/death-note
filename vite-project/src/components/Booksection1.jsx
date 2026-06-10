import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './BookSection1.css'

gsap.registerPlugin(ScrollTrigger)

const RULES = [
  {
    number: 'I',
    title: 'The First Rule',
    rule: 'The human whose name is written in this note shall die.',
    note: 'This is not a metaphor. This is not a warning. This is a law older than memory.',
  },
  {
    number: 'II',
    title: 'The Condition',
    rule: "This note will not take effect unless the writer has the person's face in their mind when writing their name.",
    note: 'To know a face is to hold power over it. Look carefully at who you remember.',
  },
  {
    number: 'III',
    title: 'The Default',
    rule: 'If the cause of death is written within 40 seconds of writing the person\'s name, it will happen.',
    note: 'Forty seconds. The span of a held breath. The length of a last heartbeat.',
  },
  {
    number: 'IV',
    title: 'The Body',
    rule: 'If the cause of death is not specified, the person will simply die of a heart attack.',
    note: 'Even mercy has a mechanism. The notebook is thorough in its indifference.',
  },
  {
    number: 'V',
    title: 'The Details',
    rule: 'After writing the cause of death, details of the death should be written in the next 6 minutes and 40 seconds.',
    note: 'Precision is the language of inevitability. Vagueness changes nothing — it only removes your control.',
  },
]

const BookSection1 = () => {
  const sectionRef = useRef(null)
  const rulesRef = useRef([])
  const headingRef = useRef(null)
  const dividerRef = useRef(null)

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

    triggers.push(
      gsap.fromTo(
        dividerRef.current,
        { scaleX: 0 },
        {
          scaleX: 1, duration: 1.4, ease: 'power3.out',
          scrollTrigger: { trigger: dividerRef.current, start: 'top 85%' },
        }
      ).scrollTrigger
    )

    rulesRef.current.forEach((el, i) => {
      if (!el) return
      triggers.push(
        gsap.fromTo(
          el,
          { opacity: 0, y: 50, x: i % 2 === 0 ? -20 : 20 },
          {
            opacity: 1, y: 0, x: 0, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 82%' },
          }
        ).scrollTrigger
      )
    })

    // Only kill THIS section's triggers on unmount
    return () => triggers.forEach((t) => t?.kill())
  }, [])

  return (
    <section ref={sectionRef} className="bs1-section">
      <div className="bs1-top-fade" />
      <div className="bs1-inner">
        <header className="bs1-header" ref={headingRef}>
          <span className="bs1-eyebrow">The Death Note</span>
          <h2 className="bs1-heading">Rules of<br />Possession</h2>
          <p className="bs1-subheading">
            Written into every notebook that falls from the Shinigami realm.<br />
            Read them. Understand them. You cannot claim ignorance now.
          </p>
        </header>

        <div className="bs1-divider" ref={dividerRef} />

        <div className="bs1-rules">
          {RULES.map((item, i) => (
            <div
              key={i}
              className="bs1-rule"
              ref={(el) => (rulesRef.current[i] = el)}
            >
              <div className="bs1-rule-number">{item.number}</div>
              <div className="bs1-rule-body">
                <span className="bs1-rule-title">{item.title}</span>
                <p className="bs1-rule-text">{item.rule}</p>
                <p className="bs1-rule-note">{item.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bs1-bottom-fade" />
    </section>
  )
}

export default BookSection1