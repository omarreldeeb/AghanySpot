import os
import re

base_dir = "/Users/omariko/Desktop/Aghanyspotsongsmanual"
songs_dir = os.path.join(base_dir, "Songs")
covers_dir = os.path.join(base_dir, "Songs", "Covers")

def normalize_name(filename):
    # Remove file extension
    name, _ = os.path.splitext(filename)
    # Remove common extra tags
    name = re.sub(r'\(.*?\)', '', name)
    name = re.sub(r'\[.*?\]', '', name)
    # Normalize spacing and convert to lowercase for comparison
    name = re.sub(r'[\s_\-]+', ' ', name).strip().lower()
    return name

def cleanup_duplicates(directory, label):
    if not os.path.exists(directory):
        return
    
    files = [f for f in os.listdir(directory) if os.path.isfile(os.path.join(directory, f))]
    groups = {}

    for f in files:
        norm = normalize_name(f)
        groups.setdefault(norm, []).append(f)

    removed_count = 0
    for norm, original_files in groups.items():
        if len(original_files) > 1:
            # Sort files to prefer cleaner standard names (shorter, no special characters/Arabic if English standard exists)
            # Standard "Artist - Song.ext" formats will be preferred
            original_files.sort(key=lambda x: (len(x), '(' in x, 'Official' in x))
            
            keep_file = original_files[0]
            delete_files = original_files[1:]

            print(f"[{label}] Keeping: {keep_file}")
            for df in delete_files:
                file_to_remove = os.path.join(directory, df)
                os.remove(file_to_remove)
                print(f"  └─ Deleted Duplicate: {df}")
                removed_count += 1

    print(f"\n✓ Cleaned up {removed_count} duplicate {label} files.\n")

print("--- Starting Deduplication ---\n")
cleanup_duplicates(covers_dir, "Covers")
cleanup_duplicates(songs_dir, "Songs")
print("--- Deduplication Complete ---")

