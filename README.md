# TCP Client

## Before Getting Started
To get started, you'll need to create a .env file.
`touch .env`

To your .env file, add your HOST and PORT variables.  See example below.
`HOST=12.345.678.90
PORT=1234`

Now with HOST and PORT variables defined, you're ready to connect!

## Connect To Server

To get started:
`node index.js [userName]`

Example:
`node index.js justinbaize`

Please note that username length is limited to 12 characters.

## After Inputting Command Above
User can manually input JSON which is sent to server.
`{"request":"INPUT_CALL_NAME_HERE"}`

Please note that client will only accept valid JSON.  Invalid JSON will NOT be sent to server.

Want to send both 'count' and 'time' calls?  After connecting to server, type:
`both`

Want to exit the process?

To exit process, type quit then hit enter.
`quit`

### Screenshot Example
![Simple Demo Screenshot](https://github.com/Jbays/tcp-client/blob/master/screenshot/working-tcp-client.png "Simple Walkthrough of TCP Client's Basic Functionality")


