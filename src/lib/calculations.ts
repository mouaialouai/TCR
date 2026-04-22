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
  Allocation,
  ElectricityLine,
  ElectricityConfig,
  AccessoryConfig,
  AccessoryItem
} from '../types';

export interface SplitCosts {
  granite: number[];
  tuf: number[];
  common: number[];
}

export const getElectricityCosts = (lines: ElectricityLine[], config: ElectricityConfig, opConfig: OperationalConfig): SplitCosts => {
  const costs = Array(10).fill(0);
  
  const annualEnergy = lines.reduce((acc, l) => {
    const pLine = l.powerKw * l.count * l.utilizationCoef;
    return acc + (pLine * l.hoursPerDay * l.workDaysPerYear);
  }, 0);

  const annualLitres = annualEnergy * config.specificConsumption;
  const y1Cost = annualLitres * opConfig.fuelPrice;
  
  costs[0] = y1Cost;
  for (let i = 1; i < 10; i++) {
    costs[i] = costs[i - 1] * (1 + opConfig.annualInflationRate / 100);
  }
  
  return { granite: Array(10).fill(0), tuf: Array(10).fill(0), common: costs };
};

export const getOperationalCosts = (machines: OperationalMachine[], config: OperationalConfig): { fuel: SplitCosts, maintenance: SplitCosts } => {
  const empty = () => ({ granite: Array(10).fill(0), tuf: Array(10).fill(0), common: Array(10).fill(0) });
  const fuel = empty();
  const maintenance = empty();

  machines.forEach(m => {
    // Calcul: Conso_Lh (L/h par type de machine) = kW * (L/kWh) * Coef. Utilisation
    const consoLh = m.powerKw * m.consumptionRate * m.utilizationCoef;
    // ConsoTotale_Lh = Conso_Lh * Nombre de machines
    const consoTotaleLh = consoLh * m.count;
    // Litres/an = ConsoTotale_Lh * Heures/jour_machine * Jours/an_machine
    const annualLitres = consoTotaleLh * (m.hoursPerDay ?? config.hoursPerDay) * (m.workDaysPerYear ?? config.workDaysPerYear);
    // CoutCarburantAnnuel = Litres/an * Prix du litre
    const y1Fuel = annualLitres * config.fuelPrice;
    
    const alloc = m.allocation.toLowerCase() as keyof SplitCosts;
    fuel[alloc][0] += y1Fuel;
  });

  for (let i = 1; i < 10; i++) {
    ['granite', 'tuf', 'common'].forEach(k => {
      const key = k as keyof SplitCosts;
      fuel[key][i] = fuel[key][i - 1] * (1 + config.annualInflationRate / 100);
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

export const getAccessoryCosts = (config: AccessoryConfig, inflationRate: number): SplitCosts => {
  const costs = { granite: Array(10).fill(0), tuf: Array(10).fill(0), common: Array(10).fill(0) };

  config.items.forEach(item => {
    const y1Total = item.qtyPerYear * item.unitPrice;
    const alloc = item.allocation.toLowerCase() as keyof SplitCosts;
    costs[alloc][0] += y1Total;
  });

  for (let i = 1; i < 10; i++) {
    ['granite', 'tuf', 'common'].forEach(k => {
      const key = k as keyof SplitCosts;
      costs[key][i] = costs[key][i - 1] * (1 + inflationRate / 100);
    });
  }

  return costs;
};

export const calculateYear = (
  data: AnnualData, 
  ibmRate: number,
  fuelSplit: SplitCosts,
  maintSplit: SplitCosts,
  hrSplit: SplitCosts,
  amortSplit: SplitCosts,
  electricitySplit: SplitCosts,
  accessorySplit: SplitCosts,
  idx: number,
): FullYearData => {
  const caGlobal = (data.caGranite || 0) + (data.caTuf || 0);
  
  // Intégration Automatique des coûts calculés dans le TCR
  // On additionne la partie saisie manuellement avec la partie automatisée
  const automatedFuel = fuelSplit.granite[idx] + fuelSplit.tuf[idx] + fuelSplit.common[idx];
  const automatedHR = hrSplit.granite[idx] + hrSplit.tuf[idx] + hrSplit.common[idx];
  const automatedAmort = amortSplit.granite[idx] + amortSplit.tuf[idx] + amortSplit.common[idx];
  const automatedElectricity = electricitySplit.granite[idx] + electricitySplit.tuf[idx] + electricitySplit.common[idx];
  const automatedAccessories = accessorySplit.granite[idx] + accessorySplit.tuf[idx] + accessorySplit.common[idx];

  const finalMatieres = data.matieresFournitures + automatedFuel + automatedElectricity + automatedAccessories;
  const finalHR = data.fraisPersonnel + automatedHR;
  const finalAmort = data.dotationsAmortissements + automatedAmort;

  const subtotal1 = finalMatieres + data.services;
  const subtotal2 = finalHR + data.impotsTaxes + data.fraisFinanciers + finalAmort;
  const valeurAjoutee = caGlobal - subtotal1;
  const resultatExploitation = valeurAjoutee - subtotal2;
  const ibm = Math.max(0, resultatExploitation * ibmRate);
  const resultatNet = resultatExploitation - ibm;
  const fnt = resultatNet + finalAmort;

  // ANALYTIC CALCULATION for Prix de Revient
  const directGranite = 
    fuelSplit.granite[idx] + 
    hrSplit.granite[idx] + 
    amortSplit.granite[idx] +
    accessorySplit.granite[idx];

  const directTuf = 
    fuelSplit.tuf[idx] + 
    hrSplit.tuf[idx] + 
    amortSplit.tuf[idx] +
    accessorySplit.tuf[idx];

  const totalExpenses = subtotal1 + subtotal2;
  const commonPool = Math.max(0, totalExpenses - directGranite - directTuf);

  const totalTonnage = (data.extractionGranite || 0) + (data.extractionTuf || 0) || 1;
  const graniteRatio = (data.extractionGranite || 0) / totalTonnage;
  const tufRatio = (data.extractionTuf || 0) / totalTonnage;

  const costGranite = directGranite + (commonPool * graniteRatio);
  const costTuf = directTuf + (commonPool * tufRatio);

  const prixRevientGranite = (data.extractionGranite || 0) > 0 ? costGranite / data.extractionGranite : 0;
  const prixRevientTuf = (data.extractionTuf || 0) > 0 ? costTuf / data.extractionTuf : 0;

  return {
    ...data,
    matieresFournitures: finalMatieres,
    fraisPersonnel: finalHR,
    dotationsAmortissements: finalAmort,
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
