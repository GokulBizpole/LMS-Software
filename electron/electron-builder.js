/**
 * @type {import('electron-builder').Configuration}
 */
module.exports = {
  appId: "com.finloan.app",
  productName: "SKA Trust",

  directories: {
    output: "C:\\FinLoanBuild",
  },

  files: [
    "dist/**/*",
    "renderer/**/*"
  ],

  buildDependenciesFromSource: false,
  nodeGypRebuild: false,

  beforeBuild: () => false,

  publish: {
    provider: "github",
    owner: "GokulBizpole",
    repo: "LMS-Software",
  },

  win: {
    target: "nsis",
  },
  

  nsis: {
    oneClick: false,
    perMachine: false,

    createDesktopShortcut: true,
    createStartMenuShortcut: true,

    shortcutName: "SKA Trust",
  },
};