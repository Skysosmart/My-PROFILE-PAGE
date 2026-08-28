/**
 * ============================================================================
 *  NONTHANAPHONG.EXE — content
 *  Single source of content for the whole site. Edit the text/values below and
 *  the site updates. Placeholders you should replace are marked  // TODO.
 * ============================================================================
 */

/* ---------------------------------------------------------------------------
 *  PLAYER — top-level identity (boot log, header brand, browser tab)
 * ------------------------------------------------------------------------- */
export const player = {
  name: 'Nonthanaphong Saechua',
  firstName: 'Nonthanaphong', // TODO
  lastName: 'Saechua', // TODO
  handle: 'NONTHANAPHONG.EXE',
  role: 'Full-Stack Dev · Pentester · 3D & Graphic Designer',
  tagline: 'Academic Portfolio',
  // Rotating roles shown in the bottom-left ticker (switches every 5s).
  roles: ['Full-Stack Developer', 'Penetration Tester', '3D Designer', 'Graphic Designer'],
  bootLog: [
    'SYSTEM BOOTING...',
    'LOADING ASCII WORLD...',
    'MOUNTING /academic/profile ...',
    'PLAYER FOUND: NONTHANAPHONG SAECHUA',
    'MISSION TYPE: ACADEMIC PORTFOLIO',
    'RENDER ENGINE: ASCII v1.0  [ OK ]',
    'ALL SYSTEMS NOMINAL.',
  ],
}

/* ---------------------------------------------------------------------------
 *  NAV — header links (id must match each <section id>)
 * ------------------------------------------------------------------------- */
export const nav = [
  { label: 'ABOUT', id: 'about' },
  { label: 'CERTIFICATES', id: 'certificates' },
  { label: 'PROJECTS', id: 'projects' },
  { label: 'CONTACT', id: 'contact' },
] as const

/* ---------------------------------------------------------------------------
 *  ABOUT ME
 * ------------------------------------------------------------------------- */
export const about = {
  paragraphs: [
    "I'm Nonthanaphong Saechua — a full-stack developer and penetration tester who also works in 3D and graphic design. I build things end to end: shipping web apps, breaking them to make them safer, and designing how they look and feel.",
    'From robotics competitions to CTF boot camps and AI courses, I learn by building and testing. This portfolio brings together who I am, the certificates I have earned, the projects I have worked on, and how to reach me.',
  ],
  // TODO: tweak these details.
  facts: [
    { key: 'ROLE', value: 'Full-Stack Dev · Pentester' },
    { key: 'CRAFT', value: '3D Design · Graphic Design' },
    { key: 'STACK', value: 'Next.js · TypeScript · Python' }, // TODO: your stack
    { key: 'LOCATION', value: 'Thailand' }, // TODO
    { key: 'STATUS', value: 'Open to opportunities' },
  ],
}

/* ---------------------------------------------------------------------------
 *  SOP — Statement of Purpose. `shortCount` paragraphs show before "Read more".
 * ------------------------------------------------------------------------- */
export const sop = {
  shortCount: 2,
  paragraphs: [
    `Since childhood, I wasn't a top student or particularly outstanding. My grades were consistently at the bottom of the class almost every year. That changed when I first touched a computer, and the game that sparked my interest in technology was Roblox. That was the turning point that transformed me from an insecure child into someone genuinely passionate about the digital world. Roblox made me feel like I could "create something" for the first time in my life.`,
    `From there, I began experimenting with coding, playing with plugins, and gradually exploring backend systems. I started to see how vast the world of technology is and how much more there is to learn. I've tried many fields—Game Development, Robotics, and even Electronics—but ultimately felt they weren't my true passion. That is, until I discovered the world of Cyber Security and CTF.`,
    `That was the pivotal moment for me. It was the first time I felt "This is what I want to wake up and do every day." Solving challenges, analyzing systems, thinking systematically, and the feeling of successfully exploiting vulnerabilities was something I'd never experienced in other fields. It made me realize I wanted to pursue this seriously, not just as a hobby.`,
    `During high school, I had opportunities to compete in various competitions and was honored to become an ACT Brand Ambassador as a Content Creator. This role helped me develop my communication and presentation skills significantly. I believe a good engineer isn't just "technically skilled" but must also "be able to explain things so others can understand." This role boosted my confidence in leadership, communication, and teamwork.`,
    `I've also worked on many projects, from Web Development, Full Stack, APIs, and Automation, including experimenting with simple tools for system penetration and vulnerability testing in a student-appropriate way. I love the feeling of solving difficult problems and I'm passionate about endless self-learning, especially in Cybersecurity where everything is constantly evolving.`,
    `What I want next is a strong engineering foundation in Network, Computer Systems, Algorithms, Software, Infrastructure, and Security. These are essential if I want to advance in Cyber Security, Digital Forensics, Penetration Testing, or even become a Security Researcher in the future.`,
    `I didn't grow from intelligence or talent, but from persistence, genuine interest, and constantly finding ways to learn on my own. I'm looking for an environment that pushes me to grow both in engineering and in creating digital innovations, so I can reach my goal of becoming a Cyber Security engineer with the capabilities to benefit society in the future.`,
  ],
}

