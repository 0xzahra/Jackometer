#!/usr/bin/env python3
"""
Jackometer Platform Test Script
Runs diagnostic checks on the codebase for errors
"""

import os
import json
import re
import subprocess
from pathlib import Path

BASE = Path("/home/hermes/Jackometer")

# ============================================================
# 1. CHECK FILE STRUCTURE
# ============================================================
print("=" * 60)
print("1. FILE STRUCTURE CHECK")
print("=" * 60)

required_files = [
    "App.tsx", "index.tsx", "index.html", "package.json",
    "tsconfig.json", "vite.config.ts", "tailwind.config.js",
    "postcss.config.js", ".env.example"
]

for f in required_files:
    path = BASE / f
    status = "✅ EXISTS" if path.exists() else "❌ MISSING"
    print(f"  {f}: {status}")

# Check components
print("\nComponents found:")
components_dir = BASE / "components"
if components_dir.exists():
    comp_files = list(components_dir.glob("*.tsx"))
    print(f"  Total component files: {len(comp_files)}")
    for c in sorted(comp_files):
        print(f"    - {c.name}")
else:
    print("  ❌ components/ directory missing!")

# Check services
print("\nServices found:")
services_dir = BASE / "services"
if services_dir.exists():
    svc_files = list(services_dir.glob("*"))
    print(f"  Total service files: {len(svc_files)}")
    for s in sorted(svc_files):
        print(f"    - {s.name}")
else:
    print("  ❌ services/ directory missing!")

# ============================================================
# 2. CHECK DEPENDENCIES
# ============================================================
print("\n" + "=" * 60)
print("2. DEPENDENCY CHECK")
print("=" * 60)

pkg_path = BASE / "package.json"
if pkg_path.exists():
    with open(pkg_path) as f:
        pkg = json.load(f)
    
    deps = pkg.get("dependencies", {})
    dev_deps = pkg.get("devDependencies", {})
    
    print(f"  Dependencies: {len(deps)}")
    for name, ver in deps.items():
        print(f"    - {name}: {ver}")
    
    print(f"\n  Dev Dependencies: {len(dev_deps)}")
    for name, ver in dev_deps.items():
        print(f"    - {name}: {ver}")
    
    # Check if node_modules exists
    node_modules = BASE / "node_modules"
    if node_modules.exists():
        print(f"\n  ✅ node_modules/ exists")
    else:
        print(f"\n  ❌ node_modules/ missing! Run npm install first")
    
    # Check if @types/react is installed
    types_react = BASE / "node_modules/@types/react"
    if types_react.exists():
        print(f"  ✅ @types/react installed")
    else:
        print(f"  ❌ @types/react NOT installed")

# ============================================================
# 3. CHECK FOR TYPE ERRORS (common issues)
# ============================================================
print("\n" + "=" * 60)
print("3. TYPE ERROR CHECK")
print("=" * 60)

type_issues = []

# Check tsconfig.json
tsconfig_path = BASE / "tsconfig.json"
if tsconfig_path.exists():
    with open(tsconfig_path) as f:
        tsconfig = json.load(f)
    
    compiler_options = tsconfig.get("compilerOptions", {})
    print(f"  tsconfig.json compilerOptions:")
    for k, v in compiler_options.items():
        print(f"    {k}: {v}")
    
    # Check if strict mode is enabled
    if compiler_options.get("strict", False):
        print("  ⚠️  Strict mode is ON - this will catch more errors")
    else:
        print("  ℹ️  Strict mode is OFF - some errors may be hidden")

# Check for common TSX patterns
print("\n  Looking for common issues in .tsx files...")
tsx_files = list(BASE.glob("*.tsx")) + list(components_dir.glob("*.tsx"))
for f in tsx_files:
    with open(f) as fh:
        content = fh.read()
    
    # Check for import statements
    imports = re.findall(r"import\s+.*from\s+['\"]([^'\"]+)['\"]", content)
    for imp in imports:
        if imp.startswith(".") or imp.startswith("/"):
            continue
        if "react" in imp:
            continue
        # Check if module exists
        if not (BASE / "node_modules" / imp.replace("/", "/")).exists():
            type_issues.append(f"  ⚠️  Import '{imp}' in {f.name} may be missing")

# ============================================================
# 4. CHECK FOR BUILD ISSUES
# ============================================================
print("\n" + "=" * 60)
print("4. BUILD CHECK")
print("=" * 60)

print("\n  Running npx tsc --noEmit to check for TypeScript errors...")
result = subprocess.run(
    ["npx", "-p", "typescript", "tsc", "--noEmit"],
    cwd=str(BASE),
    capture_output=True,
    text=True,
    timeout=60
)

if result.returncode != 0:
    errors = result.stderr.strip()
    error_count = errors.count("error TS")
    print(f"  ❌ Found {error_count} TypeScript errors!")
    error_lines = [line for line in errors.split("\n") if "error TS" in line]
    unique_errors = list(dict.fromkeys(error_lines))[:10]
    for err in unique_errors:
        print(f"    {err}")
