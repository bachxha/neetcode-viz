import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'expand' | 'shrink' | 'found' | 'done';
  s: string;
  t: string;
  left: number;
  right: number;
  windowMap: Map<string, number>;
  needMap: Map<string, number>;
  formed: number;
  required: number;
  minStart: number;
  minLen: number;
  description: string;
}

function generateSteps(s: string, t: string): Step[] {
  const steps: Step[] = [];
  
  if (s.length === 0 || t.length === 0) {
    steps.push({
      type: 'done',
      s,
      t,
      left: 0,
      right: 0,
      windowMap: new Map(),
      needMap: new Map(),
      formed: 0,
      required: 0,
      minStart: 0,
      minLen: Infinity,
      description: 'Empty strings - no valid window possible',
    });
    return steps;
  }
  
  // Count characters in t
  const needMap = new Map<string, number>();
  for (const char of t) {
    needMap.set(char, (needMap.get(char) || 0) + 1);
  }
  const required = needMap.size;
  
  steps.push({
    type: 'start',
    s,
    t,
    left: 0,
    right: 0,
    windowMap: new Map(),
    needMap: new Map(needMap),
    formed: 0,
    required,
    minStart: 0,
    minLen: Infinity,
    description: `Find minimum window in "${s}" that contains all characters from "${t}". Need ${required} unique characters.`,
  });
  
  const windowMap = new Map<string, number>();
  let left = 0;
  let formed = 0;
  let minLen = Infinity;
  let minStart = 0;
  
  // Expand window with right pointer
  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    windowMap.set(char, (windowMap.get(char) || 0) + 1);
    
    // Check if current character frequency matches needed frequency
    if (needMap.has(char) && windowMap.get(char) === needMap.get(char)) {
      formed++;
    }
    
    steps.push({
      type: 'expand',
      s,
      t,
      left,
      right,
      windowMap: new Map(windowMap),
      needMap: new Map(needMap),
      formed,
      required,
      minStart,
      minLen,
      description: `Add '${char}' to window. Window: "${s.substring(left, right + 1)}". Formed: ${formed}/${required} character types.`,
    });
    
    // Try to shrink window from left
    while (left <= right && formed === required) {
      const windowSize = right - left + 1;
      
      // Update minimum window if current is smaller
      if (windowSize < minLen) {
        minLen = windowSize;
        minStart = left;
        
        steps.push({
          type: 'found',
          s,
          t,
          left,
          right,
          windowMap: new Map(windowMap),
          needMap: new Map(needMap),
          formed,
          required,
          minStart,
          minLen,
          description: `Valid window found! "${s.substring(left, right + 1)}" (length ${windowSize}). New minimum!`,
        });
      }
      
      // Remove leftmost character
      const leftChar = s[left];
      windowMap.set(leftChar, windowMap.get(leftChar)! - 1);
      
      // Check if removing leftChar breaks the validity
      if (needMap.has(leftChar) && windowMap.get(leftChar)! < needMap.get(leftChar)!) {
        formed--;
      }
      
      left++;
      
      if (formed < required) {
        steps.push({
          type: 'shrink',
          s,
          t,
          left,
          right,
          windowMap: new Map(windowMap),
          needMap: new Map(needMap),
          formed,
          required,
          minStart,
          minLen,
          description: `Shrink window: removed '${leftChar}'. Window: "${s.substring(left, right + 1)}". No longer valid (${formed}/${required}).`,
        });
      } else {
        steps.push({
          type: 'shrink',
          s,
          t,
          left,
          right,
          windowMap: new Map(windowMap),
          needMap: new Map(needMap),
          formed,
          required,
          minStart,
          minLen,
          description: `Shrink window: removed '${leftChar}'. Window: "${s.substring(left, right + 1)}". Still valid (${formed}/${required}).`,
        });
      }
    }
  }
  
  const result = minLen === Infinity ? '' : s.substring(minStart, minStart + minLen);
  steps.push({
    type: 'done',
    s,
    t,
    left,
    right: s.length - 1,
    windowMap: new Map(windowMap),
    needMap: new Map(needMap),
    formed,
    required,
    minStart,
    minLen,
    description: minLen === Infinity 
      ? 'No valid window found.'
      : `Minimum window substring: "${result}" with length ${minLen}.`,
  });
  
  return steps;
}