/* ---------------------------------------------------------------------------
 *  INSPIRATION — the principles that drive the work. Printed by the
 *  `inspiration` command in the About terminal.
 *  icon: 'lightbulb' | 'heart' | 'target' | 'zap'
 * ------------------------------------------------------------------------- */
export const inspiration = [
  {
    icon: 'zap',
    title: 'Persistence Over Talent',
    description:
      'I spent most of school at the bottom of my class. Everything I can do now came from staying with problems longer than I wanted to, not from being naturally good at them.',
  },
  {
    icon: 'target',
    title: 'Build It, Then Break It',
    description:
      'I write applications and then attack them. Learning to find a vulnerability taught me more about how a system actually works than building it ever did on its own.',
  },
  {
    icon: 'lightbulb',
    title: "Explain It Or You Don't Know It",
    description:
      'A good engineer is not only technically skilled — they can make someone else understand. Presenting as an ACT Brand Ambassador forced me to turn what I knew into something people could follow.',
  },
  {
    icon: 'heart',
    title: 'Finish What You Start',
    description:
      'PDLite took months of iteration before it won anything, and my MakeX robot took six. The work that counts is what happens after the idea stops being exciting.',
  },
] as const

/* ---------------------------------------------------------------------------
 *  PROJECTS — competition and coursework builds, strongest first.
 *  status: 'Completed' | 'In Progress' | 'Upcoming'
 * ------------------------------------------------------------------------- */
export const projects = [
  {
    title: "PDLite — Parkinson's Risk Screening Device",
    period: '2026',
    role: 'Web & Database / Device Design',
    status: 'Completed',
    description:
      'A device that gives a preliminary Parkinson\'s disease risk assessment. Built the Next.js and Supabase web app that records readings and charts them back, and designed the enclosure and its mechanism in Fusion 360 for 3D printing. Awarded gold at the NRCT Thailand New Gen Inventors Award 2026 and gold again at SWU Researcher Day 2026.',
    tags: ['Next.js', 'Supabase', 'Chart.js', 'Fusion 360', 'Gold Medal'],
  },
  {
    title: 'T-GODA — Accommodation Booking Platform',
    period: '2026',
    role: 'Frontend Developer',
    status: 'Completed',
    description:
      'An Agoda-style booking platform built for the CODEKIT Web Development Competition at the Thailand Robot & Coding Challenge 2026. Owned the entire frontend — landing page, responsive layout across screen sizes, and the navigation tying every page together. Placed 3rd at national level.',
    tags: ['Frontend', 'UI Design', 'Responsive', '3rd Place'],
  },
  {
    title: 'Nexus — Chat Web Application',
    period: '2026',
    role: 'Frontend Developer',
    status: 'Completed',
    description:
      'A Discord-style chat application from the same CODEKIT competition. Built the landing page, the sign-up and login flow, and more than twenty core functions — an exercise in taking apart a large platform and rebuilding it into something that actually works.',
    tags: ['Frontend', 'Auth Flow', 'UI Design', 'Web App'],
  },
  {
    title: 'Hackathon Digitize — Asset Declaration Data',
    period: '2025',
    role: 'Data Engineering',
    status: 'Completed',
    description:
      'An anti-corruption entry run by TIJ and the Anti-Corruption Organization of Thailand. Turned scanned NACC asset-declaration filings into structured, queryable records through a Python extraction pipeline using OCR, vision models, and a trained NER model.',
    tags: ['Python', 'OCR', 'NER', 'Data Pipeline'],
  },
  {
    title: 'MakeX Challenger Competition Robot',
    period: '2025',
    role: 'Structural Designer',
    status: 'Completed',
    description:
      'Designed the full robot structure in Fusion 360 across six months for the MakeX Challenger international tournament, building for disc-shooting and block-gripping missions over five arenas. Placed 3rd and took the Best Favourite Alliance Team Award.',
    tags: ['Fusion 360', 'Robotics', '3D Design', '3rd Place'],
  },
  {
    title: 'This Portfolio Site',
    period: '2026',
    role: 'Designer / Developer',
    status: 'Completed',
    description:
      'An ASCII and terminal themed portfolio built in Next.js with WebGL effects, collecting the certificates, projects, and writing on this page.',
    tags: ['Next.js', 'TypeScript', 'WebGL', 'Design'],
  },
]

