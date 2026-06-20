const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));

export function calculateMortgagePayment(loanAmount, annualRate, years) {
  if (loanAmount <= 0) return 0;
  const months = Math.max(1, years * 12);
  const monthlyRate = annualRate / 100 / 12;

  if (monthlyRate === 0) return loanAmount / months;
  return (loanAmount * monthlyRate) / (1 - (1 + monthlyRate) ** -months);
}

export function projectValue(principal, annualRate, years) {
  return principal * (1 + annualRate / 100) ** Math.max(0, years);
}

export function projectMonthlyInvestment(monthlyAmount, annualRate, years) {
  if (monthlyAmount <= 0 || years <= 0) return 0;
  const months = Math.max(1, years * 12);
  const monthlyRate = annualRate / 100 / 12;

  if (monthlyRate === 0) return monthlyAmount * months;
  return monthlyAmount * (((1 + monthlyRate) ** months - 1) / monthlyRate);
}

export function yearsAssetsLast(startAssets, annualSpending, annualReturn, inflation) {
  if (annualSpending <= 0) return 99;
  let assets = startAssets;
  let spending = annualSpending;

  for (let year = 1; year <= 80; year += 1) {
    assets *= 1 + annualReturn / 100;
    assets -= spending;
    if (assets <= 0) return year;
    spending *= 1 + inflation / 100;
  }

  return 80;
}

export function yearsAssetsLastWithIncome(
  startAssets,
  annualSpending,
  annualReturn,
  inflation,
  yearlyIncome,
  incomeEscalation = 0,
) {
  if (annualSpending <= 0) return 99;
  let assets = startAssets;
  let spending = annualSpending;
  let income = yearlyIncome;

  for (let year = 1; year <= 80; year += 1) {
    assets *= 1 + annualReturn / 100;
    assets -= Math.max(0, spending - income);
    if (assets <= 0) return year;
    spending *= 1 + inflation / 100;
    income *= 1 + incomeEscalation / 100;
  }

  return 80;
}

export function getStatus(score) {
  if (score >= 75) return 'green';
  if (score >= 50) return 'amber';
  return 'red';
}

export function statusText(status) {
  if (status === 'green') return 'Can already';
  if (status === 'amber') return 'Almost there';
  return 'Not yet';
}

export function calculateReadiness(inputs, assumptions) {
  const cpfTotal = inputs.cpfOA + inputs.cpfSA + inputs.cpfMA + inputs.cpfRA;
  const liquidAssets = inputs.cash + inputs.investments + inputs.cpfSA + inputs.cpfRA;
  const totalNetWorth = liquidAssets + inputs.cpfOA + inputs.cpfMA;
  const yearsToRetirement = Math.max(0, assumptions.retirementAge - inputs.age);
  const annualSpending = inputs.monthlySpending * 12;
  const futureAnnualSpending =
    annualSpending * (1 + assumptions.inflation / 100) ** yearsToRetirement;
  const projectedInvestments = projectValue(
    inputs.cash + inputs.investments,
    assumptions.expectedReturn,
    yearsToRetirement,
  );
  const projectedCPF =
    projectValue(inputs.cpfOA, 2.5, yearsToRetirement) +
    projectValue(inputs.cpfSA + inputs.cpfMA + inputs.cpfRA, 4, yearsToRetirement);
  const retirementPool = projectedInvestments + projectedCPF;
  const neededYears = Math.max(1, assumptions.lifeExpectancy - assumptions.retirementAge);
  const cpfLifeAnnualPayout = assumptions.cpfLifeMonthlyPayout * 12;
  const cpfLifeDelayYears = Math.max(0, assumptions.cpfLifeStartAge - assumptions.retirementAge);
  const bridgeCost = cpfLifeDelayYears * futureAnnualSpending;
  const poolAfterCpfLifeBridge = Math.max(0, retirementPool - bridgeCost);
  const drawdownYears = yearsAssetsLastWithIncome(
    poolAfterCpfLifeBridge,
    futureAnnualSpending,
    assumptions.expectedReturn,
    assumptions.inflation,
    cpfLifeAnnualPayout,
    assumptions.cpfLifeEscalation,
  ) + cpfLifeDelayYears;
  const drawdownYearsWithoutCpfLife = yearsAssetsLast(
    retirementPool,
    futureAnnualSpending,
    assumptions.expectedReturn,
    assumptions.inflation,
  );
  const retirementScore = clamp((drawdownYears / neededYears) * 100);

  const retirementBase = inputs.cpfRA > 0 ? inputs.cpfRA : inputs.cpfSA + inputs.cpfRA;
  const cpfRetirementCoverage = clamp(
    (retirementBase / assumptions.fullRetirementSum) * 70,
    0,
    70,
  );
  const medishieldComfort = clamp((inputs.cpfMA / assumptions.basicRetirementSum) * 20, 0, 20);
  const cpfLiquidityBuffer = inputs.cpfOA >= inputs.monthlySpending * 6 ? 10 : 4;
  const cpfScore = clamp(cpfRetirementCoverage + medishieldComfort + cpfLiquidityBuffer);

  const investmentHorizon = Math.max(0, assumptions.retirementAge - inputs.age);
  const projectedMonthlyInvesting = projectMonthlyInvestment(
    inputs.monthlyInvestment,
    assumptions.expectedReturn,
    investmentHorizon,
  );
  const projectedInvestmentValue =
    projectValue(inputs.investments, assumptions.expectedReturn, investmentHorizon) +
    projectedMonthlyInvesting;
  const monthlySurplus = inputs.monthlyIncome - inputs.monthlySpending - inputs.monthlyInvestment;
  const emergencyMonths =
    inputs.monthlySpending > 0 ? inputs.cash / Math.max(1, inputs.monthlySpending) : 99;
  const investRatio = inputs.monthlyIncome > 0 ? (inputs.monthlyInvestment / inputs.monthlyIncome) * 100 : 0;
  const investmentScore = clamp(
    (monthlySurplus >= 0 ? 35 : 5) +
      clamp((emergencyMonths / 6) * 30, 0, 30) +
      clamp((investRatio / 20) * 25, 0, 25) +
      (investmentHorizon >= 10 ? 10 : 5),
  );
  const cashflowScore = clamp(
    (monthlySurplus > 0 ? 45 : 15) +
      clamp((emergencyMonths / 12) * 35, 0, 35) +
      (inputs.monthlyInvestment <= Math.max(0, inputs.monthlyIncome - inputs.monthlySpending) ? 20 : 5),
  );

  const overallScore = Math.round(
    retirementScore * 0.4 + investmentScore * 0.3 + cashflowScore * 0.3,
  );
  const overallStatus = getStatus(overallScore);

  return {
    cpfTotal,
    liquidAssets,
    totalNetWorth,
    yearsToRetirement,
    futureAnnualSpending,
    retirementPool,
    cpfLifeAnnualPayout,
    cpfLifeDelayYears,
    bridgeCost,
    drawdownYears,
    drawdownYearsWithoutCpfLife,
    neededYears,
    projectedMonthlyInvesting,
    projectedInvestmentValue,
    investmentHorizon,
    investRatio,
    retirementScore: Math.round(retirementScore),
    cpfScore: Math.round(cpfScore),
    investmentScore: Math.round(investmentScore),
    cashflowScore: Math.round(cashflowScore),
    overallScore,
    overallStatus,
    monthlySurplus,
    emergencyMonths,
  };
}
