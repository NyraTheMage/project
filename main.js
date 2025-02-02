/* Data structions

point = {x,y, h1?, h2?} with h1 and h2 being {x,y}

line = [ point , point]

curve = [ point, point, point, point ] < bexier curve

shape = [ curve ] 

shapeHandles = [ 'handleType' ] where handleType of point could be: 
                                                          mirror (handles equidistance and angle)
                                                          seperate
                                                          front - ignore for now
                                                          back - ignore for now
                                                          sharp (ctrl = pt)




SVG
  Layer (layerTool)
    Shape 
      (Curve)
        Points

- create shapes: pencilTool

- select/deselect shapes: selectTool

- translate/scale/rotate Shapes : selectTool

- edit points Shapes: selectTool

*/


// A - VARIABLES

// canvas
let canvas = document.getElementById('canvas')
var elementId = 0
var selection = []// array of objects in selection


var actionLog = []

var strokeDownTime = 0 // to keep track of the stroke down time for pen and
function actionLog_getSpeed (){ // run on stroke up

  if (strokeDownTime==0){
    throw new Error("ran actionLog_getSpeed with no strokeDownTime");
  }
  let ret = Date.now()-strokeDownTime
  strokeDownTime = 0

  return ret
}

// B - TESTING THINGS + SETUP

function listenForClick() {
    window.addEventListener('click', (event) => {
        // Check if the clicked element has an ID
        if (event.target.id) {
            console.log('Clicked element ID:', event.target.id);
            return event.target.id;  // Return the ID of the clicked element
        }
    });
}

//listenForClick()

/*
const testLine = [
  { x: 50, y: 300 }, // Start point
  { x: 150, y: 50,}, // Straight line
  { x: 250, y: 50, h1: { x: 200, y: 150 } }, // Quadratic curve control point
  { x: 350, y: 300 }, // Straight line
  { x: 200, y: 300, h2: { x: 300, y: 400 } }, // Smooth curve
];

//addHandle( testLine[3], {x: 400, y:350}, "front")
let pathstring = getPathstring (testLine)
canvas.appendChild( createPath ( pathstring ) )


// B.1 - TO VISUALISE TESTS
function drawCircle(_point, fill, size = 10) {
  const svgNS = "http://www.w3.org/2000/svg";
  let cx = _point.x
  let cy = _point.y

  
  // Create the circle
  const circle = document.createElementNS(svgNS, "circle");
  circle.setAttribute("cx", cx); // Center x-coordinate
  circle.setAttribute("cy", cy); // Center y-coordinate
  circle.setAttribute("r", size);   // Radius
  circle.setAttribute("fill", fill); // Fill color

  canvas.appendChild(circle);
}

testLine.forEach((elem, index) => {
  drawCircle(elem, `hsl(${index*30}, 100%, 50%)`)
  });

*/

function createCanvasLayer(_id,_parentId){

  let l = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    l.id = _id

  let parent = document.getElementById(_parentId) ?? canvas

  parent.appendChild(l)
}

// C - FUNCTIONS TO DRAW

function getElementId(){
  elementId+=1
  return elementId
}


// C.1 - pen tool

// draw a path
function createPath ( _pathstring, _options = {}) {
  const {
      fill = "none", 
  } = _options;

  let elem = document.createElementNS("http://www.w3.org/2000/svg", "path")

  elem.setAttribute("d", _pathstring)
  elem.setAttribute("fill", fill)
  elem.setAttribute("stroke", "black")
  elem.id = getElementId()

  // add path to selection
  selection.push(elem)

  return elem
}




