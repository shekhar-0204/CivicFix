import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// Labelled input with optional leading icon, show/hide toggle for
// passwords, and an inline error message.
function FormField({
  id,
  label,
  icon: Icon,
  error,
  type = "text",
  labelAside,
  ...inputProps
}) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="form-group">
      {labelAside ? (
        <div className="password-label">
          <label htmlFor={id}>{label}</label>
          {labelAside}
        </div>
      ) : (
        <label htmlFor={id}>{label}</label>
      )}

      <div className={error ? "input-wrapper invalid" : "input-wrapper"}>
        {Icon && <Icon size={18} />}

        <input
          id={id}
          type={isPassword && visible ? "text" : type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...inputProps}
        />

        {isPassword && (
          <button
            type="button"
            className="password-toggle"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <p className="field-error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default FormField;
