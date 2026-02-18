'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWeatherApi } from 'openmeteo';

// WMO Weather Codes → weather type
function getWeatherType(code: number, isDay: boolean): WeatherType {
  if ([0].includes(code)) return isDay ? 'sunny' : 'clear-night';
  if ([1, 2].includes(code)) return 'partly-cloudy';
  if ([3].includes(code)) return 'cloudy';
  if ([45, 48].includes(code)) return 'foggy';
  if ([51, 53, 55, 56, 57].includes(code)) return 'drizzle';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rainy';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snowy';
  if ([95, 96, 99].includes(code)) return 'thunderstorm';
  if ([71, 73, 75].includes(code)) return 'snowy';
  // Use windspeed check done outside; default fallback:
  return 'cloudy';
}

type WeatherType =
  | 'sunny'
  | 'clear-night'
  | 'partly-cloudy'
  | 'cloudy'
  | 'foggy'
  | 'drizzle'
  | 'rainy'
  | 'thunderstorm'
  | 'snowy'
  | 'windy';

interface WeatherState {
  type: WeatherType;
  temp: number;
  windspeed: number;
  description: string;
  sunriseHour: number;
  sunsetHour: number;
  currentHour: number;
}

// ─── Rain ────────────────────────────────────────────────────────────────────

function RainLayer({ heavy = false }: { heavy?: boolean }) {
  const drops = Array.from({ length: heavy ? 120 : 60 }, (_, i) => i);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {drops.map((i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 2;
        const duration = heavy ? 0.4 + Math.random() * 0.3 : 0.6 + Math.random() * 0.4;
        const opacity = 0.3 + Math.random() * 0.5;
        const height = heavy ? 18 + Math.random() * 12 : 12 + Math.random() * 10;
        return (
          <motion.div
            key={i}
            className="absolute w-px bg-blue-300/60"
            style={{ left: `${left}%`, top: '-5%', height: `${height}px`, opacity }}
            animate={{ y: ['0vh', '110vh'] }}
            transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
          />
        );
      })}
    </div>
  );
}

// ─── Thunder ─────────────────────────────────────────────────────────────────

function ThunderLayer() {
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    const trigger = () => {
      setFlash(true);
      setTimeout(() => setFlash(false), 150);
      setTimeout(trigger, 3000 + Math.random() * 5000);
    };
    const t = setTimeout(trigger, 1500 + Math.random() * 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <RainLayer heavy />
      <AnimatePresence>
        {flash && (
          <motion.div
            key="flash"
            className="absolute inset-0 bg-white/20 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          />
        )}
      </AnimatePresence>
      {/* Lightning bolt */}
      {flash && (
        <svg
          className="absolute pointer-events-none"
          style={{ left: `${30 + Math.random() * 40}%`, top: 0, width: 40, height: 200 }}
          viewBox="0 0 40 200"
        >
          <polyline points="20,0 10,80 22,80 8,200" fill="none" stroke="yellow" strokeWidth="3" opacity="0.9" />
        </svg>
      )}
    </>
  );
}

// ─── Snow ─────────────────────────────────────────────────────────────────────

function SnowLayer() {
  const flakes = Array.from({ length: 80 }, (_, i) => i);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {flakes.map((i) => {
        const left = Math.random() * 100;
        const size = 3 + Math.random() * 5;
        const delay = Math.random() * 5;
        const duration = 4 + Math.random() * 4;
        const drift = (Math.random() - 0.5) * 60;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/80"
            style={{ left: `${left}%`, top: '-2%', width: size, height: size }}
            animate={{ y: '110vh', x: drift }}
            transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
          />
        );
      })}
    </div>
  );
}

// ─── Clouds ───────────────────────────────────────────────────────────────────

interface CloudProps {
  count?: number;
  opacity?: number;
  dark?: boolean;
}

