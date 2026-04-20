import { 
  AnnualData, 
  CalculatedData, 
  FullYearData, 
  Equipment, 
  AmortizationRow, 
  EmployeeRole, 
  HRConfig,
  OperationalMachine,
  OperationalConfig,
  Allocation
} from '../types';

export interface SplitCosts {
  granite: number[];
  tuf: number[];
  common: number[];
}

export const getOperationalCosts = (machines: OperationalMachine[], config: OperationalConfig): { fuel: SplitCosts, maintenance: SplitCosts } => {
  const empty = () => ({ granite: Array(10).fill(0), tuf: Array(10).fill(0), common: Array(10).fill(0) });
  const fuel = empty();
  const maintenance = empty();

  machines.forEach(m => {
    const y1Fuel = m.hourlyConsumption * m.hoursPerDay * config.workDaysPerYear * config.fuelPrice;
    const y1Maint = m.assetValue * (m.maintenanceRate / 100);
    const alloc = m.allocation.toLowerCase() as keyof SplitCosts;

    fuel[alloc][0] += y1Fuel;
    maintenance[alloc][0] += y1Maint;
  });

  for (let i = 1; i < 10; i++) {
    ['granite', 'tuf', 'common'].forEach(k => {
      const key = k as keyof SplitCosts;
      fuel[key][i] = fuel[key][i - 1] * (1 + config.annualInflationRate / 100);
      maintenance[key][i] = maintenance[key][i - 1] * (1 + config.annualInflationRate / 100);
    });
  }

  return { fuel, maintenance };
};

export const getHRCosts = (roles: EmployeeRole[], config: HRConfig): SplitCosts => {
  const costs = { granite: Array(10).fill(0), tuf: Array(10).fill(0), common: Array(10).fill(0) };

  roles.forEach(role => {
    const baseAnnual = role.count * role.monthlySalary * config.paidMonths;
    const socialCharges = baseAnnual * config.socialChargesRate;
    const y1Total = baseAnnual + socialCharges;
    const alloc = role.allocation.toLowerCase() as keyof SplitCosts;
    costs[alloc][0] += y1Total;
  });

  for (let i = 1; i < 10; i++) {
    ['granite', 'tuf', 'common'].forEach(k => {
      const key = k as keyof SplitCosts;
      costs[key][i] = costs[key][i - 1] * (1 + config.annualIncreaseRate);
    });
  }

  return costs;
};

export const getAmortizationSchedule = (equipments: Equipment[]): { rows: AmortizationRow[], annualTotals: SplitCosts } => {
  const rows = equipments.map(eq => {
    const annualAmortization = eq.duration > 0 ? eq.price / eq.duration : 0;
    const years = Array.from({ length: 10 }, (_, i) => {
      const year = i + 1;
      return year <= eq.duration ? annualAmortization : 0;
    });
    return {
      designation: eq.designation,
      annualAmortization,
      years,
      allocation: eq.allocation
    };
  });

  const annualTotals = { granite: Array(10).fill(0), tuf: Array(10).fill(0), common: Array(10).fill(0) };
  rows.forEach(row => {
    const alloc = row.allocation.toLowerCase() as keyof SplitCosts;
    row.years.forEach((val, i) => {
      annualTotals[alloc][i] += val;
    });
  });

  return { rows, annualTotals };
};

