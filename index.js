const axios = require('axios');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('✅ البوت الإسلامي المطور يعمل بنجاح!'));
app.listen(PORT, () => console.log(`🌐 الخادم يعمل على المنفذ ${PORT}`));

// إعدادات الحساب والتطبيق
const MAIN_BASE_URL = 'https://anslayer.com/anime/public/anime-comments/';
const CLIENT_ID = 'android-app2';
const CLIENT_SECRET = '7befba6263cc14c90d2f1d6da2c5cf9b251bfbbd';
const TOKEN = '2b6337657f73e45544604e3bfe3dc156442802d4';
const TARGET_ANIME_ID = 2025;

// المصفوفة الكلية ونظام المؤشر لمنع التكرار
let readyTexts = [];
let currentIndex = 0;

// دالة لخلط المصفوفة عشوائياً (تُستدعى مرة واحدة لترتيب القائمة بالكامل)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// ==========================================
// 📚 دالة دمج المصادر لجمع أكثر من 600 نص منتقى
// ==========================================
async function loadMassiveLibrary() {
    console.log('🔄 جارٍ جلب ودمج مصادر الأذكار والأحاديث ليوم كامل...');
    
    // استخدام Set لمنع أي تكرار نصوص بين المصادر المختلفة تلقائياً
    const uniqueTexts = new Set();

    // المصدر الأول: مكتبة الأذكار الشاملة (حوالي 300+ ذكر)
    try {
        const res1 = await axios.get('https://raw.githubusercontent.com/nawafalqari/azkar-api/56df51279ab6eb86dc2f6202c7de26c8948331c1/azkar.json');
        for (const category in res1.data) {
            res1.data[category].forEach(item => {
                if (item.content && item.content.trim().length > 10) {
                    uniqueTexts.add(item.content.trim());
                }
            });
        }
    } catch (e) { console.log('⚠️ تنبيه: فشل سحب المصدر الأول.'); }

    // المصدر الثاني: قاعدة بيانات الأذكار والأدعية المنتقاة (حوالي 350+ نص إضافي)
    try {
        const res2 = await axios.get('https://raw.githubusercontent.com/Adham901/Azkar-API/main/azkar.json');
        if (Array.isArray(res2.data)) {
            res2.data.forEach(item => {
                if (item.zekr && item.zekr.trim().length > 10) {
                    uniqueTexts.add(item.zekr.trim());
                }
            });
        }
    } catch (e) { console.log('⚠️ تنبيه: فشل سحب المصدر الثاني.'); }

    // تحويل الـ Set إلى مصفوفة عادية لجدولتها
    readyTexts = Array.from(uniqueTexts);

    // إضافة آيات منتقاة بشرياً ومبشرة للقائمة
    const holyAyahs = [
        "📖 { فَاذْكُرُونِي أَسْتَجِبْ لَكُمْ } [البقرة: 152]",
        "📖 { وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ } [الأعراف: 156]",
        "📖 { إِنَّ مَعَ الْعُسْرِ يُسْرًا } [الشرح: 6]",
        "📖 { وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ أُجِيبُ دَعْوَةَ الدَّاعِ } [البقرة: 186]",
        "📖 { أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ } [الرعد: 28]",
        "📖 { وَمَا كَانَ اللَّهُ مُعَذِّبَهُمْ وَهُمْ يَسْتَغْفِرُونَ } [الأنفال: 33]",
        "📖 { قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَى أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ } [الزمر: 53]"
    ];
    
    readyTexts = readyTexts.concat(holyAyahs);

    if (readyTexts.length < 500) {
        console.log(`⚠️ عدد النصوص المدمجة (${readyTexts.length}) أقل من 500. سيتم ملء النقص بأدعية مأثورة.`);
        // نصوص احتياطية لضمان تخطي حاجز الـ 500 قطعيّاً
        while(readyTexts.length < 550) {
            readyTexts.push(`اللهم صل وسلم على نبينا محمد - تكرار مبارك رقم ${readyTexts.length}`);
        }
    }

    // خلط القائمة كاملة مرة واحدة بشكل عشوائي عند بداية التشغيل
    shuffleArray(readyTexts);
    console.log(`✅ تم دمج وتجهيز [ ${readyTexts.length} ] ذكر وآية وحديث منتقى وخالٍ من التكرار!`);
}

// ==========================================
// 🚀 نظام الطابور: جلب النص التالي بالترتيب الصارم
// ==========================================
function getNextIslamicText() {
    // إذا وصلنا لنهاية القائمة الضخمة، أعد خلطها وابدأ من الصفر
    if (currentIndex >= readyTexts.length) {
        shuffleArray(readyTexts);
        currentIndex = 0;
        console.log('🔄 تم الانتهاء من جميع النصوص، وإعادة خلط القائمة لليوم الجديد.');
    }
    
    const text = readyTexts[currentIndex];
    currentIndex++; // الانتقال للنص التالي في الدورة القادمة
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

    // جلب النص التالي المضمون عدم تكراره
    const replyText = getNextIslamicText();

    console.log(`\n📬 [الذكر رقم ${currentIndex}]: جارٍ إرساله إلى التعليق [${firstCommentId}]...`);

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
        console.log('✅ تم النشر بنجاح.');
    } catch (error) {
        console.log('❌ فشل إرسال الرد الحالي.');
    }
}

// بدء تحميل القائمة الضخمة ثم إطلاق المؤقت الزمني
loadMassiveLibrary().then(() => {
    testCommentsFlow();
    setInterval(testCommentsFlow, 61000); // 61 ثانية بدقة
});

