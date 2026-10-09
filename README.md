# wenxuhuan.github.io

个人主页。极简、单屏、居中排版。

## 结构

```
index.html           单页名片
assets/css/main.css  样式
assets/js/vi.js      入场动画 + 主题切换
.nojekyll            关闭 GitHub Pages 的 Jekyll 处理
```

## 本地预览

```bash
python -m http.server 8000
# 打开 http://localhost:8000
```

## 修改

内容都在 `index.html` 里，直接改文字即可：

- 名字 → `<h1>`
- 引文与出处 → `.quote-content` / `.quote-author`
- 外链 → `.links` 里的 `<a>`
- 所在地 → `.location-text`

## 说明

- 深浅色默认跟随系统，也可点右上角按钮手动切换（记在 localStorage）。
