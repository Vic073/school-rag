from pathlib import Path
from pypdf import PdfReader

DATA_DIR = Path("data")

reader = PdfReader(DATA_DIR / "calender.pdf")

print(f"Pages: {len(reader.pages)}")

all_text = ""

for i, page in enumerate(reader.pages):
    text = page.extract_text()

    print(f"\n--- PAGE {i+1} ---")

    if text:
        print(f"Characters: {len(text)}")
        print(text[:500])
        all_text += f"\n--- PAGE {i+1} ---\n{text}\n"
    else:
        print("NO TEXT FOUND")
        all_text += f"\n--- PAGE {i+1} ---\n(NO TEXT FOUND)\n"

output_path = DATA_DIR / "calender.txt"
with open(output_path, "w", encoding="utf-8") as f:
    f.write(all_text)

print(f"\nSaved extracted text to {output_path}")