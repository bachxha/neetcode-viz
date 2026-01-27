import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'try' | 'check-palindrome' | 'is-palindrome' | 'not-palindrome' | 'found' | 'backtrack';
  s: string;
  path: string[];
  startIndex: number;
  endIndex: number;
  partitions: string[][];
  description: string;
}

function isPalindrome(s: string, start: number, end: number): boolean {
  while (start < end) {
    if (s[start] !== s[end]) return false;
    start++;
    end--;
  }
  return true;
}

function generateSteps(s: string): Step[] {
  const steps: Step[] = [];
  const partitions: string[][] = [];
  
  steps.push({
    type: 'start',
    s,
    path: [],
    startIndex: 0,
    endIndex: 0,
    partitions: [],
    description: `Partition "${s}" into palindrome substrings`,
  });
  
  function backtrack(start: number, path: string[]) {
    if (start === s.length) {
      partitions.push([...path]);
      steps.push({
        type: 'found',
        s,
        path: [...path],
        startIndex: start,
        endIndex: start,
        partitions: partitions.map(p => [...p]),
        description: `Found partition: [${path.map(p => `"${p}"`).join(', ')}]`,
      });
      return;
    }
    
    for (let end = start; end < s.length; end++) {
      const substring = s.substring(start, end + 1);
      
      steps.push({
        type: 'try',
        s,
        path: [...path],
        startIndex: start,
        endIndex: end,
        partitions: partitions.map(p => [...p]),
        description: `Try substring "${substring}" (index ${start} to ${end})`,
      });
      
      steps.push({
        type: 'check-palindrome',
        s,
        path: [...path],
        startIndex: start,
        endIndex: end,
        partitions: partitions.map(p => [...p]),
        description: `Is "${substring}" a palindrome?`,
      });
      
      if (isPalindrome(s, start, end)) {
        steps.push({
          type: 'is-palindrome',
          s,
          path: [...path],
          startIndex: start,
          endIndex: end,
          partitions: partitions.map(p => [...p]),
          description: `Yes! "${substring}" is a palindrome`,
        });
        
        path.push(substring);
        backtrack(end + 1, path);
        path.pop();
        
        if (end < s.length - 1) {
          steps.push({
            type: 'backtrack',
            s,
            path: [...path],
            startIndex: start,
            endIndex: end,
            partitions: partitions.map(p => [...p]),
            description: `Backtrack, try longer substring`,
          });
        }
      } else {
        steps.push({
          type: 'not-palindrome',
          s,
          path: [...path],
          startIndex: start,
          endIndex: end,
          partitions: partitions.map(p => [...p]),
          description: `No, "${substring}" is not a palindrome`,
        });
      }
    }
  }
  
  backtrack(0, []);
  return steps;
}

