import React, { useState, useMemo, useEffect } from 'react';
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
  TrendingDown,
  Trash,
  Info,
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
  Undo2,
  Redo2,
  BookOpen,
  History,
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
  Cell
} from 'recharts';
import { cn } from './lib/utils';
import { AnnualData, Equipment, EmployeeRole, HRConfig, OperationalMachine, OperationalConfig, InvestmentCategory, CalculationSnapshot, ElectricityLine, ElectricityConfig, AccessoryConfig, AccessoryItem, Allocation, AccessoryCalculationMode, ProductionDimensioning } from './types';
import { calculateYear, calculateTotals, getAmortizationSchedule, getHRCosts, getOperationalCosts, getElectricityCosts, getAccessoryCosts } from './lib/calculations';
import { KOTLIN_VIEWMODEL, LAYOUT_XML } from './lib/androidCodeTemplates';

const INITIAL_YEARS: AnnualData[] = Array.from({ length: 10 }, (_, i) => ({
  year: i + 1,
  extractionGranite: 0,
  caGranite: 0,
  extractionTuf: 0,
  caTuf: 0,
  matieresFournitures: 0,
  services: 0,
  fraisPersonnel: 0,
  impotsTaxes: 0,
  fraisFinanciers: 0,
  dotationsAmortissements: 0,
}));

const INITIAL_EQUIPMENTS: Equipment[] = [
  { id: '1', designation: 'Camion (18 m3)', price: 11000000, duration: 5, category: "Équipements Lourds & Matériel", allocation: 'Common' },
  { id: '2', designation: 'Chargeuse sur pneu', price: 12500000, duration: 5, category: "Équipements Lourds & Matériel", allocation: 'Common' },
  { id: '3', designation: 'Camion-citerne', price: 8500000, duration: 5, category: "Équipements Lourds & Matériel", allocation: 'Common' },
  { id: '4', designation: 'Véhicule tout terrain', price: 4000000, duration: 5, category: "Équipements Lourds & Matériel", allocation: 'Common' },
  { id: '5', designation: 'Groupe Electrogène', price: 200000, duration: 5, category: "Équipements Lourds & Matériel", allocation: 'Common' },
  { id: '6', designation: 'Acquisition de Titre', price: 1000000, duration: 5, category: "Frais préliminaires & Exploration", allocation: 'Common' },
  { id: '7', designation: 'Etudes générales', price: 500000, duration: 5, category: "Frais préliminaires & Exploration", allocation: 'Common' },
  { id: '8', designation: 'Travaux préparatoires', price: 3000000, duration: 0, category: "Infrastructures & Bâtiments", allocation: 'Common' },
  { id: '9', designation: 'Remise en état des lieux', price: 500000, duration: 0, category: "Infrastructures & Bâtiments", allocation: 'Common' },
];

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
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

