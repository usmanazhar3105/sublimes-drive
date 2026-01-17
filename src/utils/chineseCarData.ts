// STRICTLY CHINESE CAR BRANDS AND MODELS - Complete Database for UAE Market

export interface CarBrand {
  id: string;
  name: string;
  category: 'luxury' | 'mainstream' | 'electric' | 'commercial';
  models: CarModel[];
}

export interface CarModel {
  id: string;
  name: string;
  category: 'sedan' | 'suv' | 'hatchback' | 'coupe' | 'pickup' | 'van' | 'convertible';
  fuelType: 'electric' | 'hybrid' | 'petrol' | 'diesel';
  yearRange: {
    start: number;
    end: number;
  };
}

// Complete Chinese Car Brands Database for UAE Market
export const chineseCarBrands: CarBrand[] = [
  {
    id: 'byd',
    name: 'BYD',
    category: 'electric',
    models: [
      { id: 'atto3', name: 'Atto 3', category: 'suv', fuelType: 'electric', yearRange: { start: 2022, end: 2024 } },
      { id: 'han', name: 'Han', category: 'sedan', fuelType: 'electric', yearRange: { start: 2020, end: 2024 } },
      { id: 'qin-plus', name: 'Qin Plus', category: 'sedan', fuelType: 'hybrid', yearRange: { start: 2021, end: 2024 } },
      { id: 'seal', name: 'Seal', category: 'sedan', fuelType: 'electric', yearRange: { start: 2022, end: 2024 } },
      { id: 'sealion7', name: 'Sealion 7', category: 'suv', fuelType: 'electric', yearRange: { start: 2024, end: 2024 } },
      { id: 'song-plus', name: 'Song Plus', category: 'suv', fuelType: 'hybrid', yearRange: { start: 2021, end: 2024 } },
      { id: 'other', name: 'Other', category: 'suv', fuelType: 'electric', yearRange: { start: 2020, end: 2024 } }
    ]
  },
  {
    id: 'nio',
    name: 'NIO',
    category: 'luxury',
    models: [
      { id: 'es8', name: 'ES8', category: 'suv', fuelType: 'electric', yearRange: { start: 2018, end: 2024 } },
      { id: 'es6', name: 'ES6', category: 'suv', fuelType: 'electric', yearRange: { start: 2019, end: 2024 } },
      { id: 'ec6', name: 'EC6', category: 'coupe', fuelType: 'electric', yearRange: { start: 2020, end: 2024 } },
      { id: 'et7', name: 'ET7', category: 'sedan', fuelType: 'electric', yearRange: { start: 2022, end: 2024 } },
      { id: 'et5', name: 'ET5', category: 'sedan', fuelType: 'electric', yearRange: { start: 2022, end: 2024 } },
      { id: 'el7', name: 'EL7', category: 'suv', fuelType: 'electric', yearRange: { start: 2023, end: 2024 } },
      { id: 'el6', name: 'EL6', category: 'suv', fuelType: 'electric', yearRange: { start: 2023, end: 2024 } }
    ]
  },
  {
    id: 'xpeng',
    name: 'XPeng',
    category: 'electric',
    models: [
      { id: 'p7', name: 'P7', category: 'sedan', fuelType: 'electric', yearRange: { start: 2020, end: 2024 } },
      { id: 'p5', name: 'P5', category: 'sedan', fuelType: 'electric', yearRange: { start: 2021, end: 2024 } },
      { id: 'g3', name: 'G3', category: 'suv', fuelType: 'electric', yearRange: { start: 2018, end: 2024 } },
      { id: 'g6', name: 'G6', category: 'suv', fuelType: 'electric', yearRange: { start: 2023, end: 2024 } },
      { id: 'g9', name: 'G9', category: 'suv', fuelType: 'electric', yearRange: { start: 2022, end: 2024 } }
    ]
  },
  {
    id: 'li-auto',
    name: 'Li Auto',
    category: 'luxury',
    models: [
      { id: 'li-one', name: 'Li ONE', category: 'suv', fuelType: 'hybrid', yearRange: { start: 2019, end: 2022 } },
      { id: 'l9', name: 'L9', category: 'suv', fuelType: 'hybrid', yearRange: { start: 2022, end: 2024 } },
      { id: 'l8', name: 'L8', category: 'suv', fuelType: 'hybrid', yearRange: { start: 2022, end: 2024 } },
      { id: 'l7', name: 'L7', category: 'suv', fuelType: 'hybrid', yearRange: { start: 2023, end: 2024 } },
      { id: 'l6', name: 'L6', category: 'suv', fuelType: 'hybrid', yearRange: { start: 2024, end: 2024 } }
    ]
  },
  {
    id: 'geely',
    name: 'Geely',
    category: 'mainstream',
    models: [
      { id: 'emgrand', name: 'Emgrand', category: 'sedan', fuelType: 'petrol', yearRange: { start: 2015, end: 2024 } },
      { id: 'coolray', name: 'Coolray', category: 'suv', fuelType: 'petrol', yearRange: { start: 2019, end: 2024 } },
      { id: 'azkarra', name: 'Azkarra', category: 'suv', fuelType: 'petrol', yearRange: { start: 2020, end: 2024 } },
      { id: 'okavango', name: 'Okavango', category: 'suv', fuelType: 'petrol', yearRange: { start: 2021, end: 2024 } },
      { id: 'tugella', name: 'Tugella', category: 'coupe', fuelType: 'petrol', yearRange: { start: 2021, end: 2024 } }
    ]
  },
  {
    id: 'great-wall',
    name: 'Great Wall Motors',
    category: 'mainstream',
    models: [
      { id: 'haval-h6', name: 'Haval H6', category: 'suv', fuelType: 'petrol', yearRange: { start: 2017, end: 2024 } },
      { id: 'haval-h9', name: 'Haval H9', category: 'suv', fuelType: 'petrol', yearRange: { start: 2018, end: 2024 } },
      { id: 'haval-jolion', name: 'Haval Jolion', category: 'suv', fuelType: 'petrol', yearRange: { start: 2021, end: 2024 } },
      { id: 'haval-f7', name: 'Haval F7', category: 'suv', fuelType: 'petrol', yearRange: { start: 2019, end: 2024 } },
      { id: 'ora-good-cat', name: 'Ora Good Cat', category: 'hatchback', fuelType: 'electric', yearRange: { start: 2021, end: 2024 } },
      { id: 'tank-300', name: 'Tank 300', category: 'suv', fuelType: 'petrol', yearRange: { start: 2021, end: 2024 } },
      { id: 'tank-500', name: 'Tank 500', category: 'suv', fuelType: 'petrol', yearRange: { start: 2022, end: 2024 } }
    ]
  },
  {
    id: 'chery',
    name: 'Chery',
    category: 'mainstream',
    models: [
      { id: 'tiggo-8', name: 'Tiggo 8', category: 'suv', fuelType: 'petrol', yearRange: { start: 2018, end: 2024 } },
      { id: 'tiggo-7', name: 'Tiggo 7', category: 'suv', fuelType: 'petrol', yearRange: { start: 2017, end: 2024 } },
      { id: 'tiggo-4', name: 'Tiggo 4', category: 'suv', fuelType: 'petrol', yearRange: { start: 2018, end: 2024 } },
      { id: 'arrizo-6', name: 'Arrizo 6', category: 'sedan', fuelType: 'petrol', yearRange: { start: 2019, end: 2024 } },
      { id: 'qq', name: 'QQ', category: 'hatchback', fuelType: 'petrol', yearRange: { start: 2016, end: 2024 } },
      { id: 'fulwin', name: 'Fulwin', category: 'pickup', fuelType: 'petrol', yearRange: { start: 2020, end: 2024 } }
    ]
  },
  {
    id: 'hongqi',
    name: 'Hongqi',
    category: 'luxury',
    models: [
      { id: 'e-hs9', name: 'E-HS9', category: 'suv', fuelType: 'electric', yearRange: { start: 2021, end: 2024 } },
      { id: 'e-qm5', name: 'E-QM5', category: 'sedan', fuelType: 'electric', yearRange: { start: 2021, end: 2024 } },
      { id: 'h5', name: 'H5', category: 'sedan', fuelType: 'petrol', yearRange: { start: 2018, end: 2024 } },
      { id: 'h9', name: 'H9', category: 'sedan', fuelType: 'petrol', yearRange: { start: 2020, end: 2024 } },
      { id: 'hs3', name: 'HS3', category: 'suv', fuelType: 'petrol', yearRange: { start: 2020, end: 2024 } },
      { id: 'hs5', name: 'HS5', category: 'suv', fuelType: 'petrol', yearRange: { start: 2019, end: 2024 } },
      { id: 'other', name: 'Other', category: 'sedan', fuelType: 'petrol', yearRange: { start: 2018, end: 2024 } }
    ]
  },
  {
    id: 'jetour',
    name: 'Jetour',
    category: 'mainstream',
    models: [
      { id: 'x70', name: 'X70', category: 'suv', fuelType: 'petrol', yearRange: { start: 2019, end: 2024 } },
      { id: 'x90', name: 'X90', category: 'suv', fuelType: 'petrol', yearRange: { start: 2020, end: 2024 } },
      { id: 'dashing', name: 'Dashing', category: 'suv', fuelType: 'petrol', yearRange: { start: 2021, end: 2024 } },
      { id: 't1', name: 'T1', category: 'pickup', fuelType: 'petrol', yearRange: { start: 2022, end: 2024 } },
      { id: 't2', name: 'T2', category: 'pickup', fuelType: 'petrol', yearRange: { start: 2023, end: 2024 } }
    ]
  },
  {
    id: 'jaecoo',
    name: 'Jaecoo',
    category: 'mainstream',
    models: [
      { id: 'j7', name: 'J7', category: 'suv', fuelType: 'petrol', yearRange: { start: 2023, end: 2024 } },
      { id: 'j8', name: 'J8', category: 'suv', fuelType: 'petrol', yearRange: { start: 2024, end: 2024 } }
    ]
  },
  {
    id: 'omoda',
    name: 'Omoda',
    category: 'mainstream',
    models: [
      { id: 'omoda-5', name: '5', category: 'suv', fuelType: 'petrol', yearRange: { start: 2023, end: 2024 } },
      { id: 'omoda-7', name: '7', category: 'suv', fuelType: 'petrol', yearRange: { start: 2024, end: 2024 } }
    ]
  },
  {
    id: 'exeed',
    name: 'Exeed',
    category: 'mainstream',
    models: [
      { id: 'lx', name: 'LX', category: 'suv', fuelType: 'petrol', yearRange: { start: 2020, end: 2024 } },
      { id: 'txl', name: 'TXL', category: 'suv', fuelType: 'petrol', yearRange: { start: 2019, end: 2024 } },
      { id: 'vx', name: 'VX', category: 'suv', fuelType: 'petrol', yearRange: { start: 2021, end: 2024 } }
    ]
  },
  {
    id: 'gac',
    name: 'GAC',
    category: 'mainstream',
    models: [
      { id: 'trumpchi-gs8', name: 'Trumpchi GS8', category: 'suv', fuelType: 'petrol', yearRange: { start: 2018, end: 2024 } },
      { id: 'trumpchi-gs4', name: 'Trumpchi GS4', category: 'suv', fuelType: 'petrol', yearRange: { start: 2017, end: 2024 } },
      { id: 'trumpchi-ga8', name: 'Trumpchi GA8', category: 'sedan', fuelType: 'petrol', yearRange: { start: 2019, end: 2024 } }
    ]
  },
  {
    id: 'mg',
    name: 'MG Motor',
    category: 'mainstream',
    models: [
      { id: 'mg-hs', name: 'HS', category: 'suv', fuelType: 'petrol', yearRange: { start: 2019, end: 2024 } },
      { id: 'mg-zs', name: 'ZS', category: 'suv', fuelType: 'petrol', yearRange: { start: 2018, end: 2024 } },
      { id: 'mg-5', name: 'MG5', category: 'sedan', fuelType: 'petrol', yearRange: { start: 2020, end: 2024 } },
      { id: 'mg-zs-ev', name: 'ZS EV', category: 'suv', fuelType: 'electric', yearRange: { start: 2021, end: 2024 } }
    ]
  },
  {
    id: 'zeekr',
    name: 'ZEEKR',
    category: 'luxury',
    models: [
      { id: 'zeekr-001', name: '001', category: 'sedan', fuelType: 'electric', yearRange: { start: 2021, end: 2024 } },
      { id: 'zeekr-009', name: '009', category: 'van', fuelType: 'electric', yearRange: { start: 2022, end: 2024 } },
      { id: 'zeekr-x', name: 'X', category: 'suv', fuelType: 'electric', yearRange: { start: 2023, end: 2024 } }
    ]
  }
];

