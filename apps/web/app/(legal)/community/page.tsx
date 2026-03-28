export const metadata = { title: "Community Guidelines — Diiff" };

export default function CommunityPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1
        className="text-2xl font-bold text-white mb-2"
        style={{ fontFamily: "Playfair Display, serif" }}
      >
        Community Guidelines
      </h1>
      <p className="text-white/40 text-sm mb-8">What Diiff is and isn&apos;t for.</p>

      <div className="space-y-6 text-white/70 text-sm leading-relaxed">
        <section>
          <h2 className="text-white font-semibold mb-2">Who Diiff is for</h2>
          <p>
            Diiff is for people ages 16–25 in New York City who want to grow —
            physically, spiritually, and communally. This is not a general
            social network. It is a space with a purpose.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">What belongs here</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Faith reflections and scripture engagement</li>
            <li>Workout logs and movement milestones</li>
            <li>Honest questions about faith, wellness, and community</li>
            <li>Encouragement and accountability</li>
            <li>NYC-specific community connection</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">What does not belong</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Harassment, bullying, or targeted attacks on other users</li>
            <li>Hate speech, slurs, or content that demeans groups of people</li>
            <li>Sexual or adult content visible to minor users</li>
            <li>Content that glorifies or encourages self-harm</li>
            <li>Spam, promotional content, or unsolicited links</li>
            <li>Impersonating other people or organizations</li>
            <li>Content that violates any applicable law</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">Moderation</h2>
          <p>
            All posts go through review before becoming visible to the
            community. We use a combination of automated screening and human
            review. Decisions are not always instant — thank you for your
            patience.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">Crisis support</h2>
          <p>
            If you or someone you know is in crisis, please reach out to:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>988 Suicide & Crisis Lifeline — call or text 988</li>
            <li>Crisis Text Line — text HOME to 741741</li>
            <li>NYC Well — 1-888-NYC-WELL (1-888-692-9355)</li>
            <li>The Trevor Project (LGBTQ+ youth) — 1-866-488-7386</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-2">Reporting</h2>
          <p>
            To report content or a user, email support@diiff.app. We review
            all reports.
          </p>
        </section>
      </div>
    </div>
  );
}
