'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

function CalculatorIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

function NutritionIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
    </svg>
  );
}

function DumbbellIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

const features = [
  {
    icon: <CalculatorIcon />,
    title: 'Metabolismo Inteligente',
    description: 'Calcula tu BMI, composición corporal, RMR y TDEE con 4 fórmulas científicas simultáneas',
  },
  {
    icon: <NutritionIcon />,
    title: 'Nutrición Personalizada',
    description: 'Planes de alimentación adaptados a tu objetivo: perder peso, ganar músculo o definición',
  },
  {
    icon: <DumbbellIcon />,
    title: 'Entrenamientos Guiados',
    description: 'Rutinas estructuradas con seguimiento de progreso y rachas de entrenamiento',
  },
];

const steps = [
  {
    number: '01',
    title: 'Crea tu perfil',
    description: 'Ingresa tus datos y medidas en nuestro onboarding inteligente',
  },
  {
    number: '02',
    title: 'Recibe tu plan',
    description: 'Obtén cálculos metabólicos y un plan nutricional personalizado',
  },
  {
    number: '03',
    title: 'Transforma tu cuerpo',
    description: 'Sigue tus entrenamientos y rastrea tu progreso',
  },
];

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-dark-900 text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        {/* Background glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h1
            className={`text-6xl sm:text-7xl md:text-8xl font-extrabold mb-6 transition-all duration-1000 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <span className="bg-gradient-to-r from-primary via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              FitBro
            </span>
          </h1>

          <p
            className={`text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-200 mb-4 transition-all duration-1000 delay-200 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Tu coach de fitness inteligente
          </p>

          <p
            className={`text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-10 transition-all duration-1000 delay-400 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            Cálculos metabólicos avanzados, planes nutricionales personalizados y entrenamientos adaptados a tus objetivos
          </p>

          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-1000 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '600ms' }}
          >
            <Link
              href="/register"
              className="relative group px-8 py-4 bg-primary text-dark-900 font-bold rounded-xl text-lg hover:bg-primary-dark transition-colors"
            >
              <span className="relative z-10">Comenzar Ahora</span>
              <span className="absolute inset-0 rounded-xl bg-primary opacity-50 blur-lg group-hover:opacity-75 transition-opacity animate-pulse-glow" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 border border-dark-500 text-gray-300 font-semibold rounded-xl text-lg hover:border-primary/50 hover:text-white transition-colors backdrop-blur-sm"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000 ${
            mounted ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transitionDelay: '1000ms' }}
        >
          <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-gray-500 rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2
            className={`text-3xl sm:text-4xl font-bold text-center mb-4 transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            Todo lo que necesitas
          </h2>
          <p className="text-gray-400 text-center mb-16 text-lg">
            Herramientas profesionales en una sola plataforma
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`group relative p-8 rounded-2xl bg-dark-800/50 backdrop-blur-sm border border-dark-500 hover:border-primary/30 transition-all duration-500 hover:-translate-y-1 ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${800 + index * 150}ms` }}
              >
                {/* Gradient border glow on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 bg-dark-800/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            Cómo funciona
          </h2>
          <p className="text-gray-400 text-center mb-16 text-lg">
            En 3 simples pasos
          </p>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`flex items-start gap-6 transition-all duration-700 ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${1200 + index * 200}ms` }}
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                    {step.number}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className={`text-3xl sm:text-4xl font-bold mb-6 transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            Listo para empezar tu{' '}
            <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
              transformación
            </span>
            ?
          </h2>
          <p className="text-gray-400 mb-10 text-lg">
            Únete hoy y accede a todas las herramientas que necesitas
          </p>
          <Link
            href="/register"
            className="relative group inline-block px-10 py-4 bg-primary text-dark-900 font-bold rounded-xl text-lg hover:bg-primary-dark transition-colors"
          >
            <span className="relative z-10">Crear mi cuenta gratis</span>
            <span className="absolute inset-0 rounded-xl bg-primary opacity-50 blur-lg group-hover:opacity-75 transition-opacity animate-pulse-glow" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-dark-500">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            2026 FitBro. Tu transformación comienza aquí.
          </p>
        </div>
      </footer>
    </div>
  );
}
