/**
 * 分类页面入场动画脚本
 * 为分类卡片添加优雅的渐入和滑入效果
 */
(function() {
  'use strict';

  // 检查是否在分类页面
  if (!document.querySelector('.categories-box')) {
    return;
  }

  /**
   * 为元素添加入场动画观察器
   */
  function initCategoryAnimation() {
    const categoryItems = document.querySelectorAll('.category-list-item');
    
    if (!categoryItems.length) {
      return;
    }

    // 使用 CSS 变量和类来控制动画
    const style = document.createElement('style');
    style.textContent = `
      /* 初始状态 - 隐藏 */
      .category-list-item {
        opacity: 0;
        transform: translateY(30px);
      }
      
      /* 动画激活状态 */
      .category-list-item.animated {
        opacity: 1;
        transform: translateY(0);
      }
      
      /* 为不同层级的分类项设置不同的动画延迟 */
      .categories-box > .category-list > .category-list-item {
        transition: opacity 0.6s cubic-bezier(0.22, 0.61, 0.36, 1), 
                    transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
      }
      
      .category-list-child > .category-list-item {
        transition: opacity 0.5s cubic-bezier(0.22, 0.61, 0.36, 1), 
                    transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
      }
      
      .category-list-child .category-list-child > .category-list-item {
        transition: opacity 0.4s cubic-bezier(0.22, 0.61, 0.36, 1), 
                    transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
      }
      
      /* 计数徽章的脉冲动画 */
      @keyframes pulse-badge {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }
      
      .category-list-item.animated .category-list-count {
        animation: pulse-badge 0.6s ease-out 0.3s;
      }
      
      /* 光泽扫过效果 */
      @keyframes shimmer {
        0% {
          left: -100%;
        }
        100% {
          left: 100%;
        }
      }
      
      .category-list-item.animated .category-list-count::before {
        animation: shimmer 1s ease-out 0.5s;
      }
    `;
    document.head.appendChild(style);

    // 使用 Intersection Observer API 实现滚动触发动画
    if ('IntersectionObserver' in window) {
      const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 添加一个小延迟，让动画更自然
            const item = entry.target;
            const delay = parseInt(item.getAttribute('data-animation-delay') || 0);
            
            setTimeout(() => {
              item.classList.add('animated');
            }, delay);
            
            // 动画完成后取消观察
            observer.unobserve(item);
          }
        });
      }, observerOptions);

      // 为所有分类项添加观察器并设置延迟
      categoryItems.forEach((item, index) => {
        // 顶级分类按序延迟
        const topLevelItems = document.querySelectorAll('.categories-box > .category-list > .category-list-item');
        const isTopLevel = Array.from(topLevelItems).includes(item);
        
        if (isTopLevel) {
          const topIndex = Array.from(topLevelItems).indexOf(item);
          item.setAttribute('data-animation-delay', topIndex * 100);
        } else {
          // 子分类有较小的延迟
          item.setAttribute('data-animation-delay', 50);
        }
        
        observer.observe(item);
      });
    } else {
      // 降级方案：直接添加动画类
      setTimeout(() => {
        categoryItems.forEach((item, index) => {
          setTimeout(() => {
            item.classList.add('animated');
          }, index * 80);
        });
      }, 100);
    }
  }

  /**
   * 为分类链接添加涟漪效果
   */
  function addRippleEffect() {
    const links = document.querySelectorAll('.category-list-link');
    
    links.forEach(link => {
      link.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ripple.style.cssText = `
          position: absolute;
          left: ${x}px;
          top: ${y}px;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          transform: translate(-50%, -50%);
          animation: ripple-effect 0.6s ease-out;
          pointer-events: none;
        `;
        
        // 添加涟漪动画样式（如果还没有）
        if (!document.getElementById('ripple-animation')) {
          const rippleStyle = document.createElement('style');
          rippleStyle.id = 'ripple-animation';
          rippleStyle.textContent = `
            @keyframes ripple-effect {
              to {
                width: 200px;
                height: 200px;
                opacity: 0;
              }
            }
          `;
          document.head.appendChild(rippleStyle);
        }
        
        const parent = this.parentElement;
        const parentPosition = getComputedStyle(parent).position;
        if (parentPosition === 'static') {
          parent.style.position = 'relative';
        }
        parent.appendChild(ripple);
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });
  }

  /**
   * 页面加载完成后初始化
   */
  function init() {
    // 稍微延迟以确保 DOM 完全渲染
    requestAnimationFrame(() => {
      initCategoryAnimation();
      addRippleEffect();
    });
  }

  // 根据文档状态决定何时初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

