-- Rebuild the distributable sample with: npm run bookmarks:sample
PRAGMA foreign_keys = ON;
PRAGMA user_version = 1;

CREATE TABLE categories (
  id INTEGER PRIMARY KEY CHECK (id > 0),
  parent_id INTEGER REFERENCES categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  icon TEXT NOT NULL DEFAULT 'fas fa-folder',
  sort_order INTEGER NOT NULL DEFAULT 0,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
  CHECK (parent_id IS NULL OR parent_id != id)
);

CREATE TABLE bookmarks (
  id INTEGER PRIMARY KEY CHECK (id > 0),
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  url TEXT NOT NULL CHECK (length(trim(url)) > 0),
  img TEXT NOT NULL DEFAULT '/images/favicon.png',
  description TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1))
);

CREATE INDEX categories_parent_order ON categories(parent_id, sort_order, id);
CREATE INDEX bookmarks_category_order ON bookmarks(category_id, sort_order, id);

INSERT INTO categories (id, parent_id, name, icon, sort_order) VALUES
  (1, NULL, '常用工具', 'far fa-star', 10),
  (2, NULL, '开发资源', 'fas fa-code', 20),
  (3, 2, '开发工具', 'fas fa-tools', 10),
  (4, 2, '主题项目', 'fas fa-book', 20);

INSERT INTO bookmarks (id, category_id, name, url, img, description, sort_order) VALUES
  (1, 1, 'GitHub', 'https://github.com/', '/images/logos/github.png', '代码托管与开源协作平台。', 10),
  (2, 1, 'Hexo', 'https://hexo.io/', '/images/favicon.png', '快速、简洁的静态网站框架。', 20),
  (3, 3, 'Node.js', 'https://nodejs.org/', '/images/favicon.png', 'JavaScript 运行环境。', 10),
  (4, 3, 'Hexo 文档', 'https://hexo.io/zh-cn/docs/', '/images/favicon.png', '站点配置、内容管理与部署指南。', 20),
  (5, 4, 'WebStack · freedomgod', 'https://github.com/freedomgod/hexo-theme-webstack-next', '/images/logos/github.png', '当前 fork 的源码、安装说明与问题反馈。', 10);
