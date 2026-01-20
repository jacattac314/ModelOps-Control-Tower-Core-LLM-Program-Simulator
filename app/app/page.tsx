'use client';

import { useState } from 'react';
import ExperimentDashboard from './components/ExperimentDashboard';
import EvaluationView from './components/EvaluationView';
import InfraHealth from './components/InfraHealth';
import LaunchReadiness from './components/LaunchReadiness';

type Tab = 'experiments' | 'evaluations' | 'infrastructure' | 'launch';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('experiments');

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              ModelOps Control Tower
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Research program operations for frontier LLM development
            </p>
          </div>

          <nav className="flex space-x-8 -mb-px">
            <button
              onClick={() => setActiveTab('experiments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'experiments'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Experiments
            </button>
            <button
              onClick={() => setActiveTab('evaluations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'evaluations'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Evaluations
            </button>
            <button
              onClick={() => setActiveTab('infrastructure')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'infrastructure'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Infrastructure
            </button>
            <button
              onClick={() => setActiveTab('launch')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'launch'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Launch Gates
            </button>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'experiments' && <ExperimentDashboard />}
        {activeTab === 'evaluations' && <EvaluationView />}
        {activeTab === 'infrastructure' && <InfraHealth />}
        {activeTab === 'launch' && <LaunchReadiness />}
      </div>
    </main>
  );
}
