@echo off
REM 确保命令执行出错时停止执行
setlocal EnableDelayedExpansion
if errorlevel 1 exit /b %errorlevel%

REM 生成静态文件
call npm run build
if errorlevel 1 exit /b %errorlevel%

REM 进入生成的文件夹
cd out

REM 创建 .nojekyll 文件以避免 GitHub Pages 忽略下划线开头的文件
type nul > .nojekyll

REM 初始化git并推送
git init
git add -A
git commit -m "deploy"
git branch -M main
git remote add origin https://github.com/2333Ge/persona-tools-h5.git
git push -u -f origin main

REM 返回上级目录
cd ..