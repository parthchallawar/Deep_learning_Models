import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Binary, 
  Cpu, 
  GitCompare, 
  Terminal 
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, desc: 'Experiment Explorer' },
    { name: 'Architecture', path: '/architecture', icon: Cpu, desc: 'Layer Visualizer' },
    { name: 'Inference', path: '/inference', icon: Terminal, desc: 'Live Predictions' },
    { name: 'Comparison', path: '/compare', icon: GitCompare, desc: 'Global Metrics' },
  ];

  return (
    <aside className="w-68 h-screen sticky top-0 bg-bg-secondary border-r border-border-card flex flex-col justify-between shrink-0">
      <div className="flex flex-col">
        {/* Logo/Branding */}
        <div className="p-6 border-b border-border-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center shadow-lg shadow-accent-purple/20">
            <Binary className="w-6 h-6 text-text-primary animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-text-primary to-accent-cyan bg-clip-text text-transparent">
              CALTECH-101
            </h1>
            <p className="text-xs text-text-muted font-mono uppercase tracking-widest">
              ML LABS V1.0
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 flex flex-col gap-2 mt-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
                ${isActive 
                  ? 'bg-gradient-to-r from-accent-purple/10 to-accent-cyan/10 border-l-4 border-accent-purple text-text-primary glass-panel' 
                  : 'text-text-muted hover:text-text-primary hover:bg-white/5 border-l-4 border-transparent'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`
                    w-5 h-5 transition-transform duration-300 group-hover:scale-110
                    ${isActive ? 'text-accent-cyan' : 'text-text-muted group-hover:text-text-primary'}
                  `} />
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm leading-tight">{item.name}</span>
                    <span className="text-[10px] text-text-muted group-hover:text-text-muted/80">{item.desc}</span>
                  </div>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-6 border-t border-border-card bg-bg-primary/40">
        <div className="flex flex-col gap-1.5 font-mono text-[10px] text-text-muted">
          <div className="flex justify-between">
            <span>MODELS:</span>
            <span className="text-accent-pink font-bold">24 TOTAL</span>
          </div>
          <div className="flex justify-between">
            <span>CATEGORIES:</span>
            <span className="text-accent-cyan font-bold">101 CLASSES</span>
          </div>
          <div className="flex justify-between">
            <span>BACKBONE:</span>
            <span className="text-accent-purple font-bold">MOBILENETV3</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
