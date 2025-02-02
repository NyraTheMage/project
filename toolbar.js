let processStep = '';

document.getElementById('step1').addEventListener('click', function(e){
  if( e.target !==this) {
    return
  }; 
  setProcessStep('ps sketch')
})

  function setProcessStep(step) {
    // adjust tools if step is different
    if (processStep != step ){
      onSwitchTools()
    }


    // Set the new step
    processStep = step;


    // Remove highlight from all steps
    document.querySelectorAll('.toolbar div').forEach(div => {
      div.classList.remove('highlight');
    });

    // change hide mouse circle
    rasterPenNib.setAttribute("stroke","none")


    // clear selection
    selection = []

    // for sketch: Show/hide sketch controls based on step
    const sketchControls = document.getElementById('sketchControls');
    const blockOutControls = document.getElementById('blockOutControls');

    if (step === 'ps sketch') {
        sketchControls.style.display = 'block';

        rasterPenNib.setAttribute("stroke","black")
        document.getElementById('rasterCanvas').style.opacity = '1'; // Set opacity to 50%
        document.getElementById('canvas').style.opacity = '0.2'; // Set opacity to 50%
        l_changeCanvasColor('black')

    } else {
        sketchControls.style.display = 'none';
    }

    if (step === 'ps block out') {
        blockOutControls.style.display = 'block';

        document.getElementById('rasterCanvas').style.opacity = '0.2'; // Set opacity to 50%
        document.getElementById('canvas').style.opacity = '1'; // Set opacity to 50%

        l_changeCanvasColor('blue')

    } else {
        blockOutControls.style.display = 'none';
    }


    if (step === 'ps select') {
        //blockOutControls.style.display = 'block';

        document.getElementById('rasterCanvas').style.opacity = '0.2'; // Set opacity to 50%
        s_bringSvgToFront()

    } else {
        s_bringSvgBack()
    }

    // Highlight the selected step
    document.getElementById('step' + (['ps sketch', 'ps block out', 'ps select', 'ps detailing'].indexOf(step) + 1)).classList.add('highlight');

    // Optional: Log the current process step
    console.log('Current Process Step:', processStep);
  }


// LAYERS
let activeLayer = ''

// ignore this. not using for now. creating them manually
function createLayerDiv(id, parent){
  // Create a new div element
  const div = document.createElement('div');

  // Set the id attribute
  div.id = id;

  // Set the onclick attribute
  div.setAttribute('onclick', `selectLayer('${id}')`);

  // Set the inner text of the div
  div.textContent = id;

  // Append the div to a parent container (e.g., a div with id="layerbar")
  const container = document.getElementById('layerbar');
  if (container) {
      container.appendChild(div);
  }
}

// select layer
function selectLayer(_layerId){
  let layer = _layerId
  
  // Remove highlight from all layers
    document.querySelectorAll('.layerbar div').forEach(div => {
      div.classList.remove('highlight');
    });

  // Set the new layer
  let yikeslayer = `${layer}_layer`
  activeLayer = document.getElementById(yikeslayer)


  if (activeLayer == undefined){
    console.log(`error: no such layer as ${yikeslayer}`)
  }

  //highlight the layer
  document.getElementById(layer).classList.add('highlight');

}

let activeStyle = {fill: "none"}

function setStyle (style) {
  activeStyle = style
}


// color toggle
let pencilFillIsBlack = false;

  function pencilToggleColor() {
    const button = document.getElementById('pencilColorToggle');
    
    if (pencilFillIsBlack) {
      setStyle({ fill: 'white' });
      button.style.backgroundColor = 'white';  // Dehighlight the button
      button.style.color = 'black';  // Adjust text color for visibility
    } else {
      button.style.backgroundColor = 'black';  // Highlight the button
      button.style.color = 'white';  // Adjust text color for visibility
    }

    pencilFillIsBlack = !pencilFillIsBlack;
  }

// TOUCHCANVAS

const touchCanvas = document.getElementById('touchCanvas');


function touchCanvasMouseDown(e){
  document.getElementById('topDiv').innerHTML = "mousedown"
  switch(processStep) {
      case 'ps sketch':
      console.log("sketch DOWN")
        startDrawing(e) // this is in main.js

        break;
      case 'ps block out':
        onPencilDown(e)
        break;
    
      default:
        console.log('mouse down: no tool selected')
    }
}

function touchCanvasMouseMove(e){
   document.getElementById('topDiv').innerHTML = "mouse moving"
  switch(processStep) {
      case 'ps sketch':
        draw(e) // this is in main.js
        sketchUpdateNibLocation(e)
        break;
      case 'ps block out':
        onPencilMove(e)
        break;
    
      default:
        //console.log('mouse move: no tool selected')
    }
}

function touchCanvasMouseUp(e){
  document.getElementById('topDiv').innerHTML = "mouseup"
  switch(processStep) {
      case 'ps sketch':
        stopDrawing(e) // this is in main.js
        break;
      case 'ps block out':
        onPencilUp(e)
        break;
    
      default:
        console.log('mouse up: no tool selected')
    }
}


touchCanvas.addEventListener('mousedown', touchCanvasMouseDown)
touchCanvas.addEventListener('mousemove', touchCanvasMouseMove)
touchCanvas.addEventListener('mouseup', touchCanvasMouseUp)

touchCanvas.addEventListener('touchstart', function(e) {
    e.preventDefault(); // Prevent scrolling
    touchCanvasMouseDown(e); // Call your custom function
  }, { passive: false });

touchCanvas.addEventListener('touchmove', function(e) {
    e.preventDefault(); // Prevent scrolling
    touchCanvasMouseMove(e); // Call your custom function
  }, { passive: false });
touchCanvas.addEventListener('touchend', function(e) {
    e.preventDefault(); // Prevent scrolling
    touchCanvasMouseUp(e); // Call your custom function
  }, { passive: false })

touchCanvas.addEventListener('mouseenter', function(e){
  if (processStep == 'ps sketch'){
    document.body.style.cursor = 'none';
  }

})

touchCanvas.addEventListener('mouseout', function(e){
  switch(processStep) {
      case 'ps sketch':
        stopDrawing(e) // this is in main.js
        break;
      case 'ps block out':
        onPencilOut()
        break;
    
      default:
        console.log('mouse out: no tool selected')
    }

  // change mouse to circle
      document.body.style.cursor = 'auto';

});


canvas.addEventListener('mousedown', function(e){
  switch(processStep) {
      case 'ps select':
        s_select(e) // this is in main.js

        break;
      default:
        console.log('mouse down: no tool selected')
    }
});



document.addEventListener('mousemove', function(e){
  switch(processStep) {
      case 'ps select':
        s_move(e)
        break;
      
      default:
        console.log('mouse move: no tool selected')
    }
})

document.addEventListener('mouseup', function(e){
  switch(processStep) {
      case 'ps select':
        selection = []
        break;
      
      default:
        console.log('mouse move: no tool selected')
    }
})



