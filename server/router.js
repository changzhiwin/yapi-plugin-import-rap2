const koaRouter = require('koa-router');
const importRap2Controller = require('./controllers/import-rap2.js');
const { createAction } = require('./utils/commons.js');

const router = koaRouter();

let INTERFACE_CONFIG = {
  interface: {
    prefix: '/rap2/',
    controller: importRap2Controller
  }
};

let routerConfig = {
  interface: [
    {
      action: 'getOneProjectData',
      path: 'get_one_project_data',
      method: 'get'
    },
    {
      action: 'importYFromRap2',
      path: 'importy-from-rap2',
      method: 'get'
    }
  ]
};

for (let ctrl in routerConfig) {
  let actions = routerConfig[ctrl];
  actions.forEach(item => {
    let routerController = INTERFACE_CONFIG[ctrl].controller;
    let routerPath = INTERFACE_CONFIG[ctrl].prefix + item.path;
    createAction(router, '/api', routerController, item.action, routerPath, item.method);
  });
}

module.exports = router;
