import { useEffect, useState, useRef } from 'react'

interface SandwichParticle {
  id: number
  left: number
  animationDuration: number
  delay: number
  size: number
}

interface SandwichRainProps {
  triggerCount: number
}

export default function SandwichRain({ triggerCount }: SandwichRainProps) {
  const [particles, setParticles] = useState<SandwichParticle[]>([])
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set())

  useEffect(() => {
    if (triggerCount > 0) {
      console.log('Adding more sandwiches!')
      const newParticles: SandwichParticle[] = []
      const particleCount = 50

      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: Date.now() + Math.random() * 1000000 + i, // More unique IDs
          left: Math.random() * 100,
          animationDuration: 2 + Math.random() * 2,
          delay: Math.random() * 0.5,
          size: 20 + Math.random() * 25
        })
      }

      // Add new particles to existing ones (additive)
      setParticles(prev => [...prev, ...newParticles])
      console.log('Total particles now:', particles.length + newParticles.length)

      // Clean up these specific particles after animation completes
      const timeout = setTimeout(() => {
        setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)))
      }, 5000)

      timeoutsRef.current.add(timeout)

      return () => {
        timeoutsRef.current.forEach(t => clearTimeout(t))
        timeoutsRef.current.clear()
      }
    }
  }, [triggerCount])

  if (particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.left}%`,
            animation: `fall ${particle.animationDuration}s ease-in ${particle.delay}s forwards`,
            fontSize: `${particle.size}px`,
            top: '-50px'
          }}
        >
          🥪
        </div>
      ))}
    </div>
  )
}