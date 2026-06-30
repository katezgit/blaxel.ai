import { CodeBlock } from "@repo/ui/components/code-block";
import NumberedStep from "./numbered-step";

const PREVIEW_CODE = `// Launch dev server on port 3000
const longRunningProcess = await sandbox.process.exec({
  command: "cd /blaxel/app && npm run dev -- --port 3000 &"
});

// Create public preview
const preview = await sandbox.previews.createIfNotExists({
  metadata: { name: "app-preview" },
  spec: {
    port: 3000,
    public: true,
    responseHeaders: {
      "Access-Control-Allow-Origin": "https://YOUR-DOMAIN",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, X-Blaxel-Workspace, X-Blaxel-Preview-Token, X-Blaxel-Authorization",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Expose-Headers": "Content-Length, X-Request-Id",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin",
    },
  },
});

// Get preview URL
const url = preview.spec?.url;
console.log("Preview URL:", { url });`;

export default function CreatePreviewStep() {
  return (
    <NumberedStep
      number={6}
      title="Create a preview"
      description={
        <>
          Expose a sandbox running process (such as a development server) on a{" "}
          <a
            href="https://docs.blaxel.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            public or private preview URL
          </a>
          . You can use your own custom domain name.
        </>
      }
    >
      <CodeBlock variant="block" language="typescript" code={PREVIEW_CODE} />
    </NumberedStep>
  );
}
