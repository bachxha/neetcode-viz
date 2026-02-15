# AI Hints System

## Overview
The AI Hints system provides progressive, 3-level hints for algorithm problems to help users learn problem-solving patterns without immediately revealing the solution.

## Features

### Progressive Hint System
- **Level 1 - Nudge (🤔)**: Gentle hint that guides thinking without revealing approach
- **Level 2 - Approach (💡)**: Explains the general algorithmic approach and data structures needed  
- **Level 3 - Near Solution (🎯)**: Step-by-step breakdown close to the actual implementation

### UI Features
- **Collapsible Interface**: Clean, non-intrusive design that doesn't interrupt the main visualization
- **Progressive Revealing**: Click "Show Next Hint" to reveal hints one at a time
- **Progress Indicator**: Visual progress bar showing how many hints have been revealed
- **Reset Functionality**: Reset to start over with hints
- **Smooth Animations**: Framer Motion animations for smooth user experience

### Integrated Problems
Currently integrated into 7 key visualizers:
1. **Two Sum** - HashMap complement lookup pattern
2. **Valid Parentheses** - Stack-based matching algorithm
3. **Binary Search** - Divide and conquer on sorted arrays
4. **Contains Duplicate** - HashSet existence checking
5. **Best Time to Buy and Sell Stock** - Single-pass sliding window
6. **Longest Substring Without Repeating Characters** - Two-pointer sliding window
7. **Group Anagrams** - HashMap with sorted keys

### Hint Data Structure
Located in `src/data/hints.ts`:
- **11 problems total** with complete hint sets
- **Type-safe interfaces** for hints and problem data
- **Helper functions** for easy integration
- **Extensible design** for adding more problems

## Usage

### For Users
1. Navigate to any supported problem visualizer
2. Look for the "AI Hints" section (collapsible box with lightbulb icon)
3. Click to expand and see the first hint
4. Use "Show Next Hint" to progressively reveal more detailed guidance
5. Use "Reset" to start over with the hints

### For Developers
To add hints to a new visualizer:

1. **Import the component**:
```tsx
import { Hints } from '../components/Hints';
```

2. **Add the component** to your visualizer JSX:
```tsx
<Hints problemId="your-problem-id" className="mt-6" />
```

3. **Add hint data** to `src/data/hints.ts`:
```tsx
{
  problemId: 'your-problem-id',
  problemName: 'Your Problem Name',
  hints: [
    {
      level: 'nudge',
      title: 'Think about...',
      content: 'Gentle guidance...',
      icon: '🤔'
    },
    // ... approach and near-solution hints
  ]
}
```

### Future Enhancements
- Add hints for remaining 30+ visualizers
- Difficulty-based hint complexity adjustment
- User progress tracking
- Custom hint preferences
- Integration with learning paths

## Technical Implementation
- **React + TypeScript** for type safety
- **Framer Motion** for smooth animations
- **Tailwind CSS** for consistent styling
- **Modular design** for easy maintenance and extension
- **Zero dependencies** beyond existing project stack

The hints system enhances the learning experience by providing just-enough guidance to help users develop problem-solving intuition without spoiling the discovery process.