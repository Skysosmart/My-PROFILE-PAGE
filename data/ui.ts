import type { Lang } from '@/lib/lang'

/**
 * Interface strings, in both languages. Content (bio, projects, story) lives
 * in data/portfolio.ts as { en, th } pairs; this file is only the chrome:
 * labels, buttons, hints, empty states.
 *
 * Thai lines are drafts, marked for review.  // TODO(th-review)
 */
/** a quick-start step: one reading, or one per pointer, plus where it points */
export type Step = {
  text?: string
  /** with a mouse or trackpad (and the default) */
  fine?: string
  /** with a finger */
  coarse?: string
  /** the section it jumps to */
  to?: string
}

const en = {
  hero: {
    scroll: 'Scroll to explore',
    // The prompt cue prints as `$ scroll <this> ▋`. The verb is a binary name
    // and stays latin in IntroHero; this is the long option it runs with, and
    // it is the half that carries the meaning - so it is the half that
    // translates. `scroll` above stays the whole sentence regardless: the
    // other cues set it, and the prompt reads it out to a screen reader,
    // which gains nothing from a sigil and a half-block.
    scrollOpt: '--explore',
    line1: 'I build it.',
    line2: 'I break it.',
    line3: 'Then I ship it.',
    bubble: "Hi, I'm Sky.",
    role: 'role',
  },
  stats: {
    certificates: 'certificates',
    gold: 'gold medals',
    national: 'national awards',
    international: 'international',
    projects: 'projects',
  },
  // the spec label: the keys are pre-printed, the values come from the data
  profile: {
    label: 'system_profile',
    model: 'model',
    rev: 'rev',
    type: 'type',
    core: 'core',
    input: 'input',
    output: 'output',
    rating: 'rating',
    origin: 'origin',
    status: 'status',
    serial: 's/n',
    madeIn: 'made in Thailand',
    quickStart: 'quick start',
    steps: [
      {
        fine: 'Move the cursor. The orb, the duck and the torus lean after it.',
        coarse: 'Tilt the phone. The orb, the duck and the torus lean with it; a finger on the orb makes ripples.',
      },
      { text: 'The terminal takes commands: `help`, `sop`, `resume`. Type them, or tap the chips. `boot` starts a real Linux in the tab.', to: 'about' },
      { text: 'Pick a skill for its level and the projects it shipped on.', to: 'skills' },
      { text: 'Open a certificate. The archive holds all {n}.', to: 'certificates' },
      { fine: 'Scroll over the film to change project.', coarse: 'Swipe across the film to change project.', to: 'projects' },
      {
        fine: 'Press `Ctrl` `K` and type a section to jump there. `lang th` works there too.',
        coarse: 'Tap the prompt at the top and type a section to jump there. `lang th` works there too.',
      },
      { text: 'The QR on the label opens the CV. `?boot=1` on the address replays the boot.' },
    ] as Step[],
    scanCv: 'scan for the résumé (PDF)',
    marks: {
      ctf: 'tested under attack',
      print: 'parts that print',
      lang: 'bilingual, TH / EN',
      reuse: 'reusable components',
    },
  },
  about: { readMore: 'Read more', readLess: 'Read less' },
  education: {
    label: 'education',
    chapter: 'chapter',
    present: 'present',
    focus: 'focus',
    achievements: 'achievements',
    signals: '{n} certificates from these years',
    none: 'before the certificates started',
    intro: 'Not a list of schools. The points where the direction changed, and what each stretch was made of.',
    signalsShort: 'signals',
    focusShort: 'focus',
  },
  skills: {
    label: 'skills',
    title: 'Skill Inventory',
    hint: 'pick a skill',
    level: 'level',
    used: 'used in {n} projects',
    usedOne: 'used in 1 project',
    unused: 'not on a project yet',
    intro: '{n} skills in {g} groups. The levels are my own call; the project counts are not, they are read off the projects.',
    keys: '↑ ↓ rows · ← → groups',
  },
  certs: {
    explore: 'Explore all {n} certificates',
    more: '+{n} more',
    records: 'records',
  },
  projects: { demo: 'live demo', source: 'source' },
  writeups: {
    title: 'CTF & Security Writeups',
    teaser: 'Three newest. Full list on /writeups.',
    all: 'All writeups',
    back: 'back',
    empty: 'The first writeup is being written. Check back after the next CTF.',
    draft: 'draft',
    minutes: '{n} min read',
  },
  personal: {
    label: 'personal',
    title1: 'This is where',
    title2: 'it gets personal.',
    hint: 'drag the print, or pick one below',
  },
  ending: {
    label: 'contact',
    title1: "You've reached the end.",
    title2: 'Or the beginning.',
    mail: 'mail me',
    meet: 'meet me in',
    find: 'or find me on',
    resume: 'download resume',
  },
  form: {
    name: 'your name',
    email: 'your email',
    message: 'message',
    send: 'send',
    sending: 'sending',
    sent: 'Sent. I read everything, expect a reply.',
    failed: 'Could not send. Mail me directly instead.',
    tooFast: 'That was quick. Give it a second and send again.',
    tooMany: 'Too many messages from here for now. Try again later.',
    invalid: 'Fill in a name, a real email and a message.',
  },
  footer: {
    based: 'Thailand based',
    rendered: 'rendered in ASCII',
  },
  nav: { noSuch: 'no such section', hint: 'lang en | th' },
}

