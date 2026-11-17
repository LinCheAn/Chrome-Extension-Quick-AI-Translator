"""Generate the extension icons (public/icons/icon-{16,32,48,128}.png).

Run: python3 scripts/make_icons.py   (needs Pillow; uses macOS system fonts)
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

S = 1024  # draw large, then downsample
OUT = Path(__file__).resolve().parent.parent / "public" / "icons"
ACCENT_TOP, ACCENT_BOTTOM = (112, 138, 164), (78, 100, 124)  # Mist Blue accent
SOFT = (221, 229, 237)
WHITE = (255, 255, 255)
INK = (78, 100, 124)

LATIN = "/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf"
CJK = "/System/Library/Fonts/Hiragino Sans GB.ttc"


def rounded_mask(size, box, r):
    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).rounded_rectangle(box, r, fill=255)
    return m


def draw_glyph(img, text, font_path, font_index, size, center, color):
    font = ImageFont.truetype(font_path, size, index=font_index)
    d = ImageDraw.Draw(img)
    l, t, r, b = d.textbbox((0, 0), text, font=font)
    d.text((center[0] - (l + r) / 2, center[1] - (t + b) / 2), text, font=font, fill=color)


def make_master():
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))

    # Background: vertical gradient in a rounded square
    grad = Image.new("RGBA", (S, S))
    gd = ImageDraw.Draw(grad)
    for y in range(S):
        t = y / (S - 1)
        gd.line([(0, y), (S, y)], fill=tuple(round(a + (b - a) * t) for a, b in zip(ACCENT_TOP, ACCENT_BOTTOM)))
    img.paste(grad, (0, 0), rounded_mask((S, S), (24, 24, S - 24, S - 24), 230))

    # Back card: "A"
    back = (150, 150, 610, 610)
    img.paste(Image.new("RGBA", (S, S), SOFT), (0, 0), rounded_mask((S, S), back, 110))
    draw_glyph(img, "A", LATIN, 0, 330, ((back[0] + back[2]) / 2, (back[1] + back[3]) / 2 - 10), INK)

    # Front card with soft shadow: "文"
    front = (414, 414, 874, 874)
    shadow = Image.new("RGBA", (S, S), (20, 30, 45, 0))
    shadow.putalpha(rounded_mask((S, S), (front[0] - 6, front[1] + 16, front[2] + 6, front[3] + 26), 110).point(lambda v: v * 90 // 255))
    img.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(18)))
    img.paste(Image.new("RGBA", (S, S), WHITE), (0, 0), rounded_mask((S, S), front, 110))
    draw_glyph(img, "文", CJK, 1, 320, ((front[0] + front[2]) / 2, (front[1] + front[3]) / 2), INK)

    # Clip everything to the rounded background
    img.putalpha(Image.composite(img.getchannel("A"), Image.new("L", (S, S), 0), rounded_mask((S, S), (24, 24, S - 24, S - 24), 230)))
    return img


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    master = make_master()
    for size in (16, 32, 48, 128):
        master.resize((size, size), Image.LANCZOS).save(OUT / f"icon-{size}.png")
    master.resize((512, 512), Image.LANCZOS).save(OUT / "icon-512.png")
    print("wrote", OUT)


if __name__ == "__main__":
    main()
