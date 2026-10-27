// Round 2 · coding track: problem bank, per-language code, and the pattern-matching grader.
// Problems are pattern-inspired by publicly reported formats; none is an actual company question.
// Pure module (no React, no browser APIs).

import type { Bi } from '@/lib/os/i18n'

export type CodeLang = 'python' | 'cpp' | 'java' | 'c'
export type ProblemId = 'move-zeros' | 'longest-substring' | 'ship-within-days'
export type Difficulty = 'Easy' | 'Medium' | 'Medium-Hard'

/** brute = O(n²) pattern; optimal = two-pointer markers; other = some edit that is neither; empty = untouched starter. */
export type CodeClass = 'brute' | 'optimal' | 'other' | 'empty'
export type Verdict = 'pass' | 'tle' | 'wa' | 're'

export const CODE_LANGS: { id: CodeLang; label: string; short: string }[] = [
  { id: 'python', label: 'Python 3', short: 'Python' },
  { id: 'cpp', label: 'C++ 17', short: 'C++' },
  { id: 'java', label: 'Java 17', short: 'Java' },
  { id: 'c', label: 'C (GCC)', short: 'C' },
]

export function langLabel(lang: CodeLang): string {
  return CODE_LANGS.find((l) => l.id === lang)?.label ?? 'Python 3'
}

export interface Sample {
  input: string
  output: string
  explain?: Bi
}

export interface Hint {
  level: 1 | 2 | 3
  label: Bi
  penalty: number
  text: Bi
  /** Language-specific wording (e.g. list.remove() is Python-only). */
  textByLang?: Partial<Record<CodeLang, Bi>>
  /** Pseudo-code block shown under the text. */
  code?: string
}

export interface HiddenTest {
  id: number
  label: string
  /** Runtime (ms) for an efficient solution. */
  ms: number
  /** Runtime (ms) for the brute-force solution; null means TLE (> 1.0 s). */
  bruteMs: number | null
}

export interface Problem {
  id: ProblemId
  num: number
  title: Bi
  /** e.g. 'TCS NQT-style · Easy' */
  tag: string
  difficulty: Difficulty
  statement: Bi
  inputFormat: Bi
  outputFormat: Bi
  constraints: string[]
  samples: Sample[]
  expected: { time: string; space: string }
  hiddenCount: number
  patternSeenIn: string[]
  /** Only move-zeros runs the full scripted flow (hidden tests, AI review, apply fix). */
  scripted: boolean
  starter: Record<CodeLang, string>
  brute?: Record<CodeLang, string>
  fixed?: Record<CodeLang, string>
  hints: Hint[]
}

// -----------------------------------------------------------------------------
// Q1 · Move Zeroes (full flow)
// -----------------------------------------------------------------------------

const PY_IO_MZ = `

n = int(input())
arr = list(map(int, input().split()))
print(*move_zeroes(arr))
`

