import { Badge } from '@/components/ui/badge'

interface KeyBadgeProps {
  musicKey: string
}

// Camelot wheel: number = position (1-12), letter = Major(B) or Minor(A)
const CAMELOT_MAP: Record<string, { camelot: string; color: string }> = {
  // Minor keys (A)
  Am: { camelot: '1A', color: '#7B9ED9' }, // Light Blue
  Em: { camelot: '2A', color: '#6DB88A' }, // Green
  Bm: { camelot: '3A', color: '#A8CC7A' }, // Yellow-Green
  'F#m': { camelot: '4A', color: '#D4E06A' }, // Yellow
  Dbm: { camelot: '5A', color: '#F2C06A' }, // Yellow-Orange
  'C#m': { camelot: '5A', color: '#F2C06A' },
  Abm: { camelot: '6A', color: '#F0907A' }, // Orange-Red
  'G#m': { camelot: '6A', color: '#F0907A' },
  Ebm: { camelot: '7A', color: '#E87AAA' }, // Pink
  'D#m': { camelot: '7A', color: '#E87AAA' },
  Bbm: { camelot: '8A', color: '#C97AC8' }, // Purple-Pink
  'A#m': { camelot: '8A', color: '#C97AC8' },
  Fm: { camelot: '9A', color: '#9B7AC8' }, // Purple
  Cm: { camelot: '10A', color: '#7A8ED4' }, // Blue-Purple
  Gm: { camelot: '11A', color: '#7ABCDC' }, // Cyan-Blue
  Dm: { camelot: '12A', color: '#7AD4C8' }, // Cyan

  // Major keys (B)
  B: { camelot: '1B', color: '#88D4A8' }, // Mint Green
  'F#': { camelot: '2B', color: '#A8D888' }, // Light Green
  Gb: { camelot: '2B', color: '#A8D888' },
  Db: { camelot: '3B', color: '#CCE87A' }, // Yellow-Green
  'C#': { camelot: '3B', color: '#CCE87A' },
  Ab: { camelot: '4B', color: '#F0D870' }, // Yellow
  'G#': { camelot: '4B', color: '#F0D870' },
  Eb: { camelot: '5B', color: '#F0A870' }, // Orange
  'D#': { camelot: '5B', color: '#F0A870' },
  Bb: { camelot: '6B', color: '#EE8090' }, // Red-Pink
  'A#': { camelot: '6B', color: '#EE8090' },
  F: { camelot: '7B', color: '#E070A8' }, // Hot Pink
  C: { camelot: '8B', color: '#B878C8' }, // Magenta
  G: { camelot: '9B', color: '#9080CC' }, // Purple
  D: { camelot: '10B', color: '#7890D4' }, // Blue
  A: { camelot: '11B', color: '#78C0DC' }, // Sky Blue
  E: { camelot: '12B', color: '#78D8C0' }, // Teal
}

const getCamelotInfo = (key: string) => {
  // Try direct match first
  if (CAMELOT_MAP[key]) return CAMELOT_MAP[key]

  // Normalize: "Abmin" -> "Abm", "A minor" -> "Am", "A major" -> "A"
  const normalized = key
    .replace(/\s*(minor|min)\s*/i, 'm')
    .replace(/\s*(major|maj)\s*/i, '')
    .trim()

  return CAMELOT_MAP[normalized] || { camelot: key, color: '#888888' }
}

export const KeyBadge = ({ musicKey }: KeyBadgeProps) => {
  const { camelot, color } = getCamelotInfo(musicKey)

  return (
    <Badge
      className="text-white border-0 font-semibold"
      style={{ backgroundColor: color }}
    >
      {camelot}
    </Badge>
  )
}