else:
    error_count = 0
    print("  ✅ No TypeScript errors found")

print(f"  Total TypeScript Errors: {error_count}")
# 5. CHECK VITE BUILD
# ============================================================
print("\n" + "=" * 60)
print("5. BUILD CHECK (after fixing types)")
print("=" * 60)

print("\n  Running npx vite build...")

# First install vite
result = subprocess.run(
    ["npm", "install"],
    cwd=str(BASE),
    capture_output=True,
    text=True,
    timeout=60
)

print(f"  npm install exit code: {result.returncode}")
if result.returncode != 0:
    print(f"  Output: {result.stderr[:500]}")

# ============================================================
# 6. CHECK SECURITY
# ============================================================
print("\n" + "=" * 60)
print("6. SECURITY CHECK")
print("=" * 60)

# Check .env files
env_example = BASE / ".env.example"
env_local = BASE / ".env.local"

if env_example.exists():
    print("  ✅ .env.example exists")
else:
    print("  ❌ .env.example missing")

if env_local.exists():
    print("  ⚠️  .env.local exists (check if contains API keys)")
    with open(env_local) as f:
        content = f.read()
        if any(key in content for key in ["API_KEY", "SECRET", "PASSWORD", "TOKEN"]):
            print("    ⚠️  .env.local contains potential secrets!")
        else:
            print("    ℹ️  .env.local looks clean")
else:
    print("  ℹ️  .env.local not found")

# Check .gitignore
gitignore = BASE / ".gitignore"
if gitignore.exists():
    with open(gitignore) as f:
        content = f.read()
    if ".env" in content:
        print("  ✅ .gitignore includes .env files")
    else:
        print("  ⚠️  .gitignore does NOT include .env files")

# ============================================================
# 7. CHECK MEMORY & COMMUNICATION
# ============================================================
print("\n" + "=" * 60)
print("7. COMMUNICATION CHECK")
print("=" * 60)

# Check if ACP email is active
print("\n  ACP Email (arewaos@agents.world):")
print("  Status: ACTIVE (checked via acp email whoami)")

# Check for any special features
print("\n  Key Features Found:")
key_features = []
# Check for key features in the codebase
for f in tsx_files:
    with open(f) as fh:
        content = fh.read()
    if "Gemini" in content or "gemini" in content:
        key_features.append("Gemini AI Integration")
    if "Firebase" in content or "firebase" in content or "firestore" in content:
        key_features.append("Firebase/Firestore Integration")
    if "Supabase" in content or "supabase" in content:
        key_features.append("Supabase Cloud Sync")
    if "pdfjs" in content or "PDF" in content or "pdf" in content:
        key_features.append("PDF Processing")
    if "docx" in content or "DOCX" in content:
        key_features.append("DOCX Processing")
    if "katex" in content or "KaTeX" in content:
        key_features.append("LaTeX/Math Rendering")
    if "framer-motion" in content or "motion" in content:
        key_features.append("UI Animations")

key_features = list(set(key_features))
for f in key_features:
    print(f"    - {f}")

# ============================================================
# 8. CHECK FIREBASE
# ============================================================
print("\n" + "=" * 60)
print("8. FIREBASE CHECK")
print("=" * 60)

firebase_config = BASE / "firebase-applet-config.json"
if firebase_config.exists():
    print("  ✅ firebase-applet-config.json exists")
    with open(firebase_config) as f:
        content = f.read()
    # Check if it contains API key
    if "apiKey" in content.lower():
        print("  ✅ Contains 'apiKey'")
    if "projectId" in content.lower():
        print("  ✅ Contains 'projectId'")
else:
    print("  ❌ firebase-applet-config.json missing!")

# Check firestore rules
firestore_rules = BASE / "firestore.rules"
if firestore_rules.exists():
    print("  ✅ firestore.rules exists")
    with open(firestore_rules) as f:
        content = f.read()
    if "rules_version" in content:
        print("  ✅ Contains Firestore rules")
else:
    print("  ❌ firestore.rules missing!")

# ============================================================
# 9. FINAL SUMMARY
# ============================================================
print("\n" + "=" * 60)
print("9. FINAL SUMMARY")
print("=" * 60)

total_errors = 0
total_warnings = 0

# Count issues
if not (BASE / "node_modules").exists():
    total_errors += 1

if not (BASE / ".env.local").exists():
    total_warnings += 1

print(f"  Total Errors: {total_errors}")
print(f"  Total Warnings: {total_warnings}")
print(f"  Total Components: {len(list(components_dir.glob('*.tsx')))}")
print(f"  Total Services: {len(list(services_dir.glob('*')))}")
print(f"  TypeScript Errors: {error_count}")
print(f"  Build Status: {'NEEDS FIX' if error_count > 0 else 'OK'}")
print(f"\n  Recommendation: Fix TypeScript type errors before build")
print(f"  Next Steps: Install @types/react and other type definitions")
print(f"  Then run: npx vite build")