const MZ_STARTER: Record<CodeLang, string> = {
  python: `def move_zeroes(arr):
    # Move every 0 to the end, keeping the order of the non-zero elements.
    # Modify arr in place and return it.
    pass
${PY_IO_MZ}`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

void moveZeroes(vector<int>& a) {
    // Move every 0 to the end, keeping the order
    // of the non-zero elements. Modify a in place.
}

int main() {
    int n; cin >> n;
    vector<int> a(n);
    for (auto& x : a) cin >> x;
    moveZeroes(a);
    for (int x : a) cout << x << ' ';
    return 0;
}
`,
  java: `import java.util.*;

public class Main {
    static void moveZeroes(int[] a) {
        // Move every 0 to the end, keeping the order
        // of the non-zero elements. Modify a in place.
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = sc.nextInt();
        moveZeroes(a);
        StringBuilder sb = new StringBuilder();
        for (int x : a) sb.append(x).append(' ');
        System.out.println(sb.toString().trim());
    }
}
`,
  c: `#include <stdio.h>

void moveZeroes(int a[], int n) {
    /* Move every 0 to the end, keeping the order
       of the non-zero elements. Modify a in place. */
}

int main(void) {
    int n;
    scanf("%d", &n);
    static int a[100000];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    moveZeroes(a, n);
    for (int i = 0; i < n; i++) printf("%d ", a[i]);
    return 0;
}
`,
}

const MZ_BRUTE: Record<CodeLang, string> = {
  python: `def move_zeroes(arr):
    for _ in range(arr.count(0)):
        arr.remove(0)
        arr.append(0)
    return arr
${PY_IO_MZ}`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

void moveZeroes(vector<int>& a) {
    int n = a.size();
    for (int i = 0; i < n; ) {
        if (a[i] == 0) {
            for (int k = i; k < n - 1; k++)
                a[k] = a[k + 1];      // shift left
            a[n - 1] = 0;
            n--;
        } else {
            i++;
        }
    }
}

int main() {
    int n; cin >> n;
    vector<int> a(n);
    for (auto& x : a) cin >> x;
    moveZeroes(a);
    for (int x : a) cout << x << ' ';
    return 0;
}
`,
  java: `import java.util.*;

public class Main {
    static void moveZeroes(int[] a) {
        int n = a.length;
        for (int i = 0; i < n; ) {
            if (a[i] == 0) {
                for (int k = i; k < n - 1; k++)
                    a[k] = a[k + 1];      // shift left
                a[n - 1] = 0;
                n--;
            } else {
                i++;
            }
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = sc.nextInt();
        moveZeroes(a);
        StringBuilder sb = new StringBuilder();
        for (int x : a) sb.append(x).append(' ');
        System.out.println(sb.toString().trim());
    }
}
`,
  c: `#include <stdio.h>

void moveZeroes(int a[], int n) {
    for (int i = 0; i < n; ) {
        if (a[i] == 0) {
            for (int k = i; k < n - 1; k++)
                a[k] = a[k + 1];      /* shift left */
            a[n - 1] = 0;
            n--;
        } else {
            i++;
        }
    }
}

int main(void) {
    int n;
    scanf("%d", &n);
    static int a[100000];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    moveZeroes(a, n);
    for (int i = 0; i < n; i++) printf("%d ", a[i]);
    return 0;
}
`,
}

