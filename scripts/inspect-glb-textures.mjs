import fs from 'node:fs';
import path from 'node:path';

function readUInt32LE(buffer, offset) {
	return buffer.readUInt32LE(offset);
}

function parseGlb(filePath) {
	const data = fs.readFileSync(filePath);
	if (data.byteLength < 12) throw new Error('File too small to be a GLB');

	const magic = readUInt32LE(data, 0);
	const version = readUInt32LE(data, 4);
	const length = readUInt32LE(data, 8);

	if (magic !== 0x46546c67) throw new Error('Not a GLB (bad magic)');
	if (version !== 2) throw new Error(`Unsupported GLB version: ${version}`);
	if (length !== data.byteLength) {
		// If it differs, still try parsing; some tools may write this oddly.
	}

	let offset = 12;
	let jsonChunk = null;
	let binChunkByteLength = 0;
	const chunks = [];

	while (offset + 8 <= data.byteLength) {
		const chunkLength = readUInt32LE(data, offset);
		const chunkType = readUInt32LE(data, offset + 4);
		offset += 8;
		if (offset + chunkLength > data.byteLength) break;
		const chunkData = data.subarray(offset, offset + chunkLength);
		offset += chunkLength;
		chunks.push({ chunkLength, chunkType, chunkData });

		// JSON
		if (chunkType === 0x4e4f534a) {
			jsonChunk = chunkData.toString('utf8');
		}
		// BIN
		if (chunkType === 0x004e4942) {
			binChunkByteLength = chunkLength;
		}
	}

	if (!jsonChunk) throw new Error('No JSON chunk found in GLB');
	let gltf;
	try {
		gltf = JSON.parse(jsonChunk);
	} catch (e) {
		throw new Error(`Failed to parse JSON chunk: ${e?.message ?? String(e)}`);
	}

	return { gltf, binChunkByteLength, chunksCount: chunks.length, glbBytes: data };
}

function getImageSignature(glbBytes, bufferViews, img) {
	const bufferViewIndex = Number.isInteger(img?.bufferView) ? img.bufferView : null;
	if (bufferViewIndex == null) return null;
	const bv = bufferViews[bufferViewIndex];
	if (!bv) return null;
	const byteOffset = Number.isInteger(bv.byteOffset) ? bv.byteOffset : 0;
	const byteLength = Number.isInteger(bv.byteLength) ? bv.byteLength : 0;
	if (byteLength < 12) return null;

	// In GLB, BIN chunk begins after headers; but bufferView byteOffset is relative to the BIN chunk.
	// We can't easily know BIN chunk start without tracking it; however, for signature checks we can
	// scan for the first occurrence of a valid header near the end. To keep this simple and robust,
	// we return null here and compute signature during parse where we know BIN chunk start.
	return { byteOffset, byteLength };
}

function summarizeGltf(gltf, extras) {
	const images = Array.isArray(gltf.images) ? gltf.images : [];
	const textures = Array.isArray(gltf.textures) ? gltf.textures : [];
	const materials = Array.isArray(gltf.materials) ? gltf.materials : [];
	const bufferViews = Array.isArray(gltf.bufferViews) ? gltf.bufferViews : [];
	const samplers = Array.isArray(gltf.samplers) ? gltf.samplers : [];
	const extensionsUsed = Array.isArray(gltf.extensionsUsed) ? gltf.extensionsUsed : [];

	const imageSummaries = images.map((img, i) => {
		const name = img?.name ?? null;
		const mimeType = img?.mimeType ?? null;
		const uri = img?.uri ?? null;
		const bufferViewIndex = Number.isInteger(img?.bufferView) ? img.bufferView : null;
		const bufferViewByteLength =
			bufferViewIndex != null && bufferViews[bufferViewIndex]
				? bufferViews[bufferViewIndex].byteLength ?? null
				: null;
		const sigInfo = extras?.binChunkStartOffset != null ? getEmbeddedImageSignature(extras, bufferViews, img) : null;

		return {
			index: i,
			name,
			mimeType,
			uri,
			bufferView: bufferViewIndex,
			bufferViewByteLength,
			signature: sigInfo?.signature ?? null,
		};
	});

	function materialTextureRefs(mat) {
		const pbr = mat?.pbrMetallicRoughness;
		const refs = [];
		const pushRef = (slot, texInfo) => {
			const idx = texInfo?.index;
			if (Number.isInteger(idx)) refs.push({ slot, textureIndex: idx });
		};
		pushRef('baseColorTexture', pbr?.baseColorTexture);
		pushRef('metallicRoughnessTexture', pbr?.metallicRoughnessTexture);
		pushRef('normalTexture', mat?.normalTexture);
		pushRef('occlusionTexture', mat?.occlusionTexture);
		pushRef('emissiveTexture', mat?.emissiveTexture);
		return refs;
	}

	const materialSummaries = materials.map((m, i) => {
		const name = m?.name ?? null;
		const alphaMode = m?.alphaMode ?? null;
		const doubleSided = Boolean(m?.doubleSided);
		const texRefs = materialTextureRefs(m);
		return { index: i, name, alphaMode, doubleSided, textureRefs: texRefs };
	});

	const textureSummaries = textures.map((t, i) => {
		const source = Number.isInteger(t?.source) ? t.source : null;
		const sampler = Number.isInteger(t?.sampler) ? t.sampler : null;
		const sourceMime = source != null && images[source] ? images[source]?.mimeType ?? null : null;
		const sourceUri = source != null && images[source] ? images[source]?.uri ?? null : null;
		const extWebpSource = Number.isInteger(t?.extensions?.EXT_texture_webp?.source)
			? t.extensions.EXT_texture_webp.source
			: null;
		const extWebpMime = extWebpSource != null && images[extWebpSource] ? images[extWebpSource]?.mimeType ?? null : null;
		const extWebpUri = extWebpSource != null && images[extWebpSource] ? images[extWebpSource]?.uri ?? null : null;
		return {
			index: i,
			source,
			sampler,
			sourceMime,
			sourceUri,
			extWebpSource,
			extWebpMime,
			extWebpUri,
		};
	});

	return {
		extensionsUsed,
		counts: {
			images: images.length,
			textures: textures.length,
			materials: materials.length,
			bufferViews: bufferViews.length,
			samplers: samplers.length,
		},
		images: imageSummaries,
		textures: textureSummaries,
		materials: materialSummaries,
	};
}