// Helper functions for easy access
export const getAllBrandNames = (): string[] => {
  return chineseCarBrands.map(brand => brand.name);
};

export const getBrandModels = (brandId: string): CarModel[] => {
  const brand = chineseCarBrands.find(b => b.id === brandId);
  return brand ? brand.models : [];
};

export const getBrandById = (brandId: string): CarBrand | undefined => {
  return chineseCarBrands.find(b => b.id === brandId);
};

export const getBrandByName = (brandName: string): CarBrand | undefined => {
  return chineseCarBrands.find(b => b.name.toLowerCase() === brandName.toLowerCase());
};

export const getModelsByCategory = (category: CarModel['category']): CarModel[] => {
  return chineseCarBrands.flatMap(brand => 
    brand.models.filter(model => model.category === category)
  );
};

export const getModelsByFuelType = (fuelType: CarModel['fuelType']): CarModel[] => {
  return chineseCarBrands.flatMap(brand => 
    brand.models.filter(model => model.fuelType === fuelType)
  );
};

export const getBrandsByCategory = (category: CarBrand['category']): CarBrand[] => {
  return chineseCarBrands.filter(brand => brand.category === category);
};

// Popular tags specifically for Chinese car community
export const chineseCarTags = [
  'ChineseCars', 'ElectricVehicles', 'NewEnergyVehicles', 'EVCharging', 'BatterySwap',
  'ChineseEVs', 'SmartCars', 'AutonomousDriving', 'OTAUpdates', 'CarTech',
  'ChineseDesign', 'MadeInChina', 'InnovativeTech', 'FutureOfMobility',
  'SustainableTransport', 'GreenEnergy', 'ZeroEmission', 'EcoFriendly',
  'CarReview', 'OwnerExperience', 'TestDrive', 'CarComparison',
  'MaintenanceTips', 'ServiceCenter', 'WarrantySupport', 'CarCare',
  'UAECars', 'DubaiCars', 'ElectricUAE', 'ChargingNetwork',
  'CarMeet', 'CarShow', 'Photography', 'CarLifestyle',
  'Modification', 'Accessories', 'Upgrade', 'Performance',
  'FamilyCar', 'LuxuryCar', 'AffordableCar', 'ValueForMoney',
  'RoadTrip', 'Adventure', 'OffRoad', 'CityDriving',
  'CarFinance', 'Insurance', 'Resale', 'Investment'
];

// UAE-specific locations for car meetups and events
export const uaeCarLocations = [
  'Dubai Mall', 'Dubai Marina', 'JBR', 'Downtown Dubai', 'Business Bay',
  'Jumeirah Beach', 'Al Barsha', 'Motor City', 'Dubai Autodrome',
  'Abu Dhabi Corniche', 'Yas Island', 'Yas Marina Circuit',
  'Sharjah City Centre', 'Ajman Corniche', 'RAK Mall',
  'Fujairah Beach', 'Al Ain Oasis', 'Hatta Dam'
];

export default chineseCarBrands;