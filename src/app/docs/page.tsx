import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function DocsPage() {
  const filePath = path.join(process.cwd(), "ARCHITECTURE.md");
  let content = "";
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch (error) {
    content = "# Error\n\nCould not load ARCHITECTURE.md file. Make sure it exists in the root directory.";
  }

  return (
    <div className="min-h-screen bg-neutral-950 py-16 text-neutral-100">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="prose prose-invert prose-blue mx-auto lg:prose-lg">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
