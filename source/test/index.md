---
title: 视差滚动效果演示
layout: page
---

{% raw %}

<div class="parallax-demo">
  <div class="demo-section">
    <h1>视差滚动效果演示</h1>
    <p>滚动页面观察背景图片的变化效果</p>
  </div>

  <div class="parallax-container">
    <div class="parallax-item" style="--bg:url('img/untitled6.png')">
      <div class="content">
        <h2>卡片 1</h2>
        <p>这是第一张卡片，背景图片固定，滚动时会产生视差效果</p>
      </div>
    </div>

    <div class="parallax-item" style="--bg:url('img/untitled7.png')">
      <div class="content">
        <h2>卡片 2</h2>
        <p>这是第二张卡片，使用不同的背景图片</p>
      </div>
    </div>

    <div class="parallax-item" style="--bg:url('img/untitled6.png')">
      <div class="content">
        <h2>卡片 3</h2>
        <p>重复使用第一张图片，观察滚动时的视觉效果</p>
      </div>
    </div>

    <div class="parallax-item" style="--bg:url('img/untitled7.png')">
      <div class="content">
        <h2>卡片 4</h2>
        <p>继续使用第二张图片，体验背景切换的错觉</p>
      </div>
    </div>

    <div class="parallax-item" style="--bg:url('img/untitled6.png')">
      <div class="content">
        <h2>卡片 5</h2>
        <p>最后一张卡片，完成循环</p>
      </div>
    </div>
  </div>

  <div class="demo-section">
    <h2>效果说明</h2>
    <ul>
      <li><strong>背景固定：</strong>使用 <code>background-attachment: fixed</code></li>
      <li><strong>视差效果：</strong>背景相对于视口固定，内容跟随滚动</li>
      <li><strong>视觉错觉：</strong>滚动时背景图片看起来在"切换"</li>
      <li><strong>毛玻璃效果：</strong>使用 <code>backdrop-filter: blur()</code></li>
    </ul>
  </div>
</div>

<style>
.parallax-demo {
  min-height: 200vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.demo-section {
  padding: 60px 20px;
  text-align: center;
  color: white;
}

.demo-section h1 {
  font-size: 3rem;
  margin-bottom: 20px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.demo-section h2 {
  font-size: 2rem;
  margin-bottom: 20px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.demo-section p {
  font-size: 1.2rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

.demo-section ul {
  text-align: left;
  max-width: 600px;
  margin: 0 auto;
  font-size: 1.1rem;
}

.demo-section li {
  margin-bottom: 10px;
  opacity: 0.9;
}

.demo-section code {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.parallax-container {
  display: flex;
  flex-direction: column;
  gap: 100px;
  padding: 50px 20px;
}

.parallax-item {
  height: 400px;
  border-radius: 20px;
  overflow: hidden;
  background: var(--bg) center/cover;
  background-attachment: fixed; /* 关键属性：固定背景 */
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
}

.parallax-item:hover {
  transform: translateY(-10px);
}

.parallax-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px); /* 毛玻璃效果 */
  z-index: 1;
}

.content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  padding: 40px;
}

.content h2 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7);
}

.content p {
  font-size: 1.2rem;
  opacity: 0.9;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
  max-width: 500px;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .demo-section h1 {
    font-size: 2rem;
  }
  
  .demo-section h2 {
    font-size: 1.5rem;
  }
  
  .parallax-item {
    height: 300px;
  }
  
  .content h2 {
    font-size: 2rem;
  }
  
  .content p {
    font-size: 1rem;
  }
}

/* 滚动指示器 */
.scroll-indicator {
  position: fixed;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  z-index: 1000;
  color: white;
  font-size: 14px;
  opacity: 0.7;
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

/* 平滑滚动 */
html {
  scroll-behavior: smooth;
}
</style>

<div class="scroll-indicator">
  滚动查看效果
</div>

{% endraw %}
