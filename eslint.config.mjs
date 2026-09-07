import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // public/vm holds vendored binaries and the emulator's own generated
  // loader; linting a 359KB machine-written file says nothing useful
  globalIgnores(['.next/**', 'out/**', 'next-env.d.ts', 'public/vm/**']),
  {
    rules: {
      // The mounted-flag pattern (setState in an effect so the server and the
      // first client paint agree) is deliberate all over this site: the theme
      // glyph, the boot screen, the deferred sections. Keep the rule visible
      // as a warning; the compiler-era rewrite is a separate job.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
])
