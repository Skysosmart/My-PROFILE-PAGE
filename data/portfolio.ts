/**
 * ============================================================================
 *  NONTHANAPHONG.EXE - content
 *  Single source of content for the whole site. Edit the text/values below and
 *  the site updates. Placeholders you should replace are marked  // TODO.
 * ============================================================================
 */

/* ---------------------------------------------------------------------------
 *  PLAYER - top-level identity (boot log, header brand, browser tab)
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
 *  NAV - header links (id must match each <section id>)
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
    "I'm Nonthanaphong Saechua - a full-stack developer and penetration tester who also works in 3D and graphic design. I build things end to end: shipping web apps, breaking them to make them safer, and designing how they look and feel.",
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
 *  SOP - Statement of Purpose. `shortCount` paragraphs show before "Read more".
 * ------------------------------------------------------------------------- */
export const sop = {
  shortCount: 2,
  paragraphs: [
    `Since childhood, I wasn't a top student or particularly outstanding. My grades were consistently at the bottom of the class almost every year. That changed when I first touched a computer, and the game that sparked my interest in technology was Roblox. That was the turning point that transformed me from an insecure child into someone genuinely passionate about the digital world. Roblox made me feel like I could "create something" for the first time in my life.`,
    `From there, I began experimenting with coding, playing with plugins, and gradually exploring backend systems. I started to see how vast the world of technology is and how much more there is to learn. I've tried many fields-Game Development, Robotics, and even Electronics-but ultimately felt they weren't my true passion. That is, until I discovered the world of Cyber Security and CTF.`,
    `That was the pivotal moment for me. It was the first time I felt "This is what I want to wake up and do every day." Solving challenges, analyzing systems, thinking systematically, and the feeling of successfully exploiting vulnerabilities was something I'd never experienced in other fields. It made me realize I wanted to pursue this seriously, not just as a hobby.`,
    `During high school, I had opportunities to compete in various competitions and was honored to become an ACT Brand Ambassador as a Content Creator. This role helped me develop my communication and presentation skills significantly. I believe a good engineer isn't just "technically skilled" but must also "be able to explain things so others can understand." This role boosted my confidence in leadership, communication, and teamwork.`,
    `I've also worked on many projects, from Web Development, Full Stack, APIs, and Automation, including experimenting with simple tools for system penetration and vulnerability testing in a student-appropriate way. I love the feeling of solving difficult problems and I'm passionate about endless self-learning, especially in Cybersecurity where everything is constantly evolving.`,
    `What I want next is a strong engineering foundation in Network, Computer Systems, Algorithms, Software, Infrastructure, and Security. These are essential if I want to advance in Cyber Security, Digital Forensics, Penetration Testing, or even become a Security Researcher in the future.`,
    `I didn't grow from intelligence or talent, but from persistence, genuine interest, and constantly finding ways to learn on my own. I'm looking for an environment that pushes me to grow both in engineering and in creating digital innovations, so I can reach my goal of becoming a Cyber Security engineer with the capabilities to benefit society in the future.`,
  ],
}

/* ---------------------------------------------------------------------------
 *  INSPIRATION - the principles that drive the work. Printed by the
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
      'A good engineer is not only technically skilled - they can make someone else understand. Presenting as an ACT Brand Ambassador forced me to turn what I knew into something people could follow.',
  },
  {
    icon: 'heart',
    title: 'Finish What You Start',
    description:
      'PDLite took months of iteration before it won anything, and my MakeX robot took six. The work that counts is what happens after the idea stops being exciting.',
  },
] as const

/* ---------------------------------------------------------------------------
 *  PROJECTS - competition and coursework builds, strongest first.
 *  status: 'Live' | 'Completed' | 'In Progress' | 'Upcoming'
 *  demo/repo are optional; the card only renders a link when one is set.
 * ------------------------------------------------------------------------- */
