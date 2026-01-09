import React from "react";

interface HardLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: React.ReactNode;
}

/**
 * HardLink - Forces full page navigation instead of SPA routing.
 * This fixes mobile white screen issues by ensuring clean state on every navigation.
 */
export const HardLink: React.FC<HardLinkProps> = ({ to, children, className, ...props }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Force full page navigation with hash
    window.location.href = `/#${to}`;
  };

  return (
    <a 
      href={`/#${to}`} 
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </a>
  );
};

export default HardLink;
