import * as core from '@actions/core';
import { writeDigestFile, DigestData } from '../writeDigestFile';
import { loadFileOutputConfig } from '../../config/fileOutputConfig';
import * as fs from 'fs';

jest.mock('fs');
jest.mock('@actions/core');
jest.mock('../../config/fileOutputConfig');

function setupInputs(config: Partial<ReturnType<typeof loadFileOutputConfig>>) {
  (loadFileOutputConfig as jest.Mock).mockReturnValue({
    enabled: false,
    format: 'markdown',
    outputPath: 'pr-digest-output',
    ...config,
  });
}

const sampleData: DigestData = {
  title: 'Sprint Digest',
  body: '## Bug Fixes\n- Fixed login issue (#42)',
  generatedAt: '2024-06-01T08:00:00Z',
  prCount: 1,
};

describe('writeDigestFile integration', () => {
  beforeEach(() => jest.clearAllMocks());

  it('skips writing when file output is disabled', () => {
    setupInputs({ enabled: false });
    const config = loadFileOutputConfig();
    writeDigestFile(sampleData, config);
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it('writes markdown file with correct extension', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    setupInputs({ enabled: true, format: 'markdown', outputPath: 'reports/digest' });
    const config = loadFileOutputConfig();
    writeDigestFile(sampleData, config);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'reports/digest.md',
      expect.stringContaining('# Sprint Digest'),
      'utf-8'
    );
  });

  it('writes json file and sets output', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    setupInputs({ enabled: true, format: 'json', outputPath: 'reports/digest' });
    const config = loadFileOutputConfig();
    writeDigestFile(sampleData, config);
    const written = (fs.writeFileSync as jest.Mock).mock.calls[0][1] as string;
    const parsed = JSON.parse(written);
    expect(parsed.title).toBe('Sprint Digest');
    expect(parsed.prCount).toBe(1);
    expect(core.setOutput).toHaveBeenCalledWith('digest_file_path', 'reports/digest.json');
  });

  it('writes html file with escaped content', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    setupInputs({ enabled: true, format: 'html', outputPath: 'reports/digest' });
    const config = loadFileOutputConfig();
    const data = { ...sampleData, body: '<b>bold</b>' };
    writeDigestFile(data, config);
    const written = (fs.writeFileSync as jest.Mock).mock.calls[0][1] as string;
    expect(written).toContain('&lt;b&gt;bold&lt;/b&gt;');
  });
});