// get string from line
function getPathstring( _line ){
      
    let retStr = "M"
    let ar = _line

    // for every point except last point
    for (let i = 0; i < ar.length-1; i+=1) { 

      let pt = ar[i]; 
      let nextPt = ar[i+1]; 
      
      retStr += ` ${pt.x} ${pt.y}`


      // CHECK DOES CTRL PT 1 EXIST
      if (pt.h2 !== undefined){
        // control point 1 exists
        
        if (nextPt.h1 !== undefined){
          // control point 1 and 2 exists

          retStr += ` C ${pt.h2.x} ${pt.h2.y} ${nextPt.h1.x} ${nextPt.h1.y}`

        } else {
          // only control point 1 exists
          retStr += ` S ${pt.h2.x} ${pt.h2.y}`  
          retStr+= getPathstringCheckSharpPoint(nextPt) + " L "

          }

      // CHECK DOES CTRL PT 2 EXIST
      } else if (nextPt.h1 !== undefined){
        // only control point 2 exists
        retStr+= " L " + getPathstringCheckSharpPoint(pt)
        retStr += ` S ${nextPt.h1.x} ${nextPt.h1.y}`
        

      } else {
        // its a straight line
        retStr += ` L`
      }
    }

    
    // for last point (written seperately to ignore last handles)
    let lastPt = ar[ar.length-1]
    retStr += ` ${lastPt.x} ${lastPt.y}`

    // TO add later
    //CHECK IS PATH CLOSED
    /*
    if (this.closed == true){

      let firstPt = ar[0].item

      // have two handles 
      if (lastPt.h2 && firstPt.h1){
        retStr += ` C ${lastPt.h2.x} ${lastPt.h2.y} ${firstPt.h1.x} ${firstPt.h1.y}`
      } else {
        if (firstPt.h1){ // have one handle
          retStr+= " L " + this.getPathstringCheckSharpPoint(lastPt)
          retStr += ` S ${firstPt.h1.x} ${firstPt.h1.y}`
        } else if (lastPt.h2){ // have one handle other
          retStr += ` S ${lastPt.h1.x} ${lastPt.h1.y}`
          retStr+= this.getPathstringCheckSharpPoint(firstPt)  + " L "
        }
      }
      
      retStr += ` ${firstPt.x} ${firstPt.y}`;
      retStr += ` Z`
    }
  */


    return retStr
  }

  // used in getPathstring
  function getPathstringCheckSharpPoint(_pointToCheck){ 
    let pt = _pointToCheck
    let retStr = ""

    // check if current point is sharp
    if (!pt.h1){
      retStr += ` ${pt.x} ${pt.y}`
    }

    return retStr
  }


// add handle to point
function addHandle( _point, _handlePoint, _type){
    let reflectedPt;

    let x = _handlePoint.x,
        y = _handlePoint.y
        pt = _point

    switch(_type) {
      case "front":
        pt.h1 = {x: x,y: y}
        break;
      case "back":
        pt.h2 = {x: x,y: y}
        break;
      case "mirror":
        pt.h2 = {x: x,y: y}
        reflectedPt = reflectUponPt(x,y, pt.x, pt.y)
        pt.h1 = {x: reflectedPt.x, y: reflectedPt.y}
        break;
      case "mirrorF2B":
        pt.h1 = {x: x,y: y}
        reflectedPt = reflectUponPt(x,y, pt.x, pt.y)
        pt.h2 = {x: reflectedPt.x, y: reflectedPt.y}
        break;
      default:
        settings.log.uiCommentsF(`error at addhandle. Location is should be "front", "back", "mirror", or "mirrorF2B"`)
    }
  }

function reflectUponPt( _point, _PivPoint) {
  let x = _point.x,
      y = _point.y,
      pivX = _PivPoint.x,
      pivY = _PivPoint.y

  return { x:2*pivX-x, y:2*pivY-y}
}


// C.2 - PEN TOOL (process 1)
const rasterCanvas = document.getElementById('rasterCanvas');

const ctx = rasterCanvas.getContext('2d');
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let drawingMode = 'draw'

let pointsToFormShape = []; // [pt] shape we are currently adding to. 

// Drawing settings
ctx.strokeStyle = '#000';
ctx.lineWidth = 2;
ctx.lineCap = 'round';

