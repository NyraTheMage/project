//B.2 - SETUP
let layers = ['det_layer','char_layer','h-b_layer']

let charLayers = ['h-f_layer','c-det_layer','skn_layer','bac_layer']

layers.forEach((elem)=>{
  createCanvasLayer(elem, canvas)
})

charLayers.forEach((elem)=>{
  createCanvasLayer(elem, 'char_layer')
})


function selectSkinLayer(){
  selectLayer('skn')
  setStyle({fill: "#284a57"})
  console.log('layer selected')
}
selectSkinLayer()