// NOTE: Data draw from GreenPixie Energy Calculator

export const MODELS = {
  haiku: { input: 0.000004, output: 0.000012, time: 0.2 },
  sonnet: { input: 0.000012, output: 0.000036, time: 0.6 },
  opus: { input: 0.00002, output: 0.00006, time: 1.0 },
  //fill in more models including gemini, and GPT 

} as const;
