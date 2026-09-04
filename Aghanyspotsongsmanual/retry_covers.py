import urllib.request
import urllib.parse
import json
import os
import ssl
import time

ssl_context = ssl._create_unverified_context()

covers_dir = "/Users/omariko/Desktop/Aghanyspotsongsmanual/Songs/Covers"
os.makedirs(covers_dir, exist_ok=True)

# List of only failed/rate-limited songs with improved search queries
missing_songs = [
    "Amr Diab - Borg El Hoot|عمرو دياب برج الحوت",
    "Amr Diab - Hekaytna Helwa|عمرو دياب حكايتنا حلوة",
    "Hussain Aljassmi - Ser Alsada|حسين الجسمي سر السعادة",
    "Amir Eid - Ahlan W Sahlan Hayah Kareema|امير عيد اهلا وسهلا",
    "Elissa - Dazima Ala Baly|اليسا دايما على بالي",
    "Mohamed Ramadan - Angham El Sa3at El Helwa Mabtekhlash|ساعات الحلوة مابتخلصش محمد رمضان",
    "Hussain Aljassmi - Asmrani Eyounoh Samrah|حسين الجسمي اسمراني عيونه سمرا",
    "Amr Diab - Elly Bena|عمرو دياب اللي بينا",
    "Amr Diab - Shokran Min Hina Le Bokra|عمرو دياب شكرا من هنا لبكرة",
    "Hussain Aljassmi - Sunnet El Hayah|حسين الجسمي سنة الحياة",
    "Sabah - Halo Ya Halo Ramadan Karim|صباح هالو يا هالو",
    "Hussain Aljassmi - Etklm Kol Youm Youmin|حسين الجسمي اتكلم كل يوم يومين",
    "Hussain Aljassmi - El Farq Kbeer|حسين الجسمي الفرق كبير",
    "Hussain Aljassmi - Bab Rizk|حسين الجسمي باب رزق",
    "Mahmoud El Esseily - Kol Sana Wadi Degla|محمود العسيلي كل سنة وادي دجلة",
    "Sherine - Ekter W Akter|شرين اكتر واكتر",
    "Mahmoud El Esseily - Habibi W Ibn Habibi|محمود العسيلي حبيبي وابن حبيبي",
    "Ahmed Saad - Alf Mara|احمد سعد الف مرة",
    "Sherine - Ya Layaly|شيرين يا ليالي",
    "Sherine - Kalam Eneyh|شيرين كلام عينيه",
    "Sherine - Btmanna Ansak|شيرين بتمنى انساك",
    "Sherine - Tabaan Tabaan|شيرين طبعا طبعا",
    "Sherine - Ala Bali|شيرين على بالي",
    "Sherine - El Watar El Hassas|شيرين الوتر الحساس",
    "Sherine - Elly Y2abel Habibi|شيرين اللي يقابل حبيبي",
    "Sherine - Hams El Mashaer|شيرين همس المشاعر",
    "Sherine - Tareky|شيرين طريقي",
    "Sherine - Mathasbnesh|شيرين ماتحاسبنيش",
    "Sherine - Metakhda Mel Ayam|شيرين متأخدة من الأيام",
    "Sherine - Hobbo Jannah|شيرين حبه جنة",
    "Sherine - Katar Khaere|شيرين كتر خيري",
    "Sherine - Fe Leila|شيرين في ليلة",
    "Sherine - Nsai|شيرين نساي",
    "Sherine - Mafish Marra|شيرين مفيش مرة"
]

headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

for entry in missing_songs:
    filename, search_term = entry.split("|")
    clean_filename = filename.replace("/", "_")
    encoded_search = urllib.parse.quote(search_term)
    url = f"https://itunes.apple.com/search?term={encoded_search}&entity=song&limit=1"
    
    success = False
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, context=ssl_context) as response:
                data = json.loads(response.read().decode())
                if data['resultCount'] > 0:
                    artwork_url = data['results'][0]['artworkUrl100'].replace("100x100bb", "600x600bb")
                    output_path = os.path.join(covers_dir, f"{clean_filename}.jpg")
                    
                    with urllib.request.urlopen(artwork_url, context=ssl_context) as img_resp:
                        with open(output_path, 'wb') as f:
                            f.write(img_resp.read())
                    
                    print(f"✓ Square iTunes Cover Downloaded: {clean_filename}")
                    success = True
                    break
                else:
                    print(f"✗ Not found on iTunes: {search_term}")
                    break
        except Exception as e:
            time.sleep(2)
    
    # Pause between songs to prevent 429 Rate Limiting / 403 Blocking
    time.sleep(1.5)

