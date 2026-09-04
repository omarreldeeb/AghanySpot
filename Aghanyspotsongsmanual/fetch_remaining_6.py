import urllib.request
import urllib.parse
import json
import os
import ssl
import time

ssl_context = ssl._create_unverified_context()
covers_dir = "/Users/omariko/Desktop/Aghanyspotsongsmanual/Songs/Covers"

remaining = [
    ("Amir Eid - Ahlan W Sahlan Hayah Kareema", "Amir Eid Ahlan W Sahlan"),
    ("Elissa - Dazima Ala Baly", "Elissa Hangat Al Raia"),
    ("Sherine - Ekter W Akter", "شيرين طريقي"),
    ("Sherine - Ala Bali", "Sherine Ala Bali"),
    ("Sherine - Mathasbnesh", "Sherine Mathasbnesh"),
    ("Sherine - Katar Khaere", "شيرين كتر خيري")
]

headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'}

for filename, search_term in remaining:
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
    
    time.sleep(2) # Longer delay to avoid HTTP 403 rate limits

