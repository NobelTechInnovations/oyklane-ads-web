'use client';

import { useState } from 'react';
import { useAccount } from '@/api/account';
import { api } from '@/api/client';
import { errorText, unwrap } from '@/api/request';
import type { Asset } from '@/api/types';
import { CropEditor } from '@/components/crop-editor';
import { Thumbnail, UploadButton, useLibrary } from '@/components/media-picker';
import { Banner, Button, Field, Modal, PageHeader, TextInput } from '@/ui';

export default function MediaPage() {
  const { accountId, canEdit } = useAccount();
  const library = useLibrary(accountId);
  const [open, setOpen] = useState<Asset | null>(null);

  const show = async (asset: Asset) => {
    setOpen(asset);
    try {
      setOpen(
        await unwrap<Asset>(
          api.GET('/v1/ad-accounts/{accountId}/assets/{id}', { params: { path: { accountId, id: asset.id } } }),
        ),
      );
    } catch (caught) {
      library.setError(errorText(caught));
    }
  };
  const replace = (asset: Asset) => {
    library.setItems((items) => (asset.archived ? items.filter((a) => a.id !== asset.id) : items.map((a) => (a.id === asset.id ? asset : a))));
    setOpen(asset.archived ? null : { ...asset, usedBy: open?.usedBy ?? [] });
  };

  return (
    <>
      <PageHeader
        title="Media"
        subtitle="Images for your ads. Each one is cut to 1:1, 4:5, 1.91:1 and 9:16; adjust any crop."
        actions={
          canEdit ? (
            <UploadButton
              accountId={accountId}
              onError={library.setError}
              onUploaded={(asset) => library.setItems((items) => [asset, ...items.filter((a) => a.id !== asset.id)])}
            />
          ) : null
        }
      />
      {library.error ? <Banner tone="danger">{library.error}</Banner> : null}
      {library.loading ? <p className="text-mute">Loading…</p> : null}
      {!library.loading && library.items.length === 0 ? (
        <p className="text-mute">No images yet. JPEG, PNG or WebP up to 30 MB.</p>
      ) : null}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {library.items.map((asset) => (
          <Thumbnail key={asset.id} accountId={accountId} asset={asset} onClick={() => void show(asset)} />
        ))}
      </div>
      {open ? (
        <AssetDialog accountId={accountId} asset={open} canEdit={canEdit} onClose={() => setOpen(null)} onSaved={replace} />
      ) : null}
    </>
  );
}

function AssetDialog(props: {
  accountId: string;
  asset: Asset;
  canEdit: boolean;
  onClose: () => void;
  onSaved: (asset: Asset) => void;
}) {
  const { asset } = props;
  const [name, setName] = useState(asset.name);
  const [error, setError] = useState('');
  const patch = async (body: { name?: string; archived?: boolean }) => {
    try {
      props.onSaved(
        await unwrap<Asset>(
          api.PATCH('/v1/ad-accounts/{accountId}/assets/{id}', {
            params: { path: { accountId: props.accountId, id: asset.id } },
            body,
          }),
        ),
      );
    } catch (caught) {
      setError(errorText(caught));
    }
  };
  return (
    <Modal
      title={asset.name}
      onClose={props.onClose}
      footer={
        props.canEdit ? (
          <Button onClick={() => void patch({ archived: true })} disabled={(asset.usedBy ?? []).length > 0}>
            Archive
          </Button>
        ) : null
      }
    >
      {error ? <Banner tone="danger">{error}</Banner> : null}
      <CropEditor key={asset.updatedAt} accountId={props.accountId} asset={asset} onSaved={props.onSaved} readOnly={!props.canEdit} />
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <Field label="Name" htmlFor="asset-name">
            <div className="flex gap-2">
              <TextInput id="asset-name" value={name} maxLength={150} disabled={!props.canEdit} onChange={(e) => setName(e.target.value)} />
              {props.canEdit ? (
                <Button disabled={!name.trim() || name === asset.name} onClick={() => void patch({ name })}>
                  Rename
                </Button>
              ) : null}
            </div>
          </Field>
          <p className="text-sm text-mute">
            {asset.width} × {asset.height} px · {(asset.sizeBytes / 1024 / 1024).toFixed(1)} MB
          </p>
          <p className="mt-2 text-sm">
            {asset.usedBy === undefined
              ? ''
              : asset.usedBy.length === 0
                ? 'Not used in any ad.'
                : 'Used in: ' + asset.usedBy.map((a) => a.adName).join(', ')}
          </p>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold">Checks</h3>
          {asset.issues.length === 0 ? <p className="text-sm text-ok">Good for every network.</p> : null}
          <ul className="space-y-1.5 text-sm">
            {asset.issues.map((issue) => (
              <li key={issue.network + issue.field} className={issue.severity === 'error' ? 'text-danger' : 'text-warn'}>
                {issue.message}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
}