function CloudLayer({ count = 5, opacity = 0.25, dark = false }: CloudProps) {
  const clouds = Array.from({ length: count }, (_, i) => i);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {clouds.map((i) => {
        const top = 5 + Math.random() * 35;
        const scale = 0.8 + Math.random() * 1.4;
        const duration = 40 + Math.random() * 60;
        const delay = -(Math.random() * duration);
        const color = dark ? 'bg-gray-600' : 'bg-white';
        return (
          <motion.div
            key={i}
            className="absolute flex items-center"
            style={{ top: `${top}%`, opacity }}
            animate={{ x: ['-30vw', '120vw'] }}
            transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
          >
            {/* Cloud shape via overlapping circles */}
            <div className="relative" style={{ transform: `scale(${scale})` }}>
              <div className={`absolute rounded-full ${color}`} style={{ width: 100, height: 60, top: 20, left: 0 }} />
              <div className={`absolute rounded-full ${color}`} style={{ width: 70, height: 70, top: 10, left: 20 }} />
              <div className={`absolute rounded-full ${color}`} style={{ width: 80, height: 55, top: 25, left: 50 }} />
              <div className={`absolute rounded-full ${color}`} style={{ width: 60, height: 50, top: 15, left: 60 }} />
              <div style={{ width: 140, height: 80 }} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Sun ──────────────────────────────────────────────────────────────────────

function SunLayer({ currentHour, sunriseHour, sunsetHour }: { currentHour: number; sunriseHour: number; sunsetHour: number }) {
  // Map current hour to horizontal progress (0 = sunrise/right edge, 1 = sunset/left edge)
  const totalDaylight = sunsetHour - sunriseHour;
  const elapsed = Math.max(0, Math.min(currentHour - sunriseHour, totalDaylight));
  const progress = totalDaylight > 0 ? elapsed / totalDaylight : 0.5;

  // Sun travels from right (90%) to left (5%)
  const sunX = 90 - progress * 85;
  // Arc: highest at noon (progress ~0.5)
  const sunY = 5 + Math.abs(progress - 0.5) * 2 * 35;

  // Ray animation
  const rays = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Glow */}
      <div
        className="absolute rounded-full"
        style={{
          left: `${sunX}%`,
          top: `${sunY}%`,
          width: 140,
          height: 140,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(255,220,50,0.35) 0%, transparent 70%)',
        }}
      />
      {/* Sun disc */}
      <motion.div
        className="absolute rounded-full bg-yellow-300"
        style={{
          left: `${sunX}%`,
          top: `${sunY}%`,
          width: 56,
          height: 56,
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 30px 10px rgba(255,200,0,0.45)',
        }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Rays */}
        {rays.map((r) => (
          <motion.div
            key={r}
            className="absolute bg-yellow-200/70"
            style={{
              width: 2,
              height: 18,
              left: '50%',
              top: '50%',
              transformOrigin: '50% 0',
              transform: `rotate(${r * 30}deg) translateX(-50%) translateY(-150%)`,
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, delay: r * 0.15, repeat: Infinity }}
          />
        ))}
      </motion.div>
    </div>
  );
}

// ─── Stars / Clear Night ──────────────────────────────────────────────────────

function StarsLayer() {
  const stars = Array.from({ length: 100 }, (_, i) => i);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((i) => {
        const x = Math.random() * 100;
        const y = Math.random() * 60;
        const size = 1 + Math.random() * 2;
        const delay = Math.random() * 4;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 2 + Math.random() * 2, delay, repeat: Infinity }}
          />
        );
      })}
    </div>
  );
}

// ─── Wind / Leaves ────────────────────────────────────────────────────────────

const LEAF_COLORS = ['#4ade80', '#86efac', '#fbbf24', '#fb923c', '#f87171', '#a3e635'];

function WindLayer() {
  const items = Array.from({ length: 22 }, (_, i) => i);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Wind streaks */}
      {Array.from({ length: 8 }).map((_, i) => {
        const top = 10 + Math.random() * 80;
        const width = 60 + Math.random() * 120;
        const delay = Math.random() * 2;
        return (
          <motion.div
            key={`streak-${i}`}
            className="absolute h-px bg-white/20 rounded-full"
            style={{ top: `${top}%`, width, left: '-10%' }}
            animate={{ x: ['0vw', '120vw'], opacity: [0, 0.5, 0] }}
            transition={{ duration: 1.2 + Math.random(), delay, repeat: Infinity, ease: 'linear' }}
          />
        );
      })}
      {/* Leaves */}
      {items.map((i) => {
        const startY = 20 + Math.random() * 70;
        const color = LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)];
        const size = 8 + Math.random() * 12;
        const duration = 3 + Math.random() * 3;
        const delay = Math.random() * 4;
        const wobble = (Math.random() - 0.5) * 80;
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: `${startY}%`,
              left: '-5%',
              width: size,
              height: size * 0.6,
              backgroundColor: color,
              borderRadius: '50% 0 50% 0',
              transformOrigin: 'center',
            }}
            animate={{
              x: ['0vw', '115vw'],
              y: [0, wobble],
              rotate: [0, 720],
            }}
            transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
          />
        );
      })}
    </div>
  );
}

