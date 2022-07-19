const path = require("path");
const fs = require('fs');
const AppPackageParser = require("../index");

async function base64ImageToBuffer(base64String) {
  if (!base64String) {
      return new Error('Invalid base64String');
  }
  const buffer = new Object()
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
  buffer.type = matches[1].match(/\/(.*?)$/)[1]
  buffer.data = Buffer.from(matches[2], 'base64')
  return buffer
}

async function writeStreamBufferAsync(path, buffer) {
  return new Promise(async (resolve, reject) => {
      const writeStream = fs.createWriteStream(path)
      writeStream.on('error', (err) => {
          console.log("发生异常：", err)
          return reject(err)
      })
      writeStream.on('open', (fd) => {
          console.log("文件已打开：", fd)
      })
      writeStream.on('finish', () => {
          console.log("写入已完成..")
          return resolve(path)
      })
      writeStream.on('close', () => {
          console.log("文件已关闭")
      })
      writeStream.write(buffer)
      writeStream.end()
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
  let ipaInfo = await AppPackageParser.readPkgInfo(path.resolve(__dirname, "test.ipa"), "ipa");
  console.log(ipaInfo);
}
readPkgInfoTest();

async function readPkgInfoTest() {
  let apkInfo = await AppPackageParser.readPkgInfo(path.resolve(__dirname, "test.apk"), "apk");
  console.log(apkInfo);
  const iconBuffer = await base64ImageToBuffer(apkInfo.icon);
  await writeStreamBufferAsync(path.resolve(__dirname, `${apkInfo.name}.${iconBuffer.type}`), iconBuffer.data);
}
readPkgInfoTest();