const { InfluxDB, Point } = require('@influxdata/influxdb-client');
const INFLUX_URL = 'http://influxdb:8086'; 
const INFLUX_TOKEN = 'N80uwoBleWd6WZEXu4pxzrBuK3wC9hu3NIByamssVtL2TGTQsUCYVNQ8SU8UFPSicD_0LO9ooSiw_HdQ0Y4gcw=='; 
const INFLUX_ORG = 'Bitlite'; 
const INFLUX_BUCKET = 'sensor_test_data';

function influxConnect(){
    // Create InfluxDB client
    const client = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN });
    return client
    }

async function storeInfluxDB(decodedData) {
    const { date, time, imeiNumber, dataSets, crc } = decodedData;
  
    try {
      const client = influxConnect();
      const writeApi = client.getWriteApi(INFLUX_ORG, INFLUX_BUCKET);
      const timestamp = new Date(`${date} ${time}`);
      // Prepare data points
      dataSets.forEach((dataSet)   => {
        const point = new Point('devices') // Replace with your InfluxDB measurement name
          .tag('imeiNumber', imeiNumber)
          .tag('slaveId', dataSet.slaveId)
          .floatField('flowRate', dataSet.flowRate)
          .floatField('totalFlow', dataSet.totalFlow)
          .timestamp(timestamp);
        writeApi.writePoint(point)
            
        writeApi.flush()

      });
      
      // Write data to InfluxDB
    //    writeApi.close();
      console.log('Data stored in InfluxDB successfully');
    } catch (error) {
      console.error('Error storing data in InfluxDB:', error);
    }
}

module.exports  = {storeInfluxDB}