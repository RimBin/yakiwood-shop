import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const JSON_CHUNK_TYPE = 0x4e4f534a; // 'JSON'
const BIN_CHUNK_TYPE = 0x004e4942; // 'BIN\0'

function padTo4(n) {
	return (n + 3) & ~3;
}

function parseGlbBytes(glbBytes) {
	if (glbBytes.byteLength < 12) throw new Error('File too small');
	const magic = glbBytes.readUInt32LE(0);
	const version = glbBytes.readUInt32LE(4);
	const length = glbBytes.readUInt32LE(8);
	if (magic !== 0x46546c67) throw new Error('Not a GLB');
	if (version !== 2) throw new Error(`Unsupported GLB version: ${version}`);
	if (length !== glbBytes.byteLength) {
		// tolerate
	}

	let offset = 12;
	let json = null;
	let bin = Buffer.alloc(0);
	let binChunkStart = null;

	while (offset + 8 <= glbBytes.byteLength) {
		const chunkLength = glbBytes.readUInt32LE(offset);
		const chunkType = glbBytes.readUInt32LE(offset + 4);
		const dataStart = offset + 8;
		const dataEnd = dataStart + chunkLength;
		if (dataEnd > glbBytes.byteLength) break;
		const chunkData = glbBytes.subarray(dataStart, dataEnd);

		if (chunkType === JSON_CHUNK_TYPE) {
			json = chunkData.toString('utf8');
		} else if (chunkType === BIN_CHUNK_TYPE) {
			binChunkStart = dataStart;
			bin = Buffer.from(chunkData);
		}

		offset = dataEnd;
	}

	if (!json) throw new Error('Missing JSON chunk');
	const gltf = JSON.parse(json);

	return { gltf, bin, binChunkStart };
}

function buildGlbBytes(gltf, bin) {
	const jsonString = JSON.stringify(gltf);
	const jsonBytes = Buffer.from(jsonString, 'utf8');
	const jsonPaddedLength = padTo4(jsonBytes.length);
	const jsonPadding = Buffer.alloc(jsonPaddedLength - jsonBytes.length, 0x20);
	const jsonChunkData = Buffer.concat([jsonBytes, jsonPadding]);

	const binPaddedLength = padTo4(bin.length);
	const binPadding = Buffer.alloc(binPaddedLength - bin.length, 0x00);
	const binChunkData = Buffer.concat([bin, binPadding]);

	const totalLength = 12 + 8 + jsonChunkData.length + 8 + binChunkData.length;
	const out = Buffer.alloc(totalLength);

	// Header
	out.writeUInt32LE(0x46546c67, 0); // glTF
	out.writeUInt32LE(2, 4);
	out.writeUInt32LE(totalLength, 8);

	let offset = 12;
	// JSON chunk
	out.writeUInt32LE(jsonChunkData.length, offset);
	out.writeUInt32LE(JSON_CHUNK_TYPE, offset + 4);
	jsonChunkData.copy(out, offset + 8);
	offset += 8 + jsonChunkData.length;

	// BIN chunk
	out.writeUInt32LE(binChunkData.length, offset);
	out.writeUInt32LE(BIN_CHUNK_TYPE, offset + 4);
	binChunkData.copy(out, offset + 8);

	return out;
}

function removeFromArray(arr, value) {
	if (!Array.isArray(arr)) return arr;
	return arr.filter((x) => x !== value);
}

