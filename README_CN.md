# WebStack Next · Hexo 导航主题

[English](README.md)

由 [freedomgod](https://github.com/freedomgod) 继续维护的 Hexo 导航主题，fork 自 [HCLonely/hexo-theme-webstack](https://github.com/HCLonely/hexo-theme-webstack)，原始设计来自 [WebStackPage / Viggo](https://github.com/WebStackPage/WebStackPage.github.io)。

本分支更新了卡片布局、深浅色样式、卡片及搜索控件的键盘操作，并提供真实 Hexo 本地开发环境。原作者署名及许可证声明予以保留。

![主题预览](screenshot/screenshot.png)

## 环境要求

- Git、Node.js **20.19.0 或更高版本**；CI 使用 Node.js 22 和 24。
- 可选 SQLite 模式需要 **Node.js 22.13+**，推荐 Node.js 24 LTS；使用内置 `node:sqlite`，不需要安装数据库服务或编译原生依赖。
- 一个 Hexo 站点。本分支以 **Hexo 8.1.2** 开发和验证；上游旧文档中的 Hexo 4/5 等版本不属于本分支的验证范围。
- 本主题用于导航站、网址目录，没有专门的博客文章和归档布局。

## 安装本地最新开发版

以下操作在 **Hexo 站点根目录**执行，不是在主题源码目录执行。

尚无站点时，先创建站点；已有站点可跳过：

```shell
npm install -g hexo-cli
hexo init my-navigation
cd my-navigation
npm install
```

开发版已使用独立名称：包名 **`hexo-theme-webstack-next`**，Hexo 主题名 **`webstack-next`**，配置文件 **`_config.webstack-next.yml`**。它可以与原来的 `webstack` 共存，仓库地址和源码文件夹仍可保留原名。

在博客根目录执行以下命令，把路径换成你的开发目录：

```shell
npm install --install-links "D:/path/to/hexo-theme-webstack" --registry=https://registry.npmjs.org
hexo config theme webstack-next
hexo clean
hexo s
```

`--install-links` 会把本地工作区当前内容（包括未提交的修改）打包安装到 `node_modules/hexo-theme-webstack-next`，并安装模板渲染依赖。无需手工复制主题目录或另外安装 Pug，也不用卸载旧主题。不要用 `npm install hexo-theme-webstack` 获取开发版，那是上游注册表中的另一个包。

**npm 安装后，`themes/` 中不会出现新主题文件夹。** 其中仍只有旧的 `themes/webstack` 是正常的，Hexo 根据 `theme: webstack-next` 加载 `node_modules/hexo-theme-webstack-next`。名称使用短横线，不是 `webstack_next`。日常编辑站点根目录的配置和数据，不要直接修改 `node_modules` 中的文件，因为更新安装会替换它们。

安装时会自动建立 `_config.webstack-next.yml`：优先复制已有的 `source/_data/webstack.yml` 或 `_config.webstack.yml`，没有旧配置时使用通用样例；已经存在的新配置不会被覆盖。旧配置用到的缺失公共资源会从旧主题保留，使用 FA6 类名时也会保留对应字体。新主题的模板和核心 CSS/JS 保持新版内容；旧模板内直接写入的自定义功能不自动迁移。旧主题及其配置不会被修改。

`hexo config theme webstack-next` 会设置站点 `_config.yml` 中的主题，站点标题等继续留在这里：

```yaml
theme: webstack-next
title: 我的导航站
subtitle: 收集值得收藏的工具与资源
author: 你的名字
language: zh-CN
```

想切回旧版时执行 `hexo config theme webstack`，再执行 `hexo clean`、`hexo s`。原有 `source/_data/` 中每个分类的 YAML 仍可使用；整份旧配置 `source/_data/webstack.yml` 不会覆盖新主题。新主题对应的数据配置名为 `source/_data/webstack-next.yml`，建议优先使用根目录的 `_config.webstack-next.yml`。

如果 npm 禁用了安装脚本，主题仍有内置默认配置；需要编辑配置或迁移旧设置时，请手动复制样例或旧配置到 `_config.webstack-next.yml`。

### 可选：通过 Git 安装

Git 获取的是已提交的版本；需要当前本地工作区内容时使用上面的本地 npm 安装：

```shell
git clone --branch master https://github.com/freedomgod/hexo-theme-webstack.git themes/webstack-next
npm install hexo-renderer-pug hexo-util pug js-yaml --save
```

复制 `themes/webstack-next/_config.example.yml` 到站点根目录，命名为 `_config.webstack-next.yml`；也可以将旧 `_config.webstack.yml` 复制成这个新名字。设置 `theme: webstack-next` 即可。不要同时安装同名 Git 版和 npm 版：两者共存时，Hexo 会优先使用 `themes/webstack-next`。`private: true` 用于防止误发布到 npm，不影响本地安装。

## 创建首页与预览

原有 WebStack 站点如果使用 `hexo-generator-index`，可以直接保留首页生成方式：该生成器已经提供首页标记，安装并切换主题后即可运行，无需新增首页或修改索引路径。运行 `hexo s` 后打开 <http://localhost:4000>。

没有首页生成器，或明确需要独立导航页时，才新建 `source/index.html`，内容如下：

```yaml
---
layout: index
__index: true
title: 我的导航站
---
```

请保留 `__index: true`，它将此页标记为首页，使网站卡片正常渲染。如果站点安装了 `hexo-generator-index`，在站点 `_config.yml` 中给文章索引设置其他路径：

```yaml
index_generator:
  path: blog
```

纯导航站也可以卸载该生成器。不要让它与上述页面同时生成 `/index.html`。已有站点请调整现有首页，不要直接覆盖自己的文件。

```shell
hexo clean
hexo server
```

打开 <http://localhost:4000>。正式生成静态页面：

```shell
hexo generate
```

将站点的 `public/` 目录部署到 GitHub Pages 等静态托管平台。部署前设置站点的 `url`；部署在子目录时还需设置 `root`。推送主题仓库不等于发布个人站点，具体见 [Hexo 部署文档](https://hexo.io/zh-cn/docs/github-pages)。

## 添加分类与网站

编辑 `_config.webstack-next.yml`。菜单的 `config` 对应一组网站列表：

```yaml
menu:
  - name: 常用工具
    icon: far fa-star
    config: hotTools
  - name: 资源
    icon: fas fa-code
    submenu:
      - name: 开发工具
        icon: fas fa-tools
        config: devTools

hotTools:
  - name: GitHub
    url: https://github.com/
    img: /images/logos/github.png
    description: 代码托管与开源协作平台。

devTools:
  - name: Hexo
    url: https://hexo.io/
    img: /images/favicon.png
    description: 快速、简洁的静态网站框架。
```

也可以将分类的网站列表单独放到 `source/_data/hotTools.yml`，文件以 `- name:` 开头，不再套 `hotTools:`。同名站点数据文件优先于主题配置中的列表，每个分类选择一种来源即可。自己的图片放到站点的 `source/images/`，配置中使用 `/images/文件名.png`；大小写必须与实际文件一致，尤其是部署到 Linux 时。

## 用 SQLite 编辑分类与书签（可选）

默认仍使用 YAML。开启 SQLite 后，数据库成为导航分类和书签的数据源，主题样式、站点信息等设置继续由原配置管理。数据库只在本地构建时读取，发布结果仍是静态页面。

`hexo bookmarks` 是本主题通过 Hexo Console 扩展接口注册的自定义命令；`init`、`export`、`export-db` 是它的子命令，与创建站点用的内置 `hexo init` 不同。请先完成主题安装并设置 `theme: webstack-next`。Hexo 加载当前主题的脚本后，该命令就会生效，无需额外安装书签 CLI；初始化时也不要求先开启 SQLite 模式。完整分步操作、字段说明、命令表和排错表见 [README.md](README.md#edit-bookmarks-with-sqlite-optional)。

### 从当前 YAML 书签转为数据库

如果站点已经有书签，优先在 **Hexo 站点根目录**执行：

```shell
hexo bookmarks export-db
```

命令会读取当前首页分类和书签配置，包括 `_config.webstack-next.yml` 内嵌的列表和分类引用的 `source/_data/*.yml`，按页面实际优先级取值：同名数据文件优先于内嵌列表。支持 `.yml`、`.yaml`、`.json`，保留两级分类、分类图标、书签顺序、名称、链接、图片、描述和文本标签。

结果写入 `bookmark_db.path`，默认是 `.webstack/bookmarks.sqlite`。导出不会修改原 YAML、生成页面或自动开启 SQLite；即使已经写了 `enable: true` 但数据库还不存在，也能先执行这个转换。已有目标数据库会拒绝覆盖，需要另存时使用：

```shell
hexo bookmarks export-db --output .webstack/current-bookmarks.sqlite
```

再将 `bookmark_db.path` 设置为该路径并开启数据库模式。无效数据、同名多份数据文件或不能存储的额外字段会明确报错。此命令导出的是首页 YAML 导航，不会合并子页面 front matter，也不是备份当前已启用的 SQLite 数据库。导入后的列表键会改为 `sqlite_category_<id>`，原 YAML 分类文件可以保留用于备份。

### 新建样例或导入已有数据库

在 **Hexo 站点根目录**执行以下命令，创建带有示例数据的 `.webstack/bookmarks.sqlite`：

```shell
hexo bookmarks init
```

如果已有旧版 `Bookmark.db`，可改为从它初始化（与样例初始化、从 YAML 导出三种方式选一种）：

```shell
hexo bookmarks init --from "D:/path/to/Bookmark.db"
```

此命令生成一致的本地数据库副本，包含已提交到 WAL 的修改，不修改原数据库，也不覆盖已存在的目标数据库。它会在站点 `.gitignore` 中添加 `/.webstack/`，同时忽略数据库的 WAL、SHM、journal 等文件。私有库不要放进 `source/` 或 `public/`；路径检查也会拒绝指向这些目录的链接。仓库中的 [通用 SQLite 样例](examples/bookmarks.sqlite) 和 [建表 SQL](examples/bookmarks.sql) 可供参考。

在 `_config.webstack-next.yml`（旧版站点为 `source/_data/webstack-next.yml`）中添加或修改：

```yaml
bookmark_db:
  enable: true
  path: .webstack/bookmarks.sqlite
```

### 日常修改书签

- **YAML 模式：** 分类名称、图标、分组在 `_config.webstack-next.yml` 的 `menu` 中修改。分类写着 `config: 实用工具` 且存在 `source/_data/实用工具.yml` 时，在这个数据文件中修改书签；没有单独文件时，修改主题配置中的对应列表。
- **SQLite 模式：** 用 SQLite 编辑工具打开 `bookmark_db.path` 指定的数据库，编辑 `categories`、`bookmarks` 表，保存/提交后重新启动 `hexo s` 或执行 `hexo d`。不要手工修改自动生成的 `webstack.generated.yml`。

用 SQLite 数据库编辑工具打开这个本地副本，编辑分类和书签并**保存/提交事务**，然后运行：

```shell
hexo s
# 或：配置好 Hexo deploy 后发布
hexo d
```

`hexo s` 启动、`hexo g` 和 `hexo d` 都会读取数据库，在站点根目录更新 `webstack.generated.yml`，并在同一次构建中应用。启用此功能时，普通 `hexo d` 即使已有 `public/` 也会先重新生成页面；`hexo g -d` 只生成一次。服务器运行期间修改数据库后需要重启 `hexo s`；本功能不监听数据库文件。`hexo s --static` 只服务已生成文件，请先执行 `hexo g`。

`hexo bookmarks export` 的方向是 **SQLite → YAML**；新增的 `hexo bookmarks export-db` 是 **当前 YAML → SQLite**。生成的 YAML 仅包含启用的导航数据，不覆盖原主题配置、注释和其他设置；不要手工修改它。数据库不存在、格式错误、被独占锁定或分类引用错误时，构建/部署会报错，上一份生成 YAML 保持不变。`source/_data/` 中若存在与生成列表同名的数据文件，会明确提示冲突。

### 样例数据库字段

`categories` 表：

| 字段 | 用途 |
| --- | --- |
| `id` | 正整数主键；新增时可让 SQLite 自动分配。 |
| `parent_id` | 顶级分类为 `NULL`，二级分类填父分类 `id`。最多两级。 |
| `name`、`icon` | 分类名称、Font Awesome 5 图标类，例如 `fas fa-tools`。 |
| `sort_order` | 数字越小越靠前；相同时按 `id` 排序。 |
| `enabled` | `1` 显示、`0` 隐藏；隐藏父分类会隐藏整个子树。 |

`bookmarks` 表：

| 字段 | 用途 |
| --- | --- |
| `id`、`category_id` | 正整数主键、所属分类 `id`。有子分类的父分类不能直接放书签。 |
| `name`、`url` | 名称、网址；支持 HTTP(S)、FTP、mailto 和站内路径/锚点，空格应进行 URL 编码。 |
| `img`、`description` | 图标地址和描述；本地图片仍放在站点 `source/images/`。 |
| `tags` | 可选标签文本，导出时保留；当前卡片不显示或筛选标签。 |
| `sort_order`、`enabled` | 排序值和显示开关，规则同分类。 |

每个叶分类自动生成 `sqlite_category_<id>` 列表键。先删除或移动分类下的书签和子分类，再删除分类；孤立引用、循环和超出两级的分类会被拒绝，包括已隐藏的数据。

### 兼容已有 Bookmark.db

兼容原有 `category(category, key, favicon_code_fa, favicon_code_iconfont)` 和 `bookmark(bk_id, name, category, tags, url, favicon_url, description)` 表，无须改字段或重建库。分类名通过 `bookmark.category` 关联，`key` 用于生成 `sqlite_<key>` 列表键，须唯一且只包含字母、数字、下划线、短横线；图标使用 `favicon_code_fa`，`favicon_url` 对应卡片的 `img`。常见 FA6 风格前缀及工具、阅读图标会转换成主题支持的 FA5 名称；`favicon_code_iconfont` 不自动加载额外字体。

旧格式保持单级分类和数据库行顺序，保留字符串 `bk_id` 与 `tags`；不具备新版样例的层级、排序和启用字段。`ToDo`、`readlater` 等其他表保留在本地副本中，不导出到 YAML 或网站。导入后请编辑 `.webstack/` 内的副本；以后修改原数据库不会自动同步。

数据库及其临时文件不进入 `public/`，初始化命令也不会上传文件。生成的 YAML 包含准备公开的书签，可以自行备份或用于 YAML 模式。若使用云端 CI 构建，由于数据库不上传，需要另行向 CI 提供公开导航 YAML 并使用 YAML 模式；开启 SQLite 却找不到数据库时不会悄悄使用过期内容。切回 YAML 模式只需设 `enable: false`，原来的手写导航配置仍然保留。

### 自定义命令与自动更新原理

主题入口 [scripts/bookmarks.js](scripts/bookmarks.js) 加载 [lib/bookmark-hexo.cjs](lib/bookmark-hexo.cjs)，其中通过两个扩展接口完成接入：

- `hexo.extend.console.register('bookmarks', ...)`：注册 `init`（样例/已有库初始化）、`export`（SQLite 转 YAML）、`export-db`（当前 YAML 转 SQLite），这些子命令都不生成页面。
- `hexo.extend.filter.register('before_generate', ...)`：在 Hexo 每次生成页面之前，读取数据库、校验数据、写出生成 YAML，并把同一份导航对象合并进当前 `hexo.theme.config`。

正常 `hexo s` 启动会执行首次生成，因此会触发 `before_generate`。先写 YAML，再直接更新内存中的主题配置，保证这一次渲染就能使用最新书签；不是依赖 Hexo 自动重新读取根目录下的 `webstack.generated.yml`。原有 `generateBefore` 事件负责旧配置兼容，SQLite 的 filter 在它之后应用，避免被旧配置覆盖。可参照 [Hexo Console 文档](https://hexo.io/api/console.html) 和 [Filter 文档](https://hexo.io/api/filter.html#before-generate)。

```text
hexo s 启动 / hexo g
  → Hexo 加载站点与主题数据
  → generateBefore：处理旧版主题配置
  → before_generate：读取 SQLite → 校验 → 写出 YAML → 更新主题内存配置
  → 生成路由并渲染页面
```

普通 `hexo d` 可能直接部署已有的 `public/`，所以主题还在 `after_init` 中包装了原有 `generate` / `deploy` 命令：SQLite 模式下直接部署会先生成；从 `hexo g -d` 进入部署时则避免重复生成。仅使用 `deployBefore` 事件写 YAML，无法让已经生成的 HTML 自动更新。

数据库没有实时监听器。仅修改 `.webstack/` 中的数据库不会触发 Hexo 的文件监听，因此需要保存事务并重新启动 `hexo s`。`hexo bookmarks export` 也不会主动刷新正在运行的预览。`hexo s --static` 服务的是现有 `public/` 文件，即使加载过程运行了钩子也不会重写这些文件，仍应先执行 `hexo g`。

## 主题配置

完整默认值见 [_config.example.yml](_config.example.yml)。创建配置时请保留 `css` 和 `js` 资源映射。

| 配置项 | 用途 |
| --- | --- |
| `favicon`、`banner` | 站点图标、社交分享图片。 |
| `logo.expanded`、`logo.collapsed` | 侧栏展开和收起时的标志。保留旧 `logo.dark` 字段供已有配置兼容；当前关于页使用 `logo.expanded`。 |
| `flag` | 语言链接列表，包括 `name`、`icon`、`index`、`default`。这是页面链接，不会自动翻译内容；内置图标为 `flag-cn`、`flag-us`。 |
| `search` | 是否显示搜索框。 |
| `userDefinedSearchData` | 自定义搜索引擎，示例见下方。 |
| `githubCorner` | 右上角链接的 HTML，默认指向本 fork；设为 `''` 可隐藏。 |
| `menu`、`expandAll` | 侧栏分类、是否默认展开子菜单。 |
| `bookmark_db` | 可选的本地 SQLite 导航数据源，默认关闭，使用方法见上文。 |
| `since` | 自己网站的建站年份，请替换示例值。 |
| `about`、`aboutPage` | 关于页链接与内容；还需单独创建页面。 |
| `busuanzi` | 可选的第三方访问统计，默认关闭。`position` 可为 `sidebar` 或 `footer`；`$pv`、`$uv` 是计数占位符。 |
| `custom.head`、`custom.body` | 在页面头部、`</body>` 前插入可信的 HTML。 |
| `css`、`js` | 资源地址。为兼容已有配置，保留 `css.hclonely` 和 `/css/hclonely.css` 的原名称。 |

自定义搜索示例：

```yaml
userDefinedSearchData:
  custom: true
  thisSearch: https://www.baidu.com/s?wd=
  thisSearchIcon: url(https://www.baidu.com/favicon.ico)
  hotStatus: false
  data:
    - name: 百度
      img: url(https://www.baidu.com/favicon.ico)
      url: https://www.baidu.com/s?wd=
```

`img` 是图标的 CSS 值，`url` 是搜索网址前缀。开启搜索建议时会使用百度的建议服务。导航网站列表由配置维护，搜索会打开所选外部搜索引擎。

颜色、间距、圆角和阴影集中在 `source/css/hclonely.css` 的 `--ws-*` 变量中；`body.night` 定义夜间模式。可通过 `custom.head` 加载额外样式。

## 关于页与子页面

要启用默认的 `/about/` 链接，新建 `source/about/index.html`：

```yaml
---
layout: page
type: about
title: 关于本站
---
```

在 `_config.webstack-next.yml` 中编辑 `aboutPage.website` 和 `aboutPage.webmaster`，将示例姓名、主页链接、头像、描述和 HTML 改为自己的内容。如果不需要关于页，将 `about` 设置为 `{}` 即可隐藏侧栏链接。

创建 `/child/` 子页面时，新建 `source/child/index.html`：

```yaml
---
layout: page
type: child
title: 开发资源
menu:
  - name: 开发工具
    icon: fas fa-code
    config: childTools
childTools:
  - name: GitHub
    url: https://github.com/
    img: /images/logos/github.png
    description: 代码托管与开源协作平台。
---
```

子页面继承主题配置，可在页面 front matter 中覆盖。也可按页面路径加载数据：例如 `/child/` 页的 `config: childTools` 对应 `source/_data/child/childTools.yml`。可参考仓库中的[子页面示例](dev/source/child/index.html)和[关于页示例](dev/source/about/index.html)。标题字段请使用 `title`；没有 `title` 时仍兼容历史拼写 `tittle`。

## 更新与切换旧主题

将站点配置和内容保存在安装的主题目录以外。升级时对照新版示例配置补充需要的字段，不要用示例覆盖自己的配置。

本地开发后更新已安装版本，可以重新打包当前工作区，再安装打印出来的压缩包；即使版本号没变，也会刷新安装内容：

```shell
# 在主题开发目录执行：
npm pack
# 在 Hexo 博客目录执行，使用上一条命令输出的文件名：
npm install "D:/path/to/hexo-theme-webstack/hexo-theme-webstack-next-3.0.5-freedomgod.2.tgz" --registry=https://registry.npmjs.org
hexo clean
hexo s
```

已经通过 Git 安装本 fork 的用户，在站点根目录执行：

```shell
git -C themes/webstack-next pull --ff-only
npm install js-yaml --save
hexo clean
hexo generate
```

新旧主题名称独立，不必卸载原主题。本地 npm 安装会在首次安装时复制旧配置；切回旧主题仍使用原配置。Git 安装时请自行将旧配置复制成 `_config.webstack-next.yml`。原有站点信息及模板内的自定义功能需要按需检查；更新不会覆盖已经存在的新主题配置。

## 本地开发

以下命令在 **主题仓库根目录**执行：

```shell
npm ci
npm run dev
```

打开 <http://localhost:4000>、<http://localhost:4000/about/> 和 <http://localhost:4000/child/>。开发站点使用 [dev/_config.yml](dev/_config.yml)、[dev/source](dev/source) 和 `_config.example.yml`；修改配置后重新启动。主题模板和静态资源通过目录链接直接供开发站点使用。

```shell
npm run build
npm test
```

构建命令使用 Hexo 8.1.2 检查三个示例页面；测试命令用复制的主题文件与 README 首页示例构建独立站点，并检查 SQLite 初始化、旧库导入、导出校验、服务器启动和部署刷新。完整测试需要 Node.js 22.13+。`npm run bookmarks:sample` 可根据 SQL 重建通用样例数据库。生成文件保存在 `.hexo-dev/` 和 `output/`，不参与 Git 提交或打包。CI 在 Windows、Linux 及 Node.js 22、24 上运行这两项检查。

## 来源、许可与反馈

- 当前 fork 维护：[freedomgod](https://github.com/freedomgod/hexo-theme-webstack)。
- 原 Hexo 主题：[HCLonely](https://github.com/HCLonely/hexo-theme-webstack)。
- 原始 WebStack 设计：[WebStackPage / Viggo](https://github.com/WebStackPage/WebStackPage.github.io)。
- 静态网站框架：[Hexo](https://hexo.io/)。

本 fork 的维护入口是[当前仓库](https://github.com/freedomgod/hexo-theme-webstack)。维护者在 Settings → General → Features 中启用 Issues 后，可通过仓库的 Issues 标签反馈本分支的问题。项目采用 [MIT 许可证](LICENSE)，保留原始版权声明及内置第三方资源的声明。附带的 WebStack 标志是继承的示例素材，建立自己的站点时请替换。
