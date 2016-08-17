//This prototype is provided by the Mozilla foundation and
//is distributed under the MIT license.
//http://www.ibiblio.org/pub/Linux/LICENSES/mit.license
if (!Array.prototype.some)
{
  Array.prototype.some = function(fun /*, thisp*/)
  {
    var len = this.length;
    if (typeof fun != "function")
      throw new TypeError();

    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this &&
          fun.call(thisp, this[i], i, this))
        return true;
    }

    return false;
  };
}

//This prototype is provided by the Mozilla foundation and
//is distributed under the MIT license.
//http://www.ibiblio.org/pub/Linux/LICENSES/mit.license
if (!Array.prototype.map)
{
Array.prototype.map = function(fun /*, thisp*/)
{
  var len = this.length;
  if (typeof fun != "function")
    throw new TypeError();

  var res = new Array(len);
  var thisp = arguments[1];
  for (var i = 0; i < len; i++)
  {
    if (i in this)
      res[i] = fun.call(thisp, this[i], i, this);
  }

  return res;
};
}

//This prototype is provided by the Mozilla foundation and
//is distributed under the MIT license.
//http://www.ibiblio.org/pub/Linux/LICENSES/mit.license
if (!Array.prototype.forEach)
{
Array.prototype.forEach = function(fun /*, thisp*/)
{
  var len = this.length;
  if (typeof fun != "function")
    throw new TypeError();

  var thisp = arguments[1];
  for (var i = 0; i < len; i++)
  {
    if (i in this)
      fun.call(thisp, this[i], i, this);
  }
};
}

//This prototype is provided by the Mozilla foundation and
//is distributed under the MIT license.
//http://www.ibiblio.org/pub/Linux/LICENSES/mit.license
if (!Array.prototype.indexOf)
{
Array.prototype.indexOf = function(elt /*, from*/)
{
  var len = this.length;

  var from = Number(arguments[1]) || 0;
  from = (from < 0)
       ? Math.ceil(from)
       : Math.floor(from);
  if (from < 0)
    from += len;

  for (; from < len; from++)
  {
    if (from in this &&
        this[from] === elt)
      return from;
  }
  return -1;
};
}