'use client';

import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';

/* -------------------------------------------------------------------------
 * Types
 * ---------------------------------------------------------------------- */

export type BodyPartId =
  | 'head'
  | 'neck'
  | 'chest'
  | 'abdomen'
  | 'upper-back'
  | 'lower-back'
  | 'hips'
  | 'shoulder-left'
  | 'shoulder-right'
  | 'upper-arm-left'
  | 'upper-arm-right'
  | 'elbow-left'
  | 'elbow-right'
  | 'forearm-left'
  | 'forearm-right'
  | 'wrist-left'
  | 'wrist-right'
  | 'hand-left'
  | 'hand-right'
  | 'thigh-left'
  | 'thigh-right'
  | 'knee-left'
  | 'knee-right'
  | 'lower-leg-left'
  | 'lower-leg-right'
  | 'ankle-left'
  | 'ankle-right'
  | 'foot-left'
  | 'foot-right';

type View = 'front' | 'back';

type ShapeDef =
  | { shape: 'circle'; cx: number; cy: number; r: number }
  | { shape: 'rect'; x: number; y: number; width: number; height: number; rx: number }
  | { shape: 'ellipse'; cx: number; cy: number; rx: number; ry: number };

interface RegionDef {
  /** Label shown in the checklist, tooltip, and chips. */
  label: string;
  /** Which view(s) this region is visible/clickable in. */
  front?: ShapeDef;
  back?: ShapeDef;
}

export interface SymptomBodyPickerProps {
  /** Controlled selected value. If provided, the component is controlled. */
  value?: BodyPartId[];
  /** Initial selection for uncontrolled usage. */
  defaultValue?: BodyPartId[];
  /** Called whenever the selection changes, with the full updated list. */
  onChange?: (selected: BodyPartId[]) => void;
  /** Allow selecting more than one body part. Defaults to true. */
  multiple?: boolean;
  /** Optional cap on number of selections (only relevant when multiple). */
  maxSelections?: number;
  /** Disables all interaction. */
  disabled?: boolean;
  /** Extra class names for the outer wrapper. */
  className?: string;
  /** Accessible label for the region group. */
  ariaLabel?: string;
  /** Compact layout for embedding in forms without taking over the page. */
  compact?: boolean;
}

/* -------------------------------------------------------------------------
 * Region geometry (viewBox 0 0 240 440)
 * Coordinates form a simple, stylized mannequin — not anatomical art —
 * intentionally schematic so regions are easy to tap on mobile.
 * ---------------------------------------------------------------------- */

