import type { Lang } from '@/lib/lang'

/**
 * The terms that get a marker highlight and a pointer-following card in the
 * profile blurb. Keyed by the word as it appears in the English text; the
 * Thai text marks the same terms by their Thai spelling.
 *
 * Thai lines are drafts.  // TODO(th-review)
 */
export const glossary: Record<string, Record<Lang, string>> = {
  'web apps': {
    en: 'Next.js and Supabase, mostly: the stack behind PDLite, Doodee Future and this site.',
    th: 'ส่วนใหญ่คือ Next.js กับ Supabase สแตกเบื้องหลัง PDLite, Doodee Future และเว็บนี้',
  },
  CTF: {
    en: 'Capture the Flag: timed security challenges. My roles in a team are networking and web exploitation.',
    th: 'Capture the Flag: โจทย์ความปลอดภัยแข่งกับเวลา บทบาทของผมในทีมคือเน็ตเวิร์กและเจาะเว็บ',
  },
  pentesting: {
    en: 'Authorised attacks on a system to find what an attacker would, then writing it up so it gets fixed.',
    th: 'การโจมตีระบบโดยได้รับอนุญาต เพื่อหาสิ่งที่ผู้โจมตีจะเจอ แล้วเขียนรายงานให้ถูกแก้',
  },
  '3D': {
    en: 'Fusion 360 for parts that get printed, three.js for parts that get rendered.',
    th: 'Fusion 360 สำหรับชิ้นส่วนที่พิมพ์ออกมา และ three.js สำหรับสิ่งที่เรนเดอร์บนเว็บ',
  },
}
