# hexo-theme-webstack · freedomgod fork

[English](README.md)

由 [freedomgod](https://github.com/freedomgod) 继续维护的 Hexo 导航主题，fork 自 [HCLonely/hexo-theme-webstack](https://github.com/HCLonely/hexo-theme-webstack)，原始设计来自 [WebStackPage / Viggo](https://github.com/WebStackPage/WebStackPage.github.io)。

本分支更新了卡片布局、深浅色样式、卡片及搜索控件的键盘操作，并提供真实 Hexo 本地开发环境。原作者署名及许可证声明予以保留。

![主题预览](screenshot/screenshot.png)

## 环境要求

- Git、Node.js **20.19.0 或更高版本**；CI 使用 Node.js 22 和 24。
- 一个 Hexo 站点。本分支以 **Hexo 8.1.2** 开发和验证；上游旧文档中的 Hexo 4/5 等版本不属于本分支的验证范围。
- 本主题用于导航站、网址目录，没有专门的博客文章和归档布局。

## 从本仓库安装

以下操作在 **Hexo 站点根目录**执行，不是在主题源码目录执行。

尚无站点时，先创建站点；已有站点可跳过：

```shell
npm install -g hexo-cli
hexo init my-navigation
cd my-navigation
npm install
```

安装本 fork 和模板渲染依赖：

```shell
git clone --branch master https://github.com/freedomgod/hexo-theme-webstack.git themes/webstack
npm install hexo-renderer-pug pug --save
```

修改站点根目录的 `_config.yml`，替换原有 `theme` 设置，并填写自己的站点信息：

```yaml
theme: webstack
title: 我的导航站
subtitle: 收集值得收藏的工具与资源
author: 你的名字
language: zh-CN
```

将 `themes/webstack/_config.example.yml` 复制到站点根目录，命名为 `_config.webstack.yml`。

PowerShell：

```powershell
Copy-Item themes/webstack/_config.example.yml _config.webstack.yml
```

macOS / Linux：

```shell
cp themes/webstack/_config.example.yml _config.webstack.yml
```

Git 安装不会自动复制配置。`_config.webstack.yml` 和旧版的 `source/_data/webstack.yml` **只保留一个**；存在旧版数据文件时，它会替换主题配置。

**分发方式：** 本 fork 通过 GitHub 分发。`npm install hexo-theme-webstack` 安装的是 npm 注册表中的同名包，不会自动包含本仓库的修改。保留包名是为了兼容 Hexo；`private: true` 用于防止以原 npm 包名误发布。继承自上游的 npm 自动发布流程已替换为构建检查。

## 创建首页与预览

独立导航站可新建 `source/index.html`，内容如下：

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

编辑 `_config.webstack.yml`。菜单的 `config` 对应一组网站列表：

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

在 `_config.webstack.yml` 中编辑 `aboutPage.website` 和 `aboutPage.webmaster`，将示例姓名、主页链接、头像、描述和 HTML 改为自己的内容。如果不需要关于页，将 `about` 设置为 `{}` 即可隐藏侧栏链接。

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

## 更新与从上游迁移

将站点配置和内容保存在 `themes/webstack` 以外。升级时对照新版示例配置补充需要的字段，不要用示例覆盖自己的配置。

已经通过 Git 安装本 fork 的用户，在站点根目录执行：

```shell
git -C themes/webstack pull --ff-only
hexo clean
hexo generate
```

从上游 Git 仓库或 npm 包迁移时，先备份主题内的自定义修改和配置。使用过 npm 主题的用户先执行 `npm uninstall hexo-theme-webstack`；将旧主题目录备份到 `themes/webstack` 以外，再按安装步骤克隆本 fork。保留 `theme: webstack` 和原有 `_config.webstack.yml`。如果迁移旧版数据配置，仍只保留一份配置文件。自己的配置中原作者示例、站点信息及旧链接需要自行更新，主题升级不会改写用户配置。

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

构建命令使用 Hexo 8.1.2 检查三个示例页面；测试命令用复制的主题文件与 README 首页示例构建独立站点，检查配置继承、站点信息、来源署名和子目录资源路径。生成文件保存在 `.hexo-dev/` 和 `output/`，不参与 Git 提交或打包。CI 在 Windows、Linux 及 Node.js 22、24 上运行这两项检查。

## 来源、许可与反馈

- 当前 fork 维护：[freedomgod](https://github.com/freedomgod/hexo-theme-webstack)。
- 原 Hexo 主题：[HCLonely](https://github.com/HCLonely/hexo-theme-webstack)。
- 原始 WebStack 设计：[WebStackPage / Viggo](https://github.com/WebStackPage/WebStackPage.github.io)。
- 静态网站框架：[Hexo](https://hexo.io/)。

本 fork 的维护入口是[当前仓库](https://github.com/freedomgod/hexo-theme-webstack)。维护者在 Settings → General → Features 中启用 Issues 后，可通过仓库的 Issues 标签反馈本分支的问题。项目采用 [MIT 许可证](LICENSE)，保留原始版权声明及内置第三方资源的声明。附带的 WebStack 标志是继承的示例素材，建立自己的站点时请替换。
