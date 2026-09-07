/**
 * @type {import('electron-builder').Configuration}
 */
module.exports = {
  appId: "com.finloan.app",
  productName: "FinLoan",

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

    shortcutName: "FinLoan",
  },
};