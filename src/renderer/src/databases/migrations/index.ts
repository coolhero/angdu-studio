import { chatDb } from "../ChatDatabase";

// ── Database Migration Framework ──
// Migrations are handled by Dexie's built-in version system.
// Each version increment defines schema changes and data transformations.
// Dexie runs migrations automatically on database open.

/**
 * Run maintenance tasks after database is ready.
 * - Orphan cleanup: blocks referencing non-existent messages
 * - Deduplication: duplicate message IDs within a topic
 */
export async function runDatabaseMaintenance(): Promise<void> {
	await cleanOrphanBlocks();
	await deduplicateMessages();
}

/**
 * Remove message blocks that reference non-existent messages.
 */
async function cleanOrphanBlocks(): Promise<void> {
	const allBlocks = await chatDb.messageBlocks.toArray();
	const messageIds = new Set(
		await chatDb.messages.toCollection().primaryKeys(),
	);

	const orphanBlockIds = allBlocks
		.filter((block) => !messageIds.has(block.messageId))
		.map((block) => block.id);

	if (orphanBlockIds.length > 0) {
		await chatDb.messageBlocks.bulkDelete(orphanBlockIds);
		console.info(
			`[DatabaseMaintenance] Cleaned ${orphanBlockIds.length} orphan blocks`,
		);
	}
}

/**
 * Deduplicate messages within topics (keep the most recent version by updatedAt or createdAt).
 */
async function deduplicateMessages(): Promise<void> {
	const allMessages = await chatDb.messages.toArray();
	const seen = new Map<string, string>(); // messageId → keep (latest)
	const toDelete: string[] = [];

	// Sort by createdAt descending so we keep the latest
	allMessages.sort((a, b) =>
		(b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt),
	);

	for (const msg of allMessages) {
		if (seen.has(msg.id)) {
			toDelete.push(msg.id);
		} else {
			seen.set(msg.id, msg.id);
		}
	}

	if (toDelete.length > 0) {
		await chatDb.messages.bulkDelete(toDelete);
		console.info(
			`[DatabaseMaintenance] Removed ${toDelete.length} duplicate messages`,
		);
	}
}
