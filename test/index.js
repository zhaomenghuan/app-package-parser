const path = require("path");
const fs = require('fs');
const AppPackageParser = require("../index");

async function base64ImageToBuffer(base64String) {
  if (!base64String) {
      return new Error('Invalid base64String');
  }
  const buffer = new Object();
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  buffer.type = matches[1].match(/\/(.*?)$/)[1];
  buffer.data = Buffer.from(matches[2], 'base64');
  return buffer;
}

async function writeStreamBufferAsync(path, buffer) {
  return new Promise(async (resolve, reject) => {
      const writeStream = fs.createWriteStream(path);
      writeStream.on('error', (err) => {
          return reject(err);
      });
      writeStream.on('open', (fd) => {
          
      });
      writeStream.on('finish', () => {
          return resolve(path);
      });
      writeStream.on('close', () => {
      
      });
      writeStream.write(buffer);
      writeStream.end();
  })
}

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
readIPAInfo();

async function readPkgInfoTest() {
  let ipaInfo = await AppPackageParser.readPkgInfo(path.resolve(__dirname, "test.ipa"));
  console.log(ipaInfo);
}
readPkgInfoTest();

async function readPkgInfoTest() {
  let apkInfo = await AppPackageParser.readPkgInfo(path.resolve(__dirname, "test.apk"));
  console.log(apkInfo);
  const iconBuffer = await base64ImageToBuffer(apkInfo.icon);
  await writeStreamBufferAsync(path.resolve(__dirname, `${apkInfo.name}.${iconBuffer.type}`), iconBuffer.data);
}
readPkgInfoTest();