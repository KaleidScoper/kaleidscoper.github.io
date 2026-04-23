#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Hexo博客本地调试一键启动脚本
自动构建主题并启动本地服务器
执行前要求至少在主题目录下运行过一次npm install
"""

import os
import sys
import subprocess
from pathlib import Path


def run_command(command, cwd=None, description=""):
    """执行shell命令并实时输出结果"""
    print(f"\n{'='*60}")
    print(f"📌 {description}")
    print(f"💻 执行命令: {command}")
    print(f"📂 工作目录: {cwd or os.getcwd()}")
    print(f"{'='*60}\n")
    
    try:
        process = subprocess.Popen(
            command,
            shell=True,
            cwd=cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            encoding='utf-8',
            errors='replace'
        )
        
        for line in process.stdout:
            print(line, end='')
        
        return_code = process.wait()
        
        if return_code != 0:
            print(f"\n❌ 命令执行失败，退出码: {return_code}")
            return False
        
        print(f"\n✅ {description} 完成!")
        return True
        
    except Exception as e:
        print(f"\n❌ 执行出错: {str(e)}")
        return False


def kill_port(port: int):
    """杀掉占用指定端口的进程 (Windows)"""
    try:
        result = subprocess.check_output(
            f"netstat -ano | findstr :{port}",
            shell=True, text=True, stderr=subprocess.DEVNULL
        )
        pids_killed = set()
        for line in result.strip().splitlines():
            parts = line.split()
            if parts and parts[-1].isdigit():
                pid = int(parts[-1])
                if pid != 0 and pid not in pids_killed:
                    subprocess.run(
                        f"taskkill /PID {pid} /F",
                        shell=True, stderr=subprocess.DEVNULL
                    )
                    print(f"🔪 已终止占用端口 {port} 的进程 (PID: {pid})")
                    pids_killed.add(pid)
    except subprocess.CalledProcessError:
        pass  # 端口未被占用，正常


def main():
    """主函数"""
    print("""
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║            🚀 Hexo 博客本地调试一键启动脚本 🚀               ║
║                                                              ║
║  功能：自动构建主题 → 生成静态文件 → 启动本地服务器          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    """)
    
    # 获取项目根目录
    root_dir = Path(__file__).parent.absolute()
    theme_dir = root_dir / "themes" / "ayeria"
    
    print(f"📁 项目根目录: {root_dir}")
    print(f"🎨 主题目录: {theme_dir}")
    
    # 检查目录是否存在
    if not theme_dir.exists():
        print(f"\n❌ 错误: 主题目录不存在: {theme_dir}")
        sys.exit(1)
    
    # 步骤1: 构建主题
    if not run_command(
        "npm run build",
        cwd=str(theme_dir),
        description="步骤 1/3 - 构建主题样式和脚本"
    ):
        print("\n❌ 主题构建失败，终止执行")
        sys.exit(1)
    
    # 步骤2: 生成Hexo静态文件
    if not run_command(
        "npx hexo generate",
        cwd=str(root_dir),
        description="步骤 2/3 - 生成 Hexo 静态文件"
    ):
        print("\n❌ Hexo生成失败，终止执行")
        sys.exit(1)
    
    # 步骤3: 启动本地服务器
    print(f"\n{'='*60}")
    print(f"📌 步骤 3/3 - 启动本地服务器")
    print(f"💻 执行命令: npx hexo server")
    print(f"📂 工作目录: {root_dir}")
    print(f"{'='*60}\n")

    # 清理可能残留的端口占用
    kill_port(4000)

    print("🌐 本地服务器启动中...")
    print("📝 访问地址: http://localhost:4000")
    print("⚠️  按 Ctrl+C 停止服务器\n")
    
    try:
        subprocess.run(
            "npx hexo server",
            shell=True,
            cwd=str(root_dir),
            check=True
        )
    except KeyboardInterrupt:
        print("\n\n🛑 服务器已停止")
        print("👋 感谢使用！")
    except subprocess.CalledProcessError as e:
        print(f"\n❌ 服务器启动失败: {e}")
        sys.exit(1)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n🛑 用户中断执行")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ 发生未预期的错误: {e}")
        sys.exit(1)