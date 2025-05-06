const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost:1883');

client.on('connect', () => {
    console.log('Connected to MQTT broker');

    client.subscribe('incoming/data/#', (err) => {
        if (err) {
            console.log('Failed to subscribe:', err);
        } else {
            console.log('Subscribed to topic: edgex/device/#');
        }
    });
});

client.on('message', (topic, message) => {
    console.log('Received message on topic:', topic);
    console.log('Message:', message.toString());

    try {
        const data = JSON.parse(message.toString());
        console.log('Parsed data:', data);
    } catch (error) {
        console.log('Error parsing message:', error);
    }
});
