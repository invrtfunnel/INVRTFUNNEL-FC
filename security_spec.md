# Security Specification

## Data Invariants
1. A live match must have unique alphanumeric ID matching `^[a-zA-Z0-9_\-]+$`.
2. A match score can never be negative.
3. The match minute must be between 0 and 90 (inclusive).
4. Public reads (getting a single match or listing matches) are allowed.
5. Writes are protected.

## The Dirty Dozen Payloads
We define standard payloads trying to bypass validation, e.g. setting negative scores, setting invalid minutes, setting invalid match IDs.

## Test Runner
A mock description of tests checking that the rules reject invalid schema, negative values, and unauthorized deletes.
