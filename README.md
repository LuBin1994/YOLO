# YOLO APPAREL PTE. LTD. — 离岸官网系统

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

> **业务表在 `yolo` schema，不在 `public`**（2026-11-06 起）。
> 建表前后有两件事必须做，漏了整站查询都会失败，见第 5 步。

1. 在 [supabase.com](https://supabase.com) 创建项目，进入 **SQL Editor**。
2. 依次执行：
   - 全新项目：`supabase/schema.sql` — 建 `yolo` schema、表、RLS 策略、触发器、Storage 存储桶
   - **已有数据的项目**：`supabase/migrate-to-yolo.sql` — 把 `public` 里的表原地搬到 `yolo`（保留数据）
   - **已有数据的项目**：`supabase/categories.sql` — 建分类表并灌入 13 个基准分类，给 `products.category` 补外键
     （全新项目跑过 `schema.sql` 就自带了分类表与基准数据，不必再跑）
   - **已有数据的项目**：`supabase/storage-yolo.sql` — 把 Storage 桶从 `media` 换成 `yolo`
   - **已有数据的项目**：`supabase/add-mood-image.sql` — 给 `products` 加 `mood_image` 氛围图列
     （全新项目跑 `schema.sql` 就自带，不必再跑）
3. **导入商品数据**（可选，全新项目默认产品表为空）：
   `scripts/import-catalog.mjs`（详见「媒体文件规范」）。
   **不要再找 `seed.sql` / `seed-products.sql`** —— 本地模拟数据已删除，
   那两份脚本写的是失效的本地图片路径，误跑会把库里的 Storage URL 覆盖掉。
4. **创建后台管理员账号**（后台登录必须，两种方式任选）：
   - 方式 A（推荐）：在 **Authentication → Users** 中手动 Invite/创建用户，记下其 UUID；
   - 方式 B：Supabase **Authentication → Providers → Email** 启用后，用邮箱注册，然后执行：
     ```sql
     insert into yolo.admins (id, email, display_name, role)
     values (
       (select id from auth.users where email = 'admin@yourcompany.com'),
       'admin@yourcompany.com',
       'Admin',
       'admin'
     );
     ```
   - 完成后用该账号在 `/admin/login` 登录即可。
5. **Storage**：`schema.sql` 已自动创建公开存储桶 **`yolo`**（10MB 上限，jpeg/png/webp/avif）。目录约定：`yolo/products/<slug>/`。
   **已有项目**跑一次 `supabase/storage-yolo.sql`（从旧的 `media` 桶改名过来；旧桶里如果有东西只提示、不删）。
6. **暴露 schema（必做）**：**Project Settings → API → Exposed schemas** 加上 `yolo`。
   这一步不在 SQL 里，改的是 PostgREST 配置。默认只暴露 `public`、`graphql_public`，
   不加的话所有查询返回 `PGRST106: The schema must be one of the following: public, graphql_public`。

## 环境变量

| 变量 | 说明 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL（公开） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon 公钥（公开，安全由 RLS 保障） |

> Supabase Dashboard → Authentication → URL Configuration：
> - Site URL：`https://<your-domain>`
> - Redirect URLs：`http://localhost:3000/**`、`https://<your-domain>/**`

## 数据库结构

所有表位于 **`yolo` schema**（`src/lib/supabase/config.ts` 的 `DB_SCHEMA` 是唯一运行时出口，
`src/lib/supabase/types.ts` 的 `Database` 键必须与之字面量一致）。

| 表 | 用途 | RLS |
|---|---|---|
| `yolo.products` | 产品（标题/描述/图片数组/分类/材质/MOQ/价格区间/`mood_image` 氛围图） | 公开读，管理员写 |
| `yolo.categories` | 产品分类（树状多级：`parent_id` 自引用；`name_zh` 后台显示、`name_en` 前台显示；`sort_order` 同级排序） | 公开读，管理员写 |
| `yolo.inquiries` | 询盘（姓名/邮箱/电话/留言/状态） | 匿名可插入，管理员读写 |
| `yolo.admins` | 后台管理员（关联 `auth.users`） | 仅管理员读 |

> **分类为什么单独建表**：之前分类是代码里写死的两级数组，后台表单又另写了一套
> `["apparel","knit",…]`，两边对不上（后台选"服装"、前台按 `kids-jacket` 筛，筛不出东西）。
> 现在唯一来源是 `yolo.categories`：后台 `/admin/categories` 维护，前台只读英文名。
> `products.category` 存分类的 **slug**，外键指到本表（`on update cascade`，改 slug 自动带到产品；
> `on delete restrict`，还有产品/子分类时删不掉）。商品可以挂在**任意一级**，
> 前台筛选按祖先链判断（`src/lib/categories.ts` 的 `isUnder`），不靠 slug 前缀猜层级。
> 筛选 UI 用 `path: string[]` 驱动，`buildFilterRows()` 按选中节点动态往下展开，
> **后台建到几级就出几行**，不预设只有两级；筛选后自动把结果区顶回导航下沿。

> 为什么不用 `public`：`public` 是所有 Supabase 项目共用的默认 schema，暴露面靠"谁能连上"
> 而不是白名单。换成自建 schema 后，只有写在 Exposed schemas 里的才对外可见。
> 代价是每个客户端都必须显式 `db: { schema: "yolo" }`，且新建表要在 `yolo` 里授权——
> `public` 那套默认权限不覆盖自建 schema，`schema.sql` 里已用 `grant` + `alter default privileges` 补齐。

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
│  │  ├─ (dashboard)       # 数据看板 = (protected)/page.tsx
│  │  ├─ products/         # 产品 CRUD
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

### 工厂页的中国地图（`src/lib/china-map.ts`）

工厂页「Five provinces」区块的那张地图是**编译期内联 SVG**，不是地图 SDK：

- 路径由 `.workbuddy/artifacts/china-network/gen-map.mjs` 从阿里云 DataV.GeoAtlas 的
  `100000_full.json` 投影、简化后生成。**要改地图就重跑脚本，不要手改 `china-map.ts`。**
- 数据含 34 个省级要素（台湾省、香港、澳门都在）和一条南海诸岛九段线要素，
  九段线单独渲染成右下角标 —— 这是国家标准地图的常规画法。**不要删角标，不要删台湾省。**
- 运行时零请求、零依赖，服务端就渲出 `<path>`，不靠 JS 水合再发地图请求
  （客户要求站点部署在海外，不能挂境内地图 CDN 和 key）。
- 高亮省份由 `factory/page.tsx` 的 `CHINA_NODES` 按 `adcode` 指定；
  **写错 adcode 不会报错，只是那个省不高亮**。
- 只有客户自己提供带审图号的标准地图成品、或改用天地图静态图 API（客户自己的 key）时，
  才需要换掉这套实现。

## 媒体文件规范

- **所有图片**（前台展示、后台上传）必须走 Supabase Storage：上传用 `src/lib/supabase/storage.ts`，读取用公开 URL。
- **严禁**依赖本地文件系统存储图片。
- 产品目录（89 条 / 130 张图）已于 2026-11-06 导入：图片在 `yolo` 桶的 `products/<slug>/NN.jpg`，
  记录里的 `images` / `cover_image` 存的是 Storage 公开 URL。
  **本地模拟数据 `src/lib/products-data.ts`、`public/media/products/**` 及旧种子脚本已删除**，
  数据库是唯一数据源；**分类也只从 `yolo.categories` 读**，静态兜底已删除，
  后台新建的一级分类（还没上产品）也会立刻出现在前台筛选器里，计数显示 0。
  产品页首屏图 `hero-showroom.jpg` 不是商品图，已单独移到 `public/media/site/`。
  `scripts/import-catalog.mjs --sql` 仍可离线生成导入 SQL；默认模式需要先把 130 张图从桶里下载回本地。
- 其它板块（factory / rnd / login 等）仍有 Unsplash 占位图，上线前替换。

### 氛围图（首页滚动图组专用）

后台商品表单里单独的「氛围图」字段上传到 `yolo` 桶 `products/<slug>/mood/`，存进
`yolo.products.mood_image`（**独立一列，不进 `images` 数组**）。
首页跑马灯取所有 `published = true` 且有氛围图的商品，每个商品出一张格子、整格链到
`/products/[slug]`；**商品详情页不显示氛围图**（详情页只读 `images` / `cover_image`）。

| 氛围图商品数 | 首页表现 |
|---|---|
| 0–5 | 回退到 `HOME_MARQUEE` 静态素材（纯展示、不可点），图带不会空 |
| 6–11 | 1 行氛围图，全部可点 |
| ≥12 | 2 行（各 6+ 张），时长 72s / 88s 错峰 |

> 阈值来自 `site-data.ts` 的 `MOOD_TILES_PER_ROW = 6`：不足 6 张会被重复铺满视口，
> 只有 1~2 张时整条图墙会变成同一张图刷屏。行数随后台上传量自动增长，不用改代码。
> 未执行 `add-mood-image.sql` 时，首页读库失败会静默回退静态素材，
> 后台保存商品也会自动跳过该字段并打日志，不会整块坏掉。

### 面料特写（与氛围图混排）

`public/media/home/marquee/fabric-01..08.jpg` 是 8 张面料/工艺实拍（皮革、格纹羊毛、
涂层防泼水、针织），**不是商品图**，整格链到 `/rnd#fabric`（R&D 页的 Fabric development）。

它们由 `site-data.ts` 的 `FABRIC_TILES` + `withFabricTiles()` 插进图带，规则是：

- **插在选完数据源之后**，所以氛围图队列和 `HOME_MARQUEE` 兜底两条路都会带上它们。
  写进 `HOME_MARQUEE` 是不行的 —— 客户一传够 6 张氛围图，静态那份就被整体替换，
  8 张面料图会跟着消失。
- **按位置均匀铺开，不追加到末尾**：目标位是 `(k+0.5)/8`，落位后剩余槽位按原顺序填空。
  纯计算、不用随机数（随机会让 SSR 与客户端算出不同顺序，直接 hydration 报错）。
- **时长按格子数等比缩放**（72s→89s / 88s→109s），否则加图后滚动速度会明显变快。
- 改图或加图：重跑 `.workbuddy/artifacts/fabric-tiles/compress.mjs`（短边 760 / q82 / 白底拍平），
  再改 `FABRIC_TILES` 的条目即可。校验脚本同目录 `test-merge.mjs`（跑 `withFabricTiles` 的
  纯函数测试，覆盖氛围图 1 行 / 2 行 / 静态兜底三种形态）。

> R&D 页 `#fabric` 区块带 `scroll-mt-16 md:scroll-mt-20`，跳过来时标题不会被 fixed 导航压住。

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

## 安全配置

### 已内置（代码层）

| 项 | 位置 |
|---|---|
| 安全响应头（HSTS / nosniff / Referrer-Policy / X-Frame-Options / Permissions-Policy / CSP） | `vercel.json` |
| 关闭 `X-Powered-By` | `next.config.ts` → `poweredByHeader: false` |
| 询盘接口限流（单 IP 60 秒 5 次，进程级） | `src/lib/rate-limit.ts` + `/api/inquiries` |
| 蜜罐字段 + 最小填写耗时识别机器人 | `ContactForm.tsx` + `/api/inquiries` |
| 后台登录连续失败指数退避（第 3 次起 15s→30s→60s→120s） | `src/app/admin/login/page.tsx` |
| RLS + `is_admin()` 安全定义者函数、写操作二次鉴权 | `supabase/schema.sql`、`src/lib/admin.ts` |

> 注意：内存限流是**单 Serverless 实例级**的，多实例并发下配额会被放大。
> 抗分布式刷量需配合 Vercel WAF 自定义规则或边缘限流。

### 需在 Supabase 后台手动开启（代码无法代劳）

1. **Authentication → Sign In / Providers → Email**
   - 开启 **CAPTCHA**（hCaptcha 或 Cloudflare Turnstile）— 防爆破
   - 开启 **Leaked Password Protection** — 拒绝已泄露密码
   - 关闭 **Allow new users to sign up** — 管理员账号必须手动创建
2. **Authentication → URL Configuration**：Site URL 与 Redirect URLs 只填生产域名（防开放重定向截获 token）
3. **Authentication → Policies**：缩短 JWT 有效期（如 1 小时）、开启 **Refresh Token Rotation**
4. **管理员账号**：开启 MFA（TOTP）
5. **Project Settings → Authentication**：生产环境配置自定义 SMTP（默认 SMTP 有严格限流）

## 生产检查清单

- [ ] 替换剩余占位图（factory / rnd / login 的 Unsplash）为 Storage 图片
- [ ] 收紧 Storage 桶 `yolo` 的 `allowed_mime_types`（产品图导完后再动）
- [ ] 为 `admins` 表更换默认角色权限
- [ ] 配置自定义域名与邮件白名单
- [ ] 环境变量只在 Vercel 配置，`SMTP_PASS` / `VERCEL_TOKEN` 定期轮换
- [ ] 为 Preview 部署开启 Vercel Deployment Protection（避免未上线版本被搜到）
- [ ] 收窄 `next.config.ts` 的 `images.remotePatterns` 到自己的 Supabase 项目域名，删除 Unsplash
- [ ] 配置数据库备份策略（免费版无 PITR）
- [ ] 补操作审计日志与错误监控
