const BASE = 'assets/SproutLands-Sprites/Tilesets';

export const TILESET_CATEGORIES = {
  grass:     { label: 'Grass' },
  soil:      { label: 'Soil' },
  water:     { label: 'Water' },
  fences:    { label: 'Fences' },
  buildings: { label: 'Buildings' },
  dungeon:   { label: 'Dungeon' },
  winter:    { label: 'Winter' },
  more:      { label: 'More' },
};

// NOTA: GIDs 2600-3003 están libres (5 tilesets de agua eliminados).
// No reutilizar este rango para evitar conflictos con niveles antiguos.
export const TILESETS = [
  // ── Grass ──
  { key: 'ts_grass',              category: 'grass', label: 'Classic',            name: 'grass',              url: `${BASE}/Grass.png`,                                                                            cols: 11, rows: 7,  firstgid: 1    },
  { key: 'ts_grass_v2',           category: 'grass', label: 'v2',                 name: 'grass_v2',           url: `${BASE}/ground tiles/New tiles/Grass_tiles_v2.png`,                                            cols: 11, rows: 7,  firstgid: 2000  },
  { key: 'ts_grass_hills',        category: 'grass', label: 'Hills',              name: 'grass_hills',        url: `${BASE}/ground tiles/New tiles/Grass_Hill_Tiles_v2.png`,                                       cols: 11, rows: 7,  firstgid: 1700  },
  { key: 'ts_grass_hill_slopes',  category: 'grass', label: 'Hill Slopes',        name: 'grass_hill_slopes',  url: `${BASE}/ground tiles/New tiles/Grass_Hill_Tiles_Slopes v.2.png`,                               cols: 6,  rows: 3,  firstgid: 1600  },
  { key: 'ts_grass_layers',       category: 'grass', label: 'Layers',             name: 'grass_layers',       url: `${BASE}/ground tiles/New tiles/Grass_Tile_Layers.png`,                                         cols: 11, rows: 7,  firstgid: 1800  },
  { key: 'ts_grass_layers2',      category: 'grass', label: 'Layers 2',           name: 'grass_layers2',      url: `${BASE}/ground tiles/New tiles/Grass_Tile_layers2.png`,                                        cols: 11, rows: 7,  firstgid: 1900  },
  { key: 'ts_grass_simple',       category: 'grass', label: 'Simple',             name: 'grass_simple',       url: `${BASE}/ground tiles/New tiles/simpel versions/Grass_tiles_v2_simple.png`,                     cols: 6,  rows: 5,  firstgid: 3500  },
  { key: 'ts_dgrass_hills',       category: 'grass', label: 'Dark Hills',         name: 'dgrass_hills',       url: `${BASE}/ground tiles/New tiles/Darker_Grass_Hills_Tiles_v2.png`,                               cols: 11, rows: 7,  firstgid: 1000  },
  { key: 'ts_dgrass_hill_slopes', category: 'grass', label: 'Dark Hill Slopes',   name: 'dgrass_hill_slopes', url: `${BASE}/ground tiles/New tiles/Darker_Grass_Hill_Tiles_Slopes_v2.png`,                         cols: 6,  rows: 3,  firstgid: 900   },
  { key: 'ts_dgrass_layers',      category: 'grass', label: 'Dark Layers',        name: 'dgrass_layers',      url: `${BASE}/ground tiles/New tiles/Darker_Grass_Tile_Layers.png`,                                  cols: 11, rows: 7,  firstgid: 1100  },
  { key: 'ts_dgrass_layers2',     category: 'grass', label: 'Dark Layers 2',      name: 'dgrass_layers2',     url: `${BASE}/ground tiles/New tiles/Darker_Grass_Tile_Layers2.png`,                                 cols: 11, rows: 7,  firstgid: 1200  },
  { key: 'ts_dgrass_tiles',       category: 'grass', label: 'Dark Tiles',         name: 'dgrass_tiles',       url: `${BASE}/ground tiles/New tiles/Darker_Grass_Tiles_v2.png`,                                     cols: 11, rows: 7,  firstgid: 1300  },
  { key: 'ts_bush',               category: 'grass', label: 'Bush',               name: 'bush',               url: `${BASE}/ground tiles/New tiles/Bush_Tiles.png`,                                                  cols: 11, rows: 11, firstgid: 800   },
  { key: 'ts_ground_hill_slopes', category: 'grass', label: 'Ground Slopes',      name: 'ground_hill_slopes', url: `${BASE}/ground tiles/New tiles/Ground_Hill_Tiles_Slopes.png`,                                   cols: 6,  rows: 2,  firstgid: 2100  },
  { key: 'ts_hills',              category: 'grass', label: 'Hills Classic',      name: 'hills',              url: `${BASE}/Hills.png`,                                                                              cols: 11, rows: 9,  firstgid: 300   },

  // ── Soil ──
  { key: 'ts_dirt',               category: 'soil',  label: 'Dirt',               name: 'dirt',               url: `${BASE}/Tilled_Dirt.png`,                                                                        cols: 11, rows: 7,  firstgid: 200   },
  { key: 'ts_dirt_v2',            category: 'soil',  label: 'v2',                 name: 'dirt_v2',            url: `${BASE}/Tilled_Dirt_v2.png`,                                                                     cols: 11, rows: 7,  firstgid: 500   },
  { key: 'ts_dirt_wide',          category: 'soil',  label: 'Wide',               name: 'dirt_wide',          url: `${BASE}/Tilled_Dirt_Wide.png`,                                                                   cols: 11, rows: 7,  firstgid: 600   },
  { key: 'ts_dirt_wide_v2',       category: 'soil',  label: 'Wide v2',            name: 'dirt_wide_v2',       url: `${BASE}/Tilled_Dirt_Wide_v2.png`,                                                                cols: 11, rows: 7,  firstgid: 700   },
  { key: 'ts_soil_hills',         category: 'soil',  label: 'Hills',              name: 'soil_hills',         url: `${BASE}/ground tiles/New tiles/Soil_Ground_HiIls_Tiles.png`,                                   cols: 11, rows: 7,  firstgid: 2200  },
  { key: 'ts_soil_tiles',         category: 'soil',  label: 'Tiles',              name: 'soil_tiles',         url: `${BASE}/ground tiles/New tiles/Soil_Ground_Tiles.png`,                                       cols: 11, rows: 7,  firstgid: 2300  },
  { key: 'ts_dsoil_hills',        category: 'soil',  label: 'Dark Hills',         name: 'dsoil_hills',        url: `${BASE}/ground tiles/New tiles/Darker_Soil_Ground_Hills_Tiles.png`,                            cols: 11, rows: 7,  firstgid: 1400  },
  { key: 'ts_dsoil_tiles',        category: 'soil',  label: 'Dark Tiles',         name: 'dsoil_tiles',        url: `${BASE}/ground tiles/New tiles/Darker_Soil_Ground_Tiles.png`,                                 cols: 11, rows: 7,  firstgid: 1500  },
  { key: 'ts_stone_hills',        category: 'soil',  label: 'Stone Hills',        name: 'stone_hills',        url: `${BASE}/ground tiles/New tiles/Stone_Ground_Hills_Tiles.png`,                                  cols: 11, rows: 7,  firstgid: 2400  },
  { key: 'ts_stone_tiles',        category: 'soil',  label: 'Stone Tiles',        name: 'stone_tiles',        url: `${BASE}/ground tiles/New tiles/Stone_Ground_Tiles.png`,                                        cols: 11, rows: 7,  firstgid: 2500  },

  // ── Water ──
  { key: 'ts_water',              category: 'water', label: 'Classic',            name: 'water',              url: `${BASE}/Water.png`,                                                                              cols: 4,  rows: 1,  firstgid: 400   },
  // ts_water es el único tileset de agua necesario (contiene los 4 frames de animacion).
  // Los tilesets individuales (water_ground, water_1-4) eran redundantes.

  // ── Fences ──
  { key: 'ts_fences',             category: 'fences', label: 'Classic',            name: 'fences',             url: `${BASE}/Fences.png`,                                                                             cols: 4,  rows: 4,  firstgid: 100   },
  { key: 'ts_fences_v2',          category: 'fences', label: 'v2',                 name: 'fences_v2',          url: `${BASE}/Building parts/Fences.png`,                                                              cols: 8,  rows: 4,  firstgid: 3700  },

  // ── Buildings ──
  { key: 'ts_doors',              category: 'buildings', label: 'Doors',           name: 'doors',              url: `${BASE}/Doors.png`,                                                                              cols: 1,  rows: 4,  firstgid: 3100  },
  { key: 'ts_wooden_house',       category: 'buildings', label: 'Wooden House',    name: 'wooden_house',       url: `${BASE}/Wooden House.png`,                                                                       cols: 7,  rows: 5,  firstgid: 3200  },
  { key: 'ts_wooden_roof',        category: 'buildings', label: 'Roof',            name: 'wooden_roof',        url: `${BASE}/Wooden_House_Roof_Tilset.png`,                                                           cols: 7,  rows: 5,  firstgid: 3300  },
  { key: 'ts_wooden_walls',       category: 'buildings', label: 'Walls',           name: 'wooden_walls',       url: `${BASE}/Wooden_House_Walls_Tilset.png`,                                                          cols: 5,  rows: 3,  firstgid: 3400  },
  { key: 'ts_stone_path',         category: 'buildings', label: 'Stone Path',      name: 'stone_path',         url: `${BASE}/Building parts/STONE PATH.png`,                                                          cols: 4,  rows: 4,  firstgid: 3600  },

  // ── Dungeon ──
  { key: 'ts_dungeon_walls',              category: 'dungeon', label: 'Walls',            name: 'dungeon_walls',              url: 'assets/SproutLands-SorrySprites/Early Access/Dungeon Pack/tiles/Dungeon_walls.png',                    cols: 12, rows: 22, firstgid: 3800  },
  { key: 'ts_dungeon_walls_decor',        category: 'dungeon', label: 'Decor',            name: 'dungeon_walls_decor',        url: 'assets/SproutLands-SorrySprites/Early Access/Dungeon Pack/tiles/dungeon_walls_decor_gates.png',       cols: 7,  rows: 7,  firstgid: 4100  },
  { key: 'ts_dungeon_ground_orange',      category: 'dungeon', label: 'Orange',           name: 'dungeon_ground_orange',      url: 'assets/SproutLands-SorrySprites/Early Access/Dungeon Pack/tiles/ground_dirt_orange.png',               cols: 11, rows: 11, firstgid: 4200  },
  { key: 'ts_dungeon_ground_orange_dark', category: 'dungeon', label: 'Orange Dark',      name: 'dungeon_ground_orange_dark', url: 'assets/SproutLands-SorrySprites/Early Access/Dungeon Pack/tiles/ground_dirt_orange_dark.png',        cols: 11, rows: 11, firstgid: 4350  },
  { key: 'ts_dungeon_ground_orange_hole', category: 'dungeon', label: 'Orange Hole',      name: 'dungeon_ground_orange_hole', url: 'assets/SproutLands-SorrySprites/Early Access/Dungeon Pack/tiles/ground_dirt_orange_hole.png',        cols: 4, rows: 1, firstgid: 4500  },
  { key: 'ts_dungeon_ground_orange_darker_hole', category: 'dungeon', label: 'Darker Hole', name: 'dungeon_ground_orange_darker_hole', url: 'assets/SproutLands-SorrySprites/Early Access/Dungeon Pack/tiles/ground_dirt_orange_darker_hole.png', cols: 4, rows: 1, firstgid: 4650  },
  { key: 'ts_dungeon_items',              category: 'dungeon', label: 'Items',            name: 'dungeon_items',              url: 'assets/SproutLands-SorrySprites/Early Access/Dungeon Pack/tiles/dungeon_items.png',                    cols: 5,  rows: 3,  firstgid: 4800  },
  { key: 'ts_dungeon_carts',              category: 'dungeon', label: 'Carts',            name: 'dungeon_carts',              url: 'assets/SproutLands-SorrySprites/Early Access/Dungeon Pack/tiles/Carts.png',                          cols: 3,  rows: 2,  firstgid: 4850  },
  { key: 'ts_dungeon_rails',              category: 'dungeon', label: 'Rails',            name: 'dungeon_rails',              url: 'assets/SproutLands-SorrySprites/Early Access/Dungeon Pack/tiles/Rails.png',                          cols: 4,  rows: 3,  firstgid: 4900  },
  { key: 'ts_dungeon_rocks',              category: 'dungeon', label: 'Rocks',            name: 'dungeon_rocks',              url: 'assets/SproutLands-SorrySprites/Early Access/Dungeon Pack/tiles/Rocks.png',                          cols: 4,  rows: 4,  firstgid: 4950  },
  { key: 'ts_dungeon_switch',             category: 'dungeon', label: 'Switch',           name: 'dungeon_switch',             url: 'assets/SproutLands-SorrySprites/Early Access/Dungeon Pack/tiles/switch.png',                           cols: 3,  rows: 1,  firstgid: 5000  },

  // ── Winter ──
  { key: 'ts_ice_tiles',    category: 'winter', label: 'Ice',    name: 'ice_tiles',    url: 'assets/SproutLands-SorrySprites/Early Access/Sprout winter/ice tiles.png',     cols: 4,  rows: 3,  firstgid: 5050  },
  { key: 'ts_snow_tiles_1', category: 'winter', label: 'Snow 1', name: 'snow_tiles_1', url: 'assets/SproutLands-SorrySprites/Early Access/Sprout winter/snow tiles 1.png', cols: 11, rows: 25, firstgid: 5100  },
  { key: 'ts_snow_tiles_2', category: 'winter', label: 'Snow 2', name: 'snow_tiles_2', url: 'assets/SproutLands-SorrySprites/Early Access/Sprout winter/snow tiles 2.png', cols: 11, rows: 25, firstgid: 5400  },

  // ── More ──
  { key: 'ts_grass_layers_sorry_1', name: 'grass_layers_sorry_1', category: 'more', label: 'Layers 1', name: 'grass_layers_sorry_1', url: 'assets/SproutLands-SorrySprites/Early Access/Plant update 2/Ground tilesets/Grass_Tile_Layers.png',       cols: 11, rows: 25, firstgid: 5700  },
  { key: 'ts_grass_layers_sorry_2', name: 'grass_layers_sorry_2', category: 'more', label: 'Layers 2', name: 'grass_layers_sorry_2', url: 'assets/SproutLands-SorrySprites/Early Access/Plant update 2/Ground tilesets/Grass_Tile_layers2.png',      cols: 10, rows: 25, firstgid: 6000  },
  { key: 'ts_grass_layers_sorry_3', name: 'grass_layers_sorry_3', category: 'more', label: 'Layers 3', name: 'grass_layers_sorry_3', url: 'assets/SproutLands-SorrySprites/Early Access/Plant update 2/Ground tilesets/Grass_Tile_layers3.png',      cols: 11, rows: 25, firstgid: 6300  },
  { key: 'ts_grass_layers_sorry_4', name: 'grass_layers_sorry_4', category: 'more', label: 'Layers 4', name: 'grass_layers_sorry_4', url: 'assets/SproutLands-SorrySprites/Early Access/Plant update 2/Ground tilesets/Grass_Tile_layers4.png',      cols: 11, rows: 25, firstgid: 6600  },
  { key: 'ts_blue_grass_layers_1',  name: 'blue_grass_layers_1',  category: 'more', label: 'Blue 1',   name: 'blue_grass_layers_1',  url: 'assets/SproutLands-SorrySprites/Early Access/Plant update 2/Ground tilesets/blue_tint_Grass_Tile_Layers.png',  cols: 11, rows: 25, firstgid: 6900  },
  { key: 'ts_blue_grass_layers_2',  name: 'blue_grass_layers_2',  category: 'more', label: 'Blue 2',   name: 'blue_grass_layers_2',  url: 'assets/SproutLands-SorrySprites/Early Access/Plant update 2/Ground tilesets/blue_tint_Grass_Tile_Layers2.png', cols: 11, rows: 25, firstgid: 7200  },
  { key: 'ts_blue_grass_layers_3',  name: 'blue_grass_layers_3',  category: 'more', label: 'Blue 3',   name: 'blue_grass_layers_3',  url: 'assets/SproutLands-SorrySprites/Early Access/Plant update 2/Ground tilesets/blue_tint_Grass_Tile_Layers3.png', cols: 11, rows: 25, firstgid: 7500  },
  { key: 'ts_blue_grass_layers_4',  name: 'blue_grass_layers_4',  category: 'more', label: 'Blue 4',   name: 'blue_grass_layers_4',  url: 'assets/SproutLands-SorrySprites/Early Access/Plant update 2/Ground tilesets/blue_tint_Grass_Tile_Layers4.png', cols: 11, rows: 25, firstgid: 7800  },
];