export type UI = typeof en

// TODO(th-review): every string below is a draft for Sky to proofread
const th: UI = {
  hero: {
    scroll: 'เลื่อนลงเพื่อสำรวจ',
    // a Thai option on a latin command: no real shell takes one, but this
    // shell is Sky's, and a Thai reader should not be left with only `scroll`
    scrollOpt: '--สำรวจ',
    line1: 'ผมสร้างมันขึ้นมา',
    line2: 'แล้วลองเจาะมันดู',
    line3: 'ก่อนจะปล่อยของจริง',
    bubble: 'สวัสดี ผมสกายเอง',
    role: 'บทบาท',
  },
  stats: {
    certificates: 'ใบประกาศ',
    gold: 'เหรียญทอง',
    national: 'รางวัลระดับชาติ',
    international: 'นานาชาติ',
    projects: 'โปรเจกต์',
  },
  profile: {
    label: 'system_profile',
    model: 'รุ่น',
    rev: 'รีวิชัน',
    type: 'ประเภท',
    core: 'แกนหลัก',
    input: 'อินพุต',
    output: 'เอาต์พุต',
    rating: 'เรตติ้ง',
    origin: 'แหล่งผลิต',
    status: 'สถานะ',
    serial: 'S/N',
    madeIn: 'ผลิตในประเทศไทย',
    // TODO(th-review)
    quickStart: 'เริ่มต้นใช้งาน',
    steps: [
      {
        fine: 'ขยับเมาส์ ลูกแก้ว เป็ด และทอรัสจะเอียงตาม',
        coarse: 'เอียงโทรศัพท์ ลูกแก้ว เป็ด และทอรัสจะเอียงตาม แตะลูกแก้วแล้วลากจะเกิดคลื่น',
      },
      { text: 'เทอร์มินัลรับคำสั่ง `help`, `sop`, `resume` พิมพ์เอง หรือแตะปุ่มก็ได้ ส่วน `boot` จะบูต Linux จริง ๆ ในแท็บ', to: 'about' },
      { text: 'เลือกทักษะเพื่อดูระดับ และโปรเจกต์ที่ใช้ทักษะนั้น', to: 'skills' },
      { text: 'เปิดใบประกาศดูได้ ในคลังมีครบทั้ง {n} ใบ', to: 'certificates' },
      { fine: 'เลื่อนล้อเมาส์บนฟิล์มเพื่อเปลี่ยนโปรเจกต์', coarse: 'ปัดบนฟิล์มเพื่อเปลี่ยนโปรเจกต์', to: 'projects' },
      {
        fine: 'กด `Ctrl` `K` แล้วพิมพ์ชื่อส่วนเพื่อกระโดดไป `lang en` ก็ใช้ตรงนั้นได้',
        coarse: 'แตะช่องพิมพ์ด้านบน แล้วพิมพ์ชื่อส่วนเพื่อกระโดดไป `lang en` ก็ใช้ตรงนั้นได้',
      },
      { text: 'สแกน QR บนฉลากเพื่อเปิด CV ใส่ `?boot=1` ท้ายที่อยู่เว็บเพื่อดูหน้าบูตอีกครั้ง' },
    ] as Step[],
    scanCv: 'สแกนเพื่อดูเรซูเม่ (PDF)',
    marks: {
      ctf: 'ผ่านการทดสอบเจาะระบบ',
      print: 'ชิ้นส่วนพิมพ์ 3D ได้',
      lang: 'สองภาษา ไทย / อังกฤษ',
      reuse: 'คอมโพเนนต์ใช้ซ้ำได้',
    },
  },
  about: { readMore: 'อ่านต่อ', readLess: 'ย่อ' },
  education: {
    label: 'การศึกษา',
    chapter: 'บทที่',
    present: 'ปัจจุบัน',
    focus: 'โฟกัส',
    achievements: 'ผลงาน',
    signals: 'ใบประกาศ {n} ใบจากช่วงนี้',
    none: 'ก่อนจะเริ่มเก็บใบประกาศ',
    intro: 'ไม่ใช่รายชื่อโรงเรียน แต่เป็นจุดที่ทิศทางเปลี่ยน และแต่ละช่วงประกอบขึ้นจากอะไร',
    signalsShort: 'สัญญาณ',
    focusShort: 'โฟกัส',
  },
  skills: {
    label: 'ทักษะ',
    title: 'คลังทักษะ',
    hint: 'เลือกทักษะ',
    level: 'ระดับ',
    used: 'ใช้ใน {n} โปรเจกต์',
    usedOne: 'ใช้ใน 1 โปรเจกต์',
    unused: 'ยังไม่ได้ใช้ในโปรเจกต์',
    intro: 'ทักษะ {n} อย่างใน {g} กลุ่ม ระดับคือผมประเมินเอง ส่วนจำนวนโปรเจกต์นับจากโปรเจกต์จริง',
    keys: '↑ ↓ เลื่อนแถว · ← → เปลี่ยนกลุ่ม',
  },
  certs: {
    explore: 'ดูใบประกาศทั้งหมด {n} ใบ',
    more: 'อีก {n} ใบ',
    records: 'รายการ',
  },
  projects: { demo: 'ดูเว็บจริง', source: 'ซอร์สโค้ด' },
  writeups: {
    title: 'บันทึก CTF และความปลอดภัย',
    teaser: 'สามเรื่องล่าสุด ดูทั้งหมดได้ที่ /writeups',
    all: 'บันทึกทั้งหมด',
    back: 'กลับ',
    empty: 'กำลังเขียนบันทึกเรื่องแรกอยู่ กลับมาดูหลัง CTF ครั้งหน้า',
    draft: 'ฉบับร่าง',
    minutes: 'อ่าน {n} นาที',
  },
  personal: {
    label: 'ส่วนตัว',
    title1: 'ตรงนี้คือ',
    title2: 'เรื่องส่วนตัวล้วน ๆ',
    hint: 'ลากรูป หรือเลือกจากด้านล่าง',
  },
  ending: {
    label: 'ติดต่อ',
    title1: 'คุณมาถึงตอนจบแล้ว',
    title2: 'หรืออาจเป็นจุดเริ่มต้น !?',
    mail: 'ส่งเมลหาผม',
    meet: 'เจอกันได้ที่',
    find: 'หรือตามหาผมได้ที่',
    resume: 'ดาวน์โหลดเรซูเม่',
  },
  form: {
    name: 'ชื่อของคุณ',
    email: 'อีเมลของคุณ',
    message: 'ข้อความ',
    send: 'ส่ง',
    sending: 'กำลังส่ง',
    sent: 'ส่งแล้ว ผมอ่านทุกข้อความ เดี๋ยวตอบกลับครับ',
    failed: 'ส่งไม่สำเร็จ ลองส่งเมลหาผมโดยตรงแทน',
    tooFast: 'เร็วไปนิด รอสักครู่แล้วส่งอีกครั้ง',
    tooMany: 'ส่งข้อความจากที่นี่บ่อยเกินไป ลองใหม่ภายหลัง',
    invalid: 'กรอกชื่อ อีเมลจริง และข้อความให้ครบ',
  },
  footer: {
    based: 'อยู่ประเทศไทย',
    rendered: 'เรนเดอร์ด้วย ASCII',
  },
  nav: { noSuch: 'ไม่พบส่วนนี้', hint: 'lang en | th' },
}

export const ui: Record<Lang, UI> = { en, th }

/** Fill {n}-style holes. */
export const fmt = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))
