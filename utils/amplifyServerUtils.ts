import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import outputs from '@/amplify_outputs.json';

// Create server runner for Amplify Gen2
export const { runWithAmplifyServerContext } = createServerRunner({
  config: outputs
});