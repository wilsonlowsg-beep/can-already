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
  const propertyEquity = Math.max(0, inputs.propertyValue - inputs.outstandingLoan);
  const totalNetWorth = liquidAssets + inputs.cpfOA + inputs.cpfMA + propertyEquity;
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
  const drawdownYears = yearsAssetsLast(
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

  const saleProceedsBeforeCosts = Math.max(
    0,
    inputs.propertyValue - inputs.outstandingLoan - inputs.cpfUsedForHousing,
  );
  const targetLoan = Math.max(0, inputs.targetPropertyPrice - saleProceedsBeforeCosts - inputs.cash);
  const upgradeMortgage = calculateMortgagePayment(
    targetLoan,
    assumptions.mortgageRate,
    assumptions.mortgageTenure,
  );
  const housingRatio = inputs.monthlyIncome > 0 ? (upgradeMortgage / inputs.monthlyIncome) * 100 : 100;
  const propertyScore = clamp(100 - Math.max(0, housingRatio - 25) * 4);
  const monthlySurplus = inputs.monthlyIncome - inputs.monthlySpending - upgradeMortgage;
  const emergencyMonths =
    inputs.monthlySpending > 0 ? inputs.cash / Math.max(1, inputs.monthlySpending) : 99;
  const cashflowScore = clamp(
    (monthlySurplus > 0 ? 45 : 15) +
      clamp((emergencyMonths / 12) * 35, 0, 35) +
      (housingRatio <= 35 ? 20 : 5),
  );

  const retirementImpact = clamp(retirementScore - Math.max(0, targetLoan / 100000) * 2.8);
  const overallScore = Math.round(
    retirementScore * 0.35 + cpfScore * 0.25 + propertyScore * 0.2 + cashflowScore * 0.2,
  );
  const overallStatus = getStatus(overallScore);

  return {
    cpfTotal,
    liquidAssets,
    propertyEquity,
    totalNetWorth,
    yearsToRetirement,
    futureAnnualSpending,
    retirementPool,
    drawdownYears,
    neededYears,
    retirementScore: Math.round(retirementScore),
    cpfScore: Math.round(cpfScore),
    propertyScore: Math.round(propertyScore),
    cashflowScore: Math.round(cashflowScore),
    overallScore,
    overallStatus,
    saleProceedsBeforeCosts,
    targetLoan,
    upgradeMortgage,
    housingRatio,
    monthlySurplus,
    emergencyMonths,
    retirementImpact: Math.round(retirementImpact),
  };
}
