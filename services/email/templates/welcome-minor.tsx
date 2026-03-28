import {
  Html, Head, Body, Container, Section,
  Heading, Text, Button, Hr, Preview,
} from "@react-email/components";

interface WelcomeMinorEmailProps {
  displayName: string;
}

export function WelcomeMinorEmail({ displayName }: WelcomeMinorEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Welcome to Diiff, {displayName} — you&apos;re in.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>Diiff</Heading>
            <Text style={tagline}>Move. Reflect. Connect.</Text>
          </Section>
          <Section style={content}>
            <Heading as="h2" style={h2}>You&apos;re in, {displayName}.</Heading>
            <Text style={p}>
              Your parent has approved your account. Diiff is ready for you.
            </Text>
            <Section style={list}>
              <Text style={listItem}>📖 A new scripture every morning</Text>
              <Text style={listItem}>🏃 Faith-tagged workouts across 4 types</Text>
              <Text style={listItem}>🔥 Streaks to keep you consistent</Text>
              <Text style={listItem}>🌍 A community that moves with purpose</Text>
            </Section>
            <Button href="https://diiff.app/feed" style={button}>Open Diiff</Button>
            <Text style={small}>
              Questions? Email us at support@diiff.app. We actually respond.
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
const tagline = { color: "rgba(255,255,255,0.4)", fontSize: "13px", margin: "4px 0 0" };
const content = { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "16px", padding: "32px" };
const h2 = { color: "#ffffff", fontSize: "22px", marginTop: "0" };
const p = { color: "rgba(255,255,255,0.7)", fontSize: "14px", lineHeight: "1.6" };
const list = { margin: "20px 0" };
const listItem = { color: "rgba(255,255,255,0.7)", fontSize: "14px", margin: "8px 0" };
const button = {
  backgroundColor: "#FFD600", color: "#000000",
  padding: "14px 32px", borderRadius: "100px",
  fontWeight: "bold", fontSize: "16px",
  display: "block", textAlign: "center" as const, margin: "24px 0",
};
const small = { color: "rgba(255,255,255,0.35)", fontSize: "12px" };
const hr = { borderColor: "rgba(255,255,255,0.1)", margin: "24px 0" };
const footer = { textAlign: "center" as const };
const footerText = { color: "rgba(255,255,255,0.25)", fontSize: "11px", margin: "4px 0" };