export default function App() {
  const SAVE_KEY = 'graniteapp_saved_state_v1';

  // Helper to load initial state from localStorage
  const loadInitialState = () => {
    try {
      const saved = window.localStorage.getItem(SAVE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Erreur lors du chargement de la sauvegarde :", e);
    }
    return null;
  };

  const initialState = loadInitialState();

  const [userNotes, setUserNotes] = useState<string>(initialState?.userNotes ?? '');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'prod' | 'edit' | 'table' | 'invest' | 'hr' | 'ops' | 'elec' | 'acc' | 'charts' | 'code' | 'about' | 'help'>('dashboard');
  const [years, setYears] = useState<AnnualData[]>(initialState?.years ?? INITIAL_YEARS);
  const [equipments, setEquipments] = useState<Equipment[]>(initialState?.equipments ?? INITIAL_EQUIPMENTS);
  const [ibmRate, setIbmRate] = useState<number>(initialState?.ibmRate ?? 0.12);

  // HR State
  const [roles, setRoles] = useState<EmployeeRole[]>(initialState?.roles ?? []);
  const [hrConfig, setHrConfig] = useState<HRConfig>(initialState?.hrConfig ?? {
    socialChargesRate: 0.26,
    annualIncreaseRate: 0.03,
    paidMonths: 12
  });

  // Operational State
  const [machines, setMachines] = useState<OperationalMachine[]>(() => {
    const base = initialState?.machines ?? [];
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

  // Electricity State
  const [electricityLines, setElectricityLines] = useState<ElectricityLine[]>(() => {
    const base = initialState?.electricityLines ?? [];
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
  const [accessoryConfig, setAccessoryConfig] = useState<AccessoryConfig>(initialState?.accessoryConfig ?? {
    items: []
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
  const [productionConfig, setProductionConfig] = useState<ProductionDimensioning>(initialState?.productionConfig ?? {
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
  });

  const [dmVs, setDmVs] = useState(initialState?.dmParams?.vs ?? '20');
  const [dmCfu, setDmCfu] = useState(initialState?.dmParams?.cfu ?? '0.5');
  const [dmHj, setDmHj] = useState(initialState?.dmParams?.hj ?? '8');
  const [dmJa, setDmJa] = useState(initialState?.dmParams?.ja ?? '250');
  const [dmN, setDmN] = useState(initialState?.dmParams?.n ?? '1');

  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSave = () => {
    try {
      const stateToSave = {
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
        dmParams: { vs: dmVs, cfu: dmCfu, hj: dmHj, ja: dmJa, n: dmN },
        productionConfig,
        lastSaved: new Date().toISOString()
      };
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(stateToSave));
      setSaveMessage("Sauvegarde réussie !");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (e) {
      console.error("Erreur lors de la sauvegarde :", e);
      alert("Erreur lors de la sauvegarde.");
    }
  };

  const handleResetSave = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer la sauvegarde ? Toutes les données non enregistrées seront perdues au rechargement.")) {
      window.localStorage.removeItem(SAVE_KEY);
      window.location.reload();
    }
  };

  // Reset Application Data (Full reset)
  const handleResetData = () => {
    if (window.confirm("Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible et effacera toute votre étude en cours.")) {
      window.localStorage.clear();
      window.location.reload();
    }
  };
  
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
  
  // New equipment form state
  const [newEqName, setNewEqName] = useState('');
  const [newEqPrice, setNewEqPrice] = useState('');
  const [newEqDuration, setNewEqDuration] = useState('');
  const [newEqCategory, setNewEqCategory] = useState<InvestmentCategory>("Équipements Lourds & Matériel");
  const [newEqAlloc, setNewEqAlloc] = useState<'Granite' | 'Tuf' | 'Common'>('Common');
  
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

  // 6. Final TCR Calculation (using the manual data + automated overrides inside calculateYear)
  const calculatedYears = useMemo(() => 
    years.map((y, idx) => calculateYear(y, ibmRate, opResults.fuel, opResults.maintenance, hrTotals, amortResults.annualTotals, electricityResults, accessoryResults, idx)), 
  [years, ibmRate, opResults, hrTotals, amortResults, electricityResults, accessoryResults]);

  const totalRow = useMemo(() => calculateTotals(calculatedYears), [calculatedYears]);
  const totalInvestment = useMemo(() => equipments.reduce((sum, e) => sum + e.price, 0), [equipments]);

  const handleUpdateYear = (yearIndex: number, field: keyof AnnualData, value: number) => {
    const newYears = [...years];
    newYears[yearIndex] = { ...newYears[yearIndex], [field]: value };
    setYears(newYears);
  };

  const addEquipment = () => {
    if (!newEqName || !newEqPrice) return;
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
  };

  const removeEquipment = (id: string) => {
    setEquipments(equipments.filter(e => e.id !== id));
  };

  const addRole = () => {
    if (!newRoleName || !newRoleCount || !newRoleSalary) return;
    const role: EmployeeRole = {
      id: Math.random().toString(36).substr(2, 9),
      designation: newRoleName,
      count: Number(newRoleCount),
      monthlySalary: Number(newRoleSalary),
      allocation: newRoleAlloc
    };
    setRoles([...roles, role]);
    setNewRoleName('');
    setNewRoleCount('');
    setNewRoleSalary('');
  };

  const removeRole = (id: string) => {
    setRoles(roles.filter(r => r.id !== id));
  };

  const addMachine = () => {
    if (!newOpName || !newOpPower || !newOpCount) return;
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
    if (!newElecName || !newElecPower) return;
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
  };

  const removeElectricityLine = (id: string) => {
    setElectricityLines(electricityLines.filter(l => l.id !== id));
  };

  const addAccessory = () => {
    if (newAccName.trim() === '' || newAccQty === '' || newAccPrice === '') return;
    
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
  };

  const removeAccessory = (id: string) => {
    setAccessoryConfig({
      ...accessoryConfig,
      items: accessoryConfig.items.filter(item => item.id !== id)
    });
  };

  const updateAccessoryField = (id: string, field: keyof AccessoryItem, value: any) => {
    setAccessoryConfig(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const applyDiamondCalculation = () => {
    const vs = Number(dmVs) || 0;
    const cfu = Number(dmCfu) || 0;
    const hj = Number(dmHj) || 0;
    const ja = Number(dmJa) || 0;
    const n = Number(dmN) || 0;
    const qty = vs * cfu * hj * ja * n;
    setDmQty(qty.toString());
    setIsDiamondModalOpen(false);
  };

  const addDiamondAccessory = () => {
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
  };

  const formatCurrency = (n: number) => {
    if (n === undefined || n === null || isNaN(n)) return '0';
    return new Intl.NumberFormat('fr-DZ', { style: 'decimal', maximumFractionDigits: 0 }).format(n);
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

  const chartData = useMemo(() => calculatedYears.map(y => ({
    name: `An ${y.year}`,
    "Chiffre d'affaires": y.caGlobal,
    "Frais de Personnel": y.fraisPersonnel,
    "Matières et Fournitures": y.matieresFournitures,
    "Amortissements": y.dotationsAmortissements,
    "Résultat Net": y.resultatNet,
    "Cash-Flow (FNT)": y.fnt
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

    const formatVal = (v: number) => {
      if (v === undefined || v === null || isNaN(v)) return "0";
      // Round and format with comma for French Excel
      return Math.round(v).toString().replace(".", ",");
    };

    const rows = [
      ["EXTRACTION GRANITE (T)", ...calculatedYears.map(y => y.extractionGranite), totalRow.extractionGranite],
      ["EXTRACTION TUF (T)", ...calculatedYears.map(y => y.extractionTuf), totalRow.extractionTuf],
      ["CHIFFRE AFFAIRES GRANITE (DA)", ...calculatedYears.map(y => y.caGranite), totalRow.caGranite],
      ["CHIFFRE AFFAIRES TUF (DA)", ...calculatedYears.map(y => y.caTuf), totalRow.caTuf],
      ["CHIFFRE AFFAIRES GLOBAL (DA)", ...calculatedYears.map(y => y.caGlobal), totalRow.caGlobal],
      ["Matieres & Four. Cons. (DA)", ...calculatedYears.map(y => y.matieresFournitures), totalRow.matieresFournitures],
      ["Services (DA)", ...calculatedYears.map(y => y.services), totalRow.services],
      ["VALEUR AJOUTEE (DA)", ...calculatedYears.map(y => y.valeurAjoutee), totalRow.valeurAjoutee],
      ["Charges de Personnel (DA)", ...calculatedYears.map(y => y.fraisPersonnel), totalRow.fraisPersonnel],
      ["Impots & Taxes (DA)", ...calculatedYears.map(y => y.impotsTaxes), totalRow.impotsTaxes],
      ["Charges financieres (DA)", ...calculatedYears.map(y => y.fraisFinanciers), totalRow.fraisFinanciers],
      ["Dotations aux amortissements (DA)", ...calculatedYears.map(y => y.dotationsAmortissements), totalRow.dotationsAmortissements],
      ["RESULTAT D'EXPLOITATION (DA)", ...calculatedYears.map(y => y.resultatExploitation), totalRow.resultatExploitation],
      ["Impots sur les benefices (IBM) (DA)", ...calculatedYears.map(y => y.ibm), totalRow.ibm],
      ["RESULTAT NET (DA)", ...calculatedYears.map(y => y.resultatNet), totalRow.resultatNet],
      ["CAPACITE D'AUTOFINANCEMENT (FNT) (DA)", ...calculatedYears.map(y => y.fnt), totalRow.fnt],
      ["PRIX REVIENT GRANITE (DA/T)", ...calculatedYears.map(y => y.prixRevientGranite), totalRow.prixRevientGranite],
      ["PRIX REVIENT TUF (DA/T)", ...calculatedYears.map(y => y.prixRevientTuf), totalRow.prixRevientTuf],
    ];

    const csvContent = BOM + [
      headers.join(DELIMITER),
      ...rows.map(row => row.map(val => typeof val === 'number' ? formatVal(val) : val).join(DELIMITER))
    ].join("\n");

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

  const paybackYear = useMemo(() => {
    let cumulative = -totalInvestment;
    for (const y of calculatedYears) {
      cumulative += y.fnt;
      if (cumulative >= 0) return y.year;
    }
    return 'N/A';
  }, [calculatedYears, totalInvestment]);

  return (
    <div className="flex h-screen bg-sleek-bg overflow-hidden font-sans">
      {/* Sidebar - Sleek Theme */}
      <aside className="w-64 bg-sleek-sidebar text-white flex flex-col shrink-0 overflow-y-auto shadow-2xl z-50">
        <div className="p-8 pb-10 flex items-center gap-3">
          <div className="w-8 h-8 bg-sleek-primary rounded-lg flex items-center justify-center shadow-lg shadow-sleek-primary/20">
            <Calculator size={18} />
          </div>
          <span className="font-extrabold text-xl tracking-tight">GraniteApp</span>
        </div>

        <nav className="flex-1 space-y-1">
            <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <NavItem active={activeTab === 'prod'} onClick={() => setActiveTab('prod')} icon={<Mountain size={18} />} label="Production" />
            <NavItem active={activeTab === 'invest'} onClick={() => setActiveTab('invest')} icon={<HardDrive size={18} />} label="Investissements" />
            <NavItem active={activeTab === 'hr'} onClick={() => setActiveTab('hr')} icon={<Users size={18} />} label="Ressources Humaines" />
            <NavItem active={activeTab === 'ops'} onClick={() => setActiveTab('ops')} icon={<Fuel size={18} />} label="Carburant & Maint." />
            <NavItem active={activeTab === 'elec'} onClick={() => setActiveTab('elec')} icon={<Zap size={18} />} label="Électricité" />
            <NavItem active={activeTab === 'acc'} onClick={() => setActiveTab('acc')} icon={<PlusCircle size={18} />} label="Coûts Accessoires" />
            <NavItem active={activeTab === 'edit'} onClick={() => setActiveTab('edit')} icon={<Edit3 size={18} />} label="Saisie TCR" />
            <NavItem active={activeTab === 'table'} onClick={() => setActiveTab('table')} icon={<TableIcon size={18} />} label="Rapports TCR" />
            <NavItem active={activeTab === 'charts'} onClick={() => setActiveTab('charts')} icon={<Activity size={18} />} label="Analyses Graphiques" />
            <NavItem active={activeTab === 'help'} onClick={() => setActiveTab('help')} icon={<BookOpen size={18} />} label="Aide & Manuel" />
            <NavItem active={activeTab === 'code'} onClick={() => setActiveTab('code')} icon={<Smartphone size={18} />} label="Export Android" />
            <NavItem active={activeTab === 'about'} onClick={() => setActiveTab('about')} icon={<Info size={18} />} label="À propos" />
            
            <div className="mt-8 px-8 space-y-3">
              <button 
                onClick={handleSave}
                className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-[2px] bg-sleek-primary text-white rounded-xl shadow-lg shadow-sleek-primary/20 hover:bg-blue-600 transition-all active:scale-95"
              >
                <Check size={16} />
                Enregistrer
              </button>

              <button 
                onClick={handleResetSave}
                className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-[2px] text-orange-400 hover:text-white hover:bg-orange-500/20 border border-orange-500/30 rounded-xl transition-all"
              >
                <History size={16} />
                Reset Save
              </button>

              <button 
                onClick={handleResetData}
                className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-[2px] text-red-400 hover:text-white hover:bg-red-500/20 border border-red-500/30 rounded-xl transition-all group"
              >
                <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                Effacer Tout
              </button>
            </div>
        </nav>

          <div className="p-8 border-t border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-sleek-primary animate-pulse"></div>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-50">Devise: Dinar Algérien (DA)</span>
            </div>
            <div className="text-[11px] opacity-30 font-medium">v1.4.0-dz-dinar</div>
          </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen relative">
        <AnimatePresence>
          {saveMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-6 py-2 rounded-full shadow-2xl font-bold text-xs tracking-widest flex items-center gap-2"
            >
              <Check size={14} />
              {saveMessage}
            </motion.div>
          )}
        </AnimatePresence>
        {/* Header */}
        <header className="p-8 pb-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-sleek-text-main">
              {activeTab === 'dashboard' && "Tableau de Bord Exécutif"}
              {activeTab === 'prod' && "Dimensionnement de la Production"}
              {activeTab === 'invest' && "Module Investissements & Amortissements"}
              {activeTab === 'hr' && "Gestion des Frais de Personnel"}
              {activeTab === 'ops' && "Calculateur Fuel & Maintenance"}
              {activeTab === 'elec' && "Électricité (Groupes électrogènes)"}
              {activeTab === 'acc' && "Gestion des Coûts Accessoires"}
              {activeTab === 'edit' && "Prévisions d'Exploitation"}
              {activeTab === 'table' && "Analyse des Comptes des Résultats"}
              {activeTab === 'charts' && "Visualisation Graphique du TCR"}
              {activeTab === 'code' && "Code Source Android (MVVM)"}
              {activeTab === 'help' && "Centre d'Aide & Documentation"}
              {activeTab === 'about' && "À propos du Concepteur"}
            </h1>
            <p className="text-sm text-sleek-text-muted mt-1">
              {activeTab === 'dashboard' && "Vue d'ensemble de la performance et de la rentabilité du projet."}
              {activeTab === 'prod' && "Planification des volumes et calcul des besoins en machines."}
              {activeTab === 'invest' && "Gestion des équipements et calcul automatique des annuités."}
              {activeTab === 'hr' && "Calcul automatique des charges sociales et projection sur 10 ans."}
              {activeTab === 'ops' && "Pilotage dynamique des consommations et entretien des engins."}
              {activeTab === 'elec' && "Dimensionnement et consommation diesel des groupes autonomes."}
              {activeTab === 'acc' && "Gestion extensible des intrants et consommables divers."}
              {activeTab === 'edit' && "Liaison dynamique totale activée (Amort., RH, Fuel, Maint.)."}
              {activeTab === 'table' && "Analyse consolidée du projet sur 10 ans."}
              {activeTab === 'charts' && "Graphiques interactifs des indicateurs de performance."}
              {activeTab === 'help' && "Guide complet des calculs et manuel d'utilisation de l'application."}
              {activeTab === 'about' && "Informations professionnelles sur le développeur de l'application."}
            </p>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex flex-col items-end bg-white px-4 py-2 rounded-xl border border-sleek-border shadow-sm">
                <span className="text-[10px] uppercase font-bold text-sleek-text-muted">Investissement Total (DA)</span>
                <span className="text-lg font-extrabold text-sleek-primary">{formatCurrency(totalInvestment)} DA</span>
             </div>
             <button 
               onClick={handleExportExcel}
               className="px-5 py-3 text-xs font-black bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-3 uppercase tracking-widest"
             >
               <FileSpreadsheet size={16}/> Exporter vers Excel
             </button>
          </div>
        </header>

        {/* Stats Grid - Minimal Summary */}
        <div className="px-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 shrink-0">
          <CompactStatCard 
            label="Tonnage Total" 
            value={`${formatCurrency(totalRow.extractionGranite + totalRow.extractionTuf)} T`} 
            formula="Somme totale des quantités extraites (Granite + Tuf) sur la période du projet."
          />
          <CompactStatCard 
            label="CA Global (10 ans)" 
            value={`${formatCurrency(totalRow.caGlobal / 1000000)} M DA`} 
            formula="Chiffre d'Affaires Global : Somme de tous les revenus générés par la vente des matériaux."
          />
          <CompactStatCard label="Cash-Flow (FNT)" value={`${formatCurrency(totalRow.fnt / 1000000)} M DA`} formula="Formule : Résultat Net + Dotations aux Amortissements" />
          <CompactStatCard label="Revient Granite" value={formatCompact(totalRow.prixRevientGranite)} formula="(Direct G. + Communs) / Tonnage" />
          <CompactStatCard label="Revient Tuf" value={formatCompact(totalRow.prixRevientTuf)} formula="(Direct T. + Communs) / Tonnage" />
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
                    suffix="DA/T" 
                    formula="(Direct(G) + Quote-part Communs) / Tonnage(G)"
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
                  <div className="col-span-2 bg-white rounded-2xl border border-sleek-border shadow-sm p-8">
                    <h3 className="text-sm font-bold mb-6 flex items-center gap-2 text-sleek-text-main">
                      <BarChartIcon size={18} className="text-sleek-primary"/> Rentabilité Annuelle sur 10 ans
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

                  <div className="bg-white rounded-2xl border border-sleek-border shadow-sm p-8">
                    <h3 className="text-sm font-bold mb-6 flex items-center gap-2 text-sleek-text-main">
                      <PieChart size={18} className="text-sleek-accent-red"/> Structure des Coûts Cumulés
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
                    <div className="bg-white p-8 rounded-[2rem] border border-sleek-border shadow-md space-y-6">
                      <h3 className="text-sm font-bold text-sleek-text-main flex items-center gap-2 border-b border-slate-50 pb-4 uppercase tracking-tighter">
                        <Settings size={16} className="text-sleek-primary" /> 1. Paramètres de Base
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-sleek-text-muted opacity-70 px-1">Matériau Concerné</label>
                          <select className="w-full bg-slate-50 border border-sleek-border rounded-xl px-4 py-3 text-sm font-semibold transition-all outline-none focus:ring-2 focus:ring-sleek-primary/10" disabled>
                            <option value="Granite">Granite (uniquement)</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-sleek-text-muted opacity-70 px-1">Horizon d'étude</label>
                            <select 
                              value={productionConfig.horizon}
                              onChange={(e) => setProductionConfig({...productionConfig, horizon: e.target.value as any})}
                              className="w-full bg-slate-50 border border-sleek-border rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-sleek-primary/10"
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
                                className="w-full bg-slate-50 border border-sleek-border rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-sleek-primary/10"
                              >
                                <option value="constant">Constant</option>
                                <option value="variable">Variable / an</option>
                              </select>
                            </div>
                          )}
                        </div>

                        <InputGroupVertical 
                          label="Volume annuel cible Vcible (m³/an)"
                          value={productionConfig.vTargetConstant.toString()}
                          onChange={(v) => setProductionConfig({...productionConfig, vTargetConstant: Number(v)})}
                          type="number"
                          helper="Volume final de blocs marchands à produire par an"
                        />
                      </div>
                    </div>

                    {/* Section 2: Chaîne de production */}
                    <div className="bg-white p-8 rounded-[2rem] border border-sleek-border shadow-md space-y-6">
                      <h3 className="text-sm font-bold text-sleek-text-main flex items-center gap-2 border-b border-slate-50 pb-4 uppercase tracking-tighter">
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
                              label="L (m)" value={productionConfig.steps.extraction.dimensions.l.toString()} 
                              onChange={(v) => {
                                const newConfig = {...productionConfig};
                                newConfig.steps.extraction.dimensions.l = Number(v);
                                setProductionConfig(newConfig);
                              }}
                              type="number"
                            />
                            <InputGroupVertical 
                              label="l (m)" value={productionConfig.steps.extraction.dimensions.w.toString()} 
                              onChange={(v) => {
                                const newConfig = {...productionConfig};
                                newConfig.steps.extraction.dimensions.w = Number(v);
                                setProductionConfig(newConfig);
                              }}
                              type="number"
                            />
                            <InputGroupVertical 
                              label="h (m)" value={productionConfig.steps.extraction.dimensions.h.toString()} 
                              onChange={(v) => {
                                const newConfig = {...productionConfig};
                                newConfig.steps.extraction.dimensions.h = Number(v);
                                setProductionConfig(newConfig);
                              }}
                              type="number"
                            />
                          </div>
                        </div>

                        {/* Step B: Retaille */}
                        <div className="space-y-4 pt-4 border-t border-slate-50">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full tracking-widest">Étape B : Retaille</span>
                            <span className="text-[11px] font-mono font-bold text-slate-400">
                              Vretaille = {(productionConfig.steps.retaille.dimensions.l * productionConfig.steps.retaille.dimensions.w * productionConfig.steps.retaille.dimensions.h).toFixed(3)} m³
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <InputGroupVertical 
                              label="L (m)" value={productionConfig.steps.retaille.dimensions.l.toString()} 
                              onChange={(v) => {
                                const newConfig = {...productionConfig};
                                newConfig.steps.retaille.dimensions.l = Number(v);
                                setProductionConfig(newConfig);
                              }}
                              type="number"
                            />
                            <InputGroupVertical 
                              label="l (m)" value={productionConfig.steps.retaille.dimensions.w.toString()} 
                              onChange={(v) => {
                                const newConfig = {...productionConfig};
                                newConfig.steps.retaille.dimensions.w = Number(v);
                                setProductionConfig(newConfig);
                              }}
                              type="number"
                            />
                            <InputGroupVertical 
                              label="h (m)" value={productionConfig.steps.retaille.dimensions.h.toString()} 
                              onChange={(v) => {
                                const newConfig = {...productionConfig};
                                newConfig.steps.retaille.dimensions.h = Number(v);
                                setProductionConfig(newConfig);
                              }}
                              type="number"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle and Right Column: Rendements & Capacités */}
                  <div className="lg:col-span-8 space-y-8">
                    {/* Section 3: Rendements */}
                    <div className="bg-white p-8 rounded-[2rem] border border-sleek-border shadow-md">
                      <h3 className="text-sm font-bold text-sleek-text-main flex items-center gap-2 border-b border-slate-50 pb-4 uppercase tracking-tighter mb-6">
                        <TrendingUp size={16} className="text-emerald-500" /> 3. Rendements & Pertes
                      </h3>

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
                        <div className="overflow-x-auto pb-4">
                          <table className="w-full text-left text-xs border-separate border-spacing-x-2">
                             <thead>
                               <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                 <th className="p-2">Année</th>
                                 {Array.from({length: 10}).map((_, i) => <th key={i} className="text-center">A{i+1}</th>)}
                               </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-50">
                               <tr>
                                 <td className="p-2 font-bold text-sleek-primary whitespace-nowrap">Vcible (m³)</td>
                                 {Array.from({length: 10}).map((_, i) => (
                                   <td key={i} className="p-1">
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
                                       className="w-full bg-slate-50 border border-slate-100 rounded-lg p-1.5 text-center font-mono font-bold outline-none focus:bg-white focus:border-sleek-primary"
                                     />
                                   </td>
                                 ))}
                               </tr>
                               <tr>
                                 <td className="p-2 font-bold text-emerald-600 whitespace-nowrap">η1 (Extrac.)</td>
                                 {Array.from({length: 10}).map((_, i) => (
                                   <td key={i} className="p-1">
                                     <input 
                                       type="number" step="0.01"
                                       value={productionConfig.yieldsVariable.eta1[i]}
                                       onChange={(e) => {
                                         const newVar = [...productionConfig.yieldsVariable.eta1];
                                         newVar[i] = Number(e.target.value);
                                         setProductionConfig({...productionConfig, yieldsVariable: {...productionConfig.yieldsVariable, eta1: newVar}});
                                       }}
                                       className="w-full bg-emerald-50/50 border border-emerald-100 rounded-lg p-1.5 text-center font-mono font-bold outline-none focus:bg-white focus:border-emerald-500"
                                     />
                                   </td>
                                 ))}
                               </tr>
                               <tr>
                                 <td className="p-2 font-bold text-indigo-600 whitespace-nowrap">η2 (Retail.)</td>
                                 {Array.from({length: 10}).map((_, i) => (
                                   <td key={i} className="p-1">
                                     <input 
                                       type="number" step="0.01"
                                       value={productionConfig.yieldsVariable.eta2[i]}
                                       onChange={(e) => {
                                         const newVar = [...productionConfig.yieldsVariable.eta2];
                                         newVar[i] = Number(e.target.value);
                                         setProductionConfig({...productionConfig, yieldsVariable: {...productionConfig.yieldsVariable, eta2: newVar}});
                                       }}
                                       className="w-full bg-indigo-50/50 border border-indigo-100 rounded-lg p-1.5 text-center font-mono font-bold outline-none focus:bg-white focus:border-indigo-500"
                                     />
                                   </td>
                                 ))}
                               </tr>
                             </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Section 4: Capacités Machines */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Extraction Machine */}
                      <div className="bg-white p-8 rounded-[2rem] border border-sleek-border shadow-md space-y-6">
                        <h3 className="text-sm font-bold text-sleek-text-main flex items-center gap-2 border-b border-slate-50 pb-4 uppercase tracking-tighter">
                          <HardHat size={16} className="text-sleek-primary" /> Capacité Extraction
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                           <InputGroupVertical label="Vs (m²/h)" value={productionConfig.steps.extraction.productivity.vs.toString()} onChange={(v) => {
                             const newConfig = {...productionConfig};
                             newConfig.steps.extraction.productivity.vs = Number(v);
                             setProductionConfig(newConfig);
                           }} type="number" />
                           <InputGroupVertical label="h_eq (m)" value={productionConfig.steps.extraction.productivity.hEq.toString()} onChange={(v) => {
                             const newConfig = {...productionConfig};
                             newConfig.steps.extraction.productivity.hEq = Number(v);
                             setProductionConfig(newConfig);
                           }} type="number" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <InputGroupVertical label="H (h/j)" value={productionConfig.steps.extraction.productivity.hoursPerDay.toString()} onChange={(v) => {
                             const newConfig = {...productionConfig};
                             newConfig.steps.extraction.productivity.hoursPerDay = Number(v);
                             setProductionConfig(newConfig);
                           }} type="number" />
                           <InputGroupVertical label="J (j/an)" value={productionConfig.steps.extraction.productivity.daysPerYear.toString()} onChange={(v) => {
                             const newConfig = {...productionConfig};
                             newConfig.steps.extraction.productivity.daysPerYear = Number(v);
                             setProductionConfig(newConfig);
                           }} type="number" />
                        </div>
                        <InputGroupVertical label="Taux d'Utilisation U" value={productionConfig.steps.extraction.productivity.utilizationRate.toString()} onChange={(v) => {
                          const newConfig = {...productionConfig};
                          newConfig.steps.extraction.productivity.utilizationRate = Number(v);
                          setProductionConfig(newConfig);
                        }} type="number" helper="Valeur entre 0 et 1 (Défaut 1)" />
                      </div>

                      {/* Retaille Machine */}
                      <div className="bg-white p-8 rounded-[2rem] border border-sleek-border shadow-md space-y-6">
                        <h3 className="text-sm font-bold text-sleek-text-main flex items-center gap-2 border-b border-slate-50 pb-4 uppercase tracking-tighter">
                          <Settings size={16} className="text-indigo-600" /> Capacité Retaille
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                           <InputGroupVertical label="Vs (m²/h)" value={productionConfig.steps.retaille.productivity.vs.toString()} onChange={(v) => {
                             const newConfig = {...productionConfig};
                             newConfig.steps.retaille.productivity.vs = Number(v);
                             setProductionConfig(newConfig);
                           }} type="number" />
                           <InputGroupVertical label="h_eq (m)" value={productionConfig.steps.retaille.productivity.hEq.toString()} onChange={(v) => {
                             const newConfig = {...productionConfig};
                             newConfig.steps.retaille.productivity.hEq = Number(v);
                             setProductionConfig(newConfig);
                           }} type="number" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <InputGroupVertical label="H (h/j)" value={productionConfig.steps.retaille.productivity.hoursPerDay.toString()} onChange={(v) => {
                             const newConfig = {...productionConfig};
                             newConfig.steps.retaille.productivity.hoursPerDay = Number(v);
                             setProductionConfig(newConfig);
                           }} type="number" />
                           <InputGroupVertical label="J (j/an)" value={productionConfig.steps.retaille.productivity.daysPerYear.toString()} onChange={(v) => {
                             const newConfig = {...productionConfig};
                             newConfig.steps.retaille.productivity.daysPerYear = Number(v);
                             setProductionConfig(newConfig);
                           }} type="number" />
                        </div>
                        <InputGroupVertical label="Taux d'Utilisation U" value={productionConfig.steps.retaille.productivity.utilizationRate.toString()} onChange={(v) => {
                          const newConfig = {...productionConfig};
                          newConfig.steps.retaille.productivity.utilizationRate = Number(v);
                          setProductionConfig(newConfig);
                        }} type="number" helper="Valeur entre 0 et 1 (Défaut 1)" />
                      </div>
                    </div>

                    {/* Section 5: Résultats */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl space-y-8">
                       <div className="flex items-center justify-between border-b border-white/10 pb-6">
                         <h3 className="text-xl font-black flex items-center gap-3">
                           <LayoutDashboard size={24} className="text-sleek-primary" /> Résultats du Dimensionnement
                         </h3>
                         <div className="text-[10px] font-black uppercase text-white/50 tracking-[0.3em]">Synthèse Technique</div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                         {(() => {
                           // Quick Calc for first year for KPI display
                           const vTarget = productionConfig.horizon === '1y' ? productionConfig.vTargetConstant : (productionConfig.targetMode === 'constant' ? productionConfig.vTargetConstant : productionConfig.vTargetVariable[0]);
                           const eta1 = productionConfig.horizon === '1y' ? productionConfig.yieldsConstant.eta1 : productionConfig.yieldsVariable.eta1[0];
                           const eta2 = productionConfig.horizon === '1y' ? productionConfig.yieldsConstant.eta2 : productionConfig.yieldsVariable.eta2[0];
                           const etaTot = eta1 * eta2;
                           const vAmont = vTarget / (etaTot || 1);
                           
                           const vgros = productionConfig.steps.extraction.dimensions.l * productionConfig.steps.extraction.dimensions.w * productionConfig.steps.extraction.dimensions.h;
                           const vretaille = productionConfig.steps.retaille.dimensions.l * productionConfig.steps.retaille.dimensions.w * productionConfig.steps.retaille.dimensions.h;
                           
                           const capA = productionConfig.steps.extraction.productivity.vs * productionConfig.steps.extraction.productivity.hEq * productionConfig.steps.extraction.productivity.hoursPerDay * productionConfig.steps.extraction.productivity.daysPerYear * productionConfig.steps.extraction.productivity.utilizationRate;
                           const capB = productionConfig.steps.retaille.productivity.vs * productionConfig.steps.retaille.productivity.hEq * productionConfig.steps.retaille.productivity.hoursPerDay * productionConfig.steps.retaille.productivity.daysPerYear * productionConfig.steps.retaille.productivity.utilizationRate;
                           
                           const na = Math.ceil(vAmont / (capA || 1));
                           const nb = Math.ceil(vTarget / (capB || 1));

                           return (
                             <>
                               <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col gap-2">
                                  <span className="text-[9px] font-black uppercase text-white/40 tracking-widest leading-none">V_amont Tout-Venant</span>
                                  <span className="text-2xl font-mono font-black text-sleek-primary">{vAmont.toLocaleString('fr-DZ', {maximumFractionDigits: 0})} <span className="text-xs font-sans opacity-40">m³/an</span></span>
                                  <p className="text-[9px] text-white/30 italic">Volume à extraire pour compenser les pertes</p>
                               </div>
                               <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col gap-2">
                                  <span className="text-[9px] font-black uppercase text-white/40 tracking-widest leading-none">Nb Machines Requises</span>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-2xl font-mono font-black text-emerald-400">{na} <span className="text-[10px] font-sans opacity-40 uppercase">Extraction</span></span>
                                    <span className="text-2xl font-mono font-black text-indigo-400">{nb} <span className="text-[10px] font-sans opacity-40 uppercase">Retaille</span></span>
                                  </div>
                               </div>
                               <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col gap-2">
                                  <span className="text-[9px] font-black uppercase text-white/40 tracking-widest leading-none">Logistique Annuelle</span>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-sm font-bold text-white"><span className="text-blue-400">{Math.ceil(vAmont/vgros)}</span> Gros blocs</span>
                                    <span className="text-sm font-bold text-white"><span className="text-indigo-400">{Math.ceil(vTarget/vretaille)}</span> Blocs retaille</span>
                                  </div>
                               </div>
                               <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col gap-2 shadow-inner">
                                  <span className="text-[9px] font-black uppercase text-white/40 tracking-widest leading-none">Analyse Critique</span>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-sm font-bold text-white flex items-center gap-2">
                                       Bottleneck: <span className={na >= nb ? "text-emerald-400" : "text-indigo-400"}>{na >= nb ? "Extraction" : "Retaille"}</span>
                                    </span>
                                    <span className="text-sm font-bold text-white flex items-center gap-2">
                                       Nmax: <span className="text-sleek-primary">{Math.max(na, nb)} machines</span>
                                    </span>
                                  </div>
                               </div>
                             </>
                           );
                         })()}
                       </div>

                       {/* 10 Year Result Table */}
                       {productionConfig.horizon === '10y' && (
                         <div className="mt-8 overflow-x-auto rounded-2xl border border-white/5">
                            <table className="w-full text-[10px] border-collapse min-w-[900px]">
                               <thead>
                                 <tr className="bg-white/10 text-white/60 font-black uppercase tracking-widest">
                                   <th className="p-4 text-left border-b border-white/5">Indicateurs / Année</th>
                                   {Array.from({length: 10}).map((_, i) => <th key={i} className="p-4 border-b border-white/5">A{i+1}</th>)}
                                 </tr>
                               </thead>
                               <tbody>
                                 {(() => {
                                   const indicators = [];
                                   const vTargetRef = productionConfig.targetMode === 'constant' ? Array(10).fill(productionConfig.vTargetConstant) : productionConfig.vTargetVariable;
                                   const eta1Ref = productionConfig.yieldsVariable.eta1;
                                   const eta2Ref = productionConfig.yieldsVariable.eta2;
                                   const vgros = productionConfig.steps.extraction.dimensions.l * productionConfig.steps.extraction.dimensions.w * productionConfig.steps.extraction.dimensions.h;
                                   const vretaille = productionConfig.steps.retaille.dimensions.l * productionConfig.steps.retaille.dimensions.w * productionConfig.steps.retaille.dimensions.h;
                                   const capA = productionConfig.steps.extraction.productivity.vs * productionConfig.steps.extraction.productivity.hEq * productionConfig.steps.extraction.productivity.hoursPerDay * productionConfig.steps.extraction.productivity.daysPerYear * productionConfig.steps.extraction.productivity.utilizationRate;
                                   const capB = productionConfig.steps.retaille.productivity.vs * productionConfig.steps.retaille.productivity.hEq * productionConfig.steps.retaille.productivity.hoursPerDay * productionConfig.steps.retaille.productivity.daysPerYear * productionConfig.steps.retaille.productivity.utilizationRate;

                                   const rowVAmont = Array.from({length: 10}, (_, i) => vTargetRef[i] / ((eta1Ref[i] * eta2Ref[i]) || 1));
                                   const rowNbGros = rowVAmont.map(v => Math.ceil(v/vgros));
                                   const rowNbRetaille = vTargetRef.map(v => Math.ceil(v/vretaille));
                                   const rowNa = rowVAmont.map(v => Math.ceil(v/capA));
                                   const rowNb = vTargetRef.map(v => Math.ceil(v/capB));

                                   return (
                                     <>
                                       <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                         <td className="p-4 font-bold text-white/70">V_amont (m³/an)</td>
                                         {rowVAmont.map((v, i) => <td key={i} className="p-4 text-center font-mono">{v.toLocaleString('fr-DZ', {maximumFractionDigits: 0})}</td>)}
                                       </tr>
                                       <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                         <td className="p-4 font-bold text-white/70">Nb Gros blocs</td>
                                         {rowNbGros.map((v, i) => <td key={i} className="p-4 text-center font-mono">{v}</td>)}
                                       </tr>
                                       <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                         <td className="p-4 font-bold text-white/70">Nb Blocs Retaille</td>
                                         {rowNbRetaille.map((v, i) => <td key={i} className="p-4 text-center font-mono">{v}</td>)}
                                       </tr>
                                       <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                         <td className="p-4 font-bold text-emerald-400">Machines Extraction (N_A)</td>
                                         {rowNa.map((v, i) => <td key={i} className="p-4 text-center font-mono font-black text-emerald-400">{v}</td>)}
                                       </tr>
                                       <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                         <td className="p-4 font-bold text-indigo-400">Machines Retaille (N_B)</td>
                                         {rowNb.map((v, i) => <td key={i} className="p-4 text-center font-mono font-black text-indigo-400">{v}</td>)}
                                       </tr>
                                     </>
                                   );
                                 })()}
                               </tbody>
                            </table>
                         </div>
                       )}

                       <div className="pt-8 border-t border-white/10 flex items-center justify-between text-white/40">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center"><Info size={14}/></div>
                             <p className="text-[10px] font-medium max-w-lg leading-relaxed">
                               Les calculs sont théoriques et basés sur des rendements idéaux. Un coefficient de sécurité peut être ajouté via le taux d'utilisation U.
                             </p>
                          </div>
                          <button 
                            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white transition-all backdrop-blur-md opacity-30 cursor-not-allowed border border-white/5"
                            title="Indisponible pour l'instant"
                          >
                             Appliquer au TCR (Bêta)
                          </button>
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
                  <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-sleek-border shadow-md overflow-y-auto max-h-[calc(100vh-220px)] custom-scrollbar">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-sleek-text-main"><PlusCircle size={16} className="text-sleek-primary"/> Nouvel Équipement</h3>
                    <div className="space-y-4">
                      <InputGroupVertical label="Désignation" value={newEqName} onChange={setNewEqName} />
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-sleek-text-muted opacity-70 px-1">Catégorie</label>
                        <select 
                          value={newEqCategory} 
                          onChange={(e) => setNewEqCategory(e.target.value as InvestmentCategory)}
                          className="w-full bg-slate-50 border border-sleek-border rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-sleek-primary/10 focus:bg-white focus:border-sleek-primary transition-all outline-none shadow-inner cursor-pointer"
                        >
                          <option value="Frais préliminaires & Exploration">Frais préliminaires & Exploration</option>
                          <option value="Infrastructures & Bâtiments">Infrastructures & Bâtiments</option>
                          <option value="Équipements Lourds & Matériel">Équipements Lourds & Matériel</option>
                        </select>
                      </div>
                      <InputGroupVertical label="Prix d'Acquisition (DA)" value={newEqPrice} onChange={setNewEqPrice} type="number" />
                      <InputGroupVertical label="Durée (ans)" value={newEqDuration} onChange={setNewEqDuration} type="number" helper="Laissez 0 si non amortissable (Frais préliminaires)" />
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-sleek-text-muted opacity-70 px-1">Affectation Analytique</label>
                        <select 
                          value={newEqAlloc} 
                          onChange={(e) => setNewEqAlloc(e.target.value as any)}
                          className="w-full bg-sleek-bg/50 border border-sleek-border rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-sleek-primary/10 focus:bg-white focus:border-sleek-primary transition-all outline-none"
                        >
                          <option value="Granite">Directe Granite</option>
                          <option value="Tuf">Directe Tuf</option>
                          <option value="Common">Commune / Partagée</option>
                        </select>
                      </div>
                      <button onClick={addEquipment} className="w-full py-3 bg-sleek-primary text-white rounded-xl font-bold text-sm tracking-wide mt-2 shadow-lg shadow-sleek-primary/10">Ajouter au Projet</button>
                    </div>
                  </div>

                  <div className="lg:col-span-8 bg-white rounded-2xl border border-sleek-border shadow-md overflow-hidden flex flex-col max-h-[calc(100vh-220px)]">
                    <div className="px-6 py-4 border-b border-sleek-border bg-slate-50 flex justify-between items-center">
                      <h3 className="text-xs font-bold text-sleek-text-muted uppercase tracking-widest">Récapitulatif des Investissements</h3>
                      <span className="bg-sleek-primary/10 text-sleek-primary px-3 py-1 rounded-full text-[10px] font-bold">Total: {formatCurrency(totalInvestment)}</span>
                    </div>
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                      <table className="w-full text-left text-[12px]">
                        <thead className="sticky top-0 bg-white border-b border-sleek-border z-10 shadow-sm">
                          <tr className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-wider">
                            <th className="p-4">Désignation</th>
                            <th className="p-4 text-right">Coût</th>
                            <th className="p-4 text-center">Durée</th>
                            <th className="p-4 text-right">Amort/an</th>
                            <th className="p-4 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {(["Frais préliminaires & Exploration", "Infrastructures & Bâtiments", "Équipements Lourds & Matériel"] as InvestmentCategory[]).map(cat => {
                            const items = equipments.filter(e => e.category === cat);
                            const catSubtotal = items.reduce((sum, e) => sum + e.price, 0);
                            if (items.length === 0) return null;
                            return (
                              <React.Fragment key={cat}>
                                <tr className="bg-slate-100/50">
                                  <td colSpan={5} className="px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest text-sleek-primary border-y border-slate-200">{cat}</td>
                                </tr>
                                {items.map(eq => (
                                  <tr key={eq.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-4 font-semibold text-sleek-text-main pl-8 italic">{eq.designation}</td>
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
                                <tr className="bg-slate-50 font-bold border-b border-slate-200">
                                  <td className="p-3 pl-8 text-[10px] uppercase opacity-60">Sous-total {cat}</td>
                                  <td className="p-3 text-right font-mono text-sleek-primary">{formatCurrency(catSubtotal)}</td>
                                  <td colSpan={3}></td>
                                </tr>
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                        <tfoot className="sticky bottom-0 bg-sleek-primary text-white font-bold border-t border-sleek-border shadow-[0_-2px_8px_rgba(0,0,0,0.1)]">
                          <tr>
                            <td className="p-4 text-sm font-extrabold uppercase tracking-widest text-white">TOTAL GÉNÉRAL DE L'INVESTISSEMENT</td>
                            <td className="p-4 text-right text-sm font-extrabold bg-blue-700">{formatCurrency(totalInvestment)}</td>
                            <td></td><td></td><td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Section Amortissements */}
                <div className="flex-1 bg-white rounded-2xl border border-sleek-border shadow-md overflow-hidden flex flex-col min-h-[400px]">
                   <div className="px-6 py-4 border-b border-sleek-border flex items-center justify-between bg-slate-50">
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
                          <tr className="bg-white border-b border-sleek-border">
                            <th className="p-4 text-left w-56 sticky left-0 bg-white z-10 border-r border-slate-100 font-bold text-sleek-text-muted uppercase tracking-widest text-[9px]">Équipement</th>
                            {Array.from({length: 10}).map((_, i) => (
                              <th key={i} className="p-4 text-right font-bold text-sleek-text-muted uppercase tracking-widest text-[9px]">Année {i+1}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {amortResults.rows.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors font-mono">
                              <td className="p-4 text-left sticky left-0 bg-white z-10 border-r border-slate-100 font-sans font-semibold text-sleek-text-muted text-[11px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.05)]">{row.designation}</td>
                              {row.years.map((val, idx) => (
                                <td key={idx} className={cn("p-4 text-right tabular-nums", val > 0 ? "text-sleek-accent-red font-bold" : "text-gray-200")}>
                                  {val > 0 ? formatCurrency(val) : '—'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="sticky bottom-0 bg-red-50/50 border-t border-red-100">
                          <tr className="font-sans font-bold text-sleek-accent-red">
                            <td className="p-5 text-left sticky left-0 bg-red-50 z-10 border-r border-red-200 uppercase tracking-widest text-[10px]">Dotation Totale TCR</td>
                            {Array.from({length: 10}).map((_, i) => (
                              <td key={i} className="p-5 text-right text-sm tabular-nums font-extrabold">
                                {formatCurrency(amortResults.annualTotals.granite[i] + amortResults.annualTotals.tuf[i] + amortResults.annualTotals.common[i])}
                              </td>
                            ))}
                          </tr>
                        </tfoot>
                      </table>
                   </div>
                   <div className="px-6 py-3 bg-blue-50/30 border-t border-blue-50 flex items-center gap-2">
                       <span className="text-[11px] text-blue-600 italic font-medium">💡 Ce montant est injecté automatiquement dans la ligne DOT. AMORTISS du TCR.</span>
                    </div>
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
                  <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-sleek-border shadow-md overflow-y-auto max-h-[calc(100vh-220px)] custom-scrollbar">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-sleek-text-main"><UsersRound size={16} className="text-sleek-primary"/> Nouveau Poste</h3>
                    <div className="space-y-4">
                      <InputGroupVertical label="Désignation du Poste" value={newRoleName} onChange={setNewRoleName} />
                      <div className="grid grid-cols-2 gap-4">
                        <InputGroupVertical label="Effectif" value={newRoleCount} onChange={setNewRoleCount} type="number" />
                        <InputGroupVertical label="Sal. Net" value={newRoleSalary} onChange={setNewRoleSalary} type="number" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-sleek-text-muted opacity-70 px-1">Affectation</label>
                        <select 
                          value={newRoleAlloc} 
                          onChange={(e) => setNewRoleAlloc(e.target.value as any)}
                          className="w-full bg-sleek-bg/50 border border-sleek-border rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-sleek-primary/10 focus:bg-white focus:border-sleek-primary transition-all outline-none"
                        >
                          <option value="Granite">Spécifique Granite</option>
                          <option value="Tuf">Spécifique Tuf</option>
                          <option value="Common">Commun (Admin/Garde)</option>
                        </select>
                      </div>
                      <div className="pt-4 border-t border-slate-100 space-y-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-sleek-text-muted opacity-60">Paramètres de Masse Salariale</h4>
                        <div className="grid grid-cols-2 gap-4">
                           <InputGroupVertical 
                             label="Charges Soc. (%)" 
                             value={((hrConfig.socialChargesRate ?? 0) * 100).toString()} 
                             onChange={v => setHrConfig({...hrConfig, socialChargesRate: Number(v)/100})} 
                             type="number" 
                           />
                           <InputGroupVertical 
                             label="Inflation (%)" 
                             value={((hrConfig.annualIncreaseRate ?? 0) * 100).toString()} 
                             onChange={v => setHrConfig({...hrConfig, annualIncreaseRate: Number(v)/100})} 
                             type="number" 
                           />
                        </div>
                      </div>
                      <button onClick={addRole} className="w-full py-3 bg-sleek-primary text-white rounded-xl font-bold text-sm tracking-wide mt-2 shadow-lg shadow-sleek-primary/10">Ajouter l'Effectif</button>
                    </div>
                  </div>

                  <div className="lg:col-span-8 bg-white rounded-2xl border border-sleek-border shadow-md overflow-hidden flex flex-col max-h-[calc(100vh-220px)]">
                    <div className="px-6 py-4 border-b border-sleek-border bg-slate-50 flex justify-between items-center">
                      <h3 className="text-xs font-bold text-sleek-text-muted uppercase tracking-widest">Tableau RH. Liste du Personnel</h3>
                      <span className="bg-sleek-primary/10 text-sleek-primary px-3 py-1 rounded-full text-[10px] font-bold">{roles.length} Catégories</span>
                    </div>
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                      <table className="w-full text-left text-[12px]">
                        <thead className="sticky top-0 bg-white border-b border-sleek-border z-10 shadow-sm">
                          <tr className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-wider">
                            <th className="p-4">Désignation</th>
                            <th className="p-4 text-center">Effectif</th>
                            <th className="p-4 text-right">Sal. Mensuel (DA)</th>
                            <th className="p-4 text-right">Coût Annuel (DA)</th>
                            <th className="p-4 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {roles.map(role => {
                            const annual = role.count * role.monthlySalary * 12 * (1 + hrConfig.socialChargesRate);
                            return (
                              <tr key={role.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 font-semibold text-sleek-text-main">{role.designation}</td>
                                <td className="p-4 text-center">{role.count}</td>
                                <td className="p-4 text-right font-mono">{formatCurrency(role.monthlySalary)}</td>
                                <td className="p-4 text-right font-mono font-bold text-sleek-primary">{formatCurrency(annual)}</td>
                                <td className="p-4 text-center">
                                  <button onClick={() => removeRole(role.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash size={14}/></button>
                                </td>
                              </tr>
                            );
                          })}
                          {roles.length === 0 && (
                            <tr><td colSpan={5} className="p-10 text-center text-slate-300 italic">Aucun personnel enregistré.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Section Masse Salariale */}
                <div className="flex-1 bg-white rounded-2xl border border-sleek-border shadow-md overflow-hidden flex flex-col min-h-[300px]">
                   <div className="px-6 py-4 border-b border-sleek-border bg-slate-50 flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-sleek-text-muted">Projection de la Masse Salariale sur 10 ans</h3>
                      <div className="text-[10px] font-bold text-sleek-primary bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">Injection Directe TCR</div>
                   </div>
                   <div className="overflow-auto flex-1 p-6">
                      <div className="grid grid-cols-10 gap-3">
                         {Array.from({length: 10}).map((_, i) => (
                           <div key={i} className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 items-center justify-center">
                              <span className="text-[9px] font-bold text-slate-400">Année {i+1}</span>
                              <span className="text-[11px] font-mono font-bold text-sleek-primary truncate w-full text-center">{formatCurrency(hrTotals.granite[i] + hrTotals.tuf[i] + hrTotals.common[i])}</span>
                           </div>
                         ))}
                      </div>
                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-blue-600 italic font-medium">
                        <span className="text-[11px]">💡 Ce montant est injecté automatiquement dans la ligne PERSONNEL du TCR.</span>
                      </div>
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
                  <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-sleek-border shadow-md overflow-y-auto max-h-[calc(100vh-220px)] custom-scrollbar">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-sleek-text-main"><Fuel size={16} className="text-sleek-primary"/> Calculateur de Carburant</h3>
                    <div className="space-y-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
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

                      <div className="pt-4 border-t border-slate-100">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-sleek-text-muted opacity-60 mb-4 font-serif italic flex items-center gap-2"><PlusCircle size={12}/> Ajouter un Engin</h4>
                        <div className="space-y-4">
                           <InputGroupVertical label="Désignation de l'Engin" value={newOpName} onChange={setNewOpName} />
                           <div className="grid grid-cols-2 gap-4">
                              <InputGroupVertical label="Puissance (kW)" value={newOpPower} onChange={setNewOpPower} type="number" />
                              <InputGroupVertical label="Nombre de machines" value={newOpCount} onChange={setNewOpCount} type="number" />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <InputGroupVertical label="Conso (L/kWh)" value={newOpConsRate} onChange={setNewOpConsRate} type="number" />
                              <InputGroupVertical label="Coef Utilisation (0..1)" value={newOpUtilCoef} onChange={setNewOpUtilCoef} type="number" />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-sleek-text-muted opacity-70 px-1">Affectation TCR</label>
                              <select 
                                value={newOpAlloc} 
                                onChange={(e) => setNewOpAlloc(e.target.value as any)}
                                className="w-full bg-sleek-bg/50 border border-sleek-border rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-sleek-primary/10 focus:bg-white focus:border-sleek-primary transition-all outline-none"
                              >
                                <option value="Granite">Uniquement Granite</option>
                                <option value="Tuf">Uniquement Tuf</option>
                                <option value="Common">Utilisation Commune</option>
                              </select>
                           </div>
                        </div>
                      </div>
                      <button onClick={addMachine} className="w-full py-3 bg-sleek-primary text-white rounded-xl font-bold text-sm tracking-wide mt-2 shadow-lg shadow-sleek-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        Enregistrer l'Engin
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-8 bg-white rounded-2xl border border-sleek-border shadow-md overflow-hidden flex flex-col max-h-[calc(100vh-220px)]">
                    <div className="px-6 py-4 border-b border-sleek-border bg-slate-50 flex justify-between items-center">
                      <h3 className="text-xs font-bold text-sleek-text-muted uppercase tracking-widest flex items-center gap-2"><Wrench size={14}/> Parc d'Équipement Actif</h3>
                      <div className="flex items-center gap-3">
                        <span className="bg-sleek-primary/10 text-sleek-primary px-3 py-1 rounded-full text-[10px] font-bold">{machines.length} Machines</span>
                      </div>
                    </div>
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                      <table className="w-full text-left text-[12px]">
                        <thead className="sticky top-0 bg-white border-b border-sleek-border z-10 shadow-sm">
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
                        <tbody className="divide-y divide-slate-50">
                          {machines.map(m => {
                            const consoLh = m.powerKw * m.consumptionRate * m.utilizationCoef;
                            const consoTotalLh = consoLh * m.count;
                            const consoTotalLjour = consoTotalLh * m.hoursPerDay;
                            const annualLitres = consoTotalLjour * m.workDaysPerYear;
                            const annualCost = annualLitres * opConfig.fuelPrice;
                            return (
                              <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4">
                                  <div className="font-semibold text-sleek-text-main">{m.designation}</div>
                                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                                    {m.hoursPerDay}h/j • {m.workDaysPerYear}j/an
                                  </div>
                                </td>
                                <td className="p-4 text-center text-[11px]">{m.powerKw} kW × {m.count}</td>
                                <td className="p-4 text-center text-slate-400 font-mono text-[11px]">{m.consumptionRate} (coef {m.utilizationCoef})</td>
                                <td className="p-4 text-right font-mono font-bold text-sleek-primary">{consoTotalLh.toLocaleString()}</td>
                                <td className="p-4 text-right font-mono font-bold text-blue-400">{consoTotalLjour.toLocaleString()}</td>
                                <td className="p-4 text-right font-mono font-bold text-emerald-500">{annualLitres.toLocaleString()}</td>
                                <td className="p-4 text-right font-mono font-extrabold text-sleek-accent-green">{formatCurrency(annualCost)}</td>
                                <td className="p-4 text-center">
                                  <button onClick={() => removeMachine(m.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash size={14}/></button>
                                </td>
                              </tr>
                            );
                          })}
                          {machines.length === 0 && (
                            <tr><td colSpan={6} className="p-10 text-center text-slate-300 italic text-sm">Aucun engin d'exploitation enregistré. Ajoutez des machines pour calculer le carburant.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    {/* Foot summary table info */}
                    {machines.length > 0 && (
                      <div className="bg-slate-900 text-white p-6 grid grid-cols-3 gap-6 border-t border-slate-700">
                        <div className="flex flex-col group relative cursor-help">
                           <span className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1 flex items-center gap-1.5">
                            Débit Total (L / Heure) <Info size={10}/>
                           </span>
                           <span className="text-xl font-mono font-bold text-sky-400">
                              {machines.reduce((acc, m) => acc + (m.powerKw * m.consumptionRate * m.utilizationCoef * m.count), 0).toLocaleString()} <span className="text-xs font-sans opacity-60">L / h</span>
                           </span>
                           <FormulaTooltip formula="Σ (Puis. × Conso. × Coef. × Nombre)" />
                        </div>
                        <div className="flex flex-col group relative cursor-help">
                           <span className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1 flex items-center gap-1.5">
                            Consommation / Jour (L / Jour) <Info size={10}/>
                           </span>
                           <span className="text-xl font-mono font-bold text-blue-400">
                              {machines.reduce((acc, m) => acc + (m.powerKw * m.consumptionRate * m.utilizationCoef * m.count * m.hoursPerDay), 0).toLocaleString()} <span className="text-xs font-sans opacity-60">L / jour</span>
                           </span>
                           <FormulaTooltip formula="Σ (L/h_machine × h/jour_machine)" />
                        </div>
                        <div className="flex flex-col group relative cursor-help">
                           <span className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1 flex items-center gap-1.5">
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
                <div className="flex-1 bg-white rounded-2xl border border-sleek-border shadow-md overflow-hidden flex flex-col min-h-[400px]">
                   <div className="px-6 py-4 border-b border-sleek-border bg-slate-50 flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-sleek-text-muted">Projection Carburant sur 10 ans (Injection Automatique TCR)</h3>
                      <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <Activity size={12}/> Inflation de {opConfig.annualInflationRate}% active
                      </div>
                   </div>
                   <div className="overflow-auto flex-1 p-6 flex flex-col">
                      <div className="grid grid-cols-10 gap-3 min-w-[900px]">
                         {calculatedYears.map((y, i) => (
                           <div key={i} className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 items-center">
                              <span className="text-[9px] font-bold text-slate-400">Année {i+1}</span>
                              <div className="text-[10px] font-mono font-bold text-sleek-primary">{formatCurrency(opResults.fuel.granite[i] + opResults.fuel.tuf[i] + opResults.fuel.common[i])}</div>
                           </div>
                         ))}
                      </div>
                      <div className="mt-8 space-y-3 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                         <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-600/20"><Info size={20}/></div>
                            <div className="space-y-1">
                               <h4 className="text-sm font-bold text-blue-900 tracking-tight">Note Technique sur l'intégration TCR</h4>
                               <p className="text-[11px] text-blue-800/70 leading-relaxed font-medium">
                                  Le coût annuel du carburant calculé ci-dessus est injecté <b>automatiquement</b> dans la ligne <span className="font-bold underline text-blue-900">Matières & Consommables</span> du TCR.
                                  Si vous saisissez manuellement une valeur dans le TCR, elle sera additionnée au coût du carburant pour refléter les autres intrants (explosifs, lubrifiants, etc.).
                               </p>
                            </div>
                         </div>
                      </div>
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
                  <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-sleek-border shadow-md overflow-y-auto max-h-[calc(100vh-220px)] custom-scrollbar">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-sleek-text-main"><Zap size={16} className="text-sleek-primary"/> Électricité par Groupes</h3>
                    <div className="space-y-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <InputGroupVertical 
                            label="Heures/Jour (Défaut)" 
                            value={electricityConfig.hoursPerDay.toString()} 
                            onChange={v => setElectricityConfig({...electricityConfig, hoursPerDay: Number(v)})} 
                            type="number" 
                          />
                          <InputGroupVertical 
                            label="Jours/An (Défaut)" 
                            value={electricityConfig.workDaysPerYear.toString()} 
                            onChange={v => setElectricityConfig({...electricityConfig, workDaysPerYear: Number(v)})} 
                            type="number" 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <InputGroupVertical 
                            label="Cos φ" 
                            value={electricityConfig.cosPhi.toString()} 
                            onChange={v => setElectricityConfig({...electricityConfig, cosPhi: Number(v)})} 
                            type="number" 
                          />
                          <InputGroupVertical 
                            label="kVA / Groupe" 
                            value={electricityConfig.kvaPerGroup.toString()} 
                            onChange={v => setElectricityConfig({...electricityConfig, kvaPerGroup: Number(v)})} 
                            type="number" 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <InputGroupVertical 
                            label="Prix Diesel (DA/L)" 
                            value={opConfig.fuelPrice.toString()} 
                            onChange={v => setOpConfig({...opConfig, fuelPrice: Number(v)})} 
                            type="number" 
                          />
                          <InputGroupVertical 
                            label="Conso Grp (L/kWh)" 
                            value={electricityConfig.specificConsumption.toString()} 
                            onChange={v => setElectricityConfig({...electricityConfig, specificConsumption: Number(v)})} 
                            type="number" 
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-sleek-text-muted opacity-60 mb-4 font-serif italic flex items-center gap-2"><PlusCircle size={12}/> Ajouter un Poste de Consommation</h4>
                        <div className="space-y-4">
                           <InputGroupVertical label="Désignation" value={newElecName} onChange={setNewElecName} />
                           <div className="grid grid-cols-2 gap-4">
                              <InputGroupVertical label="Puissance Puis. (kW)" value={newElecPower} onChange={setNewElecPower} type="number" />
                              <InputGroupVertical label="Nombre" value={newElecCount} onChange={setNewElecCount} type="number" />
                           </div>
                           <InputGroupVertical label="Coef Utilisation (0..1)" value={newElecUtilCoef} onChange={setNewElecUtilCoef} type="number" />
                        </div>
                      </div>
                      <button onClick={addElectricityLine} className="w-full py-3 bg-sleek-primary text-white rounded-xl font-bold text-sm tracking-wide mt-2 shadow-lg shadow-sleek-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        Ajouter au Bilan de Puissance
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-8 bg-white rounded-2xl border border-sleek-border shadow-md overflow-hidden flex flex-col max-h-[calc(100vh-220px)]">
                    <div className="px-6 py-4 border-b border-sleek-border bg-slate-50 flex justify-between items-center">
                      <h3 className="text-xs font-bold text-sleek-text-muted uppercase tracking-widest flex items-center gap-2"><Activity size={14}/> Bilan de Puissance</h3>
                      <div className="flex items-center gap-3">
                        <span className="bg-sleek-primary/10 text-sleek-primary px-3 py-1 rounded-full text-[10px] font-bold">{electricityLines.length} Postes</span>
                      </div>
                    </div>
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                      <table className="w-full text-left text-[12px]">
                        <thead className="sticky top-0 bg-white border-b border-sleek-border z-10 shadow-sm">
                          <tr className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-wider">
                            <th className="p-4">Désignation</th>
                            <th className="p-4 text-center">Puissance unitaire (kW)</th>
                            <th className="p-4 text-center">Nombre</th>
                            <th className="p-4 text-center">Coef. Util.</th>
                            <th className="p-4 text-right text-sleek-primary">P_ligne (kW)</th>
                            <th className="p-4 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {electricityLines.map(l => {
                            const pLine = l.powerKw * l.count * l.utilizationCoef;
                            return (
                              <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4">
                                  <div className="font-semibold text-sleek-text-main">{l.designation}</div>
                                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                                    {l.hoursPerDay}h/j • {l.workDaysPerYear}j/an
                                  </div>
                                </td>
                                <td className="p-4 text-center">{l.powerKw} kW</td>
                                <td className="p-4 text-center">{l.count}</td>
                                <td className="p-4 text-center text-slate-400 font-mono">{l.utilizationCoef}</td>
                                <td className="p-4 text-right font-mono font-bold text-sleek-primary">{pLine.toLocaleString()} kW</td>
                                <td className="p-4 text-center">
                                  <button onClick={() => removeElectricityLine(l.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash size={14}/></button>
                                </td>
                              </tr>
                            );
                          })}
                          {electricityLines.length === 0 && (
                            <tr><td colSpan={6} className="p-10 text-center text-slate-300 italic text-sm">Aucun poste de consommation défini.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Summary Footer for Electricity */}
                    {electricityLines.length > 0 && (
                      <div className="bg-slate-900 text-white p-6 grid grid-cols-2 lg:grid-cols-4 gap-6 border-t border-slate-700 shrink-0">
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
                                 <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest mb-1">Puissance Apparente</span>
                                 <span className="text-lg font-mono font-bold text-sky-400">{sTotal.toFixed(0)} <span className="text-[10px] font-sans opacity-60">kVA</span></span>
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest mb-1">Dimensionnement</span>
                                 <span className="text-lg font-mono font-bold text-blue-400">{nGroups} <span className="text-[10px] font-sans opacity-60">GE de {electricityConfig.kvaPerGroup}kVA</span></span>
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest mb-1">Énergie Annuelle</span>
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
                <div className="flex-1 bg-white rounded-2xl border border-sleek-border shadow-md overflow-hidden flex flex-col min-h-[400px]">
                   <div className="px-6 py-4 border-b border-sleek-border bg-slate-50 flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-sleek-text-muted">Projection Coût Électricité (Groupes) sur 10 ans</h3>
                      <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <Check size={12}/> Injection TCR Activée
                      </div>
                   </div>
                   <div className="overflow-auto flex-1 p-6 flex flex-col">
                      <div className="grid grid-cols-10 gap-3 min-w-[900px]">
                         {calculatedYears.map((y, i) => (
                           <div key={i} className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 items-center">
                              <span className="text-[9px] font-bold text-slate-400">Année {i+1}</span>
                              <div className="text-[10px] font-mono font-bold text-sleek-primary">{formatCurrency(electricityResults.granite[i] + electricityResults.tuf[i] + electricityResults.common[i])}</div>
                           </div>
                         ))}
                      </div>
                      <div className="mt-8 space-y-3 bg-amber-50/50 p-6 rounded-2xl border border-amber-100 italic">
                         <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-500/20"><Zap size={20}/></div>
                            <div className="space-y-1">
                               <h4 className="text-sm font-bold text-amber-900 tracking-tight">Configuration Zone Non Électrifiée</h4>
                               <p className="text-[11px] text-amber-800/70 leading-relaxed font-medium">
                                  En l'absence de réseau Sonelgaz, l'énergie est produite exclusivement sur site. 
                                  La consommation de diesel des groupes (<b>{electricityConfig.specificConsumption} L/kWh</b>) est convertie en coût monétaire et s'ajoute au carburant des engins.
                                  Le dimensionnement suggéré est de <b>{Math.ceil((electricityLines.reduce((acc, l) => acc + (l.powerKw * l.count * l.utilizationCoef), 0) / electricityConfig.cosPhi) / electricityConfig.kvaPerGroup)} groupes de {electricityConfig.kvaPerGroup} kVA</b> pour couvrir la pointe de { (electricityLines.reduce((acc, l) => acc + (l.powerKw * l.count * l.utilizationCoef), 0) / electricityConfig.cosPhi).toFixed(0) } kVA.
                               </p>
                            </div>
                         </div>
                      </div>
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
                        className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 pointer-events-auto cursor-default"
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
                               <InputGroupVertical label="Vs : Vitesse de sciage (m²/h)" value={dmVs} onChange={setDmVs} type="number" />
                               <InputGroupVertical label="Cfu : Conso. unitaire (m/m²)" value={dmCfu} onChange={setDmCfu} type="number" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                               <InputGroupVertical label="Heures / jour (h/j)" value={dmHj} onChange={setDmHj} type="number" />
                               <InputGroupVertical label="Jours / an (j/an)" value={dmJa} onChange={setDmJa} type="number" />
                            </div>
                            <div className="grid grid-cols-2 gap-6 items-end">
                               <InputGroupVertical label="Nombre de machines (N)" value={dmN} onChange={setDmN} type="number" />
                               <div className="space-y-2">
                                  <label className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-wider ml-1">Affectation</label>
                                  <select 
                                   value={dmAlloc} 
                                   onChange={(e) => setDmAlloc(e.target.value as any)}
                                   className="w-full bg-sleek-bg/50 border border-sleek-border rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-sleek-primary/10 focus:bg-white focus:border-sleek-primary transition-all outline-none"
                                 >
                                   <option value="Granite">Uniquement Granite</option>
                                   <option value="Tuf">Uniquement Tuf</option>
                                   <option value="Common">Utilisation Commune</option>
                                 </select>
                               </div>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
                               <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Résultats Intermédiaires</span>
                               </div>
                               <div className="grid grid-cols-3 gap-4">
                                  <div className="space-y-1">
                                     <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Conso. Heure</div>
                                     <div className="text-sm font-mono font-black text-slate-700">{(Number(dmVs) * Number(dmCfu)).toFixed(2)} <span className="text-[10px] font-medium opacity-40">m/h</span></div>
                                  </div>
                                  <div className="space-y-1">
                                     <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Conso. Jour</div>
                                     <div className="text-sm font-mono font-black text-slate-700">{(Number(dmVs) * Number(dmCfu) * Number(dmHj)).toFixed(1)} <span className="text-[10px] font-medium opacity-40">m/j</span></div>
                                  </div>
                                  <div className="space-y-1 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                                     <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter">Consommation Annuelle</div>
                                     <div className="text-lg font-mono font-black text-emerald-700">
                                        {formatCompact(Number(dmVs) * Number(dmCfu) * Number(dmHj) * Number(dmJa) * Number(dmN))} <span className="text-[10px] font-medium opacity-60">m/an</span>
                                     </div>
                                  </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-2">
                               <button 
                                 onClick={() => setIsDiamondModalOpen(false)}
                                 className="flex-1 py-4 px-6 border-2 border-slate-100 rounded-2xl text-slate-400 font-bold text-sm tracking-wide hover:bg-slate-50 transition-all active:scale-[0.98]"
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
                <div className="bg-white p-8 rounded-[32px] border border-sleek-border shadow-xl relative overflow-hidden group mb-4 shrink-0 select-text">
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
                             className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-semibold focus:ring-4 focus:ring-sleek-primary/10 focus:bg-white focus:border-sleek-primary transition-all outline-none"
                           >
                             <option value="Granite">Granite</option>
                             <option value="Tuf">Tuf</option>
                             <option value="Common">Commune</option>
                           </select>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Consommation (m/an)</label>
                            <div className="relative">
                               <input 
                                 type="number" 
                                 value={dmQty === '0' ? '' : dmQty}
                                 onChange={(e) => setDmQty(e.target.value)}
                                 className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-lg font-mono font-black focus:ring-4 focus:ring-sleek-primary/10 focus:bg-white focus:border-sleek-primary transition-all outline-none"
                                 placeholder="0"
                               />
                               <button 
                                 onClick={() => setIsDiamondModalOpen(true)}
                                 className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-sleek-primary shadow-sm hover:bg-sleek-primary hover:text-white transition-all"
                                 title="Ouvrir le calculateur"
                               >
                                  <Calculator size={18}/>
                               </button>
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Prix Unitaire (DA/m)</label>
                            <input 
                              type="number" 
                              value={dmUnitPrice === '0' ? '' : dmUnitPrice}
                              onChange={(e) => setDmUnitPrice(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-lg font-mono font-black focus:ring-4 focus:ring-sleek-primary/10 focus:bg-white focus:border-sleek-primary transition-all outline-none text-sleek-primary"
                              placeholder="0"
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
                  <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-sleek-border shadow-md h-fit min-w-0">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-sleek-text-main"><PlusCircle size={16} className="text-sleek-primary"/> Ajouter un Accessoire</h3>
                    <div className="space-y-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                        <InputGroupVertical label="Désignation" value={newAccName} onChange={setNewAccName} />
                        <div className="grid grid-cols-2 gap-4">
                          <InputGroupVertical label="Quantité / An" value={newAccQty} onChange={setNewAccQty} type="number" />
                          <InputGroupVertical label="Unité" value={newAccUnit} onChange={setNewAccUnit} />
                        </div>
                        <InputGroupVertical label="Prix Unitaire (DA/Unité)" value={newAccPrice} onChange={v => setNewAccPrice(v)} type="number" />
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-wider ml-1">Affectation</label>
                           <select 
                            value={newAccAlloc} 
                            onChange={(e) => setNewAccAlloc(e.target.value as any)}
                            className="w-full bg-sleek-bg/50 border border-sleek-border rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-sleek-primary/10 focus:bg-white focus:border-sleek-primary transition-all outline-none"
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

                <div className="lg:col-span-8 bg-white rounded-2xl border border-sleek-border shadow-md flex flex-col min-h-[400px] lg:min-h-0 select-text min-w-0">
                    <div className="px-6 py-4 border-b border-sleek-border bg-slate-50 flex justify-between items-center shrink-0">
                      <h3 className="text-xs font-bold text-sleek-text-muted uppercase tracking-widest flex items-center gap-2"><PlusCircle size={14}/> Liste des Coûts Accessoires</h3>
                      <div className="flex items-center gap-3">
                        <span className="bg-sleek-primary/10 text-sleek-primary px-3 py-1 rounded-full text-[10px] font-bold">{accessoryConfig.items.length} Accessoires</span>
                      </div>
                    </div>
                    <div className="overflow-auto flex-1 custom-scrollbar min-h-0">
                      <table className="w-full text-left text-[12px] border-collapse">
                        <thead className="sticky top-0 bg-white border-b border-sleek-border z-10 shadow-sm">
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
                        <tbody className="divide-y divide-slate-50">
                          {accessoryConfig.items.map(item => {
                            const total = item.qtyPerYear * item.unitPrice;
                            const isFil = item.designation.toLowerCase().includes('fil');
                            return (
                              <tr key={item.id} className={cn("hover:bg-slate-50/50 transition-colors", isFil ? "bg-indigo-50/10" : "")}>
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
                                    "bg-slate-100 text-slate-500"
                                  )}>
                                    {item.allocation}
                                  </span>
                                </td>
                                <td className="p-4 text-center font-mono">{item.qtyPerYear.toLocaleString()}</td>
                                <td className="p-4 text-center text-slate-400 font-medium uppercase tracking-widest text-[9px]">{item.unit}</td>
                                <td className="p-4 text-center font-mono">{item.unitPrice.toLocaleString()} DA</td>
                                <td className="p-4 text-right font-mono font-bold text-sleek-primary">{total.toLocaleString()} DA</td>
                                <td className="p-4 text-center">
                                  <button onClick={() => removeAccessory(item.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                    <Trash size={14}/>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                          {accessoryConfig.items.length === 0 && (
                            <tr><td colSpan={7} className="p-10 text-center text-slate-300 italic text-sm">Aucun accessoire défini.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Summary Footer for Accessories */}
                    {accessoryConfig.items.length > 0 && (
                      <div className="bg-slate-900 text-white p-6 flex justify-between items-center border-t border-slate-700 shrink-0">
                        <div className="flex flex-col">
                           <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest mb-1">Total Coûts Accessoires (Année 1)</span>
                           <span className="text-xl font-mono font-bold text-sleek-accent-green">
                              {formatCurrency(accessoryConfig.items.reduce((acc, item) => acc + (item.qtyPerYear * item.unitPrice), 0))} <span className="text-xs font-sans opacity-60">DA/an</span>
                           </span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                          <Activity size={14} className="text-blue-400"/>
                          <span className="text-[10px] font-bold text-white/60">Sujet à l'inflation annuelle prévue ({opConfig.annualInflationRate}%)</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section Projection Accessoires */}
                <div className="flex-1 bg-white rounded-2xl border border-sleek-border shadow-md overflow-hidden flex flex-col min-h-[400px]">
                   <div className="px-6 py-4 border-b border-sleek-border bg-slate-50 flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-sleek-text-muted">Projection Coûts Accessoires sur 10 ans</h3>
                      <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <Check size={12}/> Injection TCR Activée
                      </div>
                   </div>
                   <div className="overflow-auto flex-1 p-6 flex flex-col">
                      <div className="grid grid-cols-10 gap-3 min-w-[900px]">
                         {calculatedYears.map((y, i) => (
                           <div key={i} className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 items-center">
                              <span className="text-[9px] font-bold text-slate-400">Année {i+1}</span>
                              <div className="text-[10px] font-mono font-bold text-sleek-primary">{formatCurrency(accessoryResults.granite[i] + accessoryResults.tuf[i] + accessoryResults.common[i])}</div>
                           </div>
                         ))}
                      </div>
                      <div className="mt-8 space-y-3 bg-amber-50/50 p-6 rounded-2xl border border-amber-100 italic">
                         <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-500/20"><PlusCircle size={20}/></div>
                            <div className="space-y-1">
                               <h4 className="text-sm font-bold text-amber-900 tracking-tight">Accessoires & Consommables Divers</h4>
                               <p className="text-[11px] text-amber-800/70 leading-relaxed font-medium">
                                  Cette section permet d'inclure des consommables spécifiques (comme le fil diamanté, les couronnes, ou câbles) qui ne sont pas classés comme carburant mais affectent directement la marge opérationnelle.
                                  Le total annuel est injecté dans le poste <b>Matières & Consommables</b> du TCR.
                               </p>
                            </div>
                         </div>
                      </div>
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
                <div className="bg-white rounded-2xl border border-sleek-border shadow-md overflow-hidden mb-6 transition-all duration-300">
                  <div 
                    onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
                    className="w-full px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
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
 

                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-sleek-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sleek-primary/90 transition-all shadow-lg shadow-sleek-primary/20"
                      >
                        <Copy size={14} /> Sauvegarder Simulation
                      </button>
                      <div className={cn("transition-transform duration-300", isSettingsExpanded ? "rotate-180" : "")}>
                        <PlusCircle size={20} className="text-slate-300" />
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isSettingsExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden border-t border-slate-100 bg-slate-50/30"
                      >
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Fiscalité</h4>
                            <InputGroupVertical 
                              label="Taux IBM (%)" 
                              value={((ibmRate ?? 0) * 100).toString()} 
                              onChange={(v) => setIbmRate(Number(v) / 100)} 
                              type="number"
                              helper="Impôt sur les Bénéfices des Travaux Miniers"
                            />
                          </div>
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Personnel</h4>
                            <div className="space-y-4">
                              <InputGroupVertical 
                               label="Charges Sociales (%)" 
                                value={((hrConfig.socialChargesRate ?? 0) * 100).toString()} 
                                onChange={(v) => setHrConfig({...hrConfig, socialChargesRate: Number(v)/100})} 
                                type="number"
                              />
                              <InputGroupVertical 
                                label="Augmentation Annuelle (%)" 
                                value={((hrConfig.annualIncreaseRate ?? 0) * 100).toString()} 
                                onChange={(v) => setHrConfig({...hrConfig, annualIncreaseRate: Number(v)/100})} 
                                type="number"
                              />
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Exploitation</h4>
                            <div className="space-y-4">
                              <InputGroupVertical 
                                label="Inflation Fuel/Maint (%)" 
                                value={(opConfig.annualInflationRate ?? 0).toString()} 
                                onChange={(v) => setOpConfig({...opConfig, annualInflationRate: Number(v)})} 
                                type="number"
                              />
                              <InputGroupVertical 
                                label="Prix du Litre (DA)" 
                                value={(opConfig.fuelPrice ?? 0).toString()} 
                                onChange={(v) => setOpConfig({...opConfig, fuelPrice: Number(v)})} 
                                type="number"
                              />
                            </div>
                          </div>
                          <div className="space-y-4 opacity-40 grayscale pointer-events-none cursor-not-allowed">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Calendrier (Obsolète)</h4>
                            <InputGroupVertical 
                              label="Jours Ouvrable / An" 
                              value={(opConfig.workDaysPerYear ?? 0).toString()} 
                              onChange={() => {}} 
                              type="number"
                              helper="Désormais indépendant par module"
                            />
                          </div>
                        </div>
                        <div className="px-8 py-4 bg-indigo-50/50 border-t border-slate-100 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></div>
                            <p className="text-[10px] font-bold text-indigo-900/60 uppercase tracking-wider">
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
                            className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors uppercase tracking-widest"
                          >
                            <Trash2 size={12} /> Réinitialiser
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl flex gap-4 text-indigo-900 mb-2 shadow-sm">
                   <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0"><Check size={20}/></div>
                   <div>
                     <h4 className="font-bold text-sm">Synchronisation Totale Active</h4>
                     <p className="text-xs opacity-70 leading-relaxed mt-1">
                       Les dotations aux amortissements, les frais de personnel et <b>le carburant</b> sont automatiquement synchronisés. 
                       Les modifications dans les modules <span className="underline cursor-pointer font-bold hover:text-indigo-600" onClick={() => setActiveTab('invest')}>Investissements</span>, <span className="underline cursor-pointer font-bold hover:text-indigo-600" onClick={() => setActiveTab('hr')}>RH</span> et <span className="underline cursor-pointer font-bold hover:text-indigo-600" onClick={() => setActiveTab('ops')}>Carburant</span> impactent immédiatement votre TCR.
                     </p>
                   </div>
                </div>
                {years.map((year, idx) => (
                  <div key={year.year} className="bg-white rounded-2xl border border-sleek-border shadow-sm p-8 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-sleek-bg rounded-xl flex items-center justify-center font-extrabold text-sm text-sleek-text-muted border border-sleek-border">{year.year}</div>
                        <div>
                          <h3 className="font-bold text-sleek-text-main text-lg tracking-tight">Exercice Annuel {year.year}</h3>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-sleek-text-muted opacity-60">Prévisions Financières</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-red-50/50 px-5 py-3 rounded-xl border border-red-100">
                        <TrendingDown size={18} className="text-sleek-accent-red"/>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-bold text-red-400 uppercase leading-none">Dotation Amortiss. </span>
                           <span className="text-lg font-mono font-bold text-sleek-accent-red leading-none mt-1">{formatCurrency(amortResults.annualTotals.granite[idx] + amortResults.annualTotals.tuf[idx] + amortResults.annualTotals.common[idx])} DA</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-6 mb-8 pt-6 border-t border-slate-100">
                      <div className="flex flex-col gap-2">
                         <span className="text-[10px] font-extrabold text-sleek-text-muted uppercase tracking-widest pl-1">Section Granite</span>
                         <InputGroup label="Extraction (T)" value={year.extractionGranite} onChange={(v) => handleUpdateYear(idx, 'extractionGranite', v)} suffix="T" />
                         <InputGroup label="Revenus (DA)" value={year.caGranite} onChange={(v) => handleUpdateYear(idx, 'caGranite', v)} suffix="DA" />
                      </div>
                      <div className="flex flex-col gap-2">
                         <span className="text-[10px] font-extrabold text-sleek-text-muted uppercase tracking-widest pl-1">Section Tuf</span>
                         <InputGroup label="Extraction (T)" value={year.extractionTuf} onChange={(v) => handleUpdateYear(idx, 'extractionTuf', v)} suffix="T" />
                         <InputGroup label="Revenus (DA)" value={year.caTuf} onChange={(v) => handleUpdateYear(idx, 'caTuf', v)} suffix="DA" />
                      </div>
                      <div className="flex flex-col gap-2">
                         <span className="text-[10px] font-extrabold text-sleek-text-muted uppercase tracking-widest pl-1">Charges Directes</span>
                         <InputGroup 
                           label="Matières & Cons." 
                           value={calculatedYears[idx].matieresFournitures} 
                           onChange={(v) => handleUpdateYear(idx, 'matieresFournitures', v)} 
                           isAuto={true} 
                           formula="Fuel + Élec + Accessoires calculés + Saisie Manuelle"
                         />
                         <InputGroup 
                           label="Services & Entret." 
                           value={calculatedYears[idx].services} 
                           onChange={(v) => handleUpdateYear(idx, 'services', v)} 
                           isAuto={false}
                         />
                         <InputGroup 
                           label="Masse Salariale" 
                           value={calculatedYears[idx].fraisPersonnel} 
                           onChange={(v) => handleUpdateYear(idx, 'fraisPersonnel', v)} 
                           suffix="DA" 
                           isAuto={true} 
                           formula="Injection directe des RH + Saisie Manuelle additionnelle"
                         />
                         <InputGroup 
                           label="Amortissements" 
                           value={calculatedYears[idx].dotationsAmortissements} 
                           onChange={(v) => handleUpdateYear(idx, 'dotationsAmortissements', v)} 
                           suffix="DA" 
                           isAuto={true} 
                           formula="Injection directe des Amortissements + Saisie Manuelle"
                         />
                      </div>
                      <div className="flex flex-col gap-2">
                         <span className="text-[10px] font-extrabold text-sleek-text-muted uppercase tracking-widest pl-1">Charges Induites</span>
                         <InputGroup label="Impôts & Taxes" value={year.impotsTaxes} onChange={(v) => handleUpdateYear(idx, 'impotsTaxes', v)} />
                         <InputGroup label="Frais Financiers" value={year.fraisFinanciers} onChange={(v) => handleUpdateYear(idx, 'fraisFinanciers', v)} />
                      </div>
                    </div>
                  </div>
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
                className="flex-1 bg-white rounded-2xl border border-sleek-border shadow-2xl overflow-hidden flex flex-col"
              >
                <div className="flex-1 overflow-auto custom-scrollbar relative">
                  <table className="w-full border-collapse min-w-[1200px]">
                    <thead className="sticky top-0 z-[60] shadow-sm">
                      <tr>
                        <th className="bg-slate-50 p-5 text-left w-72 border-b border-sleek-border font-bold text-[10px] uppercase tracking-widest text-sleek-text-muted sticky left-0 z-[70] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] font-serif italic backdrop-blur-md">Compte de Résultat (TCR - DA)</th>
                        {calculatedYears.map(y => (
                          <th key={y.year} className="bg-slate-50 p-5 text-right border-b border-sleek-border border-r border-white/40 font-bold text-[10px] text-sleek-text-muted whitespace-nowrap backdrop-blur-md">Année {y.year}</th>
                        ))}
                        <th className="bg-slate-100 p-5 text-right border-b border-sleek-border font-bold text-[10px] text-sleek-text-main shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] uppercase tracking-widest sticky right-0 z-[70] backdrop-blur-md">TOTAL (DA)</th>
                      </tr>
                    </thead>
                    <tbody className="text-[12px] font-mono leading-none divide-y divide-slate-100/50">
                      <SleekRow label="EXTRACTION GRANITE (T)" values={calculatedYears.map(y => y.extractionGranite)} total={totalRow.extractionGranite} format={formatCurrency} />
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
                      <SleekRow label="PRIX REVIENT GRANITE (DA/T)" values={calculatedYears.map(y => y.prixRevientGranite)} total={totalRow.prixRevientGranite} format={formatCompact} formula="Alloc. directes + Quote-part indirects" />
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
                className="flex-1 overflow-y-auto pr-2 space-y-8"
               >
                  <div className="bg-white p-8 rounded-2xl border border-sleek-border shadow-sm">
                    <h3 className="text-sm font-bold mb-6 flex items-center gap-2"><BarChartIcon size={18} className="text-sleek-primary"/> Évolution du Chiffre d'affaires vs Résultat Net</h3>
                    <div className="w-full h-[350px] min-h-[350px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#64748b'}} />
                             <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#64748b'}} tickFormatter={v => `${v/1000}k`} />
                             <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                formatter={(v: number) => [formatCurrency(v) + " DA", ""]}
                             />
                             <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '20px' }} />
                             <Bar dataKey="Chiffre d'affaires" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                             <Bar dataKey="Résultat Net" fill="#10b981" radius={[4, 4, 0, 0]} />
                          </BarChart>
                       </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-2xl border border-sleek-border shadow-sm">
                    <h3 className="text-sm font-bold mb-6 flex items-center gap-2"><LineChartIcon size={18} className="text-sleek-accent-red"/> Structure de Coût - Masse Salariale</h3>
                    <div className="w-full h-[350px] min-h-[350px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                             <defs>
                                <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                                   <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#64748b'}} />
                             <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#64748b'}} tickFormatter={v => `${v/1000}k`} />
                             <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                formatter={(v: number) => [formatCurrency(v) + " DA", ""]}
                             />
                             <Area type="monotone" dataKey="Frais de Personnel" stroke="#ef4444" fillOpacity={1} fill="url(#colorHr)" strokeWidth={3} />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-2xl border border-sleek-border shadow-sm">
                    <h3 className="text-sm font-bold mb-6 flex items-center gap-2"><Activity size={18} className="text-indigo-600"/> Flux Net de Trésorerie (CAF)</h3>
                    <div className="w-full h-[350px] min-h-[350px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#64748b'}} />
                             <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#64748b'}} tickFormatter={v => `${v/1000}k`} />
                             <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                formatter={(v: number) => [formatCurrency(v) + " DA", ""]}
                             />
                             <Line type="stepAfter" dataKey="Cash-Flow (FNT)" stroke="#6366f1" strokeWidth={4} dot={{r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff'}} />
                          </LineChart>
                       </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-2xl border border-sleek-border shadow-sm">
                    <h3 className="text-sm font-bold mb-6 flex items-center gap-2"><TrendingUp size={18} className="text-sleek-primary"/> Évolution des Principaux Coûts</h3>
                    <div className="w-full h-[350px] min-h-[350px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#64748b'}} />
                             <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#64748b'}} tickFormatter={v => `${v/1000}k`} />
                             <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                formatter={(v: number) => [formatCurrency(v) + " DA", ""]}
                             />
                             <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                             <Line type="monotone" dataKey="Matières et Fournitures" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} />
                             <Line type="monotone" dataKey="Frais de Personnel" stroke="#ef4444" strokeWidth={3} dot={{r: 4}} />
                             <Line type="monotone" dataKey="Amortissements" stroke="#10b981" strokeWidth={3} dot={{r: 4}} />
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
                  <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 shadow-sm">
                    <h3 className="font-bold flex items-center gap-2 mb-2"><Info size={18}/> Intégration Dynamique</h3>
                    <p className="text-xs text-indigo-900/60 leading-relaxed italic">
                      Le code ViewModel ci-dessous intègre un <b>StateFlow</b> qui combine les données d'équipements et les prévisions TCR. 
                      Tout ajout d'équipement recalcule immédiatement les dotations du TCR.
                    </p>
                  </div>
                  <CodeExport title="TCRViewModel.kt" code={KOTLIN_VIEWMODEL.trim()} icon={<Smartphone size={16}/>} />
                </div>
                <div className="flex flex-col gap-4">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
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
                  <div className="bg-white rounded-[2.5rem] p-10 border border-sleek-border shadow-xl">
                    <h2 className="text-2xl font-black text-sleek-text-main mb-8 flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                        <BookOpen size={20} />
                      </div>
                      Guide Technique & Méthodologie
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                      <HelpCard 
                        icon={<PieChart size={20} className="text-sleek-primary" />}
                        title="Comptabilité Analytique Multi-Produits" 
                        description="L'application sépare les charges directes (affectées spécifiquement au Granite ou au Tuf) et répartit les charges communes (Administration, Carburant commun, Maintenance commune, etc.) proportionnellement au tonnage extrait annuel de chaque matériau pour garantir un coût de revient mathématiquement exact."
                        color="bg-blue-50"
                      />
                      <HelpCard 
                        icon={<Mountain size={20} className="text-sleek-primary" />}
                        title="Dimensionnement de Production" 
                        description="Planification stratégique basée sur un objectif (Vcible). L'outil calcule le volume Tout-Venant (V_amont) nécessaire en intégrant les pertes d'extraction (η1) et de retaille (η2), identifiant ainsi le nombre de machines (N_A, N_B) pour éviter les goulots d'étranglement."
                        color="bg-blue-50"
                      />
                      <HelpCard 
                        icon={<Zap size={20} className="text-sleek-primary" />}
                        title="Calculateur de Consommables" 
                        description="Outil spécialisé pour le Fil Diamanté permettant d'estimer la quantité annuelle selon la vitesse de sciage (Vs), le coefficient de consommation (Cfu) et le régime de travail, avec injection directe dans les coûts accessoires."
                        color="bg-indigo-50"
                      />
                      <HelpCard 
                        icon={<HardDrive size={20} className="text-sleek-accent-red" />}
                        title="Amortissements Financiers" 
                        description="Calcul de la dépréciation linéaire basé sur le prix d'acquisition et la durée de vie de chaque équipement. Les annuités sont automatiquement injectées dans le TCR au prorata de leur affectation (Direct Granite, Direct Tuf ou Commun)."
                        color="bg-red-50"
                      />
                      <HelpCard 
                        icon={<Users size={20} className="text-sleek-accent-green" />}
                        title="Masse Salariale & RH" 
                        description="Calcul consolidé incluant les salaires de base, les charges sociales patronales (taux CNAS ajustable) et une projection dynamique intégrant l'inflation salariale annuelle composée sur 10 ans."
                        color="bg-emerald-50"
                      />
                      <HelpCard 
                        icon={<Activity size={20} className="text-indigo-600" />}
                        title="Cash-Flow (FNT)" 
                        description="Flux Net de Trésorerie calculé par la somme : Résultat Net + Dotations aux Amortissements. C'est l'indicateur clé de la capacité d'autofinancement et de la liquidité réelle générée par l'exploitation minière."
                        color="bg-indigo-50"
                      />
                      <HelpCard 
                        icon={<Calculator size={20} className="text-orange-600" />}
                        title="Coût de Revient (DA/T)" 
                        description="Formule : (Total Charges Directes Produit + Quote-part Charges Communes) / Tonnage Extrait. Ce coût est indispensable pour fixer un prix de vente compétitif tout en assurant la rentabilité du site."
                        color="bg-orange-50"
                      />
                      <HelpCard 
                        icon={<HardHat size={20} className="text-slate-600" />}
                        title="Hypothèses de Calcul" 
                        description="Le taux d'IBM (Impôt sur les Bénéfices) et les taux d'inflation sont paramétrables dans les réglages avancés pour simuler différents scénarios économiques algériens."
                        color="bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-[2.5rem] p-10 border border-slate-800 text-white shadow-2xl relative overflow-hidden group">
                     <div className="absolute -top-24 -right-24 w-64 h-64 bg-sleek-primary/20 rounded-full blur-[100px] group-hover:bg-sleek-primary/30 transition-colors duration-1000"></div>
                     <div className="relative z-10">
                        <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                          <Edit3 size={20} className="text-sleek-primary" />
                          Notes & Hypothèses du Projet
                        </h3>
                        <p className="text-xs text-slate-400 mb-6 leading-relaxed max-w-2xl">
                          Utilisez cet espace pour documenter vos hypothèses spécifiques (densité des terrains, ratios de foisonnement, contraintes géotechniques) afin qu'elles apparaissent dans vos dossiers universitaires.
                        </p>
                        <textarea 
                          value={userNotes}
                          onChange={(e) => setUserNotes(e.target.value)}
                          placeholder="Exemple: Hypothèse de foisonnement des matériaux: 1.25..."
                          className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl p-6 text-sm font-medium focus:ring-2 focus:ring-sleek-primary/50 transition-all outline-none resize-none placeholder:text-slate-600"
                        />
                     </div>
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
                <div className="w-full max-w-2xl mx-auto bg-white rounded-[2.5rem] border border-sleek-border shadow-2xl overflow-hidden relative group mb-8">
                  {/* Decorative Background Element */}
                  <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-br from-sleek-primary/10 via-indigo-50 to-transparent -z-0"></div>
                  <div className="absolute top-12 right-12 w-32 h-32 bg-sleek-primary/5 rounded-full blur-3xl"></div>
                  
                  <div className="relative z-10 p-12 flex flex-col items-center text-center">
                    {/* Avatar Header */}
                    <div className="relative mb-8">
                       <div className="w-40 h-40 bg-white rounded-full p-1.5 shadow-xl border border-slate-100 flex items-center justify-center relative z-10">
                          <div className="w-full h-full bg-slate-50 rounded-full flex items-center justify-center text-sleek-primary">
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
                        className="flex items-center justify-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-sleek-primary hover:bg-white hover:shadow-lg hover:shadow-sleek-primary/5 transition-all group/contact active:scale-[0.98]"
                       >
                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-sleek-text-muted group-hover/contact:text-sleek-primary shadow-sm transition-colors border border-slate-50">
                            <Mail size={18} />
                         </div>
                         <div className="flex flex-col items-start">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Email</span>
                            <span className="text-sm font-bold text-sleek-text-main">mouaialouai4@gmail.com</span>
                         </div>
                       </a>

                       <a 
                        href="tel:0656874473" 
                        className="flex items-center justify-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-sleek-accent-green hover:bg-white hover:shadow-lg hover:shadow-sleek-accent-green/5 transition-all group/contact active:scale-[0.98]"
                       >
                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-sleek-text-muted group-hover/contact:text-sleek-accent-green shadow-sm transition-colors border border-slate-50">
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
        "relative w-full flex items-center gap-3 px-8 py-3.5 text-sm transition-colors duration-300", 
        active ? "text-white opacity-100 bg-white/5" : "text-white opacity-40 hover:opacity-100 hover:bg-white/5"
      )}
    >
      {active && (
        <motion.div 
          layoutId="sidebar-active"
          className="absolute left-0 top-0 bottom-0 w-1 bg-sleek-primary shadow-[0_0_12px_rgba(59,130,246,0.5)]"
          initial={false}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <span className={cn(active ? "text-sleek-primary" : "text-white", "transition-colors duration-300")}>{icon}</span>
      <span className="font-medium tracking-wide">{label}</span>
    </button>
  );
}

function CompactStatCard({ label, value, formula }: { label: string, value: string, formula?: string }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-sleek-border shadow-sm flex flex-col gap-1 hover:border-sleek-primary/30 transition-colors group relative cursor-help">
      <span className="text-[9px] font-bold uppercase tracking-widest text-sleek-text-muted opacity-60 flex items-center gap-1">
        {label}
        {formula && <Info size={10} className="opacity-40" />}
      </span>
      <span className="text-sm font-extrabold text-sleek-text-main tracking-tight">{value}</span>
      {formula && <FormulaTooltip formula={formula} />}
    </div>
  );
}

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

function InputGroupVertical({ label, value, onChange, onBlur, type = "text", helper, readOnly }: { label: string, value: string, onChange: (v: string) => void, onBlur?: () => void, type?: string, helper?: string, readOnly?: boolean }) {
  return (
    <div className={cn("space-y-1.5 min-w-0", readOnly && "opacity-50 grayscale select-none")}>
      <label className="text-[10px] font-bold uppercase tracking-widest text-sleek-text-muted opacity-70 px-1">{label}</label>
      <input 
        type={type} 
        value={value} 
        onChange={e => !readOnly && onChange(e.target.value)} 
        onBlur={onBlur}
        readOnly={readOnly}
        className={cn(
          "w-full border border-sleek-border rounded-xl px-4 py-3 text-sm font-semibold transition-all outline-none shadow-inner",
          readOnly ? "bg-slate-200 cursor-not-allowed" : "bg-slate-50 focus:ring-2 focus:ring-sleek-primary/10 focus:bg-white focus:border-sleek-primary"
        )}
      />
      {helper && <p className="text-[9px] text-sleek-text-muted italic opacity-60 px-1">*{helper}</p>}
    </div>
  );
}

function InputGroup({ label, value, onChange, onBlur, suffix, readOnly, isAuto, formula }: { label: string, value: number, onChange: (v: number) => void, onBlur?: () => void, suffix?: string, readOnly?: boolean, isAuto?: boolean, formula?: string }) {
  return (
    <div className={cn("space-y-1.5 min-w-0", readOnly && "opacity-60")}>
      <label className="text-[10px] font-bold uppercase tracking-wider text-sleek-text-muted opacity-60 block truncate flex items-center gap-1.5 group relative">
        <span className="flex items-center gap-1 cursor-help">
          {label}
          {formula && <Info size={10} className="opacity-40" />}
        </span>
        {isAuto && (
          <span className="inline-flex items-center" title="Calculé automatiquement mais modifiable manuellement">
            <Activity size={10} className="text-sleek-primary animate-pulse" />
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
            readOnly ? "bg-slate-100 border-sleek-border cursor-not-allowed" : "bg-sleek-bg/50 border-sleek-border focus:outline-none focus:ring-2 focus:ring-sleek-primary/20 focus:bg-white focus:border-sleek-primary",
            isAuto && !readOnly && "border-sleek-primary/30 bg-blue-50/20"
          )}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold opacity-30">{suffix}</span>}
      </div>
    </div>
  );
}

function SleekRow({ label, values, total, format, type, formula }: { label: string, values: number[], total: number, format: (n: number) => string, type?: 'subtotal' | 'added-value' | 'total', formula?: string }) {
  return (
    <tr className={cn(
      "border-b border-slate-50 transition-colors group/row even:bg-slate-50/20", 
      type === 'subtotal' && "text-sleek-accent-red font-bold bg-red-50/30", 
      type === 'added-value' && "text-indigo-600 font-bold bg-indigo-50/30", 
      type === 'total' && "bg-[#eff6ff] font-extrabold text-sleek-primary border-t-2 border-sleek-primary shadow-sm"
    )}>
      <td className={cn(
        "p-4 text-left sticky left-0 z-40 border-r border-sleek-border font-bold text-sleek-text-muted transition-colors uppercase text-[9px] tracking-tight relative group/label cursor-help shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]", 
        type === 'added-value' ? "bg-indigo-50/80" : type === 'subtotal' ? "bg-red-50/80" : type === 'total' ? "bg-blue-100/90" : "bg-white group-hover/row:bg-slate-50 group-even/row:bg-slate-50/50"
      )}>
        <div className="flex items-center gap-1.5">
          {label}
          {formula && <Info size={10} className="opacity-30 group-hover/label:opacity-100 transition-opacity" />}
        </div>
        {formula && (
          <div className="absolute left-[80%] bottom-full mb-2 opacity-0 group-hover/label:opacity-100 scale-95 group-hover/label:scale-100 transition-all duration-200 z-[100] w-64 p-3 bg-slate-800/95 text-white text-[10px] rounded-xl shadow-2xl pointer-events-none ring-1 ring-white/10 backdrop-blur-md normal-case tracking-normal font-sans">
             <div className="flex items-center gap-2 mb-1.5 border-b border-white/10 pb-1.5">
                <Calculator size={12} className="text-sleek-primary" />
                <span className="font-bold uppercase tracking-wider text-[9px] opacity-70">Formule de calcul</span>
             </div>
             {formula}
             <div className="absolute top-full left-4 border-8 border-transparent border-t-slate-800/95"></div>
          </div>
        )}
      </td>
      {values.map((v, i) => (
        <td key={i} className="p-4 text-right whitespace-nowrap tabular-nums opacity-90 group-hover/row:opacity-100 transition-opacity">
          {format(v)}
        </td>
      ))}
      <td className={cn(
        "p-4 text-right font-bold whitespace-nowrap tabular-nums z-40 sticky right-0 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors", 
        type === 'added-value' ? "bg-indigo-50" : type === 'subtotal' ? "bg-red-50" : type === 'total' ? "bg-blue-100" : "bg-slate-50 group-hover/row:bg-slate-100"
      )}>
        {format(total)}
      </td>
    </tr>
  );
}

function DashboardKPI({ icon, label, value, suffix, formula }: { icon: React.ReactNode, label: string, value: string, suffix?: string, formula?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-sleek-border shadow-sm p-6 flex items-center gap-5 hover:shadow-md transition-shadow group relative cursor-help">
      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-sleek-primary shrink-0 border border-slate-100">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-[2px] mb-1 flex items-center gap-1.5">
          {label}
          {formula && <Info size={10} className="opacity-40" />}
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-black text-sleek-text-main tracking-tight">{value}</span>
          {suffix && <span className="text-[10px] font-extrabold text-sleek-text-muted opacity-40 uppercase">{suffix}</span>}
        </div>
      </div>
      {formula && <FormulaTooltip formula={formula} />}
    </div>
  );
}

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
    <div className={cn("p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md hover:scale-[1.02]", color)}>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
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
    <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors text-left"
      >
        <span className="text-sm font-bold text-sleek-text-main">{title}</span>
        <PlusCircle size={16} className={cn("text-slate-300 transition-transform duration-300", isOpen && "rotate-45")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-white"
          >
            <div className="p-4 text-xs font-medium text-sleek-text-muted leading-relaxed border-t border-slate-50">
              {description}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
