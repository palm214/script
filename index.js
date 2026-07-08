// ==========================================
// ⚙️ إعدادات الوقت (يمكنك تعديلها من هنا)
// ==========================================
// الأرقام بالملي ثانية (1 دقيقة = 60000 ملي ثانية)

const ANIME_1_ID = 2025;
const ANIME_1_LOOP_TIME = 3 * 60 * 1000; // يعيد كل 3 دقائق

const ANIME_2_ID = 2021;
const ANIME_2_FIRST_DELAY = 1 * 60 * 1000; // يرسل أول مرة بعد دقيقة واحدة من تشغيل السكربت
const ANIME_2_LOOP_TIME = 30 * 60 * 1000; // ثم يعيد كل 30 دقيقة

// ==========================================

const axios = require('axios');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('✅ البوت الإسلامي يعمل بنصوص نقية وتوقيت دقيق!'));
app.listen(PORT, () => console.log(`🌐 الخادم يعمل على المنفذ ${PORT}`));

const MAIN_BASE_URL = 'https://anslayer.com/anime/public/anime-comments/';
const CLIENT_ID = 'android-app2';
const CLIENT_SECRET = '7befba6263cc14c90d2f1d6da2c5cf9b251bfbbd';
const TOKEN = '2b6337657f73e45544604e3bfe3dc156442802d4';

// المصفوفات والمتغيرات
let apiTexts = [];
let fallbackTexts = [];
let apiIndex = 0;
let fallbackIndex = 0;
let useOnlyFallback = false;
let messageCounter = 0; // حاسبة لمعرفة متى نستخدم القائمة البديلة

// دالة لخلط المصفوفات
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// القائمة البديلة الطويلة
const fallbackLibrary = [
    "📖 { فَاذْكُرُونِي أَذْكُرْكُمْ } [البقرة: 152]",
    "📖 { وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ } [الأعراف: 156]",
    "📖 { إِنَّ مَعَ الْعُسْرِ يُسْرًا } [الشرح: 6]",
    "📖 { وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ } [البقرة: 186]",
    "📖 { أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ } [الرعد: 28]",
    "📖 { وَمَا كَانَ اللَّهُ مُعَذِّبَهُمْ وَهُمْ يَسْتَغْفِرُونَ } [الأنفال: 33]",
    "سبحان الله وبحمده، سبحان الله العظيم.",
    "استغفر الله العظيم الذي لا إله إلا هو الحي القيوم وأتوب إليه.",
    "لا حول ولا قوة إلا بالله العلي العظيم.",
    "اللهم صل وسلم وبارك على نبينا محمد وعلى آله وصحبه أجمعين.",
    "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.",
    "يا مقلب القلوب ثبت قلبي على دينك.",
    "اللهم إنك عفو تحب العفو فاعف عنا.",
    "حسبي الله لا إله إلا هو، عليه توكلت وهو رب العرش العظيم.",
    "اللهم إني أسألك الجنة وأعوذ بك من النار.",
    "اللهم آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار.",
    "رضيت بالله ربا، وبالإسلام دينا، وبمحمد صلى الله عليه وسلم نبيا.",
    "سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر.",
    "اللهم أعني على ذكرك وشكرك وحسن عبادتك.",
    "لا إله إلا أنت سبحانك إني كنت من الظالمين.",
    "اللهم اغفر لي ذنبي كله، دقه وجله، وأوله وآخره، وعلانيته وسره.",
    "اللهم إني أسألك العفو والعافية في الدنيا والآخرة.",
    "اللهم اكفني بحلالك عن حرامك، وأغنني بفضلك عمن سواك.",
    "الحمد لله الذي أطعمنا وسقانا وجعلنا مسلمين.",
    "اللهم قني عذابك يوم تبعث عبادك.",
    "بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم.",
    "اللهم عالم الغيب والشهادة، فاطر السماوات والأرض، رب كل شيء ومليكه.",
    "أعوذ بكلمات الله التامات من شر ما خلق.",
    "اللهم إني أعوذ بك من الهم والحزن، والعجز والكسل، والبخل والجبن.",
    "اللهم اغفر للمسلمين والمسلمات والمؤمنين والمؤمنات الأحياء منهم والأموات."
];

