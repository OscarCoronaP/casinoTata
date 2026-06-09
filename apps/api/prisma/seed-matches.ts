import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Convierte hora MEX (UTC-6) a UTC */
function utc(dateStr: string, hourMex: number, minMex = 0): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  const utcHour = hourMex + 6
  const date = new Date(Date.UTC(y, m - 1, d, utcHour, minMex))
  return date
}

// ─── Datos de las jornadas (Rounds = un Round por día) ────────────────────

const roundsData = [
  { date: '2026-06-11', name: 'Jornada 1 – 11 jun',  sortOrder: 1 },
  { date: '2026-06-12', name: 'Jornada 1 – 12 jun',  sortOrder: 2 },
  { date: '2026-06-13', name: 'Jornada 1 – 13 jun',  sortOrder: 3 },
  { date: '2026-06-14', name: 'Jornada 1 – 14 jun',  sortOrder: 4 },
  { date: '2026-06-15', name: 'Jornada 1 – 15 jun',  sortOrder: 5 },
  { date: '2026-06-16', name: 'Jornada 1 – 16 jun',  sortOrder: 6 },
  { date: '2026-06-17', name: 'Jornada 1 – 17 jun',  sortOrder: 7 },
  { date: '2026-06-18', name: 'Jornada 2 – 18 jun',  sortOrder: 8 },
  { date: '2026-06-19', name: 'Jornada 2 – 19 jun',  sortOrder: 9 },
  { date: '2026-06-20', name: 'Jornada 2 – 20 jun',  sortOrder: 10 },
  { date: '2026-06-21', name: 'Jornada 2 – 21 jun',  sortOrder: 11 },
  { date: '2026-06-22', name: 'Jornada 2 – 22 jun',  sortOrder: 12 },
  { date: '2026-06-23', name: 'Jornada 2 – 23 jun',  sortOrder: 13 },
  { date: '2026-06-24', name: 'Jornada 3 – 24 jun',  sortOrder: 14 },
  { date: '2026-06-25', name: 'Jornada 3 – 25 jun',  sortOrder: 15 },
  { date: '2026-06-26', name: 'Jornada 3 – 26 jun',  sortOrder: 16 },
  { date: '2026-06-27', name: 'Jornada 3 – 27 jun',  sortOrder: 17 },
]

// ─── Partidos de fase de grupos ───────────────────────────────────────────
// Formato: [grupo, homeSlug, awaySlug, fecha, horaMEX, minMEX, estadio]

type MatchDef = [string, string, string, string, number, number, string]

