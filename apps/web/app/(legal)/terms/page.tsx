export const metadata = { title: "Terms of Service — Diiff" };

export default function TermsPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1
        className="text-2xl font-bold text-white mb-2"
        style={{ fontFamily: "Playfair Display, serif" }}
      >
        Terms of Service
      </h1>
      <p className="text-white/40 text-sm mb-8">Last updated: September 2025. Pending legal review.</p>

      <div className="space-y-6 text-white/70 text-sm leading-relaxed">
        <section>
          <h2 className="text-white font-semibold mb-2">1. About Diiff</h2>
          <p>
            Diiff is a faith-centered wellness platform for users ages 16–25 in
            New York City. By creating an account, you agree to these Terms of
            Service.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">2. Eligibility</h2>
          <p>
            You must be between 16 and 25 years old to create an account. Users
            who are 16 or 17 require verifiable parental or guardian consent
            before their account is activated. We verify your age via date of
            birth at registration.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">3. Your Content</h2>
          <p>
            You retain ownership of content you post. By posting, you grant
            Diiff a non-exclusive license to display your content to other
            users on the platform. All posts go through moderation review
            before becoming visible to others.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">4. Community Standards</h2>
          <p>
            You agree not to post content that is harmful, harassing,
            sexually explicit, threatening, or in violation of our Community
            Guidelines. We reserve the right to remove content and suspend
            accounts that violate these standards.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">5. AI Features</h2>
          <p>
            Diiff uses ElevenLabs AI voice technology to narrate daily scripture
            passages. This narration uses pre-approved text only — your content
            is never sent to voice synthesis. We use Google Perspective API to
            help moderate text content.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">6. Account Termination</h2>
          <p>
            You may delete your account at any time by emailing
            support@diiff.app. We may suspend or ban accounts that violate
            these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">7. Contact</h2>
          <p>
            For questions: <a href="mailto:support@diiff.app" className="text-yellow-400 underline">support@diiff.app</a>
          </p>
        </section>

        <p className="text-white/30 text-xs border-t border-white/10 pt-4">
          These Terms are a working draft pending review by legal counsel
          experienced in NY SAFE for Kids Act compliance and COPPA. Do not
          publish to production users until reviewed.
        </p>
      </div>
    </div>
  );
}
