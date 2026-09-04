import os
import json
import re

songs_dir = "/Users/omariko/Desktop/Aghanyspotsongsmanual/Songs"
covers_dir = "/Users/omariko/Desktop/Aghanyspotsongsmanual/Songs/Covers"
output_json = "/Users/omariko/Desktop/Aghanyspotsongsmanual/Songs/songs.json"

METADATA_MAP = {
    # Amr Diab
    "borg el hoot": {"title_ar": "برج الحوت", "artist_ar": "عمرو دياب", "artist_en": "Amr Diab", "era": "2010s", "difficulty": "Easy"},
    "ragea": {"title_ar": "راجع", "artist_ar": "عمرو دياب", "artist_en": "Amr Diab", "era": "1990s", "difficulty": "Medium"},
    "awel kol haga": {"title_ar": "أول كل حاجة", "artist_ar": "عمرو دياب", "artist_en": "Amr Diab", "era": "2010s", "difficulty": "Easy"},
    "khalik maaya": {"title_ar": "خليك معايا", "artist_ar": "عمرو دياب", "artist_en": "Amr Diab", "era": "2000s", "difficulty": "Easy"},
    "ana mosh anany": {"title_ar": "أنا مش أناني", "artist_ar": "عمرو دياب", "artist_en": "Amr Diab", "era": "2010s", "difficulty": "Medium"},
    "agheeb": {"title_ar": "أغيب", "artist_ar": "عمرو دياب", "artist_en": "Amr Diab", "era": "2000s", "difficulty": "Hard"},
    "madarsh al nesyan": {"title_ar": "ماقدرش على النسيان", "artist_ar": "عمرو دياب", "artist_en": "Amr Diab", "era": "2010s", "difficulty": "Medium"},
    "allumak leh": {"title_ar": "ألومك ليه", "artist_ar": "عمرو دياب", "artist_en": "Amr Diab", "era": "2010s", "difficulty": "Easy"},
    "wayah": {"title_ar": "وياه", "artist_ar": "عمرو دياب", "artist_en": "Amr Diab", "era": "2000s", "difficulty": "Easy"},
    "amaken el sahar": {"title_ar": "أماكن السهر", "artist_ar": "عمرو دياب", "artist_en": "Amr Diab", "era": "2020s", "difficulty": "Easy"},
    "maak alby": {"title_ar": "معاك قلبي", "artist_ar": "عمرو دياب", "artist_en": "Amr Diab", "era": "2010s", "difficulty": "Easy"},
    "zay manty": {"title_ar": "زي ما أنتِ", "artist_ar": "عمرو دياب", "artist_en": "Amr Diab", "era": "2020s", "difficulty": "Medium"},
    "aks baad": {"title_ar": "عكس بعض", "artist_ar": "عمرو دياب", "artist_en": "Amr Diab", "era": "2010s", "difficulty": "Easy"},
    "amarain": {"title_ar": "قمرين", "artist_ar": "عمرو دياب", "artist_en": "Amr Diab", "era": "1990s", "difficulty": "Easy"},
    "hekaytna helwa": {"title_ar": "حكايتنا حلوة", "artist_ar": "عمرو دياب", "artist_en": "Amr Diab", "era": "2020s", "difficulty": "Medium"},
    "el kelma el helwa": {"title_ar": "الكلمة الحلوة", "artist_ar": "عمرو دياب", "artist_en": "Amr Diab", "era": "2020s", "difficulty": "Easy"},
    "shokran min hina le bokra": {"title_ar": "شكراً من هنا لبكرة", "artist_ar": "عمرو دياب", "artist_en": "Amr Diab", "era": "2020s", "difficulty": "Easy"},
    
    # Sherine
    "kalam eneyh": {"title_ar": "كلام عينيه", "artist_ar": "شيرين", "artist_en": "Sherine", "era": "2010s", "difficulty": "Easy"},
    "btmanna ansak": {"title_ar": "بتمنى أنساك", "artist_ar": "شيرين", "artist_en": "Sherine", "era": "2020s", "difficulty": "Medium"},
    "tabaan tabaan": {"title_ar": "طبعاً طبعاً", "artist_ar": "شيرين", "artist_en": "Sherine", "era": "2010s", "difficulty": "Medium"},
    "ala bali": {"title_ar": "على بالي", "artist_ar": "شيرين", "artist_en": "Sherine", "era": "2000s", "difficulty": "Easy"},
    "el watar el hassas": {"title_ar": "الوتر الحساس", "artist_ar": "شيرين", "artist_en": "Sherine", "era": "2010s", "difficulty": "Easy"},
    "elly y2abel habibi": {"title_ar": "اللي يقابل حبيبي", "artist_ar": "شيرين", "artist_en": "Sherine", "era": "2020s", "difficulty": "Easy"},
    "we meen ekhtar": {"title_ar": "ومين اختار", "artist_ar": "شيرين", "artist_en": "Sherine", "era": "2010s", "difficulty": "Medium"},
    "hobbo jannah": {"title_ar": "حبه جنة", "artist_ar": "شيرين", "artist_en": "Sherine", "era": "2010s", "difficulty": "Easy"},
    "nsai": {"title_ar": "نساي", "artist_ar": "شيرين", "artist_en": "Sherine", "era": "2010s", "difficulty": "Easy"},

    # Hussain Aljassmi
    "ser alsada": {"title_ar": "سر السعادة", "artist_ar": "حسين الجسمي", "artist_en": "Hussain Aljassmi", "era": "2020s", "difficulty": "Easy"},
    "sunnet el hayah": {"title_ar": "سنة الحياة", "artist_ar": "حسين الجسمي", "artist_en": "Hussain Aljassmi", "era": "2020s", "difficulty": "Easy"},
    "ramadan fi masr haja taniah": {"title_ar": "رمضان في مصر حاجة تانية", "artist_ar": "حسين الجسمي", "artist_en": "Hussain Aljassmi", "era": "2020s", "difficulty": "Easy"},
    "el farq kbeer": {"title_ar": "الفرق كبير", "artist_ar": "حسين الجسمي", "artist_en": "Hussain Aljassmi", "era": "2020s", "difficulty": "Medium"},

    # Other Artists
    "ramadan karim": {"title_ar": "رمضان كريم", "artist_ar": "حكيم", "artist_en": "Hakim", "era": "2010s", "difficulty": "Easy"},
    "ahlan w sahlan": {"title_ar": "أهلاً وسهلاً", "artist_ar": "أمير عيد", "artist_en": "Amir Eid", "era": "2020s", "difficulty": "Medium"},
    "angham el sa3at el helwa": {"title_ar": "الساعات الحلوة مابتخلصش", "artist_ar": "محمد رمضان", "artist_en": "Mohamed Ramadan", "era": "2020s", "difficulty": "Easy"},
    "halo ya halo": {"title_ar": "هالو يا هالو", "artist_ar": "صباح", "artist_en": "Sabah", "era": "1960s", "difficulty": "Hard"},
    "kol sana wadi degla": {"title_ar": "كل سنة وادي دجلة", "artist_ar": "محمود العسيلي", "artist_en": "Mahmoud El Esseily", "era": "2020s", "difficulty": "Medium"},
    "alf mara": {"title_ar": "ألف مرة", "artist_ar": "أحمد سعد", "artist_en": "Ahmed Saad", "era": "2020s", "difficulty": "Medium"}
}

