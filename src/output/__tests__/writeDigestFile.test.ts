import * as fs from 'fs';
import * as core from '@actions/core';
import {
  formatAsMarkdown,
  formatAsJson,
  formatAsHtml,
  renderContent,
  resolveFilePath,
  writeDigestFile,
  DigestData,
} from '../writeDigestFile';
import { FileOutputConfig } from '../../config/fileOutputConfig';

jest.mock('fs');
jest.mock('@actions/core');

const mockData: DigestData = {
  title: 'Weekly PR Digest',
  body: '## Features\n- PR #1',
  generatedAt: '2024-01-15T10:00:00Z',
  prCount: 1,
};

describe('formatAsMarkdown', () => {
  it('includes title and body', () => {
    const result = formatAsMarkdown(mockData);
    expect(result).toContain('# Weekly PR Digest');
    expect(result).toContain('## Features');
    expect(result).toContain('2024-01-15T10:00:00Z');
  });
});

describe('formatAsJson', () => {
  it('returns valid JSON with all fields', () => {
    const result = JSON.parse(formatAsJson(mockData));
    expect(result.title).toBe('Weekly PR Digest');
    expect(result.prCount).toBe(1);
  });
});

describe('formatAsHtml', () => {
  it('returns HTML document', () => {
    const result = formatAsHtml(mockData);
    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('<h1>Weekly PR Digest</h1>');
  });

  it('escapes HTML entities in body', () => {
    const data = { ...mockData, body: '<script>alert(1)</script>' };
    const result = formatAsHtml(data);
    expect(result).toContain('&lt;script&gt;');
    expect(result).not.toContain('<script>');
  });
});

describe('renderContent', () => {
  it('dispatches to correct formatter', () => {
    expect(renderContent(mockData, 'json')).toContain('"title"');
    expect(renderContent(mockData, 'html')).toContain('<!DOCTYPE html>');
    expect(renderContent(mockData, 'markdown')).toContain('# Weekly PR Digest');
  });
});

describe('resolveFilePath', () => {
  it('appends extension if missing', () => {
    expect(resolveFilePath('output/digest', 'markdown')).toBe('output/digest.md');
    expect(resolveFilePath('output/digest', 'json')).toBe('output/digest.json');
    expect(resolveFilePath('output/digest', 'html')).toBe('output/digest.html');
  });

  it('does not double-append extension', () => {
    expect(resolveFilePath('output/digest.md', 'markdown')).toBe('output/digest.md');
  });
});

describe('writeDigestFile', () => {
  beforeEach(() => jest.clearAllMocks());

  it('does nothing when disabled', () => {
    const config: FileOutputConfig = { enabled: false, format: 'markdown', outputPath: 'out' };
    writeDigestFile(mockData, config);
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it('writes file when enabled', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    const config: FileOutputConfig = { enabled: true, format: 'markdown', outputPath: 'out/digest' };
    writeDigestFile(mockData, config);
    expect(fs.writeFileSync).toHaveBeenCalledWith('out/digest.md', expect.any(String), 'utf-8');
    expect(core.setOutput).toHaveBeenCalledWith('digest_file_path', 'out/digest.md');
  });

  it('creates directory if it does not exist', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    const config: FileOutputConfig = { enabled: true, format: 'json', outputPath: 'new/path/digest' };
    writeDigestFile(mockData, config);
    expect(fs.mkdirSync).toHaveBeenCalledWith('new/path', { recursive: true });
  });
});
