const API_BASE = process.env.API_BASE || 'http://localhost:3001';

interface PaymentItem {
  amount: number;
  token: 'SOL' | 'USDC';
}

interface ParseResult {
  type: 'payment' | 'text' | 'payment_error';
  items?: PaymentItem[];
  recipient?: { userId: number; username: string } | null;
  error?: string;
}

let authToken = '';
let secondUsername = '';

async function setup(): Promise<boolean> {
  const uniqueId = `test${Date.now()}`;
  const password = 'TestPassword123!';

  try {
    const signupRes = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: uniqueId, password }),
    });
    if (signupRes.ok) {
      const data = await signupRes.json();
      authToken = data.token;
    } else {
      return false;
    }

    secondUsername = `testrecipient${Date.now()}`;
    const signup2Res = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: secondUsername, password }),
    });
    if (!signup2Res.ok) {
      console.error('Failed to create second test user');
      return false;
    }

    return true;
  } catch (err) {
    console.error('Setup error:', err);
  }
  return false;
}

async function parseIntent(message: string): Promise<ParseResult> {
  const res = await fetch(`${API_BASE}/api/chat/parse-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }

  return res.json();
}

interface TestCase {
  message: string;
  expectedType: 'payment' | 'text' | 'payment_error';
  expectedItems?: Array<{ amount?: number; token?: string }>;
  expectRecipientExtracted?: boolean;
  expectRecipientNotFound?: boolean;
  expectSendAll?: boolean;
  description: string;
}

const testCases: TestCase[] = [
  { message: 'send 100 usdc', expectedType: 'payment', expectedItems: [{ amount: 100, token: 'USDC' }], description: 'Simple USDC send' },
  { message: 'send 0.5 sol', expectedType: 'payment', expectedItems: [{ amount: 0.5, token: 'SOL' }], description: 'Simple SOL send' },
  { message: 'transfer 50 usdc and 2 sol', expectedType: 'payment', expectedItems: [{ token: 'USDC' }, { token: 'SOL' }], description: 'Multi-token transfer' },
  { message: 'wire 100 usdc', expectedType: 'payment', expectedItems: [{ amount: 100, token: 'USDC' }], description: 'Wire keyword' },
  { message: 'deposit 10 sol', expectedType: 'payment', expectedItems: [{ amount: 10, token: 'SOL' }], description: 'Deposit keyword' },
  { message: 'forward 20 usdc', expectedType: 'payment', expectedItems: [{ amount: 20, token: 'USDC' }], description: 'Forward keyword' },
  { message: 'please send 5 sol', expectedType: 'payment', expectedItems: [{ amount: 5, token: 'SOL' }], description: 'Polite send request' },
  { message: 'pay 25 usdc', expectedType: 'payment', expectedItems: [{ amount: 25, token: 'USDC' }], description: 'Pay keyword' },
  { message: 'I want to pay 100 usdc', expectedType: 'payment', expectedItems: [{ amount: 100, token: 'USDC' }], description: 'Conversational pay' },
  { message: 'can you send 10 usdc and 0.5 sol?', expectedType: 'payment', expectedItems: [{ amount: 10, token: 'USDC' }, { amount: 0.5, token: 'SOL' }], description: 'English multi-token with question mark' },
  { message: 'i need you to send 100 usdc and 1 sol', expectedType: 'payment', expectedItems: [{ amount: 100, token: 'USDC' }, { amount: 1, token: 'SOL' }], description: 'Complex English multi-token' },
  { message: 'please transfer 50 usdc', expectedType: 'payment', expectedItems: [{ amount: 50, token: 'USDC' }], description: 'Polite transfer' },
  { message: 'send 10 sol to them', expectedType: 'payment', expectedItems: [{ amount: 10, token: 'SOL' }], description: 'Informal send with pronoun' },
  { message: 'send 10', expectedType: 'payment', expectedItems: [{ amount: 10, token: 'USDC' }], description: 'No token defaults to USDC' },
  { message: 'transfer 0.001 sol', expectedType: 'payment', expectedItems: [{ amount: 0.001, token: 'SOL' }], description: 'Small decimal amount' },
  { message: 'give 5 sol', expectedType: 'payment', expectedItems: [{ amount: 5, token: 'SOL' }], description: 'Give keyword' },
  { message: 'tip 1 usdc', expectedType: 'payment', expectedItems: [{ amount: 1, token: 'USDC' }], description: 'Tip keyword' },
  { message: 'i need you sending my balance 100 usdc and 1 solana', expectedType: 'payment', expectedItems: [{ amount: 100, token: 'USDC' }, { amount: 1, token: 'SOL' }], description: 'Complex natural language from task spec' },

  { message: 'send 50 usdc to @nonexistent_user_xyz_abc_999', expectedType: 'payment_error', expectRecipientNotFound: true, description: '@mention with non-existent user returns payment_error' },

  { message: 'send all my sol', expectedType: 'payment', expectSendAll: true, description: 'Send all SOL triggers balance resolution' },
  { message: 'send everything', expectedType: 'payment', expectSendAll: true, description: 'Send everything triggers balance resolution for both tokens' },
  { message: 'send my entire sol balance', expectedType: 'payment', expectSendAll: true, description: 'Send entire balance phrasing' },

  { message: 'how are you?', expectedType: 'text', description: 'Casual greeting - not payment' },
  { message: "what's my balance?", expectedType: 'text', description: 'Balance inquiry - not payment' },
  { message: 'hello there', expectedType: 'text', description: 'Greeting - not payment' },
  { message: 'can you help me?', expectedType: 'text', description: 'Help request - not payment' },
  { message: 'nice to meet you', expectedType: 'text', description: 'Social - not payment' },
  { message: 'thanks for the info', expectedType: 'text', description: 'Thank you - not payment' },
  { message: 'envoyer 50 usdc', expectedType: 'text', description: 'Non-English (French) payment keyword treated as plain text' },
  { message: 'senden 10 sol', expectedType: 'text', description: 'Non-English (German) payment keyword treated as plain text' },
  { message: 'por favor transferir 20 usdc', expectedType: 'text', description: 'Non-English (Spanish) phrase treated as plain text' },
  { message: 'I like crypto', expectedType: 'text', description: 'Crypto mention without payment intent' },
  { message: 'good morning', expectedType: 'text', description: 'Morning greeting - not payment' },
];

async function runTests() {
  console.log('Setting up test users...');
  const setupOk = await setup();
  if (!setupOk) {
    console.error('Failed to set up test users. Is the API server running?');
    process.exit(1);
  }
  console.log(`Test user authenticated. Second user: @${secondUsername}\n`);

  testCases.push({
    message: `send 25 usdc to @${secondUsername}`,
    expectedType: 'payment',
    expectedItems: [{ amount: 25, token: 'USDC' }],
    expectRecipientExtracted: true,
    description: 'Positive @mention resolution with existing user',
  });

  testCases.push({
    message: `transfer 10 sol to @${secondUsername}`,
    expectedType: 'payment',
    expectedItems: [{ amount: 10, token: 'SOL' }],
    expectRecipientExtracted: true,
    description: 'Transfer with @mention resolution with existing user',
  });

  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  console.log(`Running ${testCases.length} parse-intent endpoint tests...\n`);

  for (const tc of testCases) {
    try {
      const result = await parseIntent(tc.message);
      let ok = true;
      const issues: string[] = [];

      if (result.type !== tc.expectedType) {
        ok = false;
        issues.push(`type: expected "${tc.expectedType}", got "${result.type}"`);
      }

      if (tc.expectedType === 'payment' && result.type === 'payment') {
        if (!result.items || result.items.length === 0) {
          ok = false;
          issues.push('expected items array but got none');
        }

        if (tc.expectedItems && result.items) {
          if (result.items.length < tc.expectedItems.length) {
            ok = false;
            issues.push(`items count: expected >= ${tc.expectedItems.length}, got ${result.items.length}`);
          } else {
            for (let i = 0; i < tc.expectedItems.length; i++) {
              const expected = tc.expectedItems[i];
              const actual = result.items[i];
              if (expected.token && actual.token !== expected.token) {
                ok = false;
                issues.push(`item[${i}].token: expected "${expected.token}", got "${actual.token}"`);
              }
              if (expected.amount !== undefined && actual.amount !== expected.amount) {
                ok = false;
                issues.push(`item[${i}].amount: expected ${expected.amount}, got ${actual.amount}`);
              }
            }
          }
        }

        if (tc.expectSendAll) {
          const allItemsHaveAmount = result.items && result.items.every(i => typeof i.amount === 'number');
          if (!allItemsHaveAmount) {
            ok = false;
            issues.push('send_all: expected all items to have resolved amounts');
          }
        }
      }

      if (tc.expectedType === 'payment_error') {
        if (result.type !== 'payment_error') {
          ok = false;
          issues.push(`expected payment_error type, got "${result.type}"`);
        }
        if (tc.expectRecipientNotFound && result.type === 'payment_error') {
          if (!result.error || !result.error.toLowerCase().includes('not found')) {
            ok = false;
            issues.push(`expected "not found" in error, got: "${result.error}"`);
          }
        }
      }

      if (tc.expectRecipientExtracted && result.type === 'payment') {
        if (!result.recipient || !result.recipient.userId || !result.recipient.username) {
          ok = false;
          issues.push('expected recipient to be resolved with userId and username');
        }
      }

      if (ok) {
        console.log(`  ✓ ${tc.description}`);
        passed++;
      } else {
        console.log(`  ✗ ${tc.description}`);
        console.log(`    Message: "${tc.message}"`);
        console.log(`    Issues: ${issues.join(', ')}`);
        console.log(`    Result: ${JSON.stringify(result)}`);
        failed++;
        failures.push(`${tc.description}: ${issues.join(', ')}`);
      }
    } catch (err) {
      console.log(`  ✗ ${tc.description} (ERROR: ${err})`);
      failed++;
      failures.push(`${tc.description}: ERROR ${err}`);
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Results: ${passed}/${testCases.length} passed, ${failed} failed`);
  if (failures.length > 0) {
    console.log(`\nFailures:`);
    failures.forEach(f => console.log(`  - ${f}`));
  }
  console.log('');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
