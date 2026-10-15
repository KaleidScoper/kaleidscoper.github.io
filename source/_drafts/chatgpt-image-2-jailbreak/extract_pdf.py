import sys
from pypdf import PdfReader
src, dst = sys.argv[1], sys.argv[2]
r = PdfReader(src)
out = []
for i, p in enumerate(r.pages):
    try:
        t = p.extract_text() or ""
    except Exception as e:
        t = "[EXTRACT_ERROR page %d: %s]" % (i, e)
    out.append("\n===== PAGE %d =====\n" % (i+1) + t)
open(dst, "w", encoding="utf-8").write("".join(out))
print("pages:", len(r.pages), "chars:", sum(len(x) for x in out))
