module.exports = {
  packagerConfig: {
    executableName: 'aiconsole',
    asar: true,
    icon: './assets/icon',
    extraResource: ['python'],
    osxSign: {},
    osxNotarize: {
      tool: 'notarytool',
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID
    }
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'AIConsole',
        // An URL to an ICO file to use as the application icon (displayed in Control Panel > Programs and Features).
        iconUrl: 'https://url/to/icon.ico',
        // The ICO file to use as the icon for the generated Setup.exe
        setupIcon: './assets/icon.ico',
      },
    },
    {
      name: '@electron-forge/maker-zip',
      config: {
        icon: './assets/icon.png',
        name: 'AIConsole',
        options: {},
      },
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        icon: './assets/icon.png',
        name: 'AIConsole',
        options: {},
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        icon: './assets/icon.png',
        name: 'AIConsole',
      },
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        icon: './assets/icon.icns',
        name: 'AIConsole',
      },
    },
  ],
  hooks: {
    postMake: async (forgeConfig, results) => {
      const { version } = require('./package.json');
      const path = require('path');
      const fs = require('fs');
      for (let result of results) {
        for (let artifact of result.artifacts) {
          if (artifact.endsWith("AIConsole.dmg")) {
            const dmgPath = path.join(artifact);
            const dmgPathWithVersionAndArch = path.join(
              path.dirname(artifact),
              `AIConsole-${version}-${result.arch}.dmg`
            );
            await fs.promises.rename(dmgPath, dmgPathWithVersionAndArch);
          }
        }
      }
    }
  },
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: '10clouds',
          name: 'aiconsole'
        },
        prerelease: true
      }
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    {
      name: '@electron-forge/plugin-vite',
      config: {
        build: [
          {
            entry: './src/main.ts',
            config: 'vite.main.config.ts',
          },
          {
            entry: './src/preload.ts',
            config: 'vite.preload.config.ts',
          },
        ],
        renderer: [
          {
            name: 'main_window',
            config: 'vite.renderer.config.ts',
          },
        ],
      },
    },
  ],
};
