import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Controls } from '../components/Controls';

interface Step {
  type: 'start' | 'push' | 'operate' | 'done';
  tokens: string[];
  currentIndex: number;
  stack: number[];
  currentToken: string;
  operation?: {
    operator: string;
    operand1: number;
    operand2: number;
    result: number;
  };
  result?: number;
  description: string;
}

function isOperator(token: string): boolean {
  return ['+', '-', '*', '/'].includes(token);
}

function performOperation(operator: string, b: number, a: number): number {
  switch (operator) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      return Math.trunc(a / b); // Integer division truncates toward zero
    default:
      throw new Error(`Unknown operator: ${operator}`);
  }
}

function generateSteps(tokens: string[]): Step[] {
  const steps: Step[] = [];
  const stack: number[] = [];
  
  steps.push({
    type: 'start',
    tokens,
    currentIndex: -1,
    stack: [...stack],
    currentToken: '',
    description: `Starting evaluation of RPN expression: [${tokens.join(', ')}]. We'll use a stack to process tokens left to right.`,
  });
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    if (isOperator(token)) {
      // Pop two operands, perform operation, push result
      if (stack.length < 2) {
        throw new Error(`Not enough operands for operator ${token}`);
      }
      
      const operand2 = stack.pop()!; // Second operand (top of stack)
      const operand1 = stack.pop()!; // First operand
      const result = performOperation(token, operand2, operand1);
      
      steps.push({
        type: 'operate',
        tokens,
        currentIndex: i,
        stack: [...stack], // Stack before pushing result
        currentToken: token,
        operation: {
          operator: token,
          operand1,
          operand2,
          result,
        },
        description: `Found operator '${token}'. Pop ${operand2} and ${operand1} from stack. Calculate: ${operand1} ${token} ${operand2} = ${result}`,
      });
      
      stack.push(result);
    } else {
      // Push number to stack
      const number = parseInt(token);
      stack.push(number);
      
      steps.push({
        type: 'push',
        tokens,
        currentIndex: i,
        stack: [...stack],
        currentToken: token,
        description: `Found number '${token}'. Push ${number} onto the stack.`,
      });
    }
  }
  
  // Final result
  if (stack.length !== 1) {
    throw new Error('Invalid RPN expression');
  }
  
  steps.push({
    type: 'done',
    tokens,
    currentIndex: tokens.length - 1,
    stack: [...stack],
    currentToken: '',
    result: stack[0],
    description: `✅ Evaluation complete! The final result is ${stack[0]}.`,
  });
  
  return steps;
}

const testCases = [
  {
    tokens: ['2', '1', '+', '3', '*'],
    description: 'Basic arithmetic: (2 + 1) * 3 = 9'
  },
  {
    tokens: ['4', '13', '5', '/', '+'],
    description: 'Division: 4 + (13 / 5) = 6'
  },
  {
    tokens: ['10', '6', '9', '3', '+', '-11', '*', '/', '*', '17', '+', '5', '+'],
    description: 'Complex expression from LeetCode'
  },
  {
    tokens: ['3', '4', '+', '2', '*', '7', '/'],
    description: 'Multiple operations: ((3 + 4) * 2) / 7 = 2'
  },
  {
    tokens: ['15', '7', '1', '1', '+', '/', '/', '3', '/', '2', '1', '1', '+', '+', '-'],
    description: 'Nested operations with negative result'
  },
];

