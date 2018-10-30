require('dotenv').config();
const NET = require('net');

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 8080;

let client = new NET.Socket();
 
client.connect(PORT, HOST, ()=>{
  console.log('Client connected to: ' + HOST + ':' + PORT);
  // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client 
  client.write('Hello World!');
});
 
client.on('data', (data)=>{    
  console.log('Client received: ' + data);
    if (data.toString().endsWith('exit')) {
      client.destroy();
  }
});
 
// Add a 'close' event handler for the client socket
client.on('close', ()=>{
  console.log('Client closed');
});
 
client.on('error', (err)=>{
  console.error(err);
});