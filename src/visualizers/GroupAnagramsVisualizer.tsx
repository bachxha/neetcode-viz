import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';
import { Hints } from '../components/Hints';

interface Step {
  type: 'start' | 'sort' | 'group' | 'done';
  words: string[];
  currentIndex: number;
  currentWord: string;
  sortedKey: string;
  groups: Record<string, string[]>;
  description: string;
}

function generateSteps(strs: string[]): Step[] {
  const steps: Step[] = [];
  const groups: Record<string, string[]> = {};

  steps.push({
    type: 'start',
    words: strs,
    currentIndex: -1,
    currentWord: '',
    sortedKey: '',
    groups: {},
    description: `Group anagrams from [${strs.map(s => `"${s}"`).join(', ')}]`,
  });

  for (let i = 0; i < strs.length; i++) {
    const word = strs[i];
    const sortedKey = word.split('').sort().join('');

    steps.push({
      type: 'sort',
      words: strs,
      currentIndex: i,
      currentWord: word,
      sortedKey,
      groups: JSON.parse(JSON.stringify(groups)),
      description: `Sort "${word}" → key = "${sortedKey}"`,
    });

    if (!groups[sortedKey]) groups[sortedKey] = [];
    groups[sortedKey].push(word);

    steps.push({
      type: 'group',
      words: strs,
      currentIndex: i,
      currentWord: word,
      sortedKey,
      groups: JSON.parse(JSON.stringify(groups)),
      description: `Add "${word}" to group "${sortedKey}" → [${groups[sortedKey].map(w => `"${w}"`).join(', ')}]`,
    });
  }

  steps.push({
    type: 'done',
    words: strs,
    currentIndex: strs.length,
    currentWord: '',
    sortedKey: '',
    groups: JSON.parse(JSON.stringify(groups)),
    description: `Done! Found ${Object.keys(groups).length} anagram groups`,
  });

  return steps;
}

const COLORS = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
  'bg-orange-500', 'bg-teal-500', 'bg-red-500', 'bg-indigo-500',
];

