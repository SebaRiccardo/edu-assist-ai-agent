/**
 * Beta Code Generator Utility
 *
 * Use this utility to generate new random 6-digit beta codes
 * Run with: npx tsx src/lib/utils/generate-beta-codes.ts
 */

function generateBetaCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
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

console.log('\nCopy to src/lib/beta-access.ts:');
console.log('============================');
console.log('export const VALID_BETA_CODES = [');
codes.forEach(code => {
  console.log(`  '${code}',`);
});
console.log('];');
