import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'testing-speed' | 'calculate-hours' | 'too-slow' | 'works' | 'search-left' | 'search-right' | 'found';
  piles: number[];
  h: number;
  k: number;
  left: number;
  right: number;
  mid: number;
  hoursNeeded: number[];
  totalHours: number;
  canFinish: boolean;
  description: string;
  foundAnswer?: number;
}

function calculateHoursForPile(pile: number, k: number): number {
  return Math.ceil(pile / k);
}

function calculateTotalHours(piles: number[], k: number): number {
  return piles.reduce((total, pile) => total + calculateHoursForPile(pile, k), 0);
}

function generateSteps(piles: number[], h: number): Step[] {
  const steps: Step[] = [];
  
  if (piles.length === 0) {
    steps.push({
      type: 'found',
      piles,
      h,
      k: 1,
      left: 1,
      right: 1,
      mid: 1,
      hoursNeeded: [],
      totalHours: 0,
      canFinish: true,
      foundAnswer: 1,
      description: 'No piles to eat - any speed works',
    });
    return steps;
  }
  
  const maxPile = Math.max(...piles);
  
  steps.push({
    type: 'start',
    piles,
    h,
    k: 1,
    left: 1,
    right: maxPile,
    mid: Math.ceil((1 + maxPile) / 2),
    hoursNeeded: [],
    totalHours: 0,
    canFinish: false,
    description: `Find minimum eating speed k. Search range: [1, ${maxPile}] (max pile size)`,
  });
  
  let left = 1;
  let right = maxPile;
  let result = maxPile;
  
  while (left <= right) {
    const mid = Math.ceil((left + right) / 2);
    
    steps.push({
      type: 'testing-speed',
      piles,
      h,
      k: mid,
      left,
      right,
      mid,
      hoursNeeded: [],
      totalHours: 0,
      canFinish: false,
      description: `Testing speed k = ${mid}. Calculate hours needed for each pile.`,
    });
    
    const hoursNeeded = piles.map(pile => calculateHoursForPile(pile, mid));
    const totalHours = hoursNeeded.reduce((sum, hours) => sum + hours, 0);
    
    steps.push({
      type: 'calculate-hours',
      piles,
      h,
      k: mid,
      left,
      right,
      mid,
      hoursNeeded,
      totalHours,
      canFinish: totalHours <= h,
      description: `Hours needed: ${hoursNeeded.join(' + ')} = ${totalHours}. ${totalHours <= h ? `≤ ${h} ✓` : `> ${h} ✗`}`,
    });
    
    if (totalHours <= h) {
      result = mid;
      right = mid - 1;
      
      steps.push({
        type: 'works',
        piles,
        h,
        k: mid,
        left,
        right,
        mid,
        hoursNeeded,
        totalHours,
        canFinish: true,
        description: `Speed k = ${mid} works! Try smaller speeds. Set right = ${mid - 1}`,
      });
    } else {
      left = mid + 1;
      
      steps.push({
        type: 'too-slow',
        piles,
        h,
        k: mid,
        left,
        right,
        mid,
        hoursNeeded,
        totalHours,
        canFinish: false,
        description: `Speed k = ${mid} too slow! Need faster speed. Set left = ${mid + 1}`,
      });
    }
  }
  
  steps.push({
    type: 'found',
    piles,
    h,
    k: result,
    left,
    right,
    mid: result,
    hoursNeeded: piles.map(pile => calculateHoursForPile(pile, result)),
    totalHours: calculateTotalHours(piles, result),
    canFinish: true,
    foundAnswer: result,
    description: `Found minimum speed: k = ${result}`,
  });
  
  return steps;
}