/* ---------------------------------------------------------------------------
 *  CERTIFICATES — real images in /public/certificates.
 *  `featured: true` shows the card in the top grid; the rest appear under
 *  "View all". Edit titles freely; `file` is the image name in the folder.
 * ------------------------------------------------------------------------- */
export type Certificate = { title: string; issuer: string; file: string; featured?: boolean }

export const certificates: Certificate[] = [
  // ----- Featured -----
  { title: 'Gold Medal — Thailand New Gen Inventors Award 2026', issuer: 'National Research Council of Thailand', file: 'IMG_3232.JPG', featured: true },
  { title: 'Gold Medal — Invention & Innovation (PDLite)', issuer: 'SWU Researcher Day 2026', file: 'IMG_3228.JPG', featured: true },
  { title: 'MakeX — Ultimate Winner', issuer: 'MakeX Robotics', file: 'MakeX Ultimate winner.jpg', featured: true },
  { title: 'CTF Boot Camp', issuer: 'NCSA', file: 'NCSA-CTF boot camp.jpg', featured: true },
  { title: 'Network Defense Essentials (NDE)', issuer: 'EC-Council', file: 'EC_Councils-NDE.jpg', featured: true },
  { title: 'Ethical Hacking Essentials (EHE)', issuer: 'EC-Council', file: 'EC_Councils-EHE.jpg', featured: true },
  { title: 'AI Powered', issuer: 'KMITL', file: 'KMITL-AI powered.jpg', featured: true },
  { title: 'AI & Digital Twin', issuer: 'Kasetsart University', file: 'KU-AI and Digital twin.jpg', featured: true },
  { title: 'STEM & Robotics', issuer: 'MU IGNITE', file: 'MUIGNITE-STEM and robotic.jpg', featured: true },
  { title: 'Cyber Ant', issuer: 'KMUTT', file: 'KMUTT-Cyber ant.jpg', featured: true },
  { title: 'Python & Data Analytics', issuer: 'CU MOOC', file: 'CUMOOC-Python and data analytic.jpg', featured: true },
  { title: 'Python Battle', issuer: 'SWU', file: 'SWU-Python bttle.jpg', featured: true },

  // ----- The rest (shown under "View all") -----
  { title: 'MakeX — Qualification', issuer: 'MakeX Robotics', file: 'MakeX Qualification.jpg' },
  { title: 'MakeX — Warmup', issuer: 'MakeX Robotics', file: 'MakeX Warmup.jpg' },
  { title: 'MakeX — Tournament 1', issuer: 'MakeX Robotics', file: 'MakeX tournament 1.jpg' },
  { title: 'MakeX — Tournament 2', issuer: 'MakeX Robotics', file: 'MakeX tournament 2.jpg' },
  { title: 'MakeX — Tournament 3', issuer: 'MakeX Robotics', file: 'MakeX tournament 3.jpg' },
  { title: 'MakeX — Tournament 4', issuer: 'MakeX Robotics', file: 'MakeX tournament 4.jpg' },
  { title: 'BOTNOI', issuer: 'KMITL', file: 'KMITL-BOTNOI.jpg' },
  { title: 'CiRA COM Camp', issuer: 'KMITL', file: 'KMITL-CiRA COM CAMP.jpg' },
  { title: 'Science & Physics', issuer: 'KMITL', file: 'KMITL-Sci and Physic.jpg' },
  { title: 'Typhoon', issuer: 'KMITL', file: 'KMITL-typhoon.jpg' },
  { title: 'AI Driven', issuer: 'KMUTNB', file: 'KMUTNB-AI driven.jpg' },
  { title: 'Basic Python', issuer: 'KMUTNB', file: 'KMUTNB-Basic python test.jpg' },
  { title: 'Thailand Robot & Coding 2025 — Python Competition, Top 24', issuer: 'Kasetsart University', file: 'KU-Thailand Robot and Coding.jpg' },
  { title: 'Basic Big Data', issuer: 'Mahidol University', file: 'MU-Basic big data.jpg' },
  { title: 'Basic Prompt', issuer: 'Mahidol University', file: 'MU-Basic prompt.jpg' },
  { title: 'MU — CC', issuer: 'Mahidol University', file: 'MU-CC.jpg' },
  { title: 'MU — KK', issuer: 'Mahidol University', file: 'MU-KK.jpg' },
  { title: 'AI in General', issuer: 'Silpakorn University', file: 'SU-AI in general.jpg' },
  { title: 'Making Data More Valuable', issuer: 'CU MOOC', file: 'CUMOOC-How to make your data more valuable.jpg' },
  { title: 'English Enhancement', issuer: 'Chulalongkorn University', file: 'CU-English enchanment.jpg' },
  { title: 'INTER (EN)', issuer: 'SWU', file: 'SWU-INTER(EN).jpg' },
  { title: 'INTER (TH)', issuer: 'SWU', file: 'SWU-INTER(TH).jpg' },
  { title: '10-Hour English', issuer: 'Thai MOOC', file: 'THMOOC-10Hr ENG.jpg' },
  { title: 'Insight Camp', issuer: 'SIIT', file: 'SIIT - insight camp.jpg' },
  { title: 'NDE & EHE', issuer: 'RTARF', file: 'RTARF-NDE and EHE.jpg' },
  { title: 'Final Day', issuer: 'RTARF', file: 'RTARF-Final day.jpg' },
  { title: 'RSMS 1', issuer: 'RMA', file: 'RMA-RSMS 1.jpg' },
  { title: 'RSMS 2', issuer: 'RMA', file: 'RMA-RSMS 2.jpg' },
  { title: 'RSMS 2 (cont.)', issuer: 'RMA', file: 'RMA-RSMS 2 (2).jpg' },
  { title: 'IFMSA-Thailand', issuer: 'IFMSA', file: 'IFMSA-TH.jpg' },
  { title: 'Heart & Charities', issuer: 'Vichaiyut', file: 'Vichaivhej-Heart and Charities.jpg' },
  { title: 'FYAA', issuer: 'FYAA', file: 'FYAA.jpg' },
  { title: 'FYAA — Pladao', issuer: 'FYAA', file: 'FYAA pladao.jpg' },
  { title: 'ADEQ', issuer: 'ADEQ', file: 'ADEQ.jpg' },
  { title: 'Apibarn', issuer: 'Apibarn', file: 'Apibarn.jpg' },
  { title: 'MSB', issuer: 'MSB', file: 'MSB.jpg' },
  { title: 'Vajira', issuer: 'Vajira', file: 'VAJIRA.jpg' },
  { title: 'Inspiration Day — Tae Yang Thai #54', issuer: 'ttb Foundation', file: 'IMG_3225.JPG' },
  { title: 'Thailand Robot & Coding 2026 — Website Competition, 3rd Place', issuer: 'Kasetsart University', file: 'IMG_3226.JPG' },
  { title: 'IT CLASH — Cybersecurity Track, Finals', issuer: 'KMITL, Faculty of Information Technology', file: 'IMG_3227.JPG' },
  { title: 'Data Analysis Workshop', issuer: 'Centre of Excellence in Mathematics', file: 'IMG_3229.JPG' },
  { title: 'Pentesting Fundamentals', issuer: 'Crack The Lab', file: 'IMG_3230.JPG' },
  { title: 'English for Semiconductor Industry', issuer: 'Chulalongkorn University', file: 'IMG_3231.JPG' },
  { title: 'Hackathon Digitize — Anti-Corruption Innovation', issuer: 'TIJ & Anti-Corruption Organization of Thailand', file: 'IMG_3233.JPG' },
]

