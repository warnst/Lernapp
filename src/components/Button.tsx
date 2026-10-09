import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'wouter';
import styles from './Button.module.css';
import { cx } from './cx';

type Variant = 'primary' | 'secondary' | 'ghost';

function classes(variant: Variant, block: boolean, extra?: string): string {
  return cx(styles.button, styles[variant], block && styles.block, extra);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  block?: boolean;
}

/** Spielknopf mit Tiefe-Effekt (docs/02, Abschnitt 5). */
export function Button({
  variant = 'primary',
  block = false,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  // type ist immer gesetzt (Standard 'button'), damit Knöpfe in Formularen nichts absenden
  return <button type={type} className={classes(variant, block, className)} {...rest} />;
}

/** Navigation, die wie ein Knopf aussieht. */
export function LinkButton({
  href,
  variant = 'primary',
  block = false,
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  block?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={classes(variant, block, className)}>
      {children}
    </Link>
  );
}