function BananaPile({ pile, k, hoursNeeded, isActive }: { pile: number; k: number; hoursNeeded?: number; isActive: boolean }) {
  const bananaHeight = 8;
  const maxHeight = 120;
  const actualHeight = Math.min(pile * bananaHeight, maxHeight);
  const bananaCount = Math.min(pile, Math.floor(maxHeight / bananaHeight));
  const showCount = pile > bananaCount;
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        className="relative flex flex-col-reverse items-center justify-end bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-lg border-2 border-yellow-500 overflow-hidden"
        style={{ width: '60px', height: `${actualHeight}px`, minHeight: '40px' }}
      >
        {/* Banana emojis */}
        <div className="absolute inset-0 flex flex-col-reverse items-center justify-start p-1">
          {Array.from({ length: bananaCount }, (_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: isActive ? 1.1 : 1, 
                opacity: 1,
                rotate: isActive ? Math.sin(Date.now() / 200 + i) * 5 : 0
              }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className="text-lg select-none"
            >
              🍌
            </motion.div>
          ))}
        </div>
        
        {/* Count overlay for tall piles */}
        {showCount && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/70 text-white px-2 py-1 rounded text-sm font-bold">
              {pile}
            </div>
          </div>
        )}
      </div>
      
      <div className="text-center">
        <div className="text-lg font-bold">{pile}</div>
        {hoursNeeded !== undefined && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-sm font-mono px-2 py-1 rounded ${
              isActive ? 'bg-blue-500 text-white' : 'bg-slate-600 text-slate-300'
            }`}
          >
            ⌈{pile}/{k}⌉ = {hoursNeeded}h
          </motion.div>
        )}
      </div>
    </div>
  );
}

function SpeedIndicator({ left, right, mid, k, type }: { 
  left: number; 
  right: number; 
  mid: number; 
  k: number; 
  type: Step['type'] 
}) {
  const range = Math.max(right - left + 1, 1);
  const position = ((k - left) / range) * 100;
  
  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-slate-400 mb-3">Speed Range</h3>
      
      {/* Speed line */}
      <div className="relative h-12 bg-slate-700 rounded-lg mb-4">
        {/* Current speed indicator */}
        <motion.div
          animate={{ left: `${Math.max(0, Math.min(100, position))}%` }}
          className={`absolute top-0 w-1 h-full rounded ${
            type === 'testing-speed' || type === 'calculate-hours' ? 'bg-yellow-500' :
            type === 'too-slow' ? 'bg-red-500' :
            type === 'works' ? 'bg-green-500' :
            'bg-blue-500'
          }`}
          style={{ transform: 'translateX(-50%)' }}
        />
        
        {/* Range indicators */}
        <div className="absolute inset-0 flex items-center justify-between px-2">
          <div className="text-sm text-yellow-400 font-bold">L: {left}</div>
          <div className="text-sm text-blue-400 font-bold">M: {mid}</div>
          <div className="text-sm text-cyan-400 font-bold">R: {right}</div>
        </div>
      </div>
      
      {/* Current speed display */}
      <div className="text-center">
        <div className={`text-2xl font-bold ${
          type === 'testing-speed' || type === 'calculate-hours' ? 'text-yellow-400' :
          type === 'too-slow' ? 'text-red-400' :
          type === 'works' ? 'text-green-400' :
          'text-blue-400'
        }`}>
          k = {k}
        </div>
        <div className="text-sm text-slate-400">bananas/hour</div>
      </div>
    </div>
  );
}

export function KokoEatingBananasVisualizer() {
  const [pilesInput, setPilesInput] = useState('3,6,7,11');
  const [hInput, setHInput] = useState('8');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    const piles = pilesInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0);
    const h = parseInt(hInput.trim());
    
    if (!isNaN(h) && h > 0 && piles.length <= 10 && piles.length > 0) {
      const newSteps = generateSteps(piles, h);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [pilesInput, hInput]);
  
  useEffect(() => {
    initializeSteps();
  }, []);
  
  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      if (currentStep >= steps.length - 1) setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 1000 / speed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);
  
  const currentStepData = steps[currentStep];
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Koko Eating Bananas</h1>
        <p className="text-slate-400">
          Find the minimum eating speed (bananas/hour) to finish all piles within h hours.
          Uses binary search on the answer space. Time complexity: O(n * log(max(piles)))
        </p>
      </div>
      
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-400 block mb-2">Banana Piles (comma-separated):</label>
          <input
            type="text"
            value={pilesInput}
            onChange={(e) => setPilesInput(e.target.value)}
            onBlur={initializeSteps}
            onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
            className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono"
            placeholder="e.g., 3,6,7,11"
          />
        </div>
        <div>
          <label className="text-sm text-slate-400 block mb-2">Hours Limit (h):</label>
          <input
            type="text"
            value={hInput}
            onChange={(e) => setHInput(e.target.value)}
            onBlur={initializeSteps}
            onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
            className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono"
            placeholder="e.g., 8"
          />
        </div>
      </div>
      
      {/* Banana piles visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-slate-400">Banana Piles</h3>
          <div className="text-sm text-slate-400">
            Time limit: <span className="text-blue-400 font-bold">{currentStepData?.h} hours</span>
          </div>
        </div>
        
        <div className="flex items-end justify-center gap-4 mb-4" style={{ minHeight: '180px' }}>
          {currentStepData?.piles.map((pile, i) => (
            <BananaPile
              key={i}
              pile={pile}
              k={currentStepData.k}
              hoursNeeded={currentStepData.hoursNeeded[i]}
              isActive={currentStepData.type === 'testing-speed' || currentStepData.type === 'calculate-hours'}
            />
          ))}
        </div>
        
        {/* Total hours calculation */}
        {currentStepData && currentStepData.hoursNeeded.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center border-t border-slate-700 pt-4"
          >
            <div className="text-lg">
              <span className="text-slate-400">Total hours: </span>
              <span className="font-mono">
                {currentStepData.hoursNeeded.join(' + ')} = 
              </span>
              <span className={`font-bold text-2xl ml-2 ${
                currentStepData.canFinish ? 'text-green-400' : 'text-red-400'
              }`}>
                {currentStepData.totalHours}
              </span>
              <span className="text-slate-400 ml-2">
                / {currentStepData.h} hours {currentStepData.canFinish ? '✓' : '✗'}
              </span>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Speed range and current state */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <SpeedIndicator
          left={currentStepData?.left || 1}
          right={currentStepData?.right || 1}
          mid={currentStepData?.mid || 1}
          k={currentStepData?.k || 1}
          type={currentStepData?.type || 'start'}
        />
        
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Binary Search State</h3>
          {currentStepData && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Left:</span>
                <span className="font-mono text-yellow-400">{currentStepData.left}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mid:</span>
                <span className="font-mono text-blue-400">{currentStepData.mid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Right:</span>
                <span className="font-mono text-cyan-400">{currentStepData.right}</span>
              </div>
              {currentStepData.foundAnswer !== undefined && (
                <div className="flex justify-between border-t border-slate-600 pt-2">
                  <span className="text-slate-400">Answer:</span>
                  <span className="font-mono text-green-400 text-xl font-bold">
                    {currentStepData.foundAnswer}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Current step description */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <span className={`w-4 h-4 rounded-full flex-shrink-0 ${
            currentStepData?.type === 'found' ? 'bg-green-500' :
            currentStepData?.type === 'too-slow' ? 'bg-red-500' :
            currentStepData?.type === 'works' ? 'bg-green-500' :
            currentStepData?.type === 'testing-speed' ? 'bg-yellow-500' :
            'bg-blue-500'
          }`} />
          <span className="text-lg">{currentStepData?.description || 'Ready to start'}</span>
        </div>
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
      
      {/* Java code example */}
      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Code - Binary Search on Answer</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`public int minEatingSpeed(int[] piles, int h) {
    // Binary search on the answer space [1, max(piles)]
    int left = 1;
    int right = Arrays.stream(piles).max().getAsInt();
    
    while (left < right) {
        int mid = left + (right - left) / 2;
        
        // Check if we can finish all piles in h hours with speed mid
        if (canFinish(piles, h, mid)) {
            right = mid; // Try smaller speeds
        } else {
            left = mid + 1; // Need faster speed
        }
    }
    
    return left;
}

private boolean canFinish(int[] piles, int h, int k) {
    int hours = 0;
    for (int pile : piles) {
        // Ceiling division: ⌈pile/k⌉ = (pile + k - 1) / k
        hours += (pile + k - 1) / k;
        if (hours > h) return false; // Early termination
    }
    return true;
}`}
        </pre>
      </div>
      
      {/* Algorithm explanation */}
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">How Binary Search on Answer Works</h3>
        <div className="space-y-3 text-slate-300">
          <p>
            <strong>🎯 Key Insight:</strong> If speed k works, any speed &gt; k also works. 
            If speed k doesn't work, no speed &lt; k will work. This monotonic property enables binary search!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-white mb-2">Algorithm Steps:</h4>
              <ol className="space-y-1 text-sm">
                <li><strong>1.</strong> Set search range: [1, max(piles)]</li>
                <li><strong>2.</strong> Test middle speed</li>
                <li><strong>3.</strong> Calculate hours needed</li>
                <li><strong>4.</strong> Adjust search range based on result</li>
                <li><strong>5.</strong> Repeat until range converges</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Time Complexity:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Binary search: O(log(max(piles)))</li>
                <li>• Check each speed: O(n)</li>
                <li>• <strong>Total: O(n × log(max(piles)))</strong></li>
              </ul>
            </div>
          </div>
          <p className="text-blue-400">
            💡 <strong>Why this works:</strong> We're searching for the minimum value in a "sorted" boolean array 
            [false, false, ..., false, true, true, ..., true] where true means "speed works".
          </p>
        </div>
      </div>
    </div>
  );
}