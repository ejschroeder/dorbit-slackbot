require('dotenv').config();
const config = require('../config');

const domain = process.env.DOMAIN;
const certEmail = process.env.CERT_EMAIL;
const productionMode = process.env.CERT_PRODUCTION_MODE;

var proxy = require('redbird')({
  port: 80,
  letsencrypt: {
    path: "/etc/ssl/private",
    port: 3000
  },
  ssl: {
    port: 443
  }
});

proxy.register(domain, `http://127.0.0.1:${config.slackbotPort}`, {
  ssl: {
    letsencrypt: {
      email: certEmail,
      production: productionMode === 'true'
    }
  }
});