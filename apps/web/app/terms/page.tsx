export const metadata = {
  title: "Terms of Service",
  description: "Terms of service for AiStack.",
};

export default function TermsPage() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight mb-8">Terms of Service</h1>

      <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <p className="text-sm">Last updated: April 26, 2026</p>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using AiStack, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">2. Use of the Platform</h2>
          <p>
            AiStack provides a directory of AI tools, platforms, and related resources. You may browse, search, and submit entries. You agree not to misuse the platform or attempt to gain unauthorized access to any part of it.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">3. User Submissions</h2>
          <p>
            When you submit a tool or content to AiStack, you grant us a non-exclusive license to display and distribute that content on our platform. You are responsible for the accuracy of your submissions.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">4. Content Accuracy</h2>
          <p>
            While we strive to maintain accurate and up-to-date information, we do not guarantee the completeness or accuracy of any content on the platform. Entries are subject to review and may be edited or removed at our discretion.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">5. Limitation of Liability</h2>
          <p>
            AiStack is provided "as is" without warranties of any kind. We shall not be liable for any damages arising from your use of the platform or reliance on any information provided.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">6. Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. Continued use of the platform after changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">7. Contact</h2>
          <p>
            If you have questions about these Terms, please visit our <a href="/support" className="text-foreground underline">Support page</a> for contact information.
          </p>
        </section>
      </div>
    </div>
  );
}
