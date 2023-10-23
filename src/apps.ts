import got from 'got';
import * as yaml from 'yaml';

import { ElectronVersionFetcher } from './fetchers/base';
import { zipVersionFetcher } from './fetchers/zip';
import { pkgVersionFetcher } from './fetchers/pkg';

type DownloadURLFetcher = () => Promise<string>;

type AppConfig = {
  name: string;
  downloadURL: string | DownloadURLFetcher;
  fetcher: ElectronVersionFetcher;
};

const basicSquirrel = (url: string) => async () => {
  const raw = await got.get(url);
  const latest = JSON.parse(raw.body);
  return latest.url as string;
};

const staticSquirrel = (url: string) => async () => {
  const raw = await got.get(url);
  const squirrel = JSON.parse(raw.body);
  return squirrel.releases.find(
    (r: any) => r.version === squirrel.currentRelease,
  ).updateTo.url;
};

const basicBuilder = (url: string) => async () => {
  const raw = await got.get(url);
  const latest = yaml.parse(raw.body);
  return url.replace(
    'latest-mac.yml',
    latest.files.find(
      (file: any) =>
        (latest.files.length === 2 || file.url.includes('-arm64-')) &&
        file.url.endsWith('.zip'),
    ).url,
  );
};

const apps: Array<AppConfig> = [
  {
    name: 'Slack',
    downloadURL:
      'https://slack.com/api/desktop.latestRelease?platform=mac&arch=arm64&variant=macos-zip&redirect=true',
    fetcher: zipVersionFetcher,
  },
  {
    name: 'Signal',
    downloadURL: basicBuilder(
      'https://updates.signal.org/desktop/latest-mac.yml',
    ),
    fetcher: zipVersionFetcher,
  },
  {
    name: 'Discord',
    downloadURL: basicSquirrel(
      'https://discord.com/api/updates/stable?platform=osx&version=0.0.1',
    ),
    fetcher: zipVersionFetcher,
  },
  {
    name: '1Password',
    downloadURL: async () => {
      const raw = await got.get(
        'https://app-updates.agilebits.com/check/1/0/OPM8/en/1/N',
      );
      const latest = JSON.parse(raw.body);
      return latest.sources[0].url.replace('$ARCH', 'aarch64');
    },
    fetcher: zipVersionFetcher,
  },
  {
    name: 'Visual Studio Code',
    downloadURL:
      'https://code.visualstudio.com/sha/download?build=stable&os=darwin-universal',
    fetcher: zipVersionFetcher,
  },
  {
    name: 'TIDAL',
    downloadURL: staticSquirrel(
      'https://download.tidal.com/desktop/mac/update-arm64.json',
    ),
    fetcher: zipVersionFetcher,
  },
  {
    name: 'Splice',
    downloadURL: basicSquirrel(
      'https://api.splice.com/v2/desktop/darwin/stable/latest?v=0.0.0&architecture=arm64',
    ),
    fetcher: zipVersionFetcher,
  },
  {
    name: 'Postman',
    downloadURL: 'https://dl.pstmn.io/download/latest/osx_arm64',
    fetcher: zipVersionFetcher,
  },
  {
    name: 'Skype',
    downloadURL: basicSquirrel(
      'https://get.skype.com/s4l-update?version=0.0.0.0&os=mac&ring=production&app=s4l&osversion=23.0.0&arch=',
    ),
    fetcher: zipVersionFetcher,
  },
  {
    name: 'Polypane',
    downloadURL: basicBuilder(
      'https://github.com/firstversionist/polypane/releases/latest/download/latest-mac.yml',
    ),
    fetcher: zipVersionFetcher,
  },
  {
    name: 'Notion',
    downloadURL: basicBuilder(
      'https://desktop-release.notion-static.com/latest-mac.yml',
    ),
    fetcher: zipVersionFetcher,
  },
  {
    name: 'Microsoft Teams',
    downloadURL: 'https://aka.ms/teamsmac',
    fetcher: pkgVersionFetcher,
  },
  {
    name: 'Loom',
    downloadURL: basicBuilder(
      'https://packages.loom.com/desktop-packages/latest-mac.yml',
    ),
    fetcher: zipVersionFetcher,
  },
  {
    name: 'GitHub Desktop',
    downloadURL:
      'https://central.github.com/deployments/desktop/desktop/latest/darwin',
    fetcher: zipVersionFetcher,
  },
  {
    name: 'Asana',
    downloadURL: staticSquirrel(
      'https://desktop-downloads.asana.com/darwin_arm64/prod/RELEASES.json',
    ),
    fetcher: zipVersionFetcher,
  },
  {
    name: 'Figma',
    downloadURL: basicSquirrel(
      'https://desktop.figma.com/mac-arm/RELEASE.json?id=Figma&localVersion=0.0.0&arch=arm64',
    ),
    fetcher: zipVersionFetcher,
  },
];

apps.sort((a, b) => a.name.localeCompare(b.name));

export { apps };