catalog = []
song_files = [f for f in os.listdir(songs_dir) if f.endswith('.mp3')]

for song_file in song_files:
    clean_name = os.path.splitext(song_file)[0]
    
    if " - " in clean_name:
        artist_en, title_en = clean_name.split(" - ", 1)
    else:
        artist_en, title_en = "Various", clean_name

    title_key = title_en.lower().strip()
    match = None
    for k in METADATA_MAP:
        if k in title_key:
            match = METADATA_MAP[k]
            break

    cover_filename = f"{clean_name}.jpg"
    cover_exists = os.path.exists(os.path.join(covers_dir, cover_filename))

    song_entry = {
        "id": re.sub(r'[^a-zA-Z0-9]', '_', clean_name.lower()),
        "title_en": title_en.strip(),
        "title_ar": match["title_ar"] if match else title_en.strip(),
        "artist_en": match["artist_en"] if match else artist_en.strip(),
        "artist_ar": match["artist_ar"] if match else artist_en.strip(),
        "era": match["era"] if match else "2020s",
        "difficulty": match["difficulty"] if match else "Medium",
        "audio_file": f"./Songs/{song_file}",
        "cover_file": f"./Songs/Covers/{cover_filename}" if cover_exists else "./Songs/Covers/default.jpg"
    }
    catalog.append(song_entry)

with open(output_json, 'w', encoding='utf-8') as f:
    json.dump(catalog, f, ensure_ascii=False, indent=2)

print(f"✓ Created catalog at /Songs/songs.json with {len(catalog)} entries.")
