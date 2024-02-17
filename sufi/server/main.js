const mqtt = require("mqtt");
// const httpServer = require("./http-server/app");
const { decodeDataFrame, verifyDevice } = require("./util");
const {storeInfluxDB} = require('./influxdb')
require("dotenv").config();
const express = require('express')

//broker config
const brokerConfig = {
  host: process.env.BROKER_HOST,
  port: process.env.BROKER_PORT,
  protocol: process.env.BROKER_PROTOCOL,
  username: process.env.BROKER_USERNAME,
  password: process.env.BROKER_PASSWORD,
};

//Topic config
const dataTopic = "water-sen-data";
const clientId = "client" + Math.random().toString(36).substring(7);
const mqttClient = mqtt.connect(brokerConfig);

//express instance
const app = express();
const port = 3000;

let count = 0;

app.use(express.json());

mqttClient.on("connect", () => {
  console.log("Client connected:" + clientId);
});

mqttClient.on("error", (err) => {
  console.log("Error: ", err);
  mqttClient.end();
});

mqttClient.on("reconnect", () => {
  console.log("Reconnecting...");
});

mqttClient.on("message", async (topic, message, packet) => {
  console.log(`Topic - ${topic} \nPacket ${packet} \nmessage : ${message}`);
  try {
    const frame = message.toString();
    const decodedFrame = decodeDataFrame(frame);
    if (!decodedFrame) {
      console.log("decoding was not complete");
      return;
    }
    const verified = await verifyDevice(
      decodedFrame.dataSets,
      decodedFrame.imeiNumber
    );
    if (verified) {
      console.log("Decoded Frame:", decodedFrame);
      await storeInfluxDB(decodedFrame);
    } else {
      console.log("Failed to verify frame.");
    }

    console.log(count++);
  } catch (error) {
    console.log(error);
  }

  // mqttClient.publish(`acknowledgment/${productId}`, `Received data frame from device ${productId}`, (a) => {
  //   console.log(`Published acknowledgment on topic acknowledgment/${productId}: Received data frame from device ${productId}`);
  // });
});

mqttClient.subscribe(dataTopic, { qos: 0 }, (err, grant) => {
  console.log(`Subscribe on topic ${dataTopic}`);
  console.log(err, grant);
});

// Endpoint for sending data to the device
app.post("/send-data", (req, res) => {
  const { deviceId, command } = req.body;

  if (!deviceId || !command) {
    return res.status(400).json({ error: "Invalid data format" });
  }

  const dataFrame = `Command is : ${command}`;

  mqttClient.publish(`command/${deviceId}`, dataFrame, (err) => {
    if (err) {
      console.error("Error publishing data:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    console.log(
      `Published data frame on topic 'command/${deviceId}': ${dataFrame}`
    );
    return res.status(200).json({ message: "Data sent successfully" });
  });
});

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