const REGIONS: Record<BodyPartId, RegionDef> = {
  head: {
    label: 'Head',
    front: { shape: 'circle', cx: 120, cy: 42, r: 26 },
    back: { shape: 'circle', cx: 120, cy: 42, r: 26 },
  },
  neck: {
    label: 'Neck',
    front: { shape: 'rect', x: 110, y: 64, width: 20, height: 14, rx: 4 },
    back: { shape: 'rect', x: 110, y: 64, width: 20, height: 14, rx: 4 },
  },
  chest: {
    label: 'Chest',
    front: { shape: 'rect', x: 90, y: 80, width: 60, height: 55, rx: 16 },
  },
  abdomen: {
    label: 'Abdomen',
    front: { shape: 'rect', x: 88, y: 135, width: 64, height: 55, rx: 14 },
  },
  'upper-back': {
    label: 'Upper back',
    back: { shape: 'rect', x: 90, y: 80, width: 60, height: 55, rx: 16 },
  },
  'lower-back': {
    label: 'Lower back',
    back: { shape: 'rect', x: 88, y: 135, width: 64, height: 45, rx: 14 },
  },
  hips: {
    label: 'Hips / pelvis',
    front: { shape: 'rect', x: 86, y: 190, width: 68, height: 38, rx: 18 },
    back: { shape: 'rect', x: 86, y: 190, width: 68, height: 38, rx: 18 },
  },
  'shoulder-left': {
    label: 'Left shoulder',
    front: { shape: 'circle', cx: 72, cy: 92, r: 14 },
    back: { shape: 'circle', cx: 72, cy: 92, r: 14 },
  },
  'shoulder-right': {
    label: 'Right shoulder',
    front: { shape: 'circle', cx: 168, cy: 92, r: 14 },
    back: { shape: 'circle', cx: 168, cy: 92, r: 14 },
  },
  'upper-arm-left': {
    label: 'Left upper arm',
    front: { shape: 'rect', x: 48, y: 98, width: 22, height: 70, rx: 11 },
    back: { shape: 'rect', x: 48, y: 98, width: 22, height: 70, rx: 11 },
  },
  'upper-arm-right': {
    label: 'Right upper arm',
    front: { shape: 'rect', x: 170, y: 98, width: 22, height: 70, rx: 11 },
    back: { shape: 'rect', x: 170, y: 98, width: 22, height: 70, rx: 11 },
  },
  'elbow-left': {
    label: 'Left elbow',
    front: { shape: 'circle', cx: 59, cy: 172, r: 11 },
    back: { shape: 'circle', cx: 59, cy: 172, r: 11 },
  },
  'elbow-right': {
    label: 'Right elbow',
    front: { shape: 'circle', cx: 181, cy: 172, r: 11 },
    back: { shape: 'circle', cx: 181, cy: 172, r: 11 },
  },
  'forearm-left': {
    label: 'Left forearm',
    front: { shape: 'rect', x: 46, y: 176, width: 22, height: 64, rx: 11 },
    back: { shape: 'rect', x: 46, y: 176, width: 22, height: 64, rx: 11 },
  },
  'forearm-right': {
    label: 'Right forearm',
    front: { shape: 'rect', x: 172, y: 176, width: 22, height: 64, rx: 11 },
    back: { shape: 'rect', x: 172, y: 176, width: 22, height: 64, rx: 11 },
  },
  'wrist-left': {
    label: 'Left wrist',
    front: { shape: 'circle', cx: 57, cy: 246, r: 8 },
    back: { shape: 'circle', cx: 57, cy: 246, r: 8 },
  },
  'wrist-right': {
    label: 'Right wrist',
    front: { shape: 'circle', cx: 183, cy: 246, r: 8 },
    back: { shape: 'circle', cx: 183, cy: 246, r: 8 },
  },
  'hand-left': {
    label: 'Left hand',
    front: { shape: 'ellipse', cx: 57, cy: 266, rx: 13, ry: 17 },
    back: { shape: 'ellipse', cx: 57, cy: 266, rx: 13, ry: 17 },
  },
  'hand-right': {
    label: 'Right hand',
    front: { shape: 'ellipse', cx: 183, cy: 266, rx: 13, ry: 17 },
    back: { shape: 'ellipse', cx: 183, cy: 266, rx: 13, ry: 17 },
  },
  'thigh-left': {
    label: 'Left thigh',
    front: { shape: 'rect', x: 88, y: 228, width: 28, height: 80, rx: 14 },
    back: { shape: 'rect', x: 88, y: 228, width: 28, height: 80, rx: 14 },
  },
  'thigh-right': {
    label: 'Right thigh',
    front: { shape: 'rect', x: 124, y: 228, width: 28, height: 80, rx: 14 },
    back: { shape: 'rect', x: 124, y: 228, width: 28, height: 80, rx: 14 },
  },
  'knee-left': {
    label: 'Left knee',
    front: { shape: 'circle', cx: 102, cy: 312, r: 14 },
    back: { shape: 'circle', cx: 102, cy: 312, r: 14 },
  },
  'knee-right': {
    label: 'Right knee',
    front: { shape: 'circle', cx: 138, cy: 312, r: 14 },
    back: { shape: 'circle', cx: 138, cy: 312, r: 14 },
  },
  'lower-leg-left': {
    label: 'Left lower leg',
    front: { shape: 'rect', x: 90, y: 316, width: 24, height: 78, rx: 12 },
    back: { shape: 'rect', x: 90, y: 316, width: 24, height: 78, rx: 12 },
  },
  'lower-leg-right': {
    label: 'Right lower leg',
    front: { shape: 'rect', x: 126, y: 316, width: 24, height: 78, rx: 12 },
    back: { shape: 'rect', x: 126, y: 316, width: 24, height: 78, rx: 12 },
  },
  'ankle-left': {
    label: 'Left ankle',
    front: { shape: 'circle', cx: 102, cy: 398, r: 9 },
    back: { shape: 'circle', cx: 102, cy: 398, r: 9 },
  },
  'ankle-right': {
    label: 'Right ankle',
    front: { shape: 'circle', cx: 138, cy: 398, r: 9 },
    back: { shape: 'circle', cx: 138, cy: 398, r: 9 },
  },
  'foot-left': {
    label: 'Left foot',
    front: { shape: 'ellipse', cx: 100, cy: 416, rx: 18, ry: 11 },
    back: { shape: 'ellipse', cx: 100, cy: 416, rx: 18, ry: 11 },
  },
  'foot-right': {
    label: 'Right foot',
    front: { shape: 'ellipse', cx: 140, cy: 416, rx: 18, ry: 11 },
    back: { shape: 'ellipse', cx: 140, cy: 416, rx: 18, ry: 11 },
  },
};

