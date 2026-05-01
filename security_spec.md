# WealthFlow Security Specification

## 1. Data Invariants
- A transaction must have a `userId` matching the creator's UID.
- A transaction amount must be a positive number.
- A transaction type must be 'income' or 'expense'.
- A budget must have a `userId` matching the creator's UID.
- Users can only read and write their own data.

## 2. The "Dirty Dozen" Payloads (Anti-Patterns to Block)
1. **Identity Spoofing**: Creating a transaction with someone else's `userId`.
2. **Ghost Field Injection**: Adding `isVerified: true` to a transaction.
3. **Budget Hijacking**: Updating a budget `userId` to a different user.
4. **Invalid Amount**: Setting a transaction amount to a negative number or a string.
5. **ID Poisoning**: Using a 2KB string as a transaction ID.
6. **Malicious Enum**: Setting transaction type to 'refund'.
7. **Cross-User Leak**: Querying for all transactions without a `userId` filter.
8. **PII Leak**: Accessing another user's profile if it contained email (not used here but good to guard).
9. **State Shortcut**: No terminal states yet, but would be like skipping 'pending' to 'cleared' if that existed.
10. **Shadow Key**: Adding `admin_override: true` to any document.
11. **Negative Budget**: Setting a budget amount to -100.
12. **Future Dates**: (Optional) Creating transactions in the year 2099.

## 3. The Test Runner
A `firestore.rules.test.ts` would verify these. (I will focus on the rules themselves for now as I don't have a test runner environment readily configured, but I will simulate the logic).
