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

makeInitialConnection();

client.setEncoding('utf8');

client.on('data', (data)=>{    
  console.log('Client received: ' + data);
  let allResponses = data.toString().split('\n');
  //drop newline
  allResponses.pop();

  //simple monitoring of heartbeat.
  //NOTE: sometimes the heartbeat is sent with invalid JSON.  Thus causing the parsing error!

  //technically, this does not 'monitor' heartbeat as expected.  This checks time between heartbeat epochs
  //AND when time between is too great, app disconnects then reconnects.
  //instead, better is to independently check time.  Without relying on the next received heartbeat!
  allResponses.forEach((response)=>{
    if ( response.includes('"type" : "heartbeat"') ) {
      console.log('winner winner chicken dinner!')
      let currentHeartBeatTime = parseInt(response.split(':')[2].slice(0,-1));

      if ( lastHeartBeatDetected && currentHeartBeatTime - lastHeartBeatDetected > 2 ) {
        console.log('your connection is delayed by more than 2 seconds.  reconnect and re-login');
        client.destroy();
        makeInitialConnection();
      }
      
      lastHeartBeatDetected = currentHeartBeatTime;
    }
  })

  //NOTE: NONE OF THIS CODE REALLY WORKS!
  // process.stdin.setEncoding('utf8');

  // process.stdin.on('readable', () => {
  //   console.log('somethings happening!');
  //   const chunk = process.stdin.read();
  //   console.log('this is chunk',chunk);
  //   if (chunk !== null) {
  //     process.stdin.write(sendingJSON)
  //     process.stdout.write(`data: ${chunk}`);
  //   }
  // });
  
  // process.stdin.on('end', () => {
  //   process.stdout.write('end');
  // });

  
  // process.stdin.on('error',(err)=>{
  //   process.stdout.write(`this is your error: ${err}`);
  // });
  

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