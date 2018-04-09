import { join } from 'path';
import * as Koa from 'koa';
import * as body from 'koa-better-body';
import * as cors from 'kcors';
import * as view from 'koa-view';
import * as kstatic from 'koa-static';
import * as convert from 'koa-convert';
import { default as proxy } from './proxy';
import { default as router } from './router';

const IPFS_FILE_ENDPOINT =
  process.env.IPFS_FILE_ENDPOINT || 'http://localhost:8080';
const IPFS_API_ENDPOINT =
  process.env.IPFS_API_ENDPOINT || 'http://localhost:5001';
const ETH_SIDE_WEB3 = process.env.ETH_SIDE_WEB3 || 'http://localhost:9002';
const server = new Koa();

server.use(convert(body()));
server.use(cors());
server.use(view(join(__dirname, '../..', '/public/views')));
server.use(kstatic(join(__dirname, '../..', '/public/assets')));

// server.use(bodyparser());
server.use(router.routes());
server.use(router.allowedMethods());
server.use(router.middleware());

// server.use(async (ctx, next) => {
//   if (ctx.path.startsWith('/ipfsapi')) {
//     const handledPath = ctx.path.replace('/ipfsapi', '');
//     const query = ctx.querystring;
//     const ipfsApiUrl = `http://localhost:5001${handledPath}?${query}`;
//     logger.info(`proxy to ipfs:5001 with ${ipfsApiUrl}`);
//     const resp = await request(ipfsApiUrl, { timeout: MAX_TIMEOUT });
//     const data = _.get(resp, 'data').toString();
//     ctx.body = data;
//     // } else if (ctx.path.startsWith('/ipfs')) {
//     //   const ipfsFileUrl = `http://localhost:8080${ctx.path}`;
//     //   logger.info(`proxy to ipfs:8080 with ${ipfsFileUrl}`);
//     //   const resp = await request(ipfsFileUrl, {
//     //     headers: ctx.request.headers,
//     //     timeout: MAX_TIMEOUT,
//     //   });
//     //   const rawFile: Buffer = _.get(resp, 'data');
//     //   ctx.set(resp.headers);
//     //   ctx.body = rawFile.toString();
//   } else if (ctx.path.startsWith('/ethzeus')) {
//     const ethWeb3ApiUrl = `http://localhost:9002`;
//     const options: RequestOptions = {
//       method: ctx.method,
//       contentType: 'json',
//       data: ctx.request.fields,
//     };
//     const resp = await request(ethWeb3ApiUrl, options);
//     const data = _.get(resp, 'data').toString();
//     ctx.body = JSON.parse(data);
//   }
//   await next;
// });

// The proxy for ipfs files
server.use(
  proxy('/_/ipfs/files', {
    target: IPFS_FILE_ENDPOINT,
    rewrite: path => path.replace(/\/_\/ipfs\/files/, '/ipfs'),
    changeOrigin: true,
  }),
);

// The proxy for ipfs api
server.use(
  proxy('/_/ipfs/api', {
    target: IPFS_API_ENDPOINT,
    rewrite: path => path.replace(/\/_\/ipfs\/api/, ''),
    changeOrigin: true,
  }),
);

// side chain rpc proxy
server.use(
  proxy('/eth/zeus', {
    target: ETH_SIDE_WEB3,
    changeOrigin: true,
  }),
);

export default server;
