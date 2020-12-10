# 用途
迁移rap2数据到yapi，访问两边的接口方式实现

# 用法

- 1，启动服务
```
npm install
node server/app.js
```

- 2，访问这个服务的接口，实现迁移
`http://127.0.0.1:3000/api/rap2/importy-from-rap2?repositoryId=${xxx}&projectId=${xxx}&randomPath=${xxx}&token=${xxx}`
```
参数说明：
repositoryId: rap2的仓库id
projectId: yapi新建一个项目后的项目id（需要新建一个项目）
token: yapi项目的open api访问的token（`设置` -> `token配置`）
randomPath: 可选，用于处理原来rap2仓库里面存着重复路径的情况，作用就是在路径后面加个随机query
```


# 解决rap2的open api不能访问
需要修改源代码，使得api可以访问。这里粗暴的使用去掉鉴权的方式，建议只在内网下操作。
路径：/app/routes/utils/access.js (需要进入docker容器)
```
const inTestMode = process.env.TEST_MODE === 'true';
class AccessUtils {
    static async canUserAccess(accessType, curUserId, entityId) {
+        return true; // no auth!!!
        if (inTestMode) {
            return true;
        }                                             
        if (accessType === ACCESS_TYPE.ORGANIZATION) {                                         
            return await organization_1.default.canUserAccessOrganization(curUserId, entityId);
        } 
```