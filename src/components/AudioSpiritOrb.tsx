import React, { useEffect, useRef } from 'react';
import { PersonaConfig } from '../data/pfalzDomain';

interface AudioSpiritOrbProps {
  persona: PersonaConfig;
  isLiveConnected: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  isThinking: boolean;
  inputLevel: number;
  outputLevel: number;
  activeWineColor?: string;
}

interface MineralParticle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  alpha: number;
  layer: number;
}

export const AudioSpiritOrb: React.FC<AudioSpiritOrbProps> = ({
  persona,
  isLiveConnected,
  isSpeaking,
  isListening,
  isThinking,
  inputLevel,
  outputLevel,
  activeWineColor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({
    inputLevel: 0,
    outputLevel: 0,
    isLiveConnected: false,
    isSpeaking: false,
    isListening: false,
    isThinking: false,
    primaryColor: persona.shaderColors.primary,
    secondaryColor: persona.shaderColors.secondary,
    coreColor: activeWineColor || persona.shaderColors.core,
  });

  useEffect(() => {
    stateRef.current = {
      inputLevel,
      outputLevel,
      isLiveConnected,
      isSpeaking,
      isListening,
      isThinking,
      primaryColor: persona.shaderColors.primary,
      secondaryColor: persona.shaderColors.secondary,
      coreColor: activeWineColor || persona.shaderColors.core,
    };
  }, [
    inputLevel,
    outputLevel,
    isLiveConnected,
    isSpeaking,
    isListening,
    isThinking,
    persona,
    activeWineColor,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;
    let smoothedIn = 0;
    let smoothedOut = 0;

    const particles: MineralParticle[] = Array.from({ length: 56 }, (_, i) => ({
      angle: (i / 56) * Math.PI * 2,
      radius: 65 + (i % 5) * 20,
      speed: 0.0025 + (i % 4) * 0.0012,
      size: 1.2 + (i % 3) * 0.9,
      alpha: 0.25 + (i % 4) * 0.15,
      layer: i % 3,
    }));

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const width = rect.width;
      const height = rect.height;
      const cx = width / 2;
      const cy = height / 2;

      const s = stateRef.current;
      smoothedIn += (s.inputLevel - smoothedIn) * 0.18;
      smoothedOut += (s.outputLevel - smoothedOut) * 0.22;

      const activeEnergy =
        smoothedOut * 1.4 +
        smoothedIn * 1.1 +
        (s.isThinking ? 0.28 : 0) +
        (s.isLiveConnected ? 0.12 : 0.04);

      phase += 0.018 + activeEnergy * 0.045;

      ctx.clearRect(0, 0, width, height);

      // Ambient cellar halo
      const outerRadius = Math.min(width, height) * 0.44;
      const ambientGrad = ctx.createRadialGradient(
        cx,
        cy,
        outerRadius * 0.08,
        cx,
        cy,
        outerRadius
      );
      ambientGrad.addColorStop(0, `${s.coreColor}33`);
      ambientGrad.addColorStop(0.55, `${s.primaryColor}18`);
      ambientGrad.addColorStop(1, 'rgba(15, 13, 12, 0)');

      ctx.fillStyle = ambientGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
      ctx.fill();

      // Concentric harmonic wine-leg ribbons
      const ringCount = 4;
      for (let r = 0; r < ringCount; r++) {
        const baseRad =
          Math.min(width, height) * (0.21 + r * 0.045) +
          smoothedOut * 26 +
          smoothedIn * 16;

        ctx.beginPath();
        const segments = 96;
        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          const wave1 =
            Math.sin(theta * (3 + r) + phase * (1.2 - r * 0.15)) *
            (6 + activeEnergy * 24);
          const wave2 =
            Math.cos(theta * (5 - r) - phase * 1.4) * (4 + smoothedOut * 18);
          const rad = baseRad + wave1 + wave2;
          const x = cx + Math.cos(theta) * rad;
          const y = cy + Math.sin(theta) * rad;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();

        ctx.strokeStyle =
          r % 2 === 0 ? `${s.primaryColor}88` : `${s.secondaryColor}77`;
        ctx.lineWidth = r === 0 ? 2.0 : 1.15;
        ctx.stroke();

        if (r === 0) {
          const coreFill = ctx.createRadialGradient(
            cx - 12,
            cy - 14,
            8,
            cx,
            cy,
            baseRad * 1.15
          );
          coreFill.addColorStop(0, `${s.coreColor}AA`);
          coreFill.addColorStop(0.5, `${s.primaryColor}44`);
          coreFill.addColorStop(1, `${s.secondaryColor}12`);
          ctx.fillStyle = coreFill;
          ctx.fill();
        }
      }

      // Terroir mineral particles (Buntsandstein / Kalkmergel / Basalt sparks)
      for (const p of particles) {
        p.angle += p.speed * (1 + activeEnergy * 2.5);
        const dynamicRad =
          p.radius * (Math.min(width, height) / 340) +
          Math.sin(phase * 1.5 + p.angle * 3) * (6 + activeEnergy * 18);
        const px = cx + Math.cos(p.angle) * dynamicRad;
        const py = cy + Math.sin(p.angle) * dynamicRad;

        ctx.beginPath();
        ctx.arc(
          px,
          py,
          p.size * (1 + smoothedOut * 0.8),
          0,
          Math.PI * 2
        );
        ctx.fillStyle =
          p.layer === 0
            ? s.primaryColor
            : p.layer === 1
            ? s.coreColor
            : '#F5F0E6';
        ctx.globalAlpha = Math.min(1, p.alpha + activeEnergy * 0.35);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Inner crystal goblet horizon ring
      ctx.beginPath();
      ctx.arc(
        cx,
        cy,
        Math.min(width, height) * 0.14 + smoothedOut * 10,
        0,
        Math.PI * 2
      );
      ctx.strokeStyle = 'rgba(245, 240, 230, 0.22)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const stateLabel = isSpeaking
    ? 'Weingeist spricht (24kHz Audio-Stream)'
    : isThinking
    ? 'Terroir-Datenbank & Sensorik werden abgefragt...'
    : isListening
    ? 'Hört zu (16kHz Mikrofon-Stream aktiv · Unterbrechung jederzeit möglich)'
    : 'Bereit für Verkostung & Sprachdialog';

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          aria-label="Audioreaktive Visualisierung des Pfälzer Weingeists"
        />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <span className="text-[11px] tracking-[0.22em] uppercase text-[#F5F0E6]/70 font-mono-tabular">
            {persona.voiceName} · {persona.id === 'dionysian' ? 'Bacchus' : persona.id === 'purist' ? 'Grand Cru' : 'Pfalz'}
          </span>
          <p className="font-serif-display italic text-lg sm:text-xl text-[#F5F0E6] mt-1 drop-shadow">
            {persona.name}
          </p>
        </div>
      </div>

      <div className="mt-2 text-center">
        <p className="text-xs text-[#A39B8B] font-mono-tabular tracking-wide">
          {stateLabel}
        </p>
      </div>
    </div>
  );
};
