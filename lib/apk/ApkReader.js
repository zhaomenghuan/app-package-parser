const Reader = require("../Reader");
const ManifestParser = require("./manifest");
const ResourceFinder = require("./ResourceFinder");
const is = require("../utils/is");

const MANIFEST_FTIL_NAME = /^androidmanifest\.xml$/;
const RESOURCE_FILE_NAME = /^resources\.arsc$/;
class ApkReader extends Reader {
  constructor(path) {
    super(path);
    if (!(this instanceof ApkReader)) {
      return new ApkReader(path);
    }
  }

  /**
   * 解析
   */
  async parse() {
    let whatYouNeed = [MANIFEST_FTIL_NAME, RESOURCE_FILE_NAME];
    let buffers = await this.getEntries(whatYouNeed);
    // 解析 AndroidManifest.xml
    let apkInfo = this.parseManifest(buffers[MANIFEST_FTIL_NAME]);
    // 解析 resources.arsc
    let resourceMap = this.parseResorceMap(buffers[RESOURCE_FILE_NAME]);
    // 查找资源
    this.findOutResources(apkInfo, resourceMap);
    // 解析图标
    let icon = this.findOutIcon(apkInfo);
    let iconBuffer = await this.getEntry(icon);
    if(!iconBuffer) {
      apkInfo.icon = null;
    } else {
      let base64Icon = iconBuffer.toString("base64");
      apkInfo.icon = "data:image/png;base64," + base64Icon;
    }
    return apkInfo;
  }

  /**
   * 解析 Androidmanifest.xml
   * @param {*} manifestBuffer
   */
  parseManifest(manifestBuffer) {
    let apkInfo;
    try {
      apkInfo = new ManifestParser(manifestBuffer, {
        ignore: [
          "application.activity",
          "application.service",
          "application.receiver",
          "application.provider",
          "permission-group"
        ]
      }).parse();
    } catch (e) {
      throw new Error("Androidmanifest.xml parser error: " + e.message);
    }
    return apkInfo;
  }

  /**
   * 解析资源地图文件
   * @param {*} resourceBuffer
   */
  parseResorceMap(resourceBuffer) {
    let resorceMap;
    try {
      resorceMap = new ResourceFinder().processResourceTable(resourceBuffer);
    } catch (e) {
      throw new Error("resources.arsc parser error: " + e.message);
    }
    return resorceMap;
  }

  /**
   * 根据索引查找资源文件
   * @param {*} apkInfo
   * @param {*} resorceMap
   */
  findOutResources(apkInfo, resorceMap) {
    let resourceMap = {};

    iteratorObj(apkInfo);

    return resourceMap;

    function iteratorObj(obj) {
      for (var i in obj) {
        if (is.isArray(obj[i])) {
          iteratorArray(obj[i]);
        } else if (is.isObject(obj[i])) {
          iteratorObj(obj[i]);
        } else if (is.isPrimitive(obj[i])) {
          if (isResouces(obj[i])) {
            obj[i] = resorceMap[transKeyToMatchResourceMap(obj[i])];
          }
        }
      }
    }

    function iteratorArray(array) {
      for (var i = 0, l = array.length; i < l; i++) {
        if (is.isArray(array[i])) {
          iteratorArray(array[i]);
        } else if (is.isObject(array[i])) {
          iteratorObj(array[i]);
        } else if (is.isPrimitive(array[i])) {
          if (isResouces(array[i])) {
            array[i] = resorceMap[transKeyToMatchResourceMap(array[i])];
          }
        }
      }
    }

    function isResouces(attrValue) {
      if (!attrValue) return false;
      if (typeof attrValue !== "string") {
        attrValue = attrValue.toString();
      }
      return attrValue.indexOf("resourceId:") === 0;
    }

    function transKeyToMatchResourceMap(resourceId) {
      return "@" + resourceId.replace("resourceId:0x", "").toUpperCase();
    }
  }

  /**
   * 查找图标
   * @param {*} pkgInfo
   */
  findOutIcon(pkgInfo) {
    if (pkgInfo.application.icon && pkgInfo.application.icon.splice) {
      var rulesMap = {
        mdpi: 48,
        hdpi: 72,
        xhdpi: 96,
        xxdpi: 144,
        xxxhdpi: 192
      };

      var resultMap = {};

      var maxDpiIcon = {
        dpi: 120,
        icon: ""
      };

      for (var i in rulesMap) {
        pkgInfo.application.icon.some((icon) => {
          if (icon.indexOf(i) !== -1) {
            resultMap["application-icon-" + rulesMap[i]] = icon;
            return true;
          }
        });

        // 单独取出最大的
        if (
          resultMap["application-icon-" + rulesMap[i]] &&
          rulesMap[i] >= maxDpiIcon.dpi
        ) {
          maxDpiIcon = {
            dpi: rulesMap[i],
            icon: resultMap["application-icon-" + rulesMap[i]]
          };
        }
      }

      if (is.isEmpty(resultMap) || !maxDpiIcon.icon) {
        maxDpiIcon = {
          dpi: 120,
          icon: pkgInfo.application.icon[0] || ""
        };
        resultMap["applicataion-icon-120"] = maxDpiIcon.icon;
      }

      return maxDpiIcon.icon;
    } else {
      console.error("Unexpected icon type,", pkgInfo.application.icon);
    }
  }
}

module.exports = ApkReader;