// ==========================================
// 📚 جلب الأذكار وتنظيفها
// ==========================================
async function loadMassiveLibrary() {
    console.log('🔄 جارٍ جلب وتنظيف الأذكار من المصدر...');
    const uniqueTexts = new Set();
    
    // تجهيز القائمة البديلة
    fallbackTexts = [...fallbackLibrary];
    shuffleArray(fallbackTexts);

    try {
        const res = await axios.get('https://raw.githubusercontent.com/nawafalqari/azkar-api/56df51279ab6eb86dc2f6202c7de26c8948331c1/azkar.json');
        
        for (const category in res.data) {
            res.data[category].forEach(item => {
                if (item.content) {
                    let cleanText = typeof item.content === 'string' ? item.content : String(item.content);
                    cleanText = cleanText.replace(/\\n|\n/g, ' ');
                    cleanText = cleanText.replace(/['",]/g, '');
                    cleanText = cleanText.replace(/\s+/g, ' ').trim();
                    
                    if (cleanText.length > 10 && cleanText.length < 250) {
                        uniqueTexts.add(cleanText);
                    }
                }
            });
        }
        apiTexts = Array.from(uniqueTexts);
        shuffleArray(apiTexts);
        console.log(`✅ تم جلب [ ${apiTexts.length} ] ذكر من الرابط.`);
    } catch (e) { 
        console.log('⚠️ فشل السحب من الرابط، سيتم الاعتماد كلياً على القائمة البديلة.'); 
        useOnlyFallback = true;
    }
}

// ==========================================
// ⚖️ نظام اختيار النص (5 من الرابط، 1 من البديلة)
// ==========================================
function getNextIslamicText() {
    // إذا فشل الرابط تماماً، نأخذ من القائمة البديلة فقط
    if (useOnlyFallback || apiTexts.length === 0) {
        if (fallbackIndex >= fallbackTexts.length) {
            shuffleArray(fallbackTexts);
            fallbackIndex = 0;
        }
        return fallbackTexts[fallbackIndex++];
    }

    messageCounter++;

    // كل 6 رسائل، أرسل الرسالة السادسة من القائمة البديلة (بمعنى 5 من الرابط و 1 بديلة)
    if (messageCounter % 6 === 0) {
        if (fallbackIndex >= fallbackTexts.length) {
            shuffleArray(fallbackTexts);
            fallbackIndex = 0;
        }
        return fallbackTexts[fallbackIndex++];
    } else {
        // خلاف ذلك أرسل من الرابط
        if (apiIndex >= apiTexts.length) {
            shuffleArray(apiTexts);
            apiIndex = 0;
        }
        return apiTexts[apiIndex++];
    }
}

// ==========================================
// 🚀 دالة إرسال التعليق
// ==========================================
async function testCommentsFlow(animeId) {
    let firstCommentId = null;

    try {
        const jsonQuery = encodeURIComponent(JSON.stringify({ anime_id: animeId, page: 1 }));
        const commentsRes = await axios.get(`${MAIN_BASE_URL}get-anime-comments?json=${jsonQuery}`, {
            headers: {
                'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 11; Build/RP1A.200720.011)',
                'Client-Id': CLIENT_ID,
                'Client-Secret': CLIENT_SECRET,
                'X-Requested-With': 'com.anslayer.app'
            }
        });

        const resBody = commentsRes.data?.response;
        let commentsList = [];
        if (Array.isArray(resBody)) commentsList = resBody;
        else if (resBody && Array.isArray(resBody.data)) commentsList = resBody.data;

        if (commentsList.length > 0) {
            const sample = commentsList[0];
            firstCommentId = sample.anime_comment_id || sample.comment_id || sample.id;
        }
    } catch (error) {
        return; 
    }

    if (!firstCommentId) return;

    const replyText = getNextIslamicText();
    console.log(`\n📬 [أنمي ${animeId}]: جارٍ إرسال رد...`);

    try {
        await axios.post(`${MAIN_BASE_URL}create-anime-comment-reply`, {
            anime_comment_id: firstCommentId,
            reply_text: replyText,
            spoiler: "No"
        }, {
            headers: {
                'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 11; Build/RP1A.200720.011)',
                'Content-Type': 'application/json',
                'Client-Id': CLIENT_ID,
                'Client-Secret': CLIENT_SECRET,
                'X-Requested-With': 'com.anslayer.app',
                'Authorization': `Bearer ${TOKEN}`
            }
        });
        console.log(`✅ [أنمي ${animeId}] تم نشر: ${replyText.substring(0, 35)}...`);
    } catch (error) {
        console.log(`❌ فشل إرسال الرد الحالي للأنمي ${animeId}.`);
    }
}

// ⏰ دالة منع النوم 
const RENDER_APP_URL = 'https://script-gg76.onrender.com'; 

setInterval(async () => {
    try {
        await axios.get(RENDER_APP_URL);
    } catch (error) {
        // تجاهل بصمت
    }
}, 600000); 

// ==========================================
// 🚀 التشغيل المبرمج والذكي
// ==========================================
loadMassiveLibrary().then(() => {
    
    console.log("▶️ بدء تشغيل السكربتات...");

    // 1️⃣ تشغيل أنمي 2025 (أبو 3 دقائق) فوراً، ثم تكراره
    testCommentsFlow(ANIME_1_ID);
    setInterval(() => {
        testCommentsFlow(ANIME_1_ID);
    }, ANIME_1_LOOP_TIME);

    // 2️⃣ تشغيل أنمي 2021 (أبو 30 دقيقة) بعد انتظار الدقيقة الأولى، ثم تكراره
    setTimeout(() => {
        testCommentsFlow(ANIME_2_ID); // يشتغل أول مرة هنا!
        setInterval(() => {
            testCommentsFlow(ANIME_2_ID);
        }, ANIME_2_LOOP_TIME); // ثم يبدأ بتكرار نفسه كل 30 دقيقة
    }, ANIME_2_FIRST_DELAY);

});
