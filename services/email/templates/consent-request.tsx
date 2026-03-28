import {
  Html, Head, Body, Container, Section,
  Heading, Text, Button, Hr, Preview,
} from "@react-email/components";

interface ConsentRequestEmailProps {
  minorDisplayName: string;
  consentUrl: string;
  expiresHours?: number;
}

export function ConsentRequestEmail({
  minorDisplayName,
  consentUrl,
  expiresHours = 24,
}: ConsentRequestEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>
        {minorDisplayName} wants to join Diiff — your approval is needed
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>Diiff</Heading>
            <Text style={tagline}>Move. Reflect. Connect.</Text>
          </Section>

          <Section style={content}>
            <Heading as="h2" style={h2}>
              Parental consent requested
            </Heading>

            <Text style={p}>
              <strong>{minorDisplayName}</strong> (your child or dependent) has
              created an account on Diiff and needs your approval before they
              can join.
            </Text>

            <Section style={infoBox}>
              <Heading as="h3" style={h3}>What is Diiff?</Heading>
              <Text style={p}>
                Diiff is a faith-centered wellness app for young people ages
                16–25 in New York City. It combines daily scripture, movement
                workouts, and community — with no algorithmic feed, no ads, and
                no direct messages at launch.
              </Text>
              <Heading as="h3" style={h3}>What data do we collect?</Heading>
              <Text style={p}>
                We collect your child&apos;s display name, city, and date of
                birth (used only to verify their age). We do not collect
                government ID, payment information, or precise location.
                Content your child posts is reviewed by our moderation team
                before it becomes visible to others.
              </Text>
              <Heading as="h3" style={h3}>How is your child protected?</Heading>
              <Text style={p}>
                Accounts for users 16–17 are restricted from adult-only
                content. Voice rooms (coming in a future update) will require
                an active moderator present whenever minors are in the room.
                You can request deletion of your child&apos;s account at any
                time by emailing support@diiff.app.
              </Text>
            </Section>

            <Button href={consentUrl} style={button}>
              I consent — activate account
            </Button>

            <Text style={small}>
              This link expires in {expiresHours} hours. If you do not
              recognize this request, you can safely ignore this email.
              {minorDisplayName}&apos;s account will remain inactive.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              Diiff · NYC · support@diiff.app
            </Text>
            <Text style={footerText}>
              To revoke consent or delete your child&apos;s account at any
              time, email support@diiff.app.
            </Text>
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
const h3 = { color: "#FFD600", fontSize: "14px", marginBottom: "4px" };
const p = { color: "rgba(255,255,255,0.7)", fontSize: "14px", lineHeight: "1.6" };
const infoBox = { backgroundColor: "rgba(255,255,255,0.06)", borderRadius: "12px", padding: "20px", margin: "24px 0" };
const button = {
  backgroundColor: "#FFD600",
  color: "#000000",
  padding: "14px 32px",
  borderRadius: "100px",
  fontWeight: "bold",
  fontSize: "16px",
  display: "block",
  textAlign: "center" as const,
  margin: "24px 0",
};
const small = { color: "rgba(255,255,255,0.35)", fontSize: "12px", lineHeight: "1.5" };
const hr = { borderColor: "rgba(255,255,255,0.1)", margin: "24px 0" };
const footer = { textAlign: "center" as const };
const footerText = { color: "rgba(255,255,255,0.25)", fontSize: "11px", margin: "4px 0" };
