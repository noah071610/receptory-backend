export const _url = {
  client:
    process.env.NODE_ENV === 'development'
      ? `https://${process.env.DOMAIN}`
      : `http://localhost:${process.env.CLIENT_PORT}`,
  server:
    process.env.NODE_ENV === 'development'
      ? `https://api.${process.env.DOMAIN}/api`
      : `http://localhost:${process.env.PORT}/api`,
  originServer:
    process.env.NODE_ENV === 'development'
      ? `https://${process.env.DOMAIN}`
      : `http://localhost:${process.env.PORT}`,
};
// todo : port number?
