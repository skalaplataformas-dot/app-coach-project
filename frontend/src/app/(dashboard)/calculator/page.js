'use client';

import { useState, useEffect } from 'react';
import { calculateMetabolicData } from '@/lib/metabolic-math';

export default function CalculatorPage() {
  const [data, setData] = useState({
    weight: 70, height: 170, age: 30, sex: 'M', activityLevel: 3,
    neck: 38, waist: 80, hip: 90,
  });
  const [results, setResults] = useState(null);

  useEffect(() => {
    setResults(calculateMetabolicData(data));
  }, [data]);

  const update = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Calculadora Metabolica</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="card">
          <h3 className="font-bold mb-4">Datos del Paciente</h3>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="input-label">Sexo</label>
              <div className="flex gap-2">
                <button onClick={() => update('sex', 'M')} className={`flex-1 py-2 rounded-xl text-sm font-bold ${data.sex === 'M' ? 'bg-primary text-black' : 'bg-dark-600'}`}>H</button>
                <button onClick={() => update('sex', 'F')} className={`flex-1 py-2 rounded-xl text-sm font-bold ${data.sex === 'F' ? 'bg-primary text-black' : 'bg-dark-600'}`}>M</button>
              </div>
            </div>
            <div>
              <label className="input-label">Edad</label>
              <input type="number" className="input-field" value={data.age} onChange={e => update('age', Number(e.target.value))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="input-label">Peso (kg)</label>
              <input type="number" step="0.1" className="input-field" value={data.weight} onChange={e => update('weight', Number(e.target.value))} />
            </div>
            <div>
              <label className="input-label">Altura (cm)</label>
              <input type="number" step="0.1" className="input-field" value={data.height} onChange={e => update('height', Number(e.target.value))} />
            </div>
          </div>

          <div className="mb-4">
            <label className="input-label">Nivel Actividad: {data.activityLevel}</label>
            <input type="range" min="1" max="6" step="1" value={data.activityLevel} onChange={e => update('activityLevel', Number(e.target.value))} className="w-full" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Sedentario</span><span>Atleta</span>
            </div>
          </div>

          <h4 className="text-sm text-gray-400 uppercase mb-3 mt-6">Antropometria (cm)</h4>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="input-label">Cuello</label>
              <input type="number" step="0.1" className="input-field" value={data.neck} onChange={e => update('neck', Number(e.target.value))} />
            </div>
            <div>
              <label className="input-label">Cintura</label>
              <input type="number" step="0.1" className="input-field" value={data.waist} onChange={e => update('waist', Number(e.target.value))} />
            </div>
            {data.sex === 'F' && (
              <div>
                <label className="input-label">Cadera</label>
                <input type="number" step="0.1" className="input-field" value={data.hip} onChange={e => update('hip', Number(e.target.value))} />
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="card">
            <h3 className="font-bold mb-4 text-primary">Resultados</h3>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-dark-700 rounded-xl p-4 text-center">
                <div className="text-xs text-gray-400">TMB PROMEDIO</div>
                <div className="text-xl font-bold">{Math.round(results.averageRMR)}</div>
                <div className="text-xs">kcal/dia</div>
              </div>
              <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 text-center">
                <div className="text-xs text-gray-400">GASTO TOTAL (TDEE)</div>
                <div className="text-xl font-bold text-primary">{Math.round(results.averageTDEE)}</div>
                <div className="text-xs">kcal/dia</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="bg-dark-700 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-400">% Grasa</div>
                <div className="font-bold">{results.averageBodyFatPercentage.toFixed(1)}%</div>
              </div>
              <div className="bg-dark-700 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-400">M. Muscular</div>
                <div className="font-bold text-cyan-400">{results.muscleMassKg.toFixed(1)}kg</div>
              </div>
              <div className="bg-dark-700 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-400">M. Osea</div>
                <div className="font-bold">{results.boneMassKg.toFixed(1)}kg</div>
              </div>
            </div>

            {/* Energy Table */}
            <h4 className="text-sm text-gray-400 uppercase mb-2 border-t border-dark-500 pt-4">Desglose Energetico</h4>
            <table className="w-full text-sm mb-6">
              <thead>
                <tr className="text-gray-400">
                  <th className="text-left py-1">Metodo</th>
                  <th className="text-right py-1">Basal</th>
                  <th className="text-right py-1">Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(results.energyMethods).map((m, i) => (
                  <tr key={i} className="border-b border-dark-600">
                    <td className="py-2 font-medium">{m.method}</td>
                    <td className="py-2 text-right">{Math.round(m.rmr)}</td>
                    <td className="py-2 text-right text-primary">{Math.round(m.tdee)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Composition Table */}
            <h4 className="text-sm text-gray-400 uppercase mb-2 border-t border-dark-500 pt-4">Composicion Corporal</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400">
                  <th className="text-left py-1">Metodo</th>
                  <th className="text-right py-1">% Grasa</th>
                  <th className="text-right py-1">Grasa</th>
                  <th className="text-right py-1">Magra</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(results.compositionMethods).map((m, i) => (
                  <tr key={i} className="border-b border-dark-600">
                    <td className="py-2 font-medium">{m.method}</td>
                    <td className="py-2 text-right">{m.percentage.toFixed(1)}%</td>
                    <td className="py-2 text-right">{m.fatMassKg.toFixed(1)}kg</td>
                    <td className="py-2 text-right text-cyan-400">{m.leanMassKg.toFixed(1)}kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
