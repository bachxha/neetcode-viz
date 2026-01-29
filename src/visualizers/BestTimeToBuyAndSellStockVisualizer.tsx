import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'buy' | 'sell' | 'update-profit' | 'done';
  prices: number[];
  day: number;
  buyDay: number;
  buyPrice: number;
  currentPrice: number;
  maxProfit: number;
  bestBuyDay: number;
  bestSellDay: number;
  description: string;
}

function generateSteps(prices: number[]): Step[] {
  const steps: Step[] = [];
  
  if (prices.length === 0) {
    steps.push({
      type: 'done',
      prices: [],
      day: 0,
      buyDay: 0,
      buyPrice: 0,
      currentPrice: 0,
      maxProfit: 0,
      bestBuyDay: 0,
      bestSellDay: 0,
      description: 'Empty prices array - no profit possible',
    });
    return steps;
  }
  
  steps.push({
    type: 'start',
    prices,
    day: 0,
    buyDay: 0,
    buyPrice: prices[0],
    currentPrice: prices[0],
    maxProfit: 0,
    bestBuyDay: 0,
    bestSellDay: 0,
    description: 'Start with first day as potential buy day. Track minimum price seen so far.',
  });
  
  let minPrice = prices[0];
  let minDay = 0;
  let maxProfit = 0;
  let bestBuyDay = 0;
  let bestSellDay = 0;
  
  for (let i = 1; i < prices.length; i++) {
    const currentPrice = prices[i];
    
    // Check if we found a new minimum price (better buy day)
    if (currentPrice < minPrice) {
      minPrice = currentPrice;
      minDay = i;
      
      steps.push({
        type: 'buy',
        prices,
        day: i,
        buyDay: minDay,
        buyPrice: minPrice,
        currentPrice,
        maxProfit,
        bestBuyDay,
        bestSellDay,
        description: `New minimum price found! Day ${i}: $${currentPrice}. This is our new best buy day.`,
      });
    } else {
      // Check if selling today would give us a better profit
      const profit = currentPrice - minPrice;
      
      steps.push({
        type: 'sell',
        prices,
        day: i,
        buyDay: minDay,
        buyPrice: minPrice,
        currentPrice,
        maxProfit,
        bestBuyDay,
        bestSellDay,
        description: `Day ${i}: $${currentPrice}. If we buy at $${minPrice} (day ${minDay}) and sell today, profit = $${profit}.`,
      });
      
      if (profit > maxProfit) {
        maxProfit = profit;
        bestBuyDay = minDay;
        bestSellDay = i;
        
        steps.push({
          type: 'update-profit',
          prices,
          day: i,
          buyDay: minDay,
          buyPrice: minPrice,
          currentPrice,
          maxProfit,
          bestBuyDay,
          bestSellDay,
          description: `New best profit! Buy on day ${bestBuyDay} ($${prices[bestBuyDay]}) and sell on day ${bestSellDay} ($${currentPrice}) for profit of $${maxProfit}.`,
        });
      }
    }
  }
  
  steps.push({
    type: 'done',
    prices,
    day: prices.length - 1,
    buyDay: minDay,
    buyPrice: minPrice,
    currentPrice: prices[prices.length - 1],
    maxProfit,
    bestBuyDay,
    bestSellDay,
    description: `Final result: Maximum profit is $${maxProfit} by buying on day ${bestBuyDay} and selling on day ${bestSellDay}.`,
  });
  
  return steps;
}

