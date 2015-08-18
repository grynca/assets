var Module;
if (typeof Module === "undefined") Module = {};
if (!Module.expectedDataFileDownloads) {
 Module.expectedDataFileDownloads = 0;
 Module.finishedDataFileDownloads = 0;
}
Module.expectedDataFileDownloads++;
((function() {
 var loadPackage = (function(metadata) {
  var PACKAGE_PATH;
  if (typeof window === "object") {
   PACKAGE_PATH = window["encodeURIComponent"](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf("/")) + "/");
  } else if (typeof location !== "undefined") {
   PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf("/")) + "/");
  } else {
   throw "using preloaded data can only be done on a web page or in a web worker";
  }
  var PACKAGE_NAME = "build/Emscripten/main.data";
  var REMOTE_PACKAGE_BASE = "main.data";
  if (typeof Module["locateFilePackage"] === "function" && !Module["locateFile"]) {
   Module["locateFile"] = Module["locateFilePackage"];
   Module.printErr("warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)");
  }
  var REMOTE_PACKAGE_NAME = typeof Module["locateFile"] === "function" ? Module["locateFile"](REMOTE_PACKAGE_BASE) : (Module["filePackagePrefixURL"] || "") + REMOTE_PACKAGE_BASE;
  var REMOTE_PACKAGE_SIZE = 5671;
  var PACKAGE_UUID = "cacde48b-08fa-467c-b32f-b951311d9553";
  function fetchRemotePackage(packageName, packageSize, callback, errback) {
   var xhr = new XMLHttpRequest;
   xhr.open("GET", packageName, true);
   xhr.responseType = "arraybuffer";
   xhr.onprogress = (function(event) {
    var url = packageName;
    var size = packageSize;
    if (event.total) size = event.total;
    if (event.loaded) {
     if (!xhr.addedTotal) {
      xhr.addedTotal = true;
      if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
      Module.dataFileDownloads[url] = {
       loaded: event.loaded,
       total: size
      };
     } else {
      Module.dataFileDownloads[url].loaded = event.loaded;
     }
     var total = 0;
     var loaded = 0;
     var num = 0;
     for (var download in Module.dataFileDownloads) {
      var data = Module.dataFileDownloads[download];
      total += data.total;
      loaded += data.loaded;
      num++;
     }
     total = Math.ceil(total * Module.expectedDataFileDownloads / num);
     if (Module["setStatus"]) Module["setStatus"]("Downloading data... (" + loaded + "/" + total + ")");
    } else if (!Module.dataFileDownloads) {
     if (Module["setStatus"]) Module["setStatus"]("Downloading data...");
    }
   });
   xhr.onload = (function(event) {
    var packageData = xhr.response;
    callback(packageData);
   });
   xhr.send(null);
  }
  function handleError(error) {
   console.error("package error:", error);
  }
  var fetched = null, fetchedCallback = null;
  fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, (function(data) {
   if (fetchedCallback) {
    fetchedCallback(data);
    fetchedCallback = null;
   } else {
    fetched = data;
   }
  }), handleError);
  function runWithFS() {
   function assert(check, msg) {
    if (!check) throw msg + (new Error).stack;
   }
   function DataRequest(start, end, crunched, audio) {
    this.start = start;
    this.end = end;
    this.crunched = crunched;
    this.audio = audio;
   }
   DataRequest.prototype = {
    requests: {},
    open: (function(mode, name) {
     this.name = name;
     this.requests[name] = this;
     Module["addRunDependency"]("fp " + this.name);
    }),
    send: (function() {}),
    onload: (function() {
     var byteArray = this.byteArray.subarray(this.start, this.end);
     this.finish(byteArray);
    }),
    finish: (function(byteArray) {
     var that = this;
     Module["FS_createPreloadedFile"](this.name, null, byteArray, true, true, (function() {
      Module["removeRunDependency"]("fp " + that.name);
     }), (function() {
      if (that.audio) {
       Module["removeRunDependency"]("fp " + that.name);
      } else {
       Module.printErr("Preloading file " + that.name + " failed");
      }
     }), false, true);
     this.requests[this.name] = null;
    })
   };
   (new DataRequest(0, 5671, 0, 0)).open("GET", "/yoda.jpg");
   function processPackageData(arrayBuffer) {
    Module.finishedDataFileDownloads++;
    assert(arrayBuffer, "Loading data file failed.");
    var byteArray = new Uint8Array(arrayBuffer);
    var curr;
    var ptr = Module["getMemory"](byteArray.length);
    Module["HEAPU8"].set(byteArray, ptr);
    DataRequest.prototype.byteArray = Module["HEAPU8"].subarray(ptr, ptr + byteArray.length);
    DataRequest.prototype.requests["/yoda.jpg"].onload();
    Module["removeRunDependency"]("datafile_build/Emscripten/main.data");
   }
   Module["addRunDependency"]("datafile_build/Emscripten/main.data");
   if (!Module.preloadResults) Module.preloadResults = {};
   Module.preloadResults[PACKAGE_NAME] = {
    fromCache: false
   };
   if (fetched) {
    processPackageData(fetched);
    fetched = null;
   } else {
    fetchedCallback = processPackageData;
   }
  }
  if (Module["calledRun"]) {
   runWithFS();
  } else {
   if (!Module["preRun"]) Module["preRun"] = [];
   Module["preRun"].push(runWithFS);
  }
 });
 loadPackage();
}))();
var Module;
if (!Module) Module = (typeof Module !== "undefined" ? Module : null) || {};
var moduleOverrides = {};
for (var key in Module) {
 if (Module.hasOwnProperty(key)) {
  moduleOverrides[key] = Module[key];
 }
}
var ENVIRONMENT_IS_WEB = typeof window === "object";
var ENVIRONMENT_IS_NODE = typeof process === "object" && typeof require === "function" && !ENVIRONMENT_IS_WEB;
var ENVIRONMENT_IS_WORKER = typeof importScripts === "function";
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (ENVIRONMENT_IS_NODE) {
 if (!Module["print"]) Module["print"] = function print(x) {
  process["stdout"].write(x + "\n");
 };
 if (!Module["printErr"]) Module["printErr"] = function printErr(x) {
  process["stderr"].write(x + "\n");
 };
 var nodeFS = require("fs");
 var nodePath = require("path");
 Module["read"] = function read(filename, binary) {
  filename = nodePath["normalize"](filename);
  var ret = nodeFS["readFileSync"](filename);
  if (!ret && filename != nodePath["resolve"](filename)) {
   filename = path.join(__dirname, "..", "src", filename);
   ret = nodeFS["readFileSync"](filename);
  }
  if (ret && !binary) ret = ret.toString();
  return ret;
 };
 Module["readBinary"] = function readBinary(filename) {
  return Module["read"](filename, true);
 };
 Module["load"] = function load(f) {
  globalEval(read(f));
 };
 if (!Module["thisProgram"]) {
  if (process["argv"].length > 1) {
   Module["thisProgram"] = process["argv"][1].replace(/\\/g, "/");
  } else {
   Module["thisProgram"] = "unknown-program";
  }
 }
 Module["arguments"] = process["argv"].slice(2);
 if (typeof module !== "undefined") {
  module["exports"] = Module;
 }
 process["on"]("uncaughtException", (function(ex) {
  if (!(ex instanceof ExitStatus)) {
   throw ex;
  }
 }));
 Module["inspect"] = (function() {
  return "[Emscripten Module object]";
 });
} else if (ENVIRONMENT_IS_SHELL) {
 if (!Module["print"]) Module["print"] = print;
 if (typeof printErr != "undefined") Module["printErr"] = printErr;
 if (typeof read != "undefined") {
  Module["read"] = read;
 } else {
  Module["read"] = function read() {
   throw "no read() available (jsc?)";
  };
 }
 Module["readBinary"] = function readBinary(f) {
  if (typeof readbuffer === "function") {
   return new Uint8Array(readbuffer(f));
  }
  var data = read(f, "binary");
  assert(typeof data === "object");
  return data;
 };
 if (typeof scriptArgs != "undefined") {
  Module["arguments"] = scriptArgs;
 } else if (typeof arguments != "undefined") {
  Module["arguments"] = arguments;
 }
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
 Module["read"] = function read(url) {
  var xhr = new XMLHttpRequest;
  xhr.open("GET", url, false);
  xhr.send(null);
  return xhr.responseText;
 };
 if (typeof arguments != "undefined") {
  Module["arguments"] = arguments;
 }
 if (typeof console !== "undefined") {
  if (!Module["print"]) Module["print"] = function print(x) {
   console.log(x);
  };
  if (!Module["printErr"]) Module["printErr"] = function printErr(x) {
   console.log(x);
  };
 } else {
  var TRY_USE_DUMP = false;
  if (!Module["print"]) Module["print"] = TRY_USE_DUMP && typeof dump !== "undefined" ? (function(x) {
   dump(x);
  }) : (function(x) {});
 }
 if (ENVIRONMENT_IS_WORKER) {
  Module["load"] = importScripts;
 }
 if (typeof Module["setWindowTitle"] === "undefined") {
  Module["setWindowTitle"] = (function(title) {
   document.title = title;
  });
 }
} else {
 throw "Unknown runtime environment. Where are we?";
}
function globalEval(x) {
 eval.call(null, x);
}
if (!Module["load"] && Module["read"]) {
 Module["load"] = function load(f) {
  globalEval(Module["read"](f));
 };
}
if (!Module["print"]) {
 Module["print"] = (function() {});
}
if (!Module["printErr"]) {
 Module["printErr"] = Module["print"];
}
if (!Module["arguments"]) {
 Module["arguments"] = [];
}
if (!Module["thisProgram"]) {
 Module["thisProgram"] = "./this.program";
}
Module.print = Module["print"];
Module.printErr = Module["printErr"];
Module["preRun"] = [];
Module["postRun"] = [];
for (var key in moduleOverrides) {
 if (moduleOverrides.hasOwnProperty(key)) {
  Module[key] = moduleOverrides[key];
 }
}
var Runtime = {
 setTempRet0: (function(value) {
  tempRet0 = value;
 }),
 getTempRet0: (function() {
  return tempRet0;
 }),
 stackSave: (function() {
  return STACKTOP;
 }),
 stackRestore: (function(stackTop) {
  STACKTOP = stackTop;
 }),
 getNativeTypeSize: (function(type) {
  switch (type) {
  case "i1":
  case "i8":
   return 1;
  case "i16":
   return 2;
  case "i32":
   return 4;
  case "i64":
   return 8;
  case "float":
   return 4;
  case "double":
   return 8;
  default:
   {
    if (type[type.length - 1] === "*") {
     return Runtime.QUANTUM_SIZE;
    } else if (type[0] === "i") {
     var bits = parseInt(type.substr(1));
     assert(bits % 8 === 0);
     return bits / 8;
    } else {
     return 0;
    }
   }
  }
 }),
 getNativeFieldSize: (function(type) {
  return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
 }),
 STACK_ALIGN: 16,
 prepVararg: (function(ptr, type) {
  if (type === "double" || type === "i64") {
   if (ptr & 7) {
    assert((ptr & 7) === 4);
    ptr += 4;
   }
  } else {
   assert((ptr & 3) === 0);
  }
  return ptr;
 }),
 getAlignSize: (function(type, size, vararg) {
  if (!vararg && (type == "i64" || type == "double")) return 8;
  if (!type) return Math.min(size, 8);
  return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
 }),
 dynCall: (function(sig, ptr, args) {
  if (args && args.length) {
   if (!args.splice) args = Array.prototype.slice.call(args);
   args.splice(0, 0, ptr);
   return Module["dynCall_" + sig].apply(null, args);
  } else {
   return Module["dynCall_" + sig].call(null, ptr);
  }
 }),
 functionPointers: [],
 addFunction: (function(func) {
  for (var i = 0; i < Runtime.functionPointers.length; i++) {
   if (!Runtime.functionPointers[i]) {
    Runtime.functionPointers[i] = func;
    return 2 * (1 + i);
   }
  }
  throw "Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.";
 }),
 removeFunction: (function(index) {
  Runtime.functionPointers[(index - 2) / 2] = null;
 }),
 warnOnce: (function(text) {
  if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
  if (!Runtime.warnOnce.shown[text]) {
   Runtime.warnOnce.shown[text] = 1;
   Module.printErr(text);
  }
 }),
 funcWrappers: {},
 getFuncWrapper: (function(func, sig) {
  assert(sig);
  if (!Runtime.funcWrappers[sig]) {
   Runtime.funcWrappers[sig] = {};
  }
  var sigCache = Runtime.funcWrappers[sig];
  if (!sigCache[func]) {
   sigCache[func] = function dynCall_wrapper() {
    return Runtime.dynCall(sig, func, arguments);
   };
  }
  return sigCache[func];
 }),
 getCompilerSetting: (function(name) {
  throw "You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work";
 }),
 stackAlloc: (function(size) {
  var ret = STACKTOP;
  STACKTOP = STACKTOP + size | 0;
  STACKTOP = STACKTOP + 15 & -16;
  return ret;
 }),
 staticAlloc: (function(size) {
  var ret = STATICTOP;
  STATICTOP = STATICTOP + size | 0;
  STATICTOP = STATICTOP + 15 & -16;
  return ret;
 }),
 dynamicAlloc: (function(size) {
  var ret = DYNAMICTOP;
  DYNAMICTOP = DYNAMICTOP + size | 0;
  DYNAMICTOP = DYNAMICTOP + 15 & -16;
  if (DYNAMICTOP >= TOTAL_MEMORY) {
   var success = enlargeMemory();
   if (!success) {
    DYNAMICTOP = ret;
    return 0;
   }
  }
  return ret;
 }),
 alignMemory: (function(size, quantum) {
  var ret = size = Math.ceil(size / (quantum ? quantum : 16)) * (quantum ? quantum : 16);
  return ret;
 }),
 makeBigInt: (function(low, high, unsigned) {
  var ret = unsigned ? +(low >>> 0) + +(high >>> 0) * +4294967296 : +(low >>> 0) + +(high | 0) * +4294967296;
  return ret;
 }),
 GLOBAL_BASE: 8,
 QUANTUM_SIZE: 4,
 __dummy__: 0
};
Module["Runtime"] = Runtime;
var __THREW__ = 0;
var ABORT = false;
var EXITSTATUS = 0;
var undef = 0;
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function assert(condition, text) {
 if (!condition) {
  abort("Assertion failed: " + text);
 }
}
var globalScope = this;
function getCFunc(ident) {
 var func = Module["_" + ident];
 if (!func) {
  try {
   func = eval("_" + ident);
  } catch (e) {}
 }
 assert(func, "Cannot call unknown function " + ident + " (perhaps LLVM optimizations or closure removed it?)");
 return func;
}
var cwrap, ccall;
((function() {
 var JSfuncs = {
  "stackSave": (function() {
   Runtime.stackSave();
  }),
  "stackRestore": (function() {
   Runtime.stackRestore();
  }),
  "arrayToC": (function(arr) {
   var ret = Runtime.stackAlloc(arr.length);
   writeArrayToMemory(arr, ret);
   return ret;
  }),
  "stringToC": (function(str) {
   var ret = 0;
   if (str !== null && str !== undefined && str !== 0) {
    ret = Runtime.stackAlloc((str.length << 2) + 1);
    writeStringToMemory(str, ret);
   }
   return ret;
  })
 };
 var toC = {
  "string": JSfuncs["stringToC"],
  "array": JSfuncs["arrayToC"]
 };
 ccall = function ccallFunc(ident, returnType, argTypes, args, opts) {
  var func = getCFunc(ident);
  var cArgs = [];
  var stack = 0;
  if (args) {
   for (var i = 0; i < args.length; i++) {
    var converter = toC[argTypes[i]];
    if (converter) {
     if (stack === 0) stack = Runtime.stackSave();
     cArgs[i] = converter(args[i]);
    } else {
     cArgs[i] = args[i];
    }
   }
  }
  var ret = func.apply(null, cArgs);
  if (returnType === "string") ret = Pointer_stringify(ret);
  if (stack !== 0) {
   if (opts && opts.async) {
    EmterpreterAsync.asyncFinalizers.push((function() {
     Runtime.stackRestore(stack);
    }));
    return;
   }
   Runtime.stackRestore(stack);
  }
  return ret;
 };
 var sourceRegex = /^function\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/;
 function parseJSFunc(jsfunc) {
  var parsed = jsfunc.toString().match(sourceRegex).slice(1);
  return {
   arguments: parsed[0],
   body: parsed[1],
   returnValue: parsed[2]
  };
 }
 var JSsource = {};
 for (var fun in JSfuncs) {
  if (JSfuncs.hasOwnProperty(fun)) {
   JSsource[fun] = parseJSFunc(JSfuncs[fun]);
  }
 }
 cwrap = function cwrap(ident, returnType, argTypes) {
  argTypes = argTypes || [];
  var cfunc = getCFunc(ident);
  var numericArgs = argTypes.every((function(type) {
   return type === "number";
  }));
  var numericRet = returnType !== "string";
  if (numericRet && numericArgs) {
   return cfunc;
  }
  var argNames = argTypes.map((function(x, i) {
   return "$" + i;
  }));
  var funcstr = "(function(" + argNames.join(",") + ") {";
  var nargs = argTypes.length;
  if (!numericArgs) {
   funcstr += "var stack = " + JSsource["stackSave"].body + ";";
   for (var i = 0; i < nargs; i++) {
    var arg = argNames[i], type = argTypes[i];
    if (type === "number") continue;
    var convertCode = JSsource[type + "ToC"];
    funcstr += "var " + convertCode.arguments + " = " + arg + ";";
    funcstr += convertCode.body + ";";
    funcstr += arg + "=" + convertCode.returnValue + ";";
   }
  }
  var cfuncname = parseJSFunc((function() {
   return cfunc;
  })).returnValue;
  funcstr += "var ret = " + cfuncname + "(" + argNames.join(",") + ");";
  if (!numericRet) {
   var strgfy = parseJSFunc((function() {
    return Pointer_stringify;
   })).returnValue;
   funcstr += "ret = " + strgfy + "(ret);";
  }
  if (!numericArgs) {
   funcstr += JSsource["stackRestore"].body.replace("()", "(stack)") + ";";
  }
  funcstr += "return ret})";
  return eval(funcstr);
 };
}))();
Module["cwrap"] = cwrap;
Module["ccall"] = ccall;
function setValue(ptr, value, type, noSafe) {
 type = type || "i8";
 if (type.charAt(type.length - 1) === "*") type = "i32";
 switch (type) {
 case "i1":
  HEAP8[ptr >> 0] = value;
  break;
 case "i8":
  HEAP8[ptr >> 0] = value;
  break;
 case "i16":
  HEAP16[ptr >> 1] = value;
  break;
 case "i32":
  HEAP32[ptr >> 2] = value;
  break;
 case "i64":
  tempI64 = [ value >>> 0, (tempDouble = value, +Math_abs(tempDouble) >= +1 ? tempDouble > +0 ? (Math_min(+Math_floor(tempDouble / +4294967296), +4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / +4294967296) >>> 0 : 0) ], HEAP32[ptr >> 2] = tempI64[0], HEAP32[ptr + 4 >> 2] = tempI64[1];
  break;
 case "float":
  HEAPF32[ptr >> 2] = value;
  break;
 case "double":
  HEAPF64[ptr >> 3] = value;
  break;
 default:
  abort("invalid type for setValue: " + type);
 }
}
Module["setValue"] = setValue;
function getValue(ptr, type, noSafe) {
 type = type || "i8";
 if (type.charAt(type.length - 1) === "*") type = "i32";
 switch (type) {
 case "i1":
  return HEAP8[ptr >> 0];
 case "i8":
  return HEAP8[ptr >> 0];
 case "i16":
  return HEAP16[ptr >> 1];
 case "i32":
  return HEAP32[ptr >> 2];
 case "i64":
  return HEAP32[ptr >> 2];
 case "float":
  return HEAPF32[ptr >> 2];
 case "double":
  return HEAPF64[ptr >> 3];
 default:
  abort("invalid type for setValue: " + type);
 }
 return null;
}
Module["getValue"] = getValue;
var ALLOC_NORMAL = 0;
var ALLOC_STACK = 1;
var ALLOC_STATIC = 2;
var ALLOC_DYNAMIC = 3;
var ALLOC_NONE = 4;
Module["ALLOC_NORMAL"] = ALLOC_NORMAL;
Module["ALLOC_STACK"] = ALLOC_STACK;
Module["ALLOC_STATIC"] = ALLOC_STATIC;
Module["ALLOC_DYNAMIC"] = ALLOC_DYNAMIC;
Module["ALLOC_NONE"] = ALLOC_NONE;
function allocate(slab, types, allocator, ptr) {
 var zeroinit, size;
 if (typeof slab === "number") {
  zeroinit = true;
  size = slab;
 } else {
  zeroinit = false;
  size = slab.length;
 }
 var singleType = typeof types === "string" ? types : null;
 var ret;
 if (allocator == ALLOC_NONE) {
  ret = ptr;
 } else {
  ret = [ _malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc ][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
 }
 if (zeroinit) {
  var ptr = ret, stop;
  assert((ret & 3) == 0);
  stop = ret + (size & ~3);
  for (; ptr < stop; ptr += 4) {
   HEAP32[ptr >> 2] = 0;
  }
  stop = ret + size;
  while (ptr < stop) {
   HEAP8[ptr++ >> 0] = 0;
  }
  return ret;
 }
 if (singleType === "i8") {
  if (slab.subarray || slab.slice) {
   HEAPU8.set(slab, ret);
  } else {
   HEAPU8.set(new Uint8Array(slab), ret);
  }
  return ret;
 }
 var i = 0, type, typeSize, previousType;
 while (i < size) {
  var curr = slab[i];
  if (typeof curr === "function") {
   curr = Runtime.getFunctionIndex(curr);
  }
  type = singleType || types[i];
  if (type === 0) {
   i++;
   continue;
  }
  if (type == "i64") type = "i32";
  setValue(ret + i, curr, type);
  if (previousType !== type) {
   typeSize = Runtime.getNativeTypeSize(type);
   previousType = type;
  }
  i += typeSize;
 }
 return ret;
}
Module["allocate"] = allocate;
function getMemory(size) {
 if (!staticSealed) return Runtime.staticAlloc(size);
 if (typeof _sbrk !== "undefined" && !_sbrk.called || !runtimeInitialized) return Runtime.dynamicAlloc(size);
 return _malloc(size);
}
Module["getMemory"] = getMemory;
function Pointer_stringify(ptr, length) {
 if (length === 0 || !ptr) return "";
 var hasUtf = 0;
 var t;
 var i = 0;
 while (1) {
  t = HEAPU8[ptr + i >> 0];
  hasUtf |= t;
  if (t == 0 && !length) break;
  i++;
  if (length && i == length) break;
 }
 if (!length) length = i;
 var ret = "";
 if (hasUtf < 128) {
  var MAX_CHUNK = 1024;
  var curr;
  while (length > 0) {
   curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
   ret = ret ? ret + curr : curr;
   ptr += MAX_CHUNK;
   length -= MAX_CHUNK;
  }
  return ret;
 }
 return Module["UTF8ToString"](ptr);
}
Module["Pointer_stringify"] = Pointer_stringify;
function AsciiToString(ptr) {
 var str = "";
 while (1) {
  var ch = HEAP8[ptr++ >> 0];
  if (!ch) return str;
  str += String.fromCharCode(ch);
 }
}
Module["AsciiToString"] = AsciiToString;
function stringToAscii(str, outPtr) {
 return writeAsciiToMemory(str, outPtr, false);
}
Module["stringToAscii"] = stringToAscii;
function UTF8ArrayToString(u8Array, idx) {
 var u0, u1, u2, u3, u4, u5;
 var str = "";
 while (1) {
  u0 = u8Array[idx++];
  if (!u0) return str;
  if (!(u0 & 128)) {
   str += String.fromCharCode(u0);
   continue;
  }
  u1 = u8Array[idx++] & 63;
  if ((u0 & 224) == 192) {
   str += String.fromCharCode((u0 & 31) << 6 | u1);
   continue;
  }
  u2 = u8Array[idx++] & 63;
  if ((u0 & 240) == 224) {
   u0 = (u0 & 15) << 12 | u1 << 6 | u2;
  } else {
   u3 = u8Array[idx++] & 63;
   if ((u0 & 248) == 240) {
    u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | u3;
   } else {
    u4 = u8Array[idx++] & 63;
    if ((u0 & 252) == 248) {
     u0 = (u0 & 3) << 24 | u1 << 18 | u2 << 12 | u3 << 6 | u4;
    } else {
     u5 = u8Array[idx++] & 63;
     u0 = (u0 & 1) << 30 | u1 << 24 | u2 << 18 | u3 << 12 | u4 << 6 | u5;
    }
   }
  }
  if (u0 < 65536) {
   str += String.fromCharCode(u0);
  } else {
   var ch = u0 - 65536;
   str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
  }
 }
}
Module["UTF8ArrayToString"] = UTF8ArrayToString;
function UTF8ToString(ptr) {
 return UTF8ArrayToString(HEAPU8, ptr);
}
Module["UTF8ToString"] = UTF8ToString;
function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
 if (!(maxBytesToWrite > 0)) return 0;
 var startIdx = outIdx;
 var endIdx = outIdx + maxBytesToWrite - 1;
 for (var i = 0; i < str.length; ++i) {
  var u = str.charCodeAt(i);
  if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
  if (u <= 127) {
   if (outIdx >= endIdx) break;
   outU8Array[outIdx++] = u;
  } else if (u <= 2047) {
   if (outIdx + 1 >= endIdx) break;
   outU8Array[outIdx++] = 192 | u >> 6;
   outU8Array[outIdx++] = 128 | u & 63;
  } else if (u <= 65535) {
   if (outIdx + 2 >= endIdx) break;
   outU8Array[outIdx++] = 224 | u >> 12;
   outU8Array[outIdx++] = 128 | u >> 6 & 63;
   outU8Array[outIdx++] = 128 | u & 63;
  } else if (u <= 2097151) {
   if (outIdx + 3 >= endIdx) break;
   outU8Array[outIdx++] = 240 | u >> 18;
   outU8Array[outIdx++] = 128 | u >> 12 & 63;
   outU8Array[outIdx++] = 128 | u >> 6 & 63;
   outU8Array[outIdx++] = 128 | u & 63;
  } else if (u <= 67108863) {
   if (outIdx + 4 >= endIdx) break;
   outU8Array[outIdx++] = 248 | u >> 24;
   outU8Array[outIdx++] = 128 | u >> 18 & 63;
   outU8Array[outIdx++] = 128 | u >> 12 & 63;
   outU8Array[outIdx++] = 128 | u >> 6 & 63;
   outU8Array[outIdx++] = 128 | u & 63;
  } else {
   if (outIdx + 5 >= endIdx) break;
   outU8Array[outIdx++] = 252 | u >> 30;
   outU8Array[outIdx++] = 128 | u >> 24 & 63;
   outU8Array[outIdx++] = 128 | u >> 18 & 63;
   outU8Array[outIdx++] = 128 | u >> 12 & 63;
   outU8Array[outIdx++] = 128 | u >> 6 & 63;
   outU8Array[outIdx++] = 128 | u & 63;
  }
 }
 outU8Array[outIdx] = 0;
 return outIdx - startIdx;
}
Module["stringToUTF8Array"] = stringToUTF8Array;
function stringToUTF8(str, outPtr, maxBytesToWrite) {
 return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
}
Module["stringToUTF8"] = stringToUTF8;
function lengthBytesUTF8(str) {
 var len = 0;
 for (var i = 0; i < str.length; ++i) {
  var u = str.charCodeAt(i);
  if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
  if (u <= 127) {
   ++len;
  } else if (u <= 2047) {
   len += 2;
  } else if (u <= 65535) {
   len += 3;
  } else if (u <= 2097151) {
   len += 4;
  } else if (u <= 67108863) {
   len += 5;
  } else {
   len += 6;
  }
 }
 return len;
}
Module["lengthBytesUTF8"] = lengthBytesUTF8;
function UTF16ToString(ptr) {
 var i = 0;
 var str = "";
 while (1) {
  var codeUnit = HEAP16[ptr + i * 2 >> 1];
  if (codeUnit == 0) return str;
  ++i;
  str += String.fromCharCode(codeUnit);
 }
}
Module["UTF16ToString"] = UTF16ToString;
function stringToUTF16(str, outPtr, maxBytesToWrite) {
 if (maxBytesToWrite === undefined) {
  maxBytesToWrite = 2147483647;
 }
 if (maxBytesToWrite < 2) return 0;
 maxBytesToWrite -= 2;
 var startPtr = outPtr;
 var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
 for (var i = 0; i < numCharsToWrite; ++i) {
  var codeUnit = str.charCodeAt(i);
  HEAP16[outPtr >> 1] = codeUnit;
  outPtr += 2;
 }
 HEAP16[outPtr >> 1] = 0;
 return outPtr - startPtr;
}
Module["stringToUTF16"] = stringToUTF16;
function lengthBytesUTF16(str) {
 return str.length * 2;
}
Module["lengthBytesUTF16"] = lengthBytesUTF16;
function UTF32ToString(ptr) {
 var i = 0;
 var str = "";
 while (1) {
  var utf32 = HEAP32[ptr + i * 4 >> 2];
  if (utf32 == 0) return str;
  ++i;
  if (utf32 >= 65536) {
   var ch = utf32 - 65536;
   str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
  } else {
   str += String.fromCharCode(utf32);
  }
 }
}
Module["UTF32ToString"] = UTF32ToString;
function stringToUTF32(str, outPtr, maxBytesToWrite) {
 if (maxBytesToWrite === undefined) {
  maxBytesToWrite = 2147483647;
 }
 if (maxBytesToWrite < 4) return 0;
 var startPtr = outPtr;
 var endPtr = startPtr + maxBytesToWrite - 4;
 for (var i = 0; i < str.length; ++i) {
  var codeUnit = str.charCodeAt(i);
  if (codeUnit >= 55296 && codeUnit <= 57343) {
   var trailSurrogate = str.charCodeAt(++i);
   codeUnit = 65536 + ((codeUnit & 1023) << 10) | trailSurrogate & 1023;
  }
  HEAP32[outPtr >> 2] = codeUnit;
  outPtr += 4;
  if (outPtr + 4 > endPtr) break;
 }
 HEAP32[outPtr >> 2] = 0;
 return outPtr - startPtr;
}
Module["stringToUTF32"] = stringToUTF32;
function lengthBytesUTF32(str) {
 var len = 0;
 for (var i = 0; i < str.length; ++i) {
  var codeUnit = str.charCodeAt(i);
  if (codeUnit >= 55296 && codeUnit <= 57343) ++i;
  len += 4;
 }
 return len;
}
Module["lengthBytesUTF32"] = lengthBytesUTF32;
function demangle(func) {
 var hasLibcxxabi = !!Module["___cxa_demangle"];
 if (hasLibcxxabi) {
  try {
   var buf = _malloc(func.length);
   writeStringToMemory(func.substr(1), buf);
   var status = _malloc(4);
   var ret = Module["___cxa_demangle"](buf, 0, 0, status);
   if (getValue(status, "i32") === 0 && ret) {
    return Pointer_stringify(ret);
   }
  } catch (e) {} finally {
   if (buf) _free(buf);
   if (status) _free(status);
   if (ret) _free(ret);
  }
 }
 var i = 3;
 var basicTypes = {
  "v": "void",
  "b": "bool",
  "c": "char",
  "s": "short",
  "i": "int",
  "l": "long",
  "f": "float",
  "d": "double",
  "w": "wchar_t",
  "a": "signed char",
  "h": "unsigned char",
  "t": "unsigned short",
  "j": "unsigned int",
  "m": "unsigned long",
  "x": "long long",
  "y": "unsigned long long",
  "z": "..."
 };
 var subs = [];
 var first = true;
 function dump(x) {
  if (x) Module.print(x);
  Module.print(func);
  var pre = "";
  for (var a = 0; a < i; a++) pre += " ";
  Module.print(pre + "^");
 }
 function parseNested() {
  i++;
  if (func[i] === "K") i++;
  var parts = [];
  while (func[i] !== "E") {
   if (func[i] === "S") {
    i++;
    var next = func.indexOf("_", i);
    var num = func.substring(i, next) || 0;
    parts.push(subs[num] || "?");
    i = next + 1;
    continue;
   }
   if (func[i] === "C") {
    parts.push(parts[parts.length - 1]);
    i += 2;
    continue;
   }
   var size = parseInt(func.substr(i));
   var pre = size.toString().length;
   if (!size || !pre) {
    i--;
    break;
   }
   var curr = func.substr(i + pre, size);
   parts.push(curr);
   subs.push(curr);
   i += pre + size;
  }
  i++;
  return parts;
 }
 function parse(rawList, limit, allowVoid) {
  limit = limit || Infinity;
  var ret = "", list = [];
  function flushList() {
   return "(" + list.join(", ") + ")";
  }
  var name;
  if (func[i] === "N") {
   name = parseNested().join("::");
   limit--;
   if (limit === 0) return rawList ? [ name ] : name;
  } else {
   if (func[i] === "K" || first && func[i] === "L") i++;
   var size = parseInt(func.substr(i));
   if (size) {
    var pre = size.toString().length;
    name = func.substr(i + pre, size);
    i += pre + size;
   }
  }
  first = false;
  if (func[i] === "I") {
   i++;
   var iList = parse(true);
   var iRet = parse(true, 1, true);
   ret += iRet[0] + " " + name + "<" + iList.join(", ") + ">";
  } else {
   ret = name;
  }
  paramLoop : while (i < func.length && limit-- > 0) {
   var c = func[i++];
   if (c in basicTypes) {
    list.push(basicTypes[c]);
   } else {
    switch (c) {
    case "P":
     list.push(parse(true, 1, true)[0] + "*");
     break;
    case "R":
     list.push(parse(true, 1, true)[0] + "&");
     break;
    case "L":
     {
      i++;
      var end = func.indexOf("E", i);
      var size = end - i;
      list.push(func.substr(i, size));
      i += size + 2;
      break;
     }
    case "A":
     {
      var size = parseInt(func.substr(i));
      i += size.toString().length;
      if (func[i] !== "_") throw "?";
      i++;
      list.push(parse(true, 1, true)[0] + " [" + size + "]");
      break;
     }
    case "E":
     break paramLoop;
    default:
     ret += "?" + c;
     break paramLoop;
    }
   }
  }
  if (!allowVoid && list.length === 1 && list[0] === "void") list = [];
  if (rawList) {
   if (ret) {
    list.push(ret + "?");
   }
   return list;
  } else {
   return ret + flushList();
  }
 }
 var parsed = func;
 try {
  if (func == "Object._main" || func == "_main") {
   return "main()";
  }
  if (typeof func === "number") func = Pointer_stringify(func);
  if (func[0] !== "_") return func;
  if (func[1] !== "_") return func;
  if (func[2] !== "Z") return func;
  switch (func[3]) {
  case "n":
   return "operator new()";
  case "d":
   return "operator delete()";
  }
  parsed = parse();
 } catch (e) {
  parsed += "?";
 }
 if (parsed.indexOf("?") >= 0 && !hasLibcxxabi) {
  Runtime.warnOnce("warning: a problem occurred in builtin C++ name demangling; build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling");
 }
 return parsed;
}
function demangleAll(text) {
 return text.replace(/__Z[\w\d_]+/g, (function(x) {
  var y = demangle(x);
  return x === y ? x : x + " [" + y + "]";
 }));
}
function jsStackTrace() {
 var err = new Error;
 if (!err.stack) {
  try {
   throw new Error(0);
  } catch (e) {
   err = e;
  }
  if (!err.stack) {
   return "(no stack trace available)";
  }
 }
 return err.stack.toString();
}
function stackTrace() {
 return demangleAll(jsStackTrace());
}
Module["stackTrace"] = stackTrace;
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
 if (x % 4096 > 0) {
  x += 4096 - x % 4096;
 }
 return x;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false;
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0;
var DYNAMIC_BASE = 0, DYNAMICTOP = 0;
function enlargeMemory() {
 abort("Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value " + TOTAL_MEMORY + ", (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.");
}
var TOTAL_STACK = Module["TOTAL_STACK"] || 5242880;
var TOTAL_MEMORY = Module["TOTAL_MEMORY"] || 16777216;
var totalMemory = 64 * 1024;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2 * TOTAL_STACK) {
 if (totalMemory < 16 * 1024 * 1024) {
  totalMemory *= 2;
 } else {
  totalMemory += 16 * 1024 * 1024;
 }
}
if (totalMemory !== TOTAL_MEMORY) {
 Module.printErr("increasing TOTAL_MEMORY to " + totalMemory + " to be compliant with the asm.js spec (and given that TOTAL_STACK=" + TOTAL_STACK + ")");
 TOTAL_MEMORY = totalMemory;
}
assert(typeof Int32Array !== "undefined" && typeof Float64Array !== "undefined" && !!(new Int32Array(1))["subarray"] && !!(new Int32Array(1))["set"], "JS engine does not provide full typed array support");
var buffer;
buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, "Typed arrays 2 must be run on a little-endian system");
Module["HEAP"] = HEAP;
Module["buffer"] = buffer;
Module["HEAP8"] = HEAP8;
Module["HEAP16"] = HEAP16;
Module["HEAP32"] = HEAP32;
Module["HEAPU8"] = HEAPU8;
Module["HEAPU16"] = HEAPU16;
Module["HEAPU32"] = HEAPU32;
Module["HEAPF32"] = HEAPF32;
Module["HEAPF64"] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
 while (callbacks.length > 0) {
  var callback = callbacks.shift();
  if (typeof callback == "function") {
   callback();
   continue;
  }
  var func = callback.func;
  if (typeof func === "number") {
   if (callback.arg === undefined) {
    Runtime.dynCall("v", func);
   } else {
    Runtime.dynCall("vi", func, [ callback.arg ]);
   }
  } else {
   func(callback.arg === undefined ? null : callback.arg);
  }
 }
}
var __ATPRERUN__ = [];
var __ATINIT__ = [];
var __ATMAIN__ = [];
var __ATEXIT__ = [];
var __ATPOSTRUN__ = [];
var runtimeInitialized = false;
var runtimeExited = false;
function preRun() {
 if (Module["preRun"]) {
  if (typeof Module["preRun"] == "function") Module["preRun"] = [ Module["preRun"] ];
  while (Module["preRun"].length) {
   addOnPreRun(Module["preRun"].shift());
  }
 }
 callRuntimeCallbacks(__ATPRERUN__);
}
function ensureInitRuntime() {
 if (runtimeInitialized) return;
 runtimeInitialized = true;
 callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
 callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
 callRuntimeCallbacks(__ATEXIT__);
 runtimeExited = true;
}
function postRun() {
 if (Module["postRun"]) {
  if (typeof Module["postRun"] == "function") Module["postRun"] = [ Module["postRun"] ];
  while (Module["postRun"].length) {
   addOnPostRun(Module["postRun"].shift());
  }
 }
 callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(cb) {
 __ATPRERUN__.unshift(cb);
}
Module["addOnPreRun"] = Module.addOnPreRun = addOnPreRun;
function addOnInit(cb) {
 __ATINIT__.unshift(cb);
}
Module["addOnInit"] = Module.addOnInit = addOnInit;
function addOnPreMain(cb) {
 __ATMAIN__.unshift(cb);
}
Module["addOnPreMain"] = Module.addOnPreMain = addOnPreMain;
function addOnExit(cb) {
 __ATEXIT__.unshift(cb);
}
Module["addOnExit"] = Module.addOnExit = addOnExit;
function addOnPostRun(cb) {
 __ATPOSTRUN__.unshift(cb);
}
Module["addOnPostRun"] = Module.addOnPostRun = addOnPostRun;
function intArrayFromString(stringy, dontAddNull, length) {
 var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
 var u8array = new Array(len);
 var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
 if (dontAddNull) u8array.length = numBytesWritten;
 return u8array;
}
Module["intArrayFromString"] = intArrayFromString;
function intArrayToString(array) {
 var ret = [];
 for (var i = 0; i < array.length; i++) {
  var chr = array[i];
  if (chr > 255) {
   chr &= 255;
  }
  ret.push(String.fromCharCode(chr));
 }
 return ret.join("");
}
Module["intArrayToString"] = intArrayToString;
function writeStringToMemory(string, buffer, dontAddNull) {
 var array = intArrayFromString(string, dontAddNull);
 var i = 0;
 while (i < array.length) {
  var chr = array[i];
  HEAP8[buffer + i >> 0] = chr;
  i = i + 1;
 }
}
Module["writeStringToMemory"] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
 for (var i = 0; i < array.length; i++) {
  HEAP8[buffer++ >> 0] = array[i];
 }
}
Module["writeArrayToMemory"] = writeArrayToMemory;
function writeAsciiToMemory(str, buffer, dontAddNull) {
 for (var i = 0; i < str.length; ++i) {
  HEAP8[buffer++ >> 0] = str.charCodeAt(i);
 }
 if (!dontAddNull) HEAP8[buffer >> 0] = 0;
}
Module["writeAsciiToMemory"] = writeAsciiToMemory;
function unSign(value, bits, ignore) {
 if (value >= 0) {
  return value;
 }
 return bits <= 32 ? 2 * Math.abs(1 << bits - 1) + value : Math.pow(2, bits) + value;
}
function reSign(value, bits, ignore) {
 if (value <= 0) {
  return value;
 }
 var half = bits <= 32 ? Math.abs(1 << bits - 1) : Math.pow(2, bits - 1);
 if (value >= half && (bits <= 32 || value > half)) {
  value = -2 * half + value;
 }
 return value;
}
if (!Math["imul"] || Math["imul"](4294967295, 5) !== -5) Math["imul"] = function imul(a, b) {
 var ah = a >>> 16;
 var al = a & 65535;
 var bh = b >>> 16;
 var bl = b & 65535;
 return al * bl + (ah * bl + al * bh << 16) | 0;
};
Math.imul = Math["imul"];
if (!Math["clz32"]) Math["clz32"] = (function(x) {
 x = x >>> 0;
 for (var i = 0; i < 32; i++) {
  if (x & 1 << 31 - i) return i;
 }
 return 32;
});
Math.clz32 = Math["clz32"];
var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;
var Math_clz32 = Math.clz32;
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null;
function getUniqueRunDependency(id) {
 return id;
}
function addRunDependency(id) {
 runDependencies++;
 if (Module["monitorRunDependencies"]) {
  Module["monitorRunDependencies"](runDependencies);
 }
}
Module["addRunDependency"] = addRunDependency;
function removeRunDependency(id) {
 runDependencies--;
 if (Module["monitorRunDependencies"]) {
  Module["monitorRunDependencies"](runDependencies);
 }
 if (runDependencies == 0) {
  if (runDependencyWatcher !== null) {
   clearInterval(runDependencyWatcher);
   runDependencyWatcher = null;
  }
  if (dependenciesFulfilled) {
   var callback = dependenciesFulfilled;
   dependenciesFulfilled = null;
   callback();
  }
 }
}
Module["removeRunDependency"] = removeRunDependency;
Module["preloadedImages"] = {};
Module["preloadedAudios"] = {};
var memoryInitializer = null;
var ASM_CONSTS = [ (function($0, $1) {
 {
  Module.printErr("bad name in getProcAddress: " + [ Pointer_stringify($0), Pointer_stringify($1) ]);
 }
}) ];
function _emscripten_asm_const_2(code, a0, a1) {
 return ASM_CONSTS[code](a0, a1) | 0;
}
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 34544;
__ATINIT__.push({
 func: (function() {
  __GLOBAL__sub_I_iostream_cpp();
 })
});
memoryInitializer = "main.html.mem";
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) {
 HEAP8[tempDoublePtr] = HEAP8[ptr];
 HEAP8[tempDoublePtr + 1] = HEAP8[ptr + 1];
 HEAP8[tempDoublePtr + 2] = HEAP8[ptr + 2];
 HEAP8[tempDoublePtr + 3] = HEAP8[ptr + 3];
}
function copyTempDouble(ptr) {
 HEAP8[tempDoublePtr] = HEAP8[ptr];
 HEAP8[tempDoublePtr + 1] = HEAP8[ptr + 1];
 HEAP8[tempDoublePtr + 2] = HEAP8[ptr + 2];
 HEAP8[tempDoublePtr + 3] = HEAP8[ptr + 3];
 HEAP8[tempDoublePtr + 4] = HEAP8[ptr + 4];
 HEAP8[tempDoublePtr + 5] = HEAP8[ptr + 5];
 HEAP8[tempDoublePtr + 6] = HEAP8[ptr + 6];
 HEAP8[tempDoublePtr + 7] = HEAP8[ptr + 7];
}
var GL = {
 counter: 1,
 lastError: 0,
 buffers: [],
 mappedBuffers: {},
 programs: [],
 framebuffers: [],
 renderbuffers: [],
 textures: [],
 uniforms: [],
 shaders: [],
 vaos: [],
 contexts: [],
 currentContext: null,
 byteSizeByTypeRoot: 5120,
 byteSizeByType: [ 1, 1, 2, 2, 4, 4, 4, 2, 3, 4, 8 ],
 programInfos: {},
 stringCache: {},
 packAlignment: 4,
 unpackAlignment: 4,
 init: (function() {
  GL.miniTempBuffer = new Float32Array(GL.MINI_TEMP_BUFFER_SIZE);
  for (var i = 0; i < GL.MINI_TEMP_BUFFER_SIZE; i++) {
   GL.miniTempBufferViews[i] = GL.miniTempBuffer.subarray(0, i + 1);
  }
 }),
 recordError: function recordError(errorCode) {
  if (!GL.lastError) {
   GL.lastError = errorCode;
  }
 },
 getNewId: (function(table) {
  var ret = GL.counter++;
  for (var i = table.length; i < ret; i++) {
   table[i] = null;
  }
  return ret;
 }),
 MINI_TEMP_BUFFER_SIZE: 16,
 miniTempBuffer: null,
 miniTempBufferViews: [ 0 ],
 getSource: (function(shader, count, string, length) {
  var source = "";
  for (var i = 0; i < count; ++i) {
   var frag;
   if (length) {
    var len = HEAP32[length + i * 4 >> 2];
    if (len < 0) {
     frag = Pointer_stringify(HEAP32[string + i * 4 >> 2]);
    } else {
     frag = Pointer_stringify(HEAP32[string + i * 4 >> 2], len);
    }
   } else {
    frag = Pointer_stringify(HEAP32[string + i * 4 >> 2]);
   }
   source += frag;
  }
  return source;
 }),
 computeImageSize: (function(width, height, sizePerPixel, alignment) {
  function roundedToNextMultipleOf(x, y) {
   return Math.floor((x + y - 1) / y) * y;
  }
  var plainRowSize = width * sizePerPixel;
  var alignedRowSize = roundedToNextMultipleOf(plainRowSize, alignment);
  return height <= 0 ? 0 : (height - 1) * alignedRowSize + plainRowSize;
 }),
 get: (function(name_, p, type) {
  if (!p) {
   GL.recordError(1281);
   return;
  }
  var ret = undefined;
  switch (name_) {
  case 36346:
   ret = 1;
   break;
  case 36344:
   if (type !== "Integer") {
    GL.recordError(1280);
   }
   return;
  case 36345:
   ret = 0;
   break;
  case 34466:
   var formats = GLctx.getParameter(34467);
   ret = formats.length;
   break;
  case 35738:
   ret = 5121;
   break;
  case 35739:
   ret = 6408;
   break;
  }
  if (ret === undefined) {
   var result = GLctx.getParameter(name_);
   switch (typeof result) {
   case "number":
    ret = result;
    break;
   case "boolean":
    ret = result ? 1 : 0;
    break;
   case "string":
    GL.recordError(1280);
    return;
   case "object":
    if (result === null) {
     switch (name_) {
     case 34964:
     case 35725:
     case 34965:
     case 36006:
     case 36007:
     case 32873:
     case 34068:
      {
       ret = 0;
       break;
      }
     default:
      {
       GL.recordError(1280);
       return;
      }
     }
    } else if (result instanceof Float32Array || result instanceof Uint32Array || result instanceof Int32Array || result instanceof Array) {
     for (var i = 0; i < result.length; ++i) {
      switch (type) {
      case "Integer":
       HEAP32[p + i * 4 >> 2] = result[i];
       break;
      case "Float":
       HEAPF32[p + i * 4 >> 2] = result[i];
       break;
      case "Boolean":
       HEAP8[p + i >> 0] = result[i] ? 1 : 0;
       break;
      default:
       throw "internal glGet error, bad type: " + type;
      }
     }
     return;
    } else if (result instanceof WebGLBuffer || result instanceof WebGLProgram || result instanceof WebGLFramebuffer || result instanceof WebGLRenderbuffer || result instanceof WebGLTexture) {
     ret = result.name | 0;
    } else {
     GL.recordError(1280);
     return;
    }
    break;
   default:
    GL.recordError(1280);
    return;
   }
  }
  switch (type) {
  case "Integer":
   HEAP32[p >> 2] = ret;
   break;
  case "Float":
   HEAPF32[p >> 2] = ret;
   break;
  case "Boolean":
   HEAP8[p >> 0] = ret ? 1 : 0;
   break;
  default:
   throw "internal glGet error, bad type: " + type;
  }
 }),
 getTexPixelData: (function(type, format, width, height, pixels, internalFormat) {
  var sizePerPixel;
  var numChannels;
  switch (format) {
  case 6406:
  case 6409:
  case 6402:
  case 6403:
   numChannels = 1;
   break;
  case 6410:
  case 33319:
   numChannels = 2;
   break;
  case 6407:
   numChannels = 3;
   break;
  case 6408:
   numChannels = 4;
   break;
  default:
   GL.recordError(1280);
   return {
    pixels: null,
    internalFormat: 0
   };
  }
  switch (type) {
  case 5121:
   sizePerPixel = numChannels * 1;
   break;
  case 5123:
  case 36193:
   sizePerPixel = numChannels * 2;
   break;
  case 5125:
  case 5126:
   sizePerPixel = numChannels * 4;
   break;
  case 34042:
   sizePerPixel = 4;
   break;
  case 33635:
  case 32819:
  case 32820:
   sizePerPixel = 2;
   break;
  default:
   GL.recordError(1280);
   return {
    pixels: null,
    internalFormat: 0
   };
  }
  var bytes = GL.computeImageSize(width, height, sizePerPixel, GL.unpackAlignment);
  if (type == 5121) {
   pixels = HEAPU8.subarray(pixels, pixels + bytes);
  } else if (type == 5126) {
   pixels = HEAPF32.subarray(pixels >> 2, pixels + bytes >> 2);
  } else if (type == 5125 || type == 34042) {
   pixels = HEAPU32.subarray(pixels >> 2, pixels + bytes >> 2);
  } else {
   pixels = HEAPU16.subarray(pixels >> 1, pixels + bytes >> 1);
  }
  return {
   pixels: pixels,
   internalFormat: internalFormat
  };
 }),
 validateBufferTarget: (function(target) {
  switch (target) {
  case 34962:
  case 34963:
  case 36662:
  case 36663:
  case 35051:
  case 35052:
  case 35882:
  case 35982:
  case 35345:
   return true;
  default:
   return false;
  }
 }),
 createContext: (function(canvas, webGLContextAttributes) {
  if (typeof webGLContextAttributes.majorVersion === "undefined" && typeof webGLContextAttributes.minorVersion === "undefined") {
   webGLContextAttributes.majorVersion = 1;
   webGLContextAttributes.minorVersion = 0;
  }
  var ctx;
  var errorInfo = "?";
  function onContextCreationError(event) {
   errorInfo = event.statusMessage || errorInfo;
  }
  try {
   canvas.addEventListener("webglcontextcreationerror", onContextCreationError, false);
   try {
    if (webGLContextAttributes.majorVersion == 1 && webGLContextAttributes.minorVersion == 0) {
     ctx = canvas.getContext("webgl", webGLContextAttributes) || canvas.getContext("experimental-webgl", webGLContextAttributes);
    } else if (webGLContextAttributes.majorVersion == 2 && webGLContextAttributes.minorVersion == 0) {
     ctx = canvas.getContext("webgl2", webGLContextAttributes) || canvas.getContext("experimental-webgl2", webGLContextAttributes);
    } else {
     throw "Unsupported WebGL context version " + majorVersion + "." + minorVersion + "!";
    }
   } finally {
    canvas.removeEventListener("webglcontextcreationerror", onContextCreationError, false);
   }
   if (!ctx) throw ":(";
  } catch (e) {
   Module.print("Could not create canvas: " + [ errorInfo, e, JSON.stringify(webGLContextAttributes) ]);
   return 0;
  }
  if (!ctx) return 0;
  return GL.registerContext(ctx, webGLContextAttributes);
 }),
 registerContext: (function(ctx, webGLContextAttributes) {
  var handle = GL.getNewId(GL.contexts);
  var context = {
   handle: handle,
   version: webGLContextAttributes.majorVersion,
   GLctx: ctx
  };
  if (ctx.canvas) ctx.canvas.GLctxObject = context;
  GL.contexts[handle] = context;
  if (typeof webGLContextAttributes["enableExtensionsByDefault"] === "undefined" || webGLContextAttributes.enableExtensionsByDefault) {
   GL.initExtensions(context);
  }
  return handle;
 }),
 makeContextCurrent: (function(contextHandle) {
  var context = GL.contexts[contextHandle];
  if (!context) return false;
  GLctx = Module.ctx = context.GLctx;
  GL.currentContext = context;
  return true;
 }),
 getContext: (function(contextHandle) {
  return GL.contexts[contextHandle];
 }),
 deleteContext: (function(contextHandle) {
  if (GL.currentContext === GL.contexts[contextHandle]) GL.currentContext = null;
  if (typeof JSEvents === "object") JSEvents.removeAllHandlersOnTarget(GL.contexts[contextHandle].GLctx.canvas);
  if (GL.contexts[contextHandle] && GL.contexts[contextHandle].GLctx.canvas) GL.contexts[contextHandle].GLctx.canvas.GLctxObject = undefined;
  GL.contexts[contextHandle] = null;
 }),
 initExtensions: (function(context) {
  if (!context) context = GL.currentContext;
  if (context.initExtensionsDone) return;
  context.initExtensionsDone = true;
  var GLctx = context.GLctx;
  context.maxVertexAttribs = GLctx.getParameter(GLctx.MAX_VERTEX_ATTRIBS);
  context.compressionExt = GLctx.getExtension("WEBGL_compressed_texture_s3tc");
  context.anisotropicExt = GLctx.getExtension("EXT_texture_filter_anisotropic");
  context.floatExt = GLctx.getExtension("OES_texture_float");
  context.instancedArraysExt = GLctx.getExtension("ANGLE_instanced_arrays");
  context.vaoExt = GLctx.getExtension("OES_vertex_array_object");
  if (context.version === 2) {
   context.drawBuffersExt = (function(n, bufs) {
    GLctx.drawBuffers(n, bufs);
   });
  } else {
   var ext = GLctx.getExtension("WEBGL_draw_buffers");
   if (ext) {
    context.drawBuffersExt = (function(n, bufs) {
     ext.drawBuffersWEBGL(n, bufs);
    });
   }
  }
  var automaticallyEnabledExtensions = [ "OES_texture_float", "OES_texture_half_float", "OES_standard_derivatives", "OES_vertex_array_object", "WEBGL_compressed_texture_s3tc", "WEBGL_depth_texture", "OES_element_index_uint", "EXT_texture_filter_anisotropic", "ANGLE_instanced_arrays", "OES_texture_float_linear", "OES_texture_half_float_linear", "WEBGL_compressed_texture_atc", "WEBGL_compressed_texture_pvrtc", "EXT_color_buffer_half_float", "WEBGL_color_buffer_float", "EXT_frag_depth", "EXT_sRGB", "WEBGL_draw_buffers", "WEBGL_shared_resources", "EXT_shader_texture_lod" ];
  function shouldEnableAutomatically(extension) {
   var ret = false;
   automaticallyEnabledExtensions.forEach((function(include) {
    if (ext.indexOf(include) != -1) {
     ret = true;
    }
   }));
   return ret;
  }
  var exts = GLctx.getSupportedExtensions();
  if (exts && exts.length > 0) {
   GLctx.getSupportedExtensions().forEach((function(ext) {
    if (automaticallyEnabledExtensions.indexOf(ext) != -1) {
     GLctx.getExtension(ext);
    }
   }));
  }
 }),
 populateUniformTable: (function(program) {
  var p = GL.programs[program];
  GL.programInfos[program] = {
   uniforms: {},
   maxUniformLength: 0,
   maxAttributeLength: -1
  };
  var ptable = GL.programInfos[program];
  var utable = ptable.uniforms;
  var numUniforms = GLctx.getProgramParameter(p, GLctx.ACTIVE_UNIFORMS);
  for (var i = 0; i < numUniforms; ++i) {
   var u = GLctx.getActiveUniform(p, i);
   var name = u.name;
   ptable.maxUniformLength = Math.max(ptable.maxUniformLength, name.length + 1);
   if (name.indexOf("]", name.length - 1) !== -1) {
    var ls = name.lastIndexOf("[");
    name = name.slice(0, ls);
   }
   var loc = GLctx.getUniformLocation(p, name);
   var id = GL.getNewId(GL.uniforms);
   utable[name] = [ u.size, id ];
   GL.uniforms[id] = loc;
   for (var j = 1; j < u.size; ++j) {
    var n = name + "[" + j + "]";
    loc = GLctx.getUniformLocation(p, n);
    id = GL.getNewId(GL.uniforms);
    GL.uniforms[id] = loc;
   }
  }
 })
};
function _emscripten_glIsRenderbuffer(renderbuffer) {
 var rb = GL.renderbuffers[renderbuffer];
 if (!rb) return 0;
 return GLctx.isRenderbuffer(rb);
}
function _emscripten_glGetActiveAttrib(program, index, bufSize, length, size, type, name) {
 program = GL.programs[program];
 var info = GLctx.getActiveAttrib(program, index);
 if (!info) return;
 var infoname = info.name.slice(0, Math.max(0, bufSize - 1));
 if (bufSize > 0 && name) {
  writeStringToMemory(infoname, name);
  if (length) HEAP32[length >> 2] = infoname.length;
 } else {
  if (length) HEAP32[length >> 2] = 0;
 }
 if (size) HEAP32[size >> 2] = info.size;
 if (type) HEAP32[type >> 2] = info.type;
}
function _emscripten_glVertexAttrib3fv(index, v) {
 v = HEAPF32.subarray(v >> 2, v + 12 >> 2);
 GLctx.vertexAttrib3fv(index, v);
}
function _emscripten_glLineWidth(x0) {
 GLctx.lineWidth(x0);
}
var ERRNO_CODES = {
 EPERM: 1,
 ENOENT: 2,
 ESRCH: 3,
 EINTR: 4,
 EIO: 5,
 ENXIO: 6,
 E2BIG: 7,
 ENOEXEC: 8,
 EBADF: 9,
 ECHILD: 10,
 EAGAIN: 11,
 EWOULDBLOCK: 11,
 ENOMEM: 12,
 EACCES: 13,
 EFAULT: 14,
 ENOTBLK: 15,
 EBUSY: 16,
 EEXIST: 17,
 EXDEV: 18,
 ENODEV: 19,
 ENOTDIR: 20,
 EISDIR: 21,
 EINVAL: 22,
 ENFILE: 23,
 EMFILE: 24,
 ENOTTY: 25,
 ETXTBSY: 26,
 EFBIG: 27,
 ENOSPC: 28,
 ESPIPE: 29,
 EROFS: 30,
 EMLINK: 31,
 EPIPE: 32,
 EDOM: 33,
 ERANGE: 34,
 ENOMSG: 42,
 EIDRM: 43,
 ECHRNG: 44,
 EL2NSYNC: 45,
 EL3HLT: 46,
 EL3RST: 47,
 ELNRNG: 48,
 EUNATCH: 49,
 ENOCSI: 50,
 EL2HLT: 51,
 EDEADLK: 35,
 ENOLCK: 37,
 EBADE: 52,
 EBADR: 53,
 EXFULL: 54,
 ENOANO: 55,
 EBADRQC: 56,
 EBADSLT: 57,
 EDEADLOCK: 35,
 EBFONT: 59,
 ENOSTR: 60,
 ENODATA: 61,
 ETIME: 62,
 ENOSR: 63,
 ENONET: 64,
 ENOPKG: 65,
 EREMOTE: 66,
 ENOLINK: 67,
 EADV: 68,
 ESRMNT: 69,
 ECOMM: 70,
 EPROTO: 71,
 EMULTIHOP: 72,
 EDOTDOT: 73,
 EBADMSG: 74,
 ENOTUNIQ: 76,
 EBADFD: 77,
 EREMCHG: 78,
 ELIBACC: 79,
 ELIBBAD: 80,
 ELIBSCN: 81,
 ELIBMAX: 82,
 ELIBEXEC: 83,
 ENOSYS: 38,
 ENOTEMPTY: 39,
 ENAMETOOLONG: 36,
 ELOOP: 40,
 EOPNOTSUPP: 95,
 EPFNOSUPPORT: 96,
 ECONNRESET: 104,
 ENOBUFS: 105,
 EAFNOSUPPORT: 97,
 EPROTOTYPE: 91,
 ENOTSOCK: 88,
 ENOPROTOOPT: 92,
 ESHUTDOWN: 108,
 ECONNREFUSED: 111,
 EADDRINUSE: 98,
 ECONNABORTED: 103,
 ENETUNREACH: 101,
 ENETDOWN: 100,
 ETIMEDOUT: 110,
 EHOSTDOWN: 112,
 EHOSTUNREACH: 113,
 EINPROGRESS: 115,
 EALREADY: 114,
 EDESTADDRREQ: 89,
 EMSGSIZE: 90,
 EPROTONOSUPPORT: 93,
 ESOCKTNOSUPPORT: 94,
 EADDRNOTAVAIL: 99,
 ENETRESET: 102,
 EISCONN: 106,
 ENOTCONN: 107,
 ETOOMANYREFS: 109,
 EUSERS: 87,
 EDQUOT: 122,
 ESTALE: 116,
 ENOTSUP: 95,
 ENOMEDIUM: 123,
 EILSEQ: 84,
 EOVERFLOW: 75,
 ECANCELED: 125,
 ENOTRECOVERABLE: 131,
 EOWNERDEAD: 130,
 ESTRPIPE: 86
};
var ERRNO_MESSAGES = {
 0: "Success",
 1: "Not super-user",
 2: "No such file or directory",
 3: "No such process",
 4: "Interrupted system call",
 5: "I/O error",
 6: "No such device or address",
 7: "Arg list too long",
 8: "Exec format error",
 9: "Bad file number",
 10: "No children",
 11: "No more processes",
 12: "Not enough core",
 13: "Permission denied",
 14: "Bad address",
 15: "Block device required",
 16: "Mount device busy",
 17: "File exists",
 18: "Cross-device link",
 19: "No such device",
 20: "Not a directory",
 21: "Is a directory",
 22: "Invalid argument",
 23: "Too many open files in system",
 24: "Too many open files",
 25: "Not a typewriter",
 26: "Text file busy",
 27: "File too large",
 28: "No space left on device",
 29: "Illegal seek",
 30: "Read only file system",
 31: "Too many links",
 32: "Broken pipe",
 33: "Math arg out of domain of func",
 34: "Math result not representable",
 35: "File locking deadlock error",
 36: "File or path name too long",
 37: "No record locks available",
 38: "Function not implemented",
 39: "Directory not empty",
 40: "Too many symbolic links",
 42: "No message of desired type",
 43: "Identifier removed",
 44: "Channel number out of range",
 45: "Level 2 not synchronized",
 46: "Level 3 halted",
 47: "Level 3 reset",
 48: "Link number out of range",
 49: "Protocol driver not attached",
 50: "No CSI structure available",
 51: "Level 2 halted",
 52: "Invalid exchange",
 53: "Invalid request descriptor",
 54: "Exchange full",
 55: "No anode",
 56: "Invalid request code",
 57: "Invalid slot",
 59: "Bad font file fmt",
 60: "Device not a stream",
 61: "No data (for no delay io)",
 62: "Timer expired",
 63: "Out of streams resources",
 64: "Machine is not on the network",
 65: "Package not installed",
 66: "The object is remote",
 67: "The link has been severed",
 68: "Advertise error",
 69: "Srmount error",
 70: "Communication error on send",
 71: "Protocol error",
 72: "Multihop attempted",
 73: "Cross mount point (not really error)",
 74: "Trying to read unreadable message",
 75: "Value too large for defined data type",
 76: "Given log. name not unique",
 77: "f.d. invalid for this operation",
 78: "Remote address changed",
 79: "Can   access a needed shared lib",
 80: "Accessing a corrupted shared lib",
 81: ".lib section in a.out corrupted",
 82: "Attempting to link in too many libs",
 83: "Attempting to exec a shared library",
 84: "Illegal byte sequence",
 86: "Streams pipe error",
 87: "Too many users",
 88: "Socket operation on non-socket",
 89: "Destination address required",
 90: "Message too long",
 91: "Protocol wrong type for socket",
 92: "Protocol not available",
 93: "Unknown protocol",
 94: "Socket type not supported",
 95: "Not supported",
 96: "Protocol family not supported",
 97: "Address family not supported by protocol family",
 98: "Address already in use",
 99: "Address not available",
 100: "Network interface is not configured",
 101: "Network is unreachable",
 102: "Connection reset by network",
 103: "Connection aborted",
 104: "Connection reset by peer",
 105: "No buffer space available",
 106: "Socket is already connected",
 107: "Socket is not connected",
 108: "Can't send after socket shutdown",
 109: "Too many references",
 110: "Connection timed out",
 111: "Connection refused",
 112: "Host is down",
 113: "Host is unreachable",
 114: "Socket already connected",
 115: "Connection already in progress",
 116: "Stale file handle",
 122: "Quota exceeded",
 123: "No medium (in tape drive)",
 125: "Operation canceled",
 130: "Previous owner died",
 131: "State not recoverable"
};
var ___errno_state = 0;
function ___setErrNo(value) {
 HEAP32[___errno_state >> 2] = value;
 return value;
}
var PATH = {
 splitPath: (function(filename) {
  var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
  return splitPathRe.exec(filename).slice(1);
 }),
 normalizeArray: (function(parts, allowAboveRoot) {
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
   var last = parts[i];
   if (last === ".") {
    parts.splice(i, 1);
   } else if (last === "..") {
    parts.splice(i, 1);
    up++;
   } else if (up) {
    parts.splice(i, 1);
    up--;
   }
  }
  if (allowAboveRoot) {
   for (; up--; up) {
    parts.unshift("..");
   }
  }
  return parts;
 }),
 normalize: (function(path) {
  var isAbsolute = path.charAt(0) === "/", trailingSlash = path.substr(-1) === "/";
  path = PATH.normalizeArray(path.split("/").filter((function(p) {
   return !!p;
  })), !isAbsolute).join("/");
  if (!path && !isAbsolute) {
   path = ".";
  }
  if (path && trailingSlash) {
   path += "/";
  }
  return (isAbsolute ? "/" : "") + path;
 }),
 dirname: (function(path) {
  var result = PATH.splitPath(path), root = result[0], dir = result[1];
  if (!root && !dir) {
   return ".";
  }
  if (dir) {
   dir = dir.substr(0, dir.length - 1);
  }
  return root + dir;
 }),
 basename: (function(path) {
  if (path === "/") return "/";
  var lastSlash = path.lastIndexOf("/");
  if (lastSlash === -1) return path;
  return path.substr(lastSlash + 1);
 }),
 extname: (function(path) {
  return PATH.splitPath(path)[3];
 }),
 join: (function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return PATH.normalize(paths.join("/"));
 }),
 join2: (function(l, r) {
  return PATH.normalize(l + "/" + r);
 }),
 resolve: (function() {
  var resolvedPath = "", resolvedAbsolute = false;
  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
   var path = i >= 0 ? arguments[i] : FS.cwd();
   if (typeof path !== "string") {
    throw new TypeError("Arguments to path.resolve must be strings");
   } else if (!path) {
    return "";
   }
   resolvedPath = path + "/" + resolvedPath;
   resolvedAbsolute = path.charAt(0) === "/";
  }
  resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter((function(p) {
   return !!p;
  })), !resolvedAbsolute).join("/");
  return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
 }),
 relative: (function(from, to) {
  from = PATH.resolve(from).substr(1);
  to = PATH.resolve(to).substr(1);
  function trim(arr) {
   var start = 0;
   for (; start < arr.length; start++) {
    if (arr[start] !== "") break;
   }
   var end = arr.length - 1;
   for (; end >= 0; end--) {
    if (arr[end] !== "") break;
   }
   if (start > end) return [];
   return arr.slice(start, end - start + 1);
  }
  var fromParts = trim(from.split("/"));
  var toParts = trim(to.split("/"));
  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
   if (fromParts[i] !== toParts[i]) {
    samePartsLength = i;
    break;
   }
  }
  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
   outputParts.push("..");
  }
  outputParts = outputParts.concat(toParts.slice(samePartsLength));
  return outputParts.join("/");
 })
};
var TTY = {
 ttys: [],
 init: (function() {}),
 shutdown: (function() {}),
 register: (function(dev, ops) {
  TTY.ttys[dev] = {
   input: [],
   output: [],
   ops: ops
  };
  FS.registerDevice(dev, TTY.stream_ops);
 }),
 stream_ops: {
  open: (function(stream) {
   var tty = TTY.ttys[stream.node.rdev];
   if (!tty) {
    throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
   }
   stream.tty = tty;
   stream.seekable = false;
  }),
  close: (function(stream) {
   stream.tty.ops.flush(stream.tty);
  }),
  flush: (function(stream) {
   stream.tty.ops.flush(stream.tty);
  }),
  read: (function(stream, buffer, offset, length, pos) {
   if (!stream.tty || !stream.tty.ops.get_char) {
    throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
   }
   var bytesRead = 0;
   for (var i = 0; i < length; i++) {
    var result;
    try {
     result = stream.tty.ops.get_char(stream.tty);
    } catch (e) {
     throw new FS.ErrnoError(ERRNO_CODES.EIO);
    }
    if (result === undefined && bytesRead === 0) {
     throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
    }
    if (result === null || result === undefined) break;
    bytesRead++;
    buffer[offset + i] = result;
   }
   if (bytesRead) {
    stream.node.timestamp = Date.now();
   }
   return bytesRead;
  }),
  write: (function(stream, buffer, offset, length, pos) {
   if (!stream.tty || !stream.tty.ops.put_char) {
    throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
   }
   for (var i = 0; i < length; i++) {
    try {
     stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
    } catch (e) {
     throw new FS.ErrnoError(ERRNO_CODES.EIO);
    }
   }
   if (length) {
    stream.node.timestamp = Date.now();
   }
   return i;
  })
 },
 default_tty_ops: {
  get_char: (function(tty) {
   if (!tty.input.length) {
    var result = null;
    if (ENVIRONMENT_IS_NODE) {
     var BUFSIZE = 256;
     var buf = new Buffer(BUFSIZE);
     var bytesRead = 0;
     var fd = process.stdin.fd;
     var usingDevice = false;
     try {
      fd = fs.openSync("/dev/stdin", "r");
      usingDevice = true;
     } catch (e) {}
     bytesRead = fs.readSync(fd, buf, 0, BUFSIZE, null);
     if (usingDevice) {
      fs.closeSync(fd);
     }
     if (bytesRead > 0) {
      result = buf.slice(0, bytesRead).toString("utf-8");
     } else {
      result = null;
     }
    } else if (typeof window != "undefined" && typeof window.prompt == "function") {
     result = window.prompt("Input: ");
     if (result !== null) {
      result += "\n";
     }
    } else if (typeof readline == "function") {
     result = readline();
     if (result !== null) {
      result += "\n";
     }
    }
    if (!result) {
     return null;
    }
    tty.input = intArrayFromString(result, true);
   }
   return tty.input.shift();
  }),
  put_char: (function(tty, val) {
   if (val === null || val === 10) {
    Module["print"](UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   } else {
    if (val != 0) tty.output.push(val);
   }
  }),
  flush: (function(tty) {
   if (tty.output && tty.output.length > 0) {
    Module["print"](UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   }
  })
 },
 default_tty1_ops: {
  put_char: (function(tty, val) {
   if (val === null || val === 10) {
    Module["printErr"](UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   } else {
    if (val != 0) tty.output.push(val);
   }
  }),
  flush: (function(tty) {
   if (tty.output && tty.output.length > 0) {
    Module["printErr"](UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   }
  })
 }
};
var MEMFS = {
 ops_table: null,
 mount: (function(mount) {
  return MEMFS.createNode(null, "/", 16384 | 511, 0);
 }),
 createNode: (function(parent, name, mode, dev) {
  if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }
  if (!MEMFS.ops_table) {
   MEMFS.ops_table = {
    dir: {
     node: {
      getattr: MEMFS.node_ops.getattr,
      setattr: MEMFS.node_ops.setattr,
      lookup: MEMFS.node_ops.lookup,
      mknod: MEMFS.node_ops.mknod,
      rename: MEMFS.node_ops.rename,
      unlink: MEMFS.node_ops.unlink,
      rmdir: MEMFS.node_ops.rmdir,
      readdir: MEMFS.node_ops.readdir,
      symlink: MEMFS.node_ops.symlink
     },
     stream: {
      llseek: MEMFS.stream_ops.llseek
     }
    },
    file: {
     node: {
      getattr: MEMFS.node_ops.getattr,
      setattr: MEMFS.node_ops.setattr
     },
     stream: {
      llseek: MEMFS.stream_ops.llseek,
      read: MEMFS.stream_ops.read,
      write: MEMFS.stream_ops.write,
      allocate: MEMFS.stream_ops.allocate,
      mmap: MEMFS.stream_ops.mmap,
      msync: MEMFS.stream_ops.msync
     }
    },
    link: {
     node: {
      getattr: MEMFS.node_ops.getattr,
      setattr: MEMFS.node_ops.setattr,
      readlink: MEMFS.node_ops.readlink
     },
     stream: {}
    },
    chrdev: {
     node: {
      getattr: MEMFS.node_ops.getattr,
      setattr: MEMFS.node_ops.setattr
     },
     stream: FS.chrdev_stream_ops
    }
   };
  }
  var node = FS.createNode(parent, name, mode, dev);
  if (FS.isDir(node.mode)) {
   node.node_ops = MEMFS.ops_table.dir.node;
   node.stream_ops = MEMFS.ops_table.dir.stream;
   node.contents = {};
  } else if (FS.isFile(node.mode)) {
   node.node_ops = MEMFS.ops_table.file.node;
   node.stream_ops = MEMFS.ops_table.file.stream;
   node.usedBytes = 0;
   node.contents = null;
  } else if (FS.isLink(node.mode)) {
   node.node_ops = MEMFS.ops_table.link.node;
   node.stream_ops = MEMFS.ops_table.link.stream;
  } else if (FS.isChrdev(node.mode)) {
   node.node_ops = MEMFS.ops_table.chrdev.node;
   node.stream_ops = MEMFS.ops_table.chrdev.stream;
  }
  node.timestamp = Date.now();
  if (parent) {
   parent.contents[name] = node;
  }
  return node;
 }),
 getFileDataAsRegularArray: (function(node) {
  if (node.contents && node.contents.subarray) {
   var arr = [];
   for (var i = 0; i < node.usedBytes; ++i) arr.push(node.contents[i]);
   return arr;
  }
  return node.contents;
 }),
 getFileDataAsTypedArray: (function(node) {
  if (!node.contents) return new Uint8Array;
  if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
  return new Uint8Array(node.contents);
 }),
 expandFileStorage: (function(node, newCapacity) {
  if (node.contents && node.contents.subarray && newCapacity > node.contents.length) {
   node.contents = MEMFS.getFileDataAsRegularArray(node);
   node.usedBytes = node.contents.length;
  }
  if (!node.contents || node.contents.subarray) {
   var prevCapacity = node.contents ? node.contents.buffer.byteLength : 0;
   if (prevCapacity >= newCapacity) return;
   var CAPACITY_DOUBLING_MAX = 1024 * 1024;
   newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) | 0);
   if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
   var oldContents = node.contents;
   node.contents = new Uint8Array(newCapacity);
   if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
   return;
  }
  if (!node.contents && newCapacity > 0) node.contents = [];
  while (node.contents.length < newCapacity) node.contents.push(0);
 }),
 resizeFileStorage: (function(node, newSize) {
  if (node.usedBytes == newSize) return;
  if (newSize == 0) {
   node.contents = null;
   node.usedBytes = 0;
   return;
  }
  if (!node.contents || node.contents.subarray) {
   var oldContents = node.contents;
   node.contents = new Uint8Array(new ArrayBuffer(newSize));
   if (oldContents) {
    node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
   }
   node.usedBytes = newSize;
   return;
  }
  if (!node.contents) node.contents = [];
  if (node.contents.length > newSize) node.contents.length = newSize; else while (node.contents.length < newSize) node.contents.push(0);
  node.usedBytes = newSize;
 }),
 node_ops: {
  getattr: (function(node) {
   var attr = {};
   attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
   attr.ino = node.id;
   attr.mode = node.mode;
   attr.nlink = 1;
   attr.uid = 0;
   attr.gid = 0;
   attr.rdev = node.rdev;
   if (FS.isDir(node.mode)) {
    attr.size = 4096;
   } else if (FS.isFile(node.mode)) {
    attr.size = node.usedBytes;
   } else if (FS.isLink(node.mode)) {
    attr.size = node.link.length;
   } else {
    attr.size = 0;
   }
   attr.atime = new Date(node.timestamp);
   attr.mtime = new Date(node.timestamp);
   attr.ctime = new Date(node.timestamp);
   attr.blksize = 4096;
   attr.blocks = Math.ceil(attr.size / attr.blksize);
   return attr;
  }),
  setattr: (function(node, attr) {
   if (attr.mode !== undefined) {
    node.mode = attr.mode;
   }
   if (attr.timestamp !== undefined) {
    node.timestamp = attr.timestamp;
   }
   if (attr.size !== undefined) {
    MEMFS.resizeFileStorage(node, attr.size);
   }
  }),
  lookup: (function(parent, name) {
   throw FS.genericErrors[ERRNO_CODES.ENOENT];
  }),
  mknod: (function(parent, name, mode, dev) {
   return MEMFS.createNode(parent, name, mode, dev);
  }),
  rename: (function(old_node, new_dir, new_name) {
   if (FS.isDir(old_node.mode)) {
    var new_node;
    try {
     new_node = FS.lookupNode(new_dir, new_name);
    } catch (e) {}
    if (new_node) {
     for (var i in new_node.contents) {
      throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
     }
    }
   }
   delete old_node.parent.contents[old_node.name];
   old_node.name = new_name;
   new_dir.contents[new_name] = old_node;
   old_node.parent = new_dir;
  }),
  unlink: (function(parent, name) {
   delete parent.contents[name];
  }),
  rmdir: (function(parent, name) {
   var node = FS.lookupNode(parent, name);
   for (var i in node.contents) {
    throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
   }
   delete parent.contents[name];
  }),
  readdir: (function(node) {
   var entries = [ ".", ".." ];
   for (var key in node.contents) {
    if (!node.contents.hasOwnProperty(key)) {
     continue;
    }
    entries.push(key);
   }
   return entries;
  }),
  symlink: (function(parent, newname, oldpath) {
   var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
   node.link = oldpath;
   return node;
  }),
  readlink: (function(node) {
   if (!FS.isLink(node.mode)) {
    throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
   }
   return node.link;
  })
 },
 stream_ops: {
  read: (function(stream, buffer, offset, length, position) {
   var contents = stream.node.contents;
   if (position >= stream.node.usedBytes) return 0;
   var size = Math.min(stream.node.usedBytes - position, length);
   assert(size >= 0);
   if (size > 8 && contents.subarray) {
    buffer.set(contents.subarray(position, position + size), offset);
   } else {
    for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
   }
   return size;
  }),
  write: (function(stream, buffer, offset, length, position, canOwn) {
   if (!length) return 0;
   var node = stream.node;
   node.timestamp = Date.now();
   if (buffer.subarray && (!node.contents || node.contents.subarray)) {
    if (canOwn) {
     node.contents = buffer.subarray(offset, offset + length);
     node.usedBytes = length;
     return length;
    } else if (node.usedBytes === 0 && position === 0) {
     node.contents = new Uint8Array(buffer.subarray(offset, offset + length));
     node.usedBytes = length;
     return length;
    } else if (position + length <= node.usedBytes) {
     node.contents.set(buffer.subarray(offset, offset + length), position);
     return length;
    }
   }
   MEMFS.expandFileStorage(node, position + length);
   if (node.contents.subarray && buffer.subarray) node.contents.set(buffer.subarray(offset, offset + length), position); else {
    for (var i = 0; i < length; i++) {
     node.contents[position + i] = buffer[offset + i];
    }
   }
   node.usedBytes = Math.max(node.usedBytes, position + length);
   return length;
  }),
  llseek: (function(stream, offset, whence) {
   var position = offset;
   if (whence === 1) {
    position += stream.position;
   } else if (whence === 2) {
    if (FS.isFile(stream.node.mode)) {
     position += stream.node.usedBytes;
    }
   }
   if (position < 0) {
    throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
   }
   return position;
  }),
  allocate: (function(stream, offset, length) {
   MEMFS.expandFileStorage(stream.node, offset + length);
   stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
  }),
  mmap: (function(stream, buffer, offset, length, position, prot, flags) {
   if (!FS.isFile(stream.node.mode)) {
    throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
   }
   var ptr;
   var allocated;
   var contents = stream.node.contents;
   if (!(flags & 2) && (contents.buffer === buffer || contents.buffer === buffer.buffer)) {
    allocated = false;
    ptr = contents.byteOffset;
   } else {
    if (position > 0 || position + length < stream.node.usedBytes) {
     if (contents.subarray) {
      contents = contents.subarray(position, position + length);
     } else {
      contents = Array.prototype.slice.call(contents, position, position + length);
     }
    }
    allocated = true;
    ptr = _malloc(length);
    if (!ptr) {
     throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
    }
    buffer.set(contents, ptr);
   }
   return {
    ptr: ptr,
    allocated: allocated
   };
  }),
  msync: (function(stream, buffer, offset, length, mmapFlags) {
   if (!FS.isFile(stream.node.mode)) {
    throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
   }
   if (mmapFlags & 2) {
    return 0;
   }
   var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
   return 0;
  })
 }
};
var IDBFS = {
 dbs: {},
 indexedDB: (function() {
  if (typeof indexedDB !== "undefined") return indexedDB;
  var ret = null;
  if (typeof window === "object") ret = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  assert(ret, "IDBFS used, but indexedDB not supported");
  return ret;
 }),
 DB_VERSION: 21,
 DB_STORE_NAME: "FILE_DATA",
 mount: (function(mount) {
  return MEMFS.mount.apply(null, arguments);
 }),
 syncfs: (function(mount, populate, callback) {
  IDBFS.getLocalSet(mount, (function(err, local) {
   if (err) return callback(err);
   IDBFS.getRemoteSet(mount, (function(err, remote) {
    if (err) return callback(err);
    var src = populate ? remote : local;
    var dst = populate ? local : remote;
    IDBFS.reconcile(src, dst, callback);
   }));
  }));
 }),
 getDB: (function(name, callback) {
  var db = IDBFS.dbs[name];
  if (db) {
   return callback(null, db);
  }
  var req;
  try {
   req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
  } catch (e) {
   return callback(e);
  }
  req.onupgradeneeded = (function(e) {
   var db = e.target.result;
   var transaction = e.target.transaction;
   var fileStore;
   if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
    fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
   } else {
    fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
   }
   if (!fileStore.indexNames.contains("timestamp")) {
    fileStore.createIndex("timestamp", "timestamp", {
     unique: false
    });
   }
  });
  req.onsuccess = (function() {
   db = req.result;
   IDBFS.dbs[name] = db;
   callback(null, db);
  });
  req.onerror = (function(e) {
   callback(this.error);
   e.preventDefault();
  });
 }),
 getLocalSet: (function(mount, callback) {
  var entries = {};
  function isRealDir(p) {
   return p !== "." && p !== "..";
  }
  function toAbsolute(root) {
   return (function(p) {
    return PATH.join2(root, p);
   });
  }
  var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  while (check.length) {
   var path = check.pop();
   var stat;
   try {
    stat = FS.stat(path);
   } catch (e) {
    return callback(e);
   }
   if (FS.isDir(stat.mode)) {
    check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
   }
   entries[path] = {
    timestamp: stat.mtime
   };
  }
  return callback(null, {
   type: "local",
   entries: entries
  });
 }),
 getRemoteSet: (function(mount, callback) {
  var entries = {};
  IDBFS.getDB(mount.mountpoint, (function(err, db) {
   if (err) return callback(err);
   var transaction = db.transaction([ IDBFS.DB_STORE_NAME ], "readonly");
   transaction.onerror = (function(e) {
    callback(this.error);
    e.preventDefault();
   });
   var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
   var index = store.index("timestamp");
   index.openKeyCursor().onsuccess = (function(event) {
    var cursor = event.target.result;
    if (!cursor) {
     return callback(null, {
      type: "remote",
      db: db,
      entries: entries
     });
    }
    entries[cursor.primaryKey] = {
     timestamp: cursor.key
    };
    cursor.continue();
   });
  }));
 }),
 loadLocalEntry: (function(path, callback) {
  var stat, node;
  try {
   var lookup = FS.lookupPath(path);
   node = lookup.node;
   stat = FS.stat(path);
  } catch (e) {
   return callback(e);
  }
  if (FS.isDir(stat.mode)) {
   return callback(null, {
    timestamp: stat.mtime,
    mode: stat.mode
   });
  } else if (FS.isFile(stat.mode)) {
   node.contents = MEMFS.getFileDataAsTypedArray(node);
   return callback(null, {
    timestamp: stat.mtime,
    mode: stat.mode,
    contents: node.contents
   });
  } else {
   return callback(new Error("node type not supported"));
  }
 }),
 storeLocalEntry: (function(path, entry, callback) {
  try {
   if (FS.isDir(entry.mode)) {
    FS.mkdir(path, entry.mode);
   } else if (FS.isFile(entry.mode)) {
    FS.writeFile(path, entry.contents, {
     encoding: "binary",
     canOwn: true
    });
   } else {
    return callback(new Error("node type not supported"));
   }
   FS.chmod(path, entry.mode);
   FS.utime(path, entry.timestamp, entry.timestamp);
  } catch (e) {
   return callback(e);
  }
  callback(null);
 }),
 removeLocalEntry: (function(path, callback) {
  try {
   var lookup = FS.lookupPath(path);
   var stat = FS.stat(path);
   if (FS.isDir(stat.mode)) {
    FS.rmdir(path);
   } else if (FS.isFile(stat.mode)) {
    FS.unlink(path);
   }
  } catch (e) {
   return callback(e);
  }
  callback(null);
 }),
 loadRemoteEntry: (function(store, path, callback) {
  var req = store.get(path);
  req.onsuccess = (function(event) {
   callback(null, event.target.result);
  });
  req.onerror = (function(e) {
   callback(this.error);
   e.preventDefault();
  });
 }),
 storeRemoteEntry: (function(store, path, entry, callback) {
  var req = store.put(entry, path);
  req.onsuccess = (function() {
   callback(null);
  });
  req.onerror = (function(e) {
   callback(this.error);
   e.preventDefault();
  });
 }),
 removeRemoteEntry: (function(store, path, callback) {
  var req = store.delete(path);
  req.onsuccess = (function() {
   callback(null);
  });
  req.onerror = (function(e) {
   callback(this.error);
   e.preventDefault();
  });
 }),
 reconcile: (function(src, dst, callback) {
  var total = 0;
  var create = [];
  Object.keys(src.entries).forEach((function(key) {
   var e = src.entries[key];
   var e2 = dst.entries[key];
   if (!e2 || e.timestamp > e2.timestamp) {
    create.push(key);
    total++;
   }
  }));
  var remove = [];
  Object.keys(dst.entries).forEach((function(key) {
   var e = dst.entries[key];
   var e2 = src.entries[key];
   if (!e2) {
    remove.push(key);
    total++;
   }
  }));
  if (!total) {
   return callback(null);
  }
  var errored = false;
  var completed = 0;
  var db = src.type === "remote" ? src.db : dst.db;
  var transaction = db.transaction([ IDBFS.DB_STORE_NAME ], "readwrite");
  var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  function done(err) {
   if (err) {
    if (!done.errored) {
     done.errored = true;
     return callback(err);
    }
    return;
   }
   if (++completed >= total) {
    return callback(null);
   }
  }
  transaction.onerror = (function(e) {
   done(this.error);
   e.preventDefault();
  });
  create.sort().forEach((function(path) {
   if (dst.type === "local") {
    IDBFS.loadRemoteEntry(store, path, (function(err, entry) {
     if (err) return done(err);
     IDBFS.storeLocalEntry(path, entry, done);
    }));
   } else {
    IDBFS.loadLocalEntry(path, (function(err, entry) {
     if (err) return done(err);
     IDBFS.storeRemoteEntry(store, path, entry, done);
    }));
   }
  }));
  remove.sort().reverse().forEach((function(path) {
   if (dst.type === "local") {
    IDBFS.removeLocalEntry(path, done);
   } else {
    IDBFS.removeRemoteEntry(store, path, done);
   }
  }));
 })
};
var NODEFS = {
 isWindows: false,
 staticInit: (function() {
  NODEFS.isWindows = !!process.platform.match(/^win/);
 }),
 mount: (function(mount) {
  assert(ENVIRONMENT_IS_NODE);
  return NODEFS.createNode(null, "/", NODEFS.getMode(mount.opts.root), 0);
 }),
 createNode: (function(parent, name, mode, dev) {
  if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  var node = FS.createNode(parent, name, mode);
  node.node_ops = NODEFS.node_ops;
  node.stream_ops = NODEFS.stream_ops;
  return node;
 }),
 getMode: (function(path) {
  var stat;
  try {
   stat = fs.lstatSync(path);
   if (NODEFS.isWindows) {
    stat.mode = stat.mode | (stat.mode & 146) >> 1;
   }
  } catch (e) {
   if (!e.code) throw e;
   throw new FS.ErrnoError(ERRNO_CODES[e.code]);
  }
  return stat.mode;
 }),
 realPath: (function(node) {
  var parts = [];
  while (node.parent !== node) {
   parts.push(node.name);
   node = node.parent;
  }
  parts.push(node.mount.opts.root);
  parts.reverse();
  return PATH.join.apply(null, parts);
 }),
 flagsToPermissionStringMap: {
  0: "r",
  1: "r+",
  2: "r+",
  64: "r",
  65: "r+",
  66: "r+",
  129: "rx+",
  193: "rx+",
  514: "w+",
  577: "w",
  578: "w+",
  705: "wx",
  706: "wx+",
  1024: "a",
  1025: "a",
  1026: "a+",
  1089: "a",
  1090: "a+",
  1153: "ax",
  1154: "ax+",
  1217: "ax",
  1218: "ax+",
  4096: "rs",
  4098: "rs+"
 },
 flagsToPermissionString: (function(flags) {
  if (flags in NODEFS.flagsToPermissionStringMap) {
   return NODEFS.flagsToPermissionStringMap[flags];
  } else {
   return flags;
  }
 }),
 node_ops: {
  getattr: (function(node) {
   var path = NODEFS.realPath(node);
   var stat;
   try {
    stat = fs.lstatSync(path);
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
   if (NODEFS.isWindows && !stat.blksize) {
    stat.blksize = 4096;
   }
   if (NODEFS.isWindows && !stat.blocks) {
    stat.blocks = (stat.size + stat.blksize - 1) / stat.blksize | 0;
   }
   return {
    dev: stat.dev,
    ino: stat.ino,
    mode: stat.mode,
    nlink: stat.nlink,
    uid: stat.uid,
    gid: stat.gid,
    rdev: stat.rdev,
    size: stat.size,
    atime: stat.atime,
    mtime: stat.mtime,
    ctime: stat.ctime,
    blksize: stat.blksize,
    blocks: stat.blocks
   };
  }),
  setattr: (function(node, attr) {
   var path = NODEFS.realPath(node);
   try {
    if (attr.mode !== undefined) {
     fs.chmodSync(path, attr.mode);
     node.mode = attr.mode;
    }
    if (attr.timestamp !== undefined) {
     var date = new Date(attr.timestamp);
     fs.utimesSync(path, date, date);
    }
    if (attr.size !== undefined) {
     fs.truncateSync(path, attr.size);
    }
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  }),
  lookup: (function(parent, name) {
   var path = PATH.join2(NODEFS.realPath(parent), name);
   var mode = NODEFS.getMode(path);
   return NODEFS.createNode(parent, name, mode);
  }),
  mknod: (function(parent, name, mode, dev) {
   var node = NODEFS.createNode(parent, name, mode, dev);
   var path = NODEFS.realPath(node);
   try {
    if (FS.isDir(node.mode)) {
     fs.mkdirSync(path, node.mode);
    } else {
     fs.writeFileSync(path, "", {
      mode: node.mode
     });
    }
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
   return node;
  }),
  rename: (function(oldNode, newDir, newName) {
   var oldPath = NODEFS.realPath(oldNode);
   var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
   try {
    fs.renameSync(oldPath, newPath);
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  }),
  unlink: (function(parent, name) {
   var path = PATH.join2(NODEFS.realPath(parent), name);
   try {
    fs.unlinkSync(path);
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  }),
  rmdir: (function(parent, name) {
   var path = PATH.join2(NODEFS.realPath(parent), name);
   try {
    fs.rmdirSync(path);
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  }),
  readdir: (function(node) {
   var path = NODEFS.realPath(node);
   try {
    return fs.readdirSync(path);
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  }),
  symlink: (function(parent, newName, oldPath) {
   var newPath = PATH.join2(NODEFS.realPath(parent), newName);
   try {
    fs.symlinkSync(oldPath, newPath);
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  }),
  readlink: (function(node) {
   var path = NODEFS.realPath(node);
   try {
    path = fs.readlinkSync(path);
    path = NODEJS_PATH.relative(NODEJS_PATH.resolve(node.mount.opts.root), path);
    return path;
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  })
 },
 stream_ops: {
  open: (function(stream) {
   var path = NODEFS.realPath(stream.node);
   try {
    if (FS.isFile(stream.node.mode)) {
     stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
    }
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  }),
  close: (function(stream) {
   try {
    if (FS.isFile(stream.node.mode) && stream.nfd) {
     fs.closeSync(stream.nfd);
    }
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  }),
  read: (function(stream, buffer, offset, length, position) {
   if (length === 0) return 0;
   var nbuffer = new Buffer(length);
   var res;
   try {
    res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
   } catch (e) {
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
   if (res > 0) {
    for (var i = 0; i < res; i++) {
     buffer[offset + i] = nbuffer[i];
    }
   }
   return res;
  }),
  write: (function(stream, buffer, offset, length, position) {
   var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
   var res;
   try {
    res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
   } catch (e) {
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
   return res;
  }),
  llseek: (function(stream, offset, whence) {
   var position = offset;
   if (whence === 1) {
    position += stream.position;
   } else if (whence === 2) {
    if (FS.isFile(stream.node.mode)) {
     try {
      var stat = fs.fstatSync(stream.nfd);
      position += stat.size;
     } catch (e) {
      throw new FS.ErrnoError(ERRNO_CODES[e.code]);
     }
    }
   }
   if (position < 0) {
    throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
   }
   return position;
  })
 }
};
var _stdin = allocate(1, "i32*", ALLOC_STATIC);
var _stdout = allocate(1, "i32*", ALLOC_STATIC);
var _stderr = allocate(1, "i32*", ALLOC_STATIC);
function _fflush(stream) {}
var FS = {
 root: null,
 mounts: [],
 devices: [ null ],
 streams: [],
 nextInode: 1,
 nameTable: null,
 currentPath: "/",
 initialized: false,
 ignorePermissions: true,
 trackingDelegate: {},
 tracking: {
  openFlags: {
   READ: 1,
   WRITE: 2
  }
 },
 ErrnoError: null,
 genericErrors: {},
 handleFSError: (function(e) {
  if (!(e instanceof FS.ErrnoError)) throw e + " : " + stackTrace();
  return ___setErrNo(e.errno);
 }),
 lookupPath: (function(path, opts) {
  path = PATH.resolve(FS.cwd(), path);
  opts = opts || {};
  if (!path) return {
   path: "",
   node: null
  };
  var defaults = {
   follow_mount: true,
   recurse_count: 0
  };
  for (var key in defaults) {
   if (opts[key] === undefined) {
    opts[key] = defaults[key];
   }
  }
  if (opts.recurse_count > 8) {
   throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
  }
  var parts = PATH.normalizeArray(path.split("/").filter((function(p) {
   return !!p;
  })), false);
  var current = FS.root;
  var current_path = "/";
  for (var i = 0; i < parts.length; i++) {
   var islast = i === parts.length - 1;
   if (islast && opts.parent) {
    break;
   }
   current = FS.lookupNode(current, parts[i]);
   current_path = PATH.join2(current_path, parts[i]);
   if (FS.isMountpoint(current)) {
    if (!islast || islast && opts.follow_mount) {
     current = current.mounted.root;
    }
   }
   if (!islast || opts.follow) {
    var count = 0;
    while (FS.isLink(current.mode)) {
     var link = FS.readlink(current_path);
     current_path = PATH.resolve(PATH.dirname(current_path), link);
     var lookup = FS.lookupPath(current_path, {
      recurse_count: opts.recurse_count
     });
     current = lookup.node;
     if (count++ > 40) {
      throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
     }
    }
   }
  }
  return {
   path: current_path,
   node: current
  };
 }),
 getPath: (function(node) {
  var path;
  while (true) {
   if (FS.isRoot(node)) {
    var mount = node.mount.mountpoint;
    if (!path) return mount;
    return mount[mount.length - 1] !== "/" ? mount + "/" + path : mount + path;
   }
   path = path ? node.name + "/" + path : node.name;
   node = node.parent;
  }
 }),
 hashName: (function(parentid, name) {
  var hash = 0;
  for (var i = 0; i < name.length; i++) {
   hash = (hash << 5) - hash + name.charCodeAt(i) | 0;
  }
  return (parentid + hash >>> 0) % FS.nameTable.length;
 }),
 hashAddNode: (function(node) {
  var hash = FS.hashName(node.parent.id, node.name);
  node.name_next = FS.nameTable[hash];
  FS.nameTable[hash] = node;
 }),
 hashRemoveNode: (function(node) {
  var hash = FS.hashName(node.parent.id, node.name);
  if (FS.nameTable[hash] === node) {
   FS.nameTable[hash] = node.name_next;
  } else {
   var current = FS.nameTable[hash];
   while (current) {
    if (current.name_next === node) {
     current.name_next = node.name_next;
     break;
    }
    current = current.name_next;
   }
  }
 }),
 lookupNode: (function(parent, name) {
  var err = FS.mayLookup(parent);
  if (err) {
   throw new FS.ErrnoError(err, parent);
  }
  var hash = FS.hashName(parent.id, name);
  for (var node = FS.nameTable[hash]; node; node = node.name_next) {
   var nodeName = node.name;
   if (node.parent.id === parent.id && nodeName === name) {
    return node;
   }
  }
  return FS.lookup(parent, name);
 }),
 createNode: (function(parent, name, mode, rdev) {
  if (!FS.FSNode) {
   FS.FSNode = (function(parent, name, mode, rdev) {
    if (!parent) {
     parent = this;
    }
    this.parent = parent;
    this.mount = parent.mount;
    this.mounted = null;
    this.id = FS.nextInode++;
    this.name = name;
    this.mode = mode;
    this.node_ops = {};
    this.stream_ops = {};
    this.rdev = rdev;
   });
   FS.FSNode.prototype = {};
   var readMode = 292 | 73;
   var writeMode = 146;
   Object.defineProperties(FS.FSNode.prototype, {
    read: {
     get: (function() {
      return (this.mode & readMode) === readMode;
     }),
     set: (function(val) {
      val ? this.mode |= readMode : this.mode &= ~readMode;
     })
    },
    write: {
     get: (function() {
      return (this.mode & writeMode) === writeMode;
     }),
     set: (function(val) {
      val ? this.mode |= writeMode : this.mode &= ~writeMode;
     })
    },
    isFolder: {
     get: (function() {
      return FS.isDir(this.mode);
     })
    },
    isDevice: {
     get: (function() {
      return FS.isChrdev(this.mode);
     })
    }
   });
  }
  var node = new FS.FSNode(parent, name, mode, rdev);
  FS.hashAddNode(node);
  return node;
 }),
 destroyNode: (function(node) {
  FS.hashRemoveNode(node);
 }),
 isRoot: (function(node) {
  return node === node.parent;
 }),
 isMountpoint: (function(node) {
  return !!node.mounted;
 }),
 isFile: (function(mode) {
  return (mode & 61440) === 32768;
 }),
 isDir: (function(mode) {
  return (mode & 61440) === 16384;
 }),
 isLink: (function(mode) {
  return (mode & 61440) === 40960;
 }),
 isChrdev: (function(mode) {
  return (mode & 61440) === 8192;
 }),
 isBlkdev: (function(mode) {
  return (mode & 61440) === 24576;
 }),
 isFIFO: (function(mode) {
  return (mode & 61440) === 4096;
 }),
 isSocket: (function(mode) {
  return (mode & 49152) === 49152;
 }),
 flagModes: {
  "r": 0,
  "rs": 1052672,
  "r+": 2,
  "w": 577,
  "wx": 705,
  "xw": 705,
  "w+": 578,
  "wx+": 706,
  "xw+": 706,
  "a": 1089,
  "ax": 1217,
  "xa": 1217,
  "a+": 1090,
  "ax+": 1218,
  "xa+": 1218
 },
 modeStringToFlags: (function(str) {
  var flags = FS.flagModes[str];
  if (typeof flags === "undefined") {
   throw new Error("Unknown file open mode: " + str);
  }
  return flags;
 }),
 flagsToPermissionString: (function(flag) {
  var accmode = flag & 2097155;
  var perms = [ "r", "w", "rw" ][accmode];
  if (flag & 512) {
   perms += "w";
  }
  return perms;
 }),
 nodePermissions: (function(node, perms) {
  if (FS.ignorePermissions) {
   return 0;
  }
  if (perms.indexOf("r") !== -1 && !(node.mode & 292)) {
   return ERRNO_CODES.EACCES;
  } else if (perms.indexOf("w") !== -1 && !(node.mode & 146)) {
   return ERRNO_CODES.EACCES;
  } else if (perms.indexOf("x") !== -1 && !(node.mode & 73)) {
   return ERRNO_CODES.EACCES;
  }
  return 0;
 }),
 mayLookup: (function(dir) {
  var err = FS.nodePermissions(dir, "x");
  if (err) return err;
  if (!dir.node_ops.lookup) return ERRNO_CODES.EACCES;
  return 0;
 }),
 mayCreate: (function(dir, name) {
  try {
   var node = FS.lookupNode(dir, name);
   return ERRNO_CODES.EEXIST;
  } catch (e) {}
  return FS.nodePermissions(dir, "wx");
 }),
 mayDelete: (function(dir, name, isdir) {
  var node;
  try {
   node = FS.lookupNode(dir, name);
  } catch (e) {
   return e.errno;
  }
  var err = FS.nodePermissions(dir, "wx");
  if (err) {
   return err;
  }
  if (isdir) {
   if (!FS.isDir(node.mode)) {
    return ERRNO_CODES.ENOTDIR;
   }
   if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
    return ERRNO_CODES.EBUSY;
   }
  } else {
   if (FS.isDir(node.mode)) {
    return ERRNO_CODES.EISDIR;
   }
  }
  return 0;
 }),
 mayOpen: (function(node, flags) {
  if (!node) {
   return ERRNO_CODES.ENOENT;
  }
  if (FS.isLink(node.mode)) {
   return ERRNO_CODES.ELOOP;
  } else if (FS.isDir(node.mode)) {
   if ((flags & 2097155) !== 0 || flags & 512) {
    return ERRNO_CODES.EISDIR;
   }
  }
  return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
 }),
 MAX_OPEN_FDS: 4096,
 nextfd: (function(fd_start, fd_end) {
  fd_start = fd_start || 0;
  fd_end = fd_end || FS.MAX_OPEN_FDS;
  for (var fd = fd_start; fd <= fd_end; fd++) {
   if (!FS.streams[fd]) {
    return fd;
   }
  }
  throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
 }),
 getStream: (function(fd) {
  return FS.streams[fd];
 }),
 createStream: (function(stream, fd_start, fd_end) {
  if (!FS.FSStream) {
   FS.FSStream = (function() {});
   FS.FSStream.prototype = {};
   Object.defineProperties(FS.FSStream.prototype, {
    object: {
     get: (function() {
      return this.node;
     }),
     set: (function(val) {
      this.node = val;
     })
    },
    isRead: {
     get: (function() {
      return (this.flags & 2097155) !== 1;
     })
    },
    isWrite: {
     get: (function() {
      return (this.flags & 2097155) !== 0;
     })
    },
    isAppend: {
     get: (function() {
      return this.flags & 1024;
     })
    }
   });
  }
  var newStream = new FS.FSStream;
  for (var p in stream) {
   newStream[p] = stream[p];
  }
  stream = newStream;
  var fd = FS.nextfd(fd_start, fd_end);
  stream.fd = fd;
  FS.streams[fd] = stream;
  return stream;
 }),
 closeStream: (function(fd) {
  FS.streams[fd] = null;
 }),
 getStreamFromPtr: (function(ptr) {
  return FS.streams[ptr - 1];
 }),
 getPtrForStream: (function(stream) {
  return stream ? stream.fd + 1 : 0;
 }),
 chrdev_stream_ops: {
  open: (function(stream) {
   var device = FS.getDevice(stream.node.rdev);
   stream.stream_ops = device.stream_ops;
   if (stream.stream_ops.open) {
    stream.stream_ops.open(stream);
   }
  }),
  llseek: (function() {
   throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
  })
 },
 major: (function(dev) {
  return dev >> 8;
 }),
 minor: (function(dev) {
  return dev & 255;
 }),
 makedev: (function(ma, mi) {
  return ma << 8 | mi;
 }),
 registerDevice: (function(dev, ops) {
  FS.devices[dev] = {
   stream_ops: ops
  };
 }),
 getDevice: (function(dev) {
  return FS.devices[dev];
 }),
 getMounts: (function(mount) {
  var mounts = [];
  var check = [ mount ];
  while (check.length) {
   var m = check.pop();
   mounts.push(m);
   check.push.apply(check, m.mounts);
  }
  return mounts;
 }),
 syncfs: (function(populate, callback) {
  if (typeof populate === "function") {
   callback = populate;
   populate = false;
  }
  var mounts = FS.getMounts(FS.root.mount);
  var completed = 0;
  function done(err) {
   if (err) {
    if (!done.errored) {
     done.errored = true;
     return callback(err);
    }
    return;
   }
   if (++completed >= mounts.length) {
    callback(null);
   }
  }
  mounts.forEach((function(mount) {
   if (!mount.type.syncfs) {
    return done(null);
   }
   mount.type.syncfs(mount, populate, done);
  }));
 }),
 mount: (function(type, opts, mountpoint) {
  var root = mountpoint === "/";
  var pseudo = !mountpoint;
  var node;
  if (root && FS.root) {
   throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
  } else if (!root && !pseudo) {
   var lookup = FS.lookupPath(mountpoint, {
    follow_mount: false
   });
   mountpoint = lookup.path;
   node = lookup.node;
   if (FS.isMountpoint(node)) {
    throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
   }
   if (!FS.isDir(node.mode)) {
    throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
   }
  }
  var mount = {
   type: type,
   opts: opts,
   mountpoint: mountpoint,
   mounts: []
  };
  var mountRoot = type.mount(mount);
  mountRoot.mount = mount;
  mount.root = mountRoot;
  if (root) {
   FS.root = mountRoot;
  } else if (node) {
   node.mounted = mount;
   if (node.mount) {
    node.mount.mounts.push(mount);
   }
  }
  return mountRoot;
 }),
 unmount: (function(mountpoint) {
  var lookup = FS.lookupPath(mountpoint, {
   follow_mount: false
  });
  if (!FS.isMountpoint(lookup.node)) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  var node = lookup.node;
  var mount = node.mounted;
  var mounts = FS.getMounts(mount);
  Object.keys(FS.nameTable).forEach((function(hash) {
   var current = FS.nameTable[hash];
   while (current) {
    var next = current.name_next;
    if (mounts.indexOf(current.mount) !== -1) {
     FS.destroyNode(current);
    }
    current = next;
   }
  }));
  node.mounted = null;
  var idx = node.mount.mounts.indexOf(mount);
  assert(idx !== -1);
  node.mount.mounts.splice(idx, 1);
 }),
 lookup: (function(parent, name) {
  return parent.node_ops.lookup(parent, name);
 }),
 mknod: (function(path, mode, dev) {
  var lookup = FS.lookupPath(path, {
   parent: true
  });
  var parent = lookup.node;
  var name = PATH.basename(path);
  if (!name || name === "." || name === "..") {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  var err = FS.mayCreate(parent, name);
  if (err) {
   throw new FS.ErrnoError(err);
  }
  if (!parent.node_ops.mknod) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }
  return parent.node_ops.mknod(parent, name, mode, dev);
 }),
 create: (function(path, mode) {
  mode = mode !== undefined ? mode : 438;
  mode &= 4095;
  mode |= 32768;
  return FS.mknod(path, mode, 0);
 }),
 mkdir: (function(path, mode) {
  mode = mode !== undefined ? mode : 511;
  mode &= 511 | 512;
  mode |= 16384;
  return FS.mknod(path, mode, 0);
 }),
 mkdev: (function(path, mode, dev) {
  if (typeof dev === "undefined") {
   dev = mode;
   mode = 438;
  }
  mode |= 8192;
  return FS.mknod(path, mode, dev);
 }),
 symlink: (function(oldpath, newpath) {
  if (!PATH.resolve(oldpath)) {
   throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
  }
  var lookup = FS.lookupPath(newpath, {
   parent: true
  });
  var parent = lookup.node;
  if (!parent) {
   throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
  }
  var newname = PATH.basename(newpath);
  var err = FS.mayCreate(parent, newname);
  if (err) {
   throw new FS.ErrnoError(err);
  }
  if (!parent.node_ops.symlink) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }
  return parent.node_ops.symlink(parent, newname, oldpath);
 }),
 rename: (function(old_path, new_path) {
  var old_dirname = PATH.dirname(old_path);
  var new_dirname = PATH.dirname(new_path);
  var old_name = PATH.basename(old_path);
  var new_name = PATH.basename(new_path);
  var lookup, old_dir, new_dir;
  try {
   lookup = FS.lookupPath(old_path, {
    parent: true
   });
   old_dir = lookup.node;
   lookup = FS.lookupPath(new_path, {
    parent: true
   });
   new_dir = lookup.node;
  } catch (e) {
   throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
  }
  if (!old_dir || !new_dir) throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
  if (old_dir.mount !== new_dir.mount) {
   throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
  }
  var old_node = FS.lookupNode(old_dir, old_name);
  var relative = PATH.relative(old_path, new_dirname);
  if (relative.charAt(0) !== ".") {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  relative = PATH.relative(new_path, old_dirname);
  if (relative.charAt(0) !== ".") {
   throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
  }
  var new_node;
  try {
   new_node = FS.lookupNode(new_dir, new_name);
  } catch (e) {}
  if (old_node === new_node) {
   return;
  }
  var isdir = FS.isDir(old_node.mode);
  var err = FS.mayDelete(old_dir, old_name, isdir);
  if (err) {
   throw new FS.ErrnoError(err);
  }
  err = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
  if (err) {
   throw new FS.ErrnoError(err);
  }
  if (!old_dir.node_ops.rename) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }
  if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
   throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
  }
  if (new_dir !== old_dir) {
   err = FS.nodePermissions(old_dir, "w");
   if (err) {
    throw new FS.ErrnoError(err);
   }
  }
  try {
   if (FS.trackingDelegate["willMovePath"]) {
    FS.trackingDelegate["willMovePath"](old_path, new_path);
   }
  } catch (e) {
   console.log("FS.trackingDelegate['willMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message);
  }
  FS.hashRemoveNode(old_node);
  try {
   old_dir.node_ops.rename(old_node, new_dir, new_name);
  } catch (e) {
   throw e;
  } finally {
   FS.hashAddNode(old_node);
  }
  try {
   if (FS.trackingDelegate["onMovePath"]) FS.trackingDelegate["onMovePath"](old_path, new_path);
  } catch (e) {
   console.log("FS.trackingDelegate['onMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message);
  }
 }),
 rmdir: (function(path) {
  var lookup = FS.lookupPath(path, {
   parent: true
  });
  var parent = lookup.node;
  var name = PATH.basename(path);
  var node = FS.lookupNode(parent, name);
  var err = FS.mayDelete(parent, name, true);
  if (err) {
   throw new FS.ErrnoError(err);
  }
  if (!parent.node_ops.rmdir) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }
  if (FS.isMountpoint(node)) {
   throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
  }
  try {
   if (FS.trackingDelegate["willDeletePath"]) {
    FS.trackingDelegate["willDeletePath"](path);
   }
  } catch (e) {
   console.log("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message);
  }
  parent.node_ops.rmdir(parent, name);
  FS.destroyNode(node);
  try {
   if (FS.trackingDelegate["onDeletePath"]) FS.trackingDelegate["onDeletePath"](path);
  } catch (e) {
   console.log("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message);
  }
 }),
 readdir: (function(path) {
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  var node = lookup.node;
  if (!node.node_ops.readdir) {
   throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
  }
  return node.node_ops.readdir(node);
 }),
 unlink: (function(path) {
  var lookup = FS.lookupPath(path, {
   parent: true
  });
  var parent = lookup.node;
  var name = PATH.basename(path);
  var node = FS.lookupNode(parent, name);
  var err = FS.mayDelete(parent, name, false);
  if (err) {
   if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
   throw new FS.ErrnoError(err);
  }
  if (!parent.node_ops.unlink) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }
  if (FS.isMountpoint(node)) {
   throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
  }
  try {
   if (FS.trackingDelegate["willDeletePath"]) {
    FS.trackingDelegate["willDeletePath"](path);
   }
  } catch (e) {
   console.log("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message);
  }
  parent.node_ops.unlink(parent, name);
  FS.destroyNode(node);
  try {
   if (FS.trackingDelegate["onDeletePath"]) FS.trackingDelegate["onDeletePath"](path);
  } catch (e) {
   console.log("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message);
  }
 }),
 readlink: (function(path) {
  var lookup = FS.lookupPath(path);
  var link = lookup.node;
  if (!link) {
   throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
  }
  if (!link.node_ops.readlink) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  return PATH.resolve(FS.getPath(lookup.node.parent), link.node_ops.readlink(link));
 }),
 stat: (function(path, dontFollow) {
  var lookup = FS.lookupPath(path, {
   follow: !dontFollow
  });
  var node = lookup.node;
  if (!node) {
   throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
  }
  if (!node.node_ops.getattr) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }
  return node.node_ops.getattr(node);
 }),
 lstat: (function(path) {
  return FS.stat(path, true);
 }),
 chmod: (function(path, mode, dontFollow) {
  var node;
  if (typeof path === "string") {
   var lookup = FS.lookupPath(path, {
    follow: !dontFollow
   });
   node = lookup.node;
  } else {
   node = path;
  }
  if (!node.node_ops.setattr) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }
  node.node_ops.setattr(node, {
   mode: mode & 4095 | node.mode & ~4095,
   timestamp: Date.now()
  });
 }),
 lchmod: (function(path, mode) {
  FS.chmod(path, mode, true);
 }),
 fchmod: (function(fd, mode) {
  var stream = FS.getStream(fd);
  if (!stream) {
   throw new FS.ErrnoError(ERRNO_CODES.EBADF);
  }
  FS.chmod(stream.node, mode);
 }),
 chown: (function(path, uid, gid, dontFollow) {
  var node;
  if (typeof path === "string") {
   var lookup = FS.lookupPath(path, {
    follow: !dontFollow
   });
   node = lookup.node;
  } else {
   node = path;
  }
  if (!node.node_ops.setattr) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }
  node.node_ops.setattr(node, {
   timestamp: Date.now()
  });
 }),
 lchown: (function(path, uid, gid) {
  FS.chown(path, uid, gid, true);
 }),
 fchown: (function(fd, uid, gid) {
  var stream = FS.getStream(fd);
  if (!stream) {
   throw new FS.ErrnoError(ERRNO_CODES.EBADF);
  }
  FS.chown(stream.node, uid, gid);
 }),
 truncate: (function(path, len) {
  if (len < 0) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  var node;
  if (typeof path === "string") {
   var lookup = FS.lookupPath(path, {
    follow: true
   });
   node = lookup.node;
  } else {
   node = path;
  }
  if (!node.node_ops.setattr) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }
  if (FS.isDir(node.mode)) {
   throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
  }
  if (!FS.isFile(node.mode)) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  var err = FS.nodePermissions(node, "w");
  if (err) {
   throw new FS.ErrnoError(err);
  }
  node.node_ops.setattr(node, {
   size: len,
   timestamp: Date.now()
  });
 }),
 ftruncate: (function(fd, len) {
  var stream = FS.getStream(fd);
  if (!stream) {
   throw new FS.ErrnoError(ERRNO_CODES.EBADF);
  }
  if ((stream.flags & 2097155) === 0) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  FS.truncate(stream.node, len);
 }),
 utime: (function(path, atime, mtime) {
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  var node = lookup.node;
  node.node_ops.setattr(node, {
   timestamp: Math.max(atime, mtime)
  });
 }),
 open: (function(path, flags, mode, fd_start, fd_end) {
  if (path === "") {
   throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
  }
  flags = typeof flags === "string" ? FS.modeStringToFlags(flags) : flags;
  mode = typeof mode === "undefined" ? 438 : mode;
  if (flags & 64) {
   mode = mode & 4095 | 32768;
  } else {
   mode = 0;
  }
  var node;
  if (typeof path === "object") {
   node = path;
  } else {
   path = PATH.normalize(path);
   try {
    var lookup = FS.lookupPath(path, {
     follow: !(flags & 131072)
    });
    node = lookup.node;
   } catch (e) {}
  }
  var created = false;
  if (flags & 64) {
   if (node) {
    if (flags & 128) {
     throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
    }
   } else {
    node = FS.mknod(path, mode, 0);
    created = true;
   }
  }
  if (!node) {
   throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
  }
  if (FS.isChrdev(node.mode)) {
   flags &= ~512;
  }
  if (!created) {
   var err = FS.mayOpen(node, flags);
   if (err) {
    throw new FS.ErrnoError(err);
   }
  }
  if (flags & 512) {
   FS.truncate(node, 0);
  }
  flags &= ~(128 | 512);
  var stream = FS.createStream({
   node: node,
   path: FS.getPath(node),
   flags: flags,
   seekable: true,
   position: 0,
   stream_ops: node.stream_ops,
   ungotten: [],
   error: false
  }, fd_start, fd_end);
  if (stream.stream_ops.open) {
   stream.stream_ops.open(stream);
  }
  if (Module["logReadFiles"] && !(flags & 1)) {
   if (!FS.readFiles) FS.readFiles = {};
   if (!(path in FS.readFiles)) {
    FS.readFiles[path] = 1;
    Module["printErr"]("read file: " + path);
   }
  }
  try {
   if (FS.trackingDelegate["onOpenFile"]) {
    var trackingFlags = 0;
    if ((flags & 2097155) !== 1) {
     trackingFlags |= FS.tracking.openFlags.READ;
    }
    if ((flags & 2097155) !== 0) {
     trackingFlags |= FS.tracking.openFlags.WRITE;
    }
    FS.trackingDelegate["onOpenFile"](path, trackingFlags);
   }
  } catch (e) {
   console.log("FS.trackingDelegate['onOpenFile']('" + path + "', flags) threw an exception: " + e.message);
  }
  return stream;
 }),
 close: (function(stream) {
  try {
   if (stream.stream_ops.close) {
    stream.stream_ops.close(stream);
   }
  } catch (e) {
   throw e;
  } finally {
   FS.closeStream(stream.fd);
  }
 }),
 llseek: (function(stream, offset, whence) {
  if (!stream.seekable || !stream.stream_ops.llseek) {
   throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
  }
  stream.position = stream.stream_ops.llseek(stream, offset, whence);
  stream.ungotten = [];
  return stream.position;
 }),
 read: (function(stream, buffer, offset, length, position) {
  if (length < 0 || position < 0) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  if ((stream.flags & 2097155) === 1) {
   throw new FS.ErrnoError(ERRNO_CODES.EBADF);
  }
  if (FS.isDir(stream.node.mode)) {
   throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
  }
  if (!stream.stream_ops.read) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  var seeking = true;
  if (typeof position === "undefined") {
   position = stream.position;
   seeking = false;
  } else if (!stream.seekable) {
   throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
  }
  var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
  if (!seeking) stream.position += bytesRead;
  return bytesRead;
 }),
 write: (function(stream, buffer, offset, length, position, canOwn) {
  if (length < 0 || position < 0) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  if ((stream.flags & 2097155) === 0) {
   throw new FS.ErrnoError(ERRNO_CODES.EBADF);
  }
  if (FS.isDir(stream.node.mode)) {
   throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
  }
  if (!stream.stream_ops.write) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  if (stream.flags & 1024) {
   FS.llseek(stream, 0, 2);
  }
  var seeking = true;
  if (typeof position === "undefined") {
   position = stream.position;
   seeking = false;
  } else if (!stream.seekable) {
   throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
  }
  var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
  if (!seeking) stream.position += bytesWritten;
  try {
   if (stream.path && FS.trackingDelegate["onWriteToFile"]) FS.trackingDelegate["onWriteToFile"](stream.path);
  } catch (e) {
   console.log("FS.trackingDelegate['onWriteToFile']('" + path + "') threw an exception: " + e.message);
  }
  return bytesWritten;
 }),
 allocate: (function(stream, offset, length) {
  if (offset < 0 || length <= 0) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  if ((stream.flags & 2097155) === 0) {
   throw new FS.ErrnoError(ERRNO_CODES.EBADF);
  }
  if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
   throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
  }
  if (!stream.stream_ops.allocate) {
   throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
  }
  stream.stream_ops.allocate(stream, offset, length);
 }),
 mmap: (function(stream, buffer, offset, length, position, prot, flags) {
  if ((stream.flags & 2097155) === 1) {
   throw new FS.ErrnoError(ERRNO_CODES.EACCES);
  }
  if (!stream.stream_ops.mmap) {
   throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
  }
  return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
 }),
 msync: (function(stream, buffer, offset, length, mmapFlags) {
  if (!stream || !stream.stream_ops.msync) {
   return 0;
  }
  return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
 }),
 munmap: (function(stream) {
  return 0;
 }),
 ioctl: (function(stream, cmd, arg) {
  if (!stream.stream_ops.ioctl) {
   throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
  }
  return stream.stream_ops.ioctl(stream, cmd, arg);
 }),
 readFile: (function(path, opts) {
  opts = opts || {};
  opts.flags = opts.flags || "r";
  opts.encoding = opts.encoding || "binary";
  if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
   throw new Error('Invalid encoding type "' + opts.encoding + '"');
  }
  var ret;
  var stream = FS.open(path, opts.flags);
  var stat = FS.stat(path);
  var length = stat.size;
  var buf = new Uint8Array(length);
  FS.read(stream, buf, 0, length, 0);
  if (opts.encoding === "utf8") {
   ret = UTF8ArrayToString(buf, 0);
  } else if (opts.encoding === "binary") {
   ret = buf;
  }
  FS.close(stream);
  return ret;
 }),
 writeFile: (function(path, data, opts) {
  opts = opts || {};
  opts.flags = opts.flags || "w";
  opts.encoding = opts.encoding || "utf8";
  if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
   throw new Error('Invalid encoding type "' + opts.encoding + '"');
  }
  var stream = FS.open(path, opts.flags, opts.mode);
  if (opts.encoding === "utf8") {
   var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
   var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
   FS.write(stream, buf, 0, actualNumBytes, 0, opts.canOwn);
  } else if (opts.encoding === "binary") {
   FS.write(stream, data, 0, data.length, 0, opts.canOwn);
  }
  FS.close(stream);
 }),
 cwd: (function() {
  return FS.currentPath;
 }),
 chdir: (function(path) {
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  if (!FS.isDir(lookup.node.mode)) {
   throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
  }
  var err = FS.nodePermissions(lookup.node, "x");
  if (err) {
   throw new FS.ErrnoError(err);
  }
  FS.currentPath = lookup.path;
 }),
 createDefaultDirectories: (function() {
  FS.mkdir("/tmp");
  FS.mkdir("/home");
  FS.mkdir("/home/web_user");
 }),
 createDefaultDevices: (function() {
  FS.mkdir("/dev");
  FS.registerDevice(FS.makedev(1, 3), {
   read: (function() {
    return 0;
   }),
   write: (function(stream, buffer, offset, length, pos) {
    return length;
   })
  });
  FS.mkdev("/dev/null", FS.makedev(1, 3));
  TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
  TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
  FS.mkdev("/dev/tty", FS.makedev(5, 0));
  FS.mkdev("/dev/tty1", FS.makedev(6, 0));
  var random_device;
  if (typeof crypto !== "undefined") {
   var randomBuffer = new Uint8Array(1);
   random_device = (function() {
    crypto.getRandomValues(randomBuffer);
    return randomBuffer[0];
   });
  } else if (ENVIRONMENT_IS_NODE) {
   random_device = (function() {
    return require("crypto").randomBytes(1)[0];
   });
  } else {
   random_device = (function() {
    return Math.random() * 256 | 0;
   });
  }
  FS.createDevice("/dev", "random", random_device);
  FS.createDevice("/dev", "urandom", random_device);
  FS.mkdir("/dev/shm");
  FS.mkdir("/dev/shm/tmp");
 }),
 createStandardStreams: (function() {
  if (Module["stdin"]) {
   FS.createDevice("/dev", "stdin", Module["stdin"]);
  } else {
   FS.symlink("/dev/tty", "/dev/stdin");
  }
  if (Module["stdout"]) {
   FS.createDevice("/dev", "stdout", null, Module["stdout"]);
  } else {
   FS.symlink("/dev/tty", "/dev/stdout");
  }
  if (Module["stderr"]) {
   FS.createDevice("/dev", "stderr", null, Module["stderr"]);
  } else {
   FS.symlink("/dev/tty1", "/dev/stderr");
  }
  var stdin = FS.open("/dev/stdin", "r");
  HEAP32[_stdin >> 2] = FS.getPtrForStream(stdin);
  assert(stdin.fd === 0, "invalid handle for stdin (" + stdin.fd + ")");
  var stdout = FS.open("/dev/stdout", "w");
  HEAP32[_stdout >> 2] = FS.getPtrForStream(stdout);
  assert(stdout.fd === 1, "invalid handle for stdout (" + stdout.fd + ")");
  var stderr = FS.open("/dev/stderr", "w");
  HEAP32[_stderr >> 2] = FS.getPtrForStream(stderr);
  assert(stderr.fd === 2, "invalid handle for stderr (" + stderr.fd + ")");
 }),
 ensureErrnoError: (function() {
  if (FS.ErrnoError) return;
  FS.ErrnoError = function ErrnoError(errno, node) {
   this.node = node;
   this.setErrno = (function(errno) {
    this.errno = errno;
    for (var key in ERRNO_CODES) {
     if (ERRNO_CODES[key] === errno) {
      this.code = key;
      break;
     }
    }
   });
   this.setErrno(errno);
   this.message = ERRNO_MESSAGES[errno];
  };
  FS.ErrnoError.prototype = new Error;
  FS.ErrnoError.prototype.constructor = FS.ErrnoError;
  [ ERRNO_CODES.ENOENT ].forEach((function(code) {
   FS.genericErrors[code] = new FS.ErrnoError(code);
   FS.genericErrors[code].stack = "<generic error, no stack>";
  }));
 }),
 staticInit: (function() {
  FS.ensureErrnoError();
  FS.nameTable = new Array(4096);
  FS.mount(MEMFS, {}, "/");
  FS.createDefaultDirectories();
  FS.createDefaultDevices();
 }),
 init: (function(input, output, error) {
  assert(!FS.init.initialized, "FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)");
  FS.init.initialized = true;
  FS.ensureErrnoError();
  Module["stdin"] = input || Module["stdin"];
  Module["stdout"] = output || Module["stdout"];
  Module["stderr"] = error || Module["stderr"];
  FS.createStandardStreams();
 }),
 quit: (function() {
  FS.init.initialized = false;
  for (var i = 0; i < FS.streams.length; i++) {
   var stream = FS.streams[i];
   if (!stream) {
    continue;
   }
   FS.close(stream);
  }
 }),
 getMode: (function(canRead, canWrite) {
  var mode = 0;
  if (canRead) mode |= 292 | 73;
  if (canWrite) mode |= 146;
  return mode;
 }),
 joinPath: (function(parts, forceRelative) {
  var path = PATH.join.apply(null, parts);
  if (forceRelative && path[0] == "/") path = path.substr(1);
  return path;
 }),
 absolutePath: (function(relative, base) {
  return PATH.resolve(base, relative);
 }),
 standardizePath: (function(path) {
  return PATH.normalize(path);
 }),
 findObject: (function(path, dontResolveLastLink) {
  var ret = FS.analyzePath(path, dontResolveLastLink);
  if (ret.exists) {
   return ret.object;
  } else {
   ___setErrNo(ret.error);
   return null;
  }
 }),
 analyzePath: (function(path, dontResolveLastLink) {
  try {
   var lookup = FS.lookupPath(path, {
    follow: !dontResolveLastLink
   });
   path = lookup.path;
  } catch (e) {}
  var ret = {
   isRoot: false,
   exists: false,
   error: 0,
   name: null,
   path: null,
   object: null,
   parentExists: false,
   parentPath: null,
   parentObject: null
  };
  try {
   var lookup = FS.lookupPath(path, {
    parent: true
   });
   ret.parentExists = true;
   ret.parentPath = lookup.path;
   ret.parentObject = lookup.node;
   ret.name = PATH.basename(path);
   lookup = FS.lookupPath(path, {
    follow: !dontResolveLastLink
   });
   ret.exists = true;
   ret.path = lookup.path;
   ret.object = lookup.node;
   ret.name = lookup.node.name;
   ret.isRoot = lookup.path === "/";
  } catch (e) {
   ret.error = e.errno;
  }
  return ret;
 }),
 createFolder: (function(parent, name, canRead, canWrite) {
  var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
  var mode = FS.getMode(canRead, canWrite);
  return FS.mkdir(path, mode);
 }),
 createPath: (function(parent, path, canRead, canWrite) {
  parent = typeof parent === "string" ? parent : FS.getPath(parent);
  var parts = path.split("/").reverse();
  while (parts.length) {
   var part = parts.pop();
   if (!part) continue;
   var current = PATH.join2(parent, part);
   try {
    FS.mkdir(current);
   } catch (e) {}
   parent = current;
  }
  return current;
 }),
 createFile: (function(parent, name, properties, canRead, canWrite) {
  var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
  var mode = FS.getMode(canRead, canWrite);
  return FS.create(path, mode);
 }),
 createDataFile: (function(parent, name, data, canRead, canWrite, canOwn) {
  var path = name ? PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name) : parent;
  var mode = FS.getMode(canRead, canWrite);
  var node = FS.create(path, mode);
  if (data) {
   if (typeof data === "string") {
    var arr = new Array(data.length);
    for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
    data = arr;
   }
   FS.chmod(node, mode | 146);
   var stream = FS.open(node, "w");
   FS.write(stream, data, 0, data.length, 0, canOwn);
   FS.close(stream);
   FS.chmod(node, mode);
  }
  return node;
 }),
 createDevice: (function(parent, name, input, output) {
  var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
  var mode = FS.getMode(!!input, !!output);
  if (!FS.createDevice.major) FS.createDevice.major = 64;
  var dev = FS.makedev(FS.createDevice.major++, 0);
  FS.registerDevice(dev, {
   open: (function(stream) {
    stream.seekable = false;
   }),
   close: (function(stream) {
    if (output && output.buffer && output.buffer.length) {
     output(10);
    }
   }),
   read: (function(stream, buffer, offset, length, pos) {
    var bytesRead = 0;
    for (var i = 0; i < length; i++) {
     var result;
     try {
      result = input();
     } catch (e) {
      throw new FS.ErrnoError(ERRNO_CODES.EIO);
     }
     if (result === undefined && bytesRead === 0) {
      throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
     }
     if (result === null || result === undefined) break;
     bytesRead++;
     buffer[offset + i] = result;
    }
    if (bytesRead) {
     stream.node.timestamp = Date.now();
    }
    return bytesRead;
   }),
   write: (function(stream, buffer, offset, length, pos) {
    for (var i = 0; i < length; i++) {
     try {
      output(buffer[offset + i]);
     } catch (e) {
      throw new FS.ErrnoError(ERRNO_CODES.EIO);
     }
    }
    if (length) {
     stream.node.timestamp = Date.now();
    }
    return i;
   })
  });
  return FS.mkdev(path, mode, dev);
 }),
 createLink: (function(parent, name, target, canRead, canWrite) {
  var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
  return FS.symlink(target, path);
 }),
 forceLoadFile: (function(obj) {
  if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
  var success = true;
  if (typeof XMLHttpRequest !== "undefined") {
   throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
  } else if (Module["read"]) {
   try {
    obj.contents = intArrayFromString(Module["read"](obj.url), true);
    obj.usedBytes = obj.contents.length;
   } catch (e) {
    success = false;
   }
  } else {
   throw new Error("Cannot load without read() or XMLHttpRequest.");
  }
  if (!success) ___setErrNo(ERRNO_CODES.EIO);
  return success;
 }),
 createLazyFile: (function(parent, name, url, canRead, canWrite) {
  function LazyUint8Array() {
   this.lengthKnown = false;
   this.chunks = [];
  }
  LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
   if (idx > this.length - 1 || idx < 0) {
    return undefined;
   }
   var chunkOffset = idx % this.chunkSize;
   var chunkNum = idx / this.chunkSize | 0;
   return this.getter(chunkNum)[chunkOffset];
  };
  LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
   this.getter = getter;
  };
  LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
   var xhr = new XMLHttpRequest;
   xhr.open("HEAD", url, false);
   xhr.send(null);
   if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
   var datalength = Number(xhr.getResponseHeader("Content-length"));
   var header;
   var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
   var chunkSize = 1024 * 1024;
   if (!hasByteServing) chunkSize = datalength;
   var doXHR = (function(from, to) {
    if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
    if (to > datalength - 1) throw new Error("only " + datalength + " bytes available! programmer error!");
    var xhr = new XMLHttpRequest;
    xhr.open("GET", url, false);
    if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
    if (typeof Uint8Array != "undefined") xhr.responseType = "arraybuffer";
    if (xhr.overrideMimeType) {
     xhr.overrideMimeType("text/plain; charset=x-user-defined");
    }
    xhr.send(null);
    if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
    if (xhr.response !== undefined) {
     return new Uint8Array(xhr.response || []);
    } else {
     return intArrayFromString(xhr.responseText || "", true);
    }
   });
   var lazyArray = this;
   lazyArray.setDataGetter((function(chunkNum) {
    var start = chunkNum * chunkSize;
    var end = (chunkNum + 1) * chunkSize - 1;
    end = Math.min(end, datalength - 1);
    if (typeof lazyArray.chunks[chunkNum] === "undefined") {
     lazyArray.chunks[chunkNum] = doXHR(start, end);
    }
    if (typeof lazyArray.chunks[chunkNum] === "undefined") throw new Error("doXHR failed!");
    return lazyArray.chunks[chunkNum];
   }));
   this._length = datalength;
   this._chunkSize = chunkSize;
   this.lengthKnown = true;
  };
  if (typeof XMLHttpRequest !== "undefined") {
   if (!ENVIRONMENT_IS_WORKER) throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
   var lazyArray = new LazyUint8Array;
   Object.defineProperty(lazyArray, "length", {
    get: (function() {
     if (!this.lengthKnown) {
      this.cacheLength();
     }
     return this._length;
    })
   });
   Object.defineProperty(lazyArray, "chunkSize", {
    get: (function() {
     if (!this.lengthKnown) {
      this.cacheLength();
     }
     return this._chunkSize;
    })
   });
   var properties = {
    isDevice: false,
    contents: lazyArray
   };
  } else {
   var properties = {
    isDevice: false,
    url: url
   };
  }
  var node = FS.createFile(parent, name, properties, canRead, canWrite);
  if (properties.contents) {
   node.contents = properties.contents;
  } else if (properties.url) {
   node.contents = null;
   node.url = properties.url;
  }
  Object.defineProperty(node, "usedBytes", {
   get: (function() {
    return this.contents.length;
   })
  });
  var stream_ops = {};
  var keys = Object.keys(node.stream_ops);
  keys.forEach((function(key) {
   var fn = node.stream_ops[key];
   stream_ops[key] = function forceLoadLazyFile() {
    if (!FS.forceLoadFile(node)) {
     throw new FS.ErrnoError(ERRNO_CODES.EIO);
    }
    return fn.apply(null, arguments);
   };
  }));
  stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
   if (!FS.forceLoadFile(node)) {
    throw new FS.ErrnoError(ERRNO_CODES.EIO);
   }
   var contents = stream.node.contents;
   if (position >= contents.length) return 0;
   var size = Math.min(contents.length - position, length);
   assert(size >= 0);
   if (contents.slice) {
    for (var i = 0; i < size; i++) {
     buffer[offset + i] = contents[position + i];
    }
   } else {
    for (var i = 0; i < size; i++) {
     buffer[offset + i] = contents.get(position + i);
    }
   }
   return size;
  };
  node.stream_ops = stream_ops;
  return node;
 }),
 createPreloadedFile: (function(parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) {
  Browser.init();
  var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
  var dep = getUniqueRunDependency("cp " + fullname);
  function processData(byteArray) {
   function finish(byteArray) {
    if (preFinish) preFinish();
    if (!dontCreateFile) {
     FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
    }
    if (onload) onload();
    removeRunDependency(dep);
   }
   var handled = false;
   Module["preloadPlugins"].forEach((function(plugin) {
    if (handled) return;
    if (plugin["canHandle"](fullname)) {
     plugin["handle"](byteArray, fullname, finish, (function() {
      if (onerror) onerror();
      removeRunDependency(dep);
     }));
     handled = true;
    }
   }));
   if (!handled) finish(byteArray);
  }
  addRunDependency(dep);
  if (typeof url == "string") {
   Browser.asyncLoad(url, (function(byteArray) {
    processData(byteArray);
   }), onerror);
  } else {
   processData(url);
  }
 }),
 indexedDB: (function() {
  return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
 }),
 DB_NAME: (function() {
  return "EM_FS_" + window.location.pathname;
 }),
 DB_VERSION: 20,
 DB_STORE_NAME: "FILE_DATA",
 saveFilesToDB: (function(paths, onload, onerror) {
  onload = onload || (function() {});
  onerror = onerror || (function() {});
  var indexedDB = FS.indexedDB();
  try {
   var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
  } catch (e) {
   return onerror(e);
  }
  openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
   console.log("creating db");
   var db = openRequest.result;
   db.createObjectStore(FS.DB_STORE_NAME);
  };
  openRequest.onsuccess = function openRequest_onsuccess() {
   var db = openRequest.result;
   var transaction = db.transaction([ FS.DB_STORE_NAME ], "readwrite");
   var files = transaction.objectStore(FS.DB_STORE_NAME);
   var ok = 0, fail = 0, total = paths.length;
   function finish() {
    if (fail == 0) onload(); else onerror();
   }
   paths.forEach((function(path) {
    var putRequest = files.put(FS.analyzePath(path).object.contents, path);
    putRequest.onsuccess = function putRequest_onsuccess() {
     ok++;
     if (ok + fail == total) finish();
    };
    putRequest.onerror = function putRequest_onerror() {
     fail++;
     if (ok + fail == total) finish();
    };
   }));
   transaction.onerror = onerror;
  };
  openRequest.onerror = onerror;
 }),
 loadFilesFromDB: (function(paths, onload, onerror) {
  onload = onload || (function() {});
  onerror = onerror || (function() {});
  var indexedDB = FS.indexedDB();
  try {
   var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
  } catch (e) {
   return onerror(e);
  }
  openRequest.onupgradeneeded = onerror;
  openRequest.onsuccess = function openRequest_onsuccess() {
   var db = openRequest.result;
   try {
    var transaction = db.transaction([ FS.DB_STORE_NAME ], "readonly");
   } catch (e) {
    onerror(e);
    return;
   }
   var files = transaction.objectStore(FS.DB_STORE_NAME);
   var ok = 0, fail = 0, total = paths.length;
   function finish() {
    if (fail == 0) onload(); else onerror();
   }
   paths.forEach((function(path) {
    var getRequest = files.get(path);
    getRequest.onsuccess = function getRequest_onsuccess() {
     if (FS.analyzePath(path).exists) {
      FS.unlink(path);
     }
     FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
     ok++;
     if (ok + fail == total) finish();
    };
    getRequest.onerror = function getRequest_onerror() {
     fail++;
     if (ok + fail == total) finish();
    };
   }));
   transaction.onerror = onerror;
  };
  openRequest.onerror = onerror;
 })
};
function _close(fildes) {
 var stream = FS.getStream(fildes);
 if (!stream) {
  ___setErrNo(ERRNO_CODES.EBADF);
  return -1;
 }
 try {
  FS.close(stream);
  return 0;
 } catch (e) {
  FS.handleFSError(e);
  return -1;
 }
}
function _fileno(stream) {
 stream = FS.getStreamFromPtr(stream);
 if (!stream) return -1;
 return stream.fd;
}
function _fclose(stream) {
 var fd = _fileno(stream);
 return _close(fd);
}
function _emscripten_glGetString(name_) {
 if (GL.stringCache[name_]) return GL.stringCache[name_];
 var ret;
 switch (name_) {
 case 7936:
 case 7937:
 case 7938:
  ret = allocate(intArrayFromString(GLctx.getParameter(name_)), "i8", ALLOC_NORMAL);
  break;
 case 7939:
  var exts = GLctx.getSupportedExtensions();
  var gl_exts = [];
  for (var i in exts) {
   gl_exts.push(exts[i]);
   gl_exts.push("GL_" + exts[i]);
  }
  ret = allocate(intArrayFromString(gl_exts.join(" ")), "i8", ALLOC_NORMAL);
  break;
 case 35724:
  ret = allocate(intArrayFromString("OpenGL ES GLSL 1.00 (WebGL)"), "i8", ALLOC_NORMAL);
  break;
 default:
  GL.recordError(1280);
  return 0;
 }
 GL.stringCache[name_] = ret;
 return ret;
}
function _pthread_mutex_lock() {}
function _emscripten_glGetAttribLocation(program, name) {
 program = GL.programs[program];
 name = Pointer_stringify(name);
 return GLctx.getAttribLocation(program, name);
}
function _emscripten_glRotatef() {
 Module["printErr"]("missing function: emscripten_glRotatef");
 abort(-1);
}
function _emscripten_glGetIntegerv(name_, p) {
 return GL.get(name_, p, "Integer");
}
function _emscripten_glGetFramebufferAttachmentParameteriv(target, attachment, pname, params) {
 var result = GLctx.getFramebufferAttachmentParameter(target, attachment, pname);
 HEAP32[params >> 2] = result;
}
function _mkport() {
 throw "TODO";
}
var SOCKFS = {
 mount: (function(mount) {
  Module["websocket"] = Module["websocket"] && "object" === typeof Module["websocket"] ? Module["websocket"] : {};
  Module["websocket"]._callbacks = {};
  Module["websocket"]["on"] = (function(event, callback) {
   if ("function" === typeof callback) {
    this._callbacks[event] = callback;
   }
   return this;
  });
  Module["websocket"].emit = (function(event, param) {
   if ("function" === typeof this._callbacks[event]) {
    this._callbacks[event].call(this, param);
   }
  });
  return FS.createNode(null, "/", 16384 | 511, 0);
 }),
 createSocket: (function(family, type, protocol) {
  var streaming = type == 1;
  if (protocol) {
   assert(streaming == (protocol == 6));
  }
  var sock = {
   family: family,
   type: type,
   protocol: protocol,
   server: null,
   error: null,
   peers: {},
   pending: [],
   recv_queue: [],
   sock_ops: SOCKFS.websocket_sock_ops
  };
  var name = SOCKFS.nextname();
  var node = FS.createNode(SOCKFS.root, name, 49152, 0);
  node.sock = sock;
  var stream = FS.createStream({
   path: name,
   node: node,
   flags: FS.modeStringToFlags("r+"),
   seekable: false,
   stream_ops: SOCKFS.stream_ops
  });
  sock.stream = stream;
  return sock;
 }),
 getSocket: (function(fd) {
  var stream = FS.getStream(fd);
  if (!stream || !FS.isSocket(stream.node.mode)) {
   return null;
  }
  return stream.node.sock;
 }),
 stream_ops: {
  poll: (function(stream) {
   var sock = stream.node.sock;
   return sock.sock_ops.poll(sock);
  }),
  ioctl: (function(stream, request, varargs) {
   var sock = stream.node.sock;
   return sock.sock_ops.ioctl(sock, request, varargs);
  }),
  read: (function(stream, buffer, offset, length, position) {
   var sock = stream.node.sock;
   var msg = sock.sock_ops.recvmsg(sock, length);
   if (!msg) {
    return 0;
   }
   buffer.set(msg.buffer, offset);
   return msg.buffer.length;
  }),
  write: (function(stream, buffer, offset, length, position) {
   var sock = stream.node.sock;
   return sock.sock_ops.sendmsg(sock, buffer, offset, length);
  }),
  close: (function(stream) {
   var sock = stream.node.sock;
   sock.sock_ops.close(sock);
  })
 },
 nextname: (function() {
  if (!SOCKFS.nextname.current) {
   SOCKFS.nextname.current = 0;
  }
  return "socket[" + SOCKFS.nextname.current++ + "]";
 }),
 websocket_sock_ops: {
  createPeer: (function(sock, addr, port) {
   var ws;
   if (typeof addr === "object") {
    ws = addr;
    addr = null;
    port = null;
   }
   if (ws) {
    if (ws._socket) {
     addr = ws._socket.remoteAddress;
     port = ws._socket.remotePort;
    } else {
     var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
     if (!result) {
      throw new Error("WebSocket URL must be in the format ws(s)://address:port");
     }
     addr = result[1];
     port = parseInt(result[2], 10);
    }
   } else {
    try {
     var runtimeConfig = Module["websocket"] && "object" === typeof Module["websocket"];
     var url = "ws:#".replace("#", "//");
     if (runtimeConfig) {
      if ("string" === typeof Module["websocket"]["url"]) {
       url = Module["websocket"]["url"];
      }
     }
     if (url === "ws://" || url === "wss://") {
      var parts = addr.split("/");
      url = url + parts[0] + ":" + port + "/" + parts.slice(1).join("/");
     }
     var subProtocols = "binary";
     if (runtimeConfig) {
      if ("string" === typeof Module["websocket"]["subprotocol"]) {
       subProtocols = Module["websocket"]["subprotocol"];
      }
     }
     subProtocols = subProtocols.replace(/^ +| +$/g, "").split(/ *, */);
     var opts = ENVIRONMENT_IS_NODE ? {
      "protocol": subProtocols.toString()
     } : subProtocols;
     var WebSocket = ENVIRONMENT_IS_NODE ? require("ws") : window["WebSocket"];
     ws = new WebSocket(url, opts);
     ws.binaryType = "arraybuffer";
    } catch (e) {
     throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
    }
   }
   var peer = {
    addr: addr,
    port: port,
    socket: ws,
    dgram_send_queue: []
   };
   SOCKFS.websocket_sock_ops.addPeer(sock, peer);
   SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
   if (sock.type === 2 && typeof sock.sport !== "undefined") {
    peer.dgram_send_queue.push(new Uint8Array([ 255, 255, 255, 255, "p".charCodeAt(0), "o".charCodeAt(0), "r".charCodeAt(0), "t".charCodeAt(0), (sock.sport & 65280) >> 8, sock.sport & 255 ]));
   }
   return peer;
  }),
  getPeer: (function(sock, addr, port) {
   return sock.peers[addr + ":" + port];
  }),
  addPeer: (function(sock, peer) {
   sock.peers[peer.addr + ":" + peer.port] = peer;
  }),
  removePeer: (function(sock, peer) {
   delete sock.peers[peer.addr + ":" + peer.port];
  }),
  handlePeerEvents: (function(sock, peer) {
   var first = true;
   var handleOpen = (function() {
    Module["websocket"].emit("open", sock.stream.fd);
    try {
     var queued = peer.dgram_send_queue.shift();
     while (queued) {
      peer.socket.send(queued);
      queued = peer.dgram_send_queue.shift();
     }
    } catch (e) {
     peer.socket.close();
    }
   });
   function handleMessage(data) {
    assert(typeof data !== "string" && data.byteLength !== undefined);
    data = new Uint8Array(data);
    var wasfirst = first;
    first = false;
    if (wasfirst && data.length === 10 && data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 && data[4] === "p".charCodeAt(0) && data[5] === "o".charCodeAt(0) && data[6] === "r".charCodeAt(0) && data[7] === "t".charCodeAt(0)) {
     var newport = data[8] << 8 | data[9];
     SOCKFS.websocket_sock_ops.removePeer(sock, peer);
     peer.port = newport;
     SOCKFS.websocket_sock_ops.addPeer(sock, peer);
     return;
    }
    sock.recv_queue.push({
     addr: peer.addr,
     port: peer.port,
     data: data
    });
    Module["websocket"].emit("message", sock.stream.fd);
   }
   if (ENVIRONMENT_IS_NODE) {
    peer.socket.on("open", handleOpen);
    peer.socket.on("message", (function(data, flags) {
     if (!flags.binary) {
      return;
     }
     handleMessage((new Uint8Array(data)).buffer);
    }));
    peer.socket.on("close", (function() {
     Module["websocket"].emit("close", sock.stream.fd);
    }));
    peer.socket.on("error", (function(error) {
     sock.error = ERRNO_CODES.ECONNREFUSED;
     Module["websocket"].emit("error", [ sock.stream.fd, sock.error, "ECONNREFUSED: Connection refused" ]);
    }));
   } else {
    peer.socket.onopen = handleOpen;
    peer.socket.onclose = (function() {
     Module["websocket"].emit("close", sock.stream.fd);
    });
    peer.socket.onmessage = function peer_socket_onmessage(event) {
     handleMessage(event.data);
    };
    peer.socket.onerror = (function(error) {
     sock.error = ERRNO_CODES.ECONNREFUSED;
     Module["websocket"].emit("error", [ sock.stream.fd, sock.error, "ECONNREFUSED: Connection refused" ]);
    });
   }
  }),
  poll: (function(sock) {
   if (sock.type === 1 && sock.server) {
    return sock.pending.length ? 64 | 1 : 0;
   }
   var mask = 0;
   var dest = sock.type === 1 ? SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) : null;
   if (sock.recv_queue.length || !dest || dest && dest.socket.readyState === dest.socket.CLOSING || dest && dest.socket.readyState === dest.socket.CLOSED) {
    mask |= 64 | 1;
   }
   if (!dest || dest && dest.socket.readyState === dest.socket.OPEN) {
    mask |= 4;
   }
   if (dest && dest.socket.readyState === dest.socket.CLOSING || dest && dest.socket.readyState === dest.socket.CLOSED) {
    mask |= 16;
   }
   return mask;
  }),
  ioctl: (function(sock, request, arg) {
   switch (request) {
   case 21531:
    var bytes = 0;
    if (sock.recv_queue.length) {
     bytes = sock.recv_queue[0].data.length;
    }
    HEAP32[arg >> 2] = bytes;
    return 0;
   default:
    return ERRNO_CODES.EINVAL;
   }
  }),
  close: (function(sock) {
   if (sock.server) {
    try {
     sock.server.close();
    } catch (e) {}
    sock.server = null;
   }
   var peers = Object.keys(sock.peers);
   for (var i = 0; i < peers.length; i++) {
    var peer = sock.peers[peers[i]];
    try {
     peer.socket.close();
    } catch (e) {}
    SOCKFS.websocket_sock_ops.removePeer(sock, peer);
   }
   return 0;
  }),
  bind: (function(sock, addr, port) {
   if (typeof sock.saddr !== "undefined" || typeof sock.sport !== "undefined") {
    throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
   }
   sock.saddr = addr;
   sock.sport = port || _mkport();
   if (sock.type === 2) {
    if (sock.server) {
     sock.server.close();
     sock.server = null;
    }
    try {
     sock.sock_ops.listen(sock, 0);
    } catch (e) {
     if (!(e instanceof FS.ErrnoError)) throw e;
     if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
    }
   }
  }),
  connect: (function(sock, addr, port) {
   if (sock.server) {
    throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
   }
   if (typeof sock.daddr !== "undefined" && typeof sock.dport !== "undefined") {
    var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
    if (dest) {
     if (dest.socket.readyState === dest.socket.CONNECTING) {
      throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
     } else {
      throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
     }
    }
   }
   var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
   sock.daddr = peer.addr;
   sock.dport = peer.port;
   throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
  }),
  listen: (function(sock, backlog) {
   if (!ENVIRONMENT_IS_NODE) {
    throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
   }
   if (sock.server) {
    throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
   }
   var WebSocketServer = require("ws").Server;
   var host = sock.saddr;
   sock.server = new WebSocketServer({
    host: host,
    port: sock.sport
   });
   Module["websocket"].emit("listen", sock.stream.fd);
   sock.server.on("connection", (function(ws) {
    if (sock.type === 1) {
     var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
     var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
     newsock.daddr = peer.addr;
     newsock.dport = peer.port;
     sock.pending.push(newsock);
     Module["websocket"].emit("connection", newsock.stream.fd);
    } else {
     SOCKFS.websocket_sock_ops.createPeer(sock, ws);
     Module["websocket"].emit("connection", sock.stream.fd);
    }
   }));
   sock.server.on("closed", (function() {
    Module["websocket"].emit("close", sock.stream.fd);
    sock.server = null;
   }));
   sock.server.on("error", (function(error) {
    sock.error = ERRNO_CODES.EHOSTUNREACH;
    Module["websocket"].emit("error", [ sock.stream.fd, sock.error, "EHOSTUNREACH: Host is unreachable" ]);
   }));
  }),
  accept: (function(listensock) {
   if (!listensock.server) {
    throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
   }
   var newsock = listensock.pending.shift();
   newsock.stream.flags = listensock.stream.flags;
   return newsock;
  }),
  getname: (function(sock, peer) {
   var addr, port;
   if (peer) {
    if (sock.daddr === undefined || sock.dport === undefined) {
     throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
    }
    addr = sock.daddr;
    port = sock.dport;
   } else {
    addr = sock.saddr || 0;
    port = sock.sport || 0;
   }
   return {
    addr: addr,
    port: port
   };
  }),
  sendmsg: (function(sock, buffer, offset, length, addr, port) {
   if (sock.type === 2) {
    if (addr === undefined || port === undefined) {
     addr = sock.daddr;
     port = sock.dport;
    }
    if (addr === undefined || port === undefined) {
     throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
    }
   } else {
    addr = sock.daddr;
    port = sock.dport;
   }
   var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
   if (sock.type === 1) {
    if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
     throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
    } else if (dest.socket.readyState === dest.socket.CONNECTING) {
     throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
    }
   }
   var data;
   if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
    data = buffer.slice(offset, offset + length);
   } else {
    data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
   }
   if (sock.type === 2) {
    if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
     if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
      dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
     }
     dest.dgram_send_queue.push(data);
     return length;
    }
   }
   try {
    dest.socket.send(data);
    return length;
   } catch (e) {
    throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
   }
  }),
  recvmsg: (function(sock, length) {
   if (sock.type === 1 && sock.server) {
    throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
   }
   var queued = sock.recv_queue.shift();
   if (!queued) {
    if (sock.type === 1) {
     var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
     if (!dest) {
      throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
     } else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
      return null;
     } else {
      throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
     }
    } else {
     throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
    }
   }
   var queuedLength = queued.data.byteLength || queued.data.length;
   var queuedOffset = queued.data.byteOffset || 0;
   var queuedBuffer = queued.data.buffer || queued.data;
   var bytesRead = Math.min(length, queuedLength);
   var res = {
    buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
    addr: queued.addr,
    port: queued.port
   };
   if (sock.type === 1 && bytesRead < queuedLength) {
    var bytesRemaining = queuedLength - bytesRead;
    queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
    sock.recv_queue.unshift(queued);
   }
   return res;
  })
 }
};
function _send(fd, buf, len, flags) {
 var sock = SOCKFS.getSocket(fd);
 if (!sock) {
  ___setErrNo(ERRNO_CODES.EBADF);
  return -1;
 }
 return _write(fd, buf, len);
}
function _pwrite(fildes, buf, nbyte, offset) {
 var stream = FS.getStream(fildes);
 if (!stream) {
  ___setErrNo(ERRNO_CODES.EBADF);
  return -1;
 }
 try {
  var slab = HEAP8;
  return FS.write(stream, slab, buf, nbyte, offset);
 } catch (e) {
  FS.handleFSError(e);
  return -1;
 }
}
function _write(fildes, buf, nbyte) {
 var stream = FS.getStream(fildes);
 if (!stream) {
  ___setErrNo(ERRNO_CODES.EBADF);
  return -1;
 }
 try {
  var slab = HEAP8;
  return FS.write(stream, slab, buf, nbyte);
 } catch (e) {
  FS.handleFSError(e);
  return -1;
 }
}
function _fputc(c, stream) {
 var chr = unSign(c & 255);
 HEAP8[_fputc.ret >> 0] = chr;
 var fd = _fileno(stream);
 var ret = _write(fd, _fputc.ret, 1);
 if (ret == -1) {
  var streamObj = FS.getStreamFromPtr(stream);
  if (streamObj) streamObj.error = true;
  return -1;
 } else {
  return chr;
 }
}
function _emscripten_glVertexPointer() {
 throw "Legacy GL function (glVertexPointer) called. If you want legacy GL emulation, you need to compile with -s LEGACY_GL_EMULATION=1 to enable legacy GL emulation.";
}
function _emscripten_glUniform3iv(location, count, value) {
 location = GL.uniforms[location];
 count *= 3;
 value = HEAP32.subarray(value >> 2, value + count * 4 >> 2);
 GLctx.uniform3iv(location, value);
}
function _fwrite(ptr, size, nitems, stream) {
 var bytesToWrite = nitems * size;
 if (bytesToWrite == 0) return 0;
 var fd = _fileno(stream);
 var bytesWritten = _write(fd, ptr, bytesToWrite);
 if (bytesWritten == -1) {
  var streamObj = FS.getStreamFromPtr(stream);
  if (streamObj) streamObj.error = true;
  return 0;
 } else {
  return bytesWritten / size | 0;
 }
}
function _emscripten_glIsFramebuffer(framebuffer) {
 var fb = GL.framebuffers[framebuffer];
 if (!fb) return 0;
 return GLctx.isFramebuffer(fb);
}
function _emscripten_glClientActiveTexture() {
 Module["printErr"]("missing function: emscripten_glClientActiveTexture");
 abort(-1);
}
function _emscripten_glReleaseShaderCompiler() {}
function _emscripten_glGetShaderInfoLog(shader, maxLength, length, infoLog) {
 var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
 if (log === null) log = "(unknown error)";
 log = log.substr(0, maxLength - 1);
 if (maxLength > 0 && infoLog) {
  writeStringToMemory(log, infoLog);
  if (length) HEAP32[length >> 2] = log.length;
 } else {
  if (length) HEAP32[length >> 2] = 0;
 }
}
function _emscripten_glIsTexture(texture) {
 var texture = GL.textures[texture];
 if (!texture) return 0;
 return GLctx.isTexture(texture);
}
function _emscripten_glTexParameterf(x0, x1, x2) {
 GLctx.texParameterf(x0, x1, x2);
}
function _emscripten_glGetRenderbufferParameteriv(target, pname, params) {
 HEAP32[params >> 2] = GLctx.getRenderbufferParameter(target, pname);
}
function _emscripten_glStencilOpSeparate(x0, x1, x2, x3) {
 GLctx.stencilOpSeparate(x0, x1, x2, x3);
}
function _emscripten_glTexParameteri(x0, x1, x2) {
 GLctx.texParameteri(x0, x1, x2);
}
function _emscripten_glReadPixels(x, y, width, height, format, type, pixels) {
 var data = GL.getTexPixelData(type, format, width, height, pixels, format);
 if (!data.pixels) {
  GL.recordError(1280);
  return;
 }
 GLctx.readPixels(x, y, width, height, format, type, data.pixels);
}
function _emscripten_glCompressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, imageSize, data) {
 if (data) {
  data = HEAPU8.subarray(data, data + imageSize);
 } else {
  data = null;
 }
 GLctx["compressedTexSubImage2D"](target, level, xoffset, yoffset, width, height, format, data);
}
function _emscripten_glGetError() {
 if (GL.lastError) {
  var error = GL.lastError;
  GL.lastError = 0;
  return error;
 } else {
  return GLctx.getError();
 }
}
function _emscripten_glUniform4f(location, v0, v1, v2, v3) {
 location = GL.uniforms[location];
 GLctx.uniform4f(location, v0, v1, v2, v3);
}
function _emscripten_glFramebufferTexture2D(target, attachment, textarget, texture, level) {
 GLctx.framebufferTexture2D(target, attachment, textarget, GL.textures[texture], level);
}
function _emscripten_glFrustum() {
 Module["printErr"]("missing function: emscripten_glFrustum");
 abort(-1);
}
function _emscripten_glGetTexParameterfv(target, pname, params) {
 HEAPF32[params >> 2] = GLctx.getTexParameter(target, pname);
}
function _emscripten_glUniform4i(location, v0, v1, v2, v3) {
 location = GL.uniforms[location];
 GLctx.uniform4i(location, v0, v1, v2, v3);
}
function _emscripten_glIsEnabled(x0) {
 return GLctx.isEnabled(x0);
}
function _emscripten_glBindRenderbuffer(target, renderbuffer) {
 GLctx.bindRenderbuffer(target, renderbuffer ? GL.renderbuffers[renderbuffer] : null);
}
function _emscripten_glViewport(x0, x1, x2, x3) {
 GLctx.viewport(x0, x1, x2, x3);
}
function _emscripten_memcpy_big(dest, src, num) {
 HEAPU8.set(HEAPU8.subarray(src, src + num), dest);
 return dest;
}
Module["_memcpy"] = _memcpy;
function _emscripten_glCopyTexImage2D(x0, x1, x2, x3, x4, x5, x6, x7) {
 GLctx.copyTexImage2D(x0, x1, x2, x3, x4, x5, x6, x7);
}
function _emscripten_glTexParameterfv(target, pname, params) {
 var param = HEAPF32[params >> 2];
 GLctx.texParameterf(target, pname, param);
}
function _emscripten_glClearDepthf(x0) {
 GLctx.clearDepth(x0);
}
var LOCALE = {
 curr: 0,
 check: (function(locale) {
  if (locale) locale = Pointer_stringify(locale);
  return locale === "C" || locale === "POSIX" || !locale;
 })
};
function _calloc(n, s) {
 var ret = _malloc(n * s);
 _memset(ret, 0, n * s);
 return ret;
}
function _newlocale(mask, locale, base) {
 if (!LOCALE.check(locale)) {
  ___setErrNo(ERRNO_CODES.ENOENT);
  return 0;
 }
 if (!base) base = _calloc(1, 4);
 return base;
}
function _emscripten_glVertexAttrib4f(x0, x1, x2, x3, x4) {
 GLctx.vertexAttrib4f(x0, x1, x2, x3, x4);
}
function _emscripten_glLinkProgram(program) {
 GLctx.linkProgram(GL.programs[program]);
 GL.programInfos[program] = null;
 GL.populateUniformTable(program);
}
function _emscripten_glUniform3f(location, v0, v1, v2) {
 location = GL.uniforms[location];
 GLctx.uniform3f(location, v0, v1, v2);
}
function _emscripten_glGetObjectParameterivARB() {
 Module["printErr"]("missing function: emscripten_glGetObjectParameterivARB");
 abort(-1);
}
function _emscripten_glBlendFunc(x0, x1) {
 GLctx.blendFunc(x0, x1);
}
function _emscripten_glUniform3i(location, v0, v1, v2) {
 location = GL.uniforms[location];
 GLctx.uniform3i(location, v0, v1, v2);
}
function _emscripten_glStencilOp(x0, x1, x2) {
 GLctx.stencilOp(x0, x1, x2);
}
function _emscripten_glBindAttribLocation(program, index, name) {
 name = Pointer_stringify(name);
 GLctx.bindAttribLocation(GL.programs[program], index, name);
}
function _emscripten_glBindBuffer(target, buffer) {
 var bufferObj = buffer ? GL.buffers[buffer] : null;
 GLctx.bindBuffer(target, bufferObj);
}
function _emscripten_glEnableVertexAttribArray(index) {
 GLctx.enableVertexAttribArray(index);
}
Module["_memset"] = _memset;
var _BDtoILow = true;
function _emscripten_glGetUniformfv(program, location, params) {
 var data = GLctx.getUniform(GL.programs[program], GL.uniforms[location]);
 if (typeof data == "number") {
  HEAPF32[params >> 2] = data;
 } else {
  for (var i = 0; i < data.length; i++) {
   HEAPF32[params + i >> 2] = data[i];
  }
 }
}
function _emscripten_glUniform1i(location, v0) {
 location = GL.uniforms[location];
 GLctx.uniform1i(location, v0);
}
function _strerror_r(errnum, strerrbuf, buflen) {
 if (errnum in ERRNO_MESSAGES) {
  if (ERRNO_MESSAGES[errnum].length > buflen - 1) {
   return ___setErrNo(ERRNO_CODES.ERANGE);
  } else {
   var msg = ERRNO_MESSAGES[errnum];
   writeAsciiToMemory(msg, strerrbuf);
   return 0;
  }
 } else {
  return ___setErrNo(ERRNO_CODES.EINVAL);
 }
}
function _strerror(errnum) {
 if (!_strerror.buffer) _strerror.buffer = _malloc(256);
 _strerror_r(errnum, _strerror.buffer, 256);
 return _strerror.buffer;
}
Module["_bitshift64Shl"] = _bitshift64Shl;
function _emscripten_glGetBufferParameteriv(target, value, data) {
 HEAP32[data >> 2] = GLctx.getBufferParameter(target, value);
}
function ___assert_fail(condition, filename, line, func) {
 ABORT = true;
 throw "Assertion failed: " + Pointer_stringify(condition) + ", at: " + [ filename ? Pointer_stringify(filename) : "unknown filename", line, func ? Pointer_stringify(func) : "unknown function" ] + " at " + stackTrace();
}
function _emscripten_glDrawRangeElements() {
 Module["printErr"]("missing function: emscripten_glDrawRangeElements");
 abort(-1);
}
function _emscripten_glGetAttachedShaders(program, maxCount, count, shaders) {
 var result = GLctx.getAttachedShaders(GL.programs[program]);
 var len = result.length;
 if (len > maxCount) {
  len = maxCount;
 }
 HEAP32[count >> 2] = len;
 for (var i = 0; i < len; ++i) {
  var id = GL.shaders.indexOf(result[i]);
  HEAP32[shaders + i * 4 >> 2] = id;
 }
}
function _emscripten_glGenRenderbuffers(n, renderbuffers) {
 for (var i = 0; i < n; i++) {
  var renderbuffer = GLctx.createRenderbuffer();
  if (!renderbuffer) {
   GL.recordError(1282);
   while (i < n) HEAP32[renderbuffers + i++ * 4 >> 2] = 0;
   return;
  }
  var id = GL.getNewId(GL.renderbuffers);
  renderbuffer.name = id;
  GL.renderbuffers[id] = renderbuffer;
  HEAP32[renderbuffers + i * 4 >> 2] = id;
 }
}
function _emscripten_glBlendFuncSeparate(x0, x1, x2, x3) {
 GLctx.blendFuncSeparate(x0, x1, x2, x3);
}
function _emscripten_glFrontFace(x0) {
 GLctx.frontFace(x0);
}
function _pthread_cond_wait() {
 return 0;
}
function _emscripten_glVertexAttrib3f(x0, x1, x2, x3) {
 GLctx.vertexAttrib3f(x0, x1, x2, x3);
}
function _emscripten_glUniform1iv(location, count, value) {
 location = GL.uniforms[location];
 value = HEAP32.subarray(value >> 2, value + count * 4 >> 2);
 GLctx.uniform1iv(location, value);
}
function _emscripten_glTexCoordPointer() {
 Module["printErr"]("missing function: emscripten_glTexCoordPointer");
 abort(-1);
}
function _emscripten_glEnable(x0) {
 GLctx.enable(x0);
}
function _emscripten_glGetShaderSource(shader, bufSize, length, source) {
 var result = GLctx.getShaderSource(GL.shaders[shader]);
 if (!result) return;
 result = result.slice(0, Math.max(0, bufSize - 1));
 if (bufSize > 0 && source) {
  writeStringToMemory(result, source);
  if (length) HEAP32[length >> 2] = result.length;
 } else {
  if (length) HEAP32[length >> 2] = 0;
 }
}
function _emscripten_glGetInfoLogARB() {
 Module["printErr"]("missing function: emscripten_glGetInfoLogARB");
 abort(-1);
}
function _emscripten_glNormalPointer() {
 Module["printErr"]("missing function: emscripten_glNormalPointer");
 abort(-1);
}
function _emscripten_set_main_loop_timing(mode, value) {
 Browser.mainLoop.timingMode = mode;
 Browser.mainLoop.timingValue = value;
 if (!Browser.mainLoop.func) {
  return 1;
 }
 if (mode == 0) {
  Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler() {
   setTimeout(Browser.mainLoop.runner, value);
  };
  Browser.mainLoop.method = "timeout";
 } else if (mode == 1) {
  Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler() {
   Browser.requestAnimationFrame(Browser.mainLoop.runner);
  };
  Browser.mainLoop.method = "rAF";
 }
 return 0;
}
function _emscripten_set_main_loop(func, fps, simulateInfiniteLoop, arg, noSetTiming) {
 Module["noExitRuntime"] = true;
 assert(!Browser.mainLoop.func, "emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.");
 Browser.mainLoop.func = func;
 Browser.mainLoop.arg = arg;
 var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop;
 Browser.mainLoop.runner = function Browser_mainLoop_runner() {
  if (ABORT) return;
  if (Browser.mainLoop.queue.length > 0) {
   var start = Date.now();
   var blocker = Browser.mainLoop.queue.shift();
   blocker.func(blocker.arg);
   if (Browser.mainLoop.remainingBlockers) {
    var remaining = Browser.mainLoop.remainingBlockers;
    var next = remaining % 1 == 0 ? remaining - 1 : Math.floor(remaining);
    if (blocker.counted) {
     Browser.mainLoop.remainingBlockers = next;
    } else {
     next = next + .5;
     Browser.mainLoop.remainingBlockers = (8 * remaining + next) / 9;
    }
   }
   console.log('main loop blocker "' + blocker.name + '" took ' + (Date.now() - start) + " ms");
   Browser.mainLoop.updateStatus();
   setTimeout(Browser.mainLoop.runner, 0);
   return;
  }
  if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
  Browser.mainLoop.currentFrameNumber = Browser.mainLoop.currentFrameNumber + 1 | 0;
  if (Browser.mainLoop.timingMode == 1 && Browser.mainLoop.timingValue > 1 && Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0) {
   Browser.mainLoop.scheduler();
   return;
  }
  if (Browser.mainLoop.method === "timeout" && Module.ctx) {
   Module.printErr("Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!");
   Browser.mainLoop.method = "";
  }
  Browser.mainLoop.runIter((function() {
   if (typeof arg !== "undefined") {
    Runtime.dynCall("vi", func, [ arg ]);
   } else {
    Runtime.dynCall("v", func);
   }
  }));
  if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
  if (typeof SDL === "object" && SDL.audio && SDL.audio.queueNewAudioData) SDL.audio.queueNewAudioData();
  Browser.mainLoop.scheduler();
 };
 if (!noSetTiming) {
  if (fps && fps > 0) _emscripten_set_main_loop_timing(0, 1e3 / fps); else _emscripten_set_main_loop_timing(1, 1);
  Browser.mainLoop.scheduler();
 }
 if (simulateInfiniteLoop) {
  throw "SimulateInfiniteLoop";
 }
}
var Browser = {
 mainLoop: {
  scheduler: null,
  method: "",
  currentlyRunningMainloop: 0,
  func: null,
  arg: 0,
  timingMode: 0,
  timingValue: 0,
  currentFrameNumber: 0,
  queue: [],
  pause: (function() {
   Browser.mainLoop.scheduler = null;
   Browser.mainLoop.currentlyRunningMainloop++;
  }),
  resume: (function() {
   Browser.mainLoop.currentlyRunningMainloop++;
   var timingMode = Browser.mainLoop.timingMode;
   var timingValue = Browser.mainLoop.timingValue;
   var func = Browser.mainLoop.func;
   Browser.mainLoop.func = null;
   _emscripten_set_main_loop(func, 0, false, Browser.mainLoop.arg, true);
   _emscripten_set_main_loop_timing(timingMode, timingValue);
   Browser.mainLoop.scheduler();
  }),
  updateStatus: (function() {
   if (Module["setStatus"]) {
    var message = Module["statusMessage"] || "Please wait...";
    var remaining = Browser.mainLoop.remainingBlockers;
    var expected = Browser.mainLoop.expectedBlockers;
    if (remaining) {
     if (remaining < expected) {
      Module["setStatus"](message + " (" + (expected - remaining) + "/" + expected + ")");
     } else {
      Module["setStatus"](message);
     }
    } else {
     Module["setStatus"]("");
    }
   }
  }),
  runIter: (function(func) {
   if (ABORT) return;
   if (Module["preMainLoop"]) {
    var preRet = Module["preMainLoop"]();
    if (preRet === false) {
     return;
    }
   }
   try {
    func();
   } catch (e) {
    if (e instanceof ExitStatus) {
     return;
    } else {
     if (e && typeof e === "object" && e.stack) Module.printErr("exception thrown: " + [ e, e.stack ]);
     throw e;
    }
   }
   if (Module["postMainLoop"]) Module["postMainLoop"]();
  })
 },
 isFullScreen: false,
 pointerLock: false,
 moduleContextCreatedCallbacks: [],
 workers: [],
 init: (function() {
  if (!Module["preloadPlugins"]) Module["preloadPlugins"] = [];
  if (Browser.initted) return;
  Browser.initted = true;
  try {
   new Blob;
   Browser.hasBlobConstructor = true;
  } catch (e) {
   Browser.hasBlobConstructor = false;
   console.log("warning: no blob constructor, cannot create blobs with mimetypes");
  }
  Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : !Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null;
  Browser.URLObject = typeof window != "undefined" ? window.URL ? window.URL : window.webkitURL : undefined;
  if (!Module.noImageDecoding && typeof Browser.URLObject === "undefined") {
   console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
   Module.noImageDecoding = true;
  }
  var imagePlugin = {};
  imagePlugin["canHandle"] = function imagePlugin_canHandle(name) {
   return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
  };
  imagePlugin["handle"] = function imagePlugin_handle(byteArray, name, onload, onerror) {
   var b = null;
   if (Browser.hasBlobConstructor) {
    try {
     b = new Blob([ byteArray ], {
      type: Browser.getMimetype(name)
     });
     if (b.size !== byteArray.length) {
      b = new Blob([ (new Uint8Array(byteArray)).buffer ], {
       type: Browser.getMimetype(name)
      });
     }
    } catch (e) {
     Runtime.warnOnce("Blob constructor present but fails: " + e + "; falling back to blob builder");
    }
   }
   if (!b) {
    var bb = new Browser.BlobBuilder;
    bb.append((new Uint8Array(byteArray)).buffer);
    b = bb.getBlob();
   }
   var url = Browser.URLObject.createObjectURL(b);
   var img = new Image;
   img.onload = function img_onload() {
    assert(img.complete, "Image " + name + " could not be decoded");
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    Module["preloadedImages"][name] = canvas;
    Browser.URLObject.revokeObjectURL(url);
    if (onload) onload(byteArray);
   };
   img.onerror = function img_onerror(event) {
    console.log("Image " + url + " could not be decoded");
    if (onerror) onerror();
   };
   img.src = url;
  };
  Module["preloadPlugins"].push(imagePlugin);
  var audioPlugin = {};
  audioPlugin["canHandle"] = function audioPlugin_canHandle(name) {
   return !Module.noAudioDecoding && name.substr(-4) in {
    ".ogg": 1,
    ".wav": 1,
    ".mp3": 1
   };
  };
  audioPlugin["handle"] = function audioPlugin_handle(byteArray, name, onload, onerror) {
   var done = false;
   function finish(audio) {
    if (done) return;
    done = true;
    Module["preloadedAudios"][name] = audio;
    if (onload) onload(byteArray);
   }
   function fail() {
    if (done) return;
    done = true;
    Module["preloadedAudios"][name] = new Audio;
    if (onerror) onerror();
   }
   if (Browser.hasBlobConstructor) {
    try {
     var b = new Blob([ byteArray ], {
      type: Browser.getMimetype(name)
     });
    } catch (e) {
     return fail();
    }
    var url = Browser.URLObject.createObjectURL(b);
    var audio = new Audio;
    audio.addEventListener("canplaythrough", (function() {
     finish(audio);
    }), false);
    audio.onerror = function audio_onerror(event) {
     if (done) return;
     console.log("warning: browser could not fully decode audio " + name + ", trying slower base64 approach");
     function encode64(data) {
      var BASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      var PAD = "=";
      var ret = "";
      var leftchar = 0;
      var leftbits = 0;
      for (var i = 0; i < data.length; i++) {
       leftchar = leftchar << 8 | data[i];
       leftbits += 8;
       while (leftbits >= 6) {
        var curr = leftchar >> leftbits - 6 & 63;
        leftbits -= 6;
        ret += BASE[curr];
       }
      }
      if (leftbits == 2) {
       ret += BASE[(leftchar & 3) << 4];
       ret += PAD + PAD;
      } else if (leftbits == 4) {
       ret += BASE[(leftchar & 15) << 2];
       ret += PAD;
      }
      return ret;
     }
     audio.src = "data:audio/x-" + name.substr(-3) + ";base64," + encode64(byteArray);
     finish(audio);
    };
    audio.src = url;
    Browser.safeSetTimeout((function() {
     finish(audio);
    }), 1e4);
   } else {
    return fail();
   }
  };
  Module["preloadPlugins"].push(audioPlugin);
  var canvas = Module["canvas"];
  function pointerLockChange() {
   Browser.pointerLock = document["pointerLockElement"] === canvas || document["mozPointerLockElement"] === canvas || document["webkitPointerLockElement"] === canvas || document["msPointerLockElement"] === canvas;
  }
  if (canvas) {
   canvas.requestPointerLock = canvas["requestPointerLock"] || canvas["mozRequestPointerLock"] || canvas["webkitRequestPointerLock"] || canvas["msRequestPointerLock"] || (function() {});
   canvas.exitPointerLock = document["exitPointerLock"] || document["mozExitPointerLock"] || document["webkitExitPointerLock"] || document["msExitPointerLock"] || (function() {});
   canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
   document.addEventListener("pointerlockchange", pointerLockChange, false);
   document.addEventListener("mozpointerlockchange", pointerLockChange, false);
   document.addEventListener("webkitpointerlockchange", pointerLockChange, false);
   document.addEventListener("mspointerlockchange", pointerLockChange, false);
   if (Module["elementPointerLock"]) {
    canvas.addEventListener("click", (function(ev) {
     if (!Browser.pointerLock && canvas.requestPointerLock) {
      canvas.requestPointerLock();
      ev.preventDefault();
     }
    }), false);
   }
  }
 }),
 createContext: (function(canvas, useWebGL, setInModule, webGLContextAttributes) {
  if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx;
  var ctx;
  var contextHandle;
  if (useWebGL) {
   var contextAttributes = {
    antialias: false,
    alpha: false
   };
   if (webGLContextAttributes) {
    for (var attribute in webGLContextAttributes) {
     contextAttributes[attribute] = webGLContextAttributes[attribute];
    }
   }
   contextHandle = GL.createContext(canvas, contextAttributes);
   if (contextHandle) {
    ctx = GL.getContext(contextHandle).GLctx;
   }
   canvas.style.backgroundColor = "black";
  } else {
   ctx = canvas.getContext("2d");
  }
  if (!ctx) return null;
  if (setInModule) {
   if (!useWebGL) assert(typeof GLctx === "undefined", "cannot set in module if GLctx is used, but we are a non-GL context that would replace it");
   Module.ctx = ctx;
   if (useWebGL) GL.makeContextCurrent(contextHandle);
   Module.useWebGL = useWebGL;
   Browser.moduleContextCreatedCallbacks.forEach((function(callback) {
    callback();
   }));
   Browser.init();
  }
  return ctx;
 }),
 destroyContext: (function(canvas, useWebGL, setInModule) {}),
 fullScreenHandlersInstalled: false,
 lockPointer: undefined,
 resizeCanvas: undefined,
 requestFullScreen: (function(lockPointer, resizeCanvas, vrDevice) {
  Browser.lockPointer = lockPointer;
  Browser.resizeCanvas = resizeCanvas;
  Browser.vrDevice = vrDevice;
  if (typeof Browser.lockPointer === "undefined") Browser.lockPointer = true;
  if (typeof Browser.resizeCanvas === "undefined") Browser.resizeCanvas = false;
  if (typeof Browser.vrDevice === "undefined") Browser.vrDevice = null;
  var canvas = Module["canvas"];
  function fullScreenChange() {
   Browser.isFullScreen = false;
   var canvasContainer = canvas.parentNode;
   if ((document["webkitFullScreenElement"] || document["webkitFullscreenElement"] || document["mozFullScreenElement"] || document["mozFullscreenElement"] || document["fullScreenElement"] || document["fullscreenElement"] || document["msFullScreenElement"] || document["msFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvasContainer) {
    canvas.cancelFullScreen = document["cancelFullScreen"] || document["mozCancelFullScreen"] || document["webkitCancelFullScreen"] || document["msExitFullscreen"] || document["exitFullscreen"] || (function() {});
    canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
    if (Browser.lockPointer) canvas.requestPointerLock();
    Browser.isFullScreen = true;
    if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
   } else {
    canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
    canvasContainer.parentNode.removeChild(canvasContainer);
    if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
   }
   if (Module["onFullScreen"]) Module["onFullScreen"](Browser.isFullScreen);
   Browser.updateCanvasDimensions(canvas);
  }
  if (!Browser.fullScreenHandlersInstalled) {
   Browser.fullScreenHandlersInstalled = true;
   document.addEventListener("fullscreenchange", fullScreenChange, false);
   document.addEventListener("mozfullscreenchange", fullScreenChange, false);
   document.addEventListener("webkitfullscreenchange", fullScreenChange, false);
   document.addEventListener("MSFullscreenChange", fullScreenChange, false);
  }
  var canvasContainer = document.createElement("div");
  canvas.parentNode.insertBefore(canvasContainer, canvas);
  canvasContainer.appendChild(canvas);
  canvasContainer.requestFullScreen = canvasContainer["requestFullScreen"] || canvasContainer["mozRequestFullScreen"] || canvasContainer["msRequestFullscreen"] || (canvasContainer["webkitRequestFullScreen"] ? (function() {
   canvasContainer["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"]);
  }) : null);
  if (vrDevice) {
   canvasContainer.requestFullScreen({
    vrDisplay: vrDevice
   });
  } else {
   canvasContainer.requestFullScreen();
  }
 }),
 nextRAF: 0,
 fakeRequestAnimationFrame: (function(func) {
  var now = Date.now();
  if (Browser.nextRAF === 0) {
   Browser.nextRAF = now + 1e3 / 60;
  } else {
   while (now + 2 >= Browser.nextRAF) {
    Browser.nextRAF += 1e3 / 60;
   }
  }
  var delay = Math.max(Browser.nextRAF - now, 0);
  setTimeout(func, delay);
 }),
 requestAnimationFrame: function requestAnimationFrame(func) {
  if (typeof window === "undefined") {
   Browser.fakeRequestAnimationFrame(func);
  } else {
   if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = window["requestAnimationFrame"] || window["mozRequestAnimationFrame"] || window["webkitRequestAnimationFrame"] || window["msRequestAnimationFrame"] || window["oRequestAnimationFrame"] || Browser.fakeRequestAnimationFrame;
   }
   window.requestAnimationFrame(func);
  }
 },
 safeCallback: (function(func) {
  return (function() {
   if (!ABORT) return func.apply(null, arguments);
  });
 }),
 allowAsyncCallbacks: true,
 queuedAsyncCallbacks: [],
 pauseAsyncCallbacks: (function() {
  Browser.allowAsyncCallbacks = false;
 }),
 resumeAsyncCallbacks: (function() {
  Browser.allowAsyncCallbacks = true;
  if (Browser.queuedAsyncCallbacks.length > 0) {
   var callbacks = Browser.queuedAsyncCallbacks;
   Browser.queuedAsyncCallbacks = [];
   callbacks.forEach((function(func) {
    func();
   }));
  }
 }),
 safeRequestAnimationFrame: (function(func) {
  return Browser.requestAnimationFrame((function() {
   if (ABORT) return;
   if (Browser.allowAsyncCallbacks) {
    func();
   } else {
    Browser.queuedAsyncCallbacks.push(func);
   }
  }));
 }),
 safeSetTimeout: (function(func, timeout) {
  Module["noExitRuntime"] = true;
  return setTimeout((function() {
   if (ABORT) return;
   if (Browser.allowAsyncCallbacks) {
    func();
   } else {
    Browser.queuedAsyncCallbacks.push(func);
   }
  }), timeout);
 }),
 safeSetInterval: (function(func, timeout) {
  Module["noExitRuntime"] = true;
  return setInterval((function() {
   if (ABORT) return;
   if (Browser.allowAsyncCallbacks) {
    func();
   }
  }), timeout);
 }),
 getMimetype: (function(name) {
  return {
   "jpg": "image/jpeg",
   "jpeg": "image/jpeg",
   "png": "image/png",
   "bmp": "image/bmp",
   "ogg": "audio/ogg",
   "wav": "audio/wav",
   "mp3": "audio/mpeg"
  }[name.substr(name.lastIndexOf(".") + 1)];
 }),
 getUserMedia: (function(func) {
  if (!window.getUserMedia) {
   window.getUserMedia = navigator["getUserMedia"] || navigator["mozGetUserMedia"];
  }
  window.getUserMedia(func);
 }),
 getMovementX: (function(event) {
  return event["movementX"] || event["mozMovementX"] || event["webkitMovementX"] || 0;
 }),
 getMovementY: (function(event) {
  return event["movementY"] || event["mozMovementY"] || event["webkitMovementY"] || 0;
 }),
 getMouseWheelDelta: (function(event) {
  var delta = 0;
  switch (event.type) {
  case "DOMMouseScroll":
   delta = event.detail;
   break;
  case "mousewheel":
   delta = event.wheelDelta;
   break;
  case "wheel":
   delta = event["deltaY"];
   break;
  default:
   throw "unrecognized mouse wheel event: " + event.type;
  }
  return delta;
 }),
 mouseX: 0,
 mouseY: 0,
 mouseMovementX: 0,
 mouseMovementY: 0,
 touches: {},
 lastTouches: {},
 calculateMouseEvent: (function(event) {
  if (Browser.pointerLock) {
   if (event.type != "mousemove" && "mozMovementX" in event) {
    Browser.mouseMovementX = Browser.mouseMovementY = 0;
   } else {
    Browser.mouseMovementX = Browser.getMovementX(event);
    Browser.mouseMovementY = Browser.getMovementY(event);
   }
   if (typeof SDL != "undefined") {
    Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
    Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
   } else {
    Browser.mouseX += Browser.mouseMovementX;
    Browser.mouseY += Browser.mouseMovementY;
   }
  } else {
   var rect = Module["canvas"].getBoundingClientRect();
   var cw = Module["canvas"].width;
   var ch = Module["canvas"].height;
   var scrollX = typeof window.scrollX !== "undefined" ? window.scrollX : window.pageXOffset;
   var scrollY = typeof window.scrollY !== "undefined" ? window.scrollY : window.pageYOffset;
   if (event.type === "touchstart" || event.type === "touchend" || event.type === "touchmove") {
    var touch = event.touch;
    if (touch === undefined) {
     return;
    }
    var adjustedX = touch.pageX - (scrollX + rect.left);
    var adjustedY = touch.pageY - (scrollY + rect.top);
    adjustedX = adjustedX * (cw / rect.width);
    adjustedY = adjustedY * (ch / rect.height);
    var coords = {
     x: adjustedX,
     y: adjustedY
    };
    if (event.type === "touchstart") {
     Browser.lastTouches[touch.identifier] = coords;
     Browser.touches[touch.identifier] = coords;
    } else if (event.type === "touchend" || event.type === "touchmove") {
     var last = Browser.touches[touch.identifier];
     if (!last) last = coords;
     Browser.lastTouches[touch.identifier] = last;
     Browser.touches[touch.identifier] = coords;
    }
    return;
   }
   var x = event.pageX - (scrollX + rect.left);
   var y = event.pageY - (scrollY + rect.top);
   x = x * (cw / rect.width);
   y = y * (ch / rect.height);
   Browser.mouseMovementX = x - Browser.mouseX;
   Browser.mouseMovementY = y - Browser.mouseY;
   Browser.mouseX = x;
   Browser.mouseY = y;
  }
 }),
 xhrLoad: (function(url, onload, onerror) {
  var xhr = new XMLHttpRequest;
  xhr.open("GET", url, true);
  xhr.responseType = "arraybuffer";
  xhr.onload = function xhr_onload() {
   if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
    onload(xhr.response);
   } else {
    onerror();
   }
  };
  xhr.onerror = onerror;
  xhr.send(null);
 }),
 asyncLoad: (function(url, onload, onerror, noRunDep) {
  Browser.xhrLoad(url, (function(arrayBuffer) {
   assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
   onload(new Uint8Array(arrayBuffer));
   if (!noRunDep) removeRunDependency("al " + url);
  }), (function(event) {
   if (onerror) {
    onerror();
   } else {
    throw 'Loading data file "' + url + '" failed.';
   }
  }));
  if (!noRunDep) addRunDependency("al " + url);
 }),
 resizeListeners: [],
 updateResizeListeners: (function() {
  var canvas = Module["canvas"];
  Browser.resizeListeners.forEach((function(listener) {
   listener(canvas.width, canvas.height);
  }));
 }),
 setCanvasSize: (function(width, height, noUpdates) {
  var canvas = Module["canvas"];
  Browser.updateCanvasDimensions(canvas, width, height);
  if (!noUpdates) Browser.updateResizeListeners();
 }),
 windowedWidth: 0,
 windowedHeight: 0,
 setFullScreenCanvasSize: (function() {
  if (typeof SDL != "undefined") {
   var flags = HEAPU32[SDL.screen + Runtime.QUANTUM_SIZE * 0 >> 2];
   flags = flags | 8388608;
   HEAP32[SDL.screen + Runtime.QUANTUM_SIZE * 0 >> 2] = flags;
  }
  Browser.updateResizeListeners();
 }),
 setWindowedCanvasSize: (function() {
  if (typeof SDL != "undefined") {
   var flags = HEAPU32[SDL.screen + Runtime.QUANTUM_SIZE * 0 >> 2];
   flags = flags & ~8388608;
   HEAP32[SDL.screen + Runtime.QUANTUM_SIZE * 0 >> 2] = flags;
  }
  Browser.updateResizeListeners();
 }),
 updateCanvasDimensions: (function(canvas, wNative, hNative) {
  if (wNative && hNative) {
   canvas.widthNative = wNative;
   canvas.heightNative = hNative;
  } else {
   wNative = canvas.widthNative;
   hNative = canvas.heightNative;
  }
  var w = wNative;
  var h = hNative;
  if (Module["forcedAspectRatio"] && Module["forcedAspectRatio"] > 0) {
   if (w / h < Module["forcedAspectRatio"]) {
    w = Math.round(h * Module["forcedAspectRatio"]);
   } else {
    h = Math.round(w / Module["forcedAspectRatio"]);
   }
  }
  if ((document["webkitFullScreenElement"] || document["webkitFullscreenElement"] || document["mozFullScreenElement"] || document["mozFullscreenElement"] || document["fullScreenElement"] || document["fullscreenElement"] || document["msFullScreenElement"] || document["msFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvas.parentNode && typeof screen != "undefined") {
   var factor = Math.min(screen.width / w, screen.height / h);
   w = Math.round(w * factor);
   h = Math.round(h * factor);
  }
  if (Browser.resizeCanvas) {
   if (canvas.width != w) canvas.width = w;
   if (canvas.height != h) canvas.height = h;
   if (typeof canvas.style != "undefined") {
    canvas.style.removeProperty("width");
    canvas.style.removeProperty("height");
   }
  } else {
   if (canvas.width != wNative) canvas.width = wNative;
   if (canvas.height != hNative) canvas.height = hNative;
   if (typeof canvas.style != "undefined") {
    if (w != wNative || h != hNative) {
     canvas.style.setProperty("width", w + "px", "important");
     canvas.style.setProperty("height", h + "px", "important");
    } else {
     canvas.style.removeProperty("width");
     canvas.style.removeProperty("height");
    }
   }
  }
 }),
 wgetRequests: {},
 nextWgetRequestHandle: 0,
 getNextWgetRequestHandle: (function() {
  var handle = Browser.nextWgetRequestHandle;
  Browser.nextWgetRequestHandle++;
  return handle;
 })
};
var PTHREAD_SPECIFIC = {};
function _pthread_setspecific(key, value) {
 if (!(key in PTHREAD_SPECIFIC)) {
  return ERRNO_CODES.EINVAL;
 }
 PTHREAD_SPECIFIC[key] = value;
 return 0;
}
function ___ctype_b_loc() {
 var me = ___ctype_b_loc;
 if (!me.ret) {
  var values = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 8195, 8194, 8194, 8194, 8194, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 24577, 49156, 49156, 49156, 49156, 49156, 49156, 49156, 49156, 49156, 49156, 49156, 49156, 49156, 49156, 49156, 55304, 55304, 55304, 55304, 55304, 55304, 55304, 55304, 55304, 55304, 49156, 49156, 49156, 49156, 49156, 49156, 49156, 54536, 54536, 54536, 54536, 54536, 54536, 50440, 50440, 50440, 50440, 50440, 50440, 50440, 50440, 50440, 50440, 50440, 50440, 50440, 50440, 50440, 50440, 50440, 50440, 50440, 50440, 49156, 49156, 49156, 49156, 49156, 49156, 54792, 54792, 54792, 54792, 54792, 54792, 50696, 50696, 50696, 50696, 50696, 50696, 50696, 50696, 50696, 50696, 50696, 50696, 50696, 50696, 50696, 50696, 50696, 50696, 50696, 50696, 49156, 49156, 49156, 49156, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
  var i16size = 2;
  var arr = _malloc(values.length * i16size);
  for (var i = 0; i < values.length; i++) {
   HEAP16[arr + i * i16size >> 1] = values[i];
  }
  me.ret = allocate([ arr + 128 * i16size ], "i16*", ALLOC_NORMAL);
 }
 return me.ret;
}
function _free() {}
Module["_free"] = _free;
function _freelocale(locale) {
 _free(locale);
}
function _recv(fd, buf, len, flags) {
 var sock = SOCKFS.getSocket(fd);
 if (!sock) {
  ___setErrNo(ERRNO_CODES.EBADF);
  return -1;
 }
 return _read(fd, buf, len);
}
function _pread(fildes, buf, nbyte, offset) {
 var stream = FS.getStream(fildes);
 if (!stream) {
  ___setErrNo(ERRNO_CODES.EBADF);
  return -1;
 }
 try {
  var slab = HEAP8;
  return FS.read(stream, slab, buf, nbyte, offset);
 } catch (e) {
  FS.handleFSError(e);
  return -1;
 }
}
function _read(fildes, buf, nbyte) {
 var stream = FS.getStream(fildes);
 if (!stream) {
  ___setErrNo(ERRNO_CODES.EBADF);
  return -1;
 }
 try {
  var slab = HEAP8;
  return FS.read(stream, slab, buf, nbyte);
 } catch (e) {
  FS.handleFSError(e);
  return -1;
 }
}
function _fread(ptr, size, nitems, stream) {
 var bytesToRead = nitems * size;
 if (bytesToRead == 0) {
  return 0;
 }
 var bytesRead = 0;
 var streamObj = FS.getStreamFromPtr(stream);
 if (!streamObj) {
  ___setErrNo(ERRNO_CODES.EBADF);
  return 0;
 }
 while (streamObj.ungotten.length && bytesToRead > 0) {
  HEAP8[ptr++ >> 0] = streamObj.ungotten.pop();
  bytesToRead--;
  bytesRead++;
 }
 var err = _read(streamObj.fd, ptr, bytesToRead);
 if (err == -1) {
  if (streamObj) streamObj.error = true;
  return 0;
 }
 bytesRead += err;
 if (bytesRead < bytesToRead) streamObj.eof = true;
 return bytesRead / size | 0;
}
function _fgetc(stream) {
 var streamObj = FS.getStreamFromPtr(stream);
 if (!streamObj) return -1;
 if (streamObj.eof || streamObj.error) return -1;
 var ret = _fread(_fgetc.ret, 1, 1, stream);
 if (ret == 0) {
  return -1;
 } else if (ret == -1) {
  streamObj.error = true;
  return -1;
 } else {
  return HEAPU8[_fgetc.ret >> 0];
 }
}
function _getchar() {
 return _fgetc(HEAP32[_stdin >> 2]);
}
function _emscripten_glRenderbufferStorage(x0, x1, x2, x3) {
 GLctx.renderbufferStorage(x0, x1, x2, x3);
}
function _catgets(catd, set_id, msg_id, s) {
 return s;
}
function _emscripten_glCopyTexSubImage2D(x0, x1, x2, x3, x4, x5, x6, x7) {
 GLctx.copyTexSubImage2D(x0, x1, x2, x3, x4, x5, x6, x7);
}
function _emscripten_glDepthRange(x0, x1) {
 GLctx.depthRange(x0, x1);
}
function _ferror(stream) {
 stream = FS.getStreamFromPtr(stream);
 return Number(stream && stream.error);
}
function _emscripten_glTexParameteriv(target, pname, params) {
 var param = HEAP32[params >> 2];
 GLctx.texParameteri(target, pname, param);
}
function _emscripten_glDeleteShader(id) {
 if (!id) return;
 var shader = GL.shaders[id];
 if (!shader) {
  GL.recordError(1281);
  return;
 }
 GLctx.deleteShader(shader);
 GL.shaders[id] = null;
}
function ___cxa_guard_acquire(variable) {
 if (!HEAP8[variable >> 0]) {
  HEAP8[variable >> 0] = 1;
  return 1;
 }
 return 0;
}
function _emscripten_glDrawArraysInstanced(mode, first, count, primcount) {
 GL.currentContext.instancedArraysExt.drawArraysInstancedANGLE(mode, first, count, primcount);
}
function _emscripten_glDeleteBuffers(n, buffers) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[buffers + i * 4 >> 2];
  var buffer = GL.buffers[id];
  if (!buffer) continue;
  GLctx.deleteBuffer(buffer);
  buffer.name = 0;
  GL.buffers[id] = null;
  if (id == GL.currArrayBuffer) GL.currArrayBuffer = 0;
  if (id == GL.currElementArrayBuffer) GL.currElementArrayBuffer = 0;
 }
}
function _emscripten_glIsProgram(program) {
 var program = GL.programs[program];
 if (!program) return 0;
 return GLctx.isProgram(program);
}
function _emscripten_glClear(x0) {
 GLctx.clear(x0);
}
function _emscripten_glUniformMatrix2fv(location, count, transpose, value) {
 location = GL.uniforms[location];
 var view;
 if (count === 1) {
  view = GL.miniTempBufferViews[3];
  for (var i = 0; i < 4; i++) {
   view[i] = HEAPF32[value + i * 4 >> 2];
  }
 } else {
  view = HEAPF32.subarray(value >> 2, value + count * 16 >> 2);
 }
 GLctx.uniformMatrix2fv(location, transpose, view);
}
function _emscripten_glBlendColor(x0, x1, x2, x3) {
 GLctx.blendColor(x0, x1, x2, x3);
}
function _emscripten_glGetShaderiv(shader, pname, p) {
 if (pname == 35716) {
  var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
  if (log === null) log = "(unknown error)";
  HEAP32[p >> 2] = log.length + 1;
 } else {
  HEAP32[p >> 2] = GLctx.getShaderParameter(GL.shaders[shader], pname);
 }
}
function _emscripten_glUniformMatrix3fv(location, count, transpose, value) {
 location = GL.uniforms[location];
 var view;
 if (count === 1) {
  view = GL.miniTempBufferViews[8];
  for (var i = 0; i < 9; i++) {
   view[i] = HEAPF32[value + i * 4 >> 2];
  }
 } else {
  view = HEAPF32.subarray(value >> 2, value + count * 36 >> 2);
 }
 GLctx.uniformMatrix3fv(location, transpose, view);
}
function _emscripten_glVertexAttrib2f(x0, x1, x2) {
 GLctx.vertexAttrib2f(x0, x1, x2);
}
function _lseek(fildes, offset, whence) {
 var stream = FS.getStream(fildes);
 if (!stream) {
  ___setErrNo(ERRNO_CODES.EBADF);
  return -1;
 }
 try {
  return FS.llseek(stream, offset, whence);
 } catch (e) {
  FS.handleFSError(e);
  return -1;
 }
}
function _fseek(stream, offset, whence) {
 var fd = _fileno(stream);
 var ret = _lseek(fd, offset, whence);
 if (ret == -1) {
  return -1;
 }
 stream = FS.getStreamFromPtr(stream);
 stream.eof = false;
 return 0;
}
function _fseeko() {
 return _fseek.apply(null, arguments);
}
function _emscripten_glCullFace(x0) {
 GLctx.cullFace(x0);
}
function _emscripten_glGetVertexAttribiv(index, pname, params) {
 var data = GLctx.getVertexAttrib(index, pname);
 if (typeof data == "number" || typeof data == "boolean") {
  HEAP32[params >> 2] = data;
 } else {
  for (var i = 0; i < data.length; i++) {
   HEAP32[params + i >> 2] = data[i];
  }
 }
}
function _emscripten_glUniformMatrix4fv(location, count, transpose, value) {
 location = GL.uniforms[location];
 var view;
 if (count === 1) {
  view = GL.miniTempBufferViews[15];
  for (var i = 0; i < 16; i++) {
   view[i] = HEAPF32[value + i * 4 >> 2];
  }
 } else {
  view = HEAPF32.subarray(value >> 2, value + count * 64 >> 2);
 }
 GLctx.uniformMatrix4fv(location, transpose, view);
}
function _emscripten_glGenFramebuffers(n, ids) {
 for (var i = 0; i < n; ++i) {
  var framebuffer = GLctx.createFramebuffer();
  if (!framebuffer) {
   GL.recordError(1282);
   while (i < n) HEAP32[ids + i++ * 4 >> 2] = 0;
   return;
  }
  var id = GL.getNewId(GL.framebuffers);
  framebuffer.name = id;
  GL.framebuffers[id] = framebuffer;
  HEAP32[ids + i * 4 >> 2] = id;
 }
}
Module["_strcpy"] = _strcpy;
function _emscripten_glEnableClientState() {
 Module["printErr"]("missing function: emscripten_glEnableClientState");
 abort(-1);
}
function _emscripten_glShaderSource(shader, count, string, length) {
 var source = GL.getSource(shader, count, string, length);
 GLctx.shaderSource(GL.shaders[shader], source);
}
function _emscripten_glBlendEquationSeparate(x0, x1) {
 GLctx.blendEquationSeparate(x0, x1);
}
function _emscripten_glIsShader(shader) {
 var s = GL.shaders[shader];
 if (!s) return 0;
 return GLctx.isShader(s);
}
function _emscripten_glBindTexture(target, texture) {
 GLctx.bindTexture(target, texture ? GL.textures[texture] : null);
}
function _emscripten_glShaderBinary() {
 GL.recordError(1280);
}
function _emscripten_glStencilMask(x0) {
 GLctx.stencilMask(x0);
}
function _emscripten_glStencilFuncSeparate(x0, x1, x2, x3) {
 GLctx.stencilFuncSeparate(x0, x1, x2, x3);
}
function _emscripten_glGenTextures(n, textures) {
 for (var i = 0; i < n; i++) {
  var texture = GLctx.createTexture();
  if (!texture) {
   GL.recordError(1282);
   while (i < n) HEAP32[textures + i++ * 4 >> 2] = 0;
   return;
  }
  var id = GL.getNewId(GL.textures);
  texture.name = id;
  GL.textures[id] = texture;
  HEAP32[textures + i * 4 >> 2] = id;
 }
}
function _emscripten_glVertexAttrib2fv(index, v) {
 v = HEAPF32.subarray(v >> 2, v + 8 >> 2);
 GLctx.vertexAttrib2fv(index, v);
}
Module["_i64Add"] = _i64Add;
function _emscripten_glGetActiveUniform(program, index, bufSize, length, size, type, name) {
 program = GL.programs[program];
 var info = GLctx.getActiveUniform(program, index);
 if (!info) return;
 var infoname = info.name.slice(0, Math.max(0, bufSize - 1));
 if (bufSize > 0 && name) {
  writeStringToMemory(infoname, name);
  if (length) HEAP32[length >> 2] = infoname.length;
 } else {
  if (length) HEAP32[length >> 2] = 0;
 }
 if (size) HEAP32[size >> 2] = info.size;
 if (type) HEAP32[type >> 2] = info.type;
}
function _emscripten_glDeleteObjectARB() {
 Module["printErr"]("missing function: emscripten_glDeleteObjectARB");
 abort(-1);
}
function __ZSt18uncaught_exceptionv() {
 return !!__ZSt18uncaught_exceptionv.uncaught_exception;
}
var EXCEPTIONS = {
 last: 0,
 caught: [],
 infos: {},
 deAdjust: (function(adjusted) {
  if (!adjusted || EXCEPTIONS.infos[adjusted]) return adjusted;
  for (var ptr in EXCEPTIONS.infos) {
   var info = EXCEPTIONS.infos[ptr];
   if (info.adjusted === adjusted) {
    return ptr;
   }
  }
  return adjusted;
 }),
 addRef: (function(ptr) {
  if (!ptr) return;
  var info = EXCEPTIONS.infos[ptr];
  info.refcount++;
 }),
 decRef: (function(ptr) {
  if (!ptr) return;
  var info = EXCEPTIONS.infos[ptr];
  assert(info.refcount > 0);
  info.refcount--;
  if (info.refcount === 0) {
   if (info.destructor) {
    Runtime.dynCall("vi", info.destructor, [ ptr ]);
   }
   delete EXCEPTIONS.infos[ptr];
   ___cxa_free_exception(ptr);
  }
 }),
 clearRef: (function(ptr) {
  if (!ptr) return;
  var info = EXCEPTIONS.infos[ptr];
  info.refcount = 0;
 })
};
function ___resumeException(ptr) {
 if (!EXCEPTIONS.last) {
  EXCEPTIONS.last = ptr;
 }
 EXCEPTIONS.clearRef(EXCEPTIONS.deAdjust(ptr));
 throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";
}
function ___cxa_find_matching_catch() {
 var thrown = EXCEPTIONS.last;
 if (!thrown) {
  return (asm["setTempRet0"](0), 0) | 0;
 }
 var info = EXCEPTIONS.infos[thrown];
 var throwntype = info.type;
 if (!throwntype) {
  return (asm["setTempRet0"](0), thrown) | 0;
 }
 var typeArray = Array.prototype.slice.call(arguments);
 var pointer = Module["___cxa_is_pointer_type"](throwntype);
 if (!___cxa_find_matching_catch.buffer) ___cxa_find_matching_catch.buffer = _malloc(4);
 HEAP32[___cxa_find_matching_catch.buffer >> 2] = thrown;
 thrown = ___cxa_find_matching_catch.buffer;
 for (var i = 0; i < typeArray.length; i++) {
  if (typeArray[i] && Module["___cxa_can_catch"](typeArray[i], throwntype, thrown)) {
   thrown = HEAP32[thrown >> 2];
   info.adjusted = thrown;
   return (asm["setTempRet0"](typeArray[i]), thrown) | 0;
  }
 }
 thrown = HEAP32[thrown >> 2];
 return (asm["setTempRet0"](throwntype), thrown) | 0;
}
function ___cxa_throw(ptr, type, destructor) {
 EXCEPTIONS.infos[ptr] = {
  ptr: ptr,
  adjusted: ptr,
  type: type,
  destructor: destructor,
  refcount: 0
 };
 EXCEPTIONS.last = ptr;
 if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
  __ZSt18uncaught_exceptionv.uncaught_exception = 1;
 } else {
  __ZSt18uncaught_exceptionv.uncaught_exception++;
 }
 throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";
}
function ___cxa_begin_catch(ptr) {
 __ZSt18uncaught_exceptionv.uncaught_exception--;
 EXCEPTIONS.caught.push(ptr);
 EXCEPTIONS.addRef(EXCEPTIONS.deAdjust(ptr));
 return ptr;
}
function _emscripten_glUniform1f(location, v0) {
 location = GL.uniforms[location];
 GLctx.uniform1f(location, v0);
}
function _emscripten_glDisableVertexAttribArray(index) {
 GLctx.disableVertexAttribArray(index);
}
function _emscripten_glVertexAttribPointer(index, size, type, normalized, stride, ptr) {
 GLctx.vertexAttribPointer(index, size, type, normalized, stride, ptr);
}
function _emscripten_glVertexAttrib1f(x0, x1) {
 GLctx.vertexAttrib1f(x0, x1);
}
function _emscripten_glFinish() {
 GLctx.finish();
}
function _open(path, oflag, varargs) {
 var mode = HEAP32[varargs >> 2];
 path = Pointer_stringify(path);
 try {
  var stream = FS.open(path, oflag, mode);
  return stream.fd;
 } catch (e) {
  FS.handleFSError(e);
  return -1;
 }
}
function _fopen(filename, mode) {
 var flags;
 mode = Pointer_stringify(mode);
 if (mode[0] == "r") {
  if (mode.indexOf("+") != -1) {
   flags = 2;
  } else {
   flags = 0;
  }
 } else if (mode[0] == "w") {
  if (mode.indexOf("+") != -1) {
   flags = 2;
  } else {
   flags = 1;
  }
  flags |= 64;
  flags |= 512;
 } else if (mode[0] == "a") {
  if (mode.indexOf("+") != -1) {
   flags = 2;
  } else {
   flags = 1;
  }
  flags |= 64;
  flags |= 1024;
 } else {
  ___setErrNo(ERRNO_CODES.EINVAL);
  return 0;
 }
 var fd = _open(filename, flags, allocate([ 511, 0, 0, 0 ], "i32", ALLOC_STACK));
 return fd === -1 ? 0 : FS.getPtrForStream(FS.getStream(fd));
}
function _emscripten_glDepthFunc(x0) {
 GLctx.depthFunc(x0);
}
function _emscripten_glDrawArrays(mode, first, count) {
 GLctx.drawArrays(mode, first, count);
}
function _emscripten_glGenBuffers(n, buffers) {
 for (var i = 0; i < n; i++) {
  var buffer = GLctx.createBuffer();
  if (!buffer) {
   GL.recordError(1282);
   while (i < n) HEAP32[buffers + i++ * 4 >> 2] = 0;
   return;
  }
  var id = GL.getNewId(GL.buffers);
  buffer.name = id;
  GL.buffers[id] = buffer;
  HEAP32[buffers + i * 4 >> 2] = id;
 }
}
function _emscripten_glClearDepth(x0) {
 GLctx.clearDepth(x0);
}
Module["_i64Subtract"] = _i64Subtract;
var PTHREAD_SPECIFIC_NEXT_KEY = 1;
function _pthread_key_create(key, destructor) {
 if (key == 0) {
  return ERRNO_CODES.EINVAL;
 }
 HEAP32[key >> 2] = PTHREAD_SPECIFIC_NEXT_KEY;
 PTHREAD_SPECIFIC[PTHREAD_SPECIFIC_NEXT_KEY] = 0;
 PTHREAD_SPECIFIC_NEXT_KEY++;
 return 0;
}
function _emscripten_glUniform4iv(location, count, value) {
 location = GL.uniforms[location];
 count *= 4;
 value = HEAP32.subarray(value >> 2, value + count * 4 >> 2);
 GLctx.uniform4iv(location, value);
}
function _emscripten_glLoadIdentity() {
 throw "Legacy GL function (glLoadIdentity) called. If you want legacy GL emulation, you need to compile with -s LEGACY_GL_EMULATION=1 to enable legacy GL emulation.";
}
function _emscripten_glUniform3fv(location, count, value) {
 location = GL.uniforms[location];
 var view;
 if (count === 1) {
  view = GL.miniTempBufferViews[2];
  view[0] = HEAPF32[value >> 2];
  view[1] = HEAPF32[value + 4 >> 2];
  view[2] = HEAPF32[value + 8 >> 2];
 } else {
  view = HEAPF32.subarray(value >> 2, value + count * 12 >> 2);
 }
 GLctx.uniform3fv(location, view);
}
function _emscripten_glGetUniformLocation(program, name) {
 name = Pointer_stringify(name);
 var arrayOffset = 0;
 if (name.indexOf("]", name.length - 1) !== -1) {
  var ls = name.lastIndexOf("[");
  var arrayIndex = name.slice(ls + 1, -1);
  if (arrayIndex.length > 0) {
   arrayOffset = parseInt(arrayIndex);
   if (arrayOffset < 0) {
    return -1;
   }
  }
  name = name.slice(0, ls);
 }
 var ptable = GL.programInfos[program];
 if (!ptable) {
  return -1;
 }
 var utable = ptable.uniforms;
 var uniformInfo = utable[name];
 if (uniformInfo && arrayOffset < uniformInfo[0]) {
  return uniformInfo[1] + arrayOffset;
 } else {
  return -1;
 }
}
function _emscripten_glColorPointer() {
 Module["printErr"]("missing function: emscripten_glColorPointer");
 abort(-1);
}
function _emscripten_glAttachShader(program, shader) {
 GLctx.attachShader(GL.programs[program], GL.shaders[shader]);
}
function _emscripten_glVertexAttrib4fv(index, v) {
 v = HEAPF32.subarray(v >> 2, v + 16 >> 2);
 GLctx.vertexAttrib4fv(index, v);
}
function _emscripten_glScissor(x0, x1, x2, x3) {
 GLctx.scissor(x0, x1, x2, x3);
}
Module["_bitshift64Lshr"] = _bitshift64Lshr;
function _ftell(stream) {
 stream = FS.getStreamFromPtr(stream);
 if (!stream) {
  ___setErrNo(ERRNO_CODES.EBADF);
  return -1;
 }
 if (FS.isChrdev(stream.node.mode)) {
  ___setErrNo(ERRNO_CODES.ESPIPE);
  return -1;
 } else {
  return stream.position;
 }
}
function _ftello() {
 return _ftell.apply(null, arguments);
}
var _BDtoIHigh = true;
function _pthread_cond_broadcast() {
 return 0;
}
var _environ = allocate(1, "i32*", ALLOC_STATIC);
var ___environ = _environ;
function ___buildEnvironment(env) {
 var MAX_ENV_VALUES = 64;
 var TOTAL_ENV_SIZE = 1024;
 var poolPtr;
 var envPtr;
 if (!___buildEnvironment.called) {
  ___buildEnvironment.called = true;
  ENV["USER"] = "web_user";
  ENV["PATH"] = "/";
  ENV["PWD"] = "/";
  ENV["HOME"] = "/home/web_user";
  ENV["LANG"] = "C";
  ENV["_"] = Module["thisProgram"];
  poolPtr = allocate(TOTAL_ENV_SIZE, "i8", ALLOC_STATIC);
  envPtr = allocate(MAX_ENV_VALUES * 4, "i8*", ALLOC_STATIC);
  HEAP32[envPtr >> 2] = poolPtr;
  HEAP32[_environ >> 2] = envPtr;
 } else {
  envPtr = HEAP32[_environ >> 2];
  poolPtr = HEAP32[envPtr >> 2];
 }
 var strings = [];
 var totalSize = 0;
 for (var key in env) {
  if (typeof env[key] === "string") {
   var line = key + "=" + env[key];
   strings.push(line);
   totalSize += line.length;
  }
 }
 if (totalSize > TOTAL_ENV_SIZE) {
  throw new Error("Environment size exceeded TOTAL_ENV_SIZE!");
 }
 var ptrSize = 4;
 for (var i = 0; i < strings.length; i++) {
  var line = strings[i];
  writeAsciiToMemory(line, poolPtr);
  HEAP32[envPtr + i * ptrSize >> 2] = poolPtr;
  poolPtr += line.length + 1;
 }
 HEAP32[envPtr + strings.length * ptrSize >> 2] = 0;
}
var ENV = {};
function _getenv(name) {
 if (name === 0) return 0;
 name = Pointer_stringify(name);
 if (!ENV.hasOwnProperty(name)) return 0;
 if (_getenv.ret) _free(_getenv.ret);
 _getenv.ret = allocate(intArrayFromString(ENV[name]), "i8", ALLOC_NORMAL);
 return _getenv.ret;
}
function _emscripten_glDrawBuffers(n, bufs) {
 var bufArray = [];
 for (var i = 0; i < n; i++) bufArray.push(HEAP32[bufs + i * 4 >> 2]);
 GL.currentContext.drawBuffersExt(bufArray);
}
function _emscripten_glClearStencil(x0) {
 GLctx.clearStencil(x0);
}
Module["_strlen"] = _strlen;
function __reallyNegative(x) {
 return x < 0 || x === 0 && 1 / x === -Infinity;
}
function __formatString(format, varargs) {
 assert((varargs & 3) === 0);
 var textIndex = format;
 var argIndex = 0;
 function getNextArg(type) {
  var ret;
  argIndex = Runtime.prepVararg(argIndex, type);
  if (type === "double") {
   ret = (HEAP32[tempDoublePtr >> 2] = HEAP32[varargs + argIndex >> 2], HEAP32[tempDoublePtr + 4 >> 2] = HEAP32[varargs + (argIndex + 4) >> 2], +HEAPF64[tempDoublePtr >> 3]);
   argIndex += 8;
  } else if (type == "i64") {
   ret = [ HEAP32[varargs + argIndex >> 2], HEAP32[varargs + (argIndex + 4) >> 2] ];
   argIndex += 8;
  } else {
   assert((argIndex & 3) === 0);
   type = "i32";
   ret = HEAP32[varargs + argIndex >> 2];
   argIndex += 4;
  }
  return ret;
 }
 var ret = [];
 var curr, next, currArg;
 while (1) {
  var startTextIndex = textIndex;
  curr = HEAP8[textIndex >> 0];
  if (curr === 0) break;
  next = HEAP8[textIndex + 1 >> 0];
  if (curr == 37) {
   var flagAlwaysSigned = false;
   var flagLeftAlign = false;
   var flagAlternative = false;
   var flagZeroPad = false;
   var flagPadSign = false;
   flagsLoop : while (1) {
    switch (next) {
    case 43:
     flagAlwaysSigned = true;
     break;
    case 45:
     flagLeftAlign = true;
     break;
    case 35:
     flagAlternative = true;
     break;
    case 48:
     if (flagZeroPad) {
      break flagsLoop;
     } else {
      flagZeroPad = true;
      break;
     }
    case 32:
     flagPadSign = true;
     break;
    default:
     break flagsLoop;
    }
    textIndex++;
    next = HEAP8[textIndex + 1 >> 0];
   }
   var width = 0;
   if (next == 42) {
    width = getNextArg("i32");
    textIndex++;
    next = HEAP8[textIndex + 1 >> 0];
   } else {
    while (next >= 48 && next <= 57) {
     width = width * 10 + (next - 48);
     textIndex++;
     next = HEAP8[textIndex + 1 >> 0];
    }
   }
   var precisionSet = false, precision = -1;
   if (next == 46) {
    precision = 0;
    precisionSet = true;
    textIndex++;
    next = HEAP8[textIndex + 1 >> 0];
    if (next == 42) {
     precision = getNextArg("i32");
     textIndex++;
    } else {
     while (1) {
      var precisionChr = HEAP8[textIndex + 1 >> 0];
      if (precisionChr < 48 || precisionChr > 57) break;
      precision = precision * 10 + (precisionChr - 48);
      textIndex++;
     }
    }
    next = HEAP8[textIndex + 1 >> 0];
   }
   if (precision < 0) {
    precision = 6;
    precisionSet = false;
   }
   var argSize;
   switch (String.fromCharCode(next)) {
   case "h":
    var nextNext = HEAP8[textIndex + 2 >> 0];
    if (nextNext == 104) {
     textIndex++;
     argSize = 1;
    } else {
     argSize = 2;
    }
    break;
   case "l":
    var nextNext = HEAP8[textIndex + 2 >> 0];
    if (nextNext == 108) {
     textIndex++;
     argSize = 8;
    } else {
     argSize = 4;
    }
    break;
   case "L":
   case "q":
   case "j":
    argSize = 8;
    break;
   case "z":
   case "t":
   case "I":
    argSize = 4;
    break;
   default:
    argSize = null;
   }
   if (argSize) textIndex++;
   next = HEAP8[textIndex + 1 >> 0];
   switch (String.fromCharCode(next)) {
   case "d":
   case "i":
   case "u":
   case "o":
   case "x":
   case "X":
   case "p":
    {
     var signed = next == 100 || next == 105;
     argSize = argSize || 4;
     var currArg = getNextArg("i" + argSize * 8);
     var origArg = currArg;
     var argText;
     if (argSize == 8) {
      currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
     }
     if (argSize <= 4) {
      var limit = Math.pow(256, argSize) - 1;
      currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
     }
     var currAbsArg = Math.abs(currArg);
     var prefix = "";
     if (next == 100 || next == 105) {
      if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else argText = reSign(currArg, 8 * argSize, 1).toString(10);
     } else if (next == 117) {
      if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else argText = unSign(currArg, 8 * argSize, 1).toString(10);
      currArg = Math.abs(currArg);
     } else if (next == 111) {
      argText = (flagAlternative ? "0" : "") + currAbsArg.toString(8);
     } else if (next == 120 || next == 88) {
      prefix = flagAlternative && currArg != 0 ? "0x" : "";
      if (argSize == 8 && i64Math) {
       if (origArg[1]) {
        argText = (origArg[1] >>> 0).toString(16);
        var lower = (origArg[0] >>> 0).toString(16);
        while (lower.length < 8) lower = "0" + lower;
        argText += lower;
       } else {
        argText = (origArg[0] >>> 0).toString(16);
       }
      } else if (currArg < 0) {
       currArg = -currArg;
       argText = (currAbsArg - 1).toString(16);
       var buffer = [];
       for (var i = 0; i < argText.length; i++) {
        buffer.push((15 - parseInt(argText[i], 16)).toString(16));
       }
       argText = buffer.join("");
       while (argText.length < argSize * 2) argText = "f" + argText;
      } else {
       argText = currAbsArg.toString(16);
      }
      if (next == 88) {
       prefix = prefix.toUpperCase();
       argText = argText.toUpperCase();
      }
     } else if (next == 112) {
      if (currAbsArg === 0) {
       argText = "(nil)";
      } else {
       prefix = "0x";
       argText = currAbsArg.toString(16);
      }
     }
     if (precisionSet) {
      while (argText.length < precision) {
       argText = "0" + argText;
      }
     }
     if (currArg >= 0) {
      if (flagAlwaysSigned) {
       prefix = "+" + prefix;
      } else if (flagPadSign) {
       prefix = " " + prefix;
      }
     }
     if (argText.charAt(0) == "-") {
      prefix = "-" + prefix;
      argText = argText.substr(1);
     }
     while (prefix.length + argText.length < width) {
      if (flagLeftAlign) {
       argText += " ";
      } else {
       if (flagZeroPad) {
        argText = "0" + argText;
       } else {
        prefix = " " + prefix;
       }
      }
     }
     argText = prefix + argText;
     argText.split("").forEach((function(chr) {
      ret.push(chr.charCodeAt(0));
     }));
     break;
    }
   case "f":
   case "F":
   case "e":
   case "E":
   case "g":
   case "G":
    {
     var currArg = getNextArg("double");
     var argText;
     if (isNaN(currArg)) {
      argText = "nan";
      flagZeroPad = false;
     } else if (!isFinite(currArg)) {
      argText = (currArg < 0 ? "-" : "") + "inf";
      flagZeroPad = false;
     } else {
      var isGeneral = false;
      var effectivePrecision = Math.min(precision, 20);
      if (next == 103 || next == 71) {
       isGeneral = true;
       precision = precision || 1;
       var exponent = parseInt(currArg.toExponential(effectivePrecision).split("e")[1], 10);
       if (precision > exponent && exponent >= -4) {
        next = (next == 103 ? "f" : "F").charCodeAt(0);
        precision -= exponent + 1;
       } else {
        next = (next == 103 ? "e" : "E").charCodeAt(0);
        precision--;
       }
       effectivePrecision = Math.min(precision, 20);
      }
      if (next == 101 || next == 69) {
       argText = currArg.toExponential(effectivePrecision);
       if (/[eE][-+]\d$/.test(argText)) {
        argText = argText.slice(0, -1) + "0" + argText.slice(-1);
       }
      } else if (next == 102 || next == 70) {
       argText = currArg.toFixed(effectivePrecision);
       if (currArg === 0 && __reallyNegative(currArg)) {
        argText = "-" + argText;
       }
      }
      var parts = argText.split("e");
      if (isGeneral && !flagAlternative) {
       while (parts[0].length > 1 && parts[0].indexOf(".") != -1 && (parts[0].slice(-1) == "0" || parts[0].slice(-1) == ".")) {
        parts[0] = parts[0].slice(0, -1);
       }
      } else {
       if (flagAlternative && argText.indexOf(".") == -1) parts[0] += ".";
       while (precision > effectivePrecision++) parts[0] += "0";
      }
      argText = parts[0] + (parts.length > 1 ? "e" + parts[1] : "");
      if (next == 69) argText = argText.toUpperCase();
      if (currArg >= 0) {
       if (flagAlwaysSigned) {
        argText = "+" + argText;
       } else if (flagPadSign) {
        argText = " " + argText;
       }
      }
     }
     while (argText.length < width) {
      if (flagLeftAlign) {
       argText += " ";
      } else {
       if (flagZeroPad && (argText[0] == "-" || argText[0] == "+")) {
        argText = argText[0] + "0" + argText.slice(1);
       } else {
        argText = (flagZeroPad ? "0" : " ") + argText;
       }
      }
     }
     if (next < 97) argText = argText.toUpperCase();
     argText.split("").forEach((function(chr) {
      ret.push(chr.charCodeAt(0));
     }));
     break;
    }
   case "s":
    {
     var arg = getNextArg("i8*");
     var argLength = arg ? _strlen(arg) : "(null)".length;
     if (precisionSet) argLength = Math.min(argLength, precision);
     if (!flagLeftAlign) {
      while (argLength < width--) {
       ret.push(32);
      }
     }
     if (arg) {
      for (var i = 0; i < argLength; i++) {
       ret.push(HEAPU8[arg++ >> 0]);
      }
     } else {
      ret = ret.concat(intArrayFromString("(null)".substr(0, argLength), true));
     }
     if (flagLeftAlign) {
      while (argLength < width--) {
       ret.push(32);
      }
     }
     break;
    }
   case "c":
    {
     if (flagLeftAlign) ret.push(getNextArg("i8"));
     while (--width > 0) {
      ret.push(32);
     }
     if (!flagLeftAlign) ret.push(getNextArg("i8"));
     break;
    }
   case "n":
    {
     var ptr = getNextArg("i32*");
     HEAP32[ptr >> 2] = ret.length;
     break;
    }
   case "%":
    {
     ret.push(curr);
     break;
    }
   default:
    {
     for (var i = startTextIndex; i < textIndex + 2; i++) {
      ret.push(HEAP8[i >> 0]);
     }
    }
   }
   textIndex += 2;
  } else {
   ret.push(curr);
   textIndex += 1;
  }
 }
 return ret;
}
function _fprintf(stream, format, varargs) {
 var result = __formatString(format, varargs);
 var stack = Runtime.stackSave();
 var ret = _fwrite(allocate(result, "i8", ALLOC_STACK), 1, result.length, stream);
 Runtime.stackRestore(stack);
 return ret;
}
function _vfprintf(s, f, va_arg) {
 return _fprintf(s, f, HEAP32[va_arg >> 2]);
}
function _pthread_mutex_unlock() {}
function _emscripten_glBindFramebuffer(target, framebuffer) {
 GLctx.bindFramebuffer(target, framebuffer ? GL.framebuffers[framebuffer] : null);
}
function _emscripten_glDetachShader(program, shader) {
 GLctx.detachShader(GL.programs[program], GL.shaders[shader]);
}
function _emscripten_glBlendEquation(x0) {
 GLctx.blendEquation(x0);
}
function _emscripten_glBufferSubData(target, offset, size, data) {
 GLctx.bufferSubData(target, offset, HEAPU8.subarray(data, data + size));
}
function _sysconf(name) {
 switch (name) {
 case 30:
  return PAGE_SIZE;
 case 85:
  return totalMemory / PAGE_SIZE;
 case 132:
 case 133:
 case 12:
 case 137:
 case 138:
 case 15:
 case 235:
 case 16:
 case 17:
 case 18:
 case 19:
 case 20:
 case 149:
 case 13:
 case 10:
 case 236:
 case 153:
 case 9:
 case 21:
 case 22:
 case 159:
 case 154:
 case 14:
 case 77:
 case 78:
 case 139:
 case 80:
 case 81:
 case 82:
 case 68:
 case 67:
 case 164:
 case 11:
 case 29:
 case 47:
 case 48:
 case 95:
 case 52:
 case 51:
 case 46:
  return 200809;
 case 79:
  return 0;
 case 27:
 case 246:
 case 127:
 case 128:
 case 23:
 case 24:
 case 160:
 case 161:
 case 181:
 case 182:
 case 242:
 case 183:
 case 184:
 case 243:
 case 244:
 case 245:
 case 165:
 case 178:
 case 179:
 case 49:
 case 50:
 case 168:
 case 169:
 case 175:
 case 170:
 case 171:
 case 172:
 case 97:
 case 76:
 case 32:
 case 173:
 case 35:
  return -1;
 case 176:
 case 177:
 case 7:
 case 155:
 case 8:
 case 157:
 case 125:
 case 126:
 case 92:
 case 93:
 case 129:
 case 130:
 case 131:
 case 94:
 case 91:
  return 1;
 case 74:
 case 60:
 case 69:
 case 70:
 case 4:
  return 1024;
 case 31:
 case 42:
 case 72:
  return 32;
 case 87:
 case 26:
 case 33:
  return 2147483647;
 case 34:
 case 1:
  return 47839;
 case 38:
 case 36:
  return 99;
 case 43:
 case 37:
  return 2048;
 case 0:
  return 2097152;
 case 3:
  return 65536;
 case 28:
  return 32768;
 case 44:
  return 32767;
 case 75:
  return 16384;
 case 39:
  return 1e3;
 case 89:
  return 700;
 case 71:
  return 256;
 case 40:
  return 255;
 case 2:
  return 100;
 case 180:
  return 64;
 case 25:
  return 20;
 case 5:
  return 16;
 case 6:
  return 6;
 case 73:
  return 4;
 case 84:
  {
   if (typeof navigator === "object") return navigator["hardwareConcurrency"] || 1;
   return 1;
  }
 }
 ___setErrNo(ERRNO_CODES.EINVAL);
 return -1;
}
function _emscripten_glGetVertexAttribfv(index, pname, params) {
 var data = GLctx.getVertexAttrib(index, pname);
 if (typeof data == "number") {
  HEAPF32[params >> 2] = data;
 } else {
  for (var i = 0; i < data.length; i++) {
   HEAPF32[params + i >> 2] = data[i];
  }
 }
}
function _emscripten_glBufferData(target, size, data, usage) {
 switch (usage) {
 case 35041:
 case 35042:
  usage = 35040;
  break;
 case 35045:
 case 35046:
  usage = 35044;
  break;
 case 35049:
 case 35050:
  usage = 35048;
  break;
 }
 if (!data) {
  GLctx.bufferData(target, size, usage);
 } else {
  GLctx.bufferData(target, HEAPU8.subarray(data, data + size), usage);
 }
}
function _sbrk(bytes) {
 var self = _sbrk;
 if (!self.called) {
  DYNAMICTOP = alignMemoryPage(DYNAMICTOP);
  self.called = true;
  assert(Runtime.dynamicAlloc);
  self.alloc = Runtime.dynamicAlloc;
  Runtime.dynamicAlloc = (function() {
   abort("cannot dynamically allocate, sbrk now has control");
  });
 }
 var ret = DYNAMICTOP;
 if (bytes != 0) {
  var success = self.alloc(bytes);
  if (!success) return -1 >>> 0;
 }
 return ret;
}
function _emscripten_glMatrixMode() {
 throw "Legacy GL function (glMatrixMode) called. If you want legacy GL emulation, you need to compile with -s LEGACY_GL_EMULATION=1 to enable legacy GL emulation.";
}
function ___errno_location() {
 return ___errno_state;
}
var _BItoD = true;
function _emscripten_glGetTexParameteriv(target, pname, params) {
 HEAP32[params >> 2] = GLctx.getTexParameter(target, pname);
}
function _catclose(catd) {
 return 0;
}
function _emscripten_get_preloaded_image_data(path, w, h) {
 if (typeof path === "number") {
  path = Pointer_stringify(path);
 }
 path = PATH.resolve(path);
 var canvas = Module["preloadedImages"][path];
 if (canvas) {
  var ctx = canvas.getContext("2d");
  var image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var buf = _malloc(canvas.width * canvas.height * 4);
  HEAPU8.set(image.data, buf);
  HEAP32[w >> 2] = canvas.width;
  HEAP32[h >> 2] = canvas.height;
  return buf;
 }
 return 0;
}
function _emscripten_get_preloaded_image_data_from_FILE(file, w, h) {
 var stream = FS.getStreamFromPtr(file);
 if (stream) {
  return _emscripten_get_preloaded_image_data(stream.path, w, h);
 }
 return 0;
}
Module["_llvm_bswap_i32"] = _llvm_bswap_i32;
function ___cxa_guard_release() {}
function _ungetc(c, stream) {
 stream = FS.getStreamFromPtr(stream);
 if (!stream) {
  return -1;
 }
 if (c === -1) {
  return c;
 }
 c = unSign(c & 255);
 stream.ungotten.push(c);
 stream.eof = false;
 return c;
}
function _emscripten_glActiveTexture(x0) {
 GLctx.activeTexture(x0);
}
function _emscripten_glGenerateMipmap(x0) {
 GLctx.generateMipmap(x0);
}
function _emscripten_glSampleCoverage(x0, x1) {
 GLctx.sampleCoverage(x0, x1);
}
function _uselocale(locale) {
 var old = LOCALE.curr;
 if (locale) LOCALE.curr = locale;
 return old;
}
function _emscripten_glGetFloatv(name_, p) {
 return GL.get(name_, p, "Float");
}
function _emscripten_glUseProgram(program) {
 GLctx.useProgram(program ? GL.programs[program] : null);
}
function _emscripten_glHint(x0, x1) {
 GLctx.hint(x0, x1);
}
function _emscripten_glVertexAttribDivisor(index, divisor) {
 GL.currentContext.instancedArraysExt.vertexAttribDivisorANGLE(index, divisor);
}
function _emscripten_glDrawElementsInstanced(mode, count, type, indices, primcount) {
 GL.currentContext.instancedArraysExt.drawElementsInstancedANGLE(mode, count, type, indices, primcount);
}
function _emscripten_glDrawElements(mode, count, type, indices) {
 GLctx.drawElements(mode, count, type, indices);
}
function _emscripten_glUniform2fv(location, count, value) {
 location = GL.uniforms[location];
 var view;
 if (count === 1) {
  view = GL.miniTempBufferViews[1];
  view[0] = HEAPF32[value >> 2];
  view[1] = HEAPF32[value + 4 >> 2];
 } else {
  view = HEAPF32.subarray(value >> 2, value + count * 8 >> 2);
 }
 GLctx.uniform2fv(location, view);
}
function _atexit(func, arg) {
 __ATEXIT__.unshift({
  func: func,
  arg: arg
 });
}
function ___cxa_atexit() {
 return _atexit.apply(null, arguments);
}
function __isLeapYear(year) {
 return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
function __arraySum(array, index) {
 var sum = 0;
 for (var i = 0; i <= index; sum += array[i++]) ;
 return sum;
}
var __MONTH_DAYS_LEAP = [ 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
var __MONTH_DAYS_REGULAR = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
function __addDays(date, days) {
 var newDate = new Date(date.getTime());
 while (days > 0) {
  var leap = __isLeapYear(newDate.getFullYear());
  var currentMonth = newDate.getMonth();
  var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
  if (days > daysInCurrentMonth - newDate.getDate()) {
   days -= daysInCurrentMonth - newDate.getDate() + 1;
   newDate.setDate(1);
   if (currentMonth < 11) {
    newDate.setMonth(currentMonth + 1);
   } else {
    newDate.setMonth(0);
    newDate.setFullYear(newDate.getFullYear() + 1);
   }
  } else {
   newDate.setDate(newDate.getDate() + days);
   return newDate;
  }
 }
 return newDate;
}
function _strftime(s, maxsize, format, tm) {
 var tm_zone = HEAP32[tm + 40 >> 2];
 var date = {
  tm_sec: HEAP32[tm >> 2],
  tm_min: HEAP32[tm + 4 >> 2],
  tm_hour: HEAP32[tm + 8 >> 2],
  tm_mday: HEAP32[tm + 12 >> 2],
  tm_mon: HEAP32[tm + 16 >> 2],
  tm_year: HEAP32[tm + 20 >> 2],
  tm_wday: HEAP32[tm + 24 >> 2],
  tm_yday: HEAP32[tm + 28 >> 2],
  tm_isdst: HEAP32[tm + 32 >> 2],
  tm_gmtoff: HEAP32[tm + 36 >> 2],
  tm_zone: tm_zone ? Pointer_stringify(tm_zone) : ""
 };
 var pattern = Pointer_stringify(format);
 var EXPANSION_RULES_1 = {
  "%c": "%a %b %d %H:%M:%S %Y",
  "%D": "%m/%d/%y",
  "%F": "%Y-%m-%d",
  "%h": "%b",
  "%r": "%I:%M:%S %p",
  "%R": "%H:%M",
  "%T": "%H:%M:%S",
  "%x": "%m/%d/%y",
  "%X": "%H:%M:%S"
 };
 for (var rule in EXPANSION_RULES_1) {
  pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_1[rule]);
 }
 var WEEKDAYS = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
 var MONTHS = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
 function leadingSomething(value, digits, character) {
  var str = typeof value === "number" ? value.toString() : value || "";
  while (str.length < digits) {
   str = character[0] + str;
  }
  return str;
 }
 function leadingNulls(value, digits) {
  return leadingSomething(value, digits, "0");
 }
 function compareByDay(date1, date2) {
  function sgn(value) {
   return value < 0 ? -1 : value > 0 ? 1 : 0;
  }
  var compare;
  if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
   if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
    compare = sgn(date1.getDate() - date2.getDate());
   }
  }
  return compare;
 }
 function getFirstWeekStartDate(janFourth) {
  switch (janFourth.getDay()) {
  case 0:
   return new Date(janFourth.getFullYear() - 1, 11, 29);
  case 1:
   return janFourth;
  case 2:
   return new Date(janFourth.getFullYear(), 0, 3);
  case 3:
   return new Date(janFourth.getFullYear(), 0, 2);
  case 4:
   return new Date(janFourth.getFullYear(), 0, 1);
  case 5:
   return new Date(janFourth.getFullYear() - 1, 11, 31);
  case 6:
   return new Date(janFourth.getFullYear() - 1, 11, 30);
  }
 }
 function getWeekBasedYear(date) {
  var thisDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
  var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
  var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
  var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
  var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
   if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
    return thisDate.getFullYear() + 1;
   } else {
    return thisDate.getFullYear();
   }
  } else {
   return thisDate.getFullYear() - 1;
  }
 }
 var EXPANSION_RULES_2 = {
  "%a": (function(date) {
   return WEEKDAYS[date.tm_wday].substring(0, 3);
  }),
  "%A": (function(date) {
   return WEEKDAYS[date.tm_wday];
  }),
  "%b": (function(date) {
   return MONTHS[date.tm_mon].substring(0, 3);
  }),
  "%B": (function(date) {
   return MONTHS[date.tm_mon];
  }),
  "%C": (function(date) {
   var year = date.tm_year + 1900;
   return leadingNulls(year / 100 | 0, 2);
  }),
  "%d": (function(date) {
   return leadingNulls(date.tm_mday, 2);
  }),
  "%e": (function(date) {
   return leadingSomething(date.tm_mday, 2, " ");
  }),
  "%g": (function(date) {
   return getWeekBasedYear(date).toString().substring(2);
  }),
  "%G": (function(date) {
   return getWeekBasedYear(date);
  }),
  "%H": (function(date) {
   return leadingNulls(date.tm_hour, 2);
  }),
  "%I": (function(date) {
   return leadingNulls(date.tm_hour < 13 ? date.tm_hour : date.tm_hour - 12, 2);
  }),
  "%j": (function(date) {
   return leadingNulls(date.tm_mday + __arraySum(__isLeapYear(date.tm_year + 1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon - 1), 3);
  }),
  "%m": (function(date) {
   return leadingNulls(date.tm_mon + 1, 2);
  }),
  "%M": (function(date) {
   return leadingNulls(date.tm_min, 2);
  }),
  "%n": (function() {
   return "\n";
  }),
  "%p": (function(date) {
   if (date.tm_hour > 0 && date.tm_hour < 13) {
    return "AM";
   } else {
    return "PM";
   }
  }),
  "%S": (function(date) {
   return leadingNulls(date.tm_sec, 2);
  }),
  "%t": (function() {
   return "\t";
  }),
  "%u": (function(date) {
   var day = new Date(date.tm_year + 1900, date.tm_mon + 1, date.tm_mday, 0, 0, 0, 0);
   return day.getDay() || 7;
  }),
  "%U": (function(date) {
   var janFirst = new Date(date.tm_year + 1900, 0, 1);
   var firstSunday = janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7 - janFirst.getDay());
   var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday);
   if (compareByDay(firstSunday, endDate) < 0) {
    var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth() - 1) - 31;
    var firstSundayUntilEndJanuary = 31 - firstSunday.getDate();
    var days = firstSundayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
    return leadingNulls(Math.ceil(days / 7), 2);
   }
   return compareByDay(firstSunday, janFirst) === 0 ? "01" : "00";
  }),
  "%V": (function(date) {
   var janFourthThisYear = new Date(date.tm_year + 1900, 0, 4);
   var janFourthNextYear = new Date(date.tm_year + 1901, 0, 4);
   var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
   var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
   var endDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
   if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
    return "53";
   }
   if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
    return "01";
   }
   var daysDifference;
   if (firstWeekStartThisYear.getFullYear() < date.tm_year + 1900) {
    daysDifference = date.tm_yday + 32 - firstWeekStartThisYear.getDate();
   } else {
    daysDifference = date.tm_yday + 1 - firstWeekStartThisYear.getDate();
   }
   return leadingNulls(Math.ceil(daysDifference / 7), 2);
  }),
  "%w": (function(date) {
   var day = new Date(date.tm_year + 1900, date.tm_mon + 1, date.tm_mday, 0, 0, 0, 0);
   return day.getDay();
  }),
  "%W": (function(date) {
   var janFirst = new Date(date.tm_year, 0, 1);
   var firstMonday = janFirst.getDay() === 1 ? janFirst : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7 - janFirst.getDay() + 1);
   var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday);
   if (compareByDay(firstMonday, endDate) < 0) {
    var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth() - 1) - 31;
    var firstMondayUntilEndJanuary = 31 - firstMonday.getDate();
    var days = firstMondayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
    return leadingNulls(Math.ceil(days / 7), 2);
   }
   return compareByDay(firstMonday, janFirst) === 0 ? "01" : "00";
  }),
  "%y": (function(date) {
   return (date.tm_year + 1900).toString().substring(2);
  }),
  "%Y": (function(date) {
   return date.tm_year + 1900;
  }),
  "%z": (function(date) {
   var off = date.tm_gmtoff;
   var ahead = off >= 0;
   off = Math.abs(off) / 60;
   off = off / 60 * 100 + off % 60;
   return (ahead ? "+" : "-") + String("0000" + off).slice(-4);
  }),
  "%Z": (function(date) {
   return date.tm_zone;
  }),
  "%%": (function() {
   return "%";
  })
 };
 for (var rule in EXPANSION_RULES_2) {
  if (pattern.indexOf(rule) >= 0) {
   pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_2[rule](date));
  }
 }
 var bytes = intArrayFromString(pattern, false);
 if (bytes.length > maxsize) {
  return 0;
 }
 writeArrayToMemory(bytes, s);
 return bytes.length - 1;
}
function _strftime_l(s, maxsize, format, tm) {
 return _strftime(s, maxsize, format, tm);
}
function _abort() {
 Module["abort"]();
}
function _emscripten_glCreateProgram() {
 var id = GL.getNewId(GL.programs);
 var program = GLctx.createProgram();
 program.name = id;
 GL.programs[id] = program;
 return id;
}
function _emscripten_glFramebufferRenderbuffer(target, attachment, renderbuffertarget, renderbuffer) {
 GLctx.framebufferRenderbuffer(target, attachment, renderbuffertarget, GL.renderbuffers[renderbuffer]);
}
function _pthread_once(ptr, func) {
 if (!_pthread_once.seen) _pthread_once.seen = {};
 if (ptr in _pthread_once.seen) return;
 Runtime.dynCall("v", func);
 _pthread_once.seen[ptr] = 1;
}
function _emscripten_glCompressedTexImage2D(target, level, internalFormat, width, height, border, imageSize, data) {
 if (data) {
  data = HEAPU8.subarray(data, data + imageSize);
 } else {
  data = null;
 }
 GLctx["compressedTexImage2D"](target, level, internalFormat, width, height, border, data);
}
function _emscripten_glClearColor(x0, x1, x2, x3) {
 GLctx.clearColor(x0, x1, x2, x3);
}
function _emscripten_glDeleteFramebuffers(n, framebuffers) {
 for (var i = 0; i < n; ++i) {
  var id = HEAP32[framebuffers + i * 4 >> 2];
  var framebuffer = GL.framebuffers[id];
  if (!framebuffer) continue;
  GLctx.deleteFramebuffer(framebuffer);
  framebuffer.name = 0;
  GL.framebuffers[id] = null;
 }
}
function _emscripten_glBindVertexArray(vao) {
 GL.currentContext.vaoExt.bindVertexArrayOES(GL.vaos[vao]);
}
function _emscripten_glIsBuffer(buffer) {
 var b = GL.buffers[buffer];
 if (!b) return 0;
 return GLctx.isBuffer(b);
}
function _emscripten_glUniform2iv(location, count, value) {
 location = GL.uniforms[location];
 count *= 2;
 value = HEAP32.subarray(value >> 2, value + count * 4 >> 2);
 GLctx.uniform2iv(location, value);
}
function _pthread_getspecific(key) {
 return PTHREAD_SPECIFIC[key] || 0;
}
function _emscripten_glVertexAttrib1fv(index, v) {
 v = HEAPF32.subarray(v >> 2, v + 4 >> 2);
 GLctx.vertexAttrib1fv(index, v);
}
var _fabs = Math_abs;
function _getc() {
 return _fgetc.apply(null, arguments);
}
function _emscripten_glTexSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels) {
 if (pixels) {
  var data = GL.getTexPixelData(type, format, width, height, pixels, -1);
  pixels = data.pixels;
 } else {
  pixels = null;
 }
 GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels);
}
function _emscripten_glPolygonOffset(x0, x1) {
 GLctx.polygonOffset(x0, x1);
}
var _emscripten_asm_const_int = true;
function _emscripten_glUniform2f(location, v0, v1) {
 location = GL.uniforms[location];
 GLctx.uniform2f(location, v0, v1);
}
function _emscripten_glLoadMatrixf() {
 Module["printErr"]("missing function: emscripten_glLoadMatrixf");
 abort(-1);
}
Module["_memmove"] = _memmove;
function _malloc(bytes) {
 var ptr = Runtime.dynamicAlloc(bytes + 8);
 return ptr + 8 & 4294967288;
}
Module["_malloc"] = _malloc;
function ___cxa_allocate_exception(size) {
 return _malloc(size);
}
function _emscripten_glUniform2i(location, v0, v1) {
 location = GL.uniforms[location];
 GLctx.uniform2i(location, v0, v1);
}
function _emscripten_glGetProgramiv(program, pname, p) {
 if (pname == 35716) {
  var log = GLctx.getProgramInfoLog(GL.programs[program]);
  if (log === null) log = "(unknown error)";
  HEAP32[p >> 2] = log.length + 1;
 } else if (pname == 35719) {
  var ptable = GL.programInfos[program];
  if (ptable) {
   HEAP32[p >> 2] = ptable.maxUniformLength;
   return;
  } else if (program < GL.counter) {
   GL.recordError(1282);
  } else {
   GL.recordError(1281);
  }
 } else if (pname == 35722) {
  var ptable = GL.programInfos[program];
  if (ptable) {
   if (ptable.maxAttributeLength == -1) {
    var program = GL.programs[program];
    var numAttribs = GLctx.getProgramParameter(program, GLctx.ACTIVE_ATTRIBUTES);
    ptable.maxAttributeLength = 0;
    for (var i = 0; i < numAttribs; ++i) {
     var activeAttrib = GLctx.getActiveAttrib(program, i);
     ptable.maxAttributeLength = Math.max(ptable.maxAttributeLength, activeAttrib.name.length + 1);
    }
   }
   HEAP32[p >> 2] = ptable.maxAttributeLength;
   return;
  } else if (program < GL.counter) {
   GL.recordError(1282);
  } else {
   GL.recordError(1281);
  }
 } else {
  HEAP32[p >> 2] = GLctx.getProgramParameter(GL.programs[program], pname);
 }
}
function _emscripten_glGetProgramInfoLog(program, maxLength, length, infoLog) {
 var log = GLctx.getProgramInfoLog(GL.programs[program]);
 if (log === null) log = "(unknown error)";
 log = log.substr(0, maxLength - 1);
 if (maxLength > 0 && infoLog) {
  writeStringToMemory(log, infoLog);
  if (length) HEAP32[length >> 2] = log.length;
 } else {
  if (length) HEAP32[length >> 2] = 0;
 }
}
function _emscripten_glDeleteRenderbuffers(n, renderbuffers) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[renderbuffers + i * 4 >> 2];
  var renderbuffer = GL.renderbuffers[id];
  if (!renderbuffer) continue;
  GLctx.deleteRenderbuffer(renderbuffer);
  renderbuffer.name = 0;
  GL.renderbuffers[id] = null;
 }
}
function _emscripten_glTexImage2D(target, level, internalFormat, width, height, border, format, type, pixels) {
 if (pixels) {
  var data = GL.getTexPixelData(type, format, width, height, pixels, internalFormat);
  pixels = data.pixels;
  internalFormat = data.internalFormat;
 } else {
  pixels = null;
 }
 GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixels);
}
function _emscripten_glGetUniformiv(program, location, params) {
 var data = GLctx.getUniform(GL.programs[program], GL.uniforms[location]);
 if (typeof data == "number" || typeof data == "boolean") {
  HEAP32[params >> 2] = data;
 } else {
  for (var i = 0; i < data.length; i++) {
   HEAP32[params + i >> 2] = data[i];
  }
 }
}
function _emscripten_glGetVertexAttribPointerv(index, pname, pointer) {
 HEAP32[pointer >> 2] = GLctx.getVertexAttribOffset(index, pname);
}
function _emscripten_glDepthMask(x0) {
 GLctx.depthMask(x0);
}
function _catopen(name, oflag) {
 return -1;
}
function _emscripten_glDepthRangef(x0, x1) {
 GLctx.depthRange(x0, x1);
}
function ___ctype_toupper_loc() {
 var me = ___ctype_toupper_loc;
 if (!me.ret) {
  var values = [ 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255 ];
  var i32size = 4;
  var arr = _malloc(values.length * i32size);
  for (var i = 0; i < values.length; i++) {
   HEAP32[arr + i * i32size >> 2] = values[i];
  }
  me.ret = allocate([ arr + 128 * i32size ], "i32*", ALLOC_NORMAL);
 }
 return me.ret;
}
function _emscripten_glStencilFunc(x0, x1, x2) {
 GLctx.stencilFunc(x0, x1, x2);
}
function _emscripten_glUniform4fv(location, count, value) {
 location = GL.uniforms[location];
 var view;
 if (count === 1) {
  view = GL.miniTempBufferViews[3];
  view[0] = HEAPF32[value >> 2];
  view[1] = HEAPF32[value + 4 >> 2];
  view[2] = HEAPF32[value + 8 >> 2];
  view[3] = HEAPF32[value + 12 >> 2];
 } else {
  view = HEAPF32.subarray(value >> 2, value + count * 16 >> 2);
 }
 GLctx.uniform4fv(location, view);
}
function _emscripten_glFlush() {
 GLctx.flush();
}
function ___ctype_tolower_loc() {
 var me = ___ctype_tolower_loc;
 if (!me.ret) {
  var values = [ 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255 ];
  var i32size = 4;
  var arr = _malloc(values.length * i32size);
  for (var i = 0; i < values.length; i++) {
   HEAP32[arr + i * i32size >> 2] = values[i];
  }
  me.ret = allocate([ arr + 128 * i32size ], "i32*", ALLOC_NORMAL);
 }
 return me.ret;
}
function _emscripten_glGetPointerv() {
 Module["printErr"]("missing function: emscripten_glGetPointerv");
 abort(-1);
}
function _emscripten_glStencilMaskSeparate(x0, x1) {
 GLctx.stencilMaskSeparate(x0, x1);
}
function _emscripten_glCreateShader(shaderType) {
 var id = GL.getNewId(GL.shaders);
 GL.shaders[id] = GLctx.createShader(shaderType);
 return id;
}
function _emscripten_glValidateProgram(program) {
 GLctx.validateProgram(GL.programs[program]);
}
function _emscripten_glGetShaderPrecisionFormat(shaderType, precisionType, range, precision) {
 var result = GLctx.getShaderPrecisionFormat(shaderType, precisionType);
 HEAP32[range >> 2] = result.rangeMin;
 HEAP32[range + 4 >> 2] = result.rangeMax;
 HEAP32[precision >> 2] = result.precision;
}
function _emscripten_glUniform1fv(location, count, value) {
 location = GL.uniforms[location];
 var view;
 if (count === 1) {
  view = GL.miniTempBufferViews[0];
  view[0] = HEAPF32[value >> 2];
 } else {
  view = HEAPF32.subarray(value >> 2, value + count * 4 >> 2);
 }
 GLctx.uniform1fv(location, view);
}
function _emscripten_glColorMask(x0, x1, x2, x3) {
 GLctx.colorMask(x0, x1, x2, x3);
}
function _emscripten_glPixelStorei(pname, param) {
 if (pname == 3333) {
  GL.packAlignment = param;
 } else if (pname == 3317) {
  GL.unpackAlignment = param;
 }
 GLctx.pixelStorei(pname, param);
}
function _emscripten_glDeleteTextures(n, textures) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[textures + i * 4 >> 2];
  var texture = GL.textures[id];
  if (!texture) continue;
  GLctx.deleteTexture(texture);
  texture.name = 0;
  GL.textures[id] = null;
 }
}
function _emscripten_glBindProgramARB() {
 Module["printErr"]("missing function: emscripten_glBindProgramARB");
 abort(-1);
}
function _emscripten_glDeleteVertexArrays(n, vaos) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[vaos + i * 4 >> 2];
  GL.currentContext.vaoExt.deleteVertexArrayOES(GL.vaos[id]);
  GL.vaos[id] = null;
 }
}
function _emscripten_glGenVertexArrays(n, arrays) {
 for (var i = 0; i < n; i++) {
  var vao = GL.currentContext.vaoExt.createVertexArrayOES();
  if (!vao) {
   GL.recordError(1282);
   while (i < n) HEAP32[arrays + i++ * 4 >> 2] = 0;
   return;
  }
  var id = GL.getNewId(GL.vaos);
  vao.name = id;
  GL.vaos[id] = vao;
  HEAP32[arrays + i * 4 >> 2] = id;
 }
}
function _time(ptr) {
 var ret = Date.now() / 1e3 | 0;
 if (ptr) {
  HEAP32[ptr >> 2] = ret;
 }
 return ret;
}
function _emscripten_glCheckFramebufferStatus(x0) {
 return GLctx.checkFramebufferStatus(x0);
}
function _emscripten_glDeleteProgram(id) {
 if (!id) return;
 var program = GL.programs[id];
 if (!program) {
  GL.recordError(1281);
  return;
 }
 GLctx.deleteProgram(program);
 program.name = 0;
 GL.programs[id] = null;
 GL.programInfos[id] = null;
}
function _emscripten_glGetBooleanv(name_, p) {
 return GL.get(name_, p, "Boolean");
}
function _emscripten_glDisable(x0) {
 GLctx.disable(x0);
}
function _emscripten_glCompileShader(shader) {
 GLctx.compileShader(GL.shaders[shader]);
}
var ___dso_handle = allocate(1, "i32*", ALLOC_STATIC);
var GLctx;
GL.init();
FS.staticInit();
__ATINIT__.unshift((function() {
 if (!Module["noFSInit"] && !FS.init.initialized) FS.init();
}));
__ATMAIN__.push((function() {
 FS.ignorePermissions = false;
}));
__ATEXIT__.push((function() {
 FS.quit();
}));
Module["FS_createFolder"] = FS.createFolder;
Module["FS_createPath"] = FS.createPath;
Module["FS_createDataFile"] = FS.createDataFile;
Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
Module["FS_createLazyFile"] = FS.createLazyFile;
Module["FS_createLink"] = FS.createLink;
Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4);
HEAP32[___errno_state >> 2] = 0;
__ATINIT__.unshift((function() {
 TTY.init();
}));
__ATEXIT__.push((function() {
 TTY.shutdown();
}));
if (ENVIRONMENT_IS_NODE) {
 var fs = require("fs");
 var NODEJS_PATH = require("path");
 NODEFS.staticInit();
}
_fputc.ret = allocate([ 0 ], "i8", ALLOC_STATIC);
__ATINIT__.push((function() {
 SOCKFS.root = FS.mount(SOCKFS, {}, null);
}));
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas, vrDevice) {
 Browser.requestFullScreen(lockPointer, resizeCanvas, vrDevice);
};
Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) {
 Browser.requestAnimationFrame(func);
};
Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) {
 Browser.setCanvasSize(width, height, noUpdates);
};
Module["pauseMainLoop"] = function Module_pauseMainLoop() {
 Browser.mainLoop.pause();
};
Module["resumeMainLoop"] = function Module_resumeMainLoop() {
 Browser.mainLoop.resume();
};
Module["getUserMedia"] = function Module_getUserMedia() {
 Browser.getUserMedia();
};
Module["createContext"] = function Module_createContext(canvas, useWebGL, setInModule, webGLContextAttributes) {
 return Browser.createContext(canvas, useWebGL, setInModule, webGLContextAttributes);
};
_fgetc.ret = allocate([ 0 ], "i8", ALLOC_STATIC);
___buildEnvironment(ENV);
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true;
STACK_MAX = STACK_BASE + TOTAL_STACK;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");
var cttz_i8 = allocate([ 8, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 6, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 7, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 6, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0 ], "i8", ALLOC_DYNAMIC);
function invoke_iiiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
 try {
  return Module["dynCall_iiiiiiii"](index, a1, a2, a3, a4, a5, a6, a7);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  asm["setThrew"](1, 0);
 }
}
function invoke_iiiiiid(index, a1, a2, a3, a4, a5, a6) {
 try {
  return Module["dynCall_iiiiiid"](index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  asm["setThrew"](1, 0);
 }
}
function invoke_vd(index, a1) {
 try {
  Module["dynCall_vd"](index, a1);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  asm["setThrew"](1, 0);
 }
}
function invoke_vid(index, a1, a2) {
 try {
  Module["dynCall_vid"](index, a1, a2);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  asm["setThrew"](1, 0);
 }
}
function invoke_viiiii(index, a1, a2, a3, a4, a5) {
 try {
  Module["dynCall_viiiii"](index, a1, a2, a3, a4, a5);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  asm["setThrew"](1, 0);
 }
}
function invoke_vi(index, a1) {
 try {
  Module["dynCall_vi"](index, a1);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  asm["setThrew"](1, 0);
 }
}
function invoke_vii(index, a1, a2) {
 try {
  Module["dynCall_vii"](index, a1, a2);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  asm["setThrew"](1, 0);
 }
}
function invoke_iiiiiii(index, a1, a2, a3, a4, a5, a6) {
 try {
  return Module["dynCall_iiiiiii"](index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  asm["setThrew"](1, 0);
 }
}
function invoke_ii(index, a1) {
 try {
  return Module["dynCall_ii"](index, a1);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  asm["setThrew"](1, 0);
 }
}
function invoke_viddd(index, a1, a2, a3, a4) {
 try {
  Module["dynCall_viddd"](index, a1, a2, a3, a4);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  asm["setThrew"](1, 0);
 }
}
function invoke_iiiiii(index, a1, a2, a3, a4, a5) {
 try {
  return Module["dynCall_iiiiii"](index, a1, a2, a3, a4, a5);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  asm["setThrew"](1, 0);
 }
}
function invoke_vidd(index, a1, a2, a3) {
 try {
  Module["dynCall_vidd"](index, a1, a2, a3);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  asm["setThrew"](1, 0);
 }
}
function invoke_iiii(index, a1, a2, a3) {
 try {
  return Module["dynCall_iiii"](index, a1, a2, a3);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  asm["setThrew"](1, 0);
 }
}
function invoke_viiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
 try {
  Module["dynCall_viiiiiiii"](index, a1, a2, a3, a4, a5, a6, a7, a8);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  asm["setThrew"](1, 0);
 }
}
function invoke_viiiiii(index, a1, a2, a3, a4, a5, a6) {
 try {
  Module["dynCall_viiiiii"](index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  asm["setThrew"](1, 0);
 }
}
function invoke_viii(index, a1, a2, a3) {
 try {
  Module["dynCall_viii"](index, a1, a2, a3);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  asm["setThrew"](1, 0);
 }
}
function invoke_viid(index, a1, a2, a3) {
 try {
  Module["dynCall_viid"](index, a1, a2, a3);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  asm["setThrew"](1, 0);
 }
}
function invoke_vidddd(index, a1, a2, a3, a4, a5) {
 try {
  Module["dynCall_vidddd"](index, a1, a2, a3, a4, a5);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  asm["setThrew"](1, 0);
 }
}
function invoke_iiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
 try {
  return Module["dynCall_iiiiiiiii"](index, a1, a2, a3, a4, a5, a6, a7, a8);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  asm["setThrew"](1, 0);
 }
}
function invoke_viiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
 try {
  Module["dynCall_viiiiiii"](index, a1, a2, a3, a4, a5, a6, a7);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  asm["setThrew"](1, 0);
 }
}
function invoke_viiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
 try {
  Module["dynCall_viiiiiiiii"](index, a1, a2, a3, a4, a5, a6, a7, a8, a9);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  asm["setThrew"](1, 0);
 }
}
function invoke_iii(index, a1, a2) {
 try {
  return Module["dynCall_iii"](index, a1, a2);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  asm["setThrew"](1, 0);
 }
}
function invoke_i(index) {
 try {
  return Module["dynCall_i"](index);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  asm["setThrew"](1, 0);
 }
}
function invoke_iiiii(index, a1, a2, a3, a4) {
 try {
  return Module["dynCall_iiiii"](index, a1, a2, a3, a4);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  asm["setThrew"](1, 0);
 }
}
function invoke_vdddddd(index, a1, a2, a3, a4, a5, a6) {
 try {
  Module["dynCall_vdddddd"](index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  asm["setThrew"](1, 0);
 }
}
function invoke_vdddd(index, a1, a2, a3, a4) {
 try {
  Module["dynCall_vdddd"](index, a1, a2, a3, a4);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  asm["setThrew"](1, 0);
 }
}
function invoke_vdd(index, a1, a2) {
 try {
  Module["dynCall_vdd"](index, a1, a2);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  asm["setThrew"](1, 0);
 }
}
function invoke_v(index) {
 try {
  Module["dynCall_v"](index);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  asm["setThrew"](1, 0);
 }
}
function invoke_vdi(index, a1, a2) {
 try {
  Module["dynCall_vdi"](index, a1, a2);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  asm["setThrew"](1, 0);
 }
}
function invoke_iiiiid(index, a1, a2, a3, a4, a5) {
 try {
  return Module["dynCall_iiiiid"](index, a1, a2, a3, a4, a5);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  asm["setThrew"](1, 0);
 }
}
function invoke_viiii(index, a1, a2, a3, a4) {
 try {
  Module["dynCall_viiii"](index, a1, a2, a3, a4);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  asm["setThrew"](1, 0);
 }
}
Module.asmGlobalArg = {
 "Math": Math,
 "Int8Array": Int8Array,
 "Int16Array": Int16Array,
 "Int32Array": Int32Array,
 "Uint8Array": Uint8Array,
 "Uint16Array": Uint16Array,
 "Uint32Array": Uint32Array,
 "Float32Array": Float32Array,
 "Float64Array": Float64Array,
 "NaN": NaN,
 "Infinity": Infinity
};
Module.asmLibraryArg = {
 "abort": abort,
 "assert": assert,
 "invoke_iiiiiiii": invoke_iiiiiiii,
 "invoke_iiiiiid": invoke_iiiiiid,
 "invoke_vd": invoke_vd,
 "invoke_vid": invoke_vid,
 "invoke_viiiii": invoke_viiiii,
 "invoke_vi": invoke_vi,
 "invoke_vii": invoke_vii,
 "invoke_iiiiiii": invoke_iiiiiii,
 "invoke_ii": invoke_ii,
 "invoke_viddd": invoke_viddd,
 "invoke_iiiiii": invoke_iiiiii,
 "invoke_vidd": invoke_vidd,
 "invoke_iiii": invoke_iiii,
 "invoke_viiiiiiii": invoke_viiiiiiii,
 "invoke_viiiiii": invoke_viiiiii,
 "invoke_viii": invoke_viii,
 "invoke_viid": invoke_viid,
 "invoke_vidddd": invoke_vidddd,
 "invoke_iiiiiiiii": invoke_iiiiiiiii,
 "invoke_viiiiiii": invoke_viiiiiii,
 "invoke_viiiiiiiii": invoke_viiiiiiiii,
 "invoke_iii": invoke_iii,
 "invoke_i": invoke_i,
 "invoke_iiiii": invoke_iiiii,
 "invoke_vdddddd": invoke_vdddddd,
 "invoke_vdddd": invoke_vdddd,
 "invoke_vdd": invoke_vdd,
 "invoke_v": invoke_v,
 "invoke_vdi": invoke_vdi,
 "invoke_iiiiid": invoke_iiiiid,
 "invoke_viiii": invoke_viiii,
 "_emscripten_glGetTexParameterfv": _emscripten_glGetTexParameterfv,
 "_emscripten_glGenRenderbuffers": _emscripten_glGenRenderbuffers,
 "_emscripten_glGetRenderbufferParameteriv": _emscripten_glGetRenderbufferParameteriv,
 "_emscripten_glReleaseShaderCompiler": _emscripten_glReleaseShaderCompiler,
 "_emscripten_glBlendFuncSeparate": _emscripten_glBlendFuncSeparate,
 "_emscripten_glGetShaderPrecisionFormat": _emscripten_glGetShaderPrecisionFormat,
 "_fread": _fread,
 "_emscripten_glGetIntegerv": _emscripten_glGetIntegerv,
 "_emscripten_glCullFace": _emscripten_glCullFace,
 "___cxa_guard_acquire": ___cxa_guard_acquire,
 "_emscripten_glRenderbufferStorage": _emscripten_glRenderbufferStorage,
 "_emscripten_glStencilMaskSeparate": _emscripten_glStencilMaskSeparate,
 "_emscripten_glViewport": _emscripten_glViewport,
 "_emscripten_glFrontFace": _emscripten_glFrontFace,
 "___assert_fail": ___assert_fail,
 "_emscripten_glDrawArrays": _emscripten_glDrawArrays,
 "_emscripten_glUniform3fv": _emscripten_glUniform3fv,
 "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv,
 "_emscripten_glUseProgram": _emscripten_glUseProgram,
 "_emscripten_glBlendColor": _emscripten_glBlendColor,
 "_emscripten_glDepthFunc": _emscripten_glDepthFunc,
 "__addDays": __addDays,
 "_emscripten_set_main_loop_timing": _emscripten_set_main_loop_timing,
 "_sbrk": _sbrk,
 "_emscripten_glDisableVertexAttribArray": _emscripten_glDisableVertexAttribArray,
 "_emscripten_glUniform3iv": _emscripten_glUniform3iv,
 "___cxa_begin_catch": ___cxa_begin_catch,
 "_emscripten_memcpy_big": _emscripten_memcpy_big,
 "_sysconf": _sysconf,
 "_close": _close,
 "_ferror": _ferror,
 "_emscripten_glUniform1f": _emscripten_glUniform1f,
 "_emscripten_glGetBooleanv": _emscripten_glGetBooleanv,
 "_emscripten_glGetShaderSource": _emscripten_glGetShaderSource,
 "_emscripten_glLineWidth": _emscripten_glLineWidth,
 "_emscripten_glUniform1i": _emscripten_glUniform1i,
 "_emscripten_glGenBuffers": _emscripten_glGenBuffers,
 "_emscripten_glDeleteObjectARB": _emscripten_glDeleteObjectARB,
 "___ctype_b_loc": ___ctype_b_loc,
 "_emscripten_glVertexAttribPointer": _emscripten_glVertexAttribPointer,
 "_emscripten_glIsProgram": _emscripten_glIsProgram,
 "_write": _write,
 "__isLeapYear": __isLeapYear,
 "_ftell": _ftell,
 "_emscripten_glBlendEquationSeparate": _emscripten_glBlendEquationSeparate,
 "_emscripten_glGetString": _emscripten_glGetString,
 "_emscripten_glIsFramebuffer": _emscripten_glIsFramebuffer,
 "___cxa_atexit": ___cxa_atexit,
 "_emscripten_glIsEnabled": _emscripten_glIsEnabled,
 "_emscripten_glScissor": _emscripten_glScissor,
 "_emscripten_glUniform2f": _emscripten_glUniform2f,
 "_emscripten_glTexParameteriv": _emscripten_glTexParameteriv,
 "_catclose": _catclose,
 "_emscripten_glBindProgramARB": _emscripten_glBindProgramARB,
 "_emscripten_glStencilOpSeparate": _emscripten_glStencilOpSeparate,
 "_emscripten_glIsBuffer": _emscripten_glIsBuffer,
 "_emscripten_glVertexAttrib1f": _emscripten_glVertexAttrib1f,
 "_emscripten_glGetActiveAttrib": _emscripten_glGetActiveAttrib,
 "_emscripten_glAttachShader": _emscripten_glAttachShader,
 "_emscripten_glDrawRangeElements": _emscripten_glDrawRangeElements,
 "_emscripten_glCompressedTexSubImage2D": _emscripten_glCompressedTexSubImage2D,
 "_uselocale": _uselocale,
 "_emscripten_glTexParameterfv": _emscripten_glTexParameterfv,
 "_emscripten_glUniformMatrix2fv": _emscripten_glUniformMatrix2fv,
 "_emscripten_glTexParameterf": _emscripten_glTexParameterf,
 "_emscripten_glGetAttachedShaders": _emscripten_glGetAttachedShaders,
 "_emscripten_glGenTextures": _emscripten_glGenTextures,
 "_emscripten_glTexParameteri": _emscripten_glTexParameteri,
 "_emscripten_get_preloaded_image_data_from_FILE": _emscripten_get_preloaded_image_data_from_FILE,
 "___cxa_find_matching_catch": ___cxa_find_matching_catch,
 "_emscripten_glLoadIdentity": _emscripten_glLoadIdentity,
 "_emscripten_glClear": _emscripten_glClear,
 "___cxa_guard_release": ___cxa_guard_release,
 "_emscripten_glValidateProgram": _emscripten_glValidateProgram,
 "_strerror_r": _strerror_r,
 "_emscripten_glUniform3f": _emscripten_glUniform3f,
 "_emscripten_glUniform4iv": _emscripten_glUniform4iv,
 "_emscripten_glGetTexParameteriv": _emscripten_glGetTexParameteriv,
 "___setErrNo": ___setErrNo,
 "_emscripten_glDrawElementsInstanced": _emscripten_glDrawElementsInstanced,
 "_emscripten_glBindAttribLocation": _emscripten_glBindAttribLocation,
 "_newlocale": _newlocale,
 "_emscripten_glDrawElements": _emscripten_glDrawElements,
 "_emscripten_glClientActiveTexture": _emscripten_glClientActiveTexture,
 "_emscripten_glVertexAttrib2f": _emscripten_glVertexAttrib2f,
 "___resumeException": ___resumeException,
 "_emscripten_glFlush": _emscripten_glFlush,
 "_emscripten_glPolygonOffset": _emscripten_glPolygonOffset,
 "_freelocale": _freelocale,
 "_emscripten_glCheckFramebufferStatus": _emscripten_glCheckFramebufferStatus,
 "_emscripten_glGetError": _emscripten_glGetError,
 "_emscripten_glClearDepthf": _emscripten_glClearDepthf,
 "_emscripten_glBindTexture": _emscripten_glBindTexture,
 "_emscripten_glBufferData": _emscripten_glBufferData,
 "_emscripten_glUniform3i": _emscripten_glUniform3i,
 "_emscripten_glDeleteShader": _emscripten_glDeleteShader,
 "_pthread_once": _pthread_once,
 "_pthread_mutex_unlock": _pthread_mutex_unlock,
 "_fabs": _fabs,
 "_emscripten_glReadPixels": _emscripten_glReadPixels,
 "___ctype_toupper_loc": ___ctype_toupper_loc,
 "_emscripten_glClearStencil": _emscripten_glClearStencil,
 "_emscripten_glGetInfoLogARB": _emscripten_glGetInfoLogARB,
 "_emscripten_glGetUniformLocation": _emscripten_glGetUniformLocation,
 "_emscripten_glEnableVertexAttribArray": _emscripten_glEnableVertexAttribArray,
 "_emscripten_glGetAttribLocation": _emscripten_glGetAttribLocation,
 "_emscripten_get_preloaded_image_data": _emscripten_get_preloaded_image_data,
 "_emscripten_glNormalPointer": _emscripten_glNormalPointer,
 "_emscripten_glHint": _emscripten_glHint,
 "_emscripten_glTexCoordPointer": _emscripten_glTexCoordPointer,
 "_emscripten_glEnable": _emscripten_glEnable,
 "_emscripten_glClearDepth": _emscripten_glClearDepth,
 "_read": _read,
 "_emscripten_glBindFramebuffer": _emscripten_glBindFramebuffer,
 "_emscripten_glLoadMatrixf": _emscripten_glLoadMatrixf,
 "_fwrite": _fwrite,
 "_emscripten_glVertexAttrib3f": _emscripten_glVertexAttrib3f,
 "_time": _time,
 "_pthread_mutex_lock": _pthread_mutex_lock,
 "_emscripten_glMatrixMode": _emscripten_glMatrixMode,
 "_emscripten_glGetFramebufferAttachmentParameteriv": _emscripten_glGetFramebufferAttachmentParameteriv,
 "_catopen": _catopen,
 "_emscripten_asm_const_2": _emscripten_asm_const_2,
 "_emscripten_glEnableClientState": _emscripten_glEnableClientState,
 "_emscripten_glUniform4i": _emscripten_glUniform4i,
 "_emscripten_glDeleteBuffers": _emscripten_glDeleteBuffers,
 "_emscripten_glGetPointerv": _emscripten_glGetPointerv,
 "_emscripten_glUniform4f": _emscripten_glUniform4f,
 "_emscripten_glBindBuffer": _emscripten_glBindBuffer,
 "_lseek": _lseek,
 "_vfprintf": _vfprintf,
 "_emscripten_glShaderBinary": _emscripten_glShaderBinary,
 "___cxa_allocate_exception": ___cxa_allocate_exception,
 "_emscripten_glBlendFunc": _emscripten_glBlendFunc,
 "_emscripten_glGetShaderInfoLog": _emscripten_glGetShaderInfoLog,
 "___buildEnvironment": ___buildEnvironment,
 "_emscripten_glStencilMask": _emscripten_glStencilMask,
 "_emscripten_glUniform1iv": _emscripten_glUniform1iv,
 "_emscripten_glGetVertexAttribPointerv": _emscripten_glGetVertexAttribPointerv,
 "___errno_location": ___errno_location,
 "_pwrite": _pwrite,
 "_emscripten_glUniform2i": _emscripten_glUniform2i,
 "_pthread_setspecific": _pthread_setspecific,
 "_open": _open,
 "_emscripten_glGetActiveUniform": _emscripten_glGetActiveUniform,
 "_emscripten_glUniform2iv": _emscripten_glUniform2iv,
 "_emscripten_glDisable": _emscripten_glDisable,
 "_emscripten_glGetBufferParameteriv": _emscripten_glGetBufferParameteriv,
 "_emscripten_glDeleteProgram": _emscripten_glDeleteProgram,
 "_emscripten_glDeleteRenderbuffers": _emscripten_glDeleteRenderbuffers,
 "_strftime": _strftime,
 "_emscripten_glVertexAttrib4f": _emscripten_glVertexAttrib4f,
 "_emscripten_glGetVertexAttribiv": _emscripten_glGetVertexAttribiv,
 "_emscripten_glTexSubImage2D": _emscripten_glTexSubImage2D,
 "_emscripten_glGetProgramiv": _emscripten_glGetProgramiv,
 "_emscripten_glPixelStorei": _emscripten_glPixelStorei,
 "_fseek": _fseek,
 "_emscripten_glUniformMatrix3fv": _emscripten_glUniformMatrix3fv,
 "_emscripten_glDepthRange": _emscripten_glDepthRange,
 "_getenv": _getenv,
 "_fclose": _fclose,
 "_emscripten_glVertexPointer": _emscripten_glVertexPointer,
 "_emscripten_glGetObjectParameterivARB": _emscripten_glGetObjectParameterivARB,
 "_pthread_key_create": _pthread_key_create,
 "_emscripten_glFinish": _emscripten_glFinish,
 "_pthread_cond_broadcast": _pthread_cond_broadcast,
 "_emscripten_glDepthMask": _emscripten_glDepthMask,
 "_emscripten_glDrawBuffers": _emscripten_glDrawBuffers,
 "_recv": _recv,
 "_fgetc": _fgetc,
 "_emscripten_glCopyTexImage2D": _emscripten_glCopyTexImage2D,
 "_emscripten_glFramebufferTexture2D": _emscripten_glFramebufferTexture2D,
 "_emscripten_glFramebufferRenderbuffer": _emscripten_glFramebufferRenderbuffer,
 "_send": _send,
 "_emscripten_glStencilFunc": _emscripten_glStencilFunc,
 "_abort": _abort,
 "_emscripten_glGetUniformiv": _emscripten_glGetUniformiv,
 "_emscripten_glRotatef": _emscripten_glRotatef,
 "_emscripten_glGetShaderiv": _emscripten_glGetShaderiv,
 "_fopen": _fopen,
 "_emscripten_glGenFramebuffers": _emscripten_glGenFramebuffers,
 "_emscripten_glUniformMatrix4fv": _emscripten_glUniformMatrix4fv,
 "_pthread_getspecific": _pthread_getspecific,
 "_pthread_cond_wait": _pthread_cond_wait,
 "_getchar": _getchar,
 "_emscripten_glUniform1fv": _emscripten_glUniform1fv,
 "_emscripten_glIsRenderbuffer": _emscripten_glIsRenderbuffer,
 "_emscripten_glShaderSource": _emscripten_glShaderSource,
 "_emscripten_glDrawArraysInstanced": _emscripten_glDrawArraysInstanced,
 "_emscripten_glCreateShader": _emscripten_glCreateShader,
 "_ungetc": _ungetc,
 "_emscripten_glStencilFuncSeparate": _emscripten_glStencilFuncSeparate,
 "_emscripten_glCopyTexSubImage2D": _emscripten_glCopyTexSubImage2D,
 "_emscripten_glDeleteTextures": _emscripten_glDeleteTextures,
 "_emscripten_glBindRenderbuffer": _emscripten_glBindRenderbuffer,
 "_fflush": _fflush,
 "_emscripten_glVertexAttribDivisor": _emscripten_glVertexAttribDivisor,
 "_emscripten_glCompressedTexImage2D": _emscripten_glCompressedTexImage2D,
 "_emscripten_glGetUniformfv": _emscripten_glGetUniformfv,
 "_emscripten_glGetVertexAttribfv": _emscripten_glGetVertexAttribfv,
 "_strftime_l": _strftime_l,
 "_fprintf": _fprintf,
 "__reallyNegative": __reallyNegative,
 "_emscripten_glVertexAttrib3fv": _emscripten_glVertexAttrib3fv,
 "_catgets": _catgets,
 "_strerror": _strerror,
 "_emscripten_glCompileShader": _emscripten_glCompileShader,
 "_emscripten_glSampleCoverage": _emscripten_glSampleCoverage,
 "_fileno": _fileno,
 "_emscripten_glFrustum": _emscripten_glFrustum,
 "_emscripten_glDepthRangef": _emscripten_glDepthRangef,
 "_emscripten_glStencilOp": _emscripten_glStencilOp,
 "_emscripten_glGenerateMipmap": _emscripten_glGenerateMipmap,
 "_fseeko": _fseeko,
 "_emscripten_glLinkProgram": _emscripten_glLinkProgram,
 "_emscripten_glBlendEquation": _emscripten_glBlendEquation,
 "___ctype_tolower_loc": ___ctype_tolower_loc,
 "_emscripten_glIsTexture": _emscripten_glIsTexture,
 "_emscripten_glBufferSubData": _emscripten_glBufferSubData,
 "_emscripten_glVertexAttrib1fv": _emscripten_glVertexAttrib1fv,
 "_pread": _pread,
 "_emscripten_glBindVertexArray": _emscripten_glBindVertexArray,
 "_mkport": _mkport,
 "_emscripten_glActiveTexture": _emscripten_glActiveTexture,
 "_emscripten_glDeleteVertexArrays": _emscripten_glDeleteVertexArrays,
 "_emscripten_glVertexAttrib4fv": _emscripten_glVertexAttrib4fv,
 "_getc": _getc,
 "_emscripten_glColorPointer": _emscripten_glColorPointer,
 "_emscripten_set_main_loop": _emscripten_set_main_loop,
 "_emscripten_glIsShader": _emscripten_glIsShader,
 "_emscripten_glGetProgramInfoLog": _emscripten_glGetProgramInfoLog,
 "_emscripten_glDeleteFramebuffers": _emscripten_glDeleteFramebuffers,
 "_emscripten_glUniform4fv": _emscripten_glUniform4fv,
 "_ftello": _ftello,
 "_fputc": _fputc,
 "___cxa_throw": ___cxa_throw,
 "__arraySum": __arraySum,
 "_emscripten_glClearColor": _emscripten_glClearColor,
 "_emscripten_glCreateProgram": _emscripten_glCreateProgram,
 "_emscripten_glGenVertexArrays": _emscripten_glGenVertexArrays,
 "_emscripten_glUniform2fv": _emscripten_glUniform2fv,
 "__formatString": __formatString,
 "_atexit": _atexit,
 "_emscripten_glGetFloatv": _emscripten_glGetFloatv,
 "_emscripten_glDetachShader": _emscripten_glDetachShader,
 "_emscripten_glColorMask": _emscripten_glColorMask,
 "_emscripten_glVertexAttrib2fv": _emscripten_glVertexAttrib2fv,
 "_emscripten_glTexImage2D": _emscripten_glTexImage2D,
 "STACKTOP": STACKTOP,
 "STACK_MAX": STACK_MAX,
 "tempDoublePtr": tempDoublePtr,
 "ABORT": ABORT,
 "cttz_i8": cttz_i8,
 "___dso_handle": ___dso_handle,
 "_stderr": _stderr,
 "_stdin": _stdin,
 "_stdout": _stdout
};
// EMSCRIPTEN_START_ASM

var asm = (function(global,env,buffer) {

 "use asm";
 var a = new global.Int8Array(buffer);
 var b = new global.Int16Array(buffer);
 var c = new global.Int32Array(buffer);
 var d = new global.Uint8Array(buffer);
 var e = new global.Uint16Array(buffer);
 var f = new global.Uint32Array(buffer);
 var g = new global.Float32Array(buffer);
 var h = new global.Float64Array(buffer);
 var i = env.STACKTOP | 0;
 var j = env.STACK_MAX | 0;
 var k = env.tempDoublePtr | 0;
 var l = env.ABORT | 0;
 var m = env.cttz_i8 | 0;
 var n = env.___dso_handle | 0;
 var o = env._stderr | 0;
 var p = env._stdin | 0;
 var q = env._stdout | 0;
 var r = 0;
 var s = 0;
 var t = 0;
 var u = 0;
 var v = global.NaN, w = global.Infinity;
 var x = 0, y = 0, z = 0, A = 0, B = 0.0, C = 0, D = 0, E = 0, F = 0.0;
 var G = 0;
 var H = 0;
 var I = 0;
 var J = 0;
 var K = 0;
 var L = 0;
 var M = 0;
 var N = 0;
 var O = 0;
 var P = 0;
 var Q = global.Math.floor;
 var R = global.Math.abs;
 var S = global.Math.sqrt;
 var T = global.Math.pow;
 var U = global.Math.cos;
 var V = global.Math.sin;
 var W = global.Math.tan;
 var X = global.Math.acos;
 var Y = global.Math.asin;
 var Z = global.Math.atan;
 var _ = global.Math.atan2;
 var $ = global.Math.exp;
 var aa = global.Math.log;
 var ba = global.Math.ceil;
 var ca = global.Math.imul;
 var da = global.Math.min;
 var ea = global.Math.clz32;
 var fa = env.abort;
 var ga = env.assert;
 var ha = env.invoke_iiiiiiii;
 var ia = env.invoke_iiiiiid;
 var ja = env.invoke_vd;
 var ka = env.invoke_vid;
 var la = env.invoke_viiiii;
 var ma = env.invoke_vi;
 var na = env.invoke_vii;
 var oa = env.invoke_iiiiiii;
 var pa = env.invoke_ii;
 var qa = env.invoke_viddd;
 var ra = env.invoke_iiiiii;
 var sa = env.invoke_vidd;
 var ta = env.invoke_iiii;
 var ua = env.invoke_viiiiiiii;
 var va = env.invoke_viiiiii;
 var wa = env.invoke_viii;
 var xa = env.invoke_viid;
 var ya = env.invoke_vidddd;
 var za = env.invoke_iiiiiiiii;
 var Aa = env.invoke_viiiiiii;
 var Ba = env.invoke_viiiiiiiii;
 var Ca = env.invoke_iii;
 var Da = env.invoke_i;
 var Ea = env.invoke_iiiii;
 var Fa = env.invoke_vdddddd;
 var Ga = env.invoke_vdddd;
 var Ha = env.invoke_vdd;
 var Ia = env.invoke_v;
 var Ja = env.invoke_vdi;
 var Ka = env.invoke_iiiiid;
 var La = env.invoke_viiii;
 var Ma = env._emscripten_glGetTexParameterfv;
 var Na = env._emscripten_glGenRenderbuffers;
 var Oa = env._emscripten_glGetRenderbufferParameteriv;
 var Pa = env._emscripten_glReleaseShaderCompiler;
 var Qa = env._emscripten_glBlendFuncSeparate;
 var Ra = env._emscripten_glGetShaderPrecisionFormat;
 var Sa = env._fread;
 var Ta = env._emscripten_glGetIntegerv;
 var Ua = env._emscripten_glCullFace;
 var Va = env.___cxa_guard_acquire;
 var Wa = env._emscripten_glRenderbufferStorage;
 var Xa = env._emscripten_glStencilMaskSeparate;
 var Ya = env._emscripten_glViewport;
 var Za = env._emscripten_glFrontFace;
 var _a = env.___assert_fail;
 var $a = env._emscripten_glDrawArrays;
 var ab = env._emscripten_glUniform3fv;
 var bb = env.__ZSt18uncaught_exceptionv;
 var cb = env._emscripten_glUseProgram;
 var db = env._emscripten_glBlendColor;
 var eb = env._emscripten_glDepthFunc;
 var fb = env.__addDays;
 var gb = env._emscripten_set_main_loop_timing;
 var hb = env._sbrk;
 var ib = env._emscripten_glDisableVertexAttribArray;
 var jb = env._emscripten_glUniform3iv;
 var kb = env.___cxa_begin_catch;
 var lb = env._emscripten_memcpy_big;
 var mb = env._sysconf;
 var nb = env._close;
 var ob = env._ferror;
 var pb = env._emscripten_glUniform1f;
 var qb = env._emscripten_glGetBooleanv;
 var rb = env._emscripten_glGetShaderSource;
 var sb = env._emscripten_glLineWidth;
 var tb = env._emscripten_glUniform1i;
 var ub = env._emscripten_glGenBuffers;
 var vb = env._emscripten_glDeleteObjectARB;
 var wb = env.___ctype_b_loc;
 var xb = env._emscripten_glVertexAttribPointer;
 var yb = env._emscripten_glIsProgram;
 var zb = env._write;
 var Ab = env.__isLeapYear;
 var Bb = env._ftell;
 var Cb = env._emscripten_glBlendEquationSeparate;
 var Db = env._emscripten_glGetString;
 var Eb = env._emscripten_glIsFramebuffer;
 var Fb = env.___cxa_atexit;
 var Gb = env._emscripten_glIsEnabled;
 var Hb = env._emscripten_glScissor;
 var Ib = env._emscripten_glUniform2f;
 var Jb = env._emscripten_glTexParameteriv;
 var Kb = env._catclose;
 var Lb = env._emscripten_glBindProgramARB;
 var Mb = env._emscripten_glStencilOpSeparate;
 var Nb = env._emscripten_glIsBuffer;
 var Ob = env._emscripten_glVertexAttrib1f;
 var Pb = env._emscripten_glGetActiveAttrib;
 var Qb = env._emscripten_glAttachShader;
 var Rb = env._emscripten_glDrawRangeElements;
 var Sb = env._emscripten_glCompressedTexSubImage2D;
 var Tb = env._uselocale;
 var Ub = env._emscripten_glTexParameterfv;
 var Vb = env._emscripten_glUniformMatrix2fv;
 var Wb = env._emscripten_glTexParameterf;
 var Xb = env._emscripten_glGetAttachedShaders;
 var Yb = env._emscripten_glGenTextures;
 var Zb = env._emscripten_glTexParameteri;
 var _b = env._emscripten_get_preloaded_image_data_from_FILE;
 var $b = env.___cxa_find_matching_catch;
 var ac = env._emscripten_glLoadIdentity;
 var bc = env._emscripten_glClear;
 var cc = env.___cxa_guard_release;
 var dc = env._emscripten_glValidateProgram;
 var ec = env._strerror_r;
 var fc = env._emscripten_glUniform3f;
 var gc = env._emscripten_glUniform4iv;
 var hc = env._emscripten_glGetTexParameteriv;
 var ic = env.___setErrNo;
 var jc = env._emscripten_glDrawElementsInstanced;
 var kc = env._emscripten_glBindAttribLocation;
 var lc = env._newlocale;
 var mc = env._emscripten_glDrawElements;
 var nc = env._emscripten_glClientActiveTexture;
 var oc = env._emscripten_glVertexAttrib2f;
 var pc = env.___resumeException;
 var qc = env._emscripten_glFlush;
 var rc = env._emscripten_glPolygonOffset;
 var sc = env._freelocale;
 var tc = env._emscripten_glCheckFramebufferStatus;
 var uc = env._emscripten_glGetError;
 var vc = env._emscripten_glClearDepthf;
 var wc = env._emscripten_glBindTexture;
 var xc = env._emscripten_glBufferData;
 var yc = env._emscripten_glUniform3i;
 var zc = env._emscripten_glDeleteShader;
 var Ac = env._pthread_once;
 var Bc = env._pthread_mutex_unlock;
 var Cc = env._fabs;
 var Dc = env._emscripten_glReadPixels;
 var Ec = env.___ctype_toupper_loc;
 var Fc = env._emscripten_glClearStencil;
 var Gc = env._emscripten_glGetInfoLogARB;
 var Hc = env._emscripten_glGetUniformLocation;
 var Ic = env._emscripten_glEnableVertexAttribArray;
 var Jc = env._emscripten_glGetAttribLocation;
 var Kc = env._emscripten_get_preloaded_image_data;
 var Lc = env._emscripten_glNormalPointer;
 var Mc = env._emscripten_glHint;
 var Nc = env._emscripten_glTexCoordPointer;
 var Oc = env._emscripten_glEnable;
 var Pc = env._emscripten_glClearDepth;
 var Qc = env._read;
 var Rc = env._emscripten_glBindFramebuffer;
 var Sc = env._emscripten_glLoadMatrixf;
 var Tc = env._fwrite;
 var Uc = env._emscripten_glVertexAttrib3f;
 var Vc = env._time;
 var Wc = env._pthread_mutex_lock;
 var Xc = env._emscripten_glMatrixMode;
 var Yc = env._emscripten_glGetFramebufferAttachmentParameteriv;
 var Zc = env._catopen;
 var _c = env._emscripten_asm_const_2;
 var $c = env._emscripten_glEnableClientState;
 var ad = env._emscripten_glUniform4i;
 var bd = env._emscripten_glDeleteBuffers;
 var cd = env._emscripten_glGetPointerv;
 var dd = env._emscripten_glUniform4f;
 var ed = env._emscripten_glBindBuffer;
 var fd = env._lseek;
 var gd = env._vfprintf;
 var hd = env._emscripten_glShaderBinary;
 var id = env.___cxa_allocate_exception;
 var jd = env._emscripten_glBlendFunc;
 var kd = env._emscripten_glGetShaderInfoLog;
 var ld = env.___buildEnvironment;
 var md = env._emscripten_glStencilMask;
 var nd = env._emscripten_glUniform1iv;
 var od = env._emscripten_glGetVertexAttribPointerv;
 var pd = env.___errno_location;
 var qd = env._pwrite;
 var rd = env._emscripten_glUniform2i;
 var sd = env._pthread_setspecific;
 var td = env._open;
 var ud = env._emscripten_glGetActiveUniform;
 var vd = env._emscripten_glUniform2iv;
 var wd = env._emscripten_glDisable;
 var xd = env._emscripten_glGetBufferParameteriv;
 var yd = env._emscripten_glDeleteProgram;
 var zd = env._emscripten_glDeleteRenderbuffers;
 var Ad = env._strftime;
 var Bd = env._emscripten_glVertexAttrib4f;
 var Cd = env._emscripten_glGetVertexAttribiv;
 var Dd = env._emscripten_glTexSubImage2D;
 var Ed = env._emscripten_glGetProgramiv;
 var Fd = env._emscripten_glPixelStorei;
 var Gd = env._fseek;
 var Hd = env._emscripten_glUniformMatrix3fv;
 var Id = env._emscripten_glDepthRange;
 var Jd = env._getenv;
 var Kd = env._fclose;
 var Ld = env._emscripten_glVertexPointer;
 var Md = env._emscripten_glGetObjectParameterivARB;
 var Nd = env._pthread_key_create;
 var Od = env._emscripten_glFinish;
 var Pd = env._pthread_cond_broadcast;
 var Qd = env._emscripten_glDepthMask;
 var Rd = env._emscripten_glDrawBuffers;
 var Sd = env._recv;
 var Td = env._fgetc;
 var Ud = env._emscripten_glCopyTexImage2D;
 var Vd = env._emscripten_glFramebufferTexture2D;
 var Wd = env._emscripten_glFramebufferRenderbuffer;
 var Xd = env._send;
 var Yd = env._emscripten_glStencilFunc;
 var Zd = env._abort;
 var _d = env._emscripten_glGetUniformiv;
 var $d = env._emscripten_glRotatef;
 var ae = env._emscripten_glGetShaderiv;
 var be = env._fopen;
 var ce = env._emscripten_glGenFramebuffers;
 var de = env._emscripten_glUniformMatrix4fv;
 var ee = env._pthread_getspecific;
 var fe = env._pthread_cond_wait;
 var ge = env._getchar;
 var he = env._emscripten_glUniform1fv;
 var ie = env._emscripten_glIsRenderbuffer;
 var je = env._emscripten_glShaderSource;
 var ke = env._emscripten_glDrawArraysInstanced;
 var le = env._emscripten_glCreateShader;
 var me = env._ungetc;
 var ne = env._emscripten_glStencilFuncSeparate;
 var oe = env._emscripten_glCopyTexSubImage2D;
 var pe = env._emscripten_glDeleteTextures;
 var qe = env._emscripten_glBindRenderbuffer;
 var re = env._fflush;
 var se = env._emscripten_glVertexAttribDivisor;
 var te = env._emscripten_glCompressedTexImage2D;
 var ue = env._emscripten_glGetUniformfv;
 var ve = env._emscripten_glGetVertexAttribfv;
 var we = env._strftime_l;
 var xe = env._fprintf;
 var ye = env.__reallyNegative;
 var ze = env._emscripten_glVertexAttrib3fv;
 var Ae = env._catgets;
 var Be = env._strerror;
 var Ce = env._emscripten_glCompileShader;
 var De = env._emscripten_glSampleCoverage;
 var Ee = env._fileno;
 var Fe = env._emscripten_glFrustum;
 var Ge = env._emscripten_glDepthRangef;
 var He = env._emscripten_glStencilOp;
 var Ie = env._emscripten_glGenerateMipmap;
 var Je = env._fseeko;
 var Ke = env._emscripten_glLinkProgram;
 var Le = env._emscripten_glBlendEquation;
 var Me = env.___ctype_tolower_loc;
 var Ne = env._emscripten_glIsTexture;
 var Oe = env._emscripten_glBufferSubData;
 var Pe = env._emscripten_glVertexAttrib1fv;
 var Qe = env._pread;
 var Re = env._emscripten_glBindVertexArray;
 var Se = env._mkport;
 var Te = env._emscripten_glActiveTexture;
 var Ue = env._emscripten_glDeleteVertexArrays;
 var Ve = env._emscripten_glVertexAttrib4fv;
 var We = env._getc;
 var Xe = env._emscripten_glColorPointer;
 var Ye = env._emscripten_set_main_loop;
 var Ze = env._emscripten_glIsShader;
 var _e = env._emscripten_glGetProgramInfoLog;
 var $e = env._emscripten_glDeleteFramebuffers;
 var af = env._emscripten_glUniform4fv;
 var bf = env._ftello;
 var cf = env._fputc;
 var df = env.___cxa_throw;
 var ef = env.__arraySum;
 var ff = env._emscripten_glClearColor;
 var gf = env._emscripten_glCreateProgram;
 var hf = env._emscripten_glGenVertexArrays;
 var jf = env._emscripten_glUniform2fv;
 var kf = env.__formatString;
 var lf = env._atexit;
 var mf = env._emscripten_glGetFloatv;
 var nf = env._emscripten_glDetachShader;
 var of = env._emscripten_glColorMask;
 var pf = env._emscripten_glVertexAttrib2fv;
 var qf = env._emscripten_glTexImage2D;
 var rf = 0.0;
 
// EMSCRIPTEN_START_FUNCS
function gi(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;l=i;i=i+16|0;m=l;n=l+8|0;a:do if((e|0)==(f|0))o=f;else{p=e;while(1){if(!(c[p>>2]|0)){o=p;break a}p=p+4|0;if((p|0)==(f|0)){o=f;break}}}while(0);c[k>>2]=h;c[g>>2]=e;p=j;q=b+8|0;b:do if((h|0)==(j|0)|(e|0)==(f|0)){r=e;s=29}else{b=e;t=h;u=o;c:while(1){v=d;w=c[v+4>>2]|0;x=m;c[x>>2]=c[v>>2];c[x+4>>2]=w;w=Tb(c[q>>2]|0)|0;x=sk(t,g,u-b>>2,p-t|0,d)|0;if(w)Tb(w|0)|0;switch(x|0){case 0:{y=1;break b;break}case -1:{z=b;A=t;break c;break}default:{}}w=(c[k>>2]|0)+x|0;c[k>>2]=w;if((w|0)==(j|0)){s=15;break}if((u|0)==(f|0)){B=c[g>>2]|0;C=w;D=f}else{w=Tb(c[q>>2]|0)|0;x=tn(n,0,d)|0;if(w)Tb(w|0)|0;if((x|0)==-1){y=2;break b}if(x>>>0>(p-(c[k>>2]|0)|0)>>>0){y=1;break b}if(x){w=x;x=n;while(1){v=a[x>>0]|0;E=c[k>>2]|0;c[k>>2]=E+1;a[E>>0]=v;w=w+-1|0;if(!w)break;else x=x+1|0}}x=(c[g>>2]|0)+4|0;c[g>>2]=x;d:do if((x|0)==(f|0))F=f;else{w=x;while(1){if(!(c[w>>2]|0)){F=w;break d}w=w+4|0;if((w|0)==(f|0)){F=f;break}}}while(0);B=x;C=c[k>>2]|0;D=F}if((C|0)==(j|0)|(B|0)==(f|0)){r=B;s=29;break b}else{b=B;t=C;u=D}}if((s|0)==15){r=c[g>>2]|0;s=29;break}c[k>>2]=A;e:do if((z|0)==(c[g>>2]|0))G=z;else{u=z;t=A;while(1){b=c[u>>2]|0;w=Tb(c[q>>2]|0)|0;v=tn(t,b,m)|0;if(w)Tb(w|0)|0;if((v|0)==-1){G=u;break e}t=(c[k>>2]|0)+v|0;c[k>>2]=t;v=u+4|0;if((v|0)==(c[g>>2]|0)){G=v;break}else u=v}}while(0);c[g>>2]=G;y=2}while(0);if((s|0)==29)y=(r|0)!=(f|0)&1;i=l;return y|0}function fi(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;k=i;i=i+16|0;l=k;m=Ds(j,18268)|0;n=Ds(j,18424)|0;yf[c[(c[n>>2]|0)+20>>2]&127](l,n);j=a[l>>0]|0;o=l+4|0;if(((j&1)==0?(j&255)>>>1:c[o>>2]|0)|0){c[h>>2]=f;j=a[b>>0]|0;switch(j<<24>>24){case 43:case 45:{p=Nf[c[(c[m>>2]|0)+44>>2]&31](m,j)|0;j=c[h>>2]|0;c[h>>2]=j+4;c[j>>2]=p;q=b+1|0;break}default:q=b}a:do if((e-q|0)>1?(a[q>>0]|0)==48:0){p=q+1|0;switch(a[p>>0]|0){case 88:case 120:break;default:{r=q;break a}}j=Nf[c[(c[m>>2]|0)+44>>2]&31](m,48)|0;s=c[h>>2]|0;c[h>>2]=s+4;c[s>>2]=j;j=Nf[c[(c[m>>2]|0)+44>>2]&31](m,a[p>>0]|0)|0;p=c[h>>2]|0;c[h>>2]=p+4;c[p>>2]=j;r=q+2|0}else r=q;while(0);if((r|0)!=(e|0)?(q=e+-1|0,r>>>0<q>>>0):0){j=r;p=q;do{q=a[j>>0]|0;a[j>>0]=a[p>>0]|0;a[p>>0]=q;j=j+1|0;p=p+-1|0}while(j>>>0<p>>>0)}p=Af[c[(c[n>>2]|0)+16>>2]&127](n)|0;n=l+8|0;j=l+1|0;if(r>>>0<e>>>0){q=0;s=0;t=r;while(1){u=a[((a[l>>0]&1)==0?j:c[n>>2]|0)+s>>0]|0;if(u<<24>>24!=0&(q|0)==(u<<24>>24|0)){u=c[h>>2]|0;c[h>>2]=u+4;c[u>>2]=p;u=a[l>>0]|0;v=0;w=(s>>>0<(((u&1)==0?(u&255)>>>1:c[o>>2]|0)+-1|0)>>>0&1)+s|0}else{v=q;w=s}u=Nf[c[(c[m>>2]|0)+44>>2]&31](m,a[t>>0]|0)|0;x=c[h>>2]|0;c[h>>2]=x+4;c[x>>2]=u;t=t+1|0;if(t>>>0>=e>>>0)break;else{q=v+1|0;s=w}}}w=b;s=f+(r-w<<2)|0;r=c[h>>2]|0;if((s|0)!=(r|0)){v=r+-4|0;if(s>>>0<v>>>0){q=s;t=v;do{v=c[q>>2]|0;c[q>>2]=c[t>>2];c[t>>2]=v;q=q+4|0;t=t+-4|0}while(q>>>0<t>>>0);y=w;z=r}else{y=w;z=r}}else{y=w;z=s}}else{Pf[c[(c[m>>2]|0)+48>>2]&15](m,b,e,f)|0;m=b;b=f+(e-m<<2)|0;c[h>>2]=b;y=m;z=b}c[g>>2]=(d|0)==(e|0)?z:f+(d-y<<2)|0;Au(l);i=k;return}function Ih(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;a:do if((b|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)==(e|0)?(h=d+28|0,(c[h>>2]|0)!=1):0)c[h>>2]=f}else{if((b|0)!=(c[d>>2]|0)){h=c[b+12>>2]|0;i=b+16+(h<<3)|0;Ip(b+16|0,d,e,f,g);j=b+24|0;if((h|0)<=1)break;h=c[b+8>>2]|0;if((h&2|0)==0?(k=d+36|0,(c[k>>2]|0)!=1):0){if(!(h&1)){h=d+54|0;l=j;while(1){if(a[h>>0]|0)break a;if((c[k>>2]|0)==1)break a;Ip(l,d,e,f,g);l=l+8|0;if(l>>>0>=i>>>0)break a}}l=d+24|0;h=d+54|0;m=j;while(1){if(a[h>>0]|0)break a;if((c[k>>2]|0)==1?(c[l>>2]|0)==1:0)break a;Ip(m,d,e,f,g);m=m+8|0;if(m>>>0>=i>>>0)break a}}m=d+54|0;l=j;while(1){if(a[m>>0]|0)break a;Ip(l,d,e,f,g);l=l+8|0;if(l>>>0>=i>>>0)break a}}if((c[d+16>>2]|0)!=(e|0)?(i=d+20|0,(c[i>>2]|0)!=(e|0)):0){c[d+32>>2]=f;l=d+44|0;if((c[l>>2]|0)==4)break;m=c[b+12>>2]|0;j=b+16+(m<<3)|0;k=d+52|0;h=d+53|0;n=d+54|0;o=b+8|0;p=d+24|0;b:do if((m|0)>0){q=0;r=0;s=b+16|0;while(1){a[k>>0]=0;a[h>>0]=0;Bp(s,d,e,e,1,g);if(a[n>>0]|0){t=q;u=r;v=20;break b}do if(a[h>>0]|0){if(!(a[k>>0]|0))if(!(c[o>>2]&1)){t=q;u=1;v=20;break b}else{w=q;x=1;break}if((c[p>>2]|0)==1)break b;if(!(c[o>>2]&2))break b;else{w=1;x=1}}else{w=q;x=r}while(0);s=s+8|0;if(s>>>0>=j>>>0){t=w;u=x;v=20;break}else{q=w;r=x}}}else{t=0;u=0;v=20}while(0);do if((v|0)==20){if((!t?(c[i>>2]=e,j=d+40|0,c[j>>2]=(c[j>>2]|0)+1,(c[d+36>>2]|0)==1):0)?(c[p>>2]|0)==2:0){a[n>>0]=1;if(u)break}else v=24;if((v|0)==24?u:0)break;c[l>>2]=4;break a}while(0);c[l>>2]=3;break}if((f|0)==1)c[d+32>>2]=1}while(0);return}function zi(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=(c[a+8>>2]<<16|0)/(e|0)|0;g=a+24|0;h=c[g>>2]|0;i=(c[a+4>>2]<<16|0)/(h|0)|0;j=e+-1|0;c[d>>2]=j;if(!e)return;e=a+20|0;k=a+32|0;l=(b&48|0)!=0;m=b&112;b=a+12|0;n=c[e>>2]|0;o=n;p=j;j=n;n=h;h=0;q=0;while(1){if((h|0)>65535){r=h+-65536|0;s=r>>>16;t=r-(s<<16)|0;u=q+1+s|0}else{t=h;u=q}if(!n)v=p;else{s=n;r=j;w=65536;x=0;y=-1;while(1){s=s+-1|0;if((w|0)>65535){z=w+-65536|0;A=z>>>16;B=y+1+A|0;C=z-(A<<16)|0;D=(c[a>>2]|0)+((ca(c[b>>2]|0,u)|0)+(B<<2))|0;E=B}else{C=w;D=x;E=y}B=c[D>>2]|0;A=B>>>24;z=B>>>16&255;F=B>>>8&255;G=B&255;B=c[r>>2]|0;H=B>>>16&255;I=B>>>8&255;J=B&255;K=B>>>24;if(l&(G|0)!=255){L=((ca(F,G)|0)>>>0)/255|0;M=((ca(z,G)|0)>>>0)/255|0;N=((ca(A,G)|0)>>>0)/255|0}else{L=F;M=z;N=A}switch(m|0){case 16:{A=G^255;O=(((ca(A,K)|0)>>>0)/255|0)+G|0;P=(((ca(A,J)|0)>>>0)/255|0)+L|0;Q=(((ca(I,A)|0)>>>0)/255|0)+M|0;R=(((ca(H,A)|0)>>>0)/255|0)+N|0;break}case 32:{A=N+H|0;G=M+I|0;z=L+J|0;O=K;P=z>>>0>255?255:z;Q=G>>>0>255?255:G;R=A>>>0>255?255:A;break}case 64:{O=K;P=((ca(L,J)|0)>>>0)/255|0;Q=((ca(M,I)|0)>>>0)/255|0;R=((ca(N,H)|0)>>>0)/255|0;break}default:{O=K;P=J;Q=I;R=H}}c[r>>2]=Q<<8|R<<16|P|O<<24;if(!s)break;else{r=r+4|0;w=C+i|0;x=D;y=E}}v=c[d>>2]|0}y=o+(c[k>>2]|0)|0;x=v+-1|0;c[d>>2]=x;if(!v){S=y;break}o=y;p=x;j=y;n=c[g>>2]|0;h=t+f|0;q=u}c[e>>2]=S;return}function Ci(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=(c[a+8>>2]<<16|0)/(e|0)|0;g=a+24|0;h=c[g>>2]|0;i=(c[a+4>>2]<<16|0)/(h|0)|0;j=e+-1|0;c[d>>2]=j;if(!e)return;e=a+20|0;k=a+32|0;l=(b&48|0)!=0;m=b&112;b=a+12|0;n=c[e>>2]|0;o=n;p=j;j=n;n=h;h=0;q=0;while(1){if((h|0)>65535){r=h+-65536|0;s=r>>>16;t=r-(s<<16)|0;u=q+1+s|0}else{t=h;u=q}if(!n)v=p;else{s=n;r=j;w=65536;x=0;y=-1;while(1){s=s+-1|0;if((w|0)>65535){z=w+-65536|0;A=z>>>16;B=y+1+A|0;C=z-(A<<16)|0;D=(c[a>>2]|0)+((ca(c[b>>2]|0,u)|0)+(B<<2))|0;E=B}else{C=w;D=x;E=y}B=c[D>>2]|0;A=B>>>16&255;z=B>>>8&255;F=B&255;G=B>>>24;B=c[r>>2]|0;H=B>>>16&255;I=B>>>8&255;J=B&255;K=B>>>24;if(l&(G|0)!=255){L=((ca(A,G)|0)>>>0)/255|0;M=((ca(z,G)|0)>>>0)/255|0;N=((ca(F,G)|0)>>>0)/255|0}else{L=A;M=z;N=F}switch(m|0){case 16:{F=G^255;O=(((ca(F,K)|0)>>>0)/255|0)+G|0;P=(((ca(F,J)|0)>>>0)/255|0)+L|0;Q=(((ca(I,F)|0)>>>0)/255|0)+M|0;R=(((ca(H,F)|0)>>>0)/255|0)+N|0;break}case 32:{F=N+H|0;G=M+I|0;z=L+J|0;O=K;P=z>>>0>255?255:z;Q=G>>>0>255?255:G;R=F>>>0>255?255:F;break}case 64:{O=K;P=((ca(L,J)|0)>>>0)/255|0;Q=((ca(M,I)|0)>>>0)/255|0;R=((ca(N,H)|0)>>>0)/255|0;break}default:{O=K;P=J;Q=I;R=H}}c[r>>2]=Q<<8|R<<16|P|O<<24;if(!s)break;else{r=r+4|0;w=C+i|0;x=D;y=E}}v=c[d>>2]|0}y=o+(c[k>>2]|0)|0;x=v+-1|0;c[d>>2]=x;if(!v){S=y;break}o=y;p=x;j=y;n=c[g>>2]|0;h=t+f|0;q=u}c[e>>2]=S;return}function Bi(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=(c[a+8>>2]<<16|0)/(e|0)|0;g=a+24|0;h=c[g>>2]|0;i=(c[a+4>>2]<<16|0)/(h|0)|0;j=e+-1|0;c[d>>2]=j;if(!e)return;e=a+20|0;k=a+32|0;l=(b&48|0)!=0;m=b&112;b=a+12|0;n=c[e>>2]|0;o=n;p=j;j=n;n=h;h=0;q=0;while(1){if((h|0)>65535){r=h+-65536|0;s=r>>>16;t=r-(s<<16)|0;u=q+1+s|0}else{t=h;u=q}if(!n)v=p;else{s=n;r=j;w=65536;x=0;y=-1;while(1){s=s+-1|0;if((w|0)>65535){z=w+-65536|0;A=z>>>16;B=y+1+A|0;C=z-(A<<16)|0;D=(c[a>>2]|0)+((ca(c[b>>2]|0,u)|0)+(B<<2))|0;E=B}else{C=w;D=x;E=y}B=c[D>>2]|0;A=B>>>16&255;z=B>>>8&255;F=B&255;G=B>>>24;B=c[r>>2]|0;H=B>>>16&255;I=B>>>8&255;J=B&255;K=B>>>24;if(l&(G|0)!=255){L=((ca(F,G)|0)>>>0)/255|0;M=((ca(z,G)|0)>>>0)/255|0;N=((ca(A,G)|0)>>>0)/255|0}else{L=F;M=z;N=A}switch(m|0){case 16:{A=G^255;O=(((ca(A,K)|0)>>>0)/255|0)+G|0;P=(((ca(A,J)|0)>>>0)/255|0)+L|0;Q=(((ca(I,A)|0)>>>0)/255|0)+M|0;R=(((ca(H,A)|0)>>>0)/255|0)+N|0;break}case 32:{A=N+H|0;G=M+I|0;z=L+J|0;O=K;P=z>>>0>255?255:z;Q=G>>>0>255?255:G;R=A>>>0>255?255:A;break}case 64:{O=K;P=((ca(L,J)|0)>>>0)/255|0;Q=((ca(M,I)|0)>>>0)/255|0;R=((ca(N,H)|0)>>>0)/255|0;break}default:{O=K;P=J;Q=I;R=H}}c[r>>2]=Q<<8|R<<16|P|O<<24;if(!s)break;else{r=r+4|0;w=C+i|0;x=D;y=E}}v=c[d>>2]|0}y=o+(c[k>>2]|0)|0;x=v+-1|0;c[d>>2]=x;if(!v){S=y;break}o=y;p=x;j=y;n=c[g>>2]|0;h=t+f|0;q=u}c[e>>2]=S;return}function Ai(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=(c[a+8>>2]<<16|0)/(e|0)|0;g=a+24|0;h=c[g>>2]|0;i=(c[a+4>>2]<<16|0)/(h|0)|0;j=e+-1|0;c[d>>2]=j;if(!e)return;e=a+20|0;k=a+32|0;l=(b&48|0)!=0;m=b&112;b=a+12|0;n=c[e>>2]|0;o=n;p=j;j=n;n=h;h=0;q=0;while(1){if((h|0)>65535){r=h+-65536|0;s=r>>>16;t=r-(s<<16)|0;u=q+1+s|0}else{t=h;u=q}if(!n)v=p;else{s=n;r=j;w=65536;x=0;y=-1;while(1){s=s+-1|0;if((w|0)>65535){z=w+-65536|0;A=z>>>16;B=y+1+A|0;C=z-(A<<16)|0;D=(c[a>>2]|0)+((ca(c[b>>2]|0,u)|0)+(B<<2))|0;E=B}else{C=w;D=x;E=y}B=c[D>>2]|0;A=B>>>24;z=B>>>16&255;F=B>>>8&255;G=B&255;B=c[r>>2]|0;H=B>>>16&255;I=B>>>8&255;J=B&255;K=B>>>24;if(l&(G|0)!=255){L=((ca(A,G)|0)>>>0)/255|0;M=((ca(z,G)|0)>>>0)/255|0;N=((ca(F,G)|0)>>>0)/255|0}else{L=A;M=z;N=F}switch(m|0){case 16:{F=G^255;O=(((ca(F,K)|0)>>>0)/255|0)+G|0;P=(((ca(F,J)|0)>>>0)/255|0)+L|0;Q=(((ca(I,F)|0)>>>0)/255|0)+M|0;R=(((ca(H,F)|0)>>>0)/255|0)+N|0;break}case 32:{F=N+H|0;G=M+I|0;z=L+J|0;O=K;P=z>>>0>255?255:z;Q=G>>>0>255?255:G;R=F>>>0>255?255:F;break}case 64:{O=K;P=((ca(L,J)|0)>>>0)/255|0;Q=((ca(M,I)|0)>>>0)/255|0;R=((ca(N,H)|0)>>>0)/255|0;break}default:{O=K;P=J;Q=I;R=H}}c[r>>2]=Q<<8|R<<16|P|O<<24;if(!s)break;else{r=r+4|0;w=C+i|0;x=D;y=E}}v=c[d>>2]|0}y=o+(c[k>>2]|0)|0;x=v+-1|0;c[d>>2]=x;if(!v){S=y;break}o=y;p=x;j=y;n=c[g>>2]|0;h=t+f|0;q=u}c[e>>2]=S;return}function li(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;k=i;i=i+16|0;l=k;m=Ds(j,18276)|0;n=Ds(j,18416)|0;yf[c[(c[n>>2]|0)+20>>2]&127](l,n);j=a[l>>0]|0;o=l+4|0;if(((j&1)==0?(j&255)>>>1:c[o>>2]|0)|0){c[h>>2]=f;j=a[b>>0]|0;switch(j<<24>>24){case 43:case 45:{p=Nf[c[(c[m>>2]|0)+28>>2]&31](m,j)|0;j=c[h>>2]|0;c[h>>2]=j+1;a[j>>0]=p;q=b+1|0;break}default:q=b}a:do if((e-q|0)>1?(a[q>>0]|0)==48:0){p=q+1|0;switch(a[p>>0]|0){case 88:case 120:break;default:{r=q;break a}}j=Nf[c[(c[m>>2]|0)+28>>2]&31](m,48)|0;s=c[h>>2]|0;c[h>>2]=s+1;a[s>>0]=j;j=Nf[c[(c[m>>2]|0)+28>>2]&31](m,a[p>>0]|0)|0;p=c[h>>2]|0;c[h>>2]=p+1;a[p>>0]=j;r=q+2|0}else r=q;while(0);if((r|0)!=(e|0)?(q=e+-1|0,r>>>0<q>>>0):0){j=r;p=q;do{q=a[j>>0]|0;a[j>>0]=a[p>>0]|0;a[p>>0]=q;j=j+1|0;p=p+-1|0}while(j>>>0<p>>>0)}p=Af[c[(c[n>>2]|0)+16>>2]&127](n)|0;n=l+8|0;j=l+1|0;if(r>>>0<e>>>0){q=0;s=0;t=r;while(1){u=a[((a[l>>0]&1)==0?j:c[n>>2]|0)+s>>0]|0;if(u<<24>>24!=0&(q|0)==(u<<24>>24|0)){u=c[h>>2]|0;c[h>>2]=u+1;a[u>>0]=p;u=a[l>>0]|0;v=0;w=(s>>>0<(((u&1)==0?(u&255)>>>1:c[o>>2]|0)+-1|0)>>>0&1)+s|0}else{v=q;w=s}u=Nf[c[(c[m>>2]|0)+28>>2]&31](m,a[t>>0]|0)|0;x=c[h>>2]|0;c[h>>2]=x+1;a[x>>0]=u;t=t+1|0;if(t>>>0>=e>>>0)break;else{q=v+1|0;s=w}}}w=b;s=f+(r-w)|0;r=c[h>>2]|0;if((s|0)==(r|0)){y=w;z=s}else{v=r+-1|0;if(s>>>0<v>>>0){r=s;s=v;do{v=a[r>>0]|0;a[r>>0]=a[s>>0]|0;a[s>>0]=v;r=r+1|0;s=s+-1|0}while(r>>>0<s>>>0)}y=w;z=c[h>>2]|0}}else{Pf[c[(c[m>>2]|0)+32>>2]&15](m,b,e,f)|0;m=b;b=f+(e-m)|0;c[h>>2]=b;y=m;z=b}c[g>>2]=(d|0)==(e|0)?z:f+(d-y)|0;Au(l);i=k;return}function Fi(a){a=a|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;e=c[a+24>>2]|0;f=c[a+28>>2]|0;g=c[a+16>>2]|0;h=c[a+36>>2]|0;i=c[a+48>>2]|0;if(!f)return;j=(e+7|0)/8|0;k=e&7;e=f;f=c[a+20>>2]|0;l=c[a>>2]|0;a:while(1){a=e+-1|0;switch(k|0){case 0:{m=f;n=j;o=l;p=4;break}case 7:{q=f;r=j;s=l;p=5;break}case 6:{t=f;u=j;v=l;p=6;break}case 5:{w=f;x=j;y=l;p=7;break}case 4:{z=f;A=j;B=l;p=8;break}case 3:{C=f;D=j;E=l;p=9;break}case 2:{F=f;G=j;H=l;p=10;break}case 1:{I=f;J=j;K=l;p=11;break}default:{L=f;M=l;p=12}}while(1)if((p|0)==4){p=0;b[m>>1]=b[i+((d[o>>0]|0)<<1)>>1]|0;q=m+2|0;r=n;s=o+1|0;p=5;continue}else if((p|0)==5){p=0;b[q>>1]=b[i+((d[s>>0]|0)<<1)>>1]|0;t=q+2|0;u=r;v=s+1|0;p=6;continue}else if((p|0)==6){p=0;b[t>>1]=b[i+((d[v>>0]|0)<<1)>>1]|0;w=t+2|0;x=u;y=v+1|0;p=7;continue}else if((p|0)==7){p=0;b[w>>1]=b[i+((d[y>>0]|0)<<1)>>1]|0;z=w+2|0;A=x;B=y+1|0;p=8;continue}else if((p|0)==8){p=0;b[z>>1]=b[i+((d[B>>0]|0)<<1)>>1]|0;C=z+2|0;D=A;E=B+1|0;p=9;continue}else if((p|0)==9){p=0;b[C>>1]=b[i+((d[E>>0]|0)<<1)>>1]|0;F=C+2|0;G=D;H=E+1|0;p=10;continue}else if((p|0)==10){p=0;b[F>>1]=b[i+((d[H>>0]|0)<<1)>>1]|0;I=F+2|0;J=G;K=H+1|0;p=11;continue}else if((p|0)==11){p=0;N=K+1|0;b[I>>1]=b[i+((d[K>>0]|0)<<1)>>1]|0;O=I+2|0;if((J|0)>1){m=O;n=J+-1|0;o=N;p=4;continue}else{L=O;M=N;p=12;continue}}else if((p|0)==12){p=0;if(!a)break a;else{e=a;f=L+h|0;l=M+g|0;continue a}}}return}function Hh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;b=i;i=i+240|0;k=b+24|0;l=b;m=b+136|0;n=b+16|0;o=b+12|0;p=b+8|0;q=b+134|0;r=b+4|0;s=b+124|0;c[n>>2]=m;t=n+4|0;c[t>>2]=300;c[p>>2]=Hs(g)|0;u=Ds(p,18276)|0;a[q>>0]=0;c[r>>2]=c[e>>2];v=c[g+4>>2]|0;c[k>>2]=c[r>>2];if(eg(d,k,f,p,v,h,q,u,n,o,m+100|0)|0){Pf[c[(c[u>>2]|0)+32>>2]&15](u,33762,33772,s)|0;u=c[o>>2]|0;m=c[n>>2]|0;v=u-m|0;if((v|0)>98){f=_f(v+2|0)|0;if(!f)Iv();else{w=f;x=f}}else{w=0;x=k}if(!(a[q>>0]|0))y=x;else{a[x>>0]=45;y=x+1|0}x=s+10|0;q=s;if(m>>>0<u>>>0){u=s+1|0;f=u+1|0;v=f+1|0;r=v+1|0;g=r+1|0;z=g+1|0;A=z+1|0;B=A+1|0;C=B+1|0;D=y;E=m;while(1){m=a[E>>0]|0;if((a[s>>0]|0)!=m<<24>>24)if((a[u>>0]|0)!=m<<24>>24)if((a[f>>0]|0)!=m<<24>>24)if((a[v>>0]|0)!=m<<24>>24)if((a[r>>0]|0)!=m<<24>>24)if((a[g>>0]|0)!=m<<24>>24)if((a[z>>0]|0)!=m<<24>>24)if((a[A>>0]|0)!=m<<24>>24)if((a[B>>0]|0)==m<<24>>24)F=B;else F=(a[C>>0]|0)==m<<24>>24?C:x;else F=A;else F=z;else F=g;else F=r;else F=v;else F=f;else F=u;else F=s;a[D>>0]=a[33762+(F-q)>>0]|0;E=E+1|0;m=D+1|0;if(E>>>0>=(c[o>>2]|0)>>>0){G=m;break}else D=m}}else G=y;a[G>>0]=0;c[l>>2]=j;zs(k,33773,l)|0;if(w)yg(w)}w=c[d>>2]|0;do if(w)if((c[w+12>>2]|0)==(c[w+16>>2]|0))if((Af[c[(c[w>>2]|0)+36>>2]&127](w)|0)==-1){c[d>>2]=0;H=0;break}else{H=c[d>>2]|0;break}else H=w;else H=0;while(0);w=(H|0)==0;H=c[e>>2]|0;do if(H){if((c[H+12>>2]|0)==(c[H+16>>2]|0)?(Af[c[(c[H>>2]|0)+36>>2]&127](H)|0)==-1:0){c[e>>2]=0;I=25;break}if(!w)I=26}else I=25;while(0);if((I|0)==25?w:0)I=26;if((I|0)==26)c[h>>2]=c[h>>2]|2;h=c[d>>2]|0;lr(c[p>>2]|0)|0;p=c[n>>2]|0;c[n>>2]=0;if(p)xf[c[t>>2]&511](p);i=b;return h|0}function xi(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;e=i;i=i+32|0;f=e+16|0;g=e+12|0;h=e+8|0;j=e+4|0;k=e;if(!(Ii(d,f,g,h,j,k)|0)){l=-1;i=e;return l|0}Fw(b,0,44)|0;c[b>>2]=d;d=c[f>>2]|0;a[b+8>>0]=d;a[b+9>>0]=(d+7|0)/8|0;d=c[g>>2]|0;c[b+12>>2]=d;g=b+32|0;a[g>>0]=0;f=b+28|0;a[f>>0]=8;if(d){if(!(d&1)){m=0;n=d;while(1){o=m+1<<24>>24;p=n>>>1;if(!(p&1)){m=o;n=p}else{q=o;r=p;break}}a[g>>0]=q;s=r}else s=d;if(s&1){d=8;r=s;while(1){s=d+-1<<24>>24;r=r>>>1;if(!(r&1)){t=s;break}else d=s}a[f>>0]=t}}t=c[h>>2]|0;c[b+16>>2]=t;h=b+33|0;a[h>>0]=0;f=b+29|0;a[f>>0]=8;if(t){if(!(t&1)){d=0;r=t;while(1){s=d+1<<24>>24;q=r>>>1;if(!(q&1)){d=s;r=q}else{u=s;v=q;break}}a[h>>0]=u;w=v}else w=t;if(w&1){t=8;v=w;while(1){w=t+-1<<24>>24;v=v>>>1;if(!(v&1)){x=w;break}else t=w}a[f>>0]=x}}x=c[j>>2]|0;c[b+20>>2]=x;j=b+34|0;a[j>>0]=0;f=b+30|0;a[f>>0]=8;if(x){if(!(x&1)){t=0;v=x;while(1){w=t+1<<24>>24;u=v>>>1;if(!(u&1)){t=w;v=u}else{y=w;z=u;break}}a[j>>0]=y;A=z}else A=x;if(A&1){x=8;z=A;while(1){A=x+-1<<24>>24;z=z>>>1;if(!(z&1)){B=A;break}else x=A}a[f>>0]=B}}B=c[k>>2]|0;c[b+24>>2]=B;k=b+35|0;a[k>>0]=0;f=b+31|0;a[f>>0]=8;if(B){if(!(B&1)){x=0;z=B;while(1){A=x+1<<24>>24;y=z>>>1;if(!(y&1)){x=A;z=y}else{C=A;D=y;break}}a[k>>0]=C;E=D}else E=B;if(E&1){B=8;D=E;while(1){E=B+-1<<24>>24;D=D>>>1;if(!(D&1)){F=E;break}else B=E}a[f>>0]=F}}c[b+4>>2]=0;c[b+36>>2]=1;c[b+40>>2]=0;l=0;i=e;return l|0}function si(f,g){f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;h=i;i=i+16|0;j=h;k=c[f>>2]|0;if(!(k&2)){i=h;return}c[f>>2]=k&-3;l=f+52|0;a:do if((g|0)!=0&(k&1|0)==0){m=c[l>>2]|0;if(c[m+68>>2]&8192){n=f+12|0;o=iB(ca(c[f+16>>2]|0,c[n>>2]|0)|0)|0;c[f+20>>2]=o;if(o){Ag(f,0,c[(c[l>>2]|0)+72>>2]|0)|0;c[j+4>>2]=0;c[j>>2]=0;c[j+8>>2]=c[f+8>>2];c[j+12>>2]=c[n>>2];Xf(f,j,f,j)|0;break}c[f>>2]=c[f>>2]|2;i=h;return}n=c[f+4>>2]|0;o=c[m+12>>2]|0;m=c[f+8>>2]|0;p=(a[o>>0]|0)==2;q=p?26:25;r=p?27:25;s=f+12|0;t=f+16|0;u=iB(ca(c[t>>2]|0,c[s>>2]|0)|0)|0;v=f+20|0;c[v>>2]=u;if(!u){c[f>>2]=c[f>>2]|2;i=h;return}Fw(u,0,ca(c[t>>2]|0,c[s>>2]|0)|0)|0;s=c[v>>2]|0;v=o+28|0;while(1){if(p){u=0;w=v;while(1){x=a[w+1>>0]|0;y=x&255;z=w+2|0;A=(d[w>>0]|0)+u|0;if(!(x<<24>>24))if(!A)break a;else{B=A;C=z}else{B=A+y|0;C=w+((Cf[q&31](s+(A<<2)|0,z,y,o,n)|0)+2)|0}if((B|0)<(m|0)){u=B;w=C}else{D=C;break}}}else{w=0;u=v;while(1){y=b[u+2>>1]|0;z=y&65535;A=u+4|0;x=(e[u>>1]|0)+w|0;if(!(y<<16>>16))if(!x)break a;else{E=x;F=A}else{E=x+z|0;F=u+((Cf[q&31](s+(x<<2)|0,A,z,o,n)|0)+4)|0}if((E|0)<(m|0)){w=E;u=F}else{D=F;break}}}u=0;w=p?D+(D&2)|0:D;while(1){z=(e[w>>1]|0)+u|0;A=b[w+2>>1]|0;x=A&65535;y=w+4|0;if(!(A<<16>>16)){G=z;H=y}else{G=z+x|0;H=w+((Cf[r&31](s+(z<<2)|0,y,x,o,n)|0)+4)|0}if((G|0)<(m|0)){u=G;w=H}else{I=H;break}}s=s+(c[t>>2]>>2<<2)|0;v=I}}while(0);I=c[l>>2]|0;H=I+68|0;c[H>>2]=c[H>>2]&-24577;qB(c[I+12>>2]|0);c[(c[l>>2]|0)+12>>2]=0;i=h;return}function Gi(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;b=c[a+24>>2]|0;e=c[a+28>>2]|0;f=c[a+16>>2]|0;g=(c[a+36>>2]|0)/4|0;h=c[a+48>>2]|0;if(!e)return;i=(b+7|0)/8|0;j=b&7;b=e;e=c[a+20>>2]|0;k=c[a>>2]|0;a:while(1){a=b+-1|0;switch(j|0){case 0:{l=e;m=i;n=k;o=4;break}case 7:{p=e;q=i;r=k;o=5;break}case 6:{s=e;t=i;u=k;o=6;break}case 5:{v=e;w=i;x=k;o=7;break}case 4:{y=e;z=i;A=k;o=8;break}case 3:{B=e;C=i;D=k;o=9;break}case 2:{E=e;F=i;G=k;o=10;break}case 1:{H=e;I=i;J=k;o=11;break}default:{K=e;L=k;o=12}}while(1)if((o|0)==4){o=0;c[l>>2]=c[h+((d[n>>0]|0)<<2)>>2];p=l+4|0;q=m;r=n+1|0;o=5;continue}else if((o|0)==5){o=0;c[p>>2]=c[h+((d[r>>0]|0)<<2)>>2];s=p+4|0;t=q;u=r+1|0;o=6;continue}else if((o|0)==6){o=0;c[s>>2]=c[h+((d[u>>0]|0)<<2)>>2];v=s+4|0;w=t;x=u+1|0;o=7;continue}else if((o|0)==7){o=0;c[v>>2]=c[h+((d[x>>0]|0)<<2)>>2];y=v+4|0;z=w;A=x+1|0;o=8;continue}else if((o|0)==8){o=0;c[y>>2]=c[h+((d[A>>0]|0)<<2)>>2];B=y+4|0;C=z;D=A+1|0;o=9;continue}else if((o|0)==9){o=0;c[B>>2]=c[h+((d[D>>0]|0)<<2)>>2];E=B+4|0;F=C;G=D+1|0;o=10;continue}else if((o|0)==10){o=0;c[E>>2]=c[h+((d[G>>0]|0)<<2)>>2];H=E+4|0;I=F;J=G+1|0;o=11;continue}else if((o|0)==11){o=0;M=J+1|0;N=H+4|0;c[H>>2]=c[h+((d[J>>0]|0)<<2)>>2];if((I|0)>1){l=N;m=I+-1|0;n=M;o=4;continue}else{K=N;L=M;o=12;continue}}else if((o|0)==12){o=0;if(!a)break a;else{b=a;e=K+(g<<2)|0;k=L+f|0;continue a}}}return}function Ii(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;h=i;i=i+32|0;j=h+16|0;k=h+8|0;if(!((a|0)==0|(a&-268435456|0)==268435456)){Cj(23948,h)|0;l=0;i=h;return l|0}c[b>>2]=(a&255)>>>0<3?a>>>8&255:a<<3&2040;c[g>>2]=0;c[f>>2]=0;c[e>>2]=0;c[d>>2]=0;a:do if((a|0)<390076419){switch(a|0){case 386930691:break;default:break a}c[d>>2]=255;c[e>>2]=65280;c[f>>2]=16711680;l=1;i=h;return l|0}else{switch(a|0){case 390076419:break;default:break a}c[d>>2]=16711680;c[e>>2]=65280;c[f>>2]=255;l=1;i=h;return l|0}while(0);if(((a>>>24&15)+-4|0)>>>0>=3){l=1;i=h;return l|0}switch(a>>>16&15|0){case 1:{m=0;n=224;o=28;p=3;break}case 2:{m=61440;n=3840;o=240;p=15;break}case 3:{m=32768;n=31744;o=992;p=31;break}case 4:{m=63488;n=1984;o=62;p=1;break}case 5:{m=0;n=63488;o=2016;p=31;break}case 6:{m=-16777216;n=16711680;o=65280;p=255;break}case 7:{m=-1073741824;n=1072693248;o=1047552;p=1023;break}case 8:{m=-4194304;n=4190208;o=4092;p=3;break}default:{Cj(24143,k)|0;l=0;i=h;return l|0}}switch(a>>>20&15|0){case 1:{c[d>>2]=n;c[e>>2]=o;c[f>>2]=p;l=1;i=h;return l|0}case 2:{c[d>>2]=m;c[e>>2]=n;c[f>>2]=o;l=1;i=h;return l|0}case 3:{c[g>>2]=m;c[d>>2]=n;c[e>>2]=o;c[f>>2]=p;l=1;i=h;return l|0}case 4:{c[d>>2]=m;c[e>>2]=n;c[f>>2]=o;c[g>>2]=p;l=1;i=h;return l|0}case 5:{c[f>>2]=n;c[e>>2]=o;c[d>>2]=p;l=1;i=h;return l|0}case 6:{c[f>>2]=m;c[e>>2]=n;c[d>>2]=o;l=1;i=h;return l|0}case 8:{c[f>>2]=m;c[e>>2]=n;c[d>>2]=o;c[g>>2]=p;l=1;i=h;return l|0}case 7:{c[g>>2]=m;c[f>>2]=n;c[e>>2]=o;c[d>>2]=p;l=1;i=h;return l|0}default:{Cj(24143,j)|0;l=0;i=h;return l|0}}return 0}function Qi(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=(c[a+8>>2]<<16|0)/(e|0)|0;g=a+24|0;h=c[g>>2]|0;i=(c[a+4>>2]<<16|0)/(h|0)|0;j=e+-1|0;c[d>>2]=j;if(!e)return;e=a+20|0;k=a+32|0;l=(b&48|0)!=0;m=b&112;b=a+12|0;n=c[e>>2]|0;o=j;j=n;p=h;h=n;n=0;q=0;while(1){if((n|0)>65535){r=n+-65536|0;s=r>>>16;t=r-(s<<16)|0;u=q+1+s|0}else{t=n;u=q}if(!p)v=o;else{s=p;r=j;w=65536;x=0;y=-1;while(1){s=s+-1|0;if((w|0)>65535){z=w+-65536|0;A=z>>>16;B=y+1+A|0;C=z-(A<<16)|0;D=(c[a>>2]|0)+((ca(c[b>>2]|0,u)|0)+(B<<2))|0;E=B}else{C=w;D=x;E=y}B=c[D>>2]|0;A=B>>>16&255;z=B>>>8&255;F=B&255;G=B>>>24;B=c[r>>2]|0;H=B>>>16&255;I=B>>>8&255;J=B&255;if(l&(G|0)!=255){K=((ca(A,G)|0)>>>0)/255|0;L=((ca(z,G)|0)>>>0)/255|0;M=((ca(F,G)|0)>>>0)/255|0}else{K=A;L=z;M=F}switch(m|0){case 16:{F=G^255;N=(((ca(H,F)|0)>>>0)/255|0)+K|0;O=(((ca(I,F)|0)>>>0)/255|0)+L|0;P=(((ca(F,J)|0)>>>0)/255|0)+M|0;break}case 32:{F=M+J|0;G=L+I|0;z=K+H|0;N=z>>>0>255?255:z;O=G>>>0>255?255:G;P=F>>>0>255?255:F;break}case 64:{N=((ca(K,H)|0)>>>0)/255|0;O=((ca(L,I)|0)>>>0)/255|0;P=((ca(M,J)|0)>>>0)/255|0;break}default:{N=H;O=I;P=J}}c[r>>2]=O<<8|P|N<<16;if(!s)break;else{r=r+4|0;w=C+i|0;x=D;y=E}}v=c[d>>2]|0}y=h+(c[k>>2]|0)|0;x=v+-1|0;c[d>>2]=x;if(!v){Q=y;break}o=x;j=y;p=c[g>>2]|0;h=y;n=t+f|0;q=u}c[e>>2]=Q;return}function Pi(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=(c[a+8>>2]<<16|0)/(e|0)|0;g=a+24|0;h=c[g>>2]|0;i=(c[a+4>>2]<<16|0)/(h|0)|0;j=e+-1|0;c[d>>2]=j;if(!e)return;e=a+20|0;k=a+32|0;l=(b&48|0)!=0;m=b&112;b=a+12|0;n=c[e>>2]|0;o=j;j=n;p=h;h=n;n=0;q=0;while(1){if((n|0)>65535){r=n+-65536|0;s=r>>>16;t=r-(s<<16)|0;u=q+1+s|0}else{t=n;u=q}if(!p)v=o;else{s=p;r=j;w=65536;x=0;y=-1;while(1){s=s+-1|0;if((w|0)>65535){z=w+-65536|0;A=z>>>16;B=y+1+A|0;C=z-(A<<16)|0;D=(c[a>>2]|0)+((ca(c[b>>2]|0,u)|0)+(B<<2))|0;E=B}else{C=w;D=x;E=y}B=c[D>>2]|0;A=B>>>16&255;z=B>>>8&255;F=B&255;G=B>>>24;B=c[r>>2]|0;H=B>>>16&255;I=B>>>8&255;J=B&255;if(l&(G|0)!=255){K=((ca(A,G)|0)>>>0)/255|0;L=((ca(z,G)|0)>>>0)/255|0;M=((ca(F,G)|0)>>>0)/255|0}else{K=A;L=z;M=F}switch(m|0){case 16:{F=G^255;N=(((ca(F,J)|0)>>>0)/255|0)+K|0;O=(((ca(I,F)|0)>>>0)/255|0)+L|0;P=(((ca(H,F)|0)>>>0)/255|0)+M|0;break}case 32:{F=M+H|0;G=L+I|0;z=K+J|0;N=z>>>0>255?255:z;O=G>>>0>255?255:G;P=F>>>0>255?255:F;break}case 64:{N=((ca(K,J)|0)>>>0)/255|0;O=((ca(L,I)|0)>>>0)/255|0;P=((ca(M,H)|0)>>>0)/255|0;break}default:{N=J;O=I;P=H}}c[r>>2]=O<<8|P<<16|N;if(!s)break;else{r=r+4|0;w=C+i|0;x=D;y=E}}v=c[d>>2]|0}y=h+(c[k>>2]|0)|0;x=v+-1|0;c[d>>2]=x;if(!v){Q=y;break}o=x;j=y;p=c[g>>2]|0;h=y;n=t+f|0;q=u}c[e>>2]=Q;return}function Oi(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=(c[a+8>>2]<<16|0)/(e|0)|0;g=a+24|0;h=c[g>>2]|0;i=(c[a+4>>2]<<16|0)/(h|0)|0;j=e+-1|0;c[d>>2]=j;if(!e)return;e=a+20|0;k=a+32|0;l=(b&48|0)!=0;m=b&112;b=a+12|0;n=c[e>>2]|0;o=j;j=n;p=h;h=n;n=0;q=0;while(1){if((n|0)>65535){r=n+-65536|0;s=r>>>16;t=r-(s<<16)|0;u=q+1+s|0}else{t=n;u=q}if(!p)v=o;else{s=p;r=j;w=65536;x=0;y=-1;while(1){s=s+-1|0;if((w|0)>65535){z=w+-65536|0;A=z>>>16;B=y+1+A|0;C=z-(A<<16)|0;D=(c[a>>2]|0)+((ca(c[b>>2]|0,u)|0)+(B<<2))|0;E=B}else{C=w;D=x;E=y}B=c[D>>2]|0;A=B>>>16&255;z=B>>>8&255;F=B&255;G=B>>>24;B=c[r>>2]|0;H=B>>>16&255;I=B>>>8&255;J=B&255;if(l&(G|0)!=255){K=((ca(F,G)|0)>>>0)/255|0;L=((ca(z,G)|0)>>>0)/255|0;M=((ca(A,G)|0)>>>0)/255|0}else{K=F;L=z;M=A}switch(m|0){case 16:{A=G^255;N=(((ca(H,A)|0)>>>0)/255|0)+K|0;O=(((ca(I,A)|0)>>>0)/255|0)+L|0;P=(((ca(A,J)|0)>>>0)/255|0)+M|0;break}case 32:{A=M+J|0;G=L+I|0;z=K+H|0;N=z>>>0>255?255:z;O=G>>>0>255?255:G;P=A>>>0>255?255:A;break}case 64:{N=((ca(K,H)|0)>>>0)/255|0;O=((ca(L,I)|0)>>>0)/255|0;P=((ca(M,J)|0)>>>0)/255|0;break}default:{N=H;O=I;P=J}}c[r>>2]=O<<8|P|N<<16;if(!s)break;else{r=r+4|0;w=C+i|0;x=D;y=E}}v=c[d>>2]|0}y=h+(c[k>>2]|0)|0;x=v+-1|0;c[d>>2]=x;if(!v){Q=y;break}o=x;j=y;p=c[g>>2]|0;h=y;n=t+f|0;q=u}c[e>>2]=Q;return}function Ni(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=(c[a+8>>2]<<16|0)/(e|0)|0;g=a+24|0;h=c[g>>2]|0;i=(c[a+4>>2]<<16|0)/(h|0)|0;j=e+-1|0;c[d>>2]=j;if(!e)return;e=a+20|0;k=a+32|0;l=(b&48|0)!=0;m=b&112;b=a+12|0;n=c[e>>2]|0;o=j;j=n;p=h;h=n;n=0;q=0;while(1){if((n|0)>65535){r=n+-65536|0;s=r>>>16;t=r-(s<<16)|0;u=q+1+s|0}else{t=n;u=q}if(!p)v=o;else{s=p;r=j;w=65536;x=0;y=-1;while(1){s=s+-1|0;if((w|0)>65535){z=w+-65536|0;A=z>>>16;B=y+1+A|0;C=z-(A<<16)|0;D=(c[a>>2]|0)+((ca(c[b>>2]|0,u)|0)+(B<<2))|0;E=B}else{C=w;D=x;E=y}B=c[D>>2]|0;A=B>>>16&255;z=B>>>8&255;F=B&255;G=B>>>24;B=c[r>>2]|0;H=B>>>16&255;I=B>>>8&255;J=B&255;if(l&(G|0)!=255){K=((ca(F,G)|0)>>>0)/255|0;L=((ca(z,G)|0)>>>0)/255|0;M=((ca(A,G)|0)>>>0)/255|0}else{K=F;L=z;M=A}switch(m|0){case 16:{A=G^255;N=(((ca(A,J)|0)>>>0)/255|0)+K|0;O=(((ca(I,A)|0)>>>0)/255|0)+L|0;P=(((ca(H,A)|0)>>>0)/255|0)+M|0;break}case 32:{A=M+H|0;G=L+I|0;z=K+J|0;N=z>>>0>255?255:z;O=G>>>0>255?255:G;P=A>>>0>255?255:A;break}case 64:{N=((ca(K,J)|0)>>>0)/255|0;O=((ca(L,I)|0)>>>0)/255|0;P=((ca(M,H)|0)>>>0)/255|0;break}default:{N=J;O=I;P=H}}c[r>>2]=O<<8|P<<16|N;if(!s)break;else{r=r+4|0;w=C+i|0;x=D;y=E}}v=c[d>>2]|0}y=h+(c[k>>2]|0)|0;x=v+-1|0;c[d>>2]=x;if(!v){Q=y;break}o=x;j=y;p=c[g>>2]|0;h=y;n=t+f|0;q=u}c[e>>2]=Q;return}function Mi(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=(c[a+8>>2]<<16|0)/(e|0)|0;g=a+24|0;h=c[g>>2]|0;i=(c[a+4>>2]<<16|0)/(h|0)|0;j=e+-1|0;c[d>>2]=j;if(!e)return;e=a+20|0;k=a+32|0;l=(b&48|0)!=0;m=b&112;b=a+12|0;n=c[e>>2]|0;o=j;j=n;p=h;h=n;n=0;q=0;while(1){if((n|0)>65535){r=n+-65536|0;s=r>>>16;t=r-(s<<16)|0;u=q+1+s|0}else{t=n;u=q}if(!p)v=o;else{s=p;r=j;w=65536;x=0;y=-1;while(1){s=s+-1|0;if((w|0)>65535){z=w+-65536|0;A=z>>>16;B=y+1+A|0;C=z-(A<<16)|0;D=(c[a>>2]|0)+((ca(c[b>>2]|0,u)|0)+(B<<2))|0;E=B}else{C=w;D=x;E=y}B=c[D>>2]|0;A=B>>>24;z=B>>>16&255;F=B>>>8&255;G=B&255;B=c[r>>2]|0;H=B>>>16&255;I=B>>>8&255;J=B&255;if(l&(G|0)!=255){K=((ca(A,G)|0)>>>0)/255|0;L=((ca(z,G)|0)>>>0)/255|0;M=((ca(F,G)|0)>>>0)/255|0}else{K=A;L=z;M=F}switch(m|0){case 16:{F=G^255;N=(((ca(H,F)|0)>>>0)/255|0)+K|0;O=(((ca(I,F)|0)>>>0)/255|0)+L|0;P=(((ca(F,J)|0)>>>0)/255|0)+M|0;break}case 32:{F=M+J|0;G=L+I|0;z=K+H|0;N=z>>>0>255?255:z;O=G>>>0>255?255:G;P=F>>>0>255?255:F;break}case 64:{N=((ca(K,H)|0)>>>0)/255|0;O=((ca(L,I)|0)>>>0)/255|0;P=((ca(M,J)|0)>>>0)/255|0;break}default:{N=H;O=I;P=J}}c[r>>2]=O<<8|P|N<<16;if(!s)break;else{r=r+4|0;w=C+i|0;x=D;y=E}}v=c[d>>2]|0}y=h+(c[k>>2]|0)|0;x=v+-1|0;c[d>>2]=x;if(!v){Q=y;break}o=x;j=y;p=c[g>>2]|0;h=y;n=t+f|0;q=u}c[e>>2]=Q;return}function Li(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=(c[a+8>>2]<<16|0)/(e|0)|0;g=a+24|0;h=c[g>>2]|0;i=(c[a+4>>2]<<16|0)/(h|0)|0;j=e+-1|0;c[d>>2]=j;if(!e)return;e=a+20|0;k=a+32|0;l=(b&48|0)!=0;m=b&112;b=a+12|0;n=c[e>>2]|0;o=j;j=n;p=h;h=n;n=0;q=0;while(1){if((n|0)>65535){r=n+-65536|0;s=r>>>16;t=r-(s<<16)|0;u=q+1+s|0}else{t=n;u=q}if(!p)v=o;else{s=p;r=j;w=65536;x=0;y=-1;while(1){s=s+-1|0;if((w|0)>65535){z=w+-65536|0;A=z>>>16;B=y+1+A|0;C=z-(A<<16)|0;D=(c[a>>2]|0)+((ca(c[b>>2]|0,u)|0)+(B<<2))|0;E=B}else{C=w;D=x;E=y}B=c[D>>2]|0;A=B>>>24;z=B>>>16&255;F=B>>>8&255;G=B&255;B=c[r>>2]|0;H=B>>>16&255;I=B>>>8&255;J=B&255;if(l&(G|0)!=255){K=((ca(A,G)|0)>>>0)/255|0;L=((ca(z,G)|0)>>>0)/255|0;M=((ca(F,G)|0)>>>0)/255|0}else{K=A;L=z;M=F}switch(m|0){case 16:{F=G^255;N=(((ca(F,J)|0)>>>0)/255|0)+K|0;O=(((ca(I,F)|0)>>>0)/255|0)+L|0;P=(((ca(H,F)|0)>>>0)/255|0)+M|0;break}case 32:{F=M+H|0;G=L+I|0;z=K+J|0;N=z>>>0>255?255:z;O=G>>>0>255?255:G;P=F>>>0>255?255:F;break}case 64:{N=((ca(K,J)|0)>>>0)/255|0;O=((ca(L,I)|0)>>>0)/255|0;P=((ca(M,H)|0)>>>0)/255|0;break}default:{N=J;O=I;P=H}}c[r>>2]=O<<8|P<<16|N;if(!s)break;else{r=r+4|0;w=C+i|0;x=D;y=E}}v=c[d>>2]|0}y=h+(c[k>>2]|0)|0;x=v+-1|0;c[d>>2]=x;if(!v){Q=y;break}o=x;j=y;p=c[g>>2]|0;h=y;n=t+f|0;q=u}c[e>>2]=Q;return}function Ki(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=(c[a+8>>2]<<16|0)/(e|0)|0;g=a+24|0;h=c[g>>2]|0;i=(c[a+4>>2]<<16|0)/(h|0)|0;j=e+-1|0;c[d>>2]=j;if(!e)return;e=a+20|0;k=a+32|0;l=(b&48|0)!=0;m=b&112;b=a+12|0;n=c[e>>2]|0;o=j;j=n;p=h;h=n;n=0;q=0;while(1){if((n|0)>65535){r=n+-65536|0;s=r>>>16;t=r-(s<<16)|0;u=q+1+s|0}else{t=n;u=q}if(!p)v=o;else{s=p;r=j;w=65536;x=0;y=-1;while(1){s=s+-1|0;if((w|0)>65535){z=w+-65536|0;A=z>>>16;B=y+1+A|0;C=z-(A<<16)|0;D=(c[a>>2]|0)+((ca(c[b>>2]|0,u)|0)+(B<<2))|0;E=B}else{C=w;D=x;E=y}B=c[D>>2]|0;A=B>>>24;z=B>>>16&255;F=B>>>8&255;G=B&255;B=c[r>>2]|0;H=B>>>16&255;I=B>>>8&255;J=B&255;if(l&(G|0)!=255){K=((ca(F,G)|0)>>>0)/255|0;L=((ca(z,G)|0)>>>0)/255|0;M=((ca(A,G)|0)>>>0)/255|0}else{K=F;L=z;M=A}switch(m|0){case 16:{A=G^255;N=(((ca(H,A)|0)>>>0)/255|0)+K|0;O=(((ca(I,A)|0)>>>0)/255|0)+L|0;P=(((ca(A,J)|0)>>>0)/255|0)+M|0;break}case 32:{A=M+J|0;G=L+I|0;z=K+H|0;N=z>>>0>255?255:z;O=G>>>0>255?255:G;P=A>>>0>255?255:A;break}case 64:{N=((ca(K,H)|0)>>>0)/255|0;O=((ca(L,I)|0)>>>0)/255|0;P=((ca(M,J)|0)>>>0)/255|0;break}default:{N=H;O=I;P=J}}c[r>>2]=O<<8|P|N<<16;if(!s)break;else{r=r+4|0;w=C+i|0;x=D;y=E}}v=c[d>>2]|0}y=h+(c[k>>2]|0)|0;x=v+-1|0;c[d>>2]=x;if(!v){Q=y;break}o=x;j=y;p=c[g>>2]|0;h=y;n=t+f|0;q=u}c[e>>2]=Q;return}function Ji(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=(c[a+8>>2]<<16|0)/(e|0)|0;g=a+24|0;h=c[g>>2]|0;i=(c[a+4>>2]<<16|0)/(h|0)|0;j=e+-1|0;c[d>>2]=j;if(!e)return;e=a+20|0;k=a+32|0;l=(b&48|0)!=0;m=b&112;b=a+12|0;n=c[e>>2]|0;o=j;j=n;p=h;h=n;n=0;q=0;while(1){if((n|0)>65535){r=n+-65536|0;s=r>>>16;t=r-(s<<16)|0;u=q+1+s|0}else{t=n;u=q}if(!p)v=o;else{s=p;r=j;w=65536;x=0;y=-1;while(1){s=s+-1|0;if((w|0)>65535){z=w+-65536|0;A=z>>>16;B=y+1+A|0;C=z-(A<<16)|0;D=(c[a>>2]|0)+((ca(c[b>>2]|0,u)|0)+(B<<2))|0;E=B}else{C=w;D=x;E=y}B=c[D>>2]|0;A=B>>>24;z=B>>>16&255;F=B>>>8&255;G=B&255;B=c[r>>2]|0;H=B>>>16&255;I=B>>>8&255;J=B&255;if(l&(G|0)!=255){K=((ca(F,G)|0)>>>0)/255|0;L=((ca(z,G)|0)>>>0)/255|0;M=((ca(A,G)|0)>>>0)/255|0}else{K=F;L=z;M=A}switch(m|0){case 16:{A=G^255;N=(((ca(A,J)|0)>>>0)/255|0)+K|0;O=(((ca(I,A)|0)>>>0)/255|0)+L|0;P=(((ca(H,A)|0)>>>0)/255|0)+M|0;break}case 32:{A=M+H|0;G=L+I|0;z=K+J|0;N=z>>>0>255?255:z;O=G>>>0>255?255:G;P=A>>>0>255?255:A;break}case 64:{N=((ca(K,J)|0)>>>0)/255|0;O=((ca(L,I)|0)>>>0)/255|0;P=((ca(M,H)|0)>>>0)/255|0;break}default:{N=J;O=I;P=H}}c[r>>2]=O<<8|P<<16|N;if(!s)break;else{r=r+4|0;w=C+i|0;x=D;y=E}}v=c[d>>2]|0}y=h+(c[k>>2]|0)|0;x=v+-1|0;c[d>>2]=x;if(!v){Q=y;break}o=x;j=y;p=c[g>>2]|0;h=y;n=t+f|0;q=u}c[e>>2]=Q;return}function Vi(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=d[a+63>>0]|0;i=a+28|0;j=c[i>>2]|0;k=j+-1|0;c[i>>2]=k;if(!j)return;j=a+20|0;l=a+24|0;m=a+12|0;n=a+32|0;o=(b&1|0)==0;p=(b&2|0)==0;q=(b&48|0)!=0;r=b&112;b=k;do{k=c[l>>2]|0;if(!k){s=c[j>>2]|0;t=b;u=c[a>>2]|0}else{v=c[j>>2]|0;w=c[a>>2]|0;x=k;k=v;y=w;while(1){x=x+-1|0;z=c[y>>2]|0;A=z>>>16&255;B=z>>>8&255;C=z&255;D=z>>>24;z=c[k>>2]|0;E=z>>>16&255;F=z>>>8&255;G=z&255;H=z>>>24;if(o){I=A;J=B;K=C}else{I=((ca(A,g)|0)>>>0)/255|0;J=((ca(B,f)|0)>>>0)/255|0;K=((ca(C,e)|0)>>>0)/255|0}C=((ca(D,h)|0)>>>0)/255|0;B=p?D:C;if(q&B>>>0<255){L=((ca(B,I)|0)>>>0)/255|0;M=((ca(B,J)|0)>>>0)/255|0;N=((ca(B,K)|0)>>>0)/255|0}else{L=I;M=J;N=K}switch(r|0){case 16:{C=255-B|0;O=(((ca(C,H)|0)>>>0)/255|0)+B|0;P=(((ca(C,G)|0)>>>0)/255|0)+L|0;Q=(((ca(C,F)|0)>>>0)/255|0)+M|0;R=(((ca(C,E)|0)>>>0)/255|0)+N|0;break}case 32:{C=N+E|0;B=M+F|0;D=L+G|0;O=H;P=D>>>0>255?255:D;Q=B>>>0>255?255:B;R=C>>>0>255?255:C;break}case 64:{O=H;P=((ca(L,G)|0)>>>0)/255|0;Q=((ca(M,F)|0)>>>0)/255|0;R=((ca(N,E)|0)>>>0)/255|0;break}default:{O=H;P=G;Q=F;R=E}}c[k>>2]=Q<<8|R<<16|P|O<<24;if(!x)break;else{k=k+4|0;y=y+4|0}}s=v;t=c[i>>2]|0;u=w}c[a>>2]=u+(c[m>>2]|0);c[j>>2]=s+(c[n>>2]|0);b=t+-1|0;c[i>>2]=b}while((t|0)!=0);return}function Ui(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=d[a+63>>0]|0;i=a+28|0;j=c[i>>2]|0;k=j+-1|0;c[i>>2]=k;if(!j)return;j=a+20|0;l=a+24|0;m=a+12|0;n=a+32|0;o=(b&1|0)==0;p=(b&2|0)==0;q=(b&48|0)!=0;r=b&112;b=k;do{k=c[l>>2]|0;if(!k){s=c[j>>2]|0;t=b;u=c[a>>2]|0}else{v=c[j>>2]|0;w=c[a>>2]|0;x=k;k=v;y=w;while(1){x=x+-1|0;z=c[y>>2]|0;A=z>>>16&255;B=z>>>8&255;C=z&255;D=z>>>24;z=c[k>>2]|0;E=z>>>16&255;F=z>>>8&255;G=z&255;H=z>>>24;if(o){I=C;J=B;K=A}else{I=((ca(C,g)|0)>>>0)/255|0;J=((ca(B,f)|0)>>>0)/255|0;K=((ca(A,e)|0)>>>0)/255|0}A=((ca(D,h)|0)>>>0)/255|0;B=p?D:A;if(q&B>>>0<255){L=((ca(B,I)|0)>>>0)/255|0;M=((ca(B,J)|0)>>>0)/255|0;N=((ca(B,K)|0)>>>0)/255|0}else{L=I;M=J;N=K}switch(r|0){case 16:{A=255-B|0;O=(((ca(A,H)|0)>>>0)/255|0)+B|0;P=(((ca(A,G)|0)>>>0)/255|0)+L|0;Q=(((ca(A,F)|0)>>>0)/255|0)+M|0;R=(((ca(A,E)|0)>>>0)/255|0)+N|0;break}case 32:{A=N+E|0;B=M+F|0;D=L+G|0;O=H;P=D>>>0>255?255:D;Q=B>>>0>255?255:B;R=A>>>0>255?255:A;break}case 64:{O=H;P=((ca(L,G)|0)>>>0)/255|0;Q=((ca(M,F)|0)>>>0)/255|0;R=((ca(N,E)|0)>>>0)/255|0;break}default:{O=H;P=G;Q=F;R=E}}c[k>>2]=Q<<8|R<<16|P|O<<24;if(!x)break;else{k=k+4|0;y=y+4|0}}s=v;t=c[i>>2]|0;u=w}c[a>>2]=u+(c[m>>2]|0);c[j>>2]=s+(c[n>>2]|0);b=t+-1|0;c[i>>2]=b}while((t|0)!=0);return}function Ti(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=d[a+63>>0]|0;i=a+28|0;j=c[i>>2]|0;k=j+-1|0;c[i>>2]=k;if(!j)return;j=a+20|0;l=a+24|0;m=a+12|0;n=a+32|0;o=(b&1|0)==0;p=(b&2|0)==0;q=(b&48|0)!=0;r=b&112;b=k;do{k=c[l>>2]|0;if(!k){s=c[j>>2]|0;t=b;u=c[a>>2]|0}else{v=c[j>>2]|0;w=c[a>>2]|0;x=k;k=v;y=w;while(1){x=x+-1|0;z=c[y>>2]|0;A=z>>>24;B=z>>>16&255;C=z>>>8&255;D=z&255;z=c[k>>2]|0;E=z>>>16&255;F=z>>>8&255;G=z&255;H=z>>>24;if(o){I=A;J=B;K=C}else{I=((ca(A,g)|0)>>>0)/255|0;J=((ca(B,f)|0)>>>0)/255|0;K=((ca(C,e)|0)>>>0)/255|0}C=((ca(D,h)|0)>>>0)/255|0;B=p?D:C;if(q&B>>>0<255){L=((ca(B,I)|0)>>>0)/255|0;M=((ca(B,J)|0)>>>0)/255|0;N=((ca(B,K)|0)>>>0)/255|0}else{L=I;M=J;N=K}switch(r|0){case 16:{C=255-B|0;O=(((ca(C,H)|0)>>>0)/255|0)+B|0;P=(((ca(C,G)|0)>>>0)/255|0)+L|0;Q=(((ca(C,F)|0)>>>0)/255|0)+M|0;R=(((ca(C,E)|0)>>>0)/255|0)+N|0;break}case 32:{C=N+E|0;B=M+F|0;D=L+G|0;O=H;P=D>>>0>255?255:D;Q=B>>>0>255?255:B;R=C>>>0>255?255:C;break}case 64:{O=H;P=((ca(L,G)|0)>>>0)/255|0;Q=((ca(M,F)|0)>>>0)/255|0;R=((ca(N,E)|0)>>>0)/255|0;break}default:{O=H;P=G;Q=F;R=E}}c[k>>2]=Q<<8|R<<16|P|O<<24;if(!x)break;else{k=k+4|0;y=y+4|0}}s=v;t=c[i>>2]|0;u=w}c[a>>2]=u+(c[m>>2]|0);c[j>>2]=s+(c[n>>2]|0);b=t+-1|0;c[i>>2]=b}while((t|0)!=0);return}function Si(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=d[a+63>>0]|0;i=a+28|0;j=c[i>>2]|0;k=j+-1|0;c[i>>2]=k;if(!j)return;j=a+20|0;l=a+24|0;m=a+12|0;n=a+32|0;o=(b&1|0)==0;p=(b&2|0)==0;q=(b&48|0)!=0;r=b&112;b=k;do{k=c[l>>2]|0;if(!k){s=c[j>>2]|0;t=b;u=c[a>>2]|0}else{v=c[j>>2]|0;w=c[a>>2]|0;x=k;k=v;y=w;while(1){x=x+-1|0;z=c[y>>2]|0;A=z>>>24;B=z>>>16&255;C=z>>>8&255;D=z&255;z=c[k>>2]|0;E=z>>>16&255;F=z>>>8&255;G=z&255;H=z>>>24;if(o){I=C;J=B;K=A}else{I=((ca(C,g)|0)>>>0)/255|0;J=((ca(B,f)|0)>>>0)/255|0;K=((ca(A,e)|0)>>>0)/255|0}A=((ca(D,h)|0)>>>0)/255|0;B=p?D:A;if(q&B>>>0<255){L=((ca(B,I)|0)>>>0)/255|0;M=((ca(B,J)|0)>>>0)/255|0;N=((ca(B,K)|0)>>>0)/255|0}else{L=I;M=J;N=K}switch(r|0){case 16:{A=255-B|0;O=(((ca(A,H)|0)>>>0)/255|0)+B|0;P=(((ca(A,G)|0)>>>0)/255|0)+L|0;Q=(((ca(A,F)|0)>>>0)/255|0)+M|0;R=(((ca(A,E)|0)>>>0)/255|0)+N|0;break}case 32:{A=N+E|0;B=M+F|0;D=L+G|0;O=H;P=D>>>0>255?255:D;Q=B>>>0>255?255:B;R=A>>>0>255?255:A;break}case 64:{O=H;P=((ca(L,G)|0)>>>0)/255|0;Q=((ca(M,F)|0)>>>0)/255|0;R=((ca(N,E)|0)>>>0)/255|0;break}default:{O=H;P=G;Q=F;R=E}}c[k>>2]=Q<<8|R<<16|P|O<<24;if(!x)break;else{k=k+4|0;y=y+4|0}}s=v;t=c[i>>2]|0;u=w}c[a>>2]=u+(c[m>>2]|0);c[j>>2]=s+(c[n>>2]|0);b=t+-1|0;c[i>>2]=b}while((t|0)!=0);return}function wi(b){b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;e=i;i=i+16|0;f=e+8|0;g=e;h=c[b+52>>2]|0;j=c[h>>2]|0;if(c[b>>2]&2)si(b,1);c[h+8>>2]=11;k=b+4|0;c[h+56>>2]=c[k>>2];c[h+28>>2]=c[b+16>>2];l=j+4|0;c[h+60>>2]=c[l>>2];c[h+48>>2]=c[j+16>>2];j=h+68|0;if((c[j>>2]&4096|0)!=0?(sg(b)|0)==0:0){m=0;i=e;return m|0}if((c[h+4>>2]|0)!=0?(c[j>>2]&-4097|0)==0:0)n=243;else o=7;a:do if((o|0)==7){p=c[k>>2]|0;if(((d[p+8>>0]|0)<8?(q=c[p>>2]|0,(q|0)==0|(q&-268435456|0)==268435456):0)?((q>>>24&15)+-1|0)>>>0<3:0)r=co(b)|0;else o=11;do if((o|0)==11){if(((a[p+9>>0]|0)==1?(q=c[p>>2]|0,(q|0)==0|(q&-268435456|0)==268435456):0)?((q>>>24&15)+-1|0)>>>0<3:0){r=gp(b)|0;break}if(!(c[j>>2]&16)){r=Gh(b)|0;break}else{r=Rj(b)|0;break}}while(0);if(!r){p=c[c[k>>2]>>2]|0;q=c[c[l>>2]>>2]|0;s=c[j>>2]|0;do if((c[1383]|0)==-1){t=Pu(23775)|0;c[1383]=0;if(t){c[g>>2]=5532;ws(t,23797,g)|0;break}if(nq()|0)c[1383]=c[1383]|1;if(kq()|0)c[1383]=c[1383]|2;if(mq()|0)c[1383]=c[1383]|4;if(lq()|0)c[1383]=c[1383]|8;if(jq()|0)c[1383]=c[1383]|16}while(0);t=c[732]|0;if(t){u=c[1383]|0;v=s&883;w=t;t=0;do{if((((c[2912+(t*20|0)>>2]|0)==(p|0)?(c[2912+(t*20|0)+4>>2]|0)==(q|0):0)?(c[2912+(t*20|0)+8>>2]&v|0)==(v|0):0)?(x=c[2912+(t*20|0)+12>>2]|0,(x&u|0)==(x|0)):0){n=w;break a}t=t+1|0;w=c[2912+(t*20|0)+16>>2]|0}while((w|0)!=0)}w=c[c[k>>2]>>2]|0;t=c[c[l>>2]>>2]|0;if((((w|0)==0|(w&-268435456|0)==268435456?((w>>>24&15)+-1|0)>>>0>=3:0)?(t|0)==0|(t&-268435456|0)==268435456:0)?((t>>>24&15)+-1|0)>>>0>=3:0){n=244;break}c[h+12>>2]=0;hq(h);m=Cj(23800,f)|0;i=e;return m|0}else n=r}while(0);c[h+12>>2]=n;m=0;i=e;return m|0}function Zi(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0;e=c[b+52>>2]|0;f=d[b+60>>0]|0;g=d[b+61>>0]|0;h=d[b+62>>0]|0;i=a[b+63>>0]|0;j=b+28|0;k=c[j>>2]|0;l=k+-1|0;c[j>>2]=l;if(!k)return;k=b+20|0;m=b+24|0;n=b+12|0;o=b+32|0;p=(e&1|0)==0;q=(e&2|0)==0?255:i&255;i=(e&48|0)!=0&(q|0)!=255;r=e&112;e=q^255;s=l;do{l=c[m>>2]|0;if(!l){t=s;u=c[b>>2]|0;v=c[k>>2]|0}else{w=c[k>>2]|0;x=c[b>>2]|0;y=l;l=w;z=x;while(1){y=y+-1|0;A=c[z>>2]|0;B=A>>>16&255;C=A>>>8&255;D=A&255;A=c[l>>2]|0;E=A>>>16&255;F=A>>>8&255;G=A&255;H=A>>>24;if(p){I=B;J=C;K=D}else{I=((ca(B,h)|0)>>>0)/255|0;J=((ca(C,g)|0)>>>0)/255|0;K=((ca(D,f)|0)>>>0)/255|0}if(i){L=((ca(I,q)|0)>>>0)/255|0;M=((ca(J,q)|0)>>>0)/255|0;N=((ca(K,q)|0)>>>0)/255|0}else{L=I;M=J;N=K}switch(r|0){case 16:{O=(((ca(H,e)|0)>>>0)/255|0)+q|0;P=(((ca(G,e)|0)>>>0)/255|0)+L|0;Q=(((ca(F,e)|0)>>>0)/255|0)+M|0;R=(((ca(E,e)|0)>>>0)/255|0)+N|0;break}case 32:{D=N+E|0;C=M+F|0;B=L+G|0;O=H;P=B>>>0>255?255:B;Q=C>>>0>255?255:C;R=D>>>0>255?255:D;break}case 64:{O=H;P=((ca(L,G)|0)>>>0)/255|0;Q=((ca(M,F)|0)>>>0)/255|0;R=((ca(N,E)|0)>>>0)/255|0;break}default:{O=H;P=G;Q=F;R=E}}c[l>>2]=Q<<8|R<<16|P|O<<24;if(!y)break;else{l=l+4|0;z=z+4|0}}t=c[j>>2]|0;u=x;v=w}c[b>>2]=u+(c[n>>2]|0);c[k>>2]=v+(c[o>>2]|0);s=t+-1|0;c[j>>2]=s}while((t|0)!=0);return}function Yi(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0;e=c[b+52>>2]|0;f=d[b+60>>0]|0;g=d[b+61>>0]|0;h=d[b+62>>0]|0;i=a[b+63>>0]|0;j=b+28|0;k=c[j>>2]|0;l=k+-1|0;c[j>>2]=l;if(!k)return;k=b+20|0;m=b+24|0;n=b+12|0;o=b+32|0;p=(e&1|0)==0;q=(e&2|0)==0?255:i&255;i=(e&48|0)!=0&(q|0)!=255;r=e&112;e=q^255;s=l;do{l=c[m>>2]|0;if(!l){t=s;u=c[b>>2]|0;v=c[k>>2]|0}else{w=c[k>>2]|0;x=c[b>>2]|0;y=l;l=w;z=x;while(1){y=y+-1|0;A=c[z>>2]|0;B=A>>>16&255;C=A>>>8&255;D=A&255;A=c[l>>2]|0;E=A>>>16&255;F=A>>>8&255;G=A&255;H=A>>>24;if(p){I=D;J=C;K=B}else{I=((ca(D,h)|0)>>>0)/255|0;J=((ca(C,g)|0)>>>0)/255|0;K=((ca(B,f)|0)>>>0)/255|0}if(i){L=((ca(I,q)|0)>>>0)/255|0;M=((ca(J,q)|0)>>>0)/255|0;N=((ca(K,q)|0)>>>0)/255|0}else{L=I;M=J;N=K}switch(r|0){case 16:{O=(((ca(H,e)|0)>>>0)/255|0)+q|0;P=(((ca(G,e)|0)>>>0)/255|0)+L|0;Q=(((ca(F,e)|0)>>>0)/255|0)+M|0;R=(((ca(E,e)|0)>>>0)/255|0)+N|0;break}case 32:{B=N+E|0;C=M+F|0;D=L+G|0;O=H;P=D>>>0>255?255:D;Q=C>>>0>255?255:C;R=B>>>0>255?255:B;break}case 64:{O=H;P=((ca(L,G)|0)>>>0)/255|0;Q=((ca(M,F)|0)>>>0)/255|0;R=((ca(N,E)|0)>>>0)/255|0;break}default:{O=H;P=G;Q=F;R=E}}c[l>>2]=Q<<8|R<<16|P|O<<24;if(!y)break;else{l=l+4|0;z=z+4|0}}t=c[j>>2]|0;u=x;v=w}c[b>>2]=u+(c[n>>2]|0);c[k>>2]=v+(c[o>>2]|0);s=t+-1|0;c[j>>2]=s}while((t|0)!=0);return}function gj(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=d[a+63>>0]|0;i=a+28|0;j=c[i>>2]|0;k=j+-1|0;c[i>>2]=k;if(!j)return;j=a+20|0;l=a+24|0;m=a+12|0;n=a+32|0;o=(b&1|0)==0;p=(b&2|0)==0;q=(b&48|0)!=0;r=b&112;b=k;do{k=c[l>>2]|0;if(!k){s=c[a>>2]|0;t=c[j>>2]|0;u=b}else{v=c[j>>2]|0;w=c[a>>2]|0;x=k;k=v;y=w;while(1){x=x+-1|0;z=c[y>>2]|0;A=z>>>16&255;B=z>>>8&255;C=z&255;D=z>>>24;z=c[k>>2]|0;E=z>>>16&255;F=z>>>8&255;G=z&255;if(o){H=A;I=B;J=C}else{H=((ca(A,g)|0)>>>0)/255|0;I=((ca(B,f)|0)>>>0)/255|0;J=((ca(C,e)|0)>>>0)/255|0}C=((ca(D,h)|0)>>>0)/255|0;B=p?D:C;if(q&B>>>0<255){K=((ca(B,H)|0)>>>0)/255|0;L=((ca(B,I)|0)>>>0)/255|0;M=((ca(B,J)|0)>>>0)/255|0}else{K=H;L=I;M=J}switch(r|0){case 16:{C=255-B|0;N=(((ca(C,E)|0)>>>0)/255|0)+K|0;O=(((ca(C,F)|0)>>>0)/255|0)+L|0;P=(((ca(C,G)|0)>>>0)/255|0)+M|0;break}case 32:{C=M+G|0;B=L+F|0;D=K+E|0;N=D>>>0>255?255:D;O=B>>>0>255?255:B;P=C>>>0>255?255:C;break}case 64:{N=((ca(K,E)|0)>>>0)/255|0;O=((ca(L,F)|0)>>>0)/255|0;P=((ca(M,G)|0)>>>0)/255|0;break}default:{N=E;O=F;P=G}}c[k>>2]=O<<8|P|N<<16;if(!x)break;else{k=k+4|0;y=y+4|0}}s=w;t=v;u=c[i>>2]|0}c[a>>2]=s+(c[m>>2]|0);c[j>>2]=t+(c[n>>2]|0);b=u+-1|0;c[i>>2]=b}while((u|0)!=0);return}function fj(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=d[a+63>>0]|0;i=a+28|0;j=c[i>>2]|0;k=j+-1|0;c[i>>2]=k;if(!j)return;j=a+20|0;l=a+24|0;m=a+12|0;n=a+32|0;o=(b&1|0)==0;p=(b&2|0)==0;q=(b&48|0)!=0;r=b&112;b=k;do{k=c[l>>2]|0;if(!k){s=c[a>>2]|0;t=c[j>>2]|0;u=b}else{v=c[j>>2]|0;w=c[a>>2]|0;x=k;k=v;y=w;while(1){x=x+-1|0;z=c[y>>2]|0;A=z>>>16&255;B=z>>>8&255;C=z&255;D=z>>>24;z=c[k>>2]|0;E=z>>>16&255;F=z>>>8&255;G=z&255;if(o){H=A;I=B;J=C}else{H=((ca(A,g)|0)>>>0)/255|0;I=((ca(B,f)|0)>>>0)/255|0;J=((ca(C,e)|0)>>>0)/255|0}C=((ca(D,h)|0)>>>0)/255|0;B=p?D:C;if(q&B>>>0<255){K=((ca(B,H)|0)>>>0)/255|0;L=((ca(B,I)|0)>>>0)/255|0;M=((ca(B,J)|0)>>>0)/255|0}else{K=H;L=I;M=J}switch(r|0){case 16:{C=255-B|0;N=(((ca(C,G)|0)>>>0)/255|0)+K|0;O=(((ca(C,F)|0)>>>0)/255|0)+L|0;P=(((ca(C,E)|0)>>>0)/255|0)+M|0;break}case 32:{C=M+E|0;B=L+F|0;D=K+G|0;N=D>>>0>255?255:D;O=B>>>0>255?255:B;P=C>>>0>255?255:C;break}case 64:{N=((ca(K,G)|0)>>>0)/255|0;O=((ca(L,F)|0)>>>0)/255|0;P=((ca(M,E)|0)>>>0)/255|0;break}default:{N=G;O=F;P=E}}c[k>>2]=O<<8|P<<16|N;if(!x)break;else{k=k+4|0;y=y+4|0}}s=w;t=v;u=c[i>>2]|0}c[a>>2]=s+(c[m>>2]|0);c[j>>2]=t+(c[n>>2]|0);b=u+-1|0;c[i>>2]=b}while((u|0)!=0);return}function ej(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=d[a+63>>0]|0;i=a+28|0;j=c[i>>2]|0;k=j+-1|0;c[i>>2]=k;if(!j)return;j=a+20|0;l=a+24|0;m=a+12|0;n=a+32|0;o=(b&1|0)==0;p=(b&2|0)==0;q=(b&48|0)!=0;r=b&112;b=k;do{k=c[l>>2]|0;if(!k){s=c[a>>2]|0;t=c[j>>2]|0;u=b}else{v=c[j>>2]|0;w=c[a>>2]|0;x=k;k=v;y=w;while(1){x=x+-1|0;z=c[y>>2]|0;A=z>>>16&255;B=z>>>8&255;C=z&255;D=z>>>24;z=c[k>>2]|0;E=z>>>16&255;F=z>>>8&255;G=z&255;if(o){H=C;I=B;J=A}else{H=((ca(C,g)|0)>>>0)/255|0;I=((ca(B,f)|0)>>>0)/255|0;J=((ca(A,e)|0)>>>0)/255|0}A=((ca(D,h)|0)>>>0)/255|0;B=p?D:A;if(q&B>>>0<255){K=((ca(B,H)|0)>>>0)/255|0;L=((ca(B,I)|0)>>>0)/255|0;M=((ca(B,J)|0)>>>0)/255|0}else{K=H;L=I;M=J}switch(r|0){case 16:{A=255-B|0;N=(((ca(A,E)|0)>>>0)/255|0)+K|0;O=(((ca(A,F)|0)>>>0)/255|0)+L|0;P=(((ca(A,G)|0)>>>0)/255|0)+M|0;break}case 32:{A=M+G|0;B=L+F|0;D=K+E|0;N=D>>>0>255?255:D;O=B>>>0>255?255:B;P=A>>>0>255?255:A;break}case 64:{N=((ca(K,E)|0)>>>0)/255|0;O=((ca(L,F)|0)>>>0)/255|0;P=((ca(M,G)|0)>>>0)/255|0;break}default:{N=E;O=F;P=G}}c[k>>2]=O<<8|P|N<<16;if(!x)break;else{k=k+4|0;y=y+4|0}}s=w;t=v;u=c[i>>2]|0}c[a>>2]=s+(c[m>>2]|0);c[j>>2]=t+(c[n>>2]|0);b=u+-1|0;c[i>>2]=b}while((u|0)!=0);return}function dj(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=d[a+63>>0]|0;i=a+28|0;j=c[i>>2]|0;k=j+-1|0;c[i>>2]=k;if(!j)return;j=a+20|0;l=a+24|0;m=a+12|0;n=a+32|0;o=(b&1|0)==0;p=(b&2|0)==0;q=(b&48|0)!=0;r=b&112;b=k;do{k=c[l>>2]|0;if(!k){s=c[a>>2]|0;t=c[j>>2]|0;u=b}else{v=c[j>>2]|0;w=c[a>>2]|0;x=k;k=v;y=w;while(1){x=x+-1|0;z=c[y>>2]|0;A=z>>>16&255;B=z>>>8&255;C=z&255;D=z>>>24;z=c[k>>2]|0;E=z>>>16&255;F=z>>>8&255;G=z&255;if(o){H=C;I=B;J=A}else{H=((ca(C,g)|0)>>>0)/255|0;I=((ca(B,f)|0)>>>0)/255|0;J=((ca(A,e)|0)>>>0)/255|0}A=((ca(D,h)|0)>>>0)/255|0;B=p?D:A;if(q&B>>>0<255){K=((ca(B,H)|0)>>>0)/255|0;L=((ca(B,I)|0)>>>0)/255|0;M=((ca(B,J)|0)>>>0)/255|0}else{K=H;L=I;M=J}switch(r|0){case 16:{A=255-B|0;N=(((ca(A,G)|0)>>>0)/255|0)+K|0;O=(((ca(A,F)|0)>>>0)/255|0)+L|0;P=(((ca(A,E)|0)>>>0)/255|0)+M|0;break}case 32:{A=M+E|0;B=L+F|0;D=K+G|0;N=D>>>0>255?255:D;O=B>>>0>255?255:B;P=A>>>0>255?255:A;break}case 64:{N=((ca(K,G)|0)>>>0)/255|0;O=((ca(L,F)|0)>>>0)/255|0;P=((ca(M,E)|0)>>>0)/255|0;break}default:{N=G;O=F;P=E}}c[k>>2]=O<<8|P<<16|N;if(!x)break;else{k=k+4|0;y=y+4|0}}s=w;t=v;u=c[i>>2]|0}c[a>>2]=s+(c[m>>2]|0);c[j>>2]=t+(c[n>>2]|0);b=u+-1|0;c[i>>2]=b}while((u|0)!=0);return}function cj(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=d[a+63>>0]|0;i=a+28|0;j=c[i>>2]|0;k=j+-1|0;c[i>>2]=k;if(!j)return;j=a+20|0;l=a+24|0;m=a+12|0;n=a+32|0;o=(b&1|0)==0;p=(b&2|0)==0;q=(b&48|0)!=0;r=b&112;b=k;do{k=c[l>>2]|0;if(!k){s=c[a>>2]|0;t=c[j>>2]|0;u=b}else{v=c[j>>2]|0;w=c[a>>2]|0;x=k;k=v;y=w;while(1){x=x+-1|0;z=c[y>>2]|0;A=z>>>24;B=z>>>16&255;C=z>>>8&255;D=z&255;z=c[k>>2]|0;E=z>>>16&255;F=z>>>8&255;G=z&255;if(o){H=A;I=B;J=C}else{H=((ca(A,g)|0)>>>0)/255|0;I=((ca(B,f)|0)>>>0)/255|0;J=((ca(C,e)|0)>>>0)/255|0}C=((ca(D,h)|0)>>>0)/255|0;B=p?D:C;if(q&B>>>0<255){K=((ca(B,H)|0)>>>0)/255|0;L=((ca(B,I)|0)>>>0)/255|0;M=((ca(B,J)|0)>>>0)/255|0}else{K=H;L=I;M=J}switch(r|0){case 16:{C=255-B|0;N=(((ca(C,E)|0)>>>0)/255|0)+K|0;O=(((ca(C,F)|0)>>>0)/255|0)+L|0;P=(((ca(C,G)|0)>>>0)/255|0)+M|0;break}case 32:{C=M+G|0;B=L+F|0;D=K+E|0;N=D>>>0>255?255:D;O=B>>>0>255?255:B;P=C>>>0>255?255:C;break}case 64:{N=((ca(K,E)|0)>>>0)/255|0;O=((ca(L,F)|0)>>>0)/255|0;P=((ca(M,G)|0)>>>0)/255|0;break}default:{N=E;O=F;P=G}}c[k>>2]=O<<8|P|N<<16;if(!x)break;else{k=k+4|0;y=y+4|0}}s=w;t=v;u=c[i>>2]|0}c[a>>2]=s+(c[m>>2]|0);c[j>>2]=t+(c[n>>2]|0);b=u+-1|0;c[i>>2]=b}while((u|0)!=0);return}function bj(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=d[a+63>>0]|0;i=a+28|0;j=c[i>>2]|0;k=j+-1|0;c[i>>2]=k;if(!j)return;j=a+20|0;l=a+24|0;m=a+12|0;n=a+32|0;o=(b&1|0)==0;p=(b&2|0)==0;q=(b&48|0)!=0;r=b&112;b=k;do{k=c[l>>2]|0;if(!k){s=c[a>>2]|0;t=c[j>>2]|0;u=b}else{v=c[j>>2]|0;w=c[a>>2]|0;x=k;k=v;y=w;while(1){x=x+-1|0;z=c[y>>2]|0;A=z>>>24;B=z>>>16&255;C=z>>>8&255;D=z&255;z=c[k>>2]|0;E=z>>>16&255;F=z>>>8&255;G=z&255;if(o){H=A;I=B;J=C}else{H=((ca(A,g)|0)>>>0)/255|0;I=((ca(B,f)|0)>>>0)/255|0;J=((ca(C,e)|0)>>>0)/255|0}C=((ca(D,h)|0)>>>0)/255|0;B=p?D:C;if(q&B>>>0<255){K=((ca(B,H)|0)>>>0)/255|0;L=((ca(B,I)|0)>>>0)/255|0;M=((ca(B,J)|0)>>>0)/255|0}else{K=H;L=I;M=J}switch(r|0){case 16:{C=255-B|0;N=(((ca(C,G)|0)>>>0)/255|0)+K|0;O=(((ca(C,F)|0)>>>0)/255|0)+L|0;P=(((ca(C,E)|0)>>>0)/255|0)+M|0;break}case 32:{C=M+E|0;B=L+F|0;D=K+G|0;N=D>>>0>255?255:D;O=B>>>0>255?255:B;P=C>>>0>255?255:C;break}case 64:{N=((ca(K,G)|0)>>>0)/255|0;O=((ca(L,F)|0)>>>0)/255|0;P=((ca(M,E)|0)>>>0)/255|0;break}default:{N=G;O=F;P=E}}c[k>>2]=O<<8|P<<16|N;if(!x)break;else{k=k+4|0;y=y+4|0}}s=w;t=v;u=c[i>>2]|0}c[a>>2]=s+(c[m>>2]|0);c[j>>2]=t+(c[n>>2]|0);b=u+-1|0;c[i>>2]=b}while((u|0)!=0);return}function aj(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=d[a+63>>0]|0;i=a+28|0;j=c[i>>2]|0;k=j+-1|0;c[i>>2]=k;if(!j)return;j=a+20|0;l=a+24|0;m=a+12|0;n=a+32|0;o=(b&1|0)==0;p=(b&2|0)==0;q=(b&48|0)!=0;r=b&112;b=k;do{k=c[l>>2]|0;if(!k){s=c[a>>2]|0;t=c[j>>2]|0;u=b}else{v=c[j>>2]|0;w=c[a>>2]|0;x=k;k=v;y=w;while(1){x=x+-1|0;z=c[y>>2]|0;A=z>>>24;B=z>>>16&255;C=z>>>8&255;D=z&255;z=c[k>>2]|0;E=z>>>16&255;F=z>>>8&255;G=z&255;if(o){H=C;I=B;J=A}else{H=((ca(C,g)|0)>>>0)/255|0;I=((ca(B,f)|0)>>>0)/255|0;J=((ca(A,e)|0)>>>0)/255|0}A=((ca(D,h)|0)>>>0)/255|0;B=p?D:A;if(q&B>>>0<255){K=((ca(B,H)|0)>>>0)/255|0;L=((ca(B,I)|0)>>>0)/255|0;M=((ca(B,J)|0)>>>0)/255|0}else{K=H;L=I;M=J}switch(r|0){case 16:{A=255-B|0;N=(((ca(A,E)|0)>>>0)/255|0)+K|0;O=(((ca(A,F)|0)>>>0)/255|0)+L|0;P=(((ca(A,G)|0)>>>0)/255|0)+M|0;break}case 32:{A=M+G|0;B=L+F|0;D=K+E|0;N=D>>>0>255?255:D;O=B>>>0>255?255:B;P=A>>>0>255?255:A;break}case 64:{N=((ca(K,E)|0)>>>0)/255|0;O=((ca(L,F)|0)>>>0)/255|0;P=((ca(M,G)|0)>>>0)/255|0;break}default:{N=E;O=F;P=G}}c[k>>2]=O<<8|P|N<<16;if(!x)break;else{k=k+4|0;y=y+4|0}}s=w;t=v;u=c[i>>2]|0}c[a>>2]=s+(c[m>>2]|0);c[j>>2]=t+(c[n>>2]|0);b=u+-1|0;c[i>>2]=b}while((u|0)!=0);return}function $i(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=d[a+63>>0]|0;i=a+28|0;j=c[i>>2]|0;k=j+-1|0;c[i>>2]=k;if(!j)return;j=a+20|0;l=a+24|0;m=a+12|0;n=a+32|0;o=(b&1|0)==0;p=(b&2|0)==0;q=(b&48|0)!=0;r=b&112;b=k;do{k=c[l>>2]|0;if(!k){s=c[a>>2]|0;t=c[j>>2]|0;u=b}else{v=c[j>>2]|0;w=c[a>>2]|0;x=k;k=v;y=w;while(1){x=x+-1|0;z=c[y>>2]|0;A=z>>>24;B=z>>>16&255;C=z>>>8&255;D=z&255;z=c[k>>2]|0;E=z>>>16&255;F=z>>>8&255;G=z&255;if(o){H=C;I=B;J=A}else{H=((ca(C,g)|0)>>>0)/255|0;I=((ca(B,f)|0)>>>0)/255|0;J=((ca(A,e)|0)>>>0)/255|0}A=((ca(D,h)|0)>>>0)/255|0;B=p?D:A;if(q&B>>>0<255){K=((ca(B,H)|0)>>>0)/255|0;L=((ca(B,I)|0)>>>0)/255|0;M=((ca(B,J)|0)>>>0)/255|0}else{K=H;L=I;M=J}switch(r|0){case 16:{A=255-B|0;N=(((ca(A,G)|0)>>>0)/255|0)+K|0;O=(((ca(A,F)|0)>>>0)/255|0)+L|0;P=(((ca(A,E)|0)>>>0)/255|0)+M|0;break}case 32:{A=M+E|0;B=L+F|0;D=K+G|0;N=D>>>0>255?255:D;O=B>>>0>255?255:B;P=A>>>0>255?255:A;break}case 64:{N=((ca(K,G)|0)>>>0)/255|0;O=((ca(L,F)|0)>>>0)/255|0;P=((ca(M,E)|0)>>>0)/255|0;break}default:{N=G;O=F;P=E}}c[k>>2]=O<<8|P<<16|N;if(!x)break;else{k=k+4|0;y=y+4|0}}s=w;t=v;u=c[i>>2]|0}c[a>>2]=s+(c[m>>2]|0);c[j>>2]=t+(c[n>>2]|0);b=u+-1|0;c[i>>2]=b}while((u|0)!=0);return}function kj(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;e=c[b+52>>2]|0;f=d[b+60>>0]|0;g=d[b+61>>0]|0;h=d[b+62>>0]|0;i=a[b+63>>0]|0;j=b+28|0;k=c[j>>2]|0;l=k+-1|0;c[j>>2]=l;if(!k)return;k=b+20|0;m=b+24|0;n=b+12|0;o=b+32|0;p=(e&1|0)==0;q=(e&2|0)==0?255:i&255;i=(e&48|0)!=0&(q|0)!=255;r=e&112;e=q^255;s=l;do{l=c[m>>2]|0;if(!l){t=c[b>>2]|0;u=c[k>>2]|0;v=s}else{w=c[k>>2]|0;x=c[b>>2]|0;y=l;l=w;z=x;while(1){y=y+-1|0;A=c[z>>2]|0;B=A>>>16&255;C=A>>>8&255;D=A&255;A=c[l>>2]|0;E=A>>>16&255;F=A>>>8&255;G=A&255;if(p){H=B;I=C;J=D}else{H=((ca(B,h)|0)>>>0)/255|0;I=((ca(C,g)|0)>>>0)/255|0;J=((ca(D,f)|0)>>>0)/255|0}if(i){K=((ca(H,q)|0)>>>0)/255|0;L=((ca(I,q)|0)>>>0)/255|0;M=((ca(J,q)|0)>>>0)/255|0}else{K=H;L=I;M=J}switch(r|0){case 16:{N=(((ca(E,e)|0)>>>0)/255|0)+K|0;O=(((ca(F,e)|0)>>>0)/255|0)+L|0;P=(((ca(G,e)|0)>>>0)/255|0)+M|0;break}case 32:{D=M+G|0;C=L+F|0;B=K+E|0;N=B>>>0>255?255:B;O=C>>>0>255?255:C;P=D>>>0>255?255:D;break}case 64:{N=((ca(K,E)|0)>>>0)/255|0;O=((ca(L,F)|0)>>>0)/255|0;P=((ca(M,G)|0)>>>0)/255|0;break}default:{N=E;O=F;P=G}}c[l>>2]=O<<8|P|N<<16;if(!y)break;else{l=l+4|0;z=z+4|0}}t=x;u=w;v=c[j>>2]|0}c[b>>2]=t+(c[n>>2]|0);c[k>>2]=u+(c[o>>2]|0);s=v+-1|0;c[j>>2]=s}while((v|0)!=0);return}function jj(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;e=c[b+52>>2]|0;f=d[b+60>>0]|0;g=d[b+61>>0]|0;h=d[b+62>>0]|0;i=a[b+63>>0]|0;j=b+28|0;k=c[j>>2]|0;l=k+-1|0;c[j>>2]=l;if(!k)return;k=b+20|0;m=b+24|0;n=b+12|0;o=b+32|0;p=(e&1|0)==0;q=(e&2|0)==0?255:i&255;i=(e&48|0)!=0&(q|0)!=255;r=e&112;e=q^255;s=l;do{l=c[m>>2]|0;if(!l){t=c[b>>2]|0;u=c[k>>2]|0;v=s}else{w=c[k>>2]|0;x=c[b>>2]|0;y=l;l=w;z=x;while(1){y=y+-1|0;A=c[z>>2]|0;B=A>>>16&255;C=A>>>8&255;D=A&255;A=c[l>>2]|0;E=A>>>16&255;F=A>>>8&255;G=A&255;if(p){H=B;I=C;J=D}else{H=((ca(B,h)|0)>>>0)/255|0;I=((ca(C,g)|0)>>>0)/255|0;J=((ca(D,f)|0)>>>0)/255|0}if(i){K=((ca(H,q)|0)>>>0)/255|0;L=((ca(I,q)|0)>>>0)/255|0;M=((ca(J,q)|0)>>>0)/255|0}else{K=H;L=I;M=J}switch(r|0){case 16:{N=(((ca(G,e)|0)>>>0)/255|0)+K|0;O=(((ca(F,e)|0)>>>0)/255|0)+L|0;P=(((ca(E,e)|0)>>>0)/255|0)+M|0;break}case 32:{D=M+E|0;C=L+F|0;B=K+G|0;N=B>>>0>255?255:B;O=C>>>0>255?255:C;P=D>>>0>255?255:D;break}case 64:{N=((ca(K,G)|0)>>>0)/255|0;O=((ca(L,F)|0)>>>0)/255|0;P=((ca(M,E)|0)>>>0)/255|0;break}default:{N=G;O=F;P=E}}c[l>>2]=O<<8|P<<16|N;if(!y)break;else{l=l+4|0;z=z+4|0}}t=x;u=w;v=c[j>>2]|0}c[b>>2]=t+(c[n>>2]|0);c[k>>2]=u+(c[o>>2]|0);s=v+-1|0;c[j>>2]=s}while((v|0)!=0);return}function ij(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;e=c[b+52>>2]|0;f=d[b+60>>0]|0;g=d[b+61>>0]|0;h=d[b+62>>0]|0;i=a[b+63>>0]|0;j=b+28|0;k=c[j>>2]|0;l=k+-1|0;c[j>>2]=l;if(!k)return;k=b+20|0;m=b+24|0;n=b+12|0;o=b+32|0;p=(e&1|0)==0;q=(e&2|0)==0?255:i&255;i=(e&48|0)!=0&(q|0)!=255;r=e&112;e=q^255;s=l;do{l=c[m>>2]|0;if(!l){t=c[b>>2]|0;u=c[k>>2]|0;v=s}else{w=c[k>>2]|0;x=c[b>>2]|0;y=l;l=w;z=x;while(1){y=y+-1|0;A=c[z>>2]|0;B=A>>>16&255;C=A>>>8&255;D=A&255;A=c[l>>2]|0;E=A>>>16&255;F=A>>>8&255;G=A&255;if(p){H=D;I=C;J=B}else{H=((ca(D,h)|0)>>>0)/255|0;I=((ca(C,g)|0)>>>0)/255|0;J=((ca(B,f)|0)>>>0)/255|0}if(i){K=((ca(H,q)|0)>>>0)/255|0;L=((ca(I,q)|0)>>>0)/255|0;M=((ca(J,q)|0)>>>0)/255|0}else{K=H;L=I;M=J}switch(r|0){case 16:{N=(((ca(E,e)|0)>>>0)/255|0)+K|0;O=(((ca(F,e)|0)>>>0)/255|0)+L|0;P=(((ca(G,e)|0)>>>0)/255|0)+M|0;break}case 32:{B=M+G|0;C=L+F|0;D=K+E|0;N=D>>>0>255?255:D;O=C>>>0>255?255:C;P=B>>>0>255?255:B;break}case 64:{N=((ca(K,E)|0)>>>0)/255|0;O=((ca(L,F)|0)>>>0)/255|0;P=((ca(M,G)|0)>>>0)/255|0;break}default:{N=E;O=F;P=G}}c[l>>2]=O<<8|P|N<<16;if(!y)break;else{l=l+4|0;z=z+4|0}}t=x;u=w;v=c[j>>2]|0}c[b>>2]=t+(c[n>>2]|0);c[k>>2]=u+(c[o>>2]|0);s=v+-1|0;c[j>>2]=s}while((v|0)!=0);return}function hj(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;e=c[b+52>>2]|0;f=d[b+60>>0]|0;g=d[b+61>>0]|0;h=d[b+62>>0]|0;i=a[b+63>>0]|0;j=b+28|0;k=c[j>>2]|0;l=k+-1|0;c[j>>2]=l;if(!k)return;k=b+20|0;m=b+24|0;n=b+12|0;o=b+32|0;p=(e&1|0)==0;q=(e&2|0)==0?255:i&255;i=(e&48|0)!=0&(q|0)!=255;r=e&112;e=q^255;s=l;do{l=c[m>>2]|0;if(!l){t=c[b>>2]|0;u=c[k>>2]|0;v=s}else{w=c[k>>2]|0;x=c[b>>2]|0;y=l;l=w;z=x;while(1){y=y+-1|0;A=c[z>>2]|0;B=A>>>16&255;C=A>>>8&255;D=A&255;A=c[l>>2]|0;E=A>>>16&255;F=A>>>8&255;G=A&255;if(p){H=D;I=C;J=B}else{H=((ca(D,h)|0)>>>0)/255|0;I=((ca(C,g)|0)>>>0)/255|0;J=((ca(B,f)|0)>>>0)/255|0}if(i){K=((ca(H,q)|0)>>>0)/255|0;L=((ca(I,q)|0)>>>0)/255|0;M=((ca(J,q)|0)>>>0)/255|0}else{K=H;L=I;M=J}switch(r|0){case 16:{N=(((ca(G,e)|0)>>>0)/255|0)+K|0;O=(((ca(F,e)|0)>>>0)/255|0)+L|0;P=(((ca(E,e)|0)>>>0)/255|0)+M|0;break}case 32:{B=M+E|0;C=L+F|0;D=K+G|0;N=D>>>0>255?255:D;O=C>>>0>255?255:C;P=B>>>0>255?255:B;break}case 64:{N=((ca(K,G)|0)>>>0)/255|0;O=((ca(L,F)|0)>>>0)/255|0;P=((ca(M,E)|0)>>>0)/255|0;break}default:{N=G;O=F;P=E}}c[l>>2]=O<<8|P<<16|N;if(!y)break;else{l=l+4|0;z=z+4|0}}t=x;u=w;v=c[j>>2]|0}c[b>>2]=t+(c[n>>2]|0);c[k>>2]=u+(c[o>>2]|0);s=v+-1|0;c[j>>2]=s}while((v|0)!=0);return}function oj(d){d=d|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;f=a[d+63>>0]|0;if(f<<24>>24==-128){yi(d,-2082);return}g=c[d+24>>2]|0;h=c[d+28>>2]|0;i=c[d+16>>2]>>1;j=c[d+36>>2]>>1;k=(f&255)>>>3;if(!h)return;f=(g+3|0)/4|0;l=g&3;g=h;h=c[d+20>>2]|0;m=c[d>>2]|0;a:while(1){d=g+-1|0;switch(l|0){case 0:{n=h;o=f;p=m;q=6;break}case 3:{r=h;s=f;t=m;q=7;break}case 2:{u=h;v=f;w=m;q=8;break}case 1:{x=h;y=f;z=m;q=9;break}default:{A=h;B=m;q=10}}while(1)if((q|0)==6){q=0;C=e[p>>1]|0;D=e[n>>1]|0;E=(D<<16|D)&132184095;D=((ca(((C<<16|C)&132184095)-E|0,k)|0)>>>5)+E&132184095;b[n>>1]=D>>>16|D;r=n+2|0;s=o;t=p+2|0;q=7;continue}else if((q|0)==7){q=0;D=e[t>>1]|0;E=e[r>>1]|0;C=(E<<16|E)&132184095;E=((ca(((D<<16|D)&132184095)-C|0,k)|0)>>>5)+C&132184095;b[r>>1]=E>>>16|E;u=r+2|0;v=s;w=t+2|0;q=8;continue}else if((q|0)==8){q=0;E=e[w>>1]|0;C=e[u>>1]|0;D=(C<<16|C)&132184095;C=((ca(((E<<16|E)&132184095)-D|0,k)|0)>>>5)+D&132184095;b[u>>1]=C>>>16|C;x=u+2|0;y=v;z=w+2|0;q=9;continue}else if((q|0)==9){q=0;C=z+2|0;D=e[z>>1]|0;E=e[x>>1]|0;F=(E<<16|E)&132184095;E=((ca(((D<<16|D)&132184095)-F|0,k)|0)>>>5)+F&132184095;F=x+2|0;b[x>>1]=E>>>16|E;if((y|0)>1){n=F;o=y+-1|0;p=C;q=6;continue}else{A=F;B=C;q=10;continue}}else if((q|0)==10){q=0;if(!d)break a;else{g=d;h=A+(j<<1)|0;m=B+(i<<1)|0;continue a}}}return}function pj(d){d=d|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;f=a[d+63>>0]|0;if(f<<24>>24==-128){yi(d,-1058);return}g=c[d+24>>2]|0;h=c[d+28>>2]|0;i=c[d+16>>2]>>1;j=c[d+36>>2]>>1;k=(f&255)>>>3;if(!h)return;f=(g+3|0)/4|0;l=g&3;g=h;h=c[d+20>>2]|0;m=c[d>>2]|0;a:while(1){d=g+-1|0;switch(l|0){case 0:{n=h;o=f;p=m;q=6;break}case 3:{r=h;s=f;t=m;q=7;break}case 2:{u=h;v=f;w=m;q=8;break}case 1:{x=h;y=f;z=m;q=9;break}default:{A=h;B=m;q=10}}while(1)if((q|0)==6){q=0;C=e[p>>1]|0;D=e[n>>1]|0;E=(D<<16|D)&65043487;D=((ca(((C<<16|C)&65043487)-E|0,k)|0)>>>5)+E&65043487;b[n>>1]=D>>>16|D;r=n+2|0;s=o;t=p+2|0;q=7;continue}else if((q|0)==7){q=0;D=e[t>>1]|0;E=e[r>>1]|0;C=(E<<16|E)&65043487;E=((ca(((D<<16|D)&65043487)-C|0,k)|0)>>>5)+C&65043487;b[r>>1]=E>>>16|E;u=r+2|0;v=s;w=t+2|0;q=8;continue}else if((q|0)==8){q=0;E=e[w>>1]|0;C=e[u>>1]|0;D=(C<<16|C)&65043487;C=((ca(((E<<16|E)&65043487)-D|0,k)|0)>>>5)+D&65043487;b[u>>1]=C>>>16|C;x=u+2|0;y=v;z=w+2|0;q=9;continue}else if((q|0)==9){q=0;C=z+2|0;D=e[z>>1]|0;E=e[x>>1]|0;F=(E<<16|E)&65043487;E=((ca(((D<<16|D)&65043487)-F|0,k)|0)>>>5)+F&65043487;F=x+2|0;b[x>>1]=E>>>16|E;if((y|0)>1){n=F;o=y+-1|0;p=C;q=6;continue}else{A=F;B=C;q=10;continue}}else if((q|0)==10){q=0;if(!d)break a;else{g=d;h=A+(j<<1)|0;m=B+(i<<1)|0;continue a}}}return}function rj(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=(c[a+8>>2]<<16|0)/(e|0)|0;g=a+24|0;h=c[g>>2]|0;i=(c[a+4>>2]<<16|0)/(h|0)|0;j=e+-1|0;c[d>>2]=j;if(!e)return;e=a+20|0;k=a+32|0;l=b&112;b=a+12|0;m=c[e>>2]|0;n=h;h=m;o=j;j=m;m=0;p=0;while(1){if((m|0)>65535){q=m+-65536|0;r=q>>>16;s=q-(r<<16)|0;t=p+1+r|0}else{s=m;t=p}if(!n)u=o;else{r=n;q=j;v=65536;w=0;x=-1;while(1){r=r+-1|0;if((v|0)>65535){y=v+-65536|0;z=y>>>16;A=x+1+z|0;B=y-(z<<16)|0;C=(c[a>>2]|0)+((ca(c[b>>2]|0,t)|0)+(A<<2))|0;D=A}else{B=v;C=w;D=x}A=c[C>>2]|0;z=A>>>16&255;y=A>>>8&255;E=A&255;A=c[q>>2]|0;F=A>>>16&255;G=A>>>8&255;H=A&255;I=A>>>24;switch(l|0){case 16:{J=255;K=z;L=y;M=E;break}case 32:{A=F+E|0;N=G+y|0;O=z+H|0;J=I;K=O>>>0>255?255:O;L=N>>>0>255?255:N;M=A>>>0>255?255:A;break}case 64:{J=I;K=((ca(z,H)|0)>>>0)/255|0;L=((ca(G,y)|0)>>>0)/255|0;M=((ca(F,E)|0)>>>0)/255|0;break}default:{J=I;K=H;L=G;M=F}}c[q>>2]=L<<8|M<<16|K|J<<24;if(!r)break;else{q=q+4|0;v=B+i|0;w=C;x=D}}u=c[d>>2]|0}x=h+(c[k>>2]|0)|0;w=u+-1|0;c[d>>2]=w;if(!u){P=x;break}n=c[g>>2]|0;h=x;o=w;j=x;m=s+f|0;p=t}c[e>>2]=P;return}function qj(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=(c[a+8>>2]<<16|0)/(e|0)|0;g=a+24|0;h=c[g>>2]|0;i=(c[a+4>>2]<<16|0)/(h|0)|0;j=e+-1|0;c[d>>2]=j;if(!e)return;e=a+20|0;k=a+32|0;l=b&112;b=a+12|0;m=c[e>>2]|0;n=h;h=m;o=j;j=m;m=0;p=0;while(1){if((m|0)>65535){q=m+-65536|0;r=q>>>16;s=q-(r<<16)|0;t=p+1+r|0}else{s=m;t=p}if(!n)u=o;else{r=n;q=j;v=65536;w=0;x=-1;while(1){r=r+-1|0;if((v|0)>65535){y=v+-65536|0;z=y>>>16;A=x+1+z|0;B=y-(z<<16)|0;C=(c[a>>2]|0)+((ca(c[b>>2]|0,t)|0)+(A<<2))|0;D=A}else{B=v;C=w;D=x}A=c[C>>2]|0;z=A>>>16&255;y=A>>>8&255;E=A&255;A=c[q>>2]|0;F=A>>>16&255;G=A>>>8&255;H=A&255;I=A>>>24;switch(l|0){case 16:{J=255;K=E;L=y;M=z;break}case 32:{A=F+z|0;N=G+y|0;O=H+E|0;J=I;K=O>>>0>255?255:O;L=N>>>0>255?255:N;M=A>>>0>255?255:A;break}case 64:{J=I;K=((ca(H,E)|0)>>>0)/255|0;L=((ca(G,y)|0)>>>0)/255|0;M=((ca(F,z)|0)>>>0)/255|0;break}default:{J=I;K=H;L=G;M=F}}c[q>>2]=L<<8|M<<16|K|J<<24;if(!r)break;else{q=q+4|0;v=B+i|0;w=C;x=D}}u=c[d>>2]|0}x=h+(c[k>>2]|0)|0;w=u+-1|0;c[d>>2]=w;if(!u){P=x;break}n=c[g>>2]|0;h=x;o=w;j=x;m=s+f|0;p=t}c[e>>2]=P;return}function nj(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;f=i;i=i+16|0;g=f;if(!b){h=c[d>>2]|0;j=c[h>>2]|0;if(!j){k=0;i=f;return k|0}else{l=0;m=j;n=h}while(1){if(m>>>0>127){h=tn(g,m,0)|0;if((h|0)==-1){k=-1;o=26;break}else p=h}else p=1;h=p+l|0;n=n+4|0;m=c[n>>2]|0;if(!m){k=h;o=26;break}else l=h}if((o|0)==26){i=f;return k|0}}a:do if(e>>>0>3){l=b;m=e;n=c[d>>2]|0;while(1){p=c[n>>2]|0;if((p+-1|0)>>>0>126){if(!p){q=l;r=m;break}h=tn(l,p,0)|0;if((h|0)==-1){k=-1;o=26;break}s=l+h|0;t=m-h|0;u=n}else{a[l>>0]=p;s=l+1|0;t=m+-1|0;u=c[d>>2]|0}n=u+4|0;c[d>>2]=n;if(t>>>0<=3){v=s;w=t;break a}else{l=s;m=t}}if((o|0)==26){i=f;return k|0}a[q>>0]=0;c[d>>2]=0;k=e-r|0;i=f;return k|0}else{v=b;w=e}while(0);if(!w){k=e;i=f;return k|0}b=v;v=w;w=c[d>>2]|0;while(1){r=c[w>>2]|0;if((r+-1|0)>>>0>126){if(!r){x=b;y=v;o=19;break}q=tn(g,r,0)|0;if((q|0)==-1){k=-1;o=26;break}if(v>>>0<q>>>0){z=v;o=22;break}tn(b,c[w>>2]|0,0)|0;A=b+q|0;B=v-q|0;C=w}else{a[b>>0]=r;A=b+1|0;B=v+-1|0;C=c[d>>2]|0}w=C+4|0;c[d>>2]=w;if(!B){k=e;o=26;break}else{b=A;v=B}}if((o|0)==19){a[x>>0]=0;c[d>>2]=0;k=e-y|0;i=f;return k|0}else if((o|0)==22){k=e-z|0;i=f;return k|0}else if((o|0)==26){i=f;return k|0}return 0}function Rj(b){b=b|0;var e=0,f=0,g=0,h=0,i=0;e=c[b+4>>2]|0;f=c[b+52>>2]|0;b=c[(c[f>>2]|0)+4>>2]|0;switch(c[f+68>>2]&-28673|0){case 16:{switch(d[b+9>>0]|0){case 2:{if((a[e+9>>0]|0)!=4){g=249;return g|0}if((c[e+24>>2]|0)!=-16777216){g=249;return g|0}if((c[e+16>>2]|0)!=65280){g=249;return g|0}if(!((c[e+12>>2]|0)==255?(c[b+12>>2]|0)==31:0)){if((c[e+20>>2]|0)!=255){g=249;return g|0}if((c[b+20>>2]|0)!=31){g=249;return g|0}}h=c[b+16>>2]|0;g=(h|0)==2016?251:(h|0)==992?250:249;return g|0}case 4:{if(((((c[e+12>>2]|0)==(c[b+12>>2]|0)?(c[e+16>>2]|0)==(c[b+16>>2]|0):0)?(c[e+20>>2]|0)==(c[b+20>>2]|0):0)?(a[e+9>>0]|0)==4:0)?(c[e+24>>2]|0)==-16777216:0){g=258;return g|0}g=249;return g|0}case 1:{g=257;return g|0}default:{g=249;return g|0}}break}case 18:{if(c[e+24>>2]|0){g=0;return g|0}switch(d[b+9>>0]|0){case 2:{if(!(c[f+4>>2]|0)){g=252;return g|0}f=c[b+16>>2]|0;g=(f|0)==2016?254:(f|0)==992?253:252;return g|0}case 4:{f=c[e+12>>2]|0;if(((((f|0)==(c[b+12>>2]|0)?(h=c[e+16>>2]|0,(h|0)==(c[b+16>>2]|0)):0)?(i=c[e+20>>2]|0,(i|0)==(c[b+20>>2]|0)):0)?(a[e+9>>0]|0)==4:0)?(h|f|i|0)==16777215:0){g=260;return g|0}g=252;return g|0}case 1:{g=259;return g|0}default:{g=252;return g|0}}break}case 274:{if(c[e+24>>2]|0){g=0;return g|0}g=(a[b+9>>0]|0)==1?256:255;return g|0}default:{g=0;return g|0}}return 0}function Ri(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;g=i;i=i+32|0;h=g+16|0;j=g+24|0;k=g+20|0;if(!b){Cj(24781,g)|0;l=0;i=g;return l|0}Pf[c[b+4>>2]&15](b,0,0,1)|0;if((G|0)<0){Cj(24807,g+8|0)|0;if(!e){l=0;i=g;return l|0}Af[c[b+16>>2]&127](b)|0;l=0;i=g;return l|0}if((c[b+20>>2]|0)==2?(m=_b(c[b+28>>2]|0,j|0,k|0)|0,(m|0)!=0):0){n=ck(0,c[j>>2]|0,c[k>>2]|0,32,255,65280,16711680,-16777216)|0;if(n)dp(c[n+20>>2]|0,m|0,ca(c[j>>2]<<2,c[k>>2]|0)|0)|0;yg(m);if(!e){l=n;i=g;return l|0}Af[c[b+16>>2]&127](b)|0;l=n;i=g;return l|0}a:do if(!f){n=0;while(1){if(!n){n=1;continue}if(Af[c[14256+(n*12|0)+4>>2]&127](b)|0){o=n;p=24;break a}n=n+1|0;if(n>>>0>=15){p=27;break}}}else{n=0;while(1){b:do if(!n){m=a[f>>0]|0;c:do if(m<<24>>24){k=f;j=24838;q=m;while(1){if(!(a[j>>0]|0))break b;r=gy(q&255)|0;if((r|0)!=(gy(d[j>>0]|0)|0)){s=k;t=j;break}k=k+1|0;r=j+1|0;q=a[k>>0]|0;if(!(q<<24>>24)){u=r;break c}else j=r}if(!(a[s>>0]|0))u=t;else break b}else u=24838;while(0);if(!(a[u>>0]|0)){o=0;p=24;break a}}else if(Af[c[14256+(n*12|0)+4>>2]&127](b)|0){o=n;p=24;break a}while(0);n=n+1|0;if(n>>>0>=15){p=27;break}}}while(0);if((p|0)==24){u=Af[c[14256+(o*12|0)+8>>2]&127](b)|0;if(!e){l=u;i=g;return l|0}Af[c[b+16>>2]&127](b)|0;l=u;i=g;return l|0}else if((p|0)==27){if(e)Af[c[b+16>>2]&127](b)|0;Cj(24842,h)|0;l=0;i=g;return l|0}return 0}function uj(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;e=a+4|0;f=c[e>>2]|0;g=a+100|0;if(f>>>0<(c[g>>2]|0)>>>0){c[e>>2]=f+1;h=d[f>>0]|0}else h=Cm(a)|0;switch(h|0){case 43:case 45:{f=(h|0)==45&1;i=c[e>>2]|0;if(i>>>0<(c[g>>2]|0)>>>0){c[e>>2]=i+1;j=d[i>>0]|0}else j=Cm(a)|0;if((b|0)!=0&(j+-48|0)>>>0>9?(c[g>>2]|0)!=0:0){c[e>>2]=(c[e>>2]|0)+-1;k=j;l=f}else{k=j;l=f}break}default:{k=h;l=0}}if((k+-48|0)>>>0>9){if(!(c[g>>2]|0)){m=-2147483648;n=0;G=m;return n|0}c[e>>2]=(c[e>>2]|0)+-1;m=-2147483648;n=0;G=m;return n|0}else{o=k;p=0}while(1){k=o+-48+(p*10|0)|0;h=c[e>>2]|0;if(h>>>0<(c[g>>2]|0)>>>0){c[e>>2]=h+1;q=d[h>>0]|0}else q=Cm(a)|0;if((q+-48|0)>>>0<10&(k|0)<214748364){o=q;p=k}else{r=k;s=q;break}}q=((r|0)<0)<<31>>31;if((s+-48|0)>>>0<10){p=r;o=q;k=s;while(1){h=Kr(p|0,o|0,10,0)|0;f=G;j=tt(k|0,((k|0)<0)<<31>>31|0,-48,-1)|0;b=tt(j|0,G|0,h|0,f|0)|0;f=G;h=c[e>>2]|0;if(h>>>0<(c[g>>2]|0)>>>0){c[e>>2]=h+1;t=d[h>>0]|0}else t=Cm(a)|0;if((t+-48|0)>>>0<10&((f|0)<21474836|(f|0)==21474836&b>>>0<2061584302)){p=b;o=f;k=t}else{u=b;v=f;w=t;break}}}else{u=r;v=q;w=s}if((w+-48|0)>>>0<10)do{w=c[e>>2]|0;if(w>>>0<(c[g>>2]|0)>>>0){c[e>>2]=w+1;x=d[w>>0]|0}else x=Cm(a)|0}while((x+-48|0)>>>0<10);if(c[g>>2]|0)c[e>>2]=(c[e>>2]|0)+-1;e=(l|0)!=0;l=Fs(0,0,u|0,v|0)|0;m=e?G:v;n=e?l:u;G=m;return n|0}function mj(b,e,f,g,h,i,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0;a:do if(b<<24>>24==i<<24>>24)if(a[e>>0]|0){a[e>>0]=0;p=c[h>>2]|0;c[h>>2]=p+1;a[p>>0]=46;p=a[k>>0]|0;if((((p&1)==0?(p&255)>>>1:c[k+4>>2]|0)|0)!=0?(p=c[m>>2]|0,(p-l|0)<160):0){q=c[n>>2]|0;c[m>>2]=p+4;c[p>>2]=q;r=0}else r=0}else r=-1;else{if(b<<24>>24==j<<24>>24?(q=a[k>>0]|0,(((q&1)==0?(q&255)>>>1:c[k+4>>2]|0)|0)!=0):0){if(!(a[e>>0]|0)){r=-1;break}q=c[m>>2]|0;if((q-l|0)>=160){r=0;break}p=c[n>>2]|0;c[m>>2]=q+4;c[q>>2]=p;c[n>>2]=0;r=0;break}p=o+32|0;q=o;while(1){if((a[q>>0]|0)==b<<24>>24){s=q;break}q=q+1|0;if((q|0)==(p|0)){s=p;break}}p=s-o|0;if((p|0)>31)r=-1;else{q=a[32305+p>>0]|0;switch(p|0){case 24:case 25:{t=c[h>>2]|0;if((t|0)!=(g|0)?(d[t+-1>>0]&95|0)!=(d[f>>0]&127|0):0){r=-1;break a}c[h>>2]=t+1;a[t>>0]=q;r=0;break a;break}case 23:case 22:{a[f>>0]=80;t=c[h>>2]|0;c[h>>2]=t+1;a[t>>0]=q;r=0;break a;break}default:{t=q&95;if((((t|0)==(a[f>>0]|0)?(a[f>>0]=t|128,(a[e>>0]|0)!=0):0)?(a[e>>0]=0,t=a[k>>0]|0,(((t&1)==0?(t&255)>>>1:c[k+4>>2]|0)|0)!=0):0)?(t=c[m>>2]|0,(t-l|0)<160):0){u=c[n>>2]|0;c[m>>2]=t+4;c[t>>2]=u}u=c[h>>2]|0;c[h>>2]=u+1;a[u>>0]=q;if((p|0)>21){r=0;break a}c[n>>2]=(c[n>>2]|0)+1;r=0;break a}}}}while(0);return r|0}function zj(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=(c[a+8>>2]<<16|0)/(e|0)|0;g=a+24|0;h=c[g>>2]|0;i=(c[a+4>>2]<<16|0)/(h|0)|0;j=e+-1|0;c[d>>2]=j;if(!e)return;e=a+20|0;k=a+32|0;l=b&112;b=a+12|0;m=c[e>>2]|0;n=h;h=m;o=j;j=m;m=0;p=0;while(1){if((m|0)>65535){q=m+-65536|0;r=q>>>16;s=q-(r<<16)|0;t=p+1+r|0}else{s=m;t=p}if(!n)u=o;else{r=n;q=j;v=65536;w=0;x=-1;while(1){r=r+-1|0;if((v|0)>65535){y=v+-65536|0;z=y>>>16;A=x+1+z|0;B=y-(z<<16)|0;C=(c[a>>2]|0)+((ca(c[b>>2]|0,t)|0)+(A<<2))|0;D=A}else{B=v;C=w;D=x}A=c[C>>2]|0;z=A>>>16&255;y=A>>>8&255;E=A&255;A=c[q>>2]|0;F=A>>>16&255;G=A>>>8&255;H=A&255;switch(l|0){case 16:{I=z;J=y;K=E;break}case 32:{A=H+E|0;L=G+y|0;M=F+z|0;I=M>>>0>255?255:M;J=L>>>0>255?255:L;K=A>>>0>255?255:A;break}case 64:{I=((ca(F,z)|0)>>>0)/255|0;J=((ca(G,y)|0)>>>0)/255|0;K=((ca(H,E)|0)>>>0)/255|0;break}default:{I=F;J=G;K=H}}c[q>>2]=J<<8|K|I<<16;if(!r)break;else{q=q+4|0;v=B+i|0;w=C;x=D}}u=c[d>>2]|0}x=h+(c[k>>2]|0)|0;w=u+-1|0;c[d>>2]=w;if(!u){N=x;break}n=c[g>>2]|0;h=x;o=w;j=x;m=s+f|0;p=t}c[e>>2]=N;return}function yj(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=(c[a+8>>2]<<16|0)/(e|0)|0;g=a+24|0;h=c[g>>2]|0;i=(c[a+4>>2]<<16|0)/(h|0)|0;j=e+-1|0;c[d>>2]=j;if(!e)return;e=a+20|0;k=a+32|0;l=b&112;b=a+12|0;m=c[e>>2]|0;n=h;h=m;o=j;j=m;m=0;p=0;while(1){if((m|0)>65535){q=m+-65536|0;r=q>>>16;s=q-(r<<16)|0;t=p+1+r|0}else{s=m;t=p}if(!n)u=o;else{r=n;q=j;v=65536;w=0;x=-1;while(1){r=r+-1|0;if((v|0)>65535){y=v+-65536|0;z=y>>>16;A=x+1+z|0;B=y-(z<<16)|0;C=(c[a>>2]|0)+((ca(c[b>>2]|0,t)|0)+(A<<2))|0;D=A}else{B=v;C=w;D=x}A=c[C>>2]|0;z=A>>>16&255;y=A>>>8&255;E=A&255;A=c[q>>2]|0;F=A>>>16&255;G=A>>>8&255;H=A&255;switch(l|0){case 16:{I=z;J=y;K=E;break}case 32:{A=F+E|0;L=G+y|0;M=z+H|0;I=M>>>0>255?255:M;J=L>>>0>255?255:L;K=A>>>0>255?255:A;break}case 64:{I=((ca(z,H)|0)>>>0)/255|0;J=((ca(G,y)|0)>>>0)/255|0;K=((ca(F,E)|0)>>>0)/255|0;break}default:{I=H;J=G;K=F}}c[q>>2]=J<<8|K<<16|I;if(!r)break;else{q=q+4|0;v=B+i|0;w=C;x=D}}u=c[d>>2]|0}x=h+(c[k>>2]|0)|0;w=u+-1|0;c[d>>2]=w;if(!u){N=x;break}n=c[g>>2]|0;h=x;o=w;j=x;m=s+f|0;p=t}c[e>>2]=N;return}function xj(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=(c[a+8>>2]<<16|0)/(e|0)|0;g=a+24|0;h=c[g>>2]|0;i=(c[a+4>>2]<<16|0)/(h|0)|0;j=e+-1|0;c[d>>2]=j;if(!e)return;e=a+20|0;k=a+32|0;l=b&112;b=a+12|0;m=c[e>>2]|0;n=h;h=m;o=j;j=m;m=0;p=0;while(1){if((m|0)>65535){q=m+-65536|0;r=q>>>16;s=q-(r<<16)|0;t=p+1+r|0}else{s=m;t=p}if(!n)u=o;else{r=n;q=j;v=65536;w=0;x=-1;while(1){r=r+-1|0;if((v|0)>65535){y=v+-65536|0;z=y>>>16;A=x+1+z|0;B=y-(z<<16)|0;C=(c[a>>2]|0)+((ca(c[b>>2]|0,t)|0)+(A<<2))|0;D=A}else{B=v;C=w;D=x}A=c[C>>2]|0;z=A>>>16&255;y=A>>>8&255;E=A&255;A=c[q>>2]|0;F=A>>>16&255;G=A>>>8&255;H=A&255;switch(l|0){case 16:{I=E;J=y;K=z;break}case 32:{A=z+H|0;L=G+y|0;M=F+E|0;I=M>>>0>255?255:M;J=L>>>0>255?255:L;K=A>>>0>255?255:A;break}case 64:{I=((ca(F,E)|0)>>>0)/255|0;J=((ca(G,y)|0)>>>0)/255|0;K=((ca(z,H)|0)>>>0)/255|0;break}default:{I=F;J=G;K=H}}c[q>>2]=J<<8|K|I<<16;if(!r)break;else{q=q+4|0;v=B+i|0;w=C;x=D}}u=c[d>>2]|0}x=h+(c[k>>2]|0)|0;w=u+-1|0;c[d>>2]=w;if(!u){N=x;break}n=c[g>>2]|0;h=x;o=w;j=x;m=s+f|0;p=t}c[e>>2]=N;return}function wj(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=(c[a+8>>2]<<16|0)/(e|0)|0;g=a+24|0;h=c[g>>2]|0;i=(c[a+4>>2]<<16|0)/(h|0)|0;j=e+-1|0;c[d>>2]=j;if(!e)return;e=a+20|0;k=a+32|0;l=b&112;b=a+12|0;m=c[e>>2]|0;n=h;h=m;o=j;j=m;m=0;p=0;while(1){if((m|0)>65535){q=m+-65536|0;r=q>>>16;s=q-(r<<16)|0;t=p+1+r|0}else{s=m;t=p}if(!n)u=o;else{r=n;q=j;v=65536;w=0;x=-1;while(1){r=r+-1|0;if((v|0)>65535){y=v+-65536|0;z=y>>>16;A=x+1+z|0;B=y-(z<<16)|0;C=(c[a>>2]|0)+((ca(c[b>>2]|0,t)|0)+(A<<2))|0;D=A}else{B=v;C=w;D=x}A=c[C>>2]|0;z=A>>>16&255;y=A>>>8&255;E=A&255;A=c[q>>2]|0;F=A>>>16&255;G=A>>>8&255;H=A&255;switch(l|0){case 16:{I=E;J=y;K=z;break}case 32:{A=F+z|0;L=G+y|0;M=H+E|0;I=M>>>0>255?255:M;J=L>>>0>255?255:L;K=A>>>0>255?255:A;break}case 64:{I=((ca(H,E)|0)>>>0)/255|0;J=((ca(G,y)|0)>>>0)/255|0;K=((ca(F,z)|0)>>>0)/255|0;break}default:{I=H;J=G;K=F}}c[q>>2]=J<<8|K<<16|I;if(!r)break;else{q=q+4|0;v=B+i|0;w=C;x=D}}u=c[d>>2]|0}x=h+(c[k>>2]|0)|0;w=u+-1|0;c[d>>2]=w;if(!u){N=x;break}n=c[g>>2]|0;h=x;o=w;j=x;m=s+f|0;p=t}c[e>>2]=N;return}function Cj(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0.0,w=0,x=0;e=i;i=i+32|0;f=e;g=e+8|0;if(!b){i=e;return -1}c[2]=1;sr(12,b,128)|0;c[g>>2]=d;c[35]=0;d=a[b>>0]|0;a:do if(d<<24>>24){j=b;k=0;l=d;while(1){m=j+1|0;if(l<<24>>24==37){n=m;while(1){o=a[n>>0]|0;if(o<<24>>24!=46){p=n+1|0;if((o+-48&255)<10){n=p;continue}else{q=n;r=o;s=p;break}}else{n=n+1|0;continue}}switch(r<<24>>24|0){case 0:{t=q;u=k;break}case 88:case 120:case 111:case 117:case 100:case 105:case 99:{n=(c[g>>2]|0)+(4-1)&~(4-1);p=c[n>>2]|0;c[g>>2]=n+4;n=k+1|0;c[35]=n;c[144+(k<<7)>>2]=p;t=s;u=n;break}case 102:{n=(c[g>>2]|0)+(8-1)&~(8-1);v=+h[n>>3];c[g>>2]=n+8;n=k+1|0;c[35]=n;h[144+(k<<7)>>3]=v;t=s;u=n;break}case 112:{n=(c[g>>2]|0)+(4-1)&~(4-1);p=c[n>>2]|0;c[g>>2]=n+4;n=k+1|0;c[35]=n;c[144+(k<<7)>>2]=p;t=s;u=n;break}case 115:{n=(c[g>>2]|0)+(4-1)&~(4-1);p=c[n>>2]|0;c[g>>2]=n+4;sr(144+(k<<7)|0,(p|0)==0?31736:p,128)|0;p=(c[35]|0)+1|0;c[35]=p;t=s;u=p;break}default:{t=s;u=k}}if((u|0)>4)break a;else{w=t;x=u}}else{w=m;x=k}l=a[w>>0]|0;if(!(l<<24>>24))break;else{j=w;k=x}}}while(0);Sh()|0;c[f>>2]=22537;ys(1,22534,f);i=e;return -1}function hi(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;b=i;i=i+1008|0;k=b+8|0;l=b;m=b+896|0;n=b+888|0;o=b+488|0;p=b+480|0;q=b+892|0;r=b+72|0;s=b+68|0;t=b+56|0;u=b+44|0;v=b+32|0;w=b+28|0;x=b+80|0;y=b+24|0;z=b+20|0;A=b+16|0;c[n>>2]=m;h[k>>3]=j;B=Tr(m,100,33788,k)|0;if(B>>>0>99){m=Ps()|0;h[l>>3]=j;C=Bq(n,m,33788,l)|0;l=c[n>>2]|0;if(!l)Iv();m=_f(C<<2)|0;if(!m)Iv();else{D=m;E=l;F=m;G=C}}else{D=0;E=0;F=o;G=B}B=Hs(f)|0;c[p>>2]=B;o=Ds(p,18268)|0;C=c[n>>2]|0;Pf[c[(c[o>>2]|0)+48>>2]&15](o,C,C+G|0,F)|0;if(!G)H=0;else H=(a[c[n>>2]>>0]|0)==45;c[t>>2]=0;c[t+4>>2]=0;c[t+8>>2]=0;c[u>>2]=0;c[u+4>>2]=0;c[u+8>>2]=0;c[v>>2]=0;c[v+4>>2]=0;c[v+8>>2]=0;Pg(e,H,p,q,r,s,t,u,v,w);e=c[w>>2]|0;if((G|0)>(e|0)){w=a[v>>0]|0;n=a[u>>0]|0;I=(G-e<<1|1)+e+((w&1)==0?(w&255)>>>1:c[v+4>>2]|0)+((n&1)==0?(n&255)>>>1:c[u+4>>2]|0)|0}else{n=a[v>>0]|0;w=a[u>>0]|0;I=e+2+((n&1)==0?(n&255)>>>1:c[v+4>>2]|0)+((w&1)==0?(w&255)>>>1:c[u+4>>2]|0)|0}if(I>>>0>100){w=_f(I<<2)|0;if(!w)Iv();else{J=w;K=w}}else{J=0;K=x}Qg(K,y,z,c[f+4>>2]|0,F,F+(G<<2)|0,o,H,q,c[r>>2]|0,c[s>>2]|0,t,u,v,e);c[A>>2]=c[d>>2];d=c[y>>2]|0;y=c[z>>2]|0;c[k>>2]=c[A>>2];A=pl(k,K,d,y,f,g)|0;if(!J)L=B;else{yg(J);L=c[p>>2]|0}zu(v);zu(u);Au(t);lr(L)|0;if(D)yg(D);if(E)yg(E);i=b;return A|0}function Xi(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;a=c[b>>2]|0;do if(a){g=c[a+12>>2]|0;if((g|0)==(c[a+16>>2]|0))h=Af[c[(c[a>>2]|0)+36>>2]&127](a)|0;else h=c[g>>2]|0;if((h|0)==-1){c[b>>2]=0;i=1;break}else{i=(c[b>>2]|0)==0;break}}else i=1;while(0);h=c[d>>2]|0;do if(h){a=c[h+12>>2]|0;if((a|0)==(c[h+16>>2]|0))j=Af[c[(c[h>>2]|0)+36>>2]&127](h)|0;else j=c[a>>2]|0;if((j|0)!=-1)if(i){k=h;l=17;break}else{l=16;break}else{c[d>>2]=0;l=14;break}}else l=14;while(0);if((l|0)==14)if(i)l=16;else{k=0;l=17}a:do if((l|0)==16)c[e>>2]=c[e>>2]|6;else if((l|0)==17){i=c[b>>2]|0;h=c[i+12>>2]|0;if((h|0)==(c[i+16>>2]|0))m=Af[c[(c[i>>2]|0)+36>>2]&127](i)|0;else m=c[h>>2]|0;if((Ef[c[(c[f>>2]|0)+52>>2]&31](f,m,0)|0)<<24>>24!=37){c[e>>2]=c[e>>2]|4;break}h=c[b>>2]|0;i=h+12|0;j=c[i>>2]|0;if((j|0)==(c[h+16>>2]|0)){Af[c[(c[h>>2]|0)+40>>2]&127](h)|0;a=c[b>>2]|0;if(!a)n=1;else{o=a;l=25}}else{c[i>>2]=j+4;o=h;l=25}do if((l|0)==25){h=c[o+12>>2]|0;if((h|0)==(c[o+16>>2]|0))p=Af[c[(c[o>>2]|0)+36>>2]&127](o)|0;else p=c[h>>2]|0;if((p|0)==-1){c[b>>2]=0;n=1;break}else{n=(c[b>>2]|0)==0;break}}while(0);do if(k){h=c[k+12>>2]|0;if((h|0)==(c[k+16>>2]|0))q=Af[c[(c[k>>2]|0)+36>>2]&127](k)|0;else q=c[h>>2]|0;if((q|0)!=-1)if(n)break a;else break;else{c[d>>2]=0;l=37;break}}else l=37;while(0);if((l|0)==37?!n:0)break;c[e>>2]=c[e>>2]|2}while(0);return}function Hj(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=e+-1|0;c[d>>2]=f;if(!e)return;e=a+20|0;g=a+24|0;h=a+12|0;i=a+32|0;j=(b&48|0)!=0;k=b&112;b=f;do{f=c[g>>2]|0;if(!f){l=c[a>>2]|0;m=c[e>>2]|0;n=b}else{o=c[e>>2]|0;p=c[a>>2]|0;q=f;f=o;r=p;while(1){q=q+-1|0;s=c[r>>2]|0;t=s>>>16&255;u=s>>>8&255;v=s&255;w=s>>>24;s=c[f>>2]|0;x=s>>>16&255;y=s>>>8&255;z=s&255;A=s>>>24;if(j&(w|0)!=255){B=((ca(t,w)|0)>>>0)/255|0;C=((ca(u,w)|0)>>>0)/255|0;D=((ca(v,w)|0)>>>0)/255|0}else{B=t;C=u;D=v}switch(k|0){case 16:{v=w^255;E=(((ca(v,A)|0)>>>0)/255|0)+w|0;F=(((ca(v,z)|0)>>>0)/255|0)+B|0;G=(((ca(y,v)|0)>>>0)/255|0)+C|0;H=(((ca(x,v)|0)>>>0)/255|0)+D|0;break}case 32:{v=D+x|0;w=C+y|0;u=B+z|0;E=A;F=u>>>0>255?255:u;G=w>>>0>255?255:w;H=v>>>0>255?255:v;break}case 64:{E=A;F=((ca(B,z)|0)>>>0)/255|0;G=((ca(C,y)|0)>>>0)/255|0;H=((ca(D,x)|0)>>>0)/255|0;break}default:{E=A;F=z;G=y;H=x}}c[f>>2]=G<<8|H<<16|F|E<<24;if(!q)break;else{f=f+4|0;r=r+4|0}}l=p;m=o;n=c[d>>2]|0}c[a>>2]=l+(c[h>>2]|0);c[e>>2]=m+(c[i>>2]|0);b=n+-1|0;c[d>>2]=b}while((n|0)!=0);return}function Gj(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=e+-1|0;c[d>>2]=f;if(!e)return;e=a+20|0;g=a+24|0;h=a+12|0;i=a+32|0;j=(b&48|0)!=0;k=b&112;b=f;do{f=c[g>>2]|0;if(!f){l=c[a>>2]|0;m=c[e>>2]|0;n=b}else{o=c[e>>2]|0;p=c[a>>2]|0;q=f;f=o;r=p;while(1){q=q+-1|0;s=c[r>>2]|0;t=s>>>16&255;u=s>>>8&255;v=s&255;w=s>>>24;s=c[f>>2]|0;x=s>>>16&255;y=s>>>8&255;z=s&255;A=s>>>24;if(j&(w|0)!=255){B=((ca(v,w)|0)>>>0)/255|0;C=((ca(u,w)|0)>>>0)/255|0;D=((ca(t,w)|0)>>>0)/255|0}else{B=v;C=u;D=t}switch(k|0){case 16:{t=w^255;E=(((ca(t,A)|0)>>>0)/255|0)+w|0;F=(((ca(t,z)|0)>>>0)/255|0)+B|0;G=(((ca(y,t)|0)>>>0)/255|0)+C|0;H=(((ca(x,t)|0)>>>0)/255|0)+D|0;break}case 32:{t=D+x|0;w=C+y|0;u=B+z|0;E=A;F=u>>>0>255?255:u;G=w>>>0>255?255:w;H=t>>>0>255?255:t;break}case 64:{E=A;F=((ca(B,z)|0)>>>0)/255|0;G=((ca(C,y)|0)>>>0)/255|0;H=((ca(D,x)|0)>>>0)/255|0;break}default:{E=A;F=z;G=y;H=x}}c[f>>2]=G<<8|H<<16|F|E<<24;if(!q)break;else{f=f+4|0;r=r+4|0}}l=p;m=o;n=c[d>>2]|0}c[a>>2]=l+(c[h>>2]|0);c[e>>2]=m+(c[i>>2]|0);b=n+-1|0;c[d>>2]=b}while((n|0)!=0);return}function Fj(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=e+-1|0;c[d>>2]=f;if(!e)return;e=a+20|0;g=a+24|0;h=a+12|0;i=a+32|0;j=(b&48|0)!=0;k=b&112;b=f;do{f=c[g>>2]|0;if(!f){l=c[a>>2]|0;m=c[e>>2]|0;n=b}else{o=c[e>>2]|0;p=c[a>>2]|0;q=f;f=o;r=p;while(1){q=q+-1|0;s=c[r>>2]|0;t=s>>>24;u=s>>>16&255;v=s>>>8&255;w=s&255;s=c[f>>2]|0;x=s>>>16&255;y=s>>>8&255;z=s&255;A=s>>>24;if(j&(w|0)!=255){B=((ca(t,w)|0)>>>0)/255|0;C=((ca(u,w)|0)>>>0)/255|0;D=((ca(v,w)|0)>>>0)/255|0}else{B=t;C=u;D=v}switch(k|0){case 16:{v=w^255;E=(((ca(v,A)|0)>>>0)/255|0)+w|0;F=(((ca(v,z)|0)>>>0)/255|0)+B|0;G=(((ca(y,v)|0)>>>0)/255|0)+C|0;H=(((ca(x,v)|0)>>>0)/255|0)+D|0;break}case 32:{v=D+x|0;w=C+y|0;u=B+z|0;E=A;F=u>>>0>255?255:u;G=w>>>0>255?255:w;H=v>>>0>255?255:v;break}case 64:{E=A;F=((ca(B,z)|0)>>>0)/255|0;G=((ca(C,y)|0)>>>0)/255|0;H=((ca(D,x)|0)>>>0)/255|0;break}default:{E=A;F=z;G=y;H=x}}c[f>>2]=G<<8|H<<16|F|E<<24;if(!q)break;else{f=f+4|0;r=r+4|0}}l=p;m=o;n=c[d>>2]|0}c[a>>2]=l+(c[h>>2]|0);c[e>>2]=m+(c[i>>2]|0);b=n+-1|0;c[d>>2]=b}while((n|0)!=0);return}function Ej(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=e+-1|0;c[d>>2]=f;if(!e)return;e=a+20|0;g=a+24|0;h=a+12|0;i=a+32|0;j=(b&48|0)!=0;k=b&112;b=f;do{f=c[g>>2]|0;if(!f){l=c[a>>2]|0;m=c[e>>2]|0;n=b}else{o=c[e>>2]|0;p=c[a>>2]|0;q=f;f=o;r=p;while(1){q=q+-1|0;s=c[r>>2]|0;t=s>>>24;u=s>>>16&255;v=s>>>8&255;w=s&255;s=c[f>>2]|0;x=s>>>16&255;y=s>>>8&255;z=s&255;A=s>>>24;if(j&(w|0)!=255){B=((ca(v,w)|0)>>>0)/255|0;C=((ca(u,w)|0)>>>0)/255|0;D=((ca(t,w)|0)>>>0)/255|0}else{B=v;C=u;D=t}switch(k|0){case 16:{t=w^255;E=(((ca(t,A)|0)>>>0)/255|0)+w|0;F=(((ca(t,z)|0)>>>0)/255|0)+B|0;G=(((ca(y,t)|0)>>>0)/255|0)+C|0;H=(((ca(x,t)|0)>>>0)/255|0)+D|0;break}case 32:{t=D+x|0;w=C+y|0;u=B+z|0;E=A;F=u>>>0>255?255:u;G=w>>>0>255?255:w;H=t>>>0>255?255:t;break}case 64:{E=A;F=((ca(B,z)|0)>>>0)/255|0;G=((ca(C,y)|0)>>>0)/255|0;H=((ca(D,x)|0)>>>0)/255|0;break}default:{E=A;F=z;G=y;H=x}}c[f>>2]=G<<8|H<<16|F|E<<24;if(!q)break;else{f=f+4|0;r=r+4|0}}l=p;m=o;n=c[d>>2]|0}c[a>>2]=l+(c[h>>2]|0);c[e>>2]=m+(c[i>>2]|0);b=n+-1|0;c[d>>2]=b}while((n|0)!=0);return}function mi(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;b=i;i=i+384|0;k=b+8|0;l=b;m=b+284|0;n=b+72|0;o=b+184|0;p=b+68|0;q=b+80|0;r=b+77|0;s=b+76|0;t=b+56|0;u=b+44|0;v=b+32|0;w=b+28|0;x=b+84|0;y=b+24|0;z=b+20|0;A=b+16|0;c[n>>2]=m;h[k>>3]=j;B=Tr(m,100,33788,k)|0;if(B>>>0>99){m=Ps()|0;h[l>>3]=j;C=Bq(n,m,33788,l)|0;l=c[n>>2]|0;if(!l)Iv();m=_f(C)|0;if(!m)Iv();else{D=m;E=l;F=m;G=C}}else{D=0;E=0;F=o;G=B}B=Hs(f)|0;c[p>>2]=B;o=Ds(p,18276)|0;C=c[n>>2]|0;Pf[c[(c[o>>2]|0)+32>>2]&15](o,C,C+G|0,F)|0;if(!G)H=0;else H=(a[c[n>>2]>>0]|0)==45;c[t>>2]=0;c[t+4>>2]=0;c[t+8>>2]=0;c[u>>2]=0;c[u+4>>2]=0;c[u+8>>2]=0;c[v>>2]=0;c[v+4>>2]=0;c[v+8>>2]=0;Lg(e,H,p,q,r,s,t,u,v,w);e=c[w>>2]|0;if((G|0)>(e|0)){w=a[v>>0]|0;n=a[u>>0]|0;I=(G-e<<1|1)+e+((w&1)==0?(w&255)>>>1:c[v+4>>2]|0)+((n&1)==0?(n&255)>>>1:c[u+4>>2]|0)|0}else{n=a[v>>0]|0;w=a[u>>0]|0;I=e+2+((n&1)==0?(n&255)>>>1:c[v+4>>2]|0)+((w&1)==0?(w&255)>>>1:c[u+4>>2]|0)|0}if(I>>>0>100){w=_f(I)|0;if(!w)Iv();else{J=w;K=w}}else{J=0;K=x}Ng(K,y,z,c[f+4>>2]|0,F,F+G|0,o,H,q,a[r>>0]|0,a[s>>0]|0,t,u,v,e);c[A>>2]=c[d>>2];d=c[y>>2]|0;y=c[z>>2]|0;c[k>>2]=c[A>>2];A=Gl(k,K,d,y,f,g)|0;if(!J)L=B;else{yg(J);L=c[p>>2]|0}Au(v);Au(u);Au(t);lr(L)|0;if(D)yg(D);if(E)yg(E);i=b;return A|0}function Ij(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=e+-1|0;c[d>>2]=f;if(!e)return;e=a+20|0;g=a+24|0;h=a+12|0;i=a+32|0;j=b&112;b=c[a>>2]|0;k=c[e>>2]|0;l=b;m=k;n=f;f=k;k=b;while(1){b=c[g>>2]|0;o=b+-1|0;if(!b)p=n;else{switch(j|0){case 16:{b=o;q=f;r=k;while(1){c[q>>2]=c[r>>2]&16777215;if(!b)break;else{b=b+-1|0;q=q+4|0;r=r+4|0}}break}case 32:{r=o;q=f;b=k;while(1){s=c[b>>2]|0;t=c[q>>2]|0;u=(t>>>16&255)+(s>>>16&255)|0;v=(t>>>8&255)+(s>>>8&255)|0;w=(t&255)+(s&255)|0;c[q>>2]=(v>>>0>255?65280:v<<8)|(u>>>0>255?16711680:u<<16)|(w>>>0>255?255:w);if(!r)break;else{r=r+-1|0;q=q+4|0;b=b+4|0}}break}case 64:{b=o;q=f;r=k;while(1){w=c[r>>2]|0;u=c[q>>2]|0;c[q>>2]=(((ca(u>>>8&255,w>>>8&255)|0)>>>0)/255|0)<<8|(((ca(u>>>16&255,w>>>16&255)|0)>>>0)/255|0)<<16|(((ca(u&255,w&255)|0)>>>0)/255|0);if(!b)break;else{b=b+-1|0;q=q+4|0;r=r+4|0}}break}default:{r=o;q=f;while(1){c[q>>2]=c[q>>2]&16777215;if(!r)break;else{r=r+-1|0;q=q+4|0}}}}p=c[d>>2]|0}k=l+(c[h>>2]|0)|0;f=m+(c[i>>2]|0)|0;n=p+-1|0;c[d>>2]=n;if(!p){x=k;y=f;break}else{l=k;m=f}}c[a>>2]=x;c[e>>2]=y;return}function vj(b,e,f,g,h,i,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0;a:do if((b|0)==(i|0))if(a[e>>0]|0){a[e>>0]=0;p=c[h>>2]|0;c[h>>2]=p+1;a[p>>0]=46;p=a[k>>0]|0;if((((p&1)==0?(p&255)>>>1:c[k+4>>2]|0)|0)!=0?(p=c[m>>2]|0,(p-l|0)<160):0){q=c[n>>2]|0;c[m>>2]=p+4;c[p>>2]=q;r=0}else r=0}else r=-1;else{if((b|0)==(j|0)?(q=a[k>>0]|0,(((q&1)==0?(q&255)>>>1:c[k+4>>2]|0)|0)!=0):0){if(!(a[e>>0]|0)){r=-1;break}q=c[m>>2]|0;if((q-l|0)>=160){r=0;break}p=c[n>>2]|0;c[m>>2]=q+4;c[q>>2]=p;c[n>>2]=0;r=0;break}p=o+128|0;q=o;while(1){if((c[q>>2]|0)==(b|0)){s=q;break}q=q+4|0;if((q|0)==(p|0)){s=p;break}}p=s-o|0;q=p>>2;if((p|0)<=124){t=a[32305+q>>0]|0;switch(q|0){case 24:case 25:{q=c[h>>2]|0;if((q|0)!=(g|0)?(d[q+-1>>0]&95|0)!=(d[f>>0]&127|0):0){r=-1;break a}c[h>>2]=q+1;a[q>>0]=t;r=0;break a;break}case 23:case 22:{a[f>>0]=80;break}default:{q=t&95;if((((q|0)==(a[f>>0]|0)?(a[f>>0]=q|128,(a[e>>0]|0)!=0):0)?(a[e>>0]=0,q=a[k>>0]|0,(((q&1)==0?(q&255)>>>1:c[k+4>>2]|0)|0)!=0):0)?(q=c[m>>2]|0,(q-l|0)<160):0){u=c[n>>2]|0;c[m>>2]=q+4;c[q>>2]=u}}}u=c[h>>2]|0;c[h>>2]=u+1;a[u>>0]=t;if((p|0)>84)r=0;else{c[n>>2]=(c[n>>2]|0)+1;r=0}}else r=-1}while(0);return r|0}function lj(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;a:while(1){a=c[b>>2]|0;do if(a){g=c[a+12>>2]|0;if((g|0)==(c[a+16>>2]|0))h=Af[c[(c[a>>2]|0)+36>>2]&127](a)|0;else h=c[g>>2]|0;if((h|0)==-1){c[b>>2]=0;i=1;break}else{i=(c[b>>2]|0)==0;break}}else i=1;while(0);a=c[d>>2]|0;do if(a){g=c[a+12>>2]|0;if((g|0)==(c[a+16>>2]|0))j=Af[c[(c[a>>2]|0)+36>>2]&127](a)|0;else j=c[g>>2]|0;if((j|0)!=-1)if(i){k=a;break}else{l=a;break a}else{c[d>>2]=0;m=15;break}}else m=15;while(0);if((m|0)==15){m=0;if(i){l=0;break}else k=0}a=c[b>>2]|0;g=c[a+12>>2]|0;if((g|0)==(c[a+16>>2]|0))n=Af[c[(c[a>>2]|0)+36>>2]&127](a)|0;else n=c[g>>2]|0;if(!(Ef[c[(c[f>>2]|0)+12>>2]&31](f,8192,n)|0)){l=k;break}g=c[b>>2]|0;a=g+12|0;o=c[a>>2]|0;if((o|0)==(c[g+16>>2]|0)){Af[c[(c[g>>2]|0)+40>>2]&127](g)|0;continue}else{c[a>>2]=o+4;continue}}k=c[b>>2]|0;do if(k){n=c[k+12>>2]|0;if((n|0)==(c[k+16>>2]|0))p=Af[c[(c[k>>2]|0)+36>>2]&127](k)|0;else p=c[n>>2]|0;if((p|0)==-1){c[b>>2]=0;q=1;break}else{q=(c[b>>2]|0)==0;break}}else q=1;while(0);do if(l){b=c[l+12>>2]|0;if((b|0)==(c[l+16>>2]|0))r=Af[c[(c[l>>2]|0)+36>>2]&127](l)|0;else r=c[b>>2]|0;if((r|0)!=-1)if(q)break;else{m=39;break}else{c[d>>2]=0;m=37;break}}else m=37;while(0);if((m|0)==37?q:0)m=39;if((m|0)==39)c[e>>2]=c[e>>2]|2;return}function _j(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=e+-1|0;c[d>>2]=f;if(!e)return;e=a+20|0;g=a+24|0;h=a+12|0;i=a+32|0;j=(b&48|0)!=0;k=b&112;b=f;do{f=c[g>>2]|0;if(!f){l=c[a>>2]|0;m=c[e>>2]|0;n=b}else{o=c[e>>2]|0;p=c[a>>2]|0;q=f;f=o;r=p;while(1){q=q+-1|0;s=c[r>>2]|0;t=s>>>16&255;u=s>>>8&255;v=s&255;w=s>>>24;s=c[f>>2]|0;x=s>>>16&255;y=s>>>8&255;z=s&255;if(j&(w|0)!=255){A=((ca(t,w)|0)>>>0)/255|0;B=((ca(u,w)|0)>>>0)/255|0;C=((ca(v,w)|0)>>>0)/255|0}else{A=t;B=u;C=v}switch(k|0){case 16:{v=w^255;D=(((ca(x,v)|0)>>>0)/255|0)+A|0;E=(((ca(y,v)|0)>>>0)/255|0)+B|0;F=(((ca(v,z)|0)>>>0)/255|0)+C|0;break}case 32:{v=C+z|0;w=B+y|0;u=A+x|0;D=u>>>0>255?255:u;E=w>>>0>255?255:w;F=v>>>0>255?255:v;break}case 64:{D=((ca(A,x)|0)>>>0)/255|0;E=((ca(B,y)|0)>>>0)/255|0;F=((ca(C,z)|0)>>>0)/255|0;break}default:{D=x;E=y;F=z}}c[f>>2]=E<<8|F|D<<16;if(!q)break;else{f=f+4|0;r=r+4|0}}l=p;m=o;n=c[d>>2]|0}c[a>>2]=l+(c[h>>2]|0);c[e>>2]=m+(c[i>>2]|0);b=n+-1|0;c[d>>2]=b}while((n|0)!=0);return}function Zj(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=e+-1|0;c[d>>2]=f;if(!e)return;e=a+20|0;g=a+24|0;h=a+12|0;i=a+32|0;j=(b&48|0)!=0;k=b&112;b=f;do{f=c[g>>2]|0;if(!f){l=c[a>>2]|0;m=c[e>>2]|0;n=b}else{o=c[e>>2]|0;p=c[a>>2]|0;q=f;f=o;r=p;while(1){q=q+-1|0;s=c[r>>2]|0;t=s>>>16&255;u=s>>>8&255;v=s&255;w=s>>>24;s=c[f>>2]|0;x=s>>>16&255;y=s>>>8&255;z=s&255;if(j&(w|0)!=255){A=((ca(t,w)|0)>>>0)/255|0;B=((ca(u,w)|0)>>>0)/255|0;C=((ca(v,w)|0)>>>0)/255|0}else{A=t;B=u;C=v}switch(k|0){case 16:{v=w^255;D=(((ca(v,z)|0)>>>0)/255|0)+A|0;E=(((ca(y,v)|0)>>>0)/255|0)+B|0;F=(((ca(x,v)|0)>>>0)/255|0)+C|0;break}case 32:{v=C+x|0;w=B+y|0;u=A+z|0;D=u>>>0>255?255:u;E=w>>>0>255?255:w;F=v>>>0>255?255:v;break}case 64:{D=((ca(A,z)|0)>>>0)/255|0;E=((ca(B,y)|0)>>>0)/255|0;F=((ca(C,x)|0)>>>0)/255|0;break}default:{D=z;E=y;F=x}}c[f>>2]=E<<8|F<<16|D;if(!q)break;else{f=f+4|0;r=r+4|0}}l=p;m=o;n=c[d>>2]|0}c[a>>2]=l+(c[h>>2]|0);c[e>>2]=m+(c[i>>2]|0);b=n+-1|0;c[d>>2]=b}while((n|0)!=0);return}function Yj(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=e+-1|0;c[d>>2]=f;if(!e)return;e=a+20|0;g=a+24|0;h=a+12|0;i=a+32|0;j=(b&48|0)!=0;k=b&112;b=f;do{f=c[g>>2]|0;if(!f){l=c[a>>2]|0;m=c[e>>2]|0;n=b}else{o=c[e>>2]|0;p=c[a>>2]|0;q=f;f=o;r=p;while(1){q=q+-1|0;s=c[r>>2]|0;t=s>>>16&255;u=s>>>8&255;v=s&255;w=s>>>24;s=c[f>>2]|0;x=s>>>16&255;y=s>>>8&255;z=s&255;if(j&(w|0)!=255){A=((ca(v,w)|0)>>>0)/255|0;B=((ca(u,w)|0)>>>0)/255|0;C=((ca(t,w)|0)>>>0)/255|0}else{A=v;B=u;C=t}switch(k|0){case 16:{t=w^255;D=(((ca(x,t)|0)>>>0)/255|0)+A|0;E=(((ca(y,t)|0)>>>0)/255|0)+B|0;F=(((ca(t,z)|0)>>>0)/255|0)+C|0;break}case 32:{t=C+z|0;w=B+y|0;u=A+x|0;D=u>>>0>255?255:u;E=w>>>0>255?255:w;F=t>>>0>255?255:t;break}case 64:{D=((ca(A,x)|0)>>>0)/255|0;E=((ca(B,y)|0)>>>0)/255|0;F=((ca(C,z)|0)>>>0)/255|0;break}default:{D=x;E=y;F=z}}c[f>>2]=E<<8|F|D<<16;if(!q)break;else{f=f+4|0;r=r+4|0}}l=p;m=o;n=c[d>>2]|0}c[a>>2]=l+(c[h>>2]|0);c[e>>2]=m+(c[i>>2]|0);b=n+-1|0;c[d>>2]=b}while((n|0)!=0);return}function Xj(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=e+-1|0;c[d>>2]=f;if(!e)return;e=a+20|0;g=a+24|0;h=a+12|0;i=a+32|0;j=(b&48|0)!=0;k=b&112;b=f;do{f=c[g>>2]|0;if(!f){l=c[a>>2]|0;m=c[e>>2]|0;n=b}else{o=c[e>>2]|0;p=c[a>>2]|0;q=f;f=o;r=p;while(1){q=q+-1|0;s=c[r>>2]|0;t=s>>>16&255;u=s>>>8&255;v=s&255;w=s>>>24;s=c[f>>2]|0;x=s>>>16&255;y=s>>>8&255;z=s&255;if(j&(w|0)!=255){A=((ca(v,w)|0)>>>0)/255|0;B=((ca(u,w)|0)>>>0)/255|0;C=((ca(t,w)|0)>>>0)/255|0}else{A=v;B=u;C=t}switch(k|0){case 16:{t=w^255;D=(((ca(t,z)|0)>>>0)/255|0)+A|0;E=(((ca(y,t)|0)>>>0)/255|0)+B|0;F=(((ca(x,t)|0)>>>0)/255|0)+C|0;break}case 32:{t=C+x|0;w=B+y|0;u=A+z|0;D=u>>>0>255?255:u;E=w>>>0>255?255:w;F=t>>>0>255?255:t;break}case 64:{D=((ca(A,z)|0)>>>0)/255|0;E=((ca(B,y)|0)>>>0)/255|0;F=((ca(C,x)|0)>>>0)/255|0;break}default:{D=z;E=y;F=x}}c[f>>2]=E<<8|F<<16|D;if(!q)break;else{f=f+4|0;r=r+4|0}}l=p;m=o;n=c[d>>2]|0}c[a>>2]=l+(c[h>>2]|0);c[e>>2]=m+(c[i>>2]|0);b=n+-1|0;c[d>>2]=b}while((n|0)!=0);return}function Wj(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=e+-1|0;c[d>>2]=f;if(!e)return;e=a+20|0;g=a+24|0;h=a+12|0;i=a+32|0;j=(b&48|0)!=0;k=b&112;b=f;do{f=c[g>>2]|0;if(!f){l=c[a>>2]|0;m=c[e>>2]|0;n=b}else{o=c[e>>2]|0;p=c[a>>2]|0;q=f;f=o;r=p;while(1){q=q+-1|0;s=c[r>>2]|0;t=s>>>24;u=s>>>16&255;v=s>>>8&255;w=s&255;s=c[f>>2]|0;x=s>>>16&255;y=s>>>8&255;z=s&255;if(j&(w|0)!=255){A=((ca(t,w)|0)>>>0)/255|0;B=((ca(u,w)|0)>>>0)/255|0;C=((ca(v,w)|0)>>>0)/255|0}else{A=t;B=u;C=v}switch(k|0){case 16:{v=w^255;D=(((ca(x,v)|0)>>>0)/255|0)+A|0;E=(((ca(y,v)|0)>>>0)/255|0)+B|0;F=(((ca(v,z)|0)>>>0)/255|0)+C|0;break}case 32:{v=C+z|0;w=B+y|0;u=A+x|0;D=u>>>0>255?255:u;E=w>>>0>255?255:w;F=v>>>0>255?255:v;break}case 64:{D=((ca(A,x)|0)>>>0)/255|0;E=((ca(B,y)|0)>>>0)/255|0;F=((ca(C,z)|0)>>>0)/255|0;break}default:{D=x;E=y;F=z}}c[f>>2]=E<<8|F|D<<16;if(!q)break;else{f=f+4|0;r=r+4|0}}l=p;m=o;n=c[d>>2]|0}c[a>>2]=l+(c[h>>2]|0);c[e>>2]=m+(c[i>>2]|0);b=n+-1|0;c[d>>2]=b}while((n|0)!=0);return}function Vj(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=e+-1|0;c[d>>2]=f;if(!e)return;e=a+20|0;g=a+24|0;h=a+12|0;i=a+32|0;j=(b&48|0)!=0;k=b&112;b=f;do{f=c[g>>2]|0;if(!f){l=c[a>>2]|0;m=c[e>>2]|0;n=b}else{o=c[e>>2]|0;p=c[a>>2]|0;q=f;f=o;r=p;while(1){q=q+-1|0;s=c[r>>2]|0;t=s>>>24;u=s>>>16&255;v=s>>>8&255;w=s&255;s=c[f>>2]|0;x=s>>>16&255;y=s>>>8&255;z=s&255;if(j&(w|0)!=255){A=((ca(t,w)|0)>>>0)/255|0;B=((ca(u,w)|0)>>>0)/255|0;C=((ca(v,w)|0)>>>0)/255|0}else{A=t;B=u;C=v}switch(k|0){case 16:{v=w^255;D=(((ca(v,z)|0)>>>0)/255|0)+A|0;E=(((ca(y,v)|0)>>>0)/255|0)+B|0;F=(((ca(x,v)|0)>>>0)/255|0)+C|0;break}case 32:{v=C+x|0;w=B+y|0;u=A+z|0;D=u>>>0>255?255:u;E=w>>>0>255?255:w;F=v>>>0>255?255:v;break}case 64:{D=((ca(A,z)|0)>>>0)/255|0;E=((ca(B,y)|0)>>>0)/255|0;F=((ca(C,x)|0)>>>0)/255|0;break}default:{D=z;E=y;F=x}}c[f>>2]=E<<8|F<<16|D;if(!q)break;else{f=f+4|0;r=r+4|0}}l=p;m=o;n=c[d>>2]|0}c[a>>2]=l+(c[h>>2]|0);c[e>>2]=m+(c[i>>2]|0);b=n+-1|0;c[d>>2]=b}while((n|0)!=0);return}function Uj(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=e+-1|0;c[d>>2]=f;if(!e)return;e=a+20|0;g=a+24|0;h=a+12|0;i=a+32|0;j=(b&48|0)!=0;k=b&112;b=f;do{f=c[g>>2]|0;if(!f){l=c[a>>2]|0;m=c[e>>2]|0;n=b}else{o=c[e>>2]|0;p=c[a>>2]|0;q=f;f=o;r=p;while(1){q=q+-1|0;s=c[r>>2]|0;t=s>>>24;u=s>>>16&255;v=s>>>8&255;w=s&255;s=c[f>>2]|0;x=s>>>16&255;y=s>>>8&255;z=s&255;if(j&(w|0)!=255){A=((ca(v,w)|0)>>>0)/255|0;B=((ca(u,w)|0)>>>0)/255|0;C=((ca(t,w)|0)>>>0)/255|0}else{A=v;B=u;C=t}switch(k|0){case 16:{t=w^255;D=(((ca(x,t)|0)>>>0)/255|0)+A|0;E=(((ca(y,t)|0)>>>0)/255|0)+B|0;F=(((ca(t,z)|0)>>>0)/255|0)+C|0;break}case 32:{t=C+z|0;w=B+y|0;u=A+x|0;D=u>>>0>255?255:u;E=w>>>0>255?255:w;F=t>>>0>255?255:t;break}case 64:{D=((ca(A,x)|0)>>>0)/255|0;E=((ca(B,y)|0)>>>0)/255|0;F=((ca(C,z)|0)>>>0)/255|0;break}default:{D=x;E=y;F=z}}c[f>>2]=E<<8|F|D<<16;if(!q)break;else{f=f+4|0;r=r+4|0}}l=p;m=o;n=c[d>>2]|0}c[a>>2]=l+(c[h>>2]|0);c[e>>2]=m+(c[i>>2]|0);b=n+-1|0;c[d>>2]=b}while((n|0)!=0);return}function Tj(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=e+-1|0;c[d>>2]=f;if(!e)return;e=a+20|0;g=a+24|0;h=a+12|0;i=a+32|0;j=(b&48|0)!=0;k=b&112;b=f;do{f=c[g>>2]|0;if(!f){l=c[a>>2]|0;m=c[e>>2]|0;n=b}else{o=c[e>>2]|0;p=c[a>>2]|0;q=f;f=o;r=p;while(1){q=q+-1|0;s=c[r>>2]|0;t=s>>>24;u=s>>>16&255;v=s>>>8&255;w=s&255;s=c[f>>2]|0;x=s>>>16&255;y=s>>>8&255;z=s&255;if(j&(w|0)!=255){A=((ca(v,w)|0)>>>0)/255|0;B=((ca(u,w)|0)>>>0)/255|0;C=((ca(t,w)|0)>>>0)/255|0}else{A=v;B=u;C=t}switch(k|0){case 16:{t=w^255;D=(((ca(t,z)|0)>>>0)/255|0)+A|0;E=(((ca(y,t)|0)>>>0)/255|0)+B|0;F=(((ca(x,t)|0)>>>0)/255|0)+C|0;break}case 32:{t=C+x|0;w=B+y|0;u=A+z|0;D=u>>>0>255?255:u;E=w>>>0>255?255:w;F=t>>>0>255?255:t;break}case 64:{D=((ca(A,z)|0)>>>0)/255|0;E=((ca(B,y)|0)>>>0)/255|0;F=((ca(C,x)|0)>>>0)/255|0;break}default:{D=z;E=y;F=x}}c[f>>2]=E<<8|F<<16|D;if(!q)break;else{f=f+4|0;r=r+4|0}}l=p;m=o;n=c[d>>2]|0}c[a>>2]=l+(c[h>>2]|0);c[e>>2]=m+(c[i>>2]|0);b=n+-1|0;c[d>>2]=b}while((n|0)!=0);return}function Mj(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=d[a+63>>0]|0;i=a+28|0;j=c[i>>2]|0;k=(c[a+8>>2]<<16|0)/(j|0)|0;l=a+24|0;m=c[l>>2]|0;n=(c[a+4>>2]<<16|0)/(m|0)|0;o=j+-1|0;c[i>>2]=o;if(!j)return;j=a+20|0;p=a+32|0;q=(b&1|0)==0;r=(b&2|0)==0;b=a+12|0;s=c[j>>2]|0;t=m;m=s;u=o;o=s;s=0;v=0;while(1){if((s|0)>65535){w=s+-65536|0;x=w>>>16;y=w-(x<<16)|0;z=v+1+x|0}else{y=s;z=v}if(!t)A=u;else{x=t;w=o;B=65536;C=0;D=-1;while(1){x=x+-1|0;if((B|0)>65535){E=B+-65536|0;F=E>>>16;G=D+1+F|0;H=E-(F<<16)|0;I=(c[a>>2]|0)+((ca(c[b>>2]|0,z)|0)+(G<<2))|0;J=G}else{H=B;I=C;J=D}G=c[I>>2]|0;F=G>>>16&255;E=G>>>8&255;K=G&255;L=G>>>24;if(q){M=F;N=E;O=K}else{M=((ca(F,g)|0)>>>0)/255|0;N=((ca(E,f)|0)>>>0)/255|0;O=((ca(K,e)|0)>>>0)/255|0}K=((ca(L,h)|0)>>>0)/255|0;c[w>>2]=M|N<<8|O<<16|(r?L:K)<<24;if(!x)break;else{w=w+4|0;B=H+n|0;C=I;D=J}}A=c[i>>2]|0}D=m+(c[p>>2]|0)|0;C=A+-1|0;c[i>>2]=C;if(!A){P=D;break}t=c[l>>2]|0;m=D;u=C;o=D;s=y+k|0;v=z}c[j>>2]=P;return}function Lj(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=d[a+63>>0]|0;i=a+28|0;j=c[i>>2]|0;k=(c[a+8>>2]<<16|0)/(j|0)|0;l=a+24|0;m=c[l>>2]|0;n=(c[a+4>>2]<<16|0)/(m|0)|0;o=j+-1|0;c[i>>2]=o;if(!j)return;j=a+20|0;p=a+32|0;q=(b&1|0)==0;r=(b&2|0)==0;b=a+12|0;s=c[j>>2]|0;t=m;m=s;u=o;o=s;s=0;v=0;while(1){if((s|0)>65535){w=s+-65536|0;x=w>>>16;y=w-(x<<16)|0;z=v+1+x|0}else{y=s;z=v}if(!t)A=u;else{x=t;w=o;B=65536;C=0;D=-1;while(1){x=x+-1|0;if((B|0)>65535){E=B+-65536|0;F=E>>>16;G=D+1+F|0;H=E-(F<<16)|0;I=(c[a>>2]|0)+((ca(c[b>>2]|0,z)|0)+(G<<2))|0;J=G}else{H=B;I=C;J=D}G=c[I>>2]|0;F=G>>>16&255;E=G>>>8&255;K=G&255;L=G>>>24;if(q){M=K;N=E;O=F}else{M=((ca(K,g)|0)>>>0)/255|0;N=((ca(E,f)|0)>>>0)/255|0;O=((ca(F,e)|0)>>>0)/255|0}F=((ca(L,h)|0)>>>0)/255|0;c[w>>2]=M|N<<8|O<<16|(r?L:F)<<24;if(!x)break;else{w=w+4|0;B=H+n|0;C=I;D=J}}A=c[i>>2]|0}D=m+(c[p>>2]|0)|0;C=A+-1|0;c[i>>2]=C;if(!A){P=D;break}t=c[l>>2]|0;m=D;u=C;o=D;s=y+k|0;v=z}c[j>>2]=P;return}function Kj(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0;c[e>>2]=b;c[h>>2]=f;b=g;if(j&2)if((b-f|0)<3)k=1;else{c[h>>2]=f+1;a[f>>0]=-17;f=c[h>>2]|0;c[h>>2]=f+1;a[f>>0]=-69;f=c[h>>2]|0;c[h>>2]=f+1;a[f>>0]=-65;l=4}else l=4;a:do if((l|0)==4){f=c[e>>2]|0;if(f>>>0<d>>>0){j=f;while(1){f=c[j>>2]|0;if(f>>>0>i>>>0|(f&-2048|0)==55296){k=2;break a}do if(f>>>0>=128){if(f>>>0<2048){g=c[h>>2]|0;if((b-g|0)<2){k=1;break a}c[h>>2]=g+1;a[g>>0]=f>>>6|192;g=c[h>>2]|0;c[h>>2]=g+1;a[g>>0]=f&63|128;break}g=c[h>>2]|0;m=b-g|0;if(f>>>0<65536){if((m|0)<3){k=1;break a}c[h>>2]=g+1;a[g>>0]=f>>>12|224;n=c[h>>2]|0;c[h>>2]=n+1;a[n>>0]=f>>>6&63|128;n=c[h>>2]|0;c[h>>2]=n+1;a[n>>0]=f&63|128;break}else{if((m|0)<4){k=1;break a}c[h>>2]=g+1;a[g>>0]=f>>>18|240;g=c[h>>2]|0;c[h>>2]=g+1;a[g>>0]=f>>>12&63|128;g=c[h>>2]|0;c[h>>2]=g+1;a[g>>0]=f>>>6&63|128;g=c[h>>2]|0;c[h>>2]=g+1;a[g>>0]=f&63|128;break}}else{g=c[h>>2]|0;if((b-g|0)<1){k=1;break a}c[h>>2]=g+1;a[g>>0]=f}while(0);j=(c[e>>2]|0)+4|0;c[e>>2]=j;if(j>>>0>=d>>>0){k=0;break}}}else k=0}while(0);return k|0}function Qj(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=d[a+63>>0]|0;i=a+28|0;j=c[i>>2]|0;k=(c[a+8>>2]<<16|0)/(j|0)|0;l=a+24|0;m=c[l>>2]|0;n=(c[a+4>>2]<<16|0)/(m|0)|0;o=j+-1|0;c[i>>2]=o;if(!j)return;j=a+20|0;p=a+32|0;q=(b&1|0)==0;r=(b&2|0)==0;b=a+12|0;s=c[j>>2]|0;t=m;m=s;u=o;o=s;s=0;v=0;while(1){if((s|0)>65535){w=s+-65536|0;x=w>>>16;y=w-(x<<16)|0;z=v+1+x|0}else{y=s;z=v}if(!t)A=u;else{x=t;w=o;B=65536;C=0;D=-1;while(1){x=x+-1|0;if((B|0)>65535){E=B+-65536|0;F=E>>>16;G=D+1+F|0;H=E-(F<<16)|0;I=(c[a>>2]|0)+((ca(c[b>>2]|0,z)|0)+(G<<2))|0;J=G}else{H=B;I=C;J=D}G=c[I>>2]|0;F=G>>>24;E=G>>>16&255;K=G>>>8&255;if(q){L=F;M=E;N=K}else{L=((ca(F,g)|0)>>>0)/255|0;M=((ca(E,f)|0)>>>0)/255|0;N=((ca(K,e)|0)>>>0)/255|0}K=((ca(G&255,h)|0)>>>0)/255|0;c[w>>2]=L|M<<8|N<<16|(r?G:K)<<24;if(!x)break;else{w=w+4|0;B=H+n|0;C=I;D=J}}A=c[i>>2]|0}D=m+(c[p>>2]|0)|0;C=A+-1|0;c[i>>2]=C;if(!A){O=D;break}t=c[l>>2]|0;m=D;u=C;o=D;s=y+k|0;v=z}c[j>>2]=O;return}function Pj(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=d[a+63>>0]|0;i=a+28|0;j=c[i>>2]|0;k=(c[a+8>>2]<<16|0)/(j|0)|0;l=a+24|0;m=c[l>>2]|0;n=(c[a+4>>2]<<16|0)/(m|0)|0;o=j+-1|0;c[i>>2]=o;if(!j)return;j=a+20|0;p=a+32|0;q=(b&1|0)==0;r=(b&2|0)==0;b=a+12|0;s=c[j>>2]|0;t=m;m=s;u=o;o=s;s=0;v=0;while(1){if((s|0)>65535){w=s+-65536|0;x=w>>>16;y=w-(x<<16)|0;z=v+1+x|0}else{y=s;z=v}if(!t)A=u;else{x=t;w=o;B=65536;C=0;D=-1;while(1){x=x+-1|0;if((B|0)>65535){E=B+-65536|0;F=E>>>16;G=D+1+F|0;H=E-(F<<16)|0;I=(c[a>>2]|0)+((ca(c[b>>2]|0,z)|0)+(G<<2))|0;J=G}else{H=B;I=C;J=D}G=c[I>>2]|0;F=G>>>24;E=G>>>16&255;K=G>>>8&255;if(q){L=K;M=E;N=F}else{L=((ca(K,g)|0)>>>0)/255|0;M=((ca(E,f)|0)>>>0)/255|0;N=((ca(F,e)|0)>>>0)/255|0}F=((ca(G&255,h)|0)>>>0)/255|0;c[w>>2]=L|M<<8|N<<16|(r?G:F)<<24;if(!x)break;else{w=w+4|0;B=H+n|0;C=I;D=J}}A=c[i>>2]|0}D=m+(c[p>>2]|0)|0;C=A+-1|0;c[i>>2]=C;if(!A){O=D;break}t=c[l>>2]|0;m=D;u=C;o=D;s=y+k|0;v=z}c[j>>2]=O;return}function Ei(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;b=i;i=i+176|0;j=b+56|0;k=b+52|0;l=b+64|0;m=b+61|0;n=b+60|0;o=b+40|0;p=b+28|0;q=b+16|0;r=b+12|0;s=b+68|0;t=b+8|0;u=b+4|0;v=b;w=Hs(f)|0;c[k>>2]=w;x=Ds(k,18276)|0;y=a[h>>0]|0;z=(y&1)==0;A=h+4|0;if(!((z?(y&255)>>>1:c[A>>2]|0)|0))B=0;else{y=a[(z?h+1|0:c[h+8>>2]|0)>>0]|0;B=y<<24>>24==(Nf[c[(c[x>>2]|0)+28>>2]&31](x,45)|0)<<24>>24}c[o>>2]=0;c[o+4>>2]=0;c[o+8>>2]=0;c[p>>2]=0;c[p+4>>2]=0;c[p+8>>2]=0;c[q>>2]=0;c[q+4>>2]=0;c[q+8>>2]=0;Lg(e,B,k,l,m,n,o,p,q,r);e=a[h>>0]|0;y=c[A>>2]|0;A=(e&1)==0?(e&255)>>>1:y;z=c[r>>2]|0;if((A|0)>(z|0)){r=a[q>>0]|0;C=a[p>>0]|0;D=(A-z<<1|1)+z+((r&1)==0?(r&255)>>>1:c[q+4>>2]|0)+((C&1)==0?(C&255)>>>1:c[p+4>>2]|0)|0}else{C=a[q>>0]|0;r=a[p>>0]|0;D=z+2+((C&1)==0?(C&255)>>>1:c[q+4>>2]|0)+((r&1)==0?(r&255)>>>1:c[p+4>>2]|0)|0}if(D>>>0>100){r=_f(D)|0;if(!r)Iv();else{E=r;F=r}}else{E=0;F=s}s=(e&1)==0;r=s?h+1|0:c[h+8>>2]|0;Ng(F,t,u,c[f+4>>2]|0,r,r+(s?(e&255)>>>1:y)|0,x,B,l,a[m>>0]|0,a[n>>0]|0,o,p,q,z);c[v>>2]=c[d>>2];d=c[t>>2]|0;t=c[u>>2]|0;c[j>>2]=c[v>>2];v=Gl(j,F,d,t,f,g)|0;if(!E)G=w;else{yg(E);G=c[k>>2]|0}Au(q);Au(p);Au(o);lr(G)|0;i=b;return v|0}function sj(a,e,f,g,h){a=a|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;a=h+8|0;a:while(1){h=c[e>>2]|0;do if(h)if((c[h+12>>2]|0)==(c[h+16>>2]|0))if((Af[c[(c[h>>2]|0)+36>>2]&127](h)|0)==-1){c[e>>2]=0;i=0;break}else{i=c[e>>2]|0;break}else i=h;else i=0;while(0);h=(i|0)==0;j=c[f>>2]|0;do if(j){if((c[j+12>>2]|0)!=(c[j+16>>2]|0))if(h){k=j;break}else{l=j;break a}if((Af[c[(c[j>>2]|0)+36>>2]&127](j)|0)!=-1)if(h){k=j;break}else{l=j;break a}else{c[f>>2]=0;m=12;break}}else m=12;while(0);if((m|0)==12){m=0;if(h){l=0;break}else k=0}j=c[e>>2]|0;n=c[j+12>>2]|0;if((n|0)==(c[j+16>>2]|0))o=Af[c[(c[j>>2]|0)+36>>2]&127](j)|0;else o=d[n>>0]|0;if((o&255)<<24>>24<=-1){l=k;break}if(!(b[(c[a>>2]|0)+(o<<24>>24<<1)>>1]&8192)){l=k;break}n=c[e>>2]|0;j=n+12|0;p=c[j>>2]|0;if((p|0)==(c[n+16>>2]|0)){Af[c[(c[n>>2]|0)+40>>2]&127](n)|0;continue}else{c[j>>2]=p+1;continue}}k=c[e>>2]|0;do if(k)if((c[k+12>>2]|0)==(c[k+16>>2]|0))if((Af[c[(c[k>>2]|0)+36>>2]&127](k)|0)==-1){c[e>>2]=0;q=0;break}else{q=c[e>>2]|0;break}else q=k;else q=0;while(0);k=(q|0)==0;do if(l){if((c[l+12>>2]|0)==(c[l+16>>2]|0)?(Af[c[(c[l>>2]|0)+36>>2]&127](l)|0)==-1:0){c[f>>2]=0;m=32;break}if(!k)m=33}else m=32;while(0);if((m|0)==32?k:0)m=33;if((m|0)==33)c[g>>2]=c[g>>2]|2;return}function Di(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;b=i;i=i+480|0;j=b+464|0;k=b+60|0;l=b+468|0;m=b+56|0;n=b+52|0;o=b+40|0;p=b+28|0;q=b+16|0;r=b+12|0;s=b+64|0;t=b+8|0;u=b+4|0;v=b;w=Hs(f)|0;c[k>>2]=w;x=Ds(k,18268)|0;y=a[h>>0]|0;z=(y&1)==0;A=h+4|0;if(!((z?(y&255)>>>1:c[A>>2]|0)|0))B=0;else{y=c[(z?A:c[h+8>>2]|0)>>2]|0;B=(y|0)==(Nf[c[(c[x>>2]|0)+44>>2]&31](x,45)|0)}c[o>>2]=0;c[o+4>>2]=0;c[o+8>>2]=0;c[p>>2]=0;c[p+4>>2]=0;c[p+8>>2]=0;c[q>>2]=0;c[q+4>>2]=0;c[q+8>>2]=0;Pg(e,B,k,l,m,n,o,p,q,r);e=a[h>>0]|0;y=c[A>>2]|0;z=(e&1)==0?(e&255)>>>1:y;C=c[r>>2]|0;if((z|0)>(C|0)){r=a[q>>0]|0;D=a[p>>0]|0;E=(z-C<<1|1)+C+((r&1)==0?(r&255)>>>1:c[q+4>>2]|0)+((D&1)==0?(D&255)>>>1:c[p+4>>2]|0)|0}else{D=a[q>>0]|0;r=a[p>>0]|0;E=C+2+((D&1)==0?(D&255)>>>1:c[q+4>>2]|0)+((r&1)==0?(r&255)>>>1:c[p+4>>2]|0)|0}if(E>>>0>100){r=_f(E<<2)|0;if(!r)Iv();else{F=r;G=r}}else{F=0;G=s}s=(e&1)==0;r=s?A:c[h+8>>2]|0;Qg(G,t,u,c[f+4>>2]|0,r,r+((s?(e&255)>>>1:y)<<2)|0,x,B,l,c[m>>2]|0,c[n>>2]|0,o,p,q,C);c[v>>2]=c[d>>2];d=c[t>>2]|0;t=c[u>>2]|0;c[j>>2]=c[v>>2];v=pl(j,G,d,t,f,g)|0;if(!F)H=w;else{yg(F);H=c[k>>2]|0}zu(q);zu(p);Au(o);lr(H)|0;i=b;return v|0}function $j(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;g=i;i=i+1040|0;h=g+8|0;j=g;k=c[b>>2]|0;c[j>>2]=k;l=(a|0)!=0;m=l?e:256;e=l?a:h;a=k;a:do if((m|0)!=0&(k|0)!=0){n=d;o=m;p=a;q=0;r=e;while(1){s=n>>>2;t=s>>>0>=o>>>0;if(!(n>>>0>131|t)){u=n;v=o;w=p;x=q;y=r;break a}z=t?o:s;s=n-z|0;t=Vg(r,j,z,f)|0;if((t|0)==-1){A=s;B=r;break}z=(r|0)==(h|0);C=z?0:t;D=o-C|0;E=z?r:r+(t<<2)|0;z=t+q|0;t=c[j>>2]|0;if((o|0)!=(C|0)&(t|0)!=0){n=s;o=D;p=t;q=z;r=E}else{u=s;v=D;w=t;x=z;y=E;break a}}u=A;v=0;w=c[j>>2]|0;x=-1;y=B}else{u=d;v=m;w=a;x=0;y=e}while(0);b:do if((w|0)!=0?(v|0)!=0&(u|0)!=0:0){e=u;a=v;m=w;d=x;B=y;while(1){A=vk(B,m,e,f)|0;if((A+2|0)>>>0<3){F=A;G=d;break}m=(c[j>>2]|0)+A|0;c[j>>2]=m;a=a+-1|0;h=d+1|0;if(!((a|0)!=0&(e|0)!=(A|0))){H=h;break b}else{e=e-A|0;d=h;B=B+4|0}}switch(F|0){case -1:{H=-1;break b;break}case 0:{c[j>>2]=0;H=G;break b;break}default:{c[f>>2]=0;H=G;break b}}}else H=x;while(0);if(!l){i=g;return H|0}c[b>>2]=c[j>>2];i=g;return H|0}function Hi(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;b=i;i=i+432|0;k=b+424|0;l=b+24|0;m=b+16|0;n=b+8|0;o=b+4|0;p=b+428|0;q=b;c[m>>2]=l;r=m+4|0;c[r>>2]=300;s=Hs(g)|0;c[o>>2]=s;t=Ds(o,18268)|0;a[p>>0]=0;u=c[e>>2]|0;c[q>>2]=u;v=c[g+4>>2]|0;c[k>>2]=c[q>>2];q=u;if(dg(d,k,f,o,v,h,p,t,m,n,l+400|0)|0){if(!(a[j>>0]&1))a[j>>0]=0;else c[c[j+8>>2]>>2]=0;c[j+4>>2]=0;if(a[p>>0]|0)fn(j,Nf[c[(c[t>>2]|0)+44>>2]&31](t,45)|0);p=Nf[c[(c[t>>2]|0)+44>>2]&31](t,48)|0;t=c[m>>2]|0;l=c[n>>2]|0;n=l+-4|0;a:do if(t>>>0<n>>>0){v=t;while(1){if((c[v>>2]|0)!=(p|0)){w=v;break a}o=v+4|0;if(o>>>0<n>>>0)v=o;else{w=o;break}}}else w=t;while(0);dm(j,w,l)|0}l=c[d>>2]|0;do if(l){w=c[l+12>>2]|0;if((w|0)==(c[l+16>>2]|0))x=Af[c[(c[l>>2]|0)+36>>2]&127](l)|0;else x=c[w>>2]|0;if((x|0)==-1){c[d>>2]=0;y=1;break}else{y=(c[d>>2]|0)==0;break}}else y=1;while(0);do if(u){x=c[q+12>>2]|0;if((x|0)==(c[q+16>>2]|0))z=Af[c[(c[u>>2]|0)+36>>2]&127](q)|0;else z=c[x>>2]|0;if((z|0)!=-1)if(y)break;else{A=26;break}else{c[e>>2]=0;A=24;break}}else A=24;while(0);if((A|0)==24?y:0)A=26;if((A|0)==26)c[h>>2]=c[h>>2]|2;h=c[d>>2]|0;lr(s)|0;s=c[m>>2]|0;c[m>>2]=0;if(s)xf[c[r>>2]&511](s);i=b;return h|0}function bk(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;e=c[b+52>>2]|0;f=d[b+60>>0]|0;g=d[b+61>>0]|0;h=d[b+62>>0]|0;i=a[b+63>>0]|0;j=b+28|0;k=c[j>>2]|0;l=(c[b+8>>2]<<16|0)/(k|0)|0;m=b+24|0;n=c[m>>2]|0;o=(c[b+4>>2]<<16|0)/(n|0)|0;p=k+-1|0;c[j>>2]=p;if(!k)return;k=b+20|0;q=b+32|0;r=(e&1|0)==0;s=(e&2|0)==0?-16777216:(i&255)<<24;i=b+12|0;e=c[k>>2]|0;t=n;n=e;u=p;p=e;e=0;v=0;while(1){if((e|0)>65535){w=e+-65536|0;x=w>>>16;y=w-(x<<16)|0;z=v+1+x|0}else{y=e;z=v}if(!t)A=u;else{x=t;w=p;B=65536;C=0;D=-1;while(1){x=x+-1|0;if((B|0)>65535){E=B+-65536|0;F=E>>>16;G=D+1+F|0;H=E-(F<<16)|0;I=(c[b>>2]|0)+((ca(c[i>>2]|0,z)|0)+(G<<2))|0;J=G}else{H=B;I=C;J=D}G=c[I>>2]|0;F=G>>>16&255;E=G>>>8&255;K=G&255;if(r){L=F;M=E;N=K}else{L=((ca(F,h)|0)>>>0)/255|0;M=((ca(E,g)|0)>>>0)/255|0;N=((ca(K,f)|0)>>>0)/255|0}c[w>>2]=M<<8|s|L|N<<16;if(!x)break;else{w=w+4|0;B=H+o|0;C=I;D=J}}A=c[j>>2]|0}D=n+(c[q>>2]|0)|0;C=A+-1|0;c[j>>2]=C;if(!A){O=D;break}t=c[m>>2]|0;n=D;u=C;p=D;e=y+l|0;v=z}c[k>>2]=O;return}function ak(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;e=c[b+52>>2]|0;f=d[b+60>>0]|0;g=d[b+61>>0]|0;h=d[b+62>>0]|0;i=a[b+63>>0]|0;j=b+28|0;k=c[j>>2]|0;l=(c[b+8>>2]<<16|0)/(k|0)|0;m=b+24|0;n=c[m>>2]|0;o=(c[b+4>>2]<<16|0)/(n|0)|0;p=k+-1|0;c[j>>2]=p;if(!k)return;k=b+20|0;q=b+32|0;r=(e&1|0)==0;s=(e&2|0)==0?-16777216:(i&255)<<24;i=b+12|0;e=c[k>>2]|0;t=n;n=e;u=p;p=e;e=0;v=0;while(1){if((e|0)>65535){w=e+-65536|0;x=w>>>16;y=w-(x<<16)|0;z=v+1+x|0}else{y=e;z=v}if(!t)A=u;else{x=t;w=p;B=65536;C=0;D=-1;while(1){x=x+-1|0;if((B|0)>65535){E=B+-65536|0;F=E>>>16;G=D+1+F|0;H=E-(F<<16)|0;I=(c[b>>2]|0)+((ca(c[i>>2]|0,z)|0)+(G<<2))|0;J=G}else{H=B;I=C;J=D}G=c[I>>2]|0;F=G>>>16&255;E=G>>>8&255;K=G&255;if(r){L=K;M=E;N=F}else{L=((ca(K,h)|0)>>>0)/255|0;M=((ca(E,g)|0)>>>0)/255|0;N=((ca(F,f)|0)>>>0)/255|0}c[w>>2]=M<<8|s|L|N<<16;if(!x)break;else{w=w+4|0;B=H+o|0;C=I;D=J}}A=c[j>>2]|0}D=n+(c[q>>2]|0)|0;C=A+-1|0;c[j>>2]=C;if(!A){O=D;break}t=c[m>>2]|0;n=D;u=C;p=D;e=y+l|0;v=z}c[k>>2]=O;return}function tj(a,b,e,f,g){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;a=c[b>>2]|0;do if(a)if((c[a+12>>2]|0)==(c[a+16>>2]|0))if((Af[c[(c[a>>2]|0)+36>>2]&127](a)|0)==-1){c[b>>2]=0;h=0;break}else{h=c[b>>2]|0;break}else h=a;else h=0;while(0);a=(h|0)==0;h=c[e>>2]|0;do if(h){if((c[h+12>>2]|0)==(c[h+16>>2]|0)?(Af[c[(c[h>>2]|0)+36>>2]&127](h)|0)==-1:0){c[e>>2]=0;i=11;break}if(a){j=h;i=13}else i=12}else i=11;while(0);if((i|0)==11)if(a)i=12;else{j=0;i=13}a:do if((i|0)==12)c[f>>2]=c[f>>2]|6;else if((i|0)==13){a=c[b>>2]|0;h=c[a+12>>2]|0;if((h|0)==(c[a+16>>2]|0))k=Af[c[(c[a>>2]|0)+36>>2]&127](a)|0;else k=d[h>>0]|0;if((Ef[c[(c[g>>2]|0)+36>>2]&31](g,k&255,0)|0)<<24>>24!=37){c[f>>2]=c[f>>2]|4;break}h=c[b>>2]|0;a=h+12|0;l=c[a>>2]|0;if((l|0)==(c[h+16>>2]|0)){Af[c[(c[h>>2]|0)+40>>2]&127](h)|0;m=c[b>>2]|0;if(!m)n=0;else{o=m;i=21}}else{c[a>>2]=l+1;o=h;i=21}do if((i|0)==21)if((c[o+12>>2]|0)==(c[o+16>>2]|0))if((Af[c[(c[o>>2]|0)+36>>2]&127](o)|0)==-1){c[b>>2]=0;n=0;break}else{n=c[b>>2]|0;break}else n=o;while(0);h=(n|0)==0;do if(j){if((c[j+12>>2]|0)==(c[j+16>>2]|0)?(Af[c[(c[j>>2]|0)+36>>2]&127](j)|0)==-1:0){c[e>>2]=0;i=30;break}if(h)break a}else i=30;while(0);if((i|0)==30?!h:0)break;c[f>>2]=c[f>>2]|2}while(0);return}function Oj(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;f=i;i=i+32|0;g=f+16|0;h=f+8|0;j=f+4|0;k=f;l=b+52|0;a:do if(a[l>>0]|0){m=b+48|0;n=c[m>>2]|0;if(e){c[m>>2]=-1;a[l>>0]=0;o=n}else o=n}else{n=c[b+44>>2]|0;m=(n|0)>1?n:1;n=b+32|0;if((m|0)>0){p=0;do{q=We(c[n>>2]|0)|0;if((q|0)==-1){o=-1;break a}a[g+p>>0]=q;p=p+1|0}while((p|0)<(m|0))}b:do if(!(a[b+53>>0]|0)){p=b+40|0;q=b+36|0;r=h+1|0;s=m;c:while(1){t=c[p>>2]|0;u=t;v=c[u>>2]|0;w=c[u+4>>2]|0;u=c[q>>2]|0;x=g+s|0;switch(Kf[c[(c[u>>2]|0)+16>>2]&15](u,t,g,x,j,h,r,k)|0){case 2:{o=-1;break a;break}case 3:{y=s;break c;break}case 1:break;default:{z=s;break b}}t=c[p>>2]|0;c[t>>2]=v;c[t+4>>2]=w;if((s|0)==8){o=-1;break a}w=We(c[n>>2]|0)|0;if((w|0)==-1){o=-1;break a}a[x>>0]=w;s=s+1|0}a[h>>0]=a[g>>0]|0;z=y}else{a[h>>0]=a[g>>0]|0;z=m}while(0);if(e){m=a[h>>0]|0;c[b+48>>2]=m&255;A=m}else{m=z;while(1){if((m|0)<=0)break;m=m+-1|0;if((me(d[g+m>>0]|0,c[n>>2]|0)|0)==-1){o=-1;break a}}A=a[h>>0]|0}o=A&255}while(0);i=f;return o|0}function Dj(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0;a=c[p>>2]|0;np(16260,a,16316);c[3895]=17008;c[3897]=17028;c[3896]=0;b=c[4249]|0;gq(15580+b|0,16260);c[15580+(b+72)>>2]=0;c[15580+(b+76)>>2]=-1;b=c[q>>2]|0;Vo(16364,b,16324);c[3917]=17088;c[3918]=17108;d=c[4269]|0;gq(15668+d|0,16364);e=d+72|0;c[15668+e>>2]=0;f=d+76|0;c[15668+f>>2]=-1;g=c[o>>2]|0;Vo(16412,g,16332);c[3938]=17088;c[3939]=17108;gq(15752+d|0,16412);c[15752+e>>2]=0;c[15752+f>>2]=-1;h=c[15752+((c[(c[3938]|0)+-12>>2]|0)+24)>>2]|0;c[3959]=17088;c[3960]=17108;gq(15836+d|0,h);c[15836+e>>2]=0;c[15836+f>>2]=-1;c[15580+((c[(c[3895]|0)+-12>>2]|0)+72)>>2]=15668;f=15752+((c[(c[3938]|0)+-12>>2]|0)+4)|0;c[f>>2]=c[f>>2]|8192;c[15752+((c[(c[3938]|0)+-12>>2]|0)+72)>>2]=15668;mp(16460,a,16340);c[3980]=17048;c[3982]=17068;c[3981]=0;a=c[4259]|0;gq(15920+a|0,16460);c[15920+(a+72)>>2]=0;c[15920+(a+76)>>2]=-1;Uo(16516,b,16348);c[4002]=17128;c[4003]=17148;b=c[4279]|0;gq(16008+b|0,16516);a=b+72|0;c[16008+a>>2]=0;f=b+76|0;c[16008+f>>2]=-1;Uo(16564,g,16356);c[4023]=17128;c[4024]=17148;gq(16092+b|0,16564);c[16092+a>>2]=0;c[16092+f>>2]=-1;g=c[16092+((c[(c[4023]|0)+-12>>2]|0)+24)>>2]|0;c[4044]=17128;c[4045]=17148;gq(16176+b|0,g);c[16176+a>>2]=0;c[16176+f>>2]=-1;c[15920+((c[(c[3980]|0)+-12>>2]|0)+72)>>2]=16008;f=16092+((c[(c[4023]|0)+-12>>2]|0)+4)|0;c[f>>2]=c[f>>2]|8192;c[16092+((c[(c[4023]|0)+-12>>2]|0)+72)>>2]=16008;return}function ik(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=a+28|0;i=c[h>>2]|0;j=(c[a+8>>2]<<16|0)/(i|0)|0;k=a+24|0;l=c[k>>2]|0;m=(c[a+4>>2]<<16|0)/(l|0)|0;n=i+-1|0;c[h>>2]=n;if(!i)return;i=a+20|0;o=a+32|0;p=(b&1|0)==0;b=a+12|0;q=c[i>>2]|0;r=l;l=q;s=n;n=q;q=0;t=0;while(1){if((q|0)>65535){u=q+-65536|0;v=u>>>16;w=u-(v<<16)|0;x=t+1+v|0}else{w=q;x=t}if(!r)y=s;else{v=r;u=n;z=65536;A=0;B=-1;while(1){v=v+-1|0;if((z|0)>65535){C=z+-65536|0;D=C>>>16;E=B+1+D|0;F=C-(D<<16)|0;G=(c[a>>2]|0)+((ca(c[b>>2]|0,x)|0)+(E<<2))|0;H=E}else{F=z;G=A;H=B}E=c[G>>2]|0;D=E>>>24;C=E>>>16&255;I=E>>>8&255;if(p){J=D;K=C;L=I}else{J=((ca(D,g)|0)>>>0)/255|0;K=((ca(C,f)|0)>>>0)/255|0;L=((ca(I,e)|0)>>>0)/255|0}c[u>>2]=J<<16|K<<8|L;if(!v)break;else{u=u+4|0;z=F+m|0;A=G;B=H}}y=c[h>>2]|0}B=l+(c[o>>2]|0)|0;A=y+-1|0;c[h>>2]=A;if(!y){M=B;break}r=c[k>>2]|0;l=B;s=A;n=B;q=w+j|0;t=x}c[i>>2]=M;return}function hk(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=a+28|0;i=c[h>>2]|0;j=(c[a+8>>2]<<16|0)/(i|0)|0;k=a+24|0;l=c[k>>2]|0;m=(c[a+4>>2]<<16|0)/(l|0)|0;n=i+-1|0;c[h>>2]=n;if(!i)return;i=a+20|0;o=a+32|0;p=(b&1|0)==0;b=a+12|0;q=c[i>>2]|0;r=l;l=q;s=n;n=q;q=0;t=0;while(1){if((q|0)>65535){u=q+-65536|0;v=u>>>16;w=u-(v<<16)|0;x=t+1+v|0}else{w=q;x=t}if(!r)y=s;else{v=r;u=n;z=65536;A=0;B=-1;while(1){v=v+-1|0;if((z|0)>65535){C=z+-65536|0;D=C>>>16;E=B+1+D|0;F=C-(D<<16)|0;G=(c[a>>2]|0)+((ca(c[b>>2]|0,x)|0)+(E<<2))|0;H=E}else{F=z;G=A;H=B}E=c[G>>2]|0;D=E>>>24;C=E>>>16&255;I=E>>>8&255;if(p){J=D;K=C;L=I}else{J=((ca(D,g)|0)>>>0)/255|0;K=((ca(C,f)|0)>>>0)/255|0;L=((ca(I,e)|0)>>>0)/255|0}c[u>>2]=J|K<<8|L<<16;if(!v)break;else{u=u+4|0;z=F+m|0;A=G;B=H}}y=c[h>>2]|0}B=l+(c[o>>2]|0)|0;A=y+-1|0;c[h>>2]=A;if(!y){M=B;break}r=c[k>>2]|0;l=B;s=A;n=B;q=w+j|0;t=x}c[i>>2]=M;return}function gk(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=a+28|0;i=c[h>>2]|0;j=(c[a+8>>2]<<16|0)/(i|0)|0;k=a+24|0;l=c[k>>2]|0;m=(c[a+4>>2]<<16|0)/(l|0)|0;n=i+-1|0;c[h>>2]=n;if(!i)return;i=a+20|0;o=a+32|0;p=(b&1|0)==0;b=a+12|0;q=c[i>>2]|0;r=l;l=q;s=n;n=q;q=0;t=0;while(1){if((q|0)>65535){u=q+-65536|0;v=u>>>16;w=u-(v<<16)|0;x=t+1+v|0}else{w=q;x=t}if(!r)y=s;else{v=r;u=n;z=65536;A=0;B=-1;while(1){v=v+-1|0;if((z|0)>65535){C=z+-65536|0;D=C>>>16;E=B+1+D|0;F=C-(D<<16)|0;G=(c[a>>2]|0)+((ca(c[b>>2]|0,x)|0)+(E<<2))|0;H=E}else{F=z;G=A;H=B}E=c[G>>2]|0;D=E>>>24;C=E>>>16&255;I=E>>>8&255;if(p){J=I;K=C;L=D}else{J=((ca(I,g)|0)>>>0)/255|0;K=((ca(C,f)|0)>>>0)/255|0;L=((ca(D,e)|0)>>>0)/255|0}c[u>>2]=J<<16|K<<8|L;if(!v)break;else{u=u+4|0;z=F+m|0;A=G;B=H}}y=c[h>>2]|0}B=l+(c[o>>2]|0)|0;A=y+-1|0;c[h>>2]=A;if(!y){M=B;break}r=c[k>>2]|0;l=B;s=A;n=B;q=w+j|0;t=x}c[i>>2]=M;return}function fk(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=a+28|0;i=c[h>>2]|0;j=(c[a+8>>2]<<16|0)/(i|0)|0;k=a+24|0;l=c[k>>2]|0;m=(c[a+4>>2]<<16|0)/(l|0)|0;n=i+-1|0;c[h>>2]=n;if(!i)return;i=a+20|0;o=a+32|0;p=(b&1|0)==0;b=a+12|0;q=c[i>>2]|0;r=l;l=q;s=n;n=q;q=0;t=0;while(1){if((q|0)>65535){u=q+-65536|0;v=u>>>16;w=u-(v<<16)|0;x=t+1+v|0}else{w=q;x=t}if(!r)y=s;else{v=r;u=n;z=65536;A=0;B=-1;while(1){v=v+-1|0;if((z|0)>65535){C=z+-65536|0;D=C>>>16;E=B+1+D|0;F=C-(D<<16)|0;G=(c[a>>2]|0)+((ca(c[b>>2]|0,x)|0)+(E<<2))|0;H=E}else{F=z;G=A;H=B}E=c[G>>2]|0;D=E>>>24;C=E>>>16&255;I=E>>>8&255;if(p){J=I;K=C;L=D}else{J=((ca(I,g)|0)>>>0)/255|0;K=((ca(C,f)|0)>>>0)/255|0;L=((ca(D,e)|0)>>>0)/255|0}c[u>>2]=J|K<<8|L<<16;if(!v)break;else{u=u+4|0;z=F+m|0;A=G;B=H}}y=c[h>>2]|0}B=l+(c[o>>2]|0)|0;A=y+-1|0;c[h>>2]=A;if(!y){M=B;break}r=c[k>>2]|0;l=B;s=A;n=B;q=w+j|0;t=x}c[i>>2]=M;return}function Wi(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;b=i;i=i+144|0;k=b+24|0;l=b+32|0;m=b+16|0;n=b+8|0;o=b+4|0;p=b+28|0;q=b;c[m>>2]=l;r=m+4|0;c[r>>2]=300;s=Hs(g)|0;c[o>>2]=s;t=Ds(o,18276)|0;a[p>>0]=0;u=c[e>>2]|0;c[q>>2]=u;v=c[g+4>>2]|0;c[k>>2]=c[q>>2];q=u;if(eg(d,k,f,o,v,h,p,t,m,n,l+100|0)|0){if(!(a[j>>0]&1)){a[j+1>>0]=0;a[j>>0]=0}else{a[c[j+8>>2]>>0]=0;c[j+4>>2]=0}if(a[p>>0]|0)jn(j,Nf[c[(c[t>>2]|0)+28>>2]&31](t,45)|0);p=Nf[c[(c[t>>2]|0)+28>>2]&31](t,48)|0;t=c[m>>2]|0;l=c[n>>2]|0;n=l+-1|0;a:do if(t>>>0<n>>>0){v=t;while(1){if((a[v>>0]|0)!=p<<24>>24){w=v;break a}o=v+1|0;if(o>>>0<n>>>0)v=o;else{w=o;break}}}else w=t;while(0);em(j,w,l)|0}l=c[d>>2]|0;do if(l)if((c[l+12>>2]|0)==(c[l+16>>2]|0))if((Af[c[(c[l>>2]|0)+36>>2]&127](l)|0)==-1){c[d>>2]=0;x=0;break}else{x=c[d>>2]|0;break}else x=l;else x=0;while(0);l=(x|0)==0;do if(u){if((c[q+12>>2]|0)==(c[q+16>>2]|0)?(Af[c[(c[u>>2]|0)+36>>2]&127](q)|0)==-1:0){c[e>>2]=0;y=21;break}if(!l)y=22}else y=21;while(0);if((y|0)==21?l:0)y=22;if((y|0)==22)c[h>>2]=c[h>>2]|2;h=c[d>>2]|0;lr(s)|0;s=c[m>>2]|0;c[m>>2]=0;if(s)xf[c[r>>2]&511](s);i=b;return h|0}function qk(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=a+28|0;i=c[h>>2]|0;j=(c[a+8>>2]<<16|0)/(i|0)|0;k=a+24|0;l=c[k>>2]|0;m=(c[a+4>>2]<<16|0)/(l|0)|0;n=i+-1|0;c[h>>2]=n;if(!i)return;i=a+20|0;o=a+32|0;p=(b&1|0)==0;b=a+12|0;q=c[i>>2]|0;r=l;l=q;s=n;n=q;q=0;t=0;while(1){if((q|0)>65535){u=q+-65536|0;v=u>>>16;w=u-(v<<16)|0;x=t+1+v|0}else{w=q;x=t}if(!r)y=s;else{v=r;u=n;z=65536;A=0;B=-1;while(1){v=v+-1|0;if((z|0)>65535){C=z+-65536|0;D=C>>>16;E=B+1+D|0;F=C-(D<<16)|0;G=(c[a>>2]|0)+((ca(c[b>>2]|0,x)|0)+(E<<2))|0;H=E}else{F=z;G=A;H=B}E=c[G>>2]|0;D=E>>>16&255;C=E>>>8&255;I=E&255;if(p){J=D;K=C;L=I}else{J=((ca(D,g)|0)>>>0)/255|0;K=((ca(C,f)|0)>>>0)/255|0;L=((ca(I,e)|0)>>>0)/255|0}c[u>>2]=J<<16|K<<8|L;if(!v)break;else{u=u+4|0;z=F+m|0;A=G;B=H}}y=c[h>>2]|0}B=l+(c[o>>2]|0)|0;A=y+-1|0;c[h>>2]=A;if(!y){M=B;break}r=c[k>>2]|0;l=B;s=A;n=B;q=w+j|0;t=x}c[i>>2]=M;return}function pk(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=a+28|0;i=c[h>>2]|0;j=(c[a+8>>2]<<16|0)/(i|0)|0;k=a+24|0;l=c[k>>2]|0;m=(c[a+4>>2]<<16|0)/(l|0)|0;n=i+-1|0;c[h>>2]=n;if(!i)return;i=a+20|0;o=a+32|0;p=(b&1|0)==0;b=a+12|0;q=c[i>>2]|0;r=l;l=q;s=n;n=q;q=0;t=0;while(1){if((q|0)>65535){u=q+-65536|0;v=u>>>16;w=u-(v<<16)|0;x=t+1+v|0}else{w=q;x=t}if(!r)y=s;else{v=r;u=n;z=65536;A=0;B=-1;while(1){v=v+-1|0;if((z|0)>65535){C=z+-65536|0;D=C>>>16;E=B+1+D|0;F=C-(D<<16)|0;G=(c[a>>2]|0)+((ca(c[b>>2]|0,x)|0)+(E<<2))|0;H=E}else{F=z;G=A;H=B}E=c[G>>2]|0;D=E>>>16&255;C=E>>>8&255;I=E&255;if(p){J=D;K=C;L=I}else{J=((ca(D,g)|0)>>>0)/255|0;K=((ca(C,f)|0)>>>0)/255|0;L=((ca(I,e)|0)>>>0)/255|0}c[u>>2]=J|K<<8|L<<16;if(!v)break;else{u=u+4|0;z=F+m|0;A=G;B=H}}y=c[h>>2]|0}B=l+(c[o>>2]|0)|0;A=y+-1|0;c[h>>2]=A;if(!y){M=B;break}r=c[k>>2]|0;l=B;s=A;n=B;q=w+j|0;t=x}c[i>>2]=M;return}function ok(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=a+28|0;i=c[h>>2]|0;j=(c[a+8>>2]<<16|0)/(i|0)|0;k=a+24|0;l=c[k>>2]|0;m=(c[a+4>>2]<<16|0)/(l|0)|0;n=i+-1|0;c[h>>2]=n;if(!i)return;i=a+20|0;o=a+32|0;p=(b&1|0)==0;b=a+12|0;q=c[i>>2]|0;r=l;l=q;s=n;n=q;q=0;t=0;while(1){if((q|0)>65535){u=q+-65536|0;v=u>>>16;w=u-(v<<16)|0;x=t+1+v|0}else{w=q;x=t}if(!r)y=s;else{v=r;u=n;z=65536;A=0;B=-1;while(1){v=v+-1|0;if((z|0)>65535){C=z+-65536|0;D=C>>>16;E=B+1+D|0;F=C-(D<<16)|0;G=(c[a>>2]|0)+((ca(c[b>>2]|0,x)|0)+(E<<2))|0;H=E}else{F=z;G=A;H=B}E=c[G>>2]|0;D=E>>>16&255;C=E>>>8&255;I=E&255;if(p){J=I;K=C;L=D}else{J=((ca(I,g)|0)>>>0)/255|0;K=((ca(C,f)|0)>>>0)/255|0;L=((ca(D,e)|0)>>>0)/255|0}c[u>>2]=J<<16|K<<8|L;if(!v)break;else{u=u+4|0;z=F+m|0;A=G;B=H}}y=c[h>>2]|0}B=l+(c[o>>2]|0)|0;A=y+-1|0;c[h>>2]=A;if(!y){M=B;break}r=c[k>>2]|0;l=B;s=A;n=B;q=w+j|0;t=x}c[i>>2]=M;return}function nk(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=a+28|0;i=c[h>>2]|0;j=(c[a+8>>2]<<16|0)/(i|0)|0;k=a+24|0;l=c[k>>2]|0;m=(c[a+4>>2]<<16|0)/(l|0)|0;n=i+-1|0;c[h>>2]=n;if(!i)return;i=a+20|0;o=a+32|0;p=(b&1|0)==0;b=a+12|0;q=c[i>>2]|0;r=l;l=q;s=n;n=q;q=0;t=0;while(1){if((q|0)>65535){u=q+-65536|0;v=u>>>16;w=u-(v<<16)|0;x=t+1+v|0}else{w=q;x=t}if(!r)y=s;else{v=r;u=n;z=65536;A=0;B=-1;while(1){v=v+-1|0;if((z|0)>65535){C=z+-65536|0;D=C>>>16;E=B+1+D|0;F=C-(D<<16)|0;G=(c[a>>2]|0)+((ca(c[b>>2]|0,x)|0)+(E<<2))|0;H=E}else{F=z;G=A;H=B}E=c[G>>2]|0;D=E>>>16&255;C=E>>>8&255;I=E&255;if(p){J=I;K=C;L=D}else{J=((ca(I,g)|0)>>>0)/255|0;K=((ca(C,f)|0)>>>0)/255|0;L=((ca(D,e)|0)>>>0)/255|0}c[u>>2]=J|K<<8|L<<16;if(!v)break;else{u=u+4|0;z=F+m|0;A=G;B=H}}y=c[h>>2]|0}B=l+(c[o>>2]|0)|0;A=y+-1|0;c[h>>2]=A;if(!y){M=B;break}r=c[k>>2]|0;l=B;s=A;n=B;q=w+j|0;t=x}c[i>>2]=M;return}function mk(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=a+28|0;i=c[h>>2]|0;j=(c[a+8>>2]<<16|0)/(i|0)|0;k=a+24|0;l=c[k>>2]|0;m=(c[a+4>>2]<<16|0)/(l|0)|0;n=i+-1|0;c[h>>2]=n;if(!i)return;i=a+20|0;o=a+32|0;p=(b&1|0)==0;b=a+12|0;q=c[i>>2]|0;r=l;l=q;s=n;n=q;q=0;t=0;while(1){if((q|0)>65535){u=q+-65536|0;v=u>>>16;w=u-(v<<16)|0;x=t+1+v|0}else{w=q;x=t}if(!r)y=s;else{v=r;u=n;z=65536;A=0;B=-1;while(1){v=v+-1|0;if((z|0)>65535){C=z+-65536|0;D=C>>>16;E=B+1+D|0;F=C-(D<<16)|0;G=(c[a>>2]|0)+((ca(c[b>>2]|0,x)|0)+(E<<2))|0;H=E}else{F=z;G=A;H=B}E=c[G>>2]|0;D=E>>>16&255;C=E>>>8&255;I=E&255;if(p){J=D;K=C;L=I}else{J=((ca(D,g)|0)>>>0)/255|0;K=((ca(C,f)|0)>>>0)/255|0;L=((ca(I,e)|0)>>>0)/255|0}c[u>>2]=J<<16|K<<8|L;if(!v)break;else{u=u+4|0;z=F+m|0;A=G;B=H}}y=c[h>>2]|0}B=l+(c[o>>2]|0)|0;A=y+-1|0;c[h>>2]=A;if(!y){M=B;break}r=c[k>>2]|0;l=B;s=A;n=B;q=w+j|0;t=x}c[i>>2]=M;return}function lk(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=a+28|0;i=c[h>>2]|0;j=(c[a+8>>2]<<16|0)/(i|0)|0;k=a+24|0;l=c[k>>2]|0;m=(c[a+4>>2]<<16|0)/(l|0)|0;n=i+-1|0;c[h>>2]=n;if(!i)return;i=a+20|0;o=a+32|0;p=(b&1|0)==0;b=a+12|0;q=c[i>>2]|0;r=l;l=q;s=n;n=q;q=0;t=0;while(1){if((q|0)>65535){u=q+-65536|0;v=u>>>16;w=u-(v<<16)|0;x=t+1+v|0}else{w=q;x=t}if(!r)y=s;else{v=r;u=n;z=65536;A=0;B=-1;while(1){v=v+-1|0;if((z|0)>65535){C=z+-65536|0;D=C>>>16;E=B+1+D|0;F=C-(D<<16)|0;G=(c[a>>2]|0)+((ca(c[b>>2]|0,x)|0)+(E<<2))|0;H=E}else{F=z;G=A;H=B}E=c[G>>2]|0;D=E>>>16&255;C=E>>>8&255;I=E&255;if(p){J=D;K=C;L=I}else{J=((ca(D,g)|0)>>>0)/255|0;K=((ca(C,f)|0)>>>0)/255|0;L=((ca(I,e)|0)>>>0)/255|0}c[u>>2]=J|K<<8|L<<16;if(!v)break;else{u=u+4|0;z=F+m|0;A=G;B=H}}y=c[h>>2]|0}B=l+(c[o>>2]|0)|0;A=y+-1|0;c[h>>2]=A;if(!y){M=B;break}r=c[k>>2]|0;l=B;s=A;n=B;q=w+j|0;t=x}c[i>>2]=M;return}function kk(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=a+28|0;i=c[h>>2]|0;j=(c[a+8>>2]<<16|0)/(i|0)|0;k=a+24|0;l=c[k>>2]|0;m=(c[a+4>>2]<<16|0)/(l|0)|0;n=i+-1|0;c[h>>2]=n;if(!i)return;i=a+20|0;o=a+32|0;p=(b&1|0)==0;b=a+12|0;q=c[i>>2]|0;r=l;l=q;s=n;n=q;q=0;t=0;while(1){if((q|0)>65535){u=q+-65536|0;v=u>>>16;w=u-(v<<16)|0;x=t+1+v|0}else{w=q;x=t}if(!r)y=s;else{v=r;u=n;z=65536;A=0;B=-1;while(1){v=v+-1|0;if((z|0)>65535){C=z+-65536|0;D=C>>>16;E=B+1+D|0;F=C-(D<<16)|0;G=(c[a>>2]|0)+((ca(c[b>>2]|0,x)|0)+(E<<2))|0;H=E}else{F=z;G=A;H=B}E=c[G>>2]|0;D=E>>>16&255;C=E>>>8&255;I=E&255;if(p){J=I;K=C;L=D}else{J=((ca(I,g)|0)>>>0)/255|0;K=((ca(C,f)|0)>>>0)/255|0;L=((ca(D,e)|0)>>>0)/255|0}c[u>>2]=J<<16|K<<8|L;if(!v)break;else{u=u+4|0;z=F+m|0;A=G;B=H}}y=c[h>>2]|0}B=l+(c[o>>2]|0)|0;A=y+-1|0;c[h>>2]=A;if(!y){M=B;break}r=c[k>>2]|0;l=B;s=A;n=B;q=w+j|0;t=x}c[i>>2]=M;return}function jk(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=a+28|0;i=c[h>>2]|0;j=(c[a+8>>2]<<16|0)/(i|0)|0;k=a+24|0;l=c[k>>2]|0;m=(c[a+4>>2]<<16|0)/(l|0)|0;n=i+-1|0;c[h>>2]=n;if(!i)return;i=a+20|0;o=a+32|0;p=(b&1|0)==0;b=a+12|0;q=c[i>>2]|0;r=l;l=q;s=n;n=q;q=0;t=0;while(1){if((q|0)>65535){u=q+-65536|0;v=u>>>16;w=u-(v<<16)|0;x=t+1+v|0}else{w=q;x=t}if(!r)y=s;else{v=r;u=n;z=65536;A=0;B=-1;while(1){v=v+-1|0;if((z|0)>65535){C=z+-65536|0;D=C>>>16;E=B+1+D|0;F=C-(D<<16)|0;G=(c[a>>2]|0)+((ca(c[b>>2]|0,x)|0)+(E<<2))|0;H=E}else{F=z;G=A;H=B}E=c[G>>2]|0;D=E>>>16&255;C=E>>>8&255;I=E&255;if(p){J=I;K=C;L=D}else{J=((ca(I,g)|0)>>>0)/255|0;K=((ca(C,f)|0)>>>0)/255|0;L=((ca(D,e)|0)>>>0)/255|0}c[u>>2]=J|K<<8|L<<16;if(!v)break;else{u=u+4|0;z=F+m|0;A=G;B=H}}y=c[h>>2]|0}B=l+(c[o>>2]|0)|0;A=y+-1|0;c[h>>2]=A;if(!y){M=B;break}r=c[k>>2]|0;l=B;s=A;n=B;q=w+j|0;t=x}c[i>>2]=M;return}function Sj(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;e=i;i=i+32|0;f=e+16|0;g=e+8|0;h=e+4|0;j=e;k=b+52|0;a:do if(a[k>>0]|0){l=b+48|0;m=c[l>>2]|0;if(d){c[l>>2]=-1;a[k>>0]=0;n=m}else n=m}else{m=c[b+44>>2]|0;l=(m|0)>1?m:1;m=b+32|0;if((l|0)>0){o=0;do{p=We(c[m>>2]|0)|0;if((p|0)==-1){n=-1;break a}a[f+o>>0]=p;o=o+1|0}while((o|0)<(l|0))}b:do if(!(a[b+53>>0]|0)){o=b+40|0;p=b+36|0;q=g+4|0;r=l;c:while(1){s=c[o>>2]|0;t=s;u=c[t>>2]|0;v=c[t+4>>2]|0;t=c[p>>2]|0;w=f+r|0;switch(Kf[c[(c[t>>2]|0)+16>>2]&15](t,s,f,w,h,g,q,j)|0){case 2:{n=-1;break a;break}case 3:{x=r;break c;break}case 1:break;default:{y=r;break b}}s=c[o>>2]|0;c[s>>2]=u;c[s+4>>2]=v;if((r|0)==8){n=-1;break a}v=We(c[m>>2]|0)|0;if((v|0)==-1){n=-1;break a}a[w>>0]=v;r=r+1|0}c[g>>2]=a[f>>0];y=x}else{c[g>>2]=a[f>>0];y=l}while(0);if(d){l=c[g>>2]|0;c[b+48>>2]=l;n=l;break}else z=y;while(1){if((z|0)<=0)break;z=z+-1|0;if((me(a[f+z>>0]|0,c[m>>2]|0)|0)==-1){n=-1;break a}}n=c[g>>2]|0}while(0);i=e;return n|0}function yk(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;d=c[b+24>>2]|0;e=c[b+28>>2]|0;f=c[b>>2]|0;g=c[b+20>>2]|0;h=c[b+36>>2]|0;i=c[b+56>>2]|0;j=c[b+48>>2]|0;k=d-((d+7|0)/8|0)+(c[b+16>>2]|0)|0;b=(e|0)==0;if(!j){if(b)return;l=(d|0)>0;m=e;n=g;o=f;while(1){m=m+-1|0;if(l){p=0;q=0;r=n;s=o;while(1){if(!(q&7)){t=a[s>>0]|0;u=s+1|0}else{t=p;u=s}v=(t&255)>>>7;if((v&255|0)!=(i|0))a[r>>0]=v;q=q+1|0;if((q|0)==(d|0)){w=u;break}else{p=(t&255)<<1&255;r=r+1|0;s=u}}x=n+d|0;y=w}else{x=n;y=o}if(!m)break;else{n=x+h|0;o=y+k|0}}return}else{if(b)return;b=(d|0)>0;y=e;e=g;g=f;while(1){y=y+-1|0;if(b){f=0;o=0;x=e;n=g;while(1){if(!(o&7)){z=a[n>>0]|0;A=n+1|0}else{z=f;A=n}m=(z&255)>>>7&255;if((m|0)!=(i|0))a[x>>0]=a[j+m>>0]|0;o=o+1|0;if((o|0)==(d|0)){B=A;break}else{f=(z&255)<<1&255;x=x+1|0;n=A}}C=e+d|0;D=B}else{C=e;D=g}if(!y)break;else{e=C+h|0;g=D+k|0}}return}}function sk(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;f=i;i=i+272|0;g=f+8|0;h=f;j=c[b>>2]|0;c[h>>2]=j;k=(a|0)!=0;l=k?e:256;e=k?a:g;a=j;a:do if((l|0)!=0&(j|0)!=0){m=d;n=l;o=a;p=0;q=e;while(1){r=m>>>0>=n>>>0;if(!(r|m>>>0>32)){s=m;t=n;u=o;v=p;w=q;break a}x=r?n:m;r=m-x|0;y=nj(q,h,x,0)|0;if((y|0)==-1){z=r;A=q;break}x=(q|0)==(g|0);B=x?0:y;C=n-B|0;D=x?q:q+y|0;x=y+p|0;y=c[h>>2]|0;if((n|0)!=(B|0)&(y|0)!=0){m=r;n=C;o=y;p=x;q=D}else{s=r;t=C;u=y;v=x;w=D;break a}}s=z;t=0;u=c[h>>2]|0;v=-1;w=A}else{s=d;t=l;u=a;v=0;w=e}while(0);b:do if((u|0)!=0?(t|0)!=0&(s|0)!=0:0){e=s;a=t;l=u;d=v;A=w;while(1){z=tn(A,c[l>>2]|0,0)|0;if((z+1|0)>>>0<2){E=z;F=d;break}l=(c[h>>2]|0)+4|0;c[h>>2]=l;e=e+-1|0;g=d+1|0;if(!((a|0)!=(z|0)&(e|0)!=0)){G=g;break b}else{a=a-z|0;d=g;A=A+z|0}}if(!E){c[h>>2]=0;G=F}else G=-1}else G=v;while(0);if(!k){i=f;return G|0}c[b>>2]=c[h>>2];i=f;return G|0}function wk(b,d,e,f,g,h,i,j,k,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0;m=c[f>>2]|0;n=(m|0)==(e|0);do if(n){o=(a[l+24>>0]|0)==b<<24>>24;if(!o?(a[l+25>>0]|0)!=b<<24>>24:0){p=5;break}c[f>>2]=e+1;a[e>>0]=o?43:45;c[g>>2]=0;q=0}else p=5;while(0);a:do if((p|0)==5){o=a[i>>0]|0;if(b<<24>>24==h<<24>>24?(((o&1)==0?(o&255)>>>1:c[i+4>>2]|0)|0)!=0:0){o=c[k>>2]|0;if((o-j|0)>=160){q=0;break}r=c[g>>2]|0;c[k>>2]=o+4;c[o>>2]=r;c[g>>2]=0;q=0;break}r=l+26|0;o=l;while(1){if((a[o>>0]|0)==b<<24>>24){s=o;break}o=o+1|0;if((o|0)==(r|0)){s=r;break}}r=s-l|0;if((r|0)>23)q=-1;else{switch(d|0){case 10:case 8:{if((r|0)>=(d|0)){q=-1;break a}break}case 16:{if((r|0)>=22){if(n){q=-1;break a}if((m-e|0)>=3){q=-1;break a}if((a[m+-1>>0]|0)!=48){q=-1;break a}c[g>>2]=0;o=a[32305+r>>0]|0;c[f>>2]=m+1;a[m>>0]=o;q=0;break a}break}default:{}}o=a[32305+r>>0]|0;c[f>>2]=m+1;a[m>>0]=o;c[g>>2]=(c[g>>2]|0)+1;q=0}}while(0);return q|0}function ck(b,e,f,g,h,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0;b=i;i=i+16|0;m=Nh(g,h,j,k,l)|0;if(!m){Cj(24143,b)|0;n=0;i=b;return n|0}k=oA(1,60)|0;if(!k){Fp(0)|0;n=0;i=b;return n|0}j=Mm(m)|0;m=k+4|0;c[m>>2]=j;if(!j){rm(k);n=0;i=b;return n|0}j=k+8|0;c[j>>2]=e;e=k+12|0;c[e>>2]=f;f=k+16|0;c[f>>2]=uq(k)|0;h=c[j>>2]|0;g=c[e>>2]|0;c[k+36>>2]=0;c[k+40>>2]=0;c[k+44>>2]=h;c[k+48>>2]=g;g=c[m>>2]|0;o=c[g>>2]|0;if((o|0)==0|(o&-268435456|0)==268435456?((o>>>24&15)+-1|0)>>>0<3:0){o=mo(1<<(d[g+8>>0]|0))|0;if(!o){rm(k);n=0;i=b;return n|0}if((c[o>>2]|0)==2){g=c[o+4>>2]|0;a[g>>0]=-1;a[g+1>>0]=-1;a[g+2>>0]=-1;a[g+4>>0]=0;a[g+5>>0]=0;a[g+6>>0]=0}if((en(c[m>>2]|0,o)|0)>=0)hq(c[k+52>>2]|0);fq(o);p=c[j>>2]|0}else p=h;do if((p|0)!=0?(h=c[e>>2]|0,(h|0)!=0):0){j=iB(ca(c[f>>2]|0,h)|0)|0;c[k+20>>2]=j;if(j){Fw(j,0,ca(c[f>>2]|0,c[e>>2]|0)|0)|0;break}rm(k);Fp(0)|0;n=0;i=b;return n|0}while(0);e=Oq()|0;c[k+52>>2]=e;if(!e){rm(k);n=0;i=b;return n|0}if((l|0)!=0?(l=e+68|0,f=c[l>>2]|0,p=f&-113|16,c[l>>2]=p,(p|0)!=(f|0)):0)hq(e);c[k+56>>2]=1;n=k;i=b;return n|0}function xk(b,d,e,f,g,h,i,j,k,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0;m=c[f>>2]|0;n=(m|0)==(e|0);do if(n){o=(c[l+96>>2]|0)==(b|0);if(!o?(c[l+100>>2]|0)!=(b|0):0){p=5;break}c[f>>2]=e+1;a[e>>0]=o?43:45;c[g>>2]=0;q=0}else p=5;while(0);a:do if((p|0)==5){o=a[i>>0]|0;if((b|0)==(h|0)?(((o&1)==0?(o&255)>>>1:c[i+4>>2]|0)|0)!=0:0){o=c[k>>2]|0;if((o-j|0)>=160){q=0;break}r=c[g>>2]|0;c[k>>2]=o+4;c[o>>2]=r;c[g>>2]=0;q=0;break}r=l+104|0;o=l;while(1){if((c[o>>2]|0)==(b|0)){s=o;break}o=o+4|0;if((o|0)==(r|0)){s=r;break}}r=s-l|0;o=r>>2;if((r|0)>92)q=-1;else{switch(d|0){case 10:case 8:{if((o|0)>=(d|0)){q=-1;break a}break}case 16:{if((r|0)>=88){if(n){q=-1;break a}if((m-e|0)>=3){q=-1;break a}if((a[m+-1>>0]|0)!=48){q=-1;break a}c[g>>2]=0;r=a[32305+o>>0]|0;c[f>>2]=m+1;a[m>>0]=r;q=0;break a}break}default:{}}r=a[32305+o>>0]|0;c[f>>2]=m+1;a[m>>0]=r;c[g>>2]=(c[g>>2]|0)+1;q=0}}while(0);return q|0}function Bk(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=e+-1|0;c[d>>2]=f;if(!e)return;e=a+20|0;g=a+24|0;h=a+12|0;i=a+32|0;j=b&112;b=f;do{f=c[g>>2]|0;if(!f){k=c[a>>2]|0;l=c[e>>2]|0;m=b}else{n=c[e>>2]|0;o=c[a>>2]|0;p=f;f=n;q=o;while(1){p=p+-1|0;r=c[q>>2]|0;s=r>>>16&255;t=r>>>8&255;u=r&255;r=c[f>>2]|0;v=r>>>16&255;w=r>>>8&255;x=r&255;y=r>>>24;switch(j|0){case 16:{z=255;A=s;B=t;C=u;break}case 32:{r=v+u|0;D=w+t|0;E=s+x|0;z=y;A=E>>>0>255?255:E;B=D>>>0>255?255:D;C=r>>>0>255?255:r;break}case 64:{z=y;A=((ca(s,x)|0)>>>0)/255|0;B=((ca(w,t)|0)>>>0)/255|0;C=((ca(v,u)|0)>>>0)/255|0;break}default:{z=y;A=x;B=w;C=v}}c[f>>2]=B<<8|C<<16|A|z<<24;if(!p)break;else{f=f+4|0;q=q+4|0}}k=o;l=n;m=c[d>>2]|0}c[a>>2]=k+(c[h>>2]|0);c[e>>2]=l+(c[i>>2]|0);b=m+-1|0;c[d>>2]=b}while((m|0)!=0);return}function Ak(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=e+-1|0;c[d>>2]=f;if(!e)return;e=a+20|0;g=a+24|0;h=a+12|0;i=a+32|0;j=b&112;b=f;do{f=c[g>>2]|0;if(!f){k=c[a>>2]|0;l=c[e>>2]|0;m=b}else{n=c[e>>2]|0;o=c[a>>2]|0;p=f;f=n;q=o;while(1){p=p+-1|0;r=c[q>>2]|0;s=r>>>16&255;t=r>>>8&255;u=r&255;r=c[f>>2]|0;v=r>>>16&255;w=r>>>8&255;x=r&255;y=r>>>24;switch(j|0){case 16:{z=255;A=u;B=t;C=s;break}case 32:{r=v+s|0;D=w+t|0;E=x+u|0;z=y;A=E>>>0>255?255:E;B=D>>>0>255?255:D;C=r>>>0>255?255:r;break}case 64:{z=y;A=((ca(x,u)|0)>>>0)/255|0;B=((ca(w,t)|0)>>>0)/255|0;C=((ca(v,s)|0)>>>0)/255|0;break}default:{z=y;A=x;B=w;C=v}}c[f>>2]=B<<8|C<<16|A|z<<24;if(!p)break;else{f=f+4|0;q=q+4|0}}k=o;l=n;m=c[d>>2]|0}c[a>>2]=k+(c[h>>2]|0);c[e>>2]=l+(c[i>>2]|0);b=m+-1|0;c[d>>2]=b}while((m|0)!=0);return}function zk(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;f=d&255;g=(e|0)!=0;a:do if(g&(b&3|0)!=0){h=d&255;i=e;j=b;while(1){if((a[j>>0]|0)==h<<24>>24){k=i;l=j;m=6;break a}n=j+1|0;o=i+-1|0;p=(o|0)!=0;if(p&(n&3|0)!=0){i=o;j=n}else{q=o;r=p;s=n;m=5;break}}}else{q=e;r=g;s=b;m=5}while(0);if((m|0)==5)if(r){k=q;l=s;m=6}else{t=0;u=s}b:do if((m|0)==6){s=d&255;if((a[l>>0]|0)==s<<24>>24){t=k;u=l}else{q=ca(f,16843009)|0;c:do if(k>>>0>3){r=k;b=l;while(1){g=c[b>>2]^q;if((g&-2139062144^-2139062144)&g+-16843009){v=r;w=b;break}g=b+4|0;e=r+-4|0;if(e>>>0>3){r=e;b=g}else{x=e;y=g;m=11;break c}}z=v;A=w}else{x=k;y=l;m=11}while(0);if((m|0)==11)if(!x){t=0;u=y;break}else{z=x;A=y}while(1){if((a[A>>0]|0)==s<<24>>24){t=z;u=A;break b}q=A+1|0;z=z+-1|0;if(!z){t=0;u=q;break}else A=q}}}while(0);return ((t|0)!=0?u:0)|0}function Kh(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;c[a+4>>2]=b+-1;c[a>>2]=18252;b=a+8|0;cq(b,28);wp(a+144|0,33692,1);d=c[b>>2]|0;b=a+12|0;e=c[b>>2]|0;if((e|0)!=(d|0)){f=e;while(1){e=f+-4|0;if((e|0)==(d|0)){g=e;break}else f=e}c[b>>2]=g}c[513]=0;c[512]=17180;it(a,2048);c[515]=0;c[514]=17220;ht(a,2056);gr(2064,0,0,1);ot(a,2064);c[521]=0;c[520]=18540;nt(a,2080);c[523]=0;c[522]=18608;Rs(a,2088);c[525]=0;c[524]=18360;c[526]=Ps()|0;Qs(a,2096);c[529]=0;c[528]=18656;Ns(a,2112);c[531]=0;c[530]=18704;Os(a,2120);Jr(2128,1);et(a,2128);Fr(2152,1);dt(a,2152);c[547]=0;c[546]=17260;js(a,2184);c[549]=0;c[548]=17332;is(a,2192);c[551]=0;c[550]=17404;hs(a,2200);c[553]=0;c[552]=17464;gs(a,2208);c[555]=0;c[554]=17772;Ws(a,2216);c[557]=0;c[556]=17836;Vs(a,2224);c[559]=0;c[558]=17900;Us(a,2232);c[561]=0;c[560]=17964;Ts(a,2240);c[563]=0;c[562]=18028;bs(a,2248);c[565]=0;c[564]=18064;as(a,2256);c[567]=0;c[566]=18100;$r(a,2264);c[569]=0;c[568]=18136;_r(a,2272);c[571]=0;c[570]=17524;c[572]=17572;fs(a,2280);c[575]=0;c[574]=17616;c[576]=17664;es(a,2296);c[579]=0;c[578]=18520;c[580]=Ps()|0;c[578]=17708;ds(a,2312);c[583]=0;c[582]=18520;c[584]=Ps()|0;c[582]=17740;cs(a,2328);c[587]=0;c[586]=18172;gt(a,2344);c[589]=0;c[588]=18212;ft(a,2352);return}function vk(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;g=i;i=i+16|0;h=g;c[h>>2]=b;j=(f|0)==0?14776:f;f=c[j>>2]|0;a:do if(!d){if(!f){k=0;i=g;return k|0}}else{if(!b){c[h>>2]=h;l=h}else l=b;if(!e){k=-2;i=g;return k|0}do if(!f){m=a[d>>0]|0;n=m&255;if(m<<24>>24<=-1){o=n+-194|0;if(o>>>0>50)break a;p=c[14568+(o<<2)>>2]|0;o=e+-1|0;if(!o){q=p;break}else{r=o;s=p;t=d+1|0;u=11;break}}else{c[l>>2]=n;k=m<<24>>24!=0&1;i=g;return k|0}}else{r=e;s=f;t=d;u=11}while(0);b:do if((u|0)==11){m=a[t>>0]|0;n=(m&255)>>>3;if((n+-16|n+(s>>26))>>>0>7)break a;else{v=r;w=m;x=s;y=t}while(1){y=y+1|0;x=(w&255)+-128|x<<6;v=v+-1|0;if((x|0)>=0){z=x;A=v;break}if(!v){q=x;break b}w=a[y>>0]|0;if((w&-64)<<24>>24!=-128)break a}c[j>>2]=0;c[l>>2]=z;k=e-A|0;i=g;return k|0}while(0);c[j>>2]=q;k=-2;i=g;return k|0}while(0);c[j>>2]=0;c[(pd()|0)>>2]=84;k=-1;i=g;return k|0}function Hk(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=e+-1|0;c[d>>2]=f;if(!e)return;e=a+20|0;g=a+24|0;h=a+12|0;i=a+32|0;j=b&112;b=f;do{f=c[g>>2]|0;if(!f){k=c[a>>2]|0;l=c[e>>2]|0;m=b}else{n=c[e>>2]|0;o=c[a>>2]|0;p=f;f=n;q=o;while(1){p=p+-1|0;r=c[q>>2]|0;s=r>>>16&255;t=r>>>8&255;u=r&255;r=c[f>>2]|0;v=r>>>16&255;w=r>>>8&255;x=r&255;switch(j|0){case 16:{y=s;z=t;A=u;break}case 32:{r=x+u|0;B=w+t|0;C=v+s|0;y=C>>>0>255?255:C;z=B>>>0>255?255:B;A=r>>>0>255?255:r;break}case 64:{y=((ca(v,s)|0)>>>0)/255|0;z=((ca(w,t)|0)>>>0)/255|0;A=((ca(x,u)|0)>>>0)/255|0;break}default:{y=v;z=w;A=x}}c[f>>2]=z<<8|A|y<<16;if(!p)break;else{f=f+4|0;q=q+4|0}}k=o;l=n;m=c[d>>2]|0}c[a>>2]=k+(c[h>>2]|0);c[e>>2]=l+(c[i>>2]|0);b=m+-1|0;c[d>>2]=b}while((m|0)!=0);return}function Gk(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=e+-1|0;c[d>>2]=f;if(!e)return;e=a+20|0;g=a+24|0;h=a+12|0;i=a+32|0;j=b&112;b=f;do{f=c[g>>2]|0;if(!f){k=c[a>>2]|0;l=c[e>>2]|0;m=b}else{n=c[e>>2]|0;o=c[a>>2]|0;p=f;f=n;q=o;while(1){p=p+-1|0;r=c[q>>2]|0;s=r>>>16&255;t=r>>>8&255;u=r&255;r=c[f>>2]|0;v=r>>>16&255;w=r>>>8&255;x=r&255;switch(j|0){case 16:{y=s;z=t;A=u;break}case 32:{r=v+u|0;B=w+t|0;C=s+x|0;y=C>>>0>255?255:C;z=B>>>0>255?255:B;A=r>>>0>255?255:r;break}case 64:{y=((ca(s,x)|0)>>>0)/255|0;z=((ca(w,t)|0)>>>0)/255|0;A=((ca(v,u)|0)>>>0)/255|0;break}default:{y=x;z=w;A=v}}c[f>>2]=z<<8|A<<16|y;if(!p)break;else{f=f+4|0;q=q+4|0}}k=o;l=n;m=c[d>>2]|0}c[a>>2]=k+(c[h>>2]|0);c[e>>2]=l+(c[i>>2]|0);b=m+-1|0;c[d>>2]=b}while((m|0)!=0);return}function Fk(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;b=c[a+52>>2]|0;d=a+28|0;e=c[d>>2]|0;f=e+-1|0;c[d>>2]=f;if(!e)return;e=a+20|0;g=a+24|0;h=a+12|0;i=a+32|0;j=b&112;b=f;do{f=c[g>>2]|0;if(!f){k=c[a>>2]|0;l=c[e>>2]|0;m=b}else{n=c[e>>2]|0;o=c[a>>2]|0;p=f;f=n;q=o;while(1){p=p+-1|0;r=c[q>>2]|0;s=r>>>16&255;t=r>>>8&255;u=r&255;r=c[f>>2]|0;v=r>>>16&255;w=r>>>8&255;x=r&255;switch(j|0){case 16:{y=u;z=t;A=s;break}case 32:{r=s+x|0;B=w+t|0;C=v+u|0;y=C>>>0>255?255:C;z=B>>>0>255?255:B;A=r>>>0>255?255:r;break}case 64:{y=((ca(v,u)|0)>>>0)/255|0;z=((ca(w,t)|0)>>>0)/255|0;A=((ca(s,x)|0)>>>0)/255|0;break}default:{y=v;z=w;A=x}}c[f>>2]=z<<8|A|y<<16;if(!p)break;else{f=f+4|0;q=q+4|0}}k=o;l=n;m=c[d>>2]|0}c[a>>2]=k+(c[h>>2]|0);c[e>>2]=l+(c[i>>2]|0);b=m+-1|0;c[d>>2]=b}while((m|0)!=0);return}function Ck(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;if(f){g=c[b>>2]|0;do if((g|0)<=(c[e>>2]|0)){if((b|0)!=(e|0)?(Ey(c[b+4>>2]|0,c[e+4>>2]|0,g<<2)|0)!=0:0)break;c[f>>2]=1;h=0;return h|0}while(0);c[f>>2]=0}f=iB(c[b>>2]|0)|0;if(!f){Fp(0)|0;h=0;return h|0}if((c[b>>2]|0)<=0){h=f;return h|0}g=b+4|0;i=e+4|0;j=0;while(1){k=c[g>>2]|0;l=c[e>>2]|0;a:do if((l|0)>0){m=c[i>>2]|0;n=d[k+(j<<2)>>0]|0;o=d[k+(j<<2)+1>>0]|0;p=d[k+(j<<2)+2>>0]|0;q=d[k+(j<<2)+3>>0]|0;r=0;s=0;t=-1;while(1){u=(d[m+(r<<2)>>0]|0)-n|0;v=(d[m+(r<<2)+1>>0]|0)-o|0;w=(d[m+(r<<2)+2>>0]|0)-p|0;x=(d[m+(r<<2)+3>>0]|0)-q|0;y=(ca(v,v)|0)+(ca(u,u)|0)+(ca(w,w)|0)+(ca(x,x)|0)|0;if(y>>>0<t>>>0){x=r&255;if(!y){z=x;break a}else{A=x;B=y}}else{A=s;B=t}r=r+1|0;if((r|0)>=(l|0)){z=A;break}else{s=A;t=B}}}else z=0;while(0);a[f+j>>0]=z;j=j+1|0;if((j|0)>=(c[b>>2]|0)){h=f;break}}return h|0}function rk(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;d=i;i=i+176|0;j=d+168|0;k=d+40|0;l=d+32|0;m=d+28|0;n=d+16|0;o=d+8|0;p=d;c[n>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;c[o+4>>2]=0;c[o>>2]=18752;q=a[h>>0]|0;r=(q&1)==0;s=h+4|0;t=r?s:c[h+8>>2]|0;h=r?(q&255)>>>1:c[s>>2]|0;s=t+(h<<2)|0;q=k+32|0;if((h|0)>0){h=t;do{c[m>>2]=h;t=Kf[c[(c[o>>2]|0)+12>>2]&15](o,j,h,s,m,k,q,l)|0;if(k>>>0<(c[l>>2]|0)>>>0){r=k;do{jn(n,a[r>>0]|0);r=r+1|0}while(r>>>0<(c[l>>2]|0)>>>0)}h=c[m>>2]|0}while((t|0)!=2&h>>>0<s>>>0)}s=Ae(((e|0)==-1?-1:e<<1)|0,f|0,g|0,((a[n>>0]&1)==0?n+1|0:c[n+8>>2]|0)|0)|0;c[b>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;c[p+4>>2]=0;c[p>>2]=18800;g=Xw(s|0)|0;f=s+g|0;e=f;h=k+128|0;if((g|0)>0){g=s;do{c[m>>2]=g;s=Kf[c[(c[p>>2]|0)+16>>2]&15](p,j,g,(e-g|0)>32?g+32|0:f,m,k,h,l)|0;if(k>>>0<(c[l>>2]|0)>>>0){q=k;do{fn(b,c[q>>2]|0);q=q+4|0}while(q>>>0<(c[l>>2]|0)>>>0)}g=c[m>>2]|0}while((s|0)!=2&g>>>0<f>>>0)}Au(n);i=d;return}function Lk(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;d=c[b+24>>2]|0;e=c[b+28>>2]|0;f=c[b>>2]|0;g=c[b+20>>2]|0;h=c[b+36>>2]|0;i=c[b+48>>2]|0;j=d-((d+7|0)/8|0)+(c[b+16>>2]|0)|0;b=(e|0)==0;if(!i){if(!((d|0)>0&(b^1)))return;k=d+h|0;l=e;m=g;n=f;while(1){l=l+-1|0;o=0;p=0;q=m;r=n;while(1){if(!(p&7)){s=a[r>>0]|0;t=r+1|0}else{s=o;t=r}a[q>>0]=(s&255)>>>7;p=p+1|0;if((p|0)==(d|0)){u=t;break}else{o=(s&255)<<1&255;q=q+1|0;r=t}}if(!l)break;else{m=m+k|0;n=u+j|0}}return}if(b)return;b=(d|0)>0;u=e;e=g;g=f;while(1){u=u+-1|0;if(b){f=0;n=0;k=e;m=g;while(1){if(!(n&7)){v=a[m>>0]|0;w=m+1|0}else{v=f;w=m}a[k>>0]=a[i+((v&255)>>>7&255)>>0]|0;n=n+1|0;if((n|0)==(d|0)){x=w;break}else{f=(v&255)<<1&255;k=k+1|0;m=w}}y=e+d|0;z=x}else{y=e;z=g}if(!u)break;else{e=y+h|0;g=z+j|0}}return}function _i(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0.0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;b=i;i=i+32|0;a=b+28|0;e=b+24|0;f=b+12|0;g=b;wp(f,22380,8);c[e>>2]=0;Zm(e,f);Au(f);f=c[e>>2]|0;if(!f)_a(22389,22399,70,22424);h=f+8|0;j=c[h>>2]|0;k=f+12|0;l=+((c[k>>2]|0)>>>0);ql(Nl(ql(Nl(ql(15668,22433,1)|0,+(j>>>0))|0,22435,2)|0,l)|0,22438,1)|0;c[a>>2]=Hs(15668+(c[(c[3917]|0)+-12>>2]|0)|0)|0;j=Ds(a,18276)|0;m=Nf[c[(c[j>>2]|0)+28>>2]&31](j,10)|0;Ww(a);Lm(15668,m)|0;Wn(15668)|0;m=f+16|0;j=f+4|0;n=f+20|0;o=0;a:while(1){p=50;do{if((c[h>>2]|0)>>>0<=o>>>0){q=7;break a}if((c[k>>2]|0)>>>0<=p>>>0){q=7;break a}r=ca(c[m>>2]|0,p)|0;s=(ca(d[(c[j>>2]|0)+9>>0]|0,o)|0)+r|0;c[(c[n>>2]|0)+s>>2]=0;p=p+1|0}while(p>>>0<100);o=o+1|0;if(o>>>0>=100){q=10;break}}if((q|0)==7)_a(22440,22399,220,22472);else if((q|0)==10){wp(g,22481,12);Jm(e,g)|0;Au(g);g=ql(15668,22494,29)|0;c[a>>2]=Hs(g+(c[(c[g>>2]|0)+-12>>2]|0)|0)|0;e=Ds(a,18276)|0;q=Nf[c[(c[e>>2]|0)+28>>2]&31](e,10)|0;Ww(a);Lm(g,q)|0;Wn(g)|0;ge()|0;rm(f);i=b;return 0}return 0}function Ik(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;b=a+28|0;d=c[b>>2]|0;e=(c[a+8>>2]<<16|0)/(d|0)|0;f=a+24|0;g=c[f>>2]|0;h=(c[a+4>>2]<<16|0)/(g|0)|0;i=d+-1|0;c[b>>2]=i;if(!d)return;d=a+20|0;j=a+32|0;k=a+12|0;l=c[d>>2]|0;m=g;g=l;n=i;i=l;l=0;o=0;while(1){if((l|0)>65535){p=l+-65536|0;q=p>>>16;r=p-(q<<16)|0;s=o+1+q|0}else{r=l;s=o}if(!m)t=n;else{q=m;p=i;u=65536;v=0;w=-1;while(1){q=q+-1|0;if((u|0)>65535){x=u+-65536|0;y=x>>>16;z=w+1+y|0;A=x-(y<<16)|0;B=(c[a>>2]|0)+((ca(c[k>>2]|0,s)|0)+(z<<2))|0;C=z}else{A=u;B=v;C=w}z=c[B>>2]|0;y=z>>>8;c[p>>2]=z>>>24<<16|z<<24|y&65280|y&255;if(!q)break;else{p=p+4|0;u=A+h|0;v=B;w=C}}t=c[b>>2]|0}w=g+(c[j>>2]|0)|0;v=t+-1|0;c[b>>2]=v;if(!t){D=w;break}m=c[f>>2]|0;g=w;n=v;i=w;l=r+e|0;o=s}c[d>>2]=D;return}function Kk(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;b=a+28|0;d=c[b>>2]|0;e=(c[a+8>>2]<<16|0)/(d|0)|0;f=a+24|0;g=c[f>>2]|0;h=(c[a+4>>2]<<16|0)/(g|0)|0;i=d+-1|0;c[b>>2]=i;if(!d)return;d=a+20|0;j=a+32|0;k=a+12|0;l=c[d>>2]|0;m=g;g=l;n=i;i=l;l=0;o=0;while(1){if((l|0)>65535){p=l+-65536|0;q=p>>>16;r=p-(q<<16)|0;s=o+1+q|0}else{r=l;s=o}if(!m)t=n;else{q=m;p=i;u=65536;v=0;w=-1;while(1){q=q+-1|0;if((u|0)>65535){x=u+-65536|0;y=x>>>16;z=w+1+y|0;A=x-(y<<16)|0;B=(c[a>>2]|0)+((ca(c[k>>2]|0,s)|0)+(z<<2))|0;C=z}else{A=u;B=v;C=w}z=c[B>>2]|0;y=z>>>8;c[p>>2]=z>>>24<<16|y&65280|y&255;if(!q)break;else{p=p+4|0;u=A+h|0;v=B;w=C}}t=c[b>>2]|0}w=g+(c[j>>2]|0)|0;v=t+-1|0;c[b>>2]=v;if(!t){D=w;break}m=c[f>>2]|0;g=w;n=v;i=w;l=r+e|0;o=s}c[d>>2]=D;return}function Jk(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;b=a+28|0;d=c[b>>2]|0;e=(c[a+8>>2]<<16|0)/(d|0)|0;f=a+24|0;g=c[f>>2]|0;h=(c[a+4>>2]<<16|0)/(g|0)|0;i=d+-1|0;c[b>>2]=i;if(!d)return;d=a+20|0;j=a+32|0;k=a+12|0;l=c[d>>2]|0;m=g;g=l;n=i;i=l;l=0;o=0;while(1){if((l|0)>65535){p=l+-65536|0;q=p>>>16;r=p-(q<<16)|0;s=o+1+q|0}else{r=l;s=o}if(!m)t=n;else{q=m;p=i;u=65536;v=0;w=-1;while(1){q=q+-1|0;if((u|0)>65535){x=u+-65536|0;y=x>>>16;z=w+1+y|0;A=x-(y<<16)|0;B=(c[a>>2]|0)+((ca(c[k>>2]|0,s)|0)+(z<<2))|0;C=z}else{A=u;B=v;C=w}z=c[B>>2]|0;y=z>>>8;c[p>>2]=z>>>24<<16|y&65280|y&255;if(!q)break;else{p=p+4|0;u=A+h|0;v=B;w=C}}t=c[b>>2]|0}w=g+(c[j>>2]|0)|0;v=t+-1|0;c[b>>2]=v;if(!t){D=w;break}m=c[f>>2]|0;g=w;n=v;i=w;l=r+e|0;o=s}c[d>>2]=D;return}function Mk(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;b=a+28|0;d=c[b>>2]|0;e=(c[a+8>>2]<<16|0)/(d|0)|0;f=a+24|0;g=c[f>>2]|0;h=(c[a+4>>2]<<16|0)/(g|0)|0;i=d+-1|0;c[b>>2]=i;if(!d)return;d=a+20|0;j=a+32|0;k=a+12|0;l=c[d>>2]|0;m=g;g=l;n=i;i=l;l=0;o=0;while(1){if((l|0)>65535){p=l+-65536|0;q=p>>>16;r=p-(q<<16)|0;s=o+1+q|0}else{r=l;s=o}if(!m)t=n;else{q=m;p=i;u=65536;v=0;w=-1;while(1){q=q+-1|0;if((u|0)>65535){x=u+-65536|0;y=x>>>16;z=w+1+y|0;A=x-(y<<16)|0;B=(c[a>>2]|0)+((ca(c[k>>2]|0,s)|0)+(z<<2))|0;C=z}else{A=u;B=v;C=w}z=c[B>>2]|0;c[p>>2]=z&-16711936|z<<16&16711680|z>>>16&255;if(!q)break;else{p=p+4|0;u=A+h|0;v=B;w=C}}t=c[b>>2]|0}w=g+(c[j>>2]|0)|0;v=t+-1|0;c[b>>2]=v;if(!t){D=w;break}m=c[f>>2]|0;g=w;n=v;i=w;l=r+e|0;o=s}c[d>>2]=D;return}function Pk(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;b=a+28|0;d=c[b>>2]|0;e=(c[a+8>>2]<<16|0)/(d|0)|0;f=a+24|0;g=c[f>>2]|0;h=(c[a+4>>2]<<16|0)/(g|0)|0;i=d+-1|0;c[b>>2]=i;if(!d)return;d=a+20|0;j=a+32|0;k=a+12|0;l=c[d>>2]|0;m=g;g=l;n=i;i=l;l=0;o=0;while(1){if((l|0)>65535){p=l+-65536|0;q=p>>>16;r=p-(q<<16)|0;s=o+1+q|0}else{r=l;s=o}if(!m)t=n;else{q=m;p=i;u=65536;v=0;w=-1;while(1){q=q+-1|0;if((u|0)>65535){x=u+-65536|0;y=x>>>16;z=w+1+y|0;A=x-(y<<16)|0;B=(c[a>>2]|0)+((ca(c[k>>2]|0,s)|0)+(z<<2))|0;C=z}else{A=u;B=v;C=w}z=c[B>>2]|0;c[p>>2]=z&65280|z<<16|z>>>16&255|-16777216;if(!q)break;else{p=p+4|0;u=A+h|0;v=B;w=C}}t=c[b>>2]|0}w=g+(c[j>>2]|0)|0;v=t+-1|0;c[b>>2]=v;if(!t){D=w;break}m=c[f>>2]|0;g=w;n=v;i=w;l=r+e|0;o=s}c[d>>2]=D;return}function Vk(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;b=a+28|0;d=c[b>>2]|0;e=(c[a+8>>2]<<16|0)/(d|0)|0;f=a+24|0;g=c[f>>2]|0;h=(c[a+4>>2]<<16|0)/(g|0)|0;i=d+-1|0;c[b>>2]=i;if(!d)return;d=a+20|0;j=a+32|0;k=a+12|0;l=c[d>>2]|0;m=g;g=l;n=i;i=l;l=0;o=0;while(1){if((l|0)>65535){p=l+-65536|0;q=p>>>16;r=p-(q<<16)|0;s=o+1+q|0}else{r=l;s=o}if(!m)t=n;else{q=m;p=i;u=65536;v=0;w=-1;while(1){q=q+-1|0;if((u|0)>65535){x=u+-65536|0;y=x>>>16;z=w+1+y|0;A=x-(y<<16)|0;B=(c[a>>2]|0)+((ca(c[k>>2]|0,s)|0)+(z<<2))|0;C=z}else{A=u;B=v;C=w}z=c[B>>2]|0;c[p>>2]=z<<16&16711680|z&65280|z>>>16&255;if(!q)break;else{p=p+4|0;u=A+h|0;v=B;w=C}}t=c[b>>2]|0}w=g+(c[j>>2]|0)|0;v=t+-1|0;c[b>>2]=v;if(!t){D=w;break}m=c[f>>2]|0;g=w;n=v;i=w;l=r+e|0;o=s}c[d>>2]=D;return}function Uk(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;b=a+28|0;d=c[b>>2]|0;e=(c[a+8>>2]<<16|0)/(d|0)|0;f=a+24|0;g=c[f>>2]|0;h=(c[a+4>>2]<<16|0)/(g|0)|0;i=d+-1|0;c[b>>2]=i;if(!d)return;d=a+20|0;j=a+32|0;k=a+12|0;l=c[d>>2]|0;m=g;g=l;n=i;i=l;l=0;o=0;while(1){if((l|0)>65535){p=l+-65536|0;q=p>>>16;r=p-(q<<16)|0;s=o+1+q|0}else{r=l;s=o}if(!m)t=n;else{q=m;p=i;u=65536;v=0;w=-1;while(1){q=q+-1|0;if((u|0)>65535){x=u+-65536|0;y=x>>>16;z=w+1+y|0;A=x-(y<<16)|0;B=(c[a>>2]|0)+((ca(c[k>>2]|0,s)|0)+(z<<2))|0;C=z}else{A=u;B=v;C=w}z=c[B>>2]|0;c[p>>2]=z<<16&16711680|z&65280|z>>>16&255;if(!q)break;else{p=p+4|0;u=A+h|0;v=B;w=C}}t=c[b>>2]|0}w=g+(c[j>>2]|0)|0;v=t+-1|0;c[b>>2]=v;if(!t){D=w;break}m=c[f>>2]|0;g=w;n=v;i=w;l=r+e|0;o=s}c[d>>2]=D;return}function Rk(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;b=a+28|0;d=c[b>>2]|0;e=(c[a+8>>2]<<16|0)/(d|0)|0;f=a+24|0;g=c[f>>2]|0;h=(c[a+4>>2]<<16|0)/(g|0)|0;i=d+-1|0;c[b>>2]=i;if(!d)return;d=a+20|0;j=a+32|0;k=a+12|0;l=c[d>>2]|0;m=g;g=l;n=i;i=l;l=0;o=0;while(1){if((l|0)>65535){p=l+-65536|0;q=p>>>16;r=p-(q<<16)|0;s=o+1+q|0}else{r=l;s=o}if(!m)t=n;else{q=m;p=i;u=65536;v=0;w=-1;while(1){q=q+-1|0;if((u|0)>65535){x=u+-65536|0;y=x>>>16;z=w+1+y|0;A=x-(y<<16)|0;B=(c[a>>2]|0)+((ca(c[k>>2]|0,s)|0)+(z<<2))|0;C=z}else{A=u;B=v;C=w}z=c[B>>2]|0;c[p>>2]=z<<16&16711680|z&65280|z>>>16&255;if(!q)break;else{p=p+4|0;u=A+h|0;v=B;w=C}}t=c[b>>2]|0}w=g+(c[j>>2]|0)|0;v=t+-1|0;c[b>>2]=v;if(!t){D=w;break}m=c[f>>2]|0;g=w;n=v;i=w;l=r+e|0;o=s}c[d>>2]=D;return}function Qk(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;b=a+28|0;d=c[b>>2]|0;e=(c[a+8>>2]<<16|0)/(d|0)|0;f=a+24|0;g=c[f>>2]|0;h=(c[a+4>>2]<<16|0)/(g|0)|0;i=d+-1|0;c[b>>2]=i;if(!d)return;d=a+20|0;j=a+32|0;k=a+12|0;l=c[d>>2]|0;m=g;g=l;n=i;i=l;l=0;o=0;while(1){if((l|0)>65535){p=l+-65536|0;q=p>>>16;r=p-(q<<16)|0;s=o+1+q|0}else{r=l;s=o}if(!m)t=n;else{q=m;p=i;u=65536;v=0;w=-1;while(1){q=q+-1|0;if((u|0)>65535){x=u+-65536|0;y=x>>>16;z=w+1+y|0;A=x-(y<<16)|0;B=(c[a>>2]|0)+((ca(c[k>>2]|0,s)|0)+(z<<2))|0;C=z}else{A=u;B=v;C=w}z=c[B>>2]|0;c[p>>2]=z<<16&16711680|z&65280|z>>>16&255;if(!q)break;else{p=p+4|0;u=A+h|0;v=B;w=C}}t=c[b>>2]|0}w=g+(c[j>>2]|0)|0;v=t+-1|0;c[b>>2]=v;if(!t){D=w;break}m=c[f>>2]|0;g=w;n=v;i=w;l=r+e|0;o=s}c[d>>2]=D;return}function Tk(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;b=a+28|0;d=c[b>>2]|0;e=(c[a+8>>2]<<16|0)/(d|0)|0;f=a+24|0;g=c[f>>2]|0;h=(c[a+4>>2]<<16|0)/(g|0)|0;i=d+-1|0;c[b>>2]=i;if(!d)return;d=a+20|0;j=a+32|0;k=a+12|0;l=c[d>>2]|0;m=g;g=l;n=i;i=l;l=0;o=0;while(1){if((l|0)>65535){p=l+-65536|0;q=p>>>16;r=p-(q<<16)|0;s=o+1+q|0}else{r=l;s=o}if(!m)t=n;else{q=m;p=i;u=65536;v=0;w=-1;while(1){q=q+-1|0;if((u|0)>65535){x=u+-65536|0;y=x>>>16;z=w+1+y|0;A=x-(y<<16)|0;B=(c[a>>2]|0)+((ca(c[k>>2]|0,s)|0)+(z<<2))|0;C=z}else{A=u;B=v;C=w}z=c[B>>2]|0;c[p>>2]=z>>>8&65280|z>>>24|z<<8&16711680;if(!q)break;else{p=p+4|0;u=A+h|0;v=B;w=C}}t=c[b>>2]|0}w=g+(c[j>>2]|0)|0;v=t+-1|0;c[b>>2]=v;if(!t){D=w;break}m=c[f>>2]|0;g=w;n=v;i=w;l=r+e|0;o=s}c[d>>2]=D;return}function Sk(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;b=a+28|0;d=c[b>>2]|0;e=(c[a+8>>2]<<16|0)/(d|0)|0;f=a+24|0;g=c[f>>2]|0;h=(c[a+4>>2]<<16|0)/(g|0)|0;i=d+-1|0;c[b>>2]=i;if(!d)return;d=a+20|0;j=a+32|0;k=a+12|0;l=c[d>>2]|0;m=g;g=l;n=i;i=l;l=0;o=0;while(1){if((l|0)>65535){p=l+-65536|0;q=p>>>16;r=p-(q<<16)|0;s=o+1+q|0}else{r=l;s=o}if(!m)t=n;else{q=m;p=i;u=65536;v=0;w=-1;while(1){q=q+-1|0;if((u|0)>65535){x=u+-65536|0;y=x>>>16;z=w+1+y|0;A=x-(y<<16)|0;B=(c[a>>2]|0)+((ca(c[k>>2]|0,s)|0)+(z<<2))|0;C=z}else{A=u;B=v;C=w}z=c[B>>2]|0;c[p>>2]=z>>>8&65280|z>>>24|z<<8&16711680;if(!q)break;else{p=p+4|0;u=A+h|0;v=B;w=C}}t=c[b>>2]|0}w=g+(c[j>>2]|0)|0;v=t+-1|0;c[b>>2]=v;if(!t){D=w;break}m=c[f>>2]|0;g=w;n=v;i=w;l=r+e|0;o=s}c[d>>2]=D;return}function Jj(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=+f;var g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;a=i;i=i+352|0;g=a+304|0;j=a+48|0;k=a+32|0;l=a+24|0;m=a+8|0;n=a;o=a+308|0;p=a+72|0;q=a+76|0;r=a+68|0;s=a+64|0;t=a+60|0;u=a+56|0;v=n;c[v>>2]=37;c[v+4>>2]=0;v=Ol(n+1|0,33706,c[d+4>>2]|0)|0;c[p>>2]=o;w=Ps()|0;if(v){c[m>>2]=c[d+8>>2];h[m+8>>3]=f;x=tq(o,30,w,n,m)|0}else{h[l>>3]=f;x=tq(o,30,w,n,l)|0}if((x|0)>29){l=Ps()|0;if(v){c[k>>2]=c[d+8>>2];h[k+8>>3]=f;y=Bq(p,l,n,k)|0}else{h[j>>3]=f;y=Bq(p,l,n,j)|0}j=c[p>>2]|0;if(!j)Iv();else{z=j;A=j;B=y}}else{z=c[p>>2]|0;A=0;B=x}x=z+B|0;p=yn(z,x,d)|0;if((z|0)!=(o|0)){y=_f(B<<3)|0;if(!y)Iv();else{C=z;D=y;E=y}}else{C=o;D=0;E=q}q=Hs(d)|0;c[t>>2]=q;ah(C,p,x,E,r,s,t);lr(q)|0;c[u>>2]=c[b>>2];q=c[r>>2]|0;r=c[s>>2]|0;c[g>>2]=c[u>>2];u=pl(g,E,q,r,d,e)|0;c[b>>2]=u;if(D)yg(D);yg(A);i=a;return u|0}function Nj(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=+f;var g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;a=i;i=i+176|0;g=a+76|0;j=a+48|0;k=a+32|0;l=a+24|0;m=a+8|0;n=a;o=a+80|0;p=a+72|0;q=a+110|0;r=a+68|0;s=a+64|0;t=a+60|0;u=a+56|0;v=n;c[v>>2]=37;c[v+4>>2]=0;v=Ol(n+1|0,33706,c[d+4>>2]|0)|0;c[p>>2]=o;w=Ps()|0;if(v){c[m>>2]=c[d+8>>2];h[m+8>>3]=f;x=tq(o,30,w,n,m)|0}else{h[l>>3]=f;x=tq(o,30,w,n,l)|0}if((x|0)>29){l=Ps()|0;if(v){c[k>>2]=c[d+8>>2];h[k+8>>3]=f;y=Bq(p,l,n,k)|0}else{h[j>>3]=f;y=Bq(p,l,n,j)|0}j=c[p>>2]|0;if(!j)Iv();else{z=j;A=j;B=y}}else{z=c[p>>2]|0;A=0;B=x}x=z+B|0;p=yn(z,x,d)|0;if((z|0)!=(o|0)){y=_f(B<<1)|0;if(!y)Iv();else{C=z;D=y;E=y}}else{C=o;D=0;E=q}q=Hs(d)|0;c[t>>2]=q;gh(C,p,x,E,r,s,t);lr(q)|0;c[u>>2]=c[b>>2];b=c[r>>2]|0;r=c[s>>2]|0;c[g>>2]=c[u>>2];u=Gl(g,E,b,r,d,e)|0;yg(D);yg(A);i=a;return u|0}function bl(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;b=a+28|0;d=c[b>>2]|0;e=(c[a+8>>2]<<16|0)/(d|0)|0;f=a+24|0;g=c[f>>2]|0;h=(c[a+4>>2]<<16|0)/(g|0)|0;i=d+-1|0;c[b>>2]=i;if(!d)return;d=a+20|0;j=a+32|0;k=a+12|0;l=c[d>>2]|0;m=g;g=l;n=i;i=l;l=0;o=0;while(1){if((l|0)>65535){p=l+-65536|0;q=p>>>16;r=p-(q<<16)|0;s=o+1+q|0}else{r=l;s=o}if(!m)t=n;else{q=m;p=i;u=65536;v=0;w=-1;while(1){q=q+-1|0;if((u|0)>65535){x=u+-65536|0;y=x>>>16;z=w+1+y|0;A=x-(y<<16)|0;B=(c[a>>2]|0)+((ca(c[k>>2]|0,s)|0)+(z<<2))|0;C=z}else{A=u;B=v;C=w}c[p>>2]=c[B>>2]|-16777216;if(!q)break;else{p=p+4|0;u=A+h|0;v=B;w=C}}t=c[b>>2]|0}w=g+(c[j>>2]|0)|0;v=t+-1|0;c[b>>2]=v;if(!t){D=w;break}m=c[f>>2]|0;g=w;n=v;i=w;l=r+e|0;o=s}c[d>>2]=D;return}function al(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;b=a+28|0;d=c[b>>2]|0;e=(c[a+8>>2]<<16|0)/(d|0)|0;f=a+24|0;g=c[f>>2]|0;h=(c[a+4>>2]<<16|0)/(g|0)|0;i=d+-1|0;c[b>>2]=i;if(!d)return;d=a+20|0;j=a+32|0;k=a+12|0;l=c[d>>2]|0;m=g;g=l;n=i;i=l;l=0;o=0;while(1){if((l|0)>65535){p=l+-65536|0;q=p>>>16;r=p-(q<<16)|0;s=o+1+q|0}else{r=l;s=o}if(!m)t=n;else{q=m;p=i;u=65536;v=0;w=-1;while(1){q=q+-1|0;if((u|0)>65535){x=u+-65536|0;y=x>>>16;z=w+1+y|0;A=x-(y<<16)|0;B=(c[a>>2]|0)+((ca(c[k>>2]|0,s)|0)+(z<<2))|0;C=z}else{A=u;B=v;C=w}c[p>>2]=Mw(c[B>>2]|0)|0;if(!q)break;else{p=p+4|0;u=A+h|0;v=B;w=C}}t=c[b>>2]|0}w=g+(c[j>>2]|0)|0;v=t+-1|0;c[b>>2]=v;if(!t){D=w;break}m=c[f>>2]|0;g=w;n=v;i=w;l=r+e|0;o=s}c[d>>2]=D;return}function dl(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;b=a+28|0;d=c[b>>2]|0;e=(c[a+8>>2]<<16|0)/(d|0)|0;f=a+24|0;g=c[f>>2]|0;h=(c[a+4>>2]<<16|0)/(g|0)|0;i=d+-1|0;c[b>>2]=i;if(!d)return;d=a+20|0;j=a+32|0;k=a+12|0;l=c[d>>2]|0;m=g;g=l;n=i;i=l;l=0;o=0;while(1){if((l|0)>65535){p=l+-65536|0;q=p>>>16;r=p-(q<<16)|0;s=o+1+q|0}else{r=l;s=o}if(!m)t=n;else{q=m;p=i;u=65536;v=0;w=-1;while(1){q=q+-1|0;if((u|0)>65535){x=u+-65536|0;y=x>>>16;z=w+1+y|0;A=x-(y<<16)|0;B=(c[a>>2]|0)+((ca(c[k>>2]|0,s)|0)+(z<<2))|0;C=z}else{A=u;B=v;C=w}c[p>>2]=c[B>>2]&16777215;if(!q)break;else{p=p+4|0;u=A+h|0;v=B;w=C}}t=c[b>>2]|0}w=g+(c[j>>2]|0)|0;v=t+-1|0;c[b>>2]=v;if(!t){D=w;break}m=c[f>>2]|0;g=w;n=v;i=w;l=r+e|0;o=s}c[d>>2]=D;return}function cl(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;b=a+28|0;d=c[b>>2]|0;e=(c[a+8>>2]<<16|0)/(d|0)|0;f=a+24|0;g=c[f>>2]|0;h=(c[a+4>>2]<<16|0)/(g|0)|0;i=d+-1|0;c[b>>2]=i;if(!d)return;d=a+20|0;j=a+32|0;k=a+12|0;l=c[d>>2]|0;m=g;g=l;n=i;i=l;l=0;o=0;while(1){if((l|0)>65535){p=l+-65536|0;q=p>>>16;r=p-(q<<16)|0;s=o+1+q|0}else{r=l;s=o}if(!m)t=n;else{q=m;p=i;u=65536;v=0;w=-1;while(1){q=q+-1|0;if((u|0)>65535){x=u+-65536|0;y=x>>>16;z=w+1+y|0;A=x-(y<<16)|0;B=(c[a>>2]|0)+((ca(c[k>>2]|0,s)|0)+(z<<2))|0;C=z}else{A=u;B=v;C=w}c[p>>2]=c[B>>2]&16777215;if(!q)break;else{p=p+4|0;u=A+h|0;v=B;w=C}}t=c[b>>2]|0}w=g+(c[j>>2]|0)|0;v=t+-1|0;c[b>>2]=v;if(!t){D=w;break}m=c[f>>2]|0;g=w;n=v;i=w;l=r+e|0;o=s}c[d>>2]=D;return}function gl(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;b=a+28|0;d=c[b>>2]|0;e=(c[a+8>>2]<<16|0)/(d|0)|0;f=a+24|0;g=c[f>>2]|0;h=(c[a+4>>2]<<16|0)/(g|0)|0;i=d+-1|0;c[b>>2]=i;if(!d)return;d=a+20|0;j=a+32|0;k=a+12|0;l=c[d>>2]|0;m=g;g=l;n=i;i=l;l=0;o=0;while(1){if((l|0)>65535){p=l+-65536|0;q=p>>>16;r=p-(q<<16)|0;s=o+1+q|0}else{r=l;s=o}if(!m)t=n;else{q=m;p=i;u=65536;v=0;w=-1;while(1){q=q+-1|0;if((u|0)>65535){x=u+-65536|0;y=x>>>16;z=w+1+y|0;A=x-(y<<16)|0;B=(c[a>>2]|0)+((ca(c[k>>2]|0,s)|0)+(z<<2))|0;C=z}else{A=u;B=v;C=w}c[p>>2]=c[B>>2];if(!q)break;else{p=p+4|0;u=A+h|0;v=B;w=C}}t=c[b>>2]|0}w=g+(c[j>>2]|0)|0;v=t+-1|0;c[b>>2]=v;if(!t){D=w;break}m=c[f>>2]|0;g=w;n=v;i=w;l=r+e|0;o=s}c[d>>2]=D;return}function fl(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;b=a+28|0;d=c[b>>2]|0;e=(c[a+8>>2]<<16|0)/(d|0)|0;f=a+24|0;g=c[f>>2]|0;h=(c[a+4>>2]<<16|0)/(g|0)|0;i=d+-1|0;c[b>>2]=i;if(!d)return;d=a+20|0;j=a+32|0;k=a+12|0;l=c[d>>2]|0;m=g;g=l;n=i;i=l;l=0;o=0;while(1){if((l|0)>65535){p=l+-65536|0;q=p>>>16;r=p-(q<<16)|0;s=o+1+q|0}else{r=l;s=o}if(!m)t=n;else{q=m;p=i;u=65536;v=0;w=-1;while(1){q=q+-1|0;if((u|0)>65535){x=u+-65536|0;y=x>>>16;z=w+1+y|0;A=x-(y<<16)|0;B=(c[a>>2]|0)+((ca(c[k>>2]|0,s)|0)+(z<<2))|0;C=z}else{A=u;B=v;C=w}c[p>>2]=c[B>>2];if(!q)break;else{p=p+4|0;u=A+h|0;v=B;w=C}}t=c[b>>2]|0}w=g+(c[j>>2]|0)|0;v=t+-1|0;c[b>>2]=v;if(!t){D=w;break}m=c[f>>2]|0;g=w;n=v;i=w;l=r+e|0;o=s}c[d>>2]=D;return}function el(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;b=a+28|0;d=c[b>>2]|0;e=(c[a+8>>2]<<16|0)/(d|0)|0;f=a+24|0;g=c[f>>2]|0;h=(c[a+4>>2]<<16|0)/(g|0)|0;i=d+-1|0;c[b>>2]=i;if(!d)return;d=a+20|0;j=a+32|0;k=a+12|0;l=c[d>>2]|0;m=g;g=l;n=i;i=l;l=0;o=0;while(1){if((l|0)>65535){p=l+-65536|0;q=p>>>16;r=p-(q<<16)|0;s=o+1+q|0}else{r=l;s=o}if(!m)t=n;else{q=m;p=i;u=65536;v=0;w=-1;while(1){q=q+-1|0;if((u|0)>65535){x=u+-65536|0;y=x>>>16;z=w+1+y|0;A=x-(y<<16)|0;B=(c[a>>2]|0)+((ca(c[k>>2]|0,s)|0)+(z<<2))|0;C=z}else{A=u;B=v;C=w}c[p>>2]=c[B>>2];if(!q)break;else{p=p+4|0;u=A+h|0;v=B;w=C}}t=c[b>>2]|0}w=g+(c[j>>2]|0)|0;v=t+-1|0;c[b>>2]=v;if(!t){D=w;break}m=c[f>>2]|0;g=w;n=v;i=w;l=r+e|0;o=s}c[d>>2]=D;return}function il(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=d[a+63>>0]|0;i=a+28|0;j=c[i>>2]|0;k=j+-1|0;c[i>>2]=k;if(!j)return;j=a+20|0;l=a+24|0;m=a+12|0;n=a+32|0;o=(b&1|0)==0;p=(b&2|0)==0;b=k;do{k=c[l>>2]|0;if(!k){q=c[a>>2]|0;r=c[j>>2]|0;s=b}else{t=c[j>>2]|0;u=c[a>>2]|0;v=k;k=t;w=u;while(1){v=v+-1|0;x=c[w>>2]|0;y=x>>>16&255;z=x>>>8&255;A=x&255;B=x>>>24;if(o){C=y;D=z;E=A}else{C=((ca(y,g)|0)>>>0)/255|0;D=((ca(z,f)|0)>>>0)/255|0;E=((ca(A,e)|0)>>>0)/255|0}A=((ca(B,h)|0)>>>0)/255|0;c[k>>2]=D<<8|E<<16|C|(p?B:A)<<24;if(!v)break;else{k=k+4|0;w=w+4|0}}q=u;r=t;s=c[i>>2]|0}c[a>>2]=q+(c[m>>2]|0);c[j>>2]=r+(c[n>>2]|0);b=s+-1|0;c[i>>2]=b}while((s|0)!=0);return}function hl(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=d[a+63>>0]|0;i=a+28|0;j=c[i>>2]|0;k=j+-1|0;c[i>>2]=k;if(!j)return;j=a+20|0;l=a+24|0;m=a+12|0;n=a+32|0;o=(b&1|0)==0;p=(b&2|0)==0;b=k;do{k=c[l>>2]|0;if(!k){q=c[a>>2]|0;r=c[j>>2]|0;s=b}else{t=c[j>>2]|0;u=c[a>>2]|0;v=k;k=t;w=u;while(1){v=v+-1|0;x=c[w>>2]|0;y=x>>>16&255;z=x>>>8&255;A=x&255;B=x>>>24;if(o){C=A;D=z;E=y}else{C=((ca(A,g)|0)>>>0)/255|0;D=((ca(z,f)|0)>>>0)/255|0;E=((ca(y,e)|0)>>>0)/255|0}y=((ca(B,h)|0)>>>0)/255|0;c[k>>2]=D<<8|E<<16|C|(p?B:y)<<24;if(!v)break;else{k=k+4|0;w=w+4|0}}q=u;r=t;s=c[i>>2]|0}c[a>>2]=q+(c[m>>2]|0);c[j>>2]=r+(c[n>>2]|0);b=s+-1|0;c[i>>2]=b}while((s|0)!=0);return}function jl(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=a+28|0;i=c[h>>2]|0;j=i+-1|0;c[h>>2]=j;if(!i)return;i=a+20|0;k=a+24|0;l=a+12|0;m=a+32|0;n=(b&1|0)==0;b=c[a>>2]|0;o=c[i>>2]|0;p=b;q=o;r=j;j=o;o=b;while(1){b=c[k>>2]|0;s=b+-1|0;if(!b)t=r;else{if(n){b=s;u=j;v=o;while(1){c[u>>2]=c[v>>2]&16777215;if(!b)break;else{b=b+-1|0;u=u+4|0;v=v+4|0}}}else{v=s;u=j;b=o;while(1){w=c[b>>2]|0;c[u>>2]=(((ca(w>>>8&255,f)|0)>>>0)/255|0)<<8|(((ca(w>>>16&255,e)|0)>>>0)/255|0)<<16|(((ca(w&255,g)|0)>>>0)/255|0);if(!v)break;else{v=v+-1|0;u=u+4|0;b=b+4|0}}}t=c[h>>2]|0}o=p+(c[l>>2]|0)|0;j=q+(c[m>>2]|0)|0;r=t+-1|0;c[h>>2]=r;if(!t){x=o;y=j;break}else{p=o;q=j}}c[a>>2]=x;c[i>>2]=y;return}function Nk(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;g=a[b>>0]|0;h=b+4|0;i=c[h>>2]|0;a:do if(((g&1)==0?(g&255)>>>1:i)|0){if((d|0)==(e|0)){j=g;k=i}else{l=e+-4|0;if(l>>>0>d>>>0){m=d;n=l;do{l=c[m>>2]|0;c[m>>2]=c[n>>2];c[n>>2]=l;m=m+4|0;n=n+-4|0}while(m>>>0<n>>>0)}j=a[b>>0]|0;k=c[h>>2]|0}n=(j&1)==0;m=n?b+1|0:c[b+8>>2]|0;l=e+-4|0;o=m+(n?(j&255)>>>1:k)|0;n=a[m>>0]|0;p=n<<24>>24<1|n<<24>>24==127;b:do if(l>>>0>d>>>0){q=n;r=m;s=d;t=p;while(1){if(!t?(q<<24>>24|0)!=(c[s>>2]|0):0)break;r=(o-r|0)>1?r+1|0:r;s=s+4|0;u=a[r>>0]|0;v=u<<24>>24<1|u<<24>>24==127;if(s>>>0>=l>>>0){w=u;x=v;break b}else{q=u;t=v}}c[f>>2]=4;break a}else{w=n;x=p}while(0);if(!x?((c[l>>2]|0)+-1|0)>>>0>=w<<24>>24>>>0:0)c[f>>2]=4}while(0);return}function ll(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=d[a+63>>0]|0;i=a+28|0;j=c[i>>2]|0;k=j+-1|0;c[i>>2]=k;if(!j)return;j=a+20|0;l=a+24|0;m=a+12|0;n=a+32|0;o=(b&1|0)==0;p=(b&2|0)==0;b=k;do{k=c[l>>2]|0;if(!k){q=c[a>>2]|0;r=c[j>>2]|0;s=b}else{t=c[j>>2]|0;u=c[a>>2]|0;v=k;k=t;w=u;while(1){v=v+-1|0;x=c[w>>2]|0;y=x>>>24;z=x>>>16&255;A=x>>>8&255;if(o){B=y;C=z;D=A}else{B=((ca(y,g)|0)>>>0)/255|0;C=((ca(z,f)|0)>>>0)/255|0;D=((ca(A,e)|0)>>>0)/255|0}A=((ca(x&255,h)|0)>>>0)/255|0;c[k>>2]=C<<8|D<<16|B|(p?x:A)<<24;if(!v)break;else{k=k+4|0;w=w+4|0}}q=u;r=t;s=c[i>>2]|0}c[a>>2]=q+(c[m>>2]|0);c[j>>2]=r+(c[n>>2]|0);b=s+-1|0;c[i>>2]=b}while((s|0)!=0);return}function kl(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=d[a+63>>0]|0;i=a+28|0;j=c[i>>2]|0;k=j+-1|0;c[i>>2]=k;if(!j)return;j=a+20|0;l=a+24|0;m=a+12|0;n=a+32|0;o=(b&1|0)==0;p=(b&2|0)==0;b=k;do{k=c[l>>2]|0;if(!k){q=c[a>>2]|0;r=c[j>>2]|0;s=b}else{t=c[j>>2]|0;u=c[a>>2]|0;v=k;k=t;w=u;while(1){v=v+-1|0;x=c[w>>2]|0;y=x>>>24;z=x>>>16&255;A=x>>>8&255;if(o){B=A;C=z;D=y}else{B=((ca(A,g)|0)>>>0)/255|0;C=((ca(z,f)|0)>>>0)/255|0;D=((ca(y,e)|0)>>>0)/255|0}y=((ca(x&255,h)|0)>>>0)/255|0;c[k>>2]=C<<8|D<<16|B|(p?x:y)<<24;if(!v)break;else{k=k+4|0;w=w+4|0}}q=u;r=t;s=c[i>>2]|0}c[a>>2]=q+(c[m>>2]|0);c[j>>2]=r+(c[n>>2]|0);b=s+-1|0;c[i>>2]=b}while((s|0)!=0);return}function dk(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=+f;var g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;a=i;i=i+336|0;g=a+296|0;j=a+32|0;k=a+24|0;l=a+8|0;m=a;n=a+300|0;o=a+64|0;p=a+68|0;q=a+60|0;r=a+56|0;s=a+52|0;t=a+48|0;u=m;c[u>>2]=37;c[u+4>>2]=0;u=Ol(m+1|0,33705,c[d+4>>2]|0)|0;c[o>>2]=n;v=Ps()|0;if(u){c[l>>2]=c[d+8>>2];h[l+8>>3]=f;w=tq(n,30,v,m,l)|0}else{h[k>>3]=f;w=tq(n,30,v,m,k)|0}if((w|0)>29){k=Ps()|0;c[j>>2]=c[d+8>>2];h[j+8>>3]=f;v=Bq(o,k,m,j)|0;j=c[o>>2]|0;if(!j)Iv();else{x=j;y=j;z=v}}else{x=c[o>>2]|0;y=0;z=w}w=x+z|0;o=yn(x,w,d)|0;if((x|0)!=(n|0)){v=_f(z<<3)|0;if(!v)Iv();else{A=x;B=v;C=v}}else{A=n;B=0;C=p}p=Hs(d)|0;c[s>>2]=p;ah(A,o,w,C,q,r,s);lr(p)|0;c[t>>2]=c[b>>2];p=c[q>>2]|0;q=c[r>>2]|0;c[g>>2]=c[t>>2];t=pl(g,C,p,q,d,e)|0;c[b>>2]=t;if(B)yg(B);yg(y);i=a;return t|0}function Ok(a,b,e,f){a=a|0;b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;if(!(c[e>>2]&2)){g=0;h=1}else{i=(Fq(e)|0)>>>31^1;g=i;h=i}if(c[a>>2]&2){i=Fq(a)|0;j=i>>>31^1;if((i|0)<0){k=-1;l=j}else{m=j;n=5}}else{m=0;n=5}if((n|0)==5)if(h)if(((b|0)!=0?(h=c[b+8>>2]|0,(h|0)>=1):0)?(n=c[b+12>>2]|0,(n|0)>=1):0){j=c[a+52>>2]|0;i=j+16|0;o=c[a+16>>2]|0;p=ca(c[b+4>>2]&65535,o)|0;q=d[(c[j+56>>2]|0)+9>>0]|0;c[i>>2]=(c[a+20>>2]|0)+((ca(q,c[b>>2]&65535)|0)+p);c[j+20>>2]=h;c[j+24>>2]=n;c[j+28>>2]=o;c[j+32>>2]=o-(ca(q,h)|0);h=c[e+16>>2]|0;q=ca(c[f+4>>2]&65535,h)|0;o=d[(c[j+60>>2]|0)+9>>0]|0;c[j+36>>2]=(c[e+20>>2]|0)+((ca(o,c[f>>2]&65535)|0)+q);q=c[f+8>>2]|0;c[j+40>>2]=q;c[j+44>>2]=c[f+12>>2];c[j+48>>2]=h;c[j+52>>2]=h-(ca(o,q)|0);xf[c[j+12>>2]&511](i);k=0;l=m}else{k=0;l=m}else{k=-1;l=m}if(g)$q(e);if(!l)return k|0;$q(a);return k|0}function Ek(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0;h=i;i=i+32|0;j=h+20|0;k=h+16|0;l=h+12|0;m=h;if(!(c[e+4>>2]&1)){n=c[(c[b>>2]|0)+24>>2]|0;c[k>>2]=c[d>>2];c[j>>2]=c[k>>2];o=Cf[n&31](b,j,e,f,g&1)|0}else{f=Hs(e)|0;c[l>>2]=f;e=Ds(l,18416)|0;lr(f)|0;f=c[e>>2]|0;if(g)yf[c[f+24>>2]&127](m,e);else yf[c[f+28>>2]&127](m,e);e=a[m>>0]|0;f=(e&1)==0;g=m+1|0;l=m+8|0;j=f?g:m+1|0;b=f?g:c[m+8>>2]|0;g=m+4|0;f=(e&1)==0;if((b|0)!=((f?j:c[l>>2]|0)+(f?(e&255)>>>1:c[g>>2]|0)|0)){e=b;do{b=a[e>>0]|0;f=c[d>>2]|0;do if(f){n=f+24|0;k=c[n>>2]|0;if((k|0)!=(c[f+28>>2]|0)){c[n>>2]=k+1;a[k>>0]=b;break}if((Nf[c[(c[f>>2]|0)+52>>2]&31](f,b&255)|0)==-1)c[d>>2]=0}while(0);e=e+1|0;b=a[m>>0]|0;f=(b&1)==0}while((e|0)!=((f?j:c[l>>2]|0)+(f?(b&255)>>>1:c[g>>2]|0)|0))}g=c[d>>2]|0;Au(m);o=g}i=h;return o|0}function Dk(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;h=i;i=i+32|0;j=h+20|0;k=h+16|0;l=h+12|0;m=h;if(!(c[e+4>>2]&1)){n=c[(c[b>>2]|0)+24>>2]|0;c[k>>2]=c[d>>2];c[j>>2]=c[k>>2];o=Cf[n&31](b,j,e,f,g&1)|0}else{f=Hs(e)|0;c[l>>2]=f;e=Ds(l,18424)|0;lr(f)|0;f=c[e>>2]|0;if(g)yf[c[f+24>>2]&127](m,e);else yf[c[f+28>>2]&127](m,e);e=a[m>>0]|0;f=(e&1)==0;g=m+4|0;l=m+8|0;j=f?g:m+4|0;b=f?g:c[m+8>>2]|0;g=(e&1)==0;if((b|0)!=((g?j:c[l>>2]|0)+((g?(e&255)>>>1:c[j>>2]|0)<<2)|0)){e=b;do{b=c[e>>2]|0;g=c[d>>2]|0;if(g){f=g+24|0;n=c[f>>2]|0;if((n|0)==(c[g+28>>2]|0))p=Nf[c[(c[g>>2]|0)+52>>2]&31](g,b)|0;else{c[f>>2]=n+4;c[n>>2]=b;p=b}if((p|0)==-1)c[d>>2]=0}e=e+4|0;b=a[m>>0]|0;n=(b&1)==0}while((e|0)!=((n?j:c[l>>2]|0)+((n?(b&255)>>>1:c[j>>2]|0)<<2)|0))}j=c[d>>2]|0;zu(m);o=j}i=h;return o|0}function ek(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=+f;var g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;a=i;i=i+160|0;g=a+68|0;j=a+32|0;k=a+24|0;l=a+8|0;m=a;n=a+72|0;o=a+64|0;p=a+102|0;q=a+60|0;r=a+56|0;s=a+52|0;t=a+48|0;u=m;c[u>>2]=37;c[u+4>>2]=0;u=Ol(m+1|0,33705,c[d+4>>2]|0)|0;c[o>>2]=n;v=Ps()|0;if(u){c[l>>2]=c[d+8>>2];h[l+8>>3]=f;w=tq(n,30,v,m,l)|0}else{h[k>>3]=f;w=tq(n,30,v,m,k)|0}if((w|0)>29){k=Ps()|0;c[j>>2]=c[d+8>>2];h[j+8>>3]=f;v=Bq(o,k,m,j)|0;j=c[o>>2]|0;if(!j)Iv();else{x=j;y=j;z=v}}else{x=c[o>>2]|0;y=0;z=w}w=x+z|0;o=yn(x,w,d)|0;if((x|0)!=(n|0)){v=_f(z<<1)|0;if(!v)Iv();else{A=x;B=v;C=v}}else{A=n;B=0;C=p}p=Hs(d)|0;c[s>>2]=p;gh(A,o,w,C,q,r,s);lr(p)|0;c[t>>2]=c[b>>2];b=c[q>>2]|0;q=c[r>>2]|0;c[g>>2]=c[t>>2];t=Gl(g,C,b,q,d,e)|0;yg(B);yg(y);i=a;return t|0}function ol(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;e=c[b+52>>2]|0;f=d[b+60>>0]|0;g=d[b+61>>0]|0;h=d[b+62>>0]|0;i=a[b+63>>0]|0;j=b+28|0;k=c[j>>2]|0;l=k+-1|0;c[j>>2]=l;if(!k)return;k=b+20|0;m=b+24|0;n=b+12|0;o=b+32|0;p=(e&1|0)==0;q=(e&2|0)==0?-16777216:(i&255)<<24;i=l;do{l=c[m>>2]|0;if(!l){r=c[b>>2]|0;s=c[k>>2]|0;t=i}else{e=c[k>>2]|0;u=c[b>>2]|0;v=l;l=e;w=u;while(1){v=v+-1|0;x=c[w>>2]|0;y=x>>>16&255;z=x>>>8&255;A=x&255;if(p){B=y;C=z;D=A}else{B=((ca(y,h)|0)>>>0)/255|0;C=((ca(z,g)|0)>>>0)/255|0;D=((ca(A,f)|0)>>>0)/255|0}c[l>>2]=D<<16|q|C<<8|B;if(!v)break;else{l=l+4|0;w=w+4|0}}r=u;s=e;t=c[j>>2]|0}c[b>>2]=r+(c[n>>2]|0);c[k>>2]=s+(c[o>>2]|0);i=t+-1|0;c[j>>2]=i}while((t|0)!=0);return}function nl(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;e=c[b+52>>2]|0;f=d[b+60>>0]|0;g=d[b+61>>0]|0;h=d[b+62>>0]|0;i=a[b+63>>0]|0;j=b+28|0;k=c[j>>2]|0;l=k+-1|0;c[j>>2]=l;if(!k)return;k=b+20|0;m=b+24|0;n=b+12|0;o=b+32|0;p=(e&1|0)==0;q=(e&2|0)==0?-16777216:(i&255)<<24;i=l;do{l=c[m>>2]|0;if(!l){r=c[b>>2]|0;s=c[k>>2]|0;t=i}else{e=c[k>>2]|0;u=c[b>>2]|0;v=l;l=e;w=u;while(1){v=v+-1|0;x=c[w>>2]|0;y=x>>>16&255;z=x>>>8&255;A=x&255;if(p){B=A;C=z;D=y}else{B=((ca(A,h)|0)>>>0)/255|0;C=((ca(z,g)|0)>>>0)/255|0;D=((ca(y,f)|0)>>>0)/255|0}c[l>>2]=D<<16|q|C<<8|B;if(!v)break;else{l=l+4|0;w=w+4|0}}r=u;s=e;t=c[j>>2]|0}c[b>>2]=r+(c[n>>2]|0);c[k>>2]=s+(c[o>>2]|0);i=t+-1|0;c[j>>2]=i}while((t|0)!=0);return}function uk(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;j=i;i=i+64|0;k=j+56|0;l=j+48|0;m=j+52|0;n=j+44|0;o=j+40|0;p=j+36|0;q=j+32|0;r=j+8|0;s=j;a:do if(!(c[f+4>>2]&1)){c[m>>2]=-1;t=c[(c[b>>2]|0)+16>>2]|0;c[n>>2]=c[d>>2];c[o>>2]=c[e>>2];c[l>>2]=c[n>>2];c[k>>2]=c[o>>2];u=zf[t&63](b,l,k,f,g,m)|0;c[d>>2]=u;switch(c[m>>2]|0){case 0:{a[h>>0]=0;v=u;break a;break}case 1:{a[h>>0]=1;v=u;break a;break}default:{a[h>>0]=1;c[g>>2]=4;v=u;break a}}}else{u=Hs(f)|0;c[p>>2]=u;t=Ds(p,18276)|0;lr(u)|0;u=Hs(f)|0;c[q>>2]=u;w=Ds(q,18416)|0;lr(u)|0;yf[c[(c[w>>2]|0)+24>>2]&127](r,w);yf[c[(c[w>>2]|0)+28>>2]&127](r+12|0,w);c[s>>2]=c[e>>2];c[k>>2]=c[s>>2];a[h>>0]=(Xg(d,k,r,r+24|0,t,g,1)|0)==(r|0)&1;t=c[d>>2]|0;Au(r+12|0);Au(r);v=t}while(0);i=j;return v|0}function tk(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;j=i;i=i+64|0;k=j+56|0;l=j+48|0;m=j+52|0;n=j+44|0;o=j+40|0;p=j+36|0;q=j+32|0;r=j+8|0;s=j;a:do if(!(c[f+4>>2]&1)){c[m>>2]=-1;t=c[(c[b>>2]|0)+16>>2]|0;c[n>>2]=c[d>>2];c[o>>2]=c[e>>2];c[l>>2]=c[n>>2];c[k>>2]=c[o>>2];u=zf[t&63](b,l,k,f,g,m)|0;c[d>>2]=u;switch(c[m>>2]|0){case 0:{a[h>>0]=0;v=u;break a;break}case 1:{a[h>>0]=1;v=u;break a;break}default:{a[h>>0]=1;c[g>>2]=4;v=u;break a}}}else{u=Hs(f)|0;c[p>>2]=u;t=Ds(p,18268)|0;lr(u)|0;u=Hs(f)|0;c[q>>2]=u;w=Ds(q,18424)|0;lr(u)|0;yf[c[(c[w>>2]|0)+24>>2]&127](r,w);yf[c[(c[w>>2]|0)+28>>2]&127](r+12|0,w);c[s>>2]=c[e>>2];c[k>>2]=c[s>>2];a[h>>0]=(Sg(d,k,r,r+24|0,t,g,1)|0)==(r|0)&1;t=c[d>>2]|0;zu(r+12|0);zu(r);v=t}while(0);i=j;return v|0}function El(a,b,e,f,g){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;h=c[a+4>>2]|0;if(!h){i=(e&255)>>>(d[a+29>>0]|0)<<(d[a+33>>0]|0)|(b&255)>>>(d[a+28>>0]|0)<<(d[a+32>>0]|0)|(f&255)>>>(d[a+30>>0]|0)<<(d[a+34>>0]|0)|(g&255)>>>(d[a+31>>0]|0)<<(d[a+35>>0]|0)&c[a+24>>2];return i|0}a=c[h>>2]|0;a:do if((a|0)>0){j=c[h+4>>2]|0;k=b&255;l=e&255;m=f&255;n=g&255;o=0;p=0;q=-1;while(1){r=(d[j+(o<<2)>>0]|0)-k|0;s=(d[j+(o<<2)+1>>0]|0)-l|0;t=(d[j+(o<<2)+2>>0]|0)-m|0;u=(d[j+(o<<2)+3>>0]|0)-n|0;v=(ca(s,s)|0)+(ca(r,r)|0)+(ca(t,t)|0)+(ca(u,u)|0)|0;if(v>>>0<q>>>0){u=o&255;if(!v){w=u;break a}else{x=u;y=v}}else{x=p;y=q}o=o+1|0;if((o|0)>=(a|0)){w=x;break}else{p=x;q=y}}}else w=0;while(0);i=w&255;return i|0}function ml(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0;a:do if((b|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)==(e|0)?(h=d+28|0,(c[h>>2]|0)!=1):0)c[h>>2]=f}else{if((b|0)!=(c[d>>2]|0)){h=c[b+8>>2]|0;wf[c[(c[h>>2]|0)+24>>2]&7](h,d,e,f,g);break}if((c[d+16>>2]|0)!=(e|0)?(h=d+20|0,(c[h>>2]|0)!=(e|0)):0){c[d+32>>2]=f;i=d+44|0;if((c[i>>2]|0)==4)break;j=d+52|0;a[j>>0]=0;k=d+53|0;a[k>>0]=0;l=c[b+8>>2]|0;Gf[c[(c[l>>2]|0)+20>>2]&15](l,d,e,e,1,g);if(a[k>>0]|0){if(!(a[j>>0]|0)){m=1;n=13}}else{m=0;n=13}do if((n|0)==13){c[h>>2]=e;j=d+40|0;c[j>>2]=(c[j>>2]|0)+1;if((c[d+36>>2]|0)==1?(c[d+24>>2]|0)==2:0){a[d+54>>0]=1;if(m)break}else n=16;if((n|0)==16?m:0)break;c[i>>2]=4;break a}while(0);c[i>>2]=3;break}if((f|0)==1)c[d+32>>2]=1}while(0);return}function ul(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=a+28|0;i=c[h>>2]|0;j=i+-1|0;c[h>>2]=j;if(!i)return;i=a+20|0;k=a+24|0;l=a+12|0;m=a+32|0;n=(b&1|0)==0;b=j;do{j=c[k>>2]|0;if(!j){o=c[a>>2]|0;p=c[i>>2]|0;q=b}else{r=c[i>>2]|0;s=c[a>>2]|0;t=j;j=r;u=s;while(1){t=t+-1|0;v=c[u>>2]|0;w=v>>>24;x=v>>>16&255;y=v>>>8&255;if(n){z=w;A=x;B=y}else{z=((ca(w,g)|0)>>>0)/255|0;A=((ca(x,f)|0)>>>0)/255|0;B=((ca(y,e)|0)>>>0)/255|0}c[j>>2]=A<<8|B|z<<16;if(!t)break;else{j=j+4|0;u=u+4|0}}o=s;p=r;q=c[h>>2]|0}c[a>>2]=o+(c[l>>2]|0);c[i>>2]=p+(c[m>>2]|0);b=q+-1|0;c[h>>2]=b}while((q|0)!=0);return}function tl(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=a+28|0;i=c[h>>2]|0;j=i+-1|0;c[h>>2]=j;if(!i)return;i=a+20|0;k=a+24|0;l=a+12|0;m=a+32|0;n=(b&1|0)==0;b=j;do{j=c[k>>2]|0;if(!j){o=c[a>>2]|0;p=c[i>>2]|0;q=b}else{r=c[i>>2]|0;s=c[a>>2]|0;t=j;j=r;u=s;while(1){t=t+-1|0;v=c[u>>2]|0;w=v>>>24;x=v>>>16&255;y=v>>>8&255;if(n){z=w;A=x;B=y}else{z=((ca(w,g)|0)>>>0)/255|0;A=((ca(x,f)|0)>>>0)/255|0;B=((ca(y,e)|0)>>>0)/255|0}c[j>>2]=A<<8|B<<16|z;if(!t)break;else{j=j+4|0;u=u+4|0}}o=s;p=r;q=c[h>>2]|0}c[a>>2]=o+(c[l>>2]|0);c[i>>2]=p+(c[m>>2]|0);b=q+-1|0;c[h>>2]=b}while((q|0)!=0);return}function sl(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=a+28|0;i=c[h>>2]|0;j=i+-1|0;c[h>>2]=j;if(!i)return;i=a+20|0;k=a+24|0;l=a+12|0;m=a+32|0;n=(b&1|0)==0;b=j;do{j=c[k>>2]|0;if(!j){o=c[a>>2]|0;p=c[i>>2]|0;q=b}else{r=c[i>>2]|0;s=c[a>>2]|0;t=j;j=r;u=s;while(1){t=t+-1|0;v=c[u>>2]|0;w=v>>>24;x=v>>>16&255;y=v>>>8&255;if(n){z=y;A=x;B=w}else{z=((ca(y,g)|0)>>>0)/255|0;A=((ca(x,f)|0)>>>0)/255|0;B=((ca(w,e)|0)>>>0)/255|0}c[j>>2]=A<<8|B|z<<16;if(!t)break;else{j=j+4|0;u=u+4|0}}o=s;p=r;q=c[h>>2]|0}c[a>>2]=o+(c[l>>2]|0);c[i>>2]=p+(c[m>>2]|0);b=q+-1|0;c[h>>2]=b}while((q|0)!=0);return}function rl(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=a+28|0;i=c[h>>2]|0;j=i+-1|0;c[h>>2]=j;if(!i)return;i=a+20|0;k=a+24|0;l=a+12|0;m=a+32|0;n=(b&1|0)==0;b=j;do{j=c[k>>2]|0;if(!j){o=c[a>>2]|0;p=c[i>>2]|0;q=b}else{r=c[i>>2]|0;s=c[a>>2]|0;t=j;j=r;u=s;while(1){t=t+-1|0;v=c[u>>2]|0;w=v>>>24;x=v>>>16&255;y=v>>>8&255;if(n){z=y;A=x;B=w}else{z=((ca(y,g)|0)>>>0)/255|0;A=((ca(x,f)|0)>>>0)/255|0;B=((ca(w,e)|0)>>>0)/255|0}c[j>>2]=A<<8|B<<16|z;if(!t)break;else{j=j+4|0;u=u+4|0}}o=s;p=r;q=c[h>>2]|0}c[a>>2]=o+(c[l>>2]|0);c[i>>2]=p+(c[m>>2]|0);b=q+-1|0;c[h>>2]=b}while((q|0)!=0);return}function zl(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=a+28|0;i=c[h>>2]|0;j=i+-1|0;c[h>>2]=j;if(!i)return;i=a+20|0;k=a+24|0;l=a+12|0;m=a+32|0;n=(b&1|0)==0;b=j;do{j=c[k>>2]|0;if(!j){o=c[a>>2]|0;p=c[i>>2]|0;q=b}else{r=c[i>>2]|0;s=c[a>>2]|0;t=j;j=r;u=s;while(1){t=t+-1|0;v=c[u>>2]|0;w=v>>>16&255;x=v>>>8&255;y=v&255;if(n){z=y;A=x;B=w}else{z=((ca(y,g)|0)>>>0)/255|0;A=((ca(x,f)|0)>>>0)/255|0;B=((ca(w,e)|0)>>>0)/255|0}c[j>>2]=A<<8|B|z<<16;if(!t)break;else{j=j+4|0;u=u+4|0}}o=s;p=r;q=c[h>>2]|0}c[a>>2]=o+(c[l>>2]|0);c[i>>2]=p+(c[m>>2]|0);b=q+-1|0;c[h>>2]=b}while((q|0)!=0);return}function yl(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=a+28|0;i=c[h>>2]|0;j=i+-1|0;c[h>>2]=j;if(!i)return;i=a+20|0;k=a+24|0;l=a+12|0;m=a+32|0;n=(b&1|0)==0;b=j;do{j=c[k>>2]|0;if(!j){o=c[a>>2]|0;p=c[i>>2]|0;q=b}else{r=c[i>>2]|0;s=c[a>>2]|0;t=j;j=r;u=s;while(1){t=t+-1|0;v=c[u>>2]|0;w=v>>>16&255;x=v>>>8&255;y=v&255;if(n){z=w;A=x;B=y}else{z=((ca(w,g)|0)>>>0)/255|0;A=((ca(x,f)|0)>>>0)/255|0;B=((ca(y,e)|0)>>>0)/255|0}c[j>>2]=A<<8|B|z<<16;if(!t)break;else{j=j+4|0;u=u+4|0}}o=s;p=r;q=c[h>>2]|0}c[a>>2]=o+(c[l>>2]|0);c[i>>2]=p+(c[m>>2]|0);b=q+-1|0;c[h>>2]=b}while((q|0)!=0);return}function xl(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=a+28|0;i=c[h>>2]|0;j=i+-1|0;c[h>>2]=j;if(!i)return;i=a+20|0;k=a+24|0;l=a+12|0;m=a+32|0;n=(b&1|0)==0;b=j;do{j=c[k>>2]|0;if(!j){o=c[a>>2]|0;p=c[i>>2]|0;q=b}else{r=c[i>>2]|0;s=c[a>>2]|0;t=j;j=r;u=s;while(1){t=t+-1|0;v=c[u>>2]|0;w=v>>>16&255;x=v>>>8&255;y=v&255;if(n){z=w;A=x;B=y}else{z=((ca(w,g)|0)>>>0)/255|0;A=((ca(x,f)|0)>>>0)/255|0;B=((ca(y,e)|0)>>>0)/255|0}c[j>>2]=A<<8|B<<16|z;if(!t)break;else{j=j+4|0;u=u+4|0}}o=s;p=r;q=c[h>>2]|0}c[a>>2]=o+(c[l>>2]|0);c[i>>2]=p+(c[m>>2]|0);b=q+-1|0;c[h>>2]=b}while((q|0)!=0);return}function wl(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=a+28|0;i=c[h>>2]|0;j=i+-1|0;c[h>>2]=j;if(!i)return;i=a+20|0;k=a+24|0;l=a+12|0;m=a+32|0;n=(b&1|0)==0;b=j;do{j=c[k>>2]|0;if(!j){o=c[a>>2]|0;p=c[i>>2]|0;q=b}else{r=c[i>>2]|0;s=c[a>>2]|0;t=j;j=r;u=s;while(1){t=t+-1|0;v=c[u>>2]|0;w=v>>>16&255;x=v>>>8&255;y=v&255;if(n){z=y;A=x;B=w}else{z=((ca(y,g)|0)>>>0)/255|0;A=((ca(x,f)|0)>>>0)/255|0;B=((ca(w,e)|0)>>>0)/255|0}c[j>>2]=A<<8|B|z<<16;if(!t)break;else{j=j+4|0;u=u+4|0}}o=s;p=r;q=c[h>>2]|0}c[a>>2]=o+(c[l>>2]|0);c[i>>2]=p+(c[m>>2]|0);b=q+-1|0;c[h>>2]=b}while((q|0)!=0);return}function vl(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=a+28|0;i=c[h>>2]|0;j=i+-1|0;c[h>>2]=j;if(!i)return;i=a+20|0;k=a+24|0;l=a+12|0;m=a+32|0;n=(b&1|0)==0;b=j;do{j=c[k>>2]|0;if(!j){o=c[a>>2]|0;p=c[i>>2]|0;q=b}else{r=c[i>>2]|0;s=c[a>>2]|0;t=j;j=r;u=s;while(1){t=t+-1|0;v=c[u>>2]|0;w=v>>>16&255;x=v>>>8&255;y=v&255;if(n){z=y;A=x;B=w}else{z=((ca(y,g)|0)>>>0)/255|0;A=((ca(x,f)|0)>>>0)/255|0;B=((ca(w,e)|0)>>>0)/255|0}c[j>>2]=A<<8|B<<16|z;if(!t)break;else{j=j+4|0;u=u+4|0}}o=s;p=r;q=c[h>>2]|0}c[a>>2]=o+(c[l>>2]|0);c[i>>2]=p+(c[m>>2]|0);b=q+-1|0;c[h>>2]=b}while((q|0)!=0);return}function Bl(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=a+28|0;i=c[h>>2]|0;j=i+-1|0;c[h>>2]=j;if(!i)return;i=a+20|0;k=a+24|0;l=a+12|0;m=a+32|0;n=(b&1|0)==0;b=j;do{j=c[k>>2]|0;if(!j){o=c[a>>2]|0;p=c[i>>2]|0;q=b}else{r=c[i>>2]|0;s=c[a>>2]|0;t=j;j=r;u=s;while(1){t=t+-1|0;v=c[u>>2]|0;w=v>>>16&255;x=v>>>8&255;y=v&255;if(n){z=w;A=x;B=y}else{z=((ca(w,g)|0)>>>0)/255|0;A=((ca(x,f)|0)>>>0)/255|0;B=((ca(y,e)|0)>>>0)/255|0}c[j>>2]=A<<8|B|z<<16;if(!t)break;else{j=j+4|0;u=u+4|0}}o=s;p=r;q=c[h>>2]|0}c[a>>2]=o+(c[l>>2]|0);c[i>>2]=p+(c[m>>2]|0);b=q+-1|0;c[h>>2]=b}while((q|0)!=0);return}function Al(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=a+28|0;i=c[h>>2]|0;j=i+-1|0;c[h>>2]=j;if(!i)return;i=a+20|0;k=a+24|0;l=a+12|0;m=a+32|0;n=(b&1|0)==0;b=j;do{j=c[k>>2]|0;if(!j){o=c[a>>2]|0;p=c[i>>2]|0;q=b}else{r=c[i>>2]|0;s=c[a>>2]|0;t=j;j=r;u=s;while(1){t=t+-1|0;v=c[u>>2]|0;w=v>>>16&255;x=v>>>8&255;y=v&255;if(n){z=w;A=x;B=y}else{z=((ca(w,g)|0)>>>0)/255|0;A=((ca(x,f)|0)>>>0)/255|0;B=((ca(y,e)|0)>>>0)/255|0}c[j>>2]=A<<8|B<<16|z;if(!t)break;else{j=j+4|0;u=u+4|0}}o=s;p=r;q=c[h>>2]|0}c[a>>2]=o+(c[l>>2]|0);c[i>>2]=p+(c[m>>2]|0);b=q+-1|0;c[h>>2]=b}while((q|0)!=0);return}function Dl(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;e=i;i=i+32|0;f=e+16|0;g=e+8|0;h=e+4|0;j=e;k=(d|0)==-1;a:do if(!k){a[g>>0]=d;if(a[b+44>>0]|0)if((Tc(g|0,1,1,c[b+32>>2]|0)|0)==1){l=11;break}else{m=-1;break}c[h>>2]=f;n=g+1|0;o=b+36|0;p=b+40|0;q=f+8|0;r=f;s=b+32|0;t=g;while(1){u=c[o>>2]|0;v=Kf[c[(c[u>>2]|0)+12>>2]&15](u,c[p>>2]|0,t,n,j,f,q,h)|0;if((c[j>>2]|0)==(t|0)){m=-1;break a}if((v|0)==3){w=t;break}u=(v|0)==1;if(v>>>0>=2){m=-1;break a}v=(c[h>>2]|0)-r|0;if((Tc(f|0,1,v|0,c[s>>2]|0)|0)!=(v|0)){m=-1;break a}if(u)t=u?c[j>>2]|0:t;else{l=11;break a}}if((Tc(w|0,1,1,c[s>>2]|0)|0)!=1)m=-1;else l=11}else l=11;while(0);if((l|0)==11)m=k?0:d;i=e;return m|0}function Cl(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;e=i;i=i+32|0;f=e+16|0;g=e+8|0;h=e+4|0;j=e;k=(d|0)==-1;a:do if(!k){c[g>>2]=d;if(a[b+44>>0]|0)if((Tc(g|0,4,1,c[b+32>>2]|0)|0)==1){l=11;break}else{m=-1;break}c[h>>2]=f;n=g+4|0;o=b+36|0;p=b+40|0;q=f+8|0;r=f;s=b+32|0;t=g;while(1){u=c[o>>2]|0;v=Kf[c[(c[u>>2]|0)+12>>2]&15](u,c[p>>2]|0,t,n,j,f,q,h)|0;if((c[j>>2]|0)==(t|0)){m=-1;break a}if((v|0)==3){w=t;break}u=(v|0)==1;if(v>>>0>=2){m=-1;break a}v=(c[h>>2]|0)-r|0;if((Tc(f|0,1,v|0,c[s>>2]|0)|0)!=(v|0)){m=-1;break a}if(u)t=u?c[j>>2]|0:t;else{l=11;break a}}if((Tc(w|0,1,1,c[s>>2]|0)|0)!=1)m=-1;else l=11}else l=11;while(0);if((l|0)==11)m=k?0:d;i=e;return m|0}function Hl(d,e,f,g){d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;h=i;i=i+64|0;j=h;k=c[d>>2]|0;l=d+(c[k+-8>>2]|0)|0;m=c[k+-4>>2]|0;c[j>>2]=f;c[j+4>>2]=d;c[j+8>>2]=e;c[j+12>>2]=g;g=j+16|0;e=j+20|0;d=j+24|0;k=j+28|0;n=j+32|0;o=j+40|0;p=(m|0)==(f|0);q=g;r=q+36|0;do{c[q>>2]=0;q=q+4|0}while((q|0)<(r|0));b[g+36>>1]=0;a[g+38>>0]=0;a:do if(p){c[j+48>>2]=1;Gf[c[(c[f>>2]|0)+20>>2]&15](f,j,l,l,1,0);s=(c[d>>2]|0)==1?l:0}else{wf[c[(c[m>>2]|0)+24>>2]&7](m,j,l,1,0);switch(c[j+36>>2]|0){case 0:{s=(c[o>>2]|0)==1&(c[k>>2]|0)==1&(c[n>>2]|0)==1?c[e>>2]|0:0;break a;break}case 1:break;default:{s=0;break a}}if((c[d>>2]|0)!=1?!((c[o>>2]|0)==0&(c[k>>2]|0)==1&(c[n>>2]|0)==1):0){s=0;break}s=c[g>>2]|0}while(0);i=h;return s|0}function Ml(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+16|0;h=g;c[h>>2]=b;if(!e){j=0;i=g;return j|0}do if(f){if(!b){c[h>>2]=h;k=h}else k=b;l=a[e>>0]|0;m=l&255;if(l<<24>>24>-1){c[k>>2]=m;j=l<<24>>24!=0&1;i=g;return j|0}l=m+-194|0;if(l>>>0<=50){m=e+1|0;n=c[14568+(l<<2)>>2]|0;if(f>>>0<4?(n&-2147483648>>>((f*6|0)+-6|0)|0)!=0:0)break;l=d[m>>0]|0;m=l>>>3;if((m+-16|m+(n>>26))>>>0<=7){m=l+-128|n<<6;if((m|0)>=0){c[k>>2]=m;j=2;i=g;return j|0}n=d[e+2>>0]|0;if((n&192|0)==128){l=n+-128|m<<6;if((l|0)>=0){c[k>>2]=l;j=3;i=g;return j|0}m=d[e+3>>0]|0;if((m&192|0)==128){c[k>>2]=m+-128|l<<6;j=4;i=g;return j|0}}}}}while(0);c[(pd()|0)>>2]=84;j=-1;i=g;return j|0}function Ol(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;if(!(d&2048))e=b;else{a[b>>0]=43;e=b+1|0}if(!(d&1024))f=e;else{a[e>>0]=35;f=e+1|0}e=d&260;b=d>>>14;d=(e|0)==260;if(d){g=f;h=0}else{a[f>>0]=46;a[f+1>>0]=42;g=f+2|0;h=1}f=a[c>>0]|0;if(!(f<<24>>24))i=g;else{j=c;c=g;g=f;while(1){j=j+1|0;f=c+1|0;a[c>>0]=g;g=a[j>>0]|0;if(!(g<<24>>24)){i=f;break}else c=f}}a:do switch(e|0){case 4:{if(!(b&1)){a[i>>0]=102;break a}else{a[i>>0]=70;break a}break}case 256:{if(!(b&1)){a[i>>0]=101;break a}else{a[i>>0]=69;break a}break}default:{c=(b&1|0)!=0;if(d)if(c){a[i>>0]=65;break a}else{a[i>>0]=97;break a}else if(c){a[i>>0]=71;break a}else{a[i>>0]=103;break a}}}while(0);return h|0}function $l(a,b,e,f,g){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;if((e|0)<=0){h=e<<2;return h|0}i=f+4|0;j=f+8|0;k=f+12|0;l=c[5452+((d[f+20>>0]|0)<<2)>>2]|0;m=c[5452+((d[f+21>>0]|0)<<2)>>2]|0;n=c[5452+((d[f+22>>0]|0)<<2)>>2]|0;o=d[f+24>>0]|0;p=d[f+25>>0]|0;q=d[f+26>>0]|0;f=d[g+28>>0]|0;r=d[g+32>>0]|0;s=d[g+29>>0]|0;t=d[g+33>>0]|0;u=d[g+30>>0]|0;v=d[g+34>>0]|0;w=d[g+31>>0]|0;x=d[g+35>>0]|0;g=a;a=0;y=b;while(1){b=c[y>>2]|0;z=b&-993|b>>>16;c[g>>2]=(d[m+((c[j>>2]&z)>>>p)>>0]|0)>>>s<<t|(d[l+((z&c[i>>2])>>>o)>>0]|0)>>>f<<r|(d[n+((c[k>>2]&z)>>>q)>>0]|0)>>>u<<v|(b>>>2&248)>>>w<<x;a=a+1|0;if((a|0)==(e|0))break;else{g=g+4|0;y=y+4|0}}h=e<<2;return h|0}function Rl(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;e=i;i=i+32|0;f=e+16|0;g=e+8|0;h=e;if(!a){c[h>>2]=24132;Cj(24164,h)|0;j=0;i=e;return j|0}if(!b){c[g>>2]=24134;Cj(24164,g)|0;j=0;i=e;return j|0}if(!d){c[f>>2]=24136;Cj(24164,f)|0;j=0;i=e;return j|0}f=c[a+8>>2]|0;if((((f|0)>=1?(g=c[a+12>>2]|0,(g|0)>=1):0)?(h=c[b+8>>2]|0,(h|0)>=1):0)?(k=c[b+12>>2]|0,(k|0)>=1):0){l=c[a>>2]|0;m=f+l|0;f=c[b>>2]|0;n=h+f|0;h=(f|0)>(l|0)?f:l;c[d>>2]=h;l=((n|0)<(m|0)?n:m)-h|0;c[d+8>>2]=l;h=c[a+4>>2]|0;a=g+h|0;g=c[b+4>>2]|0;b=k+g|0;k=(g|0)>(h|0)?g:h;c[d+4>>2]=k;h=((b|0)<(a|0)?b:a)-k|0;c[d+12>>2]=h;j=((h|0)<1|(l|0)<1)&1^1;i=e;return j|0}c[d+8>>2]=0;c[d+12>>2]=0;j=0;i=e;return j|0}function bm(a,b,f,g,h){a=a|0;b=b|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;if((f|0)<=0){i=f<<1;return i|0}j=g+4|0;k=g+8|0;l=g+12|0;m=c[5452+((d[g+20>>0]|0)<<2)>>2]|0;n=c[5452+((d[g+21>>0]|0)<<2)>>2]|0;o=c[5452+((d[g+22>>0]|0)<<2)>>2]|0;p=d[g+24>>0]|0;q=d[g+25>>0]|0;r=d[g+26>>0]|0;g=d[h+28>>0]|0;s=d[h+32>>0]|0;t=d[h+29>>0]|0;u=d[h+33>>0]|0;v=d[h+30>>0]|0;w=d[h+34>>0]|0;x=((c[h+24>>2]|0)!=0?255:0)>>>(d[h+31>>0]|0)<<(d[h+35>>0]|0);h=a;a=0;y=b;while(1){b=e[y>>1]|0;c[h>>2]=(d[n+((c[k>>2]&b)>>>q)>>0]|0)>>>t<<u|(d[m+((b&c[j>>2])>>>p)>>0]|0)>>>g<<s|(d[o+((c[l>>2]&b)>>>r)>>0]|0)>>>v<<w|x;a=a+1|0;if((a|0)==(f|0))break;else{h=h+4|0;y=y+2|0}}i=f<<1;return i|0}function cm(a,b,e,f,g){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;if((e|0)<=0){h=e<<2;return h|0}i=f+4|0;j=f+8|0;k=f+12|0;l=c[5452+((d[f+20>>0]|0)<<2)>>2]|0;m=c[5452+((d[f+21>>0]|0)<<2)>>2]|0;n=c[5452+((d[f+22>>0]|0)<<2)>>2]|0;o=d[f+24>>0]|0;p=d[f+25>>0]|0;q=d[f+26>>0]|0;f=d[g+28>>0]|0;r=d[g+32>>0]|0;s=d[g+29>>0]|0;t=d[g+33>>0]|0;u=d[g+30>>0]|0;v=d[g+34>>0]|0;w=d[g+31>>0]|0;x=d[g+35>>0]|0;g=a;a=0;y=b;while(1){b=c[y>>2]|0;c[g>>2]=(d[m+((c[j>>2]&b)>>>p)>>0]|0)>>>s<<t|(d[l+((c[i>>2]&b)>>>o)>>0]|0)>>>f<<r|(d[n+((c[k>>2]&b)>>>q)>>0]|0)>>>u<<v|b>>>24>>>w<<x;a=a+1|0;if((a|0)==(e|0))break;else{g=g+4|0;y=y+4|0}}h=e<<2;return h|0}function Vl(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;if(!(c[1376]|0)){i=g;return}if((d|0)<0|d>>>0>6){i=g;return}h=c[1372]|0;a:do if(!h)j=7;else{k=h;while(1){if((c[k>>2]|0)==(b|0)){l=k;break}k=c[k+8>>2]|0;if(!k){j=7;break a}}m=c[l+4>>2]|0}while(0);b:do if((j|0)==7)switch(b|0){case 8:{m=1;break b;break}case 0:{m=c[1375]|0;break b;break}case 2:{m=c[1374]|0;break b;break}default:{m=c[1373]|0;break b}}while(0);if(m>>>0>d>>>0){i=g;return}m=i;i=i+4096|0;lv(m,4096,e,f)|0;f=$A(m)|0;if((((f|0)!=0?(e=f+-1|0,j=m+e|0,(a[j>>0]|0)==10):0)?(a[j>>0]=0,(e|0)!=0):0)?(e=m+(f+-2)|0,(a[e>>0]|0)==13):0)a[e>>0]=0;Wf[c[5504>>2]&63](c[1377]|0,b,d,m);i=g;return}function fm(b,e,f,g,h,i){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0;j=e+4|0;k=c[j>>2]|0;if(!k){a[f>>0]=a[(c[5452+((d[e+28>>0]|0)<<2)>>2]|0)+((c[e+12>>2]&b)>>>(d[e+32>>0]|0))>>0]|0;a[g>>0]=a[(c[5452+((d[e+29>>0]|0)<<2)>>2]|0)+((c[e+16>>2]&b)>>>(d[e+33>>0]|0))>>0]|0;a[h>>0]=a[(c[5452+((d[e+30>>0]|0)<<2)>>2]|0)+((c[e+20>>2]&b)>>>(d[e+34>>0]|0))>>0]|0;a[i>>0]=a[(c[5452+((d[e+31>>0]|0)<<2)>>2]|0)+((c[e+24>>2]&b)>>>(d[e+35>>0]|0))>>0]|0;return}if((c[k>>2]|0)>>>0>b>>>0){a[f>>0]=a[(c[k+4>>2]|0)+(b<<2)>>0]|0;a[g>>0]=a[(c[(c[j>>2]|0)+4>>2]|0)+(b<<2)+1>>0]|0;a[h>>0]=a[(c[(c[j>>2]|0)+4>>2]|0)+(b<<2)+2>>0]|0;a[i>>0]=a[(c[(c[j>>2]|0)+4>>2]|0)+(b<<2)+3>>0]|0;return}else{a[i>>0]=0;a[h>>0]=0;a[g>>0]=0;a[f>>0]=0;return}}function im(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;d=c[b+24>>2]|0;e=c[b+28>>2]|0;f=c[b+36>>2]|0;g=c[b+48>>2]|0;h=(c[b+16>>2]|0)+d+((d+7|0)/-8|0)|0;if(!e)return;i=(d|0)>0;j=d*3|0;k=e;e=c[b+20>>2]|0;l=c[b>>2]|0;while(1){k=k+-1|0;if(i){b=0;m=0;n=e;o=l;while(1){if(!(m&7)){p=a[o>>0]|0;q=o+1|0}else{p=b;q=o}r=((p&255)>>>7&255)<<2;s=r|1;a[n>>0]=a[g+r>>0]|0;a[n+1>>0]=a[g+s>>0]|0;a[n+2>>0]=a[g+(s+1)>>0]|0;m=m+1|0;if((m|0)==(d|0)){t=q;break}else{b=(p&255)<<1&255;n=n+3|0;o=q}}u=e+j|0;v=t}else{u=e;v=l}if(!k)break;else{e=u+f|0;l=v+h|0}}return}function hm(a,e,f,g,h){a=a|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;if((f|0)<=0){i=f<<1;return i|0}j=c[g+12>>2]|0;k=c[5452+((d[g+28>>0]|0)<<2)>>2]|0;l=c[g+16>>2]|0;m=c[5452+((d[g+29>>0]|0)<<2)>>2]|0;n=c[g+20>>2]|0;o=c[5452+((d[g+30>>0]|0)<<2)>>2]|0;p=c[h+24>>2]|0;q=d[g+32>>0]|0;r=d[g+33>>0]|0;s=d[g+34>>0]|0;g=d[h+28>>0]|0;t=d[h+32>>0]|0;u=d[h+29>>0]|0;v=d[h+33>>0]|0;w=d[h+30>>0]|0;x=d[h+34>>0]|0;h=e;e=a;a=0;while(1){y=c[h>>2]|0;b[e>>1]=(d[m+((l&y)>>>r)>>0]|0)>>>u<<v|(d[k+((j&y)>>>q)>>0]|0)>>>g<<t|p|(d[o+((n&y)>>>s)>>0]|0)>>>w<<x;a=a+1|0;if((a|0)==(f|0))break;else{h=h+4|0;e=e+2|0}}i=f<<1;return i|0}function Ul(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;e=i;i=i+32|0;f=e+16|0;g=e+4|0;h=e+8|0;j=e;k=b+52|0;l=(a[k>>0]|0)!=0;a:do if((d|0)==-1)if(l)m=-1;else{n=c[b+48>>2]|0;a[k>>0]=(n|0)!=-1&1;m=n}else{n=b+48|0;b:do if(l){a[h>>0]=c[n>>2];o=c[b+36>>2]|0;switch(Kf[c[(c[o>>2]|0)+12>>2]&15](o,c[b+40>>2]|0,h,h+1|0,j,f,f+8|0,g)|0){case 1:case 2:{m=-1;break a;break}case 3:{a[f>>0]=c[n>>2];c[g>>2]=f+1;break}default:{}}o=b+32|0;while(1){p=c[g>>2]|0;if(p>>>0<=f>>>0)break b;q=p+-1|0;c[g>>2]=q;if((me(a[q>>0]|0,c[o>>2]|0)|0)==-1){m=-1;break a}}}while(0);c[n>>2]=d;a[k>>0]=1;m=d}while(0);i=e;return m|0}function Sl(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;e=i;i=i+32|0;f=e+16|0;g=e+8|0;h=e+4|0;j=e;k=b+52|0;l=(a[k>>0]|0)!=0;a:do if((d|0)==-1)if(l)m=-1;else{n=c[b+48>>2]|0;a[k>>0]=(n|0)!=-1&1;m=n}else{n=b+48|0;b:do if(l){c[h>>2]=c[n>>2];o=c[b+36>>2]|0;switch(Kf[c[(c[o>>2]|0)+12>>2]&15](o,c[b+40>>2]|0,h,h+4|0,j,f,f+8|0,g)|0){case 1:case 2:{m=-1;break a;break}case 3:{a[f>>0]=c[n>>2];c[g>>2]=f+1;break}default:{}}o=b+32|0;while(1){p=c[g>>2]|0;if(p>>>0<=f>>>0)break b;q=p+-1|0;c[g>>2]=q;if((me(a[q>>0]|0,c[o>>2]|0)|0)==-1){m=-1;break a}}}while(0);c[n>>2]=d;a[k>>0]=1;m=d}while(0);i=e;return m|0}function jm(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;e=d&255;if(!e){f=b+(Xw(b|0)|0)|0;return f|0}a:do if(!(b&3))g=b;else{h=d&255;i=b;while(1){j=a[i>>0]|0;if(j<<24>>24==0?1:j<<24>>24==h<<24>>24){f=i;break}j=i+1|0;if(!(j&3)){g=j;break a}else i=j}return f|0}while(0);b=ca(e,16843009)|0;e=c[g>>2]|0;b:do if(!((e&-2139062144^-2139062144)&e+-16843009)){i=e;h=g;while(1){j=i^b;if((j&-2139062144^-2139062144)&j+-16843009){k=h;break b}j=h+4|0;i=c[j>>2]|0;if((i&-2139062144^-2139062144)&i+-16843009){k=j;break}else h=j}}else k=g;while(0);g=d&255;d=k;while(1){k=a[d>>0]|0;if(k<<24>>24==0?1:k<<24>>24==g<<24>>24){f=d;break}else d=d+1|0}return f|0}function Tl(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;if(d>>>0>4294967279)Ew(b);e=a[b>>0]|0;if(!(e&1)){f=10;g=e}else{e=c[b>>2]|0;f=(e&-2)+-1|0;g=e&255}if(!(g&1))h=(g&255)>>>1;else h=c[b+4>>2]|0;e=h>>>0>d>>>0?h:d;if(e>>>0<11)i=10;else i=(e+16&-16)+-1|0;do if((i|0)!=(f|0)){do if((i|0)!=10){e=Gp(i+1|0)|0;if(!(g&1)){j=e;k=1;l=b+1|0;m=0;break}else{j=e;k=1;l=c[b+8>>2]|0;m=1;break}}else{j=b+1|0;k=0;l=c[b+8>>2]|0;m=1}while(0);if(!(g&1))n=(g&255)>>>1;else n=c[b+4>>2]|0;dp(j|0,l|0,n+1|0)|0;if(m)wB(l);if(k){c[b>>2]=i+1|1;c[b+4>>2]=h;c[b+8>>2]=j;break}else{a[b>>0]=h<<1;break}}while(0);return}function nm(d){d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;e=c[d+24>>2]|0;f=c[d+28>>2]|0;g=c[d+56>>2]|0;h=c[d+48>>2]|0;i=(c[d+16>>2]|0)+e+((e+7|0)/-8|0)|0;j=(c[d+36>>2]|0)/2|0;if(!f)return;k=(e|0)>0;l=f;f=c[d+20>>2]|0;m=c[d>>2]|0;while(1){l=l+-1|0;if(k){d=0;n=0;o=f;p=m;while(1){if(!(n&7)){q=a[p>>0]|0;r=p+1|0}else{q=d;r=p}s=(q&255)>>>7&255;if((s|0)!=(g|0))b[o>>1]=b[h+(s<<1)>>1]|0;n=n+1|0;if((n|0)==(e|0)){t=r;break}else{d=(q&255)<<1&255;o=o+2|0;p=r}}u=f+(e<<1)|0;v=t}else{u=f;v=m}if(!l)break;else{f=u+(j<<1)|0;m=v+i|0}}return}function pm(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;d=c[b+24>>2]|0;e=c[b+28>>2]|0;f=c[b+56>>2]|0;g=c[b+48>>2]|0;h=(c[b+16>>2]|0)+d+((d+7|0)/-8|0)|0;i=(c[b+36>>2]|0)/4|0;if(!e)return;j=(d|0)>0;k=e;e=c[b+20>>2]|0;l=c[b>>2]|0;while(1){k=k+-1|0;if(j){b=0;m=0;n=e;o=l;while(1){if(!(m&7)){p=a[o>>0]|0;q=o+1|0}else{p=b;q=o}r=(p&255)>>>7&255;if((r|0)!=(f|0))c[n>>2]=c[g+(r<<2)>>2];m=m+1|0;if((m|0)==(d|0)){s=q;break}else{b=(p&255)<<1&255;n=n+4|0;o=q}}t=e+(d<<2)|0;u=s}else{t=e;u=l}if(!k)break;else{e=t+(i<<2)|0;l=u+h|0}}return}function Wl(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;if(d>>>0>1073741807)Ew(b);e=a[b>>0]|0;if(!(e&1)){f=1;g=e}else{e=c[b>>2]|0;f=(e&-2)+-1|0;g=e&255}if(!(g&1))h=(g&255)>>>1;else h=c[b+4>>2]|0;e=h>>>0>d>>>0?h:d;if(e>>>0<2)i=1;else i=(e+4&-4)+-1|0;do if((i|0)!=(f|0)){do if((i|0)!=1){e=Gp((i<<2)+4|0)|0;if(!(g&1)){j=e;k=1;l=b+4|0;m=0;break}else{j=e;k=1;l=c[b+8>>2]|0;m=1;break}}else{j=b+4|0;k=0;l=c[b+8>>2]|0;m=1}while(0);if(!(g&1))n=(g&255)>>>1;else n=c[b+4>>2]|0;Jq(j,l,n+1|0)|0;if(m)wB(l);if(k){c[b>>2]=i+1|1;c[b+4>>2]=h;c[b+8>>2]=j;break}else{a[b>>0]=h<<1;break}}while(0);return}function pl(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;j=i;i=i+16|0;k=j;l=c[b>>2]|0;a:do if(!l)m=0;else{n=f;o=d;p=n-o>>2;q=g+12|0;r=c[q>>2]|0;s=(r|0)>(p|0)?r-p|0:0;p=e;r=p-o|0;o=r>>2;if((r|0)>0?(Ef[c[(c[l>>2]|0)+48>>2]&31](l,d,o)|0)!=(o|0):0){c[b>>2]=0;m=0;break}do if((s|0)>0){zp(k,s,h);if((Ef[c[(c[l>>2]|0)+48>>2]&31](l,(a[k>>0]&1)==0?k+4|0:c[k+8>>2]|0,s)|0)==(s|0)){zu(k);break}else{c[b>>2]=0;zu(k);m=0;break a}}while(0);s=n-p|0;o=s>>2;if((s|0)>0?(Ef[c[(c[l>>2]|0)+48>>2]&31](l,e,o)|0)!=(o|0):0){c[b>>2]=0;m=0;break}c[q>>2]=0;m=l}while(0);i=j;return m|0}function om(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;d=c[b+24>>2]|0;e=c[b+28>>2]|0;f=c[b+36>>2]|0;g=c[b+56>>2]|0;h=c[b+48>>2]|0;i=(c[b+16>>2]|0)+d+((d+7|0)/-8|0)|0;if(!e)return;j=(d|0)>0;k=d*3|0;l=e;e=c[b+20>>2]|0;m=c[b>>2]|0;while(1){l=l+-1|0;if(j){b=0;n=0;o=e;p=m;while(1){if(!(n&7)){q=a[p>>0]|0;r=p+1|0}else{q=b;r=p}s=(q&255)>>>7&255;if((s|0)!=(g|0))ax(o,h+(s<<2)|0,3)|0;n=n+1|0;if((n|0)==(d|0)){t=r;break}else{b=(q&255)<<1&255;o=o+3|0;p=r}}u=e+k|0;v=t}else{u=e;v=m}if(!l)break;else{e=u+f|0;m=v+i|0}}return}function Gl(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;j=i;i=i+16|0;k=j;l=c[b>>2]|0;if(!l){m=0;i=j;return m|0}n=f;f=d;o=n-f|0;p=g+12|0;g=c[p>>2]|0;q=(g|0)>(o|0)?g-o|0:0;o=e;g=o-f|0;if((g|0)>0?(Ef[c[(c[l>>2]|0)+48>>2]&31](l,d,g)|0)!=(g|0):0){c[b>>2]=0;m=0;i=j;return m|0}do if((q|0)>0){yp(k,q,h);if((Ef[c[(c[l>>2]|0)+48>>2]&31](l,(a[k>>0]&1)==0?k+1|0:c[k+8>>2]|0,q)|0)==(q|0)){Au(k);break}c[b>>2]=0;Au(k);m=0;i=j;return m|0}while(0);k=n-o|0;if((k|0)>0?(Ef[c[(c[l>>2]|0)+48>>2]&31](l,e,k)|0)!=(k|0):0){c[b>>2]=0;m=0;i=j;return m|0}c[p>>2]=0;m=l;i=j;return m|0}function mm(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;f=e+16|0;g=c[f>>2]|0;do if(!g)if(!(Np(e)|0)){h=c[f>>2]|0;break}else{i=0;return i|0}else h=g;while(0);g=e+20|0;f=c[g>>2]|0;if((h-f|0)>>>0<d>>>0){i=Ef[c[e+36>>2]&31](e,b,d)|0;return i|0}a:do if((a[e+75>>0]|0)>-1){h=d;while(1){if(!h){j=d;k=b;l=f;m=0;break a}n=h+-1|0;if((a[b+n>>0]|0)==10){o=h;break}else h=n}if((Ef[c[e+36>>2]&31](e,b,o)|0)>>>0<o>>>0){i=o;return i|0}else{j=d-o|0;k=b+o|0;l=c[g>>2]|0;m=o;break}}else{j=d;k=b;l=f;m=0}while(0);dp(l|0,k|0,j|0)|0;c[g>>2]=(c[g>>2]|0)+j;i=m+j|0;return i|0}function vm(a,b,e,f,g){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;if((e|0)<=0){h=e<<2;return h|0}i=f+12|0;j=d[f+32>>0]|0;k=f+16|0;l=d[f+33>>0]|0;m=f+20|0;n=d[f+34>>0]|0;o=f+24|0;p=d[f+35>>0]|0;f=d[g+28>>0]|0;q=d[g+32>>0]|0;r=d[g+29>>0]|0;s=d[g+33>>0]|0;t=d[g+30>>0]|0;u=d[g+34>>0]|0;v=g+24|0;g=b;b=a;a=0;while(1){w=c[g>>2]|0;x=(c[k>>2]&w)>>>l>>>r<<s|(c[i>>2]&w)>>>j>>>f<<q|c[v>>2]|(c[m>>2]&w)>>>n>>>t<<u;c[b>>2]=x&63519|(c[o>>2]&w)>>>p<<2&2016|x<<16&132120576;a=a+1|0;if((a|0)==(e|0))break;else{g=g+4|0;b=b+4|0}}h=e<<2;return h|0}function wm(a,b,e,f,g){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;if((e|0)<=0){h=e<<2;return h|0}i=f+12|0;j=d[f+32>>0]|0;k=f+16|0;l=d[f+33>>0]|0;m=f+20|0;n=d[f+34>>0]|0;o=f+24|0;p=d[f+35>>0]|0;f=d[g+28>>0]|0;q=d[g+32>>0]|0;r=d[g+29>>0]|0;s=d[g+33>>0]|0;t=d[g+30>>0]|0;u=d[g+34>>0]|0;v=g+24|0;g=b;b=a;a=0;while(1){w=c[g>>2]|0;x=(c[k>>2]&w)>>>l>>>r<<s|(c[i>>2]&w)>>>j>>>f<<q|c[v>>2]|(c[m>>2]&w)>>>n>>>t<<u;c[b>>2]=x&64543|(c[o>>2]&w)>>>p<<2&992|x<<16&65011712;a=a+1|0;if((a|0)==(e|0))break;else{g=g+4|0;b=b+4|0}}h=e<<2;return h|0}function am(a,b,e){a=a|0;b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;f=i;i=i+16|0;g=f;h=f+12|0;if(!b){Cj(24903,f+8|0)|0;j=-1;i=f;return j|0}k=c[a+4>>2]|0;if((c[k>>2]|0)!=376840196){l=Hr(a,376840196,0)|0;if(!l)m=8;else{n=Og(c[l+20>>2]|0,c[l+8>>2]|0,c[l+12>>2]|0,d[(c[l+4>>2]|0)+9>>0]|0,c[l+16>>2]|0,h)|0;rm(l);o=n;m=6}}else{o=Og(c[a+20>>2]|0,c[a+8>>2]|0,c[a+12>>2]|0,d[k+9>>0]|0,c[a+16>>2]|0,h)|0;m=6}if((m|0)==6)if(!o)m=8;else{a=((Pf[c[b+12>>2]&15](b,o,c[h>>2]|0,1)|0)==0)<<31>>31;qB(o);p=a}if((m|0)==8){Cj(24870,g)|0;p=-1}if(!e){j=p;i=f;return j|0}Af[c[b+16>>2]&127](b)|0;j=p;i=f;return j|0}function zm(d){d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;e=c[d+24>>2]|0;f=c[d+28>>2]|0;g=(c[d+36>>2]|0)/2|0;h=c[d+48>>2]|0;i=(c[d+16>>2]|0)+e+((e+7|0)/-8|0)|0;if(!f)return;j=(e|0)>0;k=f;f=c[d+20>>2]|0;l=c[d>>2]|0;while(1){k=k+-1|0;if(j){d=0;m=0;n=f;o=l;while(1){if(!(m&7)){p=a[o>>0]|0;q=o+1|0}else{p=d;q=o}b[n>>1]=b[h+(((p&255)>>>7&255)<<1)>>1]|0;m=m+1|0;if((m|0)==(e|0)){r=q;break}else{d=(p&255)<<1&255;n=n+2|0;o=q}}s=f+(e<<1)|0;t=r}else{s=f;t=l}if(!k)break;else{f=s+(g<<1)|0;l=t+i|0}}return}function Am(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;d=c[b+24>>2]|0;e=c[b+28>>2]|0;f=(c[b+36>>2]|0)/4|0;g=c[b+48>>2]|0;h=(c[b+16>>2]|0)+d+((d+7|0)/-8|0)|0;if(!e)return;i=(d|0)>0;j=e;e=c[b+20>>2]|0;k=c[b>>2]|0;while(1){j=j+-1|0;if(i){b=0;l=0;m=e;n=k;while(1){if(!(l&7)){o=a[n>>0]|0;p=n+1|0}else{o=b;p=n}c[m>>2]=c[g+(((o&255)>>>7&255)<<2)>>2];l=l+1|0;if((l|0)==(d|0)){q=p;break}else{b=(o&255)<<1&255;m=m+4|0;n=p}}r=e+(d<<2)|0;s=q}else{r=e;s=k}if(!j)break;else{e=r+(f<<2)|0;k=s+h|0}}return}function ym(a,b,e,f,g){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;if((e|0)<=0){h=e<<2;return h|0}i=f+12|0;j=d[f+32>>0]|0;k=f+16|0;l=d[f+33>>0]|0;m=f+20|0;n=d[f+34>>0]|0;o=f+24|0;p=d[f+35>>0]|0;f=d[g+28>>0]|0;q=d[g+32>>0]|0;r=d[g+29>>0]|0;s=d[g+33>>0]|0;t=d[g+30>>0]|0;u=d[g+34>>0]|0;v=d[g+31>>0]|0;w=d[g+35>>0]|0;g=b;b=a;a=0;while(1){x=c[g>>2]|0;c[b>>2]=(c[k>>2]&x)>>>l>>>r<<s|(c[i>>2]&x)>>>j>>>f<<q|(c[m>>2]&x)>>>n>>>t<<u|(c[o>>2]&x)>>>p>>>v<<w;a=a+1|0;if((a|0)==(e|0))break;else{g=g+4|0;b=b+4|0}}h=e<<2;return h|0}function Cm(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;e=b+104|0;f=c[e>>2]|0;if(!((f|0)!=0?(c[b+108>>2]|0)>=(f|0):0))g=3;if((g|0)==3?(f=xq(b)|0,(f|0)>=0):0){h=c[e>>2]|0;e=b+8|0;if(h){i=c[e>>2]|0;j=c[b+4>>2]|0;k=i;l=h-(c[b+108>>2]|0)+-1|0;if((k-j|0)>(l|0)){c[b+100>>2]=j+l;m=i}else{n=k;o=i;g=9}}else{i=c[e>>2]|0;n=i;o=i;g=9}if((g|0)==9){c[b+100>>2]=n;m=o}o=c[b+4>>2]|0;if(m){n=b+108|0;c[n>>2]=m+1-o+(c[n>>2]|0)}n=o+-1|0;if((d[n>>0]|0|0)==(f|0)){p=f;return p|0}a[n>>0]=f;p=f;return p|0}c[b+100>>2]=0;p=-1;return p|0}function qm(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=i;i=i+224|0;f=e+120|0;g=e+80|0;h=e;j=e+136|0;k=g;l=k+40|0;do{c[k>>2]=0;k=k+4|0}while((k|0)<(l|0));c[f>>2]=c[d>>2];if((Yf(0,b,f,h,g)|0)<0){m=-1;i=e;return m|0}d=a+48|0;if(!(c[d>>2]|0)){k=a+44|0;l=c[k>>2]|0;c[k>>2]=j;n=a+28|0;c[n>>2]=j;o=a+20|0;c[o>>2]=j;c[d>>2]=80;p=a+16|0;c[p>>2]=j+80;j=Yf(a,b,f,h,g)|0;if(!l)q=j;else{Ef[c[a+36>>2]&31](a,0,0)|0;r=(c[o>>2]|0)==0?-1:j;c[k>>2]=l;c[d>>2]=0;c[p>>2]=0;c[n>>2]=0;c[o>>2]=0;q=r}}else q=Yf(a,b,f,h,g)|0;m=q;i=e;return m|0}function Fl(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;if((b|0)==(c[d+8>>2]|0))Rm(0,d,e,f,g);else{i=d+52|0;j=a[i>>0]|0;k=d+53|0;l=a[k>>0]|0;m=c[b+12>>2]|0;n=b+16+(m<<3)|0;a[i>>0]=0;a[k>>0]=0;Bp(b+16|0,d,e,f,g,h);a:do if((m|0)>1){o=d+24|0;p=b+8|0;q=d+54|0;r=b+24|0;do{if(a[q>>0]|0)break a;if(!(a[i>>0]|0)){if((a[k>>0]|0)!=0?(c[p>>2]&1|0)==0:0)break a}else{if((c[o>>2]|0)==1)break a;if(!(c[p>>2]&2))break a}a[i>>0]=0;a[k>>0]=0;Bp(r,d,e,f,g,h);r=r+8|0}while(r>>>0<n>>>0)}while(0);a[i>>0]=j;a[k>>0]=l}return}function Aj(b){b=b|0;if((a[2584]|0)==0?(Va(2584)|0)!=0:0){if((a[2592]|0)==0?(Va(2592)|0)!=0:0){b=20072;do{c[b>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;b=b+12|0}while((b|0)!=20360);Fb(306,0,n|0)|0;cc(2592)}As(20072,20360)|0;As(20084,20392)|0;As(20096,20428)|0;As(20108,20452)|0;As(20120,20476)|0;As(20132,20492)|0;As(20144,20512)|0;As(20156,20532)|0;As(20168,20560)|0;As(20180,20600)|0;As(20192,20632)|0;As(20204,20668)|0;As(20216,20704)|0;As(20228,20720)|0;As(20240,20736)|0;As(20252,20752)|0;As(20264,20476)|0;As(20276,20768)|0;As(20288,20784)|0;As(20300,20800)|0;As(20312,20816)|0;As(20324,20832)|0;As(20336,20848)|0;As(20348,20864)|0;c[5220]=20072;cc(2584)}return c[5220]|0}function Bj(b){b=b|0;if((a[2568]|0)==0?(Va(2568)|0)!=0:0){if((a[2576]|0)==0?(Va(2576)|0)!=0:0){b=19780;do{c[b>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;b=b+12|0}while((b|0)!=20068);Fb(305,0,n|0)|0;cc(2576)}vs(19780,33890)|0;vs(19792,33898)|0;vs(19804,33907)|0;vs(19816,33913)|0;vs(19828,33919)|0;vs(19840,33923)|0;vs(19852,33928)|0;vs(19864,33933)|0;vs(19876,33940)|0;vs(19888,33950)|0;vs(19900,33958)|0;vs(19912,33967)|0;vs(19924,33976)|0;vs(19936,33980)|0;vs(19948,33984)|0;vs(19960,33988)|0;vs(19972,33919)|0;vs(19984,33992)|0;vs(19996,33996)|0;vs(20008,34e3)|0;vs(20020,34004)|0;vs(20032,34008)|0;vs(20044,34012)|0;vs(20056,34016)|0;c[5017]=19780;cc(2568)}return c[5017]|0}function Nl(b,d){b=b|0;d=+d;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;e=i;i=i+32|0;f=e+20|0;g=e+16|0;h=e+8|0;j=e;eq(h,b);if(a[h>>0]|0){c[j>>2]=Hs(b+(c[(c[b>>2]|0)+-12>>2]|0)|0)|0;k=Ds(j,17448)|0;Ww(j);j=c[(c[b>>2]|0)+-12>>2]|0;l=c[b+(j+24)>>2]|0;m=b+j|0;n=b+(j+76)|0;j=c[n>>2]|0;if((j|0)==-1){c[f>>2]=Hs(m)|0;o=Ds(f,18276)|0;p=Nf[c[(c[o>>2]|0)+28>>2]&31](o,32)|0;Ww(f);o=p<<24>>24;c[n>>2]=o;q=o}else q=j;j=c[(c[k>>2]|0)+32>>2]|0;c[g>>2]=l;c[f>>2]=c[g>>2];if(!(Vf[j&7](k,f,m,q&255,d)|0)){q=b+((c[(c[b>>2]|0)+-12>>2]|0)+16)|0;c[q>>2]=c[q>>2]|5}}ao(h);i=e;return b|0}function sm(){var a=0,b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;a=i;i=i+48|0;b=a+32|0;d=a+24|0;e=a+16|0;f=a;g=a+36|0;a=Ir()|0;if((a|0)!=0?(h=c[a>>2]|0,(h|0)!=0):0){a=h+48|0;j=c[a>>2]|0;k=c[a+4>>2]|0;if(!((j&-256|0)==1126902528&(k|0)==1129074247)){c[d>>2]=c[3734];Pr(27956,d)}if((j|0)==1126902529&(k|0)==1129074247)l=c[h+44>>2]|0;else l=h+80|0;c[g>>2]=l;l=c[h>>2]|0;h=c[l+4>>2]|0;if(Ef[c[(c[800>>2]|0)+16>>2]&31](800,l,g)|0){l=c[g>>2]|0;g=c[3734]|0;k=Af[c[(c[l>>2]|0)+8>>2]&127](l)|0;c[f>>2]=g;c[f+4>>2]=h;c[f+8>>2]=k;Pr(27870,f)}else{c[e>>2]=c[3734];c[e+4>>2]=h;Pr(27915,e)}}Pr(27994,b)}function dm(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;f=d;g=a[b>>0]|0;if(!(g&1)){h=1;i=(g&255)>>>1;j=g}else{g=c[b>>2]|0;h=(g&-2)+-1|0;i=c[b+4>>2]|0;j=g&255}g=e-f>>2;do if(g){if((h-i|0)>>>0<g>>>0){$m(b,h,i+g-h|0,i,i,0,0);k=a[b>>0]|0}else k=j;if(!(k&1))l=b+4|0;else l=c[b+8>>2]|0;m=i+((e-f|0)>>>2)|0;if((d|0)!=(e|0)){n=d;o=l+(i<<2)|0;while(1){c[o>>2]=c[n>>2];n=n+4|0;if((n|0)==(e|0))break;else o=o+4|0}}c[l+(m<<2)>>2]=0;o=i+g|0;if(!(a[b>>0]&1)){a[b>>0]=o<<1;break}else{c[b+4>>2]=o;break}}while(0);return b|0}function um(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+16|0;g=f;a:do if((a|0)==(b|0)){c[d>>2]=4;h=0}else{j=pd()|0;k=c[j>>2]|0;c[j>>2]=0;l=tw(a,g,e,Ps()|0)|0;m=G;n=c[j>>2]|0;if(!n)c[j>>2]=k;if((c[g>>2]|0)!=(b|0)){c[d>>2]=4;h=0;break}do if((n|0)==34){c[d>>2]=4;if((m|0)>0|(m|0)==0&l>>>0>0){h=2147483647;break a}}else{if((m|0)<-1|(m|0)==-1&l>>>0<2147483648){c[d>>2]=4;break}if((m|0)>0|(m|0)==0&l>>>0>2147483647){c[d>>2]=4;h=2147483647;break a}else{h=l;break a}}while(0);h=-2147483648}while(0);i=f;return h|0}function em(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;f=d;g=a[b>>0]|0;if(!(g&1)){h=10;i=(g&255)>>>1;j=g}else{g=c[b>>2]|0;h=(g&-2)+-1|0;i=c[b+4>>2]|0;j=g&255}g=e-f|0;do if((e|0)!=(d|0)){if((h-i|0)>>>0<g>>>0){cn(b,h,i+g-h|0,i,i,0,0);k=a[b>>0]|0}else k=j;if(!(k&1))l=b+1|0;else l=c[b+8>>2]|0;m=e+(i-f)|0;if((d|0)!=(e|0)){n=d;o=l+i|0;while(1){a[o>>0]=a[n>>0]|0;n=n+1|0;if((n|0)==(e|0))break;else o=o+1|0}}a[l+m>>0]=0;o=i+g|0;if(!(a[b>>0]&1)){a[b>>0]=o<<1;break}else{c[b+4>>2]=o;break}}while(0);return b|0}function xm(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;b=ca(d[(c[a+44>>2]|0)+9>>0]|0,c[a+24>>2]|0)|0;e=c[a+28>>2]|0;f=c[a>>2]|0;g=c[a+20>>2]|0;h=c[a+12>>2]|0;i=c[a+32>>2]|0;if(f>>>0<g>>>0)if(g>>>0<(f+(ca(h,e)|0)|0)>>>0)j=5;else j=4;else if(f>>>0<(g+(ca(i,e)|0)|0)>>>0)j=5;else j=4;if((j|0)==4){if(!e)return;else{k=g;l=e;m=f}while(1){l=l+-1|0;ax(k,m,b)|0;if(!l)break;else{k=k+i|0;m=m+h|0}}return}else if((j|0)==5){if(!e)return;else{n=g;o=e;p=f}while(1){o=o+-1|0;Zw(n,p,b)|0;if(!o)break;else{n=n+i|0;p=p+h|0}}return}}function ql(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;f=i;i=i+32|0;g=f+16|0;h=f+8|0;j=f;eq(h,b);if(!(a[h>>0]|0)){ao(h);i=f;return b|0}k=c[(c[b>>2]|0)+-12>>2]|0;c[j>>2]=c[b+(k+24)>>2];l=b+k|0;m=c[b+(k+4)>>2]|0;n=d+e|0;e=b+(k+76)|0;k=c[e>>2]|0;if((k|0)==-1){c[g>>2]=Hs(l)|0;o=Ds(g,18276)|0;p=Nf[c[(c[o>>2]|0)+28>>2]&31](o,32)|0;Ww(g);o=p<<24>>24;c[e>>2]=o;q=o}else q=k;c[g>>2]=c[j>>2];if(Gl(g,d,(m&176|0)==32?n:d,n,l,q&255)|0){ao(h);i=f;return b|0}q=c[(c[b>>2]|0)+-12>>2]|0;bw(b+q|0,c[b+(q+16)>>2]|5);ao(h);i=f;return b|0}function Em(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;i=i+128|0;h=g+112|0;j=g;k=j;l=14972;m=k+112|0;do{c[k>>2]=c[l>>2];k=k+4|0;l=l+4|0}while((k|0)<(m|0));if((d+-1|0)>>>0>2147483646)if(!d){n=h;o=1}else{c[(pd()|0)>>2]=75;p=-1;i=g;return p|0}else{n=b;o=d}d=-2-n|0;b=o>>>0>d>>>0?d:o;c[j+48>>2]=b;o=j+20|0;c[o>>2]=n;c[j+44>>2]=n;d=n+b|0;n=j+16|0;c[n>>2]=d;c[j+28>>2]=d;d=qm(j,e,f)|0;if(!b){p=d;i=g;return p|0}b=c[o>>2]|0;a[b+(((b|0)==(c[n>>2]|0))<<31>>31)>>0]=0;p=d;i=g;return p|0}function rm(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0;if(!a)return;b=c[a>>2]|0;if(b&4)return;d=a+56|0;e=c[d>>2]|0;c[d>>2]=e+-1;if((e|0)>1)return;e=a+28|0;d=c[e>>2]|0;if((d|0)>0){f=d;while(1){d=f+-1|0;c[e>>2]=d;if((f|0)<=1?(g=c[a>>2]|0,(g&2|0)!=0):0){c[a>>2]=g&-3;sg(a)|0;h=c[e>>2]|0}else h=d;if((h|0)>0)f=h;else break}i=c[a>>2]|0}else i=b;if(i&2)si(a,0);i=a+4|0;b=c[i>>2]|0;if(b){if((en(b,0)|0)>=0)hq(c[a+52>>2]|0);Pm(c[i>>2]|0);c[i>>2]=0}i=a+52|0;b=c[i>>2]|0;if(b){bq(b);c[i>>2]=0}if(!(c[a>>2]&1))qB(c[a+20>>2]|0);qB(a);return}function Pl(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;b=i;i=i+192|0;h=b;j=b+180|0;k=b+160|0;l=b+12|0;m=b+8|0;n=b+4|0;a[j>>0]=a[33708]|0;a[j+1>>0]=a[33709]|0;a[j+2>>0]=a[33710]|0;a[j+3>>0]=a[33711]|0;a[j+4>>0]=a[33712]|0;a[j+5>>0]=a[33713]|0;o=Ps()|0;c[h>>2]=g;g=tq(k,20,o,j,h)|0;j=k+g|0;o=yn(k,j,e)|0;p=Hs(e)|0;c[m>>2]=p;q=Ds(m,18268)|0;lr(p)|0;Pf[c[(c[q>>2]|0)+48>>2]&15](q,k,j,l)|0;q=l+(g<<2)|0;c[n>>2]=c[d>>2];c[h>>2]=c[n>>2];n=pl(h,l,(o|0)==(j|0)?q:l+(o-k<<2)|0,q,e,f)|0;i=b;return n|0}function Jl(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;b=i;i=i+128|0;h=b;j=b+116|0;k=b+104|0;l=b+20|0;m=b+16|0;n=b+12|0;o=b+8|0;p=b+4|0;a[j>>0]=a[33694]|0;a[j+1>>0]=a[33695]|0;a[j+2>>0]=a[33696]|0;a[j+3>>0]=a[33697]|0;a[j+4>>0]=a[33698]|0;a[j+5>>0]=a[33699]|0;Km(j+1|0,33700,1,c[e+4>>2]|0);q=Ps()|0;c[h>>2]=g;g=k+(tq(k,12,q,j,h)|0)|0;j=yn(k,g,e)|0;q=Hs(e)|0;c[o>>2]=q;fi(k,j,g,l,m,n,o);lr(q)|0;c[p>>2]=c[d>>2];d=c[m>>2]|0;m=c[n>>2]|0;c[h>>2]=c[p>>2];p=pl(h,l,d,m,e,f)|0;i=b;return p|0}function Il(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;b=i;i=i+128|0;h=b;j=b+116|0;k=b+104|0;l=b+20|0;m=b+16|0;n=b+12|0;o=b+8|0;p=b+4|0;a[j>>0]=a[33694]|0;a[j+1>>0]=a[33695]|0;a[j+2>>0]=a[33696]|0;a[j+3>>0]=a[33697]|0;a[j+4>>0]=a[33698]|0;a[j+5>>0]=a[33699]|0;Km(j+1|0,33700,0,c[e+4>>2]|0);q=Ps()|0;c[h>>2]=g;g=k+(tq(k,12,q,j,h)|0)|0;j=yn(k,g,e)|0;q=Hs(e)|0;c[o>>2]=q;fi(k,j,g,l,m,n,o);lr(q)|0;c[p>>2]=c[d>>2];d=c[m>>2]|0;m=c[n>>2]|0;c[h>>2]=c[p>>2];p=pl(h,l,d,m,e,f)|0;i=b;return p|0}function gm(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;d=i;i=i+16|0;j=d;c[j>>2]=0;c[j+4>>2]=0;c[j+8>>2]=0;k=a[h>>0]|0;l=(k&1)==0;m=l?h+1|0:c[h+8>>2]|0;n=l?(k&255)>>>1:c[h+4>>2]|0;h=m+n|0;if((n|0)>0){n=m;do{jn(j,a[n>>0]|0);n=n+1|0}while(n>>>0<h>>>0)}h=Ae(((e|0)==-1?-1:e<<1)|0,f|0,g|0,((a[j>>0]&1)==0?j+1|0:c[j+8>>2]|0)|0)|0;c[b>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;g=Xw(h|0)|0;f=h+g|0;if((g|0)>0){g=h;do{jn(b,a[g>>0]|0);g=g+1|0}while(g>>>0<f>>>0)}Au(j);i=d;return}function Ll(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;b=i;i=i+64|0;h=b;j=b+56|0;k=b+44|0;l=b+20|0;m=b+16|0;n=b+12|0;o=b+8|0;p=b+4|0;a[j>>0]=a[33694]|0;a[j+1>>0]=a[33695]|0;a[j+2>>0]=a[33696]|0;a[j+3>>0]=a[33697]|0;a[j+4>>0]=a[33698]|0;a[j+5>>0]=a[33699]|0;Km(j+1|0,33700,1,c[e+4>>2]|0);q=Ps()|0;c[h>>2]=g;g=k+(tq(k,12,q,j,h)|0)|0;j=yn(k,g,e)|0;q=Hs(e)|0;c[o>>2]=q;li(k,j,g,l,m,n,o);lr(q)|0;c[p>>2]=c[d>>2];d=c[m>>2]|0;m=c[n>>2]|0;c[h>>2]=c[p>>2];p=Gl(h,l,d,m,e,f)|0;i=b;return p|0}function Kl(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;b=i;i=i+64|0;h=b;j=b+56|0;k=b+44|0;l=b+20|0;m=b+16|0;n=b+12|0;o=b+8|0;p=b+4|0;a[j>>0]=a[33694]|0;a[j+1>>0]=a[33695]|0;a[j+2>>0]=a[33696]|0;a[j+3>>0]=a[33697]|0;a[j+4>>0]=a[33698]|0;a[j+5>>0]=a[33699]|0;Km(j+1|0,33700,0,c[e+4>>2]|0);q=Ps()|0;c[h>>2]=g;g=k+(tq(k,12,q,j,h)|0)|0;j=yn(k,g,e)|0;q=Hs(e)|0;c[o>>2]=q;li(k,j,g,l,m,n,o);lr(q)|0;c[p>>2]=c[d>>2];d=c[m>>2]|0;m=c[n>>2]|0;c[h>>2]=c[p>>2];p=Gl(h,l,d,m,e,f)|0;i=b;return p|0}function Ql(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;b=i;i=i+80|0;h=b;j=b+72|0;k=b+52|0;l=b+12|0;m=b+8|0;n=b+4|0;a[j>>0]=a[33708]|0;a[j+1>>0]=a[33709]|0;a[j+2>>0]=a[33710]|0;a[j+3>>0]=a[33711]|0;a[j+4>>0]=a[33712]|0;a[j+5>>0]=a[33713]|0;o=Ps()|0;c[h>>2]=g;g=tq(k,20,o,j,h)|0;j=k+g|0;o=yn(k,j,e)|0;p=Hs(e)|0;c[m>>2]=p;q=Ds(m,18276)|0;lr(p)|0;Pf[c[(c[q>>2]|0)+32>>2]&15](q,k,j,l)|0;q=l+g|0;c[n>>2]=c[d>>2];c[h>>2]=c[n>>2];n=Gl(h,l,(o|0)==(j|0)?q:l+(o-k)|0,q,e,f)|0;i=b;return n|0}function Km(b,c,d,e){b=b|0;c=c|0;d=d|0;e=e|0;var f=0,g=0,h=0;if(!(e&2048))f=b;else{a[b>>0]=43;f=b+1|0}if(!(e&512))g=f;else{a[f>>0]=35;g=f+1|0}f=a[c>>0]|0;if(!(f<<24>>24))h=g;else{b=c;c=g;g=f;while(1){b=b+1|0;f=c+1|0;a[c>>0]=g;g=a[b>>0]|0;if(!(g<<24>>24)){h=f;break}else c=f}}a:do switch(e&74|0){case 64:{a[h>>0]=111;break}case 8:{if(!(e&16384)){a[h>>0]=120;break a}else{a[h>>0]=88;break a}break}default:if(d){a[h>>0]=100;break a}else{a[h>>0]=117;break a}}while(0);return}function Bm(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0;f=i;i=i+112|0;e=f+4|0;k=f;c[k>>2]=e+100;lp(b+8|0,e,k,g,h,j);j=c[k>>2]|0;k=c[d>>2]|0;if((e|0)==(j|0))l=k;else{d=e;e=k;while(1){k=a[d>>0]|0;do if(e){h=e+24|0;g=c[h>>2]|0;if((g|0)==(c[e+28>>2]|0)){b=(Nf[c[(c[e>>2]|0)+52>>2]&31](e,k&255)|0)==-1;m=b?0:e;break}else{c[h>>2]=g+1;a[g>>0]=k;m=e;break}}else m=0;while(0);d=d+1|0;if((d|0)==(j|0)){l=m;break}else e=m}}i=f;return l|0}function lm(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0;j=i;i=i+16|0;k=j+4|0;l=j;m=b+8|0;b=Af[c[(c[m>>2]|0)+8>>2]&127](m)|0;m=a[b>>0]|0;if(!(m&1))n=(m&255)>>>1;else n=c[b+4>>2]|0;m=a[b+12>>0]|0;if(!(m&1))o=(m&255)>>>1;else o=c[b+16>>2]|0;do if((n|0)!=(0-o|0)){c[l>>2]=c[f>>2];c[k>>2]=c[l>>2];m=Xg(e,k,b,b+24|0,h,g,0)|0;p=c[d>>2]|0;if((m|0)==(b|0)&(p|0)==12){c[d>>2]=0;break}if((p|0)<12&(m-b|0)==12)c[d>>2]=p+12}else c[g>>2]=c[g>>2]|4;while(0);i=j;return}function km(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0;j=i;i=i+16|0;k=j+4|0;l=j;m=b+8|0;b=Af[c[(c[m>>2]|0)+8>>2]&127](m)|0;m=a[b>>0]|0;if(!(m&1))n=(m&255)>>>1;else n=c[b+4>>2]|0;m=a[b+12>>0]|0;if(!(m&1))o=(m&255)>>>1;else o=c[b+16>>2]|0;do if((n|0)!=(0-o|0)){c[l>>2]=c[f>>2];c[k>>2]=c[l>>2];m=Sg(e,k,b,b+24|0,h,g,0)|0;p=c[d>>2]|0;if((m|0)==(b|0)&(p|0)==12){c[d>>2]=0;break}if((p|0)<12&(m-b|0)==12)c[d>>2]=p+12}else c[g>>2]=c[g>>2]|4;while(0);i=j;return}function Mm(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0;b=i;i=i+16|0;d=b;e=c[1408]|0;a:do if(e){f=e;while(1){if((c[f>>2]|0)==(a|0)){g=f;break}f=c[f+40>>2]|0;if(!f)break a}f=g+36|0;c[f>>2]=(c[f>>2]|0)+1;h=g;i=b;return h|0}while(0);g=iB(44)|0;if(!g){Fp(0)|0;h=0;i=b;return h|0}if((xi(g,a)|0)<0){qB(g);c[d>>2]=23987;Cj(24164,d)|0;h=0;i=b;return h|0}if((a|0)==0|(a&-268435456|0)==268435456?((a>>>24&15)+-1|0)>>>0<3:0){h=g;i=b;return h|0}c[g+40>>2]=c[1408];c[1408]=g;h=g;i=b;return h|0}function Qm(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;g=e;h=a+8|0;a:do if((d|0)==(e|0)|(f|0)==0)i=0;else{a=d;j=0;k=0;while(1){l=Tb(c[h>>2]|0)|0;m=Ow(a,g-a|0,b)|0;if(l)Tb(l|0)|0;switch(m|0){case -2:case -1:{i=j;break a;break}case 0:{n=a+1|0;o=1;break}default:{n=a+m|0;o=m}}m=o+j|0;k=k+1|0;if((n|0)==(e|0)|k>>>0>=f>>>0){i=m;break a}else{a=n;j=m}}}while(0);return i|0}function Hm(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;e=i;i=i+416|0;d=e+8|0;j=e;c[j>>2]=d+400;bo(a+8|0,d,j,f,g,h);h=c[j>>2]|0;j=c[b>>2]|0;if((d|0)==(h|0))k=j;else{b=d;d=j;while(1){j=c[b>>2]|0;if(!d)l=0;else{g=d+24|0;f=c[g>>2]|0;if((f|0)==(c[d+28>>2]|0))m=Nf[c[(c[d>>2]|0)+52>>2]&31](d,j)|0;else{c[g>>2]=f+4;c[f>>2]=j;m=j}l=(m|0)==-1?0:d}b=b+4|0;if((b|0)==(h|0)){k=l;break}else d=l}}i=e;return k|0}function Dm(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0;if((1073741806-d|0)>>>0<e>>>0)Ew(b);if(!(a[b>>0]&1))k=b+4|0;else k=c[b+8>>2]|0;if(d>>>0<536870887){l=e+d|0;e=d<<1;m=l>>>0<e>>>0?e:l;n=m>>>0<2?2:m+4&-4}else n=1073741807;m=Gp(n<<2)|0;if(g)Jq(m,k,g)|0;if(i)Jq(m+(g<<2)|0,j,i)|0;j=f-h|0;if((j|0)!=(g|0))Jq(m+(i+g<<2)|0,k+(h+g<<2)|0,j-g|0)|0;if((d|0)!=1)wB(k);c[b+8>>2]=m;c[b>>2]=n|1;n=j+i|0;c[b+4>>2]=n;c[m+(n<<2)>>2]=0;return}function Tm(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;e=c[d>>2]|0;f=e+b|0;g=d+4|0;h=c[g>>2]|0;do if(f>>>0>h>>>0){if(!(c[d+12>>2]|0)){i=0;return i|0}else j=h;while(1){k=j<<1;l=k>>>0<128?128:k;if(f>>>0>l>>>0)j=l;else{m=l;break}}l=d+8|0;k=eA(c[l>>2]|0,m)|0;if(!k){i=0;return i|0}else{c[l>>2]=k;c[g>>2]=m;n=k;o=c[d>>2]|0;break}}else{n=c[d+8>>2]|0;o=e}while(0);dp(n+o|0,a|0,b|0)|0;c[d>>2]=f;i=1;return i|0}function Pm(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=i;i=i+16|0;d=b;if(!a){c[d>>2]=23987;Cj(24164,d)|0;i=b;return}d=a+36|0;e=c[d>>2]|0;c[d>>2]=e+-1;if((e|0)>1){i=b;return}e=c[1408]|0;a:do if((e|0)!=(a|0)){if(e){d=e;while(1){f=d+40|0;d=c[f>>2]|0;if(!d)break a;if((d|0)==(a|0)){g=f;break}}c[g>>2]=c[a+40>>2]}}else c[1408]=c[a+40>>2];while(0);g=c[a+4>>2]|0;if((g|0)!=0?(e=g+12|0,d=c[e>>2]|0,c[e>>2]=d+-1,(d|0)<=1):0){qB(c[g+4>>2]|0);qB(g)}qB(a);i=b;return}function Yl(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;a=i;i=i+224|0;h=a+8|0;j=a;k=a+196|0;l=a+32|0;m=a+28|0;n=a+24|0;o=a+20|0;p=a+16|0;q=j;c[q>>2]=37;c[q+4>>2]=0;Km(j+1|0,33702,1,c[d+4>>2]|0);q=Ps()|0;r=h;c[r>>2]=f;c[r+4>>2]=g;g=k+(tq(k,22,q,j,h)|0)|0;j=yn(k,g,d)|0;q=Hs(d)|0;c[o>>2]=q;fi(k,j,g,l,m,n,o);lr(q)|0;c[p>>2]=c[b>>2];b=c[m>>2]|0;m=c[n>>2]|0;c[h>>2]=c[p>>2];p=pl(h,l,b,m,d,e)|0;i=a;return p|0}function Xl(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;a=i;i=i+240|0;h=a+8|0;j=a;k=a+204|0;l=a+32|0;m=a+28|0;n=a+24|0;o=a+20|0;p=a+16|0;q=j;c[q>>2]=37;c[q+4>>2]=0;Km(j+1|0,33702,0,c[d+4>>2]|0);q=Ps()|0;r=h;c[r>>2]=f;c[r+4>>2]=g;g=k+(tq(k,23,q,j,h)|0)|0;j=yn(k,g,d)|0;q=Hs(d)|0;c[o>>2]=q;fi(k,j,g,l,m,n,o);lr(q)|0;c[p>>2]=c[b>>2];b=c[m>>2]|0;m=c[n>>2]|0;c[h>>2]=c[p>>2];p=pl(h,l,b,m,d,e)|0;i=a;return p|0}function Zl(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;a=i;i=i+112|0;h=a+8|0;j=a;k=a+75|0;l=a+32|0;m=a+28|0;n=a+24|0;o=a+20|0;p=a+16|0;q=j;c[q>>2]=37;c[q+4>>2]=0;Km(j+1|0,33702,0,c[d+4>>2]|0);q=Ps()|0;r=h;c[r>>2]=f;c[r+4>>2]=g;g=k+(tq(k,23,q,j,h)|0)|0;j=yn(k,g,d)|0;q=Hs(d)|0;c[o>>2]=q;li(k,j,g,l,m,n,o);lr(q)|0;c[p>>2]=c[b>>2];b=c[m>>2]|0;m=c[n>>2]|0;c[h>>2]=c[p>>2];p=Gl(h,l,b,m,d,e)|0;i=a;return p|0}function _l(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;a=i;i=i+96|0;h=a+8|0;j=a;k=a+74|0;l=a+32|0;m=a+28|0;n=a+24|0;o=a+20|0;p=a+16|0;q=j;c[q>>2]=37;c[q+4>>2]=0;Km(j+1|0,33702,1,c[d+4>>2]|0);q=Ps()|0;r=h;c[r>>2]=f;c[r+4>>2]=g;g=k+(tq(k,22,q,j,h)|0)|0;j=yn(k,g,d)|0;q=Hs(d)|0;c[o>>2]=q;li(k,j,g,l,m,n,o);lr(q)|0;c[p>>2]=c[b>>2];b=c[m>>2]|0;m=c[n>>2]|0;c[h>>2]=c[p>>2];p=Gl(h,l,b,m,d,e)|0;i=a;return p|0}function tn(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if(!b){f=1;return f|0}if(d>>>0<128){a[b>>0]=d;f=1;return f|0}if(d>>>0<2048){a[b>>0]=d>>>6|192;a[b+1>>0]=d&63|128;f=2;return f|0}if(d>>>0<55296|(d&-8192|0)==57344){a[b>>0]=d>>>12|224;a[b+1>>0]=d>>>6&63|128;a[b+2>>0]=d&63|128;f=3;return f|0}if((d+-65536|0)>>>0<1048576){a[b>>0]=d>>>18|240;a[b+1>>0]=d>>>12&63|128;a[b+2>>0]=d>>>6&63|128;a[b+3>>0]=d&63|128;f=4;return f|0}else{c[(pd()|0)>>2]=84;f=-1;return f|0}return 0}function Im(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0;if((-18-d|0)>>>0<e>>>0)Ew(b);if(!(a[b>>0]&1))k=b+1|0;else k=c[b+8>>2]|0;if(d>>>0<2147483623){l=e+d|0;e=d<<1;m=l>>>0<e>>>0?e:l;n=m>>>0<11?11:m+16&-16}else n=-17;m=Gp(n)|0;if(g)dp(m|0,k|0,g|0)|0;if(i)dp(m+g|0,j|0,i|0)|0;j=f-h|0;if((j|0)!=(g|0))dp(m+(i+g)|0,k+(h+g)|0,j-g|0)|0;if((d|0)!=10)wB(k);c[b+8>>2]=m;c[b>>2]=n|1;n=j+i|0;c[b+4>>2]=n;a[m+n>>0]=0;return}function Rm(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0;a[d+53>>0]=1;do if((c[d+4>>2]|0)==(f|0)){a[d+52>>0]=1;b=d+16|0;h=c[b>>2]|0;if(!h){c[b>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((g|0)==1?(c[d+48>>2]|0)==1:0))break;a[d+54>>0]=1;break}if((h|0)!=(e|0)){h=d+36|0;c[h>>2]=(c[h>>2]|0)+1;a[d+54>>0]=1;break}h=d+24|0;b=c[h>>2]|0;if((b|0)==2){c[h>>2]=g;i=g}else i=b;if((i|0)==1?(c[d+48>>2]|0)==1:0)a[d+54>>0]=1}while(0);return}function Nm(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;i=i+16|0;g=f;do if((a|0)!=(b|0)){h=pd()|0;j=c[h>>2]|0;c[h>>2]=0;k=tw(a,g,e,Ps()|0)|0;l=G;m=c[h>>2]|0;if(!m)c[h>>2]=j;if((c[g>>2]|0)!=(b|0)){c[d>>2]=4;n=0;o=0;break}if((m|0)==34){c[d>>2]=4;m=(l|0)>0|(l|0)==0&k>>>0>0;G=m?2147483647:-2147483648;i=f;return (m?-1:0)|0}else{n=l;o=k}}else{c[d>>2]=4;n=0;o=0}while(0);G=n;i=f;return o|0}function Um(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;i=i+16|0;h=g;do if((b|0)!=(d|0)){if((a[b>>0]|0)==45){c[e>>2]=4;j=0;break}k=pd()|0;l=c[k>>2]|0;c[k>>2]=0;m=fw(b,h,f,Ps()|0)|0;n=G;o=c[k>>2]|0;if(!o)c[k>>2]=l;if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;break}if(n>>>0>0|(n|0)==0&m>>>0>65535|(o|0)==34){c[e>>2]=4;j=-1;break}else{j=m&65535;break}}else{c[e>>2]=4;j=0}while(0);i=g;return j|0}function Wm(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;i=i+16|0;h=g;do if((b|0)!=(d|0)){if((a[b>>0]|0)==45){c[e>>2]=4;j=0;break}k=pd()|0;l=c[k>>2]|0;c[k>>2]=0;m=fw(b,h,f,Ps()|0)|0;n=G;o=c[k>>2]|0;if(!o)c[k>>2]=l;if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;break}if(n>>>0>0|(n|0)==0&m>>>0>4294967295|(o|0)==34){c[e>>2]=4;j=-1;break}else{j=m;break}}else{c[e>>2]=4;j=0}while(0);i=g;return j|0}function en(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0;e=i;i=i+16|0;f=e+8|0;if(!a){g=Cj(24010,e)|0;i=e;return g|0}h=(b|0)!=0;if(h?(c[b>>2]|0)!=(1<<(d[a+8>>0]|0)|0):0){g=Cj(24057,f)|0;i=e;return g|0}f=a+4|0;a=c[f>>2]|0;if((a|0)==(b|0)){g=0;i=e;return g|0}if((a|0)!=0?(j=a+12|0,k=c[j>>2]|0,c[j>>2]=k+-1,(k|0)<=1):0){qB(c[a+4>>2]|0);qB(a)}c[f>>2]=b;if(!h){g=0;i=e;return g|0}h=b+12|0;c[h>>2]=(c[h>>2]|0)+1;g=0;i=e;return g|0}function Vm(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;i=i+16|0;h=g;do if((b|0)!=(d|0)){if((a[b>>0]|0)==45){c[e>>2]=4;j=0;break}k=pd()|0;l=c[k>>2]|0;c[k>>2]=0;m=fw(b,h,f,Ps()|0)|0;n=G;o=c[k>>2]|0;if(!o)c[k>>2]=l;if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;break}if(n>>>0>0|(n|0)==0&m>>>0>4294967295|(o|0)==34){c[e>>2]=4;j=-1;break}else{j=m;break}}else{c[e>>2]=4;j=0}while(0);i=g;return j|0}function gn(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;e=i;i=i+16|0;f=e+8|0;g=e;if(((b|0)!=0?(d|0)!=0&(a[b>>0]|0)!=0:0)?(a[d>>0]|0)!=0:0){h=be(b|0,d|0)|0;if(!h){c[f>>2]=b;Cj(23758,f)|0;j=0;i=e;return j|0}f=iB(36)|0;if(!f){Fp(0)|0;j=f;i=e;return j|0}else{c[f>>2]=93;c[f+4>>2]=6;c[f+8>>2]=7;c[f+12>>2]=8;c[f+16>>2]=94;c[f+28>>2]=h;c[f+24>>2]=1;c[f+20>>2]=2;j=f;i=e;return j|0}}Cj(23711,g)|0;j=0;i=e;return j|0}function Xk(b){b=b|0;if((a[2536]|0)==0?(Va(2536)|0)!=0:0){if((a[2544]|0)==0?(Va(2544)|0)!=0:0){b=19096;do{c[b>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;b=b+12|0}while((b|0)!=19264);Fb(303,0,n|0)|0;cc(2544)}vs(19096,33805)|0;vs(19108,33812)|0;vs(19120,33819)|0;vs(19132,33827)|0;vs(19144,33837)|0;vs(19156,33846)|0;vs(19168,33853)|0;vs(19180,33862)|0;vs(19192,33866)|0;vs(19204,33870)|0;vs(19216,33874)|0;vs(19228,33878)|0;vs(19240,33882)|0;vs(19252,33886)|0;c[4816]=19096;cc(2536)}return c[4816]|0}function Wk(b){b=b|0;if((a[2552]|0)==0?(Va(2552)|0)!=0:0){if((a[2560]|0)==0?(Va(2560)|0)!=0:0){b=19268;do{c[b>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;b=b+12|0}while((b|0)!=19436);Fb(304,0,n|0)|0;cc(2560)}As(19268,19436)|0;As(19280,19464)|0;As(19292,19492)|0;As(19304,19524)|0;As(19316,19564)|0;As(19328,19600)|0;As(19340,19628)|0;As(19352,19664)|0;As(19364,19680)|0;As(19376,19696)|0;As(19388,19712)|0;As(19400,19728)|0;As(19412,19744)|0;As(19424,19760)|0;c[4944]=19268;cc(2552)}return c[4944]|0}function mn(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;b=i;i=i+16|0;d=b+8|0;e=b;f=a+36|0;g=a+40|0;h=d+8|0;j=d;k=a+32|0;a:while(1){a=c[f>>2]|0;l=Cf[c[(c[a>>2]|0)+20>>2]&31](a,c[g>>2]|0,d,h,e)|0;a=(c[e>>2]|0)-j|0;if((Tc(d|0,1,a|0,c[k>>2]|0)|0)!=(a|0)){m=-1;break}switch(l|0){case 1:break;case 2:{m=-1;break a;break}default:{n=4;break a}}}if((n|0)==4)m=((re(c[k>>2]|0)|0)!=0)<<31>>31;i=b;return m|0}function ln(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;b=i;i=i+16|0;d=b+8|0;e=b;f=a+36|0;g=a+40|0;h=d+8|0;j=d;k=a+32|0;a:while(1){a=c[f>>2]|0;l=Cf[c[(c[a>>2]|0)+20>>2]&31](a,c[g>>2]|0,d,h,e)|0;a=(c[e>>2]|0)-j|0;if((Tc(d|0,1,a|0,c[k>>2]|0)|0)!=(a|0)){m=-1;break}switch(l|0){case 1:break;case 2:{m=-1;break a;break}default:{n=4;break a}}}if((n|0)==4)m=((re(c[k>>2]|0)|0)!=0)<<31>>31;i=b;return m|0}function Ym(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;i=i+16|0;h=g;do if((b|0)!=(d|0)){if((a[b>>0]|0)==45){c[e>>2]=4;j=0;k=0;break}l=pd()|0;m=c[l>>2]|0;c[l>>2]=0;n=fw(b,h,f,Ps()|0)|0;o=c[l>>2]|0;if(!o)c[l>>2]=m;if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;k=0;break}if((o|0)==34){c[e>>2]=4;j=-1;k=-1}else{j=G;k=n}}else{c[e>>2]=4;j=0;k=0}while(0);G=j;i=g;return k|0}function Bn(a,b){a=+a;b=b|0;var d=0.0,e=0,f=0,g=0,i=0.0;if((b|0)>1023){d=a*89884656743115795.0e291;e=b+-1023|0;if((e|0)>1023){f=b+-2046|0;g=(f|0)>1023?1023:f;i=d*89884656743115795.0e291}else{g=e;i=d}}else if((b|0)<-1022){d=a*2.2250738585072014e-308;e=b+1022|0;if((e|0)<-1022){f=b+2044|0;g=(f|0)<-1022?-1022:f;i=d*2.2250738585072014e-308}else{g=e;i=d}}else{g=b;i=a}b=Es(g+1023|0,0,52)|0;g=G;c[k>>2]=b;c[k+4>>2]=g;return +(i*+h[k>>3])}function _m(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0;h=i;i=i+16|0;j=h;c[g>>2]=e;e=Tb(c[b+8>>2]|0)|0;b=tn(j,0,d)|0;if(e)Tb(e|0)|0;switch(b|0){case 0:case -1:{k=2;break}default:{e=b+-1|0;if(e>>>0<=(f-(c[g>>2]|0)|0)>>>0)if(!e)k=0;else{f=e;e=j;while(1){j=a[e>>0]|0;b=c[g>>2]|0;c[g>>2]=b+1;a[b>>0]=j;f=f+-1|0;if(!f){k=0;break}else e=e+1|0}}else k=1}}i=h;return k|0}function xn(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;a:do if((e|0)==(f|0)){g=c;h=6}else{b=e;i=c;while(1){if((i|0)==(d|0)){j=-1;break a}k=a[i>>0]|0;l=a[b>>0]|0;if(k<<24>>24<l<<24>>24){j=-1;break a}if(l<<24>>24<k<<24>>24){j=1;break a}k=i+1|0;b=b+1|0;if((b|0)==(f|0)){g=k;h=6;break}else i=k}}while(0);if((h|0)==6)j=(g|0)!=(d|0)&1;return j|0}function Xm(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;if(d){f=a[b>>0]|0;if(!(f&1)){g=10;h=f}else{f=c[b>>2]|0;g=(f&-2)+-1|0;h=f&255}if(!(h&1))i=(h&255)>>>1;else i=c[b+4>>2]|0;if((g-i|0)>>>0<d>>>0){cn(b,g,d-g+i|0,i,i,0,0);j=a[b>>0]|0}else j=h;if(!(j&1))k=b+1|0;else k=c[b+8>>2]|0;Cp(k+i|0,e|0,d|0)|0;e=i+d|0;if(!(a[b>>0]&1))a[b>>0]=e<<1;else c[b+4>>2]=e;a[k+e>>0]=0}return b|0}function hn(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;do if((b|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)==(e|0)?(g=d+28|0,(c[g>>2]|0)!=1):0)c[g>>2]=f}else if((b|0)==(c[d>>2]|0)){if((c[d+16>>2]|0)!=(e|0)?(g=d+20|0,(c[g>>2]|0)!=(e|0)):0){c[d+32>>2]=f;c[g>>2]=e;g=d+40|0;c[g>>2]=(c[g>>2]|0)+1;if((c[d+36>>2]|0)==1?(c[d+24>>2]|0)==2:0)a[d+54>>0]=1;c[d+44>>2]=4;break}if((f|0)==1)c[d+32>>2]=1}while(0);return}function $m(b,d,e,f,g,h,i){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0;if((1073741807-d|0)>>>0<e>>>0)Ew(b);if(!(a[b>>0]&1))j=b+4|0;else j=c[b+8>>2]|0;if(d>>>0<536870887){k=e+d|0;e=d<<1;l=k>>>0<e>>>0?e:k;m=l>>>0<2?2:l+4&-4}else m=1073741807;l=Gp(m<<2)|0;if(g)Jq(l,j,g)|0;k=f-h|0;if((k|0)!=(g|0))Jq(l+(i+g<<2)|0,j+(h+g<<2)|0,k-g|0)|0;if((d|0)!=1)wB(j);c[b+8>>2]=l;c[b>>2]=m|1;return}function un(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=a+12|0;f=a+16|0;a:do if((d|0)>0){g=b;h=0;while(1){i=c[e>>2]|0;if(i>>>0>=(c[f>>2]|0)>>>0){j=Af[c[(c[a>>2]|0)+40>>2]&127](a)|0;if((j|0)==-1){k=h;break a}else l=j}else{c[e>>2]=i+4;l=c[i>>2]|0}c[g>>2]=l;i=h+1|0;if((i|0)<(d|0)){g=g+4|0;h=i}else{k=i;break}}}else k=0;while(0);return k|0}function Ln(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;a:do if((e|0)==(f|0)){g=b;h=6}else{a=e;i=b;while(1){if((i|0)==(d|0)){j=-1;break a}k=c[i>>2]|0;l=c[a>>2]|0;if((k|0)<(l|0)){j=-1;break a}if((l|0)<(k|0)){j=1;break a}k=i+4|0;a=a+4|0;if((a|0)==(f|0)){g=k;h=6;break}else i=k}}while(0);if((h|0)==6)j=(g|0)!=(d|0)&1;return j|0}function yn(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;a:do switch(c[e+4>>2]&176|0){case 16:{f=a[b>>0]|0;switch(f<<24>>24){case 43:case 45:{g=b+1|0;break a;break}default:{}}if((d-b|0)>1&f<<24>>24==48){switch(a[b+1>>0]|0){case 88:case 120:break;default:{h=7;break a}}g=b+2|0}else h=7;break}case 32:{g=d;break}default:h=7}while(0);if((h|0)==7)g=b;return g|0}function wn(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0;f=b+12|0;g=b+16|0;a:do if((e|0)>0){h=d;i=0;while(1){j=c[f>>2]|0;if(j>>>0<(c[g>>2]|0)>>>0){c[f>>2]=j+1;k=a[j>>0]|0}else{j=Af[c[(c[b>>2]|0)+40>>2]&127](b)|0;if((j|0)==-1){l=i;break a}k=j&255}a[h>>0]=k;j=i+1|0;if((j|0)<(e|0)){h=h+1|0;i=j}else{l=j;break}}}else l=0;while(0);return l|0}function fn(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;e=a[b>>0]|0;f=(e&1)!=0;if(f){g=(c[b>>2]&-2)+-1|0;h=c[b+4>>2]|0}else{g=1;h=(e&255)>>>1}if((h|0)==(g|0)){$m(b,g,1,g,g,0,0);if(!(a[b>>0]&1))i=7;else i=8}else if(f)i=8;else i=7;if((i|0)==7){a[b>>0]=(h<<1)+2;j=b+4|0;k=h+1|0}else if((i|0)==8){i=c[b+8>>2]|0;f=h+1|0;c[b+4>>2]=f;j=i;k=f}c[j+(h<<2)>>2]=d;c[j+(k<<2)>>2]=0;return}function In(a,b){a=+a;b=b|0;var d=0,e=0,f=0,g=0,i=0.0,j=0.0,l=0,m=0.0;h[k>>3]=a;d=c[k>>2]|0;e=c[k+4>>2]|0;f=Gs(d|0,e|0,52)|0;g=f&2047;switch(g|0){case 0:{if(a!=0.0){i=+In(a*18446744073709552.0e3,b);j=i;l=(c[b>>2]|0)+-64|0}else{j=a;l=0}c[b>>2]=l;m=j;return +m}case 2047:{m=a;return +m}default:{c[b>>2]=g+-1022;c[k>>2]=d;c[k+4>>2]=e&-2146435073|1071644672;m=+h[k>>3];return +m}}return +(0.0)}function Lm(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0;e=i;i=i+16|0;f=e;eq(f,b);a:do if(a[f>>0]|0){g=c[b+((c[(c[b>>2]|0)+-12>>2]|0)+24)>>2]|0;h=g;do if(g){j=h+24|0;k=c[j>>2]|0;if((k|0)==(c[h+28>>2]|0))if((Nf[c[(c[g>>2]|0)+52>>2]&31](h,d&255)|0)==-1)break;else break a;else{c[j>>2]=k+1;a[k>>0]=d;break a}}while(0);h=b+((c[(c[b>>2]|0)+-12>>2]|0)+16)|0;c[h>>2]=c[h>>2]|1}while(0);ao(f);i=e;return b|0}function co(b){b=b|0;var e=0,f=0,g=0;if((a[(c[b+4>>2]|0)+8>>0]|0)!=1){e=0;return e|0}f=c[b+52>>2]|0;b=c[(c[f>>2]|0)+4>>2]|0;if((d[b+8>>0]|0)<8)g=0;else g=d[b+9>>0]|0;switch(c[f+68>>2]&-28673|0){case 0:{e=c[5536+(g<<2)>>2]|0;return e|0}case 256:{e=c[5556+(g<<2)>>2]|0;return e|0}case 18:{e=g>>>0>1?245:0;return e|0}case 274:{e=g>>>0>1?246:0;return e|0}default:{e=0;return e|0}}return 0}function cn(b,d,e,f,g,h,i){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0;if((-17-d|0)>>>0<e>>>0)Ew(b);if(!(a[b>>0]&1))j=b+1|0;else j=c[b+8>>2]|0;if(d>>>0<2147483623){k=e+d|0;e=d<<1;l=k>>>0<e>>>0?e:k;m=l>>>0<11?11:l+16&-16}else m=-17;l=Gp(m)|0;if(g)dp(l|0,j|0,g|0)|0;k=f-h|0;if((k|0)!=(g|0))dp(l+(i+g)|0,j+(h+g)|0,k-g|0)|0;if((d|0)!=10)wB(j);c[b+8>>2]=l;c[b>>2]=m|1;return}function kn(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0;e=i;i=i+64|0;f=e;if((a|0)!=(b|0))if((b|0)!=0?(g=Hl(b,816,832,0)|0,(g|0)!=0):0){b=f;h=b+56|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(h|0));c[f>>2]=g;c[f+8>>2]=a;c[f+12>>2]=-1;c[f+48>>2]=1;Wf[c[(c[g>>2]|0)+28>>2]&63](g,f,c[d>>2]|0,1);if((c[f+24>>2]|0)==1){c[d>>2]=c[f+16>>2];j=1}else j=0;k=j}else k=0;else k=1;i=e;return k|0}function jn(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;e=a[b>>0]|0;f=(e&1)!=0;if(f){g=(c[b>>2]&-2)+-1|0;h=c[b+4>>2]|0}else{g=10;h=(e&255)>>>1}if((h|0)==(g|0)){cn(b,g,1,g,g,0,0);if(!(a[b>>0]&1))i=7;else i=8}else if(f)i=8;else i=7;if((i|0)==7){a[b>>0]=(h<<1)+2;j=b+1|0;k=h+1|0}else if((i|0)==8){i=c[b+8>>2]|0;f=h+1|0;c[b+4>>2]=f;j=i;k=f}a[j+h>>0]=d;a[j+k>>0]=0;return}function Dn(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0;g=b+24|0;h=b+28|0;a:do if((f|0)>0){i=e;j=0;while(1){k=c[g>>2]|0;if(k>>>0>=(c[h>>2]|0)>>>0){if((Nf[c[(c[b>>2]|0)+52>>2]&31](b,d[i>>0]|0)|0)==-1){l=j;break a}}else{m=a[i>>0]|0;c[g>>2]=k+1;a[k>>0]=m}m=j+1|0;if((m|0)<(f|0)){i=i+1|0;j=m}else{l=m;break}}}else l=0;while(0);return l|0}function Cn(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;e=a+24|0;f=a+28|0;a:do if((d|0)>0){g=b;h=0;while(1){i=c[e>>2]|0;if(i>>>0>=(c[f>>2]|0)>>>0){if((Nf[c[(c[a>>2]|0)+52>>2]&31](a,c[g>>2]|0)|0)==-1){j=h;break a}}else{k=c[g>>2]|0;c[e>>2]=i+4;c[i>>2]=k}k=h+1|0;if((k|0)<(d|0)){g=g+4|0;h=k}else{j=k;break}}}else j=0;while(0);return j|0}function bn(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;f=a[b>>0]|0;if(!(f&1)){g=10;h=f}else{f=c[b>>2]|0;g=(f&-2)+-1|0;h=f&255}f=(h&1)==0;do if(g>>>0>=e>>>0){if(f)i=b+1|0;else i=c[b+8>>2]|0;wq(i|0,d|0,e|0)|0;a[i+e>>0]=0;if(!(a[b>>0]&1)){a[b>>0]=e<<1;break}else{c[b+4>>2]=e;break}}else{if(f)j=(h&255)>>>1;else j=c[b+4>>2]|0;Im(b,g,e-g|0,j,0,j,e,d)}while(0);return b|0}function tm(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;d=i;i=i+32|0;e=d;f=c[a+8>>2]|0;g=c[a+4>>2]|0;if(f-g>>2>>>0<b>>>0){h=c[a>>2]|0;j=g-h>>2;g=j+b|0;if(g>>>0>1073741823)Jw(a);k=f-h|0;if(k>>2>>>0<536870911){h=k>>1;l=h>>>0<g>>>0?g:h}else l=1073741823;hp(e,l,j,a+16|0);j=e+8|0;l=c[j>>2]|0;Cp(l|0,0,b<<2|0)|0;c[j>>2]=l+(b<<2);On(a,e);fp(e)}else Eq(a,b);i=d;return}function dn(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;f=a[b>>0]|0;if(!(f&1)){g=1;h=f}else{f=c[b>>2]|0;g=(f&-2)+-1|0;h=f&255}f=(h&1)==0;do if(g>>>0>=e>>>0){if(f)i=b+4|0;else i=c[b+8>>2]|0;Wo(i,d,e)|0;c[i+(e<<2)>>2]=0;if(!(a[b>>0]&1)){a[b>>0]=e<<1;break}else{c[b+4>>2]=e;break}}else{if(f)j=(h&255)>>>1;else j=c[b+4>>2]|0;Dm(b,g,e-g|0,j,0,j,e,d)}while(0);return b|0}function Om(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;j=i;i=i+16|0;k=j+12|0;l=j+8|0;m=j+4|0;n=j;o=b+8|0;p=Af[c[(c[o>>2]|0)+20>>2]&127](o)|0;c[m>>2]=c[d>>2];c[n>>2]=c[e>>2];e=a[p>>0]|0;d=(e&1)==0;o=p+4|0;q=d?o:c[p+8>>2]|0;p=q+((d?(e&255)>>>1:c[o>>2]|0)<<2)|0;c[l>>2]=c[m>>2];c[k>>2]=c[n>>2];n=Ig(b,l,k,f,g,h,q,p)|0;i=j;return n|0}function Sm(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;j=i;i=i+16|0;k=j+12|0;l=j+8|0;m=j+4|0;n=j;o=b+8|0;p=Af[c[(c[o>>2]|0)+20>>2]&127](o)|0;c[m>>2]=c[d>>2];c[n>>2]=c[e>>2];e=a[p>>0]|0;d=(e&1)==0;o=d?p+1|0:c[p+8>>2]|0;q=o+(d?(e&255)>>>1:c[p+4>>2]|0)|0;c[l>>2]=c[m>>2];c[k>>2]=c[n>>2];n=Jg(b,l,k,f,g,h,o,q)|0;i=j;return n|0}function rn(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;e=a+4|0;f=(c[e>>2]|0)!=300;g=c[a>>2]|0;h=g;i=(c[d>>2]|0)-h|0;j=i>>>0<2147483647?i<<1:-1;i=(c[b>>2]|0)-h>>2;h=ap(f?g:0,j)|0;if(!h)Iv();if(!f){f=c[a>>2]|0;c[a>>2]=h;if(!f)k=h;else{xf[c[e>>2]&511](f);k=c[a>>2]|0}}else{c[a>>2]=h;k=h}c[e>>2]=311;c[b>>2]=k+(i<<2);c[d>>2]=(c[a>>2]|0)+(j>>>2<<2);return}function qn(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;e=a+4|0;f=(c[e>>2]|0)!=300;g=c[a>>2]|0;h=g;i=(c[d>>2]|0)-h|0;j=i>>>0<2147483647?i<<1:-1;i=(c[b>>2]|0)-h>>2;h=ap(f?g:0,j)|0;if(!h)Iv();if(!f){f=c[a>>2]|0;c[a>>2]=h;if(!f)k=h;else{xf[c[e>>2]&511](f);k=c[a>>2]|0}}else{c[a>>2]=h;k=h}c[e>>2]=311;c[b>>2]=k+(i<<2);c[d>>2]=(c[a>>2]|0)+(j>>>2<<2);return}function nn(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;f=d;g=e-f|0;h=g>>2;if(h>>>0>1073741807)Ew(b);if(h>>>0<2){a[b>>0]=g>>>1;i=b+4|0}else{g=h+4&-4;j=Gp(g<<2)|0;c[b+8>>2]=j;c[b>>2]=g|1;c[b+4>>2]=h;i=j}j=(e-f|0)>>>2;if((d|0)!=(e|0)){f=d;d=i;while(1){c[d>>2]=c[f>>2];f=f+4|0;if((f|0)==(e|0))break;else d=d+4|0}}c[i+(j<<2)>>2]=0;return}function vn(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;e=a+4|0;f=(c[e>>2]|0)!=300;g=c[a>>2]|0;h=g;i=(c[d>>2]|0)-h|0;j=i>>>0<2147483647?i<<1:-1;i=(c[b>>2]|0)-h|0;h=ap(f?g:0,j)|0;if(!h)Iv();if(!f){f=c[a>>2]|0;c[a>>2]=h;if(!f)k=h;else{xf[c[e>>2]&511](f);k=c[a>>2]|0}}else{c[a>>2]=h;k=h}c[e>>2]=311;c[b>>2]=k+i;c[d>>2]=(c[a>>2]|0)+j;return}function _n(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=f|0;h=b>>31|((b|0)<0?-1:0)<<1;j=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;k=e>>31|((e|0)<0?-1:0)<<1;l=((e|0)<0?-1:0)>>31|((e|0)<0?-1:0)<<1;m=Fs(h^a,j^b,h,j)|0;b=G;Dh(m,b,Fs(k^d,l^e,k,l)|0,G,g)|0;l=Fs(c[g>>2]^h,c[g+4>>2]^j,h,j)|0;j=G;i=f;return (G=j,l)|0}function gp(a){a=a|0;var b=0,e=0,f=0;b=c[a+52>>2]|0;a=c[(c[b>>2]|0)+4>>2]|0;if((d[a+8>>0]|0)<8)e=0;else e=d[a+9>>0]|0;switch(c[b+68>>2]&-28673|0){case 0:{f=c[5576+(e<<2)>>2]|0;return f|0}case 256:{f=c[5596+(e<<2)>>2]|0;return f|0}case 18:{f=e>>>0>1?247:0;return f|0}case 274:{f=e>>>0>1?248:0;return f|0}default:{f=0;return f|0}}return 0}function sn(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;f=d;g=e-f|0;if(g>>>0>4294967279)Ew(b);if(g>>>0<11){a[b>>0]=g<<1;h=b+1|0}else{i=g+16&-16;j=Gp(i)|0;c[b+8>>2]=j;c[b>>2]=i|1;c[b+4>>2]=g;h=j}j=e-f|0;if((d|0)!=(e|0)){f=d;d=h;while(1){a[d>>0]=a[f>>0]|0;f=f+1|0;if((f|0)==(e|0))break;else d=d+1|0}}a[h+j>>0]=0;return}function cp(){}function dp(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((e|0)>=4096)return lb(b|0,d|0,e|0)|0;f=b|0;if((b&3)==(d&3)){while(b&3){if(!e)return f|0;a[b>>0]=a[d>>0]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b>>0]=a[d>>0]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function Wo(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=(d|0)==0;if(a-b>>2>>>0<d>>>0){if(e)return a|0;else f=d;do{f=f+-1|0;c[a+(f<<2)>>2]=c[b+(f<<2)>>2]}while((f|0)!=0);return a|0}else{if(e)return a|0;else{g=b;h=a;i=d}while(1){i=i+-1|0;c[h>>2]=c[g>>2];if(!i)break;else{g=g+4|0;h=h+4|0}}return a|0}return 0}function Jm(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;i=i+16|0;f=e;g=c[b>>2]|0;if(!g)_a(22389,22399,177,22524);b=(Js(g,(a[d>>0]&1)==0?d+1|0:c[d+8>>2]|0)|0)!=0;if(b){i=e;return b|0}d=Sh()|0;g=ql(15752,d,Xw(d|0)|0)|0;c[f>>2]=Hs(g+(c[(c[g>>2]|0)+-12>>2]|0)|0)|0;d=Ds(f,18276)|0;h=Nf[c[(c[d>>2]|0)+28>>2]&31](d,10)|0;Ww(f);Lm(g,h)|0;Wn(g)|0;i=e;return b|0}function ao(a){a=a|0;var b=0,d=0;b=a+4|0;a=c[b>>2]|0;d=c[(c[a>>2]|0)+-12>>2]|0;if(((((c[a+(d+24)>>2]|0)!=0?(c[a+(d+16)>>2]|0)==0:0)?(c[a+(d+4)>>2]&8192|0)!=0:0)?!(bb()|0):0)?(d=c[b>>2]|0,a=c[d+((c[(c[d>>2]|0)+-12>>2]|0)+24)>>2]|0,(Af[c[(c[a>>2]|0)+24>>2]&127](a)|0)==-1):0){a=c[b>>2]|0;b=a+((c[(c[a>>2]|0)+-12>>2]|0)+16)|0;c[b>>2]=c[b>>2]|1}return}function Jo(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0.0,j=0;d=i;i=i+112|0;e=d;f=e;g=f+112|0;do{c[f>>2]=0;f=f+4|0}while((f|0)<(g|0));f=e+4|0;c[f>>2]=a;g=e+8|0;c[g>>2]=-1;c[e+44>>2]=a;c[e+76>>2]=-1;Iq(e,0);h=+$f(e,2,1);j=(c[f>>2]|0)-(c[g>>2]|0)+(c[e+108>>2]|0)|0;if(!b){i=d;return +h}c[b>>2]=(j|0)!=0?a+j|0:a;i=d;return +h}function $n(a){a=a|0;var b=0,d=0;b=a+4|0;a=c[b>>2]|0;d=c[(c[a>>2]|0)+-12>>2]|0;if(((((c[a+(d+24)>>2]|0)!=0?(c[a+(d+16)>>2]|0)==0:0)?(c[a+(d+4)>>2]&8192|0)!=0:0)?!(bb()|0):0)?(d=c[b>>2]|0,a=c[d+((c[(c[d>>2]|0)+-12>>2]|0)+24)>>2]|0,(Af[c[(c[a>>2]|0)+24>>2]&127](a)|0)==-1):0){a=c[b>>2]|0;b=a+((c[(c[a>>2]|0)+-12>>2]|0)+16)|0;c[b>>2]=c[b>>2]|1}return}function ap(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;if(!a){d=_f(b)|0;return d|0}if(b>>>0>4294967231){c[(pd()|0)>>2]=12;d=0;return d|0}e=$g(a+-8|0,b>>>0<11?16:b+11&-8)|0;if(e){d=e+8|0;return d|0}e=_f(b)|0;if(!e){d=0;return d|0}f=c[a+-4>>2]|0;g=(f&-8)-((f&3|0)==0?8:4)|0;dp(e|0,a|0,(g>>>0<b>>>0?g:b)|0)|0;yg(a);d=e;return d|0}function Yo(b){b=b|0;var d=0,e=0,f=0,g=0;d=b+74|0;e=a[d>>0]|0;a[d>>0]=e+255|e;e=b+20|0;d=b+44|0;if((c[e>>2]|0)>>>0>(c[d>>2]|0)>>>0)Ef[c[b+36>>2]&31](b,0,0)|0;c[b+16>>2]=0;c[b+28>>2]=0;c[e>>2]=0;e=c[b>>2]|0;if(!(e&20)){f=c[d>>2]|0;c[b+8>>2]=f;c[b+4>>2]=f;g=0;return g|0}if(!(e&4)){g=-1;return g|0}c[b>>2]=e|32;g=-1;return g|0}function Qn(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0.0,k=0,l=0.0;e=i;i=i+16|0;f=e;do if((a|0)!=(b|0)){g=pd()|0;h=c[g>>2]|0;c[g>>2]=0;j=+Jo(a,f,Ps()|0);k=c[g>>2]|0;if(!k)c[g>>2]=h;if((c[f>>2]|0)!=(b|0)){c[d>>2]=4;l=0.0;break}if((k|0)==34){c[d>>2]=4;l=j}else l=j}else{c[d>>2]=4;l=0.0}while(0);i=e;return +l}function Pn(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0.0,k=0,l=0.0;e=i;i=i+16|0;f=e;do if((a|0)!=(b|0)){g=pd()|0;h=c[g>>2]|0;c[g>>2]=0;j=+Jo(a,f,Ps()|0);k=c[g>>2]|0;if(!k)c[g>>2]=h;if((c[f>>2]|0)!=(b|0)){c[d>>2]=4;l=0.0;break}if((k|0)==34){c[d>>2]=4;l=j}else l=j}else{c[d>>2]=4;l=0.0}while(0);i=e;return +l}function On(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=c[a>>2]|0;e=a+4|0;f=b+4|0;g=(c[e>>2]|0)-d|0;h=(c[f>>2]|0)+(0-(g>>2)<<2)|0;c[f>>2]=h;dp(h|0,d|0,g|0)|0;g=c[a>>2]|0;c[a>>2]=c[f>>2];c[f>>2]=g;g=b+8|0;d=c[e>>2]|0;c[e>>2]=c[g>>2];c[g>>2]=d;d=a+8|0;a=b+12|0;g=c[d>>2]|0;c[d>>2]=c[a>>2];c[a>>2]=g;c[b>>2]=c[f>>2];return}function mo(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=i;i=i+16|0;d=b;if((a|0)<1){c[d>>2]=24002;Cj(24164,d)|0;e=0;i=b;return e|0}d=iB(16)|0;if(!d){Fp(0)|0;e=0;i=b;return e|0}f=a<<2;g=iB(f)|0;c[d+4>>2]=g;if(!g){qB(d);e=0;i=b;return e|0}else{c[d>>2]=a;c[d+8>>2]=1;c[d+12>>2]=1;Fw(g,255,f)|0;e=d;i=b;return e|0}return 0}function no(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0;e=i;i=i+16|0;f=e;g=_f(240)|0;do if(g){c[f>>2]=c[d>>2];h=Em(g,240,b,f)|0;if(h>>>0<240){j=ap(g,h+1|0)|0;c[a>>2]=(j|0)!=0?j:g;k=h;break}yg(g);if((h|0)>=0?(j=h+1|0,h=_f(j)|0,c[a>>2]=h,(h|0)!=0):0)k=Em(h,j,b,d)|0;else k=-1}else k=-1;while(0);i=e;return k|0}function op(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;if(!d){e=0;return e|0}else{f=d;g=b;h=c}while(1){c=a[g>>0]|0;b=a[h>>0]|0;if(c<<24>>24!=b<<24>>24){i=c;j=b;break}f=f+-1|0;if(!f){e=0;k=5;break}else{g=g+1|0;h=h+1|0}}if((k|0)==5)return e|0;e=(i&255)-(j&255)|0;return e|0}function Xo(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;e=i;i=i+112|0;f=e;c[f>>2]=0;g=f+4|0;c[g>>2]=a;c[f+44>>2]=a;h=f+8|0;c[h>>2]=(a|0)<0?-1:a+2147483647|0;c[f+76>>2]=-1;Iq(f,0);j=Dg(f,d,1,0,-2147483648)|0;d=G;if(!b){G=d;i=e;return j|0}c[b>>2]=a+((c[g>>2]|0)+(c[f+108>>2]|0)-(c[h>>2]|0));G=d;i=e;return j|0}function Zn(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0.0,h=0,j=0,k=0.0,l=0;e=i;i=i+16|0;f=e;do if((a|0)==(b|0)){c[d>>2]=4;g=0.0}else{h=pd()|0;j=c[h>>2]|0;c[h>>2]=0;k=+Jo(a,f,Ps()|0);l=c[h>>2]|0;if(!l)c[h>>2]=j;if((c[f>>2]|0)!=(b|0)){c[d>>2]=4;g=0.0;break}if((l|0)==34)c[d>>2]=4;g=k}while(0);i=e;return +g}function To(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0;a:do if(!(a[b+44>>0]|0))if((f|0)>0){g=e;h=0;while(1){if((Nf[c[(c[b>>2]|0)+52>>2]&31](b,d[g>>0]|0)|0)==-1){i=h;break a}j=h+1|0;if((j|0)<(f|0)){g=g+1|0;h=j}else{i=j;break}}}else i=0;else i=Tc(e|0,1,f|0,c[b+32>>2]|0)|0;while(0);return i|0}function So(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;a:do if(!(a[b+44>>0]|0))if((e|0)>0){f=d;g=0;while(1){if((Nf[c[(c[b>>2]|0)+52>>2]&31](b,c[f>>2]|0)|0)==-1){h=g;break a}i=g+1|0;if((i|0)<(e|0)){f=f+4|0;g=i}else{h=i;break}}}else h=0;else h=Tc(d|0,4,e|0,c[b+32>>2]|0)|0;while(0);return h|0}function _o(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;e=i;i=i+112|0;f=e;c[f>>2]=0;g=f+4|0;c[g>>2]=a;c[f+44>>2]=a;h=f+8|0;c[h>>2]=(a|0)<0?-1:a+2147483647|0;c[f+76>>2]=-1;Iq(f,0);j=Dg(f,d,1,-1,-1)|0;d=G;if(!b){G=d;i=e;return j|0}c[b>>2]=a+((c[g>>2]|0)+(c[f+108>>2]|0)-(c[h>>2]|0));G=d;i=e;return j|0}function pn(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0;h=i;i=i+16|0;j=h;k=Hs(d)|0;c[j>>2]=k;d=Ds(j,18276)|0;Pf[c[(c[d>>2]|0)+32>>2]&15](d,32305,32337,e)|0;e=Ds(j,18416)|0;a[f>>0]=Af[c[(c[e>>2]|0)+12>>2]&127](e)|0;a[g>>0]=Af[c[(c[e>>2]|0)+16>>2]&127](e)|0;yf[c[(c[e>>2]|0)+20>>2]&127](b,e);lr(k)|0;i=h;return}function on(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0;g=i;i=i+16|0;h=g;j=Hs(b)|0;c[h>>2]=j;b=Ds(h,18268)|0;Pf[c[(c[b>>2]|0)+48>>2]&15](b,32305,32337,d)|0;d=Ds(h,18424)|0;c[e>>2]=Af[c[(c[d>>2]|0)+12>>2]&127](d)|0;c[f>>2]=Af[c[(c[d>>2]|0)+16>>2]&127](d)|0;yf[c[(c[d>>2]|0)+20>>2]&127](a,d);lr(j)|0;i=g;return}function bo(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+128|0;j=h+16|0;k=h+12|0;l=h;m=h+8|0;c[k>>2]=j+100;lp(a,j,k,e,f,g);g=l;c[g>>2]=0;c[g+4>>2]=0;c[m>>2]=j;j=(c[d>>2]|0)-b>>2;g=Tb(c[a>>2]|0)|0;a=Vg(b,m,j,l)|0;if(g)Tb(g|0)|0;c[d>>2]=b+(a<<2);i=h;return}function pp(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=b>>31|((b|0)<0?-1:0)<<1;f=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;g=d>>31|((d|0)<0?-1:0)<<1;h=((d|0)<0?-1:0)>>31|((d|0)<0?-1:0)<<1;i=Fs(e^a,f^b,e,f)|0;b=G;a=g^e;e=h^f;return Fs((Dh(i,b,Fs(g^c,h^d,g,h)|0,G,0)|0)^a,G^e,a,e)|0}function Cp(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b+e|0;if((e|0)>=20){d=d&255;g=b&3;h=d|d<<8|d<<16|d<<24;i=f&~3;if(g){g=b+4-g|0;while((b|0)<(g|0)){a[b>>0]=d;b=b+1|0}}while((b|0)<(i|0)){c[b>>2]=h;b=b+4|0}}while((b|0)<(f|0)){a[b>>0]=d;b=b+1|0}return b-e|0}function fp(b){b=b|0;var d=0,e=0,f=0,g=0,h=0;d=c[b+4>>2]|0;e=b+8|0;f=c[e>>2]|0;if((f|0)!=(d|0)){g=f;while(1){f=g+-4|0;if((f|0)==(d|0)){h=f;break}else g=f}c[e>>2]=h}h=c[b>>2]|0;do if(h){e=c[b+16>>2]|0;if((e|0)==(h|0)){a[e+112>>0]=0;break}else{wB(h);break}}while(0);return}function Zm(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+16|0;f=e;g=Qr((a[d>>0]&1)==0?d+1|0:c[d+8>>2]|0)|0;c[b>>2]=g;if(g){i=e;return}g=Sh()|0;b=ql(15752,g,Xw(g|0)|0)|0;c[f>>2]=Hs(b+(c[(c[b>>2]|0)+-12>>2]|0)|0)|0;g=Ds(f,18276)|0;d=Nf[c[(c[g>>2]|0)+28>>2]&31](g,10)|0;Ww(f);Lm(b,d)|0;Wn(b)|0;i=e;return}function Wn(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+16|0;e=d;if(c[b+((c[(c[b>>2]|0)+-12>>2]|0)+24)>>2]|0){eq(e,b);if((a[e>>0]|0)!=0?(f=c[b+((c[(c[b>>2]|0)+-12>>2]|0)+24)>>2]|0,(Af[c[(c[f>>2]|0)+24>>2]&127](f)|0)==-1):0){f=b+((c[(c[b>>2]|0)+-12>>2]|0)+16)|0;c[f>>2]=c[f>>2]|1}ao(e)}i=d;return b|0}function Vn(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+16|0;e=d;if(c[b+((c[(c[b>>2]|0)+-12>>2]|0)+24)>>2]|0){dq(e,b);if((a[e>>0]|0)!=0?(f=c[b+((c[(c[b>>2]|0)+-12>>2]|0)+24)>>2]|0,(Af[c[(c[f>>2]|0)+24>>2]&127](f)|0)==-1):0){f=b+((c[(c[b>>2]|0)+-12>>2]|0)+16)|0;c[f>>2]=c[f>>2]|1}$n(e)}i=d;return b|0}function rp(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;a:do if((e|0)==(f|0))g=f;else{a=e;while(1){h=c[a>>2]|0;if(h>>>0>=128){g=a;break a}if(!((b[(c[(wb()|0)>>2]|0)+(h<<1)>>1]&d)<<16>>16)){g=a;break a}a=a+4|0;if((a|0)==(f|0)){g=f;break}}}while(0);return g|0}function an(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;a:do if((b|0)!=(c[d+8>>2]|0)){g=c[b+12>>2]|0;h=b+16+(g<<3)|0;Jp(b+16|0,d,e,f);if((g|0)>1){g=d+54|0;i=b+24|0;do{Jp(i,d,e,f);if(a[g>>0]|0)break a;i=i+8|0}while(i>>>0<h>>>0)}}else ep(0,d,e,f);while(0);return}function Zo(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0;d=a+4|0;e=c[d>>2]|0;f=c[a>>2]|0;g=e-f>>2;if(g>>>0>=b>>>0){if(g>>>0>b>>>0?(h=f+(b<<2)|0,(e|0)!=(h|0)):0){f=e;while(1){e=f+-4|0;if((e|0)==(h|0)){i=e;break}else f=e}c[d>>2]=i}}else tm(a,b-g|0);return}function hp(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;c[b+12>>2]=0;c[b+16>>2]=f;do if(d){g=f+112|0;if(d>>>0<29&(a[g>>0]|0)==0){a[g>>0]=1;h=f;break}else{h=Gp(d<<2)|0;break}}else h=0;while(0);c[b>>2]=h;f=h+(e<<2)|0;c[b+8>>2]=f;c[b+4>>2]=f;c[b+12>>2]=h+(d<<2);return}function Hp(b,c){b=b|0;c=c|0;var d=0,e=0,f=0,g=0;d=a[b>>0]|0;e=a[c>>0]|0;if(d<<24>>24==0?1:d<<24>>24!=e<<24>>24){f=d;g=e}else{e=b;b=c;do{e=e+1|0;b=b+1|0;c=a[e>>0]|0;d=a[b>>0]|0}while(!(c<<24>>24==0?1:c<<24>>24!=d<<24>>24));f=c;g=d}return (f&255)-(g&255)|0}function ep(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;b=d+16|0;g=c[b>>2]|0;do if(g){if((g|0)!=(e|0)){h=d+36|0;c[h>>2]=(c[h>>2]|0)+1;c[d+24>>2]=2;a[d+54>>0]=1;break}h=d+24|0;if((c[h>>2]|0)==2)c[h>>2]=f}else{c[b>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1}while(0);return}function zn(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0;h=i;i=i+16|0;j=h+4|0;k=h;l=a+8|0;a=Af[c[(c[l>>2]|0)+4>>2]&127](l)|0;c[k>>2]=c[e>>2];c[j>>2]=c[k>>2];k=(Sg(d,j,a,a+288|0,g,f,0)|0)-a|0;if((k|0)<288)c[b>>2]=((k|0)/12|0|0)%12|0;i=h;return}function kp(b){b=b|0;var d=0,e=0,f=0,g=0,h=0;d=c[b>>2]|0;do if(d){e=b+4|0;f=c[e>>2]|0;if((f|0)!=(d|0)){g=f;while(1){f=g+-4|0;if((f|0)==(d|0)){h=f;break}else g=f}c[e>>2]=h}if((b+16|0)==(d|0)){a[b+128>>0]=0;break}else{wB(d);break}}while(0);return}function An(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0;h=i;i=i+16|0;j=h+4|0;k=h;l=a+8|0;a=Af[c[(c[l>>2]|0)+4>>2]&127](l)|0;c[k>>2]=c[e>>2];c[j>>2]=c[k>>2];k=(Xg(d,j,a,a+288|0,g,f,0)|0)-a|0;if((k|0)<288)c[b>>2]=((k|0)/12|0|0)%12|0;i=h;return}function lp(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;j=i;i=i+16|0;k=j;a[k>>0]=37;l=k+1|0;a[l>>0]=g;m=k+2|0;a[m>>0]=h;a[k+3>>0]=0;if(h<<24>>24){a[l>>0]=h;a[m>>0]=g}c[e>>2]=d+(we(d|0,(c[e>>2]|0)-d|0,k|0,f|0,c[b>>2]|0)|0);i=j;return}function Kn(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0;h=i;i=i+16|0;j=h+4|0;k=h;l=a+8|0;a=Af[c[c[l>>2]>>2]&127](l)|0;c[k>>2]=c[e>>2];c[j>>2]=c[k>>2];k=(Xg(d,j,a,a+168|0,g,f,0)|0)-a|0;if((k|0)<168)c[b>>2]=((k|0)/12|0|0)%7|0;i=h;return}function Jn(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0;h=i;i=i+16|0;j=h+4|0;k=h;l=a+8|0;a=Af[c[c[l>>2]>>2]&127](l)|0;c[k>>2]=c[e>>2];c[j>>2]=c[k>>2];k=(Sg(d,j,a,a+168|0,g,f,0)|0)-a|0;if((k|0)<168)c[b>>2]=((k|0)/12|0|0)%7|0;i=h;return}function Fp(a){a=a|0;var b=0;b=i;i=i+48|0;switch(a|0){case 0:{Cj(23561,b)|0;break}case 1:{Cj(23575,b+8|0)|0;break}case 2:{Cj(23605,b+16|0)|0;break}case 3:{Cj(23633,b+24|0)|0;break}case 4:{Cj(23661,b+32|0)|0;break}default:Cj(23693,b+40|0)|0}i=b;return -1}function Sn(b){b=b|0;if((a[2600]|0)==0?(Va(2600)|0)!=0:0){if((a[2608]|0)==0?(Va(2608)|0)!=0:0){b=20884;do{c[b>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;b=b+12|0}while((b|0)!=21172);Fb(307,0,n|0)|0;cc(2608)}vs(20884,34020)|0;vs(20896,34023)|0;c[5293]=20884;cc(2600)}return c[5293]|0}function Rn(b){b=b|0;if((a[2616]|0)==0?(Va(2616)|0)!=0:0){if((a[2624]|0)==0?(Va(2624)|0)!=0:0){b=21176;do{c[b>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;b=b+12|0}while((b|0)!=21464);Fb(308,0,n|0)|0;cc(2624)}As(21176,21464)|0;As(21188,21476)|0;c[5372]=21176;cc(2616)}return c[5372]|0}function Dp(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;a:do if((e|0)==(f|0))g=f;else{a=e;while(1){h=c[a>>2]|0;if(h>>>0<128?(b[(c[(wb()|0)>>2]|0)+(h<<1)>>1]&d)<<16>>16!=0:0){g=a;break a}a=a+4|0;if((a|0)==(f|0)){g=f;break}}}while(0);return g|0}function Yn(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0;a=i;i=i+16|0;h=a+4|0;j=a;c[j>>2]=c[e>>2];c[h>>2]=c[j>>2];j=jh(d,h,f,g,4)|0;if(!(c[f>>2]&4)){if((j|0)<69)k=j+2e3|0;else k=(j+-69|0)>>>0<31?j+1900|0:j;c[b>>2]=k+-1900}i=a;return}function Xn(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0;a=i;i=i+16|0;h=a+4|0;j=a;c[j>>2]=c[e>>2];c[h>>2]=c[j>>2];j=bh(d,h,f,g,4)|0;if(!(c[f>>2]&4)){if((j|0)<69)k=j+2e3|0;else k=(j+-69|0)>>>0<31?j+1900|0:j;c[b>>2]=k+-1900}i=a;return}function Ap(a,d,f,g){a=a|0;d=d|0;f=f|0;g=g|0;var h=0,i=0,j=0;a=(f-d|0)>>>2;if((d|0)!=(f|0)){h=d;i=g;while(1){g=c[h>>2]|0;if(g>>>0<128)j=e[(c[(wb()|0)>>2]|0)+(g<<1)>>1]|0;else j=0;b[i>>1]=j;h=h+4|0;if((h|0)==(f|0))break;else i=i+2|0}}return d+(a<<2)|0}function Un(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0;g=i;i=i+16|0;h=g;j=Hs(d)|0;c[h>>2]=j;d=Ds(h,18276)|0;Pf[c[(c[d>>2]|0)+32>>2]&15](d,32305,32331,e)|0;e=Ds(h,18416)|0;a[f>>0]=Af[c[(c[e>>2]|0)+16>>2]&127](e)|0;yf[c[(c[e>>2]|0)+20>>2]&127](b,e);lr(j)|0;i=g;return}function Tn(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f;h=Hs(b)|0;c[g>>2]=h;b=Ds(g,18268)|0;Pf[c[(c[b>>2]|0)+48>>2]&15](b,32305,32331,d)|0;d=Ds(g,18424)|0;c[e>>2]=Af[c[(c[d>>2]|0)+16>>2]&127](d)|0;yf[c[(c[d>>2]|0)+20>>2]&127](a,d);lr(h)|0;i=f;return}function Np(b){b=b|0;var d=0,e=0,f=0;d=b+74|0;e=a[d>>0]|0;a[d>>0]=e+255|e;e=c[b>>2]|0;if(!(e&8)){c[b+8>>2]=0;c[b+4>>2]=0;d=c[b+44>>2]|0;c[b+28>>2]=d;c[b+20>>2]=d;c[b+16>>2]=d+(c[b+48>>2]|0);f=0;return f|0}else{c[b>>2]=e|32;f=-1;return f|0}return 0}function $o(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=a[b>>0]|0;g=(f&1)==0;if(g)h=(f&255)>>>1;else h=c[b+4>>2]|0;do if(h>>>0>=d>>>0)if(g){a[b+1+d>>0]=0;a[b>>0]=d<<1;break}else{a[(c[b+8>>2]|0)+d>>0]=0;c[b+4>>2]=d;break}else Xm(b,d-h|0,e)|0;while(0);return}function fo(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+16|0;j=h+12|0;k=h+8|0;l=h+4|0;m=h;c[l>>2]=c[b>>2];c[m>>2]=c[d>>2];c[k>>2]=c[l>>2];c[j>>2]=c[m>>2];m=Jg(a,k,j,e,f,g,33714,33722)|0;i=h;return m|0}function eo(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+16|0;j=h+12|0;k=h+8|0;l=h+4|0;m=h;c[l>>2]=c[b>>2];c[m>>2]=c[d>>2];c[k>>2]=c[l>>2];c[j>>2]=c[m>>2];m=Ig(a,k,j,e,f,g,18844,18876)|0;i=h;return m|0}function Co(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;c[a>>2]=18252;b=a+8|0;d=a+12|0;e=c[b>>2]|0;if((c[d>>2]|0)!=(e|0)){f=e;e=0;do{g=c[f+(e<<2)>>2]|0;if(g)lr(g)|0;e=e+1|0;f=c[b>>2]|0}while(e>>>0<(c[d>>2]|0)-f>>2>>>0)}Au(a+144|0);kp(b);return}function Vo(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f+4|0;h=f;_q(b);c[b>>2]=16748;c[b+32>>2]=d;Pt(g,b+4|0);c[h>>2]=c[g>>2];g=Ds(h,18336)|0;Ww(h);c[b+36>>2]=g;c[b+40>>2]=e;a[b+44>>0]=(Af[c[(c[g>>2]|0)+28>>2]&127](g)|0)&1;i=f;return}function Uo(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f+4|0;h=f;Zq(b);c[b>>2]=16620;c[b+32>>2]=d;Pt(g,b+4|0);c[h>>2]=c[g>>2];g=Ds(h,18344)|0;Ww(h);c[b+36>>2]=g;c[b+40>>2]=e;a[b+44>>0]=(Af[c[(c[g>>2]|0)+28>>2]&127](g)|0)&1;i=f;return}function Nn(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+16|0;j=h+8|0;k=h+4|0;l=h;m=Hs(e)|0;c[k>>2]=m;e=Ds(k,18276)|0;lr(m)|0;c[l>>2]=c[d>>2];c[j>>2]=c[l>>2];Yn(a,g+20|0,b,j,f,e);i=h;return c[b>>2]|0}function Mn(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+16|0;j=h+8|0;k=h+4|0;l=h;m=Hs(e)|0;c[k>>2]=m;e=Ds(k,18268)|0;lr(m)|0;c[l>>2]=c[d>>2];c[j>>2]=c[l>>2];Xn(a,g+20|0,b,j,f,e);i=h;return c[b>>2]|0}function Hn(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+16|0;j=h+8|0;k=h+4|0;l=h;m=Hs(e)|0;c[k>>2]=m;e=Ds(k,18276)|0;lr(m)|0;c[l>>2]=c[d>>2];c[j>>2]=c[l>>2];Kn(a,g+24|0,b,j,f,e);i=h;return c[b>>2]|0}function Gn(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+16|0;j=h+8|0;k=h+4|0;l=h;m=Hs(e)|0;c[k>>2]=m;e=Ds(k,18276)|0;lr(m)|0;c[l>>2]=c[d>>2];c[j>>2]=c[l>>2];An(a,g+16|0,b,j,f,e);i=h;return c[b>>2]|0}function Fn(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+16|0;j=h+8|0;k=h+4|0;l=h;m=Hs(e)|0;c[k>>2]=m;e=Ds(k,18268)|0;lr(m)|0;c[l>>2]=c[d>>2];c[j>>2]=c[l>>2];Jn(a,g+24|0,b,j,f,e);i=h;return c[b>>2]|0}function En(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+16|0;j=h+8|0;k=h+4|0;l=h;m=Hs(e)|0;c[k>>2]=m;e=Ds(k,18268)|0;lr(m)|0;c[l>>2]=c[d>>2];c[j>>2]=c[l>>2];zn(a,g+16|0,b,j,f,e);i=h;return c[b>>2]|0}function zo(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+16|0;j=h+12|0;k=h+8|0;l=h+4|0;m=h;c[l>>2]=c[b>>2];c[m>>2]=c[d>>2];c[k>>2]=c[l>>2];c[j>>2]=c[m>>2];m=yh(a,k,j,e,f,g)|0;i=h;return m|0}function yo(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+16|0;j=h+12|0;k=h+8|0;l=h+4|0;m=h;c[l>>2]=c[b>>2];c[m>>2]=c[d>>2];c[k>>2]=c[l>>2];c[j>>2]=c[m>>2];m=uh(a,k,j,e,f,g)|0;i=h;return m|0}function xo(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+16|0;j=h+12|0;k=h+8|0;l=h+4|0;m=h;c[l>>2]=c[b>>2];c[m>>2]=c[d>>2];c[k>>2]=c[l>>2];c[j>>2]=c[m>>2];m=nh(a,k,j,e,f,g)|0;i=h;return m|0}function wo(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+16|0;j=h+12|0;k=h+8|0;l=h+4|0;m=h;c[l>>2]=c[b>>2];c[m>>2]=c[d>>2];c[k>>2]=c[l>>2];c[j>>2]=c[m>>2];m=ih(a,k,j,e,f,g)|0;i=h;return m|0}function vo(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+16|0;j=h+12|0;k=h+8|0;l=h+4|0;m=h;c[l>>2]=c[b>>2];c[m>>2]=c[d>>2];c[k>>2]=c[l>>2];c[j>>2]=c[m>>2];m=wh(a,k,j,e,f,g)|0;i=h;return m|0}function uo(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+16|0;j=h+12|0;k=h+8|0;l=h+4|0;m=h;c[l>>2]=c[b>>2];c[m>>2]=c[d>>2];c[k>>2]=c[l>>2];c[j>>2]=c[m>>2];m=vh(a,k,j,e,f,g)|0;i=h;return m|0}function to(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+16|0;j=h+12|0;k=h+8|0;l=h+4|0;m=h;c[l>>2]=c[b>>2];c[m>>2]=c[d>>2];c[k>>2]=c[l>>2];c[j>>2]=c[m>>2];m=th(a,k,j,e,f,g)|0;i=h;return m|0}function so(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+16|0;j=h+12|0;k=h+8|0;l=h+4|0;m=h;c[l>>2]=c[b>>2];c[m>>2]=c[d>>2];c[k>>2]=c[l>>2];c[j>>2]=c[m>>2];m=lh(a,k,j,e,f,g)|0;i=h;return m|0}function ro(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+16|0;j=h+12|0;k=h+8|0;l=h+4|0;m=h;c[l>>2]=c[b>>2];c[m>>2]=c[d>>2];c[k>>2]=c[l>>2];c[j>>2]=c[m>>2];m=kh(a,k,j,e,f,g)|0;i=h;return m|0}function qo(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+16|0;j=h+12|0;k=h+8|0;l=h+4|0;m=h;c[l>>2]=c[b>>2];c[m>>2]=c[d>>2];c[k>>2]=c[l>>2];c[j>>2]=c[m>>2];m=hh(a,k,j,e,f,g)|0;i=h;return m|0}function po(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+16|0;j=h+12|0;k=h+8|0;l=h+4|0;m=h;c[l>>2]=c[b>>2];c[m>>2]=c[d>>2];c[k>>2]=c[l>>2];c[j>>2]=c[m>>2];m=xh(a,k,j,e,f,g)|0;i=h;return m|0}function oo(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+16|0;j=h+12|0;k=h+8|0;l=h+4|0;m=h;c[l>>2]=c[b>>2];c[m>>2]=c[d>>2];c[k>>2]=c[l>>2];c[j>>2]=c[m>>2];m=mh(a,k,j,e,f,g)|0;i=h;return m|0}function lo(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+16|0;j=h+12|0;k=h+8|0;l=h+4|0;m=h;c[l>>2]=c[b>>2];c[m>>2]=c[d>>2];c[k>>2]=c[l>>2];c[j>>2]=c[m>>2];m=sh(a,k,j,e,f,g)|0;i=h;return m|0}function ko(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+16|0;j=h+12|0;k=h+8|0;l=h+4|0;m=h;c[l>>2]=c[b>>2];c[m>>2]=c[d>>2];c[k>>2]=c[l>>2];c[j>>2]=c[m>>2];m=rh(a,k,j,e,f,g)|0;i=h;return m|0}function jo(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+16|0;j=h+12|0;k=h+8|0;l=h+4|0;m=h;c[l>>2]=c[b>>2];c[m>>2]=c[d>>2];c[k>>2]=c[l>>2];c[j>>2]=c[m>>2];m=qh(a,k,j,e,f,g)|0;i=h;return m|0}function io(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+16|0;j=h+12|0;k=h+8|0;l=h+4|0;m=h;c[l>>2]=c[b>>2];c[m>>2]=c[d>>2];c[k>>2]=c[l>>2];c[j>>2]=c[m>>2];m=fh(a,k,j,e,f,g)|0;i=h;return m|0}function ho(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+16|0;j=h+12|0;k=h+8|0;l=h+4|0;m=h;c[l>>2]=c[b>>2];c[m>>2]=c[d>>2];c[k>>2]=c[l>>2];c[j>>2]=c[m>>2];m=eh(a,k,j,e,f,g)|0;i=h;return m|0}function go(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+16|0;j=h+12|0;k=h+8|0;l=h+4|0;m=h;c[l>>2]=c[b>>2];c[m>>2]=c[d>>2];c[k>>2]=c[l>>2];c[j>>2]=c[m>>2];m=dh(a,k,j,e,f,g)|0;i=h;return m|0}function bp(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;rv(b);e=a+8|0;f=c[e>>2]|0;if((c[a+12>>2]|0)-f>>2>>>0>d>>>0)g=f;else{Zo(e,d+1|0);g=c[e>>2]|0}f=c[g+(d<<2)>>2]|0;if(!f)h=g;else{lr(f)|0;h=c[e>>2]|0}c[h+(d<<2)>>2]=b;return}function Fo(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0;a=i;i=i+16|0;h=a+4|0;j=a;c[j>>2]=c[e>>2];c[h>>2]=c[j>>2];j=jh(d,h,f,g,2)|0;g=c[f>>2]|0;if((j+-1|0)>>>0<31&(g&4|0)==0)c[b>>2]=j;else c[f>>2]=g|4;i=a;return}function Do(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0;a=i;i=i+16|0;h=a+4|0;j=a;c[j>>2]=c[e>>2];c[h>>2]=c[j>>2];j=bh(d,h,f,g,2)|0;g=c[f>>2]|0;if((j+-1|0)>>>0<31&(g&4|0)==0)c[b>>2]=j;else c[f>>2]=g|4;i=a;return}function Bo(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0;a=i;i=i+16|0;h=a+4|0;j=a;c[j>>2]=c[e>>2];c[h>>2]=c[j>>2];j=jh(d,h,f,g,2)|0;g=c[f>>2]|0;if((j+-1|0)>>>0<12&(g&4|0)==0)c[b>>2]=j;else c[f>>2]=g|4;i=a;return}function Ao(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0;a=i;i=i+16|0;h=a+4|0;j=a;c[j>>2]=c[e>>2];c[h>>2]=c[j>>2];j=bh(d,h,f,g,2)|0;g=c[f>>2]|0;if((j+-1|0)>>>0<12&(g&4|0)==0)c[b>>2]=j;else c[f>>2]=g|4;i=a;return}function Io(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0;a=i;i=i+16|0;h=a+4|0;j=a;c[j>>2]=c[e>>2];c[h>>2]=c[j>>2];j=jh(d,h,f,g,2)|0;g=c[f>>2]|0;if((j|0)<13&(g&4|0)==0)c[b>>2]=j+-1;else c[f>>2]=g|4;i=a;return}function Ho(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0;a=i;i=i+16|0;h=a+4|0;j=a;c[j>>2]=c[e>>2];c[h>>2]=c[j>>2];j=bh(d,h,f,g,2)|0;g=c[f>>2]|0;if((j|0)<13&(g&4|0)==0)c[b>>2]=j+-1;else c[f>>2]=g|4;i=a;return}function aq(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=a+84|0;f=c[e>>2]|0;g=d+256|0;h=zk(f,0,g)|0;i=(h|0)==0?g:h-f|0;h=i>>>0<d>>>0?i:d;dp(b|0,f|0,h|0)|0;c[a+4>>2]=f+h;b=f+i|0;c[a+8>>2]=b;c[e>>2]=b;return h|0}function Go(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0;a=i;i=i+16|0;h=a+4|0;j=a;c[j>>2]=c[e>>2];c[h>>2]=c[j>>2];j=jh(d,h,f,g,3)|0;g=c[f>>2]|0;if((j|0)<366&(g&4|0)==0)c[b>>2]=j;else c[f>>2]=g|4;i=a;return}function Eo(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0;a=i;i=i+16|0;h=a+4|0;j=a;c[j>>2]=c[e>>2];c[h>>2]=c[j>>2];j=bh(d,h,f,g,3)|0;g=c[f>>2]|0;if((j|0)<366&(g&4|0)==0)c[b>>2]=j;else c[f>>2]=g|4;i=a;return}function Tp(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0;b=(e-d|0)>>>2;if((d|0)!=(e|0)){h=d;i=g;while(1){g=c[h>>2]|0;a[i>>0]=g>>>0<128?g&255:f;h=h+4|0;if((h|0)==(e|0))break;else i=i+1|0}}return d+(b<<2)|0}function Ro(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0;a=i;i=i+16|0;h=a+4|0;j=a;c[j>>2]=c[e>>2];c[h>>2]=c[j>>2];j=jh(d,h,f,g,2)|0;g=c[f>>2]|0;if((j|0)<24&(g&4|0)==0)c[b>>2]=j;else c[f>>2]=g|4;i=a;return}function Qo(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0;a=i;i=i+16|0;h=a+4|0;j=a;c[j>>2]=c[e>>2];c[h>>2]=c[j>>2];j=bh(d,h,f,g,2)|0;g=c[f>>2]|0;if((j|0)<24&(g&4|0)==0)c[b>>2]=j;else c[f>>2]=g|4;i=a;return}function Po(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0;a=i;i=i+16|0;h=a+4|0;j=a;c[j>>2]=c[e>>2];c[h>>2]=c[j>>2];j=jh(d,h,f,g,2)|0;g=c[f>>2]|0;if((j|0)<60&(g&4|0)==0)c[b>>2]=j;else c[f>>2]=g|4;i=a;return}function Oo(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0;a=i;i=i+16|0;h=a+4|0;j=a;c[j>>2]=c[e>>2];c[h>>2]=c[j>>2];j=jh(d,h,f,g,2)|0;g=c[f>>2]|0;if((j|0)<61&(g&4|0)==0)c[b>>2]=j;else c[f>>2]=g|4;i=a;return}function Mo(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0;a=i;i=i+16|0;h=a+4|0;j=a;c[j>>2]=c[e>>2];c[h>>2]=c[j>>2];j=bh(d,h,f,g,2)|0;g=c[f>>2]|0;if((j|0)<60&(g&4|0)==0)c[b>>2]=j;else c[f>>2]=g|4;i=a;return}function Lo(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0;a=i;i=i+16|0;h=a+4|0;j=a;c[j>>2]=c[e>>2];c[h>>2]=c[j>>2];j=bh(d,h,f,g,2)|0;g=c[f>>2]|0;if((j|0)<61&(g&4|0)==0)c[b>>2]=j;else c[f>>2]=g|4;i=a;return}function No(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0;a=i;i=i+16|0;h=a+4|0;j=a;c[j>>2]=c[e>>2];c[h>>2]=c[j>>2];j=jh(d,h,f,g,1)|0;g=c[f>>2]|0;if((j|0)<7&(g&4|0)==0)c[b>>2]=j;else c[f>>2]=g|4;i=a;return}function Ko(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0;a=i;i=i+16|0;h=a+4|0;j=a;c[j>>2]=c[e>>2];c[h>>2]=c[j>>2];j=bh(d,h,f,g,1)|0;g=c[f>>2]|0;if((j|0)<7&(g&4|0)==0)c[b>>2]=j;else c[f>>2]=g|4;i=a;return}function yp(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;if(d>>>0>4294967279)Ew(b);if(d>>>0<11){a[b>>0]=d<<1;f=b+1|0}else{g=d+16&-16;h=Gp(g)|0;c[b+8>>2]=h;c[b>>2]=g|1;c[b+4>>2]=d;f=h}Cp(f|0,e|0,d|0)|0;a[f+d>>0]=0;return}function wp(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;if(e>>>0>4294967279)Ew(b);if(e>>>0<11){a[b>>0]=e<<1;f=b+1|0}else{g=e+16&-16;h=Gp(g)|0;c[b+8>>2]=h;c[b>>2]=g|1;c[b+4>>2]=e;f=h}dp(f|0,d|0,e|0)|0;a[f+e>>0]=0;return}function _p(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;if((b|0)==(d|0))e=0;else{a=0;f=b;while(1){b=(c[f>>2]|0)+(a<<4)|0;g=b&-268435456;h=(g>>>24|g)^b;f=f+4|0;if((f|0)==(d|0)){e=h;break}else a=h}}return e|0}function $p(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0;if((c|0)==(d|0))e=0;else{b=0;f=c;while(1){c=(a[f>>0]|0)+(b<<4)|0;g=c&-268435456;h=(g>>>24|g)^c;f=f+1|0;if((f|0)==(d|0)){e=h;break}else b=h}}return e|0}function Mp(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;a=(d-b|0)>>>2;if((b|0)!=(d|0)){e=b;do{f=c[e>>2]|0;if(f>>>0<128)g=c[(c[(Me()|0)>>2]|0)+(f<<2)>>2]|0;else g=f;c[e>>2]=g;e=e+4|0}while((e|0)!=(d|0))}return b+(a<<2)|0}function Lp(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;a=(d-b|0)>>>2;if((b|0)!=(d|0)){e=b;do{f=c[e>>2]|0;if(f>>>0<128)g=c[(c[(Ec()|0)>>2]|0)+(f<<2)>>2]|0;else g=f;c[e>>2]=g;e=e+4|0}while((e|0)!=(d|0))}return b+(a<<2)|0}function zp(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;if(d>>>0>1073741807)Ew(b);if(d>>>0<2){a[b>>0]=d<<1;f=b+4|0}else{g=d+4&-4;h=Gp(g<<2)|0;c[b+8>>2]=h;c[b>>2]=g|1;c[b+4>>2]=d;f=h}nr(f,e,d)|0;c[f+(d<<2)>>2]=0;return}function xp(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;if(e>>>0>1073741807)Ew(b);if(e>>>0<2){a[b>>0]=e<<1;f=b+4|0}else{g=e+4&-4;h=Gp(g<<2)|0;c[b+8>>2]=h;c[b>>2]=g|1;c[b+4>>2]=e;f=h}Jq(f,d,e)|0;c[f+(e<<2)>>2]=0;return}function Yp(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;i=i+112|0;f=e;g=f;h=g+112|0;do{c[g>>2]=0;g=g+4|0}while((g|0)<(h|0));c[f+32>>2]=23;c[f+44>>2]=a;c[f+76>>2]=-1;c[f+84>>2]=a;a=ig(f,b,d)|0;i=e;return a|0}function Bp(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0;h=c[a+4>>2]|0;i=h>>8;if(!(h&1))j=i;else j=c[(c[e>>2]|0)+i>>2]|0;i=c[a>>2]|0;Gf[c[(c[i>>2]|0)+20>>2]&15](i,b,d,e+j|0,(h&2|0)!=0?f:2,g);return}function vp(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b+4|0;k=b;c[a>>2]=d;c[k>>2]=g;l=Yh(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=c[a>>2];c[j>>2]=c[k>>2];i=b;return l|0}function up(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b+4|0;k=b;c[a>>2]=d;c[k>>2]=g;l=Kj(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=c[a>>2];c[j>>2]=c[k>>2];i=b;return l|0}function tp(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b+4|0;k=b;c[a>>2]=d;c[k>>2]=g;l=Lh(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=c[a>>2];c[j>>2]=c[k>>2];i=b;return l|0}function sp(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b+4|0;k=b;c[a>>2]=d;c[k>>2]=g;l=ti(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=c[a>>2];c[j>>2]=c[k>>2];i=b;return l|0}function Gp(a){a=a|0;var b=0,d=0,e=0;b=(a|0)==0?1:a;a=_f(b)|0;a:do if(!a){while(1){d=ky()|0;if(!d)break;Tf[d&7]();d=_f(b)|0;if(d){e=d;break a}}d=id(4)|0;c[d>>2]=14792;df(d|0,784,150)}else e=a;while(0);return e|0}function Qp(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0;b=a+4|0;d=Pf[c[b>>2]&15](a,0,0,1)|0;e=G;if((e|0)<0){f=-1;g=-1;G=f;return g|0}h=Pf[c[b>>2]&15](a,0,0,2)|0;i=G;Pf[c[b>>2]&15](a,d,e,0)|0;f=i;g=h;G=f;return g|0}function gq(a,b){a=a|0;b=b|0;var d=0;c[a+24>>2]=b;c[a+16>>2]=(b|0)==0&1;c[a+20>>2]=0;c[a+4>>2]=4098;c[a+12>>2]=0;c[a+8>>2]=6;b=a+28|0;d=a+32|0;a=d+40|0;do{c[d>>2]=0;d=d+4|0}while((d|0)<(a|0));lt(b);return}function qp(a,b,d){a=a|0;b=b|0;d=d|0;Wc(21792)|0;if((c[a>>2]|0)==1)do fe(21820,21792)|0;while((c[a>>2]|0)==1);if(!(c[a>>2]|0)){c[a>>2]=1;Bc(21792)|0;xf[d&511](b);Wc(21792)|0;c[a>>2]=-1;Bc(21792)|0;Pd(21820)|0}else Bc(21792)|0;return}function Ip(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;g=c[a+4>>2]|0;h=g>>8;if(!(g&1))i=h;else i=c[(c[d>>2]|0)+h>>2]|0;h=c[a>>2]|0;wf[c[(c[h>>2]|0)+24>>2]&7](h,b,d+i|0,(g&2|0)!=0?e:2,f);return}function sq(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;c=a&65535;d=b&65535;e=ca(d,c)|0;f=a>>>16;a=(e>>>16)+(ca(d,f)|0)|0;d=b>>>16;b=ca(d,c)|0;return (G=(a>>>16)+(ca(d,f)|0)+(((a&65535)+b|0)>>>16)|0,a+b<<16|e&65535|0)|0}function Zp(a,b){a=a|0;b=b|0;var d=0,e=0;if(a){d=ca(b,a)|0;if((b|a)>>>0>65535)e=((d>>>0)/(a>>>0)|0|0)==(b|0)?d:-1;else e=d}else e=0;d=_f(e)|0;if(!d)return d|0;if(!(c[d+-4>>2]&3))return d|0;Cp(d|0,0,e|0)|0;return d|0}function Sp(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((d|0)!=(e|0)){b=d;do{d=a[b>>0]|0;if(d<<24>>24>-1)f=c[(c[(Me()|0)>>2]|0)+(d<<24>>24<<2)>>2]&255;else f=d;a[b>>0]=f;b=b+1|0}while((b|0)!=(e|0))}return e|0}function Rp(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((d|0)!=(e|0)){b=d;do{d=a[b>>0]|0;if(d<<24>>24>-1)f=c[(c[(Ec()|0)>>2]|0)+(d<<24>>24<<2)>>2]&255;else f=d;a[b>>0]=f;b=b+1|0}while((b|0)!=(e|0))}return e|0}function np(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f+4|0;h=f;_q(b);c[b>>2]=16812;c[b+32>>2]=d;c[b+40>>2]=e;c[b+48>>2]=-1;a[b+52>>0]=0;Pt(g,b+4|0);c[h>>2]=c[g>>2];Vp(b,h);Ww(h);i=f;return}function mp(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f+4|0;h=f;Zq(b);c[b>>2]=16684;c[b+32>>2]=d;c[b+40>>2]=e;c[b+48>>2]=-1;a[b+52>>0]=0;Pt(g,b+4|0);c[h>>2]=c[g>>2];Up(b,h);Ww(h);i=f;return}function _k(a){a=a|0;zu(20348);zu(20336);zu(20324);zu(20312);zu(20300);zu(20288);zu(20276);zu(20264);zu(20252);zu(20240);zu(20228);zu(20216);zu(20204);zu(20192);zu(20180);zu(20168);zu(20156);zu(20144);zu(20132);zu(20120);zu(20108);zu(20096);zu(20084);zu(20072);return}function Zk(a){a=a|0;Au(21160);Au(21148);Au(21136);Au(21124);Au(21112);Au(21100);Au(21088);Au(21076);Au(21064);Au(21052);Au(21040);Au(21028);Au(21016);Au(21004);Au(20992);Au(20980);Au(20968);Au(20956);Au(20944);Au(20932);Au(20920);Au(20908);Au(20896);Au(20884);return}function Yk(a){a=a|0;zu(21452);zu(21440);zu(21428);zu(21416);zu(21404);zu(21392);zu(21380);zu(21368);zu(21356);zu(21344);zu(21332);zu(21320);zu(21308);zu(21296);zu(21284);zu(21272);zu(21260);zu(21248);zu(21236);zu(21224);zu(21212);zu(21200);zu(21188);zu(21176);return}function $k(a){a=a|0;Au(20056);Au(20044);Au(20032);Au(20020);Au(20008);Au(19996);Au(19984);Au(19972);Au(19960);Au(19948);Au(19936);Au(19924);Au(19912);Au(19900);Au(19888);Au(19876);Au(19864);Au(19852);Au(19840);Au(19828);Au(19816);Au(19804);Au(19792);Au(19780);return}function wq(b,c,d){b=b|0;c=c|0;d=d|0;var e=0;if((c|0)<(b|0)&(b|0)<(c+d|0)){e=b;c=c+d|0;b=b+d|0;while((d|0)>0){b=b-1|0;c=c-1|0;d=d-1|0;a[b>>0]=a[c>>0]|0}b=e}else dp(b,c,d)|0;return b|0}function yq(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0;e=c&255;c=d;while(1){if(!c){f=0;g=4;break}c=c+-1|0;d=b+c|0;if((a[d>>0]|0)==e<<24>>24){f=d;g=4;break}}if((g|0)==4)return f|0;return 0}function bq(a){a=a|0;var b=0,d=0,e=0;if(!a)return;b=c[a>>2]|0;if((b|0)!=0?(d=b+56|0,e=c[d>>2]|0,c[d>>2]=e+-1,(e|0)<2):0)rm(b);c[a>>2]=0;c[a+84>>2]=0;c[a+80>>2]=0;b=a+64|0;qB(c[b>>2]|0);c[b>>2]=0;qB(a);return}function uq(a){a=a|0;var b=0,e=0,f=0;b=c[a+4>>2]|0;e=ca(d[b+9>>0]|0,c[a+8>>2]|0)|0;switch(d[b+8>>0]|0|0){case 1:{f=(e+7|0)/8|0;break}case 4:{f=(e+1|0)/2|0;break}default:f=e}return f+3&-4|0}function Kp(a){a=a|0;var b=0,d=0,e=0;b=a+8|0;a=Tb(c[b>>2]|0)|0;d=Ml(0,0,4)|0;if(a)Tb(a|0)|0;if(!d){d=c[b>>2]|0;if(d){b=Tb(d|0)|0;if(!b)e=0;else{Tb(b|0)|0;e=0}}else e=1}else e=-1;return e|0}function hq(a){a=a|0;var b=0,d=0,e=0;if(!a)return;b=c[a>>2]|0;if((b|0)!=0?(d=b+56|0,e=c[d>>2]|0,c[d>>2]=e+-1,(e|0)<2):0)rm(b);c[a>>2]=0;c[a+84>>2]=0;c[a+80>>2]=0;b=a+64|0;qB(c[b>>2]|0);c[b>>2]=0;return}function Wp(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=c[a+40>>2]|0;e=a+32|0;f=a+36|0;if(d){g=d;do{g=g+-1|0;Hf[c[(c[e>>2]|0)+(g<<2)>>2]&31](b,a,c[(c[f>>2]|0)+(g<<2)>>2]|0)}while((g|0)!=0)}return}function Jp(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=c[a+4>>2]|0;g=f>>8;if(!(f&1))h=g;else h=c[(c[d>>2]|0)+g>>2]|0;g=c[a>>2]|0;Wf[c[(c[g>>2]|0)+28>>2]&63](g,b,d+h|0,(f&2|0)!=0?e:2);return}function jp(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0;a=i;i=i+16|0;h=a+4|0;j=a;c[j>>2]=c[e>>2];c[h>>2]=c[j>>2];j=jh(d,h,f,g,4)|0;if(!(c[f>>2]&4))c[b>>2]=j+-1900;i=a;return}function ip(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0;a=i;i=i+16|0;h=a+4|0;j=a;c[j>>2]=c[e>>2];c[h>>2]=c[j>>2];j=bh(d,h,f,g,4)|0;if(!(c[f>>2]&4))c[b>>2]=j+-1900;i=a;return}function fq(a){a=a|0;var b=0,d=0,e=0;b=i;i=i+16|0;d=b;if(!a){c[d>>2]=23994;Cj(24164,d)|0;i=b;return}d=a+12|0;e=c[d>>2]|0;c[d>>2]=e+-1;if((e|0)>1){i=b;return}qB(c[a+4>>2]|0);qB(a);i=b;return}function nq(){var a=0,b=0,d=0,e=0,f=0;a=i;i=i+16|0;b=a;d=c[1378]|0;if((d|0)==-1){c[1378]=0;c[b>>2]=0;e=c[1378]|0;if(!(c[b>>2]|0))f=e;else{b=e|2;c[1378]=b;f=b}}else f=d;i=a;return f>>>2&1|0}function mq(){var a=0,b=0,d=0,e=0,f=0;a=i;i=i+16|0;b=a;d=c[1378]|0;if((d|0)==-1){c[1378]=0;c[b>>2]=0;e=c[1378]|0;if(!(c[b>>2]|0))f=e;else{b=e|2;c[1378]=b;f=b}}else f=d;i=a;return f>>>4&1|0}function lq(){var a=0,b=0,d=0,e=0,f=0;a=i;i=i+16|0;b=a;d=c[1378]|0;if((d|0)==-1){c[1378]=0;c[b>>2]=0;e=c[1378]|0;if(!(c[b>>2]|0))f=e;else{b=e|2;c[1378]=b;f=b}}else f=d;i=a;return f>>>5&1|0}function kq(){var a=0,b=0,d=0,e=0,f=0;a=i;i=i+16|0;b=a;d=c[1378]|0;if((d|0)==-1){c[1378]=0;c[b>>2]=0;e=c[1378]|0;if(!(c[b>>2]|0))f=e;else{b=e|2;c[1378]=b;f=b}}else f=d;i=a;return f>>>3&1|0}function jq(){var a=0,b=0,d=0,e=0,f=0;a=i;i=i+16|0;b=a;d=c[1378]|0;if((d|0)==-1){c[1378]=0;c[b>>2]=0;e=c[1378]|0;if(!(c[b>>2]|0))f=e;else{b=e|2;c[1378]=b;f=b}}else f=d;i=a;return f>>>1&1|0}function rq(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;if((c|0)!=(d|0)){b=c;c=f;while(1){f=a[b>>0]|0;a[c>>0]=f<<24>>24>-1?f:e;b=b+1|0;if((b|0)==(d|0))break;else c=c+1|0}}return d|0}function Iq(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;c[a+104>>2]=b;d=c[a+4>>2]|0;e=c[a+8>>2]|0;f=e-d|0;c[a+108>>2]=f;if((b|0)!=0&(f|0)>(b|0)){c[a+100>>2]=d+b;return}else{c[a+100>>2]=e;return}}function Gq(b){b=b|0;var c=0;c=a[m+(b&255)>>0]|0;if((c|0)<8)return c|0;c=a[m+(b>>8&255)>>0]|0;if((c|0)<8)return c+8|0;c=a[m+(b>>16&255)>>0]|0;if((c|0)<8)return c+16|0;return (a[m+(b>>>24)>>0]|0)+24|0}function Op(b,d){b=b|0;d=d|0;var e=0,f=0;if(d>>>0>1073741823)Jw(b);e=b+128|0;if(d>>>0<29&(a[e>>0]|0)==0){a[e>>0]=1;f=b+16|0}else f=Gp(d<<2)|0;c[b+4>>2]=f;c[b>>2]=f;c[b+8>>2]=f+(d<<2);return}function Vp(b,d){b=b|0;d=d|0;var e=0,f=0;e=Ds(d,18336)|0;d=b+36|0;c[d>>2]=e;f=b+44|0;c[f>>2]=Af[c[(c[e>>2]|0)+24>>2]&127](e)|0;e=c[d>>2]|0;a[b+53>>0]=(Af[c[(c[e>>2]|0)+28>>2]&127](e)|0)&1;return}function Up(b,d){b=b|0;d=d|0;var e=0,f=0;e=Ds(d,18344)|0;d=b+36|0;c[d>>2]=e;f=b+44|0;c[f>>2]=Af[c[(c[e>>2]|0)+24>>2]&127](e)|0;e=c[d>>2]|0;a[b+53>>0]=(Af[c[(c[e>>2]|0)+28>>2]&127](e)|0)&1;return}function Jq(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;if(!d)return a|0;else{e=d;f=b;g=a}while(1){e=e+-1|0;c[g>>2]=c[f>>2];if(!e)break;else{f=f+4|0;g=g+4|0}}return a|0}function qq(){var a=0,b=0;a=Ir()|0;if(((a|0)!=0?(b=c[a>>2]|0,(b|0)!=0):0)?(a=b+48|0,(c[a>>2]&-256|0)==1126902528?(c[a+4>>2]|0)==1129074247:0):0)Zu(c[b+12>>2]|0);b=c[3695]|0;c[3695]=b+0;Zu(b)}function Oq(){var b=0,c=0,d=0;b=oA(1,88)|0;if(!b){Fp(0)|0;c=0;return c|0}else{d=b+76|0;a[d>>0]=-1;a[d+1>>0]=-1>>8;a[d+2>>0]=-1>>16;a[d+3>>0]=-1>>24;c=b;return c|0}return 0}function Xp(b){b=b|0;a[k>>0]=a[b>>0];a[k+1>>0]=a[b+1>>0];a[k+2>>0]=a[b+2>>0];a[k+3>>0]=a[b+3>>0];a[k+4>>0]=a[b+4>>0];a[k+5>>0]=a[b+5>>0];a[k+6>>0]=a[b+6>>0];a[k+7>>0]=a[b+7>>0]}function Ep(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0;if((a|0)==(c[b+8>>2]|0))Rm(0,b,d,e,f);else{h=c[a+8>>2]|0;Gf[c[(c[h>>2]|0)+20>>2]&15](h,b,d,e,f,g)}return}function hr(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=a+20|0;f=c[e>>2]|0;g=(c[a+16>>2]|0)-f|0;a=g>>>0>d>>>0?d:g;dp(f|0,b|0,a|0)|0;c[e>>2]=(c[e>>2]|0)+a;return d|0}function xq(a){a=a|0;var b=0,e=0,f=0;b=i;i=i+16|0;e=b;if((c[a+8>>2]|0)==0?(Yo(a)|0)!=0:0)f=-1;else if((Ef[c[a+32>>2]&31](a,e,1)|0)==1)f=d[e>>0]|0;else f=-1;i=b;return f|0}function Pq(b,c,d,e){b=b|0;c=c|0;d=d|0;e=e|0;if((c|0)!=(d|0)){b=c;c=e;while(1){a[c>>0]=a[b>>0]|0;b=b+1|0;if((b|0)==(d|0))break;else c=c+1|0}}return d|0}function Cq(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+16|0;f=e;c[f>>2]=c[d>>2];g=Ef[c[(c[a>>2]|0)+16>>2]&31](a,b,f)|0;if(g)c[d>>2]=c[f>>2];i=e;return g&1|0}function eq(b,d){b=b|0;d=d|0;var e=0,f=0;a[b>>0]=0;c[b+4>>2]=d;e=c[(c[d>>2]|0)+-12>>2]|0;if(!(c[d+(e+16)>>2]|0)){f=c[d+(e+72)>>2]|0;if(f)Wn(f)|0;a[b>>0]=1}return}function dq(b,d){b=b|0;d=d|0;var e=0,f=0;a[b>>0]=0;c[b+4>>2]=d;e=c[(c[d>>2]|0)+-12>>2]|0;if(!(c[d+(e+16)>>2]|0)){f=c[d+(e+72)>>2]|0;if(f)Vn(f)|0;a[b>>0]=1}return}function Sq(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;if((d|0)!=(e|0)){b=d;d=f;while(1){c[d>>2]=a[b>>0];b=b+1|0;if((b|0)==(e|0))break;else d=d+4|0}}return e|0}function oq(a,b){a=+a;b=+b;var d=0,e=0,f=0;h[k>>3]=a;d=c[k>>2]|0;e=c[k+4>>2]|0;h[k>>3]=b;f=c[k+4>>2]&-2147483648|e&2147483647;c[k>>2]=d;c[k+4>>2]=f;return +(+h[k>>3])}function pq(a){a=a|0;var b=0,d=0,e=0,f=0;b=a+4|0;d=c[b>>2]|0;e=c[b+4>>2]|0;b=(c[a>>2]|0)+(e>>1)|0;if(!(e&1))f=d;else f=c[(c[b>>2]|0)+d>>2]|0;xf[f&511](b);return}function tq(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;g=i;i=i+16|0;h=g;c[h>>2]=f;f=Tb(d|0)|0;d=Em(a,b,e,h)|0;if(f)Tb(f|0)|0;i=g;return d|0}function er(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;f=a+28|0;a=Sa(b|0,d|0,e|0,c[f>>2]|0)|0;if(a)return a|0;if(!(ob(c[f>>2]|0)|0))return a|0;Fp(1)|0;return a|0}function br(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;f=a+28|0;a=Tc(b|0,d|0,e|0,c[f>>2]|0)|0;if(a)return a|0;if(!(ob(c[f>>2]|0)|0))return a|0;Fp(2)|0;return a|0}function ar(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;b=i;i=i+16|0;a=b;f=c[o>>2]|0;c[a>>2]=c[14228+(d<<2)>>2];c[a+4>>2]=e;xe(f|0,24731,a|0)|0;i=b;return}function Fq(a){a=a|0;var b=0,d=0,e=0;b=a+28|0;d=c[b>>2]|0;if(!d)if(!(c[a>>2]&2))e=0;else{si(a,1);c[a>>2]=c[a>>2]|2;e=c[b>>2]|0}else e=d;c[b>>2]=e+1;return 0}function ir(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;d=a+28|0;if(!(Je(c[d>>2]|0,b|0,e|0)|0))f=bf(c[d>>2]|0)|0;else f=Fp(3)|0;G=((f|0)<0)<<31>>31;return f|0}function jr(a,b,c,d,e,f,g,h,i,j){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;Mf[a&3](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0,j|0)}function Hq(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;if((c[a>>2]|0)!=-1){c[d>>2]=a;c[d+4>>2]=301;c[d+8>>2]=0;qp(a,d,302)}i=b;return (c[a+4>>2]|0)+-1|0}function Pp(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;if((a|0)==(c[b+8>>2]|0))ep(0,b,d,e);else{f=c[a+8>>2]|0;Wf[c[(c[f>>2]|0)+28>>2]&63](f,b,d,e)}return}function sr(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0;e=Xw(c|0)|0;if(!d)return e|0;f=d+-1|0;d=e>>>0<f>>>0?e:f;dp(b|0,c|0,d|0)|0;a[b+d>>0]=0;return e|0}function $q(a){a=a|0;var b=0,d=0;b=a+28|0;d=c[b>>2]|0;if(!d)return;c[b>>2]=d+-1;if((d|0)>1)return;d=c[a>>2]|0;if(!(d&2))return;c[a>>2]=d&-3;sg(a)|0;return}function nr(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;if(!d)return a|0;else{e=d;f=a}while(1){e=e+-1|0;c[f>>2]=b;if(!e)break;else f=f+4|0}return a|0}function Dq(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+16|0;g=f;c[g>>2]=e;e=Tb(b|0)|0;b=Yp(a,d,g)|0;if(e)Tb(e|0)|0;i=f;return b|0}function Bq(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+16|0;g=f;c[g>>2]=e;e=Tb(b|0)|0;b=no(a,d,g)|0;if(e)Tb(e|0)|0;i=f;return b|0}function vr(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;return Kf[a&15](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)|0}function zq(b,d){b=b|0;d=d|0;var e=0;Af[c[(c[b>>2]|0)+24>>2]&127](b)|0;e=Ds(d,18344)|0;c[b+36>>2]=e;a[b+44>>0]=(Af[c[(c[e>>2]|0)+28>>2]&127](e)|0)&1;return}function Aq(b,d){b=b|0;d=d|0;var e=0;Af[c[(c[b>>2]|0)+24>>2]&127](b)|0;e=Ds(d,18336)|0;c[b+36>>2]=e;a[b+44>>0]=(Af[c[(c[e>>2]|0)+28>>2]&127](e)|0)&1;return}function xr(a){a=a|0;var b=0;switch(c[a+4>>2]&74|0){case 64:{b=8;break}case 8:{b=16;break}case 0:{b=0;break}default:b=10}return b|0}function gr(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;c[b+4>>2]=f+-1;c[b>>2]=18292;f=b+8|0;c[f>>2]=d;a[b+12>>0]=e&1;if(!d)c[f>>2]=c[(wb()|0)>>2];return}function Eq(a,b){a=a|0;b=b|0;var d=0;d=a+4|0;a=b;b=c[d>>2]|0;do{c[b>>2]=0;b=(c[d>>2]|0)+4|0;c[d>>2]=b;a=a+-1|0}while((a|0)!=0);return}function iq(b,d){b=b|0;d=d|0;if(!(a[d>>0]&1)){c[b>>2]=c[d>>2];c[b+4>>2]=c[d+4>>2];c[b+8>>2]=c[d+8>>2]}else wp(b,c[d+8>>2]|0,c[d+4>>2]|0);return}function Yq(a){a=a|0;var b=0,e=0;if((Af[c[(c[a>>2]|0)+36>>2]&127](a)|0)==-1)b=-1;else{e=a+12|0;a=c[e>>2]|0;c[e>>2]=a+1;b=d[a>>0]|0}return b|0}function Xq(a){a=a|0;var b=0,d=0;if((Af[c[(c[a>>2]|0)+36>>2]&127](a)|0)==-1)b=-1;else{d=a+12|0;a=c[d>>2]|0;c[d>>2]=a+4;b=c[a>>2]|0}return b|0}function _q(a){a=a|0;var b=0;c[a>>2]=16876;lt(a+4|0);b=a+8|0;c[b>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;c[b+12>>2]=0;c[b+16>>2]=0;c[b+20>>2]=0;return}function Zq(a){a=a|0;var b=0;c[a>>2]=16940;lt(a+4|0);b=a+8|0;c[b>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;c[b+12>>2]=0;c[b+16>>2]=0;c[b+20>>2]=0;return}function zr(a){a=a|0;var b=0,d=0;if(!a){b=0;return b|0}if((c[a+24>>2]|0)!=0?(Kd(c[a+28>>2]|0)|0)!=0:0)d=Fp(2)|0;else d=0;qB(a);b=d;return b|0}function rr(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;qf(a|0,b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)}function qr(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;Dd(a|0,b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)}function fr(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;Sb(a|0,b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)}function Er(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;Ff[a&3](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)}function Fr(a,b){a=a|0;b=b|0;c[a+4>>2]=b+-1;c[a>>2]=18480;c[a+8>>2]=46;c[a+12>>2]=44;b=a+16|0;c[b>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;return}function wr(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+8|0;g=f|0;Dh(a,b,d,e,g)|0;i=f;return (G=c[g+4>>2]|0,c[g>>2]|0)|0}function Jr(b,d){b=b|0;d=d|0;c[b+4>>2]=d+-1;c[b>>2]=18440;a[b+8>>0]=46;a[b+9>>0]=44;d=b+12|0;c[d>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;return}function Dr(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+16|0;g=f;c[g>>2]=e;e=Em(a,b,(d|0)==0?33705:d,g)|0;i=f;return e|0}function dr(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=a;c[g>>2]=0;c[g+4>>2]=0;g=a+8|0;c[g>>2]=-1;c[g+4>>2]=-1;return}function cr(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=a;c[g>>2]=0;c[g+4>>2]=0;g=a+8|0;c[g>>2]=-1;c[g+4>>2]=-1;return}function Kr(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=a;a=c;c=sq(e,a)|0;f=G;return (G=(ca(b,a)|0)+(ca(d,e)|0)+f|f&0,c|0|0)|0}function lr(a){a=a|0;var b=0,d=0,e=0;b=a+4|0;d=c[b>>2]|0;c[b>>2]=d+-1;if(!d){xf[c[(c[a>>2]|0)+8>>2]&511](a);e=1}else e=0;return e|0}function Or(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;return sf[a&7](b|0,c|0,d|0,e|0,f|0,g|0,h|0)|0}function Gm(a){a=a|0;Au(19252);Au(19240);Au(19228);Au(19216);Au(19204);Au(19192);Au(19180);Au(19168);Au(19156);Au(19144);Au(19132);Au(19120);Au(19108);Au(19096);return}function Fm(a){a=a|0;zu(19424);zu(19412);zu(19400);zu(19388);zu(19376);zu(19364);zu(19352);zu(19340);zu(19328);zu(19316);zu(19304);zu(19292);zu(19280);zu(19268);return}function Qr(a){a=a|0;var b=0,c=0,d=0;b=gn(a,24778)|0;c=Zx(a,46)|0;if(!b){d=0;return d|0}d=Ri(b,1,(c|0)==0?0:c+1|0)|0;return d|0}function rs(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){G=b>>c;return a>>>c|(b&(1<<c)-1)<<32-c}G=(b|0)<0?-1:0;return b>>c-32|0}function yr(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;te(a|0,b|0,c|0,d|0,e|0,f|0,g|0,h|0)}function Vr(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;Lf[a&3](b|0,c|0,d|0,e|0,f|0,g|0,h|0)}function Gr(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;Ud(a|0,b|0,c|0,d|0,e|0,f|0,g|0,h|0)}function Ar(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;oe(a|0,b|0,c|0,d|0,e|0,f|0,g|0,h|0)}function Tr(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+16|0;g=f;c[g>>2]=e;e=Em(a,b,d,g)|0;i=f;return e|0}function Rr(a,d,e){a=a|0;d=d|0;e=e|0;var f=0;if(e>>>0<128)f=(b[(c[(wb()|0)>>2]|0)+(e<<1)>>1]&d)<<16>>16!=0;else f=0;return f|0}function mr(a){a=a|0;var b=0,d=0;b=c[a+8>>2]|0;if(b){a=Tb(b|0)|0;if(!a)d=4;else{Tb(a|0)|0;d=4}}else d=1;return d|0}function Pr(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;i=i+16|0;e=d;c[e>>2]=b;b=c[o>>2]|0;gd(b|0,a|0,e|0)|0;cf(10,b|0)|0;Zd()}function kr(a){a=a|0;c[a>>2]=17164;Wp(a,0);Ww(a+28|0);yg(c[a+32>>2]|0);yg(c[a+36>>2]|0);yg(c[a+48>>2]|0);yg(c[a+60>>2]|0);return}function ct(a){a=a|0;var b=0,c=0;if((a+-48|0)>>>0<10){b=1;c=b&1;return c|0}b=((a|32)+-97|0)>>>0<6;c=b&1;return c|0}function Hr(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0;d=Mm(b)|0;if(!d){e=0;return e|0}b=Cg(a,d,c)|0;Pm(d);e=b;return e|0}function Fs(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=b-d>>>0;e=b-d-(c>>>0>a>>>0|0)>>>0;return (G=e,a-c>>>0|0)|0}function ps(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;return zf[a&63](b|0,c|0,d|0,e|0,f|0,g|0)|0}function Es(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){G=b<<c|(a&(1<<c)-1<<32-c)>>>32-c;return a<<c}G=a<<c-32;return 0}function ur(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=a;c[e>>2]=0;c[e+4>>2]=0;e=a+8|0;c[e>>2]=-1;c[e+4>>2]=-1;return}function tr(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=a;c[e>>2]=0;c[e+4>>2]=0;e=a+8|0;c[e>>2]=-1;c[e+4>>2]=-1;return}function Gs(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){G=b>>>c;return a>>>c|(b&(1<<c)-1)<<32-c}G=0;return b>>>c-32|0}function pr(b,d,e){b=b|0;d=d|0;e=e|0;e=Zc(((a[d>>0]&1)==0?d+1|0:c[d+8>>2]|0)|0,1)|0;return e>>>((e|0)!=(-1|0)&1)|0}function or(b,d,e){b=b|0;d=d|0;e=e|0;e=Zc(((a[d>>0]&1)==0?d+1|0:c[d+8>>2]|0)|0,1)|0;return e>>>((e|0)!=(-1|0)&1)|0}function xs(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=+g;return tf[a&3](b|0,c|0,d|0,e|0,f|0,+g)|0}function Mr(a,b,d,e,f,g,h,i){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;c[f>>2]=d;c[i>>2]=g;return 3}function Lr(a,b,d,e,f,g,h,i){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;c[f>>2]=d;c[i>>2]=g;return 3}function Nq(b){b=b|0;if((a[2656]|0)==0?(Va(2656)|0)!=0:0){xp(21600,21564,rt(21564)|0);Fb(310,21600,n|0)|0;cc(2656)}return 21600}function Mq(b){b=b|0;if((a[2672]|0)==0?(Va(2672)|0)!=0:0){xp(21708,21624,rt(21624)|0);Fb(310,21708,n|0)|0;cc(2672)}return 21708}function Lq(b){b=b|0;if((a[2688]|0)==0?(Va(2688)|0)!=0:0){xp(21780,21732,rt(21732)|0);Fb(310,21780,n|0)|0;cc(2688)}return 21780}function Kq(b){b=b|0;if((a[2640]|0)==0?(Va(2640)|0)!=0:0){xp(21540,21504,rt(21504)|0);Fb(310,21540,n|0)|0;cc(2640)}return 21540}function Wr(a,b){a=a|0;b=b|0;var d=0;if(b<<24>>24>-1)d=c[(c[(Me()|0)>>2]|0)+(b<<24>>24<<2)>>2]&255;else d=b;return d|0}function Cs(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;Gf[a&15](b|0,c|0,d|0,e|0,f|0,g|0)}function ks(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;Dc(a|0,b|0,c|0,d|0,e|0,f|0,g|0)}function Ur(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;Pb(a|0,b|0,c|0,d|0,e|0,f|0,g|0)}function Sr(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;ud(a|0,b|0,c|0,d|0,e|0,f|0,g|0)}function Ir(){var a=0,b=0;a=i;i=i+16|0;if(!(Ac(14932,2)|0)){b=ee(c[3732]|0)|0;i=a;return b|0}else Pr(27452,a);return 0}function zs(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=i;i=i+16|0;f=e;c[f>>2]=d;d=Yp(a,b,f)|0;i=e;return d|0}function ws(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=i;i=i+16|0;f=e;c[f>>2]=d;d=Yp(a,b,f)|0;i=e;return d|0}function Zr(a,b){a=a|0;b=b|0;var d=0;if(b<<24>>24>-1)d=c[(c[(Ec()|0)>>2]|0)+((b&255)<<2)>>2]&255;else d=b;return d|0}function vq(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;if((a|0)==(c[b+8>>2]|0))Rm(0,b,d,e,f);return}function tt(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=a+c>>>0;return (G=b+d+(e>>>0<a>>>0|0)>>>0,e|0)|0}function cq(b,d){b=b|0;d=d|0;c[b>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;a[b+128>>0]=0;if(d){Op(b,d);Eq(b,d)}return}function Uq(b){b=b|0;if((a[2664]|0)==0?(Va(2664)|0)!=0:0){wp(21612,34044,20);Fb(309,21612,n|0)|0;cc(2664)}return 21612}function Tq(b){b=b|0;if((a[2680]|0)==0?(Va(2680)|0)!=0:0){wp(21720,34065,11);Fb(309,21720,n|0)|0;cc(2680)}return 21720}function Wq(b){b=b|0;if((a[2648]|0)==0?(Va(2648)|0)!=0:0){wp(21552,34035,8);Fb(309,21552,n|0)|0;cc(2648)}return 21552}function Vq(b){b=b|0;if((a[2632]|0)==0?(Va(2632)|0)!=0:0){wp(21492,34026,8);Fb(309,21492,n|0)|0;cc(2632)}return 21492}function Ss(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;return Cf[a&31](b|0,c|0,d|0,e|0,f|0)|0}function Js(a,b){a=a|0;b=b|0;var c=0,d=0;c=gn(b,24867)|0;if(!c){d=-1;return d|0}d=am(a,c,1)|0;return d|0}function Ht(b,c){b=b|0;c=c|0;var d=0;do{a[b+d>>0]=a[c+d>>0];d=d+1|0}while(a[c+(d-1)>>0]|0);return b|0}function ys(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=i;i=i+16|0;f=e;c[f>>2]=d;Vl(a,5,b,f);i=e;return}function Wt(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;fa(20)}function ts(a,b){a=a|0;b=b|0;var d=0;if(b>>>0<128)d=c[(c[(Me()|0)>>2]|0)+(b<<2)>>2]|0;else d=b;return d|0}function ss(a,b){a=a|0;b=b|0;var d=0;if(b>>>0<128)d=c[(c[(Ec()|0)>>2]|0)+(b<<2)>>2]|0;else d=b;return d|0}function rt(a){a=a|0;var b=0,d=0;b=a;while(1)if(!(c[b>>2]|0)){d=b;break}else b=b+4|0;return d-a>>2|0}function Xs(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=+f;return Vf[a&7](b|0,c|0,d|0,e|0,+f)|0}function mu(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;fa(18);return 0}function ls(a){a=a|0;var b=0;c[a>>2]=18360;b=a+8|0;a=c[b>>2]|0;if((a|0)!=(Ps()|0))sc(c[b>>2]|0);return}function bt(b){b=b|0;var d=0;c[b>>2]=18292;d=c[b+8>>2]|0;if((d|0)!=0?(a[b+12>>0]|0)!=0:0)pB(d);return}function us(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;Rb(a|0,b|0,c|0,d|0,e|0,f|0)}function qs(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;xb(a|0,b|0,c|0,d|0,e|0,f|0)}function jt(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;wf[a&7](b|0,c|0,d|0,e|0,f|0)}function os(b){b=b|0;a[k>>0]=a[b>>0];a[k+1>>0]=a[b+1>>0];a[k+2>>0]=a[b+2>>0];a[k+3>>0]=a[b+3>>0]}function Nr(a){a=a|0;var b=0;b=i;i=i+16|0;yg(a);if(!(sd(c[3732]|0,0)|0)){i=b;return}else Pr(27606,b)}function Ps(){if((a[2040]|0)==0?(Va(2040)|0)!=0:0){c[4710]=lc(2147483647,33692,0)|0;cc(2040)}return c[4710]|0}function Ls(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;b=d-c|0;return (b>>>0<e>>>0?b:e)|0}function Ds(a,b){a=a|0;b=b|0;var d=0;d=c[a>>2]|0;a=Hq(b)|0;return c[(c[d+8>>2]|0)+(a<<2)>>2]|0}function Vu(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;fa(13)}function St(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return Pf[a&15](b|0,c|0,d|0,e|0)|0}function Wu(b,c){b=b|0;c=c|0;var d=0;d=jm(b,c)|0;return ((a[d>>0]|0)==(c&255)<<24>>24?d:0)|0}function kv(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;fa(0);return 0}function Ft(a,b,c,d,e,f,g){a=a|0;b=+b;c=+c;d=+d;e=+e;f=+f;g=+g;Qf[a&1](+b,+c,+d,+e,+f,+g)}function ns(){if((a[2360]|0)==0?(Va(2360)|0)!=0:0){cx()|0;c[4760]=19036;cc(2360)}return c[4760]|0}function ms(){if((a[2528]|0)==0?(Va(2528)|0)!=0:0){at()|0;c[4762]=19044;cc(2528)}return c[4762]|0}function Qq(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;if((a|0)==(c[b+8>>2]|0))ep(0,b,d,e);return}function Hs(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;Pt(d,a+28|0);i=b;return c[d>>2]|0}function Bu(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;Wf[a&63](b|0,c|0,d|0,e|0)}function zt(b,c){b=b|0;c=c|0;a[b>>0]=2;a[b+1>>0]=3;a[b+2>>0]=0;a[b+3>>0]=4;return}function yt(b,c){b=b|0;c=c|0;a[b>>0]=2;a[b+1>>0]=3;a[b+2>>0]=0;a[b+3>>0]=4;return}function xt(b,c){b=b|0;c=c|0;a[b>>0]=2;a[b+1>>0]=3;a[b+2>>0]=0;a[b+3>>0]=4;return}function wt(b,c){b=b|0;c=c|0;a[b>>0]=2;a[b+1>>0]=3;a[b+2>>0]=0;a[b+3>>0]=4;return}function vt(b,c){b=b|0;c=c|0;a[b>>0]=2;a[b+1>>0]=3;a[b+2>>0]=0;a[b+3>>0]=4;return}function ut(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ad(a|0,b|0,c|0,d|0,e|0)}function kt(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;hd(a|0,b|0,c|0,d|0,e|0)}function Pu(a){a=a|0;var b=0;if((a|0)!=0?($A(a)|0)!=0:0)b=Jd(a|0)|0;else b=0;return b|0}function Ms(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;Vd(a|0,b|0,c|0,d|0,e|0)}function Ks(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;jc(a|0,b|0,c|0,d|0,e|0)}function Ct(b,c){b=b|0;c=c|0;a[b>>0]=2;a[b+1>>0]=3;a[b+2>>0]=0;a[b+3>>0]=4;return}function Bt(b,c){b=b|0;c=c|0;a[b>>0]=2;a[b+1>>0]=3;a[b+2>>0]=0;a[b+3>>0]=4;return}function At(b,c){b=b|0;c=c|0;a[b>>0]=2;a[b+1>>0]=3;a[b+2>>0]=0;a[b+3>>0]=4;return}function Dv(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;fa(19)}function lu(a,b,c,d,e,f){a=a|0;b=b|0;c=+c;d=+d;e=+e;f=+f;Jf[a&3](b|0,+c,+d,+e,+f)}function Yr(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return Mh(c,d,e,1114111,0)|0}function Xr(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return Jh(c,d,e,1114111,0)|0}function lv(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return Em(a,b,(c|0)==0?33705:c,d)|0}function Bs(){var a=0;a=i;i=i+16|0;if(!(Nd(14928,272)|0)){i=a;return}else Pr(27556,a)}function ew(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;fa(7);return 0}function yw(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=+f;fa(1);return 0}function jv(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return Ef[a&31](b|0,c|0,d|0)|0}function Rt(a){a=a|0;var b=0;b=c[a>>2]|0;if((b|0)!=(Ps()|0))sc(c[a>>2]|0);return}function ru(a){a=a|0;var b=0;if(!a)b=0;else b=(Hl(a,816,864,0)|0)!=0;return b&1|0}function Gt(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function Et(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function Dt(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function ku(a,b,c,d,e,f){a=+a;b=+b;c=+c;d=+d;e=+e;f=+f;Fe(+a,+b,+c,+d,+e,+f)}function Mw(a){a=a|0;return (a&255)<<24|(a>>8&255)<<16|(a>>16&255)<<8|a>>>24|0}function uw(a){a=a|0;return (d[a+1>>0]|0)<<8|(d[a>>0]|0)|(d[a+2>>0]|0)<<16|0}function mv(a,b){a=a|0;b=b|0;var c=0;if(!a)c=0;else c=tn(a,b,0)|0;return c|0}function Lw(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;fa(14)}function tw(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;d=Xo(a,b,c)|0;return d|0}function nv(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=+d;e=+e;Bf[a&3](b|0,+c,+d,+e)}function fw(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;d=_o(a,b,c)|0;return d|0}function ov(a){a=a|0;var b=0;b=c[4566]|0;c[4566]=b+1;c[a+4>>2]=b+1;return}function Ow(a,b,c){a=a|0;b=b|0;c=c|0;return vk(0,a,b,(c|0)!=0?c:14772)|0}function Fw(a,b,c){a=a|0;b=b|0;c=c|0;Cp(a|0,b&255|0,c|0)|0;return a|0}function vu(a,b){a=a|0;b=b|0;c[a>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;return}function uu(a,b){a=a|0;b=b|0;c[a>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;return}function tu(a,b){a=a|0;b=b|0;c[a>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;return}function su(a,b){a=a|0;b=b|0;c[a>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;return}function jx(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;fa(10);return 0}function Pt(a,b){a=a|0;b=b|0;var d=0;d=c[b>>2]|0;c[a>>2]=d;rv(d);return}function Ou(a,b){a=a|0;b=b|0;c[a>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;return}function Nu(a,b){a=a|0;b=b|0;c[a>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;return}function Mu(a,b){a=a|0;b=b|0;c[a>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;return}function Lu(a,b){a=a|0;b=b|0;c[a>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;return}function Fu(a,b){a=a|0;b=b|0;c[a>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;return}function Eu(a,b){a=a|0;b=b|0;c[a>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;return}function Du(a,b){a=a|0;b=b|0;c[a>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;return}function Cu(a,b){a=a|0;b=b|0;c[a>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;return}function Jv(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;Hf[a&31](b|0,c|0,d|0)}function yu(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;Xe(a|0,b|0,c|0,d|0)}function xu(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;mc(a|0,b|0,c|0,d|0)}function wu(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;je(a|0,b|0,c|0,d|0)}function st(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;Wd(a|0,b|0,c|0,d|0)}function qu(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;Oe(a|0,b|0,c|0,d|0)}function qt(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;Ra(a|0,b|0,c|0,d|0)}function pu(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;Gc(a|0,b|0,c|0,d|0)}function nu(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;Ld(a|0,b|0,c|0,d|0)}function ju(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;rb(a|0,b|0,c|0,d|0)}function iu(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;Nc(a|0,b|0,c|0,d|0)}function _t(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;Vb(a|0,b|0,c|0,d|0)}function Zt(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;Hd(a|0,b|0,c|0,d|0)}function Yt(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;de(a|0,b|0,c|0,d|0)}function Xu(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;Hb(a|0,b|0,c|0,d|0)}function Vt(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;Qa(a|0,b|0,c|0,d|0)}function Uu(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;Ya(a|0,b|0,c|0,d|0)}function Ut(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;_e(a|0,b|0,c|0,d|0)}function Tu(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;of(a|0,b|0,c|0,d|0)}function Tt(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;Mb(a|0,b|0,c|0,d|0)}function Su(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;yc(a|0,b|0,c|0,d|0)}function Qt(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;Xb(a|0,b|0,c|0,d|0)}function Ot(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ke(a|0,b|0,c|0,d|0)}function Nt(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;Wa(a|0,b|0,c|0,d|0)}function Mt(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ne(a|0,b|0,c|0,d|0)}function Kv(a){a=a|0;var b=0;if(!a)b=1;else b=(c[a>>2]|0)==0;return b&1|0}function Ku(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;xc(a|0,b|0,c|0,d|0)}function Is(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;Yc(a|0,b|0,c|0,d|0)}function $t(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;kd(a|0,b|0,c|0,d|0)}function Xw(b){b=b|0;var c=0;c=b;while(a[c>>0]|0)c=c+1|0;return c-b|0}function Jx(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;fa(29);return 0}function xv(a,b,c,d,e){a=a|0;b=+b;c=+c;d=+d;e=+e;Rf[a&3](+b,+c,+d,+e)}function hu(a,b,c,d,e){a=a|0;b=+b;c=+c;d=+d;e=+e;Bd(a|0,+b,+c,+d,+e)}
function pg(f){f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0;g=c[f+24>>2]|0;h=c[f+28>>2]|0;i=c[f+16>>2]|0;j=c[f+36>>2]|0;k=c[f+44>>2]|0;l=c[(c[(c[f+40>>2]|0)+4>>2]|0)+4>>2]|0;m=d[f+63>>0]|0;n=d[k+9>>0]|0;if(!h)return;o=(g+3|0)/4|0;p=g&3;g=k+28|0;q=k+32|0;r=k+29|0;s=k+33|0;t=k+30|0;u=k+34|0;v=k+31|0;w=k+35|0;x=k+12|0;y=k+16|0;z=k+20|0;A=k+24|0;k=h;h=c[f+20>>2]|0;B=c[f>>2]|0;a:while(1){f=k+-1|0;switch(p|0){case 0:{C=h;D=o;E=B;F=4;break}case 3:{G=h;H=o;I=B;F=15;break}case 2:{J=h;K=o;L=B;F=26;break}case 1:{M=h;N=o;O=B;F=37;break}default:{P=h;Q=B;F=48}}while(1)if((F|0)==4){F=0;R=d[E>>0]|0;S=d[l+(R<<2)>>0]|0;T=d[l+(R<<2)+1>>0]|0;U=d[l+(R<<2)+2>>0]|0;switch(n|0){case 1:{R=d[C>>0]|0;V=d[(c[5452+((d[v>>0]|0)<<2)>>2]|0)+((c[A>>2]&R)>>>(d[w>>0]|0))>>0]|0;W=d[(c[5452+((d[t>>0]|0)<<2)>>2]|0)+((c[z>>2]&R)>>>(d[u>>0]|0))>>0]|0;X=d[(c[5452+((d[r>>0]|0)<<2)>>2]|0)+((c[y>>2]&R)>>>(d[s>>0]|0))>>0]|0;Y=d[(c[5452+((d[g>>0]|0)<<2)>>2]|0)+((R&c[x>>2])>>>(d[q>>0]|0))>>0]|0;break}case 2:{R=e[C>>1]|0;V=d[(c[5452+((d[v>>0]|0)<<2)>>2]|0)+((c[A>>2]&R)>>>(d[w>>0]|0))>>0]|0;W=d[(c[5452+((d[t>>0]|0)<<2)>>2]|0)+((c[z>>2]&R)>>>(d[u>>0]|0))>>0]|0;X=d[(c[5452+((d[r>>0]|0)<<2)>>2]|0)+((c[y>>2]&R)>>>(d[s>>0]|0))>>0]|0;Y=d[(c[5452+((d[g>>0]|0)<<2)>>2]|0)+((R&c[x>>2])>>>(d[q>>0]|0))>>0]|0;break}case 3:{V=255;W=d[C+((d[u>>0]|0)>>>3&255)>>0]|0;X=d[C+((d[s>>0]|0)>>>3&255)>>0]|0;Y=d[C+((d[q>>0]|0)>>>3&255)>>0]|0;break}case 4:{R=c[C>>2]|0;V=d[(c[5452+((d[v>>0]|0)<<2)>>2]|0)+((c[A>>2]&R)>>>(d[w>>0]|0))>>0]|0;W=d[(c[5452+((d[t>>0]|0)<<2)>>2]|0)+((c[z>>2]&R)>>>(d[u>>0]|0))>>0]|0;X=d[(c[5452+((d[r>>0]|0)<<2)>>2]|0)+((c[y>>2]&R)>>>(d[s>>0]|0))>>0]|0;Y=d[(c[5452+((d[g>>0]|0)<<2)>>2]|0)+((c[x>>2]&R)>>>(d[q>>0]|0))>>0]|0;break}default:{V=0;W=0;X=0;Y=0}}R=(((ca(S-Y|0,m)|0)>>>0)/255|0)+Y|0;S=(((ca(T-X|0,m)|0)>>>0)/255|0)+X|0;T=(((ca(U-W|0,m)|0)>>>0)/255|0)+W|0;U=V+m-(((ca(V,m)|0)>>>0)/255|0)|0;switch(n|0){case 1:{a[C>>0]=S>>>(d[r>>0]|0)<<(d[s>>0]|0)|R>>>(d[g>>0]|0)<<(d[q>>0]|0)|T>>>(d[t>>0]|0)<<(d[u>>0]|0)|U>>>(d[v>>0]|0)<<(d[w>>0]|0);break}case 2:{b[C>>1]=S>>>(d[r>>0]|0)<<(d[s>>0]|0)|R>>>(d[g>>0]|0)<<(d[q>>0]|0)|T>>>(d[t>>0]|0)<<(d[u>>0]|0)|U>>>(d[v>>0]|0)<<(d[w>>0]|0);break}case 3:{a[C+((d[q>>0]|0)>>>3&255)>>0]=R;a[C+((d[s>>0]|0)>>>3&255)>>0]=S;a[C+((d[u>>0]|0)>>>3&255)>>0]=T;break}case 4:{c[C>>2]=S>>>(d[r>>0]|0)<<(d[s>>0]|0)|R>>>(d[g>>0]|0)<<(d[q>>0]|0)|T>>>(d[t>>0]|0)<<(d[u>>0]|0)|U>>>(d[v>>0]|0)<<(d[w>>0]|0);break}default:{}}G=C+n|0;H=D;I=E+1|0;F=15;continue}else if((F|0)==15){F=0;U=d[I>>0]|0;T=d[l+(U<<2)>>0]|0;R=d[l+(U<<2)+1>>0]|0;S=d[l+(U<<2)+2>>0]|0;switch(n|0){case 1:{U=d[G>>0]|0;Z=d[(c[5452+((d[v>>0]|0)<<2)>>2]|0)+((c[A>>2]&U)>>>(d[w>>0]|0))>>0]|0;_=d[(c[5452+((d[t>>0]|0)<<2)>>2]|0)+((c[z>>2]&U)>>>(d[u>>0]|0))>>0]|0;$=d[(c[5452+((d[r>>0]|0)<<2)>>2]|0)+((c[y>>2]&U)>>>(d[s>>0]|0))>>0]|0;aa=d[(c[5452+((d[g>>0]|0)<<2)>>2]|0)+((U&c[x>>2])>>>(d[q>>0]|0))>>0]|0;break}case 2:{U=e[G>>1]|0;Z=d[(c[5452+((d[v>>0]|0)<<2)>>2]|0)+((c[A>>2]&U)>>>(d[w>>0]|0))>>0]|0;_=d[(c[5452+((d[t>>0]|0)<<2)>>2]|0)+((c[z>>2]&U)>>>(d[u>>0]|0))>>0]|0;$=d[(c[5452+((d[r>>0]|0)<<2)>>2]|0)+((c[y>>2]&U)>>>(d[s>>0]|0))>>0]|0;aa=d[(c[5452+((d[g>>0]|0)<<2)>>2]|0)+((U&c[x>>2])>>>(d[q>>0]|0))>>0]|0;break}case 3:{Z=255;_=d[G+((d[u>>0]|0)>>>3&255)>>0]|0;$=d[G+((d[s>>0]|0)>>>3&255)>>0]|0;aa=d[G+((d[q>>0]|0)>>>3&255)>>0]|0;break}case 4:{U=c[G>>2]|0;Z=d[(c[5452+((d[v>>0]|0)<<2)>>2]|0)+((c[A>>2]&U)>>>(d[w>>0]|0))>>0]|0;_=d[(c[5452+((d[t>>0]|0)<<2)>>2]|0)+((c[z>>2]&U)>>>(d[u>>0]|0))>>0]|0;$=d[(c[5452+((d[r>>0]|0)<<2)>>2]|0)+((c[y>>2]&U)>>>(d[s>>0]|0))>>0]|0;aa=d[(c[5452+((d[g>>0]|0)<<2)>>2]|0)+((c[x>>2]&U)>>>(d[q>>0]|0))>>0]|0;break}default:{Z=0;_=0;$=0;aa=0}}U=(((ca(T-aa|0,m)|0)>>>0)/255|0)+aa|0;T=(((ca(R-$|0,m)|0)>>>0)/255|0)+$|0;R=(((ca(S-_|0,m)|0)>>>0)/255|0)+_|0;S=Z+m-(((ca(Z,m)|0)>>>0)/255|0)|0;switch(n|0){case 1:{a[G>>0]=T>>>(d[r>>0]|0)<<(d[s>>0]|0)|U>>>(d[g>>0]|0)<<(d[q>>0]|0)|R>>>(d[t>>0]|0)<<(d[u>>0]|0)|S>>>(d[v>>0]|0)<<(d[w>>0]|0);break}case 2:{b[G>>1]=T>>>(d[r>>0]|0)<<(d[s>>0]|0)|U>>>(d[g>>0]|0)<<(d[q>>0]|0)|R>>>(d[t>>0]|0)<<(d[u>>0]|0)|S>>>(d[v>>0]|0)<<(d[w>>0]|0);break}case 3:{a[G+((d[q>>0]|0)>>>3&255)>>0]=U;a[G+((d[s>>0]|0)>>>3&255)>>0]=T;a[G+((d[u>>0]|0)>>>3&255)>>0]=R;break}case 4:{c[G>>2]=T>>>(d[r>>0]|0)<<(d[s>>0]|0)|U>>>(d[g>>0]|0)<<(d[q>>0]|0)|R>>>(d[t>>0]|0)<<(d[u>>0]|0)|S>>>(d[v>>0]|0)<<(d[w>>0]|0);break}default:{}}J=G+n|0;K=H;L=I+1|0;F=26;continue}else if((F|0)==26){F=0;S=d[L>>0]|0;R=d[l+(S<<2)>>0]|0;U=d[l+(S<<2)+1>>0]|0;T=d[l+(S<<2)+2>>0]|0;switch(n|0){case 1:{S=d[J>>0]|0;ba=d[(c[5452+((d[v>>0]|0)<<2)>>2]|0)+((c[A>>2]&S)>>>(d[w>>0]|0))>>0]|0;da=d[(c[5452+((d[t>>0]|0)<<2)>>2]|0)+((c[z>>2]&S)>>>(d[u>>0]|0))>>0]|0;ea=d[(c[5452+((d[r>>0]|0)<<2)>>2]|0)+((c[y>>2]&S)>>>(d[s>>0]|0))>>0]|0;fa=d[(c[5452+((d[g>>0]|0)<<2)>>2]|0)+((S&c[x>>2])>>>(d[q>>0]|0))>>0]|0;break}case 2:{S=e[J>>1]|0;ba=d[(c[5452+((d[v>>0]|0)<<2)>>2]|0)+((c[A>>2]&S)>>>(d[w>>0]|0))>>0]|0;da=d[(c[5452+((d[t>>0]|0)<<2)>>2]|0)+((c[z>>2]&S)>>>(d[u>>0]|0))>>0]|0;ea=d[(c[5452+((d[r>>0]|0)<<2)>>2]|0)+((c[y>>2]&S)>>>(d[s>>0]|0))>>0]|0;fa=d[(c[5452+((d[g>>0]|0)<<2)>>2]|0)+((S&c[x>>2])>>>(d[q>>0]|0))>>0]|0;break}case 3:{ba=255;da=d[J+((d[u>>0]|0)>>>3&255)>>0]|0;ea=d[J+((d[s>>0]|0)>>>3&255)>>0]|0;fa=d[J+((d[q>>0]|0)>>>3&255)>>0]|0;break}case 4:{S=c[J>>2]|0;ba=d[(c[5452+((d[v>>0]|0)<<2)>>2]|0)+((c[A>>2]&S)>>>(d[w>>0]|0))>>0]|0;da=d[(c[5452+((d[t>>0]|0)<<2)>>2]|0)+((c[z>>2]&S)>>>(d[u>>0]|0))>>0]|0;ea=d[(c[5452+((d[r>>0]|0)<<2)>>2]|0)+((c[y>>2]&S)>>>(d[s>>0]|0))>>0]|0;fa=d[(c[5452+((d[g>>0]|0)<<2)>>2]|0)+((c[x>>2]&S)>>>(d[q>>0]|0))>>0]|0;break}default:{ba=0;da=0;ea=0;fa=0}}S=(((ca(R-fa|0,m)|0)>>>0)/255|0)+fa|0;R=(((ca(U-ea|0,m)|0)>>>0)/255|0)+ea|0;U=(((ca(T-da|0,m)|0)>>>0)/255|0)+da|0;T=ba+m-(((ca(ba,m)|0)>>>0)/255|0)|0;switch(n|0){case 1:{a[J>>0]=R>>>(d[r>>0]|0)<<(d[s>>0]|0)|S>>>(d[g>>0]|0)<<(d[q>>0]|0)|U>>>(d[t>>0]|0)<<(d[u>>0]|0)|T>>>(d[v>>0]|0)<<(d[w>>0]|0);break}case 2:{b[J>>1]=R>>>(d[r>>0]|0)<<(d[s>>0]|0)|S>>>(d[g>>0]|0)<<(d[q>>0]|0)|U>>>(d[t>>0]|0)<<(d[u>>0]|0)|T>>>(d[v>>0]|0)<<(d[w>>0]|0);break}case 3:{a[J+((d[q>>0]|0)>>>3&255)>>0]=S;a[J+((d[s>>0]|0)>>>3&255)>>0]=R;a[J+((d[u>>0]|0)>>>3&255)>>0]=U;break}case 4:{c[J>>2]=R>>>(d[r>>0]|0)<<(d[s>>0]|0)|S>>>(d[g>>0]|0)<<(d[q>>0]|0)|U>>>(d[t>>0]|0)<<(d[u>>0]|0)|T>>>(d[v>>0]|0)<<(d[w>>0]|0);break}default:{}}M=J+n|0;N=K;O=L+1|0;F=37;continue}else if((F|0)==37){F=0;T=d[O>>0]|0;U=d[l+(T<<2)>>0]|0;S=d[l+(T<<2)+1>>0]|0;R=d[l+(T<<2)+2>>0]|0;switch(n|0){case 1:{T=d[M>>0]|0;ga=d[(c[5452+((d[v>>0]|0)<<2)>>2]|0)+((c[A>>2]&T)>>>(d[w>>0]|0))>>0]|0;ha=d[(c[5452+((d[t>>0]|0)<<2)>>2]|0)+((c[z>>2]&T)>>>(d[u>>0]|0))>>0]|0;ia=d[(c[5452+((d[r>>0]|0)<<2)>>2]|0)+((c[y>>2]&T)>>>(d[s>>0]|0))>>0]|0;ja=d[(c[5452+((d[g>>0]|0)<<2)>>2]|0)+((T&c[x>>2])>>>(d[q>>0]|0))>>0]|0;break}case 2:{T=e[M>>1]|0;ga=d[(c[5452+((d[v>>0]|0)<<2)>>2]|0)+((c[A>>2]&T)>>>(d[w>>0]|0))>>0]|0;ha=d[(c[5452+((d[t>>0]|0)<<2)>>2]|0)+((c[z>>2]&T)>>>(d[u>>0]|0))>>0]|0;ia=d[(c[5452+((d[r>>0]|0)<<2)>>2]|0)+((c[y>>2]&T)>>>(d[s>>0]|0))>>0]|0;ja=d[(c[5452+((d[g>>0]|0)<<2)>>2]|0)+((T&c[x>>2])>>>(d[q>>0]|0))>>0]|0;break}case 3:{ga=255;ha=d[M+((d[u>>0]|0)>>>3&255)>>0]|0;ia=d[M+((d[s>>0]|0)>>>3&255)>>0]|0;ja=d[M+((d[q>>0]|0)>>>3&255)>>0]|0;break}case 4:{T=c[M>>2]|0;ga=d[(c[5452+((d[v>>0]|0)<<2)>>2]|0)+((c[A>>2]&T)>>>(d[w>>0]|0))>>0]|0;ha=d[(c[5452+((d[t>>0]|0)<<2)>>2]|0)+((c[z>>2]&T)>>>(d[u>>0]|0))>>0]|0;ia=d[(c[5452+((d[r>>0]|0)<<2)>>2]|0)+((c[y>>2]&T)>>>(d[s>>0]|0))>>0]|0;ja=d[(c[5452+((d[g>>0]|0)<<2)>>2]|0)+((c[x>>2]&T)>>>(d[q>>0]|0))>>0]|0;break}default:{ga=0;ha=0;ia=0;ja=0}}T=(((ca(U-ja|0,m)|0)>>>0)/255|0)+ja|0;U=(((ca(S-ia|0,m)|0)>>>0)/255|0)+ia|0;S=(((ca(R-ha|0,m)|0)>>>0)/255|0)+ha|0;R=ga+m-(((ca(ga,m)|0)>>>0)/255|0)|0;switch(n|0){case 1:{a[M>>0]=U>>>(d[r>>0]|0)<<(d[s>>0]|0)|T>>>(d[g>>0]|0)<<(d[q>>0]|0)|S>>>(d[t>>0]|0)<<(d[u>>0]|0)|R>>>(d[v>>0]|0)<<(d[w>>0]|0);break}case 2:{b[M>>1]=U>>>(d[r>>0]|0)<<(d[s>>0]|0)|T>>>(d[g>>0]|0)<<(d[q>>0]|0)|S>>>(d[t>>0]|0)<<(d[u>>0]|0)|R>>>(d[v>>0]|0)<<(d[w>>0]|0);break}case 3:{a[M+((d[q>>0]|0)>>>3&255)>>0]=T;a[M+((d[s>>0]|0)>>>3&255)>>0]=U;a[M+((d[u>>0]|0)>>>3&255)>>0]=S;break}case 4:{c[M>>2]=U>>>(d[r>>0]|0)<<(d[s>>0]|0)|T>>>(d[g>>0]|0)<<(d[q>>0]|0)|S>>>(d[t>>0]|0)<<(d[u>>0]|0)|R>>>(d[v>>0]|0)<<(d[w>>0]|0);break}default:{}}R=O+1|0;S=M+n|0;if((N|0)>1){C=S;D=N+-1|0;E=R;F=4;continue}else{P=S;Q=R;F=48;continue}}else if((F|0)==48){F=0;if(!f)break a;else{k=f;h=P+j|0;B=Q+i|0;continue a}}}return}function qg(f,g,h,i){f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0;j=f+8|0;k=c[j>>2]|0;l=h+4|0;m=c[l>>2]|0;if((c[h>>2]&2|0)!=0?(Fq(h)|0)<0:0){n=-1;return n|0}o=c[h+20>>2]|0;p=h+16|0;q=ca(c[p>>2]|0,c[i+4>>2]|0)|0;r=a[m+9>>0]|0;s=r&255;t=(ca(s,c[i>>2]|0)|0)+q|0;q=o+t|0;i=(c[(c[f+52>>2]|0)+12>>2]|0)+28|0;f=c[g+4>>2]|0;a:do if(!f){u=i;v=20}else{if(r<<24>>24==2){w=i;x=f}else{y=i;z=f<<1;while(1){A=0;B=y;while(1){C=(e[B>>1]|0)+A|0;D=b[B+2>>1]|0;E=D&65535;if(!(D<<16>>16))if(!C)break a;else{F=C;G=B+4|0}else{F=C+E|0;G=B+((E<<2)+4)|0}if((F|0)<(k|0)){A=F;B=G}else{H=G;break}}z=z+-1|0;if(!z){u=H;v=20;break a}else y=H}}while(1){y=0;z=w;while(1){B=(d[z>>0]|0)+y|0;A=a[z+1>>0]|0;E=A&255;if(!(A<<24>>24))if(!B)break a;else{I=2;J=B;K=z+2|0}else{A=(E<<1)+2|0;I=A;J=B+E|0;K=z+A|0}if((J|0)<(k|0)){y=J;z=K}else{L=I;M=z;N=K;break}}z=0;y=M+((N&2)+L)|0;while(1){A=e[y+2>>1]|0;E=y+((A<<2)+4)|0;z=(e[y>>1]|0)+z+A|0;if((z|0)>=(k|0)){O=E;break}else y=E}x=x+-1|0;if(!x){u=O;v=20;break}else w=O}}while(0);b:do if((v|0)==20){O=c[g>>2]|0;if((O|0)==0?(c[g+8>>2]|0)==(c[j>>2]|0):0){switch(s|0){case 2:break;case 4:{w=q;x=c[g+12>>2]|0;L=u;while(1){N=0;M=L;while(1){K=(e[M>>1]|0)+N|0;I=b[M+2>>1]|0;J=I&65535;H=M+4|0;if(!(I<<16>>16))if(!K)break b;else{P=K;Q=H}else{I=J<<2;ax(w+(K<<2)|0,H,I)|0;P=K+J|0;Q=M+(I+4)|0}if((P|0)<(k|0)){N=P;M=Q}else{R=Q;break}}M=0;N=R;while(1){I=(e[N>>1]|0)+M|0;J=b[N+2>>1]|0;K=J&65535;H=N+4|0;if(!(J<<16>>16)){S=I;T=H}else{J=K<<2;G=w+(I<<2)|0;F=0;f=H;while(1){H=c[f>>2]|0;i=c[G>>2]|0;r=H>>>24;y=i&16711935;z=i&65280;c[G>>2]=((ca((H&65280)-z|0,r)|0)>>>8)+z&65280|((ca((H&16711935)-y|0,r)|0)>>>8)+y&16711935|-16777216;F=F+1|0;if((F|0)==(K|0))break;else{G=G+4|0;f=f+4|0}}S=I+K|0;T=N+(J+4)|0}if((S|0)<(k|0)){M=S;N=T}else{U=T;break}}N=x+-1|0;if(!N)break b;else{w=w+(c[p>>2]|0)|0;x=N;L=U}}break}default:break b}if(((c[m+16>>2]|0)!=2016?(c[m+12>>2]|0)!=2016:0)?(c[m+20>>2]|0)!=2016:0){L=q;x=c[g+12>>2]|0;w=u;while(1){N=0;M=w;while(1){f=(d[M>>0]|0)+N|0;G=a[M+1>>0]|0;F=G&255;y=M+2|0;if(!(G<<24>>24))if(!f)break b;else{V=2;W=f;X=y}else{G=F<<1;ax(L+(f<<1)|0,y,G)|0;y=G+2|0;V=y;W=f+F|0;X=M+y|0}if((W|0)<(k|0)){N=W;M=X}else{Y=V;Z=M;_=X;break}}M=0;N=Z+((_&2)+Y)|0;while(1){y=(e[N>>1]|0)+M|0;F=b[N+2>>1]|0;f=F&65535;G=N+4|0;if(!(F<<16>>16)){$=y;aa=G}else{F=f<<2;r=L+(y<<1)|0;H=0;z=G;while(1){G=c[z>>2]|0;i=e[r>>1]|0;E=(i<<16|i)&65043487;i=((ca((G&65043487)-E|0,G>>>5&31)|0)>>>5)+E&65043487;b[r>>1]=i>>>16|i;H=H+1|0;if((H|0)==(f|0))break;else{r=r+2|0;z=z+4|0}}$=y+f|0;aa=N+(F+4)|0}if(($|0)<(k|0)){M=$;N=aa}else{ba=aa;break}}N=x+-1|0;if(!N)break b;else{L=L+(c[p>>2]|0)|0;x=N;w=ba}}}w=q;x=c[g+12>>2]|0;L=u;while(1){N=0;M=L;while(1){z=(d[M>>0]|0)+N|0;r=a[M+1>>0]|0;H=r&255;J=M+2|0;if(!(r<<24>>24))if(!z)break b;else{da=2;ea=z;fa=J}else{r=H<<1;ax(w+(z<<1)|0,J,r)|0;J=r+2|0;da=J;ea=z+H|0;fa=M+J|0}if((ea|0)<(k|0)){N=ea;M=fa}else{ga=da;ha=fa;ia=M;break}}M=0;N=ia+((ha&2)+ga)|0;while(1){J=(e[N>>1]|0)+M|0;H=b[N+2>>1]|0;z=H&65535;r=N+4|0;if(!(H<<16>>16)){ja=J;ka=r}else{H=z<<2;K=w+(J<<1)|0;I=0;i=r;while(1){r=c[i>>2]|0;E=e[K>>1]|0;G=(E<<16|E)&132184095;E=((ca((r&132184095)-G|0,r>>>5&31)|0)>>>5)+G&132184095;b[K>>1]=E>>>16|E;I=I+1|0;if((I|0)==(z|0))break;else{K=K+2|0;i=i+4|0}}ja=J+z|0;ka=N+(H+4)|0}if((ja|0)<(k|0)){M=ja;N=ka}else{la=ka;break}}N=x+-1|0;if(!N)break b;else{w=w+(c[p>>2]|0)|0;x=N;L=la}}}L=c[l>>2]|0;switch(d[L+9>>0]|0|0){case 2:break;case 4:{x=c[g+8>>2]|0;w=x+O|0;N=~x-O|0;x=u;M=o+(t-(O<<2))|0;i=c[g+12>>2]|0;while(1){K=x;I=0;while(1){F=(e[K>>1]|0)+I|0;f=b[K+2>>1]|0;y=f&65535;if(!(f<<16>>16))if(!F)break b;else{ma=K+4|0;na=F}else{f=O-F|0;E=(f|0)>0;G=E?O:F;r=y-(E?f:0)|0;f=w-G|0;E=(r|0)>(f|0)?f:r;if((E|0)>0)ax(M+(G<<2)|0,K+((G-F<<2)+4)|0,E<<2)|0;ma=K+((y<<2)+4)|0;na=F+y|0}if((na|0)<(k|0)){K=ma;I=na}else{oa=ma;break}}I=oa;K=0;while(1){y=e[I>>1]|0;F=y+K|0;E=b[I+2>>1]|0;G=E&65535;r=I+4|0;if(!(E<<16>>16)){pa=r;qa=F}else{E=O-F|0;f=(E|0)>0;A=f?O:F;B=f?E:0;E=G-B|0;f=w-A|0;if((((E|0)>(f|0)?f:E)|0)>0){E=A-F|0;f=N+K+y+B|0;y=B+~G|0;B=~((f|0)>(y|0)?f:y);y=0;do{f=c[r+(E+y<<2)>>2]|0;C=M+(y+A<<2)|0;D=c[C>>2]|0;ra=f>>>24;sa=D&16711935;ta=D&65280;c[C>>2]=((ca((f&16711935)-sa|0,ra)|0)>>>8)+sa&16711935|((ca((f&65280)-ta|0,ra)|0)>>>8)+ta&65280|-16777216;y=y+1|0}while((y|0)!=(B|0))}pa=I+((G<<2)+4)|0;qa=F+G|0}if((qa|0)<(k|0)){I=pa;K=qa}else{ua=pa;break}}K=i+-1|0;if(!K)break b;else{x=ua;M=M+(c[p>>2]|0)|0;i=K}}break}default:break b}if(((c[L+16>>2]|0)!=2016?(c[L+12>>2]|0)!=2016:0)?(c[L+20>>2]|0)!=2016:0){i=c[g+8>>2]|0;M=i+O|0;x=~i-O|0;i=o+(t-(O<<1))|0;N=u;w=c[g+12>>2]|0;while(1){K=N;I=0;while(1){B=(d[K>>0]|0)+I|0;y=a[K+1>>0]|0;A=y&255;if(!(y<<24>>24))if(!B)break b;else{va=K+2|0;wa=2;xa=B}else{y=O-B|0;E=(y|0)>0;r=A-(E?y:0)|0;y=E?O:B;E=M-y|0;H=(r|0)>(E|0)?E:r;if((H|0)>0)ax(i+(y<<1)|0,K+((y-B<<1)+2)|0,H<<1)|0;H=(A<<1)+2|0;va=K+H|0;wa=H;xa=B+A|0}if((xa|0)<(k|0)){K=va;I=xa}else{ya=K;za=va;Aa=wa;break}}K=ya+((za&2)+Aa)|0;I=0;while(1){A=e[K>>1]|0;B=A+I|0;H=b[K+2>>1]|0;y=H&65535;r=K+4|0;if(!(H<<16>>16)){Ba=r;Ca=B}else{H=O-B|0;E=(H|0)>0;z=E?H:0;H=y-z|0;J=E?O:B;E=M-J|0;if((((H|0)>(E|0)?E:H)|0)>0){H=J-B|0;E=x+I+A+z|0;A=z+~y|0;z=~((E|0)>(A|0)?E:A);A=0;do{E=c[r+(H+A<<2)>>2]|0;ta=i+(A+J<<1)|0;ra=e[ta>>1]|0;f=(ra<<16|ra)&65043487;ra=((ca((E&65043487)-f|0,E>>>5&31)|0)>>>5)+f&65043487;b[ta>>1]=ra>>>16|ra;A=A+1|0}while((A|0)!=(z|0))}Ba=K+((y<<2)+4)|0;Ca=B+y|0}if((Ca|0)<(k|0)){K=Ba;I=Ca}else{Da=Ba;break}}I=w+-1|0;if(!I)break b;else{i=i+(c[p>>2]|0)|0;N=Da;w=I}}}w=c[g+8>>2]|0;N=w+O|0;i=~w-O|0;w=u;x=o+(t-(O<<1))|0;M=c[g+12>>2]|0;while(1){L=w;I=0;while(1){K=(d[L>>0]|0)+I|0;z=a[L+1>>0]|0;A=z&255;if(!(z<<24>>24))if(!K)break b;else{Ea=L+2|0;Fa=2;Ga=K}else{z=O-K|0;J=(z|0)>0;H=A-(J?z:0)|0;z=J?O:K;J=N-z|0;r=(H|0)>(J|0)?J:H;if((r|0)>0)ax(x+(z<<1)|0,L+((z-K<<1)+2)|0,r<<1)|0;r=(A<<1)+2|0;Ea=L+r|0;Fa=r;Ga=K+A|0}if((Ga|0)<(k|0)){L=Ea;I=Ga}else{Ha=L;Ia=Ea;Ja=Fa;break}}L=Ha+((Ia&2)+Ja)|0;I=0;while(1){A=e[L>>1]|0;K=A+I|0;r=b[L+2>>1]|0;z=r&65535;H=L+4|0;if(!(r<<16>>16)){Ka=H;La=K}else{r=O-K|0;J=(r|0)>0;G=J?r:0;r=z-G|0;F=J?O:K;J=N-F|0;if((((r|0)>(J|0)?J:r)|0)>0){r=F-K|0;J=i+I+A+G|0;A=G+~z|0;G=~((J|0)>(A|0)?J:A);A=0;do{J=c[H+(r+A<<2)>>2]|0;ra=x+(A+F<<1)|0;ta=e[ra>>1]|0;f=(ta<<16|ta)&132184095;ta=((ca((J&132184095)-f|0,J>>>5&31)|0)>>>5)+f&132184095;b[ra>>1]=ta>>>16|ta;A=A+1|0}while((A|0)!=(G|0))}Ka=L+((z<<2)+4)|0;La=K+z|0}if((La|0)<(k|0)){L=Ka;I=La}else{Ma=Ka;break}}I=M+-1|0;if(!I)break;else{w=Ma;x=x+(c[p>>2]|0)|0;M=I}}}while(0);if(!(c[h>>2]&2)){n=0;return n|0}$q(h);n=0;return n|0}function sg(e){e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0;if(c[e>>2]&2)si(e,1);f=e+4|0;g=c[f>>2]|0;h=a[g+8>>0]|0;if((h&255)<8){i=-1;return i|0}j=e+20|0;if(!(c[j>>2]|0)){i=-1;return i|0}k=e+52|0;l=c[k>>2]|0;m=c[l+68>>2]|0;if(!((m&272|0)!=0&(m&1|0)==0)){i=-1;return i|0}do if(!(m&2))if(!(m&608)){n=c[g+24>>2]|0;break}else{i=-1;return i|0}else{o=c[g+24>>2]|0;if(!(m&608|o))n=o;else{i=-1;return i|0}}while(0);if((m&16|0)==0|(n|0)==0){if(!(c[l+4>>2]|0)){i=-1;return i|0}n=a[g+9>>0]|0;g=n&255;switch(g|0){case 1:{p=(ca((c[e+12>>2]|0)*3|0,((c[e+8>>2]|0)/2|0)+1|0)|0)+2|0;break}case 3:case 2:{m=c[e+8>>2]|0;p=(ca((ca(m,g)|0)+2+(((m|0)/255|0)<<1)|0,c[e+12>>2]|0)|0)+2|0;break}case 4:{m=c[e+8>>2]|0;p=(ca((((m|0)/65535|0)+m<<2)+4|0,c[e+12>>2]|0)|0)+4|0;break}default:p=0}m=iB(p)|0;do if(!m)if((Fp(0)|0)<0){i=-1;return i|0}else{q=c[k>>2]|0;break}else{p=n<<24>>24==4;o=p?65535:255;r=~c[(c[f>>2]|0)+24>>2];s=c[(c[k>>2]|0)+72>>2]&r;t=c[5516+(g+-1<<2)>>2]|0;u=c[e+8>>2]|0;v=c[e+12>>2]|0;if((v|0)>0){w=o&65535;x=e+16|0;y=m;z=m;A=c[j>>2]|0;B=0;while(1){C=0;D=y;E=z;F=0;while(1){a:do if((F|0)<(u|0)){G=F;while(1){H=A+(ca(G,g)|0)|0;if(((Af[t&127](H)|0)&r|0)!=(s|0)){I=G;break a}H=G+1|0;if((H|0)<(u|0))G=H;else{I=H;break}}}else I=F;while(0);b:do if((I|0)<(u|0)){G=I;while(1){H=A+(ca(G,g)|0)|0;if(((Af[t&127](H)|0)&r|0)==(s|0)){J=1;K=G;break b}H=G+1|0;if((H|0)<(u|0))G=H;else{J=0;K=H;break}}}else{J=0;K=I}while(0);G=I-F|0;C=(G|0)==(u|0)?1:C;H=K-I|0;if((G|0)>(o|0))if(p){L=D;M=G;while(1){b[L>>1]=w;b[L+2>>1]=0;N=L+4|0;O=M-o|0;if((O|0)>(o|0)){L=N;M=O}else{P=N;Q=O;break}}}else{M=D;L=G;while(1){a[M>>0]=-1;a[M+1>>0]=0;O=M+2|0;N=L-o|0;if((N|0)>(o|0)){M=O;L=N}else{P=O;Q=N;break}}}else{P=D;Q=G}L=(H|0)<(o|0)?H:o;if(p){b[P>>1]=Q;b[P+2>>1]=L;R=4;S=P+4|0}else{a[P>>0]=Q;a[P+1>>0]=L;R=2;S=P+2|0}M=ca(L,g)|0;ax(S,A+(ca(I,g)|0)|0,M)|0;N=P+(R+M)|0;M=H-L|0;O=L+I|0;if((H|0)!=(L|0))if(p){L=N;T=M;U=O;while(1){V=(T|0)<(o|0)?T:o;b[L>>1]=0;b[L+2>>1]=V;W=ca(V,g)|0;ax(L+4|0,A+(ca(U,g)|0)|0,W)|0;X=L+(W+4)|0;if((T|0)==(V|0)){Y=X;break}else{L=X;T=T-V|0;U=V+U|0}}}else{U=N;T=M;L=O;while(1){H=(T|0)<(o|0)?T:o;a[U>>0]=0;a[U+1>>0]=H;G=ca(H,g)|0;ax(U+2|0,A+(ca(L,g)|0)|0,G)|0;V=U+(G+2)|0;if((T|0)==(H|0)){Y=V;break}else{U=V;T=T-H|0;L=H+L|0}}}else Y=N;L=(C|0)==0?Y:E;if(!J){Z=L;_=Y;break}else{D=Y;E=L;F=K}}F=B+1|0;if((F|0)==(v|0)){$=Z;break}else{y=_;z=Z;A=A+(c[x>>2]|0)|0;B=F}}}else $=m;if(p){b[$>>1]=0;b[$+2>>1]=0;aa=$+4|0}else{a[$>>0]=0;a[$+1>>0]=0;aa=$+2|0}if(!(c[e>>2]&1)){qB(c[j>>2]|0);c[j>>2]=0}B=eA(m,aa-m|0)|0;x=c[k>>2]|0;c[x+12>>2]=(B|0)==0?m:B;q=x}while(0);c[q+8>>2]=9;m=q+68|0;c[m>>2]=c[m>>2]|8192}else{m=c[l>>2]|0;if(!m){i=-1;return i|0}l=c[m+4>>2]|0;if(h<<24>>24!=32){i=-1;return i|0}h=l+12|0;m=c[h>>2]|0;q=l+16|0;aa=c[q>>2]|0;$=l+20|0;Z=c[$>>2]|0;_=aa|m|Z;K=l+9|0;c:do switch(d[K>>0]|0){case 2:{if((_|0)<65535){switch(_|0){case 32767:break;default:{i=-1;return i|0}}if((m|0)==992|(aa|0)==992|(Z|0)==992)ba=22;else{i=-1;return i|0}}else{switch(_|0){case 65535:break;default:{i=-1;return i|0}}if((m|0)==2016|(aa|0)==2016|(Z|0)==2016)ba=21;else{i=-1;return i|0}}da=23;ea=ba;fa=(ca(((c[e+8>>2]|0)*6|0)+8|0,c[e+12>>2]|0)|0)+2|0;break}case 4:{if((_|0)==16777215){da=24;ea=24;fa=ca(c[e+12>>2]<<3,(c[e+8>>2]|0)+1|0)|0|4;break c}else{i=-1;return i|0}break}default:{i=-1;return i|0}}while(0);_=iB(fa+28|0)|0;do if(!_)if((Fp(0)|0)<0){i=-1;return i|0}else{ga=c[k>>2]|0;break}else{fa=a[K>>0]|0;a[_>>0]=fa;c[_+4>>2]=c[h>>2];c[_+8>>2]=c[q>>2];c[_+12>>2]=c[$>>2];c[_+16>>2]=c[l+24>>2];a[_+20>>0]=a[l+28>>0]|0;a[_+21>>0]=a[l+29>>0]|0;a[_+22>>0]=a[l+30>>0]|0;a[_+23>>0]=a[l+31>>0]|0;a[_+24>>0]=a[l+32>>0]|0;a[_+25>>0]=a[l+33>>0]|0;a[_+26>>0]=a[l+34>>0]|0;a[_+27>>0]=a[l+35>>0]|0;ba=_+28|0;Z=c[e+12>>2]|0;aa=c[e+8>>2]|0;m=c[f>>2]|0;if((Z|0)>0){Y=m+24|0;J=m+35|0;g=e+16|0;I=ba;R=ba;P=c[j>>2]|0;S=0;while(1){Q=0;n=I;x=0;while(1){d:do if((x|0)<(aa|0)){B=c[Y>>2]|0;A=d[J>>0]|0;z=x;while(1){if(((c[P+(z<<2)>>2]&B)>>>A|0)==255){ha=z;break d}y=z+1|0;if((y|0)<(aa|0))z=y;else{ha=y;break}}}else ha=x;while(0);e:do if((ha|0)<(aa|0)){N=c[Y>>2]|0;z=d[J>>0]|0;A=ha;while(1){if(((c[P+(A<<2)>>2]&N)>>>z|0)!=255){ia=1;ja=A;break e}B=A+1|0;if((B|0)<(aa|0))A=B;else{ia=0;ja=B;break}}}else{ia=0;ja=ha}while(0);A=ha-x|0;z=(A|0)==(aa|0)?1:Q;N=ja-ha|0;if((A|0)>255){B=-256-x+ha|0;y=n;v=A;while(1){if((a[K>>0]|0)==4){b[y>>1]=255;b[y+2>>1]=0;ka=y+4|0}else{a[y>>0]=-1;a[y+1>>0]=0;ka=y+2|0}v=v+-255|0;if((v|0)<=255){la=ka;break}else y=ka}ma=la;na=-255-x+ha-B+((B>>>0)%255|0)|0}else{ma=n;na=A}y=(N|0)<255?N:255;if((a[K>>0]|0)==4){b[ma>>1]=na;b[ma+2>>1]=y;oa=4;pa=ma+4|0}else{a[ma>>0]=na;a[ma+1>>0]=y;oa=2;pa=ma+2|0}v=ma+((Cf[da&31](pa,P+(ha<<2)|0,y,m,l)|0)+oa)|0;if((N|0)==(y|0))qa=v;else{o=v;v=N-y|0;w=y+ha|0;while(1){y=(v|0)<255?v:255;if((a[K>>0]|0)==4){b[o>>1]=0;b[o+2>>1]=y;ra=4;sa=o+4|0}else{a[o>>0]=0;a[o+1>>0]=y;ra=2;sa=o+2|0}u=o+((Cf[da&31](sa,P+(w<<2)|0,y,m,l)|0)+ra)|0;if((v|0)==(y|0)){qa=u;break}else{o=u;v=v-y|0;w=y+w|0}}}if(ia){Q=z;n=qa;x=ja}else{ta=z;ua=qa;break}}x=ta;n=ua+(ua&2)|0;Q=R;w=0;while(1){f:do if((w|0)<(aa|0)){v=c[Y>>2]|0;o=d[J>>0]|0;N=w;while(1){if((((c[P+(N<<2)>>2]&v)>>>o)+-1|0)>>>0<=253){va=N;break f}A=N+1|0;if((A|0)<(aa|0))N=A;else{va=A;break}}}else va=w;while(0);g:do if((va|0)<(aa|0)){z=c[Y>>2]|0;N=d[J>>0]|0;o=va;while(1){if((((c[P+(o<<2)>>2]&z)>>>N)+-1|0)>>>0>=254){wa=1;xa=o;break g}v=o+1|0;if((v|0)<(aa|0))o=v;else{wa=0;xa=v;break}}}else{wa=0;xa=va}while(0);o=va-w|0;x=(o|0)==(aa|0)&x;N=xa-va|0;if((o|0)>65535){z=((-65536-w+va|0)>>>0)/65535|0;v=va+-65535-w+(ca(z,-65535)|0)|0;A=n;B=o;while(1){b[A>>1]=-1;b[A+2>>1]=0;B=B+-65535|0;if((B|0)<=65535)break;else A=A+4|0}ya=n+((z<<2)+4)|0;za=v}else{ya=n;za=o}A=(N|0)<65535?N:65535;b[ya>>1]=za;b[ya+2>>1]=A;B=ya+((Cf[ea&31](ya+4|0,P+(va<<2)|0,A,m,l)|0)+4)|0;if((N|0)==(A|0))Aa=B;else{y=B;B=N-A|0;u=A+va|0;while(1){A=(B|0)<65535?B:65535;b[y>>1]=0;b[y+2>>1]=A;s=y+((Cf[ea&31](y+4|0,P+(u<<2)|0,A,m,l)|0)+4)|0;if((B|0)==(A|0)){Aa=s;break}else{y=s;B=B-A|0;u=A+u|0}}}u=(x|0)==0?Aa:Q;if(!wa){Ba=u;Ca=Aa;break}else{n=Aa;Q=u;w=xa}}w=S+1|0;if((w|0)==(Z|0)){Da=Ba;break}else{I=Ca;R=Ba;P=P+(c[g>>2]>>2<<2)|0;S=w}}Ea=a[K>>0]|0;Fa=Da}else{Ea=fa;Fa=ba}if(Ea<<24>>24==4){b[Fa>>1]=0;b[Fa+2>>1]=0;Ga=Fa+4|0}else{a[Fa>>0]=0;a[Fa+1>>0]=0;Ga=Fa+2|0}if(!(c[e>>2]&1)){qB(c[j>>2]|0);c[j>>2]=0}S=eA(_,Ga-_|0)|0;g=c[k>>2]|0;c[g+12>>2]=(S|0)==0?_:S;ga=g}while(0);c[ga+8>>2]=10;_=ga+68|0;c[_>>2]=c[_>>2]|16384}c[e>>2]=c[e>>2]|2;i=0;return i|0}function tg(f){f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0;g=c[f+52>>2]|0;h=d[f+60>>0]|0;i=d[f+61>>0]|0;j=d[f+62>>0]|0;k=d[f+63>>0]|0;l=c[f+40>>2]|0;m=c[f+44>>2]|0;n=a[l+9>>0]|0;o=n&255;p=d[m+9>>0]|0;q=f+28|0;r=c[q>>2]|0;s=(c[f+8>>2]<<16|0)/(r|0)|0;t=f+24|0;u=c[t>>2]|0;v=(c[f+4>>2]<<16|0)/(u|0)|0;c[q>>2]=r+-1;if(!r)return;r=f+20|0;w=f+32|0;x=l+24|0;y=l+12|0;z=l+32|0;A=l+28|0;B=l+16|0;C=l+33|0;D=l+29|0;E=l+20|0;F=l+34|0;G=l+30|0;H=(g&256|0)==0;I=m+24|0;J=m+12|0;K=m+32|0;L=m+28|0;M=m+16|0;N=m+33|0;O=m+29|0;P=m+20|0;Q=m+34|0;R=m+30|0;S=(g&1|0)==0;T=(g&2|0)==0;U=(g&48|0)!=0;V=g&112;g=m+31|0;W=m+35|0;m=n<<24>>24==3;n=f+56|0;X=l+35|0;Y=l+31|0;l=f+12|0;Z=u;u=c[r>>2]|0;_=0;$=0;while(1){if((_|0)>65535){aa=_+-65536|0;ba=aa>>>16;da=aa-(ba<<16)|0;ea=$+1+ba|0}else{da=_;ea=$}if(Z){ba=Z;aa=u;fa=65536;ga=0;ha=-1;while(1){ba=ba+-1|0;if((fa|0)>65535){ia=fa+-65536|0;ja=ia>>>16;ka=ha+1+ja|0;la=ia-(ja<<16)|0;ma=(c[f>>2]|0)+((ca(c[l>>2]|0,ea)|0)+(ca(ka,o)|0))|0;na=ka}else{la=fa;ma=ga;na=ha}ka=c[x>>2]|0;a:do if(!ka)switch(o|0){case 1:{ja=d[ma>>0]|0;oa=255;pa=d[(c[5452+((d[G>>0]|0)<<2)>>2]|0)+((c[E>>2]&ja)>>>(d[F>>0]|0))>>0]|0;qa=d[(c[5452+((d[D>>0]|0)<<2)>>2]|0)+((c[B>>2]&ja)>>>(d[C>>0]|0))>>0]|0;ra=d[(c[5452+((d[A>>0]|0)<<2)>>2]|0)+((ja&c[y>>2])>>>(d[z>>0]|0))>>0]|0;sa=ja;break a;break}case 2:{ja=e[ma>>1]|0;oa=255;pa=d[(c[5452+((d[G>>0]|0)<<2)>>2]|0)+((c[E>>2]&ja)>>>(d[F>>0]|0))>>0]|0;qa=d[(c[5452+((d[D>>0]|0)<<2)>>2]|0)+((c[B>>2]&ja)>>>(d[C>>0]|0))>>0]|0;ra=d[(c[5452+((d[A>>0]|0)<<2)>>2]|0)+((ja&c[y>>2])>>>(d[z>>0]|0))>>0]|0;sa=ja;break a;break}case 3:{oa=255;pa=d[ma+((d[F>>0]|0)>>>3&255)>>0]|0;qa=d[ma+((d[C>>0]|0)>>>3&255)>>0]|0;ra=d[ma+((d[z>>0]|0)>>>3&255)>>0]|0;sa=0;break a;break}case 4:{ja=c[ma>>2]|0;oa=255;pa=d[(c[5452+((d[G>>0]|0)<<2)>>2]|0)+((c[E>>2]&ja)>>>(d[F>>0]|0))>>0]|0;qa=d[(c[5452+((d[D>>0]|0)<<2)>>2]|0)+((c[B>>2]&ja)>>>(d[C>>0]|0))>>0]|0;ra=d[(c[5452+((d[A>>0]|0)<<2)>>2]|0)+((c[y>>2]&ja)>>>(d[z>>0]|0))>>0]|0;sa=ja;break a;break}default:{oa=255;pa=0;qa=0;ra=0;sa=0;break a}}else switch(o|0){case 1:{ja=d[ma>>0]|0;oa=d[(c[5452+((d[Y>>0]|0)<<2)>>2]|0)+((ja&ka)>>>(d[X>>0]|0))>>0]|0;pa=d[(c[5452+((d[G>>0]|0)<<2)>>2]|0)+((c[E>>2]&ja)>>>(d[F>>0]|0))>>0]|0;qa=d[(c[5452+((d[D>>0]|0)<<2)>>2]|0)+((c[B>>2]&ja)>>>(d[C>>0]|0))>>0]|0;ra=d[(c[5452+((d[A>>0]|0)<<2)>>2]|0)+((ja&c[y>>2])>>>(d[z>>0]|0))>>0]|0;sa=ja;break a;break}case 2:{ja=e[ma>>1]|0;oa=d[(c[5452+((d[Y>>0]|0)<<2)>>2]|0)+((ja&ka)>>>(d[X>>0]|0))>>0]|0;pa=d[(c[5452+((d[G>>0]|0)<<2)>>2]|0)+((c[E>>2]&ja)>>>(d[F>>0]|0))>>0]|0;qa=d[(c[5452+((d[D>>0]|0)<<2)>>2]|0)+((c[B>>2]&ja)>>>(d[C>>0]|0))>>0]|0;ra=d[(c[5452+((d[A>>0]|0)<<2)>>2]|0)+((ja&c[y>>2])>>>(d[z>>0]|0))>>0]|0;sa=ja;break a;break}case 3:{oa=255;pa=d[ma+((d[F>>0]|0)>>>3&255)>>0]|0;qa=d[ma+((d[C>>0]|0)>>>3&255)>>0]|0;ra=d[ma+((d[z>>0]|0)>>>3&255)>>0]|0;sa=0;break a;break}case 4:{ja=c[ma>>2]|0;oa=d[(c[5452+((d[Y>>0]|0)<<2)>>2]|0)+((ja&ka)>>>(d[X>>0]|0))>>0]|0;pa=d[(c[5452+((d[G>>0]|0)<<2)>>2]|0)+((c[E>>2]&ja)>>>(d[F>>0]|0))>>0]|0;qa=d[(c[5452+((d[D>>0]|0)<<2)>>2]|0)+((c[B>>2]&ja)>>>(d[C>>0]|0))>>0]|0;ra=d[(c[5452+((d[A>>0]|0)<<2)>>2]|0)+((c[y>>2]&ja)>>>(d[z>>0]|0))>>0]|0;sa=ja;break a;break}default:{oa=0;pa=0;qa=0;ra=0;sa=0;break a}}while(0);if(!H){if(m)ta=qa<<(d[C>>0]|0)|ra<<(d[z>>0]|0)|pa<<(d[F>>0]|0);else ta=sa;if((ta|0)!=(c[n>>2]|0))ua=24}else ua=24;b:do if((ua|0)==24){ua=0;ka=c[I>>2]|0;ja=(ka|0)==0;c:do if(ja)switch(p|0){case 1:{ia=d[aa>>0]|0;va=255;wa=d[(c[5452+((d[R>>0]|0)<<2)>>2]|0)+((c[P>>2]&ia)>>>(d[Q>>0]|0))>>0]|0;xa=d[(c[5452+((d[O>>0]|0)<<2)>>2]|0)+((c[M>>2]&ia)>>>(d[N>>0]|0))>>0]|0;ya=d[(c[5452+((d[L>>0]|0)<<2)>>2]|0)+((ia&c[J>>2])>>>(d[K>>0]|0))>>0]|0;break c;break}case 2:{ia=e[aa>>1]|0;va=255;wa=d[(c[5452+((d[R>>0]|0)<<2)>>2]|0)+((c[P>>2]&ia)>>>(d[Q>>0]|0))>>0]|0;xa=d[(c[5452+((d[O>>0]|0)<<2)>>2]|0)+((c[M>>2]&ia)>>>(d[N>>0]|0))>>0]|0;ya=d[(c[5452+((d[L>>0]|0)<<2)>>2]|0)+((ia&c[J>>2])>>>(d[K>>0]|0))>>0]|0;break c;break}case 3:{va=255;wa=d[aa+((d[Q>>0]|0)>>>3&255)>>0]|0;xa=d[aa+((d[N>>0]|0)>>>3&255)>>0]|0;ya=d[aa+((d[K>>0]|0)>>>3&255)>>0]|0;break c;break}case 4:{ia=c[aa>>2]|0;va=255;wa=d[(c[5452+((d[R>>0]|0)<<2)>>2]|0)+((c[P>>2]&ia)>>>(d[Q>>0]|0))>>0]|0;xa=d[(c[5452+((d[O>>0]|0)<<2)>>2]|0)+((c[M>>2]&ia)>>>(d[N>>0]|0))>>0]|0;ya=d[(c[5452+((d[L>>0]|0)<<2)>>2]|0)+((c[J>>2]&ia)>>>(d[K>>0]|0))>>0]|0;break c;break}default:{va=255;wa=0;xa=0;ya=0;break c}}else switch(p|0){case 1:{ia=d[aa>>0]|0;va=d[(c[5452+((d[g>>0]|0)<<2)>>2]|0)+((ia&ka)>>>(d[W>>0]|0))>>0]|0;wa=d[(c[5452+((d[R>>0]|0)<<2)>>2]|0)+((c[P>>2]&ia)>>>(d[Q>>0]|0))>>0]|0;xa=d[(c[5452+((d[O>>0]|0)<<2)>>2]|0)+((c[M>>2]&ia)>>>(d[N>>0]|0))>>0]|0;ya=d[(c[5452+((d[L>>0]|0)<<2)>>2]|0)+((ia&c[J>>2])>>>(d[K>>0]|0))>>0]|0;break c;break}case 2:{ia=e[aa>>1]|0;va=d[(c[5452+((d[g>>0]|0)<<2)>>2]|0)+((ia&ka)>>>(d[W>>0]|0))>>0]|0;wa=d[(c[5452+((d[R>>0]|0)<<2)>>2]|0)+((c[P>>2]&ia)>>>(d[Q>>0]|0))>>0]|0;xa=d[(c[5452+((d[O>>0]|0)<<2)>>2]|0)+((c[M>>2]&ia)>>>(d[N>>0]|0))>>0]|0;ya=d[(c[5452+((d[L>>0]|0)<<2)>>2]|0)+((ia&c[J>>2])>>>(d[K>>0]|0))>>0]|0;break c;break}case 3:{va=255;wa=d[aa+((d[Q>>0]|0)>>>3&255)>>0]|0;xa=d[aa+((d[N>>0]|0)>>>3&255)>>0]|0;ya=d[aa+((d[K>>0]|0)>>>3&255)>>0]|0;break c;break}case 4:{ia=c[aa>>2]|0;va=d[(c[5452+((d[g>>0]|0)<<2)>>2]|0)+((ia&ka)>>>(d[W>>0]|0))>>0]|0;wa=d[(c[5452+((d[R>>0]|0)<<2)>>2]|0)+((c[P>>2]&ia)>>>(d[Q>>0]|0))>>0]|0;xa=d[(c[5452+((d[O>>0]|0)<<2)>>2]|0)+((c[M>>2]&ia)>>>(d[N>>0]|0))>>0]|0;ya=d[(c[5452+((d[L>>0]|0)<<2)>>2]|0)+((c[J>>2]&ia)>>>(d[K>>0]|0))>>0]|0;break c;break}default:{va=0;wa=0;xa=0;ya=0;break c}}while(0);if(S){za=pa;Aa=qa;Ba=ra}else{za=((ca(pa,j)|0)>>>0)/255|0;Aa=((ca(qa,i)|0)>>>0)/255|0;Ba=((ca(ra,h)|0)>>>0)/255|0}ka=((ca(oa,k)|0)>>>0)/255|0;ia=T?oa:ka;if(U&ia>>>0<255){Ca=((ca(ia,za)|0)>>>0)/255|0;Da=((ca(ia,Aa)|0)>>>0)/255|0;Ea=((ca(ia,Ba)|0)>>>0)/255|0}else{Ca=za;Da=Aa;Ea=Ba}switch(V|0){case 0:{Fa=ia;Ga=Ca;Ha=Da;Ia=Ea;break}case 16:{ka=255-ia|0;Fa=va;Ga=(((ca(ka,wa)|0)>>>0)/255|0)+Ca|0;Ha=(((ca(ka,xa)|0)>>>0)/255|0)+Da|0;Ia=(((ca(ka,ya)|0)>>>0)/255|0)+Ea|0;break}case 32:{ka=Ea+ya|0;ia=Da+xa|0;Ja=Ca+wa|0;Fa=va;Ga=Ja>>>0>255?255:Ja;Ha=ia>>>0>255?255:ia;Ia=ka>>>0>255?255:ka;break}case 64:{Fa=va;Ga=((ca(Ca,wa)|0)>>>0)/255|0;Ha=((ca(Da,xa)|0)>>>0)/255|0;Ia=((ca(Ea,ya)|0)>>>0)/255|0;break}default:{Fa=va;Ga=wa;Ha=xa;Ia=ya}}if(ja)switch(p|0){case 1:{a[aa>>0]=Ia>>>(d[L>>0]|0)<<(d[K>>0]|0)|Ha>>>(d[O>>0]|0)<<(d[N>>0]|0)|Ga>>>(d[R>>0]|0)<<(d[Q>>0]|0);break b;break}case 2:{b[aa>>1]=Ia>>>(d[L>>0]|0)<<(d[K>>0]|0)|Ha>>>(d[O>>0]|0)<<(d[N>>0]|0)|Ga>>>(d[R>>0]|0)<<(d[Q>>0]|0);break b;break}case 3:{a[aa+((d[K>>0]|0)>>>3&255)>>0]=Ia;a[aa+((d[N>>0]|0)>>>3&255)>>0]=Ha;a[aa+((d[Q>>0]|0)>>>3&255)>>0]=Ga;break b;break}case 4:{c[aa>>2]=Ia>>>(d[L>>0]|0)<<(d[K>>0]|0)|Ha>>>(d[O>>0]|0)<<(d[N>>0]|0)|Ga>>>(d[R>>0]|0)<<(d[Q>>0]|0);break b;break}default:break b}else switch(p|0){case 1:{a[aa>>0]=Ha>>>(d[O>>0]|0)<<(d[N>>0]|0)|Ia>>>(d[L>>0]|0)<<(d[K>>0]|0)|Ga>>>(d[R>>0]|0)<<(d[Q>>0]|0)|Fa>>>(d[g>>0]|0)<<(d[W>>0]|0);break b;break}case 2:{b[aa>>1]=Ha>>>(d[O>>0]|0)<<(d[N>>0]|0)|Ia>>>(d[L>>0]|0)<<(d[K>>0]|0)|Ga>>>(d[R>>0]|0)<<(d[Q>>0]|0)|Fa>>>(d[g>>0]|0)<<(d[W>>0]|0);break b;break}case 3:{a[aa+((d[K>>0]|0)>>>3&255)>>0]=Ia;a[aa+((d[N>>0]|0)>>>3&255)>>0]=Ha;a[aa+((d[Q>>0]|0)>>>3&255)>>0]=Ga;break b;break}case 4:{c[aa>>2]=Ha>>>(d[O>>0]|0)<<(d[N>>0]|0)|Ia>>>(d[L>>0]|0)<<(d[K>>0]|0)|Ga>>>(d[R>>0]|0)<<(d[Q>>0]|0)|Fa>>>(d[g>>0]|0)<<(d[W>>0]|0);break b;break}default:break b}}while(0);if(!ba)break;else{aa=aa+p|0;fa=la+v|0;ga=ma;ha=na}}}ha=(c[r>>2]|0)+(c[w>>2]|0)|0;c[r>>2]=ha;ga=c[q>>2]|0;c[q>>2]=ga+-1;if(!ga)break;Z=c[t>>2]|0;u=ha;_=da+s|0;$=ea}return}function rg(b){b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;i=i+16|0;e=d+12|0;f=d+8|0;g=d+4|0;h=d;c[f>>2]=b;c[g>>2]=_f((Xw(c[f>>2]|0)|0)+1|0)|0;Ht(c[g>>2]|0,c[f>>2]|0)|0;c[h>>2]=Bg(c[g>>2]|0,28015)|0;if(c[h>>2]|0)a[c[h>>2]>>0]=0;c[h>>2]=Bg(c[g>>2]|0,28019)|0;if(c[h>>2]|0)a[c[h>>2]>>0]=0;c[h>>2]=Bg(c[g>>2]|0,28023)|0;if(c[h>>2]|0)a[c[h>>2]>>0]=0;c[h>>2]=Bg(c[g>>2]|0,28027)|0;if(c[h>>2]|0)a[c[h>>2]>>0]=0;do if(Hp(c[g>>2]|0,28033)|0){if(!(Hp(c[g>>2]|0,28071)|0)){c[g>>2]=28090;break}if(!(Hp(c[g>>2]|0,28103)|0)){c[g>>2]=28124;break}if(!(Hp(c[g>>2]|0,28139)|0)){c[g>>2]=28154;break}if(!(Hp(c[g>>2]|0,28169)|0))c[g>>2]=28184}else c[g>>2]=28055;while(0);do if(Hp(c[g>>2]|0,28199)|0){if(!(Hp(c[g>>2]|0,28213)|0)){c[e>>2]=95;break}if(!(Hp(c[g>>2]|0,28225)|0)){c[e>>2]=40;break}if(!(Hp(c[g>>2]|0,28239)|0)){c[e>>2]=41;break}if(!(Hp(c[g>>2]|0,28251)|0)){c[e>>2]=42;break}if(!(Hp(c[g>>2]|0,28265)|0)){c[e>>2]=43;break}if(!(Hp(c[g>>2]|0,28279)|0)){c[e>>2]=44;break}if(!(Hp(c[g>>2]|0,28296)|0)){c[e>>2]=1;break}if(!(Hp(c[g>>2]|0,28319)|0)){c[e>>2]=1;break}if(!(Hp(c[g>>2]|0,28345)|0)){c[e>>2]=2;break}if(!(Hp(c[g>>2]|0,28358)|0)){c[e>>2]=3;break}if(!(Hp(c[g>>2]|0,28374)|0)){c[e>>2]=1;break}if(!(Hp(c[g>>2]|0,28387)|0)){c[e>>2]=45;break}if(!(Hp(c[g>>2]|0,28401)|0)){c[e>>2]=1;break}if(!(Hp(c[g>>2]|0,28421)|0)){c[e>>2]=2;break}if(!(Hp(c[g>>2]|0,28441)|0)){c[e>>2]=3;break}if(!(Hp(c[g>>2]|0,28458)|0)){c[e>>2]=4;break}if(!(Hp(c[g>>2]|0,28475)|0)){c[e>>2]=96;break}if(!(Hp(c[g>>2]|0,28487)|0)){c[e>>2]=46;break}if(!(Hp(c[g>>2]|0,28500)|0)){c[e>>2]=47;break}if(!(Hp(c[g>>2]|0,28516)|0)){c[e>>2]=5;break}if(!(Hp(c[g>>2]|0,28539)|0)){c[e>>2]=9;break}if(!(Hp(c[g>>2]|0,28552)|0)){c[e>>2]=10;break}if(!(Hp(c[g>>2]|0,28568)|0)){c[e>>2]=97;break}if(!(Hp(c[g>>2]|0,28579)|0)){c[e>>2]=48;break}if(!(Hp(c[g>>2]|0,28598)|0)){c[e>>2]=49;break}if(!(Hp(c[g>>2]|0,28620)|0)){c[e>>2]=50;break}if(!(Hp(c[g>>2]|0,28639)|0)){c[e>>2]=6;break}if(!(Hp(c[g>>2]|0,28668)|0)){c[e>>2]=98;break}if(!(Hp(c[g>>2]|0,28685)|0)){c[e>>2]=7;break}if(!(Hp(c[g>>2]|0,28700)|0)){c[e>>2]=8;break}if(!(Hp(c[g>>2]|0,28715)|0)){c[e>>2]=15;break}if(!(Hp(c[g>>2]|0,28736)|0)){c[e>>2]=9;break}if(!(Hp(c[g>>2]|0,28756)|0)){c[e>>2]=10;break}if(!(Hp(c[g>>2]|0,28776)|0)){c[e>>2]=11;break}if(!(Hp(c[g>>2]|0,28802)|0)){c[e>>2]=2;break}if(!(Hp(c[g>>2]|0,28821)|0)){c[e>>2]=1;break}if(!(Hp(c[g>>2]|0,28833)|0)){c[e>>2]=1;break}if(!(Hp(c[g>>2]|0,28845)|0)){c[e>>2]=1;break}if(!(Hp(c[g>>2]|0,28857)|0)){c[e>>2]=1;break}if(!(Hp(c[g>>2]|0,28869)|0)){c[e>>2]=51;break}if(!(Hp(c[g>>2]|0,28881)|0)){c[e>>2]=12;break}if(!(Hp(c[g>>2]|0,28893)|0)){c[e>>2]=11;break}if(!(Hp(c[g>>2]|0,28905)|0)){c[e>>2]=4;break}if(!(Hp(c[g>>2]|0,28917)|0)){c[e>>2]=13;break}if(!(Hp(c[g>>2]|0,28930)|0)){c[e>>2]=14;break}if(!(Hp(c[g>>2]|0,28943)|0)){c[e>>2]=15;break}if(!(Hp(c[g>>2]|0,28956)|0)){c[e>>2]=16;break}if(!(Hp(c[g>>2]|0,28969)|0)){c[e>>2]=17;break}if(!(Hp(c[g>>2]|0,28982)|0)){c[e>>2]=18;break}if(!(Hp(c[g>>2]|0,28995)|0)){c[e>>2]=19;break}if(!(Hp(c[g>>2]|0,29008)|0)){c[e>>2]=20;break}if(!(Hp(c[g>>2]|0,29021)|0)){c[e>>2]=12;break}if(!(Hp(c[g>>2]|0,29040)|0)){c[e>>2]=13;break}if(!(Hp(c[g>>2]|0,29059)|0)){c[e>>2]=14;break}if(!(Hp(c[g>>2]|0,29078)|0)){c[e>>2]=52;break}if(!(Hp(c[g>>2]|0,29091)|0)){c[e>>2]=53;break}if(!(Hp(c[g>>2]|0,29109)|0)){c[e>>2]=54;break}if(!(Hp(c[g>>2]|0,29127)|0)){c[e>>2]=55;break}if(!(Hp(c[g>>2]|0,29145)|0)){c[e>>2]=56;break}if(!(Hp(c[g>>2]|0,29163)|0)){c[e>>2]=16;break}if(!(Hp(c[g>>2]|0,29183)|0)){c[e>>2]=3;break}if(!(Hp(c[g>>2]|0,28124)|0)){c[e>>2]=99;break}if(!(Hp(c[g>>2]|0,29201)|0)){c[e>>2]=273;break}if(!(Hp(c[g>>2]|0,29216)|0)){c[e>>2]=15;break}if(!(Hp(c[g>>2]|0,29237)|0)){c[e>>2]=16;break}if(!(Hp(c[g>>2]|0,29252)|0)){c[e>>2]=17;break}if(!(Hp(c[g>>2]|0,29270)|0)){c[e>>2]=274;break}if(!(Hp(c[g>>2]|0,29286)|0)){c[e>>2]=18;break}if(!(Hp(c[g>>2]|0,29305)|0)){c[e>>2]=21;break}if(!(Hp(c[g>>2]|0,29319)|0)){c[e>>2]=22;break}if(!(Hp(c[g>>2]|0,29334)|0)){c[e>>2]=100;break}if(!(Hp(c[g>>2]|0,28055)|0)){c[e>>2]=1;break}if(!(Hp(c[g>>2]|0,29345)|0)){c[e>>2]=275;break}if(!(Hp(c[g>>2]|0,28154)|0)){c[e>>2]=57;break}if(!(Hp(c[g>>2]|0,28184)|0)){c[e>>2]=58;break}if(!(Hp(c[g>>2]|0,29361)|0)){c[e>>2]=19;break}if(!(Hp(c[g>>2]|0,29388)|0)){c[e>>2]=276;break}if(!(Hp(c[g>>2]|0,29402)|0)){c[e>>2]=20;break}if(!(Hp(c[g>>2]|0,28090)|0)){c[e>>2]=277;break}if(!(Hp(c[g>>2]|0,29422)|0)){c[e>>2]=278;break}if(!(Hp(c[g>>2]|0,29440)|0)){c[e>>2]=101;break}if(!(Hp(c[g>>2]|0,29452)|0)){c[e>>2]=23;break}if(!(Hp(c[g>>2]|0,29473)|0)){c[e>>2]=59;break}if(!(Hp(c[g>>2]|0,29491)|0)){c[e>>2]=60;break}if(!(Hp(c[g>>2]|0,29509)|0)){c[e>>2]=61;break}if(!(Hp(c[g>>2]|0,29530)|0)){c[e>>2]=21;break}if(!(Hp(c[g>>2]|0,29556)|0)){c[e>>2]=5;break}if(!(Hp(c[g>>2]|0,29579)|0)){c[e>>2]=22;break}if(!(Hp(c[g>>2]|0,29617)|0)){c[e>>2]=102;break}if(!(Hp(c[g>>2]|0,29633)|0)){c[e>>2]=279;break}if(!(Hp(c[g>>2]|0,29648)|0)){c[e>>2]=24;break}if(!(Hp(c[g>>2]|0,29671)|0)){c[e>>2]=23;break}if(!(Hp(c[g>>2]|0,29684)|0)){c[e>>2]=62;break}if(!(Hp(c[g>>2]|0,29698)|0)){c[e>>2]=63;break}if(!(Hp(c[g>>2]|0,29712)|0)){c[e>>2]=8;break}if(!(Hp(c[g>>2]|0,29732)|0)){c[e>>2]=280;break}if(!(Hp(c[g>>2]|0,29752)|0)){c[e>>2]=24;break}if(!(Hp(c[g>>2]|0,29768)|0)){c[e>>2]=25;break}if(!(Hp(c[g>>2]|0,29786)|0)){c[e>>2]=25;break}if(!(Hp(c[g>>2]|0,29802)|0)){c[e>>2]=26;break}if(!(Hp(c[g>>2]|0,29817)|0)){c[e>>2]=281;break}if(!(Hp(c[g>>2]|0,29839)|0)){c[e>>2]=64;break}if(!(Hp(c[g>>2]|0,29857)|0)){c[e>>2]=65;break}if(!(Hp(c[g>>2]|0,29878)|0)){c[e>>2]=282;break}if(!(Hp(c[g>>2]|0,29896)|0)){c[e>>2]=283;break}if(!(Hp(c[g>>2]|0,29909)|0)){c[e>>2]=3;break}if(!(Hp(c[g>>2]|0,29924)|0)){c[e>>2]=284;break}if(!(Hp(c[g>>2]|0,29938)|0)){c[e>>2]=1;break}if(!(Hp(c[g>>2]|0,29948)|0)){c[e>>2]=1;break}if(!(Hp(c[g>>2]|0,29958)|0)){c[e>>2]=9;break}if(!(Hp(c[g>>2]|0,29980)|0)){c[e>>2]=285;break}if(!(Hp(c[g>>2]|0,30006)|0)){c[e>>2]=286;break}if(!(Hp(c[g>>2]|0,30033)|0)){c[e>>2]=26;break}if(!(Hp(c[g>>2]|0,30046)|0)){c[e>>2]=27;break}if(!(Hp(c[g>>2]|0,30061)|0)){c[e>>2]=6;break}if(!(Hp(c[g>>2]|0,30076)|0)){c[e>>2]=4;break}if(!(Hp(c[g>>2]|0,30100)|0)){c[e>>2]=2;break}if(!(Hp(c[g>>2]|0,30111)|0)){c[e>>2]=66;break}if(!(Hp(c[g>>2]|0,30133)|0)){c[e>>2]=28;break}if(!(Hp(c[g>>2]|0,30155)|0)){c[e>>2]=7;break}if(!(Hp(c[g>>2]|0,30179)|0)){c[e>>2]=5;break}if(!(Hp(c[g>>2]|0,30188)|0)){c[e>>2]=6;break}if(!(Hp(c[g>>2]|0,30196)|0)){c[e>>2]=1;break}if(!(Hp(c[g>>2]|0,30209)|0)){c[e>>2]=2;break}if(!(Hp(c[g>>2]|0,30223)|0)){c[e>>2]=287;break}if(!(Hp(c[g>>2]|0,30235)|0)){c[e>>2]=288;break}if(!(Hp(c[g>>2]|0,30244)|0)){c[e>>2]=289;break}if(!(Hp(c[g>>2]|0,30254)|0)){c[e>>2]=290;break}if(!(Hp(c[g>>2]|0,30266)|0)){c[e>>2]=291;break}if(!(Hp(c[g>>2]|0,30277)|0)){c[e>>2]=292;break}if(!(Hp(c[g>>2]|0,30285)|0)){c[e>>2]=3;break}if(!(Hp(c[g>>2]|0,30297)|0)){c[e>>2]=293;break}if(!(Hp(c[g>>2]|0,30312)|0)){c[e>>2]=294;break}if(!(Hp(c[g>>2]|0,30324)|0)){c[e>>2]=295;break}if(!(Hp(c[g>>2]|0,30338)|0)){c[e>>2]=103;break}if(!(Hp(c[g>>2]|0,30363)|0)){c[e>>2]=296;break}if(!(Hp(c[g>>2]|0,30380)|0)){c[e>>2]=297;break}if(!(Hp(c[g>>2]|0,30396)|0)){c[e>>2]=298;break}if(!(Hp(c[g>>2]|0,30412)|0)){c[e>>2]=104;break}if(!(Hp(c[g>>2]|0,30424)|0)){c[e>>2]=67;break}if(!(Hp(c[g>>2]|0,30436)|0)){c[e>>2]=68;break}if(!(Hp(c[g>>2]|0,30460)|0)){c[e>>2]=1;break}if(!(Hp(c[g>>2]|0,30473)|0)){c[e>>2]=2;break}if(!(Hp(c[g>>2]|0,30487)|0)){c[e>>2]=69;break}if(!(Hp(c[g>>2]|0,30509)|0)){c[e>>2]=70;break}if(!(Hp(c[g>>2]|0,30516)|0)){c[e>>2]=3;break}if(!(Hp(c[g>>2]|0,30532)|0)){c[e>>2]=2;break}if(!(Hp(c[g>>2]|0,30549)|0)){c[e>>2]=1;break}if(!(Hp(c[g>>2]|0,30566)|0)){c[e>>2]=27;break}if(!(Hp(c[g>>2]|0,30582)|0)){c[e>>2]=1;break}if(!(Hp(c[g>>2]|0,30598)|0)){c[e>>2]=2;break}if(!(Hp(c[g>>2]|0,30615)|0)){c[e>>2]=28;break}if(!(Hp(c[g>>2]|0,30629)|0)){c[e>>2]=29;break}if(!(Hp(c[g>>2]|0,30641)|0)){c[e>>2]=29;break}if(!(Hp(c[g>>2]|0,30652)|0)){c[e>>2]=2;break}if(!(Hp(c[g>>2]|0,30665)|0)){c[e>>2]=30;break}if(!(Hp(c[g>>2]|0,30675)|0)){c[e>>2]=2;break}if(!(Hp(c[g>>2]|0,30692)|0)){c[e>>2]=31;break}if(!(Hp(c[g>>2]|0,30704)|0)){c[e>>2]=32;break}if(!(Hp(c[g>>2]|0,30726)|0)){c[e>>2]=33;break}if(!(Hp(c[g>>2]|0,30746)|0)){c[e>>2]=3;break}if(!(Hp(c[g>>2]|0,30759)|0)){c[e>>2]=34;break}if(!(Hp(c[g>>2]|0,30781)|0)){c[e>>2]=35;break}if(!(Hp(c[g>>2]|0,30801)|0)){c[e>>2]=2;break}if(!(Hp(c[g>>2]|0,30818)|0)){c[e>>2]=2;break}if(!(Hp(c[g>>2]|0,30835)|0)){c[e>>2]=3;break}if(Hp(c[g>>2]|0,30855)|0){_c(0,c[f>>2]|0,c[g>>2]|0)|0;c[e>>2]=0;break}else{c[e>>2]=71;break}}else c[e>>2]=39;while(0);i=d;return c[e>>2]|0}function ug(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0,Qa=0,Ra=0,Sa=0,Ta=0,Ua=0,Va=0,Wa=0,Xa=0,Ya=0;f=b+8|0;if(!(c[f>>2]&524288))g=0;else g=((c[b+28>>2]|0)-(c[b+64>>2]|0)|0)>>>0<=(c[b+36>>2]|0)>>>0;if((c[b>>2]|0)==0?(h=c[b+140>>2]|0,((c[c[b+124>>2]>>2]|0)-h|0)>>>0>85195):0)i=(c[b+116>>2]|0)+h|0;else i=b+234098|0;h=b+48|0;c[h>>2]=i;j=b+52|0;c[j>>2]=i+85180;k=b+92|0;if(c[k>>2]|0)_a(25920,24960,2188,25949);l=b+88|0;c[l>>2]=0;c[k>>2]=0;m=b+44|0;n=c[m>>2]|0;o=b+56|0;a[n>>0]=(d[n>>0]|0)>>>(c[o>>2]|0);n=b+40|0;c[n>>2]=(c[n>>2]|0)+(((c[o>>2]|0)==8)<<31>>31);do if((c[f>>2]&4096|0)!=0?(c[b+100>>2]|0)==0:0){p=b+68|0;q=c[p>>2]|0;r=b+72|0;s=c[r>>2]|120<<q;c[r>>2]=s;t=q+8|0;c[p>>2]=t;if(q>>>0>=4294967288){u=s|1<<t;c[r>>2]=u;v=q+16|0;c[p>>2]=v;if(t>>>0<4294967288){w=v;x=u}else break}else{u=t;t=s;while(1){s=c[h>>2]|0;if(s>>>0<(c[j>>2]|0)>>>0){c[h>>2]=s+1;a[s>>0]=t;y=c[r>>2]|0;z=c[p>>2]|0}else{y=t;z=u}s=y>>>8;c[r>>2]=s;v=z+-8|0;c[p>>2]=v;if(v>>>0>7){u=v;t=s}else{A=z;B=s;C=v;break}}t=B|1<<C;c[r>>2]=t;c[p>>2]=A;w=A;x=t}do{t=c[h>>2]|0;if(t>>>0<(c[j>>2]|0)>>>0){c[h>>2]=t+1;a[t>>0]=x;D=c[r>>2]|0;E=c[p>>2]|0}else{D=x;E=w}x=D>>>8;c[r>>2]=x;w=E+-8|0;c[p>>2]=w}while(w>>>0>7)}while(0);w=(e|0)==4;E=b+68|0;x=c[E>>2]|0;D=b+72|0;A=c[D>>2]|(w&1)<<x;c[D>>2]=A;C=x+1|0;c[E>>2]=C;x=c[h>>2]|0;if(C>>>0>7){B=x;z=A;y=C;while(1){if(B>>>0<(c[j>>2]|0)>>>0){c[h>>2]=B+1;a[B>>0]=z;F=c[D>>2]|0;G=c[E>>2]|0;H=c[h>>2]|0}else{F=z;G=y;H=B}p=F>>>8;c[D>>2]=p;r=G+-8|0;c[E>>2]=r;if(r>>>0>7){B=H;z=p;y=r}else{I=H;J=p;K=r;break}}}else{I=x;J=A;K=C}if(!g){if(!(c[f>>2]&262144)){g=b+60|0;L=g;M=gg(b,(c[g>>2]|0)>>>0<48&1)|0}else{L=b+60|0;M=gg(b,1)|0}g=c[L>>2]|0;if((g|0)!=0?(1-I+(c[h>>2]|0)|0)>>>0>=g>>>0:0){N=M;O=30}else{P=M;O=53}}else{N=0;O=30}if((O|0)==30){M=b+64|0;if(((c[b+28>>2]|0)-(c[M>>2]|0)|0)>>>0<=(c[b+36>>2]|0)>>>0){c[h>>2]=I;c[D>>2]=J;g=K+2|0;c[E>>2]=g;a:do if(g>>>0>7){L=I;C=J;A=g;while(1){if(L>>>0<(c[j>>2]|0)>>>0){c[h>>2]=L+1;a[L>>0]=C;Q=c[D>>2]|0;R=c[E>>2]|0}else{Q=C;R=A}x=Q>>>8;c[D>>2]=x;H=R+-8|0;c[E>>2]=H;if(H>>>0<=7){S=x;T=H;break a}L=c[h>>2]|0;C=x;A=H}}else{S=J;T=g}while(0);if(!T){U=0;V=S}else{c[E>>2]=8;T=S;S=8;while(1){g=c[h>>2]|0;if(g>>>0<(c[j>>2]|0)>>>0){c[h>>2]=g+1;a[g>>0]=T;W=c[D>>2]|0;X=c[E>>2]|0}else{W=T;X=S}g=W>>>8;c[D>>2]=g;R=X+-8|0;c[E>>2]=R;if(R>>>0>7){T=g;S=R}else{U=R;V=g;break}}}S=b+60|0;T=c[S>>2]|0;X=V|(T&65535)<<U;c[D>>2]=X;V=U+16|0;c[E>>2]=V;if(V>>>0>7){U=X;W=V;while(1){g=c[h>>2]|0;if(g>>>0<(c[j>>2]|0)>>>0){c[h>>2]=g+1;a[g>>0]=U;Y=c[D>>2]|0;Z=c[E>>2]|0}else{Y=U;Z=W}g=Y>>>8;c[D>>2]=g;R=Z+-8|0;c[E>>2]=R;if(R>>>0>7){U=g;W=R}else{_=g;$=R;break}}aa=c[S>>2]|0;ba=$;ca=_}else{aa=T;ba=V;ca=X}X=aa^65535;c[S>>2]=X;aa=ca|(X&65535)<<ba;c[D>>2]=aa;ca=ba+16|0;c[E>>2]=ca;if(ca>>>0>7){ba=aa;V=ca;while(1){T=c[h>>2]|0;if(T>>>0<(c[j>>2]|0)>>>0){c[h>>2]=T+1;a[T>>0]=ba;da=c[D>>2]|0;ea=c[E>>2]|0}else{da=ba;ea=V}T=da>>>8;c[D>>2]=T;_=ea+-8|0;c[E>>2]=_;if(_>>>0>7){ba=T;V=_}else{fa=T;ga=_;break}}ha=c[S>>2]|0;ia=fa;ja=ga}else{ha=X;ia=aa;ja=ca}ca=ha^65535;c[S>>2]=ca;if((ha|0)!=65535){ha=ja;ja=ia;ia=ca;ca=0;while(1){aa=ja|(d[((c[M>>2]|0)+ca&32767)+(b+144)>>0]|0)<<ha;c[D>>2]=aa;X=ha+8|0;c[E>>2]=X;if(ha>>>0<4294967288){ga=aa;fa=X;while(1){V=c[h>>2]|0;if(V>>>0<(c[j>>2]|0)>>>0){c[h>>2]=V+1;a[V>>0]=ga;ka=c[D>>2]|0;la=c[E>>2]|0}else{ka=ga;la=fa}V=ka>>>8;c[D>>2]=V;ba=la+-8|0;c[E>>2]=ba;if(ba>>>0>7){ga=V;fa=ba}else{ma=V;na=ba;break}}oa=c[S>>2]|0;pa=ma;qa=na}else{oa=ia;pa=aa;qa=X}ca=ca+1|0;if(ca>>>0>=oa>>>0)break;else{ha=qa;ja=pa;ia=oa}}}}else{P=N;O=53}}if((O|0)==53?(P|0)==0:0){c[h>>2]=I;c[D>>2]=J;c[E>>2]=K;gg(b,1)|0}b:do if(e){K=c[E>>2]|0;if(!w){J=K+3|0;c[E>>2]=J;if(J>>>0>7){I=J;while(1){P=c[h>>2]|0;if(P>>>0<(c[j>>2]|0)>>>0){N=c[D>>2]&255;c[h>>2]=P+1;a[P>>0]=N;ra=c[E>>2]|0}else ra=I;c[D>>2]=(c[D>>2]|0)>>>8;N=ra+-8|0;c[E>>2]=N;if(N>>>0>7)I=N;else{sa=N;break}}}else sa=J;if(sa){c[E>>2]=8;I=8;do{X=c[h>>2]|0;if(X>>>0<(c[j>>2]|0)>>>0){aa=c[D>>2]&255;c[h>>2]=X+1;a[X>>0]=aa;ta=c[E>>2]|0}else ta=I;aa=(c[D>>2]|0)>>>8;c[D>>2]=aa;I=ta+-8|0;c[E>>2]=I}while(I>>>0>7);ua=ta;va=aa;I=ua+8|0;c[D>>2]=va;c[E>>2]=I;if(ua>>>0<4294967288){wa=va;xa=I;O=79}else{ya=I;za=va}}else{I=c[D>>2]|0;c[E>>2]=16;wa=I;xa=16;O=79}if((O|0)==79)while(1){O=0;I=c[h>>2]|0;if(I>>>0<(c[j>>2]|0)>>>0){c[h>>2]=I+1;a[I>>0]=wa;Aa=c[D>>2]|0;Ba=c[E>>2]|0}else{Aa=wa;Ba=xa}I=Aa>>>8;c[D>>2]=I;J=Ba+-8|0;c[E>>2]=J;if(J>>>0>7){wa=I;xa=J;O=79}else{ya=J;za=I;break}}I=za|65535<<ya;c[D>>2]=I;J=ya+16|0;c[E>>2]=J;if(J>>>0>7){Ca=I;Da=J}else break;while(1){J=c[h>>2]|0;if(J>>>0<(c[j>>2]|0)>>>0){c[h>>2]=J+1;a[J>>0]=Ca;Ea=c[D>>2]|0;Fa=c[E>>2]|0}else{Ea=Ca;Fa=Da}Ca=Ea>>>8;c[D>>2]=Ca;Da=Fa+-8|0;c[E>>2]=Da;if(Da>>>0<=7)break b}}if(!K)Ga=0;else{c[E>>2]=8;J=8;while(1){I=c[h>>2]|0;if(I>>>0<(c[j>>2]|0)>>>0){aa=c[D>>2]&255;c[h>>2]=I+1;a[I>>0]=aa;Ha=c[E>>2]|0}else Ha=J;c[D>>2]=(c[D>>2]|0)>>>8;aa=Ha+-8|0;c[E>>2]=aa;if(aa>>>0>7)J=aa;else{Ga=aa;break}}}if(c[f>>2]&4096){J=c[b+24>>2]|0;K=c[D>>2]|J>>>24<<Ga;c[D>>2]=K;aa=Ga+8|0;c[E>>2]=aa;I=K;K=aa;while(1){aa=c[h>>2]|0;if(aa>>>0<(c[j>>2]|0)>>>0){c[h>>2]=aa+1;a[aa>>0]=I;Ia=c[D>>2]|0;Ja=c[E>>2]|0}else{Ia=I;Ja=K}aa=Ia>>>8;c[D>>2]=aa;X=Ja+-8|0;c[E>>2]=X;if(X>>>0>7){I=aa;K=X}else{Ka=Ja;La=aa;Ma=X;break}}K=J&255;I=La|(J>>>16&255)<<Ma;c[D>>2]=I;c[E>>2]=Ka;X=I;I=Ka;while(1){aa=c[h>>2]|0;if(aa>>>0<(c[j>>2]|0)>>>0){c[h>>2]=aa+1;a[aa>>0]=X;Na=c[D>>2]|0;Oa=c[E>>2]|0}else{Na=X;Oa=I}aa=Na>>>8;c[D>>2]=aa;N=Oa+-8|0;c[E>>2]=N;if(N>>>0>7){X=aa;I=N}else{Pa=Oa;Qa=aa;Ra=N;break}}I=Qa|(J>>>8&255)<<Ra;c[D>>2]=I;c[E>>2]=Pa;if(Pa>>>0>7){X=I;N=Pa;while(1){aa=c[h>>2]|0;if(aa>>>0<(c[j>>2]|0)>>>0){c[h>>2]=aa+1;a[aa>>0]=X;Sa=c[D>>2]|0;Ta=c[E>>2]|0}else{Sa=X;Ta=N}aa=Sa>>>8;c[D>>2]=aa;P=Ta+-8|0;c[E>>2]=P;if(P>>>0>7){X=aa;N=P}else{Ua=aa;Va=P;break}}}else{Ua=I;Va=Pa}N=Ua|K<<Va;c[D>>2]=N;X=Va+8|0;c[E>>2]=X;J=N;N=X;do{X=c[h>>2]|0;if(X>>>0<(c[j>>2]|0)>>>0){c[h>>2]=X+1;a[X>>0]=J;Wa=c[D>>2]|0;Xa=c[E>>2]|0}else{Wa=J;Xa=N}J=Wa>>>8;c[D>>2]=J;N=Xa+-8|0;c[E>>2]=N}while(N>>>0>7)}}while(0);E=c[h>>2]|0;if(E>>>0>=(c[j>>2]|0)>>>0)_a(25967,24960,2243,25949);Cp(b+33170|0,0,640)|0;c[n>>2]=b+37491;c[m>>2]=b+37490;c[o>>2]=8;o=b+60|0;m=b+64|0;c[m>>2]=(c[m>>2]|0)+(c[o>>2]|0);c[o>>2]=0;o=b+100|0;c[o>>2]=(c[o>>2]|0)+1;o=E-i|0;do if((E|0)!=(i|0)){m=c[b>>2]|0;if(m){c[c[b+120>>2]>>2]=(c[b+132>>2]|0)-(c[b+112>>2]|0);if(Ef[m&31](b+234098|0,o,c[b+4>>2]|0)|0)break;c[b+108>>2]=-1;Ya=-1;return Ya|0}m=b+234098|0;if((i|0)!=(m|0)){n=b+140|0;c[n>>2]=(c[n>>2]|0)+o;break}n=b+140|0;j=c[n>>2]|0;h=(c[c[b+124>>2]>>2]|0)-j|0;Xa=o>>>0<h>>>0?o:h;dp((c[b+116>>2]|0)+j|0,m|0,Xa|0)|0;c[n>>2]=(c[n>>2]|0)+Xa;if((o|0)!=(Xa|0)){c[l>>2]=Xa;c[k>>2]=o-Xa}}while(0);Ya=c[k>>2]|0;return Ya|0}function vg(e){e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0;f=c[e+24>>2]|0;g=c[e+28>>2]|0;h=c[e+16>>2]|0;i=c[e+36>>2]|0;j=c[e+44>>2]|0;k=d[j+9>>0]|0;if(!g)return;l=(f+7|0)/8|0;m=f&7;f=j+28|0;n=j+32|0;o=j+29|0;p=j+33|0;q=j+30|0;r=j+34|0;s=j+31|0;t=j+35|0;j=g;g=c[e+20>>2]|0;u=c[e>>2]|0;a:while(1){e=j+-1|0;switch(m|0){case 0:{v=g;w=l;x=u;y=4;break}case 7:{z=g;A=l;B=u;y=10;break}case 6:{C=g;D=l;E=u;y=16;break}case 5:{F=g;G=l;H=u;y=22;break}case 4:{I=g;J=l;K=u;y=28;break}case 3:{L=g;M=l;N=u;y=34;break}case 2:{O=g;P=l;Q=u;y=40;break}case 1:{R=g;S=l;T=u;y=46;break}default:{U=g;V=u;y=52}}while(1)if((y|0)==4){y=0;W=c[x>>2]|0;X=W>>>22;Y=X&255;Z=W>>>12;_=Z&255;$=W>>>2;aa=$&255;ba=d[(c[1369]|0)+(W>>>30)>>0]|0;switch(k|0){case 1:{a[v>>0]=_>>>(d[o>>0]|0)<<(d[p>>0]|0)|Y>>>(d[f>>0]|0)<<(d[n>>0]|0)|aa>>>(d[q>>0]|0)<<(d[r>>0]|0)|ba>>>(d[s>>0]|0)<<(d[t>>0]|0);break}case 2:{b[v>>1]=_>>>(d[o>>0]|0)<<(d[p>>0]|0)|Y>>>(d[f>>0]|0)<<(d[n>>0]|0)|aa>>>(d[q>>0]|0)<<(d[r>>0]|0)|ba>>>(d[s>>0]|0)<<(d[t>>0]|0);break}case 3:{a[v+((d[n>>0]|0)>>>3&255)>>0]=X;a[v+((d[p>>0]|0)>>>3&255)>>0]=Z;a[v+((d[r>>0]|0)>>>3&255)>>0]=$;break}case 4:{c[v>>2]=_>>>(d[o>>0]|0)<<(d[p>>0]|0)|Y>>>(d[f>>0]|0)<<(d[n>>0]|0)|aa>>>(d[q>>0]|0)<<(d[r>>0]|0)|ba>>>(d[s>>0]|0)<<(d[t>>0]|0);break}default:{}}z=v+k|0;A=w;B=x+4|0;y=10;continue}else if((y|0)==10){y=0;ba=c[B>>2]|0;aa=ba>>>22;Y=aa&255;_=ba>>>12;$=_&255;Z=ba>>>2;X=Z&255;W=d[(c[1369]|0)+(ba>>>30)>>0]|0;switch(k|0){case 1:{a[z>>0]=$>>>(d[o>>0]|0)<<(d[p>>0]|0)|Y>>>(d[f>>0]|0)<<(d[n>>0]|0)|X>>>(d[q>>0]|0)<<(d[r>>0]|0)|W>>>(d[s>>0]|0)<<(d[t>>0]|0);break}case 2:{b[z>>1]=$>>>(d[o>>0]|0)<<(d[p>>0]|0)|Y>>>(d[f>>0]|0)<<(d[n>>0]|0)|X>>>(d[q>>0]|0)<<(d[r>>0]|0)|W>>>(d[s>>0]|0)<<(d[t>>0]|0);break}case 3:{a[z+((d[n>>0]|0)>>>3&255)>>0]=aa;a[z+((d[p>>0]|0)>>>3&255)>>0]=_;a[z+((d[r>>0]|0)>>>3&255)>>0]=Z;break}case 4:{c[z>>2]=$>>>(d[o>>0]|0)<<(d[p>>0]|0)|Y>>>(d[f>>0]|0)<<(d[n>>0]|0)|X>>>(d[q>>0]|0)<<(d[r>>0]|0)|W>>>(d[s>>0]|0)<<(d[t>>0]|0);break}default:{}}C=z+k|0;D=A;E=B+4|0;y=16;continue}else if((y|0)==16){y=0;W=c[E>>2]|0;X=W>>>22;Y=X&255;$=W>>>12;Z=$&255;_=W>>>2;aa=_&255;ba=d[(c[1369]|0)+(W>>>30)>>0]|0;switch(k|0){case 1:{a[C>>0]=Z>>>(d[o>>0]|0)<<(d[p>>0]|0)|Y>>>(d[f>>0]|0)<<(d[n>>0]|0)|aa>>>(d[q>>0]|0)<<(d[r>>0]|0)|ba>>>(d[s>>0]|0)<<(d[t>>0]|0);break}case 2:{b[C>>1]=Z>>>(d[o>>0]|0)<<(d[p>>0]|0)|Y>>>(d[f>>0]|0)<<(d[n>>0]|0)|aa>>>(d[q>>0]|0)<<(d[r>>0]|0)|ba>>>(d[s>>0]|0)<<(d[t>>0]|0);break}case 3:{a[C+((d[n>>0]|0)>>>3&255)>>0]=X;a[C+((d[p>>0]|0)>>>3&255)>>0]=$;a[C+((d[r>>0]|0)>>>3&255)>>0]=_;break}case 4:{c[C>>2]=Z>>>(d[o>>0]|0)<<(d[p>>0]|0)|Y>>>(d[f>>0]|0)<<(d[n>>0]|0)|aa>>>(d[q>>0]|0)<<(d[r>>0]|0)|ba>>>(d[s>>0]|0)<<(d[t>>0]|0);break}default:{}}F=C+k|0;G=D;H=E+4|0;y=22;continue}else if((y|0)==22){y=0;ba=c[H>>2]|0;aa=ba>>>22;Y=aa&255;Z=ba>>>12;_=Z&255;$=ba>>>2;X=$&255;W=d[(c[1369]|0)+(ba>>>30)>>0]|0;switch(k|0){case 1:{a[F>>0]=_>>>(d[o>>0]|0)<<(d[p>>0]|0)|Y>>>(d[f>>0]|0)<<(d[n>>0]|0)|X>>>(d[q>>0]|0)<<(d[r>>0]|0)|W>>>(d[s>>0]|0)<<(d[t>>0]|0);break}case 2:{b[F>>1]=_>>>(d[o>>0]|0)<<(d[p>>0]|0)|Y>>>(d[f>>0]|0)<<(d[n>>0]|0)|X>>>(d[q>>0]|0)<<(d[r>>0]|0)|W>>>(d[s>>0]|0)<<(d[t>>0]|0);break}case 3:{a[F+((d[n>>0]|0)>>>3&255)>>0]=aa;a[F+((d[p>>0]|0)>>>3&255)>>0]=Z;a[F+((d[r>>0]|0)>>>3&255)>>0]=$;break}case 4:{c[F>>2]=_>>>(d[o>>0]|0)<<(d[p>>0]|0)|Y>>>(d[f>>0]|0)<<(d[n>>0]|0)|X>>>(d[q>>0]|0)<<(d[r>>0]|0)|W>>>(d[s>>0]|0)<<(d[t>>0]|0);break}default:{}}I=F+k|0;J=G;K=H+4|0;y=28;continue}else if((y|0)==28){y=0;W=c[K>>2]|0;X=W>>>22;Y=X&255;_=W>>>12;$=_&255;Z=W>>>2;aa=Z&255;ba=d[(c[1369]|0)+(W>>>30)>>0]|0;switch(k|0){case 1:{a[I>>0]=$>>>(d[o>>0]|0)<<(d[p>>0]|0)|Y>>>(d[f>>0]|0)<<(d[n>>0]|0)|aa>>>(d[q>>0]|0)<<(d[r>>0]|0)|ba>>>(d[s>>0]|0)<<(d[t>>0]|0);break}case 2:{b[I>>1]=$>>>(d[o>>0]|0)<<(d[p>>0]|0)|Y>>>(d[f>>0]|0)<<(d[n>>0]|0)|aa>>>(d[q>>0]|0)<<(d[r>>0]|0)|ba>>>(d[s>>0]|0)<<(d[t>>0]|0);break}case 3:{a[I+((d[n>>0]|0)>>>3&255)>>0]=X;a[I+((d[p>>0]|0)>>>3&255)>>0]=_;a[I+((d[r>>0]|0)>>>3&255)>>0]=Z;break}case 4:{c[I>>2]=$>>>(d[o>>0]|0)<<(d[p>>0]|0)|Y>>>(d[f>>0]|0)<<(d[n>>0]|0)|aa>>>(d[q>>0]|0)<<(d[r>>0]|0)|ba>>>(d[s>>0]|0)<<(d[t>>0]|0);break}default:{}}L=I+k|0;M=J;N=K+4|0;y=34;continue}else if((y|0)==34){y=0;ba=c[N>>2]|0;aa=ba>>>22;Y=aa&255;$=ba>>>12;Z=$&255;_=ba>>>2;X=_&255;W=d[(c[1369]|0)+(ba>>>30)>>0]|0;switch(k|0){case 1:{a[L>>0]=Z>>>(d[o>>0]|0)<<(d[p>>0]|0)|Y>>>(d[f>>0]|0)<<(d[n>>0]|0)|X>>>(d[q>>0]|0)<<(d[r>>0]|0)|W>>>(d[s>>0]|0)<<(d[t>>0]|0);break}case 2:{b[L>>1]=Z>>>(d[o>>0]|0)<<(d[p>>0]|0)|Y>>>(d[f>>0]|0)<<(d[n>>0]|0)|X>>>(d[q>>0]|0)<<(d[r>>0]|0)|W>>>(d[s>>0]|0)<<(d[t>>0]|0);break}case 3:{a[L+((d[n>>0]|0)>>>3&255)>>0]=aa;a[L+((d[p>>0]|0)>>>3&255)>>0]=$;a[L+((d[r>>0]|0)>>>3&255)>>0]=_;break}case 4:{c[L>>2]=Z>>>(d[o>>0]|0)<<(d[p>>0]|0)|Y>>>(d[f>>0]|0)<<(d[n>>0]|0)|X>>>(d[q>>0]|0)<<(d[r>>0]|0)|W>>>(d[s>>0]|0)<<(d[t>>0]|0);break}default:{}}O=L+k|0;P=M;Q=N+4|0;y=40;continue}else if((y|0)==40){y=0;W=c[Q>>2]|0;X=W>>>22;Y=X&255;Z=W>>>12;_=Z&255;$=W>>>2;aa=$&255;ba=d[(c[1369]|0)+(W>>>30)>>0]|0;switch(k|0){case 1:{a[O>>0]=_>>>(d[o>>0]|0)<<(d[p>>0]|0)|Y>>>(d[f>>0]|0)<<(d[n>>0]|0)|aa>>>(d[q>>0]|0)<<(d[r>>0]|0)|ba>>>(d[s>>0]|0)<<(d[t>>0]|0);break}case 2:{b[O>>1]=_>>>(d[o>>0]|0)<<(d[p>>0]|0)|Y>>>(d[f>>0]|0)<<(d[n>>0]|0)|aa>>>(d[q>>0]|0)<<(d[r>>0]|0)|ba>>>(d[s>>0]|0)<<(d[t>>0]|0);break}case 3:{a[O+((d[n>>0]|0)>>>3&255)>>0]=X;a[O+((d[p>>0]|0)>>>3&255)>>0]=Z;a[O+((d[r>>0]|0)>>>3&255)>>0]=$;break}case 4:{c[O>>2]=_>>>(d[o>>0]|0)<<(d[p>>0]|0)|Y>>>(d[f>>0]|0)<<(d[n>>0]|0)|aa>>>(d[q>>0]|0)<<(d[r>>0]|0)|ba>>>(d[s>>0]|0)<<(d[t>>0]|0);break}default:{}}R=O+k|0;S=P;T=Q+4|0;y=46;continue}else if((y|0)==46){y=0;ba=c[T>>2]|0;aa=ba>>>22;Y=aa&255;_=ba>>>12;$=_&255;Z=ba>>>2;X=Z&255;W=d[(c[1369]|0)+(ba>>>30)>>0]|0;switch(k|0){case 1:{a[R>>0]=$>>>(d[o>>0]|0)<<(d[p>>0]|0)|Y>>>(d[f>>0]|0)<<(d[n>>0]|0)|X>>>(d[q>>0]|0)<<(d[r>>0]|0)|W>>>(d[s>>0]|0)<<(d[t>>0]|0);break}case 2:{b[R>>1]=$>>>(d[o>>0]|0)<<(d[p>>0]|0)|Y>>>(d[f>>0]|0)<<(d[n>>0]|0)|X>>>(d[q>>0]|0)<<(d[r>>0]|0)|W>>>(d[s>>0]|0)<<(d[t>>0]|0);break}case 3:{a[R+((d[n>>0]|0)>>>3&255)>>0]=aa;a[R+((d[p>>0]|0)>>>3&255)>>0]=_;a[R+((d[r>>0]|0)>>>3&255)>>0]=Z;break}case 4:{c[R>>2]=$>>>(d[o>>0]|0)<<(d[p>>0]|0)|Y>>>(d[f>>0]|0)<<(d[n>>0]|0)|X>>>(d[q>>0]|0)<<(d[r>>0]|0)|W>>>(d[s>>0]|0)<<(d[t>>0]|0);break}default:{}}W=R+k|0;X=T+4|0;if((S|0)>1){v=W;w=S+-1|0;x=X;y=4;continue}else{U=W;V=X;y=52;continue}}else if((y|0)==52){y=0;if(!e)break a;else{j=e;g=U+i|0;u=V+h|0;continue a}}}return}function wg(b){b=b|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0;f=c[b+24>>2]|0;g=c[b+28>>2]|0;h=c[b+16>>2]|0;i=c[b+36>>2]|0;j=c[b+48>>2]|0;k=c[b+40>>2]|0;l=d[k+9>>0]|0;if(!g)return;m=(f+3|0)/4|0;n=f&3;f=(c[b+44>>2]|0)+4|0;o=(j|0)==0;p=k+12|0;q=k+32|0;r=k+28|0;s=k+16|0;t=k+33|0;u=k+29|0;v=k+20|0;w=k+34|0;x=k+30|0;y=k+24|0;z=k+35|0;A=k+31|0;k=g;g=c[b+20>>2]|0;B=c[b>>2]|0;a:while(1){b=k+-1|0;switch(n|0){case 0:{C=g;D=m;E=B;F=4;break}case 3:{G=g;H=m;I=B;F=13;break}case 2:{J=g;K=m;L=B;F=22;break}case 1:{M=g;N=m;O=B;F=31;break}default:{P=g;Q=B;F=40}}while(1)if((F|0)==4){F=0;switch(l|0){case 1:{R=d[E>>0]|0;S=d[(c[5452+((d[A>>0]|0)<<2)>>2]|0)+((c[y>>2]&R)>>>(d[z>>0]|0))>>0]|0;T=d[(c[5452+((d[x>>0]|0)<<2)>>2]|0)+((c[v>>2]&R)>>>(d[w>>0]|0))>>0]|0;U=d[(c[5452+((d[u>>0]|0)<<2)>>2]|0)+((c[s>>2]&R)>>>(d[t>>0]|0))>>0]|0;V=d[(c[5452+((d[r>>0]|0)<<2)>>2]|0)+((R&c[p>>2])>>>(d[q>>0]|0))>>0]|0;break}case 2:{R=e[E>>1]|0;S=d[(c[5452+((d[A>>0]|0)<<2)>>2]|0)+((c[y>>2]&R)>>>(d[z>>0]|0))>>0]|0;T=d[(c[5452+((d[x>>0]|0)<<2)>>2]|0)+((c[v>>2]&R)>>>(d[w>>0]|0))>>0]|0;U=d[(c[5452+((d[u>>0]|0)<<2)>>2]|0)+((c[s>>2]&R)>>>(d[t>>0]|0))>>0]|0;V=d[(c[5452+((d[r>>0]|0)<<2)>>2]|0)+((R&c[p>>2])>>>(d[q>>0]|0))>>0]|0;break}case 3:{S=255;T=d[E+((d[w>>0]|0)>>>3&255)>>0]|0;U=d[E+((d[t>>0]|0)>>>3&255)>>0]|0;V=d[E+((d[q>>0]|0)>>>3&255)>>0]|0;break}case 4:{R=c[E>>2]|0;S=d[(c[5452+((d[A>>0]|0)<<2)>>2]|0)+((c[y>>2]&R)>>>(d[z>>0]|0))>>0]|0;T=d[(c[5452+((d[x>>0]|0)<<2)>>2]|0)+((c[v>>2]&R)>>>(d[w>>0]|0))>>0]|0;U=d[(c[5452+((d[u>>0]|0)<<2)>>2]|0)+((c[s>>2]&R)>>>(d[t>>0]|0))>>0]|0;V=d[(c[5452+((d[r>>0]|0)<<2)>>2]|0)+((c[p>>2]&R)>>>(d[q>>0]|0))>>0]|0;break}default:{S=0;T=0;U=0;V=0}}R=d[C>>0]|0;W=c[(c[f>>2]|0)+4>>2]|0;X=d[W+(R<<2)>>0]|0;Y=d[W+(R<<2)+1>>0]|0;Z=d[W+(R<<2)+2>>0]|0;R=((((ca(U-Y|0,S)|0)>>>0)/255|0)+Y|0)>>>3&28|(((ca(V-X|0,S)|0)>>>0)/255|0)+X&224|((((ca(T-Z|0,S)|0)>>>0)/255|0)+Z|0)>>>6&3;if(o)_=R&255;else _=a[j+R>>0]|0;a[C>>0]=_;G=C+1|0;H=D;I=E+l|0;F=13;continue}else if((F|0)==13){F=0;switch(l|0){case 1:{R=d[I>>0]|0;$=d[(c[5452+((d[A>>0]|0)<<2)>>2]|0)+((c[y>>2]&R)>>>(d[z>>0]|0))>>0]|0;aa=d[(c[5452+((d[x>>0]|0)<<2)>>2]|0)+((c[v>>2]&R)>>>(d[w>>0]|0))>>0]|0;ba=d[(c[5452+((d[u>>0]|0)<<2)>>2]|0)+((c[s>>2]&R)>>>(d[t>>0]|0))>>0]|0;da=d[(c[5452+((d[r>>0]|0)<<2)>>2]|0)+((R&c[p>>2])>>>(d[q>>0]|0))>>0]|0;break}case 2:{R=e[I>>1]|0;$=d[(c[5452+((d[A>>0]|0)<<2)>>2]|0)+((c[y>>2]&R)>>>(d[z>>0]|0))>>0]|0;aa=d[(c[5452+((d[x>>0]|0)<<2)>>2]|0)+((c[v>>2]&R)>>>(d[w>>0]|0))>>0]|0;ba=d[(c[5452+((d[u>>0]|0)<<2)>>2]|0)+((c[s>>2]&R)>>>(d[t>>0]|0))>>0]|0;da=d[(c[5452+((d[r>>0]|0)<<2)>>2]|0)+((R&c[p>>2])>>>(d[q>>0]|0))>>0]|0;break}case 3:{$=255;aa=d[I+((d[w>>0]|0)>>>3&255)>>0]|0;ba=d[I+((d[t>>0]|0)>>>3&255)>>0]|0;da=d[I+((d[q>>0]|0)>>>3&255)>>0]|0;break}case 4:{R=c[I>>2]|0;$=d[(c[5452+((d[A>>0]|0)<<2)>>2]|0)+((c[y>>2]&R)>>>(d[z>>0]|0))>>0]|0;aa=d[(c[5452+((d[x>>0]|0)<<2)>>2]|0)+((c[v>>2]&R)>>>(d[w>>0]|0))>>0]|0;ba=d[(c[5452+((d[u>>0]|0)<<2)>>2]|0)+((c[s>>2]&R)>>>(d[t>>0]|0))>>0]|0;da=d[(c[5452+((d[r>>0]|0)<<2)>>2]|0)+((c[p>>2]&R)>>>(d[q>>0]|0))>>0]|0;break}default:{$=0;aa=0;ba=0;da=0}}R=d[G>>0]|0;Z=c[(c[f>>2]|0)+4>>2]|0;X=d[Z+(R<<2)>>0]|0;Y=d[Z+(R<<2)+1>>0]|0;W=d[Z+(R<<2)+2>>0]|0;R=((((ca(ba-Y|0,$)|0)>>>0)/255|0)+Y|0)>>>3&28|(((ca(da-X|0,$)|0)>>>0)/255|0)+X&224|((((ca(aa-W|0,$)|0)>>>0)/255|0)+W|0)>>>6&3;if(o)ea=R&255;else ea=a[j+R>>0]|0;a[G>>0]=ea;J=G+1|0;K=H;L=I+l|0;F=22;continue}else if((F|0)==22){F=0;switch(l|0){case 1:{R=d[L>>0]|0;fa=d[(c[5452+((d[A>>0]|0)<<2)>>2]|0)+((c[y>>2]&R)>>>(d[z>>0]|0))>>0]|0;ga=d[(c[5452+((d[x>>0]|0)<<2)>>2]|0)+((c[v>>2]&R)>>>(d[w>>0]|0))>>0]|0;ha=d[(c[5452+((d[u>>0]|0)<<2)>>2]|0)+((c[s>>2]&R)>>>(d[t>>0]|0))>>0]|0;ia=d[(c[5452+((d[r>>0]|0)<<2)>>2]|0)+((R&c[p>>2])>>>(d[q>>0]|0))>>0]|0;break}case 2:{R=e[L>>1]|0;fa=d[(c[5452+((d[A>>0]|0)<<2)>>2]|0)+((c[y>>2]&R)>>>(d[z>>0]|0))>>0]|0;ga=d[(c[5452+((d[x>>0]|0)<<2)>>2]|0)+((c[v>>2]&R)>>>(d[w>>0]|0))>>0]|0;ha=d[(c[5452+((d[u>>0]|0)<<2)>>2]|0)+((c[s>>2]&R)>>>(d[t>>0]|0))>>0]|0;ia=d[(c[5452+((d[r>>0]|0)<<2)>>2]|0)+((R&c[p>>2])>>>(d[q>>0]|0))>>0]|0;break}case 3:{fa=255;ga=d[L+((d[w>>0]|0)>>>3&255)>>0]|0;ha=d[L+((d[t>>0]|0)>>>3&255)>>0]|0;ia=d[L+((d[q>>0]|0)>>>3&255)>>0]|0;break}case 4:{R=c[L>>2]|0;fa=d[(c[5452+((d[A>>0]|0)<<2)>>2]|0)+((c[y>>2]&R)>>>(d[z>>0]|0))>>0]|0;ga=d[(c[5452+((d[x>>0]|0)<<2)>>2]|0)+((c[v>>2]&R)>>>(d[w>>0]|0))>>0]|0;ha=d[(c[5452+((d[u>>0]|0)<<2)>>2]|0)+((c[s>>2]&R)>>>(d[t>>0]|0))>>0]|0;ia=d[(c[5452+((d[r>>0]|0)<<2)>>2]|0)+((c[p>>2]&R)>>>(d[q>>0]|0))>>0]|0;break}default:{fa=0;ga=0;ha=0;ia=0}}R=d[J>>0]|0;W=c[(c[f>>2]|0)+4>>2]|0;X=d[W+(R<<2)>>0]|0;Y=d[W+(R<<2)+1>>0]|0;Z=d[W+(R<<2)+2>>0]|0;R=((((ca(ha-Y|0,fa)|0)>>>0)/255|0)+Y|0)>>>3&28|(((ca(ia-X|0,fa)|0)>>>0)/255|0)+X&224|((((ca(ga-Z|0,fa)|0)>>>0)/255|0)+Z|0)>>>6&3;if(o)ja=R&255;else ja=a[j+R>>0]|0;a[J>>0]=ja;M=J+1|0;N=K;O=L+l|0;F=31;continue}else if((F|0)==31){F=0;switch(l|0){case 1:{R=d[O>>0]|0;ka=d[(c[5452+((d[A>>0]|0)<<2)>>2]|0)+((c[y>>2]&R)>>>(d[z>>0]|0))>>0]|0;la=d[(c[5452+((d[x>>0]|0)<<2)>>2]|0)+((c[v>>2]&R)>>>(d[w>>0]|0))>>0]|0;ma=d[(c[5452+((d[u>>0]|0)<<2)>>2]|0)+((c[s>>2]&R)>>>(d[t>>0]|0))>>0]|0;na=d[(c[5452+((d[r>>0]|0)<<2)>>2]|0)+((R&c[p>>2])>>>(d[q>>0]|0))>>0]|0;break}case 2:{R=e[O>>1]|0;ka=d[(c[5452+((d[A>>0]|0)<<2)>>2]|0)+((c[y>>2]&R)>>>(d[z>>0]|0))>>0]|0;la=d[(c[5452+((d[x>>0]|0)<<2)>>2]|0)+((c[v>>2]&R)>>>(d[w>>0]|0))>>0]|0;ma=d[(c[5452+((d[u>>0]|0)<<2)>>2]|0)+((c[s>>2]&R)>>>(d[t>>0]|0))>>0]|0;na=d[(c[5452+((d[r>>0]|0)<<2)>>2]|0)+((R&c[p>>2])>>>(d[q>>0]|0))>>0]|0;break}case 3:{ka=255;la=d[O+((d[w>>0]|0)>>>3&255)>>0]|0;ma=d[O+((d[t>>0]|0)>>>3&255)>>0]|0;na=d[O+((d[q>>0]|0)>>>3&255)>>0]|0;break}case 4:{R=c[O>>2]|0;ka=d[(c[5452+((d[A>>0]|0)<<2)>>2]|0)+((c[y>>2]&R)>>>(d[z>>0]|0))>>0]|0;la=d[(c[5452+((d[x>>0]|0)<<2)>>2]|0)+((c[v>>2]&R)>>>(d[w>>0]|0))>>0]|0;ma=d[(c[5452+((d[u>>0]|0)<<2)>>2]|0)+((c[s>>2]&R)>>>(d[t>>0]|0))>>0]|0;na=d[(c[5452+((d[r>>0]|0)<<2)>>2]|0)+((c[p>>2]&R)>>>(d[q>>0]|0))>>0]|0;break}default:{ka=0;la=0;ma=0;na=0}}R=d[M>>0]|0;Z=c[(c[f>>2]|0)+4>>2]|0;X=d[Z+(R<<2)>>0]|0;Y=d[Z+(R<<2)+1>>0]|0;W=d[Z+(R<<2)+2>>0]|0;R=((((ca(ma-Y|0,ka)|0)>>>0)/255|0)+Y|0)>>>3&28|(((ca(na-X|0,ka)|0)>>>0)/255|0)+X&224|((((ca(la-W|0,ka)|0)>>>0)/255|0)+W|0)>>>6&3;if(o)oa=R&255;else oa=a[j+R>>0]|0;a[M>>0]=oa;R=M+1|0;W=O+l|0;if((N|0)>1){C=R;D=N+-1|0;E=W;F=4;continue}else{P=R;Q=W;F=40;continue}}else if((F|0)==40){F=0;if(!b)break a;else{k=b;g=P+i|0;B=Q+h|0;continue a}}}return}function xg(b){b=b|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0;f=c[b+24>>2]|0;g=c[b+28>>2]|0;h=c[b+16>>2]|0;i=c[b+36>>2]|0;j=c[b+48>>2]|0;k=c[b+40>>2]|0;l=d[k+9>>0]|0;m=d[b+63>>0]|0;if(!g)return;n=(f+3|0)/4|0;o=f&3;f=(c[b+44>>2]|0)+4|0;p=(j|0)==0;q=k+12|0;r=k+32|0;s=k+28|0;t=k+16|0;u=k+33|0;v=k+29|0;w=k+20|0;x=k+34|0;y=k+30|0;k=g;g=c[b+20>>2]|0;z=c[b>>2]|0;a:while(1){b=k+-1|0;switch(o|0){case 0:{A=g;B=n;C=z;D=4;break}case 3:{E=g;F=n;G=z;D=13;break}case 2:{H=g;I=n;J=z;D=22;break}case 1:{K=g;L=n;M=z;D=31;break}default:{N=g;O=z;D=40}}while(1)if((D|0)==4){D=0;switch(l|0){case 1:{P=d[C>>0]|0;Q=d[(c[5452+((d[y>>0]|0)<<2)>>2]|0)+((c[w>>2]&P)>>>(d[x>>0]|0))>>0]|0;R=d[(c[5452+((d[v>>0]|0)<<2)>>2]|0)+((c[t>>2]&P)>>>(d[u>>0]|0))>>0]|0;S=d[(c[5452+((d[s>>0]|0)<<2)>>2]|0)+((P&c[q>>2])>>>(d[r>>0]|0))>>0]|0;break}case 2:{P=e[C>>1]|0;Q=d[(c[5452+((d[y>>0]|0)<<2)>>2]|0)+((c[w>>2]&P)>>>(d[x>>0]|0))>>0]|0;R=d[(c[5452+((d[v>>0]|0)<<2)>>2]|0)+((c[t>>2]&P)>>>(d[u>>0]|0))>>0]|0;S=d[(c[5452+((d[s>>0]|0)<<2)>>2]|0)+((P&c[q>>2])>>>(d[r>>0]|0))>>0]|0;break}case 3:{Q=d[C+((d[x>>0]|0)>>>3&255)>>0]|0;R=d[C+((d[u>>0]|0)>>>3&255)>>0]|0;S=d[C+((d[r>>0]|0)>>>3&255)>>0]|0;break}case 4:{P=c[C>>2]|0;Q=d[(c[5452+((d[y>>0]|0)<<2)>>2]|0)+((c[w>>2]&P)>>>(d[x>>0]|0))>>0]|0;R=d[(c[5452+((d[v>>0]|0)<<2)>>2]|0)+((c[t>>2]&P)>>>(d[u>>0]|0))>>0]|0;S=d[(c[5452+((d[s>>0]|0)<<2)>>2]|0)+((c[q>>2]&P)>>>(d[r>>0]|0))>>0]|0;break}default:{Q=0;R=0;S=0}}P=d[A>>0]|0;T=c[(c[f>>2]|0)+4>>2]|0;U=d[T+(P<<2)>>0]|0;V=d[T+(P<<2)+1>>0]|0;W=d[T+(P<<2)+2>>0]|0;P=((((ca(R-V|0,m)|0)>>>0)/255|0)+V|0)>>>3&28|(((ca(S-U|0,m)|0)>>>0)/255|0)+U&224|((((ca(Q-W|0,m)|0)>>>0)/255|0)+W|0)>>>6&3;if(p)X=P&255;else X=a[j+P>>0]|0;a[A>>0]=X;E=A+1|0;F=B;G=C+l|0;D=13;continue}else if((D|0)==13){D=0;switch(l|0){case 1:{P=d[G>>0]|0;Y=d[(c[5452+((d[y>>0]|0)<<2)>>2]|0)+((c[w>>2]&P)>>>(d[x>>0]|0))>>0]|0;Z=d[(c[5452+((d[v>>0]|0)<<2)>>2]|0)+((c[t>>2]&P)>>>(d[u>>0]|0))>>0]|0;_=d[(c[5452+((d[s>>0]|0)<<2)>>2]|0)+((P&c[q>>2])>>>(d[r>>0]|0))>>0]|0;break}case 2:{P=e[G>>1]|0;Y=d[(c[5452+((d[y>>0]|0)<<2)>>2]|0)+((c[w>>2]&P)>>>(d[x>>0]|0))>>0]|0;Z=d[(c[5452+((d[v>>0]|0)<<2)>>2]|0)+((c[t>>2]&P)>>>(d[u>>0]|0))>>0]|0;_=d[(c[5452+((d[s>>0]|0)<<2)>>2]|0)+((P&c[q>>2])>>>(d[r>>0]|0))>>0]|0;break}case 3:{Y=d[G+((d[x>>0]|0)>>>3&255)>>0]|0;Z=d[G+((d[u>>0]|0)>>>3&255)>>0]|0;_=d[G+((d[r>>0]|0)>>>3&255)>>0]|0;break}case 4:{P=c[G>>2]|0;Y=d[(c[5452+((d[y>>0]|0)<<2)>>2]|0)+((c[w>>2]&P)>>>(d[x>>0]|0))>>0]|0;Z=d[(c[5452+((d[v>>0]|0)<<2)>>2]|0)+((c[t>>2]&P)>>>(d[u>>0]|0))>>0]|0;_=d[(c[5452+((d[s>>0]|0)<<2)>>2]|0)+((c[q>>2]&P)>>>(d[r>>0]|0))>>0]|0;break}default:{Y=0;Z=0;_=0}}P=d[E>>0]|0;W=c[(c[f>>2]|0)+4>>2]|0;U=d[W+(P<<2)>>0]|0;V=d[W+(P<<2)+1>>0]|0;T=d[W+(P<<2)+2>>0]|0;P=((((ca(Z-V|0,m)|0)>>>0)/255|0)+V|0)>>>3&28|(((ca(_-U|0,m)|0)>>>0)/255|0)+U&224|((((ca(Y-T|0,m)|0)>>>0)/255|0)+T|0)>>>6&3;if(p)$=P&255;else $=a[j+P>>0]|0;a[E>>0]=$;H=E+1|0;I=F;J=G+l|0;D=22;continue}else if((D|0)==22){D=0;switch(l|0){case 1:{P=d[J>>0]|0;aa=d[(c[5452+((d[y>>0]|0)<<2)>>2]|0)+((c[w>>2]&P)>>>(d[x>>0]|0))>>0]|0;ba=d[(c[5452+((d[v>>0]|0)<<2)>>2]|0)+((c[t>>2]&P)>>>(d[u>>0]|0))>>0]|0;da=d[(c[5452+((d[s>>0]|0)<<2)>>2]|0)+((P&c[q>>2])>>>(d[r>>0]|0))>>0]|0;break}case 2:{P=e[J>>1]|0;aa=d[(c[5452+((d[y>>0]|0)<<2)>>2]|0)+((c[w>>2]&P)>>>(d[x>>0]|0))>>0]|0;ba=d[(c[5452+((d[v>>0]|0)<<2)>>2]|0)+((c[t>>2]&P)>>>(d[u>>0]|0))>>0]|0;da=d[(c[5452+((d[s>>0]|0)<<2)>>2]|0)+((P&c[q>>2])>>>(d[r>>0]|0))>>0]|0;break}case 3:{aa=d[J+((d[x>>0]|0)>>>3&255)>>0]|0;ba=d[J+((d[u>>0]|0)>>>3&255)>>0]|0;da=d[J+((d[r>>0]|0)>>>3&255)>>0]|0;break}case 4:{P=c[J>>2]|0;aa=d[(c[5452+((d[y>>0]|0)<<2)>>2]|0)+((c[w>>2]&P)>>>(d[x>>0]|0))>>0]|0;ba=d[(c[5452+((d[v>>0]|0)<<2)>>2]|0)+((c[t>>2]&P)>>>(d[u>>0]|0))>>0]|0;da=d[(c[5452+((d[s>>0]|0)<<2)>>2]|0)+((c[q>>2]&P)>>>(d[r>>0]|0))>>0]|0;break}default:{aa=0;ba=0;da=0}}P=d[H>>0]|0;T=c[(c[f>>2]|0)+4>>2]|0;U=d[T+(P<<2)>>0]|0;V=d[T+(P<<2)+1>>0]|0;W=d[T+(P<<2)+2>>0]|0;P=((((ca(ba-V|0,m)|0)>>>0)/255|0)+V|0)>>>3&28|(((ca(da-U|0,m)|0)>>>0)/255|0)+U&224|((((ca(aa-W|0,m)|0)>>>0)/255|0)+W|0)>>>6&3;if(p)ea=P&255;else ea=a[j+P>>0]|0;a[H>>0]=ea;K=H+1|0;L=I;M=J+l|0;D=31;continue}else if((D|0)==31){D=0;switch(l|0){case 1:{P=d[M>>0]|0;fa=d[(c[5452+((d[y>>0]|0)<<2)>>2]|0)+((c[w>>2]&P)>>>(d[x>>0]|0))>>0]|0;ga=d[(c[5452+((d[v>>0]|0)<<2)>>2]|0)+((c[t>>2]&P)>>>(d[u>>0]|0))>>0]|0;ha=d[(c[5452+((d[s>>0]|0)<<2)>>2]|0)+((P&c[q>>2])>>>(d[r>>0]|0))>>0]|0;break}case 2:{P=e[M>>1]|0;fa=d[(c[5452+((d[y>>0]|0)<<2)>>2]|0)+((c[w>>2]&P)>>>(d[x>>0]|0))>>0]|0;ga=d[(c[5452+((d[v>>0]|0)<<2)>>2]|0)+((c[t>>2]&P)>>>(d[u>>0]|0))>>0]|0;ha=d[(c[5452+((d[s>>0]|0)<<2)>>2]|0)+((P&c[q>>2])>>>(d[r>>0]|0))>>0]|0;break}case 3:{fa=d[M+((d[x>>0]|0)>>>3&255)>>0]|0;ga=d[M+((d[u>>0]|0)>>>3&255)>>0]|0;ha=d[M+((d[r>>0]|0)>>>3&255)>>0]|0;break}case 4:{P=c[M>>2]|0;fa=d[(c[5452+((d[y>>0]|0)<<2)>>2]|0)+((c[w>>2]&P)>>>(d[x>>0]|0))>>0]|0;ga=d[(c[5452+((d[v>>0]|0)<<2)>>2]|0)+((c[t>>2]&P)>>>(d[u>>0]|0))>>0]|0;ha=d[(c[5452+((d[s>>0]|0)<<2)>>2]|0)+((c[q>>2]&P)>>>(d[r>>0]|0))>>0]|0;break}default:{fa=0;ga=0;ha=0}}P=d[K>>0]|0;W=c[(c[f>>2]|0)+4>>2]|0;U=d[W+(P<<2)>>0]|0;V=d[W+(P<<2)+1>>0]|0;T=d[W+(P<<2)+2>>0]|0;P=((((ca(ga-V|0,m)|0)>>>0)/255|0)+V|0)>>>3&28|(((ca(ha-U|0,m)|0)>>>0)/255|0)+U&224|((((ca(fa-T|0,m)|0)>>>0)/255|0)+T|0)>>>6&3;if(p)ia=P&255;else ia=a[j+P>>0]|0;a[K>>0]=ia;P=K+1|0;T=M+l|0;if((L|0)>1){A=P;B=L+-1|0;C=T;D=4;continue}else{N=P;O=T;D=40;continue}}else if((D|0)==40){D=0;if(!b)break a;else{k=b;g=N+i|0;z=O+h|0;continue a}}}return}function Ag(e,f,g){e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0;h=i;i=i+48|0;j=h+16|0;k=h+24|0;if(!e){l=Cj(23831,h)|0;i=h;return l|0}m=e+4|0;if((d[(c[m>>2]|0)+8>>0]|0)<8){l=Cj(23863,h+8|0)|0;i=h;return l|0}n=e+36|0;if(!f){if((c[e+44>>2]|0)<1){l=0;i=h;return l|0}if((c[e+48>>2]|0)<1){l=0;i=h;return l|0}else o=n}else if(!(Rl(f,n,k)|0)){l=0;i=h;return l|0}else o=k;k=c[e+20>>2]|0;if(!k){l=Cj(23906,j)|0;i=h;return l|0}j=c[e+16>>2]|0;e=ca(j,c[o+4>>2]|0)|0;n=d[(c[m>>2]|0)+9>>0]|0;m=k+((ca(n,c[o>>2]|0)|0)+e)|0;switch(n|0){case 1:{n=g<<8|g;e=n<<16|n;n=c[o+8>>2]|0;k=c[o+12>>2]|0;f=k+-1|0;if(!k){l=0;i=h;return l|0}k=g&255;p=n+-1|0;if((n|0)>3){q=m;r=f}else{s=n&3;t=(s|0)==0;u=n&-4;v=u|1;w=m;x=f;while(1){a:do if(!t){f=w+u|0;switch(s|0){case 3:{a[f>>0]=k;y=v;z=w+v|0;A=34;break}case 2:{y=u;z=f;A=34;break}case 1:{B=f;break}default:break a}if((A|0)==34){A=0;a[z>>0]=k;B=w+(y+1)|0}a[B>>0]=k}while(0);if(!x){l=0;break}else{w=w+j|0;x=x+-1|0}}i=h;return l|0}while(1){switch(q&3|0){case 1:{a[q>>0]=k;C=p;D=q+1|0;A=17;break}case 2:{C=n;D=q;A=17;break}case 3:{E=n;F=q;A=18;break}default:{G=n;H=q}}if((A|0)==17){A=0;a[D>>0]=k;E=C+-1|0;F=D+1|0;A=18}if((A|0)==18){A=0;a[F>>0]=k;G=E+-1|0;H=F+1|0}x=G>>2;w=(x+3|0)>>>2;b:do if(x){switch(x&3|0){case 0:{I=w;J=H;A=21;break}case 3:{K=w;L=H;A=22;break}case 2:{M=w;N=H;A=23;break}case 1:{O=w;P=H;A=24;break}default:break b}while(1)if((A|0)==21){A=0;c[J>>2]=e;K=I;L=J+4|0;A=22;continue}else if((A|0)==22){A=0;c[L>>2]=e;M=K;N=L+4|0;A=23;continue}else if((A|0)==23){A=0;c[N>>2]=e;O=M;P=N+4|0;A=24;continue}else if((A|0)==24){A=0;c[P>>2]=e;B=O+-1|0;if(!B)break;else{I=B;J=P+4|0;A=21;continue}}}while(0);w=G&3;c:do if(w){x=G&-4;B=H+x|0;switch(w|0){case 3:{y=x|1;a[B>>0]=k;Q=y;R=H+y|0;A=28;break}case 2:{Q=x;R=B;A=28;break}case 1:{S=B;break}default:break c}if((A|0)==28){A=0;a[R>>0]=k;S=H+(Q+1)|0}a[S>>0]=k}while(0);if(!r){l=0;break}else{q=q+j|0;r=r+-1|0}}i=h;return l|0}case 2:{r=g<<16|g;q=c[o+8>>2]|0;k=c[o+12>>2]|0;S=k+-1|0;if(!k){l=0;i=h;return l|0}k=g&65535;Q=q+-1|0;if((q|0)>1){T=m;U=S}else{H=(q&1|0)==0;R=m;G=S;while(1){if(!H)b[R+(Q<<1)>>1]=k;if(!G){l=0;break}else{R=R+j|0;G=G+-1|0}}i=h;return l|0}while(1){if(!(T&2)){V=q;W=T}else{b[T>>1]=k;V=Q;W=T+2|0}G=V>>1;R=(G+3|0)>>>2;d:do if(G){switch(G&3|0){case 0:{X=R;Y=W;A=44;break}case 3:{Z=R;_=W;A=45;break}case 2:{$=R;aa=W;A=46;break}case 1:{ba=R;da=W;A=47;break}default:break d}while(1)if((A|0)==44){A=0;c[Y>>2]=r;Z=X;_=Y+4|0;A=45;continue}else if((A|0)==45){A=0;c[_>>2]=r;$=Z;aa=_+4|0;A=46;continue}else if((A|0)==46){A=0;c[aa>>2]=r;ba=$;da=aa+4|0;A=47;continue}else if((A|0)==47){A=0;c[da>>2]=r;H=ba+-1|0;if(!H)break;else{X=H;Y=da+4|0;A=44;continue}}}while(0);if(V&1)b[W+(V+-1<<1)>>1]=k;if(!U){l=0;break}else{T=T+j|0;U=U+-1|0}}i=h;return l|0}case 3:{U=c[o+8>>2]|0;T=c[o+12>>2]|0;k=g>>>16&255;V=g>>>8&255;W=g&255;if((U|0)==0|(T|0)==0){l=0;i=h;return l|0}else{ea=m;fa=T}while(1){T=U;da=ea;while(1){T=T+-1|0;a[da>>0]=k;a[da+1>>0]=V;a[da+2>>0]=W;if(!T)break;else da=da+3|0}fa=fa+-1|0;if(!fa){l=0;break}else ea=ea+j|0}i=h;return l|0}case 4:{ea=c[o+8>>2]|0;fa=c[o+12>>2]|0;if(!fa){l=0;i=h;return l|0}o=(ea+3|0)>>>2;W=(ea|0)==0;V=ea&3;ea=m;m=fa;while(1){m=m+-1|0;e:do if(!W){switch(V|0){case 0:{ga=o;ha=ea;A=62;break}case 3:{ia=o;ja=ea;A=63;break}case 2:{ka=o;la=ea;A=64;break}case 1:{ma=o;na=ea;A=65;break}default:break e}while(1)if((A|0)==62){A=0;c[ha>>2]=g;ia=ga;ja=ha+4|0;A=63;continue}else if((A|0)==63){A=0;c[ja>>2]=g;ka=ia;la=ja+4|0;A=64;continue}else if((A|0)==64){A=0;c[la>>2]=g;ma=ka;na=la+4|0;A=65;continue}else if((A|0)==65){A=0;c[na>>2]=g;fa=ma+-1|0;if(!fa)break;else{ga=fa;ha=na+4|0;A=62;continue}}}while(0);if(!m){l=0;break}else ea=ea+j|0}i=h;return l|0}default:{l=0;i=h;return l|0}}return 0}function yg(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;if(!a)return;b=a+-8|0;d=c[3775]|0;if(b>>>0<d>>>0)Zd();e=c[a+-4>>2]|0;f=e&3;if((f|0)==1)Zd();g=e&-8;h=a+(g+-8)|0;do if(!(e&1)){i=c[b>>2]|0;if(!f)return;j=-8-i|0;k=a+j|0;l=i+g|0;if(k>>>0<d>>>0)Zd();if((k|0)==(c[3776]|0)){m=a+(g+-4)|0;n=c[m>>2]|0;if((n&3|0)!=3){o=k;p=l;break}c[3773]=l;c[m>>2]=n&-2;c[a+(j+4)>>2]=l|1;c[h>>2]=l;return}n=i>>>3;if(i>>>0<256){i=c[a+(j+8)>>2]|0;m=c[a+(j+12)>>2]|0;q=15124+(n<<1<<2)|0;if((i|0)!=(q|0)){if(i>>>0<d>>>0)Zd();if((c[i+12>>2]|0)!=(k|0))Zd()}if((m|0)==(i|0)){c[3771]=c[3771]&~(1<<n);o=k;p=l;break}if((m|0)!=(q|0)){if(m>>>0<d>>>0)Zd();q=m+8|0;if((c[q>>2]|0)==(k|0))r=q;else Zd()}else r=m+8|0;c[i+12>>2]=m;c[r>>2]=i;o=k;p=l;break}i=c[a+(j+24)>>2]|0;m=c[a+(j+12)>>2]|0;do if((m|0)==(k|0)){q=a+(j+20)|0;n=c[q>>2]|0;if(!n){s=a+(j+16)|0;t=c[s>>2]|0;if(!t){u=0;break}else{v=t;w=s}}else{v=n;w=q}while(1){q=v+20|0;n=c[q>>2]|0;if(n){v=n;w=q;continue}q=v+16|0;n=c[q>>2]|0;if(!n){x=v;y=w;break}else{v=n;w=q}}if(y>>>0<d>>>0)Zd();else{c[y>>2]=0;u=x;break}}else{q=c[a+(j+8)>>2]|0;if(q>>>0<d>>>0)Zd();n=q+12|0;if((c[n>>2]|0)!=(k|0))Zd();s=m+8|0;if((c[s>>2]|0)==(k|0)){c[n>>2]=m;c[s>>2]=q;u=m;break}else Zd()}while(0);if(i){m=c[a+(j+28)>>2]|0;q=15388+(m<<2)|0;if((k|0)==(c[q>>2]|0)){c[q>>2]=u;if(!u){c[3772]=c[3772]&~(1<<m);o=k;p=l;break}}else{if(i>>>0<(c[3775]|0)>>>0)Zd();m=i+16|0;if((c[m>>2]|0)==(k|0))c[m>>2]=u;else c[i+20>>2]=u;if(!u){o=k;p=l;break}}m=c[3775]|0;if(u>>>0<m>>>0)Zd();c[u+24>>2]=i;q=c[a+(j+16)>>2]|0;do if(q)if(q>>>0<m>>>0)Zd();else{c[u+16>>2]=q;c[q+24>>2]=u;break}while(0);q=c[a+(j+20)>>2]|0;if(q)if(q>>>0<(c[3775]|0)>>>0)Zd();else{c[u+20>>2]=q;c[q+24>>2]=u;o=k;p=l;break}else{o=k;p=l}}else{o=k;p=l}}else{o=b;p=g}while(0);if(o>>>0>=h>>>0)Zd();b=a+(g+-4)|0;u=c[b>>2]|0;if(!(u&1))Zd();if(!(u&2)){if((h|0)==(c[3777]|0)){d=(c[3774]|0)+p|0;c[3774]=d;c[3777]=o;c[o+4>>2]=d|1;if((o|0)!=(c[3776]|0))return;c[3776]=0;c[3773]=0;return}if((h|0)==(c[3776]|0)){d=(c[3773]|0)+p|0;c[3773]=d;c[3776]=o;c[o+4>>2]=d|1;c[o+d>>2]=d;return}d=(u&-8)+p|0;x=u>>>3;do if(u>>>0>=256){y=c[a+(g+16)>>2]|0;w=c[a+(g|4)>>2]|0;do if((w|0)==(h|0)){v=a+(g+12)|0;r=c[v>>2]|0;if(!r){f=a+(g+8)|0;e=c[f>>2]|0;if(!e){z=0;break}else{A=e;B=f}}else{A=r;B=v}while(1){v=A+20|0;r=c[v>>2]|0;if(r){A=r;B=v;continue}v=A+16|0;r=c[v>>2]|0;if(!r){C=A;D=B;break}else{A=r;B=v}}if(D>>>0<(c[3775]|0)>>>0)Zd();else{c[D>>2]=0;z=C;break}}else{v=c[a+g>>2]|0;if(v>>>0<(c[3775]|0)>>>0)Zd();r=v+12|0;if((c[r>>2]|0)!=(h|0))Zd();f=w+8|0;if((c[f>>2]|0)==(h|0)){c[r>>2]=w;c[f>>2]=v;z=w;break}else Zd()}while(0);if(y){w=c[a+(g+20)>>2]|0;l=15388+(w<<2)|0;if((h|0)==(c[l>>2]|0)){c[l>>2]=z;if(!z){c[3772]=c[3772]&~(1<<w);break}}else{if(y>>>0<(c[3775]|0)>>>0)Zd();w=y+16|0;if((c[w>>2]|0)==(h|0))c[w>>2]=z;else c[y+20>>2]=z;if(!z)break}w=c[3775]|0;if(z>>>0<w>>>0)Zd();c[z+24>>2]=y;l=c[a+(g+8)>>2]|0;do if(l)if(l>>>0<w>>>0)Zd();else{c[z+16>>2]=l;c[l+24>>2]=z;break}while(0);l=c[a+(g+12)>>2]|0;if(l)if(l>>>0<(c[3775]|0)>>>0)Zd();else{c[z+20>>2]=l;c[l+24>>2]=z;break}}}else{l=c[a+g>>2]|0;w=c[a+(g|4)>>2]|0;y=15124+(x<<1<<2)|0;if((l|0)!=(y|0)){if(l>>>0<(c[3775]|0)>>>0)Zd();if((c[l+12>>2]|0)!=(h|0))Zd()}if((w|0)==(l|0)){c[3771]=c[3771]&~(1<<x);break}if((w|0)!=(y|0)){if(w>>>0<(c[3775]|0)>>>0)Zd();y=w+8|0;if((c[y>>2]|0)==(h|0))E=y;else Zd()}else E=w+8|0;c[l+12>>2]=w;c[E>>2]=l}while(0);c[o+4>>2]=d|1;c[o+d>>2]=d;if((o|0)==(c[3776]|0)){c[3773]=d;return}else F=d}else{c[b>>2]=u&-2;c[o+4>>2]=p|1;c[o+p>>2]=p;F=p}p=F>>>3;if(F>>>0<256){u=p<<1;b=15124+(u<<2)|0;d=c[3771]|0;E=1<<p;if(d&E){p=15124+(u+2<<2)|0;h=c[p>>2]|0;if(h>>>0<(c[3775]|0)>>>0)Zd();else{G=p;H=h}}else{c[3771]=d|E;G=15124+(u+2<<2)|0;H=b}c[G>>2]=o;c[H+12>>2]=o;c[o+8>>2]=H;c[o+12>>2]=b;return}b=F>>>8;if(b)if(F>>>0>16777215)I=31;else{H=(b+1048320|0)>>>16&8;G=b<<H;b=(G+520192|0)>>>16&4;u=G<<b;G=(u+245760|0)>>>16&2;E=14-(b|H|G)+(u<<G>>>15)|0;I=F>>>(E+7|0)&1|E<<1}else I=0;E=15388+(I<<2)|0;c[o+28>>2]=I;c[o+20>>2]=0;c[o+16>>2]=0;G=c[3772]|0;u=1<<I;a:do if(G&u){H=c[E>>2]|0;b:do if((c[H+4>>2]&-8|0)!=(F|0)){b=F<<((I|0)==31?0:25-(I>>>1)|0);d=H;while(1){h=d+16+(b>>>31<<2)|0;p=c[h>>2]|0;if(!p){J=h;K=d;break}if((c[p+4>>2]&-8|0)==(F|0)){L=p;break b}else{b=b<<1;d=p}}if(J>>>0<(c[3775]|0)>>>0)Zd();else{c[J>>2]=o;c[o+24>>2]=K;c[o+12>>2]=o;c[o+8>>2]=o;break a}}else L=H;while(0);H=L+8|0;d=c[H>>2]|0;b=c[3775]|0;if(d>>>0>=b>>>0&L>>>0>=b>>>0){c[d+12>>2]=o;c[H>>2]=o;c[o+8>>2]=d;c[o+12>>2]=L;c[o+24>>2]=0;break}else Zd()}else{c[3772]=G|u;c[E>>2]=o;c[o+24>>2]=E;c[o+12>>2]=o;c[o+8>>2]=o}while(0);o=(c[3779]|0)+-1|0;c[3779]=o;if(!o)M=15540;else return;while(1){o=c[M>>2]|0;if(!o)break;else M=o+8|0}c[3779]=-1;return}function Bg(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0;f=i;i=i+1056|0;g=f+1024|0;h=f;j=a[e>>0]|0;if(!(j<<24>>24)){k=b;i=f;return k|0}l=Wu(b,j<<24>>24)|0;if(!l){k=0;i=f;return k|0}b=a[e+1>>0]|0;if(!(b<<24>>24)){k=l;i=f;return k|0}m=l+1|0;n=a[m>>0]|0;if(!(n<<24>>24)){k=0;i=f;return k|0}o=a[e+2>>0]|0;if(!(o<<24>>24)){p=b&255|(j&255)<<8;q=m;m=n;r=l;s=d[l>>0]<<8|n&255;while(1){t=s&65535;if((t|0)==(p|0)){u=r;v=m;break}w=q+1|0;x=a[w>>0]|0;if(!(x<<24>>24)){u=q;v=0;break}else{y=q;q=w;m=x;s=x&255|t<<8;r=y}}k=v<<24>>24!=0?u:0;i=f;return k|0}u=l+2|0;v=a[u>>0]|0;if(!(v<<24>>24)){k=0;i=f;return k|0}r=a[e+3>>0]|0;if(!(r<<24>>24)){s=(b&255)<<16|(j&255)<<24|(o&255)<<8;m=(v&255)<<8|(n&255)<<16|d[l>>0]<<24;if((m|0)==(s|0)){z=u;A=v}else{q=u;u=m;while(1){m=q+1|0;p=a[m>>0]|0;u=(p&255|u)<<8;if(p<<24>>24==0|(u|0)==(s|0)){z=m;A=p;break}else q=m}}k=A<<24>>24!=0?z+-2|0:0;i=f;return k|0}z=l+3|0;A=a[z>>0]|0;if(!(A<<24>>24)){k=0;i=f;return k|0}if(!(a[e+4>>0]|0)){q=(b&255)<<16|(j&255)<<24|(o&255)<<8|r&255;r=(v&255)<<8|(n&255)<<16|A&255|d[l>>0]<<24;if((r|0)==(q|0)){B=z;C=A}else{A=z;z=r;while(1){r=A+1|0;n=a[r>>0]|0;z=n&255|z<<8;if(n<<24>>24==0|(z|0)==(q|0)){B=r;C=n;break}else A=r}}k=C<<24>>24!=0?B+-3|0:0;i=f;return k|0};c[g>>2]=0;c[g+4>>2]=0;c[g+8>>2]=0;c[g+12>>2]=0;c[g+16>>2]=0;c[g+20>>2]=0;c[g+24>>2]=0;c[g+28>>2]=0;B=j;j=0;while(1){if(!(a[l+j>>0]|0)){D=0;break}C=g+(((B&255)>>>5&255)<<2)|0;c[C>>2]=c[C>>2]|1<<(B&31);C=j+1|0;c[h+((B&255)<<2)>>2]=C;B=a[e+C>>0]|0;if(!(B<<24>>24)){E=C;F=j;G=23;break}else j=C}a:do if((G|0)==23){b:do if(E>>>0>1){j=1;B=-1;C=0;c:while(1){A=j;q=C;z=1;while(1){r=A;n=q;d:while(1){v=r;o=1;while(1){b=a[e+(o+B)>>0]|0;s=a[e+v>>0]|0;if(b<<24>>24!=s<<24>>24){H=v;I=b;J=s;K=n;break d}if((o|0)==(z|0))break;o=o+1|0;v=o+n|0;if(v>>>0>=E>>>0){L=B;M=z;break c}}n=n+z|0;r=n+1|0;if(r>>>0>=E>>>0){L=B;M=z;break c}}r=H-B|0;if((I&255)<=(J&255)){N=K;break}n=H+1|0;if(n>>>0<E>>>0){A=n;q=H;z=r}else{L=B;M=r;break c}}j=N+2|0;if(j>>>0>=E>>>0){L=N;M=1;break}else{B=N;C=N+1|0}}C=1;B=-1;j=0;while(1){z=C;q=j;A=1;while(1){r=z;n=q;e:while(1){v=r;o=1;while(1){s=a[e+(o+B)>>0]|0;b=a[e+v>>0]|0;if(s<<24>>24!=b<<24>>24){O=v;P=s;Q=b;R=n;break e}if((o|0)==(A|0))break;o=o+1|0;v=o+n|0;if(v>>>0>=E>>>0){S=L;T=B;U=M;V=A;break b}}n=n+A|0;r=n+1|0;if(r>>>0>=E>>>0){S=L;T=B;U=M;V=A;break b}}r=O-B|0;if((P&255)>=(Q&255)){W=R;break}n=O+1|0;if(n>>>0<E>>>0){z=n;q=O;A=r}else{S=L;T=B;U=M;V=r;break b}}C=W+2|0;if(C>>>0>=E>>>0){S=L;T=W;U=M;V=1;break}else{B=W;j=W+1|0}}}else{S=-1;T=-1;U=1;V=1}while(0);j=(T+1|0)>>>0>(S+1|0)>>>0;B=j?V:U;C=j?T:S;j=C+1|0;if(!(op(e,e+B|0,j)|0)){A=E-B|0;q=E|63;if((E|0)==(B|0)){X=q;Y=E}else{z=l;r=0;n=l;f:while(1){v=z;do if((n-v|0)>>>0<E>>>0){o=zk(n,0,q)|0;if(o)if((o-v|0)>>>0<E>>>0){D=0;break a}else{Z=o;break}else{Z=n+q|0;break}}else Z=n;while(0);v=a[z+F>>0]|0;if(!(1<<(v&31)&c[g+(((v&255)>>>5&255)<<2)>>2])){z=z+E|0;r=0;n=Z;continue}o=c[h+((v&255)<<2)>>2]|0;v=E-o|0;if((E|0)!=(o|0)){z=z+((r|0)!=0&v>>>0<B>>>0?A:v)|0;r=0;n=Z;continue}v=j>>>0>r>>>0?j:r;o=a[e+v>>0]|0;g:do if(!(o<<24>>24))_=j;else{b=o;s=v;while(1){if(b<<24>>24!=(a[z+s>>0]|0)){$=s;break}s=s+1|0;b=a[e+s>>0]|0;if(!(b<<24>>24)){_=j;break g}}z=z+($-C)|0;r=0;n=Z;continue f}while(0);do{if(_>>>0<=r>>>0){D=z;break a}_=_+-1|0}while((a[e+_>>0]|0)==(a[z+_>>0]|0));z=z+B|0;r=A;n=Z}}}else{n=E-C+-1|0;X=E|63;Y=(C>>>0>n>>>0?C:n)+1|0}n=e+j|0;A=l;r=l;h:while(1){B=A;do if((r-B|0)>>>0<E>>>0){z=zk(r,0,X)|0;if(z)if((z-B|0)>>>0<E>>>0){D=0;break a}else{aa=z;break}else{aa=r+X|0;break}}else aa=r;while(0);B=a[A+F>>0]|0;if(!(1<<(B&31)&c[g+(((B&255)>>>5&255)<<2)>>2])){A=A+E|0;r=aa;continue}z=c[h+((B&255)<<2)>>2]|0;if((E|0)!=(z|0)){A=A+(E-z)|0;r=aa;continue}z=a[n>>0]|0;i:do if(!(z<<24>>24))ba=j;else{B=z;q=j;while(1){if(B<<24>>24!=(a[A+q>>0]|0)){ca=q;break}q=q+1|0;B=a[e+q>>0]|0;if(!(B<<24>>24)){ba=j;break i}}A=A+(ca-C)|0;r=aa;continue h}while(0);do{if(!ba){D=A;break a}ba=ba+-1|0}while((a[e+ba>>0]|0)==(a[A+ba>>0]|0));A=A+Y|0;r=aa}}while(0);k=D;i=f;return k|0}function Fg(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0;d=c[b+24>>2]|0;e=c[b+28>>2]|0;f=c[b>>2]|0;g=(c[b+16>>2]|0)/4|0;h=c[b+20>>2]|0;i=c[b+36>>2]|0;j=c[b+48>>2]|0;if(j){if(!e)return;b=(d+7|0)/8|0;k=d&7;l=e;m=h;n=f;a:while(1){o=l+-1|0;switch(k|0){case 0:{p=m;q=b;r=n;s=25;break}case 7:{t=m;u=b;v=n;s=26;break}case 6:{w=m;x=b;y=n;s=27;break}case 5:{z=m;A=b;B=n;s=28;break}case 4:{C=m;D=b;E=n;s=29;break}case 3:{F=m;G=b;H=n;s=30;break}case 2:{I=m;J=b;K=n;s=31;break}case 1:{L=m;M=b;N=n;s=32;break}default:{O=m;P=n;s=33}}while(1)if((s|0)==25){s=0;Q=c[r>>2]|0;a[p>>0]=a[j+(Q>>>16&224|Q>>>11&28|Q>>>6&3)>>0]|0;t=p+1|0;u=q;v=r+4|0;s=26;continue}else if((s|0)==26){s=0;Q=c[v>>2]|0;a[t>>0]=a[j+(Q>>>16&224|Q>>>11&28|Q>>>6&3)>>0]|0;w=t+1|0;x=u;y=v+4|0;s=27;continue}else if((s|0)==27){s=0;Q=c[y>>2]|0;a[w>>0]=a[j+(Q>>>16&224|Q>>>11&28|Q>>>6&3)>>0]|0;z=w+1|0;A=x;B=y+4|0;s=28;continue}else if((s|0)==28){s=0;Q=c[B>>2]|0;a[z>>0]=a[j+(Q>>>16&224|Q>>>11&28|Q>>>6&3)>>0]|0;C=z+1|0;D=A;E=B+4|0;s=29;continue}else if((s|0)==29){s=0;Q=c[E>>2]|0;a[C>>0]=a[j+(Q>>>16&224|Q>>>11&28|Q>>>6&3)>>0]|0;F=C+1|0;G=D;H=E+4|0;s=30;continue}else if((s|0)==30){s=0;Q=c[H>>2]|0;a[F>>0]=a[j+(Q>>>16&224|Q>>>11&28|Q>>>6&3)>>0]|0;I=F+1|0;J=G;K=H+4|0;s=31;continue}else if((s|0)==31){s=0;Q=c[K>>2]|0;a[I>>0]=a[j+(Q>>>16&224|Q>>>11&28|Q>>>6&3)>>0]|0;L=I+1|0;M=J;N=K+4|0;s=32;continue}else if((s|0)==32){s=0;Q=c[N>>2]|0;R=L+1|0;a[L>>0]=a[j+(Q>>>16&224|Q>>>11&28|Q>>>6&3)>>0]|0;Q=N+4|0;if((M|0)>1){p=R;q=M+-1|0;r=Q;s=25;continue}else{O=R;P=Q;s=33;continue}}else if((s|0)==33){s=0;if(!o)break a;else{l=o;m=O+i|0;n=P+(g<<2)|0;continue a}}}return}P=e+-1|0;if(!e)return;e=(d+7|0)/8|0;n=d&7;switch(n|0){case 0:{d=i+8|0;O=P;m=h;l=f;while(1){r=m;M=e;while(1){q=c[l>>2]|0;a[r>>0]=q>>>16&224|q>>>11&28|q>>>6&3;q=c[l>>2]|0;a[r+1>>0]=q>>>16&224|q>>>11&28|q>>>6&3;q=c[l>>2]|0;a[r+2>>0]=q>>>16&224|q>>>11&28|q>>>6&3;q=c[l>>2]|0;a[r+3>>0]=q>>>16&224|q>>>11&28|q>>>6&3;q=c[l>>2]|0;a[r+4>>0]=q>>>16&224|q>>>11&28|q>>>6&3;q=c[l>>2]|0;a[r+5>>0]=q>>>16&224|q>>>11&28|q>>>6&3;q=c[l>>2]|0;a[r+6>>0]=q>>>16&224|q>>>11&28|q>>>6&3;q=c[l>>2]|0;a[r+7>>0]=q>>>16&224|q>>>11&28|q>>>6&3;if((M|0)>1){r=r+8|0;M=M+-1|0}else{S=r;break}}if(!O)break;else{O=O+-1|0;m=S+d|0;l=l+(g<<2)|0}}return}case 7:{l=i+7|0;d=P;S=h;m=f;while(1){O=S;r=e;while(1){M=c[m>>2]|0;a[O>>0]=M>>>16&224|M>>>11&28|M>>>6&3;M=c[m>>2]|0;a[O+1>>0]=M>>>16&224|M>>>11&28|M>>>6&3;M=c[m>>2]|0;a[O+2>>0]=M>>>16&224|M>>>11&28|M>>>6&3;M=c[m>>2]|0;a[O+3>>0]=M>>>16&224|M>>>11&28|M>>>6&3;M=c[m>>2]|0;a[O+4>>0]=M>>>16&224|M>>>11&28|M>>>6&3;M=c[m>>2]|0;a[O+5>>0]=M>>>16&224|M>>>11&28|M>>>6&3;M=c[m>>2]|0;a[O+6>>0]=M>>>16&224|M>>>11&28|M>>>6&3;if((r|0)<=1){T=O;break}M=c[m>>2]|0;a[O+7>>0]=M>>>16&224|M>>>11&28|M>>>6&3;O=O+8|0;r=r+-1|0}if(!d)break;else{d=d+-1|0;S=T+l|0;m=m+(g<<2)|0}}return}default:{m=P;P=h;h=f;b:while(1){switch(n|0){case 1:{U=P;V=e;s=22;break}case 2:{W=P;X=e;s=21;break}case 6:{Y=P;Z=e;s=17;break}case 5:{_=P;$=e;s=18;break}case 4:{aa=P;ba=e;s=19;break}case 3:{ca=P;da=e;s=20;break}default:{ea=P;s=23}}while(1)if((s|0)==17){s=0;f=c[h>>2]|0;a[Y>>0]=f>>>16&224|f>>>11&28|f>>>6&3;_=Y+1|0;$=Z;s=18;continue}else if((s|0)==18){s=0;f=c[h>>2]|0;a[_>>0]=f>>>16&224|f>>>11&28|f>>>6&3;aa=_+1|0;ba=$;s=19;continue}else if((s|0)==19){s=0;f=c[h>>2]|0;a[aa>>0]=f>>>16&224|f>>>11&28|f>>>6&3;ca=aa+1|0;da=ba;s=20;continue}else if((s|0)==20){s=0;f=c[h>>2]|0;a[ca>>0]=f>>>16&224|f>>>11&28|f>>>6&3;W=ca+1|0;X=da;s=21;continue}else if((s|0)==21){s=0;f=c[h>>2]|0;a[W>>0]=f>>>16&224|f>>>11&28|f>>>6&3;U=W+1|0;V=X;s=22;continue}else if((s|0)==22){s=0;f=c[h>>2]|0;l=U+1|0;a[U>>0]=f>>>16&224|f>>>11&28|f>>>6&3;if((V|0)<=1){ea=l;s=23;continue}f=c[h>>2]|0;a[l>>0]=f>>>16&224|f>>>11&28|f>>>6&3;f=c[h>>2]|0;a[U+2>>0]=f>>>16&224|f>>>11&28|f>>>6&3;Y=U+3|0;Z=V+-1|0;s=17;continue}else if((s|0)==23){s=0;if(!m)break b;else{m=m+-1|0;P=ea+i|0;h=h+(g<<2)|0;continue b}}}return}}}function zg(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;d=a+b|0;e=c[a+4>>2]|0;do if(!(e&1)){f=c[a>>2]|0;if(!(e&3))return;g=a+(0-f)|0;h=f+b|0;i=c[3775]|0;if(g>>>0<i>>>0)Zd();if((g|0)==(c[3776]|0)){j=a+(b+4)|0;k=c[j>>2]|0;if((k&3|0)!=3){l=g;m=h;break}c[3773]=h;c[j>>2]=k&-2;c[a+(4-f)>>2]=h|1;c[d>>2]=h;return}k=f>>>3;if(f>>>0<256){j=c[a+(8-f)>>2]|0;n=c[a+(12-f)>>2]|0;o=15124+(k<<1<<2)|0;if((j|0)!=(o|0)){if(j>>>0<i>>>0)Zd();if((c[j+12>>2]|0)!=(g|0))Zd()}if((n|0)==(j|0)){c[3771]=c[3771]&~(1<<k);l=g;m=h;break}if((n|0)!=(o|0)){if(n>>>0<i>>>0)Zd();o=n+8|0;if((c[o>>2]|0)==(g|0))p=o;else Zd()}else p=n+8|0;c[j+12>>2]=n;c[p>>2]=j;l=g;m=h;break}j=c[a+(24-f)>>2]|0;n=c[a+(12-f)>>2]|0;do if((n|0)==(g|0)){o=16-f|0;k=a+(o+4)|0;q=c[k>>2]|0;if(!q){r=a+o|0;o=c[r>>2]|0;if(!o){s=0;break}else{t=o;u=r}}else{t=q;u=k}while(1){k=t+20|0;q=c[k>>2]|0;if(q){t=q;u=k;continue}k=t+16|0;q=c[k>>2]|0;if(!q){v=t;w=u;break}else{t=q;u=k}}if(w>>>0<i>>>0)Zd();else{c[w>>2]=0;s=v;break}}else{k=c[a+(8-f)>>2]|0;if(k>>>0<i>>>0)Zd();q=k+12|0;if((c[q>>2]|0)!=(g|0))Zd();r=n+8|0;if((c[r>>2]|0)==(g|0)){c[q>>2]=n;c[r>>2]=k;s=n;break}else Zd()}while(0);if(j){n=c[a+(28-f)>>2]|0;i=15388+(n<<2)|0;if((g|0)==(c[i>>2]|0)){c[i>>2]=s;if(!s){c[3772]=c[3772]&~(1<<n);l=g;m=h;break}}else{if(j>>>0<(c[3775]|0)>>>0)Zd();n=j+16|0;if((c[n>>2]|0)==(g|0))c[n>>2]=s;else c[j+20>>2]=s;if(!s){l=g;m=h;break}}n=c[3775]|0;if(s>>>0<n>>>0)Zd();c[s+24>>2]=j;i=16-f|0;k=c[a+i>>2]|0;do if(k)if(k>>>0<n>>>0)Zd();else{c[s+16>>2]=k;c[k+24>>2]=s;break}while(0);k=c[a+(i+4)>>2]|0;if(k)if(k>>>0<(c[3775]|0)>>>0)Zd();else{c[s+20>>2]=k;c[k+24>>2]=s;l=g;m=h;break}else{l=g;m=h}}else{l=g;m=h}}else{l=a;m=b}while(0);s=c[3775]|0;if(d>>>0<s>>>0)Zd();v=a+(b+4)|0;w=c[v>>2]|0;if(!(w&2)){if((d|0)==(c[3777]|0)){u=(c[3774]|0)+m|0;c[3774]=u;c[3777]=l;c[l+4>>2]=u|1;if((l|0)!=(c[3776]|0))return;c[3776]=0;c[3773]=0;return}if((d|0)==(c[3776]|0)){u=(c[3773]|0)+m|0;c[3773]=u;c[3776]=l;c[l+4>>2]=u|1;c[l+u>>2]=u;return}u=(w&-8)+m|0;t=w>>>3;do if(w>>>0>=256){p=c[a+(b+24)>>2]|0;e=c[a+(b+12)>>2]|0;do if((e|0)==(d|0)){k=a+(b+20)|0;n=c[k>>2]|0;if(!n){f=a+(b+16)|0;j=c[f>>2]|0;if(!j){x=0;break}else{y=j;z=f}}else{y=n;z=k}while(1){k=y+20|0;n=c[k>>2]|0;if(n){y=n;z=k;continue}k=y+16|0;n=c[k>>2]|0;if(!n){A=y;B=z;break}else{y=n;z=k}}if(B>>>0<s>>>0)Zd();else{c[B>>2]=0;x=A;break}}else{k=c[a+(b+8)>>2]|0;if(k>>>0<s>>>0)Zd();n=k+12|0;if((c[n>>2]|0)!=(d|0))Zd();f=e+8|0;if((c[f>>2]|0)==(d|0)){c[n>>2]=e;c[f>>2]=k;x=e;break}else Zd()}while(0);if(p){e=c[a+(b+28)>>2]|0;h=15388+(e<<2)|0;if((d|0)==(c[h>>2]|0)){c[h>>2]=x;if(!x){c[3772]=c[3772]&~(1<<e);break}}else{if(p>>>0<(c[3775]|0)>>>0)Zd();e=p+16|0;if((c[e>>2]|0)==(d|0))c[e>>2]=x;else c[p+20>>2]=x;if(!x)break}e=c[3775]|0;if(x>>>0<e>>>0)Zd();c[x+24>>2]=p;h=c[a+(b+16)>>2]|0;do if(h)if(h>>>0<e>>>0)Zd();else{c[x+16>>2]=h;c[h+24>>2]=x;break}while(0);h=c[a+(b+20)>>2]|0;if(h)if(h>>>0<(c[3775]|0)>>>0)Zd();else{c[x+20>>2]=h;c[h+24>>2]=x;break}}}else{h=c[a+(b+8)>>2]|0;e=c[a+(b+12)>>2]|0;p=15124+(t<<1<<2)|0;if((h|0)!=(p|0)){if(h>>>0<s>>>0)Zd();if((c[h+12>>2]|0)!=(d|0))Zd()}if((e|0)==(h|0)){c[3771]=c[3771]&~(1<<t);break}if((e|0)!=(p|0)){if(e>>>0<s>>>0)Zd();p=e+8|0;if((c[p>>2]|0)==(d|0))C=p;else Zd()}else C=e+8|0;c[h+12>>2]=e;c[C>>2]=h}while(0);c[l+4>>2]=u|1;c[l+u>>2]=u;if((l|0)==(c[3776]|0)){c[3773]=u;return}else D=u}else{c[v>>2]=w&-2;c[l+4>>2]=m|1;c[l+m>>2]=m;D=m}m=D>>>3;if(D>>>0<256){w=m<<1;v=15124+(w<<2)|0;u=c[3771]|0;C=1<<m;if(u&C){m=15124+(w+2<<2)|0;d=c[m>>2]|0;if(d>>>0<(c[3775]|0)>>>0)Zd();else{E=m;F=d}}else{c[3771]=u|C;E=15124+(w+2<<2)|0;F=v}c[E>>2]=l;c[F+12>>2]=l;c[l+8>>2]=F;c[l+12>>2]=v;return}v=D>>>8;if(v)if(D>>>0>16777215)G=31;else{F=(v+1048320|0)>>>16&8;E=v<<F;v=(E+520192|0)>>>16&4;w=E<<v;E=(w+245760|0)>>>16&2;C=14-(v|F|E)+(w<<E>>>15)|0;G=D>>>(C+7|0)&1|C<<1}else G=0;C=15388+(G<<2)|0;c[l+28>>2]=G;c[l+20>>2]=0;c[l+16>>2]=0;E=c[3772]|0;w=1<<G;if(!(E&w)){c[3772]=E|w;c[C>>2]=l;c[l+24>>2]=C;c[l+12>>2]=l;c[l+8>>2]=l;return}w=c[C>>2]|0;a:do if((c[w+4>>2]&-8|0)==(D|0))H=w;else{C=D<<((G|0)==31?0:25-(G>>>1)|0);E=w;while(1){F=E+16+(C>>>31<<2)|0;v=c[F>>2]|0;if(!v){I=F;J=E;break}if((c[v+4>>2]&-8|0)==(D|0)){H=v;break a}else{C=C<<1;E=v}}if(I>>>0<(c[3775]|0)>>>0)Zd();c[I>>2]=l;c[l+24>>2]=J;c[l+12>>2]=l;c[l+8>>2]=l;return}while(0);J=H+8|0;I=c[J>>2]|0;D=c[3775]|0;if(!(I>>>0>=D>>>0&H>>>0>=D>>>0))Zd();c[I+12>>2]=l;c[J>>2]=l;c[l+8>>2]=I;c[l+12>>2]=H;c[l+24>>2]=0;return}function Eg(f,g,h,j,k){f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0;l=i;i=i+5648|0;m=l+1288|0;n=l+264|0;o=l+132|0;p=l;q=l+4488|0;r=l+3336|0;Cp(o|0,0,132)|0;if(!k){if((h|0)>0){k=0;s=0;while(1){t=b[f+33170+(g*576|0)+(k<<1)>>1]|0;if(!(t<<16>>16))u=s;else{b[q+(s<<2)>>1]=t;b[q+(s<<2)+2>>1]=k;u=s+1|0}k=k+1|0;if((k|0)==(h|0)){v=u;break}else s=u}}else v=0;Cp(m|0,0,2048)|0;u=(v|0)==0;if(u)w=0;else{s=0;do{k=e[q+(s<<2)>>1]|0;t=m+((k&255)<<2)|0;c[t>>2]=(c[t>>2]|0)+1;t=m+((k>>>8|256)<<2)|0;c[t>>2]=(c[t>>2]|0)+1;s=s+1|0}while((s|0)!=(v|0));w=c[m+1024>>2]|0}s=(w|0)==(v|0)?1:2;w=q;q=r;r=0;t=0;while(1){k=r<<8;x=0;y=0;while(1){c[n+(y<<2)>>2]=x;z=y+1|0;if((z|0)==256)break;else{x=(c[m+(y+k<<2)>>2]|0)+x|0;y=z}}if(!u){y=0;do{x=w+(y<<2)|0;k=n+(((e[x>>1]|0)>>>t&255)<<2)|0;z=c[k>>2]|0;c[k>>2]=z+1;k=q+(z<<2)|0;z=e[x>>1]|e[x+2>>1]<<16;b[k>>1]=z;b[k+2>>1]=z>>>16;y=y+1|0}while((y|0)!=(v|0))}r=r+1|0;if((r|0)==(s|0)){A=q;break}else{y=q;t=t+8|0;q=w;w=y}}switch(v|0){case 0:break;case 1:{b[A>>1]=1;B=0;C=44;break}default:{w=(e[A>>1]|0)+(e[A+4>>1]|0)&65535;b[A>>1]=w;q=v+-1|0;a:do if((q|0)>1){t=w;s=2;r=1;n=0;while(1){u=A+(n<<2)|0;if((s|0)<(v|0)?(m=b[A+(s<<2)>>1]|0,(t&65535)>=(m&65535)):0){b[A+(r<<2)>>1]=m;D=s+1|0;E=n}else{b[A+(r<<2)>>1]=t;b[u>>1]=r;D=s;E=n+1|0}do if((D|0)<(v|0)){if((E|0)<(r|0)){u=A+(E<<2)|0;m=b[u>>1]|0;y=b[A+(D<<2)>>1]|0;if((m&65535)<(y&65535)){F=u;G=m;C=29;break}else H=y}else H=b[A+(D<<2)>>1]|0;y=A+(r<<2)|0;b[y>>1]=(e[y>>1]|0)+(H&65535);I=D+1|0;J=E}else{y=A+(E<<2)|0;F=y;G=b[y>>1]|0;C=29}while(0);if((C|0)==29){C=0;y=A+(r<<2)|0;b[y>>1]=(e[y>>1]|0)+(G&65535);b[F>>1]=r;I=D;J=E+1|0}y=r+1|0;if((y|0)==(q|0))break a;t=b[A+(J<<2)>>1]|0;s=I;r=y;n=J}}while(0);J=v+-2|0;b[A+(J<<2)>>1]=0;I=v+-3|0;if((I|0)>-1){E=I;while(1){I=A+(E<<2)|0;b[I>>1]=(e[A+((e[I>>1]|0)<<2)>>1]|0)+1;if((E|0)>0)E=E+-1|0;else{K=1;L=0;M=q;N=J;break}}}else{K=1;L=0;M=q;N=J}while(1){b:do if((N|0)>-1){J=N;q=0;while(1){if((e[A+(J<<2)>>1]|0|0)!=(L|0)){O=J;P=q;break b}E=q+1|0;I=J+-1|0;if((J|0)>0){J=I;q=E}else{O=I;P=E;break}}}else{O=N;P=0}while(0);if((K|0)>(P|0)){q=L&65535;J=K;E=M;while(1){b[A+(E<<2)>>1]=q;J=J+-1|0;if((J|0)<=(P|0))break;else E=E+-1|0}Q=M-K+P|0}else Q=M;if((P|0)>0){K=P<<1;L=L+1|0;M=Q;N=O}else break}if((v|0)>0){B=0;C=44}}}do if((C|0)==44){while(1){C=0;O=o+((e[A+(B<<2)>>1]|0)<<2)|0;c[O>>2]=(c[O>>2]|0)+1;B=B+1|0;if((B|0)==(v|0))break;else C=44}if((v|0)>=2){O=j+1|0;if((O|0)<33){N=o+(j<<2)|0;Q=c[N>>2]|0;M=O;do{Q=(c[o+(M<<2)>>2]|0)+Q|0;c[N>>2]=Q;M=M+1|0}while((M|0)!=33)}if((j|0)>0){M=j;Q=0;while(1){N=(c[o+(M<<2)>>2]<<j-M)+Q|0;if((M|0)>1){M=M+-1|0;Q=N}else{R=N;break}}Q=1<<j;if((R|0)==(Q|0))break;else{S=Q;T=R}}else{S=1<<j;T=0}Q=o+(j<<2)|0;M=T;do{c[Q>>2]=(c[Q>>2]|0)+-1;N=j;while(1){O=N+-1|0;if((N|0)<=1)break;L=o+(O<<2)|0;P=c[L>>2]|0;if(!P)N=O;else{U=L;V=P;W=N;C=57;break}}if((C|0)==57){C=0;c[U>>2]=V+-1;N=o+(W<<2)|0;c[N>>2]=(c[N>>2]|0)+2}M=M+-1|0}while((M|0)!=(S|0))}}while(0);Cp(f+36626+(g*288|0)|0,0,288)|0;Cp(f+34898+(g*576|0)|0,0,576)|0;if((j|0)>=1){S=1;W=v;while(1){v=c[o+(S<<2)>>2]|0;if((v|0)>0){V=S&255;U=W+-2|0;C=W;T=v;while(1){C=C+-1|0;a[(e[A+(C<<2)+2>>1]|0)+(f+36626+(g*288|0))>>0]=V;if((T|0)<=1)break;else T=T+-1|0}X=U-v+2|0}else X=W;if((S|0)==(j|0))break;else{S=S+1|0;W=X}}}}else if((h|0)>0){X=0;do{W=o+((d[f+36626+(g*288|0)+X>>0]|0)<<2)|0;c[W>>2]=(c[W>>2]|0)+1;X=X+1|0}while((X|0)!=(h|0))}c[p+4>>2]=0;if((j|0)>=2){X=2;W=0;while(1){W=(c[o+(X+-1<<2)>>2]|0)+W<<1;c[p+(X<<2)>>2]=W;if((X|0)==(j|0))break;else X=X+1|0}}if((h|0)>0)Y=0;else{i=l;return}do{X=a[f+36626+(g*288|0)+Y>>0]|0;j=X&255;if(X<<24>>24){X=p+(j<<2)|0;W=c[X>>2]|0;c[X>>2]=W+1;X=W;W=j;j=0;while(1){o=X&1|j<<1;if((W|0)>1){X=X>>>1;W=W+-1|0;j=o}else{Z=o;break}}b[f+34898+(g*576|0)+(Y<<1)>>1]=Z}Y=Y+1|0}while((Y|0)!=(h|0));i=l;return}function Cg(f,g,h){f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0;j=i;i=i+80|0;k=j+24|0;l=j+16|0;m=j+8|0;n=j;o=j+48|0;p=j+32|0;q=j+67|0;r=j+66|0;s=j+65|0;t=j+64|0;u=g+4|0;v=c[u>>2]|0;if(v){w=c[v>>2]|0;a:do if((w|0)>0){x=c[v+4>>2]|0;y=0;while(1){if((a[x+(y<<2)>>0]|0)!=-1){z=y;break a}if((a[x+(y<<2)+1>>0]|0)!=-1){z=y;break a}if((a[x+(y<<2)+2>>0]|0)!=-1){z=y;break a}A=y+1|0;if((A|0)<(w|0))y=A;else{z=A;break}}}else z=0;while(0);if((z|0)==(w|0)){Cj(24194,n)|0;B=0;i=j;return B|0}}n=f+8|0;w=f+12|0;z=g+24|0;v=ck(0,c[n>>2]|0,c[w>>2]|0,d[g+8>>0]|0,c[g+12>>2]|0,c[g+16>>2]|0,c[g+20>>2]|0,c[z>>2]|0)|0;if(!v){B=0;i=j;return B|0}g=c[u>>2]|0;if((g|0)!=0?(y=v+4|0,x=c[(c[y>>2]|0)+4>>2]|0,(x|0)!=0):0){ax(c[x+4>>2]|0,c[g+4>>2]|0,c[g>>2]<<2)|0;c[c[(c[y>>2]|0)+4>>2]>>2]=c[c[u>>2]>>2]}y=f+52|0;g=c[y>>2]|0;x=g+68|0;A=c[x>>2]|0;C=g+76|0;D=a[C>>0]|0;E=a[g+77>>0]|0;F=a[g+78>>0]|0;G=a[g+79>>0]|0;a[C>>0]=-1;a[C+1>>0]=-1>>8;a[C+2>>0]=-1>>16;a[C+3>>0]=-1>>24;c[x>>2]=0;hq(g);c[p>>2]=0;c[p+4>>2]=0;c[p+8>>2]=c[n>>2];c[p+12>>2]=c[w>>2];w=c[y>>2]|0;do if((c[w>>2]|0)==(v|0)){n=c[(c[v+4>>2]|0)+4>>2]|0;if((n|0)!=0?(c[w+80>>2]|0)!=(c[n+8>>2]|0):0){H=19;break}n=c[(c[f+4>>2]|0)+4>>2]|0;if((n|0)!=0?(c[w+84>>2]|0)!=(c[n+8>>2]|0):0)H=19;else{I=w;H=21}}else H=19;while(0);if((H|0)==19?(Zg(f,v)|0)>=0:0){I=c[y>>2]|0;H=21}if((H|0)==21)Pf[c[I+8>>2]&15](f,p,v,p)|0;p=v+52|0;I=c[p>>2]|0;a[I+76>>0]=D;a[I+77>>0]=E;a[I+78>>0]=F;a[I+79>>0]=G;c[I+68>>2]=A&-28945;I=c[y>>2]|0;a[I+76>>0]=D;a[I+77>>0]=E;a[I+78>>0]=F;a[I+79>>0]=G;c[I+68>>2]=A;hq(I);I=f+4|0;do if(A&256){G=c[I>>2]|0;F=c[G+4>>2]|0;if(!F)J=G;else{G=c[u>>2]|0;if(((G|0)!=0?(E=c[F>>2]|0,(E|0)<=(c[G>>2]|0)):0)?(Ey(c[F+4>>2]|0,c[G+4>>2]|0,E<<2)|0)==0:0){E=c[(c[y>>2]|0)+72>>2]|0;G=c[(c[v+4>>2]|0)+4>>2]|0;F=(G|0)==0;if(!F?(c[G>>2]|0)>>>0<=E>>>0:0){c[m>>2]=24190;Cj(24164,m)|0;break}D=c[p>>2]|0;w=D+68|0;n=c[w>>2]|0;g=n|256;c[w>>2]=g;c[D+72>>2]=E;if(!F){a[(c[G+4>>2]|0)+(E<<2)+3>>0]=0;E=G+8|0;G=(c[E>>2]|0)+1|0;c[E>>2]=(G|0)==0?1:G}if((g|0)==(n|0))break;hq(D);break}if(c[z>>2]|0)break;J=c[I>>2]|0}fm(c[(c[y>>2]|0)+72>>2]|0,J,q,r,s,t);D=v+4|0;n=El(c[D>>2]|0,a[q>>0]|0,a[r>>0]|0,a[s>>0]|0,a[t>>0]|0)|0;g=c[(c[D>>2]|0)+4>>2]|0;G=(g|0)==0;if(!G?(c[g>>2]|0)>>>0<=n>>>0:0){c[l>>2]=24190;Cj(24164,l)|0}else{E=c[p>>2]|0;F=E+68|0;w=c[F>>2]|0;x=w|256;c[F>>2]=x;c[E+72>>2]=n;if(!G){a[(c[g+4>>2]|0)+(n<<2)+3>>0]=0;n=g+8|0;g=(c[n>>2]|0)+1|0;c[n>>2]=(g|0)==0?1:g}if((x|0)!=(w|0))hq(E)}if((c[(c[p>>2]|0)+68>>2]&256|0)!=0?(E=c[D>>2]|0,(c[E+24>>2]|0)!=0):0){w=v+28|0;x=c[w>>2]|0;if(!x)if(!(c[v>>2]&2)){K=0;L=E}else{si(v,1);c[v>>2]=c[v>>2]|2;K=c[w>>2]|0;L=c[D>>2]|0}else{K=x;L=E}E=K+1|0;c[w>>2]=E;switch(d[L+9>>0]|0){case 2:{x=c[L+24>>2]&65535^65535;g=x&c[(c[p>>2]|0)+72>>2];n=c[v+20>>2]|0;G=c[v+12>>2]|0;if((G|0)!=0?(F=c[v+8>>2]|0,C=(c[v+16>>2]|0)/2|0,(F|0)!=0):0){M=g&65535;N=G;G=n;while(1){n=F;O=G;while(1){n=n+-1|0;if((e[O>>1]&x|0)==(g|0))b[O>>1]=M;if(!n)break;else O=O+2|0}N=N+-1|0;if(!N){P=E;break}else G=G+(C<<1)|0}}else P=E;break}case 4:{C=~c[L+24>>2];G=c[(c[p>>2]|0)+72>>2]&C;N=c[v+12>>2]|0;if(!N)P=E;else{M=v+8|0;g=v+16|0;x=N;N=c[v+20>>2]|0;while(1){x=x+-1|0;F=c[M>>2]|0;if(F){O=F;F=N;while(1){O=O+-1|0;if((c[F>>2]&C|0)==(G|0))c[F>>2]=G;if(!O)break;else F=F+4|0}}if(!x)break;else N=N+(((c[g>>2]|0)/4|0)<<2)|0}P=c[w>>2]|0}break}default:P=E}if(((P|0)!=0?(c[w>>2]=P+-1,(P|0)<=1):0)?(g=c[v>>2]|0,(g&2|0)!=0):0){c[v>>2]=g&-3;sg(v)|0;Q=c[D>>2]|0}else Q=L;g=c[Q+4>>2]|0;do if(g)if(!(c[g>>2]|0)){c[k>>2]=24190;Cj(24164,k)|0;break}else{N=c[p>>2]|0;x=N+68|0;G=c[x>>2]|0;a[(c[g+4>>2]|0)+(c[N+72>>2]<<2)+3>>0]=-1;C=g+8|0;M=(c[C>>2]|0)+1|0;c[C>>2]=(M|0)==0?1:M;R=G;S=x;T=N;H=74;break}else{N=c[p>>2]|0;x=N+68|0;R=c[x>>2]|0;S=x;T=N;H=74}while(0);if((H|0)==74?(g=R&-257,c[S>>2]=g,(g|0)!=(R|0)):0)hq(T);g=c[p>>2]|0;D=g+68|0;w=c[D>>2]|0;E=w&-113|16;c[D>>2]=E;if((E|0)!=(w|0))hq(g)}}while(0);c[o>>2]=0;c[o+4>>2]=0;c[o+8>>2]=c[v+8>>2];c[o+12>>2]=c[v+12>>2];Rl(f+36|0,o,v+36|0)|0;if(!(c[(c[I>>2]|0)+24>>2]|0)){if(A&258)H=81}else if(c[z>>2]|A&258)H=81;if((H|0)==81?(H=c[p>>2]|0,z=H+68|0,I=c[z>>2]|0,o=I&-113|16,c[z>>2]=o,(o|0)!=(I|0)):0)hq(H);if(!(A&4096|h&2)){B=v;i=j;return B|0}h=c[p>>2]|0;p=h+68|0;A=c[p>>2]|0;H=A|4096;c[p>>2]=H;if((H|0)==(A|0)){B=v;i=j;return B|0}hq(h);B=v;i=j;return B|0}function Dg(b,e,f,g,h){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0;if(e>>>0>36){c[(pd()|0)>>2]=22;i=0;j=0;G=i;return j|0}k=b+4|0;l=b+100|0;do{m=c[k>>2]|0;if(m>>>0<(c[l>>2]|0)>>>0){c[k>>2]=m+1;n=d[m>>0]|0}else n=Cm(b)|0}while((qz(n)|0)!=0);o=n;a:do switch(o|0){case 43:case 45:{n=((o|0)==45)<<31>>31;m=c[k>>2]|0;if(m>>>0<(c[l>>2]|0)>>>0){c[k>>2]=m+1;p=d[m>>0]|0;q=n;break a}else{p=Cm(b)|0;q=n;break a}break}default:{p=o;q=0}}while(0);o=(e|0)==0;do if((e&-17|0)==0&(p|0)==48){n=c[k>>2]|0;if(n>>>0<(c[l>>2]|0)>>>0){c[k>>2]=n+1;r=d[n>>0]|0}else r=Cm(b)|0;if((r|32|0)!=120)if(o){s=8;t=r;u=46;break}else{v=e;w=r;u=32;break}n=c[k>>2]|0;if(n>>>0<(c[l>>2]|0)>>>0){c[k>>2]=n+1;x=d[n>>0]|0}else x=Cm(b)|0;if((d[30971+(x+1)>>0]|0)>15){n=(c[l>>2]|0)==0;if(!n)c[k>>2]=(c[k>>2]|0)+-1;if(!f){Iq(b,0);i=0;j=0;G=i;return j|0}if(n){i=0;j=0;G=i;return j|0}c[k>>2]=(c[k>>2]|0)+-1;i=0;j=0;G=i;return j|0}else{s=16;t=x;u=46}}else{n=o?10:e;if((d[30971+(p+1)>>0]|0)>>>0<n>>>0){v=n;w=p;u=32}else{if(c[l>>2]|0)c[k>>2]=(c[k>>2]|0)+-1;Iq(b,0);c[(pd()|0)>>2]=22;i=0;j=0;G=i;return j|0}}while(0);if((u|0)==32)if((v|0)==10){p=w+-48|0;if(p>>>0<10){e=p;p=0;while(1){o=(p*10|0)+e|0;x=c[k>>2]|0;if(x>>>0<(c[l>>2]|0)>>>0){c[k>>2]=x+1;y=d[x>>0]|0}else y=Cm(b)|0;e=y+-48|0;if(!(e>>>0<10&o>>>0<429496729)){z=o;A=y;break}else p=o}B=z;C=0;D=A}else{B=0;C=0;D=w}A=D+-48|0;if(A>>>0<10){z=B;p=C;y=A;A=D;while(1){D=Kr(z|0,p|0,10,0)|0;e=G;o=((y|0)<0)<<31>>31;x=~o;if(e>>>0>x>>>0|(e|0)==(x|0)&D>>>0>~y>>>0){E=y;F=z;H=p;I=A;break}x=tt(D|0,e|0,y|0,o|0)|0;o=G;e=c[k>>2]|0;if(e>>>0<(c[l>>2]|0)>>>0){c[k>>2]=e+1;J=d[e>>0]|0}else J=Cm(b)|0;e=J+-48|0;if(e>>>0<10&(o>>>0<429496729|(o|0)==429496729&x>>>0<2576980378)){z=x;p=o;y=e;A=J}else{E=e;F=x;H=o;I=J;break}}if(E>>>0>9){K=H;L=F}else{M=10;N=F;O=H;P=I;u=72}}else{K=C;L=B}}else{s=v;t=w;u=46}b:do if((u|0)==46){if(!(s+-1&s)){w=a[31228+((s*23|0)>>>5&7)>>0]|0;v=a[30971+(t+1)>>0]|0;B=v&255;if(B>>>0<s>>>0){C=B;B=0;while(1){I=C|B<<w;H=c[k>>2]|0;if(H>>>0<(c[l>>2]|0)>>>0){c[k>>2]=H+1;Q=d[H>>0]|0}else Q=Cm(b)|0;H=a[30971+(Q+1)>>0]|0;C=H&255;if(!(I>>>0<134217728&C>>>0<s>>>0)){R=I;S=H;T=Q;break}else B=I}U=S;V=0;W=R;X=T}else{U=v;V=0;W=0;X=t}B=Gs(-1,-1,w|0)|0;C=G;if((U&255)>>>0>=s>>>0|(V>>>0>C>>>0|(V|0)==(C|0)&W>>>0>B>>>0)){M=s;N=W;O=V;P=X;u=72;break}else{Y=W;Z=V;_=U}while(1){I=Es(Y|0,Z|0,w|0)|0;H=G;F=_&255|I;I=c[k>>2]|0;if(I>>>0<(c[l>>2]|0)>>>0){c[k>>2]=I+1;$=d[I>>0]|0}else $=Cm(b)|0;_=a[30971+($+1)>>0]|0;if((_&255)>>>0>=s>>>0|(H>>>0>C>>>0|(H|0)==(C|0)&F>>>0>B>>>0)){M=s;N=F;O=H;P=$;u=72;break b}else{Y=F;Z=H}}}B=a[30971+(t+1)>>0]|0;C=B&255;if(C>>>0<s>>>0){w=C;C=0;while(1){v=w+(ca(C,s)|0)|0;H=c[k>>2]|0;if(H>>>0<(c[l>>2]|0)>>>0){c[k>>2]=H+1;aa=d[H>>0]|0}else aa=Cm(b)|0;H=a[30971+(aa+1)>>0]|0;w=H&255;if(!(v>>>0<119304647&w>>>0<s>>>0)){ba=v;da=H;ea=aa;break}else C=v}fa=da;ga=ba;ha=0;ia=ea}else{fa=B;ga=0;ha=0;ia=t}if((fa&255)>>>0<s>>>0){C=Bw(-1,-1,s|0,0)|0;w=G;v=ha;H=ga;F=fa;I=ia;while(1){if(v>>>0>w>>>0|(v|0)==(w|0)&H>>>0>C>>>0){M=s;N=H;O=v;P=I;u=72;break b}E=Kr(H|0,v|0,s|0,0)|0;J=G;A=F&255;if(J>>>0>4294967295|(J|0)==-1&E>>>0>~A>>>0){M=s;N=H;O=v;P=I;u=72;break b}y=tt(A|0,0,E|0,J|0)|0;J=G;E=c[k>>2]|0;if(E>>>0<(c[l>>2]|0)>>>0){c[k>>2]=E+1;ja=d[E>>0]|0}else ja=Cm(b)|0;F=a[30971+(ja+1)>>0]|0;if((F&255)>>>0>=s>>>0){M=s;N=y;O=J;P=ja;u=72;break}else{v=J;H=y;I=ja}}}else{M=s;N=ga;O=ha;P=ia;u=72}}while(0);if((u|0)==72)if((d[30971+(P+1)>>0]|0)>>>0<M>>>0){do{P=c[k>>2]|0;if(P>>>0<(c[l>>2]|0)>>>0){c[k>>2]=P+1;ka=d[P>>0]|0}else ka=Cm(b)|0}while((d[30971+(ka+1)>>0]|0)>>>0<M>>>0);c[(pd()|0)>>2]=34;K=h;L=g}else{K=O;L=N}if(c[l>>2]|0)c[k>>2]=(c[k>>2]|0)+-1;if(!(K>>>0<h>>>0|(K|0)==(h|0)&L>>>0<g>>>0)){if(!((g&1|0)!=0|0!=0|(q|0)!=0)){c[(pd()|0)>>2]=34;k=tt(g|0,h|0,-1,-1)|0;i=G;j=k;G=i;return j|0}if(K>>>0>h>>>0|(K|0)==(h|0)&L>>>0>g>>>0){c[(pd()|0)>>2]=34;i=h;j=g;G=i;return j|0}}g=((q|0)<0)<<31>>31;h=Fs(L^q|0,K^g|0,q|0,g|0)|0;i=G;j=h;G=i;return j|0}function Kg(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0;e=c[b+24>>2]|0;f=c[b+28>>2]|0;g=c[b>>2]|0;h=c[b+16>>2]|0;i=c[b+20>>2]|0;j=c[b+36>>2]|0;k=c[b+48>>2]|0;l=c[b+56>>2]|0;b=(f|0)==0;if(!k){if(b)return;m=(e+7|0)/8|0;n=e&7;o=f;p=i;q=g;a:while(1){r=o+-1|0;switch(n|0){case 0:{s=p;t=m;u=q;v=33;break}case 7:{w=p;x=m;y=q;v=36;break}case 6:{z=p;A=m;B=q;v=39;break}case 5:{C=p;D=m;E=q;v=42;break}case 4:{F=p;G=m;H=q;v=45;break}case 3:{I=p;J=m;K=q;v=48;break}case 2:{L=p;M=m;N=q;v=51;break}case 1:{O=p;P=m;Q=q;v=54;break}default:{R=p;S=q;v=57}}while(1)if((v|0)==33){v=0;T=a[u>>0]|0;if((T&255|0)!=(l|0))a[s>>0]=T;w=s+1|0;x=t;y=u+1|0;v=36;continue}else if((v|0)==36){v=0;T=a[y>>0]|0;if((T&255|0)!=(l|0))a[w>>0]=T;z=w+1|0;A=x;B=y+1|0;v=39;continue}else if((v|0)==39){v=0;T=a[B>>0]|0;if((T&255|0)!=(l|0))a[z>>0]=T;C=z+1|0;D=A;E=B+1|0;v=42;continue}else if((v|0)==42){v=0;T=a[E>>0]|0;if((T&255|0)!=(l|0))a[C>>0]=T;F=C+1|0;G=D;H=E+1|0;v=45;continue}else if((v|0)==45){v=0;T=a[H>>0]|0;if((T&255|0)!=(l|0))a[F>>0]=T;I=F+1|0;J=G;K=H+1|0;v=48;continue}else if((v|0)==48){v=0;T=a[K>>0]|0;if((T&255|0)!=(l|0))a[I>>0]=T;L=I+1|0;M=J;N=K+1|0;v=51;continue}else if((v|0)==51){v=0;T=a[N>>0]|0;if((T&255|0)!=(l|0))a[L>>0]=T;O=L+1|0;P=M;Q=N+1|0;v=54;continue}else if((v|0)==54){v=0;T=a[Q>>0]|0;if((T&255|0)!=(l|0))a[O>>0]=T;T=O+1|0;U=Q+1|0;if((P|0)>1){s=T;t=P+-1|0;u=U;v=33;continue}else{R=T;S=U;v=57;continue}}else if((v|0)==57){v=0;if(!r)break a;else{o=r;p=R+j|0;q=S+h|0;continue a}}}return}else{if(b)return;b=(e+7|0)/8|0;S=e&7;e=f;f=i;i=g;b:while(1){g=e+-1|0;switch(S|0){case 0:{V=f;W=b;X=i;v=7;break}case 7:{Y=f;Z=b;_=i;v=10;break}case 6:{$=f;aa=b;ba=i;v=13;break}case 5:{ca=f;da=b;ea=i;v=16;break}case 4:{fa=f;ga=b;ha=i;v=19;break}case 3:{ia=f;ja=b;ka=i;v=22;break}case 2:{la=f;ma=b;na=i;v=25;break}case 1:{oa=f;pa=b;qa=i;v=28;break}default:{ra=f;sa=i;v=31}}while(1)if((v|0)==7){v=0;q=d[X>>0]|0;if((q|0)!=(l|0))a[V>>0]=a[k+q>>0]|0;Y=V+1|0;Z=W;_=X+1|0;v=10;continue}else if((v|0)==10){v=0;q=d[_>>0]|0;if((q|0)!=(l|0))a[Y>>0]=a[k+q>>0]|0;$=Y+1|0;aa=Z;ba=_+1|0;v=13;continue}else if((v|0)==13){v=0;q=d[ba>>0]|0;if((q|0)!=(l|0))a[$>>0]=a[k+q>>0]|0;ca=$+1|0;da=aa;ea=ba+1|0;v=16;continue}else if((v|0)==16){v=0;q=d[ea>>0]|0;if((q|0)!=(l|0))a[ca>>0]=a[k+q>>0]|0;fa=ca+1|0;ga=da;ha=ea+1|0;v=19;continue}else if((v|0)==19){v=0;q=d[ha>>0]|0;if((q|0)!=(l|0))a[fa>>0]=a[k+q>>0]|0;ia=fa+1|0;ja=ga;ka=ha+1|0;v=22;continue}else if((v|0)==22){v=0;q=d[ka>>0]|0;if((q|0)!=(l|0))a[ia>>0]=a[k+q>>0]|0;la=ia+1|0;ma=ja;na=ka+1|0;v=25;continue}else if((v|0)==25){v=0;q=d[na>>0]|0;if((q|0)!=(l|0))a[la>>0]=a[k+q>>0]|0;oa=la+1|0;pa=ma;qa=na+1|0;v=28;continue}else if((v|0)==28){v=0;q=d[qa>>0]|0;if((q|0)!=(l|0))a[oa>>0]=a[k+q>>0]|0;q=oa+1|0;R=qa+1|0;if((pa|0)>1){V=q;W=pa+-1|0;X=R;v=7;continue}else{ra=q;sa=R;v=31;continue}}else if((v|0)==31){v=0;if(!g)break b;else{e=g;f=ra+j|0;i=sa+h|0;continue b}}}return}}function Mg(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0;d=c[b+24>>2]|0;e=c[b+28>>2]|0;f=c[b>>2]|0;g=(c[b+16>>2]|0)/4|0;h=c[b+20>>2]|0;i=c[b+36>>2]|0;j=c[b+48>>2]|0;b=(e|0)==0;if(!j){if(b)return;k=(d+7|0)/8|0;l=d&7;m=e;n=h;o=f;a:while(1){p=m+-1|0;switch(l|0){case 0:{q=n;r=k;s=7;break}case 7:{t=n;u=k;s=8;break}case 6:{v=n;w=k;s=9;break}case 5:{x=n;y=k;s=10;break}case 4:{z=n;A=k;s=11;break}case 3:{B=n;C=k;s=12;break}case 2:{D=n;E=k;s=13;break}case 1:{F=n;G=k;s=14;break}default:{H=n;s=15}}while(1)if((s|0)==7){s=0;I=c[o>>2]|0;a[q>>0]=I>>>22&224|I>>>15&28|I>>>8&3;t=q+1|0;u=r;s=8;continue}else if((s|0)==8){s=0;I=c[o>>2]|0;a[t>>0]=I>>>22&224|I>>>15&28|I>>>8&3;v=t+1|0;w=u;s=9;continue}else if((s|0)==9){s=0;I=c[o>>2]|0;a[v>>0]=I>>>22&224|I>>>15&28|I>>>8&3;x=v+1|0;y=w;s=10;continue}else if((s|0)==10){s=0;I=c[o>>2]|0;a[x>>0]=I>>>22&224|I>>>15&28|I>>>8&3;z=x+1|0;A=y;s=11;continue}else if((s|0)==11){s=0;I=c[o>>2]|0;a[z>>0]=I>>>22&224|I>>>15&28|I>>>8&3;B=z+1|0;C=A;s=12;continue}else if((s|0)==12){s=0;I=c[o>>2]|0;a[B>>0]=I>>>22&224|I>>>15&28|I>>>8&3;D=B+1|0;E=C;s=13;continue}else if((s|0)==13){s=0;I=c[o>>2]|0;a[D>>0]=I>>>22&224|I>>>15&28|I>>>8&3;F=D+1|0;G=E;s=14;continue}else if((s|0)==14){s=0;I=c[o>>2]|0;J=F+1|0;a[F>>0]=I>>>22&224|I>>>15&28|I>>>8&3;if((G|0)>1){q=J;r=G+-1|0;s=7;continue}else{H=J;s=15;continue}}else if((s|0)==15){s=0;if(!p)break a;else{m=p;n=H+i|0;o=o+(g<<2)|0;continue a}}}return}else{if(b)return;b=(d+7|0)/8|0;o=d&7;d=e;e=h;h=f;b:while(1){f=d+-1|0;switch(o|0){case 0:{K=e;L=b;M=h;s=17;break}case 7:{N=e;O=b;P=h;s=18;break}case 6:{Q=e;R=b;S=h;s=19;break}case 5:{T=e;U=b;V=h;s=20;break}case 4:{W=e;X=b;Y=h;s=21;break}case 3:{Z=e;_=b;$=h;s=22;break}case 2:{aa=e;ba=b;ca=h;s=23;break}case 1:{da=e;ea=b;fa=h;s=24;break}default:{ga=e;ha=h;s=25}}while(1)if((s|0)==17){s=0;H=c[M>>2]|0;a[K>>0]=a[j+(H>>>22&224|H>>>15&28|H>>>8&3)>>0]|0;N=K+1|0;O=L;P=M+4|0;s=18;continue}else if((s|0)==18){s=0;H=c[P>>2]|0;a[N>>0]=a[j+(H>>>22&224|H>>>15&28|H>>>8&3)>>0]|0;Q=N+1|0;R=O;S=P+4|0;s=19;continue}else if((s|0)==19){s=0;H=c[S>>2]|0;a[Q>>0]=a[j+(H>>>22&224|H>>>15&28|H>>>8&3)>>0]|0;T=Q+1|0;U=R;V=S+4|0;s=20;continue}else if((s|0)==20){s=0;H=c[V>>2]|0;a[T>>0]=a[j+(H>>>22&224|H>>>15&28|H>>>8&3)>>0]|0;W=T+1|0;X=U;Y=V+4|0;s=21;continue}else if((s|0)==21){s=0;H=c[Y>>2]|0;a[W>>0]=a[j+(H>>>22&224|H>>>15&28|H>>>8&3)>>0]|0;Z=W+1|0;_=X;$=Y+4|0;s=22;continue}else if((s|0)==22){s=0;H=c[$>>2]|0;a[Z>>0]=a[j+(H>>>22&224|H>>>15&28|H>>>8&3)>>0]|0;aa=Z+1|0;ba=_;ca=$+4|0;s=23;continue}else if((s|0)==23){s=0;H=c[ca>>2]|0;a[aa>>0]=a[j+(H>>>22&224|H>>>15&28|H>>>8&3)>>0]|0;da=aa+1|0;ea=ba;fa=ca+4|0;s=24;continue}else if((s|0)==24){s=0;H=c[fa>>2]|0;n=da+1|0;a[da>>0]=a[j+(H>>>22&224|H>>>15&28|H>>>8&3)>>0]|0;H=fa+4|0;if((ea|0)>1){K=n;L=ea+-1|0;M=H;s=17;continue}else{ga=n;ha=H;s=25;continue}}else if((s|0)==25){s=0;if(!f)break b;else{d=f;e=ga+i|0;h=ha+(g<<2)|0;continue b}}}return}}function Ig(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0;k=i;i=i+32|0;l=k+16|0;m=k+12|0;n=k+8|0;o=k+4|0;p=k;q=Hs(e)|0;c[n>>2]=q;r=Ds(n,18268)|0;lr(q)|0;c[f>>2]=0;q=c[b>>2]|0;a:do if((h|0)!=(j|0)){n=h;s=q;b:while(1){t=s;if(s){u=c[s+12>>2]|0;if((u|0)==(c[s+16>>2]|0))v=Af[c[(c[s>>2]|0)+36>>2]&127](s)|0;else v=c[u>>2]|0;if((v|0)==-1){c[b>>2]=0;w=0;x=1;y=0}else{w=s;x=0;y=t}}else{w=0;x=1;y=t}t=c[d>>2]|0;u=t;do if(t){z=c[t+12>>2]|0;if((z|0)==(c[t+16>>2]|0))A=Af[c[(c[t>>2]|0)+36>>2]&127](t)|0;else A=c[z>>2]|0;if((A|0)!=-1)if(x){B=t;C=u;break}else{D=w;E=16;break b}else{c[d>>2]=0;F=0;E=14;break}}else{F=u;E=14}while(0);if((E|0)==14){E=0;if(x){D=w;E=16;break}else{B=0;C=F}}c:do if((Ef[c[(c[r>>2]|0)+52>>2]&31](r,c[n>>2]|0,0)|0)<<24>>24==37){u=n+4|0;if((u|0)==(j|0)){G=w;E=19;break b}t=Ef[c[(c[r>>2]|0)+52>>2]&31](r,c[u>>2]|0,0)|0;switch(t<<24>>24){case 48:case 69:{z=n+8|0;if((z|0)==(j|0)){H=w;E=22;break b}I=u;J=Ef[c[(c[r>>2]|0)+52>>2]&31](r,c[z>>2]|0,0)|0;K=t;break}default:{I=n;J=t;K=0}}t=c[(c[a>>2]|0)+36>>2]|0;c[o>>2]=y;c[p>>2]=C;c[m>>2]=c[o>>2];c[l>>2]=c[p>>2];c[b>>2]=Kf[t&15](a,m,l,e,f,g,J,K)|0;L=I+8|0}else{if(Ef[c[(c[r>>2]|0)+12>>2]&31](r,8192,c[n>>2]|0)|0)M=n;else{t=w+12|0;z=c[t>>2]|0;u=w+16|0;if((z|0)==(c[u>>2]|0))N=Af[c[(c[w>>2]|0)+36>>2]&127](w)|0;else N=c[z>>2]|0;z=Nf[c[(c[r>>2]|0)+28>>2]&31](r,N)|0;if((z|0)!=(Nf[c[(c[r>>2]|0)+28>>2]&31](r,c[n>>2]|0)|0)){E=59;break b}z=c[t>>2]|0;if((z|0)==(c[u>>2]|0))Af[c[(c[w>>2]|0)+40>>2]&127](w)|0;else c[t>>2]=z+4;L=n+4|0;break}while(1){z=M+4|0;if((z|0)==(j|0)){O=j;break}if(Ef[c[(c[r>>2]|0)+12>>2]&31](r,8192,c[z>>2]|0)|0)M=z;else{O=z;break}}z=w;t=B;u=B;while(1){if(z){P=c[z+12>>2]|0;if((P|0)==(c[z+16>>2]|0))Q=Af[c[(c[z>>2]|0)+36>>2]&127](z)|0;else Q=c[P>>2]|0;if((Q|0)==-1){c[b>>2]=0;R=1;S=0}else{R=0;S=z}}else{R=1;S=0}do if(u){P=c[u+12>>2]|0;if((P|0)==(c[u+16>>2]|0))T=Af[c[(c[u>>2]|0)+36>>2]&127](u)|0;else T=c[P>>2]|0;if((T|0)!=-1)if(R^(t|0)==0){U=t;V=t;break}else{L=O;break c}else{c[d>>2]=0;W=0;E=42;break}}else{W=t;E=42}while(0);if((E|0)==42){E=0;if(R){L=O;break c}else{U=W;V=0}}P=S+12|0;X=c[P>>2]|0;Y=S+16|0;if((X|0)==(c[Y>>2]|0))Z=Af[c[(c[S>>2]|0)+36>>2]&127](S)|0;else Z=c[X>>2]|0;if(!(Ef[c[(c[r>>2]|0)+12>>2]&31](r,8192,Z)|0)){L=O;break c}X=c[P>>2]|0;if((X|0)==(c[Y>>2]|0)){Af[c[(c[S>>2]|0)+40>>2]&127](S)|0;z=S;t=U;u=V;continue}else{c[P>>2]=X+4;z=S;t=U;u=V;continue}}}while(0);u=c[b>>2]|0;if((L|0)!=(j|0)&(c[f>>2]|0)==0){n=L;s=u}else{_=u;break a}}if((E|0)==16){c[f>>2]=4;_=D;break}else if((E|0)==19){c[f>>2]=4;_=G;break}else if((E|0)==22){c[f>>2]=4;_=H;break}else if((E|0)==59){c[f>>2]=4;_=c[b>>2]|0;break}}else _=q;while(0);if(_){q=c[_+12>>2]|0;if((q|0)==(c[_+16>>2]|0))$=Af[c[(c[_>>2]|0)+36>>2]&127](_)|0;else $=c[q>>2]|0;if(($|0)==-1){c[b>>2]=0;aa=0;ba=1}else{aa=_;ba=0}}else{aa=0;ba=1}_=c[d>>2]|0;do if(_){b=c[_+12>>2]|0;if((b|0)==(c[_+16>>2]|0))ca=Af[c[(c[_>>2]|0)+36>>2]&127](_)|0;else ca=c[b>>2]|0;if((ca|0)!=-1)if(ba)break;else{E=74;break}else{c[d>>2]=0;E=72;break}}else E=72;while(0);if((E|0)==72?ba:0)E=74;if((E|0)==74)c[f>>2]=c[f>>2]|2;i=k;return aa|0}function Jg(e,f,g,h,j,k,l,m){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0;n=i;i=i+32|0;o=n+16|0;p=n+12|0;q=n+8|0;r=n+4|0;s=n;t=Hs(h)|0;c[q>>2]=t;u=Ds(q,18276)|0;lr(t)|0;c[j>>2]=0;t=u+8|0;q=c[f>>2]|0;a:do if((l|0)!=(m|0)){v=l;w=q;b:while(1){x=w;if(w)if((c[w+12>>2]|0)==(c[w+16>>2]|0)?(Af[c[(c[w>>2]|0)+36>>2]&127](w)|0)==-1:0){c[f>>2]=0;y=0;z=0}else{y=w;z=x}else{y=0;z=x}x=(y|0)==0;A=c[g>>2]|0;B=A;do if(A){if((c[A+12>>2]|0)==(c[A+16>>2]|0)?(Af[c[(c[A>>2]|0)+36>>2]&127](A)|0)==-1:0){c[g>>2]=0;C=0;D=11;break}if(x){E=A;F=B}else{G=y;D=12;break b}}else{C=B;D=11}while(0);if((D|0)==11){D=0;if(x){G=y;D=12;break}else{E=0;F=C}}c:do if((Ef[c[(c[u>>2]|0)+36>>2]&31](u,a[v>>0]|0,0)|0)<<24>>24==37){B=v+1|0;if((B|0)==(m|0)){H=y;D=15;break b}A=Ef[c[(c[u>>2]|0)+36>>2]&31](u,a[B>>0]|0,0)|0;switch(A<<24>>24){case 48:case 69:{I=v+2|0;if((I|0)==(m|0)){J=y;D=18;break b}K=B;L=Ef[c[(c[u>>2]|0)+36>>2]&31](u,a[I>>0]|0,0)|0;M=A;break}default:{K=v;L=A;M=0}}A=c[(c[e>>2]|0)+36>>2]|0;c[r>>2]=z;c[s>>2]=F;c[p>>2]=c[r>>2];c[o>>2]=c[s>>2];c[f>>2]=Kf[A&15](e,p,o,h,j,k,L,M)|0;N=K+2|0}else{A=a[v>>0]|0;if(A<<24>>24>-1?(I=c[t>>2]|0,(b[I+(A<<24>>24<<1)>>1]&8192)!=0):0){A=v;while(1){B=A+1|0;if((B|0)==(m|0)){O=m;break}P=a[B>>0]|0;if(P<<24>>24<=-1){O=B;break}if(!(b[I+(P<<24>>24<<1)>>1]&8192)){O=B;break}else A=B}A=y;I=E;B=E;while(1){if(A)if((c[A+12>>2]|0)==(c[A+16>>2]|0)?(Af[c[(c[A>>2]|0)+36>>2]&127](A)|0)==-1:0){c[f>>2]=0;Q=0}else Q=A;else Q=0;P=(Q|0)==0;do if(B){if((c[B+12>>2]|0)!=(c[B+16>>2]|0))if(P){R=I;S=B;break}else{N=O;break c}if((Af[c[(c[B>>2]|0)+36>>2]&127](B)|0)!=-1)if(P^(I|0)==0){R=I;S=I;break}else{N=O;break c}else{c[g>>2]=0;T=0;D=37;break}}else{T=I;D=37}while(0);if((D|0)==37){D=0;if(P){N=O;break c}else{R=T;S=0}}U=Q+12|0;V=c[U>>2]|0;W=Q+16|0;if((V|0)==(c[W>>2]|0))X=Af[c[(c[Q>>2]|0)+36>>2]&127](Q)|0;else X=d[V>>0]|0;if((X&255)<<24>>24<=-1){N=O;break c}if(!(b[(c[t>>2]|0)+(X<<24>>24<<1)>>1]&8192)){N=O;break c}V=c[U>>2]|0;if((V|0)==(c[W>>2]|0)){Af[c[(c[Q>>2]|0)+40>>2]&127](Q)|0;A=Q;I=R;B=S;continue}else{c[U>>2]=V+1;A=Q;I=R;B=S;continue}}}B=y+12|0;I=c[B>>2]|0;A=y+16|0;if((I|0)==(c[A>>2]|0))Y=Af[c[(c[y>>2]|0)+36>>2]&127](y)|0;else Y=d[I>>0]|0;I=Nf[c[(c[u>>2]|0)+12>>2]&31](u,Y&255)|0;if(I<<24>>24!=(Nf[c[(c[u>>2]|0)+12>>2]&31](u,a[v>>0]|0)|0)<<24>>24){D=55;break b}I=c[B>>2]|0;if((I|0)==(c[A>>2]|0))Af[c[(c[y>>2]|0)+40>>2]&127](y)|0;else c[B>>2]=I+1;N=v+1|0}while(0);x=c[f>>2]|0;if((N|0)!=(m|0)&(c[j>>2]|0)==0){v=N;w=x}else{Z=x;break a}}if((D|0)==12){c[j>>2]=4;Z=G;break}else if((D|0)==15){c[j>>2]=4;Z=H;break}else if((D|0)==18){c[j>>2]=4;Z=J;break}else if((D|0)==55){c[j>>2]=4;Z=c[f>>2]|0;break}}else Z=q;while(0);if(Z)if((c[Z+12>>2]|0)==(c[Z+16>>2]|0)?(Af[c[(c[Z>>2]|0)+36>>2]&127](Z)|0)==-1:0){c[f>>2]=0;_=0}else _=Z;else _=0;Z=(_|0)==0;f=c[g>>2]|0;do if(f){if((c[f+12>>2]|0)==(c[f+16>>2]|0)?(Af[c[(c[f>>2]|0)+36>>2]&127](f)|0)==-1:0){c[g>>2]=0;D=65;break}if(!Z)D=66}else D=65;while(0);if((D|0)==65?Z:0)D=66;if((D|0)==66)c[j>>2]=c[j>>2]|2;i=n;return _|0}function Rg(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0;b=c[a+24>>2]|0;e=c[a+28>>2]|0;f=c[a>>2]|0;g=c[a+16>>2]|0;h=c[a+20>>2]|0;i=c[a+36>>2]|0;j=c[a+40>>2]|0;k=c[a+44>>2]|0;if(!(c[k+24>>2]|0)){l=c[j+16>>2]|c[j+12>>2]|c[j+20>>2];if(!e)return;j=(b+7|0)/8|0;m=b&7;n=e;o=h;p=f;a:while(1){q=n+-1|0;switch(m|0){case 0:{r=o;s=j;t=p;u=17;break}case 7:{v=o;w=j;x=p;u=18;break}case 6:{y=o;z=j;A=p;u=19;break}case 5:{B=o;C=j;D=p;u=20;break}case 4:{E=o;F=j;G=p;u=21;break}case 3:{H=o;I=j;J=p;u=22;break}case 2:{K=o;L=j;M=p;u=23;break}case 1:{N=o;O=j;P=p;u=24;break}default:{Q=o;R=p;u=25}}while(1)if((u|0)==17){u=0;c[r>>2]=c[t>>2]&l;v=r+4|0;w=s;x=t+4|0;u=18;continue}else if((u|0)==18){u=0;c[v>>2]=c[x>>2]&l;y=v+4|0;z=w;A=x+4|0;u=19;continue}else if((u|0)==19){u=0;c[y>>2]=c[A>>2]&l;B=y+4|0;C=z;D=A+4|0;u=20;continue}else if((u|0)==20){u=0;c[B>>2]=c[D>>2]&l;E=B+4|0;F=C;G=D+4|0;u=21;continue}else if((u|0)==21){u=0;c[E>>2]=c[G>>2]&l;H=E+4|0;I=F;J=G+4|0;u=22;continue}else if((u|0)==22){u=0;c[H>>2]=c[J>>2]&l;K=H+4|0;L=I;M=J+4|0;u=23;continue}else if((u|0)==23){u=0;c[K>>2]=c[M>>2]&l;N=K+4|0;O=L;P=M+4|0;u=24;continue}else if((u|0)==24){u=0;c[N>>2]=c[P>>2]&l;S=N+4|0;T=P+4|0;if((O|0)>1){r=S;s=O+-1|0;t=T;u=17;continue}else{Q=S;R=T;u=25;continue}}else if((u|0)==25){u=0;if(!q)break a;else{n=q;o=Q+i|0;p=R+g|0;continue a}}}return}else{R=(d[a+63>>0]|0)>>>(d[k+31>>0]|0)<<(d[k+35>>0]|0);if(!e)return;k=(b+7|0)/8|0;a=b&7;b=e;e=h;h=f;b:while(1){f=b+-1|0;switch(a|0){case 0:{U=e;V=k;W=h;u=5;break}case 7:{X=e;Y=k;Z=h;u=6;break}case 6:{_=e;$=k;aa=h;u=7;break}case 5:{ba=e;ca=k;da=h;u=8;break}case 4:{ea=e;fa=k;ga=h;u=9;break}case 3:{ha=e;ia=k;ja=h;u=10;break}case 2:{ka=e;la=k;ma=h;u=11;break}case 1:{na=e;oa=k;pa=h;u=12;break}default:{qa=e;ra=h;u=13}}while(1)if((u|0)==5){u=0;c[U>>2]=c[W>>2]|R;X=U+4|0;Y=V;Z=W+4|0;u=6;continue}else if((u|0)==6){u=0;c[X>>2]=c[Z>>2]|R;_=X+4|0;$=Y;aa=Z+4|0;u=7;continue}else if((u|0)==7){u=0;c[_>>2]=c[aa>>2]|R;ba=_+4|0;ca=$;da=aa+4|0;u=8;continue}else if((u|0)==8){u=0;c[ba>>2]=c[da>>2]|R;ea=ba+4|0;fa=ca;ga=da+4|0;u=9;continue}else if((u|0)==9){u=0;c[ea>>2]=c[ga>>2]|R;ha=ea+4|0;ia=fa;ja=ga+4|0;u=10;continue}else if((u|0)==10){u=0;c[ha>>2]=c[ja>>2]|R;ka=ha+4|0;la=ia;ma=ja+4|0;u=11;continue}else if((u|0)==11){u=0;c[ka>>2]=c[ma>>2]|R;na=ka+4|0;oa=la;pa=ma+4|0;u=12;continue}else if((u|0)==12){u=0;c[na>>2]=c[pa>>2]|R;p=na+4|0;Q=pa+4|0;if((oa|0)>1){U=p;V=oa+-1|0;W=Q;u=5;continue}else{qa=p;ra=Q;u=13;continue}}else if((u|0)==13){u=0;if(!f)break b;else{b=f;e=qa+i|0;h=ra+g|0;continue b}}}return}}function Ng(d,e,f,g,h,i,j,k,l,m,n,o,p,q,r){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=q|0;r=r|0;var s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0;c[f>>2]=d;s=q+4|0;t=q+8|0;u=q+1|0;v=p+4|0;w=(g&512|0)==0;x=p+8|0;y=p+1|0;z=j+8|0;A=(r|0)>0;B=o+4|0;C=o+8|0;D=o+1|0;E=r+1|0;F=-2-r-((r|0)<0?~r:-1)|0;G=(r|0)>0;H=h;h=0;while(1){switch(a[l+h>>0]|0){case 0:{c[e>>2]=c[f>>2];I=H;break}case 1:{c[e>>2]=c[f>>2];J=Nf[c[(c[j>>2]|0)+28>>2]&31](j,32)|0;K=c[f>>2]|0;c[f>>2]=K+1;a[K>>0]=J;I=H;break}case 3:{J=a[q>>0]|0;K=(J&1)==0;if(!((K?(J&255)>>>1:c[s>>2]|0)|0))I=H;else{J=a[(K?u:c[t>>2]|0)>>0]|0;K=c[f>>2]|0;c[f>>2]=K+1;a[K>>0]=J;I=H}break}case 2:{J=a[p>>0]|0;K=(J&1)==0;L=K?(J&255)>>>1:c[v>>2]|0;if(w|(L|0)==0)I=H;else{J=K?y:c[x>>2]|0;K=J+L|0;M=c[f>>2]|0;if(!L)N=M;else{L=M;M=J;while(1){a[L>>0]=a[M>>0]|0;M=M+1|0;J=L+1|0;if((M|0)==(K|0)){N=J;break}else L=J}}c[f>>2]=N;I=H}break}case 4:{L=c[f>>2]|0;K=k?H+1|0:H;M=K;J=c[z>>2]|0;a:do if(K>>>0<i>>>0){O=K;while(1){P=a[O>>0]|0;if(P<<24>>24<=-1){Q=O;break a}if(!(b[J+(P<<24>>24<<1)>>1]&2048)){Q=O;break a}P=O+1|0;if(P>>>0<i>>>0)O=P;else{Q=P;break}}}else Q=K;while(0);J=Q;if(A){O=-2-J-~(J>>>0>M>>>0?M:J)|0;J=F>>>0>O>>>0?F:O;if(Q>>>0>K>>>0&G){O=Q;P=r;while(1){O=O+-1|0;R=a[O>>0]|0;S=c[f>>2]|0;c[f>>2]=S+1;a[S>>0]=R;R=(P|0)>1;if(!(O>>>0>K>>>0&R)){T=R;break}else P=P+-1|0}}else T=G;P=E+J|0;O=Q+(J+1)|0;if(T)U=Nf[c[(c[j>>2]|0)+28>>2]&31](j,48)|0;else U=0;M=c[f>>2]|0;c[f>>2]=M+1;if((P|0)>0){R=M;S=P;while(1){a[R>>0]=U;P=c[f>>2]|0;c[f>>2]=P+1;if((S|0)>1){R=P;S=S+-1|0}else{V=P;break}}}else V=M;a[V>>0]=m;W=O}else W=Q;if((W|0)!=(K|0)){S=a[o>>0]|0;R=(S&1)==0;if(!((R?(S&255)>>>1:c[B>>2]|0)|0))X=-1;else X=a[(R?D:c[C>>2]|0)>>0]|0;if((W|0)!=(K|0)){R=W;S=X;J=0;P=0;while(1){if((P|0)==(S|0)){Y=c[f>>2]|0;c[f>>2]=Y+1;a[Y>>0]=n;Y=J+1|0;Z=a[o>>0]|0;_=(Z&1)==0;if(Y>>>0<(_?(Z&255)>>>1:c[B>>2]|0)>>>0){Z=a[(_?D:c[C>>2]|0)+Y>>0]|0;$=Z<<24>>24==127?-1:Z<<24>>24;aa=Y;ba=0}else{$=P;aa=Y;ba=0}}else{$=S;aa=J;ba=P}R=R+-1|0;Y=a[R>>0]|0;Z=c[f>>2]|0;c[f>>2]=Z+1;a[Z>>0]=Y;if((R|0)==(K|0))break;else{S=$;J=aa;P=ba+1|0}}}}else{P=Nf[c[(c[j>>2]|0)+28>>2]&31](j,48)|0;J=c[f>>2]|0;c[f>>2]=J+1;a[J>>0]=P}P=c[f>>2]|0;if((L|0)!=(P|0)?(J=P+-1|0,L>>>0<J>>>0):0){P=L;S=J;do{J=a[P>>0]|0;a[P>>0]=a[S>>0]|0;a[S>>0]=J;P=P+1|0;S=S+-1|0}while(P>>>0<S>>>0);I=K}else I=K;break}default:I=H}h=h+1|0;if((h|0)==4)break;else H=I}I=a[q>>0]|0;q=(I&1)==0;H=q?(I&255)>>>1:c[s>>2]|0;if(H>>>0>1){s=q?u:c[t>>2]|0;t=s+H|0;u=c[f>>2]|0;if((H|0)==1)ca=u;else{H=u;u=s+1|0;while(1){a[H>>0]=a[u>>0]|0;s=H+1|0;u=u+1|0;if((u|0)==(t|0)){ca=s;break}else H=s}}c[f>>2]=ca}switch(g&176|0){case 32:{c[e>>2]=c[f>>2];break}case 16:break;default:c[e>>2]=d}return}function Og(b,e,f,g,h,j){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;k=i;i=i+64|0;l=k;m=k+16|0;n=k+20|0;o=iB(319296)|0;c[j>>2]=0;if(!o){p=0;i=k;return p|0}q=l;c[q>>2]=0;c[q+4>>2]=0;q=l+12|0;c[q>>2]=1;r=ca(h+1|0,f)|0;s=(r|0)<64?121:r+57|0;r=l+4|0;c[r>>2]=s;t=iB(s)|0;u=l+8|0;c[u>>2]=t;if(!t){qB(o);p=0;i=k;return p|0}c[m>>2]=41;t=0;v=s;s=41;w=41;while(1){x=t+1|0;if(x>>>0>v>>>0)if(c[q>>2]|0){y=v;while(1){z=y<<1;A=z>>>0<128?128:z;if(x>>>0>A>>>0)y=A;else{B=A;break}}y=eA(c[u>>2]|0,B)|0;if(y){c[u>>2]=y;c[r>>2]=B;C=y;D=11}else{E=t;F=s}}else{E=t;F=s}else{C=c[u>>2]|0;D=11}if((D|0)==11){D=0;a[C+t>>0]=w;c[l>>2]=x;E=x;F=c[m>>2]|0}y=F+-1|0;c[m>>2]=y;if(!y)break;t=E;v=c[r>>2]|0;s=y;w=y&255}c[o>>2]=22;c[o+4>>2]=l;c[o+8>>2]=4224;c[o+12>>2]=44;c[o+20>>2]=0;c[o+16>>2]=12;Cp(o+168562|0,0,65536)|0;w=o+60|0;c[o+36>>2]=0;c[o+32>>2]=0;c[o+28>>2]=0;s=o+88|0;c[w>>2]=0;c[w+4>>2]=0;c[w+8>>2]=0;c[w+12>>2]=0;c[s>>2]=0;c[s+4>>2]=0;c[s+8>>2]=0;c[s+12>>2]=0;c[s+16>>2]=0;c[o+40>>2]=o+37491;c[o+44>>2]=o+37490;c[o+56>>2]=8;s=o+234098|0;c[o+48>>2]=s;c[o+52>>2]=s;c[o+108>>2]=0;c[o+84>>2]=0;c[o+80>>2]=0;c[o+76>>2]=0;c[o+24>>2]=1;s=o+112|0;c[s>>2]=0;c[s+4>>2]=0;c[s+8>>2]=0;c[s+12>>2]=0;c[s+16>>2]=0;c[s+20>>2]=0;c[s+24>>2]=0;c[s+28>>2]=0;Cp(o+33170|0,0,640)|0;if((f|0)>0){s=0;do{mg(o,m,1,0)|0;mg(o,b+(ca(s,h)|0)|0,h,0)|0;s=s+1|0}while((s|0)!=(f|0))}if((mg(o,0,0,4)|0)!=1){qB(o);qB(c[u>>2]|0);p=0;i=k;return p|0}s=c[l>>2]|0;h=s+-41|0;c[j>>2]=h;a[n>>0]=-119;a[n+1>>0]=80;a[n+2>>0]=78;a[n+3>>0]=71;a[n+4>>0]=13;a[n+5>>0]=10;a[n+6>>0]=26;a[n+7>>0]=10;a[n+8>>0]=0;a[n+9>>0]=0;a[n+10>>0]=0;a[n+11>>0]=13;b=n+12|0;a[b>>0]=73;a[n+13>>0]=72;a[n+14>>0]=68;a[n+15>>0]=82;a[n+16>>0]=0;a[n+17>>0]=0;a[n+18>>0]=e>>>8;a[n+19>>0]=e;a[n+20>>0]=0;a[n+21>>0]=0;a[n+22>>0]=f>>>8;a[n+23>>0]=f;a[n+24>>0]=8;a[n+25>>0]=a[24919+g>>0]|0;g=n+26|0;f=n+29|0;e=n+31|0;a[g>>0]=0;a[g+1>>0]=0;a[g+2>>0]=0;a[g+3>>0]=0;a[g+4>>0]=0;a[g+5>>0]=0;a[g+6>>0]=0;a[n+33>>0]=h>>>24;a[n+34>>0]=h>>>16;a[n+35>>0]=h>>>8;a[n+36>>0]=h;a[n+37>>0]=73;a[n+38>>0]=68;a[n+39>>0]=65;a[n+40>>0]=84;h=17;g=b;b=73;m=-1;while(1){w=h+-1|0;v=g+1|0;E=b&255;t=c[14436+(((E^m)&15)<<2)>>2]^m>>>4;F=t>>>4^c[14436+((t&15^E>>>4)<<2)>>2];if(!w){G=F;break}h=w;g=v;b=a[v>>0]|0;m=F}m=~G;a[f>>0]=m>>>24;a[n+30>>0]=m>>>16;a[e>>0]=m>>>8;a[n+32>>0]=m;m=c[u>>2]|0;e=m;f=n;n=e+41|0;do{a[e>>0]=a[f>>0]|0;e=e+1|0;f=f+1|0}while((e|0)<(n|0));G=s+16|0;b=c[r>>2]|0;do if(G>>>0>b>>>0){if(c[q>>2]|0){g=b;while(1){h=g<<1;F=h>>>0<128?128:h;if(G>>>0>F>>>0)g=F;else{H=F;break}}g=eA(m,H)|0;if(g){c[u>>2]=g;c[r>>2]=H;I=g;J=c[l>>2]|0;break}}c[j>>2]=0;qB(o);qB(c[u>>2]|0);p=0;i=k;return p|0}else{I=m;J=s}while(0);e=I+J|0;f=24924;n=e+16|0;do{a[e>>0]=a[f>>0]|0;e=e+1|0;f=f+1|0}while((e|0)<(n|0));c[l>>2]=G;G=(c[j>>2]|0)+4|0;f=c[u>>2]|0;if(!G)K=0;else{e=G;G=f+37|0;n=-1;while(1){e=e+-1|0;J=d[G>>0]|0;I=c[14436+(((J^n)&15)<<2)>>2]^n>>>4;m=I>>>4^c[14436+((I&15^J>>>4)<<2)>>2];if(!e){L=m;break}else{G=G+1|0;n=m}}K=~L}a[f+s>>0]=K>>>24;a[(c[u>>2]|0)+((c[l>>2]|0)+-15)>>0]=K>>>16;a[(c[u>>2]|0)+((c[l>>2]|0)+-14)>>0]=K>>>8;a[(c[u>>2]|0)+((c[l>>2]|0)+-13)>>0]=K;c[j>>2]=(c[j>>2]|0)+57;qB(o);p=c[u>>2]|0;i=k;return p|0}function Qg(b,d,e,f,g,h,i,j,k,l,m,n,o,p,q){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=q|0;var r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0;c[e>>2]=b;r=p+4|0;s=p+8|0;t=o+4|0;u=(f&512|0)==0;v=o+8|0;w=(q|0)>0;x=n+4|0;y=n+8|0;z=n+1|0;A=(q|0)>0;B=g;g=0;while(1){switch(a[k+g>>0]|0){case 0:{c[d>>2]=c[e>>2];C=B;break}case 1:{c[d>>2]=c[e>>2];D=Nf[c[(c[i>>2]|0)+44>>2]&31](i,32)|0;E=c[e>>2]|0;c[e>>2]=E+4;c[E>>2]=D;C=B;break}case 3:{D=a[p>>0]|0;E=(D&1)==0;if(!((E?(D&255)>>>1:c[r>>2]|0)|0))C=B;else{D=c[(E?r:c[s>>2]|0)>>2]|0;E=c[e>>2]|0;c[e>>2]=E+4;c[E>>2]=D;C=B}break}case 2:{D=a[o>>0]|0;E=(D&1)==0;F=E?(D&255)>>>1:c[t>>2]|0;if(u|(F|0)==0)C=B;else{D=E?t:c[v>>2]|0;E=D+(F<<2)|0;G=c[e>>2]|0;if(F){H=G;I=D;while(1){c[H>>2]=c[I>>2];I=I+4|0;if((I|0)==(E|0))break;else H=H+4|0}}c[e>>2]=G+(F<<2);C=B}break}case 4:{H=c[e>>2]|0;E=j?B+4|0:B;a:do if(E>>>0<h>>>0){I=E;while(1){if(!(Ef[c[(c[i>>2]|0)+12>>2]&31](i,2048,c[I>>2]|0)|0)){J=I;break a}D=I+4|0;if(D>>>0<h>>>0)I=D;else{J=D;break}}}else J=E;while(0);if(w){if(J>>>0>E>>>0&A){F=c[e>>2]|0;G=J;I=q;while(1){D=G+-4|0;K=F+4|0;c[F>>2]=c[D>>2];L=I+-1|0;M=(I|0)>1;if(D>>>0>E>>>0&M){F=K;G=D;I=L}else{N=D;O=L;P=M;Q=K;break}}c[e>>2]=Q;R=P;S=N;T=O}else{R=A;S=J;T=q}if(R)U=Nf[c[(c[i>>2]|0)+44>>2]&31](i,48)|0;else U=0;I=c[e>>2]|0;G=T+((T|0)<0?~T:-1)|0;if((T|0)>0){F=I;K=T;while(1){c[F>>2]=U;if((K|0)>1){F=F+4|0;K=K+-1|0}else break}}c[e>>2]=I+(G+2<<2);c[I+(G+1<<2)>>2]=l;V=S}else V=J;if((V|0)==(E|0)){K=Nf[c[(c[i>>2]|0)+44>>2]&31](i,48)|0;F=c[e>>2]|0;M=F+4|0;c[e>>2]=M;c[F>>2]=K;W=M}else{M=a[n>>0]|0;K=(M&1)==0;F=c[x>>2]|0;if(!((K?(M&255)>>>1:F)|0))X=-1;else X=a[(K?z:c[y>>2]|0)>>0]|0;if((V|0)!=(E|0)){K=V;M=X;L=0;D=0;while(1){Y=c[e>>2]|0;if((D|0)==(M|0)){Z=Y+4|0;c[e>>2]=Z;c[Y>>2]=m;_=L+1|0;$=a[n>>0]|0;aa=($&1)==0;if(_>>>0<(aa?($&255)>>>1:F)>>>0){$=a[(aa?z:c[y>>2]|0)+_>>0]|0;ba=Z;ca=$<<24>>24==127?-1:$<<24>>24;da=_;ea=0}else{ba=Z;ca=D;da=_;ea=0}}else{ba=Y;ca=M;da=L;ea=D}K=K+-4|0;Y=c[K>>2]|0;c[e>>2]=ba+4;c[ba>>2]=Y;if((K|0)==(E|0))break;else{M=ca;L=da;D=ea+1|0}}}W=c[e>>2]|0}if((H|0)!=(W|0)?(D=W+-4|0,H>>>0<D>>>0):0){L=H;M=D;do{D=c[L>>2]|0;c[L>>2]=c[M>>2];c[M>>2]=D;L=L+4|0;M=M+-4|0}while(L>>>0<M>>>0);C=E}else C=E;break}default:C=B}g=g+1|0;if((g|0)==4)break;else B=C}C=a[p>>0]|0;p=(C&1)==0;B=p?(C&255)>>>1:c[r>>2]|0;if(B>>>0>1){C=p?r:c[s>>2]|0;s=C+4|0;r=C+(B<<2)|0;C=c[e>>2]|0;p=r-s|0;if((B|0)!=1){B=C;g=s;while(1){c[B>>2]=c[g>>2];g=g+4|0;if((g|0)==(r|0))break;else B=B+4|0}}c[e>>2]=C+(p>>>2<<2)}switch(f&176|0){case 32:{c[d>>2]=c[e>>2];break}case 16:break;default:c[d>>2]=b}return}function Yg(a){a=a|0;var d=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;d=c[a+24>>2]|0;f=c[a+28>>2]|0;g=c[a>>2]|0;h=c[a+16>>2]>>2;i=c[a+20>>2]|0;j=c[a+36>>2]>>1;a=f+-1|0;if(!f)return;f=(d+3|0)/4|0;k=d&3;if(!k){d=h+4|0;l=j+4|0;m=a;n=i;o=g;while(1){p=n;q=f;r=o;while(1){s=c[r>>2]|0;t=s>>>27;switch(t|0){case 0:break;case 31:{b[p>>1]=s>>>8&63488|s>>>5&2016|s>>>3&31;break}default:{u=e[p>>1]|0;v=(u<<16|u)&132184095;u=((ca((s<<11&132120576|s>>>8&63488|s>>>3&31)-v|0,t)|0)>>>5)+v&132184095;b[p>>1]=u>>>16|u}}u=p+2|0;v=c[r+4>>2]|0;t=v>>>27;switch(t|0){case 0:break;case 31:{b[u>>1]=v>>>8&63488|v>>>5&2016|v>>>3&31;break}default:{s=e[u>>1]|0;w=(s<<16|s)&132184095;s=((ca((v<<11&132120576|v>>>8&63488|v>>>3&31)-w|0,t)|0)>>>5)+w&132184095;b[u>>1]=s>>>16|s}}s=p+4|0;u=c[r+8>>2]|0;w=u>>>27;switch(w|0){case 0:break;case 31:{b[s>>1]=u>>>8&63488|u>>>5&2016|u>>>3&31;break}default:{t=e[s>>1]|0;v=(t<<16|t)&132184095;t=((ca((u<<11&132120576|u>>>8&63488|u>>>3&31)-v|0,w)|0)>>>5)+v&132184095;b[s>>1]=t>>>16|t}}t=p+6|0;s=c[r+12>>2]|0;v=s>>>27;switch(v|0){case 0:break;case 31:{b[t>>1]=s>>>8&63488|s>>>5&2016|s>>>3&31;break}default:{w=e[t>>1]|0;u=(w<<16|w)&132184095;w=((ca((s<<11&132120576|s>>>8&63488|s>>>3&31)-u|0,v)|0)>>>5)+u&132184095;b[t>>1]=w>>>16|w}}if((q|0)>1){p=p+8|0;q=q+-1|0;r=r+16|0}else{x=p;y=r;break}}if(!m)break;else{m=m+-1|0;n=x+(l<<1)|0;o=y+(d<<2)|0}}return}else{z=a;A=i;B=g}a:while(1){switch(k|0){case 1:{C=A;D=f;E=B;F=32;break}case 3:{G=A;H=f;I=B;F=24;break}case 2:{J=A;K=f;L=B;F=28;break}default:{M=A;N=B;F=36}}while(1)if((F|0)==24){F=0;g=c[I>>2]|0;i=g>>>27;switch(i|0){case 0:break;case 31:{b[G>>1]=g>>>8&63488|g>>>5&2016|g>>>3&31;break}default:{a=e[G>>1]|0;d=(a<<16|a)&132184095;a=((ca((g<<11&132120576|g>>>8&63488|g>>>3&31)-d|0,i)|0)>>>5)+d&132184095;b[G>>1]=a>>>16|a}}J=G+2|0;K=H;L=I+4|0;F=28;continue}else if((F|0)==28){F=0;a=c[L>>2]|0;d=a>>>27;switch(d|0){case 0:break;case 31:{b[J>>1]=a>>>8&63488|a>>>5&2016|a>>>3&31;break}default:{i=e[J>>1]|0;g=(i<<16|i)&132184095;i=((ca((a<<11&132120576|a>>>8&63488|a>>>3&31)-g|0,d)|0)>>>5)+g&132184095;b[J>>1]=i>>>16|i}}C=J+2|0;D=K;E=L+4|0;F=32;continue}else if((F|0)==32){F=0;i=c[E>>2]|0;g=i>>>27;switch(g|0){case 0:break;case 31:{b[C>>1]=i>>>8&63488|i>>>5&2016|i>>>3&31;break}default:{d=e[C>>1]|0;a=(d<<16|d)&132184095;d=((ca((i<<11&132120576|i>>>8&63488|i>>>3&31)-a|0,g)|0)>>>5)+a&132184095;b[C>>1]=d>>>16|d}}d=E+4|0;a=C+2|0;g=D+-1|0;if((D|0)<=1){M=a;N=d;F=36;continue}i=c[d>>2]|0;d=i>>>27;switch(d|0){case 0:break;case 31:{b[a>>1]=i>>>8&63488|i>>>5&2016|i>>>3&31;break}default:{y=e[a>>1]|0;o=(y<<16|y)&132184095;y=((ca((i<<11&132120576|i>>>8&63488|i>>>3&31)-o|0,d)|0)>>>5)+o&132184095;b[a>>1]=y>>>16|y}}G=C+4|0;H=g;I=E+8|0;F=24;continue}else if((F|0)==36){F=0;if(!z)break a;else{z=z+-1|0;A=M+(j<<1)|0;B=N+(h<<2)|0;continue a}}}return}function Vg(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0;h=c[e>>2]|0;if((g|0)!=0?(i=c[g>>2]|0,(i|0)!=0):0)if(!b){j=f;k=i;l=h;m=16}else{c[g>>2]=0;n=b;o=f;p=i;q=h;m=37}else if(!b){r=f;s=h;m=7}else{t=b;u=f;v=h;m=6}a:while(1)if((m|0)==6){m=0;if(!u){w=v;m=26;break}else{x=t;y=u;z=v}while(1){h=a[z>>0]|0;do if(((h&255)+-1|0)>>>0<127?y>>>0>4&(z&3|0)==0:0){i=x;g=y;A=z;while(1){B=c[A>>2]|0;if((B+-16843009|B)&-2139062144){C=i;D=g;E=B;F=A;m=32;break}c[i>>2]=B&255;c[i+4>>2]=d[A+1>>0];c[i+8>>2]=d[A+2>>0];B=A+4|0;G=i+16|0;c[i+12>>2]=d[A+3>>0];H=g+-4|0;if(H>>>0>4){i=G;g=H;A=B}else{I=B;J=G;K=H;m=31;break}}if((m|0)==31){m=0;L=J;M=K;N=a[I>>0]|0;O=I;break}else if((m|0)==32){m=0;L=C;M=D;N=E&255;O=F;break}}else{L=x;M=y;N=h;O=z}while(0);h=N&255;if((h+-1|0)>>>0>=127){P=L;Q=M;R=h;S=O;break}A=O+1|0;c[L>>2]=h;y=M+-1|0;if(!y){w=A;m=26;break a}else{x=L+4|0;z=A}}A=R+-194|0;if(A>>>0>50){T=P;U=Q;V=S;m=48;break}n=P;o=Q;p=c[14568+(A<<2)>>2]|0;q=S+1|0;m=37;continue}else if((m|0)==7){m=0;A=a[s>>0]|0;if(((A&255)+-1|0)>>>0<127?(s&3|0)==0:0){h=c[s>>2]|0;if(!((h+-16843009|h)&-2139062144)){g=r;i=s;while(1){H=i+4|0;G=g+-4|0;B=c[H>>2]|0;if(!((B+-16843009|B)&-2139062144)){g=G;i=H}else{W=G;X=B;Y=H;break}}}else{W=r;X=h;Y=s}Z=W;_=X&255;$=Y}else{Z=r;_=A;$=s}i=_&255;if((i+-1|0)>>>0<127){r=Z+-1|0;s=$+1|0;m=7;continue}else{aa=Z;ba=i;ca=$}i=ba+-194|0;if(i>>>0>50){T=b;U=aa;V=ca;m=48;break}j=aa;k=c[14568+(i<<2)>>2]|0;l=ca+1|0;m=16;continue}else if((m|0)==16){m=0;i=(d[l>>0]|0)>>>3;if((i+-16|i+(k>>26))>>>0>7){m=17;break}i=l+1|0;if(k&33554432){if((a[i>>0]&-64)<<24>>24!=-128){m=20;break}g=l+2|0;if(!(k&524288))da=g;else{if((a[g>>0]&-64)<<24>>24!=-128){m=23;break}da=l+3|0}}else da=i;r=j+-1|0;s=da;m=7;continue}else if((m|0)==37){m=0;i=d[q>>0]|0;g=i>>>3;if((g+-16|g+(p>>26))>>>0>7){m=38;break}g=q+1|0;H=i+-128|p<<6;if((H|0)<0){i=d[g>>0]|0;if((i&192|0)!=128){m=41;break}B=q+2|0;G=i+-128|H<<6;if((G|0)<0){i=d[B>>0]|0;if((i&192|0)!=128){m=44;break}ea=i+-128|G<<6;fa=q+3|0}else{ea=G;fa=B}}else{ea=H;fa=g}c[n>>2]=ea;t=n+4|0;u=o+-1|0;v=fa;m=6;continue}if((m|0)==17){ga=b;ha=j;ia=k;ja=l+-1|0;m=47}else if((m|0)==20){ga=b;ha=j;ia=k;ja=l+-1|0;m=47}else if((m|0)==23){ga=b;ha=j;ia=k;ja=l+-1|0;m=47}else if((m|0)==26){c[e>>2]=w;ka=f;return ka|0}else if((m|0)==38){ga=n;ha=o;ia=p;ja=q+-1|0;m=47}else if((m|0)==41){la=n;ma=q+-1|0}else if((m|0)==44){la=n;ma=q+-1|0}if((m|0)==47)if(!ia){T=ga;U=ha;V=ja;m=48}else{la=ga;ma=ja}if((m|0)==48)if(!(a[V>>0]|0)){if(T){c[T>>2]=0;c[e>>2]=0}ka=f-U|0;return ka|0}else{la=T;ma=V}c[(pd()|0)>>2]=84;if(!la){ka=-1;return ka|0}c[e>>2]=ma;ka=-1;return ka|0}function Ug(f){f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0;g=c[f+24>>2]|0;h=c[f+28>>2]|0;i=c[f+36>>2]|0;j=c[(c[(c[f+40>>2]|0)+4>>2]|0)+4>>2]|0;k=c[f+44>>2]|0;l=d[f+63>>0]|0;m=a[k+9>>0]|0;n=m&255;o=(c[f+16>>2]|0)+g+((g+7|0)/-8|0)|0;if(!h)return;p=(g|0)>0;q=k+28|0;r=k+32|0;s=k+29|0;t=k+33|0;u=k+30|0;v=k+34|0;w=k+31|0;x=k+35|0;y=k+12|0;z=k+16|0;A=k+20|0;B=k+24|0;k=m<<24>>24==1;m=h;h=c[f+20>>2]|0;C=c[f>>2]|0;while(1){m=m+-1|0;a:do if(p){if(k){f=0;D=0;E=h;F=C;while(1){if(!(D&7)){G=a[F>>0]|0;H=F+1|0}else{G=f;H=F}I=(G&255)>>>7&255;J=d[E>>0]|0;K=d[(c[5452+((d[q>>0]|0)<<2)>>2]|0)+((J&c[y>>2])>>>(d[r>>0]|0))>>0]|0;L=d[(c[5452+((d[s>>0]|0)<<2)>>2]|0)+((c[z>>2]&J)>>>(d[t>>0]|0))>>0]|0;M=d[(c[5452+((d[u>>0]|0)<<2)>>2]|0)+((c[A>>2]&J)>>>(d[v>>0]|0))>>0]|0;N=d[(c[5452+((d[w>>0]|0)<<2)>>2]|0)+((c[B>>2]&J)>>>(d[x>>0]|0))>>0]|0;J=N+l-(((ca(N,l)|0)>>>0)/255|0)|0;N=(((ca((d[j+(I<<2)+2>>0]|0)-M|0,l)|0)>>>0)/255|0)+M|0;M=(((ca((d[j+(I<<2)+1>>0]|0)-L|0,l)|0)>>>0)/255|0)+L|0;L=(((ca((d[j+(I<<2)>>0]|0)-K|0,l)|0)>>>0)/255|0)+K|0;a[E>>0]=M>>>(d[s>>0]|0)<<(d[t>>0]|0)|L>>>(d[q>>0]|0)<<(d[r>>0]|0)|N>>>(d[u>>0]|0)<<(d[v>>0]|0)|J>>>(d[w>>0]|0)<<(d[x>>0]|0);D=D+1|0;if((D|0)==(g|0)){O=H;break}else{f=(G&255)<<1&255;E=E+1|0;F=H}}P=h+g|0;Q=O;break}else{R=0;S=0;T=h;U=C}while(1){if(!(S&7)){V=a[U>>0]|0;W=U+1|0}else{V=R;W=U}F=V&255;E=(V&255)>>>7&255;f=d[j+(E<<2)>>0]|0;D=d[j+(E<<2)+1>>0]|0;J=d[j+(E<<2)+2>>0]|0;switch(n|0){case 4:{E=c[T>>2]|0;X=d[(c[5452+((d[w>>0]|0)<<2)>>2]|0)+((c[B>>2]&E)>>>(d[x>>0]|0))>>0]|0;Y=d[(c[5452+((d[u>>0]|0)<<2)>>2]|0)+((c[A>>2]&E)>>>(d[v>>0]|0))>>0]|0;Z=d[(c[5452+((d[s>>0]|0)<<2)>>2]|0)+((c[z>>2]&E)>>>(d[t>>0]|0))>>0]|0;_=d[(c[5452+((d[q>>0]|0)<<2)>>2]|0)+((c[y>>2]&E)>>>(d[r>>0]|0))>>0]|0;break}case 2:{E=e[T>>1]|0;X=d[(c[5452+((d[w>>0]|0)<<2)>>2]|0)+((c[B>>2]&E)>>>(d[x>>0]|0))>>0]|0;Y=d[(c[5452+((d[u>>0]|0)<<2)>>2]|0)+((c[A>>2]&E)>>>(d[v>>0]|0))>>0]|0;Z=d[(c[5452+((d[s>>0]|0)<<2)>>2]|0)+((c[z>>2]&E)>>>(d[t>>0]|0))>>0]|0;_=d[(c[5452+((d[q>>0]|0)<<2)>>2]|0)+((E&c[y>>2])>>>(d[r>>0]|0))>>0]|0;break}case 3:{X=255;Y=d[T+((d[v>>0]|0)>>>3&255)>>0]|0;Z=d[T+((d[t>>0]|0)>>>3&255)>>0]|0;_=d[T+((d[r>>0]|0)>>>3&255)>>0]|0;break}default:{X=0;Y=0;Z=0;_=0}}E=(((ca(f-_|0,l)|0)>>>0)/255|0)+_|0;f=(((ca(D-Z|0,l)|0)>>>0)/255|0)+Z|0;D=(((ca(J-Y|0,l)|0)>>>0)/255|0)+Y|0;J=X+l-(((ca(X,l)|0)>>>0)/255|0)|0;switch(n|0){case 4:{c[T>>2]=f>>>(d[s>>0]|0)<<(d[t>>0]|0)|E>>>(d[q>>0]|0)<<(d[r>>0]|0)|D>>>(d[u>>0]|0)<<(d[v>>0]|0)|J>>>(d[w>>0]|0)<<(d[x>>0]|0);break}case 2:{b[T>>1]=f>>>(d[s>>0]|0)<<(d[t>>0]|0)|E>>>(d[q>>0]|0)<<(d[r>>0]|0)|D>>>(d[u>>0]|0)<<(d[v>>0]|0)|J>>>(d[w>>0]|0)<<(d[x>>0]|0);break}case 3:{a[T+((d[r>>0]|0)>>>3&255)>>0]=E;a[T+((d[t>>0]|0)>>>3&255)>>0]=f;a[T+((d[v>>0]|0)>>>3&255)>>0]=D;break}default:{}}D=T+n|0;S=S+1|0;if((S|0)>=(g|0)){P=D;Q=W;break a}else{R=F<<1&255;T=D;U=W}}}else{P=h;Q=C}while(0);if(!m)break;else{h=P+i|0;C=Q+o|0}}return}function Gg(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0;k=i;i=i+144|0;l=k+132|0;m=k+116|0;n=k+128|0;o=k+124|0;p=k+120|0;q=k+112|0;r=k+108|0;s=k+104|0;t=k+100|0;u=k+96|0;v=k+92|0;w=k+88|0;x=k+84|0;y=k+80|0;z=k+76|0;A=k+72|0;B=k+68|0;C=k+64|0;D=k+60|0;E=k+56|0;F=k+52|0;G=k+48|0;H=k+44|0;I=k+40|0;J=k+36|0;K=k+32|0;L=k+28|0;M=k+24|0;N=k+20|0;O=k+16|0;P=k+12|0;Q=k+8|0;R=k+4|0;S=k;c[g>>2]=0;T=Hs(f)|0;c[n>>2]=T;U=Ds(n,18268)|0;lr(T)|0;do switch(j<<24>>24|0){case 65:case 97:{c[o>>2]=c[e>>2];c[l>>2]=c[o>>2];Jn(b,h+24|0,d,l,g,U);V=26;break}case 104:case 66:case 98:{c[p>>2]=c[e>>2];c[l>>2]=c[p>>2];zn(b,h+16|0,d,l,g,U);V=26;break}case 99:{T=b+8|0;n=Af[c[(c[T>>2]|0)+12>>2]&127](T)|0;c[q>>2]=c[d>>2];c[r>>2]=c[e>>2];T=a[n>>0]|0;W=(T&1)==0;X=n+4|0;Y=W?X:c[n+8>>2]|0;n=Y+((W?(T&255)>>>1:c[X>>2]|0)<<2)|0;c[m>>2]=c[q>>2];c[l>>2]=c[r>>2];c[d>>2]=Ig(b,m,l,f,g,h,Y,n)|0;V=26;break}case 101:case 100:{c[s>>2]=c[e>>2];c[l>>2]=c[s>>2];Do(b,h+12|0,d,l,g,U);V=26;break}case 68:{c[t>>2]=c[d>>2];c[u>>2]=c[e>>2];c[m>>2]=c[t>>2];c[l>>2]=c[u>>2];c[d>>2]=Ig(b,m,l,f,g,h,18876,18908)|0;V=26;break}case 70:{c[v>>2]=c[d>>2];c[w>>2]=c[e>>2];c[m>>2]=c[v>>2];c[l>>2]=c[w>>2];c[d>>2]=Ig(b,m,l,f,g,h,18908,18940)|0;V=26;break}case 72:{c[x>>2]=c[e>>2];c[l>>2]=c[x>>2];Qo(b,h+8|0,d,l,g,U);V=26;break}case 73:{c[y>>2]=c[e>>2];c[l>>2]=c[y>>2];Ao(b,h+8|0,d,l,g,U);V=26;break}case 106:{c[z>>2]=c[e>>2];c[l>>2]=c[z>>2];Eo(b,h+28|0,d,l,g,U);V=26;break}case 109:{c[A>>2]=c[e>>2];c[l>>2]=c[A>>2];Ho(b,h+16|0,d,l,g,U);V=26;break}case 77:{c[B>>2]=c[e>>2];c[l>>2]=c[B>>2];Mo(b,h+4|0,d,l,g,U);V=26;break}case 116:case 110:{c[C>>2]=c[e>>2];c[l>>2]=c[C>>2];lj(b,d,l,g,U);V=26;break}case 112:{c[D>>2]=c[e>>2];c[l>>2]=c[D>>2];km(b,h+8|0,d,l,g,U);V=26;break}case 114:{c[E>>2]=c[d>>2];c[F>>2]=c[e>>2];c[m>>2]=c[E>>2];c[l>>2]=c[F>>2];c[d>>2]=Ig(b,m,l,f,g,h,18940,18984)|0;V=26;break}case 82:{c[G>>2]=c[d>>2];c[H>>2]=c[e>>2];c[m>>2]=c[G>>2];c[l>>2]=c[H>>2];c[d>>2]=Ig(b,m,l,f,g,h,18984,19004)|0;V=26;break}case 83:{c[I>>2]=c[e>>2];c[l>>2]=c[I>>2];Lo(b,h,d,l,g,U);V=26;break}case 84:{c[J>>2]=c[d>>2];c[K>>2]=c[e>>2];c[m>>2]=c[J>>2];c[l>>2]=c[K>>2];c[d>>2]=Ig(b,m,l,f,g,h,19004,19036)|0;V=26;break}case 119:{c[L>>2]=c[e>>2];c[l>>2]=c[L>>2];Ko(b,h+24|0,d,l,g,U);V=26;break}case 120:{n=c[(c[b>>2]|0)+20>>2]|0;c[M>>2]=c[d>>2];c[N>>2]=c[e>>2];c[m>>2]=c[M>>2];c[l>>2]=c[N>>2];Z=zf[n&63](b,m,l,f,g,h)|0;break}case 88:{n=b+8|0;Y=Af[c[(c[n>>2]|0)+24>>2]&127](n)|0;c[O>>2]=c[d>>2];c[P>>2]=c[e>>2];n=a[Y>>0]|0;X=(n&1)==0;T=Y+4|0;W=X?T:c[Y+8>>2]|0;Y=W+((X?(n&255)>>>1:c[T>>2]|0)<<2)|0;c[m>>2]=c[O>>2];c[l>>2]=c[P>>2];c[d>>2]=Ig(b,m,l,f,g,h,W,Y)|0;V=26;break}case 121:{c[Q>>2]=c[e>>2];c[l>>2]=c[Q>>2];Xn(b,h+20|0,d,l,g,U);V=26;break}case 89:{c[R>>2]=c[e>>2];c[l>>2]=c[R>>2];ip(b,h+20|0,d,l,g,U);V=26;break}case 37:{c[S>>2]=c[e>>2];c[l>>2]=c[S>>2];Xi(b,d,l,g,U);V=26;break}default:{c[g>>2]=c[g>>2]|4;V=26}}while(0);if((V|0)==26)Z=c[d>>2]|0;i=k;return Z|0}function Hg(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0;k=i;i=i+144|0;l=k+132|0;m=k+116|0;n=k+128|0;o=k+124|0;p=k+120|0;q=k+112|0;r=k+108|0;s=k+104|0;t=k+100|0;u=k+96|0;v=k+92|0;w=k+88|0;x=k+84|0;y=k+80|0;z=k+76|0;A=k+72|0;B=k+68|0;C=k+64|0;D=k+60|0;E=k+56|0;F=k+52|0;G=k+48|0;H=k+44|0;I=k+40|0;J=k+36|0;K=k+32|0;L=k+28|0;M=k+24|0;N=k+20|0;O=k+16|0;P=k+12|0;Q=k+8|0;R=k+4|0;S=k;c[g>>2]=0;T=Hs(f)|0;c[n>>2]=T;U=Ds(n,18276)|0;lr(T)|0;do switch(j<<24>>24|0){case 65:case 97:{c[o>>2]=c[e>>2];c[l>>2]=c[o>>2];Kn(b,h+24|0,d,l,g,U);V=26;break}case 104:case 66:case 98:{c[p>>2]=c[e>>2];c[l>>2]=c[p>>2];An(b,h+16|0,d,l,g,U);V=26;break}case 99:{T=b+8|0;n=Af[c[(c[T>>2]|0)+12>>2]&127](T)|0;c[q>>2]=c[d>>2];c[r>>2]=c[e>>2];T=a[n>>0]|0;W=(T&1)==0;X=W?n+1|0:c[n+8>>2]|0;Y=X+(W?(T&255)>>>1:c[n+4>>2]|0)|0;c[m>>2]=c[q>>2];c[l>>2]=c[r>>2];c[d>>2]=Jg(b,m,l,f,g,h,X,Y)|0;V=26;break}case 101:case 100:{c[s>>2]=c[e>>2];c[l>>2]=c[s>>2];Fo(b,h+12|0,d,l,g,U);V=26;break}case 68:{c[t>>2]=c[d>>2];c[u>>2]=c[e>>2];c[m>>2]=c[t>>2];c[l>>2]=c[u>>2];c[d>>2]=Jg(b,m,l,f,g,h,33722,33730)|0;V=26;break}case 70:{c[v>>2]=c[d>>2];c[w>>2]=c[e>>2];c[m>>2]=c[v>>2];c[l>>2]=c[w>>2];c[d>>2]=Jg(b,m,l,f,g,h,33730,33738)|0;V=26;break}case 72:{c[x>>2]=c[e>>2];c[l>>2]=c[x>>2];Ro(b,h+8|0,d,l,g,U);V=26;break}case 73:{c[y>>2]=c[e>>2];c[l>>2]=c[y>>2];Bo(b,h+8|0,d,l,g,U);V=26;break}case 106:{c[z>>2]=c[e>>2];c[l>>2]=c[z>>2];Go(b,h+28|0,d,l,g,U);V=26;break}case 109:{c[A>>2]=c[e>>2];c[l>>2]=c[A>>2];Io(b,h+16|0,d,l,g,U);V=26;break}case 77:{c[B>>2]=c[e>>2];c[l>>2]=c[B>>2];Po(b,h+4|0,d,l,g,U);V=26;break}case 116:case 110:{c[C>>2]=c[e>>2];c[l>>2]=c[C>>2];sj(b,d,l,g,U);V=26;break}case 112:{c[D>>2]=c[e>>2];c[l>>2]=c[D>>2];lm(b,h+8|0,d,l,g,U);V=26;break}case 114:{c[E>>2]=c[d>>2];c[F>>2]=c[e>>2];c[m>>2]=c[E>>2];c[l>>2]=c[F>>2];c[d>>2]=Jg(b,m,l,f,g,h,33738,33749)|0;V=26;break}case 82:{c[G>>2]=c[d>>2];c[H>>2]=c[e>>2];c[m>>2]=c[G>>2];c[l>>2]=c[H>>2];c[d>>2]=Jg(b,m,l,f,g,h,33749,33754)|0;V=26;break}case 83:{c[I>>2]=c[e>>2];c[l>>2]=c[I>>2];Oo(b,h,d,l,g,U);V=26;break}case 84:{c[J>>2]=c[d>>2];c[K>>2]=c[e>>2];c[m>>2]=c[J>>2];c[l>>2]=c[K>>2];c[d>>2]=Jg(b,m,l,f,g,h,33754,33762)|0;V=26;break}case 119:{c[L>>2]=c[e>>2];c[l>>2]=c[L>>2];No(b,h+24|0,d,l,g,U);V=26;break}case 120:{Y=c[(c[b>>2]|0)+20>>2]|0;c[M>>2]=c[d>>2];c[N>>2]=c[e>>2];c[m>>2]=c[M>>2];c[l>>2]=c[N>>2];Z=zf[Y&63](b,m,l,f,g,h)|0;break}case 88:{Y=b+8|0;X=Af[c[(c[Y>>2]|0)+24>>2]&127](Y)|0;c[O>>2]=c[d>>2];c[P>>2]=c[e>>2];Y=a[X>>0]|0;n=(Y&1)==0;T=n?X+1|0:c[X+8>>2]|0;W=T+(n?(Y&255)>>>1:c[X+4>>2]|0)|0;c[m>>2]=c[O>>2];c[l>>2]=c[P>>2];c[d>>2]=Jg(b,m,l,f,g,h,T,W)|0;V=26;break}case 121:{c[Q>>2]=c[e>>2];c[l>>2]=c[Q>>2];Yn(b,h+20|0,d,l,g,U);V=26;break}case 89:{c[R>>2]=c[e>>2];c[l>>2]=c[R>>2];jp(b,h+20|0,d,l,g,U);V=26;break}case 37:{c[S>>2]=c[e>>2];c[l>>2]=c[S>>2];tj(b,d,l,g,U);V=26;break}default:{c[g>>2]=c[g>>2]|4;V=26}}while(0);if((V|0)==26)Z=c[d>>2]|0;i=k;return Z|0}function Sg(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0;k=i;i=i+112|0;l=k;m=(f-e|0)/12|0;if(m>>>0>100){n=_f(m)|0;if(!n)Iv();else{o=n;p=n}}else{o=0;p=l}if((e|0)==(f|0)){q=0;r=m}else{l=e;n=0;s=m;m=p;while(1){t=a[l>>0]|0;if(!(t&1))u=(t&255)>>>1;else u=c[l+4>>2]|0;if(!u){a[m>>0]=2;v=n+1|0;w=s+-1|0}else{a[m>>0]=1;v=n;w=s}l=l+12|0;if((l|0)==(f|0)){q=v;r=w;break}else{n=v;s=w;m=m+1|0}}}m=(e|0)==(f|0);w=(e|0)==(f|0);s=0;v=q;q=r;a:while(1){r=c[b>>2]|0;do if(r){n=c[r+12>>2]|0;if((n|0)==(c[r+16>>2]|0))x=Af[c[(c[r>>2]|0)+36>>2]&127](r)|0;else x=c[n>>2]|0;if((x|0)==-1){c[b>>2]=0;y=1;break}else{y=(c[b>>2]|0)==0;break}}else y=1;while(0);r=c[d>>2]|0;if(r){n=c[r+12>>2]|0;if((n|0)==(c[r+16>>2]|0))z=Af[c[(c[r>>2]|0)+36>>2]&127](r)|0;else z=c[n>>2]|0;if((z|0)==-1){c[d>>2]=0;A=0;B=1}else{A=r;B=0}}else{A=0;B=1}r=c[b>>2]|0;if(!((q|0)!=0&(y^B))){C=r;D=A;break}n=c[r+12>>2]|0;if((n|0)==(c[r+16>>2]|0))E=Af[c[(c[r>>2]|0)+36>>2]&127](r)|0;else E=c[n>>2]|0;if(j)F=E;else F=Nf[c[(c[g>>2]|0)+28>>2]&31](g,E)|0;n=s+1|0;if(m){G=0;H=v;I=q}else{r=0;l=e;u=v;t=q;J=p;while(1){do if((a[J>>0]|0)==1){if(!(a[l>>0]&1))K=l+4|0;else K=c[l+8>>2]|0;L=c[K+(s<<2)>>2]|0;if(j)M=L;else M=Nf[c[(c[g>>2]|0)+28>>2]&31](g,L)|0;if((F|0)!=(M|0)){a[J>>0]=0;N=r;O=u;P=t+-1|0;break}L=a[l>>0]|0;if(!(L&1))Q=(L&255)>>>1;else Q=c[l+4>>2]|0;if((Q|0)==(n|0)){a[J>>0]=2;N=1;O=u+1|0;P=t+-1|0}else{N=1;O=u;P=t}}else{N=r;O=u;P=t}while(0);l=l+12|0;if((l|0)==(f|0)){G=N;H=O;I=P;break}else{r=N;u=O;t=P;J=J+1|0}}}if(!G){s=n;v=H;q=I;continue}J=c[b>>2]|0;t=J+12|0;u=c[t>>2]|0;if((u|0)==(c[J+16>>2]|0))Af[c[(c[J>>2]|0)+40>>2]&127](J)|0;else c[t>>2]=u+4;if((H+I|0)>>>0<2|w){s=n;v=H;q=I;continue}else{R=e;S=H;T=p}while(1){if((a[T>>0]|0)==2){u=a[R>>0]|0;if(!(u&1))U=(u&255)>>>1;else U=c[R+4>>2]|0;if((U|0)!=(n|0)){a[T>>0]=0;V=S+-1|0}else V=S}else V=S;u=R+12|0;if((u|0)==(f|0)){s=n;v=V;q=I;continue a}else{R=u;S=V;T=T+1|0}}}do if(C){T=c[C+12>>2]|0;if((T|0)==(c[C+16>>2]|0))W=Af[c[(c[C>>2]|0)+36>>2]&127](C)|0;else W=c[T>>2]|0;if((W|0)==-1){c[b>>2]=0;X=1;break}else{X=(c[b>>2]|0)==0;break}}else X=1;while(0);do if(D){b=c[D+12>>2]|0;if((b|0)==(c[D+16>>2]|0))Y=Af[c[(c[D>>2]|0)+36>>2]&127](D)|0;else Y=c[b>>2]|0;if((Y|0)!=-1)if(X)break;else{Z=74;break}else{c[d>>2]=0;Z=72;break}}else Z=72;while(0);if((Z|0)==72?X:0)Z=74;if((Z|0)==74)c[h>>2]=c[h>>2]|2;b:do if((e|0)==(f|0))Z=78;else{X=e;d=p;while(1){if((a[d>>0]|0)==2){_=X;break b}X=X+12|0;if((X|0)==(f|0)){Z=78;break}else d=d+1|0}}while(0);if((Z|0)==78){c[h>>2]=c[h>>2]|4;_=f}yg(o);i=k;return _|0}function _g(f){f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0;g=c[f+24>>2]|0;h=c[f+28>>2]|0;i=c[f+36>>2]|0;j=c[f+44>>2]|0;k=c[(c[(c[f+40>>2]|0)+4>>2]|0)+4>>2]|0;l=d[f+63>>0]|0;m=c[f+56>>2]|0;n=d[j+9>>0]|0;o=(c[f+16>>2]|0)+g+((g+7|0)/-8|0)|0;if(!h)return;p=(g|0)>0;q=j+28|0;r=j+32|0;s=j+29|0;t=j+33|0;u=j+30|0;v=j+34|0;w=j+31|0;x=j+35|0;y=j+12|0;z=j+16|0;A=j+20|0;B=j+24|0;j=ca(g,n)|0;C=h;h=c[f+20>>2]|0;D=c[f>>2]|0;while(1){C=C+-1|0;if(p){f=0;E=0;F=h;G=D;while(1){if(!(E&7)){H=a[G>>0]|0;I=G+1|0}else{H=f;I=G}J=H&255;K=(H&255)>>>7&255;a:do if((K|0)!=(m|0)){L=d[k+(K<<2)>>0]|0;M=d[k+(K<<2)+1>>0]|0;N=d[k+(K<<2)+2>>0]|0;switch(n|0){case 1:{O=d[F>>0]|0;P=d[(c[5452+((d[w>>0]|0)<<2)>>2]|0)+((c[B>>2]&O)>>>(d[x>>0]|0))>>0]|0;Q=d[(c[5452+((d[u>>0]|0)<<2)>>2]|0)+((c[A>>2]&O)>>>(d[v>>0]|0))>>0]|0;R=d[(c[5452+((d[s>>0]|0)<<2)>>2]|0)+((c[z>>2]&O)>>>(d[t>>0]|0))>>0]|0;S=d[(c[5452+((d[q>>0]|0)<<2)>>2]|0)+((O&c[y>>2])>>>(d[r>>0]|0))>>0]|0;break}case 2:{O=e[F>>1]|0;P=d[(c[5452+((d[w>>0]|0)<<2)>>2]|0)+((c[B>>2]&O)>>>(d[x>>0]|0))>>0]|0;Q=d[(c[5452+((d[u>>0]|0)<<2)>>2]|0)+((c[A>>2]&O)>>>(d[v>>0]|0))>>0]|0;R=d[(c[5452+((d[s>>0]|0)<<2)>>2]|0)+((c[z>>2]&O)>>>(d[t>>0]|0))>>0]|0;S=d[(c[5452+((d[q>>0]|0)<<2)>>2]|0)+((O&c[y>>2])>>>(d[r>>0]|0))>>0]|0;break}case 3:{P=255;Q=d[F+((d[v>>0]|0)>>>3&255)>>0]|0;R=d[F+((d[t>>0]|0)>>>3&255)>>0]|0;S=d[F+((d[r>>0]|0)>>>3&255)>>0]|0;break}case 4:{O=c[F>>2]|0;P=d[(c[5452+((d[w>>0]|0)<<2)>>2]|0)+((c[B>>2]&O)>>>(d[x>>0]|0))>>0]|0;Q=d[(c[5452+((d[u>>0]|0)<<2)>>2]|0)+((c[A>>2]&O)>>>(d[v>>0]|0))>>0]|0;R=d[(c[5452+((d[s>>0]|0)<<2)>>2]|0)+((c[z>>2]&O)>>>(d[t>>0]|0))>>0]|0;S=d[(c[5452+((d[q>>0]|0)<<2)>>2]|0)+((c[y>>2]&O)>>>(d[r>>0]|0))>>0]|0;break}default:{P=0;Q=0;R=0;S=0}}O=(((ca(L-S|0,l)|0)>>>0)/255|0)+S|0;L=(((ca(M-R|0,l)|0)>>>0)/255|0)+R|0;M=(((ca(N-Q|0,l)|0)>>>0)/255|0)+Q|0;N=P+l-(((ca(P,l)|0)>>>0)/255|0)|0;switch(n|0){case 1:{a[F>>0]=L>>>(d[s>>0]|0)<<(d[t>>0]|0)|O>>>(d[q>>0]|0)<<(d[r>>0]|0)|M>>>(d[u>>0]|0)<<(d[v>>0]|0)|N>>>(d[w>>0]|0)<<(d[x>>0]|0);break a;break}case 2:{b[F>>1]=L>>>(d[s>>0]|0)<<(d[t>>0]|0)|O>>>(d[q>>0]|0)<<(d[r>>0]|0)|M>>>(d[u>>0]|0)<<(d[v>>0]|0)|N>>>(d[w>>0]|0)<<(d[x>>0]|0);break a;break}case 3:{a[F+((d[r>>0]|0)>>>3&255)>>0]=O;a[F+((d[t>>0]|0)>>>3&255)>>0]=L;a[F+((d[v>>0]|0)>>>3&255)>>0]=M;break a;break}case 4:{c[F>>2]=L>>>(d[s>>0]|0)<<(d[t>>0]|0)|O>>>(d[q>>0]|0)<<(d[r>>0]|0)|M>>>(d[u>>0]|0)<<(d[v>>0]|0)|N>>>(d[w>>0]|0)<<(d[x>>0]|0);break a;break}default:break a}}while(0);E=E+1|0;if((E|0)==(g|0)){T=I;break}else{f=J<<1&255;F=F+n|0;G=I}}U=h+j|0;V=T}else{U=h;V=D}if(!C)break;else{h=U+i|0;D=V+o|0}}return}function ch(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0;d=a[b+63>>0]|0;e=d&255;f=c[b+24>>2]|0;g=c[b+28>>2]|0;h=c[b+16>>2]>>2;i=c[b+36>>2]>>2;j=(g|0)==0;if(d<<24>>24==-128){if(j)return;d=(f+3|0)/4|0;k=f&3;l=g;m=c[b+20>>2]|0;n=c[b>>2]|0;a:while(1){o=l+-1|0;switch(k|0){case 0:{p=m;q=d;r=n;s=5;break}case 3:{t=m;u=d;v=n;s=6;break}case 2:{w=m;x=d;y=n;s=7;break}case 1:{z=m;A=d;B=n;s=8;break}default:{C=m;D=n;s=9}}while(1)if((s|0)==5){s=0;E=c[r>>2]|0;F=c[p>>2]|0;c[p>>2]=(((F&16711422)+(E&16711422)|0)>>>1)+(E&65793&F)|-16777216;t=p+4|0;u=q;v=r+4|0;s=6;continue}else if((s|0)==6){s=0;F=c[v>>2]|0;E=c[t>>2]|0;c[t>>2]=(((E&16711422)+(F&16711422)|0)>>>1)+(F&65793&E)|-16777216;w=t+4|0;x=u;y=v+4|0;s=7;continue}else if((s|0)==7){s=0;E=c[y>>2]|0;F=c[w>>2]|0;c[w>>2]=(((F&16711422)+(E&16711422)|0)>>>1)+(E&65793&F)|-16777216;z=w+4|0;A=x;B=y+4|0;s=8;continue}else if((s|0)==8){s=0;F=B+4|0;E=c[B>>2]|0;G=c[z>>2]|0;H=z+4|0;c[z>>2]=(((G&16711422)+(E&16711422)|0)>>>1)+(E&65793&G)|-16777216;if((A|0)>1){p=H;q=A+-1|0;r=F;s=5;continue}else{C=H;D=F;s=9;continue}}else if((s|0)==9){s=0;if(!o)break a;else{l=o;m=C+(i<<2)|0;n=D+(h<<2)|0;continue a}}}return}else{if(j)return;j=(f+3|0)/4|0;D=f&3;f=g;g=c[b+20>>2]|0;n=c[b>>2]|0;b:while(1){b=f+-1|0;switch(D|0){case 0:{I=g;J=j;K=n;s=13;break}case 3:{L=g;M=j;N=n;s=14;break}case 2:{O=g;P=j;Q=n;s=15;break}case 1:{R=g;S=j;T=n;s=16;break}default:{U=g;V=n;s=17}}while(1)if((s|0)==13){s=0;C=c[K>>2]|0;m=c[I>>2]|0;l=m&16711935;r=m&65280;c[I>>2]=((ca((C&65280)-r|0,e)|0)>>>8)+r&65280|((ca((C&16711935)-l|0,e)|0)>>>8)+l&16711935|-16777216;L=I+4|0;M=J;N=K+4|0;s=14;continue}else if((s|0)==14){s=0;l=c[N>>2]|0;C=c[L>>2]|0;r=C&16711935;m=C&65280;c[L>>2]=((ca((l&65280)-m|0,e)|0)>>>8)+m&65280|((ca((l&16711935)-r|0,e)|0)>>>8)+r&16711935|-16777216;O=L+4|0;P=M;Q=N+4|0;s=15;continue}else if((s|0)==15){s=0;r=c[Q>>2]|0;l=c[O>>2]|0;m=l&16711935;C=l&65280;c[O>>2]=((ca((r&65280)-C|0,e)|0)>>>8)+C&65280|((ca((r&16711935)-m|0,e)|0)>>>8)+m&16711935|-16777216;R=O+4|0;S=P;T=Q+4|0;s=16;continue}else if((s|0)==16){s=0;m=c[T>>2]|0;r=c[R>>2]|0;C=r&16711935;l=r&65280;c[R>>2]=((ca((m&65280)-l|0,e)|0)>>>8)+l&65280|((ca((m&16711935)-C|0,e)|0)>>>8)+C&16711935|-16777216;C=T+4|0;m=R+4|0;if((S|0)>1){I=m;J=S+-1|0;K=C;s=13;continue}else{U=m;V=C;s=17;continue}}else if((s|0)==17){s=0;if(!b)break b;else{f=b;g=U+(i<<2)|0;n=V+(h<<2)|0;continue b}}}return}}function Zg(e,f){e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0;g=i;i=i+1040|0;h=g;j=g+16|0;k=e+52|0;l=c[k>>2]|0;if(c[e>>2]&2)si(e,1);if(l){m=c[l>>2]|0;if((m|0)!=0?(n=m+56|0,o=c[n>>2]|0,c[n>>2]=o+-1,(o|0)<2):0)rm(m);c[l>>2]=0;c[l+84>>2]=0;c[l+80>>2]=0;m=l+64|0;qB(c[m>>2]|0);c[m>>2]=0}m=l+4|0;c[m>>2]=0;o=c[e+4>>2]|0;n=c[f+4>>2]|0;p=c[o>>2]|0;do if((p|0)==0|(p&-268435456|0)==268435456?((p>>>24&15)+-1|0)>>>0<3:0){q=c[n>>2]|0;if((q|0)==0|(q&-268435456|0)==268435456?((q>>>24&15)+-1|0)>>>0<3:0){q=Ck(c[o+4>>2]|0,c[n+4>>2]|0,m)|0;c[l+64>>2]=q;if((q|0)==0&(c[m>>2]|0)==0){r=-1;i=g;return r|0}if((a[o+8>>0]|0)==(a[n+8>>0]|0)){s=35;break}c[m>>2]=0;s=35;break}q=c[k>>2]|0;t=a[q+76>>0]|0;u=a[q+77>>0]|0;v=a[q+78>>0]|0;w=a[q+79>>0]|0;q=c[o+4>>2]|0;x=n+9|0;y=a[x>>0]|0;z=y<<24>>24==3?4:y&255;y=iB(ca(z,c[q>>2]|0)|0)|0;if(!y){Fp(0)|0;c[l+64>>2]=0;r=-1;i=g;return r|0}if((c[q>>2]|0)<=0){c[l+64>>2]=y;s=35;break}A=q+4|0;B=t&255;t=u&255;u=v&255;v=w&255;w=n+28|0;C=n+32|0;D=n+29|0;E=n+33|0;F=n+30|0;G=n+34|0;H=n+31|0;I=n+35|0;J=0;do{K=c[A>>2]|0;L=((ca(d[K+(J<<2)>>0]|0,B)|0)>>>0)/255|0;M=((ca(d[K+(J<<2)+1>>0]|0,t)|0)>>>0)/255|0;N=((ca(d[K+(J<<2)+2>>0]|0,u)|0)>>>0)/255|0;O=((ca(d[K+(J<<2)+3>>0]|0,v)|0)>>>0)/255|0;switch(d[x>>0]|0){case 1:{a[y+(ca(J,z)|0)>>0]=(M&255)>>>(d[D>>0]|0)<<d[E>>0]|(L&255)>>>(d[w>>0]|0)<<d[C>>0]|(N&255)>>>(d[F>>0]|0)<<d[G>>0]|(O&255)>>>(d[H>>0]|0)<<d[I>>0];break}case 2:{b[y+(ca(J,z)|0)>>1]=(M&255)>>>(d[D>>0]|0)<<d[E>>0]|(L&255)>>>(d[w>>0]|0)<<d[C>>0]|(N&255)>>>(d[F>>0]|0)<<d[G>>0]|(O&255)>>>(d[H>>0]|0)<<d[I>>0];break}case 3:{K=ca(J,z)|0;a[y+(((d[C>>0]|0)>>>3&255)+K)>>0]=L;a[y+(((d[E>>0]|0)>>>3&255)+K)>>0]=M;a[y+(((d[G>>0]|0)>>>3&255)+K)>>0]=N;break}case 4:{c[y+(ca(J,z)|0)>>2]=(M&255)>>>(d[D>>0]|0)<<d[E>>0]|(L&255)>>>(d[w>>0]|0)<<d[C>>0]|(N&255)>>>(d[F>>0]|0)<<d[G>>0]|(O&255)>>>(d[H>>0]|0)<<d[I>>0];break}default:{}}J=J+1|0}while((J|0)<(c[q>>2]|0));c[l+64>>2]=y;s=36}else s=27;while(0);do if((s|0)==27){k=c[n>>2]|0;if((k|0)==0|(k&-268435456|0)==268435456?((k>>>24&15)+-1|0)>>>0<3:0){k=c[n+4>>2]|0;c[h>>2]=256;p=0;do{q=p&224;a[j+(p<<2)>>0]=q>>>6|q|q>>>3;q=p<<3&224;a[j+(p<<2)+1>>0]=q>>>6|q|q>>>3;q=p&3;J=q<<2|q;a[j+(p<<2)+2>>0]=J<<4|J;a[j+(p<<2)+3>>0]=-1;p=p+1|0}while((p|0)!=256);c[h+4>>2]=j;p=Ck(h,k,m)|0;c[l+64>>2]=p;if((p|0)==0&(c[m>>2]|0)==0){r=-1;i=g;return r|0}else{c[m>>2]=0;s=36;break}}if((o|0)==(n|0)){c[m>>2]=1;s=35}else s=35}while(0);if((s|0)==35){c[l>>2]=f;s=37}else if((s|0)==36?(c[l>>2]=f,(f|0)!=0):0)s=37;if((s|0)==37){s=f+56|0;c[s>>2]=(c[s>>2]|0)+1}s=c[n+4>>2]|0;if(!s)P=0;else P=c[s+8>>2]|0;c[l+80>>2]=P;P=c[o+4>>2]|0;if(!P)Q=0;else Q=c[P+8>>2]|0;c[l+84>>2]=Q;r=wi(e)|0;i=g;return r|0}function Lg(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;n=i;i=i+112|0;o=n+108|0;p=n+96|0;q=n+92|0;r=n+80|0;s=n+68|0;t=n+56|0;u=n+52|0;v=n+40|0;w=n+36|0;x=n+24|0;y=n+12|0;z=n;if(b){b=Ds(e,17884)|0;A=c[b>>2]|0;if(d){yf[c[A+44>>2]&127](o,b);B=c[o>>2]|0;a[f>>0]=B;a[f+1>>0]=B>>8;a[f+2>>0]=B>>16;a[f+3>>0]=B>>24;yf[c[(c[b>>2]|0)+32>>2]&127](p,b);if(!(a[l>>0]&1)){a[l+1>>0]=0;a[l>>0]=0}else{a[c[l+8>>2]>>0]=0;c[l+4>>2]=0}Tl(l,0);c[l>>2]=c[p>>2];c[l+4>>2]=c[p+4>>2];c[l+8>>2]=c[p+8>>2];c[p>>2]=0;c[p+4>>2]=0;c[p+8>>2]=0;Au(p);C=b}else{yf[c[A+40>>2]&127](q,b);A=c[q>>2]|0;a[f>>0]=A;a[f+1>>0]=A>>8;a[f+2>>0]=A>>16;a[f+3>>0]=A>>24;yf[c[(c[b>>2]|0)+28>>2]&127](r,b);if(!(a[l>>0]&1)){a[l+1>>0]=0;a[l>>0]=0}else{a[c[l+8>>2]>>0]=0;c[l+4>>2]=0}Tl(l,0);c[l>>2]=c[r>>2];c[l+4>>2]=c[r+4>>2];c[l+8>>2]=c[r+8>>2];c[r>>2]=0;c[r+4>>2]=0;c[r+8>>2]=0;Au(r);C=b}a[g>>0]=Af[c[(c[b>>2]|0)+12>>2]&127](b)|0;a[h>>0]=Af[c[(c[b>>2]|0)+16>>2]&127](b)|0;yf[c[(c[C>>2]|0)+20>>2]&127](s,b);if(!(a[j>>0]&1)){a[j+1>>0]=0;a[j>>0]=0}else{a[c[j+8>>2]>>0]=0;c[j+4>>2]=0}Tl(j,0);c[j>>2]=c[s>>2];c[j+4>>2]=c[s+4>>2];c[j+8>>2]=c[s+8>>2];c[s>>2]=0;c[s+4>>2]=0;c[s+8>>2]=0;Au(s);yf[c[(c[C>>2]|0)+24>>2]&127](t,b);if(!(a[k>>0]&1)){a[k+1>>0]=0;a[k>>0]=0}else{a[c[k+8>>2]>>0]=0;c[k+4>>2]=0}Tl(k,0);c[k>>2]=c[t>>2];c[k+4>>2]=c[t+4>>2];c[k+8>>2]=c[t+8>>2];c[t>>2]=0;c[t+4>>2]=0;c[t+8>>2]=0;Au(t);D=Af[c[(c[b>>2]|0)+36>>2]&127](b)|0}else{b=Ds(e,17820)|0;e=c[b>>2]|0;if(d){yf[c[e+44>>2]&127](u,b);d=c[u>>2]|0;a[f>>0]=d;a[f+1>>0]=d>>8;a[f+2>>0]=d>>16;a[f+3>>0]=d>>24;yf[c[(c[b>>2]|0)+32>>2]&127](v,b);if(!(a[l>>0]&1)){a[l+1>>0]=0;a[l>>0]=0}else{a[c[l+8>>2]>>0]=0;c[l+4>>2]=0}Tl(l,0);c[l>>2]=c[v>>2];c[l+4>>2]=c[v+4>>2];c[l+8>>2]=c[v+8>>2];c[v>>2]=0;c[v+4>>2]=0;c[v+8>>2]=0;Au(v);E=b}else{yf[c[e+40>>2]&127](w,b);e=c[w>>2]|0;a[f>>0]=e;a[f+1>>0]=e>>8;a[f+2>>0]=e>>16;a[f+3>>0]=e>>24;yf[c[(c[b>>2]|0)+28>>2]&127](x,b);if(!(a[l>>0]&1)){a[l+1>>0]=0;a[l>>0]=0}else{a[c[l+8>>2]>>0]=0;c[l+4>>2]=0}Tl(l,0);c[l>>2]=c[x>>2];c[l+4>>2]=c[x+4>>2];c[l+8>>2]=c[x+8>>2];c[x>>2]=0;c[x+4>>2]=0;c[x+8>>2]=0;Au(x);E=b}a[g>>0]=Af[c[(c[b>>2]|0)+12>>2]&127](b)|0;a[h>>0]=Af[c[(c[b>>2]|0)+16>>2]&127](b)|0;yf[c[(c[E>>2]|0)+20>>2]&127](y,b);if(!(a[j>>0]&1)){a[j+1>>0]=0;a[j>>0]=0}else{a[c[j+8>>2]>>0]=0;c[j+4>>2]=0}Tl(j,0);c[j>>2]=c[y>>2];c[j+4>>2]=c[y+4>>2];c[j+8>>2]=c[y+8>>2];c[y>>2]=0;c[y+4>>2]=0;c[y+8>>2]=0;Au(y);yf[c[(c[E>>2]|0)+24>>2]&127](z,b);if(!(a[k>>0]&1)){a[k+1>>0]=0;a[k>>0]=0}else{a[c[k+8>>2]>>0]=0;c[k+4>>2]=0}Tl(k,0);c[k>>2]=c[z>>2];c[k+4>>2]=c[z+4>>2];c[k+8>>2]=c[z+8>>2];c[z>>2]=0;c[z+4>>2]=0;c[z+8>>2]=0;Au(z);D=Af[c[(c[b>>2]|0)+36>>2]&127](b)|0}c[m>>2]=D;i=n;return}function Xg(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;l=i;i=i+112|0;m=l;n=(g-f|0)/12|0;if(n>>>0>100){o=_f(n)|0;if(!o)Iv();else{p=o;q=o}}else{p=0;q=m}if((f|0)==(g|0)){r=0;s=n}else{m=f;o=0;t=n;n=q;while(1){u=a[m>>0]|0;if(!(u&1))v=(u&255)>>>1;else v=c[m+4>>2]|0;if(!v){a[n>>0]=2;w=o+1|0;x=t+-1|0}else{a[n>>0]=1;w=o;x=t}m=m+12|0;if((m|0)==(g|0)){r=w;s=x;break}else{o=w;t=x;n=n+1|0}}}n=(f|0)==(g|0);x=(f|0)==(g|0);t=0;w=r;r=s;a:while(1){s=c[b>>2]|0;do if(s)if((c[s+12>>2]|0)==(c[s+16>>2]|0))if((Af[c[(c[s>>2]|0)+36>>2]&127](s)|0)==-1){c[b>>2]=0;y=0;break}else{y=c[b>>2]|0;break}else y=s;else y=0;while(0);s=(y|0)==0;o=c[e>>2]|0;if(o)if((c[o+12>>2]|0)==(c[o+16>>2]|0)?(Af[c[(c[o>>2]|0)+36>>2]&127](o)|0)==-1:0){c[e>>2]=0;z=0}else z=o;else z=0;o=(z|0)==0;m=c[b>>2]|0;if(!((r|0)!=0&(s^o))){A=o;B=m;C=z;break}o=c[m+12>>2]|0;if((o|0)==(c[m+16>>2]|0))D=Af[c[(c[m>>2]|0)+36>>2]&127](m)|0;else D=d[o>>0]|0;o=D&255;if(k)E=o;else E=Nf[c[(c[h>>2]|0)+12>>2]&31](h,o)|0;o=t+1|0;if(n){F=0;G=w;H=r}else{m=0;s=f;v=w;u=r;I=q;while(1){do if((a[I>>0]|0)==1){if(!(a[s>>0]&1))J=s+1|0;else J=c[s+8>>2]|0;K=a[J+t>>0]|0;if(k)L=K;else L=Nf[c[(c[h>>2]|0)+12>>2]&31](h,K)|0;if(E<<24>>24!=L<<24>>24){a[I>>0]=0;M=m;N=v;O=u+-1|0;break}K=a[s>>0]|0;if(!(K&1))P=(K&255)>>>1;else P=c[s+4>>2]|0;if((P|0)==(o|0)){a[I>>0]=2;M=1;N=v+1|0;O=u+-1|0}else{M=1;N=v;O=u}}else{M=m;N=v;O=u}while(0);s=s+12|0;if((s|0)==(g|0)){F=M;G=N;H=O;break}else{m=M;v=N;u=O;I=I+1|0}}}if(!F){t=o;w=G;r=H;continue}I=c[b>>2]|0;u=I+12|0;v=c[u>>2]|0;if((v|0)==(c[I+16>>2]|0))Af[c[(c[I>>2]|0)+40>>2]&127](I)|0;else c[u>>2]=v+1;if((G+H|0)>>>0<2|x){t=o;w=G;r=H;continue}else{Q=f;R=G;S=q}while(1){if((a[S>>0]|0)==2){v=a[Q>>0]|0;if(!(v&1))T=(v&255)>>>1;else T=c[Q+4>>2]|0;if((T|0)!=(o|0)){a[S>>0]=0;U=R+-1|0}else U=R}else U=R;v=Q+12|0;if((v|0)==(g|0)){t=o;w=U;r=H;continue a}else{Q=v;R=U;S=S+1|0}}}do if(B)if((c[B+12>>2]|0)==(c[B+16>>2]|0))if((Af[c[(c[B>>2]|0)+36>>2]&127](B)|0)==-1){c[b>>2]=0;V=0;break}else{V=c[b>>2]|0;break}else V=B;else V=0;while(0);B=(V|0)==0;do if(!A){if((c[C+12>>2]|0)==(c[C+16>>2]|0)?(Af[c[(c[C>>2]|0)+36>>2]&127](C)|0)==-1:0){c[e>>2]=0;W=65;break}if(!B)W=66}else W=65;while(0);if((W|0)==65?B:0)W=66;if((W|0)==66)c[j>>2]=c[j>>2]|2;b:do if((f|0)==(g|0))W=70;else{B=f;e=q;while(1){if((a[e>>0]|0)==2){X=B;break b}B=B+12|0;if((B|0)==(g|0)){W=70;break}else e=e+1|0}}while(0);if((W|0)==70){c[j>>2]=c[j>>2]|4;X=g}yg(p);i=l;return X|0}function oh(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0;e=c[b+24>>2]|0;f=c[b+28>>2]|0;g=c[b>>2]|0;h=c[b+16>>2]|0;i=c[b+20>>2]|0;j=c[b+36>>2]|0;k=c[b+48>>2]|0;b=f+-1|0;if(!f)return;f=(e+7|0)/8|0;l=e&7;switch(l|0){case 0:{e=h+8|0;m=j+8|0;n=b;o=i;p=g;while(1){q=o;r=f;s=p;while(1){a[q>>0]=a[k+(d[s>>0]|0)>>0]|0;a[q+1>>0]=a[k+(d[s+1>>0]|0)>>0]|0;a[q+2>>0]=a[k+(d[s+2>>0]|0)>>0]|0;a[q+3>>0]=a[k+(d[s+3>>0]|0)>>0]|0;a[q+4>>0]=a[k+(d[s+4>>0]|0)>>0]|0;a[q+5>>0]=a[k+(d[s+5>>0]|0)>>0]|0;a[q+6>>0]=a[k+(d[s+6>>0]|0)>>0]|0;a[q+7>>0]=a[k+(d[s+7>>0]|0)>>0]|0;if((r|0)>1){q=q+8|0;r=r+-1|0;s=s+8|0}else{t=q;u=s;break}}if(!n)break;else{n=n+-1|0;o=t+m|0;p=u+e|0}}return}case 7:{e=h+7|0;u=j+7|0;p=b;m=i;t=g;while(1){o=m;n=f;s=t;while(1){a[o>>0]=a[k+(d[s>>0]|0)>>0]|0;a[o+1>>0]=a[k+(d[s+1>>0]|0)>>0]|0;a[o+2>>0]=a[k+(d[s+2>>0]|0)>>0]|0;a[o+3>>0]=a[k+(d[s+3>>0]|0)>>0]|0;a[o+4>>0]=a[k+(d[s+4>>0]|0)>>0]|0;a[o+5>>0]=a[k+(d[s+5>>0]|0)>>0]|0;a[o+6>>0]=a[k+(d[s+6>>0]|0)>>0]|0;if((n|0)<=1){v=o;w=s;break}a[o+7>>0]=a[k+(d[s+7>>0]|0)>>0]|0;o=o+8|0;n=n+-1|0;s=s+8|0}if(!p)break;else{p=p+-1|0;m=v+u|0;t=w+e|0}}return}default:{e=b;b=i;i=g;a:while(1){switch(l|0){case 1:{x=b;y=f;z=i;A=19;break}case 2:{B=b;C=f;D=i;A=18;break}case 6:{E=b;F=f;G=i;A=14;break}case 5:{H=b;I=f;J=i;A=15;break}case 4:{K=b;L=f;M=i;A=16;break}case 3:{N=b;O=f;P=i;A=17;break}default:{Q=b;R=i;A=20}}while(1)if((A|0)==14){A=0;a[E>>0]=a[k+(d[G>>0]|0)>>0]|0;H=E+1|0;I=F;J=G+1|0;A=15;continue}else if((A|0)==15){A=0;a[H>>0]=a[k+(d[J>>0]|0)>>0]|0;K=H+1|0;L=I;M=J+1|0;A=16;continue}else if((A|0)==16){A=0;a[K>>0]=a[k+(d[M>>0]|0)>>0]|0;N=K+1|0;O=L;P=M+1|0;A=17;continue}else if((A|0)==17){A=0;a[N>>0]=a[k+(d[P>>0]|0)>>0]|0;B=N+1|0;C=O;D=P+1|0;A=18;continue}else if((A|0)==18){A=0;a[B>>0]=a[k+(d[D>>0]|0)>>0]|0;x=B+1|0;y=C;z=D+1|0;A=19;continue}else if((A|0)==19){A=0;a[x>>0]=a[k+(d[z>>0]|0)>>0]|0;g=x+1|0;w=z+1|0;if((y|0)<=1){Q=g;R=w;A=20;continue}a[g>>0]=a[k+(d[w>>0]|0)>>0]|0;a[x+2>>0]=a[k+(d[z+2>>0]|0)>>0]|0;E=x+3|0;F=y+-1|0;G=z+3|0;A=14;continue}else if((A|0)==20){A=0;if(!e)break a;else{e=e+-1|0;b=Q+j|0;i=R+h|0;continue a}}}return}}}function $g(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;d=a+4|0;e=c[d>>2]|0;f=e&-8;g=a+f|0;h=c[3775]|0;i=e&3;if(!((i|0)!=1&a>>>0>=h>>>0&a>>>0<g>>>0))Zd();j=a+(f|4)|0;k=c[j>>2]|0;if(!(k&1))Zd();if(!i){if(b>>>0<256){l=0;return l|0}if(f>>>0>=(b+4|0)>>>0?(f-b|0)>>>0<=c[3891]<<1>>>0:0){l=a;return l|0}l=0;return l|0}if(f>>>0>=b>>>0){i=f-b|0;if(i>>>0<=15){l=a;return l|0}c[d>>2]=e&1|b|2;c[a+(b+4)>>2]=i|3;c[j>>2]=c[j>>2]|1;zg(a+b|0,i);l=a;return l|0}if((g|0)==(c[3777]|0)){i=(c[3774]|0)+f|0;if(i>>>0<=b>>>0){l=0;return l|0}j=i-b|0;c[d>>2]=e&1|b|2;c[a+(b+4)>>2]=j|1;c[3777]=a+b;c[3774]=j;l=a;return l|0}if((g|0)==(c[3776]|0)){j=(c[3773]|0)+f|0;if(j>>>0<b>>>0){l=0;return l|0}i=j-b|0;if(i>>>0>15){c[d>>2]=e&1|b|2;c[a+(b+4)>>2]=i|1;c[a+j>>2]=i;m=a+(j+4)|0;c[m>>2]=c[m>>2]&-2;n=a+b|0;o=i}else{c[d>>2]=e&1|j|2;i=a+(j+4)|0;c[i>>2]=c[i>>2]|1;n=0;o=0}c[3773]=o;c[3776]=n;l=a;return l|0}if(k&2){l=0;return l|0}n=(k&-8)+f|0;if(n>>>0<b>>>0){l=0;return l|0}o=n-b|0;i=k>>>3;do if(k>>>0>=256){j=c[a+(f+24)>>2]|0;m=c[a+(f+12)>>2]|0;do if((m|0)==(g|0)){p=a+(f+20)|0;q=c[p>>2]|0;if(!q){r=a+(f+16)|0;s=c[r>>2]|0;if(!s){t=0;break}else{u=s;v=r}}else{u=q;v=p}while(1){p=u+20|0;q=c[p>>2]|0;if(q){u=q;v=p;continue}p=u+16|0;q=c[p>>2]|0;if(!q){w=u;x=v;break}else{u=q;v=p}}if(x>>>0<h>>>0)Zd();else{c[x>>2]=0;t=w;break}}else{p=c[a+(f+8)>>2]|0;if(p>>>0<h>>>0)Zd();q=p+12|0;if((c[q>>2]|0)!=(g|0))Zd();r=m+8|0;if((c[r>>2]|0)==(g|0)){c[q>>2]=m;c[r>>2]=p;t=m;break}else Zd()}while(0);if(j){m=c[a+(f+28)>>2]|0;p=15388+(m<<2)|0;if((g|0)==(c[p>>2]|0)){c[p>>2]=t;if(!t){c[3772]=c[3772]&~(1<<m);break}}else{if(j>>>0<(c[3775]|0)>>>0)Zd();m=j+16|0;if((c[m>>2]|0)==(g|0))c[m>>2]=t;else c[j+20>>2]=t;if(!t)break}m=c[3775]|0;if(t>>>0<m>>>0)Zd();c[t+24>>2]=j;p=c[a+(f+16)>>2]|0;do if(p)if(p>>>0<m>>>0)Zd();else{c[t+16>>2]=p;c[p+24>>2]=t;break}while(0);p=c[a+(f+20)>>2]|0;if(p)if(p>>>0<(c[3775]|0)>>>0)Zd();else{c[t+20>>2]=p;c[p+24>>2]=t;break}}}else{p=c[a+(f+8)>>2]|0;m=c[a+(f+12)>>2]|0;j=15124+(i<<1<<2)|0;if((p|0)!=(j|0)){if(p>>>0<h>>>0)Zd();if((c[p+12>>2]|0)!=(g|0))Zd()}if((m|0)==(p|0)){c[3771]=c[3771]&~(1<<i);break}if((m|0)!=(j|0)){if(m>>>0<h>>>0)Zd();j=m+8|0;if((c[j>>2]|0)==(g|0))y=j;else Zd()}else y=m+8|0;c[p+12>>2]=m;c[y>>2]=p}while(0);if(o>>>0<16){c[d>>2]=n|e&1|2;y=a+(n|4)|0;c[y>>2]=c[y>>2]|1;l=a;return l|0}else{c[d>>2]=e&1|b|2;c[a+(b+4)>>2]=o|3;e=a+(n|4)|0;c[e>>2]=c[e>>2]|1;zg(a+b|0,o);l=a;return l|0}return 0}function Pg(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;n=i;i=i+112|0;o=n+108|0;p=n+96|0;q=n+92|0;r=n+80|0;s=n+68|0;t=n+56|0;u=n+52|0;v=n+40|0;w=n+36|0;x=n+24|0;y=n+12|0;z=n;if(b){b=Ds(e,18012)|0;A=c[b>>2]|0;if(d){yf[c[A+44>>2]&127](o,b);B=c[o>>2]|0;a[f>>0]=B;a[f+1>>0]=B>>8;a[f+2>>0]=B>>16;a[f+3>>0]=B>>24;yf[c[(c[b>>2]|0)+32>>2]&127](p,b);if(!(a[l>>0]&1))a[l>>0]=0;else c[c[l+8>>2]>>2]=0;c[l+4>>2]=0;Wl(l,0);c[l>>2]=c[p>>2];c[l+4>>2]=c[p+4>>2];c[l+8>>2]=c[p+8>>2];c[p>>2]=0;c[p+4>>2]=0;c[p+8>>2]=0;zu(p)}else{yf[c[A+40>>2]&127](q,b);A=c[q>>2]|0;a[f>>0]=A;a[f+1>>0]=A>>8;a[f+2>>0]=A>>16;a[f+3>>0]=A>>24;yf[c[(c[b>>2]|0)+28>>2]&127](r,b);if(!(a[l>>0]&1))a[l>>0]=0;else c[c[l+8>>2]>>2]=0;c[l+4>>2]=0;Wl(l,0);c[l>>2]=c[r>>2];c[l+4>>2]=c[r+4>>2];c[l+8>>2]=c[r+8>>2];c[r>>2]=0;c[r+4>>2]=0;c[r+8>>2]=0;zu(r)}c[g>>2]=Af[c[(c[b>>2]|0)+12>>2]&127](b)|0;c[h>>2]=Af[c[(c[b>>2]|0)+16>>2]&127](b)|0;yf[c[(c[b>>2]|0)+20>>2]&127](s,b);if(!(a[j>>0]&1)){a[j+1>>0]=0;a[j>>0]=0}else{a[c[j+8>>2]>>0]=0;c[j+4>>2]=0}Tl(j,0);c[j>>2]=c[s>>2];c[j+4>>2]=c[s+4>>2];c[j+8>>2]=c[s+8>>2];c[s>>2]=0;c[s+4>>2]=0;c[s+8>>2]=0;Au(s);yf[c[(c[b>>2]|0)+24>>2]&127](t,b);if(!(a[k>>0]&1))a[k>>0]=0;else c[c[k+8>>2]>>2]=0;c[k+4>>2]=0;Wl(k,0);c[k>>2]=c[t>>2];c[k+4>>2]=c[t+4>>2];c[k+8>>2]=c[t+8>>2];c[t>>2]=0;c[t+4>>2]=0;c[t+8>>2]=0;zu(t);C=Af[c[(c[b>>2]|0)+36>>2]&127](b)|0}else{b=Ds(e,17948)|0;e=c[b>>2]|0;if(d){yf[c[e+44>>2]&127](u,b);d=c[u>>2]|0;a[f>>0]=d;a[f+1>>0]=d>>8;a[f+2>>0]=d>>16;a[f+3>>0]=d>>24;yf[c[(c[b>>2]|0)+32>>2]&127](v,b);if(!(a[l>>0]&1))a[l>>0]=0;else c[c[l+8>>2]>>2]=0;c[l+4>>2]=0;Wl(l,0);c[l>>2]=c[v>>2];c[l+4>>2]=c[v+4>>2];c[l+8>>2]=c[v+8>>2];c[v>>2]=0;c[v+4>>2]=0;c[v+8>>2]=0;zu(v)}else{yf[c[e+40>>2]&127](w,b);e=c[w>>2]|0;a[f>>0]=e;a[f+1>>0]=e>>8;a[f+2>>0]=e>>16;a[f+3>>0]=e>>24;yf[c[(c[b>>2]|0)+28>>2]&127](x,b);if(!(a[l>>0]&1))a[l>>0]=0;else c[c[l+8>>2]>>2]=0;c[l+4>>2]=0;Wl(l,0);c[l>>2]=c[x>>2];c[l+4>>2]=c[x+4>>2];c[l+8>>2]=c[x+8>>2];c[x>>2]=0;c[x+4>>2]=0;c[x+8>>2]=0;zu(x)}c[g>>2]=Af[c[(c[b>>2]|0)+12>>2]&127](b)|0;c[h>>2]=Af[c[(c[b>>2]|0)+16>>2]&127](b)|0;yf[c[(c[b>>2]|0)+20>>2]&127](y,b);if(!(a[j>>0]&1)){a[j+1>>0]=0;a[j>>0]=0}else{a[c[j+8>>2]>>0]=0;c[j+4>>2]=0}Tl(j,0);c[j>>2]=c[y>>2];c[j+4>>2]=c[y+4>>2];c[j+8>>2]=c[y+8>>2];c[y>>2]=0;c[y+4>>2]=0;c[y+8>>2]=0;Au(y);yf[c[(c[b>>2]|0)+24>>2]&127](z,b);if(!(a[k>>0]&1))a[k>>0]=0;else c[c[k+8>>2]>>2]=0;c[k+4>>2]=0;Wl(k,0);c[k>>2]=c[z>>2];c[k+4>>2]=c[z+4>>2];c[k+8>>2]=c[z+8>>2];c[z>>2]=0;c[z+4>>2]=0;c[z+8>>2]=0;zu(z);C=Af[c[(c[b>>2]|0)+36>>2]&127](b)|0}c[m>>2]=C;i=n;return}function ah(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;k=i;i=i+16|0;l=k;m=Ds(j,18268)|0;n=Ds(j,18424)|0;yf[c[(c[n>>2]|0)+20>>2]&127](l,n);c[h>>2]=f;j=a[b>>0]|0;switch(j<<24>>24){case 43:case 45:{o=Nf[c[(c[m>>2]|0)+44>>2]&31](m,j)|0;j=c[h>>2]|0;c[h>>2]=j+4;c[j>>2]=o;p=b+1|0;break}default:p=b}o=e;a:do if((o-p|0)>1?(a[p>>0]|0)==48:0){j=p+1|0;switch(a[j>>0]|0){case 88:case 120:break;default:{q=4;break a}}r=Nf[c[(c[m>>2]|0)+44>>2]&31](m,48)|0;s=c[h>>2]|0;c[h>>2]=s+4;c[s>>2]=r;r=p+2|0;s=Nf[c[(c[m>>2]|0)+44>>2]&31](m,a[j>>0]|0)|0;j=c[h>>2]|0;c[h>>2]=j+4;c[j>>2]=s;if(r>>>0<e>>>0){s=r;while(1){j=a[s>>0]|0;if(!(sA(j,Ps()|0)|0)){t=r;u=s;break a}j=s+1|0;if(j>>>0<e>>>0)s=j;else{t=r;u=j;break}}}else{t=r;u=r}}else q=4;while(0);b:do if((q|0)==4)if(p>>>0<e>>>0){s=p;while(1){j=a[s>>0]|0;if(!(yz(j,Ps()|0)|0)){t=p;u=s;break b}j=s+1|0;if(j>>>0<e>>>0)s=j;else{t=p;u=j;break}}}else{t=p;u=p}while(0);p=a[l>>0]|0;q=l+4|0;if(((p&1)==0?(p&255)>>>1:c[q>>2]|0)|0){if((t|0)!=(u|0)?(p=u+-1|0,t>>>0<p>>>0):0){s=t;r=p;do{p=a[s>>0]|0;a[s>>0]=a[r>>0]|0;a[r>>0]=p;s=s+1|0;r=r+-1|0}while(s>>>0<r>>>0)}r=Af[c[(c[n>>2]|0)+16>>2]&127](n)|0;s=l+8|0;p=l+1|0;if(t>>>0<u>>>0){j=0;v=0;w=t;while(1){x=a[((a[l>>0]&1)==0?p:c[s>>2]|0)+v>>0]|0;if(x<<24>>24>0&(j|0)==(x<<24>>24|0)){x=c[h>>2]|0;c[h>>2]=x+4;c[x>>2]=r;x=a[l>>0]|0;y=0;z=(v>>>0<(((x&1)==0?(x&255)>>>1:c[q>>2]|0)+-1|0)>>>0&1)+v|0}else{y=j;z=v}x=Nf[c[(c[m>>2]|0)+44>>2]&31](m,a[w>>0]|0)|0;A=c[h>>2]|0;c[h>>2]=A+4;c[A>>2]=x;w=w+1|0;if(w>>>0>=u>>>0)break;else{j=y+1|0;v=z}}}z=f+(t-b<<2)|0;v=c[h>>2]|0;if((z|0)!=(v|0)){y=v+-4|0;if(z>>>0<y>>>0){j=z;w=y;do{y=c[j>>2]|0;c[j>>2]=c[w>>2];c[w>>2]=y;j=j+4|0;w=w+-4|0}while(j>>>0<w>>>0);B=m;C=v}else{B=m;C=v}}else{B=m;C=z}}else{Pf[c[(c[m>>2]|0)+48>>2]&15](m,t,u,c[h>>2]|0)|0;z=(c[h>>2]|0)+(u-t<<2)|0;c[h>>2]=z;B=m;C=z}c:do if(u>>>0<e>>>0){z=u;while(1){t=a[z>>0]|0;if(t<<24>>24==46){D=z;break}v=Nf[c[(c[B>>2]|0)+44>>2]&31](m,t)|0;t=c[h>>2]|0;w=t+4|0;c[h>>2]=w;c[t>>2]=v;v=z+1|0;if(v>>>0<e>>>0)z=v;else{E=w;F=v;break c}}z=Af[c[(c[n>>2]|0)+12>>2]&127](n)|0;v=c[h>>2]|0;w=v+4|0;c[h>>2]=w;c[v>>2]=z;E=w;F=D+1|0}else{E=C;F=u}while(0);Pf[c[(c[m>>2]|0)+48>>2]&15](m,F,e,E)|0;E=(c[h>>2]|0)+(o-F<<2)|0;c[h>>2]=E;c[g>>2]=(d|0)==(e|0)?E:f+(d-b<<2)|0;Au(l);i=k;return}function Bh(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;e=c[b+24>>2]|0;f=c[b+28>>2]|0;g=c[b+16>>2]|0;h=c[b+36>>2]|0;i=c[b+48>>2]|0;j=c[b+56>>2]|0;if(!f)return;k=(e+7|0)/8|0;l=e&7;e=f;f=c[b+20>>2]|0;m=c[b>>2]|0;a:while(1){b=e+-1|0;switch(l|0){case 0:{n=f;o=k;p=m;q=4;break}case 7:{r=f;s=k;t=m;q=7;break}case 6:{u=f;v=k;w=m;q=10;break}case 5:{x=f;y=k;z=m;q=13;break}case 4:{A=f;B=k;C=m;q=16;break}case 3:{D=f;E=k;F=m;q=19;break}case 2:{G=f;H=k;I=m;q=22;break}case 1:{J=f;K=k;L=m;q=25;break}default:{M=f;N=m;q=28}}while(1)if((q|0)==4){q=0;O=d[p>>0]|0;if((O|0)!=(j|0)){P=O<<2;O=P|1;a[n>>0]=a[i+P>>0]|0;a[n+1>>0]=a[i+O>>0]|0;a[n+2>>0]=a[i+(O+1)>>0]|0}r=n+3|0;s=o;t=p+1|0;q=7;continue}else if((q|0)==7){q=0;O=d[t>>0]|0;if((O|0)!=(j|0)){P=O<<2;O=P|1;a[r>>0]=a[i+P>>0]|0;a[r+1>>0]=a[i+O>>0]|0;a[r+2>>0]=a[i+(O+1)>>0]|0}u=r+3|0;v=s;w=t+1|0;q=10;continue}else if((q|0)==10){q=0;O=d[w>>0]|0;if((O|0)!=(j|0)){P=O<<2;O=P|1;a[u>>0]=a[i+P>>0]|0;a[u+1>>0]=a[i+O>>0]|0;a[u+2>>0]=a[i+(O+1)>>0]|0}x=u+3|0;y=v;z=w+1|0;q=13;continue}else if((q|0)==13){q=0;O=d[z>>0]|0;if((O|0)!=(j|0)){P=O<<2;O=P|1;a[x>>0]=a[i+P>>0]|0;a[x+1>>0]=a[i+O>>0]|0;a[x+2>>0]=a[i+(O+1)>>0]|0}A=x+3|0;B=y;C=z+1|0;q=16;continue}else if((q|0)==16){q=0;O=d[C>>0]|0;if((O|0)!=(j|0)){P=O<<2;O=P|1;a[A>>0]=a[i+P>>0]|0;a[A+1>>0]=a[i+O>>0]|0;a[A+2>>0]=a[i+(O+1)>>0]|0}D=A+3|0;E=B;F=C+1|0;q=19;continue}else if((q|0)==19){q=0;O=d[F>>0]|0;if((O|0)!=(j|0)){P=O<<2;O=P|1;a[D>>0]=a[i+P>>0]|0;a[D+1>>0]=a[i+O>>0]|0;a[D+2>>0]=a[i+(O+1)>>0]|0}G=D+3|0;H=E;I=F+1|0;q=22;continue}else if((q|0)==22){q=0;O=d[I>>0]|0;if((O|0)!=(j|0)){P=O<<2;O=P|1;a[G>>0]=a[i+P>>0]|0;a[G+1>>0]=a[i+O>>0]|0;a[G+2>>0]=a[i+(O+1)>>0]|0}J=G+3|0;K=H;L=I+1|0;q=25;continue}else if((q|0)==25){q=0;O=d[L>>0]|0;if((O|0)!=(j|0)){P=O<<2;O=P|1;a[J>>0]=a[i+P>>0]|0;a[J+1>>0]=a[i+O>>0]|0;a[J+2>>0]=a[i+(O+1)>>0]|0}O=L+1|0;P=J+3|0;if((K|0)>1){n=P;o=K+-1|0;p=O;q=4;continue}else{M=P;N=O;q=28;continue}}else if((q|0)==28){q=0;if(!b)break a;else{e=b;f=M+h|0;m=N+g|0;continue a}}}return}function Ah(f){f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;g=c[f+24>>2]|0;h=c[f+28>>2]|0;i=c[f+16>>2]|0;j=c[f+36>>2]|0;k=c[f+40>>2]|0;l=d[k+9>>0]|0;m=c[f+44>>2]|0;n=d[m+9>>0]|0;if(!h)return;o=(g|0)==0;p=m+28|0;q=m+32|0;r=m+29|0;s=m+33|0;t=m+30|0;u=m+34|0;v=m+31|0;w=m+35|0;m=k+12|0;x=k+32|0;y=k+28|0;z=k+16|0;A=k+33|0;B=k+29|0;C=k+20|0;D=k+34|0;E=k+30|0;F=k+24|0;G=k+35|0;H=k+31|0;k=ca(g,l)|0;I=ca(g,n)|0;J=h;h=c[f+20>>2]|0;K=c[f>>2]|0;while(1){J=J+-1|0;if(o){L=h;M=K}else{f=K+k|0;N=g;O=h;P=K;while(1){switch(l|0){case 1:{Q=d[P>>0]|0;R=d[(c[5452+((d[H>>0]|0)<<2)>>2]|0)+((c[F>>2]&Q)>>>(d[G>>0]|0))>>0]|0;S=d[(c[5452+((d[E>>0]|0)<<2)>>2]|0)+((c[C>>2]&Q)>>>(d[D>>0]|0))>>0]|0;T=d[(c[5452+((d[B>>0]|0)<<2)>>2]|0)+((c[z>>2]&Q)>>>(d[A>>0]|0))>>0]|0;U=d[(c[5452+((d[y>>0]|0)<<2)>>2]|0)+((Q&c[m>>2])>>>(d[x>>0]|0))>>0]|0;break}case 2:{Q=e[P>>1]|0;R=d[(c[5452+((d[H>>0]|0)<<2)>>2]|0)+((c[F>>2]&Q)>>>(d[G>>0]|0))>>0]|0;S=d[(c[5452+((d[E>>0]|0)<<2)>>2]|0)+((c[C>>2]&Q)>>>(d[D>>0]|0))>>0]|0;T=d[(c[5452+((d[B>>0]|0)<<2)>>2]|0)+((c[z>>2]&Q)>>>(d[A>>0]|0))>>0]|0;U=d[(c[5452+((d[y>>0]|0)<<2)>>2]|0)+((Q&c[m>>2])>>>(d[x>>0]|0))>>0]|0;break}case 3:{R=255;S=d[P+((d[D>>0]|0)>>>3&255)>>0]|0;T=d[P+((d[A>>0]|0)>>>3&255)>>0]|0;U=d[P+((d[x>>0]|0)>>>3&255)>>0]|0;break}case 4:{Q=c[P>>2]|0;R=d[(c[5452+((d[H>>0]|0)<<2)>>2]|0)+((c[F>>2]&Q)>>>(d[G>>0]|0))>>0]|0;S=d[(c[5452+((d[E>>0]|0)<<2)>>2]|0)+((c[C>>2]&Q)>>>(d[D>>0]|0))>>0]|0;T=d[(c[5452+((d[B>>0]|0)<<2)>>2]|0)+((c[z>>2]&Q)>>>(d[A>>0]|0))>>0]|0;U=d[(c[5452+((d[y>>0]|0)<<2)>>2]|0)+((c[m>>2]&Q)>>>(d[x>>0]|0))>>0]|0;break}default:{R=0;S=0;T=0;U=0}}switch(n|0){case 1:{a[O>>0]=T>>>(d[r>>0]|0)<<(d[s>>0]|0)|U>>>(d[p>>0]|0)<<(d[q>>0]|0)|S>>>(d[t>>0]|0)<<(d[u>>0]|0)|R>>>(d[v>>0]|0)<<(d[w>>0]|0);break}case 2:{b[O>>1]=T>>>(d[r>>0]|0)<<(d[s>>0]|0)|U>>>(d[p>>0]|0)<<(d[q>>0]|0)|S>>>(d[t>>0]|0)<<(d[u>>0]|0)|R>>>(d[v>>0]|0)<<(d[w>>0]|0);break}case 3:{a[O+((d[q>>0]|0)>>>3&255)>>0]=U;a[O+((d[s>>0]|0)>>>3&255)>>0]=T;a[O+((d[u>>0]|0)>>>3&255)>>0]=S;break}case 4:{c[O>>2]=T>>>(d[r>>0]|0)<<(d[s>>0]|0)|U>>>(d[p>>0]|0)<<(d[q>>0]|0)|S>>>(d[t>>0]|0)<<(d[u>>0]|0)|R>>>(d[v>>0]|0)<<(d[w>>0]|0);break}default:{}}N=N+-1|0;if(!N)break;else{O=O+n|0;P=P+l|0}}L=h+I|0;M=f}if(!J)break;else{h=L+j|0;K=M+i|0}}return}function Tg(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;n=i;i=i+112|0;o=n+100|0;p=n+88|0;q=n+76|0;r=n+64|0;s=n+52|0;t=n+48|0;u=n+36|0;v=n+24|0;w=n+12|0;x=n;if(b){b=Ds(d,17884)|0;yf[c[(c[b>>2]|0)+44>>2]&127](o,b);y=c[o>>2]|0;a[e>>0]=y;a[e+1>>0]=y>>8;a[e+2>>0]=y>>16;a[e+3>>0]=y>>24;yf[c[(c[b>>2]|0)+32>>2]&127](p,b);if(!(a[l>>0]&1)){a[l+1>>0]=0;a[l>>0]=0}else{a[c[l+8>>2]>>0]=0;c[l+4>>2]=0}Tl(l,0);c[l>>2]=c[p>>2];c[l+4>>2]=c[p+4>>2];c[l+8>>2]=c[p+8>>2];c[p>>2]=0;c[p+4>>2]=0;c[p+8>>2]=0;Au(p);yf[c[(c[b>>2]|0)+28>>2]&127](q,b);if(!(a[k>>0]&1)){a[k+1>>0]=0;a[k>>0]=0}else{a[c[k+8>>2]>>0]=0;c[k+4>>2]=0}Tl(k,0);c[k>>2]=c[q>>2];c[k+4>>2]=c[q+4>>2];c[k+8>>2]=c[q+8>>2];c[q>>2]=0;c[q+4>>2]=0;c[q+8>>2]=0;Au(q);a[f>>0]=Af[c[(c[b>>2]|0)+12>>2]&127](b)|0;a[g>>0]=Af[c[(c[b>>2]|0)+16>>2]&127](b)|0;yf[c[(c[b>>2]|0)+20>>2]&127](r,b);if(!(a[h>>0]&1)){a[h+1>>0]=0;a[h>>0]=0}else{a[c[h+8>>2]>>0]=0;c[h+4>>2]=0}Tl(h,0);c[h>>2]=c[r>>2];c[h+4>>2]=c[r+4>>2];c[h+8>>2]=c[r+8>>2];c[r>>2]=0;c[r+4>>2]=0;c[r+8>>2]=0;Au(r);yf[c[(c[b>>2]|0)+24>>2]&127](s,b);if(!(a[j>>0]&1)){a[j+1>>0]=0;a[j>>0]=0}else{a[c[j+8>>2]>>0]=0;c[j+4>>2]=0}Tl(j,0);c[j>>2]=c[s>>2];c[j+4>>2]=c[s+4>>2];c[j+8>>2]=c[s+8>>2];c[s>>2]=0;c[s+4>>2]=0;c[s+8>>2]=0;Au(s);z=Af[c[(c[b>>2]|0)+36>>2]&127](b)|0}else{b=Ds(d,17820)|0;yf[c[(c[b>>2]|0)+44>>2]&127](t,b);d=c[t>>2]|0;a[e>>0]=d;a[e+1>>0]=d>>8;a[e+2>>0]=d>>16;a[e+3>>0]=d>>24;yf[c[(c[b>>2]|0)+32>>2]&127](u,b);if(!(a[l>>0]&1)){a[l+1>>0]=0;a[l>>0]=0}else{a[c[l+8>>2]>>0]=0;c[l+4>>2]=0}Tl(l,0);c[l>>2]=c[u>>2];c[l+4>>2]=c[u+4>>2];c[l+8>>2]=c[u+8>>2];c[u>>2]=0;c[u+4>>2]=0;c[u+8>>2]=0;Au(u);yf[c[(c[b>>2]|0)+28>>2]&127](v,b);if(!(a[k>>0]&1)){a[k+1>>0]=0;a[k>>0]=0}else{a[c[k+8>>2]>>0]=0;c[k+4>>2]=0}Tl(k,0);c[k>>2]=c[v>>2];c[k+4>>2]=c[v+4>>2];c[k+8>>2]=c[v+8>>2];c[v>>2]=0;c[v+4>>2]=0;c[v+8>>2]=0;Au(v);a[f>>0]=Af[c[(c[b>>2]|0)+12>>2]&127](b)|0;a[g>>0]=Af[c[(c[b>>2]|0)+16>>2]&127](b)|0;yf[c[(c[b>>2]|0)+20>>2]&127](w,b);if(!(a[h>>0]&1)){a[h+1>>0]=0;a[h>>0]=0}else{a[c[h+8>>2]>>0]=0;c[h+4>>2]=0}Tl(h,0);c[h>>2]=c[w>>2];c[h+4>>2]=c[w+4>>2];c[h+8>>2]=c[w+8>>2];c[w>>2]=0;c[w+4>>2]=0;c[w+8>>2]=0;Au(w);yf[c[(c[b>>2]|0)+24>>2]&127](x,b);if(!(a[j>>0]&1)){a[j+1>>0]=0;a[j>>0]=0}else{a[c[j+8>>2]>>0]=0;c[j+4>>2]=0}Tl(j,0);c[j>>2]=c[x>>2];c[j+4>>2]=c[x+4>>2];c[j+8>>2]=c[x+8>>2];c[x>>2]=0;c[x+4>>2]=0;c[x+8>>2]=0;Au(x);z=Af[c[(c[b>>2]|0)+36>>2]&127](b)|0}c[m>>2]=z;i=n;return}function bh(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;g=c[a>>2]|0;do if(g){h=c[g+12>>2]|0;if((h|0)==(c[g+16>>2]|0))i=Af[c[(c[g>>2]|0)+36>>2]&127](g)|0;else i=c[h>>2]|0;if((i|0)==-1){c[a>>2]=0;j=1;break}else{j=(c[a>>2]|0)==0;break}}else j=1;while(0);i=c[b>>2]|0;do if(i){g=c[i+12>>2]|0;if((g|0)==(c[i+16>>2]|0))k=Af[c[(c[i>>2]|0)+36>>2]&127](i)|0;else k=c[g>>2]|0;if((k|0)!=-1)if(j){l=i;m=17;break}else{m=16;break}else{c[b>>2]=0;m=14;break}}else m=14;while(0);if((m|0)==14)if(j)m=16;else{l=0;m=17}a:do if((m|0)==16){c[d>>2]=c[d>>2]|6;n=0}else if((m|0)==17){j=c[a>>2]|0;i=c[j+12>>2]|0;if((i|0)==(c[j+16>>2]|0))o=Af[c[(c[j>>2]|0)+36>>2]&127](j)|0;else o=c[i>>2]|0;if(!(Ef[c[(c[e>>2]|0)+12>>2]&31](e,2048,o)|0)){c[d>>2]=c[d>>2]|4;n=0;break}i=(Ef[c[(c[e>>2]|0)+52>>2]&31](e,o,0)|0)<<24>>24;j=c[a>>2]|0;k=j+12|0;g=c[k>>2]|0;if((g|0)==(c[j+16>>2]|0)){Af[c[(c[j>>2]|0)+40>>2]&127](j)|0;p=f;q=l;r=l;s=i}else{c[k>>2]=g+4;p=f;q=l;r=l;s=i}while(1){i=s+-48|0;g=p+-1|0;k=c[a>>2]|0;do if(k){j=c[k+12>>2]|0;if((j|0)==(c[k+16>>2]|0))t=Af[c[(c[k>>2]|0)+36>>2]&127](k)|0;else t=c[j>>2]|0;if((t|0)==-1){c[a>>2]=0;u=1;break}else{u=(c[a>>2]|0)==0;break}}else u=1;while(0);do if(r){k=c[r+12>>2]|0;if((k|0)==(c[r+16>>2]|0))v=Af[c[(c[r>>2]|0)+36>>2]&127](r)|0;else v=c[k>>2]|0;if((v|0)==-1){c[b>>2]=0;w=0;x=0;y=1;break}else{w=q;x=q;y=(q|0)==0;break}}else{w=q;x=0;y=1}while(0);k=c[a>>2]|0;if(!((p|0)>1&(u^y))){z=k;A=w;B=i;break}j=c[k+12>>2]|0;if((j|0)==(c[k+16>>2]|0))C=Af[c[(c[k>>2]|0)+36>>2]&127](k)|0;else C=c[j>>2]|0;if(!(Ef[c[(c[e>>2]|0)+12>>2]&31](e,2048,C)|0)){n=i;break a}j=((Ef[c[(c[e>>2]|0)+52>>2]&31](e,C,0)|0)<<24>>24)+(i*10|0)|0;k=c[a>>2]|0;h=k+12|0;D=c[h>>2]|0;if((D|0)==(c[k+16>>2]|0)){Af[c[(c[k>>2]|0)+40>>2]&127](k)|0;p=g;q=w;r=x;s=j;continue}else{c[h>>2]=D+4;p=g;q=w;r=x;s=j;continue}}do if(z){j=c[z+12>>2]|0;if((j|0)==(c[z+16>>2]|0))E=Af[c[(c[z>>2]|0)+36>>2]&127](z)|0;else E=c[j>>2]|0;if((E|0)==-1){c[a>>2]=0;F=1;break}else{F=(c[a>>2]|0)==0;break}}else F=1;while(0);do if(A){j=c[A+12>>2]|0;if((j|0)==(c[A+16>>2]|0))G=Af[c[(c[A>>2]|0)+36>>2]&127](A)|0;else G=c[j>>2]|0;if((G|0)!=-1)if(F){n=B;break a}else break;else{c[b>>2]=0;m=60;break}}else m=60;while(0);if((m|0)==60?!F:0){n=B;break}c[d>>2]=c[d>>2]|2;n=B}while(0);return n|0}function gh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;k=i;i=i+16|0;l=k;m=Ds(j,18276)|0;n=Ds(j,18416)|0;yf[c[(c[n>>2]|0)+20>>2]&127](l,n);c[h>>2]=f;j=a[b>>0]|0;switch(j<<24>>24){case 43:case 45:{o=Nf[c[(c[m>>2]|0)+28>>2]&31](m,j)|0;j=c[h>>2]|0;c[h>>2]=j+1;a[j>>0]=o;p=b+1|0;break}default:p=b}o=e;a:do if((o-p|0)>1?(a[p>>0]|0)==48:0){j=p+1|0;switch(a[j>>0]|0){case 88:case 120:break;default:{q=4;break a}}r=Nf[c[(c[m>>2]|0)+28>>2]&31](m,48)|0;s=c[h>>2]|0;c[h>>2]=s+1;a[s>>0]=r;r=p+2|0;s=Nf[c[(c[m>>2]|0)+28>>2]&31](m,a[j>>0]|0)|0;j=c[h>>2]|0;c[h>>2]=j+1;a[j>>0]=s;if(r>>>0<e>>>0){s=r;while(1){j=a[s>>0]|0;if(!(sA(j,Ps()|0)|0)){t=r;u=s;break a}j=s+1|0;if(j>>>0<e>>>0)s=j;else{t=r;u=j;break}}}else{t=r;u=r}}else q=4;while(0);b:do if((q|0)==4)if(p>>>0<e>>>0){s=p;while(1){j=a[s>>0]|0;if(!(yz(j,Ps()|0)|0)){t=p;u=s;break b}j=s+1|0;if(j>>>0<e>>>0)s=j;else{t=p;u=j;break}}}else{t=p;u=p}while(0);p=a[l>>0]|0;q=l+4|0;if(((p&1)==0?(p&255)>>>1:c[q>>2]|0)|0){if((t|0)!=(u|0)?(p=u+-1|0,t>>>0<p>>>0):0){s=t;r=p;do{p=a[s>>0]|0;a[s>>0]=a[r>>0]|0;a[r>>0]=p;s=s+1|0;r=r+-1|0}while(s>>>0<r>>>0)}r=Af[c[(c[n>>2]|0)+16>>2]&127](n)|0;s=l+8|0;p=l+1|0;if(t>>>0<u>>>0){j=0;v=0;w=t;while(1){x=a[((a[l>>0]&1)==0?p:c[s>>2]|0)+v>>0]|0;if(x<<24>>24>0&(j|0)==(x<<24>>24|0)){x=c[h>>2]|0;c[h>>2]=x+1;a[x>>0]=r;x=a[l>>0]|0;y=0;z=(v>>>0<(((x&1)==0?(x&255)>>>1:c[q>>2]|0)+-1|0)>>>0&1)+v|0}else{y=j;z=v}x=Nf[c[(c[m>>2]|0)+28>>2]&31](m,a[w>>0]|0)|0;A=c[h>>2]|0;c[h>>2]=A+1;a[A>>0]=x;w=w+1|0;if(w>>>0>=u>>>0)break;else{j=y+1|0;v=z}}}z=f+(t-b)|0;v=c[h>>2]|0;if((z|0)!=(v|0)?(y=v+-1|0,z>>>0<y>>>0):0){v=z;z=y;do{y=a[v>>0]|0;a[v>>0]=a[z>>0]|0;a[z>>0]=y;v=v+1|0;z=z+-1|0}while(v>>>0<z>>>0);B=m}else B=m}else{Pf[c[(c[m>>2]|0)+32>>2]&15](m,t,u,c[h>>2]|0)|0;c[h>>2]=(c[h>>2]|0)+(u-t);B=m}c:do if(u>>>0<e>>>0){t=u;while(1){z=a[t>>0]|0;if(z<<24>>24==46){C=t;break}v=Nf[c[(c[B>>2]|0)+28>>2]&31](m,z)|0;z=c[h>>2]|0;c[h>>2]=z+1;a[z>>0]=v;v=t+1|0;if(v>>>0<e>>>0)t=v;else{D=v;break c}}t=Af[c[(c[n>>2]|0)+12>>2]&127](n)|0;v=c[h>>2]|0;c[h>>2]=v+1;a[v>>0]=t;D=C+1|0}else D=u;while(0);Pf[c[(c[m>>2]|0)+32>>2]&15](m,D,e,c[h>>2]|0)|0;m=(c[h>>2]|0)+(o-D)|0;c[h>>2]=m;c[g>>2]=(d|0)==(e|0)?m:f+(d-b)|0;Au(l);i=k;return}function jh(a,e,f,g,h){a=a|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;i=c[a>>2]|0;do if(i)if((c[i+12>>2]|0)==(c[i+16>>2]|0))if((Af[c[(c[i>>2]|0)+36>>2]&127](i)|0)==-1){c[a>>2]=0;j=0;break}else{j=c[a>>2]|0;break}else j=i;else j=0;while(0);i=(j|0)==0;j=c[e>>2]|0;do if(j){if((c[j+12>>2]|0)==(c[j+16>>2]|0)?(Af[c[(c[j>>2]|0)+36>>2]&127](j)|0)==-1:0){c[e>>2]=0;k=11;break}if(i){l=j;k=13}else k=12}else k=11;while(0);if((k|0)==11)if(i)k=12;else{l=0;k=13}a:do if((k|0)==12){c[f>>2]=c[f>>2]|6;m=0}else if((k|0)==13){i=c[a>>2]|0;j=c[i+12>>2]|0;if((j|0)==(c[i+16>>2]|0))n=Af[c[(c[i>>2]|0)+36>>2]&127](i)|0;else n=d[j>>0]|0;j=n&255;if(j<<24>>24>-1?(i=g+8|0,(b[(c[i>>2]|0)+(n<<24>>24<<1)>>1]&2048)!=0):0){o=(Ef[c[(c[g>>2]|0)+36>>2]&31](g,j,0)|0)<<24>>24;j=c[a>>2]|0;p=j+12|0;q=c[p>>2]|0;if((q|0)==(c[j+16>>2]|0)){Af[c[(c[j>>2]|0)+40>>2]&127](j)|0;r=h;s=l;t=l;u=o}else{c[p>>2]=q+1;r=h;s=l;t=l;u=o}while(1){o=u+-48|0;q=r+-1|0;p=c[a>>2]|0;do if(p)if((c[p+12>>2]|0)==(c[p+16>>2]|0))if((Af[c[(c[p>>2]|0)+36>>2]&127](p)|0)==-1){c[a>>2]=0;v=0;break}else{v=c[a>>2]|0;break}else v=p;else v=0;while(0);p=(v|0)==0;if(t)if((c[t+12>>2]|0)==(c[t+16>>2]|0))if((Af[c[(c[t>>2]|0)+36>>2]&127](t)|0)==-1){c[e>>2]=0;w=0;x=0}else{w=s;x=s}else{w=s;x=t}else{w=s;x=0}j=c[a>>2]|0;if(!((r|0)>1&(p^(x|0)==0))){y=j;z=w;A=o;break}p=c[j+12>>2]|0;if((p|0)==(c[j+16>>2]|0))B=Af[c[(c[j>>2]|0)+36>>2]&127](j)|0;else B=d[p>>0]|0;p=B&255;if(p<<24>>24<=-1){m=o;break a}if(!(b[(c[i>>2]|0)+(B<<24>>24<<1)>>1]&2048)){m=o;break a}j=((Ef[c[(c[g>>2]|0)+36>>2]&31](g,p,0)|0)<<24>>24)+(o*10|0)|0;p=c[a>>2]|0;C=p+12|0;D=c[C>>2]|0;if((D|0)==(c[p+16>>2]|0)){Af[c[(c[p>>2]|0)+40>>2]&127](p)|0;r=q;s=w;t=x;u=j;continue}else{c[C>>2]=D+1;r=q;s=w;t=x;u=j;continue}}do if(y)if((c[y+12>>2]|0)==(c[y+16>>2]|0))if((Af[c[(c[y>>2]|0)+36>>2]&127](y)|0)==-1){c[a>>2]=0;E=0;break}else{E=c[a>>2]|0;break}else E=y;else E=0;while(0);i=(E|0)==0;do if(z){if((c[z+12>>2]|0)==(c[z+16>>2]|0)?(Af[c[(c[z>>2]|0)+36>>2]&127](z)|0)==-1:0){c[e>>2]=0;k=50;break}if(i){m=A;break a}}else k=50;while(0);if((k|0)==50?!i:0){m=A;break}c[f>>2]=c[f>>2]|2;m=A;break}c[f>>2]=c[f>>2]|4;m=0}while(0);return m|0}function Wg(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;n=i;i=i+112|0;o=n+100|0;p=n+88|0;q=n+76|0;r=n+64|0;s=n+52|0;t=n+48|0;u=n+36|0;v=n+24|0;w=n+12|0;x=n;if(b){b=Ds(d,18012)|0;yf[c[(c[b>>2]|0)+44>>2]&127](o,b);y=c[o>>2]|0;a[e>>0]=y;a[e+1>>0]=y>>8;a[e+2>>0]=y>>16;a[e+3>>0]=y>>24;yf[c[(c[b>>2]|0)+32>>2]&127](p,b);if(!(a[l>>0]&1))a[l>>0]=0;else c[c[l+8>>2]>>2]=0;c[l+4>>2]=0;Wl(l,0);c[l>>2]=c[p>>2];c[l+4>>2]=c[p+4>>2];c[l+8>>2]=c[p+8>>2];c[p>>2]=0;c[p+4>>2]=0;c[p+8>>2]=0;zu(p);yf[c[(c[b>>2]|0)+28>>2]&127](q,b);if(!(a[k>>0]&1))a[k>>0]=0;else c[c[k+8>>2]>>2]=0;c[k+4>>2]=0;Wl(k,0);c[k>>2]=c[q>>2];c[k+4>>2]=c[q+4>>2];c[k+8>>2]=c[q+8>>2];c[q>>2]=0;c[q+4>>2]=0;c[q+8>>2]=0;zu(q);c[f>>2]=Af[c[(c[b>>2]|0)+12>>2]&127](b)|0;c[g>>2]=Af[c[(c[b>>2]|0)+16>>2]&127](b)|0;yf[c[(c[b>>2]|0)+20>>2]&127](r,b);if(!(a[h>>0]&1)){a[h+1>>0]=0;a[h>>0]=0}else{a[c[h+8>>2]>>0]=0;c[h+4>>2]=0}Tl(h,0);c[h>>2]=c[r>>2];c[h+4>>2]=c[r+4>>2];c[h+8>>2]=c[r+8>>2];c[r>>2]=0;c[r+4>>2]=0;c[r+8>>2]=0;Au(r);yf[c[(c[b>>2]|0)+24>>2]&127](s,b);if(!(a[j>>0]&1))a[j>>0]=0;else c[c[j+8>>2]>>2]=0;c[j+4>>2]=0;Wl(j,0);c[j>>2]=c[s>>2];c[j+4>>2]=c[s+4>>2];c[j+8>>2]=c[s+8>>2];c[s>>2]=0;c[s+4>>2]=0;c[s+8>>2]=0;zu(s);z=Af[c[(c[b>>2]|0)+36>>2]&127](b)|0}else{b=Ds(d,17948)|0;yf[c[(c[b>>2]|0)+44>>2]&127](t,b);d=c[t>>2]|0;a[e>>0]=d;a[e+1>>0]=d>>8;a[e+2>>0]=d>>16;a[e+3>>0]=d>>24;yf[c[(c[b>>2]|0)+32>>2]&127](u,b);if(!(a[l>>0]&1))a[l>>0]=0;else c[c[l+8>>2]>>2]=0;c[l+4>>2]=0;Wl(l,0);c[l>>2]=c[u>>2];c[l+4>>2]=c[u+4>>2];c[l+8>>2]=c[u+8>>2];c[u>>2]=0;c[u+4>>2]=0;c[u+8>>2]=0;zu(u);yf[c[(c[b>>2]|0)+28>>2]&127](v,b);if(!(a[k>>0]&1))a[k>>0]=0;else c[c[k+8>>2]>>2]=0;c[k+4>>2]=0;Wl(k,0);c[k>>2]=c[v>>2];c[k+4>>2]=c[v+4>>2];c[k+8>>2]=c[v+8>>2];c[v>>2]=0;c[v+4>>2]=0;c[v+8>>2]=0;zu(v);c[f>>2]=Af[c[(c[b>>2]|0)+12>>2]&127](b)|0;c[g>>2]=Af[c[(c[b>>2]|0)+16>>2]&127](b)|0;yf[c[(c[b>>2]|0)+20>>2]&127](w,b);if(!(a[h>>0]&1)){a[h+1>>0]=0;a[h>>0]=0}else{a[c[h+8>>2]>>0]=0;c[h+4>>2]=0}Tl(h,0);c[h>>2]=c[w>>2];c[h+4>>2]=c[w+4>>2];c[h+8>>2]=c[w+8>>2];c[w>>2]=0;c[w+4>>2]=0;c[w+8>>2]=0;Au(w);yf[c[(c[b>>2]|0)+24>>2]&127](x,b);if(!(a[j>>0]&1))a[j>>0]=0;else c[c[j+8>>2]>>2]=0;c[j+4>>2]=0;Wl(j,0);c[j>>2]=c[x>>2];c[j+4>>2]=c[x+4>>2];c[j+8>>2]=c[x+8>>2];c[x>>2]=0;c[x+4>>2]=0;c[x+8>>2]=0;zu(x);z=Af[c[(c[b>>2]|0)+36>>2]&127](b)|0}c[m>>2]=z;i=n;return}function Nh(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;a:do switch(a|0){case 4:{f=304088064;return f|0}case 8:{if(!b){f=318769153;return f|0}if((b|0)==224&(c|0)==28&(d|0)==3&(e|0)==0){f=336660481;return f|0}break}case 12:{if(!b){f=353504258;return f|0}if((b|0)==3840&(c|0)==240&(d|0)==15&(e|0)==0){f=353504258;return f|0}break}case 15:{if(!b){f=353570562;return f|0}else g=9;break}case 16:{if(!b){f=353701890;return f|0}else g=9;break}case 24:{if((b|0)<255){switch(b|0){case 0:{f=390076419;break}default:{g=24;break a}}return f|0}if((b|0)>=16711680){switch(b|0){case 16711680:{f=390076419;break}default:{g=24;break a}}return f|0}switch(b|0){case 255:break;default:{g=24;break a}}f=386930691;return f|0}case 32:{if(!b){f=370546692;return f|0}else g=24;break}case 1:{f=287310080;return f|0}default:{}}while(0);if((g|0)==9){a=(c|0)==992;h=(d|0)==31;i=(b|0)==31744&a&h;j=(e|0)==0;if(i&j){f=353570562;return f|0}k=(b|0)==31;l=k&a&(d|0)==31744;if(l&j){f=357764866;return f|0}a=(c|0)==240;m=(e|0)==61440;if((b|0)==3840&a&(d|0)==15&m){f=355602434;return f|0}n=(c|0)==3840;o=(e|0)==15;if((b|0)==61440&n&(d|0)==240&o){f=356651010;return f|0}if((b|0)==15&a&(d|0)==3840&m){f=359796738;return f|0}if((b|0)==240&n&(d|0)==61440&o){f=360845314;return f|0}o=(e|0)==32768;if(i&o){f=355667970;return f|0}i=(b|0)==63488;n=(c|0)==1984;m=(e|0)==1;if(i&n&(d|0)==62&m){f=356782082;return f|0}if(l&o){f=359862274;return f|0}o=(d|0)==63488;if((b|0)==62&n&o&m){f=360976386;return f|0}m=(c|0)==2016;if(i&m&h&j){f=353701890;return f|0}if(k&m&o&j){f=357896194;return f|0}}else if((g|0)==24){g=(c|0)==65280;j=(b|0)==16711680&g&(d|0)==255;o=(e|0)==0;if(j&o){f=370546692;return f|0}m=(c|0)==16711680;k=(b|0)==-16777216&m&(d|0)==65280;if(k&o){f=371595268;return f|0}h=(b|0)==255&g&(d|0)==16711680;if(h&o){f=374740996;return f|0}g=(b|0)==65280&m&(d|0)==-16777216;if(g&o){f=375789572;return f|0}o=(e|0)==-16777216;if(j&o){f=372645892;return f|0}j=(e|0)==255;if(k&j){f=373694468;return f|0}if(h&o){f=376840196;return f|0}if(g&j){f=377888772;return f|0}if((b|0)==1072693248&(c|0)==1047552&(d|0)==1023&(e|0)==-1073741824){f=372711428;return f|0}}f=0;return f|0}function Gh(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;e=c[b+4>>2]|0;f=c[b+52>>2]|0;b=c[(c[f>>2]|0)+4>>2]|0;g=a[b+8>>0]|0;if((g&255)<8){h=0;return h|0}switch(c[f+68>>2]&-28673|0){case 0:{if(g<<24>>24==8){a:do if((a[e+9>>0]|0)==4){g=c[e+12>>2]|0;if((g|0)<1072693248){switch(g|0){case 16711680:break;default:break a}if((c[e+16>>2]|0)!=65280)break;if((c[e+20>>2]|0)==255)h=262;else break;return h|0}else{switch(g|0){case 1072693248:break;default:break a}if((c[e+16>>2]|0)!=1047552)break;if((c[e+20>>2]|0)==1023)h=263;else break;return h|0}}while(0);h=264;return h|0}if(!(c[b+24>>2]|0))i=1;else i=(c[e+24>>2]|0)!=0?4:2;g=e+9|0;j=c[5616+((d[g>>0]|0)+-1<<2)>>2]|0;k=c[j+12>>2]|0;b:do if(!k)l=0;else{m=e+12|0;n=e+16|0;o=e+20|0;p=b+12|0;q=b+16|0;r=b+20|0;s=b+9|0;t=k;u=0;while(1){v=c[j+(u*40|0)>>2]|0;if((((((((((v|0)==0?1:(c[m>>2]|0)==(v|0))?(v=c[j+(u*40|0)+4>>2]|0,(v|0)==0?1:(c[n>>2]|0)==(v|0)):0)?(v=c[j+(u*40|0)+8>>2]|0,(v|0)==0?1:(c[o>>2]|0)==(v|0)):0)?(v=c[j+(u*40|0)+16>>2]|0,(v|0)==0?1:(c[p>>2]|0)==(v|0)):0)?(v=c[j+(u*40|0)+20>>2]|0,(v|0)==0?1:(c[q>>2]|0)==(v|0)):0)?(v=c[j+(u*40|0)+24>>2]|0,(v|0)==0?1:(c[r>>2]|0)==(v|0)):0)?(d[s>>0]|0)==(t|0):0)?(c[j+(u*40|0)+36>>2]&i|0)==(i|0):0)?(v=j+(u*40|0)+28|0,w=c[v>>2]|0,x=(nq()|0)!=0&w,(x|0)==(c[v>>2]|0)):0){l=u;break b}v=u+1|0;t=c[j+(v*40|0)+12>>2]|0;if(!t){l=v;break}else u=v}}while(0);k=c[j+(l*40|0)+32>>2]|0;if((k|0)!=143){h=k;return h|0}if((c[e>>2]|0)==372711428){h=265;return h|0}if((c[b>>2]|0)==372711428){h=266;return h|0}if((a[g>>0]|0)!=4){y=(i|0)==4;z=y?261:143;return z|0}if((a[b+9>>0]|0)!=4){y=(i|0)==4;z=y?261:143;return z|0}if((c[e+12>>2]|0)!=(c[b+12>>2]|0)){y=(i|0)==4;z=y?261:143;return z|0}if((c[e+16>>2]|0)!=(c[b+16>>2]|0)){y=(i|0)==4;z=y?261:143;return z|0}if((c[e+20>>2]|0)==(c[b+20>>2]|0)){h=267;return h|0}else{y=(i|0)==4;z=y?261:143;return z|0}break}case 256:{if((a[e+9>>0]|0)==2?(c[f+4>>2]|0)!=0:0){h=268;return h|0}if((a[b+9>>0]|0)==1){h=269;return h|0}if((c[e+24>>2]|0)!=0?(c[b+24>>2]|0)!=0:0){h=270;return h|0}h=271;return h|0}default:{h=0;return h|0}}return 0}function Fh(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;e=c[b+24>>2]|0;f=c[b+28>>2]|0;g=c[b+16>>2]|0;h=c[b+36>>2]|0;i=c[b+48>>2]|0;if(!f)return;j=(e+7|0)/8|0;k=e&7;e=f;f=c[b+20>>2]|0;l=c[b>>2]|0;a:while(1){b=e+-1|0;switch(k|0){case 0:{m=f;n=j;o=l;p=4;break}case 7:{q=f;r=j;s=l;p=5;break}case 6:{t=f;u=j;v=l;p=6;break}case 5:{w=f;x=j;y=l;p=7;break}case 4:{z=f;A=j;B=l;p=8;break}case 3:{C=f;D=j;E=l;p=9;break}case 2:{F=f;G=j;H=l;p=10;break}case 1:{I=f;J=j;K=l;p=11;break}default:{L=f;M=l;p=12}}while(1)if((p|0)==4){p=0;N=(d[o>>0]|0)<<2;O=N|1;a[m>>0]=a[i+N>>0]|0;a[m+1>>0]=a[i+O>>0]|0;a[m+2>>0]=a[i+(O+1)>>0]|0;q=m+3|0;r=n;s=o+1|0;p=5;continue}else if((p|0)==5){p=0;O=(d[s>>0]|0)<<2;N=O|1;a[q>>0]=a[i+O>>0]|0;a[q+1>>0]=a[i+N>>0]|0;a[q+2>>0]=a[i+(N+1)>>0]|0;t=q+3|0;u=r;v=s+1|0;p=6;continue}else if((p|0)==6){p=0;N=(d[v>>0]|0)<<2;O=N|1;a[t>>0]=a[i+N>>0]|0;a[t+1>>0]=a[i+O>>0]|0;a[t+2>>0]=a[i+(O+1)>>0]|0;w=t+3|0;x=u;y=v+1|0;p=7;continue}else if((p|0)==7){p=0;O=(d[y>>0]|0)<<2;N=O|1;a[w>>0]=a[i+O>>0]|0;a[w+1>>0]=a[i+N>>0]|0;a[w+2>>0]=a[i+(N+1)>>0]|0;z=w+3|0;A=x;B=y+1|0;p=8;continue}else if((p|0)==8){p=0;N=(d[B>>0]|0)<<2;O=N|1;a[z>>0]=a[i+N>>0]|0;a[z+1>>0]=a[i+O>>0]|0;a[z+2>>0]=a[i+(O+1)>>0]|0;C=z+3|0;D=A;E=B+1|0;p=9;continue}else if((p|0)==9){p=0;O=(d[E>>0]|0)<<2;N=O|1;a[C>>0]=a[i+O>>0]|0;a[C+1>>0]=a[i+N>>0]|0;a[C+2>>0]=a[i+(N+1)>>0]|0;F=C+3|0;G=D;H=E+1|0;p=10;continue}else if((p|0)==10){p=0;N=(d[H>>0]|0)<<2;O=N|1;a[F>>0]=a[i+N>>0]|0;a[F+1>>0]=a[i+O>>0]|0;a[F+2>>0]=a[i+(O+1)>>0]|0;I=F+3|0;J=G;K=H+1|0;p=11;continue}else if((p|0)==11){p=0;O=(d[K>>0]|0)<<2;N=O|1;a[I>>0]=a[i+O>>0]|0;a[I+1>>0]=a[i+N>>0]|0;a[I+2>>0]=a[i+(N+1)>>0]|0;N=K+1|0;O=I+3|0;if((J|0)>1){m=O;n=J+-1|0;o=N;p=4;continue}else{L=O;M=N;p=12;continue}}else if((p|0)==12){p=0;if(!b)break a;else{e=b;f=L+h|0;l=M+g|0;continue a}}}return}function Ch(a,b){a=+a;b=+b;var d=0,e=0,f=0,g=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,H=0,I=0,J=0,K=0.0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0.0;h[k>>3]=a;d=c[k>>2]|0;e=c[k+4>>2]|0;h[k>>3]=b;f=c[k>>2]|0;g=c[k+4>>2]|0;i=Gs(d|0,e|0,52)|0;j=i&2047;i=Gs(f|0,g|0,52)|0;l=i&2047;i=e&-2147483648;m=Es(f|0,g|0,1)|0;n=G;if(!((m|0)==0&(n|0)==0)?(o=g&2147483647,!(o>>>0>2146435072|(o|0)==2146435072&f>>>0>0|(j|0)==2047)):0){o=Es(d|0,e|0,1)|0;p=G;if(!(p>>>0>n>>>0|(p|0)==(n|0)&o>>>0>m>>>0))return +((o|0)==(m|0)&(p|0)==(n|0)?a*0.0:a);if(!j){n=Es(d|0,e|0,12)|0;p=G;if((p|0)>-1|(p|0)==-1&n>>>0>4294967295){m=n;n=p;p=0;while(1){o=p+-1|0;m=Es(m|0,n|0,1)|0;n=G;if(!((n|0)>-1|(n|0)==-1&m>>>0>4294967295)){q=o;break}else p=o}}else q=0;p=Es(d|0,e|0,1-q|0)|0;r=p;s=G;t=q}else{r=d;s=e&1048575|1048576;t=j}if(!l){j=Es(f|0,g|0,12)|0;e=G;if((e|0)>-1|(e|0)==-1&j>>>0>4294967295){d=j;j=e;e=0;while(1){q=e+-1|0;d=Es(d|0,j|0,1)|0;j=G;if(!((j|0)>-1|(j|0)==-1&d>>>0>4294967295)){u=q;break}else e=q}}else u=0;e=Es(f|0,g|0,1-u|0)|0;v=e;w=G;x=u}else{v=f;w=g&1048575|1048576;x=l}l=Fs(r|0,s|0,v|0,w|0)|0;g=G;f=(g|0)>-1|(g|0)==-1&l>>>0>4294967295;a:do if((t|0)>(x|0)){u=f;e=l;d=g;j=r;q=s;p=t;while(1){if(u)if((j|0)==(v|0)&(q|0)==(w|0))break;else{y=e;z=d}else{y=j;z=q}m=Es(y|0,z|0,1)|0;n=G;o=p+-1|0;A=Fs(m|0,n|0,v|0,w|0)|0;B=G;C=(B|0)>-1|(B|0)==-1&A>>>0>4294967295;if((o|0)>(x|0)){u=C;e=A;d=B;j=m;q=n;p=o}else{D=C;E=m;F=n;H=A;I=B;J=o;break a}}K=a*0.0;return +K}else{D=f;E=r;F=s;H=l;I=g;J=t}while(0);if(D)if((E|0)==(v|0)&(F|0)==(w|0)){K=a*0.0;return +K}else{L=I;M=H}else{L=F;M=E}if(L>>>0<1048576|(L|0)==1048576&M>>>0<0){E=M;F=L;H=J;while(1){I=Es(E|0,F|0,1)|0;w=G;v=H+-1|0;if(w>>>0<1048576|(w|0)==1048576&I>>>0<0){E=I;F=w;H=v}else{N=I;O=w;P=v;break}}}else{N=M;O=L;P=J}if((P|0)>0){J=tt(N|0,O|0,0,-1048576)|0;L=G;M=Es(P|0,0,52)|0;Q=L|G;R=J|M}else{M=Gs(N|0,O|0,1-P|0)|0;Q=G;R=M}c[k>>2]=R;c[k+4>>2]=Q|i;K=+h[k>>3];return +K}S=a*b;K=S/S;return +K}function Jh(b,c,e,f,g){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;h=c;if((((g&4|0)!=0?(h-b|0)>2:0)?(a[b>>0]|0)==-17:0)?(a[b+1>>0]|0)==-69:0)i=(a[b+2>>0]|0)==-65?b+3|0:b;else i=b;a:do if((e|0)!=0&i>>>0<c>>>0){g=i;j=0;b:while(1){k=a[g>>0]|0;l=k&255;if(l>>>0>f>>>0){m=g;n=42;break a}do if(k<<24>>24>-1){o=g+1|0;p=j}else{if((k&255)<194){m=g;n=42;break a}if((k&255)<224){if((h-g|0)<2){m=g;n=42;break a}q=d[g+1>>0]|0;if((q&192|0)!=128){m=g;n=42;break a}if((q&63|l<<6&1984)>>>0>f>>>0){m=g;n=42;break a}o=g+2|0;p=j;break}if((k&255)<240){q=g;if((h-q|0)<3){m=g;n=42;break a}r=a[g+1>>0]|0;s=a[g+2>>0]|0;switch(l|0){case 224:{if((r&-32)<<24>>24!=-96){t=q;n=20;break b}break}case 237:{if((r&-32)<<24>>24!=-128){u=q;n=22;break b}break}default:if((r&-64)<<24>>24!=-128){v=q;n=24;break b}}q=s&255;if((q&192|0)!=128){m=g;n=42;break a}if(((r&255)<<6&4032|l<<12&61440|q&63)>>>0>f>>>0){m=g;n=42;break a}o=g+3|0;p=j;break}if((k&255)>=245){m=g;n=42;break a}q=g;if((e-j|0)>>>0<2|(h-q|0)<4){m=g;n=42;break a}r=a[g+1>>0]|0;s=a[g+2>>0]|0;w=a[g+3>>0]|0;switch(l|0){case 240:{if((r+112&255)>=48){x=q;n=32;break b}break}case 244:{if((r&-16)<<24>>24!=-128){y=q;n=34;break b}break}default:if((r&-64)<<24>>24!=-128){z=q;n=36;break b}}q=s&255;if((q&192|0)!=128){m=g;n=42;break a}s=w&255;if((s&192|0)!=128){m=g;n=42;break a}if(((r&255)<<12&258048|l<<18&1835008|q<<6&4032|s&63)>>>0>f>>>0){m=g;n=42;break a}o=g+4|0;p=j+1|0}while(0);j=p+1|0;if(!(j>>>0<e>>>0&o>>>0<c>>>0)){m=o;n=42;break a}else g=o}if((n|0)==20){A=t-b|0;break}else if((n|0)==22){A=u-b|0;break}else if((n|0)==24){A=v-b|0;break}else if((n|0)==32){A=x-b|0;break}else if((n|0)==34){A=y-b|0;break}else if((n|0)==36){A=z-b|0;break}}else{m=i;n=42}while(0);if((n|0)==42)A=m-b|0;return A|0}function Dh(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,H=0;g=a;h=b;i=h;j=d;k=e;l=k;if(!i){m=(f|0)!=0;if(!l){if(m){c[f>>2]=(g>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(g>>>0)/(j>>>0)>>>0;return (G=n,o)|0}else{if(!m){n=0;o=0;return (G=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=b&0;n=0;o=0;return (G=n,o)|0}}m=(l|0)==0;do if(j){if(!m){p=(ea(l|0)|0)-(ea(i|0)|0)|0;if(p>>>0<=31){q=p+1|0;r=31-p|0;s=p-31>>31;t=q;u=g>>>(q>>>0)&s|i<<r;v=i>>>(q>>>0)&s;w=0;x=g<<r;break}if(!f){n=0;o=0;return (G=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=h|b&0;n=0;o=0;return (G=n,o)|0}r=j-1|0;if(r&j){s=(ea(j|0)|0)+33-(ea(i|0)|0)|0;q=64-s|0;p=32-s|0;y=p>>31;z=s-32|0;A=z>>31;t=s;u=p-1>>31&i>>>(z>>>0)|(i<<p|g>>>(s>>>0))&A;v=A&i>>>(s>>>0);w=g<<q&y;x=(i<<q|g>>>(z>>>0))&y|g<<p&s-33>>31;break}if(f){c[f>>2]=r&g;c[f+4>>2]=0}if((j|0)==1){n=h|b&0;o=a|0|0;return (G=n,o)|0}else{r=Gq(j|0)|0;n=i>>>(r>>>0)|0;o=i<<32-r|g>>>(r>>>0)|0;return (G=n,o)|0}}else{if(m){if(f){c[f>>2]=(i>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(i>>>0)/(j>>>0)>>>0;return (G=n,o)|0}if(!g){if(f){c[f>>2]=0;c[f+4>>2]=(i>>>0)%(l>>>0)}n=0;o=(i>>>0)/(l>>>0)>>>0;return (G=n,o)|0}r=l-1|0;if(!(r&l)){if(f){c[f>>2]=a|0;c[f+4>>2]=r&i|b&0}n=0;o=i>>>((Gq(l|0)|0)>>>0);return (G=n,o)|0}r=(ea(l|0)|0)-(ea(i|0)|0)|0;if(r>>>0<=30){s=r+1|0;p=31-r|0;t=s;u=i<<p|g>>>(s>>>0);v=i>>>(s>>>0);w=0;x=g<<p;break}if(!f){n=0;o=0;return (G=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=h|b&0;n=0;o=0;return (G=n,o)|0}while(0);if(!t){B=x;C=w;D=v;E=u;F=0;H=0}else{b=d|0|0;d=k|e&0;e=tt(b|0,d|0,-1,-1)|0;k=G;h=x;x=w;w=v;v=u;u=t;t=0;do{a=h;h=x>>>31|h<<1;x=t|x<<1;g=v<<1|a>>>31|0;a=v>>>31|w<<1|0;Fs(e,k,g,a)|0;i=G;l=i>>31|((i|0)<0?-1:0)<<1;t=l&1;v=Fs(g,a,l&b,(((i|0)<0?-1:0)>>31|((i|0)<0?-1:0)<<1)&d)|0;w=G;u=u-1|0}while((u|0)!=0);B=h;C=x;D=w;E=v;F=0;H=t}t=C;C=0;if(f){c[f>>2]=E;c[f+4>>2]=D}n=(t|0)>>>31|(B|C)<<1|(C<<1|t>>>31)&0|F;o=(t<<1|0>>>31)&-2|H;return (G=n,o)|0}function fh(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0;b=i;i=i+352|0;k=b+208|0;l=b+40|0;m=b+36|0;n=b+24|0;o=b+12|0;p=b+8|0;q=b+48|0;r=b+4|0;s=b;t=b+337|0;u=b+336|0;on(n,f,k,l,m);c[o>>2]=0;c[o+4>>2]=0;c[o+8>>2]=0;if(!(a[o>>0]&1))v=10;else v=(c[o>>2]&-2)+-1|0;$o(o,v,0);v=o+8|0;f=o+1|0;w=(a[o>>0]&1)==0?f:c[v>>2]|0;c[p>>2]=w;c[r>>2]=q;c[s>>2]=0;a[t>>0]=1;a[u>>0]=69;x=o+4|0;y=c[l>>2]|0;l=c[m>>2]|0;m=c[d>>2]|0;z=w;a:while(1){if(m){w=c[m+12>>2]|0;if((w|0)==(c[m+16>>2]|0))A=Af[c[(c[m>>2]|0)+36>>2]&127](m)|0;else A=c[w>>2]|0;if((A|0)==-1){c[d>>2]=0;B=0;C=1}else{B=m;C=0}}else{B=0;C=1}w=c[e>>2]|0;do if(w){D=c[w+12>>2]|0;if((D|0)==(c[w+16>>2]|0))E=Af[c[(c[w>>2]|0)+36>>2]&127](w)|0;else E=c[D>>2]|0;if((E|0)!=-1)if(C){F=w;break}else{G=B;H=w;I=z;break a}else{c[e>>2]=0;J=16;break}}else J=16;while(0);if((J|0)==16){J=0;if(C){G=B;H=0;I=z;break}else F=0}w=a[o>>0]|0;D=(w&1)==0?(w&255)>>>1:c[x>>2]|0;if((c[p>>2]|0)==(z+D|0)){$o(o,D<<1,0);if(!(a[o>>0]&1))K=10;else K=(c[o>>2]&-2)+-1|0;$o(o,K,0);w=(a[o>>0]&1)==0?f:c[v>>2]|0;c[p>>2]=w+D;L=w}else L=z;w=B+12|0;D=c[w>>2]|0;M=B+16|0;if((D|0)==(c[M>>2]|0))N=Af[c[(c[B>>2]|0)+36>>2]&127](B)|0;else N=c[D>>2]|0;if(vj(N,t,u,L,p,y,l,n,q,r,s,k)|0){G=B;H=F;I=L;break}D=c[w>>2]|0;if((D|0)==(c[M>>2]|0)){Af[c[(c[B>>2]|0)+40>>2]&127](B)|0;m=B;z=L;continue}else{c[w>>2]=D+4;m=B;z=L;continue}}L=a[n>>0]|0;z=c[r>>2]|0;if(!((a[t>>0]|0)==0?1:(((L&1)==0?(L&255)>>>1:c[n+4>>2]|0)|0)==0)?(z-q|0)<160:0){L=c[s>>2]|0;s=z+4|0;c[r>>2]=s;c[z>>2]=L;O=s}else O=z;h[j>>3]=+Qn(I,c[p>>2]|0,g);Nk(n,q,O,g);if(G){O=c[G+12>>2]|0;if((O|0)==(c[G+16>>2]|0))P=Af[c[(c[G>>2]|0)+36>>2]&127](G)|0;else P=c[O>>2]|0;if((P|0)==-1){c[d>>2]=0;Q=1}else Q=0}else Q=1;do if(H){P=c[H+12>>2]|0;if((P|0)==(c[H+16>>2]|0))R=Af[c[(c[H>>2]|0)+36>>2]&127](H)|0;else R=c[P>>2]|0;if((R|0)!=-1)if(Q)break;else{J=46;break}else{c[e>>2]=0;J=44;break}}else J=44;while(0);if((J|0)==44?Q:0)J=46;if((J|0)==46)c[g>>2]=c[g>>2]|2;g=c[d>>2]|0;Au(o);Au(n);i=b;return g|0}function eh(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0;b=i;i=i+352|0;k=b+208|0;l=b+40|0;m=b+36|0;n=b+24|0;o=b+12|0;p=b+8|0;q=b+48|0;r=b+4|0;s=b;t=b+337|0;u=b+336|0;on(n,f,k,l,m);c[o>>2]=0;c[o+4>>2]=0;c[o+8>>2]=0;if(!(a[o>>0]&1))v=10;else v=(c[o>>2]&-2)+-1|0;$o(o,v,0);v=o+8|0;f=o+1|0;w=(a[o>>0]&1)==0?f:c[v>>2]|0;c[p>>2]=w;c[r>>2]=q;c[s>>2]=0;a[t>>0]=1;a[u>>0]=69;x=o+4|0;y=c[l>>2]|0;l=c[m>>2]|0;m=c[d>>2]|0;z=w;a:while(1){if(m){w=c[m+12>>2]|0;if((w|0)==(c[m+16>>2]|0))A=Af[c[(c[m>>2]|0)+36>>2]&127](m)|0;else A=c[w>>2]|0;if((A|0)==-1){c[d>>2]=0;B=0;C=1}else{B=m;C=0}}else{B=0;C=1}w=c[e>>2]|0;do if(w){D=c[w+12>>2]|0;if((D|0)==(c[w+16>>2]|0))E=Af[c[(c[w>>2]|0)+36>>2]&127](w)|0;else E=c[D>>2]|0;if((E|0)!=-1)if(C){F=w;break}else{G=B;H=w;I=z;break a}else{c[e>>2]=0;J=16;break}}else J=16;while(0);if((J|0)==16){J=0;if(C){G=B;H=0;I=z;break}else F=0}w=a[o>>0]|0;D=(w&1)==0?(w&255)>>>1:c[x>>2]|0;if((c[p>>2]|0)==(z+D|0)){$o(o,D<<1,0);if(!(a[o>>0]&1))K=10;else K=(c[o>>2]&-2)+-1|0;$o(o,K,0);w=(a[o>>0]&1)==0?f:c[v>>2]|0;c[p>>2]=w+D;L=w}else L=z;w=B+12|0;D=c[w>>2]|0;M=B+16|0;if((D|0)==(c[M>>2]|0))N=Af[c[(c[B>>2]|0)+36>>2]&127](B)|0;else N=c[D>>2]|0;if(vj(N,t,u,L,p,y,l,n,q,r,s,k)|0){G=B;H=F;I=L;break}D=c[w>>2]|0;if((D|0)==(c[M>>2]|0)){Af[c[(c[B>>2]|0)+40>>2]&127](B)|0;m=B;z=L;continue}else{c[w>>2]=D+4;m=B;z=L;continue}}L=a[n>>0]|0;z=c[r>>2]|0;if(!((a[t>>0]|0)==0?1:(((L&1)==0?(L&255)>>>1:c[n+4>>2]|0)|0)==0)?(z-q|0)<160:0){L=c[s>>2]|0;s=z+4|0;c[r>>2]=s;c[z>>2]=L;O=s}else O=z;h[j>>3]=+Pn(I,c[p>>2]|0,g);Nk(n,q,O,g);if(G){O=c[G+12>>2]|0;if((O|0)==(c[G+16>>2]|0))P=Af[c[(c[G>>2]|0)+36>>2]&127](G)|0;else P=c[O>>2]|0;if((P|0)==-1){c[d>>2]=0;Q=1}else Q=0}else Q=1;do if(H){P=c[H+12>>2]|0;if((P|0)==(c[H+16>>2]|0))R=Af[c[(c[H>>2]|0)+36>>2]&127](H)|0;else R=c[P>>2]|0;if((R|0)!=-1)if(Q)break;else{J=46;break}else{c[e>>2]=0;J=44;break}}else J=44;while(0);if((J|0)==44?Q:0)J=46;if((J|0)==46)c[g>>2]=c[g>>2]|2;g=c[d>>2]|0;Au(o);Au(n);i=b;return g|0}function dh(b,d,e,f,h,j){b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0;b=i;i=i+352|0;k=b+208|0;l=b+40|0;m=b+36|0;n=b+24|0;o=b+12|0;p=b+8|0;q=b+48|0;r=b+4|0;s=b;t=b+337|0;u=b+336|0;on(n,f,k,l,m);c[o>>2]=0;c[o+4>>2]=0;c[o+8>>2]=0;if(!(a[o>>0]&1))v=10;else v=(c[o>>2]&-2)+-1|0;$o(o,v,0);v=o+8|0;f=o+1|0;w=(a[o>>0]&1)==0?f:c[v>>2]|0;c[p>>2]=w;c[r>>2]=q;c[s>>2]=0;a[t>>0]=1;a[u>>0]=69;x=o+4|0;y=c[l>>2]|0;l=c[m>>2]|0;m=c[d>>2]|0;z=w;a:while(1){if(m){w=c[m+12>>2]|0;if((w|0)==(c[m+16>>2]|0))A=Af[c[(c[m>>2]|0)+36>>2]&127](m)|0;else A=c[w>>2]|0;if((A|0)==-1){c[d>>2]=0;B=0;C=1}else{B=m;C=0}}else{B=0;C=1}w=c[e>>2]|0;do if(w){D=c[w+12>>2]|0;if((D|0)==(c[w+16>>2]|0))E=Af[c[(c[w>>2]|0)+36>>2]&127](w)|0;else E=c[D>>2]|0;if((E|0)!=-1)if(C){F=w;break}else{G=B;H=w;I=z;break a}else{c[e>>2]=0;J=16;break}}else J=16;while(0);if((J|0)==16){J=0;if(C){G=B;H=0;I=z;break}else F=0}w=a[o>>0]|0;D=(w&1)==0?(w&255)>>>1:c[x>>2]|0;if((c[p>>2]|0)==(z+D|0)){$o(o,D<<1,0);if(!(a[o>>0]&1))K=10;else K=(c[o>>2]&-2)+-1|0;$o(o,K,0);w=(a[o>>0]&1)==0?f:c[v>>2]|0;c[p>>2]=w+D;L=w}else L=z;w=B+12|0;D=c[w>>2]|0;M=B+16|0;if((D|0)==(c[M>>2]|0))N=Af[c[(c[B>>2]|0)+36>>2]&127](B)|0;else N=c[D>>2]|0;if(vj(N,t,u,L,p,y,l,n,q,r,s,k)|0){G=B;H=F;I=L;break}D=c[w>>2]|0;if((D|0)==(c[M>>2]|0)){Af[c[(c[B>>2]|0)+40>>2]&127](B)|0;m=B;z=L;continue}else{c[w>>2]=D+4;m=B;z=L;continue}}L=a[n>>0]|0;z=c[r>>2]|0;if(!((a[t>>0]|0)==0?1:(((L&1)==0?(L&255)>>>1:c[n+4>>2]|0)|0)==0)?(z-q|0)<160:0){L=c[s>>2]|0;s=z+4|0;c[r>>2]=s;c[z>>2]=L;O=s}else O=z;g[j>>2]=+Zn(I,c[p>>2]|0,h);Nk(n,q,O,h);if(G){O=c[G+12>>2]|0;if((O|0)==(c[G+16>>2]|0))P=Af[c[(c[G>>2]|0)+36>>2]&127](G)|0;else P=c[O>>2]|0;if((P|0)==-1){c[d>>2]=0;Q=1}else Q=0}else Q=1;do if(H){P=c[H+12>>2]|0;if((P|0)==(c[H+16>>2]|0))R=Af[c[(c[H>>2]|0)+36>>2]&127](H)|0;else R=c[P>>2]|0;if((R|0)!=-1)if(Q)break;else{J=46;break}else{c[e>>2]=0;J=44;break}}else J=44;while(0);if((J|0)==44?Q:0)J=46;if((J|0)==46)c[h>>2]=c[h>>2]|2;h=c[d>>2]|0;Au(o);Au(n);i=b;return h|0}function Mh(b,c,e,f,g){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;h=c;if((((g&4|0)!=0?(h-b|0)>2:0)?(a[b>>0]|0)==-17:0)?(a[b+1>>0]|0)==-69:0)i=(a[b+2>>0]|0)==-65?b+3|0:b;else i=b;a:do if((e|0)!=0&i>>>0<c>>>0){g=i;j=0;b:while(1){k=a[g>>0]|0;l=k&255;do if(k<<24>>24>-1){if(l>>>0>f>>>0){m=g;n=42;break a}o=g+1|0}else{if((k&255)<194){m=g;n=42;break a}if((k&255)<224){if((h-g|0)<2){m=g;n=42;break a}p=d[g+1>>0]|0;if((p&192|0)!=128){m=g;n=42;break a}if((p&63|l<<6&1984)>>>0>f>>>0){m=g;n=42;break a}o=g+2|0;break}if((k&255)<240){p=g;if((h-p|0)<3){m=g;n=42;break a}q=a[g+1>>0]|0;r=a[g+2>>0]|0;switch(l|0){case 224:{if((q&-32)<<24>>24!=-96){s=p;n=20;break b}break}case 237:{if((q&-32)<<24>>24!=-128){t=p;n=22;break b}break}default:if((q&-64)<<24>>24!=-128){u=p;n=24;break b}}p=r&255;if((p&192|0)!=128){m=g;n=42;break a}if(((q&255)<<6&4032|l<<12&61440|p&63)>>>0>f>>>0){m=g;n=42;break a}o=g+3|0;break}if((k&255)>=245){m=g;n=42;break a}p=g;if((h-p|0)<4){m=g;n=42;break a}q=a[g+1>>0]|0;r=a[g+2>>0]|0;v=a[g+3>>0]|0;switch(l|0){case 240:{if((q+112&255)>=48){w=p;n=32;break b}break}case 244:{if((q&-16)<<24>>24!=-128){x=p;n=34;break b}break}default:if((q&-64)<<24>>24!=-128){y=p;n=36;break b}}p=r&255;if((p&192|0)!=128){m=g;n=42;break a}r=v&255;if((r&192|0)!=128){m=g;n=42;break a}if(((q&255)<<12&258048|l<<18&1835008|p<<6&4032|r&63)>>>0>f>>>0){m=g;n=42;break a}o=g+4|0}while(0);j=j+1|0;if(!(j>>>0<e>>>0&o>>>0<c>>>0)){m=o;n=42;break a}else g=o}if((n|0)==20){z=s-b|0;break}else if((n|0)==22){z=t-b|0;break}else if((n|0)==24){z=u-b|0;break}else if((n|0)==32){z=w-b|0;break}else if((n|0)==34){z=x-b|0;break}else if((n|0)==36){z=y-b|0;break}}else{m=i;n=42}while(0);if((n|0)==42)z=m-b|0;return z|0}function Lh(e,f,g,h,i,j,k,l){e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;c[g>>2]=e;c[j>>2]=h;if(l&4){l=c[g>>2]|0;e=f;if((((e-l|0)>2?(a[l>>0]|0)==-17:0)?(a[l+1>>0]|0)==-69:0)?(a[l+2>>0]|0)==-65:0){c[g>>2]=l+3;m=c[j>>2]|0;n=e}else{m=h;n=e}}else{m=h;n=f}h=i;e=c[g>>2]|0;l=e>>>0<f>>>0;a:do if(l&m>>>0<i>>>0){o=e;p=m;while(1){q=a[o>>0]|0;r=q&255;if(r>>>0>k>>>0){s=2;break a}do if(q<<24>>24>-1){b[p>>1]=q&255;c[g>>2]=o+1}else{if((q&255)<194){s=2;break a}if((q&255)<224){if((n-o|0)<2){s=1;break a}t=d[o+1>>0]|0;if((t&192|0)!=128){s=2;break a}u=t&63|r<<6&1984;if(u>>>0>k>>>0){s=2;break a}b[p>>1]=u;c[g>>2]=o+2;break}if((q&255)<240){if((n-o|0)<3){s=1;break a}u=a[o+1>>0]|0;t=a[o+2>>0]|0;switch(r|0){case 224:{if((u&-32)<<24>>24!=-96){s=2;break a}break}case 237:{if((u&-32)<<24>>24!=-128){s=2;break a}break}default:if((u&-64)<<24>>24!=-128){s=2;break a}}v=t&255;if((v&192|0)!=128){s=2;break a}t=(u&255)<<6&4032|r<<12|v&63;if((t&65535)>>>0>k>>>0){s=2;break a}b[p>>1]=t;c[g>>2]=o+3;break}if((q&255)>=245){s=2;break a}if((n-o|0)<4){s=1;break a}t=a[o+1>>0]|0;v=a[o+2>>0]|0;u=a[o+3>>0]|0;switch(r|0){case 240:{if((t+112&255)>=48){s=2;break a}break}case 244:{if((t&-16)<<24>>24!=-128){s=2;break a}break}default:if((t&-64)<<24>>24!=-128){s=2;break a}}w=v&255;if((w&192|0)!=128){s=2;break a}v=u&255;if((v&192|0)!=128){s=2;break a}if((h-p|0)<4){s=1;break a}u=r&7;x=t&255;t=w<<6;y=v&63;if((x<<12&258048|u<<18|t&4032|y)>>>0>k>>>0){s=2;break a}b[p>>1]=x<<2&60|w>>>4&3|((x>>>4&3|u<<2)<<6)+16320|55296;u=p+2|0;c[j>>2]=u;b[u>>1]=y|t&960|56320;c[g>>2]=(c[g>>2]|0)+4}while(0);p=(c[j>>2]|0)+2|0;c[j>>2]=p;o=c[g>>2]|0;r=o>>>0<f>>>0;if(!(r&p>>>0<i>>>0)){z=r;A=39;break}}}else{z=l;A=39}while(0);if((A|0)==39)s=z&1;return s|0}function Sh(){var b=0,d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0;b=i;i=i+64|0;d=b+24|0;e=b+16|0;f=b+8|0;g=b;j=b+32|0;a[22537]=0;if(!(c[2]|0)){i=b;return 22537}k=j+1|0;l=j+30|0;m=1023;n=0;o=12;p=22537;a:while(1){q=m;r=o;s=p;b:while(1){t=r;c:while(1){u=a[t>>0]|0;switch(u<<24>>24){case 0:{v=s;break a;break}case 37:break;default:{w=u;x=t;y=20;break c}}a[j>>0]=37;u=t;z=t+1|0;A=k;while(1){B=a[z>>0]|0;if(B<<24>>24!=46){if(B<<24>>24<=47){C=u;D=B;E=A;y=9;break}if(B<<24>>24>=58){F=u;G=B;H=A;y=11;break}}I=z+1|0;J=A+1|0;a[A>>0]=B;if(A>>>0<l>>>0){B=z;z=I;A=J;u=B}else{K=I;L=A;M=J;break}}if((y|0)==9){y=0;a[E>>0]=D;K=C+2|0;L=E;M=E+1|0}else if((y|0)==11){y=0;a[H>>0]=G;K=F+2|0;L=H;M=H+1|0}a[M>>0]=0;switch(a[L>>0]|0){case 88:case 120:case 111:case 117:case 100:case 105:case 99:{N=q;O=K;P=s;y=15;break b;break}case 102:{Q=q;R=K;S=s;y=17;break b;break}case 112:{T=q;U=K;V=s;y=18;break b;break}case 115:{W=q;X=K;Y=s;y=19;break b;break}case 37:{Z=K;_=37;break c;break}default:t=K}}if((y|0)==20){y=0;Z=x+1|0;_=w}a[s>>0]=_;t=s+1|0;q=q+-1|0;if(!q){v=t;break a}else{r=Z;s=t}}if((y|0)==15){y=0;c[g>>2]=c[144+(n<<7)>>2];s=Dr(P,N,j,g)|0;$=N;aa=s;ba=O;ca=P+s|0}else if((y|0)==17){y=0;h[f>>3]=+h[144+(n<<7)>>3];s=Dr(S,Q,j,f)|0;$=Q;aa=s;ba=R;ca=S+s|0}else if((y|0)==18){y=0;c[e>>2]=c[144+(n<<7)>>2];s=Dr(V,T,j,e)|0;$=T;aa=s;ba=U;ca=V+s|0}else if((y|0)==19){y=0;c[d>>2]=144+(n<<7);s=Dr(Y,W,j,d)|0;$=W;aa=s;ba=X;ca=Y+s|0}if(($|0)==(aa|0)){v=ca;break}else{m=$-aa|0;n=n+1|0;o=ba;p=ca}}a[v>>0]=0;i=b;return 22537}function ih(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;b=i;i=i+320|0;j=b+208|0;k=b+200|0;l=b+24|0;m=b+12|0;n=b+8|0;o=b+40|0;p=b+4|0;q=b;r=xr(f)|0;Tn(l,f,j,k);c[m>>2]=0;c[m+4>>2]=0;c[m+8>>2]=0;if(!(a[m>>0]&1))s=10;else s=(c[m>>2]&-2)+-1|0;$o(m,s,0);s=m+8|0;f=m+1|0;t=(a[m>>0]&1)==0?f:c[s>>2]|0;c[n>>2]=t;c[p>>2]=o;c[q>>2]=0;u=m+4|0;v=c[k>>2]|0;k=c[d>>2]|0;w=t;a:while(1){if(k){t=c[k+12>>2]|0;if((t|0)==(c[k+16>>2]|0))x=Af[c[(c[k>>2]|0)+36>>2]&127](k)|0;else x=c[t>>2]|0;if((x|0)==-1){c[d>>2]=0;y=0;z=1}else{y=k;z=0}}else{y=0;z=1}t=c[e>>2]|0;do if(t){A=c[t+12>>2]|0;if((A|0)==(c[t+16>>2]|0))B=Af[c[(c[t>>2]|0)+36>>2]&127](t)|0;else B=c[A>>2]|0;if((B|0)!=-1)if(z){C=t;break}else{D=y;E=t;F=w;break a}else{c[e>>2]=0;H=16;break}}else H=16;while(0);if((H|0)==16){H=0;if(z){D=y;E=0;F=w;break}else C=0}t=a[m>>0]|0;A=(t&1)==0?(t&255)>>>1:c[u>>2]|0;if((c[n>>2]|0)==(w+A|0)){$o(m,A<<1,0);if(!(a[m>>0]&1))I=10;else I=(c[m>>2]&-2)+-1|0;$o(m,I,0);t=(a[m>>0]&1)==0?f:c[s>>2]|0;c[n>>2]=t+A;J=t}else J=w;t=y+12|0;A=c[t>>2]|0;K=y+16|0;if((A|0)==(c[K>>2]|0))L=Af[c[(c[y>>2]|0)+36>>2]&127](y)|0;else L=c[A>>2]|0;if(xk(L,r,J,n,q,v,l,o,p,j)|0){D=y;E=C;F=J;break}A=c[t>>2]|0;if((A|0)==(c[K>>2]|0)){Af[c[(c[y>>2]|0)+40>>2]&127](y)|0;k=y;w=J;continue}else{c[t>>2]=A+4;k=y;w=J;continue}}J=a[l>>0]|0;w=c[p>>2]|0;if((((J&1)==0?(J&255)>>>1:c[l+4>>2]|0)|0)!=0?(w-o|0)<160:0){J=c[q>>2]|0;q=w+4|0;c[p>>2]=q;c[w>>2]=J;M=q}else M=w;w=Nm(F,c[n>>2]|0,g,r)|0;r=h;c[r>>2]=w;c[r+4>>2]=G;Nk(l,o,M,g);if(D){M=c[D+12>>2]|0;if((M|0)==(c[D+16>>2]|0))N=Af[c[(c[D>>2]|0)+36>>2]&127](D)|0;else N=c[M>>2]|0;if((N|0)==-1){c[d>>2]=0;O=1}else O=0}else O=1;do if(E){N=c[E+12>>2]|0;if((N|0)==(c[E+16>>2]|0))P=Af[c[(c[E>>2]|0)+36>>2]&127](E)|0;else P=c[N>>2]|0;if((P|0)!=-1)if(O)break;else{H=46;break}else{c[e>>2]=0;H=44;break}}else H=44;while(0);if((H|0)==44?O:0)H=46;if((H|0)==46)c[g>>2]=c[g>>2]|2;g=c[d>>2]|0;Au(m);Au(l);i=b;return g|0}function hh(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;b=i;i=i+320|0;j=b+208|0;k=b+200|0;l=b+24|0;m=b+12|0;n=b+8|0;o=b+40|0;p=b+4|0;q=b;r=xr(f)|0;Tn(l,f,j,k);c[m>>2]=0;c[m+4>>2]=0;c[m+8>>2]=0;if(!(a[m>>0]&1))s=10;else s=(c[m>>2]&-2)+-1|0;$o(m,s,0);s=m+8|0;f=m+1|0;t=(a[m>>0]&1)==0?f:c[s>>2]|0;c[n>>2]=t;c[p>>2]=o;c[q>>2]=0;u=m+4|0;v=c[k>>2]|0;k=c[d>>2]|0;w=t;a:while(1){if(k){t=c[k+12>>2]|0;if((t|0)==(c[k+16>>2]|0))x=Af[c[(c[k>>2]|0)+36>>2]&127](k)|0;else x=c[t>>2]|0;if((x|0)==-1){c[d>>2]=0;y=0;z=1}else{y=k;z=0}}else{y=0;z=1}t=c[e>>2]|0;do if(t){A=c[t+12>>2]|0;if((A|0)==(c[t+16>>2]|0))B=Af[c[(c[t>>2]|0)+36>>2]&127](t)|0;else B=c[A>>2]|0;if((B|0)!=-1)if(z){C=t;break}else{D=y;E=t;F=w;break a}else{c[e>>2]=0;H=16;break}}else H=16;while(0);if((H|0)==16){H=0;if(z){D=y;E=0;F=w;break}else C=0}t=a[m>>0]|0;A=(t&1)==0?(t&255)>>>1:c[u>>2]|0;if((c[n>>2]|0)==(w+A|0)){$o(m,A<<1,0);if(!(a[m>>0]&1))I=10;else I=(c[m>>2]&-2)+-1|0;$o(m,I,0);t=(a[m>>0]&1)==0?f:c[s>>2]|0;c[n>>2]=t+A;J=t}else J=w;t=y+12|0;A=c[t>>2]|0;K=y+16|0;if((A|0)==(c[K>>2]|0))L=Af[c[(c[y>>2]|0)+36>>2]&127](y)|0;else L=c[A>>2]|0;if(xk(L,r,J,n,q,v,l,o,p,j)|0){D=y;E=C;F=J;break}A=c[t>>2]|0;if((A|0)==(c[K>>2]|0)){Af[c[(c[y>>2]|0)+40>>2]&127](y)|0;k=y;w=J;continue}else{c[t>>2]=A+4;k=y;w=J;continue}}J=a[l>>0]|0;w=c[p>>2]|0;if((((J&1)==0?(J&255)>>>1:c[l+4>>2]|0)|0)!=0?(w-o|0)<160:0){J=c[q>>2]|0;q=w+4|0;c[p>>2]=q;c[w>>2]=J;M=q}else M=w;w=Ym(F,c[n>>2]|0,g,r)|0;r=h;c[r>>2]=w;c[r+4>>2]=G;Nk(l,o,M,g);if(D){M=c[D+12>>2]|0;if((M|0)==(c[D+16>>2]|0))N=Af[c[(c[D>>2]|0)+36>>2]&127](D)|0;else N=c[M>>2]|0;if((N|0)==-1){c[d>>2]=0;O=1}else O=0}else O=1;do if(E){N=c[E+12>>2]|0;if((N|0)==(c[E+16>>2]|0))P=Af[c[(c[E>>2]|0)+36>>2]&127](E)|0;else P=c[N>>2]|0;if((P|0)!=-1)if(O)break;else{H=46;break}else{c[e>>2]=0;H=44;break}}else H=44;while(0);if((H|0)==44?O:0)H=46;if((H|0)==46)c[g>>2]=c[g>>2]|2;g=c[d>>2]|0;Au(m);Au(l);i=b;return g|0}function ph(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;b=i;i=i+320|0;j=b;k=b+208|0;l=b+192|0;m=b+28|0;n=b+16|0;o=b+12|0;p=b+32|0;q=b+8|0;r=b+4|0;c[l>>2]=0;c[l+4>>2]=0;c[l+8>>2]=0;s=Hs(f)|0;c[m>>2]=s;f=Ds(m,18268)|0;Pf[c[(c[f>>2]|0)+48>>2]&15](f,32305,32331,k)|0;lr(s)|0;c[n>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;if(!(a[n>>0]&1))t=10;else t=(c[n>>2]&-2)+-1|0;$o(n,t,0);t=n+8|0;s=n+1|0;f=(a[n>>0]&1)==0?s:c[t>>2]|0;c[o>>2]=f;c[q>>2]=p;c[r>>2]=0;m=n+4|0;u=c[d>>2]|0;v=f;a:while(1){if(u){f=c[u+12>>2]|0;if((f|0)==(c[u+16>>2]|0))w=Af[c[(c[u>>2]|0)+36>>2]&127](u)|0;else w=c[f>>2]|0;if((w|0)==-1){c[d>>2]=0;x=0;y=1}else{x=u;y=0}}else{x=0;y=1}f=c[e>>2]|0;do if(f){z=c[f+12>>2]|0;if((z|0)==(c[f+16>>2]|0))A=Af[c[(c[f>>2]|0)+36>>2]&127](f)|0;else A=c[z>>2]|0;if((A|0)!=-1)if(y){B=f;break}else{C=x;D=f;E=v;break a}else{c[e>>2]=0;F=16;break}}else F=16;while(0);if((F|0)==16){F=0;if(y){C=x;D=0;E=v;break}else B=0}f=a[n>>0]|0;z=(f&1)==0?(f&255)>>>1:c[m>>2]|0;if((c[o>>2]|0)==(v+z|0)){$o(n,z<<1,0);if(!(a[n>>0]&1))G=10;else G=(c[n>>2]&-2)+-1|0;$o(n,G,0);f=(a[n>>0]&1)==0?s:c[t>>2]|0;c[o>>2]=f+z;H=f}else H=v;f=x+12|0;z=c[f>>2]|0;I=x+16|0;if((z|0)==(c[I>>2]|0))J=Af[c[(c[x>>2]|0)+36>>2]&127](x)|0;else J=c[z>>2]|0;if(xk(J,16,H,o,r,0,l,p,q,k)|0){C=x;D=B;E=H;break}z=c[f>>2]|0;if((z|0)==(c[I>>2]|0)){Af[c[(c[x>>2]|0)+40>>2]&127](x)|0;u=x;v=H;continue}else{c[f>>2]=z+4;u=x;v=H;continue}}$o(n,(c[o>>2]|0)-E|0,0);E=(a[n>>0]&1)==0?s:c[t>>2]|0;t=Ps()|0;c[j>>2]=h;if((Dq(E,t,33689,j)|0)!=1)c[g>>2]=4;if(C){j=c[C+12>>2]|0;if((j|0)==(c[C+16>>2]|0))K=Af[c[(c[C>>2]|0)+36>>2]&127](C)|0;else K=c[j>>2]|0;if((K|0)==-1){c[d>>2]=0;L=1}else L=0}else L=1;do if(D){K=c[D+12>>2]|0;if((K|0)==(c[D+16>>2]|0))M=Af[c[(c[D>>2]|0)+36>>2]&127](D)|0;else M=c[K>>2]|0;if((M|0)!=-1)if(L)break;else{F=45;break}else{c[e>>2]=0;F=43;break}}else F=43;while(0);if((F|0)==43?L:0)F=45;if((F|0)==45)c[g>>2]=c[g>>2]|2;g=c[d>>2]|0;Au(n);Au(l);i=b;return g|0}function nh(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;b=i;i=i+320|0;j=b+208|0;k=b+200|0;l=b+24|0;m=b+12|0;n=b+8|0;o=b+40|0;p=b+4|0;q=b;r=xr(f)|0;Tn(l,f,j,k);c[m>>2]=0;c[m+4>>2]=0;c[m+8>>2]=0;if(!(a[m>>0]&1))s=10;else s=(c[m>>2]&-2)+-1|0;$o(m,s,0);s=m+8|0;f=m+1|0;t=(a[m>>0]&1)==0?f:c[s>>2]|0;c[n>>2]=t;c[p>>2]=o;c[q>>2]=0;u=m+4|0;v=c[k>>2]|0;k=c[d>>2]|0;w=t;a:while(1){if(k){t=c[k+12>>2]|0;if((t|0)==(c[k+16>>2]|0))x=Af[c[(c[k>>2]|0)+36>>2]&127](k)|0;else x=c[t>>2]|0;if((x|0)==-1){c[d>>2]=0;y=0;z=1}else{y=k;z=0}}else{y=0;z=1}t=c[e>>2]|0;do if(t){A=c[t+12>>2]|0;if((A|0)==(c[t+16>>2]|0))B=Af[c[(c[t>>2]|0)+36>>2]&127](t)|0;else B=c[A>>2]|0;if((B|0)!=-1)if(z){C=t;break}else{D=y;E=t;F=w;break a}else{c[e>>2]=0;G=16;break}}else G=16;while(0);if((G|0)==16){G=0;if(z){D=y;E=0;F=w;break}else C=0}t=a[m>>0]|0;A=(t&1)==0?(t&255)>>>1:c[u>>2]|0;if((c[n>>2]|0)==(w+A|0)){$o(m,A<<1,0);if(!(a[m>>0]&1))H=10;else H=(c[m>>2]&-2)+-1|0;$o(m,H,0);t=(a[m>>0]&1)==0?f:c[s>>2]|0;c[n>>2]=t+A;I=t}else I=w;t=y+12|0;A=c[t>>2]|0;J=y+16|0;if((A|0)==(c[J>>2]|0))K=Af[c[(c[y>>2]|0)+36>>2]&127](y)|0;else K=c[A>>2]|0;if(xk(K,r,I,n,q,v,l,o,p,j)|0){D=y;E=C;F=I;break}A=c[t>>2]|0;if((A|0)==(c[J>>2]|0)){Af[c[(c[y>>2]|0)+40>>2]&127](y)|0;k=y;w=I;continue}else{c[t>>2]=A+4;k=y;w=I;continue}}I=a[l>>0]|0;w=c[p>>2]|0;if((((I&1)==0?(I&255)>>>1:c[l+4>>2]|0)|0)!=0?(w-o|0)<160:0){I=c[q>>2]|0;q=w+4|0;c[p>>2]=q;c[w>>2]=I;L=q}else L=w;c[h>>2]=um(F,c[n>>2]|0,g,r)|0;Nk(l,o,L,g);if(D){L=c[D+12>>2]|0;if((L|0)==(c[D+16>>2]|0))M=Af[c[(c[D>>2]|0)+36>>2]&127](D)|0;else M=c[L>>2]|0;if((M|0)==-1){c[d>>2]=0;N=1}else N=0}else N=1;do if(E){M=c[E+12>>2]|0;if((M|0)==(c[E+16>>2]|0))O=Af[c[(c[E>>2]|0)+36>>2]&127](E)|0;else O=c[M>>2]|0;if((O|0)!=-1)if(N)break;else{G=46;break}else{c[e>>2]=0;G=44;break}}else G=44;while(0);if((G|0)==44?N:0)G=46;if((G|0)==46)c[g>>2]=c[g>>2]|2;g=c[d>>2]|0;Au(m);Au(l);i=b;return g|0}function mh(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;b=i;i=i+320|0;j=b+208|0;k=b+200|0;l=b+24|0;m=b+12|0;n=b+8|0;o=b+40|0;p=b+4|0;q=b;r=xr(f)|0;Tn(l,f,j,k);c[m>>2]=0;c[m+4>>2]=0;c[m+8>>2]=0;if(!(a[m>>0]&1))s=10;else s=(c[m>>2]&-2)+-1|0;$o(m,s,0);s=m+8|0;f=m+1|0;t=(a[m>>0]&1)==0?f:c[s>>2]|0;c[n>>2]=t;c[p>>2]=o;c[q>>2]=0;u=m+4|0;v=c[k>>2]|0;k=c[d>>2]|0;w=t;a:while(1){if(k){t=c[k+12>>2]|0;if((t|0)==(c[k+16>>2]|0))x=Af[c[(c[k>>2]|0)+36>>2]&127](k)|0;else x=c[t>>2]|0;if((x|0)==-1){c[d>>2]=0;y=0;z=1}else{y=k;z=0}}else{y=0;z=1}t=c[e>>2]|0;do if(t){A=c[t+12>>2]|0;if((A|0)==(c[t+16>>2]|0))B=Af[c[(c[t>>2]|0)+36>>2]&127](t)|0;else B=c[A>>2]|0;if((B|0)!=-1)if(z){C=t;break}else{D=y;E=t;F=w;break a}else{c[e>>2]=0;G=16;break}}else G=16;while(0);if((G|0)==16){G=0;if(z){D=y;E=0;F=w;break}else C=0}t=a[m>>0]|0;A=(t&1)==0?(t&255)>>>1:c[u>>2]|0;if((c[n>>2]|0)==(w+A|0)){$o(m,A<<1,0);if(!(a[m>>0]&1))H=10;else H=(c[m>>2]&-2)+-1|0;$o(m,H,0);t=(a[m>>0]&1)==0?f:c[s>>2]|0;c[n>>2]=t+A;I=t}else I=w;t=y+12|0;A=c[t>>2]|0;J=y+16|0;if((A|0)==(c[J>>2]|0))K=Af[c[(c[y>>2]|0)+36>>2]&127](y)|0;else K=c[A>>2]|0;if(xk(K,r,I,n,q,v,l,o,p,j)|0){D=y;E=C;F=I;break}A=c[t>>2]|0;if((A|0)==(c[J>>2]|0)){Af[c[(c[y>>2]|0)+40>>2]&127](y)|0;k=y;w=I;continue}else{c[t>>2]=A+4;k=y;w=I;continue}}I=a[l>>0]|0;w=c[p>>2]|0;if((((I&1)==0?(I&255)>>>1:c[l+4>>2]|0)|0)!=0?(w-o|0)<160:0){I=c[q>>2]|0;q=w+4|0;c[p>>2]=q;c[w>>2]=I;L=q}else L=w;c[h>>2]=Wm(F,c[n>>2]|0,g,r)|0;Nk(l,o,L,g);if(D){L=c[D+12>>2]|0;if((L|0)==(c[D+16>>2]|0))M=Af[c[(c[D>>2]|0)+36>>2]&127](D)|0;else M=c[L>>2]|0;if((M|0)==-1){c[d>>2]=0;N=1}else N=0}else N=1;do if(E){M=c[E+12>>2]|0;if((M|0)==(c[E+16>>2]|0))O=Af[c[(c[E>>2]|0)+36>>2]&127](E)|0;else O=c[M>>2]|0;if((O|0)!=-1)if(N)break;else{G=46;break}else{c[e>>2]=0;G=44;break}}else G=44;while(0);if((G|0)==44?N:0)G=46;if((G|0)==46)c[g>>2]=c[g>>2]|2;g=c[d>>2]|0;Au(m);Au(l);i=b;return g|0}function lh(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;b=i;i=i+320|0;j=b+208|0;k=b+200|0;l=b+24|0;m=b+12|0;n=b+8|0;o=b+40|0;p=b+4|0;q=b;r=xr(f)|0;Tn(l,f,j,k);c[m>>2]=0;c[m+4>>2]=0;c[m+8>>2]=0;if(!(a[m>>0]&1))s=10;else s=(c[m>>2]&-2)+-1|0;$o(m,s,0);s=m+8|0;f=m+1|0;t=(a[m>>0]&1)==0?f:c[s>>2]|0;c[n>>2]=t;c[p>>2]=o;c[q>>2]=0;u=m+4|0;v=c[k>>2]|0;k=c[d>>2]|0;w=t;a:while(1){if(k){t=c[k+12>>2]|0;if((t|0)==(c[k+16>>2]|0))x=Af[c[(c[k>>2]|0)+36>>2]&127](k)|0;else x=c[t>>2]|0;if((x|0)==-1){c[d>>2]=0;y=0;z=1}else{y=k;z=0}}else{y=0;z=1}t=c[e>>2]|0;do if(t){A=c[t+12>>2]|0;if((A|0)==(c[t+16>>2]|0))B=Af[c[(c[t>>2]|0)+36>>2]&127](t)|0;else B=c[A>>2]|0;if((B|0)!=-1)if(z){C=t;break}else{D=y;E=t;F=w;break a}else{c[e>>2]=0;G=16;break}}else G=16;while(0);if((G|0)==16){G=0;if(z){D=y;E=0;F=w;break}else C=0}t=a[m>>0]|0;A=(t&1)==0?(t&255)>>>1:c[u>>2]|0;if((c[n>>2]|0)==(w+A|0)){$o(m,A<<1,0);if(!(a[m>>0]&1))H=10;else H=(c[m>>2]&-2)+-1|0;$o(m,H,0);t=(a[m>>0]&1)==0?f:c[s>>2]|0;c[n>>2]=t+A;I=t}else I=w;t=y+12|0;A=c[t>>2]|0;J=y+16|0;if((A|0)==(c[J>>2]|0))K=Af[c[(c[y>>2]|0)+36>>2]&127](y)|0;else K=c[A>>2]|0;if(xk(K,r,I,n,q,v,l,o,p,j)|0){D=y;E=C;F=I;break}A=c[t>>2]|0;if((A|0)==(c[J>>2]|0)){Af[c[(c[y>>2]|0)+40>>2]&127](y)|0;k=y;w=I;continue}else{c[t>>2]=A+4;k=y;w=I;continue}}I=a[l>>0]|0;w=c[p>>2]|0;if((((I&1)==0?(I&255)>>>1:c[l+4>>2]|0)|0)!=0?(w-o|0)<160:0){I=c[q>>2]|0;q=w+4|0;c[p>>2]=q;c[w>>2]=I;L=q}else L=w;c[h>>2]=Vm(F,c[n>>2]|0,g,r)|0;Nk(l,o,L,g);if(D){L=c[D+12>>2]|0;if((L|0)==(c[D+16>>2]|0))M=Af[c[(c[D>>2]|0)+36>>2]&127](D)|0;else M=c[L>>2]|0;if((M|0)==-1){c[d>>2]=0;N=1}else N=0}else N=1;do if(E){M=c[E+12>>2]|0;if((M|0)==(c[E+16>>2]|0))O=Af[c[(c[E>>2]|0)+36>>2]&127](E)|0;else O=c[M>>2]|0;if((O|0)!=-1)if(N)break;else{G=46;break}else{c[e>>2]=0;G=44;break}}else G=44;while(0);if((G|0)==44?N:0)G=46;if((G|0)==46)c[g>>2]=c[g>>2]|2;g=c[d>>2]|0;Au(m);Au(l);i=b;return g|0}function kh(d,e,f,g,h,j){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;d=i;i=i+320|0;k=d+208|0;l=d+200|0;m=d+24|0;n=d+12|0;o=d+8|0;p=d+40|0;q=d+4|0;r=d;s=xr(g)|0;Tn(m,g,k,l);c[n>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;if(!(a[n>>0]&1))t=10;else t=(c[n>>2]&-2)+-1|0;$o(n,t,0);t=n+8|0;g=n+1|0;u=(a[n>>0]&1)==0?g:c[t>>2]|0;c[o>>2]=u;c[q>>2]=p;c[r>>2]=0;v=n+4|0;w=c[l>>2]|0;l=c[e>>2]|0;x=u;a:while(1){if(l){u=c[l+12>>2]|0;if((u|0)==(c[l+16>>2]|0))y=Af[c[(c[l>>2]|0)+36>>2]&127](l)|0;else y=c[u>>2]|0;if((y|0)==-1){c[e>>2]=0;z=0;A=1}else{z=l;A=0}}else{z=0;A=1}u=c[f>>2]|0;do if(u){B=c[u+12>>2]|0;if((B|0)==(c[u+16>>2]|0))C=Af[c[(c[u>>2]|0)+36>>2]&127](u)|0;else C=c[B>>2]|0;if((C|0)!=-1)if(A){D=u;break}else{E=z;F=u;G=x;break a}else{c[f>>2]=0;H=16;break}}else H=16;while(0);if((H|0)==16){H=0;if(A){E=z;F=0;G=x;break}else D=0}u=a[n>>0]|0;B=(u&1)==0?(u&255)>>>1:c[v>>2]|0;if((c[o>>2]|0)==(x+B|0)){$o(n,B<<1,0);if(!(a[n>>0]&1))I=10;else I=(c[n>>2]&-2)+-1|0;$o(n,I,0);u=(a[n>>0]&1)==0?g:c[t>>2]|0;c[o>>2]=u+B;J=u}else J=x;u=z+12|0;B=c[u>>2]|0;K=z+16|0;if((B|0)==(c[K>>2]|0))L=Af[c[(c[z>>2]|0)+36>>2]&127](z)|0;else L=c[B>>2]|0;if(xk(L,s,J,o,r,w,m,p,q,k)|0){E=z;F=D;G=J;break}B=c[u>>2]|0;if((B|0)==(c[K>>2]|0)){Af[c[(c[z>>2]|0)+40>>2]&127](z)|0;l=z;x=J;continue}else{c[u>>2]=B+4;l=z;x=J;continue}}J=a[m>>0]|0;x=c[q>>2]|0;if((((J&1)==0?(J&255)>>>1:c[m+4>>2]|0)|0)!=0?(x-p|0)<160:0){J=c[r>>2]|0;r=x+4|0;c[q>>2]=r;c[x>>2]=J;M=r}else M=x;b[j>>1]=Um(G,c[o>>2]|0,h,s)|0;Nk(m,p,M,h);if(E){M=c[E+12>>2]|0;if((M|0)==(c[E+16>>2]|0))N=Af[c[(c[E>>2]|0)+36>>2]&127](E)|0;else N=c[M>>2]|0;if((N|0)==-1){c[e>>2]=0;O=1}else O=0}else O=1;do if(F){N=c[F+12>>2]|0;if((N|0)==(c[F+16>>2]|0))P=Af[c[(c[F>>2]|0)+36>>2]&127](F)|0;else P=c[N>>2]|0;if((P|0)!=-1)if(O)break;else{H=46;break}else{c[f>>2]=0;H=44;break}}else H=44;while(0);if((H|0)==44?O:0)H=46;if((H|0)==46)c[h>>2]=c[h>>2]|2;h=c[e>>2]|0;Au(n);Au(m);i=d;return h|0}function Uh(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;e=c[a+24>>2]|0;f=c[a+28>>2]|0;g=c[a+16>>2]|0;h=(c[a+36>>2]|0)/4|0;if(!f)return;i=(e+7|0)/8|0;j=e&7;e=f;f=c[a+20>>2]|0;k=c[a>>2]|0;a:while(1){a=e+-1|0;switch(j|0){case 0:{l=f;m=i;n=k;o=4;break}case 7:{p=f;q=i;r=k;o=5;break}case 6:{s=f;t=i;u=k;o=6;break}case 5:{v=f;w=i;x=k;o=7;break}case 4:{y=f;z=i;A=k;o=8;break}case 3:{B=f;C=i;D=k;o=9;break}case 2:{E=f;F=i;G=k;o=10;break}case 1:{H=f;I=i;J=k;o=11;break}default:{K=f;L=k;o=12}}while(1)if((o|0)==4){o=0;c[l>>2]=(c[b+(((d[n+1>>0]|0)<<1|1)<<2)>>2]|0)+(c[b+((d[n>>0]|0)<<1<<2)>>2]|0);p=l+4|0;q=m;r=n+2|0;o=5;continue}else if((o|0)==5){o=0;c[p>>2]=(c[b+(((d[r+1>>0]|0)<<1|1)<<2)>>2]|0)+(c[b+((d[r>>0]|0)<<1<<2)>>2]|0);s=p+4|0;t=q;u=r+2|0;o=6;continue}else if((o|0)==6){o=0;c[s>>2]=(c[b+(((d[u+1>>0]|0)<<1|1)<<2)>>2]|0)+(c[b+((d[u>>0]|0)<<1<<2)>>2]|0);v=s+4|0;w=t;x=u+2|0;o=7;continue}else if((o|0)==7){o=0;c[v>>2]=(c[b+(((d[x+1>>0]|0)<<1|1)<<2)>>2]|0)+(c[b+((d[x>>0]|0)<<1<<2)>>2]|0);y=v+4|0;z=w;A=x+2|0;o=8;continue}else if((o|0)==8){o=0;c[y>>2]=(c[b+(((d[A+1>>0]|0)<<1|1)<<2)>>2]|0)+(c[b+((d[A>>0]|0)<<1<<2)>>2]|0);B=y+4|0;C=z;D=A+2|0;o=9;continue}else if((o|0)==9){o=0;c[B>>2]=(c[b+(((d[D+1>>0]|0)<<1|1)<<2)>>2]|0)+(c[b+((d[D>>0]|0)<<1<<2)>>2]|0);E=B+4|0;F=C;G=D+2|0;o=10;continue}else if((o|0)==10){o=0;c[E>>2]=(c[b+(((d[G+1>>0]|0)<<1|1)<<2)>>2]|0)+(c[b+((d[G>>0]|0)<<1<<2)>>2]|0);H=E+4|0;I=F;J=G+2|0;o=11;continue}else if((o|0)==11){o=0;M=H+4|0;c[H>>2]=(c[b+(((d[J+1>>0]|0)<<1|1)<<2)>>2]|0)+(c[b+((d[J>>0]|0)<<1<<2)>>2]|0);N=J+2|0;if((I|0)>1){l=M;m=I+-1|0;n=N;o=4;continue}else{K=M;L=N;o=12;continue}}else if((o|0)==12){o=0;if(!a)break a;else{e=a;f=K+(h<<2)|0;k=L+g|0;continue a}}}return}function sh(b,e,f,g,j,k){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;b=i;i=i+240|0;l=b+208|0;m=b+203|0;n=b+202|0;o=b+24|0;p=b+12|0;q=b+8|0;r=b+40|0;s=b+4|0;t=b;u=b+201|0;v=b+200|0;pn(o,g,l,m,n);c[p>>2]=0;c[p+4>>2]=0;c[p+8>>2]=0;if(!(a[p>>0]&1))w=10;else w=(c[p>>2]&-2)+-1|0;$o(p,w,0);w=p+8|0;g=p+1|0;x=(a[p>>0]&1)==0?g:c[w>>2]|0;c[q>>2]=x;c[s>>2]=r;c[t>>2]=0;a[u>>0]=1;a[v>>0]=69;y=p+4|0;z=a[m>>0]|0;m=a[n>>0]|0;n=c[e>>2]|0;A=x;a:while(1){if(n)if((c[n+12>>2]|0)==(c[n+16>>2]|0)?(Af[c[(c[n>>2]|0)+36>>2]&127](n)|0)==-1:0){c[e>>2]=0;B=0}else B=n;else B=0;x=(B|0)==0;C=c[f>>2]|0;do if(C){if((c[C+12>>2]|0)!=(c[C+16>>2]|0))if(x){D=C;break}else{E=B;F=C;G=A;break a}if((Af[c[(c[C>>2]|0)+36>>2]&127](C)|0)!=-1)if(x){D=C;break}else{E=B;F=C;G=A;break a}else{c[f>>2]=0;H=13;break}}else H=13;while(0);if((H|0)==13){H=0;if(x){E=B;F=0;G=A;break}else D=0}C=a[p>>0]|0;I=(C&1)==0?(C&255)>>>1:c[y>>2]|0;if((c[q>>2]|0)==(A+I|0)){$o(p,I<<1,0);if(!(a[p>>0]&1))J=10;else J=(c[p>>2]&-2)+-1|0;$o(p,J,0);C=(a[p>>0]&1)==0?g:c[w>>2]|0;c[q>>2]=C+I;K=C}else K=A;C=B+12|0;I=c[C>>2]|0;L=B+16|0;if((I|0)==(c[L>>2]|0))M=Af[c[(c[B>>2]|0)+36>>2]&127](B)|0;else M=d[I>>0]|0;if(mj(M&255,u,v,K,q,z,m,o,r,s,t,l)|0){E=B;F=D;G=K;break}I=c[C>>2]|0;if((I|0)==(c[L>>2]|0)){Af[c[(c[B>>2]|0)+40>>2]&127](B)|0;n=B;A=K;continue}else{c[C>>2]=I+1;n=B;A=K;continue}}K=a[o>>0]|0;A=c[s>>2]|0;if(!((a[u>>0]|0)==0?1:(((K&1)==0?(K&255)>>>1:c[o+4>>2]|0)|0)==0)?(A-r|0)<160:0){K=c[t>>2]|0;t=A+4|0;c[s>>2]=t;c[A>>2]=K;N=t}else N=A;h[k>>3]=+Qn(G,c[q>>2]|0,j);Nk(o,r,N,j);if(E)if((c[E+12>>2]|0)==(c[E+16>>2]|0)?(Af[c[(c[E>>2]|0)+36>>2]&127](E)|0)==-1:0){c[e>>2]=0;O=0}else O=E;else O=0;E=(O|0)==0;do if(F){if((c[F+12>>2]|0)==(c[F+16>>2]|0)?(Af[c[(c[F>>2]|0)+36>>2]&127](F)|0)==-1:0){c[f>>2]=0;H=38;break}if(!E)H=39}else H=38;while(0);if((H|0)==38?E:0)H=39;if((H|0)==39)c[j>>2]=c[j>>2]|2;j=c[e>>2]|0;Au(p);Au(o);i=b;return j|0}function rh(b,e,f,g,j,k){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;b=i;i=i+240|0;l=b+208|0;m=b+203|0;n=b+202|0;o=b+24|0;p=b+12|0;q=b+8|0;r=b+40|0;s=b+4|0;t=b;u=b+201|0;v=b+200|0;pn(o,g,l,m,n);c[p>>2]=0;c[p+4>>2]=0;c[p+8>>2]=0;if(!(a[p>>0]&1))w=10;else w=(c[p>>2]&-2)+-1|0;$o(p,w,0);w=p+8|0;g=p+1|0;x=(a[p>>0]&1)==0?g:c[w>>2]|0;c[q>>2]=x;c[s>>2]=r;c[t>>2]=0;a[u>>0]=1;a[v>>0]=69;y=p+4|0;z=a[m>>0]|0;m=a[n>>0]|0;n=c[e>>2]|0;A=x;a:while(1){if(n)if((c[n+12>>2]|0)==(c[n+16>>2]|0)?(Af[c[(c[n>>2]|0)+36>>2]&127](n)|0)==-1:0){c[e>>2]=0;B=0}else B=n;else B=0;x=(B|0)==0;C=c[f>>2]|0;do if(C){if((c[C+12>>2]|0)!=(c[C+16>>2]|0))if(x){D=C;break}else{E=B;F=C;G=A;break a}if((Af[c[(c[C>>2]|0)+36>>2]&127](C)|0)!=-1)if(x){D=C;break}else{E=B;F=C;G=A;break a}else{c[f>>2]=0;H=13;break}}else H=13;while(0);if((H|0)==13){H=0;if(x){E=B;F=0;G=A;break}else D=0}C=a[p>>0]|0;I=(C&1)==0?(C&255)>>>1:c[y>>2]|0;if((c[q>>2]|0)==(A+I|0)){$o(p,I<<1,0);if(!(a[p>>0]&1))J=10;else J=(c[p>>2]&-2)+-1|0;$o(p,J,0);C=(a[p>>0]&1)==0?g:c[w>>2]|0;c[q>>2]=C+I;K=C}else K=A;C=B+12|0;I=c[C>>2]|0;L=B+16|0;if((I|0)==(c[L>>2]|0))M=Af[c[(c[B>>2]|0)+36>>2]&127](B)|0;else M=d[I>>0]|0;if(mj(M&255,u,v,K,q,z,m,o,r,s,t,l)|0){E=B;F=D;G=K;break}I=c[C>>2]|0;if((I|0)==(c[L>>2]|0)){Af[c[(c[B>>2]|0)+40>>2]&127](B)|0;n=B;A=K;continue}else{c[C>>2]=I+1;n=B;A=K;continue}}K=a[o>>0]|0;A=c[s>>2]|0;if(!((a[u>>0]|0)==0?1:(((K&1)==0?(K&255)>>>1:c[o+4>>2]|0)|0)==0)?(A-r|0)<160:0){K=c[t>>2]|0;t=A+4|0;c[s>>2]=t;c[A>>2]=K;N=t}else N=A;h[k>>3]=+Pn(G,c[q>>2]|0,j);Nk(o,r,N,j);if(E)if((c[E+12>>2]|0)==(c[E+16>>2]|0)?(Af[c[(c[E>>2]|0)+36>>2]&127](E)|0)==-1:0){c[e>>2]=0;O=0}else O=E;else O=0;E=(O|0)==0;do if(F){if((c[F+12>>2]|0)==(c[F+16>>2]|0)?(Af[c[(c[F>>2]|0)+36>>2]&127](F)|0)==-1:0){c[f>>2]=0;H=38;break}if(!E)H=39}else H=38;while(0);if((H|0)==38?E:0)H=39;if((H|0)==39)c[j>>2]=c[j>>2]|2;j=c[e>>2]|0;Au(p);Au(o);i=b;return j|0}function qh(b,e,f,h,j,k){b=b|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;b=i;i=i+240|0;l=b+208|0;m=b+203|0;n=b+202|0;o=b+24|0;p=b+12|0;q=b+8|0;r=b+40|0;s=b+4|0;t=b;u=b+201|0;v=b+200|0;pn(o,h,l,m,n);c[p>>2]=0;c[p+4>>2]=0;c[p+8>>2]=0;if(!(a[p>>0]&1))w=10;else w=(c[p>>2]&-2)+-1|0;$o(p,w,0);w=p+8|0;h=p+1|0;x=(a[p>>0]&1)==0?h:c[w>>2]|0;c[q>>2]=x;c[s>>2]=r;c[t>>2]=0;a[u>>0]=1;a[v>>0]=69;y=p+4|0;z=a[m>>0]|0;m=a[n>>0]|0;n=c[e>>2]|0;A=x;a:while(1){if(n)if((c[n+12>>2]|0)==(c[n+16>>2]|0)?(Af[c[(c[n>>2]|0)+36>>2]&127](n)|0)==-1:0){c[e>>2]=0;B=0}else B=n;else B=0;x=(B|0)==0;C=c[f>>2]|0;do if(C){if((c[C+12>>2]|0)!=(c[C+16>>2]|0))if(x){D=C;break}else{E=B;F=C;G=A;break a}if((Af[c[(c[C>>2]|0)+36>>2]&127](C)|0)!=-1)if(x){D=C;break}else{E=B;F=C;G=A;break a}else{c[f>>2]=0;H=13;break}}else H=13;while(0);if((H|0)==13){H=0;if(x){E=B;F=0;G=A;break}else D=0}C=a[p>>0]|0;I=(C&1)==0?(C&255)>>>1:c[y>>2]|0;if((c[q>>2]|0)==(A+I|0)){$o(p,I<<1,0);if(!(a[p>>0]&1))J=10;else J=(c[p>>2]&-2)+-1|0;$o(p,J,0);C=(a[p>>0]&1)==0?h:c[w>>2]|0;c[q>>2]=C+I;K=C}else K=A;C=B+12|0;I=c[C>>2]|0;L=B+16|0;if((I|0)==(c[L>>2]|0))M=Af[c[(c[B>>2]|0)+36>>2]&127](B)|0;else M=d[I>>0]|0;if(mj(M&255,u,v,K,q,z,m,o,r,s,t,l)|0){E=B;F=D;G=K;break}I=c[C>>2]|0;if((I|0)==(c[L>>2]|0)){Af[c[(c[B>>2]|0)+40>>2]&127](B)|0;n=B;A=K;continue}else{c[C>>2]=I+1;n=B;A=K;continue}}K=a[o>>0]|0;A=c[s>>2]|0;if(!((a[u>>0]|0)==0?1:(((K&1)==0?(K&255)>>>1:c[o+4>>2]|0)|0)==0)?(A-r|0)<160:0){K=c[t>>2]|0;t=A+4|0;c[s>>2]=t;c[A>>2]=K;N=t}else N=A;g[k>>2]=+Zn(G,c[q>>2]|0,j);Nk(o,r,N,j);if(E)if((c[E+12>>2]|0)==(c[E+16>>2]|0)?(Af[c[(c[E>>2]|0)+36>>2]&127](E)|0)==-1:0){c[e>>2]=0;O=0}else O=E;else O=0;E=(O|0)==0;do if(F){if((c[F+12>>2]|0)==(c[F+16>>2]|0)?(Af[c[(c[F>>2]|0)+36>>2]&127](F)|0)==-1:0){c[f>>2]=0;H=38;break}if(!E)H=39}else H=38;while(0);if((H|0)==38?E:0)H=39;if((H|0)==39)c[j>>2]=c[j>>2]|2;j=c[e>>2]|0;Au(p);Au(o);i=b;return j|0}function Rh(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=d[a+63>>0]|0;i=a+28|0;j=c[i>>2]|0;k=(c[a+8>>2]<<16|0)/(j|0)|0;l=a+24|0;m=c[l>>2]|0;n=(c[a+4>>2]<<16|0)/(m|0)|0;o=j+-1|0;c[i>>2]=o;if(!j)return;j=a+20|0;p=a+32|0;q=(b&1|0)==0;r=(b&2|0)==0;s=(b&48|0)!=0;t=b&112;b=a+12|0;u=c[j>>2]|0;v=u;w=o;o=u;u=m;m=0;x=0;while(1){if((m|0)>65535){y=m+-65536|0;z=y>>>16;A=y-(z<<16)|0;B=x+1+z|0}else{A=m;B=x}if(!u)C=w;else{z=u;y=o;D=65536;E=0;F=-1;while(1){z=z+-1|0;if((D|0)>65535){G=D+-65536|0;H=G>>>16;I=F+1+H|0;J=G-(H<<16)|0;K=(c[a>>2]|0)+((ca(c[b>>2]|0,B)|0)+(I<<2))|0;L=I}else{J=D;K=E;L=F}I=c[K>>2]|0;H=I>>>16&255;G=I>>>8&255;M=I&255;N=I>>>24;I=c[y>>2]|0;O=I>>>16&255;P=I>>>8&255;Q=I&255;R=I>>>24;if(q){S=H;T=G;U=M}else{S=((ca(H,g)|0)>>>0)/255|0;T=((ca(G,f)|0)>>>0)/255|0;U=((ca(M,e)|0)>>>0)/255|0}M=((ca(N,h)|0)>>>0)/255|0;G=r?N:M;if(s&G>>>0<255){V=((ca(G,S)|0)>>>0)/255|0;W=((ca(G,T)|0)>>>0)/255|0;X=((ca(G,U)|0)>>>0)/255|0}else{V=S;W=T;X=U}switch(t|0){case 16:{M=255-G|0;Y=(((ca(M,R)|0)>>>0)/255|0)+G|0;Z=(((ca(M,Q)|0)>>>0)/255|0)+V|0;_=(((ca(M,P)|0)>>>0)/255|0)+W|0;$=(((ca(M,O)|0)>>>0)/255|0)+X|0;break}case 32:{M=X+O|0;G=W+P|0;N=V+Q|0;Y=R;Z=N>>>0>255?255:N;_=G>>>0>255?255:G;$=M>>>0>255?255:M;break}case 64:{Y=R;Z=((ca(V,Q)|0)>>>0)/255|0;_=((ca(W,P)|0)>>>0)/255|0;$=((ca(X,O)|0)>>>0)/255|0;break}default:{Y=R;Z=Q;_=P;$=O}}c[y>>2]=_<<8|$<<16|Z|Y<<24;if(!z)break;else{y=y+4|0;D=J+n|0;E=K;F=L}}C=c[i>>2]|0}F=v+(c[p>>2]|0)|0;E=C+-1|0;c[i>>2]=E;if(!C){aa=F;break}v=F;w=E;o=F;u=c[l>>2]|0;m=A+k|0;x=B}c[j>>2]=aa;return}function Qh(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=d[a+63>>0]|0;i=a+28|0;j=c[i>>2]|0;k=(c[a+8>>2]<<16|0)/(j|0)|0;l=a+24|0;m=c[l>>2]|0;n=(c[a+4>>2]<<16|0)/(m|0)|0;o=j+-1|0;c[i>>2]=o;if(!j)return;j=a+20|0;p=a+32|0;q=(b&1|0)==0;r=(b&2|0)==0;s=(b&48|0)!=0;t=b&112;b=a+12|0;u=c[j>>2]|0;v=u;w=o;o=u;u=m;m=0;x=0;while(1){if((m|0)>65535){y=m+-65536|0;z=y>>>16;A=y-(z<<16)|0;B=x+1+z|0}else{A=m;B=x}if(!u)C=w;else{z=u;y=o;D=65536;E=0;F=-1;while(1){z=z+-1|0;if((D|0)>65535){G=D+-65536|0;H=G>>>16;I=F+1+H|0;J=G-(H<<16)|0;K=(c[a>>2]|0)+((ca(c[b>>2]|0,B)|0)+(I<<2))|0;L=I}else{J=D;K=E;L=F}I=c[K>>2]|0;H=I>>>16&255;G=I>>>8&255;M=I&255;N=I>>>24;I=c[y>>2]|0;O=I>>>16&255;P=I>>>8&255;Q=I&255;R=I>>>24;if(q){S=M;T=G;U=H}else{S=((ca(M,g)|0)>>>0)/255|0;T=((ca(G,f)|0)>>>0)/255|0;U=((ca(H,e)|0)>>>0)/255|0}H=((ca(N,h)|0)>>>0)/255|0;G=r?N:H;if(s&G>>>0<255){V=((ca(G,S)|0)>>>0)/255|0;W=((ca(G,T)|0)>>>0)/255|0;X=((ca(G,U)|0)>>>0)/255|0}else{V=S;W=T;X=U}switch(t|0){case 16:{H=255-G|0;Y=(((ca(H,R)|0)>>>0)/255|0)+G|0;Z=(((ca(H,Q)|0)>>>0)/255|0)+V|0;_=(((ca(H,P)|0)>>>0)/255|0)+W|0;$=(((ca(H,O)|0)>>>0)/255|0)+X|0;break}case 32:{H=X+O|0;G=W+P|0;N=V+Q|0;Y=R;Z=N>>>0>255?255:N;_=G>>>0>255?255:G;$=H>>>0>255?255:H;break}case 64:{Y=R;Z=((ca(V,Q)|0)>>>0)/255|0;_=((ca(W,P)|0)>>>0)/255|0;$=((ca(X,O)|0)>>>0)/255|0;break}default:{Y=R;Z=Q;_=P;$=O}}c[y>>2]=_<<8|$<<16|Z|Y<<24;if(!z)break;else{y=y+4|0;D=J+n|0;E=K;F=L}}C=c[i>>2]|0}F=v+(c[p>>2]|0)|0;E=C+-1|0;c[i>>2]=E;if(!C){aa=F;break}v=F;w=E;o=F;u=c[l>>2]|0;m=A+k|0;x=B}c[j>>2]=aa;return}function Ph(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=d[a+63>>0]|0;i=a+28|0;j=c[i>>2]|0;k=(c[a+8>>2]<<16|0)/(j|0)|0;l=a+24|0;m=c[l>>2]|0;n=(c[a+4>>2]<<16|0)/(m|0)|0;o=j+-1|0;c[i>>2]=o;if(!j)return;j=a+20|0;p=a+32|0;q=(b&1|0)==0;r=(b&2|0)==0;s=(b&48|0)!=0;t=b&112;b=a+12|0;u=c[j>>2]|0;v=u;w=o;o=u;u=m;m=0;x=0;while(1){if((m|0)>65535){y=m+-65536|0;z=y>>>16;A=y-(z<<16)|0;B=x+1+z|0}else{A=m;B=x}if(!u)C=w;else{z=u;y=o;D=65536;E=0;F=-1;while(1){z=z+-1|0;if((D|0)>65535){G=D+-65536|0;H=G>>>16;I=F+1+H|0;J=G-(H<<16)|0;K=(c[a>>2]|0)+((ca(c[b>>2]|0,B)|0)+(I<<2))|0;L=I}else{J=D;K=E;L=F}I=c[K>>2]|0;H=I>>>24;G=I>>>16&255;M=I>>>8&255;N=I&255;I=c[y>>2]|0;O=I>>>16&255;P=I>>>8&255;Q=I&255;R=I>>>24;if(q){S=H;T=G;U=M}else{S=((ca(H,g)|0)>>>0)/255|0;T=((ca(G,f)|0)>>>0)/255|0;U=((ca(M,e)|0)>>>0)/255|0}M=((ca(N,h)|0)>>>0)/255|0;G=r?N:M;if(s&G>>>0<255){V=((ca(G,S)|0)>>>0)/255|0;W=((ca(G,T)|0)>>>0)/255|0;X=((ca(G,U)|0)>>>0)/255|0}else{V=S;W=T;X=U}switch(t|0){case 16:{M=255-G|0;Y=(((ca(M,R)|0)>>>0)/255|0)+G|0;Z=(((ca(M,Q)|0)>>>0)/255|0)+V|0;_=(((ca(M,P)|0)>>>0)/255|0)+W|0;$=(((ca(M,O)|0)>>>0)/255|0)+X|0;break}case 32:{M=X+O|0;G=W+P|0;N=V+Q|0;Y=R;Z=N>>>0>255?255:N;_=G>>>0>255?255:G;$=M>>>0>255?255:M;break}case 64:{Y=R;Z=((ca(V,Q)|0)>>>0)/255|0;_=((ca(W,P)|0)>>>0)/255|0;$=((ca(X,O)|0)>>>0)/255|0;break}default:{Y=R;Z=Q;_=P;$=O}}c[y>>2]=_<<8|$<<16|Z|Y<<24;if(!z)break;else{y=y+4|0;D=J+n|0;E=K;F=L}}C=c[i>>2]|0}F=v+(c[p>>2]|0)|0;E=C+-1|0;c[i>>2]=E;if(!C){aa=F;break}v=F;w=E;o=F;u=c[l>>2]|0;m=A+k|0;x=B}c[j>>2]=aa;return}function Oh(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=d[a+63>>0]|0;i=a+28|0;j=c[i>>2]|0;k=(c[a+8>>2]<<16|0)/(j|0)|0;l=a+24|0;m=c[l>>2]|0;n=(c[a+4>>2]<<16|0)/(m|0)|0;o=j+-1|0;c[i>>2]=o;if(!j)return;j=a+20|0;p=a+32|0;q=(b&1|0)==0;r=(b&2|0)==0;s=(b&48|0)!=0;t=b&112;b=a+12|0;u=c[j>>2]|0;v=u;w=o;o=u;u=m;m=0;x=0;while(1){if((m|0)>65535){y=m+-65536|0;z=y>>>16;A=y-(z<<16)|0;B=x+1+z|0}else{A=m;B=x}if(!u)C=w;else{z=u;y=o;D=65536;E=0;F=-1;while(1){z=z+-1|0;if((D|0)>65535){G=D+-65536|0;H=G>>>16;I=F+1+H|0;J=G-(H<<16)|0;K=(c[a>>2]|0)+((ca(c[b>>2]|0,B)|0)+(I<<2))|0;L=I}else{J=D;K=E;L=F}I=c[K>>2]|0;H=I>>>24;G=I>>>16&255;M=I>>>8&255;N=I&255;I=c[y>>2]|0;O=I>>>16&255;P=I>>>8&255;Q=I&255;R=I>>>24;if(q){S=M;T=G;U=H}else{S=((ca(M,g)|0)>>>0)/255|0;T=((ca(G,f)|0)>>>0)/255|0;U=((ca(H,e)|0)>>>0)/255|0}H=((ca(N,h)|0)>>>0)/255|0;G=r?N:H;if(s&G>>>0<255){V=((ca(G,S)|0)>>>0)/255|0;W=((ca(G,T)|0)>>>0)/255|0;X=((ca(G,U)|0)>>>0)/255|0}else{V=S;W=T;X=U}switch(t|0){case 16:{H=255-G|0;Y=(((ca(H,R)|0)>>>0)/255|0)+G|0;Z=(((ca(H,Q)|0)>>>0)/255|0)+V|0;_=(((ca(H,P)|0)>>>0)/255|0)+W|0;$=(((ca(H,O)|0)>>>0)/255|0)+X|0;break}case 32:{H=X+O|0;G=W+P|0;N=V+Q|0;Y=R;Z=N>>>0>255?255:N;_=G>>>0>255?255:G;$=H>>>0>255?255:H;break}case 64:{Y=R;Z=((ca(V,Q)|0)>>>0)/255|0;_=((ca(W,P)|0)>>>0)/255|0;$=((ca(X,O)|0)>>>0)/255|0;break}default:{Y=R;Z=Q;_=P;$=O}}c[y>>2]=_<<8|$<<16|Z|Y<<24;if(!z)break;else{y=y+4|0;D=J+n|0;E=K;F=L}}C=c[i>>2]|0}F=v+(c[p>>2]|0)|0;E=C+-1|0;c[i>>2]=E;if(!C){aa=F;break}v=F;w=E;o=F;u=c[l>>2]|0;m=A+k|0;x=B}c[j>>2]=aa;return}function Wh(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0;e=c[b+52>>2]|0;f=d[b+60>>0]|0;g=d[b+61>>0]|0;h=d[b+62>>0]|0;i=a[b+63>>0]|0;j=b+28|0;k=c[j>>2]|0;l=(c[b+8>>2]<<16|0)/(k|0)|0;m=b+24|0;n=c[m>>2]|0;o=(c[b+4>>2]<<16|0)/(n|0)|0;p=k+-1|0;c[j>>2]=p;if(!k)return;k=b+20|0;q=b+32|0;r=(e&1|0)==0;s=(e&2|0)==0?255:i&255;i=(e&48|0)!=0&(s|0)!=255;t=e&112;e=s^255;u=b+12|0;v=c[k>>2]|0;w=v;x=p;p=v;v=n;n=0;y=0;while(1){if((n|0)>65535){z=n+-65536|0;A=z>>>16;B=z-(A<<16)|0;C=y+1+A|0}else{B=n;C=y}if(!v)D=x;else{A=v;z=p;E=65536;F=0;G=-1;while(1){A=A+-1|0;if((E|0)>65535){H=E+-65536|0;I=H>>>16;J=G+1+I|0;K=H-(I<<16)|0;L=(c[b>>2]|0)+((ca(c[u>>2]|0,C)|0)+(J<<2))|0;M=J}else{K=E;L=F;M=G}J=c[L>>2]|0;I=J>>>16&255;H=J>>>8&255;N=J&255;J=c[z>>2]|0;O=J>>>16&255;P=J>>>8&255;Q=J&255;R=J>>>24;if(r){S=I;T=H;U=N}else{S=((ca(I,h)|0)>>>0)/255|0;T=((ca(H,g)|0)>>>0)/255|0;U=((ca(N,f)|0)>>>0)/255|0}if(i){V=((ca(S,s)|0)>>>0)/255|0;W=((ca(T,s)|0)>>>0)/255|0;X=((ca(U,s)|0)>>>0)/255|0}else{V=S;W=T;X=U}switch(t|0){case 16:{Y=(((ca(R,e)|0)>>>0)/255|0)+s|0;Z=(((ca(Q,e)|0)>>>0)/255|0)+V|0;_=(((ca(P,e)|0)>>>0)/255|0)+W|0;$=(((ca(O,e)|0)>>>0)/255|0)+X|0;break}case 32:{N=X+O|0;H=W+P|0;I=V+Q|0;Y=R;Z=I>>>0>255?255:I;_=H>>>0>255?255:H;$=N>>>0>255?255:N;break}case 64:{Y=R;Z=((ca(V,Q)|0)>>>0)/255|0;_=((ca(W,P)|0)>>>0)/255|0;$=((ca(X,O)|0)>>>0)/255|0;break}default:{Y=R;Z=Q;_=P;$=O}}c[z>>2]=_<<8|$<<16|Z|Y<<24;if(!A)break;else{z=z+4|0;E=K+o|0;F=L;G=M}}D=c[j>>2]|0}G=w+(c[q>>2]|0)|0;F=D+-1|0;c[j>>2]=F;if(!D){aa=G;break}w=G;x=F;p=G;v=c[m>>2]|0;n=B+l|0;y=C}c[k>>2]=aa;return}function Vh(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0;e=c[b+52>>2]|0;f=d[b+60>>0]|0;g=d[b+61>>0]|0;h=d[b+62>>0]|0;i=a[b+63>>0]|0;j=b+28|0;k=c[j>>2]|0;l=(c[b+8>>2]<<16|0)/(k|0)|0;m=b+24|0;n=c[m>>2]|0;o=(c[b+4>>2]<<16|0)/(n|0)|0;p=k+-1|0;c[j>>2]=p;if(!k)return;k=b+20|0;q=b+32|0;r=(e&1|0)==0;s=(e&2|0)==0?255:i&255;i=(e&48|0)!=0&(s|0)!=255;t=e&112;e=s^255;u=b+12|0;v=c[k>>2]|0;w=v;x=p;p=v;v=n;n=0;y=0;while(1){if((n|0)>65535){z=n+-65536|0;A=z>>>16;B=z-(A<<16)|0;C=y+1+A|0}else{B=n;C=y}if(!v)D=x;else{A=v;z=p;E=65536;F=0;G=-1;while(1){A=A+-1|0;if((E|0)>65535){H=E+-65536|0;I=H>>>16;J=G+1+I|0;K=H-(I<<16)|0;L=(c[b>>2]|0)+((ca(c[u>>2]|0,C)|0)+(J<<2))|0;M=J}else{K=E;L=F;M=G}J=c[L>>2]|0;I=J>>>16&255;H=J>>>8&255;N=J&255;J=c[z>>2]|0;O=J>>>16&255;P=J>>>8&255;Q=J&255;R=J>>>24;if(r){S=N;T=H;U=I}else{S=((ca(N,h)|0)>>>0)/255|0;T=((ca(H,g)|0)>>>0)/255|0;U=((ca(I,f)|0)>>>0)/255|0}if(i){V=((ca(S,s)|0)>>>0)/255|0;W=((ca(T,s)|0)>>>0)/255|0;X=((ca(U,s)|0)>>>0)/255|0}else{V=S;W=T;X=U}switch(t|0){case 16:{Y=(((ca(R,e)|0)>>>0)/255|0)+s|0;Z=(((ca(Q,e)|0)>>>0)/255|0)+V|0;_=(((ca(P,e)|0)>>>0)/255|0)+W|0;$=(((ca(O,e)|0)>>>0)/255|0)+X|0;break}case 32:{I=X+O|0;H=W+P|0;N=V+Q|0;Y=R;Z=N>>>0>255?255:N;_=H>>>0>255?255:H;$=I>>>0>255?255:I;break}case 64:{Y=R;Z=((ca(V,Q)|0)>>>0)/255|0;_=((ca(W,P)|0)>>>0)/255|0;$=((ca(X,O)|0)>>>0)/255|0;break}default:{Y=R;Z=Q;_=P;$=O}}c[z>>2]=_<<8|$<<16|Z|Y<<24;if(!A)break;else{z=z+4|0;E=K+o|0;F=L;G=M}}D=c[j>>2]|0}G=w+(c[q>>2]|0)|0;F=D+-1|0;c[j>>2]=F;if(!D){aa=G;break}w=G;x=F;p=G;v=c[m>>2]|0;n=B+l|0;y=C}c[k>>2]=aa;return}function uh(b,e,f,g,h,j){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,H=0,I=0,J=0,K=0,L=0,M=0;b=i;i=i+240|0;k=b+202|0;l=b+200|0;m=b+24|0;n=b+12|0;o=b+8|0;p=b+40|0;q=b+4|0;r=b;s=xr(g)|0;Un(m,g,k,l);c[n>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;if(!(a[n>>0]&1))t=10;else t=(c[n>>2]&-2)+-1|0;$o(n,t,0);t=n+8|0;g=n+1|0;u=(a[n>>0]&1)==0?g:c[t>>2]|0;c[o>>2]=u;c[q>>2]=p;c[r>>2]=0;v=n+4|0;w=a[l>>0]|0;l=c[e>>2]|0;x=u;a:while(1){if(l)if((c[l+12>>2]|0)==(c[l+16>>2]|0)?(Af[c[(c[l>>2]|0)+36>>2]&127](l)|0)==-1:0){c[e>>2]=0;y=0}else y=l;else y=0;u=(y|0)==0;z=c[f>>2]|0;do if(z){if((c[z+12>>2]|0)!=(c[z+16>>2]|0))if(u){A=z;break}else{B=y;C=z;D=x;break a}if((Af[c[(c[z>>2]|0)+36>>2]&127](z)|0)!=-1)if(u){A=z;break}else{B=y;C=z;D=x;break a}else{c[f>>2]=0;E=13;break}}else E=13;while(0);if((E|0)==13){E=0;if(u){B=y;C=0;D=x;break}else A=0}z=a[n>>0]|0;F=(z&1)==0?(z&255)>>>1:c[v>>2]|0;if((c[o>>2]|0)==(x+F|0)){$o(n,F<<1,0);if(!(a[n>>0]&1))H=10;else H=(c[n>>2]&-2)+-1|0;$o(n,H,0);z=(a[n>>0]&1)==0?g:c[t>>2]|0;c[o>>2]=z+F;I=z}else I=x;z=y+12|0;F=c[z>>2]|0;J=y+16|0;if((F|0)==(c[J>>2]|0))K=Af[c[(c[y>>2]|0)+36>>2]&127](y)|0;else K=d[F>>0]|0;if(wk(K&255,s,I,o,r,w,m,p,q,k)|0){B=y;C=A;D=I;break}F=c[z>>2]|0;if((F|0)==(c[J>>2]|0)){Af[c[(c[y>>2]|0)+40>>2]&127](y)|0;l=y;x=I;continue}else{c[z>>2]=F+1;l=y;x=I;continue}}I=a[m>>0]|0;x=c[q>>2]|0;if((((I&1)==0?(I&255)>>>1:c[m+4>>2]|0)|0)!=0?(x-p|0)<160:0){I=c[r>>2]|0;r=x+4|0;c[q>>2]=r;c[x>>2]=I;L=r}else L=x;x=Nm(D,c[o>>2]|0,h,s)|0;s=j;c[s>>2]=x;c[s+4>>2]=G;Nk(m,p,L,h);if(B)if((c[B+12>>2]|0)==(c[B+16>>2]|0)?(Af[c[(c[B>>2]|0)+36>>2]&127](B)|0)==-1:0){c[e>>2]=0;M=0}else M=B;else M=0;B=(M|0)==0;do if(C){if((c[C+12>>2]|0)==(c[C+16>>2]|0)?(Af[c[(c[C>>2]|0)+36>>2]&127](C)|0)==-1:0){c[f>>2]=0;E=38;break}if(!B)E=39}else E=38;while(0);if((E|0)==38?B:0)E=39;if((E|0)==39)c[h>>2]=c[h>>2]|2;h=c[e>>2]|0;Au(n);Au(m);i=b;return h|0}function th(b,e,f,g,h,j){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,H=0,I=0,J=0,K=0,L=0,M=0;b=i;i=i+240|0;k=b+202|0;l=b+200|0;m=b+24|0;n=b+12|0;o=b+8|0;p=b+40|0;q=b+4|0;r=b;s=xr(g)|0;Un(m,g,k,l);c[n>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;if(!(a[n>>0]&1))t=10;else t=(c[n>>2]&-2)+-1|0;$o(n,t,0);t=n+8|0;g=n+1|0;u=(a[n>>0]&1)==0?g:c[t>>2]|0;c[o>>2]=u;c[q>>2]=p;c[r>>2]=0;v=n+4|0;w=a[l>>0]|0;l=c[e>>2]|0;x=u;a:while(1){if(l)if((c[l+12>>2]|0)==(c[l+16>>2]|0)?(Af[c[(c[l>>2]|0)+36>>2]&127](l)|0)==-1:0){c[e>>2]=0;y=0}else y=l;else y=0;u=(y|0)==0;z=c[f>>2]|0;do if(z){if((c[z+12>>2]|0)!=(c[z+16>>2]|0))if(u){A=z;break}else{B=y;C=z;D=x;break a}if((Af[c[(c[z>>2]|0)+36>>2]&127](z)|0)!=-1)if(u){A=z;break}else{B=y;C=z;D=x;break a}else{c[f>>2]=0;E=13;break}}else E=13;while(0);if((E|0)==13){E=0;if(u){B=y;C=0;D=x;break}else A=0}z=a[n>>0]|0;F=(z&1)==0?(z&255)>>>1:c[v>>2]|0;if((c[o>>2]|0)==(x+F|0)){$o(n,F<<1,0);if(!(a[n>>0]&1))H=10;else H=(c[n>>2]&-2)+-1|0;$o(n,H,0);z=(a[n>>0]&1)==0?g:c[t>>2]|0;c[o>>2]=z+F;I=z}else I=x;z=y+12|0;F=c[z>>2]|0;J=y+16|0;if((F|0)==(c[J>>2]|0))K=Af[c[(c[y>>2]|0)+36>>2]&127](y)|0;else K=d[F>>0]|0;if(wk(K&255,s,I,o,r,w,m,p,q,k)|0){B=y;C=A;D=I;break}F=c[z>>2]|0;if((F|0)==(c[J>>2]|0)){Af[c[(c[y>>2]|0)+40>>2]&127](y)|0;l=y;x=I;continue}else{c[z>>2]=F+1;l=y;x=I;continue}}I=a[m>>0]|0;x=c[q>>2]|0;if((((I&1)==0?(I&255)>>>1:c[m+4>>2]|0)|0)!=0?(x-p|0)<160:0){I=c[r>>2]|0;r=x+4|0;c[q>>2]=r;c[x>>2]=I;L=r}else L=x;x=Ym(D,c[o>>2]|0,h,s)|0;s=j;c[s>>2]=x;c[s+4>>2]=G;Nk(m,p,L,h);if(B)if((c[B+12>>2]|0)==(c[B+16>>2]|0)?(Af[c[(c[B>>2]|0)+36>>2]&127](B)|0)==-1:0){c[e>>2]=0;M=0}else M=B;else M=0;B=(M|0)==0;do if(C){if((c[C+12>>2]|0)==(c[C+16>>2]|0)?(Af[c[(c[C>>2]|0)+36>>2]&127](C)|0)==-1:0){c[f>>2]=0;E=38;break}if(!B)E=39}else E=38;while(0);if((E|0)==38?B:0)E=39;if((E|0)==39)c[h>>2]=c[h>>2]|2;h=c[e>>2]|0;Au(n);Au(m);i=b;return h|0}function Xh(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;b=c[a+24>>2]|0;d=c[a+28>>2]|0;e=c[a+16>>2]>>2;f=c[a+36>>2]>>2;if(!d)return;g=(b+3|0)/4|0;h=b&3;b=d;d=c[a+20>>2]|0;i=c[a>>2]|0;a:while(1){a=b+-1|0;switch(h|0){case 0:{j=d;k=g;l=i;m=4;break}case 3:{n=d;o=g;p=i;m=8;break}case 2:{q=d;r=g;s=i;m=12;break}case 1:{t=d;u=g;v=i;m=16;break}default:{w=d;x=i;m=20}}while(1)if((m|0)==4){m=0;y=c[l>>2]|0;z=y>>>24;switch(z|0){case 0:break;case 255:{c[j>>2]=y;break}default:{A=c[j>>2]|0;B=A&16711935;C=A&65280;c[j>>2]=((ca((y&65280)-C|0,z)|0)>>>8)+C&65280|((ca(A>>>24,z^255)|0)>>>8)+z<<24|((ca((y&16711935)-B|0,z)|0)>>>8)+B&16711935}}n=j+4|0;o=k;p=l+4|0;m=8;continue}else if((m|0)==8){m=0;B=c[p>>2]|0;z=B>>>24;switch(z|0){case 0:break;case 255:{c[n>>2]=B;break}default:{y=c[n>>2]|0;A=y&16711935;C=y&65280;c[n>>2]=((ca((B&65280)-C|0,z)|0)>>>8)+C&65280|((ca(y>>>24,z^255)|0)>>>8)+z<<24|((ca((B&16711935)-A|0,z)|0)>>>8)+A&16711935}}q=n+4|0;r=o;s=p+4|0;m=12;continue}else if((m|0)==12){m=0;A=c[s>>2]|0;z=A>>>24;switch(z|0){case 0:break;case 255:{c[q>>2]=A;break}default:{B=c[q>>2]|0;y=B&16711935;C=B&65280;c[q>>2]=((ca((A&65280)-C|0,z)|0)>>>8)+C&65280|((ca(B>>>24,z^255)|0)>>>8)+z<<24|((ca((A&16711935)-y|0,z)|0)>>>8)+y&16711935}}t=q+4|0;u=r;v=s+4|0;m=16;continue}else if((m|0)==16){m=0;y=c[v>>2]|0;z=y>>>24;switch(z|0){case 0:break;case 255:{c[t>>2]=y;break}default:{A=c[t>>2]|0;B=A&16711935;C=A&65280;c[t>>2]=((ca((y&65280)-C|0,z)|0)>>>8)+C&65280|((ca(A>>>24,z^255)|0)>>>8)+z<<24|((ca((y&16711935)-B|0,z)|0)>>>8)+B&16711935}}B=v+4|0;z=t+4|0;if((u|0)>1){j=z;k=u+-1|0;l=B;m=4;continue}else{w=z;x=B;m=20;continue}}else if((m|0)==20){m=0;if(!a)break a;else{b=a;d=w+(f<<2)|0;i=x+(e<<2)|0;continue a}}}return}function Yh(b,e,f,g,h,i,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;c[f>>2]=b;c[i>>2]=g;if(k&4){k=c[f>>2]|0;b=e;if((((b-k|0)>2?(a[k>>0]|0)==-17:0)?(a[k+1>>0]|0)==-69:0)?(a[k+2>>0]|0)==-65:0){c[f>>2]=k+3;l=c[i>>2]|0;m=b}else{l=g;m=b}}else{l=g;m=e}g=c[f>>2]|0;b=g>>>0<e>>>0;a:do if(b&l>>>0<h>>>0){k=g;n=l;while(1){o=a[k>>0]|0;p=o&255;do if(o<<24>>24>-1){if(p>>>0>j>>>0){q=2;break a}c[n>>2]=p;c[f>>2]=k+1}else{if((o&255)<194){q=2;break a}if((o&255)<224){if((m-k|0)<2){q=1;break a}r=d[k+1>>0]|0;if((r&192|0)!=128){q=2;break a}s=r&63|p<<6&1984;if(s>>>0>j>>>0){q=2;break a}c[n>>2]=s;c[f>>2]=k+2;break}if((o&255)<240){if((m-k|0)<3){q=1;break a}s=a[k+1>>0]|0;r=a[k+2>>0]|0;switch(p|0){case 224:{if((s&-32)<<24>>24!=-96){q=2;break a}break}case 237:{if((s&-32)<<24>>24!=-128){q=2;break a}break}default:if((s&-64)<<24>>24!=-128){q=2;break a}}t=r&255;if((t&192|0)!=128){q=2;break a}r=(s&255)<<6&4032|p<<12&61440|t&63;if(r>>>0>j>>>0){q=2;break a}c[n>>2]=r;c[f>>2]=k+3;break}if((o&255)>=245){q=2;break a}if((m-k|0)<4){q=1;break a}r=a[k+1>>0]|0;t=a[k+2>>0]|0;s=a[k+3>>0]|0;switch(p|0){case 240:{if((r+112&255)>=48){q=2;break a}break}case 244:{if((r&-16)<<24>>24!=-128){q=2;break a}break}default:if((r&-64)<<24>>24!=-128){q=2;break a}}u=t&255;if((u&192|0)!=128){q=2;break a}t=s&255;if((t&192|0)!=128){q=2;break a}s=(r&255)<<12&258048|p<<18&1835008|u<<6&4032|t&63;if(s>>>0>j>>>0){q=2;break a}c[n>>2]=s;c[f>>2]=k+4}while(0);n=(c[i>>2]|0)+4|0;c[i>>2]=n;k=c[f>>2]|0;p=k>>>0<e>>>0;if(!(p&n>>>0<h>>>0)){v=p;w=38;break}}}else{v=b;w=38}while(0);if((w|0)==38)q=v&1;return q|0}function zh(b,e,f,g,h,j){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;b=i;i=i+240|0;k=b;l=b+208|0;m=b+32|0;n=b+28|0;o=b+16|0;p=b+12|0;q=b+48|0;r=b+8|0;s=b+4|0;c[m>>2]=0;c[m+4>>2]=0;c[m+8>>2]=0;t=Hs(g)|0;c[n>>2]=t;g=Ds(n,18276)|0;Pf[c[(c[g>>2]|0)+32>>2]&15](g,32305,32331,l)|0;lr(t)|0;c[o>>2]=0;c[o+4>>2]=0;c[o+8>>2]=0;if(!(a[o>>0]&1))u=10;else u=(c[o>>2]&-2)+-1|0;$o(o,u,0);u=o+8|0;t=o+1|0;g=(a[o>>0]&1)==0?t:c[u>>2]|0;c[p>>2]=g;c[r>>2]=q;c[s>>2]=0;n=o+4|0;v=c[e>>2]|0;w=g;a:while(1){if(v)if((c[v+12>>2]|0)==(c[v+16>>2]|0)?(Af[c[(c[v>>2]|0)+36>>2]&127](v)|0)==-1:0){c[e>>2]=0;x=0}else x=v;else x=0;g=(x|0)==0;y=c[f>>2]|0;do if(y){if((c[y+12>>2]|0)!=(c[y+16>>2]|0))if(g){z=y;break}else{A=x;B=y;C=w;break a}if((Af[c[(c[y>>2]|0)+36>>2]&127](y)|0)!=-1)if(g){z=y;break}else{A=x;B=y;C=w;break a}else{c[f>>2]=0;D=13;break}}else D=13;while(0);if((D|0)==13){D=0;if(g){A=x;B=0;C=w;break}else z=0}y=a[o>>0]|0;E=(y&1)==0?(y&255)>>>1:c[n>>2]|0;if((c[p>>2]|0)==(w+E|0)){$o(o,E<<1,0);if(!(a[o>>0]&1))F=10;else F=(c[o>>2]&-2)+-1|0;$o(o,F,0);y=(a[o>>0]&1)==0?t:c[u>>2]|0;c[p>>2]=y+E;G=y}else G=w;y=x+12|0;E=c[y>>2]|0;H=x+16|0;if((E|0)==(c[H>>2]|0))I=Af[c[(c[x>>2]|0)+36>>2]&127](x)|0;else I=d[E>>0]|0;if(wk(I&255,16,G,p,s,0,m,q,r,l)|0){A=x;B=z;C=G;break}E=c[y>>2]|0;if((E|0)==(c[H>>2]|0)){Af[c[(c[x>>2]|0)+40>>2]&127](x)|0;v=x;w=G;continue}else{c[y>>2]=E+1;v=x;w=G;continue}}$o(o,(c[p>>2]|0)-C|0,0);C=(a[o>>0]&1)==0?t:c[u>>2]|0;u=Ps()|0;c[k>>2]=j;if((Dq(C,u,33689,k)|0)!=1)c[h>>2]=4;if(A)if((c[A+12>>2]|0)==(c[A+16>>2]|0)?(Af[c[(c[A>>2]|0)+36>>2]&127](A)|0)==-1:0){c[e>>2]=0;J=0}else J=A;else J=0;A=(J|0)==0;do if(B){if((c[B+12>>2]|0)==(c[B+16>>2]|0)?(Af[c[(c[B>>2]|0)+36>>2]&127](B)|0)==-1:0){c[f>>2]=0;D=37;break}if(!A)D=38}else D=37;while(0);if((D|0)==37?A:0)D=38;if((D|0)==38)c[h>>2]=c[h>>2]|2;h=c[e>>2]|0;Au(o);Au(m);i=b;return h|0}function ji(a){a=a|0;var d=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;d=c[a+24>>2]|0;f=c[a+28>>2]|0;g=c[a+16>>2]>>2;h=c[a+36>>2]>>1;if(!f)return;i=(d+3|0)/4|0;j=d&3;d=f;f=c[a+20>>2]|0;k=c[a>>2]|0;a:while(1){a=d+-1|0;switch(j|0){case 0:{l=f;m=i;n=k;o=4;break}case 3:{p=f;q=i;r=k;o=8;break}case 2:{s=f;t=i;u=k;o=12;break}case 1:{v=f;w=i;x=k;o=16;break}default:{y=f;z=k;o=20}}while(1)if((o|0)==4){o=0;A=c[n>>2]|0;B=A>>>27;switch(B|0){case 0:break;case 31:{b[l>>1]=A>>>9&31744|A>>>6&992|A>>>3&31;break}default:{C=e[l>>1]|0;D=(C<<16|C)&65043487;C=((ca((A<<10&65011712|A>>>9&31744|A>>>3&31)-D|0,B)|0)>>>5)+D&65043487;b[l>>1]=C>>>16|C}}p=l+2|0;q=m;r=n+4|0;o=8;continue}else if((o|0)==8){o=0;C=c[r>>2]|0;D=C>>>27;switch(D|0){case 0:break;case 31:{b[p>>1]=C>>>9&31744|C>>>6&992|C>>>3&31;break}default:{B=e[p>>1]|0;A=(B<<16|B)&65043487;B=((ca((C<<10&65011712|C>>>9&31744|C>>>3&31)-A|0,D)|0)>>>5)+A&65043487;b[p>>1]=B>>>16|B}}s=p+2|0;t=q;u=r+4|0;o=12;continue}else if((o|0)==12){o=0;B=c[u>>2]|0;A=B>>>27;switch(A|0){case 0:break;case 31:{b[s>>1]=B>>>9&31744|B>>>6&992|B>>>3&31;break}default:{D=e[s>>1]|0;C=(D<<16|D)&65043487;D=((ca((B<<10&65011712|B>>>9&31744|B>>>3&31)-C|0,A)|0)>>>5)+C&65043487;b[s>>1]=D>>>16|D}}v=s+2|0;w=t;x=u+4|0;o=16;continue}else if((o|0)==16){o=0;D=c[x>>2]|0;C=D>>>27;switch(C|0){case 0:break;case 31:{b[v>>1]=D>>>9&31744|D>>>6&992|D>>>3&31;break}default:{A=e[v>>1]|0;B=(A<<16|A)&65043487;A=((ca((D<<10&65011712|D>>>9&31744|D>>>3&31)-B|0,C)|0)>>>5)+B&65043487;b[v>>1]=A>>>16|A}}A=x+4|0;B=v+2|0;if((w|0)>1){l=B;m=w+-1|0;n=A;o=4;continue}else{y=B;z=A;o=20;continue}}else if((o|0)==20){o=0;if(!a)break a;else{d=a;f=y+(h<<1)|0;k=z+(g<<2)|0;continue a}}}return}function yh(b,e,f,g,h,j){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;b=i;i=i+240|0;k=b+202|0;l=b+200|0;m=b+24|0;n=b+12|0;o=b+8|0;p=b+40|0;q=b+4|0;r=b;s=xr(g)|0;Un(m,g,k,l);c[n>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;if(!(a[n>>0]&1))t=10;else t=(c[n>>2]&-2)+-1|0;$o(n,t,0);t=n+8|0;g=n+1|0;u=(a[n>>0]&1)==0?g:c[t>>2]|0;c[o>>2]=u;c[q>>2]=p;c[r>>2]=0;v=n+4|0;w=a[l>>0]|0;l=c[e>>2]|0;x=u;a:while(1){if(l)if((c[l+12>>2]|0)==(c[l+16>>2]|0)?(Af[c[(c[l>>2]|0)+36>>2]&127](l)|0)==-1:0){c[e>>2]=0;y=0}else y=l;else y=0;u=(y|0)==0;z=c[f>>2]|0;do if(z){if((c[z+12>>2]|0)!=(c[z+16>>2]|0))if(u){A=z;break}else{B=y;C=z;D=x;break a}if((Af[c[(c[z>>2]|0)+36>>2]&127](z)|0)!=-1)if(u){A=z;break}else{B=y;C=z;D=x;break a}else{c[f>>2]=0;E=13;break}}else E=13;while(0);if((E|0)==13){E=0;if(u){B=y;C=0;D=x;break}else A=0}z=a[n>>0]|0;F=(z&1)==0?(z&255)>>>1:c[v>>2]|0;if((c[o>>2]|0)==(x+F|0)){$o(n,F<<1,0);if(!(a[n>>0]&1))G=10;else G=(c[n>>2]&-2)+-1|0;$o(n,G,0);z=(a[n>>0]&1)==0?g:c[t>>2]|0;c[o>>2]=z+F;H=z}else H=x;z=y+12|0;F=c[z>>2]|0;I=y+16|0;if((F|0)==(c[I>>2]|0))J=Af[c[(c[y>>2]|0)+36>>2]&127](y)|0;else J=d[F>>0]|0;if(wk(J&255,s,H,o,r,w,m,p,q,k)|0){B=y;C=A;D=H;break}F=c[z>>2]|0;if((F|0)==(c[I>>2]|0)){Af[c[(c[y>>2]|0)+40>>2]&127](y)|0;l=y;x=H;continue}else{c[z>>2]=F+1;l=y;x=H;continue}}H=a[m>>0]|0;x=c[q>>2]|0;if((((H&1)==0?(H&255)>>>1:c[m+4>>2]|0)|0)!=0?(x-p|0)<160:0){H=c[r>>2]|0;r=x+4|0;c[q>>2]=r;c[x>>2]=H;K=r}else K=x;c[j>>2]=um(D,c[o>>2]|0,h,s)|0;Nk(m,p,K,h);if(B)if((c[B+12>>2]|0)==(c[B+16>>2]|0)?(Af[c[(c[B>>2]|0)+36>>2]&127](B)|0)==-1:0){c[e>>2]=0;L=0}else L=B;else L=0;B=(L|0)==0;do if(C){if((c[C+12>>2]|0)==(c[C+16>>2]|0)?(Af[c[(c[C>>2]|0)+36>>2]&127](C)|0)==-1:0){c[f>>2]=0;E=38;break}if(!B)E=39}else E=38;while(0);if((E|0)==38?B:0)E=39;if((E|0)==39)c[h>>2]=c[h>>2]|2;h=c[e>>2]|0;Au(n);Au(m);i=b;return h|0}function xh(b,e,f,g,h,j){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;b=i;i=i+240|0;k=b+202|0;l=b+200|0;m=b+24|0;n=b+12|0;o=b+8|0;p=b+40|0;q=b+4|0;r=b;s=xr(g)|0;Un(m,g,k,l);c[n>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;if(!(a[n>>0]&1))t=10;else t=(c[n>>2]&-2)+-1|0;$o(n,t,0);t=n+8|0;g=n+1|0;u=(a[n>>0]&1)==0?g:c[t>>2]|0;c[o>>2]=u;c[q>>2]=p;c[r>>2]=0;v=n+4|0;w=a[l>>0]|0;l=c[e>>2]|0;x=u;a:while(1){if(l)if((c[l+12>>2]|0)==(c[l+16>>2]|0)?(Af[c[(c[l>>2]|0)+36>>2]&127](l)|0)==-1:0){c[e>>2]=0;y=0}else y=l;else y=0;u=(y|0)==0;z=c[f>>2]|0;do if(z){if((c[z+12>>2]|0)!=(c[z+16>>2]|0))if(u){A=z;break}else{B=y;C=z;D=x;break a}if((Af[c[(c[z>>2]|0)+36>>2]&127](z)|0)!=-1)if(u){A=z;break}else{B=y;C=z;D=x;break a}else{c[f>>2]=0;E=13;break}}else E=13;while(0);if((E|0)==13){E=0;if(u){B=y;C=0;D=x;break}else A=0}z=a[n>>0]|0;F=(z&1)==0?(z&255)>>>1:c[v>>2]|0;if((c[o>>2]|0)==(x+F|0)){$o(n,F<<1,0);if(!(a[n>>0]&1))G=10;else G=(c[n>>2]&-2)+-1|0;$o(n,G,0);z=(a[n>>0]&1)==0?g:c[t>>2]|0;c[o>>2]=z+F;H=z}else H=x;z=y+12|0;F=c[z>>2]|0;I=y+16|0;if((F|0)==(c[I>>2]|0))J=Af[c[(c[y>>2]|0)+36>>2]&127](y)|0;else J=d[F>>0]|0;if(wk(J&255,s,H,o,r,w,m,p,q,k)|0){B=y;C=A;D=H;break}F=c[z>>2]|0;if((F|0)==(c[I>>2]|0)){Af[c[(c[y>>2]|0)+40>>2]&127](y)|0;l=y;x=H;continue}else{c[z>>2]=F+1;l=y;x=H;continue}}H=a[m>>0]|0;x=c[q>>2]|0;if((((H&1)==0?(H&255)>>>1:c[m+4>>2]|0)|0)!=0?(x-p|0)<160:0){H=c[r>>2]|0;r=x+4|0;c[q>>2]=r;c[x>>2]=H;K=r}else K=x;c[j>>2]=Wm(D,c[o>>2]|0,h,s)|0;Nk(m,p,K,h);if(B)if((c[B+12>>2]|0)==(c[B+16>>2]|0)?(Af[c[(c[B>>2]|0)+36>>2]&127](B)|0)==-1:0){c[e>>2]=0;L=0}else L=B;else L=0;B=(L|0)==0;do if(C){if((c[C+12>>2]|0)==(c[C+16>>2]|0)?(Af[c[(c[C>>2]|0)+36>>2]&127](C)|0)==-1:0){c[f>>2]=0;E=38;break}if(!B)E=39}else E=38;while(0);if((E|0)==38?B:0)E=39;if((E|0)==39)c[h>>2]=c[h>>2]|2;h=c[e>>2]|0;Au(n);Au(m);i=b;return h|0}function wh(b,e,f,g,h,j){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;b=i;i=i+240|0;k=b+202|0;l=b+200|0;m=b+24|0;n=b+12|0;o=b+8|0;p=b+40|0;q=b+4|0;r=b;s=xr(g)|0;Un(m,g,k,l);c[n>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;if(!(a[n>>0]&1))t=10;else t=(c[n>>2]&-2)+-1|0;$o(n,t,0);t=n+8|0;g=n+1|0;u=(a[n>>0]&1)==0?g:c[t>>2]|0;c[o>>2]=u;c[q>>2]=p;c[r>>2]=0;v=n+4|0;w=a[l>>0]|0;l=c[e>>2]|0;x=u;a:while(1){if(l)if((c[l+12>>2]|0)==(c[l+16>>2]|0)?(Af[c[(c[l>>2]|0)+36>>2]&127](l)|0)==-1:0){c[e>>2]=0;y=0}else y=l;else y=0;u=(y|0)==0;z=c[f>>2]|0;do if(z){if((c[z+12>>2]|0)!=(c[z+16>>2]|0))if(u){A=z;break}else{B=y;C=z;D=x;break a}if((Af[c[(c[z>>2]|0)+36>>2]&127](z)|0)!=-1)if(u){A=z;break}else{B=y;C=z;D=x;break a}else{c[f>>2]=0;E=13;break}}else E=13;while(0);if((E|0)==13){E=0;if(u){B=y;C=0;D=x;break}else A=0}z=a[n>>0]|0;F=(z&1)==0?(z&255)>>>1:c[v>>2]|0;if((c[o>>2]|0)==(x+F|0)){$o(n,F<<1,0);if(!(a[n>>0]&1))G=10;else G=(c[n>>2]&-2)+-1|0;$o(n,G,0);z=(a[n>>0]&1)==0?g:c[t>>2]|0;c[o>>2]=z+F;H=z}else H=x;z=y+12|0;F=c[z>>2]|0;I=y+16|0;if((F|0)==(c[I>>2]|0))J=Af[c[(c[y>>2]|0)+36>>2]&127](y)|0;else J=d[F>>0]|0;if(wk(J&255,s,H,o,r,w,m,p,q,k)|0){B=y;C=A;D=H;break}F=c[z>>2]|0;if((F|0)==(c[I>>2]|0)){Af[c[(c[y>>2]|0)+40>>2]&127](y)|0;l=y;x=H;continue}else{c[z>>2]=F+1;l=y;x=H;continue}}H=a[m>>0]|0;x=c[q>>2]|0;if((((H&1)==0?(H&255)>>>1:c[m+4>>2]|0)|0)!=0?(x-p|0)<160:0){H=c[r>>2]|0;r=x+4|0;c[q>>2]=r;c[x>>2]=H;K=r}else K=x;c[j>>2]=Vm(D,c[o>>2]|0,h,s)|0;Nk(m,p,K,h);if(B)if((c[B+12>>2]|0)==(c[B+16>>2]|0)?(Af[c[(c[B>>2]|0)+36>>2]&127](B)|0)==-1:0){c[e>>2]=0;L=0}else L=B;else L=0;B=(L|0)==0;do if(C){if((c[C+12>>2]|0)==(c[C+16>>2]|0)?(Af[c[(c[C>>2]|0)+36>>2]&127](C)|0)==-1:0){c[f>>2]=0;E=38;break}if(!B)E=39}else E=38;while(0);if((E|0)==38?B:0)E=39;if((E|0)==39)c[h>>2]=c[h>>2]|2;h=c[e>>2]|0;Au(n);Au(m);i=b;return h|0}function vh(e,f,g,h,j,k){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;e=i;i=i+240|0;l=e+202|0;m=e+200|0;n=e+24|0;o=e+12|0;p=e+8|0;q=e+40|0;r=e+4|0;s=e;t=xr(h)|0;Un(n,h,l,m);c[o>>2]=0;c[o+4>>2]=0;c[o+8>>2]=0;if(!(a[o>>0]&1))u=10;else u=(c[o>>2]&-2)+-1|0;$o(o,u,0);u=o+8|0;h=o+1|0;v=(a[o>>0]&1)==0?h:c[u>>2]|0;c[p>>2]=v;c[r>>2]=q;c[s>>2]=0;w=o+4|0;x=a[m>>0]|0;m=c[f>>2]|0;y=v;a:while(1){if(m)if((c[m+12>>2]|0)==(c[m+16>>2]|0)?(Af[c[(c[m>>2]|0)+36>>2]&127](m)|0)==-1:0){c[f>>2]=0;z=0}else z=m;else z=0;v=(z|0)==0;A=c[g>>2]|0;do if(A){if((c[A+12>>2]|0)!=(c[A+16>>2]|0))if(v){B=A;break}else{C=z;D=A;E=y;break a}if((Af[c[(c[A>>2]|0)+36>>2]&127](A)|0)!=-1)if(v){B=A;break}else{C=z;D=A;E=y;break a}else{c[g>>2]=0;F=13;break}}else F=13;while(0);if((F|0)==13){F=0;if(v){C=z;D=0;E=y;break}else B=0}A=a[o>>0]|0;G=(A&1)==0?(A&255)>>>1:c[w>>2]|0;if((c[p>>2]|0)==(y+G|0)){$o(o,G<<1,0);if(!(a[o>>0]&1))H=10;else H=(c[o>>2]&-2)+-1|0;$o(o,H,0);A=(a[o>>0]&1)==0?h:c[u>>2]|0;c[p>>2]=A+G;I=A}else I=y;A=z+12|0;G=c[A>>2]|0;J=z+16|0;if((G|0)==(c[J>>2]|0))K=Af[c[(c[z>>2]|0)+36>>2]&127](z)|0;else K=d[G>>0]|0;if(wk(K&255,t,I,p,s,x,n,q,r,l)|0){C=z;D=B;E=I;break}G=c[A>>2]|0;if((G|0)==(c[J>>2]|0)){Af[c[(c[z>>2]|0)+40>>2]&127](z)|0;m=z;y=I;continue}else{c[A>>2]=G+1;m=z;y=I;continue}}I=a[n>>0]|0;y=c[r>>2]|0;if((((I&1)==0?(I&255)>>>1:c[n+4>>2]|0)|0)!=0?(y-q|0)<160:0){I=c[s>>2]|0;s=y+4|0;c[r>>2]=s;c[y>>2]=I;L=s}else L=y;b[k>>1]=Um(E,c[p>>2]|0,j,t)|0;Nk(n,q,L,j);if(C)if((c[C+12>>2]|0)==(c[C+16>>2]|0)?(Af[c[(c[C>>2]|0)+36>>2]&127](C)|0)==-1:0){c[f>>2]=0;M=0}else M=C;else M=0;C=(M|0)==0;do if(D){if((c[D+12>>2]|0)==(c[D+16>>2]|0)?(Af[c[(c[D>>2]|0)+36>>2]&127](D)|0)==-1:0){c[g>>2]=0;F=38;break}if(!C)F=39}else F=38;while(0);if((F|0)==38?C:0)F=39;if((F|0)==39)c[j>>2]=c[j>>2]|2;j=c[f>>2]|0;Au(o);Au(n);i=e;return j|0}function ei(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=d[a+63>>0]|0;i=a+28|0;j=c[i>>2]|0;k=(c[a+8>>2]<<16|0)/(j|0)|0;l=a+24|0;m=c[l>>2]|0;n=(c[a+4>>2]<<16|0)/(m|0)|0;o=j+-1|0;c[i>>2]=o;if(!j)return;j=a+20|0;p=a+32|0;q=(b&1|0)==0;r=(b&2|0)==0;s=(b&48|0)!=0;t=b&112;b=a+12|0;u=c[j>>2]|0;v=u;w=o;o=u;u=m;m=0;x=0;while(1){if((m|0)>65535){y=m+-65536|0;z=y>>>16;A=y-(z<<16)|0;B=x+1+z|0}else{A=m;B=x}if(!u)C=w;else{z=u;y=o;D=65536;E=0;F=-1;while(1){z=z+-1|0;if((D|0)>65535){G=D+-65536|0;H=G>>>16;I=F+1+H|0;J=G-(H<<16)|0;K=(c[a>>2]|0)+((ca(c[b>>2]|0,B)|0)+(I<<2))|0;L=I}else{J=D;K=E;L=F}I=c[K>>2]|0;H=I>>>16&255;G=I>>>8&255;M=I&255;N=I>>>24;I=c[y>>2]|0;O=I>>>16&255;P=I>>>8&255;Q=I&255;if(q){R=H;S=G;T=M}else{R=((ca(H,g)|0)>>>0)/255|0;S=((ca(G,f)|0)>>>0)/255|0;T=((ca(M,e)|0)>>>0)/255|0}M=((ca(N,h)|0)>>>0)/255|0;G=r?N:M;if(s&G>>>0<255){U=((ca(G,R)|0)>>>0)/255|0;V=((ca(G,S)|0)>>>0)/255|0;W=((ca(G,T)|0)>>>0)/255|0}else{U=R;V=S;W=T}switch(t|0){case 16:{M=255-G|0;X=(((ca(M,O)|0)>>>0)/255|0)+U|0;Y=(((ca(M,P)|0)>>>0)/255|0)+V|0;Z=(((ca(M,Q)|0)>>>0)/255|0)+W|0;break}case 32:{M=W+Q|0;G=V+P|0;N=U+O|0;X=N>>>0>255?255:N;Y=G>>>0>255?255:G;Z=M>>>0>255?255:M;break}case 64:{X=((ca(U,O)|0)>>>0)/255|0;Y=((ca(V,P)|0)>>>0)/255|0;Z=((ca(W,Q)|0)>>>0)/255|0;break}default:{X=O;Y=P;Z=Q}}c[y>>2]=Y<<8|Z|X<<16;if(!z)break;else{y=y+4|0;D=J+n|0;E=K;F=L}}C=c[i>>2]|0}F=v+(c[p>>2]|0)|0;E=C+-1|0;c[i>>2]=E;if(!C){_=F;break}v=F;w=E;o=F;u=c[l>>2]|0;m=A+k|0;x=B}c[j>>2]=_;return}function di(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=d[a+63>>0]|0;i=a+28|0;j=c[i>>2]|0;k=(c[a+8>>2]<<16|0)/(j|0)|0;l=a+24|0;m=c[l>>2]|0;n=(c[a+4>>2]<<16|0)/(m|0)|0;o=j+-1|0;c[i>>2]=o;if(!j)return;j=a+20|0;p=a+32|0;q=(b&1|0)==0;r=(b&2|0)==0;s=(b&48|0)!=0;t=b&112;b=a+12|0;u=c[j>>2]|0;v=u;w=o;o=u;u=m;m=0;x=0;while(1){if((m|0)>65535){y=m+-65536|0;z=y>>>16;A=y-(z<<16)|0;B=x+1+z|0}else{A=m;B=x}if(!u)C=w;else{z=u;y=o;D=65536;E=0;F=-1;while(1){z=z+-1|0;if((D|0)>65535){G=D+-65536|0;H=G>>>16;I=F+1+H|0;J=G-(H<<16)|0;K=(c[a>>2]|0)+((ca(c[b>>2]|0,B)|0)+(I<<2))|0;L=I}else{J=D;K=E;L=F}I=c[K>>2]|0;H=I>>>16&255;G=I>>>8&255;M=I&255;N=I>>>24;I=c[y>>2]|0;O=I>>>16&255;P=I>>>8&255;Q=I&255;if(q){R=H;S=G;T=M}else{R=((ca(H,g)|0)>>>0)/255|0;S=((ca(G,f)|0)>>>0)/255|0;T=((ca(M,e)|0)>>>0)/255|0}M=((ca(N,h)|0)>>>0)/255|0;G=r?N:M;if(s&G>>>0<255){U=((ca(G,R)|0)>>>0)/255|0;V=((ca(G,S)|0)>>>0)/255|0;W=((ca(G,T)|0)>>>0)/255|0}else{U=R;V=S;W=T}switch(t|0){case 16:{M=255-G|0;X=(((ca(M,Q)|0)>>>0)/255|0)+U|0;Y=(((ca(M,P)|0)>>>0)/255|0)+V|0;Z=(((ca(M,O)|0)>>>0)/255|0)+W|0;break}case 32:{M=W+O|0;G=V+P|0;N=U+Q|0;X=N>>>0>255?255:N;Y=G>>>0>255?255:G;Z=M>>>0>255?255:M;break}case 64:{X=((ca(U,Q)|0)>>>0)/255|0;Y=((ca(V,P)|0)>>>0)/255|0;Z=((ca(W,O)|0)>>>0)/255|0;break}default:{X=Q;Y=P;Z=O}}c[y>>2]=Y<<8|Z<<16|X;if(!z)break;else{y=y+4|0;D=J+n|0;E=K;F=L}}C=c[i>>2]|0}F=v+(c[p>>2]|0)|0;E=C+-1|0;c[i>>2]=E;if(!C){_=F;break}v=F;w=E;o=F;u=c[l>>2]|0;m=A+k|0;x=B}c[j>>2]=_;return}function ci(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=d[a+63>>0]|0;i=a+28|0;j=c[i>>2]|0;k=(c[a+8>>2]<<16|0)/(j|0)|0;l=a+24|0;m=c[l>>2]|0;n=(c[a+4>>2]<<16|0)/(m|0)|0;o=j+-1|0;c[i>>2]=o;if(!j)return;j=a+20|0;p=a+32|0;q=(b&1|0)==0;r=(b&2|0)==0;s=(b&48|0)!=0;t=b&112;b=a+12|0;u=c[j>>2]|0;v=u;w=o;o=u;u=m;m=0;x=0;while(1){if((m|0)>65535){y=m+-65536|0;z=y>>>16;A=y-(z<<16)|0;B=x+1+z|0}else{A=m;B=x}if(!u)C=w;else{z=u;y=o;D=65536;E=0;F=-1;while(1){z=z+-1|0;if((D|0)>65535){G=D+-65536|0;H=G>>>16;I=F+1+H|0;J=G-(H<<16)|0;K=(c[a>>2]|0)+((ca(c[b>>2]|0,B)|0)+(I<<2))|0;L=I}else{J=D;K=E;L=F}I=c[K>>2]|0;H=I>>>16&255;G=I>>>8&255;M=I&255;N=I>>>24;I=c[y>>2]|0;O=I>>>16&255;P=I>>>8&255;Q=I&255;if(q){R=M;S=G;T=H}else{R=((ca(M,g)|0)>>>0)/255|0;S=((ca(G,f)|0)>>>0)/255|0;T=((ca(H,e)|0)>>>0)/255|0}H=((ca(N,h)|0)>>>0)/255|0;G=r?N:H;if(s&G>>>0<255){U=((ca(G,R)|0)>>>0)/255|0;V=((ca(G,S)|0)>>>0)/255|0;W=((ca(G,T)|0)>>>0)/255|0}else{U=R;V=S;W=T}switch(t|0){case 16:{H=255-G|0;X=(((ca(H,O)|0)>>>0)/255|0)+U|0;Y=(((ca(H,P)|0)>>>0)/255|0)+V|0;Z=(((ca(H,Q)|0)>>>0)/255|0)+W|0;break}case 32:{H=W+Q|0;G=V+P|0;N=U+O|0;X=N>>>0>255?255:N;Y=G>>>0>255?255:G;Z=H>>>0>255?255:H;break}case 64:{X=((ca(U,O)|0)>>>0)/255|0;Y=((ca(V,P)|0)>>>0)/255|0;Z=((ca(W,Q)|0)>>>0)/255|0;break}default:{X=O;Y=P;Z=Q}}c[y>>2]=Y<<8|Z|X<<16;if(!z)break;else{y=y+4|0;D=J+n|0;E=K;F=L}}C=c[i>>2]|0}F=v+(c[p>>2]|0)|0;E=C+-1|0;c[i>>2]=E;if(!C){_=F;break}v=F;w=E;o=F;u=c[l>>2]|0;m=A+k|0;x=B}c[j>>2]=_;return}function bi(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=d[a+63>>0]|0;i=a+28|0;j=c[i>>2]|0;k=(c[a+8>>2]<<16|0)/(j|0)|0;l=a+24|0;m=c[l>>2]|0;n=(c[a+4>>2]<<16|0)/(m|0)|0;o=j+-1|0;c[i>>2]=o;if(!j)return;j=a+20|0;p=a+32|0;q=(b&1|0)==0;r=(b&2|0)==0;s=(b&48|0)!=0;t=b&112;b=a+12|0;u=c[j>>2]|0;v=u;w=o;o=u;u=m;m=0;x=0;while(1){if((m|0)>65535){y=m+-65536|0;z=y>>>16;A=y-(z<<16)|0;B=x+1+z|0}else{A=m;B=x}if(!u)C=w;else{z=u;y=o;D=65536;E=0;F=-1;while(1){z=z+-1|0;if((D|0)>65535){G=D+-65536|0;H=G>>>16;I=F+1+H|0;J=G-(H<<16)|0;K=(c[a>>2]|0)+((ca(c[b>>2]|0,B)|0)+(I<<2))|0;L=I}else{J=D;K=E;L=F}I=c[K>>2]|0;H=I>>>16&255;G=I>>>8&255;M=I&255;N=I>>>24;I=c[y>>2]|0;O=I>>>16&255;P=I>>>8&255;Q=I&255;if(q){R=M;S=G;T=H}else{R=((ca(M,g)|0)>>>0)/255|0;S=((ca(G,f)|0)>>>0)/255|0;T=((ca(H,e)|0)>>>0)/255|0}H=((ca(N,h)|0)>>>0)/255|0;G=r?N:H;if(s&G>>>0<255){U=((ca(G,R)|0)>>>0)/255|0;V=((ca(G,S)|0)>>>0)/255|0;W=((ca(G,T)|0)>>>0)/255|0}else{U=R;V=S;W=T}switch(t|0){case 16:{H=255-G|0;X=(((ca(H,Q)|0)>>>0)/255|0)+U|0;Y=(((ca(H,P)|0)>>>0)/255|0)+V|0;Z=(((ca(H,O)|0)>>>0)/255|0)+W|0;break}case 32:{H=W+O|0;G=V+P|0;N=U+Q|0;X=N>>>0>255?255:N;Y=G>>>0>255?255:G;Z=H>>>0>255?255:H;break}case 64:{X=((ca(U,Q)|0)>>>0)/255|0;Y=((ca(V,P)|0)>>>0)/255|0;Z=((ca(W,O)|0)>>>0)/255|0;break}default:{X=Q;Y=P;Z=O}}c[y>>2]=Y<<8|Z<<16|X;if(!z)break;else{y=y+4|0;D=J+n|0;E=K;F=L}}C=c[i>>2]|0}F=v+(c[p>>2]|0)|0;E=C+-1|0;c[i>>2]=E;if(!C){_=F;break}v=F;w=E;o=F;u=c[l>>2]|0;m=A+k|0;x=B}c[j>>2]=_;return}function ai(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=d[a+63>>0]|0;i=a+28|0;j=c[i>>2]|0;k=(c[a+8>>2]<<16|0)/(j|0)|0;l=a+24|0;m=c[l>>2]|0;n=(c[a+4>>2]<<16|0)/(m|0)|0;o=j+-1|0;c[i>>2]=o;if(!j)return;j=a+20|0;p=a+32|0;q=(b&1|0)==0;r=(b&2|0)==0;s=(b&48|0)!=0;t=b&112;b=a+12|0;u=c[j>>2]|0;v=u;w=o;o=u;u=m;m=0;x=0;while(1){if((m|0)>65535){y=m+-65536|0;z=y>>>16;A=y-(z<<16)|0;B=x+1+z|0}else{A=m;B=x}if(!u)C=w;else{z=u;y=o;D=65536;E=0;F=-1;while(1){z=z+-1|0;if((D|0)>65535){G=D+-65536|0;H=G>>>16;I=F+1+H|0;J=G-(H<<16)|0;K=(c[a>>2]|0)+((ca(c[b>>2]|0,B)|0)+(I<<2))|0;L=I}else{J=D;K=E;L=F}I=c[K>>2]|0;H=I>>>24;G=I>>>16&255;M=I>>>8&255;N=I&255;I=c[y>>2]|0;O=I>>>16&255;P=I>>>8&255;Q=I&255;if(q){R=H;S=G;T=M}else{R=((ca(H,g)|0)>>>0)/255|0;S=((ca(G,f)|0)>>>0)/255|0;T=((ca(M,e)|0)>>>0)/255|0}M=((ca(N,h)|0)>>>0)/255|0;G=r?N:M;if(s&G>>>0<255){U=((ca(G,R)|0)>>>0)/255|0;V=((ca(G,S)|0)>>>0)/255|0;W=((ca(G,T)|0)>>>0)/255|0}else{U=R;V=S;W=T}switch(t|0){case 16:{M=255-G|0;X=(((ca(M,O)|0)>>>0)/255|0)+U|0;Y=(((ca(M,P)|0)>>>0)/255|0)+V|0;Z=(((ca(M,Q)|0)>>>0)/255|0)+W|0;break}case 32:{M=W+Q|0;G=V+P|0;N=U+O|0;X=N>>>0>255?255:N;Y=G>>>0>255?255:G;Z=M>>>0>255?255:M;break}case 64:{X=((ca(U,O)|0)>>>0)/255|0;Y=((ca(V,P)|0)>>>0)/255|0;Z=((ca(W,Q)|0)>>>0)/255|0;break}default:{X=O;Y=P;Z=Q}}c[y>>2]=Y<<8|Z|X<<16;if(!z)break;else{y=y+4|0;D=J+n|0;E=K;F=L}}C=c[i>>2]|0}F=v+(c[p>>2]|0)|0;E=C+-1|0;c[i>>2]=E;if(!C){_=F;break}v=F;w=E;o=F;u=c[l>>2]|0;m=A+k|0;x=B}c[j>>2]=_;return}function _h(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=d[a+63>>0]|0;i=a+28|0;j=c[i>>2]|0;k=(c[a+8>>2]<<16|0)/(j|0)|0;l=a+24|0;m=c[l>>2]|0;n=(c[a+4>>2]<<16|0)/(m|0)|0;o=j+-1|0;c[i>>2]=o;if(!j)return;j=a+20|0;p=a+32|0;q=(b&1|0)==0;r=(b&2|0)==0;s=(b&48|0)!=0;t=b&112;b=a+12|0;u=c[j>>2]|0;v=u;w=o;o=u;u=m;m=0;x=0;while(1){if((m|0)>65535){y=m+-65536|0;z=y>>>16;A=y-(z<<16)|0;B=x+1+z|0}else{A=m;B=x}if(!u)C=w;else{z=u;y=o;D=65536;E=0;F=-1;while(1){z=z+-1|0;if((D|0)>65535){G=D+-65536|0;H=G>>>16;I=F+1+H|0;J=G-(H<<16)|0;K=(c[a>>2]|0)+((ca(c[b>>2]|0,B)|0)+(I<<2))|0;L=I}else{J=D;K=E;L=F}I=c[K>>2]|0;H=I>>>24;G=I>>>16&255;M=I>>>8&255;N=I&255;I=c[y>>2]|0;O=I>>>16&255;P=I>>>8&255;Q=I&255;if(q){R=M;S=G;T=H}else{R=((ca(M,g)|0)>>>0)/255|0;S=((ca(G,f)|0)>>>0)/255|0;T=((ca(H,e)|0)>>>0)/255|0}H=((ca(N,h)|0)>>>0)/255|0;G=r?N:H;if(s&G>>>0<255){U=((ca(G,R)|0)>>>0)/255|0;V=((ca(G,S)|0)>>>0)/255|0;W=((ca(G,T)|0)>>>0)/255|0}else{U=R;V=S;W=T}switch(t|0){case 16:{H=255-G|0;X=(((ca(H,O)|0)>>>0)/255|0)+U|0;Y=(((ca(H,P)|0)>>>0)/255|0)+V|0;Z=(((ca(H,Q)|0)>>>0)/255|0)+W|0;break}case 32:{H=W+Q|0;G=V+P|0;N=U+O|0;X=N>>>0>255?255:N;Y=G>>>0>255?255:G;Z=H>>>0>255?255:H;break}case 64:{X=((ca(U,O)|0)>>>0)/255|0;Y=((ca(V,P)|0)>>>0)/255|0;Z=((ca(W,Q)|0)>>>0)/255|0;break}default:{X=O;Y=P;Z=Q}}c[y>>2]=Y<<8|Z|X<<16;if(!z)break;else{y=y+4|0;D=J+n|0;E=K;F=L}}C=c[i>>2]|0}F=v+(c[p>>2]|0)|0;E=C+-1|0;c[i>>2]=E;if(!C){_=F;break}v=F;w=E;o=F;u=c[l>>2]|0;m=A+k|0;x=B}c[j>>2]=_;return}function Zh(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=d[a+63>>0]|0;i=a+28|0;j=c[i>>2]|0;k=(c[a+8>>2]<<16|0)/(j|0)|0;l=a+24|0;m=c[l>>2]|0;n=(c[a+4>>2]<<16|0)/(m|0)|0;o=j+-1|0;c[i>>2]=o;if(!j)return;j=a+20|0;p=a+32|0;q=(b&1|0)==0;r=(b&2|0)==0;s=(b&48|0)!=0;t=b&112;b=a+12|0;u=c[j>>2]|0;v=u;w=o;o=u;u=m;m=0;x=0;while(1){if((m|0)>65535){y=m+-65536|0;z=y>>>16;A=y-(z<<16)|0;B=x+1+z|0}else{A=m;B=x}if(!u)C=w;else{z=u;y=o;D=65536;E=0;F=-1;while(1){z=z+-1|0;if((D|0)>65535){G=D+-65536|0;H=G>>>16;I=F+1+H|0;J=G-(H<<16)|0;K=(c[a>>2]|0)+((ca(c[b>>2]|0,B)|0)+(I<<2))|0;L=I}else{J=D;K=E;L=F}I=c[K>>2]|0;H=I>>>24;G=I>>>16&255;M=I>>>8&255;N=I&255;I=c[y>>2]|0;O=I>>>16&255;P=I>>>8&255;Q=I&255;if(q){R=M;S=G;T=H}else{R=((ca(M,g)|0)>>>0)/255|0;S=((ca(G,f)|0)>>>0)/255|0;T=((ca(H,e)|0)>>>0)/255|0}H=((ca(N,h)|0)>>>0)/255|0;G=r?N:H;if(s&G>>>0<255){U=((ca(G,R)|0)>>>0)/255|0;V=((ca(G,S)|0)>>>0)/255|0;W=((ca(G,T)|0)>>>0)/255|0}else{U=R;V=S;W=T}switch(t|0){case 16:{H=255-G|0;X=(((ca(H,Q)|0)>>>0)/255|0)+U|0;Y=(((ca(H,P)|0)>>>0)/255|0)+V|0;Z=(((ca(H,O)|0)>>>0)/255|0)+W|0;break}case 32:{H=W+O|0;G=V+P|0;N=U+Q|0;X=N>>>0>255?255:N;Y=G>>>0>255?255:G;Z=H>>>0>255?255:H;break}case 64:{X=((ca(U,Q)|0)>>>0)/255|0;Y=((ca(V,P)|0)>>>0)/255|0;Z=((ca(W,O)|0)>>>0)/255|0;break}default:{X=Q;Y=P;Z=O}}c[y>>2]=Y<<8|Z<<16|X;if(!z)break;else{y=y+4|0;D=J+n|0;E=K;F=L}}C=c[i>>2]|0}F=v+(c[p>>2]|0)|0;E=C+-1|0;c[i>>2]=E;if(!C){_=F;break}v=F;w=E;o=F;u=c[l>>2]|0;m=A+k|0;x=B}c[j>>2]=_;return}function $h(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0;b=c[a+52>>2]|0;e=d[a+60>>0]|0;f=d[a+61>>0]|0;g=d[a+62>>0]|0;h=d[a+63>>0]|0;i=a+28|0;j=c[i>>2]|0;k=(c[a+8>>2]<<16|0)/(j|0)|0;l=a+24|0;m=c[l>>2]|0;n=(c[a+4>>2]<<16|0)/(m|0)|0;o=j+-1|0;c[i>>2]=o;if(!j)return;j=a+20|0;p=a+32|0;q=(b&1|0)==0;r=(b&2|0)==0;s=(b&48|0)!=0;t=b&112;b=a+12|0;u=c[j>>2]|0;v=u;w=o;o=u;u=m;m=0;x=0;while(1){if((m|0)>65535){y=m+-65536|0;z=y>>>16;A=y-(z<<16)|0;B=x+1+z|0}else{A=m;B=x}if(!u)C=w;else{z=u;y=o;D=65536;E=0;F=-1;while(1){z=z+-1|0;if((D|0)>65535){G=D+-65536|0;H=G>>>16;I=F+1+H|0;J=G-(H<<16)|0;K=(c[a>>2]|0)+((ca(c[b>>2]|0,B)|0)+(I<<2))|0;L=I}else{J=D;K=E;L=F}I=c[K>>2]|0;H=I>>>24;G=I>>>16&255;M=I>>>8&255;N=I&255;I=c[y>>2]|0;O=I>>>16&255;P=I>>>8&255;Q=I&255;if(q){R=H;S=G;T=M}else{R=((ca(H,g)|0)>>>0)/255|0;S=((ca(G,f)|0)>>>0)/255|0;T=((ca(M,e)|0)>>>0)/255|0}M=((ca(N,h)|0)>>>0)/255|0;G=r?N:M;if(s&G>>>0<255){U=((ca(G,R)|0)>>>0)/255|0;V=((ca(G,S)|0)>>>0)/255|0;W=((ca(G,T)|0)>>>0)/255|0}else{U=R;V=S;W=T}switch(t|0){case 16:{M=255-G|0;X=(((ca(M,Q)|0)>>>0)/255|0)+U|0;Y=(((ca(M,P)|0)>>>0)/255|0)+V|0;Z=(((ca(M,O)|0)>>>0)/255|0)+W|0;break}case 32:{M=W+O|0;G=V+P|0;N=U+Q|0;X=N>>>0>255?255:N;Y=G>>>0>255?255:G;Z=M>>>0>255?255:M;break}case 64:{X=((ca(U,Q)|0)>>>0)/255|0;Y=((ca(V,P)|0)>>>0)/255|0;Z=((ca(W,O)|0)>>>0)/255|0;break}default:{X=Q;Y=P;Z=O}}c[y>>2]=Y<<8|Z<<16|X;if(!z)break;else{y=y+4|0;D=J+n|0;E=K;F=L}}C=c[i>>2]|0}F=v+(c[p>>2]|0)|0;E=C+-1|0;c[i>>2]=E;if(!C){_=F;break}v=F;w=E;o=F;u=c[l>>2]|0;m=A+k|0;x=B}c[j>>2]=_;return}function ii(a){a=a|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;e=c[a+24>>2]|0;f=c[a+28>>2]|0;g=c[a+16>>2]|0;h=c[a+48>>2]|0;i=c[a+56>>2]|0;j=(c[a+36>>2]|0)/2|0;if(!f)return;k=(e+7|0)/8|0;l=e&7;e=f;f=c[a+20>>2]|0;m=c[a>>2]|0;a:while(1){a=e+-1|0;switch(l|0){case 0:{n=f;o=k;p=m;q=4;break}case 7:{r=f;s=k;t=m;q=7;break}case 6:{u=f;v=k;w=m;q=10;break}case 5:{x=f;y=k;z=m;q=13;break}case 4:{A=f;B=k;C=m;q=16;break}case 3:{D=f;E=k;F=m;q=19;break}case 2:{G=f;H=k;I=m;q=22;break}case 1:{J=f;K=k;L=m;q=25;break}default:{M=f;N=m;q=28}}while(1)if((q|0)==4){q=0;O=d[p>>0]|0;if((O|0)!=(i|0))b[n>>1]=b[h+(O<<1)>>1]|0;r=n+2|0;s=o;t=p+1|0;q=7;continue}else if((q|0)==7){q=0;O=d[t>>0]|0;if((O|0)!=(i|0))b[r>>1]=b[h+(O<<1)>>1]|0;u=r+2|0;v=s;w=t+1|0;q=10;continue}else if((q|0)==10){q=0;O=d[w>>0]|0;if((O|0)!=(i|0))b[u>>1]=b[h+(O<<1)>>1]|0;x=u+2|0;y=v;z=w+1|0;q=13;continue}else if((q|0)==13){q=0;O=d[z>>0]|0;if((O|0)!=(i|0))b[x>>1]=b[h+(O<<1)>>1]|0;A=x+2|0;B=y;C=z+1|0;q=16;continue}else if((q|0)==16){q=0;O=d[C>>0]|0;if((O|0)!=(i|0))b[A>>1]=b[h+(O<<1)>>1]|0;D=A+2|0;E=B;F=C+1|0;q=19;continue}else if((q|0)==19){q=0;O=d[F>>0]|0;if((O|0)!=(i|0))b[D>>1]=b[h+(O<<1)>>1]|0;G=D+2|0;H=E;I=F+1|0;q=22;continue}else if((q|0)==22){q=0;O=d[I>>0]|0;if((O|0)!=(i|0))b[G>>1]=b[h+(O<<1)>>1]|0;J=G+2|0;K=H;L=I+1|0;q=25;continue}else if((q|0)==25){q=0;O=d[L>>0]|0;if((O|0)!=(i|0))b[J>>1]=b[h+(O<<1)>>1]|0;O=L+1|0;P=J+2|0;if((K|0)>1){n=P;o=K+-1|0;p=O;q=4;continue}else{M=P;N=O;q=28;continue}}else if((q|0)==28){q=0;if(!a)break a;else{e=a;f=M+(j<<1)|0;m=N+g|0;continue a}}}return}function qi(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0;e=c[b+52>>2]|0;f=d[b+60>>0]|0;g=d[b+61>>0]|0;h=d[b+62>>0]|0;i=a[b+63>>0]|0;j=b+28|0;k=c[j>>2]|0;l=(c[b+8>>2]<<16|0)/(k|0)|0;m=b+24|0;n=c[m>>2]|0;o=(c[b+4>>2]<<16|0)/(n|0)|0;p=k+-1|0;c[j>>2]=p;if(!k)return;k=b+20|0;q=b+32|0;r=(e&1|0)==0;s=(e&2|0)==0?255:i&255;i=(e&48|0)!=0&(s|0)!=255;t=e&112;e=s^255;u=b+12|0;v=c[k>>2]|0;w=v;x=p;p=v;v=n;n=0;y=0;while(1){if((n|0)>65535){z=n+-65536|0;A=z>>>16;B=z-(A<<16)|0;C=y+1+A|0}else{B=n;C=y}if(!v)D=x;else{A=v;z=p;E=65536;F=0;G=-1;while(1){A=A+-1|0;if((E|0)>65535){H=E+-65536|0;I=H>>>16;J=G+1+I|0;K=H-(I<<16)|0;L=(c[b>>2]|0)+((ca(c[u>>2]|0,C)|0)+(J<<2))|0;M=J}else{K=E;L=F;M=G}J=c[L>>2]|0;I=J>>>16&255;H=J>>>8&255;N=J&255;J=c[z>>2]|0;O=J>>>16&255;P=J>>>8&255;Q=J&255;if(r){R=I;S=H;T=N}else{R=((ca(I,h)|0)>>>0)/255|0;S=((ca(H,g)|0)>>>0)/255|0;T=((ca(N,f)|0)>>>0)/255|0}if(i){U=((ca(R,s)|0)>>>0)/255|0;V=((ca(S,s)|0)>>>0)/255|0;W=((ca(T,s)|0)>>>0)/255|0}else{U=R;V=S;W=T}switch(t|0){case 16:{X=(((ca(O,e)|0)>>>0)/255|0)+U|0;Y=(((ca(P,e)|0)>>>0)/255|0)+V|0;Z=(((ca(Q,e)|0)>>>0)/255|0)+W|0;break}case 32:{N=W+Q|0;H=V+P|0;I=U+O|0;X=I>>>0>255?255:I;Y=H>>>0>255?255:H;Z=N>>>0>255?255:N;break}case 64:{X=((ca(U,O)|0)>>>0)/255|0;Y=((ca(V,P)|0)>>>0)/255|0;Z=((ca(W,Q)|0)>>>0)/255|0;break}default:{X=O;Y=P;Z=Q}}c[z>>2]=Y<<8|Z|X<<16;if(!A)break;else{z=z+4|0;E=K+o|0;F=L;G=M}}D=c[j>>2]|0}G=w+(c[q>>2]|0)|0;F=D+-1|0;c[j>>2]=F;if(!D){_=G;break}w=G;x=F;p=G;v=c[m>>2]|0;n=B+l|0;y=C}c[k>>2]=_;return}function pi(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0;e=c[b+52>>2]|0;f=d[b+60>>0]|0;g=d[b+61>>0]|0;h=d[b+62>>0]|0;i=a[b+63>>0]|0;j=b+28|0;k=c[j>>2]|0;l=(c[b+8>>2]<<16|0)/(k|0)|0;m=b+24|0;n=c[m>>2]|0;o=(c[b+4>>2]<<16|0)/(n|0)|0;p=k+-1|0;c[j>>2]=p;if(!k)return;k=b+20|0;q=b+32|0;r=(e&1|0)==0;s=(e&2|0)==0?255:i&255;i=(e&48|0)!=0&(s|0)!=255;t=e&112;e=s^255;u=b+12|0;v=c[k>>2]|0;w=v;x=p;p=v;v=n;n=0;y=0;while(1){if((n|0)>65535){z=n+-65536|0;A=z>>>16;B=z-(A<<16)|0;C=y+1+A|0}else{B=n;C=y}if(!v)D=x;else{A=v;z=p;E=65536;F=0;G=-1;while(1){A=A+-1|0;if((E|0)>65535){H=E+-65536|0;I=H>>>16;J=G+1+I|0;K=H-(I<<16)|0;L=(c[b>>2]|0)+((ca(c[u>>2]|0,C)|0)+(J<<2))|0;M=J}else{K=E;L=F;M=G}J=c[L>>2]|0;I=J>>>16&255;H=J>>>8&255;N=J&255;J=c[z>>2]|0;O=J>>>16&255;P=J>>>8&255;Q=J&255;if(r){R=I;S=H;T=N}else{R=((ca(I,h)|0)>>>0)/255|0;S=((ca(H,g)|0)>>>0)/255|0;T=((ca(N,f)|0)>>>0)/255|0}if(i){U=((ca(R,s)|0)>>>0)/255|0;V=((ca(S,s)|0)>>>0)/255|0;W=((ca(T,s)|0)>>>0)/255|0}else{U=R;V=S;W=T}switch(t|0){case 16:{X=(((ca(Q,e)|0)>>>0)/255|0)+U|0;Y=(((ca(P,e)|0)>>>0)/255|0)+V|0;Z=(((ca(O,e)|0)>>>0)/255|0)+W|0;break}case 32:{N=W+O|0;H=V+P|0;I=U+Q|0;X=I>>>0>255?255:I;Y=H>>>0>255?255:H;Z=N>>>0>255?255:N;break}case 64:{X=((ca(U,Q)|0)>>>0)/255|0;Y=((ca(V,P)|0)>>>0)/255|0;Z=((ca(W,O)|0)>>>0)/255|0;break}default:{X=Q;Y=P;Z=O}}c[z>>2]=Y<<8|Z<<16|X;if(!A)break;else{z=z+4|0;E=K+o|0;F=L;G=M}}D=c[j>>2]|0}G=w+(c[q>>2]|0)|0;F=D+-1|0;c[j>>2]=F;if(!D){_=G;break}w=G;x=F;p=G;v=c[m>>2]|0;n=B+l|0;y=C}c[k>>2]=_;return}function oi(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0;e=c[b+52>>2]|0;f=d[b+60>>0]|0;g=d[b+61>>0]|0;h=d[b+62>>0]|0;i=a[b+63>>0]|0;j=b+28|0;k=c[j>>2]|0;l=(c[b+8>>2]<<16|0)/(k|0)|0;m=b+24|0;n=c[m>>2]|0;o=(c[b+4>>2]<<16|0)/(n|0)|0;p=k+-1|0;c[j>>2]=p;if(!k)return;k=b+20|0;q=b+32|0;r=(e&1|0)==0;s=(e&2|0)==0?255:i&255;i=(e&48|0)!=0&(s|0)!=255;t=e&112;e=s^255;u=b+12|0;v=c[k>>2]|0;w=v;x=p;p=v;v=n;n=0;y=0;while(1){if((n|0)>65535){z=n+-65536|0;A=z>>>16;B=z-(A<<16)|0;C=y+1+A|0}else{B=n;C=y}if(!v)D=x;else{A=v;z=p;E=65536;F=0;G=-1;while(1){A=A+-1|0;if((E|0)>65535){H=E+-65536|0;I=H>>>16;J=G+1+I|0;K=H-(I<<16)|0;L=(c[b>>2]|0)+((ca(c[u>>2]|0,C)|0)+(J<<2))|0;M=J}else{K=E;L=F;M=G}J=c[L>>2]|0;I=J>>>16&255;H=J>>>8&255;N=J&255;J=c[z>>2]|0;O=J>>>16&255;P=J>>>8&255;Q=J&255;if(r){R=N;S=H;T=I}else{R=((ca(N,h)|0)>>>0)/255|0;S=((ca(H,g)|0)>>>0)/255|0;T=((ca(I,f)|0)>>>0)/255|0}if(i){U=((ca(R,s)|0)>>>0)/255|0;V=((ca(S,s)|0)>>>0)/255|0;W=((ca(T,s)|0)>>>0)/255|0}else{U=R;V=S;W=T}switch(t|0){case 16:{X=(((ca(O,e)|0)>>>0)/255|0)+U|0;Y=(((ca(P,e)|0)>>>0)/255|0)+V|0;Z=(((ca(Q,e)|0)>>>0)/255|0)+W|0;break}case 32:{I=W+Q|0;H=V+P|0;N=U+O|0;X=N>>>0>255?255:N;Y=H>>>0>255?255:H;Z=I>>>0>255?255:I;break}case 64:{X=((ca(U,O)|0)>>>0)/255|0;Y=((ca(V,P)|0)>>>0)/255|0;Z=((ca(W,Q)|0)>>>0)/255|0;break}default:{X=O;Y=P;Z=Q}}c[z>>2]=Y<<8|Z|X<<16;if(!A)break;else{z=z+4|0;E=K+o|0;F=L;G=M}}D=c[j>>2]|0}G=w+(c[q>>2]|0)|0;F=D+-1|0;c[j>>2]=F;if(!D){_=G;break}w=G;x=F;p=G;v=c[m>>2]|0;n=B+l|0;y=C}c[k>>2]=_;return}function ni(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0;e=c[b+52>>2]|0;f=d[b+60>>0]|0;g=d[b+61>>0]|0;h=d[b+62>>0]|0;i=a[b+63>>0]|0;j=b+28|0;k=c[j>>2]|0;l=(c[b+8>>2]<<16|0)/(k|0)|0;m=b+24|0;n=c[m>>2]|0;o=(c[b+4>>2]<<16|0)/(n|0)|0;p=k+-1|0;c[j>>2]=p;if(!k)return;k=b+20|0;q=b+32|0;r=(e&1|0)==0;s=(e&2|0)==0?255:i&255;i=(e&48|0)!=0&(s|0)!=255;t=e&112;e=s^255;u=b+12|0;v=c[k>>2]|0;w=v;x=p;p=v;v=n;n=0;y=0;while(1){if((n|0)>65535){z=n+-65536|0;A=z>>>16;B=z-(A<<16)|0;C=y+1+A|0}else{B=n;C=y}if(!v)D=x;else{A=v;z=p;E=65536;F=0;G=-1;while(1){A=A+-1|0;if((E|0)>65535){H=E+-65536|0;I=H>>>16;J=G+1+I|0;K=H-(I<<16)|0;L=(c[b>>2]|0)+((ca(c[u>>2]|0,C)|0)+(J<<2))|0;M=J}else{K=E;L=F;M=G}J=c[L>>2]|0;I=J>>>16&255;H=J>>>8&255;N=J&255;J=c[z>>2]|0;O=J>>>16&255;P=J>>>8&255;Q=J&255;if(r){R=N;S=H;T=I}else{R=((ca(N,h)|0)>>>0)/255|0;S=((ca(H,g)|0)>>>0)/255|0;T=((ca(I,f)|0)>>>0)/255|0}if(i){U=((ca(R,s)|0)>>>0)/255|0;V=((ca(S,s)|0)>>>0)/255|0;W=((ca(T,s)|0)>>>0)/255|0}else{U=R;V=S;W=T}switch(t|0){case 16:{X=(((ca(Q,e)|0)>>>0)/255|0)+U|0;Y=(((ca(P,e)|0)>>>0)/255|0)+V|0;Z=(((ca(O,e)|0)>>>0)/255|0)+W|0;break}case 32:{I=W+O|0;H=V+P|0;N=U+Q|0;X=N>>>0>255?255:N;Y=H>>>0>255?255:H;Z=I>>>0>255?255:I;break}case 64:{X=((ca(U,Q)|0)>>>0)/255|0;Y=((ca(V,P)|0)>>>0)/255|0;Z=((ca(W,O)|0)>>>0)/255|0;break}default:{X=Q;Y=P;Z=O}}c[z>>2]=Y<<8|Z<<16|X;if(!A)break;else{z=z+4|0;E=K+o|0;F=L;G=M}}D=c[j>>2]|0}G=w+(c[q>>2]|0)|0;F=D+-1|0;c[j>>2]=F;if(!D){_=G;break}w=G;x=F;p=G;v=c[m>>2]|0;n=B+l|0;y=C}c[k>>2]=_;return}function ki(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;b=c[a+24>>2]|0;e=c[a+28>>2]|0;f=c[a+16>>2]|0;g=c[a+48>>2]|0;h=c[a+56>>2]|0;i=(c[a+36>>2]|0)/4|0;if(!e)return;j=(b+7|0)/8|0;k=b&7;b=e;e=c[a+20>>2]|0;l=c[a>>2]|0;a:while(1){a=b+-1|0;switch(k|0){case 0:{m=e;n=j;o=l;p=4;break}case 7:{q=e;r=j;s=l;p=7;break}case 6:{t=e;u=j;v=l;p=10;break}case 5:{w=e;x=j;y=l;p=13;break}case 4:{z=e;A=j;B=l;p=16;break}case 3:{C=e;D=j;E=l;p=19;break}case 2:{F=e;G=j;H=l;p=22;break}case 1:{I=e;J=j;K=l;p=25;break}default:{L=e;M=l;p=28}}while(1)if((p|0)==4){p=0;N=d[o>>0]|0;if((N|0)!=(h|0))c[m>>2]=c[g+(N<<2)>>2];q=m+4|0;r=n;s=o+1|0;p=7;continue}else if((p|0)==7){p=0;N=d[s>>0]|0;if((N|0)!=(h|0))c[q>>2]=c[g+(N<<2)>>2];t=q+4|0;u=r;v=s+1|0;p=10;continue}else if((p|0)==10){p=0;N=d[v>>0]|0;if((N|0)!=(h|0))c[t>>2]=c[g+(N<<2)>>2];w=t+4|0;x=u;y=v+1|0;p=13;continue}else if((p|0)==13){p=0;N=d[y>>0]|0;if((N|0)!=(h|0))c[w>>2]=c[g+(N<<2)>>2];z=w+4|0;A=x;B=y+1|0;p=16;continue}else if((p|0)==16){p=0;N=d[B>>0]|0;if((N|0)!=(h|0))c[z>>2]=c[g+(N<<2)>>2];C=z+4|0;D=A;E=B+1|0;p=19;continue}else if((p|0)==19){p=0;N=d[E>>0]|0;if((N|0)!=(h|0))c[C>>2]=c[g+(N<<2)>>2];F=C+4|0;G=D;H=E+1|0;p=22;continue}else if((p|0)==22){p=0;N=d[H>>0]|0;if((N|0)!=(h|0))c[F>>2]=c[g+(N<<2)>>2];I=F+4|0;J=G;K=H+1|0;p=25;continue}else if((p|0)==25){p=0;N=d[K>>0]|0;if((N|0)!=(h|0))c[I>>2]=c[g+(N<<2)>>2];N=K+1|0;O=I+4|0;if((J|0)>1){m=O;n=J+-1|0;o=N;p=4;continue}else{L=O;M=N;p=28;continue}}else if((p|0)==28){p=0;if(!a)break a;else{b=a;e=L+(i<<2)|0;l=M+f|0;continue a}}}return}function ri(a){a=a|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;d=c[a+24>>2]|0;e=c[a+28>>2]|0;f=~c[(c[a+40>>2]|0)+24>>2];g=(c[a+16>>2]|0)/2|0;h=(c[a+36>>2]|0)/2|0;i=c[a+56>>2]&f;if(!e)return;j=(d+7|0)/8|0;k=d&7;d=e;e=c[a+20>>2]|0;l=c[a>>2]|0;a:while(1){a=d+-1|0;switch(k|0){case 0:{m=e;n=j;o=l;p=4;break}case 7:{q=e;r=j;s=l;p=7;break}case 6:{t=e;u=j;v=l;p=10;break}case 5:{w=e;x=j;y=l;p=13;break}case 4:{z=e;A=j;B=l;p=16;break}case 3:{C=e;D=j;E=l;p=19;break}case 2:{F=e;G=j;H=l;p=22;break}case 1:{I=e;J=j;K=l;p=25;break}default:{L=e;M=l;p=28}}while(1)if((p|0)==4){p=0;N=b[o>>1]|0;if((N&65535&f|0)!=(i|0))b[m>>1]=N;q=m+2|0;r=n;s=o+2|0;p=7;continue}else if((p|0)==7){p=0;N=b[s>>1]|0;if((N&65535&f|0)!=(i|0))b[q>>1]=N;t=q+2|0;u=r;v=s+2|0;p=10;continue}else if((p|0)==10){p=0;N=b[v>>1]|0;if((N&65535&f|0)!=(i|0))b[t>>1]=N;w=t+2|0;x=u;y=v+2|0;p=13;continue}else if((p|0)==13){p=0;N=b[y>>1]|0;if((N&65535&f|0)!=(i|0))b[w>>1]=N;z=w+2|0;A=x;B=y+2|0;p=16;continue}else if((p|0)==16){p=0;N=b[B>>1]|0;if((N&65535&f|0)!=(i|0))b[z>>1]=N;C=z+2|0;D=A;E=B+2|0;p=19;continue}else if((p|0)==19){p=0;N=b[E>>1]|0;if((N&65535&f|0)!=(i|0))b[C>>1]=N;F=C+2|0;G=D;H=E+2|0;p=22;continue}else if((p|0)==22){p=0;N=b[H>>1]|0;if((N&65535&f|0)!=(i|0))b[F>>1]=N;I=F+2|0;J=G;K=H+2|0;p=25;continue}else if((p|0)==25){p=0;N=b[K>>1]|0;if((N&65535&f|0)!=(i|0))b[I>>1]=N;N=I+2|0;O=K+2|0;if((J|0)>1){m=N;n=J+-1|0;o=O;p=4;continue}else{L=N;M=O;p=28;continue}}else if((p|0)==28){p=0;if(!a)break a;else{d=a;e=L+(h<<1)|0;l=M+(g<<1)|0;continue a}}}return}function ui(a){a=a|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;d=c[a+24>>2]|0;e=c[a+28>>2]|0;f=(c[a+16>>2]|0)/4|0;g=(c[a+36>>2]|0)/2|0;if(!e)return;h=(d+7|0)/8|0;i=d&7;d=e;e=c[a+20>>2]|0;j=c[a>>2]|0;a:while(1){a=d+-1|0;switch(i|0){case 0:{k=e;l=h;m=j;n=4;break}case 7:{o=e;p=h;q=j;n=5;break}case 6:{r=e;s=h;t=j;n=6;break}case 5:{u=e;v=h;w=j;n=7;break}case 4:{x=e;y=h;z=j;n=8;break}case 3:{A=e;B=h;C=j;n=9;break}case 2:{D=e;E=h;F=j;n=10;break}case 1:{G=e;H=h;I=j;n=11;break}default:{J=e;K=j;n=12}}while(1)if((n|0)==4){n=0;L=c[m>>2]|0;b[k>>1]=L>>>8&63488|L>>>5&2016|L>>>3&31;o=k+2|0;p=l;q=m+4|0;n=5;continue}else if((n|0)==5){n=0;L=c[q>>2]|0;b[o>>1]=L>>>8&63488|L>>>5&2016|L>>>3&31;r=o+2|0;s=p;t=q+4|0;n=6;continue}else if((n|0)==6){n=0;L=c[t>>2]|0;b[r>>1]=L>>>8&63488|L>>>5&2016|L>>>3&31;u=r+2|0;v=s;w=t+4|0;n=7;continue}else if((n|0)==7){n=0;L=c[w>>2]|0;b[u>>1]=L>>>8&63488|L>>>5&2016|L>>>3&31;x=u+2|0;y=v;z=w+4|0;n=8;continue}else if((n|0)==8){n=0;L=c[z>>2]|0;b[x>>1]=L>>>8&63488|L>>>5&2016|L>>>3&31;A=x+2|0;B=y;C=z+4|0;n=9;continue}else if((n|0)==9){n=0;L=c[C>>2]|0;b[A>>1]=L>>>8&63488|L>>>5&2016|L>>>3&31;D=A+2|0;E=B;F=C+4|0;n=10;continue}else if((n|0)==10){n=0;L=c[F>>2]|0;b[D>>1]=L>>>8&63488|L>>>5&2016|L>>>3&31;G=D+2|0;H=E;I=F+4|0;n=11;continue}else if((n|0)==11){n=0;L=c[I>>2]|0;b[G>>1]=L>>>8&63488|L>>>5&2016|L>>>3&31;L=I+4|0;M=G+2|0;if((H|0)>1){k=M;l=H+-1|0;m=L;n=4;continue}else{J=M;K=L;n=12;continue}}else if((n|0)==12){n=0;if(!a)break a;else{d=a;e=J+(g<<1)|0;j=K+(f<<2)|0;continue a}}}return}function vi(a){a=a|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;d=c[a+24>>2]|0;e=c[a+28>>2]|0;f=(c[a+16>>2]|0)/4|0;g=(c[a+36>>2]|0)/2|0;if(!e)return;h=(d+7|0)/8|0;i=d&7;d=e;e=c[a+20>>2]|0;j=c[a>>2]|0;a:while(1){a=d+-1|0;switch(i|0){case 0:{k=e;l=h;m=j;n=4;break}case 7:{o=e;p=h;q=j;n=5;break}case 6:{r=e;s=h;t=j;n=6;break}case 5:{u=e;v=h;w=j;n=7;break}case 4:{x=e;y=h;z=j;n=8;break}case 3:{A=e;B=h;C=j;n=9;break}case 2:{D=e;E=h;F=j;n=10;break}case 1:{G=e;H=h;I=j;n=11;break}default:{J=e;K=j;n=12}}while(1)if((n|0)==4){n=0;L=c[m>>2]|0;b[k>>1]=L>>>9&31744|L>>>6&992|L>>>3&31;o=k+2|0;p=l;q=m+4|0;n=5;continue}else if((n|0)==5){n=0;L=c[q>>2]|0;b[o>>1]=L>>>9&31744|L>>>6&992|L>>>3&31;r=o+2|0;s=p;t=q+4|0;n=6;continue}else if((n|0)==6){n=0;L=c[t>>2]|0;b[r>>1]=L>>>9&31744|L>>>6&992|L>>>3&31;u=r+2|0;v=s;w=t+4|0;n=7;continue}else if((n|0)==7){n=0;L=c[w>>2]|0;b[u>>1]=L>>>9&31744|L>>>6&992|L>>>3&31;x=u+2|0;y=v;z=w+4|0;n=8;continue}else if((n|0)==8){n=0;L=c[z>>2]|0;b[x>>1]=L>>>9&31744|L>>>6&992|L>>>3&31;A=x+2|0;B=y;C=z+4|0;n=9;continue}else if((n|0)==9){n=0;L=c[C>>2]|0;b[A>>1]=L>>>9&31744|L>>>6&992|L>>>3&31;D=A+2|0;E=B;F=C+4|0;n=10;continue}else if((n|0)==10){n=0;L=c[F>>2]|0;b[D>>1]=L>>>9&31744|L>>>6&992|L>>>3&31;G=D+2|0;H=E;I=F+4|0;n=11;continue}else if((n|0)==11){n=0;L=c[I>>2]|0;b[G>>1]=L>>>9&31744|L>>>6&992|L>>>3&31;L=I+4|0;M=G+2|0;if((H|0)>1){k=M;l=H+-1|0;m=L;n=4;continue}else{J=M;K=L;n=12;continue}}else if((n|0)==12){n=0;if(!a)break a;else{d=a;e=J+(g<<1)|0;j=K+(f<<2)|0;continue a}}}return}function Th(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;l=i;i=i+16|0;m=l;a:do if((e|0)==(f|0))n=f;else{o=e;while(1){if(!(a[o>>0]|0)){n=o;break a}o=o+1|0;if((o|0)==(f|0)){n=f;break}}}while(0);c[k>>2]=h;c[g>>2]=e;o=j;p=b+8|0;b:do if((h|0)==(j|0)|(e|0)==(f|0)){q=e;r=29}else{b=e;s=h;t=n;c:while(1){u=d;v=c[u+4>>2]|0;w=m;c[w>>2]=c[u>>2];c[w+4>>2]=v;v=t;w=Tb(c[p>>2]|0)|0;u=$j(s,g,v-b|0,o-s>>2,d)|0;if(w)Tb(w|0)|0;switch(u|0){case 0:{x=2;break b;break}case -1:{y=b;z=s;A=v;break c;break}default:{}}v=(c[k>>2]|0)+(u<<2)|0;c[k>>2]=v;if((v|0)==(j|0)){r=19;break}u=c[g>>2]|0;if((t|0)==(f|0)){B=u;C=v;D=f}else{w=Tb(c[p>>2]|0)|0;E=vk(v,u,1,d)|0;if(w)Tb(w|0)|0;if(E){x=2;break b}c[k>>2]=(c[k>>2]|0)+4;E=(c[g>>2]|0)+1|0;c[g>>2]=E;d:do if((E|0)==(f|0))F=f;else{w=E;while(1){if(!(a[w>>0]|0)){F=w;break d}w=w+1|0;if((w|0)==(f|0)){F=f;break}}}while(0);B=E;C=c[k>>2]|0;D=F}if((C|0)==(j|0)|(B|0)==(f|0)){q=B;r=29;break b}else{b=B;s=C;t=D}}if((r|0)==19){q=c[g>>2]|0;r=29;break}c[k>>2]=z;e:do if((y|0)!=(c[g>>2]|0)){t=y;s=z;f:while(1){b=Tb(c[p>>2]|0)|0;w=vk(s,t,A-t|0,m)|0;if(b)Tb(b|0)|0;switch(w|0){case -1:{G=t;r=13;break f;break}case -2:{H=t;r=14;break f;break}case 0:{I=t+1|0;break}default:I=t+w|0}s=(c[k>>2]|0)+4|0;c[k>>2]=s;if((I|0)==(c[g>>2]|0)){J=I;break e}else t=I}if((r|0)==13){c[g>>2]=G;x=2;break b}else if((r|0)==14){c[g>>2]=H;x=1;break b}}else J=y;while(0);c[g>>2]=J;x=(J|0)!=(f|0)&1}while(0);if((r|0)==29)x=(q|0)!=(f|0)&1;i=l;return x|0}function yi(a,d){a=a|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;e=c[a+24>>2]|0;f=c[a+28>>2]|0;g=c[a+16>>2]>>1;h=c[a+36>>2]>>1;if(!f)return;i=d&65535;j=i^65535;k=e+-1|0;l=i<<16|i;m=~l;n=g+-1|0;o=f;f=c[a+20>>2]|0;p=c[a>>2]|0;while(1){o=o+-1|0;a=p;q=f;if(!((a^q)&2)){if(!(a&2)){r=f;s=p;t=e}else{a=b[f>>1]|0;u=b[p>>1]|0;b[f>>1]=(((u&d&65535)+(a&d&65535)|0)>>>1)+(u&a&65535&j);r=f+2|0;s=p+2|0;t=k}if((t|0)>1){a=t+-2|0;u=a&-2;v=r;w=s;x=t;while(1){y=c[w>>2]|0;z=c[v>>2]|0;c[v>>2]=((z&l)>>>1)+((y&l)>>>1)+(y&m&z);x=x+-2|0;if((x|0)<=1)break;else{v=v+4|0;w=w+4|0}}A=r+(u+2<<1)|0;B=s+(u+2<<1)|0;C=a-u|0}else{A=r;B=s;C=t}if(!C){D=A;E=B}else{w=b[A>>1]|0;v=b[B>>1]|0;b[A>>1]=(((v&d&65535)+(w&d&65535)|0)>>>1)+(v&w&65535&j);D=A+2|0;E=B+2|0}F=D;G=E+(g<<1)|0}else{if(!(q&2)){H=f;I=p;J=e}else{w=b[f>>1]|0;v=b[p>>1]|0;b[f>>1]=(((v&d&65535)+(w&d&65535)|0)>>>1)+(v&w&65535&j);H=f+2|0;I=p+2|0;J=k}w=I+2|0;v=c[I+-2>>2]|0;if((J|0)>1){x=J+-2|0;z=x&-2;y=H;K=v;L=w;M=J;while(1){N=c[L>>2]|0;O=c[y>>2]|0;P=N<<16|K>>>16;c[y>>2]=((P&l)>>>1)+((O&l)>>>1)+(O&m&P);M=M+-2|0;if((M|0)<=1){Q=N;break}else{y=y+4|0;K=N;L=L+4|0}}L=z+3|0;R=L;S=H+(z+2<<1)|0;T=Q;U=I+(L<<1)|0;V=x-z|0}else{R=1;S=H;T=v;U=w;V=J}if(!V){W=S;X=U}else{L=b[S>>1]|0;K=T>>>16;b[S>>1]=(((L&d&65535)+(K&i)|0)>>>1)+(K&j&(L&65535));W=S+2|0;X=I+(R+1<<1)|0}F=W;G=X+(n<<1)|0}if(!o)break;else{f=F+(h<<1)|0;p=G}}return}function ti(d,f,g,h,i,j,k,l){d=d|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0;c[g>>2]=d;c[j>>2]=h;d=i;if(l&2)if((d-h|0)<3)m=1;else{c[j>>2]=h+1;a[h>>0]=-17;h=c[j>>2]|0;c[j>>2]=h+1;a[h>>0]=-69;h=c[j>>2]|0;c[j>>2]=h+1;a[h>>0]=-65;n=4}else n=4;a:do if((n|0)==4){h=f;l=c[g>>2]|0;if(l>>>0<f>>>0){i=l;while(1){l=b[i>>1]|0;o=l&65535;if(o>>>0>k>>>0){m=2;break a}do if((l&65535)<128){p=c[j>>2]|0;if((d-p|0)<1){m=1;break a}c[j>>2]=p+1;a[p>>0]=l}else{if((l&65535)<2048){p=c[j>>2]|0;if((d-p|0)<2){m=1;break a}c[j>>2]=p+1;a[p>>0]=o>>>6|192;p=c[j>>2]|0;c[j>>2]=p+1;a[p>>0]=o&63|128;break}if((l&65535)<55296){p=c[j>>2]|0;if((d-p|0)<3){m=1;break a}c[j>>2]=p+1;a[p>>0]=o>>>12|224;p=c[j>>2]|0;c[j>>2]=p+1;a[p>>0]=o>>>6&63|128;p=c[j>>2]|0;c[j>>2]=p+1;a[p>>0]=o&63|128;break}if((l&65535)>=56320){if((l&65535)<57344){m=2;break a}p=c[j>>2]|0;if((d-p|0)<3){m=1;break a}c[j>>2]=p+1;a[p>>0]=o>>>12|224;p=c[j>>2]|0;c[j>>2]=p+1;a[p>>0]=o>>>6&63|128;p=c[j>>2]|0;c[j>>2]=p+1;a[p>>0]=o&63|128;break}if((h-i|0)<4){m=1;break a}p=i+2|0;q=e[p>>1]|0;if((q&64512|0)!=56320){m=2;break a}if((d-(c[j>>2]|0)|0)<4){m=1;break a}r=o&960;if(((r<<10)+65536|o<<10&64512|q&1023)>>>0>k>>>0){m=2;break a}c[g>>2]=p;p=(r>>>6)+1|0;r=c[j>>2]|0;c[j>>2]=r+1;a[r>>0]=p>>>2|240;r=c[j>>2]|0;c[j>>2]=r+1;a[r>>0]=o>>>2&15|p<<4&48|128;p=c[j>>2]|0;c[j>>2]=p+1;a[p>>0]=o<<4&48|q>>>6&15|128;p=c[j>>2]|0;c[j>>2]=p+1;a[p>>0]=q&63|128}while(0);i=(c[g>>2]|0)+2|0;c[g>>2]=i;if(i>>>0>=f>>>0){m=0;break}}}else m=0}while(0);return m|0}function Eh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0;b=i;i=i+576|0;k=b+424|0;l=b;m=b+24|0;n=b+16|0;o=b+12|0;p=b+8|0;q=b+464|0;r=b+4|0;s=b+468|0;c[n>>2]=m;t=n+4|0;c[t>>2]=300;c[p>>2]=Hs(g)|0;u=Ds(p,18268)|0;a[q>>0]=0;c[r>>2]=c[e>>2];v=c[g+4>>2]|0;c[k>>2]=c[r>>2];if(dg(d,k,f,p,v,h,q,u,n,o,m+400|0)|0){Pf[c[(c[u>>2]|0)+48>>2]&15](u,33777,33787,k)|0;u=c[o>>2]|0;m=c[n>>2]|0;v=u-m|0;if((v|0)>392){f=_f((v>>2)+2|0)|0;if(!f)Iv();else{w=f;x=f}}else{w=0;x=s}if(!(a[q>>0]|0))y=x;else{a[x>>0]=45;y=x+1|0}x=k+40|0;q=k;if(m>>>0<u>>>0){u=k+4|0;f=u+4|0;v=f+4|0;r=v+4|0;g=r+4|0;z=g+4|0;A=z+4|0;B=A+4|0;C=B+4|0;D=y;E=m;while(1){m=c[E>>2]|0;if((c[k>>2]|0)!=(m|0))if((c[u>>2]|0)!=(m|0))if((c[f>>2]|0)!=(m|0))if((c[v>>2]|0)!=(m|0))if((c[r>>2]|0)!=(m|0))if((c[g>>2]|0)!=(m|0))if((c[z>>2]|0)!=(m|0))if((c[A>>2]|0)!=(m|0))if((c[B>>2]|0)==(m|0))F=B;else F=(c[C>>2]|0)==(m|0)?C:x;else F=A;else F=z;else F=g;else F=r;else F=v;else F=f;else F=u;else F=k;a[D>>0]=a[33777+(F-q>>2)>>0]|0;E=E+4|0;m=D+1|0;if(E>>>0>=(c[o>>2]|0)>>>0){G=m;break}else D=m}}else G=y;a[G>>0]=0;c[l>>2]=j;zs(s,33773,l)|0;if(w)yg(w)}w=c[d>>2]|0;do if(w){l=c[w+12>>2]|0;if((l|0)==(c[w+16>>2]|0))H=Af[c[(c[w>>2]|0)+36>>2]&127](w)|0;else H=c[l>>2]|0;if((H|0)==-1){c[d>>2]=0;I=1;break}else{I=(c[d>>2]|0)==0;break}}else I=1;while(0);H=c[e>>2]|0;do if(H){w=c[H+12>>2]|0;if((w|0)==(c[H+16>>2]|0))J=Af[c[(c[H>>2]|0)+36>>2]&127](H)|0;else J=c[w>>2]|0;if((J|0)!=-1)if(I)break;else{K=30;break}else{c[e>>2]=0;K=28;break}}else K=28;while(0);if((K|0)==28?I:0)K=30;if((K|0)==30)c[h>>2]=c[h>>2]|2;h=c[d>>2]|0;lr(c[p>>2]|0)|0;p=c[n>>2]|0;c[n>>2]=0;if(p)xf[c[t>>2]&511](p);i=b;return h|0}
function Hu(a,b,c,d,e){a=a|0;b=+b;c=+c;d=+d;e=+e;dd(a|0,+b,+c,+d,+e)}function Bw(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return Dh(a,b,c,d,0)|0}function ax(a,b,c){a=a|0;b=b|0;c=c|0;dp(a|0,b|0,c|0)|0;return a|0}function Zw(a,b,c){a=a|0;b=b|0;c=c|0;wq(a|0,b|0,c|0)|0;return a|0}function lt(a){a=a|0;var b=0;b=c[(ms()|0)>>2]|0;c[a>>2]=b;rv(b);return}function cw(a,b,c){a=a|0;b=b|0;c=c|0;return (b>>>0<128?b&255:c)|0}function bw(a,b){a=a|0;b=b|0;c[a+16>>2]=(c[a+24>>2]|0)==0|b;return}function Rq(a){a=a|0;Wn(15668)|0;Wn(15836)|0;Vn(16008)|0;Vn(16176)|0;return}function kw(a,b,c){a=a|0;b=b|0;c=c|0;return (b<<24>>24>-1?b:c)|0}function dw(a,b,c,d){a=a|0;b=b|0;c=c|0;d=+d;If[a&1](b|0,c|0,+d)}function rv(a){a=a|0;var b=0;b=a+4|0;c[b>>2]=(c[b>>2]|0)+1;return}function Wv(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+15&-16;return b|0}function jw(a,b){a=a|0;b=b|0;Kb(((b|0)==-1?-1:b<<1)|0)|0;return}function iw(a,b){a=a|0;b=b|0;Kb(((b|0)==-1?-1:b<<1)|0)|0;return}function fy(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;fa(4)}function Nw(a,b,c){a=a|0;b=b|0;c=c|0;return Nf[a&31](b|0,c|0)|0}function Cr(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;sn(a,c,d);return}function Br(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;nn(a,c,d);return}function cv(a){a=a|0;var b=0;b=a+16|0;c[b>>2]=c[b>>2]|1;return}function Zu(a){a=a|0;var b=0;b=i;i=i+16|0;Tf[a&7]();Pr(27516,b)}function Cw(a,b,c,d){a=a|0;b=b|0;c=+c;d=+d;Df[a&3](b|0,+c,+d)}function $x(a,b,c,d,e,f){a=+a;b=+b;c=+c;d=+d;e=+e;f=+f;fa(24)}function gy(a){a=a|0;var b=0;b=(NA(a)|0)==0;return (b?a:a&95)|0}function du(a){a=a|0;kr(a+((c[(c[a>>2]|0)+-12>>2]|0)+8)|0);return}function cu(a){a=a|0;kr(a+((c[(c[a>>2]|0)+-12>>2]|0)+8)|0);return}function bu(a){a=a|0;kr(a+((c[(c[a>>2]|0)+-12>>2]|0)+4)|0);return}function au(a){a=a|0;kr(a+((c[(c[a>>2]|0)+-12>>2]|0)+4)|0);return}function at(){var a=0;a=c[(ns()|0)>>2]|0;c[4761]=a;rv(a);return 19044}function Dy(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;fa(23);return 0}function Zx(a,b){a=a|0;b=b|0;return yq(a,b,(Xw(a|0)|0)+1|0)|0}function sv(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;fc(a|0,+b,+c,+d)}function dv(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;Uc(a|0,+b,+c,+d)}function _s(a){a=a|0;pw(a+(c[(c[a>>2]|0)+-12>>2]|0)|0);return}function Zs(a){a=a|0;ow(a+(c[(c[a>>2]|0)+-12>>2]|0)|0);return}function Ys(a){a=a|0;nw(a+(c[(c[a>>2]|0)+-12>>2]|0)|0);return}function Gu(a){a=a|0;if(a)xf[c[(c[a>>2]|0)+4>>2]&511](a);return}function $s(a){a=a|0;qw(a+(c[(c[a>>2]|0)+-12>>2]|0)|0);return}function qz(a){a=a|0;return ((a|0)==32|(a+-9|0)>>>0<5)&1|0}function Mx(a,b,c){a=a|0;b=b|0;c=c|0;yf[a&127](b|0,c|0)}function Uy(a,b,c,d,e){a=a|0;b=+b;c=+c;d=+d;e=+e;fa(17)}function zv(a,b,c){a=a|0;b=b|0;c=c|0;ue(a|0,b|0,c|0)}function yv(a,b,c){a=a|0;b=b|0;c=c|0;_d(a|0,b|0,c|0)}function uv(a,b,c){a=a|0;b=b|0;c=c|0;Lc(a|0,b|0,c|0)}function tv(a,b,c){a=a|0;b=b|0;c=c|0;Zb(a|0,b|0,c|0)}function qv(a,b,c){a=a|0;b=b|0;c=c|0;Ub(a|0,b|0,c|0)}function pv(a,b,c){a=a|0;b=b|0;c=c|0;Jb(a|0,b|0,c|0)}function ou(a,b,c){a=a|0;b=b|0;c=c|0;Oa(a|0,b|0,c|0)}function iv(a,b,c){a=a|0;b=b|0;c=c|0;Ma(a|0,b|0,c|0)}function hv(a,b,c){a=a|0;b=b|0;c=c|0;hc(a|0,b|0,c|0)}function gv(a,b,c){a=a|0;b=b|0;c=c|0;ve(a|0,b|0,c|0)}function fv(a,b,c){a=a|0;b=b|0;c=c|0;Cd(a|0,b|0,c|0)}function ev(a,b,c){a=a|0;b=b|0;c=c|0;kc(a|0,b|0,c|0)}function Zv(a,b,c){a=a|0;b=b|0;c=c|0;He(a|0,b|0,c|0)}function Yv(a,b,c){a=a|0;b=b|0;c=c|0;rd(a|0,b|0,c|0)}function Yu(a,b,c){a=a|0;b=b|0;c=c|0;xd(a|0,b|0,c|0)}function Vv(a,b,c){a=a|0;b=b|0;c=c|0;$a(a|0,b|0,c|0)}function Tv(a,b,c){a=a|0;b=b|0;c=c|0;he(a|0,b|0,c|0)}function Sv(a,b,c){a=a|0;b=b|0;c=c|0;nd(a|0,b|0,c|0)}function Rv(a,b,c){a=a|0;b=b|0;c=c|0;jf(a|0,b|0,c|0)}function Qv(a,b,c){a=a|0;b=b|0;c=c|0;vd(a|0,b|0,c|0)}function Pv(a,b,c){a=a|0;b=b|0;c=c|0;ab(a|0,b|0,c|0)}function Ov(a,b,c){a=a|0;b=b|0;c=c|0;jb(a|0,b|0,c|0)}function Nv(a,b,c){a=a|0;b=b|0;c=c|0;af(a|0,b|0,c|0)}function Mv(a,b,c){a=a|0;b=b|0;c=c|0;gc(a|0,b|0,c|0)}function Ju(a,b,c){a=a|0;b=b|0;c=c|0;Md(a|0,b|0,c|0)}function Iu(a,b,c){a=a|0;b=b|0;c=c|0;od(a|0,b|0,c|0)}function Fv(a,b,c){a=a|0;b=b|0;c=c|0;ae(a|0,b|0,c|0)}function Ev(a,b,c){a=a|0;b=b|0;c=c|0;Yd(a|0,b|0,c|0)}function Av(a,b,c){a=a|0;b=b|0;c=c|0;Ed(a|0,b|0,c|0)}function jy(a,b,c){a=a|0;b=b|0;c=c|0;return aq(a,b,c)|0}function Ey(a,b,c){a=a|0;b=b|0;c=c|0;return op(a,b,c)|0}function pz(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;fa(30)}function pt(a,b){a=a|0;b=b|0;xp(a,19052,rt(19052)|0);return}function mt(a,b){a=a|0;b=b|0;xp(a,19072,rt(19072)|0);return}function Hv(a,b,c,d){a=+a;b=+b;c=+c;d=+d;db(+a,+b,+c,+d)}function Gv(a,b,c,d){a=+a;b=+b;c=+c;d=+d;ff(+a,+b,+c,+d)}function $v(a,b,c,d){a=+a;b=+b;c=+c;d=+d;$d(+a,+b,+c,+d)}function yz(a,b){a=a|0;b=b|0;return (a+-48|0)>>>0<10|0}function _u(a){a=a|0;c[a>>2]=16940;Ww(a+4|0);wB(a);return}function $u(a){a=a|0;c[a>>2]=16876;Ww(a+4|0);wB(a);return}function zu(b){b=b|0;if(a[b>>0]&1)wB(c[b+8>>2]|0);return}function vs(a,b){a=a|0;b=b|0;return bn(a,b,Xw(b|0)|0)|0}function Au(b){b=b|0;if(a[b>>0]&1)wB(c[b+8>>2]|0);return}function ot(a,b){a=a|0;b=b|0;bp(a,b,Hq(18276)|0);return}function nt(a,b){a=a|0;b=b|0;bp(a,b,Hq(18268)|0);return}function ky(){var a=0;a=c[3701]|0;c[3701]=a+0;return a|0}function js(a,b){a=a|0;b=b|0;bp(a,b,Hq(17316)|0);return}function it(a,b){a=a|0;b=b|0;bp(a,b,Hq(17204)|0);return}function is(a,b){a=a|0;b=b|0;bp(a,b,Hq(17388)|0);return}function ht(a,b){a=a|0;b=b|0;bp(a,b,Hq(17244)|0);return}function hs(a,b){a=a|0;b=b|0;bp(a,b,Hq(17448)|0);return}function gt(a,b){a=a|0;b=b|0;bp(a,b,Hq(18196)|0);return}function gs(a,b){a=a|0;b=b|0;bp(a,b,Hq(17508)|0);return}function ft(a,b){a=a|0;b=b|0;bp(a,b,Hq(18236)|0);return}function fs(a,b){a=a|0;b=b|0;bp(a,b,Hq(17600)|0);return}function et(a,b){a=a|0;b=b|0;bp(a,b,Hq(18416)|0);return}function es(a,b){a=a|0;b=b|0;bp(a,b,Hq(17692)|0);return}function dt(a,b){a=a|0;b=b|0;bp(a,b,Hq(18424)|0);return}function ds(a,b){a=a|0;b=b|0;bp(a,b,Hq(17724)|0);return}function cy(a,b,c){a=a|0;b=+b;c=c|0;Uf[a&1](+b,c|0)}function cs(a,b){a=a|0;b=b|0;bp(a,b,Hq(17756)|0);return}function by(a,b,c){a=a|0;b=b|0;c=+c;vf[a&3](b|0,+c)}function bs(a,b){a=a|0;b=b|0;bp(a,b,Hq(18048)|0);return}function as(a,b){a=a|0;b=b|0;bp(a,b,Hq(18084)|0);return}function _r(a,b){a=a|0;b=b|0;bp(a,b,Hq(18156)|0);return}function Xz(a,b,c){a=a|0;b=b|0;c=c|0;fa(12);return 0}function Ws(a,b){a=a|0;b=b|0;bp(a,b,Hq(17820)|0);return}function Vs(a,b){a=a|0;b=b|0;bp(a,b,Hq(17884)|0);return}function Uv(a,b,c){a=a|0;b=b|0;c=+c;Wb(a|0,b|0,+c)}function Us(a,b){a=a|0;b=b|0;bp(a,b,Hq(17948)|0);return}function Ts(a,b){a=a|0;b=b|0;bp(a,b,Hq(18012)|0);return}function Rs(a,b){a=a|0;b=b|0;bp(a,b,Hq(18336)|0);return}function Qs(a,b){a=a|0;b=b|0;bp(a,b,Hq(18344)|0);return}function Os(a,b){a=a|0;b=b|0;bp(a,b,Hq(18408)|0);return}function Ns(a,b){a=a|0;b=b|0;bp(a,b,Hq(18400)|0);return}function $r(a,b){a=a|0;b=b|0;bp(a,b,Hq(18120)|0);return}function As(a,b){a=a|0;b=b|0;return dn(a,b,rt(b)|0)|0}function Iy(a,b){a=a|0;b=b|0;return Af[a&127](b|0)|0}function Ix(a,b){a=a|0;b=b|0;if(!r){r=a;s=b}}function Ru(a){a=a|0;c[a>>2]=18440;Au(a+12|0);return}function Qu(a){a=a|0;c[a>>2]=18480;Au(a+16|0);return}function wv(a){a=a|0;c[a>>2]=16876;Ww(a+4|0);return}function vv(a){a=a|0;c[a>>2]=16940;Ww(a+4|0);return}function mw(a,b,c){a=a|0;b=b|0;c=c|0;return a|0}function lw(a,b,c){a=a|0;b=b|0;c=c|0;return a|0}function Xv(a,b){a=a|0;b=b|0;return Jc(a|0,b|0)|0}function Lv(a,b){a=a|0;b=b|0;return Hc(a|0,b|0)|0}function Iv(){var a=0;a=id(4)|0;xA(a);df(a|0,784,150)}function mA(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;fa(9)}function gu(a,b){a=a|0;b=b|0;iq(a,b+12|0);return}function fu(a,b){a=a|0;b=b|0;iq(a,b+16|0);return}function _v(a,b,c){a=a|0;b=+b;c=+c;oc(a|0,+b,+c)}function Gw(a,b,c){a=a|0;b=+b;c=+c;Ib(a|0,+b,+c)}function Cy(a,b,c){a=a|0;b=+b;c=+c;Sf[a&3](+b,+c)}function rA(a,b,c,d){a=+a;b=+b;c=+c;d=+d;fa(25)}function eu(a,b){a=a|0;b=b|0;wp(a,33794,4);return}function Xt(a,b){a=a|0;b=b|0;wp(a,33799,5);return}function Py(a,b){a=a|0;b=b|0;return b<<24>>24|0}function Lt(a,b){a=a|0;b=b|0;yp(a,1,45);return}function Kt(a,b){a=a|0;b=b|0;yp(a,1,45);return}function Jt(a,b){a=a|0;b=b|0;zp(a,1,45);return}function It(a,b){a=a|0;b=b|0;zp(a,1,45);return}function DA(a,b,c){a=a|0;b=b|0;c=c|0;fa(15)}function NA(a){a=a|0;return (a+-97|0)>>>0<26|0}function oA(a,b){a=a|0;b=b|0;return Zp(a,b)|0}function eA(a,b){a=a|0;b=b|0;return ap(a,b)|0}function KA(a,b,c){a=a|0;b=b|0;c=+c;fa(16)}function Bz(a,b){a=a|0;b=b|0;xf[a&511](b|0)}function TA(a,b){a=a|0;b=b|0;fa(21);return 0}function zx(a,b){a=a|0;b=b|0;qb(a|0,b|0)}function zw(a,b){a=a|0;b=b|0;Ue(a|0,b|0)}function yx(a,b){a=a|0;b=b|0;Ta(a|0,b|0)}function xx(a,b){a=a|0;b=b|0;cd(a|0,b|0)}function xw(a,b){a=a|0;b=b|0;zd(a|0,b|0)}function wx(a,b){a=a|0;b=b|0;Fd(a|0,b|0)}function ww(a,b){a=a|0;b=b|0;Xa(a|0,b|0)}function vw(a,b){a=a|0;b=b|0;se(a|0,b|0)}function ty(a,b){a=a|0;b=b|0;Mc(a|0,b|0)}function sA(a,b){a=a|0;b=b|0;return ct(a)|0}function lx(a,b){a=a|0;b=b|0;Qb(a|0,b|0)}function kx(a,b){a=a|0;b=b|0;nf(a|0,b|0)}function bx(a,b){a=a|0;b=b|0;bd(a|0,b|0)}function aw(a,b){a=a|0;b=b|0;Cb(a|0,b|0)}function _w(a,b){a=a|0;b=b|0;pe(a|0,b|0)}function Vw(a,b){a=a|0;b=b|0;Rc(a|0,b|0)}function Uw(a,b){a=a|0;b=b|0;ce(a|0,b|0)}function Tw(a,b){a=a|0;b=b|0;hf(a|0,b|0)}function Sx(a,b){a=a|0;b=b|0;jd(a|0,b|0)}function Sw(a,b){a=a|0;b=b|0;Pe(a|0,b|0)}function Rx(a,b){a=a|0;b=b|0;mf(a|0,b|0)}function Rw(a,b){a=a|0;b=b|0;pf(a|0,b|0)}function Qx(a,b){a=a|0;b=b|0;tb(a|0,b|0)}function Qw(a,b){a=a|0;b=b|0;ze(a|0,b|0)}function Px(a,b){a=a|0;b=b|0;ed(a|0,b|0)}function Pw(a,b){a=a|0;b=b|0;Ve(a|0,b|0)}function Nx(a,b){a=a|0;b=b|0;ub(a|0,b|0)}function Iw(a,b){a=a|0;b=b|0;qe(a|0,b|0)}function Hw(a,b){a=a|0;b=b|0;Na(a|0,b|0)}function EA(a,b){a=+a;b=b|0;return +(+In(a,b))}function Dx(a,b){a=a|0;b=b|0;wc(a|0,b|0)}function Bx(a,b){a=a|0;b=b|0;Rd(a|0,b|0)}function Ax(a,b){a=a|0;b=b|0;Yb(a|0,b|0)}function Aw(a,b){a=a|0;b=b|0;$e(a|0,b|0)}function AA(a,b){a=+a;b=b|0;return +(+Bn(a,b))}function $w(a,b){a=a|0;b=b|0;Lb(a|0,b|0)}function qw(a){a=a|0;kr(a+8|0);wB(a);return}function pw(a){a=a|0;kr(a+8|0);wB(a);return}function ow(a){a=a|0;kr(a+4|0);wB(a);return}function nw(a){a=a|0;kr(a+4|0);wB(a);return}function cx(){Kh(2368,1);c[4759]=2368;return 19036}function bv(a){a=a|0;Rt(a+8|0);wB(a);return}function av(a){a=a|0;Rt(a+8|0);wB(a);return}function Ww(a){a=a|0;lr(c[a>>2]|0)|0;return}function RA(a,b,c){a=a|0;b=+b;c=+c;fa(11)}function Kw(){Dj(0);Fb(299,31780,n|0)|0;return}function Ew(a){a=a|0;_a(27659,27688,1164,27757)}function zA(a,b){a=+a;b=+b;return +(+oq(a,b))}function hz(a,b){a=a|0;b=b|0;i=a;j=b}function SA(a,b){a=+a;b=+b;return +(+Ch(a,b))}function Jw(a){a=a|0;_a(27778,27801,303,27757)}function Iz(a,b){a=a|0;b=b|0;return b|0}function xA(a){a=a|0;c[a>>2]=14792;return}function vx(a,b){a=+a;b=b|0;De(+a,b|0)}function ux(a,b){a=a|0;b=+b;Ob(a|0,+b)}function lA(a,b){a=a|0;b=+b;uf[a&3](+b)}function dy(a,b){a=a|0;b=+b;pb(a|0,+b)}function Oy(a){a=a|0;return c[a+12>>2]|0}function Yy(b){b=b|0;return a[b+8>>0]|0}function Xy(b){b=b|0;return a[b+9>>0]|0}function Wx(a,b){a=a|0;b=b|0;return -1}function WA(a){a=a|0;return d[a>>0]|0|0}function Vx(a,b){a=a|0;b=b|0;return -1}function Ux(a,b){a=a|0;b=b|0;return -1}function UA(a){a=a|0;return e[a>>1]|0|0}function Ty(a){a=a|0;return c[a+8>>2]|0}function Tx(a,b){a=a|0;b=b|0;return -1}function xy(a){a=a|0;Ru(a);wB(a);return}function wy(a){a=a|0;Qu(a);wB(a);return}function sw(a){a=a|0;wv(a);wB(a);return}function rw(a){a=a|0;vv(a);wB(a);return}function py(a){a=a|0;Co(a);wB(a);return}function hw(a){a=a|0;wv(a);wB(a);return}function gx(a){a=a|0;kr(a+8|0);return}function gw(a){a=a|0;vv(a);wB(a);return}function fx(a){a=a|0;kr(a+8|0);return}function ex(a){a=a|0;kr(a+4|0);return}function dx(a){a=a|0;kr(a+4|0);return}function Sy(a){a=a|0;bt(a);wB(a);return}function Ry(a){a=a|0;kr(a);wB(a);return}function HA(a){a=a|0;return Of[a&3]()|0}function Dw(a){a=a|0;ls(a);wB(a);return}function Cv(a){a=a|0;Rt(a+8|0);return}function Bv(a){a=a|0;Rt(a+8|0);return}function tx(a,b){a=a|0;b=b|0;return}function sx(a,b){a=a|0;b=b|0;return}function kA(a){a=a|0;Uh(a,10132);return}function jA(a){a=a|0;Uh(a,12180);return}function qy(a){a=a|0;return le(a|0)|0}function qA(a){a=a|0;Uh(a,6036);return}function pA(a){a=a|0;Uh(a,8084);return}function nB(a,b){a=a|0;b=b|0;fa(6)}function hy(a){a=a|0;return Eb(a|0)|0}function ay(a){a=a|0;return ie(a|0)|0}function aB(a){a=a|0;return c[a>>2]|0}function Yw(a){a=a|0;return tc(a|0)|0}function Wy(a){a=a|0;return Nb(a|0)|0}function Vy(a){a=a|0;return Ze(a|0)|0}function Ny(a){a=a|0;kb(a|0)|0;qq()}function My(a){a=a|0;return Db(a|0)|0}function Ly(a){a=a|0;return Gb(a|0)|0}function Ky(a){a=a|0;return yb(a|0)|0}function Jy(a){a=a|0;return Ne(a|0)|0}function $A(a){a=a|0;return Xw(a|0)|0}function vy(a,b){a=+a;b=+b;Id(+a,+b)}function iy(a,b){a=+a;b=+b;Ge(+a,+b)}function _x(a,b){a=+a;b=+b;rc(+a,+b)}function Yx(a){a=a|0;return Oj(a,1)|0}function Xx(a){a=a|0;return Sj(a,1)|0}function Lx(a){a=a|0;return Oj(a,0)|0}function Kx(a){a=a|0;return Sj(a,0)|0}function oB(a,b){a=+a;b=b|0;fa(28)}function vB(a,b){a=a|0;b=+b;fa(3)}function oz(a){a=a|0;return 2147483647}function nz(a){a=a|0;return 2147483647}function mz(a){a=a|0;return 2147483647}function lz(a){a=a|0;return 2147483647}function iB(a){a=a|0;return _f(a)|0}function OB(a){a=a|0;fa(8);return 0}function yB(a,b){a=+a;b=+b;fa(26)}function wB(a){a=a|0;yg(a);return}function wA(a){a=a|0;wB(a);return}function vA(a){a=a|0;wB(a);return}function uA(a){a=a|0;wB(a);return}function tA(a){a=a|0;wB(a);return}function rx(a){a=a|0;wB(a);return}function qx(a){a=a|0;wB(a);return}function qB(a){a=a|0;yg(a);return}function px(a){a=a|0;wB(a);return}function pB(a){a=a|0;wB(a);return}function ox(a){a=a|0;wB(a);return}function nx(a){a=a|0;wB(a);return}function mx(a){a=a|0;wB(a);return}function bA(a){a=a|0;wB(a);return}function _z(a){a=a|0;wB(a);return}function VA(a){a=a|0;wB(a);return}function Qz(a){a=a|0;wB(a);return}function Pz(a){a=a|0;wB(a);return}function PA(a){a=a|0;wB(a);return}function Oz(a){a=a|0;wB(a);return}function MA(a){a=a|0;wB(a);return}function LA(a){a=a|0;wB(a);return}function Jz(a){a=a|0;wB(a);return}function JA(a){a=a|0;wB(a);return}function IA(a){a=a|0;wB(a);return}function Hx(a){a=a|0;wB(a);return}function Gx(a){a=a|0;wB(a);return}function GA(a){a=a|0;wB(a);return}function Fz(a){a=a|0;wB(a);return}function Fx(a){a=a|0;wB(a);return}function Ex(a){a=a|0;wB(a);return}function $z(a){a=a|0;wB(a);return}function cB(a){a=a|0;return 27501}function dB(a){a=a|0;Tf[a&7]()}function Wz(a){a=a|0;return 127}function Vz(a){a=a|0;return 127}function Uz(a){a=a|0;return 127}function Tz(a){a=a|0;return 127}function uy(a){a=a|0;$c(a|0)}function tz(a){a=a|0;Xc(a|0)}function rz(a){a=a|0;cb(a|0)}function nA(a){a=a|0;bc(a|0)}function kz(a){a=a|0;Ke(a|0)}function jz(a){a=a|0;Sc(a|0)}function iz(a){a=a|0;md(a|0)}function gz(a){a=a|0;Fc(a|0)}function fz(a){a=a|0;zc(a|0)}function ey(a){a=a|0;nc(a|0)}function dA(a){a=a|0;Oc(a|0)}function cz(a){a=a|0;return -1}function bz(a){a=a|0;return -1}function az(a){a=a|0;Te(a|0)}function _y(a){a=a|0;Ce(a|0)}function Zy(a){a=a|0;yd(a|0)}function Yz(a){a=a|0;wd(a|0)}function Qy(a){a=a|0;Ie(a|0)}function Ox(a){a=a|0;Ic(a|0)}function Kz(a){a=a|0;Ua(a|0)}function Hy(a){a=a|0;Re(a|0)}function Gy(a){a=a|0;vb(a|0)}function Fy(a){a=a|0;dc(a|0)}function Ez(a){a=a|0;eb(a|0)}function Dz(a){a=a|0;Qd(a|0)}function Cz(a){a=a|0;Za(a|0)}function Cx(a){a=a|0;ib(a|0)}function $y(a){a=a|0;Le(a|0)}function zz(a){a=a|0;return 0}function zB(a){a=a|0;return 0}function xz(a){a=a|0;return 0}function wz(a){a=a|0;return 0}function vz(a){a=a|0;return 0}function uz(a){a=a|0;return 0}function ix(a){a=a|0;return 2}function iA(a){a=a|0;return 0}function hx(a){a=a|0;return 2}function hA(a){a=a|0;return 0}function gA(a){a=a|0;return 0}function fA(a){a=a|0;return 0}function ez(a){a=a|0;return 0}function dz(a){a=a|0;return 0}function aC(a){a=a|0;return 0}function aA(a){a=a|0;return 1}function _B(a){a=a|0;return 0}function ZB(a){a=a|0;return 0}function YB(a){a=a|0;return 0}function XB(a){a=a|0;return 0}function WB(a){a=a|0;return 0}function VB(a){a=a|0;return 0}function UB(a){a=a|0;return 0}function TB(a){a=a|0;return 0}function Sz(a){a=a|0;return 0}function SB(a){a=a|0;return 0}function Rz(a){a=a|0;return 0}function RB(a){a=a|0;return 0}function QB(a){a=a|0;return 0}function PB(a){a=a|0;return 0}function NB(a){a=a|0;return 0}function Mz(a){a=a|0;return 1}function MB(a){a=a|0;return 0}function LB(a){a=a|0;return 0}function KB(a){a=a|0;return 0}function JB(a){a=a|0;return 0}function IB(a){a=a|0;return 0}function Hz(a){a=a|0;return 4}function HB(a){a=a|0;return 0}function Gz(a){a=a|0;return 4}function GB(a){a=a|0;return 0}function FB(a){a=a|0;return 0}function EB(a){a=a|0;return 0}function DB(a){a=a|0;return 0}function CB(a){a=a|0;return 0}function BB(a){a=a|0;return 0}function Az(a){a=a|0;return 1}function AB(a){a=a|0;return 0}function $B(a){a=a|0;return 0}function zy(a){a=a|0;return}function yy(a){a=a|0;return}function tB(a){a=a|0;return}function sy(a){a=a|0;return}function sB(a){a=a|0;return}function ry(a){a=a|0;return}function rB(a){a=a|0;return}function oy(a){a=a|0;return}function ny(a){a=a|0;return}function my(a){a=a|0;return}function mB(a){a=a|0;return}function ly(a){a=a|0;return}function lB(a){a=a|0;return}function kB(a){a=a|0;return}function jB(a){a=a|0;return}function hB(a){a=a|0;return}function gB(a){a=a|0;return}function bB(a){a=a|0;return}function _A(a){a=a|0;return}function ZA(a){a=a|0;return}function YA(a){a=a|0;return}function XA(a){a=a|0;return}function QA(a){a=a|0;return}function OA(a){a=a|0;return}function CA(a){a=a|0;return}function By(a){a=a|0;return}function BA(a){a=a|0;return}function Ay(a){a=a|0;return}function xB(a){a=a|0;G=a}function uB(a){a=a|0;i=a}function dC(a){a=a|0;fa(5)}function eC(){fa(22);return 0}function cA(a){a=+a;sb(+a)}function Zz(a){a=+a;Pc(+a)}function Lz(a){a=+a;vc(+a)}function yA(){return uc()|0}function fC(a){a=+a;fa(2)}function Nz(){return gf()|0}function cC(){return i|0}function bC(){return G|0}function gC(){fa(27)}function sz(){Pa()}function fB(){qc()}function eB(){Od()}function FA(){ac()}

// EMSCRIPTEN_END_FUNCS

 var sf = [ kv, Bm, Hm, Hh, Wi, Eh, Hi, kv ];
 var tf = [ yw, mi, hi, yw ];
 var uf = [ fC, Zz, Lz, cA ];
 var vf = [ vB, dy, ux, vB ];
 var wf = [ fy, hn, ml, Ih, ut, Ms, kt, Ks ];
 var xf = [ dC, fl, Ij, wj, jl, nk, hj, ni, Uk, Fk, xj, zl, ok, ij, oi, bl, Ak, qj, nl, ak, Yi, Vh, Vk, Gk, yj, Al, pk, jj, pi, gl, Hk, zj, Bl, qk, kj, qi, Pk, Bk, rj, ol, bk, Zi, Wh, cl, Xj, Ni, vl, jk, dj, bi, Qk, Yj, Oi, wl, kk, ej, ci, el, Gj, Bi, hl, Lj, Ui, Qh, Jk, Tj, Ji, rl, fk, $i, Zh, Sk, Uj, Ki, sl, gk, aj, _h, Ik, Ej, zi, kl, Pj, Si, Oh, Rk, Zj, Pi, xl, lk, fj, di, dl, _j, Qi, yl, mk, gj, ei, Mk, Hj, Ci, il, Mj, Vi, Rh, Tk, Vj, Li, tl, hk, bj, $h, Kk, Wj, Mi, ul, ik, cj, ai, al, Fj, Ai, ll, Qj, Ti, Ph, Lk, zm, im, Am, yk, nm, om, pm, oh, Fi, Fh, Gi, Kg, ii, Bh, ki, hg, jA, kA, pA, qA, ui, vi, tB, VA, OA, bA, CA, BA, Jz, Fz, vv, gw, rw, wv, hw, sw, $u, _u, gx, qw, du, $s, fx, pw, cu, _s, ex, ow, bu, Zs, dx, nw, au, Ys, kr, Ry, mB, MA, Gu, lB, LA, By, Hx, Ay, Gx, zy, Fx, yy, Ex, sy, rx, ry, qx, Cv, bv, Bv, av, _A, wA, ZA, vA, YA, uA, XA, tA, oy, px, ny, ox, my, nx, ly, mx, kB, JA, jB, IA, Co, py, bt, Sy, ls, Dw, Ru, xy, Qu, wy, gB, GA, PA, _z, Oz, Pz, $z, Qz, xm, tg, Ug, _g, pg, bg, fg, ji, Yg, jg, pj, oj, ng, kg, wg, Xh, xg, ch, Ah, Fg, Mg, ag, vg, lg, Rg, ri, Zf, cg, og, Nr, fz, _y, Zy, kz, rz, Fy, Gy, uy, ey, Hy, tz, jz, Ox, Cx, Ez, dA, Yz, Cz, Kz, nA, gz, Dz, iz, Qy, az, $y, Rq, hB, ov, pq, Gm, Fm, $k, _k, Zk, Yk, Au, zu, yg, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC, dC ];
 var yf = [ nB, zq, Up, Aq, Vp, tx, sx, Ou, Fu, vu, Lt, Bt, Ct, Nu, Eu, uu, Kt, zt, At, Mu, Du, tu, Jt, xt, yt, Lu, Cu, su, It, vt, wt, jw, iw, gu, eu, Xt, fu, pt, mt, wx, yx, Rx, zx, Ax, _w, Dx, Nx, bx, Hw, xw, Iw, Qx, Px, Sw, Rw, Qw, Pw, lx, kx, Vw, Uw, Aw, $w, xx, Tw, zw, vw, Sx, aw, ww, ty, Bx, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB, nB ];
 var zf = [ ew, uk, zo, yo, uo, po, vo, to, jo, lo, ko, zh, tk, xo, wo, ro, oo, so, qo, go, io, ho, ph, _l, Zl, Yl, Xl, fo, Sm, Hn, Gn, Nn, eo, Om, Fn, En, Mn, Ei, Di, ew, ew, ew, ew, ew, ew, ew, ew, ew, ew, ew, ew, ew, ew, ew, ew, ew, ew, ew, ew, ew, ew, ew, ew, ew ];
 var Af = [ OB, WA, UA, uw, aB, CB, _B, KB, YB, IB, $B, LB, ZB, JB, XB, HB, WB, GB, VB, FB, UB, EB, TB, DB, SB, BB, RB, NB, QB, AB, aC, MB, PB, zB, cB, ln, dz, bz, Xq, uz, Kx, Xx, mn, ez, cz, Yq, vz, Lx, Yx, ix, Xk, Bj, Sn, Uq, Tq, Vq, Wq, hx, Wk, Aj, Rn, Mq, Lq, Kq, Nq, Wz, Vz, iA, Uz, Tz, hA, oz, nz, gA, mz, lz, fA, Kp, zz, mr, Yy, Xy, Ty, Oy, aA, Az, Mz, Rz, wz, Gz, Sz, xz, Hz, Qp, zr, My, Jy, Wy, ay, qy, Vy, Ky, hy, Yw, Ly, OB, OB, OB, OB, OB, OB, OB, OB, OB, OB, OB, OB, OB, OB, OB, OB, OB, OB, OB, OB, OB, OB, OB ];
 var Bf = [ mA, sv, dv, mA ];
 var Cf = [ jx, xn, Ln, Ek, Ll, Kl, Ql, Dk, Jl, Il, Pl, rq, _m, Qm, Tp, Gt, Ls, Dt, Xr, Et, Yr, vm, wm, hm, ym, cm, bm, $l, jx, jx, jx, jx ];
 var Df = [ RA, Gw, _v, RA ];
 var Ef = [ Xz, kn, hr, lw, un, So, Cn, mw, wn, To, Dn, $p, _p, pr, or, Rp, Sp, kw, Rr, Lp, Mp, cw, Tm, jy, Xz, Xz, Xz, Xz, Xz, Xz, Xz, Xz ];
 var Ff = [ Vu, yr, Gr, Ar ];
 var Gf = [ Lw, vq, Ep, Fl, cr, dr, gm, rk, us, qs, Lw, Lw, Lw, Lw, Lw, Lw ];
 var Hf = [ DA, iv, hv, qv, pv, Yu, ou, zv, yv, gv, fv, Iu, Yv, Sv, Qv, Ov, Mv, Tv, Rv, Pv, Nv, Fv, Av, ev, Ju, uv, Vv, tv, Ev, Zv, DA, DA ];
 var If = [ KA, Uv ];
 var Jf = [ Uy, Hu, hu, Uy ];
 var Kf = [ mu, Hg, Gg, gi, Th, Lr, Mr, sp, tp, up, vp, mu, mu, mu, mu, mu ];
 var Lf = [ Dv, ks, Sr, Ur ];
 var Mf = [ Wt, fr, rr, qr ];
 var Nf = [ TA, Tx, Cl, Sl, Vx, Ux, Dl, Ul, Wx, Zr, Wr, Iz, ss, ts, Py, Lv, Xv, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA ];
 var Of = [ eC, Nz, yA, eC ];
 var Pf = [ Dy, Pq, Ap, Dp, rp, Sq, ir, er, br, Xf, qg, Ok, Dy, Dy, Dy, Dy ];
 var Qf = [ $x, ku ];
 var Rf = [ rA, $v, Gv, Hv ];
 var Sf = [ yB, vy, iy, _x ];
 var Tf = [ gC, sm, Bs, FA, sz, eB, fB, gC ];
 var Uf = [ oB, vx ];
 var Vf = [ Jx, ek, Nj, dk, Jj, Jx, Jx, Jx ];
 var Wf = [ pz, ar, Qq, Pp, an, tr, ur, Cr, Br, Ku, qu, Su, _t, Zt, Yt, Qt, wu, ju, $t, qt, Ut, st, Is, pu, nu, iu, yu, xu, Ot, Uu, Xu, Tu, Nt, Vt, Mt, Tt, pz, pz, pz, pz, pz, pz, pz, pz, pz, pz, pz, pz, pz, pz, pz, pz, pz, pz, pz, pz, pz, pz, pz, pz, pz, pz, pz, pz ];
 return {
  ___cxa_can_catch: Cq,
  _free: yg,
  _main: _i,
  ___cxa_is_pointer_type: ru,
  _i64Add: tt,
  _memmove: wq,
  _strstr: Bg,
  _i64Subtract: Fs,
  _memset: Cp,
  _malloc: _f,
  _memcpy: dp,
  _strlen: Xw,
  _bitshift64Lshr: Gs,
  _emscripten_GetProcAddress: rg,
  _strcpy: Ht,
  _llvm_bswap_i32: Mw,
  _bitshift64Shl: Es,
  __GLOBAL__sub_I_iostream_cpp: Kw,
  runPostSets: cp,
  stackAlloc: Wv,
  stackSave: cC,
  stackRestore: uB,
  establishStackSpace: hz,
  setThrew: Ix,
  setTempRet0: xB,
  getTempRet0: bC,
  dynCall_iiiiiiii: Or,
  dynCall_iiiiiid: xs,
  dynCall_vd: lA,
  dynCall_vid: by,
  dynCall_viiiii: jt,
  dynCall_vi: Bz,
  dynCall_vii: Mx,
  dynCall_iiiiiii: ps,
  dynCall_ii: Iy,
  dynCall_viddd: nv,
  dynCall_iiiiii: Ss,
  dynCall_vidd: Cw,
  dynCall_iiii: jv,
  dynCall_viiiiiiii: Er,
  dynCall_viiiiii: Cs,
  dynCall_viii: Jv,
  dynCall_viid: dw,
  dynCall_vidddd: lu,
  dynCall_iiiiiiiii: vr,
  dynCall_viiiiiii: Vr,
  dynCall_viiiiiiiii: jr,
  dynCall_iii: Nw,
  dynCall_i: HA,
  dynCall_iiiii: St,
  dynCall_vdddddd: Ft,
  dynCall_vdddd: xv,
  dynCall_vdd: Cy,
  dynCall_v: dB,
  dynCall_vdi: cy,
  dynCall_iiiiid: Xs,
  dynCall_viiii: Bu
 };
})


// EMSCRIPTEN_END_ASM
(Module.asmGlobalArg, Module.asmLibraryArg, buffer);
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var ___cxa_can_catch = Module["___cxa_can_catch"] = asm["___cxa_can_catch"];
var _free = Module["_free"] = asm["_free"];
var _main = Module["_main"] = asm["_main"];
var ___cxa_is_pointer_type = Module["___cxa_is_pointer_type"] = asm["___cxa_is_pointer_type"];
var _i64Add = Module["_i64Add"] = asm["_i64Add"];
var _memmove = Module["_memmove"] = asm["_memmove"];
var _strstr = Module["_strstr"] = asm["_strstr"];
var _i64Subtract = Module["_i64Subtract"] = asm["_i64Subtract"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var __GLOBAL__sub_I_iostream_cpp = Module["__GLOBAL__sub_I_iostream_cpp"] = asm["__GLOBAL__sub_I_iostream_cpp"];
var _bitshift64Lshr = Module["_bitshift64Lshr"] = asm["_bitshift64Lshr"];
var _emscripten_GetProcAddress = Module["_emscripten_GetProcAddress"] = asm["_emscripten_GetProcAddress"];
var _strcpy = Module["_strcpy"] = asm["_strcpy"];
var _llvm_bswap_i32 = Module["_llvm_bswap_i32"] = asm["_llvm_bswap_i32"];
var _bitshift64Shl = Module["_bitshift64Shl"] = asm["_bitshift64Shl"];
var dynCall_iiiiiiii = Module["dynCall_iiiiiiii"] = asm["dynCall_iiiiiiii"];
var dynCall_iiiiiid = Module["dynCall_iiiiiid"] = asm["dynCall_iiiiiid"];
var dynCall_vd = Module["dynCall_vd"] = asm["dynCall_vd"];
var dynCall_vid = Module["dynCall_vid"] = asm["dynCall_vid"];
var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_iiiiiii = Module["dynCall_iiiiiii"] = asm["dynCall_iiiiiii"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_viddd = Module["dynCall_viddd"] = asm["dynCall_viddd"];
var dynCall_iiiiii = Module["dynCall_iiiiii"] = asm["dynCall_iiiiii"];
var dynCall_vidd = Module["dynCall_vidd"] = asm["dynCall_vidd"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_viiiiiiii = Module["dynCall_viiiiiiii"] = asm["dynCall_viiiiiiii"];
var dynCall_viiiiii = Module["dynCall_viiiiii"] = asm["dynCall_viiiiii"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_viid = Module["dynCall_viid"] = asm["dynCall_viid"];
var dynCall_vidddd = Module["dynCall_vidddd"] = asm["dynCall_vidddd"];
var dynCall_iiiiiiiii = Module["dynCall_iiiiiiiii"] = asm["dynCall_iiiiiiiii"];
var dynCall_viiiiiii = Module["dynCall_viiiiiii"] = asm["dynCall_viiiiiii"];
var dynCall_viiiiiiiii = Module["dynCall_viiiiiiiii"] = asm["dynCall_viiiiiiiii"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_i = Module["dynCall_i"] = asm["dynCall_i"];
var dynCall_iiiii = Module["dynCall_iiiii"] = asm["dynCall_iiiii"];
var dynCall_vdddddd = Module["dynCall_vdddddd"] = asm["dynCall_vdddddd"];
var dynCall_vdddd = Module["dynCall_vdddd"] = asm["dynCall_vdddd"];
var dynCall_vdd = Module["dynCall_vdd"] = asm["dynCall_vdd"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_vdi = Module["dynCall_vdi"] = asm["dynCall_vdi"];
var dynCall_iiiiid = Module["dynCall_iiiiid"] = asm["dynCall_iiiiid"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];
Runtime.stackAlloc = asm["stackAlloc"];
Runtime.stackSave = asm["stackSave"];
Runtime.stackRestore = asm["stackRestore"];
Runtime.establishStackSpace = asm["establishStackSpace"];
Runtime.setTempRet0 = asm["setTempRet0"];
Runtime.getTempRet0 = asm["getTempRet0"];
var i64Math = (function() {
 var goog = {
  math: {}
 };
 goog.math.Long = (function(low, high) {
  this.low_ = low | 0;
  this.high_ = high | 0;
 });
 goog.math.Long.IntCache_ = {};
 goog.math.Long.fromInt = (function(value) {
  if (-128 <= value && value < 128) {
   var cachedObj = goog.math.Long.IntCache_[value];
   if (cachedObj) {
    return cachedObj;
   }
  }
  var obj = new goog.math.Long(value | 0, value < 0 ? -1 : 0);
  if (-128 <= value && value < 128) {
   goog.math.Long.IntCache_[value] = obj;
  }
  return obj;
 });
 goog.math.Long.fromNumber = (function(value) {
  if (isNaN(value) || !isFinite(value)) {
   return goog.math.Long.ZERO;
  } else if (value <= -goog.math.Long.TWO_PWR_63_DBL_) {
   return goog.math.Long.MIN_VALUE;
  } else if (value + 1 >= goog.math.Long.TWO_PWR_63_DBL_) {
   return goog.math.Long.MAX_VALUE;
  } else if (value < 0) {
   return goog.math.Long.fromNumber(-value).negate();
  } else {
   return new goog.math.Long(value % goog.math.Long.TWO_PWR_32_DBL_ | 0, value / goog.math.Long.TWO_PWR_32_DBL_ | 0);
  }
 });
 goog.math.Long.fromBits = (function(lowBits, highBits) {
  return new goog.math.Long(lowBits, highBits);
 });
 goog.math.Long.fromString = (function(str, opt_radix) {
  if (str.length == 0) {
   throw Error("number format error: empty string");
  }
  var radix = opt_radix || 10;
  if (radix < 2 || 36 < radix) {
   throw Error("radix out of range: " + radix);
  }
  if (str.charAt(0) == "-") {
   return goog.math.Long.fromString(str.substring(1), radix).negate();
  } else if (str.indexOf("-") >= 0) {
   throw Error('number format error: interior "-" character: ' + str);
  }
  var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 8));
  var result = goog.math.Long.ZERO;
  for (var i = 0; i < str.length; i += 8) {
   var size = Math.min(8, str.length - i);
   var value = parseInt(str.substring(i, i + size), radix);
   if (size < 8) {
    var power = goog.math.Long.fromNumber(Math.pow(radix, size));
    result = result.multiply(power).add(goog.math.Long.fromNumber(value));
   } else {
    result = result.multiply(radixToPower);
    result = result.add(goog.math.Long.fromNumber(value));
   }
  }
  return result;
 });
 goog.math.Long.TWO_PWR_16_DBL_ = 1 << 16;
 goog.math.Long.TWO_PWR_24_DBL_ = 1 << 24;
 goog.math.Long.TWO_PWR_32_DBL_ = goog.math.Long.TWO_PWR_16_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;
 goog.math.Long.TWO_PWR_31_DBL_ = goog.math.Long.TWO_PWR_32_DBL_ / 2;
 goog.math.Long.TWO_PWR_48_DBL_ = goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;
 goog.math.Long.TWO_PWR_64_DBL_ = goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_32_DBL_;
 goog.math.Long.TWO_PWR_63_DBL_ = goog.math.Long.TWO_PWR_64_DBL_ / 2;
 goog.math.Long.ZERO = goog.math.Long.fromInt(0);
 goog.math.Long.ONE = goog.math.Long.fromInt(1);
 goog.math.Long.NEG_ONE = goog.math.Long.fromInt(-1);
 goog.math.Long.MAX_VALUE = goog.math.Long.fromBits(4294967295 | 0, 2147483647 | 0);
 goog.math.Long.MIN_VALUE = goog.math.Long.fromBits(0, 2147483648 | 0);
 goog.math.Long.TWO_PWR_24_ = goog.math.Long.fromInt(1 << 24);
 goog.math.Long.prototype.toInt = (function() {
  return this.low_;
 });
 goog.math.Long.prototype.toNumber = (function() {
  return this.high_ * goog.math.Long.TWO_PWR_32_DBL_ + this.getLowBitsUnsigned();
 });
 goog.math.Long.prototype.toString = (function(opt_radix) {
  var radix = opt_radix || 10;
  if (radix < 2 || 36 < radix) {
   throw Error("radix out of range: " + radix);
  }
  if (this.isZero()) {
   return "0";
  }
  if (this.isNegative()) {
   if (this.equals(goog.math.Long.MIN_VALUE)) {
    var radixLong = goog.math.Long.fromNumber(radix);
    var div = this.div(radixLong);
    var rem = div.multiply(radixLong).subtract(this);
    return div.toString(radix) + rem.toInt().toString(radix);
   } else {
    return "-" + this.negate().toString(radix);
   }
  }
  var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 6));
  var rem = this;
  var result = "";
  while (true) {
   var remDiv = rem.div(radixToPower);
   var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
   var digits = intval.toString(radix);
   rem = remDiv;
   if (rem.isZero()) {
    return digits + result;
   } else {
    while (digits.length < 6) {
     digits = "0" + digits;
    }
    result = "" + digits + result;
   }
  }
 });
 goog.math.Long.prototype.getHighBits = (function() {
  return this.high_;
 });
 goog.math.Long.prototype.getLowBits = (function() {
  return this.low_;
 });
 goog.math.Long.prototype.getLowBitsUnsigned = (function() {
  return this.low_ >= 0 ? this.low_ : goog.math.Long.TWO_PWR_32_DBL_ + this.low_;
 });
 goog.math.Long.prototype.getNumBitsAbs = (function() {
  if (this.isNegative()) {
   if (this.equals(goog.math.Long.MIN_VALUE)) {
    return 64;
   } else {
    return this.negate().getNumBitsAbs();
   }
  } else {
   var val = this.high_ != 0 ? this.high_ : this.low_;
   for (var bit = 31; bit > 0; bit--) {
    if ((val & 1 << bit) != 0) {
     break;
    }
   }
   return this.high_ != 0 ? bit + 33 : bit + 1;
  }
 });
 goog.math.Long.prototype.isZero = (function() {
  return this.high_ == 0 && this.low_ == 0;
 });
 goog.math.Long.prototype.isNegative = (function() {
  return this.high_ < 0;
 });
 goog.math.Long.prototype.isOdd = (function() {
  return (this.low_ & 1) == 1;
 });
 goog.math.Long.prototype.equals = (function(other) {
  return this.high_ == other.high_ && this.low_ == other.low_;
 });
 goog.math.Long.prototype.notEquals = (function(other) {
  return this.high_ != other.high_ || this.low_ != other.low_;
 });
 goog.math.Long.prototype.lessThan = (function(other) {
  return this.compare(other) < 0;
 });
 goog.math.Long.prototype.lessThanOrEqual = (function(other) {
  return this.compare(other) <= 0;
 });
 goog.math.Long.prototype.greaterThan = (function(other) {
  return this.compare(other) > 0;
 });
 goog.math.Long.prototype.greaterThanOrEqual = (function(other) {
  return this.compare(other) >= 0;
 });
 goog.math.Long.prototype.compare = (function(other) {
  if (this.equals(other)) {
   return 0;
  }
  var thisNeg = this.isNegative();
  var otherNeg = other.isNegative();
  if (thisNeg && !otherNeg) {
   return -1;
  }
  if (!thisNeg && otherNeg) {
   return 1;
  }
  if (this.subtract(other).isNegative()) {
   return -1;
  } else {
   return 1;
  }
 });
 goog.math.Long.prototype.negate = (function() {
  if (this.equals(goog.math.Long.MIN_VALUE)) {
   return goog.math.Long.MIN_VALUE;
  } else {
   return this.not().add(goog.math.Long.ONE);
  }
 });
 goog.math.Long.prototype.add = (function(other) {
  var a48 = this.high_ >>> 16;
  var a32 = this.high_ & 65535;
  var a16 = this.low_ >>> 16;
  var a00 = this.low_ & 65535;
  var b48 = other.high_ >>> 16;
  var b32 = other.high_ & 65535;
  var b16 = other.low_ >>> 16;
  var b00 = other.low_ & 65535;
  var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
  c00 += a00 + b00;
  c16 += c00 >>> 16;
  c00 &= 65535;
  c16 += a16 + b16;
  c32 += c16 >>> 16;
  c16 &= 65535;
  c32 += a32 + b32;
  c48 += c32 >>> 16;
  c32 &= 65535;
  c48 += a48 + b48;
  c48 &= 65535;
  return goog.math.Long.fromBits(c16 << 16 | c00, c48 << 16 | c32);
 });
 goog.math.Long.prototype.subtract = (function(other) {
  return this.add(other.negate());
 });
 goog.math.Long.prototype.multiply = (function(other) {
  if (this.isZero()) {
   return goog.math.Long.ZERO;
  } else if (other.isZero()) {
   return goog.math.Long.ZERO;
  }
  if (this.equals(goog.math.Long.MIN_VALUE)) {
   return other.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
  } else if (other.equals(goog.math.Long.MIN_VALUE)) {
   return this.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
  }
  if (this.isNegative()) {
   if (other.isNegative()) {
    return this.negate().multiply(other.negate());
   } else {
    return this.negate().multiply(other).negate();
   }
  } else if (other.isNegative()) {
   return this.multiply(other.negate()).negate();
  }
  if (this.lessThan(goog.math.Long.TWO_PWR_24_) && other.lessThan(goog.math.Long.TWO_PWR_24_)) {
   return goog.math.Long.fromNumber(this.toNumber() * other.toNumber());
  }
  var a48 = this.high_ >>> 16;
  var a32 = this.high_ & 65535;
  var a16 = this.low_ >>> 16;
  var a00 = this.low_ & 65535;
  var b48 = other.high_ >>> 16;
  var b32 = other.high_ & 65535;
  var b16 = other.low_ >>> 16;
  var b00 = other.low_ & 65535;
  var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
  c00 += a00 * b00;
  c16 += c00 >>> 16;
  c00 &= 65535;
  c16 += a16 * b00;
  c32 += c16 >>> 16;
  c16 &= 65535;
  c16 += a00 * b16;
  c32 += c16 >>> 16;
  c16 &= 65535;
  c32 += a32 * b00;
  c48 += c32 >>> 16;
  c32 &= 65535;
  c32 += a16 * b16;
  c48 += c32 >>> 16;
  c32 &= 65535;
  c32 += a00 * b32;
  c48 += c32 >>> 16;
  c32 &= 65535;
  c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
  c48 &= 65535;
  return goog.math.Long.fromBits(c16 << 16 | c00, c48 << 16 | c32);
 });
 goog.math.Long.prototype.div = (function(other) {
  if (other.isZero()) {
   throw Error("division by zero");
  } else if (this.isZero()) {
   return goog.math.Long.ZERO;
  }
  if (this.equals(goog.math.Long.MIN_VALUE)) {
   if (other.equals(goog.math.Long.ONE) || other.equals(goog.math.Long.NEG_ONE)) {
    return goog.math.Long.MIN_VALUE;
   } else if (other.equals(goog.math.Long.MIN_VALUE)) {
    return goog.math.Long.ONE;
   } else {
    var halfThis = this.shiftRight(1);
    var approx = halfThis.div(other).shiftLeft(1);
    if (approx.equals(goog.math.Long.ZERO)) {
     return other.isNegative() ? goog.math.Long.ONE : goog.math.Long.NEG_ONE;
    } else {
     var rem = this.subtract(other.multiply(approx));
     var result = approx.add(rem.div(other));
     return result;
    }
   }
  } else if (other.equals(goog.math.Long.MIN_VALUE)) {
   return goog.math.Long.ZERO;
  }
  if (this.isNegative()) {
   if (other.isNegative()) {
    return this.negate().div(other.negate());
   } else {
    return this.negate().div(other).negate();
   }
  } else if (other.isNegative()) {
   return this.div(other.negate()).negate();
  }
  var res = goog.math.Long.ZERO;
  var rem = this;
  while (rem.greaterThanOrEqual(other)) {
   var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));
   var log2 = Math.ceil(Math.log(approx) / Math.LN2);
   var delta = log2 <= 48 ? 1 : Math.pow(2, log2 - 48);
   var approxRes = goog.math.Long.fromNumber(approx);
   var approxRem = approxRes.multiply(other);
   while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
    approx -= delta;
    approxRes = goog.math.Long.fromNumber(approx);
    approxRem = approxRes.multiply(other);
   }
   if (approxRes.isZero()) {
    approxRes = goog.math.Long.ONE;
   }
   res = res.add(approxRes);
   rem = rem.subtract(approxRem);
  }
  return res;
 });
 goog.math.Long.prototype.modulo = (function(other) {
  return this.subtract(this.div(other).multiply(other));
 });
 goog.math.Long.prototype.not = (function() {
  return goog.math.Long.fromBits(~this.low_, ~this.high_);
 });
 goog.math.Long.prototype.and = (function(other) {
  return goog.math.Long.fromBits(this.low_ & other.low_, this.high_ & other.high_);
 });
 goog.math.Long.prototype.or = (function(other) {
  return goog.math.Long.fromBits(this.low_ | other.low_, this.high_ | other.high_);
 });
 goog.math.Long.prototype.xor = (function(other) {
  return goog.math.Long.fromBits(this.low_ ^ other.low_, this.high_ ^ other.high_);
 });
 goog.math.Long.prototype.shiftLeft = (function(numBits) {
  numBits &= 63;
  if (numBits == 0) {
   return this;
  } else {
   var low = this.low_;
   if (numBits < 32) {
    var high = this.high_;
    return goog.math.Long.fromBits(low << numBits, high << numBits | low >>> 32 - numBits);
   } else {
    return goog.math.Long.fromBits(0, low << numBits - 32);
   }
  }
 });
 goog.math.Long.prototype.shiftRight = (function(numBits) {
  numBits &= 63;
  if (numBits == 0) {
   return this;
  } else {
   var high = this.high_;
   if (numBits < 32) {
    var low = this.low_;
    return goog.math.Long.fromBits(low >>> numBits | high << 32 - numBits, high >> numBits);
   } else {
    return goog.math.Long.fromBits(high >> numBits - 32, high >= 0 ? 0 : -1);
   }
  }
 });
 goog.math.Long.prototype.shiftRightUnsigned = (function(numBits) {
  numBits &= 63;
  if (numBits == 0) {
   return this;
  } else {
   var high = this.high_;
   if (numBits < 32) {
    var low = this.low_;
    return goog.math.Long.fromBits(low >>> numBits | high << 32 - numBits, high >>> numBits);
   } else if (numBits == 32) {
    return goog.math.Long.fromBits(high, 0);
   } else {
    return goog.math.Long.fromBits(high >>> numBits - 32, 0);
   }
  }
 });
 var navigator = {
  appName: "Modern Browser"
 };
 var dbits;
 var canary = 0xdeadbeefcafe;
 var j_lm = (canary & 16777215) == 15715070;
 function BigInteger(a, b, c) {
  if (a != null) if ("number" == typeof a) this.fromNumber(a, b, c); else if (b == null && "string" != typeof a) this.fromString(a, 256); else this.fromString(a, b);
 }
 function nbi() {
  return new BigInteger(null);
 }
 function am1(i, x, w, j, c, n) {
  while (--n >= 0) {
   var v = x * this[i++] + w[j] + c;
   c = Math.floor(v / 67108864);
   w[j++] = v & 67108863;
  }
  return c;
 }
 function am2(i, x, w, j, c, n) {
  var xl = x & 32767, xh = x >> 15;
  while (--n >= 0) {
   var l = this[i] & 32767;
   var h = this[i++] >> 15;
   var m = xh * l + h * xl;
   l = xl * l + ((m & 32767) << 15) + w[j] + (c & 1073741823);
   c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30);
   w[j++] = l & 1073741823;
  }
  return c;
 }
 function am3(i, x, w, j, c, n) {
  var xl = x & 16383, xh = x >> 14;
  while (--n >= 0) {
   var l = this[i] & 16383;
   var h = this[i++] >> 14;
   var m = xh * l + h * xl;
   l = xl * l + ((m & 16383) << 14) + w[j] + c;
   c = (l >> 28) + (m >> 14) + xh * h;
   w[j++] = l & 268435455;
  }
  return c;
 }
 if (j_lm && navigator.appName == "Microsoft Internet Explorer") {
  BigInteger.prototype.am = am2;
  dbits = 30;
 } else if (j_lm && navigator.appName != "Netscape") {
  BigInteger.prototype.am = am1;
  dbits = 26;
 } else {
  BigInteger.prototype.am = am3;
  dbits = 28;
 }
 BigInteger.prototype.DB = dbits;
 BigInteger.prototype.DM = (1 << dbits) - 1;
 BigInteger.prototype.DV = 1 << dbits;
 var BI_FP = 52;
 BigInteger.prototype.FV = Math.pow(2, BI_FP);
 BigInteger.prototype.F1 = BI_FP - dbits;
 BigInteger.prototype.F2 = 2 * dbits - BI_FP;
 var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
 var BI_RC = new Array;
 var rr, vv;
 rr = "0".charCodeAt(0);
 for (vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
 rr = "a".charCodeAt(0);
 for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
 rr = "A".charCodeAt(0);
 for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
 function int2char(n) {
  return BI_RM.charAt(n);
 }
 function intAt(s, i) {
  var c = BI_RC[s.charCodeAt(i)];
  return c == null ? -1 : c;
 }
 function bnpCopyTo(r) {
  for (var i = this.t - 1; i >= 0; --i) r[i] = this[i];
  r.t = this.t;
  r.s = this.s;
 }
 function bnpFromInt(x) {
  this.t = 1;
  this.s = x < 0 ? -1 : 0;
  if (x > 0) this[0] = x; else if (x < -1) this[0] = x + DV; else this.t = 0;
 }
 function nbv(i) {
  var r = nbi();
  r.fromInt(i);
  return r;
 }
 function bnpFromString(s, b) {
  var k;
  if (b == 16) k = 4; else if (b == 8) k = 3; else if (b == 256) k = 8; else if (b == 2) k = 1; else if (b == 32) k = 5; else if (b == 4) k = 2; else {
   this.fromRadix(s, b);
   return;
  }
  this.t = 0;
  this.s = 0;
  var i = s.length, mi = false, sh = 0;
  while (--i >= 0) {
   var x = k == 8 ? s[i] & 255 : intAt(s, i);
   if (x < 0) {
    if (s.charAt(i) == "-") mi = true;
    continue;
   }
   mi = false;
   if (sh == 0) this[this.t++] = x; else if (sh + k > this.DB) {
    this[this.t - 1] |= (x & (1 << this.DB - sh) - 1) << sh;
    this[this.t++] = x >> this.DB - sh;
   } else this[this.t - 1] |= x << sh;
   sh += k;
   if (sh >= this.DB) sh -= this.DB;
  }
  if (k == 8 && (s[0] & 128) != 0) {
   this.s = -1;
   if (sh > 0) this[this.t - 1] |= (1 << this.DB - sh) - 1 << sh;
  }
  this.clamp();
  if (mi) BigInteger.ZERO.subTo(this, this);
 }
 function bnpClamp() {
  var c = this.s & this.DM;
  while (this.t > 0 && this[this.t - 1] == c) --this.t;
 }
 function bnToString(b) {
  if (this.s < 0) return "-" + this.negate().toString(b);
  var k;
  if (b == 16) k = 4; else if (b == 8) k = 3; else if (b == 2) k = 1; else if (b == 32) k = 5; else if (b == 4) k = 2; else return this.toRadix(b);
  var km = (1 << k) - 1, d, m = false, r = "", i = this.t;
  var p = this.DB - i * this.DB % k;
  if (i-- > 0) {
   if (p < this.DB && (d = this[i] >> p) > 0) {
    m = true;
    r = int2char(d);
   }
   while (i >= 0) {
    if (p < k) {
     d = (this[i] & (1 << p) - 1) << k - p;
     d |= this[--i] >> (p += this.DB - k);
    } else {
     d = this[i] >> (p -= k) & km;
     if (p <= 0) {
      p += this.DB;
      --i;
     }
    }
    if (d > 0) m = true;
    if (m) r += int2char(d);
   }
  }
  return m ? r : "0";
 }
 function bnNegate() {
  var r = nbi();
  BigInteger.ZERO.subTo(this, r);
  return r;
 }
 function bnAbs() {
  return this.s < 0 ? this.negate() : this;
 }
 function bnCompareTo(a) {
  var r = this.s - a.s;
  if (r != 0) return r;
  var i = this.t;
  r = i - a.t;
  if (r != 0) return this.s < 0 ? -r : r;
  while (--i >= 0) if ((r = this[i] - a[i]) != 0) return r;
  return 0;
 }
 function nbits(x) {
  var r = 1, t;
  if ((t = x >>> 16) != 0) {
   x = t;
   r += 16;
  }
  if ((t = x >> 8) != 0) {
   x = t;
   r += 8;
  }
  if ((t = x >> 4) != 0) {
   x = t;
   r += 4;
  }
  if ((t = x >> 2) != 0) {
   x = t;
   r += 2;
  }
  if ((t = x >> 1) != 0) {
   x = t;
   r += 1;
  }
  return r;
 }
 function bnBitLength() {
  if (this.t <= 0) return 0;
  return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ this.s & this.DM);
 }
 function bnpDLShiftTo(n, r) {
  var i;
  for (i = this.t - 1; i >= 0; --i) r[i + n] = this[i];
  for (i = n - 1; i >= 0; --i) r[i] = 0;
  r.t = this.t + n;
  r.s = this.s;
 }
 function bnpDRShiftTo(n, r) {
  for (var i = n; i < this.t; ++i) r[i - n] = this[i];
  r.t = Math.max(this.t - n, 0);
  r.s = this.s;
 }
 function bnpLShiftTo(n, r) {
  var bs = n % this.DB;
  var cbs = this.DB - bs;
  var bm = (1 << cbs) - 1;
  var ds = Math.floor(n / this.DB), c = this.s << bs & this.DM, i;
  for (i = this.t - 1; i >= 0; --i) {
   r[i + ds + 1] = this[i] >> cbs | c;
   c = (this[i] & bm) << bs;
  }
  for (i = ds - 1; i >= 0; --i) r[i] = 0;
  r[ds] = c;
  r.t = this.t + ds + 1;
  r.s = this.s;
  r.clamp();
 }
 function bnpRShiftTo(n, r) {
  r.s = this.s;
  var ds = Math.floor(n / this.DB);
  if (ds >= this.t) {
   r.t = 0;
   return;
  }
  var bs = n % this.DB;
  var cbs = this.DB - bs;
  var bm = (1 << bs) - 1;
  r[0] = this[ds] >> bs;
  for (var i = ds + 1; i < this.t; ++i) {
   r[i - ds - 1] |= (this[i] & bm) << cbs;
   r[i - ds] = this[i] >> bs;
  }
  if (bs > 0) r[this.t - ds - 1] |= (this.s & bm) << cbs;
  r.t = this.t - ds;
  r.clamp();
 }
 function bnpSubTo(a, r) {
  var i = 0, c = 0, m = Math.min(a.t, this.t);
  while (i < m) {
   c += this[i] - a[i];
   r[i++] = c & this.DM;
   c >>= this.DB;
  }
  if (a.t < this.t) {
   c -= a.s;
   while (i < this.t) {
    c += this[i];
    r[i++] = c & this.DM;
    c >>= this.DB;
   }
   c += this.s;
  } else {
   c += this.s;
   while (i < a.t) {
    c -= a[i];
    r[i++] = c & this.DM;
    c >>= this.DB;
   }
   c -= a.s;
  }
  r.s = c < 0 ? -1 : 0;
  if (c < -1) r[i++] = this.DV + c; else if (c > 0) r[i++] = c;
  r.t = i;
  r.clamp();
 }
 function bnpMultiplyTo(a, r) {
  var x = this.abs(), y = a.abs();
  var i = x.t;
  r.t = i + y.t;
  while (--i >= 0) r[i] = 0;
  for (i = 0; i < y.t; ++i) r[i + x.t] = x.am(0, y[i], r, i, 0, x.t);
  r.s = 0;
  r.clamp();
  if (this.s != a.s) BigInteger.ZERO.subTo(r, r);
 }
 function bnpSquareTo(r) {
  var x = this.abs();
  var i = r.t = 2 * x.t;
  while (--i >= 0) r[i] = 0;
  for (i = 0; i < x.t - 1; ++i) {
   var c = x.am(i, x[i], r, 2 * i, 0, 1);
   if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) {
    r[i + x.t] -= x.DV;
    r[i + x.t + 1] = 1;
   }
  }
  if (r.t > 0) r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1);
  r.s = 0;
  r.clamp();
 }
 function bnpDivRemTo(m, q, r) {
  var pm = m.abs();
  if (pm.t <= 0) return;
  var pt = this.abs();
  if (pt.t < pm.t) {
   if (q != null) q.fromInt(0);
   if (r != null) this.copyTo(r);
   return;
  }
  if (r == null) r = nbi();
  var y = nbi(), ts = this.s, ms = m.s;
  var nsh = this.DB - nbits(pm[pm.t - 1]);
  if (nsh > 0) {
   pm.lShiftTo(nsh, y);
   pt.lShiftTo(nsh, r);
  } else {
   pm.copyTo(y);
   pt.copyTo(r);
  }
  var ys = y.t;
  var y0 = y[ys - 1];
  if (y0 == 0) return;
  var yt = y0 * (1 << this.F1) + (ys > 1 ? y[ys - 2] >> this.F2 : 0);
  var d1 = this.FV / yt, d2 = (1 << this.F1) / yt, e = 1 << this.F2;
  var i = r.t, j = i - ys, t = q == null ? nbi() : q;
  y.dlShiftTo(j, t);
  if (r.compareTo(t) >= 0) {
   r[r.t++] = 1;
   r.subTo(t, r);
  }
  BigInteger.ONE.dlShiftTo(ys, t);
  t.subTo(y, y);
  while (y.t < ys) y[y.t++] = 0;
  while (--j >= 0) {
   var qd = r[--i] == y0 ? this.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2);
   if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) {
    y.dlShiftTo(j, t);
    r.subTo(t, r);
    while (r[i] < --qd) r.subTo(t, r);
   }
  }
  if (q != null) {
   r.drShiftTo(ys, q);
   if (ts != ms) BigInteger.ZERO.subTo(q, q);
  }
  r.t = ys;
  r.clamp();
  if (nsh > 0) r.rShiftTo(nsh, r);
  if (ts < 0) BigInteger.ZERO.subTo(r, r);
 }
 function bnMod(a) {
  var r = nbi();
  this.abs().divRemTo(a, null, r);
  if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r, r);
  return r;
 }
 function Classic(m) {
  this.m = m;
 }
 function cConvert(x) {
  if (x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m); else return x;
 }
 function cRevert(x) {
  return x;
 }
 function cReduce(x) {
  x.divRemTo(this.m, null, x);
 }
 function cMulTo(x, y, r) {
  x.multiplyTo(y, r);
  this.reduce(r);
 }
 function cSqrTo(x, r) {
  x.squareTo(r);
  this.reduce(r);
 }
 Classic.prototype.convert = cConvert;
 Classic.prototype.revert = cRevert;
 Classic.prototype.reduce = cReduce;
 Classic.prototype.mulTo = cMulTo;
 Classic.prototype.sqrTo = cSqrTo;
 function bnpInvDigit() {
  if (this.t < 1) return 0;
  var x = this[0];
  if ((x & 1) == 0) return 0;
  var y = x & 3;
  y = y * (2 - (x & 15) * y) & 15;
  y = y * (2 - (x & 255) * y) & 255;
  y = y * (2 - ((x & 65535) * y & 65535)) & 65535;
  y = y * (2 - x * y % this.DV) % this.DV;
  return y > 0 ? this.DV - y : -y;
 }
 function Montgomery(m) {
  this.m = m;
  this.mp = m.invDigit();
  this.mpl = this.mp & 32767;
  this.mph = this.mp >> 15;
  this.um = (1 << m.DB - 15) - 1;
  this.mt2 = 2 * m.t;
 }
 function montConvert(x) {
  var r = nbi();
  x.abs().dlShiftTo(this.m.t, r);
  r.divRemTo(this.m, null, r);
  if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r, r);
  return r;
 }
 function montRevert(x) {
  var r = nbi();
  x.copyTo(r);
  this.reduce(r);
  return r;
 }
 function montReduce(x) {
  while (x.t <= this.mt2) x[x.t++] = 0;
  for (var i = 0; i < this.m.t; ++i) {
   var j = x[i] & 32767;
   var u0 = j * this.mpl + ((j * this.mph + (x[i] >> 15) * this.mpl & this.um) << 15) & x.DM;
   j = i + this.m.t;
   x[j] += this.m.am(0, u0, x, i, 0, this.m.t);
   while (x[j] >= x.DV) {
    x[j] -= x.DV;
    x[++j]++;
   }
  }
  x.clamp();
  x.drShiftTo(this.m.t, x);
  if (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
 }
 function montSqrTo(x, r) {
  x.squareTo(r);
  this.reduce(r);
 }
 function montMulTo(x, y, r) {
  x.multiplyTo(y, r);
  this.reduce(r);
 }
 Montgomery.prototype.convert = montConvert;
 Montgomery.prototype.revert = montRevert;
 Montgomery.prototype.reduce = montReduce;
 Montgomery.prototype.mulTo = montMulTo;
 Montgomery.prototype.sqrTo = montSqrTo;
 function bnpIsEven() {
  return (this.t > 0 ? this[0] & 1 : this.s) == 0;
 }
 function bnpExp(e, z) {
  if (e > 4294967295 || e < 1) return BigInteger.ONE;
  var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e) - 1;
  g.copyTo(r);
  while (--i >= 0) {
   z.sqrTo(r, r2);
   if ((e & 1 << i) > 0) z.mulTo(r2, g, r); else {
    var t = r;
    r = r2;
    r2 = t;
   }
  }
  return z.revert(r);
 }
 function bnModPowInt(e, m) {
  var z;
  if (e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
  return this.exp(e, z);
 }
 BigInteger.prototype.copyTo = bnpCopyTo;
 BigInteger.prototype.fromInt = bnpFromInt;
 BigInteger.prototype.fromString = bnpFromString;
 BigInteger.prototype.clamp = bnpClamp;
 BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
 BigInteger.prototype.drShiftTo = bnpDRShiftTo;
 BigInteger.prototype.lShiftTo = bnpLShiftTo;
 BigInteger.prototype.rShiftTo = bnpRShiftTo;
 BigInteger.prototype.subTo = bnpSubTo;
 BigInteger.prototype.multiplyTo = bnpMultiplyTo;
 BigInteger.prototype.squareTo = bnpSquareTo;
 BigInteger.prototype.divRemTo = bnpDivRemTo;
 BigInteger.prototype.invDigit = bnpInvDigit;
 BigInteger.prototype.isEven = bnpIsEven;
 BigInteger.prototype.exp = bnpExp;
 BigInteger.prototype.toString = bnToString;
 BigInteger.prototype.negate = bnNegate;
 BigInteger.prototype.abs = bnAbs;
 BigInteger.prototype.compareTo = bnCompareTo;
 BigInteger.prototype.bitLength = bnBitLength;
 BigInteger.prototype.mod = bnMod;
 BigInteger.prototype.modPowInt = bnModPowInt;
 BigInteger.ZERO = nbv(0);
 BigInteger.ONE = nbv(1);
 function bnpFromRadix(s, b) {
  this.fromInt(0);
  if (b == null) b = 10;
  var cs = this.chunkSize(b);
  var d = Math.pow(b, cs), mi = false, j = 0, w = 0;
  for (var i = 0; i < s.length; ++i) {
   var x = intAt(s, i);
   if (x < 0) {
    if (s.charAt(i) == "-" && this.signum() == 0) mi = true;
    continue;
   }
   w = b * w + x;
   if (++j >= cs) {
    this.dMultiply(d);
    this.dAddOffset(w, 0);
    j = 0;
    w = 0;
   }
  }
  if (j > 0) {
   this.dMultiply(Math.pow(b, j));
   this.dAddOffset(w, 0);
  }
  if (mi) BigInteger.ZERO.subTo(this, this);
 }
 function bnpChunkSize(r) {
  return Math.floor(Math.LN2 * this.DB / Math.log(r));
 }
 function bnSigNum() {
  if (this.s < 0) return -1; else if (this.t <= 0 || this.t == 1 && this[0] <= 0) return 0; else return 1;
 }
 function bnpDMultiply(n) {
  this[this.t] = this.am(0, n - 1, this, 0, 0, this.t);
  ++this.t;
  this.clamp();
 }
 function bnpDAddOffset(n, w) {
  if (n == 0) return;
  while (this.t <= w) this[this.t++] = 0;
  this[w] += n;
  while (this[w] >= this.DV) {
   this[w] -= this.DV;
   if (++w >= this.t) this[this.t++] = 0;
   ++this[w];
  }
 }
 function bnpToRadix(b) {
  if (b == null) b = 10;
  if (this.signum() == 0 || b < 2 || b > 36) return "0";
  var cs = this.chunkSize(b);
  var a = Math.pow(b, cs);
  var d = nbv(a), y = nbi(), z = nbi(), r = "";
  this.divRemTo(d, y, z);
  while (y.signum() > 0) {
   r = (a + z.intValue()).toString(b).substr(1) + r;
   y.divRemTo(d, y, z);
  }
  return z.intValue().toString(b) + r;
 }
 function bnIntValue() {
  if (this.s < 0) {
   if (this.t == 1) return this[0] - this.DV; else if (this.t == 0) return -1;
  } else if (this.t == 1) return this[0]; else if (this.t == 0) return 0;
  return (this[1] & (1 << 32 - this.DB) - 1) << this.DB | this[0];
 }
 function bnpAddTo(a, r) {
  var i = 0, c = 0, m = Math.min(a.t, this.t);
  while (i < m) {
   c += this[i] + a[i];
   r[i++] = c & this.DM;
   c >>= this.DB;
  }
  if (a.t < this.t) {
   c += a.s;
   while (i < this.t) {
    c += this[i];
    r[i++] = c & this.DM;
    c >>= this.DB;
   }
   c += this.s;
  } else {
   c += this.s;
   while (i < a.t) {
    c += a[i];
    r[i++] = c & this.DM;
    c >>= this.DB;
   }
   c += a.s;
  }
  r.s = c < 0 ? -1 : 0;
  if (c > 0) r[i++] = c; else if (c < -1) r[i++] = this.DV + c;
  r.t = i;
  r.clamp();
 }
 BigInteger.prototype.fromRadix = bnpFromRadix;
 BigInteger.prototype.chunkSize = bnpChunkSize;
 BigInteger.prototype.signum = bnSigNum;
 BigInteger.prototype.dMultiply = bnpDMultiply;
 BigInteger.prototype.dAddOffset = bnpDAddOffset;
 BigInteger.prototype.toRadix = bnpToRadix;
 BigInteger.prototype.intValue = bnIntValue;
 BigInteger.prototype.addTo = bnpAddTo;
 var Wrapper = {
  abs: (function(l, h) {
   var x = new goog.math.Long(l, h);
   var ret;
   if (x.isNegative()) {
    ret = x.negate();
   } else {
    ret = x;
   }
   HEAP32[tempDoublePtr >> 2] = ret.low_;
   HEAP32[tempDoublePtr + 4 >> 2] = ret.high_;
  }),
  ensureTemps: (function() {
   if (Wrapper.ensuredTemps) return;
   Wrapper.ensuredTemps = true;
   Wrapper.two32 = new BigInteger;
   Wrapper.two32.fromString("4294967296", 10);
   Wrapper.two64 = new BigInteger;
   Wrapper.two64.fromString("18446744073709551616", 10);
   Wrapper.temp1 = new BigInteger;
   Wrapper.temp2 = new BigInteger;
  }),
  lh2bignum: (function(l, h) {
   var a = new BigInteger;
   a.fromString(h.toString(), 10);
   var b = new BigInteger;
   a.multiplyTo(Wrapper.two32, b);
   var c = new BigInteger;
   c.fromString(l.toString(), 10);
   var d = new BigInteger;
   c.addTo(b, d);
   return d;
  }),
  stringify: (function(l, h, unsigned) {
   var ret = (new goog.math.Long(l, h)).toString();
   if (unsigned && ret[0] == "-") {
    Wrapper.ensureTemps();
    var bignum = new BigInteger;
    bignum.fromString(ret, 10);
    ret = new BigInteger;
    Wrapper.two64.addTo(bignum, ret);
    ret = ret.toString(10);
   }
   return ret;
  }),
  fromString: (function(str, base, min, max, unsigned) {
   Wrapper.ensureTemps();
   var bignum = new BigInteger;
   bignum.fromString(str, base);
   var bigmin = new BigInteger;
   bigmin.fromString(min, 10);
   var bigmax = new BigInteger;
   bigmax.fromString(max, 10);
   if (unsigned && bignum.compareTo(BigInteger.ZERO) < 0) {
    var temp = new BigInteger;
    bignum.addTo(Wrapper.two64, temp);
    bignum = temp;
   }
   var error = false;
   if (bignum.compareTo(bigmin) < 0) {
    bignum = bigmin;
    error = true;
   } else if (bignum.compareTo(bigmax) > 0) {
    bignum = bigmax;
    error = true;
   }
   var ret = goog.math.Long.fromString(bignum.toString());
   HEAP32[tempDoublePtr >> 2] = ret.low_;
   HEAP32[tempDoublePtr + 4 >> 2] = ret.high_;
   if (error) throw "range error";
  })
 };
 return Wrapper;
})();
if (memoryInitializer) {
 if (typeof Module["locateFile"] === "function") {
  memoryInitializer = Module["locateFile"](memoryInitializer);
 } else if (Module["memoryInitializerPrefixURL"]) {
  memoryInitializer = Module["memoryInitializerPrefixURL"] + memoryInitializer;
 }
 if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
  var data = Module["readBinary"](memoryInitializer);
  HEAPU8.set(data, STATIC_BASE);
 } else {
  addRunDependency("memory initializer");
  var applyMemoryInitializer = (function(data) {
   if (data.byteLength) data = new Uint8Array(data);
   HEAPU8.set(data, STATIC_BASE);
   removeRunDependency("memory initializer");
  });
  var request = Module["memoryInitializerRequest"];
  if (request) {
   if (request.response) {
    setTimeout((function() {
     applyMemoryInitializer(request.response);
    }), 0);
   } else {
    request.addEventListener("load", (function() {
     if (request.status !== 200 && request.status !== 0) {
      console.warn("a problem seems to have happened with Module.memoryInitializerRequest, status: " + request.status);
     }
     if (!request.response || typeof request.response !== "object" || !request.response.byteLength) {
      console.warn("a problem seems to have happened with Module.memoryInitializerRequest response (expected ArrayBuffer): " + request.response);
     }
     applyMemoryInitializer(request.response);
    }));
   }
  } else {
   Browser.asyncLoad(memoryInitializer, applyMemoryInitializer, (function() {
    throw "could not load memory initializer " + memoryInitializer;
   }));
  }
 }
}
function ExitStatus(status) {
 this.name = "ExitStatus";
 this.message = "Program terminated with exit(" + status + ")";
 this.status = status;
}
ExitStatus.prototype = new Error;
ExitStatus.prototype.constructor = ExitStatus;
var initialStackTop;
var preloadStartTime = null;
var calledMain = false;
dependenciesFulfilled = function runCaller() {
 if (!Module["calledRun"]) run();
 if (!Module["calledRun"]) dependenciesFulfilled = runCaller;
};
Module["callMain"] = Module.callMain = function callMain(args) {
 assert(runDependencies == 0, "cannot call main when async dependencies remain! (listen on __ATMAIN__)");
 assert(__ATPRERUN__.length == 0, "cannot call main when preRun functions remain to be called");
 args = args || [];
 ensureInitRuntime();
 var argc = args.length + 1;
 function pad() {
  for (var i = 0; i < 4 - 1; i++) {
   argv.push(0);
  }
 }
 var argv = [ allocate(intArrayFromString(Module["thisProgram"]), "i8", ALLOC_NORMAL) ];
 pad();
 for (var i = 0; i < argc - 1; i = i + 1) {
  argv.push(allocate(intArrayFromString(args[i]), "i8", ALLOC_NORMAL));
  pad();
 }
 argv.push(0);
 argv = allocate(argv, "i32", ALLOC_NORMAL);
 initialStackTop = STACKTOP;
 try {
  var ret = Module["_main"](argc, argv, 0);
  exit(ret, true);
 } catch (e) {
  if (e instanceof ExitStatus) {
   return;
  } else if (e == "SimulateInfiniteLoop") {
   Module["noExitRuntime"] = true;
   return;
  } else {
   if (e && typeof e === "object" && e.stack) Module.printErr("exception thrown: " + [ e, e.stack ]);
   throw e;
  }
 } finally {
  calledMain = true;
 }
};
function run(args) {
 args = args || Module["arguments"];
 if (preloadStartTime === null) preloadStartTime = Date.now();
 if (runDependencies > 0) {
  return;
 }
 preRun();
 if (runDependencies > 0) return;
 if (Module["calledRun"]) return;
 function doRun() {
  if (Module["calledRun"]) return;
  Module["calledRun"] = true;
  if (ABORT) return;
  ensureInitRuntime();
  preMain();
  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
   Module.printErr("pre-main prep time: " + (Date.now() - preloadStartTime) + " ms");
  }
  if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
  if (Module["_main"] && shouldRunNow) Module["callMain"](args);
  postRun();
 }
 if (Module["setStatus"]) {
  Module["setStatus"]("Running...");
  setTimeout((function() {
   setTimeout((function() {
    Module["setStatus"]("");
   }), 1);
   doRun();
  }), 1);
 } else {
  doRun();
 }
}
Module["run"] = Module.run = run;
function exit(status, implicit) {
 if (implicit && Module["noExitRuntime"]) {
  return;
 }
 if (Module["noExitRuntime"]) {} else {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;
  exitRuntime();
  if (Module["onExit"]) Module["onExit"](status);
 }
 if (ENVIRONMENT_IS_NODE) {
  process["stdout"]["once"]("drain", (function() {
   process["exit"](status);
  }));
  console.log(" ");
  setTimeout((function() {
   process["exit"](status);
  }), 500);
 } else if (ENVIRONMENT_IS_SHELL && typeof quit === "function") {
  quit(status);
 }
 throw new ExitStatus(status);
}
Module["exit"] = Module.exit = exit;
var abortDecorators = [];
function abort(what) {
 if (what !== undefined) {
  Module.print(what);
  Module.printErr(what);
  what = JSON.stringify(what);
 } else {
  what = "";
 }
 ABORT = true;
 EXITSTATUS = 1;
 var extra = "\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.";
 var output = "abort(" + what + ") at " + stackTrace() + extra;
 if (abortDecorators) {
  abortDecorators.forEach((function(decorator) {
   output = decorator(output, what);
  }));
 }
 throw output;
}
Module["abort"] = Module.abort = abort;
if (Module["preInit"]) {
 if (typeof Module["preInit"] == "function") Module["preInit"] = [ Module["preInit"] ];
 while (Module["preInit"].length > 0) {
  Module["preInit"].pop()();
 }
}
var shouldRunNow = true;
if (Module["noInitialRun"]) {
 shouldRunNow = false;
}
run();





