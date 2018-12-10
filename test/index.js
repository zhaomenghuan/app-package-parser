const path = require("path");
const AppPackageParser = require("../index");

async function readAPKInfo() {
  let apkReader = new AppPackageParser.ApkReader(path.resolve(__dirname, "test.apk"));
  let apkInfo = await apkReader.parse();
  console.log(apkInfo);
}
readAPKInfo();

async function readIPAInfo() {
  let ipaReader = new AppPackageParser.IpaReader(path.resolve(__dirname, "test.ipa"));
  let ipaInfo = await ipaReader.parse();
  console.log(ipaInfo);
}
readAPKInfo();

async function readPkgInfoTest() {
  let ipaInfo = await AppPackageParser.readPkgInfo(path.resolve(__dirname, "test.ipa"), "ipa");
  console.log(ipaInfo);
}
readPkgInfoTest();