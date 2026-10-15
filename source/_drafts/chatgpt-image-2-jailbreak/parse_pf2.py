import json, glob, os
p = r"D:\CodexWorkSpace\MRP-Calculator\osint-chatgpt-image-jailbreak"
rows = {}
for f in sorted(glob.glob(os.path.join(p, "pf-*.json"))):
    try: j = json.load(open(f, encoding="utf-8"))
    except Exception: continue
    for e in j.get("entries", []):
        rows[e.get("id")] = e
# show all keys of one entry to find date/url fields
k = list(rows)[0]
print("KEYS:", sorted(rows[k].keys()))
print()
for cid, e in sorted(rows.items()):
    pub = e.get("publishedAt") or e.get("published") or e.get("date") or ""
    upd = e.get("updatedAt") or e.get("updated") or ""
    src = e.get("primarySourceUrl") or e.get("sourceUrl") or e.get("url") or ""
    pt  = e.get("paperTitle") or ""
    print("%-42s | %-10s | %-10s | %s" % (cid, str(pub)[:10], str(upd)[:10], str(src)[:60]))
    print("    paper: %s" % str(pt)[:130])
