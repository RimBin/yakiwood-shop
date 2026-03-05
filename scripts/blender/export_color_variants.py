"""Batch-export GLB variants per color from a .blend file.

Usage (Windows PowerShell):
  blender --background path\to\scene.blend --python scripts/blender/export_color_variants.py -- \
    --wood larch --model terrace --outputDir public/models/products \
    --texturesDir public/assets/finishes/larch

Notes:
- This script swaps ONLY the Base Color image for the main wood materials.
- It tries to avoid changing materials whose name contains 'bottom' or 'end_grain'.
- If your textures are WEBP, Blender may export GLB with EXT_texture_webp.
  You can post-process with the repo script:
    node scripts/convert-glb-webp-to-png.mjs input.glb output.glb
"""

from __future__ import annotations

import argparse
import os
import sys
from typing import Iterable, Optional

try:
    import bpy  # type: ignore
except Exception as e:  # pragma: no cover
    raise RuntimeError("This script must be run inside Blender (bpy not available)") from e


DEFAULT_COLORS = [
    "black",
    "carbon",
    "carbon-light",
    "graphite",
    "natural",
    "dark-brown",
    "latte",
    "silver",
]


def _parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(add_help=False)

    parser.add_argument("--wood", required=True, choices=["larch", "spruce"], help="Wood key")
    parser.add_argument("--model", required=True, help="Model key used in filename (e.g. terrace, facade)")
    parser.add_argument("--outputDir", required=True, help="Output directory for GLBs")
    parser.add_argument("--texturesDir", required=True, help="Directory containing per-color textures")
    parser.add_argument("--colors", nargs="*", default=DEFAULT_COLORS, help="Color slugs")

    # Blender passes args like: blender ... --python script.py -- <args>
    if "--" in argv:
        argv = argv[argv.index("--") + 1 :]
    else:
        argv = []

    return parser.parse_args(argv)


def _looks_fixed_material(name: str) -> bool:
    token = (name or "").lower()
    return (
        "bottom" in token
        or "end_grain" in token
        or "end grain" in token
        or "end-grain" in token
    )


def _iter_main_wood_materials() -> Iterable["bpy.types.Material"]:
    for mat in bpy.data.materials:
        if not mat or not mat.use_nodes:
            continue
        if _looks_fixed_material(mat.name):
            continue
        yield mat


def _find_base_color_image_node(mat: "bpy.types.Material") -> Optional["bpy.types.Node"]:
    nodes = mat.node_tree.nodes  # type: ignore
    links = mat.node_tree.links  # type: ignore

    principled = None
    for node in nodes:
        if node.type == "BSDF_PRINCIPLED":
            principled = node
            break
    if not principled:
        return None

    base_input = principled.inputs.get("Base Color")
    if not base_input or not base_input.is_linked:
        return None

    # Follow the first link to a texture image node.
    from_node = base_input.links[0].from_node
    if from_node and from_node.type == "TEX_IMAGE":
        return from_node

    # If it's not directly linked, try to find any image node upstream (one hop).
    if from_node:
        for inp in getattr(from_node, "inputs", []):
            if inp.is_linked:
                upstream = inp.links[0].from_node
                if upstream and upstream.type == "TEX_IMAGE":
                    return upstream

    # Fallback: first image texture node in material.
    for node in nodes:
        if node.type == "TEX_IMAGE":
            return node

    return None


def _load_image(path: str) -> "bpy.types.Image":
    # Reuse already-loaded images by filepath if possible.
    abspath = os.path.abspath(path)
    for img in bpy.data.images:
        if img and os.path.abspath(bpy.path.abspath(img.filepath)) == abspath:
            return img
    return bpy.data.images.load(abspath)


def _texture_path(textures_dir: str, wood: str, color: str) -> str:
    filename = f"shou-sugi-ban-{wood}-{color}-facade-terrace-cladding.webp"
    return os.path.join(textures_dir, filename)


def _export_glb(filepath: str) -> None:
    os.makedirs(os.path.dirname(filepath), exist_ok=True)

    # Use mostly defaults; GLB will embed images by nature of the container.
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format="GLB",
    )


def main() -> None:
    args = _parse_args(sys.argv)

    wood = args.wood
    model = args.model
    output_dir = args.outputDir
    textures_dir = args.texturesDir
    colors: list[str] = list(args.colors or [])

    if not colors:
        raise SystemExit("No colors provided")

    # Identify target nodes once.
    targets = []
    for mat in _iter_main_wood_materials():
        node = _find_base_color_image_node(mat)
        if node is None:
            continue
        targets.append((mat, node))

    if not targets:
        raise SystemExit(
            "No target materials found. Ensure wood materials use nodes and have a Base Color image texture."
        )

    # Remember original images.
    original = []
    for mat, node in targets:
        original.append((mat, node, getattr(node, "image", None)))

    for color in colors:
        tex_path = _texture_path(textures_dir, wood, color)
        if not os.path.exists(tex_path):
            print(f"[export_color_variants] missing texture: {tex_path}")
            continue

        img = _load_image(tex_path)
        for mat, node in targets:
            node.image = img

        out_name = f"{wood}-{model}-{color}.glb"
        out_path = os.path.join(output_dir, out_name)
        print(f"[export_color_variants] exporting {out_path}")
        _export_glb(out_path)

    # Restore original images.
    for mat, node, img in original:
        node.image = img

    print("[export_color_variants] done")


if __name__ == "__main__":
    main()