export const LEVELS = ['gym', 'main'];

export const OBJECTS = [
  // ── Objects (basicos / existentes) ──
  { key: 'plants',      label: 'Plants',      url: 'assets/SproutLands-Sprites/Objects/Basic Plants.png',             cols: 6, rows: 2, frameW: 16, frameH: 16, category: 'objects' },
  { key: 'grass_props', label: 'Grass Props', url: 'assets/SproutLands-Sprites/Objects/Basic Grass Biom things 1.png',cols: 9, rows: 5, frameW: 16, frameH: 16, category: 'objects' },
  { key: 'furniture',   group: 'furniture', variant: {version: 'basic'}, label: 'Furniture',   url: 'assets/SproutLands-Sprites/Objects/Basic Furniture.png',          cols: 9, rows: 6, frameW: 16, frameH: 16, category: 'objects' },


  // ── Nature ──
  { key: 'trees',       label: 'Trees',       url: 'assets/SproutLands-Sprites/Objects/Trees, stumps and bushes.png',  cols: 12, rows: 7, frameW: 16, frameH: 16, category: 'nature' },
  { key: 'mushrooms',   label: 'Mushrooms',   url: 'assets/SproutLands-Sprites/Objects/Mushrooms, Flowers, Stones.png',cols: 12, rows: 5, frameW: 16, frameH: 16, category: 'nature' },
  { key: 'farming',     label: 'Farming',     url: 'assets/SproutLands-Sprites/Objects/Farming Plants.png',            cols: 5, rows: 15, frameW: 16, frameH: 16, category: 'nature' },
  { key: 'water_objs',  label: 'Water Objs',  url: 'assets/SproutLands-Sprites/Objects/Water Objects.png',             cols: 12, rows: 2, frameW: 16, frameH: 16, category: 'nature' },

  // ── Structures ──
  { key: 'signs',       group: 'signs', variant: {type: 'default'}, label: 'Signs',       url: 'assets/SproutLands-Sprites/Objects/signs.png',                     cols: 6, rows: 4, frameW: 16, frameH: 16, category: 'structures' },
  { key: 'signs_sides', group: 'signs', variant: {type: 'side'},   label: 'Signs Side',  url: 'assets/SproutLands-Sprites/Objects/signs_sides.png',               cols: 8, rows: 2, frameW: 16, frameH: 16, category: 'structures' },
  { key: 'wood_bridge', group: 'bridge', variant: {version: 'v1'},  label: 'Bridge',      url: 'assets/SproutLands-Sprites/Objects/Wood Bridge.png',               cols: 5, rows: 3, frameW: 16, frameH: 16, category: 'structures' },
  { key: 'well',        label: 'Well',        url: 'assets/SproutLands-Sprites/Objects/Water well.png',                cols: 2, rows: 2, frameW: 16, frameH: 16, category: 'structures' },
  { key: 'workstation', label: 'Workstation', url: 'assets/SproutLands-Sprites/Objects/work station.png',              cols: 2, rows: 2, frameW: 16, frameH: 16, category: 'structures' },
  { key: 'paths',       label: 'Paths',       url: 'assets/SproutLands-Sprites/Objects/Paths.png',                     cols: 4, rows: 4, frameW: 16, frameH: 16, category: 'structures' },
  { key: 'boats',       label: 'Boats',       url: 'assets/SproutLands-Sprites/Objects/Boats.png',                     cols: 9, rows: 6, frameW: 16, frameH: 16, category: 'structures' },

  // ── Animals ──
  { key: 'free_chicken', label: 'Chicken',    url: 'assets/SproutLands-Sprites/Animals/Chicken/Free Chicken Sprites.png',cols: 4, rows: 2, frameW: 16, frameH: 16, category: 'animals' },
  { key: 'chicken', group: 'chicken', variant: {'size':'normal','color':'default'}, label: 'Chicken (full)',url:'assets/SproutLands-Sprites/Animals/Chicken/chicken default.png',   cols: 8, rows: 27, frameW: 16, frameH: 16, category: 'animals' },
  { key: 'cow', group: 'cow', variant: {'size':'normal','color':'light'}, label: 'Cow (full)', url: 'assets/SproutLands-Sprites/Animals/Cow/Light cow animations.png',   cols: 16, rows: 16, frameW: 16, frameH: 16, category: 'animals' },

  // ── Characters ──
  { key: 'premium_char', label: 'Premium Char',url:'assets/SproutLands-Sprites/Characters/Premium Charakter Spritesheet.png',cols: 8, rows: 24, frameW: 48, frameH: 48, category: 'characters' },

  // ── Items ──


  { key: 'piknik_basket',label: 'Basket',     url: 'assets/SproutLands-Sprites/Objects/Piknik basket.png',             cols: 1, rows: 1, frameW: 16, frameH: 16, category: 'items' },
  { key: 'piknik_blanket',label:'Blanket',    url: 'assets/SproutLands-Sprites/Objects/Piknik blanket.png',            cols: 3, rows: 3, frameW: 16, frameH: 16, category: 'items' },

  // ═══════════════════════════════════════════════════════════════
  //  NUEVOS ASSETS — incluye absolutamente todos los encontrados
  // ═══════════════════════════════════════════════════════════════

  // ── Characters ──
  { key: 'basic_char',         label: 'Basic Char',         url: 'assets/SproutLands-Sprites/Characters/Basic Charakter Spritesheet.png', cols: 4, rows: 4, frameW: 48, frameH: 48, category: 'characters' },
  { key: 'basic_char_actions', label: 'Char Actions',       url: 'assets/SproutLands-Sprites/Characters/Basic Charakter Actions.png',       cols: 2, rows: 12, frameW: 48, frameH: 48, category: 'characters' },
  { key: 'egg_and_nest',       label: 'Nest',               url: 'assets/SproutLands-Sprites/Characters/Egg_And_Nest.png',                 cols: 4, rows: 1, frameW: 16, frameH: 16, category: 'animals' },
  { key: 'water_wateringcan',  label: 'Wateringcan',        url: 'assets/SproutLands-Sprites/Characters/water from wateringcan frames.png', cols: 27, rows: 9, frameW: 16, frameH: 16, category: 'characters' },

  // ── Animals: Chickens ──
  { key: 'chicken_blue', group: 'chicken', variant: {'size':'normal','color':'blue'}, label: 'Chicken Blue',  url: 'assets/SproutLands-Sprites/Animals/Chicken/chicken blue.png',  cols: 8, rows: 27, frameW: 16, frameH: 16, category: 'animals' },
  { key: 'chicken_brown', group: 'chicken', variant: {'size':'normal','color':'brown'}, label: 'Chicken Brown', url: 'assets/SproutLands-Sprites/Animals/Chicken/chicken brown.png', cols: 8, rows: 27, frameW: 16, frameH: 16, category: 'animals' },
  { key: 'chicken_green', group: 'chicken', variant: {'size':'normal','color':'green'}, label: 'Chicken Green', url: 'assets/SproutLands-Sprites/Animals/Chicken/chicken green.png', cols: 8, rows: 27, frameW: 16, frameH: 16, category: 'animals' },
  { key: 'chicken_red', group: 'chicken', variant: {'size':'normal','color':'red'}, label: 'Chicken Red',   url: 'assets/SproutLands-Sprites/Animals/Chicken/chicken red.png',   cols: 8, rows: 27, frameW: 16, frameH: 16, category: 'animals' },

  // ── Animals: Chicken Babies ──
  { key: 'chicken_baby', group: 'chicken', variant: {'size':'baby','color':'default'}, label: 'Baby Chicken',      url: 'assets/SproutLands-Sprites/Animals/Chicken_Baby/Chicken_Baby.png',       cols: 8, rows: 19, frameW: 16, frameH: 16, category: 'animals' },
  { key: 'chicken_baby_blue', group: 'chicken', variant: {'size':'baby','color':'blue'}, label: 'Baby Chicken Blue', url: 'assets/SproutLands-Sprites/Animals/Chicken_Baby/Chicken_Baby_Blue.png', cols: 8, rows: 19, frameW: 16, frameH: 16, category: 'animals' },
  { key: 'chicken_baby_brown', group: 'chicken', variant: {'size':'baby','color':'brown'}, label: 'Baby Chicken Brown',url: 'assets/SproutLands-Sprites/Animals/Chicken_Baby/Chicken_Baby_Brown.png',cols: 8, rows: 19, frameW: 16, frameH: 16, category: 'animals' },
  { key: 'chicken_baby_green', group: 'chicken', variant: {'size':'baby','color':'green'}, label: 'Baby Chicken Green',url: 'assets/SproutLands-Sprites/Animals/Chicken_Baby/Chicken_Baby_Green.png',cols: 8, rows: 19, frameW: 16, frameH: 16, category: 'animals' },
  { key: 'chicken_baby_red', group: 'chicken', variant: {'size':'baby','color':'red'}, label: 'Baby Chicken Red',  url: 'assets/SproutLands-Sprites/Animals/Chicken_Baby/Chicken_Baby_Red.png',  cols: 8, rows: 19, frameW: 16, frameH: 16, category: 'animals' },

  // ── Animals: Chicken Eggs ──
  { key: 'egg_spritesheet', group: 'egg', variant: {'color':'default'}, label: 'Egg Sheet',      url: 'assets/SproutLands-Sprites/Animals/Chicken_Egg/Egg_Spritesheet.png',      cols: 10, rows: 18, frameW: 16, frameH: 16, category: 'animals' },
  { key: 'egg_spritesheet_blue', group: 'egg', variant: {'color':'blue'}, label: 'Egg Sheet Blue', url: 'assets/SproutLands-Sprites/Animals/Chicken_Egg/Egg_Spritesheet_blue.png', cols: 10, rows: 18, frameW: 16, frameH: 16, category: 'animals' },
  { key: 'egg_spritesheet_brown', group: 'egg', variant: {'color':'brown'}, label: 'Egg Sheet Brown',url: 'assets/SproutLands-Sprites/Animals/Chicken_Egg/Egg_Spritesheet_Brown.png',cols: 10, rows: 18, frameW: 16, frameH: 16, category: 'animals' },
  { key: 'egg_spritesheet_green', group: 'egg', variant: {'color':'green'}, label: 'Egg Sheet Green',url: 'assets/SproutLands-Sprites/Animals/Chicken_Egg/Egg_Spritesheet_Green.png',cols: 10, rows: 18, frameW: 16, frameH: 16, category: 'animals' },
  { key: 'egg_spritesheet_red', group: 'egg', variant: {'color':'red'}, label: 'Egg Sheet Red',  url: 'assets/SproutLands-Sprites/Animals/Chicken_Egg/Egg_Spritesheet_red.png',  cols: 10, rows: 18, frameW: 16, frameH: 16, category: 'animals' },

  // ── Animals: Cows ──
  { key: 'cow_brown', group: 'cow', variant: {'size':'normal','color':'brown'}, label: 'Cow Brown',  url: 'assets/SproutLands-Sprites/Animals/Cow/Brown cow animations.png',          cols: 16, rows: 16, frameW: 16, frameH: 16, category: 'animals' },
  { key: 'cow_green', group: 'cow', variant: {'size':'normal','color':'green'}, label: 'Cow Green',  url: 'assets/SproutLands-Sprites/Animals/Cow/Green cow animation sprites.png', cols: 16, rows: 16, frameW: 16, frameH: 16, category: 'animals' },
  { key: 'cow_pink', group: 'cow', variant: {'size':'normal','color':'pink'}, label: 'Cow Pink',   url: 'assets/SproutLands-Sprites/Animals/Cow/Pink cow animation sprites.png',  cols: 16, rows: 16, frameW: 16, frameH: 16, category: 'animals' },
  { key: 'cow_purple', group: 'cow', variant: {'size':'normal','color':'purple'}, label: 'Cow Purple', url: 'assets/SproutLands-Sprites/Animals/Cow/Purple cow animation sprites.png',cols: 16, rows: 16, frameW: 16, frameH: 16, category: 'animals' },

  // ── Animals: Baby Cows ──
  { key: 'cow_baby_brown', group: 'cow', variant: {'size':'baby','color':'brown'}, label: 'Baby Cow Brown',  url: 'assets/SproutLands-Sprites/Animals/Cow_Baby/baby brown cow animations sprites.png', cols: 16, rows: 18, frameW: 16, frameH: 16, category: 'animals' },
  { key: 'cow_baby_green', group: 'cow', variant: {'size':'baby','color':'green'}, label: 'Baby Cow Green',  url: 'assets/SproutLands-Sprites/Animals/Cow_Baby/baby green cow animations sprites.png', cols: 16, rows: 18, frameW: 16, frameH: 16, category: 'animals' },
  { key: 'cow_baby_light', group: 'cow', variant: {'size':'baby','color':'light'}, label: 'Baby Cow Light',  url: 'assets/SproutLands-Sprites/Animals/Cow_Baby/baby light cow animations sprites.png', cols: 16, rows: 18, frameW: 16, frameH: 16, category: 'animals' },
  { key: 'cow_baby_pink', group: 'cow', variant: {'size':'baby','color':'pink'}, label: 'Baby Cow Pink',   url: 'assets/SproutLands-Sprites/Animals/Cow_Baby/baby pink cow animations sprites.png',  cols: 16, rows: 18, frameW: 16, frameH: 16, category: 'animals' },
  { key: 'cow_baby_purple', group: 'cow', variant: {'size':'baby','color':'purple'}, label: 'Baby Cow Purple', url: 'assets/SproutLands-Sprites/Animals/Cow_Baby/baby purple cow animations sprites.png',cols: 16, rows: 18, frameW: 16, frameH: 16, category: 'animals' },

  // ── Nature: Trees with fruit ──
  { key: 'tree_full', group: 'tree', variant: {'fruit':'none'}, label: 'Tree Full',   url: 'assets/SproutLands-Sprites/Objects/Tree animations/tree sprites.png',      cols: 36, rows: 15, frameW: 16, frameH: 16, category: 'nature' },
  { key: 'tree_apple', group: 'tree', variant: {'fruit':'apple'}, label: 'Tree Apple',  url: 'assets/SproutLands-Sprites/Objects/Tree animations/tree apple sprites.png',  cols: 36, rows: 15, frameW: 16, frameH: 16, category: 'nature' },
  { key: 'tree_orange', group: 'tree', variant: {'fruit':'orange'}, label: 'Tree Orange', url: 'assets/SproutLands-Sprites/Objects/Tree animations/tree orange sprites.png', cols: 36, rows: 15, frameW: 16, frameH: 16, category: 'nature' },
  { key: 'tree_peach', group: 'tree', variant: {'fruit':'peach'}, label: 'Tree Peach',  url: 'assets/SproutLands-Sprites/Objects/Tree animations/tree peach sprites.png',  cols: 36, rows: 15, frameW: 16, frameH: 16, category: 'nature' },
  { key: 'tree_pear', group: 'tree', variant: {'fruit':'pear'}, label: 'Tree Pear',   url: 'assets/SproutLands-Sprites/Objects/Tree animations/tree pear sprites.png',   cols: 36, rows: 15, frameW: 16, frameH: 16, category: 'nature' },

  // ── Nature: Fruit without tree ──
  { key: 'no_tree_apple', group: 'no_tree_fruit', variant: {'type':'apple'}, label: 'Fruit Apple',  url: 'assets/SproutLands-Sprites/Objects/Tree animations/Fruit animations without tree/no_tree_appel_sprites.png',  cols: 36, rows: 12, frameW: 16, frameH: 16, category: 'nature' },
  { key: 'no_tree_orange', group: 'no_tree_fruit', variant: {'type':'orange'}, label: 'Fruit Orange', url: 'assets/SproutLands-Sprites/Objects/Tree animations/Fruit animations without tree/no_tree_orange_sprites.png',cols: 36, rows: 12, frameW: 16, frameH: 16, category: 'nature' },
  { key: 'no_tree_peach', group: 'no_tree_fruit', variant: {'type':'peach'}, label: 'Fruit Peach',  url: 'assets/SproutLands-Sprites/Objects/Tree animations/Fruit animations without tree/no_tree_peach_sprites.png', cols: 36, rows: 12, frameW: 16, frameH: 16, category: 'nature' },
  { key: 'no_tree_pear', group: 'no_tree_fruit', variant: {'type':'pear'}, label: 'Fruit Pear',   url: 'assets/SproutLands-Sprites/Objects/Tree animations/Fruit animations without tree/no_tree_pear_sprites.png',  cols: 36, rows: 12, frameW: 16, frameH: 16, category: 'nature' },

  // ── Structures: Buildings / Farm ──
  { key: 'barn_structures',  label: 'Barn',          url: 'assets/SproutLands-Sprites/Tilesets/Building parts/Animal Structures/Barn structures.png',   cols: 3, rows: 4, frameW: 16, frameH: 16, category: 'structures' },
  { key: 'chicken_houses',   label: 'Chicken Houses',url: 'assets/SproutLands-Sprites/Tilesets/Building parts/Animal Structures/Chikcen_Houses.png',  cols: 24,rows: 11,frameW: 16, frameH: 16, category: 'structures' },
  { key: 'water_tray',       label: 'Water Tray',    url: 'assets/SproutLands-Sprites/Tilesets/Building parts/Animal Structures/Water tray.png',     cols: 6, rows: 1, frameW: 16, frameH: 16, category: 'structures' },
  { key: 'door_animation',   label: 'Door Anim',     url: 'assets/SproutLands-Sprites/Tilesets/Building parts/door animation sprites.png',           cols: 18,rows: 2, frameW: 16, frameH: 16, category: 'structures' },
  { key: 'fence_gates_anim', label: 'Fence Gates',   url: 'assets/SproutLands-Sprites/Tilesets/Building parts/Fence gates animation sprites .png',     cols: 10,rows: 3, frameW: 16, frameH: 16, category: 'structures' },
  { key: 'mailbox_anim',     label: 'Mailbox',       url: 'assets/SproutLands-Sprites/Tilesets/Building parts/Mailbox Animation Frames.png',         cols: 11,rows: 21,frameW: 16, frameH: 16, category: 'structures' },
  { key: 'wooden_bridge_v2', group: 'bridge', variant: {version: 'v2'}, label: 'Bridge v2',     url: 'assets/SproutLands-Sprites/Tilesets/Building parts/Wooden_Bridge_v2.png',                 cols: 4, rows: 3, frameW: 16, frameH: 16, category: 'structures' },

  // ── Items ──

  { key: 'egg_items',          label: 'Egg',            url: 'assets/SproutLands-Sprites/Objects/Items/Egg items.png',                  cols: 5, rows: 1,  frameW: 16, frameH: 16, category: 'items' },
  { key: 'farming_plants_items', group: 'farming_items', variant: {version: 'v1'}, label: 'Farming',        url: 'assets/SproutLands-Sprites/Objects/Items/Farming Plants items.png',       cols: 2, rows: 15, frameW: 16, frameH: 16, category: 'items' },
  { key: 'fruit_berries_items',label: 'Fruit',         url: 'assets/SproutLands-Sprites/Objects/Items/fruit and berries items.png',    cols: 4, rows: 2,  frameW: 16, frameH: 16, category: 'items' },
  { key: 'grass_ground_items',  label: 'Ground',         url: 'assets/SproutLands-Sprites/Objects/Items/grass-n-ground-tile-items.png',  cols: 6, rows: 2,  frameW: 16, frameH: 16, category: 'items' },
  { key: 'item_shadow',        label: 'Item Shadow',    url: 'assets/SproutLands-Sprites/Objects/Items/item shadow.png',                cols: 1, rows: 1,  frameW: 16, frameH: 16, category: 'items' },
  { key: 'milk_items',         label: 'Milk',           url: 'assets/SproutLands-Sprites/Objects/Items/milk-items.png',                  cols: 4, rows: 11, frameW: 16, frameH: 16, category: 'items' },
  { key: 'tools_items',        label: 'Tools',          url: 'assets/SproutLands-Sprites/Objects/Items/tools and meterials.png',       cols: 4, rows: 3,  frameW: 16, frameH: 16, category: 'items' },

  // ═══════════════════════════════════════════════════════════════
  //  SORRYSPRITES ASSETS
  // ═══════════════════════════════════════════════════════════════

  // ── Dungeon Pack ──
  { key: 'bat_animations', group: 'bat', variant: {'size':'normal'}, label: 'Bat',            url: 'assets/SproutLands-SorrySprites/Early Access/Dungeon Pack/enemies/bat_animations.png',       cols: 6, rows: 2, frameW: 32, frameH: 32, category: 'animals' },
  { key: 'small_bat_animations', group: 'bat', variant: {'size':'small'}, label: 'Small Bat',      url: 'assets/SproutLands-SorrySprites/Early Access/Dungeon Pack/enemies/small_bat_animations.png', cols: 6, rows: 2, frameW: 32, frameH: 32, category: 'animals' },
  { key: 'small_green_slime',    label: 'Green Slime',    url: 'assets/SproutLands-SorrySprites/Early Access/Dungeon Pack/enemies/small_green_slime_animations.png', cols: 12, rows: 8, frameW: 38, frameH: 38, category: 'animals' },
  { key: 'dungeon_probs',        label: 'Dungeon Props',  url: 'assets/SproutLands-SorrySprites/Early Access/Dungeon Pack/tiles/Dungeon_probs.png',          cols: 8,  rows: 4, frameW: 16, frameH: 16, category: 'objects' },
  { key: 'dungeon_carts_obj',    label: 'Dungeon Carts',  url: 'assets/SproutLands-SorrySprites/Early Access/Dungeon Pack/tiles/Carts.png',                  cols: 3,  rows: 2, frameW: 16, frameH: 16, category: 'structures' },
  { key: 'dungeon_rocks_obj',    label: 'Dungeon Rocks',  url: 'assets/SproutLands-SorrySprites/Early Access/Dungeon Pack/tiles/Rocks.png',                  cols: 4,  rows: 4, frameW: 16, frameH: 16, category: 'nature' },
  { key: 'dungeon_switch_obj',   label: 'Dungeon Switch', url: 'assets/SproutLands-SorrySprites/Early Access/Dungeon Pack/tiles/switch.png',                 cols: 3,  rows: 1, frameW: 16, frameH: 16, category: 'structures' },

  // ── Ocean Pack ──
  { key: 'big_fish_2', group: 'fish', variant: {'size':'big'}, label: 'Big Fish',       url: 'assets/SproutLands-SorrySprites/Early Access/Ocean Pack/big fish 2 swimming in cirkels.png', cols: 15, rows: 1, frameW: 16, frameH: 16, category: 'animals' },
  { key: 'fish_sprites',    label: 'Fish Sprites',   url: 'assets/SproutLands-SorrySprites/Early Access/Ocean Pack/Fish Sprites.png',                   cols: 10, rows: 5, frameW: 16, frameH: 16, category: 'animals' },
  { key: 'fishing_back', group: 'fishing', variant: {'direction':'back'}, label: 'Fishing Back',   url: 'assets/SproutLands-SorrySprites/Early Access/Ocean Pack/fishing animation back.png',         cols: 96, rows: 18,frameW: 16, frameH: 16, category: 'characters' },
  { key: 'fishing_front', group: 'fishing', variant: {'direction':'front'}, label: 'Fishing Front',  url: 'assets/SproutLands-SorrySprites/Early Access/Ocean Pack/fishing animation front.png',        cols: 96, rows: 18,frameW: 16, frameH: 16, category: 'characters' },
  { key: 'fishing_side', group: 'fishing', variant: {'direction':'side'}, label: 'Fishing Side',   url: 'assets/SproutLands-SorrySprites/Early Access/Ocean Pack/fishing animation side.png',         cols: 96, rows: 18,frameW: 16, frameH: 16, category: 'characters' },
  { key: 'fishing_splash',  label: 'Fishing Splash', url: 'assets/SproutLands-SorrySprites/Early Access/Ocean Pack/fishing water splash frames and rod.png', cols: 12, rows: 15,frameW: 16, frameH: 16, category: 'objects' },
  { key: 'medium_fish', group: 'fish', variant: {'size':'medium'}, label: 'Medium Fish',    url: 'assets/SproutLands-SorrySprites/Early Access/Ocean Pack/mediuml fish.png',                   cols: 15, rows: 1, frameW: 16, frameH: 16, category: 'animals' },
  { key: 'small_fish', group: 'fish', variant: {'size':'small'}, label: 'Small Fish',     url: 'assets/SproutLands-SorrySprites/Early Access/Ocean Pack/small fish.png',                     cols: 15, rows: 1, frameW: 16, frameH: 16, category: 'animals' },


  // ── Plant update 2 ──
  { key: 'birch_biom', group: 'biom', variant: {'type':'birch'}, label: 'Birch Biom',             url: 'assets/SproutLands-SorrySprites/Early Access/Plant update 2/Birch wood Biom.png',                      cols: 10, rows: 4, frameW: 16, frameH: 16, category: 'nature' },
  { key: 'birch_water_plants', group: 'water_plants', variant: {'type':'birch'}, label: 'Birch Water Plants',     url: 'assets/SproutLands-SorrySprites/Early Access/Plant update 2/Birch wood Biom water plants.png',          cols: 10, rows: 4, frameW: 16, frameH: 16, category: 'nature' },
  { key: 'cherry_biom', group: 'biom', variant: {'type':'cherry'}, label: 'Cherry Biom',            url: 'assets/SproutLands-SorrySprites/Early Access/Plant update 2/Cherry Blossom Biom.png',                   cols: 10, rows: 5, frameW: 16, frameH: 16, category: 'nature' },
  { key: 'cherry_water_plants', group: 'water_plants', variant: {'type':'cherry'}, label: 'Cherry Water Plants',    url: 'assets/SproutLands-SorrySprites/Early Access/Plant update 2/Cherry Blossom Biom water plants.png',      cols: 10, rows: 5, frameW: 16, frameH: 16, category: 'nature' },
  { key: 'farming_items_v2', group: 'farming_items', variant: {version: 'v2'}, label: 'Farming Items v2',       url: 'assets/SproutLands-SorrySprites/Early Access/Plant update 2/Farming Plants items v2.png',               cols: 5,  rows: 14,frameW: 16, frameH: 16, category: 'items' },
  { key: 'farming_v2', group: 'farming_v2', variant: {'watered':'no'}, label: 'Farming v2',             url: 'assets/SproutLands-SorrySprites/Early Access/Plant update 2/Farming Plants v2.png',                    cols: 7,  rows: 33,frameW: 16, frameH: 16, category: 'nature' },
  { key: 'farming_v2_watered', group: 'farming_v2', variant: {'watered':'yes'}, label: 'Farming v2 Watered',     url: 'assets/SproutLands-SorrySprites/Early Access/Plant update 2/Farming Plants v2 watered.png',             cols: 7,  rows: 33,frameW: 16, frameH: 16, category: 'nature' },
  { key: 'pine_biom', group: 'biom', variant: {'type':'pine'}, label: 'Pine Biom',              url: 'assets/SproutLands-SorrySprites/Early Access/Plant update 2/Pine Tree Biome.png',                       cols: 10, rows: 4, frameW: 16, frameH: 16, category: 'nature' },
  { key: 'pine_water_plants', group: 'water_plants', variant: {'type':'pine'}, label: 'Pine Water Plants',      url: 'assets/SproutLands-SorrySprites/Early Access/Plant update 2/Pine Tree Biome water plants.png',        cols: 10, rows: 4, frameW: 16, frameH: 16, category: 'nature' },
  { key: 'trees_v2',                   label: 'Trees v2',               url: 'assets/SproutLands-SorrySprites/Early Access/Plant update 2/Trees, stumps and bushes v2.png',         cols: 12, rows: 8, frameW: 16, frameH: 16, category: 'nature' },
  { key: 'wood_shrooms',               label: 'Wood & Shrooms',         url: 'assets/SproutLands-SorrySprites/Early Access/Plant update 2/wood n shroms.png',                         cols: 6,  rows: 5, frameW: 16, frameH: 16, category: 'nature' },
  { key: 'birch_chest', group: 'chest', variant: {'type':'birch'}, label: 'Birch Chest',            url: 'assets/SproutLands-SorrySprites/Early Access/Plant update 2/Furniture/Birch_Chest.png',                 cols: 10, rows: 4, frameW: 16, frameH: 16, category: 'structures' },
  { key: 'cherry_chest', group: 'chest', variant: {'type':'cherry'}, label: 'Cherry Chest',           url: 'assets/SproutLands-SorrySprites/Early Access/Plant update 2/Furniture/Cherry_Chest.png',                cols: 10, rows: 4, frameW: 16, frameH: 16, category: 'structures' },
  { key: 'golden_chest', group: 'chest', variant: {'type':'golden'}, label: 'Golden Chest',           url: 'assets/SproutLands-SorrySprites/Early Access/Plant update 2/Furniture/Golden_Chest.png',                cols: 10, rows: 4, frameW: 16, frameH: 16, category: 'structures' },
  { key: 'oak_chest', group: 'chest', variant: {'type':'oak'}, label: 'Oak Chest',              url: 'assets/SproutLands-SorrySprites/Early Access/Plant update 2/Furniture/Oak_Chest.png',                   cols: 10, rows: 4, frameW: 16, frameH: 16, category: 'structures' },
  { key: 'pine_chest', group: 'chest', variant: {'type':'pine'}, label: 'Pine Chest',             url: 'assets/SproutLands-SorrySprites/Early Access/Plant update 2/Furniture/Pine_Chest.png',                  cols: 10, rows: 4, frameW: 16, frameH: 16, category: 'structures' },
  { key: 'silver_chest', group: 'chest', variant: {'type':'silver'}, label: 'Silver Chest',           url: 'assets/SproutLands-SorrySprites/Early Access/Plant update 2/Furniture/Silver_Chest.png',                cols: 10, rows: 4, frameW: 16, frameH: 16, category: 'structures' },
  { key: 'new_wooden_furniture', group: 'furniture', variant: {version: 'new'}, label: 'New Furniture',          url: 'assets/SproutLands-SorrySprites/Early Access/Plant update 2/Furniture/new Wooden Furniture.png',        cols: 15, rows: 8, frameW: 16, frameH: 16, category: 'objects' },
  { key: 'new_wooden_furniture_items', group: 'furniture', variant: {version: 'new_2'}, label: 'New Furniture Items',    url: 'assets/SproutLands-SorrySprites/Early Access/Plant update 2/Furniture/new Wooden Furniture items.png',   cols: 12, rows: 5, frameW: 16, frameH: 16, category: 'objects' },

  // ── Winter ──
  { key: 'campfire',        label: 'Campfire',        url: 'assets/SproutLands-SorrySprites/Early Access/Sprout winter/campfire.png',          cols: 7,  rows: 3, frameW: 16, frameH: 16, category: 'structures' },
  { key: 'christmas_tree',  label: 'Christmas Tree',  url: 'assets/SproutLands-SorrySprites/Early Access/Sprout winter/christmas tree.png',      cols: 24, rows: 4, frameW: 16, frameH: 16, category: 'nature' },
  { key: 'fire_animation',  label: 'Fire Animation',  url: 'assets/SproutLands-SorrySprites/Early Access/Sprout winter/fire animation.png',    cols: 16, rows: 1, frameW: 16, frameH: 16, category: 'structures' },
  { key: 'present_green', group: 'present', variant: {'color':'green','variant':'default'}, label: 'Present Green',   url: 'assets/SproutLands-SorrySprites/Early Access/Sprout winter/present green.png',      cols: 10, rows: 1, frameW: 16, frameH: 16, category: 'items' },
  { key: 'present_green_2', group: 'present', variant: {'color':'green','variant':'2'}, label: 'Present Green 2', url: 'assets/SproutLands-SorrySprites/Early Access/Sprout winter/present green 2.png',    cols: 10, rows: 1, frameW: 16, frameH: 16, category: 'items' },
  { key: 'present_red', group: 'present', variant: {'color':'red','variant':'default'}, label: 'Present Red',     url: 'assets/SproutLands-SorrySprites/Early Access/Sprout winter/present red.png',         cols: 10, rows: 1, frameW: 16, frameH: 16, category: 'items' },
  { key: 'present_red_2', group: 'present', variant: {'color':'red','variant':'2'}, label: 'Present Red 2',   url: 'assets/SproutLands-SorrySprites/Early Access/Sprout winter/present red 2.png',       cols: 10, rows: 1, frameW: 16, frameH: 16, category: 'items' },
  { key: 'present_red_3', group: 'present', variant: {'color':'red','variant':'3'}, label: 'Present Red 3',   url: 'assets/SproutLands-SorrySprites/Early Access/Sprout winter/present red 3.png',       cols: 10, rows: 1, frameW: 16, frameH: 16, category: 'items' },
  { key: 'snowflakes',      label: 'Snowflakes',      url: 'assets/SproutLands-SorrySprites/Early Access/Sprout winter/snomwflakes.png',          cols: 1,  rows: 3, frameW: 16, frameH: 16, category: 'nature' },
  { key: 'winter_items',    label: 'Winter',          url: 'assets/SproutLands-SorrySprites/Early Access/Sprout winter/winter items.png',        cols: 2,  rows: 4, frameW: 16, frameH: 16, category: 'items' },
  { key: 'winter_sprites',  label: 'Winter Sprites',  url: 'assets/SproutLands-SorrySprites/Early Access/Sprout winter/winter sprites.png',      cols: 15, rows: 9, frameW: 16, frameH: 16, category: 'objects' },

  // ── Village pack ──
  { key: 'wooden_door_spritesheet',      label: 'Wooden Door',           url: 'assets/SproutLands-SorrySprites/Early Access/Village pack/houses/wooden_door_spritesheet.png',                                cols: 24, rows: 3, frameW: 16, frameH: 16, category: 'structures' },
  { key: 'grey_brick_houses', group: 'brick_house', variant: {'door':'no','grass':'no'}, label: 'Grey Brick House',      url: 'assets/SproutLands-SorrySprites/Early Access/Village pack/houses/Grey brick house/grey_brick_houses.png',                      cols: 18, rows: 5, frameW: 16, frameH: 16, category: 'structures' },
  { key: 'grey_brick_houses_doors', group: 'brick_house', variant: {'door':'yes','grass':'no'}, label: 'Grey Brick + Door',     url: 'assets/SproutLands-SorrySprites/Early Access/Village pack/houses/Grey brick house/grey_brick_houses_with_doors.png',          cols: 18, rows: 5, frameW: 16, frameH: 16, category: 'structures' },
  { key: 'grey_brick_houses_doors_grass', group: 'brick_house', variant: {'door':'yes','grass':'yes'}, label: 'Grey Brick Door Grass', url: 'assets/SproutLands-SorrySprites/Early Access/Village pack/houses/Grey brick house/grey_brick_houses_with_doors_grass.png',  cols: 18, rows: 5, frameW: 16, frameH: 16, category: 'structures' },
  { key: 'grey_brick_houses_grass', group: 'brick_house', variant: {'door':'no','grass':'yes'}, label: 'Grey Brick Grass',      url: 'assets/SproutLands-SorrySprites/Early Access/Village pack/houses/Grey brick house/grey_brick_houses_with_grass.png',          cols: 18, rows: 5, frameW: 16, frameH: 16, category: 'structures' },
  { key: 'small_house', group: 'small_house', variant: {'light':'off','door':'no','grass':'no'}, label: 'Small House',           url: 'assets/SproutLands-SorrySprites/Early Access/Village pack/houses/small house/small_House.png',                                cols: 12, rows: 12,frameW: 16, frameH: 16, category: 'structures' },
  { key: 'small_house_light', group: 'small_house', variant: {'light':'on','door':'no','grass':'no'}, label: 'Small House Light',     url: 'assets/SproutLands-SorrySprites/Early Access/Village pack/houses/small house/small_House_light.png',                          cols: 12, rows: 12,frameW: 16, frameH: 16, category: 'structures' },
  { key: 'small_house_door', group: 'small_house', variant: {'light':'off','door':'yes','grass':'no'}, label: 'Small House + Door',    url: 'assets/SproutLands-SorrySprites/Early Access/Village pack/houses/small house/small_House_with_door.png',                        cols: 12, rows: 12,frameW: 16, frameH: 16, category: 'structures' },
  { key: 'small_house_door_grass', group: 'small_house', variant: {'light':'off','door':'yes','grass':'yes'}, label: 'Small House Door Grass',url: 'assets/SproutLands-SorrySprites/Early Access/Village pack/houses/small house/small_House_with_door_grass.png',                  cols: 12, rows: 12,frameW: 16, frameH: 16, category: 'structures' },
  { key: 'small_house_grass', group: 'small_house', variant: {'light':'off','door':'no','grass':'yes'}, label: 'Small House Grass',     url: 'assets/SproutLands-SorrySprites/Early Access/Village pack/houses/small house/small_House_with_grass.png',                     cols: 12, rows: 12,frameW: 16, frameH: 16, category: 'structures' },
  { key: 'small_house_light_door', group: 'small_house', variant: {'light':'on','door':'yes','grass':'no'}, label: 'Small House Lt Door',   url: 'assets/SproutLands-SorrySprites/Early Access/Village pack/houses/small house/small_House_light_with_door.png',                 cols: 12, rows: 12,frameW: 16, frameH: 16, category: 'structures' },
  { key: 'small_house_light_door_grass', group: 'small_house', variant: {'light':'on','door':'yes','grass':'yes'}, label: 'Small House Lt D Grs',  url: 'assets/SproutLands-SorrySprites/Early Access/Village pack/houses/small house/small_House_light_with_door_grass.png',          cols: 12, rows: 12,frameW: 16, frameH: 16, category: 'structures' },
  { key: 'small_house_light_grass', group: 'small_house', variant: {'light':'on','door':'no','grass':'yes'}, label: 'Small House Lt Grass',  url: 'assets/SproutLands-SorrySprites/Early Access/Village pack/houses/small house/small_House_light_with_grass.png',              cols: 12, rows: 12,frameW: 16, frameH: 16, category: 'structures' },
  { key: 'small_house_shadow', group: 'house_shadow', variant: {house: 'small_house'}, label: 'Small House Shadow',    url: 'assets/SproutLands-SorrySprites/Early Access/Village pack/houses/small house/small_House_shadow.png',                           cols: 4,  rows: 1, frameW: 16, frameH: 16, category: 'shadow' },
  { key: 'small_huts', group: 'small_hut', variant: {'door':'no','grass':'no'}, label: 'Small Huts',            url: 'assets/SproutLands-SorrySprites/Early Access/Village pack/houses/small hut/small_huts.png',                                     cols: 12, rows: 12,frameW: 16, frameH: 16, category: 'structures' },
  { key: 'small_huts_doors', group: 'small_hut', variant: {'door':'yes','grass':'no'}, label: 'Small Huts + Doors',    url: 'assets/SproutLands-SorrySprites/Early Access/Village pack/houses/small hut/small_huts_with_doors.png',                        cols: 12, rows: 12,frameW: 16, frameH: 16, category: 'structures' },
  { key: 'small_huts_doors_grass', group: 'small_hut', variant: {'door':'yes','grass':'yes'}, label: 'Small Huts Doors Grass',url: 'assets/SproutLands-SorrySprites/Early Access/Village pack/houses/small hut/small_huts_with_doors_grass.png',                  cols: 12, rows: 12,frameW: 16, frameH: 16, category: 'structures' },
  { key: 'small_huts_grass', group: 'small_hut', variant: {'door':'no','grass':'yes'}, label: 'Small Huts Grass',      url: 'assets/SproutLands-SorrySprites/Early Access/Village pack/houses/small hut/small_huts_with_grass.png',                       cols: 12, rows: 12,frameW: 16, frameH: 16, category: 'structures' },
  { key: 'small_hut_shadow', group: 'house_shadow', variant: {house: 'small_hut'}, label: 'Small Hut Shadow',      url: 'assets/SproutLands-SorrySprites/Early Access/Village pack/houses/small hut/small_hut_shadow.png',                             cols: 4,  rows: 1, frameW: 16, frameH: 16, category: 'shadow' },
  { key: 'brick_houses_shadow', group: 'house_shadow', variant: {house: 'brick_house'}, label: 'Brick House Shadow',    url: 'assets/SproutLands-SorrySprites/Early Access/Village pack/houses/Grey brick house/brick_houses_shadow.png',                     cols: 6,  rows: 2, frameW: 16, frameH: 16, category: 'shadow' },

  // ── Tests (NPCs decorativos) ──
  { key: 'teemo_8dir', group: 'test_npc', variant: {'character':'teemo'}, label: 'Teemo NPC',         url: 'assets/SproutLands-SorrySprites/Tests/teemo 8 directions.png',                   cols: 8, rows: 3, frameW: 16, frameH: 16, category: 'characters' },
  { key: 'free_char_cupnooble', group: 'test_npc', variant: {'character':'cupnooble'}, label: 'Cupnooble NPC',     url: 'assets/SproutLands-SorrySprites/Tests/free_character_spritesheet_by-cupnooble.png', cols: 8, rows: 6, frameW: 16, frameH: 16, category: 'characters' },
];

