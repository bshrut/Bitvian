const mqtt = require('mqtt');


const brokerConfig = {
  host: 'broker.emqx.io',
  port: 1883,
  protocol: 'mqtt',
  username: 'TEST-1',
  password: 'TEST'
};

//Topic config
const client = mqtt.connect(brokerConfig);// replace with your MQTT broker address
let currentDate = new Date();
let frameCount = 0;

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  const intervalId = setInterval(() => {
    if (frameCount < 10) {
      const frame = generateDataFrame();
      const topic = 'water-sen-data';

      console.log(`Publishing frame ${frameCount + 1}: ${frame}`);
      client.publish(topic, frame);
      // Increment the timestamp by 1 minute for the next frame
      currentDate = new Date(currentDate.getTime() + 60000);
      frameCount++;
    } else {
      // Stop the interval after publishing 10 frames
      clearInterval(intervalId);
      client.end();
      console.log('Published 10 frames. Connection closed.');
    }
  }, 100); 

  // Close the MQTT connection after publishing frames
  
});

function generateDataFrame() {
  const imei_nos = ["063768651548006","656308004625976","260273965909896","870297027690215"]
  
  const formattedDate = formatDate(currentDate);
  const formattedTime = formatTime(currentDate);
  const imei = chooseRandomItem(imei_nos);

  const numDataPayloads = Math.floor(Math.random() * 5) + 1; // Generate 1 to 5 data payloads
  const dataPayloads = generateDataPayloads(numDataPayloads);

  const frame = `$,${formattedDate},${formattedTime},${imei},${dataPayloads},10,#`;
  return frame;
}

function generateDataPayloads(numPayloads) {
  const payloads = [];
  const slaveIds = ["01","02","03","04","05"];
  for (let i = 0; i < numPayloads; i++) {
    const slaveId = chooseRandomItem(slaveIds);
    const flowRate = generateRandomValue();
    const totalFlow = generateRandomValue();
    payloads.push(`${slaveId},${flowRate},${totalFlow}`);
  }
  return payloads.join(',');
}

function formatDate(date) {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  return `${year}-${month}-${day}`;
}

function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function chooseRandomItem(array) {
  if (array.length === 0) {
    return null; 
  }

  const randomIndex = Math.floor(Math.random() * array.length);

  return array[randomIndex];
}

function generateRandomValue() {
  return (Math.random() * 100).toFixed(2);
}
