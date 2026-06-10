import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './Hero.css'

gsap.registerPlugin(ScrollTrigger)

const NARRATIVE_BEATS = [
  {
    start: 0.0,
    end: 0.12,
    eyebrow: 'In the beginning',
    headline: 'There was only\ndarkness.',
    sub: 'And within that darkness, something waited.',
  },
  {
    start: 0.12,
    end: 0.26,
    eyebrow: 'Then',
    headline: 'A notebook\nfell from the sky.',
    sub: 'Unremarkable. Ordinary. Inevitable.',
  },
  {
    start: 0.26,
    end: 0.40,
    eyebrow: 'It carried a name',
    headline: 'Death\nNote.',
    sub: 'The human whose name is written in this note shall die.',
  },
  {
    start: 0.40,
    end: 0.55,
    eyebrow: 'You are not alone',
    headline: 'Something\nwatches.',
    sub: 'Between worlds, between heartbeats — eyes that never close.',
  },
  {
    start: 0.55,
    end: 0.68,
    eyebrow: 'The presence withdraws',
    headline: 'But its offer\nremains.',
    sub: 'Power is not given. It is accepted.',
  },
  {
    start: 0.68,
    end: 0.80,
    eyebrow: 'The notebook opens',
    headline: 'Every name\na verdict.',
    sub: 'Justice. Judgment. Or something far more dangerous.',
  },
  {
    start: 0.80,
    end: 0.92,
    eyebrow: 'The first rule',
    headline: 'The human whose name\nis written in this note shall die.',
    sub: 'You have forty seconds to decide what you are.',
  },
  {
    start: 0.92,
    end: 1.0,
    eyebrow: null,
    headline: 'Are you\nready?',
    sub: null,
  },
]

const Hero = () => {
  const sectionRef = useRef(null)
  const videoRef = useRef(null)
  const beatsRef = useRef([])
  const progressBarRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    const section = sectionRef.current
    if (!video || !section) return

    const initScrub = () => {
      const duration = video.duration
      if (!duration || isNaN(duration)) return

      const scrubTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: `+=${window.innerHeight * 8}`,
          pin: true,
          scrub: 0.5,
          onUpdate: (self) => {
            video.currentTime = self.progress * duration

            if (progressBarRef.current) {
              progressBarRef.current.style.transform = `scaleX(${self.progress})`
            }

            beatsRef.current.forEach((el, i) => {
              if (!el) return
              const beat = NARRATIVE_BEATS[i]
              const p = self.progress
              const fadeWidth = 0.04

              let opacity = 0
              let y = 20

              if (p >= beat.start && p <= beat.end) {
                const local = (p - beat.start) / (beat.end - beat.start)
                if (local < fadeWidth) {
                  opacity = local / fadeWidth
                  y = 20 * (1 - local / fadeWidth)
                } else if (local > 1 - fadeWidth) {
                  opacity = (1 - local) / fadeWidth
                  y = 0
                } else {
                  opacity = 1
                  y = 0
                }
              }

              el.style.opacity = opacity
              el.style.transform = `translateY(${y}px)`
            })
          },
        },
      })

      scrubTl.to({}, { duration: 1 })
    }

    video.addEventListener('loadedmetadata', initScrub)
    if (video.readyState >= 1) initScrub()

    return () => {
      video.removeEventListener('loadedmetadata', initScrub)
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return (
    <section ref={sectionRef} className="dn-hero">

      <video
        ref={videoRef}
        className="dn-video"
        src="/video/one.mp4"
        muted
        playsInline
        preload="auto"
      />

      <div className="dn-vignette" />
      <div className="dn-grain" />
      <div className="dn-top-fade" />
      <div className="dn-bottom-fade" />

      <svg className="dn-sigil" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="95" stroke="#8b0000" strokeWidth="0.5" />
        <circle cx="100" cy="100" r="70" stroke="#8b0000" strokeWidth="0.3" />
        <path d="M100 5 L100 195 M5 100 L195 100" stroke="#8b0000" strokeWidth="0.3" />
        <path d="M100 5 L195 100 L100 195 L5 100 Z" stroke="#8b0000" strokeWidth="0.3" />
        <path d="M30 30 L170 170 M170 30 L30 170" stroke="#8b0000" strokeWidth="0.2" />
        <ellipse cx="100" cy="100" rx="20" ry="30" stroke="#8b0000" strokeWidth="0.5" />
        <circle cx="100" cy="100" r="8" fill="#8b0000" opacity="0.4" />
      </svg>

      <nav className="dn-nav">
        <div className="dn-logo">
          Death<span>Note</span>
        </div>
        <ul className="dn-nav-links">
          <li><a href="#">The Rules</a></li>
          <li><a href="#">Characters</a></li>
          <li><a href="#">The World</a></li>
          <li><a href="#">Episodes</a></li>
        </ul>
      </nav>

      <svg className="dn-corner dn-corner--tl" width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M0 48 L0 0 L48 0" stroke="#8b0000" strokeWidth="0.8" opacity="0.4" />
        <path d="M0 24 L24 0" stroke="#8b0000" strokeWidth="0.4" opacity="0.25" />
      </svg>
      <svg className="dn-corner dn-corner--tr" width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M0 48 L0 0 L48 0" stroke="#8b0000" strokeWidth="0.8" opacity="0.4" />
        <path d="M0 24 L24 0" stroke="#8b0000" strokeWidth="0.4" opacity="0.25" />
      </svg>

      <div className="dn-beats">
        {NARRATIVE_BEATS.map((beat, i) => (
          <div
            key={i}
            className="dn-beat"
            ref={(el) => (beatsRef.current[i] = el)}
          >
            {beat.eyebrow && (
              <span className="dn-beat-eyebrow">{beat.eyebrow}</span>
            )}
            <h1 className="dn-beat-headline">{beat.headline}</h1>
            {beat.sub && (
              <p className="dn-beat-sub">{beat.sub}</p>
            )}
          </div>
        ))}
      </div>

      <div className="dn-scroll-cue">
        <span>Scroll</span>
        <div className="dn-scroll-line" />
      </div>

      <div className="dn-progress">
        <div className="dn-progress-fill" ref={progressBarRef} />
      </div>

    </section>
  )
}

export default Hero