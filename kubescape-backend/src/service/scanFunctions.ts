import { execSync } from 'child_process';
import * as fs from 'fs';

export function basicScan(): string {
  const output = execSync(
    // 'kubescape scan --format json --format-version v2 --output results.json',
    'kubescape scan --format html --output results.html',
    { encoding: 'utf-8' },
  ).toString(); // the default is 'buffer'
  console.log('Output was:\n', output);
  const data = fs.readFileSync('./results.html', {
    encoding: 'utf8',
    flag: 'r',
  });
  return data;
}