const MZ_FIXED: Record<CodeLang, string> = {
  python: `def move_zeroes(arr):
    j = 0                      # write pointer
    for i in range(len(arr)):
        if arr[i] != 0:
            arr[j] = arr[i]
            j += 1
    for k in range(j, len(arr)):
        arr[k] = 0
    return arr
${PY_IO_MZ}`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

void moveZeroes(vector<int>& a) {
    int n = a.size();
    int j = 0;                    // write pointer
    for (int i = 0; i < n; i++)
        if (a[i] != 0) a[j++] = a[i];
    while (j < n) a[j++] = 0;
}

int main() {
    int n; cin >> n;
    vector<int> a(n);
    for (auto& x : a) cin >> x;
    moveZeroes(a);
    for (int x : a) cout << x << ' ';
    return 0;
}
`,
  java: `import java.util.*;

public class Main {
    static void moveZeroes(int[] a) {
        int n = a.length;
        int j = 0;                    // write pointer
        for (int i = 0; i < n; i++)
            if (a[i] != 0) a[j++] = a[i];
        while (j < n) a[j++] = 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = sc.nextInt();
        moveZeroes(a);
        StringBuilder sb = new StringBuilder();
        for (int x : a) sb.append(x).append(' ');
        System.out.println(sb.toString().trim());
    }
}
`,
  c: `#include <stdio.h>

void moveZeroes(int a[], int n) {
    int j = 0;                    /* write pointer */
    for (int i = 0; i < n; i++)
        if (a[i] != 0) a[j++] = a[i];
    while (j < n) a[j++] = 0;
}

int main(void) {
    int n;
    scanf("%d", &n);
    static int a[100000];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    moveZeroes(a, n);
    for (int i = 0; i < n; i++) printf("%d ", a[i]);
    return 0;
}
`,
}

const MOVE_ZEROS: Problem = {
  id: 'move-zeros',
  num: 1,
  title: { en: 'Move Zeroes', hi: 'शून्य को अंत में भेजें', hinglish: 'Move Zeroes' },
  tag: 'TCS NQT-style · Easy',
  difficulty: 'Easy',
  statement: {
    en: 'Given an array of N integers, move all the zeros to the end of the array while keeping the relative order of the non-zero elements. Do it in place, without making a copy of the array.',
    hi: 'N पूर्णांकों की एक array दी गई है। सभी शून्य (0) को array के अंत में ले जाएँ, और non-zero तत्वों का आपसी क्रम वैसा ही रखें। यह in-place करें, array की कॉपी बनाए बिना।',
    hinglish:
      'N integers ki ek array di gayi hai. Saare zeros ko array ke end mein bhejo, aur non-zero elements ka order same rakho. In-place karo, array ki copy banaye bina.',
  },
  inputFormat: {
    en: 'Line 1: N. Line 2: N space-separated integers a₁ … a_N.',
    hi: 'पंक्ति 1: N। पंक्ति 2: N पूर्णांक, स्पेस से अलग।',
    hinglish: 'Line 1: N. Line 2: N integers, space se alag.',
  },
  outputFormat: {
    en: 'The array after moving the zeros, space-separated.',
    hi: 'शून्य खिसकाने के बाद की array, स्पेस से अलग।',
    hinglish: 'Zeros shift karne ke baad ki array, space se alag.',
  },
  constraints: ['1 ≤ N ≤ 10⁵', '|aᵢ| ≤ 10⁹', 'Time limit 1.0 s'],
  samples: [
    {
      input: '5\n0 1 0 3 12',
      output: '1 3 12 0 0',
      explain: {
        en: 'Non-zeros 1, 3, 12 keep their order; the two zeros move to the end.',
        hi: '1, 3, 12 का क्रम वही रहता है; दोनों शून्य अंत में जाते हैं।',
        hinglish: '1, 3, 12 ka order same rehta hai; dono zeros end mein chale jaate hain.',
      },
    },
    { input: '3\n0 0 1', output: '1 0 0' },
    { input: '1\n7', output: '7' },
  ],
  expected: { time: 'O(N)', space: 'O(1)' },
  hiddenCount: 10,
  patternSeenIn: ['TCS NQT-style', 'Cognizant GenC-style', 'Two pointers', 'In-place arrays'],
  scripted: true,
  starter: MZ_STARTER,
  brute: MZ_BRUTE,
  fixed: MZ_FIXED,
  hints: [
    {
      level: 1,
      label: { en: 'Nudge', hi: 'संकेत', hinglish: 'Nudge' },
      penalty: 5,
      text: {
        en: 'What does list.remove() cost when called inside a loop?',
        hi: 'लूप के अंदर list.remove() बुलाने की लागत क्या है?',
        hinglish: 'Loop ke andar list.remove() call karne ki cost kya hai?',
      },
      textByLang: {
        cpp: {
          en: 'What does shifting the whole array left cost, once for every zero?',
          hi: 'हर शून्य पर पूरी array को बाईं ओर खिसकाने की लागत क्या है?',
          hinglish: 'Har zero par poori array ko left shift karne ki cost kya hai?',
        },
        java: {
          en: 'What does shifting the whole array left cost, once for every zero?',
          hi: 'हर शून्य पर पूरी array को बाईं ओर खिसकाने की लागत क्या है?',
          hinglish: 'Har zero par poori array ko left shift karne ki cost kya hai?',
        },
        c: {
          en: 'What does shifting the whole array left cost, once for every zero?',
          hi: 'हर शून्य पर पूरी array को बाईं ओर खिसकाने की लागत क्या है?',
          hinglish: 'Har zero par poori array ko left shift karne ki cost kya hai?',
        },
      },
    },
    {
      level: 2,
      label: { en: 'Approach', hi: 'तरीका', hinglish: 'Approach' },
      penalty: 10,
      text: {
        en: 'Keep a write pointer; copy non-zeros forward, then fill zeros.',
        hi: 'एक write pointer रखें; non-zero तत्वों को आगे कॉपी करें, फिर बची जगह में शून्य भरें।',
        hinglish: 'Ek write pointer rakho; non-zeros ko aage copy karo, phir baaki jagah zeros bhar do.',
      },
    },
    {
      level: 3,
      label: { en: 'Pseudo-code', hi: 'स्यूडो-कोड', hinglish: 'Pseudo-code' },
      penalty: 20,
      text: {
        en: 'One pass to compact, one pass to fill:',
        hi: 'एक पास में सिकोड़ें, दूसरे में भरें:',
        hinglish: 'Ek pass mein compact karo, doosre mein fill:',
      },
      code: `j ← 0
for i in 0 … n−1:
    if a[i] ≠ 0: a[j] ← a[i]; j ← j + 1
for k in j … n−1:
    a[k] ← 0`,
    },
  ],
}

/** Hidden tests for move-zeros (pattern-inspired; runtimes simulated). */
export const MZ_HIDDEN: HiddenTest[] = [
  { id: 1, label: 'Mixed values, N = 8', ms: 21, bruteMs: 22 },
  { id: 2, label: 'No zeros, N = 12', ms: 19, bruteMs: 19 },
  { id: 3, label: 'All zeros, N = 9', ms: 18, bruteMs: 20 },
  { id: 4, label: 'Single element 0', ms: 17, bruteMs: 17 },
  { id: 5, label: 'Zeros already at the end', ms: 20, bruteMs: 21 },
  { id: 6, label: 'Negatives, |aᵢ| = 10⁹', ms: 22, bruteMs: 23 },
  { id: 7, label: 'Alternating 0 / x, N = 1,000', ms: 26, bruteMs: 38 },
  { id: 8, label: 'Random, N = 10⁴', ms: 31, bruteMs: 412 },
  { id: 9, label: 'Random, 50% zeros, N = 10⁵', ms: 58, bruteMs: null },
  { id: 10, label: 'All zeros, N = 10⁵', ms: 61, bruteMs: null },
]

// -----------------------------------------------------------------------------
// Q2 · Longest substring without repeats (practice)
// -----------------------------------------------------------------------------

const LONGEST: Problem = {
  id: 'longest-substring',
  num: 2,
  title: {
    en: 'Longest Substring Without Repeats',
    hi: 'बिना दोहराव वाली सबसे लंबी substring',
    hinglish: 'Longest Substring Without Repeats',
  },
  tag: 'Wipro/Accenture-style · Medium',
  difficulty: 'Medium',
  statement: {
    en: 'Given a string s, find the length of the longest substring that has no repeating characters.',
    hi: 'एक string s दी गई है। उस सबसे लंबी substring की लंबाई बताइए जिसमें कोई अक्षर दोहराया न गया हो।',
    hinglish: 'Ek string s di gayi hai. Sabse lambi substring ki length batao jismein koi character repeat na ho.',
  },
  inputFormat: { en: 'One line: the string s.', hi: 'एक पंक्ति: string s।', hinglish: 'Ek line: string s.' },
  outputFormat: { en: 'One integer: the length.', hi: 'एक पूर्णांक: लंबाई।', hinglish: 'Ek integer: length.' },
  constraints: ['0 ≤ |s| ≤ 5 × 10⁴', 's has letters, digits, symbols and spaces', 'Time limit 1.0 s'],
  samples: [
    {
      input: 'abcabcbb',
      output: '3',
      explain: { en: '"abc" is the longest.', hi: '"abc" सबसे लंबी है।', hinglish: '"abc" sabse lambi hai.' },
    },
    {
      input: 'pwwkew',
      output: '3',
      explain: {
        en: '"wke"; note "pwke" is a subsequence, not a substring.',
        hi: '"wke"; "pwke" subsequence है, substring नहीं।',
        hinglish: '"wke"; "pwke" subsequence hai, substring nahi.',
      },
    },
  ],
  expected: { time: 'O(N)', space: 'O(min(N, Σ))' },
  hiddenCount: 12,
  patternSeenIn: ['Wipro NTH-style', 'Accenture-style', 'Sliding window', 'Hashing'],
  scripted: false,
  starter: {
    python: `def longest_unique(s):
    # Length of the longest substring without repeating characters.
    pass


s = input()
print(longest_unique(s))
`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

int longestUnique(const string& s) {
    // Length of the longest substring
    // without repeating characters.
    return 0;
}

int main() {
    string s;
    getline(cin, s);
    cout << longestUnique(s) << endl;
    return 0;
}
`,
    java: `import java.util.*;

public class Main {
    static int longestUnique(String s) {
        // Length of the longest substring
        // without repeating characters.
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";
        System.out.println(longestUnique(s));
    }
}
`,
    c: `#include <stdio.h>
#include <string.h>

int longestUnique(const char *s) {
    /* Length of the longest substring
       without repeating characters. */
    return 0;
}

int main(void) {
    static char s[50001];
    if (!fgets(s, sizeof s, stdin)) s[0] = '\\0';
    s[strcspn(s, "\\n")] = '\\0';
    printf("%d\\n", longestUnique(s));
    return 0;
}
`,
  },
  hints: [
    {
      level: 1,
      label: { en: 'Nudge', hi: 'संकेत', hinglish: 'Nudge' },
      penalty: 5,
      text: {
        en: 'What if you remembered the last index where each character appeared?',
        hi: 'अगर आप हर अक्षर का आख़िरी index याद रखें तो?',
        hinglish: 'Agar har character ka last index yaad rakho toh?',
      },
    },
    {
      level: 2,
      label: { en: 'Approach', hi: 'तरीका', hinglish: 'Approach' },
      penalty: 10,
      text: {
        en: 'Sliding window: when a character repeats, move the left edge just past its previous copy.',
        hi: 'Sliding window: कोई अक्षर दोहराए तो बायाँ किनारा उसकी पिछली कॉपी के ठीक आगे ले जाएँ।',
        hinglish: 'Sliding window: character repeat ho toh left edge ko uski pichhli copy ke just aage le jao.',
      },
    },
    {
      level: 3,
      label: { en: 'Pseudo-code', hi: 'स्यूडो-कोड', hinglish: 'Pseudo-code' },
      penalty: 20,
      text: { en: 'One pass with a map:', hi: 'एक map के साथ एक पास:', hinglish: 'Ek map ke saath ek pass:' },
      code: `last ← {} ; left ← 0 ; best ← 0
for right, ch in s:
    if ch in last and last[ch] ≥ left: left ← last[ch] + 1
    last[ch] ← right
    best ← max(best, right − left + 1)`,
    },
  ],
}

