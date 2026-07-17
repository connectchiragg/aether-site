"""Prepare the CC BY All Seeing Eye scene for the Aether website.

Run with Blender:
  blender --background <AllSeeing.blend> --python scripts/process-eye.py -- \
    <output.glb> <poster.png>

The source .blend remains untouched. This script relinks the bundled environment
texture, removes the original ocean environment, preserves the eye's original
material-slot structure, adapts its native red metals and glow to Aether's exact
palette, writes attribution into the exported glTF extras, and renders the
static fallback poster.
"""

from __future__ import annotations

import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector


EYE_OBJECTS = {
    "11010101",
    "0101010111",
    "000111",
    "0010111010",
    "1.001",
    "1.0110",
    "1",
}


def hex_rgba(value: str) -> tuple[float, float, float, float]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) / 255 for i in (0, 2, 4)) + (1.0,)


def look_at(obj: bpy.types.Object, target: Vector) -> None:
    obj.rotation_euler = (target - obj.location).to_track_quat("-Z", "Y").to_euler()


def srgb_rgba(value: str) -> tuple[float, float, float, float]:
    """Convert a CSS sRGB hex color to Blender's scene-linear color space."""
    components = hex_rgba(value)
    linear = tuple(
        channel / 12.92 if channel <= 0.04045 else ((channel + 0.055) / 1.055) ** 2.4
        for channel in components[:3]
    )
    return linear + (1.0,)


def tune_original_material(
    source_name: str,
    export_name: str,
    color: str,
    *,
    metallic: float,
    roughness: float,
    emission: str | None = None,
    strength: float = 0.0,
) -> bpy.types.Material:
    mat = bpy.data.materials[source_name]
    mat.name = export_name
    for node in mat.node_tree.nodes:
        if node.type != "BSDF_PRINCIPLED":
            continue
        node.inputs["Base Color"].default_value = srgb_rgba(color)
        node.inputs["Metallic"].default_value = metallic
        node.inputs["Roughness"].default_value = roughness
        if emission:
            node.inputs["Emission Color"].default_value = srgb_rgba(emission)
            node.inputs["Emission Strength"].default_value = strength
    return mat


def prepare_scene() -> list[bpy.types.Object]:
    # The archive bundles the original environment image at a different path
    # from the artist's machine. Relink it before removing the web-unneeded
    # ocean environment so the source scene remains faithfully reconstructable.
    texture_path = Path(bpy.data.filepath).parent.parent / "textures" / "GoldenSunrise.jpeg"
    sunrise = bpy.data.images.get("GoldenSunrise.jpg")
    if sunrise and texture_path.exists():
        relinked = bpy.data.images.load(str(texture_path), check_existing=False)
        relinked.name = "GoldenSunrise (relinked)"
        for mat in bpy.data.materials:
            if not mat.use_nodes:
                continue
            for node in mat.node_tree.nodes:
                if node.type == "TEX_IMAGE" and node.image == sunrise:
                    node.image = relinked
        bpy.data.images.remove(sunrise)

    selected: list[bpy.types.Object] = []
    for obj in list(bpy.context.scene.objects):
        if obj.name in EYE_OBJECTS:
            selected.append(obj)
        else:
            bpy.data.objects.remove(obj, do_unlink=True)

    # Preserve the artist's original material assignments and response: the
    # source already uses dark red metal and a red emissive signal. Only the
    # specific colors and web-safe glow strength are adapted to Aether.
    tune_original_material(
        "Material",
        "Aether Red Metal",
        "#AE2620",
        metallic=1.0,
        roughness=0.46,
    )
    tune_original_material(
        "redmat 2",
        "Aether Deep Red Metal",
        "#4F0B09",
        metallic=1.0,
        roughness=0.53,
    )
    tune_original_material(
        "Glow",
        "Aether Signal Glow",
        "#DE3C2F",
        metallic=0.0,
        roughness=0.48,
        emission="#DE3C2F",
        strength=8.0,
    )

    for obj in selected:
        if obj.type != "MESH":
            continue
        if obj.name in {"0101010111", "000111", "0010111010"}:
            # These three linked globe layers dominate the rendered triangle
            # count. A restrained reduction keeps the silhouette intact while
            # bringing the assembled hero below the ~100k triangle budget.
            bpy.context.view_layer.objects.active = obj
            obj.select_set(True)
            decimate = obj.modifiers.new("Aether Web Decimation", "DECIMATE")
            decimate.ratio = 0.88
            bpy.ops.object.modifier_apply(modifier=decimate.name)
            obj.select_set(False)
    root = bpy.data.objects.new("Aether_All_Seeing_Eye", None)
    bpy.context.scene.collection.objects.link(root)
    root["title"] = "The All Seeing Eye"
    root["creator"] = "The WarVet"
    root["source"] = "https://sketchfab.com/3d-models/the-all-seeing-eye-eba076cbdee94f2f9d399d95267f6ade"
    root["license"] = "CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/"
    root["changes"] = "Environment removed; geometry optimized; original material slots retained; native red metals, glow, and lighting adapted to Aether; exported to glTF."
    for obj in selected:
        world = obj.matrix_world.copy()
        obj.parent = root
        obj.matrix_world = world
    selected.append(root)
    return selected


