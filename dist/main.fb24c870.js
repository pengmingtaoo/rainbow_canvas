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
})({"epB2":[function(require,module,exports) {
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
var ColorPen = document.getElementsByClassName("color-item"); //??????????????????

var iseEraser = false; //???????????????

var isPenDetail = false; //??????????????????

var lWidth = 4;
var radius = 2;
autoSetSize();
monitorToUser();
changePenColor();
setCanvasBg('white'); //????????????????????????

function autoSetSize() {
  canvasSetSize();

  function canvasSetSize() {
    var pageWidth = document.documentElement.clientWidth;
    var pageHeight = document.documentElement.clientHeight;
    canvas.width = pageWidth;
    canvas.height = pageHeight;
  }

  window.onresize = function () {
    canvasSetSize();
  };
} //???????????? ?????????????????? ??????


function monitorToUser() {
  //?????????????????????
  var draw = false; //??????????????????

  var lastPlace; //??????????????????

  var isTouchDevice = "ontouchstart" in document.documentElement;

  if (isTouchDevice) {
    //???????????? ????????????
    canvas.ontouchstart = function (e) {
      draw = true;
      var x = e.touches[0].clientX;
      var y = e.touches[0].clientY;

      if (iseEraser) {
        //?????????eraser
        clearCircle(x, y, radius);
        lastPlace = [x, y];
      } else {
        drawCircle(x, y, radius);
        lastPlace = [x, y];
      }
    }; //????????????


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
        lastPlace = newPlace; //???????????????????????????
      }
    }; //????????????


    canvas.ontouchend = function (e) {
      draw = false;
      record_operation();
    };
  } else {
    //PC
    //???????????????ture
    canvas.onmousedown = function (e) {
      var x = e.clientX;
      var y = e.clientY;
      draw = true;

      if (iseEraser) {
        //?????????eraser
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
        lastPlace = newPlace; //???????????????????????????
      }
    }; //????????????


    canvas.onmouseup = function (e) {
      draw = false;
      record_operation();
    };
  }
} //????????????


function drawCircle(x, y, radius) {
  // ??????????????????????????????????????????????????????????????????????????????????????????
  ctx.beginPath(); // ???????????????x,y??????????????????radius??????????????????????????????
  // ???startAngle?????????endAngle???????????????anticlockwise???????????????????????????????????????????????????

  ctx.arc(x, y, lWidth / 2, 0, Math.PI * 2); // ??????????????????????????????????????????????????????

  ctx.fill(); // ?????????????????????????????????????????????????????????????????????

  ctx.closePath();
} //??????


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
} //????????????


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
  //????????????????????????????????????????????????
  var asin = lWidth / 2 * Math.sin(Math.atan((y2 - y1) / (x2 - x1)));
  var acos = lWidth / 2 * Math.cos(Math.atan((y2 - y1) / (x2 - x1)));
  var x3 = x1 + asin;
  var y3 = y1 - acos;
  var x4 = x1 - asin;
  var y4 = y1 + acos;
  var x5 = x2 + asin;
  var y5 = y2 - acos;
  var x6 = x2 - asin;
  var y6 = y2 + acos; //???????????????????????????????????????????????????

  clearCircle(x2, y2, radius); //????????????????????????????????????

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
  ctx.closePath();
} // ???????????????


eraser.onclick = function () {
  iseEraser = true;
  eraser.classList.add('active');
  brush.classList.remove('active');
}; //??????????????????


range1.onchange = function () {
  // console.log(range1.value);
  // console.log(typeof range1.value);
  thickness.style.transform = 'scale(' + parseInt(range1.value) + ')'; // console.log(thickness.style.transform);

  lWidth = parseInt(range1.value * 2);
}; //????????????


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
}; //??????????????????


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
} // ????????????


reSetCanvas.onclick = function () {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  setCanvasBg('white');
  canvasHistory = [];
  step = -1;
  revocation.classList.remove('active');
  back_revocation.classList.remove('active');
}; // ????????????canvas????????????


function setCanvasBg(color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
} // ????????????


save.onclick = function () {
  var imgUrl = canvas.toDataURL('image/png');
  var saveA = document.createElement('a');
  document.body.appendChild(saveA);
  saveA.href = imgUrl;
  saveA.download = 'mypic' + new Date().getTime();
  saveA.target = '_blank';
  saveA.click();
}; // ?????????????????????


var canvasHistory = [];
var step = -1; //????????????????????????????????????

function record_operation() {
  step++;

  if (step < canvasHistory.length) {
    //???????????????????????????
    canvasHistory.length = step;
  } // ???????????????????????????????????????


  canvasHistory.push(canvas.toDataURL());

  if (step > -1) {
    revocation.classList.add('active');
  }
} //????????????


function canvasRevocation() {
  if (step > 0) {
    step--;
    var canvasPic = new Image();
    canvasPic.src = canvasHistory[step];

    canvasPic.onload = function () {
      ctx.drawImage(canvasPic, 0, 0);
    };

    revocation.classList.add('active');
    back_revocation.classList.add('active');
  } else {
    revocation.classList.remove('active');
    alert('??????????????????');
  }
} //??????????????????


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
    alert('???????????????????????????');
  }
}

revocation.onclick = function () {
  canvasRevocation();
};

back_revocation.onclick = function () {
  canvas_back_revocation();
}; //close??????


for (var i = 0; i < closeBtn.length; i++) {
  closeBtn[i].onclick = function (e) {
    var btnParent = e.target.parentElement;
    btnParent.classList.remove('active');
  };
}
},{}]},{},["epB2"], null)
//# sourceMappingURL=main.fb24c870.js.map