import { useState, useEffect } from 'react';

export interface NewsSignal {
  headline: string;
  impactLevel: 'low' | 'medium' | 'high';
  riskScore: number; // 0-1
  source: string;
}

export const useNewsData = () => {
  const [signals, setSignals] = useState<NewsSignal[]>([]);
  const [globalGeopolRisk, setGlobalGeopolRisk] = useState(0.15); // Baseline

  useEffect(() => {
    // Simulated "Live" news feed that pulses with real-world events 
    // In a prod environment, this would call NewsData.io or GNews
    const MOCK_SIGNALS: NewsSignal[] = [
      { headline: 'Port of Shanghai reports 15% increase in container dwell time.', impactLevel: 'medium', riskScore: 0.4, source: 'Logistics Net' },
      { headline: 'Suez Canal maintenance scheduled for October; minor delays expected.', impactLevel: 'low', riskScore: 0.2, source: 'Maritime Daily' },
      { headline: 'New trade tariffs proposed between EU and China.', impactLevel: 'high', riskScore: 0.7, source: 'Global Trade' }
    ];

    setSignals(MOCK_SIGNALS);

    // Dynamic jitter for geopolitical risk simulation
    const interval = setInterval(() => {
      setGlobalGeopolRisk(prev => Math.max(0.1, Math.min(0.9, prev + (Math.random() - 0.5) * 0.1)));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return { signals, globalGeopolRisk };
};
