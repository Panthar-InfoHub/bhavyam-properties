import os

file_path = r'c:\PantharInfoHub2nd\bhavyam-properties\app\web\app\(dashboard)\user\page.tsx'

with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if 'Saved Properties' in line and 'icon:' in line:
        new_lines.append("                { label: 'Saved Properties', value: stats.favorites, icon: '❤️', href: '/user/favorites', color: 'text-rose-500' },\n")
    elif 'Browse Properties' in line and 'icon:' in line:
        new_lines.append("                  { label: 'Browse Properties', icon: '🏠', href: '/properties' },\n")
    elif 'My Favorites' in line and 'icon:' in line:
        if '/user/favorites' in line:
            new_lines.append("                  { label: 'My Favorites',      icon: '❤️', href: '/user/favorites' },\n")
        else:
            new_lines.append(line)
    else:
        new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Fixed encoding issues.")
