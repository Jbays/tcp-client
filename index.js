const NET = require('net');
require('dotenv').config();

const util = require('util');
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 8080;
//NOTE: in principle, user could send non-string data && cause unexpected results
const userName = JSON.stringify({'name':process.argv[2]});

let client = new NET.Socket();
client.setEncoding('utf8');

let lastHeartBeatDetected;
 
//establishes initial connection with server
function makeInitialConnection(port,host){
  return client.connect(port, host, ()=>{
    console.log(`Client connected to host:${host} @ port:${port}`);
    client.write(userName)
  });
}

makeInitialConnection(PORT,HOST);

client.on('data', (data)=>{
  let allResponses = data.toString().split('\n');
  //drop newline
  allResponses.pop();

  allResponses.forEach((response)=>{
    //console.log everything BUT heartbeats
    if ( !response.includes('"type" : "heartbeat"') ) {
      console.log('response from server',response);
    }

    //checks the response for "time" calls
    if ( response.includes(process.argv[2]) && response.includes('random') ) {
      if ( isValidJson(response) ) {
        let json = JSON.parse(response);

        if ( json.msg.random > 30 ) {
          process.stdout.write('Result of "time" call greater than 30! \n');
        }
      }
    };

    //assigns heartbeat data to variables
    //and invokes setTimeout on checkHeartBeat function
    if ( response.includes('"type" : "heartbeat"') ) {
      let currentHeartBeatTime = parseInt(response.split(':')[2].slice(0,-1));

      if ( lastHeartBeatDetected ) {
        //simple monitoring of heartbeat.
        function checkHeartBeat(lastHeartBeat,currHeartBeat){
          if ( currHeartBeat - lastHeartBeat > 2 ) {
            console.log('your connection is delayed by more than 2 seconds.  reconnect and re-login');
            client.destroy();
            makeInitialConnection(PORT,HOST);
          }
        }

        setTimeout(checkHeartBeat,3000,lastHeartBeatDetected,currentHeartBeatTime);
      }
      lastHeartBeatDetected = currentHeartBeatTime;
    }
  })

  if (data.toString().endsWith('exit')) {
    client.destroy();
  }
});

process.stdin.resume();
process.stdin.setEncoding('utf8');

//checks if input string is valid JSON
function isValidJson(string){
  try {
    JSON.parse(string)
  } catch(e) {
    return false;
  }
  return true;
}

process.stdin.on('data', (text)=>{
  process.stdout.write('\n')
  process.stdout.write('>>>')

  console.log('received data:', util.inspect(text));

  if (text === 'quit\n') {
    process.exit();
  }

  if ( text === 'both\n' ){
    let count = {"request":"count"}
    let time = {"request":"time"}
    count.id = process.argv[2];
    time.id = process.argv[2];

    client.write(JSON.stringify(count));
    
    let timeCall = setTimeout(()=>{
      client.write(JSON.stringify(time))
    },2000);

  } else if ( isValidJson(text) ) {
    let json = JSON.parse(text);
    json.id = process.argv[2];

    client.write(JSON.stringify(json));
  } else {
    process.stdout.write('Your input MUST be valid JSON! \n');
  }

});

// Add a 'close' event handler for the client socket
client.on('close', ()=>{
  console.log('Client closed');
});
 
client.on('error', (err)=>{
  console.error('this is your error>>>',err);
});