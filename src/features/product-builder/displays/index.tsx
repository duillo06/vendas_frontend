import type { DisplayProps } from "../types";
import { getItemQuantity } from "../types";
import { OptionCard } from "./OptionCard";
import { usePickHandlers } from "./usePickHandlers";

export function ListDisplay({ group, items, basePrice, onChange, disabled }: DisplayProps) {
  const { toggleSingle, toggleMultiple, isSelected, atMax } = usePickHandlers(group, items, onChange);
  const inputType = group.selection_type === "single" ? "radio" : "checkbox";

  return (
    <div className="space-y-2">
      {group.options.map((option) => (
        <OptionCard
          key={option.id}
          option={option}
          basePrice={basePrice}
          selected={isSelected(option.id)}
          disabled={disabled || (atMax && !isSelected(option.id))}
          inputType={inputType}
          name={`option-group-${group.id}`}
          layout="row"
          onToggle={() =>
            group.selection_type === "single" ? toggleSingle(option.id) : toggleMultiple(option.id)
          }
        />
      ))}
    </div>
  );
}

export function RadioDisplay({ group, items, basePrice, onChange, disabled }: DisplayProps) {
  const { toggleSingle, isSelected } = usePickHandlers(group, items, onChange);

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {group.options.map((option) => (
        <OptionCard
          key={option.id}
          option={option}
          basePrice={basePrice}
          selected={isSelected(option.id)}
          disabled={disabled}
          inputType="radio"
          name={`option-group-${group.id}`}
          layout="card"
          onToggle={() => toggleSingle(option.id)}
        />
      ))}
    </div>
  );
}

export function CheckboxDisplay({ group, items, basePrice, onChange, disabled }: DisplayProps) {
  const { toggleMultiple, isSelected, atMax } = usePickHandlers(group, items, onChange);

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {group.options.map((option) => (
        <OptionCard
          key={option.id}
          option={option}
          basePrice={basePrice}
          selected={isSelected(option.id)}
          disabled={disabled || (atMax && !isSelected(option.id))}
          inputType="checkbox"
          name={`option-group-${group.id}`}
          layout="card"
          onToggle={() => toggleMultiple(option.id)}
        />
      ))}
    </div>
  );
}

export function CardGridDisplay(props: DisplayProps) {
  if (props.group.selection_type === "single") {
    return <RadioDisplay {...props} />;
  }
  return <CheckboxDisplay {...props} />;
}

export function ImageCardDisplay(props: DisplayProps) {
  const { group, items, basePrice, onChange, disabled } = props;
  const { toggleSingle, toggleMultiple, isSelected, atMax } = usePickHandlers(group, items, onChange);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {group.options.map((option) => (
        <OptionCard
          key={option.id}
          option={option}
          basePrice={basePrice}
          selected={isSelected(option.id)}
          disabled={disabled || (atMax && !isSelected(option.id))}
          inputType={group.selection_type === "single" ? "radio" : "checkbox"}
          name={`option-group-${group.id}`}
          layout="image"
          onToggle={() =>
            group.selection_type === "single" ? toggleSingle(option.id) : toggleMultiple(option.id)
          }
        />
      ))}
    </div>
  );
}

export function DropdownDisplay({ group, items, onChange, disabled }: DisplayProps) {
  const selectedId = items[0]?.option_id ?? "";

  return (
    <select
      className="h-11 w-full rounded-lg border border-[hsl(var(--border))] bg-white px-3 text-sm"
      value={selectedId}
      disabled={disabled}
      onChange={(event) => {
        const value = event.target.value;
        onChange(value ? [{ option_id: value, quantity: 1 }] : []);
      }}
    >
      <option value="">{group.is_required ? "Selecione..." : "Nenhum"}</option>
      {group.options.map((option) => (
        <option key={option.id} value={option.id} disabled={!option.is_available}>
          {option.name}
          {option.price_modifier > 0 ? ` (+ R$ ${option.price_modifier.toFixed(2)})` : ""}
        </option>
      ))}
    </select>
  );
}

export function StepperDisplay({ group, items, basePrice, onChange, disabled }: DisplayProps) {
  const { setQuantity, atMax } = usePickHandlers(group, items, onChange);

  return (
    <div className="space-y-2">
      {group.options.map((option) => {
        const quantity = getItemQuantity(items, option.id);
        return (
          <OptionCard
            key={option.id}
            option={option}
            basePrice={basePrice}
            selected={quantity > 0}
            quantity={quantity}
            disabled={disabled}
            inputType="none"
            layout="row"
            showStepper
            onIncrement={() => setQuantity(option.id, quantity + 1)}
            onDecrement={() => setQuantity(option.id, quantity - 1)}
          />
        );
      })}
      {atMax ? (
        <p className="text-xs font-medium text-brand">Limite do grupo atingido</p>
      ) : null}
    </div>
  );
}

export function IconChipDisplay({ group, items, onChange, disabled }: DisplayProps) {
  const { toggleSingle, toggleMultiple, isSelected, atMax } = usePickHandlers(group, items, onChange);

  return (
    <div className="flex flex-wrap gap-2">
      {group.options.map((option) => {
        const selected = isSelected(option.id);
        return (
          <button
            key={option.id}
            type="button"
            disabled={disabled || !option.is_available || (atMax && !selected)}
            onClick={() =>
              group.selection_type === "single" ? toggleSingle(option.id) : toggleMultiple(option.id)
            }
            className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
              selected
                ? "border-brand bg-brand-soft text-brand"
                : "border-[hsl(var(--border))] bg-white hover:border-[hsl(var(--primary)/0.3)]"
            }`}
          >
            {option.icon ? <span>{option.icon}</span> : null}
            {option.name}
          </button>
        );
      })}
    </div>
  );
}
