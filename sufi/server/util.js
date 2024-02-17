const mysql = require('mysql2/promise');

// Replace these with your own database credentials
const host = 'db';
const user = 'root';
const password = 'bitlite';
const database = 'bitlite';

async function connectToDatabase() {
  try {
    const connection = await mysql.createConnection({
      host,
      user,
      password,
      database
    });
    console.log('Connected to MySQL server!');
    // Execute a query (replace with your own query)
    return connection
  } catch (error) {
    console.error('Error connecting to MySQL:', error);
  }
}




// Conversion factors (liters per hour)
const m3PerHourToLPerHour = 1000;
const lPerMinuteToLPerHour = 60;
const lPerSecondToLPerHour = 3600;

// Function to convert between any two units
function convertFlowRate(value, sourceUnit, targetUnit) {
  // Handle invalid units
  if (!["m³/h", "l/hour", "l/minute", "l/second"].includes(sourceUnit) || !["m³/h", "l/hour", "l/minute", "l/second"].includes(targetUnit)) {
    throw new Error("Invalid source or target unit");
  }

  // Convert to liters per hour first for easier manipulation
  let litersPerHour = value;
  switch (sourceUnit) {
    case "m³/h":
      litersPerHour *= m3PerHourToLPerHour;
      break;
    case "l/minute":
      litersPerHour *= lPerMinuteToLPerHour;
      break;
    case "l/second":
      litersPerHour *= lPerSecondToLPerHour;
      break;
  }

  // Convert from liters per hour to the target unit
  switch (targetUnit) {
    case "m³/h":
      return litersPerHour / m3PerHourToLPerHour;
    case "l/minute":
      return litersPerHour / lPerMinuteToLPerHour;
    case "l/second":
      return litersPerHour / lPerSecondToLPerHour;
    default:
      return litersPerHour; // Return liters per hour if target unit is the same
  }
}

// // Example usage
// const flowRateM3PerHour = 1.5; // 1.5 cubic meters per hour

// // Convert to liters per hour
// const flowRateLPerHour = convertFlowRate(flowRateM3PerHour, "m³/h", "l/hour");
// console.log(`${flowRateM3PerHour} m³/h = ${flowRateLPerHour} l/h`);

// // Convert to liters per minute
// const flowRateLPerMinute = convertFlowRate(flowRateM3PerHour, "m³/h", "l/minute");
// console.log(`${flowRateM3PerHour} m³/h = ${flowRateLPerMinute} l/m`);

// // Convert to liters per second
// const flowRateLPerSecond = convertFlowRate(flowRateM3PerHour, "m³/h", "l/second");
// console.log(`${flowRateM3PerHour} m³/h = ${flowRateLPerSecond} l/s`);

// // Convert liters per hour to cubic meters per hour
// const flowRateM3PerHour2 = convertFlowRate(flowRateLPerHour, "l/hour", "m³/h");
// console.log(`${flowRateLPerHour} l/h = ${flowRateM3PerHour2} m³/h`);



function decodeDataFrame(frame) {
    if (frame.startsWith('$') && frame.endsWith('#')) {
        const frameWithoutSOFEOF = frame.slice(1, -1);

        const frameComponents = frameWithoutSOFEOF.split(',');

        if (frameComponents.length > 7) {
            const date = frameComponents[1];
            const time = frameComponents[2];
            const imeiNumber = frameComponents[3];
            const dataSets = [];

            for (let i = 4; i < frameComponents.length - 2; i += 3) {
                const dataSet = {
                    slaveId: frameComponents[i],
                    flowRate: parseFloat(frameComponents[i + 1]),
                    totalFlow: parseFloat(frameComponents[i + 2])
                };
                dataSets.push(dataSet);
            }

            const crc = frameComponents[frameComponents.length - 2];
            console.log({
              date,
              time,
              imeiNumber,
              dataSets,
              crc
          });
            return {
                date,
                time,
                imeiNumber,
                dataSets,
                crc
            };
        } else {
          console.log('else part 1');
            return null; 
        }
    } else {
      console.log('else part 2');

        return null;
    }
}

// todo: device verification using IMEI code as input -- returns true false

async function  verifyDevice (dataset , IMEI){
    const db = await connectToDatabase();
    for({slaveId} of dataset){
        try{
            const q = `SELECT * FROM device WHERE id='${slaveId}' AND IMEI='${IMEI}' `;
            const [rows , fields] = await db.query(q)

            if(rows.length == 0){
                await db.end()
                return false;
            }
        }catch(error){
            console.log(error)
        }

    }
  //  console.log(q);
    await db.end();
    return true
}
// (async() => {

//     let res =  await verifyDevice([{slaveId:'01'} ,  {slaveId:'02'}] , "063768651548006");
//     console.log(res);
// })()
// console.log(verify('01', "063768651548006"));



module.exports = {decodeDataFrame , convertFlowRate , verifyDevice }