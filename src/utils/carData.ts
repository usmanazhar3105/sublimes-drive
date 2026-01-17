export interface CarModel {
  id: string;
  name: string;
}

export interface CarBrand {
  id: string;
  name: string;
  models: CarModel[];
}

export const CAR_BRANDS: CarBrand[] = [
  // Chinese Brands Only
  {
    id: 'byd',
    name: 'BYD',
    models: [
      { id: 'atto-3', name: 'Atto 3' },
      { id: 'han', name: 'Han' },
      { id: 'qin-plus', name: 'Qin Plus' },
      { id: 'seal', name: 'Seal' },
      { id: 'sealion-7', name: 'Sealion 7' },
      { id: 'song-plus', name: 'Song Plus' },
    ]
  },
  {
    id: 'hongqi',
    name: 'Hongqi',
    models: [
      { id: 'e-hs9', name: 'E-HS9' },
      { id: 'e-qm5', name: 'E-QM5' },
      { id: 'h5', name: 'H5' },
      { id: 'h9', name: 'H9' },
      { id: 'hs3', name: 'HS3' },
      { id: 'hs5', name: 'HS5' },
    ]
  },
  {
    id: 'bestune',
    name: 'Bestune',
    models: [
      { id: 'b70', name: 'B70' },
      { id: 't77', name: 'T77' },
      { id: 't99', name: 'T99' },
    ]
  },
  {
    id: 'mg',
    name: 'MG',
    models: [
      { id: '3', name: '3' },
      { id: '4', name: '4' },
      { id: '5', name: '5' },
      { id: '7', name: '7' },
      { id: 'gt', name: 'GT' },
      { id: 'hs', name: 'HS' },
      { id: 'one', name: 'One' },
      { id: 'rx5', name: 'RX5' },
      { id: 'rx8', name: 'RX8' },
      { id: 'rx9', name: 'RX9' },
      { id: 'zs', name: 'ZS' },
    ]
  },
  {
    id: 'haval',
    name: 'Haval',
    models: [
      { id: 'dargo', name: 'Dargo' },
      { id: 'h6', name: 'H6' },
      { id: 'h6-gt', name: 'H6 GT' },
      { id: 'jolion', name: 'Jolion' },
    ]
  },
  {
    id: 'foton',
    name: 'Foton',
    models: [
      { id: 'aumark', name: 'Aumark' },
      { id: 'tunland', name: 'Tunland' },
    ]
  },
  {
    id: 'geely',
    name: 'Geely',
    models: [
      { id: 'coolray', name: 'Coolray' },
      { id: 'emgrand', name: 'Emgrand' },
      { id: 'monjaro', name: 'Monjaro' },
      { id: 'tugella', name: 'Tugella' },
      { id: 'starray', name: 'Starray' },
      { id: 'geometry-a', name: 'Geometry A' },
      { id: 'geometry-c', name: 'Geometry C' },
    ]
  },
  {
    id: 'xpeng',
    name: 'Xpeng',
    models: [
      { id: 'g6', name: 'G6' },
      { id: 'g9', name: 'G9' },
      { id: 'x9', name: 'X9' },
    ]
  },
  {
    id: 'jaecoo',
    name: 'Jaecoo',
    models: [
      { id: 'j7', name: 'J7' },
      { id: 'j8', name: 'J8' },
    ]
  },
  {
    id: 'zeekr',
    name: 'Zeekr',
    models: [
      { id: '001', name: '001' },
      { id: '007', name: '007' },
      { id: '009', name: '009' },
      { id: 'x', name: 'X' },
    ]
  },
  {
    id: 'jetour',
    name: 'Jetour',
    models: [
      { id: 'dashing', name: 'Dashing' },
      { id: 't2', name: 'T2' },
      { id: 'x70', name: 'X70' },
      { id: 'x90-plus', name: 'X90 Plus' },
    ]
  },
  {
    id: 'jac',
    name: 'Jac',
    models: [
      { id: 'j7', name: 'J7' },
      { id: 'js4', name: 'JS4' },
      { id: 'js6', name: 'JS6' },
    ]
  },
  {
    id: 'gac',
    name: 'GAC',
    models: [
      { id: 'empow', name: 'Empow' },
      { id: 'emkoo', name: 'EMKOO' },
      { id: 'ga8', name: 'GA8' },
      { id: 'gs3-emzoom', name: 'GS3 Emzoom' },
      { id: 'gs8', name: 'GS8' },
    ]
  },
  {
    id: 'baic',
    name: 'BAIC',
    models: [
      { id: 'bj30', name: 'BJ30' },
      { id: 'bj40', name: 'BJ40' },
      { id: 'x35', name: 'X35' },
      { id: 'x55', name: 'X55' },
      { id: 'x7', name: 'X7' },
    ]
  },
  {
    id: 'great-wall',
    name: 'Great Wall',
    models: [
      { id: 'king-kong', name: 'King Kong' },
      { id: 'poer', name: 'Poer' },
    ]
  },
  {
    id: 'chery',
    name: 'Chery',
    models: [
      { id: 'arrizo-5', name: 'Arrizo 5' },
      { id: 'arrizo-8', name: 'Arrizo 8' },
      { id: 'tiggo-4-pro', name: 'Tiggo 4 Pro' },
      { id: 'tiggo-7-pro', name: 'Tiggo 7 Pro' },
      { id: 'tiggo-8-pro', name: 'Tiggo 8 Pro' },
      { id: 'tiggo-9', name: 'Tiggo 9' },
    ]
  },
  {
    id: 'skywell',
    name: 'Skywell',
    models: [
      { id: 'et5', name: 'ET5' },
    ]
  },
  {
    id: 'riddara',
    name: 'Riddara',
    models: [
      { id: 'rd6', name: 'RD6' },
    ]
  },
  {
    id: 'nio',
    name: 'NIO',
    models: [
      { id: 'ec6', name: 'EC6' },
      { id: 'el8', name: 'EL8' },
      { id: 'et5', name: 'ET5' },
      { id: 'et7', name: 'ET7' },
      { id: 'et9', name: 'ET9' },
      { id: 'es6', name: 'ES6' },
      { id: 'es7', name: 'ES7' },
      { id: 'es8', name: 'ES8' },
    ]
  },
  {
    id: 'tank',
    name: 'Tank',
    models: [
      { id: '300', name: '300' },
      { id: '500', name: '500' },
      { id: '700', name: '700' },
    ]
  },
  {
    id: 'roewe',
    name: 'Roewe',
    models: [
      { id: 'rx5', name: 'RX5' },
      { id: 'rx8', name: 'RX8' },
    ]
  },
  {
    id: 'li-auto',
    name: 'Li Auto',
    models: [
      { id: 'l6', name: 'L6' },
      { id: 'l7', name: 'L7' },
      { id: 'l8', name: 'L8' },
      { id: 'l9', name: 'L9' },
    ]
  },
  {
    id: 'kaiyi',
    name: 'Kaiyi',
    models: [
      { id: 'e5', name: 'E5' },
      { id: 'x3', name: 'X3' },
      { id: 'x7', name: 'X7' },
    ]
  },
  {
    id: 'dongfeng',
    name: 'Dongfeng',
    models: [
      { id: 'rich-7', name: 'Rich 7' },
      { id: 'mage', name: 'Mage' },
      { id: 'shine-max', name: 'Shine Max' },
    ]
  },
  {
    id: 'omoda',
    name: 'Omoda',
    models: [
      { id: 'c5', name: 'C5' },
      { id: 'c7', name: 'C7' },
      { id: 'e5', name: 'E5' },
    ]
  },
  {
    id: 'soueast',
    name: 'Soueast',
    models: [
      { id: 's06', name: 'S06' },
      { id: 's07', name: 'S07' },
      { id: 's09', name: 'S09' },
    ]
  },
  {
    id: 'vgv',
    name: 'VGV',
    models: [
      { id: 'u70', name: 'U70' },
      { id: 'u75-plus', name: 'U75 Plus' },
    ]
  },
  {
    id: 'seres',
    name: 'Seres',
    models: [
      { id: '3', name: '3' },
      { id: '5', name: '5' },
      { id: '7', name: '7' },
    ]
  },
  {
    id: 'avatr',
    name: 'Avatr',
    models: [
      { id: '11', name: '11' },
      { id: '12', name: '12' },
    ]
  },
  {
    id: 'forthing',
    name: 'Forthing',
    models: [
      { id: 'friday-ev', name: 'Friday EV' },
      { id: 't5-evo', name: 'T5 EVO' },
      { id: 'u-tour', name: 'U-Tour' },
    ]
  },
  {
    id: 'changan',
    name: 'Changan',
    models: [
      { id: 'alsvin', name: 'Alsvin' },
      { id: 'cs35-plus', name: 'CS35 Plus' },
      { id: 'cs75-plus', name: 'CS75 Plus' },
      { id: 'uni-t', name: 'UNI-T' },
      { id: 'uni-v', name: 'UNI-V' },
    ]
  },
  {
    id: 'maxus',
    name: 'Maxus',
    models: [
      { id: 'd60', name: 'D60' },
      { id: 'g50', name: 'G50' },
      { id: 't60', name: 'T60' },
      { id: 't90', name: 'T90' },
    ]
  },
  {
    id: 'exeed',
    name: 'Exeed',
    models: [
      { id: 'lx', name: 'LX' },
      { id: 'rx', name: 'RX' },
      { id: 'txl', name: 'TXL' },
      { id: 'vx', name: 'VX' },
    ]
  },
  // Other option
  {
    id: 'other',
    name: 'Other',
    models: [
      { id: 'custom', name: 'Not Here? Add Yours' },
    ]
  },
];

export const getCarBrandById = (id: string): CarBrand | undefined => {
  return CAR_BRANDS.find(brand => brand.id === id);
};

export const getCarModelById = (brandId: string, modelId: string): CarModel | undefined => {
  const brand = getCarBrandById(brandId);
  return brand?.models.find(model => model.id === modelId);
};

export const getAllBrandNames = (): string[] => {
  return CAR_BRANDS.map(brand => brand.name);
};

export const getModelsByBrandId = (brandId: string): CarModel[] => {
  const brand = getCarBrandById(brandId);
  return brand?.models || [];
};