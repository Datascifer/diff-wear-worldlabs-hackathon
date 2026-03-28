export const metadata = { title: "Privacy Policy — Diiff" };

export default function PrivacyPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1
        className="text-2xl font-bold text-white mb-2"
        style={{ fontFamily: "Playfair Display, serif" }}
      >
        Privacy Policy
      </h1>
      <p className="text-white/40 text-sm mb-8">Last updated: September 2025. Pending legal review.</p>

      <div className="space-y-6 text-white/70 text-sm leading-relaxed">
        <section>
          <h2 className="text-white font-semibold mb-2">What we collect</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Display name and optional city</li>
            <li>Date of birth (used only to verify age; never shown publicly)</li>
            <li>Content you post (posts, comments)</li>
            <li>Authentication data via Google or Apple (we store only a user ID reference)</li>
            <li>Device push notification subscription token (if you opt in)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">What we do NOT collect</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Government ID or payment information</li>
            <li>Precise location or GPS data</li>
            <li>Audio or voice recordings (voice rooms not yet launched)</li>
            <li>Behavioral data for advertising purposes</li>
            <li>Data from users under age 16</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">Minor user protections (NY SAFE for Kids Act)</h2>
          <p>
            Users ages 16–17 require parental or guardian consent before account
            activation. Minor accounts are restricted from adult-only content.
            Feeds for minor users are chronological — no algorithmic ranking.
            We do not use minor user data for behavioral advertising.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">Third-party services</h2>
          <ul className="list-disc list-inside space-y-1">
            <li><strong className="text-white">Supabase</strong> — database and authentication hosting (US East)</li>
            <li><strong className="text-white">ElevenLabs</strong> — AI voice narration of pre-approved scripture text only</li>
            <li><strong className="text-white">Google Perspective API</strong> — text content moderation scoring</li>
            <li><strong className="text-white">Resend</strong> — transactional email (consent notifications, welcome emails)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">Data deletion</h2>
          <p>
            You may request deletion of your account and all associated data at
            any time by emailing support@diiff.app. For minor accounts, parents
            or guardians may also request deletion. We process deletion requests
            within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">Contact</h2>
          <p>
            <a href="mailto:support@diiff.app" className="text-yellow-400 underline">support@diiff.app</a>
          </p>
        </section>

        <p className="text-white/30 text-xs border-t border-white/10 pt-4">
          This Privacy Policy is a working draft pending legal review. Do not
          publish to production users until reviewed by counsel familiar with
          COPPA, NY SAFE for Kids Act, and applicable data protection law.
        </p>
      </div>
    </div>
  );
}
