import React, { useRef, useEffect, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment } from '@react-three/drei'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'
import BookSection1 from './Booksection1'
import BookSection2 from './Booksection2'

gsap.registerPlugin(ScrollTrigger)

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  wrapper: {
    position: 'sticky',
    top: 0,
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
  },
  canvas: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%',
    height: '100%',
  },
  overlays: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    pointerEvents: 'none',
    zIndex: 10,
  },
  sec1: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 'clamp(2rem, 6vw, 8rem)',
    opacity: 0,
    pointerEvents: 'none',
    willChange: 'opacity',
  },
  sec2: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 'clamp(2rem, 6vw, 8rem)',
    opacity: 0,
    pointerEvents: 'none',
    willChange: 'opacity',
  },
  vignette: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)',
    pointerEvents: 'none',
    zIndex: 4,
  },
  fadeBottom: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: '30vh',
    background: 'linear-gradient(to bottom, transparent, #0a0a0a)',
    pointerEvents: 'none',
    zIndex: 5,
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function lerp(a, b, t) { return a + (b - a) * t }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }
function norm(p, lo, hi) { return clamp((p - lo) / (hi - lo), 0, 1) }
function ease(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t }

// ─── Animation story ──────────────────────────────────────────────────────────
//
//  ACT 1  p 0.00 → 0.20   DROP IN
//         Book falls from y=+4 down to y=0.
//         Settles centre-right (x=0.6), slight entry tilt clears on landing.
//
//  ACT 2  p 0.20 → 0.55   FULL FLIP — Section 1
//         Book stays centre-right, does ONE complete Y rotation (0 → 2π).
//         Front cover → spine → back cover → spine → front cover.
//
//  ACT 3  p 0.55 → 0.70   SLIDE LEFT
//         Translates x: 0.6 → -1.4 while rotation continues.
//         Section 1 fades out, Section 2 fades in.
//
//  ACT 4  p 0.70 → 1.00   Section 2
//         Book stays left, completes another half-turn (2π → 3π).

function getTargets(p) {

  // ── X position ──
  let x
  if (p < 0.55) {
    x = 0.6
  } else if (p <= 0.70) {
    x = lerp(0.6, -1.4, ease(norm(p, 0.55, 0.70)))
  } else {
    x = -1.4
  }

  // ── Y position ──
  // Drop in from above during ACT 1, then a very subtle bob
  let y
  if (p < 0.20) {
    // Start at 4 (not 5) — matches the group's initial JSX position
    y = lerp(4.0, 0.0, ease(norm(p, 0.00, 0.20)))
  } else {
    y = Math.sin(p * Math.PI * 3) * 0.07
  }

  // ── Rotation Y — continuous scroll-driven flip ──
  // ACT 1 : entry angle 0.4 → 0   (settles face-on as it lands)
  // ACT 2 : 0 → 2π                (full flip during Section 1)
  // ACT 3+4: 2π → 3π              (keeps turning through transition + Section 2)
  let rotY
  if (p < 0.20) {
    rotY = lerp(0.4, 0.0, ease(norm(p, 0.00, 0.20)))
  } else if (p <= 0.55) {
    rotY = lerp(0.0, Math.PI * 2, norm(p, 0.20, 0.55))
  } else {
    rotY = Math.PI * 2 + lerp(0.0, Math.PI, norm(p, 0.55, 1.00))
  }

  // ── Rotation X / Z — entry tilts that clear on landing ──
  const rotX = p < 0.20
    ? lerp(0.15, 0.04, ease(norm(p, 0.00, 0.20)))
    : 0.04

  const rotZ = p < 0.20
    ? lerp(0.12, 0.01, ease(norm(p, 0.00, 0.20)))
    : 0.01

  return { x, y, rotX, rotY, rotZ }
}

// ─── 3D model setup ───────────────────────────────────────────────────────────

function setupInner(node, scene) {
  if (!node || !scene) return

  let meshCount = 0
  scene.traverse((c) => { if (c.isMesh) meshCount++ })
  if (!meshCount) { console.error('[Book] no meshes'); return }

  // Reset before measuring
  node.scale.set(1, 1, 1)
  node.position.set(0, 0, 0)
  node.rotation.set(0, 0, 0)

  // Measure natural bounding box
  const box = new THREE.Box3().setFromObject(node)
  const size = new THREE.Vector3()
  box.getSize(size)
  if (!size.x && !size.y && !size.z) { console.error('[Book] zero bbox'); return }

  // Scale to a consistent display size
  node.scale.setScalar(1.5 / Math.max(size.x, size.y, size.z))

  // Re-measure after scaling and re-centre
  const box2 = new THREE.Box3().setFromObject(node)
  const center = new THREE.Vector3()
  box2.getCenter(center)
  node.position.set(-center.x, -center.y, -center.z)

  // ── Orientation fix ──
  // Most book models exported from Blender/3ds Max are lying flat (Y-up → Z-up
  // mismatch) or standing on their spine. We correct for the two most common
  // cases here. If your model still looks wrong, toggle the commented lines.

  // Case A: model is lying flat, cover facing UP → rotate so cover faces the camera (+Z)
  node.rotation.x = Math.PI / 2   // ← was -Math.PI/2 which flipped it upside-down

  // Case B: model is already upright but upside-down → uncomment the line below instead:
  // node.rotation.z = Math.PI

  scene.traverse((c) => {
    if (c.isMesh) { c.castShadow = true; c.receiveShadow = true }
  })
  console.log('%c[Book] setup done', 'color:lime')
}

// ─── Book model ───────────────────────────────────────────────────────────────

