class UIToolbar {
  constructor() {
    this.togglePenOn = false;
    this.isMask = false;
    this.currentStyle = new Style()

  }

  setProp() {
    return
  }
}
class Style {
  constructor({
    lineColor = 'rgb(0, 0, 0)',
    fillColor = 'rgb(0, 0, 0)',
    opacity=1,
    zOrder = 0,
    blendMode = 'normal',
    mergeWithLikeObj = false
  } = {}) {
    this.lineColor = lineColor;
    this.fillColor = fillColor;
    this.opacity = opacity; 
    this.zOrder = zOrder;
    this.blendMode = blendMode;
    this.mergeWithLikeObj = mergeWithLikeObj;
  }
}

class Loc {
  constructor ({
    x = 0,
    y = 0,
    rotate = 0
  } = {}) {
    this.x = x;
    this.y = y;
    this.rotate = rotate;
  }
}

class Colors {
  constructor(){
    this.current=rgb(0,0,0)
    
    // put in more colors here
  }
}

class artObject{
  constructor(_name,_style,_loc,_parent){
    this.name=_name
    this.style={}
    this.loc={}
    this.isSelected=false
    this.parent=_parent
    
    Object.assign(this.loc, _loc)
    Object.assign(this.style, _style)
    // copies all proerties from _style over
    // do ensure _style is a instance of the Style class
  }
  
  setStyle(_style){
    Object.assign(this.style, _style)
  }
  
  setLoc(_loc){
    Object.assign(this.loc, _loc)
  }
  
  select() {
    this.isSelected = true
  }
  
  deselect(){
    this.isSelected=false 
  }
  
  style(){
    return this._style
  }
}

class ObjSelector{
  constructor(){
    
    this.ar =[0]
  }
}

class StyleMan{
  constructor() {
  }
  
  matchLineToFill(_artObj){
    let fillColor = _artObj.style.fillColor
    
    let styleChanges = {}
      styleChanges.lineColor = fillColor
    
    _artObj.setStyle(styleChanges)
  }
  
}

class zOrdMan{
  constructor() {
    /*
    0 - BG
    1 - char skin + clothing
    2 - char hair
    3 - det
    4,5, 6... etc add new things ontop
    */
    this.currentNum = 4
  }
}