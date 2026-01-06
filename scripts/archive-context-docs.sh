#!/bin/bash

# Script to archive context/notes/temporary documentation files
# This keeps only essential documentation in the repo

ARCHIVE_DIR="../pangea-docs-archive"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$REPO_ROOT"

# Create archive directory structure
mkdir -p "$ARCHIVE_DIR/docs"
mkdir -p "$ARCHIVE_DIR/scripts"

echo "📦 Archiving context documentation files..."

# Archive context/notes files from docs/
FILES_TO_ARCHIVE=(
  "docs/MESSAGE_FOR_RISHAV.md"
  "docs/EXPLAINING_CHANGES_TO_RISHAV.md"
  "docs/RISHAV_AVATAR_WALLET_SETUP_GUIDE.md"
  "docs/RISHAV_COMPLETE_GUIDE.md"
  "docs/RISHAV_DATABASE_ACCESS.md"
  "docs/RISHAV_SWAGGER_INTEGRATION_SUMMARY.md"
  "docs/TODAYS_TASKS_COMPLETE.md"
  "docs/IMPLEMENTATION_RECAP_2025_01_04.md"
  "docs/IMPLEMENTATION_ASSESSMENT.md"
  "docs/PROJECT_STATUS_SUMMARY.md"
  "docs/TESTING_STATUS.md"
  "docs/BUILD_TEST_RESULTS.md"
  "docs/AGENT5_TRANSACTION_STATUS_IMPLEMENTATION.md"
  "docs/PAYMENT_TOKEN_BALANCE_CHANGES.md"
  "docs/PAYMENT_TOKEN_BALANCE_IMPLEMENTATION.md"
  "docs/OASIS_API_TRANSACTION_BY_HASH_IMPLEMENTATION.md"
  "docs/OASIS_API_TRANSACTION_BY_HASH_ENDPOINT_BRIEF.md"
  "docs/OASIS_INTEGRATION_ANALYSIS.md"
  "docs/OASIS_SENDTOKEN_EXPLANATION.md"
  "docs/DTO_COVERAGE_SUMMARY.md"
  "docs/DTO_OASIS_DOCUMENTATION_GUIDE.md"
  "docs/FILTER_DTO_FIXES.md"
  "docs/SWAGGER_DOCUMENTATION_COMPLETE.md"
  "docs/SWAGGER_OPENAPI_INTEGRATION.md"
  "docs/HOW_TO_ACCESS_SWAGGER_DOCS.md"
  "docs/EMAIL_VERIFICATION_BYPASS_ARCHITECTURE.md"
  "docs/EMAIL_VERIFICATION_BYPASS_QUICK_REFERENCE.md"
  "docs/EMAIL_VERIFICATION_BYPASS_REVIEW.md"
  "docs/NEON_CONNECTION_CHECK.md"
  "docs/NEON_DB_STATUS.md"
  "docs/NEON_MCP_SETUP.md"
  "docs/NEON_MIGRATION_AND_SEEDING_SUMMARY.md"
  "docs/MCP_CONFIGURATION_COMPLETE.md"
  "docs/MCP_SIMPLE_EXPLANATION.md"
  "docs/MCP_TROUBLESHOOTING.md"
  "docs/HOLONIC_DAPP_CREATION_VIA_MCP.md"
  "docs/UNIFIED_OASIS_OPENSERV_MCP_USECASES.md"
  "docs/ENDPOINT_IMPLEMENTATION_PLAN.md"
  "docs/STUB_IMPLEMENTATION_PLAN.md"
  "docs/KEY_AUTH_FILES.md"
  "docs/GITHUB_ACTIONS_FIX.md"
  "docs/BACKEND_BETTER_AUTH_READY.md"
  "docs/AUTHENTICATION_APPROACHES.md"
  "docs/BETTER_AUTH_INTEGRATION_GUIDE.md"
  "docs/FRONTEND_BACKEND_CONNECTION_FLOW.md"
  "docs/USER_REGISTRATION_AND_AVATAR_LINKING_FLOW.md"
  "docs/TESTING_USER_REGISTRATION_FLOW.md"
  "docs/WALLET_TESTING_GUIDE.md"
  "docs/MANUAL_TESTING_GUIDE.md"
  "docs/ASSET_SEEDING_GUIDE.md"
  "docs/REMOTE_OASIS_API_SETUP.md"
  "docs/ARCHITECTURE_DIAGRAM.md"
  "docs/DOCUMENTATION_INDEX.md"
  "docs/openapi/OASIS_API_ACCESS.md"
  "scripts/QUICK_START_TESTING.md"
  "scripts/README_TESTING.md"
  "BUILD_TEST_RESULTS.md"
)

ARCHIVED_COUNT=0
NOT_FOUND_COUNT=0

for file in "${FILES_TO_ARCHIVE[@]}"; do
  if [ -f "$file" ]; then
    # Preserve directory structure in archive
    dir=$(dirname "$file")
    mkdir -p "$ARCHIVE_DIR/$dir"
    mv "$file" "$ARCHIVE_DIR/$file"
    echo "  ✓ Archived: $file"
    ((ARCHIVED_COUNT++))
  else
    echo "  ⚠ Not found: $file"
    ((NOT_FOUND_COUNT++))
  fi
done

echo ""
echo "✅ Archive complete!"
echo "   Archived: $ARCHIVED_COUNT files"
echo "   Not found: $NOT_FOUND_COUNT files"
echo "   Archive location: $ARCHIVE_DIR"
echo ""
echo "📝 Essential docs kept in repo:"
echo "   - README.md"
echo "   - docs/README.md"
echo "   - docs/getting-started.md"
echo "   - docs/api-reference.md"
echo "   - docs/api-endpoints.md"
echo "   - docs/architecture-overview.md"
echo "   - docs/database-schema.md"
echo "   - docs/frontend-integration.md"
echo "   - docs/deployment-railway.md"
echo "   - docs/decommission-railway-postgres.md"
echo "   - docs/contracts-spec.md"
echo "   - docs/CHANGELOG.md"
echo "   - docs/openapi/*.yaml (OpenAPI specs)"
echo "   - docs/openapi/README.md"
echo ""
echo "💡 To restore a file: cp $ARCHIVE_DIR/path/to/file.md docs/"

