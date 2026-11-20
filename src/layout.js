// Coordinates are in metres. The southern road opens onto the market square.
export const houses = [
  [-9, 12, 5, 7, 3.5], [10, 16, 6, 7, 3.2], [-10, 0, 6, 7, 4],
  [10,-2, 7, 6, 3.5], [-12,-14, 6, 8, 3.8], [13,-16, 6, 6, 4],
  [-24,6, 6, 7, 4], [25,7, 6, 6, 3.4], [-23,-10, 6, 6, 3],
  [0,-24, 7, 6, 4], [24,-7, 5, 5, 3.5]
];
export const places = [
  {id:'sign',x:-2,z:14,name:'Read the waypost',title:'The market road',text:'The western arm points to the watchtower. Someone has scratched a third name beneath “Market” and “Forge”. The letters are still fresh.'},
  {id:'well',x:-3,z:1,name:'Listen at the well',title:'The old well',text:'A bucket swings on a dry rope. From deep below comes the faint sound of metal striking metal.'},
  {id:'forge',x:6,z:-2,name:'Inspect the forge',title:'A crown in the ash',text:'The coals are still red. Beneath the tongs lies the print of a broken crown, pressed into the ash by a hand wearing a signet ring. The smith left his tools behind.'}
];
export function randomSource(seed) {
  return () => { seed=(Math.imul(1664525,seed)+1013904223)>>>0; return seed/4294967296; };
}
export function closestPlace(x,z) {
  return places.reduce((best,p) => {
    const d=Math.hypot(p.x-x,p.z-z);
    return d<3.3 && (!best || d<best.d) ? {p,d} : best;
  },null)?.p ?? null;
}
