import * as fs from 'fs';
import * as path from 'path';
import * as core from '@actions/core';
import { FileOutputConfig, FileOutputFormat } from '../config/fileOutputConfig';

export interface DigestData {
  title: string;
  body: string;
  generatedAt: string;
  prCount: number;
}

export function formatAsMarkdown(data: DigestData): string {
  return `# ${data.title}\n\n_Generated at ${data.generatedAt}_\n\n${data.body}\n`;
}

export function formatAsJson(data: DigestData): string {
  return JSON.stringify(data, null, 2);
}

export function formatAsHtml(data: DigestData): string {
  const escaped = data.body
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return [
    '<!DOCTYPE html>',
    '<html lang="en"><head><meta charset="UTF-8">',
    `<title>${data.title}</title></head>`,
    '<body>',
    `<h1>${data.title}</h1>`,
    `<p><em>Generated at ${data.generatedAt}</em></p>`,
    `<pre>${escaped}</pre>`,
    '</body></html>',
  ].join('\n');
}

export function renderContent(data: DigestData, format: FileOutputFormat): string {
  switch (format) {
    case 'json': return formatAsJson(data);
    case 'html': return formatAsHtml(data);
    default: return formatAsMarkdown(data);
  }
}

export function resolveFilePath(outputPath: string, format: FileOutputFormat): string {
  const ext = format === 'json' ? '.json' : format === 'html' ? '.html' : '.md';
  return outputPath.endsWith(ext) ? outputPath : `${outputPath}${ext}`;
}

export function writeDigestFile(data: DigestData, config: FileOutputConfig): void {
  if (!config.enabled) return;

  const content = renderContent(data, config.format);
  const filePath = resolveFilePath(config.outputPath, config.format);
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  core.info(`Digest written to ${filePath}`);
  core.setOutput('digest_file_path', filePath);
}
