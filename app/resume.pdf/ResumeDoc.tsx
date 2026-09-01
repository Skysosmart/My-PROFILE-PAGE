import path from 'node:path'
import { Document, Font, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { SITE } from '@/lib/site'
import {
  cvAwards,
  cvIdentity,
  cvProjects,
  cvSkills,
  cvTraining,
  firstSentence,
  shortTitle,
} from '@/lib/resume'

/**
 * The CV as a React PDF tree. One A4 page: identity across the top, then
 * projects and skills down the wide left column and awards, training and
 * education down the narrow right one. Same two faces as the site - block
 * mono for labels, the grotesk for reading - so it is recognisably the same
 * document as the page it came from.
 */

const font = (file: string) => path.join(process.cwd(), 'assets/fonts', file)
Font.register({
  family: 'Mono',
  fonts: [
    { src: font('JetBrainsMono-Regular.ttf'), fontWeight: 400 },
    { src: font('JetBrainsMono-Medium.ttf'), fontWeight: 500 },
    { src: font('JetBrainsMono-Bold.ttf'), fontWeight: 700 },
  ],
})
Font.register({
  family: 'Sans',
  fonts: [
    { src: font('SpaceGrotesk-Regular.ttf'), fontWeight: 400 },
    { src: font('SpaceGrotesk-Medium.ttf'), fontWeight: 500 },
    { src: font('SpaceGrotesk-Bold.ttf'), fontWeight: 700 },
  ],
})
// no hyphenation: a URL or a project name split across lines reads as two
Font.registerHyphenationCallback((w) => [w])

const INK = '#111111'
const DIM = '#6b6b6b'
const RULE = '#d9d9d9'

// lineHeight is resolved to points where it is declared and inherited as
// that absolute value - so the page's 1.32 is 11pt everywhere, and any text
// larger than the body size must declare its own or overlap the next line
const s = StyleSheet.create({
  page: { padding: '34 40 30 40', fontFamily: 'Sans', fontSize: 9, color: INK, lineHeight: 1.34 },
  // header
  name: { fontSize: 21, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.15 },
  handle: { fontFamily: 'Mono', fontSize: 7.4, color: DIM, marginTop: 2, letterSpacing: 0.3 },
  contact: { fontFamily: 'Mono', fontSize: 7.2, textAlign: 'right', lineHeight: 1.5 },
  link: { color: INK, textDecoration: 'none' },
  stats: { fontFamily: 'Mono', fontSize: 7, color: DIM, marginTop: 8 },
  rule: { borderBottomWidth: 0.8, borderBottomColor: INK, marginTop: 6 },
  summary: { marginTop: 8, fontSize: 8.8, lineHeight: 1.4 },
  // columns
  cols: { flexDirection: 'row', marginTop: 10, gap: 18 },
  left: { flex: 62 },
  right: { flex: 38 },
  h: {
    fontFamily: 'Mono',
    fontSize: 7.2,
    fontWeight: 700,
    letterSpacing: 1.6,
    color: INK,
    borderBottomWidth: 0.5,
    borderBottomColor: RULE,
    paddingBottom: 3,
    marginBottom: 6,
  },
  hSpaced: { marginTop: 11 },
  // project
  proj: { marginBottom: 7 },
  projTop: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  projTitle: { fontSize: 10, fontWeight: 700, lineHeight: 1.3 },
  projMeta: { fontFamily: 'Mono', fontSize: 6.6, color: DIM, letterSpacing: 0.2 },
  projLine: { marginTop: 1.5 },
  projFact: { fontFamily: 'Mono', fontSize: 6.6, color: DIM, marginTop: 1.5 },
  projLinks: { fontFamily: 'Mono', fontSize: 6.6, marginTop: 1.5, flexDirection: 'row', gap: 10 },
  // right column rows
  row: { marginBottom: 4.5 },
  rowTitle: { fontWeight: 500 },
  rowSub: { fontFamily: 'Mono', fontSize: 6.5, color: DIM, marginTop: 0.5 },
  skill: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 3 },
  skillKey: { fontFamily: 'Mono', fontSize: 6.4, color: DIM, letterSpacing: 0.4, width: 78, paddingTop: 2 },
  // footer
  foot: {
    position: 'absolute',
    left: 40,
    right: 40,
    bottom: 18,
    fontFamily: 'Mono',
    fontSize: 6.2,
    color: DIM,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})

const host = SITE.replace(/^https?:\/\//, '')
const bare = (u: string) => u.replace(/^https?:\/\//, '').replace(/\/$/, '')

export function ResumeDoc({ built }: { built: string }) {
  const me = cvIdentity
  return (
    <Document
      title={`${me.name} - CV`}
      author={me.name}
      subject={`${me.role}. Generated from ${host}`}
      creator={host}
      producer={host}
    >
      <Page size="A4" style={s.page}>
        {/* ---- header ------------------------------------------------------ */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={s.name}>{me.name}</Text>
            <Text style={s.handle}>
              {me.handle} · {me.role.toUpperCase()}
            </Text>
          </View>
          <View style={s.contact}>
            <Link src={`mailto:${me.email}`} style={s.link}>
              {me.email}
            </Link>
            <Link src={`https://${me.github}`} style={s.link}>
              {me.github}
            </Link>
            <Link src={SITE} style={s.link}>
              {host}
            </Link>
          </View>
        </View>
        <View style={s.rule} />
        <Text style={s.summary}>{me.summary}</Text>
        <Text style={s.stats}>{me.stats}</Text>

        <View style={s.cols}>
          {/* ---- projects ------------------------------------------------ */}
          <View style={s.left}>
            <Text style={s.h}>PROJECTS</Text>
            {cvProjects.map((p) => (
              <View key={p.title} style={s.proj} wrap={false}>
                <View style={s.projTop}>
                  <Text style={s.projTitle}>{shortTitle(p.title)}</Text>
                  <Text style={s.projMeta}>
                    {p.role.toUpperCase()} · {p.period}
                  </Text>
                </View>
                <Text style={s.projLine}>{firstSentence(p.description)}</Text>
                {p.contribution && <Text style={s.projFact}>{p.contribution}</Text>}
                {(p.demo || p.repo) && (
                  <View style={s.projLinks}>
                    {p.demo && (
                      <Link src={p.demo} style={s.link}>
                        {bare(p.demo)}
                      </Link>
                    )}
                    {p.repo && (
                      <Link src={p.repo} style={s.link}>
                        {bare(p.repo)}
                      </Link>
                    )}
                  </View>
                )}
              </View>
            ))}
            <Text style={[s.projFact, { marginTop: 2 }]}>
              More projects, with screenshots and per-repo commit counts, at {host}
            </Text>

            <Text style={[s.h, s.hSpaced]}>SKILLS</Text>
            {cvSkills.map((g) => (
              <View key={g.key} style={s.skill}>
                <Text style={s.skillKey}>{g.key.toUpperCase()}</Text>
                <Text style={{ flex: 1 }}>{g.value}</Text>
              </View>
            ))}
          </View>

          {/* ---- awards / training / education --------------------------- */}
          <View style={s.right}>
            <Text style={s.h}>AWARDS</Text>
            {cvAwards.map((c) => (
              <View key={c.file} style={s.row} wrap={false}>
                <Text style={s.rowTitle}>{c.title}</Text>
                <Text style={s.rowSub}>
                  {c.result} · {c.issuer}
                  {c.date ? ` · ${c.date}` : ''}
                </Text>
              </View>
            ))}

            <Text style={[s.h, s.hSpaced]}>SECURITY TRAINING</Text>
            {cvTraining.map((c) => (
              <View key={c.file} style={s.row} wrap={false}>
                <Text style={s.rowTitle}>{c.title}</Text>
                <Text style={s.rowSub}>
                  {c.issuer}
                  {c.date ? ` · ${c.date}` : ''}
                </Text>
              </View>
            ))}

            <Text style={[s.h, s.hSpaced]}>EDUCATION</Text>
            <View style={s.row}>
              <Text style={s.rowTitle}>{me.school}</Text>
              <Text style={s.rowSub}>{me.activity}</Text>
            </View>
          </View>
        </View>

        <View style={s.foot} fixed>
          <Text>generated from {host} · every entry above is on the site at full length</Text>
          <Text>{built}</Text>
        </View>
      </Page>
    </Document>
  )
}