async function convertOne(filePath, { overwrite }) {
	const abs = path.resolve(process.cwd(), filePath);
	if (!fs.existsSync(abs)) throw new Error(`File not found: ${filePath}`);

	const originalBytes = fs.readFileSync(abs);
	const { gltf, bin } = parseGlbBytes(originalBytes);

	if (!Array.isArray(gltf.images) || gltf.images.length === 0) {
		console.log(`[skip] ${filePath}: no images[]`);
		return { changed: false, reason: 'no images' };
	}
	if (!Array.isArray(gltf.bufferViews) || !Array.isArray(gltf.buffers) || !gltf.buffers[0]) {
		throw new Error('Invalid glTF: missing buffers/bufferViews');
	}

	// 1) Fix texture references: EXT_texture_webp → texture.source
	let touchedTextures = 0;
	if (Array.isArray(gltf.textures)) {
		for (const tex of gltf.textures) {
			const extSource = tex?.extensions?.EXT_texture_webp?.source;
			if (Number.isInteger(extSource)) {
				if (!Number.isInteger(tex.source)) tex.source = extSource;
				if (tex.extensions && tex.extensions.EXT_texture_webp) {
					delete tex.extensions.EXT_texture_webp;
					if (Object.keys(tex.extensions).length === 0) delete tex.extensions;
				}
				touchedTextures++;
			}
		}
	}

	// 2) Convert embedded WEBP images to embedded PNG appended to BIN.
	let extraBin = Buffer.alloc(0);
	let convertedImages = 0;

	for (const img of gltf.images) {
		if (img?.mimeType !== 'image/webp') continue;
		if (!Number.isInteger(img.bufferView)) continue;
		const bv = gltf.bufferViews[img.bufferView];
		if (!bv) continue;

		const byteOffset = Number.isInteger(bv.byteOffset) ? bv.byteOffset : 0;
		const byteLength = Number.isInteger(bv.byteLength) ? bv.byteLength : 0;
		if (byteLength <= 0) continue;
		if (byteOffset + byteLength > bin.length) continue;

		const webpBytes = bin.subarray(byteOffset, byteOffset + byteLength);
		const pngBytes = await sharp(webpBytes).png().toBuffer();

		// 4-byte alignment inside BIN
		const alignedOffset = padTo4(extraBin.length);
		if (alignedOffset !== extraBin.length) {
			extraBin = Buffer.concat([extraBin, Buffer.alloc(alignedOffset - extraBin.length, 0x00)]);
		}
		const newByteOffset = bin.length + extraBin.length;
		extraBin = Buffer.concat([extraBin, pngBytes]);

		// Append a new bufferView pointing at the PNG bytes
		const newBufferViewIndex = gltf.bufferViews.length;
		gltf.bufferViews.push({
			buffer: 0,
			byteOffset: newByteOffset,
			byteLength: pngBytes.length,
		});

		img.bufferView = newBufferViewIndex;
		img.mimeType = 'image/png';
		if ('uri' in img) delete img.uri;
		convertedImages++;
	}

	if (convertedImages === 0 && touchedTextures === 0) {
		console.log(`[skip] ${filePath}: nothing to convert`);
		return { changed: false, reason: 'no webp conversions' };
	}

	// 3) Remove extension usage metadata
	gltf.extensionsUsed = removeFromArray(gltf.extensionsUsed, 'EXT_texture_webp');
	gltf.extensionsRequired = removeFromArray(gltf.extensionsRequired, 'EXT_texture_webp');

	const newBin = Buffer.concat([bin, extraBin]);
	gltf.buffers[0].byteLength = newBin.length;

	const outBytes = buildGlbBytes(gltf, newBin);

	const bakPath = abs + '.bak';
	if (!fs.existsSync(bakPath)) fs.copyFileSync(abs, bakPath);
	const outPath = overwrite ? abs : abs.replace(/\.glb$/i, '.png.glb');
	fs.writeFileSync(outPath, outBytes);

	console.log(
		`[ok] ${path.relative(process.cwd(), outPath)} | convertedImages=${convertedImages} textureRefsFixed=${touchedTextures}`
	);

	return { changed: true, outPath, convertedImages, touchedTextures };
}

const args = process.argv.slice(2);
const overwrite = args.includes('--overwrite');
const inputs = args.filter((a) => !a.startsWith('--'));

if (inputs.length === 0) {
	console.error('Usage: node scripts/convert-glb-webp-to-png.mjs [--overwrite] <file.glb> [more.glb...]');
	process.exit(2);
}

let hadError = false;
for (const input of inputs) {
	try {
		// eslint-disable-next-line no-await-in-loop
		await convertOne(input, { overwrite });
	} catch (e) {
		hadError = true;
		console.error(`[err] ${input}: ${e?.message ?? String(e)}`);
	}
}

process.exit(hadError ? 1 : 0);
