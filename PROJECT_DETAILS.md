# 📖 શ્રી સેજાણી પરિવાર (PersonalInfo) — પ્રોજેક્ટ સંપૂર્ણ વિગત & લિંક્સ દસ્તાવેજ (Project Master Document)

આ દસ્તાવેજમાં પ્રોજેક્ટની તમામ લાઈવ લિંક્સ, ગિટહબ રિપોઝિટરી, બેકએન્ડ લાઈવ સર્વર, ડેટાબેઝ કેવી રીતે જોવો, મોબાઈલ એપ્લિકેશન ડાઉનલોડ લિંક અને ઉપયોગની સંપૂર્ણ માહિતી આપવામાં આવી છે.

---

## 🔗 ૧. મહત્વપૂર્ણ લિંક્સ (Master Quick Links)

| સેવા / પ્લેટફોર્મ | લિંક / URL | વિગત |
| :--- | :--- | :--- |
| 🐙 **GitHub Repository** | [github.com/kishansejani/sejani-backend](https://github.com/kishansejani/sejani-backend) | બેકએન્ડ અને પ્રોજેક્ટનો મુખ્ય કોડ |
| 🚀 **Live Backend (24/7 Cloud)** | `https://sejani-backend.onrender.com/api` | Render.com પર ૨૪ કલાક ચાલતું લાઈવ API |
| 📱 **Android APK Download** | [Direct APK Download](https://expo.dev/artifacts/eas/3FwW4vnCja9MuobG9wwhlFoAhhE99S3uPLIT5AfyHrA.apk) | મોબાઇલમાં ઇન્સ્ટોલ કરવા માટેની APK |
| 📊 **Expo Build Dashboard** | [expo.dev/accounts/kishan2205/projects/mobile/builds](https://expo.dev/accounts/kishan2205/projects/mobile/builds) | તમામ નવા-જૂના બિલ્ડ્સ અને લોગ્સ |
| 💻 **Local Backend URL** | `http://127.0.0.1:8000/api` (અથવા `http://personal.test/api`) | તમારા લેપટોપમાં Herd / Artisan નું લોકલ API |

---

## 🗄️ ૨. ડેટાબેઝ ક્યાં છે અને કેવી રીતે જોવો? (Database Access & Inspection)

### 📌 ડેટાબેઝ પ્રકાર:
પ્રોજેક્ટમાં **SQLite** ડેટાબેઝ વપરાય છે, જે ઝડપી, સુરક્ષિત અને સર્વરલેસ છે.

### 📍 લોકલ ડેટાબેઝ ફાઇલનું લોકેશન:
```text
c:\Users\devde\Herd\personal\backend\database\database.sqlite
```

### 🔍 ડેટાબેઝ ઓપન કરીને ટેબલ્સ અને ડેટા જોવાની રીતો:

#### ૧) **VS Code / Antigravity એક્સટેન્શનથી (સૌથી સરળ રીત):**
1. Extensions (Ctrl + Shift + X) માં જાઓ.
2. **"SQLite Viewer"** સર્ચ કરીને ઇન્સ્ટોલ કરો.
3. ડાબી બાજુ File Explorer માં `backend/database/database.sqlite` ફાઇલ પર ક્લિક કરો.
4. તમને બધા જ ટેબલ્સ (`users`, `crops`, `crop_expenses`, `crop_incomes`, `reminders`, `tractor_works` વગેરે) ટેબલ વ્યુમાં દેખાશે.

#### ૨) **DB Browser for SQLite સોફ્ટવેર દ્વારા:**
1. [DB Browser for SQLite](https://sqlitebrowser.org/dl/) ફ્રી સોફ્ટવેર ડાઉનલોડ કરો.
2. `Open Database` બટન દબાવીને `backend\database\database.sqlite` ફાઇલ સિલેક્ટ કરો.
3. `Browse Data` ટેબમાં જઈને તમે તમામ રેકોર્ડ્સ જોઈ, શોધી કે એડિટ કરી શકો છો.

#### ૩) **ટર્મિનલ / કમાન્ડ લાઈન દ્વારા:**
```powershell
cd c:\Users\devde\Herd\personal\backend
php artisan tinker
```
*ઉદાહરણ તરીકે યૂઝર્સ જોવા:*
```php
App\Models\User::all();
App\Models\Crop::with('expenses', 'incomes')->get();
```

---

## 🌐 ૩. બેકએન્ડ ક્યાં લાઈવ છે? (Backend Deployment Details)

### ☁️ **Render.com Cloud Server:**
- **Status:** ૨૪×૭ ઓનલાઈન (લેપટોપ બંધ હોય તો પણ ચાલુ રહે છે)
- **API Root:** `https://sejani-backend.onrender.com/api`
- **Render Dashboard:** [dashboard.render.com](https://dashboard.render.com)
- **Deployment રીત:** GitHub (`main` બ્રાન્ચ) સાથે કનેક્ટેડ છે, જ્યારે પણ GitHub પર કોડ પુશ થાય ત્યારે Render આપોઆપ નવું વર્ઝન લાઈવ કરી દે છે.

### 💻 **Local / Cloudflare Tunnel (વૈકલ્પિક):**
જો લેપટોપમાંથી લોકલ ટેસ્ટિંગ કરવું હોય:
```powershell
cd c:\Users\devde\Herd\personal\backend
# ટનલ શરૂ કરવા:
.\cloudflared.exe tunnel --url http://127.0.0.1:8000
```

---

## 📲 ૪. મોબાઈલ એપ્લિકેશન (Mobile App & EAS Build)

### 📥 સીધી APK ડાઉનલોડ લિંક:
👉 **[3FwW4vnCja9MuobG9wwhlFoAhhE99S3uPLIT5AfyHrA.apk ડાઉનલોડ કરો](https://expo.dev/artifacts/eas/3FwW4vnCja9MuobG9wwhlFoAhhE99S3uPLIT5AfyHrA.apk)**

### 🛠️ નવો સુધારો કર્યા પછી નવી APK બનાવવાનો કમાન્ડ:
```powershell
cd c:\Users\devde\Herd\personal\mobile
eas build -p android --profile preview
```
*બિલ્ડ પૂરું થયા પછી ૧૦ થી ૧૫ મિનિટમાં Expo ડેશબોર્ડ પરથી નવી APK લિંક મળી જશે.*

---

## 🔑 ૫. ડેમો / ટેસ્ટિંગ લૉગિન એકાઉન્ટ્સ (Default Login Accounts)

| સભ્ય | મોબાઈલ નંબર | પાસવર્ડ | ભૂમિકા |
| :--- | :--- | :--- | :--- |
| **કિશન સેજાણી** | `9825000005` | `password123` | એડમિન / સભ્ય |
| **હરિભાઈ (દાદા)** | `9825000001` | `password123` | પરિવાર મોભી |
| **રમેશભાઈ (પિતા)** | `9825000003` | `password123` | સભ્ય |
| **નવા સભ્ય માટે** | *કોઈપણ ૧૦ આંકડાનો નંબર* | *તમારો પાસવર્ડ* | `📝 રજિસ્ટર બટન પરથી` |

---

## 📁 ૬. પ્રોજેક્ટ ફોલ્ડર સ્ટ્રક્ચર (Project Structure)

```text
personal/
├── backend/                  # Laravel 11 Backend API
│   ├── app/
│   │   ├── Http/Controllers/ # API Controllers (Auth, Crop, Reminder, Task, Tractor, etc.)
│   │   └── Models/          # Eloquent Models
│   ├── config/              # Configurations
│   ├── database/
│   │   ├── database.sqlite  # 🗄️ મુખ્ય ડેટાબેઝ ફાઇલ
│   │   └── migrations/      # ડેટાબેઝ ટેબલ સ્કીમા ફાઇલો
│   ├── routes/
│   │   └── api.php          # તમામ API રૂટ્સ
│   └── Dockerfile           # Render ક્લાઉડ ડિપ્લોયમેન્ટ ફાઇલ
│
├── mobile/                   # React Native / Expo Mobile App
│   ├── src/
│   │   ├── api/client.ts    # બેકએન્ડ API કનેક્શન સેટિંગ્સ
│   │   ├── screens/         # તમામ મોબાઈલ સ્ક્રીન (ખેતીવાડી, એલર્ટ્સ, ટ્રેક્ટર, ખર્ચ)
│   │   ├── components/      # કોમન કમ્પોનન્ટ્સ (હેડર, કીબોર્ડ ટૂલબાર વગેરે)
│   │   └── context/         # Auth & Language (ગુજરાતી / English) સ્ટેટ
│   └── eas.json             # Android APK Build રૂપરેખા
│
├── PROJECT_DETAILS.md        # 📖 આ મુખ્ય દસ્તાવેજ
└── PROJECT_LIVE_GUIDE.md     # લાઈવ ડિપ્લોયમેન્ટ ગાઇડ
```

---

## 💬 ૭. હવે પછીના ફેરફારો (Pending Changes List)
તમે જે જે નવા ફેરફારો (changes) કરાવવા માંગો છો તેની યાદી (list) આપો, હું તરત જ તે તમામ ફેરફારો કરી આપીશ! 🚀
