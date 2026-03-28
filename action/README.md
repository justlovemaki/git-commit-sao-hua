# Git Commit 骚话生成器 Action

在 CI/CD 中自动生成骚气满满的 commit message。

## 使用方法

```yaml
name: Generate Saohua Commit Message

on:
  workflow_dispatch:
    inputs:
      commit_type:
        description: 'Commit 类型'
        required: false
        default: ''
      style:
        description: '骚话风格 (normal/professional/casual/poetic/meme)'
        required: false
        default: ''
      language:
        description: '语言 (zh/en/ja)'
        required: false
        default: 'zh'

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Generate Saohua Commit Message
        uses: ./
        id: saohua
        with:
          type: ${{ github.event.inputs.commit_type }}
          style: ${{ github.event.inputs.style }}
          language: ${{ github.event.inputs.language }}
          commit-message: ${{ github.event.inputs.commit_message }}

      - name: Show Result
        run: |
          echo "Commit Message: ${{ steps.saohua.outputs.commit-message }}"
          echo "Type: ${{ steps.saohua.outputs.type }}"
          echo "Style: ${{ steps.saohua.outputs.style }}"
```

## 输入参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `type` | Commit 类型 (feat/fix/docs/style/refactor/test/chore/perf/ci/build/revert/hotfix) | 自动检测 |
| `style` | 骚话风格 (normal/professional/casual/poetic/meme) | random |
| `language` | 语言 (zh/en/ja) | zh |
| `commit-message` | 传统 commit message，用于智能检测类型 | - |

## 输出

| 输出 | 说明 |
|------|------|
| `commit-message` | 生成的骚话 commit message |
| `type` | 实际使用的 commit 类型 |
| `style` | 实际使用的骚话风格 |
| `language` | 实际使用的语言 |

## 骚话风格

- **normal** (情话模式): 甜蜜温馨的告白
- **professional** (佛系模式): 淡定从容的态度
- **casual** (骚话模式): 轻松幽默的调侃
- **poetic** (中二模式): 热血沸腾的宣言
- **meme** (扎心模式): 扎心现实的自嘲

## 示例输出

```
feat: 添加新功能

这个功能，比我还会撩
```

```
fix: 修复bug

bug 修好了，你也该走了
```

## 构建

```bash
cd action
npm install
npm run build
```

## License

MIT
