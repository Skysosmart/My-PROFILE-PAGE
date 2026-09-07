#!/usr/bin/env bash
# Put the pieces the About terminal's `boot` command needs into public/vm.
#
#   scripts/vm-assets.sh
#
# Two of them come from the v86 package, so they must be re-copied whenever
# it is upgraded - a libv86.mjs newer than its v86.wasm will not run:
#
#   libv86.mjs   the emulator's loader        (BSD-2-Clause, github.com/copy/v86)
#   v86.wasm     the emulator itself          (same)
#
# Two are firmware and one is the guest, downloaded once and committed:
#
#   seabios.bin  }  the BIOS pair the CD-ROM boot needs  (LGPLv3, SeaBIOS)
#   vgabios.bin  }
#   linux.iso    Buildroot: linux 2.6.34 + BusyBox 1.21  (GPLv2)
#
# linux.iso is a binary distribution of GPL software. It is published by the
# v86 project at github.com/copy/images and is built with Buildroot; anyone
# wanting the corresponding source can get it from there.
set -euo pipefail
cd "$(dirname "$0")/.."
out=public/vm
mkdir -p "$out"

cp node_modules/v86/build/libv86.mjs "$out/libv86.mjs"
cp node_modules/v86/build/v86.wasm   "$out/v86.wasm"
echo "copied libv86.mjs and v86.wasm from node_modules/v86"

fetch() { # <name> <url>
  if [[ -s "$out/$1" ]]; then echo "kept $1 ($(du -h "$out/$1" | cut -f1))"; return; fi
  curl -sSL --fail -o "$out/$1" "$2"
  echo "fetched $1 ($(du -h "$out/$1" | cut -f1))"
}
fetch seabios.bin https://raw.githubusercontent.com/copy/v86/master/bios/seabios.bin
fetch vgabios.bin https://raw.githubusercontent.com/copy/v86/master/bios/vgabios.bin
fetch linux.iso   https://raw.githubusercontent.com/copy/images/master/linux.iso

du -ch "$out"/* | tail -1