const PRESETS = [
  { label: 'eat, tea, tan, ate, nat, bat', value: ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'] },
  { label: 'abc, bca, cab, xyz, zyx', value: ['abc', 'bca', 'cab', 'xyz', 'zyx'] },
  { label: 'listen, silent, hello', value: ['listen', 'silent', 'hello'] },
];

export function GroupAnagramsVisualizer() {
  const [words, setWords] = useState<string[]>(['eat', 'tea', 'tan', 'ate', 'nat', 'bat']);
  const [inputValue, setInputValue] = useState('eat, tea, tan, ate, nat, bat');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const initializeSteps = useCallback(() => {
    const newSteps = generateSteps(words);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [words]);

  useEffect(() => { initializeSteps(); }, []);

  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      if (currentStep >= steps.length - 1) setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 1000 / speed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);

  const step = steps[currentStep];

  const handlePreset = (preset: string[]) => {
    setWords(preset);
    setInputValue(preset.join(', '));
    const newSteps = generateSteps(preset);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleApply = () => {
    const parsed = inputValue.split(',').map(s => s.trim().toLowerCase()).filter(s => s.length > 0);
    if (parsed.length > 0) {
      setWords(parsed);
      const newSteps = generateSteps(parsed);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  };

  const groupKeys = step ? Object.keys(step.groups) : [];
  const keyColorMap: Record<string, string> = {};
  groupKeys.forEach((key, i) => { keyColorMap[key] = COLORS[i % COLORS.length]; });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Group Anagrams</h1>
        <p className="text-slate-400">
          Sort each word to create a canonical key. Words with the same sorted key are anagrams.
          Group them using a HashMap.
        </p>
      </div>

      {/* Input Controls */}
      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <span className="text-sm text-slate-400">Presets:</span>
        {PRESETS.map((p, i) => (
          <button key={i} onClick={() => handlePreset(p.value)}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors">
            {p.label}
          </button>
        ))}
      </div>
      <div className="mb-6 flex gap-3 items-center">
        <input value={inputValue} onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleApply()}
          className="px-3 py-1.5 bg-slate-800 rounded border border-slate-600 focus:border-blue-500 outline-none text-sm font-mono flex-1"
          placeholder="e.g. eat, tea, tan, ate, nat, bat" />
        <button onClick={handleApply}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors">Apply</button>
      </div>

      {/* Words with current processing */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Input Words</h3>
        <div className="flex gap-2 justify-center flex-wrap">
          {step?.words.map((word, i) => {
            const isActive = i === step.currentIndex;
            const isProcessed = i < step.currentIndex || step.type === 'done';
            // Find the group color for processed words
            const sortedKey = word.split('').sort().join('');
            const color = isProcessed && step.groups[sortedKey] ? keyColorMap[sortedKey] : '';

            return (
              <motion.div key={i} animate={{ scale: isActive ? 1.15 : 1 }}
                className={`px-4 py-3 rounded-lg font-mono text-sm font-bold ${
                  isActive ? 'bg-yellow-500 text-black' :
                  isProcessed && color ? `${color}/70` :
                  'bg-slate-700'
                }`}>
                "{word}"
              </motion.div>
            );
          })}
        </div>
        {step?.type === 'sort' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-4 text-center">
            <span className="font-mono text-yellow-400">"{step.currentWord}"</span>
            <span className="text-slate-500 mx-2">→ sort →</span>
            <span className="font-mono text-green-400">"{step.sortedKey}"</span>
          </motion.div>
        )}
      </div>

      {/* Groups HashMap */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">
          Anagram Groups <span className="text-slate-500">(sorted key → words)</span>
        </h3>
        <div className="space-y-3 min-h-[80px]">
          {groupKeys.length === 0 && (
            <span className="text-slate-500 italic">No groups yet</span>
          )}
          {groupKeys.map((key) => {
            const color = keyColorMap[key];
            const isActiveGroup = step?.sortedKey === key && (step.type === 'sort' || step.type === 'group');
            return (
              <motion.div key={key}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  isActiveGroup ? 'ring-2 ring-yellow-400' : ''
                } bg-slate-900/50`}>
                <span className={`px-2 py-1 rounded font-mono text-xs ${color} text-white`}>
                  key: "{key}"
                </span>
                <span className="text-slate-500">→</span>
                <div className="flex gap-2 flex-wrap">
                  {step?.groups[key].map((word, wi) => (
                    <motion.span key={wi}
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className={`px-2 py-1 rounded ${color}/30 text-white font-mono text-sm`}>
                      "{word}"
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Insight */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">💡 Interview Insight</h3>
        <p className="text-sm text-slate-300">
          <strong>Two key techniques:</strong> (1) Use sorted string as hash key — simple but O(k log k) per word. 
          (2) Use character frequency count as key — O(k) per word, where k is max word length. 
          For the frequency approach, use <code className="text-blue-400">Arrays.toString(count)</code> as the map key.
          This problem tests your ability to define a <em>canonical form</em> for equivalence classes.
        </p>
      </div>

      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            step?.type === 'done' ? 'bg-green-500' :
            step?.type === 'sort' ? 'bg-yellow-500' :
            step?.type === 'group' ? 'bg-blue-500' :
            'bg-slate-500'
          }`} />
          <span className="text-lg">{step?.description || 'Ready'}</span>
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

      {/* AI Hints */}
      <Hints problemId="group-anagrams" className="mt-6" />

      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Code</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`public List<List<String>> groupAnagrams(String[] strs) {
    Map<String, List<String>> map = new HashMap<>();
    
    for (String s : strs) {
        char[] chars = s.toCharArray();
        Arrays.sort(chars);
        String key = new String(chars);
        
        map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
    }
    
    return new ArrayList<>(map.values());
}
// Time: O(n * k log k)  |  Space: O(n * k)
// where n = number of strings, k = max string length

// Alternative: frequency count key (O(n * k)):
// int[] count = new int[26];
// String key = Arrays.toString(count);`}
        </pre>
      </div>
    </div>
  );
}