// -----------------------------------------------------------------------------
// Q3 · Ship within D days (practice)
// -----------------------------------------------------------------------------

const SHIP: Problem = {
  id: 'ship-within-days',
  num: 3,
  title: { en: 'Ship Packages Within D Days', hi: 'D दिनों में पैकेज भेजें', hinglish: 'Ship Packages Within D Days' },
  tag: 'Amazon OA-style · Medium-Hard',
  difficulty: 'Medium-Hard',
  statement: {
    en: 'Packages on a conveyor belt must be shipped in the given order within D days. Each day the ship is loaded with consecutive packages up to its capacity. Find the least capacity that ships every package within D days.',
    hi: 'कन्वेयर बेल्ट पर रखे पैकेज दिए गए क्रम में D दिनों के अंदर भेजने हैं। हर दिन जहाज़ में क्षमता तक लगातार पैकेज लादे जाते हैं। सबसे कम क्षमता बताइए जिससे सारे पैकेज D दिनों में पहुँच जाएँ।',
    hinglish:
      'Conveyor belt ke packages diye gaye order mein D din ke andar bhejne hain. Har din ship mein capacity tak lagaatar packages load hote hain. Sabse kam capacity batao jisse saare packages D din mein chale jaayein.',
  },
  inputFormat: {
    en: 'Line 1: N and D. Line 2: N weights.',
    hi: 'पंक्ति 1: N और D। पंक्ति 2: N वज़न।',
    hinglish: 'Line 1: N aur D. Line 2: N weights.',
  },
  outputFormat: { en: 'One integer: the least capacity.', hi: 'एक पूर्णांक: न्यूनतम क्षमता।', hinglish: 'Ek integer: least capacity.' },
  constraints: ['1 ≤ D ≤ N ≤ 5 × 10⁴', '1 ≤ wᵢ ≤ 500', 'Time limit 1.0 s'],
  samples: [
    {
      input: '10 5\n1 2 3 4 5 6 7 8 9 10',
      output: '15',
      explain: {
        en: 'Days: [1..5], [6, 7], [8], [9], [10]. Capacity 14 would need 6 days.',
        hi: 'दिन: [1..5], [6, 7], [8], [9], [10]। क्षमता 14 पर 6 दिन लगेंगे।',
        hinglish: 'Days: [1..5], [6, 7], [8], [9], [10]. Capacity 14 par 6 din lagenge.',
      },
    },
  ],
  expected: { time: 'O(N log Σw)', space: 'O(1)' },
  hiddenCount: 12,
  patternSeenIn: ['Amazon OA-style', 'Binary search on answer', 'Greedy check'],
  scripted: false,
  starter: {
    python: `def ship_within_days(weights, d):
    # Least ship capacity that ships every package within d days.
    pass


n, d = map(int, input().split())
weights = list(map(int, input().split()))
print(ship_within_days(weights, d))
`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

int shipWithinDays(vector<int>& w, int d) {
    // Least capacity that ships all packages in d days.
    return 0;
}

int main() {
    int n, d; cin >> n >> d;
    vector<int> w(n);
    for (auto& x : w) cin >> x;
    cout << shipWithinDays(w, d) << endl;
    return 0;
}
`,
    java: `import java.util.*;

public class Main {
    static int shipWithinDays(int[] w, int d) {
        // Least capacity that ships all packages in d days.
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), d = sc.nextInt();
        int[] w = new int[n];
        for (int i = 0; i < n; i++) w[i] = sc.nextInt();
        System.out.println(shipWithinDays(w, d));
    }
}
`,
    c: `#include <stdio.h>

int shipWithinDays(int w[], int n, int d) {
    /* Least capacity that ships all packages in d days. */
    return 0;
}

int main(void) {
    int n, d;
    scanf("%d %d", &n, &d);
    static int w[50000];
    for (int i = 0; i < n; i++) scanf("%d", &w[i]);
    printf("%d\\n", shipWithinDays(w, n, d));
    return 0;
}
`,
  },
  hints: [
    {
      level: 1,
      label: { en: 'Nudge', hi: 'संकेत', hinglish: 'Nudge' },
      penalty: 5,
      text: {
        en: 'If capacity C works, does every capacity above C also work?',
        hi: 'अगर क्षमता C काम करती है, तो क्या C से बड़ी हर क्षमता भी काम करेगी?',
        hinglish: 'Agar capacity C kaam karti hai, toh kya C se badi har capacity bhi kaam karegi?',
      },
    },
    {
      level: 2,
      label: { en: 'Approach', hi: 'तरीका', hinglish: 'Approach' },
      penalty: 10,
      text: {
        en: 'Binary-search the capacity between max(w) and sum(w); greedily count the days for each guess.',
        hi: 'क्षमता को max(w) और sum(w) के बीच binary search करें; हर अनुमान के लिए greedy तरीके से दिन गिनें।',
        hinglish: 'Capacity ko max(w) aur sum(w) ke beech binary search karo; har guess ke liye greedy se days gino.',
      },
    },
    {
      level: 3,
      label: { en: 'Pseudo-code', hi: 'स्यूडो-कोड', hinglish: 'Pseudo-code' },
      penalty: 20,
      text: { en: 'Binary search on the answer:', hi: 'उत्तर पर binary search:', hinglish: 'Answer par binary search:' },
      code: `lo ← max(w) ; hi ← sum(w)
while lo < hi:
    mid ← (lo + hi) ÷ 2
    if days_needed(mid) ≤ D: hi ← mid else: lo ← mid + 1
return lo`,
    },
  ],
}

export const PROBLEMS: Problem[] = [MOVE_ZEROS, LONGEST, SHIP]

export function problemById(id: string | null | undefined): Problem {
  return PROBLEMS.find((p) => p.id === id) ?? MOVE_ZEROS
}

export function hintText(h: Hint, lang: CodeLang): Bi {
  return h.textByLang?.[lang] ?? h.text
}

// -----------------------------------------------------------------------------
// Grader (pattern-matching; the demo never executes code)
// -----------------------------------------------------------------------------

/** Removes comments and empties string literals, so markers inside them never count. */
export function cleanCode(code: string, lang: CodeLang): string {
  const src = typeof code === 'string' ? code : ''
  let out = ''
  let i = 0
  const n = src.length
  const py = lang === 'python'
  while (i < n) {
    const ch = src[i]
    const nx = src[i + 1]
    if (py && ch === '#') {
      while (i < n && src[i] !== '\n') i++
      continue
    }
    if (!py && ch === '/' && nx === '/') {
      while (i < n && src[i] !== '\n') i++
      continue
    }
    if (!py && ch === '/' && nx === '*') {
      i += 2
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) {
        if (src[i] === '\n') out += '\n'
        i++
      }
      i += 2
      continue
    }
    if (ch === '"' || ch === "'") {
      const q = ch
      out += q
      i++
      while (i < n && src[i] !== q && src[i] !== '\n') {
        if (src[i] === '\\') i++
        i++
      }
      if (i < n && src[i] === q) {
        out += q
        i++
      }
      continue
    }
    out += ch
    i++
  }
  return out
}

function squash(s: string): string {
  return s.replace(/\s+/g, '')
}

function hasNestedForPython(clean: string): boolean {
  const lines = clean.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const m = /^(\s*)for\b/.exec(lines[i])
    if (!m) continue
    const indent = m[1].length
    for (let j = i + 1; j < lines.length; j++) {
      const line = lines[j]
      if (!line.trim()) continue
      const ind = (/^(\s*)/.exec(line)?.[1].length ?? 0)
      if (ind <= indent) break
      if (/\bfor\b/.test(line)) return true
    }
  }
  return false
}

function matchClose(s: string, from: number, open: string, close: string): number {
  let depth = 0
  for (let i = from; i < s.length; i++) {
    if (s[i] === open) depth++
    else if (s[i] === close) {
      depth--
      if (depth === 0) return i
    }
  }
  return s.length - 1
}

function hasNestedForCLike(clean: string): boolean {
  const re = /\bfor\s*\(/g
  let m: RegExpExecArray | null
  while ((m = re.exec(clean))) {
    const parenOpen = clean.indexOf('(', m.index)
    const parenClose = matchClose(clean, parenOpen, '(', ')')
    let k = parenClose + 1
    while (k < clean.length && /\s/.test(clean[k])) k++
    let body: string
    if (clean[k] === '{') {
      body = clean.slice(k, matchClose(clean, k, '{', '}') + 1)
    } else {
      // Single statement: up to the first ';' unless a block opens first.
      const semi = clean.indexOf(';', k)
      const brace = clean.indexOf('{', k)
      if (brace !== -1 && (semi === -1 || brace < semi)) body = clean.slice(k, matchClose(clean, brace, '{', '}') + 1)
      else body = clean.slice(k, semi === -1 ? clean.length : semi + 1)
    }
    if (/\bfor\b/.test(body)) return true
  }
  return false
}

export function hasNestedFor(code: string, lang: CodeLang): boolean {
  const clean = cleanCode(code, lang)
  return lang === 'python' ? hasNestedForPython(clean) : hasNestedForCLike(clean)
}

const TWO_POINTER_MARKERS: RegExp[] = [
  /\bj\s*\+=\s*1\b/,
  /\bj\s*\+\+/,
  /\+\+\s*j\b/,
  /\bj\s*=\s*j\s*\+\s*1\b/,
  /nz/i,
  /write/i,
  /\bpos\b/,
  /insert_?pos/i,
  /last_?non_?zero/i,
  /\bk\s*\+=\s*1\b/,
  /\bk\s*\+\+/,
  /\bidx\s*\+=\s*1\b/,
  /\bidx\s*\+\+/,
]

/**
 * Pattern-match grader (spec):
 * - 'remove(' or two nested for loops → brute (8/10, tests 9-10 TLE at N = 10⁵)
 * - two-pointer markers ('j += 1', 'j++', 'nz', 'write', …) → optimal (10/10)
 * - an untouched starter → empty
 * - anything else → other (6/10 WA)
 */
export function classifyCode(code: string, lang: CodeLang, problem: Problem): CodeClass {
  const clean = cleanCode(code, lang)
  const starter = cleanCode(problem.starter[lang] ?? '', lang)
  if (squash(clean) === squash(starter)) return 'empty'
  if (!problem.scripted) return 'other'
  if (/remove\s*\(/.test(clean)) return 'brute'
  if (lang === 'python' ? hasNestedForPython(clean) : hasNestedForCLike(clean)) return 'brute'
  if (TWO_POINTER_MARKERS.some((re) => re.test(clean))) return 'optimal'
  return 'other'
}

export interface SampleResult {
  idx: number
  input: string
  expected: string
  got: string
  verdict: Verdict
  ms: number
  note?: string
}

/** Simulated sample run (3 samples for move-zeros). */
export function gradeSamples(problem: Problem, cls: CodeClass, lang: CodeLang): SampleResult[] {
  const timesMs = [28, 24, 21, 26]
  return problem.samples.map((s, i) => {
    const base = { idx: i + 1, input: s.input, expected: s.output, ms: timesMs[i % timesMs.length] }
    if (cls === 'empty') {
      if (lang === 'python') {
        const msg = problem.id === 'move-zeros' ? 'TypeError: print() argument after * must be an iterable, not NoneType' : ''
        if (msg) return { ...base, got: '', verdict: 're', note: msg }
        return { ...base, got: 'None', verdict: 'wa' }
      }
      if (problem.id === 'move-zeros') {
        const unchanged = s.input.split('\n')[1] ?? ''
        return { ...base, got: unchanged, verdict: unchanged === s.output ? 'pass' : 'wa' }
      }
      return { ...base, got: '0', verdict: 'wa' }
    }
    if (cls === 'other' && problem.scripted && i === 1) {
      return { ...base, got: '0 1 0', verdict: 'wa' }
    }
    return { ...base, got: s.output, verdict: 'pass' }
  })
}

export interface HiddenResult {
  id: number
  label: string
  verdict: Verdict
  ms: number | null
}

const OTHER_FAILS = new Set([3, 4, 7, 10])
const EMPTY_C_PASSES = new Set([2, 5])

/** Simulated hidden-test verdicts for move-zeros. */
export function gradeHidden(cls: CodeClass, lang: CodeLang): HiddenResult[] {
  return MZ_HIDDEN.map((t) => {
    switch (cls) {
      case 'optimal':
        return { id: t.id, label: t.label, verdict: 'pass', ms: t.ms }
      case 'brute':
        return t.bruteMs === null
          ? { id: t.id, label: t.label, verdict: 'tle', ms: null }
          : { id: t.id, label: t.label, verdict: 'pass', ms: t.bruteMs }
      case 'other':
        return OTHER_FAILS.has(t.id)
          ? { id: t.id, label: t.label, verdict: 'wa', ms: t.ms }
          : { id: t.id, label: t.label, verdict: 'pass', ms: t.ms }
      case 'empty':
      default:
        if (lang === 'python') return { id: t.id, label: t.label, verdict: 're', ms: null }
        return EMPTY_C_PASSES.has(t.id)
          ? { id: t.id, label: t.label, verdict: 'pass', ms: t.ms }
          : { id: t.id, label: t.label, verdict: 'wa', ms: t.ms }
    }
  })
}

/** What the round records about the brute-force attempt (fix 14: the interview reads signalChip). */
export function bruteSignal(lang: CodeLang): { bruteForce: string; signalChip: string } {
  return lang === 'python'
    ? { bruteForce: 'list.remove', signalChip: 'brute force (list.remove)' }
    : { bruteForce: 'nested shift loop', signalChip: 'brute force (nested shift loop)' }
}
