import os
import re

covers_dir = "/Users/omariko/Desktop/Aghanyspotsongsmanual/Songs/Covers"

def normalize_title(filename):
    name, _ = os.path.splitext(filename)
    # Strip parenthetical metadata, bracketed text, and non-alphanumeric noise
    name = re.sub(r'\(.*?\)', '', name)
    name = re.sub(r'\[.*?\]', '', name)
    # Remove Arabic characters to align clean English names with old mixed names
    name = re.sub(r'[\u0600-\u06FF]', '', name)
    # Clean whitespace and lowercase
    name = re.sub(r'[\s_\-]+', ' ', name).strip().lower()
    return name

if os.path.exists(covers_dir):
    files = [f for f in os.listdir(covers_dir) if os.path.isfile(os.path.join(covers_dir, f))]
    groups = {}

    for f in files:
        norm = normalize_title(f)
        groups.setdefault(norm, []).append(f)

    deleted_count = 0
    for norm, file_list in groups.items():
        if len(file_list) > 1:
            # Sort files: prefer short, clean names (e.g. "Artist - Song.jpg") over messy ones with extra tags
            file_list.sort(key=lambda x: (
                '(' in x or '[' in x,               # Penalize parenthetical tags
                bool(re.search(r'[\u0600-\u06FF]', x)), # Penalize extra inline Arabic strings
                len(x)                             # Prefer shorter clean filenames
            ))
            
            keep_file = file_list[0]
            remove_files = file_list[1:]

            print(f"✓ Keeping Official iTunes Cover: {keep_file}")
            for rf in remove_files:
                file_path = os.path.join(covers_dir, rf)
                os.remove(file_path)
                print(f"  └─ Removed Old Cover: {rf}")
                deleted_count += 1

    print(f"\nSuccessfully removed {deleted_count} old duplicate covers.")
    print(f"Total remaining covers: {len(os.listdir(covers_dir))}")

