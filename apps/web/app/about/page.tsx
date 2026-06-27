export const metadata = {
  title: "About",
  description: "About AiStack — the definitive directory for AI tools and platforms.",
};

export default function AboutPage() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight mb-2">About AiStack</h1>
      <p className="text-muted-foreground text-sm mb-8">
        The definitive directory for AI tools and platforms.
      </p>

      <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">What is AiStack?</h2>
          <p>
            AiStack is a curated directory of AI tools, platforms, models, and infrastructure. We help developers, founders, and teams discover the right tools for their AI stack — from foundation models to observability, from orchestration to deployment.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Why we built this</h2>
          <p>
            The AI landscape is moving fast. New tools launch every week, and it is hard to keep track of what is real, what is useful, and what fits together. AiStack organizes the ecosystem into clear layers so you can see the full picture and make informed decisions.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">How it works</h2>
          <p>
            We organize tools into layers like Compute & Hardware, Foundation Models, Inference & Hosting, Orchestration, and more. Each entry is reviewed and verified by our team. You can browse by layer, build your own stack, and submit tools for inclusion.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Submit a tool</h2>
          <p>
            If you have built something worth sharing, we would love to hear about it. Visit our <a href="/submit" className="text-foreground underline">Submit page</a> to add your tool to the directory. All submissions are reviewed within 48 hours.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Get in touch</h2>
          <p>
            Questions, feedback, or partnership inquiries? Visit our <a href="/support" className="text-foreground underline">Support page</a> for all ways to reach us.
          </p>
        </section>
      </div>
    </div>
  );
}
