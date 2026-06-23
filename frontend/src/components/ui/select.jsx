import { cloneElement, isValidElement } from "react"
import { cn } from "../../lib/utils"

export function Select({ value, onValueChange, children, id }) {
  return (
    <div data-value={value} id={id}>
      {Array.isArray(children)
        ? children.map((child) =>
            isValidElement(child) && child.type?.displayName === "SelectContent"
              ? cloneElement(child, { value, onValueChange })
              : child,
          )
        : children}
    </div>
  )
}

export function SelectTrigger({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function SelectValue({ placeholder }) {
  return <span className="text-foreground">{placeholder}</span>
}

export function SelectContent({ className, children, value, onValueChange }) {
  return (
    <select
      className={cn(
        "mt-[-2.5rem] h-10 w-full cursor-pointer rounded-md border border-input bg-transparent px-3 text-sm opacity-0",
        className,
      )}
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      aria-label="Language"
    >
      {children}
    </select>
  )
}
SelectContent.displayName = "SelectContent"

export function SelectItem({ value, children }) {
  return <option value={value}>{children}</option>
}