export const OBJECT_CATEGORIES = {
  objects:     { label: 'Objects' },
  nature:      { label: 'Nature' },
  structures:  { label: 'Structures' },
  animals:     { label: 'Animals' },
  characters:  { label: 'Characters' },
  items:       { label: 'Items' },
  shadow:      { label: 'Shadow' },
};

/**
 * 4-neighbour cardinal bitmask: N=1 E=2 S=4 W=8.
 * Each terrain maps bitmask (0-15) to the correct GID for that combination.
 * Standard 9 cases come from the 3×3 autotile block; the rest fall back to
 * the center tile so painted areas always look passable.
 *
 * How to read the mapping:
 *   6  = E+S      → top-left corner     (no N, no W)
 *   14 = E+S+W    → top edge            (no N)
 *   12 = S+W      → top-right corner    (no N, no E)
 *   7  = N+E+S    → left edge           (no W)
 *   15 = N+E+S+W  → center fill
 *   13 = N+S+W    → right edge          (no E)
 *   3  = N+E      → bottom-left corner  (no S, no W)
 *   11 = N+E+W    → bottom edge         (no S)
 *   9  = N+W      → bottom-right corner (no S, no E)
 */
export const TERRAINS = [
  {
    name: 'grass',
    label: 'Grass',
    tilesetName: 'grass',
    tiles: {
      0: 13, 1: 24, 2: 12,
      3: 23, 4: 2, 5: 13,
      6: 1, 7: 12, 8: 14,
      9: 25, 10: 13, 11: 24,
      12: 3, 13: 14, 14: 2,
      15: 13,
    },
  },
  {
    name: 'dirt',
    label: 'Dirt',
    tilesetName: 'dirt',
    tiles: {
      0: 212, 1: 223, 2: 211,
      3: 222, 4: 201, 5: 212,
      6: 200, 7: 211, 8: 213,
      9: 224, 10: 212, 11: 223,
      12: 202, 13: 213, 14: 201,
      15: 212,
    },
  },
  {
    name: 'hills',
    label: 'Hills (wall)',
    tilesetName: 'hills',
    tiles: {
      0: 312, 1: 323, 2: 311,
      3: 322, 4: 301, 5: 312,
      6: 300, 7: 311, 8: 313,
      9: 324, 10: 312, 11: 323,
      12: 302, 13: 313, 14: 301,
      15: 312,
    },
  },
  {
    // Water has no border tiles — all cells fill uniformly.
    name: 'water',
    label: 'Water',
    tilesetName: 'water',
    tiles: Object.fromEntries(
      Array.from({ length: 16 }, (_, i) => [i, 400])
    ),
  },
  {
    name: 'grass_v2',
    label: 'Grass v2',
    tilesetName: 'grass_v2',
    tiles: {
      0: 2012, 1: 2023, 2: 2011,
      3: 2022, 4: 2001, 5: 2012,
      6: 2000, 7: 2011, 8: 2013,
      9: 2024, 10: 2012, 11: 2023,
      12: 2002, 13: 2013, 14: 2001,
      15: 2012,
    },
  },
  {
    name: 'grass_hills',
    label: 'Grass Hills',
    tilesetName: 'grass_hills',
    tiles: {
      0: 1712, 1: 1723, 2: 1711,
      3: 1722, 4: 1701, 5: 1712,
      6: 1700, 7: 1711, 8: 1713,
      9: 1724, 10: 1712, 11: 1723,
      12: 1702, 13: 1713, 14: 1701,
      15: 1712,
    },
  },
  {
    name: 'grass_layers',
    label: 'Grass Layers',
    tilesetName: 'grass_layers',
    tiles: {
      0: 1812, 1: 1823, 2: 1811,
      3: 1822, 4: 1801, 5: 1812,
      6: 1800, 7: 1811, 8: 1813,
      9: 1824, 10: 1812, 11: 1823,
      12: 1802, 13: 1813, 14: 1801,
      15: 1812,
    },
  },
  {
    name: 'grass_layers2',
    label: 'Grass Layers 2',
    tilesetName: 'grass_layers2',
    tiles: {
      0: 1912, 1: 1923, 2: 1911,
      3: 1922, 4: 1901, 5: 1912,
      6: 1900, 7: 1911, 8: 1913,
      9: 1924, 10: 1912, 11: 1923,
      12: 1902, 13: 1913, 14: 1901,
      15: 1912,
    },
  },
  {
    name: 'grass_simple',
    label: 'Grass Simple',
    tilesetName: 'grass_simple',
    tiles: {
      0: 3507, 1: 3513, 2: 3506,
      3: 3512, 4: 3501, 5: 3507,
      6: 3500, 7: 3506, 8: 3508,
      9: 3514, 10: 3507, 11: 3513,
      12: 3502, 13: 3508, 14: 3501,
      15: 3507,
    },
  },
  {
    name: 'dgrass_hills',
    label: 'Dark Grass Hills',
    tilesetName: 'dgrass_hills',
    tiles: {
      0: 1012, 1: 1023, 2: 1011,
      3: 1022, 4: 1001, 5: 1012,
      6: 1000, 7: 1011, 8: 1013,
      9: 1024, 10: 1012, 11: 1023,
      12: 1002, 13: 1013, 14: 1001,
      15: 1012,
    },
  },
  {
    name: 'dgrass_layers',
    label: 'Dark Grass Layers',
    tilesetName: 'dgrass_layers',
    tiles: {
      0: 1112, 1: 1123, 2: 1111,
      3: 1122, 4: 1101, 5: 1112,
      6: 1100, 7: 1111, 8: 1113,
      9: 1124, 10: 1112, 11: 1123,
      12: 1102, 13: 1113, 14: 1101,
      15: 1112,
    },
  },
  {
    name: 'dgrass_layers2',
    label: 'Dark Grass Layers 2',
    tilesetName: 'dgrass_layers2',
    tiles: {
      0: 1212, 1: 1223, 2: 1211,
      3: 1222, 4: 1201, 5: 1212,
      6: 1200, 7: 1211, 8: 1213,
      9: 1224, 10: 1212, 11: 1223,
      12: 1202, 13: 1213, 14: 1201,
      15: 1212,
    },
  },
  {
    name: 'dgrass_tiles',
    label: 'Dark Grass Tiles',
    tilesetName: 'dgrass_tiles',
    tiles: {
      0: 1312, 1: 1323, 2: 1311,
      3: 1322, 4: 1301, 5: 1312,
      6: 1300, 7: 1311, 8: 1313,
      9: 1324, 10: 1312, 11: 1323,
      12: 1302, 13: 1313, 14: 1301,
      15: 1312,
    },
  },
  {
    name: 'bush',
    label: 'Bush',
    tilesetName: 'bush',
    tiles: {
      0: 812, 1: 823, 2: 811,
      3: 822, 4: 801, 5: 812,
      6: 800, 7: 811, 8: 813,
      9: 824, 10: 812, 11: 823,
      12: 802, 13: 813, 14: 801,
      15: 812,
    },
  },
  {
    name: 'dirt_v2',
    label: 'Dirt v2',
    tilesetName: 'dirt_v2',
    tiles: {
      0: 512, 1: 523, 2: 511,
      3: 522, 4: 501, 5: 512,
      6: 500, 7: 511, 8: 513,
      9: 524, 10: 512, 11: 523,
      12: 502, 13: 513, 14: 501,
      15: 512,
    },
  },
  {
    name: 'dirt_wide',
    label: 'Dirt Wide',
    tilesetName: 'dirt_wide',
    tiles: {
      0: 612, 1: 623, 2: 611,
      3: 622, 4: 601, 5: 612,
      6: 600, 7: 611, 8: 613,
      9: 624, 10: 612, 11: 623,
      12: 602, 13: 613, 14: 601,
      15: 612,
    },
  },
  {
    name: 'dirt_wide_v2',
    label: 'Dirt Wide v2',
    tilesetName: 'dirt_wide_v2',
    tiles: {
      0: 712, 1: 723, 2: 711,
      3: 722, 4: 701, 5: 712,
      6: 700, 7: 711, 8: 713,
      9: 724, 10: 712, 11: 723,
      12: 702, 13: 713, 14: 701,
      15: 712,
    },
  },
  {
    name: 'soil_hills',
    label: 'Soil Hills',
    tilesetName: 'soil_hills',
    tiles: {
      0: 2212, 1: 2223, 2: 2211,
      3: 2222, 4: 2201, 5: 2212,
      6: 2200, 7: 2211, 8: 2213,
      9: 2224, 10: 2212, 11: 2223,
      12: 2202, 13: 2213, 14: 2201,
      15: 2212,
    },
  },
  {
    name: 'soil_tiles',
    label: 'Soil Tiles',
    tilesetName: 'soil_tiles',
    tiles: {
      0: 2312, 1: 2323, 2: 2311,
      3: 2322, 4: 2301, 5: 2312,
      6: 2300, 7: 2311, 8: 2313,
      9: 2324, 10: 2312, 11: 2323,
      12: 2302, 13: 2313, 14: 2301,
      15: 2312,
    },
  },
  {
    name: 'dsoil_hills',
    label: 'Dark Soil Hills',
    tilesetName: 'dsoil_hills',
    tiles: {
      0: 1412, 1: 1423, 2: 1411,
      3: 1422, 4: 1401, 5: 1412,
      6: 1400, 7: 1411, 8: 1413,
      9: 1424, 10: 1412, 11: 1423,
      12: 1402, 13: 1413, 14: 1401,
      15: 1412,
    },
  },
  {
    name: 'dsoil_tiles',
    label: 'Dark Soil Tiles',
    tilesetName: 'dsoil_tiles',
    tiles: {
      0: 1512, 1: 1523, 2: 1511,
      3: 1522, 4: 1501, 5: 1512,
      6: 1500, 7: 1511, 8: 1513,
      9: 1524, 10: 1512, 11: 1523,
      12: 1502, 13: 1513, 14: 1501,
      15: 1512,
    },
  },
  {
    name: 'stone_hills',
    label: 'Stone Hills',
    tilesetName: 'stone_hills',
    tiles: {
      0: 2412, 1: 2423, 2: 2411,
      3: 2422, 4: 2401, 5: 2412,
      6: 2400, 7: 2411, 8: 2413,
      9: 2424, 10: 2412, 11: 2423,
      12: 2402, 13: 2413, 14: 2401,
      15: 2412,
    },
  },
  {
    name: 'stone_tiles',
    label: 'Stone Tiles',
    tilesetName: 'stone_tiles',
    tiles: {
      0: 2512, 1: 2523, 2: 2511,
      3: 2522, 4: 2501, 5: 2512,
      6: 2500, 7: 2511, 8: 2513,
      9: 2524, 10: 2512, 11: 2523,
      12: 2502, 13: 2513, 14: 2501,
      15: 2512,
    },
  },
  {
    name: 'dungeon_ground_orange',
    label: 'Dungeon Orange',
    tilesetName: 'dungeon_ground_orange',
    tiles: {
      0: 4212, 1: 4223, 2: 4211,
      3: 4222, 4: 4201, 5: 4212,
      6: 4200, 7: 4211, 8: 4213,
      9: 4224, 10: 4212, 11: 4223,
      12: 4202, 13: 4213, 14: 4201,
      15: 4212,
    },
  },
  {
    name: 'dungeon_ground_orange_dark',
    label: 'Dungeon Orange Dark',
    tilesetName: 'dungeon_ground_orange_dark',
    tiles: {
      0: 4362, 1: 4373, 2: 4361,
      3: 4372, 4: 4351, 5: 4362,
      6: 4350, 7: 4361, 8: 4363,
      9: 4374, 10: 4362, 11: 4373,
      12: 4352, 13: 4363, 14: 4351,
      15: 4362,
    },
  },

  {
    name: 'snow_tiles_1',
    label: 'Snow 1',
    tilesetName: 'snow_tiles_1',
    tiles: {
      0: 5112, 1: 5123, 2: 5111,
      3: 5122, 4: 5101, 5: 5112,
      6: 5100, 7: 5111, 8: 5113,
      9: 5124, 10: 5112, 11: 5123,
      12: 5102, 13: 5113, 14: 5101,
      15: 5112,
    },
  },
  {
    name: 'snow_tiles_2',
    label: 'Snow 2',
    tilesetName: 'snow_tiles_2',
    tiles: {
      0: 5412, 1: 5423, 2: 5411,
      3: 5422, 4: 5401, 5: 5412,
      6: 5400, 7: 5411, 8: 5413,
      9: 5424, 10: 5412, 11: 5423,
      12: 5402, 13: 5413, 14: 5401,
      15: 5412,
    },
  },
  {
    name: 'grass_layers_sorry_1',
    label: 'Layers 1',
    tilesetName: 'grass_layers_sorry_1',
    tiles: {
      0: 5712, 1: 5723, 2: 5711,
      3: 5722, 4: 5701, 5: 5712,
      6: 5700, 7: 5711, 8: 5713,
      9: 5724, 10: 5712, 11: 5723,
      12: 5702, 13: 5713, 14: 5701,
      15: 5712,
    },
  },
  {
    name: 'grass_layers_sorry_2',
    label: 'Layers 2',
    tilesetName: 'grass_layers_sorry_2',
    tiles: {
      0: 6011, 1: 6021, 2: 6010,
      3: 6020, 4: 6001, 5: 6011,
      6: 6000, 7: 6010, 8: 6012,
      9: 6022, 10: 6011, 11: 6021,
      12: 6002, 13: 6012, 14: 6001,
      15: 6011,
    },
  },
  {
    name: 'grass_layers_sorry_3',
    label: 'Layers 3',
    tilesetName: 'grass_layers_sorry_3',
    tiles: {
      0: 6312, 1: 6323, 2: 6311,
      3: 6322, 4: 6301, 5: 6312,
      6: 6300, 7: 6311, 8: 6313,
      9: 6324, 10: 6312, 11: 6323,
      12: 6302, 13: 6313, 14: 6301,
      15: 6312,
    },
  },
  {
    name: 'grass_layers_sorry_4',
    label: 'Layers 4',
    tilesetName: 'grass_layers_sorry_4',
    tiles: {
      0: 6612, 1: 6623, 2: 6611,
      3: 6622, 4: 6601, 5: 6612,
      6: 6600, 7: 6611, 8: 6613,
      9: 6624, 10: 6612, 11: 6623,
      12: 6602, 13: 6613, 14: 6601,
      15: 6612,
    },
  },
  {
    name: 'blue_grass_layers_1',
    label: 'Blue Grass 1',
    tilesetName: 'blue_grass_layers_1',
    tiles: {
      0: 6912, 1: 6923, 2: 6911,
      3: 6922, 4: 6901, 5: 6912,
      6: 6900, 7: 6911, 8: 6913,
      9: 6924, 10: 6912, 11: 6923,
      12: 6902, 13: 6913, 14: 6901,
      15: 6912,
    },
  },
  {
    name: 'blue_grass_layers_2',
    label: 'Blue Grass 2',
    tilesetName: 'blue_grass_layers_2',
    tiles: {
      0: 7212, 1: 7223, 2: 7211,
      3: 7222, 4: 7201, 5: 7212,
      6: 7200, 7: 7211, 8: 7213,
      9: 7224, 10: 7212, 11: 7223,
      12: 7202, 13: 7213, 14: 7201,
      15: 7212,
    },
  },
  {
    name: 'blue_grass_layers_3',
    label: 'Blue Grass 3',
    tilesetName: 'blue_grass_layers_3',
    tiles: {
      0: 7512, 1: 7523, 2: 7511,
      3: 7522, 4: 7501, 5: 7512,
      6: 7500, 7: 7511, 8: 7513,
      9: 7524, 10: 7512, 11: 7523,
      12: 7502, 13: 7513, 14: 7501,
      15: 7512,
    },
  },
  {
    name: 'blue_grass_layers_4',
    label: 'Blue Grass 4',
    tilesetName: 'blue_grass_layers_4',
    tiles: {
      0: 7812, 1: 7823, 2: 7811,
      3: 7822, 4: 7801, 5: 7812,
      6: 7800, 7: 7811, 8: 7813,
      9: 7824, 10: 7812, 11: 7823,
      12: 7802, 13: 7813, 14: 7801,
      15: 7812,
    },
  },
];


