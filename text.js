var constraints={
    initiator:false,
    trickle: false
};
var peer;


var status_bar = document.getElementsByClassName('status')[0];
var initiate_button = document.getElementsByClassName('offerInitiate')[0];
var sdpBox = document.getElementsByClassName('sdp')[0];
var copy_button = document.getElementsByClassName('copyoffer')[0];
var signal_button = document.getElementsByClassName('signal')[0];

var text_area = document.getElementsByClassName('chatfooter')[0];
var chat_logs = document.getElementsByClassName('chatlogs')[0];

createPeer(constraints);         //initially create a peer with initiator=false

copy_button.addEventListener('click',()=>{
    sdpBox.select();
    
    document.execCommand("copy");
})

initiate_button.addEventListener('click', function () {
            constraints.initiator=true;
            initiate_button.parentNode.removeChild(initiate_button);
            createPeer(constraints);                                    //rewrite the peer with initiator=true on button click
            
        });

signal_button.addEventListener('click',()=>{

      peer.signal(sdpBox.value);                    //signal the peer on button click
      sdpBox.value="";
})

function createPeer(constraints){
    peer = new SimplePeer(constraints);
    
    peer.on('signal',sdp=>{             
        sdpBox.value="";                            //sdp creation
        sdpBox.value=JSON.stringify(sdp);
        
    })

    peer.on('connect',()=>{
        text_area.firstElementChild.disabled=false;                     //on peer connect enable textarea and modify the status div in DOM
        
        copy_button.parentNode.removeChild(copy_button);
        signal_button.parentNode.removeChild(signal_button);
        sdpBox.parentNode.removeChild(sdpBox);
        if(initiate_button.parentNode!=null || initiate_button.parentNode!=undefined)
            initiate_button.parentNode.removeChild(initiate_button);
        
        let status_text = document.createElement("p");
        status_text.innerHTML="Connected";
        status_text.className = "status_text";
        status_bar.appendChild(status_text);




    })

    peer.on('data',data=>{
        createMessageDiv('r',data);
    })

    peer.on('error', err => {
        console.log('error', err);
        
        while(status_bar.firstChild){
            status_bar.removeChild(status_bar.firstChild);
        }
        
        let error_text = document.createElement("p");
        error_text.innerHTML="UNABLE TO CONNECT! REFRESH AND START AGAIN";
        error_text.className = "error_text";
        status_bar.appendChild(error_text);
        
    })

}

function createMessageDiv(toggle,data){
    let div1 =  document.createElement("div");
    div1.classList.add("timestamp");
    
    let div2 =  document.createElement("div");
    if(toggle=='s')
        div2.classList.add("msg-content","msg-s");
    else
        div2.classList.add("msg-content","msg-r");

    let div3 =  document.createElement("div");
    if(toggle=='s')
        div3.classList.add("msg","s");
    else
        div3.classList.add("msg","r");

    let sp_div =  document.createElement("div");
    sp_div.classList.add("sp");
    
    let span =  document.createElement("span");
    let time = new Date();
    let today=time.toLocaleString('en-US',{dateStyle:'medium'});
    today = today.replace(",", "");
    span.innerHTML=today+" ";

    span.innerHTML+=time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
      
    let p =  document.createElement("p");
    p.innerHTML=data;                           //attach message to p tag
    
    div1.appendChild(span);
    div2.appendChild(p);
    div2.appendChild(div1);

    if(toggle=='s'){
        div3.appendChild(div2);
        div3.appendChild(sp_div);
    }
    else{
        div3.appendChild(sp_div);
        div3.appendChild(div2);
    }
    chat_logs.prepend(div3);  //attach message to DOM 
}





function onPressEnter() {
    let key = window.event.keyCode;
    
                            // If the user has pressed enter in textarea in the footer send the message 
    if (key === 13) {
        window.event.preventDefault();
        peer.send(text_area.firstElementChild.value);
        createMessageDiv('s',text_area.firstElementChild.value);
        text_area.firstElementChild.value='';
    }
    
}