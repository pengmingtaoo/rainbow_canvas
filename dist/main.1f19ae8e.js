// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"main.js":[function(require,module,exports) {
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var brush = document.getElementById('brush');
var eraser = document.getElementById("eraser");
var reSetCanvas = document.getElementById("clear");
var save = document.getElementById("save");
var revocation = document.getElementById("revocation");
var back_revocation = document.getElementById("back_revocation");
var penDetail = document.getElementById("penDetail");
var closeBtn = document.getElementsByClassName('closeBtn');
var range1 = document.getElementById('range1');
var thickness = document.getElementById("thickness");
var ColorPen = document.getElementsByClassName("color-item"); //初始化橡皮擦

var iseEraser = false; //初始化画笔

var isPenDetail = false; //初始画笔粗细

var lWidth = 4;
var radius = 2;
autoSetSize();
monitorToUser();
changePenColor(); //获取文本大小函数

function autoSetSize() {
  canvasSetSize();

  function canvasSetSize() {
    // 把变化之前的画布内容copy一份，
    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height); //然后重新画到画布上,

    var pageWidth = document.documentElement.clientWidth;
    var pageHeight = document.documentElement.clientHeight;
    canvas.width = pageWidth;
    canvas.height = pageHeight;
    ctx.putImageData(imgData, 0, 0);
  }

  window.onresize = function () {
    canvasSetSize();
  };
} //监听鼠标 手机触屏事件 函数


function monitorToUser() {
  //初始化画板状态
  var draw = false; //最后画的位置

  var lastPlace; //适配手机触摸

  var isTouchDevice = "ontouchstart" in document.documentElement;

  if (isTouchDevice) {
    //适配手机 手指放下
    canvas.ontouchstart = function (e) {
      draw = true;
      var x = e.touches[0].clientX;
      var y = e.touches[0].clientY;

      if (iseEraser) {
        //要使用eraser
        clearCircle(x, y, radius);
        lastPlace = [x, y];
      } else {
        drawCircle(x, y, radius);
        lastPlace = [x, y];
      }
    }; //手指移动


    canvas.ontouchmove = function (e) {
      var x = e.touches[0].clientX;
      var y = e.touches[0].clientY;

      if (!draw) {
        return;
      }

      if (iseEraser) {
        moveHandler(lastPlace[0], lastPlace[1], x, y);
        lastPlace = [x, y];
      } else {
        var newPlace = [x, y];
        drawLine(lastPlace[0], lastPlace[1], x, y);
        lastPlace = newPlace; //这次作为上次的位置
      }
    }; //手指离开


    canvas.ontouchend = function (e) {
      draw = false;
      record_operation();
    };
  } else {
    //PC
    //鼠标放下为ture
    canvas.onmousedown = function (e) {
      var x = e.clientX;
      var y = e.clientY;
      draw = true;

      if (iseEraser) {
        //要使用eraser
        // ctx.clearRect(x - lWidth/2, y - lWidth/2, lWidth, lWidth);
        clearCircle(x, y, radius);
        lastPlace = [x, y];
      } else {
        drawCircle(x, y, radius);
        lastPlace = [x, y];
      }
    };

    canvas.onmousemove = function (e) {
      var x = e.clientX;
      var y = e.clientY;

      if (!draw) {
        return;
      }

      if (iseEraser) {
        //  ctx.clearRect(x - lWidth/2, y - lWidth/2, lWidth, lWidth);
        moveHandler(lastPlace[0], lastPlace[1], x, y);
        lastPlace = [x, y];
      } else {
        var newPlace = [x, y];
        drawLine(lastPlace[0], lastPlace[1], x, y);
        lastPlace = newPlace; //这次作为上次的位置
      }
    }; //鼠标松开


    canvas.onmouseup = function (e) {
      draw = false;
      record_operation();
    };
  }
} //画点函数


function drawCircle(x, y, radius) {
  // 新建一条路径，生成之后，图形绘制命令被指向到路径上生成路径。
  ctx.beginPath(); // 画一个以（x,y）为圆心的以radius为半径的圆弧（圆），
  // 从startAngle开始到endAngle结束，按照anticlockwise给定的方向（默认为顺时针）来生成。

  ctx.arc(x, y, lWidth / 2, 0, Math.PI * 2); // 通过填充路径的内容区域生成实心的图形

  ctx.fill(); // 闭合路径之后图形绘制命令又重新指向到上下文中。

  ctx.closePath();
} //画线


function drawLine(x1, y1, x2, y2) {
  ctx.save();
  ctx.lineWidth = lWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.closePath();
} //橡皮圆点


function clearCircle(x, y, radius) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, lWidth / 2, 0, 2 * Math.PI);
  ctx.clip();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
  ctx.closePath();
}

