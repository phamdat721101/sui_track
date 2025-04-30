import { cn } from "../../lib/utils";

interface FormWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function FormWrapper({
  children,
  className,
  ...props
}: FormWrapperProps) {
  return (
    <div
      className={cn(
        "mx-auto rounded-xl overflow-hidden p-6 transition-all duration-300 hover:shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface FormLabelProps extends React.HTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export function FormLabel({ children, className, ...props }: FormLabelProps) {
  return (
    <label
      className={cn("block text-sm font-medium text-white/80", className)}
      {...props}
    >
      {children}
    </label>
  );
}

interface FormInputWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function FormInputWrapper({
  children,
  icon,
  className,
  ...props
}: FormInputWrapperProps) {
  return (
    <div className="relative" {...props}>
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-800">
          {icon}
        </div>
      )}
      {children}
    </div>
  );
}

export function FormInput({
  className,
  icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode }) {
  return (
    <input
      className={cn(
        "w-full py-2.5 px-4 rounded-lg text-sm focus:ring-1 focus:ring-crypto-blue/30 focus:outline-0 text-gray-800",
        icon && "pl-10",
        className
      )}
      {...props}
    />
  );
}