export function BestTimeToBuyAndSellStockVisualizer() {
  const [inputStr, setInputStr] = useState('[7,1,5,3,6,4]');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    try {
      const prices = JSON.parse(inputStr.trim());
      if (Array.isArray(prices) && prices.every(p => typeof p === 'number') && prices.length <= 20) {
        const newSteps = generateSteps(prices);
        setSteps(newSteps);
        setCurrentStep(0);
        setIsPlaying(false);
      }
    } catch (e) {
      // Invalid input, keep existing steps
    }
  }, [inputStr]);
  
  useEffect(() => {
    initializeSteps();
  }, []);
  
  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      if (currentStep >= steps.length - 1) setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 1200 / speed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);
  
  const currentStepData = steps[currentStep];
  
  if (!currentStepData) return <div>Loading...</div>;
  
  const maxPrice = Math.max(...(currentStepData.prices.length > 0 ? currentStepData.prices : [1]));
  const minChartPrice = Math.min(...(currentStepData.prices.length > 0 ? currentStepData.prices : [0]));
  const chartHeight = 200;
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Best Time to Buy and Sell Stock</h1>
        <p className="text-slate-400">
          Use sliding window technique to track the minimum buy price seen so far while 
          scanning for the maximum profit. Buy low, sell high!
        </p>
      </div>
      
      <div className="mb-6 flex gap-4 items-center">
        <label className="text-sm text-slate-400">Stock prices array:</label>
        <input
          type="text"
          value={inputStr}
          onChange={(e) => setInputStr(e.target.value)}
          onBlur={initializeSteps}
          onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
          className="flex-1 px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono"
          placeholder="[7,1,5,3,6,4]"
        />
      </div>
      
      {/* Price chart visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Stock Price Chart</h3>
        <div className="relative" style={{ height: chartHeight + 60 }}>
          <svg width="100%" height={chartHeight + 60} className="overflow-visible">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1="0"
                y1={i * (chartHeight / 4)}
                x2="100%"
                y2={i * (chartHeight / 4)}
                stroke="#374151"
                strokeWidth="1"
                opacity="0.3"
              />
            ))}
            
            {/* Price line */}
            {currentStepData.prices.length > 1 && (
              <polyline
                points={currentStepData.prices
                  .map((price, i) => {
                    const x = (i / (currentStepData.prices.length - 1)) * 100;
                    const y = chartHeight - ((price - minChartPrice) / (maxPrice - minChartPrice)) * chartHeight;
                    return `${x}%,${y}`;
                  })
                  .join(' ')}
                stroke="#60a5fa"
                strokeWidth="3"
                fill="none"
              />
            )}
            
            {/* Price points */}
            {currentStepData.prices.map((price, i) => {
              const x = currentStepData.prices.length > 1 
                ? (i / (currentStepData.prices.length - 1)) * 100 
                : 50;
              const y = chartHeight - ((price - minChartPrice) / (maxPrice - minChartPrice || 1)) * chartHeight;
              
              let circleColor = '#64748b'; // default gray
              if (i === currentStepData.bestBuyDay && currentStepData.type === 'done') {
                circleColor = '#10b981'; // green for best buy
              } else if (i === currentStepData.bestSellDay && currentStepData.type === 'done') {
                circleColor = '#f59e0b'; // orange for best sell
              } else if (i === currentStepData.buyDay && i <= currentStepData.day) {
                circleColor = '#10b981'; // green for current best buy
              } else if (i === currentStepData.day && currentStepData.type === 'sell') {
                circleColor = '#f59e0b'; // orange for current sell consideration
              } else if (i <= currentStepData.day) {
                circleColor = '#60a5fa'; // blue for visited
              }
              
              return (
                <g key={i}>
                  <motion.circle
                    cx={`${x}%`}
                    cy={y}
                    r={i <= currentStepData.day ? 8 : 6}
                    fill={circleColor}
                    animate={{ 
                      r: i === currentStepData.day ? 12 : (i <= currentStepData.day ? 8 : 6),
                      scale: i === currentStepData.day ? 1.2 : 1 
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Price labels */}
                  <text
                    x={`${x}%`}
                    y={y - 15}
                    textAnchor="middle"
                    className="text-xs fill-white font-semibold"
                  >
                    ${price}
                  </text>
                  
                  {/* Day labels */}
                  <text
                    x={`${x}%`}
                    y={chartHeight + 25}
                    textAnchor="middle"
                    className="text-xs fill-slate-400"
                  >
                    Day {i}
                  </text>
                </g>
              );
            })}
            
            {/* Profit line visualization for best solution */}
            {currentStepData.maxProfit > 0 && currentStepData.type === 'done' && (
              <line
                x1={`${currentStepData.prices.length > 1 ? (currentStepData.bestBuyDay / (currentStepData.prices.length - 1)) * 100 : 50}%`}
                y1={chartHeight - ((currentStepData.prices[currentStepData.bestBuyDay] - minChartPrice) / (maxPrice - minChartPrice)) * chartHeight}
                x2={`${currentStepData.prices.length > 1 ? (currentStepData.bestSellDay / (currentStepData.prices.length - 1)) * 100 : 50}%`}
                y2={chartHeight - ((currentStepData.prices[currentStepData.bestSellDay] - minChartPrice) / (maxPrice - minChartPrice)) * chartHeight}
                stroke="#22c55e"
                strokeWidth="4"
                strokeDasharray="5,5"
                opacity="0.8"
              />
            )}
          </svg>
        </div>
      </div>
      
      {/* Current state display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Current day */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Current Day</h3>
          <div className="text-2xl font-bold text-blue-400">
            Day {currentStepData.day}
          </div>
          <div className="text-sm text-slate-300">
            Price: ${currentStepData.currentPrice}
          </div>
        </div>
        
        {/* Best buy day (minimum so far) */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Best Buy Day (Min So Far)</h3>
          <div className="text-2xl font-bold text-green-400">
            Day {currentStepData.buyDay}
          </div>
          <div className="text-sm text-slate-300">
            Price: ${currentStepData.buyPrice}
          </div>
        </div>
        
        {/* Current max profit */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Max Profit</h3>
          <div className="text-2xl font-bold text-yellow-400">
            ${currentStepData.maxProfit}
          </div>
          {currentStepData.maxProfit > 0 && (
            <div className="text-sm text-slate-300">
              Buy day {currentStepData.bestBuyDay} → Sell day {currentStepData.bestSellDay}
            </div>
          )}
        </div>
      </div>
      
      {/* Algorithm explanation */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className={`w-3 h-3 rounded-full ${
            currentStepData.type === 'done' ? 'bg-green-500' :
            currentStepData.type === 'buy' ? 'bg-blue-500' :
            currentStepData.type === 'sell' ? 'bg-yellow-500' :
            currentStepData.type === 'update-profit' ? 'bg-green-500' :
            'bg-gray-500'
          }`} />
          <span className="text-sm font-semibold text-slate-400">
            {currentStepData.type === 'start' ? 'Starting' :
             currentStepData.type === 'buy' ? 'New Buy Day Found' :
             currentStepData.type === 'sell' ? 'Checking Sell Opportunity' :
             currentStepData.type === 'update-profit' ? 'New Best Profit!' :
             'Algorithm Complete'}
          </span>
        </div>
        <p className="text-slate-300">{currentStepData.description}</p>
      </div>
      
      <Controls
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onStepBack={() => setCurrentStep(s => Math.max(0, s - 1))}
        onStepForward={() => setCurrentStep(s => Math.min(steps.length - 1, s + 1))}
        onReset={() => { setCurrentStep(0); setIsPlaying(false); }}
        currentStep={currentStep + 1}
        totalSteps={steps.length}
        speed={speed}
        onSpeedChange={setSpeed}
        canStepBack={currentStep > 0}
        canStepForward={currentStep < steps.length - 1}
      />
      
      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Code</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`public int maxProfit(int[] prices) {
    if (prices.length == 0) return 0;
    
    int minPrice = prices[0];
    int maxProfit = 0;
    
    for (int i = 1; i < prices.length; i++) {
        // Update minimum price (best buy day so far)
        if (prices[i] < minPrice) {
            minPrice = prices[i];
        } 
        // Check if selling today gives better profit
        else {
            maxProfit = Math.max(maxProfit, prices[i] - minPrice);
        }
    }
    
    return maxProfit;
}`}
        </pre>
      </div>
      
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Sliding Window Insight</h3>
        <p className="text-slate-300">
          This problem uses a <strong>one-pass sliding window</strong> approach where we track:
          <br />• <code className="text-green-400">minPrice</code> - the lowest price seen so far (best buy point)
          <br />• <code className="text-yellow-400">maxProfit</code> - the maximum profit achievable by selling at current position
          <br />
          The "window" concept here is maintaining the best buy point while scanning for sell opportunities.
          We only need one pass through the array, making it O(n) time and O(1) space.
        </p>
      </div>
    </div>
  );
}