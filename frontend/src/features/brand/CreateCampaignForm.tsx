'use client';

import { useState, type FormEvent } from 'react';
import { errorMessage } from '@/lib/apiClient';
import { PLATFORM_LABELS } from '@/lib/format';
import type { Platform } from '@/lib/types';
import { Alert } from '@/ui/Alert';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { SelectField } from '@/ui/SelectField';
import { TextField } from '@/ui/TextField';
import styles from './brand.module.css';
import { useCreateCampaign } from './brandApi';
import { initialCampaignForm, toCampaignPayload, type CampaignFormState } from './campaignForm';
import { MilestoneEditor } from './MilestoneEditor';

const PLATFORM_OPTIONS = (Object.keys(PLATFORM_LABELS) as Platform[]).map((value) => ({
  value,
  label: PLATFORM_LABELS[value],
}));

interface CampaignDetailsFieldsProps {
  form: CampaignFormState;
  onUpdate: (patch: Partial<CampaignFormState>) => void;
}

function CampaignDetailsFields({ form, onUpdate }: CampaignDetailsFieldsProps) {
  return (
    <>
      <TextField
        label="Campaign name"
        placeholder="e.g. Diwali Launch"
        value={form.name}
        onChange={(e) => onUpdate({ name: e.target.value })}
      />
      <SelectField
        label="Platform"
        placeholder="Select a platform"
        options={PLATFORM_OPTIONS}
        value={form.platform}
        onChange={(e) => onUpdate({ platform: e.target.value as Platform | '' })}
      />
      <TextField
        label="Total budget (₹)"
        type="number"
        min={1}
        inputMode="numeric"
        placeholder="e.g. 50000"
        hint="Total payouts can never exceed this amount."
        value={form.totalBudget}
        onChange={(e) => onUpdate({ totalBudget: e.target.value })}
      />
    </>
  );
}

export function CreateCampaignForm() {
  const [form, setForm] = useState<CampaignFormState>(initialCampaignForm);
  const createCampaign = useCreateCampaign();
  const update = (patch: Partial<CampaignFormState>) => setForm((current) => ({ ...current, ...patch }));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createCampaign.mutate(toCampaignPayload(form), { onSuccess: () => setForm(initialCampaignForm()) });
  }

  return (
    <Card aria-labelledby="create-campaign-title">
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div>
          <h2 id="create-campaign-title" className={styles.formTitle}>
            New campaign
          </h2>
          <p className={styles.formIntro}>Set a budget and the views creators need to hit.</p>
        </div>
        <CampaignDetailsFields form={form} onUpdate={update} />
        <MilestoneEditor rows={form.milestones} onChange={(milestones) => update({ milestones })} />
        {createCampaign.isError && <Alert tone="error">{errorMessage(createCampaign.error)}</Alert>}
        {createCampaign.isSuccess && <Alert tone="success">Campaign &ldquo;{createCampaign.data.name}&rdquo; is live.</Alert>}
        <Button type="submit" block isLoading={createCampaign.isPending} loadingText="Creating…">
          Create campaign
        </Button>
      </form>
    </Card>
  );
}
