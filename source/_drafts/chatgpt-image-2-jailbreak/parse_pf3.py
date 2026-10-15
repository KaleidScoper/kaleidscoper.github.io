import json, glob, os
p = r"D:\CodexWorkSpace\MRP-Calculator\osint-chatgpt-image-jailbreak"
rows = {}
for f in sorted(glob.glob(os.path.join(p, "pf-*.json"))):
    try: j = json.load(open(f, encoding="utf-8"))
    except Exception: continue
    for e in j.get("entries", []):
        rows[e.get("slug")] = e
print("TOTAL UNIQUE:", len(rows))
print()
for cid, e in sorted(rows.items(), key=lambda kv: str(kv[1].get("paperDate") or ""), reverse=True):
    mods = e.get("affectedModels") or []
    if isinstance(mods, list): mods = ", ".join(str(m) for m in mods)
    print("%-40s | %s" % (cid, str(e.get("paperDate"))[:10]))
    print("    title : %s" % str(e.get("title"))[:120])
    print("    paper : %s" % str(e.get("paperTitle"))[:130])
    print("    url   : %s" % str(e.get("paperUrl"))[:110])
    print("    models: %s" % str(mods)[:220])
    print("    cve   : %s | evidence=%s | analyzed=%s" % (e.get("cveId"), e.get("hasDedicatedEvidence"), str(e.get("analysisDate"))[:10]))
