# 开发文档

## 本地开发

下载代码到本地

本地安装 pnpm

安装依赖 `pnpm install`

根据 `.env.example` 格式新建 `.env.local` 文件，并写入各个 key 的值

执行 `pnpm run db:push` 在数据库中生成数据表

执行 `pnpm run dev` 启动本地运行

## 发布上线

在本地构建项目 `pnpm run build`

将构建出来的结果拷贝到云服务器

```
scp -r .next public package.json pnpm-lock.yaml root@xx.xx.xx.xx:/root/zhitalk/agent-build/
```

使用 pm2 启动服务，并使用 nginx 做反向代理，绑定域名和 SSL 证书

具体参考这两节（仅参与学习的同学可见）

- https://github.com/zhitalk/wiki/issues/48
- https://github.com/zhitalk/wiki/issues/49