export function EvaluateReversePolishNotationVisualizer() {
  const [tokens, setTokens] = useState(testCases[0].tokens);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const initializeSteps = useCallback(() => {
    try {
      if (tokens.length > 0 && tokens.length <= 20) {
        const newSteps = generateSteps(tokens);
        setSteps(newSteps);
        setCurrentStep(0);
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error generating steps:', error);
      setSteps([]);
    }
  }, [tokens]);
  
  useEffect(() => {
    initializeSteps();
  }, [initializeSteps]);
  
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / speed);
    
    return () => clearInterval(interval);
  }, [isPlaying, speed, steps.length]);
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleStepForward = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handleStepBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };
  
  const currentStepData = steps[currentStep];
  
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Evaluate Reverse Polish Notation</h1>
        <p className="text-slate-400 max-w-3xl mx-auto">
          Reverse Polish Notation (RPN) places operators after operands: "3 4 +" means "3 + 4".
          Use a stack to evaluate: push numbers, pop two for operators, push the result back.
        </p>
      </div>
      
      {/* Test Cases */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testCases.map((testCase, index) => (
          <button
            key={index}
            onClick={() => {
              setTokens(testCase.tokens);
              setIsPlaying(false);
            }}
            className={`p-4 rounded-lg border text-left transition-all ${
              JSON.stringify(tokens) === JSON.stringify(testCase.tokens)
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-600 hover:border-slate-500'
            }`}
          >
            <div className="font-medium text-sm mb-2">{testCase.description}</div>
            <div className="text-xs text-slate-400 font-mono">
              [{testCase.tokens.join(', ')}]
            </div>
          </button>
        ))}
      </div>
      
      {/* Controls */}
      <Controls
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onStepBack={handleStepBack}
        onStepForward={handleStepForward}
        onReset={handleReset}
        currentStep={currentStep}
        totalSteps={steps.length}
        speed={speed}
        onSpeedChange={setSpeed}
        canStepBack={currentStep > 0}
        canStepForward={currentStep < steps.length - 1}
      />
      
      {/* Current Operation Display */}
      {currentStepData && (
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-semibold text-blue-400">
              {currentStepData.currentToken && `Processing: ${currentStepData.currentToken}`}
            </span>
            {currentStepData.result !== undefined && (
              <span className="text-green-400 font-mono text-lg">
                Final Result: {currentStepData.result}
              </span>
            )}
          </div>
          <p className="text-slate-300">{currentStepData.description}</p>
          
          {/* Operation Details */}
          {currentStepData.operation && (
            <div className="mt-3 p-3 bg-slate-700 rounded-lg">
              <div className="text-center">
                <span className="text-orange-400 font-mono text-lg">
                  {currentStepData.operation.operand1}
                </span>
                <span className="text-yellow-400 font-mono text-lg mx-2">
                  {currentStepData.operation.operator}
                </span>
                <span className="text-orange-400 font-mono text-lg">
                  {currentStepData.operation.operand2}
                </span>
                <span className="text-white font-mono text-lg mx-2">=</span>
                <span className="text-green-400 font-mono text-lg">
                  {currentStepData.operation.result}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Tokens Array Visualization */}
      {currentStepData && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-white">Input Tokens</h3>
          <div className="flex gap-2 justify-center flex-wrap">
            {currentStepData.tokens.map((token, index) => {
              const isCurrentToken = index === currentStepData.currentIndex;
              const isProcessed = index < currentStepData.currentIndex;
              const isOperator = ['+', '-', '*', '/'].includes(token);
              
              return (
                <motion.div
                  key={index}
                  className={`w-16 h-16 rounded-lg flex items-center justify-center font-bold text-lg border-2 ${
                    isCurrentToken 
                      ? 'bg-yellow-500 text-black border-yellow-400 shadow-lg' 
                      : isProcessed 
                        ? 'bg-slate-600 text-slate-300 border-slate-500'
                        : isOperator
                          ? 'bg-slate-700 text-purple-400 border-purple-500'
                          : 'bg-slate-700 text-blue-400 border-blue-500'
                  }`}
                  animate={{ 
                    scale: isCurrentToken ? 1.1 : 1,
                    rotateY: isCurrentToken ? [0, 180, 0] : 0
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {token}
                </motion.div>
              );
            })}
          </div>
          <div className="mt-4 text-center">
            <span className="text-sm text-slate-400">
              Index: {currentStepData.currentIndex >= 0 ? currentStepData.currentIndex : 'Starting'}
            </span>
          </div>
        </div>
      )}
      
      {/* Stack Visualization */}
      {currentStepData && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-white text-center">Stack</h3>
          <div className="flex flex-col items-center min-h-[300px] justify-end">
            <div className="text-xs text-slate-500 mb-2">Top</div>
            <AnimatePresence mode="popLayout">
              {currentStepData.stack
                .slice() // Create copy to avoid mutating original
                .reverse() // Display stack with top at the top
                .map((value, displayIndex) => {
                  const actualIndex = currentStepData.stack.length - 1 - displayIndex;
                  const isNewlyAdded = currentStepData.type === 'push' && actualIndex === currentStepData.stack.length - 1;
                  const isOperand = currentStepData.operation && 
                    (value === currentStepData.operation.operand1 || value === currentStepData.operation.operand2);
                  
                  return (
                    <motion.div
                      key={`${value}-${actualIndex}-${currentStep}`}
                      initial={{ opacity: 0, scale: 0.5, y: 20 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        backgroundColor: 
                          isNewlyAdded
                            ? '#10b981' // green for newly pushed
                            : isOperand && currentStepData.type === 'operate'
                            ? '#f97316' // orange for operands being used
                            : '#374151', // default gray
                      }}
                      exit={{ 
                        opacity: 0, 
                        scale: 0.5, 
                        y: -20,
                        backgroundColor: '#f97316'
                      }}
                      transition={{ duration: 0.3 }}
                      className="w-20 h-14 rounded border-2 border-slate-500 flex items-center justify-center text-white font-bold text-lg mb-2"
                      style={{ zIndex: displayIndex + 1 }}
                    >
                      {value}
                    </motion.div>
                  );
                })}
            </AnimatePresence>
            {currentStepData.stack.length === 0 && (
              <div className="text-slate-500 text-sm italic pt-8">Empty Stack</div>
            )}
            <div className="w-24 h-3 bg-slate-600 rounded-b-lg mt-2" />
            <div className="text-xs text-slate-500 mt-2">Bottom</div>
            <div className="text-sm text-slate-400 mt-2">
              Size: {currentStepData.stack.length}
            </div>
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="font-semibold mb-3">Color Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-sm">Current Token</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm">Newly Added</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-sm">Operands in Use</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-sm">Operators</span>
          </div>
        </div>
      </div>
      
      {/* Algorithm Steps */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="font-semibold mb-3 text-white">Algorithm Steps</h3>
        <div className="space-y-2 text-sm">
          <div className={`flex items-center gap-2 ${currentStepData?.type === 'start' ? 'text-blue-400' : 'text-slate-500'}`}>
            <div className={`w-2 h-2 rounded-full ${currentStepData?.type === 'start' ? 'bg-blue-400' : 'bg-slate-600'}`} />
            1. Initialize an empty stack
          </div>
          <div className={`flex items-center gap-2 ${currentStepData?.type === 'push' ? 'text-blue-400' : 'text-slate-500'}`}>
            <div className={`w-2 h-2 rounded-full ${currentStepData?.type === 'push' ? 'bg-blue-400' : 'bg-slate-600'}`} />
            2. For numbers: push onto stack
          </div>
          <div className={`flex items-center gap-2 ${currentStepData?.type === 'operate' ? 'text-blue-400' : 'text-slate-500'}`}>
            <div className={`w-2 h-2 rounded-full ${currentStepData?.type === 'operate' ? 'bg-blue-400' : 'bg-slate-600'}`} />
            3. For operators: pop two operands, compute result, push back
          </div>
          <div className={`flex items-center gap-2 ${currentStepData?.type === 'done' ? 'text-green-400' : 'text-slate-500'}`}>
            <div className={`w-2 h-2 rounded-full ${currentStepData?.type === 'done' ? 'bg-green-400' : 'bg-slate-600'}`} />
            4. Final stack top is the result
          </div>
        </div>
      </div>
      
      {/* Java Code Example */}
      <div className="bg-slate-900 rounded-lg p-4">
        <h3 className="font-semibold mb-3 text-white">Java Implementation</h3>
        <pre className="text-sm text-slate-300 overflow-x-auto">
{`public int evalRPN(String[] tokens) {
    Stack<Integer> stack = new Stack<>();
    
    for (String token : tokens) {
        if (isOperator(token)) {
            // Pop two operands (order matters for - and /)
            int operand2 = stack.pop();
            int operand1 = stack.pop();
            
            int result = performOperation(token, operand1, operand2);
            stack.push(result);
        } else {
            // Push number onto stack
            stack.push(Integer.parseInt(token));
        }
    }
    
    return stack.pop(); // Final result
}

private boolean isOperator(String token) {
    return token.equals("+") || token.equals("-") || 
           token.equals("*") || token.equals("/");
}

private int performOperation(String op, int a, int b) {
    switch (op) {
        case "+": return a + b;
        case "-": return a - b;
        case "*": return a * b;
        case "/": return a / b;  // Integer division
        default: throw new IllegalArgumentException("Invalid operator");
    }
}

// Time Complexity: O(n) - process each token once
// Space Complexity: O(n) - stack can hold up to n/2 numbers`}
        </pre>
        
        <div className="mt-4 p-3 bg-slate-800 rounded-lg">
          <h4 className="text-xs font-semibold text-slate-400 mb-2">🎯 Key Points</h4>
          <ul className="text-xs text-slate-300 space-y-1">
            <li>• RPN eliminates the need for parentheses - order is implicit</li>
            <li>• Stack naturally handles the "last operator first" evaluation</li>
            <li>• Watch out for operand order in subtraction and division</li>
            <li>• Integer division truncates toward zero (important for negative results)</li>
            <li>• Each valid RPN expression has exactly one result</li>
          </ul>
        </div>
      </div>
    </div>
  );
}