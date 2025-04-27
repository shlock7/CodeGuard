# AI Code Review 项目

这是一个基于人工智能的代码审查系统，包含前端和后端两个主要部分。

## 项目结构

### 前端 (AI-Code-Review-Frontend)
- 基于 Next.js 14 构建
- 使用 TypeScript 开发
- 主要依赖：
  - React 18
  - @google/generative-ai
  - @monaco-editor/react (代码编辑器)
  - TailwindCSS (样式框架)
  - 其他工具库：axios, file-saver, react-markdown 等

### 后端 (AI-Code-Review-Backend)
- 基于 Node.js 和 Express 构建
- 主要功能模块：
  - routes/: API 路由
  - controllers/: 控制器逻辑
  - middleware/: 中间件
  - utils/: 工具函数
- 主要依赖：
  - @google/generative-ai
  - express
  - cors
  - express-rate-limit
  - joi (数据验证)

## 技术栈

### 前端
- 框架：Next.js 14
- 语言：TypeScript
- UI：TailwindCSS
- 代码编辑器：Monaco Editor
- 状态管理：React Hooks
- 网络请求：Axios

### 后端
- 运行时：Node.js
- 框架：Express
- 验证：Joi
- 安全：express-rate-limit
- AI 集成：Google Generative AI

## 项目特点
1. 现代化的前端界面
2. 实时代码编辑和预览
3. AI 驱动的代码审查
4. 安全的 API 设计
5. 类型安全的开发体验

## 开发环境
- Node.js 环境
- TypeScript 支持
- 开发服务器支持热重载 


## 修改记录：
