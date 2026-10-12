import { Button } from '@/ui/Button';
import { TextField } from '@/ui/TextField';
import styles from './brand.module.css';
import { newMilestoneRow, type MilestoneRow } from './campaignForm';

const MAX_MILESTONES = 10;

interface MilestoneRowFieldsProps {
  row: MilestoneRow;
  position: number;
  canRemove: boolean;
  onUpdate: (patch: Partial<MilestoneRow>) => void;
  onRemove: () => void;
}

function MilestoneRowFields({ row, position, canRemove, onUpdate, onRemove }: MilestoneRowFieldsProps) {
  return (
    <div className={styles.milestoneRow}>
      <TextField
        label={`Milestone ${position} views`}
        type="number"
        min={1}
        inputMode="numeric"
        placeholder="e.g. 10000"
        value={row.viewThreshold}
        onChange={(e) => onUpdate({ viewThreshold: e.target.value })}
      />
      <TextField
        label={`Milestone ${position} payout (₹)`}
        type="number"
        min={1}
        inputMode="numeric"
        placeholder="e.g. 500"
        value={row.payout}
        onChange={(e) => onUpdate({ payout: e.target.value })}
      />
      <Button variant="ghost" aria-label={`Remove milestone ${position}`} disabled={!canRemove} onClick={onRemove}>
        ✕
      </Button>
    </div>
  );
}

interface MilestoneEditorProps {
  rows: MilestoneRow[];
  onChange: (rows: MilestoneRow[]) => void;
}

export function MilestoneEditor({ rows, onChange }: MilestoneEditorProps) {
  const updateRow = (rowId: number, patch: Partial<MilestoneRow>) =>
    onChange(rows.map((row) => (row.rowId === rowId ? { ...row, ...patch } : row)));
  const removeRow = (rowId: number) => onChange(rows.filter((row) => row.rowId !== rowId));

  return (
    <fieldset className={styles.milestones}>
      <legend>Milestone ladder</legend>
      <p className={styles.muted}>A creator is paid the amount of the highest milestone their post crosses.</p>
      {rows.map((row, index) => (
        <MilestoneRowFields
          key={row.rowId}
          row={row}
          position={index + 1}
          canRemove={rows.length > 1}
          onUpdate={(patch) => updateRow(row.rowId, patch)}
          onRemove={() => removeRow(row.rowId)}
        />
      ))}
      <Button variant="secondary" disabled={rows.length >= MAX_MILESTONES} onClick={() => onChange([...rows, newMilestoneRow()])}>
        + Add milestone
      </Button>
    </fieldset>
  );
}
