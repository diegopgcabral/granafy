type IconName =
  | "calendar"
  | "chevronLeft"
  | "chevronRight"
  | "dashboard"
  | "expense"
  | "income"
  | "logout";

type IconProps = {
  name: IconName;
  className?: string;
};

export function Icon({ name, className = "size-5" }: IconProps) {
  const paths: Record<IconName, React.ReactNode> = {
    calendar: <rect height="14" rx="2" width="16" x="4" y="5" />,
    chevronLeft: <path d="m14 18-6-6 6-6" />,
    chevronRight: <path d="m10 6 6 6-6 6" />,
    dashboard: (
      <>
        <rect height="6" rx="1" width="6" x="3" y="3" />
        <rect height="6" rx="1" width="6" x="15" y="3" />
        <rect height="6" rx="1" width="6" x="3" y="15" />
        <rect height="6" rx="1" width="6" x="15" y="15" />
      </>
    ),
    expense: <path d="M4 7h16M4 12h12M4 17h8" />,
    income: <path d="m5 15 5-5 3 3 6-7M15 6h4v4" />,
    logout: (
      <>
        <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
        <path d="m14 16 4-4-4-4M18 12H9" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
}
