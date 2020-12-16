const path = require('path');
const Koa = require('koa');
const koaStatic = require('koa-static');
// const bodyParser = require('koa-bodyparser');
const koaBody = require('koa-body');
const router = require('./router.js');
const config = require('./config.json')

if (!config || !config.yapi || !config.rap2 || !config.yapi.host.length || !config.rap2.host.length) {
  console.error('[ERROR] config.json must have yapi and rap2 host. [config.yapi.host] [config.rap2.host]')
  return;
}

const app = new Koa();

// 注入config，使得在Control里面可以引用
app.use( async (ctx, next) => {
  ctx.config = config
  await next();
})

// app.use(bodyParser({multipart: true}));
app.use(koaBody({ multipart: true, jsonLimit: '2mb', formLimit: '1mb', textLimit: '1mb' }));
app.use(router.routes());
app.use(router.allowedMethods());

app.use(koaStatic(path.resolve(__dirname, '../static'), { index: 'index.html', gzip: true }));

const server = app.listen(3000);

console.log(
  `服务已启动，请打开下面链接访问: \nhttp://127.0.0.1:3000/`
);
