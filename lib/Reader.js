const Unzip = require("isomorphic-unzip");

/**
 * 解析基本类
 */
class Reader {
  /**
   * @param {Any} path Browser: File object / Blob; NodeJS: 文件路径
   * @constructor
   */
  constructor(path) {
    this.path = path;
    this.unzip = new Unzip(path);
  }

  /**
   * 解析资源文件
   * @param {Array<String>} whatYouNeed    Entries' name
   * @param {Object}        options        (Optional)
   * @param {String}        options.type   By default, this function will return an Object of buffers.
   *                                       If options.type='blob', it will return blobs in browser.
   *                                       It won't do anything in NodeJS.
   * @param {Function}      callback       Will be called like `callback(error, buffers)`
   */
  getEntries(whatYouNeed, options = {}) {
    return new Promise((resolve, reject) => {
      whatYouNeed = whatYouNeed.map(function(rule) {
        if (typeof rule === "string") {
          rule = rule.split("\u0000").join("");
        }
        return rule;
      });
      this.unzip.getBuffer(whatYouNeed, options, (error, buffers) => {
        if (error) {
          reject(error);
        }
        resolve(buffers);
      });
    });
  }

  /**
   * 获取单个文件
   * @param {*} entryName
   * @param {*} options
   */
  getEntry(entryName, options) {
    return new Promise((resolve, reject) => {
      if (typeof entryName === "string") {
        entryName = entryName.split("\u0000").join("");
      }
      this.unzip.getBuffer([entryName], options, (error, buffers) => {
        if (error) {
          reject(error);
        }
        resolve(buffers[entryName]);
      });
    });
  }
}

module.exports = Reader;
