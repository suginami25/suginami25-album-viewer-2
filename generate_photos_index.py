#!/usr/bin/env python3
# ===============================================================
# Suginami25 Album Viewer Utility Script
# Script: generate_photos_index.py
# Purpose:
#   photo_data 以下のフォルダ構造から photos_index.js を自動生成する。
#   「写真ファイルが格納されているフォルダ」を1グループとして扱い、
#   カテゴリ毎にグループと写真リストを構成する。
#
# Project Root (example):
#   /Users/yoichiamano/Library/CloudStorage/OneDrive-個人用/
#     同期会_写真アーカイブ/CopyData_for _Album_Viewer_for_GitHub/
#     suginami25-album-viewer
#
# Note:
#   ・このスクリプトは、自身の位置から見た相対パスで photo_data を参照する。
#     プロジェクトを他の場所にコピーしても、フォルダ構造が同じなら動作する。
#
# Created: 2025-11-18 (JST)
# Version: 1.1.0
# Author: ChatGPT + Yoichi Amano
# ===============================================================

import os
import json
from pathlib import Path


# 画像として扱う拡張子
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".JPG", ".JPEG", ".png", ".PNG"}


def is_image_file(filename: str) -> bool:
    """拡張子で画像かどうかを判定する。"""
    return Path(filename).suffix in IMAGE_EXTENSIONS


def main() -> None:
    # このスクリプトが置かれているディレクトリを基準に動く
    script_dir = Path(__file__).resolve().parent
    photo_root = script_dir / "photo_data"

    if not photo_root.is_dir():
        raise SystemExit(f"[ERROR] photo_data directory not found: {photo_root}")

    categories = {}

    # photo_data 直下のフォルダを「カテゴリ」として扱う
    for category_dir in sorted(photo_root.iterdir()):
        if not category_dir.is_dir():
            continue

        category_name = category_dir.name
        groups = []

        # カテゴリ配下を再帰的に探索
        # ルール：
        #   「そのフォルダ直下に1枚以上画像があるフォルダ」＝ group
        #   → 階層が深くてもOK。フォルダ名がそのまま group.name になる。
        for current_dir, _, files in os.walk(category_dir):
            image_files = [f for f in files if is_image_file(f)]
            if not image_files:
                continue

            current_path = Path(current_dir)
            group_name = current_path.name  # 最下位フォルダ名を group 名にする

            # 画像ファイル名でソート
            image_files_sorted = sorted(image_files)

            photos = []
            for filename in image_files_sorted:
                file_path = current_path / filename
                # script_dir からの相対パスにして "../photo_data/..." 形式にする
                rel_path = os.path.relpath(file_path, script_dir)
                rel_path_with_prefix = os.path.join("..", rel_path)

                photos.append(
                    {
                        "path": rel_path_with_prefix.replace("\\", "/"),
                        "filename": filename,
                    }
                )

            groups.append(
                {
                    "name": group_name,
                    "photos": photos,
                }
            )

        categories[category_name] = {
            "groups": groups,
        }

    photos_index = {
        "categories": categories,
    }

    output_path = script_dir / "photos_index.js"

    js_content = (
        "const PHOTOS_INDEX = "
        + json.dumps(photos_index, ensure_ascii=False, indent=2)
        + ";\n\nwindow.PHOTOS_INDEX = PHOTOS_INDEX;\n"
    )

    output_path.write_text(js_content, encoding="utf-8")
    print(f"Wrote {output_path}")


if __name__ == "__main__":
    main()