import { basename } from "node:path";
import { DOC_TRIGGER_PATTERNS } from "./constants";

export interface DocUpdateAnalysis {
  needed: boolean;
  reasons: string[];
}

/** Analyze if documentation update is required based on edited files */
export function analyzeDocUpdateNeed(editedFiles: string[]): DocUpdateAnalysis {
  const reasons: string[] = [];

  for (const file of editedFiles) {
    const fileName = basename(file);

    if (DOC_TRIGGER_PATTERNS.barrel.test(fileName)) {
      reasons.push(`Public export: ${fileName}`);
    }

    if (DOC_TRIGGER_PATTERNS.api.test(fileName)) {
      reasons.push(`API contract: ${fileName}`);
    }

    if (DOC_TRIGGER_PATTERNS.config.test(fileName)) {
      reasons.push(`Configuration: ${fileName}`);
    }

    if (DOC_TRIGGER_PATTERNS.hook.test(file)) {
      reasons.push(`Hook: ${fileName}`);
    }

    if (DOC_TRIGGER_PATTERNS.component.test(file)) {
      reasons.push(`Component: ${fileName}`);
    }

    if (DOC_TRIGGER_PATTERNS.slice.test(fileName)) {
      reasons.push(`State slice: ${fileName}`);
    }

    if (DOC_TRIGGER_PATTERNS.context.test(fileName)) {
      reasons.push(`Context: ${fileName}`);
    }
  }

  return {
    needed: reasons.length > 0,
    reasons: [...new Set(reasons)],
  };
}
