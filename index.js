const NET = require('net');
require('dotenv').config();

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 8080;
//NOTE: in principle, user could send non-string data && cause unexpected results
const userName = JSON.stringify({'name':process.argv[2]});

let client = new NET.Socket();
let lastHeartBeatDetected;
 
//establishes initial connection with server
function makeInitialConnection(){
  return client.connect(PORT, HOST, ()=>{
    console.log('Client connected to: ' + HOST + ':' + PORT);
    client.write(userName)
  });
}

makeInitialConnection();

client.on('data', (data)=>{    
  console.log('Client received: ' + data);
  // console.log('Client received: ' + typeof data);
  // console.log('Client received: ' + data.length);
  
  let allResponses = data.toString().split('\n');
  //drop newline
  allResponses.pop();

  //simple monitoring of heartbeat.
  allResponses.forEach((response)=>{
    response = JSON.parse(response);
    if ( response.type === 'heartbeat' ) {
      //if current heartbeat is more than 3 seconds ahead of current heartbeat, trigger event
      if ( lastHeartBeatDetected && response.epoch - lastHeartBeatDetected > 2 ) {
        console.log('your connection is delayed by more than 2 seconds.  reconnect and re-login');
        client.destroy();
        makeInitialConnection();
      }
      //base case
      lastHeartBeatDetected = response.epoch
    }
  })

  if (data.toString().endsWith('exit')) {
    client.destroy();
  }
});
 
// Add a 'close' event handler for the client socket
client.on('close', ()=>{
  console.log('Client closed');
});
 
client.on('error', (err)=>{
  console.error('this is your error>>>',err);
});