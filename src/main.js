let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let brush = document.getElementById('brush');
let eraser = document.getElementById("eraser");
let reSetCanvas = document.getElementById("clear");
let save = document.getElementById("save");
let revocation = document.getElementById("revocation");
let back_revocation = document.getElementById("back_revocation");

let penDetail = document.getElementById("penDetail");
let closeBtn = document.getElementsByClassName('closeBtn');
let range1 = document.getElementById('range1');
let thickness = document.getElementById("thickness");
let ColorPen = document.getElementsByClassName("color-item");
//初始化橡皮擦
let iseEraser = false;
//初始化画笔
let isPenDetail = false;
//初始画笔粗细
let lWidth = 4;
let radius =2;

autoSetSize();
monitorToUser();
changePenColor();
setCanvasBg('white');

//获取文本大小函数
function autoSetSize(){
  canvasSetSize();
    function canvasSetSize(){
      let pageWidth = document.documentElement.clientWidth;
      let pageHeight = document.documentElement.clientHeight;
      canvas.width = pageWidth;
      canvas.height = pageHeight;
  }

  window.onresize = function(){
      canvasSetSize();
  }
}

//监听鼠标 手机触屏事件 函数
function monitorToUser() { 
    //初始化画板状态
  let draw =false;
    //最后画的位置
  let lastPlace;
    //适配手机触摸
  let isTouchDevice = "ontouchstart" in document.documentElement;

  if (isTouchDevice) {
    //适配手机 手指放下
    canvas.ontouchstart = (e) => {
        draw = true;
        let x = e.touches[0].clientX;
        let y = e.touches[0].clientY;
        if (iseEraser) {//要使用eraser
          clearCircle(x, y, radius)
          lastPlace =[x,y];
        }else{
          drawCircle(x,y,radius);
          lastPlace =[x, y];
        }
    };
   //手指移动
    canvas.ontouchmove = (e) => {
        let x = e.touches[0].clientX;
        let y = e.touches[0].clientY;
        if (!draw) { return }
        if (iseEraser) {
          moveHandler(lastPlace[0],lastPlace[1],x,y);
          lastPlace = [x,y];
        } else {
          let newPlace = [x, y];
          drawLine(lastPlace[0], lastPlace[1], x, y);
          lastPlace =newPlace;//这次作为上次的位置
        }
    }
    //手指离开
    canvas.ontouchend = (e) => {
      draw = false;
      record_operation();
    }

  }else{

    //PC
    //鼠标放下为ture
    canvas.onmousedown = (e) => {
        let x = e.clientX;
        let y = e.clientY;
        draw = true;
        if (iseEraser) {//要使用eraser
        // ctx.clearRect(x - lWidth/2, y - lWidth/2, lWidth, lWidth);
          clearCircle(x, y, radius)
          lastPlace =[x,y];
        }else{
          drawCircle(x,y,radius);
          lastPlace =[x, y];
        }
    }
    canvas.onmousemove = (e) => {
          let x = e.clientX;
          let y = e.clientY;
          if (!draw) { return }
          if (iseEraser) {
          //  ctx.clearRect(x - lWidth/2, y - lWidth/2, lWidth, lWidth);
            moveHandler(lastPlace[0],lastPlace[1],x,y);
            lastPlace = [x,y];
          } else {
            let newPlace = [x, y];
            drawLine(lastPlace[0], lastPlace[1], x, y);
            lastPlace =newPlace;//这次作为上次的位置
        }
    }
    //鼠标松开
    canvas.onmouseup = (e) => {
      draw = false;
      record_operation();
    }
  }



}

//画点函数
function drawCircle(x,y,radius){
    // 新建一条路径，生成之后，图形绘制命令被指向到路径上生成路径。
    ctx.beginPath();
    // 画一个以（x,y）为圆心的以radius为半径的圆弧（圆），
    // 从startAngle开始到endAngle结束，按照anticlockwise给定的方向（默认为顺时针）来生成。
    ctx.arc(x,y,lWidth/2,0,Math.PI*2);
    // 通过填充路径的内容区域生成实心的图形
    ctx.fill();
    // 闭合路径之后图形绘制命令又重新指向到上下文中。
    ctx.closePath();
}


//画线
function drawLine(x1, y1, x2, y2) {
  ctx.save()
  ctx.lineWidth = lWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.closePath();
  }

