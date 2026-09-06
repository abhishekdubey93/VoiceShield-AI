import re

INTENT_PATTERNS = [
    {
        "category": "OTP_REQUEST",
        "severity": "CRITICAL",
        "keywords": ["otp", "one time password", "six digit code", "6 digit code", "verification code", "passcode you received", "share the code"],
    },
    {
        "category": "UPI_PIN_REQUEST",
        "severity": "CRITICAL",
        "keywords": ["upi pin", "gpay pin", "phonepe pin", "paytm pin", "bhim pin"],
    },
    {
        "category": "ATM_PIN_REQUEST",
        "severity": "CRITICAL",
        "keywords": ["atm pin", "card pin", "debit card pin", "4 digit pin"],
    },
    {
        "category": "BANK_PASSWORD_REQUEST",
        "severity": "CRITICAL",
        "keywords": ["bank password", "netbanking password", "online banking password"],
    },
    {
        "category": "BANK_ACCOUNT_REQUEST",
        "severity": "HIGH",
        "keywords": ["bank account number", "account details", "account no", "ifsc code"],
    },
    {
        "category": "CARD_NUMBER_REQUEST",
        "severity": "CRITICAL",
        "keywords": ["card number", "16 digit card", "debit card number", "credit card number"],
    },
    {
        "category": "CVV_REQUEST",
        "severity": "CRITICAL",
        "keywords": ["cvv", "cvv number", "three digit code on back"],
    },
    {
        "category": "REMOTE_ACCESS_REQUEST",
        "severity": "CRITICAL",
        "keywords": ["anydesk", "teamviewer", "quicksupport", "screen share app", "rustdesk"],
    },
    {
        "category": "FINANCIAL_IMPERSONATION",
        "severity": "HIGH",
        "keywords": ["calling from your bank", "rbi official", "bank manager", "customer support desk", "sbi fraud department"],
    },
    {
        "category": "URGENT_PAYMENT_REQUEST",
        "severity": "CRITICAL",
        "keywords": ["urgent transfer", "immediate payment", "otherwise account blocked", "within 10 minutes"],
    },
    {
        "category": "MONEY_TRANSFER_REQUEST",
        "severity": "HIGH",
        "keywords": ["transfer money", "send money", "gpay me", "phonepe me", "paytm me", "wire funds"],
    },
    {
        "category": "THREAT",
        "severity": "CRITICAL",
        "keywords": ["arrest warrant", "legal action", "police team sending", "case registered against you", "digital arrest"],
    },
    {
        "category": "EXTORTION",
        "severity": "CRITICAL",
        "keywords": ["blackmail", "pay or video leaked", "compromised photos"],
    },
    {
        "category": "PERSONAL_INFORMATION_REQUEST",
        "severity": "MEDIUM",
        "keywords": ["mother maiden name", "date of birth", "aadhaar number", "pan card number"],
    },
]

class PythonConversationEngine:
    @staticmethod
    def analyze_text(transcript: str) -> dict:
        if not transcript:
            return {"detected_categories": [], "highest_severity": "NONE"}

        lower = transcript.lower()
        detected = set()
        highest_sev = "NONE"
        sev_rank = {"NONE": 0, "LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}

        for item in INTENT_PATTERNS:
            for kw in item["keywords"]:
                if kw in lower:
                    detected.add(item["category"])
                    if sev_rank[item["severity"]] > sev_rank[highest_sev]:
                        highest_sev = item["severity"]

        return {
            "detected_categories": list(detected),
            "highest_severity": highest_sev,
        }
