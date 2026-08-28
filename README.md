# Meridian Apparel Group — 离岸官网系统

面向海外客户的服装外贸集团官网系统：**独立前台展示站 + 独立后台管理系统**，部署于 Vercel Serverless，数据与鉴权由 Supabase 承载。

## 技术栈

| 层 | 选型 |
|---|---|
| 前端 | Next.js 16 (App Router) + TypeScript + Tailwind CSS v4，SSR |
| 后端/数据库 | Supabase（PostgreSQL + Auth + Storage） |
| 数据统计 | Vercel Web Analytics（`@vercel/analytics`，隐私友好） |
| 部署 | Vercel（Serverless），本地开发直连 Supabase 云端测试库 |

## 快速开始

```bash
npm install
cp .env.local.example .env.local   # 填入 Supabase 项目凭据
npm run dev                        # http://localhost:3000
```

本地调试**不需要**任何数据库容器，前端通过环境变量直连 Supabase 云端测试库。

## Supabase 初始化（一次性）

1. 在 [supabase.com](https://supabase.com) 创建项目，进入 **SQL Editor**。
2. 依次执行：
   - `supabase/schema.sql` — 建表、RLS 策略、触发器、Storage 存储桶
   - `supabase/seed.sql` — 开发占位数据（示例产品 / 页面内容）
3. **创建后台管理员账号**（后台登录必须，两种方式任选）：
   - 方式 A（推荐）：在 **Authentication → Users** 中手动 Invite/创建用户，记下其 UUID；
   - 方式 B：Supabase **Authentication → Providers → Email** 启用后，用邮箱注册，然后执行：
     ```sql
     insert into public.admins (id, email, display_name, role)
     values (
       (select id from auth.users where email = 'admin@yourcompany.com'),
       'admin@yourcompany.com',
       'Admin',
       'admin'
     );
     ```
   - 完成后用该账号在 `/admin/login` 登录即可。
4. **Storage**：`schema.sql` 已自动创建公开存储桶 `media`（10MB 上限，jpeg/png/webp/avif）。目录约定：`media/products/<slug>/`、`media/pages/<slug>/`。

## 环境变量

| 变量 | 说明 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL（公开） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon 公钥（公开，安全由 RLS 保障） |

> Supabase Dashboard → Authentication → URL Configuration：
> - Site URL：`https://<your-domain>`
> - Redirect URLs：`http://localhost:3000/**`、`https://<your-domain>/**`

## 数据库结构

| 表 | 用途 | RLS |
|---|---|---|
| `products` | 产品（标题/描述/图片数组/分类/材质/MOQ/价格区间） | 公开读，管理员写 |
| `pages` | 通用页面内容（工厂/绿色理念/社会责任） | 公开读，管理员写 |
| `inquiries` | 询盘（姓名/邮箱/电话/留言/状态） | 匿名可插入，管理员读写 |
| `admins` | 后台管理员（关联 `auth.users`） | 仅管理员读 |

### pages.sections 富文本结构

```jsonc
[
  { "type": "heading",   "content": "Section Title" },
  { "type": "paragraph", "content": "Body text..." },
  { "type": "image",     "content": "https://...", "caption": "可选" },
  { "type": "gallery",   "content": ["https://...", "https://..."] }
]
```

## 目录结构

```
src/
├─ app/
│  ├─ (site)/              # 前台站点
│  │  ├─ page.tsx          # 首页
│  │  ├─ products/         # 产品列表/详情
│  │  ├─ factory/          # 工厂介绍
│  │  ├─ sustainability/   # 绿色理念
│  │  ├─ responsibility/   # 社会责任
│  │  └─ contact/          # 联系我们
│  ├─ admin/               # 后台管理（Auth 守卫）
│  │  ├─ login/            # 登录页
│  │  ├─ dashboard/        # 数据看板
│  │  ├─ products/         # 产品 CRUD
│  │  ├─ pages/            # 内容 CRUD
│  │  └─ inquiries/        # 询盘管理
│  ├─ layout.tsx           # 根布局（Inter 字体 + Analytics）
│  └─ globals.css          # Tailwind v4 设计系统
├─ components/             # 通用组件
├─ lib/
│  ├─ supabase/
│  │  ├─ client.ts         # 浏览器端客户端
│  │  ├─ server.ts         # 服务端客户端（SSR）
│  │  ├─ middleware.ts     # 会话刷新
│  │  ├─ storage.ts        # Storage 上传/删除工具
│  │  └─ types.ts          # 数据库类型
│  └─ utils.ts
└─ middleware.ts           # 全局会话刷新
```

## 媒体文件规范

- **所有图片**（前台展示、后台上传）必须走 Supabase Storage：上传用 `src/lib/supabase/storage.ts`，读取用公开 URL。
- **严禁**依赖本地文件系统存储图片。
- 开发阶段占位图使用 Unsplash 高质量服装/工厂图片，上线前替换为 Storage URL。

## Vercel 部署

1. 将仓库推送到 GitHub/GitLab，在 Vercel 导入项目（框架自动识别 Next.js）。
2. 在 **Settings → Environment Variables** 配置两个环境变量（同上表，所有环境勾选）。
3. 部署命令与输出目录使用默认值（`npm run build` / 自动）。
4. `vercel.json` 已内置静态资源缓存策略与区域配置（`hkg1` 亚太边缘，可按目标市场调整）。

## 数据统计

- 前台通过根布局中的 `<Analytics />`（Vercel Web Analytics）自动采集 UV/PV/地域/设备。
- 后台 `/admin` 数据看板通过 Vercel Web Analytics REST API（`api.vercel.com/v1/query/web-analytics`）读取同源数据，展示 PV/UV、每日趋势、地域与设备占比。
- **启用看板两步**：
  1. Vercel 项目 → **Analytics** → **Enable Web Analytics**（有流量后开始采集）；
  2. 配置环境变量 `VERCEL_TOKEN`（Vercel Dashboard → Settings → Tokens → Create）。`VERCEL_PROJECT_ID` / `VERCEL_TEAM_ID` 部署时自动注入，无需配置。
  3. 未配置 token 时看板显示配置引导，不影响前台。
- 隐私友好：无 Cookie、不跨站追踪。

## 生产检查清单

- [ ] 替换占位图为 Storage 图片
- [ ] 收紧 Storage bucket 的 `allowed_mime_types`
- [ ] 为 `admins` 表更换默认角色权限
- [ ] 配置自定义域名与邮件白名单
