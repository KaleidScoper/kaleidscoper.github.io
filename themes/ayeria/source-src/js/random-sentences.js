// 随机句子功能
(function() {
    // 后备句子库：random-sentences.txt 前 20 条非注释句
    const defaultSentences = [
        "月映松梢鹤影长 风摇竹叶露凝香",
        "云开远岫千峰秀 水落寒潭万籁凉",
        "晓披烟雾入青峦 山寺疏钟万木寒",
        "莫言路遥余秋雨 何云程明赖春风",
        "寒树依微远天外 夕阳明灭乱流中",
        "翠袖殷勤 金杯错落 玉手琵琶",
        "回首天涯 一抹斜阳 数点寒鸦",
        "问世间 情是何物 直教生死相许",
        "欢乐趣 离别苦 就中更有痴儿女",
        "渺万里层云 千山暮雪 只影向谁去",
        "天也妒 未信与 莺儿燕子俱黄土",
        "天阶夜色凉如水 卧看牵牛织女星",
        "解释春风无限恨 沉香亭北倚栏杆",
        "未觉池塘春草梦 阶前梧叶已秋声",
        "我欲穿花寻路 直入白云深处 浩气展虹霓",
        "谪仙何处 无人伴我白螺杯",
        "醉舞下山去 明月逐人归",
        "一川烟草 满城风絮 梅子黄时雨",
        "风烟俱净 天山共色 从流飘荡 任意东西",
        "日暮苍山远 天寒白屋贫"
    ];

    let sentences = [...defaultSentences];
    let useLocalFile = true;
    let queueSize = 5;
    let recentSentences = [];

    function checkConfig() {
        const configElement = document.querySelector('[data-random-sentences-config]');
        if (!configElement) return;

        try {
            const config = JSON.parse(configElement.getAttribute('data-random-sentences-config'));
            if (config.hasOwnProperty('use_local_file')) {
                useLocalFile = config.use_local_file;
            }
            if (config.hasOwnProperty('queue_size') && config.queue_size > 0) {
                queueSize = config.queue_size;
            }
        } catch (e) {
            // 配置解析失败，使用默认值
        }
    }

    async function loadSentencesFromFile() {
        try {
            const response = await fetch('/data/random-sentences.txt');
            if (response.ok) {
                const text = await response.text();
                const lines = text.split('\n').filter(line => {
                    const trimmed = line.trim();
                    return trimmed !== '' && !trimmed.startsWith('#');
                });
                if (lines.length > 0) {
                    sentences = lines;
                }
            }
        } catch (error) {
            console.warn('随机句子加载失败，使用后备句子库');
        }
    }

    function getRandomSentence() {
        if (sentences.length <= queueSize) {
            const randomIndex = Math.floor(Math.random() * sentences.length);
            const selectedSentence = sentences[randomIndex];
            updateRecentQueue(selectedSentence);
            return selectedSentence;
        }

        const availableSentences = sentences.filter(sentence => !recentSentences.includes(sentence));

        if (availableSentences.length === 0) {
            recentSentences = [];
            const randomIndex = Math.floor(Math.random() * sentences.length);
            const selectedSentence = sentences[randomIndex];
            updateRecentQueue(selectedSentence);
            return selectedSentence;
        }

        const randomIndex = Math.floor(Math.random() * availableSentences.length);
        const selectedSentence = availableSentences[randomIndex];
        updateRecentQueue(selectedSentence);
        return selectedSentence;
    }

    function updateRecentQueue(sentence) {
        const index = recentSentences.indexOf(sentence);
        if (index > -1) {
            recentSentences.splice(index, 1);
        }
        recentSentences.push(sentence);
        if (recentSentences.length > queueSize) {
            recentSentences.shift();
        }
    }

    function applyLineBreaks(sentence) {
        return sentence.replace(/  +/g, '<br>');
    }

    function displayRandomSentence() {
        const sentenceElement = document.getElementById('random-sentence');
        if (!sentenceElement) return;

        const randomSentence = getRandomSentence();
        sentenceElement.innerHTML = applyLineBreaks(randomSentence);
    }

    async function initialize() {
        var el = document.getElementById('random-sentence');
        if (!el) return;

        checkConfig();
        if (useLocalFile) {
            await loadSentencesFromFile();
        }
        displayRandomSentence();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            displayRandomSentence();
        }
    });
})();
