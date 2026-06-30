/**
 * Generate a bcrypt hash from a password entered via stdin.
 * Usage: node generate-hash.mjs
 */
import bcrypt from "bcryptjs";
import * as readline from "node:readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stderr, // prompt goes to stderr so only the hash goes to stdout
});

rl.question("Enter your new admin password: ", async (password) => {
  if (!password || password.length < 12) {
    console.error("Error: Password must be at least 12 characters.");
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 10);
  // Print ONLY the hash to stdout (for piping to wrangler)
  process.stdout.write(hash + "\n");
  console.error("✅ Hash generated. Copy the line above.");
  rl.close();
});
