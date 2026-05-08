import { BaseCRUD, eq, type CRUDResult } from "./crud";
import { settings, type Settings, type NewSettings, type SettingsWithRelations } from "./schema";
import { db } from "./drizzle";

const GLOBAL_SETTINGS_ID = "global";

class SettingsCRUDClass extends BaseCRUD<typeof settings, Settings, NewSettings> {
  constructor() {
    super(settings);
  }

  /**
   * Get global settings
   */
  async getGlobal(): Promise<CRUDResult<SettingsWithRelations>> {
    try {
      let result = await db.query.settings.findFirst({
        where: eq(settings.id, GLOBAL_SETTINGS_ID),
        with: {
          logo: true,
          logoLight: true,
          logoDark: true,
          favicon: true,
          heroImage: true,
        }
      }) as SettingsWithRelations | undefined;

      // Create default settings if none exist
      if (!result) {
        await db
          .insert(settings)
          .values({
            id: GLOBAL_SETTINGS_ID,
            storeName: "My Store",
            storeEmail: "store@example.com",
            currency: "NGN",
            primaryColor: "oklch(0.623 0.214 259.815)",
            borderRadius: "0.75rem",
            heroTitle: "Your Trusted Retail",
            heroSubtitle: "Lania Stores",
            storeCaption: "Lania Stores",
            heroDescription: "From tiny toes to your beauty needs, we have it",
          });

        // Fetch again to get the full object with relations (as nulls)
        return this.getGlobal();
      }

      return { success: true, data: result };
    } catch (error) {
      console.error("[SettingsCRUD] getGlobal error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to get settings" };
    }
  }

  /**
   * Update global settings
   */
  async updateGlobal(data: Partial<NewSettings>): Promise<CRUDResult<SettingsWithRelations>> {
    try {
      await db
        .update(settings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(settings.id, GLOBAL_SETTINGS_ID));

      return this.getGlobal();
    } catch (error) {
      console.error("[SettingsCRUD] updateGlobal error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to update settings" };
    }
  }

  /**
   * Update store info
   */
  async updateStoreInfo(info: {
    storeName?: string;
    storeEmail?: string;
    storePhone?: string;
    storeAddress?: Settings["storeAddress"];
  }): Promise<CRUDResult<SettingsWithRelations>> {
    return this.updateGlobal(info);
  }

  /**
   * Update shipping rates
   */
  async updateShippingRates(rates: Settings["shippingRates"]): Promise<CRUDResult<SettingsWithRelations>> {
    return this.updateGlobal({ shippingRates: rates });
  }

  /**
   * Update social links
   */
  async updateSocialLinks(links: Settings["socialLinks"]): Promise<CRUDResult<SettingsWithRelations>> {
    return this.updateGlobal({ socialLinks: links });
  }

  /**
   * Toggle maintenance mode
   */
  async toggleMaintenanceMode(enabled: boolean): Promise<CRUDResult<SettingsWithRelations>> {
    return this.updateGlobal({ maintenanceMode: enabled });
  }

  /**
   * Update tax rate
   */
  async updateTaxRate(rate: string): Promise<CRUDResult<SettingsWithRelations>> {
    return this.updateGlobal({ taxRate: rate });
  }

  /**
   * Check if store is in maintenance mode
   */
  async isInMaintenance(): Promise<boolean> {
    try {
      const result = await this.getGlobal();
      return result.data?.maintenanceMode || false;
    } catch {
      return false;
    }
  }
}

export const SettingsCRUD = new SettingsCRUDClass();