export const calculateYear = (
  data: AnnualData, 
  ibmRate: number,
  fuelSplit: SplitCosts,
  maintSplit: SplitCosts,
  hrSplit: SplitCosts,
  amortSplit: SplitCosts,
  idx: number,
  // Other potential indirect costs like taxes and finances might need splitting too, 
  // but usually they are "Common" unless specified.
): FullYearData => {
  const caGlobal = (data.caGranite || 0) + (data.caTuf || 0);
  
  // Total direct + indirect calculation for the Global TCR
  const subtotal1 = data.matieresFournitures + data.services;
  const subtotal2 = data.fraisPersonnel + data.impotsTaxes + data.fraisFinanciers + data.dotationsAmortissements;
  const valeurAjoutee = caGlobal - subtotal1;
  const resultatExploitation = valeurAjoutee - subtotal2;
  const ibm = Math.max(0, resultatExploitation * ibmRate);
  const resultatNet = resultatExploitation - ibm;
  const fnt = resultatNet + data.dotationsAmortissements;

  // ANALYTIC CALCULATION for Prix de Revient
  // 1. Identify Direct Costs per product from models
  const directGranite = 
    fuelSplit.granite[idx] + 
    maintSplit.granite[idx] + 
    hrSplit.granite[idx] + 
    amortSplit.granite[idx];

  const directTuf = 
    fuelSplit.tuf[idx] + 
    maintSplit.tuf[idx] + 
    hrSplit.tuf[idx] + 
    amortSplit.tuf[idx];

  // 2. Determine the Common Pool
  // We take the total expenses from the TCR and subtract identified direct costs.
  // This ensures that any manual entry or "Common" tagged cost is correctly pooled and allocated.
  const totalExpenses = 
    data.matieresFournitures + 
    data.services + 
    data.fraisPersonnel + 
    data.impotsTaxes + 
    data.fraisFinanciers + 
    data.dotationsAmortissements;

  const commonPool = Math.max(0, totalExpenses - directGranite - directTuf);

  // 3. Proportional Allocation based on Tonnages
  const totalTonnage = (data.extractionGranite || 0) + (data.extractionTuf || 0) || 1;
  const graniteRatio = (data.extractionGranite || 0) / totalTonnage;
  const tufRatio = (data.extractionTuf || 0) / totalTonnage;

  const costGranite = directGranite + (commonPool * graniteRatio);
  const costTuf = directTuf + (commonPool * tufRatio);

  const prixRevientGranite = (data.extractionGranite || 0) > 0 ? costGranite / data.extractionGranite : 0;
  const prixRevientTuf = (data.extractionTuf || 0) > 0 ? costTuf / data.extractionTuf : 0;

  return {
    ...data,
    caGlobal,
    subtotal1,
    valeurAjoutee,
    subtotal2,
    resultatExploitation,
    ibm,
    resultatNet,
    fnt,
    prixRevientGranite,
    prixRevientTuf,
  };
};

export const calculateTotals = (years: FullYearData[]): FullYearData => {
  const totals: FullYearData = {
    year: 0,
    extractionGranite: years.reduce((acc, y) => acc + y.extractionGranite, 0),
    caGranite: years.reduce((acc, y) => acc + y.caGranite, 0),
    extractionTuf: years.reduce((acc, y) => acc + y.extractionTuf, 0),
    caTuf: years.reduce((acc, y) => acc + y.caTuf, 0),
    matieresFournitures: years.reduce((acc, y) => acc + y.matieresFournitures, 0),
    services: years.reduce((acc, y) => acc + y.services, 0),
    subtotal1: years.reduce((acc, y) => acc + y.subtotal1, 0),
    caGlobal: years.reduce((acc, y) => acc + y.caGlobal, 0),
    valeurAjoutee: years.reduce((acc, y) => acc + y.valeurAjoutee, 0),
    fraisPersonnel: years.reduce((acc, y) => acc + y.fraisPersonnel, 0),
    impotsTaxes: years.reduce((acc, y) => acc + y.impotsTaxes, 0),
    fraisFinanciers: years.reduce((acc, y) => acc + y.fraisFinanciers, 0),
    dotationsAmortissements: years.reduce((acc, y) => acc + y.dotationsAmortissements, 0),
    subtotal2: years.reduce((acc, y) => acc + y.subtotal2, 0),
    resultatExploitation: years.reduce((acc, y) => acc + y.resultatExploitation, 0),
    ibm: years.reduce((acc, y) => acc + y.ibm, 0),
    resultatNet: years.reduce((acc, y) => acc + y.resultatNet, 0),
    fnt: years.reduce((acc, y) => acc + y.fnt, 0),
    prixRevientGranite: 0,
    prixRevientTuf: 0,
  };

  // Weighted averages for unit costs over the period
  const totalGranite = totals.extractionGranite || 1;
  const totalTuf = totals.extractionTuf || 1;
  
  // Total cost for Granite over 10 years
  const totalCostGranite = years.reduce((acc, y) => acc + (y.prixRevientGranite * y.extractionGranite), 0);
  const totalCostTuf = years.reduce((acc, y) => acc + (y.prixRevientTuf * y.extractionTuf), 0);

  totals.prixRevientGranite = totalCostGranite / totalGranite;
  totals.prixRevientTuf = totalCostTuf / totalTuf;

  return totals;
};
