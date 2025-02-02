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

*/


// A - VARIABLES

// canvas
let canvas = document.getElementById('canvas')
var elementId = 0
var selection = []// array of objects in selection


const actionLog = []

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
      fill = "none",  // Default fill color is black
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

let pointsToFormShape = []; // [pt] shape we are currently adding to. 

// Drawing settings
ctx.strokeStyle = '#000';
ctx.lineWidth = 2;
ctx.lineCap = 'round';

// Event listeners for mouse actions
rasterCanvas.addEventListener('mousedown', startDrawing);
rasterCanvas.addEventListener('mousemove', draw);
rasterCanvas.addEventListener('mouseup', stopDrawing);
rasterCanvas.addEventListener('mouseout', stopDrawing);

// capture points
let rasterDrawCapturedPoints = []

console.log(rasterCanvas)

function startDrawing(e) {
    if (processStep !== 'ps sketch') return; // Only allow drawing when processStep is 1
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
    rasterDrawCapturedPoints.push({x:e.offsetX, y:e.offsetY})

    strokeDownTime = Date.now()
}

function draw(e) {

    if (!isDrawing || processStep !== 'ps sketch') return; // Check processStep here too
    
    rasterDrawCapturedPoints.push({x:e.offsetX, y:e.offsetY})

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function stopDrawing() {
    isDrawing = false;    

    let speed = actionLog_getSpeed()

    actionLog.push({ fn: "recD_stroke", args: [rasterDrawCapturedPoints, ctx.lineWidth, ctx.strokeStyle, speed], speed: speed})
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

function sketchUpdateNibLocation(_pt){
  let pt = _pt

  rasterPenNib.setAttribute("cx", pt.x)
  rasterPenNib.setAttribute("cy", pt.y)

}

function d_setNibSize(size) {
    ctx.lineWidth = size;
    rasterPenNib.setAttribute("r", size/2)
    document.getElementById('nibValue').textContent = size;
    console.log('Nib size:', size);

    actionLog.push({ fn: "d_setNibSize", args: [size] })
}






// C.3 - PENCIL TOOL (process 2)

// point capture
let p_rawpoints = [] 
let p_shape = [] // [ [point, control, control, point] ]
let p_svgShape;

const touchCtx = touchCanvas.getContext('2d');
//const output = document.getElementById('output');

let pencilIsDrawing = false;
let pencilPoints = []; // note pts are in format {x,y}
const pencilUpdateInterval = 10; // 100 milliseconds = 0.1 seconds

let p_shapeID = new W_ID()
let p_curveID = new W_ID()

// Start recording
function onPencilDown(e){
    pencilIsDrawing = true;

    // Reset pencilPoints array
    pencilPoints = []; 
      
    // Clear canvas
    touchCtx.clearRect(0, 0, touchCanvas.width, touchCanvas.height);
    
    // Start new path
    touchCtx.beginPath();
    touchCtx.strokeStyle = 'red';
    touchCtx.lineWidth = 0.5;
    
    // Get initial point
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // add the point
    p_rawpoints.push({x:x, y:y})
    
    touchCtx.moveTo(x, y);
    pencilPoints.push({x, y});

    // time
    strokeDownTime = Date.now()
}

function p_checkMakeShape(){  
  if ( p_svgShape == undefined ){

    const newID = 'pencilShape' + `_${p_shapeID.getNew()}`
    p_createSvgShape(activeLayer, newID)
  }

  //note: do not put in action log. is referenced
}

// Record pencilPoints while drawing
function onPencilMove(e){
    if (!pencilIsDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Draw line
    touchCtx.lineTo(x, y);
    touchCtx.stroke();
    p_rawpoints.push({x:x, y:y})
    
    // Record point
    pencilPoints.push({x, y});

}

// Stop recording and show results
function onPencilUp(e) {
    pencilIsDrawing = false;

    p_checkMakeShape()
    
    let _points = W_PointsToBezier.getCurveFromPoints(pencilPoints)
    let _id = `${p_shapeID.viewCurrent()}`+'_'+p_curveID.getNew()
    let _parent = p_svgShape
    p_createCurve(_points, _id)
}

// Stop recording if mouse leaves canvas
function onPencilOut() {
    if (pencilIsDrawing) {
        pencilIsDrawing = false;
        console.log('Stroke interrupted. Try again.');
    }
}

function p_createCurve(_points, _id, _replaySpeed){

  // get curve
    let [pt1, pt2, pt3, pt4] = _points

    // process curve
    // if this is not the first segment, begin from where the last one ended
      if (p_shape[0] !== undefined){
        pt1 = p_shape[p_shape.length-1][3]
        console.log(`pt 1 is ${pt1.x} ${pt1.y}`)
      }

    // draw path and clear UI line
      touchCtx.clearRect(0, 0, touchCanvas.width, touchCanvas.height);
      p = createPath(`M ${pt1.x} ${pt1.y} C ${pt2.x} ${pt2.y}, ${pt3.x} ${pt3.y}, ${pt4.x} ${pt4.y}`)
      p.id = _id
      p_svgShape.appendChild(p)

    // collect the curve
    p_shape.push([ pt1, pt2, pt3, pt4 ])

    let speed = actionLog_getSpeed()
    actionLog.push({ fn: "recP_stroke", args: [ [pt1, pt2, pt3, pt4], p.id, speed]})
  
}

function p_deleteLastCurve(){// referenced in toolbar
  
  deleteLastInSelection() 
  p_shape.pop() // also pop the last element in the shape array

  actionLog.push({ fn: "p_deleteLastCurve"})
}

function p_createSvgShape(_parent, _id){
  // create a new group
  let shape = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    shape.id = _id

  // add group to canvas
  _parent.appendChild(shape)


  actionLog.push({ fn: "recP_createSvgShape", args: [activeLayer, shape.id]})

  p_svgShape =  shape
}

function p_endShape(boolAddFill){ // referenced in toolbar

  if (boolAddFill == true) {
    // put in the fill
    str = getPathStringFromShape(p_shape)
    p_svgShape.appendChild( createPath(str, activeStyle) )
  }


  //clear curves
  p_shape = []
  p_curveID.resetCount()

  // select current shape
  clearSelection()
  selection.push(p_svgShape)

  p_svgShape = undefined

  actionLog.push({ fn: "recP_endShape", args: [boolAddFill]})
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

function deleteLastInSelection(){
  if (selection && selection.length > 0) {
    const lastElement = selection[selection.length - 1];
    lastElement.remove();
  }

  // note: don't add to actionLog, as it is referenced 
}

function clearSelection(){
  selection = []
  
  // note: don't add to actionLog, as it is referenced 
}


// E - recording
function replayActions() {

    // delete everything
    // Clear canvas
    ctx.clearRect(0, 0, touchCanvas.width, touchCanvas.height);

    deleteAllWithinSVGGroup('skn_layer')// remove everything in skin layer

    const actionLogCopy = actionLog.slice();

    for (const action of actionLogCopy) {
        const { fn, args } = action;

        console.log(fn)

        if (!args) { 
          // no arguments, just run
          window[fn]()

        } else {
          // Call the function by name with the arguments
          if (typeof window[fn] === "function") {

              window[fn](...args); // Spread the arguments into the function
          } else {
              console.error(`Function ${fn} not found.`);
          }
        }
    }
}

// for testing, to clear svg

let rec_p_Shape = [] // need this to add fill in the end
let rec_p_svgShape;

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

  ctx.strokeStyle = 'blue';

  ctx.beginPath();

  let pt1 = points[0]
  ctx.moveTo(pt1.x, pt1.y);

  points.forEach((pt)=>{
    ctx.lineTo(pt.x, pt.y);
  })

  ctx.stroke();
}

function recP_createSvgShape(_parent, _id){
  // create a new group
  let shape = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    shape.id = _id

  // add group to canvas
  _parent.appendChild(shape)

  rec_p_svgShape = shape
}

function recP_stroke(_points, _id, _replaySpeed){

  // get curve
    let [pt1, pt2, pt3, pt4] = _points


    // draw path and clear UI line
      touchCtx.clearRect(0, 0, touchCanvas.width, touchCanvas.height);
      p = createPath(`M ${pt1.x} ${pt1.y} C ${pt2.x} ${pt2.y}, ${pt3.x} ${pt3.y}, ${pt4.x} ${pt4.y}`)
      p.id = _id
      rec_p_svgShape.appendChild(p)

    // collect curve
    rec_p_Shape.push([pt1, pt2, pt3, pt4])

}


function recP_endShape(boolAddFill){ // referenced in toolbar

  if (boolAddFill == true) {
    // put in the fill
    str = getPathStringFromShape(p_shape)
    rec_p_svgShape.appendChild( createPath(str, activeStyle) )
  }


  //clear curves
  recP_shape = []

  // select current shape
  clearSelection()
  selection.push(rec_p_svgShape)

  rec_p_svgShape = undefined

}

