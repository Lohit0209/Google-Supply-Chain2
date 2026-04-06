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
import { ChevronDown, ShieldAlert, Zap, Settings2, BarChart3, Globe2 } from 'lucide-react';
import { RiskAlertsView } from './RiskAlertsView';
import { OverviewView } from './OverviewView';
import { useCurrency } from '../hooks/useCurrency';
import { GlobalNetworkView } from './GlobalNetworkView';
import { ShapExplainabilityView } from './ShapExplainabilityView';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ROUTING' | 'OVERVIEW' | 'NETWORK' | 'EXPLAIN' | 'RISKS' | 'COST'>('ROUTING');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedScenarioName, setSelectedScenarioName] = useState<string | null>(null);
  
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

  const selectedScenario = scenarios.find(s => s.name === selectedScenarioName) || scenarios.find(s => s.isRecommended) || scenarios[0];

  useEffect(() => {
    // Initial search only
    handleSearch();
  }, []);

  // Removed [globalGeopolRisk, chaosLevel] from effect to prevent mid-session reloads
  // unless manually triggered by a button that calls handleSearch.

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
    { id: 'ROUTING', label: 'Routes & Path', icon: Zap },
  ];

  const advancedTabs = [
    { id: 'NETWORK', label: 'Global Sim', icon: Globe2 },
    { id: 'OVERVIEW', label: 'Analytics', icon: BarChart3 },
    { id: 'RISKS', label: 'Risk Intel', icon: ShieldAlert },
    { id: 'EXPLAIN', label: 'AI Explain', icon: Settings2 },
  ];

  return (
    <div className="App" style={{ background: 'var(--bg-deep)' }}>
      {/* HEADER SECTION */}
      <header style={{ padding: '24px 40px', borderBottom: '1px solid var(--border-dim)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(5, 7, 10, 0.8)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 1100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, background: 'var(--accent-primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={18} color="white" />
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>Logistics<span style={{ color: 'var(--accent-primary)' }}>Terminal</span></h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{ 
              padding: '8px 16px', 
              background: showAdvanced ? 'var(--accent-primary)' : 'rgba(255,255,255,0.03)', 
              borderRadius: 8, 
              border: '1px solid var(--border-bright)', 
              fontSize: 10, 
              fontWeight: 800, 
              color: showAdvanced ? 'white' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: '0.2s'
            }}>
             {showAdvanced ? 'HIDE_ADVANCED' : 'SHOW_ADVANCED'}
          </button>
          <div style={{ width: 1, height: 24, background: 'var(--border-dim)' }} />
          <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border-dim)', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
             <span className="pulse" style={{ display: 'inline-block', width: 6, height: 6, background: 'var(--accent-emerald)', borderRadius: '50%', marginRight: 8 }} />
             NETWORK_ACTIVE
          </div>
        </div>
      </header>

      {/* TOP SEARCH BAR (GUIDED) */}
      <div style={{ padding: '40px 40px 0 40px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.04em' }}>Where is your cargo heading?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Enter your route details to generate AI-optimized logistics paths across our global network.</p>
        </div>
        
        <div style={{ position: 'relative', zIndex: 1000 }}>
          <TopSearchBar 
            params={params} 
            setParams={setParams} 
            onSearch={() => handleSearch({ isManual: true })} 
          />
        </div>
      </div>
      
      {/* TABS NAVIGATION (CENTERED) */}
      <div style={{ display: 'flex', justifyContent: 'center', background: 'var(--bg-deep)', padding: '20px 40px', gap: 12 }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: 4, borderRadius: 12, display: 'flex', gap: 4, border: '1px solid var(--border-dim)' }}>
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 24px',
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: activeTab === tab.id ? 'var(--bg-card)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                border: activeTab === tab.id ? '1px solid var(--border-bright)' : '1px solid transparent',
              }}
            >
              <tab.icon size={14} color={activeTab === tab.id ? 'var(--accent-primary)' : 'currentColor'} />
              {tab.label}
            </button>
          ))}
          
          {showAdvanced && (
            <>
              <div style={{ width: 1, height: 20, background: 'var(--border-dim)', margin: 'auto 8px' }} />
              {advancedTabs.map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 24px',
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: activeTab === tab.id ? 'var(--bg-card)' : 'transparent',
                    color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                    border: activeTab === tab.id ? '1px solid var(--border-bright)' : '1px solid transparent',
                    opacity: 0.8
                  }}
                >
                  <tab.icon size={14} color={activeTab === tab.id ? 'var(--accent-primary)' : 'currentColor'} />
                  {tab.label}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="main-layout" style={{ maxWidth: 1600, margin: '0 auto', width: '100%', gridTemplateColumns: '300px 1fr' }}>
        {/* LEFT SIDEBAR: FILTERS */}
        <aside className="sidebar-panel" style={{ background: 'transparent', borderRight: '1px solid var(--border-dim)' }}>
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
        <main className="content-panel" style={{ background: 'transparent' }}>
          {activeTab === 'ROUTING' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(450px, 600px) 1fr', gap: 32, height: '100%', alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <div>
                     <h2 style={{ fontSize: 20, fontWeight: 800 }}>Tactical Routes</h2>
                   <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{filteredScenarios.length} vectors synthesized for {params.originCity} → {params.destCity}</p>
                </div>
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setIsSortOpen(!isSortOpen)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-dim)', borderRadius: 10, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, fontWeight: 700, color: 'white', cursor: 'pointer' }}>
                    Sort by: <span style={{ color: 'var(--accent-primary)' }}>{sortBy}</span>
                    <ChevronDown size={14} />
                  </button>
                  {isSortOpen && (
                    <div className="dropdown-panel" style={{ width: 220, right: 0, left: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border-bright)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                      {['BEST', 'CHEAPEST', 'FASTEST', 'LOWEST_RISK'].map(s => (
                        <button key={s} onClick={() => { setSortBy(s as any); setIsSortOpen(false); }} style={{ width: '100%', padding: '12px 16px', background: sortBy === s ? 'rgba(99, 102, 241, 0.1)' : 'transparent', border: 'none', color: sortBy === s ? 'white' : 'var(--text-secondary)', textAlign: 'left', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
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
                    <RouteCard 
                      key={s.name} 
                      scenario={s} 
                      index={idx} 
                      onSelect={() => setSelectedScenarioName(s.name)}
                      isSelected={selectedScenarioName === s.name || (selectedScenarioName === null && s.isRecommended)}
                    />
                  ))
                ) : (
                  <div className="card" style={{ textAlign: 'center', padding: '120px 40px', background: 'rgba(255,255,255,0.01)', borderStyle: 'dashed' }}>
                     <Zap size={48} color="var(--border-bright)" style={{ marginBottom: 24 }} />
                     <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>No logistics paths available for this mission.</div>
                     <button onClick={() => setFilters({ modes: ['AIR', 'OCEAN', 'ROAD'], speed: 'all', risk: 'HIGH' })} style={{ color: 'var(--accent-primary)', background: 'none', border: 'none', marginTop: 16, cursor: 'pointer', fontWeight: 700 }}>Reset Filters</button>
                  </div>
                )}
              </div>
              </div>
              
              <div style={{ position: 'sticky', top: 0, height: 'calc(100vh - 280px)', minHeight: '600px', borderRadius: 24, overflow: 'hidden', border: '1px solid var(--border-bright)' }}>
                 <LiveMap origin={params.originHub || HUBS[0]} destination={params.destHub || HUBS[1]} selectedScenario={selectedScenario} />
              </div>
            </div>
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
              {activeTab === 'OVERVIEW' && <OverviewView scenarios={filteredScenarios} origin={params.originCity} dest={params.destCity} />}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

