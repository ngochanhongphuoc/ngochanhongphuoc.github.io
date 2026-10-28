#!/usr/bin/env python3
"""Tạo lại musicplay/party/list.json: danh sách file nhạc (và .lrc) trong thư mục này.
Trang /musicplay đọc file này để hiện nhóm "Nhạc tiệc" (repo private nên không dùng được GitHub API).
Chạy mỗi khi thêm, bớt hoặc đổi tên file nhạc:  python3 musicplay/party/update-list.py
"""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
KEEP = re.compile(r"\.(mp3|m4a|aac|wav|ogg|oga|opus|flac|webm|lrc)$", re.I)
names = sorted(n for n in os.listdir(HERE) if KEEP.search(n) and not n.startswith("."))
with open(os.path.join(HERE, "list.json"), "w", encoding="utf-8") as f:
    json.dump(names, f, ensure_ascii=False, indent=1)
print(len(names), "file ->", os.path.join(HERE, "list.json"))
