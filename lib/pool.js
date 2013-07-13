/**
 * Module Dependencies
 */

var rtrim = /^\/|\/$/g;

/**
 * Export `Pool`
 */

module.exports = Pool;

/**
 * Initialize `Pool`
 */

function Pool(pool) {
  if (!(this instanceof Pool)) return new Pool(pool);
  this.pool = pool || {};
}

/**
 * Push
 *
 * @param {String} url
 * @param {Mixed} item
 * @return {Pool}
 */

Pool.prototype.push = function(url, item) {
  url = url.replace(rtrim, '');
  var subpool = this.pool[url];
  if (!subpool) subpool = this.pool[url] = [];
  subpool.push(item);
};

/**
 * Pull from URL pool
 *
 * @param {String} url
 * @return {Array}
 */

Pool.prototype.pull = function(url) {
  url = url.replace(rtrim, '');
  var parts = url.split('/');
  var path = [parts[0]];
  var paths = [];
  var key;
  var i;

  for (i = 0, len = parts.length; i < len; i++) {
    key = path.join('/');
    paths.push(key);
    path.push(parts[i+1]);
  }

  if (!paths.length) return [];

  paths = paths.reverse();
  var out = [];

  for (i = 0, len = paths.length; i < len; i++) {
    out = out.concat(this.pool[paths[i]] || []);
  }

  return out;
};

/**
 * TODO: Slice from pool
 *
 * @param {String} url
 * @return {Array}
 */

// Pool.prototype.slice = function(url) {
//   url = url.replace(rtrim, '');
//   return this.pool[url] ||
// };

/**
 * Remove an item
 *
 * @param {String} url
 * @param {Mixed} item
 * @return {Pool}
 */

Pool.prototype.remove = function(url, item) {
  var subpool = this.pool[url];
  if (!subpool || !subpool.length) return this;
  var i = subpool.indexOf(item);
  if (~i) subpool.splice(i, 1);
  return this;
};

// var pool = Pool();
// pool.push('baseball', 'baseball');
// pool.push('baseball/pitcher', 'baseball_pitcher_0');
// pool.push('baseball/pitcher', 'baseball_pitcher_1');
// pool.push('baseball/pitcher/b', 'baseball_pitcher_0_b');
// pool.push('baseball/pitcher/c', 'baseball_pitcher_0_c');

// console.log('baseball/pitcher/c', pool.pull('baseball/pitcher/c'));
// console.log('baseball/pitcher/wahoo', pool.pull('baseball/pitcher/wahoo'));

// pool.remove('baseball/pitcher', 'baseball_pitcher_1');
