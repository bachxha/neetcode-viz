import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'encode' | 'encode-done' | 'decode-scan' | 'decode-extract' | 'done';
  strings: string[];
  encoded: string;
  decoded: string[];
  currentStringIndex: number;
  encodedHighlight: [number, number] | null; // [start, end] of highlighted portion
  description: string;
}

function generateSteps(strs: string[]): Step[] {
  const steps: Step[] = [];

  steps.push({
    type: 'start',
    strings: strs,
    encoded: '',
    decoded: [],
    currentStringIndex: -1,
    encodedHighlight: null,
    description: `Encode ${strs.length} strings, then decode back. Format: "length#string"`,
  });

  // Encoding phase
  let encoded = '';
  for (let i = 0; i < strs.length; i++) {
    const part = `${strs[i].length}#${strs[i]}`;
    const startPos = encoded.length;
    encoded += part;
    steps.push({
      type: 'encode',
      strings: strs,
      encoded,
      decoded: [],
      currentStringIndex: i,
      encodedHighlight: [startPos, encoded.length],
      description: `Encode "${strs[i]}" → "${strs[i].length}#${strs[i]}"`,
    });
  }

  steps.push({
    type: 'encode-done',
    strings: strs,
    encoded,
    decoded: [],
    currentStringIndex: strs.length,
    encodedHighlight: null,
    description: `Encoding complete: "${encoded}"`,
  });

  // Decoding phase
  const decoded: string[] = [];
  let pos = 0;
  let decodeIdx = 0;
  while (pos < encoded.length) {
    const hashPos = encoded.indexOf('#', pos);
    const len = parseInt(encoded.substring(pos, hashPos));

    steps.push({
      type: 'decode-scan',
      strings: strs,
      encoded,
      decoded: [...decoded],
      currentStringIndex: decodeIdx,
      encodedHighlight: [pos, hashPos + 1],
      description: `Read length: "${encoded.substring(pos, hashPos)}" → need ${len} characters after '#'`,
    });

    const str = encoded.substring(hashPos + 1, hashPos + 1 + len);
    decoded.push(str);

    steps.push({
      type: 'decode-extract',
      strings: strs,
      encoded,
      decoded: [...decoded],
      currentStringIndex: decodeIdx,
      encodedHighlight: [hashPos + 1, hashPos + 1 + len],
      description: `Extract ${len} chars: "${str}" → decoded: [${decoded.map(s => `"${s}"`).join(', ')}]`,
    });

    pos = hashPos + 1 + len;
    decodeIdx++;
  }

  steps.push({
    type: 'done',
    strings: strs,
    encoded,
    decoded: [...decoded],
    currentStringIndex: strs.length,
    encodedHighlight: null,
    description: `Decode complete! Original: [${strs.map(s => `"${s}"`).join(', ')}] ✓`,
  });

  return steps;
}

const PRESETS = [
  { label: 'hello, world', value: ['hello', 'world'] },
  { label: 'lint, code, love, you', value: ['lint', 'code', 'love', 'you'] },
  { label: 'we, say, :, yes', value: ['we', 'say', ':', 'yes'] },
  { label: '(empty string), hi', value: ['', 'hi'] },
];

