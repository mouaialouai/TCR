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
  annualInflationRate: number;
}

export interface OperationalMachine {
  id: string;
  designation: string;
  hourlyConsumption: number;
  hoursPerDay: number;
  assetValue: number;
  maintenanceRate: number;
  allocation: Allocation;
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
