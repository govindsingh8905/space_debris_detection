'use client'

import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Clock, FastForward } from 'lucide-react'

interface SimulationInterfaceProps {
  timeOffset: number
  isPlaying: boolean
  onTimeChange: (time: number) => void
  onPlayPause: () => void
  onReset: () => void
  playbackSpeed: number
  onSpeedChange: (speed: number) => void
}

export function SimulationInterface({
  timeOffset,
  isPlaying,
  onTimeChange,
  onPlayPause,
  onReset,
  playbackSpeed,
  onSpeedChange
}: SimulationInterfaceProps) {
  const formatTime = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.floor((hours - h) * 60)
    return `T+${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  }
  
  const speeds = [1, 2, 4, 8]
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full px-5 py-2 flex items-center gap-4"
      style={{
        background: 'rgba(3,5,8,0.6)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(34,211,238,0.08)',
        width: 'min(520px, calc(100vw - 4rem))',
      }}
    >
      <div className="flex items-center gap-4">
        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Reset to current time"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onPlayPause}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
              isPlaying 
                ? 'bg-glow-cyan/20 text-glow-cyan border border-glow-cyan/40' 
                : 'bg-muted/50 text-foreground hover:bg-muted'
            }`}
            title={isPlaying ? 'Pause' : 'Play simulation'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
        </div>
        
        {/* Time Display */}
        <div className="flex items-center gap-2 text-foreground">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="font-mono text-lg font-bold text-glow-cyan">{formatTime(timeOffset)}</span>
        </div>
        
        {/* Slider */}
        <div className="flex-1 relative">
          <input
            type="range"
            min={0}
            max={72}
            step={0.1}
            value={timeOffset}
            onChange={(e) => onTimeChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-glow-cyan
              [&::-webkit-slider-thumb]:shadow-[0_0_10px_var(--glow-cyan)]
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:border-2
              [&::-webkit-slider-thumb]:border-glow-cyan/50"
          />
          <div className="absolute top-4 left-0 right-0 h-4 text-[10px] text-muted-foreground font-mono pointer-events-none">
            <span className="absolute left-0">Now</span>
            <span className="absolute" style={{ left: `${(1/72)*100}%`, transform: 'translateX(-50%)' }}>+1h</span>
            <span className="absolute" style={{ left: `${(24/72)*100}%`, transform: 'translateX(-50%)' }}>+24h</span>
            <span className="absolute right-0">+72h</span>
          </div>
        </div>
        
        {/* Speed Control */}
        <div className="flex items-center gap-2">
          <FastForward className="w-4 h-4 text-muted-foreground" />
          <div className="flex rounded-lg overflow-hidden border border-border">
            {speeds.map((speed) => (
              <button
                key={speed}
                onClick={() => onSpeedChange(speed)}
                className={`px-2 py-1 text-xs font-mono transition-colors ${
                  playbackSpeed === speed
                    ? 'bg-glow-blue/20 text-glow-blue'
                    : 'bg-muted/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
