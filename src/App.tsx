import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { InfoCallout } from './components/InfoCallout';
import { 
  Calculator, 
  Table as TableIcon, 
  Edit3, 
  Copy, 
  Trash2, 
  Download,
  Check,
  Smartphone,
  PieChart,
  HardDrive,
  PlusCircle,
  Plus,
  TrendingDown,
  Trash,
  Info,
  Droplets,
  Users,
  LayoutDashboard,
  Wallet,
  TrendingUp,
  UsersRound,
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
  Activity,
  Fuel,
  Settings,
  Wrench,
  FileSpreadsheet,
  FileText,
  Undo2,
  Redo2,
  BookOpen,
  History,
  Save,
  Clock,
  Search,
  X,
  Mail,
  Phone,
  GraduationCap,
  HardHat,
  ExternalLink,
  Mountain,
  Building,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ComposedChart
} from 'recharts';
import { saveAs } from "file-saver";
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  AlignmentType, 
  HeadingLevel,
  BorderStyle,
  VerticalAlign,
  Header,
  Footer,
  PageNumber
} from "docx";
import { cn } from './lib/utils';
import { AnnualData, Equipment, EmployeeRole, HRConfig, OperationalMachine, OperationalConfig, InvestmentCategory, CalculationSnapshot, ElectricityLine, ElectricityConfig, AccessoryConfig, AccessoryItem, Allocation, AccessoryCalculationMode, ProductionDimensioning, FullYearData, WaterConfig, WaterItem } from './types';
import { calculateYear, calculateTotals, getAmortizationSchedule, getHRCosts, getOperationalCosts, getElectricityCosts, getAccessoryCosts, SplitCosts, getWaterCosts } from './lib/calculations';
import { KOTLIN_VIEWMODEL, LAYOUT_XML } from './lib/androidCodeTemplates';

const INITIAL_YEARS_GRANITE: AnnualData[] = [
  { year: 1, extractionGranite: 3500, caGranite: 0, extractionTuf: 0, caTuf: 0, matieresFournitures: 8000000, services: 4000000, fraisPersonnel: 0, impotsTaxes: 850000, fraisFinanciers: 1200000, dotationsAmortissements: 0 },
  { year: 2, extractionGranite: 4000, caGranite: 0, extractionTuf: 0, caTuf: 0, matieresFournitures: 8200000, services: 4100000, fraisPersonnel: 0, impotsTaxes: 900000, fraisFinanciers: 1100000, dotationsAmortissements: 0 },
  { year: 3, extractionGranite: 4500, caGranite: 0, extractionTuf: 0, caTuf: 0, matieresFournitures: 8500000, services: 4200000, fraisPersonnel: 0, impotsTaxes: 950000, fraisFinanciers: 1000000, dotationsAmortissements: 0 },
  { year: 4, extractionGranite: 5000, caGranite: 0, extractionTuf: 0, caTuf: 0, matieresFournitures: 8800000, services: 4300000, fraisPersonnel: 0, impotsTaxes: 1000000, fraisFinanciers: 900000, dotationsAmortissements: 0 },
  { year: 5, extractionGranite: 5500, caGranite: 0, extractionTuf: 0, caTuf: 0, matieresFournitures: 9100000, services: 4400000, fraisPersonnel: 0, impotsTaxes: 1050000, fraisFinanciers: 800000, dotationsAmortissements: 0 },
  { year: 6, extractionGranite: 5500, caGranite: 0, extractionTuf: 0, caTuf: 0, matieresFournitures: 9300000, services: 4500000, fraisPersonnel: 0, impotsTaxes: 1100000, fraisFinanciers: 700000, dotationsAmortissements: 0 },
  { year: 7, extractionGranite: 5500, caGranite: 0, extractionTuf: 0, caTuf: 0, matieresFournitures: 9500000, services: 4600000, fraisPersonnel: 0, impotsTaxes: 1150000, fraisFinanciers: 600000, dotationsAmortissements: 0 },
  { year: 8, extractionGranite: 5500, caGranite: 0, extractionTuf: 0, caTuf: 0, matieresFournitures: 9700000, services: 4700000, fraisPersonnel: 0, impotsTaxes: 1200000, fraisFinanciers: 500000, dotationsAmortissements: 0 },
  { year: 9, extractionGranite: 5500, caGranite: 0, extractionTuf: 0, caTuf: 0, matieresFournitures: 9900000, services: 4800000, fraisPersonnel: 0, impotsTaxes: 1250000, fraisFinanciers: 400000, dotationsAmortissements: 0 },
  { year: 10, extractionGranite: 5500, caGranite: 0, extractionTuf: 0, caTuf: 0, matieresFournitures: 10100000, services: 4900000, fraisPersonnel: 0, impotsTaxes: 1300000, fraisFinanciers: 300000, dotationsAmortissements: 0 }
];

const INITIAL_YEARS_TUF: AnnualData[] = [
  { year: 1, extractionGranite: 0, caGranite: 0, extractionTuf: 45000, caTuf: 0, matieresFournitures: 8000000, services: 4000000, fraisPersonnel: 0, impotsTaxes: 850000, fraisFinanciers: 1200000, dotationsAmortissements: 0 },
  { year: 2, extractionGranite: 0, caGranite: 0, extractionTuf: 48000, caTuf: 0, matieresFournitures: 8200000, services: 4100000, fraisPersonnel: 0, impotsTaxes: 900000, fraisFinanciers: 1100000, dotationsAmortissements: 0 },
  { year: 3, extractionGranite: 0, caGranite: 0, extractionTuf: 50000, caTuf: 0, matieresFournitures: 8500000, services: 4200000, fraisPersonnel: 0, impotsTaxes: 950000, fraisFinanciers: 1000000, dotationsAmortissements: 0 },
  { year: 4, extractionGranite: 0, caGranite: 0, extractionTuf: 52000, caTuf: 0, matieresFournitures: 8800000, services: 4300000, fraisPersonnel: 0, impotsTaxes: 1000000, fraisFinanciers: 900000, dotationsAmortissements: 0 },
  { year: 5, extractionGranite: 0, caGranite: 0, extractionTuf: 55000, caTuf: 0, matieresFournitures: 9100000, services: 4400000, fraisPersonnel: 0, impotsTaxes: 1050000, fraisFinanciers: 800000, dotationsAmortissements: 0 },
  { year: 6, extractionGranite: 0, caGranite: 0, extractionTuf: 55000, caTuf: 0, matieresFournitures: 9300000, services: 4500000, fraisPersonnel: 0, impotsTaxes: 1100000, fraisFinanciers: 700000, dotationsAmortissements: 0 },
  { year: 7, extractionGranite: 0, caGranite: 0, extractionTuf: 55000, caTuf: 0, matieresFournitures: 9500000, services: 4600000, fraisPersonnel: 0, impotsTaxes: 1150000, fraisFinanciers: 600000, dotationsAmortissements: 0 },
  { year: 8, extractionGranite: 0, caGranite: 0, extractionTuf: 55000, caTuf: 0, matieresFournitures: 9700000, services: 4700000, fraisPersonnel: 0, impotsTaxes: 1200000, fraisFinanciers: 500000, dotationsAmortissements: 0 },
  { year: 9, extractionGranite: 0, caGranite: 0, extractionTuf: 55000, caTuf: 0, matieresFournitures: 9900000, services: 4800000, fraisPersonnel: 0, impotsTaxes: 1250000, fraisFinanciers: 400000, dotationsAmortissements: 0 },
  { year: 10, extractionGranite: 0, caGranite: 0, extractionTuf: 55000, caTuf: 0, matieresFournitures: 10100000, services: 4900000, fraisPersonnel: 0, impotsTaxes: 1300000, fraisFinanciers: 300000, dotationsAmortissements: 0 }
];

const INITIAL_YEARS_COMBINED: AnnualData[] = [
  { year: 1, extractionGranite: 3500, caGranite: 0, extractionTuf: 45000, caTuf: 0, matieresFournitures: 8000000, services: 4000000, fraisPersonnel: 0, impotsTaxes: 850000, fraisFinanciers: 1200000, dotationsAmortissements: 0 },
  { year: 2, extractionGranite: 4000, caGranite: 0, extractionTuf: 48000, caTuf: 0, matieresFournitures: 8200000, services: 4100000, fraisPersonnel: 0, impotsTaxes: 900000, fraisFinanciers: 1100000, dotationsAmortissements: 0 },
  { year: 3, extractionGranite: 4500, caGranite: 0, extractionTuf: 50000, caTuf: 0, matieresFournitures: 8500000, services: 4200000, fraisPersonnel: 0, impotsTaxes: 950000, fraisFinanciers: 1000000, dotationsAmortissements: 0 },
  { year: 4, extractionGranite: 5000, caGranite: 0, extractionTuf: 52000, caTuf: 0, matieresFournitures: 8800000, services: 4300000, fraisPersonnel: 0, impotsTaxes: 1000000, fraisFinanciers: 900000, dotationsAmortissements: 0 },
  { year: 5, extractionGranite: 5500, caGranite: 0, extractionTuf: 55000, caTuf: 0, matieresFournitures: 9100000, services: 4400000, fraisPersonnel: 0, impotsTaxes: 1050000, fraisFinanciers: 800000, dotationsAmortissements: 0 },
  { year: 6, extractionGranite: 5500, caGranite: 0, extractionTuf: 55000, caTuf: 0, matieresFournitures: 9300000, services: 4500000, fraisPersonnel: 0, impotsTaxes: 1100000, fraisFinanciers: 700000, dotationsAmortissements: 0 },
  { year: 7, extractionGranite: 5500, caGranite: 0, extractionTuf: 55000, caTuf: 0, matieresFournitures: 9500000, services: 4600000, fraisPersonnel: 0, impotsTaxes: 1150000, fraisFinanciers: 600000, dotationsAmortissements: 0 },
  { year: 8, extractionGranite: 5500, caGranite: 0, extractionTuf: 55000, caTuf: 0, matieresFournitures: 9700000, services: 4700000, fraisPersonnel: 0, impotsTaxes: 1200000, fraisFinanciers: 500000, dotationsAmortissements: 0 },
  { year: 9, extractionGranite: 5500, caGranite: 0, extractionTuf: 55000, caTuf: 0, matieresFournitures: 9900000, services: 4800000, fraisPersonnel: 0, impotsTaxes: 1250000, fraisFinanciers: 400000, dotationsAmortissements: 0 },
  { year: 10, extractionGranite: 5500, caGranite: 0, extractionTuf: 55000, caTuf: 0, matieresFournitures: 10100000, services: 4900000, fraisPersonnel: 0, impotsTaxes: 1300000, fraisFinanciers: 300000, dotationsAmortissements: 0 }
];

const INITIAL_YEARS: AnnualData[] = INITIAL_YEARS_COMBINED;

const INITIAL_ROLES: EmployeeRole[] = [
  { id: "1", designation: "Directeur d'exploitation", count: 1, monthlySalary: 120000, hasExperience: true, allocation: "Common" },
  { id: "2", designation: "Ingénieur des Mines", count: 1, monthlySalary: 95000, hasExperience: true, allocation: "Common" },
  { id: "3", designation: "Chef d'équipe de carrière", count: 2, monthlySalary: 75000, hasExperience: true, allocation: "Common" },
  { id: "4", designation: "Conducteur d'engins qualifié", count: 6, monthlySalary: 60000, hasExperience: false, allocation: "Common" },
  { id: "5", designation: "Scieur au fil diamanté", count: 3, monthlySalary: 55000, hasExperience: false, allocation: "Granite" },
  { id: "6", designation: "Foreur sur foreuse", count: 2, monthlySalary: 55000, hasExperience: false, allocation: "Common" },
  { id: "7", designation: "Mécanicien de maintenance", count: 1, monthlySalary: 65000, hasExperience: true, allocation: "Common" },
  { id: "8", designation: "Agent d'entretien et divers", count: 2, monthlySalary: 42000, hasExperience: false, allocation: "Common" },
  { id: "9", designation: "Secrétaire/Comptable", count: 1, monthlySalary: 50000, hasExperience: true, allocation: "Common" },
  { id: "10", designation: "Gardien/Sécurité", count: 3, monthlySalary: 45000, hasExperience: false, allocation: "Common" }
];

const INITIAL_MACHINES: OperationalMachine[] = [
  { id: "m1", designation: "Excavateur principal CAT 336", count: 1, powerKw: 220, consumptionRate: 0.15, utilizationCoef: 0.7, hoursPerDay: 8, workDaysPerYear: 250, allocation: "Common" },
  { id: "m2", designation: "Chargeuse sur pneus Komatsu WA470", count: 1, powerKw: 200, consumptionRate: 0.15, utilizationCoef: 0.6, hoursPerDay: 8, workDaysPerYear: 250, allocation: "Common" },
  { id: "m3", designation: "Foreuse Hydraulique fond de trou", count: 1, powerKw: 110, consumptionRate: 0.14, utilizationCoef: 0.7, hoursPerDay: 6, workDaysPerYear: 200, allocation: "Granite" },
  { id: "m4", designation: "Camion dumper articulé Volvo A30", count: 2, powerKw: 260, consumptionRate: 0.16, utilizationCoef: 0.5, hoursPerDay: 8, workDaysPerYear: 250, allocation: "Common" }
];

const INITIAL_ELECTRICITY_LINES: ElectricityLine[] = [
  { id: "e1", designation: "Unité de concassage / Criblage Tuf", count: 1, powerKw: 132, utilizationCoef: 0.75, hoursPerDay: 8, workDaysPerYear: 250 },
  { id: "e2", designation: "Châssis de Sciage Granite", count: 1, powerKw: 75, utilizationCoef: 0.7, hoursPerDay: 16, workDaysPerYear: 250 },
  { id: "e3", designation: "Ateliers, compresseurs et bureaux", count: 1, powerKw: 30, utilizationCoef: 0.5, hoursPerDay: 8, workDaysPerYear: 250 }
];

const INITIAL_ACCESSORY_ITEMS: AccessoryItem[] = [
  { id: "a1", designation: "Fil diamanté sciage", qtyPerYear: 120, unitPrice: 35000, unit: "m", allocation: "Granite" },
  { id: "a2", designation: "Fleurets et taillants foreuse", qtyPerYear: 60, unitPrice: 8500, unit: "u", allocation: "Granite" },
  { id: "a3", designation: "Lubrifiants et graisses machine", qtyPerYear: 800, unitPrice: 450, unit: "L", allocation: "Common" }
];

const INITIAL_EQUIPMENTS: Equipment[] = [
  { id: "eq1", designation: "Excavateur CAT 336", category: "Équipements Lourds & Matériel", price: 25000000, duration: 10, allocation: "Common" },
  { id: "eq2", designation: "Chargeuse Komatsu WA470", category: "Équipements Lourds & Matériel", price: 18000000, duration: 8, allocation: "Common" },
  { id: "eq3", designation: "Foreuse Hydraulique", category: "Équipements Lourds & Matériel", price: 12000000, duration: 5, allocation: "Granite" },
  { id: "eq4", designation: "Châssis Monolame", category: "Équipements Lourds & Matériel", price: 8000000, duration: 5, allocation: "Granite" },
  { id: "eq5", designation: "Concasseur mobile", category: "Équipements Lourds & Matériel", price: 15000000, duration: 7, allocation: "Tuf" },
  { id: "eq6", designation: "Camions dumpers Volvo (x2)", category: "Équipements Lourds & Matériel", price: 24000000, duration: 8, allocation: "Common" }
];

const INITIAL_WATER_CONFIG_WITH_ITEMS: WaterConfig = {
  globalPrice: 40.95,
  hasCustomPrices: false,
  customPrices: Array(10).fill(40.95),
  items: [
    { id: "w1", designation: "Refroidissement fil diamanté (Sciage)", flowRate: 4000, hoursPerShift: 8, shiftsPerDay: 2, daysPerYear: 250, hoursPerYear: 4000, hasCustomHours: false, customHours: Array(10).fill(0) },
    { id: "w2", designation: "Dépoussiérage pistes et concassage", flowRate: 1500, hoursPerShift: 4, shiftsPerDay: 1, daysPerYear: 200, hoursPerYear: 800, hasCustomHours: false, customHours: Array(10).fill(0) },
    { id: "w3", designation: "Lavage engins et divers services", flowRate: 800, hoursPerShift: 2, shiftsPerDay: 1, daysPerYear: 250, hoursPerYear: 500, hasCustomHours: false, customHours: Array(10).fill(0) }
  ]
};

const INITIAL_WATER_CONFIG: WaterConfig = INITIAL_WATER_CONFIG_WITH_ITEMS;

const formatCurrency = (n: number) => {
  if (n === undefined || n === null || isNaN(n)) return '0';
  return new Intl.NumberFormat('fr-DZ', { style: 'decimal', maximumFractionDigits: 2 }).format(n);
};

const formatFormatWithUnit = (n: number) => `${formatCurrency(n)} DA`;

const formatCompact = (n: number) => {
  if (n === undefined || n === null || isNaN(n)) return '0';
  try {
    return n.toLocaleString('fr-DZ', { maximumFractionDigits: 2 });
  } catch (e) {
    return '0';
  }
};

const INITIAL_PROD_CONFIG: ProductionDimensioning = {
  horizon: '1y',
  targetMode: 'constant',
  vTargetConstant: 10000,
  vTargetVariable: Array(10).fill(10000),
  yieldsConstant: { eta1: 0.5, eta2: 0.8 },
  yieldsVariable: { eta1: Array(10).fill(0.5), eta2: Array(10).fill(0.8) },
  steps: {
    extraction: {
      name: "Extraction gros blocs",
      dimensions: { l: 10, w: 10, h: 1.6 },
      productivity: { vs: 20, hEq: 1.6, hoursPerDay: 8, daysPerYear: 250, utilizationRate: 1 }
    },
    retaille: {
      name: "Retaille des blocs",
      dimensions: { l: 2.15, w: 1.5, h: 1.4 },
      productivity: { vs: 30, hEq: 1.4, hoursPerDay: 8, daysPerYear: 250, utilizationRate: 1 }
    }
  }
};

// Custom Hook for LocalStorage Persistence
function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;
      
      const parsed = JSON.parse(item);
      
      // If it's an object (and not an array), merge it with initialValue 
      // to ensure new properties are populated
      if (
        typeof parsed === 'object' && 
        parsed !== null && 
        !Array.isArray(parsed) && 
        typeof initialValue === 'object' && 
        initialValue !== null &&
        !Array.isArray(initialValue)
      ) {
        return { ...initialValue, ...parsed } as T;
      }
      
      return parsed;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    setStoredValue((prev) => {
      try {
        const valueToStore = typeof value === 'function' ? (value as (val: T) => T)(prev) : value;
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        return valueToStore;
      } catch (error) {
        console.error(`Error saving to localStorage key "${key}":`, error);
        return prev;
      }
    });
  };

  return [storedValue, setValue] as const;
}

const PRELOADED_GRANITE = {
  saveName: "TCR GRANITE",
  userNotes: "",
  years: INITIAL_YEARS_GRANITE,
  equipments: INITIAL_EQUIPMENTS,
  roles: INITIAL_ROLES,
  hrConfig: { socialChargesRate: 0.26, annualIncreaseRate: 0.03, paidMonths: 12, experienceRate: 0.06 },
  machines: INITIAL_MACHINES,
  opConfig: { fuelPrice: 29, workDaysPerYear: 250, hoursPerDay: 8, annualInflationRate: 3 },
  electricityLines: INITIAL_ELECTRICITY_LINES,
  electricityConfig: { cosPhi: 0.8, kvaPerGroup: 500, specificConsumption: 0.30, workDaysPerYear: 250, hoursPerDay: 8 },
  accessoryConfig: { items: INITIAL_ACCESSORY_ITEMS },
  waterConfig: INITIAL_WATER_CONFIG_WITH_ITEMS,
  ibmRate: 0.12,
  priceGranite: 4500,
  densityGranite: 2.49,
  priceTuf: 3500,
  densityTuf: 2.39,
  decimalPlaces: 2,
  dmParams: { vs: '20', cfu: '0.5', hj: '8', ja: '250', n: '1' },
  productionConfig: INITIAL_PROD_CONFIG,
  lastSaved: "2026-06-03T00:00:00.000Z"
};

const PRELOADED_TUF = {
  saveName: "TCR TUF",
  userNotes: "",
  years: INITIAL_YEARS_TUF,
  equipments: INITIAL_EQUIPMENTS,
  roles: INITIAL_ROLES,
  hrConfig: { socialChargesRate: 0.26, annualIncreaseRate: 0.03, paidMonths: 12, experienceRate: 0.06 },
  machines: INITIAL_MACHINES,
  opConfig: { fuelPrice: 29, workDaysPerYear: 250, hoursPerDay: 8, annualInflationRate: 3 },
  electricityLines: INITIAL_ELECTRICITY_LINES,
  electricityConfig: { cosPhi: 0.8, kvaPerGroup: 500, specificConsumption: 0.30, workDaysPerYear: 250, hoursPerDay: 8 },
  accessoryConfig: { items: INITIAL_ACCESSORY_ITEMS },
  waterConfig: INITIAL_WATER_CONFIG_WITH_ITEMS,
  ibmRate: 0.12,
  priceGranite: 4500,
  densityGranite: 2.49,
  priceTuf: 3500,
  densityTuf: 2.39,
  decimalPlaces: 2,
  dmParams: { vs: '20', cfu: '0.5', hj: '8', ja: '250', n: '1' },
  productionConfig: INITIAL_PROD_CONFIG,
  lastSaved: "2026-06-03T00:00:01.000Z"
};

const PRELOADED_COMBINED = {
  saveName: "TCR COMBINE",
  userNotes: "",
  years: INITIAL_YEARS_COMBINED,
  equipments: INITIAL_EQUIPMENTS,
  roles: INITIAL_ROLES,
  hrConfig: { socialChargesRate: 0.26, annualIncreaseRate: 0.03, paidMonths: 12, experienceRate: 0.06 },
  machines: INITIAL_MACHINES,
  opConfig: { fuelPrice: 29, workDaysPerYear: 250, hoursPerDay: 8, annualInflationRate: 3 },
  electricityLines: INITIAL_ELECTRICITY_LINES,
  electricityConfig: { cosPhi: 0.8, kvaPerGroup: 500, specificConsumption: 0.30, workDaysPerYear: 250, hoursPerDay: 8 },
  accessoryConfig: { items: INITIAL_ACCESSORY_ITEMS },
  waterConfig: INITIAL_WATER_CONFIG_WITH_ITEMS,
  ibmRate: 0.12,
  priceGranite: 4500,
  densityGranite: 2.49,
  priceTuf: 3500,
  densityTuf: 2.39,
  decimalPlaces: 2,
  dmParams: { vs: '20', cfu: '0.5', hj: '8', ja: '250', n: '1' },
  productionConfig: INITIAL_PROD_CONFIG,
  lastSaved: "2026-06-03T00:00:02.000Z"
};

