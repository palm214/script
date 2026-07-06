const axios = require('axios');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('✅ البوت الإسلامي يعمل بنصوص نقية وصافية!'));
app.listen(PORT, () => console.log(`🌐 الخادم يعمل على المنفذ ${PORT}`));

const MAIN_BASE_URL = 'https://anslayer.com/anime/public/anime-comments/';
const CLIENT_ID = 'android-app2';
const CLIENT_SECRET = '7befba6263cc14c90d2f1d6da2c5cf9b251bfbbd';
const TOKEN = '2b6337657f73e45544604e3bfe3dc156442802d4';
const TARGET_ANIME_ID = 2025;

let readyTexts = [];
let currentIndex = 0;

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// ==========================================
// 📚 جلب الأذكار وتنظيفها من الشوائب البرمجية
// ==========================================
async function loadMassiveLibrary() {
    console.log('🔄 جارٍ جلب وتنظيف الأذكار من المصدر...');
    const uniqueTexts = new Set();

    try {
        const res = await axios.get('https://raw.githubusercontent.com/nawafalqari/azkar-api/56df51279ab6eb86dc2f6202c7de26c8948331c1/azkar.json');
        
        for (const category in res.data) {
            res.data[category].forEach(item => {
                if (item.content) {
                    // تحويل المحتوى إلى نص في حال كان مصفوفة
                    let cleanText = typeof item.content === 'string' ? item.content : String(item.content);
                    
                    // 1. إزالة أسطر \n واستبدالها بمسافة
                    cleanText = cleanText.replace(/\\n|\n/g, ' ');
                    
                    // 2. إزالة الفواصل الإنجليزية وعلامات التنصيص التي تشوه النص (', ")
                    cleanText = cleanText.replace(/['",]/g, '');
                    
                    // 3. إزالة المسافات المزدوجة الناتجة عن التنظيف
                    cleanText = cleanText.replace(/\s+/g, ' ').trim();
                    
                    // 4. أخذ النصوص المعبرة والقصيرة فقط
                    if (cleanText.length > 10 && cleanText.length < 250) {
                        uniqueTexts.add(cleanText);
                    }
                }
            });
        }
    } catch (e) { 
        console.log('⚠️ فشل السحب من الرابط، سيتم استخدام القائمة البديلة.'); 
    }

    readyTexts = Array.from(uniqueTexts);

    // إضافة آيات وأحاديث مختارة ومبشرة يدوياً
    const holyAyahs = [
        "📖 { فَاذْكُرُونِي أَذْكُرْكُمْ } [البقرة: 152]",
        "📖 { وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ } [الأعراف: 156]",
        "📖 { إِنَّ مَعَ الْعُسْرِ يُسْرًا } [الشرح: 6]",
        "📖 { وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ أُجِيبُ دَعْوَةَ الدَّاعِ } [البقرة: 186]",
        "📖 { أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ } [الرعد: 28]",
        "📖 { وَمَا كَانَ اللَّهُ مُعَذِّبَهُمْ وَهُمْ يَسْتَغْفِرُونَ } [الأنفال: 33]",
        "سبحان الله وبحمده، سبحان الله العظيم.",
        "استغفر الله العظيم الذي لا إله إلا هو الحي القيوم وأتوب إليه.",
        "لا حول ولا قوة إلا بالله العلي العظيم.",
        "اللهم صل وسلم وبارك على نبينا محمد وعلى آله وصحبه أجمعين.",
        "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.",
        "يا مقلب القلوب ثبت قلبي على دينك.",
        "اللهم إنك عفو تحب العفو فاعف عنا."
    ];
    
    readyTexts = readyTexts.concat(holyAyahs);

    shuffleArray(readyTexts);
    console.log(`✅ تم دمج وتجهيز [ ${readyTexts.length} ] ذكر وآية نظيفة كلياً!`);
}

function getNextIslamicText() {
    if (currentIndex >= readyTexts.length) {
        shuffleArray(readyTexts);
        currentIndex = 0;
        console.log('🔄 تم الانتهاء من جميع النصوص، وإعادة خلط القائمة للبدء من جديد.');
    }
    const text = readyTexts[currentIndex];
    currentIndex++;
    return text;
}

async function testCommentsFlow() {
    if (readyTexts.length === 0) return;

    let firstCommentId = null;

    try {
        const jsonQuery = encodeURIComponent(JSON.stringify({ anime_id: TARGET_ANIME_ID, page: 1 }));
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
    console.log(`\n📬 [الذكر رقم ${currentIndex}]: جارٍ إرساله...`);

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
        console.log(`✅ تم نشر: ${replyText.substring(0, 35)}...`);
    } catch (error) {
        console.log('❌ فشل إرسال الرد الحالي.');
    }
}

// ⏰ دالة منع النوم 
const RENDER_APP_URL = 'https://anslayer-bot.onrender.com'; // تأكد أن هذا هو رابطك في ريندر

setInterval(async () => {
    try {
        await axios.get(RENDER_APP_URL);
    } catch (error) {
        // تجاهل بصمت
    }
}, 600000); 

loadMassiveLibrary().then(() => {
    testCommentsFlow();
    setInterval(testCommentsFlow, 61000);
});