//橡皮圆点
function clearCircle(x, y, radius) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(x,y,lWidth/2,0,2*Math.PI);
  ctx.clip()
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.restore();
  ctx.closePath();
}
function moveHandler(x1,y1,x2,y2){
  //获取两个点之间的剪辑区域四个端点
  let asin = lWidth/2*Math.sin(Math.atan((y2-y1)/(x2-x1)));
  let acos = lWidth/2*Math.cos(Math.atan((y2-y1)/(x2-x1)))
  let x3 = x1+asin;
  let y3 = y1-acos;
  let x4 = x1-asin;
  let y4 = y1+acos;
  let x5 = x2+asin;
  let y5 = y2-acos;
  let x6 = x2-asin;
  let y6 = y2+acos;

  //保证线条的连贯，所以在矩形一端画圆
  clearCircle(x2, y2, radius)

  //清除矩形剪辑区域里的像素
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(x3,y3);
  ctx.lineTo(x5,y5);
  ctx.lineTo(x6,y6);
  ctx.lineTo(x4,y4);
  ctx.closePath();
  ctx.clip();
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.restore();
  ctx.closePath();
}

// 橡皮檫功能
eraser.onclick = function(){
      iseEraser = true;
      eraser.classList.add('active');
      brush.classList.remove('active');
}

//改变画笔粗细
range1.onchange = function () { 
  // console.log(range1.value);
  // console.log(typeof range1.value);
  thickness.style.transform = 'scale('+(parseInt(range1.value))+')';
  // console.log(thickness.style.transform);
  lWidth = parseInt(range1.value*2);
}


//点击画笔
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
}

//改变画笔颜色
function changePenColor() { 
  for (var i = 0; i < ColorPen.length; i++) {
    ColorPen[i].onclick = function () {
      for (var j = 0; j < ColorPen.length;j++) {
        ColorPen[j].classList.remove('active');
        this.classList.add('active');
        activeColor = this.style.backgroundColor;
        ctx.fillStyle = activeColor;
        ctx.strokeStyle = activeColor;
      }
    }
  }
}

// 实现清屏
reSetCanvas.onclick = function(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  setCanvasBg('white');
  canvasHistory=[];
  step = -1;
  revocation.classList.remove('active');
  back_revocation.classList.remove('active');

}

// 重新设置canvas背景颜色
function setCanvasBg(color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 下载图片
save.onclick = function(){
  let imgUrl = canvas.toDataURL('image/png');
  let saveA = document.createElement('a');
  document.body.appendChild(saveA);
  saveA.href = imgUrl;
  saveA.download = 'mypic'+(new Date).getTime();
  saveA.target = '_blank';
  saveA.click();
}

// 实现撤销的功能
let canvasHistory = [];
let step = -1;

//记录每一步画画的操作函数
function record_operation(){
  step++;
  if(step < canvasHistory.length){//历史数组记录的步数
    canvasHistory.length = step;
  }

  // 添加新的绘制记录到历史记录
  canvasHistory.push(canvas.toDataURL());
  if(step > -1){
    revocation.classList.add('active');
  }
}

//撤回方法
function canvasRevocation(){
  if(step > 0){
    step--;
    let canvasPic = new Image();
    canvasPic.src = canvasHistory[step];

    canvasPic.onload =  ()=> {
      ctx.drawImage(canvasPic, 0, 0);
    }
    revocation.classList.add('active');
    back_revocation.classList.add('active');
  }else{
    revocation.classList.remove('active');
    alert('已经无法撤回');
  }
}
//取消撤回方法
function  canvas_back_revocation(){
  if(step < canvasHistory.length - 1){
      step++;
      let canvasPic = new Image();
      canvasPic.src = canvasHistory[step];
      canvasPic.onload = function () {
        ctx.drawImage(canvasPic, 0, 0);
      }
    }else {
      back_revocation.classList.remove('active')
      alert('已经是最新的记录了');
    }
}

revocation.onclick = ()=>{
  canvasRevocation();
}
back_revocation.onclick=()=>{
  canvas_back_revocation();
}

//close功能

for (let i = 0; i < closeBtn.length; i++) {
  closeBtn[i].onclick = function (e) {
    let btnParent = e.target.parentElement;
    btnParent.classList.remove('active');
  }
}


