const baseController = require('./base.js');


class importRap2Controller extends baseController {
  constructor(ctx) {
    super(ctx);
  }

  async getOneProjectData(ctx) {
    let params = ctx.params;
    let token = params.token
    let projectId = params.projectId;

    ctx.body = {projectId, token};
  }

}

module.exports = importRap2Controller;
