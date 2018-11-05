const NET = require('net');
require('dotenv').config();

const prompt = require('prompt');
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 8080;
//NOTE: in principle, user could send non-string data && cause unexpected results
const userName = JSON.stringify({'name':process.argv[2]});
// const sendingJSON = JSON.stringify(process.argv[3]);

let client = new NET.Socket();
let lastHeartBeatDetected;
 
prompt.get(['inputJson','sendMoreJson'],(err,result)=>{

  if ( result.inputJson !== 'null' ) {
    console.log('result.json was not null');
    client.write(result.inputJson);
  } 

  if ( Boolean(result.sendMoreJson) === true ) {
    prompt.start();
  }
  
})

//establishes initial connection with server
function makeInitialConnection(port,host){
  return client.connect(port, host, ()=>{
    console.log(`Client connected to host:${host} @ port:${port}`);
    client.write(userName)
    prompt.start();
  });
}

//simple monitoring of heartbeat.
function checkHeartBeat(lastHeartBeat,currHeartBeat){
  if ( currHeartBeat - lastHeartBeat > 2 ) {
    console.log('your connection is delayed by more than 2 seconds.  reconnect and re-login');
    client.destroy();
    makeInitialConnection(PORT,HOST);
  }
}

makeInitialConnection(PORT,HOST);

client.setEncoding('utf8');

client.on('ready',()=>{
  console.log('youre ready to do work!');
  //NOTE:  both these requests work and receive responses
  // client.write(JSON.stringify({"request":"time"}));
  // client.write(JSON.stringify({"request":"count"}));
  // prompt.start();
})

client.on('event',()=>{
  console.log('you triggered an event');
})

client.on('data', (data)=>{    
  // console.log('Client received: ' + data +'\n');
  let allResponses = data.toString().split('\n');
  //drop newline
  allResponses.pop();

  //passes through each response
  allResponses.forEach((response)=>{

    if ( !response.includes('"type" : "heartbeat"') ) {
      console.log('response from server',response);
    }

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