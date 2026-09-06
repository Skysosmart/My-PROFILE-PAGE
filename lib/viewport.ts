/**
 * Tablets get the computer's layout. Runs before first paint: on a touch
 * screen whose short side is tablet-sized, the viewport is pinned to a
 * desktop width (the browser scales the page to fit), so an iPad sees the
 * same page a laptop does instead of the phone-and-a-half layout in
 * between. Phones are untouched, so is a windowed tablet narrower than a
 * phone-and-a-half, and turning the tablet re-picks the width. Checked
 * again once the document has parsed and loaded: an engine that settled
 * the viewport at first layout only looks at the tag again on a change, so
 * if the width is not the target by then the tag is flipped and set again.
 */
export const VIEWPORT_BOOT = `(function(){try{
if(!matchMedia('(hover: none) and (pointer: coarse)').matches)return;
if(Math.min(screen.width,screen.height)<700||innerWidth<700)return;
var m=document.querySelector('meta[name=viewport]');if(!m)return;
var land=matchMedia('(orientation: landscape)');
var target=function(){return land.matches?1280:1024};
var apply=function(){m.setAttribute('content','width='+target())};
var check=function(){if(Math.abs(innerWidth-target())>2){m.setAttribute('content','width=device-width');apply()}};
apply();document.addEventListener('DOMContentLoaded',check);addEventListener('load',check);setTimeout(check,1200);land.addEventListener('change',apply)}catch(e){}})()`
