import json, glob, os
rows = {}
for f in sorted(glob.glob(os.path.join(r"D:\CodexWorkSpace\MRP-Calculator\osint-chatgpt-image-jailbreak", "pf-*.json"))):
    try:
        j = json.load(open(f, encoding="utf-8"))
    except Exception as e:
        print("ERR", f, e); continue
    for e in j.get("entries", []):
        cid = e.get("id") or e.get("catalogId") or e.get("slug")
        rows[cid] = e
print("UNIQUE ENTRIES:", len(rows))
for cid, e in rows.items():
    print("-" * 90)
    print("ID       :", cid)
    for k in ("title","publishedAt","published","sourceType","source","severity","topics","tags","models","affectedSystems","paperTitle","primarySourceUrl","url","identifier"):
        if k in e and e[k]:
            v = e[k]
            if isinstance(v, list): v = ", ".join(str(x) for x in v)
            print("%-9s: %s" % (k, str(v)[:400]))
    desc = e.get("description") or e.get("summary") or ""
    if desc: print("desc     :", desc[:500].replace("\n"," "))
