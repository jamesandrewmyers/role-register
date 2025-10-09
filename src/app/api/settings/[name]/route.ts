import { NextRequest, NextResponse } from "next/server";
import * as settingsService from "@/services/settingsService";
import { toDTO } from "@/dto/settings.dto";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const setting = settingsService.getSettingByName(name);

    if (!setting) {
      return NextResponse.json(
        { error: "Setting not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(toDTO(setting));
  } catch (error) {
    console.error("Error fetching setting:", error);
    return NextResponse.json(
      { error: "Failed to fetch setting" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const body = await request.json();
    const { value } = body;

    if (value === undefined) {
      return NextResponse.json(
        { error: "Value is required" },
        { status: 400 }
      );
    }

    const existingSetting = settingsService.getSettingByName(name);

    if (!existingSetting) {
      return NextResponse.json(
        { error: "Setting not found" },
        { status: 404 }
      );
    }

    const updatedSetting = settingsService.updateSetting(existingSetting.id, {
      value,
    });

    return NextResponse.json(toDTO(updatedSetting!));
  } catch (error) {
    console.error("Error updating setting:", error);
    return NextResponse.json(
      { error: "Failed to update setting" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const existingSetting = settingsService.getSettingByName(name);

    if (!existingSetting) {
      return NextResponse.json(
        { error: "Setting not found" },
        { status: 404 }
      );
    }

    settingsService.deleteSetting(existingSetting.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting setting:", error);
    return NextResponse.json(
      { error: "Failed to delete setting" },
      { status: 500 }
    );
  }
}
