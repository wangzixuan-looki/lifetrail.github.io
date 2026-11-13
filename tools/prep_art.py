from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "tools" / "raw"
OUT = ROOT / "assets" / "art"
WIDTHS = {"trail": 1500, "hotpot": 900, "desk": 900, "gym": 900, "fan": 900}
WHITE, PAD = 240, 16


def prep(name):
    image = Image.open(RAW / f"{name}.png").convert("RGB")
    red, green, blue = image.split()
    darkest = ImageChops.darker(ImageChops.darker(red, green), blue)
    white = ImageOps.expand(darkest.point(lambda v: 255 if v >= WHITE else 0), 1, 255)
    ImageDraw.floodfill(white, (0, 0), 128)
    outside = white.crop((1, 1, white.width - 1, white.height - 1)).point(lambda v: 255 if v == 128 else 0)
    alpha = ImageChops.invert(outside.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(1.2)))
    image.putalpha(alpha)
    left, top, right, bottom = alpha.point(lambda v: 255 if v > 8 else 0).getbbox()
    image = image.crop((max(0, left - PAD), max(0, top - PAD), min(image.width, right + PAD), min(image.height, bottom + PAD)))
    width = WIDTHS[name]
    image = image.resize((width, round(image.height * width / image.width)), Image.LANCZOS)
    target = OUT / f"{name}.webp"
    image.save(target, "WEBP", quality=86, method=6)
    print(target.name, image.size, target.stat().st_size // 1024, "KB")


OUT.mkdir(parents=True, exist_ok=True)
for name in WIDTHS:
    prep(name)
