import urllib.request
import urllib.parse
import json
import os
import ssl

ssl_context = ssl._create_unverified_context()

covers_dir = "/Users/omariko/Desktop/Aghanyspotsongsmanual/Songs/Covers"
os.makedirs(covers_dir, exist_ok=True)

songs = [
    "Amr Diab - Borg El Hoot|Amr Diab Borg El Hoot",
    "Amr Diab - Ragea|Amr Diab Ragea",
    "Amr Diab - Awel Kol Haga|Amr Diab Awel Kol Haga",
    "Amr Diab - Khalik Maaya|Amr Diab Khalik Maaya",
    "Amr Diab - Ana Mosh Anany|Amr Diab Ana Mosh Anany",
    "Amr Diab - Agheeb|Amr Diab Agheeb",
    "Amr Diab - Madarsh Al Nesyan|Amr Diab Madarsh Al Nesyan",
    "Amr Diab - Allumak Leh|Amr Diab Allumak Leh",
    "Amr Diab - Khad Alby Maah|Amr Diab Khad Alby Maah",
    "Amr Diab - Lola El Banat|Amr Diab Lola El Banat",
    "Amr Diab - Wahy Zekrayat|Amr Diab Wahy Zekrayat",
    "Amr Diab - Aref Habibi|Amr Diab Aref Habibi",
    "Amr Diab - Wayah|Amr Diab Wayah",
    "Amr Diab - Makanak Fe Alby|Amr Diab Makanak Fe Alby",
    "Amr Diab - Amaken El Sahar|Amr Diab Amaken El Sahar",
    "Amr Diab - Maak Alby|Amr Diab Maak Alby",
    "Amr Diab - Ala Hobak|Amr Diab Ala Hobak",
    "Amr Diab - Khalik Fakrny|Amr Diab Khalik Fakrny",
    "Amr Diab - El Alwan|Amr Diab El Alwan",
    "Amr Diab - Kont Fe Baly|Amr Diab Kont Fe Baly",
    "Amr Diab - Saet EL Forak|Amr Diab Saet EL Forak",
    "Amr Diab - Baedt Leh|Amr Diab Baedt Leh",
    "Amr Diab - Ya Hanaah|Amr Diab Ya Hanaah",
    "Amr Diab - Ah Min El Foraa|Amr Diab Ah Min El Foraa",
    "Amr Diab - We Maloh|Amr Diab We Maloh",
    "Amr Diab - Helwa El Ayam|Amr Diab Helwa El Ayam",
    "Amr Diab - Ana W Enta|Amr Diab Ana W Enta",
    "Amr Diab - Waadtak|Amr Diab Waadtak",
    "Amr Diab - Aghla Min Omry|Amr Diab Aghla Min Omry",
    "Amr Diab - Zay Manty|Amr Diab Zay Manty",
    "Amr Diab - Aks Baad|Amr Diab Aks Baad",
    "Amr Diab - Getlak|Amr Diab Getlak",
    "Amr Diab - Ya Habiby La|Amr Diab Ya Habiby La",
    "Amr Diab - Amarain|Amr Diab Amarain",
    "Amr Diab - Baed Ellayaly|Amr Diab Baed Ellayaly",
    "Amr Diab - Senien|Amr Diab Senien",
    "Amr Diab - Khatfoony|Amr Diab Khatfoony",
    "Amr Diab - Yalla|Amr Diab Yalla",
    "Amr Diab - Malish Badeel|Amr Diab Malish Badeel",
    "Amr Diab - Ergalaha|Amr Diab Ergalaha",
    "Amr Diab - Dayman Faker|Amr Diab Dayman Faker",
    "Amr Diab - Shaif Amar|Amr Diab Shaif Amar",
    "Amr Diab - Ebtadena|Amr Diab Ebtadena",
    "Amr Diab - Ya Bakhto|Amr Diab Ya Bakhto",
    "Amr Diab - Halawwenhom|Amr Diab Halawwenhom",
    "Amr Diab - Habibty Malak|Amr Diab Habibty Malak",
    "Amr Diab - Baba|Amr Diab Baba",
    "Amr Diab - Matelaash|Amr Diab Matelaash",
    "Amr Diab - Khabar Abyad|Amr Diab Khabar Abyad",
    "Hakim - Ramadan Karim|Hakim Ramadan Karim",
    "Amr Diab - Hekaytna Helwa|Amr Diab Hekaytna Helwa",
    "Amr Diab - El Kelma El Helwa|Amr Diab El Kelma El Helwa",
    "Hussain Aljassmi - Ser Alsada|Hussain Aljassmi Ser Alsada",
    "Amir Eid - Ahlan W Sahlan Hayah Kareema|Amir Eid Ahlan W Sahlan",
    "Hussain Aljassmi - Khayout Min Nour Tagmana|Hussain Aljassmi Khayout Min Nour Tagmana",
    "Elissa - Dazima Ala Baly|Elissa Dazima Ala Baly",
    "Mohamed Ramadan - Angham El Sa3at El Helwa Mabtekhlash|Mohamed Ramadan Angham El Sa3at El Helwa",
    "Hussain Aljassmi - Asmrani Eyounoh Samrah|Hussain Aljassmi Asmrani Eyounoh Samrah",
    "Amr Diab - Elly Bena|Amr Diab Elly Bena",
    "Amr Diab - Shokran Min Hina Le Bokra|Amr Diab Shokran Min Hina Le Bokra",
    "Hussain Aljassmi - Sunnet El Hayah|Hussain Aljassmi Sunnet El Hayah",
    "Sabah - Halo Ya Halo Ramadan Karim|Sabah Halo Ya Halo",
    "Hussain Aljassmi - Ramadan Fi Masr Haja Taniah|Hussain Aljassmi Ramadan Fi Masr Haja Taniah",
    "Hussain Aljassmi - Etklm Kol Youm Youmin|Hussain Aljassmi Etklm Kol Youm Youmin",
    "Hussain Aljassmi - El Farq Kbeer|Hussain Aljassmi El Farq Kbeer",
    "Hussain Aljassmi - Bab Rizk|Hussain Aljassmi Bab Rizk",
    "Mahmoud El Esseily - Kol Sana Wadi Degla|Mahmoud El Esseily Kol Sana Wadi Degla",
    "Sherine - Ekter W Akter|Sherine Ekter W Akter",
    "Mahmoud El Esseily - Habibi W Ibn Habibi|Mahmoud El Esseily Habibi W Ibn Habibi",
    "Ahmed Saad - Alf Mara|Ahmed Saad Alf Mara",
    "Ahmed Saad - Alf Taheya|Ahmed Saad Alf Taheya",
    "Sherine - Ya Layaly|Sherine Ya Layaly",
    "Sherine - Kalam Eneyh|Sherine Kalam Eneyh",
    "Sherine - Btmanna Ansak|Sherine Btmanna Ansak",
    "Sherine - Tabaan Tabaan|Sherine Tabaan Tabaan",
    "Sherine - Ala Bali|Sherine Ala Bali",
    "Sherine - El Watar El Hassas|Sherine El Watar El Hassas",
    "Sherine - Elly Y2abel Habibi|Sherine Elly Y2abel Habibi",
    "Sherine - We Meen Ekhtar|Sherine We Meen Ekhtar",
    "Sherine - 3wdtny Eldonia|Sherine 3wdtny Eldonia",
    "Sherine - Hams El Mashaer|Sherine Hams El Mashaer",
    "Sherine - Ana Fel Gharam|Sherine Ana Fel Gharam",
    "Sherine - Tareky|Sherine Tareky",
    "Sherine - Mathasbnesh|Sherine Mathasbnesh",
    "Sherine - Metakhda Mel Ayam|Sherine Metakhda Mel Ayam",
    "Sherine - Hobbo Jannah|Sherine Hobbo Jannah",
    "Sherine - Katar Khaere|Sherine Katar Khaere",
    "Sherine - 2al Sa3aban 3aleh|Sherine 2al Sa3aban 3aleh",
    "Sherine - Fe Leila|Sherine Fe Leila",
    "Sherine - Nsai|Sherine Nsai",
    "Sherine - Mafish Marra|Sherine Mafish Marra"
]

for entry in songs:
    filename, search_term = entry.split("|")
    clean_filename = filename.replace("/", "_")
    encoded_search = urllib.parse.quote(search_term)
    url = f"https://itunes.apple.com/search?term={encoded_search}&entity=song&limit=1"
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ssl_context) as response:
            data = json.loads(response.read().decode())
            if data['resultCount'] > 0:
                artwork_url = data['results'][0]['artworkUrl100'].replace("100x100bb", "600x600bb")
                output_path = os.path.join(covers_dir, f"{clean_filename}.jpg")
                
                with urllib.request.urlopen(artwork_url, context=ssl_context) as img_resp:
                    with open(output_path, 'wb') as f:
                        f.write(img_resp.read())
                
                print(f"✓ Square iTunes Cover: {clean_filename}")
            else:
                print(f"✗ Not found on iTunes: {search_term}")
    except Exception as e:
        print(f"Error fetching {search_term}: {e}")