// Event listeners for mouse actions

/*
rasterCanvas.addEventListener('mousedown', startDrawing);
rasterCanvas.addEventListener('mousemove', draw);
rasterCanvas.addEventListener('mouseup', stopDrawing);
rasterCanvas.addEventListener('mouseout', stopDrawing);


rasterCanvas.addEventListener('touchstart', function(e) {
    e.preventDefault(); // Prevent scrolling
    startDrawing(); // Call your custom function
  }, { passive: false });
rasterCanvas.addEventListener('touchmove', function(e) {
    e.preventDefault(); // Prevent scrolling
    draw(); // Call your custom function
  }, { passive: false });
rasterCanvas.addEventListener('touchend', function(e) {
    e.preventDefault(); // Prevent scrolling
    stopDrawing(); // Call your custom function
  }, { passive: false });
*/


// capture points
let rasterDrawCapturedPoints = []

console.log(rasterCanvas)


function getOffset(e){
  let x = 0
  let y = 0
  if(e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel'){
        var touch = e.touches[0] 
        var rect = touchCanvas.getBoundingClientRect()
        x = touch.pageX - rect.left
        y = touch.pageY - rect.top



    } else if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || e.type == 'mouseover'|| e.type=='mouseout' || e.type=='mouseenter' || e.type=='mouseleave') {
        x = e.offsetX;
        y = e.offsetY;
    } else {
    }

  console.log(`client at ${x}, ${y}`)

  return {x: x, y:y}
}

function startDrawing(e) {
    if (processStep !== 'ps sketch') return; // Only allow drawing when processStep is 1
    isDrawing = true;


    let offset = getOffset(e)
    offsetX = offset.x
    offsetY = offset.y
    console.log(`touch started ${offsetX}, ${offsetY}`)


    lastX = offsetX
    lastY = offsetY;
    rasterDrawCapturedPoints.push({x:offsetX, y:offsetY})

    strokeDownTime = Date.now()

}

function draw(e) {
    if (!isDrawing || processStep !== 'ps sketch') return; // Check processStep here too
 
    // modify for touch events to not use offsetX
    let offset = getOffset(e)
    offsetX = offset.x
    offsetY = offset.y

    rasterDrawCapturedPoints.push({x:offsetX, y:offsetY})

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
    
    lastX = offsetX
    lastY = offsetY;

}

function stopDrawing() {
    // check if we are actually drawing first 
    if (isDrawing == false ){
      return
    }

    isDrawing = false;    

    let speed = actionLog_getSpeed()

    actionLog.push({ tool: "rasterDraw", fn: "recD_stroke", args: [rasterDrawCapturedPoints, ctx.lineWidth, drawingMode, speed], speed: speed})
    rasterDrawCapturedPoints=[]
}

// You can control drawing by changing processStep
// Example: processStep = 1; // Enable drawing
// Example: processStep = 0; // Disable drawing


function d_setMode(mode) {
    drawingMode = mode;
    if (mode === 'erase') {
        ctx.globalCompositeOperation = 'destination-out';
    } else {
        ctx.globalCompositeOperation = 'source-over';
    }
    console.log('Drawing mode:', drawingMode);

    actionLog.push({ fn: "d_setMode", args: [mode] })
}

// show nib
let rasterPenNib = document.createElementNS("http://www.w3.org/2000/svg", "circle")
  rasterPenNib.setAttribute("r", 1)
  rasterPenNib.setAttribute("fill", "none")
  rasterPenNib.setAttribute("cx", 100)
  rasterPenNib.setAttribute("cy", 100)



  canvas.appendChild(rasterPenNib)

function sketchUpdateNibLocation(e){

  let offset = getOffset(e)

  rasterPenNib.setAttribute("cx", offset.x)
  rasterPenNib.setAttribute("cy", offset.y)

}

