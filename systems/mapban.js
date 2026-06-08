const activeMapBans = new Map();

const MAP_POOL = [
  'ascent',
  'breeze',
  'fracture',
  'haven',
  'lotus',
  'pearl',
  'split'
];

const mapImages = {
  ascent: './photos/maps/ascent.webp',
  breeze: './photos/maps/breeze.webp',
  fracture: './photos/maps/fracture.webp',
  haven: './photos/maps/haven.webp',
  lotus: './photos/maps/lotus.webp',
  pearl: './photos/maps/pearl.webp',
  split: './photos/maps/split.webp'
};

module.exports = {
  activeMapBans,
  MAP_POOL,
  mapImages
};
