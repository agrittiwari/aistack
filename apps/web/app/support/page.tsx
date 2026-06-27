import { Card, CardContent } from "@/components/ui/card";
import { Mail, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Support",
  description: "Get in touch with the AiStack team.",
};

export default function SupportPage() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight mb-2">Support</h1>
      <p className="text-muted-foreground text-sm mb-8">
        Have a question, feedback, or need help? Reach out to us through any of the channels below.
      </p>

      <div className="grid gap-4">
        <Card className="border-border/60">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold mb-3">Email</h3>
            <a
              href="mailto:agrit1408@gmail.com"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="w-4 h-4" />
              agrit1408@gmail.com
            </a>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold mb-3">Social</h3>
            <div className="flex flex-col gap-2">
              <a
                href="https://www.x.com/agrit_tiwari"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Reach out on X
                <ExternalLink className="w-3 h-3 ml-auto text-muted-foreground" />
              </a>
              <a
                href="https://www.linkedin.com/in/agrittiwari"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
                <ExternalLink className="w-3 h-3 ml-auto text-muted-foreground" />
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold mb-2">Submit a Tool</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Want to add your tool to the directory? Use our submission form.
            </p>
            <a
              href="/submit"
              className="inline-flex items-center gap-2 text-sm text-foreground hover:underline"
            >
              Go to Submit
              <ExternalLink className="w-3 h-3" />
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
