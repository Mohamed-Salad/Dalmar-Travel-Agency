/**
 * Self-check for quoteCapture.ts. No test runner is configured in this
 * project, so this is a plain assert-based script instead of a real test
 * suite. Run it from a page served by the Vite dev server (`npm run dev`),
 * in the browser console:
 *   const { runSelfCheck } = await import('/src/lib/quoteCapture.selfcheck.ts');
 *   runSelfCheck();
 * (Plain `node` can't run this directly — Node's ESM resolver requires
 * every relative import to carry an explicit extension, which the rest of
 * this Vite-bundled codebase deliberately doesn't do.)
 */
import { parseQuickCapture } from './quoteCapture';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

function check1_basicFields() {
  const r = parseQuickCapture('Maryan Warsame\n0615123456\nMogadishu to Nairobi\n2A 1Y 1C');
  assert(r.fields.customerName === 'Maryan Warsame', 'customerName');
  assert(r.fields.phone === '0615123456', 'phone');
  assert(r.fields.from === 'Mogadishu', 'from');
  assert(r.fields.to === 'Nairobi', 'to');
  assert(r.fields.adults === 2, 'adults');
  assert(r.fields.youth === 1, 'youth');
  assert(r.fields.children === 1, 'children');
  assert(r.leftoverLines.length === 0, 'no leftover lines');
}

function check2_dateRangeIsDeparture() {
  const r = parseQuickCapture('10-15 Sept');
  assert(/^\d{4}-09-10$/.test(String(r.fields.earlyDep)), `earlyDep got ${r.fields.earlyDep}`);
  assert(/^\d{4}-09-15$/.test(String(r.fields.lateDep)), `lateDep got ${r.fields.lateDep}`);
}

function check3_returnPrefixRoutesToReturnFields() {
  const r = parseQuickCapture('return 20-25 Sept');
  assert(/^\d{4}-09-20$/.test(String(r.fields.earlyRet)), `earlyRet got ${r.fields.earlyRet}`);
  assert(/^\d{4}-09-25$/.test(String(r.fields.lateRet)), `lateRet got ${r.fields.lateRet}`);
  assert(r.fields.earlyDep === undefined, 'earlyDep should be untouched');
}

function check4_unmatchedLineGoesToLeftovers() {
  const r = parseQuickCapture('needs wheelchair assistance at gate', { customerNameAlreadySet: true });
  assert(r.leftoverLines.length === 1 && r.leftoverLines[0] === 'needs wheelchair assistance at gate', 'leftover line preserved');
  assert(r.fields.customerName === undefined, 'customerName should not be set');
}

function check5_nameFallbackGuardedByFlag() {
  const r = parseQuickCapture('some unmatched note', { customerNameAlreadySet: true });
  assert(!r.matched.has('customerName'), 'fallback must not fire when name already set');
}

export function runSelfCheck(): { passed: number; failed: number; results: string[] } {
  const checks = [check1_basicFields, check2_dateRangeIsDeparture, check3_returnPrefixRoutesToReturnFields, check4_unmatchedLineGoesToLeftovers, check5_nameFallbackGuardedByFlag];
  const results: string[] = [];
  let failed = 0;
  for (const check of checks) {
    try {
      check();
      results.push(`ok - ${check.name}`);
    } catch (err) {
      failed++;
      results.push(`FAIL - ${check.name}: ${(err as Error).message}`);
    }
  }
  results.forEach((r) => (r.startsWith('FAIL') ? console.error(r) : console.log(r)));
  return { passed: checks.length - failed, failed, results };
}
