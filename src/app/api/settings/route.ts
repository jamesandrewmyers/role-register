import { NextRequest, NextResponse } from "next/server";
import * as settingsService from "@/services/settingsService";
import { toDTO, toDTOs } from "@/dto/settings.dto";
import type { SettingsId } from "@/domain/entities/settings";
import { randomUUID } from "crypto";

export async function GET() {
  try {
    const allSettings = settingsService.getAllSettings();
    return NextResponse.json(toDTOs(allSettings));
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, value } = body;

    if (!name || value === undefined) {
      return NextResponse.json(
        { error: "Name and value are required" },
        { status: 400 }
      );
    }

    const existingSetting = settingsService.getSettingByName(name);

    if (existingSetting) {
      const updated = settingsService.updateSetting(existingSetting.id, {
        value,
      });

      return NextResponse.json(toDTO(updated!));
    } else {
      const newSetting = settingsService.createSetting({
        id: randomUUID() as SettingsId,
        name,
        value,
        updatedAt: Math.floor(Date.now() / 1000),
      });

      return NextResponse.json(toDTO(newSetting), { status: 201 });
    }
  } catch (error) {
    console.error("Error saving setting:", error);
    return NextResponse.json(
      { error: "Failed to save setting" },
      { status: 500 }
    );
  }
}
