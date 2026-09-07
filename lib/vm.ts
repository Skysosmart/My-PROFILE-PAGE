'use client'

/**
 * A real Linux, in the reader's tab.
 *
 * v86 is an x86 emulator compiled to wasm; the image is the Buildroot the
 * v86 project publishes - a 2.6 kernel and BusyBox 1.21 on a 5.5MB ISO.
 * Nothing runs on a server: `ls` in the About terminal is BusyBox's ls, on
 * an emulated CPU on the reader's own machine. That is the whole reason it
 * is done this way rather than with an endpoint that shells out, which
 * would hand every visitor a shell on the deployment.
 *
 * All of it is loaded on demand - about 7.8MB between the emulator, the
 * BIOS pair and the image - so a reader who never types `boot` pays none
 * of it.
 */

const ASSETS = '/vm'

type V86Instance = {
  add_listener(e: string, cb: (v: number) => void): void
  serial0_send(s: string): void
  destroy?(): void
  stop?(): void
}

export type Vm = {
  /** a line of input, newline included */
  send(s: string): void
  /** stop the machine and free it */
  destroy(): void
}

/**
 * The emulator's own module, kept away from the bundler: it is a large
 * generated file that Next has no reason to parse, and the wasm beside it
 * is fetched by path at runtime either way. `new Function` hides the
 * specifier from webpack and turbopack alike.
 */
const loadV86 = () =>
  new Function('return import("/vm/libv86.mjs")')() as Promise<{
    V86: new (o: unknown) => V86Instance
  }>

/** the escape sequences BusyBox colours its output with; the log is plain text */
const ANSI = /\x1b\[[0-9;?]*[ -/]*[@-~]/g
export const stripAnsi = (s: string) => s.replace(ANSI, '').replace(/\r/g, '')

export async function bootLinux({
  onLine,
  onStatus,
}: {
  /** one finished line of output */
  onLine: (line: string) => void
  onStatus: (s: string) => void
}): Promise<Vm> {
  onStatus('fetching the machine')
  const { V86 } = await loadV86()

  onStatus('booting')
  const vm = new V86({
    wasm_path: `${ASSETS}/v86.wasm`,
    memory_size: 64 * 1024 * 1024,
    vga_memory_size: 2 * 1024 * 1024,
    bios: { url: `${ASSETS}/seabios.bin` },
    vga_bios: { url: `${ASSETS}/vgabios.bin` },
    cdrom: { url: `${ASSETS}/linux.iso` },
    autostart: true,
  })

  const handle: Vm = {
    send: (s) => vm.serial0_send(s),
    destroy: () => {
      try {
        vm.destroy?.()
        vm.stop?.()
      } catch {}
    },
  }

  /**
   * Resolves when the guest is actually at a shell, not when the emulator
   * has been constructed. Constructing it takes milliseconds; the kernel
   * then boots and asks for a login, and anything typed in between is
   * swallowed by `login:` - the first command a reader typed went to it
   * as a username.
   */
  return new Promise<Vm>((resolve, reject) => {
    const giveUp = setTimeout(() => reject(new Error('the machine did not come up')), 90_000)
    // the serial port arrives a byte at a time; a line is emitted when it ends
    let buf = ''
    let loggedIn = false
    let atShell = false

    vm.add_listener('serial0-output-byte', (b: number) => {
      buf += String.fromCharCode(b)
      // Buildroot asks who you are first. Nobody wants to be asked that by a
      // portfolio, so it answers for them.
      if (!loggedIn && /login:\s*$/.test(stripAnsi(buf))) {
        loggedIn = true
        setTimeout(() => vm.serial0_send('root\n'), 250)
      }
      const nl = buf.lastIndexOf('\n')
      if (nl !== -1) {
        const done = buf.slice(0, nl)
        buf = buf.slice(nl + 1)
        for (const line of stripAnsi(done).split('\n')) onLine(line)
      }
      // whatever is left is the unfinished line. A prompt is the shell
      // saying it is ready, and it never ends in a newline.
      if (loggedIn && !atShell && /[%#$]\s$/.test(stripAnsi(buf))) {
        atShell = true
        clearTimeout(giveUp)
        resolve(handle)
      }
    })
  })
}
