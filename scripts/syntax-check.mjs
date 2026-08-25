// One-off syntax sanity check. Uses TypeScript's transpileModule (syntax
// only, no type resolution needed) so it works even without node_modules
// installed. Run with: node scripts/syntax-check.mjs
import ts from "typescript";
import { readFileSync } from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const files = execSync(
  `find "${root}" -type f \\( -name "*.ts" -o -name "*.tsx" \\) -not -path "*/node_modules/*" -not -path "*/.next/*"`
)
  .toString()
  .trim()
  .split("\n")
  .filter(Boolean);

let hasError = false;

for (const file of files) {
  const source = readFileSync(file, "utf8");
  const result = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.Preserve,
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2017
    },
    reportDiagnostics: true
  });

  const syntaxErrors = (result.diagnostics ?? []).filter(
    (d) => d.category === ts.DiagnosticCategory.Error
  );

  if (syntaxErrors.length > 0) {
    hasError = true;
    console.log(`\n❌ ${path.relative(root, file)}`);
    for (const d of syntaxErrors) {
      const msg = ts.flattenDiagnosticMessageText(d.messageText, "\n");
      if (d.file && d.start !== undefined) {
        const { line, character } = d.file.getLineAndCharacterOfPosition(d.start);
        console.log(`  ${line + 1}:${character + 1} ${msg}`);
      } else {
        console.log(`  ${msg}`);
      }
    }
  }
}

console.log(`\nChecked ${files.length} files.`);
if (hasError) {
  console.log("Syntax issues found ⬆️");
  process.exit(1);
} else {
  console.log("No syntax errors ✅");
}