def add_light(name: str, kind: str, color: str, energy: float, location: tuple[float, float, float], size: float = 5):
    data = bpy.data.lights.new(name, kind)
    data.color = hex_rgba(color)[:3]
    data.energy = energy
    if kind == "AREA":
        data.shape = "DISK"
        data.size = size
    light = bpy.data.objects.new(name, data)
    bpy.context.scene.collection.objects.link(light)
    light.location = location
    look_at(light, Vector((0, 0, 20)))
    return light


def render_poster(output: Path) -> None:
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 1120
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.film_transparent = True
    scene.render.filepath = str(output)
    scene.render.image_settings.color_mode = "RGBA"

    camera_data = bpy.data.cameras.new("Aether Camera")
    camera_data.lens = 56
    camera = bpy.data.objects.new("Aether Camera", camera_data)
    bpy.context.scene.collection.objects.link(camera)
    bounds = [
        obj.matrix_world @ Vector(corner)
        for obj in scene.objects
        if obj.type == "MESH" and obj.name in EYE_OBJECTS
        for corner in obj.bound_box
    ]
    eye_center = Vector(
        tuple((min(point[index] for point in bounds) + max(point[index] for point in bounds)) / 2 for index in range(3))
    )
    camera.location = eye_center + Vector((4.8, -8.7, 1.7))
    look_at(camera, eye_center)
    scene.camera = camera

    add_light("Primary Red Rim", "AREA", "#ae2620", 1150, (-8, -7, 28), 8)
    add_light("Signal Red Key", "AREA", "#de3c2f", 1050, (10, -10, 24), 7)
    add_light("Bone Fill", "AREA", "#e9e2d4", 520, (2, 8, 18), 9)

    world = scene.world or bpy.data.worlds.new("Aether World")
    scene.world = world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = srgb_rgba("#0a0807")
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.08

    output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.render.render(write_still=True)


def export_glb(objects: list[bpy.types.Object], output: Path) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[-1]
    output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=str(output),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_extras=True,
        export_lights=False,
        export_cameras=False,
        export_animations=False,
        export_meshopt_compression_enable=True,
        export_meshopt_extension="EXT_meshopt_compression",
    )


def main() -> None:
    try:
        marker = sys.argv.index("--")
        glb_path = Path(sys.argv[marker + 1]).resolve()
        poster_path = Path(sys.argv[marker + 2]).resolve()
    except (ValueError, IndexError) as exc:
        raise SystemExit("Expected: -- <output.glb> <poster.png>") from exc

    objects = prepare_scene()
    render_poster(poster_path)
    export_glb(objects, glb_path)
    print(f"Wrote {glb_path}")
    print(f"Wrote {poster_path}")


if __name__ == "__main__":
    main()
