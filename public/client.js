document.addEventListener("DOMContentLoaded", () => {
  let mouse = {
    click: false,
    move: false,
    pos: { x: 0, y: 0 },
    pos_prev: false
  };

  // get canvas element and create context
  const canvas = document.getElementById('drawing');
  const lineSlider = document.getElementById('lineSize');
  const blueButton = document.getElementById('blue');

  const context = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const socket = io.connect();

  let randomColor = ['#FF0000', '#888888', '#1200d6']
  // let penColor = randomColor[Math.floor(Math.random() * 3)];

  let lineColor = '#000000'
  let lineWidth = lineSlider.value;


  // TODO: make this function dynamic
  blueButton.onclick = (e) => {
    console.log("blue button click!");
    lineColor = 'blue'
  }

  // register mouse event handlers
  canvas.onmousedown = (e) => { mouse.click = true; };
  canvas.onmouseup = (e) => { mouse.click = false; };

  canvas.onmousemove = (e) => {
    mouse.pos.x = e.clientX;
    mouse.pos.y = e.clientY;
    mouse.move = true;
  };

  // draw line received from server
  socket.on('draw_line', (data) => {
    let line = data.line;
    context.beginPath();

    //  set line width
    context.strokeStyle = data.line[2];
    context.lineWidth = data.line[3];

    // set end cap of line 'round' 'square' 'butt'
    context.lineJoin = 'round'
    context.lineCap = 'round';

    context.moveTo(line[0].x, line[0].y);
    context.lineTo(line[1].x, line[1].y);

    context.stroke();
  });

  // main loop, running every 5ms
  function mainLoop() {
    // check if the user is drawing
    if (mouse.click && mouse.move && mouse.pos_prev) {

      lineWidth = lineSlider.value;

      // send line to to the server
      socket.emit('draw_line', { line: [mouse.pos, mouse.pos_prev, lineColor, lineWidth] });
      mouse.move = false;
    }
    mouse.pos_prev = { x: mouse.pos.x, y: mouse.pos.y };
    setTimeout(mainLoop, 5);
  }
  mainLoop();
});
