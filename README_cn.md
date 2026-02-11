# obsidian-calendar-plugin

本仓库为 [liamcain/obsidian-calendar-plugin](https://github.com/liamcain/obsidian-calendar-plugin) 的 React 重写版：为 Obsidian 提供简单的日历视图。

重构工作主要在 [Cursor](https://cursor.com) 中完成。

[English](README.md)

![screenshot-full](images/screenshot-full.png)

## 安装

1. 打开本项目的 [Releases](releases) 页面。
2. 在最新版本的附件中下载 `calendar-react.zip`。
3. 解压后将 `calendar-react` 文件夹放入仓库的插件目录：  
   `<仓库路径>/.obsidian/plugins/`
4. 在 Obsidian 中启用 **Calendar (React)**：设置 → 社区插件 → 打开该插件。

## 新功能

- **快捷切换年月** — 点击日历标题中的月份/年份（如「2026 年 2 月」）可打开选择器：选择年份与月份，或跳转到 **今天**。

![Day chooser](images/day-chooser.png)

- **性能优化** — 日历格子的元数据会缓存，避免重复拉取；文件变更触发的刷新做了防抖；`DayCell` / `WeekNumCell` 使用 memo；当前文件未变化时会跳过多余的 store 更新。

## 开发（React + Vite + Bun）

- 安装依赖：`bun install`
- 构建：`bun run build`

### 热重载

1. 可创建 `.env` 文件并设置构建输出目录（如 `OUT_DIR=../TestPlugins/.obsidian/plugins/calendar-react`）。
2. 在 Obsidian 中安装 [hot-reload](https://github.com/pjeby/hot-reload) 插件。
3. 执行 `bun run build`（或自行配置 watch 模式）。hot-reload 会监听插件目录中构建产物的变化并自动重载。
