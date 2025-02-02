class BlockOut {

  shape = [] // [ [point, control, control, point] ]
  svgShape;

  actionLogger;

  // Constructor to initialize state
  constructor() {
  }


  createCurve(_points, _id, _speed){
    // get curve
      let [pt1, pt2, pt3, pt4] = _points

    // process curve
    // if this is not the first segment, begin from where the last one ended
      if (this.shape[0] !== undefined){
        pt1 = this.shape[this.shape.length-1][3]
      }

    
      let p = createPath(`M ${pt1.x} ${pt1.y} C ${pt2.x} ${pt2.y}, ${pt3.x} ${pt3.y}, ${pt4.x} ${pt4.y}`)
      p.id = _id
      this.svgShape.appendChild(p)

      // make hitbox
      let p2 = createPath(`M ${pt1.x} ${pt1.y} C ${pt2.x} ${pt2.y}, ${pt3.x} ${pt3.y}, ${pt4.x} ${pt4.y}`)
      p2.id = _id
      p2.class = 'doNotRender'
      p2.setAttribute('stroke-width', '10'); // Set the stroke thickness
      p2.setAttribute('fill', 'none');
      p2.setAttribute('stroke', 'transparent');

      this.svgShape.appendChild(p2)

    // collect the curve
    this.shape.push([ pt1, pt2, pt3, pt4 ])


    if (typeof this.actionLogger === 'function') {
      this.actionLogger( { tool: 'blockOut', fn: "createCurve", args: [ [pt1, pt2, pt3, pt4], p.id, _speed]})
    }
    
  }

  deleteLastCurve(){// referenced in toolbar
    
    this.shape.pop() // also pop the last element in the shape array
    
    const paths = this.svgShape.querySelectorAll('path');
    paths[paths.length - 1].remove();

    if (typeof this.actionLogger === 'function') {
      this.actionLogger( { tool: 'blockOut', fn: "deleteLastCurve"})
    }
  }

  createSvgShape(_parentID, _id){
    // create a new group
    let shape = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      shape.id = _id

    let parent = document.getElementById(_parentID)


    // add group to canvas
    parent.appendChild(shape)

    if (typeof this.actionLogger === 'function') {
      this.actionLogger( { tool: 'blockOut', fn: "createSvgShape", args: [activeLayer.id, shape.id]} );
    }

    this.svgShape = shape

  }

  endShape(_boolAddFill, _style){ // referenced in toolbar
    let boolAddFill = _boolAddFill
    let style = _style

    if (this.svgShape == undefined){
      console.error(`tried to end shape but no shape to be found`)
    }

    if (boolAddFill == true) {
      // put in the fill
      let str = getPathStringFromShape(this.shape)
      this.svgShape.appendChild( createPath(str, style) )
    }

    //clear curves
    this.shape = []

    this.svgShape = undefined

    if (typeof this.actionLogger === 'function') {
      this.actionLogger( { tool: 'blockOut', fn: "endShape", args: [boolAddFill, style]})
    }
  }

  onSwitchLayer(){
    if (this.svgShape != undefined){
      this.endShape( false ) // with no fill
    }
    
  }
}