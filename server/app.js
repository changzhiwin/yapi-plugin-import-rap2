process.env.NODE_PATH = __dirname;

const Koa = require('koa');
// const bodyParser = require('koa-bodyparser');
const koaBody = require('koa-body');
const router = require('./router.js');
const config = require('./config.json')

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

const server = app.listen(3000);

console.log(
  `服务已启动，请打开下面链接访问: \nhttp://127.0.0.1:3000/`
);
