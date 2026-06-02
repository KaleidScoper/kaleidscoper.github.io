// 随机句子功能 —— Fisher-Yates 洗牌 + localStorage 持久化牌库
(function() {
    const STORAGE_KEY = 'ayeria-random-deck';

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
    // deck: { fingerprint: number, indices: number[], pointer: number }
    let deck = null;

    function checkConfig() {
        const configElement = document.querySelector('[data-random-sentences-config]');
        if (!configElement) return;

        try {
            const config = JSON.parse(configElement.getAttribute('data-random-sentences-config'));
            if (config.hasOwnProperty('use_local_file')) {
                useLocalFile = config.use_local_file;
            }
        } catch (e) {}
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

    function loadDeck() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (parsed && parsed.fingerprint === sentences.length && Array.isArray(parsed.indices)) {
                return parsed;
            }
        } catch (e) {}
        return null;
    }

    function saveDeck() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(deck));
        } catch (e) {}
    }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
        }
    }

    function createDeck(prevLastIndex) {
        const indices = [];
        for (let i = 0; i < sentences.length; i++) {
            indices.push(i);
        }
        shuffle(indices);

        // 新周期首句不能是旧周期末句
        if (prevLastIndex !== undefined && indices[0] === prevLastIndex && indices.length > 1) {
            const swap = 1 + Math.floor(Math.random() * (indices.length - 1));
            const tmp = indices[0];
            indices[0] = indices[swap];
            indices[swap] = tmp;
        }

        return { fingerprint: sentences.length, indices: indices, pointer: 0 };
    }

    function getRandomSentence() {
        if (!deck) {
            deck = loadDeck();
        }
        if (!deck) {
            deck = createDeck();
        }

        const index = deck.indices[deck.pointer];
        const sentence = sentences[index];
        deck.pointer++;

        if (deck.pointer >= deck.indices.length) {
            const lastIndex = deck.indices[deck.indices.length - 1];
            deck = createDeck(lastIndex);
        }

        saveDeck();
        return sentence;
    }

    function applyLineBreaks(sentence) {
        return sentence.replace(/  +/g, '<br>');
    }

    function displayRandomSentence() {
        const sentenceElement = document.getElementById('random-sentence');
        if (!sentenceElement) return;

        sentenceElement.innerHTML = applyLineBreaks(getRandomSentence());
    }

    async function initialize() {
        const el = document.getElementById('random-sentence');
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
