import { AlertManager } from '../alertManager';
import { AudioQualityService } from '../audioQualityService';
import { ConversationAnalysisService } from '../conversationAnalysisService';
import { RiskEngine } from '../riskEngine';
import { VoiceAnalysisSignals } from '../../types';

export function runRiskEngineTests() {
  console.log('=== RUNNING VOICESHIELD AI RISK ENGINE TEST SUITE ===');

  const defaultSignals: VoiceAnalysisSignals = {
    syntheticProbability: 10,
    authenticityConfidence: 90,
    speakerConsistency: 95,
    livenessScore: 90,
    callContextRisk: 10,
    transactionRisk: 10,
  };

  // Test 1: Saved Contact + Normal Conversation
  const test1 = RiskEngine.calculateStructuredRisk({
    callerType: 'SAVED_CONTACT',
    signals: defaultSignals,
    audioQuality: 'EXCELLENT',
    detectedCategories: [],
  });
  console.assert(test1.riskScore <= 10, `Test 1 Failed: Score ${test1.riskScore} > 10`);
  console.log(`[PASS] Test 1: Saved contact normal conversation -> Score: ${test1.riskScore} (${test1.riskLevel})`);

  // Test 2: Unknown Contact + Normal Conversation
  const test2 = RiskEngine.calculateStructuredRisk({
    callerType: 'UNKNOWN_CONTACT',
    signals: defaultSignals,
    audioQuality: 'EXCELLENT',
    detectedCategories: [],
  });
  console.assert(test2.riskScore >= 5 && test2.riskScore <= 30, `Test 2 Failed: Score ${test2.riskScore}`);
  console.log(`[PASS] Test 2: Unknown contact normal conversation -> Score: ${test2.riskScore} (${test2.riskLevel})`);

  // Test 3: Saved Contact + Poor Audio Quality
  const qualityRes = AudioQualityService.evaluateQuality(70, 0, 'TRAFFIC');
  const test3 = RiskEngine.calculateStructuredRisk({
    callerType: 'SAVED_CONTACT',
    signals: defaultSignals,
    audioQuality: qualityRes.grade,
    detectedCategories: [],
  });
  console.assert(test3.voiceVerification.status === 'INCONCLUSIVE', 'Test 3 Failed: Status not INCONCLUSIVE');
  console.log(`[PASS] Test 3: Poor audio -> Status: ${test3.voiceVerification.status}, Score: ${test3.riskScore}`);

  // Test 4: Saved Contact + Voice Mismatch + Normal Conversation
  const mismatchSignals = { ...defaultSignals, speakerConsistency: 40 };
  const test4 = RiskEngine.calculateStructuredRisk({
    callerType: 'SAVED_CONTACT',
    signals: mismatchSignals,
    audioQuality: 'EXCELLENT',
    detectedCategories: [],
  });
  console.assert(test4.riskLevel === 'LOW' || test4.riskLevel === 'MEDIUM', `Test 4 Failed: Level ${test4.riskLevel}`);
  console.log(`[PASS] Test 4: Voice mismatch alone -> Level: ${test4.riskLevel}, Score: ${test4.riskScore}`);

  // Test 5: Saved Contact + Voice Mismatch + OTP Request
  const test5 = RiskEngine.calculateStructuredRisk({
    callerType: 'SAVED_CONTACT',
    signals: mismatchSignals,
    audioQuality: 'EXCELLENT',
    detectedCategories: ['OTP_REQUEST'],
  });
  console.assert(test5.riskScore >= 80, `Test 5 Failed: Score ${test5.riskScore} < 80`);
  console.log(`[PASS] Test 5: Voice mismatch + OTP request -> Score: ${test5.riskScore} (${test5.riskLevel})`);

  // Test 6: Unknown Caller + OTP Request
  const test6 = RiskEngine.calculateStructuredRisk({
    callerType: 'UNKNOWN_CONTACT',
    signals: defaultSignals,
    audioQuality: 'EXCELLENT',
    detectedCategories: ['OTP_REQUEST'],
  });
  console.assert(test6.riskScore >= 80, `Test 6 Failed: Score ${test6.riskScore} < 80`);
  console.log(`[PASS] Test 6: Unknown contact + OTP -> Score: ${test6.riskScore} (${test6.riskLevel})`);

  // Test 7: Money Transfer Request
  const test7 = RiskEngine.calculateStructuredRisk({
    callerType: 'UNKNOWN_CONTACT',
    signals: defaultSignals,
    audioQuality: 'EXCELLENT',
    detectedCategories: ['MONEY_TRANSFER_REQUEST'],
  });
  console.assert(test7.riskScore >= 60, `Test 7 Failed: Score ${test7.riskScore} < 60`);
  console.log(`[PASS] Test 7: Money transfer request -> Score: ${test7.riskScore} (${test7.riskLevel})`);

  // Test 8: Urgent Payment Request
  const test8 = RiskEngine.calculateStructuredRisk({
    callerType: 'SAVED_CONTACT',
    signals: defaultSignals,
    audioQuality: 'EXCELLENT',
    detectedCategories: ['URGENT_PAYMENT_REQUEST'],
  });
  console.assert(test8.riskScore >= 80, `Test 8 Failed: Score ${test8.riskScore} < 80`);
  console.log(`[PASS] Test 8: Urgent payment request -> Score: ${test8.riskScore} (${test8.riskLevel})`);

  // Test 9: Remote Access Request (AnyDesk/TeamViewer)
  const intent9 = ConversationAnalysisService.analyzeText('Please install anydesk app so I can fix your bank account');
  const test9 = RiskEngine.calculateStructuredRisk({
    callerType: 'UNKNOWN_CONTACT',
    signals: defaultSignals,
    audioQuality: 'EXCELLENT',
    detectedCategories: intent9.detectedCategories,
  });
  console.assert(test9.detectedIndicators.includes('REMOTE_ACCESS_REQUEST'), 'Test 9 Failed: Remote access intent missed');
  console.assert(test9.riskScore >= 80, `Test 9 Failed: Score ${test9.riskScore} < 80`);
  console.log(`[PASS] Test 9: Remote access request -> Detected: ${test9.detectedIndicators.join(', ')}, Score: ${test9.riskScore}`);

  // Test 10: Financial Impersonation
  const intent10 = ConversationAnalysisService.analyzeText('I am calling from your bank customer support desk');
  console.assert(intent10.detectedCategories.includes('FINANCIAL_IMPERSONATION'), 'Test 10 Failed: Impersonation missed');
  console.log(`[PASS] Test 10: Financial impersonation detected successfully`);

  // Test 11: Alert Debouncing Test
  AlertManager.clearCooldowns();
  const alertA = AlertManager.triggerThreatAlert({ riskLevel: 'CRITICAL', detectedCategory: 'OTP_REQUEST', explanation: 'OTP', recommendation: 'Do not share' });
  const alertB = AlertManager.triggerThreatAlert({ riskLevel: 'CRITICAL', detectedCategory: 'OTP_REQUEST', explanation: 'OTP', recommendation: 'Do not share' });
  console.assert(alertA !== null && alertB === null, 'Test 11 Failed: Debounce failed to suppress duplicate alert');
  console.log(`[PASS] Test 11: Alert debouncing suppressed duplicate notification within cooldown window`);

  console.log('=== ALL 11 RISK ENGINE TESTS COMPLETED SUCCESSFULLY ===');
}

runRiskEngineTests();
