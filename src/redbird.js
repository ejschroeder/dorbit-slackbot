require('dotenv').config();

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

proxy.register(process.env.DOMAIN, `http://127.0.0.1:${process.env.SLACKBOT_PORT}`, {
  ssl: {
    letsencrypt: {
      email: process.env.CERT_EMAIL,
      production: process.env.CERT_PRODUCTION_MODE === 'true'
    }
  }
});