const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost:1883');

client.on('connect', () => {
  console.log('Connected to MQTT broker');

  setInterval(() => {
    const deviceName = 'MQTT-test-device';
    const resourceName = 'randfloat64';
    const randValue = (Math.random() * 100).toFixed(2);

    const topic = `incoming/data/${deviceName}/${resourceName}`;
    const payload = randValue;

    client.publish(topic, payload);

    console.log(`Published to ${topic}: ${payload}`);
  }, 2000);
});