const matchesDef: MatchDef[] = [
  // 11 jun
  ['A', 'mexico',        'sudafrica',          '2026-06-11', 13, 0,  'Estadio Azteca, Ciudad de México'],
  ['A', 'coreadelsur', 'republicacheca',    '2026-06-11', 20, 0,  'Estadio Akron, Guadalajara'],

  // 12 jun
  ['B', 'canada',        'bosnia', '2026-06-12', 13, 0,  'BMO Field, Toronto'],
  ['D', 'estadosunidos','paraguay',           '2026-06-12', 19, 0,  'SoFi Stadium, Los Ángeles'],

  // 13 jun
  ['B', 'qatar',         'suiza',              '2026-06-13', 13, 0,  "Levi's Stadium, Santa Clara"],
  ['C', 'brasil',        'marruecos',          '2026-06-13', 16, 0,  'MetLife Stadium, East Rutherford'],
  ['C', 'haiti',         'escocia',            '2026-06-13', 19, 0,  'Gillette Stadium, Foxborough'],
  ['D', 'australia',     'turquia',            '2026-06-13', 22, 0,  'BC Place, Vancouver'],

  // 14 jun
  ['E', 'alemania',      'curazao',            '2026-06-14', 11, 0,  'NRG Stadium, Houston'],
  ['F', 'paisesbajos',  'japon',              '2026-06-14', 14, 0,  'AT&T Stadium, Dallas'],
  ['E', 'costa_de_marfil','ecuador',           '2026-06-14', 17, 0,  'Lincoln Financial Field, Philadelphia'],
  ['F', 'suecia',        'tunez',              '2026-06-14', 20, 0,  'Estadio BBVA, Monterrey'],

  // 15 jun
  ['H', 'espana',        'cabo_verde',         '2026-06-15', 10, 0,  'Mercedes-Benz Stadium, Atlanta'],
  ['G', 'belgica',       'egipto',             '2026-06-15', 13, 0,  'Lumen Field, Seattle'],
  ['H', 'arabiasaudita','uruguay',            '2026-06-15', 16, 0,  'Hard Rock Stadium, Miami'],
  ['G', 'iran',          'nuevazelanda',      '2026-06-15', 19, 0,  'SoFi Stadium, Los Ángeles'],

  // 16 jun
  ['I', 'francia',       'senegal',            '2026-06-16', 13, 0,  'MetLife Stadium, East Rutherford'],
  ['I', 'irak',          'noruega',            '2026-06-16', 16, 0,  'Gillette Stadium, Foxborough'],
  ['J', 'argentina',     'argelia',            '2026-06-16', 19, 0,  'Arrowhead Stadium, Kansas City'],
  ['J', 'austria',       'jordania',           '2026-06-16', 22, 0,  "Levi's Stadium, San Francisco"],

  // 17 jun
  ['K', 'portugal',      'congo',           '2026-06-17', 11, 0,  'NRG Stadium, Houston'],
  ['L', 'inglaterra',    'croacia',            '2026-06-17', 14, 0,  'AT&T Stadium, Dallas'],
  ['L', 'ghana',         'panama',             '2026-06-17', 17, 0,  'BMO Field, Toronto'],
  ['K', 'uzbekistan',    'colombia',           '2026-06-17', 20, 0,  'Estadio Azteca, Ciudad de México'],

  // 18 jun
  ['A', 'republicacheca','sudafrica',         '2026-06-18', 10, 0,  'Mercedes-Benz Stadium, Atlanta'],
  ['B', 'suiza',         'bosnia', '2026-06-18', 13, 0,  'SoFi Stadium, Los Ángeles'],
  ['B', 'canada',        'qatar',              '2026-06-18', 16, 0,  'BC Place, Vancouver'],
  ['A', 'mexico',        'coreadelsur',      '2026-06-18', 19, 0,  'Estadio Akron, Guadalajara'],

  // 19 jun
  ['D', 'estadosunidos','australia',          '2026-06-19', 13, 0,  'Lumen Field, Seattle'],
  ['C', 'escocia',       'marruecos',          '2026-06-19', 16, 0,  'Gillette Stadium, Foxborough'],
  ['C', 'brasil',        'haiti',              '2026-06-19', 18, 30, 'Lincoln Financial Field, Philadelphia'],
  ['D', 'turquia',       'paraguay',           '2026-06-19', 21, 0,  "Levi's Stadium, San Francisco"],

  // 20 jun
  ['F', 'paisesbajos',  'suecia',             '2026-06-20', 11, 0,  'NRG Stadium, Houston'],
  ['E', 'alemania',      'costa_de_marfil',    '2026-06-20', 14, 0,  'BMO Field, Toronto'],
  ['E', 'ecuador',       'curazao',            '2026-06-20', 18, 0,  'Arrowhead Stadium, Kansas City'],
  ['F', 'tunez',         'japon',              '2026-06-20', 22, 0,  'Estadio BBVA, Monterrey'],

  // 21 jun
  ['H', 'espana',        'arabiasaudita',     '2026-06-21', 10, 0,  'Mercedes-Benz Stadium, Atlanta'],
  ['G', 'belgica',       'iran',               '2026-06-21', 13, 0,  'SoFi Stadium, Los Ángeles'],
  ['H', 'uruguay',       'cabo_verde',         '2026-06-21', 16, 0,  'Hard Rock Stadium, Miami'],
  ['G', 'nuevazelanda', 'egipto',             '2026-06-21', 19, 0,  'BC Place, Vancouver'],

  // 22 jun
  ['J', 'argentina',     'austria',            '2026-06-22', 11, 0,  'AT&T Stadium, Dallas'],
  ['I', 'francia',       'irak',               '2026-06-22', 15, 0,  'Lincoln Financial Field, Philadelphia'],
  ['I', 'noruega',       'senegal',            '2026-06-22', 18, 0,  'MetLife Stadium, East Rutherford'],
  ['J', 'jordania',      'argelia',            '2026-06-22', 21, 0,  "Levi's Stadium, San Francisco"],

  // 23 jun
  ['K', 'portugal',      'uzbekistan',         '2026-06-23', 11, 0,  'NRG Stadium, Houston'],
  ['L', 'inglaterra',    'ghana',              '2026-06-23', 14, 0,  'Gillette Stadium, Foxborough'],
  ['L', 'panama',        'croacia',            '2026-06-23', 17, 0,  'BMO Field, Toronto'],
  ['K', 'colombia',      'congo',           '2026-06-23', 20, 0,  'Estadio Akron, Guadalajara'],

  // 24 jun – Jornada 3 (simultáneos por grupos)
  ['B', 'suiza',         'canada',             '2026-06-24', 13, 0,  'BC Place, Vancouver'],
  ['B', 'bosnia','qatar',          '2026-06-24', 13, 0,  'Lumen Field, Seattle'],
  ['C', 'marruecos',     'haiti',              '2026-06-24', 16, 0,  'Mercedes-Benz Stadium, Atlanta'],
  ['C', 'brasil',        'escocia',            '2026-06-24', 16, 0,  'Hard Rock Stadium, Miami'],
  ['A', 'sudafrica',     'coreadelsur',      '2026-06-24', 19, 0,  'Estadio BBVA, Monterrey'],
  ['A', 'republicacheca','mexico',            '2026-06-24', 19, 0,  'Estadio Azteca, Ciudad de México'],

  // 25 jun
  ['E', 'curazao',       'costa_de_marfil',    '2026-06-25', 14, 0,  'Lincoln Financial Field, Philadelphia'],
  ['E', 'ecuador',       'alemania',           '2026-06-25', 14, 0,  'MetLife Stadium, East Rutherford'],
  ['F', 'japon',         'suecia',             '2026-06-25', 17, 0,  'AT&T Stadium, Dallas'],
  ['F', 'tunez',         'paisesbajos',       '2026-06-25', 17, 0,  'Arrowhead Stadium, Kansas City'],
  ['D', 'paraguay',      'australia',          '2026-06-25', 20, 0,  "Levi's Stadium, San Francisco"],
  ['D', 'turquia',       'estadosunidos',     '2026-06-25', 20, 0,  'SoFi Stadium, Los Ángeles'],

  // 26 jun
  ['I', 'noruega',       'francia',            '2026-06-26', 13, 0,  'Gillette Stadium, Foxborough'],
  ['I', 'senegal',       'irak',               '2026-06-26', 13, 0,  'BMO Field, Toronto'],
  ['H', 'cabo_verde',    'arabiasaudita',     '2026-06-26', 18, 0,  'NRG Stadium, Houston'],
  ['H', 'uruguay',       'espana',             '2026-06-26', 18, 0,  'Estadio Akron, Guadalajara'],
  ['G', 'egipto',        'iran',               '2026-06-26', 21, 0,  'Lumen Field, Seattle'],
  ['G', 'nuevazelanda', 'belgica',            '2026-06-26', 21, 0,  'BC Place, Vancouver'],

  // 27 jun
  ['L', 'croacia',       'ghana',              '2026-06-27', 15, 0,  'Lincoln Financial Field, Philadelphia'],
  ['L', 'panama',        'inglaterra',         '2026-06-27', 15, 0,  'MetLife Stadium, East Rutherford'],
  ['K', 'colombia',      'portugal',           '2026-06-27', 17, 30, 'Hard Rock Stadium, Miami'],
  ['K', 'congo',      'uzbekistan',         '2026-06-27', 17, 30, 'Mercedes-Benz Stadium, Atlanta'],
  ['J', 'argelia',       'austria',            '2026-06-27', 20, 0,  'Arrowhead Stadium, Kansas City'],
  ['J', 'jordania',      'argentina',          '2026-06-27', 20, 0,  'AT&T Stadium, Dallas'],
]

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🏆 Iniciando seed de partidos – Fase de Grupos Mundial 2026\n')

  // 1. Crear Rounds (uno por día)
  console.log('📅 Creando jornadas...')
  const roundMap: Record<string, string> = {}

  for (const r of roundsData) {
    const startDate = new Date(`${r.date}T00:00:00.000Z`)
    const endDate   = new Date(`${r.date}T23:59:59.000Z`)

    const round = await prisma.round.upsert({
      where:  { id: `round-${r.date}` },
      update: {},
      create: {
        id:        `round-${r.date}`,
        name:      r.name,
        startDate,
        endDate,
        isActive:  false,
        sortOrder: r.sortOrder,
      },
    })

    roundMap[r.date] = round.id
    console.log(`  ✅ ${r.name}`)
  }

  // 2. Cargar mapa de equipos (slug → id)
  console.log('\n🌍 Cargando selecciones...')
  const dbTeams = await prisma.team.findMany({ select: { id: true, slug: true, name: true } })
  const teamMap: Record<string, string> = {}
  for (const t of dbTeams) teamMap[t.slug] = t.id

  const missing = matchesDef.flatMap(([, home, away]) =>
    [home, away].filter(s => !teamMap[s])
  )
  if (missing.length) {
    const unique = [...new Set(missing)]
    console.error('\n❌ Selecciones no encontradas en BD. ¿Corriste seed-teams primero?')
    console.error('   Slugs faltantes:', unique.join(', '))
    process.exit(1)
  }
  console.log(`  ✅ ${dbTeams.length} selecciones disponibles`)

  // 3. Crear partidos
  console.log('\n⚽ Creando partidos...')
  let created = 0
  let skipped = 0

  for (const [grupo, homeSlug, awaySlug, fecha, hora, min, estadio] of matchesDef) {
    const roundId    = roundMap[fecha]
    const homeTeamId = teamMap[homeSlug]
    const awayTeamId = teamMap[awaySlug]
    const kickoffUtc = utc(fecha, hora, min)

    // Clave de unicidad: roundId + homeTeamId + awayTeamId
    const existing = await prisma.match.findFirst({
      where: { roundId, homeTeamId, awayTeamId },
    })

    if (existing) {
      console.log(`  ⏭️  Ya existe: ${homeSlug} vs ${awaySlug} (${fecha})`)
      skipped++
      continue
    }

    await prisma.match.create({
      data: {
        roundId,
        homeTeamId,
        awayTeamId,
        kickoffUtc,
        stadium: estadio,
        status:  'NS',
      },
    })

    const kickoffMex = new Date(kickoffUtc.getTime() - 6 * 3_600_000)
    const timeStr = kickoffMex.toISOString().slice(11, 16)
    console.log(`  ✅ [Grupo ${grupo}] ${homeSlug} vs ${awaySlug} – ${fecha} ${timeStr} MEX`)
    created++
  }

  // 4. Resumen
  console.log('\n─────────────────────────────────────────')
  console.log(`✨ Seed completado!`)
  console.log(`   Partidos creados : ${created}`)
  console.log(`   Ya existían       : ${skipped}`)
  console.log(`   Total en BD       : ${await prisma.match.count()} partidos`)
  console.log(`   Rondas en BD      : ${await prisma.round.count()} jornadas`)
}

main()
  .catch((e) => {
    console.error('❌ Error inesperado:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