function moveHandler(x1, y1, x2, y2) {
  //获取两个点之间的剪辑区域四个端点
  var asin = lWidth / 2 * Math.sin(Math.atan((y2 - y1) / (x2 - x1)));
  var acos = lWidth / 2 * Math.cos(Math.atan((y2 - y1) / (x2 - x1)));
  var x3 = x1 + asin;
  var y3 = y1 - acos;
  var x4 = x1 - asin;
  var y4 = y1 + acos;
  var x5 = x2 + asin;
  var y5 = y2 - acos;
  var x6 = x2 - asin;
  var y6 = y2 + acos; //保证线条的连贯，所以在矩形一端画圆

  clearCircle(x2, y2, radius); //清除矩形剪辑区域里的像素

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x3, y3);
  ctx.lineTo(x5, y5);
  ctx.lineTo(x6, y6);
  ctx.lineTo(x4, y4);
  ctx.closePath();
  ctx.clip();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
} // 橡皮檫功能


eraser.onclick = function () {
  iseEraser = true;
  eraser.classList.add('active');
  brush.classList.remove('active');
}; //改变画笔粗细


range1.onchange = function () {
  // console.log(range1.value);
  // console.log(typeof range1.value);
  thickness.style.transform = 'scale(' + parseInt(range1.value) + ')'; // console.log(thickness.style.transform);

  lWidth = parseInt(range1.value * 2);
}; //点击画笔


brush.onclick = function () {
  iseEraser = false;
  eraser.classList.remove('active');
  brush.classList.add('active');

  if (!isPenDetail) {
    penDetail.classList.add('active');
  } else {
    penDetail.classList.remove('active');
  }

  isPenDetail = !isPenDetail;
}; //改变画笔颜色


function changePenColor() {
  for (var i = 0; i < ColorPen.length; i++) {
    ColorPen[i].onclick = function () {
      for (var j = 0; j < ColorPen.length; j++) {
        ColorPen[j].classList.remove('active');
        this.classList.add('active');
        activeColor = this.style.backgroundColor;
        ctx.fillStyle = activeColor;
        ctx.strokeStyle = activeColor;
      }
    };
  }
} // 实现清屏


reSetCanvas.onclick = function () {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // canvasHistory = [];
  // revocation.classList.remove('active');
}; // 下载图片


save.onclick = function () {
  var imgUrl = canvas.toDataURL('image/png');
  var saveA = document.createElement('a');
  document.body.appendChild(saveA);
  saveA.href = imgUrl;
  saveA.download = 'mypic' + new Date().getTime();
  saveA.target = '_blank';
  saveA.click();
}; // 实现撤销的功能


var canvasHistory = [];
var step = -1; //记录每一步画画的操作函数

function record_operation() {
  step++;

  if (step < canvasHistory.length) {
    //历史数组记录的步数
    canvasHistory.length = step; //
  } // 添加新的绘制记录到历史记录


  canvasHistory.push(canvas.toDataURL());

  if (step > 0) {
    revocation.classList.add('active');
  }
} //撤回方法


function canvasRevocation() {
  if (step > 0) {
    step--; // ctx.clearRect(0,0,canvas.width,canvas.height);

    var canvasPic = new Image();
    canvasPic.src = canvasHistory[step];

    canvasPic.onload = function () {
      ctx.drawImage(canvasPic, 0, 0);
    };

    revocation.classList.add('active');
    back_revocation.classList.add('active');
  } else {
    revocation.classList.remove('active');
    alert('已经是第一步了');
  }
} //取消撤回方法


function canvas_back_revocation() {
  if (step < canvasHistory.length - 1) {
    step++;
    var canvasPic = new Image();
    canvasPic.src = canvasHistory[step];

    canvasPic.onload = function () {
      ctx.drawImage(canvasPic, 0, 0);
    };
  } else {
    back_revocation.classList.remove('active');
    alert('已经是最新的记录了');
  }
}

revocation.onclick = function () {
  canvasRevocation();
};

back_revocation.onclick = function () {
  canvas_back_revocation();
}; //close功能


var _loop = function _loop(i) {
  closeBtn[i].onclick = function (e) {
    console.log(closeBtn[i]);
    var btnParent = e.target.parentElement;
    btnParent.classList.remove('active');
  };
};

for (var i = 0; i < closeBtn.length; i++) {
  _loop(i);
} // window.onbeforeunload = function(){
//   return "Reload site?";
// };
},{}],"../../../../AppData/Local/Yarn/Data/global/node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "51968" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../../AppData/Local/Yarn/Data/global/node_modules/parcel/src/builtins/hmr-runtime.js","main.js"], null)
//# sourceMappingURL=/main.1f19ae8e.js.map