export type Project = {
  title: string
  period: string
  role: string
  status: 'Live' | 'Completed' | 'In Progress' | 'Upcoming'
  description: string
  tags: string[]
  /** Card thumbnail under /public. A screenshot of the live site where there is one. */
  image?: string
  /**
   * The share of the work that is mine, counted off GitHub rather than
   * asserted. Team repos get one; solo repos do not need one.
   */
  contribution?: string
  demo?: string
  repo?: string
}

export const projects: Project[] = [
  {
    title: 'PDLite - Parkinson\u2019s Risk Screening Device',
    period: '2026',
    role: 'Web & Database / Device Design',
    status: 'Completed',
    description:
      'A handheld device that gives a preliminary Parkinson\u2019s risk assessment. I built the Next.js and Supabase app that records the readings and charts them back, and designed the enclosure and its mechanism in Fusion 360 for 3D printing.',
    tags: ['Next.js', 'Supabase', 'Chart.js', 'Fusion 360'],
    image: '/projects/pdlite.jpg',
    contribution: 'Sole author \u00b7 30 commits \u00b7 gold at NRCT I-New Gen 2026 and SWU Researcher Day 2026',
    demo: 'https://p-dlite.vercel.app',
    repo: 'https://github.com/Skysosmart/PDlite',
  },
  {
    title: 'Seluna Cloud - Landing Site',
    period: '2026',
    role: 'Frontend Developer',
    status: 'Live',
    description:
      'The public site for Seluna Cloud, a commerce platform in production. Mine are the 3D moon hero and its iris transition, the site-wide motion pass, the grouped navbar, and a startup rework that gates the splash per session and paints the hero before hydration.',
    tags: ['Next.js', 'Cloudflare', 'GSAP', '3D Hero'],
    image: '/projects/seluna.jpg',
    contribution: 'Largest contributor \u00b7 43 of 122 commits',
    demo: 'https://seluna.cloud',
  },
  {
    title: 'Nebula - Deep-Space Observatory Site',
    period: '2026',
    role: 'Contributor \u00b7 3D',
    status: 'Live',
    description:
      'A curated directory of websites, built as an observatory dome looking out at a live emission nebula. Its colour comes from real nebula emission lines in OKLCH rather than the usual purple space gradient, and submitting a site ends in a cinematic 3D black-hole intake.',
    tags: ['Astro', 'React Three Fiber', 'Cloudflare', 'Neon'],
    image: '/projects/nebula.jpg',
    contribution: '7 of 23 commits across 5 contributors',
    demo: 'https://nebula.pranakorn.co.th',
  },
  {
    title: 'CODEKIT 2026 - T-GODA & Nexus',
    period: '2026',
    role: 'Frontend Developer',
    status: 'Completed',
    description:
      'Two builds against one brief at the Thailand Robot & Coding Challenge: T-GODA, an Agoda-style booking platform, and Nexus, a Discord-style chat app. I owned the frontend on both - landing pages, responsive layout, the sign-up and login flow, and over twenty core functions on Nexus. 3rd nationally.',
    tags: ['Frontend', 'UI Design', 'Auth Flow', '3rd Place'],
    image: '/projects/codekit.jpg',
    contribution: 'Nexus: most commits of the three, 38 of 97 \u00b7 T-GODA: 15 of 53',
    demo: 'https://codekit-finale.vercel.app',
    repo: 'https://github.com/Skysosmart/codekit-finale',
  },
  {
    title: 'TCASFolio Extension - Doodee Future',
    period: '2025-2026',
    role: 'Extension Author \u00b7 Platform Contributor',
    status: 'Live',
    description:
      'Doodee Future puts Thai university admission planning in one place instead of a dozen sites. The TCASFolio browser extension is mine end to end: a Chrome MV3 add-on that keeps a local portfolio vault and autofills the TCASFolio forms, with the data never leaving the machine.',
    tags: ['Chrome MV3', 'Next.js', 'Team Project'],
    // the extension itself - its popup, with the vault holding real entries -
    // rather than the platform's landing page
    image: '/projects/tcasfolio.jpg',
    contribution: 'Extension: 58 of 61 commits \u00b7 platform: 4 of 534 across 7 contributors',
    demo: 'https://doodee-future.com',
    repo: 'https://github.com/Skysosmart/doodee-future-tcasfolie-extension',
  },
  {
    title: 'Pranakorn.dev - Studio Site',
    period: '2026',
    role: 'Frontend Developer',
    status: 'Live',
    description:
      'The public site for Pranakorn Group, the web development studio I build with. I worked on the landing page and its responsive layout.',
    tags: ['Frontend', 'Responsive', 'Team Project'],
    image: '/projects/pranakorn.jpg',
    contribution: '23 of 102 commits across 8 contributors',
    demo: 'https://pranakorn.dev',
  },
  {
    title: 'MakeX Challenger Competition Robot',
    period: '2025',
    role: 'Structural Designer',
    status: 'Completed',
    description:
      'Six months designing the full robot structure in Fusion 360 for the MakeX Challenger international tournament, building for disc-shooting and block-gripping missions across five arenas.',
    tags: ['Fusion 360', 'Robotics', '3D Design'],
    image: '/projects/makex.jpg',
    contribution: '3rd place \u00b7 Best Favourite Alliance Team Award',
  },
  {
    title: 'Hackathon Digitize - Asset Declaration Data',
    period: '2025',
    role: 'Data Engineering',
    status: 'Completed',
    description:
      'Turned scanned NACC asset-declaration filings into structured, queryable records through a Python extraction pipeline using OCR, vision models and a trained NER model. An anti-corruption entry run by TIJ and the Anti-Corruption Organization of Thailand.',
    tags: ['Python', 'OCR', 'NER', 'Data Pipeline'],
  },
  {
    title: 'This Portfolio Site',
    period: '2026',
    role: 'Designer / Developer',
    status: 'Live',
    description:
      'The site you are reading. A terminal-themed one-pager in Next.js with WebGL, holding the certificates, the projects and the writing.',
    tags: ['Next.js', 'TypeScript', 'WebGL', 'Design'],
    image: '/projects/portfolio.jpg',
    contribution: 'Sole author \u00b7 51 commits',
    demo: 'https://nonthanaphong.vercel.app',
    repo: 'https://github.com/Skysosmart/My-PROFILE-PAGE',
  },
]


