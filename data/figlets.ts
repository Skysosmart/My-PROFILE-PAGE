/**
 * Block-letter titles for the Projects stage, in figlet's `small` font.
 *
 * Pre-rendered once (pyfiglet, font=small) and committed as strings: nine
 * fixed titles do not justify shipping a figlet font library to the browser.
 * Keyed by the project's full title so the lookup cannot drift from
 * data/portfolio.ts; the short word is what gets drawn. Regenerate with:
 *   pyfiglet -f small PDLITE
 */
export const FIGLETS: Record<string, string> = {
  "PDLite - Parkinson’s Risk Screening Device":
    " ___ ___  _    ___ _____ ___\n| _ \\   \\| |  |_ _|_   _| __|\n|  _/ |) | |__ | |  | | | _|\n|_| |___/|____|___| |_| |___|",
  "Seluna Cloud - Landing Site":
    " ___ ___ _   _   _ _  _   _\n/ __| __| | | | | | \\| | /_\\\n\\__ \\ _|| |_| |_| | .` |/ _ \\\n|___/___|____\\___/|_|\\_/_/ \\_\\",
  "Nebula - Deep-Space Observatory Site":
    " _  _ ___ ___ _   _ _      _\n| \\| | __| _ ) | | | |    /_\\\n| .` | _|| _ \\ |_| | |__ / _ \\\n|_|\\_|___|___/\\___/|____/_/ \\_\\",
  "CODEKIT 2026 - T-GODA & Nexus":
    "  ___ ___  ___  ___ _  _____ _____\n / __/ _ \\|   \\| __| |/ /_ _|_   _|\n| (_| (_) | |) | _|| ' < | |  | |\n \\___\\___/|___/|___|_|\\_\\___| |_|",
  "TCASFolio Extension - Doodee Future":
    " _____ ___   _   ___ ___ ___  _    ___ ___\n|_   _/ __| /_\\ / __| __/ _ \\| |  |_ _/ _ \\\n  | || (__ / _ \\\\__ \\ _| (_) | |__ | | (_) |\n  |_| \\___/_/ \\_\\___/_| \\___/|____|___\\___/",
  "Pranakorn.dev - Studio Site":
    " ___ ___    _   _  _   _   _  _____  ___ _  _\n| _ \\ _ \\  /_\\ | \\| | /_\\ | |/ / _ \\| _ \\ \\| |\n|  _/   / / _ \\| .` |/ _ \\| ' < (_) |   / .` |\n|_| |_|_\\/_/ \\_\\_|\\_/_/ \\_\\_|\\_\\___/|_|_\\_|\\_|",
  "MakeX Challenger Competition Robot":
    " __  __   _   _  _______  __\n|  \\/  | /_\\ | |/ / __\\ \\/ /\n| |\\/| |/ _ \\| ' <| _| >  <\n|_|  |_/_/ \\_\\_|\\_\\___/_/\\_\\",
  "Hackathon Digitize - Asset Declaration Data":
    " ___ ___ ___ ___ _____ ___ _______\n|   \\_ _/ __|_ _|_   _|_ _|_  / __|\n| |) | | (_ || |  | |  | | / /| _|\n|___/___\\___|___| |_| |___/___|___|",
  "This Portfolio Site":
    " ___  ___  ___ _____ ___ ___  _    ___ ___\n| _ \\/ _ \\| _ \\_   _| __/ _ \\| |  |_ _/ _ \\\n|  _/ (_) |   / | | | _| (_) | |__ | | (_) |\n|_|  \\___/|_|_\\ |_| |_| \\___/|____|___\\___/",
}

/** The art for a title, or the title itself in caps when none was rendered. */
export const figletFor = (title: string) => FIGLETS[title] ?? title.toUpperCase()
