"use client";

import { useState } from 'react';

export default function MortgageCalculator() {
  const [loanAmount, setLoanAmount] = useState('100000');
  const [downPayment, setDownPayment] = useState('5');
  const [years, setYears] = useState('12');
  const [interestRate, setInterestRate] = useState('10');
  const [result, setResult] = useState<null | number>(null);

  const calculateMortgage = () => {
    const principal = parseFloat(loanAmount);
    const downPaymentPercent = parseFloat(downPayment) / 100;
    const loanPrincipal = principal - (principal * downPaymentPercent);
    const monthlyRate = (parseFloat(interestRate) / 100) / 12;
    const numberOfPayments = parseFloat(years) * 12;

    if (monthlyRate === 0) {
      setResult(loanPrincipal / numberOfPayments);
      return;
    }

    const m = loanPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    setResult(m);
  };

  const resetForm = () => {
    setLoanAmount('100000');
    setDownPayment('5');
    setYears('12');
    setInterestRate('10');
    setResult(null);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
      <h3 className="text-xl font-bold text-gray-800 mb-2">Mortgage Calculator</h3>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">Loan Amount :</label>
        <input 
          type="number"
          value={loanAmount}
          onChange={(e) => setLoanAmount(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-teal-500 text-gray-600 transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">Down Payment (%) :</label>
        <div className="relative">
          <input 
            type="number"
            value={downPayment}
            onChange={(e) => setDownPayment(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-4 pr-8 py-2.5 outline-none focus:border-teal-500 text-gray-600 transition-colors bg-white"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">%</span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">Years :</label>
        <div className="relative">
          <input 
            type="number"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-4 pr-16 py-2.5 outline-none focus:border-teal-500 text-gray-600 transition-colors"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">Years</span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">Interest Rate (%) :</label>
        <div className="relative">
          <input 
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-4 pr-8 py-2.5 outline-none focus:border-teal-500 text-gray-600 transition-colors"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">%</span>
        </div>
      </div>

      {result !== null && (
        <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 mt-2 text-center">
          <p className="text-sm font-bold text-teal-800 uppercase tracking-widest mb-1">Monthly Payment</p>
          <p className="text-2xl font-black text-teal-600">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(result)}
          </p>
        </div>
      )}

      <div className="flex items-center gap-4 mt-2">
        <button 
          onClick={calculateMortgage}
          className="bg-[#00b48f] hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-sm flex-1 text-sm uppercase tracking-wider"
        >
          Calculate
        </button>
        <button 
          onClick={resetForm}
          className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 font-semibold py-3 px-4 transition-all text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset Form
        </button>
      </div>
    </div>
  );
}