export function EncodeDecodeVisualizer() {
  const [strings, setStrings] = useState<string[]>(['hello', 'world']);
  const [inputValue, setInputValue] = useState('hello, world');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const initializeSteps = useCallback(() => {
    const newSteps = generateSteps(strings);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [strings]);

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
    setStrings(preset);
    setInputValue(preset.join(', '));
    const newSteps = generateSteps(preset);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleApply = () => {
    const parsed = inputValue.split(',').map(s => s.trim());
    if (parsed.length > 0) {
      setStrings(parsed);
      const newSteps = generateSteps(parsed);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  };

  const isEncoding = step?.type === 'start' || step?.type === 'encode' || step?.type === 'encode-done';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Encode and Decode Strings</h1>
        <p className="text-slate-400">
          Design an algorithm to encode a list of strings to a single string, then decode it back.
          Use the format: <code className="text-blue-400">length#string</code> for each entry.
        </p>
      </div>

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
          placeholder="e.g. hello, world" />
        <button onClick={handleApply}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors">Apply</button>
      </div>

      {/* Phase indicator */}
      <div className="flex gap-4 mb-6">
        <div className={`flex-1 p-3 rounded-lg text-center font-semibold ${
          isEncoding ? 'bg-blue-500/20 text-blue-400 ring-2 ring-blue-500' : 'bg-slate-800 text-slate-500'
        }`}>📤 Encode Phase</div>
        <div className={`flex-1 p-3 rounded-lg text-center font-semibold ${
          !isEncoding ? 'bg-purple-500/20 text-purple-400 ring-2 ring-purple-500' : 'bg-slate-800 text-slate-500'
        }`}>📥 Decode Phase</div>
      </div>

      {/* Original Strings */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Original Strings</h3>
        <div className="flex gap-2 justify-center flex-wrap">
          {step?.strings.map((s, i) => {
            const isActive = step.type === 'encode' && i === step.currentStringIndex;
            const isProcessed = step.type === 'encode' && i < step.currentStringIndex;
            const isDone = step.type !== 'start' && step.type !== 'encode';
            return (
              <motion.div key={i} animate={{ scale: isActive ? 1.1 : 1 }}
                className={`px-4 py-3 rounded-lg font-mono text-sm ${
                  isActive ? 'bg-yellow-500 text-black font-bold' :
                  isProcessed || isDone ? 'bg-blue-500/60' :
                  'bg-slate-700'
                }`}>
                "{s}" <span className="text-xs opacity-70">len={s.length}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Encoded String */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Encoded String</h3>
        <div className="font-mono text-lg flex flex-wrap justify-center min-h-[40px] items-center">
          {step && step.encoded.length === 0 && (
            <span className="text-slate-500 italic">Building...</span>
          )}
          {step && step.encoded.split('').map((ch, i) => {
            const isHighlighted = step.encodedHighlight &&
              i >= step.encodedHighlight[0] && i < step.encodedHighlight[1];
            return (
              <motion.span key={i}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`inline-block ${
                  isHighlighted
                    ? (isEncoding ? 'bg-yellow-500/40 text-yellow-300' : 'bg-purple-500/40 text-purple-300')
                    : ch === '#' ? 'text-red-400' : 'text-slate-300'
                }`}>
                {ch}
              </motion.span>
            );
          })}
        </div>
        <div className="mt-2 text-center text-xs text-slate-500">
          Format: <span className="text-blue-400">length</span><span className="text-red-400">#</span><span className="text-green-400">string</span>
        </div>
      </div>

      {/* Decoded Strings */}
      {!isEncoding && (
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">Decoded Strings</h3>
          <div className="flex gap-2 justify-center flex-wrap min-h-[40px] items-center">
            {step?.decoded.length === 0 && (
              <span className="text-slate-500 italic">Decoding...</span>
            )}
            {step?.decoded.map((s, i) => (
              <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="px-4 py-3 rounded-lg font-mono text-sm bg-green-500/60">
                "{s}"
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Insight */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">💡 Interview Insight</h3>
        <p className="text-sm text-slate-300">
          <strong>Why length#string?</strong> Any delimiter could appear inside the strings themselves.
          By prefixing with the length, we know exactly how many characters to read — no ambiguity.
          This is how real protocols work (HTTP Content-Length, protocol buffers). 
          Alternative: use an escape character, but that's more complex. The length-prefix approach 
          is clean, O(n), and handles all edge cases including empty strings.
        </p>
      </div>

      {/* Status */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            step?.type === 'done' ? 'bg-green-500' :
            isEncoding ? 'bg-blue-500' :
            'bg-purple-500'
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

      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Java Code</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`public String encode(List<String> strs) {
    StringBuilder sb = new StringBuilder();
    for (String s : strs) {
        sb.append(s.length()).append('#').append(s);
    }
    return sb.toString();
}

public List<String> decode(String s) {
    List<String> result = new ArrayList<>();
    int i = 0;
    while (i < s.length()) {
        int hashIdx = s.indexOf('#', i);
        int len = Integer.parseInt(s.substring(i, hashIdx));
        String str = s.substring(hashIdx + 1, hashIdx + 1 + len);
        result.add(str);
        i = hashIdx + 1 + len;
    }
    return result;
}
// Time: O(n)  |  Space: O(n) where n = total chars`}
        </pre>
      </div>
    </div>
  );
}