/* ---------------------------------------------------------------------------
 *  CONTACT — channels rendered in the footer (id="contact") and listed in the
 *  About terminal. Every href must resolve; nothing here should be a '#'.
 * ------------------------------------------------------------------------- */
export const contact = {
  blurb: 'Thanks for visiting. Reach me through any of the channels below.',
  channels: [
    { key: 'EMAIL', value: 'saechua2551@gmail.com', href: 'mailto:saechua2551@gmail.com' },
    { key: 'GITHUB', value: 'github.com/Skysosmart', href: 'https://github.com/Skysosmart' },
    { key: 'LINE', value: '@skysoyer', href: 'https://line.me/ti/p/~skysoyer' },
    { key: 'IG', value: '@yaa.itz_sky', href: 'https://instagram.com/yaa.itz_sky' },
    { key: 'SCHOOL', value: 'Assumption College Thonburi', href: 'https://www.act.ac.th' },
  ],
}

/* ---------------------------------------------------------------------------
 *  ASSET PATHS — files live in /public.
 * ------------------------------------------------------------------------- */
export const assets = {
  handArt: '/ASCII-Art/Hand-ascii-art.png',
  handText: '/ASCII-Art-text/Hand-ascii-art.txt',
  skyArtText: '/ASCII-Art-text/MtNameSky.txt', // sky ASCII shown inside the orb
  skyLogoText: '/ASCII-Art-text/Sky-ASCII.txt', // "Sky" logo behind About Me
  portrait: '/portrait/MeNameSky-web.jpg', // optimized web copy (original kept)
  certDir: '/certificates/',
}
