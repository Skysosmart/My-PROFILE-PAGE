import type { Lang } from '@/lib/lang'

/**
 * Interface strings, in both languages. Content (bio, projects, story) lives
 * in data/portfolio.ts as { en, th } pairs; this file is only the chrome:
 * labels, buttons, hints, empty states.
 *
 * Thai lines are drafts, marked for review.  // TODO(th-review)
 */
const en = {
  hero: {
    loaded: 'Player Loaded',
    scroll: 'Scroll to explore',
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
    projects: 'projects',
  },
  profile: {
    label: 'system_profile',
    location: 'location & region',
    status: 'status',
    roles: 'roles',
    stack: 'stack',
    mbti: 'MBTI',
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
  },
  skills: {
    label: 'skills',
    title: 'Skill Inventory',
    hint: 'pick a skill',
    level: 'level',
    used: 'used in {n} projects',
    usedOne: 'used in 1 project',
    unused: 'not on a project yet',
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
    hint: 'click a card to open its album',
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
  nav: { noSuch: 'no such section', hint: 'theme light | dark | system · lang en | th' },
}

export type UI = typeof en

// TODO(th-review): every string below is a draft for Sky to proofread
const th: UI = {
  hero: {
    loaded: 'โหลดผู้เล่นแล้ว',
    scroll: 'เลื่อนลงเพื่อสำรวจ',
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
    projects: 'โปรเจกต์',
  },
  profile: {
    label: 'system_profile',
    location: 'ที่อยู่',
    status: 'สถานะ',
    roles: 'บทบาท',
    stack: 'เครื่องมือ',
    mbti: 'MBTI',
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
  },
  skills: {
    label: 'ทักษะ',
    title: 'คลังทักษะ',
    hint: 'เลือกทักษะ',
    level: 'ระดับ',
    used: 'ใช้ใน {n} โปรเจกต์',
    usedOne: 'ใช้ใน 1 โปรเจกต์',
    unused: 'ยังไม่ได้ใช้ในโปรเจกต์',
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
    hint: 'แตะการ์ดเพื่อเปิดอัลบั้ม',
  },
  ending: {
    label: 'ติดต่อ',
    title1: 'คุณมาถึงตอนจบแล้ว',
    title2: 'หรืออาจเป็นจุดเริ่มต้น',
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
  nav: { noSuch: 'ไม่พบส่วนนี้', hint: 'theme light | dark | system · lang en | th' },
}

export const ui: Record<Lang, UI> = { en, th }

/** Fill {n}-style holes. */
export const fmt = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))
