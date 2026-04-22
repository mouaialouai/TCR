export type Allocation = 'Granite' | 'Tuf' | 'Common';

export interface EmployeeRole {
  id: string;
  designation: string;
  count: number;
  monthlySalary: number;
  allocation: Allocation;
}

export interface HRConfig {
  socialChargesRate: number;
  annualIncreaseRate: number;
  paidMonths: number;
}

export interface OperationalConfig {
  fuelPrice: number;
  workDaysPerYear: number;
  hoursPerDay: number;
  annualInflationRate: number;
}

export interface ElectricityLine {
  id: string;
  designation: string;
  powerKw: number;
  count: number;
  utilizationCoef: number;
  workDaysPerYear: number;
  hoursPerDay: number;
}

export interface ElectricityConfig {
  cosPhi: number;
  kvaPerGroup: number;
  specificConsumption: number;
  workDaysPerYear: number;
  hoursPerDay: number;
}

export type AccessoryCalculationMode = 'direct' | 'calculated';

export interface AccessoryItem {
  id: string;
  designation: string;
  qtyPerYear: number;
  unitPrice: number;
  unit: string;
  allocation: Allocation;
  calculationMode?: AccessoryCalculationMode;
  // Calculation parameters
  vs?: number; // m2/h
  cfu?: number; // m/m2
  hoursPerDay?: number;
  daysPerYear?: number;
  machineCount?: number;
}

export interface AccessoryConfig {
  items: AccessoryItem[];
}

export interface OperationalMachine {
  id: string;
  designation: string;
  powerKw: number;
  count: number;
  consumptionRate: number;
  utilizationCoef: number;
  allocation: Allocation;
  workDaysPerYear: number;
  hoursPerDay: number;
}

export type InvestmentCategory = 
  | "Frais préliminaires & Exploration"
  | "Infrastructures & Bâtiments"
  | "Équipements Lourds & Matériel";

export interface Equipment {
  id: string;
  designation: string;
  price: number;
  duration: number; // years
  category: InvestmentCategory;
  allocation: Allocation;
}

export interface AmortizationRow {
  designation: string;
  annualAmortization: number;
  years: number[]; // 10 years
  allocation: Allocation;
}

export interface AnnualData {
  year: number;
  extractionGranite: number;
  caGranite: number;
  extractionTuf: number;
  caTuf: number;
  matieresFournitures: number;
  services: number;
  fraisPersonnel: number;
  impotsTaxes: number;
  fraisFinanciers: number;
  dotationsAmortissements: number;
}

export interface CalculatedData {
  subtotal1: number;
  valeurAjoutee: number;
  subtotal2: number;
  resultatExploitation: number;
  caGlobal: number;
  ibm: number;
  resultatNet: number;
  fnt: number;
  prixRevientGranite: number;
  prixRevientTuf: number;
}

export type FullYearData = AnnualData & CalculatedData;

export interface CalculationSnapshot {
  id: string;
  timestamp: string;
  data: AnnualData[];
  label?: string;
}

export interface ProductionParams {
  l: number;
  w: number;
  h: number;
}

export interface MachineProductivityParams {
  vs: number;
  hEq: number;
  hoursPerDay: number;
  daysPerYear: number;
  utilizationRate: number;
}

export interface ProductionStep {
  name: string;
  dimensions: ProductionParams;
  productivity: MachineProductivityParams;
}

export interface ProductionDimensioning {
  horizon: '1y' | '10y';
  targetMode: 'constant' | 'variable';
  vTargetConstant: number;
  vTargetVariable: number[];
  yieldsConstant: { eta1: number; eta2: number };
  yieldsVariable: { eta1: number[]; eta2: number[] };
  steps: {
    extraction: ProductionStep;
    retaille: ProductionStep;
  };
}