function d_setNibSize(size) {
    ctx.lineWidth = size;
    rasterPenNib.setAttribute("r", size/2)
    document.getElementById('nibValue').textContent = size;
    console.log('Nib size:', size);

    actionLog.push({ tool:'rasterDraw', fn: "d_setNibSize", args: [size] })
}






// C.3 - PENCIL TOOL (process 2)

const pencilTool = new BlockOut()
  pencilTool.actionLogger = function (_object) {
    actionLog.push(_object);
};

const shapeID = new W_ID()
const curveID = new W_ID()


const touchCtx = touchCanvas.getContext('2d');
//const output = document.getElementById('output');

let pencilIsDrawing = false;
let p_rawpoints = []; // note pts are in format {x,y}
const pencilUpdateInterval = 10; // 100 milliseconds = 0.1 seconds



// Start recording
function onPencilDown(e){
    pencilIsDrawing = true;


    // Reset p_rawpoints array
    p_rawpoints = []; 
      
    // Clear canvas
    touchCtx.clearRect(0, 0, touchCanvas.width, touchCanvas.height);
    
    // Start new path
    touchCtx.beginPath();
    touchCtx.strokeStyle = 'red';
    touchCtx.lineWidth = 0.5;
    
    // Get initial point
    let offset = getOffset(e)
    offsetX = offset.x
    offsetY = offset.y
    
    touchCtx.moveTo(offsetX, offsetY);
    p_rawpoints.push({x:offsetX, y:offsetY});

    // time
    strokeDownTime = Date.now()
}

// Record p_rawpoints while drawing
function onPencilMove(e){
    if (!pencilIsDrawing) return;

    let offset = getOffset(e)
    offsetX = offset.x
    offsetY = offset.y

    // Draw line
    touchCtx.lineTo(offsetX, offsetY);
    touchCtx.stroke();
    p_rawpoints.push({x:offsetX, y:offsetY})

}

// Stop recording and show results
function onPencilUp(e) {
    pencilIsDrawing = false;

    if ( pencilTool.svgShape == undefined ){
      const newID = 'p_' + shapeID.getNew()
      pencilTool.createSvgShape(activeLayer.id, newID)
    }
    
    let _points = W_PointsToBezier.getCurveFromPoints(p_rawpoints)
    let _id = `${shapeID.viewCurrent()}`+'_'+curveID.getNew()
    let _speed = actionLog_getSpeed()


    pencilTool.createCurve(_points, _id, _speed)

    // clear UI line
    touchCtx.clearRect(0, 0, touchCanvas.width, touchCanvas.height);
}

// Stop recording if mouse leaves canvas
function onPencilOut() {
    if (pencilIsDrawing) {
        pencilIsDrawing = false;
        console.log('Stroke interrupted. Try again.');
    }
}

function endPencilShape(boolAddFill){
  curveID.resetCount()
  pencilTool.endShape(boolAddFill, activeStyle)

  // select current shape
  clearSelection()
  selection.push(pencilTool.svgShape)
}

function deleteLastPencilStroke(){
  deleteLastInSelection()
  pencilTool.deleteLastCurve()

}

function getPathStringFromShape(_shape) {
  let bezierCurves = _shape
  if (!Array.isArray(bezierCurves) || bezierCurves.length === 0) {
    throw new Error("Invalid input: must be a non-empty array of Bézier curves.");
  }

  let pathString = '';

  bezierCurves.forEach((curve, index) => {
    const [start, control1, control2, end] = curve;
    const { x: startX, y: startY } = start;
    const { x: cx1, y: cy1 } = control1;
    const { x: cx2, y: cy2 } = control2;
    const { x: endX, y: endY } = end;

    if (index === 0) {
      // Move to the start point for the first curve
      pathString += `M ${startX},${startY} `;
    }

    // Add the cubic Bézier command for the current curve
    pathString += `C ${cx1},${cy1} ${cx2},${cy2} ${endX},${endY} `;
  });

  return pathString.trim();
}


// D - selection

