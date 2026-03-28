import {
  Html, Head, Body, Container, Section,
  Heading, Text, Button, Hr, Preview,
} from "@react-email/components";

interface AgeUpgradeEmailProps {
  displayName: string;
}

export function AgeUpgradeEmail({ displayName }: AgeUpgradeEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Happy birthday, {displayName} — here&apos;s what&apos;s new on Diiff.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>Diiff</Heading>
            <Text style={tagline}>Move. Reflect. Connect.</Text>
          </Section>
          <Section style={content}>
            <Heading as="h2" style={h2}>Happy birthday, {displayName}.</Heading>
            <Text style={p}>
              You&apos;ve turned 18. Your account has been updated automatically.
            </Text>
            <Heading as="h3" style={h3}>What&apos;s new for you</Heading>
            <Section style={list}>
              <Text style={listItem}>✦ You can now create and join all room types</Text>
              <Text style={listItem}>✦ You can post to all-ages and adults-only audiences</Text>
              <Text style={listItem}>✦ Voice rooms — coming soon in Phase 2</Text>
            </Section>
            <Text style={p}>
              Everything else stays the same. The community, the workouts,
              the scripture — it&apos;s all still here.
            </Text>
            <Button href="https://diiff.app/feed" style={button}>Open Diiff</Button>
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
const tagline = { color: "rgba(255,255,255,0.4)", fontSize: "13px", margin: "4px 0 0" };
const content = { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "16px", padding: "32px" };
const h2 = { color: "#ffffff", fontSize: "22px", marginTop: "0" };
const h3 = { color: "#FFD600", fontSize: "14px", marginBottom: "8px" };
const p = { color: "rgba(255,255,255,0.7)", fontSize: "14px", lineHeight: "1.6" };
const list = { margin: "12px 0 20px" };
const listItem = { color: "rgba(255,255,255,0.7)", fontSize: "14px", margin: "6px 0" };
const button = {
  backgroundColor: "#FFD600", color: "#000000",
  padding: "14px 32px", borderRadius: "100px",
  fontWeight: "bold", fontSize: "16px",
  display: "block", textAlign: "center" as const, margin: "24px 0",
};
const hr = { borderColor: "rgba(255,255,255,0.1)", margin: "24px 0" };
const footer = { textAlign: "center" as const };
const footerText = { color: "rgba(255,255,255,0.25)", fontSize: "11px", margin: "4px 0" };
