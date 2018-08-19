// For example, to make the DIV element draggagle, "mydiv" needs to have "position:absolute"
// dragPointerElement(document.getElementById("mydiv"));

function pointerDragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  // elmnt.onmousedown = dragMouseDown;
  elmnt.onpointerdown = dragPointerDown;

  function dragPointerDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    // document.onmouseup = closeDragElement;
    document.onpointerup = closeDragElement;
    // call a function whenever the cursor moves:
    // document.onmousemove = elementDrag;
    document.onpointermove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onpointerup = null;
    document.onpointermove = null;
  }
}
