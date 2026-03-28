import {
  Html, Head, Body, Container, Section,
  Heading, Text, Hr, Preview,
} from "@react-email/components";

interface ModerationActionEmailProps {
  displayName: string;
  action: "warned" | "content_removed" | "suspended";
  reason?: string;
}

export function ModerationActionEmail({
  displayName,
  action,
  reason,
}: ModerationActionEmailProps) {
  const titles: Record<typeof action, string> = {
    warned: "A note about your recent post",
    content_removed: "Content removed from your account",
    suspended: "Your account has been suspended",
  };

  const messages: Record<typeof action, string> = {
    warned:
      "One of your recent posts was flagged by our moderation team. No action has been taken on your account, but please review our community guidelines.",
    content_removed:
      "One of your posts was removed because it did not meet our community guidelines. Your account remains active.",
    suspended:
      "Your account has been suspended due to repeated violations of our community guidelines. To appeal this decision, email support@diiff.app.",
  };

  return (
    <Html lang="en">
      <Head />
      <Preview>{titles[action]}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>Diiff</Heading>
          </Section>
          <Section style={content}>
            <Heading as="h2" style={h2}>{titles[action]}</Heading>
            <Text style={p}>Hi {displayName},</Text>
            <Text style={p}>{messages[action]}</Text>
            {reason && (
              <Section style={reasonBox}>
                <Text style={reasonLabel}>Reason noted:</Text>
                <Text style={reasonText}>{reason}</Text>
              </Section>
            )}
            <Text style={p}>
              If you have questions, reply to this email or contact
              support@diiff.app.
            </Text>
          </Section>
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>Diiff · NYC · support@diiff.app</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body = { backgroundColor: "#0a0012", fontFamily: "sans-serif" };
const container = { maxWidth: "560px", margin: "0 auto", padding: "32px 16px" };
const header = { textAlign: "center" as const, marginBottom: "32px" };
const logo = { color: "#FFD600", fontSize: "28px", margin: "0" };
const content = { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "16px", padding: "32px" };
const h2 = { color: "#ffffff", fontSize: "20px", marginTop: "0" };
const p = { color: "rgba(255,255,255,0.7)", fontSize: "14px", lineHeight: "1.6" };
const reasonBox = { backgroundColor: "rgba(255,255,255,0.06)", borderRadius: "8px", padding: "12px", margin: "16px 0" };
const reasonLabel = { color: "rgba(255,255,255,0.4)", fontSize: "11px", margin: "0 0 4px" };
const reasonText = { color: "rgba(255,255,255,0.7)", fontSize: "13px", margin: "0" };
const hr = { borderColor: "rgba(255,255,255,0.1)", margin: "24px 0" };
const footer = { textAlign: "center" as const };
const footerText = { color: "rgba(255,255,255,0.25)", fontSize: "11px" };
