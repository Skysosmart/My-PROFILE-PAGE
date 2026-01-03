# Premium Personal Portfolio Website

A stunning, premium personal profile portfolio website built with Next.js App Router, TypeScript, Tailwind CSS, and Framer Motion.

## Features

- ✨ **Premium Design**: Pink and black luxury aesthetic with glassmorphism effects
- 🎬 **Cinematic Animations**: Advanced Framer Motion animations with stagger effects
- 🎯 **Fully Componentized**: Clean, scalable component architecture
- 📱 **Responsive**: Beautiful on all devices
- ⚡ **Performance**: Optimized for speed and smooth interactions

## Sections

1. **Hero**: Eye-catching introduction with magnetic buttons and particle effects
2. **About**: Personal story and skills showcase
3. **Certificate Menu**: Filterable certificate gallery with smooth transitions
4. **Inspiration**: Artistic storytelling and values
5. **Contact**: Interactive contact form with social links

## Technologies

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **Lucide React** (Icons)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Customization

- Update personal information in each section component
- Modify colors in `tailwind.config.ts`
- Add/remove certificates in `components/sections/CertificateMenu.tsx`
- Customize animations in individual component files

## Project Structure

```
├── app/
│   ├── globals.css       # Global styles and utilities
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main page
├── components/
│   ├── Navigation.tsx    # Navigation bar
│   ├── sections/         # Page sections
│   └── ui/               # Reusable UI components
└── public/               # Static assets
```

## License

MIT
