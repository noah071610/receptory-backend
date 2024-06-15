const isProduction = process.env.NODE_ENV === 'production';
export const domain = process.env.DOMAIN;
const port = process.env.PORT;
export const _url = {
  client: isProduction ? `https://${domain}` : 'http://localhost:3000',
  server: isProduction
    ? `https://api.${domain}/api`
    : `http://localhost:${port}/api`,
  originServer: isProduction ? `https://${domain}` : `http://localhost:${port}`,
};
// todo : port number?
