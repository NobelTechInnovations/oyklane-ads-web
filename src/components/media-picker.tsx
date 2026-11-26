'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/api/client';
import { assetFileUrl, uploadAsset } from '@/api/assets';
import { errorText, unwrap } from '@/api/request';
import type { Asset, Page } from '@/api/types';
import { Banner, Button } from '@/ui';

/** Loads the media library, newest first. */
export function useLibrary(accountId: string) {
  const [items, setItems] = useState<Asset[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    unwrap<Page<Asset>>(
      api.GET('/v1/ad-accounts/{accountId}/assets', { params: { path: { accountId }, query: { limit: 100 } } }),
    )
      .then((page) => setItems(page.items))
      .catch((caught) => setError(errorText(caught)))
      .finally(() => setLoading(false));
  }, [accountId]);
  return { items, setItems, error, setError, loading };
}

/** "Upload" button that sends each chosen file in turn and reports progress. */
export function UploadButton(props: { accountId: string; onUploaded: (asset: Asset) => void; onError: (message: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState('');
  const upload = async (files: FileList | null) => {
    const list = Array.from(files ?? []);
    for (const [index, file] of list.entries()) {
      setProgress(`Uploading ${index + 1} of ${list.length}…`);
      try {
        props.onUploaded(await uploadAsset(props.accountId, file));
      } catch (caught) {
        props.onError(`${file.name}: ${errorText(caught)}`);
      }
    }
    setProgress('');
    if (input.current) input.current.value = '';
  };
  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(event) => void upload(event.target.files)}
      />
      <Button variant="primary" disabled={progress !== ''} onClick={() => input.current?.click()}>
        {progress || 'Upload images'}
      </Button>
    </>
  );
}

export function Thumbnail(props: { accountId: string; asset: Asset; selected?: boolean; onClick?: () => void; note?: string }) {
  const errors = props.asset.issues.filter((i) => i.severity === 'error').length;
  const warnings = props.asset.issues.length - errors;
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={
        'cursor-pointer overflow-hidden rounded-lg border text-left ' +
        (props.selected ? 'border-brand ring-2 ring-brand' : 'border-line hover:border-mute')
      }
    >
      <img src={assetFileUrl(props.accountId, props.asset, 'square')} alt="" className="aspect-square w-full bg-soft object-cover" />
      <span className="block px-2 py-1.5 text-[13px]">
        <span className="block truncate font-medium">{props.asset.name}</span>
        <span className="text-mute">
          {props.asset.width} × {props.asset.height}
          {errors ? <span className="text-danger"> · {errors} problem{errors > 1 ? 's' : ''}</span> : null}
          {!errors && warnings ? <span className="text-warn"> · {warnings} tip{warnings > 1 ? 's' : ''}</span> : null}
          {props.note ? ' · ' + props.note : null}
        </span>
      </span>
    </button>
  );
}

/** Library grid where up to `max` images are chosen, in order. Upload adds and selects. */
export function MediaPicker(props: { accountId: string; selected: Asset[]; max: number; onChange: (assets: Asset[]) => void }) {
  const library = useLibrary(props.accountId);
  const isChosen = (asset: Asset) => props.selected.some((a) => a.id === asset.id);
  const toggle = (asset: Asset) => {
    if (isChosen(asset)) props.onChange(props.selected.filter((a) => a.id !== asset.id));
    else if (props.selected.length < props.max) props.onChange([...props.selected, asset]);
    else library.setError(`You can use up to ${props.max} images in this ad.`);
  };
  return (
    <div>
      {library.error ? <Banner tone="danger">{library.error}</Banner> : null}
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-sm text-mute">
          {props.selected.length} of {props.max} chosen
        </span>
        <UploadButton
          accountId={props.accountId}
          onError={library.setError}
          onUploaded={(asset) => {
            library.setItems((items) => [asset, ...items.filter((a) => a.id !== asset.id)]);
            if (!isChosen(asset) && props.selected.length < props.max) props.onChange([...props.selected, asset]);
          }}
        />
      </div>
      {library.loading ? <p className="text-mute">Loading…</p> : null}
      {!library.loading && library.items.length === 0 ? <p className="text-mute">No images yet. Upload one to start.</p> : null}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {library.items.map((asset) => (
          <Thumbnail key={asset.id} accountId={props.accountId} asset={asset} selected={isChosen(asset)} onClick={() => toggle(asset)} />
        ))}
      </div>
    </div>
  );
}
