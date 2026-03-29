import { jest } from "@jest/globals";

jest.mock("../db/connection.js");
import { query } from "../db/connection.js";
import { notificationService } from "../services/notificationService.js";

const mockedQuery = query as jest.MockedFunction<typeof query>;

describe("Notification Cleanup Strategy", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete notifications older than the retention threshold", async () => {
    const retentionDays = 90;
    
    // Mock the query result to simulate successful deletion of 2 rows
    mockedQuery.mockResolvedValue({ rowCount: 2 } as any);

    const deletedCount = await notificationService.deleteOldNotifications(retentionDays);

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM notifications"),
      [retentionDays]
    );
    expect(deletedCount).toBe(2);
  });

  it("should return 0 if no notifications are deleted", async () => {
    mockedQuery.mockResolvedValue({ rowCount: 0 } as any);

    const deletedCount = await notificationService.deleteOldNotifications(90);

    expect(deletedCount).toBe(0);
  });

  it("should handle database errors gracefully", async () => {
    mockedQuery.mockRejectedValue(new Error("Database error") as never);

    const deletedCount = await notificationService.deleteOldNotifications(90);

    expect(deletedCount).toBe(0);
  });
});
