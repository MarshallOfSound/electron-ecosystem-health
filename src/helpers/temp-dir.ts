import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';

export async function withTempDir<R>(
  fn: (dir: string) => Promise<R>,
): Promise<R> {
  const baseTmp = path.resolve(os.tmpdir(), 'ecosystem-health-');
  const tmpDir = await fs.mkdtemp(baseTmp);
  try {
    return await fn(tmpDir);
  } finally {
    await fs.rm(tmpDir, { recursive: true });
  }
}
