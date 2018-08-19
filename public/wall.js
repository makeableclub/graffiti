'use strict';

(function() {

  var socket = io();
  socket.emit('name', 'wall');

  var canvas = document.getElementsByClassName('wall')[0];
  var context = canvas.getContext('2d');

  var mClients = {};

  var current = {
    color: 'white'
  };

  socket.on('drawing', onDrawingEvent);
  function onDrawingEvent(data){
    var w = canvas.width;
    var h = canvas.height;
    var client = mClients[data.clientId];
    drawLine(client, data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
  }

  // move cursor without drawing line
  socket.on('moving', function(data){
      var w = canvas.width;
      var h = canvas.height;
      var client = mClients[data.clientId];
      moveCursor(client, data.x1 * w, data.y1 * h);
  });


  socket.on('writing', onWriteText);
  function onWriteText(data) {
      //
      // secret backdoor to clear the touchscreen
      if(data.content.toLowerCase() == "supersweep") {
          document.location.reload();
          return;
      }

      var w = canvas.width;
      var h = canvas.height;
      console.log("write text: " + data.content);

      if( ! data.x ) data.x = randomNumber(canvas.width-300) / w;
      if( ! data.y ) data.y = randomNumber(canvas.height-50) / h;
      console.log("at location: x=" + data.x * w + " y=" + data.y * h);

      var elText = document.createElement("div");
      elText.innerHTML = '<text color:"red";font-size: 32px; font-weight:bold; text-align:center; vertical-align:middle;">' + data.content + '</text>';
      // elText.innerHTML = '<p class="text">' + data.content + '</p>';

      elText.style.height = '40px';
      elText.style.width = '200px';
      elText.style.position = 'absolute';
      elText.style.left = data.x * w;
      elText.style.top = data.y * h;
      elText.id="text-"+randomNumber(100000);

      elText.style.zIndex = 899;

      document.body.appendChild(elText);

      // make this element to be draggable
      dragElement(document.getElementById(elText.id));
      pointerDragElement(document.getElementById(elText.id));

      // tracked in the object list belonged to a client
      var client = mClients[data.clientId];
      if( !client.elements ) {
          client.elements = [];
      }
      client.elements.push(elText);
  }

  socket.on("clearing", onClearEvent);
  function onClearEvent(data) {
      // remove all elements created by this pad.
      var client = mClients[data.clientId];
      console.log("client elements: " + client.elements.length);
      while(true) {
          var ele = client.elements.pop();
          if( ele ) {
              ele.parentNode.removeChild(ele);
          }
          else {
              break;
          }
      }

      // clear the canvas too
      // context.clearRect(0, 0, canvas.width, canvas.height);
  }

  // a new "pad" client joined
  socket.on("hello", function(id) {
      var newClient = new Object();
      mClients[id] = newClient;
      createCursor(id);
  });

  // a "pad" client left
  socket.on("goodbye", function(id) {
      // remove the cursor, and delete this client
      deleteCursor(id);
      delete mClients[id];
  });

  function drawLine(client, x0, y0, x1, y1, color){
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();

    moveCursor(client, x1, y1);
  }

  window.addEventListener('resize', onResize, false);
  onResize();

  // make the canvas fill its parent
  function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }


  // function to handle "cursor"
  function createCursor(id) {
      var cursor = document.createElement('div');
      cursor.style.backgroundRepeat = 'no-repeat';

      // var label = "<svg><circle cx=10 cy=10 r=10 fill='#AAAA00'/></svg>"
      // cursor.innerHTML = '<div style="width:20px; line-height:20px; color:' + client.color
      //           + '; font-size: 19px; font-weight:bold; text-align:center; vertical-align:middle;">' + label + '</div>';

      cursor.innerHTML = "<svg><circle cx=10 cy=10 r=10 fill='" + randomColor() + "'/></svg>";
      cursor.style.height = '20px';
      cursor.style.width = '20px';
      cursor.style.position = 'absolute';
      cursor.style.zIndex = 999;
      cursor.id = id;

      document.body.appendChild(cursor);

      var pad = mClients[id];
      pad.cursor = cursor;

      console.log("Made a cursor for pad client id: " + id);
      // pad.x = pad.y = randomNumber(100);
      // pad.color = "red";
  }

  function deleteCursor(id) {
      var pad = mClients[id];
      if (pad) {
          try {
              var cursor = pad.cursor;
              cursor.parentNode.removeChild(cursor);
              console.log("Removed cursor for pad client: " + id);
          }
          catch(e) {
              console.log("error in removing cursor: " + id);
          }
      }
  }

  function moveCursor(pad, x, y) {
      // console.log("Moving cursor: " + client.id + " to x=" + x + " y=" + y);
      if( !pad )
        return;

      pad.cursor.style.left = x;
      pad.cursor.style.top = y;
  }

  // get a number (0, N-1)
  function randomNumber(N) {
      return Math.floor(Math.random()*N);
  }

  function randomColor() {
      var red = randomNumber(255);
      var green = randomNumber(255);
      var blue = randomNumber(255);

      return "rgb("+ red +", "+ green +", "+ blue +")";
  }

})();