/* ---------------------------------------------------------------------------
 *  MOMENTS - photographs from the events themselves.
 *  Keyed by event, not by certificate: MakeX alone has seven certificates but
 *  one campaign, and the pictures belong to the campaign.
 *  Files live in /public/moments/<key>/NN.jpg with a 520px thumb alongside.
 * ------------------------------------------------------------------------- */
export type Moment = { label: string; photos: string[] }

export const moments: Record<string, Moment> = {
  'act-brand-ambassador': {
    label: 'ACT Brand Ambassador 2025',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg', '07.jpg'],
  },
  'click-camp': {
    label: 'Click Camp #15, Mahidol',
    photos: ['01.jpg', '02.jpg'],
  },
  'codekit': {
    label: 'CODEKIT Website Competition 2026',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg', '07.jpg'],
  },
  'cyber-bootcamp': {
    label: 'RTARF Cyber Bootcamp 2025',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg', '07.jpg', '08.jpg', '09.jpg'],
  },
  'inewgen': {
    label: 'I-New Gen Inventors Award 2026',
    photos: ['01.jpg', '02.jpg', '03.jpg'],
  },
  'khan-knot': {
    label: 'KhanKnot #24, Mahidol Engineering',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg'],
  },
  'makex': {
    label: 'MakeX Thailand 2025',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg'],
  },
  'outstanding-student': {
    label: 'Outstanding Student Award',
    photos: ['01.jpg', '02.jpg', '03.jpg'],
  },
  'siit-insight-camp': {
    label: 'SIIT Insight Camp 2025',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg'],
  },
  'swu-day-camp': {
    label: 'SWU International Engineering Day Camp',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg'],
  },
  'swu-research-day': {
    label: 'SWU Researcher Day 2026',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg'],
  },
  'heart-charity': {
    label: 'Heart Charity, Vichaivej Hospital',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg'],
  },
  'vajira-volunteer': {
    label: 'Vajira Hospital Volunteer',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg', '07.jpg', '08.jpg', '09.jpg', '10.jpg', '11.jpg', '12.jpg', '13.jpg', '14.jpg'],
  },
}