// ─── Fog ─────────────────────────────────────────────────────────────────────

function FogLayer() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-full bg-gray-300/10"
          style={{ top: `${15 + i * 18}%`, height: 60, filter: 'blur(20px)' }}
          animate={{ x: ['-10%', '10%', '-10%'] }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ─── Background gradient per weather ─────────────────────────────────────────

function getBgGradient(type: WeatherType): string {
  switch (type) {
    case 'sunny':
      return 'linear-gradient(to bottom, #1e3a5f 0%, #2d5a8e 40%, #1a2a4a 100%)';
    case 'clear-night':
      return 'linear-gradient(to bottom, #020617 0%, #0f172a 50%, #1e1b4b 100%)';
    case 'partly-cloudy':
      return 'linear-gradient(to bottom, #1c3455 0%, #2a4a72 50%, #1a2a3a 100%)';
    case 'cloudy':
      return 'linear-gradient(to bottom, #1a1a2e 0%, #2d3561 50%, #1a1a2e 100%)';
    case 'foggy':
      return 'linear-gradient(to bottom, #2a2a3a 0%, #3a3a4a 50%, #1a1a2a 100%)';
    case 'drizzle':
      return 'linear-gradient(to bottom, #1a2535 0%, #263447 50%, #151e2b 100%)';
    case 'rainy':
      return 'linear-gradient(to bottom, #111827 0%, #1e293b 50%, #0f172a 100%)';
    case 'thunderstorm':
      return 'linear-gradient(to bottom, #0c0c1a 0%, #1a1a35 50%, #0a0a15 100%)';
    case 'snowy':
      return 'linear-gradient(to bottom, #1e2a3a 0%, #2a3a4e 50%, #1a2030 100%)';
    case 'windy':
      return 'linear-gradient(to bottom, #1a2535 0%, #203045 50%, #141e2c 100%)';
    default:
      return 'linear-gradient(to bottom, #0f172a 0%, #1e293b 100%)';
  }
}

function getWeatherLabel(type: WeatherType): string {
  const labels: Record<WeatherType, string> = {
    sunny: 'Clear & Sunny',
    'clear-night': 'Clear Night',
    'partly-cloudy': 'Partly Cloudy',
    cloudy: 'Overcast',
    foggy: 'Foggy',
    drizzle: 'Drizzle',
    rainy: 'Rainy',
    thunderstorm: 'Thunderstorm',
    snowy: 'Snowy',
    windy: 'Windy',
  };
  return labels[type] ?? type;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WeatherBackground({ children }: { children?: React.ReactNode }) {
  const [weather, setWeather] = useState<WeatherState | null>(null);
  const [loading, setLoading] = useState(true);
  const isFetched = useRef(false);

  useEffect(() => {
    if (isFetched.current) return;
    isFetched.current = true;

    async function fetchWeather() {
      try {
        // Caldwell, NJ
        // const lat = 40.8398;
        // const lon = -74.2765;

        //Kathmandu, Nepal
        // const lat = 27.7103
        // const lon = 85.325;

        // Buenos Aires, Argentina
        const lat = -34.6037;
        const lon = -58.3816;

        //London, UK
        // const lat = 51.5072;
        // const lon = -0.1276;

        const params = {
          latitude: lat,
          longitude: lon,
          current: [
            'temperature_2m',
            'weathercode',
            'windspeed_10m',
            'is_day',
          ],
          daily: ['sunrise', 'sunset'],
          timezone: 'auto',
          forecast_days: 1,
        };

        const responses = await fetchWeatherApi('https://api.open-meteo.com/v1/forecast', params);
        const response = responses[0];
        const current = response.current()!;
        const daily = response.daily()!;

        const code = Number(current.variables(1)!.value());
        const isDay = Boolean(current.variables(3)!.value());
        const windspeed = Number(current.variables(2)!.value());
        const temp = Math.round(Number(current.variables(0)!.value()));

        // Parse sunrise / sunset hours
        const utcOffsetSeconds = response.utcOffsetSeconds();
        const sunriseMs = Number(daily.variables(0)!.valuesInt64(0)) * 1000;
        const sunsetMs = Number(daily.variables(1)!.valuesInt64(0)) * 1000;
        const sunriseHour = new Date(sunriseMs).getUTCHours() + utcOffsetSeconds / 3600;
        const sunsetHour = new Date(sunsetMs).getUTCHours() + utcOffsetSeconds / 3600;
        const currentHour = new Date().getHours() + new Date().getMinutes() / 60;

        let type = getWeatherType(code, isDay);
        // Promote to windy if strong wind and no notable weather
        if (windspeed > 30 && ['partly-cloudy', 'cloudy', 'sunny'].includes(type)) {
          type = 'windy';
        }

        setWeather({
          type,
          temp,
          windspeed,
          description: getWeatherLabel(type),
          sunriseHour,
          sunsetHour,
          currentHour,
        });
      } catch (err) {
        console.error('Weather fetch failed:', err);
        // Fallback: pick by current hour
        const h = new Date().getHours();
        setWeather({
          type: h >= 6 && h < 19 ? 'sunny' : 'clear-night',
          temp: 20,
          windspeed: 10,
          description: h >= 6 && h < 19 ? 'Clear & Sunny' : 'Clear Night',
          sunriseHour: 6,
          sunsetHour: 18,
          currentHour: h,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, []);

  const type: WeatherType = weather?.type ?? 'clear-night';

  return (
    <motion.div
      className=" inset-0 flex flex-col justify-center items-center"
      animate={{ background: getBgGradient(type) }}
      transition={{ duration: 2 }}
      style={{ background: getBgGradient(type) }}
    >
      {/* Weather layers */}
      {!loading && (
        <>
          {(type === 'sunny' || type === 'partly-cloudy') && weather && (
            <SunLayer
              currentHour={weather.currentHour}
              sunriseHour={weather.sunriseHour}
              sunsetHour={weather.sunsetHour}
            />
          )}
          {type === 'clear-night' && <StarsLayer />}
          {(type === 'cloudy' || type === 'partly-cloudy' || type === 'foggy') && (
            <CloudLayer count={type === 'partly-cloudy' ? 3 : 6} opacity={type === 'cloudy' ? 0.35 : 0.2} />
          )}
          {(type === 'rainy' || type === 'drizzle') && (
            <>
              <CloudLayer count={7} opacity={0.35} dark />
              <RainLayer heavy={type === 'rainy'} />
            </>
          )}
          {type === 'thunderstorm' && (
            <>
              <CloudLayer count={8} opacity={0.5} dark />
              <ThunderLayer />
            </>
          )}
          {type === 'snowy' && (
            <>
              <CloudLayer count={5} opacity={0.3} />
              <SnowLayer />
            </>
          )}
          {type === 'windy' && (
            <>
              <CloudLayer count={4} opacity={0.2} />
              <WindLayer />
            </>
          )}
          {type === 'foggy' && <FogLayer />}
        </>
      )}

      {/* Weather badge */}
      {!loading && weather && (
        <motion.div
          className="absolute top-4 right-20 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-white/70 text-xs font-medium"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <WeatherIcon type={type} />
          <span>{weather.description}</span>
          <span className="text-white/40">|</span>
          <span>{weather.temp}°C</span>
        </motion.div>
      )}

      {children}
    </motion.div>
  );
}

function WeatherIcon({ type }: { type: WeatherType }) {
  const icons: Record<WeatherType, string> = {
    sunny: '☀️',
    'clear-night': '🌙',
    'partly-cloudy': '⛅',
    cloudy: '☁️',
    foggy: '🌫️',
    drizzle: '🌦️',
    rainy: '🌧️',
    thunderstorm: '⛈️',
    snowy: '❄️',
    windy: '💨',
  };
  return <span>{icons[type]}</span>;
}