/** Draw order (back-to-front) so joints/extremities sit on top of limbs/torso. */
const DRAW_ORDER: BodyPartId[] = [
  'chest',
  'abdomen',
  'upper-back',
  'lower-back',
  'hips',
  'upper-arm-left',
  'upper-arm-right',
  'forearm-left',
  'forearm-right',
  'thigh-left',
  'thigh-right',
  'lower-leg-left',
  'lower-leg-right',
  'neck',
  'head',
  'shoulder-left',
  'shoulder-right',
  'elbow-left',
  'elbow-right',
  'knee-left',
  'knee-right',
  'wrist-left',
  'wrist-right',
  'ankle-left',
  'ankle-right',
  'hand-left',
  'hand-right',
  'foot-left',
  'foot-right',
];

/** Grouping + order used for the checklist fallback and chip sorting. */
const GROUPS: { label: string; ids: BodyPartId[] }[] = [
  { label: 'Head & neck', ids: ['head', 'neck'] },
  {
    label: 'Torso',
    ids: ['chest', 'abdomen', 'upper-back', 'lower-back', 'hips'],
  },
  {
    label: 'Arms & hands',
    ids: [
      'shoulder-left',
      'shoulder-right',
      'upper-arm-left',
      'upper-arm-right',
      'elbow-left',
      'elbow-right',
      'forearm-left',
      'forearm-right',
      'wrist-left',
      'wrist-right',
      'hand-left',
      'hand-right',
    ],
  },
  {
    label: 'Legs & feet',
    ids: [
      'thigh-left',
      'thigh-right',
      'knee-left',
      'knee-right',
      'lower-leg-left',
      'lower-leg-right',
      'ankle-left',
      'ankle-right',
      'foot-left',
      'foot-right',
    ],
  },
];

export const BODY_PART_IDS: BodyPartId[] = DRAW_ORDER;
export const BODY_PART_LABELS: Record<BodyPartId, string> = Object.fromEntries(
  (Object.keys(REGIONS) as BodyPartId[]).map((id) => [id, REGIONS[id].label])
) as Record<BodyPartId, string>;

const ORDER_INDEX: Record<BodyPartId, number> = Object.fromEntries(
  DRAW_ORDER.map((id, i) => [id, i])
) as Record<BodyPartId, number>;

function sortByCanonicalOrder(ids: BodyPartId[]): BodyPartId[] {
  return [...ids].sort((a, b) => ORDER_INDEX[a] - ORDER_INDEX[b]);
}

function getShapeCenter(shape: ShapeDef): { cx: number; cy: number } {
  if (shape.shape === 'rect') {
    return { cx: shape.x + shape.width / 2, cy: shape.y + shape.height / 2 };
  }
  return { cx: shape.cx, cy: shape.cy };
}

/* -------------------------------------------------------------------------
 * Component
 * ---------------------------------------------------------------------- */

