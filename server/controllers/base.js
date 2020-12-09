
class baseController {
  constructor(ctx) {
    this.ctx = ctx;
  }

  async init(ctx) {
    let params = Object.assign({}, ctx.query, ctx.request.body);

  }

  async checkLogin(ctx) {
    // let token = ctx.cookies.get('_token');
    // let uid = ctx.cookies.get('_uid');
  }

}

module.exports = baseController;