export function MinimumWindowSubstringVisualizer() {
  const [inputS, setInputS] = useState('ADOBECODEBANC');
  const [inputT, setInputT] = useState('ABC');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    const s = inputS.trim();
    const t = inputT.trim();
    if (s.length <= 30 && t.length <= 10) {
      const newSteps = generateSteps(s, t);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [inputS, inputT]);
  
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
  
  if (!currentStepData) return <div>Loading...</div>;
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Minimum Window Substring</h1>
        <p className="text-slate-400">
          Use sliding window to find the minimum window in string S that contains all characters from string T.
          Expand right to include characters, shrink left to minimize window.
        </p>
      </div>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex gap-2 items-center">
          <label className="text-sm text-slate-400">String S:</label>
          <input
            type="text"
            value={inputS}
            onChange={(e) => setInputS(e.target.value)}
            onBlur={initializeSteps}
            onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
            className="flex-1 px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono"
            maxLength={30}
          />
        </div>
        <div className="flex gap-2 items-center">
          <label className="text-sm text-slate-400">String T:</label>
          <input
            type="text"
            value={inputT}
            onChange={(e) => setInputT(e.target.value)}
            onBlur={initializeSteps}
            onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
            className="flex-1 px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono"
            maxLength={10}
          />
        </div>
      </div>
      
      {/* String visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">String S (Sliding Window)</h3>
        <div className="flex gap-1 justify-center flex-wrap mb-4">
          {currentStepData.s.split('').map((char, i) => {
            const inWindow = i >= currentStepData.left && i <= currentStepData.right;
            const isMinWindow = currentStepData.minLen !== Infinity && 
              i >= currentStepData.minStart && 
              i < currentStepData.minStart + currentStepData.minLen &&
              currentStepData.type === 'done';
            const isLeft = i === currentStepData.left;
            const isRight = i === currentStepData.right;
            const isNeeded = currentStepData.needMap.has(char);
            
            return (
              <motion.div
                key={i}
                className="flex flex-col items-center"
                animate={{ scale: inWindow ? 1.1 : 1 }}
              >
                <div className="text-xs text-slate-500 mb-1">{i}</div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg relative ${
                  isMinWindow ? 'bg-green-500 text-white' :
                  inWindow ? 'bg-blue-500 text-white' :
                  isNeeded ? 'bg-purple-700 text-white' :
                  'bg-slate-700'
                }`}>
                  {char}
                  {isLeft && inWindow && (
                    <div className="absolute -top-6 text-xs text-yellow-400 font-normal">L</div>
                  )}
                  {isRight && inWindow && (
                    <div className="absolute -bottom-6 text-xs text-yellow-400 font-normal">R</div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Current window display */}
        {currentStepData.s.length > 0 && currentStepData.left <= currentStepData.right && (
          <div className="flex justify-center mt-4">
            <div className="text-center">
              <span className="text-slate-400">Current window: </span>
              <span className="font-mono text-blue-400 text-lg">
                "{currentStepData.s.substring(currentStepData.left, currentStepData.right + 1)}"
              </span>
              <span className="text-slate-500 ml-2">
                (length {currentStepData.right - currentStepData.left + 1})
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Target string T */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Target String T (Need to Find)</h3>
        <div className="flex gap-2 justify-center">
          {currentStepData.t.split('').map((char, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center font-bold"
            >
              {char}
            </div>
          ))}
        </div>
      </div>
      
      {/* Character frequency maps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Need map */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">Required Characters</h3>
          <div className="space-y-2">
            {Array.from(currentStepData.needMap.entries()).map(([char, count]) => (
              <div key={char} className="flex justify-between items-center">
                <span className="font-mono text-purple-400">{char}</span>
                <span className="text-slate-300">{count}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Window map */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">Window Characters</h3>
          <div className="space-y-2 min-h-[80px]">
            {Array.from(currentStepData.windowMap.entries())
              .filter(([_, count]) => count > 0)
              .map(([char, count]) => {
                const needed = currentStepData.needMap.get(char) || 0;
                const satisfied = needed > 0 && count >= needed;
                return (
                  <div key={char} className="flex justify-between items-center">
                    <span className={`font-mono ${satisfied ? 'text-green-400' : 'text-blue-400'}`}>
                      {char}
                    </span>
                    <span className={satisfied ? 'text-green-400' : 'text-slate-300'}>
                      {count}{needed > 0 ? ` / ${needed}` : ''}
                    </span>
                  </div>
                );
              })}
            {Array.from(currentStepData.windowMap.values()).every(count => count === 0) && (
              <span className="text-slate-500 italic">Empty</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Progress and best result */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">Progress</h3>
          <div className="flex items-center gap-4">
            <span className="text-lg">
              Formed: <span className="text-green-400 font-bold">{currentStepData.formed}</span> / 
              <span className="text-slate-400">{currentStepData.required}</span>
            </span>
            <div className="flex-1 bg-slate-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${(currentStepData.formed / currentStepData.required) * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">Best Window Found</h3>
          <div className="text-center">
            {currentStepData.minLen === Infinity ? (
              <span className="text-slate-500 italic">None yet</span>
            ) : (
              <>
                <div className="font-mono text-green-400 text-lg">
                  "{currentStepData.s.substring(currentStepData.minStart, currentStepData.minStart + currentStepData.minLen)}"
                </div>
                <div className="text-sm text-slate-400">Length: {currentStepData.minLen}</div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            currentStepData.type === 'done' ? 'bg-green-500' :
            currentStepData.type === 'found' ? 'bg-green-500' :
            currentStepData.type === 'shrink' ? 'bg-red-500' :
            currentStepData.type === 'expand' ? 'bg-blue-500' :
            'bg-gray-500'
          }`} />
          <span className="text-lg">{currentStepData.description}</span>
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
      
      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Code</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`public String minWindow(String s, String t) {
    if (s.length() == 0 || t.length() == 0) return "";
    
    // Count characters in t
    Map<Character, Integer> dictT = new HashMap<>();
    for (char c : t.toCharArray()) {
        dictT.put(c, dictT.getOrDefault(c, 0) + 1);
    }
    
    int required = dictT.size();
    int left = 0, right = 0;
    int formed = 0; // Number of unique chars with desired frequency
    
    Map<Character, Integer> windowCounts = new HashMap<>();
    
    // Answer tuple (window length, left, right)
    int[] ans = {-1, 0, 0};
    
    while (right < s.length()) {
        // Expand window
        char c = s.charAt(right);
        windowCounts.put(c, windowCounts.getOrDefault(c, 0) + 1);
        
        if (dictT.containsKey(c) && 
            windowCounts.get(c).intValue() == dictT.get(c).intValue()) {
            formed++;
        }
        
        // Contract window
        while (left <= right && formed == required) {
            // Update answer if this window is smaller
            if (ans[0] == -1 || right - left + 1 < ans[0]) {
                ans[0] = right - left + 1;
                ans[1] = left;
                ans[2] = right;
            }
            
            // Remove from left
            char leftChar = s.charAt(left);
            windowCounts.put(leftChar, windowCounts.get(leftChar) - 1);
            
            if (dictT.containsKey(leftChar) && 
                windowCounts.get(leftChar) < dictT.get(leftChar)) {
                formed--;
            }
            
            left++;
        }
        
        right++;
    }
    
    return ans[0] == -1 ? "" : s.substring(ans[1], ans[2] + 1);
}`}
        </pre>
      </div>
      
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Sliding Window Pattern</h3>
        <p className="text-slate-300">
          This is a classic <strong>expanding/contracting sliding window</strong> problem:
          <br />• <code className="text-blue-400">Right pointer</code> expands the window to include more characters
          <br />• <code className="text-red-400">Left pointer</code> contracts the window to minimize size while maintaining validity
          <br />• We track character frequencies and only contract when we have a valid window
          <br />• Time complexity: O(|s| + |t|), Space complexity: O(|s| + |t|)
        </p>
      </div>
    </div>
  );
}