'use client';

import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { errorText, unwrap } from '@/api/request';
import type { Location } from '@/api/types';
import { Button, Chip, SearchSelect, TextInput } from '@/ui';
import type { Option } from '@/ui';

interface Place {
  id: string;
  name: string;
}

/** Loads a list whenever `key` changes; empty while `key` is empty. */
function useList(key: string, load: () => Promise<Option[]>) {
  const [items, setItems] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let cancelled = false;
    setItems([]);
    if (!key) return;
    setLoading(true);
    load()
      .then((list) => !cancelled && setItems(list))
      .catch((caught) => !cancelled && setError(errorText(caught)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // `load` is rebuilt every render; `key` says when to load again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return { items, loading, error };
}

const toOptions = (places: Place[]) => places.map((p) => ({ value: p.id, label: p.name }));

/** Country → state → city dropdowns (and PIN codes for India) that add chips to the list. */
export function LocationPicker(props: { value: Location[]; onChange: (locations: Location[]) => void }) {
  const [country, setCountry] = useState('IN');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [pin, setPin] = useState('');

  const countries = useList('all', async () => {
    const { items } = await unwrap<{ items: { code: string; name: string; flag: string }[] }>(
      api.GET('/v1/locations/countries'),
    );
    return items.map((c) => ({ value: c.code, label: `${c.flag} ${c.name}`.trim() }));
  });
  const states = useList(country, async () => {
    const { items } = await unwrap<{ items: Place[] }>(
      api.GET('/v1/locations/countries/{country}/states', { params: { path: { country } } }),
    );
    return toOptions(items);
  });
  const cities = useList(state, async () => {
    const { items } = await unwrap<{ items: Place[] }>(
      api.GET('/v1/locations/states/{state}/cities', { params: { path: { state }, query: {} } }),
    );
    return toOptions(items);
  });

  const nameOf = (list: Option[], value: string) => list.find((o) => o.value === value)?.label ?? value;
  const countryName = nameOf(countries.items, country).replace(/^\S+\s/, '');
  const stateName = nameOf(states.items, state);

  const add = (location: Location) => {
    if (props.value.some((l) => l.type === location.type && l.value === location.value)) return;
    // A whole country already covers its places; a new place replaces nothing else.
    props.onChange([...props.value, location]);
  };
  const addChosen = () => {
    if (city) add({ type: 'city', value: city, label: `${nameOf(cities.items, city)}, ${stateName}` });
    else if (state) add({ type: 'state', value: state, label: `${stateName}, ${countryName}` });
    else if (country) add({ type: 'country', value: country, label: countryName });
    setCity('');
  };
  const addPin = () => {
    if (!/^\d{6}$/.test(pin)) return;
    add({ type: 'pincode', value: pin, label: `PIN ${pin}` });
    setPin('');
  };

  const labelOf = (l: Location) =>
    l.label ?? (l.type === 'country' ? nameOf(countries.items, l.value).replace(/^\S+\s/, '') : l.value);
  const error = countries.error || states.error || cities.error;

  return (
    <div>
      <div className="mb-2 flex min-h-7 flex-wrap gap-1.5">
        {props.value.map((l) => (
          <Chip key={l.type + l.value} onRemove={() => props.onChange(props.value.filter((x) => x !== l))}>
            {labelOf(l)}
          </Chip>
        ))}
        {props.value.length === 0 ? <span className="text-[12px] text-mute">No location: ads may show anywhere.</span> : null}
      </div>
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <SearchSelect
          label="Country"
          placeholder="Country"
          options={countries.items}
          loading={countries.loading}
          value={country}
          onChange={(value) => (setCountry(value), setState(''), setCity(''))}
        />
        <SearchSelect
          label="State"
          placeholder={`All of ${countryName || 'the country'}`}
          options={states.items}
          loading={states.loading}
          disabled={!country || (!states.loading && states.items.length === 0)}
          value={state}
          onChange={(value) => (setState(value), setCity(''))}
        />
        <SearchSelect
          label="City"
          placeholder={state ? `All of ${stateName}` : 'Choose a state first'}
          options={cities.items}
          loading={cities.loading}
          disabled={!state}
          value={city}
          onChange={setCity}
        />
        <Button onClick={addChosen} disabled={!country}>
          Add
        </Button>
      </div>
      {country === 'IN' ? (
        <div className="mt-2 flex max-w-xs gap-2">
          <TextInput
            aria-label="PIN code"
            inputMode="numeric"
            maxLength={6}
            placeholder="Or a PIN code, e.g. 302001"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPin())}
          />
          <Button onClick={addPin} disabled={pin.length !== 6}>
            Add
          </Button>
        </div>
      ) : null}
      {error ? <p className="mt-1 text-[12px] text-danger">{error}</p> : null}
    </div>
  );
}
