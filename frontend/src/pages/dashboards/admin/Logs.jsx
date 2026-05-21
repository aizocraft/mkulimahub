import { useMemo, useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';

import AuthLogs from './logger/AuthLogs';
import UserLogs from './logger/UserLogs';
import SystemLogs from './logger/SystemLogs';
import TransactionsLog from './logger/TransactionsLog';
import ConsultationLogs from './logger/ConsultationLogs';

import {
  Shield,
  User,
  Settings,
  Activity,
  RefreshCw,
  Search,
  FileText
} from 'lucide-react';

const LogTabButton = ({ active, onClick, icon: Icon, label }) => {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? 'flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 text-white shadow-sm'
          : 'flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-800/30 border border-gray-700/60 text-gray-300 hover:border-gray-600 hover:bg-gray-800/50 transition-all'
      }
    >
      <Icon size={16} className={active ? 'text-purple-200' : 'text-gray-400'} />
      <span className='text-sm font-medium'>{label}</span>
    </button>
  );
};

const Logs = () => {
  // Ensure ThemeContext is used (dark/light classes are handled at html level).
  useTheme();

  const [activeTab, setActiveTab] = useState('auth');

  const tabs = useMemo(
    () => [
      { id: 'auth', label: 'Auth', icon: Shield, component: AuthLogs },
      { id: 'users', label: 'Users', icon: User, component: UserLogs },
      { id: 'system', label: 'System', icon: Settings, component: SystemLogs },
      { id: 'transactions', label: 'Transactions', icon: Activity, component: TransactionsLog },
      { id: 'consultations', label: 'Consultations', icon: FileText, component: ConsultationLogs }
    ],
    []
  );

  const ActiveComponent = tabs.find((t) => t.id === activeTab)?.component || AuthLogs;

  return (
    <div className='p-6 space-y-6'>
      <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-white'>Logs</h1>
          <p className='text-gray-400 mt-1'>Monitor authentication, user activity, system events, and more.</p>
        </div>

        <div className='flex flex-wrap gap-3'>
          {tabs.map((t) => (
            <LogTabButton
              key={t.id}
              active={t.id === activeTab}
              onClick={() => setActiveTab(t.id)}
              icon={t.icon}
              label={t.label}
            />
          ))}
        </div>
      </div>

      <div className='rounded-2xl border border-white/10 bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.04)] overflow-hidden backdrop-blur'>
        <div className='p-4 border-b border-white/10 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <RefreshCw size={16} className='text-purple-300' />
            <span className='text-sm text-gray-200 font-medium'>Live Logs</span>
          </div>
          <div className='hidden md:flex items-center gap-2 text-xs text-gray-500'>
            <Search size={14} />
            <span>Use filters in each view</span>
          </div>
        </div>
        <div className='p-2 sm:p-4'>
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};

export default Logs;

