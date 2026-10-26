<script setup lang="ts">

const props = withDefaults(
    defineProps<{
      label: string
      name?: string
      type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'search'
      multiline?: boolean
      rows?: number
      placeholder?: string
      error?: string
      required?: boolean
      disabled?: boolean
      readonly?: boolean
      step?: string | number
      min?: string | number
      max?: string | number
      maxlength?: number
      autocomplete?: string
      showLabel?: boolean
      actionLabel?: string
    }>(),
    {
      type: 'text',
      multiline: false,
      rows: 3,
      required: false,
      disabled: false,
      readonly: false,
      showLabel: true
    }
)

const model = defineModel<string | number>({ required: true })
const emit = defineEmits<{ action: [] }>()
const slots = useSlots()

const showPassword = ref(false)
const isPassword = computed(() => props.type === 'password' && !props.multiline)
const computedType = computed(() => (isPassword.value && showPassword.value ? 'text' : props.type))
const hasAction = computed(() => !props.multiline && (isPassword.value || Boolean(props.actionLabel)))

</script>

<template>
  <div class="form-field-wrapper">
    <label class="form-field-label" :class="{ 'label-hidden': !showLabel }">
      {{ label }}
      <span v-if="required" class="required-indicator">*</span>
    </label>

    <div class="form-field-control-wrapper">
      <textarea
          v-if="multiline"
          v-model="model as string"
          class="form-field-control-input form-field-control-textarea"
          :name="name"
          :rows="rows"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :maxlength="maxlength"
          :aria-invalid="Boolean(error)"
      />
      <input
          v-else
          v-model="model"
          :type="computedType"
          class="form-field-control-input"
          :class="{ 'has-action-button': hasAction }"
          :name="name"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :min="min"
          :max="max"
          :step="step"
          :maxlength="maxlength"
          :autocomplete="autocomplete"
          :aria-invalid="Boolean(error)"
      />

      <button
          v-if="isPassword"
          type="button"
          class="form-field-action-button"
          :aria-label="showPassword ? 'Hide password' : 'Show password'"
          @click="showPassword = !showPassword"
      >
        {{ showPassword ? 'Hide' : 'Show' }}
      </button>

      <button
          v-else-if="actionLabel"
          type="button"
          class="form-field-action-button"
          @click="emit('action')"
      >
        {{ actionLabel }}
      </button>
    </div>

    <p v-if="error" class="form-field-error-message" role="alert">{{ error }}</p>
    <div v-if="slots.hint" class="form-field-hint-wrapper">
      <slot name="hint" />
    </div>
  </div>
</template>

<style scoped>

.form-field-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.form-field-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.required-indicator {
  color: var(--color-status-danger);
}

.label-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.form-field-control-wrapper {
  position: relative;
  display: flex;
  width: 100%;
}

.form-field-control-input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 14px;
  font-family: inherit;
  font-size: 0.98rem;
  color: var(--color-text-primary);
  background: var(--color-background-field);
  border: 1.5px solid var(--color-border-field);
  border-radius: var(--border-radius-small);
  transition: border-color 0.2s ease, outline 0.2s ease;
}

.form-field-control-input:focus {
  outline: 2px solid var(--color-action-primary);
  outline-offset: 1px;
  border-color: var(--color-action-primary);
}

.form-field-control-input[aria-invalid="true"] {
  border-color: var(--color-status-danger);
}

.form-field-control-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-field-control-input.has-action-button {
  padding-right: 76px;
}

.form-field-control-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-field-action-button {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-action-primary);
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.form-field-error-message {
  margin: 0;
  font-size: 0.88rem;
  color: var(--color-status-danger);
}

.form-field-hint-wrapper {
  margin-top: 2px;
}

</style>