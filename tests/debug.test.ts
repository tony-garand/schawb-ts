import { LogRedactor, registerRedactions, registerRedactionsFromResponse, enableBugReportLogging } from '../src/debug';
import { MockResponse } from './utils';

describe('LogRedactor', () => {
  let redactor: LogRedactor;

  beforeEach(() => {
    redactor = new LogRedactor();
  });

  test('no redactions', () => {
    expect(redactor.redact('test message')).toBe('test message');
  });

  test('simple redaction', () => {
    redactor.register('secret', 'SECRET');
    expect(redactor.redact('secret message')).toBe('<REDACTED SECRET> message');
  });

  test('multiple registrations same string', () => {
    redactor.register('secret', 'SECRET');
    redactor.register('secret', 'SECRET');
    expect(redactor.redact('secret message')).toBe('<REDACTED SECRET> message');
  });

  test('multiple registrations same string different label', () => {
    redactor.register('secret-A', 'SECRET');
    redactor.register('secret-B', 'SECRET');
    expect(redactor.redact('secret-A message secret-B')).toBe('<REDACTED SECRET-1> message <REDACTED SECRET-2>');
  });
});

describe('RegisterRedactions', () => {
  let captured: string[];
  let logger: any;

  beforeEach(() => {
    captured = [];
    logger = {
      info: jest.fn((message: string) => {
        captured.push(message);
      })
    };
  });

  test('empty string', () => {
    registerRedactions('');
  });

  test('empty dict', () => {
    registerRedactions({});
  });

  test('empty list', () => {
    registerRedactions([]);
  });

  test('dict', () => {
    registerRedactions(
      { BadNumber: '100001' },
      [],
      ['bad']
    );
    registerRedactions(
      { OtherBadNumber: '200002' },
      [],
      ['bad']
    );

    logger.info('Bad Number: 100001');
    logger.info('Other Bad Number: 200002');

    expect(captured[0]).toMatch(/Bad Number: <REDACTED BadNumber>/);
    expect(captured[1]).toMatch(/Other Bad Number: <REDACTED OtherBadNumber>/);
  });

  test('list of dict', () => {
    registerRedactions(
      [
        { GoodNumber: '900009' },
        { BadNumber: '100001' },
        { OtherBadNumber: '200002' }
      ],
      [],
      ['bad']
    );

    logger.info('Good Number: 900009');
    logger.info('Bad Number: 100001');
    logger.info('Other Bad Number: 200002');

    expect(captured[0]).toMatch(/Good Number: 900009/);
    expect(captured[1]).toMatch(/Bad Number: <REDACTED 1-BadNumber>/);
    expect(captured[2]).toMatch(/Other Bad Number: <REDACTED 2-OtherBadNumber>/);
  });

  test('whitelist', () => {
    registerRedactions(
      [
        { GoodNumber: '900009' },
        { BadNumber: '100001' },
        { OtherBadNumber: '200002' }
      ],
      [],
      ['bad'],
      new Set(['otherbadnumber'])
    );

    logger.info('Good Number: 900009');
    logger.info('Bad Number: 100001');
    logger.info('Other Bad Number: 200002');

    expect(captured[0]).toMatch(/Good Number: 900009/);
    expect(captured[1]).toMatch(/Bad Number: <REDACTED 1-BadNumber>/);
    expect(captured[2]).toMatch(/Other Bad Number: 200002/);
  });

  test('register from request success', () => {
    const registerRedactionsMock = jest.fn();
    const resp = new MockResponse({ success: 1 }, 200);
    registerRedactionsFromResponse(resp as any);
    expect(registerRedactionsMock).not.toHaveBeenCalled();
  });

  test('register from request not okay', () => {
    const registerRedactionsMock = jest.fn();
    const resp = new MockResponse({ success: 1 }, 403);
    registerRedactionsFromResponse(resp as any);
    expect(registerRedactionsMock).not.toHaveBeenCalled();
  });

  test('register unparseable json', () => {
    const registerRedactionsMock = jest.fn();
    const resp = new MockResponse({ success: 1 }, 200);
    resp.json = jest.fn().mockImplementation(() => {
      throw new Error('Invalid JSON');
    });
    registerRedactionsFromResponse(resp as any);
    expect(registerRedactionsMock).not.toHaveBeenCalled();
  });
});

describe('EnableDebugLogging', () => {
  test('enable doesnt throw exceptions', () => {
    expect(() => {
      enableBugReportLogging();
    }).not.toThrow();
  });
}); 