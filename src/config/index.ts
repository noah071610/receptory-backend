const isProduction = process.env.NODE_ENV === 'production';
const domain = process.env.DOMAIN;
const clientPort = process.env.CLIENT_PORT;
const port = process.env.PORT;

export const _url = {
  client: isProduction ? `https://${domain}` : `http://localhost:${clientPort}`,
  server: isProduction
    ? `https://api.${domain}/api`
    : `http://localhost:${port}/api`,
  originServer: isProduction ? `https://${domain}` : `http://localhost:${port}`,
};
// todo : port number?
