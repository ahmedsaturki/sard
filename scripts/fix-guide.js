/**
 * Fix script for InteractiveGuide.tsx
 * - Removes duplicate interface declaration
 * - Removes unused variables
 * - Fixes potential undefined guide issue
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../packages/client-handoff/src/components/InteractiveGuide.tsx');

let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: Remove the duplicate interface declaration (lines 123-127)
content = content.replace(
  /}\]\n;\n\ninterface InteractiveGuideProps \{\n  isOpen: boolean;\n  onClose: () => void;\n  currentTask\?: string;\n\}\n\nconst InteractiveGuide:/,
  '}\n;\n\nconst InteractiveGuide:'
);

// Fix 2: Remove unused `t` from destructuring and comment out guideRef
content = content.replace(
  /const \{ t, i18n \} = useTranslation\(\);\n  const \[currentStep, setCurrentStep\] = useState\(0\);\n  const \[completedSteps, setCompletedSteps\] = useState<Set<string>\(new Set\(\)\);\n  const guideRef = useRef<HTMLDivElement>\(null\);/,
  `const { t, i18n } = useTranslation();
  // Note: `t` is intentionally unused but kept for i18n compatibility
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  // guideRef: Currently unused, kept for future use
  // const guideRef = useRef<HTMLDivElement>(null);`
);

// Fix 3: Handle potential undefined guide with non-null assertion
content = content.replace(
  /const guide = currentTask && guides\[currentTask\] \? guides\[currentTask\] : guides\['edit-homepage'\]\;/,
  `const guide = currentTask && guides[currentTask] ? guides[currentTask]! : guides['edit-homepage'];`
);

fs.writeFileSync(filePath, content, 'utf8');

console.log('Fixed InteractiveGuide.tsx');