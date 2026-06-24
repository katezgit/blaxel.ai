import DomainSection from "./domain-section";
import SamlSection from "./saml-section";

interface LoginPolicyViewProps {
  /** User's email domain (derived from session email), used as a placeholder
   * suggestion in the add-domain input. Null when no `@` was present. */
  emailDomain: string | null;
}

export function LoginPolicyView({ emailDomain }: LoginPolicyViewProps) {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="typography-display font-semibold text-foreground">
          Login policy
        </h1>
        <p className="text-muted-foreground">
          Control how users authenticate to this account. Use SAML for
          enterprise identity providers, or verify your email domains to
          enforce specific login methods — no SAML setup required.
        </p>
      </header>

      <DomainSection emailDomain={emailDomain} />
      <SamlSection />
    </div>
  );
}
