import * as chalk from 'chalk';
import * as fs from 'fs';
import got from 'got';
import { Listr } from 'listr2';
import * as moment from 'moment';
import * as path from 'path';
import * as semver from 'semver';

import { withTempDir } from './helpers/temp-dir';
import { pipeline } from 'stream/promises';
import { apps } from './apps';

type ElectronRelease = {
  version: string;
  parsedVersion: semver.SemVer;
  date: string;
};

const ONE_MONTH = 1000 * 60 * 60 * 24 * 30;
const THREE_MONTHS = ONE_MONTH * 3;

const electronReleases = (async () => {
  const result = await got.get('https://releases.electronjs.org/releases.json');
  const releases = JSON.parse(result.body);
  return releases.map((r: ElectronRelease) => ({
    version: r.version,
    parsedVersion: semver.parse(r.version),
    date: r.date,
  })) as ElectronRelease[];
})();

const runner = new Listr(
  apps.map((app) => ({
    title: app.name,
    task: async (ctx, task) => {
      await withTempDir(async (dir) => {
        const tmpFile = path.resolve(dir, 'app');
        const url =
          typeof app.downloadURL === 'string'
            ? app.downloadURL
            : await app.downloadURL();
        task.output = `Downloading app from: ${url} (0%)`;
        const stream = got.stream(url, {
          followRedirect: true,
        });
        stream.on('downloadProgress', ({ percent }: { percent: number }) => {
          task.output = `Downloading app from: ${url} (${
            Math.round(percent * 1000) / 10
          }%)`;
        });
        await pipeline(stream, fs.createWriteStream(tmpFile));
        task.output = `Processing file in: ${tmpFile}`;
        let version = await app.fetcher(tmpFile);
        const isCastLabsFork = version.endsWith('+wvcus');
        if (isCastLabsFork) {
          version = version.replace('+wvcus', '');
        }
        const allReleases = await electronReleases;
        const release = allReleases.find((r) => r.version === version);
        if (!release) {
          throw new Error(
            `Failed to match electron release for version: ${version}`,
          );
        }
        const isLatestInMajor = !allReleases.some(
          (r) =>
            r.parsedVersion.major === release.parsedVersion.major &&
            semver.gt(r.parsedVersion, release.parsedVersion),
        );
        const ago = moment().diff(moment(release.date));
        const fromNow = moment(release.date).fromNow();

        task.output = `Electron${
          isCastLabsFork ? chalk.yellow(' (CastLabs)') : ''
        } ${isLatestInMajor ? chalk.green(version) : chalk.cyan(version)} (${
          ago > THREE_MONTHS
            ? chalk.red(fromNow)
            : ago > ONE_MONTH
            ? chalk.yellow(fromNow)
            : chalk.green(fromNow)
        })`;
      });
    },
    rendererOptions: {
      persistentOutput: true,
    } as any,
  })),
  {
    concurrent: 5,
    collectErrors: 'full',
    rendererOptions: {
      collapseSubtasks: false,
      collapseErrors: false,
      showErrorMessage: true,
      persistentOutput: true,
    } as any,
  },
);

runner.run().catch((err) => {
  process.exit(1);
});
