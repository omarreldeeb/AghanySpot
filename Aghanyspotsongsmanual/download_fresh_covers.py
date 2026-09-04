import urllib.request
import urllib.parse
import json
import os
import ssl
import time

ssl_context = ssl._create_unverified_context()
covers_dir = "/Users/omariko/Desktop/Aghanyspotsongsmanual/Songs/Covers"

songs = [
    ("Amr Diab - Borg El Hoot", "عمرو دياب برج الحوت"),
    ("Amr Diab - Ragea", "Amr Diab Ragea"),
    ("Amr Diab - Awel Kol Haga", "Amr Diab Awel Kol Haga"),
    ("Amr Diab - Khalik Maaya", "Amr Diab Khalik Maaya"),
    ("Amr Diab - Ana Mosh Anany", "Amr Diab Ana Mosh Anany"),
    ("Amr Diab - Agheeb", "Amr Diab Agheeb"),
    ("Amr Diab - Madarsh Al Nesyan", "Amr Diab Madarsh Al Nesyan"),
    ("Amr Diab - Allumak Leh", "Amr Diab Allumak Leh"),
    ("Amr Diab - Khad Alby Maah", "Amr Diab Khad Alby Maah"),
    ("Amr Diab - Lola El Banat", "Amr Diab Lola El Banat"),
    ("Amr Diab - Wahy Zekrayat", "Amr Diab Wahy Zekrayat"),
    ("Amr Diab - Aref Habibi", "Amr Diab Aref Habibi"),
    ("Amr Diab - Wayah", "Amr Diab Wayah"),
    ("Amr Diab - Makanak Fe Alby", "Amr Diab Makanak Fe Alby"),
    ("Amr Diab - Amaken El Sahar", "Amr Diab Amaken El Sahar"),
    ("Amr Diab - Maak Alby", "Amr Diab Maak Alby"),
    ("Amr Diab - Ala Hobak", "Amr Diab Ala Hobak"),
    ("Amr Diab - Khalik Fakrny", "Amr Diab Khalik Fakrny"),
    ("Amr Diab - El Alwan", "Amr Diab El Alwan"),
    ("Amr Diab - Kont Fe Baly", "Amr Diab Kont Fe Baly"),
    ("Amr Diab - Saet EL Forak", "Amr Diab Saet EL Forak"),
    ("Amr Diab - Baedt Leh", "Amr Diab Baedt Leh"),
    ("Amr Diab - Ya Hanaah", "Amr Diab Ya Hanaah"),
    ("Amr Diab - Ah Min El Foraa", "Amr Diab Ah Min El Foraa"),
    ("Amr Diab - We Maloh", "Amr Diab We Maloh"),
    ("Amr Diab - Helwa El Ayam", "Amr Diab Helwa El Ayam"),
    ("Amr Diab - Ana W Enta", "Amr Diab Ana W Enta"),
    ("Amr Diab - Waadtak", "Amr Diab Waadtak"),
    ("Amr Diab - Aghla Min Omry", "Amr Diab Aghla Min Omry"),
    ("Amr Diab - Zay Manty", "Amr Diab Zay Manty"),
    ("Amr Diab - Aks Baad", "Amr Diab Aks Baad"),
    ("Amr Diab - Getlak", "Amr Diab Getlak"),
    ("Amr Diab - Ya Habiby La", "Amr Diab Ya Habiby La"),
    ("Amr Diab - Amarain", "Amr Diab Amarain"),
    ("Amr Diab - Baed Ellayaly", "Amr Diab Baed Ellayaly"),
    ("Amr Diab - Senien", "Amr Diab Senien"),
    ("Amr Diab - Khatfoony", "Amr Diab Khatfoony"),
    ("Amr Diab - Yalla", "Amr Diab Yalla"),
    ("Amr Diab - Malish Badeel", "Amr Diab Malish Badeel"),
    ("Amr Diab - Ergalaha", "Amr Diab Ergalaha"),
    ("Amr Diab - Dayman Faker", "Amr Diab Dayman Faker"),
    ("Amr Diab - Shaif Amar", "Amr Diab Shaif Amar"),
    ("Amr Diab - Ebtadena", "Amr Diab Ebtadena"),
    ("Amr Diab - Ya Bakhto", "Amr Diab Ya Bakhto"),
    ("Amr Diab - Halawwenhom", "Amr Diab Halawwenhom"),
    ("Amr Diab - Habibty Malak", "Amr Diab Habibty Malak"),
    ("Amr Diab - Baba", "Amr Diab Baba"),
    ("Amr Diab - Matelaash", "Amr Diab Matelaash"),
    ("Amr Diab - Khabar Abyad", "Amr Diab Khabar Abyad"),
    ("Hakim - Ramadan Karim", "Hakim Ramadan Karim"),
    ("Amr Diab - Hekaytna Helwa", "عمرو دياب حكايتنا حلوة"),
    ("Amr Diab - El Kelma El Helwa", "Amr Diab El Kelma El Helwa"),
    ("Hussain Aljassmi - Ser Alsada", "حسين الجسمي سر السعادة"),
    ("Amir Eid - Ahlan W Sahlan Hayah Kareema", "امير عيد اهلا وسهلا"),
    ("Hussain Aljassmi - Khayout Min Nour Tagmana", "Hussain Aljassmi Khayout Min Nour Tagmana"),
    ("Elissa - Dazima Ala Baly", "اليسا دايما على بالي"),
    ("Mohamed Ramadan - Angham El Sa3at El Helwa Mabtekhlash", "ساعات الحلوة مابتخلصش محمد رمضان"),
    ("Hussain Aljassmi - Asmrani Eyounoh Samrah", "حسين الجسمي اسمراني عيونه سمرا"),
    ("Amr Diab - Elly Bena", "عمرو دياب اللي بينا"),
    ("Amr Diab - Shokran Min Hina Le Bokra", "عمرو دياب شكرا من هنا لبكرة"),
    ("Hussain Aljassmi - Sunnet El Hayah", "حسين الجسمي سنة الحياة"),
    ("Sabah - Halo Ya Halo Ramadan Karim", "صباح هالو يا هالو"),
    ("Hussain Aljassmi - Ramadan Fi Masr Haja Taniah", "Hussain Aljassmi Ramadan Fi Masr Haja Taniah"),
    ("Hussain Aljassmi - Etklm Kol Youm Youmin", "حسين الجسمي اتكلم كل يوم يومين"),
    ("Hussain Aljassmi - El Farq Kbeer", "حسين الجسمي الفرق كبير"),
    ("Hussain Aljassmi - Bab Rizk", "حسين الجسمي باب رزق"),
    ("Mahmoud El Esseily - Kol Sana Wadi Degla", "محمود العسيلي كل سنة وادي دجلة"),
    ("Sherine - Ekter W Akter", "شرين اكتر واكتر"),
    ("Mahmoud El Esseily - Habibi W Ibn Habibi", "محمود العسيلي حبيبي وابن حبيبي"),
    ("Ahmed Saad - Alf Mara", "احمد سعد الف مرة"),
    ("Ahmed Saad - Alf Taheya", "Ahmed Saad Alf Taheya"),
    ("Sherine - Ya Layaly", "شيرين يا ليالي"),
    ("Sherine - Kalam Eneyh", "شيرين كلام عينيه"),
    ("Sherine - Btmanna Ansak", "شيرين بتمنى انساك"),
    ("Sherine - Tabaan Tabaan", "شيرين نساي"),
    ("Sherine - Ala Bali", "شيرين على بالي"),
    ("Sherine - El Watar El Hassas", "شيرين الوتر الحساس"),
    ("Sherine - Elly Y2abel Habibi", "شيرين اللي يقابل حبيبي"),
    ("Sherine - We Meen Ekhtar", "Sherine We Meen Ekhtar"),
    ("Sherine - 3wdtny Eldonia", "Sherine 3wdtny Eldonia"),
    ("Sherine - Hams El Mashaer", "شيرين طريقي"),
    ("Sherine - Ana Fel Gharam", "Sherine Ana Fel Gharam"),
    ("Sherine - Tareky", "شيرين طريقي"),
    ("Sherine - Mathasbnesh", "شيرين ماتحاسبنيش"),
    ("Sherine - Metakhda Mel Ayam", "شيرين متأخدة من الأيام"),
    ("Sherine - Hobbo Jannah", "شيرين حبه جنة"),
    ("Sherine - Katar Khaere", "Sherine Katar Khaere"),
    ("Sherine - 2al Sa3aban 3aleh", "Sherine 2al Sa3aban 3aleh"),
    ("Sherine - Fe Leila", "شيرين في ليلة"),
    ("Sherine - Nsai", "شيرين نساي"),
    ("Sherine - Mafish Marra", "شيرين مفيش مرة")
]

headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'}

for filename, search_term in songs:
    encoded_search = urllib.parse.quote(search_term)
    url = f"https://itunes.apple.com/search?term={encoded_search}&entity=song&limit=1"
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ssl_context) as response:
            data = json.loads(response.read().decode())
            if data['resultCount'] > 0:
                artwork_url = data['results'][0]['artworkUrl100'].replace("100x100bb", "600x600bb")
                output_path = os.path.join(covers_dir, f"{filename}.jpg")
                
                with urllib.request.urlopen(artwork_url, context=ssl_context) as img_resp:
                    with open(output_path, 'wb') as f:
                        f.write(img_resp.read())
                
                print(f"✓ Square Cover Downloaded: {filename}")
            else:
                print(f"✗ Not found on iTunes: {search_term}")
    except Exception as e:
        print(f"Error fetching {search_term}: {e}")
    
    time.sleep(1.2) # Rate limit protection

