# 📱 PersonalInfo — પ્રોજેક્ટ લાઈવ & ડિપ્લોયમેન્ટ માર્ગદર્શિકા (Comprehensive Live Guide)

આ દસ્તાવેજ **PersonalInfo (શ્રી સેજાણી પરિવાર એપ્લિકેશન)** ના તમામ બેકએન્ડ લાઈવ સર્વર, મોબાઈલ એપ બિલ્ડ, Cloudflare ટનલ અને Render ડિપ્લોયમેન્ટની સંપૂર્ણ વિગતો ધરાવે છે.

---

## 🌐 ૧. બેકએન્ડ લાઈવ કનેક્શન (Live Backend URLs)

| સેવાનો પ્રકાર | URL / એડ્રેસ | વિગત |
| :--- | :--- | :--- |
| **Cloudflare Live HTTPS** | `https://share-satisfy-becomes-interracial.trycloudflare.com/api` | 4G/5G પર ગમે ત્યાંથી ચાલતું સુરક્ષિત HTTPS API |
| **Local Development** | `http://127.0.0.1:8000/api` | લેપટોપ લોકલ API |
| **Render 24/7 Cloud (Ready)** | `https://sejani-backend.onrender.com/api` | ૨૪ કલાક કાયમી ક્લાઉડ સર્વર |

---

## 🚀 ૨. નવી Android APK કેવી રીતે બનાવવી & અપડેટ કરવી (EAS Build)

જ્યારે પણ તમે કોડમાં કોઈ નવો સુધારો કરો અને નવી APK બનાવવી હોય:

### સ્ટેપ ૧: કમાન્ડ રન કરો
```powershell
cd c:\Users\devde\Herd\personal\mobile
eas build -p android --profile preview
```

### સ્ટેપ ૨: ડાઉનલોડ લિંક ક્યાં મળશે?
- બિલ્ડ પૂરો થતાં ટર્મિનલમાં **Download URL** આવી જશે.
- અથવા તમારા Expo એકાઉન્ટ પર:  
  👉 **[https://expo.dev/accounts/kishan2205/projects/mobile/builds](https://expo.dev/accounts/kishan2205/projects/mobile/builds)**
- સીધી APK ડાઉનલોડ લિંક:  
  👉 `https://expo.dev/artifacts/eas/3FwW4vnCja9MuobG9wwhlFoAhhE99S3uPLIT5AfyHrA.apk`

---

## ☁️ ૩. Cloudflare Live Tunnel કેવી રીતે ચાલુ કરવી

જ્યારે તમે લેપટોપમાંથી બેકએન્ડ લાઈવ રાખવા માંગતા હો:

```powershell
cd c:\Users\devde\Herd\personal\backend
.\cloudflared.exe tunnel --url http://127.0.0.1:8000
```
- ટર્મિનલમાં જે નવી `https://xyz.trycloudflare.com` લિંક મળે, તે `mobile/src/api/client.ts` માં `LIVE_TUNNEL_URL` તરીકે સેટ કરી દો.

---

## 🌐 ૪. Render.com પર ૨૪ કલાક મફત Live ડિપ્લોયમેન્ટ

મેં તમારા માટે `backend/Dockerfile` અને `.dockerignore` બનાવીને મૂકી દીધું છે.

1. **GitHub પર કોડ પુશ કરો:**
   ```powershell
   cd c:\Users\devde\Herd\personal\backend
   git init
   git add .
   git commit -m "Deploy Sejani Backend to Render"
   git branch -M main
   git remote add origin https://github.com/તમારું-username/sejani-backend.git
   git push -u origin main
   ```
2. **Render.com પર જાઓ:**
   - **New ➔ Web Service** ➔ GitHub Repo પસંદ કરો ➔ **Docker** પસંદ કરીને **Free Plan** માં Create કરો.
3. જે URL મળે (દા.ત. `https://sejani-backend.onrender.com/api`), તે `mobile/src/api/client.ts` માં નાખી દો.

---

## 🔑 ૫. ડેમો લૉગિન એકાઉન્ટ્સ (Testing Accounts)

| સભ્યનું નામ | મોબાઈલ નંબર | પાસવર્ડ | હોદ્દો |
| :--- | :--- | :--- | :--- |
| **કિશન સેજાણી (તમે)** | `9825000005` | `password123` | સભ્ય / એડમિન |
| **હરિભાઈ (દાદા / મોભી)** | `9825000001` | `password123` | પરિવાર મોભી |
| **રમેશભાઈ (પિતાશ્રી)** | `9825000003` | `password123` | પિતા |
| **નવો સભ્ય રજિસ્ટ્રેશન** | *કોઈપણ નવો નંબર* | *નવો પાસવર્ડ* | `📝 રજિસ્ટર ટેબ પરથી` |

---

## ✨ ૬. મહત્વના ફીચર્સ & સેટિંગ્સ
1. **🌐 ગુજરાતી ⇄ English ભાષા સ્વિચર:** હેડર અને લૉગિન પેજ પર `[🇬🇧 EN / 🇬🇯 GU]` બટન.
2. **🎤 સ્પીચ & વોઇસ ઇનપુટ:** ખેતીવાડી ખર્ચ અને એલર્ટ્સમાં માઇક બટન.
3. **📄 વિગતવાર ખેતી PDF:** ખેતીવાડી હેડરમાં `[📄 ખેતી PDF]` બટન (નફો, પાક વેચાણ, ખર્ચ વિગત).
4. **🔔 લૉક સ્ક્રીન નોટિફિકેશન:** તારીખ/સમય સેટ કરેલા એલર્ટ્સ લૉક સ્ક્રીન પર વાગે છે.
5. **⌨️ કીબોર્ડ ડિસમિસ બાર:** `[⬇️ કીબોર્ડ બંધ કરો (Done ✕)]` ફ્લોટિંગ બટન.

---
*Made with ❤️ by Kishan Sejani • શ્રી સેજાણી પરિવાર (PersonalInfo)*
