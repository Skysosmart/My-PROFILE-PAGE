// The devices the opening is rendered for. The hero is laid out differently on each, so each gets its own capture.
export const VARIANTS = {
  desktop: { w: 1920, h: 1080, dpr: 1 },
  // tablets: the site pins their viewport to a desktop width (lib/viewport.ts), 1280 landscape / 1024 portrait,
  // so the hero an iPad shows is the desktop layout at these sizes (an 11" iPad's aspect)
  "tablet-l": { w: 1280, h: 892, dpr: 1.5, desktopLayout: true },
  "tablet-p": { w: 1024, h: 1468, dpr: 1.5, desktopLayout: true },
  phone: { w: 390, h: 844, dpr: 2 },
};
