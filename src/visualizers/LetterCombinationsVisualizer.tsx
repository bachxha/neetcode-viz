import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Controls } from '../components/Controls';

const PHONE_MAP: Record<string, string[]> = {
  '2': ['a', 'b', 'c'],
  '3': ['d', 'e', 'f'],
  '4': ['g', 'h', 'i'],
  '5': ['j', 'k', 'l'],
  '6': ['m', 'n', 'o'],
  '7': ['p', 'q', 'r', 's'],
  '8': ['t', 'u', 'v'],
  '9': ['w', 'x', 'y', 'z'],
};

interface Step {
  type: 'start' | 'digit' | 'try-letter' | 'add' | 'found' | 'backtrack';
  digits: string;
  currentPath: string;
  digitIndex: number;
  letterIndex: number;
  combinations: string[];
  description: string;
}

function generateSteps(digits: string): Step[] {
  if (digits.length === 0) return [];
  
  const steps: Step[] = [];
  const combinations: string[] = [];
  
  steps.push({
    type: 'start',
    digits,
    currentPath: '',
    digitIndex: 0,
    letterIndex: -1,
    combinations: [],
    description: `Find all letter combinations for "${digits}"`,
  });
  
  function backtrack(index: number, path: string) {
    if (index === digits.length) {
      combinations.push(path);
      steps.push({
        type: 'found',
        digits,
        currentPath: path,
        digitIndex: index,
        letterIndex: -1,
        combinations: [...combinations],
        description: `Found combination: "${path}"`,
      });
      return;
    }
    
    const digit = digits[index];
    const letters = PHONE_MAP[digit] || [];
    
    steps.push({
      type: 'digit',
      digits,
      currentPath: path,
      digitIndex: index,
      letterIndex: -1,
      combinations: [...combinations],
      description: `Digit "${digit}" maps to [${letters.join(', ')}]`,
    });
    
    for (let i = 0; i < letters.length; i++) {
      const letter = letters[i];
      
      steps.push({
        type: 'try-letter',
        digits,
        currentPath: path,
        digitIndex: index,
        letterIndex: i,
        combinations: [...combinations],
        description: `Try letter "${letter}" for digit "${digit}"`,
      });
      
      steps.push({
        type: 'add',
        digits,
        currentPath: path + letter,
        digitIndex: index,
        letterIndex: i,
        combinations: [...combinations],
        description: `Add "${letter}", path = "${path + letter}"`,
      });
      
      backtrack(index + 1, path + letter);
      
      if (i < letters.length - 1 || index > 0) {
        steps.push({
          type: 'backtrack',
          digits,
          currentPath: path,
          digitIndex: index,
          letterIndex: i,
          combinations: [...combinations],
          description: `Backtrack, try next letter`,
        });
      }
    }
  }
  
  backtrack(0, '');
  return steps;
}

