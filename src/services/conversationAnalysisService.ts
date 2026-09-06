import { IntentCategory } from '../types';

export interface IntentDetectionResult {
  detectedCategories: IntentCategory[];
  highestSeverity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  matchedPhrases: string[];
}

const INTENT_PATTERNS: { category: IntentCategory; severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; keywords: string[] }[] = [
  {
    category: 'OTP_REQUEST',
    severity: 'CRITICAL',
    keywords: [
      'otp',
      'one time password',
      'six digit code',
      '6 digit code',
      'verification code',
      'passcode you received',
      'share the code',
      'tell me the code',
      'code sent to your mobile',
      'six digit number',
    ],
  },
  {
    category: 'UPI_PIN_REQUEST',
    severity: 'CRITICAL',
    keywords: ['upi pin', 'gpay pin', 'phonepe pin', 'paytm pin', 'bhim pin', 'enter pin to receive money'],
  },
  {
    category: 'ATM_PIN_REQUEST',
    severity: 'CRITICAL',
    keywords: ['atm pin', 'card pin', 'debit card pin', '4 digit pin'],
  },
  {
    category: 'BANK_PASSWORD_REQUEST',
    severity: 'CRITICAL',
    keywords: ['bank password', 'netbanking password', 'online banking password', 'account password'],
  },
  {
    category: 'BANK_ACCOUNT_REQUEST',
    severity: 'HIGH',
    keywords: ['bank account number', 'account details', 'account no', 'ifsc code and account'],
  },
  {
    category: 'CARD_NUMBER_REQUEST',
    severity: 'CRITICAL',
    keywords: ['card number', '16 digit card', 'debit card number', 'credit card number'],
  },
  {
    category: 'CVV_REQUEST',
    severity: 'CRITICAL',
    keywords: ['cvv', 'cvv number', 'three digit code on back', 'security digits on card'],
  },
  {
    category: 'SECURITY_CODE_REQUEST',
    severity: 'HIGH',
    keywords: ['security code', 'authentication code', 'login code'],
  },
  {
    category: 'PASSWORD_REQUEST',
    severity: 'HIGH',
    keywords: ['password', 'secret password', 'login credentials'],
  },
  {
    category: 'MONEY_TRANSFER_REQUEST',
    severity: 'HIGH',
    keywords: ['transfer money', 'send money', 'gpay me', 'phonepe me', 'paytm me', 'wire funds', 'send to account'],
  },
  {
    category: 'CASH_REQUEST',
    severity: 'MEDIUM',
    keywords: ['cash payment', 'handover cash', 'bring cash', 'pay in cash'],
  },
  {
    category: 'PAYMENT_REQUEST',
    severity: 'MEDIUM',
    keywords: ['make payment', 'pay now', 'clear dues immediately', 'processing fee payment'],
  },
  {
    category: 'REMOTE_ACCESS_REQUEST',
    severity: 'CRITICAL',
    keywords: ['anydesk', 'teamviewer', 'quicksupport', 'screen share app', 'install app to fix', 'rustdesk'],
  },
  {
    category: 'FINANCIAL_IMPERSONATION',
    severity: 'HIGH',
    keywords: [
      'calling from your bank',
      'rbi official',
      'bank manager',
      'customer support desk',
      'sbi fraud department',
      'hdfc fraud team',
      'icici security manager',
    ],
  },
  {
    category: 'URGENT_PAYMENT_REQUEST',
    severity: 'CRITICAL',
    keywords: ['urgent transfer', 'immediate payment', 'otherwise account blocked', 'within 10 minutes', 'emergency money'],
  },
  {
    category: 'THREAT',
    severity: 'CRITICAL',
    keywords: ['arrest warrant', 'legal action', 'police team sending', 'case registered against you', 'digital arrest'],
  },
  {
    category: 'EXTORTION',
    severity: 'CRITICAL',
    keywords: ['blackmail', 'pay or video leaked', 'compromised photos', 'leak your data'],
  },
  {
    category: 'SUSPICIOUS_IDENTITY_CLAIM',
    severity: 'MEDIUM',
    keywords: ['friend of your father', 'relative in hospital', 'accident emergency', 'trust me i am officer'],
  },
  {
    category: 'PERSONAL_INFORMATION_REQUEST',
    severity: 'MEDIUM',
    keywords: ['mother maiden name', 'date of birth', 'aadhaar number', 'pan card number', 'confirm your address'],
  },
];

export class ConversationAnalysisService {
  public static analyzeText(transcriptText: string): IntentDetectionResult {
    if (!transcriptText || transcriptText.trim().length === 0) {
      return { detectedCategories: [], highestSeverity: 'NONE', matchedPhrases: [] };
    }

    const lowerText = transcriptText.toLowerCase();
    const detectedCategories: Set<IntentCategory> = new Set();
    const matchedPhrases: string[] = [];
    let highestSeverityLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'NONE';

    const severityRank = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };

    for (const item of INTENT_PATTERNS) {
      for (const kw of item.keywords) {
        if (lowerText.includes(kw)) {
          detectedCategories.add(item.category);
          matchedPhrases.push(kw);

          if (severityRank[item.severity] > severityRank[highestSeverityLevel]) {
            highestSeverityLevel = item.severity;
          }
        }
      }
    }

    return {
      detectedCategories: Array.from(detectedCategories),
      highestSeverity: highestSeverityLevel,
      matchedPhrases,
    };
  }
}
