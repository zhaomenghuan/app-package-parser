/**
 * [objectType]
 * @param {*} object
 */
function objectType(object) {
  return Object.prototype.toString.call(object).slice(8, -1).toLowerCase();
}

/**
 * [isArray]
 * @param {*} value 
 */
const isArray = Array.isArray || function (value) {
  return objectType(value) === 'array';
};

/**
 * [isObject]
 * @param  {[type]}  object
 * @return {Boolean}
 */
const isObject = function (value) {
  return objectType(value) === 'object';
};

/**
 * [isPrimitive]
 * @param {*} value 
 */
function isPrimitive(value) {
  return (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string" ||
    typeof value === "undefined"
  );
}

/**
 * [isEmpty]
 * @param {*} obj 
 */
function isEmpty(obj) {
  for (let i in obj) {
    return false;
  }
  return true;
}

function isBrowser () {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

module.exports = { 
  objectType,
  isArray,
  isObject,
  isPrimitive,
  isEmpty,
  isBrowser
}