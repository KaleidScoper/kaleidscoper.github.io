import re, sys
html = open(sys.argv[1], encoding="utf-8", errors="replace").read()
txt = open(sys.argv[2], encoding="utf-8", errors="replace").read()
# strip tags/scripts for a crude text view
body = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", html)
body = re.sub(r"(?s)<[^>]+>", " ", body)
body = re.sub(r"&nbsp;?", " ", body)
plain = body.replace("\\n", "\n")
keys = ["Upstream Refusals", "Downstream Blocking", "safety reasoning model",
        "87.3", "77.2", "96.1", "3.9", "99.1", "87.5", "12.5", "99.2",
        "Safe Completions", "C2PA", "watermark", "3112", "6944", "685", "464"]
print("HTML chars:", len(html), "| visible-text chars:", len(plain))
print(f"{'KEY':<24} {'PDF':>6} {'HTML':>6}")
for k in keys:
    print(f"{k:<24} {('YES' if k in txt else 'no'):>6} {('YES' if k in plain or k in html else 'no'):>6}")
