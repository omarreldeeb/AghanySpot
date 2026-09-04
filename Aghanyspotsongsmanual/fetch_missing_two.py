import urllib.request
import urllib.parse
import json
import os
import ssl

ssl_context = ssl._create_unverified_context()
covers_dir = "/Users/omariko/Desktop/Aghanyspotsongsmanual/Songs/Covers"

targets = [
    {
        "filename": "Bahawel Akhtelef by Husayn and LAI بحاول اختلف حسين لائي hard 2020s.jpg",
        "queries": ["Husayn Bahawel Akhtelef", "بحاول اختلف حسين", "Bahawel Akhtelef"]
    },
    {
        "filename": "Yadoom El Aman by Bahaa Sultan يدوم الأمان بهاء سلطان medium 2020s.jpg",
        "queries": ["Bahaa Sultan Yadoom El Aman", "يدوم الأمان بهاء سلطان", "Yadoom El Aman"]
    }
]

for item in targets:
    output_path = os.path.join(covers_dir, item["filename"])
    success = False
    
    for query in item["queries"]:
        encoded = urllib.parse.quote(query)
        url = f"https://itunes.apple.com/search?term={encoded}&entity=song&limit=1"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, context=ssl_context) as resp:
                data = json.loads(resp.read().decode())
                if data['resultCount'] > 0:
                    img_url = data['results'][0]['artworkUrl100'].replace("100x100bb", "600x600bb")
                    with urllib.request.urlopen(img_url, context=ssl_context) as img_resp:
                        with open(output_path, 'wb') as f:
                            f.write(img_resp.read())
                    print(f"✓ Downloaded cover for: {item['filename']}")
                    success = True
                    break
        except Exception as e:
            pass
            
    if not success:
        print(f"✗ Could not find artwork for: {item['filename']}")

