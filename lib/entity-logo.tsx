interface EntityLogoProps {
  logo_url?: string | null;
  svg?: string | null;
  fallback?: string;
  className?: string;
}

export function EntityLogo({ logo_url, svg, fallback = "", className = "" }: EntityLogoProps) {
  if (logo_url) {
    return (
      <img
        src={logo_url}
        alt={fallback}
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }

  if (svg) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center ${className}`}
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
  className = "" 
}: {
  logo_url?: string | null;
  svg?: string | null;
  name?: string;
  company_logo_char?: string | null;
  className?: string;
}) {
  if (logo_url) {
    return (
      <img
        src={logo_url}
        alt={`${name} Logo`}
        className={`w-full h-full object-contain ${className}`}
      />
    );
  }

  if (svg) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full text-current`}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }

  return (
    <span className="text-2xl font-extrabold text-current">
      {company_logo_char?.trim() || name?.charAt(0)}
    </span>
  );
}
