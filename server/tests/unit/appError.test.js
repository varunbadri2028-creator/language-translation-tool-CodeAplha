/**
 * ===========================================
 * TEST: AppError Utility
 * ===========================================
 *
 * WHY THIS TEST EXISTS:
 * - AppError is used throughout the entire codebase
 * - We must verify it correctly sets status codes, messages, and the
 *   isOperational flag — because the error handler uses these to decide
 *   what to show the user
 *
 * TESTING CONCEPTS:
 * - describe() → groups related tests
 * - it() → a single test case
 * - expect() → an assertion (what should be true)
 *
 * WHAT WE TEST:
 * 1. Default values (500 status, operational = true)
 * 2. Custom status codes
 * 3. 4xx → status 'fail', 5xx → status 'error'
 * 4. Stack trace is captured
 * 5. Non-operational errors (programming bugs)
 */

const AppError = require('../../src/utils/AppError');

describe('AppError', () => {
  // ─── Test 1: Default behavior ─────────────────────
  it('should create an error with default values', () => {
    const error = new AppError('Something went wrong');

    expect(error.message).toBe('Something went wrong');
    expect(error.statusCode).toBe(500);
    expect(error.isOperational).toBe(true);
    expect(error.status).toBe('error'); // 5xx = 'error'
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });

  // ─── Test 2: Custom 400 error ─────────────────────
  it('should create a 400 client error with status "fail"', () => {
    const error = new AppError('Bad request', 400);

    expect(error.message).toBe('Bad request');
    expect(error.statusCode).toBe(400);
    expect(error.status).toBe('fail'); // 4xx = 'fail'
    expect(error.isOperational).toBe(true);
  });

  // ─── Test 3: Custom 404 error ─────────────────────
  it('should create a 404 not found error', () => {
    const error = new AppError('Route not found', 404);

    expect(error.statusCode).toBe(404);
    expect(error.status).toBe('fail');
  });

  // ─── Test 4: 503 service unavailable ──────────────
  it('should create a 503 error with status "error"', () => {
    const error = new AppError('Service unavailable', 503);

    expect(error.statusCode).toBe(503);
    expect(error.status).toBe('error'); // 5xx = 'error'
  });

  // ─── Test 5: Non-operational (programming bug) ────
  it('should support non-operational errors', () => {
    const error = new AppError('Unexpected bug', 500, false);

    expect(error.isOperational).toBe(false);
    // The error handler would hide this message from users
  });

  // ─── Test 6: Stack trace ──────────────────────────
  it('should capture a stack trace', () => {
    const error = new AppError('Test error');

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('AppError');
  });
});
