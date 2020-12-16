
const axios = require('axios');
const baseController = require('./base.js');
const convert = require('../utils/data-convert.js');

class importRap2Controller extends baseController {
  constructor(ctx) {
    super(ctx);
  }

  // for test
  async getEcho(ctx) {
    ctx.body = Object.assign(ctx.params, {time: Date.now()})
  }

  /**
   * 
   * @param {*} ctx 
   * ctx.query.repositoryId // rap2 repository id
   */
  async getOneProjectData(ctx) {
    let config = ctx.config
    let {repositoryId} = ctx.params

    if (!repositoryId) {
      ctx.body = {"code": 403, "msg": "require param [repositoryId]"}
      return
    }

    let ret = await axios({
      method: 'get',
      url: `${config.rap2.host}${config.rap2.repositoryDataPath}`, 
      params: {
        id: repositoryId
      }
    });

    //{"code":200,"msg":"OK","data":{ "data":{"id":17} } }
    ctx.body = {code: ret.status, msg: ret.statusText, data: ret.data}
  }

  /**
   * 
   * @param {*} ctx 
   * ctx.query.repositoryId // rap2 repository id
   * ctx.query.token  // yapi project token
   * ctx.query.projectId // yapi project id
   * ctx.query.randomPath // 是否需要随机路径，解决路径重复
   */
  async importYFromRap2(ctx) {

    let config = ctx.config;
    let {repositoryId, token, projectId, randomPath = false} = ctx.params
    
    let options = Object.assign(config.path, {
      randomPath: !!randomPath
    });

    let result = {have: 0, finish: 0, repeatFail: 0, otherFail: 0, cost: Date.now(), errors: []}

    if ( !repositoryId || !token || !projectId) {
      ctx.body = {"code": 403, "msg": "require param [repositoryId] [token] [projectId]"}
      return
    }

    await this.getOneProjectData(ctx);
    let data = ctx.body;

    if (data.code === 200) {
      data = data.data.data
    }else {
      ctx.body = {code: -1, msg: `request getOneProjectData error: ${data.msg}`}
      return;
    }

    for (let t = 0; t < data.modules.length; t++) {

      let md = data.modules[t]
      let {description, name} = md
    
      // 新增分类，cat.data = {_id, project_id}
      let cat = await this.createCat({desc: description, name})

      if (cat.errcode !== 0) {
        console.log('--------------')
        console.log(cat)
        result.errors.push(`create [${name}] Cat error, [${cat.errcode}] [${cat.errmsg}]`)
        // 分类创建失败，只能从下一个分类再开始
        continue;
      }

      let catId = cat.data._id

      for (let i = 0; i < md.interfaces.length; i++) {

        let ifs = md.interfaces[i]
        let path = ifs.url || options.defaultPath;

        let tempRet = convert.fixRequestPath(path, options)
        let addDesc = `迁移前url地址：[${ifs.url}]。` // url万一改错了，备份到备注里面
        if (tempRet.desc) {
          addDesc += tempRet.desc
        }
        path = tempRet.path

        //console.log(`[${md.name}], [${ifs.name}], [${ifs.url}], [${path}] [${ifs.properties.length}]`)

        ifs.description = `${addDesc}${ifs.description}`
        ifs.url = path;

        // 新增接口
        let jsonData = convert.changeInterfaceFromRap2Yapi(ifs);

        if (jsonData.req_body_other && jsonData.req_body_other.length > 1) {
          jsonData['method'] = "POST"
        }

        console.log('jsonData = ')
        console.log(JSON.stringify(jsonData))
        
        let retIfs = await this.creatInterface(Object.assign(jsonData, {
          "catid": catId
        }))

        result.have++
        if (!retIfs.errcode) {
          result.finish++
        } else{
          if (40022 === retIfs.errcode) {
            result.repeatFail++
          }else {
            result.otherFail++
          }
          result.errors.push(`[${md.name}], [${ifs.name}] [${ifs.url}] [${retIfs.errcode}] [${retIfs.errmsg}]`)
        }
      }// end interfaces
    }// end modules

    // 计算耗时
    result.cost = `${(Date.now() - result.cost)/1000}s`

    ctx.body = result;
  }

  // 新增一个分类 {desc, name}
  async createCat(data) {

    let config = this.ctx.config
    let {token, projectId} = this.ctx.params

    data = Object.assign({
      "token": token,
      "project_id": projectId,
    }, data)
  
    let ret = await axios({
      method: 'post',
      url: `${config.yapi.host}${config.yapi.addCatpath}`,
      headers: {
        contentType: 'application/x-www-form-urlencoded',
      },
      data
    });
  
    return ret.data
  }

  async creatInterface(data) {

    let config = this.ctx.config
    let {token, projectId} = this.ctx.params

    data = Object.assign( {
      "token": token,
      "project_id": projectId
    }, data);
  
   let ret = await axios({
      method: 'post',
      url: `${config.yapi.host}${config.yapi.addInterface}`,
      headers: {
        contentType: 'application/json',
      },
      data
    });
  
    return ret.data
  }

}

module.exports = importRap2Controller;
