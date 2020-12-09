
/**
 *
 * @param {*} router router
 * @param {*} baseurl base_url_path
 * @param {*} routerController controller
 * @param {*} path  routerPath
 * @param {*} method request_method , post get put delete ...
 * @param {*} action controller action_name
 * @param {*} ws enable ws
 */
exports.createAction = (router, baseurl, routerController, action, path, method, ws) => {
  router[method](baseurl + path, async ctx => {
    let inst = new routerController(ctx);
    try {
      await inst.init(ctx);
      ctx.params = Object.assign({}, ctx.request.query, ctx.request.body, ctx.params);

      /*
      if (inst.schemaMap && typeof inst.schemaMap === 'object' && inst.schemaMap[action]) {}
      */

      // 执行
      await inst[action].call(inst, ctx);

    } catch (err) {

      ctx.body =  { code: -1, msg: '服务器出错...', error: err }
    }
  });
};