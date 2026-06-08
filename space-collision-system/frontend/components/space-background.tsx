'use client'

export function SpaceBackground() {
  return (
    <>
      <div className="fixed inset-0 -z-30 bg-[#030305]" />
      <div
        className="fixed -inset-[22%] -z-20 pointer-events-none opacity-70 space-bg-image"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=3000&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: '50% 42%',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="fixed -inset-[15%] -z-[19] pointer-events-none space-bg-dust" />
      {/* Heavy Cinematic Vignette layer */}
      <div 
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 42%, rgba(3, 3, 5, 0.08) 0%, rgba(3, 3, 5, 0.62) 48%, rgba(0, 0, 0, 0.98) 100%)'
        }}
      />
    </>
  )
}

