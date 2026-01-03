# Customization Guide

## Quick Personalization

### Update Your Name
1. **Hero Section**: Edit `components/sections/Hero.tsx` line 108
   - Change `[Your Name]` to your actual name

2. **Navigation**: Edit `components/Navigation.tsx` line 15
   - Change `Portfolio` to your preferred branding

### Contact Information
Edit `components/sections/Contact.tsx`:
- **Email**: Line 17 - Update email address
- **Phone**: Line 18 - Update phone number
- **Location**: Line 19 - Update your location
- **Social Links**: Lines 24-27 - Update GitHub, LinkedIn, Twitter URLs

### Certificates
Edit `components/sections/CertificateMenu.tsx`:
- Update the `certificates` array (lines 12-67) with your actual certificates
- Modify categories as needed (line 72)
- Each certificate can include:
  - title, issuer, date, category, description, link (optional)

### About Section Stats
Edit `components/sections/About.tsx`:
- Update stats in lines 94-98:
  - Project count, years of experience, etc.
- Modify skills array (lines 7-12) with your actual skills

### Colors & Theme
Edit `tailwind.config.ts` to customize the pink/black theme:
- Pink shades are defined in the `colors.pink` object
- Modify gradient colors in `app/globals.css`

### Animations
- Animation speeds: Adjust `duration` values in motion components
- Glow intensity: Modify `glow-pink` classes in `globals.css`
- Magnetic effect strength: Edit `strength` in `MagneticButton.tsx` line 27

## Adding New Sections

1. Create a new component in `components/sections/`
2. Import and add to `app/page.tsx`
3. Add navigation item in `components/Navigation.tsx`

## Form Handling

The contact form currently logs to console. To enable email sending:
1. Set up an API route in `app/api/contact/route.ts`
2. Update the `handleSubmit` function in `Contact.tsx`
3. Consider using services like Resend, SendGrid, or Formspree

