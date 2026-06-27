export const metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for AiStack.",
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight mb-8">Privacy Policy</h1>

      <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <p className="text-sm">Last updated: April 26, 2026</p>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create an account, submit a tool for review, or contact us. This may include your name, email address, and any other information you choose to provide.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services, to process your submissions, and to communicate with you about updates, reviews, or support requests.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">3. Information Sharing</h2>
          <p>
            We do not sell your personal information. We may share your information with third-party service providers who assist us in operating our platform, subject to appropriate data protection agreements.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">4. Data Security</h2>
          <p>
            We implement reasonable security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">5. Your Rights</h2>
          <p>
            You may access, update, or delete your personal information at any time by contacting us or through your account settings.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">6. Contact</h2>
          <p>
            If you have questions about this Privacy Policy, please visit our <a href="/support" className="text-foreground underline">Support page</a> for contact information.
          </p>
        </section>
      </div>
    </div>
  );
}
