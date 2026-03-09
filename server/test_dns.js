const dns = require('dns');

const hostname = 'cluster0.vin5vo0.mongodb.net';
const srvDomain = `_mongodb._tcp.${hostname}`;

console.log(`Checking resolution for hostname: ${hostname}`);
dns.resolve4(hostname, (err, addresses) => {
    if (err) {
        console.error(`IPv4 Resolution Failed: ${err.message}`);
    } else {
        console.log(`IPv4 Addresses: ${JSON.stringify(addresses)}`);
    }
});

console.log(`Checking SRV record for: ${srvDomain}`);
dns.resolveSrv(srvDomain, (err, addresses) => {
    if (err) {
        console.error(`SRV Resolution Failed: ${err.message}`);
        console.log('--- Recommendation ---');
        console.log('This confirms the ESERVFAIL issue. Please try changing your DNS servers to 8.8.8.8 and 8.8.4.4.');
    } else {
        console.log(`SRV Addresses: ${JSON.stringify(addresses)}`);
    }
});