export function LetterCombinationsVisualizer() {
  const [input, setInput] = useState('23');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    const digits = input.replace(/[^2-9]/g, '').slice(0, 4);
    if (digits.length > 0) {
      const newSteps = generateSteps(digits);
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
  
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Letter Combinations of a Phone Number</h1>
        <p className="text-slate-400">
          Given digits 2-9, return all possible letter combinations (like old phone keypads).
        </p>
      </div>
      
      <div className="mb-6 flex gap-4 items-center">
        <label className="text-sm text-slate-400">Digits (2-9):</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onBlur={initializeSteps}
          onKeyDown={(e) => e.key === 'Enter' && initializeSteps()}
          className="px-3 py-2 bg-slate-800 rounded-lg border border-slate-600 focus:border-blue-500 outline-none font-mono text-xl tracking-widest"
          placeholder="23"
          maxLength={4}
        />
        <span className="text-xs text-slate-500">(max 4 digits)</span>
      </div>
      
      {/* Phone Keypad */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Phone Keypad</h3>
        <div className="flex justify-center">
          <div className="grid grid-cols-3 gap-2">
            {['2', '3', '4', '5', '6', '7', '8', '9'].map((digit, _idx) => {
              const isActive = currentStepData?.digits[currentStepData.digitIndex] === digit;
              const letters = PHONE_MAP[digit];
              return (
                <motion.div
                  key={digit}
                  className={`w-20 h-16 rounded-lg flex flex-col items-center justify-center ${
                    isActive ? 'bg-yellow-500 text-black' : 'bg-slate-700'
                  }`}
                  animate={{ scale: isActive ? 1.1 : 1 }}
                >
                  <span className="text-xl font-bold">{digit}</span>
                  <span className="text-xs">{letters.join(' ')}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Input Digits */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">Input Digits</h3>
          <div className="flex gap-2 justify-center">
            {currentStepData?.digits.split('').map((digit, i) => {
              const isActive = i === currentStepData.digitIndex;
              const isProcessed = i < currentStepData.digitIndex;
              return (
                <motion.div
                  key={i}
                  className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center ${
                    isActive ? 'bg-yellow-500 text-black' :
                    isProcessed ? 'bg-green-600' :
                    'bg-slate-700'
                  }`}
                  animate={{ scale: isActive ? 1.1 : 1 }}
                >
                  <span className="text-2xl font-bold">{digit}</span>
                  <span className="text-xs opacity-70">{PHONE_MAP[digit]?.join('')}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
        
        {/* Current Letters Being Tried */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">Current Digit's Letters</h3>
          {currentStepData && currentStepData.digitIndex < currentStepData.digits.length ? (
            <div className="flex gap-2 justify-center">
              {PHONE_MAP[currentStepData.digits[currentStepData.digitIndex]]?.map((letter, i) => {
                const isActive = i === currentStepData.letterIndex;
                const isUsed = i < currentStepData.letterIndex;
                return (
                  <motion.div
                    key={i}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold ${
                      isActive ? 'bg-blue-500' :
                      isUsed ? 'bg-slate-600 opacity-50' :
                      'bg-slate-700'
                    }`}
                    animate={{ scale: isActive ? 1.1 : 1 }}
                  >
                    {letter}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-slate-500">-</div>
          )}
        </div>
      </div>
      
      {/* Current Path */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Building Combination</h3>
        <div className="flex gap-1 justify-center min-h-[48px] items-center">
          {currentStepData?.currentPath ? (
            currentStepData.currentPath.split('').map((char, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-xl font-bold"
              >
                {char}
              </motion.div>
            ))
          ) : (
            <span className="text-slate-500">Empty</span>
          )}
        </div>
      </div>
      
      {/* Combinations Found */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">
          Combinations Found ({currentStepData?.combinations.length || 0})
        </h3>
        <div className="flex gap-2 flex-wrap min-h-[40px]">
          <AnimatePresence>
            {currentStepData?.combinations.map((combo, _i) => (
              <motion.div
                key={combo}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-4 py-2 bg-green-500/20 border border-green-500 rounded-lg font-mono text-green-400 text-lg"
              >
                "{combo}"
              </motion.div>
            ))}
          </AnimatePresence>
          {(!currentStepData?.combinations.length) && (
            <span className="text-slate-500">None yet</span>
          )}
        </div>
      </div>
      
      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            currentStepData?.type === 'found' ? 'bg-green-500' :
            currentStepData?.type === 'backtrack' ? 'bg-orange-500' :
            currentStepData?.type === 'add' ? 'bg-blue-500' :
            'bg-yellow-500'
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
{`private static final Map<Character, String> PHONE = Map.of(
    '2', "abc", '3', "def", '4', "ghi", '5', "jkl",
    '6', "mno", '7', "pqrs", '8', "tuv", '9', "wxyz"
);

public List<String> letterCombinations(String digits) {
    List<String> result = new ArrayList<>();
    if (digits.isEmpty()) return result;
    backtrack(digits, 0, new StringBuilder(), result);
    return result;
}

private void backtrack(String digits, int index, 
                       StringBuilder path, List<String> result) {
    if (index == digits.length()) {
        result.add(path.toString());
        return;
    }
    
    String letters = PHONE.get(digits.charAt(index));
    for (char letter : letters.toCharArray()) {
        path.append(letter);
        backtrack(digits, index + 1, path, result);
        path.deleteCharAt(path.length() - 1);  // Backtrack
    }
}`}
        </pre>
      </div>
    </div>
  );
}
