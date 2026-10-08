import { randomInt } from 'node:crypto';

/**
 * Beta Code Generator Utility
 *
 * Use this utility to generate new random 6-digit beta codes
 * Run with: npx tsx src/lib/utils/generate-beta-codes.ts
 */

function generateBetaCode(): string {
  return randomInt(100000, 1_000_000).toString();
}

function generateUniqueBetaCodes(count: number): string[] {
  const codes = new Set<string>();

  while (codes.size < count) {
    codes.add(generateBetaCode());
  }

  return Array.from(codes).sort();
}

// Generate 10 unique codes
const codes = generateUniqueBetaCodes(10);

console.log('Generated Beta Access Codes:');
console.log('============================');
codes.forEach((code, index) => {
  console.log(`${index + 1}. ${code}`);
});

console.log('\nAdd to your untracked .env.local or deployment secret manager:');
console.log('==============================================================');
console.log(`BETA_ACCESS_CODES='${codes.join(',')}'`);
