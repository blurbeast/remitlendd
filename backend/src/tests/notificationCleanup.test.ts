import { notificationService } from "../services/notificationService.js";
import { query } from "../db/connection.js";
import { jest } from "@jest/globals";

// Helper to cast to jest.Mock
const asMock = (fn: any) => fn as jest.Mock;

describe("Notification Cleanup Strategy", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete notifications older than the retention threshold", async () => {
    const retentionDays = 90;
    
    // Mock the query result to simulate successful deletion of 2 rows
    (query as jest.Mock).mockResolvedValue({ rowCount: 2 });

    const deletedCount = await notificationService.deleteOldNotifications(retentionDays);

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM notifications"),
      [retentionDays]
    );
    expect(deletedCount).toBe(2);
  });

  it("should return 0 if no notifications are deleted", async () => {
    (query as jest.Mock).mockResolvedValue({ rowCount: 0 });

    const deletedCount = await notificationService.deleteOldNotifications(90);

    expect(deletedCount).toBe(0);
  });

  it("should handle database errors gracefully", async () => {
    (query as jest.Mock).mockRejectedValue(new Error("Database error"));

    const deletedCount = await notificationService.deleteOldNotifications(90);

    expect(deletedCount).toBe(0);
  });
});
