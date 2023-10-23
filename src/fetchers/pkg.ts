import { spawn } from '@malept/cross-spawn-promise';
import * as fs from 'fs/promises';
import * as path from 'path';

import { ElectronVersionFetcher } from './base';
import { withTempDir } from '../helpers/temp-dir';
import { dirVersionFetcher } from './dir';

export const pkgVersionFetcher: ElectronVersionFetcher = async (file) => {
  return await withTempDir(async (dir) => {
    await spawn('xar', ['-xf', file], {
      cwd: dir,
    });
    const appPkg = (await fs.readdir(dir)).find((file) =>
      file.endsWith('app.pkg'),
    );
    if (!appPkg) {
      throw new Error('Failed to find inner app pkg in pkg file');
    }
    const payload = path.resolve(dir, appPkg, 'Payload');
    await spawn('tar', ['-xf', payload], {
      cwd: dir,
    });
    return await dirVersionFetcher(dir);
  });
};
