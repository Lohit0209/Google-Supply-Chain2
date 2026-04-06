import React, { useState, useEffect } from 'react';
import { RouteOptimizer } from '../engine/RouteOptimizer';
import { useNewsData } from '../hooks/useNewsData';
import { TopSearchBar } from './TopSearchBar';
import { FilterSidebar } from './FilterSidebar';
import { RouteCard } from './RouteCard';
import { LiveMap } from './LiveMap';
import { HUBS } from '../data/logisticsData';
import type { ShipmentParams } from '../engine/RiskModeler';
import type { Scenario } from '../engine/RouteOptimizer';
import { ChevronDown, Map as MapIcon, X, Maximize2, ShieldAlert, Zap } from 'lucide-react';
import { RiskAlertsView } from './RiskAlertsView';
import { CostBreakdownView } from './CostBreakdownView';
import { OverviewView } from './OverviewView';
import { useCurrency } from '../hooks/useCurrency';
import { motion, AnimatePresence } from 'framer-motion';
import { GlobalNetworkView } from './GlobalNetworkView';
import { ShapExplainabilityView } from './ShapExplainabilityView';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ROUTING' | 'OVERVIEW' | 'NETWORK' | 'EXPLAIN' | 'RISKS' | 'COST'>('ROUTING');
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  
  const [params, setParams] = useState<ShipmentParams>({
    itemType: 'electronics',
    weight: 15,
    cargoValue: 500,
    sensitivity: 0.6,
    isHazardous: false,
    priority: 'balanced',
    originCity: 'Delhi',
    originCountry: 'IN',
    originHub: HUBS.find(h => h.city === 'Delhi') || HUBS[0],
    destCity: 'Los Angeles',
    destCountry: 'USA',
    destHub: HUBS.find(h => h.city === 'Los Angeles') || HUBS[1],
    deliveryDeadline: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString().split('T')[0]
  });

  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [filteredScenarios, setFilteredScenarios] = useState<Scenario[]>([]);
  const [sortBy, setSortBy] = useState<'BEST' | 'CHEAPEST' | 'FASTEST' | 'LOWEST_RISK'>('BEST');
  const [budgetRange, setBudgetRange] = useState<[number, number]>([100, 2500]);
  const [filters, setFilters] = useState({
    modes: ['AIR', 'OCEAN', 'ROAD'],
    speed: 'all',
    risk: 'HIGH'
  });

  const { signals: newsSignals, globalGeopolRisk } = useNewsData();
  const { convert, currency } = useCurrency();

  const [chaosLevel, setChaosLevel] = useState(0); // 0 to 1

  const handleSearch = (options?: { isManual?: boolean }) => {
    const cargoValueUsd = convert(params.cargoValue || 0, currency.code, 'USD');
    
    const results = RouteOptimizer.generateScenarios(
      { ...params, cargoValue: cargoValueUsd },
      params.originHub || HUBS[0],
      params.destHub || HUBS[1],
      { weather: 0.15, news: globalGeopolRisk },
      chaosLevel
    );
    setScenarios(results);
    if (options?.isManual) {
      setActiveTab('ROUTING');
    }
  };

  useEffect(() => {
    handleSearch();
  }, [globalGeopolRisk, chaosLevel]);

  useEffect(() => {
    let result = [...scenarios];
    result = result.filter(s => filters.modes.includes(s.modality));
    result = result.filter(s => s.totalCost <= budgetRange[1]);
    if (filters.speed === 'fast') result = result.filter(s => s.totalTime < 5);
    else if (filters.speed === 'mid') result = result.filter(s => s.totalTime >= 5 && s.totalTime <= 15);

    result.sort((a, b) => {
      if (sortBy === 'CHEAPEST') return a.totalCost - b.totalCost;
      if (sortBy === 'FASTEST') return a.totalTime - b.totalTime;
      if (sortBy === 'LOWEST_RISK') return a.totalRisk - b.totalRisk;
      return 0; // BEST is handled by engine isRecommended
    });

    setFilteredScenarios(result);
  }, [scenarios, filters, budgetRange, sortBy]);

  const tabs = [
    { id: 'ROUTING', label: 'Tactical Routing' },
    { id: 'OVERVIEW', label: 'Control Center' },
    { id: 'NETWORK', label: 'Global Network Map' },
    { id: 'EXPLAIN', label: 'ML Explainability' },
    { id: 'RISKS', label: 'Preemptive Risks' },
    { id: 'COST', label: 'Financial Ledger' }
  ];

  return (
    <div className="App">
      {/* GLOBAL HEADER: SEARCH */}
      <div style={{ position: 'relative', zIndex: 1000 }}>
        <TopSearchBar 
          params={params} 
          setParams={setParams} 
          onSearch={() => handleSearch({ isManual: true })} 
        />
      </div>
      
      {/* TABS NAVIGATION */}
      <div style={{ display: 'flex', background: 'var(--bg-deep)', padding: '0 40px', borderBottom: '1px solid var(--border-dim)', gap: 32 }}>
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="main-layout">
        {/* LEFT SIDEBAR: FILTERS */}
        <aside className="sidebar-panel">
          <FilterSidebar 
            budget={budgetRange} 
            setBudget={setBudgetRange} 
            filters={filters} 
            setFilters={setFilters}
            params={params}
            setParams={setParams}
            onRecalculate={() => handleSearch({ isManual: true })}
          />
        </aside>

        {/* CENTER CONTENT: RESULTS / ANALYTICS */}
        <main className="content-panel">
          {activeTab === 'ROUTING' ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Active Tactical Vectors</h2>
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setIsSortOpen(!isSortOpen)} className="dropdown-item" style={{ width: 'auto', background: 'var(--bg-surface)', border: '1px solid var(--border-bright)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    Matrix Sort: <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{sortBy}</span>
                    <ChevronDown size={14} />
                  </button>
                  {isSortOpen && (
                    <div className="dropdown-panel" style={{ width: 220, right: 0, left: 'auto' }}>
                      {['BEST', 'CHEAPEST', 'FASTEST', 'LOWEST_RISK'].map(s => (
                        <button key={s} onClick={() => { setSortBy(s as any); setIsSortOpen(false); }} className={`dropdown-item ${sortBy === s ? 'active' : ''}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {filteredScenarios.length > 0 ? (
                  filteredScenarios.map((s, idx) => (
                    <RouteCard key={s.name} scenario={s} index={idx} />
                  ))
                ) : (
                  <div className="card" style={{ textAlign: 'center', padding: '120px 40px', background: 'transparent', borderStyle: 'dashed' }}>
                     <Zap size={48} color="var(--border-bright)" style={{ marginBottom: 24 }} />
                     <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>No logistics paths available for this mission.</div>
                     <button onClick={() => setFilters({ modes: ['AIR', 'OCEAN', 'ROAD'], speed: 'all', risk: 'HIGH' })} style={{ color: 'var(--accent-primary)', background: 'none', border: 'none', marginTop: 16, cursor: 'pointer', fontWeight: 700 }}>Reset Filters</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ animation: 'fadeIn 0.3s', height: '100%' }}>
              {activeTab === 'NETWORK' && (
            <GlobalNetworkView 
              chaosLevel={chaosLevel} 
              setChaosLevel={setChaosLevel} 
            />
          )}
              {activeTab === 'EXPLAIN' && <ShapExplainabilityView scenarios={scenarios} />}
              {activeTab === 'RISKS' && <RiskAlertsView scenarios={scenarios} news={newsSignals} globalRisk={globalGeopolRisk} />}
              {activeTab === 'COST' && <CostBreakdownView scenarios={scenarios} />}
              {activeTab === 'OVERVIEW' && <OverviewView scenarios={filteredScenarios} origin={params.originCity} dest={params.destCity} />}
            </div>
          )}
        </main>

        {/* RIGHT SIDEBAR: INSIGHTS & MAP */}
        <aside className="insights-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <MapIcon size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>Live Map</h3>
            </div>
            <button onClick={() => setIsMapExpanded(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
               <Maximize2 size={16} />
            </button>
          </div>
          
          <div onClick={() => setIsMapExpanded(true)} style={{ height: 280, background: '#000', borderRadius: 12, overflow: 'hidden', position: 'relative', cursor: 'zoom-in', border: '1px solid var(--border-dim)', marginBottom: 32 }}>
             <LiveMap origin={params.originHub || HUBS[0]} destination={params.destHub || HUBS[1]} />
          </div>

          <div style={{ padding: 20, background: 'rgba(99, 102, 241, 0.05)', borderRadius: 12, border: '1px solid rgba(99, 102, 241, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <ShieldAlert size={16} color="var(--accent-primary)" />
              <div style={{ fontSize: 11, fontWeight: 900 }}>SYSTEM_INTEGRITY</div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Route stability identified. Corridor from {params.originCity} to {params.destCity} is currently observing <strong>Nominal</strong> activity.
            </p>
          </div>
        </aside>
      </div>

      {/* FULL MAP MODAL */}
      <AnimatePresence>
        {isMapExpanded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000', borderRadius: 24, overflow: 'hidden' }}>
               <button onClick={() => setIsMapExpanded(false)} style={{ position: 'absolute', top: 24, right: 24, zIndex: 10001, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', padding: 10, color: '#fff', cursor: 'pointer' }}>
                 <X size={20} />
               </button>
               <LiveMap origin={params.originHub || HUBS[0]} destination={params.destHub || HUBS[1]} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
