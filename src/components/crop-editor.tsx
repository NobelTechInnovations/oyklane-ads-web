'use client';

import { useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { api } from '@/api/client';
import { assetFileUrl, centreCrop, RATIO_LABELS, shapeOf } from '@/api/assets';
import { errorText, unwrap } from '@/api/request';
import type { Asset, Crop, Ratio } from '@/api/types';
import { Banner, Button, Tabs } from '@/ui';

const BOX_WIDTH = 560;
const BOX_HEIGHT = 420;
const MIN_CROP_SIDE = 100;
const LABEL_TO_RATIO = Object.fromEntries(Object.entries(RATIO_LABELS).map(([ratio, label]) => [label, ratio])) as Record<string, Ratio>;

/** Move and zoom the crop for each shape on top of the original image. */
export function CropEditor(props: { accountId: string; asset: Asset; onSaved: (asset: Asset) => void; readOnly?: boolean }) {
  const { asset } = props;
  const [ratio, setRatio] = useState<Ratio>('square');
  const [crops, setCrops] = useState(
    () => Object.fromEntries(asset.variants.map((v) => [v.ratio, v.crop])) as Record<Ratio, Crop>,
  );
  const [changed, setChanged] = useState<Ratio[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const drag = useRef<{ x: number; y: number; crop: Crop } | null>(null);

  const scale = Math.min(BOX_WIDTH / asset.width, BOX_HEIGHT / asset.height);
  const crop = crops[ratio];
  const largest = centreCrop(asset.width, asset.height, ratio);
  const maxZoom = Math.max(1, Math.min(largest.width, largest.height) / MIN_CROP_SIDE);
  const zoom = largest.width / crop.width;

  const place = (next: Crop) => {
    const clamped = {
      ...next,
      left: Math.round(Math.min(Math.max(0, next.left), asset.width - next.width)),
      top: Math.round(Math.min(Math.max(0, next.top), asset.height - next.height)),
    };
    setCrops({ ...crops, [ratio]: clamped });
    if (!changed.includes(ratio)) setChanged([...changed, ratio]);
  };
  const setZoom = (value: number) => {
    const width = Math.max(1, Math.round(largest.width / value));
    const height = Math.max(1, Math.round(width / shapeOf(ratio)));
    const centreX = crop.left + crop.width / 2;
    const centreY = crop.top + crop.height / 2;
    place({ left: centreX - width / 2, top: centreY - height / 2, width, height });
  };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (props.readOnly) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, crop };
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    if (!start) return;
    place({
      ...start.crop,
      left: start.crop.left + (event.clientX - start.x) / scale,
      top: start.crop.top + (event.clientY - start.y) / scale,
    });
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const saved = await unwrap<Asset>(
        api.PATCH('/v1/ad-accounts/{accountId}/assets/{id}', {
          params: { path: { accountId: props.accountId, id: asset.id } },
          body: { crops: Object.fromEntries(changed.map((r) => [r, crops[r]])) },
        }),
      );
      setChanged([]);
      props.onSaved(saved);
    } catch (caught) {
      setError(errorText(caught));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {error ? <Banner tone="danger">{error}</Banner> : null}
      <div className="mb-3">
        <Tabs items={Object.values(RATIO_LABELS)} active={RATIO_LABELS[ratio]} onChange={(label) => setRatio(LABEL_TO_RATIO[label]!)} />
      </div>
      <div
        className="relative mx-auto select-none overflow-hidden rounded-lg bg-soft"
        style={{ width: asset.width * scale, height: asset.height * scale }}
      >
        <img src={assetFileUrl(props.accountId, asset, 'original')} alt="" draggable={false} className="h-full w-full" />
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={() => (drag.current = null)}
          className={'absolute border-2 border-white ' + (props.readOnly ? '' : 'cursor-move')}
          style={{
            left: crop.left * scale,
            top: crop.top * scale,
            width: crop.width * scale,
            height: crop.height * scale,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
          }}
        />
      </div>
      <div className="mx-auto mt-4 flex max-w-[560px] flex-wrap items-center gap-4">
        <label className="flex flex-1 items-center gap-3 text-sm">
          Zoom
          <input
            type="range"
            min={1}
            max={maxZoom}
            step={0.01}
            value={zoom}
            disabled={props.readOnly || maxZoom === 1}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="flex-1 accent-brand"
          />
        </label>
        <span className="text-sm text-mute">
          {crop.width} × {crop.height} px
        </span>
        {props.readOnly ? null : (
          <Button variant="primary" disabled={changed.length === 0 || saving} onClick={save}>
            {saving ? 'Saving…' : 'Save crops'}
          </Button>
        )}
      </div>
      <p className="mt-2 text-center text-[13px] text-mute">Drag the box to choose what shows in the {RATIO_LABELS[ratio]} shape.</p>
    </div>
  );
}
