const NET = require('net');
require('dotenv').config();

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 8080;
//NOTE: in principle, user could send non-string data && cause unexpected results
const userName = JSON.stringify({'name':process.argv[2]});
// const sendingJSON = JSON.stringify(process.argv[3]);
// console.log('sendingJSON',sendingJSON);

let client = new NET.Socket();
let lastHeartBeatDetected;
 
//establishes initial connection with server
function makeInitialConnection(){
  return client.connect(PORT, HOST, ()=>{
    console.log('Client connected to: ' + HOST + ':' + PORT);
    client.write(userName)
  });
}

//simple monitoring of heartbeat.
function checkHeartBeat(lastHeartBeat,currHeartBeat){
  if ( currHeartBeat - lastHeartBeat > 2 ) {
    console.log('your connection is delayed by more than 2 seconds.  reconnect and re-login');
    client.destroy();
    makeInitialConnection();
  }
}

makeInitialConnection();

client.setEncoding('utf8');

// client.on('connect',()=>{})

client.on('data', (data)=>{    
  console.log('Client received: ' + data);
  let allResponses = data.toString().split('\n');
  //drop newline
  allResponses.pop();

  //passes through each response
  allResponses.forEach((response)=>{
    //assigns heartbeat data to variables
    //and invokes setTimeout on checkHeartBeat function
    if ( response.includes('"type" : "heartbeat"') ) {
      let currentHeartBeatTime = parseInt(response.split(':')[2].slice(0,-1));
      
      if ( lastHeartBeatDetected ) {
        setTimeout(checkHeartBeat,3000,lastHeartBeatDetected,currentHeartBeatTime)
      }

      lastHeartBeatDetected = currentHeartBeatTime
    }
  })

  if (data.toString().endsWith('exit')) {
    client.destroy();
  }
});

//NOTE: NONE OF THIS CODE REALLY WORKS!
// process.stdin.setEncoding('utf8');

// process.stdin.on('readable', () => {
//   const chunk = process.stdin.read();
//   if (chunk !== null) {
//     // process.stdin.write(sendingJSON)
//     process.stdout.write(`data: ${chunk}`);
//   }
// });

// process.stdin.on('end', () => {
//   process.stdout.write('end');
// });

// process.stdin.on('error',(err)=>{
//   process.stdout.write(`this is your error: ${err}`);
// });

// Add a 'close' event handler for the client socket
client.on('close', ()=>{
  console.log('Client closed');
});
 
client.on('error', (err)=>{
  console.error('this is your error>>>',err);
});