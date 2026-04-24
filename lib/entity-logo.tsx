interface EntityLogoProps {
  logo_url?: string | null;
  svg?: string | null;
  fallback?: string;
  className?: string;
  is_dark_theme_logo?: boolean | null;
}

export function EntityLogo({ logo_url, svg, fallback = "", className = "", is_dark_theme_logo }: EntityLogoProps) {
  if (logo_url) {
    return (
      <img
        src={logo_url}
        alt={fallback}
        className={`w-full h-full object-cover ${is_dark_theme_logo ? "bg-black" : ""} ${className}`}
      />
    );
  }

  if (svg) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center ${is_dark_theme_logo ? "bg-black" : ""} ${className}`}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }

  return null;
}

export function EntityLogoFallback({ 
  logo_url, 
  svg, 
  name, 
  company_logo_char,
  className = "",
  is_dark_theme_logo
}: {
  logo_url?: string | null;
  svg?: string | null;
  name?: string;
  company_logo_char?: string | null;
  className?: string;
  is_dark_theme_logo?: boolean | null;
}) {
  if (logo_url) {
    return (
      <img
        src={logo_url}
        alt={`${name} Logo`}
        className={`w-full h-full object-contain ${is_dark_theme_logo ? "bg-black" : ""} ${className}`}
      />
    );
  }

  if (svg) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full text-current ${is_dark_theme_logo ? "bg-black" : ""} ${className}`}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }

  return (
    <span className={`text-2xl font-extrabold text-current ${is_dark_theme_logo ? "bg-black" : ""} ${className}`}>
      {company_logo_char?.trim() || name?.charAt(0)}
    </span>
  );
}
