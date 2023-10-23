import { unzip } from 'cross-zip';
import * as utils from 'util';

import { ElectronVersionFetcher } from './base';
import { withTempDir } from '../helpers/temp-dir';
import { dirVersionFetcher } from './dir';

const unzipP = utils.promisify(unzip);

export const zipVersionFetcher: ElectronVersionFetcher = async (file) => {
  return await withTempDir(async (dir) => {
    await unzipP(file, dir);
    return await dirVersionFetcher(dir);
  });
};