/* ---------------------------------------------------------------------------
 *  CERTIFICATES - every field except title/issuer/file is optional and was
 *  read off the scan itself. `detail` carries the longer write-up from the
 *  TCAS portfolio where one exists. Titles stay in English: the site's fonts
 *  (JetBrains Mono / VT323 / Press Start 2P / Space Grotesk) have no Thai
 *  glyphs, so Thai text would render as tofu.
 * ------------------------------------------------------------------------- */
export type CertLevel = 'International' | 'National' | 'Provincial' | 'Institution' | 'School' | 'Online'

export type Certificate = {
  title: string
  issuer: string
  file: string
  featured?: boolean
  level?: CertLevel
  date?: string
  result?: string
  medal?: 'gold' | 'silver' | 'bronze'
  credential?: string
  detail?: string
  /** key into `moments`: photographs from this event */
  moment?: string
}

export const certificates: Certificate[] = [
  // ----- Featured -----
  {
    title: 'Thailand New Gen Inventors Award 2026',
    issuer: 'National Research Council of Thailand',
    file: 'NRCT-I-New Gen inventors gold medal.jpg', moment: 'inewgen', featured: true, level: 'National', date: 'Jan 2026',
    result: 'Gold Medal', medal: 'gold',
    detail:
      'Gold at the I-New Gen Award 2026, health & medical category, secondary level, for PDLite - a device giving a preliminary Parkinson’s disease risk assessment. A five-student team with a faculty advisor. I built the Next.js and Supabase web app that records readings and charts them, handled UX/UI and the database, and designed the enclosure and its mechanism in Fusion 360 for 3D printing.',
  },
  {
    title: 'Invention & Innovation - Gold Medal',
    issuer: 'SWU Researcher Day 2026',
    file: 'SWU-Researcher day gold medal.jpg', moment: 'swu-research-day', featured: true, level: 'National', date: 'Apr 2026',
    result: 'Gold Medal', medal: 'gold',
    detail:
      'The second gold for PDLite, awarded at Srinakharinwirot University’s Researcher Day in the high-school invention and innovation contest. What this project taught me was less technical than procedural: a team needs a clear workflow and divided responsibilities, and the work that matters happens after the idea stops being exciting.',
  },
  {
    title: 'Thailand Robot & Coding 2026 - Website Competition',
    issuer: 'Kasetsart University',
    file: 'KU-Website competition 3rd place.jpg', moment: 'codekit', featured: true, level: 'National', date: 'May 2026',
    result: '3rd Place', medal: 'bronze',
    detail:
      'Third nationally in the CODEKIT web development competition, high-school level. Two builds against a brief: T-GODA, an Agoda-style booking platform, and Nexus, a Discord-style chat app. I owned the frontend on both - landing pages, responsive layout, navigation, the sign-up and login flow, and over twenty core functions on Nexus.',
  },
  {
    title: 'MakeX Challenge - Best Favourite Alliance Team',
    issuer: 'MakeX Thailand · Imagineering Education',
    file: 'MakeX Ultimate winner.jpg', moment: 'makex', featured: true, level: 'National', date: 'Oct-Nov 2025',
    result: '3rd Place · Best Favourite Alliance Team', medal: 'bronze',
    detail:
      'Team Prometheus, at the 2025 MakeX Thailand National Championships. I designed the entire robot structure in Fusion 360 over six months, building for disc-shooting and block-gripping missions across five arenas. The lesson was composure - a dead control board or a wheel off mid-match, and an opponent who can disrupt you. In the game they are rivals; after it they are friends.',
  },
  {
    title: 'Pentesting Fundamentals',
    issuer: 'Crack The Lab',
    file: 'CrackTheLab-Pentesting fundamentals.jpg', featured: true, level: 'Online', date: 'Apr 2026',
    result: 'Completed', credential: 'CR-571C5C8AA4',
  },
  {
    title: 'IT CLASH - Cybersecurity Track, Finals',
    issuer: 'KMITL, Faculty of Information Technology',
    file: 'KMITL-IT CLASH cybersecurity final.jpg', featured: true, level: 'National', date: 'May 2026',
    result: 'Finalist',
  },
  {
    title: 'Network Defense Essentials (N|DE)',
    issuer: 'EC-Council',
    file: 'EC_Councils-NDE.jpg', featured: true, level: 'International', date: 'Mar 2025',
    result: 'Completed', credential: '398563',
  },
  {
    title: 'Ethical Hacking Essentials (E|HE)',
    issuer: 'EC-Council',
    file: 'EC_Councils-EHE.jpg', featured: true, level: 'International', date: 'Mar 2025',
    result: 'Completed', credential: '397792',
  },
  {
    title: 'CTF Boot Camp',
    issuer: 'NCSA · Thailand National Cyber Academy',
    file: 'NCSA-CTF boot camp.jpg', moment: 'cyber-bootcamp', featured: true, level: 'National', date: 'May 2025',
    result: 'Completed',
  },
  {
    title: 'RTARF Cyber Bootcamp - N|DE & E|HE',
    issuer: 'Royal Thai Armed Forces Cyber Command',
    file: 'RTARF-NDE and EHE.jpg', moment: 'cyber-bootcamp', featured: true, level: 'National', date: 'Apr 2025',
    result: 'Completed',
    detail:
      'Two months of online training run by the Cyber Command of the Royal Thai Armed Forces, ending in the EC-Council Network Defense Essentials and Ethical Hacking Essentials certifications.',
  },
  {
    title: 'Hackathon Digitize - Anti-Corruption Innovation',
    issuer: 'TIJ & Anti-Corruption Organization of Thailand',
    file: 'TIJ-Hackathon digitize.jpg', featured: true, level: 'National', date: 'Dec 2025',
    result: 'Participated',
    detail:
      'Run by the Thailand Institute of Justice with the Anti-Corruption Organization of Thailand, Security Pitch, WeVis and HAND Social Enterprise. We turned scanned NACC asset-declaration filings into structured, queryable records with a Python pipeline using OCR, vision models and a trained NER model.',
  },
  {
    title: 'English for Semiconductor Industry',
    issuer: 'Chulalongkorn University, Dept. of Electrical Engineering',
    file: 'CU-English for semiconductor industry.jpg', featured: true, level: 'Online', date: 'Mar 2026',
    result: 'Completed',
  },

  // ----- Competitions & awards -----
  {
    title: 'Thailand Robot & Coding 2025 - Python Competition',
    issuer: 'Kasetsart University',
    file: 'KU-Thailand Robot and Coding.jpg', level: 'National', date: 'May 2025',
    result: 'Top 24 teams',
  },
  {
    title: 'Prasarnmit Python Battle 2025',
    issuer: 'SWU Prasarnmit Demonstration School',
    file: 'SWU-Python bttle.jpg', level: 'School', date: 'Jan 2025', result: 'Participated',
  },
  {
    title: 'MakeX Challenge - Qualification Round',
    issuer: 'MakeX Thailand · Imagineering Education',
    file: 'MakeX Qualification.jpg', moment: 'makex', level: 'National', date: 'Oct-Nov 2025', result: 'Participated',
  },
  {
    title: 'MakeX Explore Tournament 1',
    issuer: 'MakeX Thailand · Imagineering Education',
    file: 'MakeX tournament 1.jpg', moment: 'makex', level: 'National', date: 'Jun 2025', result: 'Point Race',
  },
  {
    title: 'MakeX Challenge Tournament 2',
    issuer: 'MakeX Thailand · Imagineering Education',
    file: 'MakeX tournament 2.jpg', moment: 'makex', level: 'National', date: 'Jul 2025', result: 'Point Race',
  },
  {
    title: 'MakeX Challenge Tournament 3',
    issuer: 'MakeX Thailand · Imagineering Education',
    file: 'MakeX tournament 3.jpg', moment: 'makex', level: 'National', date: 'Aug 2025', result: 'Point Race',
  },
  {
    title: 'MakeX Challenge Tournament 4',
    issuer: 'MakeX Thailand · Imagineering Education',
    file: 'MakeX tournament 4.jpg', moment: 'makex', level: 'National', date: 'Sep 2025', result: 'Point Race',
  },
  {
    title: 'ACT MakeX Robotics Invitation - Practice Warm Up',
    issuer: 'Assumption College Thonburi',
    file: 'MakeX Warmup.jpg', moment: 'makex', level: 'School', date: 'Jun 2025', result: 'Participated',
  },
  {
    title: 'RSMS - Selection Round 1',
    issuer: 'Ramathibodi Faculty of Medicine, Mahidol University',
    file: 'RMA-RSMS 1.jpg', level: 'National', date: 'Apr 2025', result: 'Participated',
  },
  {
    title: 'RSMS - Selection Round 2 (April)',
    issuer: 'Ramathibodi Faculty of Medicine, Mahidol University',
    file: 'RMA-RSMS 2 (2).jpg', level: 'National', date: 'Apr 2025', result: '60th percentile',
  },
  {
    title: 'RSMS - Selection Round 2 (June)',
    issuer: 'Ramathibodi Faculty of Medicine, Mahidol University',
    file: 'RMA-RSMS 2.jpg', level: 'National', date: 'Jun 2025', result: '60th percentile',
  },
  {
    title: 'T-SCEPT 2025 Policy Thinkathon',
    issuer: 'IFMSA-Thailand',
    file: 'IFMSA-TH.jpg', level: 'National', date: 'Aug 2025', result: 'Participated',
  },

  // ----- Camps -----
  {
    title: 'Click Camp #15 - Cyber Security & Web Development',
    issuer: 'Computer Engineering, Mahidol University',
    file: 'MU-CC.jpg', moment: 'click-camp', level: 'Institution', date: 'Dec 2024', result: 'Completed',
    detail:
      'Four days at Mahidol’s Computer Engineering department, split across two tracks. On the security side I learned to use CTF tooling to hunt for flags, which taught me how to look for a weakness methodically. On the web side I built my first profile page end to end - the ancestor of this site.',
  },
  {
    title: 'KhanNot #24 - Mahidol Engineering Camp',
    issuer: 'Faculty of Engineering, Mahidol University',
    file: 'MU-KK.jpg', moment: 'khan-knot', level: 'Institution', date: 'May 2025', result: 'Completed',
    detail:
      'Four days rotating through hands-on stations from every engineering department before choosing a field. The track I liked most was cyber-defence engineering, because protecting a system turns out to require thinking like the person attacking it.',
  },
  {
    title: 'SIIT Insight Camp 2025',
    issuer: 'SIIT, Thammasat University',
    file: 'SIIT - insight camp.jpg', moment: 'siit-insight-camp', level: 'Institution', date: 'Apr 2025', result: 'Participated',
  },
  {
    title: 'SWU International Engineering Day Camp 2025',
    issuer: 'Faculty of Engineering (International), SWU',
    file: 'SWU-INTER(EN).jpg', moment: 'swu-day-camp', level: 'Institution', date: 'Mar 2025', result: 'Participated',
  },
  {
    title: 'SWU International Engineering Day Camp 2025 (TH)',
    issuer: 'Faculty of Engineering (International), SWU',
    file: 'SWU-INTER(TH).jpg', moment: 'swu-day-camp', level: 'Institution', date: 'Mar 2025', result: 'Participated',
  },
  {
    title: 'STEM & Robotics Camp',
    issuer: 'MU IGNITE by On Demand',
    file: 'MUIGNITE-STEM and robotic.jpg', level: 'Institution', date: '2024', result: 'Completed',
  },
  {
    title: 'CiRA CORE Camp - KMITL Innovation Expo 2025',
    issuer: 'Global Technology, KMITL',
    file: 'KMITL-CiRA COM CAMP.jpg', level: 'Institution', date: 'Mar 2025',
    result: 'Attended', credential: 'GTCINOEP250138',
  },

  // ----- Security & engineering -----
  {
    title: 'Cyber Ant',
    issuer: 'KMUTT',
    file: 'KMUTT-Cyber ant.jpg', level: 'Institution', date: '2024', result: 'Completed',
  },
  {
    title: 'RTARF Cyber Bootcamp - Final Day',
    issuer: 'Royal Thai Armed Forces Cyber Command',
    file: 'RTARF-Final day.jpg', moment: 'cyber-bootcamp', level: 'National', date: 'Apr 2025', result: 'Completed',
  },
  {
    title: 'Coding Thailand 2025 - Hardware to ROS Rescues',
    issuer: 'depa · KMUTNB iRAP Robot',
    file: 'KMUTNB-AI driven.jpg', level: 'National', date: 'Oct 2025', result: 'Completed',
  },
  {
    title: 'Basic Python',
    issuer: 'ONDE · KMUTNB',
    file: 'KMUTNB-Basic python test.jpg', level: 'National', result: 'Passed - Excellent',
  },

  // ----- AI & data -----
  {
    title: 'AI-Powered Work with Copilot - KMITL Innovation Expo 2025',
    issuer: 'Global Technology, KMITL',
    file: 'KMITL-AI powered.jpg', level: 'Institution', date: 'Mar 2025',
    result: 'Attended', credential: 'GTCINOEP25026',
  },
  {
    title: 'BOTNOI Voice - KMITL Innovation Expo 2025',
    issuer: 'Global Technology, KMITL',
    file: 'KMITL-BOTNOI.jpg', level: 'Institution', date: 'Mar 2025',
    result: 'Attended', credential: 'GTCINOEP250146',
  },
  {
    title: 'Typhoon by SCB10X - KMITL Innovation Expo 2025',
    issuer: 'Global Technology, KMITL',
    file: 'KMITL-typhoon.jpg', level: 'Institution', date: 'Mar 2025',
    result: 'Attended', credential: 'GTCINOEP25046',
  },
  {
    title: 'Introduction to Python for AI and Digital Twin',
    issuer: 'Kasetsart University',
    file: 'KU-AI and Digital twin.jpg', level: 'Institution', date: 'Sep 2024',
    result: 'Completed - 3 hrs',
  },
  {
    title: 'Basic Prompt Engineering',
    issuer: 'Mahidol University (CBTU)',
    file: 'MU-Basic prompt.jpg', level: 'Online', date: 'Sep 2025', result: 'Completed',
  },
  {
    title: 'Python for Data Science',
    issuer: 'CHULA MOOC',
    file: 'CUMOOC-Python and data analytic.jpg', level: 'Online', date: 'Jun 2024',
    result: 'Completed', credential: 'CV897450',
  },
  {
    title: 'How to Make Your Data More Valuable',
    issuer: 'CHULA MOOC',
    file: 'CUMOOC-How to make your data more valuable.jpg', level: 'Online', date: 'Apr 2024',
    result: 'Completed',
  },
  {
    title: 'Introduction to Big Data',
    issuer: 'Centre of Excellence in Mathematics',
    file: 'MU-Basic big data.jpg', level: 'Institution', date: 'Jun-Jul 2025', result: 'Completed',
  },
  {
    title: 'Data Analysis Workshop',
    issuer: 'Centre of Excellence in Mathematics',
    file: 'CEM-Data analysis workshop.jpg', level: 'Institution', date: 'Feb 2026', result: 'Completed',
  },
  {
    title: 'AI in Daily Life',
    issuer: 'Silpakorn University',
    file: 'SU-AI in general.jpg', level: 'Online', date: 'Jul 2024',
    result: 'Completed', credential: 'SHC675100004',
  },
  {
    title: 'Physics Discovery Workshop 2/2567',
    issuer: 'Dept. of Physics, KMITL · Vernier',
    file: 'KMITL-Sci and Physic.jpg', level: 'Institution', date: 'Oct 2024',
    result: 'Completed', credential: 'A-005',
  },

  // ----- Language -----
  {
    title: 'English Writing Enrichment',
    issuer: 'Faculty of Arts, Chulalongkorn University',
    file: 'CU-English enchanment.jpg', level: 'Institution', date: 'Jul 2023',
    result: 'Completed - 30 hrs',
  },
  {
    title: 'English for Communication',
    issuer: 'Thai MOOC · Chiang Mai University',
    file: 'THMOOC-10Hr ENG.jpg', level: 'Online', result: 'Completed - 10 hrs',
  },

  // ----- Service & leadership -----
  {
    title: 'Vajira Hospital Volunteer - Outpatient Services',
    issuer: 'Faculty of Medicine Vajira Hospital, NMU',
    file: 'VAJIRA.jpg', moment: 'vajira-volunteer', level: 'Institution', date: 'Oct 2025', result: 'Certified',
    detail:
      'Four days assisting in the general medicine outpatient centre - taking blood pressure, weight and height, helping elderly patients use the automated machines safely, managing wheelchairs, directing people and holding the screening queue together. It was the first time I saw what a working hospital actually demands of the people in it.',
  },
  {
    title: 'Heart Charity - First Aid & CPR',
    issuer: 'Vichaivej International Hospital · Srivichai Foundation',
    file: 'Vichaivhej-Heart and Charities.jpg', moment: 'heart-charity', level: 'Provincial', date: 'Jul 2025',
    result: 'Completed',
    detail:
      'First aid and CPR training with emergency-response drills run inside the school alongside a rescue team - evacuation and incident handling. I took part as a student volunteer supporting the training.',
  },
  {
    title: 'Volunteering Leads Life',
    issuer: 'FYAA Thailand · Pladao Youth Network',
    file: 'FYAA.jpg', level: 'National', date: 'Apr 2024', result: 'Completed',
  },
  {
    title: 'Creative Leadership in the 21st Century',
    issuer: 'FYAA Thailand · Pladao Institute',
    file: 'FYAA pladao.jpg', level: 'National', date: 'Apr 2024', result: 'Completed',
  },
  {
    title: 'Youth for Energy & Environment in Schools',
    issuer: 'Association for the Development of Environmental Quality',
    file: 'ADEQ.jpg', level: 'National', date: 'Apr 2024', result: 'Completed',
  },
  {
    title: 'Tobacco & E-Cigarette Awareness',
    issuer: 'Thai Health Promotion · Smoke-Free Foundation',
    file: 'MSB.jpg', level: 'School', date: 'Apr 2024', result: 'Completed',
  },
  {
    title: 'Morality & Ethics in Daily Life',
    issuer: 'Assumption College Thonburi',
    file: 'Apibarn.jpg', level: 'School', date: 'Apr 2024', result: 'Completed',
  },
  {
    title: 'Inspiration Day - Tae Yang Thai #54',
    issuer: 'ttb Foundation (Fai-Fah by ttb)',
    file: 'TTB-Inspiration day Tae Yang Thai.jpg', level: 'National', date: '2026', result: 'Participated',
  },
]

/* ---------------------------------------------------------------------------
 *  CONTACT - channels rendered in the footer (id="contact") and listed in the
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
 *  ASSET PATHS - files live in /public.
 * ------------------------------------------------------------------------- */
export const assets = {
  handArt: '/ASCII-Art/Hand-ascii-art.png',
  handText: '/ASCII-Art-text/Hand-ascii-art.txt',
  skyArtText: '/ASCII-Art-text/MtNameSky.txt', // sky ASCII shown inside the orb
  skyLogoText: '/ASCII-Art-text/Sky-ASCII.txt', // "Sky" logo behind About Me
  portrait: '/portrait/MeNameSky-web.jpg', // optimized web copy (original kept)
  certDir: '/certificates/',
}
