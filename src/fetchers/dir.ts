import * as fs from 'fs/promises';
import * as path from 'path';
import * as plist from 'plist';

import { ElectronVersionFetcher } from './base';

export const dirVersionFetcher: ElectronVersionFetcher = async (dir) => {
  const app = (await fs.readdir(dir)).find((file) => file.endsWith('.app'));
  if (!app) {
    throw new Error('Failed to find .app file');
  }
  const electronFrameworkPlist = path.resolve(
    dir,
    app,
    'Contents',
    'Frameworks',
    'Electron Framework.framework',
    'Resources',
    'Info.plist',
  );
  const result = plist.parse(
    await fs.readFile(electronFrameworkPlist, 'utf-8'),
  ) as plist.PlistObject;
  if (!result['CFBundleVersion']) {
    throw new Error('No CFBundleVersion value found in Electron Framework');
  }
  return result['CFBundleVersion'] as string;
};
