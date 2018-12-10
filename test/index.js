const path = require("path");
const ApkReader = require("../lib/apk/ApkReader");
const IpaReader = require("../lib/ipa/IpaReader");
const readPkgInfo = require("../index").readPkgInfo;

async function readAPKInfo() {
  let apkReader = new ApkReader(path.resolve(__dirname, "test.apk"));
  let apkInfo = await apkReader.parse();
  console.log(apkInfo);
}
readAPKInfo();

async function readIPAInfo() {
  let ipaReader = new IpaReader(path.resolve(__dirname, "test.ipa"));
  let ipaInfo = await ipaReader.parse();
  console.log(ipaInfo);
}
readAPKInfo();

async function readPkgInfoTest() {
  let ipaInfo = await readPkgInfo(path.resolve(__dirname, "test.ipa"), "ipa");
  console.log(ipaInfo);
}
readPkgInfoTest();