export function isSameTerrain(gid, terrain) {
  return Object.values(terrain.tiles).includes(gid);
}

export function resolveTerrainGid(terrain, bitmask) {
  return terrain.tiles[bitmask] ?? terrain.tiles[15] ?? 0;
}

export function preloadAssets(scene) {
  for (const t of TILESETS) {
    scene.load.image(t.key, t.url);
  }
  for (const lv of LEVELS) {
    scene.load.json(`level_${lv}`, `levels/${lv}.json`);
  }
}

/** Expand compact { fill, rects } layer into a flat GID array of cols*rows. */
export function expandLayer(layer, cols, rows) {
  if (Array.isArray(layer)) return layer.slice();
  const out = new Array(cols * rows).fill(layer.fill ?? 0);
  for (const r of (layer.rects || [])) {
    for (let y = r.y; y < r.y + r.h; y++) {
      for (let x = r.x; x < r.x + r.w; x++) {
        if (x >= 0 && y >= 0 && x < cols && y < rows) out[y * cols + x] = r.gid;
      }
    }
  }
  return out;
}

export function flatToRows(flat, cols, rows) {
  const out = [];
  for (let y = 0; y < rows; y++) out.push(flat.slice(y * cols, (y + 1) * cols));
  return out;
}

/** localStorage overrides disk; editor writes here on save. */
export const VARIANT_DEFS = {
  chicken: {
    label: 'Chicken',
    dimensions: [
      { key: 'size', label: 'Size', options: [
        { value: 'normal', label: 'Normal' }, { value: 'baby', label: 'Baby' }
      ]},
      { key: 'color', label: 'Color', options: [
        { value: 'default', label: 'Default' }, { value: 'blue', label: 'Blue' },
        { value: 'brown', label: 'Brown' }, { value: 'green', label: 'Green' },
        { value: 'red', label: 'Red' }
      ]}
    ]
  },
  egg: {
    label: 'Egg',
    dimensions: [
      { key: 'color', label: 'Color', options: [
        { value: 'default', label: 'Default' }, { value: 'blue', label: 'Blue' },
        { value: 'brown', label: 'Brown' }, { value: 'green', label: 'Green' },
        { value: 'red', label: 'Red' }
      ]}
    ]
  },
  cow: {
    label: 'Cow',
    dimensions: [
      { key: 'size', label: 'Size', options: [
        { value: 'normal', label: 'Normal' }, { value: 'baby', label: 'Baby' }
      ]},
      { key: 'color', label: 'Color', options: [
        { value: 'light', label: 'Light' }, { value: 'brown', label: 'Brown' },
        { value: 'green', label: 'Green' }, { value: 'pink', label: 'Pink' },
        { value: 'purple', label: 'Purple' }
      ]}
    ]
  },
  fish: {
    label: 'Fish',
    dimensions: [
      { key: 'size', label: 'Size', options: [
        { value: 'big', label: 'Big' }, { value: 'medium', label: 'Medium' },
        { value: 'small', label: 'Small' }
      ]}
    ]
  },
  fishing: {
    label: 'Fishing',
    dimensions: [
      { key: 'direction', label: 'Direction', options: [
        { value: 'front', label: 'Front' }, { value: 'back', label: 'Back' },
        { value: 'side', label: 'Side' }
      ]}
    ]
  },
  bat: {
    label: 'Bat',
    dimensions: [
      { key: 'size', label: 'Size', options: [
        { value: 'normal', label: 'Normal' }, { value: 'small', label: 'Small' }
      ]}
    ]
  },
  present: {
    label: 'Present',
    dimensions: [
      { key: 'color', label: 'Color', options: [
        { value: 'green', label: 'Green' }, { value: 'red', label: 'Red' }
      ]},
      { key: 'variant', label: 'Variant', options: [
        { value: 'default', label: 'Default' }, { value: '2', label: '2' },
        { value: '3', label: '3' }
      ]}
    ]
  },
  chest: {
    label: 'Chest',
    dimensions: [
      { key: 'type', label: 'Type', options: [
        { value: 'birch', label: 'Birch' }, { value: 'cherry', label: 'Cherry' },
        { value: 'golden', label: 'Golden' }, { value: 'oak', label: 'Oak' },
        { value: 'pine', label: 'Pine' }, { value: 'silver', label: 'Silver' }
      ]}
    ]
  },
  signs: {
    label: 'Signs',
    dimensions: [
      { key: 'type', label: 'Type', options: [
        { value: 'default', label: 'Default' }, { value: 'side', label: 'Side' }
      ]}
    ]
  },
  bridge: {
    label: 'Bridge',
    dimensions: [
      { key: 'version', label: 'Version', options: [
        { value: 'v1', label: 'v1' }, { value: 'v2', label: 'v2' }
      ]}
    ]
  },
  furniture: {
    label: 'Furniture',
    dimensions: [
      { key: 'version', label: 'Version', options: [
        { value: 'basic', label: 'Basic' }, { value: 'new', label: 'New' },
        { value: 'new_2', label: 'New 2' }
      ]}
    ]
  },
  farming_items: {
    label: 'Farming Items',
    dimensions: [
      { key: 'version', label: 'Version', options: [
        { value: 'v1', label: 'V1' }, { value: 'v2', label: 'V2' }
      ]}
    ]
  },
  house_shadow: {
    label: 'House Shadow',
    dimensions: [
      { key: 'house', label: 'House', options: [
        { value: 'small_house', label: 'Small House' },
        { value: 'small_hut', label: 'Small Hut' },
        { value: 'brick_house', label: 'Brick House' }
      ]}
    ]
  },
  small_house: {
    label: 'Small House',
    dimensions: [
      { key: 'light', label: 'Light', options: [
        { value: 'off', label: 'Off' }, { value: 'on', label: 'On' }
      ]},
      { key: 'door', label: 'Door', options: [
        { value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }
      ]},
      { key: 'grass', label: 'Grass', options: [
        { value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }
      ]}
    ]
  },
  small_hut: {
    label: 'Small Hut',
    dimensions: [
      { key: 'door', label: 'Door', options: [
        { value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }
      ]},
      { key: 'grass', label: 'Grass', options: [
        { value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }
      ]}
    ]
  },
  brick_house: {
    label: 'Brick House',
    dimensions: [
      { key: 'door', label: 'Door', options: [
        { value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }
      ]},
      { key: 'grass', label: 'Grass', options: [
        { value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }
      ]}
    ]
  },
  tree: {
    label: 'Tree',
    dimensions: [
      { key: 'fruit', label: 'Fruit', options: [
        { value: 'none', label: 'None' }, { value: 'apple', label: 'Apple' },
        { value: 'orange', label: 'Orange' }, { value: 'peach', label: 'Peach' },
        { value: 'pear', label: 'Pear' }
      ]}
    ]
  },
  farming_v2: {
    label: 'Farming v2',
    dimensions: [
      { key: 'watered', label: 'Watered', options: [
        { value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }
      ]}
    ]
  },
  biom: {
    label: 'Biom',
    dimensions: [
      { key: 'type', label: 'Type', options: [
        { value: 'birch', label: 'Birch' }, { value: 'cherry', label: 'Cherry' },
        { value: 'pine', label: 'Pine' }
      ]}
    ]
  },
  water_plants: {
    label: 'Water Plants',
    dimensions: [
      { key: 'type', label: 'Type', options: [
        { value: 'birch', label: 'Birch' }, { value: 'cherry', label: 'Cherry' },
        { value: 'pine', label: 'Pine' }
      ]}
    ]
  },
  no_tree_fruit: {
    label: 'Fruit',
    dimensions: [
      { key: 'type', label: 'Type', options: [
        { value: 'apple', label: 'Apple' }, { value: 'orange', label: 'Orange' },
        { value: 'peach', label: 'Peach' }, { value: 'pear', label: 'Pear' }
      ]}
    ]
  },
  test_npc: {
    label: 'Test NPC',
    dimensions: [
      { key: 'character', label: 'Character', options: [
        { value: 'teemo', label: 'Teemo' }, { value: 'cupnooble', label: 'Cupnooble' }
      ]}
    ]
  }
};