export default function App() {
  const SAVE_KEY = 'graniteapp_saved_state_v1';

  // Helper to load initial state from localStorage
  const loadInitialState = () => {
    try {
      const saved = window.localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // If the state is empty or dummy (e.g. no equipments, or all extraction values are zeroes),
        // we force fallback to our rich default prefilled datasets.
        if (
          !parsed ||
          !parsed.equipments ||
          parsed.equipments.length === 0 ||
          !parsed.years ||
          parsed.years.every((y: any) => (y.extractionGranite || 0) === 0 && (y.extractionTuf || 0) === 0)
        ) {
          return null;
        }
        return parsed;
      }
    } catch (e) {
      console.error("Erreur lors du chargement de la sauvegarde :", e);
    }
    return null;
  };

  const initialState = loadInitialState();

  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const [userNotes, setUserNotes] = useState<string>(initialState?.userNotes ?? '');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'prod' | 'edit' | 'table' | 'invest' | 'hr' | 'ops' | 'elec' | 'acc' | 'charts' | 'code' | 'about' | 'help' | 'history'>('dashboard');
  const [years, setYears] = useState<AnnualData[]>(initialState?.years ?? INITIAL_YEARS);
  const [equipments, setEquipments] = useState<Equipment[]>(initialState?.equipments ?? INITIAL_EQUIPMENTS);
  const [ibmRate, setIbmRate] = useState<number>(initialState?.ibmRate ?? 0.12);
  const [ibmRateInput, setIbmRateInput] = useState<string>(((initialState?.ibmRate ?? 0.12) * 100).toString());

  // Matériaux State - Prix, Densité et Arrondis
  const [priceGranite, setPriceGranite] = useState<number>(initialState?.priceGranite ?? 4500);
  const [priceGraniteInput, setPriceGraniteInput] = useState<string>((initialState?.priceGranite ?? 4500).toString());
  const [densityGranite, setDensityGranite] = useState<number>(initialState?.densityGranite ?? 2.49);
  const [densityGraniteInput, setDensityGraniteInput] = useState<string>((initialState?.densityGranite ?? 2.49).toString());

  const [priceTuf, setPriceTuf] = useState<number>(initialState?.priceTuf ?? 3500);
  const [priceTufInput, setPriceTufInput] = useState<string>((initialState?.priceTuf ?? 3500).toString());
  const [densityTuf, setDensityTuf] = useState<number>(initialState?.densityTuf ?? 2.39);
  const [densityTufInput, setDensityTufInput] = useState<string>((initialState?.densityTuf ?? 2.39).toString());

  const [decimalPlaces, setDecimalPlaces] = useState<number>(initialState?.decimalPlaces ?? 2);
  const [decimalPlacesInput, setDecimalPlacesInput] = useState<string>((initialState?.decimalPlaces ?? 2).toString());

  // HR State
  const [roles, setRoles] = useState<EmployeeRole[]>(initialState?.roles ?? INITIAL_ROLES);
  const [hrConfig, setHrConfig] = useState<HRConfig>(() => {
    const base = initialState?.hrConfig ?? {
      socialChargesRate: 0.26,
      annualIncreaseRate: 0.03,
      paidMonths: 12,
      experienceRate: 0.06
    };
    return {
      experienceRate: 0.06,
      ...base
    };
  });

  const [socialChargesInput, setSocialChargesInput] = useState<string>(((initialState?.hrConfig?.socialChargesRate ?? 0.26) * 100).toString());
  const [annualIncreaseInput, setAnnualIncreaseInput] = useState<string>(((initialState?.hrConfig?.annualIncreaseRate ?? 0.03) * 100).toString());
  const [experienceRateInput, setExperienceRateInput] = useState<string>(((initialState?.hrConfig?.experienceRate ?? 0.06) * 100).toString());

  // Operational State
  const [machines, setMachines] = useState<OperationalMachine[]>(() => {
    const base = initialState?.machines ?? INITIAL_MACHINES;
    return base.map((m: any) => ({
      ...m,
      hoursPerDay: m.hoursPerDay ?? initialState?.opConfig?.hoursPerDay ?? 8,
      workDaysPerYear: m.workDaysPerYear ?? initialState?.opConfig?.workDaysPerYear ?? 250
    }));
  });
  const [opConfig, setOpConfig] = useState<OperationalConfig>(initialState?.opConfig ?? {
    fuelPrice: 29,
    workDaysPerYear: 250,
    hoursPerDay: 8,
    annualInflationRate: 3
  });
  const [annualInflationInput, setAnnualInflationInput] = useState<string>((initialState?.opConfig?.annualInflationRate ?? 3).toString());

  // Electricity State
  const [electricityLines, setElectricityLines] = useState<ElectricityLine[]>(() => {
    const base = initialState?.electricityLines ?? INITIAL_ELECTRICITY_LINES;
    return base.map((l: any) => ({
      ...l,
      hoursPerDay: l.hoursPerDay ?? initialState?.electricityConfig?.hoursPerDay ?? 8,
      workDaysPerYear: l.workDaysPerYear ?? initialState?.electricityConfig?.workDaysPerYear ?? 250
    }));
  });
  const [electricityConfig, setElectricityConfig] = useState<ElectricityConfig>(() => {
    const base = initialState?.electricityConfig ?? {
      cosPhi: 0.8,
      kvaPerGroup: 500,
      specificConsumption: 0.30,
      workDaysPerYear: 250,
      hoursPerDay: 8
    };
    // Migration: If these fields weren't independent before, take them from opConfig
    if (base.workDaysPerYear === undefined) {
      base.workDaysPerYear = initialState?.opConfig?.workDaysPerYear ?? 250;
    }
    if (base.hoursPerDay === undefined) {
      base.hoursPerDay = initialState?.opConfig?.hoursPerDay ?? 8;
    }
    return base;
  });

  // Accessory State
  const [accessoryConfig, setAccessoryConfig] = useState<AccessoryConfig>(() => {
    const base = initialState?.accessoryConfig;
    return {
      items: base?.items || INITIAL_ACCESSORY_ITEMS
    };
  });

  // Form states for new accessory
  const [newAccName, setNewAccName] = useState('');
  const [newAccQty, setNewAccQty] = useState('');
  const [newAccPrice, setNewAccPrice] = useState('');
  const [newAccUnit, setNewAccUnit] = useState('m');
  const [newAccAlloc, setNewAccAlloc] = useState<Allocation>('Common');
  
  // Diamond Wire Card/Modal State
  const [isDiamondModalOpen, setIsDiamondModalOpen] = useState(false);
  const [dmDesignation, setDmDesignation] = useState('Fil diamanté');
  const [dmQty, setDmQty] = useState('0');
  const [dmUnitPrice, setDmUnitPrice] = useState('0');
  const [dmAlloc, setDmAlloc] = useState<Allocation>('Common');

  // Production State
  const [productionConfig, setProductionConfig] = useState<ProductionDimensioning>(() => {
    const base = initialState?.productionConfig;
    if (!base) return INITIAL_PROD_CONFIG;
    return {
      ...INITIAL_PROD_CONFIG,
      ...base,
      yieldsConstant: {
        ...INITIAL_PROD_CONFIG.yieldsConstant,
        ...(base.yieldsConstant || {})
      },
      yieldsVariable: {
        ...INITIAL_PROD_CONFIG.yieldsVariable,
        ...(base.yieldsVariable || {})
      },
      steps: {
        extraction: {
          ...INITIAL_PROD_CONFIG.steps.extraction,
          ...(base.steps?.extraction || {}),
          dimensions: {
            ...INITIAL_PROD_CONFIG.steps.extraction.dimensions,
            ...(base.steps?.extraction?.dimensions || {})
          },
          productivity: {
            ...INITIAL_PROD_CONFIG.steps.extraction.productivity,
            ...(base.steps?.extraction?.productivity || {})
          }
        },
        retaille: {
          ...INITIAL_PROD_CONFIG.steps.retaille,
          ...(base.steps?.retaille || {}),
          dimensions: {
            ...INITIAL_PROD_CONFIG.steps.retaille.dimensions,
            ...(base.steps?.retaille?.dimensions || {})
          },
          productivity: {
            ...INITIAL_PROD_CONFIG.steps.retaille.productivity,
            ...(base.steps?.retaille?.productivity || {})
          }
        }
      }
    };
  });

  // Water Consumption State
  const [waterConfig, setWaterConfig] = useState<WaterConfig>(() => {
    const base = initialState?.waterConfig;
    if (!base) return INITIAL_WATER_CONFIG;
    return {
      ...INITIAL_WATER_CONFIG,
      ...base,
      customPrices: base.customPrices ?? Array(10).fill(base.globalPrice ?? 40.95),
      items: base.items || INITIAL_WATER_CONFIG.items
    };
  });

  // Form states for adding new water consumptions
  const [newWaterName, setNewWaterName] = useState('');
  const [newWaterFlow, setNewWaterFlow] = useState('');
  const [newWaterHrsPerShift, setNewWaterHrsPerShift] = useState('8');
  const [newWaterShiftsPerDay, setNewWaterShiftsPerDay] = useState('1');
  const [newWaterDaysPerYear, setNewWaterDaysPerYear] = useState('250');
  const [newWaterHours, setNewWaterHours] = useState('2000');

  useEffect(() => {
    const hrs = Number(newWaterHrsPerShift) || 0;
    const shifts = Number(newWaterShiftsPerDay) || 0;
    const days = Number(newWaterDaysPerYear) || 0;
    setNewWaterHours((hrs * shifts * days).toString());
  }, [newWaterHrsPerShift, newWaterShiftsPerDay, newWaterDaysPerYear]);

  const [dmVs, setDmVs] = useState(initialState?.dmParams?.vs ?? '20');
  const [dmCfu, setDmCfu] = useState(initialState?.dmParams?.cfu ?? '0.5');
  const [dmHj, setDmHj] = useState(initialState?.dmParams?.hj ?? '8');
  const [dmJa, setDmJa] = useState(initialState?.dmParams?.ja ?? '250');
  const [dmN, setDmN] = useState(initialState?.dmParams?.n ?? '1');

  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const [history, setHistory] = useLocalStorage<any[]>('graniteapp_history_v1', [PRELOADED_GRANITE, PRELOADED_TUF, PRELOADED_COMBINED]);
  const [customSaveName, setCustomSaveName] = useState<string>("TCR GRANITE");
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetSaveName, setResetSaveName] = useState("TCR GRANITE");
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info' | 'error'} | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    // Reset toast state after 3 seconds
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  };

  const handleSave = (customName?: string) => {
    try {
      const stateToSave = {
        saveName: customName,
        userNotes,
        years,
        equipments,
        roles,
        hrConfig,
        machines,
        opConfig,
        electricityLines,
        electricityConfig,
        accessoryConfig,
        waterConfig,
        ibmRate,
        priceGranite,
        densityGranite,
        priceTuf,
        densityTuf,
        decimalPlaces,
        dmParams: { vs: dmVs, cfu: dmCfu, hj: dmHj, ja: dmJa, n: dmN },
        productionConfig,
        lastSaved: new Date().toISOString()
      };
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(stateToSave));
      
      // Add to history safely
      setHistory(prev => {
        const currentHistory = Array.isArray(prev) ? prev : [];
        const newHistory = [stateToSave, ...currentHistory];
        return newHistory.slice(0, 50); // Keep last 50
      });
      
      if (customName) {
        showToast(`Version "${customName}" enregistrée dans l'historique !`);
      } else {
        showToast("Projet enregistré & Historique mis à jour");
      }
    } catch (e) {
      console.error("Erreur lors de la sauvegarde :", e);
      alert("Erreur lors de la sauvegarde.");
    }
  };

  useEffect(() => {
    setHistory(prev => {
      const current = Array.isArray(prev) ? prev : [];
      let updated = [...current];
      let changed = false;
      
      const hasGranite = updated.some(item => item && item.saveName === "TCR GRANITE");
      const hasTuf = updated.some(item => item && item.saveName === "TCR TUF");
      const hasCombined = updated.some(item => item && item.saveName === "TCR COMBINE");
      
      if (!hasGranite) {
        updated.push(PRELOADED_GRANITE);
        changed = true;
      }
      if (!hasTuf) {
        updated.push(PRELOADED_TUF);
        changed = true;
      }
      if (!hasCombined) {
        updated.push(PRELOADED_COMBINED);
        changed = true;
      }
      
      return changed ? updated : prev;
    });
  }, []);

  const restoreFromHistory = (data: any) => {
    if (!data) return;
    try {
      // 1. Instantly write to SAVE_KEY so it's persisted on refresh / reload
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(data));

      // 2. Safely apply to React state variables
      setUserNotes(data.userNotes ?? '');
      setYears(data.years ?? INITIAL_YEARS);
      setEquipments(data.equipments ?? INITIAL_EQUIPMENTS);
      setRoles(data.roles && data.roles.length > 0 ? data.roles : INITIAL_ROLES);
      setHrConfig(data.hrConfig ?? { socialChargesRate: 0.26, annualIncreaseRate: 0.03, paidMonths: 12, experienceRate: 0.06 });
      setSocialChargesInput(((data.hrConfig?.socialChargesRate ?? 0.26) * 100).toString());
      setAnnualIncreaseInput(((data.hrConfig?.annualIncreaseRate ?? 0.03) * 100).toString());
      setExperienceRateInput(((data.hrConfig?.experienceRate ?? 0.06) * 100).toString());
      setMachines(data.machines && data.machines.length > 0 ? data.machines : INITIAL_MACHINES);
      setOpConfig(data.opConfig ?? { fuelPrice: 29, workDaysPerYear: 250, hoursPerDay: 8, annualInflationRate: 3 });
      setAnnualInflationInput((data.opConfig?.annualInflationRate ?? 3).toString());
      setElectricityLines(data.electricityLines && data.electricityLines.length > 0 ? data.electricityLines : INITIAL_ELECTRICITY_LINES);
      setElectricityConfig(data.electricityConfig ?? { cosPhi: 0.8, kvaPerGroup: 500, specificConsumption: 0.30, workDaysPerYear: 250, hoursPerDay: 8 });
      setAccessoryConfig(data.accessoryConfig ?? { items: INITIAL_ACCESSORY_ITEMS });
      setWaterConfig(data.waterConfig ?? INITIAL_WATER_CONFIG_WITH_ITEMS);
      setIbmRate(data.ibmRate ?? 0.12);
      setIbmRateInput(((data.ibmRate ?? 0.12) * 100).toString());
      setPriceGranite(data.priceGranite ?? 4500);
      setPriceGraniteInput((data.priceGranite ?? 4500).toString());
      setDensityGranite(data.densityGranite ?? 2.49);
      setDensityGraniteInput((data.densityGranite ?? 2.49).toString());
      setPriceTuf(data.priceTuf ?? 3500);
      setPriceTufInput((data.priceTuf ?? 3500).toString());
      setDensityTuf(data.densityTuf ?? 2.39);
      setDensityTufInput((data.densityTuf ?? 2.39).toString());
      setDecimalPlaces(data.decimalPlaces ?? 2);
      setDecimalPlacesInput((data.decimalPlaces ?? 2).toString());
      if (data.dmParams) {
        setDmVs(data.dmParams.vs ?? '20');
        setDmCfu(data.dmParams.cfu ?? '0.5');
        setDmHj(data.dmParams.hj ?? '8');
        setDmJa(data.dmParams.ja ?? '250');
        setDmN(data.dmParams.n ?? '1');
      }
      if (data.productionConfig) {
        setProductionConfig(data.productionConfig);
      }
      showToast("Version restaurée avec succès et sauvegardée");
      setActiveTab('dashboard');
    } catch (err) {
      console.error("Error restoring state:", err);
      showToast("Erreur lors de la restauration", "error");
    }
  };

  const resetToInitial = useCallback(() => {
    setUserNotes('');
    setYears(INITIAL_YEARS);
    setEquipments(INITIAL_EQUIPMENTS);
    setRoles(INITIAL_ROLES);
    setHrConfig({ socialChargesRate: 0.26, annualIncreaseRate: 0.03, paidMonths: 12, experienceRate: 0.06 });
    setSocialChargesInput("26");
    setAnnualIncreaseInput("3");
    setExperienceRateInput("6");
    setMachines(INITIAL_MACHINES);
    setOpConfig({ fuelPrice: 29, workDaysPerYear: 250, hoursPerDay: 8, annualInflationRate: 3 });
    setAnnualInflationInput("3");
    setElectricityLines(INITIAL_ELECTRICITY_LINES);
    setElectricityConfig({ cosPhi: 0.8, kvaPerGroup: 500, specificConsumption: 0.30, workDaysPerYear: 250, hoursPerDay: 8 });
    setAccessoryConfig({ items: INITIAL_ACCESSORY_ITEMS });
    setWaterConfig(INITIAL_WATER_CONFIG_WITH_ITEMS);
    setIbmRate(0.12);
    setIbmRateInput("12");
    setPriceGranite(4500);
    setPriceGraniteInput("4500");
    setDensityGranite(2.49);
    setDensityGraniteInput("2.49");
    setPriceTuf(3500);
    setPriceTufInput("3500");
    setDensityTuf(2.39);
    setDensityTufInput("2.39");
    setDecimalPlaces(2);
    setDecimalPlacesInput("2");
    setDmVs('20');
    setDmCfu('0.5');
    setDmHj('8');
    setDmJa('250');
    setDmN('1');
    setProductionConfig(INITIAL_PROD_CONFIG);
    setActiveTab('dashboard');
  }, []);

  const handleConfirmReset = useCallback((saveName: string) => {
    try {
      const finalName = saveName.trim() || `TCR GRANITE - Sauvegarde Automatique`;
      
      const stateToSave = {
        saveName: finalName,
        userNotes,
        years,
        equipments,
        roles,
        hrConfig,
        machines,
        opConfig,
        electricityLines,
        electricityConfig,
        accessoryConfig,
        ibmRate,
        priceGranite,
        densityGranite,
        priceTuf,
        densityTuf,
        decimalPlaces,
        dmParams: { vs: dmVs, cfu: dmCfu, hj: dmHj, ja: dmJa, n: dmN },
        productionConfig,
        lastSaved: new Date().toISOString()
      };
      
      // Save current state first (ensuring persistence)
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(stateToSave));
      
      // Update history in state & localStorage (guaranteeing the user's priority)
      const currentHistory = Array.isArray(history) ? history : [];
      const updatedHistory = [stateToSave, ...currentHistory].slice(0, 50);
      window.localStorage.setItem('graniteapp_history_v1', JSON.stringify(updatedHistory));
      setHistory(updatedHistory);

      // Now prepare to reset all entries except history itself
      const keys = Object.keys(window.localStorage);
      const toRemove = keys.filter(k => 
        (k.startsWith('granite_') || k.startsWith('graniteapp_')) && 
        k !== 'graniteapp_history_v1' && 
        k !== 'theme'
      );
      
      // Remove all state data
      window.localStorage.removeItem(SAVE_KEY);
      toRemove.forEach(k => window.localStorage.removeItem(k));
      
      // Revert memory state
      resetToInitial();
      
      showToast("Nouvelle étude démarrée et étude en cours sauvegardée !", "success");
      setIsResetConfirmOpen(false);
      
      // Safe reload delay
      setTimeout(() => {
        try {
          window.location.replace(window.location.origin + window.location.pathname);
        } catch (e) {
          window.location.reload();
        }
      }, 700);

    } catch (error) {
      console.error("Critical reset failure:", error);
      resetToInitial();
      showToast("Une erreur est survenue lors de la réinitialisation.", "error");
    }
  }, [
    history, setHistory, resetToInitial, userNotes, years, equipments, roles, hrConfig, 
    machines, opConfig, electricityLines, electricityConfig, accessoryConfig, waterConfig, 
    ibmRate, priceGranite, densityGranite, priceTuf, densityTuf, decimalPlaces, 
    dmVs, dmCfu, dmHj, dmJa, dmN, productionConfig
  ]);

  const handleResetData = useCallback(() => {
    // Set a neat default name with the current Arabic/French date
    const dateStr = new Date().toLocaleDateString('fr-DZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = new Date().toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
    setResetSaveName(`TCR GRANITE - ${dateStr} ${timeStr}`);
    setIsResetConfirmOpen(true);
  }, []);
  
  // Error states for form validation
  const [newEqErrors, setNewEqErrors] = useState<{name?: string, price?: string, duration?: string}>({});
  const [newRoleErrors, setNewRoleErrors] = useState<{name?: string, count?: string, salary?: string}>({});
  const [newOpErrors, setNewOpErrors] = useState<{name?: string, power?: string, count?: string, consRate?: string, utilCoef?: string}>({});
  const [newElecErrors, setNewElecErrors] = useState<{name?: string, power?: string, count?: string, utilCoef?: string}>({});
  const [newAccErrors, setNewAccErrors] = useState<{name?: string, qty?: string, price?: string}>({});
  const [diamondErrors, setDiamondErrors] = useState<{vs?: string, cfu?: string, hj?: string, ja?: string, n?: string}>({});

  // New operational form state
  const [newOpName, setNewOpName] = useState('');
  const [newOpPower, setNewOpPower] = useState('');
  const [newOpCount, setNewOpCount] = useState('1');
  const [newOpConsRate, setNewOpConsRate] = useState('0.2');
  const [newOpUtilCoef, setNewOpUtilCoef] = useState('0.7');
  const [newOpAlloc, setNewOpAlloc] = useState<'Granite' | 'Tuf' | 'Common'>('Common');
  
  // New roles form state
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleCount, setNewRoleCount] = useState('');
  const [newRoleSalary, setNewRoleSalary] = useState('');
  const [newRoleAlloc, setNewRoleAlloc] = useState<'Granite' | 'Tuf' | 'Common'>('Common');
  const [newRoleHasExperience, setNewRoleHasExperience] = useState(false);
  
  // New equipment form state
  const [newEqName, setNewEqName] = useState('');
  const [newEqPrice, setNewEqPrice] = useState('');
  const [newEqDuration, setNewEqDuration] = useState('');
  const [newEqCategory, setNewEqCategory] = useState<InvestmentCategory>("Équipements Lourds & Matériel");
  const [newEqAlloc, setNewEqAlloc] = useState<'Granite' | 'Tuf' | 'Common'>('Common');
  const [eqFilter, setEqFilter] = useState<'All' | Allocation>('All');
  
  // New electricity form state
  const [newElecName, setNewElecName] = useState('');
  const [newElecPower, setNewElecPower] = useState('');
  const [newElecCount, setNewElecCount] = useState('1');
  const [newElecUtilCoef, setNewElecUtilCoef] = useState('0.7');

  // 1. Calculate Amortization Schedule
  const amortResults = useMemo(() => getAmortizationSchedule(equipments), [equipments]);
  
  // 2. Calculate HR Costs Projection
  const hrTotals = useMemo(() => getHRCosts(roles, hrConfig), [roles, hrConfig]);

  // 3. Calculate Operational Costs (Fuel & Maintenance)
  const opResults = useMemo(() => getOperationalCosts(machines, opConfig), [machines, opConfig]);
  
  // 4. Calculate Electricity Costs
  const electricityResults = useMemo(() => getElectricityCosts(electricityLines, electricityConfig, opConfig), [electricityLines, electricityConfig, opConfig]);

  // 5. Calculate Accessory Costs
  const accessoryResults = useMemo(() => getAccessoryCosts(accessoryConfig, opConfig.annualInflationRate), [accessoryConfig, opConfig.annualInflationRate]);

  // 5b. Calculate Water Costs
  const waterResults = useMemo(() => getWaterCosts(waterConfig), [waterConfig]);

  // 6. Final TCR Calculation (using the manual data + automated overrides inside calculateYear)
  const calculatedYears = useMemo(() => 
    years.map((y, idx) => calculateYear(y, ibmRate, opResults.fuel, opResults.maintenance, hrTotals, amortResults.annualTotals, electricityResults, accessoryResults, idx, priceGranite, densityGranite, priceTuf, densityTuf, decimalPlaces, waterResults.annualCosts)), 
  [years, ibmRate, opResults, hrTotals, amortResults, electricityResults, accessoryResults, priceGranite, densityGranite, priceTuf, densityTuf, decimalPlaces, waterResults]);

  const totalRow = useMemo(() => calculateTotals(calculatedYears), [calculatedYears]);
  
  const filteredEquipments = useMemo(() => {
    if (eqFilter === 'All') return equipments;
    return equipments.filter(e => e.allocation === eqFilter);
  }, [equipments, eqFilter]);

  const totalInvestment = useMemo(() => equipments.reduce((sum, e) => sum + e.price, 0), [equipments]);
  const filteredTotalInvestment = useMemo(() => filteredEquipments.reduce((sum, e) => sum + e.price, 0), [filteredEquipments]);
  const filteredAmortResults = useMemo(() => getAmortizationSchedule(filteredEquipments), [filteredEquipments]);

  const handleUpdateYear = useCallback((yearIndex: number, field: keyof AnnualData, value: number) => {
    setYears(prev => {
      const newYears = [...prev];
      let finalValue = value;
      
      if (field === 'matieresFournitures') {
        const automatedFuel = opResults.fuel.granite[yearIndex] + opResults.fuel.tuf[yearIndex] + opResults.fuel.common[yearIndex];
        const automatedElectricity = electricityResults.granite[yearIndex] + electricityResults.tuf[yearIndex] + electricityResults.common[yearIndex];
        const automatedAccessories = accessoryResults.granite[yearIndex] + accessoryResults.tuf[yearIndex] + accessoryResults.common[yearIndex];
        const totalAutomated = automatedFuel + automatedElectricity + automatedAccessories;
        finalValue = Math.max(0, value - totalAutomated);
      } else if (field === 'fraisPersonnel') {
        const automatedHR = hrTotals.granite[yearIndex] + hrTotals.tuf[yearIndex] + hrTotals.common[yearIndex];
        finalValue = Math.max(0, value - automatedHR);
      } else if (field === 'dotationsAmortissements') {
        const automatedAmort = amortResults.annualTotals.granite[yearIndex] + amortResults.annualTotals.tuf[yearIndex] + amortResults.annualTotals.common[yearIndex];
        finalValue = Math.max(0, value - automatedAmort);
      }
      
      newYears[yearIndex] = { ...newYears[yearIndex], [field]: finalValue };
      return newYears;
    });
  }, [opResults.fuel, electricityResults, accessoryResults, hrTotals, amortResults.annualTotals]);

  const addEquipment = () => {
    const errors: {name?: string, price?: string, duration?: string} = {};
    if (!newEqName.trim()) errors.name = "La désignation est obligatoire";
    if (!newEqPrice || Number(newEqPrice) <= 0) errors.price = "Le prix doit être un nombre positif";
    if (newEqDuration !== '' && Number(newEqDuration) < 0) errors.duration = "La durée ne peut pas être négative";
    
    if (Object.keys(errors).length > 0) {
      setNewEqErrors(errors);
      return;
    }

    const eq: Equipment = {
      id: Math.random().toString(36).substr(2, 9),
      designation: newEqName,
      price: Number(newEqPrice),
      duration: Number(newEqDuration) || 0,
      category: newEqCategory,
      allocation: newEqAlloc
    };
    setEquipments([...equipments, eq]);
    setNewEqName('');
    setNewEqPrice('');
    setNewEqDuration('');
    setNewEqErrors({});
    showToast("Équipement ajouté");
  };

  const removeEquipment = (id: string) => {
    setEquipments(equipments.filter(e => e.id !== id));
  };

  const addRole = () => {
    const errors: {name?: string, count?: string, salary?: string} = {};
    if (!newRoleName.trim()) errors.name = "Le nom du poste est obligatoire";
    if (!newRoleCount || Number(newRoleCount) <= 0) errors.count = "Effectif invalide";
    if (!newRoleSalary || Number(newRoleSalary) <= 0) errors.salary = "Salaire invalide";

    if (Object.keys(errors).length > 0) {
      setNewRoleErrors(errors);
      return;
    }

    const role: EmployeeRole = {
      id: Math.random().toString(36).substr(2, 9),
      designation: newRoleName,
      count: Number(newRoleCount),
      monthlySalary: Number(newRoleSalary),
      allocation: newRoleAlloc,
      hasExperience: newRoleHasExperience
    };
    setRoles([...roles, role]);
    setNewRoleName('');
    setNewRoleCount('');
    setNewRoleSalary('');
    setNewRoleHasExperience(false);
    setNewRoleErrors({});
    showToast("Nouveau poste créé");
  };

  const removeRole = (id: string) => {
    setRoles(roles.filter(r => r.id !== id));
  };

  const addMachine = () => {
    const errors: {name?: string, power?: string, count?: string, consRate?: string, utilCoef?: string} = {};
    if (!newOpName.trim()) errors.name = "La désignation est obligatoire";
    if (!newOpPower || Number(newOpPower) <= 0) errors.power = "Puissance invalide";
    if (!newOpCount || Number(newOpCount) <= 0) errors.count = "Effectif invalide";
    if (Number(newOpConsRate) < 0) errors.consRate = "Ratio invalide";
    if (Number(newOpUtilCoef) < 0 || Number(newOpUtilCoef) > 1) errors.utilCoef = "Coefficient entre 0 et 1";

    if (Object.keys(errors).length > 0) {
      setNewOpErrors(errors);
      return;
    }

    const machine: OperationalMachine = {
      id: Math.random().toString(36).substr(2, 9),
      designation: newOpName,
      powerKw: Number(newOpPower),
      count: Number(newOpCount),
      consumptionRate: Number(newOpConsRate),
      utilizationCoef: Number(newOpUtilCoef),
      allocation: newOpAlloc,
      workDaysPerYear: opConfig.workDaysPerYear,
      hoursPerDay: opConfig.hoursPerDay
    };
    setMachines([...machines, machine]);
    resetOpForm();
    showToast("Engin opérationnel ajouté");
  };

  const resetOpForm = () => {
    setNewOpName('');
    setNewOpPower('');
    setNewOpCount('1');
    setNewOpConsRate('0.2');
    setNewOpUtilCoef('0.7');
    setNewOpAlloc('Common');
  };

  const removeMachine = (id: string) => {
    setMachines(machines.filter(m => m.id !== id));
  };

  const addElectricityLine = () => {
    const errors: {name?: string, power?: string, count?: string, utilCoef?: string} = {};
    if (!newElecName.trim()) errors.name = "La désignation est obligatoire";
    if (!newElecPower || Number(newElecPower) <= 0) errors.power = "Puissance invalide";
    if (!newElecCount || Number(newElecCount) <= 0) errors.count = "Effectif invalide";
    if (Number(newOpUtilCoef) < 0 || Number(newOpUtilCoef) > 1) errors.utilCoef = "Coefficient entre 0 et 1";

    if (Object.keys(errors).length > 0) {
      setNewElecErrors(errors);
      return;
    }

    const newLine: ElectricityLine = {
      id: Math.random().toString(36).substring(2, 11),
      designation: newElecName,
      powerKw: Number(newElecPower),
      count: Number(newElecCount),
      utilizationCoef: Number(newElecUtilCoef),
      workDaysPerYear: electricityConfig.workDaysPerYear,
      hoursPerDay: electricityConfig.hoursPerDay
    };
    setElectricityLines([...electricityLines, newLine]);
    setNewElecName('');
    setNewElecPower('');
    setNewElecCount('1');
    setNewElecUtilCoef('0.7');
    setNewElecErrors({});
    showToast("Ligne électrique ajoutée");
  };

  const removeElectricityLine = (id: string) => {
    setElectricityLines(electricityLines.filter(l => l.id !== id));
  };

  const addAccessory = () => {
    const errors: {name?: string, qty?: string, price?: string} = {};
    if (!newAccName.trim()) errors.name = "Désignation obligatoire";
    if (!newAccQty || Number(newAccQty) <= 0) errors.qty = "Quantité invalide";
    if (!newAccPrice || Number(newAccPrice) <= 0) errors.price = "Prix invalide";

    if (Object.keys(errors).length > 0) {
      setNewAccErrors(errors);
      return;
    }
    
    const newItem: AccessoryItem = {
      id: Math.random().toString(36).substring(2, 11),
      designation: newAccName,
      qtyPerYear: Number(newAccQty),
      unitPrice: Number(newAccPrice),
      unit: newAccUnit,
      allocation: newAccAlloc,
      calculationMode: 'direct'
    };
    setAccessoryConfig({
      ...accessoryConfig,
      items: [...accessoryConfig.items, newItem]
    });
    setNewAccName('');
    setNewAccQty('');
    setNewAccPrice('');
    setNewAccUnit('m');
    setNewAccAlloc('Common');
    setNewAccErrors({});
    showToast("Accessoire ajouté");
  };

  const removeAccessory = (id: string) => {
    setAccessoryConfig({
      ...accessoryConfig,
      items: accessoryConfig.items.filter(item => item.id !== id)
    });
  };

  // Water Consumption handlers
  const [newWaterErrors, setNewWaterErrors] = useState<{name?: string, flow?: string, hrsPerShift?: string, shiftsPerDay?: string, daysPerYear?: string}>({});

  const addWaterItem = () => {
    const errors: {name?: string, flow?: string, hrsPerShift?: string, shiftsPerDay?: string, daysPerYear?: string} = {};
    if (!newWaterName.trim()) errors.name = "Désignation obligatoire";
    if (newWaterFlow === '' || Number(newWaterFlow) < 0) errors.flow = "Débit invalide (min 0)";
    
    const hrsVal = Number(newWaterHrsPerShift) || 0;
    const shiftsVal = Number(newWaterShiftsPerDay) || 0;
    const daysVal = Number(newWaterDaysPerYear) || 0;

    if (hrsVal <= 0) errors.hrsPerShift = "Invalide (min > 0)";
    if (shiftsVal <= 0) errors.shiftsPerDay = "Invalide (min > 0)";
    if (daysVal <= 0) errors.daysPerYear = "Invalide (min > 0)";

    if (Object.keys(errors).length > 0) {
      setNewWaterErrors(errors);
      return;
    }

    const flowVal = Math.max(0, Number(newWaterFlow));
    const hVal = hrsVal * shiftsVal * daysVal;

    const newItem: WaterItem = {
      id: Math.random().toString(36).substring(2, 11),
      designation: newWaterName,
      flowRate: flowVal,
      hoursPerYear: hVal,
      hoursPerShift: hrsVal,
      shiftsPerDay: shiftsVal,
      daysPerYear: daysVal,
      hasCustomHours: false,
      customHours: Array(10).fill(hVal)
    };

    setWaterConfig({
      ...waterConfig,
      items: [...waterConfig.items, newItem]
    });

    setNewWaterName('');
    setNewWaterFlow('');
    setNewWaterHrsPerShift('8');
    setNewWaterShiftsPerDay('1');
    setNewWaterDaysPerYear('250');
    setNewWaterErrors({});
    showToast("Poste de consommation d'eau ajouté");
  };

  const removeWaterItem = (id: string) => {
    setWaterConfig({
      ...waterConfig,
      items: waterConfig.items.filter(item => item.id !== id)
    });
    showToast("Poste supprimé");
  };

  const updateWaterItemField = (id: string, field: keyof WaterItem | 'hoursPerShift' | 'shiftsPerDay' | 'daysPerYear', value: any) => {
    setWaterConfig(prev => {
      const updated = prev.items.map(item => {
        if (item.id === id) {
          let updatedItem = { ...item } as any;
          if (field === 'flowRate') {
            updatedItem.flowRate = Math.max(0, Number(value) || 0);
          } else if (field === 'hoursPerYear') {
            const hVal = Math.max(0, Number(value) || 0);
            updatedItem.hoursPerYear = hVal;
            if (!item.hasCustomHours) {
              updatedItem.customHours = Array(10).fill(hVal);
            }
          } else if (field === 'hoursPerShift' || field === 'shiftsPerDay' || field === 'daysPerYear') {
            const currentHShift = field === 'hoursPerShift' ? Number(value) : (item.hoursPerShift ?? 8);
            const currentSDay = field === 'shiftsPerDay' ? Number(value) : (item.shiftsPerDay ?? 1);
            const currentDYear = field === 'daysPerYear' ? Number(value) : (item.daysPerYear ?? 250);
            
            const calculatedHours = Math.max(0, currentHShift * currentSDay * currentDYear);
            
            updatedItem.hoursPerShift = currentHShift;
            updatedItem.shiftsPerDay = currentSDay;
            updatedItem.daysPerYear = currentDYear;
            updatedItem.hoursPerYear = calculatedHours;
            
            if (!item.hasCustomHours) {
              updatedItem.customHours = Array(10).fill(calculatedHours);
            }
          } else {
            updatedItem[field] = value;
          }
          return updatedItem as WaterItem;
        }
        return item;
      });
      return { ...prev, items: updated };
    });
  };

  const toggleWaterItemCustomHours = (id: string) => {
    setWaterConfig(prev => {
      const updated = prev.items.map(item => {
        if (item.id === id) {
          const hasCustom = !item.hasCustomHours;
          return {
            ...item,
            hasCustomHours: hasCustom,
            customHours: hasCustom ? [...item.customHours] : Array(10).fill(item.hoursPerYear)
          };
        }
        return item;
      });
      return { ...prev, items: updated };
    });
  };

  const updateWaterItemCustomHourCell = (id: string, yearIdx: number, val: any) => {
    setWaterConfig(prev => {
      const updated = prev.items.map(item => {
        if (item.id === id) {
          const hours = [...item.customHours];
          hours[yearIdx] = Math.max(0, Number(val) || 0);
          return { ...item, customHours: hours };
        }
        return item;
      });
      return { ...prev, items: updated };
    });
  };

  const updateWaterGlobalPrice = (val: any) => {
    const priceVal = Math.max(0, Number(val) || 0);
    setWaterConfig(prev => ({
      ...prev,
      globalPrice: priceVal,
      customPrices: prev.hasCustomPrices ? prev.customPrices : Array(10).fill(priceVal)
    }));
  };

  const toggleWaterCustomPrices = () => {
    setWaterConfig(prev => {
      const hasCustom = !prev.hasCustomPrices;
      return {
        ...prev,
        hasCustomPrices: hasCustom,
        customPrices: hasCustom ? [...prev.customPrices] : Array(10).fill(prev.globalPrice)
      };
    });
  };

  const updateWaterCustomPriceCell = (yearIdx: number, val: any) => {
    const priceVal = Math.max(0, Number(val) || 0);
    setWaterConfig(prev => {
      const prices = [...prev.customPrices];
      prices[yearIdx] = priceVal;
      return { ...prev, customPrices: prices };
    });
  };

  const updateAccessoryField = (id: string, field: keyof AccessoryItem, value: any) => {
    setAccessoryConfig(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const applyDiamondCalculation = () => {
    const errors: {vs?: string, cfu?: string, hj?: string, ja?: string, n?: string} = {};
    if (Number(dmVs) < 0) errors.vs = "Vitesse invalide";
    if (Number(dmCfu) < 0) errors.cfu = "F.U invalide";
    if (Number(dmHj) < 0) errors.hj = "Heures invalides";
    if (Number(dmJa) < 0) errors.ja = "Jours invalides";
    if (Number(dmN) < 0) errors.n = "Nombre invalide";

    if (Object.keys(errors).length > 0) {
      setDiamondErrors(errors);
      return;
    }

    const vs = Number(dmVs) || 0;
    const cfu = Number(dmCfu) || 0;
    const hj = Number(dmHj) || 0;
    const ja = Number(dmJa) || 0;
    const n = Number(dmN) || 0;
    const qty = vs * cfu * hj * ja * n;
    setDmQty(qty.toString());
    setIsDiamondModalOpen(false);
    setDiamondErrors({});
  };

  const addDiamondAccessory = () => {
    const errors: {vs?: string, cfu?: string, hj?: string, ja?: string, n?: string} = {};
    if (Number(dmVs) < 0) errors.vs = "Vitesse invalide";
    if (Number(dmCfu) < 0) errors.cfu = "F.U invalide";
    if (Number(dmHj) < 0) errors.hj = "Heures invalides";
    if (Number(dmJa) < 0) errors.ja = "Jours invalides";
    if (Number(dmN) < 0) errors.n = "Nombre invalide";

    if (Object.keys(errors).length > 0) {
      setDiamondErrors(errors);
      return;
    }

    if (!dmDesignation || !dmQty || !dmUnitPrice) return;
    const vs = Number(dmVs) || 0;
    const cfu = Number(dmCfu) || 0;
    const hj = Number(dmHj) || 0;
    const ja = Number(dmJa) || 0;
    const n = Number(dmN) || 0;

    const newItem: AccessoryItem = {
      id: Math.random().toString(36).substring(2, 11),
      designation: dmDesignation,
      qtyPerYear: Number(dmQty),
      unitPrice: Number(dmUnitPrice),
      unit: 'm',
      allocation: dmAlloc,
      calculationMode: Number(dmVs) > 0 ? 'calculated' : 'direct',
      vs, cfu, hoursPerDay: hj, daysPerYear: ja, machineCount: n
    };

    setAccessoryConfig({
      ...accessoryConfig,
      items: [...accessoryConfig.items, newItem]
    });
    
    // Reset form after adding
    setDmQty('0');
    setDmUnitPrice('0');
    setDmDesignation('Fil diamanté');
    setDmAlloc('Common');
    setDiamondErrors({});
    showToast("Consommable diamanté ajouté");
  };

  const chartData = useMemo(() => calculatedYears.map(y => ({
    name: `An ${y.year}`,
    "Chiffre d'affaires": y.caGlobal,
    "Frais de Personnel": y.fraisPersonnel,
    "Matières et Fournitures": y.matieresFournitures,
    "Services": y.services,
    "Amortissements": y.dotationsAmortissements,
    "Résultat Net": y.resultatNet,
    "Cash-Flow (FNT)": y.fnt,
    "Charges Totales": y.caGlobal - y.resultatNet,
    "Prix Revient Granite": y.prixRevientGranite,
    "Prix Revient Tuf": y.prixRevientTuf
  })), [calculatedYears]);

  const costStructureData = useMemo(() => {
    return [
      { name: 'Matières', value: totalRow.matieresFournitures, color: '#3b82f6' },
      { name: 'Services', value: totalRow.services, color: '#ef4444' },
      { name: 'Personnel', value: totalRow.fraisPersonnel, color: '#10b981' },
      { name: 'Amortissements', value: totalRow.dotationsAmortissements, color: '#f59e0b' },
      { name: 'Impôts & Divers', value: totalRow.impotsTaxes + totalRow.fraisFinanciers + totalRow.ibm, color: '#6366f1' },
    ];
  }, [totalRow]);

  const handleExportExcel = () => {
    // BOM for French Excel consistency (UTF-8 with BOM)
    const BOM = "\uFEFF";
    const DELIMITER = ";";
    
    const headers = [
      "CATEGORIE",
      ...calculatedYears.map(y => `Annee ${y.year}`),
      "TOTAL GLOBAL"
    ];

    const formatExcel = (v: any) => {
      if (v === undefined || v === null || v === "") return "0,00";
      
      // Convert to number if it matches a numeric format (removing space thousands separator if any)
      const num = typeof v === 'number' ? v : parseFloat(String(v).replace(/\s/g, '').replace(',', '.'));
      
      if (!isNaN(num)) {
        // Adopt exactly two decimal places with comma decimal separator
        return num.toFixed(2).replace(".", ",");
      }
      return String(v);
    };

    const rows = [
      ["EXTRACTION GRANITE (m³)", ...calculatedYears.map(y => y.extractionGranite), totalRow.extractionGranite],
      ["POIDS EXTRAIT GRANITE (T)", ...calculatedYears.map(y => (y.extractionGranite || 0) * densityGranite), (totalRow.extractionGranite || 0) * densityGranite],
      ["EXTRACTION TUF (T)", ...calculatedYears.map(y => y.extractionTuf), totalRow.extractionTuf],
      ["VOLUME EXTRAIT TUF (m³)", ...calculatedYears.map(y => densityTuf > 0 ? (y.extractionTuf || 0) / densityTuf : 0), densityTuf > 0 ? (totalRow.extractionTuf || 0) / densityTuf : 0],
      ["CHIFFRE D'AFFAIRES GRANITE (DA)", ...calculatedYears.map(y => y.caGranite), totalRow.caGranite],
      ["CHIFFRE D'AFFAIRES TUF (DA)", ...calculatedYears.map(y => y.caTuf), totalRow.caTuf],
      ["CHIFFRE D'AFFAIRES GLOBAL (DA)", ...calculatedYears.map(y => y.caGlobal), totalRow.caGlobal],
      ["Matieres & Fournitures Consommables (DA)", ...calculatedYears.map(y => y.matieresFournitures), totalRow.matieresFournitures],
      ["Services (DA)", ...calculatedYears.map(y => y.services), totalRow.services],
      ["Sous-Total 01 (Consommations) (DA)", ...calculatedYears.map(y => y.subtotal1), totalRow.subtotal1],
      ["VALEUR AJOUTEE (DA)", ...calculatedYears.map(y => y.valeurAjoutee), totalRow.valeurAjoutee],
      ["Charges de Personnel (DA)", ...calculatedYears.map(y => y.fraisPersonnel), totalRow.fraisPersonnel],
      ["Impots, Taxes & Versements Assimiles (DA)", ...calculatedYears.map(y => y.impotsTaxes), totalRow.impotsTaxes],
      ["Charges Financieres (DA)", ...calculatedYears.map(y => y.fraisFinanciers), totalRow.fraisFinanciers],
      ["Dotations aux Amortissements (DA)", ...calculatedYears.map(y => y.dotationsAmortissements), totalRow.dotationsAmortissements],
      ["Sous-Total 02 (Charges d'Exploitation) (DA)", ...calculatedYears.map(y => y.subtotal2), totalRow.subtotal2],
      ["RESULTAT D'EXPLOITATION (DA)", ...calculatedYears.map(y => y.resultatExploitation), totalRow.resultatExploitation],
      ["Impots sur les Benefices (IBM) (DA)", ...calculatedYears.map(y => y.ibm), totalRow.ibm],
      ["RESULTAT NET DE L'EXERCICE (DA)", ...calculatedYears.map(y => y.resultatNet), totalRow.resultatNet],
      ["CAPACITE D'AUTOFINANCEMENT (FNT) (DA)", ...calculatedYears.map(y => y.fnt), totalRow.fnt],
      ["PRIX DE REVIENT GRANITE (DA/m³)", ...calculatedYears.map(y => y.prixRevientGranite), totalRow.prixRevientGranite],
      ["PRIX DE REVIENT TUF (DA/T)", ...calculatedYears.map(y => y.prixRevientTuf), totalRow.prixRevientTuf],
    ];

    // Adding sep=; line tells Excel which character is the separator
    const csvContent = BOM + [
      "sep=" + DELIMITER,
      headers.join(DELIMITER),
      ...rows.map(row => row.map(formatExcel).join(DELIMITER))
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Export_TCR_Projet_Tebessa_${new Date().getFullYear()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportWord = async () => {
    const sections: any[] = [];
    
    // Header for all reports
    const createHeader = (title: string, subtitle: string) => [
      new Paragraph({
        text: title,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      }),
      new Paragraph({
        children: [
          new TextRun({ text: subtitle, bold: true, color: "666666" })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    ];

    const formatCurrencyDoc = (n: number) => (n / 1000).toLocaleString('fr-DZ', { maximumFractionDigits: 2, minimumFractionDigits: 0 }) + " kDA";
    const formatValueDoc = (n: number) => (n / 1000).toLocaleString('fr-DZ', { maximumFractionDigits: 2, minimumFractionDigits: 0 });

    if (activeTab === 'invest') {
      sections.push(...createHeader("RAPPORT DES INVESTISSEMENTS & AMORTISSEMENTS", "Analyse détaillée du parc matériel et des dotations sur 10 ans"));
      
      sections.push(new Paragraph({ text: "1. Méthodologie de Calcul", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }));
      sections.push(new Paragraph({
        text: "La méthode d'amortissement utilisée est l'amortissement linéaire. Le coût d'acquisition de chaque équipement est réparti sur sa durée de vie utile (en années). La dotation annuelle est calculée par la formule : Dotation = Valeur d'origine / Durée. Les équipements avec une durée de 0 sont considérés comme des charges non amortissables ou totalement amorties en année 1.",
        spacing: { after: 200 }
      }));

      sections.push(new Paragraph({ text: "2. Tableau Récapitulatif des Équipements", heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 200 } }));
      const summaryHeaders = [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Désignation", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Prix Unitaire (kDA)", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Durée (Ans)", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Amort. Annuel (kDA)", bold: true })] })] }),
      ];
      const summaryRowsItems = [new TableRow({ children: summaryHeaders })];
      equipments.forEach(eq => {
        summaryRowsItems.push(new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ text: eq.designation ?? "" })] }),
          new TableCell({ children: [new Paragraph({ text: formatCurrencyDoc(eq.price ?? 0) })] }),
          new TableCell({ children: [new Paragraph({ text: (eq.duration ?? 0).toString() })] }),
          new TableCell({ children: [new Paragraph({ text: formatCurrencyDoc((eq.duration ?? 0) > 0 ? (eq.price ?? 0) / eq.duration : 0) })] }),
        ] }));
      });
      sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: summaryRowsItems }));

      sections.push(new Paragraph({ text: "3. Tableau Détaillé des Amortissements sur 10 Ans", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }));
      
      const headers = [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Désignation des équipements", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Durée", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Amort./An (kDA)", bold: true })] })] }),
        ...Array.from({length: 10}).map((_, i) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${i+1}Année`, bold: true })] })] }))
      ];

      const rows = [new TableRow({ children: headers })];
      const totals = Array(10).fill(0);
      let totalAnnualAmort = 0;

      equipments.forEach(eq => {
        const annualAmort = eq.duration > 0 ? eq.price / eq.duration : 0;
        totalAnnualAmort += annualAmort;
        const yearCells = Array.from({length: 10}).map((_, i) => {
          const val = (i < eq.duration) ? annualAmort : 0;
          totals[i] += val;
          return new TableCell({ children: [new Paragraph({ text: val > 0 ? formatValueDoc(val) : "-" })] });
        });

        rows.push(new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ text: eq.designation ?? "" })] }),
          new TableCell({ children: [new Paragraph({ text: (eq.duration ?? 0).toString() })] }),
          new TableCell({ children: [new Paragraph({ text: formatValueDoc(annualAmort) })] }),
          ...yearCells
        ] }));
      });

      // Total Row
      rows.push(new TableRow({ children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "TOTAL (kDA)", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ text: "" })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatValueDoc(totalAnnualAmort), bold: true })] })] }),
        ...totals.map(t => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatValueDoc(t), bold: true })] })] }))
      ] }));

      sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
      sections.push(new Paragraph({ 
        children: [new TextRun({ text: "* Toutes les valeurs financières sont exprimées en kDA.", italics: true })],
        spacing: { before: 200 } 
      }));
    } 
    else if (activeTab === 'hr') {
      sections.push(...createHeader("RAPPORT DES RESSOURCES HUMAINES", "Projection de la masse salariale et charges sociales sur 10 ans"));
      
      sections.push(new Paragraph({ text: "1. Méthodologie", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }));
      sections.push(new Paragraph({
        text: `Le calcul repose sur les salaires mensuels réajustés selon l'expérience (avec un taux de prime d'expérience de ${(hrConfig.experienceRate ?? 0.06) * 100}% appliqué aux profils expérimentés), multipliés par ${hrConfig.paidMonths} mois. Un taux de charges patronales de ${hrConfig.socialChargesRate * 100}% est appliqué au salaire brut. Une inflation annuelle de ${hrConfig.annualIncreaseRate * 100}% est appliquée cumulativement sur 10 ans pour projeter l'évolution des coûts.`,
        spacing: { after: 200 }
      }));

      sections.push(new Paragraph({ text: "2. Tableau Récapitulatif des Ressources Humaines", heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 200 } }));
      const summaryHeaders = [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Poste", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Effectif", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Expérience", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Salaire Ajusté (DA)", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Coût Annuel Brut (DA)", bold: true })] })] }),
      ];
      const summaryRowsItems = [new TableRow({ children: summaryHeaders })];
      roles.forEach(r => {
        const expRate = hrConfig.experienceRate ?? 0.06;
        const hasExp = r.hasExperience ?? false;
        const monthlyWithExp = hasExp ? (r.monthlySalary ?? 0) * (1 + expRate) : (r.monthlySalary ?? 0);
        const annualBrut = monthlyWithExp * (hrConfig.paidMonths ?? 12) * (r.count ?? 0) * (1 + (hrConfig.socialChargesRate ?? 0));
        summaryRowsItems.push(new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ text: r.designation ?? "" })] }),
          new TableCell({ children: [new Paragraph({ text: (r.count ?? 0).toString() })] }),
          new TableCell({ children: [new Paragraph({ text: hasExp ? "Oui" : "Non" })] }),
          new TableCell({ children: [new Paragraph({ text: formatCurrencyDoc(monthlyWithExp) })] }),
          new TableCell({ children: [new Paragraph({ text: formatCurrencyDoc(annualBrut) })] }),
        ] }));
      });
      sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: summaryRowsItems }));

      sections.push(new Paragraph({ text: "3. Tableau de Projection Salariale sur 10 Ans", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }));
      
      const headers = [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Poste de travail", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Eff.", bold: true })] })] }),
        ...Array.from({length: 10}).map((_, i) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${i+1}Année`, bold: true })] })] }))
      ];

      const rows = [new TableRow({ children: headers })];
      const columnTotals = Array(10).fill(0);

      roles.forEach(r => {
        const expRate = hrConfig.experienceRate ?? 0.06;
        const hasExp = r.hasExperience ?? false;
        const monthlyWithExp = hasExp ? (r.monthlySalary ?? 0) * (1 + expRate) : (r.monthlySalary ?? 0);
        const baseAnnual = monthlyWithExp * (hrConfig.paidMonths ?? 12) * (r.count ?? 0) * (1 + (hrConfig.socialChargesRate ?? 0));
        const yearCells = Array.from({length: 10}).map((_, i) => {
          const val = baseAnnual * Math.pow(1 + (hrConfig.annualIncreaseRate ?? 0), i);
          columnTotals[i] += val;
          return new TableCell({ children: [new Paragraph({ text: formatValueDoc(val) })] });
        });

        rows.push(new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ text: r.designation ?? "" })] }),
          new TableCell({ children: [new Paragraph({ text: (r.count ?? 0).toString() })] }),
          ...yearCells
        ] }));
      });

      // Total Row
      rows.push(new TableRow({ children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "TOTAL MASSE SALARIALE (kDA)", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ text: "" })] }),
        ...columnTotals.map(t => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatValueDoc(t), bold: true })] })] }))
      ] }));

      sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
    }
    else if (activeTab === 'prod') {
      sections.push(...createHeader("RAPPORT DE DIMENSIONNEMENT PRODUCTION", "Calcul des capacités et flux d'extraction"));
      
      sections.push(new Paragraph({ text: "1. Méthodologie de Dimensionnement", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }));
      sections.push(new Paragraph({
        text: "Le dimensionnement est calculé de manière ascendante (bottom-up). À partir du volume cible de produits finis (blocs marchands), nous appliquons les rendements de retaille (eta2) et d'extraction (eta1) pour déterminer le flux de matière brute nécessaire en amont. Le nombre de machines est ensuite déduit de la capacité nominale annuelle de chaque type d'engin.",
        spacing: { after: 200 }
      }));

      const vTarget = productionConfig.targetMode === 'constant' ? (productionConfig.vTargetConstant ?? 10000) : (productionConfig.vTargetVariable ?? [])[0] ?? 10000;
      const eta1Val = productionConfig.horizon === '1y' ? (productionConfig.yieldsConstant?.eta1 ?? 0.5) : (productionConfig.yieldsVariable?.eta1 ?? [])[0] ?? 0.5;
      const eta2Val = productionConfig.horizon === '1y' ? (productionConfig.yieldsConstant?.eta2 ?? 0.8) : (productionConfig.yieldsVariable?.eta2 ?? [])[0] ?? 0.8;

      sections.push(new Paragraph({ text: "2. Tableau Récapitulatif des Paramètres", heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 200 } }));
      const summaryHeaders = [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Paramètre", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Valeur", bold: true })] })] }),
      ];
      const summaryRowsItems = [
        new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ text: "Volume Cible Annuel" })] }),
          new TableCell({ children: [new Paragraph({ text: `${vTarget} m³/an` })] }),
        ] }),
        new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ text: "Rendement de Banc (Eta1)" })] }),
          new TableCell({ children: [new Paragraph({ text: (eta1Val * 100).toFixed(0) + " %" })] }),
        ] }),
        new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ text: "Rendement de Retaille (Eta2)" })] }),
          new TableCell({ children: [new Paragraph({ text: (eta2Val * 100).toFixed(0) + " %" })] }),
        ] }),
      ];
      sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [new TableRow({ children: summaryHeaders }), ...summaryRowsItems] }));

      sections.push(new Paragraph({ text: "3. Détails des Capacités de Production", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }));
      sections.push(new Paragraph({ text: `Processus d'Extraction (Étape A) : Vitesse brute ${productionConfig.steps.extraction.productivity.vs} m²/h, H_eq ${productionConfig.steps.extraction.productivity.hEq} m.` }));
      const capacityA = productionConfig.steps.extraction.productivity.vs * productionConfig.steps.extraction.productivity.hEq * productionConfig.steps.extraction.productivity.hoursPerDay * productionConfig.steps.extraction.productivity.daysPerYear * productionConfig.steps.extraction.productivity.utilizationRate;
      sections.push(new Paragraph({ text: `Rendement unitaire (N_A) : ${capacityA.toLocaleString()} m³/an par machine.` }));

      sections.push(new Paragraph({ text: `Processus de Retaille (Étape B) : Vitesse brute ${productionConfig.steps.retaille.productivity.vs} m²/h, H_eq ${productionConfig.steps.retaille.productivity.hEq} m.` }));
      const capacityB = productionConfig.steps.retaille.productivity.vs * productionConfig.steps.retaille.productivity.hEq * productionConfig.steps.retaille.productivity.hoursPerDay * productionConfig.steps.retaille.productivity.daysPerYear * productionConfig.steps.retaille.productivity.utilizationRate;
      sections.push(new Paragraph({ text: `Rendement unitaire (N_B) : ${capacityB.toLocaleString()} m³/an par machine.` }));
    }
    else if (activeTab === 'ops') {
      sections.push(...createHeader("RAPPORT FUEL & MAINTENANCE", "Calcul des consommations de carburant et entretien engins sur 10 ans"));
      
      sections.push(new Paragraph({ text: "1. Méthodologie de Calcul", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }));
      sections.push(new Paragraph({ text: "Le calcul de la consommation est basé sur la puissance nominale des moteurs (kW), le ratio de consommation spécifique (L/kWh) et le coefficient d'utilisation effective de l'engin. Les coûts de carburant sont projetés sur 10 ans avec un taux d'inflation annuel.", spacing: { after: 200 } }));
      sections.push(new Paragraph({ text: `Formule : Conso (L/h) = Puissance (kW) × Ratio (L/kWh) × Coef. Utilisation`, spacing: { before: 100 } }));
      sections.push(new Paragraph({ text: `Volume Annuel = Conso (L/h) × Heures/Jour × Jours/An × Nombre d'unités`, spacing: { after: 200 } }));

      sections.push(new Paragraph({ text: "2. Tableau Récapitulatif de Consommation", heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 200 } }));
      const summaryHeaders = [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Machine", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Puiss. (kW)", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "L/h (Unit)", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Unités", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Coût Annuel (kDA)", bold: true })] })] }),
      ];
      const summaryRowsItems = [new TableRow({ children: summaryHeaders })];
      machines.forEach(m => {
        const consoUnitLh = (m.powerKw ?? 0) * (m.consumptionRate ?? 0.2) * (m.utilizationCoef ?? 0.7);
        const annualFuel = consoUnitLh * (m.count ?? 1) * (m.hoursPerDay ?? 8) * (m.workDaysPerYear ?? 250) * (opConfig.fuelPrice ?? 29);
        summaryRowsItems.push(new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ text: m.designation ?? "" })] }),
          new TableCell({ children: [new Paragraph({ text: (m.powerKw ?? 0).toString() })] }),
          new TableCell({ children: [new Paragraph({ text: consoUnitLh.toFixed(2) })] }),
          new TableCell({ children: [new Paragraph({ text: (m.count ?? 1).toString() })] }),
          new TableCell({ children: [new Paragraph({ text: formatCurrencyDoc(annualFuel) })] }),
        ] }));
      });
      sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: summaryRowsItems }));

      sections.push(new Paragraph({ text: "3. Tableau de Consommation Fuel sur 10 Ans", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }));

      const headers = [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Machine", bold: true })] })] }),
        ...Array.from({length: 10}).map((_, i) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${i+1}Année`, bold: true })] })] }))
      ];

      const rows = [new TableRow({ children: headers })];
      const columnTotals = Array(10).fill(0);

      machines.forEach(m => {
        const consoUnitLh = (m.powerKw ?? 0) * (m.consumptionRate ?? 0.2) * (m.utilizationCoef ?? 0.7);
        const annualFuelBase = consoUnitLh * (m.count ?? 1) * (m.hoursPerDay ?? 8) * (m.workDaysPerYear ?? 250) * (opConfig.fuelPrice ?? 29);
        const yearCells = Array.from({length: 10}).map((_, i) => {
          const val = annualFuelBase * Math.pow(1 + (opConfig.annualInflationRate ?? 0)/100, i);
          columnTotals[i] += val;
          return new TableCell({ children: [new Paragraph({ text: formatValueDoc(val) })] });
        });

        rows.push(new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ text: m.designation ?? "" })] }),
          ...yearCells
        ] }));
      });

      // Total Row
      rows.push(new TableRow({ children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "TOTAL FUEL (kDA)", bold: true })] })] }),
        ...columnTotals.map(t => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatValueDoc(t), bold: true })] })] }))
      ] }));

      sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
    }
    else if (activeTab === 'elec') {
      sections.push(...createHeader("RAPPORT ÉLECTRICITÉ (GE)", "Analyse de la production électrique autonome sur 10 ans"));
      
      sections.push(new Paragraph({ text: "1. Méthodologie de Calcul", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }));
      sections.push(new Paragraph({ text: `Les coûts énergétiques sont basés sur la puissance totale installée en marche simultanée. La consommation est dérivée de la puissance active (kW) multipliée par le ratio de consommation spécifique du Groupe Électrogène (${electricityConfig.specificConsumption} L/kWh) et le prix du diesel.` }));

      sections.push(new Paragraph({ text: "2. Tableau Récapitulatif des Lignes Électriques", heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 200 } }));
      const summaryHeaders = [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Ligne / Équipement", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Puissance (kW)", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Coût Annuel Estimé (kDA)", bold: true })] })] }),
      ];
      const summaryRowsItems = [new TableRow({ children: summaryHeaders })];
      electricityLines.forEach(l => {
        const annualEnergy = (l.powerKw ?? 0) * (l.count ?? 1) * (l.utilizationCoef ?? 0.7) * (l.hoursPerDay ?? 8) * (l.workDaysPerYear ?? 250);
        const annualCost = annualEnergy * (electricityConfig.specificConsumption ?? 0.3) * (opConfig.fuelPrice ?? 29);
        summaryRowsItems.push(new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ text: l.designation ?? "" })] }),
          new TableCell({ children: [new Paragraph({ text: (l.powerKw ?? 0).toString() })] }),
          new TableCell({ children: [new Paragraph({ text: formatCurrencyDoc(annualCost) })] }),
        ] }));
      });
      sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: summaryRowsItems }));

      sections.push(new Paragraph({ text: "3. Tableau de Coûts Énergétiques sur 10 Ans", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }));

      const headers = [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Poste", bold: true })] })] }),
        ...Array.from({length: 10}).map((_, i) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${i+1}Année`, bold: true })] })] }))
      ];

      const rows = [new TableRow({ children: headers })];
      const columnTotals = Array(10).fill(0);

      electricityLines.forEach(l => {
        const annualEnergy = (l.powerKw ?? 0) * (l.count ?? 1) * (l.utilizationCoef ?? 0.7) * (l.hoursPerDay ?? 8) * (l.workDaysPerYear ?? 250);
        const annualCostBase = annualEnergy * (electricityConfig.specificConsumption ?? 0.3) * (opConfig.fuelPrice ?? 29);
        
        const yearCells = Array.from({length: 10}).map((_, i) => {
          const val = annualCostBase * Math.pow(1 + (opConfig.annualInflationRate ?? 0)/100, i);
          columnTotals[i] += val;
          return new TableCell({ children: [new Paragraph({ text: formatValueDoc(val) })] });
        });

        rows.push(new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ text: l.designation })] }),
          ...yearCells
        ] }));
      });

      // Total Row
      rows.push(new TableRow({ children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "TOTAL ELEC (kDA)", bold: true })] })] }),
        ...columnTotals.map(t => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatValueDoc(t), bold: true })] })] }))
      ] }));

      sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
    }
    else if (activeTab === 'acc') {
      sections.push(...createHeader("RAPPORT DES CONSOMMABLES & ACCESSOIRES", "Détail des intrants et outils d'extraction sur 10 ans"));
      
      sections.push(new Paragraph({ text: "1. Méthodologie", heading: HeadingLevel.HEADING_2 }));
      sections.push(new Paragraph({ text: `Les accessoires sont calculés on une base annuelle. Une inflation de ${opConfig.annualInflationRate}% est appliquée chaque année.`, spacing: { after: 200 } }));

      sections.push(new Paragraph({ text: "2. Tableau Récapitulatif des Consommables", heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 200 } }));
      const summaryHeaders = [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Désignation", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Unité", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Prix Unit. (kDA)", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Qté / An", bold: true })] })] }),
      ];
      const summaryRowsItems = [new TableRow({ children: summaryHeaders })];
      accessoryConfig.items.forEach(item => {
        summaryRowsItems.push(new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ text: item.designation ?? "" })] }),
          new TableCell({ children: [new Paragraph({ text: item.unit ?? "" })] }),
          new TableCell({ children: [new Paragraph({ text: formatCurrencyDoc(item.unitPrice ?? 0) })] }),
          new TableCell({ children: [new Paragraph({ text: (item.qtyPerYear ?? 0).toString() })] }),
        ] }));
      });
      sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: summaryRowsItems }));

      sections.push(new Paragraph({ text: "3. Tableau des Coûts Accessoires sur 10 Ans", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }));

      const headers = [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Designation", bold: true })] })] }),
        ...Array.from({length: 10}).map((_, i) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${i+1}Année`, bold: true })] })] }))
      ];

      const rows = [new TableRow({ children: headers })];
      const columnTotals = Array(10).fill(0);

      accessoryConfig.items.forEach(item => {
        const annualBase = item.qtyPerYear * item.unitPrice;
        const yearCells = Array.from({length: 10}).map((_, i) => {
          const val = annualBase * Math.pow(1 + opConfig.annualInflationRate/100, i);
          columnTotals[i] += val;
          return new TableCell({ children: [new Paragraph({ text: formatValueDoc(val) })] });
        });

        rows.push(new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ text: item.designation })] }),
          ...yearCells
        ] }));
      });

      // Total Row
      rows.push(new TableRow({ children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "TOTAL ACC. (kDA)", bold: true })] })] }),
        ...columnTotals.map(t => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatValueDoc(t), bold: true })] })] }))
      ] }));

      sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
    }
    else if (activeTab === 'water') {
      sections.push(...createHeader("RAPPORT DE CONSOMMATION D'EAU", "Détail de la consommation d'eau et de la tarification sur 10 ans"));
      
      sections.push(new Paragraph({ text: "1. Méthodologie", heading: HeadingLevel.HEADING_2 }));
      sections.push(new Paragraph({ 
        text: `La consommation d'eau est estimée selon le débit requis (L/h) pour chaque poste d'utilisation, multiplié par ses heures de fonctionnement annuelles. Le coût est calculé en appliquant le prix unitaire de l'eau (DA/m³). Le prix global de l'eau configuré est de ${waterConfig.globalPrice || 40.95} DA/m³.`, 
        spacing: { after: 200 } 
      }));

      sections.push(new Paragraph({ text: "2. Tableau Récapitulatif des Postes de Consommation", heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 200 } }));
      const summaryHeaders = [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Désignation", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Débit (L/h)", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Vol. Unitaire (m³/h)", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Dimensionnement (h/poste × postes/j × j/an)", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Heures / An", bold: true })] })] }),
      ];
      const summaryRowsItems = [new TableRow({ children: summaryHeaders })];
      (waterConfig.items || []).forEach(item => {
        summaryRowsItems.push(new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ text: item.designation ?? "" })] }),
          new TableCell({ children: [new Paragraph({ text: (item.flowRate ?? 0).toString() })] }),
          new TableCell({ children: [new Paragraph({ text: ((item.flowRate ?? 0) / 1000).toLocaleString('fr-DZ', { maximumFractionDigits: 2 }) })] }),
          new TableCell({ children: [new Paragraph({ text: `${item.hoursPerShift ?? 8}h × ${item.shiftsPerDay ?? 1}p × ${item.daysPerYear ?? 250}j` })] }),
          new TableCell({ children: [new Paragraph({ text: (item.hoursPerYear ?? 2000).toString() })] }),
        ] }));
      });
      sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: summaryRowsItems }));

      sections.push(new Paragraph({ text: "3. Tableau de Projection des Consommations sur 10 Ans", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }));

      const headers = [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Indicateur", bold: true })] })] }),
        ...Array.from({length: 10}).map((_, i) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${i+1}e Année`, bold: true })] })] }))
      ];

      const rows = [new TableRow({ children: headers })];

      // Row for Volume Total (m³/an)
      rows.push(new TableRow({ children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Volume d'eau total (m³/an)", bold: true })] })] }),
        ...waterResults.annualVolumes.map(vol => new TableCell({ children: [new Paragraph({ text: vol.toLocaleString('fr-DZ', { maximumFractionDigits: 2 }) })] }))
      ] }));

      // Row for Coût de l'eau (m DA/an)
      rows.push(new TableRow({ children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Coût de l'eau (kDA)", bold: true })] })] }),
        ...waterResults.annualCosts.common.map(cost => new TableCell({ children: [new Paragraph({ text: formatValueDoc(cost) })] }))
      ] }));

      sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
    }
    else if (activeTab === 'table' || activeTab === 'edit') {
      sections.push(...createHeader("RAPPORT DU TABLEAU DE COMPTE DES RÉSULTATS (TCR)", "Synthèse financière et rentabilité prévisionnelle sur 10 ans"));
      
      sections.push(new Paragraph({ text: "1. Méthodologie de Calcul", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }));
      sections.push(new Paragraph({
        text: "Le TCR est établi sur un horizon de 10 ans. Le Chiffre d'Affaires est projeté selon le volume de production. Les charges d'exploitation incluent la masse salariale, le carburant, l'électricité et les accessoires, tous soumis à l'inflation. Le Résultat Net est calculé après déduction des dotations aux amortissements. Les flux nets de trésorerie (FNT) servent de base au calcul de la rentabilité (VAN, TRI, Payback).",
        spacing: { after: 200 }
      }));

      sections.push(new Paragraph({ text: "2. Tableau Récapitulatif des Indicateurs", heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 200 } }));
      const summaryRowsItems = [
        new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Indicateur", bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Valeur", bold: true })] })] }),
        ] }),
        new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ text: "Investissement Initial" })] }),
          new TableCell({ children: [new Paragraph({ text: formatCurrencyDoc(totalInvestment) })] }),
        ] }),
        new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ text: "Délai de Récupération (Payback)" })] }),
          new TableCell({ children: [new Paragraph({ text: paybackYear === 'N/A' ? 'Non atteint' : paybackYear + ' Ans' })] }),
        ] }),
      ];
      sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: summaryRowsItems }));

      sections.push(new Paragraph({ text: "3. Tableau Détaillé du TCR sur 10 Ans (kDA)", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }));
      
      const headersArr = [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Compte", bold: true })] })] }),
        ...Array.from({length: 10}).map((_, i) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${i+1}Année`, bold: true })] })] })),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Total", bold: true })] })] }),
      ];

      const tcrRows = [new TableRow({ children: headersArr })];

      const addTcrRow = (label: string, data: number[], total: number) => {
        tcrRows.push(new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ text: label })] }),
          ...data.map(v => new TableCell({ children: [new Paragraph({ text: formatValueDoc(v) })] })),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatValueDoc(total), bold: true })] })] }),
        ] }));
      };

      addTcrRow("Chiffre d'Affaires Global", calculatedYears.map(y => y.caGlobal), totalRow.caGlobal);
      addTcrRow("Masse Salariale", calculatedYears.map(y => y.fraisPersonnel), totalRow.fraisPersonnel);
      addTcrRow("Consommations (Fuel/Elec/Acc)", calculatedYears.map(y => y.matieresFournitures), totalRow.matieresFournitures);
      addTcrRow("Dotations Amortissements", calculatedYears.map(y => y.dotationsAmortissements), totalRow.dotationsAmortissements);
      addTcrRow("Résultat Net", calculatedYears.map(y => y.resultatNet), totalRow.resultatNet);
      addTcrRow("FNT (Cash-Flow)", calculatedYears.map(y => y.fnt), totalRow.fnt);

      sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: tcrRows }));
      
      sections.push(new Paragraph({ text: "2. Indicateurs de Rentabilité", heading: HeadingLevel.HEADING_2, spacing: { before: 400 } }));
      sections.push(new Paragraph({ text: `Investissement Initial : ${formatCurrencyDoc(totalInvestment)}` }));
      sections.push(new Paragraph({ text: `Délai de Récupération (Payback) : ${paybackYear === 'N/A' ? 'Non atteint' : paybackYear + ' Ans'}` }));
    }
    else {
      // General Fallback Report (TCR Summary)
      sections.push(...createHeader("RAPPORT ANALYTIQUE GÉNÉRAL", "Résumé des indicateurs clés et performance globale"));
      sections.push(new Paragraph({ text: "Ce rapport contient les indicateurs consolidés du projet sur 10 ans.", spacing: { after: 200 } }));

      const summaryRows = [
        new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Indicateur", bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Valeur Cumulée (10 Ans) (kDA)", bold: true })] })] }),
        ] }),
        new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ text: "Chiffre d'Affaires Global" })] }),
          new TableCell({ children: [new Paragraph({ text: formatCurrencyDoc(totalRow.caGlobal) })] }),
        ] }),
        new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ text: "Résultat Net Total" })] }),
          new TableCell({ children: [new Paragraph({ text: formatCurrencyDoc(totalRow.resultatNet) })] }),
        ] }),
        new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ text: "Capacité d'Autofinancement (FNT)" })] }),
          new TableCell({ children: [new Paragraph({ text: formatCurrencyDoc(totalRow.fnt) })] }),
        ] }),
      ];
      sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: summaryRows }));
    }

    const doc = new Document({
      sections: [{
        children: sections
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Rapport_Projet_${activeTab.toUpperCase()}_Tebessa.docx`);
  };

  const paybackYear = useMemo(() => {
    let cumulative = -totalInvestment;
    for (const y of calculatedYears) {
      cumulative += y.fnt;
      if (cumulative >= 0) return y.year;
    }
    return 'N/A';
  }, [calculatedYears, totalInvestment]);

  return (
    <div className="flex h-screen bg-sleek-bg overflow-hidden font-sans antialiased text-sleek-text-main">
      {/* Sidebar - Sleek Theme */}
      <aside className="w-72 bg-sleek-sidebar text-white flex flex-col shrink-0 overflow-y-auto custom-scrollbar shadow-modern-xl z-50">
        <div className="p-8 pb-6 flex items-center gap-3">
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="w-12 h-12 bg-sleek-primary rounded-2xl flex items-center justify-center shadow-lg shadow-sleek-primary/30 border border-white/10"
          >
            <Calculator size={24} className="text-white" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-[0.1em] leading-none text-white">TCR</span>
            <span className="text-[9px] font-bold uppercase tracking-[3px] opacity-40 leading-none mt-1">Mining Analytics</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 py-4">
            <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <div className="h-px bg-white/5 my-4 mx-4"></div>
            <NavItem active={activeTab === 'prod'} onClick={() => setActiveTab('prod')} icon={<Mountain size={18} />} label="Production" />
            <NavItem active={activeTab === 'invest'} onClick={() => setActiveTab('invest')} icon={<HardDrive size={18} />} label="Investissements" />
            <NavItem active={activeTab === 'hr'} onClick={() => setActiveTab('hr')} icon={<Users size={18} />} label="Personnel (RH)" />
            <NavItem active={activeTab === 'ops'} onClick={() => setActiveTab('ops')} icon={<Fuel size={18} />} label="Carburant & Maint." />
            <NavItem active={activeTab === 'elec'} onClick={() => setActiveTab('elec')} icon={<Zap size={18} />} label="Électricité" />
            <NavItem active={activeTab === 'acc'} onClick={() => setActiveTab('acc')} icon={<PlusCircle size={18} />} label="Coûts Accessoires" />
            <NavItem active={activeTab === 'water'} onClick={() => setActiveTab('water')} icon={<Droplets size={18} />} label="Consommation d'eau" />
            <div className="h-px bg-white/5 my-4 mx-4"></div>
            <NavItem active={activeTab === 'edit'} onClick={() => setActiveTab('edit')} icon={<Edit3 size={18} />} label="Saisie TCR" />
            <NavItem active={activeTab === 'table'} onClick={() => setActiveTab('table')} icon={<TableIcon size={18} />} label="Rapports TCR" />
            <NavItem active={activeTab === 'charts'} onClick={() => setActiveTab('charts')} icon={<Activity size={18} />} label="Analyses & Graphes" />
            <div className="h-px bg-white/5 my-4 mx-4"></div>
            <NavItem active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<Clock size={18} />} label="Historique" />
            <NavItem active={activeTab === 'help'} onClick={() => setActiveTab('help')} icon={<BookOpen size={18} />} label="Aide & Manuel" />
            <NavItem active={activeTab === 'code'} onClick={() => setActiveTab('code')} icon={<Smartphone size={18} />} label="Export Android" />
            <NavItem active={activeTab === 'about'} onClick={() => setActiveTab('about')} icon={<Info size={18} />} label="À propos" />
            
            <div className="mt-8 px-4 space-y-3">
              <button 
                onClick={toggleTheme}
                className="w-full flex items-center justify-between gap-2 px-6 py-3.5 text-[10px] font-bold uppercase tracking-widest bg-white/5 text-white/70 hover:text-white hover:bg-white/10 rounded-2xl border border-white/5 transition-all active:scale-95 mb-2"
              >
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Zap size={16} fill="currentColor" className="text-yellow-400" /> : <Clock size={16} className="text-slate-400" />}
                  <span>{theme === 'dark' ? 'Mode Sombre' : 'Mode Clair'}</span>
                </div>
                <div className="w-10 h-5 bg-white/10 rounded-full relative">
                  <motion.div 
                    animate={{ left: theme === 'dark' ? '22px' : '2px' }}
                    className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-lg"
                  />
                </div>
              </button>

              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSave();
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 text-[10px] font-bold uppercase tracking-widest bg-sleek-primary text-white rounded-2xl shadow-lg shadow-sleek-primary/20 hover:bg-blue-600 transition-all active:scale-95 btn-modern"
              >
                <Check size={16} />
                Enregistrer État
              </button>

                <div className="px-4 py-6 mt-auto border-t border-white/5 relative z-[200]">
                  <button 
                    id="btn-reset-study"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleResetData();
                    }}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-red-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-red-600/40 hover:bg-red-700 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer relative z-[210] pointer-events-auto"
                  >
                    <Trash2 size={18} />
                    Nouvelle Étude
                  </button>
                </div>
            </div>
        </nav>

          <div className="p-8 pb-10 border-t border-white/5 bg-black/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-sleek-primary animate-pulse shadow-[0_0_8px_#3b82f6]"></div>
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-40">Dinar Algérien (DA)</span>
            </div>
            <div className="text-[10px] opacity-20 font-bold uppercase tracking-widest">Enterprise Edition v1.4</div>
          </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen relative bg-sleek-bg">
        <AnimatePresence>
          {toast && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className={cn(
                  "px-6 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-md",
                  toast.type === 'success' ? "bg-emerald-500/90 text-white border-emerald-400/30 shadow-emerald-500/20" :
                  toast.type === 'error' ? "bg-red-500/90 text-white border-red-400/30 shadow-red-500/20" :
                  "bg-sleek-card/90 text-sleek-text-main border-sleek-border shadow-black/20"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  {toast.type === 'success' ? <Check size={18} /> : toast.type === 'error' ? <X size={18} /> : <Info size={18} />}
                </div>
                <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
                <motion.div 
                  className="absolute bottom-0 left-0 h-1 bg-white/30"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 3, ease: "linear" }}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Custom Confirmation Dialog for Restart/New Study */}
        <AnimatePresence>
          {isResetConfirmOpen && (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsResetConfirmOpen(false)}
                className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
              />
              
              {/* Dialog Content */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="relative bg-sleek-card border border-sleek-border w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl z-10 flex flex-col overflow-hidden text-left"
                dir="ltr"
              >
                {/* Decorative border */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-500 via-amber-500 to-indigo-500" />
                
                <div className="flex items-center gap-4 border-b border-sleek-border/50 pb-5 mb-5 justify-between flex-row">
                  <div className="flex flex-col text-left">
                    <h3 className="text-xl font-black text-sleek-text-main flex items-center gap-2 justify-start">
                      Nouvelle Étude
                    </h3>
                    <p className="text-[10px] uppercase font-bold text-sleek-text-muted opacity-55 tracking-wider">Réinitialisation complète</p>
                  </div>
                  <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
                    <Trash2 size={24} className="animate-pulse" />
                  </div>
                </div>

                <div className="space-y-4 text-sm text-sleek-text-muted/90 flex flex-col font-medium leading-relaxed">
                  <p className="text-xs bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 rounded-2xl p-4 text-left leading-relaxed font-black">
                    Cette action réinitialisera tous les chiffres et les saisies pour démarrer une nouvelle étude.
                    <br /><br />
                    <strong className="text-indigo-300">Rassurez-vous :</strong> les données actuelles de l'application seront automatiquement et solidement sauvegardées dans votre historique avant d'être effacées de l'écran. Vous pourrez les consulter ou les restaurer à tout moment.
                  </p>
                  
                  <div className="space-y-2 mt-2 text-left">
                    <label className="text-[11px] font-black uppercase tracking-wider text-indigo-400 block mb-1">
                      Nom de la sauvegarde avant réinitialisation
                    </label>
                    <input 
                      type="text"
                      dir="ltr"
                      value={resetSaveName}
                      onChange={(e) => setResetSaveName(e.target.value)}
                      placeholder="Exemple: TCR GRANITE"
                      className="w-full bg-sleek-bg border border-sleek-border rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-sleek-text-main text-left font-black placeholder:text-sleek-text-muted/30"
                    />
                    <div className="flex gap-2 justify-start mt-2">
                      <button 
                        type="button"
                        onClick={() => {
                          const dateStr = new Date().toLocaleDateString('fr-DZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
                          const timeStr = new Date().toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
                          setResetSaveName(`TCR GRANITE - ${dateStr} ${timeStr}`);
                        }}
                        className="px-3 py-1.5 bg-sleek-bg hover:bg-sleek-bg/80 border border-sleek-border rounded-lg text-[10px] font-bold text-sleek-text-muted transition-all active:scale-95"
                      >
                        Insérer Date & Heure
                      </button>
                      <button 
                        type="button"
                        onClick={() => setResetSaveName("TCR GRANITE")}
                        className="px-3 py-1.5 bg-sleek-bg hover:bg-sleek-bg/80 border border-sleek-border rounded-lg text-[10px] font-bold text-sleek-text-muted transition-all active:scale-95"
                      >
                        TCR GRANITE par défaut
                      </button>
                    </div>
                  </div>
                </div>

                {/* Confirm & Cancel Actions */}
                <div className="flex gap-3 mt-8 border-t border-sleek-border/40 pt-5 flex-row">
                  <button 
                    onClick={() => setIsResetConfirmOpen(false)}
                    className="flex-1 py-4 text-xs bg-sleek-bg border border-sleek-border rounded-xl font-bold uppercase tracking-wider text-sleek-text-muted hover:border-white/20 hover:text-sleek-text-main transition-all active:scale-95"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={() => {
                      const name = resetSaveName.trim();
                      if (!name) {
                        showToast("Veuillez saisir un nom pour la sauvegarde.", "error");
                        return;
                      }
                      handleConfirmReset(name);
                    }}
                    className="flex-1 py-4 text-xs bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase tracking-wider shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Check size={14} />
                    Sauvegarder &amp; Réinitialiser
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* Header */}
        <header className="p-8 pb-6 flex items-center justify-between shrink-0 border-b border-sleek-border bg-sleek-card shadow-modern-sm transition-colors duration-300">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sleek-primary font-bold text-[10px] uppercase tracking-widest bg-sleek-bg/50 w-fit px-3 py-1 rounded-full border border-sleek-border">
               <Zap size={12} fill="currentColor" />
               {activeTab === 'dashboard' && "Overview"}
               {activeTab === 'prod' && "Dimensioning"}
               {activeTab === 'invest' && "Investment"}
               {activeTab === 'hr' && "Human Resources"}
               {activeTab === 'ops' && "Operations"}
               {activeTab === 'elec' && "Energy"}
               {activeTab === 'acc' && "Consumables"}
               {activeTab === 'water' && "Water"}
               {activeTab === 'edit' && "Calculations"}
               {activeTab === 'table' && "Reporting"}
               {activeTab === 'charts' && "Analytics"}
               {activeTab === 'code' && "Engineering"}
               {activeTab === 'history' && "Version History"}
               {activeTab === 'help' && "Support"}
               {activeTab === 'about' && "Credits"}
            </div>
            <h1 className="text-3xl font-bold text-sleek-text-main tracking-tight">
              {activeTab === 'dashboard' && "Tableau de Bord Exécutif"}
              {activeTab === 'prod' && "Production Dimensioning"}
              {activeTab === 'invest' && "Investissements & Amortissements"}
              {activeTab === 'hr' && "Frais de Personnel (RH)"}
              {activeTab === 'ops' && "Fuel & Maintenance"}
              {activeTab === 'elec' && "Électricité & Energie"}
              {activeTab === 'acc' && "Coûts Accessoires"}
              {activeTab === 'water' && "Consommation d'eau"}
              {activeTab === 'edit' && "Prévisions d'Exploitation"}
              {activeTab === 'table' && "Analyse des Résultats"}
              {activeTab === 'charts' && "Visualisation Graphique"}
              {activeTab === 'history' && "Gestion de l'Historique"}
              {activeTab === 'code' && "Code Source Android"}
              {activeTab === 'help' && "Documentation Technique"}
              {activeTab === 'about' && "Application Designer"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex flex-col items-end bg-sleek-bg/50 px-5 py-2.5 rounded-2xl border border-sleek-border shadow-sm group hover:border-sleek-primary/30 transition-all">
                <span className="text-[9px] uppercase font-bold text-sleek-text-muted tracking-widest mb-0.5 opacity-60">Capex Total</span>
                <span className="text-lg font-bold text-sleek-primary tabular-nums group-hover:scale-105 transition-transform">{formatCurrency(totalInvestment)} <span className="text-[10px] opacity-40">DA</span></span>
             </div>
             
             <div className="flex items-center bg-sleek-card border border-sleek-border rounded-2xl p-1 shadow-sm h-full">
               <button 
                 onClick={handleExportExcel}
                 className="px-4 py-2 text-[10px] font-bold bg-sleek-card text-emerald-600 hover:bg-emerald-500/10 rounded-xl transition-all flex items-center gap-2 uppercase tracking-widest border border-transparent hover:border-emerald-500/20"
                 title="Exporter vers Excel"
               >
                 <FileSpreadsheet size={16}/> Excel
               </button>
               <div className="w-px h-6 bg-sleek-border mx-1"></div>
               <button 
                 onClick={async () => {
                   await handleExportWord();
                    showToast("Rapport Word prêt !");
                 }}
                 className="px-4 py-2 text-[10px] font-bold bg-sleek-card text-blue-600 hover:bg-blue-500/10 rounded-xl transition-all flex items-center gap-2 uppercase tracking-widest border border-transparent hover:border-blue-500/20 font-sans"
                 title="Générer Rapport Word"
               >
                 <FileText size={16}/> Word
               </button>
             </div>
          </div>
        </header>

        {/* Stats Grid - Minimal Summary */}
        <div className="px-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 shrink-0">
          <CompactStatCard 
            label="Tonnage Total" 
            value={`${formatCurrency((totalRow.extractionGranite * densityGranite) + totalRow.extractionTuf)} T`} 
            formula="Poids total (Tonne) extrait sur 10 ans : (Volume Granite × Densité) + Tonnage Tuf."
          />
          <CompactStatCard 
            label="CA Global (10 ans)" 
            value={`${formatCurrency(totalRow.caGlobal / 1000000)} M DA`} 
            formula="Chiffre d'Affaires Global : Somme de tous les revenus générés par la vente des matériaux."
          />
          <CompactStatCard label="Cash-Flow (FNT)" value={`${formatCurrency(totalRow.fnt / 1000000)} M DA`} formula="Formule : Résultat Net + Dotations aux Amortissements" />
          <CompactStatCard label="Revient Granite" value={`${formatCompact(totalRow.prixRevientGranite)} DA/m³`} formula="(Direct G. + Communs) / Volume (m³)" />
          <CompactStatCard label="Revient Tuf" value={`${formatCompact(totalRow.prixRevientTuf)} DA/T`} formula="(Direct T. + Communs) / Tonnage (T)" />
        </div>

        {/* Views */}
        <div className="flex-1 px-8 pb-8 overflow-hidden flex flex-col min-h-0">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.98 }} 
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 overflow-y-auto pr-2 custom-scrollbar"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                  <DashboardKPI icon={<Wallet className="text-sleek-primary" />} label="Investissement Initial" value={formatCurrency(totalInvestment)} suffix="DA" />
                  <DashboardKPI icon={<TrendingUp className="text-sleek-accent-green" />} label="CA GLOBAL (10 ans)" value={formatCurrency(totalRow.caGlobal)} suffix="DA" />
                  <DashboardKPI 
                    icon={<Activity className="text-indigo-600" />} 
                    label="FNT Cumulé (10 ans)" 
                    value={formatCurrency(totalRow.fnt)} 
                    suffix="DA" 
                    formula="Résultat Net + Dotations aux Amortissements"
                  />
                  <DashboardKPI 
                    icon={<TrendingDown className="text-orange-500" />} 
                    label="Coût Revient Granite" 
                    value={formatCompact(totalRow.prixRevientGranite)} 
                    suffix="DA/m³" 
                    formula="(Direct(G) + Quote-part Communs) / Volume(G)"
                  />
                  <DashboardKPI 
                    icon={<TrendingDown className="text-amber-500" />} 
                    label="Coût Revient Tuf" 
                    value={formatCompact(totalRow.prixRevientTuf)} 
                    suffix="DA/T" 
                    formula="(Direct(T) + Quote-part Communs) / Tonnage(T)"
                  />
                  <DashboardKPI icon={<Check className="text-emerald-500" />} label="Payback (Estimé)" value={paybackYear === 'N/A' ? 'N/A' : `Année ${paybackYear}`} />
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-2 bg-sleek-card rounded-[2rem] border border-sleek-border shadow-sleek-card p-10">
                    <h3 className="text-sm font-bold mb-8 flex items-center gap-3 text-sleek-text-main uppercase tracking-widest opacity-80">
                      <BarChartIcon size={20} className="text-sleek-primary"/> Rentabilité Annuelle sur 10 ans
                    </h3>
                    <div className="h-[350px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#64748b'}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#64748b'}} tickFormatter={v => `${v/1000000}M`} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '11px' }}
                            formatter={(v: number) => [formatCurrency(v) + " DA", ""]}
                          />
                          <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                          <Bar dataKey="Chiffre d'affaires" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Résultat Net" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-sleek-card rounded-[2rem] border border-sleek-border shadow-sleek-card p-10">
                    <h3 className="text-sm font-bold mb-8 flex items-center gap-3 text-sleek-text-main uppercase tracking-widest opacity-80">
                      <PieChart size={20} className="text-sleek-accent-red"/> Structure des Coûts
                    </h3>
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={costStructureData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {costStructureData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                             contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '11px' }}
                             formatter={(v: number) => [formatCurrency(v) + " DA", ""]}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 mt-6">
                       {costStructureData.map((s, i) => (
                         <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full" style={{backgroundColor: s.color}}></div>
                               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{s.name}</span>
                            </div>
                            <span className="text-xs font-mono font-bold text-slate-800">{((s.value / costStructureData.reduce((a,b)=>a+b.value, 0)) * 100).toFixed(1)}%</span>
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="col-span-3 bg-sleek-card rounded-[2rem] border border-sleek-border shadow-sleek-card p-10 mt-6">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-sm font-bold flex items-center gap-3 text-sleek-text-main uppercase tracking-widest opacity-80">
                         <Activity size={20} className="text-emerald-500"/> Analyse Mixte: Chiffre d'Affaires vs Coûts de Revient
                       </h3>
                       <div className="flex gap-6">
                         <div className="flex items-center gap-2">
                           <div className="w-3 h-3 rounded-full bg-blue-500/20 border-2 border-blue-500"></div>
                           <span className="text-[10px] font-bold uppercase text-slate-500">CA Global</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <div className="w-3 h-1 bg-red-500 rounded-full"></div>
                           <span className="text-[10px] font-bold uppercase text-slate-500">Coût Revient Granite</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <div className="w-3 h-1 bg-amber-500 rounded-full"></div>
                           <span className="text-[10px] font-bold uppercase text-slate-500">Coût Revient Tuf</span>
                         </div>
                       </div>
                    </div>
                    <div className="h-[450px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 600}} dy={10} />
                          <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#3b82f6', fontSize: 10, fontWeight: 700}} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} label={{ value: 'Revenue (DA)', angle: -90, position: 'insideLeft', fontSize: 10, offset: 0 }} />
                          <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}} tickFormatter={(v) => `${v.toFixed(0)} DA`} label={{ value: 'Cost/Ton (DA)', angle: 90, position: 'insideRight', fontSize: 10, offset: 0 }} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '16px' }}
                            itemStyle={{ fontSize: '12px', fontWeight: 'bold', padding: '2px 0' }}
                          />
                          <Bar yAxisId="left" dataKey="Chiffre d'affaires" fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={60} fillOpacity={0.1} stroke="#3b82f6" strokeWidth={1} />
                          <Line yAxisId="right" type="monotone" dataKey="Prix Revient Granite" stroke="#ef4444" strokeWidth={4} dot={{ r: 6, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                          <Line yAxisId="right" type="monotone" dataKey="Prix Revient Tuf" stroke="#f59e0b" strokeWidth={4} dot={{ r: 6, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'prod' && (
              <motion.div 
                key="prod" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.98 }} 
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} 
                className="flex-1 flex flex-col gap-8 overflow-y-auto pr-2 custom-scrollbar"
              >
                {/* Header Information */}
                <div className="bg-gradient-to-r from-sleek-primary to-blue-600 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden shrink-0">
                  <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Mountain size={160} strokeWidth={1} />
                  </div>
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6 backdrop-blur-md border border-white/10">
                       <Activity size={12} /> Outil de Simulation & Dimensionnement
                    </div>
                    <h2 className="text-3xl font-black tracking-tight mb-4 leading-tight">Objectif de Production & Planning</h2>
                    <p className="text-white/70 max-w-2xl font-medium leading-relaxed">
                      Espace dédié au dimensionnement des capacités d'extraction et de retaille. Déterminez le volume en amont (Tout-Venant) nécessaire pour atteindre vos objectifs de blocs marchands en tenant compte des rendements.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Configuration */}
                  <div className="lg:col-span-4 space-y-8">
                    {/* Section 1: Paramètres de Base */}
                    <div className="bg-sleek-card p-8 rounded-[2rem] border border-sleek-border shadow-md space-y-6">
                      <h3 className="text-sm font-bold text-sleek-text-main flex items-center gap-2 border-b border-sleek-border pb-4 uppercase tracking-tighter">
                        <Settings size={16} className="text-sleek-primary" /> 1. Paramètres de Base
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-sleek-text-muted opacity-70 px-1">Matériau Concerné</label>
                          <select className="w-full bg-sleek-bg border border-sleek-border rounded-xl px-4 py-3 text-sm font-semibold transition-all outline-none focus:ring-2 focus:ring-sleek-primary/10" disabled>
                            <option value="Granite">Granite (uniquement)</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-sleek-text-muted opacity-70 px-1">Horizon d'étude</label>
                            <select 
                              value={productionConfig.horizon}
                              onChange={(e) => setProductionConfig({...productionConfig, horizon: e.target.value as any})}
                              className="w-full bg-sleek-bg border border-sleek-border rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-sleek-primary/10"
                            >
                              <option value="1y">1 An (Statique)</option>
                              <option value="10y">10 Ans (Dynamique)</option>
                            </select>
                          </div>
                          
                          {productionConfig.horizon === '10y' && (
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-sleek-text-muted opacity-70 px-1">Mode Volume Cible</label>
                              <select 
                                value={productionConfig.targetMode}
                                onChange={(e) => setProductionConfig({...productionConfig, targetMode: e.target.value as any})}
                                className="w-full bg-sleek-bg border border-sleek-border rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-sleek-primary/10"
                              >
                                <option value="constant">Constant</option>
                                <option value="variable">Variable / an</option>
                              </select>
                            </div>
                          )}
                        </div>

                        <InputGroupVertical 
                          label="Volume annuel cible Vcible (m³/an)"
                          value={(productionConfig.vTargetConstant ?? 10000).toString()}
                          onChange={(v) => setProductionConfig({...productionConfig, vTargetConstant: Number(v)})}
                          type="number"
                          helper="Volume final de blocs marchands à produire par an"
                          formula="Objectif final de vente en m³ de blocs marchands après toutes les étapes de retaille."
                        />
                      </div>
                    </div>

                    {/* Section 2: Chaîne de production */}
                    <div className="bg-sleek-card p-8 rounded-[2rem] border border-sleek-border shadow-md space-y-6">
                      <h3 className="text-sm font-bold text-sleek-text-main flex items-center gap-2 border-b border-sleek-border pb-4 uppercase tracking-tighter">
                        <Activity size={16} className="text-sleek-primary" /> 2. Dimensions des Blocs
                      </h3>
                      
                      <div className="space-y-6">
                        {/* Step A: Extraction */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-sleek-primary bg-blue-50 px-3 py-1 rounded-full tracking-widest">Étape A : Extraction</span>
                            <span className="text-[11px] font-mono font-bold text-slate-400">
                              Vgros = {(productionConfig.steps.extraction.dimensions.l * productionConfig.steps.extraction.dimensions.w * productionConfig.steps.extraction.dimensions.h).toFixed(2)} m³
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <InputGroupVertical 
                              label="L (m)" value={(productionConfig.steps?.extraction?.dimensions?.l ?? 10).toString()} 
                              onChange={(v) => {
                                const newConfig = {...productionConfig};
                                if (!newConfig.steps.extraction) newConfig.steps.extraction = { name: "Extraction gros blocs", dimensions: { l: 10, w: 10, h: 1.6 }, productivity: { vs: 20, hEq: 1.6, hoursPerDay: 8, daysPerYear: 250, utilizationRate: 1 } };
                                newConfig.steps.extraction.dimensions.l = Number(v);
                                setProductionConfig(newConfig);
                              }}
                              type="number"
                              formula="Longueur du bloc brut extrait directement en carrière (gros bloc)."
                            />
                            <InputGroupVertical 
                              label="l (m)" value={(productionConfig.steps?.extraction?.dimensions?.w ?? 10).toString()} 
                              onChange={(v) => {
                                const newConfig = {...productionConfig};
                                if (!newConfig.steps.extraction) newConfig.steps.extraction = { name: "Extraction gros blocs", dimensions: { l: 10, w: 10, h: 1.6 }, productivity: { vs: 20, hEq: 1.6, hoursPerDay: 8, daysPerYear: 250, utilizationRate: 1 } };
                                newConfig.steps.extraction.dimensions.w = Number(v);
                                setProductionConfig(newConfig);
                              }}
                              type="number"
                              formula="Largeur du bloc brut extrait directement en carrière (gros bloc)."
                            />
                            <InputGroupVertical 
                              label="h (m)" value={(productionConfig.steps?.extraction?.dimensions?.h ?? 1.6).toString()} 
                              onChange={(v) => {
                                const newConfig = {...productionConfig};
                                if (!newConfig.steps.extraction) newConfig.steps.extraction = { name: "Extraction gros blocs", dimensions: { l: 10, w: 10, h: 1.6 }, productivity: { vs: 20, hEq: 1.6, hoursPerDay: 8, daysPerYear: 250, utilizationRate: 1 } };
                                newConfig.steps.extraction.dimensions.h = Number(v);
                                setProductionConfig(newConfig);
                              }}
                              type="number"
                              formula="Hauteur du bloc brut extrait directement en carrière (gros bloc)."
                            />
                          </div>
                        </div>

                        {/* Step B: Retaille */}
                        <div className="space-y-4 pt-4 border-t border-sleek-border">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full tracking-widest">Étape B : Retaille</span>
                            <span className="text-[11px] font-mono font-bold text-slate-400">
                              Vretaille = {(productionConfig.steps.retaille.dimensions.l * productionConfig.steps.retaille.dimensions.w * productionConfig.steps.retaille.dimensions.h).toFixed(3)} m³
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <InputGroupVertical 
                              label="L (m)" value={(productionConfig.steps?.retaille?.dimensions?.l ?? 2.15).toString()} 
                              onChange={(v) => {
                                const newConfig = {...productionConfig};
                                if (!newConfig.steps.retaille) newConfig.steps.retaille = { name: "Retaille des blocs", dimensions: { l: 2.15, w: 1.5, h: 1.4 }, productivity: { vs: 30, hEq: 1.4, hoursPerDay: 8, daysPerYear: 250, utilizationRate: 1 } };
                                newConfig.steps.retaille.dimensions.l = Number(v);
                                setProductionConfig(newConfig);
                              }}
                              type="number"
                              formula="Longueur finale du bloc marchand (produit fini exportable)."
                            />
                            <InputGroupVertical 
                              label="l (m)" value={(productionConfig.steps?.retaille?.dimensions?.w ?? 1.5).toString()} 
                              onChange={(v) => {
                                const newConfig = {...productionConfig};
                                if (!newConfig.steps.retaille) newConfig.steps.retaille = { name: "Retaille des blocs", dimensions: { l: 2.15, w: 1.5, h: 1.4 }, productivity: { vs: 30, hEq: 1.4, hoursPerDay: 8, daysPerYear: 250, utilizationRate: 1 } };
                                newConfig.steps.retaille.dimensions.w = Number(v);
                                setProductionConfig(newConfig);
                              }}
                              type="number"
                              formula="Largeur finale du bloc marchand (produit fini exportable)."
                            />
                            <InputGroupVertical 
                              label="h (m)" value={(productionConfig.steps?.retaille?.dimensions?.h ?? 1.4).toString()} 
                              onChange={(v) => {
                                const newConfig = {...productionConfig};
                                if (!newConfig.steps.retaille) newConfig.steps.retaille = { name: "Retaille des blocs", dimensions: { l: 2.15, w: 1.5, h: 1.4 }, productivity: { vs: 30, hEq: 1.4, hoursPerDay: 8, daysPerYear: 250, utilizationRate: 1 } };
                                newConfig.steps.retaille.dimensions.h = Number(v);
                                setProductionConfig(newConfig);
                              }}
                              type="number"
                              formula="Hauteur finale du bloc marchand (produit fini exportable)."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle and Right Column: Rendements & Capacités */}
                  <div className="lg:col-span-8 space-y-8">
                    {/* Section 3: Rendements */}
                    <div className="bg-sleek-card rounded-[2.5rem] border border-sleek-border shadow-md overflow-hidden flex flex-col">
                       <div className="px-8 py-5 border-b border-sleek-border bg-sleek-bg flex items-center justify-between">
                         <h3 className="text-sm font-bold uppercase tracking-widest text-sleek-text-muted flex items-center gap-2">
                           <TrendingUp size={16} className="text-emerald-500" /> 3. Rendements & Pertes
                         </h3>
                         <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border border-emerald-500/20">
                            <Activity size={12}/> Calcul Dynamique
                         </div>
                       </div>
                       
                       <div className="p-8">
                        <InfoCallout 
                          title="Paramétrage des rendements"
                          description={
                            <>
                               Cette section permet de définir les pertes attendues à chaque étape. 
                               <b>Vcible</b> représente votre objectif de vente. L'outil calculera automatiquement le <b>Vamont</b> (volume brut) nécessaire en tenant compte de η1 et η2.
                            </>
                          }
                          className="mb-8"
                        />

                        {productionConfig.horizon === '1y' ? (
                        <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">η1 : Rendement Extraction</label>
                            <div className="flex items-center gap-4">
                              <input 
                                type="range" min="0" max="1" step="0.05"
                                value={productionConfig.yieldsConstant.eta1}
                                onChange={(e) => setProductionConfig({...productionConfig, yieldsConstant: {...productionConfig.yieldsConstant, eta1: Number(e.target.value)}})}
                                className="flex-1 accent-sleek-primary"
                              />
                              <span className="text-lg font-mono font-black text-sleek-primary w-16 text-right">{(productionConfig.yieldsConstant.eta1 * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">η2 : Rendement Retaille</label>
                            <div className="flex items-center gap-4">
                              <input 
                                type="range" min="0" max="1" step="0.05"
                                value={productionConfig.yieldsConstant.eta2}
                                onChange={(e) => setProductionConfig({...productionConfig, yieldsConstant: {...productionConfig.yieldsConstant, eta2: Number(e.target.value)}})}
                                className="flex-1 accent-indigo-500"
                              />
                              <span className="text-lg font-mono font-black text-indigo-500 w-16 text-right">{(productionConfig.yieldsConstant.eta2 * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-sleek-border shadow-sm">
                          <table className="w-full text-left text-xs border-collapse">
                             <thead className="bg-sleek-bg/50 border-b border-sleek-border">
                               <tr className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-widest">
                                 <th className="p-4 border-r border-sleek-border/50 sticky left-0 z-20 bg-sleek-bg shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Paramètre / Année</th>
                                 {Array.from({length: 10}).map((_, i) => <th key={i} className="p-4 text-center border-r border-sleek-border/50 last:border-r-0">Année {i+1}</th>)}
                               </tr>
                             </thead>
                             <tbody className="divide-y divide-sleek-border/30">
                               <tr className="hover:bg-sleek-bg/20 transition-colors">
                                 <td className="p-4 font-bold text-sleek-primary whitespace-nowrap bg-sleek-bg/10 border-r border-sleek-border/50 sticky left-0 z-10 backdrop-blur-sm">Vcible (m³)</td>
                                 {Array.from({length: 10}).map((_, i) => (
                                   <td key={i} className="p-2 border-r border-sleek-border/30 last:border-r-0">
                                     <input 
                                       type="number"
                                       value={productionConfig.targetMode === 'constant' ? productionConfig.vTargetConstant : productionConfig.vTargetVariable[i]}
                                       onChange={(e) => {
                                         if (productionConfig.targetMode === 'constant') {
                                           setProductionConfig({...productionConfig, vTargetConstant: Number(e.target.value)});
                                         } else {
                                           const newVar = [...productionConfig.vTargetVariable];
                                           newVar[i] = Number(e.target.value);
                                           setProductionConfig({...productionConfig, vTargetVariable: newVar});
                                         }
                                       }}
                                       className="w-full bg-white dark:bg-sleek-surface-elevated border border-sleek-border rounded-lg p-2 text-center font-mono font-bold outline-none focus:ring-2 focus:ring-sleek-primary/20 focus:border-sleek-primary transition-all shadow-sm text-sleek-text-main"
                                     />
                                   </td>
                                 ))}
                               </tr>
                               <tr className="hover:bg-sleek-bg/20 transition-colors">
                                 <td className="p-4 font-bold text-emerald-600 whitespace-nowrap bg-sleek-bg/10 border-r border-sleek-border/50 sticky left-0 z-10 backdrop-blur-sm">η1 (Extraction)</td>
                                 {Array.from({length: 10}).map((_, i) => (
                                   <td key={i} className="p-2 border-r border-sleek-border/30 last:border-r-0">
                                     <input 
                                       type="number" step="0.01"
                                       value={productionConfig.yieldsVariable.eta1[i]}
                                       onChange={(e) => {
                                         const newVar = [...productionConfig.yieldsVariable.eta1];
                                         newVar[i] = Number(e.target.value);
                                         setProductionConfig({...productionConfig, yieldsVariable: {...productionConfig.yieldsVariable, eta1: newVar}});
                                       }}
                                       className="w-full bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 text-center font-mono font-bold outline-none focus:bg-white focus:dark:bg-emerald-900/20 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all text-emerald-700 dark:text-emerald-400"
                                     />
                                   </td>
                                 ))}
                               </tr>
                               <tr className="hover:bg-sleek-bg/20 transition-colors">
                                 <td className="p-4 font-bold text-indigo-600 whitespace-nowrap bg-sleek-bg/10 border-r border-sleek-border/50 sticky left-0 z-10 backdrop-blur-sm">η2 (Retaille)</td>
                                 {Array.from({length: 10}).map((_, i) => (
                                   <td key={i} className="p-2 border-r border-sleek-border/30 last:border-r-0">
                                     <input 
                                       type="number" step="0.01"
                                       value={productionConfig.yieldsVariable.eta2[i]}
                                       onChange={(e) => {
                                         const newVar = [...productionConfig.yieldsVariable.eta2];
                                         newVar[i] = Number(e.target.value);
                                         setProductionConfig({...productionConfig, yieldsVariable: {...productionConfig.yieldsVariable, eta2: newVar}});
                                       }}
                                       className="w-full bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-2 text-center font-mono font-bold outline-none focus:bg-white focus:dark:bg-indigo-900/20 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all text-indigo-700 dark:text-indigo-400"
                                     />
                                   </td>
                                 ))}
                               </tr>
                             </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                    {/* Section 4: Capacités Machines */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Extraction Machine */}
                      <div className="bg-sleek-card p-8 rounded-[2rem] border border-sleek-border shadow-md space-y-6">
                        <h3 className="text-sm font-bold text-sleek-text-main flex items-center gap-2 border-b border-sleek-border pb-4 uppercase tracking-tighter">
                          <HardHat size={16} className="text-sleek-primary" /> Capacité Extraction
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                           <InputGroupVertical label="Vs (m²/h)" value={(productionConfig.steps?.extraction?.productivity?.vs ?? 20).toString()} onChange={(v) => {
                             const newConfig = {...productionConfig};
                             newConfig.steps.extraction.productivity.vs = Number(v);
                             setProductionConfig(newConfig);
                           }} type="number" formula="Vitesse de sciage nette du fil diamanté en mètres carrés par heure (vitesse d'avancement)." />
                           <InputGroupVertical label="h_eq (m)" value={(productionConfig.steps?.extraction?.productivity?.hEq ?? 1.6).toString()} onChange={(v) => {
                             const newConfig = {...productionConfig};
                             newConfig.steps.extraction.productivity.hEq = Number(v);
                             setProductionConfig(newConfig);
                           }} type="number" formula="Hauteur équivalente moyenne de coupe. Utilisée pour convertir la surface sciée en volume extrait." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <InputGroupVertical label="H (h/j)" value={(productionConfig.steps?.extraction?.productivity?.hoursPerDay ?? 8).toString()} onChange={(v) => {
                             const newConfig = {...productionConfig};
                             newConfig.steps.extraction.productivity.hoursPerDay = Number(v);
                             setProductionConfig(newConfig);
                           }} type="number" formula="Nombre moyen d'heures de fonctionnement effectif de la machine par jour (temps de sciage pur)." />
                           <InputGroupVertical label="J (j/an)" value={(productionConfig.steps?.extraction?.productivity?.daysPerYear ?? 250).toString()} onChange={(v) => {
                             const newConfig = {...productionConfig};
                             newConfig.steps.extraction.productivity.daysPerYear = Number(v);
                             setProductionConfig(newConfig);
                           }} type="number" formula="Nombre de jours d'exploitation de la carrière sur l'année." />
                        </div>
                        <InputGroupVertical label="Taux d'Utilisation U" value={(productionConfig.steps?.extraction?.productivity?.utilizationRate ?? 1).toString()} onChange={(v) => {
                          const newConfig = {...productionConfig};
                          newConfig.steps.extraction.productivity.utilizationRate = Number(v);
                          setProductionConfig(newConfig);
                        }} type="number" helper="Valeur entre 0 et 1 (Défaut 1)" formula="Ratio de disponibilité réelle de la machine (Maintenance, arrêts, déplacements). 0.8 signifie 80% du temps disponible." />
                      </div>

                      {/* Retaille Machine */}
                      <div className="bg-sleek-card p-8 rounded-[2rem] border border-sleek-border shadow-md space-y-6">
                        <h3 className="text-sm font-bold text-sleek-text-main flex items-center gap-2 border-b border-sleek-border pb-4 uppercase tracking-tighter">
                          <Settings size={16} className="text-indigo-600" /> Capacité Retaille
                        </h3>
                         <div className="grid grid-cols-2 gap-4">
                           <InputGroupVertical label="Vs (m²/h)" value={(productionConfig.steps?.retaille?.productivity?.vs ?? 30).toString()} onChange={(v) => {
                             const newConfig = {...productionConfig};
                             newConfig.steps.retaille.productivity.vs = Number(v);
                             setProductionConfig(newConfig);
                           }} type="number" formula="Vitesse de sciage nette pour la mise au format des blocs marchands." />
                           <InputGroupVertical label="h_eq (m)" value={(productionConfig.steps?.retaille?.productivity?.hEq ?? 1.4).toString()} onChange={(v) => {
                             const newConfig = {...productionConfig};
                             newConfig.steps.retaille.productivity.hEq = Number(v);
                             setProductionConfig(newConfig);
                           }} type="number" formula="Hauteur de coupe moyenne lors de l'équarrissage des blocs." />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                           <InputGroupVertical label="H (h/j)" value={(productionConfig.steps?.retaille?.productivity?.hoursPerDay ?? 8).toString()} onChange={(v) => {
                             const newConfig = {...productionConfig};
                             newConfig.steps.retaille.productivity.hoursPerDay = Number(v);
                             setProductionConfig(newConfig);
                           }} type="number" formula="Temps de fonctionnement quotidien de la machine de retaille." />
                           <InputGroupVertical label="J (j/an)" value={(productionConfig.steps?.retaille?.productivity?.daysPerYear ?? 250).toString()} onChange={(v) => {
                             const newConfig = {...productionConfig};
                             newConfig.steps.retaille.productivity.daysPerYear = Number(v);
                             setProductionConfig(newConfig);
                           }} type="number" formula="Nombre de jours de travail par an." />
                         </div>
                         <InputGroupVertical label="Taux d'Utilisation U" value={(productionConfig.steps?.retaille?.productivity?.utilizationRate ?? 1).toString()} onChange={(v) => {
                           const newConfig = {...productionConfig};
                           newConfig.steps.retaille.productivity.utilizationRate = Number(v);
                           setProductionConfig(newConfig);
                         }} type="number" helper="Valeur entre 0 et 1 (Défaut 1)" formula="Efficience opérationnelle de la machine (pannes, changements de fil, etc.)." />
                      </div>
                    </div>

                    {/* Section 5: Résultats */}
                    <div className="bg-sleek-card rounded-[2rem] border border-sleek-border shadow-md overflow-hidden flex flex-col">
                       <div className="px-8 py-5 border-b border-sleek-border bg-sleek-bg flex items-center justify-between">
                         <h3 className="text-sm font-bold uppercase tracking-widest text-sleek-text-muted flex items-center gap-3">
                           <LayoutDashboard size={18} className="text-sleek-primary" /> 5. Résultats du Dimensionnement
                         </h3>
                         <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                           <span className="text-[10px] font-black uppercase text-sleek-text-muted tracking-widest">Synthèse Technique en Temps Réel</span>
                         </div>
                       </div>

                       <div className="p-8 space-y-8">
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                           {(() => {
                             // Quick Calc for first year for KPI display
                             const vTarget = (productionConfig.horizon === '1y' ? productionConfig.vTargetConstant : (productionConfig.targetMode === 'constant' ? productionConfig.vTargetConstant : (productionConfig.vTargetVariable ?? [])[0])) ?? 10000;
                             const eta1 = (productionConfig.horizon === '1y' ? productionConfig.yieldsConstant?.eta1 : (productionConfig.yieldsVariable?.eta1 ?? [])[0]) ?? 0.5;
                             const eta2 = (productionConfig.horizon === '1y' ? productionConfig.yieldsConstant?.eta2 : (productionConfig.yieldsVariable?.eta2 ?? [])[0]) ?? 0.8;
                             const etaTot = eta1 * eta2;
                             const vAmont = vTarget / (etaTot || 1);
                             
                             const vgros = (productionConfig.steps?.extraction?.dimensions?.l ?? 10) * (productionConfig.steps?.extraction?.dimensions?.w ?? 10) * (productionConfig.steps?.extraction?.dimensions?.h ?? 1.6);
                             const vretaille = (productionConfig.steps?.retaille?.dimensions?.l ?? 2.15) * (productionConfig.steps?.retaille?.dimensions?.w ?? 1.5) * (productionConfig.steps?.retaille?.dimensions?.h ?? 1.4);
                             
                             const capA = (productionConfig.steps?.extraction?.productivity?.vs ?? 20) * (productionConfig.steps?.extraction?.productivity?.hEq ?? 1.6) * (productionConfig.steps?.extraction?.productivity?.hoursPerDay ?? 8) * (productionConfig.steps?.extraction?.productivity?.daysPerYear ?? 250) * (productionConfig.steps?.extraction?.productivity?.utilizationRate ?? 1);
                             const capB = (productionConfig.steps?.retaille?.productivity?.vs ?? 30) * (productionConfig.steps?.retaille?.productivity?.hEq ?? 1.4) * (productionConfig.steps?.retaille?.productivity?.hoursPerDay ?? 8) * (productionConfig.steps?.retaille?.productivity?.daysPerYear ?? 250) * (productionConfig.steps?.retaille?.productivity?.utilizationRate ?? 1);
                             
                             const na = Math.ceil(vAmont / (capA || 1));
                             const nb = Math.ceil(vTarget / (capB || 1));

                             return (
                               <>
                                 <div className="bg-sleek-bg p-6 rounded-3xl border border-sleek-border flex flex-col gap-2 group hover:border-sleek-primary/30 transition-all shadow-sm">
                                    <span className="text-[9px] font-black uppercase text-sleek-text-muted tracking-widest leading-none opacity-60">V_amont Tout-Venant</span>
                                    <span className="text-2xl font-mono font-black text-sleek-primary">{vAmont.toLocaleString('fr-DZ', {maximumFractionDigits: 0})} <span className="text-xs font-sans opacity-40">m³/an</span></span>
                                    <p className="text-[9px] text-sleek-text-muted italic opacity-60">Volume à extraire (amont)</p>
                                 </div>
                                 <div className="bg-sleek-bg p-6 rounded-3xl border border-sleek-border flex flex-col gap-2 group hover:border-emerald-500/30 transition-all shadow-sm">
                                    <span className="text-[9px] font-black uppercase text-sleek-text-muted tracking-widest leading-none opacity-60">Machines Requises</span>
                                    <div className="flex flex-col gap-1">
                                      <span className="text-2xl font-mono font-black text-emerald-600">{na} <span className="text-[10px] font-sans opacity-40 uppercase">Extraction</span></span>
                                      <span className="text-2xl font-mono font-black text-indigo-600">{nb} <span className="text-[10px] font-sans opacity-40 uppercase">Retaille</span></span>
                                    </div>
                                 </div>
                                 <div className="bg-sleek-bg p-6 rounded-3xl border border-sleek-border flex flex-col gap-2 group hover:border-indigo-500/30 transition-all shadow-sm">
                                    <span className="text-[9px] font-black uppercase text-sleek-text-muted tracking-widest leading-none opacity-60">Unités Logistiques</span>
                                    <div className="flex flex-col gap-1">
                                      <span className="text-sm font-bold text-sleek-text-main"><span className="text-blue-500">{Math.ceil(vAmont/vgros)}</span> Gros blocs /an</span>
                                      <span className="text-sm font-bold text-sleek-text-main"><span className="text-indigo-500">{Math.ceil(vTarget/vretaille)}</span> Blocs retaille /an</span>
                                    </div>
                                 </div>
                                 <div className="bg-sleek-bg p-6 rounded-3xl border border-sleek-border flex flex-col gap-2 shadow-sm border-l-4 border-l-sleek-primary">
                                    <span className="text-[9px] font-black uppercase text-sleek-text-muted tracking-widest leading-none opacity-60">Analyse Critique</span>
                                    <div className="flex flex-col gap-1">
                                      <span className="text-sm font-bold text-sleek-text-main flex items-center gap-2">
                                         Goulot: <span className={na >= nb ? "text-emerald-600" : "text-indigo-600 font-black"}>{na >= nb ? "Extraction" : "Retaille"}</span>
                                      </span>
                                      <span className="text-sm font-bold text-sleek-text-main flex items-center gap-2">
                                         Besoin Total: <span className="text-sleek-primary font-black">{Math.max(na, nb)} machines</span>
                                      </span>
                                    </div>
                                 </div>
                               </>
                             );
                           })()}
                         </div>

                         {/* 10 Year Result Table */}
                         {productionConfig.horizon === '10y' && (
                           <div className="overflow-x-auto rounded-2xl border border-sleek-border shadow-sm">
                              <table className="w-full text-[11px] border-collapse min-w-[900px]">
                                 <thead className="bg-sleek-bg border-b border-sleek-border">
                                   <tr className="text-sleek-text-muted font-bold uppercase tracking-widest">
                                     <th className="p-4 text-left border-r border-sleek-border/30 sticky left-0 z-20 bg-sleek-bg shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Indicateurs / Année</th>
                                     {Array.from({length: 10}).map((_, i) => <th key={i} className="p-4 text-center border-r border-sleek-border/30 last:border-r-0">Année {i+1}</th>)}
                                   </tr>
                                 </thead>
                                 <tbody className="divide-y divide-sleek-border/50">
                                   {(() => {
                                     const indicators = [];
                                     const vTargetRef = productionConfig.targetMode === 'constant' ? Array(10).fill(productionConfig.vTargetConstant ?? 10000) : (productionConfig.vTargetVariable ?? Array(10).fill(10000));
                                     const eta1Ref = productionConfig.yieldsVariable?.eta1 ?? Array(10).fill(0.5);
                                     const eta2Ref = productionConfig.yieldsVariable?.eta2 ?? Array(10).fill(0.8);
                                     const vgros = (productionConfig.steps?.extraction?.dimensions?.l ?? 10) * (productionConfig.steps?.extraction?.dimensions?.w ?? 10) * (productionConfig.steps?.extraction?.dimensions?.h ?? 1.6);
                                     const vretaille = (productionConfig.steps?.retaille?.dimensions?.l ?? 2.15) * (productionConfig.steps?.retaille?.dimensions?.w ?? 1.5) * (productionConfig.steps?.retaille?.dimensions?.h ?? 1.4);
                                     const capA = (productionConfig.steps?.extraction?.productivity?.vs ?? 20) * (productionConfig.steps?.extraction?.productivity?.hEq ?? 1.6) * (productionConfig.steps?.extraction?.productivity?.hoursPerDay ?? 8) * (productionConfig.steps?.extraction?.productivity?.daysPerYear ?? 250) * (productionConfig.steps?.extraction?.productivity?.utilizationRate ?? 1);
                                     const capB = (productionConfig.steps?.retaille?.productivity?.vs ?? 30) * (productionConfig.steps?.retaille?.productivity?.hEq ?? 1.4) * (productionConfig.steps?.retaille?.productivity?.hoursPerDay ?? 8) * (productionConfig.steps?.retaille?.productivity?.daysPerYear ?? 250) * (productionConfig.steps?.retaille?.productivity?.utilizationRate ?? 1);

                                     const rowVAmont = Array.from({length: 10}, (_, i) => vTargetRef[i] / ((eta1Ref[i] * eta2Ref[i]) || 1));
                                     const rowNbGros = rowVAmont.map(v => Math.ceil(v/vgros));
                                     const rowNbRetaille = vTargetRef.map(v => Math.ceil(v/vretaille));
                                     const rowNa = rowVAmont.map(v => Math.ceil(v/capA));
                                     const rowNb = vTargetRef.map(v => Math.ceil(v/capB));

                                     return (
                                       <>
                                         <tr className="hover:bg-sleek-bg/20 transition-colors group/row">
                                           <td className="p-4 font-bold text-sleek-text-muted bg-sleek-bg/5 border-r border-sleek-border/30 sticky left-0 z-10 backdrop-blur-sm shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] group-hover/row:bg-sleek-bg transition-colors">V_amont (m³/an)</td>
                                           {rowVAmont.map((v, i) => <td key={i} className="p-4 text-center font-mono font-medium border-r border-sleek-border/20 last:border-r-0">{v.toLocaleString('fr-DZ', {maximumFractionDigits: 0})}</td>)}
                                         </tr>
                                         <tr className="hover:bg-sleek-bg/20 transition-colors group/row">
                                           <td className="p-4 font-bold text-sleek-text-muted bg-sleek-bg/5 border-r border-sleek-border/30 sticky left-0 z-10 backdrop-blur-sm shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] group-hover/row:bg-sleek-bg transition-colors">Nb Gros blocs</td>
                                           {rowNbGros.map((v, i) => <td key={i} className="p-4 text-center font-mono border-r border-sleek-border/20 last:border-r-0">{v}</td>)}
                                         </tr>
                                         <tr className="hover:bg-sleek-bg/20 transition-colors group/row">
                                           <td className="p-4 font-bold text-sleek-text-muted bg-sleek-bg/5 border-r border-sleek-border/30 sticky left-0 z-10 backdrop-blur-sm shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] group-hover/row:bg-sleek-bg transition-colors">Nb Blocs Retaille</td>
                                           {rowNbRetaille.map((v, i) => <td key={i} className="p-4 text-center font-mono border-r border-sleek-border/20 last:border-r-0">{v}</td>)}
                                         </tr>
                                         <tr className="bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors group/row">
                                           <td className="p-4 font-bold text-emerald-700 bg-emerald-500/10 border-r border-emerald-500/20 sticky left-0 z-10 backdrop-blur-sm shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] group-hover/row:bg-emerald-500/20 transition-colors">Machines Extraction (N_A)</td>
                                           {rowNa.map((v, i) => <td key={i} className="p-4 text-center font-mono font-black text-emerald-600 border-r border-emerald-500/10 last:border-r-0">{v}</td>)}
                                         </tr>
                                         <tr className="bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors group/row">
                                           <td className="p-4 font-bold text-indigo-700 bg-indigo-500/10 border-r border-indigo-500/20 sticky left-0 z-10 backdrop-blur-sm shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] group-hover/row:bg-indigo-500/20 transition-colors">Machines Retaille (N_B)</td>
                                           {rowNb.map((v, i) => <td key={i} className="p-4 text-center font-mono font-black text-indigo-600 border-r border-indigo-500/10 last:border-r-0">{v}</td>)}
                                         </tr>
                                       </>
                                     );
                                   })()}
                                 </tbody>
                              </table>
                           </div>
                         )}

                         <div className="pt-8 border-t border-sleek-border flex items-center justify-between text-sleek-text-muted">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-sleek-primary/10 text-sleek-primary flex items-center justify-center"><Info size={14}/></div>
                               <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 max-w-lg leading-relaxed">
                                  Les calculs sont théoriques et basés sur des rendements idéaux. Un coefficient de sécurité peut être ajouté via le taux d'utilisation U.
                               </p>
                            </div>
                            <button 
                              className="px-6 py-3 bg-sleek-bg hover:bg-sleek-card rounded-xl text-[10px] font-black uppercase tracking-widest text-sleek-text-muted transition-all border border-sleek-border shadow-sm opacity-50 cursor-not-allowed"
                              title="Indisponible pour l'instant"
                            >
                               Enregistrer Projection
                            </button>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'invest' && (
              <motion.div 
                key="invest" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.98 }} 
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar min-h-0"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 shrink-0">
                  <div className="lg:col-span-4 bg-sleek-card p-6 rounded-2xl border border-sleek-border shadow-md overflow-y-auto max-h-[calc(100vh-220px)] custom-scrollbar">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-sleek-text-main"><PlusCircle size={16} className="text-sleek-primary"/> Nouvel Équipement</h3>
                    <div className="space-y-4">
                      <InputGroupVertical 
                        label="Désignation" 
                        value={newEqName} 
                        onChange={(v) => { setNewEqName(v); if(newEqErrors.name) setNewEqErrors(prev => ({...prev, name: undefined})); }} 
                        error={newEqErrors.name} 
                      />
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-sleek-text-muted opacity-70 px-1">Catégorie</label>
                        <select 
                          value={newEqCategory} 
                          onChange={(e) => setNewEqCategory(e.target.value as InvestmentCategory)}
                          className="w-full bg-sleek-bg border border-sleek-border rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-sleek-primary/10 focus:bg-sleek-card focus:border-sleek-primary transition-all outline-none shadow-inner cursor-pointer"
                        >
                          <option value="Frais préliminaires & Exploration">Frais préliminaires & Exploration</option>
                          <option value="Infrastructures & Bâtiments">Infrastructures & Bâtiments</option>
                          <option value="Équipements Lourds & Matériel">Équipements Lourds & Matériel</option>
                        </select>
                      </div>
                      <InputGroupVertical 
                        label="Prix d'Acquisition (DA)" 
                        value={newEqPrice} 
                        onChange={(v) => { setNewEqPrice(v); if(newEqErrors.price) setNewEqErrors(prev => ({...prev, price: undefined})); }} 
                        type="number" 
                        error={newEqErrors.price} 
                      />
                      <InputGroupVertical 
                        label="Durée (ans)" 
                        value={newEqDuration} 
                        onChange={(v) => { setNewEqDuration(v); if(newEqErrors.duration) setNewEqErrors(prev => ({...prev, duration: undefined})); }} 
                        type="number" 
                        error={newEqErrors.duration} 
                        helper="Laissez 0 si non amortissable (Frais préliminaires)" 
                      />
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-sleek-text-muted opacity-70 px-1">Affectation Analytique</label>
                        <select 
                          value={newEqAlloc} 
                          onChange={(e) => setNewEqAlloc(e.target.value as any)}
                          className="w-full bg-sleek-bg/50 border border-sleek-border rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-sleek-primary/10 focus:bg-sleek-card focus:border-sleek-primary transition-all outline-none"
                        >
                          <option value="Granite">Directe Granite</option>
                          <option value="Tuf">Directe Tuf</option>
                          <option value="Common">Commune / Partagée</option>
                        </select>
                      </div>
                      <button onClick={addEquipment} className="w-full py-4 bg-sleek-primary text-white rounded-2xl shadow-lg shadow-sleek-primary/20 transition-all hover:scale-[1.02] active:scale-95 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 group">
                        <PlusCircle size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                        Confirmer l'Investissement
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-8 bg-sleek-card rounded-2xl border border-sleek-border shadow-md overflow-hidden flex flex-col max-h-[calc(100vh-220px)]">
                    <div className="px-6 py-4 border-b border-sleek-border bg-sleek-bg flex justify-between items-center flex-wrap gap-4">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-xs font-bold text-sleek-text-muted uppercase tracking-widest">Récapitulatif des Investissements</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {(['All', 'Granite', 'Tuf', 'Common'] as const).map((f) => (
                            <button
                              key={f}
                              onClick={() => setEqFilter(f)}
                              className={cn(
                                "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all border",
                                eqFilter === f 
                                  ? "bg-sleek-primary text-white border-sleek-primary shadow-sm" 
                                  : "bg-white dark:bg-slate-800 text-sleek-text-muted border-sleek-border hover:border-sleek-primary/50"
                              )}
                            >
                              {f === 'All' ? 'Tous' : f}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="bg-sleek-primary/10 text-sleek-primary px-3 py-1 rounded-full text-[10px] font-bold">Total Sélection: {formatCurrency(filteredTotalInvestment)}</span>
                        {eqFilter !== 'All' && (
                          <span className="text-[9px] text-sleek-text-muted font-medium px-2">Sur un total de {formatCurrency(totalInvestment)}</span>
                        )}
                      </div>
                    </div>
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                      <table className="w-full text-left text-[12px]">
                        <thead className="sticky top-0 bg-sleek-card border-b border-sleek-border z-10 shadow-sm">
                          <tr className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-wider">
                            <th className="p-4">Désignation</th>
                            <th className="p-4 text-center">Affectation</th>
                            <th className="p-4 text-right">Coût</th>
                            <th className="p-4 text-center">Durée</th>
                            <th className="p-4 text-right">Amort/an</th>
                            <th className="p-4 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-sleek-border/20">
                          {(["Frais préliminaires & Exploration", "Infrastructures & Bâtiments", "Équipements Lourds & Matériel"] as InvestmentCategory[]).map(cat => {
                            const items = filteredEquipments.filter(e => e.category === cat);
                            const catSubtotal = items.reduce((sum, e) => sum + e.price, 0);
                            if (items.length === 0) return null;
                            return (
                              <React.Fragment key={cat}>
                                <tr className="bg-sleek-bg/50">
                                  <td colSpan={6} className="px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest text-sleek-primary border-y border-sleek-border">{cat}</td>
                                </tr>
                                {items.map(eq => (
                                  <tr key={eq.id} className="hover:bg-sleek-bg/50 transition-colors group">
                                    <td className="p-4 font-semibold text-sleek-text-main pl-8 italic">{eq.designation}</td>
                                    <td className="p-4 text-center">
                                      <span className={cn(
                                        "px-2 py-0.5 rounded text-[9px] font-bold",
                                        eq.allocation === 'Granite' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                                        eq.allocation === 'Tuf' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                                      )}>
                                        {eq.allocation}
                                      </span>
                                    </td>
                                    <td className="p-4 text-right font-mono font-bold text-sleek-text-main">{formatCurrency(eq.price)}</td>
                                    <td className="p-4 text-center text-sleek-text-muted">{eq.duration || '-'}</td>
                                    <td className="p-4 text-right font-mono font-bold text-sleek-accent-red">
                                      {eq.duration > 0 ? formatCurrency(eq.price / eq.duration) : '-'}
                                    </td>
                                    <td className="p-4 text-center">
                                      <button onClick={() => removeEquipment(eq.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash size={14}/></button>
                                    </td>
                                  </tr>
                                ))}
                                <tr className="bg-sleek-bg/20 font-bold border-b border-sleek-border">
                                  <td className="p-3 pl-8 text-[10px] uppercase opacity-60">Sous-total {cat}</td>
                                  <td colSpan={1}></td>
                                  <td className="p-3 text-right font-mono text-sleek-primary">{formatCurrency(catSubtotal)}</td>
                                  <td colSpan={3}></td>
                                </tr>
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                        <tfoot className="sticky bottom-0 bg-sleek-primary text-white font-bold border-t border-sleek-border shadow-[0_-2px_8px_rgba(0,0,0,0.1)]">
                          <tr>
                            <td className="p-4 text-sm font-extrabold uppercase tracking-widest text-white">TOTAL SÉLECTIONNÉ</td>
                            <td colSpan={2} className="p-4 text-right text-sm font-extrabold bg-[#2d7aff]">{formatCurrency(filteredTotalInvestment)}</td>
                            <td></td><td></td><td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Section Amortissements */}
                <div className="flex-1 bg-sleek-card rounded-2xl border border-sleek-border shadow-md overflow-hidden flex flex-col min-h-[400px]">
                   <div className="px-6 py-4 border-b border-sleek-border flex items-center justify-between bg-sleek-bg">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-sleek-text-muted flex items-center gap-2">
                        <TrendingDown size={14} className="text-sleek-accent-red"/> Tableau 02. Amortissements Annuels
                      </h3>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-sleek-accent-red"></div> <span className="text-[10px] font-bold text-sleek-text-muted">Annuité Active</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-gray-200"></div> <span className="text-[10px] font-bold text-sleek-text-muted">Éteint</span></div>
                      </div>
                   </div>
                   <div className="overflow-auto flex-1">
                      <table className="w-full text-[11px] border-collapse min-w-[1100px]">
                        <thead>
                          <tr className="bg-sleek-card border-b border-sleek-border">
                            <th className="p-4 text-left w-56 sticky left-0 bg-sleek-card z-10 border-r border-sleek-border font-bold text-sleek-text-muted uppercase tracking-widest text-[9px]">Équipement</th>
                            {Array.from({length: 10}).map((_, i) => (
                              <th key={i} className="p-4 text-right font-bold text-sleek-text-muted uppercase tracking-widest text-[9px]">Année {i+1}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-sleek-border/20">
                          {filteredAmortResults.rows.map((row, i) => (
                            <tr key={i} className="hover:bg-sleek-bg/50 transition-colors font-mono">
                              <td className="p-4 text-left sticky left-0 bg-sleek-card z-10 border-r border-sleek-border font-sans font-semibold text-sleek-text-muted text-[11px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.05)]">
                                <div className="flex flex-col">
                                  <span>{row.designation}</span>
                                  <span className="text-[8px] opacity-60 uppercase font-bold tracking-tighter">{row.allocation}</span>
                                </div>
                              </td>
                              {row.years.map((val, idx) => (
                                <td key={idx} className={cn("p-4 text-right tabular-nums", val > 0 ? "text-sleek-accent-red font-bold" : "text-gray-200")}>
                                  {val > 0 ? formatCurrency(val) : '—'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="sticky bottom-0 bg-red-900/30 border-t border-red-900/50">
                          <tr className="font-sans font-bold text-sleek-accent-red">
                            <td className="p-5 text-left sticky left-0 bg-sleek-card z-10 border-r border-sleek-border uppercase tracking-widest text-[10px]">
                              {eqFilter === 'All' ? 'Dotation Totale TCR' : `Total Amort. ${eqFilter}`}
                            </td>
                            {Array.from({length: 10}).map((_, i) => {
                              const total = eqFilter === 'All' 
                                ? (filteredAmortResults.annualTotals.granite[i] + filteredAmortResults.annualTotals.tuf[i] + filteredAmortResults.annualTotals.common[i])
                                : (filteredAmortResults.annualTotals[eqFilter.toLowerCase() as keyof SplitCosts][i]);
                              return (
                                <td key={i} className="p-5 text-right text-sm tabular-nums font-extrabold">
                                  {formatCurrency(total)}
                                </td>
                              );
                            })}
                          </tr>
                        </tfoot>
                      </table>
                   </div>
                    <InfoCallout 
                      title="Notes sur l'Amortissement"
                      description="Ce montant est injecté automatiquement dans la ligne DOT. AMORTISS du TCR."
                      className="mt-4"
                    />
                </div>
              </motion.div>
            )}

            {activeTab === 'hr' && (
              <motion.div 
                key="hr" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.98 }} 
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar min-h-0"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 shrink-0">
                  <div className="lg:col-span-4 bg-sleek-card p-6 rounded-2xl border border-sleek-border shadow-md overflow-y-auto max-h-[calc(100vh-220px)] custom-scrollbar">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-sleek-text-main"><UsersRound size={16} className="text-sleek-primary"/> Nouveau Poste</h3>
                    <div className="space-y-4">
                      <InputGroupVertical 
                        label="Désignation du Poste" 
                        value={newRoleName} 
                        onChange={(v) => { setNewRoleName(v); if(newRoleErrors.name) setNewRoleErrors(prev => ({...prev, name: undefined})); }} 
                        error={newRoleErrors.name} 
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <InputGroupVertical 
                          label="Effectif" 
                          value={newRoleCount} 
                          onChange={(v) => { setNewRoleCount(v); if(newRoleErrors.count) setNewRoleErrors(prev => ({...prev, count: undefined})); }} 
                          type="number" 
                          error={newRoleErrors.count} 
                        />
                        <InputGroupVertical 
                          label="Sal. Net" 
                          value={newRoleSalary} 
                          onChange={(v) => { setNewRoleSalary(v); if(newRoleErrors.salary) setNewRoleErrors(prev => ({...prev, salary: undefined})); }} 
                          type="number" 
                          error={newRoleErrors.salary} 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-sleek-text-muted opacity-70 px-1">Affectation</label>
                        <select 
                          value={newRoleAlloc} 
                          onChange={(e) => setNewRoleAlloc(e.target.value as any)}
                          className="w-full bg-sleek-bg/50 border border-sleek-border rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-sleek-primary/10 focus:bg-sleek-card focus:border-sleek-primary transition-all outline-none"
                        >
                          <option value="Granite">Spécifique Granite</option>
                          <option value="Tuf">Spécifique Tuf</option>
                          <option value="Common">Commun (Admin/Garde)</option>
                        </select>
                      </div>
                      <div className="space-y-1.5 flex items-start gap-3 bg-sleek-bg/30 border border-sleek-border p-3 rounded-xl">
                        <input
                          id="newRoleHasExperience"
                          type="checkbox"
                          checked={newRoleHasExperience}
                          onChange={(e) => setNewRoleHasExperience(e.target.checked)}
                          className="w-4 h-4 text-sleek-primary bg-sleek-bg/60 border-sleek-border rounded focus:ring-sleek-primary focus:ring-2 mt-0.5 cursor-pointer"
                        />
                        <div className="flex flex-col">
                          <label htmlFor="newRoleHasExperience" className="text-[11px] font-bold uppercase tracking-wider text-sleek-text-main cursor-pointer select-none">
                            Bénéficie de l'expérience (+{Math.round((hrConfig.experienceRate ?? 0.06) * 100)}%)
                          </label>
                          <span className="text-[9px] text-sleek-text-muted opacity-80 leading-tight">
                            Cochez si ce personnel possède une expérience professionnelle qualifiante pour bénéficier de la majoration de salaire.
                          </span>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-sleek-border space-y-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-sleek-text-muted opacity-60">Paramètres de Masse Salariale</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                           <InputGroupVertical 
                             label="Charges Soc. (%)" 
                             value={socialChargesInput} 
                             onChange={v => {
                               setSocialChargesInput(v);
                               const parsed = parseFloat(v.replace(',', '.'));
                               if (!isNaN(parsed)) {
                                 setHrConfig(prev => ({...prev, socialChargesRate: parsed/100}));
                               }
                             }} 
                             type="text" 
                             formula="Taux des charges patronales (CNAS, etc.) calculé sur le salaire net + primes pour obtenir le coût employeur."
                           />
                           <InputGroupVertical 
                             label="Inflation (%)" 
                             value={annualIncreaseInput} 
                             onChange={v => {
                               setAnnualIncreaseInput(v);
                               const parsed = parseFloat(v.replace(',', '.'));
                               if (!isNaN(parsed)) {
                                 setHrConfig(prev => ({...prev, annualIncreaseRate: parsed/100}));
                               }
                             }} 
                             type="text" 
                             formula="Taux d'augmentation annuel prévu des salaires pour compenser l'inflation du coût de la vie."
                           />
                           <InputGroupVertical 
                             label="Prime Expérience (%)" 
                             value={experienceRateInput} 
                             onChange={v => {
                               setExperienceRateInput(v);
                               const parsed = parseFloat(v.replace(',', '.'));
                               if (!isNaN(parsed)) {
                                 setHrConfig(prev => ({...prev, experienceRate: parsed/100}));
                               }
                             }} 
                             type="text" 
                             formula="Pourcentage additionnel ajouté au salaire mensuel de base du personnel identifié comme ayant de l'expérience (ex: 6%)."
                           />
                        </div>
                      </div>
                      <button onClick={addRole} className="w-full py-4 bg-sleek-primary text-white rounded-2xl shadow-lg shadow-sleek-primary/20 transition-all hover:scale-[1.02] active:scale-95 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 group">
                        <PlusCircle size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                        Recruter le Personnel
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-8 bg-sleek-card rounded-2xl border border-sleek-border shadow-md overflow-hidden flex flex-col max-h-[calc(100vh-220px)]">
                    <div className="px-6 py-4 border-b border-sleek-border bg-sleek-bg flex justify-between items-center">
                      <h3 className="text-xs font-bold text-sleek-text-muted uppercase tracking-widest">Tableau RH. Liste du Personnel</h3>
                      <span className="bg-sleek-primary/10 text-sleek-primary px-3 py-1 rounded-full text-[10px] font-bold">{roles.length} Catégories</span>
                    </div>
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                      <table className="w-full text-left text-[12px]">
                        <thead className="sticky top-0 bg-sleek-card border-b border-sleek-border z-10 shadow-sm">
                          <tr className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-wider">
                            <th className="p-4">Désignation</th>
                            <th className="p-4 text-center">Effectif</th>
                            <th className="p-4 text-right">Salaire Base (DA)</th>
                            <th className="p-4 text-center">Expérience</th>
                            <th className="p-4 text-right">Salaire Ajusté (DA)</th>
                            <th className="p-4 text-right">Coût Annuel Brut (DA)</th>
                            <th className="p-4 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-sleek-border/20">
                          {roles.map(role => {
                            const expRate = hrConfig.experienceRate ?? 0.06;
                            const hasExp = role.hasExperience ?? false;
                            const finalMonthly = hasExp ? role.monthlySalary * (1 + expRate) : role.monthlySalary;
                            const annual = role.count * finalMonthly * 12 * (1 + hrConfig.socialChargesRate);
                            return (
                              <tr key={role.id} className="hover:bg-sleek-bg/50 transition-colors">
                                <td className="p-4 font-semibold text-sleek-text-main">
                                  <div>{role.designation}</div>
                                  <div className="text-[9px] opacity-60 mt-0.5">
                                    <span className="px-1.5 py-0.2 bg-sleek-bg border border-sleek-border rounded text-[8px] uppercase font-bold tracking-wider">{role.allocation}</span>
                                  </div>
                                </td>
                                <td className="p-4 text-center">{role.count}</td>
                                <td className="p-4 text-right font-mono">{formatCurrency(role.monthlySalary)}</td>
                                <td className="p-4 text-center">
                                  {hasExp ? (
                                    <span className="text-sleek-primary font-bold bg-sleek-primary/10 px-2.5 py-1 rounded-lg text-[10px] uppercase font-mono">
                                      Oui (+{Math.round(expRate * 100)}%)
                                    </span>
                                  ) : (
                                    <span className="text-sleek-text-muted opacity-60 italic">Non</span>
                                  )}
                                </td>
                                <td className="p-4 text-right font-mono font-semibold">{formatCurrency(finalMonthly)}</td>
                                <td className="p-4 text-right font-mono font-bold text-sleek-primary">{formatCurrency(annual)}</td>
                                <td className="p-4 text-center">
                                  <button onClick={() => removeRole(role.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><Trash size={14}/></button>
                                </td>
                              </tr>
                            );
                          })}
                          {roles.length === 0 && (
                            <tr><td colSpan={7} className="p-10 text-center text-sleek-text-muted italic">Aucun personnel enregistré.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Section Masse Salariale */}
                <div className="flex-1 bg-sleek-card rounded-2xl border border-sleek-border shadow-md overflow-hidden flex flex-col min-h-[300px]">
                   <div className="px-6 py-4 border-b border-sleek-border bg-sleek-bg flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-sleek-text-muted">Projection de la Masse Salariale sur 10 ans</h3>
                      <div className="text-[10px] font-bold text-sleek-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">Injection Directe TCR</div>
                   </div>
                   <div className="overflow-auto flex-1 p-6">
                      <div className="grid grid-cols-10 gap-3">
                         {Array.from({length: 10}).map((_, i) => (
                           <div key={i} className="flex flex-col gap-2 p-3 bg-sleek-bg/50 rounded-xl border border-sleek-border items-center justify-center">
                              <span className="text-[9px] font-bold text-sleek-text-muted">Année {i+1}</span>
                              <span className="text-[11px] font-mono font-bold text-sleek-primary truncate w-full text-center">{formatCurrency(hrTotals.granite[i] + hrTotals.tuf[i] + hrTotals.common[i])}</span>
                           </div>
                         ))}
                      </div>
                      <InfoCallout 
                        title="Intégration Masse Salariale"
                        description="Ce montant est injecté automatiquement dans la ligne PERSONNEL du TCR."
                        className="mt-6"
                      />
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'ops' && (
              <motion.div 
                key="ops" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.98 }} 
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar min-h-0"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 shrink-0">
                  <div className="lg:col-span-4 bg-sleek-card p-6 rounded-2xl border border-sleek-border shadow-md overflow-y-auto max-h-[calc(100vh-220px)] custom-scrollbar">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-sleek-text-main"><Fuel size={16} className="text-sleek-primary"/> Calculateur de Carburant</h3>
                    <div className="space-y-4">
                      <div className="bg-sleek-bg p-4 rounded-xl border border-sleek-border space-y-4">
                        <InputGroupVertical 
                          label="Prix du Litre (DA/L)" 
                          value={(opConfig.fuelPrice ?? 0).toString()} 
                          onChange={v => setOpConfig({...opConfig, fuelPrice: Number(v)})} 
                          type="number" 
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <InputGroupVertical 
                            label="Heures/Jour (Défaut)" 
                            value={(opConfig.hoursPerDay ?? 0).toString()} 
                            onChange={v => setOpConfig({...opConfig, hoursPerDay: Number(v)})} 
                            type="number" 
                          />
                          <InputGroupVertical 
                            label="Jours/An (Défaut)" 
                            value={(opConfig.workDaysPerYear ?? 0).toString()} 
                            onChange={v => setOpConfig({...opConfig, workDaysPerYear: Number(v)})} 
                            type="number" 
                          />
                        </div>
                        <InputGroupVertical 
                          label="Inflation Annuelle (%)" 
                          value={(opConfig.annualInflationRate ?? 0).toString()} 
                          onChange={v => setOpConfig({...opConfig, annualInflationRate: Number(v)})} 
                          type="number" 
                        />
                      </div>

                      <div className="pt-4 border-t border-sleek-border">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-sleek-text-muted opacity-60 mb-4 font-serif italic flex items-center gap-2"><PlusCircle size={12}/> Ajouter un Engin</h4>
                        <div className="space-y-4">
                            <InputGroupVertical 
                              label="Désignation de l'Engin" 
                              value={newOpName} 
                              onChange={(v) => { setNewOpName(v); if(newOpErrors.name) setNewOpErrors(prev => ({...prev, name: undefined})); }} 
                              error={newOpErrors.name} 
                            />
                            <div className="grid grid-cols-2 gap-4">
                               <InputGroupVertical 
                                 label="Puissance (kW)" 
                                 value={newOpPower} 
                                 onChange={(v) => { setNewOpPower(v); if(newOpErrors.power) setNewOpErrors(prev => ({...prev, power: undefined})); }} 
                                 type="number" 
                                 error={newOpErrors.power} 
                               />
                               <InputGroupVertical 
                                 label="Nombre de machines" 
                                 value={newOpCount} 
                                 onChange={(v) => { setNewOpCount(v); if(newOpErrors.count) setNewOpErrors(prev => ({...prev, count: undefined})); }} 
                                 type="number" 
                                 error={newOpErrors.count} 
                               />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <InputGroupVertical 
                                 label="Conso (L/kWh)" 
                                 value={newOpConsRate} 
                                 onChange={(v) => { setNewOpConsRate(v); if(newOpErrors.consRate) setNewOpErrors(prev => ({...prev, consRate: undefined})); }} 
                                 type="number" 
                                 error={newOpErrors.consRate} 
                               />
                               <InputGroupVertical 
                                 label="Coef Utilisation (0..1)" 
                                 value={newOpUtilCoef} 
                                 onChange={(v) => { setNewOpUtilCoef(v); if(newOpErrors.utilCoef) setNewOpErrors(prev => ({...prev, utilCoef: undefined})); }} 
                                 type="number" 
                                 error={newOpErrors.utilCoef} 
                               />
                            </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-sleek-text-muted opacity-70 px-1">Affectation TCR</label>
                              <select 
                                value={newOpAlloc} 
                                onChange={(e) => setNewOpAlloc(e.target.value as any)}
                              className="w-full bg-sleek-bg/50 border border-sleek-border rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-sleek-primary/10 focus:bg-sleek-card focus:border-sleek-primary transition-all outline-none"
                            >
                              <option value="Granite">Uniquement Granite</option>
                              <option value="Tuf">Uniquement Tuf</option>
                              <option value="Common">Utilisation Commune</option>
                            </select>
                         </div>
                      </div>
                    </div>
                    <button onClick={addMachine} className="w-full py-4 bg-sleek-primary text-white rounded-2xl shadow-lg shadow-sleek-primary/20 transition-all hover:scale-[1.02] active:scale-95 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 group">
                      <PlusCircle size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                      Enregistrer l'Engin
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-8 bg-sleek-card rounded-2xl border border-sleek-border shadow-md overflow-hidden flex flex-col max-h-[calc(100vh-220px)]">
                  <div className="px-6 py-4 border-b border-sleek-border bg-sleek-bg flex justify-between items-center">
                    <h3 className="text-xs font-bold text-sleek-text-muted uppercase tracking-widest flex items-center gap-2"><Wrench size={14}/> Parc d'Équipement Actif</h3>
                    <div className="flex items-center gap-3">
                      <span className="bg-sleek-primary/10 text-sleek-primary px-3 py-1 rounded-full text-[10px] font-bold">{machines.length} Machines</span>
                    </div>
                  </div>
                  <div className="overflow-y-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left text-[12px]">
                      <thead className="sticky top-0 bg-sleek-card border-b border-sleek-border z-10 shadow-sm">
                        <tr className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-wider">
                          <th className="p-4">Machine (Type)</th>
                          <th className="p-4 text-center">Puissance / Nbre</th>
                          <th className="p-4 text-center">L/kWh</th>
                          <th className="p-4 text-right">L / heure</th>
                          <th className="p-4 text-right">L / jour</th>
                          <th className="p-4 text-right">L / an</th>
                          <th className="p-4 text-right">Coût (DA/an)</th>
                          <th className="p-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sleek-border/20">
                        {machines.map(m => {
                          const consoLh = m.powerKw * m.consumptionRate * m.utilizationCoef;
                          const consoTotalLh = consoLh * m.count;
                          const consoTotalLjour = consoTotalLh * m.hoursPerDay;
                          const annualLitres = consoTotalLjour * m.workDaysPerYear;
                          const annualCost = annualLitres * opConfig.fuelPrice;
                          return (
                            <tr key={m.id} className="hover:bg-sleek-bg/50 transition-colors">
                              <td className="p-4">
                                <div className="font-semibold text-sleek-text-main">{m.designation}</div>
                                <div className="text-[9px] text-sleek-text-muted font-bold uppercase tracking-tighter">
                                  {m.hoursPerDay}h/j • {m.workDaysPerYear}j/an
                                </div>
                              </td>
                              <td className="p-4 text-center text-[11px]">{m.powerKw} kW × {m.count}</td>
                              <td className="p-4 text-center text-sleek-text-muted font-mono text-[11px]">{m.consumptionRate} (coef {m.utilizationCoef})</td>
                              <td className="p-4 text-right font-mono font-bold text-sleek-primary">{consoTotalLh.toLocaleString()}</td>
                              <td className="p-4 text-right font-mono font-bold text-blue-400">{consoTotalLjour.toLocaleString()}</td>
                              <td className="p-4 text-right font-mono font-bold text-emerald-500">{annualLitres.toLocaleString()}</td>
                              <td className="p-4 text-right font-mono font-extrabold text-sleek-accent-green">{formatCurrency(annualCost)}</td>
                              <td className="p-4 text-center">
                                <button onClick={() => removeMachine(m.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><Trash size={14}/></button>
                              </td>
                            </tr>
                          );
                        })}
                        {machines.length === 0 && (
                          <tr><td colSpan={8} className="p-10 text-center text-sleek-text-muted italic text-sm">Aucun engin d'exploitation enregistré. Ajoutez des machines pour calculer le carburant.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {/* Foot summary table info */}
                  {machines.length > 0 && (
                    <div className="bg-sleek-card text-sleek-text-main p-6 grid grid-cols-3 gap-6 border-t border-sleek-border shadow-inner">
                      <div className="flex flex-col group relative cursor-help">
                         <span className="text-[10px] text-sleek-text-muted uppercase font-black tracking-widest mb-1 flex items-center gap-1.5">
                          Débit Total (L / Heure) <Info size={10}/>
                         </span>
                         <span className="text-xl font-mono font-bold text-sky-400">
                            {machines.reduce((acc, m) => acc + (m.powerKw * m.consumptionRate * m.utilizationCoef * m.count), 0).toLocaleString()} <span className="text-xs font-sans opacity-60">L / h</span>
                         </span>
                         <FormulaTooltip formula="Σ (Puis. × Conso. × Coef. × Nombre)" />
                      </div>
                      <div className="flex flex-col group relative cursor-help">
                         <span className="text-[10px] text-sleek-text-muted uppercase font-black tracking-widest mb-1 flex items-center gap-1.5">
                          Consommation / Jour (L / Jour) <Info size={10}/>
                         </span>
                         <span className="text-xl font-mono font-bold text-blue-400">
                            {machines.reduce((acc, m) => acc + (m.powerKw * m.consumptionRate * m.utilizationCoef * m.count * m.hoursPerDay), 0).toLocaleString()} <span className="text-xs font-sans opacity-60">L / jour</span>
                         </span>
                         <FormulaTooltip formula="Σ (L/h_machine × h/jour_machine)" />
                      </div>
                      <div className="flex flex-col group relative cursor-help">
                         <span className="text-[10px] text-sleek-text-muted uppercase font-black tracking-widest mb-1 flex items-center gap-1.5">
                          Volume Annuel Estimé (L / An) <Info size={10}/>
                         </span>
                         <span className="text-xl font-mono font-bold text-emerald-400">
                            {machines.reduce((acc, m) => acc + (m.powerKw * m.consumptionRate * m.utilizationCoef * m.count * m.hoursPerDay * m.workDaysPerYear), 0).toLocaleString()} <span className="text-xs font-sans opacity-60">L / an</span>
                         </span>
                         <FormulaTooltip formula="Σ (L/jour_machine × jours/an_machine)" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section Projection Carburant */}
              <div className="flex-1 bg-sleek-card rounded-2xl border border-sleek-border shadow-md overflow-hidden flex flex-col min-h-[400px]">
                 <div className="px-6 py-4 border-b border-sleek-border bg-sleek-bg flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-sleek-text-muted">Projection Carburant sur 10 ans (Injection Automatique TCR)</h3>
                    <div className="bg-amber-900/40 text-amber-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                      <Activity size={12}/> Inflation de {opConfig.annualInflationRate}% active
                    </div>
                 </div>
                 <div className="overflow-auto flex-1 p-6 flex flex-col">
                    <div className="grid grid-cols-10 gap-3 min-w-[900px]">
                       {calculatedYears.map((y, i) => (
                         <div key={i} className="flex flex-col gap-2 p-3 bg-sleek-bg/50 rounded-xl border border-sleek-border items-center">
                            <span className="text-[9px] font-bold text-sleek-text-muted">Année {i+1}</span>
                            <div className="text-[10px] font-mono font-bold text-sleek-primary">{formatCurrency(opResults.fuel.granite[i] + opResults.fuel.tuf[i] + opResults.fuel.common[i])}</div>
                         </div>
                       ))}
                    </div>
                    <InfoCallout 
                       title="Note Technique sur l'intégration TCR"
                       description={
                         <>
                           Le coût annuel du carburant calculé ci-dessus est injecté <b>automatiquement</b> dans la ligne <span className="font-bold underline text-sleek-primary">Matières & Consommables</span> du TCR.
                           Si vous saisissez manuellement une valeur dans le TCR, elle sera additionnée au coût du carburant pour refléter les autres intrants (explosifs, lubrifiants, etc.).
                         </>
                       }
                       className="mt-8"
                    />
                 </div>
              </div>
              </motion.div>
            )}

            {activeTab === 'elec' && (
              <motion.div 
                key="elec" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.98 }} 
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar min-h-0"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 shrink-0">
                  <div className="lg:col-span-4 bg-sleek-card p-6 rounded-2xl border border-sleek-border shadow-md overflow-y-auto max-h-[calc(100vh-220px)] custom-scrollbar">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-sleek-text-main"><Zap size={16} className="text-sleek-primary"/> Électricité par Groupes</h3>
                    <div className="space-y-4">
                      <div className="bg-sleek-bg p-4 rounded-xl border border-sleek-border space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <InputGroupVertical 
                            label="Heures/Jour (Défaut)" 
                            value={(electricityConfig.hoursPerDay ?? 8).toString()} 
                            onChange={v => setElectricityConfig({...electricityConfig, hoursPerDay: Number(v)})} 
                            type="number" 
                          />
                          <InputGroupVertical 
                            label="Jours/An (Défaut)" 
                            value={(electricityConfig.workDaysPerYear ?? 250).toString()} 
                            onChange={v => setElectricityConfig({...electricityConfig, workDaysPerYear: Number(v)})} 
                            type="number" 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <InputGroupVertical 
                            label="Cos φ" 
                            value={(electricityConfig.cosPhi ?? 0.8).toString()} 
                            onChange={v => setElectricityConfig({...electricityConfig, cosPhi: Number(v)})} 
                            type="number" 
                          />
                          <InputGroupVertical 
                            label="kVA / Groupe" 
                            value={(electricityConfig.kvaPerGroup ?? 500).toString()} 
                            onChange={v => setElectricityConfig({...electricityConfig, kvaPerGroup: Number(v)})} 
                            type="number" 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <InputGroupVertical 
                            label="Prix Diesel (DA/L)" 
                            value={(opConfig.fuelPrice ?? 29).toString()} 
                            onChange={v => setOpConfig({...opConfig, fuelPrice: Number(v)})} 
                            type="number" 
                          />
                          <InputGroupVertical 
                            label="Conso Grp (L/kWh)" 
                            value={(electricityConfig.specificConsumption ?? 0.3).toString()} 
                            onChange={v => setElectricityConfig({...electricityConfig, specificConsumption: Number(v)})} 
                            type="number" 
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-sleek-border">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-sleek-text-muted opacity-60 mb-4 font-serif italic flex items-center gap-2"><PlusCircle size={12}/> Ajouter un Poste de Consommation</h4>
                        <div className="space-y-4">
                            <InputGroupVertical 
                              label="Désignation" 
                              value={newElecName} 
                              onChange={(v) => { setNewElecName(v); if(newElecErrors.name) setNewElecErrors(prev => ({...prev, name: undefined})); }} 
                              error={newElecErrors.name} 
                            />
                            <div className="grid grid-cols-2 gap-4">
                               <InputGroupVertical 
                                 label="Puissance Puis. (kW)" 
                                 value={newElecPower} 
                                 onChange={(v) => { setNewElecPower(v); if(newElecErrors.power) setNewElecErrors(prev => ({...prev, power: undefined})); }} 
                                 type="number" 
                                 formula="Puissance nominale de l'équipement électrique (moteurs, pompes, éclairage, etc.)." 
                                 error={newElecErrors.power} 
                               />
                               <InputGroupVertical 
                                 label="Nombre" 
                                 value={newElecCount} 
                                 onChange={(v) => { setNewElecCount(v); if(newElecErrors.count) setNewElecErrors(prev => ({...prev, count: undefined})); }} 
                                 type="number" 
                                 formula="Nombre d'équipements identiques sur ce poste." 
                                 error={newElecErrors.count} 
                               />
                            </div>
                            <InputGroupVertical 
                              label="Coef Utilisation (0..1)" 
                              value={newElecUtilCoef} 
                              onChange={(v) => { setNewElecUtilCoef(v); if(newElecErrors.utilCoef) setNewElecErrors(prev => ({...prev, utilCoef: undefined})); }} 
                              type="number" 
                              formula="Facteur de charge moyen représentant l'utilisation réelle de la puissance nominale." 
                              error={newElecErrors.utilCoef} 
                            />
                         </div>
                      </div>
                      <button onClick={addElectricityLine} className="w-full py-3.5 bg-sleek-primary text-white rounded-xl shadow-lg shadow-sleek-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-sm tracking-wide mt-4 flex items-center justify-center gap-2">
                        <PlusCircle size={18}/> Ajouter au Bilan de Puissance
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-8 bg-sleek-card rounded-2xl border border-sleek-border shadow-md overflow-hidden flex flex-col max-h-[calc(100vh-220px)]">
                    <div className="px-6 py-4 border-b border-sleek-border bg-sleek-bg flex justify-between items-center">
                      <h3 className="text-xs font-bold text-sleek-text-muted uppercase tracking-widest flex items-center gap-2"><Activity size={14}/> Bilan de Puissance</h3>
                      <div className="flex items-center gap-3">
                        <span className="bg-sleek-primary/10 text-sleek-primary px-3 py-1 rounded-full text-[10px] font-bold">{electricityLines.length} Postes</span>
                      </div>
                    </div>
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                      <table className="w-full text-left text-[12px]">
                        <thead className="sticky top-0 bg-sleek-card border-b border-sleek-border z-10 shadow-sm">
                          <tr className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-wider">
                            <th className="p-4">Désignation</th>
                            <th className="p-4 text-center">Puissance unitaire (kW)</th>
                            <th className="p-4 text-center">Nombre</th>
                            <th className="p-4 text-center">Coef. Util.</th>
                            <th className="p-4 text-right text-sleek-primary">P_ligne (kW)</th>
                            <th className="p-4 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-sleek-border/20">
                          {electricityLines.map(l => {
                            const pLine = l.powerKw * l.count * l.utilizationCoef;
                            return (
                              <tr key={l.id} className="hover:bg-sleek-bg/50 transition-colors">
                                <td className="p-4">
                                  <div className="font-semibold text-sleek-text-main">{l.designation}</div>
                                  <div className="text-[9px] text-sleek-text-muted font-bold uppercase tracking-tighter">
                                    {l.hoursPerDay}h/j • {l.workDaysPerYear}j/an
                                  </div>
                                </td>
                                <td className="p-4 text-center">{l.powerKw} kW</td>
                                <td className="p-4 text-center">{l.count}</td>
                                <td className="p-4 text-center text-sleek-text-muted font-mono">{l.utilizationCoef}</td>
                                <td className="p-4 text-right font-mono font-bold text-sleek-primary">{pLine.toLocaleString()} kW</td>
                                <td className="p-4 text-center">
                                  <button onClick={() => removeElectricityLine(l.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><Trash size={14}/></button>
                                </td>
                              </tr>
                            );
                          })}
                          {electricityLines.length === 0 && (
                            <tr><td colSpan={6} className="p-10 text-center text-sleek-text-muted italic text-sm">Aucun poste de consommation défini.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Summary Footer for Electricity */}
                    {electricityLines.length > 0 && (
                      <div className="bg-sleek-card text-sleek-text-main p-6 grid grid-cols-2 lg:grid-cols-4 gap-6 border-t border-sleek-border shadow-inner shrink-0">
                        {(() => {
                          const pTotal = electricityLines.reduce((acc, l) => acc + (l.powerKw * l.count * l.utilizationCoef), 0);
                          const sTotal = pTotal / electricityConfig.cosPhi;
                          const nGroups = Math.ceil(sTotal / electricityConfig.kvaPerGroup);
                          
                          const energyAn = electricityLines.reduce((acc, l) => {
                            const pLine = l.powerKw * l.count * l.utilizationCoef;
                            return acc + (pLine * l.hoursPerDay * l.workDaysPerYear);
                          }, 0);

                          const litresAn = energyAn * electricityConfig.specificConsumption;
                          const costAn = litresAn * opConfig.fuelPrice;

                          return (
                            <>
                              <div className="flex flex-col">
                                 <span className="text-[9px] text-sleek-text-muted uppercase font-bold tracking-widest mb-1">Puissance Apparente</span>
                                 <span className="text-lg font-mono font-bold text-sky-400">{sTotal.toFixed(0)} <span className="text-[10px] font-sans opacity-60">kVA</span></span>
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-[9px] text-sleek-text-muted uppercase font-bold tracking-widest mb-1">Dimensionnement</span>
                                 <span className="text-lg font-mono font-bold text-blue-400">{nGroups} <span className="text-[10px] font-sans opacity-60">GE de {electricityConfig.kvaPerGroup}kVA</span></span>
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-[9px] text-sleek-text-muted uppercase font-bold tracking-widest mb-1">Énergie Annuelle</span>
                                 <span className="text-lg font-mono font-bold text-amber-400">{energyAn.toLocaleString()} <span className="text-[10px] font-sans opacity-60">kWh/an</span></span>
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-[9px] text-emerald-400 uppercase font-black tracking-widest mb-1">Coût Diesel Estimé</span>
                                 <span className="text-lg font-mono font-bold text-sleek-accent-green">{formatCurrency(costAn)} <span className="text-[10px] font-sans opacity-60">DA/an</span></span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Section Projection Électricité */}
                <div className="flex-1 bg-sleek-card rounded-2xl border border-sleek-border shadow-md overflow-hidden flex flex-col min-h-[400px]">
                   <div className="px-6 py-4 border-b border-sleek-border bg-sleek-bg flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-sleek-text-muted">Projection Coût Électricité (Groupes) sur 10 ans</h3>
                      <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <Check size={12}/> Injection TCR Activée
                      </div>
                   </div>
                   <div className="overflow-auto flex-1 p-6 flex flex-col">
                      <div className="grid grid-cols-10 gap-3 min-w-[900px]">
                         {calculatedYears.map((y, i) => (
                           <div key={i} className="flex flex-col gap-2 p-3 bg-sleek-bg/50 rounded-xl border border-sleek-border items-center">
                              <span className="text-[9px] font-bold text-sleek-text-muted">Année {i+1}</span>
                              <div className="text-[10px] font-mono font-bold text-sleek-primary">{formatCurrency(electricityResults.granite[i] + electricityResults.tuf[i] + electricityResults.common[i])}</div>
                           </div>
                         ))}
                      </div>
                       <InfoCallout 
                         icon={Zap}
                         title="Configuration Zone Non Électrifiée"
                         description={
                           <>
                              En l'absence de réseau Sonelgaz, l'énergie est produite exclusivement sur site. 
                              La consommation de diesel des groupes (<b>{electricityConfig.specificConsumption} L/kWh</b>) est convertie en coût monétaire et s'ajoute au carburant des engins.
                              Le dimensionnement suggéré est de <b>{Math.ceil((electricityLines.reduce((acc, l) => acc + (l.powerKw * l.count * l.utilizationCoef), 0) / electricityConfig.cosPhi) / electricityConfig.kvaPerGroup)} groupes de {electricityConfig.kvaPerGroup} kVA</b> pour couvrir la pointe de { (electricityLines.reduce((acc, l) => acc + (l.powerKw * l.count * l.utilizationCoef), 0) / electricityConfig.cosPhi).toFixed(0) } kVA.
                           </>
                         }
                         className="mt-8"
                       />
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'acc' && (
              <motion.div 
                key="acc" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.98 }} 
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar min-h-0 relative"
              >
                {/* 1. Diamond Wire Modal Overlay */}
                <AnimatePresence>
                  {isDiamondModalOpen && (
                    <motion.div 
                      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 pointer-events-auto"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.div 
                        className="bg-sleek-card rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border border-sleek-border pointer-events-auto cursor-default"
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                         <div className="bg-sleek-primary p-6 text-white flex justify-between items-center select-none">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Calculator size={20}/></div>
                               <div>
                                  <h3 className="text-sm font-bold tracking-tight">Calcul consommation Fil diamanté</h3>
                                  <p className="text-[10px] opacity-70 font-medium uppercase tracking-wider">Paramètres de production extraction</p>
                               </div>
                            </div>
                            <button onClick={() => setIsDiamondModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition-all"><X size={18}/></button>
                         </div>
                         
                         <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1">
                               <InputGroupVertical label="Désignation de la machine / Poste" value={dmDesignation} onChange={setDmDesignation} />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                               <InputGroupVertical label="Vs : Vitesse de sciage (m²/h)" value={dmVs} onChange={setDmVs} type="number" formula="Vitesse de coupe nette de la machine sur le matériau concerné." error={diamondErrors.vs} />
                               <InputGroupVertical label="Cfu : Conso. unitaire (m/m²)" value={dmCfu} onChange={setDmCfu} type="number" formula="Coefficient d'usure du fil diamanté (longueur de fil perdue par surface découpée)." error={diamondErrors.cfu} />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                               <InputGroupVertical label="Heures / jour (h/j)" value={dmHj} onChange={setDmHj} type="number" formula="Temps de fonctionnement quotidien effectif." error={diamondErrors.hj} />
                               <InputGroupVertical label="Jours / an (j/an)" value={dmJa} onChange={setDmJa} type="number" formula="Nombre de jours ouvrables sur l'année d'exploitation." error={diamondErrors.ja} />
                            </div>
                            <div className="grid grid-cols-2 gap-6 items-end">
                               <InputGroupVertical label="Nombre de machines (N)" value={dmN} onChange={setDmN} type="number" error={diamondErrors.n} />
                               <div className="space-y-2">
                                  <label className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-wider ml-1">Affectation</label>
                                  <select 
                                   value={dmAlloc} 
                                   onChange={(e) => setDmAlloc(e.target.value as any)}
                                   className="w-full bg-sleek-bg/50 border border-sleek-border rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-sleek-primary/10 focus:bg-sleek-card focus:border-sleek-primary transition-all outline-none"
                                 >
                                   <option value="Granite">Uniquement Granite</option>
                                   <option value="Tuf">Uniquement Tuf</option>
                                   <option value="Common">Utilisation Commune</option>
                                 </select>
                               </div>
                            </div>

                            <div className="bg-sleek-card rounded-2xl p-6 border border-sleek-border space-y-4">
                               <div className="flex justify-between items-center border-b border-sleek-border pb-3">
                                  <span className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-widest text-left">Résultats Intermédiaires</span>
                               </div>
                               <div className="grid grid-cols-3 gap-4">
                                  <div className="space-y-1">
                                     <div className="text-[9px] font-bold text-sleek-text-muted uppercase tracking-tighter">Conso. Heure</div>
                                     <div className="text-sm font-mono font-black text-sleek-text-main">{(Number(dmVs) * Number(dmCfu)).toFixed(2)} <span className="text-[10px] font-medium opacity-40">m/h</span></div>
                                  </div>
                                  <div className="space-y-1">
                                     <div className="text-[9px] font-bold text-sleek-text-muted uppercase tracking-tighter">Conso. Jour</div>
                                     <div className="text-sm font-mono font-black text-sleek-text-main">{(Number(dmVs) * Number(dmCfu) * Number(dmHj)).toFixed(1)} <span className="text-[10px] font-medium opacity-40">m/j</span></div>
                                  </div>
                                  <div className="space-y-1 p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                     <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter">Consommation Annuelle</div>
                                     <div className="text-lg font-mono font-black text-emerald-500">
                                        {formatCompact(Number(dmVs) * Number(dmCfu) * Number(dmHj) * Number(dmJa) * Number(dmN))} <span className="text-[10px] font-medium opacity-60">m/an</span>
                                     </div>
                                  </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-2">
                               <button 
                                 onClick={() => setIsDiamondModalOpen(false)}
                                 className="flex-1 py-4 px-6 border-2 border-sleek-border rounded-2xl text-sleek-text-muted font-bold text-sm tracking-wide hover:bg-sleek-bg transition-all active:scale-[0.98]"
                               >
                                 Annuler
                               </button>
                               <button 
                                 onClick={applyDiamondCalculation}
                                 className="flex-[2] py-4 px-6 bg-sleek-primary text-white rounded-2xl font-bold text-sm tracking-wide shadow-xl shadow-sleek-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                               >
                                 Appliquer le Calcul
                               </button>
                            </div>
                         </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 2. Special Card: Fil Diamanté */}
                <div className="bg-sleek-card p-8 rounded-[32px] border border-sleek-border shadow-xl relative overflow-hidden group mb-4 shrink-0 select-text">
                   <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                      <Zap size={120} strokeWidth={1} className="text-sleek-primary"/>
                   </div>
                   
                   <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                      <div className="space-y-1">
                         <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-sleek-primary/10 text-sleek-primary rounded-2xl flex items-center justify-center"><Zap size={24}/></div>
                            <div>
                               <h2 className="text-xl font-black text-sleek-text-main tracking-tight">Fil diamanté (Configurateur)</h2>
                               <p className="text-xs font-semibold text-sleek-text-muted">Ajouter des postes de consommation spécifiques</p>
                            </div>
                         </div>
                         <div className="mt-4 flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-sky-100 text-sky-600 rounded text-[9px] font-black tracking-widest uppercase flex items-center gap-1"><Settings size={10}/> Mode Déterminé</span>
                         </div>
                      </div>

                      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                         <div className="space-y-2">
                            <InputGroupVertical label="Désignation" value={dmDesignation} onChange={setDmDesignation} />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-wider ml-1">Affectation</label>
                            <select 
                             value={dmAlloc} 
                             onChange={(e) => setDmAlloc(e.target.value as any)}
                             className="w-full bg-sleek-bg border border-sleek-border rounded-2xl px-4 py-3.5 text-sm font-semibold focus:ring-4 focus:ring-sleek-primary/10 focus:bg-sleek-card focus:border-sleek-primary transition-all outline-none"
                           >
                             <option value="Granite">Granite</option>
                             <option value="Tuf">Tuf</option>
                             <option value="Common">Commune</option>
                           </select>
                         </div>
                         <div className="space-y-2">
                            <div className="relative">
                               <InputGroupVertical 
                                 label="Consommation (m/an)" 
                                 value={dmQty === '0' ? '' : dmQty} 
                                 onChange={setDmQty} 
                                 type="number" 
                               />
                               <button 
                                 onClick={() => setIsDiamondModalOpen(true)}
                                 className="absolute right-2 top-[30px] w-10 h-10 bg-sleek-card border border-sleek-border rounded-xl flex items-center justify-center text-sleek-primary shadow-sm hover:bg-sleek-primary hover:text-white transition-all z-10"
                                 title="Ouvrir le calculateur"
                               >
                                  <Calculator size={18}/>
                               </button>
                            </div>
                         </div>
                         <div className="space-y-2">
                            <InputGroupVertical 
                              label="Prix Unitaire (DA/m)" 
                              value={dmUnitPrice === '0' ? '' : dmUnitPrice} 
                              onChange={setDmUnitPrice} 
                              type="number" 
                            />
                         </div>
                         <div className="flex items-end">
                            <button 
                              onClick={addDiamondAccessory}
                              className="w-full h-[60px] bg-sleek-primary text-white rounded-[24px] flex items-center justify-center gap-3 font-black text-sm tracking-widest shadow-lg shadow-sleek-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                               <PlusCircle size={18}/> AJOUTER
                            </button>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 shrink-0 min-w-0">
                  <div className="lg:col-span-4 bg-sleek-card p-6 rounded-2xl border border-sleek-border shadow-md h-fit min-w-0">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-sleek-text-main"><PlusCircle size={16} className="text-sleek-primary"/> Ajouter un Accessoire</h3>
                    <div className="space-y-4">
                      <div className="bg-sleek-bg p-4 rounded-xl border border-sleek-border space-y-4">
                        <InputGroupVertical 
                          label="Désignation" 
                          value={newAccName} 
                          onChange={(v) => { setNewAccName(v); if(newAccErrors.name) setNewAccErrors(prev => ({...prev, name: undefined})); }} 
                          error={newAccErrors.name} 
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <InputGroupVertical 
                            label="Quantité / An" 
                            value={newAccQty} 
                            onChange={(v) => { setNewAccQty(v); if(newAccErrors.qty) setNewAccErrors(prev => ({...prev, qty: undefined})); }} 
                            type="number" 
                            error={newAccErrors.qty} 
                          />
                          <InputGroupVertical label="Unité" value={newAccUnit} onChange={setNewAccUnit} />
                        </div>
                        <InputGroupVertical 
                          label="Prix Unitaire (DA/Unité)" 
                          value={newAccPrice} 
                          onChange={(v) => { setNewAccPrice(v); if(newAccErrors.price) setNewAccErrors(prev => ({...prev, price: undefined})); }} 
                          type="number" 
                          error={newAccErrors.price} 
                        />
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-wider ml-1">Affectation</label>
                           <select 
                            value={newAccAlloc} 
                            onChange={(e) => setNewAccAlloc(e.target.value as any)}
                            className="w-full bg-sleek-bg border border-sleek-border rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-sleek-primary/10 focus:bg-sleek-card focus:border-sleek-primary transition-all outline-none"
                          >
                            <option value="Granite">Uniquement Granite</option>
                            <option value="Tuf">Uniquement Tuf</option>
                            <option value="Common">Utilisation Commune</option>
                          </select>
                        </div>
                      </div>
                      <button onClick={addAccessory} className="w-full py-3 bg-sleek-primary text-white rounded-xl font-bold text-sm tracking-wide mt-2 shadow-lg shadow-sleek-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        Ajouter cet Accessoire
                      </button>
                    </div>
                  </div>

                <div className="lg:col-span-8 bg-sleek-card rounded-2xl border border-sleek-border shadow-md flex flex-col min-h-[400px] lg:min-h-0 select-text min-w-0">
                    <div className="px-6 py-4 border-b border-sleek-border bg-sleek-bg flex justify-between items-center shrink-0">
                      <h3 className="text-xs font-bold text-sleek-text-muted uppercase tracking-widest flex items-center gap-2"><PlusCircle size={14}/> Liste des Coûts Accessoires</h3>
                      <div className="flex items-center gap-3">
                        <span className="bg-sleek-primary/10 text-sleek-primary px-3 py-1 rounded-full text-[10px] font-bold">{accessoryConfig.items.length} Accessoires</span>
                      </div>
                    </div>
                    <div className="overflow-auto flex-1 custom-scrollbar min-h-0">
                      <table className="w-full text-left text-[12px] border-collapse">
                        <thead className="sticky top-0 bg-sleek-card border-b border-sleek-border z-10 shadow-sm">
                          <tr className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-wider">
                            <th className="p-4">Désignation</th>
                            <th className="p-4 text-center">Affectation</th>
                            <th className="p-4 text-center">Quantité / An</th>
                            <th className="p-4 text-center">Unité</th>
                            <th className="p-4 text-center">Prix Unitaire</th>
                            <th className="p-4 text-right text-sleek-primary">Total (DA/an)</th>
                            <th className="p-4 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-sleek-border/20">
                          {accessoryConfig.items.map(item => {
                            const total = item.qtyPerYear * item.unitPrice;
                            const isFil = item.designation.toLowerCase().includes('fil');
                            return (
                              <tr key={item.id} className={cn("hover:bg-sleek-bg/50 transition-colors", isFil ? "bg-indigo-500/10" : "")}>
                                <td className="p-4 font-semibold text-sleek-text-main">
                                  <div className="flex items-center gap-2">
                                     {isFil && <Zap size={12} className="text-sleek-primary"/>}
                                     {item.designation}
                                  </div>
                                  {item.calculationMode === 'calculated' && (
                                    <div className="text-[9px] text-indigo-500 font-bold uppercase mt-1 flex items-center gap-1">
                                      <Calculator size={10}/> vs:{item.vs}m²/h • hj:{item.hoursPerDay}h
                                    </div>
                                  )}
                                </td>
                                <td className="p-4 text-center">
                                  <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase",
                                    item.allocation === 'Granite' ? "bg-sleek-primary/10 text-sleek-primary" :
                                    item.allocation === 'Tuf' ? "bg-orange-100 text-orange-600" :
                                    "bg-sleek-bg text-sleek-text-muted border border-sleek-border"
                                  )}>
                                    {item.allocation}
                                  </span>
                                </td>
                                <td className="p-4 text-center font-mono">{item.qtyPerYear.toLocaleString()}</td>
                                <td className="p-4 text-center text-sleek-text-muted font-medium uppercase tracking-widest text-[9px]">{item.unit}</td>
                                <td className="p-4 text-center font-mono">{item.unitPrice.toLocaleString()} DA</td>
                                <td className="p-4 text-right font-mono font-bold text-sleek-primary">{total.toLocaleString()} DA</td>
                                <td className="p-4 text-center">
                                  <button onClick={() => removeAccessory(item.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                                    <Trash size={14}/>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                          {accessoryConfig.items.length === 0 && (
                            <tr><td colSpan={7} className="p-10 text-center text-sleek-text-muted italic text-sm">Aucun accessoire défini.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Summary Footer for Accessories */}
                    {accessoryConfig.items.length > 0 && (
                      <div className="bg-sleek-card text-sleek-text-main p-6 flex justify-between items-center border-t border-sleek-border shadow-inner shrink-0">
                        <div className="flex flex-col">
                           <span className="text-[9px] text-sleek-text-muted uppercase font-bold tracking-widest mb-1">Total Coûts Accessoires (Année 1)</span>
                           <span className="text-xl font-mono font-bold text-sleek-accent-green">
                              {formatCurrency(accessoryConfig.items.reduce((acc, item) => acc + (item.qtyPerYear * item.unitPrice), 0))} <span className="text-xs font-sans opacity-60">DA/an</span>
                           </span>
                        </div>
                        <div className="flex items-center gap-2 bg-sleek-bg px-4 py-2 rounded-xl border border-sleek-border">
                          <Activity size={14} className="text-blue-400"/>
                          <span className="text-[10px] font-bold text-sleek-text-muted">Sujet à l'inflation annuelle prévue ({opConfig.annualInflationRate}%)</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section Projection Accessoires */}
                <div className="flex-1 bg-sleek-card rounded-2xl border border-sleek-border shadow-md overflow-hidden flex flex-col min-h-[400px]">
                   <div className="px-6 py-4 border-b border-sleek-border bg-sleek-bg flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-sleek-text-muted">Projection Coûts Accessoires sur 10 ans</h3>
                      <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border border-emerald-500/20">
                        <Check size={12}/> Injection TCR Activée
                      </div>
                   </div>
                   <div className="overflow-auto flex-1 p-6 flex flex-col">
                      <div className="grid grid-cols-10 gap-3 min-w-[900px]">
                         {calculatedYears.map((y, i) => (
                           <div key={i} className="flex flex-col gap-2 p-3 bg-sleek-bg/50 rounded-xl border border-sleek-border items-center">
                              <span className="text-[9px] font-bold text-sleek-text-muted">Année {i+1}</span>
                              <div className="text-[10px] font-mono font-bold text-sleek-primary">{formatCurrency(accessoryResults.granite[i] + accessoryResults.tuf[i] + accessoryResults.common[i])}</div>
                           </div>
                         ))}
                      </div>
                       <InfoCallout 
                         title="Accessoires & Consommables Divers"
                         description={
                           <>
                               Cette section permet d'inclure des consommables spécifiques (comme le fil diamanté, les couronnes, ou câbles) qui ne sont pas classés comme carburant mais affectent directement la marge opérationnelle.
                               Le total annuel est injecté dans le poste <b>Matières&nbsp;&amp;&nbsp;Consommables</b> du TCR.
                            </>
                          }
                          className="mt-8"
                        />
                    </div>
                 </div>
               </motion.div>
             )}

            {activeTab === 'water' && (
              <motion.div 
                key="water" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.98 }} 
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar min-h-0 relative font-sans"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 shrink-0">
                  {/* Left Column: Form & General Parameters */}
                  <div className="lg:col-span-4 bg-sleek-card p-6 rounded-2xl border border-sleek-border shadow-md overflow-y-auto max-h-[calc(100vh-220px)] custom-scrollbar flex flex-col gap-6">
                    <div>
                      <h3 className="text-sm font-bold flex items-center gap-2 text-sleek-text-main"><Droplets size={16} className="text-sleek-primary"/> Approvisionnement & Formulaire</h3>
                      <p className="text-[10px] text-sleek-text-muted mt-1">Configurez le prix de l'eau et enregistrez de nouveaux postes de consommation.</p>
                    </div>

                    {/* Paramètres d'approvisionnement en eau */}
                    <div className="bg-sleek-bg p-4 rounded-xl border border-sleek-border space-y-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-wider">Prix de l'eau (DA/m³)</label>
                        <div className="relative">
                          <input 
                            type="number"
                            step="0.01"
                            value={waterConfig.globalPrice || ''}
                            onChange={(e) => updateWaterGlobalPrice(e.target.value)}
                            className="w-full bg-sleek-card text-sleek-text-main pl-4 pr-16 py-2.5 rounded-xl border border-sleek-border focus:border-sleek-primary focus:outline-none transition-colors font-mono font-bold text-xs"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-sleek-text-muted uppercase">DA/m³</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 bg-sleek-card border border-sleek-border p-3.5 rounded-xl">
                        <input 
                          type="checkbox"
                          id="chkWaterCustomPrices"
                          checked={waterConfig.hasCustomPrices}
                          onChange={toggleWaterCustomPrices}
                          className="w-4 h-4 rounded text-sleek-primary border-sleek-border bg-sleek-bg focus:ring-0 focus:ring-offset-0 transition-all cursor-pointer"
                        />
                        <label htmlFor="chkWaterCustomPrices" className="text-xs font-semibold text-sleek-text-main cursor-pointer select-none">
                          Prix personnalisés par an
                        </label>
                      </div>

                      {waterConfig.hasCustomPrices && (
                        <div className="pt-2 border-t border-sleek-border/50">
                          <span className="text-[9px] text-sleek-text-muted uppercase font-bold tracking-widest block mb-2">Prix unitaire par exercice (DA/m³)</span>
                          <div className="grid grid-cols-2 gap-2">
                            {Array.from({ length: 10 }).map((_, yearIdx) => {
                              const val = waterConfig.customPrices?.[yearIdx] ?? waterConfig.globalPrice ?? 40.95;
                              return (
                                <div key={yearIdx} className="flex gap-2 items-center bg-sleek-card p-1.5 rounded-lg border border-sleek-border/70">
                                  <span className="text-[9px] font-bold text-sleek-text-muted min-w-[28px]">An {yearIdx + 1}</span>
                                  <input 
                                    type="number"
                                    step="0.01"
                                    value={val}
                                    onChange={(e) => updateWaterCustomPriceCell(yearIdx, e.target.value)}
                                    className="w-full bg-sleek-bg text-center rounded p-1 font-mono text-[10px] font-bold text-sleek-text-main focus:outline-none focus:border-sleek-primary transition-all text-black font-semibold"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Formulaire d'ajout de poste */}
                    <div className="pt-5 border-t border-sleek-border">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-sleek-text-muted opacity-60 mb-4 flex items-center gap-2"><PlusCircle size={12}/> Ajouter un Poste de Consommation</h4>
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-sleek-text-muted">Désignation / Utilisation</label>
                          <input 
                            type="text"
                            placeholder="e.g., Fil diamanté, Lavage..."
                            value={newWaterName}
                            onChange={(e) => setNewWaterName(e.target.value)}
                            className={`bg-sleek-bg text-sleek-text-main px-4 py-2.5 rounded-xl border text-xs focus:outline-none transition-all ${newWaterErrors.name ? 'border-red-500' : 'border-sleek-border focus:border-sleek-primary'}`}
                          />
                          {newWaterErrors.name && <span className="text-[10px] text-red-500 font-bold">{newWaterErrors.name}</span>}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-sleek-text-muted">Débit d'eau requis (L/h)</label>
                          <div className="relative">
                            <input 
                              type="number"
                              placeholder="e.g., 1500"
                              value={newWaterFlow}
                              onChange={(e) => setNewWaterFlow(e.target.value)}
                              className={`w-full bg-sleek-bg text-sleek-text-main pl-4 pr-12 py-2.5 rounded-xl border text-xs focus:outline-none transition-all font-mono ${newWaterErrors.flow ? 'border-red-500' : 'border-sleek-border focus:border-sleek-primary'}`}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-sleek-text-muted font-mono font-semibold">L/h</span>
                          </div>
                          {newWaterErrors.flow && <span className="text-[10px] text-red-500 font-bold">{newWaterErrors.flow}</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-sleek-text-muted">Heures / poste</label>
                            <div className="relative">
                              <input 
                                type="number"
                                placeholder="8"
                                value={newWaterHrsPerShift}
                                onChange={(e) => setNewWaterHrsPerShift(e.target.value)}
                                className={`w-full bg-sleek-bg text-sleek-text-main pl-4 pr-10 py-2.5 rounded-xl border text-xs focus:outline-none transition-all font-mono ${newWaterErrors.hrsPerShift ? 'border-red-500' : 'border-sleek-border focus:border-sleek-primary'}`}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-sleek-text-muted">h/p</span>
                            </div>
                            {newWaterErrors.hrsPerShift && <span className="text-[10px] text-red-500 font-bold">{newWaterErrors.hrsPerShift}</span>}
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-sleek-text-muted">Postes / jour</label>
                            <div className="relative">
                              <input 
                                type="number"
                                placeholder="1"
                                value={newWaterShiftsPerDay}
                                onChange={(e) => setNewWaterShiftsPerDay(e.target.value)}
                                className={`w-full bg-sleek-bg text-sleek-text-main pl-4 pr-10 py-2.5 rounded-xl border text-xs focus:outline-none transition-all font-mono ${newWaterErrors.shiftsPerDay ? 'border-red-500' : 'border-sleek-border focus:border-sleek-primary'}`}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-sleek-text-muted">p/j</span>
                            </div>
                            {newWaterErrors.shiftsPerDay && <span className="text-[10px] text-red-500 font-bold">{newWaterErrors.shiftsPerDay}</span>}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-sleek-text-muted">Jours de fonctionnement / an</label>
                          <div className="relative">
                            <input 
                              type="number"
                              placeholder="250"
                              value={newWaterDaysPerYear}
                              onChange={(e) => setNewWaterDaysPerYear(e.target.value)}
                              className={`w-full bg-sleek-bg text-sleek-text-main pl-4 pr-12 py-2.5 rounded-xl border text-xs focus:outline-none transition-all font-mono ${newWaterErrors.daysPerYear ? 'border-red-500' : 'border-sleek-border focus:border-sleek-primary'}`}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-sleek-text-muted">j/an</span>
                          </div>
                          {newWaterErrors.daysPerYear && <span className="text-[10px] text-red-500 font-bold">{newWaterErrors.daysPerYear}</span>}
                        </div>

                        {/* Calculated total box */}
                        <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2.5 rounded-xl flex items-center justify-between">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Service Calculé :</span>
                          <span className="text-xs font-mono font-black text-sleek-primary">{newWaterHours} h/an</span>
                        </div>
                      </div>

                      <button 
                        onClick={addWaterItem}
                        className="w-full py-4 bg-sleek-primary text-white rounded-xl shadow-lg shadow-sleek-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-xs tracking-wider uppercase mt-4 flex items-center justify-center gap-2"
                      >
                        <PlusCircle size={16}/> Enregistrer le Poste d'eau
                      </button>
                    </div>
                  </div>

                  {/* Right Column: List of items in Table */}
                  <div className="lg:col-span-8 bg-sleek-card rounded-2xl border border-sleek-border shadow-md overflow-hidden flex flex-col max-h-[calc(100vh-220px)]">
                    <div className="px-6 py-4 border-b border-sleek-border bg-sleek-bg flex justify-between items-center shrink-0">
                      <h3 className="text-xs font-bold text-sleek-text-muted uppercase tracking-widest flex items-center gap-2"><Activity size={14}/> Bilan de Consommation d'eau</h3>
                      <div className="flex items-center gap-3">
                        <span className="bg-sleek-primary/10 text-sleek-primary px-3 py-1 rounded-full text-[10px] font-bold">{(waterConfig.items || []).length} Postes</span>
                      </div>
                    </div>

                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                      <table className="w-full text-left text-[12px] border-collapse min-w-[900px]">
                        <thead className="sticky top-0 bg-sleek-card border-b border-sleek-border z-10 shadow-sm">
                          <tr className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-wider">
                            <th className="p-4 w-1/4">Désignation</th>
                            <th className="p-4 text-center">Débit (L/h)</th>
                            <th className="p-4 text-center">Volume Unitaire / h</th>
                            <th className="p-4 text-center w-[400px]">Dimensionnement (h/poste × postes/j × j/an)</th>
                            <th className="p-4 text-center">Heures par Exercice</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-sleek-border/20">
                          {(waterConfig.items || []).map((item) => (
                            <React.Fragment key={item.id}>
                              <tr className="hover:bg-sleek-bg/50 transition-colors">
                                <td className="p-4">
                                  <div className="font-semibold text-sleek-text-main">{item.designation}</div>
                                  <div className="text-[9px] text-sleek-text-muted font-bold uppercase tracking-tighter mt-0.5">
                                    {(item.hoursPerShift ?? 8)}h/poste • {(item.shiftsPerDay ?? 1)}poste/j • {(item.daysPerYear ?? 250)}j/an
                                  </div>
                                </td>
                                <td className="p-4 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <input 
                                      type="number"
                                      value={item.flowRate}
                                      onChange={(e) => updateWaterItemField(item.id, 'flowRate', Number(e.target.value))}
                                      className="w-20 bg-sleek-bg/60 text-center rounded border border-sleek-border font-mono p-1 text-xs focus:outline-none focus:border-sleek-primary text-black font-semibold"
                                    />
                                    <span className="text-[9px] text-sleek-text-muted font-semibold">L/h</span>
                                  </div>
                                </td>
                                <td className="p-4 text-center font-mono text-xs text-sleek-text-muted font-semibold">
                                  {formatCurrency(item.flowRate / 1000)} m³/h
                                </td>
                                <td className="p-4 text-center">
                                  <div className="flex items-center gap-1.5 justify-center">
                                    <div className="flex flex-col items-center">
                                      <input 
                                        type="number"
                                        value={item.hoursPerShift ?? 8}
                                        onChange={(e) => updateWaterItemField(item.id, 'hoursPerShift', Number(e.target.value))}
                                        disabled={item.hasCustomHours}
                                        className="w-12 bg-sleek-bg text-center rounded border border-sleek-border font-mono p-1 text-xs focus:outline-none focus:border-sleek-primary disabled:opacity-50 text-black font-semibold"
                                      />
                                    </div>
                                    <span className="text-sleek-text-muted font-bold text-[10px]">×</span>
                                    <div className="flex flex-col items-center">
                                      <input 
                                        type="number"
                                        value={item.shiftsPerDay ?? 1}
                                        onChange={(e) => updateWaterItemField(item.id, 'shiftsPerDay', Number(e.target.value))}
                                        disabled={item.hasCustomHours}
                                        className="w-12 bg-sleek-bg text-center rounded border border-sleek-border font-mono p-1 text-xs focus:outline-none focus:border-sleek-primary disabled:opacity-50 text-black font-semibold"
                                      />
                                    </div>
                                    <span className="text-sleek-text-muted font-bold text-[10px]">×</span>
                                    <div className="flex flex-col items-center">
                                      <input 
                                        type="number"
                                        value={item.daysPerYear ?? 250}
                                        onChange={(e) => updateWaterItemField(item.id, 'daysPerYear', Number(e.target.value))}
                                        disabled={item.hasCustomHours}
                                        className="w-14 bg-sleek-bg text-center rounded border border-sleek-border font-mono p-1 text-xs focus:outline-none focus:border-sleek-primary disabled:opacity-50 text-black font-semibold"
                                      />
                                    </div>
                                    <span className="text-sleek-text-muted font-bold text-[10px]">=</span>
                                    <div className="flex flex-col items-center">
                                      <span className="bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 text-[10px] font-mono font-bold text-sleek-primary min-w-[50px] text-center mt-0.5">
                                        {item.hoursPerYear} h
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4 text-center">
                                  <button 
                                    onClick={() => toggleWaterItemCustomHours(item.id)}
                                    className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-colors border ${item.hasCustomHours ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : 'bg-sleek-bg text-sleek-text-muted border-sleek-border'}`}
                                  >
                                    {item.hasCustomHours ? 'Personnalisé' : 'Fixe'}
                                  </button>
                                </td>
                                <td className="p-4 text-center">
                                  <button 
                                    onClick={() => removeWaterItem(item.id)}
                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                  >
                                    <Trash size={14}/>
                                  </button>
                                </td>
                              </tr>
                              
                              {item.hasCustomHours && (
                                <tr className="bg-indigo-500/[0.02]/50 border-b border-sleek-border/30">
                                  <td colSpan={6} className="p-4 pl-8">
                                    <div className="flex flex-col gap-2">
                                      <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block">Heures de fonctionnement par exercice (h/an)</span>
                                      <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                                        {Array.from({ length: 10 }).map((_, yIdx) => {
                                          const hrVal = item.customHours?.[yIdx] ?? item.hoursPerYear;
                                          return (
                                            <div key={yIdx} className="flex flex-col gap-1 items-center bg-sleek-bg/20 p-1.5 rounded-lg border border-sleek-border">
                                              <span className="text-[9px] text-sleek-text-muted">A {yIdx + 1}</span>
                                              <input 
                                                type="number"
                                                value={hrVal}
                                                onChange={(e) => updateWaterItemCustomHourCell(item.id, yIdx, e.target.value)}
                                                className="w-full text-center bg-sleek-card border border-sleek-border rounded p-0.5 font-mono text-[10px] text-black focus:outline-none focus:border-sleek-primary font-semibold"
                                              />
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                          {(waterConfig.items || []).length === 0 && (
                            <tr>
                              <td colSpan={6} className="p-12 text-center text-sleek-text-muted italic text-sm">
                                Aucun poste de consommation d'eau défini. Utilisez le formulaire à gauche pour en ajouter.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Summary Footer with Totals */}
                    {(waterConfig.items || []).length > 0 && (
                      <div className="bg-sleek-card text-sleek-text-main p-6 grid grid-cols-2 gap-6 border-t border-sleek-border shadow-inner shrink-0">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-sleek-text-muted uppercase font-bold tracking-widest mb-1">Volume Global Estimé Année 1</span>
                          <span className="text-xl font-mono font-bold text-sky-400">
                            {formatCurrency(waterResults.annualVolumes[0])} <span className="text-xs font-sans opacity-60">m³/an</span>
                          </span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[9px] text-emerald-400 uppercase font-black tracking-widest mb-1 font-sans">Coût Total Estimé Année 1</span>
                          <span className="text-xl font-mono font-bold text-sleek-accent-green">
                            {formatCurrency(waterResults.annualCosts.common[0])} <span className="text-xs font-sans opacity-60">DA/an</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Water cost projections over 10 years */}
                <div className="bg-sleek-card rounded-2xl border border-sleek-border shadow-md overflow-hidden flex flex-col min-h-[300px] shrink-0 mb-6 font-sans">
                  <div className="px-6 py-4 border-b border-sleek-border bg-sleek-bg flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-sleek-text-muted font-sans font-bold">Projection Consommation & Coût de l'eau sur 10 ans</h3>
                    <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border border-emerald-500/20">
                      <Check size={12}/> Injection TCR Activée
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {Array.from({ length: 10 }).map((_, yIdx) => {
                        const yrCost = waterResults.annualCosts.common[yIdx] || 0;
                        const yrVol = waterResults.annualVolumes[yIdx] || 0;
                        return (
                          <div key={yIdx} className="bg-sleek-bg/50 p-4 rounded-xl border border-sleek-border flex flex-col gap-2 items-center text-center">
                            <span className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-wider">Année {yIdx + 1}</span>
                            <div className="flex flex-col">
                              <span className="text-[11px] font-mono font-bold text-sleek-primary">{yrVol.toLocaleString(undefined, {maximumFractionDigits: 1})} m³</span>
                              <span className="text-[12px] font-mono font-black text-sleek-accent-green mt-0.5">{formatCurrency(yrCost)} DA</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <InfoCallout 
                      title="Consommation d'eau"
                      description={
                        <>
                          L'eau est requise principalement pour les opérations d'extraction. 
                          Le coût annuel total calculé est automatiquement injecté dans le poste <b>Matières & Fournitures</b> du TCR (Tableau des Comptes de Résultats), garantissant que le coût opérationnel réel prend en compte toutes les consommations de fluide.
                        </>
                      }
                      className="mt-6"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'edit' && (
              <motion.div 
                key="edit" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.98 }} 
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar"
              >
                {/* Global Calculation SettingsSection */}
                <div className="bg-sleek-card rounded-2xl border border-sleek-border shadow-md overflow-hidden mb-6 transition-all duration-300">
                  <div 
                    onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
                    className="w-full px-8 py-5 flex items-center justify-between hover:bg-sleek-bg transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                        <Settings size={20} className={cn("transition-transform duration-500", isSettingsExpanded && "rotate-90")} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-sm text-sleek-text-main">Paramètres Globaux des Calculs</h3>
                        <p className="text-[10px] text-sleek-text-muted font-bold uppercase tracking-widest mt-0.5">Inflation, Charges Sociales, Fiscalité</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSave();
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-sleek-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sleek-primary/90 transition-all shadow-lg shadow-sleek-primary/20"
                      >
                        <Copy size={14} /> Sauvegarder Simulation
                      </button>
                      <div className={cn("transition-transform duration-300", isSettingsExpanded ? "rotate-180" : "")}>
                        <PlusCircle size={20} className="text-sleek-text-muted" />
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isSettingsExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8">
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-widest border-b border-sleek-border pb-2">Fiscalité</h4>
                            <InputGroupVertical 
                              label="Taux IBM (%)" 
                              value={ibmRateInput} 
                              onChange={(v) => {
                                setIbmRateInput(v);
                                const parsed = parseFloat(v.replace(',', '.'));
                                if (!isNaN(parsed)) {
                                  setIbmRate(parsed / 100);
                                }
                              }} 
                              type="text"
                              helper="Impôt sur les Bénéfices des Travaux Miniers"
                            />
                          </div>
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-widest border-b border-sleek-border pb-2">Personnel</h4>
                            <div className="space-y-4">
                              <InputGroupVertical 
                                label="Charges Sociales (%)" 
                                value={socialChargesInput} 
                                onChange={(v) => {
                                  setSocialChargesInput(v);
                                  const parsed = parseFloat(v.replace(',', '.'));
                                  if (!isNaN(parsed)) {
                                    setHrConfig(prev => ({...prev, socialChargesRate: parsed/100}));
                                  }
                                }} 
                                type="text"
                              />
                              <InputGroupVertical 
                                label="Augmentation Annuelle (%)" 
                                value={annualIncreaseInput} 
                                onChange={(v) => {
                                  setAnnualIncreaseInput(v);
                                  const parsed = parseFloat(v.replace(',', '.'));
                                  if (!isNaN(parsed)) {
                                    setHrConfig(prev => ({...prev, annualIncreaseRate: parsed/100}));
                                  }
                                }} 
                                type="text"
                              />
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-widest border-b border-sleek-border pb-2">Exploitation</h4>
                            <div className="space-y-4">
                              <InputGroupVertical 
                                label="Inflation Fuel/Maint (%)" 
                                value={annualInflationInput} 
                                onChange={(v) => {
                                  setAnnualInflationInput(v);
                                  const parsed = parseFloat(v.replace(',', '.'));
                                  if (!isNaN(parsed)) {
                                    setOpConfig(prev => ({...prev, annualInflationRate: parsed}));
                                  }
                                }} 
                                type="text"
                              />
                              <InputGroupVertical 
                                label="Prix du Litre (DA)" 
                                value={(opConfig.fuelPrice ?? 0).toString()} 
                                onChange={(v) => setOpConfig({...opConfig, fuelPrice: Number(v)})} 
                                type="number"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest border-b border-sleek-border pb-2">Tarification Granite</h4>
                            <div className="space-y-4">
                              <InputGroupVertical 
                                label="Prix Granite (DA/m³)" 
                                value={priceGraniteInput} 
                                onChange={(v) => {
                                  setPriceGraniteInput(v);
                                  const parsed = parseFloat(v.replace(',', '.'));
                                  if (!isNaN(parsed) && parsed >= 0) {
                                    setPriceGranite(parsed);
                                  } else if (v === '') {
                                    setPriceGranite(0);
                                  }
                                }} 
                                type="text"
                                helper="CA nul si vide ou non renseigné"
                              />
                              <InputGroupVertical 
                                label="Densité Granite (t/m³)" 
                                value={densityGraniteInput} 
                                onChange={(v) => {
                                  setDensityGraniteInput(v);
                                  const parsed = parseFloat(v.replace(',', '.'));
                                  if (!isNaN(parsed) && parsed > 0) {
                                    setDensityGranite(parsed);
                                  }
                                }} 
                                type="text"
                                helper="Doit être strictement > 0"
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest border-b border-sleek-border pb-2">Tarification Tuf</h4>
                            <div className="space-y-4">
                              <InputGroupVertical 
                                label="Prix Tuf (DA/m³)" 
                                value={priceTufInput} 
                                onChange={(v) => {
                                  setPriceTufInput(v);
                                  const parsed = parseFloat(v.replace(',', '.'));
                                  if (!isNaN(parsed) && parsed >= 0) {
                                    setPriceTuf(parsed);
                                  } else if (v === '') {
                                    setPriceTuf(0);
                                  }
                                }} 
                                type="text"
                                helper="CA nul si vide ou non renseigné"
                              />
                              <InputGroupVertical 
                                label="Densité Tuf (t/m³)" 
                                value={densityTufInput} 
                                onChange={(v) => {
                                  setDensityTufInput(v);
                                  const parsed = parseFloat(v.replace(',', '.'));
                                  if (!isNaN(parsed) && parsed > 0) {
                                    setDensityTuf(parsed);
                                  }
                                }} 
                                type="text"
                                helper="Doit être strictement > 0"
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest border-b border-sleek-border pb-2">Décimales & Infos</h4>
                            <div className="space-y-4">
                              <InputGroupVertical 
                                label="Décimales Arrondis" 
                                value={decimalPlacesInput} 
                                onChange={(v) => {
                                  setDecimalPlacesInput(v);
                                  const parsed = parseInt(v, 10);
                                  if (!isNaN(parsed) && parsed >= 0 && parsed <= 5) {
                                    setDecimalPlaces(parsed);
                                  }
                                }} 
                                type="number"
                                helper="Nombre de décimales (0 à 5)"
                              />
                              <div className="bg-sleek-bg/50 p-2.5 rounded-xl border border-sleek-border text-[9px] text-sleek-text-muted leading-tight">
                                <b>Formule de calcul :</b><br/>
                                • Vol = Extraction / Densité<br/>
                                • CA = Vol × Prix
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="px-8 py-4 bg-indigo-500/10 border-t border-sleek-border flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                            <p className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-wider">
                              Ces paramètres s'appliquent en temps réel sur l'ensemble des projections sur 10 ans.
                            </p>
                          </div>
                          <button 
                            onClick={() => {
                              if (window.confirm("Voulez-vous vraiment réinitialiser toutes les données ? Cette action est irréversible.")) {
                                localStorage.clear();
                                window.location.reload();
                              }
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors uppercase tracking-widest"
                          >
                            <Trash2 size={12} /> Réinitialiser
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-2xl flex gap-4 text-sleek-text-main mb-2 shadow-sm">
                   <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shrink-0"><Check size={20}/></div>
                   <div>
                     <h4 className="font-bold text-sm">Synchronisation Totale Active</h4>
                     <p className="text-xs opacity-70 leading-relaxed mt-1">
                       Les dotations aux amortissements, les frais de personnel et <b>le carburant</b> sont automatiquement synchronisés. 
                       Les modifications dans les modules <span className="underline cursor-pointer font-bold hover:text-indigo-500" onClick={() => setActiveTab('invest')}>Investissements</span>, <span className="underline cursor-pointer font-bold hover:text-indigo-500" onClick={() => setActiveTab('hr')}>RH</span> et <span className="underline cursor-pointer font-bold hover:text-indigo-500" onClick={() => setActiveTab('ops')}>Carburant</span> impactent immédiatement votre TCR.
                     </p>
                   </div>
                </div>
                {years.map((year, idx) => (
                  <YearEditCard 
                    key={year.year} 
                    year={year} 
                    idx={idx} 
                    calculatedYear={calculatedYears[idx]} 
                    amortTotals={amortResults.annualTotals} 
                    onUpdate={handleUpdateYear} 
                    priceGranite={priceGranite}
                    densityGranite={densityGranite}
                    priceTuf={priceTuf}
                    densityTuf={densityTuf}
                    decimalPlaces={decimalPlaces}
                  />
                ))}
              </motion.div>
            )}

            {activeTab === 'table' && (
              <motion.div 
                key="table" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.98 }} 
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 bg-sleek-card rounded-2xl border border-sleek-border shadow-2xl overflow-hidden flex flex-col"
              >
                <div className="flex-1 overflow-auto custom-scrollbar relative">
                  <table className="table-fixed border-collapse min-w-[2100px] w-[2100px]">
                    <thead className="sticky top-0 z-[60] shadow-sm">
                      <tr>
                        <th className="bg-sleek-bg p-5 text-left w-[320px] min-w-[320px] max-w-[320px] border-b border-sleek-border font-bold text-[10px] uppercase tracking-widest text-sleek-text-muted sticky left-0 z-[70] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] font-serif italic backdrop-blur-md">Compte de Résultat (TCR - DA)</th>
                        {calculatedYears.map(y => (
                          <th key={y.year} className="bg-sleek-bg p-5 text-right border-b border-sleek-border border-r border-white/10 font-bold text-[10px] text-sleek-text-muted whitespace-nowrap backdrop-blur-md min-w-[160px] w-[160px] max-w-[160px]">Année {y.year}</th>
                        ))}
                        <th className="bg-sleek-card p-5 text-right border-b border-sleek-border font-bold text-[10px] text-sleek-text-main shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] uppercase tracking-widest sticky right-0 z-[70] backdrop-blur-md min-w-[180px] w-[180px] max-w-[180px]">TOTAL (DA)</th>
                      </tr>
                    </thead>
                    <tbody className="text-[12px] font-mono leading-none divide-y divide-sleek-border/20">
                      <SleekRow label="EXTRACTION GRANITE (m³)" values={calculatedYears.map(y => y.extractionGranite)} total={totalRow.extractionGranite} format={formatCurrency} />
                      <SleekRow label="EXTRACTION TUF (T)" values={calculatedYears.map(y => y.extractionTuf)} total={totalRow.extractionTuf} format={formatCurrency} />
                      <SleekRow label="CHIFFRE AFFAIRES GRANITE" values={calculatedYears.map(y => y.caGranite)} total={totalRow.caGranite} format={formatCurrency} />
                      <SleekRow label="CHIFFRE AFFAIRES TUF" values={calculatedYears.map(y => y.caTuf)} total={totalRow.caTuf} format={formatCurrency} />
                      <SleekRow label="CHIFFRE AFFAIRES GLOBAL" values={calculatedYears.map(y => y.caGlobal)} total={totalRow.caGlobal} format={formatCurrency} type="total" />
                      <SleekRow label="Matières & Four. Cons." values={calculatedYears.map(y => y.matieresFournitures)} total={totalRow.matieresFournitures} format={formatCurrency} />
                      <SleekRow label="Services" values={calculatedYears.map(y => y.services)} total={totalRow.services} format={formatCurrency} />
                      <SleekRow label="S/total 01 (Consommations)" values={calculatedYears.map(y => y.subtotal1)} total={totalRow.subtotal1} format={formatCurrency} type="subtotal" formula="Formule : Matières + Services" />
                      <SleekRow label="VALEUR AJOUTÉE" values={calculatedYears.map(y => y.valeurAjoutee)} total={totalRow.valeurAjoutee} format={formatCurrency} type="added-value" formula="Formule : Chiffre d'affaires - S/total 1" />
                      <SleekRow label="Charges de Personnel" values={calculatedYears.map(y => y.fraisPersonnel)} total={totalRow.fraisPersonnel} format={formatCurrency} />
                      <SleekRow label="Impôts, taxes & versem. assimilés" values={calculatedYears.map(y => y.impotsTaxes)} total={totalRow.impotsTaxes} format={formatCurrency} />
                      <SleekRow label="Charges financières" values={calculatedYears.map(y => y.fraisFinanciers)} total={totalRow.fraisFinanciers} format={formatCurrency} />
                      <SleekRow label="Dotations aux amortissements" values={calculatedYears.map(y => y.dotationsAmortissements)} total={totalRow.dotationsAmortissements} format={formatCurrency} />
                      <SleekRow label="S/Total 02 (Charges Exploitat.)" values={calculatedYears.map(y => y.subtotal2)} total={totalRow.subtotal2} format={formatCurrency} type="subtotal" formula="Formule : Personnel + Impôts & Taxes + Frais financiers + Dot. Amortiss." />
                      <SleekRow label="RÉSULTAT D'EXPLOITATION" values={calculatedYears.map(y => y.resultatExploitation)} total={totalRow.resultatExploitation} format={formatCurrency} type="added-value" formula="Formule : Valeurs ajoutées - S/Total 2" />
                      <SleekRow label="Impôts sur les bénéfices (IBM)" values={calculatedYears.map(y => y.ibm)} total={totalRow.ibm} format={formatCurrency} formula={`Formule : Résultat d'exploitation × Taux IBM (${ibmRate * 100}%)`} />
                      <SleekRow label="RÉSULTAT NET DE L'EXERCICE" values={calculatedYears.map(y => y.resultatNet)} total={totalRow.resultatNet} format={formatCurrency} type="total" formula="Formule : Résultat d'exploitation - IBM" />
                      <SleekRow label="CAPACITÉ D'AUTOFINANCEMENT (FNT)" values={calculatedYears.map(y => y.fnt)} total={totalRow.fnt} format={formatCurrency} formula="Formule : Résultat Net + Dotations aux Amortissements" />
                      <SleekRow label="PRIX REVIENT GRANITE (DA/m³)" values={calculatedYears.map(y => y.prixRevientGranite)} total={totalRow.prixRevientGranite} format={formatCompact} formula="Alloc. directes + Quote-part indirects" />
                      <SleekRow label="PRIX REVIENT TUF (DA/T)" values={calculatedYears.map(y => y.prixRevientTuf)} total={totalRow.prixRevientTuf} format={formatCompact} formula="Alloc. directes + Quote-part indirects" />
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'charts' && (
               <motion.div 
                key="charts" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.98 }} 
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 overflow-y-auto pr-2 space-y-8 pb-12"
               >
                  {/* Revenue vs Total Costs vs Net Profit (Combo) */}
                  <div className="bg-sleek-card p-8 rounded-2xl border border-sleek-border shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-sm font-bold flex items-center gap-2 text-sleek-text-main"><BarChartIcon size={18} className="text-sleek-primary"/> Synthèse Annuelle : Revenus, Charges & Résultat</h3>
                       <div className="flex gap-4">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-sleek-text-muted uppercase tracking-wider">
                             <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></div> Revenus
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                             <div className="w-2.5 h-2.5 bg-amber-500 rounded-sm"></div> Charges
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                             <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></div> Profit
                          </div>
                       </div>
                    </div>
                    <div className="w-full h-[400px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} dy={10} />
                             <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} tickFormatter={v => `${(v/1000000).toFixed(1)}M`} />
                             <Tooltip 
                                cursor={{fill: '#f8fafc'}}
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', fontSize: '11px', fontWeight: 600 }}
                                formatter={(v: number) => [formatCurrency(v) + " DA", ""]}
                             />
                             <Bar dataKey="Chiffre d'affaires" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={24} />
                             <Bar dataKey="Charges Totales" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={24} />
                             <Bar dataKey="Résultat Net" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
                          </BarChart>
                       </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                     <div className="bg-sleek-card p-8 rounded-2xl border border-sleek-border shadow-sm">
                        <h3 className="text-sm font-bold mb-6 flex items-center gap-2"><LineChartIcon size={18} className="text-rose-500"/> Évolution de la Masse Salariale</h3>
                        <div className="w-full h-[300px]">
                           <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={chartData}>
                                 <defs>
                                    <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                                       <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                    </linearGradient>
                                 </defs>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#64748b'}} />
                                 <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#64748b'}} tickFormatter={v => `${(v/1000000).toFixed(1)}M`} />
                                 <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                    formatter={(v: number) => [formatCurrency(v) + " DA", ""]}
                                 />
                                 <Area type="monotone" dataKey="Frais de Personnel" stroke="#f43f5e" fillOpacity={1} fill="url(#colorHr)" strokeWidth={4} dot={{r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                              </AreaChart>
                           </ResponsiveContainer>
                        </div>
                     </div>

                     <div className="bg-sleek-card p-8 rounded-2xl border border-sleek-border shadow-sm">
                        <h3 className="text-sm font-bold mb-6 flex items-center gap-2"><Activity size={18} className="text-indigo-600"/> Flux Net de Trésorerie (CAF)</h3>
                        <div className="w-full h-[300px]">
                           <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={chartData}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#64748b'}} />
                                 <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#64748b'}} tickFormatter={v => `${(v/1000000).toFixed(1)}M`} />
                                 <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                    formatter={(v: number) => [formatCurrency(v) + " DA", ""]}
                                 />
                                 <Line type="monotone" dataKey="Cash-Flow (FNT)" stroke="#6366f1" strokeWidth={4} dot={{r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} />
                              </LineChart>
                           </ResponsiveContainer>
                        </div>
                     </div>
                  </div>

                  <div className="bg-sleek-card p-8 rounded-2xl border border-sleek-border shadow-sm">
                    <h3 className="text-sm font-bold mb-6 flex items-center gap-2"><TrendingUp size={18} className="text-sleek-primary"/> Évolution Détaillée de la Structure de Coûts</h3>
                    <div className="w-full h-[400px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} />
                             <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} tickFormatter={v => `${(v/1000000).toFixed(1)}M`} />
                             <Tooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                formatter={(v: number) => [formatCurrency(v) + " DA", ""]}
                             />
                             <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', tracking: '0.05em' }} />
                             <Line type="monotone" dataKey="Matières et Fournitures" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} strokeDasharray="5 5" />
                             <Line type="monotone" dataKey="Frais de Personnel" stroke="#f43f5e" strokeWidth={3} dot={{r: 4}} />
                             <Line type="monotone" dataKey="Amortissements" stroke="#10b981" strokeWidth={3} dot={{r: 4}} />
                             <Line type="monotone" dataKey="Services" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4}} strokeDasharray="3 3" />
                             <Line type="monotone" dataKey="Charges Totales" stroke="#334155" strokeWidth={5} dot={{r: 6}} />
                          </LineChart>
                       </ResponsiveContainer>
                    </div>
                  </div>
               </motion.div>
            )}

            {activeTab === 'code' && (
              <motion.div 
                key="code" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.98 }} 
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-2 gap-8 h-full"
              >
                <div className="flex flex-col gap-4">
                  <div className="bg-primary/10 p-6 rounded-2xl border border-sleek-border shadow-sm">
                    <h3 className="font-bold flex items-center gap-2 mb-2"><Info size={18}/> Intégration Dynamique</h3>
                    <p className="text-xs text-indigo-900/60 leading-relaxed italic">
                      Le code ViewModel ci-dessous intègre un <b>StateFlow</b> qui combine les données d'équipements et les prévisions TCR. 
                      Tout ajout d'équipement recalcule immédiatement les dotations du TCR.
                    </p>
                  </div>
                  <CodeExport title="TCRViewModel.kt" code={KOTLIN_VIEWMODEL.trim()} icon={<Smartphone size={16}/>} />
                </div>
                <div className="flex flex-col gap-4">
                  <div className="bg-sleek-bg p-6 rounded-2xl border border-sleek-border shadow-sm">
                    <h3 className="font-bold flex items-center gap-2 mb-2"><TrendingDown size={18} className="text-red-500"/> Structure du Projet</h3>
                    <ul className="text-[11px] space-y-1.5 text-slate-500 font-medium">
                      <li>• Fragment A: Liste des Équipements (Recycler)</li>
                      <li>• Fragment B: Tableau d'Amortissement (Table)</li>
                      <li>• Fragment C: TCR Dashboard (Analyse)</li>
                    </ul>
                  </div>
                  <CodeExport title="layout_invest.xml" code={LAYOUT_XML.trim()} icon={<PlusCircle size={16}/>} />
                </div>
              </motion.div>
            )}


            {activeTab === 'help' && (
              <motion.div 
                key="help" 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 1.05 }} 
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-10"
              >
                <div className="max-w-4xl mx-auto space-y-8">
                  <div className="bg-sleek-card rounded-[2.5rem] p-10 border border-sleek-border shadow-xl">
                    <h2 className="text-2xl font-black text-sleek-text-main mb-8 flex items-center gap-3">
                      <div className="w-10 h-10 bg-sleek-primary/10 rounded-xl flex items-center justify-center text-sleek-primary">
                        <BookOpen size={20} />
                      </div>
                      Guide Technique & Méthodologie
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                      <HelpCard 
                        icon={<PieChart size={20} className="text-sleek-primary" />}
                        title="Comptabilité Analytique Multi-Produits" 
                        description="L'application sépare les charges directes (affectées spécifiquement au Granite ou au Tuf) et répartit les charges communes (Administration, Carburant commun, Maintenance commune, etc.) proportionnellement au tonnage extrait annuel de chaque matériau pour garantir un coût de revient mathématiquement exact."
                        color="bg-sleek-primary/5"
                      />
                      <HelpCard 
                        icon={<Mountain size={20} className="text-sleek-primary" />}
                        title="Dimensionnement de Production" 
                        description="Planification stratégique basée sur un objectif (Vcible). L'outil calcule le volume Tout-Venant (V_amont) nécessaire en intégrant les pertes d'extraction (η1) et de retaille (η2), identifiant ainsi le nombre de machines (N_A, N_B) pour éviter les goulots d'étranglement."
                        color="bg-sleek-primary/5"
                      />
                      <HelpCard 
                        icon={<Zap size={20} className="text-sleek-primary" />}
                        title="Calculateur de Consommables" 
                        description="Outil spécialisé pour le Fil Diamanté permettant d'estimer la quantité annuelle selon la vitesse de sciage (Vs), le coefficient de consommation (Cfu) et le régime de travail, avec injection directe dans les coûts accessoires."
                        color="bg-sleek-primary/5"
                      />
                      <HelpCard 
                        icon={<HardDrive size={20} className="text-sleek-accent-red" />}
                        title="Amortissements Financiers" 
                        description="Calcul de la dépréciation linéaire basé sur le prix d'acquisition et la durée de vie de chaque équipement. Les annuités sont automatiquement injectées dans le TCR au prorata de leur affectation (Direct Granite, Direct Tuf ou Commun)."
                        color="bg-sleek-accent-red/5"
                      />
                      <HelpCard 
                        icon={<Users size={20} className="text-sleek-accent-green" />}
                        title="Masse Salariale & RH" 
                        description="Calcul consolidé incluant les salaires de base, les charges sociales patronales (taux CNAS ajustable) et une projection dynamique intégrant l'inflation salariale annuelle composée sur 10 ans."
                        color="bg-sleek-accent-green/5"
                      />
                      <HelpCard 
                        icon={<Activity size={20} className="text-indigo-400" />}
                        title="Cash-Flow (FNT)" 
                        description="Flux Net de Trésorerie calculé par la somme : Résultat Net + Dotations aux Amortissements. C'est l'indicateur clé de la capacité d'autofinancement et de la liquidité réelle générée par l'exploitation minière."
                        color="bg-indigo-400/5"
                      />
                      <HelpCard 
                        icon={<Calculator size={20} className="text-orange-400" />}
                        title="Coût de Revient (DA/m³ & DA/T)" 
                        description="Formule : (Charges Directes + Quote-part Communes) / Quantité Extraite. Exprimé en DA/m³ pour le Granite (basé sur le volume) et en DA/T pour le Tuf (basé sur le tonnage). Ce coût permet de fixer des prix de vente précis."
                        color="bg-orange-400/5"
                      />
                      <HelpCard 
                        icon={<HardHat size={20} className="text-sleek-text-muted" />}
                        title="Hypothèses de Calcul" 
                        description="Le taux d'IBM (Impôt sur les Bénéfices) et les taux d'inflation sont paramétrables dans les réglages avancés pour simuler différents scénarios économiques algériens."
                        color="bg-sleek-bg"
                      />
                    </div>
                  </div>

                  <div className="bg-sleek-card rounded-[2.5rem] p-10 border border-sleek-border text-sleek-text-main shadow-2xl relative overflow-hidden group">
                     <div className="absolute -top-24 -right-24 w-64 h-64 bg-sleek-primary/20 rounded-full blur-[100px] group-hover:bg-sleek-primary/30 transition-colors duration-1000"></div>
                     <div className="relative z-10">
                        <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                          <Edit3 size={20} className="text-sleek-primary" />
                          Notes & Hypothèses du Projet
                        </h3>
                        <p className="text-xs text-sleek-text-muted mb-6 leading-relaxed max-w-2xl">
                          Utilisez cet espace pour documenter vos hypothèses spécifiques (densité des terrains, ratios de foisonnement, contraintes géotechniques) afin qu'elles apparaissent dans vos dossiers universitaires.
                        </p>
                        <textarea 
                          value={userNotes}
                          onChange={(e) => setUserNotes(e.target.value)}
                          placeholder="Exemple: Hypothèse de foisonnement des matériaux: 1.25..."
                          className="w-full h-48 bg-sleek-bg border border-sleek-border rounded-2xl p-6 text-sm font-medium focus:ring-2 focus:ring-sleek-primary/50 transition-all outline-none resize-none placeholder:text-sleek-text-muted/30 text-sleek-text-main"
                        />
                     </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div 
                key="history" 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 1.05 }} 
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-10"
              >
                <div className="max-w-4xl mx-auto">
                  <div className="bg-sleek-card rounded-[2.5rem] p-10 border border-sleek-border shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                       <h2 className="text-2xl font-black text-sleek-text-main flex items-center gap-3">
                         <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600">
                           <History size={20} />
                         </div>
                         Historique des Sauvegardes
                       </h2>
                       <button 
                         onClick={() => {
                           if (confirm("Voulez-vous vraiment vider tout l'historique ?\nهل تريد حقاً مسح سجل الحفظ بالكامل؟")) {
                             setHistory([]);
                             showToast("Historique vidé");
                           }
                         }}
                         className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-red-500/20"
                       >
                         Vider l'Historique
                       </button>
                    </div>

                    {/* Formulaire de Sauvegarde Météo - TCR GRANITE */}
                    <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-3xl p-6 border border-indigo-500/10 mb-8 shadow-sm">
                       <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                         <PlusCircle size={14} className="text-indigo-500 animate-pulse" />
                         Enregistrer la configuration actuelle (حفظ مسمى)
                       </h3>
                       <div className="flex flex-col md:flex-row gap-4 items-end">
                         <div className="flex-1 space-y-1.5 w-full">
                           <label className="text-[10px] font-extrabold uppercase tracking-wider text-sleek-text-muted opacity-80 block pl-1">Nom de la version / اسم النسخة</label>
                           <input 
                             type="text" 
                             value={customSaveName} 
                             onChange={(e) => setCustomSaveName(e.target.value)}
                             placeholder="Ex: TCR GRANITE" 
                             className="w-full bg-sleek-bg border border-sleek-border/70 rounded-xl px-4 py-2.5 text-xs font-mono focus:ring-2 focus:ring-indigo-500/40 outline-none text-sleek-text-main placeholder:text-sleek-text-muted/30"
                           />
                         </div>
                         <div className="flex gap-1.5 w-full md:w-auto">
                           <button 
                             type="button"
                             onClick={() => setCustomSaveName("TCR GRANITE")}
                             className="flex-1 md:flex-initial px-3.5 py-2.5 bg-sleek-bg border border-sleek-border rounded-xl text-[9px] font-extrabold uppercase tracking-widest text-sleek-text-muted hover:border-emerald-500/40 hover:text-emerald-500 transition-all font-mono"
                           >
                             TCR GRANITE
                           </button>
                           <button 
                             type="button"
                             onClick={() => setCustomSaveName("TCR TUF")}
                             className="flex-1 md:flex-initial px-3.5 py-2.5 bg-sleek-bg border border-sleek-border rounded-xl text-[9px] font-extrabold uppercase tracking-widest text-sleek-text-muted hover:border-indigo-500/40 hover:text-indigo-500 transition-all font-mono"
                           >
                             TCR TUF
                           </button>
                         </div>
                         <button 
                           onClick={() => {
                             if (!customSaveName.trim()) {
                               showToast("Veuillez entrer un nom", "error");
                               return;
                             }
                             handleSave(customSaveName.trim());
                           }}
                           className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/25 hover:scale-[1.02] active:scale-95 transition-all w-full md:w-auto justify-center"
                         >
                           <Save size={14} />
                           Enregistrer
                         </button>
                       </div>
                    </div>

                    {(!Array.isArray(history) || history.length === 0) ? (
                       <div className="flex flex-col items-center justify-center py-20 bg-sleek-bg/50 rounded-3xl border border-dashed border-sleek-border/50">
                         <Clock size={48} className="text-sleek-text-muted/20 mb-4" />
                         <p className="text-sm font-bold text-sleek-text-muted opacity-40 uppercase tracking-widest">Aucune sauvegarde trouvée</p>
                         <p className="text-[10px] text-sleek-text-muted opacity-30 mt-1 uppercase tracking-widest">Entrez un nom ci-dessus pour réaliser votre premier enregistrement</p>
                       </div>
                    ) : (
                       <div className="space-y-4">
                         {Array.isArray(history) && history.map((save, idx) => (
                           <div key={idx} className="group relative bg-sleek-bg/40 border border-sleek-border hover:border-sleek-primary/30 hover:bg-sleek-card rounded-2xl p-6 transition-all shadow-sm hover:shadow-xl">
                             <div className="flex items-center justify-between">
                               <div className="flex flex-col gap-1.5">
                                 <div className="flex items-center gap-2 flex-wrap">
                                   {save.saveName ? (
                                     <div className="flex items-center gap-1.5">
                                       <span className="bg-indigo-500/10 text-indigo-600 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-indigo-500/20 shadow-sm font-mono">
                                         {save.saveName}
                                       </span>
                                       <span className="text-[10px] text-sleek-text-muted font-bold opacity-60">
                                         ({new Date(save.lastSaved).toLocaleString('fr-DZ', { dateStyle: 'short', timeStyle: 'short' })})
                                       </span>
                                     </div>
                                   ) : (
                                     <span className="text-xs font-black text-sleek-text-main group-hover:text-sleek-primary transition-colors">
                                       {new Date(save.lastSaved).toLocaleString('fr-DZ', { dateStyle: 'long', timeStyle: 'short' })}
                                     </span>
                                   )}
                                   {idx === 0 && <span className="bg-emerald-500/10 text-emerald-600 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-500/20">Dernière</span>}
                                 </div>
                                 <span className="text-[10px] text-sleek-text-muted font-bold opacity-60 uppercase tracking-widest">
                                   {save.years?.length || 0} Ans • {save.equipments?.length || 0} Equipements • {save.roles?.length || 0} Employés
                                 </span>
                               </div>
                               
                               <div className="flex items-center gap-2">
                                 <button 
                                   onClick={() => restoreFromHistory(save)}
                                   className="flex items-center gap-2 px-5 py-2.5 bg-sleek-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-sleek-primary/20 hover:scale-105 active:scale-95 transition-all"
                                 >
                                   <Undo2 size={14} />
                                   Restaurer
                                 </button>
                                 <button 
                                   onClick={() => {
                                     if (confirm("Voulez-vous supprimer cette sauvegarde ?\nهل تريد حذف نسخة الحفظ هذه؟")) {
                                       setHistory(prev => (prev || []).filter((_, i) => i !== idx));
                                       showToast("Supprimé");
                                     }
                                   }}
                                   className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                 >
                                   <Trash2 size={16} />
                                 </button>
                               </div>
                             </div>
                             
                             {save.userNotes && (
                               <div className="mt-4 pt-4 border-t border-sleek-border/50">
                                 <p className="text-[10px] text-sleek-text-muted font-medium italic line-clamp-2">
                                   Note: {save.userNotes}
                                 </p>
                               </div>
                              )}
                            </div>
                          ))}
                        </div>
                     )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'about' && (
              <motion.div 
                key="about" 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 1.05 }} 
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-10"
              >
                <div className="w-full max-w-2xl mx-auto bg-sleek-card rounded-[2.5rem] border border-sleek-border shadow-2xl overflow-hidden relative group mb-8">
                  {/* Decorative Background Element */}
                  <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-br from-sleek-primary/10 via-sleek-bg/20 to-transparent -z-0"></div>
                  <div className="absolute top-12 right-12 w-32 h-32 bg-sleek-primary/5 rounded-full blur-3xl"></div>
                  
                  <div className="relative z-10 p-12 flex flex-col items-center text-center">
                    {/* Avatar Header */}
                    <div className="relative mb-8">
                       <div className="w-40 h-40 bg-sleek-bg rounded-full p-1.5 shadow-xl border border-sleek-border flex items-center justify-center relative z-10">
                          <div className="w-full h-full bg-sleek-card rounded-full flex items-center justify-center text-sleek-primary font-bold">
                             <HardHat size={64} strokeWidth={1.5} />
                          </div>
                       </div>
                       <motion.div 
                         initial={{ scale: 0 }}
                         animate={{ scale: 1 }}
                         transition={{ delay: 0.3 }}
                         className="absolute -bottom-2 -right-2 w-12 h-12 bg-sleek-accent-green rounded-2xl flex items-center justify-center text-white shadow-lg border-4 border-white"
                        >
                         <Check size={20} strokeWidth={3} />
                       </motion.div>
                    </div>

                    {/* Content */}
                    <h2 className="text-3xl font-black text-sleek-text-main tracking-tight mb-2">MOUAIA Louai</h2>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full text-sleek-primary text-xs font-bold uppercase tracking-wider mb-8">
                       <GraduationCap size={14} />
                       Étudiant en Master : Génie Minier
                    </div>

                    <div className="relative mb-12 max-w-lg">
                       <span className="absolute -top-6 -left-4 text-6xl text-slate-100 font-serif">“</span>
                       <p className="text-lg text-sleek-text-muted font-medium italic leading-relaxed relative z-10">
                         Cette application est conçue pour faciliter et calculer des études de faisabilité complexes pour les projets de carrières.
                       </p>
                       <span className="absolute -bottom-10 -right-4 text-6xl text-slate-100 font-serif">”</span>
                    </div>

                    {/* Contact Badges */}
                    <div className="grid grid-cols-2 gap-4 w-full">
                       <a 
                        href="mailto:mouaialouai4@gmail.com" 
                        className="flex items-center justify-center gap-3 p-4 bg-sleek-bg rounded-2xl border border-sleek-border hover:border-sleek-primary hover:bg-sleek-card hover:shadow-lg hover:shadow-sleek-primary/5 transition-all group/contact active:scale-[0.98]"
                       >
                         <div className="w-10 h-10 bg-sleek-card rounded-xl flex items-center justify-center text-sleek-text-muted group-hover/contact:text-sleek-primary shadow-sm transition-colors border border-sleek-border">
                            <Mail size={18} />
                         </div>
                         <div className="flex flex-col items-start">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Email</span>
                            <span className="text-sm font-bold text-sleek-text-main">mouaialouai4@gmail.com</span>
                         </div>
                       </a>

                       <a 
                        href="tel:0656874473" 
                        className="flex items-center justify-center gap-3 p-4 bg-sleek-bg rounded-2xl border border-sleek-border hover:border-sleek-accent-green hover:bg-sleek-card hover:shadow-lg hover:shadow-sleek-accent-green/5 transition-all group/contact active:scale-[0.98]"
                       >
                         <div className="w-10 h-10 bg-sleek-card rounded-xl flex items-center justify-center text-sleek-text-muted group-hover/contact:text-sleek-accent-green shadow-sm transition-colors border border-sleek-border">
                            <Phone size={18} />
                         </div>
                         <div className="flex flex-col items-start">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Téléphone</span>
                            <span className="text-sm font-bold text-sleek-text-main">06 56 87 44 73</span>
                         </div>
                       </a>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-50 w-full flex flex-col items-center">
                       <div className="flex items-center justify-center gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all text-center flex-wrap">
                          <div className="flex items-center gap-2"><Building size={14} /><span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Université Cheikh Larbi Tébessa</span></div>
                          <div className="w-1 h-1 rounded-full bg-slate-300 shrink-0"></div>
                          <div className="flex items-center gap-2"><Users size={14} /><span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">Collaborateurs : Dr. Saadaoui Salah & MAYOUF MOUMEN</span></div>
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick} 
      className={cn(
        "relative w-full flex items-center gap-3 px-8 py-3 text-sm transition-all duration-300 group", 
        active ? "text-white bg-white/10" : "text-white/40 hover:text-white/80 hover:bg-white/5"
      )}
    >
      {active && (
        <motion.div 
          layoutId="sidebar-active"
          className="absolute left-0 top-1 bottom-1 w-1 bg-sleek-primary rounded-r-full shadow-[0_0_15px_rgba(59,130,246,0.6)]"
          initial={false}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <span className={cn(active ? "text-sleek-primary scale-110" : "text-white/50 group-hover:text-white", "transition-all duration-300")}>{icon}</span>
      <span className={cn("font-medium tracking-tight transition-all duration-300", active ? "translate-x-1" : "group-hover:translate-x-0.5")}>{label}</span>
    </button>
  );
}

const CompactStatCard = React.memo(({ label, value, formula }: { label: string, value: string, formula?: string }) => {
  return (
    <div className="bg-sleek-card p-4 rounded-xl border border-sleek-border shadow-sleek-card flex flex-col gap-0.5 hover:border-sleek-primary/40 hover:shadow-modern-lg transition-all duration-300 group relative cursor-help">
      <span className="text-[9px] font-bold uppercase tracking-widest text-sleek-text-muted opacity-70 flex items-center gap-1 group-hover:text-sleek-primary transition-colors">
        {label}
        {formula && <Info size={10} className="opacity-40" />}
      </span>
      <span className="text-sm font-bold text-sleek-text-main tracking-tight group-hover:scale-[1.02] transition-transform origin-left">{value}</span>
      {formula && <FormulaTooltip formula={formula} />}
    </div>
  );
});

function FormulaTooltip({ formula }: { formula: string }) {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 pointer-events-none transition-all duration-200 z-[100] w-56 p-3 bg-slate-800/95 text-white text-[10px] rounded-xl shadow-2xl ring-1 ring-white/10 backdrop-blur-md animate-none">
      <div className="relative">
        <div className="flex items-center gap-2 mb-1.5 border-b border-white/10 pb-1.5">
          <Calculator size={12} className="text-sleek-primary" />
          <span className="font-bold uppercase tracking-wider text-[9px] opacity-70">Calcul de l'indicateur</span>
        </div>
        <p className="leading-relaxed font-medium">{formula}</p>
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 border-8 border-transparent border-t-slate-800/95"></div>
      </div>
    </div>
  );
}

const InputGroupVertical = React.memo(({ label, value, onChange, onBlur, type = "text", helper, readOnly, formula, error }: { label: string, value: string, onChange: (v: string) => void, onBlur?: () => void, type?: string, helper?: string, readOnly?: boolean, formula?: string, error?: string }) => {
  return (
    <div className={cn("space-y-1.5 min-w-0 group relative", readOnly && "opacity-50 grayscale select-none")}>
      <label className={cn(
        "text-[10px] font-bold uppercase tracking-widest px-1 flex items-center gap-1.5 cursor-help transition-colors",
        error ? "text-sleek-accent-red" : "text-sleek-text-muted opacity-80 group-hover:text-sleek-primary"
      )}>
        {label}
        {formula && <Info size={10} className="opacity-40" />}
      </label>
      {formula && <FormulaTooltip formula={formula} />}
      <input 
        type={type} 
        value={value} 
        onChange={e => !readOnly && onChange(e.target.value)} 
        onBlur={onBlur}
        readOnly={readOnly}
        className={cn(
          "input-modern",
          error ? "border-sleek-accent-red focus:ring-sleek-accent-red/20 focus:border-sleek-accent-red" : "border-sleek-border hover:border-sleek-primary/30",
          readOnly ? "bg-sleek-bg/50 cursor-not-allowed border-transparent opacity-60" : "bg-sleek-card"
        )}
      />
      {error ? (
        <motion.p 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[9px] text-sleek-accent-red font-bold px-1"
        >
          {error}
        </motion.p>
      ) : helper && (
        <p className="text-[9px] text-sleek-text-muted italic opacity-60 px-1 leading-tight group-hover:opacity-100 transition-opacity">*{helper}</p>
      )}
    </div>
  );
});

const InputGroup = React.memo(({ label, value, onChange, onBlur, suffix, readOnly, isAuto, formula, error }: { label: string, value: number, onChange: (v: number) => void, onBlur?: () => void, suffix?: string, readOnly?: boolean, isAuto?: boolean, formula?: string, error?: string }) => {
  return (
    <div className={cn("space-y-1.5 min-w-0", readOnly && "opacity-60")}>
      <label className={cn(
        "text-[10px] font-bold uppercase tracking-wider block truncate flex items-center gap-1.5 group relative",
        error ? "text-sleek-accent-red" : "text-sleek-text-muted opacity-60"
      )}>
        <span className="flex items-center gap-1 cursor-help">
          {label}
          {formula && <Info size={10} className="opacity-40" />}
        </span>
        {isAuto && (
          <span className="inline-flex items-center" title="Calculé automatiquement mais modifiable manuellement">
            <Activity size={10} className={cn(error ? "text-sleek-accent-red" : "text-sleek-primary", "animate-pulse")} />
          </span>
        )}
        {formula && <FormulaTooltip formula={formula} />}
      </label>
      <div className="relative group">
        <input 
          type="number" 
          value={value || ''} 
          placeholder="0" 
          onChange={(e) => !readOnly && onChange(Number(e.target.value))} 
          onBlur={onBlur}
          readOnly={readOnly}
          className={cn(
            "w-full border rounded-lg pl-3 pr-8 py-2 font-mono text-[12px] font-bold transition-all",
            error ? "border-sleek-accent-red bg-sleek-accent-red/5 focus:ring-sleek-accent-red/20 focus:border-sleek-accent-red text-sleek-accent-red" : "border-sleek-border bg-sleek-bg/50 focus:ring-sleek-primary/20 focus:bg-sleek-card focus:border-sleek-primary",
            readOnly ? "bg-sleek-bg border-sleek-border cursor-not-allowed" : "",
            isAuto && !readOnly && !error && "border-sleek-primary/30 bg-blue-500/5"
          )}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold opacity-30">{suffix}</span>}
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[9px] text-sleek-accent-red font-bold"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
});

const SleekRow = React.memo(({ label, values, total, format, type, formula }: { label: string, values: number[], total: number, format: (n: number) => string, type?: 'subtotal' | 'added-value' | 'total', formula?: string }) => {
  return (
    <tr className={cn(
      "border-b border-sleek-border/20 transition-all group/row even:bg-sleek-bg/20", 
      type === 'subtotal' && "text-sleek-accent-red font-bold bg-red-500/5", 
      type === 'added-value' && "text-indigo-500 font-bold bg-indigo-500/5", 
      type === 'total' && "bg-blue-500/5 font-bold text-sleek-primary border-t border-sleek-primary shadow-sm"
    )}>
      <td className={cn(
        "p-4 text-left sticky left-0 z-40 border-r border-sleek-border font-bold text-sleek-text-muted transition-colors uppercase text-[9px] tracking-widest relative group/label cursor-help shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] w-[320px] min-w-[320px] max-w-[320px]", 
        type === 'added-value' ? "bg-indigo-500/10" : type === 'subtotal' ? "bg-red-500/10" : type === 'total' ? "bg-blue-500/10" : "bg-sleek-card group-hover/row:bg-sleek-bg group-even/row:bg-sleek-bg/50"
      )}>
        <div className="flex items-center gap-1.5 px-2">
          {label}
          {formula && <Info size={10} className="opacity-30 group-hover/label:opacity-100 transition-opacity" />}
        </div>
        {formula && (
          <div className="absolute left-[90%] bottom-full mb-2 opacity-0 group-hover/label:opacity-100 scale-95 group-hover/label:scale-100 transition-all duration-200 z-[100] w-64 p-4 bg-slate-900/95 text-white text-[10px] rounded-2xl shadow-xl pointer-events-none ring-1 ring-white/10 backdrop-blur-md normal-case tracking-normal font-sans">
             <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-2">
                <Calculator size={12} className="text-sleek-primary" />
                <span className="font-bold uppercase tracking-widest text-[9px] opacity-60">Logic Method</span>
             </div>
             <p className="leading-relaxed opacity-90">{formula}</p>
             <div className="absolute top-full left-4 border-8 border-transparent border-t-slate-900/95"></div>
          </div>
        )}
      </td>
      {values.map((v, i) => (
        <td key={i} className="p-4 text-right whitespace-nowrap tabular-nums text-xs font-medium opacity-80 group-hover/row:opacity-100 group-hover/row:scale-105 transition-all duration-200 min-w-[160px] w-[160px] max-w-[160px]">
          {format(v)}
        </td>
      ))}
      <td className={cn(
        "p-4 text-right font-bold whitespace-nowrap tabular-nums text-sm z-40 sticky right-0 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-all duration-200 min-w-[180px] w-[180px] max-w-[180px]", 
        type === 'added-value' ? "bg-indigo-500/10" : type === 'subtotal' ? "bg-red-500/10" : type === 'total' ? "bg-blue-500/10" : "bg-sleek-bg group-hover/row:bg-sleek-bg/70 group-hover/row:scale-105"
      )}>
        {format(total)}
      </td>
    </tr>
  );
}, (prevProps, nextProps) => {
  if (prevProps.label !== nextProps.label) return false;
  if (prevProps.total !== nextProps.total) return false;
  if (prevProps.type !== nextProps.type) return false;
  if (prevProps.formula !== nextProps.formula) return false;
  if (prevProps.values.length !== nextProps.values.length) return false;
  for (let i = 0; i < prevProps.values.length; i++) {
    if (prevProps.values[i] !== nextProps.values[i]) return false;
  }
  return true;
});

const DashboardKPI = React.memo(({ icon, label, value, suffix, formula }: { icon: React.ReactNode, label: string, value: string, suffix?: string, formula?: string }) => {
  return (
    <div className="bento-card group">
      <div className="w-12 h-12 bg-sleek-bg rounded-xl flex items-center justify-center text-sleek-primary shrink-0 border border-sleek-border group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div className="flex flex-col mt-4">
        <span className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-widest mb-1 flex items-center gap-1.5 opacity-60">
          {label}
          {formula && <Info size={10} className="hover:text-sleek-primary transition-colors" />}
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-sleek-text-main tracking-tight group-hover:text-sleek-primary transition-colors">{value}</span>
          {suffix && <span className="text-[10px] font-bold text-sleek-text-muted opacity-40 uppercase">{suffix}</span>}
        </div>
      </div>
      {formula && <FormulaTooltip formula={formula} />}
    </div>
  );
});

const YearEditCard = React.memo(({ 
  year, 
  idx, 
  calculatedYear, 
  amortTotals, 
  onUpdate,
  priceGranite,
  densityGranite,
  priceTuf,
  densityTuf,
  decimalPlaces
}: { 
  year: AnnualData, 
  idx: number, 
  calculatedYear: FullYearData, 
  amortTotals: SplitCosts, 
  onUpdate: (idx: number, field: keyof AnnualData, value: number) => void,
  priceGranite: number,
  densityGranite: number,
  priceTuf: number,
  densityTuf: number,
  decimalPlaces: number
}) => {
  return (
    <div className="bg-sleek-card rounded-2xl border border-sleek-border shadow-sm p-8 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-sleek-bg rounded-xl flex items-center justify-center font-extrabold text-sm text-sleek-text-muted border border-sleek-border">{year.year}</div>
          <div>
            <h3 className="font-bold text-sleek-text-main text-lg tracking-tight">Exercice Annuel {year.year}</h3>
            <span className="text-[10px] uppercase font-bold tracking-widest text-sleek-text-muted opacity-60">Prévisions Financières</span>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-red-500/10 px-5 py-3 rounded-xl border border-red-500/20">
          <TrendingDown size={18} className="text-sleek-accent-red"/>
          <div className="flex flex-col">
             <span className="text-[10px] font-bold text-red-400 uppercase leading-none">Dotation Amortiss. </span>
             <span className="text-lg font-mono font-bold text-sleek-accent-red leading-none mt-1">{formatCurrency(amortTotals.granite[idx] + amortTotals.tuf[idx] + amortTotals.common[idx])} DA</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-6 mb-8 pt-6 border-t border-sleek-border">
        <div className="flex flex-col gap-2">
           <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest pl-1">Section Granite</span>
           <InputGroup label="Extraction (m³)" value={year.extractionGranite} onChange={(v) => onUpdate(idx, 'extractionGranite', v)} suffix="m³" />
           <div className="bg-sleek-bg/50 p-3 rounded-xl border border-sleek-border flex flex-col gap-2 mt-1">
             <div className="flex justify-between items-center text-[10px] font-bold text-sleek-text-muted">
               <span>Poids :</span>
               <span className="font-mono text-sleek-text-main">
                 {((year.extractionGranite || 0) * densityGranite).toLocaleString('fr-DZ', { maximumFractionDigits: decimalPlaces, minimumFractionDigits: decimalPlaces })} T
               </span>
             </div>
             <div className="flex justify-between items-center text-[10px] font-bold text-sleek-text-muted">
               <span>Revenus :</span>
               <span className={cn("font-mono font-extrabold", priceGranite <= 0 ? "text-amber-500 text-[9px]" : "text-sleek-primary")}>
                 {priceGranite <= 0 
                   ? "Prix requis" 
                   : `${formatCurrency(calculatedYear.caGranite)} DA`}
               </span>
             </div>
           </div>
        </div>
        <div className="flex flex-col gap-2">
           <span className="text-[10px] font-extrabold text-amber-500 uppercase tracking-widest pl-1">Section Tuf</span>
           <InputGroup label="Extraction (T)" value={year.extractionTuf} onChange={(v) => onUpdate(idx, 'extractionTuf', v)} suffix="T" />
           <div className="bg-sleek-bg/50 p-3 rounded-xl border border-sleek-border flex flex-col gap-2 mt-1">
             <div className="flex justify-between items-center text-[10px] font-bold text-sleek-text-muted">
               <span>Volume :</span>
               <span className="font-mono text-sleek-text-main">
                 {densityTuf > 0 
                   ? ((year.extractionTuf || 0) / densityTuf).toLocaleString('fr-DZ', { maximumFractionDigits: decimalPlaces, minimumFractionDigits: decimalPlaces })
                   : "0,00"} m³
               </span>
             </div>
             <div className="flex justify-between items-center text-[10px] font-bold text-sleek-text-muted">
               <span>Revenus :</span>
               <span className={cn("font-mono font-extrabold", priceTuf <= 0 ? "text-amber-500 text-[9px]" : "text-sleek-primary")}>
                 {priceTuf <= 0 
                   ? "Prix requis" 
                   : `${formatCurrency(calculatedYear.caTuf)} DA`}
               </span>
             </div>
           </div>
        </div>
        <div className="flex flex-col gap-2">
           <span className="text-[10px] font-extrabold text-sleek-text-muted uppercase tracking-widest pl-1">Charges Directes</span>
           <InputGroup 
             label="Matières & Cons." 
             value={calculatedYear.matieresFournitures} 
             onChange={(v) => onUpdate(idx, 'matieresFournitures', v)} 
             isAuto={true} 
             formula="Fuel + Élec + Accessoires calculés + Saisie Manuelle"
           />
           <InputGroup 
             label="Services & Entret." 
             value={calculatedYear.services} 
             onChange={(v) => onUpdate(idx, 'services', v)} 
             isAuto={false}
           />
           <InputGroup 
             label="Masse Salariale" 
             value={calculatedYear.fraisPersonnel} 
             onChange={(v) => onUpdate(idx, 'fraisPersonnel', v)} 
             suffix="DA" 
             isAuto={true} 
             formula="Injection directe des RH + Saisie Manuelle additionnelle"
           />
           <InputGroup 
             label="Amortissements" 
             value={calculatedYear.dotationsAmortissements} 
             onChange={(v) => onUpdate(idx, 'dotationsAmortissements', v)} 
             suffix="DA" 
             isAuto={true} 
             formula="Injection directe des Amortissements + Saisie Manuelle"
           />
        </div>
        <div className="flex flex-col gap-2">
           <span className="text-[10px] font-extrabold text-sleek-text-muted uppercase tracking-widest pl-1">Charges Induites</span>
           <InputGroup label="Impôts & Taxes" value={year.impotsTaxes} onChange={(v) => onUpdate(idx, 'impotsTaxes', v)} />
           <InputGroup label="Frais Financiers" value={year.fraisFinanciers} onChange={(v) => onUpdate(idx, 'fraisFinanciers', v)} />
        </div>
      </div>
    </div>
  );
});

function CodeExport({ title, code, icon }: { title: string, code: string, icon: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="bg-[#1e293b] rounded-2xl border border-white/10 overflow-hidden flex flex-col h-full shadow-2xl relative">
      <div className="bg-white/5 px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2 text-white/50"><span className="text-sleek-primary">{icon}</span><span className="text-[10px] font-bold uppercase tracking-widest">{title}</span></div>
        <button onClick={copy} className="p-2 text-white/40 hover:text-white transition-colors bg-white/5 rounded-lg border border-white/5">{copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}</button>
      </div>
      <div className="flex-1 overflow-auto p-6 font-mono text-[10px] text-sky-200/50 leading-relaxed scrollbar-thin scrollbar-thumb-white/10"><pre><code>{code}</code></pre></div>
    </div>
  );
}

function HelpCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <div className={cn("p-6 rounded-3xl border border-sleek-border shadow-sm transition-all hover:shadow-md hover:scale-[1.02]", color)}>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 bg-sleek-card/50 backdrop-blur rounded-xl flex items-center justify-center shadow-sm border border-sleek-border">
          {icon}
        </div>
        <h4 className="font-extrabold text-sm text-sleek-text-main leading-tight uppercase tracking-tight">{title}</h4>
      </div>
      <p className="text-xs text-sleek-text-muted leading-relaxed font-medium">
        {description}
      </p>
    </div>
  );
}

function AssumptionItem({ title, description }: { title: string, description: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-sleek-border rounded-2xl overflow-hidden shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-sleek-bg/50 hover:bg-sleek-bg transition-colors text-left"
      >
        <span className="text-sm font-bold text-sleek-text-main">{title}</span>
        <PlusCircle size={16} className={cn("text-sleek-text-muted transition-transform duration-300", isOpen && "rotate-45")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-sleek-card"
          >
            <div className="p-4 text-xs font-medium text-sleek-text-muted leading-relaxed border-t border-sleek-border">
              {description}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TokenCard({ label, hex, variable }: { label: string, hex: string, variable: string }) {
  return (
    <div className="bg-sleek-card p-5 rounded-2xl border border-sleek-border shadow-sm flex flex-col gap-3 group hover:scale-105 transition-all">
      <div className="w-full h-16 rounded-xl border border-white/5 shadow-inner" style={{ backgroundColor: hex }}></div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-widest text-sleek-text-muted opacity-40">{label}</span>
        <span className="text-xs font-mono font-bold mt-1 uppercase">{hex}</span>
        <span className="text-[9px] font-mono opacity-30 mt-0.5">{variable}</span>
      </div>
    </div>
  );
}