/*

// mousedown > mousemove => translate


// a select
*/

const s_mouseLoc = {x:0,y:0}
const s_transformCache = new Map();


function deleteLastInSelection(){
  if (selection && selection.length > 0) {
    const lastElement = selection[selection.length - 1];
    lastElement.remove();
  }

  // note: don't add to actionLog, as it is referenced 
}

function clearSelection(){
  selection = []
  s_transformCache.clear()
  // note: don't add to actionLog, as it is referenced 
}

function s_bringSvgToFront(){
  canvas.style.zIndex = "10";
}

function s_bringSvgBack(){
  canvas.style.zIndex = "1";
}

function s_select(event){
  s_mouseLoc.x = event.clientX
  s_mouseLoc.y = event.clientY
  console.log('selecting')

  let element = event.target

  selection.push(element)
  let elemTrans = getTransformValues(element)

  console.log('caching')
  s_transformCache.set(element.id, elemTrans);
  console.log(s_transformCache)
}


/**
 * Extracts the current translate, rotate, scale, and skew values from an SVG element's transform attribute.
 * @param {SVGElement} svgObject - The SVG element to retrieve the transform values from.
 * @returns {Object} An object containing the current translate, rotate, scale, and skew values.
 * // Example output: { translateX: 50, translateY: 30, rotate: 45, scaleX: 1, scaleY: 1 }
 */
function getTransformValues(svgObject) {
    let transform = svgObject.getAttribute('transform') || '';

    console.log(transform+"before")
    let values = {
        translateX: 0,
        translateY: 0,
        rotate: 0,
        scaleX: 1,
        scaleY: 1,
        skewX: 0,
        skewY: 0
    };

    // Regex to capture all relevant transformations (translate, rotate, scale, skew)
    const transformRegex = /([a-zA-Z]+)\(([^)]+)\)/g;
    let match;

    // Use regex to match all transformations in the string
    while ((match = transformRegex.exec(transform)) !== null) {
        let type = match[1];
        let params = match[2].split(',').map(val => parseFloat(val.trim()));

        // Handle each transformation type
        switch (type) {
            case 'translate':
                values.translateX = params[0] || 0;
                values.translateY = params[1] || 0;
                break;
            case 'rotate':
                values.rotate = params[0] || 0;
                break;
            case 'scale':
                values.scaleX = params[0] || 1;
                values.scaleY = params[1] || values.scaleX; // If only one value is provided, assume it's uniform scaling
                break;
            case 'skewX':
                values.skewX = params[0] || 0;
                break;
            case 'skewY':
                values.skewY = params[0] || 0;
                break;
        }
    }

    console.log(transform+"after")

    return values;
}

function objectToTransformString(transformValues) {
    let transformString = '';

    // Add translate
    if (transformValues.translateX !== undefined || transformValues.translateY !== undefined) {
        transformString += `translate(${transformValues.translateX || 0}, ${transformValues.translateY || 0}) `;
    }

    // Add rotate
    if (transformValues.rotate !== undefined) {
        transformString += `rotate(${transformValues.rotate || 0}) `;
    }

    // Add scale
    if (transformValues.scaleX !== undefined || transformValues.scaleY !== undefined) {
        transformString += `scale(${transformValues.scaleX || 1}, ${transformValues.scaleY || transformValues.scaleX || 1}) `;
    }

    // Add skewX
    if (transformValues.skewX !== undefined) {
        transformString += `skewX(${transformValues.skewX || 0}) `;
    }

    // Add skewY
    if (transformValues.skewY !== undefined) {
        transformString += `skewY(${transformValues.skewY || 0}) `;
    }

    // Trim any extra spaces at the end and return the transform string
    return transformString.trim();
}


