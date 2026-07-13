// Vernacular assistant — plain-language answers to the questions a real MSME
// owner asks. Answers are grounded in the borrower's own score so they always
// stay consistent with what is shown on screen.

import type { ScoreResult } from '../lib/types'

export type Lang = 'en' | 'hi' | 'gu' | 'ta'

export const LANGUAGES: { id: Lang; label: string; native: string }[] = [
  { id: 'en', label: 'English', native: 'English' },
  { id: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { id: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { id: 'ta', label: 'Tamil', native: 'தமிழ்' },
]

export interface Suggestion {
  id: string
  q: Record<Lang, string>
  answer: (s: ScoreResult) => Record<Lang, string>
}

const strongest = (s: ScoreResult) => [...s.dimensions].sort((a, b) => b.score - a.score)[0]
const weakest = (s: ScoreResult) => [...s.dimensions].sort((a, b) => a.score - b.score)[0]
const inrL = (v: number) => '₹' + (v / 100000).toFixed(2).replace(/\.00$/, '') + 'L'

export const SUGGESTIONS: Suggestion[] = [
  {
    id: 'why',
    q: {
      en: 'Why is my score what it is?',
      hi: 'मेरा स्कोर इतना क्यों है?',
      gu: 'મારો સ્કોર આટલો કેમ છે?',
      ta: 'என் மதிப்பெண் ஏன் இப்படி உள்ளது?',
    },
    answer: (s) => {
      const st = strongest(s)
      const wk = weakest(s)
      return {
        en: `Your Pulse Score is ${s.overall} (Grade ${s.grade}). Your strongest area is ${st.label} at ${st.score}/100, which lifts the score the most. ${wk.label} at ${wk.score}/100 is holding it back. Improve that and your score rises.`,
        hi: `आपका पल्स स्कोर ${s.overall} है (ग्रेड ${s.grade})। आपकी सबसे मज़बूत बात है ${st.label} — ${st.score}/100। ${wk.label} (${wk.score}/100) स्कोर को नीचे रख रहा है। इसे सुधारें तो स्कोर बढ़ेगा।`,
        gu: `તમારો પલ્સ સ્કોર ${s.overall} છે (ગ્રેડ ${s.grade}). સૌથી મજબૂત ${st.label} (${st.score}/100) છે. ${wk.label} (${wk.score}/100) સ્કોરને નીચે રાખે છે. તેને સુધારો તો સ્કોર વધશે.`,
        ta: `உங்கள் பல்ஸ் மதிப்பெண் ${s.overall} (தரம் ${s.grade}). வலிமையானது ${st.label} (${st.score}/100). ${wk.label} (${wk.score}/100) மதிப்பெண்ணை குறைக்கிறது. அதை மேம்படுத்தினால் மதிப்பெண் உயரும்.`,
      }
    },
  },
  {
    id: 'improve',
    q: {
      en: 'How can I improve my score?',
      hi: 'मैं अपना स्कोर कैसे सुधारूँ?',
      gu: 'હું મારો સ્કોર કેવી રીતે સુધારું?',
      ta: 'என் மதிப்பெண்ணை எப்படி மேம்படுத்துவது?',
    },
    answer: (s) => {
      const wk = weakest(s)
      return {
        en: `Focus on ${wk.label}. File your next 3 GST returns on time, keep credit-line usage under 35%, and route more sales through UPI. Doing this can move you up a grade in about 90 days — try the "Path to a better grade" simulator.`,
        hi: `${wk.label} पर ध्यान दें। अगली 3 GST रिटर्न समय पर भरें, क्रेडिट का उपयोग 35% से कम रखें, और ज़्यादा बिक्री UPI से करें। इससे ~90 दिनों में ग्रेड बढ़ सकता है — "बेहतर ग्रेड का रास्ता" सिम्युलेटर आज़माएँ।`,
        gu: `${wk.label} પર ધ્યાન આપો. આગામી 3 GST રિટર્ન સમયસર ભરો, ક્રેડિટ વપરાશ 35% થી ઓછો રાખો, અને વધુ વેચાણ UPI થી કરો. ~90 દિવસમાં ગ્રેડ વધી શકે.`,
        ta: `${wk.label} மீது கவனம் செலுத்துங்கள். அடுத்த 3 GST தாக்கல்களை சரியான நேரத்தில் செய்யுங்கள், கடன் பயன்பாட்டை 35%க்குள் வைத்திருங்கள். ~90 நாட்களில் தரம் உயரலாம்.`,
      }
    },
  },
  {
    id: 'limit',
    q: {
      en: 'How much loan can I get?',
      hi: 'मुझे कितना लोन मिल सकता है?',
      gu: 'મને કેટલી લોન મળી શકે?',
      ta: 'எனக்கு எவ்வளவு கடன் கிடைக்கும்?',
    },
    answer: (s) => ({
      en: `Based on your real monthly cash surplus, you have an indicative working-capital eligibility of ${inrL(s.eligibleLimit)}. This is cash-flow based — no balance sheet or collateral needed to start the conversation.`,
      hi: `आपके मासिक नकद बचत के आधार पर, आपकी संकेतात्मक कार्यशील-पूंजी पात्रता ${inrL(s.eligibleLimit)} है। यह नकदी-प्रवाह पर आधारित है — शुरू करने के लिए बैलेंस शीट या गारंटी की ज़रूरत नहीं।`,
      gu: `તમારી માસિક રોકડ બચત પર આધારિત, તમારી કાર્યકારી-મૂડી પાત્રતા ${inrL(s.eligibleLimit)} છે. આ કૅશ-ફ્લો આધારિત છે — બૅલેન્સ શીટ કે ગૅરંટીની જરૂર નથી.`,
      ta: `உங்கள் மாதாந்திர பணமிச்சத்தின் அடிப்படையில், உங்கள் செயல்பாட்டு மூலதன தகுதி ${inrL(s.eligibleLimit)}. இது பணப்புழக்கத்தை அடிப்படையாகக் கொண்டது — இருப்புநிலை தேவையில்லை.`,
    }),
  },
  {
    id: 'data',
    q: {
      en: 'Is my data safe?',
      hi: 'क्या मेरा डेटा सुरक्षित है?',
      gu: 'શું મારો ડેટા સુરક્ષિત છે?',
      ta: 'என் தரவு பாதுகாப்பானதா?',
    },
    answer: () => ({
      en: `Yes. Nothing is fetched without your explicit, time-bound consent through the Account Aggregator framework. You can revoke it anytime, and the data is purged 24 hours after the decision — fully compliant with the DPDP Act.`,
      hi: `हाँ। आपकी स्पष्ट, समय-सीमित सहमति के बिना कुछ नहीं लिया जाता — Account Aggregator के ज़रिए। आप इसे कभी भी रद्द कर सकते हैं, और निर्णय के 24 घंटे बाद डेटा हटा दिया जाता है (DPDP अधिनियम अनुरूप)।`,
      gu: `હા. તમારી સ્પષ્ટ, સમય-મર્યાદિત સંમતિ વિના કંઈ લેવાતું નથી. તમે ગમે ત્યારે રદ કરી શકો, અને નિર્ણય પછી 24 કલાકે ડેટા દૂર થાય છે (DPDP અનુરૂપ).`,
      ta: `ஆம். Account Aggregator மூலம் உங்கள் வெளிப்படையான ஒப்புதல் இல்லாமல் எதுவும் எடுக்கப்படாது. எப்போது வேண்டுமானாலும் ரத்து செய்யலாம்; முடிவுக்குப் பின் 24 மணி நேரத்தில் தரவு அழிக்கப்படும்.`,
    }),
  },
]

export const ASSISTANT_GREETING: Record<Lang, string> = {
  en: 'Namaste! I can explain your Financial Health Card in simple terms. Ask me anything, or pick a question below.',
  hi: 'नमस्ते! मैं आपका फ़ाइनेंशियल हेल्थ कार्ड आसान भाषा में समझा सकता हूँ। कुछ भी पूछें, या नीचे से सवाल चुनें।',
  gu: 'નમસ્તે! હું તમારું ફાઇનાન્શિયલ હેલ્થ કાર્ડ સરળ ભાષામાં સમજાવી શકું. કંઈપણ પૂછો, અથવા નીચેથી પ્રશ્ન પસંદ કરો.',
  ta: 'வணக்கம்! உங்கள் நிதி ஆரோக்கிய அட்டையை எளிய மொழியில் விளக்குகிறேன். எதையும் கேளுங்கள், அல்லது கீழே ஒரு கேள்வியைத் தேர்வுசெய்யுங்கள்.',
}

/** Fallback matcher for free-typed questions -> nearest suggestion. */
export function matchIntent(text: string): Suggestion {
  const t = text.toLowerCase()
  if (/(safe|secure|privacy|data|सुरक्षित|ડેટા|தரவு)/.test(t)) return SUGGESTIONS[3]
  if (/(loan|limit|amount|kitna|कितना|લોન|கடன்)/.test(t)) return SUGGESTIONS[2]
  if (/(improve|better|badha|सुधार|સુધાર|மேம்)/.test(t)) return SUGGESTIONS[1]
  return SUGGESTIONS[0]
}
