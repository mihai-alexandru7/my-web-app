<script setup lang="ts">

import '@/assets/css/account.css'

export interface FormFieldProps {
  label: string
  name: string
  type?: 'text' | 'email' | 'password'
  multiline?: boolean
  rows?: number
  autocomplete?: string
  inputmode?: 'text' | 'email' | 'numeric' | 'tel' | 'url' | 'search'
  placeholder?: string
  maxlength?: number
  readonly?: boolean
  disabled?: boolean
  invalid?: boolean
  error?: string
  showLabel?: boolean
  actionLabel?: string
}

const props = withDefaults(defineProps<FormFieldProps>(), {
  type: 'text',
  multiline: false,
  rows: 3,
  readonly: false,
  disabled: false,
  invalid: false,
  error: '',
  showLabel: false
})

const model = defineModel<string>({ required: true })
const emit = defineEmits<{ action: [] }>()
const slots = useSlots()

const id = useId()
const hintId = `${id}-hint`
const errorId = `${id}-error`

const control = ref<HTMLInputElement | HTMLTextAreaElement | null>(null)
const revealed = ref(false)

const isPassword = computed(() => props.type === 'password' && !props.multiline)
const inputType = computed(() => (isPassword.value && revealed.value ? 'text' : props.type))
const hasAction = computed(() => !props.multiline && (isPassword.value || Boolean(props.actionLabel)))
const isInvalid = computed(() => props.invalid || Boolean(props.error))

const describedBy = computed(() => {
  const ids: string[] = []
  if (props.error) ids.push(errorId)
  if (slots.hint) ids.push(hintId)
  return ids.length > 0 ? ids.join(' ') : undefined
})

defineExpose({ focus: () => control.value?.focus() })

</script>

<template>
  <div class="account-field">
    <label :for="id" class="account-field-label" :class="{ hidden: !showLabel }">{{ label }}</label>
    <div class="account-field-control">
      <textarea
          v-if="multiline"
          :id="id"
          ref="control"
          v-model="model"
          class="account-field-input"
          :name="name"
          :rows="rows"
          :placeholder="placeholder"
          :maxlength="maxlength"
          :readonly="readonly"
          :disabled="disabled"
          :autocomplete="autocomplete"
          :aria-invalid="isInvalid"
          :aria-describedby="describedBy"
      />
      <input
          v-else
          :id="id"
          ref="control"
          v-model="model"
          class="account-field-input"
          :class="{ 'has-action': hasAction }"
          :type="inputType"
          :name="name"
          :placeholder="placeholder"
          :maxlength="maxlength"
          :readonly="readonly"
          :disabled="disabled"
          :autocomplete="autocomplete"
          :inputmode="inputmode"
          :aria-invalid="isInvalid"
          :aria-describedby="describedBy"
      />
      <button
          v-if="isPassword"
          type="button"
          class="account-field-action"
          :aria-label="revealed ? 'Hide password' : 'Show password'"
          :aria-pressed="revealed"
          @click="revealed = !revealed"
      >
        {{ revealed ? 'Hide' : 'Show' }}
      </button>
      <button v-else-if="hasAction" type="button" class="account-field-action" @click="emit('action')">
        {{ actionLabel }}
      </button>
    </div>
    <p v-if="error" :id="errorId" class="account-field-error" role="alert">
      {{ error }}
    </p>
    <div v-if="slots.hint" :id="hintId">
      <slot name="hint" />
    </div>
  </div>
</template>

<style scoped>

.account-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.account-field-label {
  font-size: 0.95rem;
  color: var(--account-muted);
}

.account-field-label.hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.account-field-control {
  position: relative;
  display: flex;
}

.account-field-input {
  box-sizing: border-box;
  width: 100%;
  padding: 11px 12px;
  font: inherit;
  color: var(--account-ink);
  background: var(--account-field);
  border: 1px solid var(--account-field-border);
  border-radius: 8px;
}

.account-field-input.has-action {
  padding-right: 76px;
}

textarea.account-field-input {
  resize: vertical;
}

.account-field-input::placeholder {
  color: var(--account-muted);
  opacity: 1;
}

.account-field-input:focus {
  border-color: var(--account-accent);
}

.account-field-input:focus-visible,
.account-field-action:focus-visible {
  outline: 2px solid var(--account-accent);
  outline-offset: 2px;
}

.account-field-input[readonly] {
  background: var(--account-page);
  color: var(--account-muted);
}

.account-field-input[aria-invalid='true'] {
  border-color: var(--account-error);
  box-shadow: 0 0 0 1px var(--account-error);
}

.account-field-input:disabled {
  opacity: 0.6;
}

.account-field-error {
  margin: 0;
  font-size: 0.85rem;
  color: var(--account-error);
  line-height: 1.3;
}

.account-field-action {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  padding: 0;
  font: inherit;
  font-size: 0.9rem;
  color: var(--account-accent);
  background: none;
  border: 0;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

.account-field-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

</style>
