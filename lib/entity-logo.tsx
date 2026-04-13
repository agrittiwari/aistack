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
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }

  if (svg) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:p-2 [&>svg]:text-white`}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }

  return (
    <span className="text-2xl font-extrabold text-white">
      {company_logo_char?.trim() || name?.charAt(0)}
    </span>
  );
}