function getEmbeddedImageSignature(extras, bufferViews, img) {
	const bufferViewIndex = Number.isInteger(img?.bufferView) ? img.bufferView : null;
	if (bufferViewIndex == null) return null;
	const bv = bufferViews[bufferViewIndex];
	if (!bv) return null;
	const byteOffset = Number.isInteger(bv.byteOffset) ? bv.byteOffset : 0;
	const byteLength = Number.isInteger(bv.byteLength) ? bv.byteLength : 0;
	if (byteLength < 12) return null;

	const start = extras.binChunkStartOffset + byteOffset;
	const end = start + Math.min(byteLength, 32);
	if (start < 0 || end > extras.glbBytes.byteLength) return null;
	const head = extras.glbBytes.subarray(start, end);

	const isPng = head.length >= 8 && head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47;
	const isJpg = head.length >= 3 && head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
	const isWebp =
		head.length >= 12 &&
		head[0] === 0x52 &&
		head[1] === 0x49 &&
		head[2] === 0x46 &&
		head[3] === 0x46 &&
		head[8] === 0x57 &&
		head[9] === 0x45 &&
		head[10] === 0x42 &&
		head[11] === 0x50;

	let signature = 'unknown';
	if (isWebp) signature = 'WEBP';
	else if (isPng) signature = 'PNG';
	else if (isJpg) signature = 'JPEG';

	return { signature };
}

function printSummary(filePath, parsed) {
	const { gltf, binChunkByteLength, chunksCount, glbBytes } = parsed;
	const binChunkStartOffset = findBinChunkStart(glbBytes);
	const summary = summarizeGltf(gltf, { glbBytes, binChunkStartOffset });
	console.log('='.repeat(80));
	console.log(path.relative(process.cwd(), filePath));
	console.log(`chunks: ${chunksCount} | binChunkBytes: ${binChunkByteLength}`);
	console.log(`extensionsUsed: ${summary.extensionsUsed.join(', ') || '(none)'}`);
	console.log(
		`counts: images=${summary.counts.images} textures=${summary.counts.textures} materials=${summary.counts.materials}`
	);

	if (summary.counts.images === 0 && summary.counts.textures === 0) {
		console.log('No images/textures found in glTF JSON. Likely no textures embedded.');
		return;
	}

	if (summary.counts.images > 0) {
		console.log('\nIMAGES:');
		for (const img of summary.images) {
			console.log(
				`- [${img.index}] mime=${img.mimeType ?? '(none)'} sig=${img.signature ?? '(n/a)'} uri=${
					img.uri ?? '(embedded)'
				} bufferView=${
					img.bufferView ?? '(none)'
				} bytes=${img.bufferViewByteLength ?? '(n/a)'} name=${img.name ?? ''}`
			);
		}
	}

	if (summary.counts.textures > 0) {
		console.log('\nTEXTURES:');
		for (const t of summary.textures) {
			console.log(
				`- [${t.index}] source=${t.source ?? '(none)'} mime=${t.sourceMime ?? '(none)'} uri=${
					t.sourceUri ?? '(embedded)'
				} | EXT_webp.source=${t.extWebpSource ?? '(none)'} mime=${t.extWebpMime ?? '(none)'} sampler=${
					t.sampler ?? '(none)'
				}`
			);
		}
	}

	if (summary.counts.materials > 0) {
		console.log('\nMATERIALS (texture refs):');
		for (const m of summary.materials) {
			const refs = m.textureRefs.map((r) => `${r.slot}:${r.textureIndex}`).join(', ');
			console.log(`- [${m.index}] ${m.name ?? ''} refs=${refs || '(none)'}`);
		}
	}
}

function findBinChunkStart(glbBytes) {
	// GLB: 12 byte header, then chunks. We locate the first BIN chunk and return the offset
	// to its data payload (after 8 byte chunk header).
	let offset = 12;
	while (offset + 8 <= glbBytes.byteLength) {
		const chunkLength = glbBytes.readUInt32LE(offset);
		const chunkType = glbBytes.readUInt32LE(offset + 4);
		const dataStart = offset + 8;
		if (chunkType === 0x004e4942) return dataStart;
		offset = dataStart + chunkLength;
	}
	return null;
}

const inputs = process.argv.slice(2);
if (inputs.length === 0) {
	console.error('Usage: node scripts/inspect-glb-textures.mjs <path-to.glb> [more.glb...]');
	process.exit(2);
}

let hadError = false;
for (const input of inputs) {
	const filePath = path.resolve(process.cwd(), input);
	try {
		const parsed = parseGlb(filePath);
		printSummary(filePath, parsed);
	} catch (e) {
		hadError = true;
		console.log('='.repeat(80));
		console.log(path.relative(process.cwd(), filePath));
		console.error(`ERROR: ${e?.message ?? String(e)}`);
	}
}

process.exit(hadError ? 1 : 0);
