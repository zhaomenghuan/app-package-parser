# app-package-parser

应用安装包解析工具

## Install

```
npm install -S app-package-parser
```

## Usage

解析 .APK 完整信息：

```js
const AppPackageParser = require("app-package-parser");
async function readApkInfo() {
  let apkReader = new AppPackageParser.ApkReader(path.resolve(__dirname, "test.apk"));
  let apkInfo = await apkReader.parse();
  console.log(apkInfo);
}
readApkInfo();
```

解析 .IPA 完整信息：

```js
async function readIpaInfo() {
  let ipaReader = new AppPackageParser.IpaReader(path.resolve(__dirname, "test.ipa"));
  let ipaInfo = await ipaReader.parse();
  console.log(ipaInfo);
}
readIpaInfo();
```

解析 Package 基本信息：

```js
async function readPkgInfo() {
  let ipaInfo = await AppPackageParser.readPkgInfo(path.resolve(__dirname, "test.ipa"), "ipa");
  console.log(ipaInfo);
  // { name: "", appId: "", versionName: "", versionCode: "", icon: "" }
}
readPkgInfo();
```