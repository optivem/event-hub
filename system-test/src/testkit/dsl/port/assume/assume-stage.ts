import type { AssumeRunning } from './steps/assume-running.js';

export interface AssumeStage {
  eventhub(): AssumeRunning;
  erp(): AssumeRunning;
  tax(): AssumeRunning;
  clock(): AssumeRunning;
}
