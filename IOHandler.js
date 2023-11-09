var freeze = false;
function onMouseClick(event){
    freeze = !freeze;
}

document.addEventListener('click', onMouseClick, false);

 function onKeydown(event){
    if(event.keyCode == 32){ //objek bisa dirotasi jika spasi ditekan
        freeze = true;
    }
 }

function onKeyup(event){
    if(event.keyCode == 32){ //objek berhenti berotasi jika spasi dilepas
        freeze = false;
    }
}

document.addEventListener('keydown', onKeydown, false);
document.addEventListener('keyup', onKeyup, false);