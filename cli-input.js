process.stdin.resume();
process.stdin.setEncoding('utf8');
const util = require('util');

process.stdin.on('data', (text)=>{
  console.log('this is text',text);
  console.log('received data:', util.inspect(text));
  if (text === 'quit\n') {
    done();
  }
});

function done() {
  console.log('Now that process.stdin is paused, there is nothing more to do.');
  process.exit();
}


// let sample1 = '{"msg":{"time":"Mon Nov  5 19:34:05 2018","random":20,"reply":"justinbaize"},"date":"19:34/05","sender":"worker","type":"msg"}';
// let sample2 = '{"msg":{"time":"Mon Nov  5 19:35:49 2018","reply":"justinbaize","random":10},"date":"19:35/49","type":"msg","sender":"worker"}';
// let sample3 = '{"date":"19:36/52","type":"msg","sender":"worker","msg":{"time":"Mon Nov  5 19:36:49 2018","reply":"justinbaize","random":20}}';

// function parseResponse(json){
//   console.log('this is json',json);
// }

// console.log(parseResponse(sample1))
// console.log(parseResponse(sample2))
// console.log(parseResponse(sample3))