export default function SymptomBodyPicker({
  value,
  defaultValue = [],
  onChange,
  multiple = true,
  maxSelections,
  disabled = false,
  className = '',
  ariaLabel = 'Select the body area or areas related to your symptoms',
  compact = false,
}: SymptomBodyPickerProps) {
  const isControlled = value !== undefined;
  const [internalSelected, setInternalSelected] = useState<BodyPartId[]>(
    sortByCanonicalOrder(defaultValue)
  );
  const [view, setView] = useState<View>('front');
  const [showList, setShowList] = useState<boolean>(false);
  const [limitMessage, setLimitMessage] = useState<string | null>(null);
  const groupId = useId();

  const selected = isControlled ? sortByCanonicalOrder(value!) : internalSelected;

  const commit = useCallback(
    (next: BodyPartId[]) => {
      const sorted = sortByCanonicalOrder(next);
      if (!isControlled) setInternalSelected(sorted);
      onChange?.(sorted);
    },
    [isControlled, onChange]
  );

  const toggle = useCallback(
    (id: BodyPartId) => {
      if (disabled) return;
      const isSelected = selected.includes(id);

      if (isSelected) {
        setLimitMessage(null);
        commit(selected.filter((s) => s !== id));
        return;
      }

      if (!multiple) {
        commit([id]);
        return;
      }

      if (typeof maxSelections === 'number' && selected.length >= maxSelections) {
        setLimitMessage(
          `You can select up to ${maxSelections} ${maxSelections === 1 ? 'area' : 'areas'}. Remove one to add another.`
        );
        return;
      }

      setLimitMessage(null);
      commit([...selected, id]);
    },
    [disabled, multiple, maxSelections, selected, commit]
  );

  const visibleRegionIds = useMemo(
    () => DRAW_ORDER.filter((id) => REGIONS[id][view] !== undefined),
    [view]
  );

  const selectedLabels = selected.map((id) => REGIONS[id].label);

  return (
    <div className={`w-full ${compact ? 'max-w-[280px]' : 'max-w-md'} ${className}`}>
      <style>{`
        .sbp-region {
          cursor: pointer;
          fill: #e2e8f0; /* slate-200 */
          stroke: #cbd5e1; /* slate-300 */
          stroke-width: 1.5;
          transition: fill 120ms ease, stroke 120ms ease;
        }
        .sbp-region:hover {
          fill: #cbd5e1; /* slate-300 */
        }
        .sbp-region[aria-checked="true"] {
          fill: #2563eb; /* blue-600 */
          stroke: #1d4ed8; /* blue-700 */
        }
        .sbp-region:focus-visible {
          outline: 3px solid #2563eb;
          outline-offset: 2px;
        }
        .sbp-region[aria-disabled="true"] {
          cursor: not-allowed;
        }
        @media (prefers-reduced-motion: reduce) {
          .sbp-region {
            transition: none;
          }
        }
      `}</style>

      <div className={`${compact ? 'flex min-h-[310px] flex-col' : ''}`}>
        <div className={`flex items-center justify-between ${compact ? 'mb-2' : 'mb-3'}`}>
        {!compact && <span className="text-sm font-medium text-slate-700">Where does it hurt?</span>}
        <div
          className={`inline-flex rounded-full border border-slate-300 bg-white p-0.5 ${compact ? 'text-xs' : 'text-sm'}`}
          role="group"
          aria-label="Body diagram view"
        >
          {(['front', 'back'] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              disabled={disabled}
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={`rounded-full capitalize transition-colors ${compact ? 'px-2 py-0.5' : 'px-3 py-1'} ${
                view === v
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {!compact || !showList ? (
        <div className={`mt-auto rounded-2xl border border-slate-200 bg-slate-50 ${compact ? 'p-2' : 'p-4'}`}>
          <svg
            viewBox="0 0 240 440"
            role="group"
            aria-label={ariaLabel}
            className={`mx-auto h-auto w-full select-none ${compact ? 'max-w-[170px]' : 'max-w-[220px]'}`}
          >
            {visibleRegionIds.map((id) => {
              const shape = REGIONS[id][view] as ShapeDef;
              const isSelected = selected.includes(id);
              const label = REGIONS[id].label;
              const center = getShapeCenter(shape);

              const commonProps = {
                className: 'sbp-region',
                role: 'checkbox' as const,
                'aria-checked': isSelected,
                'aria-label': label,
                'aria-disabled': disabled,
                tabIndex: disabled ? -1 : 0,
                onClick: () => toggle(id),
                onKeyDown: (e: KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle(id);
                  }
                },
              };

              return (
                <g key={id}>
                  {shape.shape === 'circle' && (
                    <circle {...commonProps} cx={shape.cx} cy={shape.cy} r={shape.r}>
                      <title>{label}</title>
                    </circle>
                  )}
                  {shape.shape === 'rect' && (
                    <rect
                      {...commonProps}
                      x={shape.x}
                      y={shape.y}
                      width={shape.width}
                      height={shape.height}
                      rx={shape.rx}
                    >
                      <title>{label}</title>
                    </rect>
                  )}
                  {shape.shape === 'ellipse' && (
                    <ellipse {...commonProps} cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry}>
                      <title>{label}</title>
                    </ellipse>
                  )}
                  {isSelected && (
                    <path
                      d={`M ${center.cx - 5} ${center.cy} l 3.5 4 l 6.5 -8`}
                      stroke="white"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      pointerEvents="none"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      ) : null}

      {!compact && (
        <p className="mt-2 text-xs text-slate-500">
          Tap a body part above, or choose from the list below. You can switch between front and
          back views — your selections carry over.
        </p>
      )}

      {limitMessage && (
        <p role="alert" className="mt-2 text-xs font-medium text-amber-700">
          {limitMessage}
        </p>
      )}

      {compact ? (
        <div className="mt-auto flex flex-col gap-2 pt-2">
          {showList && (
            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-3">
              {GROUPS.map((group) => (
                <fieldset key={group.label}>
                  <legend className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
                    {group.label}
                  </legend>
                  <div className="flex flex-wrap gap-1.5">
                    {group.ids.map((id) => {
                      const isSelected = selected.includes(id);
                      return (
                        <label
                          key={id}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] cursor-pointer transition-colors ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            name={`${groupId}-${id}`}
                            checked={isSelected}
                            disabled={disabled}
                            onChange={() => toggle(id)}
                          />
                          {REGIONS[id].label}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
          )}

          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2" aria-live="polite">
              {selected.map((id) => (
                <button
                  key={id}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggle(id)}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {REGIONS[id].label}
                  <span aria-hidden="true">×</span>
                  <span className="sr-only">Remove {REGIONS[id].label}</span>
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowList((current) => !current)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            {showList ? 'Hide list' : 'Or pick from a list'}
          </button>
        </div>
      ) : (
        <details className="mt-4 rounded-xl border border-slate-200">
          <summary className="cursor-pointer select-none px-4 py-2 text-sm font-medium text-slate-700">
            Or pick from a list
          </summary>
          <div className="border-t border-slate-200 px-4 py-3 space-y-3">
            {GROUPS.map((group) => (
              <fieldset key={group.label}>
                <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
                  {group.label}
                </legend>
                <div className="flex flex-wrap gap-1.5">
                  {group.ids.map((id) => {
                    const isSelected = selected.includes(id);
                    return (
                      <label
                        key={id}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          name={`${groupId}-${id}`}
                          checked={isSelected}
                          disabled={disabled}
                          onChange={() => toggle(id)}
                        />
                        {REGIONS[id].label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
        </details>
      )}

      {!compact && (
        <p className="mt-2 text-xs text-slate-500">
          Tap a body part above, or choose from the list below. You can switch between front and
          back views — your selections carry over.
        </p>
      )}

      {!compact && selected.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2" aria-live="polite">
          {selected.map((id) => (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => toggle(id)}
              className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {REGIONS[id].label}
              <span aria-hidden="true">×</span>
              <span className="sr-only">Remove {REGIONS[id].label}</span>
            </button>
          ))}
        </div>
      )}

      <span className="sr-only" aria-live="polite">
        {selected.length === 0
          ? 'No body areas selected'
          : `Selected: ${selectedLabels.join(', ')}`}
      </span>
      </div>
    </div>
  );
}