#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Hexo博客本地调试一键启动脚本（WSL + nvm 环境）
执行前要求至少在主题目录下运行过一次 npm install
"""

import os
import sys
import subprocess
from pathlib import Path


def setup_nvm_path():
    """将 nvm 管理的 node/npm 注入当前进程的 PATH"""
    result = subprocess.run(
        'export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && echo $PATH',
        shell=True, capture_output=True, text=True
    )
    if result.returncode == 0 and result.stdout.strip():
        os.environ["PATH"] = result.stdout.strip()
    else:
        print("❌ 无法初始化 nvm 环境，请确认已安装 nvm")
        sys.exit(1)


def run_command(command, cwd=None, description=""):
    """执行 shell 命令并实时输出结果"""
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
    """杀掉占用指定端口的进程（Linux/WSL）"""
    try:
        result = subprocess.run(
            f"lsof -ti:{port}",
            shell=True, capture_output=True, text=True
        )
        for pid in result.stdout.strip().splitlines():
            if pid.strip().isdigit():
                subprocess.run(f"kill -9 {pid.strip()}", shell=True,
                               stderr=subprocess.DEVNULL)
                print(f"🔪 已终止占用端口 {port} 的进程 (PID: {pid.strip()})")
    except Exception:
        pass


def main():
    print("""
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║            🚀 Hexo 博客本地调试一键启动脚本 🚀               ║
║                                                              ║
║  功能：自动构建主题 → 生成静态文件 → 启动本地服务器          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    """)

    setup_nvm_path()

    root_dir = Path(__file__).parent.absolute()
    theme_dir = root_dir / "themes" / "ayeria"

    print(f"📁 项目根目录: {root_dir}")
    print(f"🎨 主题目录: {theme_dir}")

    if not theme_dir.exists():
        print(f"\n❌ 错误: 主题目录不存在: {theme_dir}")
        sys.exit(1)

    if not run_command(
        "npm run build",
        cwd=str(theme_dir),
        description="步骤 1/3 - 构建主题样式和脚本"
    ):
        print("\n❌ 主题构建失败，终止执行")
        sys.exit(1)

    if not run_command(
        "npx hexo generate",
        cwd=str(root_dir),
        description="步骤 2/3 - 生成 Hexo 静态文件"
    ):
        print("\n❌ Hexo 生成失败，终止执行")
        sys.exit(1)

    print(f"\n{'='*60}")
    print(f"📌 步骤 3/3 - 启动本地服务器")
    print(f"💻 执行命令: npx hexo server --host 0.0.0.0")
    print(f"📂 工作目录: {root_dir}")
    print(f"{'='*60}\n")

    kill_port(4000)

    print("🌐 本地服务器启动中...")
    print("📝 访问地址: http://localhost:4000")
    print("⚠️  按 Ctrl+C 停止服务器\n")

    try:
        subprocess.run(
            "npx hexo server --host 0.0.0.0",
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
