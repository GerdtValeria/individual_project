from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = Path(__file__).resolve().parent
IMG_DIR = BASE_DIR / "app" / "static" / "img"
IMG_DIR.mkdir(parents=True, exist_ok=True)

def make_placeholder(path: Path, text: str, size=(800, 600)):
    img = Image.new("RGB", size, color=(230, 230, 230))
    draw = ImageDraw.Draw(img)

def main():
    for rent_id in range(1, 101):
        for i in range(1, 6):
            filename = f"rent_{rent_id}_image_{i}.jpg"
            path = IMG_DIR / filename
            if not path.exists():
                make_placeholder(path, f"Rent {rent_id} #{i}")

if __name__ == "__main__":
    main()
