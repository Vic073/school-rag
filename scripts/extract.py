from pathlib import Path
from pypdf import PdfReader

DATA_DIR = Path("data")


reader = PdfReader(DATA_DIR / "handbook.pdf")

print(f"Pages: {len(reader.pages)}")

for i, page in enumerate(reader.pages[:5]):
    text = page.extract_text()

    print(f"\n--- PAGE {i+1} ---")

    if text:
        print(f"Characters: {len(text)}")
        print(text[:300])
    else:
        print("NO TEXT FOUND")