const test = require("node:test");
const assert = require("node:assert/strict");

const {
  releaseAssetUrl,
  targetFor,
} = require("../bin/aistack.js");

test("maps supported host platforms to release targets", () => {
  assert.equal(targetFor("darwin", "arm64"), "aarch64-apple-darwin");
  assert.equal(targetFor("darwin", "x64"), "x86_64-apple-darwin");
  assert.equal(targetFor("linux", "x64"), "x86_64-unknown-linux-gnu");
  assert.equal(targetFor("win32", "x64"), "x86_64-pc-windows-msvc");
});

test("rejects unsupported host combinations", () => {
  assert.throws(
    () => targetFor("freebsd", "arm64"),
    /Unsupported platform: freebsd-arm64/
  );
});

test("builds the release asset URL used by npx downloads", () => {
  assert.equal(
    releaseAssetUrl("0.3.1", "aarch64-apple-darwin"),
    "https://github.com/agrittiwari/aistack/releases/download/v0.3.1/aistack-aarch64-apple-darwin.tar.gz"
  );
});