function s_move(event){
  let dispX = event.clientX - s_mouseLoc.x
  let dispY = event.clientY - s_mouseLoc.y

  s_mouseLoc.x = event.clientX
  s_mouseLoc.y = event.clientY

  selection.forEach((elem)=>{
    // find cached transforms
    let trans = s_transformCache.get(elem.id)
    console.log(trans)

    // add the displacement
    trans.translateX += dispX
    trans.translateY += dispY

    // apply the transformation

    // select all the elements, because some might be hitboxes
    let elements = document.querySelectorAll(`[id = "${elem.id}"]`);

    elements.forEach(el => {
        let transformString = objectToTransformString(trans)
        console.log(transformString)
        el.setAttribute('transform', transformString)
    });
  })
}

// E - recording

let recBlockOut = new BlockOut()

  // function so that it can replay
  recBlockOut.replay = function (action) {

    const { fn, args } = action;
    if (typeof this[fn] === 'function') {
      if (args){
        this[fn](...args);
      } else {
        this[fn]
      }
      console.log(`....ran ${fn}`)
    } else {
      console.log(`....no such function as ${fn}`)
    }

  }

function printActionLog(){
  actionLog.forEach((item)=>{
    let t = item.tool
    let a = item.args
    let fn = item.fn

    let str = `${t}, ${fn}`

    if (a != null){
      if (a.length > 0){
        a.forEach((arg)=>{
          // truncate if too long
          argStr = JSON.stringify(arg)

          let length = 10
          let ending = '...'
          if (argStr.length > length) {
            // If yes, truncate the string to length - ending.length characters and append the ending
            argStr = argStr.substring(0, length - ending.length) + ending;
          }
          str += ` "${argStr}" ,`
        })
      }
    }
    console.log(str)
  })

}

function replayActions() {
  // delete everything
  // Clear canvas
  ctx.clearRect(0, 0, touchCanvas.width, touchCanvas.height);

  deleteAllWithinSVGGroup('skn_layer')// remove everything in skin layer

  const actionLogCopy = actionLog.slice();

  for (const action of actionLogCopy) {
    const { tool, fn, args } = action;

    console.log('..fn is '+fn)
    
    // check if it is from blockOut class
    if (tool == 'blockOut'){
      
      recBlockOut.replay ( {fn, args} )
      
    } else {

      if (!args) { 
      // no arguments, just run
      window[fn]()
      console.log(`....ran no arg ${fn}`)

      } else {

        // Call the function by name with the arguments
        if (typeof window[fn] === "function") {

            window[fn](...args); // Spread the arguments into the function
            console.log(`....ran w arg ${fn}`)
        } else {
            console.error(`....Function ${fn} not found.`);
        }
      }
    }
  }
}

// for testing, to clear svg


function deleteAllWithinSVGGroup(groupId) {
    const group = document.getElementById(groupId);
    if (group) {
        while (group.firstChild) {
            group.removeChild(group.firstChild);
        }
    }
}

function recD_stroke(points, nib, mode, speed){

  // stroke settings
  ctx.lineWidth = nib;
  drawingMode = mode;
    if (mode === 'erase') {
        ctx.globalCompositeOperation = 'destination-out';
    } else {
        ctx.globalCompositeOperation = 'source-over';
    }

  ctx.beginPath();

  let pt1 = points[0]
  console.log('.... pt1 is '+pt1)
  ctx.moveTo(pt1.x, pt1.y);

  points.forEach((pt)=>{
    ctx.lineTo(pt.x, pt.y);
  })

  ctx.stroke();
}


// F - layers
function onSwitchTools(){
  pencilTool.onSwitchLayer()
}

function l_changeCanvasColor(_color){

  // Clear canvas
  ctx.clearRect(0, 0, touchCanvas.width, touchCanvas.height);

  const actionLogCopy = actionLog.slice();

  ctx.strokeStyle = _color;

  // replay only rasterCanvas
  for (const action of actionLogCopy) {
    const { tool, fn, args } = action;

    
    // check if it is from blockOut class
    if (tool == 'rasterDraw'){
      
      window[fn](...args); // Spread the arguments into the function
      
    } 
  }
}





