// 随机句子功能
(function() {
    // 句子库
    const sentences = [
        "生活就像一盒巧克力，你永远不知道下一颗是什么味道。",
        "人生没有彩排，每一天都是现场直播。",
        "时间是最好的老师，但遗憾的是，它杀死了所有的学生。",
        "成功不是偶然的，而是必然的。",
        "每一个优秀的人，都有一段沉默的时光。",
        "人生就像一场旅行，不必在乎目的地，在乎的是沿途的风景。",
        "梦想还是要有的，万一实现了呢？",
        "没有人能回到过去重新开始，但谁都可以从现在开始，书写一个全然不同的结局。",
        "生活不是等待暴风雨过去，而是学会在雨中跳舞。",
        "最困难的时刻，也是离成功最近的时刻。",
        "每一次的失败，都是成功的垫脚石。",
        "人生最大的敌人是自己的懒惰。",
        "没有人能替你承担生活的责任，也没有人能阻挡你走向成功。",
        "时间会证明一切，但前提是你得给时间时间。",
        "成功不是将来才有的，而是从决定去做的那一刻起，持续累积而成。",
        "每一个不曾起舞的日子，都是对生命的辜负。",
        "人生就像爬山，看起来走了很远，一抬头才发现还在山脚下。",
        "没有人能随随便便成功，它来自彻底的自我管理和毅力。",
        "生活不会亏待每一个努力的人。",
        "最怕你一生碌碌无为，还安慰自己平凡可贵。"
    ];

    // 随机选择句子的函数
    function getRandomSentence() {
        const randomIndex = Math.floor(Math.random() * sentences.length);
        return sentences[randomIndex];
    }

    // 处理句子中的空格（单空格保持，双空格及以上换行）
    function processSentence(sentence) {
        return sentence.replace(/  +/g, '<br>');
    }

    // 显示随机句子
    function displayRandomSentence() {
        const sentenceElement = document.getElementById('random-sentence');
        if (sentenceElement) {
            const randomSentence = getRandomSentence();
            const processedSentence = processSentence(randomSentence);
            sentenceElement.innerHTML = processedSentence;
        }
    }

    // 页面加载完成后显示随机句子
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', displayRandomSentence);
    } else {
        displayRandomSentence();
    }

    // 页面刷新时重新选择句子（通过监听页面可见性变化）
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            displayRandomSentence();
        }
    });
})();
