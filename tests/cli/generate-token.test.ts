import { parseArgs, validateArgs } from '../../src/cli/generate-token';

describe('schwab-generate-token CLI', () => {
  describe('parseArgs', () => {
    it('parses all flags', () => {
      const args = parseArgs([
        '--token_file', './token.json',
        '--api_key', 'KEY',
        '--app_secret', 'SECRET',
        '--callback_url', 'https://127.0.0.1:8182',
        '--manual',
      ]);
      expect(args).toMatchObject({
        tokenFile: './token.json',
        apiKey: 'KEY',
        appSecret: 'SECRET',
        callbackUrl: 'https://127.0.0.1:8182',
        manual: true,
      });
    });

    it('defaults manual/help to false and missing values to empty strings', () => {
      const args = parseArgs([]);
      expect(args).toMatchObject({ tokenFile: '', apiKey: '', appSecret: '', callbackUrl: '', manual: false, help: false });
    });

    it('recognizes -h / --help', () => {
      expect(parseArgs(['-h']).help).toBe(true);
      expect(parseArgs(['--help']).help).toBe(true);
    });
  });

  describe('validateArgs', () => {
    it('returns no errors when all required args are present', () => {
      const errors = validateArgs({
        tokenFile: 't', apiKey: 'k', appSecret: 's', callbackUrl: 'c',
      });
      expect(errors).toEqual([]);
    });

    it('reports each missing required arg', () => {
      const errors = validateArgs({ tokenFile: '', apiKey: '', appSecret: '', callbackUrl: '' });
      expect(errors).toHaveLength(4);
      expect(errors.join(' ')).toMatch(/token_file/);
      expect(errors.join(' ')).toMatch(/api_key/);
      expect(errors.join(' ')).toMatch(/app_secret/);
      expect(errors.join(' ')).toMatch(/callback_url/);
    });
  });
});