function BookModel({ progressRef }) {
  const groupRef   = useRef()
  const innerRef   = useRef()
  const setupDone  = useRef(false)
  // Track the *last* progress so we can detect real movement
  const lastP      = useRef(0)

  let gltfResult
  try { gltfResult = useGLTF('/models/deathnote.glb') }
  catch (e) { console.error('[Book] load failed:', e) }

  const { scene } = gltfResult || {}

  const innerCb = useCallback((node) => {
    innerRef.current = node
    if (node && scene && !setupDone.current) {
      setupDone.current = true
      setupInner(node, scene)
    }
  }, [scene])

  useEffect(() => {
    if (innerRef.current && scene && !setupDone.current) {
      setupDone.current = true
      setupInner(innerRef.current, scene)
    }
  }, [scene])

  useFrame(() => {
    if (!groupRef.current) return

    const p = progressRef.current
    const t = getTargets(p)
    const g = groupRef.current

    // Use a tighter lerp factor so the book tracks the scroll closely
    // but still feels physically weighted.
    const lf = 0.12

    g.position.x = THREE.MathUtils.lerp(g.position.x, t.x,    lf)
    g.position.y = THREE.MathUtils.lerp(g.position.y, t.y,    lf)
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, t.rotX, lf)
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, t.rotY, lf)
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, t.rotZ, lf)

    lastP.current = p
  })

  if (!scene) return null

  // ── IMPORTANT: initial group position must match the START of getTargets ──
  // getTargets(0) returns y = lerp(4.0, 0.0, ease(0)) = 4.0
  // So we initialise the group at y=4 to prevent a lerp "snap" on first frame.
  return (
    <group ref={groupRef} position={[0.6, 4, 0]}>
      <group ref={innerCb}><primitive object={scene} /></group>
    </group>
  )
}

// ─── Lights ───────────────────────────────────────────────────────────────────

function Lights() {
  return (
    <>
      <ambientLight intensity={0.45} color="#c8b89a" />
      {/* Front-face key light */}
      <directionalLight position={[0, 6, 5]}   intensity={2.2} color="#e8d8b8" castShadow />
      {/* Back-face fill — same intensity so back cover reads clearly */}
      <directionalLight position={[0, 6, -5]}  intensity={1.8} color="#d8cdb0" />
      {/* Dramatic red rim from the left */}
      <directionalLight position={[-4, 3, -1]} intensity={0.5} color="#8b0000" />
      {/* Warm point — front side */}
      <pointLight position={[2, 3,  4]} intensity={0.9} color="#c8a060" distance={14} />
      {/* Cool point — back side */}
      <pointLight position={[2, 3, -4]} intensity={0.6} color="#a0b8d8" distance={12} />
    </>
  )
}

// ─── Section overlays ─────────────────────────────────────────────────────────
//
//  Section 1   fade in   p 0.15 → 0.25
//              hold      p 0.25 → 0.50
//              fade out  p 0.50 → 0.62
//
//  Section 2   fade in   p 0.62 → 0.74
//              hold      p 0.74 → 1.00  (stays visible — never fades)

function SectionOverlays({ progressRef, sec1Ref, sec2Ref }) {
  useEffect(() => {
    let rafId

    const tick = () => {
      const p = progressRef.current

      if (sec1Ref.current) {
        let o = p < 0.15  ? 0
              : p <= 0.25 ? norm(p, 0.15, 0.25)
              : p <= 0.50 ? 1
              : p <= 0.62 ? 1 - norm(p, 0.50, 0.62)
              : 0
        o = clamp(o, 0, 1)
        sec1Ref.current.style.opacity       = o
        sec1Ref.current.style.pointerEvents = o > 0.05 ? 'auto' : 'none'
      }

      if (sec2Ref.current) {
        let o = p < 0.62  ? 0
              : p <= 0.74 ? norm(p, 0.62, 0.74)
              : 1
        o = clamp(o, 0, 1)
        sec2Ref.current.style.opacity       = o
        sec2Ref.current.style.pointerEvents = o > 0.05 ? 'auto' : 'none'
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [progressRef, sec1Ref, sec2Ref])

  return null
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function BookScene() {
  const progressRef = useRef(0)
  const sec1Ref     = useRef()
  const sec2Ref     = useRef()

  useEffect(() => {
    const root = document.getElementById('book-scroll-root')
    if (!root) { console.error('[BookScene] #book-scroll-root not found'); return }

    const st = ScrollTrigger.create({
      trigger: '#book-scroll-root',
      start:   'top top',
      end:     'bottom bottom',
      scrub:   true,
      onUpdate: (self) => { progressRef.current = self.progress },
    })

    // Native fallback for zero-lag progress reads
    const onScroll = () => {
      const scrolled = window.scrollY - root.offsetTop
      const total    = root.offsetHeight - window.innerHeight
      if (total > 0) progressRef.current = clamp(scrolled / total, 0, 1)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      st.kill()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <div style={styles.wrapper}>

      <Canvas
        style={styles.canvas}
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        shadows
        onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
      >
        <Lights />
        <BookModel progressRef={progressRef} />
        <Environment preset="night" />
      </Canvas>

      <div style={styles.vignette} />
      <div style={styles.fadeBottom} />

      <div style={styles.overlays}>
        <div ref={sec1Ref} style={styles.sec1}>
          <BookSection1 />
        </div>
        <div ref={sec2Ref} style={styles.sec2}>
          <BookSection2 />
        </div>
      </div>

      <SectionOverlays
        progressRef={progressRef}
        sec1Ref={sec1Ref}
        sec2Ref={sec2Ref}
      />

    </div>
  )
}

useGLTF.preload('/models/deathnote.glb')