export function PalindromePartitioningVisualizer() {
  const [input, setInput] = useState('aab');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    if (input.length > 0 && input.length <= 8) {
      const newSteps = generateSteps(input);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [input]);
  
  useEffect(() => {
    initializeSteps();
  }, []);
  
  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      if (currentStep >= steps.length - 1) setIsPlaying(false);
      return;
    }
    
    const timer = setTimeout(() => {
      setCurrentStep(s => s + 1);
    }, 600 / speed);
    
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);
  
  const currentStepData = steps[currentStep];
  
  const getCharStyle = (index: number) => {
    if (!currentStepData) return 'bg-slate-700';
    
    const { startIndex, endIndex, type } = currentStepData;
    
    if (index >= startIndex && index <= endIndex) {
      if (type === 'is-palindrome') return 'bg-green-500';
      if (type === 'not-palindrome') return 'bg-red-500';
      if (type === 'check-palindrome') return 'bg-yellow-500';
      return 'bg-blue-500';
    }
    
    // Check if this index is covered by existing path
    let covered = 0;
    for (const part of currentStepData.path) {
      if (index >= covered && index < covered + part.length) {
        return 'bg-green-600';
      }
      covered += part.length;
    }
    
    return 'bg-slate-700';
  };
  
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Palindrome Partitioning</h1>
        <p className="text-slate-400">
          Partition a string such that every substring is a palindrome.
          Uses backtracking to try all possible partitions.
        </p>
      </div>
      
      <div className="mb-6 flex gap-4 items-center">
        <label className="text-sm text-slate-400">String:</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.toLowerCase())}
          onBlur={initializeSteps}
          onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
          className="px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono text-xl tracking-widest"
          placeholder="aab"
          maxLength={8}
        />
      </div>
      
      {/* String Visualization */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">String</h3>
        <div className="flex gap-1 justify-center">
          {currentStepData?.s.split('').map((char, i) => (
            <motion.div
              key={i}
              className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center ${getCharStyle(i)}`}
              animate={{
                scale: i >= (currentStepData?.startIndex || 0) && i <= (currentStepData?.endIndex || 0) ? 1.1 : 1,
              }}
            >
              <span className="text-xl font-bold">{char}</span>
              <span className="text-xs opacity-70">{i}</span>
            </motion.div>
          ))}
        </div>
        
        <div className="flex gap-3 mt-4 text-xs justify-center">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-600"></span> In path
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-blue-500"></span> Trying
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-500"></span> Palindrome
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-500"></span> Not palindrome
          </span>
        </div>
      </div>
      
      {/* Current Path */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Current Partition</h3>
        <div className="flex gap-2 justify-center min-h-[48px] items-center flex-wrap">
          {currentStepData?.path.length ? (
            currentStepData.path.map((part, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-4 py-2 bg-blue-500 rounded-lg font-mono text-lg font-bold"
              >
                "{part}"
              </motion.div>
            ))
          ) : (
            <span className="text-slate-500">Empty</span>
          )}
        </div>
      </div>
      
      {/* Valid Partitions */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">
          Valid Partitions ({currentStepData?.partitions.length || 0})
        </h3>
        <div className="flex gap-2 flex-wrap min-h-[40px]">
          <AnimatePresence>
            {currentStepData?.partitions.map((partition, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-2 bg-green-500/20 border border-green-500 rounded-lg font-mono text-green-400"
              >
                [{partition.map(p => `"${p}"`).join(', ')}]
              </motion.div>
            ))}
          </AnimatePresence>
          {(!currentStepData?.partitions.length) && (
            <span className="text-slate-500">None yet</span>
          )}
        </div>
      </div>
      
      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            currentStepData?.type === 'found' ? 'bg-green-500' :
            currentStepData?.type === 'is-palindrome' ? 'bg-green-500' :
            currentStepData?.type === 'not-palindrome' ? 'bg-red-500' :
            currentStepData?.type === 'backtrack' ? 'bg-orange-500' :
            'bg-blue-500'
          }`} />
          <span className="text-lg">{currentStepData?.description || 'Ready'}</span>
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
      
      {/* Code Reference */}
      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Code</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`public List<List<String>> partition(String s) {
    List<List<String>> result = new ArrayList<>();
    backtrack(s, 0, new ArrayList<>(), result);
    return result;
}

private void backtrack(String s, int start, 
                       List<String> path, List<List<String>> result) {
    if (start == s.length()) {
        result.add(new ArrayList<>(path));
        return;
    }
    
    for (int end = start; end < s.length(); end++) {
        if (isPalindrome(s, start, end)) {
            path.add(s.substring(start, end + 1));
            backtrack(s, end + 1, path, result);
            path.remove(path.size() - 1);  // Backtrack
        }
    }
}

private boolean isPalindrome(String s, int start, int end) {
    while (start < end) {
        if (s.charAt(start++) != s.charAt(end--)) {
            return false;
        }
    }
    return true;
}`}
        </pre>
      </div>
    </div>
  );
}
