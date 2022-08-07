'use strict';

const Reader = require("../Reader");
var plist = require('./xmlPlistParser');
var bplist = require('./bplistParser');
const cgbiToPng = require('cgbi-to-png');

const PLIST_REG = new RegExp("payload/.+?.app/info.plist$", "i");
// const PROVISION_REG = /payload\/.+?\.app\/embedded.mobileprovision/;
const PROVISION_REG = new RegExp("payload/.+?.app/embedded.mobileprovision$", "i");

class IpaReader extends Reader {
  constructor(path) {
    super(path);
    if (!(this instanceof IpaReader)) {
      return new IpaReader(path);
    }
  }

  async parse() {
    let whatYouNeed = [PLIST_REG, PROVISION_REG];
    let buffers = await this.getEntries(whatYouNeed);
    // 解析 Info.plist
    let plistInfo = this.parsePlistInfo(buffers);
    // 解析 embedded.mobileprovision
    let provisionInfo = this.parseMobileProvisionInfo(buffers);
    plistInfo.mobileProvision = provisionInfo;
    // 解析图标
    let iconName = this.findOutIcon(plistInfo);
    let iconBuffer = await this.getEntry(new RegExp(iconName.toLowerCase()));
    if(!iconBuffer) {
      plistInfo.icon = null;
    } else {
      const pngBuffer = cgbiToPng.revert(iconBuffer);
      let icon = 'data:image/png;base64,' + pngBuffer.toString('base64');
      plistInfo.icon = icon;
    }
    return plistInfo;
  }

  /**
   * 解析 Plist 文件信息
   * @param {*} buffers
   */
  parsePlistInfo(buffers) {
    let plistInfo, firstByte;

    let aStringOrBuffer = buffers[PLIST_REG];
    if (aStringOrBuffer) {
      firstByte = aStringOrBuffer[0];
      try {
        if (firstByte === 60 || firstByte === '<' || firstByte == 239) {
          plistInfo = plist.parse(aStringOrBuffer.toString());
        } else if (firstByte === 98) {
          plistInfo = bplist.parseBuffer(aStringOrBuffer)[0];
        } else {
          console.error("Unable to determine format for plist aStringOrBuffer: '%s'", aStringOrBuffer);
          plistInfo = {};
        }
      } catch (e) {
        throw Error("'%s' has errors", aFile);
      }
    } else {
      throw new Error("Parse ipa file failed, can not find info.plist.");
    }
    return plistInfo;
  }

  /**
   * 解析 embedded.mobileprovision
   * @param {*} buffers
   */
  parseMobileProvisionInfo(buffers) {
    let provisionInfo;
    if (buffers[PROVISION_REG]) {
      try {
        provisionInfo = buffers[PROVISION_REG].toString("utf-8");
        var firstIndex = provisionInfo.indexOf("<");
        var lastIndex = provisionInfo.lastIndexOf("</plist>");
        provisionInfo = provisionInfo.slice(firstIndex, lastIndex);
        provisionInfo += "</plist>";
        provisionInfo = plist.parse(provisionInfo);
      } catch (e) {
        throw new Error(`Parse ipa file failed, can not find embedded.mobileprovision, error: ${e.message}`);
      }
    }
    return provisionInfo;
  }

  /**
   * 查找图标
   * @param {*} pkgInfo 
   */
  findOutIcon(pkgInfo) {
    if (
      pkgInfo.CFBundleIcons &&
      pkgInfo.CFBundleIcons.CFBundlePrimaryIcon &&
      pkgInfo.CFBundleIcons.CFBundlePrimaryIcon.CFBundleIconFiles &&
      pkgInfo.CFBundleIcons.CFBundlePrimaryIcon.CFBundleIconFiles.length
    ) {
      // It's an array...just try the last one
      return pkgInfo.CFBundleIcons.CFBundlePrimaryIcon.CFBundleIconFiles[
        pkgInfo.CFBundleIcons.CFBundlePrimaryIcon.CFBundleIconFiles.length - 1
      ];
    } else {
      // Maybe there is a default one
      return ".app/Icon.png";
    }
  }
}

module.exports = IpaReader;
