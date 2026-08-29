import React, { useEffect, useMemo, useState } from 'react';
import { awardWelxPoints as awardAccountPoints, getWelxPoints } from '../utils/welxPoints';
import {
  Play,
  BarChart,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Trophy,
  Award,
  Medal,
  Star,
  Crown,
  Target,
  Sparkles,
  BookOpen,
  ChevronRight,
  Activity,
  ScrollText,
  X,
  Wallet,
  Coins,
  TimerReset
} from 'lucide-react';

const STARTING_DUMMY_MONEY = 200000;
const REFILL_WAIT_MS = 24 * 60 * 60 * 1000;
const PASSING_SCORE = 70;

export default function SimulationLab({ user }) {
  const [selectedScenario, setSelectedScenario] = useState('business');
  const [simulationActive, setSimulationActive] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [results, setResults] = useState(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [newBadge, setNewBadge] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
const [instructionsClosing, setInstructionsClosing] = useState(false);

useEffect(() => {
  const introTimer = setTimeout(() => {
    setShowInstructions(true);
    setInstructionsClosing(false);
  }, 500);

  return () => clearTimeout(introTimer);
}, []);

const openInstructions = () => {
  setInstructionsClosing(false);
  setShowInstructions(true);
};

const closeInstructions = () => {
  setInstructionsClosing(true);

  setTimeout(() => {
    setShowInstructions(false);
    setInstructionsClosing(false);
  }, 260);
};

  const [walletNotice, setWalletNotice] = useState('');
  const [moneyOutcome, setMoneyOutcome] = useState(null);
  const [wallet, setWallet] = useState({
    balance: STARTING_DUMMY_MONEY,
    exhaustedAt: null
  });
  const [decisions, setDecisions] = useState({
    marketing: 50,
    research: 30,
    production: 40,
    pricing: 100
  });

  const scenarios = [
    {
      id: 'business',
      title: 'Business Strategy',
      description: 'Make strategic decisions to grow your company',
      icon: '🏢',
      metrics: ['Revenue', 'Market Share', 'Customer Satisfaction', 'Profit Margin']
    },
    {
      id: 'finance',
      title: 'Investment Portfolio',
      description: 'Manage investments and optimize returns',
      icon: '💰',
      metrics: ['ROI', 'Risk Level', 'Diversification', 'Liquidity']
    },
    {
      id: 'marketing',
      title: 'Marketing Campaign',
      description: 'Launch and optimize marketing campaigns',
      icon: '📊',
      metrics: ['Reach', 'Engagement', 'Conversion', 'Cost per Acquisition']
    },
    {
      id: 'operations',
      title: 'Supply Chain',
      description: 'Optimize supply chain operations',
      icon: '🚚',
      metrics: ['Efficiency', 'Cost', 'Quality', 'Delivery Time']
    }
  ];

  const badges = [
    { name: 'Bronze Explorer', points: 100, icon: Award, color: 'text-amber-200 bg-amber-400/15 border-amber-300/30' },
    { name: 'Silver Strategist', points: 500, icon: Medal, color: 'text-slate-100 bg-slate-300/15 border-slate-200/30' },
    { name: 'Gold Master', points: 1000, icon: Trophy, color: 'text-yellow-200 bg-yellow-400/15 border-yellow-300/30' },
    { name: 'Platinum Legend', points: 2000, icon: Crown, color: 'text-pink-200 bg-pink-400/15 border-pink-300/30' },
    { name: 'Diamond Elite', points: 5000, icon: Star, color: 'text-cyan-200 bg-cyan-400/15 border-cyan-300/30' }
  ];

  const currentScenario = scenarios.find((scenario) => scenario.id === selectedScenario);
  const walletKey = `welx_sim_wallet_${user?.id || 'guest'}`;
  const [userPoints, setUserPoints] = useState(Number(user?.welxPoints || 0));

  const investmentAmount = useMemo(() => {
    return (decisions.marketing + decisions.research + decisions.production) * 1000;
  }, [decisions]);

  const refillInfo = useMemo(() => {
    if (!wallet.exhaustedAt) return null;

    const remaining = REFILL_WAIT_MS - (Date.now() - wallet.exhaustedAt);
    if (remaining <= 0) return null;

    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.ceil((remaining % (60 * 60 * 1000)) / (60 * 1000));

    return { hours, minutes };
  }, [wallet.exhaustedAt]);

  useEffect(() => { if (user) getWelxPoints().then((data) => setUserPoints(data.points)).catch(() => {}); }, [user]);

  useEffect(() => {
    const loadedWallet = loadWallet(walletKey);
    setWallet(loadedWallet);
  }, [walletKey]);

  const loadWallet = (key) => {
    const stored = JSON.parse(localStorage.getItem(key) || 'null');

    if (!stored) {
      const freshWallet = { balance: STARTING_DUMMY_MONEY, exhaustedAt: null };
      localStorage.setItem(key, JSON.stringify(freshWallet));
      return freshWallet;
    }

    if (stored.exhaustedAt && Date.now() - stored.exhaustedAt >= REFILL_WAIT_MS) {
      const refilledWallet = { balance: STARTING_DUMMY_MONEY, exhaustedAt: null };
      localStorage.setItem(key, JSON.stringify(refilledWallet));
      return refilledWallet;
    }

    return stored;
  };

  const saveWallet = (nextWallet) => {
    localStorage.setItem(walletKey, JSON.stringify(nextWallet));
    setWallet(nextWallet);
  };

  const startSimulation = () => {
    setWalletNotice('');
    setMoneyOutcome(null);

    const latestWallet = loadWallet(walletKey);
    setWallet(latestWallet);

    if (latestWallet.balance <= 0) {
      setWalletNotice('Your dummy capital is exhausted. Please wait 24 hours for a refill back to $200,000.');
      return;
    }

    if (investmentAmount > latestWallet.balance) {
      setWalletNotice(`Your selected investment is $${investmentAmount.toLocaleString()}, but you only have $${latestWallet.balance.toLocaleString()} available.`);
      return;
    }

    setSimulationActive(true);
    setSimulationComplete(false);
    setPointsEarned(0);
    setNewBadge(null);

    setTimeout(async () => {
      const simulationResults = calculateResults();
      const outcome = calculateMoneyOutcome(simulationResults.overallScore, investmentAmount);

      setResults(simulationResults);
      setMoneyOutcome(outcome);

      const nextBalance =
        outcome.type === 'profit'
          ? latestWallet.balance + outcome.amount
          : Math.max(0, latestWallet.balance - outcome.amount);

      const nextWallet = {
        balance: nextBalance,
        exhaustedAt: nextBalance <= 0 ? Date.now() : null
      };

      saveWallet(nextWallet);

      if (simulationResults.overallScore >= PASSING_SCORE) {
        await awardSimulationPoints(simulationResults);
      } else {
        setPointsEarned(0);
      }

      if (nextBalance <= 0) {
        setWalletNotice('Your dummy capital is exhausted. A 24 hour refill timer has started.');
      }

      setSimulationActive(false);
      setSimulationComplete(true);
    }, 3000);
  };

  const awardSimulationPoints = async (simulationResults) => {
    if (!user) return;
    const currentPoints = userPoints;
    const result = await awardAccountPoints('simulation_completed', `simulation:${selectedScenario}:${Date.now()}`, { score: simulationResults.overallScore, scenario: selectedScenario });
    const newTotalPoints = result.points;
    setPointsEarned(result.awarded);
    setUserPoints(newTotalPoints);
    const currentBadge = badges.slice().reverse().find((badge) => currentPoints >= badge.points);
    const nextBadge = badges.slice().reverse().find((badge) => newTotalPoints >= badge.points);

    if (nextBadge && (!currentBadge || nextBadge.points > currentBadge.points)) {
      setNewBadge(nextBadge);
    }
  };

  const calculateMoneyOutcome = (overallScore, investment) => {
    if (overallScore >= PASSING_SCORE) {
      const profitRate = 0.08 + ((overallScore - PASSING_SCORE) / 30) * 0.32;

      return {
        type: 'profit',
        amount: Math.round(investment * profitRate),
        rate: profitRate
      };
    }

    const lossRate = 0.18 + ((PASSING_SCORE - overallScore) / PASSING_SCORE) * 0.42;

    return {
      type: 'loss',
      amount: Math.round(investment * lossRate),
      rate: lossRate
    };
  };

  const calculateResults = () => {
    const { marketing, research, production, pricing } = decisions;

    const optimal = {
      marketing: { min: 40, max: 70, ideal: 55 },
      research: { min: 25, max: 50, ideal: 35 },
      production: { min: 60, max: 85, ideal: 75 },
      pricing: { min: 80, max: 120, ideal: 100 }
    };

    const marketingScore = calculateScore(marketing, optimal.marketing);
    const researchScore = calculateScore(research, optimal.research);
    const productionScore = calculateScore(production, optimal.production);
    const pricingScore = calculateScore(pricing, optimal.pricing);
    const overallScore = Math.round((marketingScore + researchScore + productionScore + pricingScore) / 4);
    const baseRevenue = 100000;
    const finalRevenue = Math.round(baseRevenue * (overallScore / 100));
    const marketShare = Math.round(overallScore * 0.6);

    const quarterlyData = [
      { quarter: 'Q1', revenue: Math.round(finalRevenue * 0.7), target: Math.round(baseRevenue * 0.8) },
      { quarter: 'Q2', revenue: Math.round(finalRevenue * 0.85), target: Math.round(baseRevenue * 0.9) },
      { quarter: 'Q3', revenue: Math.round(finalRevenue * 0.95), target: baseRevenue },
      { quarter: 'Q4', revenue: finalRevenue, target: Math.round(baseRevenue * 1.1) }
    ];

    return {
      overallScore,
      finalRevenue,
      marketShare,
      quarterlyData,
      decisions: {
        marketing: { value: marketing, score: marketingScore, optimal: optimal.marketing },
        research: { value: research, score: researchScore, optimal: optimal.research },
        production: { value: production, score: productionScore, optimal: optimal.production },
        pricing: { value: pricing, score: pricingScore, optimal: optimal.pricing }
      }
    };
  };

  const calculateScore = (value, optimal) => {
    if (value >= optimal.min && value <= optimal.max) {
      const distance = Math.abs(value - optimal.ideal);
      const maxDistance = Math.max(optimal.ideal - optimal.min, optimal.max - optimal.ideal);
      return Math.round(100 - (distance / maxDistance) * 30);
    }

    return Math.max(0, 50 - Math.abs(value - optimal.ideal));
  };

  const getDecisionFeedback = (key, decisionData) => {
    const { score, optimal } = decisionData;

    if (score >= 90) {
      return {
        icon: CheckCircle,
        color: 'text-emerald-300',
        message: 'Excellent decision! This is in the optimal range.'
      };
    }

    if (score >= 70) {
      return {
        icon: ThumbsUp,
        color: 'text-sky-300',
        message: 'Good choice! Close to optimal.'
      };
    }

    if (score >= 50) {
      return {
        icon: AlertTriangle,
        color: 'text-amber-300',
        message: `Consider adjusting to ${optimal.min}-${optimal.max} range.`
      };
    }

    return {
      icon: ThumbsDown,
      color: 'text-rose-300',
      message: `Poor decision. Optimal range is ${optimal.min}-${optimal.max}.`
    };
  };

  const handleDecisionChange = (key, value) => {
    setDecisions((prev) => ({ ...prev, [key]: Number(value) }));
  };

  const decisionControls = [
    { key: 'marketing', label: 'Marketing Budget', prefix: '$', unit: 'k', min: 0, max: 100 },
    { key: 'research', label: 'R&D Investment', prefix: '$', unit: 'k', min: 0, max: 100 },
    { key: 'production', label: 'Production Capacity', prefix: '', unit: '%', min: 0, max: 100 },
    { key: 'pricing', label: 'Product Price', prefix: '$', unit: '', min: 50, max: 200 }
  ];

  const learningResources = [
    { title: 'Strategic Decision Making', type: 'Course', duration: '3 hours' },
    { title: 'Business Analytics', type: 'Course', duration: '5 hours' },
    { title: 'Financial Modeling', type: 'Workshop', duration: '2 hours' },
    { title: 'Market Research Methods', type: 'Article', duration: '15 min' }
  ];

  const leaderboard = [
    { name: 'Alex Chen', points: 2450, avatar: '👨‍💼', rank: 1 },
    { name: 'Sarah Wilson', points: 1875, avatar: '👩‍💻', rank: 2 },
    { name: 'Mike Johnson', points: 1650, avatar: '👨‍🎓', rank: 3 }
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-[#24105f] via-[#29208d] to-[#092a78] px-4 py-8 text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-20 top-16 h-64 w-64 animate-pulse rounded-full bg-pink-400/25 blur-3xl" />
        <div className="absolute right-0 top-28 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-purple-400/25 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:42px_42px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-pink-200/25 bg-white/10 px-4 py-2 text-sm font-semibold text-pink-100 shadow-lg shadow-pink-950/20 backdrop-blur">
              <Sparkles size={16} />
              Wel.X strategy game mode
            </div>

            <h1 className="bg-gradient-to-r from-pink-300 via-fuchsia-200 to-cyan-200 bg-clip-text text-5xl font-black tracking-tight text-transparent lg:text-6xl">
              Simulation Lab
            </h1>

            <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-200">
              Use capital, test business decisions, earn profit, collect Wel.X points, and unlock badges.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            
            <button
  onClick={openInstructions}
  className="group relative inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-200/60 bg-gradient-to-br from-yellow-300 via-pink-400 to-fuchsia-500 text-white shadow-xl shadow-pink-950/40 transition hover:-translate-y-1 hover:scale-105 hover:brightness-110"
  title="Simulation instructions"
>
  <span className="absolute -right-1 -top-1 h-4 w-4 animate-ping rounded-full bg-yellow-200 opacity-75" />
  <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-yellow-200" />
  <ScrollText className="animate-[scrollFlip_2.4s_ease-in-out_infinite]" size={25} />
</button>

            <TopStat
              icon={Wallet}
              label="Capital"
              value={`$${wallet.balance.toLocaleString()}`}
              tone="text-pink-100"
            />

            <TopStat
              icon={Coins}
              label="Wel.X Points"
              value={userPoints.toLocaleString()}
              tone="text-cyan-100"
            />
          </div>
        </header>

        {walletNotice && (
          <div className="mb-6 rounded-3xl border border-amber-200/30 bg-amber-300/15 p-4 text-amber-50 shadow-xl shadow-amber-950/20 backdrop-blur">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 shrink-0" size={20} />
              <div>
                <p className="font-semibold">{walletNotice}</p>
                {refillInfo && (
                  <p className="mt-1 text-sm text-amber-100">
                    Refill available in about {refillInfo.hours}h {refillInfo.minutes}m.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-4">
          <aside className="rounded-[28px] border border-white/15 bg-white/10 p-5 shadow-2xl shadow-purple-950/30 backdrop-blur-xl">
            <h3 className="mb-4 text-lg font-bold text-pink-100">Scenarios</h3>

            <div className="space-y-3">
              {scenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => setSelectedScenario(scenario.id)}
                  className={`group w-full rounded-3xl border p-4 text-left transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    selectedScenario === scenario.id
                      ? 'border-pink-200/50 bg-gradient-to-r from-pink-500/35 to-blue-500/25 shadow-pink-950/30'
                      : 'border-white/10 bg-white/8 hover:border-pink-200/35 hover:bg-white/12'
                  }`}
                >
                  <div className="mb-2 flex items-center gap-3">
                    <span className="text-3xl">{scenario.icon}</span>
                    <span className="font-bold">{scenario.title}</span>
                  </div>
                  <p className="text-sm leading-5 text-slate-200">{scenario.description}</p>
                </button>
              ))}
            </div>
          </aside>

          <main className="space-y-6 lg:col-span-3">
            <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 shadow-2xl shadow-purple-950/30 backdrop-blur-xl">
              <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="flex items-center gap-3 text-3xl font-black">
                    <span className="text-4xl">{currentScenario.icon}</span>
                    {currentScenario.title}
                  </h2>
                  <p className="mt-2 text-slate-200">{currentScenario.description}</p>
                </div>

                <button
                  onClick={startSimulation}
                  disabled={simulationActive || wallet.balance <= 0}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-bold text-white shadow-lg transition ${
                    simulationActive || wallet.balance <= 0
                      ? 'cursor-not-allowed bg-slate-700/70 text-slate-300'
                      : 'bg-gradient-to-r from-pink-500 via-fuchsia-500 to-blue-500 shadow-pink-950/40 hover:-translate-y-1 hover:brightness-110'
                  }`}
                >
                  <Play size={18} />
                  {simulationActive ? 'Running...' : 'Start Simulation'}
                </button>
              </div>

              <div className="mb-5 rounded-3xl border border-pink-200/20 bg-black/15 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-slate-300">Selected Capital at Risk</p>
                    <p className="text-3xl font-black text-pink-100">${investmentAmount.toLocaleString()}</p>
                  </div>

                  <div className="text-sm text-slate-200">
                    Pricing affects score. Marketing, R&D, and production affect capital risk.
                  </div>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {decisionControls.map(({ key, label, unit, prefix, min, max }) => (
                  <div key={key} className="rounded-3xl border border-white/10 bg-black/15 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <label className="text-sm font-semibold text-slate-100">{label}</label>
                      <span className="rounded-full bg-white/12 px-3 py-1 text-sm font-bold text-pink-100">
                        {prefix}
                        {decisions[key]}
                        {unit}
                      </span>
                    </div>

                    <input
                      type="range"
                      min={min}
                      max={max}
                      value={decisions[key]}
                      onChange={(event) => handleDecisionChange(key, event.target.value)}
                      className="w-full accent-pink-400"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                {currentScenario.metrics.map((metric, index) => {
                  const metricValue = Math.min(98, Math.max(18, decisions[decisionControls[index]?.key] || 50));

                  return (
                    <div key={metric} className="rounded-3xl border border-white/10 bg-white/10 p-4 text-center">
                      <div className="mb-1 text-2xl font-black text-cyan-200">{metricValue}%</div>
                      <div className="text-sm text-slate-200">{metric}</div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 shadow-2xl shadow-purple-950/30 backdrop-blur-xl">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
                <BarChart size={22} />
                Simulation Results
              </h3>

              <div className="rounded-3xl border border-white/10 bg-black/15 p-6">
                {simulationActive ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto mb-5 h-14 w-14 animate-spin rounded-full border-4 border-pink-200/30 border-t-pink-300" />
                    <p className="font-semibold text-slate-200">Running simulation...</p>
                  </div>
                ) : simulationComplete && results ? (
                  <div className="space-y-6">
                    <OverallScore results={results} moneyOutcome={moneyOutcome} />

                    <div className="grid gap-4 md:grid-cols-3">
                      <MetricCard label="Final Revenue" value={`$${results.finalRevenue.toLocaleString()}`} color="text-emerald-200" />
                      <MetricCard label="Market Share" value={`${results.marketShare}%`} color="text-cyan-200" />
                      <MetricCard label="Grade" value={results.overallScore >= 80 ? 'A' : results.overallScore >= 60 ? 'B' : 'C'} color="text-pink-200" />
                    </div>

                    <QuarterlyChart data={results.quarterlyData} />
                    <DecisionAnalysis results={results} getDecisionFeedback={getDecisionFeedback} />
                    <Recommendations results={results} />
                    <PointsPanel pointsEarned={pointsEarned} newBadge={newBadge} moneyOutcome={moneyOutcome} />
                    <Leaderboard user={user} userPoints={userPoints} leaderboard={leaderboard} />
                    <BadgeProgress badges={badges} userPoints={userPoints} newBadge={newBadge} />
                  </div>
                ) : (
                  <div className="py-14 text-center text-slate-300">
                    <TrendingUp className="mx-auto mb-4 h-16 w-16 text-pink-200/70" />
                    <p>Run a simulation to see your results here.</p>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 shadow-2xl shadow-purple-950/30 backdrop-blur-xl">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
                <BookOpen size={21} />
                Related Learning Resources
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                {learningResources.map((resource) => (
                  <div
                    key={resource.title}
                    className="flex items-center justify-between rounded-3xl border border-white/10 bg-black/15 p-4 transition hover:-translate-y-1 hover:border-pink-200/35 hover:bg-white/10"
                  >
                    <div>
                      <h4 className="font-bold">{resource.title}</h4>
                      <p className="text-sm text-slate-300">
                        {resource.type} • {resource.duration}
                      </p>
                    </div>

                    <button className="inline-flex items-center gap-1 text-sm font-bold text-pink-200 hover:text-white">
                      View
                      <ChevronRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>

            {showInstructions && (
        <InstructionsModal
          closing={instructionsClosing}
          onClose={closeInstructions}
        />
      )}

      <style>{`
        @keyframes scrollFlip {
          0%, 100% {
            transform: rotateY(0deg) rotate(-2deg);
          }
          50% {
            transform: rotateY(180deg) rotate(4deg);
          }
        }

        @keyframes scrollCardIn {
          0% {
            opacity: 0;
            transform: translateY(28px) scale(0.92) rotateX(14deg);
          }
          70% {
            opacity: 1;
            transform: translateY(-4px) scale(1.02) rotateX(0deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotateX(0deg);
          }
        }

        @keyframes scrollCardOut {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(22px) scale(0.94);
          }
        }
      `}</style>
    </div>
  );
}

function TopStat({ icon: Icon, label, value, tone }) {
  return (
    <div className="min-w-[160px] rounded-2xl border border-white/15 bg-white/10 px-5 py-3 shadow-xl shadow-purple-950/20 backdrop-blur">
      <div className="mb-1 flex items-center gap-2 text-sm text-slate-200">
        <Icon size={16} />
        {label}
      </div>
      <div className={`text-2xl font-black ${tone}`}>{value}</div>
    </div>
  );
}

function OverallScore({ results, moneyOutcome }) {
  const scoreColor =
    results.overallScore >= 80 ? '#86efac' : results.overallScore >= 60 ? '#fde68a' : '#fda4af';

  return (
    <div className="text-center">
      <div className="mb-2 text-6xl font-black" style={{ color: scoreColor }}>
        {results.overallScore}%
      </div>
      <p className="text-slate-200">Overall Performance Score</p>

      {moneyOutcome && (
        <div
          className={`mx-auto mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 font-bold ${
            moneyOutcome.type === 'profit'
              ? 'border-emerald-200/30 bg-emerald-400/15 text-emerald-100'
              : 'border-rose-200/30 bg-rose-400/15 text-rose-100'
          }`}
        >
          {moneyOutcome.type === 'profit' ? 'Profit Added' : 'Capital Lost'}:
          ${moneyOutcome.amount.toLocaleString()}
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, color }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 text-center">
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      <div className="mt-1 text-sm text-slate-200">{label}</div>
    </div>
  );
}

function QuarterlyChart({ data }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
      <h4 className="mb-5 flex items-center gap-2 font-bold">
        <Activity size={18} />
        Quarterly Performance
      </h4>

      <div className="flex h-44 items-end justify-between gap-3">
        {data.map((quarter) => (
          <div key={quarter.quarter} className="flex flex-1 flex-col items-center">
            <div className="relative flex h-32 w-full max-w-[58px] items-end justify-center">
              <div
                className="absolute bottom-0 w-8 rounded-t-xl bg-white/25"
                style={{ height: `${(quarter.target / 120000) * 120}px` }}
              />
              <div
                className="relative w-8 rounded-t-xl bg-gradient-to-t from-pink-500 to-cyan-300 shadow-lg shadow-pink-950/40 transition-all duration-700"
                style={{ height: `${(quarter.revenue / 120000) * 120}px` }}
              />
            </div>

            <div className="mt-3 text-center text-xs">
              <div className="font-bold text-white">{quarter.quarter}</div>
              <div className="text-slate-300">${(quarter.revenue / 1000).toFixed(0)}k</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-5 text-xs text-slate-200">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-pink-400" />
          Actual
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-white/30" />
          Target
        </div>
      </div>
    </div>
  );
}

function DecisionAnalysis({ results, getDecisionFeedback }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
      <h4 className="mb-4 font-bold">Decision Analysis</h4>

      <div className="space-y-4">
        {Object.entries(results.decisions).map(([key, data]) => {
          const feedback = getDecisionFeedback(key, data);
          const IconComponent = feedback.icon;

          return (
            <div key={key} className="rounded-3xl border border-white/10 bg-black/15 p-4">
              <div className="flex items-start gap-3">
                <IconComponent className={`${feedback.color} mt-0.5`} size={21} />

                <div className="flex-1">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className="font-bold capitalize">{key}</span>
                    <span className="text-sm text-slate-200">
                      {key === 'pricing' ? '$' : ''}
                      {data.value}
                      {key === 'pricing' ? '' : key === 'production' ? '%' : 'k'}
                    </span>
                  </div>

                  <p className="text-sm text-slate-300">{feedback.message}</p>

                  <div className="mt-3 h-2 rounded-full bg-black/25">
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{
                        width: `${data.score}%`,
                        backgroundColor: data.score >= 80 ? '#86efac' : data.score >= 60 ? '#fde68a' : '#fda4af'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Recommendations({ results }) {
  const weakDecisions = Object.entries(results.decisions).filter(([, data]) => data.score < 80);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
      <h4 className="mb-4 font-bold">Recommendations for Next Simulation</h4>

      <ul className="space-y-3">
        {weakDecisions.map(([key, data]) => (
          <li key={key} className="flex items-start gap-3 text-sm text-slate-200">
            <span className="mt-2 h-2 w-2 rounded-full bg-pink-300" />
            <span>
              Adjust <span className="font-bold text-white">{key}</span> to {data.optimal.min}-{data.optimal.max} range for better results.
            </span>
          </li>
        ))}

        {weakDecisions.length === 0 && (
          <li className="flex items-start gap-3 text-sm text-slate-200">
            <CheckCircle className="mt-0.5 text-emerald-300" size={17} />
            <span>Excellent performance! Try a more challenging scenario.</span>
          </li>
        )}
      </ul>
    </div>
  );
}

function PointsPanel({ pointsEarned, newBadge, moneyOutcome }) {
  return (
    <div className="rounded-3xl border border-pink-200/25 bg-gradient-to-r from-pink-500/20 via-fuchsia-500/20 to-blue-500/20 p-6">
      <div className="text-center">
        <div className="mb-2 text-3xl font-black text-pink-100">+{pointsEarned} Wel.X Points</div>
        <p className="text-slate-200">
          {moneyOutcome?.type === 'profit'
            ? 'Strong strategy. Profit and Wel.X points have been added.'
            : 'No Wel.X points were deducted. Only capital was affected.'}
        </p>
      </div>

      {newBadge && (
        <div className="mt-5 rounded-3xl border border-yellow-200/30 bg-white/10 p-4 text-center">
          <div className="mb-2 text-2xl">🎉</div>
          <div className="mb-2 text-lg font-black text-yellow-100">New Badge Unlocked!</div>
          <div className={`inline-flex items-center rounded-full border px-4 py-2 font-bold ${newBadge.color}`}>
            {React.createElement(newBadge.icon, { size: 20, className: 'mr-2' })}
            {newBadge.name}
          </div>
        </div>
      )}
    </div>
  );
}

function Leaderboard({ user, userPoints, leaderboard }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
      <h4 className="mb-4 flex items-center gap-2 font-bold">
        <Trophy className="text-yellow-200" size={20} />
        Current Leaderboard
      </h4>

      <div className="mb-4 rounded-3xl border border-cyan-200/25 bg-cyan-300/10 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-blue-500 font-black text-white">
              {Math.floor(Math.random() * 10) + 1}
            </div>

            <div>
              <div className="font-bold text-cyan-100">You</div>
              <div className="text-sm text-slate-200">{user?.name || 'Anonymous'}</div>
            </div>
          </div>

          <div className="text-right">
            <div className="font-black text-cyan-100">{userPoints.toLocaleString()}</div>
            <div className="text-sm text-slate-200">Wel.X Points</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {leaderboard.map((player) => (
          <div key={player.rank} className="flex items-center justify-between rounded-3xl border border-white/10 bg-black/15 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-sm">
                {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : '🥉'}
              </div>
              <span className="text-lg">{player.avatar}</span>
              <span className="font-bold">{player.name}</span>
            </div>

            <div className="font-black text-slate-100">{player.points.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BadgeProgress({ badges, userPoints, newBadge }) {
  const nextBadge = badges.find((badge) => userPoints < badge.points);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
      <h4 className="mb-4 flex items-center gap-2 font-bold">
        <Target className="text-pink-200" size={20} />
        Badge Progress
      </h4>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {badges.map((badge) => {
          const isEarned = userPoints >= badge.points;
          const IconComponent = badge.icon;

          return (
            <div
              key={badge.name}
              className={`rounded-3xl border p-3 text-center transition ${
                isEarned ? badge.color : 'border-white/10 bg-black/15 text-slate-400'
              }`}
            >
              <IconComponent className="mx-auto mb-1 h-6 w-6" />
              <div className="text-xs font-bold">{badge.name.split(' ')[0]}</div>
              <div className="text-xs opacity-75">{badge.points}</div>

              {isEarned && newBadge?.name === badge.name && (
                <div className="mt-1 animate-pulse text-xs font-black text-emerald-200">NEW!</div>
              )}
            </div>
          );
        })}
      </div>

      {nextBadge && (
        <div className="rounded-3xl border border-white/10 bg-black/15 p-4">
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span className="font-bold">Next: {nextBadge.name}</span>
            <span className="text-slate-200">
              {userPoints}/{nextBadge.points}
            </span>
          </div>

          <div className="h-2 rounded-full bg-black/25">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-pink-400 to-cyan-300 transition-all duration-700"
              style={{ width: `${Math.min((userPoints / nextBadge.points) * 100, 100)}%` }}
            />
          </div>

          <div className="mt-2 text-xs text-slate-300">{nextBadge.points - userPoints} points to go</div>
        </div>
      )}
    </div>
  );
}

function InstructionsModal({ onClose, closing }) {
  return (
    <div
      className={`fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-slate-950/70 px-3 py-3 backdrop-blur transition-opacity duration-300 sm:p-4 ${
        closing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div
        className={`max-h-[calc(100vh-24px)] w-full max-w-lg overflow-y-auto rounded-[22px] border border-pink-200/25 bg-gradient-to-br from-[#24105f] via-[#29208d] to-[#092a78] p-4 text-white shadow-2xl shadow-pink-950/40 sm:p-5 ${
          closing
            ? 'animate-[scrollCardOut_260ms_ease-in_forwards]'
            : 'animate-[scrollCardIn_420ms_cubic-bezier(.2,.9,.2,1)_forwards]'
        }`}
      >
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-xs text-pink-100">
              <ScrollText size={15} />
              Game instructions
            </div>
            <h3 className="text-xl font-black text-pink-100 sm:text-2xl">How Simulation Lab Works</h3>
          </div>

          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-2 text-xs leading-5 text-slate-100 sm:grid-cols-2">
          <Instruction icon={Wallet} text="Each new user starts with $200,000 in dummy capital." />
          <Instruction icon={Coins} text="Marketing, R&D, and production sliders decide how much capital is at risk." />
          <Instruction icon={BarChart} text="Pricing affects your strategy score, but it does not directly spend dummy capital." />
          <Instruction icon={CheckCircle} text="Good decisions can generate profit and award normal Wel.X points." />
          <Instruction icon={AlertTriangle} text="Poor decisions can lose dummy money, but Wel.X points are not deducted." />
          <Instruction icon={TimerReset} text="If your dummy money reaches $0, you must wait 24 hours for it to refill back to $200,000." />
          <Instruction icon={Trophy} text="Badge progress works the same way as before and is based on Wel.X points." />
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-blue-500 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-pink-950/30 transition hover:-translate-y-0.5 hover:brightness-110"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

function Instruction({ icon: Icon, text }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/10 p-2.5">
      <Icon className="mt-0.5 shrink-0 text-pink-200" size={16} />
      <p>{text}</p>
    </div>
  );
}
